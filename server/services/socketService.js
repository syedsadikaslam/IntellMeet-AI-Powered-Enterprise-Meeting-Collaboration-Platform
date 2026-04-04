const redis = require('../utils/redisClient');

const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-meeting', async ({ meetingId, userId, userName }) => {
      socket.join(meetingId);
      console.log(`${userName} joined meeting: ${meetingId}`);

      // Store participant in Redis for fast access
      const participant = JSON.stringify({ userId, userName, socketId: socket.id });
      await redis.sadd(`meeting:${meetingId}:participants`, participant);

      // Notify others in the meeting
      socket.to(meetingId).emit('user-joined', { userId, userName, socketId: socket.id });

      // Send the current list of participants to the new user
      const participants = await redis.smembers(`meeting:${meetingId}:participants`);
      socket.emit('all-participants', participants.map(p => JSON.parse(p)));
    });

    // WebRTC Signaling
    socket.on('signal', ({ to, signal, from }) => {
      io.to(to).emit('signal', { signal, from });
    });

    socket.on('leave-meeting', async ({ meetingId, userId }) => {
      socket.leave(meetingId);
      console.log(`User ${userId} left meeting: ${meetingId}`);

      // Remove participant from Redis
      const participants = await redis.smembers(`meeting:${meetingId}:participants`);
      const participantToRemove = participants.find(p => JSON.parse(p).userId === userId);
      if (participantToRemove) {
        await redis.srem(`meeting:${meetingId}:participants`, participantToRemove);
      }

      socket.to(meetingId).emit('user-left', { userId });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Logic to handle unexpected disconnects (cleanup Redis) can be added here
    });
  });
};

module.exports = initSocket;

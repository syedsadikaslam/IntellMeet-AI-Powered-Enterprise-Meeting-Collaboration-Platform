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

      // Broadcast join notification
      io.to(meetingId).emit('notification', {
        type: 'info',
        message: `${userName} has joined the meeting.`
      });
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
      
      // Broadcast system notification
      io.to(meetingId).emit('notification', { 
        type: 'info', 
        message: `A user has left the meeting.` 
      });
    });

    // Chat functionality (Day 6)
    socket.on('send-message', ({ meetingId, message, senderId, senderName }) => {
      const chatMessage = {
        id: Date.now().toString(),
        text: message,
        senderId,
        senderName,
        timestamp: new Date().toISOString()
      };
      
      // Broadcast to everyone in the room (including sender if needed, or just others)
      // Usually broadcast to all so sender sees their message confirmed
      io.to(meetingId).emit('receive-message', chatMessage);
    });

    socket.on('typing', ({ meetingId, userId, userName }) => {
      socket.to(meetingId).emit('user-typing', { userId, userName });
    });

    socket.on('stop-typing', ({ meetingId, userId }) => {
      socket.to(meetingId).emit('user-stop-typing', { userId });
    });

    socket.on('toggle-audio', ({ meetingId, userId, isMicOn }) => {
      socket.to(meetingId).emit('user-toggle-audio', { userId, isMicOn });
    });

    socket.on('toggle-video', ({ meetingId, userId, isVideoOn }) => {
      socket.to(meetingId).emit('user-toggle-video', { userId, isVideoOn });
    });

    // Admin Controls
    socket.on('mute-participant', async ({ meetingId, targetUserId }) => {
      const participants = await redis.smembers(`meeting:${meetingId}:participants`);
      const target = participants.map(p => JSON.parse(p)).find(p => p.userId === targetUserId);
      if (target) {
        io.to(target.socketId).emit('force-mute');
        io.to(meetingId).emit('notification', {
          type: 'warning',
          message: `${target.userName} was muted by the admin.`
        });
      }
    });

    socket.on('remove-participant', async ({ meetingId, targetUserId }) => {
      const participants = await redis.smembers(`meeting:${meetingId}:participants`);
      const target = participants.map(p => JSON.parse(p)).find(p => p.userId === targetUserId);
      if (target) {
        io.to(target.socketId).emit('force-remove');
        io.to(meetingId).emit('notification', {
          type: 'error',
          message: `${target.userName} was removed by the admin.`
        });
        
        // Cleanup Redis for this user
        const participantToRemove = participants.find(p => JSON.parse(p).userId === targetUserId);
        if (participantToRemove) {
          await redis.srem(`meeting:${meetingId}:participants`, participantToRemove);
        }
        socket.to(meetingId).emit('user-left', { userId: targetUserId });
      }
    });

    socket.on('end-meeting', ({ meetingId }) => {
      io.to(meetingId).emit('meeting-ended');
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Logic to handle unexpected disconnects (cleanup Redis) can be added here
    });
  });
};

module.exports = initSocket;

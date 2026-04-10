const redis = require('../utils/redisClient');
const { transcribeAudio, generateMeetingIntelligence } = require('./aiService');
const Meeting = require('../models/Meeting');
const Message = require('../models/Message');

// Tracking active metrics
let activeConnections = new Set();
let activeMeetingRooms = new Set();

const initSocket = (io) => {
  const broadcastStats = () => {
    io.emit('stats-update', {
      onlineUsers: activeConnections.size,
      activeRooms: activeMeetingRooms.size,
      timestamp: new Date().toISOString()
    });
  };

  io.on('connection', (socket) => {
    activeConnections.add(socket.id);
    broadcastStats();

    console.log('User connected:', socket.id);

    // Join Team Room for Chat
    socket.on('join-team', (teamId) => {
      socket.join(`team:${teamId}`);
      console.log(`User ${socket.id} joined team room: ${teamId}`);
    });

    socket.on('join-meeting', async ({ meetingId, userId, userName }) => {
      socket.join(meetingId);
      activeMeetingRooms.add(meetingId);
      broadcastStats();

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

      const remaining = await redis.smembers(`meeting:${meetingId}:participants`);
      if (remaining.length === 0) {
        activeMeetingRooms.delete(meetingId);
        broadcastStats();
      }

      socket.to(meetingId).emit('user-left', { userId });
      
      // Broadcast system notification
      io.to(meetingId).emit('notification', { 
        type: 'info', 
        message: `A user has left the meeting.` 
      });
    });

    // Chat functionality (Meeting-specific)
    socket.on('send-message', ({ meetingId, message, senderId, senderName }) => {
      const chatMessage = {
        id: Date.now().toString(),
        text: message,
        senderId,
        senderName,
        timestamp: new Date().toISOString()
      };
      io.to(meetingId).emit('receive-message', chatMessage);
    });

    // Team Chat functionality (Day 19)
    socket.on('send-team-message', async (data) => {
      const { teamId, message } = data;
      // The message is expected to be saved via HTTP, but we broadcast via Socket
      io.to(`team:${teamId}`).emit('receive-team-message', message);
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

    socket.on('end-meeting', async ({ meetingId }) => {
      console.log(`Meeting ${meetingId} ended by host.`);
      
      try {
        const fullTranscript = await redis.get(`meeting:${meetingId}:transcript`);
        
        if (fullTranscript) {
          const intelligence = await generateMeetingIntelligence(fullTranscript);
          
          if (intelligence) {
            await Meeting.findOneAndUpdate(
              { meetingCode: meetingId },
              { 
                transcript: fullTranscript,
                summary: intelligence.summary,
                actionItems: intelligence.actionItems,
                endTime: new Date(),
                isLive: false
              }
            );
          }
        }
        
        io.to(meetingId).emit('meeting-ended');
        activeMeetingRooms.delete(meetingId);
        broadcastStats();
        await redis.del(`meeting:${meetingId}:transcript`);
        await redis.del(`meeting:${meetingId}:participants`);

      } catch (error) {
        console.error('[SOCKET_SERVICE] End meeting error:', error.message);
      }
    });
    
    socket.on('raise-hand', ({ meetingId, userId }) => {
      io.to(meetingId).emit('user-raised-hand', { userId });
    });

    socket.on('ask-ai', async ({ meetingId, query }) => {
      try {
        const transcript = await redis.get(`meeting:${meetingId}:transcript`);
        const { getAIResponse } = require('./aiService');
        const response = await getAIResponse(query, transcript);
        socket.emit('ai-answer', { text: response, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error('[SOCKET_SERVICE] AI Chat error:', error.message);
        socket.emit('ai-answer', { text: "Error fetching AI response.", timestamp: new Date().toISOString() });
      }
    });

    socket.on('audio-stream', async ({ meetingId, audioBlob }) => {

      const buffer = Buffer.from(audioBlob);
      const text = await transcribeAudio(buffer, meetingId);
      
      if (text && text.trim()) {
        const transcriptChunk = {
          userId: socket.id,
          userName: socket.userName || 'Someone',
          text: text.trim(),
          timestamp: new Date().toISOString()
        };
        
        io.to(meetingId).emit('transcript-update', transcriptChunk);
        await redis.append(`meeting:${meetingId}:transcript`, ` ${text.trim()}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      activeConnections.delete(socket.id);
      broadcastStats();
    });
  });
};

module.exports = initSocket;

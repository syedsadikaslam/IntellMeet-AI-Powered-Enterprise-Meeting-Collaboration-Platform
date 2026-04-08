require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const meetingRoutes = require('./routes/meetingRoutes');

const http = require('http');
const { Server } = require('socket.io');
const initSocket = require('./services/socketService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Initialize Socket.io service
initSocket(io);

// Security and Utility Middleware (MUST be before routes)
app.use(helmet());
app.use(cors());
app.use(express.json());

// Auth rate limiting specifically to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingRoutes);

app.get('/', (req, res) => {
  res.send('IntellMeet API is running...');
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('SERVER_ERROR:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/intellmeet';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connection established');
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  });

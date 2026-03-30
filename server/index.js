require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');

const app = express();

// Set security HTTP headers
app.use(helmet());
app.use(cors());

// Auth rate limiting specifically to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth', authLimiter);

// Parse JSON payload
app.use(express.json());

// Route Mounts
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('IntellMeet API is running...');
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/intellmeet';

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connection established');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  });

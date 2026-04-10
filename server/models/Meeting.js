const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a meeting title'],
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    description: {
      type: String,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    isLive: {
      type: Boolean,
      default: false,
    },
    meetingCode: {
      type: String,
      required: true,
      unique: true,
    },
    transcript: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    actionItems: [
      {
        task: String,
        suggestedAssignee: String,
        status: {
          type: String,
          enum: ['pending', 'completed'],
          default: 'pending',
        },
      },
    ],
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'mixed'],
      default: 'neutral',
    },
    highlights: [String],
  },
  { timestamps: true }
);

const Meeting = mongoose.model('Meeting', meetingSchema);
module.exports = Meeting;

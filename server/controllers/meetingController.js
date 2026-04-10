const Meeting = require('../models/Meeting');
const { v4: uuidv4 } = require('uuid');

// @desc    Create a new meeting
// @route   POST /api/meetings
// @access  Private
const createMeeting = async (req, res) => {
  try {
    const { title, description, startTime } = req.body;
    const meetingCode = uuidv4().split('-')[0]; // Generate short meeting code

    const meeting = await Meeting.create({
      title,
      description,
      startTime,
      host: req.user._id,
      meetingCode,
    });

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all meetings
// @route   GET /api/meetings
// @access  Private
const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find({ host: req.user._id }).populate('participants', 'name email avatar');
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get meeting by code
// @route   GET /api/meetings/:code
// @access  Private
const getMeetingByCode = async (req, res) => {
  try {
    const meeting = await Meeting.findOne({ meetingCode: req.params.code }).populate('host', 'name email avatar');
    if (meeting) {
      res.json(meeting);
    } else {
      res.status(404).json({ message: 'Meeting not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update meeting
// @route   PUT /api/meetings/:id
// @access  Private
const updateMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (meeting) {
      if (meeting.host.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to update this meeting' });
      }

      meeting.title = req.body.title || meeting.title;
      meeting.description = req.body.description || meeting.description;
      meeting.startTime = req.body.startTime || meeting.startTime;
      meeting.isLive = req.body.isLive !== undefined ? req.body.isLive : meeting.isLive;

      const updatedMeeting = await meeting.save();
      res.json(updatedMeeting);
    } else {
      res.status(404).json({ message: 'Meeting not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
// @access  Private
const deleteMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (meeting) {
      if (meeting.host.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this meeting' });
      }

      await meeting.deleteOne();
      res.json({ message: 'Meeting removed' });
    } else {
      res.status(404).json({ message: 'Meeting not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Analyze meeting transcript with AI
// @route   POST /api/meetings/:id/analyze
// @access  Private
const analyzeMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (!meeting.transcript) {
      return res.status(400).json({ message: 'No transcript available to analyze' });
    }

    // MOCK AI PROCESSING
    // In a real app, you would integrate with an AI service like Gemini/OpenAI
    
    const mockSummary = "The session focused on synchronized real-time communication and system performance metrics. The team reviewed the integration of Socket.io and Recharts for live dashboard updates. Key priorities for the next cycle include enhancing UI responsiveness and implementing automated reporting features.";
    
    const mockActionItems = [
      { task: "Optimize chart rendering performance", suggestedAssignee: "Frontend Team", status: "pending" },
      { task: "Implement PDF export functionality", suggestedAssignee: "Backend Team", status: "pending" },
      { task: "Conduct user testing on chat interface", suggestedAssignee: "QA Team", status: "pending" }
    ];

    const mockHighlights = [
      "Successful integration of real-time socket events",
      "Drafted plan for automated intelligence reports",
      "Confirmed dashboard layout for mobile devices"
    ];

    const mockSentiment = 'positive';

    meeting.summary = mockSummary;
    meeting.actionItems = mockActionItems;
    meeting.highlights = mockHighlights;
    meeting.sentiment = mockSentiment;

    await meeting.save();

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingByCode,
  updateMeeting,
  deleteMeeting,
  analyzeMeeting,
};

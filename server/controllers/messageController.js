const Message = require('../models/Message');

// @desc    Send a team message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { teamId, content, type } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await Message.create({
      sender: req.user._id,
      team: teamId,
      content,
      type: type || 'text'
    });

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get messages for a team
// @route   GET /api/messages/:teamId
// @access  Private
const getTeamMessages = async (req, res) => {
  try {
    const messages = await Message.find({ team: req.params.teamId })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getTeamMessages,
};

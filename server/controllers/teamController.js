const Team = require('../models/Team');

// @desc    Get user teams
// @route   GET /api/teams
// @access  Private
const getMyTeams = async (req, res) => {
  try {
    const teams = await Team.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).populate('owner', 'name email avatar').populate('projects');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a team
// @route   POST /api/teams
// @access  Private
const createTeam = async (req, res) => {
  try {
    const { name, description } = req.body;
    const team = await Team.create({
      name,
      description,
      owner: req.user._id,
      members: [{ user: req.user._id, role: 'Admin' }],
    });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMyTeams,
  createTeam,
};

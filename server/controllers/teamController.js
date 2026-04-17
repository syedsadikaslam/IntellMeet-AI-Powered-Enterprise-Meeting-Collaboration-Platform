const crypto = require('crypto');

// @desc    Get user teams
// @route   GET /api/teams
// @access  Private
const getMyTeams = async (req, res) => {
  try {
    let teams = await Team.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    }).populate('owner', 'name email avatar').populate('projects');

    // Migration for legacy teams without joinCode
    let updated = false;
    for (let team of teams) {
      if (!team.joinCode) {
        team.joinCode = crypto.randomBytes(4).toString('hex').toUpperCase();
        await team.save();
        updated = true;
      }
    }
    
    if (updated) {
       // Re-fetch to get clean objects
       teams = await Team.find({
        $or: [
          { owner: req.user._id },
          { 'members.user': req.user._id }
        ]
      }).populate('owner', 'name email avatar').populate('projects');
    }

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
    
    // Generate unique join code
    const joinCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const team = await Team.create({
      name,
      description,
      owner: req.user._id,
      joinCode,
      members: [{ user: req.user._id, role: 'Admin' }],
    });
    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Join a team by code
// @route   POST /api/teams/join
// @access  Private
const joinTeam = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Please provide a join code' });

    const team = await Team.findOne({ joinCode: code.toUpperCase() });
    if (!team) return res.status(404).json({ message: 'Invalid join code. Please check the code and try again.' });

    // Check if user is already a member
    const isMember = team.members.find(m => m.user.toString() === req.user._id.toString());
    if (isMember) {
       return res.status(400).json({ message: 'You are already a member of this workspace.' });
    }

    team.members.push({ user: req.user._id, role: 'Member' });
    await team.save();

    res.json({ message: 'Successfully joined the team', team });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMyTeams,
  createTeam,
  joinTeam,
};

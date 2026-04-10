const express = require('express');
const router = express.Router();
const { getMyTeams, createTeam } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMyTeams).post(protect, createTeam);

module.exports = router;

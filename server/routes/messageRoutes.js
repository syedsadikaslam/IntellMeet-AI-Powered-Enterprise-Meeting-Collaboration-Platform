const express = require('express');
const router = express.Router();
const { sendMessage, getTeamMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/:teamId', protect, getTeamMessages);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  createMeeting,
  getMeetings,
  getMeetingByCode,
  updateMeeting,
  deleteMeeting,
  analyzeMeeting,
} = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createMeeting).get(protect, getMeetings);
router.route('/:code').get(protect, getMeetingByCode);
router.route('/:id').put(protect, updateMeeting).delete(protect, deleteMeeting);
router.route('/:id/analyze').post(protect, analyzeMeeting);

module.exports = router;

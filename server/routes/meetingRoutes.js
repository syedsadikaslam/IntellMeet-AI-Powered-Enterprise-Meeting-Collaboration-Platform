const express = require('express');
const router = express.Router();
const {
  createMeeting,
  getMeetings,
  getMeetingByCode,
  updateMeeting,
  deleteMeeting,
  analyzeMeeting,
  getAnalytics,
  updateActionItems,
} = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').post(protect, createMeeting).get(protect, getMeetings);
router.route('/analytics').get(protect, getAnalytics);
router.route('/:code').get(protect, getMeetingByCode);
router.route('/:id').put(protect, updateMeeting).delete(protect, deleteMeeting);
router.route('/:id/analyze').post(protect, analyzeMeeting);
router.route('/:id/action-items').put(protect, updateActionItems);

module.exports = router;

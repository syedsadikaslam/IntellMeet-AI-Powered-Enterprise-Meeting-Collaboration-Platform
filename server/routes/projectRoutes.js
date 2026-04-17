const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  getProjectsByTeam,
  createProject,
  addTaskToProject,
  updateTask,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getProjects).post(protect, createProject);
router.route('/team/:teamId').get(protect, getProjectsByTeam);
router.route('/:id').get(protect, getProjectById);
router.route('/:id/tasks').post(protect, addTaskToProject);
router.route('/:id/tasks/:taskId').put(protect, updateTask);

module.exports = router;

const Project = require('../models/Project');
const Team = require('../models/Team');
const crypto = require('crypto');

// @desc    Get all projects for a team
// @route   GET /api/projects/team/:teamId
// @access  Private
const getProjectsByTeam = async (req, res) => {
  try {
    const projects = await Project.find({ team: req.params.teamId });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { name, description, teamId } = req.body;
    const project = await Project.create({
      name,
      description,
      team: teamId,
      tasks: [],
    });
    
    // Update team to include this project
    await Team.findByIdAndUpdate(teamId, { $push: { projects: project._id } });
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Add task to project
// @route   POST /api/projects/:id/tasks
// @access  Private
const addTaskToProject = async (req, res) => {
  try {
    const { title, priority, assignee, meetingOrigin } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const newTask = {
      title,
      priority: priority || 'medium',
      assignee,
      meetingOrigin,
      status: 'todo'
    };
    
    project.tasks.push(newTask);
    await project.save();
    
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update task status (drag and drop)
// @route   PUT /api/projects/:id/tasks/:taskId
// @access  Private
const updateTask = async (req, res) => {
  try {
    const { status, title, priority } = req.body;
    const project = await Project.findById(req.params.id);
    
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const task = project.tasks.id(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    
    if (status) task.status = status;
    if (title) task.title = title;
    if (priority) task.priority = priority;
    
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all projects for the user
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    // Search projects in teams where the user is a member
    const teams = await Team.find({
      $or: [
        { owner: req.user._id },
        { 'members.user': req.user._id }
      ]
    });
    const teamIds = teams.map(t => t._id);
    let projects = await Project.find({ team: { $in: teamIds } }).populate('team', 'name joinCode');

    // Migration for missing joinCodes in populated teams
    let updated = false;
    for (let project of projects) {
       if (project.team && !project.team.joinCode) {
          const newCode = crypto.randomBytes(4).toString('hex').toUpperCase();
          await Team.findByIdAndUpdate(project.team._id, { joinCode: newCode });
          updated = true;
       }
    }

    if (updated) {
       projects = await Project.find({ team: { $in: teamIds } }).populate('team', 'name joinCode');
    }

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Authorization: Check if user owns the team associated with this project
    const team = await Team.findById(project.team);
    if (!team) return res.status(404).json({ message: 'Associated team not found' });

    if (team.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this workspace' });
    }

    // Delete Team and Project
    await Team.findByIdAndDelete(project.team);
    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Workspace deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  getProjectsByTeam,
  createProject,
  addTaskToProject,
  updateTask,
  deleteProject,
};

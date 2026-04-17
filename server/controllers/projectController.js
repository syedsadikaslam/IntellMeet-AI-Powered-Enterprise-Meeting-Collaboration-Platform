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
    let projects = await Project.find({ team: { $in: teamIds } }).populate('team', 'name joinCode owner members');

    let updated = false;
    for (let project of projects) {
       // Issue Fix: If the team reference is missing (Legacy corruption)
       if (!project.team) {
          console.warn(`Project ${project._id} has a missing team reference. Fixing...`);
          // Create a placeholder team to recover this workspace
          const placeholderCode = crypto.randomBytes(4).toString('hex').toUpperCase();
          const placeholderTeam = await Team.create({
             name: `${project.name} Workspace`,
             owner: req.user._id,
             joinCode: placeholderCode,
             members: [{ user: req.user._id, role: 'Admin' }],
             projects: [project._id]
          });
          project.team = placeholderTeam._id;
          await project.save();
          updated = true;
       } 
       // Issue Fix: If team exists but no joinCode
       else if (!project.team.joinCode) {
          const newCode = crypto.randomBytes(4).toString('hex').toUpperCase();
          await Team.findByIdAndUpdate(project.team._id, { joinCode: newCode });
          updated = true;
       }
    }

    if (updated) {
       projects = await Project.find({ team: { $in: teamIds } }).populate('team', 'name joinCode owner members');
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
    const project = await Project.findById(req.params.id)
      .populate({
        path: 'team',
        select: 'name joinCode owner members',
        populate: {
          path: 'members.user',
          select: 'name avatar email'
        }
      });
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
    if (!project) {
       // If project is already gone, just return success to clean up UI
       return res.json({ message: 'Project already removed' });
    }

    // Authorization: Check if user owns the team OR is an Admin in the team
    const team = await Team.findById(project.team);
    
    // If associated team is missing (Legacy corruption), allow deletion just for cleanup
    if (!team) {
       console.warn(`Force deleting project ${req.params.id} because the associated team record is missing.`);
       await Project.findByIdAndDelete(req.params.id);
       return res.json({ message: 'Workspace cleaned up successfully (orphan removal)' });
    }

    // Allow deletion if owner OR Admin
    const isOwner = team.owner.toString() === req.user._id.toString();
    const isAdmin = team.members.some(m => m.user.toString() === req.user._id.toString() && m.role === 'Admin');

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized: Only Workspace Admin can delete this.' });
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

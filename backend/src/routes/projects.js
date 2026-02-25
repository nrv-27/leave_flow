import express from 'express';
import Project from '../models/Project.js';
import { protect, managerOnly } from '../middleware/auth.js';
const router = express.Router();
router.use(protect);
router.get('/', async (req, res) => {
  const filter = req.user.role === 'manager'
    ? { teamId: req.user.teamId }
    : { assignedEmployees: req.user._id, status: 'active' };
  const projects = await Project.find(filter).populate('assignedEmployees', 'name email');
  res.json({ projects });
});
router.post('/', managerOnly, async (req, res) => {
  const project = await Project.create({ ...req.body, teamId: req.user.teamId });
  res.status(201).json(project);
});
router.put('/:id', managerOnly, async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(project);
});
export default router;

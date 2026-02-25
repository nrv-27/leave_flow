import express from 'express';
import User from '../models/User.js';
import { protect, managerOnly } from '../middleware/auth.js';
const router = express.Router();
router.use(protect);
router.get('/team', async (req, res) => {
  const users = await User.find({ teamId: req.user.teamId, role: 'employee' }).select('-password');
  res.json({ users });
});
router.get('/:id', managerOnly, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});
export default router;

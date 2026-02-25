import express from 'express';
import Rules from '../models/Rules.js';
import { protect, managerOnly } from '../middleware/auth.js';
const router = express.Router();
router.use(protect);
router.get('/', async (req, res) => {
  const rules = await Rules.findOne({ teamId: req.user.teamId });
  res.json(rules || { maxTeamAbsencePercent: 30, maxAutoApprovalDays: 2, deadlineThresholdDays: 3, criticalProjectProtection: true });
});
router.put('/', managerOnly, async (req, res) => {
  const rules = await Rules.findOneAndUpdate(
    { teamId: req.user.teamId },
    { ...req.body, teamId: req.user.teamId },
    { upsert: true, new: true }
  );
  res.json(rules);
});
export default router;

import express from 'express';
import { getManagerAnalytics, getEmployeeAnalytics } from '../controllers/analyticsController.js';
import { protect, managerOnly } from '../middleware/auth.js';
const router = express.Router();
router.use(protect);
router.get('/manager', managerOnly, getManagerAnalytics);
router.get('/employee', getEmployeeAnalytics);
export default router;

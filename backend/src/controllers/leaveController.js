import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { analyzeLeaveRequest, getSuggestedLeaveDays } from '../services/ruleEngine.js';
import { io } from '../server.js';

export const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason, leaveType } = req.body;
    const userId = req.user._id;
    const teamId = req.user.teamId;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    if (req.user.leaveBalance < daysCount) {
      return res.status(400).json({ message: `Insufficient leave balance. Available: ${req.user.leaveBalance} days` });
    }

    const { decision, impactScore, reasons } = await analyzeLeaveRequest({
      userId, teamId, startDate: start, endDate: end, daysCount,
    });

    if (decision === 'reject') {
      return res.status(422).json({ message: 'Leave request rejected by system rules', reasons, impactScore });
    }

    const status = decision === 'auto_approve' ? 'auto_approved' : 'pending';
    const autoApproved = decision === 'auto_approve';

    const leave = await Leave.create({
      userId, teamId, startDate: start, endDate: end,
      reason, leaveType, status, autoApproved, impactScore, daysCount,
    });

    if (autoApproved) {
      await User.findByIdAndUpdate(userId, { $inc: { leaveBalance: -daysCount } });
    }

    await leave.populate('userId', 'name email department');

    // Notify manager via socket
    io.to(`team:${teamId}:manager`).emit('leave:new', {
      leave,
      message: `${req.user.name} applied for ${daysCount} day(s) leave`,
    });

    res.status(201).json({ leave, decision, reasons, impactScore });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyLeaves = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const total = await Leave.countDocuments(filter);
    const leaves = await Leave.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ leaves, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTeamLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { teamId: req.user.teamId };
    if (status) filter.status = status;

    const leaves = await Leave.find(filter)
      .populate('userId', 'name email department avatar')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    res.json({ leaves });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, managerNote } = req.body;

    const leave = await Leave.findById(id).populate('userId', 'name email teamId leaveBalance');
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.teamId !== req.user.teamId) return res.status(403).json({ message: 'Unauthorized' });

    leave.status = status;
    leave.managerNote = managerNote || '';
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();

    if (status === 'approved') {
      await User.findByIdAndUpdate(leave.userId._id, { $inc: { leaveBalance: -leave.daysCount } });
    }

    // Notify employee
    io.to(`user:${leave.userId._id}`).emit('leave:updated', {
      leave,
      message: `Your leave request has been ${status}`,
    });

    res.json({ leave });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLeaveImpactPreview = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const analysis = await analyzeLeaveRequest({
      userId: req.user._id,
      teamId: req.user.teamId,
      startDate: start,
      endDate: end,
      daysCount,
    });

    res.json(analysis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSuggestedDays = async (req, res) => {
  try {
    const suggestions = await getSuggestedLeaveDays(req.user.teamId);
    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

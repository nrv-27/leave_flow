import Leave from '../models/Leave.js';
import User from '../models/User.js';
import Project from '../models/Project.js';
import Attendance from '../models/Attendance.js';

export const getManagerAnalytics = async (req, res) => {
  try {
    const teamId = req.user.teamId;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [totalEmployees, onLeave, pendingLeaves, projects] = await Promise.all([
      User.countDocuments({ teamId, role: 'employee' }),
      Leave.countDocuments({ teamId, status: { $in: ['approved', 'auto_approved'] }, startDate: { $lte: now }, endDate: { $gte: now } }),
      Leave.countDocuments({ teamId, status: 'pending' }),
      Project.find({ teamId, status: 'active' }).sort({ deadline: 1 }),
    ]);

    // Monthly leave distribution
    const monthlyLeaves = await Leave.aggregate([
      { $match: { teamId, createdAt: { $gte: monthStart, $lte: monthEnd } } },
      { $group: { _id: { $dayOfMonth: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);

    // Leave type breakdown
    const leaveTypes = await Leave.aggregate([
      { $match: { teamId } },
      { $group: { _id: '$leaveType', count: { $sum: 1 } } },
    ]);

    // Approval stats
    const approvalStats = await Leave.aggregate([
      { $match: { teamId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Team workload
    const teamWorkload = await Leave.aggregate([
      {
        $match: {
          teamId,
          status: { $in: ['approved', 'auto_approved'] },
          startDate: { $lte: monthEnd },
          endDate: { $gte: monthStart },
        },
      },
      {
        $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' },
      },
      { $unwind: '$user' },
      { $group: { _id: '$user.name', totalDays: { $sum: '$daysCount' } } },
      { $sort: { totalDays: -1 } },
    ]);

    res.json({
      overview: { totalEmployees, onLeave, pendingLeaves, upcomingDeadlines: projects.filter(p => {
        const days = (p.deadline - now) / 86400000;
        return days <= 7 && days >= 0;
      }).length },
      monthlyLeaves,
      leaveTypes,
      approvalStats,
      teamWorkload,
      projects,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getEmployeeAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const year = now.getFullYear();

    const [leaves, attendance, projects] = await Promise.all([
      Leave.find({ userId }).sort({ createdAt: -1 }).limit(5),
      Attendance.find({
        userId,
        date: { $gte: `${year}-01-01`, $lte: `${year}-12-31` },
      }),
      Project.find({ assignedEmployees: userId, status: 'active' }),
    ]);

    const presentDays = attendance.filter(a => a.status === 'present').length;
    const totalWorkDays = attendance.length;
    const attendanceRate = totalWorkDays > 0 ? ((presentDays / totalWorkDays) * 100).toFixed(1) : 0;

    // Monthly leave usage
    const monthlyUsage = Array.from({ length: 12 }, (_, i) => {
      const monthLeaves = leaves.filter(l => new Date(l.startDate).getMonth() === i);
      return { month: i + 1, days: monthLeaves.reduce((s, l) => s + (l.daysCount || 0), 0) };
    });

    res.json({
      leaveBalance: req.user.leaveBalance,
      recentLeaves: leaves,
      attendanceRate: parseFloat(attendanceRate),
      totalPresent: presentDays,
      projects,
      monthlyUsage,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

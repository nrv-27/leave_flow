import Rules from '../models/Rules.js';
import Leave from '../models/Leave.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

/**
 * Analyzes a leave request and returns a decision + impact score
 */
export const analyzeLeaveRequest = async ({ userId, teamId, startDate, endDate, daysCount }) => {
  const rules = await Rules.findOne({ teamId }) || {
    maxTeamAbsencePercent: 30,
    maxAutoApprovalDays: 2,
    deadlineThresholdDays: 3,
    criticalProjectProtection: true,
  };

  const reasons = [];
  let impactScore = 0;
  let decision = 'auto_approve';

  // 1. Check team absence during the requested period
  const teamMembers = await User.find({ teamId, role: 'employee' });
  const totalTeam = teamMembers.length;

  if (totalTeam > 0) {
    const overlappingLeaves = await Leave.countDocuments({
      teamId,
      status: { $in: ['approved', 'auto_approved'] },
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });
    const absencePercent = (overlappingLeaves / totalTeam) * 100;
    impactScore += absencePercent;

    if (absencePercent >= rules.maxTeamAbsencePercent) {
      decision = 'reject';
      reasons.push(`Team absence (${absencePercent.toFixed(0)}%) exceeds limit of ${rules.maxTeamAbsencePercent}%`);
    }
  }

  // 2. Check project deadlines
  const criticalProjects = await Project.find({
    assignedEmployees: userId,
    deadline: { $gte: startDate, $lte: new Date(endDate.getTime() + rules.deadlineThresholdDays * 86400000) },
    status: 'active',
  });

  if (criticalProjects.length > 0) {
    impactScore += 40;
    const hasCritical = criticalProjects.some(p => p.priority === 'critical');

    if (rules.criticalProjectProtection && hasCritical) {
      decision = 'reject';
      reasons.push(`Assigned to critical project with deadline during leave period`);
    } else if (decision !== 'reject') {
      decision = 'send_to_manager';
      reasons.push(`Has project deadlines during leave: ${criticalProjects.map(p => p.name).join(', ')}`);
    }
  }

  // 3. Auto-approval window
  if (daysCount <= rules.maxAutoApprovalDays && decision === 'auto_approve') {
    reasons.push(`Within auto-approval limit (${daysCount} days ≤ ${rules.maxAutoApprovalDays} days)`);
  } else if (decision === 'auto_approve') {
    decision = 'send_to_manager';
    reasons.push(`Leave duration (${daysCount} days) exceeds auto-approval limit`);
  }

  return {
    decision,
    impactScore: Math.min(100, impactScore),
    reasons,
    rules,
  };
};

/**
 * Returns best days for leave in the next 30 days
 */
export const getSuggestedLeaveDays = async (teamId) => {
  const today = new Date();
  const suggestions = [];

  for (let i = 1; i <= 30; i++) {
    const date = new Date(today.getTime() + i * 86400000);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const leaveCount = await Leave.countDocuments({
      teamId,
      status: { $in: ['approved', 'auto_approved'] },
      startDate: { $lte: date },
      endDate: { $gte: date },
    });

    const teamSize = await User.countDocuments({ teamId, role: 'employee' });
    const absencePercent = teamSize > 0 ? (leaveCount / teamSize) * 100 : 0;

    if (absencePercent < 15) {
      suggestions.push({ date: date.toISOString().split('T')[0], absencePercent: absencePercent.toFixed(0) });
    }
    if (suggestions.length >= 5) break;
  }

  return suggestions;
};

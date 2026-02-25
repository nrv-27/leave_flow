import mongoose from 'mongoose';

const rulesSchema = new mongoose.Schema({
  teamId: { type: String, required: true, unique: true },
  maxTeamAbsencePercent: { type: Number, default: 30 },
  maxAutoApprovalDays: { type: Number, default: 2 },
  deadlineThresholdDays: { type: Number, default: 3 },
  criticalProjectProtection: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Rules', rulesSchema);

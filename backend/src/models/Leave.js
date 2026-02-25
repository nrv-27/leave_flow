import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teamId: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  leaveType: { type: String, enum: ['annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid'], default: 'annual' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'auto_approved'], default: 'pending' },
  autoApproved: { type: Boolean, default: false },
  impactScore: { type: Number, default: 0 },
  managerNote: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  daysCount: { type: Number },
}, { timestamps: true });

leaveSchema.pre('save', function (next) {
  const diff = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24)) + 1;
  this.daysCount = diff;
  next();
});

export default mongoose.model('Leave', leaveSchema);

import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teamId: { type: String, required: true },
  deadline: { type: Date, required: true },
  assignedEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  workloadScore: { type: Number, default: 50 },
  description: { type: String, default: '' },
  status: { type: String, enum: ['active', 'completed', 'on_hold'], default: 'active' },
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);

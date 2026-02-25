import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Always load .env relative to this file's location (works regardless of where you run npm from)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/leave-system';
console.log('🔌 Connecting to:', MONGO_URI.replace(/:([^@:]+)@/, ':****@'));

const userSchema = new mongoose.Schema({
  name: String, email: String, password: String, role: String,
  teamId: String, leaveBalance: Number, department: String,
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  name: String, teamId: String, deadline: Date,
  assignedEmployees: [String], priority: String, workloadScore: Number,
}, { timestamps: true });

const rulesSchema = new mongoose.Schema({
  teamId: String, maxTeamAbsencePercent: Number, maxAutoApprovalDays: Number,
  deadlineThresholdDays: Number, criticalProjectProtection: Boolean,
});

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ Could not connect to MongoDB:', err.message);
    console.error('\nMake sure your MONGODB_URI in backend/.env is correct.');
    process.exit(1);
  }

  const User = mongoose.model('User', userSchema);
  const Project = mongoose.model('Project', projectSchema);
  const Rules = mongoose.model('Rules', rulesSchema);

  await User.deleteMany({});
  await Project.deleteMany({});
  await Rules.deleteMany({});
  console.log('🗑  Cleared existing data');

  const hashed = await bcrypt.hash('password123', 10);
  const teamId = 'team-alpha';

  const users = await User.insertMany([
    { name: 'Sarah Mitchell', email: 'manager@demo.com', password: hashed, role: 'manager', teamId, leaveBalance: 20, department: 'Engineering' },
    { name: 'James Okafor',   email: 'employee@demo.com', password: hashed, role: 'employee', teamId, leaveBalance: 15, department: 'Engineering' },
    { name: 'Priya Sharma',   email: 'priya@demo.com',    password: hashed, role: 'employee', teamId, leaveBalance: 12, department: 'Engineering' },
    { name: 'Carlos Mendez',  email: 'carlos@demo.com',   password: hashed, role: 'employee', teamId, leaveBalance: 18, department: 'Engineering' },
    { name: 'Aisha Tanaka',   email: 'aisha@demo.com',    password: hashed, role: 'employee', teamId, leaveBalance: 8,  department: 'Engineering' },
  ]);
  console.log('👥 Created', users.length, 'users');

  await Project.insertMany([
    { name: 'Platform Redesign', teamId, deadline: new Date(Date.now() + 7  * 86400000), assignedEmployees: [users[1]._id.toString(), users[2]._id.toString()], priority: 'critical', workloadScore: 85 },
    { name: 'API Migration',     teamId, deadline: new Date(Date.now() + 21 * 86400000), assignedEmployees: [users[1]._id.toString(), users[3]._id.toString()], priority: 'high',     workloadScore: 65 },
    { name: 'Mobile App v2',     teamId, deadline: new Date(Date.now() + 45 * 86400000), assignedEmployees: [users[2]._id.toString(), users[4]._id.toString()], priority: 'medium',   workloadScore: 45 },
  ]);
  console.log('🚀 Created 3 projects');

  await Rules.create({ teamId, maxTeamAbsencePercent: 30, maxAutoApprovalDays: 2, deadlineThresholdDays: 3, criticalProjectProtection: true });
  console.log('⚙️  Created rule engine config');

  console.log('\n✅ Seed complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('👔 Manager:  manager@demo.com  / password123');
  console.log('👤 Employee: employee@demo.com / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  await mongoose.disconnect();
}

seed();

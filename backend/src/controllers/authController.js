import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (userId, role, teamId) =>
  jwt.sign({ userId, role, teamId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, { expiresIn: '30d' });

export const register = async (req, res) => {
  try {
    const { name, email, password, role, teamId, department } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role, teamId, department });
    const token = generateToken(user._id, user.role, user.teamId);
    const refreshToken = generateRefreshToken(user._id);

    res.status(201).json({ user, token, refreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (role && user.role !== role) return res.status(403).json({ message: `Not authorized as ${role}` });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id, user.role, user.teamId);
    const refreshToken = generateRefreshToken(user._id);

    res.json({ user, token, refreshToken });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });

    const newToken = generateToken(user._id, user.role, user.teamId);
    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};

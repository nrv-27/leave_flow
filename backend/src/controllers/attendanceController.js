import Attendance from '../models/Attendance.js';

const getToday = () => new Date().toISOString().split('T')[0];

export const checkIn = async (req, res) => {
  try {
    const date = getToday();
    const existing = await Attendance.findOne({ userId: req.user._id, date });
    if (existing?.checkIn) return res.status(400).json({ message: 'Already checked in today' });

    const record = existing
      ? await Attendance.findByIdAndUpdate(existing._id, { checkIn: new Date(), status: 'present' }, { new: true })
      : await Attendance.create({ userId: req.user._id, date, checkIn: new Date(), status: 'present' });

    res.json({ record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const checkOut = async (req, res) => {
  try {
    const date = getToday();
    const record = await Attendance.findOne({ userId: req.user._id, date });
    if (!record?.checkIn) return res.status(400).json({ message: 'No check-in found for today' });
    if (record.checkOut) return res.status(400).json({ message: 'Already checked out today' });

    const now = new Date();
    const totalHours = (now - record.checkIn) / (1000 * 60 * 60);
    const status = totalHours < 4 ? 'half_day' : 'present';

    record.checkOut = now;
    record.totalHours = parseFloat(totalHours.toFixed(2));
    record.status = status;
    await record.save();

    res.json({ record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAttendanceReport = async (req, res) => {
  try {
    const { userId, month, year } = req.query;
    const targetUserId = (req.user.role === 'manager' && userId) ? userId : req.user._id;

    const startDate = `${year || new Date().getFullYear()}-${String(month || new Date().getMonth() + 1).padStart(2, '0')}-01`;
    const endDate = new Date(year || new Date().getFullYear(), month || new Date().getMonth() + 1, 0)
      .toISOString().split('T')[0];

    const records = await Attendance.find({
      userId: targetUserId,
      date: { $gte: startDate, $lte: endDate },
    }).sort({ date: 1 });

    const present = records.filter(r => r.status === 'present').length;
    const halfDay = records.filter(r => r.status === 'half_day').length;
    const totalHours = records.reduce((sum, r) => sum + (r.totalHours || 0), 0);

    res.json({
      records,
      summary: { present, halfDay, absent: 0, totalHours: parseFloat(totalHours.toFixed(1)) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTodayStatus = async (req, res) => {
  try {
    const record = await Attendance.findOne({ userId: req.user._id, date: getToday() });
    res.json({ record });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

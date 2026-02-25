import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import StatCard from '../../components/StatCard.jsx';
import api from '../../services/api.js';
import { format } from 'date-fns';

const statusBadge = (status) => {
  const map = { approved: 'badge-green', pending: 'badge-yellow', rejected: 'badge-red', auto_approved: 'badge-green' };
  const label = { approved: 'Approved', pending: 'Pending', rejected: 'Rejected', auto_approved: 'Auto-approved' };
  return <span className={map[status] || 'badge-gray'}>{label[status] || status}</span>;
};

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/employee'),
      api.get('/leave/suggestions'),
      api.get('/attendance/today'),
    ]).then(([a, s, t]) => {
      setAnalytics(a.data);
      setSuggestions(s.data.suggestions);
      setTodayAttendance(t.data.record);
    }).finally(() => setLoading(false));
  }, []);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const { data } = await api.post('/attendance/checkin');
      setTodayAttendance(data.record);
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingIn(true);
    try {
      const { data } = await api.post('/attendance/checkout');
      setTodayAttendance(data.record);
    } catch (err) {
      alert(err.response?.data?.message);
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-surface-400 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link to="/dashboard/employee/apply" className="btn-primary text-sm">+ Apply Leave</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Leave Balance" value={`${user?.leaveBalance || 0}`} sub="days remaining" accent="blue" icon="📅" />
        <StatCard label="Attendance Rate" value={`${analytics?.attendanceRate || 0}%`} sub="this year" accent="green" icon="✅" />
        <StatCard label="Active Projects" value={analytics?.projects?.length || 0} sub="assigned to you" accent="amber" icon="🚀" />
        <StatCard label="Leaves Taken" value={analytics?.recentLeaves?.length || 0} sub="recent requests" accent="red" icon="🗓" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Attendance card */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-200 mb-4">Today's Attendance</h3>
          {todayAttendance ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-surface-400">Check-in</span>
                <span className="text-white font-medium">{todayAttendance.checkIn ? format(new Date(todayAttendance.checkIn), 'HH:mm') : '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-400">Check-out</span>
                <span className="text-white font-medium">{todayAttendance.checkOut ? format(new Date(todayAttendance.checkOut), 'HH:mm') : '—'}</span>
              </div>
              {todayAttendance.totalHours > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-surface-400">Total hours</span>
                  <span className="text-emerald-400 font-medium">{todayAttendance.totalHours}h</span>
                </div>
              )}
              {!todayAttendance.checkOut && (
                <button onClick={handleCheckOut} disabled={checkingIn} className="btn-secondary w-full text-sm mt-2">Check Out</button>
              )}
            </div>
          ) : (
            <div>
              <p className="text-surface-400 text-sm mb-4">You haven't checked in yet today.</p>
              <button onClick={handleCheckIn} disabled={checkingIn} className="btn-primary w-full text-sm">
                {checkingIn ? 'Processing...' : 'Check In'}
              </button>
            </div>
          )}
        </div>

        {/* Recent leaves */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-surface-200">Recent Leaves</h3>
            <Link to="/dashboard/employee/leaves" className="text-xs text-primary-400 hover:text-primary-300">View all →</Link>
          </div>
          {analytics?.recentLeaves?.length === 0 ? (
            <p className="text-surface-400 text-sm">No leave requests yet.</p>
          ) : (
            <div className="space-y-3">
              {analytics?.recentLeaves?.slice(0, 4).map(leave => (
                <div key={leave._id} className="flex items-center justify-between py-2 border-b border-surface-200/5 last:border-0">
                  <div>
                    <p className="text-sm text-surface-200 font-medium capitalize">{leave.leaveType} leave</p>
                    <p className="text-xs text-surface-400">
                      {format(new Date(leave.startDate), 'MMM d')} – {format(new Date(leave.endDate), 'MMM d, yyyy')}
                      <span className="ml-2">· {leave.daysCount}d</span>
                    </p>
                  </div>
                  {statusBadge(leave.status)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projects + Suggestions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Projects */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-200 mb-4">Active Projects</h3>
          {analytics?.projects?.length === 0 ? (
            <p className="text-surface-400 text-sm">No active projects assigned.</p>
          ) : (
            <div className="space-y-3">
              {analytics?.projects?.map(p => {
                const daysLeft = Math.ceil((new Date(p.deadline) - new Date()) / 86400000);
                return (
                  <div key={p._id} className="flex items-center justify-between py-2 border-b border-surface-200/5 last:border-0">
                    <div>
                      <p className="text-sm text-surface-200 font-medium">{p.name}</p>
                      <p className="text-xs text-surface-400">Due {format(new Date(p.deadline), 'MMM d, yyyy')}</p>
                    </div>
                    <span className={daysLeft <= 7 ? 'badge-red' : daysLeft <= 14 ? 'badge-yellow' : 'badge-green'}>
                      {daysLeft}d left
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Smart suggestions */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-200 mb-1">🤖 Smart Leave Suggestions</h3>
          <p className="text-xs text-surface-400 mb-4">Best days to take leave with minimal team impact</p>
          {suggestions.length === 0 ? (
            <p className="text-surface-400 text-sm">No suggestions available.</p>
          ) : (
            <div className="space-y-2">
              {suggestions.map(s => (
                <div key={s.date} className="flex items-center justify-between p-3 rounded-xl bg-surface-900 border border-surface-200/5">
                  <span className="text-sm text-surface-200">{format(new Date(s.date), 'EEEE, MMM d')}</span>
                  <span className="badge-green">{s.absencePercent}% absent</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

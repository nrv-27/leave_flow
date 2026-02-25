import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import StatCard from '../../components/StatCard.jsx';
import api from '../../services/api.js';

const COLORS = ['#4f72e3', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function ManagerDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/manager').then(({ data }) => setAnalytics(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  const leaveTypeData = analytics?.leaveTypes?.map(t => ({ name: t._id, value: t.count })) || [];
  const workloadData = analytics?.teamWorkload?.slice(0, 8).map(w => ({ name: w._id.split(' ')[0], days: w.totalDays })) || [];

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Manager Overview</h1>
          <p className="text-surface-400 text-sm mt-0.5">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
        </div>
        <Link to="/dashboard/manager/leaves" className="btn-primary text-sm relative">
          Review Requests
          {analytics?.overview?.pendingLeaves > 0 && (
            <span className="ml-2 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">{analytics.overview.pendingLeaves}</span>
          )}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Team Size" value={analytics?.overview?.totalEmployees} sub="employees" accent="blue" icon="👥" />
        <StatCard label="Currently on Leave" value={analytics?.overview?.onLeave} sub="today" accent="amber" icon="🏖" />
        <StatCard label="Pending Requests" value={analytics?.overview?.pendingLeaves} sub="need review" accent="red" icon="⏳" />
        <StatCard label="Upcoming Deadlines" value={analytics?.overview?.upcomingDeadlines} sub="within 7 days" accent="green" icon="🚨" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leave type breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-200 mb-4">Leave Types Breakdown</h3>
          {leaveTypeData.length === 0 ? (
            <p className="text-surface-400 text-sm">No data yet.</p>
          ) : (
            <div className="flex items-center gap-6">
              <PieChart width={140} height={140}>
                <Pie data={leaveTypeData} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {leaveTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
              <div className="space-y-2">
                {leaveTypeData.map((t, i) => (
                  <div key={t.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-surface-300 capitalize">{t.name}</span>
                    <span className="text-xs text-surface-400 ml-auto">{t.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Team workload */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-200 mb-4">Leave Days by Employee</h3>
          {workloadData.length === 0 ? (
            <p className="text-surface-400 text-sm">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={workloadData} barSize={24} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="days" fill="#4f72e3" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Upcoming project deadlines */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-surface-200">Project Deadlines</h3>
        </div>
        {analytics?.projects?.length === 0 ? (
          <p className="text-surface-400 text-sm">No active projects.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {analytics?.projects?.map(p => {
              const daysLeft = Math.ceil((new Date(p.deadline) - new Date()) / 86400000);
              return (
                <div key={p._id} className="p-4 bg-surface-900 rounded-xl border border-surface-200/5">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium text-surface-100">{p.name}</p>
                    <span className={`badge text-xs ${p.priority === 'critical' ? 'badge-red' : p.priority === 'high' ? 'badge-yellow' : 'badge-blue'}`}>
                      {p.priority}
                    </span>
                  </div>
                  <p className="text-xs text-surface-400">Due {format(new Date(p.deadline), 'MMM d, yyyy')}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-surface-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${daysLeft <= 3 ? 'bg-red-500' : daysLeft <= 7 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.max(0, Math.min(100, (30 - daysLeft) / 30 * 100))}%` }} />
                    </div>
                    <span className={`text-xs font-medium ${daysLeft <= 3 ? 'text-red-400' : daysLeft <= 7 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {daysLeft}d
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

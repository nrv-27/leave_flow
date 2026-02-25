import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import api from '../../services/api.js';

const COLORS = ['#4f72e3', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/manager').then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  const approvalData = data?.approvalStats?.map(s => ({
    name: s._id === 'auto_approved' ? 'Auto-approved' : s._id,
    value: s.count,
  })) || [];

  const workloadData = data?.teamWorkload?.slice(0, 8).map(w => ({
    name: w._id.split(' ')[0],
    days: w.totalDays,
  })) || [];

  const monthlyData = data?.monthlyLeaves?.map(m => ({
    day: m._id,
    requests: m.count,
  })) || [];

  const totalRequests = approvalData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Analytics</h1>
        <p className="text-surface-400 text-sm mt-0.5">Team leave trends and productivity insights</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-surface-400">Total Requests</p>
          <p className="text-3xl font-semibold text-white mt-1">{totalRequests}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-surface-400">Auto-approved</p>
          <p className="text-3xl font-semibold text-emerald-400 mt-1">{approvalData.find(d => d.name === 'Auto-approved')?.value || 0}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-surface-400">Manual Reviews</p>
          <p className="text-3xl font-semibold text-amber-400 mt-1">{approvalData.find(d => d.name === 'approved')?.value || 0}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-surface-400">Rejected</p>
          <p className="text-3xl font-semibold text-red-400 mt-1">{approvalData.find(d => d.name === 'rejected')?.value || 0}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leave requests over month */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-200 mb-4">Leave Requests This Month</h3>
          {monthlyData.length === 0 ? (
            <p className="text-surface-400 text-sm">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Line type="monotone" dataKey="requests" stroke="#4f72e3" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#4f72e3' }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Approval breakdown */}
        <div className="card p-5">
          <h3 className="text-sm font-medium text-surface-200 mb-4">Approval Breakdown</h3>
          {approvalData.length === 0 ? (
            <p className="text-surface-400 text-sm">No data yet.</p>
          ) : (
            <div className="flex items-center gap-6">
              <PieChart width={140} height={140}>
                <Pie data={approvalData} cx={65} cy={65} innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                  {approvalData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
              </PieChart>
              <div className="space-y-2">
                {approvalData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
                    <span className="text-xs text-surface-300 capitalize">{d.name}</span>
                    <span className="text-xs text-surface-400 ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team workload */}
      <div className="card p-5">
        <h3 className="text-sm font-medium text-surface-200 mb-4">Team Leave Days Consumed</h3>
        {workloadData.length === 0 ? (
          <p className="text-surface-400 text-sm">No leave data available yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={workloadData} barSize={32}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="days" fill="#4f72e3" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

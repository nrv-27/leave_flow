import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import api from '../../services/api.js';

export default function AttendanceTracker() {
  const [report, setReport] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/attendance/report', { params: { month, year } });
      setReport(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, [month]);

  const chartData = report?.records?.map(r => ({
    date: format(new Date(r.date), 'd'),
    hours: r.totalHours || 0,
    status: r.status,
  })) || [];

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Attendance Tracker</h1>
          <p className="text-surface-400 text-sm mt-0.5">Your attendance log and hours worked</p>
        </div>
        <select className="input w-36 text-sm" value={month} onChange={e => setMonth(Number(e.target.value))}>
          {months.map((m, i) => <option key={i} value={i + 1} className="bg-surface-900">{m} {year}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="card p-5 text-center">
              <p className="text-3xl font-semibold text-emerald-400">{report?.summary?.present}</p>
              <p className="text-xs text-surface-400 mt-1">Days Present</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-3xl font-semibold text-amber-400">{report?.summary?.halfDay}</p>
              <p className="text-xs text-surface-400 mt-1">Half Days</p>
            </div>
            <div className="card p-5 text-center">
              <p className="text-3xl font-semibold text-primary-400">{report?.summary?.totalHours}h</p>
              <p className="text-xs text-surface-400 mt-1">Total Hours</p>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-medium text-surface-200 mb-4">Daily Hours</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barSize={10}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }}
                    labelStyle={{ color: '#94a3b8' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.hours >= 8 ? '#10b981' : entry.hours >= 4 ? '#f59e0b' : '#4f72e3'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Records table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-3 border-b border-surface-200/10">
              <h3 className="text-sm font-medium text-surface-200">Daily Log</h3>
            </div>
            {report?.records?.length === 0 ? (
              <p className="px-5 py-8 text-center text-surface-400 text-sm">No attendance records for this month.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200/10">
                    {['Date', 'Check-in', 'Check-out', 'Hours', 'Status'].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-surface-400 px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {report?.records?.map(r => (
                    <tr key={r._id} className="border-b border-surface-200/5 hover:bg-surface-200/3">
                      <td className="px-4 py-3 text-sm text-surface-200">{format(new Date(r.date), 'EEE, MMM d')}</td>
                      <td className="px-4 py-3 text-sm text-surface-300">{r.checkIn ? format(new Date(r.checkIn), 'HH:mm') : '—'}</td>
                      <td className="px-4 py-3 text-sm text-surface-300">{r.checkOut ? format(new Date(r.checkOut), 'HH:mm') : '—'}</td>
                      <td className="px-4 py-3 text-sm text-surface-300">{r.totalHours ? `${r.totalHours}h` : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={r.status === 'present' ? 'badge-green' : r.status === 'half_day' ? 'badge-yellow' : 'badge-gray'}>
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

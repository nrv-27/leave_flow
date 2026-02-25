import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../services/api.js';

const statusBadge = (s) => ({ approved: 'badge-green', pending: 'badge-yellow', rejected: 'badge-red', auto_approved: 'badge-green' }[s] || 'badge-gray');
const statusLabel = (s) => ({ approved: '✓ Approved', pending: '⏳ Pending', rejected: '✕ Rejected', auto_approved: '⚡ Auto-approved' }[s] || s);

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leave/my', { params: { page, limit: 10, status: statusFilter || undefined } });
      setLeaves(data.leaves);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, [page, statusFilter]);

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">My Leave History</h1>
          <p className="text-surface-400 text-sm mt-0.5">{total} total requests</p>
        </div>
        <select className="input w-40 text-sm" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="auto_approved">Auto-approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : leaves.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-surface-400">No leave requests found.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200/10">
                {['Type', 'Period', 'Days', 'Reason', 'Status', 'Note'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-surface-400 px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l._id} className="border-b border-surface-200/5 hover:bg-surface-200/3 transition-colors">
                  <td className="px-4 py-3 text-sm text-surface-200 capitalize">{l.leaveType}</td>
                  <td className="px-4 py-3 text-sm text-surface-300">
                    {format(new Date(l.startDate), 'MMM d')} – {format(new Date(l.endDate), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-300">{l.daysCount}d</td>
                  <td className="px-4 py-3 text-sm text-surface-400 max-w-xs truncate">{l.reason}</td>
                  <td className="px-4 py-3"><span className={statusBadge(l.status)}>{statusLabel(l.status)}</span></td>
                  <td className="px-4 py-3 text-sm text-surface-400 max-w-xs truncate">{l.managerNote || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {total > 10 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.ceil(total / 10) }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)}
              className={`w-8 h-8 rounded-lg text-sm ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-surface-800 text-surface-400 hover:bg-surface-700'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

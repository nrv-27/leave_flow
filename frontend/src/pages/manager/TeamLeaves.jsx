import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../../services/api.js';

const statusBadge = (s) => ({ approved: 'badge-green', pending: 'badge-yellow', rejected: 'badge-red', auto_approved: 'badge-green' }[s] || 'badge-gray');

export default function TeamLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [actionLeave, setActionLeave] = useState(null);
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/leave/team', { params: { status: filter || undefined } });
      setLeaves(data.leaves);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, [filter]);

  const handleAction = async (status) => {
    if (!actionLeave) return;
    setProcessing(true);
    try {
      await api.patch(`/leave/${actionLeave._id}/status`, { status, managerNote: note });
      setActionLeave(null);
      setNote('');
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setProcessing(false);
    }
  };

  const impactColor = (score) => score < 30 ? 'text-emerald-400' : score < 60 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Team Leave Requests</h1>
          <p className="text-surface-400 text-sm mt-0.5">{leaves.length} requests</p>
        </div>
        <select className="input w-40 text-sm" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="auto_approved">Auto-approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : leaves.length === 0 ? (
        <div className="card py-16 text-center">
          <p className="text-surface-400">No {filter} leave requests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map(leave => (
            <div key={leave._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-600/20 text-primary-400 flex items-center justify-center font-medium text-sm flex-shrink-0">
                    {leave.userId?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-surface-100 text-sm">{leave.userId?.name}</p>
                    <p className="text-xs text-surface-400">{leave.userId?.department} · <span className="capitalize">{leave.leaveType}</span></p>
                    <p className="text-xs text-surface-300 mt-1">
                      {format(new Date(leave.startDate), 'MMM d')} – {format(new Date(leave.endDate), 'MMM d, yyyy')}
                      <span className="ml-2 text-surface-400">({leave.daysCount} days)</span>
                    </p>
                    <p className="text-xs text-surface-400 mt-1 italic">"{leave.reason}"</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-center">
                    <p className="text-xs text-surface-400">Impact</p>
                    <p className={`text-lg font-semibold ${impactColor(leave.impactScore)}`}>{leave.impactScore}</p>
                  </div>
                  <span className={statusBadge(leave.status)}>
                    {leave.status === 'auto_approved' ? '⚡ Auto' : leave.status}
                  </span>
                  {leave.status === 'pending' && (
                    <button onClick={() => setActionLeave(leave)} className="btn-primary text-xs px-3 py-2">Review</button>
                  )}
                </div>
              </div>

              {leave.managerNote && (
                <div className="mt-3 pt-3 border-t border-surface-200/5">
                  <p className="text-xs text-surface-400">Manager note: <span className="text-surface-300">{leave.managerNote}</span></p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review modal */}
      {actionLeave && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActionLeave(null)}>
          <div className="card p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-white mb-1">Review Leave Request</h3>
            <p className="text-sm text-surface-400 mb-4">
              {actionLeave.userId?.name} — {actionLeave.daysCount} day(s),{' '}
              {format(new Date(actionLeave.startDate), 'MMM d')} – {format(new Date(actionLeave.endDate), 'MMM d')}
            </p>

            <div className="p-3 bg-surface-900 rounded-xl mb-4">
              <p className="text-xs text-surface-400">Impact Score: <span className={`font-medium ${actionLeave.impactScore < 30 ? 'text-emerald-400' : actionLeave.impactScore < 60 ? 'text-amber-400' : 'text-red-400'}`}>{actionLeave.impactScore}/100</span></p>
              <p className="text-xs text-surface-400 mt-1">Reason: <span className="text-surface-300">{actionLeave.reason}</span></p>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Note (optional)</label>
              <textarea className="input h-20 resize-none" value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note for the employee..." />
            </div>

            <div className="flex gap-3">
              <button onClick={() => handleAction('rejected')} disabled={processing}
                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium px-4 py-2.5 rounded-xl transition-all text-sm">
                ✕ Reject
              </button>
              <button onClick={() => handleAction('approved')} disabled={processing}
                className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium px-4 py-2.5 rounded-xl transition-all text-sm">
                ✓ Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

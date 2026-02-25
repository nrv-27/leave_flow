import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

export default function ApplyLeave() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '', leaveType: 'annual' });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchPreview = async () => {
    if (!form.startDate || !form.endDate) return;
    setLoading(true);
    try {
      const { data } = await api.get('/leave/impact-preview', { params: { startDate: form.startDate, endDate: form.endDate } });
      setPreview(data);
    } catch {}
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { data } = await api.post('/leave/apply', form);
      const isAuto = data.decision === 'auto_approve';
      setSuccess(isAuto ? '✅ Leave auto-approved! Balance updated.' : '📨 Leave request submitted for manager review.');
      setTimeout(() => navigate('/dashboard/employee/leaves'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to apply leave');
    } finally {
      setSubmitting(false);
    }
  };

  const impactColor = (score) => score < 30 ? 'text-emerald-400' : score < 60 ? 'text-amber-400' : 'text-red-400';
  const decisionBadge = (d) => ({
    auto_approve: <span className="badge-green">⚡ Will be auto-approved</span>,
    send_to_manager: <span className="badge-yellow">📋 Requires manager approval</span>,
    reject: <span className="badge-red">❌ Likely to be rejected</span>,
  }[d]);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Apply for Leave</h1>
        <p className="text-surface-400 text-sm mt-0.5">Our AI will analyze team impact before submitting</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Start Date</label>
              <input type="date" className="input" value={form.startDate}
                onChange={e => { setForm({ ...form, startDate: e.target.value }); setPreview(null); }}
                onBlur={fetchPreview} min={new Date().toISOString().split('T')[0]} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">End Date</label>
              <input type="date" className="input" value={form.endDate}
                onChange={e => { setForm({ ...form, endDate: e.target.value }); setPreview(null); }}
                onBlur={fetchPreview} min={form.startDate || new Date().toISOString().split('T')[0]} required />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">Leave Type</label>
            <select className="input" value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })}>
              {['annual', 'sick', 'personal', 'maternity', 'paternity', 'unpaid'].map(t => (
                <option key={t} value={t} className="bg-surface-900 capitalize">{t.charAt(0).toUpperCase() + t.slice(1)} Leave</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">Reason</label>
            <textarea className="input h-24 resize-none" value={form.reason}
              onChange={e => setForm({ ...form, reason: e.target.value })}
              placeholder="Briefly describe your reason for leave..." required />
          </div>
        </div>

        {/* Impact preview */}
        {loading && (
          <div className="card p-5 flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-surface-400 text-sm">Analyzing team impact...</p>
          </div>
        )}
        {preview && !loading && (
          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-surface-200">🔍 Impact Analysis</h3>
              {decisionBadge(preview.decision)}
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-surface-400 mb-1">Impact Score</p>
                <p className={`text-2xl font-semibold ${impactColor(preview.impactScore)}`}>{preview.impactScore?.toFixed(0)}<span className="text-sm font-normal">/100</span></p>
              </div>
              <div className="flex-1 h-2 bg-surface-900 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${preview.impactScore < 30 ? 'bg-emerald-500' : preview.impactScore < 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${preview.impactScore}%` }}
                />
              </div>
            </div>
            {preview.reasons?.length > 0 && (
              <ul className="space-y-1">
                {preview.reasons.map((r, i) => (
                  <li key={i} className="text-xs text-surface-400 flex gap-2">
                    <span>•</span>{r}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
        {success && <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{success}</div>}

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={submitting || loading} className="btn-primary flex-1">
            {submitting ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

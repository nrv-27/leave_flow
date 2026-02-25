import { useState, useEffect } from 'react';
import api from '../../services/api.js';

export default function RuleEngine() {
  const [rules, setRules] = useState({ maxTeamAbsencePercent: 30, maxAutoApprovalDays: 2, deadlineThresholdDays: 3, criticalProjectProtection: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/rules').then(({ data }) => setRules(data)).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/rules', rules);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-32"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Rule Engine Configuration</h1>
        <p className="text-surface-400 text-sm mt-0.5">Configure how the AI evaluates and auto-processes leave requests</p>
      </div>

      <div className="card p-6 space-y-6">
        {/* Max team absence */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="text-sm font-medium text-surface-200">Max Team Absence</label>
              <p className="text-xs text-surface-400 mt-0.5">Reject leaves if team absence exceeds this threshold</p>
            </div>
            <span className="text-primary-400 font-semibold text-lg">{rules.maxTeamAbsencePercent}%</span>
          </div>
          <input type="range" min={10} max={80} step={5} value={rules.maxTeamAbsencePercent}
            onChange={e => setRules({ ...rules, maxTeamAbsencePercent: Number(e.target.value) })}
            className="w-full h-2 bg-surface-800 rounded-full appearance-none cursor-pointer accent-primary-500" />
          <div className="flex justify-between text-xs text-surface-500 mt-1">
            <span>10%</span><span>80%</span>
          </div>
        </div>

        {/* Auto approval days */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="text-sm font-medium text-surface-200">Auto-Approval Window</label>
              <p className="text-xs text-surface-400 mt-0.5">Requests ≤ this many days are auto-approved (if no conflicts)</p>
            </div>
            <span className="text-primary-400 font-semibold text-lg">{rules.maxAutoApprovalDays}d</span>
          </div>
          <input type="range" min={1} max={7} step={1} value={rules.maxAutoApprovalDays}
            onChange={e => setRules({ ...rules, maxAutoApprovalDays: Number(e.target.value) })}
            className="w-full h-2 bg-surface-800 rounded-full appearance-none cursor-pointer accent-primary-500" />
          <div className="flex justify-between text-xs text-surface-500 mt-1">
            <span>1 day</span><span>7 days</span>
          </div>
        </div>

        {/* Deadline threshold */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="text-sm font-medium text-surface-200">Deadline Protection Window</label>
              <p className="text-xs text-surface-400 mt-0.5">Block/flag leaves if a project deadline is within this window</p>
            </div>
            <span className="text-primary-400 font-semibold text-lg">{rules.deadlineThresholdDays}d</span>
          </div>
          <input type="range" min={1} max={14} step={1} value={rules.deadlineThresholdDays}
            onChange={e => setRules({ ...rules, deadlineThresholdDays: Number(e.target.value) })}
            className="w-full h-2 bg-surface-800 rounded-full appearance-none cursor-pointer accent-primary-500" />
          <div className="flex justify-between text-xs text-surface-500 mt-1">
            <span>1 day</span><span>14 days</span>
          </div>
        </div>

        {/* Critical project protection toggle */}
        <div className="flex items-center justify-between p-4 bg-surface-900 rounded-xl border border-surface-200/5">
          <div>
            <p className="text-sm font-medium text-surface-200">Critical Project Protection</p>
            <p className="text-xs text-surface-400 mt-0.5">Automatically reject leaves for employees on critical-priority projects near deadline</p>
          </div>
          <button
            onClick={() => setRules({ ...rules, criticalProjectProtection: !rules.criticalProjectProtection })}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${rules.criticalProjectProtection ? 'bg-primary-600' : 'bg-surface-700'}`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${rules.criticalProjectProtection ? 'left-6' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Preview logic */}
      <div className="card p-5">
        <h3 className="text-sm font-medium text-surface-200 mb-3">📋 Current Logic Preview</h3>
        <div className="space-y-2 text-sm font-mono text-surface-300">
          <p className="text-surface-400">// Rule engine decision flow</p>
          <p><span className="text-primary-400">IF</span> team_absence &gt; <span className="text-amber-400">{rules.maxTeamAbsencePercent}%</span> <span className="text-primary-400">→</span> <span className="text-red-400">REJECT</span></p>
          <p><span className="text-primary-400">IF</span> project_deadline within <span className="text-amber-400">{rules.deadlineThresholdDays} days</span>{rules.criticalProjectProtection && ' (critical)'} <span className="text-primary-400">→</span> <span className="text-red-400">REJECT</span></p>
          <p><span className="text-primary-400">IF</span> days &lt;= <span className="text-amber-400">{rules.maxAutoApprovalDays}</span> AND no conflicts <span className="text-primary-400">→</span> <span className="text-emerald-400">AUTO-APPROVE</span></p>
          <p><span className="text-primary-400">ELSE</span> <span className="text-primary-400">→</span> <span className="text-blue-400">SEND TO MANAGER</span></p>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}

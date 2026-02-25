import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function EmployeeLogin() {
  const [form, setForm] = useState({ email: 'employee@demo.com', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password, 'employee');
      navigate('/dashboard/employee');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex">
      {/* Left visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-900/40 to-surface-950 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center mx-auto mb-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          </div>
          <h1 className="text-3xl font-semibold text-white mb-4">LeaveFlow</h1>
          <p className="text-surface-400 text-lg leading-relaxed">Smart leave management that balances team workload and respects deadlines automatically.</p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[['Auto-approval', 'Instant decisions'], ['Workload AI', 'Smart balancing'], ['Real-time', 'Live updates']].map(([title, sub]) => (
              <div key={title} className="card p-4 text-left">
                <p className="text-xs font-medium text-primary-400 mb-1">{title}</p>
                <p className="text-xs text-surface-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login */}
      <div className="flex-1 lg:max-w-md flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <span className="badge-green mb-4 inline-flex">👤 Employee Portal</span>
            <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
            <p className="text-surface-400 mt-1 text-sm">Sign in to manage your leaves</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Email address</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@company.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-surface-300 mb-1.5">Password</label>
              <input
                type="password"
                className="input"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-xl bg-surface-800 border border-surface-200/10">
            <p className="text-xs text-surface-400 font-medium mb-1">Demo credentials</p>
            <p className="text-xs text-surface-300 font-mono">employee@demo.com / password123</p>
          </div>

          <p className="mt-6 text-center text-sm text-surface-400">
            Are you a manager?{' '}
            <Link to="/login/manager" className="text-primary-400 hover:text-primary-300 font-medium">Manager login →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ManagerLogin() {
  const [form, setForm] = useState({ email: 'manager@demo.com', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password, 'manager');
      navigate('/dashboard/manager');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
            </div>
            <span className="font-semibold text-white text-lg">LeaveFlow</span>
          </div>
          <span className="badge-blue mb-4 inline-flex">⚡ Manager Portal</span>
          <h2 className="text-2xl font-semibold text-white">Manager access</h2>
          <p className="text-surface-400 mt-1 text-sm">Manage your team's leaves and workload</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">Email address</label>
            <input type="email" className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-surface-300 mb-1.5">Password</label>
            <input type="password" className="input" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          {error && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">{loading ? 'Signing in...' : 'Sign in as Manager'}</button>
        </form>

        <div className="mt-4 p-3 rounded-xl bg-surface-800 border border-surface-200/10">
          <p className="text-xs text-surface-400 font-medium mb-1">Demo credentials</p>
          <p className="text-xs text-surface-300 font-mono">manager@demo.com / password123</p>
        </div>

        <p className="mt-6 text-center text-sm text-surface-400">
          Employee?{' '}
          <Link to="/login/employee" className="text-primary-400 hover:text-primary-300 font-medium">Employee login →</Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Zap, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/leads" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/leads');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Decorative gradient spot */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 items-center justify-center shadow-lg shadow-brand-500/20 mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">LeadFlow</h1>
          <p className="text-slate-400 mt-2 text-sm">Sign in to manage your pipeline</p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white text-sm transition-all placeholder:text-slate-600"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white text-sm transition-all placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-600/10 hover:shadow-brand-600/20"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/60">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Demo Accounts</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 truncate">admin@leadplatform.com</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Password: admin12345</p>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-md shrink-0">
                  Admin
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 truncate">member@leadplatform.com</p>
                  <p className="text-[10px] text-slate-600 mt-0.5">Password: member12345</p>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md shrink-0">
                  Member
                </span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-8">
          <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-slate-400 transition-colors">
            Built for Digital Heroes Training Task
          </a>
        </p>
      </div>
    </div>
  );
}

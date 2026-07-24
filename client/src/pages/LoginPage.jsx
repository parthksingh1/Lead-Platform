import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, Shield } from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Status states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/leads" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/leads');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      setSuccess('Account created successfully! You can now log in.');
      setIsRegisterMode(false);
      setName('');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setError('');
    setSuccess('');
    setIsRegisterMode(!isRegisterMode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#090D16] px-4 font-sans relative overflow-hidden">
      {/* Subtle top spotlight */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-amber-500/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[460px] z-10 py-10">
        {/* Logo/Brand Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-neutral-800 to-neutral-900 border border-neutral-700/50 shadow-inner mb-4">
            <Shield className="w-5 h-5 text-amber-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">LeadFlow</h1>
          <p className="text-sm text-slate-400 mt-2">
            {isRegisterMode ? 'Register a new operator profile' : 'Sign in to access your dashboard'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#111724]/85 backdrop-blur-md rounded-2xl border border-slate-800/80 p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
          {error && (
            <div className="mb-6 p-4 bg-red-950/20 border border-red-900/30 text-red-400 rounded-xl text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-950/20 border border-emerald-900/30 text-emerald-400 rounded-xl text-sm flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
              <span className="leading-relaxed">{success}</span>
            </div>
          )}

          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-6">
            {isRegisterMode && (
              <div>
                <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-[#0B0F19] border border-slate-850 rounded-xl text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-650"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0B0F19] border border-slate-850 rounded-xl text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-650"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0B0F19] border border-slate-850 rounded-xl text-sm text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 outline-none transition-all placeholder:text-slate-650"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/55 text-neutral-950 rounded-xl text-sm font-bold transition-all duration-150 shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 cursor-pointer"
            >
              <span>{loading ? 'Processing...' : (isRegisterMode ? 'Create Account' : 'Sign In')}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs text-slate-400 hover:text-amber-500 transition-colors font-medium underline underline-offset-4"
            >
              {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Demo Section */}
          {!isRegisterMode && (
            <div className="mt-8 pt-8 border-t border-slate-800/80">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Operator Demo Credentials</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-slate-850/50 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-300 truncate">admin@leadplatform.com</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Password: admin12345</p>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md shrink-0">
                    Admin
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0F19] border border-slate-850/50 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-300 truncate">member@leadplatform.com</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Password: member12345</p>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-semibold bg-slate-800 text-slate-400 border border-slate-700/30 rounded-md shrink-0">
                    Member
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-slate-600 mt-8">
          <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-slate-400 transition-colors">
            Built for Digital Heroes Training Task
          </a>
        </p>
      </div>
    </div>
  );
}

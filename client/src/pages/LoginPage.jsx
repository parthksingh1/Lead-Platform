import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

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
    <div className="min-h-screen flex items-center justify-center bg-[#F9F9FB] px-4 font-sans selection:bg-neutral-200">
      <div className="w-full max-w-[420px]">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <span className="w-2.5 h-6 bg-neutral-900 rounded-sm" />
            <h1 className="text-xl font-bold tracking-tight text-neutral-900">LeadFlow</h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1.5 font-medium">
            {isRegisterMode ? 'Create your platform account' : 'Sign in to your pipeline dashboard'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-neutral-200 p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          {error && (
            <div className="mb-5 p-3.5 bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-lg text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-neutral-600 mt-0.5 shrink-0" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3.5 bg-neutral-50 border border-neutral-200 text-neutral-800 rounded-lg text-xs flex items-start gap-2.5">
              <CheckCircle className="w-4 h-4 text-neutral-800 mt-0.5 shrink-0" />
              <span className="font-medium leading-relaxed">{success}</span>
            </div>
          )}

          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400"
                  placeholder="you@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:border-neutral-900 outline-none transition-all placeholder:text-neutral-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-neutral-950 hover:bg-neutral-800 text-white rounded-lg text-xs font-bold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-sm"
            >
              <span>{loading ? 'Processing...' : (isRegisterMode ? 'Create Account' : 'Sign In')}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* Toggle Button */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs text-neutral-500 hover:text-neutral-900 transition-colors font-medium underline underline-offset-4"
            >
              {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>

          {/* Demo Section */}
          {!isRegisterMode && (
            <div className="mt-8 pt-6 border-t border-neutral-100">
              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2.5">Demo Accounts</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-700 truncate">admin@leadplatform.com</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Password: admin12345</p>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-semibold bg-neutral-200 text-neutral-700 rounded-md shrink-0">
                    Admin
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-50 border border-neutral-100 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-700 truncate">member@leadplatform.com</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Password: member12345</p>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-semibold bg-neutral-200 text-neutral-700 rounded-md shrink-0">
                    Member
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-[10px] text-neutral-400 mt-8">
          <a href="https://digitalheroesco.com" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-neutral-600 transition-colors">
            Built for Digital Heroes Training Task
          </a>
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, Shield, Sparkles, Check } from 'lucide-react';

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
    <div className="min-h-screen flex bg-[#FAF8F5] font-sans selection:bg-neutral-200">
      
      {/* Left Column: Form Panel (Cream/Off-White) */}
      <div className="flex-1 flex flex-col justify-between p-8 sm:p-12 lg:p-16 max-w-full lg:max-w-[55%]">
        
        {/* Brand Header */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-neutral-900 rounded-sm" />
          <span className="text-lg font-bold tracking-tight text-neutral-900">LeadFlow</span>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-[400px] mx-auto my-12">
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-neutral-900 tracking-tight">
              {isRegisterMode ? 'Get started' : 'Welcome back'}
            </h2>
            <p className="text-sm text-neutral-500 mt-2 font-medium">
              {isRegisterMode 
                ? 'Create an account to begin tracking leads.' 
                : 'Sign in to access your enterprise dashboard.'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-neutral-100 border border-neutral-200 text-neutral-800 rounded-xl text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-neutral-600 mt-0.5 shrink-0" />
              <span className="leading-relaxed font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-neutral-100 border border-neutral-200 text-neutral-850 rounded-xl text-xs flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-neutral-700 mt-0.5 shrink-0" />
              <span className="leading-relaxed font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-5">
            {isRegisterMode && (
              <div>
                <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FCFBF8] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:border-neutral-950 outline-none transition-all placeholder:text-neutral-400"
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
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FCFBF8] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:border-neutral-950 outline-none transition-all placeholder:text-neutral-400"
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
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-[#FCFBF8] border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:border-neutral-950 outline-none transition-all placeholder:text-neutral-400"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-900/60 text-white rounded-xl text-xs font-bold transition-all duration-150 shadow-sm cursor-pointer"
            >
              <span>{loading ? 'Processing...' : (isRegisterMode ? 'Create Account' : 'Sign In')}</span>
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-5 text-center">
            <button
              type="button"
              onClick={toggleMode}
              className="text-xs text-neutral-500 hover:text-neutral-950 transition-colors font-medium underline underline-offset-4"
            >
              {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-neutral-400 font-medium">
          &copy; {new Date().getFullYear()} LeadFlow. All rights reserved.
        </p>
      </div>

      {/* Right Column: Premium Sidebar Panel (Dark Charcoal) */}
      <div className="hidden lg:flex flex-1 bg-[#121316] p-16 flex-col justify-between text-white relative overflow-hidden">
        {/* Subtle mesh details */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#1f2128,transparent)] opacity-60" />
        
        {/* Nice visual detail: Mock Pipeline Widget */}
        <div className="relative z-10 max-w-md my-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-850/50 border border-neutral-800 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
            <Sparkles className="w-3 h-3" /> Live Pipeline Funnel
          </div>
          
          <div className="space-y-4">
            <h3 className="text-3xl font-extrabold tracking-tight leading-tight">
              Enterprise client tracking, simplified.
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed font-medium">
              Monitor customer pathways, transition statuses dynamically, and collaborate with team members on a unified CRM workspace.
            </p>
          </div>

          {/* Decorative Preview Grid */}
          <div className="space-y-3 bg-[#17181c]/80 border border-neutral-800 p-6 rounded-2xl shadow-xl backdrop-blur-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">Recent Deal Activity</p>
            
            <div className="flex items-center justify-between p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-200">Acme Corporation</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Enterprise deal negotiation</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-md">
                Proposal
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-900/60 border border-neutral-800 rounded-xl">
              <div>
                <p className="text-xs font-bold text-slate-200">Stripe Integration</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Assigned to Member User</p>
              </div>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-md">
                Won
              </span>
            </div>
          </div>
        </div>

        {/* Demo info on the right sidebar footer */}
        <div className="relative z-10 border-t border-neutral-850 pt-6">
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2.5">Quick Demo Logins</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="font-semibold text-neutral-350">Admin Operator</p>
              <p className="text-[10px] text-neutral-500">admin@leadplatform.com / admin12345</p>
            </div>
            <div>
              <p className="font-semibold text-neutral-350">Member Operator</p>
              <p className="text-[10px] text-neutral-500">member@leadplatform.com / member12345</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

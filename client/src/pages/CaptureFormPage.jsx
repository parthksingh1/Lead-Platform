import { useState } from 'react';
import api from '../services/api';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Send 
} from 'lucide-react';

export default function CaptureFormPage() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', company: '', source: 'website',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/leads', formData);
      setSubmitted(true);
    } catch (err) {
      setError(
        err.response?.data?.errors
          ? err.response.data.errors.map((e) => e.message).join(', ')
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
        {/* Spot gradient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center max-w-md z-10 space-y-5 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Thank you!</h2>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">
              We've successfully received your information. A representative from our team will reach out to you within 24 hours.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Decorative gradient spot */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-lg z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Get in Touch</h1>
          <p className="text-slate-400 mt-2 text-sm">
            Tell us about your project and we'll get back to you shortly.
          </p>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-800 p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white text-sm transition-all placeholder:text-slate-600"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  id="email" 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white text-sm transition-all placeholder:text-slate-600"
                  placeholder="john@company.com"
                />
              </div>
            </div>

            {/* Phone & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Phone className="w-4 h-4" />
                  </span>
                  <input
                    id="phone" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white text-sm transition-all placeholder:text-slate-600"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="company" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Company Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                    <Building2 className="w-4 h-4" />
                  </span>
                  <input
                    id="company" 
                    name="company" 
                    value={formData.company} 
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-white text-sm transition-all placeholder:text-slate-600"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" 
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 shadow-lg shadow-brand-600/10 hover:shadow-brand-600/20"
            >
              <span>{loading ? 'Submitting...' : 'Submit Information'}</span>
              {!loading && <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
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

import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  TrendingUp, 
  Activity, 
  Trophy, 
  Inbox, 
  PhoneCall, 
  UserCheck, 
  FileSpreadsheet, 
  XCircle, 
  ArrowRight,
  TrendingDown
} from 'lucide-react';

const STATUS_CONFIG = {
  new: { label: 'New', color: 'text-blue-600 bg-blue-50 border-blue-100', progressColor: 'bg-blue-600', icon: Inbox },
  contacted: { label: 'Contacted', color: 'text-amber-600 bg-amber-50 border-amber-100', progressColor: 'bg-amber-500', icon: PhoneCall },
  qualified: { label: 'Qualified', color: 'text-indigo-600 bg-indigo-50 border-indigo-100', progressColor: 'bg-indigo-600', icon: UserCheck },
  proposal: { label: 'Proposal', color: 'text-orange-600 bg-orange-50 border-orange-100', progressColor: 'bg-orange-500', icon: FileSpreadsheet },
  won: { label: 'Won', color: 'text-emerald-600 bg-emerald-50 border-emerald-100', progressColor: 'bg-emerald-600', icon: Trophy },
  lost: { label: 'Lost', color: 'text-rose-600 bg-rose-50 border-rose-100', progressColor: 'bg-rose-500', icon: XCircle },
};

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/leads/stats');
        setStats(data.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  // Calculate active pipeline
  const activeCount = 
    (stats?.byStatus?.contacted || 0) + 
    (stats?.byStatus?.qualified || 0) + 
    (stats?.byStatus?.proposal || 0);

  // Calculate conversion rate
  const total = stats?.total || 0;
  const wonCount = stats?.byStatus?.won || 0;
  const conversionRate = total > 0 ? ((wonCount / total) * 100).toFixed(0) : 0;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pipeline Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time statistics and lead conversion metrics.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Leads Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Leads</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stats?.total || 0}</p>
            <p className="text-xs text-slate-500 mt-1">Lifetime leads captured</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Active Pipeline Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Pipeline</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{activeCount}</p>
            <p className="text-xs text-slate-500 mt-1">In discussion / qualified</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Won Conversion Rate Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Conversion Rate</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{conversionRate}%</p>
            <p className="text-xs text-slate-500 mt-1">Leads won successfully</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Status Breakdown Section */}
      <div>
        <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Pipeline Funnel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const count = stats?.byStatus?.[key] || 0;
            const percent = total > 0 ? ((count / total) * 100).toFixed(0) : 0;

            return (
              <div key={key} className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col justify-between shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-200">
                <div className="flex items-start justify-between">
                  <span className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-lg border ${config.color}`}>
                    {config.label}
                  </span>
                  <Icon className="w-4 h-4 text-slate-400" />
                </div>
                <div className="mt-5">
                  <p className="text-2xl font-bold text-slate-900">{count}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>Funnel Share</span>
                    <span className="font-medium">{percent}%</span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                    <div 
                      className={`h-1.5 rounded-full ${config.progressColor} transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

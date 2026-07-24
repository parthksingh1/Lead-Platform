import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Building2, 
  Calendar,
  Layers
} from 'lucide-react';

const STATUS_BADGES = {
  new: 'text-blue-700 bg-blue-50 border-blue-200/60',
  contacted: 'text-amber-700 bg-amber-50 border-amber-200/60',
  qualified: 'text-indigo-700 bg-indigo-50 border-indigo-200/60',
  proposal: 'text-orange-700 bg-orange-50 border-orange-200/60',
  won: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
  lost: 'text-rose-700 bg-rose-50 border-rose-200/60',
};

const STATUSES = ['', 'new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

export default function LeadsPage() {
  const { isAdmin } = useAuth();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '', page: 1 });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 10 };
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;

      const { data } = await api.get('/leads', { params });
      setLeads(data.data.leads);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leads</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your pipeline prospects.</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search name, email, company..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm transition-all placeholder:text-slate-400 text-slate-800"
          />
        </div>

        <div className="relative">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="pl-8 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm bg-white text-slate-700 font-medium transition-all appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 pointer-events-none">
            <Filter className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto" />
          </div>
        ) : leads.length === 0 ? (
          <div className="p-16 text-center text-slate-500">
            <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-800">No leads found</p>
            <p className="text-sm text-slate-400 mt-1">
              {!isAdmin ? 'Leads assigned to you will appear here.' : 'Create some leads to get started.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Lead Name & Email */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                          <User className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <Link 
                            to={`/leads/${lead._id}`} 
                            className="text-sm font-semibold text-slate-900 hover:text-brand-600 hover:underline transition-colors block truncate"
                          >
                            {lead.name}
                          </Link>
                          <span className="text-xs text-slate-400 truncate block mt-0.5">{lead.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {lead.company ? (
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {lead.company}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-lg border uppercase tracking-wider ${STATUS_BADGES[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>

                    {/* Assigned user */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {lead.assignedTo?.name ? (
                        <span className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                            {lead.assignedTo.name[0].toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-800">{lead.assignedTo.name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Unassigned</span>
                      )}
                    </td>

                    {/* Created date */}
                    <td className="px-6 py-4 text-sm text-slate-400 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Card Footer */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-400 font-medium">
              Showing {leads.length} of {pagination.total} leads
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                disabled={filters.page <= 1}
                className="inline-flex items-center justify-center p-1.5 text-slate-500 border border-slate-200 rounded-xl bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                disabled={filters.page >= pagination.pages}
                className="inline-flex items-center justify-center p-1.5 text-slate-500 border border-slate-200 rounded-xl bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

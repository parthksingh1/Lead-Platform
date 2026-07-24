import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronLeft, 
  Trash2, 
  Mail, 
  Phone, 
  Building2, 
  Plus, 
  User, 
  Globe, 
  Calendar, 
  Clock, 
  UserCheck, 
  MessageSquare,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const STATUS_BADGES = {
  new: 'text-blue-700 bg-blue-50 border-blue-200/60',
  contacted: 'text-amber-700 bg-amber-50 border-amber-200/60',
  qualified: 'text-indigo-700 bg-indigo-50 border-indigo-200/60',
  proposal: 'text-orange-700 bg-orange-50 border-orange-200/60',
  won: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
  lost: 'text-rose-700 bg-rose-50 border-rose-200/60',
};

const STATUS_PROGRESS_ORDER = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

const ACTIVITY_ICONS = {
  lead_created: InboxIcon,
  status_changed: RefreshIcon,
  assigned: UserCheckIcon,
  unassigned: UserMinusIcon,
  note_added: NoteIcon,
  lead_updated: EditIcon,
  lead_deleted: TrashIcon,
};

function InboxIcon(props) { return <Activity {...props} />; }
function RefreshIcon(props) { return <Activity {...props} className={`${props.className} text-amber-500`} />; }
function UserCheckIcon(props) { return <UserCheck {...props} className={`${props.className} text-indigo-500`} />; }
function UserMinusIcon(props) { return <User {...props} className={`${props.className} text-rose-500`} />; }
function NoteIcon(props) { return <MessageSquare {...props} className={`${props.className} text-blue-500`} />; }
function EditIcon(props) { return <Activity {...props} className={`${props.className} text-slate-500`} />; }
function TrashIcon(props) { return <Trash2 {...props} className={`${props.className} text-rose-500`} />; }

const ACTIVITY_LABELS = {
  lead_created: 'Lead created',
  status_changed: 'Status changed',
  assigned: 'Lead assigned',
  unassigned: 'Lead unassigned',
  note_added: 'Note added',
  lead_updated: 'Lead updated',
  lead_deleted: 'Lead deleted',
};

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [lead, setLead] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLead = async () => {
    try {
      const { data } = await api.get(`/leads/${id}`);
      setLead(data.data.lead);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 403) {
        navigate('/leads');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
    if (isAdmin) {
      api.get('/users').then(({ data }) => setUsers(data.data.users)).catch(() => {});
    }
  }, [id]);

  const updateStatus = async (status) => {
    try {
      await api.patch(`/leads/${id}/status`, { status });
      fetchLead();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  const assignLead = async (userId) => {
    try {
      await api.patch(`/leads/${id}/assign`, { assignedTo: userId });
      fetchLead();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign lead');
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/leads/${id}/notes`, { text: noteText });
      setNoteText('');
      fetchLead();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add note');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteLead = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      navigate('/leads');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete lead');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Top action header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/leads')}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to leads
        </button>

        {isAdmin && (
          <button
            onClick={deleteLead}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-rose-600 border border-rose-200 rounded-xl hover:bg-rose-50 transition-colors shrink-0 shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
            Delete Lead
          </button>
        )}
      </div>

      {/* Main Identity Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-brand-500/10 shrink-0">
            {lead.name[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">{lead.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {lead.email}
              </span>
              {lead.phone && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {lead.phone}
                  </span>
                </>
              )}
              {lead.company && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="flex items-center gap-1 font-semibold text-slate-700">
                    <Building2 className="w-3.5 h-3.5" />
                    {lead.company}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <span className={`inline-flex items-center self-start md:self-auto px-3.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wider ${STATUS_BADGES[lead.status]}`}>
          {lead.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left main column (Pipeline Status & Notes) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Pipeline stages */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Update Status</h2>
            <div className="flex flex-wrap gap-2.5">
              {STATUS_PROGRESS_ORDER.map((status) => {
                const isActive = lead.status === status;
                return (
                  <button
                    key={status}
                    onClick={() => updateStatus(status)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-all duration-150 ${
                      isActive
                        ? `${STATUS_BADGES[status]} ring-2 ring-brand-500/20 font-bold scale-105 shadow-sm`
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes board */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Notes board</h2>

            <form onSubmit={addNote} className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write a message or note..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm resize-none text-slate-800 transition-all placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={submitting || !noteText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-600/10 hover:shadow-brand-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                {submitting ? 'Adding...' : 'Add Note'}
              </button>
            </form>

            <div className="space-y-4">
              {lead.notes?.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No notes yet. Add one to record activity.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {[...lead.notes].reverse().map((note) => (
                    <div key={note._id} className="py-4 first:pt-0 last:pb-0 flex gap-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                        {note.createdBy?.name?.[0]?.toUpperCase() || 'S'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">{note.text}</p>
                        <p className="text-[11px] text-slate-400 font-medium mt-1">
                          {note.createdBy?.name || 'System'} · {new Date(note.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right sidebar column (Details & Activity) */}
        <div className="space-y-8">
          {/* Details list widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Details</h2>
            
            <dl className="space-y-4">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <dt className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Source</dt>
                  <dd className="text-sm font-semibold text-slate-800 capitalize mt-0.5">
                    {lead.source?.replace('_', ' ')}
                  </dd>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <dt className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Assigned to</dt>
                  <dd className="text-sm font-semibold text-slate-800 mt-0.5">
                    {lead.assignedTo?.name || <span className="text-slate-400 italic font-normal">Unassigned</span>}
                  </dd>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <dt className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Created</dt>
                  <dd className="text-sm font-medium text-slate-600 mt-0.5">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </dd>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <dt className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Last updated</dt>
                  <dd className="text-sm font-medium text-slate-600 mt-0.5">
                    {new Date(lead.updatedAt).toLocaleDateString()}
                  </dd>
                </div>
              </div>
            </dl>

            {/* Assign dropdown menu */}
            {isAdmin && (
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Assign Lead
                </label>
                <div className="relative">
                  <select
                    value={lead.assignedTo?._id || ''}
                    onChange={(e) => e.target.value && assignLead(e.target.value)}
                    className="w-full pl-8 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm text-slate-700 font-medium transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select team member</option>
                    {users.map((u) => (
                      <option key={u._id || u.id} value={u._id || u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                  <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 pointer-events-none">
                    <UserCheck className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Activity audit timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity timeline</h2>
            
            <div className="space-y-6 relative before:absolute before:inset-y-1 before:left-3.5 before:w-0.5 before:bg-slate-100">
              {lead.activity?.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No activity recorded yet.</p>
              ) : (
                [...lead.activity].reverse().map((event, i) => {
                  const Icon = ACTIVITY_ICONS[event.action] || InboxIcon;
                  return (
                    <div key={i} className="flex gap-4 relative">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 z-10 shadow-sm">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800 leading-snug">
                          {ACTIVITY_LABELS[event.action] || event.action}
                          {event.details?.from && event.details?.to && (
                            <span className="font-normal text-slate-400 block mt-0.5">
                              {event.details.from} → {event.details.to}
                            </span>
                          )}
                          {event.details?.assigneeName && (
                            <span className="font-normal text-slate-400 block mt-0.5">
                              Assigned to {event.details.assigneeName}
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1">
                          {event.performedBy?.name || 'System'} · {new Date(event.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

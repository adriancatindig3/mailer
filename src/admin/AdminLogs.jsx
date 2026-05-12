import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatDateTime, timeAgo, ACTION_LOG_CONFIG } from './adminHelpers';
import { Search } from 'lucide-react';

const AdminLogs = ({ darkMode, T }) => {
  const [logs, setLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilterDate, setLogFilterDate] = useState('');
  const [logFilterAction, setLogFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const cardBg     = darkMode ? 'bg-gray-800'   : 'bg-white';
  const cardBorder = darkMode ? 'border-gray-700' : 'border-gray-200';
  const textClass  = darkMode ? 'text-white'     : 'text-gray-900';
  const textMuted  = darkMode ? 'text-gray-500'  : 'text-gray-400';
  const textSub    = darkMode ? 'text-gray-400'  : 'text-gray-500';
  const inputBg    = darkMode ? 'bg-gray-900'    : 'bg-white';
  const inputBorder = darkMode ? 'border-gray-700' : 'border-gray-200';
  const labelClass = darkMode ? 'text-gray-500'  : 'text-gray-400';
  const thClass    = darkMode ? 'text-gray-500 border-gray-700 bg-gray-900' : 'text-gray-400 border-gray-200 bg-gray-50';
  const trBorder   = darkMode ? 'border-gray-700' : 'border-gray-100';
  const emailClass = darkMode ? 'text-blue-400'  : 'text-blue-600';
  const spinClass  = darkMode ? 'border-gray-700 border-t-white' : 'border-gray-200 border-t-gray-900';

  const fetchAllLogs = async () => {
    try {
      setLogsLoading(true);
      const q = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      setAllLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLogsLoading(false); }
  };

  useEffect(() => { fetchAllLogs(); }, []);

  useEffect(() => {
    let f = [...allLogs];
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      f = f.filter(l =>
        l.adminEmail?.toLowerCase().includes(s) ||
        l.targetUserName?.toLowerCase().includes(s) ||
        l.targetUserEmail?.toLowerCase().includes(s) ||
        l.details?.toLowerCase().includes(s)
      );
    }
    if (logFilterDate) {
      const d = new Date(logFilterDate);
      const start = new Date(d.setHours(0, 0, 0, 0));
      const end   = new Date(d.setHours(23, 59, 59, 999));
      f = f.filter(l => {
        if (!l.timestamp) return false;
        const t = new Date(l.timestamp.seconds ? l.timestamp.seconds * 1000 : l.timestamp);
        return t >= start && t <= end;
      });
    }
    if (logFilterAction !== 'all') f = f.filter(l => l.action === logFilterAction);
    setLogs(f);
  }, [logFilterDate, logFilterAction, searchTerm, allLogs]);

  return (
    <div className="space-y-4">

      {/* ── Filters card — sticky so it doesn't scroll away ── */}
      <div className={`sticky top-0 z-10 ${cardBg} border ${cardBorder} rounded-xl p-4 shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Search */}
          <div>
            <label className={`text-[0.65rem] ${labelClass} block mb-1.5 font-semibold tracking-wide uppercase`}>Search</label>
            <div className="relative">
              <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textMuted}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search by admin, user, or details..."
                className={`w-full py-2 pl-9 pr-3 border ${inputBorder} rounded-lg text-sm ${textClass} ${inputBg} focus:outline-none focus:border-gray-400 transition`}
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className={`text-[0.65rem] ${labelClass} block mb-1.5 font-semibold tracking-wide uppercase`}>Filter by Date</label>
            <input
              type="date"
              value={logFilterDate}
              onChange={e => setLogFilterDate(e.target.value)}
              className={`w-full py-2 px-3 border ${inputBorder} rounded-lg text-sm ${textClass} ${inputBg} cursor-pointer focus:outline-none transition`}
            />
          </div>

          {/* Action */}
          <div>
            <label className={`text-[0.65rem] ${labelClass} block mb-1.5 font-semibold tracking-wide uppercase`}>Filter by Action</label>
            <div className="relative">
              <select
                value={logFilterAction}
                onChange={e => setLogFilterAction(e.target.value)}
                className={`w-full py-2 pl-3 pr-10 border ${inputBorder} rounded-lg text-sm ${textClass} ${inputBg} cursor-pointer focus:outline-none transition appearance-none`}
              >
                <option value="all">All Actions</option>
                <option value="APPROVE">Approved User</option>
                <option value="REJECT">Rejected User</option>
                <option value="DELETE">Deleted User</option>
                <option value="UPDATE_LOGO">Updated Logo</option>
                <option value="UPDATE_SETTINGS">Updated Settings</option>
                <option value="ADD_ROLE">Added Role</option>
                <option value="EDIT_ROLE">Edited Role</option>
                <option value="DELETE_ROLE">Deleted Role</option>
                <option value="BULK_IMPORT">Bulk Import</option>
                <option value="EXPORT_DATA">Exported Data</option>
                <option value="LOGIN">Admin Login</option>
                <option value="LOGOUT">Admin Logout</option>
              </select>
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs ${textMuted}`}>▼</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Logs table card (separate) ── */}
      <div className={`${cardBg} border ${cardBorder} rounded-xl overflow-hidden shadow-sm`}>
        {/* Card header */}
        <div className={`px-5 py-4 border-b ${cardBorder} flex items-center justify-between flex-wrap gap-2`}>
          <div>
            <h3 className={`text-sm font-bold ${textClass}`}>Admin Activity Logs</h3>
            <p className={`text-[0.7rem] ${textMuted} mt-0.5`}>All administrative actions are recorded here</p>
          </div>
        </div>

        {/* Body */}
        {logsLoading ? (
          <div className="flex items-center justify-center py-16 gap-3">
            <div className={`w-5 h-5 border-2 ${spinClass} rounded-full animate-spin`} />
            <span className={`text-sm ${textMuted}`}>Loading logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className={`py-16 text-center text-sm ${textMuted}`}>No activity logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr>
                  {['Time', 'Admin', 'Action', 'Target', 'Details'].map(h => (
                    <th
                      key={h}
                      className={`py-3.5 px-5 text-left text-[0.6rem] font-bold tracking-wider uppercase border-b ${thClass}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const cfg = ACTION_LOG_CONFIG[log.action] || {
                    color: '#A0AEC0', bg: 'rgba(160,174,192,0.08)',
                    border: 'rgba(160,174,192,0.2)', icon: null, text: log.action,
                  };
                  return (
                    <tr key={log.id} className={`border-b ${trBorder}`}>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className={`text-xs font-mono ${textSub}`}>{timeAgo(log.timestamp)}</div>
                        <div className={`text-[0.65rem] ${textMuted} mt-0.5`}>{formatDateTime(log.timestamp)}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className={`text-sm font-semibold ${emailClass}`}>{log.adminEmail || '—'}</div>
                        <div className={`text-[0.65rem] ${textMuted}`}>{log.adminName || ''}</div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold px-3 py-1 rounded-full whitespace-nowrap"
                          style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
                        >
                          {cfg.icon}{cfg.text}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        {log.targetUserName  && <div className={`text-sm font-medium ${textClass}`}>{log.targetUserName}</div>}
                        {log.targetUserEmail && <div className={`text-[0.7rem] ${textSub}`}>{log.targetUserEmail}</div>}
                        {log.roleName && (
                          <div className={`text-sm font-medium ${textClass}`}>
                            Role: <span style={{ color: log.roleColor }}>{log.roleName}</span>
                          </div>
                        )}
                        {!log.targetUserName && !log.targetUserEmail && !log.roleName && (
                          <span className={`text-[0.75rem] ${textMuted}`}>—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`text-[0.75rem] ${textMuted}`}>{log.details || '—'}</span>
                        {log.changes && (
                          <div className={`text-[0.65rem] ${textMuted} mt-1 font-mono`}>{log.changes}</div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className={`py-3 px-5 border-t ${cardBorder} flex justify-between items-center flex-wrap gap-2`}>
          <span className={`text-[0.7rem] font-mono ${textMuted}`}>
            SHOWING {logs.length} OF {allLogs.length} ENTRIES
          </span>
          <span className={`text-[0.65rem] font-mono ${textMuted}`}>STORED IN FIRESTORE · adminLogs</span>
        </div>
      </div>

    </div>
  );
};

export default AdminLogs;

// main sticky 
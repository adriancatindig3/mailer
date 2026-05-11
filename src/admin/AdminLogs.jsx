import { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { formatDateTime, timeAgo, ACTION_LOG_CONFIG } from './adminHelpers';
import { Activity, Search } from 'lucide-react';

const AdminLogs = ({ darkMode, T }) => {
  const [logs, setLogs] = useState([]);
  const [allLogs, setAllLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logFilterDate, setLogFilterDate] = useState('');
  const [logFilterAction, setLogFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Theme-based classes matching UpdateProfile
  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgClass = darkMode ? 'bg-gray-800' : 'bg-white';
  const cardBorderClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const textClass = darkMode ? 'text-white' : 'text-gray-900';
  const textSubClass = darkMode ? 'text-gray-400' : 'text-gray-500';
  const textMutedClass = darkMode ? 'text-gray-500' : 'text-gray-400';
  const inputBgClass = darkMode ? 'bg-gray-900' : 'bg-white';
  const inputBorderClass = darkMode ? 'border-gray-700' : 'border-gray-200';
  const labelClass = darkMode ? 'text-gray-500' : 'text-gray-400';
  const tableHeaderClass = darkMode ? 'text-gray-500 border-gray-700' : 'text-gray-400 border-gray-200';
  const tableRowClass = darkMode ? 'border-gray-700' : 'border-gray-100';
  const adminEmailClass = darkMode ? 'text-blue-400' : 'text-blue-600';
  const loadingSpinnerClass = darkMode ? 'border-gray-700 border-t-white' : 'border-gray-200 border-t-gray-900';

  const fetchAllLogs = async () => {
    try {
      setLogsLoading(true);
      const q = query(collection(db, 'adminLogs'), orderBy('timestamp', 'desc'));
      const snap = await getDocs(q);
      const logsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAllLogs(logsData);
      setLogs(logsData);
    } catch (error) { console.error('Error fetching logs:', error); }
    finally { setLogsLoading(false); }
  };

  useEffect(() => {
    fetchAllLogs();
  }, []);

  useEffect(() => {
    let filtered = [...allLogs];
    
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.adminEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetUserName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.targetUserEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (logFilterDate) {
      const filterDate = new Date(logFilterDate);
      const startOfDay = new Date(filterDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(filterDate.setHours(23, 59, 59, 999));
      filtered = filtered.filter(log => {
        if (!log.timestamp) return false;
        const logDate = new Date(log.timestamp.seconds ? log.timestamp.seconds * 1000 : log.timestamp);
        return logDate >= startOfDay && logDate <= endOfDay;
      });
    }
    if (logFilterAction !== 'all') {
      filtered = filtered.filter(log => log.action === logFilterAction);
    }
    setLogs(filtered);
  }, [logFilterDate, logFilterAction, searchTerm, allLogs]);

  const clearFilters = () => {
    setLogFilterDate('');
    setLogFilterAction('all');
    setSearchTerm('');
  };

  return (
    <div className={`rounded-xl border ${cardBorderClass} ${cardBgClass} overflow-hidden shadow-sm`}>
      <div className={`p-5 border-b ${cardBorderClass}`}>
        <div className="flex justify-between items-center flex-wrap gap-4 mb-4">
          <div>
            <h3 className={`text-base font-bold ${textClass} m-0`}>Admin Activity Logs</h3>
            <p className={`text-[0.7rem] ${textMutedClass} mt-1`}>All administrative actions are recorded here</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className={`text-[0.65rem] ${labelClass} block mb-1.5 font-semibold tracking-wide`}>SEARCH</label>
            <div className="relative">
              <Search size={14} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMutedClass}`} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by admin, user, or details..."
                className={`w-full py-2 pl-9 pr-3 border ${inputBorderClass} rounded-lg text-sm ${textClass} ${inputBgClass} focus:outline-none focus:border-gray-400 transition`}
              />
            </div>
          </div>
          <div>
            <label className={`text-[0.65rem] ${labelClass} block mb-1.5 font-semibold tracking-wide`}>FILTER BY DATE</label>
            <input 
              type="date" 
              value={logFilterDate} 
              onChange={(e) => setLogFilterDate(e.target.value)}
              className={`w-full py-2 px-3 border ${inputBorderClass} rounded-lg text-sm ${textClass} ${inputBgClass} cursor-pointer focus:outline-none transition`} 
            />
          </div>
          <div>
            <label className={`text-[0.65rem] ${labelClass} block mb-1.5 font-semibold tracking-wide`}>FILTER BY ACTION</label>
            <div className="relative">
              <select
                value={logFilterAction}
                onChange={(e) => setLogFilterAction(e.target.value)}
                className={`w-full py-2 pl-3 pr-10 border ${inputBorderClass} rounded-lg text-sm ${textClass} ${inputBgClass} cursor-pointer focus:outline-none transition appearance-none`}
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
              <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-xs ${textMutedClass}`}>
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>

      {logsLoading ? (
        <div className="flex items-center justify-center py-16 gap-3">
          <div className={`w-5 h-5 border-2 ${loadingSpinnerClass} rounded-full animate-spin`} />
          <span className={`text-sm ${textMutedClass}`}>Loading logs...</span>
        </div>
      ) : logs.length === 0 ? (
        <div className={`py-16 text-center ${textMutedClass}`}>No activity logs found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead>
              <tr className={`border-b ${tableHeaderClass}`}>
                {['Time', 'Admin', 'Action', 'Target', 'Details'].map(h => (
                  <th key={h} className={`py-3.5 px-5 text-left text-[0.6rem] font-bold tracking-wider uppercase ${tableHeaderClass}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const actionCfg = ACTION_LOG_CONFIG[log.action] || { 
                  color: '#A0AEC0', 
                  bg: 'rgba(160, 174, 192, 0.08)', 
                  border: 'rgba(160, 174, 192, 0.2)', 
                  icon: null, 
                  text: log.action 
                };
                return (
                  <tr key={log.id} className={`border-b ${tableRowClass}`}>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className={`text-xs font-mono ${textSubClass}`}>{timeAgo(log.timestamp)}</div>
                      <div className={`text-[0.65rem] ${textMutedClass} mt-0.5`}>{formatDateTime(log.timestamp)}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className={`text-sm font-semibold ${adminEmailClass}`}>{log.adminEmail || '—'}</div>
                      <div className={`text-[0.65rem] ${textMutedClass}`}>{log.adminName || ''}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span 
                        className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold px-3 py-1 rounded-full whitespace-nowrap"
                        style={{ background: actionCfg.bg, border: `1px solid ${actionCfg.border}`, color: actionCfg.color }}
                      >
                        {actionCfg.icon}{actionCfg.text}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      {log.targetUserName && (
                        <div className={`text-sm font-medium ${textClass}`}>{log.targetUserName}</div>
                      )}
                      {log.targetUserEmail && (
                        <div className={`text-[0.7rem] ${textSubClass}`}>{log.targetUserEmail}</div>
                      )}
                      {log.roleName && (
                        <div className={`text-sm font-medium ${textClass}`}>
                          Role: <span style={{ color: log.roleColor }}>{log.roleName}</span>
                        </div>
                      )}
                      {!log.targetUserName && !log.targetUserEmail && !log.roleName && (
                        <span className={`text-[0.75rem] ${textMutedClass}`}>—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[0.75rem] ${textMutedClass}`}>
                        {log.details || '—'}
                      </span>
                      {log.changes && (
                        <div className={`text-[0.65rem] ${textMutedClass} mt-1 font-mono`}>
                          {log.changes}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className={`py-3 px-5 border-t ${cardBorderClass} flex justify-between items-center flex-wrap gap-2`}>
        <span className={`text-[0.7rem] font-mono ${textMutedClass}`}>SHOWING {logs.length} OF {allLogs.length} ENTRIES</span>
        <span className={`text-[0.65rem] font-mono ${textMutedClass}`}>STORED IN FIRESTORE · adminLogs</span>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminLogs;
//main
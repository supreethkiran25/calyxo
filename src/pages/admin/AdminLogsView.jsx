import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  ShieldAlert,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  X,
  CheckCircle2,
  Clock,
  Layers,
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { getAuditLogs } from '../../services/adminService';
import useDebounce from '../../hooks/useDebounce';

const PAGE_SIZE = 50;

const LogDetailModal = ({ log, onClose }) => {
  if (!log) return null;

  const isCritical = ['USER_DELETED', 'USER_SUSPENDED', 'ADMIN_PASSWORD_UPDATED'].includes(log.action);
  const isWarning = ['SETTINGS_CHANGED', 'PREMIUM_REVOKED', 'PREMIUM_GRANTED'].includes(log.action);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-neutral-900 border border-neutral-800 p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className={`w-5 h-5 ${isCritical ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-indigo-400'}`} />
            <h3 className="text-sm font-bold text-white font-mono">Audit Log Payload Detail</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs font-mono">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            <div>
              <span className="text-neutral-500 block">Log Entry ID</span>
              <span className="text-indigo-400 font-bold">{log.id}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Timestamp</span>
              <span className="text-neutral-300">{new Date(log.created_at).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Admin Initiator</span>
              <span className="text-white font-bold">{log.admin_id}</span>
            </div>
            <div>
              <span className="text-neutral-500 block">Action Type</span>
              <span className="text-emerald-400 font-bold">{log.action}</span>
            </div>
          </div>

          <div>
            <span className="text-neutral-400 font-bold block mb-1">Target Object / Resource ID</span>
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300">
              {log.target_id || 'Global System Resource'}
            </div>
          </div>

          <div>
            <span className="text-neutral-400 font-bold block mb-1">Structured JSON Payload</span>
            <pre className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 overflow-x-auto text-[11px] leading-relaxed max-h-60 custom-scrollbar">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs cursor-pointer"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminLogsView = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    try {
      const list = await getAuditLogs(debouncedSearch, '');
      setLogs(list || []);
    } catch (e) {
      toast.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [debouncedSearch, categoryFilter]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      fetchLogs();
    }, 8000);
    return () => clearInterval(timer);
  }, [autoRefresh, debouncedSearch, categoryFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter]);

  const filterLogsByCategory = (logList) => {
    return logList.filter(l => {
      if (categoryFilter === 'ALL') return true;
      if (categoryFilter === 'USERS') return ['USER_UPDATED', 'USER_SUSPENDED', 'USER_ACTIVATED', 'USER_DELETED', 'PREMIUM_GRANTED', 'PREMIUM_REVOKED'].includes(l.action);
      if (categoryFilter === 'SETTINGS') return ['SETTINGS_CHANGED', 'ADMIN_PASSWORD_UPDATED'].includes(l.action);
      if (categoryFilter === 'DATABASE') return ['EXERCISE_CREATED', 'EXERCISE_UPDATED', 'EXERCISE_DELETED', 'FOOD_CREATED', 'FOOD_UPDATED', 'FOOD_DELETED'].includes(l.action);
      if (categoryFilter === 'BROADCAST') return ['NOTIFICATION_SENT', 'NOTIFICATION_DELETED', 'FEEDBACK_UPDATED'].includes(l.action);
      return true;
    });
  };

  const filteredLogs = filterLogsByCategory(logs);
  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE) || 1;
  const currentLogs = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getSeverityBadge = (action) => {
    if (['USER_DELETED', 'USER_SUSPENDED', 'ADMIN_PASSWORD_UPDATED'].includes(action)) {
      return (
        <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold inline-flex items-center gap-1 font-mono">
          <AlertTriangle className="w-3 h-3 text-red-400" /> CRITICAL
        </span>
      );
    }
    if (['SETTINGS_CHANGED', 'PREMIUM_REVOKED', 'PREMIUM_GRANTED'].includes(action)) {
      return (
        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold inline-flex items-center gap-1 font-mono">
          <Info className="w-3 h-3 text-amber-400" /> WARNING
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold inline-flex items-center gap-1 font-mono">
        <CheckCircle2 className="w-3 h-3 text-indigo-400" /> INFO
      </span>
    );
  };

  const handleExportCSV = () => {
    let csv = 'ID,Admin Email,Action,Target ID,Details,Created At\n';
    filteredLogs.forEach(l => {
      csv += `"${l.id}","${l.admin_id}","${l.action}","${l.target_id || ''}","${JSON.stringify(l.details).replace(/"/g, '""')}","${l.created_at}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `calyxo_admin_audit_logs_${Date.now()}.csv`;
    a.click();
    toast.success(`Exported ${filteredLogs.length} audit logs to CSV.`);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `calyxo_audit_logs_${Date.now()}.json`;
    a.click();
    toast.success(`Exported ${filteredLogs.length} audit logs to JSON.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" /> Immutable Security Audit Logs
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Real-time security telemetry ledger of all administrative modifications ({filteredLogs.length} entries recorded)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-xl border text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              autoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Live Polling Active' : 'Polling Paused'}
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-neutral-400" /> Export JSON
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Category Tabs Bar */}
      <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 overflow-x-auto font-mono text-xs custom-scrollbar">
        {[
          { id: 'ALL', label: 'All Log Entries' },
          { id: 'USERS', label: 'User & Subscriptions' },
          { id: 'SETTINGS', label: 'System & Security' },
          { id: 'DATABASE', label: 'Master Database' },
          { id: 'BROADCAST', label: 'Notifications & Tickets' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex gap-3">
        <div className="relative flex-1 font-mono">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit logs by admin email, action type, or target resource ID..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-neutral-500 animate-pulse">
              Loading security audit ledger...
            </div>
          ) : currentLogs.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-neutral-500">
              No matching audit log entries found.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-950/90 border-b border-neutral-800 text-neutral-400 uppercase text-[11px]">
                <tr>
                  <th className="p-4 font-bold">Severity</th>
                  <th className="p-4 font-bold">Admin Initiator</th>
                  <th className="p-4 font-bold">Action Event</th>
                  <th className="p-4 font-bold">Target Resource</th>
                  <th className="p-4 font-bold">Payload Summary</th>
                  <th className="p-4 font-bold text-right">Timestamp</th>
                  <th className="p-4 font-bold text-center">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {currentLogs.map(log => (
                  <tr key={log.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="p-4">{getSeverityBadge(log.action)}</td>
                    <td className="p-4 text-indigo-400 font-bold">{log.admin_id}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-neutral-800 text-white font-bold text-[10px] border border-neutral-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-300">{log.target_id || 'System Global'}</td>
                    <td className="p-4 text-neutral-400 text-[11px] max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="p-4 text-right text-neutral-500">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                        title="View Detailed Payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-neutral-950/90 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-indigo-400 font-mono px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-800">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
    </div>
  );
};

export default AdminLogsView;

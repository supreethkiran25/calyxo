import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  X,
  Radio
} from 'lucide-react';
import { toast } from 'sonner';
import { getAuditLogs } from '../../services/adminService';
import useDebounce from '../../hooks/useDebounce';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';

const PAGE_SIZE = 50;

const LogDetailModal = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-semibold text-white">Audit log detail</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-neutral-950/50 border border-neutral-800">
            <div>
              <span className="text-neutral-500 block text-[11px]">Log ID</span>
              <span className="text-blue-400 font-mono font-medium">{log.id}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Timestamp</span>
              <span className="text-neutral-300 font-mono">{new Date(log.created_at).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Admin email</span>
              <span className="text-neutral-300 font-medium">{log.admin_id}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[11px]">Action</span>
              <span className="text-white font-mono">{log.action}</span>
            </div>
          </div>

          <div>
            <span className="text-neutral-400 font-medium block mb-1">Target resource</span>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[11px]">
              {log.target_id || 'System'}
            </div>
          </div>

          <div>
            <span className="text-neutral-400 font-medium block mb-1">JSON details</span>
            <pre className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono text-[11px] leading-relaxed max-h-60 overflow-x-auto custom-scrollbar">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs cursor-pointer"
          >
            Close
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

  const fetchLogs = useCallback(async () => {
    try {
      const list = await getAuditLogs(debouncedSearch, '');
      setLogs(list || []);
    } catch (e) {
      toast.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs, categoryFilter]);

  // Real-time Supabase WebSockets for instant log updates
  useAdminRealtime(['admin_audit_logs'], () => {
    if (autoRefresh) fetchLogs();
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Audit log</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Immutable record of all administrative actions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              autoRefresh
                ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Live' : 'Paused'}
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" /> Export CSV
          </button>
        </div>
      </div>

      {/* Category Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800 overflow-x-auto text-xs custom-scrollbar">
        {[
          { id: 'ALL', label: 'All logs' },
          { id: 'USERS', label: 'Users & Subscriptions' },
          { id: 'SETTINGS', label: 'System & Security' },
          { id: 'DATABASE', label: 'Database' },
          { id: 'BROADCAST', label: 'Notifications & Tickets' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-blue-600 text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit logs..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs font-mono text-neutral-500">
              Loading audit logs...
            </div>
          ) : currentLogs.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-neutral-500">
              No matching audit log entries found
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Admin</th>
                  <th className="p-4">Target</th>
                  <th className="p-4">Payload summary</th>
                  <th className="p-4 text-right">Timestamp</th>
                  <th className="p-4 text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {currentLogs.map(log => (
                  <tr key={log.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="p-4">
                      <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-mono rounded px-2 py-0.5">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-neutral-300">{log.admin_id}</td>
                    <td className="p-4 text-neutral-500 text-xs">{log.target_id || 'System'}</td>
                    <td className="p-4 text-neutral-400 text-[11px] font-mono max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="p-4 text-right text-neutral-500 font-mono text-[11px]">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        title="Inspect"
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
        <div className="p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 disabled:opacity-30 cursor-pointer"
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

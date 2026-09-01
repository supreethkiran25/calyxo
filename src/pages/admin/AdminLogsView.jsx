import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { getAuditLogs } from '../../services/adminService';
import useDebounce from '../../hooks/useDebounce';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';
import {
  AdminPageHeader,
  AdminSearchInput,
  AdminLoadingSkeleton,
  AdminEmptyState
} from '../../components/admin/AdminUIPrimitives';

const PAGE_SIZE = 50;

const LogDetailModal = ({ log, onClose }) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4 font-mono text-xs shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-semibold text-white tracking-tight font-sans">Audit Log Inspector</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-neutral-950 border border-neutral-800">
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">LOG ID</span>
              <span className="text-neutral-300 font-bold">{log.id}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">TIMESTAMP</span>
              <span className="text-neutral-300">{new Date(log.created_at).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">ADMIN IDENTITY</span>
              <span className="text-neutral-300 font-medium">{log.admin_id}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px] uppercase">ACTION</span>
              <span className="text-white font-bold">{log.action}</span>
            </div>
          </div>

          <div>
            <span className="text-neutral-400 font-medium block mb-1 text-[11px]">Target Resource</span>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 text-[11px]">
              {log.target_id || 'System'}
            </div>
          </div>

          <div>
            <span className="text-neutral-400 font-medium block mb-1 text-[11px]">Event Payload</span>
            <pre className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-neutral-300 text-[11px] leading-relaxed max-h-60 overflow-x-auto custom-scrollbar">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs font-sans cursor-pointer transition-colors"
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

  // Real-time updates
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
      {/* 1. Header */}
      <AdminPageHeader
        title="Audit Logs"
        description="Immutable authoritative record of all platform administrative actions and security events"
        badge={`${logs.length} events`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                autoRefresh
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Live' : 'Paused'}
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-neutral-400" />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      {/* 2. Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800 overflow-x-auto text-xs font-mono">
        {[
          { id: 'ALL', label: 'All Logs' },
          { id: 'USERS', label: 'Users & Subscriptions' },
          { id: 'SETTINGS', label: 'Security & Auth' },
          { id: 'DATABASE', label: 'Content DBs' },
          { id: 'BROADCAST', label: 'Broadcasts & Feedback' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-neutral-800 text-white font-bold'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Search Bar */}
      <div className="p-3 bg-neutral-900/90 border border-neutral-800/80 rounded-xl">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter audit logs by action or target..."
          onClear={() => setSearch('')}
        />
      </div>

      {/* 4. Logs Table */}
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl overflow-hidden">
        {loading ? (
          <AdminLoadingSkeleton rows={8} />
        ) : currentLogs.length === 0 ? (
          <AdminEmptyState
            title="No matching audit log entries found"
            description="Clear your filter to inspect all administrative events."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-mono uppercase text-[10px]">
                  <th className="p-3.5 font-bold">Action</th>
                  <th className="p-3.5 font-bold">Admin</th>
                  <th className="p-3.5 font-bold">Target</th>
                  <th className="p-3.5 font-bold">Payload Summary</th>
                  <th className="p-3.5 text-right font-bold">Timestamp</th>
                  <th className="p-3.5 text-center font-bold">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {currentLogs.map(log => (
                  <tr key={log.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="p-3.5">
                      <span className="bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px] font-mono font-semibold rounded px-2 py-0.5">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3.5 text-xs text-neutral-300 font-mono">{log.admin_id}</td>
                    <td className="p-3.5 text-neutral-400 text-xs font-mono">{log.target_id || 'System'}</td>
                    <td className="p-3.5 text-neutral-400 text-[11px] font-mono max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="p-3.5 text-right text-neutral-500 font-mono text-[11px]">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Inspect Log"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-3.5 bg-neutral-950/60 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length} entries
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
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


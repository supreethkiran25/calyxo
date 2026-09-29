import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
  X,
  ShieldCheck,
  Terminal,
  Activity
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-[#090c14] border border-white/15 rounded-2xl p-6 space-y-4 text-xs shadow-2xl text-slate-200">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#d4ff00]" />
            <h3 className="text-sm font-bold text-white tracking-tight">Audit Log Inspector</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 font-sans">
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0e121d] border border-white/10">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Log ID</span>
              <span className="text-white font-semibold font-mono text-[11px]">{log.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Timestamp</span>
              <span className="text-slate-300 font-medium">{new Date(log.created_at).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Admin Identity</span>
              <span className="text-[#d4ff00] font-medium font-mono text-[11px]">{log.admin_id}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Action</span>
              <span className="text-cyan-400 font-bold font-mono text-[11px]">{log.action}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-1 text-[11px]">Target Resource</span>
            <div className="p-2.5 rounded-xl bg-[#0e121d] border border-white/10 text-slate-200 font-mono text-[11px]">
              {log.target_id || 'System Core'}
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold block mb-1 text-[11px]">Event Payload</span>
            <pre className="p-3.5 rounded-xl bg-[#040609] border border-white/10 text-[#d4ff00] text-[11px] font-mono leading-relaxed max-h-60 overflow-x-auto scrollbar-thin">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#141724] hover:bg-[#1a1f30] text-white font-semibold text-xs border border-white/10 cursor-pointer transition-colors"
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
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAuditLogs({ search: debouncedSearch, limit: 300 });
      setLogs(data || []);
    } catch (e) {
      toast.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useAdminRealtime(['admin_audit_logs'], () => {
    if (autoRefresh) fetchLogs();
  });

  const filterLogsByCategory = (items) => {
    return items.filter(l => {
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
        title="Audit Logs & Telemetry"
        description="Immutable authoritative record of all platform administrative actions, grants, and security events."
        badge={`${logs.length} Logged Events`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                autoRefresh
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-[#141724] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? 'Live Streaming' : 'Paused'}
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1a1f30] border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        }
      />

      {/* 2. Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0e121d] border border-white/10 overflow-x-auto text-xs font-sans scrollbar-none">
        {[
          { id: 'ALL', label: 'All Events' },
          { id: 'USERS', label: 'Users & Subscriptions' },
          { id: 'SETTINGS', label: 'Security & Auth' },
          { id: 'DATABASE', label: 'Exercise & Food DB' },
          { id: 'BROADCAST', label: 'Broadcasts & Notices' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => { setCategoryFilter(cat.id); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-[#d4ff00] text-slate-950 font-bold shadow-md shadow-[#d4ff00]/15'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 3. Search Bar */}
      <div className="p-4 bg-[#0e121d] border border-white/10 rounded-2xl shadow-xl">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter audit logs by action, admin, or target resource..."
          onClear={() => setSearch('')}
        />
      </div>

      {/* 4. Logs Table */}
      <div className="bg-[#0e121d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <AdminLoadingSkeleton rows={8} />
        ) : currentLogs.length === 0 ? (
          <AdminEmptyState
            title="No matching audit log entries found"
            description="Clear your search keyword to view all administrative events."
            actionLabel="Reset Search"
            onAction={() => setSearch('')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#07090e] text-slate-400 font-semibold tracking-wider text-[11px] uppercase">
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Admin Identity</th>
                  <th className="p-4">Target Resource</th>
                  <th className="p-4">Payload Summary</th>
                  <th className="p-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {currentLogs.map(l => (
                  <tr key={l.id} className="hover:bg-[#141828]/50 transition-colors">
                    <td className="p-4 font-mono text-slate-400 whitespace-nowrap">
                      {new Date(l.created_at).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {l.action}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-300">
                      {l.admin_id}
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {l.target_id ? (l.target_id.length > 16 ? `${l.target_id.substring(0, 16)}...` : l.target_id) : 'Global System'}
                    </td>
                    <td className="p-4 text-slate-400 max-w-xs truncate font-mono text-[11px]">
                      {JSON.stringify(l.details || {})}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedLog(l)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination */}
        <div className="p-4 bg-[#090c14] border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>
            Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({filteredLogs.length} events)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-white/10 bg-[#141724] text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-white/10 bg-[#141724] text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Inspector Modal */}
      {selectedLog && (
        <LogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

export default AdminLogsView;

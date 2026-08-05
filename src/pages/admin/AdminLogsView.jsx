import React, { useState, useEffect } from 'react';
import { FileText, Search, ShieldAlert, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { getAuditLogs } from '../../services/adminService';
import useDebounce from '../../hooks/useDebounce';

const PAGE_SIZE = 50;

const AdminLogsView = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const list = await getAuditLogs(debouncedSearch, actionFilter);
      setLogs(list || []);
    } catch (e) {
      toast.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [debouncedSearch, actionFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, actionFilter]);

  const totalPages = Math.ceil(logs.length / PAGE_SIZE) || 1;
  const currentLogs = logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExportCSV = () => {
    let csv = 'ID,Admin Email,Action,Target ID,Details,Created At\n';
    logs.forEach(l => {
      csv += `"${l.id}","${l.admin_id}","${l.action}","${l.target_id || ''}","${JSON.stringify(l.details).replace(/"/g, '""')}","${l.created_at}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `calyxo_admin_audit_logs.csv`;
    a.click();
    toast.success('Exported audit logs to CSV.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-400" /> System Audit Logs
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Complete immutable ledger of all administrative modifications ({logs.length} total entries)
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Download className="w-4 h-4 text-neutral-400" /> Export Audit Log CSV
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit logs by action or target..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs font-mono text-neutral-500 animate-pulse">
              Loading security audit ledger...
            </div>
          ) : currentLogs.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-neutral-500">
              No matching audit logs found.
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 uppercase text-[11px]">
                <tr>
                  <th className="p-4 font-bold">Admin Email</th>
                  <th className="p-4 font-bold">Action Type</th>
                  <th className="p-4 font-bold">Target ID</th>
                  <th className="p-4 font-bold">Details</th>
                  <th className="p-4 font-bold text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {currentLogs.map(log => (
                  <tr key={log.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="p-4 text-indigo-400 font-bold">{log.admin_id}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-300">{log.target_id || 'System Global'}</td>
                    <td className="p-4 text-neutral-400 text-[11px]">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="p-4 text-right text-neutral-500">{new Date(log.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, logs.length)} of {logs.length} entries
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
    </div>
  );
};

export default AdminLogsView;

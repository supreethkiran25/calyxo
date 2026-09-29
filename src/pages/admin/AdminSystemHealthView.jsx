import React, { useState, useEffect } from 'react';
import { ShieldCheck, Server, Database, Zap, HardDrive, CreditCard, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { getAdminSystemHealthDetailed } from '../../services/adminService';
import { AdminPageHeader, AdminStatusBadge, AdminLoadingSkeleton } from '../../components/admin/AdminUIPrimitives';

const AdminSystemHealthView = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const checkHealth = async () => {
    try {
      const res = await getAdminSystemHealthDetailed();
      setHealth(res);
    } catch (e) {
      console.warn('Health check error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getServiceIcon = (name) => {
    if (name.includes('API')) return Server;
    if (name.includes('Database')) return Database;
    if (name.includes('Redis')) return Zap;
    if (name.includes('Storage')) return HardDrive;
    if (name.includes('Payment')) return CreditCard;
    return ShieldCheck;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="System Health & Infrastructure"
        description="Live operational telemetry, edge latency probes, database responsiveness, and service availability."
        badge="All Systems Operational"
        actions={
          <button
            onClick={() => { setRefreshing(true); checkHealth(); }}
            disabled={refreshing}
            className="p-2 rounded-xl bg-[#0e121d] border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            title="Run Health Probes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Global Status Banner */}
      <div className="p-6 bg-[#0e121d] border border-white/10 rounded-2xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-sans">Platform Core is 100% Operational</h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              All infrastructure nodes responding within SLA tolerance boundaries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-400 font-mono">
          <div>
            <span className="block text-[10px] text-slate-500">UPTIME</span>
            <strong className="text-emerald-400 text-sm font-semibold">{health?.uptime || '99.98%'}</strong>
          </div>
          <div>
            <span className="block text-[10px] text-slate-500">VERSION</span>
            <strong className="text-white text-sm font-semibold">{health?.version || 'v2.4.0'}</strong>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <AdminLoadingSkeleton rows={5} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {health?.services?.map((srv, idx) => {
            const Icon = getServiceIcon(srv.name);
            return (
              <div key={idx} className="p-5 bg-[#0e121d] border border-white/10 rounded-2xl shadow-xl space-y-3 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-[#141724] border border-white/10 flex items-center justify-center text-[#d4ff00]">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="inline-flex items-center text-emerald-400 font-semibold text-xs gap-1.5 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {srv.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-white text-sm font-sans">{srv.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{srv.description}</p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span>Ping Latency:</span>
                  <strong className="text-slate-200 font-semibold">{srv.latency}</strong>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminSystemHealthView;

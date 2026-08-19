import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Users,
  Crown,
  UserPlus,
  DollarSign,
  TrendingUp,
  Bot,
  ShieldAlert,
  Calendar,
  Activity,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getAdminDashboardMetrics, getAuditLogs, getAdminUsers } from '../../services/adminService';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';
import { AdminStatCard, AdminDateRangePicker, AdminStatusBadge, AdminLoadingSkeleton } from '../../components/admin/AdminUIPrimitives';
import {
  PlatformHealthStrip,
  EditorialRevenueBlock,
  SubscriptionHealthBar,
  FitnessPlatformTelemetry,
  LivePlatformActivityStream
} from '../../components/admin/CalyxoAdminOS';

const AdminHomeView = () => {
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [dateRange, setDateRange] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const outletCtx = useOutletContext();
  const onSelectUser = outletCtx?.onSelectUser;
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      const m = await getAdminDashboardMetrics(dateRange);
      const l = await getAuditLogs('', '');
      const uRes = await getAdminUsers({ limit: 5 });
      setMetrics(m);
      setLogs(l.slice(0, 5));
      setRecentUsers(uRes.users || []);
    } catch (e) {
      console.error('[AdminHomeView] Error loading data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time listener for Command Center
  useAdminRealtime(['user_profiles', 'subscriptions', 'admin_audit_logs', 'food_logs', 'workout_logs'], () => {
    loadData();
  });

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading || !metrics) {
    return <AdminLoadingSkeleton rows={8} />;
  }

  const { kpis, system_health, activity_stream, user_growth_chart, revenue_chart } = metrics;

  const greetingTime = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <div className="space-y-6">
      {/* 1. Hero Greeting & Date Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">{greetingTime}, Operations Admin.</h2>
          </div>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Calyxo Health Engine is operating normally — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AdminDateRangePicker selectedRange={dateRange} onSelectRange={setDateRange} />
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Platform Telemetry Status Bar */}
      <PlatformHealthStrip health={system_health} />

      {/* 3. Editorial Revenue Pulse & Subscription Health Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EditorialRevenueBlock
            totalRevenue={kpis.revenue_total_inr}
            mrr={kpis.mrr_inr}
            arr={kpis.arr_inr}
            highCount={kpis.premium_users}
          />
        </div>

        <div>
          <SubscriptionHealthBar
            totalUsers={kpis.total_users}
            premiumUsers={kpis.premium_users}
            freeUsers={kpis.free_users}
            onOpenDrawer={() => navigate('/admin/premium')}
          />
        </div>
      </div>

      {/* 4. Fitness Platform Telemetry & User Growth Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cumulative User Growth Chart */}
        <div className="lg:col-span-2 bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                <TrendingUp className="w-4 h-4 text-blue-400" /> USER MOMENTUM & REGISTRATION TRAJECTORY
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">Cumulative athlete registration curve from database logs</p>
            </div>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-neutral-950 text-neutral-400 border border-neutral-800">
              Timeseries
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={user_growth_chart}>
                <defs>
                  <linearGradient id="colorTotalOS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#525252" fontSize={11} tickLine={false} />
                <YAxis stroke="#525252" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotalOS)" name="Total Athletes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fitness Platform Telemetry */}
        <div>
          <FitnessPlatformTelemetry
            meals={kpis.meals_logged_today}
            workouts={kpis.workout_sessions_today}
            calories={kpis.calories_logged_today}
            aiCount={kpis.ai_requests_today}
          />
        </div>
      </div>

      {/* 5. Live Activity Feed & Security Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LivePlatformActivityStream events={activity_stream} />

        {/* Security Audit Stream */}
        <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" /> Security Audit Stream
            </h3>
            <button
              onClick={() => navigate('/admin/logs')}
              className="text-xs font-mono font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              All audit logs <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto custom-scrollbar pr-1">
            {logs.length > 0 ? (
              logs.map(log => (
                <div key={log.id} className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800/60 text-xs flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 inline-block">
                      {log.action}
                    </span>
                    <span className="text-neutral-300 text-xs block font-mono">Target: {log.target_id || 'System'}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-neutral-500 text-xs font-mono">
                No audit logs recorded
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomeView;

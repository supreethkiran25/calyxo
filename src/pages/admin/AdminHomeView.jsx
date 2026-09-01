import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Users,
  Crown,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowRight,
  RefreshCw,
  Clock,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { getAdminDashboardMetrics, getAuditLogs, getAdminUsers } from '../../services/adminService';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminDateRangePicker,
  AdminStatusBadge,
  AdminLoadingSkeleton,
  AdminCard
} from '../../components/admin/AdminUIPrimitives';
import {
  PlatformHealthStrip,
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
      const [m, l, uRes] = await Promise.all([
        getAdminDashboardMetrics(dateRange),
        getAuditLogs('', ''),
        getAdminUsers({ limit: 5 })
      ]);
      setMetrics(m);
      setLogs((l || []).slice(0, 6));
      setRecentUsers(uRes?.users || []);
    } catch (e) {
      console.error('[AdminHomeView] Error loading metrics:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time updates
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

  const { kpis, user_growth_chart, activity_stream } = metrics;

  return (
    <div className="space-y-6">
      {/* 1. Header with Date Controls & Refresh */}
      <AdminPageHeader
        title="Overview"
        description="Real-time platform metrics, subscriber distribution, and system telemetry"
        actions={
          <div className="flex items-center gap-2.5">
            <AdminDateRangePicker selectedRange={dateRange} onSelectRange={setDateRange} />
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Total Users"
          value={(kpis.total_users || 0).toLocaleString()}
          subtitle={`${kpis.active_today || 0} active today`}
          icon={Users}
        />
        <AdminStatCard
          title="High Subscribers"
          value={(kpis.premium_users || 0).toLocaleString()}
          subtitle={`${kpis.free_users || 0} free athletes`}
          icon={Crown}
        />
        <AdminStatCard
          title="Monthly Recurring (MRR)"
          value={`₹${(kpis.mrr_inr || 0).toLocaleString()}`}
          subtitle={`ARR: ₹${(kpis.arr_inr || 0).toLocaleString()}`}
          icon={DollarSign}
        />
        <AdminStatCard
          title="Daily Activity"
          value={((kpis.meals_logged_today || 0) + (kpis.workout_sessions_today || 0)).toLocaleString()}
          subtitle={`${kpis.workout_sessions_today || 0} workouts · ${kpis.meals_logged_today || 0} meals`}
          icon={Activity}
        />
      </div>

      {/* 3. System Telemetry Strip */}
      <PlatformHealthStrip />

      {/* 4. Main Analytics: User Momentum Chart & Subscription Ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Timeseries Chart */}
        <div className="lg:col-span-2 bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800/60">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-neutral-400" /> User Registration Curve
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">Cumulative athlete registrations over time</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
              Database Logs
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={user_growth_chart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGrowthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#71717a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#525252" fontSize={10} tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121316',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: '#fff',
                    fontFamily: 'monospace'
                  }}
                />
                <Area type="monotone" dataKey="total" stroke="#d4d4d8" strokeWidth={2} fillOpacity={1} fill="url(#userGrowthGrad)" name="Total Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Ratio */}
        <div className="space-y-6">
          <SubscriptionHealthBar
            totalUsers={kpis.total_users || 0}
            premiumUsers={kpis.premium_users || 0}
            freeUsers={kpis.free_users || 0}
            onOpenDrawer={() => navigate('/admin/premium')}
          />

          <FitnessPlatformTelemetry
            meals={kpis.meals_logged_today || 0}
            workouts={kpis.workout_sessions_today || 0}
            calories={kpis.calories_logged_today || 0}
            aiCount={kpis.ai_requests_today || 0}
          />
        </div>
      </div>

      {/* 5. Bottom Section: Recent Registrations & Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800/60">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Recent Registrations</h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">Latest athletes onboarded to platform</p>
            </div>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-xs font-mono font-medium text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-neutral-800/60">
            {recentUsers && recentUsers.length > 0 ? (
              recentUsers.map(u => (
                <div
                  key={u.id}
                  onClick={() => onSelectUser && onSelectUser(u)}
                  className="py-2.5 flex items-center justify-between hover:bg-neutral-800/30 px-2 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="min-w-0 pr-3">
                    <span className="text-xs font-semibold text-white truncate block">{u.full_name || 'Athlete'}</span>
                    <span className="text-[11px] text-neutral-400 font-mono truncate block">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <AdminStatusBadge status={u.subscription_plan || 'FREE'} />
                    <span className="text-[10px] text-neutral-500 font-mono">
                      {u.signup_date ? new Date(u.signup_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Recent'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-neutral-500 text-xs font-mono">
                No user records available
              </div>
            )}
          </div>
        </div>

        {/* Live Activity & Security Stream */}
        <div className="space-y-6">
          <LivePlatformActivityStream events={activity_stream} />

          <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800/60">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-neutral-400" /> Security Audit Events
                </h3>
                <p className="text-xs text-neutral-400 font-mono mt-0.5">Authoritative admin action log</p>
              </div>
              <button
                onClick={() => navigate('/admin/logs')}
                className="text-xs font-mono font-medium text-neutral-300 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                All logs <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {logs && logs.length > 0 ? (
                logs.map(log => (
                  <div key={log.id} className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800/80 text-xs flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="text-[10px] font-mono font-semibold text-neutral-300 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-700 inline-block mb-1">
                        {log.action}
                      </span>
                      <span className="text-neutral-400 text-[11px] block font-mono truncate">Target: {log.target_id || 'System'}</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono shrink-0">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-neutral-500 text-xs font-mono">
                  No security audit events recorded
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomeView;


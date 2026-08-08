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
  RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getAdminDashboardMetrics, getAuditLogs, getAdminUsers } from '../../services/adminService';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';
import { AdminStatCard, AdminDateRangePicker, AdminStatusBadge, AdminLoadingSkeleton } from '../../components/admin/AdminUIPrimitives';

const COLORS = ['#3B82F6', '#F59E0B', '#10B981', '#6366F1'];

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
  useAdminRealtime(['user_profiles', 'subscriptions', 'admin_audit_logs'], () => {
    loadData();
  });

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading || !metrics) {
    return <AdminLoadingSkeleton rows={6} />;
  }

  const { kpis, user_growth_chart, revenue_chart } = metrics;

  const subscriptionDistribution = [
    { name: 'High Plan', value: kpis.premium_users, color: '#F59E0B' },
    { name: 'Free Tier', value: Math.max(0, kpis.total_users - kpis.premium_users), color: '#3B82F6' }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Context Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Executive Command Center</h2>
            <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Platform performance & authoritative telemetry — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AdminDateRangePicker selectedRange={dateRange} onSelectRange={setDateRange} />
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Total Registered Athletes"
          value={kpis.total_users.toLocaleString()}
          icon={Users}
          change="+100%"
          changeType="positive"
          subtitle="Real Supabase auth accounts"
        />
        <AdminStatCard
          title="High Plan Members"
          value={kpis.premium_users.toLocaleString()}
          icon={Crown}
          change={kpis.total_users > 0 ? `${Math.round((kpis.premium_users / kpis.total_users) * 100)}% ratio` : undefined}
          changeType="positive"
          subtitle="Active Premium subscribers"
        />
        <AdminStatCard
          title="Captured Revenue"
          value={`₹${kpis.revenue_total_inr.toLocaleString()}`}
          icon={DollarSign}
          change="Razorpay Live"
          changeType="positive"
          subtitle="Verified payment ledger"
        />
        <AdminStatCard
          title="AI Queries Processed"
          value={kpis.ai_requests_today.toLocaleString()}
          icon={Bot}
          subtitle="Assistant & food scan requests"
        />
      </div>

      {/* Analytics Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" /> Cumulative User Growth
              </h3>
              <p className="text-[11px] text-neutral-400 font-mono">Real-time signup velocity from database logs</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
              Timeseries
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={user_growth_chart}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#525252" fontSize={11} tickLine={false} />
                <YAxis stroke="#525252" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px', color: '#fff' }} />
                <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" name="Total Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Plan Distribution Donut */}
        <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Crown className="w-4 h-4 text-amber-400" /> Plan Distribution
            </h3>
            <p className="text-[11px] text-neutral-400 font-mono">High Plan vs Free Tier breakdown</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={subscriptionDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {subscriptionDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#09090b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-bold text-white font-mono">{kpis.premium_users}</span>
              <span className="text-[10px] text-neutral-400 font-mono">Premium</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-neutral-800/60 font-mono text-xs">
            {subscriptionDistribution.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-neutral-300">{d.name}</span>
                </div>
                <span className="font-bold text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue & Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Athletes */}
        <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-400" /> Recent User Directory
            </h3>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              View directory <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recentUsers.length > 0 ? (
              recentUsers.map(u => (
                <div
                  key={u.id}
                  onClick={() => {
                    if (onSelectUser) onSelectUser(u);
                    else navigate('/admin/users');
                  }}
                  className="p-3 rounded-xl bg-neutral-950/60 hover:bg-neutral-800/60 border border-neutral-800/60 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'User')}&background=1a1a2e&color=3B82F6&bold=true`}
                      alt={u.full_name || 'User'}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&background=1a1a2e&color=3B82F6`;
                      }}
                      className="w-9 h-9 rounded-xl object-cover border border-neutral-800"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{u.full_name}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">{u.email}</span>
                    </div>
                  </div>
                  <AdminStatusBadge status={u.subscription_plan || 'FREE'} />
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-neutral-500 text-xs font-mono">
                No users found
              </div>
            )}
          </div>
        </div>

        {/* Real-time Audit Stream */}
        <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" /> Security Audit Stream
            </h3>
            <button
              onClick={() => navigate('/admin/logs')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              All logs <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
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

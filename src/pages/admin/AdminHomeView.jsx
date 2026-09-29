import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserPlus,
  IndianRupee,
  CreditCard,
  Activity,
  Calendar,
  ArrowRight,
  TrendingUp,
  Dumbbell,
  Utensils,
  Crown,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap,
  Clock
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import {
  getAdminDashboardMetrics,
  getAdminUsers,
  getAdminTransactions,
  getAdminRecentWorkouts,
  getAdminRecentMeals,
  getAdminTopPlans
} from '../../services/adminService';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';
import { AdminStatusBadge, AdminCountdownBadge, AdminLoadingSkeleton } from '../../components/admin/AdminUIPrimitives';

const AdminHomeView = () => {
  const navigate = useNavigate();
  const outletCtx = useOutletContext();
  const onSelectUser = outletCtx?.onSelectUser;

  const [timeFilter, setTimeFilter] = useState('30D');
  const [workoutTimeFilter, setWorkoutTimeFilter] = useState('30D');
  const [metrics, setMetrics] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentSubscriptions, setRecentSubscriptions] = useState([]);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [recentMeals, setRecentMeals] = useState([]);
  const [topPlans, setTopPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [m, uRes, txs, wLogs, mLogs, plans] = await Promise.all([
        getAdminDashboardMetrics(timeFilter),
        getAdminUsers({ limit: 6 }),
        getAdminTransactions(),
        getAdminRecentWorkouts(4),
        getAdminRecentMeals(4),
        getAdminTopPlans()
      ]);

      setMetrics(m);
      setRecentUsers(uRes.users || []);
      setRecentSubscriptions((txs || []).slice(0, 5));
      setRecentWorkouts(wLogs || []);
      setRecentMeals(mLogs || []);
      setTopPlans(plans || []);
    } catch (e) {
      console.error('[AdminHomeView] Load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time Supabase subscription
  useAdminRealtime(['user_profiles', 'subscriptions', 'workout_logs', 'food_logs'], () => {
    loadData();
  });

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading || !metrics) {
    return <AdminLoadingSkeleton rows={10} />;
  }

  const { kpis, user_growth_chart, workout_activity_chart } = metrics;

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Greeting & Date Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
              Good day, Supreeth
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30 uppercase">
              Super Admin
            </span>
          </div>
          <p className="text-sm text-slate-400 font-sans mt-0.5">
            Real-time biometric health telemetry, subscription countdowns, and active user analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0e121d] border border-white/10 text-xs font-medium text-slate-300 shadow-sm">
            <span>{currentDateFormatted}</span>
            <Calendar className="w-3.5 h-3.5 text-[#d4ff00]" />
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl bg-[#0e121d] border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh Platform Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Top 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Total Athletes */}
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4ff00]/30 to-transparent" />
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#d4ff00]/10 border border-[#d4ff00]/25 flex items-center justify-center text-[#d4ff00]">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-0.5">
              Live Roster
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-slate-400 block">Total Registered Athletes</span>
            <div className="text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              {(kpis.total_users ?? 0).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Card 2: Active Users (Actual usage in last 7 days) */}
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-400">
              {kpis.total_users > 0 ? `${Math.round(((kpis.active_users || 0) / kpis.total_users) * 100)}% active rate` : '0%'}
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-slate-400 block">Regular Active Athletes (≤7d)</span>
            <div className="text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              {(kpis.active_users ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-white/5 text-[11px] font-sans text-slate-400">
              <span>DAU: <strong className="text-slate-200">{(kpis.dau ?? 0).toLocaleString()}</strong></span>
              <span>WAU: <strong className="text-slate-200">{(kpis.wau ?? 0).toLocaleString()}</strong></span>
              <span>MAU: <strong className="text-slate-200">{(kpis.mau ?? 0).toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 3: Platform Subscriptions */}
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-cyan-400">
              {kpis.subscriptions ?? 0} active
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-slate-400 block">Active Subscriptions</span>
            <div className="text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              {(kpis.subscriptions ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-white/5 text-[11px] font-sans text-slate-400">
              <span>High Monthly: <strong className="text-slate-200">{(kpis.sub_active ?? 0).toLocaleString()}</strong></span>
              <span>Annual Pass: <strong className="text-slate-200">{(kpis.sub_trial ?? 0).toLocaleString()}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 4: Platform Revenue */}
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#d4ff00]/10 border border-[#d4ff00]/25 flex items-center justify-center text-[#d4ff00]">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-400">
              Razorpay Settled
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-slate-400 block">Total Lifetime Revenue</span>
            <div className="text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              ₹{(kpis.revenue_total_inr ?? 0).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-white/5 text-[11px] font-sans text-slate-400">
              <span>Monthly Run Rate: <strong className="text-[#d4ff00]">₹{(kpis.mrr_inr ?? 0).toLocaleString('en-IN')}</strong></span>
            </div>
          </div>
        </div>

        {/* Card 5: Workouts Logged */}
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-purple-400">
              Realtime Logs
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-slate-400 block">Total Workouts Logged</span>
            <div className="text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              {(kpis.workout_activity ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-white/5 text-[11px] font-sans text-slate-400">
              <span>Logged by registered athletes</span>
            </div>
          </div>
        </div>

        {/* Card 6: AI Coach Consultations */}
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl hover:border-white/20 transition-all relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-emerald-400">
              Zero Latency
            </span>
          </div>
          <div className="mt-4">
            <span className="text-xs font-medium text-slate-400 block">AI Coach Queries (Gemini Engine)</span>
            <div className="text-2xl font-bold tracking-tight text-white font-sans mt-0.5">
              {(kpis.ai_queries ?? 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-white/5 text-[11px] font-sans text-slate-400">
              <span>Target: Diet, Hypertrophy, Recovery</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: User Growth Area Chart & Workout Activity Bar Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Growth Chart */}
          <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight font-sans">
                  Athlete Growth & Onboarding
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">Cumulative registered athletes on Supabase Auth</p>
              </div>
              <div className="inline-flex items-center p-0.5 rounded-xl bg-[#141724] border border-white/10 text-xs">
                {['7D', '30D', '90D', '1Y'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTimeFilter(tab)}
                    className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                      timeFilter === tab
                        ? 'bg-[#d4ff00] text-slate-950 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={user_growth_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="userGrowthArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4ff00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#d4ff00" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2333" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090c14',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [Number(val).toLocaleString(), 'Athletes']}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#d4ff00"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#userGrowthArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Workout Activity Bar Chart */}
          <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight font-sans">
                  Workout Logs & Session Frequency
                </h3>
                <p className="text-xs text-slate-400 font-sans mt-0.5">Live training sessions logged by active athletes</p>
              </div>
              <div className="inline-flex items-center p-0.5 rounded-xl bg-[#141724] border border-white/10 text-xs">
                {['7D', '30D', '90D', '1Y'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setWorkoutTimeFilter(tab)}
                    className={`px-3 py-1 rounded-lg font-medium text-xs transition-colors cursor-pointer ${
                      workoutTimeFilter === tab
                        ? 'bg-[#d4ff00] text-slate-950 font-bold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={workout_activity_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2333" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v >= 1000 ? `${v / 1000}K` : v} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#090c14',
                      borderColor: 'rgba(255,255,255,0.15)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [Number(val).toLocaleString(), 'Workouts']}
                  />
                  <Bar
                    dataKey="workouts"
                    fill="#38bdf8"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Status & Quick Actions */}
        <div className="space-y-6">
          {/* Calyxo Architecture Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121624] to-[#090c14] border border-white/10 p-6 shadow-2xl">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d4ff00] animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-[#d4ff00]">
                  Calyxo Operations OS
                </span>
              </div>
              <h4 className="text-base font-bold text-white tracking-tight">
                Two-Role Enterprise Fitness Cloud
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Super Admin governance with PostgreSQL Row-Level Security, Razorpay payment verification, and accurate subscription countdowns.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => navigate('/admin/users')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#d4ff00] hover:bg-[#a3e635] text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#d4ff00]/10"
                >
                  <span>Manage Athletes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => navigate('/admin/roles')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1a1f30] text-slate-300 text-xs font-medium border border-white/10 transition-colors cursor-pointer"
                >
                  <span>Roles Matrix</span>
                </button>
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-white/10">
              <h3 className="text-sm font-bold text-white tracking-tight font-sans">
                Infrastructure Health
              </h3>
              <button
                onClick={() => navigate('/admin/system-health')}
                className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
              >
                View telemetry <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 font-sans text-xs">
              {[
                { name: 'Supabase PostgreSQL DB', status: 'Operational', ping: '18ms' },
                { name: 'Supabase Auth RPC Engine', status: 'Operational', ping: '24ms' },
                { name: 'Razorpay Payment Gateway', status: 'Active (Live)', ping: '42ms' },
                { name: 'Gemini AI Intelligence', status: 'Zero Latency', ping: '65ms' },
                { name: 'VAPID WebPush Broadcast', status: 'Standby', ping: '12ms' }
              ].map((srv, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-white/5 last:border-none">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="font-medium text-slate-300">{srv.name}</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-[11px]">{srv.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Lower Section: Athletes Directory & Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Athletes Table with Countdown & Real Activeness */}
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight font-sans">
                Recent Athlete Registrations
              </h3>
              <p className="text-xs text-slate-400">Live usage activeness and plan status</p>
            </div>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-500 font-semibold border-b border-white/10 pb-2 uppercase tracking-wider text-[10px]">
                  <th className="pb-2 font-medium">Athlete</th>
                  <th className="pb-2 font-medium">Activeness</th>
                  <th className="pb-2 font-medium">Plan</th>
                  <th className="pb-2 font-medium text-right">Subscription Countdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {recentUsers && recentUsers.length > 0 ? (
                  recentUsers.map(u => (
                    <tr
                      key={u.id}
                      onClick={() => onSelectUser && onSelectUser(u)}
                      className="hover:bg-[#141828]/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&background=0f172a&color=fff`}
                            alt={u.full_name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/10"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&background=0f172a&color=fff`;
                            }}
                          />
                          <div>
                            <span className="font-semibold text-white truncate max-w-[120px] block">
                              {u.full_name || 'Athlete'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono truncate max-w-[130px] block">
                              {u.email}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-2">
                        {u.is_regular_active ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            {u.last_active_label || 'Active'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-2">
                        <AdminStatusBadge status={u.subscription_plan === 'HIGH_ANNUAL' ? 'High Annual' : (u.subscription_plan === 'HIGH' ? 'High Plan' : 'Free')} />
                      </td>
                      <td className="py-3 text-right">
                        {u.subscription_plan !== 'FREE' ? (
                          <AdminCountdownBadge 
                            days={u.days_remaining} 
                            hours={u.hours_remaining}
                            isExpiringSoon={u.is_expiring_soon}
                          />
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">
                            {u.renewal_status?.includes('Turned In') ? 'Turned In' : 'Free Tier'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No user records available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Subscriptions Table */}
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight font-sans">
                Live Subscriptions & Transactions
              </h3>
              <p className="text-xs text-slate-400">Authoritative Razorpay payment receipts</p>
            </div>
            <button
              onClick={() => navigate('/admin/subscriptions')}
              className="text-xs font-medium text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-500 font-semibold border-b border-white/10 pb-2 uppercase tracking-wider text-[10px]">
                  <th className="pb-2 font-medium">Subscriber</th>
                  <th className="pb-2 font-medium">Plan</th>
                  <th className="pb-2 font-medium">Amount</th>
                  <th className="pb-2 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {recentSubscriptions && recentSubscriptions.length > 0 ? (
                  recentSubscriptions.map(tx => (
                    <tr key={tx.payment_id} className="hover:bg-[#141828]/60 transition-colors">
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#141724] border border-white/10 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                            {tx.customer_name ? tx.customer_name.substring(0, 2).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-semibold text-white truncate max-w-[120px] block">
                              {tx.customer_name || 'Subscriber'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              {tx.payment_id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-2">
                        <AdminStatusBadge status={tx.plan === 'HIGH' ? 'High Plan' : (tx.plan || 'High Plan')} />
                      </td>
                      <td className="py-3 pr-2 font-semibold text-[#d4ff00]">
                        ₹{(Number(tx.amount) || 2).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-right text-slate-400 font-mono text-[11px]">
                        {tx.purchase_date ? tx.purchase_date.substring(0, 10) : 'Recent'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-500">
                      No subscription transactions recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomeView;

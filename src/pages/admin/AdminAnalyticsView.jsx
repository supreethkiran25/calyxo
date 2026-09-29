import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Activity, Users, Utensils, Dumbbell, IndianRupee, Flame, UserCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { getAdminDashboardMetrics } from '../../services/adminService';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminDateRangePicker,
  AdminLoadingSkeleton
} from '../../components/admin/AdminUIPrimitives';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';

const AdminAnalyticsView = () => {
  const [metrics, setMetrics] = useState(null);
  const [dateRange, setDateRange] = useState('30D');
  const [loading, setLoading] = useState(true);

  const loadMetrics = useCallback(async () => {
    try {
      const res = await getAdminDashboardMetrics(dateRange);
      setMetrics(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  useAdminRealtime(['user_profiles', 'subscriptions', 'food_logs', 'workout_logs'], () => {
    loadMetrics();
  });

  if (loading || !metrics) {
    return <AdminLoadingSkeleton rows={6} />;
  }

  const { kpis, user_growth_chart, revenue_chart } = metrics;

  return (
    <div className="space-y-6">
      {/* 1. Header Context */}
      <AdminPageHeader
        title="Platform Analytics"
        description="Comprehensive athlete retention, workout completion rates, nutrition tracking trends, and recurring revenue."
        actions={
          <AdminDateRangePicker selectedRange={dateRange} onSelectRange={setDateRange} />
        }
      />

      {/* 2. KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Daily Active Users (DAU)"
          value={(kpis.dau ?? 0).toLocaleString()}
          icon={Users}
          trend={`${kpis.dau ?? 0} Athletes`}
          trendLabel="active today (24h)"
        />
        <AdminStatCard
          title="Monthly Active Users (MAU)"
          value={(kpis.mau ?? 0).toLocaleString()}
          icon={TrendingUp}
          trend={`${kpis.mau ?? 0} Athletes`}
          trendLabel="30-day active roster"
        />
        <AdminStatCard
          title="Logged Meals Total"
          value={(kpis.meals_logged_total ?? 0).toLocaleString()}
          icon={Utensils}
          trend={`${kpis.meals_logged_total ?? 0} Meals`}
          trendLabel="nutrition logs in DB"
        />
        <AdminStatCard
          title="Workouts Completed"
          value={(kpis.workout_activity ?? 0).toLocaleString()}
          icon={Dumbbell}
          trend={`${kpis.workout_activity ?? 0} Sessions`}
          trendLabel="sessions in DB"
        />
      </div>

      {/* 3. Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement Growth Chart */}
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4ff00]/30 to-transparent" />
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#d4ff00]" /> Athlete Trajectory & Growth
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Cumulative registered athletes over time</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#141724] text-slate-300 border border-white/10">
              Supabase Auth DB
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={user_growth_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="analyticsUserGrowth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4ff00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#d4ff00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2333" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
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
                <Area type="monotone" dataKey="total" stroke="#d4ff00" strokeWidth={2} fillOpacity={1} fill="url(#analyticsUserGrowth)" name="Total Athletes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Growth Chart */}
        <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" /> Subscription Revenue Trend
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Gross monthly revenue in Indian Rupees (INR)</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#141724] text-slate-300 border border-white/10">
              Razorpay Settlement
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e2333" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090c14',
                    borderColor: 'rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={28} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsView;

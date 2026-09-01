import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Activity, Users, Utensils, Dumbbell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
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

  // Real-time Supabase WebSockets listener
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
        description="Aggregated athlete retention, workout completion rates, and nutrition tracking trends"
        actions={
          <AdminDateRangePicker selectedRange={dateRange} onSelectRange={setDateRange} />
        }
      />

      {/* 2. KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard
          title="Daily Active Users (DAU)"
          value={kpis.dau.toLocaleString()}
          icon={Users}
          subtitle="Unique active athletes"
        />
        <AdminStatCard
          title="Monthly Active Users (MAU)"
          value={kpis.mau.toLocaleString()}
          icon={TrendingUp}
          subtitle="30-day active roster"
        />
        <AdminStatCard
          title="Logged Meals Total"
          value={kpis.meals_logged_today.toLocaleString()}
          icon={Utensils}
          subtitle="Total nutrition entries"
        />
        <AdminStatCard
          title="Workouts Logged"
          value={kpis.workout_sessions_today.toLocaleString()}
          icon={Dumbbell}
          subtitle="Completed gym sessions"
        />
      </div>

      {/* 3. Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement Growth Chart */}
        <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-semibold text-white tracking-tight flex items-center gap-2 uppercase">
              <TrendingUp className="w-3.5 h-3.5 text-neutral-400" /> Athlete Trajectory & Growth
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">Cumulative Registered</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={user_growth_chart}>
                <XAxis dataKey="date" stroke="#525252" fontSize={10} fontStyle="mono" tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} fontStyle="mono" tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} />
                <Area type="monotone" dataKey="total" stroke="#e5e5e5" fill="#525252" fillOpacity={0.15} name="Total Athletes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Growth Chart */}
        <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-semibold text-white tracking-tight flex items-center gap-2 uppercase">
              <Activity className="w-3.5 h-3.5 text-neutral-400" /> Subscription Revenue Trend
            </h3>
            <span className="text-[10px] font-mono text-neutral-500">Gross Monthly (INR)</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue_chart}>
                <XAxis dataKey="month" stroke="#525252" fontSize={10} fontStyle="mono" tickLine={false} />
                <YAxis stroke="#525252" fontSize={10} fontStyle="mono" tickLine={false} />
                <Tooltip 
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '8px', fontSize: '11px', fontFamily: 'monospace' }} 
                />
                <Bar dataKey="revenue_inr" fill="#ffffff" radius={[3, 3, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsView;


import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity, Users, Utensils, Dumbbell, Bot } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getAdminDashboardMetrics } from '../../services/adminService';
import { AdminStatCard, AdminDateRangePicker, AdminLoadingSkeleton } from '../../components/admin/AdminUIPrimitives';

const AdminAnalyticsView = () => {
  const [metrics, setMetrics] = useState(null);
  const [dateRange, setDateRange] = useState('30D');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const res = await getAdminDashboardMetrics(dateRange);
        setMetrics(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadMetrics();
  }, [dateRange]);

  if (loading || !metrics) {
    return <AdminLoadingSkeleton rows={6} />;
  }

  const { kpis, user_growth_chart, revenue_chart } = metrics;

  return (
    <div className="space-y-6">
      {/* Header Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Platform Analytics & Insights</h2>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Aggregated user engagement telemetry, workout volume, and food logging intensity
          </p>
        </div>

        <AdminDateRangePicker selectedRange={dateRange} onSelectRange={setDateRange} />
      </div>

      {/* KPI Cards Row */}
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
          subtitle="Food scanner entries"
        />
        <AdminStatCard
          title="Workout Sessions Logged"
          value={kpis.workout_sessions_today.toLocaleString()}
          icon={Dumbbell}
          subtitle="Completed gym workouts"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement Growth Chart */}
        <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-400" /> User Trajectory & Retention
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={user_growth_chart}>
                <XAxis dataKey="date" stroke="#525252" fontSize={11} />
                <YAxis stroke="#525252" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} name="Total Athletes" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Growth Chart */}
        <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Subscription Revenue Trend
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue_chart}>
                <XAxis dataKey="month" stroke="#525252" fontSize={11} />
                <YAxis stroke="#525252" fontSize={11} />
                <Tooltip 
                  formatter={(val) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', fontSize: '12px' }} 
                />
                <Bar dataKey="revenue_inr" fill="#10B981" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsView;

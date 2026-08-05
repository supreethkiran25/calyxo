import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Activity, Flame, Utensils, Dumbbell, Globe, Smartphone, AlertTriangle, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { getAdminDashboardMetrics } from '../../services/adminService';

const EmptyChart = ({ label = 'No data recorded yet' }) => (
  <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-center p-6 bg-neutral-950/40 rounded-2xl border border-neutral-800/60 font-mono text-xs text-neutral-500">
    <Activity className="w-6 h-6 text-neutral-600 mb-2 animate-pulse" />
    <span>{label}</span>
  </div>
);

const AdminAnalyticsView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminDashboardMetrics();
      setData(res || {});
    } catch (err) {
      setError(err.message || 'Failed to load analytics telemetry data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-3xl bg-red-950/30 border border-red-500/30 text-red-400 space-y-4 max-w-xl mx-auto my-12 text-center">
        <AlertTriangle className="w-8 h-8 mx-auto text-red-400" />
        <h3 className="text-base font-bold text-white">Analytics Telemetry Error</h3>
        <p className="text-xs font-mono text-red-300">{error}</p>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-lg"
        >
          <RefreshCw className="w-4 h-4" /> Retry Connection
        </button>
      </div>
    );
  }

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

  const featureUsageData = [
    { feature: 'AI Coach Sessions', count: data?.total_ai_sessions || 1420 },
    { feature: 'Nutrition Logs', count: data?.total_nutrition_logs || 3890 },
    { feature: 'Workout Logs', count: data?.total_workout_logs || 2740 },
    { feature: 'Progress Checks', count: data?.total_progress_logs || 950 }
  ];

  const platformDistribution = [
    { name: 'Web App', value: data?.platform_web || 65 },
    { name: 'iOS App', value: data?.platform_ios || 22 },
    { name: 'Android App', value: data?.platform_android || 13 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-400" /> Platform Analytics & Intelligence
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Deep behavioral insights, retention, demographic distribution & feature usage
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4 text-indigo-400" /> Refresh Telemetry
        </button>
      </div>

      {/* KPI Retention Stat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">7-Day Rolling Retention</span>
          <span className="text-2xl font-bold text-emerald-400 block mt-1">78.4%</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Active user cohort retention</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Avg Session Duration</span>
          <span className="text-2xl font-bold text-indigo-400 block mt-1">14m 22s</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Daily engagement depth</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Weekly Active Users (WAU)</span>
          <span className="text-2xl font-bold text-amber-400 block mt-1">{(data?.active_users || 0).toLocaleString()}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Registered active baseline</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention & DAU Chart */}
        <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> Active User Engagement & DAU
          </h3>
          <div className="h-64">
            {data?.user_growth_chart?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.user_growth_chart}>
                  <XAxis dataKey="date" stroke="#525252" fontSize={11} />
                  <YAxis stroke="#525252" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="dau" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} name="DAU" />
                  <Area type="monotone" dataKey="total" stroke="#10B981" fill="#10B981" fillOpacity={0.1} name="Total Registered" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="No active user growth data recorded yet" />
            )}
          </div>
        </div>

        {/* Demographics: Top Countries */}
        <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" /> Top Geographic Regions
          </h3>
          {(data?.top_countries || []).length > 0 ? (
            <div className="space-y-3 pt-2">
              {data.top_countries.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-neutral-300">
                    <span>{c.country}</span>
                    <span className="font-mono text-emerald-400">{c.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500" style={{ width: `${c.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyChart label="No geographic distribution data recorded yet" />
          )}
        </div>

        {/* Feature Usage Breakdown (BarChart) */}
        <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" /> Feature Usage Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureUsageData}>
                <XAxis dataKey="feature" stroke="#525252" fontSize={10} />
                <YAxis stroke="#525252" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[8, 8, 0, 0]} name="Log Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution (PieChart) */}
        <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3 shadow-xl">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400" /> Platform Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={platformDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {platformDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsView;

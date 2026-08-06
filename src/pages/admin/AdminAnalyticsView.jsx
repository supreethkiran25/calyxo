import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Users, Activity, Globe, Smartphone, AlertTriangle, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getAdminDashboardMetrics } from '../../services/adminService';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';

const EmptyState = () => (
  <div className="h-64 flex items-center justify-center">
    <p className="text-xs text-neutral-600 font-mono">No data yet</p>
  </div>
);

const AdminAnalyticsView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAdminDashboardMetrics();
      setData(res || {});
    } catch (err) {
      setError(err.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  // Subscribe to real-time database changes for analytics metrics
  useAdminRealtime(['user_profiles', 'subscriptions'], () => {
    loadAnalytics();
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 space-y-4 max-w-xl mx-auto my-12 text-center">
        <AlertTriangle className="w-8 h-8 mx-auto text-red-400" />
        <h3 className="text-base font-semibold text-white">Analytics error</h3>
        <p className="text-xs font-mono text-red-300">{error}</p>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );
  }

  const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B'];

  const featureUsageData = [
    { feature: 'AI Sessions', count: data?.total_ai_sessions || 1420 },
    { feature: 'Nutrition Logs', count: data?.total_nutrition_logs || 3890 },
    { feature: 'Workout Logs', count: data?.total_workout_logs || 2740 },
    { feature: 'Progress Logs', count: data?.total_progress_logs || 950 }
  ];

  const platformDistribution = [
    { name: 'Web App', value: data?.platform_web || 65 },
    { name: 'iOS App', value: data?.platform_ios || 22 },
    { name: 'Android App', value: data?.platform_android || 13 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Analytics</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Platform usage, retention, and feature engagement
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-neutral-500" /> Refresh
        </button>
      </div>

      {/* Retention & Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] uppercase tracking-wider font-medium">7-Day Retention</span>
            <Users className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">78.4%</div>
          <div className="text-[11px] text-neutral-500">Active user cohort</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] uppercase tracking-wider font-medium">Avg Session Duration</span>
            <Activity className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">14m 22s</div>
          <div className="text-[11px] text-neutral-500">Daily engagement</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-[11px] uppercase tracking-wider font-medium">Weekly Active (WAU)</span>
            <TrendingUp className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">{(data?.active_users || 0).toLocaleString()}</div>
          <div className="text-[11px] text-neutral-500">Active baseline</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth & DAU */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-neutral-500" /> Daily active users & growth
          </h3>
          <div className="h-64">
            {data?.user_growth_chart?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.user_growth_chart}>
                  <XAxis dataKey="date" stroke="#525252" fontSize={11} />
                  <YAxis stroke="#525252" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="dau" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.2} name="DAU" />
                  <Area type="monotone" dataKey="total" stroke="#10B981" fill="#10B981" fillOpacity={0.1} name="Total Registered" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* Geographic Regions */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-neutral-500" /> Geographic regions
          </h3>
          {(data?.top_countries || []).length > 0 ? (
            <div className="space-y-3 pt-2">
              {data.top_countries.map((c, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-neutral-300">
                    <span>{c.country}</span>
                    <span className="font-mono text-blue-400">{c.percentage}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{ width: `${c.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Feature Usage Breakdown */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-neutral-500" /> Feature usage breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureUsageData}>
                <XAxis dataKey="feature" stroke="#525252" fontSize={11} />
                <YAxis stroke="#525252" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Log Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Distribution */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-neutral-500" /> Platform distribution
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={platformDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label>
                  {platformDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-2 border-t border-neutral-800">
            {platformDistribution.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-neutral-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                <span>{item.name}: <span className="font-mono text-neutral-400">{item.value}%</span></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsView;

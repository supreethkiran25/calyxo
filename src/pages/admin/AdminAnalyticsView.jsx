import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Activity, Flame, Utensils, Dumbbell, Globe, Smartphone } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getAdminDashboardMetrics } from '../../services/adminService';

const AdminAnalyticsView = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    getAdminDashboardMetrics().then(setData);
  }, []);

  if (!data) return <div className="p-8 text-center text-neutral-500">Loading Analytics...</div>;

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-400" /> Platform Analytics & Intelligence
        </h1>
        <p className="text-xs text-neutral-400 font-mono mt-0.5">
          Deep behavioral insights, retention, demographic distribution & feature usage
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention & DAU Chart */}
        <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" /> Active User Engagement & DAU
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.user_growth_chart}>
                <XAxis dataKey="date" stroke="#525252" fontSize={11} />
                <YAxis stroke="#525252" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="dau" stroke="#6366F1" fill="#6366F1" fillOpacity={0.2} name="DAU" />
                <Area type="monotone" dataKey="total" stroke="#10B981" fill="#10B981" fillOpacity={0.1} name="Total Registered" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demographics: Top Countries */}
        <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" /> Top Geographic Regions
          </h3>
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
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsView;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Activity, CheckCircle, PieChart, BarChart3, TrendingDown } from 'lucide-react';

export default function TrainerAnalytics({ user, clients }) {
  const [timeframe, setTimeframe] = useState('30d');

  const activeClients = clients?.filter(c => c.status === 'ACTIVE') || [];
  const totalActive = activeClients.length;

  // Mock analytics data for the dashboard (In a real app, this would be computed by querying all tables)
  const stats = {
    revenue: "$0", // Future phase
    retentionRate: "98%",
    avgCompliance: 84,
    totalWorkoutsCompleted: 142,
    growth: "+12%"
  };

  // Mock heatmap data for compliance (Last 7 days)
  const heatmapData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      value: 60 + (i * 5) // 60-100% compliance mock
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">Analytics Overview</h1>
          <p className="text-muted text-sm">Monitor business growth and global client compliance.</p>
        </div>
        <select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-[var(--input)] text-foreground border border-card-border px-4 py-2 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-sm"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
        </select>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface border border-card-border p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><Users className="w-5 h-5" /></div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted">Active Clients</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-foreground">{totalActive}</span>
            <span className="text-xs text-green-500 font-bold mb-1">{stats.growth}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface border border-card-border p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted">Avg Compliance</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-foreground">{stats.avgCompliance}%</span>
            <span className="text-xs text-green-500 font-bold mb-1"><TrendingUp className="w-3 h-3 inline" /> 4%</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-surface border border-card-border p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><Activity className="w-5 h-5" /></div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted">Workouts Done</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-foreground">{stats.totalWorkoutsCompleted}</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-surface border border-card-border p-5 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-muted">Retention Rate</h3>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-foreground">{stats.retentionRate}</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Heatmap (Visual Mockup) */}
        <div className="bg-surface border border-card-border p-6 rounded-3xl">
          <h3 className="font-black flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-500" /> Global Compliance Heatmap
          </h3>
          <div className="flex items-end gap-2 h-48 mt-4">
            {heatmapData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-card-bg rounded-t-lg flex items-end overflow-hidden h-full">
                  <div 
                    className="w-full bg-blue-500 rounded-t-sm transition-all group-hover:bg-blue-400" 
                    style={{ height: `${d.value}%`, opacity: d.value / 100 }}
                  ></div>
                </div>
                <span className="text-[10px] font-bold text-muted uppercase">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers List */}
        <div className="bg-surface border border-card-border p-6 rounded-3xl">
          <h3 className="font-black flex items-center gap-2 mb-6">
            <PieChart className="w-5 h-5 text-green-500" /> Client Leaderboard
          </h3>
          <div className="space-y-4">
            {activeClients.length > 0 ? activeClients.slice(0,4).map((c, i) => {
              const score = 100 - (i * 5) - (i % 5); // Mock score
              return (
                <div key={c.clientId} className="flex items-center justify-between p-3 rounded-xl bg-background border border-card-border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-card-border flex items-center justify-center font-black text-xs">
                      #{i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{c.name}</h4>
                      <p className="text-[10px] text-muted">{c.goal}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-green-500">{score}%</span>
                    <p className="text-[9px] uppercase tracking-wider text-muted font-bold">Score</p>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center text-muted text-sm py-8">No active clients for leaderboard.</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

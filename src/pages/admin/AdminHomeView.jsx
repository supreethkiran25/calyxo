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
  Radio
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getAdminDashboardMetrics, getAuditLogs, getAdminUsers } from '../../services/adminService';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';

const AdminHomeView = () => {
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const outletCtx = useOutletContext();
  const onSelectUser = outletCtx?.onSelectUser;
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    const m = await getAdminDashboardMetrics();
    const l = await getAuditLogs('', '');
    const uRes = await getAdminUsers({ limit: 4 });
    setMetrics(m);
    setLogs(l.slice(0, 5));
    setRecentUsers(uRes.users || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time listener for Command Center
  useAdminRealtime(['user_profiles', 'subscriptions', 'admin_audit_logs'], () => {
    loadData();
  });

  if (loading || !metrics) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const { kpis, user_growth_chart, revenue_chart } = metrics;

  return (
    <div className="space-y-6">
      {/* Plain Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white tracking-tight">Command center</h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Platform overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Total athletes
            </span>
            <Users className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">{kpis.total_users.toLocaleString()}</div>
          <div className="text-[11px] text-neutral-500">Registered users</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Premium subscribers
            </span>
            <Crown className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-amber-400">{kpis.premium_users.toLocaleString()}</div>
          <div className="text-[11px] text-neutral-500">High plan members</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Monthly recurring (MRR)
            </span>
            <DollarSign className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">₹{kpis.mrr_inr.toLocaleString()}</div>
          <div className="text-[11px] text-neutral-500">Subscription revenue</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              AI requests today
            </span>
            <Bot className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-violet-400">{kpis.ai_requests_today.toLocaleString()}</div>
          <div className="text-[11px] text-neutral-500">Assistant queries</div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neutral-500" /> User growth
            </h3>
            <span className="text-[11px] text-neutral-500 font-mono">Last 30 days</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={user_growth_chart}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#525252" fontSize={11} />
                <YAxis stroke="#525252" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Growth Chart */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-neutral-500" /> Revenue (₹)
            </h3>
            <span className="text-[11px] text-neutral-500 font-mono">Monthly trend</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue_chart}>
                <XAxis dataKey="month" stroke="#525252" fontSize={11} />
                <YAxis stroke="#525252" fontSize={11} />
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', fontSize: '12px' }} 
                />
                <Bar dataKey="revenue_inr" fill="#10B981" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Users & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent User Signups */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-neutral-500" /> Recent signups
            </h3>
            <button onClick={() => navigate('/admin/users')} className="text-blue-400 hover:text-blue-300 text-xs font-medium cursor-pointer">
              View all →
            </button>
          </div>

          <div className="space-y-2">
            {recentUsers.length > 0 ? (
              recentUsers.map(u => (
                <div
                  key={u.id}
                  onClick={() => {
                    if (onSelectUser) onSelectUser(u);
                    else navigate('/admin/users');
                  }}
                  className="p-3 rounded-lg bg-neutral-950/50 hover:bg-neutral-800/60 border border-neutral-800/60 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'User')}&background=1a1a2e&color=3B82F6&bold=true&size=80`}
                      alt={u.full_name || 'User'}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&background=1a1a2e&color=3B82F6&size=80`;
                      }}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-800"
                    />
                    <div>
                      <span className="text-sm font-medium text-white block">{u.full_name}</span>
                      <span className="text-[11px] text-neutral-500 font-mono">{u.email}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                      u.subscription_plan === 'HIGH' 
                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' 
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                    }`}>
                      {u.subscription_plan || 'FREE'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-neutral-500 text-xs font-mono">
                No users found
              </div>
            )}
          </div>
        </div>

        {/* Audit Logs */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-neutral-500" /> Recent audit logs
            </h3>
            <button onClick={() => navigate('/admin/logs')} className="text-blue-400 hover:text-blue-300 text-xs font-medium cursor-pointer">
              View all →
            </button>
          </div>

          <div className="space-y-2">
            {logs.length > 0 ? (
              logs.map(log => (
                <div key={log.id} className="p-3 rounded-lg bg-neutral-950/50 border border-neutral-800/60 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded inline-block mb-1">
                      {log.action}
                    </span>
                    <span className="text-neutral-400 text-xs block">Target: {log.target_id || 'System'}</span>
                  </div>
                  <span className="text-[11px] text-neutral-500 font-mono">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-neutral-500 text-xs font-mono">
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

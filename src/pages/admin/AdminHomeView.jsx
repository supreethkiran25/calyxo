import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Users,
  Crown,
  UserPlus,
  DollarSign,
  TrendingUp,
  Bot,
  Sparkles,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getAdminDashboardMetrics, getAuditLogs, getAdminUsers } from '../../services/adminService';

const AdminHomeView = () => {
  const [metrics, setMetrics] = useState(null);
  const [logs, setLogs] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const outletCtx = useOutletContext();
  const onSelectUser = outletCtx?.onSelectUser;
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const m = await getAdminDashboardMetrics();
      const l = await getAuditLogs('', '');
      const uRes = await getAdminUsers({ limit: 4 });
      setMetrics(m);
      setLogs(l.slice(0, 5));
      setRecentUsers(uRes.users || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !metrics) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const { kpis, user_growth_chart, revenue_chart } = metrics;

  return (
    <div className="space-y-6">
      {/* Top Banner KPI Summary */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-neutral-950 border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" /> LIVE OPERATIONAL TELEMETRY (INR ₹)
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Super Admin Command Center</h2>
            <p className="text-xs text-neutral-400 max-w-xl mt-1">
              Real-time platform analytics, live Supabase user activity, database telemetry, and Razorpay billing metrics in INR (₹).
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 cursor-pointer"
          >
            Manage Users <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Total Athletes</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.total_users.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 font-mono">Live registered profiles</div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Premium Subscribers</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-300">{kpis.premium_users.toLocaleString()}</div>
          <div className="text-[11px] text-amber-400/80 font-mono">Active Razorpay subscriptions</div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Monthly Recurring (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">₹{kpis.mrr_inr.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 font-mono">Razorpay INR Billing</div>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">AI Assistant Requests</span>
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{kpis.ai_requests_today.toLocaleString()}</div>
          <div className="text-[11px] text-purple-400 font-mono">Logged chat sessions</div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Active User Telemetry
            </h3>
            <span className="text-[11px] text-neutral-500 font-mono">Realtime Query</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={user_growth_chart}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#525252" fontSize={11} />
                <YAxis stroke="#525252" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" name="Total Users" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Growth Chart (INR - ₹) */}
        <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" /> Razorpay Revenue (₹ INR)
            </h3>
            <span className="text-[11px] text-emerald-400 font-mono">Live INR Pipeline</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue_chart}>
                <XAxis dataKey="month" stroke="#525252" fontSize={11} />
                <YAxis stroke="#525252" fontSize={11} />
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, 'Annualized Revenue']}
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', fontSize: '12px' }} 
                />
                <Bar dataKey="revenue_inr" fill="#10b981" radius={[6, 6, 0, 0]} name="Annualized Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Users & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent User Signups */}
        <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-400" /> Recent User Signups
            </h3>
            <button onClick={() => navigate('/admin/users')} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">
              View All Users →
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
                  className="p-3 rounded-2xl bg-neutral-950/40 hover:bg-neutral-800/60 border border-neutral-800/50 flex items-center justify-between cursor-pointer transition-all"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'User')}&background=1a1a2e&color=6366f1&bold=true&size=80`}
                      alt={u.full_name || 'User'}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&background=1a1a2e&color=6366f1&size=80`;
                      }}
                      className="w-9 h-9 rounded-xl object-cover border border-neutral-700"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{u.full_name}</span>
                      <span className="text-[11px] text-neutral-500 font-mono">{u.email} • {u.country}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      u.subscription_plan === 'FREE' ? 'bg-neutral-800 text-neutral-400' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {u.subscription_plan}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono block mt-1">{u.signup_date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-neutral-500 text-xs font-mono">
                No user profiles registered in database yet.
              </div>
            )}
          </div>
        </div>

        {/* Realtime Admin Audit Actions */}
        <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" /> Recent Audit Logs
            </h3>
            <button onClick={() => navigate('/admin/logs')} className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer">
              View Audit Ledger →
            </button>
          </div>

          <div className="space-y-2">
            {logs.length > 0 ? (
              logs.map(log => (
                <div key={log.id} className="p-3 rounded-2xl bg-neutral-950/40 border border-neutral-800/50 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-indigo-400 font-mono font-bold block">{log.action}</span>
                    <span className="text-neutral-400 text-[11px]">Target: {log.target_id || 'System'}</span>
                  </div>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-neutral-500 text-xs font-mono">
                Audit ledger clean. No recent administrative actions recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHomeView;

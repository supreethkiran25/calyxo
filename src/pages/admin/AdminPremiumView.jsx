import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Crown,
  Sparkles,
  Zap,
  CheckCircle2,
  Plus,
  UserCheck,
  CreditCard
} from 'lucide-react';
import { getAdminUsers, updateUserSubscription, LIVE_RAZORPAY_TRANSACTIONS } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';
import GrantPremiumModal from '../../components/admin/GrantPremiumModal';

const AdminPremiumView = () => {
  const [users, setUsers] = useState([]);
  const [grantModalUser, setGrantModalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);
  const outletCtx = useOutletContext();

  const loadData = async () => {
    setLoading(true);
    const res = await getAdminUsers({ limit: 100 });
    setUsers(res?.users || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Subscribe to Supabase Realtime for instant subscription & user profile updates
    const channel = supabase
      .channel('admin_premium_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const premiumUsers = (users || []).filter(u => u && u.subscription_plan === 'HIGH');
  const freeUsers = (users || []).filter(u => u && u.subscription_plan === 'FREE');
  const totalUsersCount = users.length;
  const conversionRate = totalUsersCount > 0 ? Math.round((premiumUsers.length / totalUsersCount) * 100) : 0;
  const totalRazorpayCaptured = LIVE_RAZORPAY_TRANSACTIONS.reduce((acc, tx) => acc + tx.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" /> Premium & Subscriptions Hub
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Single Plan: High Plan (₹999/mo) • Live Supabase & Razorpay Subscriber Telemetry
          </p>
        </div>

        <button
          onClick={() => setGrantModalUser(freeUsers[0] || users[0] || null)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Grant Premium High Pass
        </button>
      </div>

      {/* Real KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Active Premium Subscribers</span>
          <span className="text-2xl font-bold text-amber-400 block mt-1">{premiumUsers.length}</span>
          <span className="text-[10px] text-amber-500/80 font-mono mt-1 block">{conversionRate}% Conversion Rate</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Free Tier Users</span>
          <span className="text-2xl font-bold text-white block mt-1">{freeUsers.length}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Available for upgrade</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Total Registered Users</span>
          <span className="text-2xl font-bold text-indigo-400 block mt-1">{totalUsersCount}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Supabase DB Accounts</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Razorpay Captured Revenue</span>
          <span className="text-2xl font-bold text-emerald-400 block mt-1">₹{totalRazorpayCaptured.toFixed(2)}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Live UPI Gateway</span>
        </div>
      </div>

      {/* Active Premium Subscribers Table */}
      <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800/80 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Active High Plan Accounts ({premiumUsers.length})
          </h3>
          <span className="text-xs text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            High Plan (₹999/mo)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Tier Plan</th>
                <th className="p-4 font-bold">Source & Granted By</th>
                <th className="p-4 font-bold">Subscription Expiry</th>
                <th className="p-4 font-bold">Renewal Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {premiumUsers.map(u => (
                <tr key={u.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="p-4 font-sans">
                    <div className="flex items-center gap-3">
                      <img src={u.photoURL} alt="" className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <span className="font-bold text-white block">{u.full_name}</span>
                        <span className="text-neutral-400 text-[11px] font-mono">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      HIGH PLAN (₹999)
                    </span>
                  </td>
                  <td className="p-4 text-neutral-300">
                    <span className="block font-bold text-neutral-200">{u.payment_source || 'Razorpay'}</span>
                    <span className="text-[10px] text-neutral-400 block font-mono">By: {u.granted_by || 'Razorpay'}</span>
                  </td>
                  <td className="p-4 text-neutral-300">
                    <span className="block font-bold text-amber-300">{u.subscription_expiry}</span>
                    <span className="text-[10px] text-neutral-400">{u.days_remaining} days remaining</span>
                  </td>
                  <td className="p-4">
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active High Member
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setGrantModalUser(u)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 text-amber-300 hover:bg-neutral-700 text-xs font-semibold cursor-pointer"
                      >
                        Modify Pass
                      </button>
                      <button
                        disabled={revokingId === u.id}
                        onClick={async () => {
                          try {
                            setRevokingId(u.id);
                            await updateUserSubscription(u.id, 'FREE', '0', 'Admin revoked', 'supreethkiran25@gmail.com');
                            await loadData();
                          } catch (err) {
                            alert(err.message || 'Failed to revoke subscription');
                          } finally {
                            setRevokingId(null);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 text-xs font-semibold cursor-pointer disabled:opacity-50"
                      >
                        {revokingId === u.id ? 'Revoking...' : 'Revoke Pass'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Free Tier Users Directory (Available for Upsell) */}
      <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800/80 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-400" /> Free Tier Directory ({freeUsers.length})
          </h3>
          <span className="text-xs text-neutral-400 font-mono">Available for High Plan Upsell</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Current Tier</th>
                <th className="p-4 font-bold">Joined On</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 font-mono">
              {freeUsers.map(u => (
                <tr key={u.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="p-4 font-sans">
                    <div className="flex items-center gap-3">
                      <img src={u.photoURL} alt="" className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <span className="font-bold text-white block">{u.full_name}</span>
                        <span className="text-neutral-400 text-[11px] font-mono">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                      FREE TIER
                    </span>
                  </td>
                  <td className="p-4 text-neutral-400">{u.signup_date}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setGrantModalUser(u)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                    >
                      Grant High Pass
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {grantModalUser && (
        <GrantPremiumModal
          isOpen={!!grantModalUser}
          user={grantModalUser}
          onClose={() => setGrantModalUser(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default AdminPremiumView;

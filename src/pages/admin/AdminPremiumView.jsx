import React, { useState, useEffect } from 'react';
import { Crown, Plus, UserCheck, CreditCard, Users, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminUsers, updateUserSubscription, LIVE_RAZORPAY_TRANSACTIONS } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';
import GrantPremiumModal from '../../components/admin/GrantPremiumModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const AdminPremiumView = () => {
  const [users, setUsers] = useState([]);
  const [grantModalUser, setGrantModalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState(null);
  const [revokingTarget, setRevokingTarget] = useState(null);

  const loadData = async () => {
    setLoading(true);
    const res = await getAdminUsers({ limit: 100 });
    setUsers(res?.users || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel('admin_premium_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => loadData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const confirmRevokePass = async () => {
    if (!revokingTarget) return;
    try {
      setRevokingId(revokingTarget.id);
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmail = user?.email || 'admin@calyxo.com';
      await updateUserSubscription(revokingTarget.id, 'FREE', '0', 'Admin revoked', adminEmail);
      toast.success(`Subscription revoked for ${revokingTarget.full_name || 'User'}`);
      await loadData();
    } catch (err) {
      toast.error(err.message || 'Failed to revoke subscription');
    } finally {
      setRevokingId(null);
      setRevokingTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
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
          <h1 className="text-xl font-semibold text-white tracking-tight">Premium subscriptions</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            High plan members and subscription management
          </p>
        </div>

        <button
          onClick={() => setGrantModalUser(freeUsers[0] || users[0] || null)}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> Grant access
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Active premium subscribers
            </span>
            <Crown className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-amber-400">{premiumUsers.length}</div>
          <div className="text-[11px] text-neutral-500">{conversionRate}% conversion rate</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Free tier users
            </span>
            <UserCheck className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">{freeUsers.length}</div>
          <div className="text-[11px] text-neutral-500">Available for upgrade</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Total registered users
            </span>
            <Users className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">{totalUsersCount}</div>
          <div className="text-[11px] text-neutral-500">Registered accounts</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Revenue captured
            </span>
            <CreditCard className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-emerald-400">₹{totalRazorpayCaptured.toFixed(2)}</div>
          <div className="text-[11px] text-neutral-500">Gateway transactions</div>
        </div>
      </div>

      {/* Active Premium Subscribers Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-neutral-500" /> Active High plan accounts ({premiumUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          {premiumUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-600 font-mono">
              No active High plan members
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Granted by</th>
                  <th className="p-4">Expiry</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {premiumUsers.map(u => (
                  <tr key={u.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="p-4">
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
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded border bg-amber-500/10 text-amber-300 border-amber-500/20">
                        HIGH
                      </span>
                    </td>
                    <td className="p-4 text-neutral-300 text-xs">
                      {u.granted_by || u.payment_source || 'Razorpay'}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-neutral-400">
                      {u.subscription_expiry} ({u.days_remaining}d)
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setGrantModalUser(u)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold cursor-pointer"
                        >
                          Modify
                        </button>
                        <button
                          disabled={revokingId === u.id}
                          onClick={() => setRevokingTarget(u)}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold cursor-pointer disabled:opacity-50"
                        >
                          {revokingId === u.id ? 'Revoking...' : 'Revoke'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Free Tier Directory */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-neutral-500" /> Free tier ({freeUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          {freeUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-600 font-mono">
              No free tier users found
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Tier</th>
                  <th className="p-4">Joined on</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {freeUsers.map(u => (
                  <tr key={u.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="p-4">
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
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded border bg-neutral-800 text-neutral-400 border-neutral-700">
                        FREE
                      </span>
                    </td>
                    <td className="p-4 text-neutral-400 font-mono text-[11px]">{u.signup_date}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setGrantModalUser(u)}
                        className="bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 text-xs font-medium rounded-lg px-3 py-1.5 cursor-pointer"
                      >
                        Grant access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

      <ConfirmDialog
        isOpen={!!revokingTarget}
        title="Revoke subscription"
        description={`Are you sure you want to revoke the High plan subscription for "${revokingTarget?.full_name || 'this user'}"?`}
        confirmLabel="Revoke"
        variant="danger"
        isLoading={!!revokingId}
        onConfirm={confirmRevokePass}
        onCancel={() => setRevokingTarget(null)}
      />
    </div>
  );
};

export default AdminPremiumView;

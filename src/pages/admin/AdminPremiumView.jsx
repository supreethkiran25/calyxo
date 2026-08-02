import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Crown,
  Sparkles,
  Clock,
  AlertTriangle,
  UserCheck,
  Plus,
  RefreshCw,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { getAdminUsers, updateUserSubscription } from '../../services/adminService';
import GrantPremiumModal from '../../components/admin/GrantPremiumModal';

const AdminPremiumView = () => {
  const [users, setUsers] = useState([]);
  const [grantModalUser, setGrantModalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const outletCtx = useOutletContext();
  const onSelectUser = outletCtx?.onSelectUser;

  const loadData = async () => {
    setLoading(true);
    const res = await getAdminUsers({ limit: 100 });
    setUsers(res?.users || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const premiumUsers = (users || []).filter(u => u && u.subscription_plan !== 'FREE');
  const freeUsers = (users || []).filter(u => u && u.subscription_plan === 'FREE');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Crown className="w-6 h-6 text-amber-400" /> Premium & Subscriptions Hub
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Manage subscriber tiers, passes, beta grants, and renewal statuses
          </p>
        </div>

        <button
          onClick={() => setGrantModalUser(users[0] || null)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
        >
          <Plus className="w-4 h-4" /> Grant Premium Pass
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Total Premium Subscribers</span>
          <span className="text-2xl font-bold text-amber-400 block mt-1">3,840</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">27% conversion rate</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Expiring Soon (&lt; 7 Days)</span>
          <span className="text-2xl font-bold text-indigo-400 block mt-1">142</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Auto-renewal queued</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Free Tier Users</span>
          <span className="text-2xl font-bold text-white block mt-1">10,440</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Available for upsell</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Lifetime Passes Granted</span>
          <span className="text-2xl font-bold text-emerald-400 block mt-1">84</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Beta testers & Partners</span>
        </div>
      </div>

      {/* Active Premium Subscribers Table */}
      <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800/80 overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" /> Active Premium Accounts
          </h3>
          <span className="text-xs text-neutral-500 font-mono">{premiumUsers.length} Users Listed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">Tier Plan</th>
                <th className="p-4 font-bold">Renewal Status</th>
                <th className="p-4 font-bold">Signup Date</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {premiumUsers.map(u => (
                <tr key={u.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={u.photoURL} alt="" className="w-9 h-9 rounded-xl object-cover" />
                      <div>
                        <span className="font-bold text-white block">{u.full_name}</span>
                        <span className="text-neutral-500 text-[11px] font-mono">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {u.subscription_plan}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Auto-Renewing
                    </span>
                  </td>
                  <td className="p-4 text-neutral-400 font-mono">{u.signup_date}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setGrantModalUser(u)}
                        className="px-2.5 py-1 rounded-lg bg-neutral-800 text-amber-300 hover:bg-neutral-700 text-xs font-semibold"
                      >
                        Modify Pass
                      </button>
                      <button
                        onClick={async () => {
                          await updateUserSubscription(u.id, 'FREE', '0', 'Admin revoked');
                          loadData();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 text-xs font-semibold"
                      >
                        Revoke
                      </button>
                    </div>
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

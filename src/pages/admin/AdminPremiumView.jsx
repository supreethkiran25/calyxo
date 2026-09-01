import React, { useState, useEffect, useCallback } from 'react';
import { Crown, Plus, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminUsers, updateUserSubscription, CALYXO_PRIMARY_PLAN } from '../../services/adminService';
import GrantPremiumModal from '../../components/admin/GrantPremiumModal';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminStatusBadge,
  AdminLoadingSkeleton,
  AdminEmptyState,
  AdminSearchInput
} from '../../components/admin/AdminUIPrimitives';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';

const AdminPremiumView = () => {
  const [members, setMembers] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'EXPIRED'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [grantModalUser, setGrantModalUser] = useState(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({ limit: 1000 });
      const all = res.users || [];
      setMembers(all);
    } catch (e) {
      toast.error('Failed to load subscriptions.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Real-time updates
  useAdminRealtime(['subscriptions', 'user_profiles', 'admin_audit_logs'], () => {
    fetchMembers();
  });

  const highPlanUsers = members.filter(u => u.subscription_plan === 'HIGH' || u.subscription_plan === 'HIGH_ANNUAL');
  const freeUsers = members.filter(u => u.subscription_plan === 'FREE' || !u.subscription_plan);

  const filteredList = (activeTab === 'ACTIVE' ? highPlanUsers : activeTab === 'EXPIRED' ? freeUsers : members).filter(u => 
    !search || u.full_name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRevoke = async (user) => {
    try {
      await updateUserSubscription(user.id, 'FREE', '0', 'Admin Revoke');
      toast.success(`Revoked High plan for ${user.full_name}`);
      fetchMembers();
    } catch (e) {
      toast.error('Failed to revoke plan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        title="Subscriptions"
        description="Athlete plan entitlements, active passes, and manual admin grants"
        badge={`${highPlanUsers.length} High active`}
        actions={
          <button
            onClick={() => setGrantModalUser({ email: '', full_name: 'New Athlete' })}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Grant Access</span>
          </button>
        }
      />

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Active High Subscribers"
          value={highPlanUsers.length.toLocaleString()}
          icon={Crown}
          change={members.length > 0 ? `${Math.round((highPlanUsers.length / members.length) * 100)}% conversion` : undefined}
          changeType="positive"
          subtitle="Full platform access"
        />
        <AdminStatCard
          title="Free Tier Athletes"
          value={freeUsers.length.toLocaleString()}
          icon={Users}
          subtitle="Standard access"
        />
        <AdminStatCard
          title="High Plan Pricing"
          value={`₹${CALYXO_PRIMARY_PLAN.price}/yr`}
          icon={DollarSign}
          subtitle="Calyxo All-Access Pass"
        />
      </div>

      {/* 3. Filter Bar & Tabs */}
      <div className="p-3 bg-neutral-900/90 border border-neutral-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-xs">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'ALL' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'ACTIVE' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            High Plan ({highPlanUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('EXPIRED')}
            className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
              activeTab === 'EXPIRED' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Free Tier ({freeUsers.length})
          </button>
        </div>

        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter subscribers..."
          onClear={() => setSearch('')}
        />
      </div>

      {/* 4. Subscriptions Table */}
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl overflow-hidden">
        {loading ? (
          <AdminLoadingSkeleton rows={6} />
        ) : filteredList.length === 0 ? (
          <AdminEmptyState
            title="No subscriptions match this view"
            description="Try switching tabs or clearing your search term."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-mono uppercase text-[10px]">
                  <th className="p-3.5 font-bold">Subscriber</th>
                  <th className="p-3.5 font-bold">Active Plan</th>
                  <th className="p-3.5 font-bold">Expiry Date</th>
                  <th className="p-3.5 font-bold">Granted By</th>
                  <th className="p-3.5 font-bold">Provider</th>
                  <th className="p-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {filteredList.map(u => (
                  <tr key={u.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-300 flex items-center justify-center font-mono font-bold text-xs shrink-0 border border-neutral-700">
                          {u.full_name ? u.full_name.substring(0, 2).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="font-semibold text-white block">{u.full_name || 'Athlete'}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <AdminStatusBadge status={u.subscription_plan || 'FREE'} />
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-neutral-400">
                      {u.subscription_expiry || 'Ongoing'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-neutral-300">
                      {u.granted_by || 'Razorpay'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-neutral-400">
                      {u.payment_source || 'Razorpay Direct'}
                    </td>
                    <td className="p-3.5 text-right">
                      {u.subscription_plan === 'HIGH' || u.subscription_plan === 'HIGH_ANNUAL' ? (
                        <button
                          onClick={() => handleRevoke(u)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-rose-950/30 text-rose-400 border border-rose-900/40 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Revoke Pass
                        </button>
                      ) : (
                        <button
                          onClick={() => setGrantModalUser(u)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-neutral-800 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Grant High
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grant Modal */}
      <GrantPremiumModal
        isOpen={Boolean(grantModalUser)}
        user={grantModalUser}
        onClose={() => setGrantModalUser(null)}
        onSuccess={() => {
          setGrantModalUser(null);
          fetchMembers();
        }}
      />
    </div>
  );
};

export default AdminPremiumView;


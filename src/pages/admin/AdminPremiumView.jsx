import React, { useState, useEffect, useCallback } from 'react';
import { Crown, CheckCircle2, RefreshCw, Plus, Users, DollarSign, ArrowUpRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminUsers, updateUserSubscription, CALYXO_PRIMARY_PLAN } from '../../services/adminService';
import GrantPremiumModal from '../../components/admin/GrantPremiumModal';
import { AdminStatCard, AdminStatusBadge, AdminLoadingSkeleton, AdminEmptyState } from '../../components/admin/AdminUIPrimitives';

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

  const highPlanUsers = members.filter(u => u.subscription_plan === 'HIGH' || u.subscription_plan === 'HIGH_ANNUAL');
  const freeUsers = members.filter(u => u.subscription_plan === 'FREE' || !u.subscription_plan);

  const filteredList = (activeTab === 'ACTIVE' ? highPlanUsers : activeTab === 'EXPIRED' ? freeUsers : members).filter(u => 
    !search || u.full_name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
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
      {/* Header Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Subscriptions & High Plan Hub</h2>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Manage athlete plan entitlements, active passes, and manual admin grants
          </p>
        </div>

        <button
          onClick={() => setGrantModalUser({ email: '', full_name: 'New Athlete' })}
          className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer border border-amber-400/40"
        >
          <Plus className="w-4 h-4" />
          <span>Grant Premium Access</span>
        </button>
      </div>

      {/* KPI Cards Row */}
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

      {/* Tabs & Search */}
      <div className="p-4 bg-neutral-900/90 border border-neutral-800/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-xl bg-neutral-950 border border-neutral-800">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'ALL' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            All Members ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'ACTIVE' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Active High ({highPlanUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('EXPIRED')}
            className={`px-3 py-1.5 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'EXPIRED' ? 'bg-blue-600 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Free Tier ({freeUsers.length})
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscriber..."
            className="w-full pl-10 pr-4 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl overflow-hidden shadow-xl">
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
                  <th className="p-3.5">Subscriber</th>
                  <th className="p-3.5">Active Plan</th>
                  <th className="p-3.5">Expiry Date</th>
                  <th className="p-3.5">Granted By</th>
                  <th className="p-3.5">Payment Source</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {filteredList.map(u => (
                  <tr key={u.id} className="hover:bg-neutral-800/50 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=1a1a2e&color=3B82F6&bold=true`}
                          alt={u.full_name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name)}&background=1a1a2e&color=3B82F6`;
                          }}
                          className="w-8 h-8 rounded-xl object-cover border border-neutral-800 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block">{u.full_name}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <AdminStatusBadge status={u.subscription_plan || 'FREE'} />
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-neutral-400">
                      {u.subscription_expiry || 'N/A'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-neutral-300">
                      {u.granted_by || 'Razorpay'}
                    </td>
                    <td className="p-3.5 font-mono text-[11px] text-neutral-400">
                      {u.payment_source || 'Razorpay Direct'}
                    </td>
                    <td className="p-3.5 text-right">
                      {u.subscription_plan === 'HIGH' ? (
                        <button
                          onClick={() => handleRevoke(u)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Revoke Pass
                        </button>
                      ) : (
                        <button
                          onClick={() => setGrantModalUser(u)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 text-xs font-semibold transition-colors cursor-pointer"
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

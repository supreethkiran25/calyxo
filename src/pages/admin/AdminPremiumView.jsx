import React, { useState, useEffect } from 'react';
import { Crown, Sparkles, AlertCircle, CheckCircle2, RefreshCw, Plus, Users, Calendar, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import {
  getAdminUsers,
  updateUserSubscription,
  CALYXO_PRIMARY_PLAN
} from '../../services/adminService';
import GrantPremiumModal from '../../components/admin/GrantPremiumModal';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminStatusBadge,
  AdminCountdownBadge,
  AdminSearchInput,
  AdminEmptyState,
  AdminLoadingSkeleton
} from '../../components/admin/AdminUIPrimitives';

const AdminPremiumView = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [search, setSearch] = useState('');
  const [grantModalUser, setGrantModalUser] = useState(null);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({ limit: 500 });
      setMembers(res.users || []);
    } catch (e) {
      toast.error('Failed to load subscribers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleRevoke = async (user) => {
    if (!window.confirm(`Revoke High Plan entitlements from ${user.full_name || user.email}?`)) return;
    try {
      await updateUserSubscription(user.id, 'FREE', '0 Days', 'Admin Manual Revoke');
      toast.success('High Plan pass revoked.');
      fetchMembers();
    } catch (e) {
      toast.error('Failed to revoke pass: ' + e.message);
    }
  };

  const highPlanUsers = members.filter(m => m.subscription_plan && m.subscription_plan !== 'FREE');
  const freeUsers = members.filter(m => !m.subscription_plan || m.subscription_plan === 'FREE');

  const filteredList = members.filter(m => {
    if (activeTab === 'ACTIVE' && (!m.subscription_plan || m.subscription_plan === 'FREE')) return false;
    if (activeTab === 'EXPIRED' && m.subscription_plan && m.subscription_plan !== 'FREE') return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (m.full_name && m.full_name.toLowerCase().includes(q)) || (m.email && m.email.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <AdminPageHeader
        title="Subscription Management"
        description="High Plan passes, Razorpay entitlements, renewal countdowns, and athlete access control"
        badge="Subscription Lifecycle"
        actions={
          <button
            onClick={() => setGrantModalUser({ isNewGrant: true })}
            className="px-3.5 py-1.5 rounded-xl bg-[#d4ff00] hover:bg-[#a3e635] text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#d4ff00]/10"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Grant High Pass</span>
          </button>
        }
      />

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <AdminStatCard
          title="Active High Plan Athletes"
          value={highPlanUsers.length.toLocaleString()}
          icon={Crown}
          trend={`${members.length > 0 ? ((highPlanUsers.length / members.length) * 100).toFixed(1) : '0.0'}%`}
          trendLabel="Active subscriber ratio"
        />
        <AdminStatCard
          title="Free Tier Athletes"
          value={freeUsers.length.toLocaleString()}
          icon={Users}
          trend="Pipeline"
          trendLabel="Ready for conversion"
        />
        <AdminStatCard
          title="High Plan Pricing"
          value={`₹${CALYXO_PRIMARY_PLAN.price}/mo`}
          icon={IndianRupee}
          trend="₹199 Annual"
          trendLabel="Single high-tier membership"
        />
      </div>

      {/* 3. Filter Bar & Tabs */}
      <div className="p-4 bg-[#0e121d] border border-white/10 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-xl bg-[#141724] border border-white/10 text-xs font-sans">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
              activeTab === 'ALL' ? 'bg-[#d4ff00] text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({members.length})
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE')}
            className={`px-3.5 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
              activeTab === 'ACTIVE' ? 'bg-[#d4ff00] text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            High Plan ({highPlanUsers.length})
          </button>
          <button
            onClick={() => setActiveTab('EXPIRED')}
            className={`px-3.5 py-1 rounded-lg transition-all cursor-pointer font-semibold ${
              activeTab === 'EXPIRED' ? 'bg-[#d4ff00] text-slate-950 font-bold shadow-xs' : 'text-slate-400 hover:text-white'
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
      <div className="bg-[#0e121d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
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
                <tr className="border-b border-white/10 bg-[#07090e] text-slate-400 font-semibold tracking-wider text-[11px] uppercase">
                  <th className="p-4">Subscriber</th>
                  <th className="p-4">Active Plan</th>
                  <th className="p-4">Countdown & Renewal</th>
                  <th className="p-4">Granted By</th>
                  <th className="p-4">Provider</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredList.map(u => (
                  <tr key={u.id} className="hover:bg-[#141828]/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&background=0f172a&color=fff`}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <span className="font-semibold text-white block">{u.full_name || 'Athlete'}</span>
                          <span className="text-[11px] text-slate-400 font-sans">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <AdminStatusBadge status={u.subscription_plan === 'HIGH_ANNUAL' ? 'High Annual' : (u.subscription_plan === 'HIGH' ? 'High Plan' : 'Free')} />
                    </td>
                    <td className="p-4">
                      {u.subscription_plan !== 'FREE' ? (
                        <div className="space-y-1">
                          <AdminCountdownBadge 
                            days={u.days_remaining} 
                            hours={u.hours_remaining}
                            isExpiringSoon={u.is_expiring_soon}
                          />
                          <span className="text-[10px] text-slate-400 font-mono block">Expires: {u.subscription_expiry}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-mono">
                          {u.renewal_status || 'Free Tier'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-300 font-medium">
                      {u.granted_by || (u.subscription_plan !== 'FREE' ? 'Razorpay Direct' : 'System Default')}
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {u.payment_source || 'Razorpay Gateway'}
                    </td>
                    <td className="p-4 text-right">
                      {u.subscription_plan && u.subscription_plan !== 'FREE' ? (
                        <button
                          onClick={() => handleRevoke(u)}
                          className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Revoke Pass
                        </button>
                      ) : (
                        <button
                          onClick={() => setGrantModalUser(u)}
                          className="px-3 py-1 bg-[#d4ff00] hover:bg-[#a3e635] text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-[#d4ff00]/10"
                        >
                          Grant High Pass
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
      {grantModalUser && (
        <GrantPremiumModal
          user={grantModalUser.isNewGrant ? null : grantModalUser}
          isOpen={Boolean(grantModalUser)}
          onClose={() => setGrantModalUser(null)}
          onSuccess={() => {
            fetchMembers();
            setGrantModalUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminPremiumView;

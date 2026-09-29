import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Download,
  Crown,
  ChevronLeft,
  ChevronRight,
  Ban,
  Trash2,
  ArrowUpDown,
  Bell,
  SlidersHorizontal,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  UserCheck,
  Shield,
  Layers,
  Sparkles,
  RefreshCw,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { getAdminUsers, updateUserStatus, deleteUserAdmin, updateUserSubscription } from '../../services/adminService';
import GrantPremiumModal from '../../components/admin/GrantPremiumModal';
import NotificationComposerModal from '../../components/admin/NotificationComposerModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import useDebounce from '../../hooks/useDebounce';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';
import {
  AdminPageHeader,
  AdminStatusBadge,
  AdminCountdownBadge,
  AdminLoadingSkeleton,
  AdminEmptyState,
  AdminSearchInput
} from '../../components/admin/AdminUIPrimitives';

const AdminUsersView = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('signup_date');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Column visibility
  const [showColumnsMenu, setShowColumnsMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    user: true,
    activeness: true,
    plan: true,
    countdown: true,
    workouts: true,
    nutrition: true,
    joined: true,
    actions: true
  });

  // Bulk action state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmDialog, setConfirmDialog] = useState(null);

  // Notification modal state
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [notifyTargetUser, setNotifyTargetUser] = useState(null);
  const [notifyTargetUserIds, setNotifyTargetUserIds] = useState([]);

  // Modals state
  const [grantModalUser, setGrantModalUser] = useState(null);
  const outletCtx = useOutletContext();
  const onSelectUser = outletCtx?.onSelectUser;

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      let computedPlanFilter = planFilter;
      let computedStatusFilter = statusFilter;

      if (activeTabFilter === 'ACTIVE_REGULAR') {
        computedStatusFilter = 'Active';
      } else if (activeTabFilter === 'INACTIVE_DORMANT') {
        computedStatusFilter = 'Inactive';
      } else if (activeTabFilter === 'EXPIRING_SOON') {
        computedPlanFilter = 'EXPIRING_SOON';
      } else if (activeTabFilter === 'PAID') {
        computedPlanFilter = 'PAID';
      } else if (activeTabFilter === 'FREE_TIER') {
        computedPlanFilter = 'FREE';
      } else if (activeTabFilter === 'TURNED_IN') {
        computedPlanFilter = 'TURNED_IN';
      }

      const res = await getAdminUsers({
        search: debouncedSearch,
        planFilter: computedPlanFilter,
        statusFilter: computedStatusFilter,
        page,
        limit: 15,
        sortBy,
        sortDir
      });

      setUsers(res.users || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (e) {
      toast.error('Failed to load user directory.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, planFilter, statusFilter, activeTabFilter, page, sortBy, sortDir]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Subscribe to real-time changes
  useAdminRealtime(['user_profiles', 'subscriptions', 'workout_logs', 'food_logs'], () => {
    fetchUsers(true);
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length && users.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map(u => u.id)));
    }
  };

  const toggleSelectUser = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSingleStatusChange = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
    try {
      await updateUserStatus(userId, nextStatus, 'Admin toggle action');
      toast.success(`User status updated to ${nextStatus}`);
      fetchUsers(true);
    } catch (e) {
      toast.error('Failed to update user status.');
    }
  };

  const handleSingleDelete = (user) => {
    setConfirmDialog({
      title: `Delete ${user.full_name || 'user'}?`,
      description: `This action will permanently delete ${user.email} and all associated records from database. This action cannot be undone.`,
      confirmLabel: 'Delete user',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteUserAdmin(user.id);
          toast.success('User permanently deleted.');
          fetchUsers(true);
        } catch (e) {
          toast.error('Failed to delete user: ' + e.message);
        }
      }
    });
  };

  const handleBulkGrantHigh = () => {
    const count = selectedIds.size;
    setConfirmDialog({
      title: `Grant High plan to ${count} user(s)`,
      description: `Are you sure you want to grant High plan entitlements to ${count} selected athlete accounts for 12 months?`,
      confirmLabel: `Grant access (${count})`,
      onConfirm: async () => {
        try {
          for (const id of Array.from(selectedIds)) {
            await updateUserSubscription(id, 'HIGH', '12 Months', 'Bulk admin grant');
          }
          toast.success(`Granted High plan to ${count} users.`);
          setSelectedIds(new Set());
          fetchUsers(true);
        } catch (e) {
          toast.error('Bulk grant failed: ' + e.message);
        }
      }
    });
  };

  const exportCSV = () => {
    let csv = 'ID,Full Name,Email,Role,Activeness,Last Active,Subscription Plan,Countdown,Renewal Status,Workouts,Meals,Joined Date\n';
    users.forEach(u => {
      csv += `"${u.id}","${u.full_name}","${u.email}","${u.role || 'User'}","${u.activeness}","${u.last_active_label}","${u.subscription_plan}","${u.countdown_string}","${u.renewal_status}","${u.total_workouts || 0}","${u.total_meals || 0}","${u.signup_date}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calyxo_athletes_crm_${new Date().toISOString().substring(0, 10)}.csv`;
    a.click();
  };

  const filterTabs = [
    { id: 'ALL', label: 'All Athletes', count: total },
    { id: 'ACTIVE_REGULAR', label: 'Active Regularly', icon: CheckCircle2 },
    { id: 'INACTIVE_DORMANT', label: 'Inactive (Dormant)', icon: Clock },
    { id: 'EXPIRING_SOON', label: 'Expiring Soon (≤5d)', icon: AlertTriangle },
    { id: 'PAID', label: 'Paid Subscribers', icon: Crown },
    { id: 'FREE_TIER', label: 'Free Tier', icon: Zap },
    { id: 'TURNED_IN', label: 'Turned In / Churned', icon: RefreshCw }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <AdminPageHeader
        title="Athlete Directory & CRM"
        description="Monitor user activeness based on real workout and nutrition logging, track subscription countdowns and renewals, and manage two-tier platform authorization."
        badge={`${total} Total Athletes`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNotifyTargetUser(null);
                setNotifyTargetUserIds([]);
                setNotifyModalOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-[#d4ff00] hover:bg-[#a3e635] text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-[#d4ff00]/10"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Broadcast Notice</span>
            </button>
            <button
              onClick={exportCSV}
              className="px-3.5 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1a1f30] text-slate-200 text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => fetchUsers(true)}
              disabled={refreshing}
              className="p-2 rounded-xl bg-[#141724] hover:bg-[#1a1f30] text-slate-400 hover:text-white border border-white/10 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Athletes"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      />

      {/* 2. Interactive Filter Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filterTabs.map(tab => {
          const isActive = activeTabFilter === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTabFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#d4ff00] text-slate-950 font-bold shadow-md shadow-[#d4ff00]/20'
                  : 'bg-[#0e121d] text-slate-400 hover:text-white border border-white/10 hover:border-white/20'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{tab.label}</span>
              {tab.id === 'ALL' && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-black/20 text-slate-950' : 'bg-white/10 text-slate-300'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Search & Additional Filters Bar */}
      <div className="p-4 bg-[#0e121d] border border-white/10 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <AdminSearchInput
          value={search}
          onChange={(val) => { setSearch(val); setPage(1); }}
          placeholder="Search by name, email, or athlete ID..."
          onClear={() => { setSearch(''); setPage(1); }}
        />

        <div className="flex flex-wrap items-center gap-2">
          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
            className="bg-[#141724] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-sans cursor-pointer focus:outline-none focus:border-[#d4ff00]/60"
          >
            <option value="">All Tiers</option>
            <option value="HIGH">High Monthly (₹2)</option>
            <option value="HIGH_ANNUAL">High Annual (₹199)</option>
            <option value="FREE">Free Tier</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-[#141724] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-sans cursor-pointer focus:outline-none focus:border-[#d4ff00]/60"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active (Recent)</option>
            <option value="Inactive">Inactive (Dormant)</option>
            <option value="Suspended">Suspended</option>
          </select>

          {/* Column Visibility Menu */}
          <div className="relative">
            <button
              onClick={() => setShowColumnsMenu(!showColumnsMenu)}
              className="p-2 rounded-xl border border-white/10 bg-[#141724] text-slate-300 hover:text-white hover:border-white/20 cursor-pointer"
              title="Column Visibility"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {showColumnsMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-[#0e121d] border border-white/15 rounded-xl shadow-2xl p-3 z-30 space-y-2 text-xs">
                <span className="font-semibold text-white block pb-1 border-b border-white/10">Visible Columns</span>
                {Object.keys(visibleColumns).map(col => (
                  <label key={col} className="flex items-center gap-2 cursor-pointer capitalize text-slate-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={visibleColumns[col]}
                      onChange={(e) => setVisibleColumns({ ...visibleColumns, [col]: e.target.checked })}
                      className="rounded border-white/20 bg-[#141724] text-[#d4ff00] focus:ring-0"
                    />
                    <span>{col.replace(/([A-Z])/g, ' $1')}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="p-3 bg-[#141724] border border-white/15 text-white rounded-xl flex items-center justify-between text-xs shadow-xl animate-in fade-in-50">
          <span className="font-medium text-slate-200">
            <strong className="text-[#d4ff00]">{selectedIds.size}</strong> athlete(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNotifyTargetUser(null);
                setNotifyTargetUserIds(Array.from(selectedIds));
                setNotifyModalOpen(true);
              }}
              className="px-3 py-1 bg-[#1e2333] hover:bg-[#252c40] text-slate-200 font-medium text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Broadcast Notice</span>
            </button>
            <button
              onClick={handleBulkGrantHigh}
              className="px-3 py-1 bg-[#d4ff00] hover:bg-[#a3e635] text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-md shadow-[#d4ff00]/20"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Grant High Plan</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. CRM Athletes Data Table */}
      <div className="bg-[#0e121d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {loading ? (
          <AdminLoadingSkeleton rows={10} />
        ) : users.length === 0 ? (
          <AdminEmptyState
            title="No athletes match your query"
            description="Try changing your search keywords or reset your status & plan filters."
            actionLabel="Reset Filters"
            onAction={() => { setSearch(''); setPlanFilter(''); setStatusFilter(''); setActiveTabFilter('ALL'); }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-[#07090e] text-slate-400 font-semibold tracking-wider text-[11px] uppercase">
                  <th className="p-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === users.length && users.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-white/20 bg-[#141724] text-[#d4ff00] focus:ring-0 cursor-pointer"
                    />
                  </th>
                  {visibleColumns.user && (
                    <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('full_name')}>
                      Athlete <ArrowUpDown className="w-3 h-3 inline ml-1 text-slate-500" />
                    </th>
                  )}
                  {visibleColumns.activeness && (
                    <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('days_dormant')}>
                      Activeness <ArrowUpDown className="w-3 h-3 inline ml-1 text-slate-500" />
                    </th>
                  )}
                  {visibleColumns.plan && <th className="p-4">Subscription Tier</th>}
                  {visibleColumns.countdown && (
                    <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('days_remaining')}>
                      Subscription Countdown & Renewal <ArrowUpDown className="w-3 h-3 inline ml-1 text-slate-500" />
                    </th>
                  )}
                  {visibleColumns.workouts && <th className="p-4 text-center">Workouts</th>}
                  {visibleColumns.nutrition && <th className="p-4 text-center">Meals</th>}
                  {visibleColumns.joined && (
                    <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('signup_date')}>
                      Joined <ArrowUpDown className="w-3 h-3 inline ml-1 text-slate-500" />
                    </th>
                  )}
                  {visibleColumns.actions && <th className="p-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {users.map(u => {
                  const isSelected = selectedIds.has(u.id);
                  const isPaid = u.subscription_plan && u.subscription_plan !== 'FREE';
                  const isSuper = u.role === 'Super Admin';

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-[#141828]/60 transition-colors ${
                        isSelected ? 'bg-[#181d30]/60' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectUser(u.id)}
                          className="rounded border-white/20 bg-[#141724] text-[#d4ff00] focus:ring-0 cursor-pointer"
                        />
                      </td>

                      {/* Athlete Column */}
                      {visibleColumns.user && (
                        <td className="p-4">
                          <div
                            onClick={() => onSelectUser && onSelectUser(u)}
                            className="flex items-center gap-3 cursor-pointer group"
                          >
                            <div className="relative">
                              <img
                                src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&background=0f172a&color=fff`}
                                alt={u.full_name}
                                className="w-9 h-9 rounded-full object-cover shrink-0 border border-white/10"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&background=0f172a&color=fff`;
                                }}
                              />
                              {u.is_regular_active && (
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0e121d]" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white group-hover:text-[#d4ff00] transition-colors">
                                  {u.full_name || 'Calyxo Athlete'}
                                </span>
                                {isSuper ? (
                                  <span className="px-1.5 py-0.2 rounded bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30 text-[9px] font-mono font-bold uppercase">
                                    Super Admin
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[9px] font-mono font-medium">
                                    User
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block">{u.email}</span>
                              <span className="text-[9px] text-slate-500 font-mono">UUID: {u.id?.substring(0, 8)}...</span>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Activeness Column (Based on actual logs in past 7 days) */}
                      {visibleColumns.activeness && (
                        <td className="p-4">
                          {u.status === 'Suspended' ? (
                            <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              Suspended
                            </span>
                          ) : u.is_regular_active ? (
                            <div>
                              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Active
                              </span>
                              <span className="text-[11px] text-slate-400 block font-mono">
                                {u.last_active_label}
                              </span>
                            </div>
                          ) : (
                            <div>
                              <span className="inline-flex items-center gap-1.5 text-slate-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-slate-500" />
                                Inactive
                              </span>
                              <span className="text-[11px] text-slate-500 block font-mono">
                                {u.last_active_label}
                              </span>
                            </div>
                          )}
                        </td>
                      )}

                      {/* Subscription Tier */}
                      {visibleColumns.plan && (
                        <td className="p-4">
                          <AdminStatusBadge status={u.subscription_plan === 'HIGH_ANNUAL' ? 'High Annual' : (u.subscription_plan === 'HIGH' ? 'High Plan' : 'Free')} />
                        </td>
                      )}

                      {/* Subscription Countdown & Renewal Tracking */}
                      {visibleColumns.countdown && (
                        <td className="p-4">
                          {isPaid ? (
                            <div className="space-y-1">
                              <AdminCountdownBadge 
                                days={u.days_remaining} 
                                hours={u.hours_remaining}
                                isExpiringSoon={u.is_expiring_soon}
                              />
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                                <span>Expires: {u.subscription_expiry}</span>
                                {u.is_expiring_soon && (
                                  <span className="text-amber-400 font-bold">(Renewal Due)</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800 text-slate-400 border border-white/5">
                                {u.renewal_status || 'Free Version'}
                              </span>
                              <span className="text-[10px] text-slate-500 block font-mono mt-0.5">
                                {u.renewal_status?.includes('Turned In') ? 'Previously Subscribed' : 'Never Subscribed'}
                              </span>
                            </div>
                          )}
                        </td>
                      )}

                      {/* Workouts Count */}
                      {visibleColumns.workouts && (
                        <td className="p-4 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-[#141724] border border-white/5 text-slate-300 font-mono font-semibold">
                            {u.total_workouts || 0}
                          </span>
                        </td>
                      )}

                      {/* Nutrition Meals Count */}
                      {visibleColumns.nutrition && (
                        <td className="p-4 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-[#141724] border border-white/5 text-slate-300 font-mono font-semibold">
                            {u.total_meals || 0}
                          </span>
                        </td>
                      )}

                      {/* Joined Date */}
                      {visibleColumns.joined && (
                        <td className="p-4 text-slate-400 font-mono text-[11px]">
                          {u.signup_date ? new Date(u.signup_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                        </td>
                      )}

                      {/* Actions */}
                      {visibleColumns.actions && (
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onSelectUser && onSelectUser(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                              title="Open 360 View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setNotifyTargetUser(u);
                                setNotifyTargetUserIds([]);
                                setNotifyModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-[#d4ff00] hover:bg-white/10 transition-colors cursor-pointer"
                              title={`Direct Message ${u.full_name || 'User'}`}
                            >
                              <Bell className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setGrantModalUser(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/10 transition-colors cursor-pointer"
                              title="Grant High Plan"
                            >
                              <Crown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSingleStatusChange(u.id, u.status)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/10 transition-colors cursor-pointer"
                              title={u.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleSingleDelete(u)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete Athlete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. Pagination Footer */}
        <div className="p-4 bg-[#090c14] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{users.length}</strong> of <strong className="text-white">{total}</strong> registered athletes
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-white/10 bg-[#141724] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300">
              Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-white/10 bg-[#141724] text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grant Premium Modal */}
      {grantModalUser && (
        <GrantPremiumModal
          user={grantModalUser}
          isOpen={Boolean(grantModalUser)}
          onClose={() => setGrantModalUser(null)}
          onSuccess={() => fetchUsers(true)}
        />
      )}

      {/* Direct Notification Composer */}
      {notifyModalOpen && (
        <NotificationComposerModal
          isOpen={notifyModalOpen}
          targetUser={notifyTargetUser}
          targetUserIds={notifyTargetUserIds}
          onClose={() => {
            setNotifyModalOpen(false);
            setNotifyTargetUser(null);
            setNotifyTargetUserIds([]);
          }}
          onSuccess={() => {
            fetchUsers(true);
            setSelectedIds(new Set());
          }}
        />
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={Boolean(confirmDialog)}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmLabel={confirmDialog.confirmLabel}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
};

export default AdminUsersView;

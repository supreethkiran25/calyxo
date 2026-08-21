import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Download,
  Crown,
  ChevronLeft,
  ChevronRight,
  Ban,
  Trash2,
  Edit,
  ArrowUpDown,
  Filter,
  CheckSquare,
  Shield,
  UserCheck,
  Bell
} from 'lucide-react';
import { toast } from 'sonner';
import { getAdminUsers, updateUserStatus, deleteUserAdmin, updateUserSubscription } from '../../services/adminService';
import GrantPremiumModal from '../../components/admin/GrantPremiumModal';
import NotificationComposerModal from '../../components/admin/NotificationComposerModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import useDebounce from '../../hooks/useDebounce';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';
import { AdminStatusBadge, AdminLoadingSkeleton, AdminEmptyState } from '../../components/admin/AdminUIPrimitives';

const AdminUsersView = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('signup_date');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(true);

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

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({
        search: debouncedSearch,
        planFilter,
        statusFilter,
        page,
        limit: 10,
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
    }
  }, [debouncedSearch, planFilter, statusFilter, page, sortBy, sortDir]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Subscribe to real-time changes
  useAdminRealtime(['user_profiles', 'subscriptions', 'users_metrics'], () => {
    fetchUsers();
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
      fetchUsers();
    } catch (e) {
      toast.error('Failed to update user status.');
    }
  };

  const handleSingleDelete = (user) => {
    setConfirmDialog({
      title: `Delete ${user.full_name || 'user'}?`,
      description: `This action will permanently delete ${user.email} and all associated records. This cannot be undone.`,
      confirmLabel: 'Delete user',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteUserAdmin(user.id);
          toast.success('User permanently deleted.');
          fetchUsers();
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
      description: `Are you sure you want to grant High plan access to ${count} selected user account(s)?`,
      confirmLabel: `Grant access (${count})`,
      onConfirm: async () => {
        try {
          for (const id of Array.from(selectedIds)) {
            await updateUserSubscription(id, 'HIGH', '12 Months', 'Bulk admin grant');
          }
          toast.success(`Granted High plan to ${count} users.`);
          setSelectedIds(new Set());
          fetchUsers();
        } catch (e) {
          toast.error('Bulk grant failed: ' + e.message);
        }
      }
    });
  };

  const exportCSV = () => {
    let csv = 'ID,Full Name,Email,Signup Date,Subscription Plan,Status\n';
    users.forEach(u => {
      csv += `"${u.id}","${u.full_name}","${u.email}","${u.signup_date}","${u.subscription_plan}","${u.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calyxo_users_export_page_${page}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-800/80">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Registered Athletes Directory</h2>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Manage user accounts, roles, and premium subscription access ({total.toLocaleString()} total members)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setNotifyTargetUser(null);
              setNotifyTargetUserIds([]);
              setNotifyModalOpen(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Broadcast Notification</span>
          </button>
          <button
            onClick={exportCSV}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold border border-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-neutral-900/90 border border-neutral-800/80 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, or user ID..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-colors font-mono"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
            className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-blue-500 font-mono cursor-pointer"
          >
            <option value="">All Plans</option>
            <option value="HIGH">High Plan</option>
            <option value="FREE">Free Tier</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-neutral-300 focus:outline-none focus:border-blue-500 font-mono cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Bulk Selection Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl flex items-center justify-between text-xs text-blue-300">
          <span className="font-mono font-semibold">
            {selectedIds.size} user(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNotifyTargetUser(null);
                setNotifyTargetUserIds(Array.from(selectedIds));
                setNotifyModalOpen(true);
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Notify Selected ({selectedIds.size})</span>
            </button>
            <button
              onClick={handleBulkGrantHigh}
              className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Grant High plan</span>
            </button>
          </div>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <AdminLoadingSkeleton rows={10} />
        ) : users.length === 0 ? (
          <AdminEmptyState
            title="No users match your criteria"
            description="Try clearing your search query or reset your status filters."
            actionLabel="Reset Filters"
            onAction={() => { setSearch(''); setPlanFilter(''); setStatusFilter(''); }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-mono uppercase text-[10px]">
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === users.length && users.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-neutral-700 text-blue-600 focus:ring-0 cursor-pointer"
                    />
                  </th>
                  <th className="p-3.5 font-bold cursor-pointer hover:text-white" onClick={() => handleSort('full_name')}>
                    Athlete <ArrowUpDown className="w-3 h-3 inline ml-1" />
                  </th>
                  <th className="p-3.5 font-bold">Plan</th>
                  <th className="p-3.5 font-bold">Status</th>
                  <th className="p-3.5 font-bold cursor-pointer hover:text-white" onClick={() => handleSort('signup_date')}>
                    Joined <ArrowUpDown className="w-3 h-3 inline ml-1" />
                  </th>
                  <th className="p-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {users.map(u => {
                  const isSelected = selectedIds.has(u.id);
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-neutral-800/50 transition-colors ${
                        isSelected ? 'bg-blue-500/5' : ''
                      }`}
                    >
                      <td className="p-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectUser(u.id)}
                          className="rounded border-neutral-700 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="p-3.5">
                        <div
                          onClick={() => onSelectUser && onSelectUser(u)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <img
                            src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'User')}&background=1a1a2e&color=3B82F6&bold=true`}
                            alt={u.full_name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&background=1a1a2e&color=3B82F6`;
                            }}
                            className="w-8 h-8 rounded-xl object-cover border border-neutral-800 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white group-hover:text-blue-400 transition-colors block">
                              {u.full_name}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">{u.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <AdminStatusBadge status={u.subscription_plan || 'FREE'} />
                      </td>
                      <td className="p-3.5">
                        <AdminStatusBadge status={u.status || 'Active'} />
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-neutral-400">
                        {u.signup_date}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setNotifyTargetUser(u);
                              setNotifyTargetUserIds([]);
                              setNotifyModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                            title={`Send Notification to ${u.full_name || 'User'}`}
                          >
                            <Bell className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setGrantModalUser(u)}
                            className="p-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                            title="Grant High Plan"
                          >
                            <Crown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSingleStatusChange(u.id, u.status)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors cursor-pointer"
                            title={u.status === 'Suspended' ? 'Activate' : 'Suspend'}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleSingleDelete(u)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Server Pagination Controls */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>Page {page} of {totalPages} ({total} members)</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:text-white disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grant Access Modal */}
      <GrantPremiumModal
        isOpen={Boolean(grantModalUser)}
        user={grantModalUser}
        onClose={() => setGrantModalUser(null)}
        onSuccess={() => {
          setGrantModalUser(null);
          fetchUsers();
        }}
      />

      {/* Notification Composer Modal */}
      <NotificationComposerModal
        isOpen={notifyModalOpen}
        onClose={() => {
          setNotifyModalOpen(false);
          setNotifyTargetUser(null);
          setNotifyTargetUserIds([]);
        }}
        onSuccess={() => {
          fetchUsers();
        }}
        initialTargetUser={notifyTargetUser}
        initialTargetUserIds={notifyTargetUserIds}
      />

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={true}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmLabel={confirmDialog.confirmLabel}
          variant={confirmDialog.variant}
          onConfirm={async () => {
            await confirmDialog.onConfirm();
            setConfirmDialog(null);
          }}
          onClose={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
};

export default AdminUsersView;

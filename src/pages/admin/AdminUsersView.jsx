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
  CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { getAdminUsers, updateUserStatus, deleteUserAdmin, updateUserSubscription } from '../../services/adminService';
import GrantPremiumModal from '../../components/admin/GrantPremiumModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import useDebounce from '../../hooks/useDebounce';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';

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

  // Bulk actions state
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmDialog, setConfirmDialog] = useState(null);

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

  // Subscribe to real-time changes in user profiles and subscriptions
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

  const handleExportCSV = (exportList = users) => {
    let csv = 'ID,Full Name,Email,Phone,Age,Gender,Country,Signup Date,Last Active,Subscription,Goal,Streak,Calories Logged,Status\n';
    exportList.forEach(u => {
      csv += `"${u.id}","${u.full_name}","${u.email}","${u.phone}",${u.age},"${u.gender}","${u.country}","${u.signup_date}","${u.last_active}","${u.subscription_plan}","${u.goal}",${u.streak},${u.calories_logged},"${u.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `calyxo_users_export_page_${page}.csv`;
    a.click();
    toast.success(`Exported ${exportList.length} users to CSV.`);
  };

  const handleBulkSuspend = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    setConfirmDialog({
      title: `Suspend ${count} selected users`,
      description: `Are you sure you want to suspend access for ${count} selected user account(s)?`,
      confirmLabel: `Suspend ${count} users`,
      variant: 'danger',
      onConfirm: async () => {
        try {
          for (const id of selectedIds) {
            await updateUserStatus(id, 'Suspended', 'Bulk admin suspension');
          }
          toast.success(`Suspended ${count} user accounts.`);
          setSelectedIds(new Set());
          fetchUsers();
        } catch (e) {
          toast.error('Bulk suspension failed: ' + e.message);
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleBulkGrantHigh = () => {
    const count = selectedIds.size;
    if (count === 0) return;
    setConfirmDialog({
      title: `Grant High plan to ${count} users`,
      description: `Are you sure you want to grant High plan access to ${count} selected user account(s)?`,
      confirmLabel: `Grant access (${count})`,
      variant: 'default',
      onConfirm: async () => {
        try {
          for (const id of selectedIds) {
            await updateUserSubscription(id, 'HIGH', '12 Months', 'Bulk admin grant');
          }
          toast.success(`Granted High plan to ${count} users.`);
          setSelectedIds(new Set());
          fetchUsers();
        } catch (e) {
          toast.error('Bulk grant failed: ' + e.message);
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  const handleDeleteUser = (userToDelete) => {
    setConfirmDialog({
      title: 'Delete user account',
      description: `Are you sure you want to permanently delete user ${userToDelete.full_name} (${userToDelete.email})? This action cannot be undone.`,
      confirmLabel: 'Delete permanently',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteUserAdmin(userToDelete.id);
          toast.success(`User ${userToDelete.full_name} deleted.`);
          fetchUsers();
        } catch (err) {
          toast.error(`Failed to delete user: ${err.message}`);
        } finally {
          setConfirmDialog(null);
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Users</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            User directory and account management — {total} registered users
          </p>
        </div>

        <button
          onClick={() => handleExportCSV(users)}
          className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-neutral-400" /> Export CSV
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar">
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All subscription tiers</option>
            <option value="FREE">Free tier</option>
            <option value="HIGH">High tier</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 flex items-center gap-3 shadow-none text-sm z-40">
          <span className="text-white font-medium flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-blue-400" />
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkGrantHigh}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 text-xs font-semibold cursor-pointer"
            >
              Grant access
            </button>
            <button
              onClick={handleBulkSuspend}
              className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-xs font-semibold cursor-pointer"
            >
              Suspend
            </button>
            <button
              onClick={() => handleExportCSV(users.filter(u => selectedIds.has(u.id)))}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 text-xs font-semibold cursor-pointer"
            >
              Export
            </button>
          </div>
        </div>
      )}

      {/* Users Datatable Container */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === users.length && users.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-neutral-700 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="p-4">User</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('subscription_plan')}>
                  <div className="flex items-center gap-1">Tier <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4">Expiry</th>
                <th className="p-4">Location</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('streak')}>
                  <div className="flex items-center gap-1">Streak <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('calories_logged')}>
                  <div className="flex items-center gap-1">Calories <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort('last_active')}>
                  <div className="flex items-center gap-1">Last active <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {loading ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-neutral-500 font-mono">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-neutral-500 font-mono">
                    No matching users found
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr
                    key={u.id}
                    className={`hover:bg-neutral-800/50 transition-colors group cursor-pointer ${
                      selectedIds.has(u.id) ? 'bg-blue-500/5' : ''
                    }`}
                    onClick={() => {
                      if (onSelectUser) onSelectUser(u);
                    }}
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(u.id)}
                        onChange={() => toggleSelectUser(u.id)}
                        className="rounded border-neutral-700 text-blue-600 focus:ring-0 cursor-pointer"
                      />
                    </td>

                    {/* User Profile */}
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
                          <span className="text-sm font-medium text-white block group-hover:text-blue-400 transition-colors">
                            {u.full_name}
                          </span>
                          <span className="text-[11px] text-neutral-500 font-mono">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="p-4">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                        u.subscription_plan === 'FREE' 
                          ? 'bg-neutral-800 text-neutral-400 border-neutral-700' 
                          : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      }`}>
                        {u.subscription_plan || 'FREE'}
                      </span>
                    </td>

                    {/* Expiry */}
                    <td className="p-4 font-mono text-[11px] text-neutral-400">
                      {u.subscription_expiry || 'N/A'}
                    </td>

                    {/* Country & Info */}
                    <td className="p-4 text-neutral-300 text-xs">
                      {u.country || 'N/A'}
                    </td>

                    {/* Streak */}
                    <td className="p-4 text-sm text-white">
                      🔥 {u.streak || 0}d
                    </td>

                    {/* Calories Logged */}
                    <td className="p-4 font-mono text-neutral-300 text-xs">
                      {(u.calories_logged || 0).toLocaleString()} kcal
                    </td>

                    {/* Last Active */}
                    <td className="p-4 font-mono text-neutral-400 text-[11px]">
                      {u.last_active}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                        u.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setGrantModalUser(u)}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer"
                          title="Grant access"
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              const newStatus = u.status === 'Active' ? 'Suspended' : 'Active';
                              await updateUserStatus(u.id, newStatus, 'Admin toggle');
                              toast.success(`User status updated to ${newStatus}`);
                              await fetchUsers();
                            } catch (err) {
                              toast.error(`Failed to update status: ${err.message}`);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title={u.status === 'Active' ? 'Suspend' : 'Activate'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (onSelectUser) onSelectUser(u);
                          }}
                          className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-neutral-950 border-t border-neutral-800 p-4 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
          <span>Page {page} of {totalPages} ({total} users)</span>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="p-1 rounded bg-neutral-900 border border-neutral-800 disabled:opacity-50 hover:bg-neutral-800 text-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1 rounded bg-neutral-900 border border-neutral-800 disabled:opacity-50 hover:bg-neutral-800 text-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grant Premium Modal */}
      {grantModalUser && (
        <GrantPremiumModal
          isOpen={!!grantModalUser}
          user={grantModalUser}
          onClose={() => setGrantModalUser(null)}
          onSuccess={fetchUsers}
        />
      )}

      {/* Reusable Confirm Dialog */}
      {confirmDialog && (
        <ConfirmDialog
          isOpen={!!confirmDialog}
          title={confirmDialog.title}
          description={confirmDialog.description}
          confirmLabel={confirmDialog.confirmLabel}
          variant={confirmDialog.variant}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </div>
  );
};

export default AdminUsersView;

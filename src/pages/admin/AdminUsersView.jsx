import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Download,
  Plus,
  Crown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Ban,
  CheckCircle,
  Trash2,
  Edit,
  Flame,
  ArrowUpDown
} from 'lucide-react';
import { getAdminUsers, updateUserStatus } from '../../services/adminService';
import GrantPremiumModal from '../../components/admin/GrantPremiumModal';

const AdminUsersView = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('signup_date');
  const [sortDir, setSortDir] = useState('desc');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [grantModalUser, setGrantModalUser] = useState(null);
  const outletCtx = useOutletContext();
  const onSelectUser = outletCtx?.onSelectUser;

  const fetchUsers = async () => {
    setLoading(true);
    const res = await getAdminUsers({
      search,
      planFilter,
      statusFilter,
      page,
      limit: 10,
      sortBy,
      sortDir
    });
    setUsers(res.users);
    setTotal(res.total);
    setTotalPages(res.totalPages);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [search, planFilter, statusFilter, page, sortBy, sortDir]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const handleExportCSV = () => {
    let csv = 'ID,Full Name,Email,Phone,Age,Gender,Country,Signup Date,Last Active,Subscription,Goal,Streak,Calories Logged,Status\n';
    users.forEach(u => {
      csv += `"${u.id}","${u.full_name}","${u.email}","${u.phone}",${u.age},"${u.gender}","${u.country}","${u.signup_date}","${u.last_active}","${u.subscription_plan}","${u.goal}",${u.streak},${u.calories_logged},"${u.status}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `calyxo_users_export_page_${page}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" /> User Directory & Accounts
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Total {total} registered users found in system
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-neutral-400" /> Export CSV
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, country..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto custom-scrollbar">
          {/* Subscription Filter */}
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="">All Subscription Tiers</option>
            <option value="FREE">Free Tier</option>
            <option value="HIGH">High Tier</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="">All User Statuses</option>
            <option value="Active">Active Accounts</option>
            <option value="Suspended">Suspended Accounts</option>
          </select>
        </div>
      </div>

      {/* Users Datatable */}
      <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-4 font-bold">User Profile</th>
                <th className="p-4 font-bold cursor-pointer" onClick={() => handleSort('subscription_plan')}>
                  <div className="flex items-center gap-1">Tier <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 font-bold">Expiry & Days Left</th>
                <th className="p-4 font-bold">Country & Info</th>
                <th className="p-4 font-bold cursor-pointer" onClick={() => handleSort('streak')}>
                  <div className="flex items-center gap-1">Streak <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 font-bold cursor-pointer" onClick={() => handleSort('last_active')}>
                  <div className="flex items-center gap-1">Last Active <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-neutral-500 font-mono animate-pulse">
                    Loading enterprise user directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-neutral-500 font-mono">
                    No matching users found. Try refining search filters.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr
                    key={u.id}
                    className="hover:bg-neutral-800/40 transition-colors group cursor-pointer"
                    onClick={() => onSelectUser && onSelectUser(u)}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={u.photoURL} alt="" className="w-10 h-10 rounded-xl object-cover border border-neutral-700" />
                        <div>
                          <span className="font-bold text-white text-sm block group-hover:text-indigo-400 transition-colors">
                            {u.full_name}
                          </span>
                          <span className="text-neutral-500 text-[11px] font-mono">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                        u.subscription_plan === 'FREE' 
                          ? 'bg-neutral-800 text-neutral-400 border-neutral-700' 
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      }`}>
                        {u.subscription_plan}
                      </span>
                    </td>

                    <td className="p-4 font-mono text-[11px]">
                      <span className="text-neutral-300 font-semibold block">{u.subscription_expiry || 'N/A'}</span>
                      <span className="text-amber-400">{u.days_remaining ? `${u.days_remaining} days left` : ''}</span>
                    </td>

                    <td className="p-4">
                      <span className="text-neutral-300 font-medium block">{u.country}</span>
                      <span className="text-neutral-500 text-[11px]">{u.age} y/o • {u.gender}</span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-amber-400 flex items-center gap-1 font-mono">
                        <Flame className="w-3.5 h-3.5" /> {u.streak}d
                      </span>
                    </td>

                    <td className="p-4 font-mono text-neutral-300">
                      {(u.calories_logged || 0).toLocaleString()} kcal
                    </td>

                    <td className="p-4 font-mono text-neutral-400 text-[11px]">
                      {u.last_active}
                    </td>

                    <td className="p-4">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        u.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setGrantModalUser(u)}
                          className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                          title="Grant Premium"
                        >
                          <Crown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onSelectUser && onSelectUser(u)}
                          className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors"
                          title="Inspect Detailed Profile"
                        >
                          <Edit className="w-4 h-4" />
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
        <div className="p-4 bg-neutral-950/80 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400 font-mono">
          <span>Showing page {page} of {totalPages} ({total} users total)</span>

          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(p - 1, 1))}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 disabled:opacity-50 hover:bg-neutral-800 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {page}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 disabled:opacity-50 hover:bg-neutral-800 text-white"
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
    </div>
  );
};

export default AdminUsersView;

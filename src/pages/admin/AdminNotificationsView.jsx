import React, { useState, useEffect } from 'react';
import { Bell, Plus, Send, Search, Trash2, Smartphone, Users } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminNotifications, deleteAdminNotification } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';
import NotificationComposerModal from '../../components/admin/NotificationComposerModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const AdminNotificationsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('ALL');
  const [pushDevicesCount, setPushDevicesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const [list, pushRes] = await Promise.all([
        getAdminNotifications(),
        supabase.from('push_subscriptions').select('*', { count: 'exact', head: true })
      ]);
      setNotifications(list || []);
      if (pushRes?.count !== null) setPushDevicesCount(pushRes.count || 0);
    } catch (e) {
      // Non-fatal fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();

    const channel = supabase
      .channel('admin_notifications_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_notifications' }, () => fetchNotifs())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'push_subscriptions' }, () => fetchNotifs())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const confirmDeleteNotif = async () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setNotifications(prev => prev.filter(n => n.id !== targetId));
    setDeleteTarget(null);
    try {
      await deleteAdminNotification(targetId);
      toast.success('Campaign deleted successfully.');
    } catch (err) {
      toast.error('Failed to delete campaign.');
      fetchNotifs();
    }
  };

  const filteredNotifs = notifications.filter(n => {
    const matchesSearch = !search || (n.title && n.title.toLowerCase().includes(search.toLowerCase())) || (n.body && n.body.toLowerCase().includes(search.toLowerCase()));
    const matchesAudience = audienceFilter === 'ALL' || n.audience === audienceFilter;
    return matchesSearch && matchesAudience;
  });

  const totalDelivered = notifications.reduce((acc, curr) => acc + (Number(curr.delivered) || 0), 0);
  const totalClicks = notifications.reduce((acc, curr) => acc + (Number(curr.clicks) || 0), 0);
  const avgClickRate = totalDelivered > 0 ? ((totalClicks / totalDelivered) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">Push notifications</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Broadcast campaigns and delivery analytics
          </p>
        </div>

        <button
          onClick={() => setComposerOpen(true)}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> New broadcast
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Push devices
            </span>
            <Smartphone className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">{pushDevicesCount.toLocaleString()}</div>
          <div className="text-[11px] text-neutral-500">Registered devices</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Campaigns sent
            </span>
            <Send className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-white">{notifications.length}</div>
          <div className="text-[11px] text-neutral-500">Broadcast history</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Total delivered
            </span>
            <Bell className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-emerald-400">{totalDelivered.toLocaleString()}</div>
          <div className="text-[11px] text-neutral-500">Delivered popups</div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Engagement rate
            </span>
            <Users className="w-4 h-4 text-neutral-600" />
          </div>
          <div className="text-2xl font-semibold text-amber-400">{avgClickRate}%</div>
          <div className="text-[11px] text-neutral-500">{totalClicks} total clicks</div>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          />
        </div>

        <select
          value={audienceFilter}
          onChange={(e) => setAudienceFilter(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none w-full md:w-auto"
        >
          <option value="ALL">All audiences</option>
          <option value="Everyone">Everyone</option>
          <option value="Premium Users">Premium users</option>
          <option value="Free Users">Free users</option>
          <option value="Direct User">Direct user</option>
        </select>
      </div>

      {/* Broadcast History Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-neutral-500" /> Broadcast history ({filteredNotifs.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            </div>
          ) : filteredNotifs.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-600 font-mono">
              No broadcast campaigns found
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950 border-b border-neutral-800 text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
                <tr>
                  <th className="p-4">Notification</th>
                  <th className="p-4">Audience</th>
                  <th className="p-4">Sent</th>
                  <th className="p-4">Delivered</th>
                  <th className="p-4">Clicks</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {filteredNotifs.map(n => {
                  const ctr = n.delivered > 0 ? (((n.clicks || 0) / n.delivered) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={n.id} className="hover:bg-neutral-800/50 transition-colors">
                      <td className="p-4">
                        <span className="font-medium text-white block text-sm">{n.title}</span>
                        <span className="text-neutral-400 text-[11px] mt-0.5 block">{n.body}</span>
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-medium px-2 py-0.5 rounded">
                          {n.audience}
                        </span>
                      </td>
                      <td className="p-4 text-neutral-400 font-mono text-[11px]">
                        {n.sent_at ? (n.sent_at.length > 16 ? n.sent_at.replace('T', ' ').substring(0, 16) : n.sent_at) : 'N/A'}
                      </td>
                      <td className="p-4 text-white font-mono text-xs">{n.delivered}</td>
                      <td className="p-4 text-neutral-300 font-mono text-xs">
                        {n.clicks || 0} ({ctr}%)
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setDeleteTarget(n)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <NotificationComposerModal
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSuccess={fetchNotifs}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete campaign"
        description={`Are you sure you want to delete the campaign "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDeleteNotif}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminNotificationsView;

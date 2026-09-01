import React, { useState, useEffect } from 'react';
import { Bell, Plus, Send, Smartphone, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { getAdminNotifications, deleteAdminNotification } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';
import NotificationComposerModal from '../../components/admin/NotificationComposerModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import {
  AdminPageHeader,
  AdminStatCard,
  AdminSearchInput,
  AdminStatusBadge,
  AdminLoadingSkeleton,
  AdminEmptyState
} from '../../components/admin/AdminUIPrimitives';

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
      toast.success('Campaign deleted.');
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
      {/* 1. Header */}
      <AdminPageHeader
        title="Notifications"
        description="Push broadcast campaigns, recipient segmentation, and engagement rates"
        badge={`${pushDevicesCount} devices`}
        actions={
          <button
            onClick={() => setComposerOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold flex items-center gap-1.5 border border-neutral-800 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Broadcast</span>
          </button>
        }
      />

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <AdminStatCard
          title="Push Devices"
          value={pushDevicesCount.toLocaleString()}
          icon={Smartphone}
          subtitle="Registered tokens"
        />
        <AdminStatCard
          title="Campaigns Sent"
          value={notifications.length.toString()}
          icon={Send}
          subtitle="Total broadcasts"
        />
        <AdminStatCard
          title="Total Delivered"
          value={totalDelivered.toLocaleString()}
          icon={Bell}
          subtitle="In-app & push notices"
        />
        <AdminStatCard
          title="Engagement Rate"
          value={`${avgClickRate}%`}
          icon={Users}
          subtitle={`${totalClicks} total clicks`}
        />
      </div>

      {/* 3. Filter Controls */}
      <div className="p-3 bg-neutral-900/90 border border-neutral-800/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Filter campaigns..."
          onClear={() => setSearch('')}
        />

        <select
          value={audienceFilter}
          onChange={(e) => setAudienceFilter(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs font-mono rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-neutral-700 cursor-pointer"
        >
          <option value="ALL">All Audiences</option>
          <option value="Everyone">Everyone</option>
          <option value="Premium Users">Premium Users</option>
          <option value="Free Users">Free Users</option>
          <option value="Direct User">Direct User</option>
        </select>
      </div>

      {/* 4. Broadcast History Table */}
      <div className="bg-neutral-900/90 border border-neutral-800/80 rounded-xl overflow-hidden">
        {loading ? (
          <AdminLoadingSkeleton rows={5} />
        ) : filteredNotifs.length === 0 ? (
          <AdminEmptyState
            title="No broadcast campaigns found"
            description="Create a new notification broadcast to announce platform updates."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-400 font-mono uppercase text-[10px]">
                  <th className="p-3.5 font-bold">Campaign</th>
                  <th className="p-3.5 font-bold">Audience</th>
                  <th className="p-3.5 font-bold">Delivered</th>
                  <th className="p-3.5 font-bold">Clicks (CTR)</th>
                  <th className="p-3.5 font-bold">Sent</th>
                  <th className="p-3.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-sans">
                {filteredNotifs.map(n => {
                  const ctr = n.delivered > 0 ? (((n.clicks || 0) / n.delivered) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={n.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="p-3.5">
                        <span className="font-semibold text-white block">{n.title}</span>
                        <span className="text-neutral-400 text-[11px] mt-0.5 block truncate max-w-sm">{n.body}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-neutral-800 text-neutral-300 border border-neutral-700 text-[10px] font-mono px-2 py-0.5 rounded">
                          {n.audience}
                        </span>
                      </td>
                      <td className="p-3.5 text-neutral-300 font-mono text-xs">{n.delivered || 0}</td>
                      <td className="p-3.5 text-neutral-300 font-mono text-xs">
                        {n.clicks || 0} ({ctr}%)
                      </td>
                      <td className="p-3.5 text-neutral-400 font-mono text-[11px]">
                        {n.sent_at ? (n.sent_at.length > 16 ? n.sent_at.replace('T', ' ').substring(0, 16) : n.sent_at) : 'N/A'}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setDeleteTarget(n)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Campaign"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NotificationComposerModal
        isOpen={composerOpen}
        onClose={() => setComposerOpen(false)}
        onSuccess={fetchNotifs}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete campaign"
        description={`Are you sure you want to delete the broadcast campaign "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDeleteNotif}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminNotificationsView;


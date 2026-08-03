import React, { useState, useEffect } from 'react';
import { Bell, Plus, Send, CheckCircle2, Eye, MousePointer, Search, Trash2, Smartphone, Users, Zap, RefreshCw } from 'lucide-react';
import { getAdminNotifications, deleteAdminNotification } from '../../services/adminService';
import { supabase } from '../../lib/supabaseClient';
import NotificationComposerModal from '../../components/admin/NotificationComposerModal';

const AdminNotificationsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('ALL');
  const [pushDevicesCount, setPushDevicesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

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
      console.warn('[AdminNotificationsView] Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();

    // Supabase Realtime Channel
    const channel = supabase
      .channel('admin_notifications_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_notifications' }, () => fetchNotifs())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'push_subscriptions' }, () => fetchNotifs())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDeleteNotif = async (id, title) => {
    if (window.confirm(`Delete broadcast campaign "${title}"?`)) {
      try {
        setDeletingId(id);
        await deleteAdminNotification(id);
        fetchNotifs();
      } catch (err) {
        alert('Failed to delete notification: ' + err.message);
      } finally {
        setDeletingId(null);
      }
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
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-400" /> Push Broadcast & Notification Hub
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Compose and broadcast push notifications to specific user segments or individual users
          </p>
        </div>

        <button
          onClick={() => setComposerOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Compose Broadcast
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Registered Push Devices</span>
          <span className="text-2xl font-bold text-indigo-400 block mt-1">{pushDevicesCount.toLocaleString()}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">W3C Push Subscriptions</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Total Campaigns Sent</span>
          <span className="text-2xl font-bold text-white block mt-1">{notifications.length}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Broadcast Hub History</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Total Delivered Popups</span>
          <span className="text-2xl font-bold text-emerald-400 block mt-1">{totalDelivered.toLocaleString()}</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">Live Recipient Deliveries</span>
        </div>
        <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800">
          <span className="text-xs text-neutral-400 font-medium block">Average CTR Engagement</span>
          <span className="text-2xl font-bold text-amber-400 block mt-1">{avgClickRate}%</span>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">{totalClicks} Total Clicks</span>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by title or text..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={audienceFilter}
          onChange={(e) => setAudienceFilter(e.target.value)}
          className="bg-neutral-950 border border-neutral-800 text-neutral-300 text-xs rounded-xl px-3 py-2 focus:outline-none w-full md:w-auto font-mono"
        >
          <option value="ALL">All Audiences</option>
          <option value="Everyone">Everyone (All Users)</option>
          <option value="Premium Users">Premium Users Only</option>
          <option value="Free Users">Free Users Only</option>
          <option value="Direct User">Direct Targeted User</option>
        </select>
      </div>

      {/* Broadcast History Table */}
      <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800/80 overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-400" /> Broadcast Campaign History ({filteredNotifs.length})
          </h3>
          <span className="text-xs text-neutral-500 font-mono">Live Telemetry Ledger</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
            </div>
          ) : filteredNotifs.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400 font-mono">
              No broadcast campaigns found. Click "Compose Broadcast" above to send your first push notification!
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[11px]">
                <tr>
                  <th className="p-4 font-bold">Notification Title & Content</th>
                  <th className="p-4 font-bold">Audience Target</th>
                  <th className="p-4 font-bold">Sent Timestamp</th>
                  <th className="p-4 font-bold">Delivered</th>
                  <th className="p-4 font-bold">Clicks / Engagement</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {filteredNotifs.map(n => (
                  <tr key={n.id} className="hover:bg-neutral-800/40 transition-colors">
                    <td className="p-4 font-sans">
                      <span className="font-bold text-white block text-sm">{n.title}</span>
                      <span className="text-neutral-400 text-[11px] mt-0.5 block">{n.body}</span>
                      {n.cta_link && (
                        <span className="text-[10px] text-indigo-400 font-mono mt-1 block">CTA Link: {n.cta_link}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                        {n.audience}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-400">
                      {n.sent_at ? (n.sent_at.length > 16 ? n.sent_at.replace('T', ' ').substring(0, 16) : n.sent_at) : 'N/A'}
                    </td>
                    <td className="p-4 text-emerald-400 font-bold">{n.delivered}</td>
                    <td className="p-4 text-amber-400 font-bold">
                      <span className="flex items-center gap-1">
                        <MousePointer className="w-3 h-3 text-amber-400" /> {n.clicks || 0} ({n.delivered > 0 ? (((n.clicks || 0) / n.delivered) * 100).toFixed(1) : '0.0'}%)
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        disabled={deletingId === n.id}
                        onClick={() => handleDeleteNotif(n.id, n.title)}
                        className="p-1.5 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-900/60 cursor-pointer disabled:opacity-50"
                        title="Delete Broadcast Campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
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
    </div>
  );
};

export default AdminNotificationsView;

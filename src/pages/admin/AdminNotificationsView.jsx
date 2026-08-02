import React, { useState, useEffect } from 'react';
import { Bell, Plus, Send, CheckCircle2, Eye, MousePointer } from 'lucide-react';
import { getAdminNotifications } from '../../services/adminService';
import NotificationComposerModal from '../../components/admin/NotificationComposerModal';

const AdminNotificationsView = () => {
  const [notifications, setNotifications] = useState([]);
  const [composerOpen, setComposerOpen] = useState(false);

  const fetchNotifs = async () => {
    const list = await getAdminNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-400" /> Push Broadcast & Notification Hub
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Compose and broadcast push notifications to specific user segments
          </p>
        </div>

        <button
          onClick={() => setComposerOpen(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Compose Broadcast
        </button>
      </div>

      {/* Broadcast History Table */}
      <div className="rounded-3xl bg-neutral-900/60 border border-neutral-800/80 overflow-hidden">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Recent Sent Broadcasts</h3>
          <span className="text-xs text-neutral-500 font-mono">{notifications.length} Sent</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950/80 border-b border-neutral-800 text-neutral-400 font-mono uppercase text-[11px]">
              <tr>
                <th className="p-4 font-bold">Notification Title & Content</th>
                <th className="p-4 font-bold">Audience</th>
                <th className="p-4 font-bold">Sent Time</th>
                <th className="p-4 font-bold">Delivered</th>
                <th className="p-4 font-bold">Clicks / Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60">
              {notifications.map(n => (
                <tr key={n.id} className="hover:bg-neutral-800/40 transition-colors">
                  <td className="p-4">
                    <span className="font-bold text-white block text-sm">{n.title}</span>
                    <span className="text-neutral-400 text-[11px] mt-0.5 block">{n.body}</span>
                  </td>
                  <td className="p-4 font-mono">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px]">
                      {n.audience}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-400 font-mono">{n.sent_at}</td>
                  <td className="p-4 font-mono text-emerald-400 font-bold">{n.delivered}</td>
                  <td className="p-4 font-mono text-amber-400 font-bold flex items-center gap-1">
                    <MousePointer className="w-3 h-3" /> {n.clicks} ({((n.clicks / n.delivered) * 100).toFixed(1)}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

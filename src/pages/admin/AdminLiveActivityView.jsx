import React, { useState, useEffect } from 'react';
import { Radio, Users, Dumbbell, Utensils, Crown, MessageSquare, IndianRupee, ShieldCheck, RefreshCw } from 'lucide-react';
import { getLivePlatformActivityStream } from '../../services/adminService';
import { useAdminRealtime } from '../../hooks/useAdminRealtime';
import { AdminPageHeader, AdminLoadingSkeleton } from '../../components/admin/AdminUIPrimitives';

const AdminLiveActivityView = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const list = await getLivePlatformActivityStream();
      setEvents(list || []);
    } catch (e) {
      console.warn('Live stream error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useAdminRealtime(['user_profiles', 'subscriptions', 'workout_logs', 'food_logs', 'admin_audit_logs'], () => {
    fetchEvents();
  });

  const filteredEvents = events.filter(e => {
    if (filter === 'ALL') return true;
    if (filter === 'PAYMENTS') return e.badge === 'PAYMENT';
    if (filter === 'USERS') return e.badge === 'USER';
    if (filter === 'PREMIUM') return e.badge === 'PREMIUM';
    if (filter === 'SYSTEM') return e.badge === 'SYSTEM' || e.badge === 'AUDIT';
    return true;
  });

  const getEventIcon = (type, badge) => {
    if (badge === 'PAYMENT') return IndianRupee;
    if (badge === 'PREMIUM') return Crown;
    if (badge === 'USER') return Users;
    if (badge === 'SYSTEM' || badge === 'AUDIT') return ShieldCheck;
    if (type?.includes('WORKOUT')) return Dumbbell;
    if (type?.includes('MEAL')) return Utensils;
    return Radio;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Live Activity Stream"
        description="Real-time chronological events, athlete logins, completed training sessions, and system operations"
        badge="Realtime Telemetry"
        actions={
          <button
            onClick={() => { setRefreshing(true); fetchEvents(); }}
            disabled={refreshing}
            className="p-2 rounded-xl bg-[#0e121d] border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            title="Refresh stream"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#0e121d] border border-white/10 rounded-2xl max-w-fit shadow-xl">
        {['ALL', 'USERS', 'PREMIUM', 'PAYMENTS', 'SYSTEM'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
              filter === f 
                ? 'bg-[#d4ff00] text-slate-950 font-bold shadow-md shadow-[#d4ff00]/15' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Stream List */}
      <div className="bg-[#0e121d] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
        {loading ? (
          <AdminLoadingSkeleton rows={8} />
        ) : filteredEvents.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            No active stream events recorded for this category.
          </div>
        ) : (
          <div className="divide-y divide-white/5 font-sans">
            {filteredEvents.map((ev) => {
              const Icon = getEventIcon(ev.type, ev.badge);
              return (
                <div key={ev.id} className="py-3.5 flex items-start gap-3.5 hover:bg-[#141828]/50 px-3 rounded-xl transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#141724] flex items-center justify-center text-[#d4ff00] shrink-0 mt-0.5 border border-white/10">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{ev.title}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#141724] text-slate-300 border border-white/10">
                        {ev.badge || 'EVENT'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{ev.subtitle}</p>
                  </div>
                  <span className="text-xs font-mono text-slate-500 shrink-0">{ev.time}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLiveActivityView;

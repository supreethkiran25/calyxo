import React, { useState, useEffect, useCallback } from 'react';
import { X, Bell, Send, User, Users, Search, Crown, CheckCircle2, Smartphone, Sparkles } from 'lucide-react';
import { sendAdminNotification, getAdminUsers } from '../../services/adminService';
import { toast } from 'sonner';
import useDebounce from '../../hooks/useDebounce';

const ROUTE_PRESETS = [
  { label: 'Home', route: '/user/dashboard' },
  { label: 'Workout', route: '/user/workout' },
  { label: 'Nutrition', route: '/user/nutrition' },
  { label: 'Recovery', route: '/user/health' },
  { label: 'Challenges', route: '/user/progress' },
  { label: 'AI Coach', route: '/user/ai' },
  { label: 'Profile', route: '/user/profile' },
];

const NotificationComposerModal = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  initialTargetUser = null,
  initialTargetUserIds = []
}) => {
  const [targetUser, setTargetUser] = useState(initialTargetUser);
  const [selectedUserIds, setSelectedUserIds] = useState(initialTargetUserIds);
  
  const [audience, setAudience] = useState(
    initialTargetUser ? 'Individual' : (initialTargetUserIds.length > 0 ? 'Selected' : 'Everyone')
  );

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    cta_label: 'View in App',
    cta_link: '/user/dashboard'
  });

  const [userSearch, setUserSearch] = useState('');
  const debouncedUserSearch = useDebounce(userSearch, 300);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sync props when opening modal
  useEffect(() => {
    if (isOpen) {
      if (initialTargetUser) {
        setTargetUser(initialTargetUser);
        setAudience('Individual');
      } else if (initialTargetUserIds && initialTargetUserIds.length > 0) {
        setSelectedUserIds(initialTargetUserIds);
        setAudience('Selected');
      } else {
        setAudience('Everyone');
      }
      setError('');
    }
  }, [isOpen, initialTargetUser, initialTargetUserIds]);

  // Initial load of athletes when modal opens or Individual tab is selected
  useEffect(() => {
    if (isOpen) {
      setIsSearchingUsers(true);
      getAdminUsers({ search: '', limit: 10 })
        .then(res => {
          setUserSearchResults(res.users || []);
        })
        .catch(err => {
          console.warn('[NotificationComposerModal] Preloading athletes notice:', err);
        })
        .finally(() => {
          setIsSearchingUsers(false);
        });
    }
  }, [isOpen]);

  // Live athlete search for individual targeting
  const searchUsers = useCallback(async (query) => {
    setIsSearchingUsers(true);
    try {
      const res = await getAdminUsers({ search: (query || '').trim(), limit: 12 });
      setUserSearchResults(res.users || []);
    } catch (e) {
      console.warn('Error searching users for notification:', e);
    } finally {
      setIsSearchingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (audience === 'Individual') {
      searchUsers(debouncedUserSearch);
    }
  }, [debouncedUserSearch, audience, searchUsers]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (audience === 'Individual' && !targetUser?.id) {
      setError('Please select an individual athlete to receive this notification.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        body: formData.body.trim(),
        audience: audience === 'Individual' 
          ? `Individual: ${targetUser?.full_name || targetUser?.email}` 
          : (audience === 'Selected' ? `Selected (${selectedUserIds.length} Athletes)` : audience),
        cta_label: formData.cta_label.trim() || 'View',
        cta_link: formData.cta_link.trim() || '/user/dashboard',
        userId: audience === 'Individual' ? (targetUser?.id || targetUser?.userId) : undefined,
        userIds: audience === 'Selected' ? Array.from(selectedUserIds) : undefined,
        targetUserName: targetUser?.full_name
      };

      await sendAdminNotification(payload);
      toast.success(
        audience === 'Individual'
          ? `Notification dispatched to ${targetUser?.full_name || 'Athlete'}!`
          : `Broadcast notification successfully sent to ${audience}!`
      );
      if (typeof onSuccess === 'function') onSuccess();
      onClose();
    } catch (err) {
      console.error('[NotificationComposerModal] Error dispatching notification:', err);
      setError(err.message || 'Failed to dispatch notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl overflow-hidden relative">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-blue-500/10 blur-2xl pointer-events-none rounded-full" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Dispatch App Notification</h3>
              <p className="text-[10px] text-neutral-400 font-mono">Realtime OS Push, In-App Banner & Inbox Sync</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target Audience Picker */}
          <div>
            <label className="text-neutral-300 font-semibold block mb-1.5">Target Audience</label>
            <div className="flex flex-wrap gap-1.5">
              {['Everyone', 'Individual', ...(selectedUserIds.length > 0 ? ['Selected'] : []), 'Premium Users', 'Free Users'].map(aud => (
                <button
                  key={aud}
                  type="button"
                  onClick={() => {
                    setAudience(aud);
                    setError('');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all border cursor-pointer text-xs flex items-center gap-1.5 ${
                    audience === aud
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 shadow-sm shadow-blue-500/20'
                      : 'bg-neutral-950/80 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {aud === 'Everyone' && <Users className="w-3 h-3" />}
                  {aud === 'Individual' && <User className="w-3 h-3" />}
                  {aud === 'Selected' && <CheckCircle2 className="w-3 h-3 text-acid-green" />}
                  {aud === 'Premium Users' && <Crown className="w-3 h-3 text-amber-400" />}
                  {aud === 'Free Users' && <User className="w-3 h-3 text-slate-400" />}
                  <span>{aud === 'Selected' ? `Selected (${selectedUserIds.length})` : aud}</span>
                </button>
              ))}
            </div>

            {/* Audience Context Info Banner */}
            <div className="mt-2 text-[11px] text-neutral-400 bg-neutral-950/60 p-2 rounded-xl border border-neutral-800/80">
              {audience === 'Everyone' && '🌐 Dispatches to all active athletes across iOS, Android, and Web.'}
              {audience === 'Individual' && (targetUser ? `🎯 Targeted to: ${targetUser.full_name || targetUser.email}` : '🔍 Select an athlete from the list below.')}
              {audience === 'Premium Users' && '👑 Dispatches exclusively to all Calyxo High / Pro Tier subscribers.'}
              {audience === 'Free Users' && '🌱 Dispatches to all Standard / Free tier athletes.'}
              {audience === 'Selected' && `✅ Dispatches to ${selectedUserIds.length} specifically selected athletes.`}
            </div>
          </div>

          {/* Individual Athlete Search / Selected Pill */}
          {audience === 'Individual' && (
            <div className="p-3 rounded-2xl bg-neutral-950/80 border border-blue-500/30 space-y-2.5">
              {targetUser ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 border border-blue-500/40 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={targetUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(targetUser.full_name || 'User')}&background=1a1a2e&color=3B82F6&bold=true`}
                      alt={targetUser.full_name}
                      className="w-8 h-8 rounded-lg object-cover border border-neutral-700"
                    />
                    <div>
                      <span className="font-bold text-white text-xs block leading-tight">{targetUser.full_name || 'Athlete'}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">{targetUser.email}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetUser(null);
                      setUserSearch('');
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 font-bold cursor-pointer transition-colors"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-neutral-300 block">Select or Search Athlete Directory</label>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Type name, email, or user ID..."
                      className="w-full pl-8 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white text-xs placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Dropdown Results */}
                  <div className="max-h-44 overflow-y-auto space-y-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl">
                    {userSearchResults.length > 0 ? (
                      userSearchResults.map(u => (
                        <div
                          key={u.id}
                          onClick={() => {
                            setTargetUser(u);
                            setUserSearch('');
                          }}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-800 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs">{u.full_name || u.email}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">{u.email}</span>
                          </div>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 font-mono">{u.subscription_plan || 'FREE'}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-neutral-500 text-[11px]">
                        {isSearchingUsers ? 'Searching athletes...' : 'No athletes found. Type to search.'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Notification Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. 💧 Hydration Check or ⚡ Personalized Training Ready"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-600 focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Body */}
          <div>
            <label className="text-neutral-300 font-semibold block mb-1">Message Body</label>
            <textarea
              rows="3"
              required
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Notification alert message displayed on Lock Screen and In-App inbox..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white placeholder-neutral-600 focus:border-blue-500 focus:outline-none transition-colors leading-relaxed"
            />
          </div>

          {/* CTA & Deep Link Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-neutral-300 font-semibold block mb-1">Button Action Label</label>
              <input
                type="text"
                value={formData.cta_label}
                onChange={(e) => setFormData({ ...formData, cta_label: e.target.value })}
                placeholder="View in App"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white placeholder-neutral-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-neutral-300 font-semibold block mb-1">Deep Link Route</label>
              <input
                type="text"
                value={formData.cta_link}
                onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                placeholder="/user/workout"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono text-xs placeholder-neutral-600 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quick Route Preset Chips */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Quick Route Presets:</span>
            <div className="flex flex-wrap gap-1">
              {ROUTE_PRESETS.map(preset => (
                <button
                  key={preset.route}
                  type="button"
                  onClick={() => setFormData({ ...formData, cta_link: preset.route })}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                    formData.cta_link === preset.route
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                      : 'bg-neutral-950/60 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cross-Platform Delivery Badge */}
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center gap-2 text-[10px] text-blue-300 font-mono">
            <Smartphone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Dispatches to iOS & Android Native Notifications + Web PWA</span>
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white font-semibold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-lg shadow-blue-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Dispatching...' : 'Dispatch Notification'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotificationComposerModal;

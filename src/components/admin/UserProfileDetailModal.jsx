import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  X,
  User,
  Shield,
  Crown,
  Ban,
  Trash2,
  Bell,
  Download,
  Flame,
  Smartphone,
  Utensils,
  Dumbbell,
  MessageSquare
} from 'lucide-react';
import { updateUserStatus, updateUserSubscription, deleteUserAdmin, sendAdminNotification } from '../../services/adminService';

const UserProfileDetailModal = ({ user, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showNotifInput, setShowNotifInput] = useState(false);

  if (!user) return null;

  const handleStatusToggle = async () => {
    setLoading(true);
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    await updateUserStatus(user.id, newStatus, 'Admin manual toggle');
    setLoading(false);
    onRefresh();
  };

  const handleGrantPremium = async (plan) => {
    setLoading(true);
    await updateUserSubscription(user.id, plan, '12 Months', 'Admin manual grant');
    setLoading(false);
    onRefresh();
  };

  const handleDelete = async () => {
    setLoading(true);
    await deleteUserAdmin(user.id);
    setLoading(false);
    toast.success(`User ${user.full_name} deleted.`);
    onRefresh();
    onClose();
  };

  const handleSendDirectNotif = async () => {
    if (!notificationMsg) return;
    setLoading(true);
    try {
      await sendAdminNotification({
        userId: user.id,
        title: 'Message from Calyxo Admin',
        body: notificationMsg,
        audience: 'Specific User',
        cta_label: 'Open App',
        cta_link: '/user/dashboard'
      });
      toast.success(`Notification sent to ${user.full_name}.`);
      setNotificationMsg('');
      setShowNotifInput(false);
    } catch (err) {
      toast.error(`Failed to send notification: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(user, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `user_export_${user.id}.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70">
      <div className="w-full max-w-3xl h-full bg-neutral-950 border-l border-neutral-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900">
          <div className="flex items-center gap-4">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=1a1a2e&color=3B82F6&size=80`} alt="" className="w-12 h-12 rounded-full object-cover border border-neutral-700" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">{user.full_name}</h2>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                  user.subscription_plan === 'FREE' ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                }`}>
                  {user.subscription_plan || 'FREE'}
                </span>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                  user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {user.status}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">{user.email} • ID: {user.id}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-800 bg-neutral-900/50 overflow-x-auto custom-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'fitness', label: 'Workout & Fitness', icon: Dumbbell },
            { id: 'nutrition', label: 'Nutrition', icon: Utensils },
            { id: 'ai', label: 'AI History', icon: MessageSquare },
            { id: 'device', label: 'Device & System', icon: Smartphone }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-blue-500 bg-blue-500/10'
                    : 'text-neutral-400 border-transparent hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content View */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[11px] text-neutral-500 block font-medium">Streak</span>
                  <span className="text-lg font-semibold text-amber-400 flex items-center gap-1 mt-1">
                    🔥 {user.streak || 0}d
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[11px] text-neutral-500 block font-medium">Calories Logged</span>
                  <span className="text-lg font-semibold text-white mt-1 block">{(user.calories_logged || 0).toLocaleString()} kcal</span>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[11px] text-neutral-500 block font-medium">Weight</span>
                  <span className="text-lg font-semibold text-blue-400 mt-1 block">{user.weight || 70} kg</span>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[11px] text-neutral-500 block font-medium">Height</span>
                  <span className="text-lg font-semibold text-white mt-1 block">{user.height || 175} cm</span>
                </div>
              </div>

              {/* Personal Details */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Personal information</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-neutral-500">Phone:</span> <span className="text-white font-medium">{user.phone || 'N/A'}</span></div>
                  <div><span className="text-neutral-500">Age / Gender:</span> <span className="text-white font-medium">{user.age || '25'} yrs / {user.gender || 'M'}</span></div>
                  <div><span className="text-neutral-500">Country:</span> <span className="text-white font-medium">{user.country || 'N/A'}</span></div>
                  <div><span className="text-neutral-500">Goal:</span> <span className="text-blue-400 font-medium">{user.goal || 'General Fitness'}</span></div>
                  <div><span className="text-neutral-500">Signup Date:</span> <span className="text-white font-medium">{user.signup_date || 'N/A'}</span></div>
                  <div><span className="text-neutral-500">Last Active:</span> <span className="text-emerald-400 font-medium">{user.last_active || 'N/A'}</span></div>
                </div>
              </div>

              {/* Admin Actions Panel */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-4">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-neutral-500" /> Actions
                </h3>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleGrantPremium('HIGH')}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5" /> Grant access
                  </button>

                  <button
                    onClick={handleStatusToggle}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ban className="w-3.5 h-3.5" /> {user.status === 'Active' ? 'Suspend' : 'Activate'}
                  </button>

                  <button
                    onClick={() => setShowNotifInput(!showNotifInput)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" /> Send notification
                  </button>

                  <button
                    onClick={handleExportJSON}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Export JSON
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>

                {showNotifInput && (
                  <div className="pt-3 border-t border-neutral-800 flex gap-2">
                    <input
                      type="text"
                      value={notificationMsg}
                      onChange={(e) => setNotificationMsg(e.target.value)}
                      placeholder="Type custom message..."
                      className="flex-1 bg-neutral-950 border border-neutral-800 text-white px-3 py-1.5 rounded-lg text-xs focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSendDirectNotif}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'fitness' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Recent workouts</h3>
              <div className="space-y-2">
                {[
                  { name: 'Push Hypertrophy', duration: '52 min', calories: 410, date: 'Today 09:30' },
                  { name: 'Leg Day & Calves', duration: '60 min', calories: 520, date: 'Yesterday 17:15' },
                  { name: 'Pull & Core', duration: '45 min', calories: 380, date: 'Jul 30 11:00' }
                ].map((w, i) => (
                  <div key={i} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-white block">{w.name}</span>
                      <span className="text-neutral-500 text-[11px]">{w.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-blue-400 font-mono block">{w.duration}</span>
                      <span className="text-amber-400 font-mono text-[11px]">{w.calories} kcal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Daily meal log</h3>
              <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-xs space-y-2">
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Target: {user.water_target || 2000} kcal</span>
                  <span className="text-emerald-400 font-medium">1,840 kcal logged today</span>
                </div>
                <div className="pt-2 text-neutral-300 leading-relaxed font-mono">
                  • 2x Grilled Chicken Breast (200g) — 330 kcal
                  <br />• 1x Brown Rice Bowl (150g) — 166 kcal
                  <br />• 1x Whey Protein Shake — 120 kcal
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">AI interactions</h3>
              <div className="space-y-2">
                {[
                  { query: 'Generate a 4-day workout split for hypertrophic quad focus.', time: '2 hours ago' },
                  { query: 'Scan photo: Grilled salmon with asparagus macros.', time: 'Yesterday' }
                ].map((chat, i) => (
                  <div key={i} className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs">
                    <span className="text-blue-400 font-medium block">"{chat.query}"</span>
                    <span className="text-[11px] text-neutral-500 font-mono mt-1 block">{chat.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'device' && (
            <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 text-xs space-y-3 font-mono">
              <div className="flex justify-between"><span className="text-neutral-500">Device Hardware:</span> <span className="text-white">{user.device_info || 'Mobile App'}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">App Version:</span> <span className="text-blue-400">{user.app_version || 'v3.2.0'}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Push Status:</span> <span className={user.push_enabled ? 'text-emerald-400' : 'text-red-400'}>{user.push_enabled ? 'Active VAPID' : 'Disabled'}</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetailModal;

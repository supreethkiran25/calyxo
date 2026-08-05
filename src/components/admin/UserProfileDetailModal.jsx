import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  X,
  User,
  Shield,
  Crown,
  Ban,
  Trash2,
  Edit3,
  Key,
  Bell,
  Download,
  Activity,
  Calendar,
  Flame,
  Smartphone,
  CheckCircle,
  AlertTriangle,
  History,
  MessageSquare,
  Utensils,
  Dumbbell,
  Clock,
  Sparkles
} from 'lucide-react';
import { updateUserStatus, updateUserSubscription, deleteUserAdmin, editUserAdmin, logAdminAction, sendAdminNotification } from '../../services/adminService';

const UserProfileDetailModal = ({ user, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [showNotifInput, setShowNotifInput] = useState(false);

  if (!user) return null;

  const handleStatusToggle = async () => {
    setLoading(true);
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    await updateUserStatus(user.id, newStatus, 'Super Admin manual toggle');
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
    if (window.confirm(`Are you sure you want to permanently delete user ${user.full_name}?`)) {
      setLoading(true);
      await deleteUserAdmin(user.id);
      setLoading(false);
      onRefresh();
      onClose();
    }
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
      toast.success(`Notification sent directly to ${user.full_name}!`);
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
    a.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl h-full bg-neutral-950 border-l border-neutral-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/60">
          <div className="flex items-center gap-4">
            <img src={user.photoURL} alt="" className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{user.full_name}</h2>
                <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${
                  user.subscription_plan === 'FREE' ? 'bg-neutral-800 text-neutral-400 border-neutral-700' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {user.subscription_plan}
                </span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                  user.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {user.status}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">{user.email} • ID: {user.id}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-neutral-800 bg-neutral-900/30 overflow-x-auto custom-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'fitness', label: 'Workout & Fitness', icon: Dumbbell },
            { id: 'nutrition', label: 'Nutrition Logs', icon: Utensils },
            { id: 'ai', label: 'AI History', icon: MessageSquare },
            { id: 'device', label: 'Device & System', icon: Smartphone }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-indigo-400 border-indigo-500 bg-indigo-500/10'
                    : 'text-neutral-400 border-transparent hover:text-neutral-200'
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
                <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-medium">Streak</span>
                  <span className="text-xl font-bold text-amber-400 flex items-center gap-1 mt-1">
                    <Flame className="w-4 h-4" /> {user.streak} days
                  </span>
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-medium">Calories Logged</span>
                  <span className="text-xl font-bold text-white mt-1 block">{(user.calories_logged || 0).toLocaleString()} kcal</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-medium">Weight</span>
                  <span className="text-xl font-bold text-indigo-400 mt-1 block">{user.weight} kg</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block font-medium">Height</span>
                  <span className="text-xl font-bold text-white mt-1 block">{user.height} cm</span>
                </div>
              </div>

              {/* Personal Details */}
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Personal Information</h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div><span className="text-neutral-500">Phone:</span> <span className="text-white font-medium">{user.phone}</span></div>
                  <div><span className="text-neutral-500">Age / Gender:</span> <span className="text-white font-medium">{user.age} yrs / {user.gender}</span></div>
                  <div><span className="text-neutral-500">Country:</span> <span className="text-white font-medium">{user.country}</span></div>
                  <div><span className="text-neutral-500">Current Goal:</span> <span className="text-indigo-400 font-semibold">{user.goal}</span></div>
                  <div><span className="text-neutral-500">Signup Date:</span> <span className="text-white font-medium">{user.signup_date}</span></div>
                  <div><span className="text-neutral-500">Last Active:</span> <span className="text-emerald-400 font-medium">{user.last_active}</span></div>
                </div>
              </div>

              {/* Admin Actions Panel */}
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 space-y-4">
                <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Administrative Actions
                </h3>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleGrantPremium('HIGH')}
                    disabled={loading}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Crown className="w-3.5 h-3.5" /> Grant HIGH Plan
                  </button>

                  <button
                    onClick={handleStatusToggle}
                    disabled={loading}
                    className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
                      user.status === 'Active'
                        ? 'bg-red-500/20 hover:bg-red-500/30 border-red-500/40 text-red-300'
                        : 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-300'
                    }`}
                  >
                    <Ban className="w-3.5 h-3.5" /> {user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                  </button>

                  <button
                    onClick={() => setShowNotifInput(!showNotifInput)}
                    className="px-3 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" /> Direct Push Notif
                  </button>

                  <button
                    onClick={handleExportJSON}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Data
                  </button>

                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-400 text-xs font-semibold flex items-center gap-1.5 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Account
                  </button>
                </div>

                {showNotifInput && (
                  <div className="pt-3 border-t border-indigo-500/20 flex gap-2">
                    <input
                      type="text"
                      value={notificationMsg}
                      onChange={(e) => setNotificationMsg(e.target.value)}
                      placeholder="Type custom message..."
                      className="flex-1 bg-neutral-900 border border-neutral-700 text-white px-3 py-1.5 rounded-xl text-xs focus:outline-none"
                    />
                    <button
                      onClick={handleSendDirectNotif}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                    >
                      Send Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'fitness' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Recent Workouts</h3>
              <div className="space-y-2">
                {[
                  { name: 'Push Hypertrophy', duration: '52 min', calories: 410, date: 'Today 09:30' },
                  { name: 'Leg Day & Calves', duration: '60 min', calories: 520, date: 'Yesterday 17:15' },
                  { name: 'Pull & Core', duration: '45 min', calories: 380, date: 'Jul 30 11:00' }
                ].map((w, i) => (
                  <div key={i} className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white block">{w.name}</span>
                      <span className="text-neutral-500 text-[11px]">{w.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-indigo-400 font-mono block">{w.duration}</span>
                      <span className="text-amber-400 font-mono text-[11px]">{w.calories} kcal burned</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'nutrition' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Daily Meal Log History</h3>
              <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-2">
                <div className="flex justify-between border-b border-neutral-800 pb-2">
                  <span className="text-neutral-400">Target Calories: {user.water_target || 2000} kcal</span>
                  <span className="text-emerald-400 font-bold">1,840 kcal logged today</span>
                </div>
                <div className="pt-2 text-neutral-300">
                  • 2x Grilled Chicken Breast (200g) — 330 kcal
                  <br />• 1x Brown Rice Bowl (150g) — 166 kcal
                  <br />• 1x Whey Protein Shake — 120 kcal
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Gemini AI Coach Interactions</h3>
              <div className="space-y-2">
                {[
                  { query: 'Generate a 4-day workout split for hypertrophic quad focus.', time: '2 hours ago' },
                  { query: 'Scan photo: Grilled salmon with asparagus macros.', time: 'Yesterday' }
                ].map((chat, i) => (
                  <div key={i} className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs">
                    <span className="text-indigo-400 font-medium block">"{chat.query}"</span>
                    <span className="text-[10px] text-neutral-500 font-mono mt-1 block">{chat.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'device' && (
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs space-y-3 font-mono">
              <div className="flex justify-between"><span className="text-neutral-500">Device Hardware:</span> <span className="text-white">{user.device_info}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">App Version:</span> <span className="text-indigo-400">{user.app_version}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Push Token Status:</span> <span className={user.push_enabled ? 'text-emerald-400' : 'text-red-400'}>{user.push_enabled ? 'Active VAPID' : 'Disabled'}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Reported Crashes:</span> <span className="text-white">{user.crashes}</span></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetailModal;

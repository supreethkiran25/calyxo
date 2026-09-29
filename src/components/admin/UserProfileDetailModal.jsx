import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  X,
  Crown,
  Bell,
  Trash2,
  Ban,
  CheckCircle2,
  Calendar,
  Activity,
  CreditCard,
  Dumbbell,
  Utensils,
  TrendingUp,
  Bot,
  Clock,
  Shield,
  Send,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  Zap,
  User as UserIcon
} from 'lucide-react';
import {
  getUser360Detail,
  updateUserStatus,
  updateUserSubscription,
  deleteUserAdmin,
  sendAdminNotification
} from '../../services/adminService';
import { AdminStatusBadge, AdminCountdownBadge } from './AdminUIPrimitives';

const UserProfileDetailModal = ({ user, onClose, onRefresh }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notificationMsg, setShowNotificationMsg] = useState('');
  const [showNotifBox, setShowNotifBox] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchFullProfile = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const fullData = await getUser360Detail(user.id);
        if (mounted) {
          setData(fullData || user);
        }
      } catch (e) {
        console.warn('Error fetching 360 profile:', e);
        if (mounted) setData(user);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchFullProfile();
    return () => { mounted = false; };
  }, [user]);

  if (!user) return null;

  const currentStatus = data?.status || user.status || 'Active';
  const currentPlan = data?.subscription_plan || user.subscription_plan || 'FREE';
  const isHigh = currentPlan === 'HIGH' || currentPlan === 'HIGH_ANNUAL';
  const isSuper = user.role === 'Super Admin' || user.email === 'supreethkiran25@gmail.com';

  const handleStatusToggle = async () => {
    setActionLoading(true);
    const newStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
    try {
      await updateUserStatus(user.id, newStatus, 'Admin 360 toggle');
      toast.success(`User marked as ${newStatus}`);
      if (onRefresh) onRefresh();
      setData(prev => ({ ...prev, status: newStatus }));
    } catch (e) {
      toast.error('Failed to change status: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGrantToggle = async () => {
    setActionLoading(true);
    const newPlan = isHigh ? 'FREE' : 'HIGH';
    try {
      await updateUserSubscription(user.id, newPlan, '12 Months', 'Admin 360 Grant');
      toast.success(isHigh ? 'High plan pass revoked.' : 'High plan granted for 12 months.');
      if (onRefresh) onRefresh();
      setData(prev => ({ ...prev, subscription_plan: newPlan }));
    } catch (e) {
      toast.error('Failed to update subscription: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!window.confirm(`Are you sure you want to permanently delete athlete account for ${user.full_name}? This cannot be undone.`)) return;
    setActionLoading(true);
    try {
      await deleteUserAdmin(user.id);
      toast.success('User permanently deleted.');
      if (onRefresh) onRefresh();
      onClose();
    } catch (e) {
      toast.error('Failed to delete user: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationMsg.trim()) return;
    setActionLoading(true);
    try {
      await sendAdminNotification({
        userId: user.id,
        targetUserName: user.full_name,
        title: 'Calyxo Team Notice',
        body: notificationMsg.trim(),
        cta_label: 'View Dashboard',
        cta_link: '/user/dashboard'
      });
      toast.success(`Direct notification dispatched to ${user.full_name}.`);
      setShowNotificationMsg('');
      setShowNotifBox(false);
    } catch (e) {
      toast.error('Failed to send notification: ' + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'workouts', label: 'Workouts', icon: Dumbbell, count: data?.workout_history?.length },
    { id: 'nutrition', label: 'Nutrition', icon: Utensils, count: data?.nutrition_history?.length },
    { id: 'subscription', label: 'Subscription & Renewal', icon: CreditCard },
    { id: 'ai', label: 'AI Coach', icon: Bot, count: data?.chat_sessions?.length },
    { id: 'activity', label: 'Audit Log', icon: Clock, count: data?.audit_history?.length }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in-50">
      <div className="w-full max-w-2xl bg-[#090c14] border-l border-white/10 h-full flex flex-col shadow-2xl overflow-hidden font-sans text-slate-200">
        
        {/* 1. Header Profile Banner */}
        <div className="p-6 border-b border-white/10 bg-[#0e121d] space-y-4 shrink-0 relative">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#d4ff00]/30 to-transparent" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AdminStatusBadge status={currentPlan === 'HIGH_ANNUAL' ? 'High Annual' : (currentPlan === 'HIGH' ? 'High Plan' : 'Free')} />
              <AdminStatusBadge status={currentStatus} />
              {isSuper ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#d4ff00]/15 text-[#d4ff00] border border-[#d4ff00]/30 uppercase">
                  Super Admin
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-slate-800 text-slate-400 border border-white/10">
                  User
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=0f172a&color=fff`}
                alt={user.full_name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white/10 shadow-lg shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'U')}&background=0f172a&color=fff`;
                }}
              />
              {user.is_regular_active && (
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#090c14]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-white truncate">{user.full_name || 'Calyxo Athlete'}</h3>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                <span>Joined: <strong className="text-slate-300 font-medium">{user.signup_date || 'Recent'}</strong></span>
                <span>•</span>
                <span>Activeness: <strong className={user.is_regular_active ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>{user.last_active_label || 'Dormant'}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
            {isHigh ? (
              <button
                onClick={handleGrantToggle}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors cursor-pointer"
              >
                Revoke High Pass
              </button>
            ) : (
              <button
                onClick={handleGrantToggle}
                disabled={actionLoading}
                className="px-3 py-1.5 rounded-xl bg-[#d4ff00] hover:bg-[#a3e635] text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#d4ff00]/20"
              >
                Grant High Plan (12 Mo)
              </button>
            )}

            <button
              onClick={handleStatusToggle}
              disabled={actionLoading}
              className="px-3 py-1.5 rounded-xl bg-[#141724] hover:bg-[#1a1f30] text-slate-200 border border-white/10 text-xs font-medium transition-colors cursor-pointer"
            >
              {currentStatus === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
            </button>

            <button
              onClick={() => setShowNotifBox(!showNotifBox)}
              className="p-1.5 rounded-xl bg-[#141724] hover:bg-[#1a1f30] text-slate-300 border border-white/10 transition-colors cursor-pointer"
              title="Direct Message"
            >
              <Bell className="w-4 h-4" />
            </button>

            <button
              onClick={handleDeleteUser}
              disabled={actionLoading}
              className="p-1.5 rounded-xl bg-[#141724] hover:bg-rose-500/20 text-rose-400 border border-white/10 hover:border-rose-500/30 transition-colors cursor-pointer ml-auto"
              title="Delete Athlete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Notification Composer */}
          {showNotifBox && (
            <div className="p-3 bg-[#141724] border border-white/10 rounded-xl space-y-2 shadow-xl animate-in fade-in-50">
              <span className="text-xs font-semibold text-white block">Send Direct In-App & WebPush Notice</span>
              <input
                type="text"
                value={notificationMsg}
                onChange={(e) => setShowNotificationMsg(e.target.value)}
                placeholder="Type notice message..."
                className="w-full px-3 py-2 bg-[#090c14] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#d4ff00]/60"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowNotifBox(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendNotification}
                  disabled={actionLoading || !notificationMsg.trim()}
                  className="px-3 py-1 bg-[#d4ff00] text-slate-950 font-bold rounded-lg text-xs hover:bg-[#a3e635] transition-colors cursor-pointer disabled:opacity-50"
                >
                  Send Notice
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Tab Navigation Bar */}
        <div className="flex items-center gap-1 px-4 py-2 bg-[#090c14] border-b border-white/10 text-xs overflow-x-auto shrink-0 scrollbar-none">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer shrink-0 ${
                  active
                    ? 'bg-[#141724] text-white border border-white/15 font-semibold text-[#d4ff00]'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
                {typeof t.count === 'number' && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? 'bg-[#d4ff00]/20 text-[#d4ff00]' : 'bg-white/10 text-slate-400'
                  }`}>
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 3. Tab Body Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Subscription & Countdown Glance */}
              <div className="p-4 bg-[#0e121d] rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#d4ff00]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Subscription Status</span>
                  </div>
                  {isHigh ? (
                    <AdminCountdownBadge 
                      days={user.days_remaining} 
                      hours={user.hours_remaining}
                      isExpiringSoon={user.is_expiring_soon}
                    />
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-400">
                      {user.renewal_status || 'Free Tier'}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-white/5">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Active Plan</span>
                    <strong className="text-sm text-white font-bold block">{currentPlan}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Expiry Date</span>
                    <strong className="text-sm text-slate-200 font-mono block">{user.subscription_expiry || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Renewal Status</span>
                    <strong className="text-xs text-slate-300 font-mono block">{user.renewal_status || 'Active'}</strong>
                  </div>
                </div>
              </div>

              {/* Health Goals & Fitness Metrics */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Biometrics & Target Goals
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-[#0e121d] rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-500 block uppercase">Weight</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {data?.metrics?.weight || user.weight ? `${data?.metrics?.weight || user.weight} kg` : '--'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#0e121d] rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-500 block uppercase">Height</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">
                      {data?.metrics?.height || user.height ? `${data?.metrics?.height || user.height} cm` : '--'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#0e121d] rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-500 block uppercase">Goal</span>
                    <span className="text-sm font-bold text-white mt-0.5 block capitalize truncate">
                      {data?.metrics?.goal || user.goal || 'General Fitness'}
                    </span>
                  </div>
                  <div className="p-3 bg-[#0e121d] rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-500 block uppercase">Streak</span>
                    <span className="text-sm font-bold text-[#d4ff00] mt-0.5 block">
                      {data?.metrics?.streak ?? user.streak ?? 0} Days
                    </span>
                  </div>
                </div>
              </div>

              {/* Activity Summary */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Logged Fitness Activity
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 bg-[#0e121d] rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-500 block uppercase">Total Workouts Completed</span>
                    <span className="text-base font-bold text-white mt-0.5 block">
                      {data?.workout_history?.length || user.total_workouts || 0} sessions
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#0e121d] rounded-xl border border-white/10">
                    <span className="text-[10px] text-slate-500 block uppercase">Total Nutrition Logs</span>
                    <span className="text-base font-bold text-white mt-0.5 block">
                      {data?.nutrition_history?.length || user.total_meals || 0} meals
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Diagnostics */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Device & Client Telemetry
                </h4>
                <div className="p-4 bg-[#0e121d] rounded-xl border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Device Platform:</span>
                    <span className="font-semibold text-slate-200">{user.device_info || 'Web & Progressive Web App'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Push Notifications:</span>
                    <span className="font-semibold text-emerald-400">Active (VAPID Registered)</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Internal Auth UUID:</span>
                    <span className="font-mono text-slate-400">{user.id}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SUBSCRIPTION & RENEWAL */}
          {activeTab === 'subscription' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0e121d] border border-white/10 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase text-slate-400 block tracking-wider">Active Subscription</span>
                    <h4 className="text-base font-bold text-white mt-0.5">
                      {isHigh ? (currentPlan === 'HIGH_ANNUAL' ? 'High Annual Pass (₹199/yr)' : 'High Monthly Pass (₹2/mo)') : 'Free Athlete Tier (₹0)'}
                    </h4>
                  </div>
                  {isHigh ? (
                    <AdminCountdownBadge 
                      days={user.days_remaining} 
                      hours={user.hours_remaining}
                      isExpiringSoon={user.is_expiring_soon}
                    />
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-slate-800 text-slate-400">
                      Free Version
                    </span>
                  )}
                </div>

                <div className="p-3 bg-[#141724] rounded-xl border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Valid Through / Renewal Date:</span>
                    <span className="font-mono font-bold text-white">{user.subscription_expiry || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Remaining Time:</span>
                    <span className="font-mono text-[#d4ff00] font-bold">{user.countdown_string || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-slate-400">Turn-In / Renewal Status:</span>
                    <span className="font-mono text-slate-200">{user.renewal_status || 'Free Version (Never Subscribed)'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Granted By / Payment Source:</span>
                    <span className="font-mono text-slate-300">{user.payment_source || 'Razorpay Direct'}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  {isHigh ? (
                    <button
                      onClick={handleGrantToggle}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Revoke High Plan Pass
                    </button>
                  ) : (
                    <button
                      onClick={handleGrantToggle}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-[#d4ff00] hover:bg-[#a3e635] text-slate-950 text-xs font-bold transition-all cursor-pointer shadow-lg shadow-[#d4ff00]/10"
                    >
                      Grant 12-Month High Pass
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WORKOUTS */}
          {activeTab === 'workouts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Workout Session Logs ({data?.workout_history?.length || 0})
                </h4>
              </div>

              {data?.workout_history && data.workout_history.length > 0 ? (
                <div className="space-y-2.5">
                  {data.workout_history.map(w => (
                    <div key={w.id} className="p-3.5 bg-[#0e121d] border border-white/10 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm capitalize">{w.title}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{w.date}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Duration: <strong className="text-slate-200">{w.duration} min</strong></span>
                        <span>•</span>
                        <span>Burned: <strong className="text-slate-200">{w.calories} kcal</strong></span>
                        <span>•</span>
                        <span>Intensity: <strong className="text-slate-200">{w.intensity}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                  No workout logs recorded yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NUTRITION */}
          {activeTab === 'nutrition' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Nutrition & Meal Logs ({data?.nutrition_history?.length || 0})
              </h4>

              {data?.nutrition_history && data.nutrition_history.length > 0 ? (
                <div className="space-y-2.5">
                  {data.nutrition_history.map(m => (
                    <div key={m.id} className="p-3.5 bg-[#0e121d] border border-white/10 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm capitalize">{m.meal_name || m.title || 'Logged Meal'}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{m.date}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Calories: <strong className="text-slate-200">{m.calories} kcal</strong></span>
                        <span>•</span>
                        <span>Protein: <strong className="text-slate-200">{m.protein}g</strong></span>
                        <span>•</span>
                        <span>Carbs: <strong className="text-slate-200">{m.carbs}g</strong></span>
                        <span>•</span>
                        <span>Fats: <strong className="text-slate-200">{m.fats}g</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                  No nutrition logs recorded yet.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AI COACH */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                AI Coach Chat History ({data?.chat_sessions?.length || 0})
              </h4>
              {data?.chat_sessions && data.chat_sessions.length > 0 ? (
                <div className="space-y-2.5">
                  {data.chat_sessions.map(s => (
                    <div key={s.id} className="p-3.5 bg-[#0e121d] border border-white/10 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{s.title || 'Fitness Advisory Session'}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{s.createdAt?.substring(0, 10)}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{s.lastMessage || 'Session closed.'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                  No AI Coach conversation history recorded.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: AUDIT LOG */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Account Audit Trail ({data?.audit_history?.length || 0})
              </h4>
              {data?.audit_history && data.audit_history.length > 0 ? (
                <div className="space-y-2">
                  {data.audit_history.map(a => (
                    <div key={a.id} className="p-3 bg-[#0e121d] border border-white/10 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-white block">{a.action}</span>
                        <span className="text-[11px] text-slate-400">{a.details ? JSON.stringify(a.details) : 'Administrative action'}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">{a.created_at?.substring(0, 16).replace('T', ' ')}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 border border-dashed border-white/10 rounded-xl">
                  No administrative actions logged on this athlete.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetailModal;

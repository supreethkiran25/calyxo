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
  MessageSquare,
  Clock,
  Calendar,
  CreditCard,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { updateUserStatus, updateUserSubscription, deleteUserAdmin, sendAdminNotification } from '../../services/adminService';
import { AdminStatusBadge } from './AdminUIPrimitives';

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

  const isHigh = user.subscription_plan === 'HIGH' || user.subscription_plan === 'HIGH_ANNUAL';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-neutral-950 border-l border-neutral-800/80 h-full flex flex-col shadow-2xl overflow-hidden font-sans text-neutral-100">
        {/* Header Profile Banner */}
        <div className="p-6 border-b border-neutral-800/80 bg-gradient-to-b from-neutral-900 to-neutral-950 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AdminStatusBadge status={user.subscription_plan || 'FREE'} />
              <AdminStatusBadge status={user.status || 'Active'} />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || 'User')}&background=1a1a2e&color=3B82F6&bold=true`}
              alt={user.full_name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-blue-500/30 shadow-lg shrink-0"
            />
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{user.full_name}</h3>
              <p className="text-xs text-neutral-400 font-mono">{user.email}</p>
              <p className="text-[11px] text-neutral-500 font-mono mt-0.5">UUID: {user.id}</p>
            </div>
          </div>

          {/* Action Quick Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800/60">
            {isHigh ? (
              <button
                onClick={() => handleGrantPremium('FREE')}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold font-mono transition-colors cursor-pointer"
              >
                Revoke High Pass
              </button>
            ) : (
              <button
                onClick={() => handleGrantPremium('HIGH')}
                disabled={loading}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                Grant High Pass
              </button>
            )}

            <button
              onClick={handleStatusToggle}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-semibold font-mono border border-neutral-800 transition-colors cursor-pointer"
            >
              {user.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
            </button>

            <button
              onClick={() => setShowNotifInput(!showNotifInput)}
              className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors cursor-pointer"
              title="Send Direct Notification"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Notification Box */}
          {showNotifInput && (
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
              <input
                type="text"
                value={notificationMsg}
                onChange={(e) => setNotificationMsg(e.target.value)}
                placeholder="Message body..."
                className="w-full px-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 font-mono"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSendDirectNotif}
                  disabled={loading}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Send Broadcast
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-neutral-950 border-b border-neutral-800/80 font-mono text-xs overflow-x-auto">
          {['overview', 'subscription', 'activity', 'payments'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded-lg uppercase transition-colors cursor-pointer ${
                activeTab === t ? 'bg-blue-600 text-white font-bold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar font-mono text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-blue-400">Account Overview</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">SIGNUP DATE</span>
                  <span className="font-bold text-white">{user.signup_date || '2026-07-25'}</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">ACTIVE PASS</span>
                  <span className="font-bold text-amber-400">{user.subscription_plan || 'FREE'}</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">DAYS REMAINING</span>
                  <span className="font-bold text-white">{user.days_remaining || '0'} Days</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block">GRANTED BY</span>
                  <span className="font-bold text-neutral-300">{user.granted_by || 'Razorpay'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-amber-400">Visual Subscription Timeline</h4>
              
              {/* Visual Timeline Bar */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Started: {user.signup_date || '2026-07-25'}</span>
                  <span className="text-amber-400 font-bold">Expires: {user.subscription_expiry || '2027-07-25'}</span>
                </div>
                <div className="h-2 w-full bg-neutral-950 rounded-full overflow-hidden flex border border-neutral-800">
                  <div className="bg-amber-500 h-full w-3/4 rounded-full" />
                </div>
                <div className="flex justify-between items-center text-[10px] text-neutral-500">
                  <span>Activation</span>
                  <span>Active Period</span>
                  <span>Renewal Date</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-emerald-400">Fitness Activity Telemetry</h4>
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Total Workouts Completed:</span>
                  <span className="font-bold text-white">{user.total_workouts || 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Total Meals Logged:</span>
                  <span className="font-bold text-white">{user.total_meals || 0}</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Streak Record:</span>
                  <span className="font-bold text-amber-400">{user.streak || 0} Days</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-purple-400">Payment Audit Logs</h4>
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 block">LAST PAYMENT ID</span>
                <span className="font-bold text-blue-400">{user.last_payment_id || 'pay_TlEl9QNm2AuW7I'}</span>
                <span className="text-[10px] text-neutral-400 block pt-1">Source: {user.payment_source || 'Razorpay Direct'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetailModal;

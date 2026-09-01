import React, { useState } from 'react';
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
  CreditCard
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
    if (!window.confirm(`Permanently delete account for ${user.full_name}?`)) return;
    setLoading(true);
    await deleteUserAdmin(user.id);
    setLoading(false);
    toast.success(`User ${user.full_name} deleted.`);
    onRefresh();
    onClose();
  };

  const handleSendDirectNotif = async () => {
    if (!notificationMsg.trim()) return;
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
      <div className="w-full max-w-lg bg-neutral-950 border-l border-neutral-800 h-full flex flex-col shadow-2xl overflow-hidden font-sans text-neutral-100">
        {/* Header Profile Info */}
        <div className="p-5 border-b border-neutral-800 bg-neutral-900/90 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AdminStatusBadge status={user.subscription_plan || 'FREE'} />
              <AdminStatusBadge status={user.status || 'Active'} />
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 text-neutral-200 border border-neutral-700 flex items-center justify-center font-mono font-bold text-base shrink-0">
              {user.full_name ? user.full_name.substring(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white truncate">{user.full_name || 'Athlete'}</h3>
              <p className="text-xs text-neutral-400 font-mono truncate">{user.email}</p>
              <p className="text-[10px] text-neutral-500 font-mono mt-0.5 truncate">ID: {user.id}</p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-800">
            {isHigh ? (
              <button
                onClick={() => handleGrantPremium('FREE')}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-rose-950/30 text-rose-400 border border-rose-900/40 text-xs font-semibold font-mono transition-colors cursor-pointer"
              >
                Revoke High Pass
              </button>
            ) : (
              <button
                onClick={() => handleGrantPremium('HIGH')}
                disabled={loading}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                Grant High Pass
              </button>
            )}

            <button
              onClick={handleStatusToggle}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium font-mono border border-neutral-800 transition-colors cursor-pointer"
            >
              {user.status === 'Suspended' ? 'Activate Account' : 'Suspend Account'}
            </button>

            <button
              onClick={() => setShowNotifInput(!showNotifInput)}
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors cursor-pointer"
              title="Send Direct Notification"
            >
              <Bell className="w-4 h-4" />
            </button>

            <button
              onClick={handleDelete}
              disabled={loading}
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-rose-950/30 text-rose-400 border border-rose-900/40 transition-colors cursor-pointer ml-auto"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Notification Box */}
          {showNotifInput && (
            <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 space-y-2">
              <input
                type="text"
                value={notificationMsg}
                onChange={(e) => setNotificationMsg(e.target.value)}
                placeholder="Notification message..."
                className="w-full px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-neutral-700"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSendDirectNotif}
                  disabled={loading}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  Send Message
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-neutral-950 border-b border-neutral-800 font-mono text-xs overflow-x-auto">
          {['overview', 'subscription', 'activity', 'payments'].map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded-lg uppercase transition-colors cursor-pointer ${
                activeTab === t ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar font-mono text-xs">
          {activeTab === 'overview' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Account Baseline</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block uppercase">SIGNUP DATE</span>
                  <span className="font-bold text-white mt-0.5 block">{user.signup_date || 'N/A'}</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block uppercase">ACTIVE PLAN</span>
                  <span className="font-bold text-white mt-0.5 block">{user.subscription_plan || 'FREE'}</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block uppercase">DAYS REMAINING</span>
                  <span className="font-bold text-white mt-0.5 block">{user.days_remaining || '0'} Days</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-[10px] text-neutral-500 block uppercase">ENTITLEMENT SOURCE</span>
                  <span className="font-bold text-neutral-300 mt-0.5 block">{user.granted_by || 'Razorpay'}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Subscription Timeline</h4>
              
              <div className="p-4 rounded-lg bg-neutral-900 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Started: {user.signup_date || 'N/A'}</span>
                  <span className="text-neutral-200 font-bold">Expires: {user.subscription_expiry || 'Ongoing'}</span>
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
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Telemetry Logs</h4>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Total Workouts Completed:</span>
                  <span className="font-bold text-white">{user.total_workouts || 0}</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Total Meals Logged:</span>
                  <span className="font-bold text-white">{user.total_meals || 0}</span>
                </div>
                <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex justify-between">
                  <span className="text-neutral-400">Streak Record:</span>
                  <span className="font-bold text-white">{user.streak || 0} Days</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Transaction Record</h4>
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1">
                <span className="text-[10px] text-neutral-500 block uppercase">LAST PAYMENT ID</span>
                <span className="font-bold text-neutral-200">{user.last_payment_id || 'N/A'}</span>
                <span className="text-[10px] text-neutral-400 block pt-1">Provider: {user.payment_source || 'Razorpay'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileDetailModal;


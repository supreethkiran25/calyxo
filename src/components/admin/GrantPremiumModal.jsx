import React, { useState } from 'react';
import { X, Crown } from 'lucide-react';
import { updateUserSubscription, CALYXO_PRIMARY_PLAN } from '../../services/adminService';

const GrantPremiumModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [plan] = useState(CALYXO_PRIMARY_PLAN.code);
  const [duration, setDuration] = useState('12 Months');
  const [reason, setReason] = useState('Beta Tester');
  const [customDays, setCustomDays] = useState('30');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleGrant = async () => {
    setError('');
    setLoading(true);
    try {
      const finalDuration = duration === 'Custom' ? `${customDays} Days` : duration;
      await updateUserSubscription(user.id, plan, finalDuration, reason, 'supreethkiran25@gmail.com');
      if (typeof onSuccess === 'function') onSuccess();
      onClose();
    } catch (err) {
      console.error('[GrantPremiumModal] Error granting access:', err);
      setError(err.message || 'Failed to grant access. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Grant High plan access</h3>
              <p className="text-xs text-neutral-400">{user.full_name} ({user.email})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300">Subscription plan</label>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-amber-300 block">{CALYXO_PRIMARY_PLAN.name}</span>
              <span className="text-[11px] text-neutral-400">Full access</span>
            </div>
            <span className="font-semibold text-amber-400 font-mono text-sm">{CALYXO_PRIMARY_PLAN.symbol}{CALYXO_PRIMARY_PLAN.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300">Duration</label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {['1 Month', '3 Months', '6 Months', '12 Months', 'Lifetime', 'Custom'].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`py-2 rounded-lg font-medium transition-colors border cursor-pointer ${
                  duration === d
                    ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          {duration === 'Custom' && (
            <input
              type="number"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              placeholder="Number of days..."
              className="w-full mt-2 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            />
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-neutral-300">Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="Manual">Manual override</option>
            <option value="Beta Tester">Beta tester</option>
            <option value="Influencer">Partner</option>
            <option value="Refund">Customer care</option>
            <option value="Internal">Team member</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleGrant}
            disabled={loading}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Granting...' : 'Grant access'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrantPremiumModal;

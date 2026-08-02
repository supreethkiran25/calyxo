import React, { useState } from 'react';
import { X, Crown } from 'lucide-react';
import { updateUserSubscription } from '../../services/adminService';

const GrantPremiumModal = ({ isOpen, onClose, user, onSuccess }) => {
  const [plan, setPlan] = useState('HIGH');
  const [duration, setDuration] = useState('12 Months');
  const [reason, setReason] = useState('Beta Tester');
  const [customDays, setCustomDays] = useState('30');
  const [loading, setLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleGrant = async () => {
    setLoading(true);
    const finalDuration = duration === 'Custom' ? `${customDays} Days` : duration;
    await updateUserSubscription(user.id, plan, finalDuration, reason);
    setLoading(false);
    onSuccess();
    onClose();
  };

  const planPricing = {
    PRO: '₹499/mo',
    HIGH: '₹999/mo',
    ULTIMATE: '₹1,499/mo'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Grant Razorpay Premium Pass</h3>
              <p className="text-xs text-neutral-400">Target User: {user.full_name} ({user.email})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plan Select */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Select Tier Plan (INR ₹)</label>
          <div className="grid grid-cols-3 gap-2">
            {['PRO', 'HIGH', 'ULTIMATE'].map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPlan(p)}
                className={`py-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center cursor-pointer ${
                  plan === p 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                    : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:border-neutral-700'
                }`}
              >
                <span>{p}</span>
                <span className="text-[10px] opacity-75 font-mono">{planPricing[p]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration Select */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Subscription Duration</label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {['1 Month', '3 Months', '6 Months', '12 Months', 'Lifetime', 'Custom'].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`py-2 rounded-xl font-medium transition-all border cursor-pointer ${
                  duration === d
                    ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
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
              placeholder="Number of Days..."
              className="w-full mt-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
          )}
        </div>

        {/* Reason Select */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">Grant Reason</label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          >
            <option value="Manual">Manual Override</option>
            <option value="Beta Tester">Beta Tester Reward</option>
            <option value="Influencer">Influencer / Partner</option>
            <option value="Refund">Refund / Customer Care</option>
            <option value="Internal">Internal Team Member</option>
          </select>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleGrant}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            {loading ? 'Granting...' : 'Confirm Grant'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrantPremiumModal;

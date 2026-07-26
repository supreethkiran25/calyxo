import React, { useState } from 'react';
import { Lock, Zap, ArrowRight, CreditCard, Loader2 } from 'lucide-react';
import Logo from './Logo';
import { useStore } from '../store/useStore';
import { startRazorpayCheckout } from '../utils/razorpay';

export default function PremiumGate({ 
  title = "Premium Feature Locked", 
  description = "This module requires an active subscription to access.",
  requiredTier = "MEDIUM",
  onNotification
}) {
  const [loading, setLoading] = useState(false);
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const updateUserProfile = useStore(state => state.updateUserProfile);

  const handleSubscribe = () => {
    const plan = {
      id: requiredTier,
      name: `${requiredTier} Tier`,
      amountPaise: requiredTier === 'HIGH' ? 200 : 100
    };
    startRazorpayCheckout({
      plan,
      user,
      userProfile,
      updateUserProfile,
      onNotification,
      onLoadingChange: setLoading
    });
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-acid-green/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full glass border border-card-border p-8 rounded-3xl space-y-6 shadow-2xl bg-surface/40 backdrop-blur-xl">
        {/* Header Logo */}
        <div className="flex justify-center items-center gap-2">
          <Logo className="w-8 h-8 text-acid-green" glow={true} />
          <span className="brand-name text-lg text-foreground tracking-wider font-black">CALYXO</span>
        </div>

        {/* Lock Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-acid-green/10 border border-acid-green/30 flex items-center justify-center mx-auto shadow-lg shadow-acid-green/10">
          <Lock className="w-8 h-8 text-acid-green" />
        </div>

        {/* Messaging */}
        <div className="space-y-2">
          <h2 className="text-xl font-black uppercase tracking-wider text-foreground">{title}</h2>
          <p className="text-xs text-muted leading-relaxed font-medium">
            {description}
          </p>
        </div>

        {/* Tier Requirements Badge */}
        <div className="p-3 bg-surface/60 rounded-xl border border-card-border flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider">Required Tier:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-acid-green/20 text-acid-green border border-acid-green/30 font-black text-[10px] uppercase tracking-wider flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {requiredTier} (₹{requiredTier === 'MEDIUM' ? '1' : '2'}/mo)
          </span>
        </div>

        {/* Unlock Action Button */}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-2xl bg-acid-green text-black font-black text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all border-none cursor-pointer shadow-lg shadow-acid-green/15 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <CreditCard className="w-4 h-4" />
          )}
          <span>{loading ? 'Opening Payment...' : 'Subscribe to Unlock'}</span>
          {!loading && <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, RefreshCw, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { SubscriptionManager } from '../services/subscription/SubscriptionManager';

export default function SubscriptionLiveTimerCard({
  userProfile,
  user,
  onSyncLive,
  onRestore,
  onCancel,
  saving = false
}) {
  const [now, setNow] = useState(Date.now());

  // High-precision live clock ticker (updates every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const subTimeline = SubscriptionManager.getSubscriptionTimeline(userProfile, user);
  const isExpired = subTimeline.isExpired;
  const isSubscribed = subTimeline.isSubscribed && !isExpired;

  // Calculate live countdown against reconciled timelineDate
  const targetTime = subTimeline.timelineDate ? new Date(subTimeline.timelineDate).getTime() : 0;
  const msRemaining = isSubscribed && targetTime > now ? Math.max(0, targetTime - now) : 0;

  const days = Math.floor(msRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((msRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((msRemaining % (1000 * 60)) / 1000);

  const durationDays = subTimeline.durationDays || (subTimeline.isAnnual ? 365 : 30);
  const totalCycleMs = durationDays * 24 * 60 * 60 * 1000;
  const elapsedMs = Math.max(0, totalCycleMs - msRemaining);
  const progressPct = Math.min(100, Math.max(0, Math.round((elapsedMs / totalCycleMs) * 100)));

  const isExpiringSoon = isSubscribed && days <= 3;

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-card-border space-y-4 shadow-sm transition-all">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-acid-green" />
            <span className="text-xs font-black uppercase tracking-wider text-foreground">Current Active Status</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <p className="text-[11px] text-muted">
              Active Tier: <strong className="text-acid-green font-bold uppercase">{subTimeline.planName}</strong>
            </p>
            <span className="px-2 py-0.5 rounded-full bg-surface-hover border border-card-border text-[9px] font-bold text-foreground">
              {subTimeline.planDurationLabel}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${
              isExpired
                ? 'bg-destructive/20 text-destructive border-destructive/30'
                : isExpiringSoon
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'
                  : isSubscribed
                    ? 'bg-acid-green/20 text-acid-green border-acid-green/30'
                    : 'bg-surface text-muted border-card-border'
            }`}>
              {isExpired ? 'Plan Expired' : subTimeline.isCancelled ? 'Cancelled (Active)' : isSubscribed ? 'Active Subscription' : 'Free Tier'}
            </span>
          </div>
        </div>

        {/* Action Buttons: Clean consumer actions only */}
        <div className="flex items-center gap-2 shrink-0">
          {isSubscribed && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="px-3.5 py-1.5 rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/30 text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel Subscription
            </button>
          )}

          {(!isSubscribed || isExpired) && (
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('setup-field-subscription');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-1.5 rounded-full bg-acid-green text-black hover:brightness-110 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm"
            >
              {isExpired ? 'Renew Plan' : 'Upgrade to Ultra'}
            </button>
          )}
        </div>
      </div>

      {/* Live Precision Countdown Timer Box */}
      {isSubscribed && targetTime > 0 && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-background/60 border border-card-border/80 space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-foreground font-bold">
              <Clock className="w-3.5 h-3.5 text-acid-green animate-pulse" />
              <span>Current Billing Cycle Countdown</span>
            </div>
            <span className="text-[10px] font-mono text-muted">
              {subTimeline.planDurationLabel}
            </span>
          </div>

          {/* Digital Timer Counters */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-2 sm:p-2.5 rounded-lg bg-surface border border-card-border flex flex-col items-center justify-center">
              <span className="font-mono text-lg sm:text-2xl font-black text-acid-green leading-none">
                {String(days).padStart(2, '0')}
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-muted uppercase mt-1 tracking-wider">Days</span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-surface border border-card-border flex flex-col items-center justify-center">
              <span className="font-mono text-lg sm:text-2xl font-black text-acid-green leading-none">
                {String(hours).padStart(2, '0')}
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-muted uppercase mt-1 tracking-wider">Hours</span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-surface border border-card-border flex flex-col items-center justify-center">
              <span className="font-mono text-lg sm:text-2xl font-black text-acid-green leading-none">
                {String(minutes).padStart(2, '0')}
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-muted uppercase mt-1 tracking-wider">Mins</span>
            </div>

            <div className="p-2 sm:p-2.5 rounded-lg bg-surface border border-card-border flex flex-col items-center justify-center">
              <span className="font-mono text-lg sm:text-2xl font-black text-acid-green leading-none">
                {String(seconds).padStart(2, '0')}
              </span>
              <span className="text-[8px] sm:text-[9px] font-bold text-muted uppercase mt-1 tracking-wider">Secs</span>
            </div>
          </div>

          {/* Cycle Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-muted">
              <span>Billing Cycle Progress</span>
              <span className="font-mono text-foreground font-semibold">{progressPct}% completed</span>
            </div>
            <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-card-border/60">
              <div 
                className={`h-full transition-all duration-1000 rounded-full ${
                  isExpiringSoon ? 'bg-amber-400' : 'bg-acid-green'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Date & Renewal Information */}
      {subTimeline.timelineDate ? (
        <div className="pt-2 border-t border-card-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
          <p className="font-medium text-foreground">
            {subTimeline.displayTimelineLabel || subTimeline.timelineLabel}: <strong className="text-acid-green font-bold">
              {new Date(subTimeline.timelineDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(subTimeline.timelineDate).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
            </strong>
          </p>
          <div className="flex items-center gap-1.5 text-muted text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5 text-acid-green" />
            <span>Verified Membership</span>
          </div>
        </div>
      ) : (
        <div className="pt-2 border-t border-card-border/60 text-[10px] text-muted flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-muted" />
          <span>No active expiration date recorded (Free Athlete Tier).</span>
        </div>
      )}

      {/* Expired Plan Banner */}
      {isExpired && (
        <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 flex items-start gap-2.5 text-[11px] mt-2">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-destructive">Your Subscription Has Expired</p>
            <p className="text-[10px] text-muted leading-relaxed">
              Your enrollment period ended on {subTimeline.timelineDate ? new Date(subTimeline.timelineDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'the expiry date'}. Renew below to restore full AI coach and wearable capabilities.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

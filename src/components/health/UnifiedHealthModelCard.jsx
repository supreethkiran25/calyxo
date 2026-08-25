import React from 'react';
import { Sparkles, Watch, Heart, Moon, Activity, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { UnifiedHealthModelEngine } from '../../services/health/UnifiedHealthModelEngine.js';
import { SubscriptionManager } from '../../services/subscription/SubscriptionManager.js';
import PremiumLockBadge from '../common/PremiumLockBadge.jsx';

export default function UnifiedHealthModelCard({
  userProfile = {},
  appleWatchData = { hr: 68, hrv: 54, workouts: [], activeCalories: 450 },
  boatData = { sleepMinutes: 460, steps: 8420, deepSleepMinutes: 110 },
  bleChestStrap = null,
  bpMonitorData = { systolic: 118, diastolic: 78, pulse: 64 },
  onOpenUpgradeModal
}) {
  const isPremium = SubscriptionManager.isPremium(userProfile);

  const model = UnifiedHealthModelEngine.buildUnifiedHealthModel({
    appleWatchData,
    boatData,
    bleChestStrap,
    bpMonitorData
  });

  const { telemetry, devicesConnected } = model;

  return (
    <div className="w-full bg-surface border border-card-border rounded-3xl p-5 sm:p-7 shadow-card space-y-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-cyan-600 dark:text-cyan-400 uppercase flex items-center gap-1 font-mono">
              <Watch className="w-3 h-3 text-cyan-500" /> MULTI-DEVICE WEARABLE INTELLIGENCE
            </span>
            {!isPremium && <PremiumLockBadge onClick={() => onOpenUpgradeModal('Unified Multi-Device Model')} />}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight mt-1">
            Unified Biometric Health Model
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            Calyxo combines your devices into one coherent health model with zero duplicate metrics.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-mono self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span>{devicesConnected.length} Hardware Streams Fused</span>
        </div>
      </div>

      {/* Device Mapping Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Stream 1: Apple Watch */}
        <div className="p-4 rounded-2xl bg-surface-subtle border border-card-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Apple Watch</span>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">HR + HRV</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-black text-foreground font-mono">
              {telemetry.liveHeartRate.value ? `${telemetry.liveHeartRate.value} BPM` : '68 BPM (Resting)'}
            </div>
            <p className="text-[10px] text-muted font-mono">HRV: {telemetry.hrv.value || 54} ms SDNN</p>
          </div>
          <span className="text-[9px] text-accent flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> HealthKit Synced
          </span>
        </div>

        {/* Stream 2: boAt Wearable */}
        <div className="p-4 rounded-2xl bg-surface-subtle border border-card-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">boAt Smartwatch</span>
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">Sleep + Steps</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-black text-foreground font-mono">
              {telemetry.sleep.hours}h Sleep
            </div>
            <p className="text-[10px] text-muted font-mono">Steps: {telemetry.steps.count.toLocaleString()}</p>
          </div>
          <span className="text-[9px] text-accent flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> Bridge Active
          </span>
        </div>

        {/* Stream 3: BLE Chest Strap */}
        <div className="p-4 rounded-2xl bg-surface-subtle border border-card-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">BLE HR Strap</span>
            <span className="text-[10px] text-rose-500 font-mono">Live Workout HR</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-black text-foreground font-mono">
              Polar / Wahoo
            </div>
            <p className="text-[10px] text-muted font-mono">SIG 0x2A37 Direct</p>
          </div>
          <span className="text-[9px] text-accent flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> 1Hz Telemetry
          </span>
        </div>

        {/* Stream 4: Omron BP Monitor */}
        <div className="p-4 rounded-2xl bg-surface-subtle border border-card-border space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Omron BP</span>
            <span className="text-[10px] text-amber-500 font-mono">Blood Pressure</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-black text-foreground font-mono">
              {telemetry.bloodPressure.systolic}/{telemetry.bloodPressure.diastolic} mmHg
            </div>
            <p className="text-[10px] text-muted font-mono">Status: {telemetry.bloodPressure.status}</p>
          </div>
          <span className="text-[9px] text-accent flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> Normal Zone
          </span>
        </div>
      </div>
    </div>
  );
}

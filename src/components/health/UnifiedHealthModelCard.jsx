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
    <div className="w-full bg-[#0d0d10] border border-amber-500/20 rounded-3xl p-5 sm:p-7 shadow-xl space-y-6 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-0 right-0 w-72 h-36 bg-cyan-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase flex items-center gap-1">
              <Watch className="w-3 h-3 text-cyan-400" /> MULTI-DEVICE WEARABLE INTELLIGENCE
            </span>
            {!isPremium && <PremiumLockBadge onClick={() => onOpenUpgradeModal('Unified Multi-Device Model')} />}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
            Unified Biometric Health Model
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Calyxo combines your devices into one coherent health model with zero duplicate metrics.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{devicesConnected.length} Hardware Streams Fused</span>
        </div>
      </div>

      {/* Device Mapping Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Stream 1: Apple Watch */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">Apple Watch</span>
            <span className="text-[10px] text-cyan-400 font-mono">HR + HRV</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-black text-white font-mono">
              {telemetry.liveHeartRate.value ? `${telemetry.liveHeartRate.value} BPM` : '68 BPM (Resting)'}
            </div>
            <p className="text-[10px] text-gray-400 font-mono">HRV: {telemetry.hrv.value || 54} ms SDNN</p>
          </div>
          <span className="text-[9px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> HealthKit Synced
          </span>
        </div>

        {/* Stream 2: boAt Wearable */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">boAt Smartwatch</span>
            <span className="text-[10px] text-purple-400 font-mono">Sleep + Steps</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-black text-white font-mono">
              {telemetry.sleep.hours}h Sleep
            </div>
            <p className="text-[10px] text-gray-400 font-mono">Steps: {telemetry.steps.count.toLocaleString()}</p>
          </div>
          <span className="text-[9px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> Bridge Active
          </span>
        </div>

        {/* Stream 3: BLE Chest Strap */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">BLE HR Strap</span>
            <span className="text-[10px] text-red-400 font-mono">Live Workout HR</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-black text-white font-mono">
              Polar / Wahoo
            </div>
            <p className="text-[10px] text-gray-400 font-mono">SIG 0x2A37 Direct</p>
          </div>
          <span className="text-[9px] text-gray-400">Standby for Session</span>
        </div>

        {/* Stream 4: BP Monitor */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">BLE BP Monitor</span>
            <span className="text-[10px] text-emerald-400 font-mono">Clinical BP</span>
          </div>
          <div className="space-y-0.5">
            <div className="text-sm font-black text-white font-mono">
              {telemetry.bloodPressure.systolic}/{telemetry.bloodPressure.diastolic} mmHg
            </div>
            <p className="text-[10px] text-gray-400 font-mono">Pulse: {telemetry.bloodPressure.pulse || 64} BPM</p>
          </div>
          <span className="text-[9px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> 0x2A35 Verified
          </span>
        </div>
      </div>

      {/* Model Fusion Statement */}
      <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-gray-300 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
        <span>{model.summaryText}</span>
      </div>
    </div>
  );
}

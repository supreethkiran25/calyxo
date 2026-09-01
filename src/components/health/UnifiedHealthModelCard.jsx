import React from 'react';
import { Watch, CheckCircle2, AlertCircle } from 'lucide-react';
import { UnifiedHealthModelEngine } from '../../services/health/UnifiedHealthModelEngine.js';
import { SubscriptionManager } from '../../services/subscription/SubscriptionManager.js';
import PremiumLockBadge from '../common/PremiumLockBadge.jsx';

export default function UnifiedHealthModelCard({
  userProfile = {},
  appleWatchData = null,
  boatData = null,
  bleChestStrap = null,
  bpMonitorData = null,
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
  const isAppleWatchConnected = devicesConnected.includes('Apple Watch');
  const isBoatConnected = devicesConnected.includes('boAt Wearable');
  const isBleStrapConnected = devicesConnected.includes('BLE Chest Strap');
  const isBpConnected = devicesConnected.includes('BLE BP Monitor');

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
          <span className={`w-2 h-2 rounded-full ${devicesConnected.length > 0 ? 'bg-cyan-500 animate-pulse' : 'bg-muted'}`} />
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
              {telemetry.liveHeartRate?.value ? `${telemetry.liveHeartRate.value} BPM` : '--'}
            </div>
            <p className="text-[10px] text-muted font-mono">
              HRV: {telemetry.hrv?.value ? `${telemetry.hrv.value} ms SDNN` : '--'}
            </p>
          </div>
          <span className={`text-[9px] flex items-center gap-1 ${isAppleWatchConnected ? 'text-accent' : 'text-muted'}`}>
            {isAppleWatchConnected ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
            {isAppleWatchConnected ? 'HealthKit Synced' : 'Not Connected'}
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
              {telemetry.sleep?.hours > 0 ? `${telemetry.sleep.hours}h Sleep` : '--'}
            </div>
            <p className="text-[10px] text-muted font-mono">
              Steps: {telemetry.steps?.count > 0 ? telemetry.steps.count.toLocaleString() : '--'}
            </p>
          </div>
          <span className={`text-[9px] flex items-center gap-1 ${isBoatConnected ? 'text-accent' : 'text-muted'}`}>
            {isBoatConnected ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
            {isBoatConnected ? 'Bridge Active' : 'Not Paired'}
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
              {telemetry.liveHeartRate?.source === 'Polar / BLE Chest Strap' ? `${telemetry.liveHeartRate.value} BPM` : '--'}
            </div>
            <p className="text-[10px] text-muted font-mono">SIG 0x2A37 Direct</p>
          </div>
          <span className={`text-[9px] flex items-center gap-1 ${isBleStrapConnected ? 'text-accent' : 'text-muted'}`}>
            {isBleStrapConnected ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
            {isBleStrapConnected ? '1Hz Telemetry' : 'Not Connected'}
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
              {telemetry.bloodPressure?.systolic ? `${telemetry.bloodPressure.systolic}/${telemetry.bloodPressure.diastolic} mmHg` : '--'}
            </div>
            <p className="text-[10px] text-muted font-mono">
              Status: {telemetry.bloodPressure?.category || '--'}
            </p>
          </div>
          <span className={`text-[9px] flex items-center gap-1 ${isBpConnected ? 'text-accent' : 'text-muted'}`}>
            {isBpConnected ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
            {isBpConnected ? 'Normal Zone' : 'No Readings'}
          </span>
        </div>
      </div>
    </div>
  );
}

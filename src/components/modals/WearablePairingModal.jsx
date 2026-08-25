import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Watch, Bluetooth, Activity, Flame, Heart, Moon,
  CheckCircle2, ShieldCheck, RefreshCw, Zap, Smartphone, ChevronRight,
  ExternalLink, Info, Radio, AlertCircle, Settings, Search, Wifi, Check, Sparkles
} from 'lucide-react';
import { HealthDataService } from '../../services/health/HealthDataService';
import { HealthCache } from '../../services/health/HealthCache';
import { HealthPermissionManager } from '../../services/health/HealthPermissionManager';
import { wearableIntegrationManager, BLE_STATES, SUPPORTED_WEARABLE_CATEGORIES } from '../../services/health/WearableIntegrationManager';

export default function WearablePairingModal({ isOpen, onClose, onPaired, onNotification }) {
  const [selectedBrand, setSelectedBrand] = useState('apple_health');
  const [isSyncing, setIsSyncing] = useState(false);
  const [liveTestMetrics, setLiveTestMetrics] = useState(null);
  const [syncStatusMessage, setSyncStatusMessage] = useState(null);
  const [bleState, setBleState] = useState(wearableIntegrationManager.getStateSnapshot());

  // Subscribe to real BLE manager state
  useEffect(() => {
    if (!isOpen) return;
    const unsubscribe = wearableIntegrationManager.subscribe((snapshot) => {
      setBleState(snapshot);
    });
    return () => {
      unsubscribe();
      wearableIntegrationManager.stopBLEScan().catch(() => {});
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Apple Health / Watch Sync Test
  const handleTestAppleHealthSync = async () => {
    setIsSyncing(true);
    setSyncStatusMessage(null);
    try {
      const res = await HealthPermissionManager.requestPermissions({ includeOptional: true });
      const metrics = await HealthDataService.fetchTodayMetrics();
      const hasReal = Number(metrics.steps || 0) > 0 || Number(metrics.activeCalories || 0) > 0;
      
      setLiveTestMetrics({
        steps: Number(metrics.steps || 0),
        activeCalories: Number(metrics.activeCalories || 0),
        restingHeartRateBpm: Number(metrics.restingHeartRateBpm || 0),
        hasRealData: hasReal
      });

      if (hasReal || (res && res.hasRequired)) {
        if (onNotification) onNotification('Apple Health & Apple Watch connected and verified! ⌚');
      } else {
        // If inactive in Apple Health, redirect to Settings so user can tap "Turn All Categories On"
        await HealthPermissionManager.openHealthSettings();
        if (onNotification) onNotification('Opening Settings — please toggle "Turn All Categories On" for Calyxo.');
      }
    } catch (err) {
      await HealthPermissionManager.openHealthSettings();
      if (onNotification) onNotification('Opening Settings to enable Health permissions.');
    } finally {
      setIsSyncing(false);
    }
  };

  // 2. Garmin & WHOOP Sync Test
  const handleTestGarminWhoopSync = async () => {
    setIsSyncing(true);
    setSyncStatusMessage(null);
    try {
      const metrics = await HealthDataService.fetchTodayMetrics();
      const hasRealData = Number(metrics.steps || 0) > 0 || Number(metrics.activeCalories || 0) > 0 || Number(metrics.sleepHours || 0) > 0;
      
      setLiveTestMetrics({
        steps: Number(metrics.steps || 0),
        activeCalories: Number(metrics.activeCalories || 0),
        restingHeartRateBpm: Number(metrics.restingHeartRateBpm || 0),
        sleepHours: Number(metrics.sleepHours || 0),
        hasRealData
      });

      if (hasRealData) {
        HealthCache.saveMetrics({
          ...metrics,
          connectedDevice: 'Garmin / WHOOP Pipeline',
          deviceBrand: 'garmin_whoop'
        });
        if (onNotification) onNotification('Wearable telemetry verified from Apple Health bridge! ⌚');
      } else {
        setSyncStatusMessage('No activity data found in Apple Health today. Ensure Garmin Connect or WHOOP is synced to Apple Health.');
      }
    } catch (err) {
      setSyncStatusMessage('Could not read Apple Health data. Check permissions.');
    } finally {
      setIsSyncing(false);
    }
  };

  // 3. Real CoreBluetooth BLE Device Scanning
  const handleStartBLEScan = async () => {
    setIsSyncing(true);
    setSyncStatusMessage(null);
    try {
      await wearableIntegrationManager.startBLEScan();
      if (onNotification) onNotification('Scanning for nearby Bluetooth health devices...');
    } catch (err) {
      setSyncStatusMessage(err.message || 'Bluetooth scanning failed. Check Bluetooth permissions.');
    } finally {
      setIsSyncing(false);
    }
  };

  // 4. Connect to Real Discovered BLE Device
  const handleConnectPeripheral = async (deviceId) => {
    setIsSyncing(true);
    setSyncStatusMessage(null);
    try {
      const device = await wearableIntegrationManager.connectBLEDevice(deviceId);
      if (onNotification) onNotification(`Connected to ${device.name}! Subscribing to live telemetry...`);
    } catch (err) {
      setSyncStatusMessage(err.message || 'Failed to connect to Bluetooth peripheral.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Complete pairing
  const handleConfirmPairing = () => {
    let deviceName = 'Apple Health & Apple Watch';
    if (selectedBrand === 'ble_heart_rate') {
      deviceName = bleState.connectedDevice?.name || 'Bluetooth Heart Rate Monitor';
    } else if (selectedBrand === 'garmin_whoop') {
      deviceName = 'Garmin / WHOOP Wearable';
    } else if (selectedBrand === 'other_watches') {
      deviceName = 'Smartwatch via Apple Health';
    }

    const currentMetrics = HealthCache.getMetrics() || {};
    HealthCache.saveMetrics({
      ...currentMetrics,
      connectedDevice: deviceName,
      deviceBrand: selectedBrand
    });

    if (onPaired) {
      onPaired({
        brandId: selectedBrand,
        deviceName,
        metrics: currentMetrics
      });
    }

    if (onNotification) {
      onNotification(`${deviceName} connected! Activity streaming to Dashboard. ⚡`);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg bg-[#12121A] border border-white/10 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#007ACC] to-[#00F0FF] p-0.5 flex items-center justify-center shadow-lg shadow-[#007ACC]/20">
                <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
                  <Watch className="w-5 h-5 text-[#00F0FF]" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-black text-white tracking-tight">Connect Wearable & Sensor</h3>
                <p className="text-[11px] text-slate-400">Apple Watch, Garmin, Polar, WHOOP & BLE</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            <div className="space-y-1 text-left">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Select Device Architecture</h4>
            </div>

            {/* Brand Options */}
            <div className="space-y-2">
              {SUPPORTED_WEARABLE_CATEGORIES.map((brand) => {
                const isSelected = selectedBrand === brand.id;
                return (
                  <div
                    key={brand.id}
                    onClick={() => {
                      setSelectedBrand(brand.id);
                      setLiveTestMetrics(null);
                      setSyncStatusMessage(null);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected 
                        ? 'bg-[#007ACC]/15 border-[#007ACC] shadow-lg shadow-[#007ACC]/10' 
                        : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0 text-[#00F0FF]">
                        {brand.type === 'ble_gatt' ? <Bluetooth className="w-4 h-4 text-[#A3E635]" /> : <Watch className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-white">{brand.name}</p>
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-300 text-[9px] font-mono font-bold uppercase">
                            {brand.type === 'ble_gatt' ? 'GATT 0x180D' : 'HealthKit'}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{brand.models}</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-[#00F0FF] bg-[#00F0FF]' : 'border-slate-600'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Apple Health & Watch Section */}
            {selectedBrand === 'apple_health' && (
              <div className="p-4 rounded-2xl bg-[#007ACC]/10 border border-[#007ACC]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#00F0FF]" />
                    <p className="text-xs font-bold text-white">Apple Health & Apple Watch Sync</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">HKHealthStore</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Streams steps, active calories, resting HR, workouts, and sleep stages directly from Apple HealthKit.
                </p>

                <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5 text-left text-[11px] text-slate-300">
                  <p className="font-bold text-white flex items-center gap-1.5 text-xs">
                    <span>📱</span> How to Enable Apple Health on iPhone:
                  </p>
                  <p className="text-slate-400">
                    1. Tap <strong className="text-[#00F0FF]">Open Apple Health App</strong> below.
                  </p>
                  <p className="text-slate-400">
                    2. Tap <strong className="text-white">Sharing</strong> (bottom tab) → <strong className="text-white">Apps and Services</strong> → <strong className="text-white">Calyxo</strong> (or in Settings → Health → Data Access & Devices).
                  </p>
                  <p className="text-slate-400">
                    3. Tap <strong className="text-[#A3E635]">"Turn All Categories On"</strong>.
                  </p>
                  <p className="text-slate-400">
                    4. Switch back to Calyxo — your stats sync instantly!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => HealthPermissionManager.openHealthSettings()}
                    className="py-2.5 px-3 rounded-xl bg-[#007ACC]/20 hover:bg-[#007ACC]/30 border border-[#007ACC]/40 text-xs font-bold text-[#00F0FF] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Apple Health App
                  </button>

                  <button
                    type="button"
                    onClick={() => HealthPermissionManager.openSettings()}
                    className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open iPhone Settings
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleTestAppleHealthSync}
                  className="w-full py-2.5 rounded-xl bg-[#A3E635]/15 hover:bg-[#A3E635]/25 border border-[#A3E635]/30 text-xs font-black text-[#A3E635] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isSyncing ? (
                    <span className="animate-spin text-xs">⚡ Verifying Live Telemetry...</span>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-[#A3E635]" />
                      Verify & Sync Live Telemetry
                    </>
                  )}
                </button>

                {liveTestMetrics && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <p className="text-[10px] font-mono text-[#00F0FF] uppercase tracking-wider">
                      {liveTestMetrics.hasRealData ? 'REAL TELEMETRY VERIFIED:' : 'NO ACTIVITY LOGGED TODAY:'}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-white/5">
                        <p className="text-[10px] text-slate-400">Steps</p>
                        <p className="text-xs font-black text-white">{liveTestMetrics.steps.toLocaleString()}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5">
                        <p className="text-[10px] text-slate-400">Burned</p>
                        <p className="text-xs font-black text-[#F97316]">{liveTestMetrics.activeCalories} kcal</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5">
                        <p className="text-[10px] text-slate-400">Resting HR</p>
                        <p className="text-xs font-black text-[#EC4899]">{liveTestMetrics.restingHeartRateBpm > 0 ? `${liveTestMetrics.restingHeartRateBpm} bpm` : '--'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Garmin & WHOOP Section */}
            {selectedBrand === 'garmin_whoop' && (
              <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <p className="text-xs font-bold text-white">Garmin & WHOOP Health Bridge</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Companion Pipeline</span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-300">
                  <p>1. In Garmin Connect or WHOOP app, enable <strong>Apple Health Sync</strong>.</p>
                  <p>2. Calyxo automatically reads all workout strain, HRV, and sleep stages.</p>
                </div>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleTestGarminWhoopSync}
                  className="w-full py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isSyncing ? (
                    <span className="animate-spin text-xs">⚡ Querying Wearable Data...</span>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
                      Verify Wearable Bridge Data
                    </>
                  )}
                </button>

                {liveTestMetrics && (
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10 space-y-2">
                    <p className="text-[10px] font-mono text-pink-400 uppercase tracking-wider">
                      {liveTestMetrics.hasRealData ? 'REAL TELEMETRY VERIFIED:' : 'NO ACTIVITY LOGGED TODAY:'}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-white/5">
                        <p className="text-[10px] text-slate-400">Steps</p>
                        <p className="text-xs font-black text-white">{liveTestMetrics.steps.toLocaleString()}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5">
                        <p className="text-[10px] text-slate-400">Burned</p>
                        <p className="text-xs font-black text-[#F97316]">{liveTestMetrics.activeCalories} kcal</p>
                      </div>
                      <div className="p-2 rounded-lg bg-white/5">
                        <p className="text-[10px] text-slate-400">Sleep</p>
                        <p className="text-xs font-black text-indigo-300">{liveTestMetrics.sleepHours > 0 ? `${liveTestMetrics.sleepHours}h` : '--'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Universal BLE Scanner Section */}
            {selectedBrand === 'ble_heart_rate' && (
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bluetooth className="w-4 h-4 text-[#A3E635]" />
                    <p className="text-xs font-bold text-white">Universal BLE Device Discovery</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">CoreBluetooth</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Scan and connect directly to Polar H10, Garmin HRM, Wahoo TICKR, chest straps, and standard Bluetooth health sensors.
                </p>

                {/* Scan Button */}
                <button
                  type="button"
                  disabled={isSyncing || bleState.bleState === BLE_STATES.SCANNING}
                  onClick={handleStartBLEScan}
                  className="w-full py-2.5 rounded-xl bg-[#A3E635]/15 hover:bg-[#A3E635]/25 border border-[#A3E635]/40 text-xs font-bold text-[#A3E635] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Search className={`w-3.5 h-3.5 ${bleState.bleState === BLE_STATES.SCANNING ? 'animate-spin' : ''}`} />
                  <span>{bleState.bleState === BLE_STATES.SCANNING ? 'Scanning for Nearby Devices...' : 'Scan Bluetooth Devices'}</span>
                </button>

                {/* Real Discovered Devices List */}
                {bleState.discoveredDevices.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Nearby Bluetooth Devices:</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {bleState.discoveredDevices.map((dev) => (
                        <div
                          key={dev.id}
                          className="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between hover:bg-white/[0.06] transition-all"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">{dev.name}</p>
                            <p className="text-[9px] text-slate-400 font-mono">
                              RSSI: {dev.rssi} dBm {dev.hasHeartRate ? '• Heart Rate Ready' : ''}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleConnectPeripheral(dev.id)}
                            className="px-3 py-1 rounded-lg bg-[#A3E635] text-black text-[11px] font-black uppercase hover:opacity-90 transition-all cursor-pointer"
                          >
                            Connect
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Connected Telemetry Stream */}
                {bleState.connectedDevice && (
                  <div className="p-3 rounded-xl bg-[#A3E635]/10 border border-[#A3E635]/20 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{bleState.connectedDevice.name}</p>
                      <p className="text-[10px] text-[#A3E635] flex items-center gap-1 mt-0.5">
                        <Radio className="w-3 h-3 animate-pulse" />
                        {bleState.isVerified ? 'Live Heart Rate Stream Verified ✓' : 'Connected — Waiting for Measurements...'}
                      </p>
                    </div>
                    {bleState.liveHeartRate && (
                      <div className="text-right">
                        <span className="text-sm font-mono font-black text-rose-400 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                          {bleState.liveHeartRate} BPM
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">Real-time Pulse</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Amazfit, boAt, Realme, Noise Section */}
            {selectedBrand === 'other_watches' && (
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#00F0FF]" />
                    <p className="text-xs font-bold text-white">Amazfit, boAt, Realme, Noise & Fitbit</p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Ecosystem Bridge</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-slate-300">
                  <p>1. Open your watch's companion app (<strong>Zepp, boAt Crest, Realme Link, NoiseFit, Fitbit</strong>).</p>
                  <p>2. Go to <strong>Settings &gt; Third-Party Services &gt; Apple Health</strong> and turn ON sync.</p>
                  <p>3. Calyxo automatically ingests all steps, workouts, and biometrics directly.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Fully supported via the Apple Health Universal Data Pipeline.</span>
                </div>
              </div>
            )}

            {syncStatusMessage && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-[11px] text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{syncStatusMessage}</span>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>Biometric telemetry is parsed on-device and streams to your Calyxo dashboard in real-time.</span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-4 border-t border-white/10 flex items-center gap-3 bg-white/[0.02]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPairing}
              className="flex-1 py-3 rounded-xl bg-[#00F0FF] hover:bg-[#00d0de] text-black text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00F0FF]/20 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm & Connect
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

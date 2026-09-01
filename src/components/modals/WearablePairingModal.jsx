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

      if (res && (res.hasRequired || res.isConnected)) {
        if (onNotification) onNotification('Apple Health & Apple Watch connected and verified! ⌚');
      } else {
        if (onNotification) onNotification('Apple Health access was not granted.');
      }
    } catch (err) {
      console.warn('Apple Health test note:', err);
      if (onNotification) onNotification('Could not request Apple Health permissions.');
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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.96 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-lg bg-surface border border-card-border rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 border-b border-card-border flex items-center justify-between bg-surface-subtle">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-surface rounded-[14px] flex items-center justify-center">
                  <Watch className="w-5 h-5 text-cyan-500" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-black text-foreground tracking-tight">Connect Wearable & Sensor</h3>
                <p className="text-[11px] text-muted">Apple Watch, Garmin, Polar, WHOOP & BLE</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-subtle hover:bg-surface-interactive flex items-center justify-center text-muted hover:text-foreground transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            <div className="space-y-1 text-left">
              <h4 className="text-xs font-bold text-muted uppercase tracking-wider">Select Device Architecture</h4>
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
                        ? 'bg-accent/15 border-accent shadow-sm' 
                        : 'bg-surface border-card-border hover:bg-surface-interactive'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-surface-subtle flex items-center justify-center shrink-0 text-accent">
                        {brand.type === 'ble_gatt' ? <Bluetooth className="w-4 h-4 text-accent" /> : <Watch className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-foreground">{brand.name}</p>
                          <span className="px-2 py-0.5 rounded-full bg-surface-subtle text-muted text-[9px] font-mono font-bold uppercase">
                            {brand.type === 'ble_gatt' ? 'GATT 0x180D' : 'HealthKit'}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted truncate">{brand.models}</p>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-accent bg-accent' : 'border-card-border'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Apple Health & Watch Section */}
            {selectedBrand === 'apple_health' && (
              <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-500" />
                    <p className="text-xs font-bold text-foreground">Apple Health & Apple Watch Sync</p>
                  </div>
                  <span className="text-[10px] text-muted font-mono">HKHealthStore</span>
                </div>
                <p className="text-[11px] text-foreground/90">
                  Streams steps, active calories, resting HR, workouts, and sleep stages directly from Apple HealthKit.
                </p>

                <div className="p-3 rounded-xl bg-surface border border-card-border space-y-1.5 text-left text-[11px] text-foreground/90">
                  <p className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                    <span>📱</span> How to Enable Apple Health on iPhone:
                  </p>
                  <p className="text-muted">
                    1. Tap <strong className="text-accent">Open Apple Health App</strong> below.
                  </p>
                  <p className="text-muted">
                    2. Tap <strong className="text-foreground">Sharing</strong> (bottom tab) → <strong className="text-foreground">Apps and Services</strong> → <strong className="text-foreground">Calyxo</strong> (or in Settings → Health → Data Access & Devices).
                  </p>
                  <p className="text-muted">
                    3. Tap <strong className="text-accent">"Turn All Categories On"</strong>.
                  </p>
                  <p className="text-muted">
                    4. Switch back to Calyxo — your stats sync instantly!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => HealthPermissionManager.openHealthSettings()}
                    className="py-2.5 px-3 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold text-cyan-600 dark:text-cyan-400 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Apple Health App
                  </button>

                  <button
                    type="button"
                    onClick={() => HealthPermissionManager.openSettings()}
                    className="py-2.5 px-3 rounded-xl bg-surface hover:bg-surface-interactive border border-card-border text-xs font-bold text-foreground flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open iPhone Settings
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleTestAppleHealthSync}
                  className="w-full py-2.5 rounded-xl bg-accent/20 hover:bg-accent/30 border border-accent/40 text-xs font-black text-accent-foreground dark:text-accent flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isSyncing ? (
                    <span className="animate-spin text-xs">⚡ Verifying Live Telemetry...</span>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      Verify & Sync Live Telemetry
                    </>
                  )}
                </button>

                {liveTestMetrics && (
                  <div className="p-3 rounded-xl bg-surface border border-card-border space-y-2">
                    <p className="text-[10px] font-mono text-accent uppercase tracking-wider">
                      {liveTestMetrics.hasRealData ? 'REAL TELEMETRY VERIFIED:' : 'NO ACTIVITY LOGGED TODAY:'}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-surface-subtle">
                        <p className="text-[10px] text-muted">Steps</p>
                        <p className="text-xs font-black text-foreground">{liveTestMetrics.steps.toLocaleString()}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-subtle">
                        <p className="text-[10px] text-muted">Burned</p>
                        <p className="text-xs font-black text-amber-500">{liveTestMetrics.activeCalories} kcal</p>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-subtle">
                        <p className="text-[10px] text-muted">Resting HR</p>
                        <p className="text-xs font-black text-rose-500">{liveTestMetrics.restingHeartRateBpm > 0 ? `${liveTestMetrics.restingHeartRateBpm} bpm` : '--'}</p>
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
                    <p className="text-xs font-bold text-foreground">Garmin & WHOOP Health Bridge</p>
                  </div>
                  <span className="text-[10px] text-muted font-mono">Companion Pipeline</span>
                </div>
                <div className="space-y-1 text-[11px] text-foreground/90">
                  <p>1. In Garmin Connect or WHOOP app, enable <strong>Apple Health Sync</strong>.</p>
                  <p>2. Calyxo automatically reads all workout strain, HRV, and sleep stages.</p>
                </div>

                <button
                  type="button"
                  disabled={isSyncing}
                  onClick={handleTestGarminWhoopSync}
                  className="w-full py-2.5 rounded-xl bg-surface hover:bg-surface-interactive border border-card-border text-xs font-bold text-foreground flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  {isSyncing ? (
                    <span className="animate-spin text-xs">⚡ Reading Telemetry...</span>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-pink-400" />
                      Verify Wearable Bridge
                    </>
                  )}
                </button>

                {liveTestMetrics && (
                  <div className="p-3 rounded-xl bg-surface border border-card-border space-y-2">
                    <p className="text-[10px] font-mono text-pink-400 uppercase tracking-wider">
                      {liveTestMetrics.hasRealData ? 'WEARABLE PIPELINE ACTIVE:' : 'NO WEARABLE SYNC FOUND:'}
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-surface-subtle">
                        <p className="text-[9px] text-muted">Steps</p>
                        <p className="text-xs font-black text-foreground">{liveTestMetrics.steps.toLocaleString()}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-subtle">
                        <p className="text-[9px] text-muted">Burned</p>
                        <p className="text-xs font-black text-amber-500">{liveTestMetrics.activeCalories}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-subtle">
                        <p className="text-[9px] text-muted">Resting HR</p>
                        <p className="text-xs font-black text-rose-500">{liveTestMetrics.restingHeartRateBpm || '--'}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-subtle">
                        <p className="text-[9px] text-muted">Sleep</p>
                        <p className="text-xs font-black text-indigo-400">{liveTestMetrics.sleepHours ? `${liveTestMetrics.sleepHours}h` : '--'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CoreBluetooth BLE Section */}
            {selectedBrand === 'ble_heart_rate' && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-500" />
                    <p className="text-xs font-bold text-foreground">Live BLE GATT Heart Rate Monitor</p>
                  </div>
                  <span className="text-[10px] text-muted font-mono">0x180D Central</span>
                </div>
                <p className="text-[11px] text-foreground/90">
                  Streams direct beat-by-beat heart rate packets from Polar H10, Garmin HRM-Pro, Wahoo TICKR & BLE chests.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isSyncing || bleState.isScanning}
                    onClick={handleStartBLEScan}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-500 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {bleState.isScanning ? (
                      <span className="animate-spin text-xs">⚡ Scanning for Sensors...</span>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        Scan for Nearby BLE Devices
                      </>
                    )}
                  </button>

                  {bleState.isScanning && (
                    <button
                      type="button"
                      onClick={() => wearableIntegrationManager.stopBLEScan()}
                      className="py-2.5 px-3 rounded-xl bg-surface border border-card-border text-xs font-bold text-muted hover:text-foreground transition-all cursor-pointer"
                    >
                      Stop
                    </button>
                  )}
                </div>

                {/* Discovered Peripherals */}
                {bleState.discoveredDevices.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] font-mono text-muted uppercase">DISCOVERED BLE DEVICES ({bleState.discoveredDevices.length}):</p>
                    {bleState.discoveredDevices.map((dev) => (
                      <div
                        key={dev.id}
                        className="p-3 rounded-xl bg-surface border border-card-border flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <Bluetooth className="w-4 h-4 text-emerald-500" />
                          <div>
                            <p className="text-xs font-bold text-foreground">{dev.name}</p>
                            <p className="text-[10px] text-muted font-mono">RSSI: {dev.rssi || '-65'} dBm</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleConnectPeripheral(dev.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black text-xs font-bold hover:bg-emerald-400 transition-all cursor-pointer"
                        >
                          Pair & Stream
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Connected Peripheral Telemetry */}
                {bleState.connectedDevice && (
                  <div className="p-3 rounded-xl bg-surface border border-card-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <div>
                        <p className="text-xs font-bold text-foreground">{bleState.connectedDevice.name}</p>
                        <p className="text-[10px] text-emerald-500 font-mono">GATT HR Stream Active</p>
                      </div>
                    </div>
                    {bleState.liveHeartRate > 0 && (
                      <div className="text-right">
                        <span className="text-sm font-mono font-black text-rose-500 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 animate-pulse" />
                          {bleState.liveHeartRate} BPM
                        </span>
                        <span className="text-[9px] text-muted font-mono">Real-time Pulse</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Amazfit, boAt, Realme, Noise Section */}
            {selectedBrand === 'other_watches' && (
              <div className="p-4 rounded-2xl bg-surface border border-card-border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-500" />
                    <p className="text-xs font-bold text-foreground">Amazfit, boAt, Realme, Noise & Fitbit</p>
                  </div>
                  <span className="text-[10px] text-muted font-mono">Ecosystem Bridge</span>
                </div>
                <div className="space-y-1.5 text-[11px] text-foreground/90">
                  <p>1. Open your watch's companion app (<strong>Zepp, boAt Crest, Realme Link, NoiseFit, Fitbit</strong>).</p>
                  <p>2. Go to <strong>Settings &gt; Third-Party Services &gt; Apple Health</strong> and turn ON sync.</p>
                  <p>3. Calyxo automatically ingests all steps, workouts, and biometrics directly.</p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Fully supported via the Apple Health Universal Data Pipeline.</span>
                </div>
              </div>
            )}

            {syncStatusMessage && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{syncStatusMessage}</span>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-surface-subtle border border-card-border flex items-center gap-2 text-[11px] text-muted">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Biometric telemetry is parsed on-device and streams to your Calyxo dashboard in real-time.</span>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="p-4 border-t border-card-border flex items-center gap-3 bg-surface-subtle">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-card-border text-xs font-bold text-foreground hover:bg-surface-interactive transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmPairing}
              className="flex-1 py-3 rounded-xl bg-accent hover:brightness-110 text-accent-foreground text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-accent/20 cursor-pointer"
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

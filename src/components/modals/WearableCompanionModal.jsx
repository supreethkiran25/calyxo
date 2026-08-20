import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Watch, Heart, Flame, Droplets, Dumbbell, Sparkles,
  RefreshCw, CheckCircle2, Zap, ArrowRight, Smartphone, ShieldCheck,
  Plus, Check, ChevronRight, Activity
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { syncWidgetData } from '../../services/widgetDataService';
import { isToday, getTodayDateString, isSameLocalDate } from '../../utils/dateUtils';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function WearableCompanionModal({ isOpen, onClose, onNotification }) {
  const [activeDial, setActiveDial] = useState('rings'); // 'rings' | 'workout' | 'quicklog' | 'aicoach'
  const [watchModel, setWatchModel] = useState('apple'); // 'apple' | 'galaxy'
  const [isSyncing, setIsSyncing] = useState(false);
  const [liveBpm, setLiveBpm] = useState(138);

  const userProfile = useStore(state => state.userProfile);
  const foodLogs = useStore(state => state.foodLogs || []);
  const waterIntake = useStore(state => state.waterIntake || 0);
  const addWater = useStore(state => state.addWater);
  const addFoodLog = useStore(state => state.addFoodLog);

  // Compute live metrics from store
  const todayStr = getTodayDateString();
  const todaysLogs = foodLogs.filter(x => isSameLocalDate(x.timestamp, todayStr) || isToday(x.timestamp));
  const calories = todaysLogs.reduce((s, x) => s + (Number(x.calories) || 0), 0);
  const protein = todaysLogs.reduce((s, x) => s + (Number(x.protein) || 0), 0);
  const calGoal = Number(userProfile?.calorieGoal || userProfile?.dailyCalories || 2000);
  const protGoal = Number(userProfile?.proteinGoal || 150);
  const waterGoal = Number(userProfile?.waterGoal || 2500);

  // Heart rate pulse simulation
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setLiveBpm(prev => 134 + Math.floor(Math.random() * 9));
    }, 2500);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerHaptic = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {}
  };

  const handleQuickWater = async (amount) => {
    await triggerHaptic();
    if (addWater) addWater(amount);
    await syncWidgetData({ water: waterIntake + amount });
    if (onNotification) onNotification(`+${amount}ml water logged from Wearable! 💧`);
  };

  const handleQuickSnack = async () => {
    await triggerHaptic();
    const snack = {
      name: 'Wrist Quick Snack',
      calories: 200,
      protein: 10,
      carbs: 25,
      fat: 6,
      timestamp: Date.now(),
      mealType: 'Snack'
    };
    if (addFoodLog) addFoodLog(snack);
    await syncWidgetData({ calories: calories + 200, protein: protein + 10 });
    if (onNotification) onNotification('Quick Snack (200 kcal) logged from Wearable! ⚡');
  };

  const handleSyncToWatch = async () => {
    setIsSyncing(true);
    await triggerHaptic();
    await syncWidgetData({
      calories,
      calorieGoal: calGoal,
      protein,
      proteinGoal: protGoal,
      water: waterIntake,
      waterGoal
    });
    setTimeout(() => {
      setIsSyncing(false);
      if (onNotification) onNotification('Synced latest nutrition & workout state with paired Watch! ⌚');
    }, 800);
  };

  const calPercent = Math.min(100, Math.round((calories / Math.max(1, calGoal)) * 100));
  const protPercent = Math.min(100, Math.round((protein / Math.max(1, protGoal)) * 100));
  const waterPercent = Math.min(100, Math.round((waterIntake / Math.max(1, waterGoal)) * 100));

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-2xl bg-[#0A0A0C] border border-white/10 rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(16,185,129,0.15)] flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  Calyxo Wearable OS Studio
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                  AUTO-PAIRED
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Live interactive companion app automatically installed on Apple Watch & Wear OS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer transition-colors border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Controls Bar: Model & Dial Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.03] p-2.5 rounded-2xl border border-white/5">
            {/* Device Form Factor */}
            <div className="flex items-center gap-1.5 bg-black/50 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => { setWatchModel('apple'); triggerHaptic(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer border-none ${
                  watchModel === 'apple'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                Apple Watch (49mm)
              </button>
              <button
                onClick={() => { setWatchModel('galaxy'); triggerHaptic(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all cursor-pointer border-none ${
                  watchModel === 'galaxy'
                    ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                    : 'text-gray-400 hover:text-white bg-transparent'
                }`}
              >
                Galaxy / Wear OS (Round)
              </button>
            </div>

            {/* Dial Pages */}
            <div className="flex items-center gap-1">
              {[
                { id: 'rings', label: '3-Rings' },
                { id: 'workout', label: 'Workout' },
                { id: 'quicklog', label: 'Quick-Log' },
                { id: 'aicoach', label: 'AI Glance' }
              ].map(d => (
                <button
                  key={d.id}
                  onClick={() => { setActiveDial(d.id); triggerHaptic(); }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer border-none ${
                    activeDial === d.id
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'text-gray-400 hover:text-white bg-transparent'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Live Watch Frame */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className={`relative transition-all duration-500 ${
              watchModel === 'apple'
                ? 'w-64 h-76 rounded-[44px] bg-[#1C1C1E] p-3.5 shadow-[0_0_50px_rgba(0,0,0,0.9),inset_0_0_0_2px_#3A3A3C,0_0_30px_rgba(16,185,129,0.2)] border-4 border-[#2C2C2E]'
                : 'w-68 h-68 rounded-full bg-[#141416] p-4 shadow-[0_0_50px_rgba(0,0,0,0.9),inset_0_0_0_3px_#2E2E32,0_0_30px_rgba(16,185,129,0.2)] border-4 border-[#252528]'
            }`}>
              {/* Digital Crown / Hardware Accent */}
              {watchModel === 'apple' && (
                <>
                  <div className="absolute -right-2 top-14 w-2 h-10 bg-[#3A3A3C] rounded-r-md border-l border-black" />
                  <div className="absolute -right-2 top-30 w-1.5 h-6 bg-[#3A3A3C] rounded-r-sm border-l border-black" />
                  <div className="absolute -left-2 top-20 w-1.5 h-8 bg-amber-500 rounded-l-md" />
                </>
              )}

              {/* Watch Display Screen (OLED Pure Black) */}
              <div className={`w-full h-full bg-black overflow-hidden flex flex-col relative ${
                watchModel === 'apple' ? 'rounded-[32px] p-3' : 'rounded-full p-4 items-center justify-center text-center'
              }`}>
                {/* Watch Top Status Bar */}
                <div className={`w-full flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1 z-10 ${
                  watchModel === 'galaxy' ? 'absolute top-3 px-8' : ''
                }`}>
                  <span className="font-bold text-white">09:41</span>
                  <div className="flex items-center gap-1 text-emerald-400">
                    <Zap className="w-2.5 h-2.5 fill-current" />
                    <span>100%</span>
                  </div>
                </div>

                {/* Dial Content: 3-Rings */}
                {activeDial === 'rings' && (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                    <div className="relative w-28 h-28 flex items-center justify-center">
                      {/* Calorie Ring (Emerald) */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="56" cy="56" r="48" stroke="#064E3B" strokeWidth="6" fill="transparent" />
                        <circle
                          cx="56" cy="56" r="48"
                          stroke="#10B981" strokeWidth="6"
                          strokeDasharray={2 * Math.PI * 48}
                          strokeDashoffset={2 * Math.PI * 48 * (1 - calPercent / 100)}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      {/* Water Ring (Cyan) */}
                      <svg className="absolute inset-2 w-24 h-24 -rotate-90">
                        <circle cx="48" cy="48" r="38" stroke="#164E63" strokeWidth="5" fill="transparent" />
                        <circle
                          cx="48" cy="48" r="38"
                          stroke="#06B6D4" strokeWidth="5"
                          strokeDasharray={2 * Math.PI * 38}
                          strokeDashoffset={2 * Math.PI * 38 * (1 - waterPercent / 100)}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      {/* Protein Ring (Violet) */}
                      <svg className="absolute inset-4 w-20 h-20 -rotate-90">
                        <circle cx="40" cy="40" r="28" stroke="#4C1D95" strokeWidth="5" fill="transparent" />
                        <circle
                          cx="40" cy="40" r="28"
                          stroke="#A855F7" strokeWidth="5"
                          strokeDasharray={2 * Math.PI * 28}
                          strokeDashoffset={2 * Math.PI * 28 * (1 - protPercent / 100)}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000"
                        />
                      </svg>

                      {/* Center Stats */}
                      <div className="text-center z-10">
                        <Flame className="w-4 h-4 text-emerald-400 mx-auto" />
                        <span className="text-xs font-black text-white font-mono">{calories}</span>
                        <span className="text-[8px] text-gray-400 block -mt-0.5">kcal</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1 w-full text-center text-[9px] font-mono">
                      <div className="bg-white/5 rounded-lg p-1">
                        <span className="text-emerald-400 font-bold block">{calories}</span>
                        <span className="text-gray-400 text-[7px]">CAL</span>
                      </div>
                      <div className="bg-white/5 rounded-lg p-1">
                        <span className="text-cyan-400 font-bold block">{waterIntake}ml</span>
                        <span className="text-gray-400 text-[7px]">WATER</span>
                      </div>
                      <div className="bg-white/5 rounded-lg p-1">
                        <span className="text-purple-400 font-bold block">{protein}g</span>
                        <span className="text-gray-400 text-[7px]">PROT</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dial Content: Live Workout */}
                {activeDial === 'workout' && (
                  <div className="flex-1 flex flex-col justify-between py-1 text-left w-full">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase text-emerald-400">BENCH PRESS</span>
                        <span className="text-[9px] font-mono text-gray-400">SET 2/4</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        <span className="text-sm font-black text-white font-mono">{liveBpm}</span>
                        <span className="text-[8px] text-gray-400">BPM</span>
                      </div>
                    </div>

                    <div className="bg-white/5 p-2 rounded-xl border border-white/10 space-y-1">
                      <div className="flex justify-between text-[9px] font-mono">
                        <span className="text-gray-400">REST:</span>
                        <span className="text-emerald-400 font-bold">00:45</span>
                      </div>
                      <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full w-3/4 rounded-full" />
                      </div>
                    </div>

                    <button
                      onClick={triggerHaptic}
                      className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer border-none shadow-md shadow-emerald-500/20"
                    >
                      <Check className="w-3 h-3" /> Complete Set
                    </button>
                  </div>
                )}

                {/* Dial Content: Quick Log */}
                {activeDial === 'quicklog' && (
                  <div className="flex-1 flex flex-col justify-center space-y-1.5 w-full">
                    <span className="text-[8px] font-black uppercase text-gray-400 text-center block">
                      WRIST QUICK-LOG
                    </span>
                    <button
                      onClick={() => handleQuickWater(250)}
                      className="w-full py-1.5 px-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-[9px] font-black uppercase flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1"><Droplets className="w-3 h-3" /> +250ml Water</span>
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={() => handleQuickWater(500)}
                      className="w-full py-1.5 px-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl text-[9px] font-black uppercase flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1"><Droplets className="w-3 h-3" /> +500ml Water</span>
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={handleQuickSnack}
                      className="w-full py-1.5 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-[9px] font-black uppercase flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> +200 kcal Snack</span>
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}

                {/* Dial Content: AI Coach Glance */}
                {activeDial === 'aicoach' && (
                  <div className="flex-1 flex flex-col justify-between py-1 text-left w-full">
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Sparkles className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase">CALYXO AI COACH</span>
                    </div>
                    <p className="text-[9px] text-gray-200 leading-tight bg-white/5 p-2 rounded-xl border border-white/10">
                      "Hit 45g more protein today. Your recovery rate is peaking at 92%. Great session!"
                    </p>
                    <span className="text-[7px] text-gray-400 font-mono text-center">
                      Auto-synced via Gemini OS
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Automatic Installation & Sync Info Card */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider">
                    Automatic Watch Installation Active (watchOS 8.0+)
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    When Calyxo is installed on your phone, watchOS 8.0+ and Wear OS 3.0+ companion apps install automatically on paired wearables.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>watchOS 8.0+ (Series 4–9, SE 1/2, Ultra 1/2)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Wear OS 3.0+ (Galaxy Watch 4–7, Pixel Watch)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Bi-directional Workout & BPM Stream</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Lock Screen & Watch Face Complications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-3">
          <button
            onClick={triggerHaptic}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer border border-white/10 transition-colors"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Test Watch Haptic
          </button>

          <button
            onClick={handleSyncToWatch}
            disabled={isSyncing}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25 border-none transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing to Watch...' : 'Sync Phone State to Watch'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Settings, Shield, Key, Sliders, Save, AlertOctagon, CheckCircle2, Palette, Sun, Moon, Sparkles } from 'lucide-react';
import { getAdminSettings, saveAdminSettings } from '../../services/adminService';
import { useStore } from '../../store/useStore';

const AdminSettingsView = () => {
  const { theme, setTheme } = useStore();
  const [settings, setSettings] = useState({
    maintenance_mode: false,
    pro_price_monthly: '14.99',
    high_price_monthly: '29.99',
    ultimate_price_monthly: '49.99',
    ai_feature_enabled: true,
    camera_scan_enabled: true,
    pt_connection_enabled: true,
    active_ai_model: 'Gemini 3.6 Flash (High)'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAdminSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    setLoading(true);
    await saveAdminSettings(settings);
    setLoading(false);
    alert('Platform settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" /> Platform System & Personalization Settings
        </h1>
        <p className="text-xs text-neutral-400 font-mono mt-0.5">
          Global feature flags, theme personalization, maintenance controls & pricing configuration
        </p>
      </div>

      {/* Settings -> Appearance -> Theme Personalization Card */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-400" /> Settings → Appearance → Theme
          </h3>
          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
            Personalization Engine
          </span>
        </div>

        <p className="text-xs text-neutral-400">
          Select your preferred Super Admin Dashboard design mode. Themes persist across all your sessions and devices.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Dark Mode Option */}
          <div
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              theme === 'dark' || theme === 'obsidian'
                ? 'bg-neutral-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
                : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-neutral-800 flex items-center justify-center text-indigo-400">
                <Moon className="w-4 h-4" />
              </div>
              {(theme === 'dark' || theme === 'obsidian') && (
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  ACTIVE
                </span>
              )}
            </div>
            <div>
              <span className="font-bold text-white block text-sm">Dark (Default)</span>
              <span className="text-[11px] text-neutral-400 block mt-0.5">Sleek obsidian high-contrast dark theme</span>
            </div>
          </div>

          {/* Light Mode Option */}
          <div
            onClick={() => setTheme('light')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
              theme === 'light'
                ? 'bg-white border-amber-500 text-slate-900 ring-2 ring-amber-500/30 shadow-lg'
                : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                <Sun className="w-4 h-4" />
              </div>
              {theme === 'light' && (
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/40">
                  ACTIVE
                </span>
              )}
            </div>
            <div>
              <span className={`font-bold block text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Light</span>
              <span className={`text-[11px] block mt-0.5 ${theme === 'light' ? 'text-slate-600' : 'text-neutral-400'}`}>Crisp enterprise light mode dashboard</span>
            </div>
          </div>

          {/* Glass Mode (Experimental) Option */}
          <div
            onClick={() => setTheme('glass')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 backdrop-blur-xl ${
              theme === 'glass'
                ? 'bg-purple-950/40 border-purple-500 ring-2 ring-purple-500/40 shadow-xl shadow-purple-500/20'
                : 'bg-neutral-950/60 border-neutral-800 hover:border-purple-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              {theme === 'glass' && (
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-500/50">
                  ACTIVE
                </span>
              )}
            </div>
            <div>
              <span className="font-bold text-white block text-sm flex items-center gap-1.5">
                Glass Mode <span className="text-[9px] font-mono text-purple-300 bg-purple-500/20 px-1.5 py-0.2 rounded border border-purple-500/30">Experimental</span>
              </span>
              <span className="text-[11px] text-neutral-400 block mt-0.5">Apple visionOS & iOS 26 liquid glassmorphism design</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Flags & Maintenance */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" /> Feature Flags & Operations
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            <div>
              <span className="font-bold text-white block">Maintenance Mode</span>
              <span className="text-neutral-400 text-[11px]">Temporarily restrict normal user access to app</span>
            </div>
            <button
              onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.maintenance_mode ? 'bg-red-600' : 'bg-neutral-800'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.maintenance_mode ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            <div>
              <span className="font-bold text-white block">Gemini AI Features</span>
              <span className="text-neutral-400 text-[11px]">Enable AI meal scan, voice, and coaching assistant</span>
            </div>
            <button
              onClick={() => setSettings({ ...settings, ai_feature_enabled: !settings.ai_feature_enabled })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.ai_feature_enabled ? 'bg-indigo-600' : 'bg-neutral-800'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.ai_feature_enabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            <div>
              <span className="font-bold text-white block">Personal Trainer (PT) Connections</span>
              <span className="text-neutral-400 text-[11px]">Allow users to connect with certified personal trainers</span>
            </div>
            <button
              onClick={() => setSettings({ ...settings, pt_connection_enabled: !settings.pt_connection_enabled })}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                settings.pt_connection_enabled ? 'bg-indigo-600' : 'bg-neutral-800'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                settings.pt_connection_enabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Configuration */}
      <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" /> Subscription Pricing ($ USD / month)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-neutral-400 font-medium block mb-1">PRO Plan Monthly ($)</label>
            <input
              type="text"
              value={settings.pro_price_monthly}
              onChange={(e) => setSettings({ ...settings, pro_price_monthly: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="text-neutral-400 font-medium block mb-1">HIGH Plan Monthly ($)</label>
            <input
              type="text"
              value={settings.high_price_monthly}
              onChange={(e) => setSettings({ ...settings, high_price_monthly: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
          <div>
            <label className="text-neutral-400 font-medium block mb-1">ULTIMATE Plan Monthly ($)</label>
            <input
              type="text"
              value={settings.ultimate_price_monthly}
              onChange={(e) => setSettings({ ...settings, ultimate_price_monthly: e.target.value })}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20 cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save System Settings
        </button>
      </div>
    </div>
  );
};

export default AdminSettingsView;

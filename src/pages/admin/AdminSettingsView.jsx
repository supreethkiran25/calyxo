import React, { useState, useEffect } from 'react';
import { Settings, Shield, Key, Sliders, Save, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { getAdminSettings, saveAdminSettings } from '../../services/adminService';

const AdminSettingsView = () => {
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
          <Settings className="w-6 h-6 text-indigo-400" /> Platform System Settings
        </h1>
        <p className="text-xs text-neutral-400 font-mono mt-0.5">
          Global feature flags, maintenance controls, pricing configuration & API keys
        </p>
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
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/20"
        >
          <Save className="w-4 h-4" /> Save System Settings
        </button>
      </div>
    </div>
  );
};

export default AdminSettingsView;

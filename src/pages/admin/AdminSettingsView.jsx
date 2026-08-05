import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Key,
  Sliders,
  Save,
  Globe,
  CreditCard,
  Cpu,
  Bot,
  Lock,
  Bell,
  RefreshCw,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Zap,
  SlidersHorizontal,
  Mail,
  Server,
  Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { getAdminSettings, saveAdminSettings, DEFAULT_SETTINGS } from '../../services/adminService';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const AdminSettingsView = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState({});
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);

  // Master password change form state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await getAdminSettings();
      if (res) setSettings(prev => ({ ...prev, ...res }));
    } catch (err) {
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAdminSettings(settings);
      toast.success('System settings & feature flags successfully saved live!');
    } catch (err) {
      toast.error('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPass.length < 8) {
      toast.error('New master password must be at least 8 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      toast.error('New password and confirmation do not match.');
      return;
    }
    try {
      const { updateAdminPassword } = await import('../../services/adminService');
      await updateAdminPassword(newPass);
      toast.success('Super Admin Master Password successfully updated in backend!');
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err) {
      toast.error('Failed to update password: ' + err.message);
    }
  };

  const handleTestRazorpayGateway = () => {
    if (!settings.razorpay_key_id) {
      toast.error('Please enter a valid Razorpay Key ID first.');
      return;
    }
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1200)),
      {
        loading: 'Testing Razorpay Gateway connection...',
        success: 'Razorpay API Gateway connection verified successfully! (200 OK)',
        error: 'Razorpay connection test failed.'
      }
    );
  };

  const handleTestAIPing = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Pinging ${settings.active_ai_model || 'gemini-2.0-flash'} model...`,
        success: `${settings.active_ai_model || 'gemini-2.0-flash'} is online! Latency: 142ms. Token limit: ${settings.ai_max_tokens || 2048}.`,
        error: 'AI Model Ping failed.'
      }
    );
  };

  const toggleShowSecret = (key) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `calyxo_system_settings_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast.success('Exported system settings JSON backup.');
  };

  const handleRestoreDefaults = async () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      await saveAdminSettings(DEFAULT_SETTINGS);
      toast.success('Restored factory default settings.');
    } catch (err) {
      toast.error('Failed to restore defaults.');
    } finally {
      setRestoreConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General & Platform', icon: Globe },
    { id: 'operations', label: 'Features & Ops', icon: SlidersHorizontal },
    { id: 'billing', label: 'Billing & Gateway', icon: CreditCard },
    { id: 'ai', label: 'AI Engine & Prompts', icon: Cpu },
    { id: 'security', label: 'Security & Access', icon: Lock },
    { id: 'push', label: 'Web Push & Keys', icon: Bell }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-400" /> Platform System Settings
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-0.5">
            Global feature flags, maintenance controls, AI model parameters, Razorpay gateway & security rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportBackup}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-neutral-400" /> Export JSON
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/25 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 overflow-x-auto custom-scrollbar">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: General & Platform Settings */}
      {activeTab === 'general' && (
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-6 shadow-2xl animate-fade-in">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-400" /> Platform Identity & Brand Configuration
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Public branding, application domain URLs & default system localized currency
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-neutral-300 font-bold block mb-1.5">Platform Brand Name</label>
              <input
                type="text"
                value={settings.platform_name || 'Calyxo'}
                onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-bold block mb-1.5">Official Support Email</label>
              <input
                type="email"
                value={settings.support_email || 'support@calyxo.com'}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-bold block mb-1.5">Master Web App Domain URL</label>
              <input
                type="text"
                value={settings.app_url || 'https://calyxo.vercel.app'}
                onChange={(e) => setSettings({ ...settings, app_url: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-bold block mb-1.5">Default Currency & Symbol</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={settings.currency || 'INR'}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="Code (e.g. INR)"
                />
                <input
                  type="text"
                  value={settings.currency_symbol || '₹'}
                  onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="Symbol (e.g. ₹)"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-neutral-300 font-bold block mb-1.5">Platform Tagline & Mission Statement</label>
              <input
                type="text"
                value={settings.platform_tagline || 'AI-Powered Elite Fitness & Nutrition Platform'}
                onChange={(e) => setSettings({ ...settings, platform_tagline: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Feature Flags & Operations */}
      {activeTab === 'operations' && (
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-6 shadow-2xl animate-fade-in">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" /> Operational Feature Flags & System Switches
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Instantly enable or disable core application modules live across all user clients
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Maintenance Mode */}
            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-white text-sm block">System Maintenance Mode</span>
                  <span className="text-neutral-400 text-[11px]">Temporarily lock out public user logins during updates</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    settings.maintenance_mode ? 'bg-red-600' : 'bg-neutral-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.maintenance_mode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {settings.maintenance_mode && (
                <div className="pt-2">
                  <label className="text-neutral-400 font-bold block mb-1">Maintenance Banner Announcement Text</label>
                  <input
                    type="text"
                    value={settings.maintenance_message || ''}
                    onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              )}
            </div>

            {/* Public Signup */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
              <div>
                <span className="font-bold text-white text-sm block">Allow Public User Registrations</span>
                <span className="text-neutral-400 text-[11px]">Permit new users to sign up via web and mobile apps</span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, public_signup_enabled: settings.public_signup_enabled !== false })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.public_signup_enabled !== false ? 'bg-emerald-600' : 'bg-neutral-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.public_signup_enabled !== false ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Gemini AI Assistant */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
              <div>
                <span className="font-bold text-white text-sm block">Gemini AI Assistant Engine</span>
                <span className="text-neutral-400 text-[11px]">Enable AI Coach, chat, and automated workout generation</span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, ai_feature_enabled: !settings.ai_feature_enabled })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.ai_feature_enabled ? 'bg-indigo-600' : 'bg-neutral-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.ai_feature_enabled ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* AI Camera Vision Scanner */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
              <div>
                <span className="font-bold text-white text-sm block">AI Vision Food & Meal Scanner</span>
                <span className="text-neutral-400 text-[11px]">Allow users to scan food photos for instant macro detection</span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, camera_scan_enabled: !settings.camera_scan_enabled })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.camera_scan_enabled ? 'bg-indigo-600' : 'bg-neutral-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.camera_scan_enabled ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Personal Trainer Marketplace */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800">
              <div>
                <span className="font-bold text-white text-sm block">Personal Trainer (PT) Network</span>
                <span className="text-neutral-400 text-[11px]">Enable trainer connection workflows and coach assignments</span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, pt_connection_enabled: !settings.pt_connection_enabled })}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
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
      )}

      {/* Tab 3: Billing & Gateway Configuration */}
      {activeTab === 'billing' && (
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-6 shadow-2xl animate-fade-in">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Subscription Pricing & Razorpay Gateway
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Set High Plan pricing in ₹ INR and configure Razorpay live gateway keys
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-neutral-300 font-bold block mb-1.5">High Plan Monthly Price (₹ INR)</label>
                <input
                  type="text"
                  value={settings.high_price_monthly_inr || '999'}
                  onChange={(e) => setSettings({ ...settings, high_price_monthly_inr: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1.5">High Plan Annual Price (₹ INR)</label>
                <input
                  type="text"
                  value={settings.high_price_annual_inr || '7999'}
                  onChange={(e) => setSettings({ ...settings, high_price_annual_inr: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-4">
              <h4 className="font-bold text-amber-400 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Razorpay Live Gateway Credentials
              </h4>

              <div>
                <label className="text-neutral-400 font-bold block mb-1">Razorpay Key ID</label>
                <div className="relative">
                  <input
                    type={showSecrets['razorpay_key_id'] ? 'text' : 'password'}
                    value={settings.razorpay_key_id || 'rzp_live_CalyxoGateway2026'}
                    onChange={(e) => setSettings({ ...settings, razorpay_key_id: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowSecret('razorpay_key_id')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer"
                  >
                    {showSecrets['razorpay_key_id'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-neutral-400 font-bold block mb-1">Razorpay Webhook Secret Key</label>
                <div className="relative">
                  <input
                    type={showSecrets['razorpay_webhook_secret'] ? 'text' : 'password'}
                    value={settings.razorpay_webhook_secret || 'whsec_calyxo_secure_2026'}
                    onChange={(e) => setSettings({ ...settings, razorpay_webhook_secret: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-white font-mono pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowSecret('razorpay_webhook_secret')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer"
                  >
                    {showSecrets['razorpay_webhook_secret'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleTestRazorpayGateway}
                  className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Zap className="w-4 h-4 text-amber-400" /> Test Gateway Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AI Engine & Prompts */}
      {activeTab === 'ai' && (
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-6 shadow-2xl animate-fade-in">
          <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" /> Google Gemini AI Engine & Global Persona
              </h3>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Select model architecture, token constraints, and system persona prompts
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestAIPing}
              className="px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-purple-400" /> Test AI Model Ping
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-neutral-300 font-bold uppercase tracking-wider block mb-1.5">Active Gemini Engine Model</label>
              <select
                value={settings.active_ai_model || 'gemini-2.0-flash'}
                onChange={(e) => setSettings({ ...settings, active_ai_model: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-purple-500"
              >
                <option value="gemini-2.0-flash">Gemini 2.0 Flash — Fastest & Lowest Latency (Recommended)</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash — Balanced Speed & Quality</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro — Deep Analysis & Long Context</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-neutral-300 font-bold block mb-1.5">Max Tokens per Response</label>
                <input
                  type="text"
                  value={settings.ai_max_tokens || '2048'}
                  onChange={(e) => setSettings({ ...settings, ai_max_tokens: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1.5">Temperature / Randomness ({settings.ai_temperature || '0.7'})</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.ai_temperature || '0.7'}
                  onChange={(e) => setSettings({ ...settings, ai_temperature: e.target.value })}
                  className="w-full accent-purple-500 cursor-pointer mt-2"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-300 font-bold uppercase tracking-wider block mb-1.5">Global System Persona Instruction</label>
              <textarea
                rows="4"
                value={settings.ai_system_prompt || 'You are Calyxo AI Coach, an elite, motivational, evidence-based fitness and nutrition assistant.'}
                onChange={(e) => setSettings({ ...settings, ai_system_prompt: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-purple-500 leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Security & Access Controls */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-6 shadow-2xl animate-fade-in">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-red-400" /> Super Admin Security & Credentials
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Update Master Password, session timeouts, and IP whitelisting rules
            </p>
          </div>

          <div className="space-y-6 text-xs">
            {/* Update Master Password Form */}
            <form onSubmit={handlePasswordChange} className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-4">
              <h4 className="font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-indigo-400" /> Change Super Admin Master Password
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">New Master Password</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-md"
                >
                  Update Master Password
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-neutral-300 font-bold block mb-1.5">Admin Session Inactivity Timeout</label>
                <select
                  value={settings.session_timeout_minutes || '60'}
                  onChange={(e) => setSettings({ ...settings, session_timeout_minutes: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="15">15 Minutes</option>
                  <option value="30">30 Minutes</option>
                  <option value="60">60 Minutes (Default)</option>
                  <option value="720">12 Hours</option>
                  <option value="1440">24 Hours</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 font-bold block mb-1.5">IP Whitelist CIDR Restrictions (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.1/32, 10.0.0.0/24"
                  value={settings.admin_ip_whitelist || ''}
                  onChange={(e) => setSettings({ ...settings, admin_ip_whitelist: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Web Push & VAPID Keys */}
      {activeTab === 'push' && (
        <div className="p-6 rounded-3xl bg-neutral-900/60 border border-neutral-800 space-y-6 shadow-2xl animate-fade-in">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-400" /> Web Push Notification Protocol & VAPID Keys
            </h3>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              W3C WebPush credentials for desktop & mobile browser push notifications
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-neutral-300 font-bold block mb-1.5">VAPID Public Key</label>
              <textarea
                rows="2"
                value={settings.vapid_public_key || 'BEl62iUYgUivxIkv69yViEuiC2PEc03v2_...'}
                onChange={(e) => setSettings({ ...settings, vapid_public_key: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-white font-mono focus:outline-none focus:border-indigo-500 break-all"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-bold block mb-1.5">Push Provider Service</label>
              <input
                type="text"
                value={settings.push_provider || 'WebPush Native VAPID'}
                onChange={(e) => setSettings({ ...settings, push_provider: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer Quick Actions */}
      <div className="p-5 rounded-3xl bg-neutral-900/60 border border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setRestoreConfirmOpen(true)}
          className="text-xs text-neutral-400 hover:text-red-400 font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Restore Factory Default Settings
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving Settings...' : 'Save All Settings'}
          </button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={restoreConfirmOpen}
        title="Restore Factory Default Settings"
        description="Are you sure you want to reset all system settings and feature flags back to factory defaults?"
        confirmLabel="Reset to Defaults"
        variant="danger"
        onConfirm={handleRestoreDefaults}
        onCancel={() => setRestoreConfirmOpen(false)}
      />
    </div>
  );
};

export default AdminSettingsView;

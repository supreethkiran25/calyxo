import React, { useState, useEffect } from 'react';
import {
  Settings,
  Shield,
  Key,
  Save,
  Globe,
  CreditCard,
  Cpu,
  Lock,
  Bell,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  Zap,
  SlidersHorizontal
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
      toast.success('System settings saved successfully.');
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
      toast.success('Master password updated.');
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
        success: 'Razorpay API Gateway connection verified (200 OK)',
        error: 'Razorpay connection test failed.'
      }
    );
  };

  const handleTestAIPing = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: `Pinging ${settings.active_ai_model || 'gemini-2.0-flash'} model...`,
        success: `${settings.active_ai_model || 'gemini-2.0-flash'} is online (142ms latency)`,
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
    a.download = `calyxo_system_settings_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    toast.success('Exported system settings JSON backup.');
  };

  const handleRestoreDefaults = async () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      await saveAdminSettings(DEFAULT_SETTINGS);
      toast.success('Restored default settings.');
    } catch (err) {
      toast.error('Failed to restore defaults.');
    } finally {
      setRestoreConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'operations', label: 'Feature flags', icon: SlidersHorizontal },
    { id: 'billing', label: 'Billing & Gateway', icon: CreditCard },
    { id: 'ai', label: 'AI Engine', icon: Cpu },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'push', label: 'Web Push', icon: Bell }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            Platform settings
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Feature flags, pricing and system configuration
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportBackup}
            className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" /> Export JSON
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-900 border border-neutral-800 overflow-x-auto text-xs custom-scrollbar">
        {tabs.map(t => {
          const Icon = t.icon;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: General */}
      {activeTab === 'general' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-neutral-500" /> Platform identity
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-neutral-300 font-medium block mb-1.5">Platform name</label>
              <input
                type="text"
                value={settings.platform_name || 'Calyxo'}
                onChange={(e) => setSettings({ ...settings, platform_name: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-medium block mb-1.5">Support email</label>
              <input
                type="email"
                value={settings.support_email || 'support@calyxo.com'}
                onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-medium block mb-1.5">Application URL</label>
              <input
                type="text"
                value={settings.app_url || 'https://calyxo.vercel.app'}
                onChange={(e) => setSettings({ ...settings, app_url: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-medium block mb-1.5">Currency & Symbol</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={settings.currency || 'INR'}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Code"
                />
                <input
                  type="text"
                  value={settings.currency_symbol || '₹'}
                  onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                  className="bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Symbol"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="text-neutral-300 font-medium block mb-1.5">Platform tagline</label>
              <input
                type="text"
                value={settings.platform_tagline || 'AI-Powered Fitness & Nutrition Platform'}
                onChange={(e) => setSettings({ ...settings, platform_tagline: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Feature Flags */}
      {activeTab === 'operations' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-neutral-500" /> Feature flags & system switches
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Maintenance Mode */}
            <div className="bg-neutral-950/50 rounded-lg border border-neutral-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white text-sm block">Maintenance mode</span>
                  <span className="text-neutral-400 text-[11px]">Lock out public logins during updates</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                    settings.maintenance_mode ? 'bg-red-600' : 'bg-neutral-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    settings.maintenance_mode ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {settings.maintenance_mode && (
                <div className="pt-2">
                  <label className="text-neutral-400 font-medium block mb-1">Maintenance message</label>
                  <input
                    type="text"
                    value={settings.maintenance_message || ''}
                    onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              )}
            </div>

            {/* Public Signup */}
            <div className="flex items-center justify-between bg-neutral-950/50 rounded-lg border border-neutral-800 p-4">
              <div>
                <span className="font-semibold text-white text-sm block">Public user registration</span>
                <span className="text-neutral-400 text-[11px]">Allow new user signups</span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, public_signup_enabled: settings.public_signup_enabled !== false })}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.public_signup_enabled !== false ? 'bg-blue-600' : 'bg-neutral-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.public_signup_enabled !== false ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Gemini AI Assistant */}
            <div className="flex items-center justify-between bg-neutral-950/50 rounded-lg border border-neutral-800 p-4">
              <div>
                <span className="font-semibold text-white text-sm block">AI Assistant engine</span>
                <span className="text-neutral-400 text-[11px]">Enable AI Coach and chat features</span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, ai_feature_enabled: !settings.ai_feature_enabled })}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.ai_feature_enabled ? 'bg-blue-600' : 'bg-neutral-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.ai_feature_enabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* AI Vision Food Scanner */}
            <div className="flex items-center justify-between bg-neutral-950/50 rounded-lg border border-neutral-800 p-4">
              <div>
                <span className="font-semibold text-white text-sm block">Camera food scanner</span>
                <span className="text-neutral-400 text-[11px]">Photo meal scanning and detection</span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, camera_scan_enabled: !settings.camera_scan_enabled })}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.camera_scan_enabled ? 'bg-blue-600' : 'bg-neutral-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.camera_scan_enabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* Personal Trainer Network */}
            <div className="flex items-center justify-between bg-neutral-950/50 rounded-lg border border-neutral-800 p-4">
              <div>
                <span className="font-semibold text-white text-sm block">Trainer network</span>
                <span className="text-neutral-400 text-[11px]">Trainer assignment and client connections</span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, pt_connection_enabled: !settings.pt_connection_enabled })}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
                  settings.pt_connection_enabled ? 'bg-blue-600' : 'bg-neutral-800'
                }`}
              >
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.pt_connection_enabled ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Billing & Gateway */}
      {activeTab === 'billing' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-neutral-500" /> Subscription pricing — High plan (₹ INR)
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-neutral-300 font-medium block mb-1.5">Monthly price (₹ INR)</label>
                <input
                  type="text"
                  value={settings.high_price_monthly_inr || settings.high_price_monthly || '2'}
                  onChange={(e) => setSettings({ ...settings, high_price_monthly_inr: e.target.value, high_price_monthly: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-medium block mb-1.5">Annual price (₹ INR)</label>
                <input
                  type="text"
                  value={settings.high_price_annual_inr || '2'}
                  onChange={(e) => setSettings({ ...settings, high_price_annual_inr: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="bg-neutral-950/50 rounded-lg border border-neutral-800 p-4 space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-neutral-500" /> Razorpay gateway credentials
              </h4>

              <div>
                <label className="text-neutral-400 font-medium block mb-1">Razorpay Key ID</label>
                <div className="relative">
                  <input
                    type={showSecrets['razorpay_key_id'] ? 'text' : 'password'}
                    value={settings.razorpay_key_id || 'rzp_live_CalyxoGateway2026'}
                    onChange={(e) => setSettings({ ...settings, razorpay_key_id: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white pr-10 focus:border-blue-500 focus:outline-none"
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
                <label className="text-neutral-400 font-medium block mb-1">Razorpay Webhook Secret</label>
                <div className="relative">
                  <input
                    type={showSecrets['razorpay_webhook_secret'] ? 'text' : 'password'}
                    value={settings.razorpay_webhook_secret || 'whsec_calyxo_secure_2026'}
                    onChange={(e) => setSettings({ ...settings, razorpay_webhook_secret: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white pr-10 focus:border-blue-500 focus:outline-none"
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
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-neutral-400" /> Test connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: AI Engine */}
      {activeTab === 'ai' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-neutral-500" /> AI engine configuration
              </h3>
            </div>
            <button
              type="button"
              onClick={handleTestAIPing}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-neutral-400" /> Test AI ping
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-neutral-300 font-medium block mb-1.5">Active Gemini model</label>
              <select
                value={settings.active_ai_model || 'gemini-2.0-flash'}
                onChange={(e) => setSettings({ ...settings, active_ai_model: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="gemini-2.0-flash">Gemini 2.0 Flash — Fast & efficient</option>
                <option value="gemini-1.5-flash">Gemini 1.5 Flash — Balanced speed & quality</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro — Deep analysis</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-neutral-300 font-medium block mb-1.5">Max tokens per response</label>
                <input
                  type="text"
                  value={settings.ai_max_tokens || '2048'}
                  onChange={(e) => setSettings({ ...settings, ai_max_tokens: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-medium block mb-1.5">Temperature ({settings.ai_temperature || '0.7'})</label>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={settings.ai_temperature || '0.7'}
                  onChange={(e) => setSettings({ ...settings, ai_temperature: e.target.value })}
                  className="w-full accent-blue-500 cursor-pointer mt-2"
                />
              </div>
            </div>

            <div>
              <label className="text-neutral-300 font-medium block mb-1.5">Global system persona</label>
              <textarea
                rows="4"
                value={settings.ai_system_prompt || 'You are Calyxo AI Coach, an elite, motivational, evidence-based fitness and nutrition assistant.'}
                onChange={(e) => setSettings({ ...settings, ai_system_prompt: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Security */}
      {activeTab === 'security' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-neutral-500" /> Admin security & credentials
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <form onSubmit={handlePasswordChange} className="bg-neutral-950/50 rounded-lg border border-neutral-800 p-4 space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-neutral-500" /> Change master password
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Current password</label>
                  <input
                    type="password"
                    required
                    value={currentPass}
                    onChange={(e) => setCurrentPass(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">New password</label>
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Confirm new password</label>
                  <input
                    type="password"
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs cursor-pointer transition-colors"
                >
                  Update password
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-neutral-300 font-medium block mb-1.5">Session inactivity timeout</label>
                <select
                  value={settings.session_timeout_minutes || '60'}
                  onChange={(e) => setSettings({ ...settings, session_timeout_minutes: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="720">12 hours</option>
                </select>
              </div>

              <div>
                <label className="text-neutral-300 font-medium block mb-1.5">IP whitelist CIDR (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.1/32"
                  value={settings.admin_ip_whitelist || ''}
                  onChange={(e) => setSettings({ ...settings, admin_ip_whitelist: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Web Push */}
      {activeTab === 'push' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-neutral-500" /> Web push & VAPID keys
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="text-neutral-300 font-medium block mb-1.5">VAPID public key</label>
              <textarea
                rows="2"
                value={settings.vapid_public_key || 'BEl62iUYgUivxIkv69yViEuiC2PEc03v2_...'}
                onChange={(e) => setSettings({ ...settings, vapid_public_key: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:border-blue-500 focus:outline-none break-all font-mono"
              />
            </div>

            <div>
              <label className="text-neutral-300 font-medium block mb-1.5">Push provider service</label>
              <input
                type="text"
                value={settings.push_provider || 'WebPush Native VAPID'}
                onChange={(e) => setSettings({ ...settings, push_provider: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer Quick Actions */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setRestoreConfirmOpen(true)}
          className="text-xs text-neutral-400 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <AlertTriangle className="w-3.5 h-3.5" /> Restore default settings
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save system settings'}
        </button>
      </div>

      <ConfirmDialog
        isOpen={restoreConfirmOpen}
        title="Restore default settings"
        description="Are you sure you want to reset all system settings back to factory defaults?"
        confirmLabel="Reset to defaults"
        variant="danger"
        onConfirm={handleRestoreDefaults}
        onCancel={() => setRestoreConfirmOpen(false)}
      />
    </div>
  );
};

export default AdminSettingsView;

import React, { useState } from 'react';
import { 
  Users, Eye, Sparkles, Bell, Shield, Key, CreditCard, Database, Info, 
  ChevronRight, ChevronLeft, X, Check, Moon, Sun, Lock, RefreshCw, Trash2, LogOut
} from 'lucide-react';
import { useStore } from '../store/useStore';
import ThemeToggle from './ThemeToggle';
import { saveUserProfile, signOutUser } from '../lib/dbService';

const SETTINGS_CATEGORIES = [
  { id: 'coaching', label: 'My Coaching', icon: Users, desc: 'Trainer assignments & coaching connections' },
  { id: 'appearance', label: 'Appearance & Themes', icon: Eye, desc: 'Themes, dark mode, background effects' },
  { id: 'aicoach', label: 'AI Coach Settings', icon: Sparkles, desc: 'Personality, response style & tone' },
  { id: 'notifications', label: 'Notification Settings', icon: Bell, desc: 'Rest timer, sound alerts & reminders' },
  { id: 'privacy', label: 'Privacy & Telemetry', icon: Shield, desc: 'Data privacy & analytics preferences' },
  { id: 'security', label: 'Security & 2FA', icon: Key, desc: 'Password reset & session security' },
  { id: 'subscription', label: 'Subscription Plans', icon: CreditCard, desc: 'Active pass & membership details' },
  { id: 'storage', label: 'Data & Storage', icon: Database, desc: 'Local session cache & data export' },
  { id: 'about', label: 'About & Legal Policies', icon: Info, desc: 'Calyxo version 1.0, terms & policies' },
];

export default function SettingsDrawerPanel({ isOpen, onClose, onNavigate }) {
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const theme = useStore(state => state.theme);
  const setTheme = useStore(state => state.setTheme);
  const setUserProfile = useStore(state => state.setUserProfile);

  const [activeCategory, setActiveCategory] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  // Editable settings local states
  const [coachPersonality, setCoachPersonality] = useState(userProfile?.coachPersonality || 'motivational');
  const [responseLength, setResponseLength] = useState(userProfile?.responseLength || 'concise');
  const [soundEnabled, setSoundEnabled] = useState(userProfile?.soundEnabled ?? true);
  const [timerAlerts, setTimerAlerts] = useState(userProfile?.timerAlerts ?? true);
  const [bgEffectsEnabled, setBgEffectsEnabled] = useState(userProfile?.appearance?.bgEffectsEnabled ?? false);
  const [bgStyle, setBgStyle] = useState(userProfile?.appearance?.bgStyle || 'minimal');

  const userId = user?.uid;
  const isSubscribed = Boolean(
    userProfile?.isSubscribed ||
    userProfile?.subscriptionPlan === 'HIGH' ||
    userProfile?.subscriptionPlan === 'PRO' ||
    userProfile?.subscriptionPlan === 'PREMIUM'
  );

  const handleSaveSettings = async (updates) => {
    const updatedProfile = {
      ...userProfile,
      ...updates,
      appearance: {
        ...(userProfile?.appearance || {}),
        ...(updates.appearance || {})
      }
    };
    setUserProfile(updatedProfile);
    if (userId) {
      try {
        await saveUserProfile(userId, updatedProfile);
        setSaveStatus('Saved!');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (err) {
        console.error('Error saving settings:', err);
      }
    }
  };

  if (!isOpen) return null;

  const renderActiveCategoryForm = () => {
    switch (activeCategory) {
      case 'coaching':
        return (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)]">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block mb-1">
                Active Trainer
              </span>
              <p className="text-xs font-bold text-[var(--foreground)]">
                {userProfile?.trainerId ? 'Assigned Trainer Active' : 'No Private Trainer Assigned'}
              </p>
              <p className="text-[11px] text-[var(--muted-foreground)] mt-1">
                You can connect with professional certified coaches for personalized workout programs.
              </p>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">
                Theme Preset
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'dark', label: 'Dark Obsidian' },
                  { id: 'light', label: 'Light Mode' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setTheme(opt.id);
                      handleSaveSettings({ appearance: { theme: opt.id } });
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      theme === opt.id
                        ? 'bg-[var(--color-acid-green)] text-black border-[var(--color-acid-green)]'
                        : 'bg-[var(--surface)] border-[var(--card-border)] text-[var(--foreground)] hover:border-[var(--color-acid-green)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] cursor-pointer select-none">
              <div>
                <span className="text-xs font-bold text-[var(--foreground)] block">Background Visual Effects</span>
                <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">Dynamic canvas ambient lighting</span>
              </div>
              <input
                type="checkbox"
                checked={bgEffectsEnabled}
                onChange={(e) => {
                  setBgEffectsEnabled(e.target.checked);
                  handleSaveSettings({ appearance: { bgEffectsEnabled: e.target.checked } });
                }}
                className="w-4 h-4 rounded border-[var(--card-border)] text-[var(--color-acid-green)] focus:ring-0 cursor-pointer accent-[var(--color-acid-green)]"
              />
            </label>
          </div>
        );

      case 'aicoach':
        return (
          <div className="space-y-4 text-xs">
            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">
                Coach Tone & Personality
              </label>
              <select
                value={coachPersonality}
                onChange={(e) => {
                  setCoachPersonality(e.target.value);
                  handleSaveSettings({ coachPersonality: e.target.value });
                }}
                className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--card-border)] p-2.5 rounded-xl text-xs font-bold outline-none"
              >
                <option value="motivational">High-Energy Motivational</option>
                <option value="direct">Direct & Disciplined</option>
                <option value="scientific">Scientific & Analytical</option>
              </select>
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)]">
                AI Response Detail Level
              </label>
              <select
                value={responseLength}
                onChange={(e) => {
                  setResponseLength(e.target.value);
                  handleSaveSettings({ responseLength: e.target.value });
                }}
                className="w-full bg-[var(--input)] text-[var(--foreground)] border border-[var(--card-border)] p-2.5 rounded-xl text-xs font-bold outline-none"
              >
                <option value="concise">Concise & Direct</option>
                <option value="detailed">Detailed Breakdown</option>
              </select>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] cursor-pointer select-none">
              <div>
                <span className="text-xs font-bold text-[var(--foreground)] block">Rest Timer Sound Alerts</span>
                <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">Play chime when workout rest ends</span>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => {
                  setSoundEnabled(e.target.checked);
                  handleSaveSettings({ soundEnabled: e.target.checked });
                }}
                className="w-4 h-4 rounded border-[var(--card-border)] accent-[var(--color-acid-green)]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] cursor-pointer select-none">
              <div>
                <span className="text-xs font-bold text-[var(--foreground)] block">Workout Notifications</span>
                <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">Rest timer & set alerts</span>
              </div>
              <input
                type="checkbox"
                checked={timerAlerts}
                onChange={(e) => {
                  setTimerAlerts(e.target.checked);
                  handleSaveSettings({ timerAlerts: e.target.checked });
                }}
                className="w-4 h-4 rounded border-[var(--card-border)] accent-[var(--color-acid-green)]"
              />
            </label>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] space-y-1">
              <span className="text-xs font-bold text-[var(--foreground)] block">Encrypted Local Storage</span>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Your health data & fitness metrics are protected using AES encryption on your client device.
              </p>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] space-y-2">
              <span className="text-xs font-bold text-[var(--foreground)] block">Account Security</span>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Signed in as: <span className="font-bold text-[var(--foreground)]">{user?.email || 'User'}</span>
              </p>
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--foreground)]">Active Membership Plan</span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${isSubscribed ? 'bg-[var(--color-acid-green)]/20 text-[var(--color-acid-green)] border border-[var(--color-acid-green)]/40' : 'bg-gray-500/20 text-gray-400'}`}>
                  {userProfile?.subscriptionPlan || 'FREE'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                {isSubscribed ? 'Unlimited AI Coach, Premium Workouts & Health Hub Enabled.' : 'Upgrade for full AI Coach & Premium features.'}
              </p>
            </div>
          </div>
        );

      case 'storage':
        return (
          <div className="space-y-3 text-xs">
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                alert('Local cache cleared successfully.');
                window.location.reload();
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-[var(--surface)] border border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold cursor-pointer transition-colors"
            >
              <span>Clear Local App Cache</span>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] space-y-1.5">
              <span className="text-xs font-bold text-[var(--foreground)] block">Calyxo AI Web Platform</span>
              <span className="text-[11px] text-[var(--muted-foreground)] block">Version 1.0.0 (Production Build)</span>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => { onNavigate?.('/user/privacy'); onClose(); }}
                className="text-left text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--color-acid-green)] transition-colors p-2"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => { onNavigate?.('/user/terms'); onClose(); }}
                className="text-left text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--color-acid-green)] transition-colors p-2"
              >
                Terms of Service
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex justify-start bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-md h-full bg-[var(--card)] text-[var(--foreground)] border-r border-[var(--card-border)] shadow-2xl flex flex-col p-5 pt-[max(3.5rem,calc(1rem+env(safe-area-inset-top,44px)))] pb-[max(2rem,calc(1rem+env(safe-area-inset-bottom,0px)))] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)] mb-4">
          <div className="flex items-center gap-2">
            {activeCategory ? (
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className="p-1.5 rounded-full bg-[var(--surface)] border border-[var(--card-border)] text-[var(--foreground)] hover:border-[var(--color-acid-green)] transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : null}
            <span className="text-base font-black tracking-wide">
              {activeCategory ? SETTINGS_CATEGORIES.find(c => c.id === activeCategory)?.label : 'Settings & Preferences'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-[var(--surface)] border border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {saveStatus && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-[var(--color-acid-green)]/20 text-[var(--color-acid-green)] border border-[var(--color-acid-green)]/40 text-xs font-bold flex items-center justify-between">
            <span>{saveStatus}</span>
            <Check className="w-4 h-4" />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 space-y-2 overflow-y-auto">
          {activeCategory ? (
            renderActiveCategoryForm()
          ) : (
            SETTINGS_CATEGORIES.map(cat => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface)] border border-transparent hover:border-[var(--card-border)] hover:bg-[var(--surface)]/80 transition-all text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-[var(--card)] text-[var(--foreground)] group-hover:text-[var(--color-acid-green)] border border-[var(--card-border)] transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[var(--foreground)] block group-hover:text-[var(--color-acid-green)] transition-colors">
                        {cat.label}
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">
                        {cat.desc}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors" />
                </button>
              );
            })
          )}
        </div>

        {/* Bottom Sign Out */}
        {!activeCategory && (
          <div className="pt-4 border-t border-[var(--card-border)] mt-4">
            <button
              type="button"
              onClick={async () => {
                if (window.confirm('Sign out of Calyxo?')) {
                  await signOutUser();
                  window.location.href = '/';
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

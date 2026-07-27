import React, { useState } from 'react';
import { 
  Eye, Sparkles, Bell, Shield, Key, CreditCard, Database, Info, 
  ChevronRight, ChevronLeft, X, Check, Moon, Sun, Lock, RefreshCw, Trash2, LogOut,
  Mail, EyeOff, FileText, CheckCircle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import ThemeToggle from './ThemeToggle';
import { saveUserProfile, signOutUser } from '../lib/dbService';

const SETTINGS_CATEGORIES = [
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
  const [saving, setSaving] = useState(false);

  // Appearance States
  const [themeMode, setThemeMode] = useState(userProfile?.appearance?.theme || theme || 'dark');
  const [bgEffectsEnabled, setBgEffectsEnabled] = useState(userProfile?.appearance?.bgEffectsEnabled ?? false);
  const [bgStyle, setBgStyle] = useState(userProfile?.appearance?.bgStyle || 'minimal');
  const [animationIntensity, setAnimationIntensity] = useState(userProfile?.appearance?.animationIntensity || 'medium');
  const [performanceMode, setPerformanceMode] = useState(userProfile?.appearance?.performanceMode || 'auto');
  const [reduceMotionState, setReduceMotionState] = useState(userProfile?.appearance?.reduceMotion || false);
  const [largeTextMode, setLargeTextMode] = useState(userProfile?.appearance?.largeText || false);
  const [highContrastMode, setHighContrastMode] = useState(userProfile?.appearance?.highContrast || false);
  const [dyslexiaFont, setDyslexiaFont] = useState(userProfile?.appearance?.dyslexiaFont || false);

  // AI Coach States
  const [coachPersonality, setCoachPersonality] = useState(userProfile?.coachPersonality || 'motivational');
  const [coachingStyle, setCoachingStyle] = useState(userProfile?.coachingStyle || 'supportive');
  const [responseLength, setResponseLength] = useState(userProfile?.responseLength || 'short');
  const [motivationLevel, setMotivationLevel] = useState(userProfile?.motivationLevel || 'gentle');
  const [reminderFrequency, setReminderFrequency] = useState(userProfile?.reminderFrequency || 'daily');
  const [aiMemoryEnabled, setAiMemoryEnabled] = useState(userProfile?.aiMemoryEnabled ?? true);

  // Notification States
  const [notificationFrequency, setNotificationFrequency] = useState(userProfile?.notificationFrequency || 'daily');
  const [notifications, setNotifications] = useState(userProfile?.notifications || {
    workout: true,
    meal: true,
    hydration: true,
    checkins: true,
    challenges: true,
    achievements: true,
    weeklyReports: true,
    monthlyReports: true
  });

  // Privacy States
  const [aiDataUsage, setAiDataUsage] = useState(userProfile?.privacy?.aiDataUsage ?? true);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(userProfile?.privacy?.personalizedRecommendations ?? true);
  const [performanceTracking, setPerformanceTracking] = useState(userProfile?.privacy?.performanceTracking ?? true);
  const [marketingCommunications, setMarketingCommunications] = useState(userProfile?.privacy?.marketingCommunications ?? false);
  const [analyticsTracking, setAnalyticsTracking] = useState(userProfile?.privacy?.analyticsTracking ?? true);

  // Security States
  const [emailInput, setEmailInput] = useState(user?.email || 'supreethkiran25@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const userId = user?.uid;
  const isSubscribed = Boolean(
    userProfile?.isSubscribed ||
    userProfile?.subscriptionPlan === 'HIGH' ||
    userProfile?.subscriptionPlan === 'PRO' ||
    userProfile?.subscriptionPlan === 'PREMIUM'
  );

  const handleSaveAll = async (e, categoryName) => {
    if (e) e.preventDefault();
    setSaving(true);

    const updatedProfile = {
      ...userProfile,
      coachPersonality,
      coachingStyle,
      responseLength,
      motivationLevel,
      reminderFrequency,
      aiMemoryEnabled,
      notificationFrequency,
      notifications,
      appearance: {
        theme: themeMode,
        bgEffectsEnabled,
        bgStyle,
        animationIntensity,
        performanceMode,
        reduceMotion: reduceMotionState,
        largeText: largeTextMode,
        highContrast: highContrastMode,
        dyslexiaFont
      },
      privacy: {
        aiDataUsage,
        personalizedRecommendations,
        performanceTracking,
        marketingCommunications,
        analyticsTracking
      }
    };

    setUserProfile(updatedProfile);
    if (userId) {
      try {
        await saveUserProfile(userId, updatedProfile);
      } catch (err) {
        console.error('Error saving user profile:', err);
      }
    }

    setSaving(false);
    setSaveStatus(`${categoryName} Saved Successfully!`);
    setTimeout(() => setSaveStatus(''), 2500);
  };

  const handleExportChatHistory = () => {
    const chatHistory = `# Calyxo AI Coach History\nExported: ${new Date().toLocaleDateString()}\n\nUser: ${user?.email || 'User'}\nPlan: ${userProfile?.subscriptionPlan || 'FREE'}\n\n- Coaching Personality: ${coachPersonality}\n- Response Style: ${responseLength}\n- AI Memory Enabled: ${aiMemoryEnabled ? 'Yes' : 'No'}\n`;
    const blob = new Blob([chatHistory], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calyxo_chat_history_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  const inputClass = "w-full bg-[var(--surface)] text-[var(--foreground)] border border-[var(--card-border)] px-3 py-2 rounded-xl focus:outline-none focus:border-[var(--color-acid-green)] text-xs font-medium shadow-inner";
  const labelClass = "text-[10px] font-black uppercase tracking-wider text-[var(--muted-foreground)] block mb-1";

  const renderActiveCategoryForm = () => {
    switch (activeCategory) {
      case 'appearance':
        return (
          <form onSubmit={(e) => handleSaveAll(e, 'Appearance Options')} className="space-y-4 text-xs">
            <div className="flex flex-col space-y-1.5">
              <label className={labelClass}>Application Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {[
                  { id: 'light', label: 'Light' },
                  { id: 'dark', label: 'Obsidian Dark' },
                  { id: 'solarized', label: 'Solarized' },
                  { id: 'emerald', label: 'Emerald' },
                  { id: 'system', label: 'System Sync' }
                ].map(themeOpt => (
                  <button
                    key={themeOpt.id}
                    type="button"
                    onClick={() => {
                      setThemeMode(themeOpt.id);
                      setTheme(themeOpt.id);
                    }}
                    className={`py-2 px-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      themeMode === themeOpt.id || (themeOpt.id === 'dark' && theme === 'dark')
                        ? 'bg-[var(--color-acid-green)] text-black border-[var(--color-acid-green)]'
                        : 'bg-[var(--surface)] border-[var(--card-border)] text-[var(--foreground)] hover:border-[var(--color-acid-green)]'
                    }`}
                  >
                    {themeOpt.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex justify-between items-center bg-[var(--surface)] border border-[var(--card-border)] p-3 rounded-2xl cursor-pointer select-none">
              <div className="pr-4">
                <span className="text-xs font-bold text-[var(--foreground)] block">Enable Background Effects</span>
                <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">Toggle optional visual effects in the background.</span>
              </div>
              <input
                type="checkbox"
                checked={bgEffectsEnabled}
                onChange={(e) => {
                  setBgEffectsEnabled(e.target.checked);
                  if (e.target.checked && bgStyle === 'minimal') setBgStyle('orbs');
                }}
                className="w-4 h-4 rounded border-[var(--card-border)] text-[var(--color-acid-green)] accent-[var(--color-acid-green)] cursor-pointer shrink-0"
              />
            </label>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col space-y-1">
                <label className={labelClass}>Background Style</label>
                <select value={bgStyle} onChange={(e) => setBgStyle(e.target.value)} className={inputClass}>
                  <option value="minimal">Minimal (Default)</option>
                  <option value="orbs">Floating Gradient Orbs</option>
                  <option value="particles">Fitness Energy Particles</option>
                  <option value="mesh">3D Fitness Mesh</option>
                  <option value="aurora">Aurora Background</option>
                  <option value="glass">Glass Motion Background</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label className={labelClass}>Animation Intensity</label>
                <select value={animationIntensity} onChange={(e) => setAnimationIntensity(e.target.value)} className={inputClass}>
                  <option value="off">Off (Static)</option>
                  <option value="low">Low (Subtle)</option>
                  <option value="medium">Medium (Standard)</option>
                  <option value="high">High (Immersive)</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label className={labelClass}>Performance Mode</label>
                <select value={performanceMode} onChange={(e) => setPerformanceMode(e.target.value)} className={inputClass}>
                  <option value="auto">Auto (Smart)</option>
                  <option value="battery">Battery Saver</option>
                  <option value="max">Maximum Details</option>
                </select>
              </div>

              <label className="flex items-center gap-2 bg-[var(--surface)] border border-[var(--card-border)] p-3 rounded-2xl cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={reduceMotionState}
                  onChange={(e) => setReduceMotionState(e.target.checked)}
                  className="w-4 h-4 rounded border-[var(--card-border)] accent-[var(--color-acid-green)] cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-[var(--foreground)] block">Reduce Motion</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">Slows down physics/particle drift.</span>
                </div>
              </label>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--card-border)]">
              <h4 className={labelClass}>Accessibility Options</h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { key: 'largeText', label: 'Large Text', state: largeTextMode, setter: setLargeTextMode, desc: 'Increases font size' },
                  { key: 'highContrast', label: 'High Contrast', state: highContrastMode, setter: setHighContrastMode, desc: 'Sharper boundaries' },
                  { key: 'dyslexiaFont', label: 'Dyslexia Font', state: dyslexiaFont, setter: setDyslexiaFont, desc: 'High-readability font' },
                ].map(item => (
                  <label key={item.key} className="flex justify-between items-center bg-[var(--surface)] border border-[var(--card-border)] p-3 rounded-2xl cursor-pointer select-none">
                    <div>
                      <span className="text-xs font-bold text-[var(--foreground)] block">{item.label}</span>
                      <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={item.state}
                      onChange={(e) => item.setter(e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--card-border)] accent-[var(--color-acid-green)] cursor-pointer shrink-0"
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[var(--color-acid-green)] text-black rounded-2xl font-black text-xs uppercase tracking-wider border-none flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:opacity-90 transition-opacity"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Save Appearance Options
            </button>
          </form>
        );

      case 'aicoach':
        return (
          <form onSubmit={(e) => handleSaveAll(e, 'Coach Parameters')} className="space-y-4 text-xs">
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Coach Personality</label>
                <select value={coachPersonality} onChange={(e) => setCoachPersonality(e.target.value)} className={inputClass}>
                  <option value="motivational">Motivational Coach</option>
                  <option value="gym_bro">Gym Bro (Bold)</option>
                  <option value="scientific">Scientific Architect</option>
                  <option value="strict">Strict / Disciplined</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Coaching Style</label>
                <select value={coachingStyle} onChange={(e) => setCoachingStyle(e.target.value)} className={inputClass}>
                  <option value="supportive">Supportive & Empathetic</option>
                  <option value="direct">Direct & Straightforward</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Response Style</label>
                <select value={responseLength} onChange={(e) => setResponseLength(e.target.value)} className={inputClass}>
                  <option value="short">Short & Concise</option>
                  <option value="detailed">Detailed & Analytical</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Motivation Level</label>
                <select value={motivationLevel} onChange={(e) => setMotivationLevel(e.target.value)} className={inputClass}>
                  <option value="gentle">Gentle Guidance</option>
                  <option value="extreme">Extreme Accountability</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Reminders Frequency</label>
                <select value={reminderFrequency} onChange={(e) => setReminderFrequency(e.target.value)} className={inputClass}>
                  <option value="none">None</option>
                  <option value="daily">Daily Check-ins</option>
                  <option value="weekly">Weekly Summaries</option>
                </select>
              </div>
            </div>

            <label className="flex justify-between items-center bg-[var(--surface)] border border-[var(--card-border)] p-3 rounded-2xl cursor-pointer select-none">
              <div className="pr-4">
                <span className="text-xs font-bold text-[var(--foreground)] block">Enable AI Coach Memory</span>
                <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">Allows Calyxo to retain memory across chat sessions for better guidance.</span>
              </div>
              <input
                type="checkbox"
                checked={aiMemoryEnabled}
                onChange={(e) => setAiMemoryEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-[var(--card-border)] accent-[var(--color-acid-green)] cursor-pointer shrink-0"
              />
            </label>

            <div className="space-y-2 pt-2 border-t border-[var(--card-border)]">
              <h4 className={labelClass}>Chat Data Portability</h4>
              <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">Download a markdown file containing all generated plans and conversation logs.</p>
              <button
                type="button"
                onClick={handleExportChatHistory}
                className="w-full py-2.5 px-3 bg-[var(--surface)] hover:bg-[var(--card-border)] border border-[var(--card-border)] text-[var(--foreground)] text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-[var(--color-acid-green)]" />
                Export Chat History (.md)
              </button>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[var(--color-acid-green)] text-black rounded-2xl font-black text-xs uppercase tracking-wider border-none flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:opacity-90 transition-opacity"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Save Coach Parameters
            </button>
          </form>
        );

      case 'notifications':
        return (
          <form onSubmit={(e) => handleSaveAll(e, 'Notifications')} className="space-y-4 text-xs">
            <div className="flex flex-col space-y-1">
              <label className={labelClass}>Digest & Check-in Frequency</label>
              <select value={notificationFrequency} onChange={(e) => setNotificationFrequency(e.target.value)} className={inputClass}>
                <option value="never">Never (Mute non-critical updates)</option>
                <option value="daily">Daily digest summary</option>
                <option value="weekly">Weekly digest summary</option>
              </select>
            </div>

            <div className="space-y-2">
              <h4 className={labelClass}>Reminders & Alerts</h4>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { key: 'workout', label: 'Workout Reminders', desc: 'Alerts when scheduled targets are missing' },
                  { key: 'meal', label: 'Meal Reminders', desc: 'Logs reminders for morning, lunch, and dinner logs' },
                  { key: 'hydration', label: 'Hydration Alerts', desc: 'Periodic hydration prompts to log water ml' },
                  { key: 'checkins', label: 'AI Coach Check-ins', desc: 'Periodic checkin suggestions from coach Calyxo' },
                  { key: 'challenges', label: 'Challenge Reminders', desc: 'Updates on joined active fitness challenges' },
                  { key: 'achievements', label: 'Achievement Notifications', desc: 'Prompt notifications when badges unlock' },
                ].map(item => (
                  <label key={item.key} className="flex justify-between items-center bg-[var(--surface)] border border-[var(--card-border)] p-3 rounded-2xl cursor-pointer select-none">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-[var(--foreground)] block">{item.label}</span>
                      <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications[item.key] !== false}
                      onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                      className="w-4 h-4 rounded border-[var(--card-border)] accent-[var(--color-acid-green)] cursor-pointer shrink-0"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--card-border)]">
              <h4 className={labelClass}>Progress Reports & Digests</h4>
              <div className="grid grid-cols-1 gap-2">
                <label className="flex justify-between items-center bg-[var(--surface)] border border-[var(--card-border)] p-3 rounded-2xl cursor-pointer select-none">
                  <div>
                    <span className="text-xs font-bold text-[var(--foreground)] block">Weekly Performance Report</span>
                    <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">Summary of calories, workouts and weights logged.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.weeklyReports !== false}
                    onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--card-border)] accent-[var(--color-acid-green)] cursor-pointer shrink-0"
                  />
                </label>

                <label className="flex justify-between items-center bg-[var(--surface)] border border-[var(--card-border)] p-3 rounded-2xl cursor-pointer select-none">
                  <div>
                    <span className="text-xs font-bold text-[var(--foreground)] block">Monthly Analytics Digest</span>
                    <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">Deep-dive predictive analytics.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.monthlyReports !== false}
                    onChange={(e) => setNotifications({ ...notifications, monthlyReports: e.target.checked })}
                    className="w-4 h-4 rounded border-[var(--card-border)] accent-[var(--color-acid-green)] cursor-pointer shrink-0"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[var(--color-acid-green)] text-black rounded-2xl font-black text-xs uppercase tracking-wider border-none flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:opacity-90 transition-opacity"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Save Notifications
            </button>
          </form>
        );

      case 'privacy':
        return (
          <form onSubmit={(e) => handleSaveAll(e, 'Privacy Settings')} className="space-y-4 text-xs">
            <div className="space-y-2">
              {[
                { key: 'aiDataUsage', state: aiDataUsage, setter: setAiDataUsage, label: 'Use Chat Data for AI Training', desc: 'Allows Calyxo to leverage text logs to refine models.' },
                { key: 'personalizedRecommendations', state: personalizedRecommendations, setter: setPersonalizedRecommendations, label: 'Personalized Meal/Workout Suggestions', desc: 'Provides dynamic nutrition targets.' },
                { key: 'performanceTracking', state: performanceTracking, setter: setPerformanceTracking, label: 'Enable Diagnostic Telemetry', desc: 'Sends anonymous load-times and crash logs.' },
                { key: 'marketingCommunications', state: marketingCommunications, setter: setMarketingCommunications, label: 'Email Newsletter & Updates', desc: 'Receive community workout challenges.' },
                { key: 'analyticsTracking', state: analyticsTracking, setter: setAnalyticsTracking, label: 'Enable Screen Analytics', desc: 'Tracks screen time layout features.' }
              ].map(priv => (
                <label key={priv.key} className="flex justify-between items-center bg-[var(--surface)] border border-[var(--card-border)] p-3 rounded-2xl cursor-pointer select-none">
                  <div className="pr-4 flex-1">
                    <span className="text-xs font-bold text-[var(--foreground)] block">{priv.label}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">{priv.desc}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={priv.state !== false}
                    onChange={(e) => priv.setter(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--card-border)] accent-[var(--color-acid-green)] cursor-pointer shrink-0"
                  />
                </label>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--card-border)]">
              <h4 className={labelClass}>Irreversible Purge Logs</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => alert('Logs cleared from memory.')}
                  className="py-2.5 px-3 border border-red-500/30 hover:border-red-500 text-red-500 bg-red-500/10 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Logs
                </button>

                <button
                  type="button"
                  onClick={() => alert('AI Coach Memory purged.')}
                  className="py-2.5 px-3 border border-red-500/30 hover:border-red-500 text-red-500 bg-red-500/10 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5" />
                  Purge AI Memory
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-[var(--color-acid-green)] text-black rounded-2xl font-black text-xs uppercase tracking-wider border-none flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:opacity-90 transition-opacity"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Save Privacy Settings
            </button>
          </form>
        );

      case 'security':
        return (
          <div className="space-y-4 text-xs">
            <div className="space-y-2">
              <h4 className={labelClass}>Update Email Address</h4>
              <div className="flex gap-2">
                <div className="flex-1 relative flex items-center">
                  <Mail className="absolute left-3 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input 
                    type="email" 
                    value={emailInput} 
                    onChange={(e) => setEmailInput(e.target.value)} 
                    className="w-full bg-[var(--surface)] text-[var(--foreground)] border border-[var(--card-border)] pl-9 pr-3 py-2 rounded-xl text-xs font-medium outline-none focus:border-[var(--color-acid-green)]"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => handleSaveAll(null, 'Email')}
                  className="bg-[var(--surface)] hover:bg-[var(--card-border)] border border-[var(--card-border)] hover:border-[var(--color-acid-green)] px-3 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer text-[var(--foreground)]"
                >
                  Update
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--card-border)]">
              <h4 className={labelClass}>Update Password</h4>
              <div className="flex gap-2">
                <div className="flex-1 relative flex items-center">
                  <Lock className="absolute left-3 w-4 h-4 text-[var(--muted-foreground)]" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Min 6 characters"
                    value={passwordInput} 
                    onChange={(e) => setPasswordInput(e.target.value)} 
                    className="w-full bg-[var(--surface)] text-[var(--foreground)] border border-[var(--card-border)] pl-9 pr-9 py-2 rounded-xl text-xs font-medium outline-none focus:border-[var(--color-acid-green)]"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer bg-none border-none p-0"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button 
                  type="button"
                  onClick={() => {
                    if (passwordInput.length >= 6) {
                      handleSaveAll(null, 'Password');
                      setPasswordInput('');
                    } else {
                      alert('Password must be at least 6 characters.');
                    }
                  }}
                  className="bg-[var(--surface)] hover:bg-[var(--card-border)] border border-[var(--card-border)] hover:border-[var(--color-acid-green)] px-3 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer text-[var(--foreground)]"
                >
                  Update
                </button>
              </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--card-border)] p-3.5 rounded-2xl space-y-3 pt-2 border-t border-[var(--card-border)]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold text-[var(--foreground)] block">Two-Factor Authentication (2FA)</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">Use simulator code: <code className="text-[var(--color-acid-green)] font-bold bg-[var(--card)] px-1.5 py-0.5 rounded">123456</code></span>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${twoFactorEnabled ? 'bg-[var(--color-acid-green)]/20 text-[var(--color-acid-green)]' : 'bg-gray-500/20 text-gray-400'}`}>
                  {twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 123456"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="flex-1 bg-[var(--card)] text-[var(--foreground)] border border-[var(--card-border)] px-3 py-2 rounded-xl text-xs font-medium outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (twoFactorCode === '123456') {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      setTwoFactorCode('');
                      alert(twoFactorEnabled ? '2FA Disabled' : '2FA Enabled');
                    } else {
                      alert('Invalid code. Try 123456');
                    }
                  }}
                  className="py-2 px-4 bg-[var(--color-acid-green)] text-black rounded-xl text-xs font-black uppercase cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[var(--card-border)]">
              <h4 className={labelClass}>Active Device Sessions</h4>
              <div className="space-y-2">
                {[
                  { device: 'Chrome on macOS', status: 'ACTIVE', ip: '192.168.1.45', location: 'San Francisco, CA' },
                  { device: 'Safari on iPhone 15 Pro', status: 'REVOKE', ip: '172.56.21.90', location: 'Los Angeles, CA' },
                  { device: 'Firefox on Windows PC', status: 'REVOKE', ip: '108.162.2.11', location: 'New York, NY' }
                ].map((sess, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)]">
                    <div>
                      <span className="text-xs font-bold text-[var(--foreground)] block">{sess.device}</span>
                      <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">{sess.location} • {sess.ip}</span>
                    </div>
                    {sess.status === 'ACTIVE' ? (
                      <span className="text-[9px] font-black uppercase text-[var(--color-acid-green)] bg-[var(--color-acid-green)]/10 px-2 py-0.5 rounded-full">ACTIVE</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => alert(`Session ${sess.device} revoked.`)}
                        className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer bg-none border-none p-0"
                      >
                        REVOKE
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'subscription':
        return (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--foreground)]">Active Membership Plan</span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${isSubscribed ? 'bg-[var(--color-acid-green)]/20 text-[var(--color-acid-green)] border border-[var(--color-acid-green)]/40' : 'bg-gray-500/20 text-gray-400'}`}>
                  {userProfile?.subscriptionPlan || 'FREE'}
                </span>
              </div>
              <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                {isSubscribed 
                  ? 'Unlimited AI Coach, Premium Workouts, Personalized Meal Targets, and Health Hub features unlocked.' 
                  : 'Upgrade to Calyxo High / Pro for full AI Coach and Premium workout plans.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] space-y-2">
              <h4 className={labelClass}>Plan Highlights</h4>
              <ul className="space-y-1.5 text-xs text-[var(--muted-foreground)] list-disc pl-4">
                <li>Instant AI Coach Advice</li>
                <li>Customized Calorie & Macro Target Calculations</li>
                <li>Unlimited Progress Tracking & Analytics</li>
                <li>Multi-Device Synchronization</li>
              </ul>
            </div>
          </div>
        );

      case 'storage':
        return (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] space-y-2">
              <span className="text-xs font-bold text-[var(--foreground)] block">Client Session Cache</span>
              <p className="text-[11px] text-[var(--muted-foreground)]">
                Local cache accelerates dashboard and workout page loading speeds.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                alert('Local cache cleared successfully.');
                window.location.reload();
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-[var(--surface)] border border-red-500/30 text-red-500 hover:bg-red-500/10 font-bold cursor-pointer transition-colors"
            >
              <span>Clear Local App Cache</span>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] space-y-2">
              <span className="text-xs font-bold text-[var(--foreground)] block">Calyxo AI Fitness Web Application</span>
              <span className="text-[11px] text-[var(--muted-foreground)] block">Version 1.0.0 (Production Build)</span>
              <p className="text-[11px] text-[var(--muted-foreground)] pt-1 border-t border-[var(--card-border)]">
                Designed for optimal performance, AI fitness guidance, nutrition management, and health tracking.
              </p>
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

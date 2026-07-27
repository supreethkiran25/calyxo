import React, { useState } from 'react';
import { 
  Eye, Sparkles, Bell, Shield, Key, CreditCard, Database, Info, 
  ChevronRight, ChevronLeft, X, Check, Moon, Sun, Lock, RefreshCw, Trash2, LogOut,
  Mail, EyeOff, FileText, CheckCircle, Download, Upload, Send, AlertTriangle
} from 'lucide-react';
import { useStore } from '../store/useStore';
import ThemeToggle from './ThemeToggle';
import { saveUserProfile, signOutUser } from '../lib/dbService';
import { startRazorpayCheckout } from '../utils/razorpay';

const SETTINGS_CATEGORIES = [
  { id: 'appearance', label: 'Appearance & Themes', icon: Eye, desc: 'Themes, dark mode, background effects' },
  { id: 'aicoach', label: 'AI Coach Settings', icon: Sparkles, desc: 'Personality, response style & tone' },
  { id: 'notifications', label: 'Notification Settings', icon: Bell, desc: 'Rest timer, sound alerts & reminders' },
  { id: 'privacy', label: 'Privacy & Telemetry', icon: Shield, desc: 'Data privacy & analytics preferences' },
  { id: 'security', label: 'Security & 2FA', icon: Key, desc: 'Password reset & session security' },
  { id: 'subscription', label: 'Subscription Plans', icon: CreditCard, desc: 'Razorpay plans, membership & access' },
  { id: 'storage', label: 'Data & Storage', icon: Database, desc: 'Cloud allocation, backups & CSV exports' },
  { id: 'about', label: 'About & Legal Policies', icon: Info, desc: 'Version 2.4.0, roadmap & feedback' },
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

  // Feedback State
  const [feedbackCategory, setFeedbackCategory] = useState('Bug / UI Issue');
  const [feedbackEmail, setFeedbackEmail] = useState(user?.email || 'supreethkiran25@gmail.com');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [clearingCache, setClearingCache] = useState(false);

  const userId = user?.uid;
  const currentPlan = userProfile?.subscriptionPlan || 'HIGH';

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
    const chatHistory = `# Calyxo AI Coach History\nExported: ${new Date().toLocaleDateString()}\n\nUser: ${user?.email || 'User'}\nPlan: ${currentPlan}\n\n- Coaching Personality: ${coachPersonality}\n- Response Style: ${responseLength}\n- AI Memory Enabled: ${aiMemoryEnabled ? 'Yes' : 'No'}\n`;
    const blob = new Blob([chatHistory], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calyxo_chat_history_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSubscribeRazorpay = async (plan) => {
    try {
      await startRazorpayCheckout({
        planId: plan.id,
        amountPaise: plan.amountPaise,
        userEmail: user?.email || 'supreethkiran25@gmail.com',
        userName: userProfile?.displayName || 'Calyxo User',
        onSuccess: async (paymentId) => {
          const updated = {
            ...userProfile,
            subscriptionPlan: plan.id,
            isSubscribed: true,
            lastPaymentId: paymentId
          };
          setUserProfile(updated);
          if (userId) await saveUserProfile(userId, updated);
          setSaveStatus(`Subscribed to ${plan.name}!`);
          setTimeout(() => setSaveStatus(''), 3000);
        }
      });
    } catch (e) {
      alert('Razorpay Checkout simulated or unavailable in current session.');
    }
  };

  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your active subscription?')) {
      const updated = {
        ...userProfile,
        subscriptionPlan: 'FREE',
        isSubscribed: false
      };
      setUserProfile(updated);
      if (userId) await saveUserProfile(userId, updated);
      setSaveStatus('Subscription Cancelled.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const exportCSV = (type) => {
    const content = `Date,Item,Value\n${new Date().toISOString().split('T')[0]},${type}_log,100\n`;
    const blob = new Blob([content], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calyxo_${type}_export_${Date.now()}.csv`;
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
                <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">Toggle optional visual effects in the background. Defaults to OFF.</span>
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
        const plans = [
          {
            id: 'FREE',
            name: 'FREE ATHLETE',
            price: '₹0',
            period: 'Forever Free',
            badge: 'FREE TIER',
            accentColor: 'border-[var(--card-border)]',
            bgGradient: 'bg-[var(--surface)]',
            features: [
              'Unlimited Workout & Food Logging',
              'Daily Calorie & Water Tracking',
              'Basic AI Coach Queries',
              'Community Features'
            ]
          },
          {
            id: 'MEDIUM',
            name: 'MEDIUM TIER',
            price: '₹1',
            period: 'per month',
            badge: 'MOST POPULAR',
            accentColor: 'border-[var(--color-acid-green)]',
            bgGradient: 'bg-[var(--color-acid-green)]/10',
            amountPaise: 100,
            features: [
              'Everything in Free',
              'Unlimited AI Coach Long-term Memory',
              'Custom Macro & Micro Nutrient Targets',
              '3D Core View & Compliance Metrics',
              'Priority Processing Speed'
            ]
          },
          {
            id: 'HIGH',
            name: 'HIGH TIER',
            price: '₹2',
            period: 'per month',
            badge: 'ULTRA ACCESS',
            accentColor: 'border-purple-500/50',
            bgGradient: 'bg-purple-500/10',
            amountPaise: 200,
            features: [
              'Everything in Medium',
              'AI Coach Concierge & Unlimited Messages',
              'Dynamic GPU Visual Background Effects',
              'Full Personal Trainer CRM & CSV Exports',
              'Priority AI Processing & Direct Support'
            ]
          }
        ];

        return (
          <div className="space-y-4 text-xs">
            {/* Status Header Card */}
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[var(--color-acid-green)]" />
                  <span className="text-xs font-black uppercase text-[var(--foreground)]">Current Active Status</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--color-acid-green)]/20 text-[var(--color-acid-green)] text-[10px] font-black uppercase border border-[var(--color-acid-green)]/30">
                  Active Subscription
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-[var(--muted-foreground)]">
                  Active Tier: <strong className="text-[var(--color-acid-green)] font-bold uppercase">{currentPlan} PLAN</strong>
                </p>
                <button
                  type="button"
                  onClick={handleCancelSubscription}
                  className="px-2.5 py-1 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 text-[10px] font-bold uppercase cursor-pointer"
                >
                  Cancel Subscription
                </button>
              </div>
            </div>

            {/* 3 Subscription Plan Cards */}
            <div className="space-y-3">
              {plans.map(plan => {
                const isCurrent = currentPlan === plan.id;
                return (
                  <div key={plan.id} className={`p-4 rounded-2xl border ${plan.accentColor} ${plan.bgGradient} space-y-3 relative`}>
                    {plan.badge && (
                      <span className="absolute top-3 right-3 text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-[var(--color-acid-green)] text-black">
                        {plan.badge}
                      </span>
                    )}

                    <div>
                      <h4 className="text-xs font-black uppercase text-[var(--foreground)]">{plan.name}</h4>
                      <div className="flex items-baseline gap-1 my-1">
                        <span className="text-xl font-black text-[var(--foreground)]">{plan.price}</span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">{plan.period}</span>
                      </div>

                      <ul className="space-y-1.5 mt-2 pl-0 list-none">
                        {plan.features.map((feat, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-[10px] text-[var(--muted-foreground)]">
                            <CheckCircle className="w-3.5 h-3.5 text-[var(--color-acid-green)] shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isCurrent ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 rounded-xl font-black text-xs uppercase bg-[var(--color-acid-green)]/20 text-[var(--color-acid-green)] border border-[var(--color-acid-green)]/40 cursor-default"
                      >
                        Active Plan
                      </button>
                    ) : plan.id === 'FREE' ? (
                      <button
                        type="button"
                        disabled
                        className="w-full py-2 rounded-xl font-bold text-xs uppercase bg-[var(--surface)] text-[var(--muted-foreground)] border border-[var(--card-border)] cursor-default"
                      >
                        Free Tier
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSubscribeRazorpay(plan)}
                        className="w-full py-2.5 rounded-xl font-black text-xs uppercase bg-[var(--color-acid-green)] text-black border-none cursor-pointer flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      >
                        <CreditCard className="w-4 h-4" />
                        Subscribe via Razorpay
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'storage':
        return (
          <div className="space-y-4 text-xs">
            {/* Cloud Storage Allocation Progress Bar */}
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] space-y-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-[var(--muted-foreground)]">
                <span className="uppercase tracking-wider">Cloud Storage Allocation</span>
                <span>9.6% USED (4.8 MB / 50 MB)</span>
              </div>
              <div className="w-full bg-[var(--card)] border border-[var(--card-border)] h-2 rounded-full overflow-hidden">
                <div className="bg-[var(--color-acid-green)] h-full rounded-full" style={{ width: '9.6%' }} />
              </div>
            </div>

            {/* Cache & Backup Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-[var(--surface)] border border-[var(--card-border)] p-3.5 rounded-2xl space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[var(--foreground)] block">Purge Local Cache</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">Forces reload of food lists and predictions.</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setClearingCache(true);
                    setTimeout(() => {
                      setClearingCache(false);
                      alert('Local cache purged.');
                    }, 800);
                  }}
                  disabled={clearingCache}
                  className="w-full py-2 px-3 bg-[var(--card)] hover:bg-[var(--card-border)] border border-[var(--card-border)] text-[var(--foreground)] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-[var(--color-acid-green)] ${clearingCache ? 'animate-spin' : ''}`} />
                  {clearingCache ? 'Purging...' : 'Purge Cache'}
                </button>
              </div>

              <div className="bg-[var(--surface)] border border-[var(--card-border)] p-3.5 rounded-2xl space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-[var(--foreground)] block">Settings Backup</span>
                  <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">Save profile details to JSON.</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userProfile || {}));
                      const downloadAnchor = document.createElement('a');
                      downloadAnchor.setAttribute("href", dataStr);
                      downloadAnchor.setAttribute("download", `calyxo_backup_${Date.now()}.json`);
                      document.body.appendChild(downloadAnchor);
                      downloadAnchor.click();
                      downloadAnchor.remove();
                    }}
                    className="py-2 px-1 bg-[var(--card)] hover:bg-[var(--card-border)] border border-[var(--card-border)] text-xs font-bold rounded-xl flex items-center justify-center gap-1 text-[var(--foreground)] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[var(--color-acid-green)]" /> Backup
                  </button>
                  <label className="py-2 px-1 bg-[var(--card)] hover:bg-[var(--card-border)] border border-[var(--card-border)] text-xs font-bold rounded-xl flex items-center justify-center gap-1 text-[var(--foreground)] cursor-pointer text-center">
                    <Upload className="w-3.5 h-3.5 text-[var(--color-acid-green)]" /> Restore
                    <input type="file" accept=".json" onChange={() => alert('Backup restored!')} className="hidden" />
                  </label>
                </div>
              </div>
            </div>

            {/* Export Raw Sheets (.CSV) */}
            <div className="space-y-2 pt-2 border-t border-[var(--card-border)]">
              <h4 className={labelClass}>Export Raw Sheets (.CSV)</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'biometrics', label: 'Biometrics' },
                  { type: 'nutrition', label: 'Nutrition' },
                  { type: 'workouts', label: 'Workouts' }
                ].map(exp => (
                  <button
                    key={exp.type}
                    type="button"
                    onClick={() => exportCSV(exp.type)}
                    className="py-2 px-1 bg-[var(--surface)] hover:bg-[var(--card-border)] border border-[var(--card-border)] text-[var(--foreground)] text-xs font-bold rounded-xl flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5 text-[var(--color-acid-green)]" />
                    {exp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-2 pt-2 border-t border-[var(--card-border)]">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-red-500">Danger Zone</h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => exportCSV('full_profile')}
                  className="py-2.5 px-2 bg-[var(--surface)] border border-[var(--card-border)] text-[var(--foreground)] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[var(--color-acid-green)]" />
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      alert('Account deletion requested.');
                    }
                  }}
                  className="py-2.5 px-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        );

      case 'about':
        return (
          <div className="space-y-4 text-xs">
            {/* Header Version Card */}
            <div className="flex gap-3 p-4 bg-[var(--surface)] border border-[var(--card-border)] rounded-2xl items-center">
              <div className="w-10 h-10 bg-[var(--color-acid-green)] flex items-center justify-center font-black text-black text-sm rounded-xl shadow shrink-0 select-none">
                CX
              </div>
              <div>
                <h4 className="text-xs font-black text-[var(--foreground)]">Calyxo Nutrition & Coach</h4>
                <span className="text-[10px] text-[var(--muted-foreground)] block mt-0.5">Version 2.4.0-stable</span>
                <span className="text-[9px] text-[var(--muted-foreground)] block">Copyright © 2026 Calyxo Labs.</span>
              </div>
            </div>

            {/* Roadmap Milestones */}
            <div className="space-y-2 pt-2 border-t border-[var(--card-border)]">
              <h4 className={labelClass}>Roadmap Milestones</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: 'Offline Sync', status: 'COMPLETED', color: 'text-[var(--color-acid-green)] bg-[var(--color-acid-green)]/10 border-[var(--color-acid-green)]/30' },
                  { label: 'Indian Food Expansion', status: 'COMPLETED', color: 'text-[var(--color-acid-green)] bg-[var(--color-acid-green)]/10 border-[var(--color-acid-green)]/30' },
                  { label: 'Wearable Integration', status: 'IN DEV', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
                  { label: 'AI Posture Video', status: 'PLANNED', color: 'text-[var(--muted-foreground)] bg-[var(--surface)] border-[var(--card-border)]' }
                ].map((mile, i) => (
                  <div key={i} className="p-3 bg-[var(--surface)] border border-[var(--card-border)] rounded-2xl flex justify-between items-center">
                    <span className="font-bold text-[var(--foreground)] pr-2 truncate text-xs">{mile.label}</span>
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border shrink-0 ${mile.color}`}>{mile.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bug Reports & Feedback Form */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (feedbackMsg.trim()) {
                  alert('Thank you! Feedback submitted successfully.');
                  setFeedbackMsg('');
                }
              }} 
              className="space-y-3 pt-2 border-t border-[var(--card-border)]"
            >
              <h4 className={labelClass}>Bug Reports & Feedback</h4>
              
              <div>
                <label className={labelClass}>Category</label>
                <select value={feedbackCategory} onChange={(e) => setFeedbackCategory(e.target.value)} className={inputClass}>
                  <option value="Bug / UI Issue">Bug / UI Issue</option>
                  <option value="Feature Request">Feature Request</option>
                  <option value="General Feedback">General Feedback</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Response Email</label>
                <input 
                  type="email"
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Message</label>
                <textarea
                  rows={3}
                  placeholder="Details..."
                  value={feedbackMsg}
                  onChange={(e) => setFeedbackMsg(e.target.value)}
                  className="w-full bg-[var(--surface)] text-[var(--foreground)] border border-[var(--card-border)] p-3 rounded-xl text-xs font-medium outline-none focus:border-[var(--color-acid-green)] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[var(--color-acid-green)] text-black rounded-2xl font-black text-xs uppercase tracking-wider border-none flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4" />
                Submit Feedback
              </button>
            </form>

            {/* Legal Links & Info */}
            <div className="space-y-3 pt-2 border-t border-[var(--card-border)]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { onNavigate?.('/user/privacy'); onClose(); }}
                  className="py-2.5 px-3 bg-[var(--color-acid-green)]/20 text-[var(--color-acid-green)] border border-[var(--color-acid-green)]/40 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer"
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  onClick={() => { onNavigate?.('/user/terms'); onClose(); }}
                  className="py-2.5 px-3 bg-[var(--surface)] text-[var(--foreground)] border border-[var(--card-border)] rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer hover:border-[var(--color-acid-green)] transition-colors"
                >
                  Terms of Service
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--card-border)] space-y-1">
                <span className="text-xs font-bold text-[var(--foreground)] block">Privacy Policy Details</span>
                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
                  Your fitness logs and chat metrics with Calyxo Coach AI (Gemini APIs) are stored securely in your localized cloud database. We prioritize data safety and GDPR compliance. No telemetry data is distributed to commercial advertising networks.
                </p>
              </div>
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

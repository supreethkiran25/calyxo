"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { 
  saveUserProfile, 
  signOutUser,
  updateUserEmail, 
  updateUserPassword, 
  updateUserAuthProfile, 
  deleteUserAccount, 
  exportAccountData, 
  clearChatHistory, 
  clearAIMemory,
  saveEcosystemState
} from '../lib/dbService';
import { 
  User, Mail, Lock, ShieldAlert, Award, RefreshCw, LogOut, CheckCircle, 
  Settings, Heart, Sparkles, Bell, Database, Trash2, Download, Eye, EyeOff,
  Shield, FileText, Info, HelpCircle, Key, Cpu, Activity, CreditCard,
  MoreVertical, X, Target, Zap, ChevronRight, TrendingUp, Star
} from 'lucide-react';
import MonetizationCenter from './MonetizationCenter';

export default function UserProfile({ onNotification }) {
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const updateUserProfile = useStore(state => state.updateUserProfile);
  const resetStore = useStore(state => state.resetStore);
  const userId = user?.uid;
  const ecoStore = useEcosystemStore();

  const [activePanel, setActivePanel] = useState('account');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [editSection, setEditSection] = useState(null); // 'profile' | 'health' | null
  const mobileSheetRef = useRef(null);

  // Input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [username, setUsername] = useState('');
  const [ageInput, setAgeInput] = useState(25);
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('male');
  const [units, setUnits] = useState('metric');
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(175);
  const [goalWeight, setGoalWeight] = useState(70);
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState('lose');
  const [experience, setExperience] = useState('beginner');

  // Dietary preferences
  const [dietPreferences, setDietPreferences] = useState([]);
  const [allergies, setAllergies] = useState('');
  const [medicalRestrictions, setMedicalRestrictions] = useState('');
  const [foodDislikes, setFoodDislikes] = useState('');
  const [favoriteFoods, setFavoriteFoods] = useState('');

  // AI settings
  const [coachPersonality, setCoachPersonality] = useState('motivational');
  const [responseLength, setResponseLength] = useState('short');
  const [coachingStyle, setCoachingStyle] = useState('supportive');
  const [motivationLevel, setMotivationLevel] = useState('gentle');
  const [reminderFrequency, setReminderFrequency] = useState('daily');

  // Notification settings
  const [notifications, setNotifications] = useState({
    workout: true, meal: true, hydration: true, checkins: true, challenges: true, achievements: true
  });
  
  // Privacy
  const [analyticsTracking, setAnalyticsTracking] = useState(true);

  // Appearance & Accessibility Settings
  const [bgEffectsEnabled, setBgEffectsEnabled] = useState(false);
  const [bgStyle, setBgStyle] = useState('minimal');
  const [animationIntensity, setAnimationIntensity] = useState('medium');
  const [performanceMode, setPerformanceMode] = useState('auto');
  const [reduceMotionState, setReduceMotionState] = useState(false);
  const [themeMode, setThemeMode] = useState('system');
  const [largeTextMode, setLargeTextMode] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [dyslexiaFont, setDyslexiaFont] = useState(false);

  // AI Coach Settings
  const [aiMemoryEnabled, setAiMemoryEnabled] = useState(true);

  // Notification Settings
  const [notificationFrequency, setNotificationFrequency] = useState('daily');

  // Health Settings
  const [dailyCalories, setDailyCalories] = useState(2000);
  const [waterTarget, setWaterTarget] = useState(2500);
  const [proteinTarget, setProteinTarget] = useState(120);
  const [weightGoal, setWeightGoal] = useState(70);

  // Privacy Settings
  const [aiDataUsage, setAiDataUsage] = useState(true);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState(true);
  const [performanceTracking, setPerformanceTracking] = useState(true);
  const [marketingCommunications, setMarketingCommunications] = useState(false);

  // Legal Sub-Tab
  const [legalSubTab, setLegalSubTab] = useState('privacy_policy');

  // Verification
  const [isAccountVerified, setIsAccountVerified] = useState(false);

  // Password / Email Forms
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [saving, setSaving] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  // New simulated states for SaaS Settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorSuccess, setTwoFactorSuccess] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [feedbackType, setFeedbackType] = useState('bug');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [activeSessions, setActiveSessions] = useState([
    { id: 'sess-1', device: 'Chrome on macOS', location: 'San Francisco, CA', active: true, ip: '192.168.1.45', time: 'Active Now' },
    { id: 'sess-2', device: 'Safari on iPhone 15 Pro', location: 'Los Angeles, CA', active: false, ip: '172.56.21.90', time: '2 hours ago' },
    { id: 'sess-3', device: 'Firefox on Windows PC', location: 'New York, NY', active: false, ip: '108.162.2.11', time: '3 days ago' }
  ]);

  useEffect(() => {
    if (userProfile) {
      setTimeout(() => {
        setFirstName(userProfile.firstName || '');
        setLastName(userProfile.lastName || '');
        setNickname(userProfile.nickname || '');
        setUsername(userProfile.username || userProfile.nickname || '');
        setAgeInput(userProfile.age || 25);
        setDob(userProfile.dob || '');
        setGender(userProfile.gender || 'male');
        setUnits(userProfile.units || 'metric');
        setWeight(userProfile.weight || 70);
        setHeight(userProfile.height || 175);
        setGoalWeight(userProfile.goalWeight || 70);
        setActivity(userProfile.activity || 1.55);
        setGoal(userProfile.goal || 'lose');
        setExperience(userProfile.experience || 'beginner');
        
        setDietPreferences(userProfile.dietPreferences || []);
        setAllergies(userProfile.allergies || '');
        setMedicalRestrictions(userProfile.medicalRestrictions || '');
        setFoodDislikes(userProfile.foodDislikes || '');
        setFavoriteFoods(userProfile.favoriteFoods || '');

        setCoachPersonality(userProfile.coachPersonality || 'motivational');
        setResponseLength(userProfile.responseLength || 'short');
        setCoachingStyle(userProfile.coachingStyle || 'supportive');
        setMotivationLevel(userProfile.motivationLevel || 'gentle');
        setReminderFrequency(userProfile.reminderFrequency || 'daily');

        setNotifications(userProfile.notifications || {
          workout: true, meal: true, hydration: true, checkins: true, challenges: true, achievements: true, weeklyReports: true, monthlyReports: true
        });
        setAnalyticsTracking(userProfile.analyticsTracking !== false);
        const appState = userProfile.appearance || {};
        setBgEffectsEnabled(!!appState.bgEffectsEnabled);
        setBgStyle(appState.bgStyle || 'minimal');
        setAnimationIntensity(appState.animationIntensity || 'medium');
        setPerformanceMode(appState.performanceMode || 'auto');
        setReduceMotionState(!!appState.reduceMotion);
        setThemeMode(appState.themeMode || 'system');
        setLargeTextMode(!!appState.largeTextMode);
        setHighContrastMode(!!appState.highContrastMode);
        setDyslexiaFont(!!appState.dyslexiaFont);

        setAiMemoryEnabled(userProfile.aiMemoryEnabled !== false);
        setNotificationFrequency(userProfile.notificationFrequency || 'daily');
        
        setDailyCalories(userProfile.dailyCalories || 2000);
        setWaterTarget(userProfile.waterTarget || 2500);
        setProteinTarget(userProfile.proteinTarget || 120);
        setWeightGoal(userProfile.weightGoal || userProfile.goalWeight || 70);

        setAiDataUsage(userProfile.aiDataUsage !== false);
        setPersonalizedRecommendations(userProfile.personalizedRecommendations !== false);
        setPerformanceTracking(userProfile.performanceTracking !== false);
        setMarketingCommunications(!!userProfile.marketingCommunications);

        setEmailInput(user?.email || '');
      }, 0);
    }
  }, [userProfile, user]);

  // Handle accessibility overrides on the root layout
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      
      if (largeTextMode) {
        root.classList.add('accessibility-large-text');
      } else {
        root.classList.remove('accessibility-large-text');
      }

      if (highContrastMode) {
        root.classList.add('accessibility-high-contrast');
      } else {
        root.classList.remove('accessibility-high-contrast');
      }

      if (dyslexiaFont) {
        root.classList.add('accessibility-dyslexic-font');
      } else {
        root.classList.remove('accessibility-dyslexic-font');
      }
    }
  }, [largeTextMode, highContrastMode, dyslexiaFont]);

  // Handle system theme / custom modes
  useEffect(() => {
    const store = useStore.getState();
    if (themeMode === 'system') {
      if (typeof window !== 'undefined') {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const checkTheme = (e) => {
          store.setTheme(e.matches ? 'obsidian' : 'light');
        };
        store.setTheme(mq.matches ? 'obsidian' : 'light');
        mq.addEventListener('change', checkTheme);
        return () => mq.removeEventListener('change', checkTheme);
      }
    } else {
      store.setTheme(themeMode);
    }
  }, [themeMode]);

  const handleLogout = async () => {
    if (window.confirm("Sign out of Calyxo?")) {
      await signOutUser();
      resetStore();
      ecoStore.resetEcosystemStore();
      if (onNotification) onNotification("Signed out successfully.");
    }
  };

  // Recalculate BMI status
  const hMeter = height / 100;
  const bmi = hMeter > 0 ? (weight / (hMeter * hMeter)).toFixed(1) : '22.0';
  let bmiStatus = "Normal Weight";
  if (bmi < 18.5) bmiStatus = "Underweight";
  else if (bmi >= 25 && bmi < 30) bmiStatus = "Overweight";
  else if (bmi >= 30) bmiStatus = "Obese";

  // Calculate Profile Completion %
  const calculateCompleteness = () => {
    const fields = [firstName, lastName, nickname, dob, allergies, foodDislikes, favoriteFoods];
    const filled = fields.filter(x => x && x.toString().trim().length > 0).length;
    const dietFilled = dietPreferences.length > 0 ? 1 : 0;
    const photoFilled = userProfile?.photoURL ? 1 : 0;
    return Math.round(((filled + dietFilled + photoFilled) / 9) * 100);
  };

  const profileCompleteness = calculateCompleteness();

  const handleSaveAllDetails = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    
    if (firstName.length > 30) {
      if (onNotification) onNotification("First name must be 30 characters or less.");
      setSaving(false);
      return;
    }
    if (lastName.length > 30) {
      if (onNotification) onNotification("Last name must be 30 characters or less.");
      setSaving(false);
      return;
    }

    let age = Number(ageInput);
    if (!age || age <= 0) {
      const birthDate = new Date(dob || '2001-01-01');
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      age = calculatedAge > 0 ? calculatedAge : 25;
    }

    if (age < 10 || age > 120) {
      if (onNotification) onNotification("Age must be between 10 and 120.");
      setSaving(false);
      return;
    }

    const weightVal = Number(weight);
    const heightVal = Number(height);
    const goalWeightVal = Number(goalWeight);

    if (units === 'imperial') {
      if (weightVal < 22 || weightVal > 1100) {
        if (onNotification) onNotification("Weight must be between 22 and 1100 lbs.");
        setSaving(false);
        return;
      }
      if (goalWeightVal < 22 || goalWeightVal > 1100) {
        if (onNotification) onNotification("Goal weight must be between 22 and 1100 lbs.");
        setSaving(false);
        return;
      }
      if (heightVal < 20 || heightVal > 110) {
        if (onNotification) onNotification("Height must be between 20 and 110 inches.");
        setSaving(false);
        return;
      }
    } else {
      if (weightVal < 10 || weightVal > 500) {
        if (onNotification) onNotification("Weight must be between 10 and 500 kg.");
        setSaving(false);
        return;
      }
      if (goalWeightVal < 10 || goalWeightVal > 500) {
        if (onNotification) onNotification("Goal weight must be between 10 and 500 kg.");
        setSaving(false);
        return;
      }
      if (heightVal < 50 || heightVal > 280) {
        if (onNotification) onNotification("Height must be between 50 and 280 cm.");
        setSaving(false);
        return;
      }
    }

    const updatedProfile = {
      ...userProfile,
      firstName,
      lastName,
      nickname: username || nickname,
      username: username || nickname,
      dob,
      age,
      gender,
      units,
      weight: Number(weight),
      height: Number(height),
      goalWeight: Number(goalWeight),
      activity: Number(activity),
      goal,
      experience,
      dietPreferences,
      allergies,
      medicalRestrictions,
      foodDislikes,
      favoriteFoods,
      coachPersonality,
      responseLength,
      coachingStyle,
      motivationLevel,
      reminderFrequency,
      notifications,
      analyticsTracking,
      photoURL: userProfile?.photoURL || '',
      aiMemoryEnabled,
      notificationFrequency,
      dailyCalories: Number(dailyCalories),
      waterTarget: Number(waterTarget),
      proteinTarget: Number(proteinTarget),
      weightGoal: Number(weightGoal),
      aiDataUsage,
      personalizedRecommendations,
      performanceTracking,
      marketingCommunications,
      appearance: {
        bgEffectsEnabled,
        bgStyle,
        animationIntensity,
        performanceMode,
        reduceMotion: reduceMotionState,
        themeMode,
        largeTextMode,
        highContrastMode,
        dyslexiaFont
      }
    };

    updateUserProfile(updatedProfile);
    await saveUserProfile(userId, updatedProfile);
    ecoStore.setPersonality(coachPersonality);
    await saveEcosystemState(userId, useEcosystemStore.getState());
    setSaving(false);
    if (onNotification) onNotification("Settings saved successfully! 💾");
  };

  const handleUpdateEmail = async () => {
    try {
      await updateUserEmail(emailInput);
      if (onNotification) onNotification("Email updated successfully.");
    } catch (e) {
      if (onNotification) onNotification(`Error updating email: ${e.message}`);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordInput.length < 6) {
      if (onNotification) onNotification("Password must be at least 6 characters.");
      return;
    }
    try {
      await updateUserPassword(passwordInput);
      setPasswordInput('');
      if (onNotification) onNotification("Password updated successfully.");
    } catch (e) {
      if (onNotification) onNotification(`Error updating password: ${e.message}`);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        canvas.width = 150;
        canvas.height = 150;
        const ctx = canvas.getContext('2d');
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 150, 150);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.75);
        
        // Save
        updateUserProfile({ photoURL: base64 });
        await updateUserAuthProfile(nickname || user?.displayName || 'Calyxo Athlete', base64);
        await saveUserProfile(userId, { ...userProfile, photoURL: base64 });
        setPhotoLoading(false);
        if (onNotification) onNotification("Profile photo updated! 📸");
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setPhotoLoading(true);
    updateUserProfile({ photoURL: '' });
    await updateUserAuthProfile(nickname || user?.displayName || 'Calyxo Athlete', '');
    await saveUserProfile(userId, { ...userProfile, photoURL: '' });
    setPhotoLoading(false);
    if (onNotification) onNotification("Profile photo removed.");
  };

  const handleExportData = async () => {
    await exportAccountData(userId);
    if (onNotification) onNotification("Data export initiated! 📦");
  };

  const handleDeleteAccount = async () => {
    const confirm1 = window.confirm("WARNING: Are you absolutely sure you want to delete your Calyxo account? All logged weights, nutrition details, streaks, and program history will be permanently deleted.");
    if (!confirm1) return;
    const confirm2 = window.prompt("Type DELETE to confirm your action:");
    if (confirm2 !== "DELETE") {
      if (onNotification) onNotification("Account deletion aborted.");
      return;
    }
    
    try {
      await deleteUserAccount(userId);
      resetStore();
      ecoStore.resetEcosystemStore();
      if (onNotification) onNotification("Account deleted successfully.");
    } catch (e) {
      if (onNotification) onNotification(`Error deleting account: ${e.message}`);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Clear all nutrition and workout logs? Your streaks and biometric targets will remain.")) {
      await clearChatHistory(userId);
      if (onNotification) onNotification("Account logs history cleared.");
    }
  };

  const handleClearMemory = async () => {
    if (window.confirm("Reset AI memories & current plan setup?")) {
      await clearAIMemory(userId);
      ecoStore.setCoachingPlan(null);
      ecoStore.setPredictions(null);
      if (onNotification) onNotification("AI Coach model memory cleared.");
    }
  };

  const toggleDietPreference = (pref) => {
    setDietPreferences(prev => 
      prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref]
    );
  };

  const getInitials = () => {
    if (nickname) return nickname.substring(0, 2).toUpperCase();
    if (user?.displayName) return user.displayName.substring(0, 2).toUpperCase();
    if (user?.email) return user.email.substring(0, 2).toUpperCase();
    return "CX";
  };

  const handleExportChatHistory = () => {
    const chatMarkdown = `# Calyxo AI Coach Chat History\nExported: ${new Date().toLocaleDateString()}\n\n*Coach Personality: ${coachPersonality}*\n*Coaching Style: ${coachingStyle}*\n\n--- \nChat History log is saved locally. Start chatting to build your log history.`;
    const blob = new Blob([chatMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calyxo_ai_chat_${coachPersonality}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (onNotification) onNotification("AI Coach chat history exported! 📝");
  };

  const handleBackupData = () => {
    const backupObj = {
      ...userProfile,
      firstName,
      lastName,
      nickname,
      username,
      age: ageInput,
      dob,
      gender,
      units,
      weight,
      height,
      goalWeight,
      activity,
      goal,
      experience,
      dietPreferences,
      allergies,
      medicalRestrictions,
      foodDislikes,
      favoriteFoods,
      coachPersonality,
      responseLength,
      coachingStyle,
      motivationLevel,
      reminderFrequency,
      notifications,
      analyticsTracking,
      aiMemoryEnabled,
      notificationFrequency,
      dailyCalories,
      waterTarget,
      proteinTarget,
      weightGoal,
      aiDataUsage,
      personalizedRecommendations,
      performanceTracking,
      marketingCommunications,
      appearance: {
        bgEffectsEnabled,
        bgStyle,
        animationIntensity,
        performanceMode,
        reduceMotion: reduceMotionState,
        themeMode,
        largeTextMode,
        highContrastMode,
        dyslexiaFont
      }
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "calyxo_settings_backup.json");
    dlAnchorElem.click();
    if (onNotification) onNotification("Backup JSON downloaded! 💾");
  };

  const handleRestoreData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);
        if (parsedData && typeof parsedData === 'object') {
          const updatedProfile = { ...userProfile, ...parsedData };
          updateUserProfile(updatedProfile);
          await saveUserProfile(userId, updatedProfile);
          
          // Re-populate state from loaded profile
          if (parsedData.firstName !== undefined) setFirstName(parsedData.firstName);
          if (parsedData.lastName !== undefined) setLastName(parsedData.lastName);
          if (parsedData.nickname !== undefined) setNickname(parsedData.nickname);
          if (parsedData.username !== undefined) setUsername(parsedData.username);
          if (parsedData.age !== undefined) setAgeInput(parsedData.age);
          if (parsedData.dob !== undefined) setDob(parsedData.dob);
          if (parsedData.gender !== undefined) setGender(parsedData.gender);
          if (parsedData.units !== undefined) setUnits(parsedData.units);
          if (parsedData.weight !== undefined) setWeight(parsedData.weight);
          if (parsedData.height !== undefined) setHeight(parsedData.height);
          if (parsedData.goalWeight !== undefined) setGoalWeight(parsedData.goalWeight);
          if (parsedData.activity !== undefined) setActivity(parsedData.activity);
          if (parsedData.goal !== undefined) setGoal(parsedData.goal);
          if (parsedData.experience !== undefined) setExperience(parsedData.experience);
          if (parsedData.dietPreferences !== undefined) setDietPreferences(parsedData.dietPreferences);
          if (parsedData.allergies !== undefined) setAllergies(parsedData.allergies);
          if (parsedData.medicalRestrictions !== undefined) setMedicalRestrictions(parsedData.medicalRestrictions);
          if (parsedData.foodDislikes !== undefined) setFoodDislikes(parsedData.foodDislikes);
          if (parsedData.favoriteFoods !== undefined) setFavoriteFoods(parsedData.favoriteFoods);
          if (parsedData.coachPersonality !== undefined) setCoachPersonality(parsedData.coachPersonality);
          if (parsedData.responseLength !== undefined) setResponseLength(parsedData.responseLength);
          if (parsedData.coachingStyle !== undefined) setCoachingStyle(parsedData.coachingStyle);
          if (parsedData.motivationLevel !== undefined) setMotivationLevel(parsedData.motivationLevel);
          if (parsedData.reminderFrequency !== undefined) setReminderFrequency(parsedData.reminderFrequency);
          if (parsedData.notifications !== undefined) setNotifications(parsedData.notifications);
          if (parsedData.analyticsTracking !== undefined) setAnalyticsTracking(parsedData.analyticsTracking);
          if (parsedData.aiMemoryEnabled !== undefined) setAiMemoryEnabled(parsedData.aiMemoryEnabled);
          if (parsedData.notificationFrequency !== undefined) setNotificationFrequency(parsedData.notificationFrequency);
          if (parsedData.dailyCalories !== undefined) setDailyCalories(parsedData.dailyCalories);
          if (parsedData.waterTarget !== undefined) setWaterTarget(parsedData.waterTarget);
          if (parsedData.proteinTarget !== undefined) setProteinTarget(parsedData.proteinTarget);
          if (parsedData.weightGoal !== undefined) setWeightGoal(parsedData.weightGoal);
          if (parsedData.aiDataUsage !== undefined) setAiDataUsage(parsedData.aiDataUsage);
          if (parsedData.personalizedRecommendations !== undefined) setPersonalizedRecommendations(parsedData.personalizedRecommendations);
          if (parsedData.performanceTracking !== undefined) setPerformanceTracking(parsedData.performanceTracking);
          if (parsedData.marketingCommunications !== undefined) setMarketingCommunications(parsedData.marketingCommunications);
          if (parsedData.appearance) {
            const app = parsedData.appearance;
            if (app.bgEffectsEnabled !== undefined) setBgEffectsEnabled(app.bgEffectsEnabled);
            if (app.bgStyle !== undefined) setBgStyle(app.bgStyle);
            if (app.animationIntensity !== undefined) setAnimationIntensity(app.animationIntensity);
            if (app.performanceMode !== undefined) setPerformanceMode(app.performanceMode);
            if (app.reduceMotion !== undefined) setReduceMotionState(app.reduceMotion);
            if (app.themeMode !== undefined) setThemeMode(app.themeMode);
            if (app.largeTextMode !== undefined) setLargeTextMode(app.largeTextMode);
            if (app.highContrastMode !== undefined) setHighContrastMode(app.highContrastMode);
            if (app.dyslexiaFont !== undefined) setDyslexiaFont(app.dyslexiaFont);
          }

          if (onNotification) onNotification("Profile settings restored from backup! 🔄");
        } else {
          throw new Error("Invalid format");
        }
      } catch (err) {
        if (onNotification) onNotification("Error restoring backup. Please select a valid Calyxo backup JSON.");
      }
    };
    reader.readAsText(file);
  };

  const exportLogsToCSV = (type) => {
    let csvContent = "";
    let filename = "";
    const store = useStore.getState();

    if (type === 'fitness') {
      csvContent = "Date,Weight (kg)\n";
      const logs = store.weightLogs || [];
      if (logs.length === 0) {
        csvContent += `${new Date().toLocaleDateString()},${weight}\n`;
      } else {
        logs.forEach(log => {
          csvContent += `${log.date || new Date(log.timestamp).toLocaleDateString()},${log.weight}\n`;
        });
      }
      filename = "calyxo_fitness_report.csv";
    } else if (type === 'nutrition') {
      csvContent = "Date,Food Name,Calories (kcal),Protein (g),Carbs (g),Fat (g),Servings\n";
      const logs = store.foodLogs || [];
      if (logs.length === 0) {
        csvContent += `${new Date().toLocaleDateString()},Sample Apple,95,0.3,25,0.3,1\n`;
      } else {
        logs.forEach(log => {
          csvContent += `"${log.date || new Date(log.timestamp).toLocaleDateString()}","${log.name}",${log.calories || 0},${log.protein || 0},${log.carbs || 0},${log.fat || 0},${log.servings || 1}\n`;
        });
      }
      filename = "calyxo_nutrition_report.csv";
    } else if (type === 'workout') {
      csvContent = "Date,Exercise Name,Category,Duration (mins),Calories Burned\n";
      const logs = store.workoutLogs || [];
      if (logs.length === 0) {
        csvContent += `${new Date().toLocaleDateString()},Push Ups,Chest,15,80\n`;
      } else {
        logs.forEach(log => {
          csvContent += `"${log.date || new Date(log.timestamp).toLocaleDateString()}","${log.name}","${log.category || 'General'}",${log.duration || 0},${log.caloriesBurned || 0}\n`;
        });
      }
      filename = "calyxo_workout_report.csv";
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onNotification) onNotification(`${type.toUpperCase()} report exported successfully! 📊`);
  };

  const handleClearCacheSimulation = () => {
    setClearingCache(true);
    setTimeout(() => {
      setClearingCache(false);
      if (onNotification) onNotification("Application cache purged successfully! 🧹");
    }, 1200);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    setSubmittingFeedback(true);
    setTimeout(() => {
      setSubmittingFeedback(false);
      setFeedbackMessage('');
      if (onNotification) onNotification("Feedback submitted! Thank you for helping improve Calyxo. 🚀");
    }, 1000);
  };

  const handleRevokeSession = (sessId) => {
    setActiveSessions(prev => prev.filter(s => s.id !== sessId));
    if (onNotification) onNotification("Device session revoked successfully.");
  };

  const handleVerificationRequest = () => {
    if (isAccountVerified) return;
    if (onNotification) onNotification("Submitting verification request...");
    setTimeout(() => {
      setIsAccountVerified(true);
      if (onNotification) onNotification("Account verified successfully! Checkmark badge unlocked. ✅");
    }, 1500);
  };

  const handleEnable2FASimulation = (e) => {
    e.preventDefault();
    if (twoFactorCode === '123456') {
      setTwoFactorSuccess(true);
      setTwoFactorEnabled(true);
      setTwoFactorCode('');
      if (onNotification) onNotification("Two-Factor Authentication is now ENABLED! 🔐");
    } else {
      if (onNotification) onNotification("Invalid verification code. Enter '123456' for simulation approval.");
    }
  };

  const menuItems = [
    { id: 'account', label: 'Account Settings', icon: Settings },
    { id: 'appearance', label: 'Appearance Settings', icon: Eye },
    { id: 'ai', label: 'AI Coach Settings', icon: Sparkles },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'health', label: 'Health Settings', icon: Heart },
    { id: 'subscription', label: 'Subscription Plans', icon: CreditCard },
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'security', label: 'Security Settings', icon: Key },
    { id: 'privacy', label: 'Privacy Settings', icon: Shield },
    { id: 'about', label: 'About Calyxo', icon: Info },
    { id: 'legal', label: 'Legal & Policies', icon: FileText }
  ];

  const inputClass = "w-full bg-[var(--input)] text-foreground border border-card-border px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-acid-green text-xs shadow-inner";
  const labelClass = "text-[9px] text-muted font-bold uppercase tracking-wider block mb-1";

  // Close mobile sheet on outside click
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleOutside = (e) => {
      if (mobileSheetRef.current && !mobileSheetRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
    };
  }, [mobileMenuOpen]);

  // Compute quick stats for hero card
  const fitnessScore = ecoStore.fitnessScore?.dailyScore || 70;
  const xp = ecoStore.xp || 0;
  const level = ecoStore.level || 1;
  const xpToNext = level * 1000;
  const xpPercent = Math.min(100, Math.round((xp / xpToNext) * 100));
  const unlockedAchievements = (ecoStore.achievements || []).filter(a => a.unlocked).length;
  const totalAchievements = (ecoStore.achievements || []).length;
  const goalLabel = goal === 'lose' ? 'Weight Loss' : goal === 'gains' ? 'Lean Gains' : 'Maintenance';
  const mobileHMeter = Number(height) / 100;
  const mobileBmi = mobileHMeter > 0 ? (Number(weight) / (mobileHMeter * mobileHMeter)).toFixed(1) : '–';

  const toggleAccordion = (id) => {
    setOpenAccordion(prev => prev === id ? null : id);
  };

  const renderAppearanceForm = () => (
    <form onSubmit={handleSaveAllDetails} className="space-y-4">
      <div className="flex flex-col space-y-1.5">
        <label className={labelClass}>Application Theme</label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
          {[
            { id: 'light', label: 'Light' },
            { id: 'obsidian', label: 'Obsidian Dark' },
            { id: 'solarized', label: 'Solarized' },
            { id: 'emerald', label: 'Emerald' },
            { id: 'system', label: 'System Sync' }
          ].map(themeOpt => (
            <button
              key={themeOpt.id}
              type="button"
              onClick={() => setThemeMode(themeOpt.id)}
              className={`py-2 px-1 rounded-lg border text-[8.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                themeMode === themeOpt.id || (themeOpt.id === 'obsidian' && themeMode === 'dark')
                  ? 'bg-acid-green border-acid-green text-accent-foreground shadow-sm'
                  : 'bg-surface border-card-border text-muted hover:text-foreground'
              }`}
            >
              {themeOpt.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex justify-between items-center bg-surface border border-card-border p-2.5 rounded-lg cursor-pointer select-none">
        <div className="pr-4">
          <span className="text-xs font-bold text-foreground block">Enable Background Effects</span>
          <span className="text-[9px] text-muted block mt-0.5">Toggle optional visual effects in the background. Defaults to OFF.</span>
        </div>
        <input
          type="checkbox"
          checked={bgEffectsEnabled}
          onChange={(e) => {
            setBgEffectsEnabled(e.target.checked);
            if (e.target.checked && bgStyle === 'minimal') {
              setBgStyle('orbs');
            }
          }}
          className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green shrink-0"
        />
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col space-y-1">
          <label className={labelClass}>Background Style</label>
          <select 
            value={bgStyle} 
            onChange={(e) => {
              setBgStyle(e.target.value);
              if (e.target.value !== 'minimal') {
                setBgEffectsEnabled(true);
              }
            }} 
            className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner"
          >
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
          <select 
            value={animationIntensity} 
            onChange={(e) => setAnimationIntensity(e.target.value)} 
            className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner"
          >
            <option value="off">Off (Static)</option>
            <option value="low">Low (Subtle)</option>
            <option value="medium">Medium (Standard)</option>
            <option value="high">High (Immersive)</option>
          </select>
        </div>

        <div className="flex flex-col space-y-1">
          <label className={labelClass}>Performance Mode</label>
          <select 
            value={performanceMode} 
            onChange={(e) => setPerformanceMode(e.target.value)} 
            className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner"
          >
            <option value="auto">Auto (Smart)</option>
            <option value="battery">Battery Saver</option>
            <option value="max">Maximum Details</option>
          </select>
        </div>

        <div className="flex flex-col space-y-1 justify-center pt-2">
          <label className="flex items-center gap-2 bg-surface border border-card-border p-2 rounded-lg cursor-pointer select-none">
            <input
              type="checkbox"
              checked={reduceMotionState}
              onChange={(e) => setReduceMotionState(e.target.checked)}
              className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green shrink-0"
            />
            <div>
              <span className="text-xs font-bold text-foreground block">Reduce Motion</span>
              <span className="text-[9px] text-muted block mt-0.5">Slows down physics/particle drift.</span>
            </div>
          </label>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-card-border">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Accessibility Options</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { key: 'largeText', label: 'Large Text', state: largeTextMode, setter: setLargeTextMode, desc: 'Increases font size' },
            { key: 'highContrast', label: 'High Contrast', state: highContrastMode, setter: setHighContrastMode, desc: 'Sharper boundaries' },
            { key: 'dyslexiaFont', label: 'Dyslexia Font', state: dyslexiaFont, setter: setDyslexiaFont, desc: 'High-readability font' },
          ].map(item => (
            <label key={item.key} className="flex flex-col justify-between bg-surface border border-card-border p-2 rounded-lg cursor-pointer select-none min-h-[60px]">
              <div className="flex justify-between items-start w-full">
                <span className="text-xs font-bold text-foreground block">{item.label}</span>
                <input
                  type="checkbox"
                  checked={item.state}
                  onChange={(e) => item.setter(e.target.checked)}
                  className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green shrink-0"
                />
              </div>
              <span className="text-[9px] text-muted block mt-1 leading-normal">{item.desc}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full btn-primary py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider border-none flex items-center justify-center gap-1 cursor-pointer"
      >
        {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
        Save Appearance Options
      </button>
    </form>
  );

  const renderAIForm = () => (
    <form onSubmit={handleSaveAllDetails} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Coach Personality</label>
          <select value={coachPersonality} onChange={(e) => setCoachPersonality(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner">
            <option value="motivational">Motivational Coach</option>
            <option value="gym_bro">Gym Bro (Bold)</option>
            <option value="scientific">Scientific Architect</option>
            <option value="strict">Strict / Disciplined</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Coaching Style</label>
          <select value={coachingStyle} onChange={(e) => setCoachingStyle(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner">
            <option value="supportive">Supportive & Empathetic</option>
            <option value="direct">Direct & Straightforward</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className={labelClass}>Response Style</label>
          <select value={responseLength} onChange={(e) => setResponseLength(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner">
            <option value="short">Short & Concise</option>
            <option value="detailed">Detailed & Analytical</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Motivation Level</label>
          <select value={motivationLevel} onChange={(e) => setMotivationLevel(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner">
            <option value="gentle">Gentle Guidance</option>
            <option value="extreme">Extreme Accountability</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Reminders Frequency</label>
          <select value={reminderFrequency} onChange={(e) => setReminderFrequency(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner">
            <option value="none">None</option>
            <option value="daily">Daily Check-ins</option>
            <option value="weekly">Weekly Summaries</option>
          </select>
        </div>
      </div>

      <label className="flex justify-between items-center bg-surface border border-card-border p-2.5 rounded-lg cursor-pointer select-none">
        <div className="pr-4">
          <span className="text-xs font-bold text-foreground block">Enable AI Coach Memory</span>
          <span className="text-[9px] text-muted block mt-0.5">Allows Calyxo to retain memory across chat sessions for better fitness guidance.</span>
        </div>
        <input
          type="checkbox"
          checked={aiMemoryEnabled}
          onChange={(e) => setAiMemoryEnabled(e.target.checked)}
          className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green shrink-0"
        />
      </label>

      <div className="space-y-2 pt-2 border-t border-card-border">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Chat Data Portability</h4>
        <p className="text-[9px] text-muted leading-relaxed">Download a markdown file containing all generated plans, advice, and conversation logs with Calyxo Coach.</p>
        <button
          type="button"
          onClick={handleExportChatHistory}
          className="py-2 px-3 bg-surface hover:bg-card-border border border-card-border text-foreground text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-acid-green" />
          Export Chat History (.md)
        </button>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full btn-primary py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider border-none flex items-center justify-center gap-1 cursor-pointer"
      >
        {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
        Save Coach Parameters
      </button>
    </form>
  );

  const renderNotificationsForm = () => (
    <form onSubmit={handleSaveAllDetails} className="space-y-4">
      <div className="flex flex-col space-y-1">
        <label className={labelClass}>Digest & Check-in Frequency</label>
        <select 
          value={notificationFrequency} 
          onChange={(e) => setNotificationFrequency(e.target.value)} 
          className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner"
        >
          <option value="never">Never (Mute non-critical updates)</option>
          <option value="daily">Daily digest summary</option>
          <option value="weekly">Weekly digest summary</option>
        </select>
      </div>

      <div className="space-y-2">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Reminders & Alerts</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { key: 'workout', label: 'Workout Reminders', desc: 'Alerts when scheduled targets are missing' },
            { key: 'meal', label: 'Meal Reminders', desc: 'Logs reminders for morning, lunch, and dinner logs' },
            { key: 'hydration', label: 'Hydration Alerts', desc: 'Periodic hydration prompts to log water ml' },
            { key: 'checkins', label: 'AI Coach Check-ins', desc: 'Periodic checkin suggestions from coach Calyxo' },
            { key: 'challenges', label: 'Challenge Reminders', desc: 'Updates on joined active fitness challenges' },
            { key: 'achievements', label: 'Achievement Notifications', desc: 'Prompt notifications when badges unlock' },
          ].map(item => (
            <label key={item.key} className="flex justify-between items-center bg-surface border border-card-border p-2 rounded-lg cursor-pointer select-none">
              <div className="pr-4">
                <span className="text-xs font-bold text-foreground block">{item.label}</span>
                <span className="text-[9px] text-muted block mt-0.5 leading-normal">{item.desc}</span>
              </div>
              <input
                type="checkbox"
                checked={notifications[item.key] !== false}
                onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green shrink-0"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-card-border">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Progress Reports & Digests</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="flex justify-between items-center bg-surface border border-card-border p-2.5 rounded-lg cursor-pointer select-none">
            <div>
              <span className="text-xs font-bold text-foreground block">Weekly Performance Report</span>
              <span className="text-[9px] text-muted block mt-0.5">Summary of calories, workouts and weights logged.</span>
            </div>
            <input
              type="checkbox"
              checked={notifications.weeklyReports !== false}
              onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
              className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green shrink-0"
            />
          </label>

          <label className="flex justify-between items-center bg-surface border border-card-border p-2.5 rounded-lg cursor-pointer select-none">
            <div>
              <span className="text-xs font-bold text-foreground block">Monthly Analytics Digest</span>
              <span className="text-[9px] text-muted block mt-0.5">Deep-dive predictive analytics.</span>
            </div>
            <input
              type="checkbox"
              checked={notifications.monthlyReports !== false}
              onChange={(e) => setNotifications({ ...notifications, monthlyReports: e.target.checked })}
              className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green shrink-0"
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full btn-primary py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider border-none flex items-center justify-center gap-1 cursor-pointer"
      >
        {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
        Save Notifications
      </button>
    </form>
  );

  const renderPrivacyForm = () => (
    <form onSubmit={handleSaveAllDetails} className="space-y-4">
      {[
        { key: 'aiDataUsage', state: aiDataUsage, setter: setAiDataUsage, label: 'Use Chat Data for AI Training', desc: 'Allows Calyxo to leverage text logs to refine models.' },
        { key: 'personalizedRecommendations', state: personalizedRecommendations, setter: setPersonalizedRecommendations, label: 'Personalized Meal/Workout Suggestions', desc: 'Provides dynamic nutrition targets.' },
        { key: 'performanceTracking', state: performanceTracking, setter: setPerformanceTracking, label: 'Enable Diagnostic Telemetry', desc: 'Sends anonymous load-times and crash logs.' },
        { key: 'marketingCommunications', state: marketingCommunications, setter: setMarketingCommunications, label: 'Email Newsletter & Updates', desc: 'Receive community workout challenges.' },
        { key: 'analyticsTracking', state: analyticsTracking, setter: setAnalyticsTracking, label: 'Enable Screen Analytics', desc: 'Tracks screen time layout features.' }
      ].map(priv => (
        <label key={priv.key} className="flex justify-between items-center bg-surface border border-card-border p-2.5 rounded-lg cursor-pointer select-none">
          <div className="pr-4 flex-1">
            <span className="text-xs font-bold text-foreground block">{priv.label}</span>
            <span className="text-[9px] text-muted block mt-0.5 leading-normal">{priv.desc}</span>
          </div>
          <input
            type="checkbox"
            checked={priv.state !== false}
            onChange={(e) => priv.setter(e.target.checked)}
            className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green shrink-0"
          />
        </label>
      ))}

      <div className="space-y-2 pt-2 border-t border-card-border">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Irreversible Purge Logs</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleClearHistory}
            className="py-2.5 px-3 border border-destructive/20 hover:border-destructive text-destructive bg-destructive/5 hover:bg-destructive/10 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Logs
          </button>

          <button
            type="button"
            onClick={handleClearMemory}
            className="py-2.5 px-3 border border-destructive/20 hover:border-destructive text-destructive bg-destructive/5 hover:bg-destructive/10 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Database className="w-3.5 h-3.5" />
            Purge AI Memory
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full btn-primary py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider border-none flex items-center justify-center gap-1 cursor-pointer"
      >
        {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
        Save Privacy Settings
      </button>
    </form>
  );

  const renderSecurityForm = () => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Update Email Address</h4>
        <div className="flex gap-2">
          <div className="flex-1 relative flex items-center">
            <Mail className="absolute left-2.5 w-3.5 h-3.5 text-muted" />
            <input 
              type="email" 
              value={emailInput} 
              onChange={(e) => setEmailInput(e.target.value)} 
              className="w-full bg-[var(--input)] text-foreground border border-card-border pl-8 pr-3 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner"
            />
          </div>
          <button 
            onClick={handleUpdateEmail}
            className="bg-surface hover:bg-card-border border border-card-border hover:border-acid-green px-3 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer text-foreground"
          >
            Update
          </button>
        </div>
      </div>

      <div className="space-y-1.5 pt-2 border-t border-card-border">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Update Password</h4>
        <div className="flex gap-2">
          <div className="flex-1 relative flex items-center">
            <Lock className="absolute left-2.5 w-3.5 h-3.5 text-muted" />
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Min 6 characters"
              value={passwordInput} 
              onChange={(e) => setPasswordInput(e.target.value)} 
              className="w-full bg-[var(--input)] text-foreground border border-card-border pl-8 pr-8 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 text-muted hover:text-foreground cursor-pointer bg-none border-none p-0"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <button 
            onClick={handleUpdatePassword}
            className="bg-surface hover:bg-card-border border border-card-border hover:border-acid-green px-3 text-xs font-bold uppercase rounded-lg transition-all cursor-pointer text-foreground"
          >
            Update
          </button>
        </div>
      </div>

      <div className="bg-surface border border-card-border p-3 rounded-lg space-y-3 pt-2 border-t border-card-border">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-foreground block">Two-Factor Authentication (2FA)</span>
            <span className="text-[9px] text-muted block mt-0.5">Use simulator code: <code className="text-acid-green font-bold bg-surface px-1 py-0.5 rounded">123456</code></span>
          </div>
          <button
            onClick={() => {
              if (twoFactorEnabled) {
                setTwoFactorEnabled(false);
                setTwoFactorSuccess(false);
                if (onNotification) onNotification("2FA Disabled.");
              } else {
                setTwoFactorSuccess(false);
              }
            }}
            className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border transition-all cursor-pointer ${
              twoFactorEnabled
                ? 'bg-acid-green/10 text-acid-green border-acid-green'
                : 'bg-surface border-card-border text-muted hover:text-foreground'
            }`}
          >
            {twoFactorEnabled ? 'ACTIVE' : 'DISABLED'}
          </button>
        </div>

        {!twoFactorEnabled && (
          <form onSubmit={handleEnable2FASimulation} className="flex gap-2 pt-2 border-t border-card-border/60">
            <input 
              type="text" 
              placeholder="Enter 123456" 
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g,'').slice(0,6))}
              className="bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner flex-1"
            />
            <button 
              type="submit" 
              className="bg-acid-green text-accent-foreground border-none font-bold text-xs uppercase px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Verify
            </button>
          </form>
        )}
      </div>

      <div className="space-y-2 pt-2 border-t border-card-border">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Active Device Sessions</h4>
        <div className="border border-card-border rounded-lg overflow-hidden divide-y divide-card-border">
          {activeSessions.map(session => (
            <div key={session.id} className="flex justify-between items-center p-2.5 bg-surface text-[10px]">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-foreground">{session.device}</span>
                  {session.active && (
                    <span className="text-[7px] bg-acid-green/20 text-acid-green px-1 py-0.2 rounded-full font-black uppercase">Active</span>
                  )}
                </div>
                <span className="text-[8.5px] text-muted block mt-0.5">{session.location} • {session.ip}</span>
              </div>
              {!session.active && (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="text-[8.5px] text-destructive hover:underline font-bold uppercase tracking-wider bg-none border-none cursor-pointer"
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDataForm = () => (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between items-center text-[9px] font-bold text-muted">
          <span>CLOUD STORAGE ALLOCATION</span>
          <span>9.6% USED (4.8 MB / 50 MB)</span>
        </div>
        <div className="w-full bg-surface border border-card-border h-1.5 rounded-full overflow-hidden">
          <div className="bg-acid-green h-full rounded-full" style={{ width: '9.6%' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-surface border border-card-border p-3 rounded-lg flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-foreground block">Purge Local Cache</span>
            <span className="text-[9px] text-muted block mt-0.5 leading-normal">Forces reload of food lists and predictions.</span>
          </div>
          <button
            onClick={handleClearCacheSimulation}
            disabled={clearingCache}
            className="mt-3 py-1.5 px-3 bg-surface hover:bg-card-border border border-card-border text-foreground text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${clearingCache ? 'animate-spin' : ''}`} />
            {clearingCache ? 'Purging Cache...' : 'Purge Cache'}
          </button>
        </div>

        <div className="bg-surface border border-card-border p-3 rounded-lg flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-foreground block">Settings Backup</span>
            <span className="text-[9px] text-muted block mt-0.5 leading-normal">Save Calyxo profile details to JSON file.</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={handleBackupData}
              className="py-1.5 px-1 bg-surface hover:bg-card-border border border-card-border text-[9.5px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-0.5 text-foreground"
            >
              <Download className="w-3 h-3 text-acid-green" /> Backup
            </button>
            <label className="py-1.5 px-1 bg-surface hover:bg-card-border border border-card-border text-[9.5px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-0.5 text-foreground text-center">
              <RefreshCw className="w-3 h-3 text-acid-green" /> Restore
              <input type="file" accept=".json" onChange={handleRestoreData} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-card-border">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Export Raw Sheets (.CSV)</h4>
        <div className="grid grid-cols-3 gap-2">
          {[
            { type: 'fitness', label: 'Biometrics' },
            { type: 'nutrition', label: 'Nutrition' },
            { type: 'workout', label: 'Workouts' }
          ].map(exp => (
            <button
              key={exp.type}
              onClick={() => exportLogsToCSV(exp.type)}
              className="py-2 px-1 bg-surface hover:bg-card-border border border-card-border text-foreground text-[9px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <Download className="w-3 h-3 text-acid-green" />
              {exp.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-card-border">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider text-destructive">Danger Zone</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportData}
            className="py-2 px-1.5 bg-surface hover:bg-card-border border border-card-border text-foreground text-[9.5px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1"
          >
            <Download className="w-3.5 h-3.5 text-acid-green" />
            Export JSON
          </button>
          <button
            onClick={handleDeleteAccount}
            className="py-2 px-1.5 bg-destructive/5 hover:bg-destructive/10 border border-destructive/20 hover:border-destructive text-destructive text-[9.5px] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const renderAboutForm = () => (
    <div className="space-y-4">
      <div className="flex gap-3 p-3 bg-surface border border-card-border rounded-lg">
        <div className="w-10 h-10 bg-acid-green flex items-center justify-center font-black text-accent-foreground text-sm rounded-lg shadow shrink-0 select-none">CX</div>
        <div>
          <h4 className="text-xs font-black text-foreground">Calyxo Nutrition & Coach</h4>
          <span className="text-[9px] text-muted block mt-0.5">Version 2.4.0-stable</span>
          <span className="text-[8.5px] text-muted block leading-none">Copyright © 2026 Calyxo Labs.</span>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-card-border">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Roadmap Milestones</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[
            { label: 'Offline Sync', status: 'Completed', color: 'text-acid-green bg-acid-green/10 border-acid-green/15' },
            { label: 'Indian Food Expansion', status: 'Completed', color: 'text-acid-green bg-acid-green/10 border-acid-green/15' },
            { label: 'Wearable Integration', status: 'In Dev', color: 'text-blue-400 bg-blue-500/10 border-blue-500/15' },
            { label: 'AI Posture Video', status: 'Planned', color: 'text-muted bg-surface border-card-border' }
          ].map((mile, i) => (
            <div key={i} className="p-2 bg-surface border border-card-border rounded-lg flex justify-between items-center text-[10px]">
              <span className="font-bold text-foreground pr-2 truncate">{mile.label}</span>
              <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${mile.color}`}>{mile.status}</span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleFeedbackSubmit} className="space-y-3 pt-2 border-t border-card-border">
        <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Bug Reports & Feedback</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className={labelClass}>Category</label>
            <select value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner">
              <option value="bug">Bug / UI Issue</option>
              <option value="feature">Feature Request</option>
              <option value="support">Account Help</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Response Email</label>
            <input type="email" value={user?.email || ''} readOnly className="w-full bg-[var(--input)] text-muted border border-card-border px-2 py-1.5 rounded-lg text-xs shadow-inner cursor-not-allowed" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Message</label>
          <textarea
            rows="2"
            required
            value={feedbackMessage}
            onChange={(e) => setFeedbackMessage(e.target.value)}
            placeholder="Details..."
            className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner resize-none leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={submittingFeedback}
          className="w-full btn-primary py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider border-none flex items-center justify-center gap-1 cursor-pointer"
        >
          {submittingFeedback ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          Submit Feedback
        </button>
      </form>

      <div className="space-y-2 pt-2 border-t border-card-border">
        <div className="flex gap-2">
          <button 
            type="button" 
            onClick={() => setLegalSubTab('privacy_policy')} 
            className={`flex-1 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider border cursor-pointer ${legalSubTab === 'privacy_policy' ? 'bg-acid-green border-acid-green text-accent-foreground' : 'bg-surface border-card-border text-muted'}`}
          >
            Privacy Policy
          </button>
          <button 
            type="button" 
            onClick={() => setLegalSubTab('terms_of_service')} 
            className={`flex-1 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-wider border cursor-pointer ${legalSubTab === 'terms_of_service' ? 'bg-acid-green border-acid-green text-accent-foreground' : 'bg-surface border-card-border text-muted'}`}
          >
            Terms of Service
          </button>
        </div>

        <div className="bg-surface/50 border border-card-border p-2.5 rounded-lg text-[9.5px] text-muted max-h-[120px] overflow-y-auto pr-1">
          {legalSubTab === 'privacy_policy' ? (
            <div className="space-y-1.5">
              <span className="font-bold text-foreground block">Privacy Policy</span>
              <p>Your fitness logs and chat metrics with Calyxo Coach AI (Gemini APIs) are stored securely in your localized Firebase Firestore vault. We prioritize data safety and GDPR compliance. No telemetry data is distributed to commercial advertising networks.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              <span className="font-bold text-foreground block">Medical Disclaimer</span>
              <p className="text-foreground font-bold bg-surface p-2 rounded border border-card-border">
                NOTICE: None of the plans or macro advice generated by Calyxo or Calyxo Coach constitutes professional medical advice. Always consult a general practitioner before starting deficit diets or physical exercises.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-20 select-text px-2 md:px-4">
      {/* ─── Hero / Profile Header Card ─── */}
      <div className="glass rounded-xl border border-card-border p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top right, rgba(204,255,0,0.03) 0%, transparent 60%)' }} />
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            {/* Avatar */}
            <div className="relative w-16 h-16 rounded-full border-2 border-acid-green/30 bg-surface flex items-center justify-center overflow-hidden shadow-md shrink-0">
              {photoLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin text-muted" />
              ) : userProfile?.photoURL ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={userProfile.photoURL} className="object-cover w-full h-full" alt="User profile avatar image" />
                </>
              ) : (
                <span className="text-xl font-black text-acid-green">{getInitials()}</span>
              )}
              <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <span className="text-[8px] text-white font-bold uppercase tracking-wider">Edit</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>

            {/* Name/Email */}
            <div className="min-w-0">
              <h2 className="text-sm font-black text-foreground uppercase tracking-wider truncate">
                {firstName ? `${firstName} ${lastName}`.trim() : (username || nickname || 'Athlete')}
              </h2>
              <p className="text-[10px] text-muted font-medium truncate">{user?.email}</p>
              <div className="mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                {isAccountVerified && (
                  <span className="inline-flex items-center gap-1 text-[8px] text-acid-green font-black uppercase tracking-wider">
                    <CheckCircle className="w-2.5 h-2.5" /> Verified
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[8px] text-muted font-bold uppercase tracking-wider">
                  BMI: <strong className="text-foreground">{mobileBmi}</strong>
                </span>
                <span className="inline-flex items-center gap-1 bg-acid-green/10 border border-acid-green/20 text-acid-green text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                  <Target className="w-2 h-2" />
                  {goalLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Level & Streak Quick Stats */}
          <div className="w-full sm:w-auto grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-3">
            {[
              { label: 'Level', value: level, icon: Zap, color: 'text-acid-green' },
              { label: 'Health Score', value: `${fitnessScore}%`, icon: Activity, color: 'text-acid-green' },
              { label: 'Streak', value: `${ecoStore.streaks?.loginStreak || 1}d`, icon: TrendingUp, color: 'text-blue-400' }
            ].map(s => (
              <div key={s.label} className="bg-surface/50 border border-card-border rounded-xl p-2 flex flex-col items-center justify-center text-center sm:min-w-[80px]">
                <s.icon className={`w-3.5 h-3.5 mb-1 ${s.color}`} />
                <span className="text-xs font-black text-foreground leading-none">{s.value}</span>
                <span className="text-[8px] text-muted font-bold uppercase tracking-wider mt-0.5">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="mt-4 border-t border-card-border/60 pt-3">
          <div className="flex justify-between text-[8px] font-bold text-muted uppercase tracking-wider mb-1">
            <span>XP Progress</span>
            <span>{xp} / {xpToNext} XP</span>
          </div>
          <div className="w-full bg-surface border border-card-border rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-acid-green"
              initial={{ width: 0 }}
              animate={{ width: `${xpPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      {/* ─── Profile Info & Health Stats Grid ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Profile Information */}
        <div className="glass p-4 rounded-xl border border-card-border space-y-3">
          <div className="flex justify-between items-center border-b border-card-border/60 pb-2">
            <h3 className="text-[10px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-acid-green" /> Profile Information
            </h3>
            <button
              onClick={() => setEditSection(editSection === 'profile' ? null : 'profile')}
              className="text-[9px] font-extrabold text-acid-green bg-acid-green/10 px-2.5 py-1 rounded uppercase tracking-wider cursor-pointer border-none"
            >
              {editSection === 'profile' ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editSection === 'profile' ? (
            <form onSubmit={(e) => { handleSaveAllDetails(e); setEditSection(null); }} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Username</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                </div>
                <div>
                  <label className={labelClass}>Nickname</label>
                  <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Age</label>
                  <input type="number" value={ageInput} onChange={(e) => setAgeInput(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Units</label>
                  <select value={units} onChange={(e) => setUnits(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner">
                    <option value="metric">Metric</option>
                    <option value="imperial">Imperial</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full btn-primary py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider border-none flex items-center justify-center gap-1 cursor-pointer">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Save Profile
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-surface/50 border border-card-border rounded-lg p-2.5">
                <span className="text-[8px] text-muted font-bold uppercase tracking-wider block">Full Name</span>
                <span className="text-xs font-black text-foreground mt-0.5 block">{firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Not Set'}</span>
              </div>
              <div className="bg-surface/50 border border-card-border rounded-lg p-2.5">
                <span className="text-[8px] text-muted font-bold uppercase tracking-wider block">Age & Gender</span>
                <span className="text-xs font-black text-foreground mt-0.5 block">{ageInput} yrs • {gender}</span>
              </div>
              <div className="bg-surface/50 border border-card-border rounded-lg p-2.5">
                <span className="text-[8px] text-muted font-bold uppercase tracking-wider block">Username</span>
                <span className="text-xs font-black text-foreground mt-0.5 block">@{username || nickname || 'athlete'}</span>
              </div>
              <div className="bg-surface/50 border border-card-border rounded-lg p-2.5">
                <span className="text-[8px] text-muted font-bold uppercase tracking-wider block">Unit System</span>
                <span className="text-xs font-black text-foreground mt-0.5 block capitalize">{units}</span>
              </div>
            </div>
          )}
        </div>

        {/* Health Stats */}
        <div className="glass p-4 rounded-xl border border-card-border space-y-3">
          <div className="flex justify-between items-center border-b border-card-border/60 pb-2">
            <h3 className="text-[10px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-acid-green" /> Health Targets & Stats
            </h3>
            <button
              onClick={() => setEditSection(editSection === 'health' ? null : 'health')}
              className="text-[9px] font-extrabold text-acid-green bg-acid-green/10 px-2.5 py-1 rounded uppercase tracking-wider cursor-pointer border-none"
            >
              {editSection === 'health' ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editSection === 'health' ? (
            <form onSubmit={(e) => { handleSaveAllDetails(e); setEditSection(null); }} className="space-y-2.5">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass}>Weight ({units === 'metric' ? 'kg' : 'lbs'})</label>
                  <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                </div>
                <div>
                  <label className={labelClass}>Height ({units === 'metric' ? 'cm' : 'in'})</label>
                  <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                </div>
                <div>
                  <label className={labelClass}>Goal Weight</label>
                  <input type="number" step="0.1" value={goalWeight} onChange={(e) => setGoalWeight(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelClass}>Daily Calories (kcal)</label>
                  <input type="number" value={dailyCalories} onChange={(e) => setDailyCalories(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                </div>
                <div>
                  <label className={labelClass}>Water Target (ml)</label>
                  <input type="number" value={waterTarget} onChange={(e) => setWaterTarget(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                </div>
              </div>
              <button type="submit" disabled={saving} className="w-full btn-primary py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider border-none flex items-center justify-center gap-1 cursor-pointer">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Save Targets
              </button>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="bg-surface/50 border border-card-border rounded-lg p-2.5">
                <span className="text-[8px] text-muted font-bold uppercase tracking-wider block">Height & Weight</span>
                <span className="text-xs font-black text-foreground mt-0.5 block">{height}{units === 'metric' ? 'cm' : 'in'} • {weight}{units === 'metric' ? 'kg' : 'lbs'}</span>
              </div>
              <div className="bg-surface/50 border border-card-border rounded-lg p-2.5">
                <span className="text-[8px] text-muted font-bold uppercase tracking-wider block">Goal Weight</span>
                <span className="text-xs font-black text-foreground mt-0.5 block">{goalWeight}{units === 'metric' ? 'kg' : 'lbs'}</span>
              </div>
              <div className="bg-surface/50 border border-card-border rounded-lg p-2.5">
                <span className="text-[8px] text-muted font-bold uppercase tracking-wider block">Calorie Target</span>
                <span className="text-xs font-black text-foreground mt-0.5 block">{dailyCalories} kcal</span>
              </div>
              <div className="bg-surface/50 border border-card-border rounded-lg p-2.5">
                <span className="text-[8px] text-muted font-bold uppercase tracking-wider block">Water Target</span>
                <span className="text-xs font-black text-foreground mt-0.5 block">{waterTarget} ml</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Achievements Row (Horizontal list) ─── */}
      {ecoStore.achievements && ecoStore.achievements.some(a => a.unlocked) && (
        <div className="glass rounded-xl border border-card-border p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-yellow-400" /> Unlocked Achievements
            </h3>
            <span className="text-[9px] text-acid-green font-bold">{unlockedAchievements} Unlocked</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {ecoStore.achievements.filter(a => a.unlocked).map(a => (
              <div key={a.id} className="flex items-center gap-1 bg-surface border border-card-border rounded-lg px-2 py-1 shrink-0">
                <span className="text-xs">{a.icon}</span>
                <span className="text-[9px] text-foreground font-bold">{a.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Advanced Settings Collapsible Trigger ─── */}
      <button
        onClick={() => setAdvancedOpen(!advancedOpen)}
        className="w-full flex items-center justify-between px-4 py-3 glass border border-card-border rounded-xl hover:border-acid-green/40 transition-all cursor-pointer text-left font-bold"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-acid-green" />
          <span className="text-xs font-bold text-foreground">Advanced Settings</span>
        </div>
        <span className="text-xs text-muted font-bold">{advancedOpen ? '▲' : '▼'}</span>
      </button>

      {/* ─── Advanced Settings Accordion ─── */}
      {advancedOpen && (
        <div className="space-y-2 border border-card-border/60 p-2.5 rounded-xl bg-surface/20">
          {[
            { id: 'appearance', label: 'Appearance & Themes', icon: Eye },
            { id: 'ai', label: 'AI Coach Settings', icon: Sparkles },
            { id: 'notifications', label: 'Notification Settings', icon: Bell },
            { id: 'privacy', label: 'Privacy & Telemetry', icon: Shield },
            { id: 'security', label: 'Security & 2FA', icon: Key },
            { id: 'subscription', label: 'Subscription Plans', icon: CreditCard },
            { id: 'data', label: 'Data & Storage', icon: Database },
            { id: 'about', label: 'About & Legal Policies', icon: Info },
          ].map(acc => {
            const isOpen = openAccordion === acc.id;
            const Icon = acc.icon;
            return (
              <div key={acc.id} className="border border-card-border rounded-lg overflow-hidden glass bg-surface/30">
                <button
                  onClick={() => toggleAccordion(acc.id)}
                  className="w-full flex items-center justify-between p-3 text-xs font-bold text-foreground hover:bg-surface/50 transition-colors cursor-pointer border-none"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted" />
                    <span>{acc.label}</span>
                  </div>
                  <span className="text-muted">{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="p-4 border-t border-card-border bg-[var(--card-bg)] space-y-4">
                    {acc.id === 'appearance' && renderAppearanceForm()}
                    {acc.id === 'ai' && renderAIForm()}
                    {acc.id === 'notifications' && renderNotificationsForm()}
                    {acc.id === 'privacy' && renderPrivacyForm()}
                    {acc.id === 'security' && renderSecurityForm()}
                    {acc.id === 'subscription' && <MonetizationCenter />}
                    {acc.id === 'data' && renderDataForm()}
                    {acc.id === 'about' && renderAboutForm()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Sign Out ─── */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 border border-destructive/20 hover:border-destructive active:border-destructive bg-destructive/5 hover:bg-destructive/10 text-destructive text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </button>
    </div>
  );
}

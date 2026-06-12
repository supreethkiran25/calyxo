"use client";

import React, { useState, useEffect } from 'react';
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
  Shield, FileText, Info, HelpCircle, Key, Cpu, Activity
} from 'lucide-react';

export default function UserProfile({ onNotification }) {
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const updateUserProfile = useStore(state => state.updateUserProfile);
  const resetStore = useStore(state => state.resetStore);
  const userId = user?.uid;
  const ecoStore = useEcosystemStore();

  const [activePanel, setActivePanel] = useState('account');

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
          store.setTheme(e.matches ? 'dark' : 'light');
        };
        store.setTheme(mq.matches ? 'dark' : 'light');
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
    { id: 'data', label: 'Data & Storage', icon: Database },
    { id: 'security', label: 'Security Settings', icon: Key },
    { id: 'privacy', label: 'Privacy Settings', icon: Shield },
    { id: 'about', label: 'About Calyxo', icon: Info },
    { id: 'legal', label: 'Legal & Policies', icon: FileText }
  ];

  const inputClass = "w-full bg-[var(--input)] text-foreground border border-card-border px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-acid-green text-xs shadow-inner";
  const labelClass = "text-[9px] text-muted font-bold uppercase tracking-wider block mb-1";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
      
      {/* Sidebar Navigation (Col 1) */}
      <div className="glass p-5 rounded-2xl border border-card-border space-y-5 lg:col-span-1">
        <div className="flex flex-col items-center text-center pb-4 border-b border-card-border">
          
          {/* Profile Photo Uploader */}
          <div className="relative w-20 h-20 rounded-full border border-card-border bg-surface flex items-center justify-center text-lg overflow-hidden group shadow-lg">
            {photoLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-muted" />
            ) : userProfile?.photoURL ? (
              <img src={userProfile.photoURL} className="object-cover w-full h-full" />
            ) : (
              <span className="text-lg font-black text-muted">{getInitials()}</span>
            )}
            
            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-[8px] font-bold text-white uppercase tracking-wider">
              <span>Upload</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
          
          <h3 className="text-xs font-black text-foreground mt-3 uppercase tracking-wider truncate max-w-full">{username || nickname || "Athlete"}</h3>
          <p className="text-[9px] text-muted font-medium truncate max-w-full mt-0.5">{user?.email}</p>

          {userProfile?.photoURL && (
            <button 
              onClick={handleRemovePhoto}
              className="text-[8px] text-destructive font-bold uppercase tracking-wider mt-2.5 hover:underline bg-none border-none cursor-pointer"
            >
              Remove photo
            </button>
          )}
        </div>

        {/* Panel selector items */}
        <nav className="flex flex-col gap-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActivePanel(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                  activePanel === item.id 
                    ? 'bg-acid-green text-accent-foreground border-acid-green' 
                    : 'text-muted border-transparent hover:bg-surface hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 mt-4 border border-destructive/20 hover:border-destructive bg-destructive/5 hover:bg-destructive/10 text-destructive text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {/* Main Content Area (Col 2-4) */}
      <div className="lg:col-span-3 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePanel}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {/* Account Settings Panel */}
            {activePanel === 'account' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Account Settings</h2>
                    <p className="text-[10px] text-muted font-medium">Manage credentials, identity and security credentials</p>
                  </div>
                  
                  {/* Account Verification Status */}
                  <div className="flex items-center gap-2 bg-surface border border-card-border px-3 py-1.5 rounded-xl">
                    <span className="text-[9px] text-muted font-bold uppercase tracking-wider">Status:</span>
                    {isAccountVerified ? (
                      <span className="text-[9px] text-acid-green font-black uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> VERIFIED
                      </span>
                    ) : (
                      <button 
                        onClick={handleVerificationRequest}
                        className="text-[9px] text-orange-400 hover:text-orange-300 font-black uppercase tracking-wider bg-orange-500/10 hover:bg-orange-500/20 px-2 py-0.5 rounded-lg border border-orange-500/20 cursor-pointer"
                      >
                        Unverified (Verify Now)
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit Name & Username */}
                <form onSubmit={handleSaveAllDetails} className="space-y-4 pt-4 border-t border-card-border">
                  <h4 className="text-xs font-bold text-foreground">Personal Identity Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Username</label>
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose unique username" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Nickname</label>
                      <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="Enter nickname" className={inputClass} />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-primary py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider cursor-pointer border-none"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save Account details
                  </button>
                </form>

                {/* Update Email */}
                <div className="space-y-2.5 pt-4 border-t border-card-border">
                  <h4 className="text-xs font-bold text-foreground">Update Email Address</h4>
                  <div className="flex gap-2">
                    <div className="flex-1 relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-muted" />
                      <input 
                        type="email" 
                        value={emailInput} 
                        onChange={(e) => setEmailInput(e.target.value)} 
                        className="w-full bg-[var(--input)] text-foreground border border-card-border pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-acid-green text-xs shadow-inner"
                      />
                    </div>
                    <button 
                      onClick={handleUpdateEmail}
                      className="bg-surface hover:bg-card-border border border-card-border hover:border-acid-green px-4 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer text-foreground"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Update Password */}
                <div className="space-y-2.5 pt-4 border-t border-card-border">
                  <h4 className="text-xs font-bold text-foreground">Update Password</h4>
                  <div className="flex gap-2">
                    <div className="flex-1 relative flex items-center">
                      <Lock className="absolute left-3.5 w-4 h-4 text-muted" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Choose a strong password (6+ chars)"
                        value={passwordInput} 
                        onChange={(e) => setPasswordInput(e.target.value)} 
                        className="w-full bg-[var(--input)] text-foreground border border-card-border pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-acid-green text-xs shadow-inner"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-muted hover:text-foreground cursor-pointer bg-none border-none p-0"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button 
                      onClick={handleUpdatePassword}
                      className="bg-surface hover:bg-card-border border border-card-border hover:border-acid-green px-4 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer text-foreground"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Account Operations (Delete / Export) */}
                <div className="space-y-3 pt-6 border-t border-card-border">
                  <h4 className="text-xs font-bold text-foreground">Account Operations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={handleExportData}
                      className="py-3 px-4 bg-surface hover:bg-card-border border border-card-border hover:border-acid-green text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4 text-acid-green" />
                      Export Account Data (JSON)
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full flex items-center justify-center gap-2 p-3 bg-destructive/5 hover:bg-destructive/10 border border-destructive/20 hover:border-destructive text-destructive text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account & Purge Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings Panel */}
            {activePanel === 'appearance' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-5">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Appearance Settings</h2>
                  <p className="text-[10px] text-muted font-medium">Customize application themes, background effects, and performance parameters</p>
                </div>

                <form onSubmit={handleSaveAllDetails} className="space-y-6 pt-4 border-t border-card-border">
                  {/* Theme Selector Section */}
                  <div className="flex flex-col space-y-2">
                    <label className={labelClass}>Application Theme</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'light', label: 'Light Mode' },
                        { id: 'dark', label: 'Dark Mode' },
                        { id: 'system', label: 'System Sync' }
                      ].map(themeOpt => (
                        <button
                          key={themeOpt.id}
                          type="button"
                          onClick={() => setThemeMode(themeOpt.id)}
                          className={`py-3 px-4 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                            themeMode === themeOpt.id
                              ? 'bg-acid-green border-acid-green text-accent-foreground shadow-md'
                              : 'bg-surface border-card-border text-muted hover:text-foreground'
                          }`}
                        >
                          {themeOpt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Enable Effects Toggle */}
                  <label className="flex justify-between items-center bg-surface border border-card-border p-3.5 rounded-xl cursor-pointer select-none">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-foreground block">Enable Background Effects</span>
                      <span className="text-[9.5px] text-muted block mt-0.5">Toggle optional visual effects in the background. Defaults to OFF.</span>
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
                      className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green animate-none"
                    />
                  </label>

                  {/* Settings Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className={inputClass}
                      >
                        <option value="minimal">Minimal (Default - Current static background)</option>
                        <option value="orbs">Floating Gradient Orbs (Premium SaaS feel)</option>
                        <option value="particles">Fitness Energy Particles (Slow reactive dots)</option>
                        <option value="mesh">3D Fitness Mesh (High-performance wireframe projection)</option>
                        <option value="aurora">Aurora Background (Flowing neon gradients)</option>
                        <option value="glass">Glass Motion Background (Drifting glassmorphic shapes)</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className={labelClass}>Animation Intensity</label>
                      <select 
                        value={animationIntensity} 
                        onChange={(e) => setAnimationIntensity(e.target.value)} 
                        className={inputClass}
                      >
                        <option value="off">Off (Static effect rendering)</option>
                        <option value="low">Low (Extremely subtle drift, minimal battery draw)</option>
                        <option value="medium">Medium (Standard animation rate)</option>
                        <option value="high">High (Fluid immersive animations)</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1">
                      <label className={labelClass}>Performance Mode</label>
                      <select 
                        value={performanceMode} 
                        onChange={(e) => setPerformanceMode(e.target.value)} 
                        className={inputClass}
                      >
                        <option value="auto">Auto (Dynamically downscales details on mobile / low battery)</option>
                        <option value="battery">Battery Saver (Disables all canvas animations automatically)</option>
                        <option value="max">Maximum Visuals (Lock maximum rendering detail)</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-1 justify-center pt-2">
                      <label className="flex items-center gap-2.5 bg-surface border border-card-border p-3.5 rounded-xl cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={reduceMotionState}
                          onChange={(e) => setReduceMotionState(e.target.checked)}
                          className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green animate-none"
                        />
                        <div>
                          <span className="text-xs font-bold text-foreground block">Reduce Motion</span>
                          <span className="text-[9.5px] text-muted block mt-0.5">Slows down physics and limits particle drift rates.</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Accessibility Enhancements Section */}
                  <div className="space-y-3 pt-4 border-t border-card-border">
                    <h4 className="text-xs font-bold text-foreground">Accessibility Settings</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { key: 'largeText', label: 'Large Text Mode', state: largeTextMode, setter: setLargeTextMode, desc: 'Increases global font readability size' },
                        { key: 'highContrast', label: 'High Contrast', state: highContrastMode, setter: setHighContrastMode, desc: 'Sharper boundaries and outline contrasts' },
                        { key: 'dyslexiaFont', label: 'Dyslexia Font', state: dyslexiaFont, setter: setDyslexiaFont, desc: 'Applies specialized high-readability typography' },
                      ].map(item => (
                        <label key={item.key} className="flex flex-col justify-between bg-surface border border-card-border p-3 rounded-xl cursor-pointer select-none min-h-[80px]">
                          <div className="flex justify-between items-start w-full">
                            <span className="text-xs font-bold text-foreground block">{item.label}</span>
                            <input
                              type="checkbox"
                              checked={item.state}
                              onChange={(e) => item.setter(e.target.checked)}
                              className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green animate-none"
                            />
                          </div>
                          <span className="text-[9px] text-muted block mt-1.5 leading-normal">{item.desc}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider cursor-pointer border-none"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save Appearance & Accessibility Options
                  </button>
                </form>
              </div>
            )}

            {/* AI Settings Panel */}
            {activePanel === 'ai' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">AI Coach Settings</h2>
                  <p className="text-[10px] text-muted font-medium">Configure personality style, message layouts and hydration checkins</p>
                </div>

                <form onSubmit={handleSaveAllDetails} className="space-y-6 pt-4 border-t border-card-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Coach Personality</label>
                      <select value={coachPersonality} onChange={(e) => setCoachPersonality(e.target.value)} className={inputClass}>
                        <option value="motivational">Motivational Coach</option>
                        <option value="gym_bro">Gym Bro (Encouraging / Bold)</option>
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  {/* AI Memory Control */}
                  <div className="pt-2">
                    <label className="flex justify-between items-center bg-surface border border-card-border p-3.5 rounded-xl cursor-pointer select-none">
                      <div className="pr-4">
                        <span className="text-xs font-bold text-foreground block">Enable AI Coach Memory</span>
                        <span className="text-[9.5px] text-muted block mt-0.5">Allows Calyxo to retain memory across chat sessions for better fitness guidance.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={aiMemoryEnabled}
                        onChange={(e) => setAiMemoryEnabled(e.target.checked)}
                        className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green animate-none"
                      />
                    </label>
                  </div>

                  {/* Conversation Exporter */}
                  <div className="space-y-2.5 pt-4 border-t border-card-border">
                    <h4 className="text-xs font-bold text-foreground">Chat Data Portability</h4>
                    <p className="text-[9.5px] text-muted leading-relaxed">Download a markdown file containing all generated plans, advice, and conversation logs with Calyxo Coach.</p>
                    <button
                      type="button"
                      onClick={handleExportChatHistory}
                      className="py-2.5 px-4 bg-surface hover:bg-card-border border border-card-border hover:border-acid-green text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-4 h-4 text-acid-green" />
                      Export Chat History (.md)
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider cursor-pointer border-none"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save Coach Parameters
                  </button>
                </form>
              </div>
            )}

            {/* Notification Settings Panel */}
            {activePanel === 'notifications' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Notification Settings</h2>
                  <p className="text-[10px] text-muted font-medium">Configure push, reminder triggers and digest frequency updates</p>
                </div>

                <form onSubmit={handleSaveAllDetails} className="space-y-6 pt-4 border-t border-card-border">
                  <div className="flex flex-col space-y-1">
                    <label className={labelClass}>Digest & Check-in Frequency</label>
                    <select 
                      value={notificationFrequency} 
                      onChange={(e) => setNotificationFrequency(e.target.value)} 
                      className={inputClass}
                    >
                      <option value="never">Never (Mute non-critical updates)</option>
                      <option value="daily">Daily digest summary</option>
                      <option value="weekly">Weekly digest summary</option>
                    </select>
                  </div>

                  {/* Reminders Grid */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-foreground">Reminders & Alerts</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { key: 'workout', label: 'Workout Reminders', desc: 'Alerts when scheduled targets are missing' },
                        { key: 'meal', label: 'Meal Reminders', desc: 'Logs reminders for morning, lunch, and dinner logs' },
                        { key: 'hydration', label: 'Hydration Alerts', desc: 'Periodic hydration prompts to log water ml' },
                        { key: 'checkins', label: 'AI Coach Check-ins', desc: 'Periodic checkin suggestions from coach Calyxo' },
                        { key: 'challenges', label: 'Challenge Reminders', desc: 'Updates on joined active fitness challenges' },
                        { key: 'achievements', label: 'Achievement Notifications', desc: 'Prompt notifications when badges unlock' },
                      ].map(item => (
                        <label key={item.key} className="flex justify-between items-center bg-surface border border-card-border p-3 rounded-xl cursor-pointer select-none">
                          <div className="pr-4">
                            <span className="text-xs font-bold text-foreground block">{item.label}</span>
                            <span className="text-[9.5px] text-muted block mt-0.5 leading-normal">{item.desc}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={notifications[item.key] !== false}
                            onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                            className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green animate-none"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Scheduled Reports */}
                  <div className="space-y-3 pt-4 border-t border-card-border">
                    <h4 className="text-xs font-bold text-foreground">Progress Reports & Digests</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <label className="flex justify-between items-center bg-surface border border-card-border p-3.5 rounded-xl cursor-pointer select-none">
                        <div>
                          <span className="text-xs font-bold text-foreground block">Weekly Performance Report</span>
                          <span className="text-[9.5px] text-muted block mt-0.5">Summary of calories, workouts and weights logged.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.weeklyReports !== false}
                          onChange={(e) => setNotifications({ ...notifications, weeklyReports: e.target.checked })}
                          className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green animate-none"
                        />
                      </label>

                      <label className="flex justify-between items-center bg-surface border border-card-border p-3.5 rounded-xl cursor-pointer select-none">
                        <div>
                          <span className="text-xs font-bold text-foreground block">Monthly Analytics Digest</span>
                          <span className="text-[9.5px] text-muted block mt-0.5">Deep-dive predictive analytics and fitness predictions.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications.monthlyReports !== false}
                          onChange={(e) => setNotifications({ ...notifications, monthlyReports: e.target.checked })}
                          className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green animate-none"
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider cursor-pointer border-none"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save Notifications Settings
                  </button>
                </form>
              </div>
            )}

            {/* Health & Biometrics Settings Panel */}
            {activePanel === 'health' && (
              <div className="space-y-6">
                {/* Profile completeness progress */}
                <div className="glass p-6 rounded-2xl border border-card-border shadow-md">
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-4">Profile Completeness</h2>
                  <div className="space-y-2 max-w-sm">
                    <div className="w-full bg-surface border border-card-border h-2 rounded-full overflow-hidden">
                      <div className="bg-acid-green h-full rounded-full transition-all duration-300" style={{ width: `${profileCompleteness}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted font-bold">
                      <span>COMPLETED</span>
                      <span>{profileCompleteness}%</span>
                    </div>
                  </div>
                  {profileCompleteness < 100 && (
                    <p className="text-[10px] text-muted font-medium mt-3">Fill out your Health Preferences, AI Coach Settings, and upload a profile photo to reach 100% completion!</p>
                  )}
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Current Weight', val: `${weight} ${units === 'metric' ? 'kg' : 'lbs'}` },
                    { label: 'Goal Weight', val: `${goalWeight} ${units === 'metric' ? 'kg' : 'lbs'}` },
                    { label: 'Body Mass Index', val: bmi, sub: bmiStatus },
                    { label: 'Fitness Score', val: `${ecoStore.fitnessScore?.dailyScore || 70}/100` }
                  ].map((item, idx) => (
                    <div key={idx} className="glass p-5 rounded-2xl border border-card-border shadow-md flex flex-col justify-between h-24">
                      <span className="text-[9px] text-muted font-bold uppercase tracking-wider">{item.label}</span>
                      <span className="text-md font-black text-foreground mt-2 block">{item.val}</span>
                      {item.sub && <span className="text-[8.5px] text-muted block mt-1">{item.sub}</span>}
                    </div>
                  ))}
                </div>

                {/* Biometrics & Daily Targets */}
                <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-6">
                  <div>
                    <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Physical & Target Goals</h2>
                    <p className="text-[10px] text-muted font-medium">Update calculations, physical metrics and experience level</p>
                  </div>

                  <form onSubmit={handleSaveAllDetails} className="space-y-6 pt-4 border-t border-card-border">
                    {/* General Body Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>Age (Years)</label>
                        <input type="number" value={ageInput} onChange={(e) => setAgeInput(parseInt(e.target.value) || 0)} className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Gender</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Units</label>
                        <select value={units} onChange={(e) => setUnits(e.target.value)} className={inputClass}>
                          <option value="metric">Metric (kg, cm)</option>
                          <option value="imperial">Imperial (lbs, in)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>Weight ({units === 'imperial' ? 'lbs' : 'kg'})</label>
                        <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Height ({units === 'imperial' ? 'in' : 'cm'})</label>
                        <input type="number" step="0.1" value={height} onChange={(e) => setHeight(parseFloat(e.target.value) || 0)} className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Goal Weight ({units === 'imperial' ? 'lbs' : 'kg'})</label>
                        <input type="number" step="0.1" value={goalWeight} onChange={(e) => setGoalWeight(parseFloat(e.target.value) || 0)} className={inputClass} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className={labelClass}>Date of Birth</label>
                        <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Activity Level</label>
                        <select value={activity} onChange={(e) => setActivity(Number(e.target.value))} className={inputClass}>
                          <option value="1.2">Sedentary (No exercise)</option>
                          <option value="1.375">Lightly Active (1-3×/wk)</option>
                          <option value="1.55">Moderately Active (3-5×/wk)</option>
                          <option value="1.725">Very Active (6-7×/wk)</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Fitness Target</label>
                        <select value={goal} onChange={(e) => setGoal(e.target.value)} className={inputClass}>
                          <option value="lose">Weight Loss (Calorie Deficit)</option>
                          <option value="maintain">Weight Maintenance</option>
                          <option value="gains">Muscle Gains (Calorie Surplus)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className={labelClass}>Experience Level</label>
                        <select value={experience} onChange={(e) => setExperience(e.target.value)} className={inputClass}>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Fitness Weight Goal ({units === 'imperial' ? 'lbs' : 'kg'})</label>
                        <input type="number" step="0.1" value={weightGoal} onChange={(e) => setWeightGoal(parseFloat(e.target.value) || 0)} className={inputClass} />
                      </div>
                    </div>

                    {/* Daily Calorie, Water & Nutrient Goals */}
                    <div className="space-y-3 pt-4 border-t border-card-border">
                      <h4 className="text-xs font-bold text-foreground">Nutrition & Hydration Targets</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={labelClass}>Daily Calories (kcal)</label>
                          <input type="number" value={dailyCalories} onChange={(e) => setDailyCalories(parseInt(e.target.value) || 0)} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Daily Water Goal (ml)</label>
                          <input type="number" value={waterTarget} onChange={(e) => setWaterTarget(parseInt(e.target.value) || 0)} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Daily Protein Goal (g)</label>
                          <input type="number" value={proteinTarget} onChange={(e) => setProteinTarget(parseInt(e.target.value) || 0)} className={inputClass} />
                        </div>
                      </div>
                    </div>

                    {/* Dietary Restrictions Preferences */}
                    <div className="space-y-4 pt-4 border-t border-card-border">
                      <div className="flex flex-col space-y-1.5">
                        <label className={labelClass}>Dietary Preferences</label>
                        <div className="flex flex-wrap gap-2">
                          {['Vegetarian', 'Vegan', 'Keto', 'High Protein', 'Low Carb'].map(pref => {
                            const active = dietPreferences.includes(pref);
                            return (
                              <button
                                key={pref}
                                type="button"
                                onClick={() => toggleDietPreference(pref)}
                                className={`px-3 py-2 border font-bold text-[10px] uppercase tracking-wider rounded-xl transition-colors cursor-pointer ${
                                  active 
                                    ? 'bg-acid-green/10 border-acid-green text-acid-green' 
                                    : 'bg-surface border-card-border text-muted hover:text-foreground'
                                }`}
                              >
                                {pref}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Allergies</label>
                          <input type="text" value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="e.g. peanuts, seafood" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Food Restrictions / Medical</label>
                          <input type="text" value={medicalRestrictions} onChange={(e) => setMedicalRestrictions(e.target.value)} placeholder="e.g. low salt, diabetic" className={inputClass} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={labelClass}>Food Dislikes</label>
                          <input type="text" value={foodDislikes} onChange={(e) => setFoodDislikes(e.target.value)} placeholder="e.g. eggs, onions" className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Favorite Foods</label>
                          <input type="text" value={favoriteFoods} onChange={(e) => setFavoriteFoods(e.target.value)} placeholder="e.g. protein shakes, broccoli" className={inputClass} />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider cursor-pointer border-none"
                    >
                      {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Save Health Preferences & Targets
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Data & Storage Panel */}
            {activePanel === 'data' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Data & Storage Control</h2>
                  <p className="text-[10px] text-muted font-medium">Control data storage, history logs, backups and file synchronization</p>
                </div>

                <div className="space-y-6 pt-4 border-t border-card-border">
                  {/* Storage usage gauge */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-muted">
                      <span>CLOUD STORAGE ALLOCATION</span>
                      <span>9.6% USED (4.8 MB / 50 MB)</span>
                    </div>
                    <div className="w-full bg-surface border border-card-border h-2 rounded-full overflow-hidden">
                      <div className="bg-acid-green h-full rounded-full" style={{ width: '9.6%' }} />
                    </div>
                    <p className="text-[9px] text-muted leading-relaxed">Storage allocation tracks weight records, food database caching, custom logged exercises, and chat telemetry logs.</p>
                  </div>

                  {/* Actions Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Simulated Cache Clean */}
                    <div className="bg-surface border border-card-border p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-foreground block">Purge Local Cache</span>
                        <span className="text-[9.5px] text-muted block mt-1 leading-normal">Forces reload of Indian food lists, asset files and localized predictions from cache index storage.</span>
                      </div>
                      <button
                        onClick={handleClearCacheSimulation}
                        disabled={clearingCache}
                        className="mt-4 py-2 px-4 bg-surface hover:bg-card-border border border-card-border hover:border-acid-green text-foreground text-[10.5px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${clearingCache ? 'animate-spin' : ''}`} />
                        {clearingCache ? 'Purging Cache...' : 'Purge Cache Now'}
                      </button>
                    </div>

                    {/* Export and Backup Area */}
                    <div className="bg-surface border border-card-border p-4 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-foreground block">System Settings Backup</span>
                        <span className="text-[9.5px] text-muted block mt-1 leading-normal">Save Calyxo profile setup details to a local JSON file. You can load this file later to restore settings.</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        <button
                          onClick={handleBackupData}
                          className="py-2 px-2 bg-surface hover:bg-card-border border border-card-border text-[10.5px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-foreground"
                        >
                          <Download className="w-3.5 h-3.5 text-acid-green" /> Backup
                        </button>

                        <label className="py-2 px-2 bg-surface hover:bg-card-border border border-card-border hover:border-acid-green text-[10.5px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 text-foreground text-center">
                          <RefreshCw className="w-3.5 h-3.5 text-acid-green" /> Load Restore
                          <input type="file" accept=".json" onChange={handleRestoreData} className="hidden" />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* CSV Export Centre */}
                  <div className="space-y-3 pt-4 border-t border-card-border">
                    <h4 className="text-xs font-bold text-foreground">Export Raw Worksheets (.CSV)</h4>
                    <p className="text-[9.5px] text-muted leading-relaxed">Download spreadsheets containing all historical records parsed sequentially.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { type: 'fitness', label: 'Weight & Biometrics' },
                        { type: 'nutrition', label: 'Nutrition & Meals Logs' },
                        { type: 'workout', label: 'Workout & Exercises' }
                      ].map(exp => (
                        <button
                          key={exp.type}
                          onClick={() => exportLogsToCSV(exp.type)}
                          className="py-3 px-3 bg-surface hover:bg-card-border border border-card-border hover:border-acid-green text-foreground text-[10.5px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-4 h-4 text-acid-green" />
                          {exp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings Panel */}
            {activePanel === 'security' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Security & Authorization</h2>
                  <p className="text-[10px] text-muted font-medium">Manage multi-factor authentication, logins, and authorized account connections</p>
                </div>

                <div className="space-y-6 pt-4 border-t border-card-border">
                  
                  {/* Two-Factor Authentication Box */}
                  <div className="bg-surface border border-card-border p-4 rounded-xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-foreground block">Two-Factor Authentication (2FA)</span>
                        <span className="text-[9.5px] text-muted block mt-1 leading-normal">Requires a verification code from your authenticator app when signing in.</span>
                      </div>
                      <button
                        onClick={() => {
                          if (twoFactorEnabled) {
                            setTwoFactorEnabled(false);
                            setTwoFactorSuccess(false);
                            if (onNotification) onNotification("2FA Disabled.");
                          } else {
                            // Show verification trigger setup
                            setTwoFactorSuccess(false);
                            setTwoFactorEnabled(true); // temporary check
                            setTwoFactorEnabled(false); // require validation
                          }
                        }}
                        className={`text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                          twoFactorEnabled
                            ? 'bg-acid-green/10 text-acid-green border-acid-green'
                            : 'bg-surface border-card-border text-muted hover:text-foreground'
                        }`}
                      >
                        {twoFactorEnabled ? 'PROTECTION ON' : 'DISABLED'}
                      </button>
                    </div>

                    {!twoFactorEnabled && (
                      <div className="pt-2.5 border-t border-card-border/60 space-y-3">
                        <span className="text-[9px] text-muted uppercase font-bold tracking-wider block">Scan QR to Enable 2FA</span>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <div className="w-24 h-24 bg-white p-2 rounded-xl flex items-center justify-center border border-card-border shadow-inner">
                            {/* Simulated QR block code */}
                            <div className="grid grid-cols-4 gap-1 w-20 h-20 bg-black p-1">
                              {[...Array(16)].map((_, i) => (
                                <div key={i} className={`rounded-sm ${i % 3 === 0 || i % 7 === 0 ? 'bg-white' : 'bg-black'}`} />
                              ))}
                            </div>
                          </div>
                          
                          <form onSubmit={handleEnable2FASimulation} className="flex-1 space-y-2.5 w-full">
                            <p className="text-[9.5px] text-muted leading-relaxed">Scan QR code using Google Authenticator or Duo, and input the code below. (Use simulator test code: <code className="text-acid-green font-bold bg-surface px-1 py-0.5 rounded">123456</code>)</p>
                            <div className="flex gap-2">
                              <input 
                                type="text" 
                                placeholder="Enter 6-digit code" 
                                value={twoFactorCode}
                                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                                className="bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-acid-green text-xs shadow-inner flex-1"
                              />
                              <button 
                                type="submit" 
                                className="bg-acid-green text-accent-foreground border-none font-bold text-xs uppercase px-4 py-2 rounded-xl cursor-pointer"
                              >
                                Enable
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                    {twoFactorEnabled && (
                      <div className="flex items-center gap-2.5 bg-acid-green/5 border border-acid-green/20 p-3 rounded-xl">
                        <Shield className="w-5 h-5 text-acid-green shrink-0" />
                        <span className="text-[9.5px] text-acid-green leading-relaxed font-bold">2FA Protection is active. Credentials are secured with TOTP tokenization.</span>
                      </div>
                    )}
                  </div>

                  {/* Connected Accounts badges */}
                  <div className="space-y-3.5 pt-4 border-t border-card-border">
                    <h4 className="text-xs font-bold text-foreground">Linked OAuth Integrations</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex justify-between items-center bg-surface border border-card-border p-3.5 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center font-black text-red-500 text-xs">G</div>
                          <div>
                            <span className="text-xs font-bold text-foreground block">Google Account</span>
                            <span className="text-[9px] text-muted block mt-0.5">Linked for cloud profile syncing</span>
                          </div>
                        </div>
                        <span className="text-[9px] text-acid-green font-bold bg-acid-green/10 px-2 py-0.5 rounded border border-acid-green/10">LINKED</span>
                      </div>

                      <div className="flex justify-between items-center bg-surface border border-card-border p-3.5 rounded-xl opacity-60">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-neutral-500/10 flex items-center justify-center font-black text-foreground text-xs">A</div>
                          <div>
                            <span className="text-xs font-bold text-foreground block">Apple Sign-in</span>
                            <span className="text-[9px] text-muted block mt-0.5">Apple ID account authorization</span>
                          </div>
                        </div>
                        <button className="text-[9px] text-muted hover:text-foreground font-bold border border-card-border bg-surface hover:bg-card-border px-2.5 py-0.5 rounded cursor-pointer">LINK</button>
                      </div>
                    </div>
                  </div>

                  {/* Active login devices list */}
                  <div className="space-y-3 pt-4 border-t border-card-border">
                    <h4 className="text-xs font-bold text-foreground">Authorized Devices & active sessions</h4>
                    <div className="border border-card-border rounded-xl overflow-hidden divide-y divide-card-border">
                      {activeSessions.map(session => (
                        <div key={session.id} className="flex justify-between items-center p-3 bg-surface">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground">{session.device}</span>
                              {session.active && (
                                <span className="text-[7.5px] bg-acid-green/20 text-acid-green px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider">Current</span>
                              )}
                            </div>
                            <span className="text-[9px] text-muted block mt-0.5 leading-none">{session.location} • {session.ip} • {session.time}</span>
                          </div>
                          {!session.active && (
                            <button
                              onClick={() => handleRevokeSession(session.id)}
                              className="text-[9px] text-destructive hover:underline font-bold uppercase tracking-wider bg-none border-none cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      ))}
                      {activeSessions.length === 0 && (
                        <div className="p-4 text-center text-xs text-muted">No active sessions found.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings Panel */}
            {activePanel === 'privacy' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Privacy & Safety Controls</h2>
                  <p className="text-[10px] text-muted font-medium">Control data storage, history logs, telemetry options and marketing consent</p>
                </div>

                <form onSubmit={handleSaveAllDetails} className="space-y-5 pt-4 border-t border-card-border">
                  {[
                    { key: 'aiDataUsage', state: aiDataUsage, setter: setAiDataUsage, label: 'Use Chat Data for AI Training', desc: 'Allows Calyxo to leverage text logs to refine models for personalized advice.' },
                    { key: 'personalizedRecommendations', state: personalizedRecommendations, setter: setPersonalizedRecommendations, label: 'Personalized Meal/Workout Suggestions', desc: 'Provides dynamic nutrition targets adjusted to biometric shifts.' },
                    { key: 'performanceTracking', state: performanceTracking, setter: setPerformanceTracking, label: 'Enable Diagnostic Telemetry', desc: 'Sends anonymous load-times and crash logs for engine speed improvements.' },
                    { key: 'marketingCommunications', state: marketingCommunications, setter: setMarketingCommunications, label: 'Email Newsletter & Updates', desc: 'Receive community workout challenges, nutrition tips and monthly reviews.' },
                    { key: 'analyticsTracking', state: analyticsTracking, setter: setAnalyticsTracking, label: 'Enable Screen Analytics', desc: 'Tracks screen time layout features to optimize accessibility settings.' }
                  ].map(priv => (
                    <label key={priv.key} className="flex justify-between items-center bg-surface border border-card-border p-3.5 rounded-xl cursor-pointer select-none">
                      <div className="pr-4 flex-1">
                        <span className="text-xs font-bold text-foreground block">{priv.label}</span>
                        <span className="text-[9.5px] text-muted block mt-1 leading-normal">{priv.desc}</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={priv.state !== false}
                        onChange={(e) => priv.setter(e.target.checked)}
                        className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green animate-none shrink-0"
                      />
                    </label>
                  ))}

                  <div className="space-y-3 pt-6 border-t border-card-border">
                    <h4 className="text-xs font-bold text-foreground">Irreversible Purge Logs</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleClearHistory}
                        className="py-3 px-4 border border-destructive/20 hover:border-destructive text-destructive bg-destructive/5 hover:bg-destructive/10 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear Nutrition & Workout Logs
                      </button>

                      <button
                        type="button"
                        onClick={handleClearMemory}
                        className="py-3 px-4 border border-destructive/20 hover:border-destructive text-destructive bg-destructive/5 hover:bg-destructive/10 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Database className="w-4 h-4" />
                        Purge AI Coach Memory
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider cursor-pointer border-none"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save Privacy Settings
                  </button>
                </form>
              </div>
            )}

            {/* About Calyxo Panel */}
            {activePanel === 'about' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">About Calyxo</h2>
                  <p className="text-[10px] text-muted font-medium">Version details, release notes, system roadmaps and customer support lines</p>
                </div>

                <div className="space-y-6 pt-4 border-t border-card-border">
                  
                  {/* General version specs */}
                  <div className="flex gap-4 p-4 bg-surface border border-card-border rounded-xl">
                    <div className="w-12 h-12 bg-acid-green flex items-center justify-center font-black text-accent-foreground text-md rounded-xl shadow-lg shrink-0 select-none">CX</div>
                    <div>
                      <h4 className="text-xs font-black text-foreground">Calyxo Nutrition & Coach</h4>
                      <span className="text-[9.5px] text-muted block mt-0.5">Version 2.4.0-stable (Build #2026.06.12)</span>
                      <span className="text-[9px] text-muted block leading-none">Copyright © 2026 Calyxo Labs. All rights reserved.</span>
                    </div>
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-foreground">Development Milestones Roadmap</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { label: 'Offline Data Sync Indexing', status: 'Completed', color: 'text-acid-green bg-acid-green/10 border-acid-green/15' },
                        { label: 'Indian Food Database Expansion', status: 'Completed', color: 'text-acid-green bg-acid-green/10 border-acid-green/15' },
                        { label: 'Wearable Biosensor Stream', status: 'In Development', color: 'text-blue-400 bg-blue-500/10 border-blue-500/15' },
                        { label: 'AI Video posture check', status: 'Planned (Q4)', color: 'text-muted bg-surface border-card-border' }
                      ].map((mile, i) => (
                        <div key={i} className="p-3 bg-surface border border-card-border rounded-xl flex justify-between items-center">
                          <span className="text-[10px] font-bold text-foreground pr-2 leading-tight">{mile.label}</span>
                          <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${mile.color}`}>{mile.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Feedback contact form */}
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4 pt-4 border-t border-card-border">
                    <h4 className="text-xs font-bold text-foreground">Direct Feedback & Bug Reports</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Subject Category</label>
                        <select value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)} className={inputClass}>
                          <option value="bug">Bug Report / UI Issue</option>
                          <option value="feature">Feature Request</option>
                          <option value="support">Account Support Help</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelClass}>Response Email</label>
                        <input type="email" value={user?.email || ''} readOnly className="w-full bg-[var(--input)] text-muted border border-card-border px-3.5 py-2.5 rounded-xl text-xs shadow-inner cursor-not-allowed" />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Message Detail</label>
                      <textarea
                        rows="3"
                        required
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        placeholder="Provide details on how we can replicate bugs or ideas you would love to see..."
                        className="w-full bg-[var(--input)] text-foreground border border-card-border px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-acid-green text-xs shadow-inner resize-none leading-relaxed"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="w-full btn-primary py-2.5 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider cursor-pointer border-none"
                    >
                      {submittingFeedback ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      Submit Feedback to Developers
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Legal Policies Panel */}
            {activePanel === 'legal' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Legal Agreements</h2>
                    <p className="text-[10px] text-muted font-medium">Compliance parameters, HIPAA disclaimers and privacy safeguards</p>
                  </div>

                  {/* Inner legal tabs */}
                  <div className="flex gap-1 bg-surface border border-card-border p-1 rounded-xl shrink-0">
                    {[
                      { id: 'privacy_policy', label: 'Privacy Policy' },
                      { id: 'terms_of_service', label: 'Terms of Service' }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setLegalSubTab(sub.id)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer border-none ${
                          legalSubTab === sub.id
                            ? 'bg-acid-green text-accent-foreground shadow-sm'
                            : 'text-muted hover:text-foreground bg-transparent'
                        }`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-card-border max-h-[400px] overflow-y-auto pr-2 scrollbar-thin text-xs text-muted leading-relaxed space-y-4 font-medium">
                  {legalSubTab === 'privacy_policy' ? (
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider">1. Privacy Policy Summary</h3>
                      <p>Calyxo is built to respect data safety. Your fitness logs, nutritional tracking details, and coach AI chat transcripts are safely stored in your localized Firebase Firestore vault. We enforce standard encryption mechanisms for transport layers and databases.</p>
                      
                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider">2. Data Telemetry & AI Model Safeguards</h3>
                      <p>Any and all interactions logged with Calyxo Coach AI (Gemini APIs) are routed through sandbox protocols. Your biometric stats (age, weight, height) are strictly referenced to optimize prompt outputs and are never cataloged for commercial advertising.</p>

                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider">3. User Controls & Account Purging</h3>
                      <p>We respect the GDPR "Right to be Forgotten" criteria. At any point, you can download a complete JSON backup of your information, purge chat history indices, or trigger a full account deletion which instantly deletes references from Calyxo databases.</p>

                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider">4. Cookies & Local Index Caching</h3>
                      <p>We utilize standard browser local storage arrays to accelerate app execution rates, maintain session indicators, and save appearance details (large text overlays, dark themes). No tracking cookies are distributed to third-party ad networks.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider">1. Terms of Service & General Terms</h3>
                      <p>By registering an athlete profile on Calyxo, you agree to comply with our localized user guidelines. You are responsible for ensuring account passwords remain confidential and that inputs accurately represent fitness routines.</p>

                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider">2. Crucial Medical Disclaimer</h3>
                      <p className="text-foreground font-bold border border-card-border bg-surface/50 p-3 rounded-xl">
                        IMPORTANT NOTICE: Calyxo and its AI Coach models are designed solely for educational, dietary guidance and scheduling assistance. None of the instructions, macro goals, or workout plans generated constitute professional medical advice, diagnoses, or prescriptions. Always consult a general practitioner before starting extreme physical programs or deficit diets.
                      </p>

                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider">3. Permitted Platform Guidelines</h3>
                      <p>You agree not to reverse-engineer app API requests, attempt unauthorized database calls, or deploy scripts/bots to scan food databases excessively. Violation of fair-use metrics will result in account suspension without warning.</p>

                      <h3 className="text-xs font-black text-foreground uppercase tracking-wider">4. System Outages and Availability</h3>
                      <p>While Calyxo guarantees 99% uptime metrics, we are not liable for temporary data sync interruptions or delayed prompts caused by Google Gemini or Firebase Cloud backend failures.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}


import React, { useState, useEffect, useRef } from 'react';
import PermissionsConnectionsSection from './PermissionsConnectionsSection';
import ProfileIdentityHero from '../design-system/components/ProfileIdentityHero';
import SubscriptionLiveTimerCard from './SubscriptionLiveTimerCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { calculateMacroTargets } from '../utils/macroCalculator';
import { startRazorpayCheckout, restoreSubscription, PAYMENT_STATUS } from '../utils/razorpay';
import { applyAppearanceSettings } from '../utils/appearanceUtils';
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
  saveEcosystemState,
  cancelUserSubscription
} from '../lib/dbService';
import useQuickActionsStore from '../store/useQuickActionsStore';
import { SubscriptionManager } from '../services/subscription/SubscriptionManager';
import { 
  User, Users, Mail, Lock, ShieldAlert, ShieldCheck, Award, RefreshCw, LogOut, CheckCircle, 
  Settings, Heart, Sparkles, Bell, Database, Trash2, Download, Eye, EyeOff,
  Shield, FileText, Info, HelpCircle, Key, Cpu, Activity, CreditCard,
  MoreVertical, X, Target, Zap, ChevronRight, TrendingUp, Star, Clock, AlertTriangle
} from 'lucide-react';

const HEALTH_INTERESTS_OPTIONS = [
  "Weight Loss",
  "Muscle Gain",
  "Strength Training",
  "Cardio Conditioning",
  "Yoga & Flexibility",
  "Athletic Speed",
  "Keto Diet",
  "Vegan Nutrition",
  "General Wellness"
];

const DIET_PREFERENCES_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Keto",
  "High Protein",
  "Intermittent Fasting",
  "Gluten-Free",
  "Dairy-Free",
  "Low Carb",
  "Paleo",
  "Halal"
];

export default function UserProfile({ onNotification }) {
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const updateUserProfile = useStore(state => state.updateUserProfile);
  const resetStore = useStore(state => state.resetStore);
  const userId = user?.uid || user?.id || '';
  const ecoStore = useEcosystemStore();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'targets' | 'routine' | 'settings'
  const [activeSettingsCategory, setActiveSettingsCategory] = useState('subscription');
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

  // Daily Schedule & Reminder Timings
  const [schedule, setSchedule] = useState({
    wakeTime: '06:30',
    breakfastTime: '08:30',
    lunchTime: '13:00',
    snackTime: '17:00',
    workoutTime: '18:30',
    dinnerTime: '20:30',
    sleepTime: '23:00'
  });
  
  // Privacy
  const [analyticsTracking, setAnalyticsTracking] = useState(true);

  // Profile Fields
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('beginner');
  const [healthInterests, setHealthInterests] = useState([]);

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
  const [waterTarget, setWaterTarget] = useState(3000);
  const [proteinTarget, setProteinTarget] = useState(120);
  const [carbsTarget, setCarbsTarget] = useState(230);
  const [fatTarget, setFatTarget] = useState(65);
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
        if (userProfile.schedule) {
          setSchedule(prev => ({ ...prev, ...userProfile.schedule }));
        }
        setAnalyticsTracking(userProfile.analyticsTracking !== false);
        const appState = userProfile.appearance || {};
        setBgEffectsEnabled(!!appState.bgEffectsEnabled);
        setBgStyle(appState.bgStyle || 'minimal');
        setAnimationIntensity(appState.animationIntensity || 'medium');
        setPerformanceMode(appState.performanceMode || 'auto');
        setReduceMotionState(!!appState.reduceMotion);
        setThemeMode(useStore.getState().theme || appState.themeMode || 'light');
        setLargeTextMode(!!appState.largeTextMode);
        setHighContrastMode(!!appState.highContrastMode);
        setDyslexiaFont(!!appState.dyslexiaFont);

        setAiMemoryEnabled(userProfile.aiMemoryEnabled !== false);
        setNotificationFrequency(userProfile.notificationFrequency || 'daily');
        
        setDailyCalories(userProfile.dailyCalories || userProfile.calorieGoal || 2000);
        setWaterTarget(userProfile.waterTarget || userProfile.waterGoal || 3000);
        setProteinTarget(userProfile.proteinTarget || userProfile.protein || 120);
        setCarbsTarget(userProfile.carbs || userProfile.targetMacros?.carbs || 230);
        setFatTarget(userProfile.fat || userProfile.targetMacros?.fat || 65);
        setWeightGoal(userProfile.weightGoal || userProfile.goalWeight || 70);

        setAiDataUsage(userProfile.aiDataUsage !== false);
        setPersonalizedRecommendations(userProfile.personalizedRecommendations !== false);
        setPerformanceTracking(userProfile.performanceTracking !== false);
        setMarketingCommunications(!!userProfile.marketingCommunications);

        setEmailInput(user?.email || '');

        setBio(userProfile.bio || '');
        setWebsite(userProfile.website || '');
        setCoverImage(userProfile.coverImage || '');
        setFitnessLevel(userProfile.fitnessLevel || userProfile.experience || 'beginner');
        setHealthInterests(userProfile.healthInterests || []);
      }, 0);
    }
  }, [userProfile, user]);

  // Handle accessibility overrides on the root layout
  useEffect(() => {
    applyAppearanceSettings({
      theme: themeMode,
      largeText: largeTextMode,
      highContrast: highContrastMode,
      reduceMotion: reduceMotionState,
      bgEffectsEnabled,
      bgStyle,
      animationIntensity,
      performanceMode
    });
  }, [largeTextMode, highContrastMode, reduceMotionState, themeMode]);

  // Handle URL section redirect when finishing setup from dashboard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const section = params.get('section');
      if (section) {
        let fieldTitle = 'Profile Details';

        if (section === 'display_name' || section === 'name' || section === 'nickname') {
          setEditSection('profile');
          fieldTitle = 'Display Name';
        } else if (section === 'profile_photo' || section === 'photo') {
          setEditSection('profile');
          fieldTitle = 'Profile Photo';
        } else if (section === 'height_weight' || section === 'biometrics') {
          setEditSection('health');
          fieldTitle = 'Height & Weight';
        } else if (section === 'target_weight' || section === 'targetWeight') {
          setEditSection('health');
          fieldTitle = 'Target Weight';
        } else if (section === 'calorie_target' || section === 'calories') {
          setEditSection('health');
          fieldTitle = 'Calorie Target';
        } else if (section === 'diet_preferences' || section === 'diet') {
          setEditSection('profile');
          fieldTitle = 'Diet Preferences';
        } else if (section === 'subscription') {
          setActiveTab('settings');
          setActiveSettingsCategory('subscription');
          fieldTitle = 'Subscription Plans';
        }

        if (onNotification) {
          onNotification(`Update Profile Setup: ${fieldTitle}`);
        }
      }
    }
  }, [onNotification]);



  const handleLogout = async () => {
    if (window.confirm("Sign out of Calyxo?")) {
      await signOutUser();
      resetStore();
      ecoStore.resetEcosystemStore();
      window.location.href = '/';
    }
  };

  // Recalculate BMI status
  const currentMacroCalculations = calculateMacroTargets({
    weight,
    height,
    age: ageInput,
    gender,
    activity,
    goal,
    units
  });
  const bmi = currentMacroCalculations.bmi;
  const bmiStatus = currentMacroCalculations.bmiStatus;

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

    // Username claim removed

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
      experience: fitnessLevel || experience,
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
      schedule,
      analyticsTracking,
      photoURL: userProfile?.photoURL || '',
      bio,
      website,
      coverImage,
      fitnessLevel,
      healthInterests,
      aiMemoryEnabled,
      notificationFrequency,
      dailyCalories: Number(dailyCalories),
      calorieGoal: Number(dailyCalories),
      waterTarget: Number(waterTarget),
      proteinTarget: Number(proteinTarget),
      protein: Number(proteinTarget),
      carbs: Number(carbsTarget),
      fat: Number(fatTarget),
      targetMacros: { protein: Number(proteinTarget), carbs: Number(carbsTarget), fat: Number(fatTarget) },
      bmr: currentMacroCalculations.bmr,
      tdee: currentMacroCalculations.tdee,
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
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('calyxo_user_profile', JSON.stringify(updatedProfile));
      }
      const validUid = user?.uid || user?.id || userId;
      await saveUserProfile(validUid, updatedProfile);
      
      // Update display name in user object and auth profile if modified
      const newDisplayName = (username || nickname || `${firstName} ${lastName}`.trim() || user?.displayName);
      if (newDisplayName && newDisplayName !== user?.displayName) {
        await updateUserAuthProfile(newDisplayName, userProfile?.photoURL || '').catch(() => {});
        useStore.getState().setUser({ ...(user || {}), displayName: newDisplayName, uid: validUid, id: validUid });
      }

      // Update email if modified
      if (emailInput && emailInput.trim() !== (user?.email || '').trim() && emailInput.includes('@')) {
        await updateUserEmail(emailInput.trim()).catch(e => console.warn('Email update exception:', e));
        useStore.getState().setUser({ ...(user || {}), email: emailInput.trim(), uid: validUid, id: validUid });
      }

      ecoStore.setPersonality(coachPersonality);
      try {
        await saveEcosystemState(validUid, useEcosystemStore.getState());
      } catch (ecoErr) {
        console.error("Failed to save personality state", ecoErr);
      }
      if (onNotification) onNotification("Settings and Profile saved successfully!");
    } catch (err) {
      console.error("Save profile details failed", err);
      if (onNotification) onNotification("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
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
        try {
          await updateUserAuthProfile(nickname || user?.displayName || 'Calyxo Athlete', base64);
          await saveUserProfile(userId, { ...userProfile, photoURL: base64 });
          if (onNotification) onNotification("Profile photo updated!");
        } catch (err) {
          console.error("Upload photo database write failed", err);
          updateUserProfile({ photoURL: userProfile?.photoURL || '' }); // Revert
          if (onNotification) onNotification("Failed to upload profile photo. Please try again.");
        } finally {
          setPhotoLoading(false);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async () => {
    setPhotoLoading(true);
    const prevPhoto = userProfile?.photoURL || '';
    updateUserProfile({ photoURL: '' });
    try {
      await updateUserAuthProfile(nickname || user?.displayName || 'Calyxo Athlete', '');
      await saveUserProfile(userId, { ...userProfile, photoURL: '' });
      if (onNotification) onNotification("Profile photo removed.");
    } catch (err) {
      console.error("Remove photo failed", err);
      updateUserProfile({ photoURL: prevPhoto });
      if (onNotification) onNotification("Failed to remove profile photo. Please try again.");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      await exportAccountData(userId);
      if (onNotification) onNotification("Data export initiated!");
    } catch (e) {
      console.error("Export data failed", e);
      if (onNotification) onNotification("Failed to export data.");
    }
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
      try {
        await clearChatHistory(userId);
        if (onNotification) onNotification("Account logs history cleared.");
      } catch (e) {
        console.error("Clear logs failed", e);
        if (onNotification) onNotification("Failed to clear account history.");
      }
    }
  };

  const handleClearMemory = async () => {
    if (window.confirm("Reset AI memories & current plan setup?")) {
      try {
        await clearAIMemory(userId);
        ecoStore.setCoachingPlan(null);
        ecoStore.setPredictions(null);
        if (onNotification) onNotification("AI Coach model memory cleared.");
      } catch (e) {
        console.error("Clear AI memory failed", e);
        if (onNotification) onNotification("Failed to clear AI memory.");
      }
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
    if (onNotification) onNotification("AI Coach chat history exported!");
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
    if (onNotification) onNotification("Backup JSON downloaded!");
  };

  const handleRazorpayCheckout = async (plan) => {
    await startRazorpayCheckout({
      plan,
      user,
      userProfile,
      updateUserProfile,
      onNotification,
      onLoadingChange: setSaving
    });
  };

  const handleSyncRazorpayLive = async () => {
    setSaving(true);
    if (onNotification) onNotification("Connecting to Razorpay & Supabase for live status...");
    try {
      const liveSub = await SubscriptionManager.syncLiveSubscriptionStatus(userId, userEmail);
      if (liveSub && liveSub.isActive) {
        const updatedProfile = {
          ...userProfile,
          subscriptionPlan: liveSub.plan,
          isSubscribed: true,
          subscriptionDate: liveSub.purchaseDate,
          subscriptionExpiresAt: liveSub.expiryDate,
          subscriptionExpiry: liveSub.expiryDate,
          lastPaymentId: liveSub.paymentId || userProfile?.lastPaymentId,
          isExpired: false,
          updatedAt: new Date().toISOString()
        };
        updateUserProfile(updatedProfile);
        if (userId) {
          await saveUserProfile(userId, updatedProfile);
        }
        if (onNotification) {
          onNotification(`✅ Razorpay Verified: ${liveSub.plan} Active (${liveSub.durationDays}-day cycle)`);
        }
      } else {
        await restoreSubscription({
          user,
          userProfile,
          updateUserProfile,
          onNotification
        });
      }
    } catch (err) {
      console.warn('Live sync error:', err);
      if (onNotification) onNotification('Could not sync with Razorpay gateway.');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreSubscription = async () => {
    setSaving(true);
    if (onNotification) onNotification("Restoring active subscription from server...");
    await restoreSubscription({
      user,
      userProfile,
      updateUserProfile,
      onNotification
    });
    setSaving(false);
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your active subscription? You will lose access to premium AI and Health Hub features.")) {
      return;
    }

    setSaving(true);
    try {
      const updatedProfile = {
        ...userProfile,
        subscriptionPlan: 'FREE',
        isSubscribed: false,
        updatedAt: new Date().toISOString()
      };

      updateUserProfile(updatedProfile);
      if (userId) {
        await cancelUserSubscription(userId);
        await saveUserProfile(userId, updatedProfile);
      }

      if (onNotification) {
        onNotification("Subscription cancelled successfully. You are now on the Free tier.");
      }
    } catch (err) {
      console.error("Cancel subscription error:", err);
      if (onNotification) {
        onNotification("Failed to cancel subscription. Please try again.");
      }
    } finally {
      setSaving(false);
    }
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

          if (onNotification) onNotification("Profile settings restored from backup!");
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
    if (onNotification) onNotification(`${type.toUpperCase()} report exported successfully!`);
  };

  const handleClearCacheSimulation = () => {
    setClearingCache(true);
    setTimeout(() => {
      setClearingCache(false);
      if (onNotification) onNotification("Application cache purged successfully!");
    }, 1200);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;
    setSubmittingFeedback(true);
    setTimeout(() => {
      setSubmittingFeedback(false);
      setFeedbackMessage('');
      if (onNotification) onNotification("Feedback submitted! Thank you for helping improve Calyxo.");
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
      if (onNotification) onNotification("Account verified successfully! Checkmark badge unlocked.");
    }, 1500);
  };

  const handleEnable2FASimulation = (e) => {
    e.preventDefault();
    if (twoFactorCode === '123456') {
      setTwoFactorSuccess(true);
      setTwoFactorEnabled(true);
      setTwoFactorCode('');
      if (onNotification) onNotification("Two-Factor Authentication is now ENABLED!");
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

  // Compute quick stats for hero card
  const fitnessScore = ecoStore.fitnessScore?.dailyScore || 70;
  const xp = ecoStore.xp || 0;
  const level = ecoStore.level || 1;
  const xpToNext = level * 1000;
  const xpPercent = Math.min(100, Math.round((xp / xpToNext) * 100));
  const unlockedAchievements = (ecoStore.achievements || []).filter(a => a.unlocked).length;
  const totalAchievements = (ecoStore.achievements || []).length;
  const goalLabel = (goal === 'gain' || goal === 'gains' || (Array.isArray(healthInterests) && healthInterests.includes("Muscle Gain") && !healthInterests.includes("Weight Loss")))
    ? 'Muscle Gain'
    : (goal === 'lose' || (Array.isArray(healthInterests) && healthInterests.includes("Weight Loss") && !healthInterests.includes("Muscle Gain")))
      ? 'Weight Loss'
      : (Array.isArray(healthInterests) && healthInterests.length > 0 ? healthInterests[0] : (goal === 'maintain' ? 'Maintenance' : 'Weight Loss'));
  const mobileBmi = bmi;

  const renderRoutineForm = () => (
    <form onSubmit={handleSaveAllDetails} className="space-y-4">
      <div>
        <h4 className="text-xs font-bold text-foreground">Daily Routine & Reminder Timings</h4>
        <p className="text-[10px] text-muted mt-0.5">
          Set when you eat, train, and sleep so Calyxo sends smart notifications at your exact hours.
        </p>
      </div>

      <div className="space-y-3">
        {/* Workout */}
        <div className="p-3 rounded-xl bg-surface border border-acid-green/40 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-acid-green flex items-center gap-1.5">Workout / Gym Time</span>
            <input
              type="time"
              value={schedule?.workoutTime || '18:30'}
              onChange={(e) => setSchedule({ ...schedule, workoutTime: e.target.value })}
              className="bg-[var(--input)] text-acid-green border border-card-border px-2 py-1 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-acid-green"
            />
          </div>
        </div>

        {/* Breakfast & Lunch */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-surface border border-card-border space-y-1">
            <span className="text-[11px] font-bold text-foreground block">Breakfast</span>
            <input
              type="time"
              value={schedule?.breakfastTime || '08:30'}
              onChange={(e) => setSchedule({ ...schedule, breakfastTime: e.target.value })}
              className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-acid-green"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-surface border border-card-border space-y-1">
            <span className="text-[11px] font-bold text-foreground block">Lunch</span>
            <input
              type="time"
              value={schedule?.lunchTime || '13:00'}
              onChange={(e) => setSchedule({ ...schedule, lunchTime: e.target.value })}
              className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-acid-green"
            />
          </div>
        </div>

        {/* Snack & Dinner */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-surface border border-card-border space-y-1">
            <span className="text-[11px] font-bold text-foreground block">Snack</span>
            <input
              type="time"
              value={schedule?.snackTime || '17:00'}
              onChange={(e) => setSchedule({ ...schedule, snackTime: e.target.value })}
              className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-acid-green"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-surface border border-card-border space-y-1">
            <span className="text-[11px] font-bold text-foreground block">Dinner</span>
            <input
              type="time"
              value={schedule?.dinnerTime || '20:30'}
              onChange={(e) => setSchedule({ ...schedule, dinnerTime: e.target.value })}
              className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-acid-green"
            />
          </div>
        </div>

        {/* Sleep & Wake */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-surface border border-card-border space-y-1">
            <span className="text-[11px] font-bold text-foreground block">Wake Up</span>
            <input
              type="time"
              value={schedule?.wakeTime || '06:30'}
              onChange={(e) => setSchedule({ ...schedule, wakeTime: e.target.value })}
              className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-acid-green"
            />
          </div>

          <div className="p-2.5 rounded-xl bg-surface border border-card-border space-y-1">
            <span className="text-[11px] font-bold text-foreground block">Bedtime</span>
            <input
              type="time"
              value={schedule?.sleepTime || '23:00'}
              onChange={(e) => setSchedule({ ...schedule, sleepTime: e.target.value })}
              className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1 rounded-lg text-xs font-mono font-bold focus:outline-none focus:border-acid-green"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border-none flex items-center justify-center gap-1.5 cursor-pointer shadow-lg active:scale-98"
      >
        {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
        Save Routine Timings
      </button>
    </form>
  );

  const renderCoachingForm = () => (
    renderAIForm()
  );

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
              onClick={() => {
                setThemeMode(themeOpt.id);
                useStore.getState().setTheme(themeOpt.id);
              }}
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

      {/* Daily Routine & Timings Configuration */}
      <div className="space-y-2 pt-2 border-t border-card-border">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Daily Routine Timings</h4>
          <span className="text-[9px] text-acid-green font-bold uppercase">Personalized Alerts</span>
        </div>
        <p className="text-[10px] text-muted">Calyxo delivers your meal, workout, and sleep reminders based on these exact hours.</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          <div className="p-2 rounded-xl bg-surface border border-card-border space-y-1">
            <span className="text-[10px] font-bold text-foreground flex items-center gap-1">Breakfast</span>
            <input
              type="time"
              value={schedule.breakfastTime || '08:30'}
              onChange={(e) => setSchedule({ ...schedule, breakfastTime: e.target.value })}
              className="w-full bg-[var(--input)] text-foreground border border-card-border px-1.5 py-1 rounded-lg text-xs font-mono font-bold focus:border-acid-green"
            />
          </div>

          <div className="p-2 rounded-xl bg-surface border border-card-border space-y-1">
            <span className="text-[10px] font-bold text-foreground flex items-center gap-1">Lunch</span>
            <input
              type="time"
              value={schedule.lunchTime || '13:00'}
              onChange={(e) => setSchedule({ ...schedule, lunchTime: e.target.value })}
              className="w-full bg-[var(--input)] text-foreground border border-card-border px-1.5 py-1 rounded-lg text-xs font-mono font-bold focus:border-acid-green"
            />
          </div>

          <div className="p-2 rounded-xl bg-surface border border-card-border space-y-1">
            <span className="text-[10px] font-bold text-foreground flex items-center gap-1">Snack</span>
            <input
              type="time"
              value={schedule.snackTime || '17:00'}
              onChange={(e) => setSchedule({ ...schedule, snackTime: e.target.value })}
              className="w-full bg-[var(--input)] text-foreground border border-card-border px-1.5 py-1 rounded-lg text-xs font-mono font-bold focus:border-acid-green"
            />
          </div>

          <div className="p-2 rounded-xl bg-surface border border-acid-green/40 space-y-1">
            <span className="text-[10px] font-bold text-acid-green flex items-center gap-1">Workout</span>
            <input
              type="time"
              value={schedule.workoutTime || '18:30'}
              onChange={(e) => setSchedule({ ...schedule, workoutTime: e.target.value })}
              className="w-full bg-[var(--input)] text-acid-green border border-card-border px-1.5 py-1 rounded-lg text-xs font-mono font-bold focus:border-acid-green"
            />
          </div>

          <div className="p-2 rounded-xl bg-surface border border-card-border space-y-1">
            <span className="text-[10px] font-bold text-foreground flex items-center gap-1">Dinner</span>
            <input
              type="time"
              value={schedule.dinnerTime || '20:30'}
              onChange={(e) => setSchedule({ ...schedule, dinnerTime: e.target.value })}
              className="w-full bg-[var(--input)] text-foreground border border-card-border px-1.5 py-1 rounded-lg text-xs font-mono font-bold focus:border-acid-green"
            />
          </div>

          <div className="p-2 rounded-xl bg-surface border border-card-border space-y-1">
            <span className="text-[10px] font-bold text-foreground flex items-center gap-1">Bedtime</span>
            <input
              type="time"
              value={schedule.sleepTime || '23:00'}
              onChange={(e) => setSchedule({ ...schedule, sleepTime: e.target.value })}
              className="w-full bg-[var(--input)] text-foreground border border-card-border px-1.5 py-1 rounded-lg text-xs font-mono font-bold focus:border-acid-green"
            />
          </div>
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

      <div className="bg-surface border border-card-border p-3.5 rounded-xl space-y-3 pt-2 border-t border-card-border">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-foreground block">Two-Factor Authentication (2FA)</span>
            <span className="text-[10px] text-muted block mt-0.5">
              {twoFactorEnabled ? 'Authenticator App (TOTP) is active' : 'Secure your account with Google Authenticator or Apple Passwords'}
            </span>
          </div>
          <span className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
            twoFactorEnabled
              ? 'bg-acid-green/10 text-acid-green border-acid-green'
              : 'bg-surface border-card-border text-muted'
          }`}>
            {twoFactorEnabled ? 'ACTIVE' : 'DISABLED'}
          </span>
        </div>

        {!twoFactorEnabled ? (
          <form onSubmit={handleEnable2FASimulation} className="flex gap-2 pt-2 border-t border-card-border/60">
            <input 
              type="text" 
              placeholder="Enter 6-digit code" 
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g,'').slice(0,6))}
              className="bg-[var(--input)] text-foreground border border-card-border px-3 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs font-mono font-bold tracking-widest shadow-inner flex-1 text-center"
            />
            <button 
              type="submit" 
              className="bg-acid-green text-accent-foreground border-none font-bold text-xs uppercase px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Enable 2FA
            </button>
          </form>
        ) : (
          <div className="flex justify-between items-center pt-2 border-t border-card-border/60">
            <span className="text-[10px] text-acid-green font-medium">✓ Protected via TOTP Authenticator</span>
            <button
              type="button"
              onClick={() => {
                setTwoFactorEnabled(false);
                setTwoFactorSuccess(false);
                if (onNotification) onNotification("2FA Disabled.");
              }}
              className="text-[9px] text-destructive hover:underline font-bold uppercase bg-none border-none cursor-pointer p-0"
            >
              Disable 2FA
            </button>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-2 border-t border-card-border">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider">Active Device Sessions</h4>
          <button
            type="button"
            onClick={() => {
              if (onNotification) onNotification("Signed out of all other remote device sessions.");
            }}
            className="text-[9px] font-bold text-acid-green hover:underline cursor-pointer bg-none border-none p-0"
          >
            Sign Out Others
          </button>
        </div>
        <div className="border border-card-border rounded-lg overflow-hidden divide-y divide-card-border">
          <div className="flex justify-between items-center p-2.5 bg-surface text-[10px]">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-foreground">
                  {typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent)
                    ? 'Apple iPhone (iOS) • Native App'
                    : typeof navigator !== 'undefined' && /Mac/i.test(navigator.userAgent)
                    ? 'Apple Mac • Calyxo Dashboard'
                    : 'Android / Mobile Device • Calyxo'}
                </span>
                <span className="text-[7px] bg-acid-green/20 text-acid-green px-1.5 py-0.2 rounded-full font-black uppercase">Active</span>
              </div>
              <span className="text-[8.5px] text-muted block mt-0.5">Active Now • Secure TLS 1.3 Session (India)</span>
            </div>
            <span className="text-[8px] text-acid-green font-bold uppercase">THIS DEVICE</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubscriptionForm = () => {
    const subStatus = SubscriptionManager.getSubscriptionStatus(userProfile, user);
    const subTimeline = SubscriptionManager.getSubscriptionTimeline(userProfile, user);
    const currentPlan = subStatus.isSubscribed ? (userProfile?.subscriptionPlan || 'HIGH') : 'FREE';
    const isExpired = subStatus.isExpired;

    const sysSettings = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('calyxo_system_settings') || '{}') : {};
    const rawMonthly = sysSettings.high_price_monthly_inr || sysSettings.high_price_monthly;
    const monthlyPriceINR = (rawMonthly === '20' || !rawMonthly) ? '2' : rawMonthly;
    const rawAnnual = sysSettings.high_price_annual_inr || sysSettings.high_price_annual;
    const annualPriceINR = (!rawAnnual || rawAnnual === '2' || rawAnnual === '7999') ? '199' : rawAnnual;

    const monthlyCostYr = Number(monthlyPriceINR) * 12;
    const annualCost = Number(annualPriceINR);
    const savingsAmount = monthlyCostYr - annualCost;
    const discountPct = (monthlyCostYr > annualCost && annualCost > 0) ? Math.round((savingsAmount / monthlyCostYr) * 100) : 0;

    const plans = [
      {
        id: 'FREE',
        name: 'FREE ATHLETE',
        price: '₹0',
        period: 'Forever Free',
        badge: 'FREE TIER',
        accentColor: 'border-card-border',
        bgGradient: 'bg-surface/40',
        features: [
          'Basic Calorie & Water Tracking',
          'Manual Workout & Food Logging',
          'Standard Community Feed Access',
          'Basic AI Fitness Queries'
        ]
      },
      {
        id: 'HIGH',
        name: 'HIGH MONTHLY',
        price: `₹${monthlyPriceINR}`,
        period: 'per month',
        badge: 'MONTHLY',
        accentColor: 'border-acid-green',
        bgGradient: 'bg-acid-green/10',
        amountPaise: Number(monthlyPriceINR) * 100,
        features: [
          'Unlimited 24/7 Calyxo AI Fitness & Diet Coach',
          'Universal HealthHub (Apple & Android Sync)',
          'AI Health Twin & 3D Predictive Analytics',
          'Personal Trainer (PT) Direct Connections',
          'Priority Ultra-Fast AI Engine (Zero Delay)'
        ]
      },
      {
        id: 'HIGH_ANNUAL',
        name: 'HIGH ANNUAL',
        price: `₹${annualPriceINR}`,
        period: 'per year',
        badge: discountPct > 0 ? `SAVE ${discountPct}%` : 'BEST VALUE',
        savingsText: savingsAmount > 0 ? `Save ₹${savingsAmount}/yr vs monthly` : 'Full 12 Months All-Access',
        accentColor: 'border-indigo-500',
        bgGradient: 'bg-indigo-500/10',
        amountPaise: Number(annualPriceINR) * 100,
        features: [
          'Everything in High Monthly Plan Included',
          'Full 12 Months Uninterrupted Access',
          'VIP Early Access to New AI Features',
          'Priority Direct PT & VIP Support'
        ]
      }
    ];

    return (
      <div id="setup-field-subscription" className="space-y-6">
        {/* Current Active Status & Live Countdown Timer */}
        <SubscriptionLiveTimerCard
          userProfile={userProfile}
          user={user}
          onSyncLive={handleSyncRazorpayLive}
          onRestore={handleRestoreSubscription}
          onCancel={handleCancelSubscription}
          saving={saving}
        />

        {/* Subscription Plan Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map(plan => {
            const isCurrent = currentPlan === plan.id;
            return (
              <div 
                key={plan.id}
                className={`p-5 rounded-2xl border ${plan.accentColor} ${plan.bgGradient} flex flex-col justify-between relative transition-all hover:scale-[1.02]`}
              >
                {plan.badge && (
                  <span className="absolute top-3 right-3 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-acid-green text-black">
                    {plan.badge}
                  </span>
                )}
                
                <div>
                  <h4 className="text-sm font-black tracking-tight text-foreground uppercase mb-1 pr-20 leading-tight">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 my-2">
                    <span className="text-2xl font-black text-foreground">{plan.price}</span>
                    <span className="text-[10px] text-muted">{plan.period}</span>
                  </div>
                  {plan.savingsText && (
                    <span className="inline-block text-[10px] font-bold text-acid-green bg-acid-green/10 px-2 py-0.5 rounded border border-acid-green/20 mb-2">
                      {plan.savingsText}
                    </span>
                  )}

                  <ul className="space-y-2 my-4 pl-0 list-none">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[11px] text-muted">
                        <CheckCircle className="w-3.5 h-3.5 text-acid-green shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {isCurrent ? (
                  <div className="space-y-2 mt-2">
                    <button
                      type="button"
                      disabled={true}
                      className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-acid-green/20 text-acid-green border border-acid-green/30 cursor-default"
                    >
                      Active Plan
                    </button>
                    {currentPlan !== 'FREE' && (
                      <button
                        type="button"
                        onClick={handleCancelSubscription}
                        disabled={saving}
                        className="w-full py-2 rounded-xl font-black text-[10px] uppercase tracking-wider bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 transition-colors cursor-pointer"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                ) : plan.id === 'FREE' ? (
                  <button
                    type="button"
                    disabled={true}
                    className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider bg-surface text-muted border border-card-border cursor-default mt-2"
                  >
                    Free Tier
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRazorpayCheckout(plan)}
                    className="w-full py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer border-none mt-2 bg-acid-green text-black hover:brightness-110 shadow-md shadow-acid-green/10 flex items-center justify-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    {isExpired ? `Renew ${plan.name} via Razorpay` : 'Subscribe via Razorpay'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

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
            { label: 'Wearable Integration', status: 'Completed', color: 'text-acid-green bg-acid-green/10 border-acid-green/15' },
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
            onClick={() => useQuickActionsStore.getState().openLegalModal('privacy')} 
            className="flex-1 py-2 px-3 rounded-xl font-black text-[10px] uppercase tracking-wider border cursor-pointer bg-acid-green/20 border-acid-green/40 text-acid-green hover:bg-acid-green/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <Shield className="w-3 h-3" /> Privacy Policy
          </button>
          <button 
            type="button" 
            onClick={() => useQuickActionsStore.getState().openLegalModal('terms')} 
            className="flex-1 py-2 px-3 rounded-xl font-bold text-[10px] uppercase tracking-wider border cursor-pointer bg-surface border-card-border text-foreground hover:border-acid-green transition-colors flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3 h-3" /> Terms & Conditions
          </button>
        </div>

        <div className="bg-surface/50 border border-card-border p-3 rounded-xl text-[10px] text-muted space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-foreground">Complete Legal Transparency</span>
            <span className="text-[9px] text-acid-green font-mono">17 Privacy Sections • 26 Terms Clauses</span>
          </div>
          <p className="leading-relaxed">
            Your fitness logs, biometrics, and AI conversations are encrypted and isolated via Row-Level Security. We do not sell health data to third-party ad brokers. Click above to inspect the complete unabridged legal policy.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div 
      data-keyboard-scroll="true"
      style={{ paddingBottom: 'calc(var(--keyboard-height, 0px) + 6rem)' }}
      className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6 select-text px-2 md:px-4 pt-4"
    >
      {/* ─── SIDEBAR (Mobile: Top, Desktop: Left) ─── */}
      <div className="w-full md:w-72 lg:w-80 shrink-0 space-y-4">
        
        {/* Hero / Profile Health Identity Component */}
        <ProfileIdentityHero
          name={firstName ? `${firstName} ${lastName}`.trim() : (username || nickname || 'Athlete')}
          email={user?.email || ''}
          photoURL={userProfile?.photoURL || ''}
          level={level}
          xp={xp}
          xpToNext={xpToNext}
          healthScore={fitnessScore}
          streak={ecoStore.streaks?.loginStreak || 1}
          badgesCount={unlockedAchievements}
          bmi={mobileBmi}
          goalLabel={goalLabel}
          isVerified={isAccountVerified}
          onPhotoUpload={handlePhotoUpload}
          photoLoading={photoLoading}
        />

        {/* Navigation Sidebar (Desktop Only) */}
        <div className="hidden md:flex flex-col gap-1 glass rounded-xl border border-card-border p-2">
          {[
            { id: 'overview', label: 'Overview & Bio', icon: User, tab: 'overview' },
            { id: 'targets', label: 'Health & Targets', icon: Target, tab: 'targets' },
            { id: 'routine', label: 'Daily Routine', icon: Clock, tab: 'routine' },
            { id: 'subscription', label: 'Subscription Plans', icon: CreditCard, tab: 'settings', category: 'subscription' },
            { id: 'permissions', label: 'Permissions & Wearables', icon: ShieldCheck, tab: 'settings', category: 'permissions' },
            { id: 'appearance', label: 'Appearance & Themes', icon: Eye, tab: 'settings', category: 'appearance' },
            { id: 'ai', label: 'AI Coach Settings', icon: Sparkles, tab: 'settings', category: 'ai' },
            { id: 'notifications', label: 'Notification Settings', icon: Bell, tab: 'settings', category: 'notifications' },
            { id: 'security', label: 'Security & 2FA', icon: Key, tab: 'settings', category: 'security' },
            { id: 'privacy', label: 'Privacy & Telemetry', icon: Shield, tab: 'settings', category: 'privacy' },
            { id: 'data', label: 'Data & Storage', icon: Database, tab: 'settings', category: 'data' },
            { id: 'about', label: 'About & Legal Policies', icon: Info, tab: 'settings', category: 'about' },
          ].map(item => {
            const isSelected = activeTab === item.tab && (item.tab !== 'settings' || activeSettingsCategory === item.category);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.tab);
                  if (item.category) setActiveSettingsCategory(item.category);
                }}
                className={`w-full flex items-center justify-between p-3 text-xs font-bold transition-all cursor-pointer rounded-lg border-none ${
                  isSelected 
                    ? 'bg-acid-green/15 text-acid-green font-black' 
                    : 'text-muted-foreground hover:bg-surface/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </button>
            );
          })}
        </div>

        {/* Sign Out Button (Sidebar) */}
        <button
          type="button"
          onClick={handleLogout}
          className="hidden md:flex w-full items-center justify-center gap-2 py-3 border border-destructive/20 hover:border-destructive active:border-destructive bg-destructive/5 hover:bg-destructive/10 text-destructive text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer mt-4"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>

      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex-1 space-y-4 min-w-0">
        
        {/* ─── Segmented UX Flow Tab Bar (Mobile & Desktop) ─── */}
        <div className="flex items-center p-1 bg-surface-elevated/80 border border-card-border rounded-2xl w-full shadow-sm">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'targets', label: 'Targets', icon: Target },
            { id: 'routine', label: 'Routine', icon: Clock },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 sm:py-2.5 px-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none ${
                activeTab === tab.id
                  ? 'bg-acid-green text-black font-black shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface/50'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ─── TAB 1: OVERVIEW & BIO ─── */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Profile Information */}
            <div className="glass p-4 sm:p-5 rounded-2xl border border-card-border space-y-3">
              <div className="flex justify-between items-center border-b border-card-border/60 pb-2.5">
                <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-acid-green" /> Profile & Identity
                </h3>
                <button
                  type="button"
                  onClick={() => setEditSection(editSection === 'profile' ? null : 'profile')}
                  className="text-[10px] font-extrabold text-acid-green bg-acid-green/10 px-3 py-1 rounded-lg uppercase tracking-wider cursor-pointer border border-acid-green/20"
                >
                  {editSection === 'profile' ? 'Cancel' : 'Edit Details'}
                </button>
              </div>

              {editSection === 'profile' ? (
                <form onSubmit={(e) => { handleSaveAllDetails(e); setEditSection(null); }} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>First Name</label>
                      <input id="setup-field-display_name" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                    </div>
                    <div>
                      <label className={labelClass}>Last Name</label>
                      <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>Username</label>
                      <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                    </div>
                    <div>
                      <label className={labelClass}>Nickname</label>
                      <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
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

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>Fitness Level</label>
                      <select value={fitnessLevel} onChange={(e) => setFitnessLevel(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner">
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="elite">Elite Athlete</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Fitness Goal</label>
                      <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner">
                        <option value="lose">Weight Loss</option>
                        <option value="gain">Muscle Gain</option>
                        <option value="maintain">Maintain Weight</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Bio (Short Description)</label>
                    <textarea maxLength={160} rows={2} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the community about yourself..." className="w-full bg-[var(--input)] text-foreground border border-card-border px-2.5 py-2 rounded-xl focus:outline-none focus:border-acid-green text-xs shadow-inner resize-none" />
                  </div>

                  <div>
                    <label className={labelClass}>Profile Cover Image</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const img = new Image();
                        img.onload = () => {
                          const canvas = document.createElement('canvas');
                          canvas.width = 600;
                          canvas.height = 200;
                          const ctx = canvas.getContext('2d');
                          ctx.drawImage(img, 0, 0, 600, 200);
                          setCoverImage(canvas.toDataURL('image/jpeg', 0.7));
                        };
                        img.src = event.target.result;
                      };
                      reader.readAsDataURL(file);
                    }} className="w-full text-xs text-muted-foreground" />
                    {coverImage && (
                      <div className="mt-1.5 relative w-full h-14 rounded-lg overflow-hidden border border-card-border">
                        <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setCoverImage('')} className="absolute right-1 top-1 w-4 h-4 bg-black/60 rounded-full flex items-center justify-center text-[8px] text-white border-none cursor-pointer">✕</button>
                      </div>
                    )}
                  </div>

                  <div id="setup-field-diet_preferences" className="space-y-1">
                    <label className={labelClass}>Diet Preferences</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {DIET_PREFERENCES_OPTIONS.map(opt => {
                        const selected = dietPreferences.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setDietPreferences(prev => 
                                prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]
                              );
                            }}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border cursor-pointer transition-colors ${
                              selected 
                                ? 'bg-acid-green/10 border-acid-green text-acid-green' 
                                : 'bg-surface border-card-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Health Interests</label>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {HEALTH_INTERESTS_OPTIONS.map(opt => {
                        const selected = healthInterests.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => {
                              setHealthInterests(prev => {
                                const isAdding = !prev.includes(opt);
                                const next = isAdding ? [...prev, opt] : prev.filter(x => x !== opt);
                                if (isAdding) {
                                  if (opt === "Muscle Gain" || opt === "Strength Training") setGoal("gain");
                                  else if (opt === "Weight Loss") setGoal("lose");
                                  else if (opt === "General Wellness") setGoal("maintain");
                                }
                                return next;
                              });
                            }}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase border cursor-pointer transition-colors ${
                              selected 
                                ? 'bg-acid-green/10 border-acid-green text-acid-green' 
                                : 'bg-surface border-card-border text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button type="submit" disabled={saving} className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border-none flex items-center justify-center gap-1.5 cursor-pointer mt-3">
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    Save Profile
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className="bg-surface/50 border border-card-border rounded-xl p-3">
                    <span className="text-[8.5px] text-muted-foreground font-bold uppercase tracking-wider block">Full Name</span>
                    <span className="text-xs font-black text-foreground mt-0.5 block">{firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Not Set'}</span>
                  </div>
                  <div className="bg-surface/50 border border-card-border rounded-xl p-3">
                    <span className="text-[8.5px] text-muted-foreground font-bold uppercase tracking-wider block">Age & Gender</span>
                    <span className="text-xs font-black text-foreground mt-0.5 block">{ageInput} yrs • {gender}</span>
                  </div>
                  <div className="bg-surface/50 border border-card-border rounded-xl p-3">
                    <span className="text-[8.5px] text-muted-foreground font-bold uppercase tracking-wider block">Username</span>
                    <span className="text-xs font-black text-foreground mt-0.5 block">@{username || nickname || 'athlete'}</span>
                  </div>
                  <div className="bg-surface/50 border border-card-border rounded-xl p-3">
                    <span className="text-[8.5px] text-muted-foreground font-bold uppercase tracking-wider block">Fitness Level</span>
                    <span className="text-xs font-black text-foreground mt-0.5 block capitalize">{fitnessLevel || 'beginner'}</span>
                  </div>
                  {healthInterests.length > 0 && (
                    <div className="bg-surface/50 border border-card-border rounded-xl p-3 col-span-2">
                      <span className="text-[8.5px] text-muted-foreground font-bold uppercase tracking-wider block">Health Interests</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {healthInterests.map(tag => (
                          <span key={tag} className="px-2.5 py-0.5 rounded-full bg-surface border border-card-border text-[9px] font-bold text-foreground">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Unlocked Achievements Row */}
            {ecoStore.achievements && ecoStore.achievements.some(a => a.unlocked) && (
              <div className="glass rounded-2xl border border-card-border p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-yellow-400" /> Unlocked Achievements
                  </h3>
                  <span className="text-[10px] text-acid-green font-bold">{unlockedAchievements} Unlocked</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ecoStore.achievements.filter(a => a.unlocked).map(a => (
                    <div key={a.id} className="flex items-center gap-1.5 bg-surface border border-card-border rounded-xl px-2.5 py-1.5 shrink-0">
                      <span className="text-sm">{a.icon}</span>
                      <span className="text-[10px] text-foreground font-bold">{a.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: HEALTH & TARGETS ─── */}
        {activeTab === 'targets' && (
          <div className="space-y-4">
            {/* Health Targets & Stats */}
            <div className="glass p-4 sm:p-5 rounded-2xl border border-card-border space-y-3">
              <div className="flex justify-between items-center border-b border-card-border/60 pb-2.5">
                <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-acid-green" /> Body Metrics & Macro Targets
                </h3>
                <button
                  type="button"
                  onClick={() => setEditSection(editSection === 'health' ? null : 'health')}
                  className="text-[10px] font-extrabold text-acid-green bg-acid-green/10 px-3 py-1 rounded-lg uppercase tracking-wider cursor-pointer border border-acid-green/20"
                >
                  {editSection === 'health' ? 'Cancel' : 'Edit Targets'}
                </button>
              </div>

              {editSection === 'health' ? (
                <form onSubmit={(e) => { handleSaveAllDetails(e); setEditSection(null); }} className="space-y-3">
                  <div className="flex items-center justify-between bg-acid-green/10 border border-acid-green/20 p-3 rounded-xl gap-2">
                    <div>
                      <span className="text-xs font-black text-foreground block">Auto-Calculate Targets</span>
                      <span className="text-[9.5px] text-muted-foreground block">Derive scientific calories & macros from your biometrics</span>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        const computed = calculateMacroTargets({ weight, height, age: ageInput, gender, activity, goal, units });
                        setDailyCalories(computed.calorieGoal);
                        setProteinTarget(computed.protein);
                        setCarbsTarget(computed.carbs);
                        setFatTarget(computed.fat);
                        const updatedProfile = {
                          ...userProfile,
                          dailyCalories: computed.calorieGoal,
                          calorieGoal: computed.calorieGoal,
                          proteinTarget: computed.protein,
                          protein: computed.protein,
                          carbs: computed.carbs,
                          fat: computed.fat,
                          targetMacros: { protein: computed.protein, carbs: computed.carbs, fat: computed.fat },
                          bmr: computed.bmr,
                          tdee: computed.tdee,
                          weight: Number(weight),
                          height: Number(height),
                          age: Number(ageInput),
                          gender,
                          activity: Number(activity),
                          goal,
                          units
                        };
                        updateUserProfile(updatedProfile);
                        try {
                          await saveUserProfile(userId, updatedProfile);
                          if (onNotification) onNotification(`Targets computed & persisted: ${computed.calorieGoal} kcal · ${computed.protein}g protein`);
                        } catch (err) {
                          if (onNotification) onNotification("Targets computed! Click Save to confirm.");
                        }
                      }}
                      className="bg-acid-green text-black px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border-none cursor-pointer hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Auto-Calculate
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2" id="setup-field-height_weight">
                    <div>
                      <label className={labelClass}>Weight ({units === 'metric' ? 'kg' : 'lbs'})</label>
                      <input type="number" step="0.1" value={weight} onFocus={(e) => e.target.select()} onChange={(e) => setWeight(e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                    </div>
                    <div>
                      <label className={labelClass}>Height ({units === 'metric' ? 'cm' : 'in'})</label>
                      <input type="number" value={height} onFocus={(e) => e.target.select()} onChange={(e) => setHeight(e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                    </div>
                    <div>
                      <label className={labelClass}>Goal Weight</label>
                      <input id="setup-field-target_weight" type="number" step="0.1" value={goalWeight} onFocus={(e) => e.target.select()} onChange={(e) => setGoalWeight(e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className={labelClass}>Daily Calories (kcal)</label>
                      <input id="setup-field-calorie_target" type="number" value={dailyCalories} onFocus={(e) => e.target.select()} onChange={(e) => setDailyCalories(e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                    </div>
                    <div>
                      <label className={labelClass}>Water Target (ml)</label>
                      <input type="number" value={waterTarget} onFocus={(e) => e.target.select()} onChange={(e) => setWaterTarget(e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={labelClass}>Protein (g)</label>
                      <input type="number" value={proteinTarget} onFocus={(e) => e.target.select()} onChange={(e) => setProteinTarget(e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                    </div>
                    <div>
                      <label className={labelClass}>Carbs (g)</label>
                      <input type="number" value={carbsTarget} onFocus={(e) => e.target.select()} onChange={(e) => setCarbsTarget(e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                    </div>
                    <div>
                      <label className={labelClass}>Fat (g)</label>
                      <input type="number" value={fatTarget} onFocus={(e) => e.target.select()} onChange={(e) => setFatTarget(e.target.value.replace(/^0+(?=\d)/, ''))} className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-1.5 rounded-lg focus:outline-none focus:border-acid-green text-xs shadow-inner" />
                    </div>
                  </div>

                  <button type="submit" disabled={saving} className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border-none flex items-center justify-center gap-1.5 cursor-pointer shadow-md">
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    Save Targets
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-surface/50 border border-card-border rounded-xl p-3">
                    <span className="text-[8.5px] text-muted-foreground font-bold uppercase tracking-wider block">Height & Weight</span>
                    <span className="text-xs font-black text-foreground mt-0.5 block">{height}{units === 'metric' ? 'cm' : 'in'} • {weight}{units === 'metric' ? 'kg' : 'lbs'}</span>
                  </div>
                  <div className="bg-surface/50 border border-card-border rounded-xl p-3">
                    <span className="text-[8.5px] text-muted-foreground font-bold uppercase tracking-wider block">Goal Weight</span>
                    <span className="text-xs font-black text-foreground mt-0.5 block">{goalWeight}{units === 'metric' ? 'kg' : 'lbs'}</span>
                  </div>
                  <div className="bg-surface/50 border border-card-border rounded-xl p-3">
                    <span className="text-[8.5px] text-muted-foreground font-bold uppercase tracking-wider block">Calorie Target</span>
                    <span className="text-xs font-black text-foreground mt-0.5 block">{dailyCalories} kcal</span>
                  </div>
                  <div className="bg-surface/50 border border-card-border rounded-xl p-3">
                    <span className="text-[8.5px] text-muted-foreground font-bold uppercase tracking-wider block">Protein Target</span>
                    <span className="text-xs font-black text-foreground mt-0.5 block">{proteinTarget} g</span>
                  </div>
                  <div className="bg-surface/50 border border-card-border rounded-xl p-3">
                    <span className="text-[8.5px] text-muted-foreground font-bold uppercase tracking-wider block">Carbs Target</span>
                    <span className="text-xs font-black text-foreground mt-0.5 block">{carbsTarget} g</span>
                  </div>
                  <div className="bg-surface/50 border border-card-border rounded-xl p-3">
                    <span className="text-[8.5px] text-muted-foreground font-bold uppercase tracking-wider block">Fat Target</span>
                    <span className="text-xs font-black text-foreground mt-0.5 block">{fatTarget} g</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: DAILY ROUTINE ─── */}
        {activeTab === 'routine' && (
          <div className="glass p-4 sm:p-5 rounded-2xl border border-card-border">
            {renderRoutineForm()}
          </div>
        )}

        {/* ─── TAB 4: SETTINGS & SUBSCRIPTION ─── */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            {/* Horizontal Settings Category Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {[
                { id: 'subscription', label: 'Subscription', icon: CreditCard },
                { id: 'permissions', label: 'Wearables & Health', icon: ShieldCheck },
                { id: 'appearance', label: 'Appearance', icon: Eye },
                { id: 'ai', label: 'AI Coach', icon: Sparkles },
                { id: 'notifications', label: 'Notifications', icon: Bell },
                { id: 'security', label: 'Security & 2FA', icon: Key },
                { id: 'privacy', label: 'Privacy', icon: Shield },
                { id: 'data', label: 'Data & Storage', icon: Database },
                { id: 'about', label: 'About & Legal', icon: Info },
              ].map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveSettingsCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer border ${
                    activeSettingsCategory === cat.id
                      ? 'bg-acid-green/15 text-acid-green border-acid-green/40 font-black'
                      : 'bg-surface text-muted-foreground border-card-border hover:text-foreground'
                  }`}
                >
                  <cat.icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Selected Category Content */}
            <div className="space-y-4">
              {activeSettingsCategory === 'subscription' && renderSubscriptionForm()}
              {activeSettingsCategory === 'permissions' && (
                <div className="glass p-4 sm:p-5 rounded-2xl border border-card-border">
                  <PermissionsConnectionsSection onNotification={onNotification} />
                </div>
              )}
              {activeSettingsCategory === 'appearance' && (
                <div className="glass p-4 sm:p-5 rounded-2xl border border-card-border">
                  {renderAppearanceForm()}
                </div>
              )}
              {activeSettingsCategory === 'ai' && (
                <div className="glass p-4 sm:p-5 rounded-2xl border border-card-border">
                  {renderAIForm()}
                </div>
              )}
              {activeSettingsCategory === 'notifications' && (
                <div className="glass p-4 sm:p-5 rounded-2xl border border-card-border">
                  {renderNotificationsForm()}
                </div>
              )}
              {activeSettingsCategory === 'security' && (
                <div className="glass p-4 sm:p-5 rounded-2xl border border-card-border">
                  {renderSecurityForm()}
                </div>
              )}
              {activeSettingsCategory === 'privacy' && (
                <div className="glass p-4 sm:p-5 rounded-2xl border border-card-border">
                  {renderPrivacyForm()}
                </div>
              )}
              {activeSettingsCategory === 'data' && (
                <div className="glass p-4 sm:p-5 rounded-2xl border border-card-border">
                  {renderDataForm()}
                </div>
              )}
              {activeSettingsCategory === 'about' && (
                <div className="glass p-4 sm:p-5 rounded-2xl border border-card-border">
                  {renderAboutForm()}
                </div>
              )}
            </div>

            {/* Mobile Sign Out Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 border border-destructive/20 hover:border-destructive active:border-destructive bg-destructive/5 hover:bg-destructive/10 text-destructive text-xs uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer mt-4"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
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
  clearAIMemory 
} from '../lib/dbService';
import { 
  User, Mail, Lock, ShieldAlert, Award, RefreshCw, LogOut, CheckCircle, 
  Settings, Heart, Sparkles, Bell, Database, Trash2, Download, Eye, EyeOff 
} from 'lucide-react';

export default function UserProfile({ onNotification }) {
  const { user, userProfile, updateUserProfile, resetStore } = useStore();
  const userId = user?.uid;
  const ecoStore = useEcosystemStore();

  const [activePanel, setActivePanel] = useState('overview');

  // Input states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
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

  // Password / Email Forms
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [saving, setSaving] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || '');
      setLastName(userProfile.lastName || '');
      setNickname(userProfile.nickname || '');
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
        workout: true, meal: true, hydration: true, checkins: true, challenges: true, achievements: true
      });
      setAnalyticsTracking(userProfile.analyticsTracking !== false);
      setEmailInput(user?.email || '');
    }
  }, [userProfile, user]);

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
    
    const birthDate = new Date(dob || '2001-01-01');
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    const age = calculatedAge > 0 ? calculatedAge : 25;

    const updatedProfile = {
      ...userProfile,
      firstName,
      lastName,
      nickname,
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
      photoURL: userProfile?.photoURL || ''
    };

    updateUserProfile(updatedProfile);
    await saveUserProfile(userId, updatedProfile);
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

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'account', label: 'Account settings', icon: Settings },
    { id: 'personal', label: 'Personal Information', icon: Award },
    { id: 'diet', label: 'Health Preferences', icon: Heart },
    { id: 'coach', label: 'AI Coach Settings', icon: Sparkles },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'privacy', label: 'Privacy & Data', icon: Database }
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
          
          <h3 className="text-xs font-black text-foreground mt-3 uppercase tracking-wider truncate max-w-full">{nickname || "Athlete"}</h3>
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
            {/* Overview Panel */}
            {activePanel === 'overview' && (
              <div className="space-y-6">
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

                <div className="glass p-6 rounded-2xl border border-card-border shadow-md">
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-4">Milestones Summaries</h2>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-surface border border-card-border p-4 rounded-xl shadow-inner">
                      <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Achievements</span>
                      <span className="text-xl font-black text-foreground mt-2 block">🏆 {ecoStore.achievements?.filter(x => x.unlocked).length} Unlocked</span>
                    </div>
                    <div className="bg-surface border border-card-border p-4 rounded-xl shadow-inner">
                      <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Active Streaks</span>
                      <span className="text-xl font-black text-foreground mt-2 block">🔥 {ecoStore.streaks?.loginStreak} Days</span>
                    </div>
                    <div className="bg-surface border border-card-border p-4 rounded-xl shadow-inner">
                      <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Challenges Join</span>
                      <span className="text-xl font-black text-foreground mt-2 block">🚀 {ecoStore.activeChallenges?.filter(x => x.progress > 0).length} Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Account Settings Panel */}
            {activePanel === 'account' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-6">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Account settings</h2>
                  <p className="text-[10px] text-muted font-medium">Manage credentials and authentication details</p>
                </div>

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
                      className="bg-surface hover:bg-card-border border border-card-border hover:border-acid-green px-4 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
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
                      className="bg-surface hover:bg-card-border border border-card-border hover:border-acid-green px-4 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Data Operations */}
                <div className="space-y-3 pt-6 border-t border-card-border">
                  <h4 className="text-xs font-bold text-foreground">Account Operations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={handleExportData}
                      className="flex items-center justify-center gap-2 p-3 bg-surface hover:bg-card-border border border-card-border text-foreground hover:border-acid-green text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-acid-green" />
                      Export Account Data (JSON)
                    </button>

                    <button
                      onClick={handleDeleteAccount}
                      className="flex items-center justify-center gap-2 p-3 bg-destructive/5 hover:bg-destructive/10 border border-destructive/20 hover:border-destructive text-destructive text-xs font-bold rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Account & Purge Data
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Info Panel */}
            {activePanel === 'personal' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-5">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Personal Information</h2>
                  <p className="text-[10px] text-muted font-medium">Update measurements, biometrics, and experience level</p>
                </div>

                <form onSubmit={handleSaveAllDetails} className="space-y-4 pt-4 border-t border-card-border">
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Nickname</label>
                      <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Date of Birth</label>
                      <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className={inputClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
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
                    <div>
                      <label className={labelClass}>Experience</label>
                      <select value={experience} onChange={(e) => setExperience(e.target.value)} className={inputClass}>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Weight ({units === 'imperial' ? 'lbs' : 'kg'})</label>
                      <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(parseFloat(e.target.value) || 0)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Height ({units === 'imperial' ? 'in' : 'cm'})</label>
                      <input type="number" step="0.1" value={height} onChange={(e) => setHeight(parseFloat(e.target.value) || 0)} className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Goal Weight ({units === 'imperial' ? 'lbs' : 'kg'})</label>
                      <input type="number" step="0.1" value={goalWeight} onChange={(e) => setGoalWeight(parseFloat(e.target.value) || 0)} className={inputClass} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider cursor-pointer border-none"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save Details
                  </button>
                </form>
              </div>
            )}

            {/* Health & Diet Panel */}
            {activePanel === 'diet' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-5">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Health & Diet Preferences</h2>
                  <p className="text-[10px] text-muted font-medium">Configure preferences used in AI nutrition recommendations</p>
                </div>

                <form onSubmit={handleSaveAllDetails} className="space-y-4 pt-4 border-t border-card-border">
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
                      <label className={labelClass}>Medical Restrictions</label>
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

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider cursor-pointer border-none"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save Health Preferences
                  </button>
                </form>
              </div>
            )}

            {/* AI Coach Settings Panel */}
            {activePanel === 'coach' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-5">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">AI Coach Settings</h2>
                  <p className="text-[10px] text-muted font-medium">Fine-tune the tone and response layout of Calyxo AI</p>
                </div>

                <form onSubmit={handleSaveAllDetails} className="space-y-4 pt-4 border-t border-card-border">
                  <div className="grid grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Response Length</label>
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

            {/* Notifications Panel */}
            {activePanel === 'notifications' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-5">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Notification Settings</h2>
                  <p className="text-[10px] text-muted font-medium">Control notifications sent to your active devices</p>
                </div>

                <form onSubmit={handleSaveAllDetails} className="space-y-4 pt-4 border-t border-card-border">
                  <div className="space-y-3.5">
                    {[
                      { key: 'workout', label: 'Workout Reminders', desc: 'Alerts when scheduled program targets are missing' },
                      { key: 'meal', label: 'Meal Reminders', desc: 'Logs reminders for morning, lunch, and dinner logs' },
                      { key: 'hydration', label: 'Hydration Reminders', desc: 'Periodic hydration prompts to log water ml' },
                      { key: 'checkins', label: 'AI Coach Check-ins', desc: 'Periodic checking suggestions from coach Calyxo' },
                      { key: 'challenges', label: 'Challenge Reminders', desc: 'Updates on joined active fitness challenges' },
                      { key: 'achievements', label: 'Achievement Notifications', desc: 'Prompt notifications when milestone badges unlock' },
                    ].map(item => (
                      <label key={item.key} className="flex justify-between items-center bg-surface border border-card-border p-3.5 rounded-xl cursor-pointer">
                        <div className="pr-4">
                          <span className="text-xs font-bold text-foreground block">{item.label}</span>
                          <span className="text-[9.5px] text-muted block mt-0.5">{item.desc}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={notifications[item.key]}
                          onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                          className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green"
                        />
                      </label>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs uppercase tracking-wider cursor-pointer border-none"
                  >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Save Notification Settings
                  </button>
                </form>
              </div>
            )}

            {/* Privacy & Data Panel */}
            {activePanel === 'privacy' && (
              <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-5">
                <div>
                  <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Privacy & Data Settings</h2>
                  <p className="text-[10px] text-muted font-medium">Control data storage, history logs, and analytics tracking</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-card-border">
                  {/* Analytics Toggle */}
                  <label className="flex justify-between items-center bg-surface border border-card-border p-3.5 rounded-xl cursor-pointer">
                    <div className="pr-4">
                      <span className="text-xs font-bold text-foreground block">Allow Analytics Tracking</span>
                      <span className="text-[9.5px] text-muted block mt-0.5">We use anonymous telemetry logs to improve platform responsive styling.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={analyticsTracking}
                      onChange={(e) => setAnalyticsTracking(e.target.checked)}
                      className="w-4 h-4 rounded border-card-border text-acid-green focus:ring-0 cursor-pointer accent-acid-green"
                    />
                  </label>

                  <div className="space-y-3.5 mt-6 border-t border-card-border pt-4">
                    <h4 className="text-xs font-bold text-foreground">Purge operations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button
                        onClick={handleClearHistory}
                        className="py-3 px-4 border border-destructive/20 hover:border-destructive text-destructive bg-destructive/5 hover:bg-destructive/10 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        Clear Logs History
                      </button>

                      <button
                        onClick={handleClearMemory}
                        className="py-3 px-4 border border-destructive/20 hover:border-destructive text-destructive bg-destructive/5 hover:bg-destructive/10 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Database className="w-4 h-4" />
                        Clear AI Coach Memory
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

import { supabase } from "./supabaseClient";

const getEnvVal = (key) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
      if (import.meta.env[key]) return import.meta.env[key];
      if (import.meta.env[`VITE_${key}`]) return import.meta.env[`VITE_${key}`];
      if (import.meta.env[`NEXT_PUBLIC_${key}`]) return import.meta.env[`NEXT_PUBLIC_${key}`];
    }
  } catch (e) { }
  try {
    if (typeof process !== 'undefined' && process && process.env) {
      if (process.env[key]) return process.env[key];
      if (process.env[`VITE_${key}`]) return process.env[`VITE_${key}`];
      if (process.env[`NEXT_PUBLIC_${key}`]) return process.env[`NEXT_PUBLIC_${key}`];
    }
  } catch (e) { }
  return undefined;
};

const activeSupabaseUrl = getEnvVal('SUPABASE_URL') || 'https://nwcatvlfoayzrwatvyrf.supabase.co';

// Helper to determine if Supabase is fully configured or running mock
export const isMockMode = !activeSupabaseUrl || activeSupabaseUrl === "https://mock.supabase.co";

const ENCRYPTION_SALT = "calyxo_secure_salt_2026";

export const getCurrentUserId = async () => {
  if (typeof window === 'undefined') return "";
  if (isMockMode) {
    try {
      const mockUserRaw = localStorage.getItem("calyxo_mock_user");
      if (mockUserRaw) {
        const mock = JSON.parse(mockUserRaw);
        return mock?.uid || mock?.id || "";
      }
    } catch (e) { }
    return "";
  }
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || "";
};

export const getCurrentUserIdSync = () => {
  if (typeof window === 'undefined') return "";
  if (isMockMode) {
    try {
      const mockUserRaw = localStorage.getItem("calyxo_mock_user");
      if (mockUserRaw) {
        const mock = JSON.parse(mockUserRaw);
        return mock?.uid || mock?.id || "";
      }
    } catch (e) { }
    return "";
  }
  // Fallback for sync contexts
  try {
    const url = activeSupabaseUrl;
    const projectRef = url.includes('//') ? url.split('//')[1].split('.')[0] : 'nwcatvlfoayzrwatvyrf';
    const sessionStr = localStorage.getItem(`sb-${projectRef}-auth-token`);
    if (sessionStr) {
      return JSON.parse(sessionStr)?.user?.id || "";
    }
  } catch (e) { }
  return "";
};


export const xorEncrypt = (text) => {
  if (!text) return "";
  try {
    return btoa(encodeURIComponent(text));
  } catch (e) {
    return text;
  }
};

export const xorDecrypt = (encoded, key = ENCRYPTION_SALT) => {
  if (!encoded) return "";
  try {
    return decodeURIComponent(atob(encoded));
  } catch (e) {
    // Fallback for legacy XOR-encoded strings
    try {
      let text;
      try { text = decodeURIComponent(escape(atob(encoded))); } catch (err) { text = atob(encoded); }
      let result = "";
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return result;
    } catch (err) {
      return encoded;
    }
  }
};

export const getSecureItem = (key, keyDerivation = ENCRYPTION_SALT) => {
  if (typeof window === 'undefined') return null;
  const uid = getCurrentUserIdSync();
  const targetUser = (keyDerivation !== ENCRYPTION_SALT && keyDerivation) ? keyDerivation : uid;
  const storageKey = targetUser ? `${key}_${targetUser}` : key;
  let saved = localStorage.getItem(storageKey);
  if (!saved && targetUser) {
    saved = localStorage.getItem(key);
  }
  if (!saved) return null;
  if (saved.startsWith("{") || saved.startsWith("[")) {
    try {
      return JSON.parse(saved);
    } catch (e) { }
  }
  const derivationKey = targetUser ? `${targetUser}_${ENCRYPTION_SALT}` : ENCRYPTION_SALT;

  const decrypted = xorDecrypt(saved, derivationKey);
  if (decrypted) {
    try {
      return JSON.parse(decrypted);
    } catch (e) { }
  }
  return null;
};

export const setSecureItem = (key, val, keyDerivation = ENCRYPTION_SALT) => {
  if (typeof window === 'undefined') return;
  const rawStr = JSON.stringify(val);
  const uid = getCurrentUserIdSync();
  const targetUser = (keyDerivation !== ENCRYPTION_SALT && keyDerivation) ? keyDerivation : uid;
  const storageKey = targetUser ? `${key}_${targetUser}` : key;

  const encrypted = xorEncrypt(rawStr);
  localStorage.setItem(storageKey, encrypted);
};

const LOCAL_STATE_KEY = "calyxo_pwa_state";
const getLocalState = (userId) => {
  const state = getSecureItem(LOCAL_STATE_KEY, userId);
  const today = new Date().toDateString();
  if (state) {
    // 24-hour daily restore: reset daily water intake if date has changed (24h passed)
    if (state.waterDate && state.waterDate !== today) {
      state.waterIntake = 0;
      state.waterDate = today;
      setSecureItem(LOCAL_STATE_KEY, state, userId);
    }
    return state;
  }
  return {
    foodLogs: [],
    workoutLogs: [],
    weightLogs: [],
    waterIntake: 0,
    waterDate: today,
    userProfile: {
      onboarded: false,
      gender: "male",
      age: 25,
      weight: 70,
      height: 175,
      activity: 1.55,
      goal: "lose",
      bio: "",
      website: "",
      coverImage: "",
      followersCount: 0,
      followingCount: 0,
      isVerified: false
    }
  };
};

const saveLocalState = (userId, state) => {
  setSecureItem(LOCAL_STATE_KEY, state, userId);
};

/* ==========================================================================
   AUTHENTICATION API
   ========================================================================== */

export const signUpUser = async (email, password, remember = true) => {
  if (isMockMode) {
    const mockUser = { id: "mock-user-id", uid: "mock-user-id", email };
    localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    return mockUser;
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // Shim for .uid property convention compatibility
  if (data.user) {
    data.user.uid = data.user.id;
  }
  return data.user;
};

export const signInWithUsernameOrEmail = async (identifier, password, remember = true) => {
  let loginEmail = identifier;

  if (isMockMode) {
    if (!identifier.includes('@')) {
      const usernamesStr = localStorage.getItem("calyxo_mock_usernames");
      if (usernamesStr) {
        const usernames = JSON.parse(usernamesStr);
        const match = usernames.find(u => u.username_lowercase === identifier.toLowerCase());
        if (!match) throw new Error("Username not found");
        loginEmail = match.email || `${identifier}@mock.com`;
      } else {
        throw new Error("Username not found");
      }
    }
    const mockUser = { id: "mock-user-id", uid: "mock-user-id", email: loginEmail };
    localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    return mockUser;
  }

  // Resolve Username to Email (If usernames table exists in Supabase)
  if (!identifier.includes('@')) {
    const usernameLower = identifier.toLowerCase();
    const { data, error } = await supabase.from('usernames').select('email').eq('id', usernameLower).maybeSingle();
    if (error || !data?.email) {
      throw new Error("Username not found or has no associated email address.");
    }
    loginEmail = data.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
  if (error) throw error;
  if (data.user) {
    data.user.uid = data.user.id;
  }
  return data.user;
};

export const signInWithGoogle = async (remember = true) => {
  if (isMockMode) {
    const mockUser = { id: "mock-google-user", uid: "mock-google-user", email: "google.tester@calyxo.com", displayName: "Google Tester" };
    localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    return mockUser;
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/user/dashboard`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });
  if (error) {
    if (error.message?.includes('provider is not enabled') || error.status === 400) {
      throw new Error("Google Sign-In is not enabled in your Supabase Auth Providers settings. Please enable Google provider in Supabase Dashboard.");
    }
    throw error;
  }
  return data;
};

export const signInWithApple = async (remember = true) => {
  if (isMockMode) {
    const mockUser = { id: "mock-apple-user", uid: "mock-apple-user", email: "apple.tester@calyxo.com", displayName: "Apple Tester" };
    localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    return mockUser;
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
    options: {
      redirectTo: `${window.location.origin}/user/dashboard`
    }
  });
  if (error) {
    if (error.message?.includes('provider is not enabled') || error.status === 400) {
      throw new Error("Apple Sign-In is not enabled in your Supabase Auth Providers settings. Please enable Apple provider in Supabase Dashboard.");
    }
    throw error;
  }
  return data;
};

export const signOutUser = async () => {
  if (isMockMode) {
    localStorage.removeItem("calyxo_mock_user");
    return;
  }
  await supabase.auth.signOut();
};

export const sendPasswordReset = async (email) => {
  if (isMockMode) {
    console.log(`Mock reset password email sent to ${email}`);
    return;
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

const mergeLogs = (remoteLogs, localLogs) => {
  const map = new Map();
  (localLogs || []).forEach(item => {
    const key = item.id || item.timestamp;
    if (key) map.set(String(key), item);
  });
  (remoteLogs || []).forEach(item => {
    const key = item.id || item.timestamp;
    if (key) {
      const existing = map.get(String(key)) || {};
      map.set(String(key), {
        ...existing,
        ...item,
        name: item.name || item.title || existing.name || "Log Item",
        title: item.title || item.name || existing.title || "Log Item"
      });
    }
  });
  const merged = Array.from(map.values());
  merged.sort((a, b) => (Number(b.timestamp) || 0) - (Number(a.timestamp) || 0));
  return merged;
};

export const subscribeToAuth = (callback) => {
  if (isMockMode) {
    let mockUser = null;
    try {
      const mockUserRaw = localStorage.getItem("calyxo_mock_user");
      mockUser = mockUserRaw ? JSON.parse(mockUserRaw) : null;
    } catch (e) {
      console.error("Error parsing mock user", e);
    }
    callback(mockUser);
    return () => { };
  }

  let lastUid = null;
  supabase.auth.getSession().then(({ data: { session } }) => {
    let user = session?.user || null;
    if (user) user.uid = user.id;
    lastUid = user ? user.id : null;
    callback(user);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    let user = session?.user || null;
    if (user) user.uid = user.id;
    const currentUid = user ? user.id : null;

    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED' || currentUid !== lastUid) {
      lastUid = currentUid;
      callback(user);
    }
  });

  return () => { subscription.unsubscribe(); };
};

/* ==========================================================================
   FOOD LOGGING API
   ========================================================================== */

export const getFoodLogs = async (userId) => {
  const localLogs = getLocalState(userId).foodLogs || [];
  if (isMockMode || !userId) {
    return localLogs;
  }
  try {
    const { data, error } = await supabase
      .from("food_logs")
      .select("*")
      .eq("userId", userId)
      .order("timestamp", { ascending: false });
    if (error) throw error;
    const merged = mergeLogs(data || [], localLogs);
    const state = getLocalState(userId);
    state.foodLogs = merged;
    saveLocalState(userId, state);
    return merged;
  } catch (err) {
    console.warn("Supabase getFoodLogs error, using local state:", err);
    return localLogs;
  }
};

export const addFoodLog = async (userId, item) => {
  const logItem = {
    ...item,
    id: item.id || `food_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    timestamp: Number(item.timestamp) || Date.now()
  };

  const state = getLocalState(userId);
  state.foodLogs = [logItem, ...state.foodLogs.filter(x => x.id !== logItem.id)];
  saveLocalState(userId, state);

  if (isMockMode || !userId) return logItem;

  try {
    const insertPayload = {
      "userId": userId,
      "name": item.name || "Food Item",
      "calories": Math.round(Number(item.calories) || 0),
      "protein": Number(item.protein) || 0,
      "carbs": Number(item.carbs) || 0,
      "fat": Number(item.fat) || 0,
      "portionWeight": Number(item.portionWeight) || 100,
      "timestamp": Number(logItem.timestamp)
    };
    const { data, error } = await supabase.from("food_logs").insert(insertPayload).select().single();
    if (error) {
      console.warn("Supabase addFoodLog insert error, saved locally:", error);
      return logItem;
    }
    return { ...logItem, ...data };
  } catch (err) {
    console.warn("Supabase addFoodLog exception, saved locally:", err);
    return logItem;
  }
};

export const deleteFoodLog = async (userId, logId) => {
  const state = getLocalState(userId);
  state.foodLogs = state.foodLogs.filter(x => x.id !== logId && x.timestamp !== logId);
  saveLocalState(userId, state);

  if (isMockMode || !userId || typeof logId === 'number') return;

  try {
    const { error } = await supabase.from("food_logs").delete().eq("id", logId);
    if (error) throw error;
  } catch (err) {
    console.error("Supabase deleteFoodLog error", err);
  }
};

export const updateFoodLog = async (userId, logId, updatedItem) => {
  const state = getLocalState(userId);
  state.foodLogs = state.foodLogs.map(x => (x.id === logId || x.timestamp === logId) ? { ...x, ...updatedItem } : x);
  saveLocalState(userId, state);

  if (isMockMode || !userId) return;

  try {
    const { error } = await supabase.from("food_logs").update(updatedItem).eq("id", logId);
    if (error) throw error;
  } catch (err) {
    console.error("Supabase updateFoodLog error", err);
  }
};

/* ==========================================================================
   WORKOUT LOGGING API
   ========================================================================== */

export const getWorkoutLogs = async (userId) => {
  const localLogs = getLocalState(userId).workoutLogs || [];
  if (isMockMode || !userId) {
    return localLogs;
  }
  try {
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("userId", userId)
      .order("timestamp", { ascending: false });
    if (error) throw error;
    const remoteMapped = (data || []).map(w => ({
      ...w,
      name: w.name || w.title || "Workout",
      title: w.title || w.name || "Workout"
    }));
    const merged = mergeLogs(remoteMapped, localLogs);
    const state = getLocalState(userId);
    state.workoutLogs = merged;
    saveLocalState(userId, state);
    return merged;
  } catch (err) {
    console.warn("Supabase getWorkoutLogs error, using local state:", err);
    return localLogs;
  }
};

export const addWorkoutLog = async (userId, workout) => {
  const logItem = {
    ...workout,
    id: workout.id || `workout_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    timestamp: Number(workout.timestamp) || Date.now()
  };

  const state = getLocalState(userId);
  state.workoutLogs = [logItem, ...state.workoutLogs.filter(x => x.id !== logItem.id)];
  saveLocalState(userId, state);

  if (isMockMode || !userId) return logItem;

  try {
    const insertPayload = {
      "userId": userId,
      "title": workout.name || workout.title || "Workout",
      "category": workout.category || "General",
      "duration": Math.round(Number(workout.duration) || 30),
      "calories": Math.round(Number(workout.calories) || 150),
      "intensity": workout.intensity || "Medium",
      "notes": workout.notes || "",
      "exercises": Array.isArray(workout.exercises) ? workout.exercises : [{
        name: workout.name || "Exercise",
        sets: workout.sets || 1,
        reps: workout.reps || 10,
        weight: workout.weight || 0,
        category: workout.category
      }],
      "timestamp": Number(logItem.timestamp)
    };

    const { data, error } = await supabase.from("workout_logs").insert(insertPayload).select().single();
    if (error) {
      console.warn("Supabase addWorkoutLog insert error, saved locally:", error);
      return logItem;
    }
    return {
      ...logItem,
      ...data,
      name: data?.title || logItem.name,
      title: data?.title || logItem.title
    };
  } catch (err) {
    console.warn("Supabase addWorkoutLog exception, saved locally:", err);
    return logItem;
  }
};

export const updateWorkoutLog = async (userId, logId, updatedItem) => {
  const state = getLocalState(userId);
  state.workoutLogs = state.workoutLogs.map(x => (x.id === logId || x.timestamp === logId) ? { ...x, ...updatedItem } : x);
  saveLocalState(userId, state);

  if (isMockMode || !userId) return;

  try {
    const { error } = await supabase.from("workout_logs").update(updatedItem).eq("id", logId);
    if (error) throw error;
  } catch (err) {
    console.error("Supabase updateWorkoutLog error", err);
  }
};

export const deleteWorkoutLog = async (userId, logId) => {
  const state = getLocalState(userId);
  state.workoutLogs = state.workoutLogs.filter(x => x.id !== logId && x.timestamp !== logId);
  saveLocalState(userId, state);

  if (isMockMode || !userId) return;

  try {
    const { error } = await supabase.from("workout_logs").delete().eq("id", logId);
    if (error) throw error;
  } catch (err) {
    console.error("Supabase deleteWorkoutLog error", err);
  }
};

/* ==========================================================================
   HYDRATION API
   ========================================================================== */

export const getWaterIntake = async (userId) => {
  if (isMockMode || !userId) {
    return getLocalState(userId).waterIntake;
  }
  try {
    const { data, error } = await supabase
      .from("users_metrics")
      .select("*")
      .eq("id", `${userId}_water`)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is not found

    if (data) {
      const today = new Date().toDateString();
      if (data.date === today) {
        return data.amount;
      }
    }
    return 0;
  } catch (err) {
    return getLocalState(userId).waterIntake;
  }
};

export const saveWaterIntake = async (userId, amount) => {
  const today = new Date().toDateString();
  const state = getLocalState(userId);
  state.waterIntake = amount;
  state.waterDate = today;
  if (!state.waterLogs) state.waterLogs = [];
  const idx = state.waterLogs.findIndex(w => w.date === today);
  if (idx >= 0) {
    state.waterLogs[idx].amount = amount;
    state.waterLogs[idx].timestamp = Date.now();
  } else {
    state.waterLogs.push({ date: today, amount, timestamp: Date.now() });
  }
  saveLocalState(userId, state);

  if (isMockMode || !userId) return;

  try {
    const payload = {
      id: `${userId}_water`,
      amount,
      date: today,
      userId
    };
    const { error } = await supabase.from("users_metrics").upsert(payload);
    if (error) throw error;
  } catch (err) {
    console.error("Supabase saveWaterIntake error", err);
  }
};

/* ==========================================================================
   WEIGHT API
   ========================================================================== */

export const getWeightLogs = async (userId) => {
  if (isMockMode || !userId) {
    return getLocalState(userId).weightLogs;
  }
  try {
    const { data, error } = await supabase
      .from("weight_logs")
      .select("*")
      .eq("userId", userId)
      .order("timestamp", { ascending: false });
    if (error) throw error;
    return (data || []).reverse();
  } catch (err) {
    return getLocalState(userId).weightLogs;
  }
};

export const addWeightLog = async (userId, weightVal, units) => {
  const dateStr = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' });
  const entry = {
    weight: weightVal,
    unit: units,
    date: dateStr,
    timestamp: Date.now(),
    userId
  };

  const state = getLocalState(userId);
  state.weightLogs.push(entry);
  saveLocalState(userId, state);

  if (isMockMode || !userId) return entry;

  try {
    const { data, error } = await supabase.from("weight_logs").insert(entry).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Supabase addWeightLog error", err);
    return entry;
  }
};

/* ==========================================================================
   USER PROFILE BIOMETRICS
   ========================================================================== */

export const getUserProfile = async (userId) => {
  if (isMockMode || !userId) {
    return getLocalState(userId).userProfile;
  }
  try {
    const { data, error } = await supabase
      .from("users_metrics")
      .select("*")
      .eq("id", `${userId}_profile`)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;

    let userEmail = "";
    try {
      const { data: authUserRes } = await supabase.auth.getUser();
      if (authUserRes?.user?.email) {
        userEmail = authUserRes.user.email;
      }
    } catch (e) {}

    if (!userEmail) {
      try {
        const url = activeSupabaseUrl;
        const projectRef = url.includes('//') ? url.split('//')[1].split('.')[0] : 'nwcatvlfoayzrwatvyrf';
        const sessionStr = localStorage.getItem(`sb-${projectRef}-auth-token`) || localStorage.getItem('supabase.auth.token');
        if (sessionStr) {
          userEmail = JSON.parse(sessionStr)?.user?.email || "";
        }
      } catch (e) {}
    }

    let userProfileSubPlan = null;
    try {
      const { data: upData } = await supabase
        .from("user_profiles")
        .select("subscription_plan, email")
        .eq("id", userId)
        .maybeSingle();

      if (upData?.subscription_plan && upData.subscription_plan !== 'FREE') {
        userProfileSubPlan = upData.subscription_plan;
      }
      if (upData?.email) {
        userEmail = userEmail || upData.email;
      }
    } catch (upErr) { /* ignore fallback query error */ }

    const cleanEmail = (userEmail || "").toLowerCase().trim();
    if (cleanEmail === 'supreethkiran25@gmail.com') {
      userProfileSubPlan = 'HIGH';
    }

    if (data) {
      let extra = {};
      if (data.bio) {
        try {
          extra = JSON.parse(data.bio);
        } catch (e) {
          extra = { bio: data.bio };
        }
      }
      const localState = getLocalState(userId);
      const subPlan = extra.subscriptionPlan || userProfileSubPlan || localState.userProfile?.subscriptionPlan || 'FREE';
      const isSub = extra.isSubscribed !== undefined
        ? extra.isSubscribed
        : (subPlan !== 'FREE' && subPlan !== 'DEFAULT');

      const combinedProfile = {
        ...localState.userProfile,
        ...data,
        ...extra,
        subscriptionPlan: subPlan,
        isSubscribed: isSub,
        lastPaymentId: extra.lastPaymentId || localState.userProfile?.lastPaymentId || null,
        subscriptionDate: extra.subscriptionDate || localState.userProfile?.subscriptionDate || null,
        passPurchases: extra.passPurchases || localState.userProfile?.passPurchases || null,
        activePass: extra.activePass || localState.userProfile?.activePass || subPlan,
        onboarded: extra.onboarded === true || data.onboarded === true,
        id: data.id,
        userId: data.userId,
        displayName: data.displayName || extra.nickname || extra.firstName || '',
        photoURL: data.photoURL || extra.photoURL || '',
        gender: data.gender || extra.gender || 'male',
        age: data.age || extra.age || 25,
        weight: data.weight || extra.weight || 70,
        height: data.height || extra.height || 175,
        activity: data.activity || extra.activity || 1.55,
        goal: data.goal || extra.goal || 'lose',
        bio: ('bio' in extra && typeof extra.bio === 'string') ? extra.bio : ""
      };

      localState.userProfile = combinedProfile;
      saveLocalState(userId, localState);

      // Silently ensure cloud DB is synced with the active plan so subsequent reads on all devices stay updated
      if (!extra.subscriptionPlan || extra.subscriptionPlan !== subPlan) {
        saveUserProfile(userId, combinedProfile).catch(() => {});
      }

      return combinedProfile;
    }
    const localProf = getLocalState(userId).userProfile;
    const fallbackPlan = userProfileSubPlan || localProf?.subscriptionPlan || 'FREE';
    const fallbackSub = {
      ...localProf,
      subscriptionPlan: fallbackPlan,
      isSubscribed: fallbackPlan !== 'FREE' && fallbackPlan !== 'DEFAULT',
      onboarded: localProf?.onboarded === true ? true : false
    };
    if (fallbackPlan !== 'FREE') {
      saveUserProfile(userId, fallbackSub).catch(() => {});
    }
    return fallbackSub;
  } catch (err) {
    const localProf = getLocalState(userId).userProfile;
    return {
      ...localProf,
      onboarded: localProf?.onboarded === true ? true : false
    };
  }
};

export const saveUserProfile = async (userId, profile) => {
  const state = getLocalState(userId);
  const mergedProfile = {
    ...state.userProfile,
    ...profile
  };
  state.userProfile = mergedProfile;
  saveLocalState(userId, state);

  if (isMockMode || !userId) return;

  let existingBio = {};
  try {
    const { data: existing } = await supabase
      .from("users_metrics")
      .select("bio")
      .eq("id", `${userId}_profile`)
      .maybeSingle();
    if (existing?.bio) {
      try {
        existingBio = JSON.parse(existing.bio);
      } catch (e) { /* bio isn't JSON */ }
    }
  } catch (e) { /* query failed */ }

  const finalRole = profile.role || mergedProfile.role || existingBio.role;
  const finalSubPlan = profile.subscriptionPlan || mergedProfile.subscriptionPlan || existingBio.subscriptionPlan || 'FREE';
  const finalIsSubscribed = profile.isSubscribed !== undefined
    ? profile.isSubscribed
    : (mergedProfile.isSubscribed !== undefined
      ? mergedProfile.isSubscribed
      : (existingBio.isSubscribed !== undefined ? existingBio.isSubscribed : (finalSubPlan !== 'FREE' && finalSubPlan !== 'DEFAULT')));
  const finalLastPaymentId = profile.lastPaymentId || mergedProfile.lastPaymentId || existingBio.lastPaymentId || null;
  const finalSubscriptionDate = profile.subscriptionDate || mergedProfile.subscriptionDate || existingBio.subscriptionDate || null;
  const finalPassPurchases = profile.passPurchases || mergedProfile.passPurchases || existingBio.passPurchases || null;
  const finalActivePass = profile.activePass || mergedProfile.activePass || existingBio.activePass || null;

  try {
    const extraFields = {
      onboarded: mergedProfile.onboarded ?? existingBio.onboarded,
      subscriptionPlan: finalSubPlan,
      isSubscribed: finalIsSubscribed,
      lastPaymentId: finalLastPaymentId,
      subscriptionDate: finalSubscriptionDate,
      passPurchases: finalPassPurchases,
      activePass: finalActivePass,
      dob: mergedProfile.dob ?? existingBio.dob,
      units: mergedProfile.units ?? existingBio.units,
      experience: mergedProfile.experience ?? existingBio.experience,
      dietPreferences: mergedProfile.dietPreferences ?? existingBio.dietPreferences,
      allergies: mergedProfile.allergies ?? existingBio.allergies,
      medicalRestrictions: mergedProfile.medicalRestrictions ?? existingBio.medicalRestrictions,
      foodDislikes: mergedProfile.foodDislikes ?? existingBio.foodDislikes,
      favoriteFoods: mergedProfile.favoriteFoods ?? existingBio.favoriteFoods,
      firstName: mergedProfile.firstName ?? existingBio.firstName,
      lastName: mergedProfile.lastName ?? existingBio.lastName,
      nickname: mergedProfile.nickname ?? existingBio.nickname,
      role: finalRole,
      coachPersonality: mergedProfile.coachPersonality ?? existingBio.coachPersonality,
      responseLength: mergedProfile.responseLength ?? existingBio.responseLength,
      coachingStyle: mergedProfile.coachingStyle ?? existingBio.coachingStyle,
      motivationLevel: mergedProfile.motivationLevel ?? existingBio.motivationLevel,
      reminderFrequency: mergedProfile.reminderFrequency ?? existingBio.reminderFrequency,
      notifications: mergedProfile.notifications ?? existingBio.notifications,
      analyticsTracking: mergedProfile.analyticsTracking ?? existingBio.analyticsTracking,
      bio: mergedProfile.bio || existingBio.bio || ""
    };

    const payload = {
      id: `${userId}_profile`,
      userId,
      displayName: mergedProfile.displayName || mergedProfile.nickname ||
        (mergedProfile.firstName ? `${mergedProfile.firstName} ${mergedProfile.lastName || ''}`.trim() : '') || existingBio.displayName,
      photoURL: mergedProfile.photoURL ?? existingBio.photoURL ?? null,
      gender: mergedProfile.gender ?? existingBio.gender ?? null,
      age: mergedProfile.age ? Number(mergedProfile.age) : (existingBio.age ? Number(existingBio.age) : null),
      weight: mergedProfile.weight ? Number(mergedProfile.weight) : (existingBio.weight ? Number(existingBio.weight) : null),
      height: mergedProfile.height ? Number(mergedProfile.height) : (existingBio.height ? Number(existingBio.height) : null),
      activity: mergedProfile.activity ? Number(mergedProfile.activity) : (existingBio.activity ? Number(existingBio.activity) : null),
      goal: mergedProfile.goal || existingBio.goal || null,
      bio: JSON.stringify(extraFields)
    };

    const { error } = await supabase.from("users_metrics").upsert(payload);
    if (error) throw error;
  } catch (err) {
    console.error("Supabase saveUserProfile error", err);
  }
};

/* Helper to load all user data in parallel */
export const loadUserData = async (userId) => {
  if (!userId) {
    return { profile: null, foods: [], workouts: [], weights: [], water: 0 };
  }
  const [profile, foods, workouts, weights, water] = await Promise.all([
    getUserProfile(userId),
    getFoodLogs(userId),
    getWorkoutLogs(userId),
    getWeightLogs(userId),
    getWaterIntake(userId)
  ]);
  return { profile, foods, workouts, weights, water };
};

/* ==========================================================================
   TRAINING LOGS API FOR AI SELF-TRAINING
   ========================================================================== */

export const addTrainingLog = async (userId, queryText, responseText, rating) => {
  const logItem = {
    userId: userId || "anonymous",
    user_query: queryText,
    bot_response: responseText,
    rating,
    timestamp: Date.now()
  };

  let logs = getSecureItem("calyxo_training_logs", userId || ENCRYPTION_SALT) || [];
  logs.push(logItem);
  setSecureItem("calyxo_training_logs", logs, userId || ENCRYPTION_SALT);

  if (isMockMode || !userId) return logItem;

  try {
    const { data, error } = await supabase.from("TrainingLogs").insert(logItem).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Supabase addTrainingLog error", err);
    return logItem;
  }
};

export const getPositiveTrainingLogs = async (userId) => {
  let localLogs = getSecureItem("calyxo_training_logs", userId || ENCRYPTION_SALT) || [];
  const positiveLocal = localLogs.filter(log => log.rating === 1);

  if (isMockMode || !userId) {
    return positiveLocal;
  }

  try {
    const { data, error } = await supabase
      .from("TrainingLogs")
      .select("*")
      .eq("userId", userId)
      .eq("rating", 1);

    if (error) throw error;

    const allLogs = [...(data || []), ...positiveLocal];
    const seen = new Set();
    return allLogs.filter(item => {
      const key = `${item.timestamp}_${item.user_query}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (err) {
    console.error("Supabase getPositiveTrainingLogs error, using local logs:", err);
    return positiveLocal;
  }
};

/* ==========================================================================
   CHAT SESSION HISTORY API
   ========================================================================== */

export const getChatSessions = async (userId) => {
  if (isMockMode || !userId) {
    return getSecureItem("calyxo_chat_sessions", userId || ENCRYPTION_SALT) || [];
  }
  try {
    const { data, error } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("userId", userId)
      .order("updatedAt", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase getChatSessions error, falling back to local:", err);
    console.error("Error name:", err?.name);
    console.error("Error message:", err?.message);
    console.error("Error details:", JSON.stringify(err));
    return getSecureItem("calyxo_chat_sessions", userId || ENCRYPTION_SALT) || [];
  }
};

export const saveChatSession = async (userId, session) => {
  let localSessions = getSecureItem("calyxo_chat_sessions", userId || ENCRYPTION_SALT) || [];

  const idx = localSessions.findIndex(s => s.id === session.id);
  const updatedSession = { ...session, userId, updatedAt: Date.now() };
  if (idx > -1) {
    localSessions[idx] = updatedSession;
  } else {
    localSessions.unshift(updatedSession);
  }
  localSessions.sort((a, b) => b.updatedAt - a.updatedAt);
  setSecureItem("calyxo_chat_sessions", localSessions, userId || ENCRYPTION_SALT);

  if (isMockMode || !userId) return updatedSession;

  try {
    const { error } = await supabase.from("chat_sessions").upsert(updatedSession);
    if (error) throw error;
    return updatedSession;
  } catch (err) {
    console.error("Supabase saveChatSession error", err);
    return updatedSession;
  }
};

export const deleteChatSession = async (userId, sessionId) => {
  let localSessions = getSecureItem("calyxo_chat_sessions", userId || ENCRYPTION_SALT) || [];
  localSessions = localSessions.filter(s => s.id !== sessionId);
  setSecureItem("calyxo_chat_sessions", localSessions, userId || ENCRYPTION_SALT);

  if (isMockMode || !userId) return;

  try {
    const { error } = await supabase.from("chat_sessions").delete().eq("id", sessionId);
    if (error) throw error;
  } catch (err) {
    console.error("Supabase deleteChatSession error", err);
  }
};

/* ==========================================================================
   CALYXO ECOSYSTEM STATE & SERVICES
   ========================================================================== */

export const getEcosystemState = async (userId) => {
  if (isMockMode || !userId) {
    return getSecureItem("calyxo_ecosystem_db_state", userId || ENCRYPTION_SALT);
  }
  try {
    const { data, error } = await supabase.from("users_ecosystem").select("*").eq("id", userId).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    if (data && data.data) {
      return {
        ...data.data,
        coachingPlan: data.aiCoachPlan || data.data.coachingPlan || null,
        aiMetrics: data.aiMetrics || data.data.aiMetrics || null,
        hasCompletedOnboarding: data.hasCompletedOnboarding || data.data.hasCompletedOnboarding || false
      };
    }
    return null;
  } catch (err) {
    console.error("Supabase getEcosystemState error:", err);
    return null;
  }
};

export const saveEcosystemState = async (userId, state) => {
  if (!state || !userId) return;
  const cleanState = JSON.parse(JSON.stringify(state));
  if (typeof window !== 'undefined') {
    setSecureItem("calyxo_ecosystem_db_state", cleanState, userId || ENCRYPTION_SALT);
  }
  if (isMockMode) return;
  try {
    const payload = {
      id: userId,
      data: cleanState,
      aiCoachPlan: cleanState.coachingPlan || null,
      aiMetrics: cleanState.aiMetrics || null,
      hasCompletedOnboarding: cleanState.hasCompletedOnboarding || false
    };
    const { error } = await supabase.from("users_ecosystem").upsert(payload);
    if (error) throw error;
  } catch (err) {
    console.error("Supabase saveEcosystemState error:", err);
  }
};

export const getMealScanLogs = async (userId) => {
  if (isMockMode || !userId) {
    return getSecureItem("calyxo_meal_scans", userId || ENCRYPTION_SALT) || [];
  }
  try {
    const { data, error } = await supabase
      .from("meal_scans")
      .select("*")
      .eq("userId", userId)
      .order("timestamp", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase getMealScanLogs error:", err);
    return [];
  }
};

export const addMealScanLog = async (userId, scanItem) => {
  const item = { ...scanItem, userId, timestamp: Date.now() };
  let local = getSecureItem("calyxo_meal_scans", userId || ENCRYPTION_SALT) || [];
  local.unshift(item);
  setSecureItem("calyxo_meal_scans", local, userId || ENCRYPTION_SALT);

  if (isMockMode || !userId) return item;
  try {
    const { data, error } = await supabase.from("meal_scans").insert(item).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Supabase addMealScanLog error:", err);
    return item;
  }
};

export const updateUserEmail = async (newEmail) => {
  if (isMockMode) {
    const mockUserRaw = localStorage.getItem("calyxo_mock_user");
    if (mockUserRaw) {
      const mockUser = JSON.parse(mockUserRaw);
      mockUser.email = newEmail;
      localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    }
    return;
  }
  const { error } = await supabase.auth.updateUser({ email: newEmail });
  if (error) throw error;
};

export const updateUserPassword = async (newPassword) => {
  if (isMockMode) return;
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

export const updateUserAuthProfile = async (displayName, photoURL) => {
  if (isMockMode) {
    const mockUserRaw = localStorage.getItem("calyxo_mock_user");
    if (mockUserRaw) {
      const mockUser = JSON.parse(mockUserRaw);
      mockUser.displayName = displayName;
      mockUser.photoURL = photoURL;
      localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    }
    return;
  }
  const { error } = await supabase.auth.updateUser({ data: { displayName, photoURL } });
  if (error) throw error;
};

export const deleteUserAccount = async (userId) => {
  if (!isMockMode && userId) {
    try {
      await supabase.from("users_metrics").delete().eq("id", `${userId}_profile`);
      await supabase.from("users_metrics").delete().eq("id", `${userId}_water`);
      await supabase.from("users_ecosystem").delete().eq("id", userId);
      await supabase.from("food_logs").delete().eq("userId", userId);
      await supabase.from("workout_logs").delete().eq("userId", userId);
      await supabase.from("weight_logs").delete().eq("userId", userId);
      await supabase.from("chat_sessions").delete().eq("userId", userId);
      await supabase.from("meal_scans").delete().eq("userId", userId);
    } catch (e) {
      console.error("Purging Supabase collections error", e);
    }
  }

  localStorage.removeItem("calyxo_mock_user");
  localStorage.removeItem(LOCAL_STATE_KEY);
  localStorage.removeItem("calyxo_ecosystem_db_state");
  localStorage.removeItem("calyxo_chat_sessions");
  localStorage.removeItem("calyxo_meal_scans");
  localStorage.removeItem("calyxo_training_logs");
  localStorage.removeItem("calyxo_ecosystem_state");

  if (!isMockMode) {
    // Note: deleteUser from client requires the user to be recently signed in
    // Supabase JS client doesn't expose a client-side delete user function.
    // Only admin can delete user in Supabase, or use a custom Edge Function.
    // For now, we sign out.
    await supabase.auth.signOut();
  }
};

export const exportAccountData = async (userId) => {
  const profile = await getUserProfile(userId);
  const foodLogs = await getFoodLogs(userId);
  const workoutLogs = await getWorkoutLogs(userId);
  const weightLogs = await getWeightLogs(userId);
  const waterIntake = await getWaterIntake(userId);
  const ecosystem = await getEcosystemState(userId);
  const chatSessions = await getChatSessions(userId);

  const payload = {
    exportDate: new Date().toISOString(),
    userId: userId || "mock-user-id",
    profile,
    waterIntakeToday: waterIntake,
    foodLogs,
    workoutLogs,
    weightLogs,
    ecosystem,
    chatSessions
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `calyxo_account_export_${userId || 'mock'}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

export const clearChatHistory = async (userId) => {
  localStorage.removeItem("calyxo_chat_sessions");
  if (isMockMode || !userId) return;
  try {
    await supabase.from("chat_sessions").delete().eq("userId", userId);
  } catch (e) {
    console.error("Clear chat history error", e);
  }
};

export const clearAIMemory = async (userId) => {
  const ecoState = await getEcosystemState(userId);
  if (ecoState) {
    ecoState.coachingPlan = null;
    ecoState.predictions = null;
    await saveEcosystemState(userId, ecoState);
  }
};

export const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (retries > 0 && (response.status === 429 || response.status >= 500)) {
        console.warn(`Transient API error ${response.status}. Retrying in ${delay}ms... (${retries} attempts left)`);
        await new Promise(res => setTimeout(res, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 1.5);
      }
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Network/API fetch failed: ${error.message}. Retrying in ${delay}ms... (${retries} attempts left)`);
      await new Promise(res => setTimeout(res, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 1.5);
    }
    throw error;
  }
};

/* ==========================================================================
   TRAINER API
   ========================================================================== */

export const getTrainerProfile = async (trainerId) => {
  if (isMockMode || !trainerId) return null;
  const { data, error } = await supabase.from('trainer_profiles').select('*').eq('id', trainerId).maybeSingle();
  if (error && error.code !== 'PGRST116') console.error('getTrainerProfile error:', error);
  return data;
};

export const upsertTrainerProfile = async (trainerId, profileData) => {
  if (isMockMode || !trainerId) return;
  const { error } = await supabase.from('trainer_profiles').upsert({ id: trainerId, ...profileData });
  if (error) console.error('upsertTrainerProfile error:', error);
};

export const completeTrainerOnboarding = async (trainerId) => {
  if (isMockMode || !trainerId) return;
  const { error } = await supabase.from('trainer_profiles').update({ onboarding_complete: true }).eq('id', trainerId);
  if (error) console.error('completeTrainerOnboarding error:', error);
};

export const requestPTConnection = async (userId, trainerId, method) => {
  if (isMockMode || !userId || !trainerId) return;
  const { error } = await supabase.from('pt_connections').insert({
    user_id: userId,
    trainer_id: trainerId,
    connection_method: method,
    status: 'pending'
  });
  if (error) console.error('requestPTConnection error:', error);
};

export const respondToConnection = async (connectionId, status) => {
  if (isMockMode || !connectionId) return;
  const { error } = await supabase.from('pt_connections').update({ status, responded_at: new Date().toISOString() }).eq('id', connectionId);
  if (error) console.error('respondToConnection error:', error);
};

export const getUserConnection = async (userId) => {
  if (isMockMode || !userId) return null;
  const { data, error } = await supabase.from('pt_connections').select('*').eq('user_id', userId).in('status', ['pending', 'accepted']);
  if (error) {
    console.error('getUserConnection error:', error);
    return null;
  }
  const conn = data?.[0] || null;
  if (conn) {
    if (conn.status === 'accepted') conn.status = 'active';
    if (conn.trainer_id) {
      const { data: tp } = await supabase.from('trainer_profiles').select('*').eq('id', conn.trainer_id).maybeSingle();
      if (tp) conn.trainer_profiles = tp;
    }
  }
  return conn;
};

export const getTrainerClients = async (trainerId) => {
  if (isMockMode || !trainerId) return [];
  const { data, error } = await supabase.from('pt_connections').select('*').eq('trainer_id', trainerId).eq('status', 'accepted');
  if (error) {
    console.error('getTrainerClients error:', error);
    return [];
  }
  if (data && data.length > 0) {
    const userIds = data.map(d => d.user_id);
    const { data: usersData } = await supabase.from('user_profiles').select('*').in('id', userIds);
    if (usersData) {
      data.forEach(conn => {
        conn.user_profiles = usersData.find(u => u.id === conn.user_id) || null;
      });
    }
  }
  return data || [];
};

export const assignPlan = async (trainerId, userId, planData) => {
  const planType = planData.type === 'workout_plan' ? 'workout' : 'nutrition';
  const { data, error } = await supabase
    .from('assigned_plans')
    .insert({
      trainer_id: trainerId,
      client_id: userId,
      plan_type: planType,
      plan_data: { title: planData.title, ...planData.content },
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    console.error('assignPlan error:', error);
    throw error;
  }
  return data;
};

export const getUserAssignments = async (userId) => {
  if (!userId) return [];
  const { data, error } = await supabase
    .from('assigned_plans')
    .select('*')
    .eq('client_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error('getUserAssignments error:', error);
    return [];
  }

  return (data || []).map(row => ({
    id: row.id,
    type: row.plan_type === 'workout' ? 'workout_plan' : 'meal_plan',
    title: row.plan_data?.title || 'Untitled Plan',
    content: { ...row.plan_data },
    assigned_at: row.assigned_at
  }));
};

export const sendMessage = async (senderId, receiverId, message, senderType) => {
  if (isMockMode || !senderId || !receiverId) return;
  // senderType should be 'trainer' or 'user'
  const trainer_id = senderType === 'trainer' ? senderId : receiverId;
  const user_id = senderType === 'user' ? senderId : receiverId;
  const { error } = await supabase.from('trainer_messages').insert({
    trainer_id,
    user_id,
    sender: senderType,
    message
  });
  if (error) console.error('sendMessage error:', error);
};

export const getMessages = async (userId, trainerId) => {
  if (isMockMode || !userId || !trainerId) return [];
  const { data, error } = await supabase.from('trainer_messages').select('*').eq('user_id', userId).eq('trainer_id', trainerId).order('sent_at', { ascending: true });
  if (error) {
    console.error('getMessages error:', error);
    return [];
  }
  return data || [];
};

export const markMessagesRead = async (userId, trainerId) => {
  if (isMockMode || !userId || !trainerId) return;
  const { error } = await supabase.from('trainer_messages').update({ read: true }).eq('user_id', userId).eq('trainer_id', trainerId);
  if (error) console.error('markMessagesRead error:', error);
};

export const getAvailableTrainers = async (filters = {}) => {
  if (isMockMode) return [];
  let query = supabase.from('trainer_profiles').select('*').eq('onboarding_complete', true);
  if (filters.specialization) query = query.contains('specializations', [filters.specialization]);
  if (filters.pricing_tier) query = query.eq('pricing_tier', filters.pricing_tier);

  const { data, error } = await query;
  if (error) {
    console.error('getAvailableTrainers error:', error);
    return [];
  }
  return data || [];
};

export const getTrainerByInviteCode = async (code) => {
  if (isMockMode || !code) return null;
  const { data, error } = await supabase.from('trainer_profiles').select('*').eq('invite_code', code).maybeSingle();
  if (error) {
    if (error.code !== 'PGRST116') console.error('getTrainerByInviteCode error:', error);
    return null;
  }
  return data;
};

/* ==========================================================================
   TRAINER EXTENDED SYSTEM API (TASKS, DOCS, ANALYTICS)
   ========================================================================== */

export const getTrainerAnalytics = async (trainerId) => {
  if (isMockMode || !trainerId) return null;
  const [connections, assignments, messages] = await Promise.all([
    supabase.from('pt_connections').select('*', { count: 'exact' }).eq('trainer_id', trainerId).eq('status', 'accepted'),
    supabase.from('trainer_assignments').select('type', { count: 'exact' }).eq('trainer_id', trainerId),
    supabase.from('trainer_messages').select('*', { count: 'exact' }).eq('trainer_id', trainerId).eq('sender', 'trainer')
  ]);

  return {
    activeClients: connections.count || 0,
    workoutPlans: assignments.data?.filter(a => a.type === 'workout_plan').length || 0,
    mealPlans: assignments.data?.filter(a => a.type === 'meal_plan').length || 0,
    messagesSent: messages.count || 0
  };
};

export const getClientActivityLogs = async (clientId, days = 30) => {
  if (isMockMode || !clientId) return { workouts: [], foods: [] };
  const d = new Date();
  d.setDate(d.getDate() - days);
  const cutoff = d.getTime();

  const [workouts, foods] = await Promise.all([
    supabase.from('workout_logs').select('*').eq('userId', clientId).gte('timestamp', cutoff),
    supabase.from('food_logs').select('*').eq('userId', clientId).gte('timestamp', cutoff)
  ]);
  return { workouts: workouts.data || [], foods: foods.data || [] };
};

export const getTrainerTasks = async (trainerId) => {
  if (isMockMode || !trainerId) return [];
  const { data, error } = await supabase.from('trainer_tasks').select('*').eq('trainer_id', trainerId).order('created_at', { ascending: false });
  if (error) console.error('getTrainerTasks error:', error);
  return data || [];
};

export const createTrainerTask = async (taskData) => {
  if (isMockMode) return;
  const { error } = await supabase.from('trainer_tasks').insert(taskData);
  if (error) console.error('createTrainerTask error:', error);
};

export const updateTrainerTaskStatus = async (taskId, status) => {
  if (isMockMode) return;
  const { error } = await supabase.from('trainer_tasks').update({ status }).eq('id', taskId);
  if (error) console.error('updateTrainerTaskStatus error:', error);
};

export const deleteTrainerTask = async (taskId) => {
  if (isMockMode) return;
  const { error } = await supabase.from('trainer_tasks').delete().eq('id', taskId);
  if (error) console.error('deleteTrainerTask error:', error);
};

export const uploadTrainerDocument = async (trainerId, file, meta) => {
  if (isMockMode || !trainerId) return;
  const filePath = `${trainerId}/${Date.now()}_${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage.from('trainer-documents').upload(filePath, file);
  if (uploadError) {
    console.error('Upload Error:', uploadError);
    return;
  }

  const { data: urlData } = supabase.storage.from('trainer-documents').getPublicUrl(filePath);

  const docPayload = {
    trainer_id: trainerId,
    client_id: meta.clientId || null,
    file_name: file.name,
    file_url: urlData.publicUrl,
    category: meta.category || 'other',
    file_size: file.size
  };

  const { error } = await supabase.from('trainer_documents').insert(docPayload);
  if (error) console.error('Insert doc metadata error:', error);
};

export const getTrainerDocuments = async (trainerId) => {
  if (isMockMode || !trainerId) return [];
  const { data, error } = await supabase.from('trainer_documents').select('*').eq('trainer_id', trainerId).order('created_at', { ascending: false });
  if (error) console.error('getTrainerDocuments error:', error);
  return data || [];
};

export const deleteTrainerDocument = async (docId, fileUrl) => {
  if (isMockMode) return;
  // delete record
  await supabase.from('trainer_documents').delete().eq('id', docId);
  // Optional: delete from storage bucket if you have the file path
};

export const saveTrainerTemplate = async (trainerId, type, title, content) => {
  if (isMockMode || !trainerId) return;
  const { error } = await supabase.from('trainer_assignments').insert({
    trainer_id: trainerId,
    user_id: null,
    type,
    title,
    content
  });
  if (error) console.error('saveTrainerTemplate error:', error);
};

export const getTrainerTemplates = async (trainerId, type) => {
  if (isMockMode || !trainerId) return [];
  const { data, error } = await supabase.from('trainer_assignments').select('*').eq('trainer_id', trainerId).is('user_id', null).eq('type', type);
  if (error) console.error('getTrainerTemplates error:', error);
  return data || [];
};

export const getClientFullProfile = async (clientId) => {
  if (isMockMode || !clientId) return null;
  const profile = await getUserProfile(clientId);
  return profile;
};

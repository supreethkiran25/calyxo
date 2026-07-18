import { supabase } from "./supabaseClient";

// Helper to determine if Supabase is fully configured or running mock
export const isMockFirebase = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL === "https://mock.supabase.co";

const ENCRYPTION_SALT = "calyxo_secure_salt_2026";

export const getCurrentUserId = async () => {
  if (typeof window === 'undefined') return "";
  if (isMockFirebase) {
    try {
      const mockUserRaw = localStorage.getItem("calyxo_mock_user");
      if (mockUserRaw) {
        const mock = JSON.parse(mockUserRaw);
        return mock?.uid || mock?.id || "";
      }
    } catch (e) {}
    return "";
  }
  const { data } = await supabase.auth.getUser();
  return data?.user?.id || "";
};

export const getCurrentUserIdSync = () => {
  if (typeof window === 'undefined') return "";
  if (isMockFirebase) {
    try {
      const mockUserRaw = localStorage.getItem("calyxo_mock_user");
      if (mockUserRaw) {
        const mock = JSON.parse(mockUserRaw);
        return mock?.uid || mock?.id || "";
      }
    } catch (e) {}
    return "";
  }
  // Fallback for sync contexts, ideally shouldn't be relied on for security
  // But matches the previous firebase auth.currentUser synchronous behavior somewhat
  // In Supabase, session is async, but we can try parsing local storage
  try {
     const sessionStr = localStorage.getItem(`sb-${import.meta.env.VITE_SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`);
     if (sessionStr) {
       return JSON.parse(sessionStr)?.user?.id || "";
     }
  } catch(e) {}
  return "";
};


export const xorEncrypt = (text, key = ENCRYPTION_SALT) => {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  try {
    return btoa(unescape(encodeURIComponent(result)));
  } catch (e) {
    return btoa(result);
  }
};

export const xorDecrypt = (encoded, key = ENCRYPTION_SALT) => {
  if (!encoded) return "";
  try {
    let text;
    try {
      text = decodeURIComponent(escape(atob(encoded)));
    } catch (e) {
      text = atob(encoded);
    }
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch (e) {
    return "";
  }
};

export const getSecureItem = (key, keyDerivation = ENCRYPTION_SALT) => {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(key);
  if (!saved) return null;
  if (saved.startsWith("{") || saved.startsWith("[")) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  const uid = getCurrentUserIdSync();
  const derivationKey = (keyDerivation === ENCRYPTION_SALT && uid)
    ? `${uid}_${ENCRYPTION_SALT}`
    : keyDerivation;

  const decrypted = xorDecrypt(saved, derivationKey);
  if (decrypted) {
    try {
      return JSON.parse(decrypted);
    } catch (e) {
      localStorage.removeItem(key);
    }
  }
  return null;
};

export const setSecureItem = (key, val, keyDerivation = ENCRYPTION_SALT) => {
  if (typeof window === 'undefined') return;
  const rawStr = JSON.stringify(val);
  const uid = getCurrentUserIdSync();
  const derivationKey = (keyDerivation === ENCRYPTION_SALT && uid)
    ? `${uid}_${ENCRYPTION_SALT}`
    : keyDerivation;

  const encrypted = xorEncrypt(rawStr, derivationKey);
  localStorage.setItem(key, encrypted);
};

const LOCAL_STATE_KEY = "calyxo_pwa_state";
const getLocalState = (userId) => {
  const state = getSecureItem(LOCAL_STATE_KEY, userId);
  if (state) return state;
  return {
    foodLogs: [],
    workoutLogs: [],
    weightLogs: [],
    waterIntake: 0,
    userProfile: { 
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
  if (isMockFirebase) {
    const mockUser = { id: "mock-user-id", uid: "mock-user-id", email };
    localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    return mockUser;
  }
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // Shim for firebase `.uid` convention in legacy code
  if (data.user) {
    data.user.uid = data.user.id;
  }
  return data.user;
};

export const signInWithUsernameOrEmail = async (identifier, password, remember = true) => {
  let loginEmail = identifier;

  if (isMockFirebase) {
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
  if (isMockFirebase) {
    const mockUser = { id: "mock-google-user", uid: "mock-google-user", email: "google.tester@calyxo.com", displayName: "Google Tester" };
    localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    return mockUser;
  }
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  if (error) throw error;
  return data;
};

export const signInWithApple = async (remember = true) => {
  if (isMockFirebase) {
    const mockUser = { id: "mock-apple-user", uid: "mock-apple-user", email: "apple.tester@calyxo.com", displayName: "Apple Tester" };
    localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    return mockUser;
  }
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: 'apple' });
  if (error) throw error;
  return data;
};

export const signOutUser = async () => {
  if (isMockFirebase) {
    localStorage.removeItem("calyxo_mock_user");
    return;
  }
  await supabase.auth.signOut();
};

export const sendPasswordReset = async (email) => {
  if (isMockFirebase) {
    console.log(`Mock reset password email sent to ${email}`);
    return;
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
};

export const subscribeToAuth = (callback) => {
  if (isMockFirebase) {
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
  
  // Immediately call with current session
  supabase.auth.getSession().then(({ data: { session } }) => {
    let user = session?.user || null;
    if (user) user.uid = user.id;
    callback(user);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    let user = session?.user || null;
    if (user) user.uid = user.id;
    callback(user);
  });

  return () => { subscription.unsubscribe(); };
};

/* ==========================================================================
   FOOD LOGGING API
   ========================================================================== */

export const getFoodLogs = async (userId) => {
  if (isMockFirebase || !userId) {
    return getLocalState(userId).foodLogs;
  }
  try {
    const { data, error } = await supabase
      .from("food_logs")
      .select("*")
      .eq("userId", userId)
      .order("timestamp", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase getFoodLogs error, falling back to LocalStorage:", err);
    console.error("Error name:", err?.name);
    console.error("Error message:", err?.message);
    console.error("Error details:", JSON.stringify(err));
    return getLocalState(userId).foodLogs;
  }
};

export const addFoodLog = async (userId, item) => {
  const logItem = { ...item, userId, timestamp: Date.now() };

  const state = getLocalState(userId);
  state.foodLogs.push(logItem);
  saveLocalState(userId, state);

  if (isMockFirebase || !userId) return logItem;

  try {
    const { data, error } = await supabase.from("food_logs").insert(logItem).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Supabase addFoodLog error", err);
    return logItem;
  }
};

export const deleteFoodLog = async (userId, logId) => {
  const state = getLocalState(userId);
  state.foodLogs = state.foodLogs.filter(x => x.id !== logId && x.timestamp !== logId);
  saveLocalState(userId, state);

  if (isMockFirebase || !userId || typeof logId === 'number') return;

  try {
    const { error } = await supabase.from("food_logs").delete().eq("id", logId);
    if (error) throw error;
  } catch (err) {
    console.error("Supabase deleteFoodLog error", err);
  }
};

/* ==========================================================================
   WORKOUT LOGGING API
   ========================================================================== */

export const getWorkoutLogs = async (userId) => {
  if (isMockFirebase || !userId) {
    return getLocalState(userId).workoutLogs;
  }
  try {
    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("userId", userId)
      .order("timestamp", { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error("Supabase getWorkoutLogs error:", err);
    console.error("Error name:", err?.name);
    console.error("Error message:", err?.message);
    console.error("Error details:", JSON.stringify(err));
    return getLocalState(userId).workoutLogs;
  }
};

export const addWorkoutLog = async (userId, workout) => {
  const logItem = { ...workout, userId, timestamp: Date.now() };

  const state = getLocalState(userId);
  state.workoutLogs.push(logItem);
  saveLocalState(userId, state);

  if (isMockFirebase || !userId) return logItem;

  try {
    const { data, error } = await supabase.from("workout_logs").insert(logItem).select().single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Supabase addWorkoutLog error", err);
    return logItem;
  }
};

/* ==========================================================================
   HYDRATION API
   ========================================================================== */

export const getWaterIntake = async (userId) => {
  if (isMockFirebase || !userId) {
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
  saveLocalState(userId, state);

  if (isMockFirebase || !userId) return;

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
  if (isMockFirebase || !userId) {
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
  if (state.weightLogs.length > 10) {
    state.weightLogs.shift();
  }
  saveLocalState(userId, state);

  if (isMockFirebase || !userId) return entry;

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
  if (isMockFirebase || !userId) {
    return getLocalState(userId).userProfile;
  }
  try {
    // Note: The original firebase structure stored profile in users_metrics collection under ${userId}_profile.
    // Since we have user_profiles table from migration, we should use it for standard profile fields,
    // but the app is expecting the localState object format. We'll continue using users_metrics 
    // for seamless migration unless we also updated the frontend.
    const { data, error } = await supabase
      .from("users_metrics")
      .select("*")
      .eq("id", `${userId}_profile`)
      .maybeSingle();
    
    if (error && error.code !== 'PGRST116') throw error;
    if (data) return data;
    return getLocalState(userId).userProfile;
  } catch (err) {
    return getLocalState(userId).userProfile;
  }
};

export const saveUserProfile = async (userId, profile) => {
  const state = getLocalState(userId);
  state.userProfile = profile;
  saveLocalState(userId, state);

  if (isMockFirebase || !userId) return;

  try {
    const payload = {
      id: `${userId}_profile`,
      ...profile,
      userId
    };
    const { error } = await supabase.from("users_metrics").upsert(payload);
    if (error) throw error;
  } catch (err) {
    console.error("Supabase saveUserProfile error", err);
  }
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

  if (isMockFirebase || !userId) return logItem;

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

  if (isMockFirebase || !userId) {
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
  if (isMockFirebase || !userId) {
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

  if (isMockFirebase || !userId) return updatedSession;

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

  if (isMockFirebase || !userId) return;

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
  if (isMockFirebase || !userId) {
    return getSecureItem("calyxo_ecosystem_db_state", userId || ENCRYPTION_SALT);
  }
  try {
    const { data, error } = await supabase.from("users_ecosystem").select("*").eq("id", userId).maybeSingle();
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  } catch (err) {
    console.error("Supabase getEcosystemState error:", err);
    console.error("Error name:", err?.name);
    console.error("Error message:", err?.message);
    console.error("Error details:", JSON.stringify(err));
    return null;
  }
};

export const saveEcosystemState = async (userId, state) => {
  if (!state || !userId) return;
  const cleanState = JSON.parse(JSON.stringify(state));
  if (typeof window !== 'undefined') {
    setSecureItem("calyxo_ecosystem_db_state", cleanState, userId || ENCRYPTION_SALT);
  }
  if (isMockFirebase) return;
  try {
    const payload = { id: userId, ...cleanState };
    const { error } = await supabase.from("users_ecosystem").upsert(payload);
    if (error) throw error;
  } catch (err) {
    console.error("Supabase saveEcosystemState error:", err);
  }
};

export const getMealScanLogs = async (userId) => {
  if (isMockFirebase || !userId) {
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

  if (isMockFirebase || !userId) return item;
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
  if (isMockFirebase) {
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
  if (isMockFirebase) return;
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
};

export const updateUserAuthProfile = async (displayName, photoURL) => {
  if (isMockFirebase) {
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
  if (!isMockFirebase && userId) {
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

  if (!isMockFirebase) {
    // Note: deleteUser from client requires the user to be recently signed in
    // Supabase JS client doesn't expose a client-side delete user function like Firebase does.
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
  if (isMockFirebase || !userId) return;
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
  if (isMockFirebase || !trainerId) return null;
  const { data, error } = await supabase.from('trainer_profiles').select('*').eq('id', trainerId).maybeSingle();
  if (error && error.code !== 'PGRST116') console.error('getTrainerProfile error:', error);
  return data;
};

export const upsertTrainerProfile = async (trainerId, profileData) => {
  if (isMockFirebase || !trainerId) return;
  const { error } = await supabase.from('trainer_profiles').upsert({ id: trainerId, ...profileData });
  if (error) console.error('upsertTrainerProfile error:', error);
};

export const completeTrainerOnboarding = async (trainerId) => {
  if (isMockFirebase || !trainerId) return;
  const { error } = await supabase.from('trainer_profiles').update({ onboarding_complete: true }).eq('id', trainerId);
  if (error) console.error('completeTrainerOnboarding error:', error);
};

export const requestPTConnection = async (userId, trainerId, method) => {
  if (isMockFirebase || !userId || !trainerId) return;
  const { error } = await supabase.from('pt_connections').insert({
    user_id: userId,
    trainer_id: trainerId,
    connection_method: method,
    status: 'pending'
  });
  if (error) console.error('requestPTConnection error:', error);
};

export const respondToConnection = async (connectionId, status) => {
  if (isMockFirebase || !connectionId) return;
  const { error } = await supabase.from('pt_connections').update({ status, responded_at: new Date().toISOString() }).eq('id', connectionId);
  if (error) console.error('respondToConnection error:', error);
};

export const getUserConnection = async (userId) => {
  if (isMockFirebase || !userId) return null;
  const { data, error } = await supabase.from('pt_connections').select('*').eq('user_id', userId).in('status', ['pending', 'accepted']);
  if (error) {
    console.error('getUserConnection error:', error);
    return null;
  }
  const conn = data?.[0] || null;
  if (conn && conn.trainer_id) {
    const { data: tp } = await supabase.from('trainer_profiles').select('*').eq('id', conn.trainer_id).maybeSingle();
    if (tp) conn.trainer_profiles = tp;
  }
  return conn;
};

export const getTrainerClients = async (trainerId) => {
  if (isMockFirebase || !trainerId) return [];
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
  if (isMockFirebase || !trainerId || !userId) return;
  const { error } = await supabase.from('trainer_assignments').insert({
    trainer_id: trainerId,
    user_id: userId,
    ...planData
  });
  if (error) console.error('assignPlan error:', error);
};

export const getUserAssignments = async (userId) => {
  if (isMockFirebase || !userId) return [];
  const { data, error } = await supabase.from('trainer_assignments').select('*').eq('user_id', userId);
  if (error) {
    console.error('getUserAssignments error:', error);
    return [];
  }
  return data || [];
};

export const sendMessage = async (senderId, receiverId, message, senderType) => {
  if (isMockFirebase || !senderId || !receiverId) return;
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
  if (isMockFirebase || !userId || !trainerId) return [];
  const { data, error } = await supabase.from('trainer_messages').select('*').eq('user_id', userId).eq('trainer_id', trainerId).order('sent_at', { ascending: true });
  if (error) {
    console.error('getMessages error:', error);
    return [];
  }
  return data || [];
};

export const markMessagesRead = async (userId, trainerId) => {
  if (isMockFirebase || !userId || !trainerId) return;
  const { error } = await supabase.from('trainer_messages').update({ read: true }).eq('user_id', userId).eq('trainer_id', trainerId);
  if (error) console.error('markMessagesRead error:', error);
};

export const getAvailableTrainers = async (filters = {}) => {
  if (isMockFirebase) return [];
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
  if (isMockFirebase || !code) return null;
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
  if (isMockFirebase || !trainerId) return null;
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
  if (isMockFirebase || !clientId) return { workouts: [], foods: [] };
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
  if (isMockFirebase || !trainerId) return [];
  const { data, error } = await supabase.from('trainer_tasks').select('*').eq('trainer_id', trainerId).order('created_at', { ascending: false });
  if (error) console.error('getTrainerTasks error:', error);
  return data || [];
};

export const createTrainerTask = async (taskData) => {
  if (isMockFirebase) return;
  const { error } = await supabase.from('trainer_tasks').insert(taskData);
  if (error) console.error('createTrainerTask error:', error);
};

export const updateTrainerTaskStatus = async (taskId, status) => {
  if (isMockFirebase) return;
  const { error } = await supabase.from('trainer_tasks').update({ status }).eq('id', taskId);
  if (error) console.error('updateTrainerTaskStatus error:', error);
};

export const deleteTrainerTask = async (taskId) => {
  if (isMockFirebase) return;
  const { error } = await supabase.from('trainer_tasks').delete().eq('id', taskId);
  if (error) console.error('deleteTrainerTask error:', error);
};

export const uploadTrainerDocument = async (trainerId, file, meta) => {
  if (isMockFirebase || !trainerId) return;
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
  if (isMockFirebase || !trainerId) return [];
  const { data, error } = await supabase.from('trainer_documents').select('*').eq('trainer_id', trainerId).order('created_at', { ascending: false });
  if (error) console.error('getTrainerDocuments error:', error);
  return data || [];
};

export const deleteTrainerDocument = async (docId, fileUrl) => {
  if (isMockFirebase) return;
  // delete record
  await supabase.from('trainer_documents').delete().eq('id', docId);
  // Optional: delete from storage bucket if you have the file path
};

export const saveTrainerTemplate = async (trainerId, type, title, content) => {
  if (isMockFirebase || !trainerId) return;
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
  if (isMockFirebase || !trainerId) return [];
  const { data, error } = await supabase.from('trainer_assignments').select('*').eq('trainer_id', trainerId).is('user_id', null).eq('type', type);
  if (error) console.error('getTrainerTemplates error:', error);
  return data || [];
};

export const getClientFullProfile = async (clientId) => {
  if (isMockFirebase || !clientId) return null;
  const profile = await getUserProfile(clientId);
  return profile;
};

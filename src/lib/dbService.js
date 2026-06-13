import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  updateEmail,
  updatePassword,
  updateProfile,
  deleteUser
} from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

// Helper to determine if Firebase is fully configured or running mock
const isMockFirebase = !auth.app.options.apiKey || auth.app.options.apiKey === "mock-api-key";

// Local storage state structure for fallback
const LOCAL_STATE_KEY = "calyxo_pwa_state";
const getLocalState = () => {
  const saved = localStorage.getItem(LOCAL_STATE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error("Local state parse error", e);
    }
  }
  return {
    foodLogs: [],
    workoutLogs: [],
    weightLogs: [],
    waterIntake: 0,
    userProfile: { gender: "male", age: 25, weight: 70, height: 175, activity: 1.55, goal: "lose" }
  };
};

const saveLocalState = (state) => {
  localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state));
};

/* ==========================================================================
   AUTHENTICATION API
   ========================================================================== */

export const signUpUser = async (email, password, remember = true) => {
  if (isMockFirebase) {
    // Mock Signup
    const mockUser = { uid: "mock-user-id", email };
    localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    return mockUser;
  }
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const signInUser = async (email, password, remember = true) => {
  if (isMockFirebase) {
    // Mock Login
    const mockUser = { uid: "mock-user-id", email };
    localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    return mockUser;
  }
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const signInWithGoogle = async (remember = true) => {
  if (isMockFirebase) {
    const mockUser = { uid: "mock-google-user", email: "google.tester@calyxo.com", displayName: "Google Tester" };
    localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    return mockUser;
  }
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
};

export const signInWithApple = async (remember = true) => {
  if (isMockFirebase) {
    const mockUser = { uid: "mock-apple-user", email: "apple.tester@calyxo.com", displayName: "Apple Tester" };
    localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    return mockUser;
  }
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  const provider = new OAuthProvider("apple.com");
  const credential = await signInWithPopup(auth, provider);
  return credential.user;
};

export const signOutUser = async () => {
  if (isMockFirebase) {
    localStorage.removeItem("calyxo_mock_user");
    return;
  }
  await fbSignOut(auth);
};

export const subscribeToAuth = (callback) => {
  if (isMockFirebase) {
    // Trigger callback with mock user if exists
    const mockUserRaw = localStorage.getItem("calyxo_mock_user");
    const mockUser = mockUserRaw ? JSON.parse(mockUserRaw) : null;
    callback(mockUser);

    // Return a dummy unsubscribe function
    return () => { };
  }
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
};

/* ==========================================================================
   FOOD LOGGING API
   ========================================================================== */

export const getFoodLogs = async (userId) => {
  if (isMockFirebase || !userId) {
    return getLocalState().foodLogs;
  }
  try {
    const q = query(
      collection(db, "food_logs"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore getFoodLogs error, falling back to LocalStorage:", err);
    return getLocalState().foodLogs;
  }
};

export const addFoodLog = async (userId, item) => {
  const logItem = { ...item, userId, timestamp: Date.now() };

  // Always write locally as cache
  const state = getLocalState();
  state.foodLogs.push(logItem);
  saveLocalState(state);

  if (isMockFirebase || !userId) return logItem;

  try {
    const docRef = await addDoc(collection(db, "food_logs"), logItem);
    return { id: docRef.id, ...logItem };
  } catch (err) {
    console.error("Firestore addFoodLog error", err);
    return logItem;
  }
};

export const deleteFoodLog = async (userId, logId) => {
  // Always filter locally
  const state = getLocalState();
  state.foodLogs = state.foodLogs.filter(x => x.id !== logId && x.timestamp !== logId);
  saveLocalState(state);

  if (isMockFirebase || !userId || typeof logId === 'number') return;

  try {
    await deleteDoc(doc(db, "food_logs", logId));
  } catch (err) {
    console.error("Firestore deleteFoodLog error", err);
  }
};

/* ==========================================================================
   WORKOUT LOGGING API
   ========================================================================== */

export const getWorkoutLogs = async (userId) => {
  if (isMockFirebase || !userId) {
    return getLocalState().workoutLogs;
  }
  try {
    const q = query(
      collection(db, "workout_logs"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore getWorkoutLogs error:", err);
    return getLocalState().workoutLogs;
  }
};

export const addWorkoutLog = async (userId, workout) => {
  const logItem = { ...workout, userId, timestamp: Date.now() };

  const state = getLocalState();
  state.workoutLogs.push(logItem);
  saveLocalState(state);

  if (isMockFirebase || !userId) return logItem;

  try {
    const docRef = await addDoc(collection(db, "workout_logs"), logItem);
    return { id: docRef.id, ...logItem };
  } catch (err) {
    console.error("Firestore addWorkoutLog error", err);
    return logItem;
  }
};

/* ==========================================================================
   HYDRATION API
   ========================================================================== */

export const getWaterIntake = async (userId) => {
  if (isMockFirebase || !userId) {
    return getLocalState().waterIntake;
  }
  try {
    const docRef = doc(db, "users_metrics", `${userId}_water`);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      // Check if logged today
      const today = new Date().toDateString();
      if (data.date === today) {
        return data.amount;
      }
    }
    return 0;
  } catch (err) {
    return getLocalState().waterIntake;
  }
};

export const saveWaterIntake = async (userId, amount) => {
  const today = new Date().toDateString();
  const state = getLocalState();
  state.waterIntake = amount;
  saveLocalState(state);

  if (isMockFirebase || !userId) return;

  try {
    await setDoc(doc(db, "users_metrics", `${userId}_water`), {
      amount,
      date: today,
      userId
    });
  } catch (err) {
    console.error("Firestore saveWaterIntake error", err);
  }
};

/* ==========================================================================
   WEIGHT API
   ========================================================================== */

export const getWeightLogs = async (userId) => {
  if (isMockFirebase || !userId) {
    return getLocalState().weightLogs;
  }
  try {
    const q = query(
      collection(db, "weight_logs"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
  } catch (err) {
    return getLocalState().weightLogs;
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

  const state = getLocalState();
  state.weightLogs.push(entry);
  if (state.weightLogs.length > 10) {
    state.weightLogs.shift();
  }
  saveLocalState(state);

  if (isMockFirebase || !userId) return entry;

  try {
    const docRef = await addDoc(collection(db, "weight_logs"), entry);
    return { id: docRef.id, ...entry };
  } catch (err) {
    console.error("Firestore addWeightLog error", err);
    return entry;
  }
};

/* ==========================================================================
   USER PROFILE BIOMETRICS
   ========================================================================== */

export const getUserProfile = async (userId) => {
  if (isMockFirebase || !userId) {
    return getLocalState().userProfile;
  }
  try {
    const docRef = doc(db, "users_metrics", `${userId}_profile`);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data();
    }
    return getLocalState().userProfile;
  } catch (err) {
    return getLocalState().userProfile;
  }
};

export const saveUserProfile = async (userId, profile) => {
  const state = getLocalState();
  state.userProfile = profile;
  saveLocalState(state);

  if (isMockFirebase || !userId) return;

  try {
    await setDoc(doc(db, "users_metrics", `${userId}_profile`), {
      ...profile,
      userId
    });
  } catch (err) {
    console.error("Firestore saveUserProfile error", err);
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

  // Always cache locally in mock local storage mode
  const savedLogsRaw = localStorage.getItem("calyxo_training_logs") || "[]";
  let logs = [];
  try {
    logs = JSON.parse(savedLogsRaw);
  } catch (e) {
    logs = [];
  }
  logs.push(logItem);
  localStorage.setItem("calyxo_training_logs", JSON.stringify(logs));

  if (isMockFirebase || !userId) return logItem;

  try {
    const docRef = await addDoc(collection(db, "TrainingLogs"), logItem);
    return { id: docRef.id, ...logItem };
  } catch (err) {
    console.error("Firestore addTrainingLog error", err);
    return logItem;
  }
};

export const getPositiveTrainingLogs = async (userId) => {
  // Try reading local storage first as a direct source (covers mock mode)
  const savedLogsRaw = localStorage.getItem("calyxo_training_logs") || "[]";
  let localLogs = [];
  try {
    localLogs = JSON.parse(savedLogsRaw);
  } catch (e) {
    localLogs = [];
  }
  const positiveLocal = localLogs.filter(log => log.rating === 1);

  if (isMockFirebase || !userId) {
    return positiveLocal;
  }

  try {
    const q = query(
      collection(db, "TrainingLogs"),
      where("userId", "==", userId),
      where("rating", "==", 1)
    );
    const snap = await getDocs(q);
    const firestoreLogs = snap.docs.map(doc => doc.data());

    // Merge both sources and deduplicate by timestamp
    const allLogs = [...firestoreLogs, ...positiveLocal];
    const seen = new Set();
    return allLogs.filter(item => {
      const key = `${item.timestamp}_${item.user_query}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch (err) {
    console.error("Firestore getPositiveTrainingLogs error, using local logs:", err);
    return positiveLocal;
  }
};

/* ==========================================================================
   CHAT SESSION HISTORY API
   ========================================================================== */

export const getChatSessions = async (userId) => {
  if (isMockFirebase || !userId) {
    const saved = localStorage.getItem("calyxo_chat_sessions");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Local chat sessions parse error", e);
      }
    }
    return [];
  }
  try {
    const q = query(
      collection(db, "chat_sessions"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore getChatSessions error, falling back to local:", err);
    const saved = localStorage.getItem("calyxo_chat_sessions");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }
};

export const saveChatSession = async (userId, session) => {
  // Always update locally first
  let localSessions = [];
  const saved = localStorage.getItem("calyxo_chat_sessions");
  if (saved) {
    try {
      localSessions = JSON.parse(saved);
    } catch (e) { }
  }

  const idx = localSessions.findIndex(s => s.id === session.id);
  const updatedSession = { ...session, userId, updatedAt: Date.now() };
  if (idx > -1) {
    localSessions[idx] = updatedSession;
  } else {
    localSessions.unshift(updatedSession);
  }
  // Sort local sessions
  localSessions.sort((a, b) => b.updatedAt - a.updatedAt);
  localStorage.setItem("calyxo_chat_sessions", JSON.stringify(localSessions));

  if (isMockFirebase || !userId) return updatedSession;

  try {
    await setDoc(doc(db, "chat_sessions", session.id), updatedSession);
    return updatedSession;
  } catch (err) {
    console.error("Firestore saveChatSession error", err);
    return updatedSession;
  }
};

export const deleteChatSession = async (userId, sessionId) => {
  // Local delete
  let localSessions = [];
  const saved = localStorage.getItem("calyxo_chat_sessions");
  if (saved) {
    try {
      localSessions = JSON.parse(saved);
    } catch (e) { }
  }
  localSessions = localSessions.filter(s => s.id !== sessionId);
  localStorage.setItem("calyxo_chat_sessions", JSON.stringify(localSessions));

  if (isMockFirebase || !userId) return;

  try {
    await deleteDoc(doc(db, "chat_sessions", sessionId));
  } catch (err) {
    console.error("Firestore deleteChatSession error", err);
  }
};

/* ==========================================================================
   CALYXO ECOSYSTEM STATE & SERVICES
   ========================================================================== */

export const getEcosystemState = async (userId) => {
  if (isMockFirebase || !userId) {
    const saved = localStorage.getItem("calyxo_ecosystem_db_state");
    try {
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }
  try {
    const docRef = doc(db, "users_ecosystem", userId);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error("Firestore getEcosystemState error:", err);
    return null;
  }
};

export const saveEcosystemState = async (userId, state) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem("calyxo_ecosystem_db_state", JSON.stringify(state));
  }
  if (isMockFirebase || !userId) return;
  try {
    await setDoc(doc(db, "users_ecosystem", userId), state);
  } catch (err) {
    console.error("Firestore saveEcosystemState error:", err);
  }
};

export const getMealScanLogs = async (userId) => {
  if (isMockFirebase || !userId) {
    const saved = localStorage.getItem("calyxo_meal_scans");
    try {
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }
  try {
    const q = query(
      collection(db, "meal_scans"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore getMealScanLogs error:", err);
    return [];
  }
};

export const addMealScanLog = async (userId, scanItem) => {
  const item = { ...scanItem, userId, timestamp: Date.now() };
  let local = [];
  const saved = localStorage.getItem("calyxo_meal_scans");
  if (saved) {
    try {
      local = JSON.parse(saved);
    } catch (e) { }
  }
  local.unshift(item);
  localStorage.setItem("calyxo_meal_scans", JSON.stringify(local));

  if (isMockFirebase || !userId) return item;
  try {
    const docRef = await addDoc(collection(db, "meal_scans"), item);
    return { id: docRef.id, ...item };
  } catch (err) {
    console.error("Firestore addMealScanLog error:", err);
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
  if (auth.currentUser) {
    await updateEmail(auth.currentUser, newEmail);
  }
};

export const updateUserPassword = async (newPassword) => {
  if (isMockFirebase) return;
  if (auth.currentUser) {
    await updatePassword(auth.currentUser, newPassword);
  }
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
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName, photoURL });
  }
};

export const deleteUserAccount = async (userId) => {
  if (!isMockFirebase && userId) {
    try {
      await deleteDoc(doc(db, "users_metrics", `${userId}_profile`));
      await deleteDoc(doc(db, "users_metrics", `${userId}_water`));
      await deleteDoc(doc(db, "users_ecosystem", userId));

      const foodSnap = await getDocs(query(collection(db, "food_logs"), where("userId", "==", userId)));
      foodSnap.forEach(async (d) => {
        await deleteDoc(doc(db, "food_logs", d.id));
      });
      const workoutSnap = await getDocs(query(collection(db, "workout_logs"), where("userId", "==", userId)));
      workoutSnap.forEach(async (d) => {
        await deleteDoc(doc(db, "workout_logs", d.id));
      });
      const weightSnap = await getDocs(query(collection(db, "weight_logs"), where("userId", "==", userId)));
      weightSnap.forEach(async (d) => {
        await deleteDoc(doc(db, "weight_logs", d.id));
      });
      const chatSnap = await getDocs(query(collection(db, "chat_sessions"), where("userId", "==", userId)));
      chatSnap.forEach(async (d) => {
        await deleteDoc(doc(db, "chat_sessions", d.id));
      });
      const scansSnap = await getDocs(query(collection(db, "meal_scans"), where("userId", "==", userId)));
      scansSnap.forEach(async (d) => {
        await deleteDoc(doc(db, "meal_scans", d.id));
      });

      // Purge Health Hub Collections
      const hmSnap = await getDocs(query(collection(db, "health_metrics"), where("userId", "==", userId)));
      hmSnap.forEach(async (d) => { await deleteDoc(doc(db, "health_metrics", d.id)); });

      const stepsSnap = await getDocs(query(collection(db, "steps_history"), where("userId", "==", userId)));
      stepsSnap.forEach(async (d) => { await deleteDoc(doc(db, "steps_history", d.id)); });

      const sleepSnap = await getDocs(query(collection(db, "sleep_history"), where("userId", "==", userId)));
      sleepSnap.forEach(async (d) => { await deleteDoc(doc(db, "sleep_history", d.id)); });

      const hrSnap = await getDocs(query(collection(db, "heart_rate_history"), where("userId", "==", userId)));
      hrSnap.forEach(async (d) => { await deleteDoc(doc(db, "heart_rate_history", d.id)); });

      const devSnap = await getDocs(query(collection(db, "device_connections"), where("userId", "==", userId)));
      devSnap.forEach(async (d) => { await deleteDoc(doc(db, "device_connections", d.id)); });

      const repSnap = await getDocs(query(collection(db, "health_reports"), where("userId", "==", userId)));
      repSnap.forEach(async (d) => { await deleteDoc(doc(db, "health_reports", d.id)); });

    } catch (e) {
      console.error("Purging Firestore collections error", e);
    }
  }

  localStorage.removeItem("calyxo_mock_user");
  localStorage.removeItem(LOCAL_STATE_KEY);
  localStorage.removeItem("calyxo_ecosystem_db_state");
  localStorage.removeItem("calyxo_chat_sessions");
  localStorage.removeItem("calyxo_meal_scans");
  localStorage.removeItem("calyxo_training_logs");
  localStorage.removeItem("calyxo_ecosystem_state");

  // Health Hub local state removal
  localStorage.removeItem("calyxo_health_metrics");
  localStorage.removeItem("calyxo_steps_history");
  localStorage.removeItem("calyxo_sleep_history");
  localStorage.removeItem("calyxo_heart_rate_history");
  localStorage.removeItem("calyxo_device_connections");
  localStorage.removeItem("calyxo_health_reports");

  if (!isMockFirebase && auth.currentUser) {
    await deleteUser(auth.currentUser);
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

  // Import Health Hub metrics for export
  const healthMetrics = await getHealthMetrics(userId);
  const stepsHistory = await getStepsHistory(userId);
  const sleepHistory = await getSleepHistory(userId);
  const heartRateHistory = await getHeartRateHistory(userId);
  const deviceConnections = await getDeviceConnections(userId);
  const healthReports = await getHealthReports(userId);

  const payload = {
    exportDate: new Date().toISOString(),
    userId: userId || "mock-user-id",
    profile,
    waterIntakeToday: waterIntake,
    foodLogs,
    workoutLogs,
    weightLogs,
    ecosystem,
    chatSessions,
    healthHub: {
      healthMetrics,
      stepsHistory,
      sleepHistory,
      heartRateHistory,
      deviceConnections,
      healthReports
    }
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
    const chatSnap = await getDocs(query(collection(db, "chat_sessions"), where("userId", "==", userId)));
    chatSnap.forEach(async (d) => {
      await deleteDoc(doc(db, "chat_sessions", d.id));
    });
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

/* ==========================================================================
   HEALTH HUB API SERVICES (NEW PHASE 19)
   ========================================================================== */

export const getHealthMetrics = async (userId) => {
  if (isMockFirebase || !userId) {
    const saved = localStorage.getItem("calyxo_health_metrics");
    return saved ? JSON.parse(saved) : [];
  }
  try {
    const q = query(
      collection(db, "health_metrics"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore getHealthMetrics error", err);
    const saved = localStorage.getItem("calyxo_health_metrics");
    return saved ? JSON.parse(saved) : [];
  }
};

export const saveHealthMetrics = async (userId, metrics) => {
  const dateStr = metrics.date || new Date().toISOString().split('T')[0];
  const docId = `${userId}_${dateStr}`;
  const record = { ...metrics, userId, date: dateStr, timestamp: Date.now() };

  // Sync to localstorage
  let local = [];
  const saved = localStorage.getItem("calyxo_health_metrics");
  if (saved) {
    try { local = JSON.parse(saved); } catch (e) {}
  }
  const idx = local.findIndex(x => x.date === dateStr);
  if (idx > -1) {
    local[idx] = record;
  } else {
    local.unshift(record);
  }
  localStorage.setItem("calyxo_health_metrics", JSON.stringify(local));

  if (isMockFirebase || !userId) return record;

  try {
    await setDoc(doc(db, "health_metrics", docId), record);
    return record;
  } catch (err) {
    console.error("Firestore saveHealthMetrics error", err);
    return record;
  }
};

export const getStepsHistory = async (userId) => {
  if (isMockFirebase || !userId) {
    const saved = localStorage.getItem("calyxo_steps_history");
    return saved ? JSON.parse(saved) : [];
  }
  try {
    const q = query(
      collection(db, "steps_history"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore getStepsHistory error", err);
    const saved = localStorage.getItem("calyxo_steps_history");
    return saved ? JSON.parse(saved) : [];
  }
};

export const addStepsHistory = async (userId, entry) => {
  const record = { ...entry, userId, timestamp: Date.now() };

  let local = [];
  const saved = localStorage.getItem("calyxo_steps_history");
  if (saved) {
    try { local = JSON.parse(saved); } catch (e) {}
  }
  local.unshift(record);
  localStorage.setItem("calyxo_steps_history", JSON.stringify(local));

  if (isMockFirebase || !userId) return record;

  try {
    const docRef = await addDoc(collection(db, "steps_history"), record);
    return { id: docRef.id, ...record };
  } catch (err) {
    console.error("Firestore addStepsHistory error", err);
    return record;
  }
};

export const getSleepHistory = async (userId) => {
  if (isMockFirebase || !userId) {
    const saved = localStorage.getItem("calyxo_sleep_history");
    return saved ? JSON.parse(saved) : [];
  }
  try {
    const q = query(
      collection(db, "sleep_history"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore getSleepHistory error", err);
    const saved = localStorage.getItem("calyxo_sleep_history");
    return saved ? JSON.parse(saved) : [];
  }
};

export const addSleepHistory = async (userId, entry) => {
  const record = { ...entry, userId, timestamp: Date.now() };

  let local = [];
  const saved = localStorage.getItem("calyxo_sleep_history");
  if (saved) {
    try { local = JSON.parse(saved); } catch (e) {}
  }
  local.unshift(record);
  localStorage.setItem("calyxo_sleep_history", JSON.stringify(local));

  if (isMockFirebase || !userId) return record;

  try {
    const docRef = await addDoc(collection(db, "sleep_history"), record);
    return { id: docRef.id, ...record };
  } catch (err) {
    console.error("Firestore addSleepHistory error", err);
    return record;
  }
};

export const getHeartRateHistory = async (userId) => {
  if (isMockFirebase || !userId) {
    const saved = localStorage.getItem("calyxo_heart_rate_history");
    return saved ? JSON.parse(saved) : [];
  }
  try {
    const q = query(
      collection(db, "heart_rate_history"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore getHeartRateHistory error", err);
    const saved = localStorage.getItem("calyxo_heart_rate_history");
    return saved ? JSON.parse(saved) : [];
  }
};

export const addHeartRateHistory = async (userId, entry) => {
  const record = { ...entry, userId, timestamp: Date.now() };

  let local = [];
  const saved = localStorage.getItem("calyxo_heart_rate_history");
  if (saved) {
    try { local = JSON.parse(saved); } catch (e) {}
  }
  local.unshift(record);
  localStorage.setItem("calyxo_heart_rate_history", JSON.stringify(local));

  if (isMockFirebase || !userId) return record;

  try {
    const docRef = await addDoc(collection(db, "heart_rate_history"), record);
    return { id: docRef.id, ...record };
  } catch (err) {
    console.error("Firestore addHeartRateHistory error", err);
    return record;
  }
};

export const getDeviceConnections = async (userId) => {
  if (isMockFirebase || !userId) {
    const saved = localStorage.getItem("calyxo_device_connections");
    return saved ? JSON.parse(saved) : [];
  }
  try {
    const q = query(
      collection(db, "device_connections"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore getDeviceConnections error", err);
    const saved = localStorage.getItem("calyxo_device_connections");
    return saved ? JSON.parse(saved) : [];
  }
};

export const saveDeviceConnection = async (userId, connection) => {
  const provider = connection.provider;
  const docId = `${userId}_${provider}`;
  const record = { ...connection, userId, timestamp: Date.now() };

  let local = [];
  const saved = localStorage.getItem("calyxo_device_connections");
  if (saved) {
    try { local = JSON.parse(saved); } catch (e) {}
  }
  const idx = local.findIndex(x => x.provider === provider);
  if (idx > -1) {
    local[idx] = record;
  } else {
    local.push(record);
  }
  localStorage.setItem("calyxo_device_connections", JSON.stringify(local));

  if (isMockFirebase || !userId) return record;

  try {
    await setDoc(doc(db, "device_connections", docId), record);
    return record;
  } catch (err) {
    console.error("Firestore saveDeviceConnection error", err);
    return record;
  }
};

export const getHealthReports = async (userId) => {
  if (isMockFirebase || !userId) {
    const saved = localStorage.getItem("calyxo_health_reports");
    return saved ? JSON.parse(saved) : [];
  }
  try {
    const q = query(
      collection(db, "health_reports"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore getHealthReports error", err);
    const saved = localStorage.getItem("calyxo_health_reports");
    return saved ? JSON.parse(saved) : [];
  }
};

export const saveHealthReport = async (userId, report) => {
  const record = { ...report, userId, timestamp: Date.now() };

  let local = [];
  const saved = localStorage.getItem("calyxo_health_reports");
  if (saved) {
    try { local = JSON.parse(saved); } catch (e) {}
  }
  local.unshift(record);
  localStorage.setItem("calyxo_health_reports", JSON.stringify(local));

  if (isMockFirebase || !userId) return record;

  try {
    const docRef = await addDoc(collection(db, "health_reports"), record);
    return { id: docRef.id, ...record };
  } catch (err) {
    console.error("Firestore saveHealthReport error", err);
    return record;
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
   ROLE BASED ACCESS CONTROL (RBAC) SERVICE METHODS (NEW PHASE 20)
   ========================================================================== */

export const fetchTrainerClients = async (trainerId) => {
  if (isMockFirebase || !trainerId) {
    const saved = localStorage.getItem("calyxo_trainer_clients");
    if (!saved) {
      const defaultClients = [
        { id: "tc_1", trainerId, clientId: "mock-arjun-id", clientName: "Arjun Patel", clientEmail: "client.arjun@calyxo.com", status: "Active", dateConnected: "06/01/2026", timestamp: Date.now() - 86400000 * 5 },
        { id: "tc_2", trainerId, clientId: "mock-sarah-id", clientName: "Sarah Chen", clientEmail: "client.sarah@calyxo.com", status: "Pending", dateConnected: "06/10/2026", timestamp: Date.now() - 86400000 }
      ];
      localStorage.setItem("calyxo_trainer_clients", JSON.stringify(defaultClients));
      return defaultClients;
    }
    return JSON.parse(saved);
  }
  try {
    const q = query(collection(db, "trainer_clients"), where("trainerId", "==", trainerId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore fetchTrainerClients error", err);
    return JSON.parse(localStorage.getItem("calyxo_trainer_clients") || "[]");
  }
};

export const fetchDietitianClients = async (dietitianId) => {
  if (isMockFirebase || !dietitianId) {
    const saved = localStorage.getItem("calyxo_dietitian_clients");
    if (!saved) {
      const defaultClients = [
        { id: "dc_1", dietitianId, clientId: "mock-arjun-id", clientName: "Arjun Patel", clientEmail: "client.arjun@calyxo.com", status: "Active", dateConnected: "06/02/2026", timestamp: Date.now() - 86400000 * 4 }
      ];
      localStorage.setItem("calyxo_dietitian_clients", JSON.stringify(defaultClients));
      return defaultClients;
    }
    return JSON.parse(saved);
  }
  try {
    const q = query(collection(db, "dietitian_clients"), where("dietitianId", "==", dietitianId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore fetchDietitianClients error", err);
    return JSON.parse(localStorage.getItem("calyxo_dietitian_clients") || "[]");
  }
};

export const sendClientInvitation = async (inviterId, email, type, inviterName) => {
  const cleanEmail = email.toLowerCase().trim();
  
  const invitation = {
    id: `invite_${Date.now()}`,
    inviterId,
    inviterName,
    clientEmail: cleanEmail,
    type,
    status: "Pending",
    timestamp: Date.now()
  };

  if (isMockFirebase || !inviterId) {
    const savedInvites = JSON.parse(localStorage.getItem("calyxo_client_invitations") || "[]");
    savedInvites.unshift(invitation);
    localStorage.setItem("calyxo_client_invitations", JSON.stringify(savedInvites));

    // Auto connect client if match mock credentials
    const clientName = cleanEmail.includes("arjun") ? "Arjun Patel" : cleanEmail.includes("sarah") ? "Sarah Chen" : cleanEmail.split("@")[0];
    const clientId = cleanEmail.includes("arjun") ? "mock-arjun-id" : cleanEmail.includes("sarah") ? "mock-sarah-id" : `client_${Date.now()}`;

    if (type === 'trainer') {
      const clients = JSON.parse(localStorage.getItem("calyxo_trainer_clients") || "[]");
      clients.push({
        id: `tc_${Date.now()}`,
        trainerId: inviterId,
        clientId,
        clientName,
        clientEmail: cleanEmail,
        status: "Active",
        dateConnected: new Date().toLocaleDateString(),
        timestamp: Date.now()
      });
      localStorage.setItem("calyxo_trainer_clients", JSON.stringify(clients));
    } else {
      const clients = JSON.parse(localStorage.getItem("calyxo_dietitian_clients") || "[]");
      clients.push({
        id: `dc_${Date.now()}`,
        dietitianId: inviterId,
        clientId,
        clientName,
        clientEmail: cleanEmail,
        status: "Active",
        dateConnected: new Date().toLocaleDateString(),
        timestamp: Date.now()
      });
      localStorage.setItem("calyxo_dietitian_clients", JSON.stringify(clients));
    }
    return true;
  }

  try {
    await addDoc(collection(db, "client_invitations"), invitation);

    const usersSnap = await getDocs(query(collection(db, "users_metrics"), where("email", "==", cleanEmail)));
    let clientName = cleanEmail.split("@")[0];
    let clientId = `client_${Date.now()}`;
    if (!usersSnap.empty) {
      const clientData = usersSnap.docs[0].data();
      clientName = `${clientData.firstName || ''} ${clientData.lastName || ''}`.trim() || clientName;
      clientId = usersSnap.docs[0].id.replace('_profile', '');
    }

    const connectionDoc = {
      trainerId: type === 'trainer' ? inviterId : null,
      dietitianId: type === 'dietitian' ? inviterId : null,
      clientId,
      clientName,
      clientEmail: cleanEmail,
      status: "Active",
      dateConnected: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };

    const targetColl = type === 'trainer' ? "trainer_clients" : "dietitian_clients";
    await addDoc(collection(db, targetColl), connectionDoc);
    return true;
  } catch (err) {
    console.error("Firestore sendClientInvitation error", err);
    return false;
  }
};

export const assignWorkoutToClient = async (assignment) => {
  if (isMockFirebase) {
    const saved = JSON.parse(localStorage.getItem("calyxo_assigned_workouts") || "[]");
    const record = { id: `aw_${Date.now()}`, ...assignment };
    saved.unshift(record);
    localStorage.setItem("calyxo_assigned_workouts", JSON.stringify(saved));
    return record;
  }
  try {
    const docRef = await addDoc(collection(db, "assigned_workouts"), assignment);
    return { id: docRef.id, ...assignment };
  } catch (err) {
    console.error("Firestore assignWorkoutToClient error", err);
    return null;
  }
};

export const assignMealPlanToClient = async (assignment) => {
  if (isMockFirebase) {
    const saved = JSON.parse(localStorage.getItem("calyxo_assigned_meal_plans") || "[]");
    const record = { id: `amp_${Date.now()}`, ...assignment };
    saved.unshift(record);
    localStorage.setItem("calyxo_assigned_meal_plans", JSON.stringify(saved));
    return record;
  }
  try {
    const docRef = await addDoc(collection(db, "assigned_meal_plans"), assignment);
    return { id: docRef.id, ...assignment };
  } catch (err) {
    console.error("Firestore assignMealPlanToClient error", err);
    return null;
  }
};

export const fetchAssignedWorkouts = async (clientId) => {
  if (isMockFirebase || !clientId) {
    const saved = localStorage.getItem("calyxo_assigned_workouts");
    if (!saved) {
      const defaultAssignments = [
        { id: "aw_default", trainerId: "mock-trainer-id", trainerName: "Coach Bob", clientId, workoutName: "Hypertrophy Push Day", exercises: [{ name: "Flat Bench Press", sets: 4, reps: 8, weight: 60 }, { name: "Incline DB Press", sets: 3, reps: 10, weight: 22 }, { name: "Lateral Raises", sets: 4, reps: 15, weight: 10 }], notes: "Maintain controlled eccentrics. Hydrate well.", dateAssigned: new Date().toLocaleDateString(), timestamp: Date.now() }
      ];
      localStorage.setItem("calyxo_assigned_workouts", JSON.stringify(defaultAssignments));
      return defaultAssignments;
    }
    return JSON.parse(saved).filter(x => x.clientId === clientId);
  }
  try {
    const q = query(
      collection(db, "assigned_workouts"),
      where("clientId", "==", clientId),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore fetchAssignedWorkouts error", err);
    return JSON.parse(localStorage.getItem("calyxo_assigned_workouts") || "[]").filter(x => x.clientId === clientId);
  }
};

export const fetchAssignedMealPlans = async (clientId) => {
  if (isMockFirebase || !clientId) {
    const saved = localStorage.getItem("calyxo_assigned_meal_plans");
    if (!saved) {
      const defaultAssignments = [
        { id: "amp_default", dietitianId: "mock-dietitian-id", dietitianName: "Dr. Sarah Miller", clientId, calories: 2300, protein: 145, carbs: 230, fat: 65, meals: { breakfast: "4 scrambled eggs, oatmeal with banana, honey", lunch: "Grilled chicken, quinoa, spinach salad", dinner: "Baked salmon, jasmine rice, steamed broccoli", snacks: "Greek yogurt with strawberries, whey protein shake" }, dateAssigned: new Date().toLocaleDateString(), timestamp: Date.now() }
      ];
      localStorage.setItem("calyxo_assigned_meal_plans", JSON.stringify(defaultAssignments));
      return defaultAssignments;
    }
    return JSON.parse(saved).filter(x => x.clientId === clientId);
  }
  try {
    const q = query(
      collection(db, "assigned_meal_plans"),
      where("clientId", "==", clientId),
      orderBy("timestamp", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore fetchAssignedMealPlans error", err);
    return JSON.parse(localStorage.getItem("calyxo_assigned_meal_plans") || "[]").filter(x => x.clientId === clientId);
  }
};

export const fetchAllUsers = async () => {
  if (isMockFirebase) {
    const saved = localStorage.getItem("calyxo_users");
    if (!saved) {
      const defaultUsers = [
        { uid: "mock-user-id", email: "tester@calyxo.com", name: "Calyxo Tester", role: "admin", createdAt: "05/20/2026" },
        { uid: "mock-arjun-id", email: "client.arjun@calyxo.com", name: "Arjun Patel", role: "user", createdAt: "05/22/2026" },
        { uid: "mock-sarah-id", email: "client.sarah@calyxo.com", name: "Sarah Chen", role: "user", createdAt: "05/25/2026" },
        { uid: "mock-trainer-id", email: "trainer.bob@calyxo.com", name: "Coach Bob", role: "trainer", createdAt: "05/18/2026" },
        { uid: "mock-dietitian-id", email: "dietitian.jane@calyxo.com", name: "Dr. Jane Smith", role: "dietitian", createdAt: "05/19/2026" }
      ];
      localStorage.setItem("calyxo_users", JSON.stringify(defaultUsers));
      return defaultUsers;
    }
    return JSON.parse(saved);
  }
  try {
    const snap = await getDocs(collection(db, "users_metrics"));
    return snap.docs
      .filter(doc => doc.id.endsWith("_profile"))
      .map(doc => {
        const data = doc.data();
        return {
          uid: doc.id.replace("_profile", ""),
          email: data.email || "unknown@calyxo.com",
          name: `${data.firstName || ''} ${data.lastName || ''}`.trim() || data.nickname || "User",
          role: data.role || "user",
          createdAt: new Date(data.timestamp || Date.now()).toLocaleDateString()
        };
      });
  } catch (err) {
    console.error("Firestore fetchAllUsers error", err);
    return JSON.parse(localStorage.getItem("calyxo_users") || "[]");
  }
};

export const updateUserRole = async (userId, newRole) => {
  if (isMockFirebase || !userId) {
    const users = JSON.parse(localStorage.getItem("calyxo_users") || "[]");
    const idx = users.findIndex(u => u.uid === userId);
    if (idx > -1) {
      users[idx].role = newRole;
      localStorage.setItem("calyxo_users", JSON.stringify(users));
    }
    
    const state = getLocalState();
    if (userId === 'mock-user-id' || userId === state.userProfile?.userId) {
      state.userProfile.role = newRole;
      saveLocalState(state);
    }
    return true;
  }

  try {
    const profileRef = doc(db, "users_metrics", `${userId}_profile`);
    await setDoc(profileRef, { role: newRole }, { merge: true });

    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { role: newRole }, { merge: true });

    return true;
  } catch (err) {
    console.error("Firestore updateUserRole error", err);
    return false;
  }
};



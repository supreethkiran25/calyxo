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
    return () => {};
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
    } catch (e) {}
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
    } catch (e) {}
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
    } catch (e) {}
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

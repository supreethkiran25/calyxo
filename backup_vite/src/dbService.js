import { auth, db } from "./firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as fbSignOut, 
  onAuthStateChanged 
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

export const signUpUser = async (email, password) => {
  if (isMockFirebase) {
    // Mock Signup
    const mockUser = { uid: "mock-user-id", email };
    localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    return mockUser;
  }
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  return credential.user;
};

export const signInUser = async (email, password) => {
  if (isMockFirebase) {
    // Mock Login
    const mockUser = { uid: "mock-user-id", email };
    localStorage.setItem("calyxo_mock_user", JSON.stringify(mockUser));
    return mockUser;
  }
  const credential = await signInWithEmailAndPassword(auth, email, password);
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

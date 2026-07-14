import { db, auth } from "./firebase";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { getUserProfile, isMockFirebase } from "./dbService";

// Mock Data keys
const MOCK_SOCIAL_PROFILES_KEY = "calyxo_social_profiles";
const MOCK_REPUTATION_LOGS_KEY = "calyxo_reputation_logs";

const getMockData = (key) => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error reading mock data", key, e);
    return [];
  }
};

const saveMockData = (key, data) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving mock data", key, e);
  }
};

/* ==========================================================================
   SOCIAL PROFILES
   ========================================================================== */

const defaultSocialProfile = {
  displayName: "Calyxo Athlete",
  bio: "",
  pronouns: "",
  website: "",
  location: "",
  bannerTheme: "gradient-1", // predefined gradients: gradient-1, gradient-2, dark-mesh, etc.
  bannerUrl: "",
  fitnessInterests: [],
  favoriteSports: [],
  joinedClubs: [],
  reputationScore: 0,
  reputationLevel: 1, // calculated
  communityRank: "Novice", // Novice, Contributor, Expert, Elite, Legend
  featuredAchievement: null,
  featuredTransformation: null,
  isSetup: false
};

// Calculate level and rank from score
export const calculateReputationDetails = (score) => {
  const level = Math.floor(Math.sqrt(score / 50)) + 1;
  let rank = "Novice";
  if (score >= 5000) rank = "Legend";
  else if (score >= 2000) rank = "Elite";
  else if (score >= 500) rank = "Expert";
  else if (score >= 100) rank = "Contributor";
  
  return { level, rank };
};

export const getSocialProfile = async (userId) => {
  if (!userId) return null;

  if (isMockFirebase) {
    const profiles = getMockData(MOCK_SOCIAL_PROFILES_KEY);
    const existing = profiles.find(p => p.userId === userId);
    if (existing) return existing;
    
    // Auto-migrate from base profile if it doesn't exist
    const baseProfile = await getUserProfile(userId);
    const newProfile = {
      userId,
      ...defaultSocialProfile,
      displayName: baseProfile?.nickname || baseProfile?.firstName || "Calyxo Athlete",
      fitnessInterests: baseProfile?.healthInterests || [],
    };
    saveMockData(MOCK_SOCIAL_PROFILES_KEY, [...profiles, newProfile]);
    return newProfile;
  }

  try {
    const docRef = doc(db, "social_profiles", userId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { userId: snap.id, ...snap.data() };
    }

    // Auto-migrate
    const baseProfile = await getUserProfile(userId);
    const newProfile = {
      userId,
      ...defaultSocialProfile,
      displayName: baseProfile?.nickname || baseProfile?.firstName || "Calyxo Athlete",
      fitnessInterests: baseProfile?.healthInterests || [],
    };
    await setDoc(docRef, newProfile);
    return newProfile;
  } catch (err) {
    console.error("Error fetching social profile", err);
    return null;
  }
};

export const updateSocialProfile = async (userId, updates) => {
  if (!userId) throw new Error("Missing user ID");

  if (isMockFirebase) {
    const profiles = getMockData(MOCK_SOCIAL_PROFILES_KEY);
    const index = profiles.findIndex(p => p.userId === userId);
    let updated;
    if (index !== -1) {
      updated = { ...profiles[index], ...updates, isSetup: true };
      profiles[index] = updated;
    } else {
      updated = { userId, ...defaultSocialProfile, ...updates, isSetup: true };
      profiles.push(updated);
    }
    saveMockData(MOCK_SOCIAL_PROFILES_KEY, profiles);
    return updated;
  }

  try {
    const docRef = doc(db, "social_profiles", userId);
    await setDoc(docRef, { ...updates, isSetup: true }, { merge: true });
    return { userId, ...updates, isSetup: true };
  } catch (err) {
    console.error("Error updating social profile", err);
    throw new Error("Failed to update social profile");
  }
};

/* ==========================================================================
   REPUTATION SYSTEM
   ========================================================================== */

export const awardReputation = async (userId, amount, reason, actionType) => {
  if (!userId || amount <= 0) return;

  const logEntry = {
    userId,
    amount,
    reason,
    actionType,
    timestamp: Date.now()
  };

  if (isMockFirebase) {
    // Save log
    const logs = getMockData(MOCK_REPUTATION_LOGS_KEY);
    logs.unshift({ id: `rep_${Date.now()}`, ...logEntry });
    saveMockData(MOCK_REPUTATION_LOGS_KEY, logs);

    // Update profile score
    const profiles = getMockData(MOCK_SOCIAL_PROFILES_KEY);
    const pIndex = profiles.findIndex(p => p.userId === userId);
    if (pIndex !== -1) {
      const newScore = (profiles[pIndex].reputationScore || 0) + amount;
      const { level, rank } = calculateReputationDetails(newScore);
      profiles[pIndex].reputationScore = newScore;
      profiles[pIndex].reputationLevel = level;
      profiles[pIndex].communityRank = rank;
      saveMockData(MOCK_SOCIAL_PROFILES_KEY, profiles);
      
      if (typeof window !== 'undefined') {
         window.dispatchEvent(new CustomEvent("calyxo_reputation_update", { detail: { score: newScore, level, rank } }));
      }
    }
    return;
  }

  try {
    // Write log (optional, could be batched, but we'll do direct for now)
    const logRef = doc(collection(db, "reputation_logs"));
    await setDoc(logRef, logEntry);

    // Update profile
    const pRef = doc(db, "social_profiles", userId);
    const pSnap = await getDoc(pRef);
    if (pSnap.exists()) {
      const newScore = (pSnap.data().reputationScore || 0) + amount;
      const { level, rank } = calculateReputationDetails(newScore);
      await updateDoc(pRef, {
        reputationScore: newScore,
        reputationLevel: level,
        communityRank: rank
      });
    }
  } catch (err) {
    console.error("Error awarding reputation", err);
  }
};

export const getReputationLogs = async (userId) => {
  if (!userId) return [];
  
  if (isMockFirebase) {
    const logs = getMockData(MOCK_REPUTATION_LOGS_KEY);
    return logs.filter(l => l.userId === userId).slice(0, 50);
  }

  try {
    const q = query(
      collection(db, "reputation_logs"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Error fetching reputation logs", err);
    return [];
  }
};

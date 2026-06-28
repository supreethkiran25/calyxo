import { auth, db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  runTransaction,
  limit
} from "firebase/firestore";

// Helper to determine mock mode
const isMockFirebase = !auth.app.options.apiKey || auth.app.options.apiKey === "mock-api-key";

// Local Storage Keys
const MOCK_USERNAMES_KEY = "calyxo_social_usernames";
const MOCK_FOLLOWS_KEY = "calyxo_social_follows";
const MOCK_BLOCKS_KEY = "calyxo_social_blocks";
const LOCAL_STATE_KEY = "calyxo_pwa_state";

// Helper to decrypt/load mock state
const getLocalState = (userId) => {
  if (typeof window === 'undefined') return { foodLogs: [], workoutLogs: [], weightLogs: [], waterIntake: 0, userProfile: {} };
  try {
    const raw = localStorage.getItem(LOCAL_STATE_KEY);
    if (!raw) return { foodLogs: [], workoutLogs: [], weightLogs: [], waterIntake: 0, userProfile: {} };
    // The main dbService encrypts it, but lets check if it parses directly or needs decryption
    // We can fallback to basic parsing since dbService handles decrypting
    // Let's import decrypt or just read raw if not encrypted.
    // In dbService.js, local state is stored as a secure item.
    // Since we don't want to re-implement the exact encryption loop here, we can reuse getSecureItem from dbService
    // or we can import it. Let's import it or just read it from localstorage.
    // Wait, let's look at dbService: it exports getSecureItem.
    // Let's import getSecureItem and setSecureItem from './dbService' to be absolutely safe!
  } catch (e) {
    return { foodLogs: [], workoutLogs: [], weightLogs: [], waterIntake: 0, userProfile: {} };
  }
};

// Instead of re-implementing, let's import the local storage handlers from dbService.js
import { getSecureItem, setSecureItem, getUserProfile, saveUserProfile } from "./dbService";

// Helper for Mock collections
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
   USERNAME UNIQUENESS & CLAIMING
   ========================================================================== */

export const checkUsernameUniqueness = async (username) => {
  if (!username || username.trim().length < 3) return false;
  const usernameClean = username.trim().toLowerCase();

  if (isMockFirebase) {
    const usernames = getMockData(MOCK_USERNAMES_KEY);
    return !usernames.some(x => x.username_lowercase === usernameClean);
  }

  try {
    const docRef = doc(db, "usernames", usernameClean);
    const snap = await getDoc(docRef);
    return !snap.exists();
  } catch (err) {
    console.error("Error checking username uniqueness", err);
    throw new Error("Failed to verify username uniqueness.");
  }
};

export const claimUsername = async (userId, username) => {
  if (!userId) throw new Error("User must be authenticated.");
  if (!username) throw new Error("Username cannot be empty.");
  
  const usernameClean = username.trim();
  const usernameLower = usernameClean.toLowerCase();
  
  // Format check: alphanumeric and underscores only, 3-20 chars
  const formatRegex = /^[a-zA-Z0-9_]{3,20}$/;
  if (!formatRegex.test(usernameClean)) {
    throw new Error("Username must be 3-20 characters long and contain only letters, numbers, or underscores.");
  }

  if (isMockFirebase) {
    const usernames = getMockData(MOCK_USERNAMES_KEY);
    const isTaken = usernames.some(x => x.username_lowercase === usernameLower && x.userId !== userId);
    if (isTaken) {
      throw new Error("Username is already taken.");
    }
    
    // Remove any previous claimed username for this user
    const filtered = usernames.filter(x => x.userId !== userId);
    filtered.push({ userId, username: usernameClean, username_lowercase: usernameLower });
    saveMockData(MOCK_USERNAMES_KEY, filtered);

    // Update profile
    const profile = await getUserProfile(userId);
    const updatedProfile = {
      ...profile,
      username: usernameClean,
      username_lowercase: usernameLower
    };
    await saveUserProfile(userId, updatedProfile);
    return updatedProfile;
  }

  try {
    const result = await runTransaction(db, async (transaction) => {
      const usernameDocRef = doc(db, "usernames", usernameLower);
      const profileDocRef = doc(db, "users_metrics", `${userId}_profile`);

      const usernameSnap = await transaction.get(usernameDocRef);
      if (usernameSnap.exists() && usernameSnap.data().userId !== userId) {
        throw new Error("Username is already taken.");
      }

      const profileSnap = await transaction.get(profileDocRef);
      const profileData = profileSnap.exists() ? profileSnap.data() : {};
      const oldUsername = profileData.username;

      // Claim new username
      transaction.set(usernameDocRef, { userId, username: usernameClean });

      // Update Profile document
      const updatedProfile = {
        ...profileData,
        username: usernameClean,
        username_lowercase: usernameLower,
        userId
      };
      transaction.set(profileDocRef, updatedProfile);

      // Release old username doc if it changed
      if (oldUsername && oldUsername.toLowerCase() !== usernameLower) {
        const oldDocRef = doc(db, "usernames", oldUsername.toLowerCase());
        transaction.delete(oldDocRef);
      }

      return updatedProfile;
    });
    return result;
  } catch (err) {
    console.error("Transaction failed to claim username", err);
    throw new Error(err.message || "Failed to claim username.");
  }
};

/* ==========================================================================
   BLOCK SYSTEM
   ========================================================================== */

export const blockUser = async (blockerId, blockedId) => {
  if (!blockerId || !blockedId) throw new Error("Missing blocker or blocked user identifier.");
  if (blockerId === blockedId) throw new Error("You cannot block yourself.");

  if (isMockFirebase) {
    const blocks = getMockData(MOCK_BLOCKS_KEY);
    const key = `${blockerId}_${blockedId}`;
    if (!blocks.some(x => x.id === key)) {
      blocks.push({ id: key, blockerId, blockedId, timestamp: Date.now() });
      saveMockData(MOCK_BLOCKS_KEY, blocks);
    }
    
    // Automatically delete follows in both directions
    const follows = getMockData(MOCK_FOLLOWS_KEY);
    const remainingFollows = follows.filter(x => 
      !(x.followerId === blockerId && x.followingId === blockedId) &&
      !(x.followerId === blockedId && x.followingId === blockerId)
    );
    saveMockData(MOCK_FOLLOWS_KEY, remainingFollows);
    return;
  }

  try {
    // Write Block Document
    await setDoc(doc(db, "blocks", `${blockerId}_${blockedId}`), {
      blockerId,
      blockedId,
      timestamp: Date.now()
    });

    // Delete follow documents in both directions
    await deleteDoc(doc(db, "follows", `${blockerId}_${blockedId}`));
    await deleteDoc(doc(db, "follows", `${blockedId}_${blockerId}`));
  } catch (err) {
    console.error("Firestore blockUser error", err);
    throw new Error("Failed to block user.");
  }
};

export const unblockUser = async (blockerId, blockedId) => {
  if (!blockerId || !blockedId) throw new Error("Missing blocker or blocked user identifier.");

  if (isMockFirebase) {
    const blocks = getMockData(MOCK_BLOCKS_KEY);
    const key = `${blockerId}_${blockedId}`;
    const filtered = blocks.filter(x => x.id !== key);
    saveMockData(MOCK_BLOCKS_KEY, filtered);
    return;
  }

  try {
    await deleteDoc(doc(db, "blocks", `${blockerId}_${blockedId}`));
  } catch (err) {
    console.error("Firestore unblockUser error", err);
    throw new Error("Failed to unblock user.");
  }
};

export const getBlockedUsers = async (blockerId) => {
  if (!blockerId) return [];

  if (isMockFirebase) {
    const blocks = getMockData(MOCK_BLOCKS_KEY);
    return blocks.filter(x => x.blockerId === blockerId);
  }

  try {
    const q = query(collection(db, "blocks"), where("blockerId", "==", blockerId));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error("Firestore getBlockedUsers error", err);
    throw new Error("Failed to retrieve blocked users.");
  }
};

export const isBlocked = async (userId, targetId) => {
  if (!userId || !targetId) return false;

  if (isMockFirebase) {
    const blocks = getMockData(MOCK_BLOCKS_KEY);
    return blocks.some(x => 
      (x.blockerId === userId && x.blockedId === targetId) ||
      (x.blockerId === targetId && x.blockedId === userId)
    );
  }

  try {
    const doc1 = await getDoc(doc(db, "blocks", `${userId}_${targetId}`));
    if (doc1.exists()) return true;

    const doc2 = await getDoc(doc(db, "blocks", `${targetId}_${userId}`));
    return doc2.exists();
  } catch (err) {
    console.error("Error checking block status", err);
    return false;
  }
};

/* ==========================================================================
   FOLLOW / UNFOLLOW WORKFLOW SYSTEM
   ========================================================================== */

export const followUser = async (followerId, followingId) => {
  if (!followerId || !followingId) throw new Error("Missing follower or following identifier.");
  if (followerId === followingId) throw new Error("You cannot follow yourself.");

  // Check blocks
  const blocked = await isBlocked(followerId, followingId);
  if (blocked) {
    throw new Error("Cannot request connection. User relationship is restricted.");
  }

  // Fetch following target profile privacy
  const targetProfile = await getUserProfile(followingId);
  const isPrivate = targetProfile?.privacy?.isPrivate ?? false;
  const status = isPrivate ? "pending" : "accepted";

  const followObj = {
    followerId,
    followingId,
    status,
    timestamp: Date.now()
  };

  if (isMockFirebase) {
    const follows = getMockData(MOCK_FOLLOWS_KEY);
    const key = `${followerId}_${followingId}`;
    
    // Avoid duplicates / overwrites if relationship exists
    const existing = follows.find(x => x.id === key);
    if (existing) {
      return existing;
    }

    follows.push({ id: key, ...followObj });
    saveMockData(MOCK_FOLLOWS_KEY, follows);
    return { id: key, ...followObj };
  }

  try {
    const followDocRef = doc(db, "follows", `${followerId}_${followingId}`);
    const snap = await getDoc(followDocRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() };
    }
    await setDoc(followDocRef, followObj);
    return { id: followDocRef.id, ...followObj };
  } catch (err) {
    console.error("Firestore followUser error", err);
    throw new Error("Failed to submit follow request.");
  }
};

export const unfollowUser = async (followerId, followingId) => {
  if (!followerId || !followingId) throw new Error("Missing follower or following identifier.");

  if (isMockFirebase) {
    const follows = getMockData(MOCK_FOLLOWS_KEY);
    const key = `${followerId}_${followingId}`;
    const filtered = follows.filter(x => x.id !== key);
    saveMockData(MOCK_FOLLOWS_KEY, filtered);
    return;
  }

  try {
    await deleteDoc(doc(db, "follows", `${followerId}_${followingId}`));
  } catch (err) {
    console.error("Firestore unfollowUser error", err);
    throw new Error("Failed to unfollow user.");
  }
};

export const acceptFollowRequest = async (userId, followerId) => {
  if (!userId || !followerId) throw new Error("Missing identifiers.");

  if (isMockFirebase) {
    const follows = getMockData(MOCK_FOLLOWS_KEY);
    const key = `${followerId}_${userId}`;
    const item = follows.find(x => x.id === key);
    if (item) {
      item.status = "accepted";
      saveMockData(MOCK_FOLLOWS_KEY, follows);
    }
    return;
  }

  try {
    await setDoc(doc(db, "follows", `${followerId}_${userId}`), {
      status: "accepted"
    }, { merge: true });
  } catch (err) {
    console.error("Firestore acceptFollowRequest error", err);
    throw new Error("Failed to accept follow request.");
  }
};

export const rejectFollowRequest = async (userId, followerId) => {
  // Reject is equivalent to deleting the pending relationship
  return unfollowUser(followerId, userId);
};

export const removeFollower = async (userId, followerId) => {
  // Removing follower is equivalent to deleting the follow document
  return unfollowUser(followerId, userId);
};

export const getFollowers = async (userId) => {
  if (!userId) return [];

  if (isMockFirebase) {
    const follows = getMockData(MOCK_FOLLOWS_KEY);
    const followersRefs = follows.filter(x => x.followingId === userId && x.status === "accepted");
    
    // Resolve profiles
    const profiles = [];
    for (const ref of followersRefs) {
      const prof = await getUserProfile(ref.followerId);
      if (prof) {
        profiles.push({ userId: ref.followerId, ...prof });
      }
    }
    return profiles;
  }

  try {
    const q = query(
      collection(db, "follows"),
      where("followingId", "==", userId),
      where("status", "==", "accepted")
    );
    const snap = await getDocs(q);
    const followerIds = snap.docs.map(doc => doc.data().followerId);

    const profiles = [];
    for (const fId of followerIds) {
      const prof = await getUserProfile(fId);
      if (prof) {
        profiles.push({ userId: fId, ...prof });
      }
    }
    return profiles;
  } catch (err) {
    console.error("Firestore getFollowers error", err);
    throw new Error("Failed to fetch followers list.");
  }
};

export const getFollowing = async (userId) => {
  if (!userId) return [];

  if (isMockFirebase) {
    const follows = getMockData(MOCK_FOLLOWS_KEY);
    const followingRefs = follows.filter(x => x.followerId === userId && x.status === "accepted");
    
    const profiles = [];
    for (const ref of followingRefs) {
      const prof = await getUserProfile(ref.followingId);
      if (prof) {
        profiles.push({ userId: ref.followingId, ...prof });
      }
    }
    return profiles;
  }

  try {
    const q = query(
      collection(db, "follows"),
      where("followerId", "==", userId),
      where("status", "==", "accepted")
    );
    const snap = await getDocs(q);
    const followingIds = snap.docs.map(doc => doc.data().followingId);

    const profiles = [];
    for (const fId of followingIds) {
      const prof = await getUserProfile(fId);
      if (prof) {
        profiles.push({ userId: fId, ...prof });
      }
    }
    return profiles;
  } catch (err) {
    console.error("Firestore getFollowing error", err);
    throw new Error("Failed to fetch following list.");
  }
};

export const getPendingFollowRequests = async (userId) => {
  if (!userId) return [];

  if (isMockFirebase) {
    const follows = getMockData(MOCK_FOLLOWS_KEY);
    const pendingRefs = follows.filter(x => x.followingId === userId && x.status === "pending");
    
    const profiles = [];
    for (const ref of pendingRefs) {
      const prof = await getUserProfile(ref.followerId);
      if (prof) {
        profiles.push({ userId: ref.followerId, ...prof });
      }
    }
    return profiles;
  }

  try {
    const q = query(
      collection(db, "follows"),
      where("followingId", "==", userId),
      where("status", "==", "pending")
    );
    const snap = await getDocs(q);
    const pendingIds = snap.docs.map(doc => doc.data().followerId);

    const profiles = [];
    for (const fId of pendingIds) {
      const prof = await getUserProfile(fId);
      if (prof) {
        profiles.push({ userId: fId, ...prof });
      }
    }
    return profiles;
  } catch (err) {
    console.error("Firestore getPendingFollowRequests error", err);
    throw new Error("Failed to fetch pending follow requests.");
  }
};

/* ==========================================================================
   PRIVACY CONTROLS & SETTINGS
   ========================================================================== */

export const updatePrivacySettings = async (userId, privacySettings) => {
  if (!userId) throw new Error("User must be authenticated.");
  
  const currentProfile = await getUserProfile(userId);
  const updatedProfile = {
    ...currentProfile,
    privacy: {
      isPrivate: privacySettings.isPrivate ?? false,
      allowFollowers: privacySettings.allowFollowers ?? true,
      showWorkouts: privacySettings.showWorkouts ?? "public",
      showNutrition: privacySettings.showNutrition ?? "public"
    }
  };

  await saveUserProfile(userId, updatedProfile);
  return updatedProfile;
};

export const canViewProfileSection = async (viewerId, ownerId, section = "profile") => {
  if (!ownerId) return false;
  if (viewerId === ownerId) return true;

  // Check blocking
  const blocked = await isBlocked(viewerId, ownerId);
  if (blocked) return false;

  const ownerProfile = await getUserProfile(ownerId);
  if (!ownerProfile) return false;

  const privacy = ownerProfile.privacy || {
    isPrivate: false,
    allowFollowers: true,
    showWorkouts: "public",
    showNutrition: "public"
  };

  // Helper check: is viewer an accepted follower
  const checkFollowStatus = async () => {
    if (isMockFirebase) {
      const follows = getMockData(MOCK_FOLLOWS_KEY);
      return follows.some(x => x.followerId === viewerId && x.followingId === ownerId && x.status === "accepted");
    }
    try {
      const snap = await getDoc(doc(db, "follows", `${viewerId}_${ownerId}`));
      return snap.exists() && snap.data().status === "accepted";
    } catch (e) {
      return false;
    }
  };

  const isFollower = await checkFollowStatus();

  // If profile is private, only accepted followers can view any section
  if (privacy.isPrivate && !isFollower) {
    return false;
  }

  if (section === "profile") {
    return true; // Basic profile is visible if not private
  }

  const visibility = section === "workouts" ? privacy.showWorkouts : privacy.showNutrition;
  
  if (visibility === "private") {
    return false; // Only owner can view
  }
  if (visibility === "followers") {
    return isFollower;
  }
  return true; // public
};

/* ==========================================================================
   USER SEARCH BACKEND
   ========================================================================== */

export const searchUsers = async (queryText, currentUserId) => {
  if (!queryText || queryText.trim().length === 0) return [];
  const searchClean = queryText.trim().toLowerCase();

  // Load blocked list to filter out results
  const blockedList = currentUserId ? await getBlockedUsers(currentUserId) : [];
  const blockedIds = blockedList.map(x => x.blockedId);

  // Load who has blocked current user
  const reverseBlockedIds = [];
  if (currentUserId) {
    if (isMockFirebase) {
      const blocks = getMockData(MOCK_BLOCKS_KEY);
      blocks.forEach(x => {
        if (x.blockedId === currentUserId) reverseBlockedIds.push(x.blockerId);
      });
    } else {
      try {
        const q = query(collection(db, "blocks"), where("blockedId", "==", currentUserId));
        const snap = await getDocs(q);
        snap.docs.forEach(doc => reverseBlockedIds.push(doc.data().blockerId));
      } catch (e) {
        console.error("Error reading reverse blocks in search", e);
      }
    }
  }

  const excludeIds = new Set([currentUserId, ...blockedIds, ...reverseBlockedIds]);

  if (isMockFirebase) {
    // In mock mode, we scan claimed usernames and profiles from local state
    const usernames = getMockData(MOCK_USERNAMES_KEY);
    const results = [];
    
    for (const item of usernames) {
      if (excludeIds.has(item.userId)) continue;
      
      const usernameMatch = item.username_lowercase.startsWith(searchClean);
      
      // Also match by nickname/firstName if available
      const prof = await getUserProfile(item.userId);
      const nicknameMatch = prof?.nickname?.toLowerCase().startsWith(searchClean) ||
                            prof?.firstName?.toLowerCase().startsWith(searchClean);

      if (usernameMatch || nicknameMatch) {
        results.push({
          userId: item.userId,
          username: item.username,
          nickname: prof?.nickname || prof?.firstName || "Calyxo Athlete",
          photoURL: prof?.photoURL || "",
          privacy: prof?.privacy || { isPrivate: false }
        });
      }
    }
    return results;
  }

  try {
    // Query users_metrics. Since they store profile metrics, query by username_lowercase prefix
    const q = query(
      collection(db, "users_metrics"),
      where("username_lowercase", ">=", searchClean),
      where("username_lowercase", "<=", searchClean + "\uf8ff"),
      limit(20)
    );
    const snap = await getDocs(q);
    const results = [];

    snap.docs.forEach(d => {
      const data = d.data();
      const uId = data.userId;
      if (excludeIds.has(uId)) return;

      results.push({
        userId: uId,
        username: data.username,
        nickname: data.nickname || data.firstName || "Calyxo Athlete",
        photoURL: data.photoURL || "",
        privacy: data.privacy || { isPrivate: false }
      });
    });

    return results;
  } catch (err) {
    console.error("Firestore searchUsers query failed", err);
    throw new Error("Failed to execute user search.");
  }
};

export const getMutualFriends = async (userId, targetId) => {
  if (!userId || !targetId) return [];
  try {
    const followingA = await getFollowing(userId);
    const followingB = await getFollowing(targetId);

    const idsB = new Set(followingB.map(x => x.userId));
    return followingA.filter(x => idsB.has(x.userId));
  } catch (err) {
    console.error("Error computing mutual friends", err);
    return [];
  }
};

export const getFriendSuggestions = async (userId) => {
  if (!userId) return [];
  try {
    // 1. Gather exclusions: self, followed, blocked, incoming pending, outgoing pending
    const followingList = await getFollowing(userId);
    const blockedList = await getBlockedUsers(userId);
    const pendingList = await getPendingFollowRequests(userId);
    
    let outgoingPendingIds = [];
    if (isMockFirebase) {
      const follows = getMockData(MOCK_FOLLOWS_KEY);
      outgoingPendingIds = follows
        .filter(x => x.followerId === userId && x.status === "pending")
        .map(x => x.followingId);
    } else {
      const q = query(
        collection(db, "follows"),
        where("followerId", "==", userId),
        where("status", "==", "pending")
      );
      const snap = await getDocs(q);
      outgoingPendingIds = snap.docs.map(doc => doc.data().followingId);
    }

    const excludeIds = new Set([
      userId,
      ...followingList.map(x => x.userId),
      ...blockedList.map(x => x.blockedId),
      ...pendingList.map(x => x.userId),
      ...outgoingPendingIds
    ]);

    const currentUserProfile = await getUserProfile(userId);
    const myInterests = currentUserProfile?.healthInterests || [];

    const suggestions = [];

    if (isMockFirebase) {
      const usernames = getMockData(MOCK_USERNAMES_KEY);
      for (const item of usernames) {
        if (excludeIds.has(item.userId)) continue;
        const targetProfile = await getUserProfile(item.userId);
        if (!targetProfile) continue;

        // Calculate mutual friends
        const targetFollowing = await getFollowing(item.userId);
        const idsB = new Set(targetFollowing.map(x => x.userId));
        const sharedFriends = followingList.filter(x => idsB.has(x.userId));

        // Calculate interests match
        const targetInterests = targetProfile.healthInterests || [];
        const sharedInterests = myInterests.filter(x => targetInterests.includes(x));

        const score = (sharedFriends.length * 5) + (sharedInterests.length * 3);

        suggestions.push({
          userId: item.userId,
          username: item.username,
          nickname: targetProfile.nickname || targetProfile.firstName || "Athlete",
          photoURL: targetProfile.photoURL || "",
          score,
          reason: sharedFriends.length > 0 
            ? `${sharedFriends.length} mutual friends`
            : sharedInterests.length > 0
            ? `Shares ${sharedInterests[0]}`
            : "Popular near you"
        });
      }
    } else {
      // Real Firestore: Query up to 50 users_metrics profiles
      const q = query(collection(db, "users_metrics"), limit(50));
      const snap = await getDocs(q);
      
      for (const d of snap.docs) {
        const data = d.data();
        const uId = data.userId;
        if (!uId || excludeIds.has(uId)) continue;

        // Calculate mutual friends
        const targetFollowing = await getFollowing(uId);
        const idsB = new Set(targetFollowing.map(x => x.userId));
        const sharedFriends = followingList.filter(x => idsB.has(x.userId));

        // Calculate interests match
        const targetInterests = data.healthInterests || [];
        const sharedInterests = myInterests.filter(x => targetInterests.includes(x));

        const score = (sharedFriends.length * 5) + (sharedInterests.length * 3);

        suggestions.push({
          userId: uId,
          username: data.username,
          nickname: data.nickname || data.firstName || "Athlete",
          photoURL: data.photoURL || "",
          score,
          reason: sharedFriends.length > 0 
            ? `${sharedFriends.length} mutual friends`
            : sharedInterests.length > 0
            ? `Shares ${sharedInterests[0]}`
            : "Popular near you"
        });
      }
    }

    // Sort by score descending and take top 5
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  } catch (err) {
    console.error("Error computing friend suggestions", err);
    return [];
  }
};

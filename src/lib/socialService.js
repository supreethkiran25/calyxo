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
  limit,
  addDoc,
  orderBy,
  startAfter,
  onSnapshot
} from "firebase/firestore";

// Helper to determine mock mode
const isMockFirebase = !auth.app.options.apiKey || auth.app.options.apiKey === "mock-api-key";

// Local Storage Keys
const MOCK_USERNAMES_KEY = "calyxo_social_usernames";
const MOCK_FOLLOWS_KEY = "calyxo_social_follows";
const MOCK_BLOCKS_KEY = "calyxo_social_blocks";

// Import local storage handlers from dbService.js
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

const RESERVED_USERNAMES = [
  'admin', 'support', 'help', 'calyxo', 'official', 'system', 
  'trainer', 'dietitian', 'founder', 'moderator', 'verified'
];

export const checkUsernameAvailability = async (username) => {
  if (!username) return { available: false, reason: "Empty username" };
  
  const usernameClean = username.trim();
  const usernameLower = usernameClean.toLowerCase();
  
  const formatRegex = /^[a-zA-Z0-9_.]{3,20}$/;
  if (!formatRegex.test(usernameClean)) {
    return { available: false, reason: "Must be 3-20 characters (letters, numbers, underscores, periods)" };
  }

  if (RESERVED_USERNAMES.includes(usernameLower)) {
    return { available: false, reason: "Reserved username" };
  }

  try {
    if (isMockFirebase) {
      const usernames = getMockData(MOCK_USERNAMES_KEY);
      const isTaken = usernames.some(x => x.username_lowercase === usernameLower);
      if (isTaken) {
        return { 
          available: false, 
          reason: "Taken",
          suggestions: [
            `${usernameLower}fit`,
            `${usernameLower}_pro`,
            `${usernameLower}${Math.floor(Math.random() * 999)}`
          ]
        };
      }
      return { available: true };
    }

    const usernameDocRef = doc(db, "usernames", usernameLower);
    const snap = await getDoc(usernameDocRef);
    
    if (snap.exists()) {
      return { 
        available: false, 
        reason: "Taken",
        suggestions: [
          `${usernameLower}fit`,
          `${usernameLower}_pro`,
          `${usernameLower}${Math.floor(Math.random() * 999)}`
        ]
      };
    }
    
    return { available: true };
  } catch (err) {
    console.error("Availability check failed", err);
    return { available: false, reason: "Error checking availability" };
  }
};

export const claimUsername = async (userId, username, email = null) => {
  if (!userId) throw new Error("User must be authenticated.");
  if (!username) throw new Error("Username cannot be empty.");
  
  const usernameClean = username.trim();
  const usernameLower = usernameClean.toLowerCase();
  
  // Format check: alphanumeric, underscores, periods, 3-20 chars
  const formatRegex = /^[a-zA-Z0-9_.]{3,20}$/;
  if (!formatRegex.test(usernameClean)) {
    throw new Error("Username must be 3-20 characters long and contain only letters, numbers, underscores, or periods.");
  }

  if (RESERVED_USERNAMES.includes(usernameLower)) {
    throw new Error("This username is reserved and cannot be registered.");
  }

  if (isMockFirebase) {
    const usernames = getMockData(MOCK_USERNAMES_KEY);
    const isTaken = usernames.some(x => x.username_lowercase === usernameLower && x.userId !== userId);
    if (isTaken) {
      throw new Error("Username is already taken.");
    }
    
    // Remove any previous claimed username for this user
    const filtered = usernames.filter(x => x.userId !== userId);
    filtered.push({ userId, username: usernameClean, username_lowercase: usernameLower, email });
    saveMockData(MOCK_USERNAMES_KEY, filtered);

    // Update profile
    const profile = await getUserProfile(userId);

    const now = Date.now();
    if (profile.lastUsernameChange && (now - profile.lastUsernameChange) < 30 * 24 * 60 * 60 * 1000) {
      throw new Error("You can only change your username once every 30 days.");
    }

    const history = profile.usernameHistory || [];
    if (profile.username && profile.username !== usernameClean) {
      history.push({ username: profile.username, changedAt: now });
    }

    const updatedProfile = {
      ...profile,
      username: usernameClean,
      username_lowercase: usernameLower,
      lastUsernameChange: now,
      usernameHistory: history
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

      const now = Date.now();
      if (profileData.lastUsernameChange && (now - profileData.lastUsernameChange) < 30 * 24 * 60 * 60 * 1000) {
        throw new Error("You can only change your username once every 30 days.");
      }

      // Claim new username
      transaction.set(usernameDocRef, { userId, username: usernameClean, email });

      const history = profileData.usernameHistory || [];
      if (oldUsername && oldUsername !== usernameClean) {
        history.push({ username: oldUsername, changedAt: now });
      }

      // Update Profile document
      const updatedProfile = {
        ...profileData,
        username: usernameClean,
        username_lowercase: usernameLower,
        lastUsernameChange: now,
        usernameHistory: history,
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

export const publishActivity = async (payloadOrUserId, type, title, content, data = {}) => {
  let payload;
  if (typeof payloadOrUserId === 'object' && payloadOrUserId !== null) {
    payload = payloadOrUserId;
  } else {
    payload = { userId: payloadOrUserId, type, title, content, data };
  }
  
  const { userId, type: pType, title: pTitle, content: pContent, data: pData, visibility = 'public', mediaUrls = [], tags = [], location = '' } = payload;

  if (!userId) return;
  try {
    const profile = await getUserProfile(userId);
    const activityItem = {
      userId,
      type: pType,
      title: pTitle,
      content: pContent,
      data: pData || {},
      visibility,
      mediaUrls,
      tags,
      location,
      timestamp: Date.now(),
      nickname: profile?.nickname || profile?.firstName || "Athlete",
      username: profile?.username || "athlete",
      photoURL: profile?.photoURL || ""
    };

    if (isMockFirebase) {
      const activities = getMockData("calyxo_social_activities");
      const newActivity = { id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`, ...activityItem };
      activities.unshift(newActivity);
      saveMockData("calyxo_social_activities", activities);

      if (typeof window !== 'undefined') {
        const event = new CustomEvent("calyxo_new_activity", { detail: newActivity });
        window.dispatchEvent(event);
      }
      return newActivity;
    }

    const docRef = await addDoc(collection(db, "social_activities"), activityItem);
    return { id: docRef.id, ...activityItem };
  } catch (err) {
    console.error("Error publishing social activity log", err);
  }
};

export const fetchActivityFeed = async (viewerId, followingIds = [], limitCount = 10, lastDoc = null) => {
  if (!viewerId) return { items: [], lastDoc: null };

  const queryIds = [viewerId, ...followingIds].slice(0, 30);
  
  // Helper to check visibility
  const isVisible = (act) => {
    if (!act.visibility || act.visibility === 'public') return true;
    if (act.userId === viewerId) return true; // Can always see own posts
    if (act.visibility === 'private' && act.userId !== viewerId) return false;
    // For 'friends' or 'club', in this prototype we'll assume if they are in 'followingIds', they meet the basic threshold,
    // though 'friends' technically requires mutual follow.
    return true; 
  };

  if (isMockFirebase) {
    const allActivities = getMockData("calyxo_social_activities");
    const filtered = allActivities.filter(act => queryIds.includes(act.userId) && isVisible(act));
    
    let startIndex = 0;
    if (lastDoc) {
      startIndex = filtered.findIndex(x => x.id === lastDoc) + 1;
    }
    
    const pageItems = filtered.slice(startIndex, startIndex + limitCount);
    const nextLastDoc = pageItems.length > 0 ? pageItems[pageItems.length - 1].id : null;
    return { items: pageItems, lastDoc: nextLastDoc };
  }

  try {
    let q = query(
      collection(db, "social_activities"),
      where("userId", "in", queryIds),
      orderBy("timestamp", "desc"),
      limit(limitCount * 2) // Fetch extra to account for client-side filtering
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snap = await getDocs(q);
    const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(isVisible).slice(0, limitCount);
    const nextLastDoc = items.length > 0 ? items[items.length - 1] : null;

    return { items, lastDoc: nextLastDoc ? snap.docs[snap.docs.indexOf(nextLastDoc)] : null };
  } catch (err) {
    console.error("Error fetching activity feed", err);
    return { items: [], lastDoc: null };
  }
};

export const rankFeedWithAI = async (userId, feedItems) => {
  if (!feedItems || feedItems.length === 0) return feedItems;
  try {
    const profile = await getUserProfile(userId);
    const res = await fetch('/api/gemini/feed-rank', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userProfile: profile, feedItems: feedItems.slice(0, 20) })
    });
    if (!res.ok) return feedItems;
    const { rankedIds } = await res.json();
    if (!rankedIds || !Array.isArray(rankedIds)) return feedItems;
    
    // Sort feedItems based on the order of rankedIds
    const rankedItems = [...feedItems].sort((a, b) => {
      const idxA = rankedIds.indexOf(a.id);
      const idxB = rankedIds.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
    return rankedItems;
  } catch (err) {
    console.error("AI Feed ranking failed", err);
    return feedItems;
  }
};

export const addReaction = async (userId, activityId, reactionType) => {
  if (!userId || !activityId || !reactionType) return;
  // Supported reactions: '👏', '🔥', '💪', '❤️', '🎯', '🥗', '🏆'
  try {
    if (isMockFirebase) {
      const activities = getMockData("calyxo_social_activities");
      const activity = activities.find(a => a.id === activityId);
      if (activity) {
        if (!activity.reactions) activity.reactions = {};
        if (!activity.reactions[reactionType]) activity.reactions[reactionType] = [];
        if (!activity.reactions[reactionType].includes(userId)) {
           activity.reactions[reactionType].push(userId);
           saveMockData("calyxo_social_activities", activities);
        }
      }
      return;
    }
    // Real firestore logic would update the subcollection or document array
    // For simplicity, we merge into a reactions map
    const docRef = doc(db, "social_activities", activityId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const reactions = data.reactions || {};
      const current = reactions[reactionType] || [];
      if (!current.includes(userId)) {
        reactions[reactionType] = [...current, userId];
        await setDoc(docRef, { reactions }, { merge: true });
      }
    }
  } catch (err) {
    console.error("Error adding reaction", err);
  }
};

export const addComment = async (userId, activityId, text) => {
  if (!userId || !activityId || !text) return;
  try {
    const profile = await getUserProfile(userId);
    const commentObj = {
      id: `cmd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId,
      text,
      timestamp: Date.now(),
      username: profile?.username || "athlete",
      photoURL: profile?.photoURL || ""
    };
    
    if (isMockFirebase) {
      const activities = getMockData("calyxo_social_activities");
      const activity = activities.find(a => a.id === activityId);
      if (activity) {
        if (!activity.comments) activity.comments = [];
        activity.comments.push(commentObj);
        saveMockData("calyxo_social_activities", activities);
      }
      return commentObj;
    }

    const docRef = doc(db, "social_activities", activityId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const comments = data.comments || [];
      comments.push(commentObj);
      await setDoc(docRef, { comments }, { merge: true });
    }
    return commentObj;
  } catch (err) {
    console.error("Error adding comment", err);
  }
};

/**
 * Syncs the main profile image to the social profile data.
 * The social profile is essentially the users_metrics/{userId}_profile document,
 * which may have photoURL cached.
 */
export const syncProfileImages = async (userId, newPhotoUrl) => {
  if (!userId) return;
  if (isMockFirebase) {
    const profile = await getUserProfile(userId);
    if (profile) {
      await saveUserProfile(userId, { ...profile, photoURL: newPhotoUrl });
    }
    return;
  }
  
  try {
    const profileRef = doc(db, 'users_metrics', `${userId}_profile`);
    await setDoc(profileRef, { photoURL: newPhotoUrl }, { merge: true });
  } catch (err) {
    console.error("Failed to sync profile image to social profile", err);
  }
};

/* ==========================================================================
   MESSAGING API
   ========================================================================== */

export const getConversations = async (userId) => {
  if (isMockFirebase) {
    return getMockData(`calyxo_conversations_${userId}`);
  }
  try {
    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userId),
      orderBy("lastUpdated", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Error fetching conversations:", err);
    return [];
  }
};

export const subscribeToMessages = (conversationId, callback) => {
  if (isMockFirebase) {
    const messages = getMockData(`calyxo_messages_${conversationId}`);
    callback(messages);
    return () => {}; // unsub
  }
  
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("timestamp", "asc")
  );
  
  const unsub = onSnapshot(q, (snap) => {
    const messages = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(messages);
  });
  
  return unsub;
};

export const sendMessage = async (conversationId, senderId, text, participants = []) => {
  const msgObj = {
    senderId,
    text,
    timestamp: Date.now()
  };

  if (isMockFirebase) {
    const key = `calyxo_messages_${conversationId}`;
    const msgs = getMockData(key);
    msgs.push({ id: `msg_${Date.now()}`, ...msgObj });
    saveMockData(key, msgs);
    return;
  }

  try {
    // Add message
    const msgRef = collection(db, "conversations", conversationId, "messages");
    await addDoc(msgRef, msgObj);
    
    // Update conversation metadata
    const convRef = doc(db, "conversations", conversationId);
    await setDoc(convRef, {
      participants,
      lastMessage: text,
      lastSender: senderId,
      lastUpdated: Date.now()
    }, { merge: true });
  } catch (err) {
    console.error("Error sending message:", err);
  }
};

/* ==========================================================================
   NOTIFICATIONS API
   ========================================================================== */

export const getNotifications = async (userId) => {
  if (isMockFirebase) {
    return getMockData(`calyxo_notifications_${userId}`);
  }
  try {
    const q = query(
      collection(db, "users_metrics", `${userId}_profile`, "notifications"),
      orderBy("timestamp", "desc"),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return [];
  }
};

export const markNotificationRead = async (userId, notificationId) => {
  if (isMockFirebase) {
    const key = `calyxo_notifications_${userId}`;
    const notifs = getMockData(key);
    const updated = notifs.map(n => n.id === notificationId ? { ...n, read: true } : n);
    saveMockData(key, updated);
    return;
  }
  try {
    const docRef = doc(db, "users_metrics", `${userId}_profile`, "notifications", notificationId);
    await setDoc(docRef, { read: true }, { merge: true });
  } catch (err) {
    console.error("Error marking notification read:", err);
  }
};

export const markAllNotificationsRead = async (userId) => {
  if (isMockFirebase) {
    const key = `calyxo_notifications_${userId}`;
    const notifs = getMockData(key);
    const updated = notifs.map(n => ({ ...n, read: true }));
    saveMockData(key, updated);
    return;
  }
  try {
    const notifs = await getNotifications(userId);
    const unread = notifs.filter(n => !n.read);
    for (const notif of unread) {
      await markNotificationRead(userId, notif.id);
    }
  } catch (err) {
    console.error("Error marking all notifications read:", err);
  }
};

/* ==========================================================================
   CLUBS API
   ========================================================================== */

export const getClubs = async () => {
  if (isMockFirebase) {
    return getMockData("calyxo_clubs") || [];
  }
  try {
    const snap = await getDocs(collection(db, "clubs"));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error("Error fetching clubs:", err);
    return [];
  }
};

export const createClub = async (userId, clubData) => {
  const newClub = {
    ...clubData,
    creatorId: userId,
    members: [userId],
    createdAt: Date.now()
  };

  if (isMockFirebase) {
    const clubs = getMockData("calyxo_clubs") || [];
    const created = { id: `club_${Date.now()}`, ...newClub };
    clubs.push(created);
    saveMockData("calyxo_clubs", clubs);
    return created;
  }
  try {
    const docRef = await addDoc(collection(db, "clubs"), newClub);
    return { id: docRef.id, ...newClub };
  } catch (err) {
    console.error("Error creating club:", err);
    throw err;
  }
};

export const joinClub = async (userId, clubId) => {
  if (isMockFirebase) {
    const clubs = getMockData("calyxo_clubs") || [];
    const updated = clubs.map(c => {
      if (c.id === clubId && !c.members.includes(userId)) {
        return { ...c, members: [...c.members, userId] };
      }
      return c;
    });
    saveMockData("calyxo_clubs", updated);
    return;
  }
  try {
    const docRef = doc(db, "clubs", clubId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const members = data.members || [];
      if (!members.includes(userId)) {
        await setDoc(docRef, { members: [...members, userId] }, { merge: true });
      }
    }
  } catch (err) {
    console.error("Error joining club:", err);
    throw err;
  }
};

export const leaveClub = async (userId, clubId) => {
  if (isMockFirebase) {
    const clubs = getMockData("calyxo_clubs") || [];
    const updated = clubs.map(c => {
      if (c.id === clubId) {
        return { ...c, members: c.members.filter(m => m !== userId) };
      }
      return c;
    });
    saveMockData("calyxo_clubs", updated);
    return;
  }
  try {
    const docRef = doc(db, "clubs", clubId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const members = data.members || [];
      await setDoc(docRef, { members: members.filter(m => m !== userId) }, { merge: true });
    }
  } catch (err) {
    console.error("Error leaving club:", err);
    throw err;
  }
};

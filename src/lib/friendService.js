import { db } from "./firebase";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { isMockFirebase } from "./dbService";
import { getUserProfile } from "./dbService";
import { isBlocked } from "./socialService";

const MOCK_FRIENDS_KEY = "calyxo_social_friends";

const getMockFriends = () => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(MOCK_FRIENDS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveMockFriends = (data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(MOCK_FRIENDS_KEY, JSON.stringify(data));
};

/* ==========================================================================
   FRIEND SYSTEM API
   ========================================================================== */

export const sendFriendRequest = async (senderId, receiverId) => {
  if (!senderId || !receiverId) throw new Error("Missing sender or receiver ID");
  if (senderId === receiverId) throw new Error("Cannot send request to yourself");

  const blocked = await isBlocked(senderId, receiverId);
  if (blocked) throw new Error("Action restricted");

  const friendObj = {
    senderId,
    receiverId,
    status: "pending",
    timestamp: Date.now()
  };

  if (isMockFirebase) {
    const friends = getMockFriends();
    const key = `${senderId}_${receiverId}`;
    const keyReverse = `${receiverId}_${senderId}`;

    if (friends.some(x => x.id === key || x.id === keyReverse)) {
      return friendObj; // Already exists
    }

    friends.push({ id: key, ...friendObj });
    saveMockFriends(friends);
    return { id: key, ...friendObj };
  }

  const docRef = doc(db, "friends", `${senderId}_${receiverId}`);
  await setDoc(docRef, friendObj);
  return { id: docRef.id, ...friendObj };
};

export const acceptFriendRequest = async (receiverId, senderId) => {
  if (isMockFirebase) {
    const friends = getMockFriends();
    const key = `${senderId}_${receiverId}`;
    const item = friends.find(x => x.id === key);
    if (item) {
      item.status = "accepted";
      saveMockFriends(friends);
    }
    return;
  }
  await setDoc(doc(db, "friends", `${senderId}_${receiverId}`), { status: "accepted" }, { merge: true });
};

export const rejectFriendRequest = async (receiverId, senderId) => {
  if (isMockFirebase) {
    const friends = getMockFriends();
    const key = `${senderId}_${receiverId}`;
    const filtered = friends.filter(x => x.id !== key);
    saveMockFriends(filtered);
    return;
  }
  await deleteDoc(doc(db, "friends", `${senderId}_${receiverId}`));
};

export const cancelFriendRequest = async (senderId, receiverId) => {
  return rejectFriendRequest(receiverId, senderId);
};

export const removeFriend = async (userId, friendId) => {
  if (isMockFirebase) {
    const friends = getMockFriends();
    const filtered = friends.filter(x => 
      !(x.senderId === userId && x.receiverId === friendId) &&
      !(x.senderId === friendId && x.receiverId === userId)
    );
    saveMockFriends(filtered);
    return;
  }
  
  try {
    await deleteDoc(doc(db, "friends", `${userId}_${friendId}`));
    await deleteDoc(doc(db, "friends", `${friendId}_${userId}`));
  } catch (err) {
    console.error("Error removing friend", err);
  }
};

export const getFriends = async (userId) => {
  if (!userId) return [];
  if (isMockFirebase) {
    const friends = getMockFriends();
    const accepted = friends.filter(x => x.status === "accepted" && (x.senderId === userId || x.receiverId === userId));
    const friendIds = accepted.map(x => x.senderId === userId ? x.receiverId : x.senderId);
    
    const profiles = [];
    for (const id of friendIds) {
      const prof = await getUserProfile(id);
      if (prof) profiles.push({ userId: id, ...prof });
    }
    return profiles;
  }

  try {
    const q1 = query(collection(db, "friends"), where("senderId", "==", userId), where("status", "==", "accepted"));
    const q2 = query(collection(db, "friends"), where("receiverId", "==", userId), where("status", "==", "accepted"));
    const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    
    const friendIds = [
      ...snap1.docs.map(doc => doc.data().receiverId),
      ...snap2.docs.map(doc => doc.data().senderId)
    ];

    const profiles = [];
    for (const id of friendIds) {
      const prof = await getUserProfile(id);
      if (prof) profiles.push({ userId: id, ...prof });
    }
    return profiles;
  } catch (err) {
    console.error("Error fetching friends", err);
    return [];
  }
};

export const getPendingFriendRequests = async (userId) => {
  if (!userId) return [];
  if (isMockFirebase) {
    const friends = getMockFriends();
    const pending = friends.filter(x => x.receiverId === userId && x.status === "pending");
    
    const profiles = [];
    for (const item of pending) {
      const prof = await getUserProfile(item.senderId);
      if (prof) profiles.push({ userId: item.senderId, ...prof });
    }
    return profiles;
  }

  const q = query(collection(db, "friends"), where("receiverId", "==", userId), where("status", "==", "pending"));
  const snap = await getDocs(q);
  const profiles = [];
  for (const d of snap.docs) {
    const id = d.data().senderId;
    const prof = await getUserProfile(id);
    if (prof) profiles.push({ userId: id, ...prof });
  }
  return profiles;
};

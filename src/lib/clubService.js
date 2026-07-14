import { db } from "./firebase";
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc, updateDoc } from "firebase/firestore";
import { isMockFirebase } from "./dbService";

const MOCK_CLUBS_KEY = "calyxo_clubs";
const MOCK_CLUB_MEMBERS_KEY = "calyxo_club_members";

const getMockData = (key) => {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
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
   CLUB MANAGEMENT
   ========================================================================== */

export const createClub = async (userId, clubData) => {
  if (!userId) throw new Error("Must be logged in to create a club");

  const newClub = {
    id: `club_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ownerId: userId,
    name: clubData.name || "New Club",
    description: clubData.description || "",
    rules: clubData.rules || "",
    isPrivate: clubData.isPrivate || false,
    bannerUrl: clubData.bannerUrl || "",
    logoUrl: clubData.logoUrl || "",
    category: clubData.category || "General",
    createdAt: Date.now(),
    memberCount: 1, // Owner is first member
    xp: 0
  };

  const memberData = {
    clubId: newClub.id,
    userId,
    role: "owner", // owner, admin, moderator, member
    joinedAt: Date.now()
  };

  if (isMockFirebase) {
    const clubs = getMockData(MOCK_CLUBS_KEY);
    clubs.push(newClub);
    saveMockData(MOCK_CLUBS_KEY, clubs);

    const members = getMockData(MOCK_CLUB_MEMBERS_KEY);
    members.push(memberData);
    saveMockData(MOCK_CLUB_MEMBERS_KEY, members);
    return newClub;
  }

  try {
    await setDoc(doc(db, "clubs", newClub.id), newClub);
    await setDoc(doc(db, "club_members", `${newClub.id}_${userId}`), memberData);
    return newClub;
  } catch (err) {
    console.error("Error creating club", err);
    throw new Error("Failed to create club");
  }
};

export const getClubs = async (category = null) => {
  if (isMockFirebase) {
    const clubs = getMockData(MOCK_CLUBS_KEY);
    if (category) return clubs.filter(c => c.category === category);
    return clubs;
  }

  try {
    let q = collection(db, "clubs");
    if (category) {
      q = query(q, where("category", "==", category));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data());
  } catch (err) {
    console.error("Error fetching clubs", err);
    return [];
  }
};

/* ==========================================================================
   CLUB MEMBERSHIP
   ========================================================================== */

export const joinClub = async (userId, clubId, isPrivate = false) => {
  if (!userId || !clubId) return;

  const memberData = {
    clubId,
    userId,
    role: isPrivate ? "pending" : "member",
    joinedAt: Date.now()
  };

  if (isMockFirebase) {
    const members = getMockData(MOCK_CLUB_MEMBERS_KEY);
    if (!members.find(m => m.clubId === clubId && m.userId === userId)) {
      members.push(memberData);
      saveMockData(MOCK_CLUB_MEMBERS_KEY, members);
      
      if (!isPrivate) {
        const clubs = getMockData(MOCK_CLUBS_KEY);
        const cIdx = clubs.findIndex(c => c.id === clubId);
        if (cIdx !== -1) {
          clubs[cIdx].memberCount = (clubs[cIdx].memberCount || 0) + 1;
          saveMockData(MOCK_CLUBS_KEY, clubs);
        }
      }
    }
    return memberData;
  }

  try {
    const memberRef = doc(db, "club_members", `${clubId}_${userId}`);
    await setDoc(memberRef, memberData);
    
    if (!isPrivate) {
      const clubRef = doc(db, "clubs", clubId);
      const snap = await getDoc(clubRef);
      if (snap.exists()) {
        await updateDoc(clubRef, { memberCount: (snap.data().memberCount || 0) + 1 });
      }
    }
    return memberData;
  } catch (err) {
    console.error("Error joining club", err);
    throw new Error("Failed to join club");
  }
};

export const leaveClub = async (userId, clubId) => {
  if (!userId || !clubId) return;

  if (isMockFirebase) {
    let members = getMockData(MOCK_CLUB_MEMBERS_KEY);
    const existing = members.find(m => m.clubId === clubId && m.userId === userId);
    if (existing) {
      members = members.filter(m => !(m.clubId === clubId && m.userId === userId));
      saveMockData(MOCK_CLUB_MEMBERS_KEY, members);
      
      if (existing.role !== "pending") {
        const clubs = getMockData(MOCK_CLUBS_KEY);
        const cIdx = clubs.findIndex(c => c.id === clubId);
        if (cIdx !== -1) {
          clubs[cIdx].memberCount = Math.max(0, (clubs[cIdx].memberCount || 1) - 1);
          saveMockData(MOCK_CLUBS_KEY, clubs);
        }
      }
    }
    return;
  }

  try {
    const memberRef = doc(db, "club_members", `${clubId}_${userId}`);
    const memberSnap = await getDoc(memberRef);
    if (memberSnap.exists()) {
      const isPending = memberSnap.data().role === "pending";
      await deleteDoc(memberRef);

      if (!isPending) {
        const clubRef = doc(db, "clubs", clubId);
        const snap = await getDoc(clubRef);
        if (snap.exists()) {
          await updateDoc(clubRef, { memberCount: Math.max(0, (snap.data().memberCount || 1) - 1) });
        }
      }
    }
  } catch (err) {
    console.error("Error leaving club", err);
    throw new Error("Failed to leave club");
  }
};

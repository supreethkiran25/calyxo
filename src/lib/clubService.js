import { db } from "./firebase";
import { collection, doc, addDoc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { isMockFirebase, getMockData, saveMockData } from "./dbService";

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

import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { syncHealthTwin } from '../services/geminiService';

let lastSyncTime = 0;
const SYNC_THROTTLE_MS = 15 * 60 * 1000; // 15 minutes throttle

export const syncAIHealthTwin = async (force = false) => {
  try {
    if (!force && Date.now() - lastSyncTime < SYNC_THROTTLE_MS) {
      return useEcosystemStore.getState().healthTwin;
    }

    const state = useStore.getState();
    const ecoState = useEcosystemStore.getState();

    const payload = {
      userProfile: state.userProfile,
      metrics: ecoState.fitnessScore,
      recentLogs: {
        food: state.foodLogs.slice(0, 10),
        workout: state.workoutLogs.slice(0, 5),
        water: state.waterIntake
      },
      activeDeficit: state.userProfile?.goal === 'lose' ? 500 : 0
    };

    lastSyncTime = Date.now();
    const data = await syncHealthTwin(payload);

    if (data) {
      useEcosystemStore.getState().updateHealthTwin(data);
      return data;
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
};

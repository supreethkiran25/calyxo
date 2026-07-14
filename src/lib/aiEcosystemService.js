import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';

export const syncAIHealthTwin = async () => {
  try {
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

    const res = await fetch('/api/gemini/twin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      useEcosystemStore.getState().updateHealthTwin(data);
      return data;
    } else {
      console.warn("Failed to sync AI Health Twin (Backend Error or High Demand)");
      return null;
    }
  } catch (err) {
    console.error("AI Ecosystem Sync Error:", err);
    return null;
  }
};

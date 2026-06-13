import { create } from 'zustand';
import { 
  getHealthMetrics, 
  saveHealthMetrics, 
  getStepsHistory, 
  addStepsHistory, 
  getSleepHistory, 
  addSleepHistory, 
  getHeartRateHistory, 
  addHeartRateHistory, 
  getDeviceConnections, 
  saveDeviceConnection, 
  getHealthReports, 
  saveHealthReport,
  fetchWithRetry
} from '../lib/dbService';
import { generateWearableData } from '../lib/healthEngine';

// Default list of goals
const DEFAULT_GOALS = [
  { id: 'steps_daily', name: '10,000 Steps Daily', type: 'steps', target: 10000, progress: 0, completed: false },
  { id: 'sleep_daily', name: 'Sleep 8 Hours Daily', type: 'sleep', target: 8, progress: 0, completed: false },
  { id: 'calories_daily', name: 'Burn 500 Active Calories', type: 'calories', target: 500, progress: 0, completed: false },
  { id: 'distance_daily', name: 'Walk 5km Daily', type: 'distance', target: 5, progress: 0, completed: false },
  { id: 'recovery_target', name: 'Improve Recovery Score to 80+', type: 'recovery', target: 80, progress: 0, completed: false }
];

// Default list of challenges
const DEFAULT_CHALLENGES = [
  { id: 'challenge_100k_steps', name: '100k Steps Challenge', duration: '30-Day', description: 'Log a total of 100,000 steps over 30 days', target: 100000, progress: 24000, completed: false, unit: 'steps' },
  { id: 'challenge_30d_sleep', name: '30-Day Sleep Challenge', duration: '30-Day', description: 'Log at least 8 hours of sleep for 30 days', target: 30, progress: 8, completed: false, unit: 'days' },
  { id: 'challenge_7d_activity', name: '7-Day Activity Challenge', duration: '7-Day', description: 'Maintain at least 45 active minutes for 7 days', target: 7, progress: 2, completed: false, unit: 'days' },
  { id: 'challenge_recovery', name: 'High Recovery Streak', duration: '7-Day', description: 'Maintain a Good or Excellent recovery score for 5 days', target: 5, progress: 3, completed: false, unit: 'days' }
];

export const useHealthStore = create((set, get) => ({
  healthMetrics: [],
  stepsHistory: [],
  sleepHistory: [],
  heartRateHistory: [],
  deviceConnections: [],
  healthReports: [],
  goals: DEFAULT_GOALS,
  challenges: DEFAULT_CHALLENGES,
  
  syncing: false,
  loading: false,
  insights: '',
  loadingInsights: false,
  generatingReport: false,

  // Load initial health hub data
  fetchHealthData: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const metrics = await getHealthMetrics(userId);
      const steps = await getStepsHistory(userId);
      const sleep = await getSleepHistory(userId);
      const heart = await getHeartRateHistory(userId);
      const connections = await getDeviceConnections(userId);
      const reports = await getHealthReports(userId);

      // Handle loading stored goals/challenges from localStorage if available
      let savedGoals = DEFAULT_GOALS;
      let savedChallenges = DEFAULT_CHALLENGES;
      if (typeof window !== 'undefined') {
        const localGoals = localStorage.getItem(`calyxo_goals_${userId}`);
        const localChallenges = localStorage.getItem(`calyxo_challenges_${userId}`);
        if (localGoals) savedGoals = JSON.parse(localGoals);
        if (localChallenges) savedChallenges = JSON.parse(localChallenges);
      }

      set({
        healthMetrics: metrics || [],
        stepsHistory: steps || [],
        sleepHistory: sleep || [],
        heartRateHistory: heart || [],
        deviceConnections: connections || [],
        healthReports: reports || [],
        goals: savedGoals,
        challenges: savedChallenges,
        loading: false
      });
    } catch (err) {
      console.error("fetchHealthData error", err);
      set({ loading: false });
    }
  },

  // Toggle connection state for a wearable
  toggleDevice: async (userId, provider, connectFlag) => {
    if (!userId) return;
    try {
      const updatedConnection = {
        provider,
        connected: connectFlag,
        lastSync: connectFlag ? new Date().toLocaleString() : 'Never',
        syncFrequency: connectFlag ? 'Automatic (Hourly)' : 'None'
      };
      
      await saveDeviceConnection(userId, updatedConnection);
      
      // Update local state
      set((state) => {
        const nextConns = [...state.deviceConnections];
        const idx = nextConns.findIndex(c => c.provider === provider);
        if (idx > -1) {
          nextConns[idx] = { ...nextConns[idx], ...updatedConnection };
        } else {
          nextConns.push(updatedConnection);
        }
        return { deviceConnections: nextConns };
      });
    } catch (e) {
      console.error("toggleDevice error", e);
    }
  },

  // Sync data from connected wearable
  syncDevice: async (userId, provider, userProfile, foodLogs, workoutLogs, waterIntake) => {
    if (!userId) return;
    set({ syncing: true });

    // Artificial delay to simulate syncing
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Generate realistic metrics
      const syncedMetrics = generateWearableData(
        provider,
        userProfile,
        foodLogs,
        workoutLogs,
        waterIntake
      );

      const dateStr = new Date().toISOString().split('T')[0];

      // Save metrics
      await saveHealthMetrics(userId, {
        date: dateStr,
        ...syncedMetrics
      });

      // Save history entries
      const stepsEntry = {
        date: dateStr,
        steps: syncedMetrics.steps,
        distance: syncedMetrics.distance,
        caloriesBurned: syncedMetrics.caloriesBurned,
        goalCompletion: Math.min(100, Math.round((syncedMetrics.steps / 10000) * 100))
      };
      await addStepsHistory(userId, stepsEntry);

      const sleepEntry = {
        date: dateStr,
        duration: syncedMetrics.sleepDuration,
        quality: syncedMetrics.sleepQuality,
        consistency: syncedMetrics.sleepQuality - 5 + Math.floor(Math.random() * 10),
        deepSleep: Number((syncedMetrics.sleepDuration * 0.22).toFixed(1)),
        lightSleep: Number((syncedMetrics.sleepDuration * 0.53).toFixed(1)),
        remSleep: Number((syncedMetrics.sleepDuration * 0.20).toFixed(1)),
        awakeTime: Number((syncedMetrics.sleepDuration * 0.05).toFixed(1))
      };
      await addSleepHistory(userId, sleepEntry);

      const hrEntry = {
        date: dateStr,
        average: Math.round(syncedMetrics.restingHR * 1.15),
        resting: syncedMetrics.restingHR,
        readings: Array.from({ length: 12 }, (_, i) => ({
          time: `${String(i * 2).padStart(2, '0')}:00`,
          value: syncedMetrics.restingHR + Math.floor(Math.random() * 30) - 5
        }))
      };
      await addHeartRateHistory(userId, hrEntry);

      // Update Device Connection Last Sync timestamp
      const updatedConn = {
        provider,
        connected: true,
        lastSync: new Date().toLocaleString(),
        syncFrequency: 'Automatic (Hourly)'
      };
      await saveDeviceConnection(userId, updatedConn);

      // Update local goals progress based on synced metrics
      set((state) => {
        const nextGoals = state.goals.map(g => {
          let progress = g.progress;
          if (g.type === 'steps') progress = syncedMetrics.steps;
          else if (g.type === 'sleep') progress = syncedMetrics.sleepDuration;
          else if (g.type === 'calories') progress = syncedMetrics.caloriesBurned;
          else if (g.type === 'distance') progress = syncedMetrics.distance;
          else if (g.type === 'recovery') progress = syncedMetrics.recoveryScore;

          return {
            ...g,
            progress,
            completed: progress >= g.target
          };
        });

        // Update local challenges progress
        const nextChallenges = state.challenges.map(c => {
          let progress = c.progress;
          if (c.id === 'challenge_100k_steps') {
            progress = Math.min(c.target, c.progress + syncedMetrics.steps);
          } else if (c.id === 'challenge_30d_sleep' && syncedMetrics.sleepDuration >= 8) {
            progress = Math.min(c.target, c.progress + 1);
          } else if (c.id === 'challenge_7d_activity' && syncedMetrics.activeMinutes >= 45) {
            progress = Math.min(c.target, c.progress + 1);
          } else if (c.id === 'challenge_recovery' && syncedMetrics.recoveryScore >= 70) {
            progress = Math.min(c.target, c.progress + 1);
          }

          return {
            ...c,
            progress,
            completed: progress >= c.target
          };
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem(`calyxo_goals_${userId}`, JSON.stringify(nextGoals));
          localStorage.setItem(`calyxo_challenges_${userId}`, JSON.stringify(nextChallenges));
        }

        // Trigger refresh of list stats
        return {
          goals: nextGoals,
          challenges: nextChallenges,
          syncing: false
        };
      });

      // Reload lists
      await get().fetchHealthData(userId);

      return syncedMetrics;
    } catch (e) {
      console.error("syncDevice error", e);
      set({ syncing: false });
      return null;
    }
  },

  // Add a personalized goal
  addGoal: (userId, goal) => {
    set((state) => {
      const nextGoals = [
        ...state.goals,
        {
          id: `goal_${Date.now()}`,
          progress: 0,
          completed: false,
          ...goal
        }
      ];
      if (typeof window !== 'undefined' && userId) {
        localStorage.setItem(`calyxo_goals_${userId}`, JSON.stringify(nextGoals));
      }
      return { goals: nextGoals };
    });
  },

  // Delete a goal
  deleteGoal: (userId, goalId) => {
    set((state) => {
      const nextGoals = state.goals.filter(g => g.id !== goalId);
      if (typeof window !== 'undefined' && userId) {
        localStorage.setItem(`calyxo_goals_${userId}`, JSON.stringify(nextGoals));
      }
      return { goals: nextGoals };
    });
  },

  // AI Health Insights via Gemini Route
  generateInsights: async (userId, userProfile, foodLogs, workoutLogs) => {
    if (!userId) return;
    set({ loadingInsights: true });

    try {
      const activeMetrics = get().healthMetrics[0] || generateWearableData('google', userProfile, foodLogs, workoutLogs, 1500);
      const sleepList = get().sleepHistory.slice(0, 5);
      const stepsList = get().stepsHistory.slice(0, 5);

      const response = await fetchWithRetry('/api/gemini/health-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userProfile,
          activeMetrics,
          sleepHistory: sleepList,
          stepsHistory: stepsList,
          nutritionLogs: foodLogs.slice(0, 5),
          workoutLogs: workoutLogs.slice(0, 5)
        })
      });

      if (response.ok) {
        const data = await response.json();
        set({ insights: data.insights, loadingInsights: false });
      } else {
        throw new Error("Failed to load insights from API.");
      }
    } catch (err) {
      console.error("generateInsights error", err);
      set({ 
        insights: `⚠️ **AI Coaching Server Fallback:**\n\n- **Today's Steps progress:** Your consistency shows great indicators. Target 10,000 steps daily.\n- **Sleep quality recovery:** Your sleep consistency has slightly deviated this week. Optimize bedtime routines.\n- **Training suggestion:** Ready levels are in the optimal zone. Try a moderate high-intensity circuit workout tomorrow!`,
        loadingInsights: false 
      });
    }
  },

  // Health Report Generation
  generateReport: async (userId, reportType, dateRange, userProfile, foodLogs, workoutLogs) => {
    if (!userId) return;
    set({ generatingReport: true });

    try {
      const activeMetrics = get().healthMetrics[0] || generateWearableData('google', userProfile, foodLogs, workoutLogs, 1500);
      const sleepList = get().sleepHistory.slice(0, 7);
      const stepsList = get().stepsHistory.slice(0, 7);

      // We call Gemini to generate a report summary
      const response = await fetchWithRetry('/api/gemini/health-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          userProfile,
          activeMetrics,
          sleepHistory: sleepList,
          stepsHistory: stepsList,
          nutritionLogs: foodLogs.slice(0, 5),
          workoutLogs: workoutLogs.slice(0, 5),
          isReport: true,
          reportType
        })
      });

      let summaryText = `This is a comprehensive summary of your ${reportType} logs.`;
      if (response.ok) {
        const data = await response.json();
        summaryText = data.insights;
      }

      const reportData = {
        reportType,
        dateRange,
        healthScore: activeMetrics.healthScore || 75,
        summaryText,
        data: {
          stepsAvg: Math.round(stepsList.reduce((s, x) => s + x.steps, 0) / Math.max(1, stepsList.length)) || 8400,
          sleepAvg: Number((sleepList.reduce((s, x) => s + x.duration, 0) / Math.max(1, sleepList.length)).toFixed(1)) || 7.2,
          caloriesBurnedSum: stepsList.reduce((s, x) => s + x.caloriesBurned, 0) || 3200,
          restingHRAvg: activeMetrics.restingHR || 62,
          recoveryAvg: activeMetrics.recoveryScore || 78,
          readinessAvg: activeMetrics.readinessScore || 82,
          components: {
            nutrition: activeMetrics.nutritionScore || 80,
            activity: activeMetrics.activityScore || 85,
            recovery: activeMetrics.recoveryScore || 78,
            consistency: activeMetrics.consistencyScore || 90
          }
        }
      };

      await saveHealthReport(userId, reportData);
      
      // Reload reports
      const reports = await getHealthReports(userId);
      set({ healthReports: reports || [], generatingReport: false });
    } catch (e) {
      console.error("generateReport error", e);
      set({ generatingReport: false });
    }
  }
}));

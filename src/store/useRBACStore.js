import { create } from 'zustand';
import {
  fetchTrainerClients,
  fetchDietitianClients,
  sendClientInvitation,
  assignWorkoutToClient,
  assignMealPlanToClient,
  fetchAssignedWorkouts,
  fetchAssignedMealPlans,
  fetchAllUsers,
  updateUserRole
} from '../lib/dbService';

export const useRBACStore = create((set, get) => ({
  trainerClients: [],
  dietitianClients: [],
  assignedWorkouts: [],
  assignedMealPlans: [],
  pendingInvitations: [],
  adminUsers: [],
  loading: false,
  submitting: false,

  // Load Trainer Client Roster
  getTrainerClients: async (trainerId) => {
    if (!trainerId) return;
    set({ loading: true });
    try {
      const clients = await fetchTrainerClients(trainerId);
      set({ trainerClients: clients || [], loading: false });
    } catch (e) {
      console.error("getTrainerClients error", e);
      set({ loading: false });
    }
  },

  // Load Dietitian Client Roster
  getDietitianClients: async (dietitianId) => {
    if (!dietitianId) return;
    set({ loading: true });
    try {
      const clients = await fetchDietitianClients(dietitianId);
      set({ dietitianClients: clients || [], loading: false });
    } catch (e) {
      console.error("getDietitianClients error", e);
      set({ loading: false });
    }
  },

  // Send invitation link to client
  inviteClient: async (inviterId, clientEmail, type, inviterName) => {
    if (!inviterId || !clientEmail) return false;
    set({ submitting: true });
    try {
      const success = await sendClientInvitation(inviterId, clientEmail, type, inviterName);
      if (success) {
        // Refresh appropriate connection
        if (type === 'trainer') {
          await get().getTrainerClients(inviterId);
        } else {
          await get().getDietitianClients(inviterId);
        }
      }
      set({ submitting: false });
      return success;
    } catch (e) {
      console.error("inviteClient error", e);
      set({ submitting: false });
      return false;
    }
  },

  // Assign a workout program to a client
  assignWorkout: async (trainerId, trainerName, clientId, workoutData) => {
    if (!trainerId || !clientId) return false;
    set({ submitting: true });
    try {
      const assignment = {
        trainerId,
        trainerName,
        clientId,
        workoutName: workoutData.workoutName,
        exercises: workoutData.exercises,
        notes: workoutData.notes,
        dateAssigned: new Date().toLocaleDateString(),
        timestamp: Date.now()
      };
      const result = await assignWorkoutToClient(assignment);
      set({ submitting: false });
      return !!result;
    } catch (e) {
      console.error("assignWorkout error", e);
      set({ submitting: false });
      return false;
    }
  },

  // Assign a meal plan program to a client
  assignMealPlan: async (dietitianId, dietitianName, clientId, mealPlanData) => {
    if (!dietitianId || !clientId) return false;
    set({ submitting: true });
    try {
      const assignment = {
        dietitianId,
        dietitianName,
        clientId,
        calories: mealPlanData.calories,
        protein: mealPlanData.protein,
        carbs: mealPlanData.carbs,
        fat: mealPlanData.fat,
        meals: mealPlanData.meals,
        dateAssigned: new Date().toLocaleDateString(),
        timestamp: Date.now()
      };
      const result = await assignMealPlanToClient(assignment);
      set({ submitting: false });
      return !!result;
    } catch (e) {
      console.error("assignMealPlan error", e);
      set({ submitting: false });
      return false;
    }
  },

  // Fetch all assignments linked to this client
  getClientPrograms: async (clientId) => {
    if (!clientId) return;
    set({ loading: true });
    try {
      const workouts = await fetchAssignedWorkouts(clientId);
      const meals = await fetchAssignedMealPlans(clientId);
      set({
        assignedWorkouts: workouts || [],
        assignedMealPlans: meals || [],
        loading: false
      });
    } catch (e) {
      console.error("getClientPrograms error", e);
      set({ loading: false });
    }
  },

  // Load administrative user list
  getAdminUserList: async () => {
    set({ loading: true });
    try {
      const users = await fetchAllUsers();
      set({ adminUsers: users || [], loading: false });
    } catch (e) {
      console.error("getAdminUserList error", e);
      set({ loading: false });
    }
  },

  // Update a user's role (Admin Action)
  changeUserRole: async (targetUserId, newRole) => {
    if (!targetUserId || !newRole) return false;
    set({ submitting: true });
    try {
      const success = await updateUserRole(targetUserId, newRole);
      if (success) {
        await get().getAdminUserList();
      }
      set({ submitting: false });
      return success;
    } catch (e) {
      console.error("changeUserRole error", e);
      set({ submitting: false });
      return false;
    }
  }
}));

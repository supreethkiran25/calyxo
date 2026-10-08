import { create } from 'zustand';

/**
 * Calyxo Core Application Lifecycle & Initialization Store
 */
export const useAppStore = create((set, get) => ({
  isInitialized: false,
  initProgress: 0,
  currentTask: 'idle',
  error: null,
  activeWorkoutSession: null,
  isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
  destinationRoute: null,

  setInitProgress: (progress, task) => set({ 
    initProgress: Math.min(100, Math.max(0, progress)),
    currentTask: task || get().currentTask 
  }),

  setInitialized: (isInitialized) => set({ isInitialized }),

  setError: (error) => set({ error }),

  setActiveWorkoutSession: (session) => set({ activeWorkoutSession: session }),

  setOfflineStatus: (isOffline) => set({ isOffline }),

  setDestinationRoute: (route) => set({ destinationRoute: route }),

  reset: () => set({
    isInitialized: false,
    initProgress: 0,
    currentTask: 'idle',
    error: null,
    activeWorkoutSession: null,
    destinationRoute: null
  })
}));

export default useAppStore;

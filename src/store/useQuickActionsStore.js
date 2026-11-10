import { create } from 'zustand';

const useQuickActionsStore = create((set) => ({
  activeWorkflow: null, // null | 'log_workout' | 'log_meal' | 'start_chat' | 'progress_photo' | 'log_water' | 'update_weight' | 'start_live_session' | 'anatomy_target'
  workflowData: null, // Any temporary data passed to the workflow
  legalModalType: null, // null | 'terms' | 'privacy'
  isSheetOpen: false,
  
  setActiveWorkflow: (workflow, data = null) => set({ activeWorkflow: workflow, workflowData: data }),
  // Alias used across page CTAs — must stay in sync with setActiveWorkflow
  openWorkflow: (workflow, data = null) => set({ activeWorkflow: workflow, workflowData: data }),
  closeWorkflow: () => set({ activeWorkflow: null, workflowData: null }),
  openLegalModal: (type = 'terms') => set({ legalModalType: type }),
  closeLegalModal: () => set({ legalModalType: null }),
  openSheet: () => set({ isSheetOpen: true }),
  closeSheet: () => set({ isSheetOpen: false }),
  // Convenience: open the Log sheet from anywhere
  openLogSheet: () => set({ isSheetOpen: true }),
}));

export default useQuickActionsStore;

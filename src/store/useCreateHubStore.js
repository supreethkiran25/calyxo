import { create } from 'zustand';

const useCreateHubStore = create((set) => ({
  activeWorkflow: null, // null | 'log_workout' | 'log_meal' | 'scan_food' | 'create_post' | 'create_club' | 'start_chat' | 'progress_photo' | 'start_challenge'
  workflowData: null, // Any temporary data passed to the workflow
  
  setActiveWorkflow: (workflow, data = null) => set({ activeWorkflow: workflow, workflowData: data }),
  closeWorkflow: () => set({ activeWorkflow: null, workflowData: null }),
}));

export default useCreateHubStore;

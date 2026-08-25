import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Camera, Save, RefreshCw, Ruler, Scale } from 'lucide-react';
import useQuickActionsStore from '../../store/useQuickActionsStore';
import { useEcosystemStore } from '../../store/useEcosystemStore';
import { useStore } from '../../store/useStore';
import { getCurrentUserId, getCurrentUserIdSync } from '../../lib/dbService';

export default function ProgressUploadModal() {
  const { activeWorkflow, closeWorkflow } = useQuickActionsStore();
  const { addXP, updateStreaks } = useEcosystemStore();
  const user = useStore(state => state.user);
  
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  if (activeWorkflow !== 'progress_photo') return null;

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {

    if (!weight && !photo) return;
    
    const uid = user?.uid || user?.id || getCurrentUserIdSync() || (await getCurrentUserId());
    if (!uid) return;


    setIsSaving(true);
    
    try {
      // Simulate API call for now
      // Here you would upload `photo` to Cloud Storage and save metrics to database
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      addXP(100); 
      updateStreaks();
      
      closeWorkflow();
    } catch (error) {
      console.error("Error saving progress:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-[calc(1rem+env(safe-area-inset-top,0px))]">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={closeWorkflow}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          data-keyboard-scroll="true"
          style={{
            maxHeight: 'min(88dvh, calc(100dvh - var(--keyboard-height, 0px) - 20px))'
          }}
          className="relative w-full max-w-md bg-surface border border-card-border rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col overflow-y-auto scrollbar-thin modal-scroll-body"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Upload Progress
            </h2>
            <button 
              onClick={closeWorkflow}
              className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            {/* Photo Upload */}
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">Progress Photo</label>
              {!photo ? (
                <div 
                  className="w-full h-40 border-2 border-dashed border-card-border rounded-2xl flex flex-col items-center justify-center bg-surface/50 cursor-pointer hover:bg-surface transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-8 h-8 text-muted mb-2 opacity-50" />
                  <p className="text-sm font-bold text-foreground">Add Before/After Photo</p>
                </div>
              ) : (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-card-border">
                  <img src={photo} alt="Progress" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => setPhoto(null)}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                  <Scale className="w-3 h-3 text-indigo-500" /> Body Weight (lbs)
                </label>
                <input 
                  type="number" 
                  placeholder="e.g. 175"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-lg font-black shadow-inner"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                  <Ruler className="w-3 h-3 text-indigo-500" /> Body Fat (%)
                </label>
                <input 
                  type="number" 
                  placeholder="e.g. 15"
                  value={bodyFat}
                  onChange={(e) => setBodyFat(e.target.value)}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-lg font-black shadow-inner"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider mb-1.5 block">Progress Notes</label>
              <textarea 
                rows={3}
                placeholder="How are you feeling today? Noticed any strength gains?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-sm shadow-inner resize-none"
              />
            </div>
          </div>
          
          <div className="pt-6 mt-4 border-t border-card-border">
            <button 
              onClick={handleSave}
              disabled={isSaving || (!weight && !photo)}
              className="w-full py-3.5 bg-accent hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-accent-foreground rounded-2xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer border-none shadow-md active:scale-[0.98]"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Progress
                </>
              )}
            </button>
          </div>
          
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

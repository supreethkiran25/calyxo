import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Camera, Save, RefreshCw, Ruler, Scale } from 'lucide-react';
import useQuickActionsStore from '../../store/useQuickActionsStore';
import { useEcosystemStore } from '../../store/useEcosystemStore';
import { getCurrentUserId } from '../../lib/dbService';

export default function ProgressUploadModal() {
  const { activeWorkflow, closeWorkflow } = useQuickActionsStore();
  const { addXP, updateStreaks } = useEcosystemStore();
  
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
    
    const uid = getCurrentUserId();
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={closeWorkflow}
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-surface border border-card-border rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar"
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
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
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

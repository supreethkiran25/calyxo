import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Apple, Camera, Save, RefreshCw, Search } from 'lucide-react';
import useQuickActionsStore from '../../store/useQuickActionsStore';
import { useEcosystemStore } from '../../store/useEcosystemStore';
import { addFoodLog, getCurrentUserId } from '../../lib/dbService';

export default function MealLoggerModal() {
  const { activeWorkflow, closeWorkflow, setActiveWorkflow } = useQuickActionsStore();
  const { addXP, updateStreaks } = useEcosystemStore();
  const inputRef = useRef(null);

  useEffect(() => {
    if (activeWorkflow === 'log_meal' && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [activeWorkflow]);
  
  const [mealName, setMealName] = useState('');
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fat, setFat] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  if (activeWorkflow !== 'log_meal') return null;

  const handleSave = async () => {
    if (!mealName || calories <= 0) return;
    
    const uid = getCurrentUserId();
    if (!uid) {
      console.error("No user ID found.");
      return;
    }

    setIsSaving(true);
    
    try {
      const mealData = {
        name: mealName,
        calories,
        macros: {
          protein,
          carbs,
          fat
        }
      };

      await addFoodLog(uid, mealData);
      
      // Update ecosystem store
      addXP(50); // Award XP for logging a meal
      updateStreaks();
      
      closeWorkflow();
      
    } catch (error) {
      console.error("Error saving meal:", error);
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
          className="relative w-full max-w-md bg-surface border border-card-border rounded-3xl p-6 shadow-2xl flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Apple className="w-5 h-5 text-green-500" /> Log Meal
            </h2>
            <button 
              onClick={closeWorkflow}
              className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 mb-6">
            <button 
              onClick={() => setActiveWorkflow('scan_food')}
              className="flex-1 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/20 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4" /> Scan Food with AI
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Meal Name</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input 
                  ref={inputRef}
                  type="text" 
                  placeholder="e.g. Grilled Chicken Salad" 
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:border-green-500 text-sm shadow-inner"
                />
              </div>
            </div>
            
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Total Calories</label>
              <input 
                type="number" 
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-green-500 text-xl font-black shadow-inner"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase block mb-1">Protein (g)</label>
                <input 
                  type="number" 
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-lg focus:outline-none focus:border-green-500 text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted uppercase block mb-1">Carbs (g)</label>
                <input 
                  type="number" 
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-lg focus:outline-none focus:border-green-500 text-sm font-bold"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted uppercase block mb-1">Fat (g)</label>
                <input 
                  type="number" 
                  value={fat}
                  onChange={(e) => setFat(Number(e.target.value))}
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-2 py-2 rounded-lg focus:outline-none focus:border-green-500 text-sm font-bold"
                />
              </div>
            </div>
          </div>
          
          <div className="pt-6 mt-4 border-t border-card-border">
            <button 
              onClick={handleSave}
              disabled={isSaving || !mealName || calories <= 0}
              className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Log Meal
                </>
              )}
            </button>
          </div>
          
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

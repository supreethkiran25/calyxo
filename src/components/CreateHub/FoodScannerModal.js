import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, ScanLine, Image as ImageIcon, CheckCircle, RefreshCw, Save } from 'lucide-react';
import useCreateHubStore from '../../store/useCreateHubStore';
import { addFoodLog, getCurrentUserId } from '../../lib/dbService';
import { useEcosystemStore } from '../../store/useEcosystemStore';

export default function FoodScannerModal() {
  const { activeWorkflow, closeWorkflow, setActiveWorkflow } = useCreateHubStore();
  const { addXP, updateStreaks } = useEcosystemStore();
  
  const [image, setImage] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef(null);

  if (activeWorkflow !== 'scan_food') return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        scanImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const scanImage = async (base64Image) => {
    setIsScanning(true);
    setResult(null);

    try {
      const response = await fetch('/api/gemini/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          prompt: "Analyze this image of food. Identify what it is, and provide a realistic estimate of its nutritional value. Return a JSON object ONLY with the following exact keys: 'name' (string), 'calories' (number), 'protein' (number), 'carbs' (number), 'fat' (number)."
        })
      });

      if (!response.ok) {
        console.warn("Vision API returned non-OK status. Falling back.");
        setResult({ name: 'Scanned Food (Offline)', calories: 400, protein: 20, carbs: 45, fat: 15 });
        return;
      }
      
      const data = await response.json();
      
      // The route.js endpoint already parses the JSON and returns it.
      // It returns: { foodName, calories, protein, carbs, fat, fiber, sugar, ... }
      const parsedData = {
        name: data.foodName || data.name || 'Unknown Food',
        calories: data.calories || 0,
        protein: data.protein || 0,
        carbs: data.carbs || 0,
        fat: data.fat || 0
      };

      setResult(parsedData);
    } catch (error) {
      console.error("Error scanning food:", error);
      // Fallback dummy data on error
      setResult({ name: 'Scanned Food (Offline)', calories: 400, protein: 20, carbs: 45, fat: 15 });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    
    const uid = getCurrentUserId();
    if (!uid) {
      console.error("No user ID found.");
      return;
    }

    setIsSaving(true);
    
    try {
      const mealData = {
        name: result.name,
        calories: result.calories,
        macros: {
          protein: result.protein,
          carbs: result.carbs,
          fat: result.fat
        },
        image: image // Save the image string too
      };

      await addFoodLog(uid, mealData);
      
      addXP(75); // More XP for using AI
      updateStreaks();
      closeWorkflow();
      
    } catch (error) {
      console.error("Error saving scanned meal:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualEntry = () => {
    setActiveWorkflow('log_meal');
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
              <ScanLine className="w-5 h-5 text-orange-500" /> AI Food Scan
            </h2>
            <button 
              onClick={closeWorkflow}
              className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {!image ? (
            <div className="space-y-4">
              <div 
                className="w-full aspect-square border-2 border-dashed border-card-border rounded-2xl flex flex-col items-center justify-center bg-surface/50 cursor-pointer hover:bg-surface transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-12 h-12 text-muted mb-4 opacity-50" />
                <p className="text-sm font-bold text-foreground">Tap to take a photo</p>
                <p className="text-xs text-muted mt-1">or upload from gallery</p>
              </div>
              
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleImageUpload}
              />

              <div className="flex items-center gap-4 py-2">
                <div className="h-px bg-card-border flex-1" />
                <span className="text-[10px] font-bold text-muted uppercase tracking-widest">OR</span>
                <div className="h-px bg-card-border flex-1" />
              </div>

              <button 
                onClick={handleManualEntry}
                className="w-full py-3 bg-[var(--input)] hover:bg-card-border text-foreground rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Enter Manually
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-card-border">
                <img src={image} alt="Food scan" className="w-full h-full object-cover" />
                {isScanning && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                    <p className="text-xs font-black uppercase tracking-widest text-orange-500 animate-pulse">Analyzing with AI...</p>
                  </div>
                )}
              </div>

              {result && !isScanning && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
                    <h3 className="text-lg font-black text-foreground mb-1">{result.name}</h3>
                    <p className="text-3xl font-black text-orange-500">{result.calories} <span className="text-sm text-muted">kcal</span></p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-surface/50 border border-card-border rounded-xl p-3 text-center">
                      <span className="text-[10px] font-bold text-muted uppercase block mb-1">Protein</span>
                      <span className="text-sm font-black text-foreground">{result.protein}g</span>
                    </div>
                    <div className="bg-surface/50 border border-card-border rounded-xl p-3 text-center">
                      <span className="text-[10px] font-bold text-muted uppercase block mb-1">Carbs</span>
                      <span className="text-sm font-black text-foreground">{result.carbs}g</span>
                    </div>
                    <div className="bg-surface/50 border border-card-border rounded-xl p-3 text-center">
                      <span className="text-[10px] font-bold text-muted uppercase block mb-1">Fat</span>
                      <span className="text-sm font-black text-foreground">{result.fat}g</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button 
                      onClick={() => setImage(null)}
                      className="flex-1 py-3 bg-[var(--input)] hover:bg-card-border text-foreground rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                    >
                      Retake
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-[2] py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors"
                    >
                      {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Log Food
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

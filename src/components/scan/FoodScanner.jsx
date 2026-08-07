'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { scanFoodImage } from '@/lib/geminiVision';
import { supabase } from '@/lib/supabaseClient';
import { addFoodLog, getCurrentUserIdSync } from '@/lib/dbService';
import CameraCapture from './CameraCapture';
import FoodScanResult from './FoodScanResult';

// States: idle → capturing → analysing → reviewing → logging → done
const FoodScanner = ({ onClose, onLogged }) => {
  const [stage, setStage] = useState('capturing');
  const [imagePreview, setImagePreview] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [logging, setLogging] = useState(false);

  const handleCapture = async (base64Image, previewUrl) => {
    setImagePreview(previewUrl);
    setStage('analysing');

    try {
      const result = await scanFoodImage(base64Image);
      setScanResult(result);
      setStage('reviewing');
    } catch (err) {
      toast.error(err.message || 'Scan failed. Try again with a clearer photo.');
      setStage('capturing');
    }
  };

  const handleRetry = () => {
    setScanResult(null);
    setImagePreview(null);
    setStage('capturing');
  };

  const handleConfirmLog = async (logData) => {
    setLogging(true);
    try {
      let userId = null;
      try {
        const { data } = await supabase.auth.getUser();
        userId = data?.user?.id || null;
      } catch (e) {}

      if (!userId) {
        userId = getCurrentUserIdSync() || "local-user";
      }

      // 1. Log to nutrition_logs table for AI Telemetry
      try {
        await supabase.from('nutrition_logs').insert({
          user_id: userId,
          food_name: logData.food_name,
          calories: logData.calories,
          protein_g: logData.protein_g,
          carbs_g: logData.carbs_g,
          fat_g: logData.fat_g,
          fiber_g: logData.fiber_g,
          serving_size: logData.serving_size,
          scan_source: 'camera',
          scan_confidence: logData.scan_confidence,
          logged_at: new Date().toISOString()
        });
      } catch (dbErr) {
        console.warn("nutrition_logs insert error:", dbErr);
      }

      // 2. Log to primary food_logs via dbService
      const logEntry = {
        name: logData.food_name,
        calories: logData.calories,
        protein: logData.protein_g,
        carbs: logData.carbs_g,
        fat: logData.fat_g,
        portionWeight: parseInt(logData.serving_size) || 100,
        timestamp: Date.now()
      };

      let savedEntry = logEntry;
      try {
        savedEntry = await addFoodLog(userId, logEntry);
      } catch (e) {
        console.warn("addFoodLog call error:", e);
      }

      toast.success(`${logData.food_name} logged — ${logData.calories} kcal`);
      setStage('done');
      onLogged?.(savedEntry || logData);
      setTimeout(onClose, 600);
    } catch (err) {
      toast.error(err.message || 'Failed to log meal. Try again.');
    } finally {
      setLogging(false);
    }
  };

  // Analysing state (full-screen spinner)
  if (stage === 'analysing') {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          {imagePreview && (
            <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden shadow-2xl">
              <img src={imagePreview} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
              </div>
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-sm">Analysing food...</p>
            <p className="text-neutral-400 text-xs mt-1">Gemini Vision is identifying the meal</p>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'reviewing' && scanResult) {
    return (
      <FoodScanResult
        imagePreview={imagePreview}
        scanResult={scanResult}
        onConfirm={handleConfirmLog}
        onRetry={handleRetry}
        loading={logging}
      />
    );
  }

  // Default: camera capture
  return (
    <CameraCapture
      onCapture={handleCapture}
      onClose={onClose}
    />
  );
};

export default FoodScanner;

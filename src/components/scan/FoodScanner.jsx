'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw, Upload, X } from 'lucide-react';
import { scanFoodImage } from '@/lib/geminiVision';
import { supabase } from '@/lib/supabaseClient';
import { addFoodLog, getCurrentUserIdSync } from '@/lib/dbService';
import CameraCapture from './CameraCapture';
import FoodScanResult from './FoodScanResult';

// States: capturing → analysing → reviewing → error → logging → done
const FoodScanner = ({ onClose, onLogged }) => {
  const [stage, setStage] = useState('capturing');
  const [imagePreview, setImagePreview] = useState(null);
  const [rawBase64, setRawBase64] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [logging, setLogging] = useState(false);

  console.log(`[FoodScanner] Rendered stage: ${stage}, scanResult:`, scanResult ? scanResult.food_name : 'null');

  const handleCapture = async (base64Image, previewUrl) => {
    console.log("[FoodScanner] handleCapture initiated.");
    setRawBase64(base64Image);
    setImagePreview(previewUrl);
    setScanError(null);
    setStage('analysing');

    try {
      const result = await scanFoodImage(base64Image);
      console.log("[FoodScanner] Scan succeeded. Transitioning to 'reviewing'. Result:", result);
      setScanResult(result);
      setStage('reviewing');
    } catch (err) {
      console.error("[FoodScanner] Scan failed with error:", err.message);
      const msg = err.message || 'Scan failed. Try again with a clearer photo.';
      setScanError(msg);
      toast.error(msg);
      setStage('error');
    }
  };

  const handleRetryAnalysis = () => {
    console.log("[FoodScanner] Retrying analysis with existing image.");
    if (rawBase64 && imagePreview) {
      handleCapture(rawBase64, imagePreview);
    } else {
      handleRetry();
    }
  };

  const handleRetry = () => {
    console.log("[FoodScanner] Resetting scanner state to 'capturing'.");
    setScanResult(null);
    setImagePreview(null);
    setRawBase64(null);
    setScanError(null);
    setStage('capturing');
  };

  const handleConfirmLog = async (logData) => {
    console.log("[FoodScanner] Confirming log for meal:", logData.food_name);
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
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="text-center space-y-4 p-8 bg-neutral-900 border border-neutral-800 rounded-2xl max-w-sm w-full shadow-2xl">
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

  // Error state (preserve image, display error, offer retry)
  if (stage === 'error') {
    return (
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b border-neutral-800">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Scan Error
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {imagePreview && (
              <div className="relative h-40 rounded-xl overflow-hidden border border-neutral-800">
                <img src={imagePreview} alt="Captured food" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-1">
              <p className="font-semibold">Analysis Notice</p>
              <p className="text-[11px] opacity-90">{scanError || 'Could not identify meal. Please retry with clearer lighting.'}</p>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={handleRetryAnalysis}
                className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Analysis
              </button>
              <button
                onClick={handleRetry}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Different Photo
              </button>
            </div>
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

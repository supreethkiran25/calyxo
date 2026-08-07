'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { scanFoodImage } from '@/lib/geminiVision';
import { supabase } from '@/lib/supabaseClient';
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('nutrition_logs').insert({
        user_id: user.id,
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

      if (error) throw error;

      toast.success(`${logData.food_name} logged — ${logData.calories} kcal`);
      setStage('done');
      onLogged?.(logData);
      setTimeout(onClose, 800);
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
            <div className="relative w-48 h-48 mx-auto rounded-2xl overflow-hidden">
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

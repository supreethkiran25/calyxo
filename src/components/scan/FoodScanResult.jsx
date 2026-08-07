'use client';
import { useState } from 'react';
import { CheckCircle, AlertTriangle, Edit3, Flame } from 'lucide-react';

const MacroField = ({ label, value, onChange, unit = 'g', color }) => (
  <div className="space-y-1">
    <label className="text-[11px] uppercase tracking-wider font-medium" style={{ color }}>
      {label}
    </label>
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min="0"
        step="0.1"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
      />
      <span className="text-xs text-neutral-500 w-6">{unit}</span>
    </div>
  </div>
);

const FoodScanResult = ({ imagePreview, scanResult, onConfirm, onRetry, loading }) => {
  const [foodName, setFoodName] = useState(scanResult?.food_name || 'Scanned Meal');
  const [calories, setCalories] = useState(scanResult?.calories ?? 200);
  const [protein, setProtein] = useState(scanResult?.protein_g ?? 0);
  const [carbs, setCarbs] = useState(scanResult?.carbs_g ?? 0);
  const [fat, setFat] = useState(scanResult?.fat_g ?? 0);
  const [fiber, setFiber] = useState(scanResult?.fiber_g ?? 0);
  const [grams, setGrams] = useState(scanResult?.estimated_grams ?? 100);

  const confidence = scanResult?.confidence || 'medium';
  const isLowConfidence = confidence === 'low';
  const isMediumConfidence = confidence === 'medium';

  const handleLog = () => {
    const numProt = typeof protein === 'number' ? protein : parseFloat(protein) || 0;
    const numCarbs = typeof carbs === 'number' ? carbs : parseFloat(carbs) || 0;
    const numFat = typeof fat === 'number' ? fat : parseFloat(fat) || 0;
    const numFiber = typeof fiber === 'number' ? fiber : parseFloat(fiber) || 0;

    onConfirm({
      food_name: foodName || 'Scanned Meal',
      calories: Math.round(Number(calories) || 0),
      protein_g: parseFloat(numProt.toFixed(1)),
      carbs_g: parseFloat(numCarbs.toFixed(1)),
      fat_g: parseFloat(numFat.toFixed(1)),
      fiber_g: parseFloat(numFiber.toFixed(1)),
      serving_size: `${grams || 100}g`,
      scan_source: 'camera',
      scan_confidence: confidence
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Image strip */}
        {imagePreview && (
          <div className="relative h-36 overflow-hidden">
            <img src={imagePreview} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-black/20 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Detected</p>
                <p className="text-white font-semibold text-sm leading-tight">{foodName}</p>
              </div>
              {/* Confidence badge */}
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded border capitalize ${
                isLowConfidence
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : isMediumConfidence
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              }`}>
                {confidence} confidence
              </span>
            </div>
          </div>
        )}

        <div className="p-4 space-y-4">

          {/* Low confidence warning */}
          {isLowConfidence && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                Low confidence scan. Please review and adjust the values below before logging.
              </p>
            </div>
          )}

          {/* Notes from Gemini */}
          {scanResult?.notes && (
            <div className="px-3 py-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <p className="text-xs text-blue-300">{scanResult.notes}</p>
            </div>
          )}

          {/* Food name (always editable) */}
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Food name
            </label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Serving size */}
          <div className="space-y-1">
            <label className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">
              Portion (grams)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={grams}
                onChange={(e) => setGrams(parseInt(e.target.value) || 100)}
                className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-blue-500"
              />
              <span className="text-xs text-neutral-500">g</span>
              <span className="text-xs text-neutral-600 font-mono">
                ({scanResult?.serving_description || `~${grams}g`})
              </span>
            </div>
          </div>

          {/* Calories (large, prominent) */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-950 border border-neutral-800">
            <Flame className="w-5 h-5 text-orange-400 shrink-0" />
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-medium">Calories</p>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(parseInt(e.target.value) || 0)}
                  className="w-24 bg-transparent text-2xl font-semibold text-white focus:outline-none border-b border-transparent focus:border-blue-500"
                />
                <span className="text-sm text-neutral-500">kcal</span>
              </div>
            </div>
          </div>

          {/* Macros grid */}
          <div className="grid grid-cols-2 gap-3">
            <MacroField label="Protein" value={protein} onChange={setProtein} color="#60A5FA" />
            <MacroField label="Carbs" value={carbs} onChange={setCarbs} color="#FBBF24" />
            <MacroField label="Fat" value={fat} onChange={setFat} color="#F87171" />
            <MacroField label="Fiber" value={fiber} onChange={setFiber} color="#34D399" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onRetry}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              Retake
            </button>
            <button
              onClick={handleLog}
              disabled={loading || !foodName}
              className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Logging...
                </span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Log meal
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodScanResult;

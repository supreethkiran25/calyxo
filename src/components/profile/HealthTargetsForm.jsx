import React, { memo } from 'react';
import { Target, Activity, Zap } from 'lucide-react';

const HealthTargetsForm = memo(({ 
  dailyCalories, setDailyCalories,
  waterTarget, setWaterTarget,
  proteinTarget, setProteinTarget,
  carbsTarget, setCarbsTarget,
  fatTarget, setFatTarget,
  goalWeight, setGoalWeight,
  onSave, saving
}) => {
  return (
    <div className="bg-card-bg/60 border border-card-border rounded-3xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
      <div className="flex items-center gap-3 border-b border-card-border pb-4">
        <div className="p-2.5 rounded-2xl bg-acid-green/10 text-acid-green">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-black tracking-tight text-foreground">Daily Health & Nutrition Targets</h3>
          <p className="text-xs text-muted">Customize your calorie budget, macros, and hydration goals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Daily Calorie Target (kcal)</label>
          <input 
            type="number" 
            value={dailyCalories} 
            onChange={(e) => setDailyCalories(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl bg-surface border border-card-border text-foreground font-bold text-sm focus:outline-none focus:border-acid-green"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Water Target (ml)</label>
          <input 
            type="number" 
            value={waterTarget} 
            onChange={(e) => setWaterTarget(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl bg-surface border border-card-border text-foreground font-bold text-sm focus:outline-none focus:border-acid-green"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Protein Goal (g)</label>
          <input 
            type="number" 
            value={proteinTarget} 
            onChange={(e) => setProteinTarget(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl bg-surface border border-card-border text-foreground font-bold text-sm focus:outline-none focus:border-acid-green"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Carbs Goal (g)</label>
          <input 
            type="number" 
            value={carbsTarget} 
            onChange={(e) => setCarbsTarget(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl bg-surface border border-card-border text-foreground font-bold text-sm focus:outline-none focus:border-acid-green"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Fats Goal (g)</label>
          <input 
            type="number" 
            value={fatTarget} 
            onChange={(e) => setFatTarget(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl bg-surface border border-card-border text-foreground font-bold text-sm focus:outline-none focus:border-acid-green"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Target Weight (kg)</label>
          <input 
            type="number" 
            value={goalWeight} 
            onChange={(e) => setGoalWeight(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-2xl bg-surface border border-card-border text-foreground font-bold text-sm focus:outline-none focus:border-acid-green"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={onSave}
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-acid-green text-black text-xs font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-md cursor-pointer border-none"
        >
          {saving ? 'Saving...' : 'Save Health Targets'}
        </button>
      </div>
    </div>
  );
});

export default HealthTargetsForm;

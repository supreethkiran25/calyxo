import React, { useMemo } from 'react';
import { Card, ProgressBar } from '../../design-system/components/UIPrimitives';
import { BarChart2, ShieldCheck, Activity } from 'lucide-react';

const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Chest', color: '#3B82F6' },
  { id: 'back', label: 'Back', color: '#10B981' },
  { id: 'legs', label: 'Legs & Glutes', color: '#F59E0B' },
  { id: 'shoulders', label: 'Shoulders', color: '#8B5CF6' },
  { id: 'arms', label: 'Arms (Bi & Tri)', color: '#EC4899' },
  { id: 'core', label: 'Abs & Core', color: '#06B6D4' }
];

export default function MuscleBalanceView({ workoutLogs = [] }) {
  // Aggregate weekly volume per muscle group across last 7 days
  const weeklyData = useMemo(() => {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentWorkouts = workoutLogs.filter(w => (Number(w.timestamp) || 0) >= oneWeekAgo);

    const volumeMap = {
      chest: 0,
      back: 0,
      legs: 0,
      shoulders: 0,
      arms: 0,
      core: 0
    };

    recentWorkouts.forEach(w => {
      const exs = Array.isArray(w.exercises) ? w.exercises : [];
      exs.forEach(e => {
        const name = (e.name || '').toLowerCase();
        const target = (e.target || e.body_part || '').toLowerCase();

        // Calculate volume for this exercise
        let exVol = 0;
        const sets = Array.isArray(e.sets) ? e.sets : (Array.isArray(e.completedSets) ? e.completedSets : []);
        sets.forEach(s => {
          exVol += (Number(s.weight || s.weightKg || 0) * Number(s.reps || 0));
        });

        if (target.includes('chest') || name.includes('bench') || name.includes('press') && !name.includes('overhead')) {
          volumeMap.chest += exVol;
        } else if (target.includes('back') || target.includes('lat') || name.includes('row') || name.includes('pull')) {
          volumeMap.back += exVol;
        } else if (target.includes('leg') || target.includes('quad') || target.includes('hamstring') || target.includes('glute') || name.includes('squat')) {
          volumeMap.legs += exVol;
        } else if (target.includes('shoulder') || target.includes('delt') || name.includes('overhead')) {
          volumeMap.shoulders += exVol;
        } else if (target.includes('bicep') || target.includes('tricep') || target.includes('arm') || name.includes('curl')) {
          volumeMap.arms += exVol;
        } else {
          volumeMap.core += exVol;
        }
      });
    });

    const totalWeekly = Object.values(volumeMap).reduce((s, v) => s + v, 0);

    return {
      volumeMap,
      totalWeekly
    };
  }, [workoutLogs]);

  const maxVolume = Math.max(...Object.values(weeklyData.volumeMap), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-card-border pb-3">
        <div>
          <h3 className="text-sm font-extrabold text-foreground uppercase tracking-tight">
            Weekly Muscle Volume Distribution
          </h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Total 7-day load: <strong className="text-foreground font-mono">{weeklyData.totalWeekly.toLocaleString()} kg</strong>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {MUSCLE_GROUPS.map(mg => {
          const vol = weeklyData.volumeMap[mg.id] || 0;
          const pct = weeklyData.totalWeekly > 0 ? Math.round((vol / weeklyData.totalWeekly) * 100) : 0;

          return (
            <Card key={mg.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">{mg.label}</span>
                <span className="font-mono text-muted-foreground font-bold">
                  {vol.toLocaleString()} kg <span className="text-[10px] text-accent font-normal">({pct}%)</span>
                </span>
              </div>
              <ProgressBar current={vol} max={maxVolume} color={mg.color} height="h-2.5" />
            </Card>
          );
        })}
      </div>

      <p className="text-[11px] text-muted-foreground font-mono text-center">
        Note: Muscle distribution reflects actual training volume to help you balance pushing and pulling mechanics.
      </p>
    </div>
  );
}

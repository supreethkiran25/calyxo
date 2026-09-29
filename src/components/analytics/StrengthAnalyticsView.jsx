import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Dumbbell, Trophy, Calendar, Filter } from 'lucide-react';
import { WorkoutEngine } from '../../services/workout/WorkoutEngine';
import { Card, Chip } from '../../design-system/components/UIPrimitives';

const MAJOR_EXERCISES = [
  'Incline Dumbbell Bench Press',
  'Barbell Back Squats',
  'Romanian Deadlifts (RDLs)',
  'Overhead Barbell Press',
  'Bent Over Barbell Rows',
  'Weighted Pull-ups / Lat Pulldown'
];

const TIMEFRAMES = [
  { id: '7d', label: '7 Days', days: 7 },
  { id: '30d', label: '30 Days', days: 30 },
  { id: '90d', label: '90 Days', days: 90 },
  { id: 'all', label: 'All Time', days: 9999 }
];

export default function StrengthAnalyticsView({ workoutLogs = [] }) {
  const [selectedExercise, setSelectedExercise] = useState(MAJOR_EXERCISES[0]);
  const [timeframe, setTimeframe] = useState('30d');

  // Available exercises present in workout logs
  const availableExercises = useMemo(() => {
    const set = new Set(MAJOR_EXERCISES);
    workoutLogs.forEach(w => {
      (w.exercises || []).forEach(e => {
        if (e.name) set.add(e.name);
      });
    });
    return Array.from(set);
  }, [workoutLogs]);

  // Extract strength data points (timestamp, maxWeight, maxReps, estimated1RM)
  const strengthData = useMemo(() => {
    const cleanName = selectedExercise.toLowerCase().trim();
    const activeTf = TIMEFRAMES.find(t => t.id === timeframe) || TIMEFRAMES[1];
    const cutoffTime = Date.now() - (activeTf.days * 24 * 60 * 60 * 1000);

    const points = [];

    // Sort chronologically ascending
    const sortedWorkouts = [...workoutLogs]
      .filter(w => (Number(w.timestamp) || 0) >= cutoffTime)
      .sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));

    sortedWorkouts.forEach(w => {
      const exs = Array.isArray(w.exercises) ? w.exercises : [];
      let best1RM = 0;
      let bestWeight = 0;
      let bestReps = 0;

      exs.forEach(e => {
        const eName = (e.name || '').toLowerCase().trim();
        if (eName === cleanName || cleanName.includes(eName) || eName.includes(cleanName)) {
          const sets = Array.isArray(e.sets) ? e.sets : (Array.isArray(e.completedSets) ? e.completedSets : []);
          sets.forEach(s => {
            const wt = Number(s.weight || s.weightKg || 0);
            const rp = Number(s.reps || 0);
            if (wt > 0 && rp > 0) {
              const est = WorkoutEngine.calculateEstimated1RM(wt, rp);
              if (est > best1RM) {
                best1RM = est;
                bestWeight = wt;
                bestReps = rp;
              }
            }
          });
        }
      });

      if (best1RM > 0) {
        points.push({
          date: new Date(w.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          timestamp: w.timestamp,
          estimated1RM: best1RM,
          weight: bestWeight,
          reps: bestReps
        });
      }
    });

    return points;
  }, [workoutLogs, selectedExercise, timeframe]);

  // Progress metrics calculation
  const start1RM = strengthData.length > 0 ? strengthData[0].estimated1RM : 0;
  const current1RM = strengthData.length > 0 ? strengthData[strengthData.length - 1].estimated1RM : 0;
  const delta1RM = current1RM - start1RM;
  const pctChange = start1RM > 0 ? ((delta1RM / start1RM) * 100).toFixed(1) : '0.0';

  // SVG Chart points
  const chartWidth = 500;
  const chartHeight = 160;
  const minVal = strengthData.length > 1 ? Math.min(...strengthData.map(d => d.estimated1RM)) * 0.9 : 0;
  const maxVal = strengthData.length > 1 ? Math.max(...strengthData.map(d => d.estimated1RM)) * 1.1 : 100;
  const range = Math.max(10, maxVal - minVal);

  const svgPoints = strengthData.map((d, idx) => {
    const x = (idx / Math.max(1, strengthData.length - 1)) * (chartWidth - 40) + 20;
    const y = chartHeight - 25 - ((d.estimated1RM - minVal) / range) * (chartHeight - 50);
    return { x, y, ...d };
  });

  const pathD = svgPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  return (
    <div className="space-y-6">
      {/* Exercise Selector Chips */}
      <div className="space-y-2">
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground font-mono">
          Select Movement
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {availableExercises.map(exName => (
            <Chip
              key={exName}
              label={exName}
              selected={selectedExercise === exName}
              onClick={() => setSelectedExercise(exName)}
            />
          ))}
        </div>
      </div>

      {/* Timeframe Filter */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-tight">
          Estimated 1RM Strength Curve
        </h3>
        <div className="flex gap-1 bg-surface-elevated p-1 rounded-xl border border-card-border">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase transition-all border-none cursor-pointer ${
                timeframe === tf.id
                  ? 'bg-accent text-accent-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground bg-transparent'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Card className="p-3 text-center">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Estimated 1RM</span>
          <span className="text-xl sm:text-2xl font-black font-mono text-accent leading-none mt-1 block">
            {current1RM > 0 ? `${current1RM} kg` : '—'}
          </span>
        </Card>
        <Card className="p-3 text-center">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Baseline</span>
          <span className="text-xl sm:text-2xl font-black font-mono text-foreground leading-none mt-1 block">
            {start1RM > 0 ? `${start1RM} kg` : '—'}
          </span>
        </Card>
        <Card className="p-3 text-center">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Progress</span>
          <span className={`text-xl sm:text-2xl font-black font-mono leading-none mt-1 block ${
            Number(pctChange) >= 0 ? 'text-emerald-400' : 'text-destructive'
          }`}>
            {Number(pctChange) >= 0 ? `+${pctChange}%` : `${pctChange}%`}
          </span>
        </Card>
        <Card className="p-3 text-center">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Best Set</span>
          <span className="text-xs sm:text-sm font-bold font-mono text-foreground leading-none mt-2 block truncate">
            {strengthData.length > 0 ? `${strengthData[strengthData.length - 1].weight}kg × ${strengthData[strengthData.length - 1].reps}` : '—'}
          </span>
        </Card>
      </div>

      {/* Estimated 1RM Progression Chart */}
      <Card elevated={true} className="p-4 sm:p-5 space-y-3">
        {strengthData.length > 1 ? (
          <div>
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44 overflow-visible">
              {/* Subtle Grid Lines */}
              <line x1="20" y1="30" x2={chartWidth - 20} y2="30" stroke="currentColor" className="text-card-border/60" strokeDasharray="3 3" />
              <line x1="20" y1={chartHeight / 2} x2={chartWidth - 20} y2={chartHeight / 2} stroke="currentColor" className="text-card-border/60" strokeDasharray="3 3" />
              <line x1="20" y1={chartHeight - 30} x2={chartWidth - 20} y2={chartHeight - 30} stroke="currentColor" className="text-card-border/60" strokeDasharray="3 3" />

              {/* Curve Line */}
              <path d={pathD} fill="none" stroke="var(--accent, #CCFF00)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

              {/* Data Points */}
              {svgPoints.map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy={pt.y} r="4" fill="var(--accent, #CCFF00)" className="shadow-md" />
                  <text x={pt.x} y={chartHeight - 8} textAnchor="middle" fill="currentColor" className="text-[10px] text-muted-foreground font-mono">
                    {pt.date}
                  </text>
                  <text x={pt.x} y={pt.y - 10} textAnchor="middle" fill="currentColor" className="text-[11px] font-bold text-foreground font-mono">
                    {pt.estimated1RM}kg
                  </text>
                </g>
              ))}
            </svg>
            <p className="text-[10px] text-muted-foreground font-mono text-center mt-2">
              Based on verified repetition records using Epley & Brzycki strength equations
            </p>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground text-xs space-y-1">
            <Dumbbell className="w-6 h-6 mx-auto text-accent mb-2" />
            <p className="font-bold text-foreground">Not Enough Lift Records Yet</p>
            <p>Log at least two separate sessions of {selectedExercise} to render your strength curve.</p>
          </div>
        )}
      </Card>
    </div>
  );
}

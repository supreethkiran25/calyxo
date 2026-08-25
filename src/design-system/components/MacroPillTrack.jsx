import React from 'react';
import { motion } from 'framer-motion';

export default function MacroPillTrack({
  label = "Protein",
  consumed = 0,
  target = 150,
  unit = "g",
  color = "#16A34A",
  secondaryColor = "#059669",
  onPillClick = null
}) {
  const safeTarget = Math.max(target, 1);
  const percent = Math.min(Math.round((consumed / safeTarget) * 100), 100);
  const remaining = Math.max(0, target - consumed);

  return (
    <div 
      onClick={onPillClick}
      className={`p-3 rounded-2xl bg-surface border border-card-border hover:border-accent/40 transition-all flex flex-col justify-between space-y-2 shadow-xs ${onPillClick ? 'cursor-pointer hover:bg-surface-interactive active:scale-98' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-secondary">
            {label}
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold text-muted">
          {percent}%
        </span>
      </div>

      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-base font-black text-foreground">
            {consumed}
          </span>
          <span className="text-[10px] text-muted font-mono">
            / {target}{unit}
          </span>
        </div>
        <span className="text-[10px] font-medium text-secondary">
          {remaining > 0 ? `${remaining}${unit} left` : 'Goal reached'}
        </span>
      </div>

      {/* Slim Progress Track */}
      <div className="w-full h-1.5 rounded-full bg-surface-subtle border border-card-border/40 overflow-hidden relative">
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${secondaryColor})`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}

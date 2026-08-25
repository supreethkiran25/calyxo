import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, TrendingUp, Award, CheckCircle, Target, RefreshCw } from 'lucide-react';

export default function ProfileIdentityHero({
  name = "Athlete",
  email = "",
  photoURL = "",
  level = 1,
  xp = 0,
  xpToNext = 1000,
  healthScore = 88,
  streak = 1,
  badgesCount = 0,
  bmi = "22.4",
  goalLabel = "Hypertrophy",
  isVerified = true,
  onPhotoUpload = () => {},
  photoLoading = false
}) {
  const xpPercent = Math.min(Math.round((xp / Math.max(xpToNext, 1)) * 100), 100);

  const getInitials = (n) => {
    if (!n) return 'AT';
    return n.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="relative rounded-3xl bg-surface border border-card-border p-6 overflow-hidden shadow-card space-y-6">
      {/* Top Identity Block */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
        {/* Avatar with Circular XP Ring */}
        <div className="relative shrink-0">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-accent to-emerald-500 shadow-lg">
            <div className="w-full h-full rounded-full bg-surface overflow-hidden flex items-center justify-center relative border border-card-border">
              {photoLoading ? (
                <RefreshCw className="w-6 h-6 animate-spin text-accent" />
              ) : photoURL ? (
                <img src={photoURL} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-accent font-mono">
                  {getInitials(name)}
                </span>
              )}
              
              {/* Photo Edit Trigger */}
              <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change</span>
                <input type="file" accept="image/*" onChange={onPhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Level Badge Pill */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-accent text-accent-foreground font-black text-[10px] uppercase font-mono shadow-md">
            Lvl {level}
          </div>
        </div>

        {/* User Identity Details */}
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight truncate">
              {name}
            </h1>
            {isVerified && (
              <span className="inline-flex items-center gap-1 text-[10px] text-accent font-bold bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                <CheckCircle className="w-3 h-3" /> Verified Athlete
              </span>
            )}
          </div>
          <p className="text-xs text-secondary font-mono truncate">{email}</p>
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="text-[10px] font-mono text-secondary bg-surface-subtle px-2 py-0.5 rounded-md border border-card-border">
              BMI: <strong className="text-foreground">{bmi}</strong>
            </span>
            <span className="text-[10px] font-mono font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-md border border-accent/20 inline-flex items-center gap-1">
              <Target className="w-3 h-3" /> {goalLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Biometric Vitality Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
        {[
          { label: 'Health Score', value: `${healthScore}%`, icon: Activity, color: '#16A34A', bg: 'bg-emerald-500/10' },
          { label: 'Login Streak', value: `${streak}d`, icon: TrendingUp, color: '#0284C7', bg: 'bg-cyan-500/10' },
          { label: 'Level XP', value: `${xp}/${xpToNext}`, icon: Zap, color: 'var(--accent)', bg: 'bg-accent/10' },
          { label: 'Badges Won', value: badgesCount, icon: Award, color: '#D97706', bg: 'bg-amber-500/10' }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.label}
              className="p-3 rounded-2xl bg-surface-subtle border border-card-border/70 flex flex-col items-center justify-center text-center shadow-xs"
            >
              <div className={`w-7 h-7 rounded-xl ${item.bg} flex items-center justify-center mb-1.5`}>
                <Icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <span className="text-sm sm:text-base font-black text-foreground font-mono">
                {item.value}
              </span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-muted mt-0.5">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* XP Progression Bar */}
      <div className="space-y-1.5 border-t border-card-border/80 pt-4">
        <div className="flex justify-between text-[10px] font-mono font-bold text-secondary uppercase">
          <span>Level Progress</span>
          <span>{xpPercent}% to Level {level + 1}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-surface-subtle border border-card-border/50 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </div>
  );
}

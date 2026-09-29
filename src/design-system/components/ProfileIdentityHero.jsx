import React from 'react';
import { Camera, CheckCircle2, User } from 'lucide-react';

export default function ProfileIdentityHero({
  name = "Athlete",
  email = "",
  photoURL = "",
  bmi = "22.4",
  goalLabel = "Muscle Gain",
  isVerified = true,
  onPhotoUpload = () => {},
  photoLoading = false
}) {
  const getInitials = (n) => {
    if (!n) return 'CX';
    return n.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="rounded-3xl bg-surface border border-card-border p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
        {/* Apple Health Style Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full p-1 bg-surface-elevated border border-card-border shadow-inner">
            <div className="w-full h-full rounded-full bg-surface-interactive overflow-hidden flex items-center justify-center relative">
              {photoURL ? (
                <img src={photoURL} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl sm:text-2xl font-black text-accent font-mono">
                  {getInitials(name)}
                </span>
              )}

              {/* Photo Upload Overlay */}
              <label 
                title="Change Photo"
                className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white"
              >
                <Camera className="w-5 h-5" />
                <input type="file" accept="image/*" onChange={onPhotoUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Identity & Health Context */}
        <div className="space-y-2 min-w-0 flex-1">
          <div>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight truncate">
                {name}
              </h1>
              {isVerified && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">
                  <CheckCircle2 className="w-3 h-3" /> Calyxo Member
                </span>
              )}
            </div>
            {email && (
              <p className="text-xs text-muted font-mono truncate mt-0.5">{email}</p>
            )}
          </div>

          {/* Calm Vital Badges */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <span className="text-[11px] font-mono text-muted bg-surface-elevated px-3 py-1 rounded-xl border border-card-border/60">
              BMI: <strong className="text-foreground font-semibold">{bmi}</strong>
            </span>
            <span className="text-[11px] font-mono font-bold text-accent bg-accent/10 px-3 py-1 rounded-xl border border-accent/20">
              {goalLabel}
            </span>
            <span className="text-[11px] font-mono text-muted bg-surface-elevated px-3 py-1 rounded-xl border border-card-border/60">
              Health OS v2.0
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


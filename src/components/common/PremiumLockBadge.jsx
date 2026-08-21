import React from 'react';
import { Lock, Sparkles, Crown } from 'lucide-react';

export default function PremiumLockBadge({ 
  label = 'PREMIUM', 
  size = 'sm', 
  onClick = null,
  showCrown = false 
}) {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 font-black tracking-wider uppercase rounded-full transition-all ${
        size === 'xs'
          ? 'text-[9px] px-2 py-0.5'
          : 'text-[10px] px-2.5 py-1'
      } bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/10 text-amber-300 border border-amber-500/30 hover:border-amber-400 shadow-sm ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      }`}
    >
      {showCrown ? (
        <Crown className={size === 'xs' ? 'w-2.5 h-2.5 text-amber-400 fill-amber-400' : 'w-3 h-3 text-amber-400 fill-amber-400'} />
      ) : (
        <Lock className={size === 'xs' ? 'w-2.5 h-2.5 text-amber-400' : 'w-3 h-3 text-amber-400'} />
      )}
      <span>{label}</span>
    </span>
  );
}

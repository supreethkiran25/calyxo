"use client";

import React from 'react';
import { Users, ShieldCheck, Trophy, Target } from 'lucide-react';

export default function ClubHub({ currentUserId }) {
  return (
    <div className="h-full flex flex-col bg-background p-4 overflow-y-auto scrollbar-none pb-24">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight">Clubs</h1>
          <p className="text-xs text-muted font-medium mt-1">Find your tribe. Train together.</p>
        </div>
        <button className="btn-primary text-[10px] px-3 py-1.5">
          Create Club
        </button>
      </div>

      <div className="glass rounded-3xl border border-card-border p-8 text-center bg-gradient-to-br from-surface to-background mb-8">
        <div className="w-16 h-16 rounded-full bg-acid-green/10 flex items-center justify-center mx-auto mb-4 border border-acid-green/20">
          <Users className="w-8 h-8 text-acid-green" />
        </div>
        <h2 className="text-lg font-black text-foreground mb-2">Premium Clubs Architecture</h2>
        <p className="text-[11px] text-muted max-w-sm mx-auto leading-relaxed">
          Clubs are robust communities with dedicated feeds, verified badges, challenges, events, and leaderboards. (Coming in Phase 4 of the Social Update).
        </p>
      </div>

      <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-4 border-b border-card-border pb-2">Upcoming Features</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { icon: ShieldCheck, title: 'Verified Communities', desc: 'Official clubs run by certified trainers & dietitians.' },
          { icon: Trophy, title: 'Club Leaderboards', desc: 'Compete against other clubs for the top spot.' },
          { icon: Target, title: 'Group Challenges', desc: 'Pool your steps and workouts together.' }
        ].map((feat, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-2xl border border-card-border bg-surface/30">
            <div className="w-10 h-10 rounded-full bg-surface border border-card-border flex items-center justify-center shrink-0">
              <feat.icon className="w-4 h-4 text-foreground" />
            </div>
            <div>
              <span className="text-xs font-black block">{feat.title}</span>
              <span className="text-[9px] font-medium text-muted mt-1 block leading-relaxed">{feat.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

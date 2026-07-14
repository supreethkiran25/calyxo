"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Activity, MapPin, Link as LinkIcon, Users, Star, Award, TrendingUp, Hexagon, Shield, CheckCircle, Search } from 'lucide-react';
import { getSocialProfile } from '../lib/socialProfileService';
import { getFollowers, getFollowing } from '../lib/socialService';

// Gradient themes matching Apple Fitness / premium vibes
const bannerThemes = {
  'gradient-1': 'bg-gradient-to-r from-acid-green/40 via-surface to-background',
  'gradient-2': 'bg-gradient-to-tr from-purple-500/30 via-surface to-background',
  'gradient-3': 'bg-gradient-to-br from-blue-500/30 via-surface to-background',
  'dark-mesh': 'bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-surface/80 via-background to-background',
};

const badgeColors = {
  Novice: 'text-gray-400 border-gray-400/20 bg-gray-400/10',
  Contributor: 'text-blue-400 border-blue-400/20 bg-blue-400/10',
  Expert: 'text-purple-400 border-purple-400/20 bg-purple-400/10',
  Elite: 'text-acid-green border-acid-green/20 bg-acid-green/10',
  Legend: 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
};

export default function SocialProfileView({ targetUserId, currentUserId, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ followers: 0, following: 0 });

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!targetUserId) return;
      setLoading(true);
      try {
        const [profData, fList, followingList] = await Promise.all([
          getSocialProfile(targetUserId),
          getFollowers(targetUserId),
          getFollowing(targetUserId)
        ]);
        
        if (active) {
          setProfile(profData);
          setStats({
            followers: fList.length,
            following: followingList.length
          });
        }
      } catch (err) {
        console.error("Failed to load social profile view", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [targetUserId]);

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-background">
        <Activity className="w-8 h-8 text-acid-green animate-pulse mb-4" />
        <p className="text-xs font-black uppercase tracking-widest text-muted">Loading Profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 bg-background">
        <Search className="w-12 h-12 text-muted mb-4 opacity-50" />
        <h2 className="text-lg font-black text-foreground">Profile Not Found</h2>
        <p className="text-xs text-muted mt-2 text-center max-w-xs">This athlete might not have set up their social profile yet, or the account doesn&apos;t exist.</p>
        {onBack && (
          <button onClick={onBack} className="mt-6 btn-secondary text-xs px-6 py-2">Go Back</button>
        )}
      </div>
    );
  }

  const isOwner = targetUserId === currentUserId;
  const bannerClass = bannerThemes[profile.bannerTheme] || bannerThemes['gradient-1'];
  const rankStyle = badgeColors[profile.communityRank] || badgeColors['Novice'];

  return (
    <div className="h-full overflow-y-auto bg-background text-foreground pb-20 relative scrollbar-none">
      
      {/* ── BANNER AREA ── */}
      <div className={`relative h-48 w-full ${bannerClass}`}>
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-background/50 backdrop-blur-md border border-card-border/50 hover:bg-background/80 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        )}
        
        {isOwner && (
          <button className="absolute top-4 right-4 z-10 px-3 py-1.5 rounded-full bg-background/50 backdrop-blur-md border border-card-border/50 text-[10px] font-bold hover:bg-background/80 transition-colors">
            Edit Social
          </button>
        )}
      </div>

      {/* ── PROFILE HEADER INFO ── */}
      <div className="px-6 relative -mt-16 mb-8 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
          
          {/* Avatar with Reputation Ring */}
          <div className="relative group">
            <div className={`absolute -inset-1.5 rounded-full border border-dashed animate-[spin_10s_linear_infinite] ${rankStyle.replace('bg-', 'border-').replace('text-', 'border-')} opacity-50`}></div>
            <div className="w-32 h-32 rounded-full border-4 border-background overflow-hidden bg-surface relative z-10 flex items-center justify-center">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-muted uppercase">{(profile.displayName || "A").substring(0, 2)}</span>
              )}
            </div>
            
            {/* Level Badge Overlay */}
            <div className={`absolute -bottom-2 -right-2 z-20 px-2 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider backdrop-blur-md flex items-center gap-1 ${rankStyle}`}>
              <Shield className="w-3 h-3" />
              Lvl {profile.reputationLevel}
            </div>
          </div>

          <div className="flex-1 mt-4 sm:mt-0">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black">{profile.displayName}</h1>
              {profile.reputationScore > 1000 && <CheckCircle className="w-5 h-5 text-acid-green" />}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs font-bold text-muted">
              <span>@{profile.userId}</span>
              {profile.pronouns && <span>• {profile.pronouns}</span>}
            </div>

            {/* Bio & Details */}
            {profile.bio && (
              <p className="mt-3 text-[13px] text-foreground/90 font-medium max-w-xl leading-relaxed">
                {profile.bio}
              </p>
            )}

            <div className="flex flex-wrap gap-4 mt-4 text-[11px] font-bold text-muted">
              {profile.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.location}
                </div>
              )}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-acid-green hover:underline">
                  <LinkIcon className="w-3.5 h-3.5" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── STATS ROW ── */}
        <div className="flex gap-8 mt-8 pb-6 border-b border-card-border/50">
          <div className="flex flex-col">
            <span className="text-2xl font-black text-foreground">{stats.followers}</span>
            <span className="text-[9px] uppercase tracking-widest text-muted font-bold">Followers</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-foreground">{stats.following}</span>
            <span className="text-[9px] uppercase tracking-widest text-muted font-bold">Following</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black text-foreground">{profile.reputationScore.toLocaleString()}</span>
            <span className="text-[9px] uppercase tracking-widest text-acid-green font-bold flex items-center gap-1">
              Reputation <TrendingUp className="w-2.5 h-2.5" />
            </span>
          </div>
          {profile.joinedClubs?.length > 0 && (
            <div className="flex flex-col hidden sm:flex">
              <span className="text-2xl font-black text-foreground">{profile.joinedClubs.length}</span>
              <span className="text-[9px] uppercase tracking-widest text-muted font-bold">Clubs</span>
            </div>
          )}
        </div>

        {/* ── TABS (Static for phase 1) ── */}
        <div className="flex gap-6 mt-6">
          <button className="text-[11px] font-black uppercase tracking-widest text-acid-green border-b-2 border-acid-green pb-2">Overview</button>
          <button className="text-[11px] font-black uppercase tracking-widest text-muted hover:text-foreground pb-2 transition-colors">Timeline</button>
          <button className="text-[11px] font-black uppercase tracking-widest text-muted hover:text-foreground pb-2 transition-colors">Clubs</button>
        </div>

        {/* ── CONTENT AREA ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          
          {/* Left Column: Interests & Reputation Details */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Reputation Card */}
            <div className="glass rounded-2xl p-5 border border-card-border relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Hexagon className="w-24 h-24" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-4 flex items-center gap-2">
                <Star className="w-3.5 h-3.5" /> Reputation
              </h3>
              <div className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase border ${rankStyle} mb-2`}>
                {profile.communityRank}
              </div>
              <p className="text-[10px] text-muted font-medium mb-4">
                Level {profile.reputationLevel} • {profile.reputationScore} Total XP
              </p>
              
              {/* Progress bar to next rank (mock logic) */}
              <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-acid-green" style={{ width: `${(profile.reputationScore % 500) / 5}%` }}></div>
              </div>
              <p className="text-[8px] text-right mt-1.5 font-bold text-muted/70">Next rank at {(Math.floor(profile.reputationScore/500)+1)*500} RP</p>
            </div>

            {/* Interests & Sports */}
            {(profile.fitnessInterests?.length > 0 || profile.favoriteSports?.length > 0) && (
              <div className="glass rounded-2xl p-5 border border-card-border">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-4">Focus Areas</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.fitnessInterests?.map((interest, i) => (
                    <span key={`i-${i}`} className="px-2.5 py-1 rounded-md bg-surface border border-card-border text-[9px] font-bold text-foreground">
                      {interest}
                    </span>
                  ))}
                  {profile.favoriteSports?.map((sport, i) => (
                    <span key={`s-${i}`} className="px-2.5 py-1 rounded-md bg-acid-green/10 border border-acid-green/20 text-[9px] font-bold text-acid-green">
                      {sport}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Achievements & Timeline (Mocked for view) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Featured Showcase */}
            <div className="glass rounded-2xl p-5 border border-card-border bg-gradient-to-br from-surface to-background">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5" /> Featured Showcase
                </h3>
              </div>
              
              {profile.featuredAchievement ? (
                <div className="p-4 rounded-xl border border-acid-green/20 bg-acid-green/5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-acid-green/20 flex items-center justify-center shrink-0">
                    <Award className="w-6 h-6 text-acid-green" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground">{profile.featuredAchievement.title || "Elite Athlete"}</h4>
                    <p className="text-[10px] text-muted font-medium mt-0.5">{profile.featuredAchievement.description || "Achieved top 5% in community fitness."}</p>
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-card-border text-center">
                  <Award className="w-8 h-8 text-muted mx-auto mb-2 opacity-30" />
                  <p className="text-[10px] font-bold text-muted uppercase tracking-widest">No featured items yet</p>
                </div>
              )}
            </div>

            {/* Public Activity Timeline Placeholder */}
            <div className="glass rounded-2xl p-5 border border-card-border min-h-[300px]">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-4 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Public Timeline
              </h3>
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Activity locked</p>
                <p className="text-[10px] text-muted font-medium mt-1">This user&apos;s timeline is restricted or empty.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

import React, { memo } from 'react';
import { User, Award, CheckCircle, Shield } from 'lucide-react';

const ProfileHeader = memo(({ user, userProfile, ecoStore, onAvatarChange, photoLoading }) => {
  const level = ecoStore?.userLevel || 1;
  const xp = ecoStore?.userXP || 0;
  const rank = ecoStore?.userRankTitle || 'Rookie';

  return (
    <div className="bg-card-bg/60 border border-card-border rounded-3xl p-6 sm:p-8 backdrop-blur-xl mb-8 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
        <div className="relative group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-surface border-2 border-acid-green/40 flex items-center justify-center shadow-xl shadow-acid-green/10">
            {userProfile?.photoURL ? (
              <img src={userProfile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-muted" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 bg-acid-green text-black p-2 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-md">
            <span className="sr-only">Change Avatar</span>
            <input type="file" accept="image/*" onChange={onAvatarChange} className="hidden" disabled={photoLoading} />
            <Shield className="w-4 h-4" />
          </label>
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              {userProfile?.firstName || userProfile?.username || user?.displayName || 'Calyxo User'}
            </h2>
            <CheckCircle className="w-5 h-5 text-acid-green" />
          </div>
          <p className="text-xs text-muted font-medium mb-3">
            {user?.email || 'user@calyxo.app'}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-acid-green/10 text-acid-green text-xs font-bold border border-acid-green/20">
              <Award className="w-3.5 h-3.5" />
              Lvl {level} · {rank}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface text-muted text-xs font-bold border border-card-border">
              {xp} XP Earned
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProfileHeader;

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import useSocial from '../hooks/useSocial';
import { getMutualFriends, canViewProfileSection, getFollowers, getFollowing } from '../lib/socialService';
import { getWorkoutLogs, getFoodLogs } from '../lib/dbService';
import {
  Search, User, Users, UserPlus, UserMinus, UserCheck, ShieldAlert,
  Sparkles, Globe, Lock, Link, Activity, Heart, CheckCircle,
  AlertCircle, X, Shield, BookOpen, BarChart2
} from 'lucide-react';

export default function SocialHub({ onNotification }) {
  const user = useStore(state => state.user);
  const currentUserId = user?.uid;

  const {
    followers,
    following,
    pendingRequests,
    blockedUsers,
    searchResults,
    loading,
    error,
    clearError,
    refreshSocial,
    followUser,
    unfollowUser,
    acceptFollow,
    rejectFollow,
    removeFollower,
    blockUser,
    unblockUser,
    searchUsers,
    checkViewPermission
  } = useSocial();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'friends' | 'requests'
  const [selectedUser, setSelectedUser] = useState(null); // Selected Social Profile
  const [selectedUserFollowers, setSelectedUserFollowers] = useState([]);
  const [selectedUserFollowing, setSelectedUserFollowing] = useState([]);
  const [mutualFriends, setMutualFriends] = useState([]);
  const [viewPermissions, setViewPermissions] = useState({ profile: false, workouts: false, nutrition: false });
  const [selectedUserWorkouts, setSelectedUserWorkouts] = useState([]);
  const [selectedUserFoodLogs, setSelectedUserFoodLogs] = useState([]);
  const [loadingProfileDetails, setLoadingProfileDetails] = useState(false);

  // Trigger search on query change
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchUsers]);

  // Load details when selectedUser changes
  useEffect(() => {
    if (!selectedUser || !currentUserId) return;

    const loadProfileDetails = async () => {
      setLoadingProfileDetails(true);
      try {
        const targetId = selectedUser.userId || selectedUser.uid;
        
        // 1. Check permissions
        const canViewProfile = await canViewProfileSection(currentUserId, targetId, 'profile');
        const canViewWorkouts = await canViewProfileSection(currentUserId, targetId, 'workouts');
        const canViewNutrition = await canViewProfileSection(currentUserId, targetId, 'nutrition');
        
        const perms = { profile: canViewProfile, workouts: canViewWorkouts, nutrition: canViewNutrition };
        setViewPermissions(perms);

        // 2. Fetch mutual friends
        const mutuals = await getMutualFriends(currentUserId, targetId);
        setMutualFriends(mutuals);

        // 3. Fetch followers/following list of target user
        const targetFollowers = await getFollowers(targetId);
        const targetFollowing = await getFollowing(targetId);
        setSelectedUserFollowers(targetFollowers);
        setSelectedUserFollowing(targetFollowing);

        // 4. Fetch fitness logs if permitted
        if (canViewWorkouts) {
          const workouts = await getWorkoutLogs(targetId);
          setSelectedUserWorkouts(workouts || []);
        } else {
          setSelectedUserWorkouts([]);
        }

        if (canViewNutrition) {
          const food = await getFoodLogs(targetId);
          setSelectedUserFoodLogs(food || []);
        } else {
          setSelectedUserFoodLogs([]);
        }

      } catch (err) {
        console.error("Error loading selected profile details", err);
        if (onNotification) onNotification("Failed to load profile details.");
      } finally {
        setLoadingProfileDetails(false);
      }
    };

    loadProfileDetails();
  }, [selectedUser, currentUserId, onNotification]);

  const handleFollowToggle = async (targetUser) => {
    const targetId = targetUser.userId || targetUser.uid;
    const isFollowing = following.some(x => x.userId === targetId);
    const isPending = pendingRequests.some(x => x.userId === targetId);

    try {
      if (isFollowing) {
        if (window.confirm(`Unfollow @${targetUser.username || targetUser.nickname}?`)) {
          await unfollowUser(targetId);
          if (onNotification) onNotification(`Unfollowed @${targetUser.username || targetUser.nickname}`);
        }
      } else {
        const follow = await followUser(targetId);
        if (onNotification) {
          onNotification(
            follow.status === 'pending'
              ? `Follow request sent to @${targetUser.username || targetUser.nickname} ✉️`
              : `Following @${targetUser.username || targetUser.nickname}! 🤝`
          );
        }
      }
      
      // Update local detailed view follows lists if viewing them
      if (selectedUser && (selectedUser.userId === targetId || selectedUser.uid === targetId)) {
        const targetFollowers = await getFollowers(targetId);
        setSelectedUserFollowers(targetFollowers);
      }
    } catch (err) {
      if (onNotification) onNotification(err.message || "Failed to update connection status.");
    }
  };

  const handleBlockUser = async (targetUser) => {
    const targetId = targetUser.userId || targetUser.uid;
    if (window.confirm(`WARNING: Block @${targetUser.username || targetUser.nickname}? All follows will be permanently severed.`)) {
      try {
        await blockUser(targetId);
        setSelectedUser(null);
        if (onNotification) onNotification(`Blocked @${targetUser.username || targetUser.nickname}`);
      } catch (err) {
        if (onNotification) onNotification(err.message || "Failed to block user.");
      }
    }
  };

  const handleUnblockUser = async (targetId, username) => {
    try {
      await unblockUser(targetId);
      if (onNotification) onNotification(`Unblocked @${username}`);
    } catch (err) {
      if (onNotification) onNotification(err.message || "Failed to unblock user.");
    }
  };

  const handleAcceptRequest = async (requester) => {
    try {
      await acceptFollow(requester.userId);
      if (onNotification) onNotification(`Accepted follow request from @${requester.username || requester.nickname}! 🎉`);
    } catch (err) {
      if (onNotification) onNotification(err.message || "Failed to accept follow request.");
    }
  };

  const handleRejectRequest = async (requester) => {
    try {
      await rejectFollow(requester.userId);
      if (onNotification) onNotification(`Rejected follow request from @${requester.username || requester.nickname}`);
    } catch (err) {
      if (onNotification) onNotification(err.message || "Failed to reject follow request.");
    }
  };

  const renderProfileDetail = () => {
    if (!selectedUser) return null;
    const isFollowing = following.some(x => x.userId === (selectedUser.userId || selectedUser.uid));
    const hasRequested = pendingRequests.some(x => x.userId === (selectedUser.userId || selectedUser.uid));
    const isBlockedState = blockedUsers.some(x => x.blockedId === (selectedUser.userId || selectedUser.uid));

    return (
      <div className="glass rounded-2xl border border-card-border overflow-hidden flex flex-col h-full bg-surface/10 relative">
        {/* Cover Image Banner */}
        <div className="h-28 w-full bg-gradient-to-r from-acid-green/20 to-blue-500/20 relative shrink-0">
          {selectedUser.coverImage ? (
            <img src={selectedUser.coverImage} alt="Cover Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-surface border-b border-card-border flex items-center justify-center text-muted text-[10px] font-bold uppercase tracking-wider">
              Athlete Profile Cover
            </div>
          )}
          <button 
            onClick={() => setSelectedUser(null)}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center border-none text-white cursor-pointer hover:bg-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable details content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Main info header */}
          <div className="flex justify-between items-start gap-4">
            <div className="flex gap-3 -mt-12 items-end">
              <div className="w-16 h-16 rounded-full border-4 border-[var(--background)] overflow-hidden shrink-0 bg-surface">
                {selectedUser.photoURL ? (
                  <img src={selectedUser.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-acid-green/10 text-acid-green">
                    <User className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-foreground">{selectedUser.nickname || selectedUser.firstName || "Athlete"}</h3>
                  {selectedUser.verified && (
                    <CheckCircle className="w-3.5 h-3.5 text-acid-green fill-acid-green/10" title="Verified Athlete" />
                  )}
                </div>
                <span className="text-[10px] text-muted font-bold uppercase tracking-wider">@{selectedUser.username || "athlete"}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleFollowToggle(selectedUser)}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                  isFollowing
                    ? 'border-card-border bg-surface text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30'
                    : hasRequested
                    ? 'border-card-border bg-surface/30 text-muted cursor-default'
                    : 'btn-primary'
                }`}
              >
                {isFollowing ? 'Unfollow' : hasRequested ? 'Requested' : 'Follow'}
              </button>
              <button
                onClick={() => handleBlockUser(selectedUser)}
                className="p-1.5 rounded-lg border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer"
                title="Block User"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Social Stats */}
          <div className="grid grid-cols-3 gap-2.5 bg-surface/20 border border-card-border rounded-xl p-3 text-center">
            <div>
              <span className="text-xs font-black text-foreground block">{selectedUserFollowers.length}</span>
              <span className="text-[8px] text-muted font-bold uppercase tracking-wider block mt-0.5">Followers</span>
            </div>
            <div>
              <span className="text-xs font-black text-foreground block">{selectedUserFollowing.length}</span>
              <span className="text-[8px] text-muted font-bold uppercase tracking-wider block mt-0.5">Following</span>
            </div>
            <div>
              <span className="text-xs font-black text-foreground block">{mutualFriends.length}</span>
              <span className="text-[8px] text-muted font-bold uppercase tracking-wider block mt-0.5">Mutual</span>
            </div>
          </div>

          {/* Bio & website */}
          <div className="space-y-2">
            <p className="text-xs text-foreground/80 font-medium leading-relaxed italic">{selectedUser.bio || "No bio description written."}</p>
            {selectedUser.website && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-acid-green">
                <Link className="w-3.5 h-3.5" />
                <a href={selectedUser.website} target="_blank" rel="noopener noreferrer" className="hover:underline break-all">{selectedUser.website}</a>
              </div>
            )}
            {selectedUser.fitnessLevel && (
              <span className="inline-flex items-center gap-1 bg-acid-green/10 border border-acid-green/20 px-2 py-0.5 rounded text-[9px] font-extrabold text-acid-green uppercase tracking-wider">
                Level: {selectedUser.fitnessLevel}
              </span>
            )}
          </div>

          {/* Health Interests */}
          {selectedUser.healthInterests?.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Health & Fitness Interests</span>
              <div className="flex flex-wrap gap-1">
                {selectedUser.healthInterests.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded bg-surface/50 border border-card-border text-[8.5px] font-bold text-foreground">{tag}</span>
                ))}
              </div>
            </div>
          )}

          {/* Mutual Friends Row */}
          {mutualFriends.length > 0 && (
            <div className="space-y-2 border-t border-card-border/40 pt-4">
              <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Mutual Connections</span>
              <div className="flex items-center -space-x-2 overflow-hidden">
                {mutualFriends.slice(0, 5).map(f => (
                  <div key={f.userId} className="w-7 h-7 rounded-full border-2 border-[var(--background)] overflow-hidden bg-surface" title={`@${f.username}`}>
                    {f.photoURL ? (
                      <img src={f.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface border border-card-border text-muted text-[8px] font-bold">
                        U
                      </div>
                    )}
                  </div>
                ))}
                {mutualFriends.length > 5 && (
                  <span className="text-[9px] text-muted font-bold pl-3">+{mutualFriends.length - 5} more</span>
                )}
              </div>
            </div>
          )}

          {/* Apple Health-style activity grid (enforced by privacy rules) */}
          <div className="space-y-4 border-t border-card-border/40 pt-4">
            <span className="text-[9px] text-muted font-bold uppercase tracking-wider block">Fitness Activity Metrics</span>
            
            {loadingProfileDetails ? (
              <div className="text-center py-4 text-xs text-muted">Loading metrics...</div>
            ) : !viewPermissions.profile ? (
              <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-card-border rounded-xl bg-surface/10">
                <Lock className="w-6 h-6 text-muted mb-2 opacity-50" />
                <span className="text-[10px] font-black text-foreground uppercase tracking-wider">Profile is Private</span>
                <p className="text-[9px] text-muted font-medium mt-1">Send a follow request to view this athlete&apos;s fitness activity logs.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Workouts Card */}
                <div className="bg-surface/30 border border-card-border p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black text-muted uppercase tracking-wider">
                    <span>Active Workouts</span>
                    <BarChart2 className="w-3.5 h-3.5 text-acid-green" />
                  </div>
                  {viewPermissions.workouts ? (
                    <div className="space-y-1.5">
                      <span className="text-lg font-black text-foreground block">{selectedUserWorkouts.length} Logs</span>
                      {selectedUserWorkouts.length > 0 ? (
                        <div className="text-[9px] text-muted font-semibold truncate">
                          Last: <strong className="text-foreground">{selectedUserWorkouts[0].name}</strong>
                        </div>
                      ) : (
                        <span className="text-[9px] text-muted block">No logged workouts.</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-1.5 items-center text-[10px] text-muted font-semibold">
                      <Lock className="w-3 h-3 shrink-0" />
                      <span>Workouts Restricted</span>
                    </div>
                  )}
                </div>

                {/* Nutrition Card */}
                <div className="bg-surface/30 border border-card-border p-3.5 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black text-muted uppercase tracking-wider">
                    <span>Calorie Logs</span>
                    <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  {viewPermissions.nutrition ? (
                    <div className="space-y-1.5">
                      <span className="text-lg font-black text-foreground block">{selectedUserFoodLogs.length} Meals</span>
                      {selectedUserFoodLogs.length > 0 ? (
                        <div className="text-[9px] text-muted font-semibold truncate">
                          Last: <strong className="text-foreground">{selectedUserFoodLogs[0].name}</strong> ({selectedUserFoodLogs[0].calories} kcal)
                        </div>
                      ) : (
                        <span className="text-[9px] text-muted block">No logged foods.</span>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-1.5 items-center text-[10px] text-muted font-semibold">
                      <Lock className="w-3 h-3 shrink-0" />
                      <span>Nutrition Restricted</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-full min-h-0 select-none">
      
      {/* ── Left Column: Discovery & Search ── */}
      <div className="lg:col-span-2 space-y-5 h-full flex flex-col min-h-0">
        <div>
          <h2 className="text-sm font-black text-foreground uppercase tracking-widest mb-1">Calyxo Social Hub</h2>
          <p className="text-[10px] text-muted font-medium">Discover other athletes, review requests, and inspect fitness statistics</p>
        </div>

        {/* Tab Selection */}
        <div className="bg-surface border border-card-border p-0.5 rounded-xl flex gap-1 self-start shrink-0">
          {[
            { id: 'explore', label: 'Explore Community', icon: Globe },
            { id: 'friends', label: 'My Friends', icon: Users },
            { id: 'requests', label: `Requests (${pendingRequests.length})`, icon: UserPlus }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-acid-green text-accent-foreground shadow-sm'
                    : 'text-muted hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="flex-1 min-h-0 bg-surface/5 border border-card-border rounded-2xl p-4 flex flex-col space-y-4">
          
          {activeTab === 'explore' && (
            <>
              {/* Search Bar */}
              <div className="relative shrink-0">
                <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by nickname or @username prefix..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--input)] border border-card-border rounded-xl pl-10 pr-4 py-3 text-xs text-foreground focus:outline-none focus:border-acid-green"
                />
              </div>

              {/* Live search results or recommended feed */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {loading && <div className="text-center py-6 text-xs text-muted">Searching users...</div>}
                
                {!loading && searchResults.length === 0 && searchQuery && (
                  <div className="text-center py-10 bg-surface/10 border border-dashed border-card-border rounded-xl">
                    <AlertCircle className="w-6 h-6 text-muted mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted font-bold">No athletes found matching &quot;{searchQuery}&quot;</p>
                  </div>
                )}

                {!loading && searchResults.length === 0 && !searchQuery && (
                  <div className="text-center py-10 text-muted text-xs font-bold uppercase tracking-wider">
                    Type a query above to explore other members
                  </div>
                )}

                {!loading && searchResults.map((u) => {
                  const isFollowing = following.some(x => x.userId === u.userId);
                  const hasRequested = pendingRequests.some(x => x.userId === u.userId);
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={u.userId}
                      onClick={() => setSelectedUser(u)}
                      className={`flex justify-between items-center p-3.5 rounded-xl border border-card-border glass hover:border-acid-green/30 transition-all cursor-pointer ${
                        selectedUser?.userId === u.userId ? 'ring-1 ring-acid-green/40 bg-acid-green/5' : ''
                      }`}
                    >
                      <div className="flex gap-3 items-center min-w-0">
                        <div className="w-10 h-10 rounded-full border border-card-border overflow-hidden shrink-0 bg-surface">
                          {u.photoURL ? (
                            <img src={u.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-acid-green/5 text-acid-green text-xs font-bold">
                              {u.nickname?.substring(0, 2).toUpperCase() || "AT"}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-foreground block truncate">{u.nickname || "Athlete"}</span>
                          <span className="text-[9px] text-muted font-bold block mt-0.5">@{u.username || "athlete"}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleFollowToggle(u); }}
                        className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase border transition-all cursor-pointer ${
                          isFollowing
                            ? 'border-card-border bg-surface text-foreground hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20'
                            : hasRequested
                            ? 'border-card-border bg-surface/30 text-muted'
                            : 'btn-primary'
                        }`}
                      >
                        {isFollowing ? 'Unfollow' : hasRequested ? 'Requested' : 'Follow'}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}

          {activeTab === 'friends' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {/* Followers List */}
              <div className="space-y-2">
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest block border-b border-card-border/50 pb-1.5">My Followers ({followers.length})</span>
                {followers.length === 0 ? (
                  <p className="text-[10px] text-muted italic font-medium p-1">No followers yet. Get active in the community!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {followers.map(f => (
                      <div 
                        key={f.userId} 
                        onClick={() => setSelectedUser(f)}
                        className="flex justify-between items-center p-3 rounded-xl border border-card-border bg-surface/30 hover:border-acid-green/30 transition-all cursor-pointer"
                      >
                        <div className="flex gap-2.5 items-center min-w-0">
                          <div className="w-8 h-8 rounded-full border border-card-border overflow-hidden bg-surface shrink-0">
                            {f.photoURL ? <img src={f.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-surface" />}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-foreground block truncate">{f.nickname || f.firstName}</span>
                            <span className="text-[8.5px] text-muted font-bold block">@{f.username || "athlete"}</span>
                          </div>
                        </div>
                        <button
                          onClick={async (e) => { e.stopPropagation(); if (window.confirm("Remove this follower?")) await removeFollower(f.userId); }}
                          className="py-1 px-2.5 rounded text-[8.5px] font-bold border border-card-border bg-surface hover:text-destructive hover:border-destructive/20 transition-all cursor-pointer shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Following List */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-black text-foreground uppercase tracking-widest block border-b border-card-border/50 pb-1.5">Following ({following.length})</span>
                {following.length === 0 ? (
                  <p className="text-[10px] text-muted italic font-medium p-1">You aren&apos;t following anyone yet. Search explore tab!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {following.map(f => (
                      <div 
                        key={f.userId} 
                        onClick={() => setSelectedUser(f)}
                        className="flex justify-between items-center p-3 rounded-xl border border-card-border bg-surface/30 hover:border-acid-green/30 transition-all cursor-pointer"
                      >
                        <div className="flex gap-2.5 items-center min-w-0">
                          <div className="w-8 h-8 rounded-full border border-card-border overflow-hidden bg-surface shrink-0">
                            {f.photoURL ? <img src={f.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-surface" />}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-foreground block truncate">{f.nickname || f.firstName}</span>
                            <span className="text-[8.5px] text-muted font-bold block">@{f.username || "athlete"}</span>
                          </div>
                        </div>
                        <button
                          onClick={async (e) => { e.stopPropagation(); handleFollowToggle(f); }}
                          className="py-1 px-2.5 rounded text-[8.5px] font-bold border border-card-border bg-surface hover:text-destructive hover:border-destructive/20 transition-all cursor-pointer shrink-0"
                        >
                          Unfollow
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Blocked List */}
              {blockedUsers.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-card-border/40">
                  <span className="text-[10px] font-black text-destructive uppercase tracking-widest block pb-1">Restricted Block List ({blockedUsers.length})</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {blockedUsers.map(b => (
                      <div key={b.blockedId} className="flex justify-between items-center p-2.5 rounded-lg border border-card-border bg-surface/10">
                        <span className="text-xs font-semibold text-foreground">Block ID: {b.blockedId.substring(0, 8)}...</span>
                        <button
                          onClick={() => handleUnblockUser(b.blockedId, "Athlete")}
                          className="py-1 px-2.5 rounded text-[8px] font-extrabold uppercase border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors cursor-pointer"
                        >
                          Unblock
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-10 bg-surface/10 border border-dashed border-card-border rounded-xl">
                  <CheckCircle className="w-6 h-6 text-acid-green mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-muted font-bold uppercase tracking-wider">Inbox is clean</p>
                  <p className="text-[9px] text-muted font-medium mt-1">No incoming pending follow requests at the moment.</p>
                </div>
              ) : (
                pendingRequests.map(r => (
                  <div key={r.userId} className="flex justify-between items-center p-3.5 rounded-xl border border-card-border bg-surface/30">
                    <div className="flex gap-2.5 items-center min-w-0">
                      <div className="w-9 h-9 rounded-full border border-card-border overflow-hidden bg-surface shrink-0">
                        {r.photoURL ? <img src={r.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-surface" />}
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-foreground block truncate">{r.nickname || r.firstName}</span>
                        <span className="text-[8.5px] text-muted font-bold block">@{r.username || "athlete"}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        onClick={() => handleAcceptRequest(r)}
                        className="py-1 px-3 rounded text-[9px] font-extrabold uppercase bg-acid-green text-accent-foreground border-none cursor-pointer hover:shadow-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectRequest(r)}
                        className="py-1 px-3 rounded text-[9px] font-extrabold uppercase border border-card-border bg-surface text-foreground hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 cursor-pointer"
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>
      </div>

      {/* ── Right Column: Selected Social Profile detail view ── */}
      <div className="h-full flex flex-col min-h-0">
        <AnimatePresence mode="wait">
          {selectedUser ? (
            <motion.div
              key={selectedUser.userId || selectedUser.uid}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="h-full min-h-0"
            >
              {renderProfileDetail()}
            </motion.div>
          ) : (
            <div className="glass rounded-2xl border border-card-border p-6 flex flex-col items-center justify-center text-center h-full bg-surface/10">
              <User className="w-8 h-8 text-muted mb-3 opacity-40 animate-pulse" />
              <span className="text-xs font-black text-foreground uppercase tracking-widest">No Profile Selected</span>
              <p className="text-[10px] text-muted font-medium mt-1.5 max-w-[200px]">Click on any member in search results or your friend list to view their detailed social page.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

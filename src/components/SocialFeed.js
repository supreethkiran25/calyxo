"use client";

import React, { useEffect, useCallback, useState } from 'react';
import { Activity, Dumbbell, BookOpen, Trophy, Award, BarChart2, Zap, Heart, CheckCircle, Search } from 'lucide-react';
import MediaCarousel from './MediaCarousel';
import { fetchActivityFeed, rankFeedWithAI, addReaction, addComment } from '../lib/socialService';

export default function SocialFeed({ currentUserId, following, setSelectedUser }) {
  const [feedItems, setFeedItems] = useState([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedLastDoc, setFeedLastDoc] = useState(null);
  const [hasMoreFeed, setHasMoreFeed] = useState(true);

  const loadFeed = useCallback(async (isRefresh = false) => {
    if (!currentUserId) return;
    setFeedLoading(true);
    const currentLastDoc = isRefresh ? null : feedLastDoc;
    const followingIds = following.map(x => x.userId);
    try {
      const { items, lastDoc: nextLastDoc } = await fetchActivityFeed(currentUserId, followingIds, 10, currentLastDoc);
      
      let rankedItems = items;
      if (isRefresh && items.length > 0) {
        rankedItems = await rankFeedWithAI(currentUserId, items);
      }

      if (isRefresh) {
        setFeedItems(rankedItems);
      } else {
        setFeedItems(prev => {
          const existingIds = new Set(prev.map(x => x.id));
          const filtered = rankedItems.filter(x => !existingIds.has(x.id));
          return [...prev, ...filtered];
        });
      }
      setFeedLastDoc(nextLastDoc);
      setHasMoreFeed(items.length === 10);
    } catch (err) {
      console.error("Error loading activity feed", err);
    } finally {
      setFeedLoading(false);
    }
  }, [currentUserId, following, feedLastDoc]);

  useEffect(() => {
    loadFeed(true);
  }, [currentUserId, following, loadFeed]);

  const handleFeedScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 30 && !feedLoading && hasMoreFeed) {
      loadFeed();
    }
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-none bg-background md:bg-surface/5" onScroll={handleFeedScroll}>
      {feedItems.length === 0 && !feedLoading ? (
        <div className="text-center py-16 bg-surface/10 border border-dashed border-card-border rounded-xl max-w-[600px] mx-auto mt-8">
          <Activity className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
          <p className="text-xs text-muted font-bold">No activity in your circle yet.</p>
          <p className="text-[10px] text-muted/80 mt-1">Log workouts, meals, or find friends to see updates!</p>
        </div>
      ) : (
        <div className="max-w-[600px] mx-auto space-y-6 md:space-y-8 pb-32 md:py-8">
          {feedItems.map(item => {
            let Icon = Activity;
            let colorClass = 'text-acid-green';
            let bgGradient = 'bg-acid-green/5 border-acid-green/20';
            
            if (item.type === 'workout') { Icon = Dumbbell; }
            else if (item.type === 'meal') { Icon = BookOpen; colorClass = 'text-amber-500'; bgGradient = 'bg-amber-500/5 border-amber-500/20'; }
            else if (item.type === 'achievement') { Icon = Trophy; colorClass = 'text-yellow-400'; bgGradient = 'bg-yellow-400/5 border-yellow-400/20'; }

            return (
              <div 
                key={item.id} 
                onClick={() => setSelectedUser && setSelectedUser({ userId: item.userId, nickname: item.nickname, username: item.username, photoURL: item.photoURL })}
                className="flex flex-col bg-card border-y md:border border-card-border md:rounded-2xl overflow-hidden shadow-sm"
              >
                {/* Post Header */}
                <div className="flex justify-between items-center p-3 md:p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border border-card-border overflow-hidden shrink-0 bg-surface">
                      {item.photoURL ? (
                        <img src={item.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-acid-green/10 text-acid-green text-xs font-black uppercase">
                          {(item.nickname || "AT").substring(0, 2)}
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-extrabold text-foreground block leading-tight">{item.nickname}</span>
                      <span className="text-[10px] text-muted font-medium block">@{item.username}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted font-bold uppercase tracking-wider">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                {/* Media Area (Full bleed on mobile) */}
                {item.mediaUrls && item.mediaUrls.length > 0 && (
                  <div className="w-full bg-black aspect-[4/5] sm:aspect-square flex items-center justify-center border-y md:border-none border-card-border/50">
                    <MediaCarousel mediaUrls={item.mediaUrls} />
                  </div>
                )}

                {/* Post Body */}
                <div className="p-3 md:p-4 flex flex-col gap-3">
                  
                  {/* Title & Activity Icon */}
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-surface border border-card-border shrink-0">
                      <Icon className={`w-4 h-4 ${colorClass}`} />
                    </div>
                    <span className="text-sm font-black text-foreground leading-tight">{item.title}</span>
                  </div>

                  {/* Content */}
                  {item.content && (
                    <p className="text-sm text-foreground/90 font-medium leading-relaxed">{item.content}</p>
                  )}

                  {/* Data Tags */}
                  {item.type === 'workout' && item.data && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {item.data.weight > 0 && <span className="px-2 py-1 rounded-md bg-surface/80 border border-card-border text-[10px] font-extrabold text-foreground">{item.data.weight} kg</span>}
                      {item.data.sets > 0 && <span className="px-2 py-1 rounded-md bg-surface/80 border border-card-border text-[10px] font-extrabold text-foreground">{item.data.sets} sets x {item.data.reps} reps</span>}
                      {item.data.duration > 0 && <span className="px-2 py-1 rounded-md bg-surface/80 border border-card-border text-[10px] font-extrabold text-foreground">{item.data.duration} mins</span>}
                    </div>
                  )}

                  {/* Reactions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-card-border/40 overflow-x-auto scrollbar-none pb-1">
                    {[
                      { icon: '👏', label: 'Great Job' },
                      { icon: '🔥', label: 'Crushing It' },
                      { icon: '💪', label: 'Strong' },
                      { icon: '❤️', label: 'Keep Going' },
                      { icon: '🥗', label: 'Healthy' }
                    ].map((reaction, i) => {
                      const count = item.reactions?.[reaction.icon]?.length || 0;
                      const hasReacted = item.reactions?.[reaction.icon]?.includes(currentUserId);
                      return (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            addReaction(currentUserId, item.id, reaction.icon);
                            setFeedItems(prev => prev.map(p => p.id === item.id ? {
                              ...p, reactions: { ...p.reactions, [reaction.icon]: [...(p.reactions?.[reaction.icon] || []), currentUserId] }
                            } : p));
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors shrink-0 ${
                            hasReacted ? 'bg-acid-green/10 border-acid-green/30 text-acid-green' : 'bg-surface border-card-border text-muted hover:border-acid-green/30 hover:text-foreground'
                          }`}
                        >
                          <span>{reaction.icon}</span>
                          {count > 0 && <span>{count}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Comments Section */}
                  <div className="pt-2">
                    {(item.comments || []).length > 0 && (
                      <div className="space-y-1.5 mb-3">
                        {item.comments.slice(0, 3).map((comment) => (
                          <div key={comment.id} className="flex gap-2 items-start">
                            <span className="text-xs font-bold text-foreground">@{comment.username}</span>
                            <span className="text-xs text-muted font-medium leading-tight">{comment.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <input 
                      type="text"
                      placeholder="Add a comment..."
                      className="w-full bg-transparent border-b border-card-border/50 py-2 text-xs text-foreground focus:outline-none focus:border-acid-green/50 transition-colors rounded-none placeholder:text-muted/50"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          e.stopPropagation();
                          const text = e.target.value.trim();
                          e.target.value = '';
                          const newComment = await addComment(currentUserId, item.id, text);
                          if (newComment) {
                            setFeedItems(prev => prev.map(p => p.id === item.id ? { ...p, comments: [...(p.comments || []), newComment] } : p));
                          }
                        }
                      }}
                    />
                  </div>

                </div>
              </div>
            );
          })}
          {feedLoading && <div className="text-center py-6"><Activity className="w-6 h-6 text-acid-green mx-auto animate-pulse" /></div>}
        </div>
      )}
    </div>
  );
}

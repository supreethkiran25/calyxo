"use client";

import React, { useState } from 'react';
import { Search, Compass, Users, Sparkles } from 'lucide-react';
import useSocial from '../hooks/useSocial';

export default function SocialExplore({ currentUserId, setSelectedUser }) {
  const { searchUsersAction, searchResults, loading } = useSocial();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    const val = e.target.value;
    setQuery(val);
    searchUsersAction(val);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b border-card-border glass sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted" />
          <input 
            type="text" 
            placeholder="Search athletes, clubs, trainers..." 
            value={query}
            onChange={handleSearch}
            className="w-full bg-surface border border-card-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-acid-green transition-colors"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24 scrollbar-none">
        
        {query && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted">Search Results</h3>
            {loading ? (
              <div className="text-center py-4 text-xs text-muted">Searching...</div>
            ) : searchResults.length > 0 ? (
              searchResults.map(u => (
                <div 
                  key={u.userId}
                  onClick={() => setSelectedUser && setSelectedUser(u)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-card-border bg-surface/30 cursor-pointer hover:border-acid-green/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-surface border border-card-border overflow-hidden shrink-0">
                    {u.photoURL ? <img src={u.photoURL} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center bg-acid-green/10 text-acid-green text-xs font-bold">{u.nickname?.[0] || 'A'}</div>}
                  </div>
                  <div>
                    <span className="text-sm font-bold block text-foreground">{u.nickname || 'Athlete'}</span>
                    <span className="text-[10px] font-medium text-muted">@{u.username}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-xs font-bold text-muted">No results found for &quot;{query}&quot;</div>
            )}
          </div>
        )}

        {!query && (
          <>
            {/* Trending Categories */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl glass border border-card-border hover:border-acid-green/30 cursor-pointer transition-colors group">
                <Compass className="w-5 h-5 text-acid-green mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black block">Trending Clubs</span>
                <span className="text-[9px] text-muted font-medium">Join active communities</span>
              </div>
              <div className="p-4 rounded-2xl glass border border-card-border hover:border-acid-green/30 cursor-pointer transition-colors group">
                <Sparkles className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-black block">AI Matches</span>
                <span className="text-[9px] text-muted font-medium">Athletes like you</span>
              </div>
            </div>

            {/* Placeholder for future Explore content */}
            <div className="glass rounded-2xl p-6 border border-card-border text-center mt-6">
              <Users className="w-8 h-8 text-muted mx-auto mb-3 opacity-30" />
              <h3 className="text-sm font-black text-foreground">Discover More</h3>
              <p className="text-[10px] text-muted mt-2">More premium discovery features coming soon in Phase 5.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

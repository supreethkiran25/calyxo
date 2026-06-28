"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import useSocial from '../hooks/useSocial';
import { Home, Compass, Users, User, Settings, Bell, MessageCircle } from 'lucide-react';

// Sub-components
import SocialFeed from './SocialFeed';
import SocialExplore from './SocialExplore';
import ClubHub from './ClubHub';
import SocialProfileView from './SocialProfileView';
import SocialSettings from './SocialSettings';
import CreatePostModal from './CreatePostModal';
import SocialMessaging from './SocialMessaging';
import SocialNotifications from './SocialNotifications';

export default function SocialHub({ onNotification }) {
  const user = useStore(state => state.user);
  const currentUserId = user?.uid;

  const { following, loading: socialLoading } = useSocial();

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'explore' | 'clubs' | 'messages' | 'profile' | 'settings'
  const [selectedUser, setSelectedUser] = useState(null); // Used to view another person's profile
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Handle back from viewing a profile or settings
  const handleBack = () => {
    if (selectedUser) {
      setSelectedUser(null);
    } else if (activeTab === 'settings') {
      setActiveTab('profile');
    }
  };

  // Nav Items
  const navItems = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'clubs', icon: Users, label: 'Clubs' },
    { id: 'messages', icon: MessageCircle, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="h-full flex flex-col md:flex-row bg-background text-foreground relative overflow-hidden">
      
      {/* ── DESKTOP SIDEBAR NAVIGATION ── */}
      <div className="hidden md:flex flex-col w-64 border-r border-card-border bg-surface/30 shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-black uppercase tracking-tight tracking-widest text-acid-green">Social</h1>
          <p className="text-[10px] text-muted font-bold mt-1">Community & Connections</p>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSelectedUser(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id && !selectedUser 
                  ? 'bg-acid-green/10 text-acid-green border border-acid-green/30' 
                  : 'text-muted hover:bg-surface hover:text-foreground border border-transparent'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-card-border">
          <button 
            onClick={() => { setActiveTab('settings'); setSelectedUser(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'settings' 
                ? 'bg-acid-green/10 text-acid-green border border-acid-green/30' 
                : 'text-muted hover:bg-surface hover:text-foreground border border-transparent'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Settings</span>
          </button>
        </div>
      </div>

      {/* ── MOBILE HEADER ── */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-card-border glass sticky top-0 z-20">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-black uppercase tracking-widest text-acid-green">Social</h1>
        </div>
        <div className="flex items-center gap-3 relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full bg-surface border border-card-border hover:bg-surface/80 relative"
          >
            <Bell className="w-4 h-4 text-foreground" />
            {/* The red dot will be dynamic in the future */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive border-2 border-surface"></span>
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <SocialNotifications 
                currentUserId={currentUserId} 
                onClose={() => setShowNotifications(false)} 
              />
            )}
          </AnimatePresence>

          <button 
            onClick={() => { setActiveTab('settings'); setSelectedUser(null); }}
            className="p-2 rounded-full bg-surface border border-card-border hover:bg-surface/80"
          >
            <Settings className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 relative overflow-hidden bg-background">
        <AnimatePresence mode="wait">
          {/* Detailed Profile View Override */}
          {selectedUser ? (
            <motion.div
              key="selected-profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-10 bg-background"
            >
              <SocialProfileView targetUserId={selectedUser.userId || selectedUser.uid} currentUserId={currentUserId} onBack={handleBack} />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              {activeTab === 'feed' && <SocialFeed currentUserId={currentUserId} following={following} setSelectedUser={setSelectedUser} />}
              {activeTab === 'explore' && <SocialExplore currentUserId={currentUserId} setSelectedUser={setSelectedUser} />}
              {activeTab === 'clubs' && <ClubHub currentUserId={currentUserId} />}
              {activeTab === 'profile' && <SocialProfileView targetUserId={currentUserId} currentUserId={currentUserId} />}
              {activeTab === 'settings' && <SocialSettings currentUserId={currentUserId} onBack={handleBack} />}
              {activeTab === 'messages' && <SocialMessaging currentUserId={currentUserId} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION ── */}
      <div className="md:hidden pb-safe border-t border-card-border glass sticky bottom-0 z-20">
        <nav className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 2).map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSelectedUser(null); }}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                activeTab === item.id && !selectedUser ? 'text-acid-green' : 'text-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[8px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
          
          {/* Center FAB for Mobile */}
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="w-12 h-12 -mt-6 rounded-full bg-acid-green text-accent-foreground flex items-center justify-center shadow-lg shadow-acid-green/20 border-4 border-background shrink-0 hover:scale-105 transition-transform"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          </button>

          {navItems.slice(2, 5).map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSelectedUser(null); }}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                activeTab === item.id && !selectedUser ? 'text-acid-green' : 'text-muted hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[8px] font-bold uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* ── DESKTOP FLOATING ACTION BUTTON ── */}
      <button 
        onClick={() => setIsCreateModalOpen(true)}
        className="hidden md:flex absolute bottom-8 right-8 w-14 h-14 rounded-full bg-acid-green text-accent-foreground items-center justify-center shadow-xl shadow-acid-green/20 hover:scale-105 transition-transform z-20 group"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      </button>

      {/* ── CREATE POST MODAL ── */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreatePostModal 
            currentUserId={currentUserId} 
            onClose={() => setIsCreateModalOpen(false)} 
            onNotification={onNotification}
          />
        )}
      </AnimatePresence>

    </div>
  );
}

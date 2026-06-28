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
    { id: 'challenges', icon: Bell, label: 'Challenges' }, // Using Bell as placeholder for Challenge icon
    { id: 'messages', icon: MessageCircle, label: 'Chat' },
    { id: 'notifications', icon: Bell, label: 'Alerts' },
  ];

  return (
    <div className="h-full flex flex-col bg-background text-foreground relative overflow-hidden">
      
      {/* ── UNIFIED TOP NAVIGATION ── */}
      <div className="px-4 py-2 border-b border-card-border glass sticky top-0 z-20 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 w-max">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setSelectedUser(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors ${
                activeTab === item.id && !selectedUser 
                  ? 'bg-acid-green text-accent-foreground shadow-lg' 
                  : 'bg-surface border border-card-border text-muted hover:text-foreground hover:border-acid-green/50'
              }`}
            >
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </button>
          ))}
          
          {/* Settings Button */}
          <button
            onClick={() => { setActiveTab('settings'); setSelectedUser(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'settings' 
                ? 'bg-acid-green text-accent-foreground shadow-lg' 
                : 'bg-surface border border-card-border text-muted hover:text-foreground hover:border-acid-green/50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </div>
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 overflow-y-auto pb-safe relative bg-background">
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

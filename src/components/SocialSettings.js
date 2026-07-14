"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Bell, Image as ImageIcon, Link as LinkIcon, UserX, Trash2, Download, Save, CheckCircle, Smartphone } from 'lucide-react';
import { getSocialProfile, updateSocialProfile } from '../lib/socialProfileService';

export default function SocialSettings({ currentUserId, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!currentUserId) return;
      const data = await getSocialProfile(currentUserId);
      if (active && data) {
        setProfile(data);
        setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [currentUserId]);

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePrivacyChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      privacy: { ...(prev.privacy || {}), [field]: value }
    }));
  };

  const handleCommChange = (field, value) => {
    setProfile(prev => ({
      ...prev,
      communications: { ...(prev.communications || {}), [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      await updateSocialProfile(currentUserId, profile);
      setSuccessMsg("Settings saved successfully!");
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-acid-green border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background text-foreground relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-card-border glass sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-full hover:bg-surface transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-sm font-black uppercase tracking-widest">Social Settings</h1>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-acid-green text-accent-foreground text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
        >
          {saving ? 'Saving...' : <><Save className="w-3.5 h-3.5" /> Save</>}
        </button>
      </div>

      {successMsg && (
        <div className="bg-acid-green/10 text-acid-green text-xs font-bold p-3 flex justify-center items-center gap-2">
          <CheckCircle className="w-4 h-4" /> {successMsg}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Nav (Desktop) / Horizontal (Mobile) */}
        <div className="w-full md:w-64 border-r border-card-border flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 bg-surface/30">
          {[
            { id: 'profile', label: 'Edit Profile', icon: ImageIcon },
            { id: 'privacy', label: 'Privacy', icon: Shield },
            { id: 'communications', label: 'Communication', icon: Bell },
            { id: 'account', label: 'Account Data', icon: UserX },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-4 md:py-3 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                activeTab === tab.id ? 'text-acid-green bg-acid-green/5 border-b-2 md:border-b-0 md:border-l-2 border-acid-green' : 'text-muted hover:text-foreground hover:bg-surface'
              }`}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-none">
          <div className="max-w-2xl mx-auto space-y-8 pb-20">
            
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-black mb-4">Edit Social Profile</h2>
                  <p className="text-xs text-muted mb-6">Customize how you appear to the Calyxo community.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Display Name</label>
                    <input 
                      type="text" 
                      value={profile.displayName || ''} 
                      onChange={e => handleChange('displayName', e.target.value)}
                      className="w-full bg-surface border border-card-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-acid-green transition-colors" 
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Bio</label>
                    <textarea 
                      value={profile.bio || ''} 
                      onChange={e => handleChange('bio', e.target.value)}
                      rows={3}
                      className="w-full bg-surface border border-card-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-acid-green transition-colors resize-none" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Pronouns</label>
                      <input 
                        type="text" 
                        value={profile.pronouns || ''} 
                        onChange={e => handleChange('pronouns', e.target.value)}
                        placeholder="e.g. they/them"
                        className="w-full bg-surface border border-card-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-acid-green transition-colors" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Location</label>
                      <input 
                        type="text" 
                        value={profile.location || ''} 
                        onChange={e => handleChange('location', e.target.value)}
                        placeholder="City, Country"
                        className="w-full bg-surface border border-card-border rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-acid-green transition-colors" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-muted uppercase tracking-widest mb-1.5">Banner Theme</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['gradient-1', 'gradient-2', 'gradient-3', 'dark-mesh'].map(theme => (
                        <button
                          key={theme}
                          onClick={() => handleChange('bannerTheme', theme)}
                          className={`h-16 rounded-xl border-2 transition-all ${profile.bannerTheme === theme ? 'border-acid-green' : 'border-card-border'}`}
                        >
                          <div className={`w-full h-full rounded-lg ${theme === 'gradient-1' ? 'bg-gradient-to-r from-acid-green/40 to-background' : theme === 'gradient-2' ? 'bg-gradient-to-tr from-purple-500/30 to-background' : theme === 'gradient-3' ? 'bg-gradient-to-br from-blue-500/30 to-background' : 'bg-surface'}`}></div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-black mb-4">Privacy & Content</h2>
                  <p className="text-xs text-muted mb-6">Control who sees your activity and profile.</p>
                </div>

                <div className="space-y-6">
                  {/* Privacy Toggles */}
                  <div className="glass p-5 rounded-2xl border border-card-border space-y-5">
                    {[
                      { id: 'viewWorkouts', label: 'Who can view your workouts?' },
                      { id: 'viewNutrition', label: 'Who can view your nutrition?' },
                      { id: 'allowTagging', label: 'Who can tag you in posts?' },
                      { id: 'allowInvites', label: 'Who can invite you to clubs?' },
                    ].map(item => (
                      <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-xs font-bold text-foreground">{item.label}</span>
                        <select
                          value={profile.privacy?.[item.id] || 'public'}
                          onChange={e => handlePrivacyChange(item.id, e.target.value)}
                          className="bg-surface border border-card-border rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-foreground focus:outline-none"
                        >
                          <option value="public">Public</option>
                          <option value="friends">Friends Only</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                    ))}
                  </div>

                  <div className="glass p-5 rounded-2xl border border-card-border space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-muted border-b border-card-border pb-2">Visibility</h3>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={profile.privacy?.allowSearchIndexing !== false}
                        onChange={e => handlePrivacyChange('allowSearchIndexing', e.target.checked)}
                        className="accent-acid-green w-4 h-4"
                      />
                      <span className="text-xs font-medium">Allow search engines to index your profile</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={profile.privacy?.allowRecommendations !== false}
                        onChange={e => handlePrivacyChange('allowRecommendations', e.target.checked)}
                        className="accent-acid-green w-4 h-4"
                      />
                      <span className="text-xs font-medium">Include profile in AI recommendations</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'communications' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-black mb-4">Communication Preferences</h2>
                  <p className="text-xs text-muted mb-6">Manage your push notifications and alerts.</p>
                </div>

                <div className="glass p-5 rounded-2xl border border-card-border space-y-4">
                  {[
                    { id: 'pushMentions', label: 'Mentions & Tags' },
                    { id: 'pushMessages', label: 'Direct Messages' },
                    { id: 'pushClubs', label: 'Club Announcements' },
                    { id: 'pushChallenges', label: 'Challenge Updates' },
                    { id: 'pushAi', label: 'AI Health Recommendations' },
                  ].map(item => (
                    <label key={item.id} className="flex justify-between items-center cursor-pointer py-1">
                      <span className="text-xs font-medium text-foreground">{item.label}</span>
                      <div className={`w-10 h-5 rounded-full transition-colors relative ${profile.communications?.[item.id] !== false ? 'bg-acid-green' : 'bg-surface border border-card-border'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${profile.communications?.[item.id] !== false ? 'left-[22px]' : 'left-0.5'}`}></div>
                      </div>
                      {/* Hidden input to handle state easily in map */}
                      <input 
                        type="checkbox" 
                        className="hidden"
                        checked={profile.communications?.[item.id] !== false}
                        onChange={e => handleCommChange(item.id, e.target.checked)}
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'account' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-black mb-4 text-destructive">Account Management</h2>
                  <p className="text-xs text-muted mb-6">Data portability and account deletion.</p>
                </div>

                <div className="space-y-4">
                  <button className="w-full flex items-center justify-between p-4 rounded-xl border border-card-border bg-surface hover:bg-surface/80 transition-colors group">
                    <div className="flex items-center gap-3 text-left">
                      <Download className="w-5 h-5 text-muted group-hover:text-acid-green transition-colors" />
                      <div>
                        <span className="text-xs font-bold text-foreground block">Download Social Data</span>
                        <span className="text-[10px] text-muted">Get a copy of your posts, comments, and club activity.</span>
                      </div>
                    </div>
                  </button>

                  <button className="w-full flex items-center justify-between p-4 rounded-xl border border-destructive/30 bg-destructive/5 hover:bg-destructive/10 transition-colors">
                    <div className="flex items-center gap-3 text-left">
                      <UserX className="w-5 h-5 text-destructive" />
                      <div>
                        <span className="text-xs font-bold text-destructive block">Deactivate Social Profile</span>
                        <span className="text-[10px] text-destructive/80">Hide your profile and posts without deleting data.</span>
                      </div>
                    </div>
                  </button>

                  <button className="w-full flex items-center justify-between p-4 rounded-xl border border-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors">
                    <div className="flex items-center gap-3 text-left">
                      <Trash2 className="w-5 h-5 text-destructive" />
                      <div>
                        <span className="text-xs font-bold text-destructive block">Delete Social Profile</span>
                        <span className="text-[10px] text-destructive/80">Permanently delete all social data. Irreversible.</span>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

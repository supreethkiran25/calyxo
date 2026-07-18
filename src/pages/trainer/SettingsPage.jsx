import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getTrainerProfile, upsertTrainerProfile } from '../../lib/dbService';
import { Save, Copy, RotateCcw, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function SettingsPage() {
  const user = useStore(s => s.user);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Edit States
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [archetype, setArchetype] = useState('hybrid');
  const [pricing, setPricing] = useState('basic');
  const [isOnline, setIsOnline] = useState(true);
  const [specializations, setSpecializations] = useState('');

  useEffect(() => {
    if(!user?.uid) return;
    const loadProfile = async () => {
      const p = await getTrainerProfile(user.uid);
      if(p) {
        setProfile(p);
        setFullName(p.full_name || '');
        setBio(p.bio || '');
        setArchetype(p.archetype || 'hybrid');
        setPricing(p.pricing_tier || 'basic');
        setIsOnline(p.is_online !== false);
        setSpecializations((p.specializations || []).join(', '));
      }
      setLoading(false);
    };
    loadProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if(!user?.uid) return;
    
    const specArray = specializations.split(',').map(s => s.trim()).filter(Boolean);
    
    const payload = {
      full_name: fullName,
      bio,
      archetype,
      pricing_tier: pricing,
      is_online: isOnline,
      specializations: specArray
    };
    
    await upsertTrainerProfile(user.uid, payload);
    alert('Settings saved!');
    const p = await getTrainerProfile(user.uid);
    setProfile(p);
  };

  const handleRegenerateCode = async () => {
    if(window.confirm('Regenerate invite code? Your old code will no longer work.')) {
      // In a real app we'd call a Supabase edge function or API to trigger the regeneration trigger, 
      // but the trigger only runs on INSERT. We can manually update the invite_code to a new random string.
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      await upsertTrainerProfile(user.uid, { invite_code: newCode });
      const p = await getTrainerProfile(user.uid);
      setProfile(p);
      alert('Code regenerated!');
    }
  };

  const handleDeleteAccount = async () => {
    if(window.confirm('Are you absolutely sure? This cannot be undone.')) {
      alert('Account deletion not implemented in this demo. (Requires admin privileges to delete auth.users)');
    }
  };

  if(loading) return <div className="p-8 font-bold text-muted animate-pulse">Loading settings...</div>;

  return (
    <div className="space-y-8 pb-10 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-foreground">Settings</h1>
        <p className="text-muted text-sm">Manage your profile, availability, and billing.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Profile Section */}
        <div className="bg-surface border border-card-border rounded-3xl p-6 space-y-4">
          <h2 className="font-black text-xl mb-4">Public Profile</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted mb-2 uppercase">Full Name</label>
              <input value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none focus:border-acid-green" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted mb-2 uppercase">Archetype</label>
              <select value={archetype} onChange={e=>setArchetype(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none">
                <option value="drill_sergeant">Drill Sergeant (Intense, no excuses)</option>
                <option value="mentor">Mentor (Supportive, educational)</option>
                <option value="biohacker">Biohacker (Data-driven, precise)</option>
                <option value="yogi">Yogi (Mindful, holistic)</option>
                <option value="hybrid">Hybrid (Balanced approach)</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-muted mb-2 uppercase">Bio</label>
            <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none resize-none focus:border-acid-green"></textarea>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-muted mb-2 uppercase">Specializations (comma separated)</label>
            <input value={specializations} onChange={e=>setSpecializations(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none focus:border-acid-green" placeholder="Hypertrophy, Weight Loss, Mobility" />
          </div>
        </div>

        {/* Training Modality & Pricing */}
        <div className="bg-surface border border-card-border rounded-3xl p-6 space-y-4">
          <h2 className="font-black text-xl mb-4">Business Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-muted mb-2 uppercase">Training Modality</label>
              <select value={isOnline ? 'online' : 'in_person'} onChange={e=>setIsOnline(e.target.value === 'online')} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none">
                <option value="online">100% Online Coaching</option>
                <option value="in_person">In-Person Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted mb-2 uppercase">Pricing Tier</label>
              <select value={pricing} onChange={e=>setPricing(e.target.value)} className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-foreground font-bold outline-none">
                <option value="basic">Basic ($49/mo)</option>
                <option value="pro">Pro ($99/mo)</option>
                <option value="elite">Elite ($199/mo)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="bg-acid-green text-black px-8 py-3 rounded-xl font-black flex items-center gap-2 border-none hover:bg-[#00b894] transition-colors cursor-pointer">
            <Save className="w-4 h-4"/> Save Settings
          </button>
        </div>
      </form>

      {/* Invite Code */}
      <div className="bg-surface border border-card-border rounded-3xl p-6">
        <h2 className="font-black text-xl mb-4">Invite Code</h2>
        <p className="text-sm text-muted mb-4 font-bold">Share this code with clients so they can request to connect with you directly.</p>
        <div className="flex items-center gap-4">
          <div className="bg-card-bg border border-card-border px-6 py-3 rounded-xl font-mono text-2xl font-black text-acid-green tracking-[0.2em]">
            {profile?.invite_code || '------'}
          </div>
          <button onClick={() => { navigator.clipboard.writeText(profile?.invite_code); alert('Copied!'); }} className="p-3 bg-surface border border-card-border rounded-xl hover:text-acid-green transition-colors"><Copy className="w-5 h-5"/></button>
          <button onClick={handleRegenerateCode} className="p-3 bg-surface border border-card-border rounded-xl hover:text-orange-500 transition-colors"><RotateCcw className="w-5 h-5"/></button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-destructive/5 border border-destructive/20 rounded-3xl p-6">
        <h2 className="font-black text-xl mb-4 text-destructive flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Danger Zone</h2>
        <p className="text-sm text-destructive/70 mb-4 font-bold">Deleting your account will remove all your data, client connections, and assignments.</p>
        <button onClick={handleDeleteAccount} className="bg-destructive text-white px-6 py-3 rounded-xl font-black border-none hover:bg-red-600 transition-colors cursor-pointer">
          Delete Account
        </button>
      </div>

    </div>
  );
}

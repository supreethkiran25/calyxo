"use client";

import React, { useState, useEffect } from 'react';
import { Search, Hash, Check, X, User as UserIcon, Star, Filter } from 'lucide-react';
import { getAvailableTrainers, getTrainerByInviteCode, requestPTConnection, getUserConnection } from '../lib/dbService';
import { useStore } from '../store/useStore';
import UserTrainerChat from './UserTrainerChat';

export default function TrainerConnect() {
  const user = useStore(state => state.user);
  const userId = user?.uid;

  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'code'
  const [connection, setConnection] = useState(null);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  // Filters
  const [specialization, setSpecialization] = useState('');
  const [pricingTier, setPricingTier] = useState('');

  // Code entry
  const [inviteCode, setInviteCode] = useState('');
  const [codeResult, setCodeResult] = useState(null);
  const [codeError, setCodeError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const conn = await getUserConnection(userId);
      setConnection(conn);
      
      if (!conn || conn.status === 'rejected') {
        const filters = {};
        if (specialization) filters.specialization = specialization;
        if (pricingTier) filters.pricing_tier = pricingTier;
        const list = await getAvailableTrainers(filters);
        setTrainers(list);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const conn = await getUserConnection(userId);
        setConnection(conn);
        
        if (!conn || conn.status === 'rejected') {
          const filters = {};
          if (specialization) filters.specialization = specialization;
          if (pricingTier) filters.pricing_tier = pricingTier;
          const list = await getAvailableTrainers(filters);
          setTrainers(list);
        }
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };

    if (!userId) return;
    init();
  }, [userId, specialization, pricingTier]);

  const handleRequest = async (trainerId, method) => {
    if (!userId) return;
    await requestPTConnection(userId, trainerId, method);
    await loadData();
  };

  const handleSearchCode = async () => {
    setCodeError('');
    setCodeResult(null);
    if (!inviteCode || inviteCode.length !== 6) {
      setCodeError('Invalid code format. Must be 6 characters.');
      return;
    }
    const t = await getTrainerByInviteCode(inviteCode.toUpperCase());
    if (t) {
      setCodeResult(t);
    } else {
      setCodeError('No trainer found with this code.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted font-bold animate-pulse">Loading trainers...</div>;
  }

  // Active Connection State
  if (connection && connection.status === 'accepted') {
    const trainer = connection.trainer_profiles;
    if (showChat) {
      return <UserTrainerChat trainer={trainer} onBack={() => setShowChat(false)} />;
    }
    return (
      <div className="bg-surface border border-acid-green/30 rounded-3xl p-8 text-center max-w-xl mx-auto mt-8 relative overflow-hidden group">
        <div className="absolute inset-0 bg-acid-green/5 blur-3xl group-hover:bg-acid-green/10 transition-colors" />
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-acid-green mx-auto mb-6 overflow-hidden bg-card-bg flex items-center justify-center">
            {trainer?.profile_photo_url ? (
              <img src={trainer.profile_photo_url} alt="Trainer" className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10 text-acid-green" />
            )}
          </div>
          <h2 className="text-3xl font-black mb-2">Your Trainer is {trainer?.full_name}</h2>
          <p className="text-acid-green font-bold uppercase tracking-widest text-sm mb-6">{trainer?.archetype?.replace('_', ' ')}</p>
          <button onClick={() => setShowChat(true)} className="btn-primary py-3 px-8 rounded-full font-bold w-full uppercase tracking-widest">
            Open Chat
          </button>
        </div>
      </div>
    );
  }

  // Pending State
  if (connection && connection.status === 'pending') {
    return (
      <div className="bg-surface border border-blue-500/30 rounded-3xl p-8 text-center max-w-xl mx-auto mt-8">
        <div className="w-16 h-16 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black mb-2">Request Sent</h2>
        <p className="text-muted">Awaiting approval from {connection.trainer_profiles?.full_name}. We&apos;ll notify you when they respond.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Find Your Coach</h1>
        <p className="text-muted max-w-xl mx-auto">Connect with elite Calyxo trainers to get personalized workout plans, nutrition tracking, and 1-on-1 guidance.</p>
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button onClick={() => setActiveTab('browse')} className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${activeTab === 'browse' ? 'bg-foreground text-background scale-105' : 'bg-surface border border-card-border text-muted hover:text-foreground'}`}>
          <Search className="w-4 h-4" /> Browse
        </button>
        <button onClick={() => setActiveTab('code')} className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${activeTab === 'code' ? 'bg-foreground text-background scale-105' : 'bg-surface border border-card-border text-muted hover:text-foreground'}`}>
          <Hash className="w-4 h-4" /> Invite Code
        </button>
      </div>

      {activeTab === 'code' && (
        <div className="max-w-md mx-auto bg-surface border border-card-border rounded-3xl p-8">
          <h3 className="font-black text-xl mb-4 text-center">Have an invite code?</h3>
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              maxLength={6}
              value={inviteCode}
              onChange={e => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ENTER 6 DIGIT CODE" 
              className="input-field font-mono text-center tracking-[0.2em] uppercase w-full bg-background border border-card-border p-4 rounded-xl font-bold"
            />
            <button onClick={handleSearchCode} className="btn-primary px-6 rounded-xl font-bold">Find</button>
          </div>
          {codeError && <p className="text-red-500 text-sm font-bold text-center">{codeError}</p>}
          
          {codeResult && (
            <div className="mt-8 p-4 border border-acid-green bg-acid-green/5 rounded-2xl text-center">
              <div className="w-16 h-16 rounded-full mx-auto bg-card-bg border border-card-border mb-3 overflow-hidden">
                {codeResult.profile_photo_url ? <img src={codeResult.profile_photo_url} alt="Trainer Profile" className="w-full h-full object-cover" /> : <UserIcon className="w-full h-full p-3 text-muted" />}
              </div>
              <h4 className="font-black text-lg mb-1">{codeResult.full_name}</h4>
              <p className="text-xs text-acid-green font-bold uppercase tracking-widest mb-4">{codeResult.archetype?.replace('_', ' ')}</p>
              <button onClick={() => handleRequest(codeResult.id, 'invite_code')} className="w-full btn-primary py-3 rounded-xl font-bold uppercase">Send Request</button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'browse' && (
        <div>
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <select value={specialization} onChange={e => setSpecialization(e.target.value)} className="bg-surface border border-card-border text-foreground px-4 py-2 rounded-lg font-bold text-sm outline-none focus:border-acid-green">
              <option value="">Any Specialization</option>
              <option value="Weight Loss">Weight Loss</option>
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="Nutrition">Nutrition</option>
            </select>
            <select value={pricingTier} onChange={e => setPricingTier(e.target.value)} className="bg-surface border border-card-border text-foreground px-4 py-2 rounded-lg font-bold text-sm outline-none focus:border-acid-green">
              <option value="">Any Pricing</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="elite">Elite</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainers.length === 0 ? (
              <div className="col-span-full text-center py-12 text-muted">No trainers found matching your criteria.</div>
            ) : (
              trainers.map(trainer => (
                <div key={trainer.id} className="bg-surface border border-card-border rounded-3xl overflow-hidden hover:border-acid-green/50 transition-colors group flex flex-col">
                  <div className="h-24 bg-gradient-to-r from-background to-surface relative">
                    <div className="absolute -bottom-8 left-6 w-16 h-16 rounded-full border-4 border-surface bg-card-bg overflow-hidden flex items-center justify-center">
                      {trainer.profile_photo_url ? <img src={trainer.profile_photo_url} alt="Trainer" className="w-full h-full object-cover" /> : <UserIcon className="w-6 h-6 text-muted" />}
                    </div>
                  </div>
                  <div className="p-6 pt-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-black text-xl">{trainer.full_name}</h3>
                        <p className="text-xs text-acid-green font-bold uppercase tracking-widest">{trainer.archetype?.replace('_', ' ')}</p>
                      </div>
                      <span className="bg-background border border-card-border px-2 py-1 rounded text-xs font-bold uppercase">{trainer.pricing_tier}</span>
                    </div>
                    <p className="text-sm text-muted mb-4 line-clamp-2 flex-1">{trainer.bio}</p>
                    <div className="flex flex-wrap gap-1 mb-6">
                      {(trainer.specializations || []).slice(0, 3).map(spec => (
                        <span key={spec} className="text-[10px] font-bold uppercase bg-background px-2 py-1 rounded-full text-muted">{spec}</span>
                      ))}
                    </div>
                    <button onClick={() => handleRequest(trainer.id, 'browse')} className="w-full bg-background border border-card-border text-foreground hover:bg-acid-green hover:text-black hover:border-acid-green py-3 rounded-xl font-bold uppercase transition-colors text-sm">
                      Request Connection
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

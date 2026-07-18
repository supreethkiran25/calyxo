"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ChevronRight, Check, Target, Brain, Activity, Heart, Shield, Copy } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { upsertTrainerProfile, completeTrainerOnboarding, getTrainerProfile } from '../../lib/dbService';
import { useStore } from '../../store/useStore';

const ARCHETYPES = [
  { id: 'drill_sergeant', title: 'The Drill Sergeant', manifesto: 'No excuses. Just results.', icon: Target },
  { id: 'mentor', title: 'The Mentor', manifesto: 'I meet you where you are.', icon: Brain },
  { id: 'biohacker', title: 'The Biohacker', manifesto: 'Data over gut. Always optimize.', icon: Activity },
  { id: 'yogi', title: 'The Yogi', manifesto: 'Strength begins in stillness.', icon: Heart },
  { id: 'hybrid', title: 'The Hybrid', manifesto: 'I adapt. So do my clients.', icon: Shield }
];

const SPECIALIZATIONS = [
  'Weight Loss', 'Muscle Gain', 'Rehab', 'Sports Performance', 
  'Nutrition', 'Mental Wellness', 'Senior Fitness', 'Pre/Postnatal'
];

export default function TrainerOnboarding({ onComplete }) {
  const user = useStore(state => state.user);
  const userId = user?.uid;

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: user?.displayName || '',
    bio: '',
    experience_years: 1,
    archetype: '',
    specializations: [],
    certifications: [],
    pricing_tier: 'basic',
    is_online: true,
    invite_code: ''
  });

  const [certInput, setCertInput] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');

  useEffect(() => {
    if (step === 6 && userId) {
      getTrainerProfile(userId).then(profile => {
        if (profile?.invite_code) {
          setFormData(prev => ({ ...prev, invite_code: profile.invite_code }));
        }
      });
    }
  }, [step, userId]);

  const handlePhotoUpload = async () => {
    if (!photoFile || !userId) return null;
    const fileExt = photoFile.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `trainer-avatars/${fileName}`;
    const { error } = await supabase.storage.from('avatars').upload(filePath, photoFile);
    if (error) {
      console.error('Photo upload error:', error);
      return null;
    }
    const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  const nextStep = () => setStep(s => s + 1);

  const saveAndNext = async () => {
    setLoading(true);
    let photoUrl = formData.profile_photo_url;
    if (photoFile) {
      const uploaded = await handlePhotoUpload();
      if (uploaded) photoUrl = uploaded;
    }
    
    await upsertTrainerProfile(userId, {
      ...formData,
      profile_photo_url: photoUrl
    });
    setLoading(false);
    nextStep();
  };

  const handleComplete = async () => {
    setLoading(true);
    await completeTrainerOnboarding(userId);
    setLoading(false);
    onComplete();
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 tracking-tighter">You&apos;re built<br/><span className="text-acid-green">different.</span></h1>
            <p className="text-xl text-muted mb-12">Let&apos;s set up your Calyxo trainer profile.</p>
            <button onClick={nextStep} className="btn-primary py-4 px-12 text-lg rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform">Get Started</button>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
            <h2 className="text-3xl font-black mb-8">Basic Info</h2>
            
            <div className="flex justify-center mb-8">
              <div className="relative group cursor-pointer" onClick={() => document.getElementById('photo-upload').click()}>
                <div className="w-32 h-32 rounded-full border-2 border-dashed border-card-border overflow-hidden flex items-center justify-center bg-card-bg group-hover:border-acid-green transition-colors">
                  {photoPreview ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-muted" />}
                </div>
                <input type="file" id="photo-upload" className="hidden" accept="image/*" onChange={e => {
                  if (e.target.files?.[0]) {
                    setPhotoFile(e.target.files[0]);
                    setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }} />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-bold text-muted uppercase tracking-wider mb-2 block">Full Name</label>
                <input type="text" className="input-field w-full bg-surface border border-card-border p-3 rounded-xl" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Jane Doe" />
              </div>
              
              <div>
                <label className="text-sm font-bold text-muted uppercase tracking-wider mb-2 block flex justify-between">
                  <span>Bio</span>
                  <span>{formData.bio.length}/280</span>
                </label>
                <textarea className="input-field w-full bg-surface border border-card-border p-3 rounded-xl min-h-[100px] resize-none" maxLength={280} value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} placeholder="Tell clients what makes you unique..." />
              </div>

              <div>
                <label className="text-sm font-bold text-muted uppercase tracking-wider mb-2 block">Years of Experience: {formData.experience_years}</label>
                <input type="range" min="1" max="20" className="w-full accent-acid-green" value={formData.experience_years} onChange={e => setFormData({...formData, experience_years: parseInt(e.target.value)})} />
              </div>
            </div>

            <button onClick={saveAndNext} disabled={!formData.full_name || loading} className="w-full mt-10 btn-primary py-4 rounded-xl font-bold uppercase flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Saving...' : 'Next Step'} <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-3xl">
            <h2 className="text-3xl font-black mb-2 text-center">Your Archetype</h2>
            <p className="text-muted text-center mb-8">This defines your coaching identity. Choose wisely.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ARCHETYPES.map(arc => (
                <div 
                  key={arc.id}
                  onClick={() => setFormData({...formData, archetype: arc.id})}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${formData.archetype === arc.id ? 'border-acid-green bg-acid-green/10 shadow-[0_0_20px_rgba(0,212,170,0.2)]' : 'border-card-border bg-card-bg hover:border-acid-green/50'}`}
                >
                  <arc.icon className={`w-8 h-8 mb-4 ${formData.archetype === arc.id ? 'text-acid-green' : 'text-muted'}`} />
                  <h3 className="font-bold text-lg text-foreground mb-1">{arc.title}</h3>
                  <p className="text-sm text-muted">&quot;{arc.manifesto}&quot;</p>
                </div>
              ))}
            </div>
            <button onClick={saveAndNext} disabled={!formData.archetype || loading} className="w-full mt-10 max-w-md mx-auto block btn-primary py-4 rounded-xl font-bold uppercase flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Saving...' : 'Next Step'} <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
            <h2 className="text-3xl font-black mb-8">Specializations</h2>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {SPECIALIZATIONS.map(spec => (
                <button
                  key={spec}
                  onClick={() => {
                    const current = formData.specializations;
                    setFormData({
                      ...formData,
                      specializations: current.includes(spec) ? current.filter(s => s !== spec) : [...current, spec]
                    });
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-colors ${formData.specializations.includes(spec) ? 'bg-acid-green text-black border-acid-green' : 'bg-transparent text-muted border-card-border hover:border-acid-green/50'}`}
                >
                  {spec}
                </button>
              ))}
            </div>

            <div className="mb-8">
              <label className="text-sm font-bold text-muted uppercase tracking-wider mb-2 block">Certifications</label>
              <div className="flex gap-2 mb-3">
                <input type="text" className="input-field flex-1 bg-surface border border-card-border p-3 rounded-xl" placeholder="e.g. NASM, CrossFit L2" value={certInput} onChange={e => setCertInput(e.target.value)} onKeyDown={e => {
                  if (e.key === 'Enter' && certInput) {
                    setFormData({...formData, certifications: [...formData.certifications, certInput]});
                    setCertInput('');
                  }
                }} />
                <button onClick={() => {
                  if (certInput) {
                    setFormData({...formData, certifications: [...formData.certifications, certInput]});
                    setCertInput('');
                  }
                }} className="btn-secondary bg-[var(--input)] px-6 rounded-xl font-bold text-foreground hover:bg-card-border">Add</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.certifications.map((cert, i) => (
                  <span key={i} className="px-3 py-1 bg-surface border border-card-border rounded-lg text-sm flex items-center gap-2">
                    {cert} <button onClick={() => setFormData({...formData, certifications: formData.certifications.filter((_, idx) => idx !== i)})} className="text-muted hover:text-red-500">&times;</button>
                  </span>
                ))}
              </div>
            </div>

            <button onClick={saveAndNext} disabled={loading} className="w-full mt-10 btn-primary py-4 rounded-xl font-bold uppercase flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Saving...' : 'Next Step'} <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        );
      case 5:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
            <h2 className="text-3xl font-black mb-8">Business Details</h2>
            
            <div className="mb-8">
              <label className="text-sm font-bold text-muted uppercase tracking-wider mb-4 block">Coaching Type</label>
              <div className="flex gap-4">
                <button onClick={() => setFormData({...formData, is_online: true})} className={`flex-1 py-3 rounded-xl border-2 font-bold ${formData.is_online ? 'border-acid-green bg-acid-green/10 text-acid-green' : 'border-card-border text-muted hover:border-acid-green/50'}`}>Online</button>
                <button onClick={() => setFormData({...formData, is_online: false})} className={`flex-1 py-3 rounded-xl border-2 font-bold ${!formData.is_online ? 'border-acid-green bg-acid-green/10 text-acid-green' : 'border-card-border text-muted hover:border-acid-green/50'}`}>In-Person</button>
              </div>
            </div>

            <div className="mb-8">
              <label className="text-sm font-bold text-muted uppercase tracking-wider mb-4 block">Pricing Tier</label>
              <div className="space-y-3">
                {[
                  { id: 'basic', label: 'Basic', desc: 'Standard workout & meal plans' },
                  { id: 'pro', label: 'Pro', desc: 'Weekly check-ins & adjustments' },
                  { id: 'elite', label: 'Elite', desc: '24/7 access & daily tracking' }
                ].map(t => (
                  <div key={t.id} onClick={() => setFormData({...formData, pricing_tier: t.id})} className={`p-4 rounded-xl border-2 cursor-pointer flex items-center justify-between ${formData.pricing_tier === t.id ? 'border-acid-green bg-acid-green/10' : 'border-card-border hover:border-acid-green/50'}`}>
                    <div>
                      <h4 className={`font-bold ${formData.pricing_tier === t.id ? 'text-acid-green' : 'text-foreground'}`}>{t.label}</h4>
                      <p className="text-xs text-muted mt-1">{t.desc}</p>
                    </div>
                    {formData.pricing_tier === t.id && <Check className="w-5 h-5 text-acid-green" />}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={saveAndNext} disabled={loading} className="w-full mt-10 btn-primary py-4 rounded-xl font-bold uppercase flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Saving...' : 'Final Step'} <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        );
      case 6:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md text-center">
            <h2 className="text-3xl font-black mb-4">Your Invite Code</h2>
            <p className="text-muted mb-8">Share this code with your clients to connect instantly in the Calyxo app.</p>
            
            <div className="bg-card-bg border border-card-border rounded-3xl p-8 mb-8 relative group">
              <div className="absolute inset-0 bg-acid-green/5 rounded-3xl blur-xl group-hover:bg-acid-green/10 transition-colors" />
              <div className="relative">
                <span className="text-5xl font-black tracking-[0.2em] text-foreground">{formData.invite_code || '------'}</span>
                <button onClick={() => {
                  navigator.clipboard.writeText(formData.invite_code);
                  alert('Copied to clipboard!');
                }} className="mt-6 flex items-center justify-center gap-2 mx-auto text-acid-green hover:text-white font-bold transition-colors cursor-pointer">
                  <Copy className="w-4 h-4" /> Copy Code
                </button>
              </div>
            </div>

            <button onClick={nextStep} className="w-full btn-primary py-4 rounded-xl font-bold uppercase flex items-center justify-center gap-2">
              Continue
            </button>
          </motion.div>
        );
      case 7:
        const isDrillSergeant = formData.archetype === 'drill_sergeant';
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center w-full max-w-md">
            <div className="w-24 h-24 bg-acid-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-12 h-12 text-acid-green" />
            </div>
            <h2 className="text-4xl font-black mb-4">Profile Live.</h2>
            <p className="text-xl text-muted mb-12">
              {isDrillSergeant ? "Your clients won't know what hit them." : "You're ready to change lives."}
            </p>
            <button onClick={handleComplete} disabled={loading} className="w-full btn-primary py-4 rounded-xl font-bold uppercase tracking-widest hover:scale-105 transition-transform">
              {loading ? 'Entering...' : 'Enter Dashboard'}
            </button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-foreground">
      <AnimatePresence mode="wait">
        <div key={step} className="w-full flex justify-center">
          {renderStepContent()}
        </div>
      </AnimatePresence>
    </div>
  );
}

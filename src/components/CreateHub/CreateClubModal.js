import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Save, Shield, Globe, Lock } from 'lucide-react';
import useCreateHubStore from '../../store/useCreateHubStore';
import { getCurrentUserId } from '../../lib/dbService';

export default function CreateClubModal() {
  const { activeWorkflow, closeWorkflow } = useCreateHubStore();
  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('public');
  const [isSaving, setIsSaving] = useState(false);

  if (activeWorkflow !== 'create_club') return null;

  const handleSave = async () => {
    if (!clubName) return;
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      closeWorkflow();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={closeWorkflow} />
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-surface border border-card-border rounded-3xl p-6 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-500" /> Create Club
            </h2>
            <button onClick={closeWorkflow} className="p-2 rounded-full bg-[var(--input)] text-muted hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Club Name</label>
              <input type="text" placeholder="e.g. Morning Runners" value={clubName} onChange={e => setClubName(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-pink-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea placeholder="What is this club about?" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-pink-500 min-h-[100px]" />
            </div>
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-wider mb-1.5 block">Privacy</label>
              <div className="flex gap-2">
                <button onClick={() => setPrivacy('public')} className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg border ${privacy === 'public' ? 'border-pink-500 bg-pink-500/10 text-pink-500' : 'border-card-border bg-[var(--input)] text-muted'}`}>
                  <Globe className="w-4 h-4" /> Public
                </button>
                <button onClick={() => setPrivacy('private')} className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg border ${privacy === 'private' ? 'border-pink-500 bg-pink-500/10 text-pink-500' : 'border-card-border bg-[var(--input)] text-muted'}`}>
                  <Lock className="w-4 h-4" /> Private
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-card-border">
            <button onClick={handleSave} disabled={isSaving || !clubName} className="w-full py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Create Club
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

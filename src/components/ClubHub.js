import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ShieldCheck, Trophy, Target, Search, Plus, Loader2, ArrowRight } from 'lucide-react';
import { getClubs, createClub, joinClub, leaveClub } from '../lib/socialService';

export default function ClubHub({ currentUserId }) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubDesc, setNewClubDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchClubs = async () => {
      setLoading(true);
      const data = await getClubs();
      if (mounted) {
        setClubs(data);
        setLoading(false);
      }
    };
    fetchClubs();
    return () => { mounted = false; };
  }, []);

  const handleCreateClub = async (e) => {
    e.preventDefault();
    if (!newClubName.trim() || !newClubDesc.trim()) return;

    setIsCreating(true);
    try {
      const created = await createClub(currentUserId, {
        name: newClubName.trim(),
        description: newClubDesc.trim()
      });
      setClubs(prev => [created, ...prev]);
      setShowCreateModal(false);
      setNewClubName('');
      setNewClubDesc('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleJoin = async (club) => {
    const isMember = club.members?.includes(currentUserId);
    
    // Optimistic UI update
    setClubs(prev => prev.map(c => {
      if (c.id === club.id) {
        const members = c.members || [];
        return {
          ...c,
          members: isMember ? members.filter(m => m !== currentUserId) : [...members, currentUserId]
        };
      }
      return c;
    }));

    try {
      if (isMember) {
        await leaveClub(currentUserId, club.id);
      } else {
        await joinClub(currentUserId, club.id);
      }
    } catch (err) {
      console.error(err);
      // Revert if failed (simple reload for this example)
      const data = await getClubs();
      setClubs(data);
    }
  };

  const filteredClubs = clubs.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-background relative">
      
      {/* Header */}
      <div className="p-4 border-b border-card-border glass sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Clubs</h1>
            <p className="text-xs text-muted font-medium mt-1">Find your tribe. Train together.</p>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-acid-green text-accent-foreground px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:bg-acid-green/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Club</span>
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input 
            type="text"
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--input)] border border-card-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-acid-green transition-colors"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4 pb-24">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 text-muted animate-spin" /></div>
        ) : filteredClubs.length > 0 ? (
          filteredClubs.map(club => {
            const isMember = club.members?.includes(currentUserId);
            return (
              <div key={club.id} className="bg-surface border border-card-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-card-border shrink-0 flex items-center justify-center overflow-hidden">
                  {club.imageURL ? (
                    <img src={club.imageURL} alt={club.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-8 h-8 text-muted" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-black text-foreground truncate">{club.name}</h3>
                  <p className="text-xs text-muted mt-1 line-clamp-2 leading-relaxed">{club.description}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="text-[10px] font-bold text-foreground bg-[var(--input)] px-2 py-1 rounded-md">
                      {club.members?.length || 0} Members
                    </span>
                    {club.creatorId === currentUserId && (
                      <span className="text-[10px] font-bold text-acid-green border border-acid-green/30 px-2 py-1 rounded-md">
                        Admin
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 sm:mt-0">
                  <button 
                    onClick={() => handleToggleJoin(club)}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                      isMember 
                        ? 'bg-surface border border-card-border text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30' 
                        : 'bg-acid-green text-accent-foreground hover:bg-acid-green/90'
                    }`}
                  >
                    {isMember ? 'Leave' : 'Join'}
                  </button>
                  {isMember && (
                    <button className="p-2 rounded-xl bg-surface border border-card-border hover:bg-[var(--input)] text-muted transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted">
            <Users className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">No clubs found.</p>
            {searchQuery && <p className="text-xs mt-1">Try a different search term.</p>}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowCreateModal(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-surface border border-card-border rounded-3xl p-6 shadow-2xl"
            >
              <h2 className="text-xl font-black uppercase tracking-widest text-foreground mb-4">Create Club</h2>
              
              <form onSubmit={handleCreateClub} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Club Name</label>
                  <input 
                    type="text"
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    className="w-full bg-[var(--input)] border border-card-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-acid-green transition-colors"
                    placeholder="e.g. Morning Runners"
                    required
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Description</label>
                  <textarea 
                    value={newClubDesc}
                    onChange={(e) => setNewClubDesc(e.target.value)}
                    className="w-full bg-[var(--input)] border border-card-border rounded-xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-acid-green transition-colors resize-none"
                    placeholder="What is this club about?"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-3 rounded-xl bg-surface border border-card-border text-xs font-bold text-foreground hover:bg-[var(--input)] transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreating || !newClubName.trim() || !newClubDesc.trim()}
                    className="flex-1 py-3 rounded-xl bg-acid-green text-accent-foreground text-xs font-black uppercase tracking-widest disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

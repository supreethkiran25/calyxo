"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Activity, ChevronRight, X, Check, Dumbbell, MessageSquare, Plus } from 'lucide-react';
import { getTrainerClients, respondToConnection, getUserAssignments, getTrainerProfile } from '../../lib/dbService';
import { supabase } from '../../lib/supabaseClient';
import { useStore } from '../../store/useStore';

export default function TrainerDashboard() {
  const user = useStore(state => state.user);
  const userId = user?.uid;

  const [profile, setProfile] = useState(null);
  const [clients, setClients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        // Fetch profile for archetype
        const p = await getTrainerProfile(userId);
        setProfile(p);
        
        // Fetch connections
        const { data: connData, error } = await supabase
          .from('pt_connections')
          .select('*, user_profiles:user_id(*)')
          .eq('trainer_id', userId)
          .in('status', ['pending', 'accepted']);
          
        if (!error && connData) {
          setClients(connData.filter(c => c.status === 'accepted'));
          setPendingRequests(connData.filter(c => c.status === 'pending'));
        }

        // Fetch assignments for today
        const today = new Date().toISOString().split('T')[0];
        const { data: assignData } = await supabase
          .from('trainer_assignments')
          .select('*')
          .eq('trainer_id', userId)
          .eq('due_date', today);
          
        if (assignData) setAssignments(assignData);

      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  const handleRespond = async (id, status) => {
    await respondToConnection(id, status);
    if (status === 'accepted') {
      const acceptedReq = pendingRequests.find(r => r.id === id);
      if (acceptedReq) {
        setClients([...clients, { ...acceptedReq, status: 'accepted' }]);
      }
    }
    setPendingRequests(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div className="w-full h-full bg-background pb-32">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Trainer Dashboard</h1>
          {profile?.archetype && (
            <span className="bg-acid-green/10 text-acid-green border border-acid-green/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {profile.archetype.replace('_', ' ')}
            </span>
          )}
        </div>
        <p className="text-muted">Welcome back, {profile?.full_name || user?.displayName || 'Coach'}.</p>
      </div>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted">
          <Activity className="w-8 h-8 animate-pulse mb-4 text-acid-green" />
          <p>Loading your roster...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-surface border border-card-border rounded-2xl p-6 relative overflow-hidden group hover:border-acid-green/50 transition-colors">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-acid-green/5 rounded-full blur-2xl group-hover:bg-acid-green/10 transition-colors" />
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Active Clients</h3>
                <p className="text-4xl font-black text-foreground">{clients.length}</p>
              </div>
              <div className="bg-surface border border-card-border rounded-2xl p-6 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Pending Requests</h3>
                <div className="flex items-center gap-2">
                  <p className="text-4xl font-black text-foreground">{pendingRequests.length}</p>
                  {pendingRequests.length > 0 && <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />}
                </div>
              </div>
              <div className="bg-surface border border-card-border rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/50 transition-colors md:col-span-1 col-span-2">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors" />
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">Today&apos;s Tasks</h3>
                <p className="text-4xl font-black text-foreground">{assignments.length}</p>
              </div>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-surface border border-blue-500/30 rounded-2xl p-6">
                <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                  Connection Requests <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
                </h3>
                <div className="space-y-3">
                  {pendingRequests.map(req => (
                    <div key={req.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-background border border-card-border rounded-xl gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center font-bold text-foreground">
                          {(req.user_profiles?.nickname || req.user_profiles?.email || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground">{req.user_profiles?.nickname || 'Unknown Client'}</p>
                          <p className="text-xs text-muted">Via {req.connection_method}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleRespond(req.id, 'accepted')} className="p-2 rounded-lg bg-acid-green/20 text-acid-green hover:bg-acid-green hover:text-black transition-colors">
                          <Check className="w-5 h-5" />
                        </button>
                        <button onClick={() => handleRespond(req.id, 'rejected')} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Clients Panel */}
            <div className="bg-surface border border-card-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-lg">My Clients</h3>
                <button className="text-xs font-bold text-acid-green uppercase tracking-wider flex items-center gap-1 hover:text-white transition-colors">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              {clients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted mx-auto mb-3 opacity-50" />
                  <p className="text-muted">No active clients yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {clients.map(client => (
                    <div key={client.id} className="flex items-center justify-between p-4 bg-background border border-card-border rounded-xl hover:border-acid-green/50 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted/10 flex items-center justify-center font-bold text-foreground overflow-hidden">
                          {client.user_profiles?.photoURL ? <img src={client.user_profiles.photoURL} alt="Client" className="w-full h-full object-cover" /> : (client.user_profiles?.nickname || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-foreground group-hover:text-acid-green transition-colors">{client.user_profiles?.nickname || 'Client'}</p>
                          <p className="text-xs text-muted">Active Plan: Basic</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted group-hover:text-acid-green transition-colors" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <div className="bg-surface border border-card-border rounded-2xl p-6">
              <h3 className="font-black text-lg mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center justify-center p-4 bg-background border border-card-border rounded-xl hover:border-acid-green hover:bg-acid-green/5 transition-all group">
                  <Dumbbell className="w-6 h-6 text-muted group-hover:text-acid-green mb-2" />
                  <span className="text-xs font-bold">Assign Workout</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 bg-background border border-card-border rounded-xl hover:border-blue-500 hover:bg-blue-500/5 transition-all group">
                  <MessageSquare className="w-6 h-6 text-muted group-hover:text-blue-500 mb-2" />
                  <span className="text-xs font-bold">Message Client</span>
                </button>
              </div>
            </div>

            {/* Today&apos;s Schedule */}
            <div className="bg-surface border border-card-border rounded-2xl p-6">
              <h3 className="font-black text-lg mb-4">Today&apos;s Schedule</h3>
              {assignments.length === 0 ? (
                <p className="text-sm text-muted text-center py-6">No assignments due today.</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map(a => (
                    <div key={a.id} className="p-3 bg-background border border-card-border rounded-xl">
                      <p className="text-xs font-bold text-acid-green uppercase mb-1">{a.type.replace('_', ' ')}</p>
                      <p className="font-bold text-sm text-foreground">{a.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

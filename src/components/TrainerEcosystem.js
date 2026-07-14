"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { 
  getProfessionalClientRelationships, getUserClientRelationships, 
  sendClientRequest, updateClientRelationshipStatus,
  getGymsForOwner, createGym, getGymStaff, getUserStaffRoles, inviteGymStaff, updateStaffStatus
} from '../lib/dbService';
import { Users, User as UserIcon, Dumbbell, BookOpen, Plus, Trash2, Check, ShieldAlert, Briefcase, UserPlus } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '../lib/firebase';

export default function TrainerEcosystem({ onNotification }) {
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const updateUserProfile = useStore(state => state.updateUserProfile);
  const userId = user?.uid;

  const currentRole = userProfile?.role || 'user';

  // Real Relationship State
  const [clientRelAsPro, setClientRelAsPro] = useState([]);
  const [clientRelAsClient, setClientRelAsClient] = useState([]);
  const [ownedGyms, setOwnedGyms] = useState([]);
  const [staffRoles, setStaffRoles] = useState([]);

  // UI State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('clients');
  const [inviteEmail, setInviteEmail] = useState('');
  
  useEffect(() => {
    if (!userId) return;
    const fetchEcosystem = async () => {
      setLoading(true);
      try {
        const [proRels, cliRels, gyms, roles] = await Promise.all([
          getProfessionalClientRelationships(userId),
          getUserClientRelationships(userId),
          getGymsForOwner(userId),
          getUserStaffRoles(userId)
        ]);
        setClientRelAsPro(proRels);
        setClientRelAsClient(cliRels);
        setOwnedGyms(gyms);
        setStaffRoles(roles);
      } catch (err) {
        console.error("Failed to fetch ecosystem", err);
      }
      setLoading(false);
    };
    fetchEcosystem();
  }, [userId]);

  const handleRoleToggle = async (newRole) => {
    if (onNotification) onNotification(`Requesting role change to ${newRole.toUpperCase()}... ⏳`);
    try {
      const functions = getFunctions(app);
      const setUserRoleFn = httpsCallable(functions, 'setUserRole');
      await setUserRoleFn({ targetUid: userId, newRole });
      updateUserProfile({ role: newRole });
      if (onNotification) onNotification(`Switched role to ${newRole.toUpperCase()} 👤`);
    } catch (error) {
      if (onNotification) onNotification(`Failed to switch role: Insufficient permissions ❌`);
    }
  };

  const handleSendClientRequest = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      // In a real app we'd resolve email to UID. Using raw input as UID for demo.
      await sendClientRequest(inviteEmail, userId, 'trainer', 'both', userId);
      if (onNotification) onNotification("Client request sent!");
      setInviteEmail('');
      const rels = await getUserClientRelationships(userId);
      setClientRelAsClient(rels);
    } catch(err) {
      if (onNotification) onNotification("Failed to send request.");
    }
  };

  const handleUpdateClientRel = async (relId, profId, cliId, status) => {
    try {
      await updateClientRelationshipStatus(profId, cliId, status);
      if (onNotification) onNotification(`Request ${status}`);
      const [proRels, cliRels] = await Promise.all([
        getProfessionalClientRelationships(userId),
        getUserClientRelationships(userId)
      ]);
      setClientRelAsPro(proRels);
      setClientRelAsClient(cliRels);
    } catch(err) {}
  };

  // UI rendering branches
  if (currentRole === 'user') {
    return (
      <div className="space-y-6 pb-24">
        <Header handleRoleToggle={handleRoleToggle} currentRole={currentRole} />
        <div className="glass p-6 rounded-2xl border border-card-border">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider mb-4">Find a Professional</h2>
          <form onSubmit={handleSendClientRequest} className="flex gap-2 mb-6">
            <input type="text" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Enter Trainer/Dietitian UID" className="flex-1 bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-acid-green" required />
            <button type="submit" className="bg-acid-green text-accent-foreground px-4 py-2 rounded-xl font-bold text-xs cursor-pointer">Request Connection</button>
          </form>
          
          <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">My Professionals</h3>
          {clientRelAsClient.length === 0 ? <p className="text-[10px] text-muted">No professionals connected.</p> : (
            <div className="space-y-2">
              {clientRelAsClient.map(rel => (
                <div key={rel.id} className="flex justify-between items-center bg-surface/50 p-3 rounded-xl border border-card-border text-xs">
                  <div>
                    <span className="font-bold text-foreground">Pro: {rel.professionalId}</span>
                    <span className="block text-[9px] text-muted mt-1">Scope: {rel.scope}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${rel.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : rel.status === 'accepted' ? 'bg-acid-green/20 text-acid-green' : 'bg-red-500/20 text-red-500'}`}>
                      {rel.status}
                    </span>
                    {rel.status === 'pending' && rel.initiatedBy !== userId && (
                      <button onClick={() => handleUpdateClientRel(rel.id, rel.professionalId, rel.clientId, 'accepted')} className="text-acid-green ml-2 cursor-pointer bg-transparent border-none"><Check className="w-4 h-4"/></button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <Header handleRoleToggle={handleRoleToggle} currentRole={currentRole} />
      
      <div className="flex gap-2 bg-surface p-1 border border-card-border rounded-xl mb-6">
        <button onClick={() => setActiveTab('clients')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer border-none transition-colors ${activeTab === 'clients' ? 'bg-acid-green text-accent-foreground' : 'text-muted bg-transparent hover:text-foreground'}`}>My Clients</button>
        <button onClick={() => setActiveTab('requests')} className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider cursor-pointer border-none transition-colors ${activeTab === 'requests' ? 'bg-acid-green text-accent-foreground' : 'text-muted bg-transparent hover:text-foreground'}`}>Pending Requests</button>
      </div>

      {activeTab === 'clients' && (
        <div className="glass p-6 rounded-2xl border border-card-border space-y-4">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Active Client Roster</h2>
          {clientRelAsPro.filter(r => r.status === 'accepted').length === 0 ? <p className="text-[10px] text-muted">No active clients.</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clientRelAsPro.filter(r => r.status === 'accepted').map(rel => (
                <div key={rel.id} className="bg-surface/50 border border-card-border p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black/20 rounded-lg flex items-center justify-center text-acid-green border border-card-border/50"><UserIcon className="w-5 h-5"/></div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">Client: {rel.clientId}</span>
                      <span className="text-[9px] text-muted block mt-0.5">Scope: {rel.scope}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="glass p-6 rounded-2xl border border-card-border space-y-4">
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider">Incoming Requests</h2>
          {clientRelAsPro.filter(r => r.status === 'pending').length === 0 ? <p className="text-[10px] text-muted">No pending requests.</p> : (
            <div className="space-y-3">
              {clientRelAsPro.filter(r => r.status === 'pending').map(rel => (
                <div key={rel.id} className="bg-surface/50 border border-card-border p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Client UID: {rel.clientId}</span>
                    <span className="text-[9px] text-muted block mt-0.5">Wants you as: {rel.professionalRole}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleUpdateClientRel(rel.id, rel.professionalId, rel.clientId, 'accepted')} className="bg-acid-green text-accent-foreground px-3 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer border-none">Accept</button>
                    <button onClick={() => handleUpdateClientRel(rel.id, rel.professionalId, rel.clientId, 'declined')} className="bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-[9px] font-bold cursor-pointer border-none">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Header({ handleRoleToggle, currentRole }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-card-border pb-3">
      <div className="min-w-0 w-full sm:w-auto">
        <h1 className="text-base sm:text-xl font-black text-foreground uppercase tracking-wider flex items-center gap-2 leading-tight truncate">
          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-acid-green shrink-0" />
          <span className="truncate">Professional Ecosystem</span>
        </h1>
        <p className="text-[10px] sm:text-xs text-muted font-medium mt-0.5 truncate">Manage your professional relationships</p>
      </div>

      <div className="flex items-center gap-2 bg-surface border border-card-border p-1 rounded-xl shrink-0">
        <span className="text-[9px] text-muted font-bold uppercase tracking-wider px-2">Role:</span>
        {['user', 'trainer', 'dietitian', 'admin'].map(roleOpt => (
          <button
            key={roleOpt}
            onClick={() => handleRoleToggle(roleOpt)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
              currentRole === roleOpt
                ? 'bg-acid-green text-accent-foreground shadow-sm'
                : 'text-muted hover:text-foreground bg-transparent'
            }`}
          >
            {roleOpt}
          </button>
        ))}
      </div>
    </div>
  );
}

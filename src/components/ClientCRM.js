import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus, Mail, Check, X, Filter, CheckCircle } from 'lucide-react';
import { fetchTrainerClients, inviteClientByUsernameOrEmail } from '../lib/crmService';
import TrainerAssignModal from './TrainerAssignModal';

export default function ClientCRM({ user }) {
  const [activeTab, setActiveTab] = useState('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Assignment Modal State
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const loadClients = async () => {
    setIsLoading(true);
    const data = await fetchTrainerClients(user.uid);
    setClients(data);
    setIsLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      const data = await fetchTrainerClients(user?.uid);
      setClients(data);
      setIsLoading(false);
    };
    if (user?.uid) {
      init();
    }
  }, [user?.uid]);

  const activeClients = clients.filter(c => c.status === 'ACTIVE');
  const pendingRequests = clients.filter(c => c.status === 'PENDING');

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    
    const res = await inviteClientByUsernameOrEmail(user.uid, inviteEmail);
    if (res.error) {
      alert(res.error);
    } else {
      alert(`Invite sent to ${inviteEmail}`);
      setIsInviteModalOpen(false);
      setInviteEmail('');
      await loadClients();
    }
  };

  const openAssignModal = (client) => {
    setSelectedClient(client);
    setAssignModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">Client CRM</h1>
          <p className="text-muted text-sm">Manage your athletes and incoming requests.</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 md:py-2 px-4 rounded-xl flex items-center justify-center gap-2 border-none cursor-pointer shadow-lg shadow-blue-500/20 w-full md:w-auto shrink-0"
        >
          <Plus className="w-4 h-4" /> Invite Client
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-card-border">
        {['active', 'pending', 'archived'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-bold text-sm uppercase tracking-wider rounded-t-lg transition-colors border-none cursor-pointer ${activeTab === tab ? 'text-blue-500 border-b-2 border-blue-500 bg-blue-500/5' : 'text-muted bg-transparent hover:text-foreground'}`}
          >
            {tab}
            {tab === 'pending' && pendingRequests.length > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingRequests.length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input 
            type="text" 
            placeholder="Search clients..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--input)] text-foreground border border-card-border pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner"
          />
        </div>
        <button className="p-2 border border-card-border bg-surface rounded-xl text-muted hover:text-foreground cursor-pointer bg-transparent">
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {activeTab === 'active' && (
        isLoading ? (
          <div className="text-center py-12 text-muted animate-pulse">Loading clients...</div>
        ) : activeClients.length === 0 ? (
          <div className="text-center py-12 bg-surface border border-card-border rounded-xl">
            <Users className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
            <p className="text-muted font-bold">No active clients yet.</p>
            <p className="text-xs text-muted mt-1">Invite clients to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeClients.map(client => (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} key={client.id} className="bg-surface border border-card-border hover:border-blue-500/50 rounded-2xl p-4 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center font-bold text-lg">
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{client.name}</h3>
                  <p className="text-xs text-muted">{client.username}</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs mt-4 pt-4 border-t border-card-border gap-2">
                <span className="text-muted font-bold uppercase tracking-wider min-w-0 truncate">{client.goal}</span>
                <button onClick={() => openAssignModal(client)} className="text-blue-500 font-bold bg-blue-500/10 hover:bg-blue-500 hover:text-white px-3 py-1.5 rounded transition-colors cursor-pointer border-none shrink-0">Assign Plan</button>
              </div>
            </motion.div>
          ))}
          </div>
        )
      )}

      {activeTab === 'pending' && (
        isLoading ? (
          <div className="text-center py-12 text-muted animate-pulse">Loading requests...</div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-12 text-muted">
            No pending requests.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map(req => (
            <div key={req.id} className="bg-surface border border-card-border rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-card-border rounded-full flex items-center justify-center text-muted font-bold shrink-0">
                  {req.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-foreground truncate">{req.name}</h3>
                  <p className="text-xs text-muted truncate">{req.username} • {req.goal}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => handleRequestResponse(req.connectionId, true)} className="bg-blue-500 text-white p-2.5 rounded-lg font-bold border-none cursor-pointer">
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button onClick={() => handleRequestResponse(req.connectionId, false)} className="bg-surface border border-card-border text-muted p-2.5 rounded-lg font-bold hover:text-destructive cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          </div>
        )
      )}

      {activeTab === 'archived' && (
        <div className="text-center py-12 text-muted">
          No archived clients.
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card-bg w-full max-w-md rounded-3xl border border-card-border p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-foreground">Invite Client</h2>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-muted hover:text-foreground cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider block mb-1">Client Email or Username</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input 
                    type="text" 
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g., athlete@calyxo.app or @athlete"
                    className="w-full bg-[var(--input)] text-foreground border border-card-border pl-10 pr-3 py-3 rounded-xl focus:outline-none focus:border-blue-500 shadow-inner"
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl cursor-pointer border-none shadow-lg shadow-blue-500/20">
                Send Invite
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-card-border text-center">
              <p className="text-xs text-muted mb-2">Or share your personal invite link</p>
              <div className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-card-border">
                <code className="text-xs text-foreground flex-1 truncate text-left">calyxo.app/connect/trainer/{user?.uid || '123'}</code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`calyxo.app/connect/trainer/${user?.uid || '123'}`);
                    alert('Invite link copied! Note: Invite URLs are in development. Ask clients to search your email instead.');
                  }}
                  className="text-[10px] font-bold bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white px-2 py-1 rounded uppercase cursor-pointer border-none transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      
      {/* Assign Modal */}
      {selectedClient && (
        <TrainerAssignModal 
          isOpen={assignModalOpen} 
          onClose={() => setAssignModalOpen(false)} 
          clientId={selectedClient.clientId} 
          clientName={selectedClient.name} 
          trainerId={user?.uid} 
        />
      )}
    </div>
  );
}

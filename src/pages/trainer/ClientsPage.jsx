import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getTrainerClients, respondToConnection, getUserConnection } from '../../lib/dbService';
import { Search, User as UserIcon, Check, X, Calendar, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClientsPage() {
  const user = useStore(s => s.user);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // all, active, pending, ended

  const loadData = async () => {
    if (!user?.uid) return;
    await Promise.resolve();
    setLoading(true);
    // Since getTrainerClients only gets accepted, we need to fetch ALL connections for this trainer.
    // Let's modify our approach and use supabase directly or a custom fetch if needed.
    // For now, let's fetch all pt_connections where trainer_id = user.uid
    const { supabase } = await import('../../lib/supabaseClient');
    const { data } = await supabase.from('pt_connections').select('*, user_profiles:user_id(*)').eq('trainer_id', user.uid);
    setConnections(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading) return <div className="p-8 text-muted font-bold animate-pulse">Loading clients...</div>;

  const handleRespond = async (id, status) => {
    await respondToConnection(id, status);
    loadData();
  };

  const pending = connections.filter(c => c.status === 'pending');
  const filtered = connections.filter(c => {
    if (filterTab !== 'all' && c.status !== filterTab) return false;
    if (searchQuery) {
      const name = c.user_profiles?.full_name || c.user_profiles?.nickname || '';
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-foreground">Client CRM</h1>
        <p className="text-muted text-sm">Manage your athletes and incoming requests.</p>
      </div>

      {pending.length > 0 && (
        <div className="bg-acid-green/10 border border-acid-green/20 p-6 rounded-3xl space-y-4">
          <h2 className="text-acid-green font-black flex items-center gap-2"><UserIcon className="w-5 h-5"/> Pending Requests ({pending.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pending.map(p => (
              <div key={p.id} className="bg-surface border border-card-border p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold">{p.user_profiles?.full_name || p.user_profiles?.nickname || 'Unknown Athlete'}</h4>
                  <p className="text-xs text-muted capitalize">via {p.connection_method}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleRespond(p.id, 'accepted')} className="p-2 bg-acid-green text-black rounded-lg hover:bg-[#00b894] transition-colors"><Check className="w-4 h-4"/></button>
                  <button onClick={() => handleRespond(p.id, 'rejected')} className="p-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-colors"><X className="w-4 h-4"/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-surface p-2 rounded-2xl border border-card-border">
        <div className="flex gap-2 p-1">
          {['all', 'accepted', 'pending', 'ended'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all border-none cursor-pointer ${filterTab === tab ? 'bg-acid-green text-black shadow-lg' : 'bg-transparent text-muted hover:text-foreground hover:bg-card-bg'}`}
            >
              {tab === 'accepted' ? 'Active' : tab}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-card-bg border border-card-border text-foreground text-sm font-bold rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-acid-green"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(c => {
          const profile = c.user_profiles || {};
          const isAccepted = c.status === 'accepted';
          return (
            <div key={c.id} className="bg-surface border border-card-border p-5 rounded-3xl hover:border-acid-green/50 transition-colors group relative flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-card-bg flex items-center justify-center text-xl font-black text-acid-green border border-card-border">
                  {profile.full_name?.charAt(0) || profile.nickname?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-black text-lg">{profile.full_name || profile.nickname || 'Unknown'}</h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted mt-1">
                    <span className={`px-2 py-0.5 rounded-md ${c.status === 'accepted' ? 'bg-acid-green/10 text-acid-green' : c.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : 'bg-destructive/10 text-destructive'} uppercase`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2 mb-6 flex-1">
                <div className="flex justify-between text-xs font-bold text-muted">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Connected</span>
                  <span>{new Date(c.requested_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-muted">
                  <span className="flex items-center gap-1"><Activity className="w-3 h-3"/> Last Active</span>
                  <span>Just now</span>
                </div>
              </div>
              {isAccepted ? (
                <Link to={`/trainer/clients/${c.user_id}`} className="w-full py-3 bg-card-bg text-center text-sm font-black rounded-xl border border-card-border hover:bg-acid-green hover:text-black hover:border-acid-green transition-colors block">
                  View Profile
                </Link>
              ) : (
                <button disabled className="w-full py-3 bg-card-bg/50 text-center text-sm font-black rounded-xl border border-card-border/50 text-muted cursor-not-allowed">
                  Not Connected
                </button>
              )}
            </div>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div className="text-center p-12 bg-surface rounded-3xl border border-card-border text-muted font-bold">
          No clients found.
        </div>
      )}
    </div>
  );
}

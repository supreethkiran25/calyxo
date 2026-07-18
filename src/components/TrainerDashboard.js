import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Activity, ChevronRight, X, AlertCircle } from 'lucide-react';
import { getTrainerClients, getFoodLogs, getWorkoutLogs } from '../lib/dbService';

export default function TrainerDashboard({ userId }) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      if (!userId) return;
      try {
        const data = await getTrainerClients(userId);
        setClients(data || []);
      } catch (err) {
        console.error("Failed to fetch clients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [userId]);

  const filteredClients = clients.filter(c => 
    (c.nickname || '').toLowerCase().includes(search.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-background pb-32">
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-md pb-4 pt-4 border-b border-card-border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-black text-foreground tracking-tight">Trainer Hub</h1>
          <div className="bg-surface border border-card-border px-3 py-1.5 rounded-full flex items-center gap-2">
            <Users className="w-4 h-4 text-acid-green" />
            <span className="text-sm font-bold text-foreground">{clients.length} Clients</span>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input 
            type="text" 
            placeholder="Search clients by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-card-border rounded-xl pl-12 pr-4 py-3 text-sm text-foreground focus:outline-none focus:border-acid-green transition-colors"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted">
          <Activity className="w-8 h-8 animate-pulse mb-4 text-acid-green" />
          <p>Loading your roster...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-2">No clients found</h3>
          <p className="text-sm text-muted max-w-xs">
            {search ? "No clients match your search." : "You haven't accepted any client requests yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map(client => (
            <motion.div 
              key={client.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-surface border border-card-border rounded-2xl p-4 flex items-center justify-between hover:border-acid-green cursor-pointer transition-colors group"
              onClick={() => setSelectedClient(client)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-card-border border border-muted/20 shrink-0">
                  {client.photoURL ? (
                    <img src={client.photoURL} alt={client.nickname} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted/10 text-muted font-bold">
                      {(client.nickname || client.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{client.nickname || 'Unknown Client'}</h3>
                  <p className="text-xs text-muted truncate max-w-[150px]">{client.email}</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted group-hover:text-acid-green transition-colors" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Client Detail Modal */}
      <AnimatePresence>
        {selectedClient && (
          <ClientDetailModal 
            client={selectedClient} 
            onClose={() => setSelectedClient(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ClientDetailModal({ client, onClose }) {
  const [foods, setFoods] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const [f, w] = await Promise.all([
          getFoodLogs(client.id),
          getWorkoutLogs(client.id)
        ]);
        setFoods(f || []);
        setWorkouts(w || []);
      } catch (err) {
        console.error("Failed to fetch client logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [client.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-surface border border-card-border rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
      >
        <div className="p-4 border-b border-card-border flex items-center justify-between sticky top-0 bg-surface z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-card-border shrink-0 overflow-hidden">
               {client.photoURL ? (
                 <img src={client.photoURL} alt={client.nickname} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-muted font-bold">
                   {(client.nickname || 'C')[0].toUpperCase()}
                 </div>
               )}
            </div>
            <div>
              <h2 className="font-bold text-foreground">{client.nickname}</h2>
              <p className="text-xs text-muted">{client.subscription_plan || 'FREE'} Plan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-card-border text-muted">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {loading ? (
            <div className="flex justify-center py-12"><Activity className="w-6 h-6 animate-pulse text-acid-green" /></div>
          ) : (
            <>
              {/* Recent Workouts */}
              <div>
                <h3 className="text-lg font-black text-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-acid-green" /> Recent Workouts
                </h3>
                {workouts.length === 0 ? (
                  <p className="text-sm text-muted bg-background rounded-xl p-4 border border-card-border">No workouts logged recently.</p>
                ) : (
                  <div className="space-y-3">
                    {workouts.slice(0, 3).map(w => (
                      <div key={w.id} className="bg-background border border-card-border rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-sm text-foreground">{w.name}</p>
                          <p className="text-xs text-muted">{new Date(w.timestamp).toLocaleDateString()}</p>
                        </div>
                        <span className="text-xs font-bold text-acid-green bg-acid-green/10 px-2 py-1 rounded-full">
                          {w.duration || w.time || 0} mins
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Nutrition */}
              <div>
                <h3 className="text-lg font-black text-foreground mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-400" /> Recent Nutrition
                </h3>
                {foods.length === 0 ? (
                  <p className="text-sm text-muted bg-background rounded-xl p-4 border border-card-border">No meals logged recently.</p>
                ) : (
                  <div className="space-y-3">
                    {foods.slice(0, 3).map(f => (
                      <div key={f.id} className="bg-background border border-card-border rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-sm text-foreground">{f.name}</p>
                          <p className="text-xs text-muted">{new Date(f.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm text-foreground">{f.calories || 0} kcal</p>
                          <p className="text-xs text-muted">{f.protein || 0}g P</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

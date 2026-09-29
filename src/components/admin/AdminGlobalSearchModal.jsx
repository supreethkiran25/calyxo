import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  Users, 
  Dumbbell, 
  Utensils, 
  CreditCard, 
  ArrowRight, 
  UserCheck, 
  MessageSquare,
  ShieldCheck,
  Crown
} from 'lucide-react';
import { 
  getAdminUsers, 
  getAdminTrainers, 
  getAdminExercises, 
  getAdminFoods, 
  getAdminTransactions, 
  getAdminSupportTickets 
} from '../../services/adminService';

const AdminGlobalSearchModal = ({ isOpen, onClose, onSelectUser }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [foods, setFoods] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (!isOpen) return;

    // Preload records for real-time instantaneous local fuzzy search
    Promise.all([
      getAdminUsers({ limit: 100 }),
      getAdminTrainers(),
      getAdminExercises(),
      getAdminFoods(),
      getAdminTransactions(),
      getAdminSupportTickets()
    ]).then(([uData, tData, eData, fData, txData, tkData]) => {
      setUsers(uData?.users || []);
      setTrainers(tData || []);
      setExercises(eData || []);
      setFoods(fData || []);
      setTransactions(txData || []);
      setTickets(tkData || []);
    }).catch(err => {
      console.warn('Search prefetch error:', err);
    });
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchedUsers = q ? users.filter(u => u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)) : users.slice(0, 4);
  const matchedTrainers = q ? trainers.filter(t => t.name?.toLowerCase().includes(q) || t.email?.toLowerCase().includes(q)) : trainers.slice(0, 2);
  const matchedExercises = q ? exercises.filter(e => e.title?.toLowerCase().includes(q) || e.muscle?.toLowerCase().includes(q)) : exercises.slice(0, 3);
  const matchedFoods = q ? foods.filter(f => f.name?.toLowerCase().includes(q) || f.category?.toLowerCase().includes(q)) : foods.slice(0, 3);
  const matchedTransactions = q ? transactions.filter(t => t.payment_id?.toLowerCase().includes(q) || t.customer_name?.toLowerCase().includes(q)) : transactions.slice(0, 2);
  const matchedTickets = q ? tickets.filter(t => t.title?.toLowerCase().includes(q) || t.user_name?.toLowerCase().includes(q)) : tickets.slice(0, 2);

  const hasAnyResults = matchedUsers.length > 0 || matchedTrainers.length > 0 || matchedExercises.length > 0 || matchedFoods.length > 0 || matchedTransactions.length > 0 || matchedTickets.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-in fade-in-50">
      <div className="w-full max-w-2xl rounded-2xl bg-[#090c14] border border-white/15 overflow-hidden flex flex-col shadow-2xl shadow-black/80">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-[#0e121d]">
          <Search className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search athletes, workouts, foods, transactions, or support..."
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none font-sans"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-4 text-xs font-sans custom-scrollbar bg-[#090c14]">
          {/* Athletes Category */}
          {matchedUsers.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Users className="w-3.5 h-3.5 text-lime-400" /> Athletes ({matchedUsers.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onClose();
                      if (onSelectUser) onSelectUser(u);
                      else navigate('/admin/users');
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors group text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img 
                        src={u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.full_name || 'U')}&background=0f172a&color=fff`} 
                        alt="" 
                        className="w-7 h-7 rounded-full object-cover border border-white/10" 
                      />
                      <div>
                        <div className="text-white font-semibold flex items-center gap-1.5">
                          {u.full_name}
                          <span className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded border ${
                            u.subscription_plan === 'HIGH' || u.subscription_plan === 'PRO'
                              ? 'bg-lime-400/15 text-lime-300 border-lime-400/30'
                              : 'bg-white/5 text-slate-300 border-white/10'
                          }`}>
                            {u.subscription_plan || 'FREE'}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono">{u.email}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-lime-400 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trainers Category */}
          {matchedTrainers.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Certified Trainers ({matchedTrainers.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedTrainers.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { onClose(); navigate('/admin/trainers'); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{t.name}</span>
                      <span className="text-[11px] text-slate-400">({t.active_clients} clients)</span>
                    </div>
                    <span className="text-[11px] text-emerald-400 font-medium">{t.rating} ★</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exercises Category */}
          {matchedExercises.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Dumbbell className="w-3.5 h-3.5 text-amber-400" /> Exercises ({matchedExercises.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedExercises.map(e => (
                  <button
                    key={e.id}
                    onClick={() => { onClose(); navigate('/admin/workouts'); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white capitalize">{e.title || e.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({e.muscle || e.target})</span>
                    </div>
                    <span className="text-[10px] font-medium text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 capitalize">
                      {e.category || e.body_part}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Foods Category */}
          {matchedFoods.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Utensils className="w-3.5 h-3.5 text-rose-400" /> Nutrition Database ({matchedFoods.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedFoods.map(f => (
                  <button
                    key={f.id}
                    onClick={() => { onClose(); navigate('/admin/nutrition'); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors text-left cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{f.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({f.serving_size})</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium font-mono">{f.calories} kcal · P: {f.protein}g</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subscriptions / Payments Category */}
          {matchedTransactions.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Transactions ({matchedTransactions.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedTransactions.map(t => (
                  <button
                    key={t.payment_id}
                    onClick={() => { onClose(); navigate('/admin/payments'); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors text-left cursor-pointer group"
                  >
                    <div>
                      <span className="font-semibold text-white block">{t.customer_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{t.payment_id}</span>
                    </div>
                    <span className="font-bold text-emerald-400 font-mono">₹{t.amount}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Support Tickets Category */}
          {matchedTickets.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" /> Support Tickets ({matchedTickets.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedTickets.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { onClose(); navigate('/admin/support'); }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors text-left cursor-pointer group"
                  >
                    <div>
                      <span className="font-semibold text-white block">{t.title}</span>
                      <span className="text-[11px] text-slate-400">{t.user_name}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 font-mono">
                      {t.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!hasAnyResults && (
            <div className="py-12 text-center text-slate-500 font-sans text-xs">
              No matching records found across athletes, workouts, foods, or payments.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-[#0b0e17] border-t border-white/10 text-[11px] text-slate-400 flex items-center justify-between font-sans">
          <span>Press <kbd className="px-1.5 py-0.5 bg-white/10 border border-white/10 text-slate-300 rounded text-[10px] font-mono">Esc</kbd> to dismiss</span>
          <span className="text-slate-500 font-mono text-[10px]">Calyxo Global Search (⌘K)</span>
        </div>
      </div>
    </div>
  );
};

export default AdminGlobalSearchModal;

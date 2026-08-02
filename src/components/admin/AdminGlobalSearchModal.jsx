import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Users,
  Utensils,
  Dumbbell,
  X,
  ArrowRight
} from 'lucide-react';
import { getAdminUsers, getAdminExercises, getAdminFoods } from '../../services/adminService';

const AdminGlobalSearchModal = ({ isOpen, onClose, onSelectUser }) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [foods, setFoods] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const loadSearchData = async () => {
      try {
        const [uRes, exData, fdData] = await Promise.all([
          getAdminUsers({ limit: 50 }),
          getAdminExercises(),
          getAdminFoods()
        ]);
        setUsers(uRes.users || []);
        setExercises(exData || []);
        setFoods(fdData || []);
      } catch (e) {}
    };
    loadSearchData();
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const matchedUsers = q ? users.filter(u => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : users.slice(0, 3);
  const matchedExercises = q ? exercises.filter(e => e.title.toLowerCase().includes(q) || e.muscle.toLowerCase().includes(q)) : exercises.slice(0, 3);
  const matchedFoods = q ? foods.filter(f => f.name.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)) : foods.slice(0, 3);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Search Header */}
        <div className="flex items-center px-4 py-3 border-b border-neutral-800 bg-neutral-950/60">
          <Search className="w-5 h-5 text-indigo-400 shrink-0 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, exercises, foods..."
            className="w-full bg-transparent text-white placeholder-neutral-500 text-sm focus:outline-none font-medium"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="p-3 max-h-[60vh] overflow-y-auto space-y-4 custom-scrollbar text-xs">
          {/* Users Category */}
          {matchedUsers.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" /> Users ({matchedUsers.length})
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
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-neutral-950/40 hover:bg-indigo-600/10 hover:border-indigo-500/30 border border-transparent transition-all group text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img src={u.photoURL} alt="" className="w-7 h-7 rounded-lg object-cover" />
                      <div>
                        <div className="text-white font-semibold flex items-center gap-1.5">
                          {u.full_name}
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-indigo-300">{u.subscription_plan}</span>
                        </div>
                        <div className="text-neutral-400 text-[11px]">{u.email}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-indigo-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Exercises Category */}
          {matchedExercises.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-emerald-400" /> Exercises ({matchedExercises.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedExercises.map(e => (
                  <button
                    key={e.id}
                    onClick={() => { onClose(); navigate('/admin/workout-db'); }}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-neutral-950/40 hover:bg-neutral-800/60 border border-transparent transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{e.title}</span>
                      <span className="text-[10px] text-neutral-400 font-mono">({e.muscle})</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{e.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Foods Category */}
          {matchedFoods.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-amber-400" /> Nutrition Database ({matchedFoods.length})
              </div>
              <div className="space-y-1 mt-1">
                {matchedFoods.map(f => (
                  <button
                    key={f.id}
                    onClick={() => { onClose(); navigate('/admin/nutrition-db'); }}
                    className="w-full flex items-center justify-between p-2 rounded-xl bg-neutral-950/40 hover:bg-neutral-800/60 border border-transparent transition-all text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{f.name}</span>
                      <span className="text-[10px] text-neutral-400">({f.serving_size})</span>
                    </div>
                    <span className="text-[10px] text-amber-300 font-mono">{f.calories} kcal | P: {f.protein}g</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {matchedUsers.length === 0 && matchedExercises.length === 0 && matchedFoods.length === 0 && (
            <div className="py-8 text-center text-neutral-500">
              No matching records found in database.
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-2.5 bg-neutral-950 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between font-mono">
          <span>Press <kbd className="px-1 bg-neutral-800 rounded">Esc</kbd> to exit</span>
          <span>Calyxo Global Command Search</span>
        </div>
      </div>
    </div>
  );
};

export default AdminGlobalSearchModal;

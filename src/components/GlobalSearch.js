import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Users, Utensils, Dumbbell, Star, Settings } from 'lucide-react';

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Mock search results for demonstration
  const getResults = () => {
    if (!query || query.length < 2) return [];
    
    return [
      { id: '1', type: 'user', icon: Users, title: 'John Athlete', subtitle: '@johnfit' },
      { id: '2', type: 'club', icon: Star, title: 'Morning Runners', subtitle: '150 Members' },
      { id: '3', type: 'recipe', icon: Utensils, title: 'High Protein Oatmeal', subtitle: 'Breakfast • 350 kcal' },
      { id: '4', type: 'workout', icon: Dumbbell, title: 'Leg Day Crusher', subtitle: 'Strength • 45 mins' },
      { id: '5', type: 'setting', icon: Settings, title: 'Privacy Settings', subtitle: 'Account' },
    ].filter(item => item.title.toLowerCase().includes(query.toLowerCase()) || item.subtitle.toLowerCase().includes(query.toLowerCase()));
  };

  const results = getResults();

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-xl">
      <div className="flex items-center px-4 py-4 border-b border-card-border">
        <div className="flex-1 relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-muted" />
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Search users, clubs, workouts, recipes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-surface border border-card-border rounded-2xl pl-12 pr-12 py-4 text-sm text-foreground focus:outline-none focus:border-acid-green transition-colors shadow-lg"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-4 p-1 rounded-full text-muted hover:bg-card-border hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button 
          onClick={onClose}
          className="ml-4 text-xs font-bold uppercase tracking-widest text-muted hover:text-foreground transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-safe">
        {!query ? (
          <div className="h-full flex flex-col items-center justify-center text-muted">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="text-sm font-medium">Search the entire ecosystem.</p>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-2">
            {results.map(res => (
              <button 
                key={res.id}
                onClick={onClose}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-surface border border-transparent hover:border-card-border transition-all text-left"
              >
                <div className="w-10 h-10 rounded-full bg-card-border flex items-center justify-center shrink-0">
                  <res.icon className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-foreground">{res.title}</h4>
                  <p className="text-xs text-muted">{res.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted">
            <p className="text-sm font-medium">No results found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Dumbbell, Utensils, Droplets, Scale, Bot, TrendingUp, 
  Settings, ChevronRight, Sparkles, Activity 
} from 'lucide-react';
import useQuickActionsStore from '../store/useQuickActionsStore';
import exercisesData from '../lib/exercises.json';
import { INDIAN_FOODS } from '../lib/indianFoods';
import { searchAndRankExercises } from '../utils/exerciseSearch';

export default function GlobalSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const setActiveWorkflow = useQuickActionsStore(state => state.setActiveWorkflow);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const SUGGESTED_TAGS = [
    "Incline Dumbbell Press",
    "Chicken Biryani",
    "Masala Dosa",
    "Barbell Squat",
    "High Protein Oatmeal",
    "Calorie Target",
    "Hydration Goal"
  ];

  const QUICK_LINKS = [
    { label: 'Workout Logger', desc: 'Log sets, reps, weight & exercises', icon: Dumbbell, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', action: () => { setActiveWorkflow('log_workout'); onClose(); } },
    { label: 'Meal & Recipe Logger', desc: 'Search 1,800+ foods with macros', icon: Utensils, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', action: () => { setActiveWorkflow('log_meal'); onClose(); } },
    { label: 'Hydration Tracker', desc: 'Log water intake in ml', icon: Droplets, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20', action: () => { setActiveWorkflow('log_water'); onClose(); } },
    { label: 'Weight Recorder', desc: 'Record daily body weight', icon: Scale, color: 'text-[#ccff00] bg-[#ccff00]/10 border-[#ccff00]/20', action: () => { setActiveWorkflow('update_weight'); onClose(); } },
    { label: 'AI Health Coach', desc: 'Chat with personalized AI coach', icon: Bot, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', action: () => { navigate('/user/ai'); onClose(); } },
    { label: 'Progress & Analytics', desc: 'View predictions & health trends', icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', action: () => { navigate('/user/progress'); onClose(); } },
    { label: 'Profile & Targets', desc: 'Update biometrics & calories', icon: Settings, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', action: () => { navigate('/user/profile'); onClose(); } }
  ];

  // Dynamic Search Engine across Pages, Exercises, and Foods
  const getSearchResults = () => {
    if (!query || query.trim().length < 2) return [];

    const qLower = query.toLowerCase().trim();
    const results = [];

    // 1. Matching Pages & Features
    const pages = [
      { id: 'p-dashboard', type: 'page', title: 'Dashboard', subtitle: 'Overview, streaks & quick logs', icon: Activity, action: () => navigate('/user/dashboard') },
      { id: 'p-nutrition', type: 'page', title: 'Nutrition Page', subtitle: 'Macro targets, food logs & recipes', icon: Utensils, action: () => navigate('/user/nutrition') },
      { id: 'p-workout', type: 'page', title: 'Workout Page', subtitle: 'Routine planner & exercise catalog', icon: Dumbbell, action: () => navigate('/user/workout') },
      { id: 'p-ai', type: 'page', title: 'AI Coach Chat', subtitle: 'Personalized workout & nutrition advice', icon: Bot, action: () => navigate('/user/ai') },
      { id: 'p-progress', type: 'page', title: 'Progress & Analytics', subtitle: 'Weight forecasting & health twin', icon: TrendingUp, action: () => navigate('/user/progress') },
      { id: 'p-profile', type: 'page', title: 'Profile Settings', subtitle: 'Account details, units & targets', icon: Settings, action: () => navigate('/user/profile') }
    ];

    pages.forEach(p => {
      if (p.title.toLowerCase().includes(qLower) || p.subtitle.toLowerCase().includes(qLower)) {
        results.push(p);
      }
    });

    // 2. Matching Exercises (top 5)
    const matchedExercises = searchAndRankExercises(query, exercisesData).slice(0, 5);
    matchedExercises.forEach(ex => {
      results.push({
        id: `ex-${ex.id}`,
        type: 'exercise',
        title: ex.name,
        subtitle: `Target: ${ex.target || ex.body_part || 'Full Body'} • ${ex.equipment || 'Free Weights'}`,
        gif_url: ex.gif_url || ex.image,
        icon: Dumbbell,
        action: () => {
          setActiveWorkflow('log_workout', { initialExercise: ex });
        }
      });
    });

    // 3. Matching Foods (top 5)
    const foodMatches = INDIAN_FOODS.filter(f => 
      f.name.toLowerCase().includes(qLower) || 
      (f.aliases && f.aliases.some(a => a.toLowerCase().includes(qLower)))
    ).slice(0, 5);

    foodMatches.forEach(f => {
      results.push({
        id: `food-${f.name}`,
        type: 'food',
        title: f.name,
        subtitle: `${f.calories} kcal per 100g • ${f.protein}g Protein (${f.category || 'General'})`,
        icon: Utensils,
        action: () => {
          setActiveWorkflow('log_meal', { initialFood: f });
        }
      });
    });

    return results;
  };

  const results = getSearchResults();

  const handleResultClick = (item) => {
    inputRef.current?.blur();
    item.action();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col bg-background/98 backdrop-blur-2xl h-[100dvh] w-full overflow-hidden select-text"
      >
        {/* Top PWA Search Header with Safe Area Inset Support */}
        <div className="pt-safe border-b border-card-border bg-surface/80 backdrop-blur-xl shrink-0">
          <div className="max-w-3xl mx-auto px-4 py-3.5 flex items-center gap-3">
            <div className="flex-1 relative flex items-center">
              <Search className="absolute left-3.5 w-4 h-4 text-[#ccff00]" />
              <input 
                ref={inputRef}
                type="text" 
                inputMode="search"
                enterKeyHint="search"
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                placeholder="Search exercises, foods, pages, AI coach..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && results.length > 0) {
                    handleResultClick(results[0]);
                  }
                }}
                className="w-full bg-[var(--input)] border border-card-border rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm font-bold text-foreground focus:outline-none focus:border-[#ccff00] transition-colors shadow-inner"
              />
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="absolute right-3 p-1 rounded-full text-muted hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button 
              onClick={() => { inputRef.current?.blur(); onClose(); }}
              className="text-xs font-black uppercase tracking-widest text-muted hover:text-[#ccff00] transition-colors cursor-pointer border-none bg-transparent shrink-0 px-2"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Content Body: Suggestions vs Live Search Results */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-safe max-w-3xl mx-auto w-full space-y-6 scrollbar-none">
          {!query ? (
            <div className="space-y-6">
              {/* Suggested Search Chips */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#ccff00]" /> Suggested Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 rounded-xl bg-surface border border-card-border hover:border-[#ccff00] text-xs font-bold text-foreground hover:text-[#ccff00] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Search className="w-3 h-3 text-muted" />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions & Navigation */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted block">
                  Quick Actions & Navigation
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {QUICK_LINKS.map(link => (
                    <button
                      key={link.label}
                      onClick={() => { inputRef.current?.blur(); link.action(); }}
                      className="p-3.5 rounded-2xl bg-surface/70 border border-card-border hover:border-[#ccff00]/40 transition-all cursor-pointer text-left flex items-center justify-between group shadow-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${link.color}`}>
                          <link.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-foreground block group-hover:text-[#ccff00] truncate">{link.label}</span>
                          <span className="text-[9.5px] text-muted font-medium block truncate">{link.desc}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted group-hover:text-[#ccff00] transition-colors shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted block mb-2">
                Matching Results ({results.length})
              </span>
              {results.map(res => (
                <button 
                  key={res.id}
                  onClick={() => handleResultClick(res)}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-surface border border-card-border hover:border-[#ccff00]/40 transition-all cursor-pointer text-left group shadow-sm"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {res.gif_url ? (
                      <img 
                        src={res.gif_url} 
                        alt={res.title} 
                        className="w-11 h-11 rounded-xl object-cover border border-card-border shrink-0 bg-black/40"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-card-border/60 border border-card-border flex items-center justify-center shrink-0 text-[#ccff00]">
                        <res.icon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-black text-foreground group-hover:text-[#ccff00] truncate">{res.title}</h4>
                      <p className="text-[10px] text-muted font-medium truncate mt-0.5">{res.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/20 px-2.5 py-1 rounded-lg shrink-0 ml-2">
                    Open
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-muted space-y-2">
              <Search className="w-10 h-10 opacity-20" />
              <p className="text-xs font-bold">No results found for &quot;{query}&quot;</p>
              <p className="text-[10px] text-muted max-w-xs">Try searching for exercises (e.g. Incline Bench), foods (e.g. Biryani, Eggs), or app pages.</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

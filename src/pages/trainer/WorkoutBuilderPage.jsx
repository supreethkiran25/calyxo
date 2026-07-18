import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getTrainerClients, saveTrainerTemplate, assignPlan, getTrainerTemplates } from '../../lib/dbService';
import { Search, Plus, Trash2, ArrowUp, ArrowDown, Save, Send } from 'lucide-react';

export default function WorkoutBuilderPage() {
  const user = useStore(s => s.user);
  
  // Library State
  const [exercises, setExercises] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Plan Builder State
  const [planName, setPlanName] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [planExercises, setPlanExercises] = useState([]);
  
  // Assign/Template State
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [savedTemplates, setSavedTemplates] = useState([]);

  const searchWger = React.useCallback(async (query) => {
    setIsSearching(true);
    try {
      const url = query 
        ? `https://wger.de/api/v2/exercise/search/?term=${encodeURIComponent(query)}&language=2`
        : `https://wger.de/api/v2/exercise/?format=json&language=2&limit=20`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      // wger search endpoint returns { suggestions: [...] } whereas standard endpoint returns { results: [...] }
      if(data.suggestions) {
        setExercises(data.suggestions.map(s => ({ id: s.data.id, name: s.value, category: s.data.category })));
      } else {
        setExercises(data.results.map(r => ({ id: r.id, name: r.name, category: r.category })));
      }
    } catch (e) {
      console.error(e);
      // Fallback if wger fails
      setExercises([
        { id: 'fb1', name: 'Barbell Squat', category: 9 },
        { id: 'fb2', name: 'Deadlift', category: 10 },
        { id: 'fb3', name: 'Bench Press', category: 11 },
        { id: 'fb4', name: 'Pull Up', category: 12 },
      ]);
    }
    setIsSearching(false);
  }, []);

  useEffect(() => {
    if(!user?.uid) return;
    const loadData = async () => {
      const c = await getTrainerClients(user.uid);
      setClients(c);
      const t = await getTrainerTemplates(user.uid, 'workout_plan');
      setSavedTemplates(t);
    };
    loadData();
    setTimeout(() => {
      searchWger('');
    }, 0);
  }, [user?.uid, searchWger]);

  const handleSearch = (e) => {
    e.preventDefault();
    searchWger(searchQuery);
  };

  const addExerciseToPlan = (ex) => {
    setPlanExercises(prev => [...prev, {
      ...ex,
      uid: `ex-${Date.now()}-${prev.length}`,
      sets: 3,
      reps: 10,
      weight: 0,
      rest: 60
    }]);
  };

  const updateEx = (uid, field, val) => {
    setPlanExercises(planExercises.map(e => e.uid === uid ? { ...e, [field]: val } : e));
  };

  const removeEx = (uid) => {
    setPlanExercises(planExercises.filter(e => e.uid !== uid));
  };

  const moveEx = (index, dir) => {
    const newEx = [...planExercises];
    if (dir === -1 && index > 0) {
      const temp = newEx[index - 1];
      newEx[index - 1] = newEx[index];
      newEx[index] = temp;
    } else if (dir === 1 && index < newEx.length - 1) {
      const temp = newEx[index + 1];
      newEx[index + 1] = newEx[index];
      newEx[index] = temp;
    }
    setPlanExercises(newEx);
  };

  const handleSaveTemplate = async () => {
    if(!planName) return alert('Name required');
    await saveTrainerTemplate(user.uid, 'workout_plan', planName, { description: planDesc, exercises: planExercises });
    alert('Template saved!');
    setPlanName(''); setPlanDesc(''); setPlanExercises([]);
    const t = await getTrainerTemplates(user.uid, 'workout_plan');
    setSavedTemplates(t);
  };

  const handleAssign = async () => {
    if(!planName) return alert('Name required');
    if(!selectedClient) return alert('Select a client');
    await assignPlan(user.uid, selectedClient, { type: 'workout_plan', title: planName, content: { description: planDesc, exercises: planExercises } });
    alert('Plan assigned!');
    setPlanName(''); setPlanDesc(''); setPlanExercises([]);
  };

  const handleQuickAssign = async (templateId, clientId) => {
    const template = savedTemplates.find(t => t.id === templateId);
    if(!template || !clientId) return;
    await assignPlan(user.uid, clientId, { type: 'workout_plan', title: template.title, content: template.content });
    alert('Template assigned to client!');
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black text-foreground">Workout Builder</h1>
        <p className="text-muted text-sm">Create plans from the wger.de library and assign them to clients.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Panel: Library */}
        <div className="w-full lg:w-1/3 bg-surface border border-card-border rounded-3xl p-6 flex flex-col h-[600px]">
          <h2 className="font-black text-xl mb-4">Exercise Library</h2>
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-card-bg border border-card-border text-sm font-bold text-foreground rounded-xl py-3 pl-9 pr-4 focus:outline-none focus:border-acid-green" 
              placeholder="Search wger database..." 
            />
          </form>
          <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide pr-2">
            {isSearching ? <div className="text-muted font-bold text-center py-4 animate-pulse">Searching...</div> : null}
            {!isSearching && exercises.map((ex, i) => (
              <div key={ex.id || i} className="bg-card-bg border border-card-border p-3 rounded-xl flex items-center justify-between group">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{ex.name}</h4>
                  {ex.category && <span className="text-[10px] text-muted font-bold uppercase">{ex.category}</span>}
                </div>
                <button onClick={() => addExerciseToPlan(ex)} className="p-2 bg-acid-green/10 text-acid-green rounded-lg hover:bg-acid-green hover:text-black transition-colors opacity-0 group-hover:opacity-100">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Builder */}
        <div className="w-full lg:w-2/3 bg-surface border border-card-border rounded-3xl p-6 flex flex-col">
          <h2 className="font-black text-xl mb-4">Plan Builder</h2>
          <div className="space-y-4 mb-6">
            <input 
              value={planName} onChange={e => setPlanName(e.target.value)} 
              className="w-full bg-transparent border-b border-card-border text-xl font-black text-foreground py-2 focus:outline-none focus:border-acid-green" 
              placeholder="Workout Plan Name" 
            />
            <textarea 
              value={planDesc} onChange={e => setPlanDesc(e.target.value)} rows={2}
              className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-sm font-bold text-foreground resize-none focus:outline-none focus:border-acid-green" 
              placeholder="Plan description or notes..."
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 mb-6 scrollbar-hide pr-2 min-h-[300px]">
            {planExercises.length === 0 && (
              <div className="h-full flex items-center justify-center text-muted font-bold border-2 border-dashed border-card-border rounded-xl">
                Add exercises from the library
              </div>
            )}
            {planExercises.map((ex, i) => (
              <div key={ex.uid} className="bg-card-bg border border-card-border p-4 rounded-xl flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex flex-col gap-1 w-10">
                  <button onClick={() => moveEx(i, -1)} disabled={i===0} className="text-muted hover:text-foreground disabled:opacity-30"><ArrowUp className="w-4 h-4"/></button>
                  <button onClick={() => moveEx(i, 1)} disabled={i===planExercises.length-1} className="text-muted hover:text-foreground disabled:opacity-30"><ArrowDown className="w-4 h-4"/></button>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground">{ex.name}</h4>
                </div>
                <div className="flex gap-2 text-xs font-bold items-center">
                  <div className="flex flex-col"><label className="text-muted mb-1">Sets</label><input type="number" value={ex.sets} onChange={e=>updateEx(ex.uid, 'sets', e.target.value)} className="w-12 bg-surface border border-card-border rounded p-1 text-center"/></div>
                  <div className="flex flex-col"><label className="text-muted mb-1">Reps</label><input type="text" value={ex.reps} onChange={e=>updateEx(ex.uid, 'reps', e.target.value)} className="w-12 bg-surface border border-card-border rounded p-1 text-center"/></div>
                  <div className="flex flex-col"><label className="text-muted mb-1">Wt (lbs)</label><input type="number" value={ex.weight} onChange={e=>updateEx(ex.uid, 'weight', e.target.value)} className="w-16 bg-surface border border-card-border rounded p-1 text-center"/></div>
                  <div className="flex flex-col"><label className="text-muted mb-1">Rest (s)</label><input type="number" value={ex.rest} onChange={e=>updateEx(ex.uid, 'rest', e.target.value)} className="w-12 bg-surface border border-card-border rounded p-1 text-center"/></div>
                </div>
                <button onClick={() => removeEx(ex.uid)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-card-border pt-6">
            <button onClick={handleSaveTemplate} className="w-full sm:w-auto px-6 py-3 bg-card-bg text-foreground border border-card-border font-black rounded-xl hover:bg-surface flex items-center justify-center gap-2">
              <Save className="w-4 h-4"/> Save as Template
            </button>
            <div className="flex w-full sm:w-auto gap-2">
              <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className="bg-card-bg border border-card-border rounded-xl px-4 py-2 text-sm font-bold text-foreground outline-none">
                <option value="">Select Client...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.user_id}>{c.user_profiles?.full_name || 'Client'}</option>
                ))}
              </select>
              <button onClick={handleAssign} className="px-6 py-3 bg-acid-green text-black font-black rounded-xl border-none hover:bg-[#00b894] flex items-center justify-center gap-2">
                <Send className="w-4 h-4"/> Assign
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Saved Templates */}
      <div>
        <h2 className="font-black text-2xl mb-6 text-foreground">Saved Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedTemplates.length === 0 && <p className="text-muted font-bold">No saved templates found.</p>}
          {savedTemplates.map(t => (
            <div key={t.id} className="bg-surface border border-card-border p-6 rounded-3xl flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-lg text-foreground">{t.title}</h3>
                  <span className="text-[10px] font-black uppercase text-acid-green bg-acid-green/10 px-2 py-1 rounded">Workout</span>
                </div>
                <p className="text-sm text-muted font-bold mb-4 line-clamp-2">{t.content?.description || 'No description'}</p>
                <div className="text-xs font-bold text-muted mb-6">Exercises: {t.content?.exercises?.length || 0}</div>
              </div>
              <div className="flex gap-2">
                <select id={`quick-assign-${t.id}`} className="flex-1 bg-card-bg border border-card-border rounded-xl px-2 py-2 text-xs font-bold text-foreground outline-none">
                  <option value="">Client...</option>
                  {clients.map(c => (
                     <option key={c.id} value={c.user_id}>{c.user_profiles?.full_name || 'Client'}</option>
                  ))}
                </select>
                <button 
                  onClick={() => handleQuickAssign(t.id, document.getElementById(`quick-assign-${t.id}`).value)}
                  className="bg-acid-green text-black text-xs font-black px-4 py-2 rounded-xl border-none hover:bg-[#00b894]"
                >
                  Quick Assign
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


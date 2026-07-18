import React, { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { getTrainerClients, saveTrainerTemplate, assignPlan, getTrainerTemplates } from '../../lib/dbService';
import { Plus, Trash2, Save, Send, ChevronRight, Utensils } from 'lucide-react';

export default function NutritionPlannerPage() {
  const user = useStore(s => s.user);
  
  const [planName, setPlanName] = useState('');
  const [planDesc, setPlanDesc] = useState('');
  const [activeDay, setActiveDay] = useState(1);
  const [days, setDays] = useState({
    1: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    2: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    3: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    4: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    5: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    6: { breakfast: [], lunch: [], dinner: [], snacks: [] },
    7: { breakfast: [], lunch: [], dinner: [], snacks: [] },
  });

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [savedTemplates, setSavedTemplates] = useState([]);

  useEffect(() => {
    if(!user?.uid) return;
    const loadData = async () => {
      const c = await getTrainerClients(user.uid);
      setClients(c);
      const t = await getTrainerTemplates(user.uid, 'meal_plan');
      setSavedTemplates(t);
    };
    loadData();
  }, [user]);

  const addMeal = (mealType) => {
    setDays(prev => ({
      ...prev,
      [activeDay]: {
        ...prev[activeDay],
        [mealType]: [...prev[activeDay][mealType], { id: Date.now()+Math.random(), name: '', calories: 0, protein: 0, carbs: 0, fats: 0 }]
      }
    }));
  };

  const updateMeal = (mealType, id, field, val) => {
    setDays(prev => ({
      ...prev,
      [activeDay]: {
        ...prev[activeDay],
        [mealType]: prev[activeDay][mealType].map(m => m.id === id ? { ...m, [field]: val } : m)
      }
    }));
  };

  const removeMeal = (mealType, id) => {
    setDays(prev => ({
      ...prev,
      [activeDay]: {
        ...prev[activeDay],
        [mealType]: prev[activeDay][mealType].filter(m => m.id !== id)
      }
    }));
  };

  const calcTotals = (dayData) => {
    let cals = 0, p = 0, c = 0, f = 0;
    ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(type => {
      dayData[type].forEach(m => {
        cals += Number(m.calories) || 0;
        p += Number(m.protein) || 0;
        c += Number(m.carbs) || 0;
        f += Number(m.fats) || 0;
      });
    });
    return { cals, p, c, f };
  };

  const handleSaveTemplate = async () => {
    if(!planName) return alert('Name required');
    await saveTrainerTemplate(user.uid, 'meal_plan', planName, { description: planDesc, days });
    alert('Template saved!');
    const t = await getTrainerTemplates(user.uid, 'meal_plan');
    setSavedTemplates(t);
  };

  const handleAssign = async () => {
    if(!planName) return alert('Name required');
    if(!selectedClient) return alert('Select a client');
    await assignPlan(user.uid, selectedClient, { type: 'meal_plan', title: planName, content: { description: planDesc, days } });
    alert('Meal Plan assigned!');
  };

  const handleQuickAssign = async (templateId, clientId) => {
    const template = savedTemplates.find(t => t.id === templateId);
    if(!template || !clientId) return;
    await assignPlan(user.uid, clientId, { type: 'meal_plan', title: template.title, content: template.content });
    alert('Template assigned to client!');
  };

  const renderMealSection = (title, type) => {
    const meals = days[activeDay][type];
    return (
      <div className="bg-surface border border-card-border rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black capitalize">{title}</h3>
          <button onClick={() => addMeal(type)} className="text-acid-green bg-acid-green/10 hover:bg-acid-green hover:text-black transition-colors px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
            <Plus className="w-3 h-3"/> Add
          </button>
        </div>
        <div className="space-y-2">
          {meals.length === 0 && <div className="text-xs text-muted font-bold p-3 border border-dashed border-card-border rounded-xl text-center">No foods added</div>}
          {meals.map((m, i) => (
            <div key={m.id} className="flex flex-col sm:flex-row gap-2 items-center bg-card-bg p-2 rounded-xl border border-card-border">
              <input value={m.name} onChange={e=>updateMeal(type, m.id, 'name', e.target.value)} placeholder="Food name" className="flex-1 w-full bg-surface border border-card-border text-xs font-bold p-2 rounded focus:outline-none focus:border-purple-500" />
              <div className="flex gap-2 w-full sm:w-auto">
                <input type="number" placeholder="kcal" value={m.calories} onChange={e=>updateMeal(type, m.id, 'calories', e.target.value)} className="w-16 bg-surface border border-card-border text-xs text-center p-2 rounded focus:outline-none" />
                <input type="number" placeholder="Pro" value={m.protein} onChange={e=>updateMeal(type, m.id, 'protein', e.target.value)} className="w-12 bg-surface border border-card-border text-xs text-center p-2 rounded focus:outline-none" />
                <input type="number" placeholder="Carb" value={m.carbs} onChange={e=>updateMeal(type, m.id, 'carbs', e.target.value)} className="w-12 bg-surface border border-card-border text-xs text-center p-2 rounded focus:outline-none" />
                <input type="number" placeholder="Fat" value={m.fats} onChange={e=>updateMeal(type, m.id, 'fats', e.target.value)} className="w-12 bg-surface border border-card-border text-xs text-center p-2 rounded focus:outline-none" />
                <button onClick={()=>removeMeal(type, m.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const totals = calcTotals(days[activeDay]);

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-black text-foreground">Nutrition Planner</h1>
        <p className="text-muted text-sm">Design 7-day meal plans and calculate macros instantly.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Panel: Day Selector & Macros */}
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="bg-surface border border-card-border rounded-3xl p-6">
            <h2 className="font-black mb-4">Plan Days</h2>
            <div className="space-y-2">
              {[1,2,3,4,5,6,7].map(d => (
                <button 
                  key={d} 
                  onClick={() => setActiveDay(d)}
                  className={`w-full flex justify-between items-center px-4 py-3 rounded-xl text-sm font-bold border-none cursor-pointer transition-colors ${activeDay === d ? 'bg-purple-500 text-white' : 'bg-card-bg text-muted hover:text-foreground hover:bg-surface border border-card-border'}`}
                >
                  Day {d} <ChevronRight className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="bg-surface border border-card-border rounded-3xl p-6">
            <h2 className="font-black mb-4">Day {activeDay} Macros</h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-black text-purple-500">{totals.cals}</div>
                <div className="text-[10px] text-muted font-bold uppercase tracking-widest">Calories</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold border-t border-card-border pt-4">
                <div><div className="text-lg text-blue-500">{totals.p}g</div><div className="text-muted">Pro</div></div>
                <div><div className="text-lg text-orange-500">{totals.c}g</div><div className="text-muted">Carb</div></div>
                <div><div className="text-lg text-acid-green">{totals.f}g</div><div className="text-muted">Fat</div></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Meal Builder */}
        <div className="w-full lg:w-3/4 bg-surface border border-card-border rounded-3xl p-6 flex flex-col">
          <div className="space-y-4 mb-6">
            <input 
              value={planName} onChange={e => setPlanName(e.target.value)} 
              className="w-full bg-transparent border-b border-card-border text-xl font-black text-foreground py-2 focus:outline-none focus:border-purple-500" 
              placeholder="Meal Plan Name" 
            />
            <textarea 
              value={planDesc} onChange={e => setPlanDesc(e.target.value)} rows={2}
              className="w-full bg-card-bg border border-card-border rounded-xl p-3 text-sm font-bold text-foreground resize-none focus:outline-none focus:border-purple-500" 
              placeholder="Plan description or notes..."
            />
          </div>

          <div className="flex-1">
            {renderMealSection('Breakfast', 'breakfast')}
            {renderMealSection('Lunch', 'lunch')}
            {renderMealSection('Dinner', 'dinner')}
            {renderMealSection('Snacks', 'snacks')}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-card-border pt-6 mt-6">
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
              <button onClick={handleAssign} className="px-6 py-3 bg-purple-500 text-white font-black rounded-xl border-none hover:bg-purple-600 flex items-center justify-center gap-2">
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
                  <span className="text-[10px] font-black uppercase text-purple-500 bg-purple-500/10 px-2 py-1 rounded">Meal Plan</span>
                </div>
                <p className="text-sm text-muted font-bold mb-4 line-clamp-2">{t.content?.description || 'No description'}</p>
                <div className="text-xs font-bold text-muted mb-6">7 Days</div>
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
                  className="bg-purple-500 text-white text-xs font-black px-4 py-2 rounded-xl border-none hover:bg-purple-600"
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


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Trash2, Save, X, Utensils, Search } from 'lucide-react';

export default function TrainerNutritionBuilder({ user }) {
  const [planName, setPlanName] = useState('');
  const [targetCalories, setTargetCalories] = useState('2000');
  const [targetProtein, setTargetProtein] = useState('150');
  const [targetCarbs, setTargetCarbs] = useState('200');
  const [targetFat, setTargetFat] = useState('65');
  const [notes, setNotes] = useState('');
  const [meals, setMeals] = useState([
    { id: '1', name: 'Breakfast', items: [] },
    { id: '2', name: 'Lunch', items: [] },
    { id: '3', name: 'Dinner', items: [] },
    { id: '4', name: 'Snacks', items: [] }
  ]);

  const [activeMealId, setActiveMealId] = useState(null);
  const [isAddingFood, setIsAddingFood] = useState(false);
  const [foodSearch, setFoodSearch] = useState('');
  const [customFood, setCustomFood] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });

  const handleAddFood = (e) => {
    e.preventDefault();
    if (!customFood.name || !customFood.calories) return;

    setMeals(meals.map(m => {
      if (m.id === activeMealId) {
        return { 
          ...m, 
          items: [...m.items, { ...customFood, id: Date.now().toString() }] 
        };
      }
      return m;
    }));

    setIsAddingFood(false);
    setCustomFood({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  };

  const removeFood = (mealId, foodId) => {
    setMeals(meals.map(m => {
      if (m.id === mealId) {
        return { ...m, items: m.items.filter(f => f.id !== foodId) };
      }
      return m;
    }));
  };

  const calculateTotals = () => {
    let cals = 0, p = 0, c = 0, f = 0;
    meals.forEach(m => {
      m.items.forEach(item => {
        cals += Number(item.calories) || 0;
        p += Number(item.protein) || 0;
        c += Number(item.carbs) || 0;
        f += Number(item.fat) || 0;
      });
    });
    return { calories: cals, protein: p, carbs: c, fat: f };
  };

  const totals = calculateTotals();

  const handleSaveTemplate = () => {
    if (!planName) return alert("Plan needs a name");
    alert(`Nutrition Plan "${planName}" saved successfully!`);
    setPlanName(''); setNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">Nutrition Planner</h1>
          <p className="text-muted text-sm">Design macro-calculated meal templates.</p>
        </div>
        <button 
          onClick={handleSaveTemplate}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl flex items-center justify-center gap-2 border-none cursor-pointer shadow-lg shadow-blue-500/20 transition-all"
        >
          <Save className="w-4 h-4" /> Save Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column - Macros */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-surface border border-card-border p-5 rounded-2xl space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider mb-2">Plan Details</h3>
            
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Plan Name</label>
              <input 
                type="text" 
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="e.g. Lean Bulk Week 1" 
                className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner"
              />
            </div>
            
            <div className="pt-2 border-t border-card-border">
              <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-3">Target Macros</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold w-16">Calories</span>
                  <input type="number" value={targetCalories} onChange={(e) => setTargetCalories(e.target.value)} className="w-20 bg-[var(--input)] text-foreground border border-card-border px-2 py-1 rounded-lg focus:outline-none focus:border-blue-500 text-xs text-right shadow-inner" />
                  <span className="text-[10px] text-muted w-6">kcal</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold w-16 text-blue-400">Protein</span>
                  <input type="number" value={targetProtein} onChange={(e) => setTargetProtein(e.target.value)} className="w-20 bg-[var(--input)] text-foreground border border-card-border px-2 py-1 rounded-lg focus:outline-none focus:border-blue-500 text-xs text-right shadow-inner" />
                  <span className="text-[10px] text-muted w-6">g</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold w-16 text-yellow-400">Carbs</span>
                  <input type="number" value={targetCarbs} onChange={(e) => setTargetCarbs(e.target.value)} className="w-20 bg-[var(--input)] text-foreground border border-card-border px-2 py-1 rounded-lg focus:outline-none focus:border-blue-500 text-xs text-right shadow-inner" />
                  <span className="text-[10px] text-muted w-6">g</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold w-16 text-red-400">Fat</span>
                  <input type="number" value={targetFat} onChange={(e) => setTargetFat(e.target.value)} className="w-20 bg-[var(--input)] text-foreground border border-card-border px-2 py-1 rounded-lg focus:outline-none focus:border-blue-500 text-xs text-right shadow-inner" />
                  <span className="text-[10px] text-muted w-6">g</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-card-border">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Trainer Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Drink 3L of water..." 
                rows={3}
                className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-xs shadow-inner resize-none"
              />
            </div>
          </div>
        </div>

        {/* Right Column - Meals */}
        <div className="lg:col-span-3 space-y-4">
          
          <div className="grid grid-cols-4 gap-2 mb-4 bg-surface p-3 rounded-2xl border border-card-border text-center">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-muted">Current Calories</p>
              <p className={`text-lg font-black ${totals.calories > targetCalories ? 'text-destructive' : 'text-foreground'}`}>{totals.calories} / {targetCalories}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-blue-400">Protein</p>
              <p className="text-lg font-black text-foreground">{totals.protein}g</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-yellow-400">Carbs</p>
              <p className="text-lg font-black text-foreground">{totals.carbs}g</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-red-400">Fat</p>
              <p className="text-lg font-black text-foreground">{totals.fat}g</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meals.map((meal) => {
              const mealCals = meal.items.reduce((sum, item) => sum + (Number(item.calories) || 0), 0);
              
              return (
                <div key={meal.id} className="bg-surface border border-card-border rounded-2xl p-4 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-3 border-b border-card-border pb-2">
                    <h3 className="font-black text-foreground uppercase tracking-wider">{meal.name}</h3>
                    <span className="text-xs font-bold text-muted bg-background px-2 py-0.5 rounded">{mealCals} kcal</span>
                  </div>

                  <div className="flex-1 space-y-2 mb-4">
                    {meal.items.length === 0 ? (
                      <p className="text-xs text-muted text-center py-4 italic">No foods added yet.</p>
                    ) : (
                      meal.items.map(food => (
                        <div key={food.id} className="flex justify-between items-start bg-background p-2 rounded-lg border border-card-border group">
                          <div>
                            <p className="text-xs font-bold text-foreground">{food.name}</p>
                            <p className="text-[9px] text-muted mt-0.5">
                              <span className="text-blue-400">P:{food.protein || 0}g</span> • <span className="text-yellow-400">C:{food.carbs || 0}g</span> • <span className="text-red-400">F:{food.fat || 0}g</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold">{food.calories}</span>
                            <button onClick={() => removeFood(meal.id, food.id)} className="text-muted hover:text-destructive p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity bg-transparent border-none cursor-pointer">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button 
                    onClick={() => { setActiveMealId(meal.id); setIsAddingFood(true); }}
                    className="w-full bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1 border-none cursor-pointer transition-colors text-xs mt-auto"
                  >
                    <Plus className="w-3 h-3" /> Add Food
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Food Modal */}
      {isAddingFood && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-card-bg w-full max-w-md rounded-3xl border border-card-border p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-card-border pb-3">
              <h2 className="text-lg font-black text-foreground flex items-center gap-2"><Utensils className="w-4 h-4 text-blue-500" /> Add Food</h2>
              <button onClick={() => setIsAddingFood(false)} className="text-muted hover:text-foreground cursor-pointer border-none bg-transparent">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddFood} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Food Name</label>
                <input 
                  type="text" 
                  required
                  value={customFood.name}
                  onChange={(e) => setCustomFood({...customFood, name: e.target.value})}
                  placeholder="e.g. 200g Chicken Breast"
                  className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2.5 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Calories</label>
                  <input type="number" required value={customFood.calories} onChange={(e) => setCustomFood({...customFood, calories: e.target.value})} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Protein (g)</label>
                  <input type="number" value={customFood.protein} onChange={(e) => setCustomFood({...customFood, protein: e.target.value})} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Carbs (g)</label>
                  <input type="number" value={customFood.carbs} onChange={(e) => setCustomFood({...customFood, carbs: e.target.value})} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Fat (g)</label>
                  <input type="number" value={customFood.fat} onChange={(e) => setCustomFood({...customFood, fat: e.target.value})} className="w-full bg-[var(--input)] text-foreground border border-card-border px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500 text-sm shadow-inner" />
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-card-border">
                <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl cursor-pointer border-none shadow-lg shadow-blue-500/20">
                  Add to Meal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

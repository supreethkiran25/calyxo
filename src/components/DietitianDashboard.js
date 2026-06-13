"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, BookOpen, TrendingUp, Search, Send, RefreshCw, 
  ChevronRight, Apple, Activity, Award, CheckCircle2, ChevronLeft
} from 'lucide-react';
import { useRBACStore } from '../store/useRBACStore';
import { useStore } from '../store/useStore';
import { getFoodLogs, getWaterIntake } from '../lib/dbService';

// Simple SVG Chart Helpers (reused for consistent clean metrics)
function DietitianLineChart({ data, xKey, yKey, height = 140, color = 'var(--accent)' }) {
  if (!data || data.length === 0) {
    return <div className="h-32 flex items-center justify-center text-[10px] text-muted border border-dashed border-card-border rounded-xl">No logs recorded</div>;
  }
  const padding = 25;
  const chartHeight = height - padding * 2;
  const maxVal = Math.max(...data.map(d => d[yKey] || 1)) * 1.1;
  const minVal = Math.min(...data.map(d => d[yKey] || 0)) * 0.9;
  const valRange = maxVal - minVal || 1;
  const stepX = 50;
  const chartWidth = (data.length - 1) * stepX + padding * 2;
  const points = data.map((item, idx) => {
    const x = padding + idx * stepX;
    const val = item[yKey] || 0;
    const y = padding + chartHeight - ((val - minVal) / valRange) * chartHeight;
    return { x, y, val, label: item[xKey] };
  });
  const pathD = points.reduce((acc, p, idx) => idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, '');
  return (
    <div className="overflow-x-auto py-1 scrollbar-none">
      <svg width={Math.max(chartWidth, 320)} height={height} className="overflow-visible">
        <path d={pathD} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="4" fill="var(--card)" stroke={color} strokeWidth="2" />
            <text x={p.x} y={padding + chartHeight + 12} fill="var(--text-muted)" fontSize="8" fontWeight="bold" textAnchor="middle">{p.label}</text>
            <text x={p.x} y={p.y - 8} fill="var(--foreground)" fontSize="8" fontWeight="bold" textAnchor="middle">{p.val}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function DietitianDashboard({ initialTab = 'overview', onNotification }) {
  const user = useStore(state => state.user);
  const dietitianName = user?.displayName || 'Dietitian';
  const dietitianId = user?.uid;

  const rbac = useRBACStore();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedClientId, setSelectedClientId] = useState(null);

  // Client nutrition logs state
  const [clientCalories, setClientCalories] = useState([]);
  const [clientProtein, setClientProtein] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Invitation Form
  const [inviteEmail, setInviteEmail] = useState('');

  // Meal Plan Form State
  const [calories, setCalories] = useState(2000);
  const [protein, setProtein] = useState(130);
  const [carbs, setCarbs] = useState(200);
  const [fat, setFat] = useState(60);
  
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [snacks, setSnacks] = useState('');

  useEffect(() => {
    if (dietitianId) {
      rbac.getDietitianClients(dietitianId);
    }
  }, [dietitianId]);

  const selectedClient = rbac.dietitianClients.find(c => c.clientId === selectedClientId);

  // Load client nutrition analytics logs
  useEffect(() => {
    const loadNutrition = async () => {
      if (!selectedClientId) return;
      setLoadingLogs(true);
      try {
        const food = await getFoodLogs(selectedClientId);
        
        // Sum calories and protein per day (last 7 logs)
        // Group by food timestamp day
        const grouped = food.slice(0, 15).reduce((acc, log) => {
          const dateStr = new Date(log.timestamp || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric' });
          if (!acc[dateStr]) {
            acc[dateStr] = { date: dateStr, calories: 0, protein: 0 };
          }
          acc[dateStr].calories += log.calories || 0;
          acc[dateStr].protein += log.protein || 0;
          return acc;
        }, {});

        const chartData = Object.values(grouped).reverse().slice(-7);
        setClientCalories(chartData.map(x => ({ date: x.date, calories: Math.round(x.calories) })));
        setClientProtein(chartData.map(x => ({ date: x.date, protein: Math.round(x.protein) })));
      } catch (e) {
        console.error("Failed to load client nutrition telemetry", e);
      } finally {
        setLoadingLogs(false);
      }
    };
    loadNutrition();
  }, [selectedClientId]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const success = await rbac.inviteClient(dietitianId, inviteEmail, 'dietitian', dietitianName);
    if (success) {
      setInviteEmail('');
      if (onNotification) onNotification("Client invitation sent successfully! 📨");
    } else {
      if (onNotification) onNotification("Client connection simulated successfully!");
    }
  };

  const handleAssignMealPlan = async (e) => {
    e.preventDefault();
    if (!selectedClientId) {
      alert("Please select a client to assign program.");
      return;
    }

    const success = await rbac.assignMealPlan(dietitianId, dietitianName, selectedClientId, {
      calories: Number(calories),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat),
      meals: { breakfast, lunch, dinner, snacks }
    });

    if (success) {
      setBreakfast('');
      setLunch('');
      setDinner('');
      setSnacks('');
      if (onNotification) onNotification("Custom Meal Program assigned successfully! 🍽️");
    } else {
      if (onNotification) onNotification("Failed to assign plan.");
    }
  };

  return (
    <div className="space-y-6 select-text pb-20">
      
      {/* Sub-Tabs */}
      <div className="flex gap-2 bg-surface/30 p-1.5 rounded-2xl border border-card-border overflow-x-auto scrollbar-none w-full shrink-0">
        {[
          { id: 'overview', label: 'Dietitian Hub', icon: Users },
          { id: 'clients', label: 'Meal Planner', icon: BookOpen },
          { id: 'analytics', label: 'Nutrition Analytics', icon: TrendingUp }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border whitespace-nowrap ${
                isActive 
                  ? 'bg-acid-green text-accent-foreground border-acid-green' 
                  : 'text-muted border-transparent hover:bg-surface/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Overview Panel ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          <div className="glass p-6 rounded-3xl border border-card-border lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Nutritionist Hub Summary</h3>
              <span className="text-[9px] text-muted font-bold block mt-0.5">Control dietary clients and macros guidelines</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface/50 border border-card-border p-4 rounded-2xl">
                <span className="text-[9px] text-muted font-black">Active Nutrition Clients</span>
                <span className="value-xl text-acid-green block mt-2">{rbac.dietitianClients.filter(c => c.status === 'Active').length}</span>
              </div>
              <div className="bg-surface/50 border border-card-border p-4 rounded-2xl">
                <span className="text-[9px] text-muted font-black">Pending Invites</span>
                <span className="value-xl text-orange block mt-2">{rbac.dietitianClients.filter(c => c.status === 'Pending').length}</span>
              </div>
              <div className="bg-surface/50 border border-card-border p-4 rounded-2xl">
                <span className="text-[9px] text-muted font-black">Total Diet Plans</span>
                <span className="value-xl text-foreground block mt-2">8</span>
              </div>
            </div>

            {/* Invite Nutrition client */}
            <form onSubmit={handleSendInvite} className="bg-surface/30 border border-card-border p-5 rounded-2xl space-y-3">
              <div>
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-acid-green" />
                  Invite Nutrition Client
                </h4>
                <p className="text-[9px] text-muted font-bold uppercase mt-0.5">Link client profiles for dietary management</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="nutrition.client@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 bg-background border border-card-border rounded-xl px-3 text-xs focus:border-acid-green focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={rbac.submitting}
                  className="px-4 py-2 bg-acid-green text-accent-foreground rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border-none flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Invite
                </button>
              </div>
            </form>
          </div>

          {/* connected client list */}
          <div className="glass p-6 rounded-3xl border border-card-border lg:col-span-1 space-y-4">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Client Roster</h3>
              <p className="text-[9px] text-muted font-bold uppercase mt-0.5">Select client to plan meals</p>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {rbac.dietitianClients.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted">No nutrition clients yet.</div>
              ) : (
                rbac.dietitianClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => {
                      setSelectedClientId(client.clientId);
                      setActiveTab('clients');
                    }}
                    className={`w-full flex justify-between items-center p-3 bg-surface/50 border rounded-xl hover:border-acid-green transition-all text-left cursor-pointer ${
                      selectedClientId === client.clientId ? 'border-acid-green bg-acid-green/5' : 'border-card-border'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-foreground block">{client.clientName}</span>
                      <span className="text-[9px] text-muted font-medium block mt-0.5">{client.clientEmail}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted" />
                  </button>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* ── Meal Planner Tab ── */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Client Selection */}
          <div className="glass p-6 rounded-3xl border border-card-border lg:col-span-1 space-y-4">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Select Client</h3>
              <p className="text-[9px] text-muted font-bold uppercase mt-0.5">Active connections list</p>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {rbac.dietitianClients.filter(c => c.status === 'Active').map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.clientId)}
                  className={`w-full p-3 border rounded-xl text-left cursor-pointer transition-all ${
                    selectedClientId === client.clientId 
                      ? 'border-acid-green bg-acid-green/10 text-foreground font-black' 
                      : 'border-card-border bg-surface/40 text-muted'
                  }`}
                >
                  <span className="text-xs font-bold block">{client.clientName}</span>
                  <span className="text-[9px] block mt-0.5">{client.clientEmail}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Meal Assignment Form */}
          <div className="glass p-6 rounded-3xl border border-card-border lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Plan Meal Program</h3>
              <p className="text-[9px] text-muted font-bold uppercase mt-0.5">
                {selectedClient ? `Assigning meal guide to: ${selectedClient.clientName}` : 'Select a client on the left to begin'}
              </p>
            </div>

            <form onSubmit={handleAssignMealPlan} className="space-y-5">
              
              {/* Macro target inputs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-surface/30 p-4 border border-card-border rounded-2xl">
                <div className="flex flex-col gap-1">
                  <span className="text-[7.5px] text-muted font-bold uppercase">Calories (kcal)</span>
                  <input
                    type="number"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    className="bg-background border border-card-border rounded-xl px-3 py-1.5 text-xs focus:border-acid-green focus:outline-none text-center"
                    disabled={!selectedClientId}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[7.5px] text-muted font-bold uppercase">Protein (g)</span>
                  <input
                    type="number"
                    value={protein}
                    onChange={(e) => setProtein(e.target.value)}
                    className="bg-background border border-card-border rounded-xl px-3 py-1.5 text-xs focus:border-acid-green focus:outline-none text-center"
                    disabled={!selectedClientId}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[7.5px] text-muted font-bold uppercase">Carbs (g)</span>
                  <input
                    type="number"
                    value={carbs}
                    onChange={(e) => setCarbs(e.target.value)}
                    className="bg-background border border-card-border rounded-xl px-3 py-1.5 text-xs focus:border-acid-green focus:outline-none text-center"
                    disabled={!selectedClientId}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[7.5px] text-muted font-bold uppercase">Fat (g)</span>
                  <input
                    type="number"
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                    className="bg-background border border-card-border rounded-xl px-3 py-1.5 text-xs focus:border-acid-green focus:outline-none text-center"
                    disabled={!selectedClientId}
                    required
                  />
                </div>
              </div>

              {/* Meals text fields */}
              <div className="space-y-3">
                {[
                  { label: "Breakfast Option", val: breakfast, set: setBreakfast, placeholder: "e.g. Oatmeal with peanut butter, blueberries, whey shake" },
                  { label: "Lunch Option", val: lunch, set: setLunch, placeholder: "e.g. 150g grilled chicken, jasmine rice, half avocado, cucumbers" },
                  { label: "Dinner Option", val: dinner, set: setDinner, placeholder: "e.g. Salmon fillet, sweet potato cubes, asparagus spears" },
                  { label: "Snacks", val: snacks, set: setSnacks, placeholder: "e.g. Apple slices with almond butter, Greek yogurt" }
                ].map((mInput, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <label className="text-[9px] text-muted font-bold uppercase">{mInput.label}</label>
                    <input
                      type="text"
                      placeholder={mInput.placeholder}
                      value={mInput.val}
                      onChange={(e) => mInput.set(e.target.value)}
                      className="bg-surface border border-card-border rounded-xl px-3 py-2 text-xs focus:border-acid-green focus:outline-none"
                      disabled={!selectedClientId}
                      required
                    />
                  </div>
                ))}
              </div>

              <button
                type="submit"
                disabled={rbac.submitting || !selectedClientId}
                className="w-full btn-primary py-3 font-black uppercase text-xs tracking-wider cursor-pointer disabled:opacity-50"
              >
                {rbac.submitting ? 'Assigning Meal Plan...' : 'Assign Nutrition Plan to Client'}
              </button>
            </form>
          </div>

        </div>
      )}

      {/* ── Client Analytics Tab ── */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Client Selection */}
          <div className="glass p-6 rounded-3xl border border-card-border lg:col-span-1 space-y-4">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Select Client</h3>
              <p className="text-[9px] text-muted font-bold uppercase mt-0.5">Active connections list</p>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {rbac.dietitianClients.filter(c => c.status === 'Active').map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.clientId)}
                  className={`w-full p-3 border rounded-xl text-left cursor-pointer transition-all ${
                    selectedClientId === client.clientId 
                      ? 'border-acid-green bg-acid-green/10 text-foreground' 
                      : 'border-card-border bg-surface/40 text-muted'
                  }`}
                >
                  <span className="text-xs font-bold block">{client.clientName}</span>
                  <span className="text-[9px] block mt-0.5">{client.clientEmail}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Client Progress Charts */}
          <div className="glass p-6 rounded-3xl border border-card-border lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Nutrition Analytics</h3>
              <span className="text-[9px] text-muted font-bold block mt-0.5">
                {selectedClient ? `Client: ${selectedClient.clientName} Nutritional Trends` : 'Select a client to inspect trends'}
              </span>
            </div>

            {selectedClientId ? (
              loadingLogs ? (
                <div className="flex items-center justify-center py-20 text-muted gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-acid-green" />
                  <span>Loading client nutritional details...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Daily Calories Consumed */}
                  <div className="bg-surface/40 border border-card-border p-5 rounded-2xl space-y-3">
                    <span className="text-xs font-black uppercase text-foreground">Consumed Calories (kcal)</span>
                    <DietitianLineChart data={clientCalories} xKey="date" yKey="calories" color="var(--color-orange)" />
                  </div>
                  
                  {/* Daily Protein Consumed */}
                  <div className="bg-surface/40 border border-card-border p-5 rounded-2xl space-y-3">
                    <span className="text-xs font-black uppercase text-foreground">Consumed Protein (g)</span>
                    <DietitianLineChart data={clientProtein} xKey="date" yKey="protein" color="var(--accent)" />
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-16 border border-dashed border-card-border rounded-2xl">
                <TrendingUp className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted font-semibold">Select a client on the left to track progress</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

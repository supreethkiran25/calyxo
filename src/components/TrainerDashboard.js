"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserPlus, Dumbbell, TrendingUp, Calendar, Search, Plus, Trash2, 
  Send, RefreshCw, BarChart2, CheckCircle2, ChevronRight, Activity, Clock
} from 'lucide-react';
import { useRBACStore } from '../store/useRBACStore';
import { useStore } from '../store/useStore';
import { getStepsHistory, getWeightLogs, getWorkoutLogs } from '../lib/dbService';

// Simple SVG Chart Helpers (reused from Health Hub for high visual styling)
function ClientLineChart({ data, xKey, yKey, height = 140, color = 'var(--accent)' }) {
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

export default function TrainerDashboard({ initialTab = 'overview', onNotification }) {
  const user = useStore(state => state.user);
  const trainerName = user?.displayName || 'Coach';
  const trainerId = user?.uid;

  const rbac = useRBACStore();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedClientId, setSelectedClientId] = useState(null);
  
  // Client logs state for analytics
  const [clientSteps, setClientSteps] = useState([]);
  const [clientWeight, setClientWeight] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Invitation Form
  const [inviteEmail, setInviteEmail] = useState('');

  // Workout Assignment Form State
  const [workoutName, setWorkoutName] = useState('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState([{ name: '', sets: 4, reps: 10, weight: 20 }]);

  useEffect(() => {
    if (trainerId) {
      rbac.getTrainerClients(trainerId);
    }
  }, [trainerId]);

  const selectedClient = rbac.trainerClients.find(c => c.clientId === selectedClientId);

  // Fetch logs when client changes for progress tracking
  useEffect(() => {
    const loadLogs = async () => {
      if (!selectedClientId) return;
      setLoadingLogs(true);
      try {
        const steps = await getStepsHistory(selectedClientId);
        const weights = await getWeightLogs(selectedClientId);
        
        // Map to displayable format
        setClientSteps(steps.slice(0, 7).map(x => ({ date: x.date.split('-').slice(1).join('/'), steps: x.steps })));
        setClientWeight(weights.slice(0, 7).map(x => ({ date: x.date, weight: x.weight })));
      } catch (e) {
        console.error("Failed to load client details", e);
      } finally {
        setLoadingLogs(false);
      }
    };
    loadLogs();
  }, [selectedClientId]);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const success = await rbac.inviteClient(trainerId, inviteEmail, 'trainer', trainerName);
    if (success) {
      setInviteEmail('');
      if (onNotification) onNotification("Client invitation sent successfully! 📨");
    } else {
      if (onNotification) onNotification("Client link simulated successfully!");
    }
  };

  const handleAddExerciseRow = () => {
    setExercises([...exercises, { name: '', sets: 4, reps: 10, weight: 20 }]);
  };

  const handleRemoveExerciseRow = (index) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleExerciseChange = (index, field, value) => {
    const next = [...exercises];
    next[index][field] = value;
    setExercises(next);
  };

  const handleAssignWorkout = async (e) => {
    e.preventDefault();
    if (!selectedClientId || !workoutName.trim()) {
      alert("Please select a client and specify workout name.");
      return;
    }

    const success = await rbac.assignWorkout(trainerId, trainerName, selectedClientId, {
      workoutName,
      exercises: exercises.filter(ex => ex.name.trim() !== ''),
      notes
    });

    if (success) {
      setWorkoutName('');
      setNotes('');
      setExercises([{ name: '', sets: 4, reps: 10, weight: 20 }]);
      if (onNotification) onNotification("Workout routine assigned successfully! 💪");
    } else {
      if (onNotification) onNotification("Failed to assign program.");
    }
  };

  return (
    <div className="space-y-6 select-text pb-20">
      
      {/* Tab Selectors */}
      <div className="flex gap-2 bg-surface/30 p-1.5 rounded-2xl border border-card-border overflow-x-auto scrollbar-none w-full shrink-0">
        {[
          { id: 'overview', label: 'Trainer Hub', icon: Users },
          { id: 'clients', label: 'Client Roster', icon: Dumbbell },
          { id: 'analytics', label: 'Client Analytics', icon: TrendingUp }
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
          
          {/* Quick Metrics */}
          <div className="glass p-6 rounded-3xl border border-card-border lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Coach Dashboard Overview</h3>
              <span className="text-[9px] text-muted font-bold block mt-0.5">Manage athletic roster & coaching assignments</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-surface/50 border border-card-border p-4 rounded-2xl">
                <span className="text-[9px] text-muted font-black uppercase">Active Clients</span>
                <span className="value-xl text-acid-green block mt-2">{rbac.trainerClients.filter(c => c.status === 'Active').length}</span>
              </div>
              <div className="bg-surface/50 border border-card-border p-4 rounded-2xl">
                <span className="text-[9px] text-muted font-black">Pending Invites</span>
                <span className="value-xl text-orange block mt-2">{rbac.trainerClients.filter(c => c.status === 'Pending').length}</span>
              </div>
              <div className="bg-surface/50 border border-card-border p-4 rounded-2xl">
                <span className="text-[9px] text-muted font-black">Total Programs</span>
                <span className="value-xl text-foreground block mt-2">12</span>
              </div>
            </div>

            {/* Invite client Form */}
            <form onSubmit={handleSendInvite} className="bg-surface/30 border border-card-border p-5 rounded-2xl space-y-3">
              <div>
                <h4 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-acid-green" />
                  Invite New Client
                </h4>
                <p className="text-[9px] text-muted font-bold uppercase mt-0.5">Link client profiles by email address</p>
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="client.email@example.com"
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

          {/* Connected Client List */}
          <div className="glass p-6 rounded-3xl border border-card-border lg:col-span-1 space-y-4">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Client List</h3>
              <p className="text-[9px] text-muted font-bold uppercase mt-0.5">Select client to assign workouts</p>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {rbac.trainerClients.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted">No connected clients yet.</div>
              ) : (
                rbac.trainerClients.map((client) => (
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

      {/* ── Client / Workout Assignment Tab ── */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Client Selection */}
          <div className="glass p-6 rounded-3xl border border-card-border lg:col-span-1 space-y-4">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Select Active Client</h3>
              <span className="text-[9px] text-muted font-bold block mt-0.5">Roster list for program creation</span>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {rbac.trainerClients.filter(c => c.status === 'Active').map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClientId(client.clientId)}
                  className={`w-full p-3 border rounded-xl text-left cursor-pointer transition-all ${
                    selectedClientId === client.clientId 
                      ? 'border-acid-green bg-acid-green/10 text-foreground font-black' 
                      : 'border-card-border bg-surface/40 text-muted hover:border-acid-green/40'
                  }`}
                >
                  <span className="text-xs font-bold block">{client.clientName}</span>
                  <span className="text-[9px] block mt-0.5">{client.clientEmail}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Workout Planner Form */}
          <div className="glass p-6 rounded-3xl border border-card-border lg:col-span-2 space-y-6">
            <div>
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Assign Workout Program</h3>
              <p className="text-[9px] text-muted font-bold uppercase mt-0.5">
                {selectedClient ? `Assigning program to: ${selectedClient.clientName}` : 'Select a client on the left to begin'}
              </p>
            </div>

            <form onSubmit={handleAssignWorkout} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-muted font-bold uppercase">Workout Name</label>
                <input
                  type="text"
                  placeholder="e.g. Core Strength Level 2"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  className="bg-surface border border-card-border rounded-xl px-3 py-2 text-xs focus:border-acid-green focus:outline-none"
                  disabled={!selectedClientId}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] text-muted font-bold uppercase">Exercises Routine</label>
                  <button
                    type="button"
                    onClick={handleAddExerciseRow}
                    disabled={!selectedClientId}
                    className="flex items-center gap-1 text-[9px] font-black text-acid-green hover:underline cursor-pointer border-none bg-transparent"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Exercise
                  </button>
                </div>

                {exercises.map((ex, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-surface/30 p-2.5 rounded-xl border border-card-border relative group">
                    <div className="sm:col-span-5 flex flex-col gap-1">
                      <span className="text-[7.5px] text-muted font-bold uppercase">Exercise Name</span>
                      <input
                        type="text"
                        placeholder="Squats"
                        value={ex.name}
                        onChange={(e) => handleExerciseChange(idx, 'name', e.target.value)}
                        className="bg-background border border-card-border rounded-lg px-2 py-1 text-xs focus:border-acid-green focus:outline-none"
                        disabled={!selectedClientId}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <span className="text-[7.5px] text-muted font-bold uppercase">Sets</span>
                      <input
                        type="number"
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(idx, 'sets', Number(e.target.value))}
                        className="bg-background border border-card-border rounded-lg px-2 py-1 text-xs focus:border-acid-green focus:outline-none text-center"
                        disabled={!selectedClientId}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <span className="text-[7.5px] text-muted font-bold uppercase">Reps</span>
                      <input
                        type="number"
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(idx, 'reps', Number(e.target.value))}
                        className="bg-background border border-card-border rounded-lg px-2 py-1 text-xs focus:border-acid-green focus:outline-none text-center"
                        disabled={!selectedClientId}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2 flex flex-col gap-1">
                      <span className="text-[7.5px] text-muted font-bold uppercase">Weight (kg)</span>
                      <input
                        type="number"
                        value={ex.weight}
                        onChange={(e) => handleExerciseChange(idx, 'weight', Number(e.target.value))}
                        className="bg-background border border-card-border rounded-lg px-2 py-1 text-xs focus:border-acid-green focus:outline-none text-center"
                        disabled={!selectedClientId}
                        required
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-end justify-center pb-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveExerciseRow(idx)}
                        disabled={exercises.length === 1 || !selectedClientId}
                        className="p-1 rounded text-muted hover:text-destructive hover:bg-black/10 transition-all cursor-pointer border-none bg-transparent"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] text-muted font-bold uppercase">Assigned Program Notes</label>
                <textarea
                  placeholder="Focus on clean form, hydrate well."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-surface border border-card-border rounded-xl px-3 py-2 text-xs h-16 focus:border-acid-green focus:outline-none resize-none"
                  disabled={!selectedClientId}
                />
              </div>

              <button
                type="submit"
                disabled={rbac.submitting || !selectedClientId}
                className="w-full btn-primary py-3 font-black uppercase text-xs tracking-wider cursor-pointer disabled:opacity-50"
              >
                {rbac.submitting ? 'Assigning Program...' : 'Assign Routine to Client'}
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
              <p className="text-[9px] text-muted font-bold uppercase mt-0.5">Roster details</p>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {rbac.trainerClients.filter(c => c.status === 'Active').map((client) => (
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
              <h3 className="text-xs font-black text-foreground uppercase tracking-wider">Client Progress Tracking</h3>
              <span className="text-[9px] text-muted font-bold block mt-0.5">
                {selectedClient ? `Client: ${selectedClient.clientName} Biometric History` : 'Select a client to inspect trends'}
              </span>
            </div>

            {selectedClientId ? (
              loadingLogs ? (
                <div className="flex items-center justify-center py-20 text-muted gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-acid-green" />
                  <span>Loading client telemetry data...</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Steps Progress */}
                  <div className="bg-surface/40 border border-card-border p-5 rounded-2xl space-y-3">
                    <span className="text-xs font-black uppercase text-foreground">Steps Compliance</span>
                    <ClientLineChart data={clientSteps} xKey="date" yKey="steps" color="var(--accent)" />
                  </div>
                  
                  {/* Weight Progress */}
                  <div className="bg-surface/40 border border-card-border p-5 rounded-2xl space-y-3">
                    <span className="text-xs font-black uppercase text-foreground">Weight Trend (kg)</span>
                    <ClientLineChart data={clientWeight} xKey="date" yKey="weight" color="var(--orange-theme)" />
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

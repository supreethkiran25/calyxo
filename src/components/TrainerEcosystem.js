"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { useEcosystemStore } from '../store/useEcosystemStore';
import { saveEcosystemState } from '../lib/dbService';
import { Users, User as UserIcon, Dumbbell, BookOpen, Plus, Trash2, Check, Star, ShieldAlert, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Client Base
const MOCK_CLIENTS = [
  { id: 'client_aarav', name: 'Aarav Sharma', goal: 'Fat Loss', compliance: 92, weight: 82, height: 180, calTarget: 1800, protTarget: 140, level: 12 },
  { id: 'client_ananya', name: 'Ananya Iyer', goal: 'Muscle Gain', compliance: 85, weight: 58, height: 162, calTarget: 2200, protTarget: 110, level: 7 },
  { id: 'client_vikram', name: 'Vikram Malhotra', goal: 'Endurance', compliance: 78, weight: 74, height: 175, calTarget: 2500, protTarget: 120, level: 15 },
];

export default function TrainerEcosystem({ onNotification }) {
  const user = useStore(state => state.user);
  const userProfile = useStore(state => state.userProfile);
  const updateUserProfile = useStore(state => state.updateUserProfile);
  const ecoStore = useEcosystemStore();
  const userId = user?.uid;

  // Selected Client
  const [selectedClient, setSelectedClient] = useState(MOCK_CLIENTS[0]);
  
  // Assignment Form inputs
  const [workoutName, setWorkoutName] = useState('');
  const [workoutSets, setWorkoutSets] = useState('3');
  const [workoutReps, setWorkoutReps] = useState('10');
  const [workoutCategory, setWorkoutCategory] = useState('Strength');
  
  const [mealName, setMealName] = useState('');
  const [mealCalories, setMealCalories] = useState('');
  const [mealProtein, setMealProtein] = useState('');

  // Active Client Role (Trainer or Dietitian or Admin)
  const currentRole = userProfile?.role || 'user';

  const handleRoleToggle = async (newRole) => {
    updateUserProfile({ role: newRole });
    if (onNotification) onNotification(`Switched role to ${newRole.toUpperCase()} 👤`);
  };

  const getClientAssignments = (clientId) => {
    const assignments = ecoStore.clientAssignments || {};
    return assignments[clientId] || { workouts: [], meals: [] };
  };

  const handleAssignWorkout = async (e) => {
    e.preventDefault();
    if (!workoutName.trim()) return;

    const newWorkout = {
      id: Date.now(),
      name: workoutName.trim(),
      sets: Number(workoutSets),
      reps: Number(workoutReps),
      category: workoutCategory,
      assignedAt: new Date().toLocaleDateString()
    };

    const currentAssignments = ecoStore.clientAssignments || {};
    const clientData = currentAssignments[selectedClient.id] || { workouts: [], meals: [] };
    
    const updatedAssignments = {
      ...currentAssignments,
      [selectedClient.id]: {
        ...clientData,
        workouts: [...clientData.workouts, newWorkout]
      }
    };

    ecoStore.syncEcosystemState({ clientAssignments: updatedAssignments });
    await saveEcosystemState(userId, useEcosystemStore.getState());
    
    setWorkoutName('');
    if (onNotification) onNotification(`Assigned workout "${newWorkout.name}" to ${selectedClient.name}! 🏋️`);
  };

  const handleAssignMeal = async (e) => {
    e.preventDefault();
    if (!mealName.trim() || !mealCalories.trim()) return;

    const newMeal = {
      id: Date.now(),
      name: mealName.trim(),
      calories: Number(mealCalories),
      protein: mealProtein ? Number(mealProtein) : 0,
      assignedAt: new Date().toLocaleDateString()
    };

    const currentAssignments = ecoStore.clientAssignments || {};
    const clientData = currentAssignments[selectedClient.id] || { workouts: [], meals: [] };
    
    const updatedAssignments = {
      ...currentAssignments,
      [selectedClient.id]: {
        ...clientData,
        meals: [...clientData.meals, newMeal]
      }
    };

    ecoStore.syncEcosystemState({ clientAssignments: updatedAssignments });
    await saveEcosystemState(userId, useEcosystemStore.getState());
    
    setMealName('');
    setMealCalories('');
    setMealProtein('');
    if (onNotification) onNotification(`Assigned meal "${newMeal.name}" to ${selectedClient.name}! 🍽️`);
  };

  const handleRemoveAssignment = async (clientId, type, id) => {
    const currentAssignments = ecoStore.clientAssignments || {};
    const clientData = currentAssignments[clientId] || { workouts: [], meals: [] };
    
    const updatedAssignments = {
      ...currentAssignments,
      [clientId]: {
        ...clientData,
        [type]: clientData[type].filter(item => item.id !== id)
      }
    };

    ecoStore.syncEcosystemState({ clientAssignments: updatedAssignments });
    await saveEcosystemState(userId, useEcosystemStore.getState());
    if (onNotification) onNotification(`Removed assigned ${type === 'workouts' ? 'workout' : 'meal'} item.`);
  };

  const activeAssignments = getClientAssignments(selectedClient.id);

  // If role is user, show premium sales lock screen
  if (currentRole === 'user') {
    return (
      <div className="space-y-6 pb-24">
        <div className="flex justify-between items-center border-b border-card-border pb-3">
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl font-black text-foreground uppercase tracking-wider leading-tight truncate">Trainer & Dietitian Ecosystem</h1>
            <p className="text-[10px] sm:text-xs text-muted font-medium mt-0.5 truncate">Collaborative remote client nutrition and exercise coaching portals</p>
          </div>
        </div>

        <div className="glass p-8 rounded-2xl border border-card-border text-center max-w-lg mx-auto space-y-6 my-10 shadow-lg">
          <ShieldAlert className="w-12 h-12 text-acid-green/60 mx-auto animate-pulse" />
          <div className="space-y-2">
            <h3 className="text-md font-black text-foreground uppercase tracking-wider">Access Trainer Hub</h3>
            <p className="text-xs text-muted leading-relaxed">The Calyxo Trainer Ecosystem enables certified personal trainers, nutritionists, and dietitian professionals to monitor client calories, checkin compliance, and assign custom workout/diet regimes remotely.</p>
          </div>

          <div className="p-4 bg-surface rounded-xl border border-card-border/60 text-left">
            <span className="text-[10px] text-acid-green font-black uppercase tracking-wider block mb-2">Reviewer Quick Pass</span>
            <p className="text-[11px] text-foreground/80 leading-relaxed mb-3">You can unlock this Trainer & Dietitian hub immediately by switching your role in the selector below:</p>
            
            <div className="grid grid-cols-3 gap-2">
              {['trainer', 'dietitian', 'admin'].map(roleOpt => (
                <button
                  key={roleOpt}
                  onClick={() => handleRoleToggle(roleOpt)}
                  className="bg-acid-green text-accent-foreground py-2 rounded-lg font-black text-[10px] uppercase tracking-wider hover:opacity-90 transition-all border-none cursor-pointer"
                >
                  {roleOpt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-card-border pb-3">
        <div className="min-w-0 w-full sm:w-auto">
          <h1 className="text-base sm:text-xl font-black text-foreground uppercase tracking-wider flex items-center gap-2 leading-tight truncate">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-acid-green shrink-0" />
            <span className="truncate">Trainer & Dietitian Ecosystem</span>
          </h1>
          <p className="text-[10px] sm:text-xs text-muted font-medium mt-0.5 truncate">Actively monitoring clients as a Calyxo Professional</p>
        </div>

        {/* Role Toggle Switcher */}
        <div className="flex items-center gap-2 bg-surface border border-card-border p-1 rounded-xl shrink-0">
          <span className="text-[9px] text-muted font-bold uppercase tracking-wider px-2">Role:</span>
          {['user', 'trainer', 'dietitian', 'admin'].map(roleOpt => (
            <button
              key={roleOpt}
              onClick={() => handleRoleToggle(roleOpt)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer border-none ${
                currentRole === roleOpt
                  ? 'bg-acid-green text-accent-foreground shadow-sm'
                  : 'text-muted hover:text-foreground bg-transparent'
              }`}
            >
              {roleOpt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Column: Client List (1/4 screen) */}
        <div className="glass p-5 rounded-2xl border border-card-border space-y-4 lg:col-span-1">
          <span className="text-[10px] text-muted font-bold uppercase tracking-wider block">My Clients Directory</span>
          
          <div className="flex flex-col gap-2">
            {MOCK_CLIENTS.map(client => {
              const isSelected = selectedClient.id === client.id;
              return (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-acid-green/10 border-acid-green/30 text-foreground'
                      : 'bg-surface/50 border-card-border text-muted hover:text-foreground'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black uppercase tracking-wide truncate block">{client.name}</span>
                    <span className="text-[8px] bg-black/30 border border-card-border text-acid-green px-1.5 py-0.5 rounded-md font-bold uppercase">
                      Lvl {client.level}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2.5 text-[10px] font-medium">
                    <span>Goal: {client.goal}</span>
                    <span className="text-acid-green font-bold">{client.compliance}% Compliance</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Columns: Client Details & Operations (3/4 screen) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Client Bio Header Card */}
          <div className="glass p-6 rounded-2xl border border-card-border shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-acid-green/10 border border-acid-green/20 flex items-center justify-center text-acid-green">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-md font-black text-foreground uppercase tracking-wider">{selectedClient.name}</h2>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] text-muted font-bold">
                  <span>Weight: {selectedClient.weight}kg</span>
                  <span>·</span>
                  <span>Height: {selectedClient.height}cm</span>
                  <span>·</span>
                  <span>Daily Limit: {selectedClient.calTarget} kcal</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-center">
              <div className="bg-surface border border-card-border p-3 px-4 rounded-xl">
                <span className="text-[8px] text-muted font-bold uppercase tracking-wider block">Compliance</span>
                <span className="text-lg font-black text-acid-green block mt-0.5">{selectedClient.compliance}%</span>
              </div>
              <div className="bg-surface border border-card-border p-3 px-4 rounded-xl">
                <span className="text-[8px] text-muted font-bold uppercase tracking-wider block">Target Protein</span>
                <span className="text-lg font-black text-foreground block mt-0.5">{selectedClient.protTarget}g</span>
              </div>
            </div>
          </div>

          {/* Operation Tabs (Workouts & Nutrition Assignments) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workout Assignment */}
            {(currentRole === 'trainer' || currentRole === 'admin') && (
              <div className="glass p-5 rounded-2xl border border-card-border shadow-sm space-y-4">
                <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-acid-green" />
                  Assign Custom Workout
                </h3>

                <form onSubmit={handleAssignWorkout} className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Exercise / Routine Name</label>
                    <input
                      type="text"
                      value={workoutName}
                      onChange={(e) => setWorkoutName(e.target.value)}
                      placeholder="e.g. Incline DB Press"
                      className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-acid-green"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Target Sets</label>
                      <input
                        type="number"
                        min="1" max="100"
                        value={workoutSets}
                        onChange={(e) => setWorkoutSets(e.target.value)}
                        className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-acid-green"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Target Reps</label>
                      <input
                        type="number"
                        min="1" max="100"
                        value={workoutReps}
                        onChange={(e) => setWorkoutReps(e.target.value)}
                        className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-acid-green"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Category</label>
                    <select
                      value={workoutCategory}
                      onChange={(e) => setWorkoutCategory(e.target.value)}
                      className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-acid-green"
                    >
                      <option value="Strength">Strength / Resistance</option>
                      <option value="Cardio">Cardio / Endurance</option>
                      <option value="Hypertrophy">Hypertrophy</option>
                      <option value="Mobility">Mobility / Core</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary py-2.5 rounded-xl cursor-pointer border-none font-bold text-xs uppercase tracking-wider shadow-md"
                  >
                    Assign Exercise
                  </button>
                </form>
              </div>
            )}

            {/* Diet / Meal Assignment */}
            {(currentRole === 'dietitian' || currentRole === 'admin') && (
              <div className="glass p-5 rounded-2xl border border-card-border shadow-sm space-y-4">
                <h3 className="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-acid-green" />
                  Assign Meal & Diet Plan
                </h3>

                <form onSubmit={handleAssignMeal} className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Meal Description / Recipe</label>
                    <input
                      type="text"
                      value={mealName}
                      onChange={(e) => setMealName(e.target.value)}
                      placeholder="e.g. Scrambled Eggs & Whole Wheat Toast"
                      className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-acid-green"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Calories (kcal)</label>
                      <input
                        type="number"
                        min="1" max="5000"
                        value={mealCalories}
                        onChange={(e) => setMealCalories(e.target.value)}
                        placeholder="e.g. 450"
                        className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-acid-green"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-muted font-bold uppercase tracking-wider">Protein (g)</label>
                      <input
                        type="number"
                        min="0" max="300"
                        value={mealProtein}
                        onChange={(e) => setMealProtein(e.target.value)}
                        placeholder="e.g. 24"
                        className="w-full bg-[var(--input)] border border-card-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-acid-green"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary py-2.5 rounded-xl cursor-pointer border-none font-bold text-xs uppercase tracking-wider shadow-md"
                  >
                    Assign Meal Plan
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Assigned Items List Section */}
          <div className="glass p-6 rounded-2xl border border-card-border shadow-md space-y-4">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">
              📋 Active Assignments for {selectedClient.name}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Workout Assignments List */}
              <div className="bg-surface/50 border border-card-border p-4 rounded-xl space-y-3 shadow-inner">
                <span className="text-[9px] text-muted font-bold uppercase tracking-wider block border-b border-card-border/60 pb-1.5">Assigned Workouts</span>
                
                {activeAssignments.workouts.length === 0 ? (
                  <span className="text-[10px] text-muted font-medium block py-4 text-center">No assigned workouts active.</span>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {activeAssignments.workouts.map(workout => (
                      <div key={workout.id} className="flex justify-between items-center bg-black/25 p-2.5 rounded-lg border border-card-border/80 text-xs font-black">
                        <div>
                          <div className="text-foreground">{workout.name}</div>
                          <div className="text-[9px] text-muted mt-0.5 font-medium">{workout.category} · {workout.sets} sets x {workout.reps} reps</div>
                        </div>
                        <button
                          onClick={() => handleRemoveAssignment(selectedClient.id, 'workouts', workout.id)}
                          className="text-muted hover:text-destructive p-1 hover:bg-black/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Meal Assignments List */}
              <div className="bg-surface/50 border border-card-border p-4 rounded-xl space-y-3 shadow-inner">
                <span className="text-[9px] text-muted font-bold uppercase tracking-wider block border-b border-card-border/60 pb-1.5">Assigned Meals</span>
                
                {activeAssignments.meals.length === 0 ? (
                  <span className="text-[10px] text-muted font-medium block py-4 text-center">No assigned meals active.</span>
                ) : (
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {activeAssignments.meals.map(meal => (
                      <div key={meal.id} className="flex justify-between items-center bg-black/25 p-2.5 rounded-lg border border-card-border/80 text-xs font-black">
                        <div>
                          <div className="text-foreground">{meal.name}</div>
                          <div className="text-[9px] text-muted mt-0.5 font-medium">{meal.calories} kcal · {meal.protein}g protein</div>
                        </div>
                        <button
                          onClick={() => handleRemoveAssignment(selectedClient.id, 'meals', meal.id)}
                          className="text-muted hover:text-destructive p-1 hover:bg-black/10 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

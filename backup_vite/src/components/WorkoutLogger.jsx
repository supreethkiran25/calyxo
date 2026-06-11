import React, { useState, useEffect } from 'react';
import { getWorkoutLogs, addWorkoutLog } from '../dbService';

// Weekly Workout Split Template
const INITIAL_WORKOUT_SPLITS = [
  {
    dayName: "Monday",
    workout: {
      type: "Push Day (Chest, Shoulders & Triceps)",
      desc: "Upper body pushing mechanics. Focuses on hypertrophy and strength.",
      exercises: [
        { name: "Incline Dumbbell Bench Press", details: "4 sets × 8-10 reps. Focus on slow control." },
        { name: "Overhead Barbell Press", details: "3 sets × 8 reps. Core tight, neutral neck." },
        { name: "Tricep Parallel Dips", details: "3 sets × 12 reps. Keep chest leaned forward." }
      ]
    }
  },
  {
    dayName: "Tuesday",
    workout: {
      type: "Pull Day (Back, Biceps & Rear Delts)",
      desc: "Upper body pulling. Prioritize progressive overload and clean squeeze.",
      exercises: [
        { name: "Weighted Pull-ups / Lat Pulldown", details: "4 sets × 8-10 reps. Full stretch at top." },
        { name: "Bent Over Barbell Rows", details: "4 sets × 8 reps. Keep spine neutral." },
        { name: "Dumbbell Alternate Bicep Curls", details: "3 sets × 12 reps per arm." }
      ]
    }
  },
  {
    dayName: "Wednesday",
    workout: {
      type: "Leg Day (Quads, Hamstrings & Calves)",
      desc: "Lower body strength and conditioning. Compound movements for maximum activation.",
      exercises: [
        { name: "Barbell Back Squats", details: "4 sets × 6-8 reps. Target deep parallel depth." },
        { name: "Romanian Deadlifts (RDLs)", details: "4 sets × 10 reps. Feel hamstring stretch." },
        { name: "Standing Calf Raises", details: "4 sets × 15 reps. Peak hold for 2 seconds." }
      ]
    }
  },
  {
    dayName: "Thursday",
    workout: {
      type: "Active Recovery & Core Conditioning",
      desc: "Low intensity core stabilization and active aerobic recovery.",
      exercises: [
        { name: "Plank Hold", details: "3 sets × 60 seconds. Core and glutes fully braced." },
        { name: "Hanging Knee / Leg Raises", details: "3 sets × 15 reps. Slow leg descent." },
        { name: "Steady-state Incline Walk", details: "30 mins. Keep heart rate around 125 BPM." }
      ]
    }
  },
  {
    dayName: "Friday",
    workout: {
      type: "Upper Body Hypertrophy",
      desc: "Shoulder width, back density, and arm pump volume routine.",
      exercises: [
        { name: "Dumbbell Lateral Shoulder Raises", details: "4 sets × 15 reps. Control descent." },
        { name: "Seated Dumbbell Shoulder Press", details: "4 sets × 10 reps. Avoid elbow flare." },
        { name: "Hammer Curls & Skullcrushers", details: "3 sets × 12 reps. Volume pump superset." }
      ]
    }
  },
  {
    dayName: "Saturday",
    workout: {
      type: "Lower Body & Power Day",
      desc: "Explosive mechanics, glute activation, and calves conditioning.",
      exercises: [
        { name: "Barbell Hip Thrusts", details: "4 sets × 10 reps. Hold contraction for 1 sec." },
        { name: "Heavy Leg Press", details: "3 sets × 10 reps. Focus on deep leg flex." },
        { name: "Standing Calf Raises", details: "3 sets × 20 reps. Perform quick full extensions." }
      ]
    }
  },
  {
    dayName: "Sunday",
    workout: {
      type: "Rest & Active Mobilization",
      desc: "Hydration, active stretching, and parasympathetic system recovery.",
      exercises: [
        { name: "Full Body Static Stretching", details: "15 minutes. Focus on lower back and hips." },
        { name: "Deep Breathing / Meditation", details: "10 minutes. Calms nervous system." }
      ]
    }
  }
];

function WorkoutLogger({ userId, onNotification }) {
  const [logs, setLogs] = useState([]);
  
  // Custom Logger Form fields
  const [exName, setExName] = useState('');
  const [exCategory, setExCategory] = useState('Strength');
  const [exSets, setExSets] = useState('');
  const [exReps, setExReps] = useState('');
  const [exWeight, setExWeight] = useState('');
  const [exDuration, setExDuration] = useState('');
  const [loading, setLoading] = useState(false);

  // Weekly Splits state
  const [activeDay, setActiveDay] = useState(0);
  const [splits, setSplits] = useState(INITIAL_WORKOUT_SPLITS);
  const [editingSplit, setEditingSplit] = useState(false);
  const [editRoutineFields, setEditRoutineFields] = useState({ type: '', desc: '', exercises: [] });

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!userId) return;
      const data = await getWorkoutLogs(userId);
      setLogs(data || []);
    };
    fetchWorkouts();
  }, [userId]);

  const handleWorkoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const workoutItem = {
      name: exName,
      category: exCategory,
      sets: exSets ? Number(exSets) : 0,
      reps: exReps ? Number(exReps) : 0,
      weight: exWeight ? Number(exWeight) : 0,
      duration: exDuration ? Number(exDuration) : 0
    };

    const saved = await addWorkoutLog(userId, workoutItem);
    setLogs([saved, ...logs]);
    
    // Clear form
    setExName('');
    setExSets('');
    setExReps('');
    setExWeight('');
    setExDuration('');
    setLoading(false);

    onNotification(`Logged exercise: ${workoutItem.name}`);
  };

  const handleStartEditSplit = () => {
    const activeSplit = splits[activeDay].workout;
    setEditRoutineFields({
      type: activeSplit.type,
      desc: activeSplit.desc,
      exercises: activeSplit.exercises.map(x => ({ ...x }))
    });
    setEditingSplit(true);
  };

  const handleSaveSplitEdit = () => {
    const updatedSplits = [...splits];
    updatedSplits[activeDay].workout = {
      type: editRoutineFields.type,
      desc: editRoutineFields.desc,
      exercises: editRoutineFields.exercises.map(x => ({ ...x }))
    };
    setSplits(updatedSplits);
    setEditingSplit(false);
    onNotification("Suggested workout split updated.");
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* 1. Workout Logger Form */}
      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-2">Workout Logger</h2>
        <p className="text-gray-400 text-xs mb-4">Record sets, reps, and cardiovascular work</p>

        <form onSubmit={handleWorkoutSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Exercise Name</label>
              <input 
                type="text"
                value={exName}
                onChange={(e) => setExName(e.target.value)}
                placeholder="e.g. Incline Bench Press"
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-neon-green"
                required
              />
            </div>
            
            <div className="flex flex-col space-y-1">
              <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Category</label>
              <select
                value={exCategory}
                onChange={(e) => setExCategory(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-neon-green"
              >
                <option value="Strength">Strength</option>
                <option value="Cardio">Cardio / HIIT</option>
                <option value="Hypertrophy">Hypertrophy</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col space-y-1">
              <label className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Sets</label>
              <input 
                type="number"
                value={exSets}
                onChange={(e) => setExSets(e.target.value)}
                placeholder="4"
                className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-center text-xs text-white focus:outline-none focus:border-neon-green"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Reps</label>
              <input 
                type="number"
                value={exReps}
                onChange={(e) => setExReps(e.target.value)}
                placeholder="10"
                className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-center text-xs text-white focus:outline-none focus:border-neon-green"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Weight</label>
              <input 
                type="number"
                value={exWeight}
                onChange={(e) => setExWeight(e.target.value)}
                placeholder="kg"
                className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-center text-xs text-white focus:outline-none focus:border-neon-green"
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="text-[8px] text-gray-400 font-bold uppercase tracking-wider">Mins</label>
              <input 
                type="number"
                value={exDuration}
                onChange={(e) => setExDuration(e.target.value)}
                placeholder="mins"
                className="bg-white/5 border border-white/10 rounded-xl px-2 py-2 text-center text-xs text-white focus:outline-none focus:border-neon-green"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold text-xs py-3 rounded-xl cursor-pointer hover:bg-neon-green active:scale-98 transition-all"
          >
            {loading ? "Logging..." : "Approve & Log Workout"}
          </button>
        </form>
      </section>

      {/* 2. Today's Logged Timeline */}
      <section className="glass rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Logged Workouts Timeline</h2>
        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
          {logs.length > 0 ? (
            logs.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white/3 border border-white/5 px-4 py-3 rounded-xl">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">{item.name}</span>
                  <span className="text-[9px] text-gray-400 mt-0.5">Category: {item.category}</span>
                </div>
                <div className="text-xs font-bold text-neon-green">
                  {item.category === "Cardio" ? `${item.duration} Mins` : `${item.sets} Sets × ${item.reps} Reps (${item.weight}kg)`}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-xs text-gray-500 py-8">
              No exercise routines logged today.
            </div>
          )}
        </div>
      </section>

      {/* 3. Weekly Splits Planner */}
      <section className="glass rounded-2xl p-6">
        <div className="flex gap-2 overflow-x-auto pb-3 border-b border-white/5 mb-4 scrollbar-none">
          {splits.map((day, idx) => (
            <button 
              key={idx}
              onClick={() => {
                setActiveDay(idx);
                setEditingSplit(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-colors ${activeDay === idx ? 'bg-neon-green text-black' : 'bg-white/5 text-gray-400 hover:text-white'}`}
            >
              {day.dayName.substring(0, 3)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {editingSplit ? (
            // Edit routine panel
            <div className="space-y-3 p-4 bg-white/3 rounded-xl border border-white/10">
              <div className="flex flex-col space-y-1">
                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Routine Type</label>
                <input 
                  type="text" 
                  value={editRoutineFields.type}
                  onChange={(e) => setEditRoutineFields({ ...editRoutineFields, type: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Description</label>
                <input 
                  type="text" 
                  value={editRoutineFields.desc}
                  onChange={(e) => setEditRoutineFields({ ...editRoutineFields, desc: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              
              <div className="space-y-3 pt-2">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Exercises Recommended</span>
                {editRoutineFields.exercises.map((ex, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      value={ex.name}
                      onChange={(e) => {
                        const nextEx = [...editRoutineFields.exercises];
                        nextEx[i].name = e.target.value;
                        setEditRoutineFields({ ...editRoutineFields, exercises: nextEx });
                      }}
                      placeholder="Ex Name"
                      className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white flex-1"
                    />
                    <input 
                      type="text" 
                      value={ex.details}
                      onChange={(e) => {
                        const nextEx = [...editRoutineFields.exercises];
                        nextEx[i].details = e.target.value;
                        setEditRoutineFields({ ...editRoutineFields, exercises: nextEx });
                      }}
                      placeholder="Sets / Reps info"
                      className="bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white w-32"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button onClick={() => setEditingSplit(false)} className="text-[10px] text-gray-400 py-1.5 px-3 bg-white/5 rounded-lg cursor-pointer">Cancel</button>
                <button onClick={handleSaveSplitEdit} className="text-[10px] text-black bg-neon-green py-1.5 px-4 rounded-lg font-bold cursor-pointer">Save Routine</button>
              </div>
            </div>
          ) : (
            // Display split card
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-neon-green font-bold uppercase tracking-wider">Routine Type</span>
                <button 
                  onClick={handleStartEditSplit}
                  className="text-[10px] text-gray-400 hover:text-white cursor-pointer"
                >
                  Edit Routine
                </button>
              </div>
              <h3 className="text-sm font-bold text-white">{splits[activeDay].workout.type}</h3>
              <p className="text-[10.5px] text-gray-400 mt-1 leading-relaxed">{splits[activeDay].workout.desc}</p>
              
              <div className="mt-4 border-t border-white/5 pt-3 space-y-3">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Routine Exercises:</span>
                {splits[activeDay].workout.exercises.map((ex, i) => (
                  <div key={i} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-white">{ex.name}</span>
                    <span className="text-gray-400 text-[11px]">{ex.details}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
}

export default WorkoutLogger;

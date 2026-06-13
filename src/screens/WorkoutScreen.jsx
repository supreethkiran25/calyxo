import React, { useState } from "react";
import { COLORS, GRADIENTS } from "../theme/colors";
import { GlassCard, ProgressBar, Tag } from "../components/Common";
import { WORKOUTS_DB } from "../data/mockData";
import { useWorkoutGenerator } from "../hooks/useWorkoutGenerator";

export default function WorkoutScreen() {
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [selectedDiff, setSelectedDiff] = useState("All");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("Library");
  const { generateWorkout, isGenerating } = useWorkoutGenerator();
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const muscles = ["All", "Chest", "Back", "Shoulders", "Legs", "Arms", "Core", "Full Body"];
  const diffs = ["All", "Beginner", "Intermediate", "Advanced"];

  const filtered = WORKOUTS_DB.filter(w =>
    (selectedMuscle === "All" || w.muscle === selectedMuscle) &&
    (selectedDiff === "All" || w.difficulty === selectedDiff) &&
    (search === "" || w.name.toLowerCase().includes(search.toLowerCase()))
  );

  const handleGenerate = async () => {
    const plan = await generateWorkout({
      goal: "Muscle Gain",
      duration: 45,
      equipment: "Gym",
      muscleGroup: selectedMuscle
    });
    setGeneratedPlan(plan);
  };

  if (selectedWorkout) {
    return (
      <div style={{ padding: "0 16px 90px", overflowY: "auto", height: "100%" }}>
        <div style={{ paddingTop: 52, marginBottom: 20 }}>
          <button onClick={() => setSelectedWorkout(null)} style={{ background: "none", border: "none", color: COLORS.accent, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            ← Back
          </button>
        </div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>{selectedWorkout.emoji}</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.text, marginBottom: 8 }}>{selectedWorkout.name}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            <Tag label={selectedWorkout.muscle} color={COLORS.accent} />
            <Tag label={selectedWorkout.difficulty} color={COLORS.accentSecondary} />
            <Tag label={selectedWorkout.equipment} color={COLORS.accentFire} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { label: "Sets", val: selectedWorkout.sets || "3" },
            { label: "Reps", val: selectedWorkout.reps || "10-12" },
            { label: "Rest", val: selectedWorkout.rest || "60s" },
            { label: "Duration", val: `${selectedWorkout.duration}m` },
            { label: "Calories", val: `${selectedWorkout.calories}` },
            { label: "Target", val: selectedWorkout.sub },
          ].map(s => (
            <GlassCard key={s.label} style={{ textAlign: "center", padding: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.accent }}>{s.val}</div>
              <div style={{ fontSize: 10, color: COLORS.textMuted }}>{s.label}</div>
            </GlassCard>
          ))}
        </div>

        <GlassCard style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px" }}>About</div>
          <div style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 1.6 }}>{selectedWorkout.desc}</div>
        </GlassCard>

        <GlassCard style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, marginBottom: 12, textTransform: "uppercase", letterSpacing: "1px" }}>How to Execute</div>
          <div style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 1.7 }}>{selectedWorkout.instructions}</div>
        </GlassCard>

        <button style={{
          width: "100%", padding: "18px", borderRadius: 16, border: "none",
          background: GRADIENTS.green, color: "#000", fontSize: 16, fontWeight: 800, cursor: "pointer",
        }}>
          Start Exercise 🔥
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "52px 16px 12px", background: COLORS.bgCard, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.text, marginBottom: 16 }}>Workout Library</div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          {["Library", "Generator", "Schedule"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
              background: tab === t ? COLORS.accent : "rgba(255,255,255,0.06)",
              color: tab === t ? "#000" : COLORS.textMuted,
              transition: "all 0.2s ease",
            }}>{t}</button>
          ))}
        </div>

        <input
          placeholder="🔍 Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${COLORS.border}`,
            background: COLORS.bgElevated, color: COLORS.text, fontSize: 14, boxSizing: "border-box",
            outline: "none",
          }}
        />
      </div>

      {tab === "Library" && (
        <>
          <div style={{ padding: "12px 16px 0", overflowX: "auto" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {muscles.map(m => (
                <button key={m} onClick={() => setSelectedMuscle(m)} style={{
                  whiteSpace: "nowrap", padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                  background: selectedMuscle === m ? COLORS.accent : "rgba(255,255,255,0.06)",
                  color: selectedMuscle === m ? "#000" : COLORS.textMuted,
                  flexShrink: 0,
                }}>{m}</button>
              ))}
            </div>
          </div>
          <div style={{ padding: "8px 16px 0", display: "flex", gap: 8, overflowX: "auto" }}>
            {diffs.map(d => (
              <button key={d} onClick={() => setSelectedDiff(d)} style={{
                whiteSpace: "nowrap", padding: "6px 12px", borderRadius: 8, border: `1px solid ${selectedDiff === d ? COLORS.accentSecondary : COLORS.border}`,
                background: "transparent", cursor: "pointer", fontSize: 11, fontWeight: 600,
                color: selectedDiff === d ? COLORS.accentSecondary : COLORS.textMuted, flexShrink: 0,
              }}>{d}</button>
            ))}
          </div>
          <div style={{ padding: "12px 16px 90px", overflowY: "auto", flex: 1 }}>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 12 }}>{filtered.length} exercises</div>
            {filtered.map(w => (
              <WorkoutCard key={w.id} workout={w} onSelect={setSelectedWorkout} />
            ))}
          </div>
        </>
      )}

      {tab === "Generator" && (
        <div style={{ padding: "16px", flex: 1, overflowY: "auto", paddingBottom: 90 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>AI Workout Generator</div>
          <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 24 }}>Get a custom plan based on your current goal and available equipment.</div>

          <button onClick={handleGenerate} disabled={isGenerating} style={{
            width: "100%", padding: "18px", borderRadius: 16, border: "none",
            background: GRADIENTS.purple, color: "#fff", fontSize: 16, fontWeight: 800,
            cursor: "pointer", marginBottom: 24, opacity: isGenerating ? 0.7 : 1
          }}>
            {isGenerating ? "Analyzing Muscles..." : "⚡ Generate Smart Plan"}
          </button>

          {generatedPlan && (
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>YOUR CUSTOM SESSION</div>
              {generatedPlan.map(w => <WorkoutCard key={w.id} workout={w} onSelect={setSelectedWorkout} />)}
            </div>
          )}
        </div>
      )}
      {tab === "Schedule" && <WorkoutSchedule />}
    </div>
  );
}

function WorkoutCard({ workout, onSelect }) {
  const diffColor = workout.difficulty === "Beginner" ? COLORS.accent : workout.difficulty === "Intermediate" ? COLORS.accentSecondary : COLORS.accentThird;
  return (
    <GlassCard onClick={() => onSelect(workout)} style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 54, height: 54, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(110,231,183,0.1)", fontSize: 26, flexShrink: 0,
        }}>{workout.emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.text, marginBottom: 4 }}>{workout.name}</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Tag label={workout.sub} color={COLORS.accent} />
            <Tag label={workout.equipment} color={COLORS.accentSecondary} />
            <Tag label={workout.difficulty} color={diffColor} />
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accentFire }}>{workout.calories} kcal</div>
          <div style={{ fontSize: 11, color: COLORS.textMuted }}>{workout.duration} min</div>
        </div>
      </div>
    </GlassCard>
  );
}

function WorkoutSchedule() {
  const plan = [
    { day: "Mon", label: "Push (Chest/Shoulders/Tris)", done: true, color: GRADIENTS.green },
    { day: "Tue", label: "Pull (Back/Biceps)", done: true, color: GRADIENTS.blue },
    { day: "Wed", label: "Legs + Glutes", done: false, color: GRADIENTS.fire },
    { day: "Thu", label: "Push (Volume Day)", done: false, color: GRADIENTS.purple },
    { day: "Fri", label: "Pull (Heavy)", done: false, color: GRADIENTS.teal },
    { day: "Sat", label: "Legs (Strength)", done: false, color: GRADIENTS.gold },
    { day: "Sun", label: "Active Recovery", done: false, color: GRADIENTS.pink },
  ];
  return (
    <div style={{ padding: "16px", overflowY: "auto", flex: 1, paddingBottom: 90 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Weekly Schedule</div>
      {plan.map((p, i) => (
        <GlassCard key={p.day} style={{ marginBottom: 10, opacity: p.done ? 1 : 0.85, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: p.done ? GRADIENTS.green : "rgba(255,255,255,0.08)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: p.done ? "#000" : COLORS.textMuted, flexShrink: 0,
          }}>{p.done ? "✓" : p.day}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: p.done ? COLORS.textMuted : COLORS.text, textDecoration: p.done ? "line-through" : "none" }}>{p.label}</div>
            <div style={{ fontSize: 11, color: COLORS.textMuted }}>{p.day}</div>
          </div>
          {!p.done && <div style={{ width: 8, height: 8, borderRadius: 99, background: COLORS.accent }} />}
        </GlassCard>
      ))}
    </div>
  );
}

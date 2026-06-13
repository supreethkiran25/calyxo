import React, { useState, useEffect } from "react";
import { COLORS, GRADIENTS } from "../theme/colors";
import { GlassCard, ProgressRing, ProgressBar, GradientBadge } from "../components/Common";
import { USER, CHALLENGES, WORKOUTS_DB } from "../data/mockData";

export default function HomeScreen() {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { setTimeout(() => setAnimated(true), 100); }, []);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", month: "short", day: "numeric" });
  const calories_consumed = 1840;
  const calories_burned = 420;
  const protein_consumed = 112;
  const water = 2.1;

  const greetings = ["Rise and conquer", "Time to dominate", "Champions never quit", "Outwork everyone"];
  const greeting = greetings[new Date().getHours() % greetings.length];

  return (
    <div style={{ padding: "0 16px 90px", overflowY: "auto", height: "100%" }}>
      {/* Hero Header */}
      <div style={{
        background: `linear-gradient(145deg, #0E1220 0%, #141927 100%)`,
        borderRadius: "0 0 32px 32px", padding: "60px 20px 24px", margin: "0 -16px 20px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(110,231,183,0.05)" }} />
        <div style={{ position: "absolute", top: 20, right: 20, width: 100, height: 100, borderRadius: "50%", background: "rgba(129,140,248,0.08)" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: "2px", marginBottom: 4 }}>{today}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.text, lineHeight: 1.2, marginBottom: 4 }}>{greeting}, {USER.name} 👊</div>
            <div style={{ fontSize: 13, color: COLORS.textMuted }}>Day {USER.streak} streak · Level {USER.level_num}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{
              width: 48, height: 48, borderRadius: 16, background: GRADIENTS.green, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, fontWeight: 900, color: "#000",
            }}>{USER.avatar}</div>
          </div>
        </div>
        {/* Streak & XP */}
        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <div style={{ flex: 1, background: "rgba(251,146,60,0.12)", borderRadius: 14, padding: "10px 14px", border: "1px solid rgba(251,146,60,0.2)" }}>
            <div style={{ fontSize: 11, color: "#FB923C", fontWeight: 600, marginBottom: 2 }}>🔥 STREAK</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.text }}>{USER.streak} <span style={{ fontSize: 12, color: COLORS.textMuted }}>days</span></div>
          </div>
          <div style={{ flex: 1, background: "rgba(129,140,248,0.12)", borderRadius: 14, padding: "10px 14px", border: "1px solid rgba(129,140,248,0.2)" }}>
            <div style={{ fontSize: 11, color: "#818CF8", fontWeight: 600, marginBottom: 2 }}>⚡ XP</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.text }}>{USER.xp.toLocaleString()}</div>
          </div>
          <div style={{ flex: 1, background: "rgba(110,231,183,0.12)", borderRadius: 14, padding: "10px 14px", border: "1px solid rgba(110,231,183,0.2)" }}>
            <div style={{ fontSize: 11, color: COLORS.accent, fontWeight: 600, marginBottom: 2 }}>👟 STEPS</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.text }}>{(USER.steps / 1000).toFixed(1)}<span style={{ fontSize: 12, color: COLORS.textMuted }}>k</span></div>
          </div>
        </div>
      </div>

      {/* Today's Mission */}
      <GlassCard style={{ marginBottom: 16, background: `linear-gradient(135deg, rgba(110,231,183,0.1), rgba(129,140,248,0.05))`, border: `1px solid rgba(110,231,183,0.2)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px" }}>Today's Mission</div>
          <GradientBadge label="Active" gradient={GRADIENTS.green} />
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>Upper Push Day 💪</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>⏱ 45 min</span>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>🔥 380 cal</span>
          <span style={{ fontSize: 12, color: COLORS.textMuted }}>💪 6 exercises</span>
        </div>
        <ProgressBar value={3} max={6} color={COLORS.accent} height={6} />
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6 }}>3 of 6 exercises completed</div>
      </GlassCard>

      {/* Macro Ring Cards */}
      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>Today's Overview</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {[
          { label: "Calories", val: calories_consumed, goal: USER.calories_goal, unit: "kcal", color: COLORS.accentFire, pct: (calories_consumed / USER.calories_goal) * 100 },
          { label: "Protein", val: protein_consumed, goal: USER.protein_goal, unit: "g", color: COLORS.accent, pct: (protein_consumed / USER.protein_goal) * 100 },
          { label: "Burned", val: calories_burned, goal: 500, unit: "kcal", color: COLORS.accentThird, pct: (calories_burned / 500) * 100 },
          { label: "Water", val: water, goal: USER.water_goal, unit: "L", color: COLORS.neonBlue, pct: (water / USER.water_goal) * 100 },
        ].map(m => (
          <GlassCard key={m.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 16 }}>
            <ProgressRing size={72} stroke={6} percent={Math.min(100, m.pct)} color={m.color}>
              <div style={{ fontSize: 10, color: COLORS.textMuted, textAlign: "center", lineHeight: 1.2 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: m.color }}>{m.val}</div>
                <div style={{ fontSize: 9 }}>{m.unit}</div>
              </div>
            </ProgressRing>
            <div style={{ fontSize: 12, color: COLORS.textDim, marginTop: 8, fontWeight: 600 }}>{m.label}</div>
            <div style={{ fontSize: 10, color: COLORS.textMuted }}>/{m.goal}{m.unit}</div>
          </GlassCard>
        ))}
      </div>

      {/* AI Coach Card */}
      <GlassCard style={{ marginBottom: 16, background: "linear-gradient(135deg, rgba(129,140,248,0.12), rgba(168,85,247,0.08))", border: "1px solid rgba(129,140,248,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: GRADIENTS.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🤖</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>AI Coach Says</div>
            <div style={{ fontSize: 11, color: "#818CF8" }}>● Online Now</div>
          </div>
        </div>
        <div style={{ fontSize: 13, color: COLORS.textDim, lineHeight: 1.6, fontStyle: "italic" }}>
          "Arjun, you're 3 reps ahead of last week's chest session. Your body is adapting — time to increase bench by 2.5kg. Let's go! 🔥"
        </div>
      </GlassCard>

      {/* Daily Challenges */}
      <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>Active Challenges</div>
      {CHALLENGES.slice(0, 2).map(c => (
        <GlassCard key={c.id} style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 28 }}>{c.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{c.title}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted }}>{c.desc}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.accent }}>{c.progress}/{c.total}</div>
              <div style={{ fontSize: 10, color: COLORS.textMuted }}>+{c.xp} XP</div>
            </div>
          </div>
          <ProgressBar value={c.progress} max={c.total} color={COLORS.accent} />
        </GlassCard>
      ))}
    </div>
  );
}

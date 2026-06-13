import React, { useState } from "react";
import { COLORS, GRADIENTS } from "../theme/colors";
import { GlassCard } from "../components/Common";

export default function OnboardingScreen({ onFinish }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ goal: "", level: "", weight: 72, height: 178 });

  const goals = [
    { label: "Muscle Gain", icon: "💪", desc: "Build lean muscle mass" },
    { label: "Fat Loss", icon: "🔥", desc: "Burn fat, stay lean" },
    { label: "Strength", icon: "⚡", desc: "Get brutally strong" },
    { label: "Endurance", icon: "🏃", desc: "Run, bike, swim farther" },
  ];

  const levels = [
    { label: "Beginner", icon: "🌱", desc: "Less than 6 months" },
    { label: "Intermediate", icon: "🔥", desc: "6 months – 2 years" },
    { label: "Advanced", icon: "⚡", desc: "2+ years consistent" },
  ];

  const steps = ["Goal", "Level", "Body Stats", "Ready!"];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: COLORS.bg }}>
      <div style={{ padding: "24px 24px 16px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= step ? COLORS.accent : "rgba(255,255,255,0.1)" }} />
          ))}
        </div>
      </div>

      <div style={{ flex: 1, padding: "0 24px", overflowY: "auto" }}>
        {step === 0 && (
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>What's your goal?</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {goals.map(g => (
                <GlassCard key={g.label} onClick={() => setData(d => ({ ...d, goal: g.label }))} style={{
                  border: data.goal === g.label ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{g.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{g.label}</div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}
        {step === 1 && (
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 8 }}>Your fitness level?</div>
            {levels.map(l => (
              <GlassCard key={l.label} onClick={() => setData(d => ({ ...d, level: l.label }))} style={{
                border: data.level === l.label ? `2px solid ${COLORS.accent}` : `1px solid ${COLORS.border}`,
                display: "flex", alignItems: "center", gap: 16, marginBottom: 12
              }}>
                <div style={{ fontSize: 36 }}>{l.icon}</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.text }}>{l.label}</div>
                  <div style={{ fontSize: 13, color: COLORS.textMuted }}>{l.desc}</div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
        {step === 2 && (
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.text, marginBottom: 24 }}>Body Stats</div>
            {[
              { label: "Weight (kg)", key: "weight", min: 40, max: 150, color: COLORS.accent },
              { label: "Height (cm)", key: "height", min: 140, max: 220, color: COLORS.accentSecondary },
            ].map(field => (
              <GlassCard key={field.key} style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ color: COLORS.textDim }}>{field.label}</span>
                  <span style={{ color: field.color, fontWeight: 800, fontSize: 22 }}>{data[field.key]}</span>
                </div>
                <input type="range" min={field.min} max={field.max} value={data[field.key]}
                  onChange={e => setData(d => ({ ...d, [field.key]: +e.target.value }))}
                  style={{ width: "100%", accentColor: field.color }} />
              </GlassCard>
            ))}
          </div>
        )}
        {step === 3 && (
          <div style={{ textAlign: "center", paddingTop: 40 }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>🚀</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.text, marginBottom: 12 }}>You're all set!</div>
            <div style={{ fontSize: 15, color: COLORS.textMuted, marginBottom: 32 }}>
              Everything is ready for your fitness journey.
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: "16px 24px 24px" }}>
        <button onClick={() => step < 3 ? setStep(s => s + 1) : onFinish(data)} style={{
          width: "100%", padding: "18px", borderRadius: 16, border: "none",
          background: GRADIENTS.green, color: "#000", fontSize: 16, fontWeight: 800, cursor: "pointer",
        }}>
          {step < 3 ? "Continue →" : "Enter the Arena 🔥"}
        </button>
      </div>
    </div>
  );
}

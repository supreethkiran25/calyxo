import React, { useState, useRef, useEffect, useCallback } from "react";
import { COLORS, GRADIENTS } from "../theme/colors";
import { GlassCard, Tag } from "../components/Common";
import { USER, AI_MESSAGES, SUGGESTED_PROMPTS, COACH_PERSONALITIES } from "../data/mockData";

export default function AICoachScreen() {
  const [messages, setMessages] = useState(AI_MESSAGES);
  const [input, setInput] = useState("");
  const [personality, setPersonality] = useState("hardcore");
  const [typing, setTyping] = useState(false);
  const [tab, setTab] = useState("Chat");
  const endRef = useRef(null);

  const RESPONSES = {
    "Build me a 6-day PPL split": "Here's your PPL split 🔥\n\nDay 1 – Push (Heavy): Bench, OHP, Incline DB, Cable Fly, Tricep Pushdown\nDay 2 – Pull (Heavy): Deadlift, Weighted Pull-ups, Bent Row, Face Pull, Barbell Curl\nDay 3 – Legs (Heavy): Squat, RDL, Leg Press, Hip Thrust, Calf Raise\nDay 4 – Push (Volume): Incline Press, Lateral Raise, Dips, Cable Fly, Skull Crushers\nDay 5 – Pull (Volume): Lat Pulldown, Cable Row, Rear Delt Fly, Hammer Curl, Preacher Curl\nDay 6 – Legs (Volume): Front Squat, Leg Curl, Leg Extension, Walking Lunges, Hip Abduction\nDay 7 – Rest or Active Recovery",
    "What should I eat for muscle gain at 72kg?": "At 72kg targeting muscle gain 💪\n\nCalories: ~2800-3000 kcal/day (250-300 surplus)\nProtein: 160g+ (2.2g/kg bodyweight)\nCarbs: 350-400g (fuel for lifts)\nFat: 60-80g\n\nTop foods: Chicken breast, eggs, brown rice, oats, sweet potato, Greek yogurt, whey protein, dal, paneer",
  };

  const send = useCallback((text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    setMessages(m => [...m, { role: "user", text: msg, time: "now" }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply = RESPONSES[msg] || `Great question, Arjun! Based on your profile and current ${USER.streak}-day streak, here's my analysis:\n\nYou're making excellent progress toward your ${USER.goal} goal. Keep consistent with your protein targets (${USER.protein_goal}g/day) and progressive overload principles. Your body responds well to volume — push the intensity! 💪🔥`;
      setMessages(m => [...m, { role: "assistant", text: reply, time: "now" }]);
      setTyping(false);
    }, 1800);
  }, [input]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ padding: "52px 16px 12px", background: COLORS.bgCard, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: GRADIENTS.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🤖</div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}>AI Coach</div>
            <div style={{ fontSize: 12, color: "#818CF8" }}>● Online · Powered by FitAI</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <select value={personality} onChange={e => setPersonality(e.target.value)}
              style={{ background: COLORS.bgElevated, border: `1px solid ${COLORS.border}`, color: COLORS.textDim, borderRadius: 10, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>
              {COACH_PERSONALITIES.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Chat", "Plans", "Recommendations"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: tab === t ? "#818CF8" : "rgba(255,255,255,0.06)",
              color: tab === t ? "#fff" : COLORS.textMuted,
            }}>{t}</button>
          ))}
        </div>
      </div>

      {tab === "Chat" && (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
            {messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 16 }}>
                {m.role === "assistant" && (
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: GRADIENTS.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, marginRight: 8, flexShrink: 0, alignSelf: "flex-end" }}>🤖</div>
                )}
                <div style={{
                  maxWidth: "80%", padding: "12px 16px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: m.role === "user" ? GRADIENTS.green : COLORS.bgCard,
                  border: m.role === "user" ? "none" : `1px solid ${COLORS.border}`,
                  color: m.role === "user" ? "#000" : COLORS.textDim,
                  fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-line",
                }}>{m.text}</div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: GRADIENTS.purple, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                <div style={{ background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "12px 16px", display: "flex", gap: 6 }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 8, height: 8, borderRadius: 99, background: "#818CF8", opacity: 0.7, animation: `pulse ${0.8 + i * 0.15}s infinite alternate` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />

            {messages.length < 3 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 10, textTransform: "uppercase", letterSpacing: "1px" }}>Suggested</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SUGGESTED_PROMPTS.map((p, i) => (
                    <button key={i} onClick={() => send(p)} style={{
                      background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)", borderRadius: 12, padding: "10px 14px",
                      color: "#818CF8", fontSize: 13, cursor: "pointer", textAlign: "left",
                    }}>💬 {p}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: "12px 16px", background: COLORS.bgCard, borderTop: `1px solid ${COLORS.border}` }}>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && send()}
                placeholder="Ask your AI coach anything..."
                style={{
                  flex: 1, padding: "12px 16px", borderRadius: 14, border: `1px solid ${COLORS.border}`,
                  background: COLORS.bgElevated, color: COLORS.text, fontSize: 14, outline: "none",
                }}
              />
              <button onClick={() => send()} style={{
                width: 48, height: 48, borderRadius: 14, border: "none",
                background: GRADIENTS.purple, color: "#fff", cursor: "pointer", fontSize: 20, flexShrink: 0,
              }}>↑</button>
            </div>
          </div>
        </>
      )}

      {tab === "Plans" && (
        <div style={{ flex: 1, overflowY: "auto", padding: "16px", paddingBottom: 90 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>AI-Generated Plans</div>
          {[
            { title: "12-Week Muscle Building Program", desc: "PPL structure, progressive overload, periodization", weeks: 12, level: "Intermediate", icon: "💪" },
            { title: "8-Week Fat Loss Protocol", desc: "Deficit training, HIIT integration, cardio programming", weeks: 8, level: "All levels", icon: "🔥" },
          ].map((p, i) => (
            <GlassCard key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 14 }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text, marginBottom: 4 }}>{p.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>{p.desc}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Tag label={`${p.weeks} weeks`} color={COLORS.accent} />
                    <Tag label={p.level} color={COLORS.accentSecondary} />
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

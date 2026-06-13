import React, { useState } from "react";
import { COLORS, GRADIENTS } from "../theme/colors";
import { GlassCard, ProgressBar, GradientBadge } from "../components/Common";
import { USER, BADGES, PROGRESS_DATA } from "../data/mockData";

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [tab, setTab] = useState("Profile");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "52px 16px 12px", background: COLORS.bgCard, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.text, marginBottom: 12 }}>Profile</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Profile", "Progress", "Badges", "Settings"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "7px 14px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: tab === t ? COLORS.accentThird : "rgba(255,255,255,0.06)",
              color: tab === t ? "#fff" : COLORS.textMuted,
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", paddingBottom: 90 }}>
        {tab === "Profile" && (
          <div>
            <GlassCard style={{ textAlign: "center", marginBottom: 20, background: "linear-gradient(135deg, rgba(244,114,182,0.1), rgba(129,140,248,0.08))", border: "1px solid rgba(244,114,182,0.2)" }}>
              <div style={{
                width: 80, height: 80, borderRadius: 24, background: GRADIENTS.green, margin: "0 auto 16px",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 900, color: "#000",
                boxShadow: `0 0 40px rgba(110,231,183,0.3)`,
              }}>{USER.avatar}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.text, marginBottom: 4 }}>{USER.name} Sharma</div>
              <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 12 }}>Intermediate · {USER.goal}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                <GradientBadge label={`Level ${USER.level_num}`} gradient={GRADIENTS.gold} size="md" />
                <GradientBadge label="14-day streak" gradient={GRADIENTS.fire} size="md" />
              </div>
            </GlassCard>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "Weight", val: `${USER.weight} kg`, icon: "⚖️" },
                { label: "Height", val: `${USER.height} cm`, icon: "📏" },
                { label: "BMI", val: USER.bmi, icon: "📊" },
                { label: "Goal", val: USER.goal, icon: "🎯" },
              ].map(s => (
                <GlassCard key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12 }}>
                  <div style={{ fontSize: 24 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, color: COLORS.textMuted }}>{s.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{s.val}</div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {tab === "Progress" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 16 }}>Weight Progress</div>
            <GlassCard style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, padding: "8px 0" }}>
                {PROGRESS_DATA.map((d, i) => {
                  const h = ((d.weight - 70) / 3) * 80 + 20;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 9, color: COLORS.accent, fontWeight: 700 }}>{d.weight}</div>
                      <div style={{ width: "100%", height: h, background: i === PROGRESS_DATA.length - 1 ? COLORS.accent : "rgba(110,231,183,0.3)", borderRadius: "4px 4px 0 0" }} />
                      <div style={{ fontSize: 9, color: COLORS.textMuted }}>{d.week}</div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        )}

        {tab === "Badges" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {BADGES.map(b => (
                <GlassCard key={b.id} style={{ textAlign: "center", opacity: b.earned ? 1 : 0.4 }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>{b.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: b.earned ? COLORS.text : COLORS.textMuted, marginBottom: 4 }}>{b.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>{b.desc}</div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {tab === "Settings" && (
          <div>
            {[
              { label: "Dark Mode", val: darkMode, set: setDarkMode, icon: "🌙" },
              { label: "Workout Notifications", val: notifications, set: setNotifications, icon: "🔔" },
            ].map(s => (
              <GlassCard key={s.label} style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <span style={{ fontSize: 14, color: COLORS.text }}>{s.label}</span>
                </div>
                <div onClick={() => s.set(v => !v)} style={{
                  width: 48, height: 26, borderRadius: 99, background: s.val ? COLORS.accent : "rgba(255,255,255,0.15)",
                  position: "relative", cursor: "pointer",
                }}>
                  <div style={{ position: "absolute", top: 3, left: s.val ? 25 : 3, width: 20, height: 20, borderRadius: 99, background: "#fff" }} />
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { COLORS, GRADIENTS } from "../theme/colors";
import { GlassCard, ProgressBar, ProgressRing } from "../components/Common";
import { USER, NUTRITION_DB } from "../data/mockData";

export default function NutritionScreen() {
  const [tab, setTab] = useState("Log");
  const [meals, setMeals] = useState({
    breakfast: [NUTRITION_DB[3], NUTRITION_DB[2]],
    lunch: [NUTRITION_DB[0], NUTRITION_DB[1]],
    dinner: [],
    snacks: [NUTRITION_DB[9] || NUTRITION_DB[0]],
  });
  const [search, setSearch] = useState("");
  const [water, setWater] = useState(2.1);
  const [addTarget, setAddTarget] = useState(null);

  const allMeals = Object.values(meals).flat();
  const totals = allMeals.reduce((a, f) => ({
    calories: a.calories + (f?.calories || 0),
    protein: a.protein + (f?.protein || 0),
    carbs: a.carbs + (f?.carbs || 0),
    fat: a.fat + (f?.fat || 0),
    fiber: a.fiber + (f?.fiber || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  const filtered = NUTRITION_DB.filter(f => search && f.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "52px 16px 12px", background: COLORS.bgCard, borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: COLORS.text, marginBottom: 16 }}>Nutrition Hub</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Log", "Macros", "Water", "Insights"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "8px 16px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
              background: tab === t ? COLORS.accent : "rgba(255,255,255,0.06)",
              color: tab === t ? "#000" : COLORS.textMuted,
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px", paddingBottom: 90 }}>
        {tab === "Log" && (
          <div>
            {/* Daily Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Calories", val: Math.round(totals.calories), goal: USER.calories_goal, unit: "kcal", color: COLORS.accentFire },
                { label: "Protein", val: Math.round(totals.protein), goal: USER.protein_goal, unit: "g", color: COLORS.accent },
                { label: "Carbs", val: Math.round(totals.carbs), goal: 320, unit: "g", color: COLORS.accentSecondary },
                { label: "Fat", val: Math.round(totals.fat), goal: 80, unit: "g", color: COLORS.accentThird },
              ].map(m => (
                <GlassCard key={m.label} style={{ padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>{m.label}</span>
                    <span style={{ fontSize: 11, color: COLORS.textMuted }}>{m.val}/{m.goal}{m.unit}</span>
                  </div>
                  <ProgressBar value={m.val} max={m.goal} color={m.color} />
                </GlassCard>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: "relative", marginBottom: 16 }}>
              <input
                placeholder="🔍 Search foods to add..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${COLORS.border}`,
                  background: COLORS.bgElevated, color: COLORS.text, fontSize: 14, boxSizing: "border-box", outline: "none",
                }}
              />
              {filtered.length > 0 && (
                <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: COLORS.bgCard, border: `1px solid ${COLORS.border}`, borderRadius: 12, zIndex: 10, maxHeight: 200, overflowY: "auto" }}>
                  {filtered.map(f => (
                    <div key={f.id} onClick={() => {
                      const meal = addTarget || "snacks";
                      setMeals(m => ({ ...m, [meal]: [...m[meal], f] }));
                      setSearch("");
                    }} style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${COLORS.border}`, display: "flex", justifyContent: "space-between" }}
                    >
                      <span style={{ fontSize: 13, color: COLORS.text }}>{f.name}</span>
                      <span style={{ fontSize: 12, color: COLORS.accentFire }}>{f.calories} kcal</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Meal Sections */}
            {[
              { key: "breakfast", label: "🌅 Breakfast" },
              { key: "lunch", label: "☀️ Lunch" },
              { key: "dinner", label: "🌙 Dinner" },
              { key: "snacks", label: "🍎 Snacks" },
            ].map(section => (
              <GlassCard key={section.key} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{section.label}</div>
                  <button onClick={() => { setAddTarget(section.key); document.querySelector('input[placeholder*="Search foods"]')?.focus(); }}
                    style={{ background: "rgba(110,231,183,0.15)", border: "none", borderRadius: 8, padding: "6px 12px", color: COLORS.accent, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>+ Add</button>
                </div>
                {meals[section.key].length === 0 ? (
                  <div style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center", padding: "12px 0" }}>No foods logged yet</div>
                ) : meals[section.key].map((f, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: i === 0 ? "none" : `1px solid ${COLORS.border}` }}>
                    <div>
                      <div style={{ fontSize: 13, color: COLORS.text }}>{f?.name}</div>
                      <div style={{ fontSize: 11, color: COLORS.textMuted }}>P:{f?.protein}g C:{f?.carbs}g F:{f?.fat}g</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accentFire }}>{f?.calories} kcal</div>
                  </div>
                ))}
              </GlassCard>
            ))}
          </div>
        )}

        {tab === "Macros" && (
          <div>
            <GlassCard style={{ marginBottom: 16, textAlign: "center" }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>CALORIES TODAY</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: COLORS.accentFire }}>{Math.round(totals.calories)}</div>
              <div style={{ fontSize: 14, color: COLORS.textMuted }}>of {USER.calories_goal} kcal goal</div>
              <div style={{ marginTop: 12 }}>
                <ProgressBar value={totals.calories} max={USER.calories_goal} color={COLORS.accentFire} height={10} />
              </div>
            </GlassCard>

            {[
              { label: "🍗 Protein", val: Math.round(totals.protein), goal: USER.protein_goal, unit: "g", color: COLORS.accent, cal: Math.round(totals.protein * 4) },
              { label: "🍚 Carbohydrates", val: Math.round(totals.carbs), goal: 320, unit: "g", color: COLORS.accentSecondary, cal: Math.round(totals.carbs * 4) },
              { label: "🥑 Fats", val: Math.round(totals.fat), goal: 80, unit: "g", color: COLORS.accentThird, cal: Math.round(totals.fat * 9) },
            ].map(m => (
              <GlassCard key={m.label} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: COLORS.text }}>{m.label}</span>
                  <span style={{ fontSize: 13, color: m.color, fontWeight: 700 }}>{m.val}g / {m.goal}g</span>
                </div>
                <ProgressBar value={m.val} max={m.goal} color={m.color} height={8} />
              </GlassCard>
            ))}
          </div>
        )}

        {tab === "Water" && (
          <div>
            <GlassCard style={{ marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontSize: 60, marginBottom: 8 }}>💧</div>
              <div style={{ fontSize: 48, fontWeight: 900, color: COLORS.neonBlue }}>{water.toFixed(1)}</div>
              <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 16 }}>of {USER.water_goal}L goal</div>
              <ProgressRing size={140} stroke={10} percent={(water / USER.water_goal) * 100} color={COLORS.neonBlue}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 900, color: COLORS.neonBlue }}>{Math.round((water / USER.water_goal) * 100)}%</div>
                  <div style={{ fontSize: 10, color: COLORS.textMuted }}>done</div>
                </div>
              </ProgressRing>
            </GlassCard>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[250, 500, 750, 1000].map(ml => (
                <button key={ml} onClick={() => setWater(w => Math.min(USER.water_goal + 1, +(w + ml / 1000).toFixed(1)))} style={{
                  padding: "16px", borderRadius: 14, border: `1px solid ${COLORS.border}`, background: COLORS.bgCard,
                  cursor: "pointer", fontSize: 14, fontWeight: 700, color: COLORS.neonBlue,
                }}>+ {ml}ml</button>
              ))}
            </div>
          </div>
        )}

        {tab === "Insights" && (
          <div>
            <GlassCard style={{ marginBottom: 16, background: "linear-gradient(135deg, rgba(110,231,183,0.1), rgba(129,140,248,0.05))", border: "1px solid rgba(110,231,183,0.2)" }}>
              <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, marginBottom: 8, textTransform: "uppercase" }}>AI Nutrition Analysis</div>
              <div style={{ fontSize: 14, color: COLORS.textDim, lineHeight: 1.7 }}>
                ✅ Protein on track — {Math.round(totals.protein)}g of {USER.protein_goal}g goal<br />
                ⚠️ Carbs slightly low — add 1 cup brown rice<br />
                💡 Add healthy fat source — avocado or nuts<br />
                🔥 You're in a good range today
              </div>
            </GlassCard>

            <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, marginBottom: 12 }}>Smart Meal Suggestions</div>
            {[
              { name: "High-Protein Smoothie", desc: "Whey, banana, almond butter, oats", cal: 450, p: 35 },
              { name: "Quinoa & Roasted Salmon", desc: "Omega-3 rich, high fiber, lean protein", cal: 520, p: 42 },
              { name: "Greek Yogurt Parfait", desc: "Probiotics & slow-digesting protein", cal: 280, p: 24 }
            ].map((meal, i) => (
              <GlassCard key={i} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{meal.name}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>{meal.desc}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.accent }}>{meal.p}g Protein</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>{meal.cal} kcal</div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { COLORS } from "./theme/colors";
import { AuthProvider, useAuth } from "./context/AuthContext";
import SplashScreen from "./screens/SplashScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import WorkoutScreen from "./screens/WorkoutScreen";
import NutritionScreen from "./screens/NutritionScreen";
import AICoachScreen from "./screens/AICoachScreen";
import ProfileScreen from "./screens/ProfileScreen";

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ active, setActive }) {
  const tabs = [
    { id: "home", label: "Home", icon: "🏠" },
    { id: "workout", label: "Workout", icon: "🏋️" },
    { id: "nutrition", label: "Nutrition", icon: "🥗" },
    { id: "coach", label: "AI Coach", icon: "🤖" },
    { id: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      background: "rgba(14,18,32,0.96)", borderTop: `1px solid ${COLORS.border}`,
      backdropFilter: "blur(20px)", display: "flex", padding: "8px 0 20px", zIndex: 100,
    }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setActive(t.id)} style={{
          flex: 1, background: "none", border: "none", cursor: "pointer", padding: "6px 0",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          transition: "all 0.2s ease",
          position: "relative"
        }}>
          <div style={{
            fontSize: active === t.id ? 24 : 20, lineHeight: 1,
            filter: active === t.id ? "none" : "grayscale(100%) opacity(0.4)",
            transition: "all 0.2s ease",
            transform: active === t.id ? "scale(1.15)" : "scale(1)",
          }}>{t.icon}</div>
          <div style={{
            fontSize: 9, fontWeight: active === t.id ? 700 : 400,
            color: active === t.id ? COLORS.accent : COLORS.textMuted,
            letterSpacing: "0.3px",
          }}>{t.label}</div>
          {active === t.id && (
            <div style={{ width: 4, height: 4, borderRadius: 99, background: COLORS.accent, position: "absolute", bottom: 4 }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── MAIN CONTENT WRAPPER ──────────────────────────────────────────────────────
function MainApp() {
  const { user } = useAuth();
  const [screen, setScreen] = useState("splash");
  const [activeTab, setActiveTab] = useState("home");

  // Transitions
  useEffect(() => {
    if (user && screen === "login") {
      setScreen("main");
    }
  }, [user]);

  const renderContent = () => {
    if (screen === "splash") return <SplashScreen onNext={() => setScreen("login")} />;
    if (screen === "login") return <LoginScreen onSignupToggle={() => setScreen("onboarding")} />;
    if (screen === "onboarding") return <OnboardingScreen onFinish={() => setScreen("main")} />;

    if (screen === "main") {
      return (
        <>
          <div style={{ position: "absolute", inset: 0, bottom: 0, overflowY: "hidden" }}>
            {activeTab === "home" && <HomeScreen />}
            {activeTab === "workout" && <WorkoutScreen />}
            {activeTab === "nutrition" && <NutritionScreen />}
            {activeTab === "coach" && <AICoachScreen />}
            {activeTab === "profile" && <ProfileScreen />}
          </div>
          <BottomNav active={activeTab} setActive={setActiveTab} />
        </>
      );
    }
  };

  return (
    <div style={{
      width: "100%", maxWidth: 430, margin: "0 auto", height: "100vh", maxHeight: 900,
      background: COLORS.bg, fontFamily: "'SF Pro Display', -apple-system, sans-serif",
      position: "relative", overflow: "hidden", borderRadius: screen === "main" ? 40 : 0,
      boxShadow: "0 40px 120px rgba(0,0,0,0.8)",
    }}>
      <style>{`
        * { -webkit-font-smoothing: antialiased; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 99px; outline: none; background: rgba(255,255,255,0.1); }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; cursor: pointer; border: 2px solid white; background: #6EE7B7; box-shadow: 0 0 10px rgba(0,0,0,0.3); }
        @keyframes pulse { from { transform: scale(0.95); opacity: 0.7; } to { transform: scale(1); opacity: 1; } }
      `}</style>
      {renderContent()}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

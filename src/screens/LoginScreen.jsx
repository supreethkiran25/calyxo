import React, { useState } from "react";
import { COLORS, GRADIENTS } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import { GlassCard } from "../components/Common";

export default function LoginScreen({ onSignupToggle }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuth();

  const handleLogin = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", padding: "60px 24px", background: COLORS.bg }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: COLORS.text }}>Welcome Back</div>
        <div style={{ fontSize: 14, color: COLORS.textMuted }}>Log in to continue your journey</div>
      </div>

      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8, display: "block" }}>EMAIL ADDRESS</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "16px", borderRadius: 14, border: `1px solid ${COLORS.border}`, background: COLORS.bgElevated, color: COLORS.text, outline: "none" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8, display: "block" }}>PASSWORD</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: "16px", borderRadius: 14, border: `1px solid ${COLORS.border}`, background: COLORS.bgElevated, color: COLORS.text, outline: "none" }}
          />
        </div>

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "18px", borderRadius: 16, border: "none",
          background: GRADIENTS.green, color: "#000", fontSize: 16, fontWeight: 800,
          cursor: "pointer", marginTop: 12, boxShadow: `0 8px 32px rgba(110,231,183,0.3)`,
          opacity: loading ? 0.7 : 1
        }}>
          {loading ? "Authenticating..." : "Log In →"}
        </button>
      </form>

      <div style={{ marginTop: "auto", textAlign: "center" }}>
        <span style={{ fontSize: 14, color: COLORS.textMuted }}>Don't have an account? </span>
        <button onClick={onSignupToggle} style={{ background: "none", border: "none", color: COLORS.accent, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Sign Up</button>
      </div>
    </div>
  );
}

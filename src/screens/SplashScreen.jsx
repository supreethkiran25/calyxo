import React, { useState, useEffect } from "react";
import { COLORS, GRADIENTS } from "../theme/colors";

export default function SplashScreen({ onNext }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: COLORS.bg, padding: "40px 24px" }}>
      <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease", textAlign: "center" }}>
        <div style={{
          width: 100, height: 100, borderRadius: 30, background: GRADIENTS.green, margin: "0 auto 24px",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48,
          boxShadow: `0 0 60px rgba(110,231,183,0.4)`,
        }}>⚡</div>
        <div style={{ fontSize: 42, fontWeight: 900, letterSpacing: "-1px", color: COLORS.text, lineHeight: 1.1, marginBottom: 8 }}>
          FIT<span style={{ background: GRADIENTS.green, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span>
        </div>
        <div style={{ fontSize: 14, color: COLORS.textMuted, letterSpacing: "3px", textTransform: "uppercase", marginBottom: 40 }}>Your AI Fitness Coach</div>

        <button onClick={onNext} style={{
          width: "100%", padding: "18px", borderRadius: 16, border: "none",
          background: GRADIENTS.green, color: "#000", fontSize: 16, fontWeight: 800,
          cursor: "pointer", letterSpacing: "0.5px",
        }}>Let's Get Started →</button>
      </div>
    </div>
  );
}

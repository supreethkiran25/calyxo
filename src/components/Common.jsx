import React from "react";
import { COLORS } from "../theme/colors";

export function ProgressRing({ size = 80, stroke = 6, percent = 70, color = COLORS.accent, bg = "rgba(255,255,255,0.06)", children }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

export function GlassCard({ children, style = {}, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: COLORS.bgCard, border: `1px solid ${COLORS.border}`,
      borderRadius: 20, padding: "16px", backdropFilter: "blur(20px)",
      cursor: onClick ? "pointer" : "default", transition: "all 0.2s ease",
      ...style
    }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = COLORS.borderStrong; e.currentTarget.style.transform = "translateY(-1px)"; } }}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.borderColor = COLORS.border; e.currentTarget.style.transform = "translateY(0)"; } }}
    >
      {children}
    </div>
  );
}

export function GradientBadge({ label, gradient, size = "sm" }) {
  return (
    <span style={{
      background: gradient, color: "#fff", borderRadius: 20,
      padding: size === "sm" ? "2px 10px" : "5px 14px",
      fontSize: size === "sm" ? 10 : 12, fontWeight: 700,
      letterSpacing: "0.5px", textTransform: "uppercase",
    }}>{label}</span>
  );
}

export function ProgressBar({ value, max, color, height = 6, animated = true }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 99, height, overflow: "hidden" }}>
      <div style={{
        width: `${pct}%`, height: "100%", background: color, borderRadius: 99,
        transition: animated ? "width 1s ease" : "none",
      }} />
    </div>
  );
}

export function Tag({ label, color = COLORS.accent }) {
  return (
    <span style={{
      background: color + "22", color, borderRadius: 8, padding: "3px 10px",
      fontSize: 11, fontWeight: 600, letterSpacing: "0.3px",
    }}>{label}</span>
  );
}

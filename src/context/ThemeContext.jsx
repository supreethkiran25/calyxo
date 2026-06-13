import React, { createContext, useState, useContext, useEffect } from "react";
import { COLORS } from "../theme/colors";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const theme = {
    isDarkMode,
    colors: isDarkMode ? COLORS : {
      ...COLORS,
      bg: "#F8FAFC",
      bgCard: "#FFFFFF",
      bgElevated: "#F1F5F9",
      text: "#0F172A",
      textMuted: "#64748B",
      textDim: "#475569",
      border: "rgba(0,0,0,0.05)",
      borderStrong: "rgba(0,0,0,0.1)",
    }
  };

  return (
    <ThemeContext.Provider value={{ ...theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

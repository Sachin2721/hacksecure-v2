import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("hs_theme");
    return saved ? saved === "dark" : true; // default dark
  });

  useEffect(() => {
    localStorage.setItem("hs_theme", dark ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }, [dark]);

  const toggle = () => setDark(p => !p);

  // All theme tokens
  const t = dark ? {
    bg: "#000",
    bg2: "#060e0c",
    bg3: "#0a1410",
    surface: "rgba(6,14,12,0.92)",
    surfaceHover: "rgba(0,255,204,0.05)",
    border: "rgba(0,255,204,0.15)",
    borderHover: "rgba(0,255,204,0.45)",
    text: "#fff",
    textSub: "#888",
    textMuted: "#444",
    accent: "#00ffcc",
    accentDim: "rgba(0,255,204,0.12)",
    accentGlow: "rgba(0,255,204,0.3)",
    navBg: "rgba(0,0,0,0.92)",
    cardBg: "rgba(0,0,0,0.6)",
    inputBg: "#070f0d",
    inputBorder: "#1c2e28",
    green: "#25d366",
    red: "#ff4444",
    yellow: "#ffcc00",
    shadow: "0 0 60px rgba(0,255,204,0.08)",
    gridLine: "rgba(0,255,204,0.04)",
  } : {
    bg: "#f0f4f2",
    bg2: "#e8f0ed",
    bg3: "#ddeae5",
    surface: "rgba(255,255,255,0.95)",
    surfaceHover: "rgba(0,180,140,0.06)",
    border: "rgba(0,150,110,0.2)",
    borderHover: "rgba(0,150,110,0.5)",
    text: "#0a1f18",
    textSub: "#4a6b5e",
    textMuted: "#9ab5ac",
    accent: "#007a5e",
    accentDim: "rgba(0,120,90,0.1)",
    accentGlow: "rgba(0,120,90,0.25)",
    navBg: "rgba(240,244,242,0.95)",
    cardBg: "rgba(255,255,255,0.8)",
    inputBg: "#f8faf9",
    inputBorder: "#c8ddd8",
    green: "#1a9e4a",
    red: "#cc2222",
    yellow: "#b8860b",
    shadow: "0 4px 24px rgba(0,100,70,0.1)",
    gridLine: "rgba(0,150,110,0.06)",
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle, t }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

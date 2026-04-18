import { useState, useEffect, useCallback } from "react";

export type Theme = "dark" | "light";

function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem("visionpro-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    /* SSR or storage blocked */
  }
  return "dark";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("visionpro-theme", theme);
    } catch {
      /* storage blocked */
    }
  }, [theme]);

  const toggle = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggle };
}

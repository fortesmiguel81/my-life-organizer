"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { useTheme } from "next-themes";
import { ThemeProviderProps } from "next-themes/dist/types";

import usePreferredColorScheme from "@/hooks/use-preferred-color-scheme";
import setGlobalColorTheme from "@/lib/theme-colors";

const ThemeContext = createContext<ThemeColorStateParams>(
  {} as ThemeColorStateParams
);

export default function ThemeColorProvider({ children }: ThemeProviderProps) {
  const colorScheme = usePreferredColorScheme();

  const getSavedThemeColor = () => {
    try {
      return (localStorage.getItem("themeColor") as ThemeColors) || "Zinc";
    } catch (error) {
      "Zinc" as ThemeColors;
    }
  };

  const [themeColor, setThemeColor] = useState<ThemeColors>(
    getSavedThemeColor() as ThemeColors
  );
  const [isMounted, setIsMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    localStorage.setItem("themeColor", themeColor);

    if (theme === "system") {
      setGlobalColorTheme(colorScheme, themeColor);
    } else {
      setGlobalColorTheme(theme as "light" | "dark", themeColor);
    }

    if (!isMounted) {
      setIsMounted(true);
    }
  }, [themeColor, theme]);

  if (!isMounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}

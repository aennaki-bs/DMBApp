import React, { createContext, useContext, ReactNode } from "react";
import { useTheme } from "@/hooks/useTheme";
import { type Theme, type BaseTheme } from "@/lib/themes";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currentActiveTheme: BaseTheme; // The actual theme being applied (resolved from system if needed)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeValue = useTheme();

  return (
    <ThemeContext.Provider value={themeValue}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}

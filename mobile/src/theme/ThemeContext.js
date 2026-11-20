import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { palettes } from "./colors";

const STORAGE_KEY = "anveshya.themePreference"; // "dark" | "light" | "system"

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === "dark" || v === "light" || v === "system") setPreferenceState(v);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const setPreference = useCallback((value) => {
    setPreferenceState(value);
    AsyncStorage.setItem(STORAGE_KEY, value).catch(() => {});
  }, []);

  const mode = preference === "system" ? (system === "light" ? "light" : "dark") : preference;
  const colors = palettes[mode];

  const toggle = useCallback(() => {
    setPreference(mode === "dark" ? "light" : "dark");
  }, [mode, setPreference]);

  const value = useMemo(
    () => ({ colors, mode, isDark: mode === "dark", preference, setPreference, toggle, ready }),
    [colors, mode, preference, setPreference, toggle, ready]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

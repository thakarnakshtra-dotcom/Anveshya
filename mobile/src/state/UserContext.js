import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "anveshya.user";

// Preferences shown on the Settings pages. Phase 1 stores them on the device;
// a backend can read the same shape later.
export const DEFAULT_SETTINGS = {
  // posts & reels
  hideLikeCounts: false,
  allowComments: "everyone", // "everyone" | "followers" | "off"
  allowSharing: true,
  autoplayReels: true,
  // notifications
  notifyPauseAll: false,
  notifyLikes: true,
  notifyComments: true,
  notifyFollowers: true,
  notifyMessages: true,
  notifySkyEvents: true,
  notifyNews: false,
  // app
  dataSaver: false,
};

// Phase 1 has no auth backend: the signed-in user is a local profile saved
// in AsyncStorage. "Log out" resets it to a fresh guest explorer.
export const DEFAULT_USER = {
  id: "me",
  name: "",
  username: "explorer",
  bio: "Exploring the cosmos, one star at a time ✦",
  verified: false,
  avatar: null,
  color: "#8C3A35",
  followers: 128,
  following: 96,
  private: false,
  links: { website: "", instagram: "", linkedin: "", x: "" },
  // posts/reels the user adds from the + button: { id, uri, kind: "post" | "reel", isVideo }
  posts: [],
  settings: DEFAULT_SETTINGS,
  blocked: [], // user ids
  // account history: { id, text, time }
  history: [],
  createdAt: null,
};

// What's worth recording in "Account history" when it changes.
const HISTORY_LABELS = {
  name: "Changed your name",
  username: "Changed your username",
  bio: "Updated your bio",
  avatar: "Changed your profile picture",
  links: "Updated your links",
};

function freshUser() {
  const now = new Date().toISOString();
  return { ...DEFAULT_USER, createdAt: now, history: [{ id: "created", text: "Joined Anveshya", time: now }] };
}

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(DEFAULT_USER);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) {
          const u = freshUser();
          setUser(u);
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u)).catch(() => {});
          return;
        }
        const saved = JSON.parse(raw);
        const merged = {
          ...DEFAULT_USER,
          ...saved,
          links: { ...DEFAULT_USER.links, ...(saved.links || {}) },
          settings: { ...DEFAULT_SETTINGS, ...(saved.settings || {}) },
        };
        if (!merged.createdAt) {
          merged.createdAt = new Date().toISOString();
          merged.history = [{ id: "created", text: "Joined Anveshya", time: merged.createdAt }, ...(merged.history || [])];
        }
        setUser(merged);
      })
      .catch(() => {});
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      const now = new Date().toISOString();
      const entries = [];
      for (const k of Object.keys(patch)) {
        if (HISTORY_LABELS[k] && JSON.stringify(patch[k]) !== JSON.stringify(prev[k])) {
          entries.push({ id: `${k}-${now}`, text: HISTORY_LABELS[k], time: now });
        }
      }
      if ("private" in patch && patch.private !== prev.private) {
        entries.push({ id: `private-${now}`, text: patch.private ? "Made your account private" : "Made your account public", time: now });
      }
      const next = { ...prev, ...patch, history: entries.length ? [...entries, ...(prev.history || [])].slice(0, 100) : prev.history };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const updateSettings = useCallback(
    (patch) => setUser((prev) => {
      const next = { ...prev, settings: { ...DEFAULT_SETTINGS, ...prev.settings, ...patch } };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    }),
    []
  );

  const logout = useCallback(() => {
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    const u = freshUser();
    setUser(u);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u)).catch(() => {});
  }, []);

  // Deletes everything this app stored on the device (profile, posts,
  // settings, theme), then starts fresh.
  const deleteAccount = useCallback(async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      await AsyncStorage.multiRemove(keys.filter((k) => k.startsWith("anveshya.")));
    } catch (e) {}
    const u = freshUser();
    setUser(u);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(u)).catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ user, settings: { ...DEFAULT_SETTINGS, ...user.settings }, updateUser, updateSettings, logout, deleteAccount }),
    [user, updateUser, updateSettings, logout, deleteAccount]
  );
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}

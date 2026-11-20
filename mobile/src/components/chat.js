import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming, ReduceMotion } from "react-native-reanimated";
import { online, people } from "../data/social";

// Shared chat bits: bubble themes, wallpapers, labels, typing dots.

export const CHAT_THEMES = [
  { key: "maroon", label: "Maroon", color: "#7D2230" },
  { key: "slate", label: "Slate", color: "#3D5F86" },
  { key: "teal", label: "Teal", color: "#2F6F68" },
  { key: "plum", label: "Plum", color: "#5E4B8A" },
  { key: "amber", label: "Amber", color: "#8A5A2A" },
  { key: "graphite", label: "Graphite", color: "#4A4945" },
];
export const themeColor = (key) => (CHAT_THEMES.find((t) => t.key === key) || CHAT_THEMES[0]).color;

export const WALLPAPERS = [
  { key: "none", label: "None" },
  { key: "stars", label: "Stars" },
  { key: "glow", label: "Glow" },
];

export const DISAPPEARING = [
  { value: "off", label: "Off" },
  { value: "24h", label: "24 hours", ms: 24 * 3600 * 1000 },
  { value: "7d", label: "7 days", ms: 7 * 24 * 3600 * 1000 },
];

export const REACTIONS = ["❤️", "😂", "😮", "😢", "👍", "🔥"];
export const EMOJIS = ["😀", "😂", "😍", "🥹", "😎", "🤩", "😮", "😢", "🙏", "👍", "👏", "🔥", "✨", "💫", "🌙", "⭐", "🪐", "☄️", "🚀", "🛰️", "🔭", "🌌", "❤️", "💯"];

export function chatTitle(c) {
  if (!c) return "";
  if (c.type === "group") return c.name;
  return c.nickname || c.members[0]?.name || "Chat";
}

export function chatStatus(c, typingId) {
  if (!c) return "";
  if (typingId) return c.type === "group" ? `${people[typingId]?.name.split(" ")[0] || "Someone"} is typing…` : "typing…";
  if (c.type === "group") return `${c.members.length + 1} members`;
  return online.has(c.members[0]?.id) ? "online" : "last seen recently";
}

export function visibleMessages(c) {
  const rule = DISAPPEARING.find((d) => d.value === c.disappearing);
  if (!rule || !rule.ms) return c.messages;
  const cutoff = Date.now() - rule.ms;
  return c.messages.filter((m) => new Date(m.time).getTime() >= cutoff);
}

export function dayLabel(d) {
  const date = new Date(d);
  const today = new Date();
  const y = new Date(today);
  y.setDate(today.getDate() - 1);
  const same = (a, b) => a.toDateString() === b.toDateString();
  if (same(date, today)) return "Today";
  if (same(date, y)) return "Yesterday";
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: date.getFullYear() === today.getFullYear() ? undefined : "numeric" });
}

export function extractLinks(text) {
  return (text || "").match(/\b((https?:\/\/|www\.)[^\s]+|[a-z0-9-]+\.(com|in|org|net|space|io|dev|app)(\/[^\s]*)?)/gi) || [];
}

const STARS = Array.from({ length: 40 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  top: `${(i * 53) % 100}%`,
  size: i % 7 === 0 ? 3 : 1.6,
  o: 0.15 + ((i * 13) % 10) / 30,
}));

export function Wallpaper({ kind, isDark }) {
  if (kind === "stars") {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {STARS.map((s, i) => (
          <View
            key={i}
            style={{
              position: "absolute",
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              borderRadius: s.size,
              backgroundColor: isDark ? "#F5F1E8" : "#7D1A27",
              opacity: s.o,
            }}
          />
        ))}
      </View>
    );
  }
  if (kind === "glow") {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={{ position: "absolute", top: "8%", left: "-20%", width: 320, height: 320, borderRadius: 160, backgroundColor: "#7D1A27", opacity: isDark ? 0.16 : 0.08 }} />
        <View style={{ position: "absolute", bottom: "6%", right: "-25%", width: 360, height: 360, borderRadius: 180, backgroundColor: "#3D5F86", opacity: isDark ? 0.14 : 0.07 }} />
      </View>
    );
  }
  return null;
}

function Dot({ delay, color }) {
  const o = useSharedValue(0.3);
  useEffect(() => {
    o.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(1, { duration: 350, reduceMotion: ReduceMotion.Never }), withTiming(0.3, { duration: 350, reduceMotion: ReduceMotion.Never })), -1, false, undefined, ReduceMotion.Never)
    );
  }, []);
  const style = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: color, marginHorizontal: 2 }, style]} />;
}

export function TypingDots({ color }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 4 }}>
      <Dot delay={0} color={color} />
      <Dot delay={150} color={color} />
      <Dot delay={300} color={color} />
    </View>
  );
}

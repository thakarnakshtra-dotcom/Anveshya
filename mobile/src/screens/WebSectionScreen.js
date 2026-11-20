import React, { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import AppText, { AppTextInput } from "../components/AppText";
import { useTabBarSpace } from "../components/TabBar";
import { useTheme } from "../theme/ThemeContext";
import WebPage from "../web/WebPage";
import { SECTIONS } from "../web/site";

// In-page search bar: finds text inside the current website page and steps
// through the matches.
function FindBar({ onFind, result, onClose }) {
  const { colors } = useTheme();
  const [q, setQ] = useState("");
  const timer = useRef(null);
  const run = (text, back) => onFind(text.trim(), back);
  return (
    <Animated.View entering={FadeIn.duration(180)} exiting={FadeOut.duration(150)} style={[styles.findBar, { backgroundColor: colors.card, borderColor: colors.hairline }]}>
      <Ionicons name="search" size={16} color={colors.textMuted} />
      <AppTextInput
        autoFocus
        value={q}
        onChangeText={(t) => {
          setQ(t);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => run(t, false), 250);
        }}
        onSubmitEditing={() => run(q, false)}
        returnKeyType="search"
        placeholder="Search this page"
        style={{ flex: 1, marginLeft: 8, paddingVertical: 8, fontSize: 14 }}
      />
      {q.trim() ? (
        <AppText muted size={12} style={{ marginHorizontal: 6 }}>
          {result.count ? `${result.index} of ${result.count}` : "No matches"}
        </AppText>
      ) : null}
      <Pressable onPress={() => run(q, true)} hitSlop={6} disabled={!result.count} style={styles.findBtn} accessibilityLabel="Previous match">
        <Ionicons name="chevron-up" size={18} color={result.count ? colors.text : colors.inactive} />
      </Pressable>
      <Pressable onPress={() => run(q, false)} hitSlop={6} disabled={!result.count} style={styles.findBtn} accessibilityLabel="Next match">
        <Ionicons name="chevron-down" size={18} color={result.count ? colors.text : colors.inactive} />
      </Pressable>
      <Pressable
        onPress={() => {
          onFind("", false);
          Keyboard.dismiss();
          onClose();
        }}
        hitSlop={6}
        style={styles.findBtn}
        accessibilityLabel="Close search"
      >
        <Ionicons name="close" size={18} color={colors.text} />
      </Pressable>
    </Animated.View>
  );
}

// The 3D explorer chip names what you're actually looking at.
const EXPLORER_SECTIONS = {
  "solar-system": "Solar System",
  nakshatras: "Panchanga Wheel",
  andromeda: "Andromeda",
  saptarshi: "Saptarshi",
  spacetime: "Spacetime",
};
function chipLabel(page, url) {
  if (page.key !== "explorer") return page.label;
  const m = (url || "").match(/[?&]section=([a-z-]+)/);
  return m ? EXPLORER_SECTIONS[m[1]] || page.label : "3D Explore";
}

// A tab made of one or more website pages. All pages of a tab start loading
// when the app opens (tabs aren't lazy), so switching is instant and keeps
// your scroll position / 3D camera.
export function makeWebSection(tabName) {
  const pages = SECTIONS[tabName];

  return function WebSectionScreen({ route }) {
    const { colors } = useTheme();
    const bottom = useTabBarSpace();
    const [activeKey, setActiveKey] = useState(pages[0].key);
    const [opened, setOpened] = useState(() => new Set([pages[0].key]));
    const [finding, setFinding] = useState(false);
    const [result, setResult] = useState({ count: 0, index: 0 });
    const [urls, setUrls] = useState({});
    const refs = useRef({});

    const select = (key) => {
      setActiveKey(key);
      setOpened((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
      setResult({ count: 0, index: 0 });
    };

    // deep links from app-wide search: { page, path, nonce }
    const nonce = route?.params?.nonce;
    useEffect(() => {
      const p = route?.params;
      if (!p) return;
      const key = p.page && pages.some((x) => x.key === p.page) ? p.page : pages[0].key;
      select(key);
      if (p.path) setTimeout(() => refs.current[key]?.goTo(p.path), 50);
      if (p.find) {
        setFinding(true);
        setTimeout(() => refs.current[key]?.find(p.find, false), 1200);
      }
    }, [nonce]);

    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingBottom: bottom - 12 }}>
        <View style={styles.toolbar}>
          {finding ? (
            <FindBar result={result} onFind={(q, back) => refs.current[activeKey]?.find(q, back)} onClose={() => setFinding(false)} />
          ) : (
            <>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={styles.chips}>
                {pages.map((p) => {
                  const active = p.key === activeKey;
                  return (
                    <Pressable
                      key={p.key}
                      onPress={() => select(p.key)}
                      style={[styles.chip, { borderColor: active ? colors.primary : colors.hairline, backgroundColor: active ? colors.primary : colors.card }]}
                    >
                      <AppText size={13} color={active ? "#fff" : colors.textMuted}>
                        {chipLabel(p, urls[p.key])}
                      </AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Pressable
                onPress={() => setFinding(true)}
                hitSlop={8}
                accessibilityLabel={`Search ${tabName}`}
                style={[styles.searchBtn, { borderColor: colors.hairline, backgroundColor: colors.card }]}
              >
                <Ionicons name="search" size={17} color={colors.text} />
              </Pressable>
            </>
          )}
        </View>
        <View style={{ flex: 1 }}>
          {pages.map((p) =>
            opened.has(p.key) ? (
              <View key={p.key} style={[StyleSheet.absoluteFill, { display: p.key === activeKey ? "flex" : "none" }]}>
                <WebPage
                  ref={(r) => (refs.current[p.key] = r)}
                  path={p.path}
                  active={p.key === activeKey}
                  interactive3d={p.interactive3d}
                  onFind={(m) => p.key === activeKey && setResult(m)}
                  onUrl={(u) => setUrls((prev) => (prev[p.key] === u ? prev : { ...prev, [p.key]: u }))}
                />
              </View>
            ) : null
          )}
        </View>
      </View>
    );
  };
}

// Stack screen for one-off site pages (About, Privacy, Terms) from Settings.
export function WebLinkScreen({ route }) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <WebPage path={route.params.path} />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: { flexDirection: "row", alignItems: "center", paddingRight: 16, minHeight: 58 },
  chips: { paddingLeft: 16, paddingRight: 8, paddingVertical: 10, gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  searchBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  findBar: { flex: 1, flexDirection: "row", alignItems: "center", marginLeft: 16, borderRadius: 999, borderWidth: 1, paddingLeft: 14, paddingRight: 6, height: 42 },
  findBtn: { width: 30, height: 30, alignItems: "center", justifyContent: "center" },
});

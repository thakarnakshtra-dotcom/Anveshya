import React, { useEffect, useMemo, useState } from "react";
import { Image, Keyboard, Pressable, ScrollView, SectionList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import AppText, { AppTextInput } from "../components/AppText";
import Avatar, { VerifiedBadge } from "../components/Avatar";
import { useTheme } from "../theme/ThemeContext";
import { useSocial } from "../state/SocialContext";
import { people, reels } from "../data/social";
import { APP_ITEMS, EXPLORE_ITEMS, LEARN_ITEMS, NEWS_ITEMS } from "../data/searchIndex";
import { useOpenProfile } from "../utils/nav";

const RECENT_KEY = "anveshya.recentSearches";
const FILTERS = ["All", "People", "Posts", "Reels", "Explore", "Learn", "News", "App"];
const SUGGESTED = ["Jupiter", "Andromeda", "Aryabhata", "Eclipse", "ISS", "Tara"];
const TAB_FOR_PAGE = { explorer: "Explore", solarshield: "Explore", learn: "Learn", sounds: "Learn", news: "News" };

const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const match = (q, ...fields) => fields.some((f) => norm(f).includes(q));

// App-wide search: people, posts, reels, Explore features, Learn topics,
// News sections and app pages — opened from the search icon in the top bar.
export default function SearchScreen({ navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { posts } = useSocial();
  const openProfile = useOpenProfile();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("All");
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((r) => r && setRecent(JSON.parse(r))).catch(() => {});
  }, []);
  const remember = (term) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recent.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 8);
    setRecent(next);
    AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next)).catch(() => {});
  };

  const sections = useMemo(() => {
    const nq = norm(q.trim());
    if (!nq) return [];
    const peopleRes = Object.values(people).filter((p) => match(nq, p.name, p.username)).map((p) => ({ kind: "person", id: `p-${p.id}`, person: p }));
    const postRes = posts.filter((p) => match(nq, p.text, p.user.name)).map((p) => ({ kind: "post", id: `po-${p.id}`, post: p }));
    const reelRes = reels.map((r, i) => ({ r, i })).filter(({ r }) => match(nq, r.title, r.user.name)).map(({ r, i }) => ({ kind: "reel", id: `r-${r.id}`, reel: r, index: i }));
    const exploreRes = EXPLORE_ITEMS.filter((x) => match(nq, x.title, x.sub, x.keywords)).map((x) => ({ kind: "web", id: x.id, item: x }));
    const learnRes = LEARN_ITEMS.filter((x) => match(nq, x.title, x.sub)).map((x) => ({ kind: "web", id: x.id, item: x }));
    const newsRes = NEWS_ITEMS.filter((x) => match(nq, x.title, x.sub)).map((x) => ({ kind: "web", id: x.id, item: x }));
    const appRes = APP_ITEMS.filter((x) => match(nq, x.title, x.sub)).map((x) => ({ kind: "app", id: x.id, item: x }));
    const all = [
      { title: "People", data: peopleRes },
      { title: "Posts", data: postRes },
      { title: "Reels", data: reelRes },
      { title: "Explore", data: exploreRes },
      { title: "Learn", data: learnRes },
      { title: "News", data: newsRes },
      { title: "App", data: appRes },
    ];
    return all.filter((s) => s.data.length && (filter === "All" || s.title === filter));
  }, [q, filter, posts]);

  const open = (it) => {
    remember(q);
    Keyboard.dismiss();
    if (it.kind === "person") return openProfile(it.person);
    if (it.kind === "post") return navigation.navigate("Post", { postId: it.post.id });
    if (it.kind === "reel") return navigation.navigate("Reels", { index: it.index });
    if (it.kind === "app") return navigation.navigate(it.item.route, it.item.params);
    const x = it.item;
    navigation.navigate("Main", { screen: TAB_FOR_PAGE[x.page], params: { page: x.page, path: x.path, find: x.find, nonce: Date.now() } });
  };

  const renderItem = ({ item: it }) => {
    let left;
    let title;
    let sub;
    if (it.kind === "person") {
      left = <Avatar user={it.person} size={42} />;
      title = (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <AppText medium>{it.person.name}</AppText>
          {it.person.verified && <VerifiedBadge />}
        </View>
      );
      sub = `@${it.person.username}`;
    } else if (it.kind === "post") {
      left = it.post.image ? <Image source={it.post.image} style={styles.thumb} /> : <View style={[styles.thumb, styles.iconThumb, { backgroundColor: colors.cardAlt }]}><Ionicons name="document-text-outline" size={18} color={colors.text} /></View>;
      title = <AppText numberOfLines={2} size={14}>{it.post.text}</AppText>;
      sub = it.post.user.name;
    } else if (it.kind === "reel") {
      left = <Image source={it.reel.image} style={styles.thumb} />;
      title = <AppText medium numberOfLines={1}>{it.reel.title}</AppText>;
      sub = `Reel · ${it.reel.user.name}`;
    } else {
      left = (
        <View style={[styles.thumb, styles.iconThumb, { backgroundColor: colors.cardAlt }]}>
          <Ionicons name={it.item.icon} size={19} color={colors.text} />
        </View>
      );
      title = <AppText medium numberOfLines={1}>{it.item.title}</AppText>;
      sub = it.item.sub;
    }
    return (
      <Pressable onPress={() => open(it)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
        {left}
        <View style={{ flex: 1, marginLeft: 12 }}>
          {title}
          {sub ? <AppText muted size={12} numberOfLines={1} style={{ marginTop: 2 }}>{sub}</AppText> : null}
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.inactive} />
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={[styles.input, { backgroundColor: colors.card, borderColor: colors.hairline }]}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <AppTextInput
            autoFocus
            value={q}
            onChangeText={setQ}
            onSubmitEditing={() => remember(q)}
            returnKeyType="search"
            placeholder="Search people, posts, planets, news…"
            style={{ flex: 1, marginLeft: 8, paddingVertical: 9 }}
          />
          {q ? (
            <Pressable onPress={() => setQ("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.inactive} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {q.trim() ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, flexShrink: 0 }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8, gap: 8, alignItems: "center" }}>
            {FILTERS.map((f) => {
              const active = f === filter;
              return (
                <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.hairline }]}>
                  <AppText size={13} color={active ? "#fff" : colors.textMuted}>{f}</AppText>
                </Pressable>
              );
            })}
          </ScrollView>
          <SectionList
            sections={sections}
            keyExtractor={(it) => it.id}
            keyboardShouldPersistTaps="handled"
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
            renderSectionHeader={({ section }) => (
              <AppText title size={14} style={{ marginTop: 14, marginBottom: 4 }}>{section.title}</AppText>
            )}
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <Ionicons name="search-outline" size={34} color={colors.inactive} />
                <AppText muted style={{ marginTop: 10 }}>No results for "{q.trim()}"</AppText>
              </View>
            }
          />
        </>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          {recent.length > 0 && (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
                <AppText title size={14}>Recent</AppText>
                <Pressable
                  onPress={() => {
                    setRecent([]);
                    AsyncStorage.removeItem(RECENT_KEY).catch(() => {});
                  }}
                  hitSlop={8}
                >
                  <AppText size={12} color={colors.primary}>Clear</AppText>
                </Pressable>
              </View>
              {recent.map((r) => (
                <Pressable key={r} onPress={() => setQ(r)} style={styles.recentRow}>
                  <Ionicons name="time-outline" size={18} color={colors.textMuted} />
                  <AppText style={{ marginLeft: 12, flex: 1 }}>{r}</AppText>
                  <Ionicons name="arrow-up-outline" size={16} color={colors.inactive} style={{ transform: [{ rotate: "-45deg" }] }} />
                </Pressable>
              ))}
            </>
          )}
          <AppText title size={14} style={{ marginTop: 18, marginBottom: 10 }}>Try searching</AppText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTED.map((s) => (
              <Pressable key={s} onPress={() => setQ(s)} style={[styles.chip, { backgroundColor: colors.card, borderColor: colors.hairline }]}>
                <AppText size={13}>{s}</AppText>
              </Pressable>
            ))}
          </View>
          <AppText title size={14} style={{ marginTop: 22, marginBottom: 6 }}>Explore</AppText>
          {EXPLORE_ITEMS.map((x) => <View key={x.id}>{renderItem({ item: { kind: "web", id: x.id, item: x } })}</View>)}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 10 },
  input: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 999, borderWidth: 1, paddingHorizontal: 14 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 9 },
  thumb: { width: 42, height: 42, borderRadius: 12 },
  iconThumb: { alignItems: "center", justifyContent: "center" },
  recentRow: { flexDirection: "row", alignItems: "center", paddingVertical: 11 },
});

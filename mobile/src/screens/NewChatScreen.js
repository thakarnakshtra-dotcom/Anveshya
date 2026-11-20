import React, { useLayoutEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText, { AppTextInput } from "../components/AppText";
import Avatar, { VerifiedBadge } from "../components/Avatar";
import { useTheme } from "../theme/ThemeContext";
import { useSocial } from "../state/SocialContext";
import { friends, online } from "../data/social";

// Start a chat with a friend, or pick several and create a group.
export default function NewChatScreen({ navigation }) {
  const { colors } = useTheme();
  const { openDm, createGroup } = useSocial();
  const [q, setQ] = useState("");
  const [groupMode, setGroupMode] = useState(false);
  const [picked, setPicked] = useState([]);
  const [name, setName] = useState("");

  useLayoutEffect(() => {
    navigation.setOptions({ title: groupMode ? "New group" : "New chat", headerTitleAlign: "center" });
  }, [navigation, groupMode]);

  const list = friends.filter((f) => !q.trim() || f.name.toLowerCase().includes(q.toLowerCase()) || f.username.includes(q.toLowerCase()));
  const toggle = (f) => setPicked((p) => (p.some((x) => x.id === f.id) ? p.filter((x) => x.id !== f.id) : [...p, f]));
  const canCreate = picked.length >= 2 && name.trim();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ padding: 16, paddingBottom: 6, gap: 10 }}>
        <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.hairline }]}>
          <Ionicons name="search" size={16} color={colors.inactive} />
          <AppTextInput value={q} onChangeText={setQ} placeholder="Search friends" style={{ flex: 1, marginLeft: 8, paddingVertical: 10 }} />
        </View>
        {groupMode && (
          <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.hairline }]}>
            <Ionicons name="people-outline" size={16} color={colors.inactive} />
            <AppTextInput value={name} onChangeText={setName} placeholder="Group name" style={{ flex: 1, marginLeft: 8, paddingVertical: 10 }} />
          </View>
        )}
      </View>

      <FlatList
        data={list}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        ListHeaderComponent={
          !groupMode ? (
            <Pressable onPress={() => setGroupMode(true)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
              <View style={[styles.groupIcon, { backgroundColor: colors.primary }]}>
                <Ionicons name="people" size={20} color="#fff" />
              </View>
              <AppText medium style={{ marginLeft: 12 }}>New group</AppText>
            </Pressable>
          ) : (
            <AppText muted size={12} style={{ marginVertical: 8 }}>Pick at least 2 friends · {picked.length} selected</AppText>
          )
        }
        renderItem={({ item: f }) => {
          const on = picked.some((x) => x.id === f.id);
          return (
            <Pressable
              onPress={() => (groupMode ? toggle(f) : navigation.replace("Chat", { conversationId: openDm(f) }))}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}
            >
              <View>
                <Avatar user={f} size={46} />
                {online.has(f.id) && <View style={[styles.dot, { borderColor: colors.background }]} />}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <AppText medium>{f.name}</AppText>
                  {f.verified && <VerifiedBadge />}
                </View>
                <AppText muted size={12}>@{f.username}</AppText>
              </View>
              {groupMode && (
                <View style={[styles.check, { borderColor: on ? colors.primary : colors.inactive, backgroundColor: on ? colors.primary : "transparent" }]}>
                  {on && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
              )}
            </Pressable>
          );
        }}
      />

      {groupMode && (
        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.hairline }]}>
          <Pressable onPress={() => { setGroupMode(false); setPicked([]); }} style={[styles.footBtn, { borderColor: colors.hairline }]}>
            <AppText medium>Cancel</AppText>
          </Pressable>
          <Pressable
            disabled={!canCreate}
            onPress={() => navigation.replace("Chat", { conversationId: createGroup(name.trim(), picked) })}
            style={[styles.footBtn, { flex: 1.4, backgroundColor: canCreate ? colors.primary : colors.cardAlt, borderColor: "transparent" }]}
          >
            <AppText medium color={canCreate ? "#fff" : colors.inactive}>Create group</AppText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: "row", alignItems: "center", borderRadius: 999, borderWidth: 1, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  groupIcon: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", right: 0, bottom: 0, width: 13, height: 13, borderRadius: 7, backgroundColor: "#22c55e", borderWidth: 2 },
  check: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, flexDirection: "row", gap: 10, padding: 16, paddingBottom: 28, borderTopWidth: StyleSheet.hairlineWidth },
  footBtn: { flex: 1, height: 46, borderRadius: 14, borderWidth: 1, alignItems: "center", justifyContent: "center" },
});

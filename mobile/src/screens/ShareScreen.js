import React, { useMemo, useState } from "react";
import { Alert, FlatList, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText, { AppTextInput } from "../components/AppText";
import Avatar, { VerifiedBadge } from "../components/Avatar";
import { Card, Segmented, Tag } from "../components/ui";
import { useTabBarSpace } from "../components/TabBar";
import { useTheme } from "../theme/ThemeContext";
import { useSocial } from "../state/SocialContext";
import { discussions, friends, notifications, online, people, timeAgo } from "../data/social";
import { chatTitle } from "../components/chat";
import { useOpenProfile } from "../utils/nav";

export const conversationTitle = chatTitle;

function lastMessagePreview(c) {
  const m = c.messages[c.messages.length - 1];
  if (!m) return "Say hello 👋";
  if (m.from === "system") return m.text;
  const who = m.from === "me" ? "You: " : c.type === "group" ? `${people[m.from]?.name.split(" ")[0]}: ` : "";
  return who + (m.post ? "Shared a post" : m.image ? "📷 Photo" : m.text);
}
const lastTime = (c) => (c.messages.length ? new Date(c.messages[c.messages.length - 1].time).getTime() : 0);

function GroupAvatar({ members, size = 48 }) {
  const s = size * 0.68;
  return (
    <View style={{ width: size, height: size }}>
      <View style={{ position: "absolute", top: 0, left: 0 }}>
        <Avatar user={members[0]} size={s} />
      </View>
      <View style={{ position: "absolute", bottom: 0, right: 0 }}>
        <Avatar user={members[1] || members[0]} size={s} />
      </View>
    </View>
  );
}

function ChatRow({ c, onPress, onLongPress, typingId, onAvatar }) {
  const { colors } = useTheme();
  const last = c.messages[c.messages.length - 1];
  const friend = c.members[0];
  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} delayLongPress={350} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
      {c.type === "group" ? (
        <GroupAvatar members={c.members} />
      ) : (
        <Pressable onPress={() => onAvatar(friend)} hitSlop={4}>
          <Avatar user={friend} size={48} />
          {online.has(friend.id) && <View style={[styles.onlineDot, { borderColor: colors.background }]} />}
        </Pressable>
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <AppText medium numberOfLines={1}>{conversationTitle(c)}</AppText>
          {c.type === "dm" && friend.verified && <VerifiedBadge />}
          {c.type === "group" && <Ionicons name="people" size={13} color={colors.inactive} style={{ marginLeft: 6 }} />}
          {c.muted && <Ionicons name="notifications-off" size={13} color={colors.inactive} style={{ marginLeft: 6 }} />}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
          {!typingId && last?.from === "me" && last.status && (
            <Ionicons name={last.status === "sent" ? "checkmark" : "checkmark-done"} size={15} color={last.status === "seen" ? colors.primary : colors.inactive} style={{ marginRight: 3 }} />
          )}
          <AppText muted={!typingId} color={typingId ? colors.primary : undefined} size={13} numberOfLines={1} style={{ flex: 1 }}>
            {typingId ? "typing…" : lastMessagePreview(c)}
          </AppText>
        </View>
      </View>
      <View style={{ alignItems: "flex-end", gap: 6, marginLeft: 8 }}>
        {last && <AppText muted size={11} color={c.unread > 0 ? colors.primary : undefined}>{timeAgo(last.time)}</AppText>}
        {c.unread > 0 && (
          <View style={[styles.unread, { backgroundColor: c.muted ? colors.inactive : colors.primary }]}>
            <AppText size={11} color="#fff">{c.unread}</AppText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

function NotificationsModal({ visible, onClose }) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <View style={[styles.notifPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <AppText title size={18} style={{ marginBottom: 10 }}>Notifications</AppText>
        {notifications.map((n) => (
          <View key={n.id} style={styles.notifRow}>
            <View style={[styles.notifIcon, { backgroundColor: colors.primary }]}>
              <Ionicons name={n.icon} size={14} color="#fff" />
            </View>
            <AppText size={13} style={{ flex: 1 }}>{n.text}</AppText>
            <AppText muted size={11}>{timeAgo(n.time)}</AppText>
          </View>
        ))}
      </View>
    </Modal>
  );
}

export default function ShareScreen({ navigation }) {
  const { colors } = useTheme();
  const { conversations, markRead, openDm, typing, updateConversation, clearChat, deleteChat } = useSocial();
  const openProfile = useOpenProfile();
  const bottom = useTabBarSpace();
  const [tab, setTab] = useState("chats");
  const [query, setQuery] = useState("");
  const [showNotifs, setShowNotifs] = useState(false);

  const openChat = (id) => {
    markRead(id);
    navigation.navigate("Chat", { conversationId: id });
  };

  const chatOptions = (c) => {
    const title = conversationTitle(c);
    if (Platform.OS === "web") return openChat(c.id);
    Alert.alert(title, undefined, [
      { text: c.muted ? "Unmute" : "Mute", onPress: () => updateConversation(c.id, { muted: !c.muted }) },
      { text: "Clear chat", onPress: () => clearChat(c.id) },
      { text: "Delete chat", style: "destructive", onPress: () => deleteChat(c.id) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const q = query.trim().toLowerCase();
  const list = useMemo(() => {
    const type = tab === "groups" ? "group" : "dm";
    return conversations
      .filter((c) => c.type === type && (!q || conversationTitle(c).toLowerCase().includes(q)))
      .sort((a, b) => lastTime(b) - lastTime(a));
  }, [conversations, tab, q]);
  const friendList = friends.filter((f) => !q || f.name.toLowerCase().includes(q) || f.username.includes(q));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={[styles.search, { backgroundColor: colors.card, borderColor: colors.hairline }]}>
            <Ionicons name="search" size={16} color={colors.inactive} />
            <AppTextInput value={query} onChangeText={setQuery} placeholder="Search friends & chats" style={{ flex: 1, marginLeft: 8, paddingVertical: 10 }} />
          </View>
          <Pressable onPress={() => navigation.navigate("NewChat")} hitSlop={8} accessibilityLabel="New chat" style={[styles.newChat, { backgroundColor: colors.primary }]}>
            <Ionicons name="create-outline" size={19} color="#fff" />
          </Pressable>
          <Pressable onPress={() => setShowNotifs(true)} hitSlop={8} accessibilityLabel="Notifications">
            <Ionicons name="notifications-outline" size={24} color={colors.text} />
            <View style={[styles.bellDot, { backgroundColor: colors.primary }]} />
          </Pressable>
        </View>

        {/* Online friends strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 14 }} contentContainerStyle={{ gap: 14 }}>
          {friends
            .filter((f) => online.has(f.id))
            .map((f) => (
              <Pressable key={f.id} style={{ alignItems: "center" }} onPress={() => openProfile(f)}>
                <View>
                  <Avatar user={f} size={52} />
                  <View style={[styles.onlineDot, { borderColor: colors.background }]} />
                </View>
                <AppText size={11} style={{ marginTop: 4 }}>{f.name.split(" ")[0]}</AppText>
              </Pressable>
            ))}
        </ScrollView>

        <Segmented
          style={{ marginTop: 14, marginBottom: 6 }}
          value={tab}
          onChange={setTab}
          options={[
            { value: "chats", label: "Chats" },
            { value: "groups", label: "Groups" },
            { value: "friends", label: "Friends" },
            { value: "community", label: "Community" },
          ]}
        />
      </View>

      {(tab === "chats" || tab === "groups") && (
        <FlatList
          data={list}
          keyExtractor={(c) => c.id}
          renderItem={({ item }) => (
            <ChatRow
              c={item}
              typingId={typing[item.id]}
              onAvatar={openProfile}
              onPress={() => openChat(item.id)}
              onLongPress={() => chatOptions(item)}
            />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom }}
          ListEmptyComponent={<AppText muted style={{ textAlign: "center", marginTop: 40 }}>No conversations yet</AppText>}
        />
      )}

      {tab === "friends" && (
        <FlatList
          data={friendList}
          keyExtractor={(f) => f.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottom }}
          renderItem={({ item: f }) => (
            <View style={styles.row}>
              <Pressable onPress={() => openProfile(f)}>
                <Avatar user={f} size={48} />
              </Pressable>
              <Pressable style={{ flex: 1, marginLeft: 12 }} onPress={() => openProfile(f)}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <AppText medium>{f.name}</AppText>
                  {f.verified && <VerifiedBadge />}
                </View>
                <AppText muted size={12}>
                  @{f.username} · {online.has(f.id) ? "online" : "offline"}
                </AppText>
              </Pressable>
              <Pressable onPress={() => openChat(openDm(f))} style={[styles.msgBtn, { borderColor: colors.primary }]}>
                <Ionicons name="chatbubble" size={16} color={colors.primary} />
              </Pressable>
            </View>
          )}
        />
      )}

      {tab === "community" && (
        <FlatList
          data={discussions}
          keyExtractor={(d) => d.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: bottom, gap: 12 }}
          renderItem={({ item: d, index }) => (
            <Card index={index}>
              <Tag label={d.tag} />
              <AppText medium size={16} style={{ marginTop: 8 }}>{d.title}</AppText>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                <Pressable onPress={() => openProfile(d.author)} hitSlop={6}>
                  <Avatar user={d.author} size={22} />
                </Pressable>
                <AppText muted size={12} style={{ marginLeft: 8, flex: 1 }}>
                  {d.author.name}
                </AppText>
                <Ionicons name="chatbubbles-outline" size={14} color={colors.inactive} />
                <AppText muted size={12} style={{ marginLeft: 4 }}>{d.replies}</AppText>
              </View>
            </Card>
          )}
        />
      )}

      <NotificationsModal visible={showNotifs} onClose={() => setShowNotifs(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  search: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 999, borderWidth: 1, paddingHorizontal: 14 },
  bellDot: { position: "absolute", top: 0, right: 0, width: 8, height: 8, borderRadius: 4 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  onlineDot: { position: "absolute", right: 0, bottom: 0, width: 14, height: 14, borderRadius: 7, backgroundColor: "#22c55e", borderWidth: 2 },
  unread: { minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 6 },
  newChat: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  msgBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  notifPanel: { position: "absolute", top: 110, left: 16, right: 16, borderRadius: 22, borderWidth: 1, padding: 18 },
  notifRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  notifIcon: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
});

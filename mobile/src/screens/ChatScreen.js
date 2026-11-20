import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { FlatList, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import AppText, { AppTextInput } from "../components/AppText";
import Avatar from "../components/Avatar";
import { EMOJIS, REACTIONS, TypingDots, Wallpaper, chatStatus, chatTitle, dayLabel, themeColor, visibleMessages } from "../components/chat";
import { useTheme } from "../theme/ThemeContext";
import { useSocial } from "../state/SocialContext";
import { useUser } from "../state/UserContext";
import { initialPosts, people } from "../data/social";
import { useOpenProfile } from "../utils/nav";

const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const preview = (m) => (m.text ? m.text : m.image ? "📷 Photo" : m.post ? "Shared a post" : "");

function Ticks({ status, color }) {
  if (!status) return null;
  const seen = status === "seen";
  return (
    <Ionicons
      name={status === "sent" ? "checkmark" : "checkmark-done"}
      size={14}
      color={seen ? "#FFD7DC" : color}
      style={{ marginLeft: 3 }}
    />
  );
}

function Bubble({ m, isGroup, bubbleColor, onLongPress, onDoubleTap, onAvatar, showAvatar }) {
  const { colors } = useTheme();
  const mine = m.from === "me";
  const sender = people[m.from];
  const lastTap = useRef(0);
  const sharedImage = m.post ? initialPosts.find((p) => p.id === m.post.id)?.image : null;
  const reactions = Object.entries(m.reactions || {});
  const fg = mine ? "#fff" : colors.text;
  const sub = mine ? "rgba(255,255,255,0.72)" : colors.inactive;

  if (m.from === "system") {
    return (
      <View style={styles.systemRow}>
        <AppText muted size={12} style={[styles.systemPill, { backgroundColor: colors.card }]}>{m.text}</AppText>
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInUp.duration(200)} style={[styles.bubbleRow, { justifyContent: mine ? "flex-end" : "flex-start", marginBottom: reactions.length ? 16 : 4 }]}>
      {!mine && isGroup && (
        <Pressable onPress={() => onAvatar(sender)} style={{ width: 30 }}>
          {showAvatar ? <Avatar user={sender} size={26} /> : null}
        </Pressable>
      )}
      <Pressable
        onLongPress={() => onLongPress(m)}
        delayLongPress={280}
        onPress={() => {
          const t = Date.now();
          if (t - lastTap.current < 280) onDoubleTap(m);
          lastTap.current = t;
        }}
        style={[
          styles.bubble,
          mine ? { backgroundColor: bubbleColor, borderBottomRightRadius: 6 } : { backgroundColor: colors.bubbleTheirs, borderBottomLeftRadius: 6 },
          (m.image || m.post) && { padding: 4 },
        ]}
      >
        {!mine && isGroup && showAvatar && (
          <AppText medium size={11} color={colors.primary} style={{ marginBottom: 2, marginHorizontal: m.image || m.post ? 8 : 0, marginTop: m.image || m.post ? 4 : 0 }}>
            {sender?.name}
          </AppText>
        )}
        {m.replyTo && (
          <View style={[styles.replyQuote, { borderLeftColor: mine ? "rgba(255,255,255,0.7)" : colors.primary, backgroundColor: mine ? "rgba(0,0,0,0.15)" : colors.cardAlt }]}>
            <AppText medium size={11} color={mine ? "#fff" : colors.primary}>
              {m.replyTo.from === "me" ? "You" : people[m.replyTo.from]?.name || "Message"}
            </AppText>
            <AppText size={12} color={mine ? "rgba(255,255,255,0.85)" : colors.textMuted} numberOfLines={2}>{m.replyTo.text}</AppText>
          </View>
        )}
        {m.image ? <Image source={{ uri: m.image }} style={styles.photo} resizeMode="cover" /> : null}
        {m.post ? (
          <View style={[styles.sharedPost, { borderColor: mine ? "rgba(255,255,255,0.3)" : colors.hairline }]}>
            {sharedImage ? <Image source={sharedImage} style={styles.sharedImg} /> : null}
            <View style={{ padding: 8 }}>
              <AppText medium size={11} color={sub}>{m.post.author}</AppText>
              <AppText size={13} color={fg} numberOfLines={3}>{m.post.text}</AppText>
            </View>
          </View>
        ) : null}
        {m.text ? <AppText color={fg} style={{ lineHeight: 21, marginHorizontal: m.image || m.post ? 8 : 0, marginTop: m.image || m.post ? 6 : 0 }}>{m.text}</AppText> : null}
        <View style={[styles.meta, (m.image || m.post) && { marginRight: 8, marginBottom: 4 }]}>
          <AppText size={10} color={sub}>{fmtTime(m.time)}</AppText>
          {mine && <Ticks status={m.status} color={sub} />}
        </View>
        {reactions.length > 0 && (
          <View style={[styles.reactionPill, { backgroundColor: colors.card, borderColor: colors.hairline }, mine ? { right: 8 } : { left: 8 }]}>
            {reactions.map(([e, users]) => (
              <AppText key={e} size={12}>
                {e}
                {users.length > 1 ? ` ${users.length}` : ""}
              </AppText>
            ))}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function ActionSheet({ msg, onClose, onReact, onReply, onCopy, onDelete }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  if (!msg) return null;
  const row = (icon, label, fn, danger) => (
    <Pressable onPress={fn} style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.6 }]}>
      <Ionicons name={icon} size={20} color={danger ? "#E5484D" : colors.text} />
      <AppText style={{ marginLeft: 14 }} color={danger ? "#E5484D" : colors.text}>{label}</AppText>
    </Pressable>
  );
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.reactRow}>
          {REACTIONS.map((e) => (
            <Pressable key={e} onPress={() => onReact(e)} style={({ pressed }) => [styles.reactBtn, { backgroundColor: colors.cardAlt }, pressed && { transform: [{ scale: 1.15 }] }]}>
              <AppText size={22}>{e}</AppText>
            </Pressable>
          ))}
        </View>
        {row("arrow-undo-outline", "Reply", onReply)}
        {msg.text ? row("copy-outline", "Copy", onCopy) : null}
        {row("trash-outline", "Delete for me", onDelete, true)}
      </View>
    </Modal>
  );
}

export default function ChatScreen({ route, navigation }) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useUser();
  const { conversations, sendMessage, markRead, typing, setActiveChat, react, deleteMessage } = useSocial();
  const openProfile = useOpenProfile();
  const c = conversations.find((x) => x.id === route.params?.conversationId);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [search, setSearch] = useState(route.params?.search ? "" : null);
  const isGroup = c?.type === "group";
  const friend = c && !isGroup ? c.members[0] : null;
  const blocked = friend && (user.blocked || []).includes(friend.id);
  const bubbleColor = themeColor(c?.theme);

  // this chat is "open": incoming replies don't count as unread
  useFocusEffect(
    React.useCallback(() => {
      if (!c) return;
      setActiveChat(c.id);
      markRead(c.id);
      return () => setActiveChat(null);
    }, [c?.id])
  );
  useEffect(() => {
    if (c?.unread) markRead(c.id);
  }, [c?.unread]);
  // "Search" from chat info re-opens this chat with the search bar
  useEffect(() => {
    if (route.params?.search) setSearch("");
  }, [route.params?.search]);

  useLayoutEffect(() => {
    if (!c) return;
    const status = chatStatus(c, typing[c.id]);
    navigation.setOptions({
      headerTitle: () => (
        <Pressable onPress={() => navigation.navigate("ChatInfo", { conversationId: c.id })} style={{ flexDirection: "row", alignItems: "center" }} hitSlop={6}>
          <Avatar user={isGroup ? { name: c.name, color: colors.primary } : friend} size={34} />
          <View style={{ marginLeft: 10 }}>
            <AppText medium size={16} numberOfLines={1}>{chatTitle(c)}</AppText>
            <AppText size={11} color={typing[c.id] ? colors.primary : colors.textMuted}>{status}</AppText>
          </View>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable onPress={() => setSearch((s) => (s === null ? "" : null))} hitSlop={10} accessibilityLabel="Search in chat">
          <Ionicons name="search" size={20} color={colors.text} />
        </Pressable>
      ),
    });
  }, [navigation, c?.id, c?.name, c?.nickname, typing, colors, isGroup]);

  // newest first for the inverted list, with day separators
  const items = useMemo(() => {
    if (!c) return [];
    let msgs = visibleMessages(c);
    if (search) msgs = msgs.filter((m) => (m.text || "").toLowerCase().includes(search.toLowerCase()));
    const out = [];
    for (let i = 0; i < msgs.length; i++) {
      const m = msgs[i];
      const prev = msgs[i - 1];
      if (!prev || new Date(prev.time).toDateString() !== new Date(m.time).toDateString()) out.push({ kind: "day", id: `day-${m.id}`, label: dayLabel(m.time) });
      const next = msgs[i + 1];
      out.push({ kind: "msg", id: m.id, m, showAvatar: !next || next.from !== m.from });
    }
    return out.reverse();
  }, [c, search]);

  if (!c) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <AppText muted>Conversation not found</AppText>
      </View>
    );
  }

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage(c.id, { text, replyTo: replyTo ? { id: replyTo.id, from: replyTo.from, text: preview(replyTo) } : undefined });
    setDraft("");
    setReplyTo(null);
  };

  const sendPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.7 });
    if (res.canceled || !res.assets?.length) return;
    sendMessage(c.id, { image: res.assets[0].uri, replyTo: replyTo ? { id: replyTo.id, from: replyTo.from, text: preview(replyTo) } : undefined });
    setReplyTo(null);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 44 : 0}
    >
      <Wallpaper kind={c.wallpaper} isDark={isDark} />
      {search !== null && (
        <Animated.View entering={FadeIn.duration(150)} style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.hairline }]}>
          <Ionicons name="search" size={16} color={colors.textMuted} />
          <AppTextInput autoFocus value={search} onChangeText={setSearch} placeholder="Search in this chat" style={{ flex: 1, marginLeft: 8, paddingVertical: 8 }} />
          <Pressable onPress={() => setSearch(null)} hitSlop={8}>
            <Ionicons name="close" size={18} color={colors.text} />
          </Pressable>
        </Animated.View>
      )}
      <FlatList
        inverted
        data={items}
        keyExtractor={(it) => it.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}
        ListHeaderComponent={
          typing[c.id] && !search ? (
            <View style={[styles.bubbleRow, { justifyContent: "flex-start" }]}>
              {isGroup && <View style={{ width: 30 }}><Avatar user={people[typing[c.id]]} size={26} /></View>}
              <View style={[styles.bubble, { backgroundColor: colors.bubbleTheirs, borderBottomLeftRadius: 6, paddingVertical: 12 }]}>
                <TypingDots color={colors.textMuted} />
              </View>
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60, transform: [{ scaleY: -1 }] }}>
            {search ? (
              <AppText muted>No messages match "{search}"</AppText>
            ) : (
              <>
                <Avatar user={isGroup ? { name: c.name, color: colors.primary } : friend} size={72} />
                <AppText medium size={16} style={{ marginTop: 10 }}>{chatTitle(c)}</AppText>
                <AppText muted size={13} style={{ marginTop: 4 }}>Say hello 👋</AppText>
              </>
            )}
          </View>
        }
        renderItem={({ item }) =>
          item.kind === "day" ? (
            <View style={styles.systemRow}>
              <AppText muted size={11} style={[styles.systemPill, { backgroundColor: colors.card }]}>{item.label}</AppText>
            </View>
          ) : (
            <Bubble
              m={item.m}
              isGroup={isGroup}
              showAvatar={item.showAvatar}
              bubbleColor={bubbleColor}
              onLongPress={setActionMsg}
              onDoubleTap={(m) => react(c.id, m.id, "❤️")}
              onAvatar={openProfile}
            />
          )
        }
      />

      {blocked ? (
        <View style={[styles.blockedBar, { borderTopColor: colors.hairline, paddingBottom: insets.bottom + 12 }]}>
          <AppText muted size={13} style={{ textAlign: "center" }}>You blocked {friend.name}. You can't message them.</AppText>
          <Pressable onPress={() => updateUser({ blocked: (user.blocked || []).filter((x) => x !== friend.id) })} style={{ marginTop: 8 }}>
            <AppText medium color={colors.primary} style={{ textAlign: "center" }}>Unblock</AppText>
          </Pressable>
        </View>
      ) : (
        <View style={{ backgroundColor: colors.background }}>
          {replyTo && (
            <Animated.View entering={FadeIn.duration(150)} style={[styles.replyBar, { borderTopColor: colors.hairline, backgroundColor: colors.card }]}>
              <View style={[styles.replyAccent, { backgroundColor: colors.primary }]} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <AppText medium size={12} color={colors.primary}>Replying to {replyTo.from === "me" ? "yourself" : people[replyTo.from]?.name}</AppText>
                <AppText muted size={12} numberOfLines={1}>{preview(replyTo)}</AppText>
              </View>
              <Pressable onPress={() => setReplyTo(null)} hitSlop={10}>
                <Ionicons name="close" size={18} color={colors.textMuted} />
              </Pressable>
            </Animated.View>
          )}
          {showEmoji && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10, paddingVertical: 8, gap: 4 }} keyboardShouldPersistTaps="always">
              {EMOJIS.map((e) => (
                <Pressable key={e} onPress={() => setDraft((d) => d + e)} style={styles.emojiBtn}>
                  <AppText size={24}>{e}</AppText>
                </Pressable>
              ))}
            </ScrollView>
          )}
          <View style={[styles.composer, { borderTopColor: colors.hairline, paddingBottom: insets.bottom + 8 }]}>
            <Pressable onPress={sendPhoto} hitSlop={6} accessibilityLabel="Send a photo" style={styles.iconBtn}>
              <Ionicons name="image-outline" size={24} color={colors.text} />
            </Pressable>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.hairline }]}>
              <AppTextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Message…"
                multiline
                style={{ flex: 1, paddingVertical: 9, maxHeight: 110 }}
              />
              <Pressable onPress={() => setShowEmoji((v) => !v)} hitSlop={6} accessibilityLabel="Emoji">
                <Ionicons name={showEmoji ? "happy" : "happy-outline"} size={22} color={showEmoji ? colors.primary : colors.textMuted} />
              </Pressable>
            </View>
            <Pressable onPress={send} style={[styles.sendBtn, { backgroundColor: draft.trim() ? bubbleColor : colors.cardAlt }]} accessibilityLabel="Send message">
              <Ionicons name="arrow-up" size={20} color={draft.trim() ? "#fff" : colors.inactive} />
            </Pressable>
          </View>
        </View>
      )}

      <ActionSheet
        msg={actionMsg}
        onClose={() => setActionMsg(null)}
        onReact={(e) => {
          react(c.id, actionMsg.id, e);
          setActionMsg(null);
        }}
        onReply={() => {
          setReplyTo(actionMsg);
          setActionMsg(null);
        }}
        onCopy={() => {
          Clipboard.setStringAsync(actionMsg.text || "").catch(() => {});
          setActionMsg(null);
        }}
        onDelete={() => {
          deleteMessage(c.id, actionMsg.id);
          setActionMsg(null);
        }}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bubbleRow: { flexDirection: "row", alignItems: "flex-end" },
  bubble: { maxWidth: "78%", borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 },
  meta: { flexDirection: "row", alignItems: "center", alignSelf: "flex-end", marginTop: 3 },
  photo: { width: 230, height: 230, borderRadius: 16 },
  sharedPost: { borderWidth: 1, borderRadius: 14, overflow: "hidden", width: 230 },
  sharedImg: { width: "100%", height: 120 },
  replyQuote: { borderLeftWidth: 3, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, marginBottom: 6 },
  reactionPill: { position: "absolute", bottom: -14, flexDirection: "row", gap: 2, borderRadius: 999, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 1 },
  systemRow: { alignItems: "center", marginVertical: 10 },
  systemPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, overflow: "hidden" },
  composer: { flexDirection: "row", alignItems: "flex-end", gap: 8, paddingHorizontal: 10, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth },
  iconBtn: { height: 42, justifyContent: "center" },
  inputWrap: { flex: 1, flexDirection: "row", alignItems: "center", borderRadius: 22, borderWidth: 1, paddingLeft: 14, paddingRight: 10, minHeight: 42 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  emojiBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  replyBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
  replyAccent: { width: 3, alignSelf: "stretch", borderRadius: 2 },
  blockedBar: { paddingTop: 14, paddingHorizontal: 20, borderTopWidth: StyleSheet.hairlineWidth },
  searchBar: { flexDirection: "row", alignItems: "center", margin: 10, marginBottom: 0, borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, height: 42 },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 16, paddingHorizontal: 18 },
  reactRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  reactBtn: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center" },
  actionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14 },
});

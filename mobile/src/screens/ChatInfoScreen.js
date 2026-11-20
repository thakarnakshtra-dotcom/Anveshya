import React, { useLayoutEffect, useMemo, useState } from "react";
import { Alert, Image, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StackActions } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import AppText, { AppTextInput } from "../components/AppText";
import Avatar, { VerifiedBadge } from "../components/Avatar";
import { DangerButton, SettingsChoice, SettingsGroup, SettingsRow } from "../components/settings";
import { CHAT_THEMES, DISAPPEARING, WALLPAPERS, chatTitle, extractLinks, themeColor } from "../components/chat";
import { useTheme } from "../theme/ThemeContext";
import { useSocial } from "../state/SocialContext";
import { useUser } from "../state/UserContext";
import { initialPosts, online } from "../data/social";
import { useOpenProfile } from "../utils/nav";

function confirm(title, message, label, fn) {
  if (Platform.OS === "web") {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${message}`)) fn();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: label, style: "destructive", onPress: fn },
  ]);
}

function TextPrompt({ visible, title, initial, placeholder, onSave, onClose }) {
  const { colors } = useTheme();
  const [v, setV] = useState(initial || "");
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} onShow={() => setV(initial || "")}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <View style={styles.promptWrap} pointerEvents="box-none">
        <View style={[styles.prompt, { backgroundColor: colors.card, borderColor: colors.hairline }]}>
          <AppText title size={17}>{title}</AppText>
          <AppTextInput autoFocus value={v} onChangeText={setV} placeholder={placeholder} style={[styles.input, { borderColor: colors.hairline, backgroundColor: colors.background }]} />
          <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 22, marginTop: 16 }}>
            <Pressable onPress={onClose} hitSlop={8}><AppText muted>Cancel</AppText></Pressable>
            <Pressable onPress={() => { onSave(v.trim()); onClose(); }} hitSlop={8}><AppText medium color={colors.primary}>Save</AppText></Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Opened by tapping the name at the top of a chat: who it is, what you've
// shared with each other, and this chat's customisation and settings.
export default function ChatInfoScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const { user, updateUser } = useUser();
  const { conversations, updateConversation, clearChat, deleteChat } = useSocial();
  const openProfile = useOpenProfile();
  const c = conversations.find((x) => x.id === route.params?.conversationId);
  const [tab, setTab] = useState("media");
  const [prompt, setPrompt] = useState(null); // "nickname" | "rename"

  useLayoutEffect(() => {
    navigation.setOptions({ title: c?.type === "group" ? "Group info" : "Chat info", headerTitleAlign: "center" });
  }, [navigation, c?.type]);

  const shared = useMemo(() => {
    if (!c) return { media: [], links: [], posts: [] };
    const media = c.messages.filter((m) => m.image).map((m) => ({ id: m.id, source: { uri: m.image } }));
    const posts = c.messages.filter((m) => m.post).map((m) => ({ ...m.post, image: initialPosts.find((p) => p.id === m.post.id)?.image, from: m.from, msgId: m.id }));
    posts.forEach((p) => p.image && media.push({ id: `p-${p.msgId}`, source: p.image }));
    const links = c.messages.flatMap((m) => extractLinks(m.text).map((url, i) => ({ id: `${m.id}-${i}`, url, from: m.from, time: m.time })));
    return { media, links, posts };
  }, [c]);

  if (!c) return null;
  const isGroup = c.type === "group";
  const friend = isGroup ? null : c.members[0];
  const blocked = friend && (user.blocked || []).includes(friend.id);
  const tile = Math.floor((width - 32 - 28 - 8) / 3);

  const quick = (icon, label, onPress) => (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quick, { backgroundColor: colors.card, borderColor: colors.hairline }, pressed && { opacity: 0.6 }]}>
      <Ionicons name={icon} size={20} color={colors.text} />
      <AppText size={12} style={{ marginTop: 4 }}>{label}</AppText>
    </Pressable>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
      {/* who */}
      <Animated.View entering={FadeInDown.duration(350)} style={{ alignItems: "center", marginTop: 6 }}>
        <Pressable onPress={() => friend && openProfile(friend)}>
          <Avatar user={isGroup ? { name: c.name, color: colors.primary } : friend} size={96} ring ringWidth={1.5} ringColor={colors.inactive} />
        </Pressable>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 12 }}>
          <AppText title size={22}>{chatTitle(c)}</AppText>
          {friend?.verified && <VerifiedBadge size={18} />}
        </View>
        <AppText muted size={13} style={{ marginTop: 2 }}>
          {isGroup ? `${c.members.length + 1} members` : `${c.nickname ? `${friend.name} · ` : ""}@${friend.username} · ${online.has(friend.id) ? "online" : "last seen recently"}`}
        </AppText>
      </Animated.View>

      <View style={styles.quickRow}>
        {friend && quick("person-outline", "Profile", () => openProfile(friend))}
        {quick("search-outline", "Search", () => navigation.dispatch(StackActions.popTo("Chat", { conversationId: c.id, search: Date.now() })))}
        {quick(c.muted ? "notifications-off-outline" : "notifications-outline", c.muted ? "Unmute" : "Mute", () => updateConversation(c.id, { muted: !c.muted }))}
      </View>

      {/* group members */}
      {isGroup && (
        <SettingsGroup title="Members" index={1}>
          <SettingsRow icon="person-circle-outline" label="You" sub={`@${user.username}`} right="none" />
          {c.members.map((m) => (
            <Pressable key={m.id} onPress={() => openProfile(m)} style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }, pressed && { opacity: 0.6 }]}>
              <Avatar user={m} size={32} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText size={15}>{m.name}</AppText>
                <AppText muted size={12}>@{m.username}</AppText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.inactive} />
            </Pressable>
          ))}
        </SettingsGroup>
      )}

      {/* shared */}
      <SettingsGroup title="Shared in this chat" index={2}>
        <View style={{ flexDirection: "row", paddingTop: 10 }}>
          {[
            { key: "media", label: "Media", n: shared.media.length },
            { key: "links", label: "Links", n: shared.links.length },
            { key: "posts", label: "Posts", n: shared.posts.length },
          ].map((t) => {
            const active = tab === t.key;
            return (
              <Pressable key={t.key} onPress={() => setTab(t.key)} style={{ flex: 1, alignItems: "center" }}>
                <AppText medium={active} size={13} color={active ? colors.text : colors.inactive}>{t.label} · {t.n}</AppText>
                <View style={{ height: 2, width: 36, borderRadius: 1, marginTop: 8, backgroundColor: active ? colors.primary : "transparent" }} />
              </Pressable>
            );
          })}
        </View>
        <View style={{ paddingVertical: 12 }}>
          {tab === "media" &&
            (shared.media.length ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {shared.media.map((m) => (
                  <Image key={m.id} source={m.source} style={{ width: tile, height: tile, borderRadius: 10 }} />
                ))}
              </View>
            ) : (
              <AppText muted size={13} style={styles.emptyText}>Photos you send each other show up here.</AppText>
            ))}
          {tab === "links" &&
            (shared.links.length ? (
              shared.links.map((l) => (
                <Pressable key={l.id} onPress={() => Linking.openURL(/^https?:/.test(l.url) ? l.url : `https://${l.url}`).catch(() => {})} style={styles.linkRow}>
                  <View style={[styles.linkIcon, { backgroundColor: colors.cardAlt }]}>
                    <Ionicons name="link-outline" size={18} color={colors.text} />
                  </View>
                  <AppText size={14} color={colors.primary} numberOfLines={1} style={{ flex: 1, marginLeft: 10 }}>{l.url}</AppText>
                </Pressable>
              ))
            ) : (
              <AppText muted size={13} style={styles.emptyText}>Links you share in this chat show up here.</AppText>
            ))}
          {tab === "posts" &&
            (shared.posts.length ? (
              shared.posts.map((p) => (
                <View key={p.msgId} style={styles.linkRow}>
                  {p.image ? <Image source={p.image} style={styles.postThumb} /> : <View style={[styles.postThumb, { backgroundColor: colors.cardAlt }]} />}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <AppText medium size={13}>{p.author}</AppText>
                    <AppText muted size={12} numberOfLines={2}>{p.text}</AppText>
                  </View>
                </View>
              ))
            ) : (
              <AppText muted size={13} style={styles.emptyText}>Posts and reels you send each other show up here.</AppText>
            ))}
        </View>
      </SettingsGroup>

      {/* customise */}
      <SettingsGroup title="Customize chat" index={3}>
        <View style={{ paddingVertical: 12 }}>
          <AppText size={15}>Theme</AppText>
          <View style={styles.swatches}>
            {CHAT_THEMES.map((t) => {
              const active = (c.theme || "maroon") === t.key;
              return (
                <Pressable key={t.key} onPress={() => updateConversation(c.id, { theme: t.key })} accessibilityLabel={`${t.label} theme`} style={[styles.swatchRing, { borderColor: active ? colors.text : "transparent" }]}>
                  <View style={[styles.swatch, { backgroundColor: t.color }]} />
                </Pressable>
              );
            })}
          </View>
        </View>
        <View style={{ paddingVertical: 12 }}>
          <AppText size={15}>Wallpaper</AppText>
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            {WALLPAPERS.map((w) => {
              const active = (c.wallpaper || "none") === w.key;
              return (
                <Pressable key={w.key} onPress={() => updateConversation(c.id, { wallpaper: w.key })} style={[styles.chip, { borderColor: active ? themeColor(c.theme) : colors.hairline, backgroundColor: active ? themeColor(c.theme) : colors.cardAlt }]}>
                  <AppText size={13} color={active ? "#fff" : colors.text}>{w.label}</AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
        {isGroup ? (
          <SettingsRow icon="create-outline" label="Group name" value={c.name} onPress={() => setPrompt("rename")} />
        ) : (
          <SettingsRow icon="pricetag-outline" label="Nickname" value={c.nickname || "None"} onPress={() => setPrompt("nickname")} />
        )}
      </SettingsGroup>

      {/* settings */}
      <SettingsGroup title="Chat settings" index={4}>
        <SettingsRow icon="notifications-off-outline" label="Mute notifications" right="switch" switchValue={!!c.muted} onSwitch={(v) => updateConversation(c.id, { muted: v })} />
      </SettingsGroup>
      <SettingsGroup title="Disappearing messages" index={5}>
        <SettingsChoice options={DISAPPEARING} value={c.disappearing || "off"} onChange={(v) => updateConversation(c.id, { disappearing: v })} />
      </SettingsGroup>

      {/* danger */}
      <View style={{ marginTop: 28, gap: 12 }}>
        {friend && (
          <DangerButton
            icon="ban-outline"
            label={blocked ? `Unblock ${friend.name.split(" ")[0]}` : `Block ${friend.name.split(" ")[0]}`}
            onPress={() =>
              blocked
                ? updateUser({ blocked: (user.blocked || []).filter((x) => x !== friend.id) })
                : confirm(`Block ${friend.name}?`, "They won't be able to message you or see your profile.", "Block", () => updateUser({ blocked: [...(user.blocked || []), friend.id] }))
            }
          />
        )}
        <DangerButton icon="trash-bin-outline" label="Clear chat" onPress={() => confirm("Clear this chat?", "All messages in this chat will be removed from this device.", "Clear", () => clearChat(c.id))} />
        <DangerButton
          icon="trash-outline"
          label={isGroup ? "Leave & delete group" : "Delete chat"}
          onPress={() =>
            confirm(isGroup ? "Leave this group?" : "Delete this chat?", "This removes the conversation from your chats.", "Delete", () => {
              deleteChat(c.id);
              navigation.dispatch(StackActions.popTo("Main"));
            })
          }
        />
      </View>

      <TextPrompt
        visible={prompt === "nickname"}
        title="Nickname"
        initial={c.nickname}
        placeholder={friend?.name}
        onSave={(v) => updateConversation(c.id, { nickname: v })}
        onClose={() => setPrompt(null)}
      />
      <TextPrompt
        visible={prompt === "rename"}
        title="Group name"
        initial={c.name}
        placeholder="Group name"
        onSave={(v) => v && updateConversation(c.id, { name: v })}
        onClose={() => setPrompt(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  quickRow: { flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 18 },
  quick: { width: 92, paddingVertical: 12, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, alignItems: "center" },
  emptyText: { textAlign: "center", paddingVertical: 14 },
  linkRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  linkIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  postThumb: { width: 46, height: 46, borderRadius: 10 },
  swatches: { flexDirection: "row", gap: 10, marginTop: 10, flexWrap: "wrap" },
  swatchRing: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  promptWrap: { flex: 1, justifyContent: "center", padding: 28 },
  prompt: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 20 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginTop: 14 },
});

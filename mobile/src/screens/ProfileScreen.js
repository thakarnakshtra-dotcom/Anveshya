import React, { useLayoutEffect, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import AppText, { AppTextInput } from "../components/AppText";
import Avatar, { VerifiedBadge } from "../components/Avatar";
import { useTheme } from "../theme/ThemeContext";
import { useUser } from "../state/UserContext";
import { useSocial } from "../state/SocialContext";
import { initialPosts, myPosts, people, reels } from "../data/social";

// ---------- links ----------
const LINKS = [
  { key: "website", icon: "link-outline", label: "Website", url: (v) => (/^https?:\/\//.test(v) ? v : `https://${v}`) },
  { key: "instagram", icon: "logo-instagram", label: "Instagram", url: (v) => (/^https?:\/\//.test(v) ? v : `https://instagram.com/${v.replace(/^@/, "")}`) },
  { key: "linkedin", icon: "logo-linkedin", label: "LinkedIn", url: (v) => (/^https?:\/\//.test(v) ? v : `https://linkedin.com/in/${v.replace(/^@/, "")}`) },
  { key: "x", icon: "logo-x", label: "X", url: (v) => (/^https?:\/\//.test(v) ? v : `https://x.com/${v.replace(/^@/, "")}`) },
];

function LinkRow({ links, own, onAdd }) {
  const { colors } = useTheme();
  const set = LINKS.filter((l) => links?.[l.key]);
  if (!set.length && !own) return null;
  return (
    <View style={styles.linkRow}>
      {set.map((l) => (
        <Pressable
          key={l.key}
          onPress={() => Linking.openURL(l.url(links[l.key])).catch(() => {})}
          accessibilityLabel={`Open ${l.label}`}
          style={({ pressed }) => [styles.linkBtn, { borderColor: colors.hairline, backgroundColor: colors.card }, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name={l.icon} size={18} color={colors.text} />
        </Pressable>
      ))}
      {own && (
        <Pressable
          onPress={onAdd}
          style={({ pressed }) => [styles.addLink, { borderColor: colors.hairline }, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="add" size={16} color={colors.textMuted} />
          <AppText size={12} muted style={{ marginLeft: 4 }}>
            {set.length ? "Edit links" : "Add links"}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

// ---------- grid ----------
function Tile({ item, size, onPress }) {
  const { colors } = useTheme();
  const source = item.image || (item.uri ? { uri: item.uri } : null);
  return (
    <Pressable onPress={onPress} style={{ width: size, height: size }}>
      {source && !item.isVideo ? (
        <Image source={source} style={[styles.tile, { width: size, height: size }]} resizeMode="cover" />
      ) : (
        <View style={[styles.tile, { width: size, height: size, backgroundColor: colors.cardAlt, alignItems: "center", justifyContent: "center" }]}>
          <Ionicons name="play" size={26} color={colors.textMuted} />
        </View>
      )}
      {item.kind === "reel" && (
        <View style={styles.tileBadge}>
          <Ionicons name="film" size={13} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

function EmptyState({ icon, title, note }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { borderColor: colors.hairline }]}>
        <Ionicons name={icon} size={26} color={colors.textMuted} />
      </View>
      <AppText medium size={15} style={{ marginTop: 12 }}>{title}</AppText>
      {note ? <AppText muted size={13} style={{ marginTop: 4, textAlign: "center" }}>{note}</AppText> : null}
    </View>
  );
}

// ---------- sheets ----------
function Sheet({ visible, onClose, children }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <View style={styles.sheetWrap} pointerEvents="box-none">
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.hairline, paddingBottom: insets.bottom + 18 }]}>
          <View style={[styles.grabber, { backgroundColor: colors.inactive }]} />
          {children}
        </View>
      </View>
    </Modal>
  );
}

function EditProfileSheet({ visible, onClose }) {
  const { colors } = useTheme();
  const { user, updateUser } = useUser();
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState(null);

  const open = () => setForm({ name: user.name, username: user.username, bio: user.bio, ...user.links });
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    updateUser({
      name: form.name.trim(),
      username: form.username.trim().replace(/^@/, "") || "explorer",
      bio: form.bio.trim(),
      links: { website: form.website.trim(), instagram: form.instagram.trim(), linkedin: form.linkedin.trim(), x: form.x.trim() },
    });
    onClose();
  };

  const field = (label, key, extra = {}) => {
    const { style: extraStyle, ...rest } = extra;
    return (
      <View style={{ marginBottom: 12 }}>
        <AppText muted size={12} style={{ marginBottom: 6 }}>{label}</AppText>
        <AppTextInput
          value={form?.[key] ?? ""}
          onChangeText={set(key)}
          style={[styles.input, { borderColor: colors.hairline, backgroundColor: colors.background }, extraStyle]}
          {...rest}
        />
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} onShow={open}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.sheetWrap} pointerEvents="box-none">
        <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.hairline, maxHeight: "88%", paddingBottom: insets.bottom + 8 }]}>
          <View style={[styles.grabber, { backgroundColor: colors.inactive }]} />
          <View style={styles.sheetHeader}>
            <Pressable onPress={onClose} hitSlop={10}>
              <AppText muted>Cancel</AppText>
            </Pressable>
            <AppText title size={17}>Edit profile</AppText>
            <Pressable onPress={save} hitSlop={10}>
              <AppText medium color={colors.primary}>Save</AppText>
            </Pressable>
          </View>
          {form && (
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
              {field("Name", "name", { placeholder: "Your name" })}
              {field("Username", "username", { autoCapitalize: "none", placeholder: "username" })}
              {field("Bio", "bio", { multiline: true, maxLength: 150, placeholder: "Tell the Parivar about you", style: { minHeight: 80, textAlignVertical: "top" } })}
              <AppText title size={14} style={{ marginTop: 6, marginBottom: 10 }}>Links</AppText>
              {field("Website", "website", { autoCapitalize: "none", keyboardType: "url", placeholder: "yoursite.com" })}
              {field("Instagram", "instagram", { autoCapitalize: "none", placeholder: "@handle" })}
              {field("LinkedIn", "linkedin", { autoCapitalize: "none", placeholder: "profile name or link" })}
              {field("X (Twitter)", "x", { autoCapitalize: "none", placeholder: "@handle" })}
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

async function pickMedia(types) {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: types,
    allowsEditing: types.length === 1 && types[0] === "images",
    aspect: [1, 1],
    quality: 0.8,
  });
  if (res.canceled || !res.assets?.length) return null;
  return res.assets[0];
}

// ---------- screen ----------
// Your own profile (no params) or someone else's (route.params.userId).
export default function ProfileScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { user, updateUser } = useUser();
  const { openDm, saved } = useSocial();
  const { width, height } = useWindowDimensions();
  const [tab, setTab] = useState(route.params?.tab === "saved" ? "saved" : "posts");
  const [editing, setEditing] = useState(!!route.params?.edit);
  const [creating, setCreating] = useState(false);
  const [following, setFollowing] = useState(false);

  const friend = route.params?.userId ? people[route.params.userId] : null;
  const own = !friend;
  const shown = friend ? { ...friend, bio: friend.bio || "Fellow explorer in the Cosmic Parivar.", links: friend.links || {} } : user;
  const displayName = shown.name || "Explorer";
  const locked = !own && friend.private && !following;

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Profile", headerTitleAlign: "center" });
  }, [navigation]);

  // grid content
  const gap = 3;
  const pad = 16;
  const tile = Math.floor((Math.min(width, 600) - pad * 2 - gap * 2) / 3);
  const postItems = useMemo(() => {
    if (own) {
      const added = user.posts || [];
      return [...added, ...myPosts.map((p, i) => ({ ...p, kind: i % 3 === 1 ? "reel" : "post" }))];
    }
    const theirPosts = initialPosts.filter((p) => p.user.id === friend.id && p.image).map((p) => ({ id: p.id, image: p.image, kind: "post" }));
    const theirReels = reels.filter((r) => r.user.id === friend.id).map((r) => ({ id: r.id, image: r.image, kind: "reel" }));
    return [...theirReels, ...theirPosts];
  }, [own, user.posts, friend]);
  const savedItems = useMemo(
    () => [
      ...reels.filter((r) => saved.has(r.id)).map((r) => ({ id: r.id, image: r.image, kind: "reel" })),
      ...initialPosts.filter((p) => saved.has(p.id) && p.image).map((p) => ({ id: p.id, image: p.image, kind: "post" })),
    ],
    [saved]
  );
  const items = tab === "posts" ? postItems : savedItems;

  const openItem = (item) => {
    if (item.kind !== "reel") return;
    const idx = reels.findIndex((r) => r.id === item.id);
    if (idx >= 0) navigation.navigate("Reels", { index: idx });
  };

  const changePhoto = async () => {
    const asset = await pickMedia(["images"]);
    if (asset) updateUser({ avatar: { uri: asset.uri } });
  };

  const addMedia = async (kind) => {
    setCreating(false);
    const asset = await pickMedia(kind === "reel" ? ["videos", "images"] : ["images"]);
    if (!asset) return;
    const item = { id: `u${Date.now()}`, uri: asset.uri, kind, isVideo: asset.type === "video" };
    updateUser({ posts: [item, ...(user.posts || [])] });
    setTab("posts");
  };

  const tabs = own
    ? [
        { key: "posts", label: "Posts", icon: "grid-outline" },
        { key: "saved", label: "Saved", icon: "bookmark-outline" },
      ]
    : [{ key: "posts", label: "Posts & Reels", icon: "grid-outline" }];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      {/* intro: picture on the left, greeting + name on the right */}
      <Animated.View entering={FadeInDown.duration(380)} style={[styles.hero, { paddingHorizontal: pad }]}>
        <View>
          <Avatar user={shown} size={92} ring ringWidth={1.5} ringColor={colors.inactive} />
          {own && (
            <Pressable
              onPress={changePhoto}
              accessibilityLabel="Change profile picture"
              hitSlop={8}
              style={[styles.editBadge, { backgroundColor: colors.primary, borderColor: colors.background }]}
            >
              <Ionicons name="camera" size={14} color="#fff" />
            </Pressable>
          )}
        </View>
        <View style={{ flex: 1, paddingLeft: 16 }}>
          <AppText muted size={14}>{own ? "Hello 👋" : "Hello 👋 This is"}</AppText>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4, flexWrap: "wrap" }}>
            <AppText title size={26} numberOfLines={2} style={{ flexShrink: 1 }}>
              {displayName}
            </AppText>
            {shown.verified && <VerifiedBadge size={18} />}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
            <AppText muted size={13}>@{shown.username}</AppText>
            {shown.private && <Ionicons name="lock-closed" size={12} color={colors.textMuted} style={{ marginLeft: 6 }} />}
          </View>
        </View>
      </Animated.View>

      {/* bio + links (hidden on private accounts you don't follow) */}
      {!locked && (
        <Animated.View entering={FadeIn.delay(120).duration(380)} style={{ paddingHorizontal: pad, marginTop: 14 }}>
          {shown.bio ? (
            <AppText style={{ lineHeight: 21 }}>{shown.bio}</AppText>
          ) : own ? (
            <AppText muted italic>Add a bio so the Parivar knows you</AppText>
          ) : null}
          <LinkRow links={shown.links} own={own} onAdd={() => setEditing(true)} />
        </Animated.View>
      )}

      {/* actions */}
      <View style={[styles.actions, { paddingHorizontal: pad }]}>
        {own ? (
          <>
            <Pressable
              onPress={() => setEditing(true)}
              style={({ pressed }) => [styles.actionBtn, { flex: 1, borderColor: colors.hairline, backgroundColor: colors.card }, pressed && { opacity: 0.7 }]}
            >
              <Ionicons name="create-outline" size={17} color={colors.text} />
              <AppText medium size={14} style={{ marginLeft: 8 }}>Edit profile</AppText>
            </Pressable>
            <Pressable
              onPress={() => setCreating(true)}
              accessibilityLabel="New post or reel"
              style={({ pressed }) => [styles.plusBtn, { backgroundColor: colors.primary }, pressed && { opacity: 0.8 }]}
            >
              <Ionicons name="add" size={24} color="#fff" />
            </Pressable>
          </>
        ) : (
          <>
            <Pressable
              onPress={() => setFollowing((f) => !f)}
              style={({ pressed }) => [
                styles.actionBtn,
                { flex: 1, backgroundColor: following ? colors.card : colors.primary, borderColor: following ? colors.hairline : colors.primary },
                pressed && { opacity: 0.8 },
              ]}
            >
              <AppText medium size={14} color={following ? colors.text : "#fff"}>
                {following ? "Following" : friend.private ? "Request to follow" : "Follow"}
              </AppText>
            </Pressable>
            <Pressable
              onPress={() => navigation.replace("Chat", { conversationId: openDm(friend) })}
              style={({ pressed }) => [styles.actionBtn, { flex: 1, borderColor: colors.hairline, backgroundColor: colors.card }, pressed && { opacity: 0.7 }]}
            >
              <AppText medium size={14}>Message</AppText>
            </Pressable>
          </>
        )}
      </View>

      {/* posts / saved — at least 40% of the screen */}
      <View style={[styles.tabsWrap, { borderColor: colors.hairline, minHeight: height * 0.4 }]}>
        {locked ? (
          <EmptyState icon="lock-closed-outline" title="This account is private" note={`Follow ${displayName.split(" ")[0]} to see their posts and reels.`} />
        ) : (
          <>
            <View style={styles.tabRow}>
              {tabs.map((t) => {
                const active = tab === t.key;
                return (
                  <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tabBtn} accessibilityRole="tab" accessibilityState={{ selected: active }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name={active ? t.icon.replace("-outline", "") : t.icon} size={17} color={active ? colors.text : colors.inactive} />
                      <AppText medium={active} size={13} color={active ? colors.text : colors.inactive} style={{ marginLeft: 6 }}>
                        {t.label}
                      </AppText>
                    </View>
                    <View style={[styles.tabLine, { backgroundColor: active ? colors.primary : "transparent" }]} />
                  </Pressable>
                );
              })}
            </View>
            {items.length ? (
              <Animated.View key={tab} entering={FadeIn.duration(250)} style={[styles.grid, { paddingHorizontal: pad, gap }]}>
                {items.map((it) => (
                  <Tile key={it.id} item={it} size={tile} onPress={() => openItem(it)} />
                ))}
              </Animated.View>
            ) : tab === "saved" ? (
              <EmptyState icon="bookmark-outline" title="Nothing saved yet" note="Tap the bookmark on a post or reel to keep it here." />
            ) : (
              <EmptyState icon="camera-outline" title="No posts yet" note={own ? "Tap + to share your first post or reel." : undefined} />
            )}
          </>
        )}
      </View>

      <EditProfileSheet visible={editing} onClose={() => setEditing(false)} />
      <Sheet visible={creating} onClose={() => setCreating(false)}>
        <AppText title size={17} style={{ marginBottom: 12 }}>Create</AppText>
        {[
          { kind: "post", icon: "image-outline", title: "New post", note: "Share a photo from your gallery" },
          { kind: "reel", icon: "film-outline", title: "New reel", note: "Share a short video" },
        ].map((o) => (
          <Pressable
            key={o.kind}
            onPress={() => addMedia(o.kind)}
            style={({ pressed }) => [styles.createRow, { borderColor: colors.hairline }, pressed && { opacity: 0.6 }]}
          >
            <View style={[styles.createIcon, { backgroundColor: colors.cardAlt }]}>
              <Ionicons name={o.icon} size={20} color={colors.text} />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText medium>{o.title}</AppText>
              <AppText muted size={12}>{o.note}</AppText>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.inactive} />
          </Pressable>
        ))}
      </Sheet>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { flexDirection: "row", alignItems: "center", marginTop: 18 },
  editBadge: { position: "absolute", right: 0, bottom: 2, width: 30, height: 30, borderRadius: 15, borderWidth: 3, alignItems: "center", justifyContent: "center" },
  linkRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 14 },
  linkBtn: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  addLink: { flexDirection: "row", alignItems: "center", height: 38, paddingHorizontal: 12, borderRadius: 19, borderWidth: 1, borderStyle: "dashed" },
  actions: { flexDirection: "row", gap: 10, marginTop: 20 },
  actionBtn: { height: 44, borderRadius: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  plusBtn: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  tabsWrap: { marginTop: 22, borderTopWidth: StyleSheet.hairlineWidth },
  tabRow: { flexDirection: "row", marginBottom: 12 },
  tabBtn: { flex: 1, alignItems: "center", paddingTop: 12 },
  tabLine: { height: 2, width: 44, borderRadius: 1, marginTop: 10 },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  tile: { borderRadius: 10 },
  tileBadge: { position: "absolute", top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" },
  empty: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 30 },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  sheetWrap: { flex: 1, justifyContent: "flex-end" },
  sheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, borderWidth: StyleSheet.hairlineWidth, borderBottomWidth: 0, paddingHorizontal: 20, paddingTop: 10 },
  grabber: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  createRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
  createIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});

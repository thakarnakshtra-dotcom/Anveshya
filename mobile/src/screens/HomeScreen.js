import React, { useMemo, useRef, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import AppText, { AppTextInput } from "../components/AppText";
import Avatar, { VerifiedBadge } from "../components/Avatar";
import ShareSheet from "../components/ShareSheet";
import { Card } from "../components/ui";
import { useTabBarSpace } from "../components/TabBar";
import { useTheme } from "../theme/ThemeContext";
import { useSocial } from "../state/SocialContext";
import { useUser } from "../state/UserContext";
import { reels, timeAgo } from "../data/social";
import { useOpenProfile } from "../utils/nav";

// ---------- Reel (in the feed) ----------
// Reels sit in the feed between posts; tapping one opens the full-screen
// reels viewer at that reel.
function ReelCard({ reel, index, onOpen }) {
  const { colors } = useTheme();
  const openProfile = useOpenProfile();
  return (
    <Card index={index} style={styles.feedCard}>
      <View style={styles.postHeader}>
        <Pressable onPress={() => openProfile(reel.user)} hitSlop={4}>
          <Avatar user={reel.user} size={38} />
        </Pressable>
        <Pressable onPress={() => openProfile(reel.user)} style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AppText medium>{reel.user.name}</AppText>
            {reel.user.verified && <VerifiedBadge />}
          </View>
          <AppText muted size={12}>@{reel.user.username} · Reel</AppText>
        </Pressable>
        <Ionicons name="film-outline" size={18} color={colors.inactive} />
      </View>
      <Pressable onPress={onOpen}>
        <View style={styles.reelMedia}>
          <Image source={reel.image} style={StyleSheet.absoluteFill} resizeMode="cover" />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.75)"]} style={StyleSheet.absoluteFill} />
          <View style={styles.playBtn}>
            <Ionicons name="play" size={24} color="#fff" style={{ marginLeft: 3 }} />
          </View>
          <View style={styles.reelMeta}>
            <AppText size={15} color="#fff" numberOfLines={2}>{reel.title}</AppText>
            <AppText size={11} color="#ddd" style={{ marginTop: 4 }}>
              {reel.views} views · {reel.duration}
            </AppText>
          </View>
        </View>
      </Pressable>
    </Card>
  );
}

// ---------- Post ----------
export function PostCard({ post, index, onShare }) {
  const openProfile = useOpenProfile();
  const { colors } = useTheme();
  const { liked, toggleLike, addComment, saved, toggleSave } = useSocial();
  const { user, settings } = useUser();
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const isLiked = liked.has(post.id);
  const heart = useSharedValue(1);
  const bigHeart = useSharedValue(0);

  const like = () => {
    heart.value = withSequence(withSpring(1.4), withSpring(1));
    toggleLike(post.id);
  };
  const doubleTapLike = () => {
    bigHeart.value = withSequence(withSpring(1), withTiming(0, { duration: 400 }));
    if (!isLiked) like();
  };

  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heart.value }] }));
  const bigHeartStyle = useAnimatedStyle(() => ({ opacity: bigHeart.value, transform: [{ scale: 0.5 + bigHeart.value * 0.7 }] }));

  const lastTap = useRef(0);
  const onImagePress = () => {
    const t = Date.now();
    if (t - lastTap.current < 300) doubleTapLike();
    lastTap.current = t;
  };

  const submit = () => {
    if (!draft.trim()) return;
    addComment(post.id, { ...user, name: user.name || "You" }, draft.trim());
    setDraft("");
  };

  return (
    <Card index={index} style={styles.feedCard}>
      <View style={styles.postHeader}>
        <Pressable onPress={() => openProfile(post.user)} hitSlop={4}>
          <Avatar user={post.user} size={40} />
        </Pressable>
        <Pressable onPress={() => openProfile(post.user)} style={{ flex: 1, marginLeft: 10 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <AppText medium>{post.user.name}</AppText>
            {post.user.verified && <VerifiedBadge />}
          </View>
          <AppText muted size={12}>
            @{post.user.username} · {timeAgo(post.time)}
          </AppText>
        </Pressable>
        <Ionicons name="ellipsis-horizontal" size={18} color={colors.inactive} />
      </View>

      <AppText style={{ paddingHorizontal: 14, paddingBottom: 12, lineHeight: 22 }}>{post.text}</AppText>

      {post.image && (
        <Pressable onPress={onImagePress}>
          <Image source={post.image} style={styles.postImage} resizeMode="cover" />
          <Animated.View style={[styles.bigHeart, bigHeartStyle]} pointerEvents="none">
            <Ionicons name="heart" size={96} color={colors.primary} />
          </Animated.View>
        </Pressable>
      )}

      <View style={styles.actions}>
        <Pressable onPress={like} style={styles.action} hitSlop={6}>
          <Animated.View style={heartStyle}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={24} color={isLiked ? colors.primary : colors.text} />
          </Animated.View>
          {!settings.hideLikeCounts && <AppText size={13} style={{ marginLeft: 6 }}>{post.likes}</AppText>}
        </Pressable>
        <Pressable onPress={() => setShowComments((v) => !v)} style={styles.action} hitSlop={6}>
          <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
          <AppText size={13} style={{ marginLeft: 6 }}>{post.comments.length}</AppText>
        </Pressable>
        <Pressable onPress={() => onShare(post)} style={styles.action} hitSlop={6}>
          <Ionicons name="paper-plane-outline" size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={() => toggleSave(post.id)} hitSlop={6} accessibilityLabel="Save post">
          <Ionicons name={saved.has(post.id) ? "bookmark" : "bookmark-outline"} size={22} color={saved.has(post.id) ? colors.primary : colors.text} />
        </Pressable>
      </View>

      {showComments && (
        <View style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
          {post.comments.map((c) => (
            <View key={c.id} style={{ flexDirection: "row", marginBottom: 6 }}>
              <AppText medium size={13} color={colors.primary} onPress={() => openProfile(c.user)}>{c.user.name.split(" ")[0]} </AppText>
              <AppText size={13} style={{ flex: 1 }}>{c.text}</AppText>
            </View>
          ))}
          <View style={[styles.commentBox, { borderColor: colors.hairline }]}>
            <AppTextInput value={draft} onChangeText={setDraft} placeholder="Add a comment…" style={{ flex: 1, paddingVertical: 8 }} onSubmitEditing={submit} returnKeyType="send" />
            <Pressable onPress={submit} hitSlop={8}>
              <Ionicons name="send" size={18} color={colors.primary} />
            </Pressable>
          </View>
        </View>
      )}
    </Card>
  );
}

// Posts and reels mixed in one feed: a reel after every two posts.
function buildFeed(posts) {
  const out = [];
  let r = 0;
  posts.forEach((p, i) => {
    out.push({ kind: "post", key: p.id, post: p });
    if (i % 2 === 1 && r < reels.length) {
      out.push({ kind: "reel", key: reels[r].id, reel: reels[r], reelIndex: r });
      r += 1;
    }
  });
  for (; r < reels.length; r++) out.push({ kind: "reel", key: reels[r].id, reel: reels[r], reelIndex: r });
  return out;
}

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const { posts } = useSocial();
  const bottom = useTabBarSpace();
  const [sharing, setSharing] = useState(null);
  const feed = useMemo(() => buildFeed(posts), [posts]);
  const openReels = (index = 0) => navigation.navigate("Reels", { index });

  const header = (
    <View style={styles.feedHeader}>
      <AppText title size={18}>Feed</AppText>
      <Pressable
        onPress={() => openReels(0)}
        hitSlop={10}
        accessibilityLabel="Open reels"
        style={[styles.reelsBtn, { borderColor: colors.hairline, backgroundColor: colors.card }]}
      >
        <Ionicons name="film-outline" size={16} color={colors.text} />
        <AppText size={12} style={{ marginLeft: 5 }}>Reels</AppText>
      </Pressable>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={feed}
        keyExtractor={(f) => f.key}
        ListHeaderComponent={header}
        renderItem={({ item, index }) =>
          item.kind === "post" ? (
            <PostCard post={item.post} index={index} onShare={setSharing} />
          ) : (
            <ReelCard reel={item.reel} index={index} onOpen={() => openReels(item.reelIndex)} />
          )
        }
        contentContainerStyle={{ paddingBottom: bottom }}
        showsVerticalScrollIndicator={false}
      />
      <ShareSheet
        post={sharing}
        onClose={() => setSharing(null)}
        onShared={(friend, convId) => {
          setSharing(null);
          navigation.navigate("Chat", { conversationId: convId });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  feedHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingTop: 14, paddingBottom: 10 },
  reelsBtn: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  // wider cards: small side margin, still rounded
  feedCard: { marginHorizontal: 6, marginBottom: 12, padding: 0, overflow: "hidden", borderRadius: 18 },
  reelMedia: { width: "100%", aspectRatio: 0.8, justifyContent: "flex-end" },
  playBtn: {
    position: "absolute",
    top: "42%",
    alignSelf: "center",
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(125,26,39,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  reelMeta: { padding: 14 },
  postHeader: { flexDirection: "row", alignItems: "center", padding: 12 },
  postImage: { width: "100%", aspectRatio: 1.4 },
  bigHeart: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center" },
  actions: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, gap: 18 },
  action: { flexDirection: "row", alignItems: "center" },
  commentBox: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, marginTop: 6, paddingTop: 4 },
});

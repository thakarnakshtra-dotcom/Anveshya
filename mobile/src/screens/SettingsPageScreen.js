import React, { useLayoutEffect, useState } from "react";
import { Image, LayoutAnimation, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "../components/AppText";
import { EmptyNote, SettingsChoice, SettingsGroup, SettingsRow } from "../components/settings";
import { useTheme } from "../theme/ThemeContext";
import { useUser } from "../state/UserContext";
import { useSocial } from "../state/SocialContext";
import { reels, timeAgo } from "../data/social";

const fmtDate = (t) => new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

// ---------- Your activity ----------
function ActivityHome({ go }) {
  const { liked, posts, watched } = useSocial();
  const { user } = useUser();
  const myComments = posts.reduce((n, p) => n + p.comments.filter((c) => c.user.id === "me").length, 0);
  return (
    <>
      <SettingsGroup title="Interactions" index={0}>
        <SettingsRow icon="heart-outline" label="Likes" value={String(liked.size)} onPress={go("act-likes", "Likes")} />
        <SettingsRow icon="chatbubble-outline" label="Comments" value={String(myComments)} onPress={go("act-comments", "Comments")} />
        <SettingsRow icon="pricetag-outline" label="Tags" sub="Posts you've been tagged in" onPress={go("act-tags", "Tags")} />
      </SettingsGroup>
      <SettingsGroup title="History" index={1}>
        <SettingsRow icon="play-circle-outline" label="Watch history" value={String(watched.length)} onPress={go("act-watch", "Watch history")} />
        <SettingsRow icon="person-circle-outline" label="Account history" sub="Changes you've made to your account" onPress={go("act-account", "Account history")} />
        <SettingsRow icon="trash-bin-outline" label="Recently deleted" sub="Kept for 30 days before removal" onPress={go("act-deleted", "Recently deleted")} />
      </SettingsGroup>
      {user.createdAt ? (
        <AppText muted size={12} style={{ textAlign: "center", marginTop: 18 }}>
          Member since {fmtDate(user.createdAt)}
        </AppText>
      ) : null}
    </>
  );
}

function PostRow({ post, extra }) {
  const { colors } = useTheme();
  return (
    <View style={styles.listRow}>
      {post.image ? (
        <Image source={post.image} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, { backgroundColor: colors.cardAlt, alignItems: "center", justifyContent: "center" }]}>
          <Ionicons name="document-text-outline" size={18} color={colors.textMuted} />
        </View>
      )}
      <View style={{ flex: 1, marginLeft: 12 }}>
        <AppText medium size={13}>{post.user.name}</AppText>
        <AppText muted size={13} numberOfLines={2} style={{ marginTop: 2 }}>{extra || post.text}</AppText>
      </View>
    </View>
  );
}

function ActLikes() {
  const { liked, posts, toggleLike } = useSocial();
  const { colors } = useTheme();
  const list = posts.filter((p) => liked.has(p.id));
  if (!list.length) return <EmptyNote icon="heart-outline" title="No likes yet" note="Posts you like will show up here." />;
  return (
    <SettingsGroup>
      {list.map((p) => (
        <View key={p.id} style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1 }}><PostRow post={p} /></View>
          <Pressable onPress={() => toggleLike(p.id)} hitSlop={8} accessibilityLabel="Unlike">
            <Ionicons name="heart" size={20} color={colors.primary} />
          </Pressable>
        </View>
      ))}
    </SettingsGroup>
  );
}

function ActComments() {
  const { posts } = useSocial();
  const mine = posts.flatMap((p) => p.comments.filter((c) => c.user.id === "me").map((c) => ({ post: p, c })));
  if (!mine.length) return <EmptyNote icon="chatbubble-outline" title="No comments yet" note="Comments you write on posts will show up here." />;
  return (
    <SettingsGroup>
      {mine.map(({ post, c }) => (
        <PostRow key={c.id} post={post} extra={`You: ${c.text}`} />
      ))}
    </SettingsGroup>
  );
}

function ActWatch() {
  const { watched } = useSocial();
  const list = watched.map((w) => ({ ...w, reel: reels.find((r) => r.id === w.id) })).filter((w) => w.reel);
  if (!list.length) return <EmptyNote icon="play-circle-outline" title="Nothing watched yet" note="Reels you open will show up here." />;
  return (
    <SettingsGroup>
      {list.map((w) => (
        <View key={w.id} style={styles.listRow}>
          <Image source={w.reel.image} style={styles.thumb} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <AppText medium size={13} numberOfLines={1}>{w.reel.title}</AppText>
            <AppText muted size={12} style={{ marginTop: 2 }}>{w.reel.user.name} · {timeAgo(w.time)} ago</AppText>
          </View>
        </View>
      ))}
    </SettingsGroup>
  );
}

function ActAccount() {
  const { user } = useUser();
  const list = user.history || [];
  if (!list.length) return <EmptyNote icon="person-circle-outline" title="No changes yet" />;
  return (
    <SettingsGroup>
      {list.map((h) => (
        <SettingsRow key={h.id} icon="ellipse-outline" label={h.text} sub={fmtDate(h.time)} right="none" />
      ))}
    </SettingsGroup>
  );
}

// ---------- Posts & reels ----------
function PostsSettings() {
  const { settings, updateSettings } = useUser();
  return (
    <>
      <SettingsGroup title="Likes & sharing" index={0}>
        <SettingsRow
          icon="heart-dislike-outline"
          label="Hide like counts"
          sub="Like counts won't show on posts in your feed"
          right="switch"
          switchValue={settings.hideLikeCounts}
          onSwitch={(v) => updateSettings({ hideLikeCounts: v })}
        />
        <SettingsRow
          icon="paper-plane-outline"
          label="Allow sharing to chats"
          sub="Let people send your posts and reels to friends"
          right="switch"
          switchValue={settings.allowSharing}
          onSwitch={(v) => updateSettings({ allowSharing: v })}
        />
      </SettingsGroup>
      <SettingsGroup title="Who can comment" index={1}>
        <SettingsChoice
          value={settings.allowComments}
          onChange={(v) => updateSettings({ allowComments: v })}
          options={[
            { value: "everyone", label: "Everyone" },
            { value: "followers", label: "People you follow back" },
            { value: "off", label: "Turn off comments" },
          ]}
        />
      </SettingsGroup>
      <SettingsGroup title="Reels" index={2}>
        <SettingsRow
          icon="play-outline"
          label="Autoplay reels"
          sub="Start playing as soon as a reel is on screen"
          right="switch"
          switchValue={settings.autoplayReels}
          onSwitch={(v) => updateSettings({ autoplayReels: v })}
        />
      </SettingsGroup>
    </>
  );
}

// ---------- Notifications ----------
function NotificationSettings() {
  const { settings, updateSettings } = useUser();
  const paused = settings.notifyPauseAll;
  const row = (key, icon, label, sub) => (
    <SettingsRow key={key} icon={icon} label={label} sub={sub} right="switch" disabled={paused} switchValue={settings[key]} onSwitch={(v) => updateSettings({ [key]: v })} />
  );
  return (
    <>
      <SettingsGroup index={0}>
        <SettingsRow icon="moon-outline" label="Pause all" sub="Temporarily mute every notification" right="switch" switchValue={paused} onSwitch={(v) => updateSettings({ notifyPauseAll: v })} />
      </SettingsGroup>
      <SettingsGroup title="Social" index={1}>
        {row("notifyLikes", "heart-outline", "Likes")}
        {row("notifyComments", "chatbubble-outline", "Comments")}
        {row("notifyFollowers", "person-add-outline", "New followers")}
        {row("notifyMessages", "mail-outline", "Messages")}
      </SettingsGroup>
      <SettingsGroup title="Space" index={2}>
        {row("notifySkyEvents", "planet-outline", "Launches & sky events", "Eclipses, meteor showers, upcoming launches")}
        {row("notifyNews", "newspaper-outline", "News updates", "New stories from NASA, ISRO and ESA")}
      </SettingsGroup>
    </>
  );
}

// ---------- Help ----------
const FAQ = [
  { q: "What is Anveshya?", a: "A space-exploration app: a social feed for the Cosmic Parivar, interactive 3D explorers, sourced lessons on ancient and modern astronomy, and live space news." },
  { q: "Why do Explore, Learn and News need internet?", a: "They load live content — 3D scenes, real NASA/ISRO/ESA news, launch schedules and space-weather data — so they're always current." },
  { q: "How do I make my account private?", a: "Settings → Account settings → Private account. Only followers you approve can then see your posts, reels, bio and links." },
  { q: "How do I save a post or reel?", a: "Tap the bookmark icon on any post or reel. Everything you save appears under Saved on your profile." },
  { q: "How do I switch between dark and light mode?", a: "Use the sun/moon button at the top of any page, or Settings → Appearance (Dark, Light or follow your phone with System)." },
  { q: "Where is my data stored?", a: "In this version, your profile, posts and settings are stored on this device. Deleting your account removes them from the device." },
];

function Help() {
  const { colors } = useTheme();
  const [open, setOpen] = useState(0);
  return (
    <SettingsGroup title="Frequently asked" index={0}>
      {FAQ.map((f, i) => {
        const isOpen = open === i;
        return (
          <Pressable
            key={i}
            onPress={() => {
              LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
              setOpen(isOpen ? -1 : i);
            }}
            style={{ paddingVertical: 14 }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <AppText medium size={14} style={{ flex: 1, paddingRight: 10 }}>{f.q}</AppText>
              <Ionicons name={isOpen ? "remove" : "add"} size={18} color={colors.textMuted} />
            </View>
            {isOpen && <AppText muted size={13} style={{ marginTop: 8, lineHeight: 20 }}>{f.a}</AppText>}
          </Pressable>
        );
      })}
    </SettingsGroup>
  );
}

// ---------- router ----------
export default function SettingsPageScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { user } = useUser();
  const { page, title } = route.params || {};

  useLayoutEffect(() => {
    navigation.setOptions({ title: title || "Settings", headerTitleAlign: "center" });
  }, [navigation, title]);

  const go = (p, t) => () => navigation.push("SettingsPage", { page: p, title: t });

  let body = null;
  switch (page) {
    case "activity": body = <ActivityHome go={go} />; break;
    case "act-likes": body = <ActLikes />; break;
    case "act-comments": body = <ActComments />; break;
    case "act-tags": body = <EmptyNote icon="pricetag-outline" title="No tags yet" note="When someone tags you in a post, it will appear here." />; break;
    case "act-watch": body = <ActWatch />; break;
    case "act-account": body = <ActAccount />; break;
    case "act-deleted": body = <EmptyNote icon="trash-bin-outline" title="Nothing recently deleted" note="Posts and reels you delete stay here for 30 days, so you can restore them." />; break;
    case "posts": body = <PostsSettings />; break;
    case "notifications": body = <NotificationSettings />; break;
    case "blocked":
      body = user.blocked?.length ? null : <EmptyNote icon="ban-outline" title="No blocked accounts" note="People you block can't see your profile or message you." />;
      break;
    case "help": body = <Help />; break;
    default: body = null;
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
      {body}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  listRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  thumb: { width: 46, height: 46, borderRadius: 10 },
});

import React, { useLayoutEffect } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import AppText from "../components/AppText";
import Avatar from "../components/Avatar";
import { DangerButton, SettingsGroup, SettingsRow } from "../components/settings";
import { Segmented } from "../components/ui";
import { useTheme } from "../theme/ThemeContext";
import { useUser } from "../state/UserContext";

const APP_VERSION = "1.0.0 (Phase 1)";

function confirm(title, message, actionLabel, onConfirm) {
  if (Platform.OS === "web") {
    // eslint-disable-next-line no-alert
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: "Cancel", style: "cancel" },
    { text: actionLabel, style: "destructive", onPress: onConfirm },
  ]);
}

// "My account" — the Settings page, opened from the profile menu.
export default function AccountScreen({ navigation }) {
  const { colors, preference, setPreference } = useTheme();
  const { user, settings, updateUser, updateSettings, logout, deleteAccount } = useUser();
  const name = user.name || "Explorer";

  useLayoutEffect(() => {
    navigation.setOptions({ title: "Settings", headerTitleAlign: "center" });
  }, [navigation]);

  const page = (key, title) => () => navigation.navigate("SettingsPage", { page: key, title });
  const web = (title, path) => () => navigation.navigate("Website", { title, path });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
      {/* profile summary */}
      <Animated.View entering={FadeInDown.duration(360)} style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.hairline }]}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <AppText muted size={13}>Hello 👋</AppText>
            <AppText title size={22} numberOfLines={1} style={{ marginTop: 2 }}>
              {name}
            </AppText>
            <AppText muted size={13} style={{ marginTop: 2 }}>@{user.username}</AppText>
          </View>
          <Pressable onPress={() => navigation.navigate("Profile")} accessibilityLabel="View profile">
            <Avatar user={user} size={60} ring ringWidth={1} ringColor={colors.inactive} />
          </Pressable>
        </View>
        <Pressable
          onPress={() => navigation.navigate("Profile", { edit: true })}
          style={({ pressed }) => [styles.editBtn, { borderColor: colors.hairline, backgroundColor: colors.cardAlt }, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="create-outline" size={16} color={colors.text} />
          <AppText medium size={13} style={{ marginLeft: 6 }}>Edit profile</AppText>
        </Pressable>
      </Animated.View>

      {/* account */}
      <SettingsGroup title="Account settings" index={1}>
        <SettingsRow
          icon={user.private ? "lock-closed-outline" : "globe-outline"}
          label="Private account"
          sub={user.private ? "Only followers you approve can see your posts" : "Anyone can see your posts and reels"}
          right="switch"
          switchValue={user.private}
          onSwitch={(v) => updateUser({ private: v })}
        />
        <SettingsRow icon="bookmark-outline" label="Saved" sub="Posts and reels you bookmarked" onPress={() => navigation.navigate("Profile", { tab: "saved" })} />
        <SettingsRow icon="time-outline" label="Your activity" sub="Likes, comments, tags, watch & account history, recently deleted" onPress={page("activity", "Your activity")} />
        <SettingsRow icon="images-outline" label="Posts & reels" sub="Likes, comments, sharing and autoplay" onPress={page("posts", "Posts & reels")} />
        <SettingsRow icon="ban-outline" label="Blocked accounts" value={String(user.blocked?.length || 0)} onPress={page("blocked", "Blocked accounts")} />
      </SettingsGroup>

      {/* app */}
      <SettingsGroup title="App settings" index={2}>
        <View style={{ paddingVertical: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
            <View style={[styles.iconWrap, { backgroundColor: colors.cardAlt }]}>
              <Ionicons name="contrast-outline" size={18} color={colors.text} />
            </View>
            <AppText size={15} style={{ marginLeft: 12 }}>Appearance</AppText>
          </View>
          <Segmented
            value={preference}
            onChange={setPreference}
            options={[
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
              { value: "system", label: "System" },
            ]}
          />
        </View>
        <SettingsRow icon="notifications-outline" label="Notifications" value={settings.notifyPauseAll ? "Paused" : "On"} onPress={page("notifications", "Notifications")} />
        <SettingsRow
          icon="cellular-outline"
          label="Data saver"
          sub="Don't autoplay reels on mobile data"
          right="switch"
          switchValue={settings.dataSaver}
          onSwitch={(v) => updateSettings({ dataSaver: v })}
        />
        <SettingsRow icon="language-outline" label="Language" value="English" right="none" />
      </SettingsGroup>

      <SettingsGroup title="Support & about" index={3}>
        <SettingsRow icon="information-circle-outline" label="About Anveshya" onPress={web("About Anveshya", "/about")} />
        <SettingsRow icon="help-buoy-outline" label="Help & FAQ" onPress={page("help", "Help & FAQ")} />
        <SettingsRow icon="document-text-outline" label="Terms & conditions" onPress={web("Terms & conditions", "/terms")} />
        <SettingsRow icon="shield-checkmark-outline" label="Privacy policy" onPress={web("Privacy policy", "/privacy")} />
        <SettingsRow icon="phone-portrait-outline" label="App version" value={APP_VERSION} right="none" />
      </SettingsGroup>

      {/* danger zone */}
      <View style={{ marginTop: 28, gap: 12 }}>
        <DangerButton
          icon="log-out-outline"
          label="Log out"
          onPress={() =>
            confirm("Log out?", "You'll be signed out of Anveshya on this device.", "Log out", () => {
              logout();
              navigation.goBack();
            })
          }
        />
        <DangerButton
          icon="trash-outline"
          label="Delete my account"
          onPress={() =>
            confirm(
              "Delete your account?",
              "This permanently removes your profile, posts, saved items and settings from this device. It can't be undone.",
              "Delete",
              async () => {
                await deleteAccount();
                navigation.goBack();
              }
            )
          }
        />
      </View>
      <AppText muted size={11} style={{ textAlign: "center", marginTop: 18 }}>
        Anveshya · Cosmic Parivar
      </AppText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: 20, borderWidth: StyleSheet.hairlineWidth, padding: 16 },
  editBtn: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", marginTop: 14, height: 34, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});

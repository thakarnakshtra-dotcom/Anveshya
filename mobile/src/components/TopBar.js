import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { ZoomIn, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import AppText from "./AppText";
import Avatar from "./Avatar";
import BrandLogo from "./BrandLogo";
import { useTheme } from "../theme/ThemeContext";
import { useUser } from "../state/UserContext";

// Small dropdown under the profile picture: View profile / My account.
function ProfileMenu({ visible, top, onClose, onViewProfile, onMyAccount }) {
  const { colors } = useTheme();
  const item = (icon, label, onPress) => (
    <Pressable
      onPress={() => {
        onClose();
        onPress && onPress();
      }}
      style={({ pressed }) => [styles.menuItem, pressed && { backgroundColor: colors.cardAlt }]}
    >
      <Ionicons name={icon} size={18} color={colors.text} />
      <AppText size={14} style={{ marginLeft: 10 }}>
        {label}
      </AppText>
    </Pressable>
  );
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <Animated.View
        entering={ZoomIn.duration(160)}
        style={[styles.menu, { top, backgroundColor: colors.card, borderColor: colors.hairline }]}
      >
        {item("person-outline", "View profile", onViewProfile)}
        <View style={[styles.menuDivider, { backgroundColor: colors.hairline }]} />
        {item("settings-outline", "My account", onMyAccount)}
      </Animated.View>
    </Modal>
  );
}

// Left: small logo + page name. Right: theme toggle + profile picture.
export default function TopBar({ title, onViewProfile, onMyAccount, onSearch }) {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggle } = useTheme();
  const { user } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const spin = useSharedValue(0);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }, { scale: 1 - Math.abs(Math.sin((spin.value * Math.PI) / 180)) * 0.25 }],
  }));

  const onToggle = () => {
    spin.value = withSequence(withTiming(180, { duration: 260 }), withTiming(0, { duration: 0 }));
    toggle();
  };

  return (
    <View style={[styles.wrap, { paddingTop: insets.top + 14, backgroundColor: colors.header, borderBottomColor: colors.hairline }]}>
      <View style={styles.left}>
        <BrandLogo size={30} tint={colors.text} fill={colors.header} />
        <AppText title size={20} style={{ marginLeft: 8 }}>
          {title}
        </AppText>
      </View>
      <View style={styles.right}>
        <Pressable onPress={onSearch} hitSlop={8} accessibilityLabel="Search Anveshya" style={[styles.iconBtn, { borderColor: colors.hairline }]}>
          <Ionicons name="search" size={17} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={onToggle}
          hitSlop={8}
          accessibilityLabel={isDark ? "Switch to light mode" : "Switch to dark mode"}
          style={[styles.iconBtn, { borderColor: colors.hairline }]}
        >
          <Animated.View style={iconStyle}>
            {/* shows the mode you'd switch TO: sun in dark mode, moon in light mode */}
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={18} color={colors.text} />
          </Animated.View>
        </Pressable>
        <Pressable onPress={() => setMenuOpen(true)} hitSlop={8} accessibilityLabel="Profile menu">
          <Avatar user={user} size={34} ring ringWidth={1} ringColor={colors.inactive} />
        </Pressable>
      </View>
      <ProfileMenu
        visible={menuOpen}
        top={insets.top + 60}
        onClose={() => setMenuOpen(false)}
        onViewProfile={onViewProfile}
        onMyAccount={onMyAccount}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  left: { flexDirection: "row", alignItems: "center" },
  right: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  menu: {
    position: "absolute",
    right: 12,
    minWidth: 180,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  menuItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 11 },
  menuDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: 10 },
});

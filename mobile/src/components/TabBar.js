import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import AppText from "./AppText";
import { useTheme } from "../theme/ThemeContext";
import { useSocial } from "../state/SocialContext";

export const TAB_ICONS = {
  Home: ["home", "home-outline"],
  Explore: ["compass", "compass-outline"],
  Learn: ["book", "book-outline"],
  News: ["newspaper", "newspaper-outline"],
  Share: ["chatbubbles", "chatbubbles-outline"],
};

export const TAB_BAR_HEIGHT = 68;

// Space screens should leave at the bottom so content isn't hidden behind
// the floating bar.
export function useTabBarSpace() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + Math.max(insets.bottom, 12) + 24;
}

function TabButton({ focused, icons, onPress, onLongPress, label, colors, badge }) {
  const scale = useSharedValue(focused ? 1.08 : 1);
  useEffect(() => {
    scale.value = withSpring(focused ? 1.08 : 1, { damping: 12, stiffness: 180 });
  }, [focused]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      accessibilityRole="button"
      accessibilityState={focused ? { selected: true } : {}}
      accessibilityLabel={label}
      style={styles.tab}
    >
      <Animated.View style={style}>
        <Ionicons name={focused ? icons[0] : icons[1]} size={22} color={focused ? colors.primary : colors.inactive} />
        {badge > 0 && <View style={[styles.badge, { backgroundColor: colors.primary, borderColor: colors.background }]} />}
      </Animated.View>
      <AppText size={10} color={focused ? colors.primary : colors.inactive} style={styles.label} numberOfLines={1}>
        {label}
      </AppText>
    </Pressable>
  );
}

// Transparent, curved bottom bar: icon + small thin label, thin off-white
// border, and a sliding maroon indicator.
export default function TabBar({ state, navigation }) {
  const { colors, isDark } = useTheme();
  const { unreadCount } = useSocial();
  const insets = useSafeAreaInsets();
  const [width, setWidth] = useState(0);
  const tabW = width / state.routes.length;
  const x = useSharedValue(0);

  useEffect(() => {
    if (tabW) x.value = withSpring(state.index * tabW, { damping: 16, stiffness: 160 });
  }, [state.index, tabW]);

  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View pointerEvents="box-none" style={[styles.outer, { bottom: Math.max(insets.bottom, 12) }]}>
      <View style={[styles.bar, { borderColor: colors.navBorder }]} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        <BlurView
          intensity={Platform.OS === "android" ? 0 : 40}
          tint={isDark ? "dark" : "light"}
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.navGlass }]}
        />
        {tabW > 0 && (
          <Animated.View style={[styles.indicatorTrack, { width: tabW }, indicator]}>
            <View style={[styles.indicator, { backgroundColor: colors.primary }]} />
          </Animated.View>
        )}
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          const onLongPress = () => navigation.emit({ type: "tabLongPress", target: route.key });
          return (
            <TabButton
              key={route.key}
              focused={focused}
              icons={TAB_ICONS[route.name]}
              label={route.name}
              onPress={onPress}
              onLongPress={onLongPress}
              colors={colors}
              badge={route.name === "Share" ? unreadCount : 0}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { position: "absolute", left: 16, right: 16 },
  bar: {
    height: TAB_BAR_HEIGHT,
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth * 2,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
  },
  tab: { flex: 1, height: "100%", alignItems: "center", justifyContent: "center" },
  label: { marginTop: 3, letterSpacing: 0.2 },
  indicatorTrack: { position: "absolute", bottom: 4, left: 0, alignItems: "center" },
  indicator: { width: 16, height: 2, borderRadius: 1 },
  badge: { position: "absolute", top: -2, right: -4, width: 10, height: 10, borderRadius: 5, borderWidth: 2 },
});

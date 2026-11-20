import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import AppText from "./AppText";
import { useTheme } from "../theme/ThemeContext";

export function Card({ style, children, entering = true, index = 0, ...rest }) {
  const { colors } = useTheme();
  const Comp = entering ? Animated.View : View;
  return (
    <Comp
      entering={entering ? FadeInDown.delay(Math.min(index, 8) * 60).duration(380) : undefined}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.hairline }, style]}
      {...rest}
    >
      {children}
    </Comp>
  );
}

// Pill-shaped segmented control used for sub-tabs across screens.
export function Segmented({ options, value, onChange, style }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.segWrap, { backgroundColor: colors.card, borderColor: colors.hairline }, style]}>
      {options.map((o) => {
        const key = typeof o === "string" ? o : o.value;
        const label = typeof o === "string" ? o : o.label;
        const active = key === value;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            style={[styles.seg, active && { backgroundColor: colors.primary }]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <AppText size={13} color={active ? "#fff" : colors.textMuted}>
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SectionTitle({ children, right, style }) {
  return (
    <View style={[styles.sectionRow, style]}>
      <AppText title size={18}>{children}</AppText>
      {right}
    </View>
  );
}

export function Tag({ label, color }) {
  const { colors } = useTheme();
  const c = color || colors.primary;
  return (
    <View style={[styles.tag, { borderColor: c }]}>
      <AppText size={11} color={c}>
        {label}
      </AppText>
    </View>
  );
}

export function Button({ label, onPress, variant = "primary", style, icon }) {
  const { colors } = useTheme();
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: primary ? colors.primary : "transparent", borderColor: colors.primary, opacity: pressed ? 0.75 : 1 },
        style,
      ]}
    >
      {icon}
      <AppText medium size={14} color={primary ? "#fff" : colors.primary}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, padding: 14 },
  segWrap: { flexDirection: "row", borderRadius: 999, borderWidth: 1, padding: 4 },
  seg: { flex: 1, paddingVertical: 8, borderRadius: 999, alignItems: "center" },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  tag: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2, alignSelf: "flex-start" },
  btn: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
});

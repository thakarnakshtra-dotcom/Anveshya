import React from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import AppText from "./AppText";
import { useTheme } from "../theme/ThemeContext";

// Building blocks shared by the Settings page and its sub-pages.

export function SettingsGroup({ title, children, index = 0, style }) {
  const { colors } = useTheme();
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 60).duration(360)} style={[{ marginTop: 22 }, style]}>
      {title ? (
        <AppText title size={15} style={{ marginBottom: 8, marginLeft: 6 }}>
          {title}
        </AppText>
      ) : null}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.hairline }]}>
        {rows.map((child, i) => (
          <View key={i}>
            {child}
            {i < rows.length - 1 && <View style={[styles.divider, { backgroundColor: colors.hairline }]} />}
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

// right: "chevron" (default) | "switch" | "none"
export function SettingsRow({ icon, label, sub, value, onPress, right = "chevron", switchValue, onSwitch, disabled }) {
  const { colors } = useTheme();
  const isSwitch = right === "switch";
  const content = (
    <View style={[styles.row, disabled && { opacity: 0.45 }]}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: colors.cardAlt }]}>
          <Ionicons name={icon} size={18} color={colors.text} />
        </View>
      ) : null}
      <View style={{ flex: 1, marginLeft: icon ? 12 : 0 }}>
        <AppText size={15}>{label}</AppText>
        {sub ? (
          <AppText muted size={12} style={{ marginTop: 2, lineHeight: 17 }}>
            {sub}
          </AppText>
        ) : null}
      </View>
      {value != null && !isSwitch ? (
        <AppText muted size={13} style={{ marginRight: right === "chevron" ? 6 : 0 }}>
          {value}
        </AppText>
      ) : null}
      {isSwitch ? (
        <Switch
          value={!!switchValue}
          onValueChange={onSwitch}
          disabled={disabled}
          trackColor={{ false: colors.cardAlt, true: colors.primary }}
          thumbColor="#FFFFFF"
          ios_backgroundColor={colors.cardAlt}
        />
      ) : right === "chevron" ? (
        <Ionicons name="chevron-forward" size={18} color={colors.inactive} />
      ) : null}
    </View>
  );
  if (isSwitch) {
    return (
      <Pressable onPress={() => !disabled && onSwitch && onSwitch(!switchValue)} accessibilityRole="switch" accessibilityState={{ checked: !!switchValue }}>
        {content}
      </Pressable>
    );
  }
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => pressed && { opacity: 0.6 }}>
      {content}
    </Pressable>
  );
}

// Choice list (radio-style) inside a group.
export function SettingsChoice({ options, value, onChange }) {
  const { colors } = useTheme();
  return options.map((o) => {
    const active = o.value === value;
    return (
      <Pressable key={o.value} onPress={() => onChange(o.value)} style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
        <View style={{ flex: 1 }}>
          <AppText size={15}>{o.label}</AppText>
          {o.sub ? <AppText muted size={12} style={{ marginTop: 2 }}>{o.sub}</AppText> : null}
        </View>
        <View style={[styles.radio, { borderColor: active ? colors.primary : colors.inactive }]}>
          {active && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
        </View>
      </Pressable>
    );
  });
}

export function DangerButton({ icon, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.danger, pressed && { opacity: 0.7 }]}>
      <Ionicons name={icon} size={19} color="#E5484D" />
      <AppText medium color="#E5484D" style={{ marginLeft: 8 }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function EmptyNote({ icon, title, note }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: 48, paddingHorizontal: 30 }}>
      <View style={[styles.emptyIcon, { borderColor: colors.hairline }]}>
        <Ionicons name={icon} size={26} color={colors.textMuted} />
      </View>
      <AppText medium size={15} style={{ marginTop: 12 }}>{title}</AppText>
      {note ? <AppText muted size={13} style={{ marginTop: 4, textAlign: "center", lineHeight: 19 }}>{note}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 44 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, minHeight: 54 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  danger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(229,72,77,0.35)",
    backgroundColor: "rgba(229,72,77,0.10)",
  },
  emptyIcon: { width: 60, height: 60, borderRadius: 30, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
});

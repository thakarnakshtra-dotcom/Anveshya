import React from "react";
import { Image, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText";
import { useTheme } from "../theme/ThemeContext";

// Profile picture if one exists, otherwise a coloured initial — or, with no
// name either, the default user icon.
export default function Avatar({ user, size = 40, ring = false, ringColor, ringWidth = 2 }) {
  const { colors } = useTheme();
  const inner = ring ? size - (ringWidth * 2 + 2) : size;
  const content = user?.avatar ? (
    <Image source={user.avatar} style={{ width: inner, height: inner, borderRadius: inner / 2 }} />
  ) : user?.name ? (
    <View
      style={{
        width: inner,
        height: inner,
        borderRadius: inner / 2,
        backgroundColor: user.color || colors.card,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AppText size={inner * 0.42} color="rgba(255,255,255,0.88)">
        {user.name.trim().charAt(0).toUpperCase()}
      </AppText>
    </View>
  ) : (
    <Ionicons name="person-circle" size={inner} color={colors.inactive} />
  );

  if (!ring) return content;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: ringWidth,
        borderColor: ringColor || colors.ring,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {content}
    </View>
  );
}

export function VerifiedBadge({ size = 14 }) {
  const { colors } = useTheme();
  return <Ionicons name="checkmark-circle" size={size} color={colors.primary} style={{ marginLeft: 4 }} />;
}

import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppText from "./AppText";
import Avatar, { VerifiedBadge } from "./Avatar";
import { useTheme } from "../theme/ThemeContext";
import { useSocial } from "../state/SocialContext";
import { friends } from "../data/social";

// Bottom sheet: pick a friend to send a post to. The post lands in your DM
// with them on the Share tab.
export default function ShareSheet({ post, onClose, onShared }) {
  const { colors } = useTheme();
  const { sharePost } = useSocial();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={!!post} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: colors.overlay }]} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border, paddingBottom: insets.bottom + 16 }]}>
        <View style={[styles.grabber, { backgroundColor: colors.inactive }]} />
        <AppText title size={18} style={{ marginBottom: 12 }}>
          Share with friends
        </AppText>
        <ScrollView style={{ maxHeight: 360 }}>
          {friends.map((f) => (
            <Pressable
              key={f.id}
              style={styles.row}
              onPress={() => {
                const convId = sharePost(f, post);
                onShared && onShared(f, convId);
              }}
            >
              <Avatar user={f} size={40} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <AppText medium>{f.name}</AppText>
                  {f.verified && <VerifiedBadge />}
                </View>
                <AppText muted size={12}>@{f.username}</AppText>
              </View>
              <Ionicons name="paper-plane" size={20} color={colors.primary} />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
  },
  grabber: { width: 44, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 14 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
});

import React, { useEffect, useRef, useState } from "react";
import { FlatList, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import AppText from "../components/AppText";
import Avatar, { VerifiedBadge } from "../components/Avatar";
import { useTheme } from "../theme/ThemeContext";
import { reels } from "../data/social";
import { useSocial } from "../state/SocialContext";
import { useOpenProfile } from "../utils/nav";

function Reel({ reel, active, height }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const zoom = useSharedValue(1);
  const [liked, setLiked] = useState(false);
  const { saved, toggleSave, markWatched } = useSocial();
  const openProfile = useOpenProfile();
  const isSaved = saved.has(reel.id);

  useEffect(() => {
    zoom.value = 1;
    if (active) {
      zoom.value = withTiming(1.2, { duration: 12000, easing: Easing.linear });
      markWatched(reel.id);
    }
  }, [active]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: zoom.value }] }));

  return (
    <View style={{ height, overflow: "hidden", backgroundColor: "#000" }}>
      <Animated.Image source={reel.image} style={[StyleSheet.absoluteFill, style]} resizeMode="cover" />
      <LinearGradient colors={["rgba(0,0,0,0.45)", "transparent", "rgba(0,0,0,0.85)"]} style={StyleSheet.absoluteFill} />
      <View style={{ position: "absolute", left: 16, right: 84, bottom: insets.bottom + 34 }}>
        <Pressable onPress={() => openProfile(reel.user)} style={{ flexDirection: "row", alignItems: "center", marginBottom: 10, alignSelf: "flex-start" }}>
          <Avatar user={reel.user} size={32} ring ringWidth={1} />
          <AppText medium color="#fff" style={{ marginLeft: 8 }}>{reel.user.name}</AppText>
          {reel.user.verified && <VerifiedBadge />}
        </Pressable>
        <AppText size={17} color="#fff">{reel.title}</AppText>
        <AppText size={12} color="#ddd" style={{ marginTop: 4 }}>
          {reel.views} views · {reel.duration}
        </AppText>
        <AppText italic size={11} color="#bbb" style={{ marginTop: 6 }}>
          Reel preview — video playback arrives in Phase 2
        </AppText>
      </View>
      <View style={{ position: "absolute", right: 14, bottom: insets.bottom + 44, gap: 22, alignItems: "center" }}>
        <Pressable onPress={() => setLiked((v) => !v)} hitSlop={8}>
          <Ionicons name={liked ? "heart" : "heart-outline"} size={30} color={liked ? colors.primary : "#fff"} />
        </Pressable>
        <Ionicons name="chatbubble-outline" size={27} color="#fff" />
        <Ionicons name="paper-plane-outline" size={27} color="#fff" />
        <Pressable onPress={() => toggleSave(reel.id)} hitSlop={8} accessibilityLabel="Save reel">
          <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={26} color={isSaved ? colors.primary : "#fff"} />
        </Pressable>
      </View>
    </View>
  );
}

// Full-screen, vertically swiped reels — opened from the Reels button in the
// feed header or by tapping a reel in the feed.
export default function ReelsScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const start = Math.min(route.params?.index ?? 0, reels.length - 1);
  const [active, setActive] = useState(start);
  const viewable = useRef(({ viewableItems }) => {
    if (viewableItems[0]) setActive(viewableItems[0].index);
  }).current;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />
      <FlatList
        data={reels}
        keyExtractor={(r) => r.id}
        renderItem={({ item, index }) => <Reel reel={item} active={index === active} height={height} />}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        initialScrollIndex={start}
        getItemLayout={(_, i) => ({ length: height, offset: height * i, index: i })}
        onViewableItemsChanged={viewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
      />
      <View style={[styles.top, { top: insets.top + 8 }]}>
        <AppText title size={20} color="#fff">Reels</AppText>
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} accessibilityLabel="Close reels">
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: "absolute", left: 16, right: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});

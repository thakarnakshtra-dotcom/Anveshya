import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import AppText from "../components/AppText";
import ShareSheet from "../components/ShareSheet";
import { useTheme } from "../theme/ThemeContext";
import { useSocial } from "../state/SocialContext";
import { PostCard } from "./HomeScreen";

// A single post (opened from search).
export default function PostScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { posts } = useSocial();
  const [sharing, setSharing] = useState(null);
  const post = posts.find((p) => p.id === route.params?.postId);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
        {post ? <PostCard post={post} index={0} onShare={setSharing} /> : <AppText muted style={{ textAlign: "center", marginTop: 40 }}>Post not found</AppText>}
      </ScrollView>
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

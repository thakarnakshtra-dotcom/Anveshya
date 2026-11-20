import React, { forwardRef, useImperativeHandle, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";
import { SITE_URL } from "./site";

// Web build only (Expo web preview): react-native-webview doesn't run in a
// browser, so the page is an iframe. A cross-origin iframe can't be styled
// or searched from here, so the site's own look shows in this preview and
// in-page search reports no matches — on iOS/Android both work.
const WebPage = forwardRef(function WebPage({ path, onFind }, ref) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState(SITE_URL + path);
  useImperativeHandle(ref, () => ({
    find: () => onFind && onFind({ type: "find", count: 0, index: 0 }),
    goTo: (p) => setSrc(SITE_URL + p),
  }));
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <iframe
        src={src}
        title={path}
        onLoad={() => setLoading(false)}
        allow="autoplay; fullscreen; accelerometer; gyroscope"
        style={{ border: 0, width: "100%", height: "100%", background: colors.background }}
      />
      {loading && (
        <View style={[StyleSheet.absoluteFill, { alignItems: "center", justifyContent: "center", backgroundColor: colors.background }]}>
          <ActivityIndicator color={colors.primary} />
        </View>
      )}
    </View>
  );
});

export default WebPage;

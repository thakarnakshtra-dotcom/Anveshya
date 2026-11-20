import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Linking, Platform, Pressable, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeOut } from "react-native-reanimated";
import AppText from "../components/AppText";
import BrandLogo from "../components/BrandLogo";
import { useTheme } from "../theme/ThemeContext";
import { buildBeforeLoadJs, SITE_URL, themeSwitchJs } from "./site";

// One website page in a native WebView, restyled to the app's design by the
// injected theme engine (site header/footer and decoration hidden). Links to
// other sites open in the phone's browser; Android's back button goes back
// inside the page first.
//
// The plain website must never show: on Android the before-load injection
// can occasionally miss a load, so the script is injected at both the start
// and the end of every load, and the loading cover stays up until the page
// reports "anv-ready" (fully restyled).
// In-page search: window.find() selects + scrolls to each match (the theme
// engine styles ::selection maroon); the match count comes back as a message.
function findJs(q, backwards) {
  return `(function(q, back){
    try {
      var sel = window.getSelection();
      if (!q) { sel.removeAllRanges(); window.__anvFindQ = ""; window.ReactNativeWebView.postMessage(JSON.stringify({ type: "find", count: 0, index: 0 })); return; }
      var fresh = window.__anvFindQ !== q;
      if (fresh) { sel.removeAllRanges(); window.__anvFindQ = q; window.__anvFindIdx = 0; }
      var text = (document.body.innerText || "").toLowerCase(), ql = q.toLowerCase(), n = 0, i = -1;
      while ((i = text.indexOf(ql, i + 1)) !== -1) n++;
      var ok = n > 0 && window.find(q, false, back, true, false, false, false);
      if (ok) {
        if (fresh) window.__anvFindIdx = 1;
        else window.__anvFindIdx = back ? (window.__anvFindIdx <= 1 ? n : window.__anvFindIdx - 1) : (window.__anvFindIdx >= n ? 1 : window.__anvFindIdx + 1);
        var r = sel.rangeCount && sel.getRangeAt(0);
        var el = r && (r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentElement);
        if (el && el.scrollIntoView) el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "find", count: n, index: ok ? window.__anvFindIdx : 0 }));
    } catch (e) {}
  })(${JSON.stringify(q)}, ${backwards ? "true" : "false"}); true;`;
}

const WebPage = forwardRef(function WebPage({ path, active = true, interactive3d = false, onFind, onUrl }, outerRef) {
  const { colors, isDark } = useTheme();
  const ref = useRef(null);
  useImperativeHandle(outerRef, () => ({
    find: (q, backwards) => ref.current?.injectJavaScript(findJs(q, backwards)),
    // a real reload we start ourselves (deep link from search): cover it again
    goTo: (p) => {
      markStyled(false);
      setLoading(true);
      armFallback();
      ref.current?.injectJavaScript(`window.location.assign(${JSON.stringify(SITE_URL + p)}); true;`);
    },
  }));
  const canGoBack = useRef(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [failed, setFailed] = useState(false);
  const [styled, setStyled] = useState(false);
  const styledRef = useRef(false);
  const retryTimers = useRef([]);
  const mode = isDark ? "dark" : "light";
  // The before-load script carries the current theme for any future load;
  // a theme change while the page is open is pushed into the live page
  // instead of reloading it.
  const beforeLoadJs = useMemo(() => buildBeforeLoadJs(mode), [mode]);
  const lastMode = useRef(mode);

  useEffect(() => {
    if (mode === lastMode.current) return;
    lastMode.current = mode;
    ref.current?.injectJavaScript(themeSwitchJs(mode));
  }, [mode]);

  useFocusEffect(
    useCallback(() => {
      if (!active || Platform.OS !== "android") return;
      const sub = BackHandler.addEventListener("hardwareBackPress", () => {
        if (canGoBack.current) {
          ref.current?.goBack();
          return true;
        }
        return false;
      });
      return () => sub.remove();
    }, [active])
  );

  const clearRetries = () => {
    retryTimers.current.forEach(clearTimeout);
    retryTimers.current = [];
  };
  useEffect(() => clearRetries, []);

  // Last resort: never leave the cover up for more than 8s, whatever happens.
  const armFallback = () => {
    clearRetries();
    retryTimers.current.push(setTimeout(() => !styledRef.current && markStyled(true), 8000));
  };
  useEffect(() => {
    armFallback();
  }, []);

  const markStyled = (v) => {
    styledRef.current = v;
    setStyled(v);
  };

  const onLoadEnd = () => {
    setLoading(false);
    if (styledRef.current) return;
    // safety net: inject again now, and once more shortly after; as a last
    // resort reveal the page after 8s rather than leaving a spinner forever
    ref.current?.injectJavaScript(beforeLoadJs);
    retryTimers.current.push(setTimeout(() => !styledRef.current && ref.current?.injectJavaScript(beforeLoadJs), 1500));
  };

  const onShouldStart = (req) => {
    const url = req.url || "";
    if (url.startsWith(SITE_URL) || url.startsWith("about:") || url.startsWith("data:") || url.startsWith("blob:")) return true;
    if (req.isTopFrame === false) return true; // embedded videos etc.
    Linking.openURL(url).catch(() => {});
    return false;
  };

  return (
    <View style={[styles.fill, { backgroundColor: colors.background }]}>
      {!failed && (
        <WebView
          ref={ref}
          source={{ uri: SITE_URL + path }}
          style={[styles.fill, { backgroundColor: "transparent" }]}
          containerStyle={{ backgroundColor: colors.background }}
          injectedJavaScriptBeforeContentLoaded={beforeLoadJs}
          injectedJavaScript={beforeLoadJs}
          onMessage={(e) => {
            const data = e.nativeEvent.data;
            if (data === "anv-ready") {
              clearRetries();
              markStyled(true);
            } else if (data && data[0] === "{") {
              try {
                const m = JSON.parse(data);
                if (m.type === "find" && onFind) onFind(m);
              } catch (err) {}
            }
          }}
 // Note: no onLoadStart handler. On Android it also fires for in-page route
          // changes (history.pushState, e.g. Explore menu -> Panchanga), which
          // would re-cover a page that never sends "ready" again.
          onShouldStartLoadWithRequest={onShouldStart}
          onNavigationStateChange={(s) => {
            canGoBack.current = s.canGoBack;
            if (onUrl && s.url) onUrl(s.url);
          }}
          onLoadProgress={(e) => setProgress(e.nativeEvent.progress)}
          onLoadEnd={onLoadEnd}
          onError={() => setFailed(true)}
          onHttpError={(e) => e.nativeEvent.statusCode >= 500 && setFailed(true)}
          domStorageEnabled
          javaScriptEnabled
          cacheEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          allowsBackForwardNavigationGestures
          setSupportMultipleWindows={false}
          androidLayerType="hardware"
          overScrollMode="never"
          bounces={!interactive3d}
          // iOS only: on Android pull-to-refresh wraps the page in a refresh
          // layout that steals downward swipes, and on the 3D explorer it would
          // fight drag-to-orbit.
          pullToRefreshEnabled={Platform.OS === "ios" && !interactive3d}
          nestedScrollEnabled
          // Note: no decelerationRate="normal" — on Android the native prop is a
          // Double and the string crashes ("String cannot be cast to Double").
        />
      )}

      {(loading || !styled) && !failed && (
        <Animated.View exiting={FadeOut.duration(300)} style={[StyleSheet.absoluteFill, styles.center, { backgroundColor: colors.background }]}>
          <BrandLogo size={64} tint={isDark ? "#ECEAE3" : "#1F1E1D"} fill={colors.background} />
          <ActivityIndicator color={colors.primary} style={{ marginTop: 18 }} />
        </Animated.View>
      )}
      {loading && !failed && (
        <View style={[styles.progress, { width: `${Math.max(progress, 0.08) * 100}%`, backgroundColor: colors.primary }]} />
      )}

      {failed && (
        <View style={[styles.fill, styles.center]}>
          <Ionicons name="cloud-offline-outline" size={40} color={colors.inactive} />
          <AppText muted style={{ marginTop: 12, textAlign: "center" }}>
            Couldn't reach anveshya.space.{"\n"}Check your connection.
          </AppText>
          <Pressable
            onPress={() => {
              setFailed(false);
              setLoading(true);
            }}
            style={[styles.retry, { borderColor: colors.primary }]}
          >
            <AppText color={colors.primary}>Try again</AppText>
          </Pressable>
        </View>
      )}
    </View>
  );
});

export default WebPage;

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: "center", justifyContent: "center", padding: 24 },
  progress: { position: "absolute", top: 0, left: 0, height: 2 },
  retry: { marginTop: 16, borderWidth: 1.5, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 8 },
});

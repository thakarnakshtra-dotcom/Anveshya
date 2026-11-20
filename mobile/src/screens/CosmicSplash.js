import React, { useEffect, useMemo } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { Easing, ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import Svg, { Ellipse } from "react-native-svg";

// Native port of the website's opening animation (src/components/RingSystem.jsx
// → RingIntro): empty space → particles converge inward into a thick tilted
// ring → the solid ring takes over and rotates → everything fades to reveal
// the app. Same geometry and timings as the three.js version, projected
// through the same camera (z = 7, 45° FOV) — just drawn with Reanimated so
// it needs no WebGL. Fewer particles (260 vs 700) to stay smooth on phones.

const { width: W, height: H } = Dimensions.get("window");
const BG = "#1F1E1D";
const CREAM = "#f5f1e8";

const MAIN_RADIUS = 2.2;
const MAIN_TUBE = 0.16;
const MAIN_TILT = 1.34;
const RING_FIT_WIDTH = MAIN_RADIUS * 2 + 2.2;
const CAMERA_Z = 7;
const FOCAL = H / 2 / Math.tan((45 / 2) * (Math.PI / 180)); // px per world unit at depth 1
const FIT = Math.min(1, (2 * CAMERA_Z * Math.tan((45 / 2) * (Math.PI / 180)) * (W / H)) / RING_FIT_WIDTH);

const PARTICLE_COUNT = 260;
const CONVERGE = 2.0;
const HOLD = 0.7;
const FADE = 0.5;
const TOTAL = CONVERGE + HOLD + FADE; // seconds

// Same "play regardless of the phone's Reduce motion setting" choice for
// every timing here: with Reduce motion on, Reanimated would otherwise jump
// straight to the end and the intro would never be seen.
const TIMING = { duration: TOTAL * 1000, easing: Easing.linear, reduceMotion: ReduceMotion.Never };

function project(x, y, z) {
  const s = FIT;
  const k = FOCAL / (CAMERA_Z - z * s);
  return { px: x * s * k, py: -y * s * k, k };
}

function buildParticles() {
  const out = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // start: scattered shell well outside the ring
    const r = 5 + Math.random() * 4;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(Math.random() * 2 - 1);
    const sx = r * Math.sin(ph) * Math.cos(th);
    const sy = r * Math.sin(ph) * Math.sin(th);
    const sz = r * Math.cos(ph) * 0.5;
    // target: a point on the torus surface, tilted by MAIN_TILT about x
    const t = Math.random() * Math.PI * 2;
    const p = Math.random() * Math.PI * 2;
    const tx = (MAIN_RADIUS + MAIN_TUBE * Math.cos(p)) * Math.cos(t);
    const y0 = (MAIN_RADIUS + MAIN_TUBE * Math.cos(p)) * Math.sin(t);
    const z0 = MAIN_TUBE * Math.sin(p);
    const ty = y0 * Math.cos(MAIN_TILT) - z0 * Math.sin(MAIN_TILT);
    const tz = y0 * Math.sin(MAIN_TILT) + z0 * Math.cos(MAIN_TILT);
    const a = project(sx, sy, sz);
    const b = project(tx, ty, tz);
    out.push({
      id: i,
      sx: a.px,
      sy: a.py,
      tx: b.px,
      ty: b.py,
      // point size 0.05 world units with perspective, like sizeAttenuation
      ss: Math.max(1.2, 0.05 * FIT * a.k),
      ts: Math.max(1.2, 0.05 * FIT * b.k),
    });
  }
  return out;
}

function Particle({ p, t }) {
  const style = useAnimatedStyle(() => {
    const time = t.value;
    const c = Math.min(time / CONVERGE, 1);
    const e = 1 - Math.pow(1 - c, 3); // easeOutCubic
    const fadeIn = Math.min(time / 0.4, 1);
    const fadeOut = time > CONVERGE ? Math.min((time - CONVERGE) / HOLD, 1) : 0;
    const size = p.ss + (p.ts - p.ss) * e;
    return {
      width: size,
      height: size,
      borderRadius: size / 2,
      opacity: Math.max(0, fadeIn - fadeOut) * 0.95,
      transform: [{ translateX: p.sx + (p.tx - p.sx) * e - size / 2 }, { translateY: p.sy + (p.ty - p.sy) * e - size / 2 }],
    };
  });
  return <Animated.View style={[styles.particle, style]} />;
}

export default function CosmicSplash({ onDone }) {
  const particles = useMemo(buildParticles, []);
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withTiming(TOTAL, TIMING);
    const timer = setTimeout(() => onDone && onDone(), TOTAL * 1000 + 50);
    return () => clearTimeout(timer);
  }, []);

  // particle cloud spins slowly (0.08 rad/s), the solid ring a bit faster (0.12 rad/s)
  const cloudStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${t.value * 0.08}rad` }] }));
  const ringStyle = useAnimatedStyle(() => {
    const time = t.value;
    const fade = time > CONVERGE ? Math.min((time - CONVERGE) / HOLD, 1) : 0;
    return { opacity: fade * 0.92, transform: [{ rotate: `${time * 0.12}rad` }] };
  });
  const screenStyle = useAnimatedStyle(() => {
    const time = t.value;
    const start = CONVERGE + HOLD;
    return { opacity: time > start ? 1 - Math.min((time - start) / FADE, 1) : 1 };
  });

  // solid ring = the same torus seen through the camera: an ellipse whose
  // stroke is the tube's projected thickness
  const k = FOCAL / CAMERA_Z;
  const rx = MAIN_RADIUS * FIT * k;
  const ry = rx * Math.cos(MAIN_TILT);
  const stroke = Math.max(3, MAIN_TUBE * 2 * FIT * k);
  const box = Math.ceil(rx * 2 + stroke * 2);

  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.root, screenStyle]}>
      <View style={styles.center}>
        <Animated.View style={[styles.origin, cloudStyle]}>
          {particles.map((p) => (
            <Particle key={p.id} p={p} t={t} />
          ))}
        </Animated.View>
        <Animated.View style={[{ position: "absolute", width: box, height: box }, ringStyle]}>
          <Svg width={box} height={box}>
            <Ellipse cx={box / 2} cy={box / 2} rx={rx} ry={ry} stroke={CREAM} strokeWidth={stroke} fill="none" />
          </Svg>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: BG, zIndex: 100 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  origin: { position: "absolute", width: 0, height: 0 },
  particle: { position: "absolute", left: 0, top: 0, backgroundColor: CREAM },
});

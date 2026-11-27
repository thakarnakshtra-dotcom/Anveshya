// Shared pieces for the wireframe illustrations used on the home page and in
// the labs: colors per theme, scene time, glow and stars.
import { useFrame } from "@react-three/fiber";
import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { palettes } from "../../../design-reference/tokens.js";

const ROSE = "#C04A5A"; // lighter maroon the app uses for accents on black

export const WIRE = {
  dark: {
    line: palettes.dark.text,
    accent: ROSE,
    deep: palettes.dark.primary,
    solid: palettes.dark.background,
    blending: THREE.AdditiveBlending,
    glow: 1,
  },
  light: {
    line: palettes.light.text,
    accent: palettes.dark.primary,
    deep: palettes.light.primary,
    solid: palettes.light.background,
    blending: THREE.NormalBlending,
    glow: 0.45,
  },
};

export const WireContext = createContext(WIRE.dark);
export const useWire = () => useContext(WireContext);

// A lab provides its own clock here so that it can pause, reset and change
// speed. Without one (home page) the shapes follow the renderer's clock.
export const SceneTimeContext = createContext(null);

// Pose used when nothing is moving.
const STILL_TIME = 0.8;

export function useSceneTime(animate) {
  const shared = useContext(SceneTimeContext);
  return (clock) => {
    if (shared) return STILL_TIME + shared.current;
    return animate ? clock.elapsedTime : STILL_TIME;
  };
}

export function useGeometry(create, deps = []) {
  const geometry = useMemo(create, deps);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

export function buffer(points, colors) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  if (colors) geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return geometry;
}

let glowTexture;
function getGlowTexture() {
  if (glowTexture) return glowTexture;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.25)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  glowTexture = new THREE.CanvasTexture(canvas);
  return glowTexture;
}

export function Glow({ size = 5, color, opacity = 0.35 }) {
  const wire = useWire();
  return (
    <sprite scale={[size, size, 1]} renderOrder={-1}>
      <spriteMaterial
        map={getGlowTexture()}
        color={color || wire.deep}
        transparent
        opacity={opacity * wire.glow}
        depthWrite={false}
        depthTest={false}
        blending={wire.blending}
      />
    </sprite>
  );
}

export function Starfield({ count, animate }) {
  const wire = useWire();
  const groupRef = useRef();
  const layers = useMemo(
    () =>
      [
        { share: 0.8, size: 1.2, opacity: 0.55 },
        { share: 0.2, size: 2.1, opacity: 0.9 },
      ].map((layer) => {
        const n = Math.round(count * layer.share);
        const positions = new Float32Array(n * 3);
        const point = new THREE.Vector3();
        for (let i = 0; i < n; i++) {
          point.randomDirection().multiplyScalar(80 + Math.random() * 60);
          point.toArray(positions, i * 3);
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        return { ...layer, geometry };
      }),
    [count]
  );
  useEffect(() => () => layers.forEach((layer) => layer.geometry.dispose()), [layers]);

  useFrame((_, delta) => {
    if (animate && groupRef.current) groupRef.current.rotation.y += delta * 0.004;
  });

  return (
    <group ref={groupRef}>
      {layers.map((layer) => (
        <points key={layer.size} geometry={layer.geometry} frustumCulled={false}>
          <pointsMaterial
            color={wire.line}
            size={layer.size}
            sizeAttenuation={false}
            transparent
            opacity={layer.opacity}
            depthWrite={false}
          />
        </points>
      ))}
    </group>
  );
}

import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Circle, Dot, Revolution } from "../shell/scene3d.jsx";
import { Glow, useSceneTime, useWire } from "../shell/wire.jsx";
import { height, radius } from "./physics.js";

// Profile [radius, height] of the embedding surface for -extent <= l <= extent.
function profileFor(r0, extent, scale) {
  return Array.from({ length: 81 }, (_, i) => {
    const l = -extent + (2 * extent * i) / 80;
    return [radius(l, r0) * scale, height(l, r0) * scale];
  });
}

// ---------- Explore ----------

const EXTENT = 4;
const SCALE = 0.62; // scene units per throat radius

export function ExploreScene({ values, animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const probe = useRef();
  const profile = useMemo(() => profileFor(1, EXTENT, SCALE), []);
  const ringRadius = radius(values.l, 1) * SCALE;
  const ringHeight = height(values.l, 1) * SCALE;

  useFrame(({ clock }) => {
    const a = timeOf(clock) * 0.9;
    probe.current?.position.set(ringRadius * Math.cos(a), ringHeight, ringRadius * Math.sin(a));
  });

  return (
    <group>
      <Glow size={5} opacity={0.3} />
      <Revolution profile={profile} rings={24} mirrorColors />
      <Circle radius={SCALE} width={2} flat color={wire.accent} />
      <Circle radius={ringRadius} width={4} flat position={[0, ringHeight, 0]} />
      <group ref={probe}>
        <Dot radius={0.09} />
      </group>
    </group>
  );
}

// ---------- Build your own ----------

export function BuildScene({ values }) {
  const wire = useWire();
  const scale = 0.72; // scene units per metre
  const profile = useMemo(() => profileFor(values.r0, 3, scale), [values.r0]);
  return (
    <group>
      <Glow size={5} opacity={0.3} />
      <Revolution profile={profile} rings={22} mirrorColors />
      <Circle radius={values.r0 * scale} width={4} flat />
      <Circle radius={scale} width={1.5} flat dashed color={wire.accent} />
    </group>
  );
}

// ---------- Traversal: light traced through the wormhole ----------

// Throat radius 1. For every pixel, follow the ray backwards until it is far
// away on one side or the other, then look up that side's sky.
const fragmentShader = `
  varying vec2 screen;
  uniform float position_l;
  uniform float yaw;
  uniform float pitch;
  uniform float aspect;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.23));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }

  float stars(vec3 d, float scale, float amount) {
    vec3 p = d * scale;
    vec3 cell = floor(p);
    if (hash(cell) > amount) return 0.0;
    vec3 centre = cell + 0.25 + 0.5 * vec3(hash(cell + 1.7), hash(cell + 4.1), hash(cell + 7.3));
    return smoothstep(0.2, 0.0, length(p - centre));
  }

  vec3 skyA(vec3 d) {
    vec3 color = vec3(0.008, 0.012, 0.025);
    float band = exp(-14.0 * pow(d.y + 0.25 * d.x, 2.0));
    color += vec3(0.08, 0.11, 0.2) * band * (0.4 + noise(d * 5.0));
    color += vec3(0.9, 0.93, 1.0) * (stars(d, 38.0, 0.12) + 0.6 * stars(d, 85.0, 0.14));
    return color;
  }

  vec3 skyB(vec3 d) {
    vec3 color = vec3(0.035, 0.006, 0.012);
    float cloud = noise(d * 2.2 + 3.0) * 0.65 + noise(d * 5.5) * 0.35;
    color += vec3(0.55, 0.09, 0.16) * smoothstep(0.45, 0.9, cloud);
    color += vec3(0.45, 0.28, 0.12) * pow(max(0.0, dot(d, normalize(vec3(0.5, 0.35, -0.8)))), 14.0);
    color += vec3(1.0, 0.72, 0.66) * (stars(d, 34.0, 0.14) + 0.6 * stars(d, 76.0, 0.14));
    return color;
  }

  void main() {
    // View direction: looking towards decreasing l (along -z), then turned.
    vec3 d = normalize(vec3(screen.x * aspect * 0.78, screen.y * 0.78, -1.0));
    d.yz = mat2(cos(pitch), sin(pitch), -sin(pitch), cos(pitch)) * d.yz;
    d.xz = mat2(cos(yaw), -sin(yaw), sin(yaw), cos(yaw)) * d.xz;

    // The ray stays in the plane of the radial axis (+z, towards +l) and t.
    vec3 axis = vec3(0.0, 0.0, 1.0);
    float side = length(d.xy);
    vec3 t = side > 1e-5 ? vec3(d.xy / side, 0.0) : vec3(1.0, 0.0, 0.0);

    float l = position_l;
    float p = d.z;
    float b = sqrt(l * l + 1.0) * side;
    float phi = 0.0;

    for (int i = 0; i < 140; i++) {
      float r2 = l * l + 1.0;
      float h = 0.11 * sqrt(r2);
      float lm = l + 0.5 * h * p;
      float pm = p + 0.5 * h * b * b * l / (r2 * r2);
      float m2 = lm * lm + 1.0;
      l += h * pm;
      p += h * b * b * lm / (m2 * m2);
      phi += h * b / m2;
      if (abs(l) > 40.0 && l * p > 0.0) break;
    }

    vec3 radial = cos(phi) * axis + sin(phi) * t;
    vec3 across = -sin(phi) * axis + cos(phi) * t;
    float outward = l > 0.0 ? p : -p;
    vec3 direction = normalize(outward * radial + (b / sqrt(l * l + 1.0)) * across);
    gl_FragColor = vec4(l > 0.0 ? skyA(direction) : skyB(direction), 1.0);
  }`;

const vertexShader = `
  varying vec2 screen;
  void main() {
    screen = position.xy;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }`;

export function TourScene({ values, resetKey }) {
  const canvas = useThree((state) => state.gl.domElement);
  const size = useThree((state) => state.size);
  const invalidate = useThree((state) => state.invalidate);
  const look = useRef({ yaw: 0, pitch: 0 });
  const uniforms = useMemo(
    () => ({ position_l: { value: 8 }, yaw: { value: 0 }, pitch: { value: 0 }, aspect: { value: 1 } }),
    []
  );

  useEffect(() => {
    look.current = { yaw: 0, pitch: 0 };
    invalidate();
  }, [resetKey, invalidate]);

  // Drag to turn your head.
  useEffect(() => {
    let last = null;
    const down = (event) => {
      last = [event.clientX, event.clientY];
      canvas.setPointerCapture(event.pointerId);
    };
    const move = (event) => {
      if (!last) return;
      const scale = 2.4 / canvas.clientHeight;
      look.current.yaw += (event.clientX - last[0]) * scale;
      look.current.pitch = THREE.MathUtils.clamp(look.current.pitch + (event.clientY - last[1]) * scale, -1.4, 1.4);
      last = [event.clientX, event.clientY];
      invalidate();
    };
    const up = () => (last = null);
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [canvas, invalidate]);

  useFrame(() => {
    uniforms.position_l.value = values.l;
    uniforms.yaw.value = look.current.yaw;
    uniforms.pitch.value = look.current.pitch;
    uniforms.aspect.value = size.width / size.height;
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} depthWrite={false} />
    </mesh>
  );
}

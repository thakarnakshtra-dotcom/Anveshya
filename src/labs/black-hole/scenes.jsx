import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Circle, Dot, Path, Revolution, WireSphere } from "../shell/scene3d.jsx";
import { Glow, buffer, useGeometry, useSceneTime, useWire } from "../shell/wire.jsx";
import {
  flammHeight,
  lightPath,
  orbit,
  orbitAngularSpeed,
  receivedWavelength,
  timeFactor,
} from "./physics.js";

// ---------- Anatomy: sizes in true proportion ----------

const RS = 0.8; // scene units per horizon radius

export function AnatomyScene({ animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const light = useRef();
  const matter = useRef();

  useFrame(({ clock }) => {
    const t = timeOf(clock) * 2.5;
    const a = orbitAngularSpeed(1.5, 1) * t;
    const b = orbitAngularSpeed(3, 1) * t;
    light.current?.position.set(1.5 * RS * Math.cos(a), 0, 1.5 * RS * Math.sin(a));
    matter.current?.position.set(3 * RS * Math.cos(b), 0, 3 * RS * Math.sin(b));
  });

  return (
    <group>
      <Glow size={6} color={wire.accent} opacity={0.25} />
      <WireSphere radius={RS} fill="#000000" color="#eceae3" opacity={0.18} />
      <WireSphere radius={1.5 * RS} color={wire.accent} opacity={0.16} segments={24} />
      <Circle radius={1.5 * RS} color={wire.accent} width={2} flat />
      <Circle radius={3 * RS} width={2.5} flat />
      <group ref={light}>
        <Glow size={0.7} color={wire.line} opacity={0.6} />
        <Dot radius={0.06} />
      </group>
      <group ref={matter}>
        <Dot radius={0.11} color={wire.accent} />
      </group>
    </group>
  );
}

// ---------- Curvature: Flamm's paraboloid ----------

export function CurvatureScene({ values }) {
  const { extent } = values;
  const probe = Math.min(values.probe, extent);
  const scale = 2.6 / extent;
  const edge = flammHeight(extent, 1);
  // Heights are measured down from the outer edge; the figure is centred.
  const heightAt = (r) => (flammHeight(r, 1) - edge / 2) * scale;
  const profile = useMemo(
    () =>
      Array.from({ length: 61 }, (_, i) => {
        // more samples where the surface is steep
        const r = 1 + (extent - 1) * (i / 60) ** 2;
        return [r * scale, heightAt(r)];
      }),
    [extent]
  );

  return (
    <group>
      <Revolution profile={profile} rings={22} />
      <mesh position={[0, heightAt(1), 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[scale, 48]} />
        <meshBasicMaterial color="#000000" side={THREE.DoubleSide} />
      </mesh>
      <Circle radius={scale} width={2.5} flat position={[0, heightAt(1), 0]} />
      <Circle radius={probe * scale} width={3.5} flat position={[0, heightAt(probe), 0]} />
      <Dot radius={0.07} position={[probe * scale, heightAt(probe), 0]} />
    </group>
  );
}

// ---------- Lensing ----------

const RAY_SCALE = 0.28;
const FAN = [1.2, 2.1, 2.65, 3.4, 4.6, 6.2];

const toScene = (points, side) => points.map(([x, y]) => [x * RAY_SCALE, side * y * RAY_SCALE, 0]);

function LightPaths({ b, animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const dot = useRef();

  const fan = useMemo(
    () => FAN.flatMap((value) => [1, -1].map((side) => ({ key: `${value}:${side}`, points: toScene(lightPath(value).points, side) }))),
    []
  );
  const chosen = useMemo(() => {
    const points = toScene(lightPath(b).points, 1);
    const lengths = [0];
    for (let i = 1; i < points.length; i++) {
      lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
    }
    return { points, lengths };
  }, [b]);

  // A pulse of light travelling along the chosen ray.
  useFrame(({ clock }) => {
    const { points, lengths } = chosen;
    const total = lengths[lengths.length - 1];
    const at = (timeOf(clock) * 2) % total;
    let i = 0;
    while (i < lengths.length - 1 && lengths[i] < at) i++;
    dot.current?.position.set(...points[i]);
  });

  return (
    <group>
      <mesh>
        <circleGeometry args={[RAY_SCALE, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <Circle radius={RAY_SCALE} width={2} />
      <Circle radius={1.5 * RAY_SCALE} color={wire.accent} dashed />
      {fan.map((ray) => (
        <Path key={ray.key} points={ray.points} color={wire.accent} width={1} opacity={0.55} />
      ))}
      <Path points={chosen.points} width={3} />
      <group ref={dot}>
        <Dot radius={0.08} />
      </group>
    </group>
  );
}

const RING_UNIT = 1.2; // scene units per Einstein angle

// Each pixel is traced back through the point lens: beta = theta (1 - 1/theta^2),
// in units of the Einstein angle. It is lit when it lands on the source.
const lensShader = {
  vertex: `
    varying vec2 theta;
    void main() {
      theta = position.xy / ${RING_UNIT.toFixed(2)};
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`,
  fragment: `
    varying vec2 theta;
    uniform float offset;
    uniform float size;
    uniform vec3 color;
    void main() {
      float r2 = max(dot(theta, theta), 1e-5);
      vec2 beta = theta * (1.0 - 1.0 / r2);
      float d = distance(beta, vec2(offset, 0.0)) / size;
      float edge = fwidth(d);
      float alpha = 1.0 - smoothstep(1.0 - edge, 1.0 + edge, d);
      if (alpha <= 0.0) discard;
      gl_FragColor = vec4(color, alpha);
    }`,
};

function EinsteinRing({ offset, size }) {
  const wire = useWire();
  const uniforms = useMemo(
    () => ({ offset: { value: 0 }, size: { value: 0.15 }, color: { value: new THREE.Color() } }),
    []
  );
  uniforms.offset.value = offset;
  uniforms.size.value = size;
  uniforms.color.value.set(wire.line);

  return (
    <group>
      <mesh>
        <planeGeometry args={[9, 9]} />
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={lensShader.vertex}
          fragmentShader={lensShader.fragment}
          transparent
          depthWrite={false}
        />
      </mesh>
      <Circle radius={RING_UNIT} color={wire.accent} dashed width={1.5} />
      <Circle radius={size * RING_UNIT} position={[offset * RING_UNIT, 0, 0.01]} color={wire.accent} width={2} dashed />
      <Dot radius={0.07} color={wire.accent} />
    </group>
  );
}

export function LensingScene({ values, animate }) {
  return values.view === "ring" ? (
    <EinsteinRing offset={values.offset} size={values.size} />
  ) : (
    <LightPaths b={values.b} animate={animate} />
  );
}

// ---------- Time: two clocks and stretched light ----------

const HOLE_X = -2.2;
const TIME_RS = 0.55;
const STEP_X = 0.28; // scene units per horizon radius outside the hole
const radiusAtX = (x) => 1 + (x - (HOLE_X + TIME_RS)) / STEP_X;
const xAtRadius = (r) => HOLE_X + TIME_RS + (r - 1) * STEP_X;
const WAVE_END = 2.7;
const WAVE_POINTS = 420;

// An approximate screen color for a wavelength in nanometres.
function spectrumColor(nm, target) {
  const band = (centre, width) => Math.exp(-(((nm - centre) / width) ** 2));
  if (nm > 700) {
    const fade = Math.max(0.28, 1 - (nm - 700) / 400);
    return target.setRGB(0.75 * fade, 0.05, 0.08);
  }
  return target.setRGB(
    Math.min(1, band(610, 70) + 0.45 * band(420, 30)),
    band(540, 55),
    Math.min(1, band(450, 45))
  );
}

function ClockFace({ x, rate, animate, color }) {
  const timeOf = useSceneTime(animate);
  const hand = useRef();
  useFrame(({ clock }) => {
    if (hand.current) hand.current.rotation.z = -timeOf(clock) * 2 * rate;
  });
  return (
    <group position={[x, 1.05, 0]}>
      <Circle radius={0.42} color={color} width={2} />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return <Dot key={i} radius={0.014} position={[0.35 * Math.cos(a), 0.35 * Math.sin(a), 0]} />;
      })}
      <group ref={hand}>
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.035, 0.3, 0.02]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
}

export function TimeScene({ values, animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const { r, wavelength } = values;
  const start = xAtRadius(r);
  const wave = useGeometry(() => buffer(new Array(WAVE_POINTS * 3).fill(0), new Array(WAVE_POINTS * 3).fill(0)));
  const line = useMemo(() => {
    const material = new THREE.LineBasicMaterial({ vertexColors: true });
    return new THREE.Line(wave, material);
  }, [wave]);

  useFrame(({ clock }) => {
    const t = timeOf(clock);
    const positions = wave.attributes.position.array;
    const colors = wave.attributes.color.array;
    const color = new THREE.Color();
    const step = (WAVE_END - start) / (WAVE_POINTS - 1);
    let phase = 0;
    for (let i = 0; i < WAVE_POINTS; i++) {
      const x = start + step * i;
      // Wavelength measured by a clock held still at this place.
      const local = receivedWavelength(wavelength, r, 1) * timeFactor(Math.max(radiusAtX(x), r), 1);
      phase += (2 * Math.PI * step) / (0.17 * (local / wavelength));
      positions.set([x, -0.35 + 0.2 * Math.sin(phase - t * 7), 0], i * 3);
      spectrumColor(local, color);
      colors.set([color.r, color.g, color.b], i * 3);
    }
    wave.attributes.position.needsUpdate = true;
    wave.attributes.color.needsUpdate = true;
  });

  return (
    <group position={[0, -0.3, 0]}>
      <group position={[HOLE_X, -0.35, 0]}>
        <Glow size={3} color={wire.accent} opacity={0.35} />
        <WireSphere radius={TIME_RS} fill="#000000" color="#eceae3" opacity={0.2} />
        <Circle radius={TIME_RS * 1.03} width={1.5} />
      </group>
      <primitive object={line} />
      <Dot radius={0.08} position={[start, -0.35, 0]} />
      <ClockFace x={Math.min(Math.max(start, -1.25), 1.2)} rate={timeFactor(r, 1)} animate={animate} color={wire.accent} />
      <ClockFace x={2.25} rate={1} animate={animate} color={wire.line} />
      <Path
        points={[
          [start, -0.25, 0],
          [Math.min(Math.max(start, -1.25), 1.2), 0.6, 0],
        ]}
        color={wire.accent}
        dashed
      />
    </group>
  );
}

// ---------- Orbits ----------

const PROPER_TIME_PER_SECOND = 45; // in units of GM/c^3

export function OrbitScene({ values, animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const body = useRef();
  const path = useMemo(() => orbit(values.E, values.L), [values.E, values.L]);
  const view = Math.min(Math.max(path.type === "flyby" ? 32 : path.farthest, 14), 60);
  const scale = 2.7 / view;
  const line = useMemo(
    () =>
      path.points
        .filter((_, i) => i % 3 === 0 || i === path.points.length - 1)
        .map(([r, phi]) => [r * scale * Math.cos(phi), 0, r * scale * Math.sin(phi)]),
    [path, scale]
  );

  // The body moves evenly in its own (proper) time.
  useFrame(({ clock }) => {
    const { points } = path;
    const total = points[points.length - 1][2];
    if (!total) return;
    const tau = (timeOf(clock) * PROPER_TIME_PER_SECOND) % total;
    let low = 0;
    let high = points.length - 1;
    while (low < high) {
      const mid = (low + high) >> 1;
      if (points[mid][2] < tau) low = mid + 1;
      else high = mid;
    }
    const [r, phi] = points[low];
    body.current?.position.set(r * scale * Math.cos(phi), 0, r * scale * Math.sin(phi));
  });

  return (
    <group>
      <WireSphere radius={2 * scale} fill="#000000" color="#eceae3" opacity={0.25} />
      <Circle radius={2.04 * scale} width={1.5} flat />
      <Circle radius={6 * scale} color={wire.accent} dashed flat />
      <Path points={line} width={1.5} opacity={0.75} />
      <group ref={body}>
        <Dot radius={0.1} color={wire.accent} />
        <Dot radius={0.05} />
      </group>
    </group>
  );
}

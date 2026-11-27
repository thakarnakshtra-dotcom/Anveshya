import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Circle, Dot, Path } from "../shell/scene3d.jsx";
import { Glow, buffer, useGeometry, useSceneTime, useWire } from "../shell/wire.jsx";
import { calabiPoint, hypercube, projectTo3D, rotate } from "./physics.js";

// ---------- Higher dimensions ----------

export function DimensionScene({ values, animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const { n, hidden } = values;
  const cube = useMemo(() => hypercube(n), [n]);
  const edges = useGeometry(
    () => buffer(new Array(cube.edges.length * 6).fill(0), new Array(cube.edges.length * 6).fill(0)),
    [cube]
  );
  const corners = useGeometry(() => buffer(new Array(cube.vertices.length * 3).fill(0)), [cube]);

  useFrame(({ clock }) => {
    const t = timeOf(clock);
    const unit = 1 / Math.sqrt(n); // corners at distance 1 from the centre
    let largest = 0;
    const flat = cube.vertices.map((vertex) => {
      const p = vertex.map((v) => v * unit);
      if (hidden) {
        // Turn in planes that include the extra directions.
        for (let k = 3; k < n; k++) rotate(p, (k - 3) % 3, k, t * (0.34 - 0.03 * (k - 3)));
      }
      rotate(p, 0, 2, t * 0.12);
      const q = projectTo3D(p, 2.6);
      largest = Math.max(largest, Math.hypot(...q));
      return q;
    });
    const fit = 2.15 / largest;
    const near = new THREE.Color(wire.line);
    const far = new THREE.Color(wire.accent);
    const color = new THREE.Color();
    const positions = edges.attributes.position.array;
    const colors = edges.attributes.color.array;
    cube.edges.forEach(([a, b], i) => {
      [a, b].forEach((index, end) => {
        const point = flat[index];
        positions.set([point[0] * fit, point[1] * fit, point[2] * fit], i * 6 + end * 3);
        color.copy(far).lerp(near, Math.min(1, Math.hypot(...point) * fit * 0.5));
        colors.set([color.r, color.g, color.b], i * 6 + end * 3);
      });
    });
    flat.forEach((point, i) => corners.attributes.position.array.set(point.map((v) => v * fit), i * 3));
    edges.attributes.position.needsUpdate = true;
    edges.attributes.color.needsUpdate = true;
    corners.attributes.position.needsUpdate = true;
  });

  return (
    <group rotation={[0.35, 0.5, 0]}>
      <Glow size={5} opacity={0.28} />
      <lineSegments geometry={edges} frustumCulled={false}>
        <lineBasicMaterial vertexColors transparent opacity={Math.max(0.28, 1.2 - n * 0.11)} depthWrite={false} />
      </lineSegments>
      <points geometry={corners} frustumCulled={false}>
        <pointsMaterial color={wire.line} size={n > 6 ? 2.5 : 5} sizeAttenuation={false} />
      </points>
    </group>
  );
}

// ---------- Calabi-Yau cross-section ----------

const U = 14; // samples along x
const V = 18; // samples along y
const Y_MAX = 1;

export function CalabiScene({ values, animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const spin = useRef();
  const { n, angle } = values;

  const { surface, lines } = useMemo(() => {
    const tilt = (angle * Math.PI) / 180;
    const position = [];
    const color = [];
    const index = [];
    const mesh = [];
    const first = new THREE.Color(wire.deep);
    const second = new THREE.Color(wire.line);
    const mixed = new THREE.Color();
    const scale = 1.55;
    for (let k1 = 0; k1 < n; k1++) {
      for (let k2 = 0; k2 < n; k2++) {
        const base = position.length / 3;
        mixed.copy(first).lerp(second, ((k1 + k2) % n) / Math.max(1, n - 1) * 0.75);
        for (let i = 0; i <= U; i++) {
          const x = ((Math.PI / 2) * i) / U;
          for (let j = 0; j <= V; j++) {
            const y = -Y_MAX + (2 * Y_MAX * j) / V;
            const { z1, z2 } = calabiPoint(n, k1, k2, x, y);
            position.push(
              scale * z1[0],
              scale * z2[0],
              scale * (Math.cos(tilt) * z1[1] + Math.sin(tilt) * z2[1])
            );
            color.push(mixed.r, mixed.g, mixed.b);
          }
        }
        const at = (i, j) => base + i * (V + 1) + j;
        for (let i = 0; i < U; i++) {
          for (let j = 0; j < V; j++) {
            index.push(at(i, j), at(i + 1, j), at(i + 1, j + 1), at(i, j), at(i + 1, j + 1), at(i, j + 1));
          }
        }
        for (let i = 0; i <= U; i += 2) for (let j = 0; j < V; j++) mesh.push(at(i, j), at(i, j + 1));
        for (let j = 0; j <= V; j += 3) for (let i = 0; i < U; i++) mesh.push(at(i, j), at(i + 1, j));
      }
    }
    const make = (indices) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.Float32BufferAttribute(position, 3));
      geometry.setAttribute("color", new THREE.Float32BufferAttribute(color, 3));
      geometry.setIndex(indices);
      return geometry;
    };
    return { surface: make(index), lines: make(mesh) };
  }, [n, angle, wire]);

  React.useEffect(
    () => () => {
      surface.dispose();
      lines.dispose();
    },
    [surface, lines]
  );

  useFrame(({ clock }) => {
    if (spin.current) spin.current.rotation.y = timeOf(clock) * 0.22;
  });

  return (
    <group rotation={[0.35, 0, 0]}>
      <group ref={spin}>
        <mesh geometry={surface}>
          <meshBasicMaterial vertexColors side={THREE.DoubleSide} transparent opacity={0.72} />
        </mesh>
        <lineSegments geometry={lines}>
          <lineBasicMaterial color={wire.line} transparent opacity={0.22} depthWrite={false} />
        </lineSegments>
      </group>
    </group>
  );
}

// ---------- String harmonics ----------

const SPAN = 4.6;
const STRING_POINTS = 240;

export function HarmonicScene({ values, animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const { n } = values;
  const string = useGeometry(() => buffer(new Array(STRING_POINTS * 3).fill(0)));
  const line = useMemo(() => new THREE.Line(string, new THREE.LineBasicMaterial()), [string]);
  line.material.color.set(wire.line);
  const envelope = useMemo(
    () =>
      [1, -1].map((sign) =>
        Array.from({ length: 121 }, (_, i) => [-SPAN / 2 + (SPAN * i) / 120, sign * 0.85 * Math.sin((n * Math.PI * i) / 120), 0])
      ),
    [n]
  );

  useFrame(({ clock }) => {
    // Drawn slowly: higher patterns still wobble faster, in proportion to n.
    const swing = Math.cos(timeOf(clock) * n * 2.2);
    const array = string.attributes.position.array;
    for (let i = 0; i < STRING_POINTS; i++) {
      const s = i / (STRING_POINTS - 1);
      array.set([-SPAN / 2 + SPAN * s, 0.85 * Math.sin(n * Math.PI * s) * swing, 0], i * 3);
    }
    string.attributes.position.needsUpdate = true;
  });

  return (
    <group>
      <Glow size={4} opacity={0.28} />
      <primitive object={line} />
      {envelope.map((points, i) => (
        <Path key={i} points={points} color={wire.accent} dashed width={1} />
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * SPAN) / 2, 0, 0]}>
          <boxGeometry args={[0.12, 0.9, 0.12]} />
          <meshBasicMaterial color={wire.deep} />
        </mesh>
      ))}
      {Array.from({ length: n + 1 }, (_, i) => (
        <Dot key={i} radius={0.065} color={wire.accent} position={[-SPAN / 2 + (SPAN * i) / n, 0, 0]} />
      ))}
    </group>
  );
}

// ---------- Compact dimension ----------

const TUBE = 5.4;
const WALKERS = 14;

export function CompactScene({ values, animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const { zoom } = values;
  const thickness = 0.008 + zoom * zoom * 0.95;
  const walkers = useRef([]);

  useFrame(({ clock }) => {
    const t = timeOf(clock);
    for (let i = 0; i < WALKERS; i++) {
      const x = (((i / WALKERS) * TUBE + t * (0.25 + (i % 4) * 0.09)) % TUBE) - TUBE / 2;
      const a = i * 2.4 + t * (0.7 + (i % 3) * 0.45);
      walkers.current[i]?.position.set(x, thickness * Math.cos(a), thickness * Math.sin(a));
    }
  });

  return (
    <group rotation={[0, -0.32, 0.12]}>
      <Glow size={3 + zoom * 2} opacity={0.3} />
      {Array.from({ length: 25 }, (_, i) => (
        <group key={i} position={[-TUBE / 2 + (TUBE * i) / 24, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Circle radius={thickness} color={i % 4 ? wire.accent : wire.line} width={1} opacity={0.25 + 0.55 * zoom} />
        </group>
      ))}
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const y = thickness * Math.cos(a);
        const z = thickness * Math.sin(a);
        return <Path key={i} points={[[-TUBE / 2, y, z], [TUBE / 2, y, z]]} color={wire.line} width={1} opacity={0.45} />;
      })}
      {Array.from({ length: WALKERS }, (_, i) => (
        <group key={i} ref={(node) => (walkers.current[i] = node)}>
          <Dot radius={0.025 + 0.035 * zoom} />
        </group>
      ))}
    </group>
  );
}

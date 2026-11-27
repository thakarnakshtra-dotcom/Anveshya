import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Circle, Dot, Path, WireSphere } from "../shell/scene3d.jsx";
import { Glow, useGeometry, useSceneTime, useWire } from "../shell/wire.jsx";
import { gamma, kineticEnergy, newtonianEnergy, orbitRadius, restEnergy } from "./physics.js";
import { EARTH_RADIUS } from "../shell/constants.js";

// A box drawn by its edges, with a soft fill.
function Block({ size, position, color, fill, fillOpacity = 0.18, opacity = 1 }) {
  const wire = useWire();
  const edges = useGeometry(() => {
    const box = new THREE.BoxGeometry(1, 1, 1);
    const lines = new THREE.EdgesGeometry(box);
    box.dispose();
    return lines;
  });
  return (
    <group position={position} scale={size}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={fill || wire.deep} transparent opacity={fillOpacity} depthWrite={false} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color || wire.line} transparent opacity={opacity} />
      </lineSegments>
    </group>
  );
}

// ---------- Light clock ----------

const LIGHT_SPEED = 1.5; // scene units per second
const HEIGHT = 2; // between the mirrors
const TRACK = [-0.5, 2.9]; // where the moving clock travels

// Light going up and down between the mirrors, as a height from -1 to 1.
function bounce(time, period) {
  const t = (((time / period) % 1) + 1) % 1;
  return t < 0.5 ? -1 + 4 * t : 3 - 4 * t;
}

function Mirrors({ color }) {
  return (
    <>
      {[1, -1].map((side) => (
        <Block key={side} size={[0.6, 0.07, 0.4]} position={[0, side * (HEIGHT / 2 + 0.05), 0]} color={color} />
      ))}
    </>
  );
}

export function LightClockScene({ values, animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const { beta } = values;
  const stillPhoton = useRef();
  const clock3 = useRef();
  const movingPhoton = useRef();
  const trail = useGeometry(() => new THREE.BufferGeometry().setFromPoints(Array.from({ length: 300 }, () => new THREE.Vector3())));
  const trailLine = useMemo(() => new THREE.Line(trail, new THREE.LineBasicMaterial({ transparent: true, opacity: 0.8 })), [trail]);
  trailLine.material.color.set(wire.accent);

  useFrame(({ clock }) => {
    const t = timeOf(clock);
    const rest = (2 * HEIGHT) / LIGHT_SPEED; // one tick at rest
    const moving = rest * gamma(beta); // the same tick, seen moving
    const width = TRACK[1] - TRACK[0];
    const speed = beta * LIGHT_SPEED;
    const travelled = speed * t;
    const x = beta > 0 ? TRACK[0] + (travelled % width) : 1.2;
    stillPhoton.current?.position.set(0, bounce(t, rest), 0);
    clock3.current?.position.set(x, 0, 0);
    movingPhoton.current?.position.set(x, bounce(t, moving), 0);

    // The path the moving pulse has drawn since the clock entered the track.
    const since = beta > 0 ? Math.min(t, (travelled % width) / speed) : 0;
    const array = trail.attributes.position.array;
    for (let i = 0; i < 300; i++) {
      const back = since * (1 - i / 299);
      array.set([beta > 0 ? x - speed * back : x, bounce(t - back, moving), 0], i * 3);
    }
    trail.attributes.position.needsUpdate = true;
    trail.computeBoundingSphere();
    trailLine.visible = beta > 0;
  });

  return (
    <group position={[-0.1, 0, 0]}>
      <group position={[-2.2, 0, 0]}>
        <Mirrors />
        <Path points={[[0, -1, 0], [0, 1, 0]]} color={wire.line} opacity={0.35} dashed />
        <group ref={stillPhoton}>
          <Glow size={0.7} color={wire.line} opacity={0.5} />
          <Dot radius={0.1} />
        </group>
      </group>
      <group ref={clock3}>
        <Mirrors color={wire.accent} />
      </group>
      <primitive object={trailLine} />
      <group ref={movingPhoton}>
        <Glow size={0.7} color={wire.accent} opacity={0.8} />
        <Dot radius={0.1} color={wire.accent} />
      </group>
      <Path points={[[-1.3, -1.4, 0], [-1.3, 1.4, 0]]} color={wire.line} opacity={0.25} />
    </group>
  );
}

// ---------- Length contraction ----------

const SHIP = 3; // rest length in scene units

function Ship({ scaleX, faint }) {
  const wire = useWire();
  const color = faint ? wire.accent : wire.line;
  const opacity = faint ? 0.55 : 1;
  return (
    <group scale={[scaleX, 1, 1]}>
      <Block size={[SHIP * 0.78, 0.55, 0.55]} position={[-SHIP * 0.11, 0, 0]} color={color} opacity={opacity} fillOpacity={faint ? 0.04 : 0.25} />
      {Array.from({ length: 7 }, (_, i) => (
        <Path
          key={i}
          points={[
            [-SHIP / 2 + (SHIP * 0.78 * i) / 7, -0.275, 0.28],
            [-SHIP / 2 + (SHIP * 0.78 * i) / 7, 0.275, 0.28],
          ]}
          color={color}
          opacity={opacity * 0.7}
        />
      ))}
      <Path points={[[SHIP * 0.28, 0.275, 0.275], [SHIP / 2, 0, 0], [SHIP * 0.28, -0.275, 0.275]]} color={color} opacity={opacity} />
      <Path points={[[SHIP * 0.28, 0.275, -0.275], [SHIP / 2, 0, 0], [SHIP * 0.28, -0.275, -0.275]]} color={color} opacity={opacity} />
    </group>
  );
}

export function LengthScene({ values, animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const { beta } = values;
  const moving = useRef();
  const factor = 1 / gamma(beta);

  useFrame(({ clock }) => {
    const travel = 5.4;
    const x = beta > 0 ? ((timeOf(clock) * beta * 1.2 + travel / 2) % travel) - travel / 2 : 0;
    if (moving.current) moving.current.position.x = x;
  });

  return (
    <group>
      <group position={[0, 0.9, 0]}>
        <Ship scaleX={1} faint />
      </group>
      <group ref={moving} position={[0, -0.6, 0]}>
        <Ship scaleX={factor} />
        <Path points={[[(-SHIP / 2) * factor, -0.55, 0], [(SHIP / 2) * factor, -0.55, 0]]} width={3} />
      </group>
      {Array.from({ length: 13 }, (_, i) => (
        <Path key={i} points={[[-3 + i * 0.5, -1.35, 0], [-3 + i * 0.5, -1.22, 0]]} color={wire.line} opacity={0.5} />
      ))}
      <Path points={[[-3, -1.35, 0], [3, -1.35, 0]]} opacity={0.5} />
    </group>
  );
}

// ---------- Energy and mass ----------

const TALLEST = 2.8;

export function EnergyScene({ values }) {
  const wire = useWire();
  const rest = restEnergy(1);
  const columns = [
    { key: "rest", value: rest, color: wire.line },
    { key: "relativity", value: kineticEnergy(1, values.beta), color: wire.accent },
    { key: "newton", value: newtonianEnergy(1, values.beta), color: wire.line, faint: true },
  ];
  // The tallest column always has the same height.
  const largest = Math.max(...columns.map((column) => column.value));
  return (
    <group position={[0, -1.35, 0]}>
      {columns.map((column, i) => {
        const h = Math.max(0.012, (column.value / largest) * TALLEST);
        return (
          <Block
            key={column.key}
            size={[0.75, h, 0.75]}
            position={[(i - 1) * 1.35, h / 2, 0]}
            color={column.color}
            fill={column.color}
            fillOpacity={column.faint ? 0.1 : 0.45}
            opacity={column.faint ? 0.5 : 1}
          />
        );
      })}
      <Path points={[[-2.1, 0, 0.5], [2.1, 0, 0.5]]} opacity={0.5} />
    </group>
  );
}

// ---------- Gravity and time ----------

export function GravityTimeScene({ values, animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const satellite = useRef();
  const earth = useRef();
  const ratio = orbitRadius(values.altitude * 1000) / EARTH_RADIUS;
  const orbit = 2.45;
  const globe = orbit / ratio; // true proportion

  useFrame(({ clock }) => {
    const t = timeOf(clock);
    // Higher orbits go round more slowly (Kepler), shown speeded up.
    const a = t * 3 * Math.pow(ratio, -1.5);
    satellite.current?.position.set(orbit * Math.cos(a), 0, orbit * Math.sin(a));
    if (earth.current) earth.current.rotation.y = t * 0.2;
  });

  return (
    <group>
      <Glow size={globe * 5} opacity={0.35} />
      <group ref={earth}>
        <WireSphere radius={globe} fill={wire.solid} opacity={0.5} segments={28} />
      </group>
      <Circle radius={orbit} color={wire.accent} width={2} flat />
      <group ref={satellite}>
        <Block size={[0.12, 0.12, 0.12]} position={[0, 0, 0]} fillOpacity={0.8} />
        {[-1, 1].map((side) => (
          <Block key={side} size={[0.2, 0.015, 0.1]} position={[side * 0.18, 0, 0]} />
        ))}
      </group>
    </group>
  );
}

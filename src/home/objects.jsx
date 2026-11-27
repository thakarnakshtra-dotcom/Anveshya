// The four wireframe illustrations on the home page. They are decorative:
// nothing here is to scale or a simulation.
import { useFrame } from "@react-three/fiber";
import React, { useRef } from "react";
import * as THREE from "three";
import BlackHole from "../labs/black-hole/Shape.jsx";
import Wormhole from "../labs/wormhole/Shape.jsx";
import { Glow, buffer, useGeometry, useSceneTime, useWire } from "../labs/shell/wire.jsx";

// A solid core with latitude and longitude lines.
function Globe({ radius, opacity = 0.45, color }) {
  const wire = useWire();
  const grid = useGeometry(() => {
    const points = [];
    const colors = [];
    const top = new THREE.Color(color || wire.line);
    const edge = new THREE.Color(wire.accent);
    const mixed = new THREE.Color();
    const push = (lat, lon) => {
      points.push(
        radius * Math.cos(lat) * Math.cos(lon),
        radius * Math.sin(lat),
        radius * Math.cos(lat) * Math.sin(lon)
      );
      mixed.copy(top).lerp(edge, Math.abs(lat) / (Math.PI / 2));
      colors.push(mixed.r, mixed.g, mixed.b);
    };
    const around = 48;
    for (let i = 1; i < 10; i++) {
      const lat = -Math.PI / 2 + (Math.PI * i) / 10;
      for (let j = 0; j < around; j++) {
        push(lat, (j / around) * Math.PI * 2);
        push(lat, ((j + 1) / around) * Math.PI * 2);
      }
    }
    for (let m = 0; m < 16; m++) {
      const lon = (m / 16) * Math.PI * 2;
      for (let s = 0; s < 24; s++) {
        push(-Math.PI / 2 + (Math.PI * s) / 24, lon);
        push(-Math.PI / 2 + (Math.PI * (s + 1)) / 24, lon);
      }
    }
    return buffer(points, colors);
  }, [wire, radius, color]);

  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius * 0.98, 24, 18]} />
        <meshBasicMaterial color={wire.solid} />
      </mesh>
      <lineSegments geometry={grid}>
        <lineBasicMaterial vertexColors transparent opacity={opacity} depthWrite={false} />
      </lineSegments>
    </group>
  );
}

function Ring({ radius, color, opacity = 0.4, thickness = 0.005 }) {
  const wire = useWire();
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[radius, thickness, 6, 128]} />
      <meshBasicMaterial color={color || wire.line} transparent opacity={opacity} />
    </mesh>
  );
}

// Outline of a box, used for the satellite body and its panels.
function Frame({ size, position, color, fill }) {
  const wire = useWire();
  const edges = useGeometry(() => {
    const box = new THREE.BoxGeometry(...size);
    const lines = new THREE.EdgesGeometry(box);
    box.dispose();
    return lines;
  });
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={size} />
        <meshBasicMaterial color={fill || wire.deep} transparent opacity={0.55} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color || wire.line} />
      </lineSegments>
    </group>
  );
}

function Satellite() {
  const wire = useWire();
  return (
    <group>
      <Frame size={[0.17, 0.17, 0.24]} />
      {[-1, 1].map((side) => (
        <group key={side}>
          {[0.2, 0.34, 0.48].map((x) => (
            <Frame key={x} size={[0.13, 0.012, 0.22]} position={[side * x, 0, 0]} />
          ))}
          <mesh position={[side * 0.11, 0, 0]}>
            <boxGeometry args={[0.07, 0.012, 0.012]} />
            <meshBasicMaterial color={wire.line} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.16, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.1, 0.08, 14, 1, true]} />
        <meshBasicMaterial color={wire.line} wireframe />
      </mesh>
    </group>
  );
}

// ---------- Planet with a satellite and a moon ----------

const SATELLITE_ORBIT = 1.6;
const MOON_ORBIT = 2.15;

function PlanetWithSatellite({ animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const planetRef = useRef();
  const satelliteRef = useRef();
  const moonRef = useRef();

  useFrame(({ clock }) => {
    const t = timeOf(clock);
    if (planetRef.current) planetRef.current.rotation.y = t * 0.22;
    const a = t * 0.55 + 0.9;
    const satellite = satelliteRef.current;
    if (satellite) {
      satellite.position.set(Math.cos(a) * SATELLITE_ORBIT, 0, Math.sin(a) * SATELLITE_ORBIT);
      satellite.rotation.y = -a; // panels stay across the direction of travel
    }
    const b = t * 0.26 + 3.6;
    moonRef.current?.position.set(Math.cos(b) * MOON_ORBIT, 0, Math.sin(b) * MOON_ORBIT);
  });

  return (
    <group>
      <Glow size={4.8} opacity={0.34} />
      <group rotation={[0.38, 0, 0.3]}>
        <group ref={planetRef}>
          <Globe radius={0.95} opacity={0.6} />
        </group>
      </group>
      <group rotation={[0.42, 0, -0.28]}>
        <Ring radius={SATELLITE_ORBIT} opacity={0.5} />
        <group ref={satelliteRef}>
          <Satellite />
        </group>
      </group>
      <group rotation={[0.2, 0, 0.18]}>
        <Ring radius={MOON_ORBIT} color={wire.accent} opacity={0.4} />
        <group ref={moonRef}>
          <Globe radius={0.17} opacity={0.85} />
        </group>
      </group>
    </group>
  );
}

// ---------- Small solar system ----------

// Illustrative sizes and distances, not to scale.
const PLANETS = [
  { orbit: 0.72, radius: 0.07, start: 0.4 },
  { orbit: 1.05, radius: 0.1, start: 2.6 },
  { orbit: 1.42, radius: 0.11, start: 4.4 },
  { orbit: 1.85, radius: 0.18, start: 1.4, ringed: true },
  { orbit: 2.3, radius: 0.13, start: 5.5 },
];

function SolarSystem({ animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const sunRef = useRef();
  const planetRefs = useRef([]);

  useFrame(({ clock }) => {
    const t = timeOf(clock);
    if (sunRef.current) sunRef.current.rotation.y = t * 0.18;
    PLANETS.forEach((planet, i) => {
      // Planets nearer the Sun go round faster.
      const a = planet.start + t * 0.65 * Math.pow(planet.orbit, -1.5);
      planetRefs.current[i]?.position.set(Math.cos(a) * planet.orbit, 0, Math.sin(a) * planet.orbit);
    });
  });

  return (
    <group rotation={[0.55, 0, -0.16]}>
      <Glow size={2.6} color={wire.accent} opacity={0.75} />
      <Glow size={5} opacity={0.22} />
      <group ref={sunRef}>
        <mesh>
          <sphereGeometry args={[0.36, 28, 20]} />
          <meshBasicMaterial color={wire.accent} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.39, 16, 12]} />
          <meshBasicMaterial color={wire.line} wireframe transparent opacity={0.55} />
        </mesh>
      </group>
      {PLANETS.map((planet, i) => (
        <group key={planet.orbit}>
          <Ring radius={planet.orbit} color={i % 2 ? wire.accent : wire.line} opacity={0.45} />
          <group ref={(node) => (planetRefs.current[i] = node)}>
            <mesh>
              <sphereGeometry args={[planet.radius, 16, 12]} />
              <meshBasicMaterial color={i % 2 ? wire.accent : wire.line} />
            </mesh>
            {planet.ringed ? (
              <group rotation={[0.45, 0, 0.2]}>
                <Ring radius={planet.radius * 1.75} thickness={0.012} opacity={0.85} />
              </group>
            ) : null}
          </group>
        </group>
      ))}
    </group>
  );
}

export const OBJECTS = {
  "black-hole": BlackHole,
  wormhole: Wormhole,
  planet: PlanetWithSatellite,
  "solar-system": SolarSystem,
};

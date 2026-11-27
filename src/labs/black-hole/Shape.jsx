// Wireframe illustration of a black hole with a ring of material.
// A drawing inspired by the physics, not a simulation.
import { Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Glow, buffer, useGeometry, useSceneTime, useWire } from "../shell/wire.jsx";

const DISK_COUNT = 2600;
const HORIZON = 1.15; // radius of the dark sphere
const DISK_INNER = 1.7;
const DISK_OUTER = 3.8;
const RINGS = [1.72, 2.05, 2.45, 2.9, 3.35, 3.8];

export default function BlackHole({ animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const shellRef = useRef();

  const disk = useMemo(() => {
    const radii = new Float32Array(DISK_COUNT);
    const angles = new Float32Array(DISK_COUNT);
    const heights = new Float32Array(DISK_COUNT);
    for (let i = 0; i < DISK_COUNT; i++) {
      const k = Math.pow(Math.random(), 1.6);
      radii[i] = DISK_INNER + k * (DISK_OUTER - DISK_INNER);
      angles[i] = Math.random() * Math.PI * 2;
      heights[i] = (Math.random() - 0.5) * 0.08 * (1 + k);
    }
    return { radii, angles, heights };
  }, []);

  const geometry = useGeometry(() => {
    const colors = [];
    const inner = new THREE.Color(wire.line);
    const outer = new THREE.Color(wire.accent);
    const mixed = new THREE.Color();
    for (let i = 0; i < DISK_COUNT; i++) {
      const k = (disk.radii[i] - DISK_INNER) / (DISK_OUTER - DISK_INNER);
      mixed.copy(inner).lerp(outer, Math.min(1, k * 1.4));
      colors.push(mixed.r, mixed.g, mixed.b);
    }
    return buffer(new Array(DISK_COUNT * 3).fill(0), colors);
  }, [wire]);

  useFrame(({ clock }) => {
    const t = timeOf(clock);
    const array = geometry.attributes.position.array;
    for (let i = 0; i < DISK_COUNT; i++) {
      // Inner material circles faster than outer material.
      const angle = disk.angles[i] + t * 0.9 * Math.pow(disk.radii[i], -1.5);
      array[i * 3] = Math.cos(angle) * disk.radii[i];
      array[i * 3 + 1] = disk.heights[i];
      array[i * 3 + 2] = Math.sin(angle) * disk.radii[i];
    }
    geometry.attributes.position.needsUpdate = true;
    if (shellRef.current) shellRef.current.rotation.y = t * 0.12;
  });

  return (
    <group>
      <Glow size={9} color={wire.accent} opacity={0.3} />
      <mesh>
        <sphereGeometry args={[HORIZON, 48, 36]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      <mesh ref={shellRef}>
        <sphereGeometry args={[HORIZON + 0.02, 22, 14]} />
        <meshBasicMaterial color="#ECEAE3" wireframe transparent opacity={0.16} />
      </mesh>
      <Billboard>
        <mesh>
          <torusGeometry args={[HORIZON * 1.25, 0.028, 10, 128]} />
          <meshBasicMaterial color={wire.line} />
        </mesh>
      </Billboard>
      <group rotation={[0.34, 0, 0.22]}>
        <points geometry={geometry} frustumCulled={false}>
          <pointsMaterial size={2.4} sizeAttenuation={false} vertexColors transparent opacity={0.9} depthWrite={false} />
        </points>
        {RINGS.map((radius, i) => (
          <mesh key={radius} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius, i === 0 ? 0.016 : 0.008, 8, 180]} />
            <meshBasicMaterial color={i < 3 ? wire.line : wire.accent} transparent opacity={0.75 - i * 0.08} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

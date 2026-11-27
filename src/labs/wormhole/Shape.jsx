// Wireframe illustration of a wormhole throat, drawn from
// r = sqrt(l^2 + r0^2) with the height stretched for visibility.
import { useFrame } from "@react-three/fiber";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { Glow, buffer, useGeometry, useSceneTime, useWire } from "../shell/wire.jsx";

const THROAT = 0.55; // r0
const L_MAX = 1.75; // proper distance drawn on each side
const radiusAt = (l) => Math.sqrt(l * l + THROAT * THROAT);
// Height of the embedding surface for r = sqrt(l^2 + r0^2).
const heightAt = (l) => THROAT * Math.asinh(l / THROAT);

function surfacePoint(l, theta) {
  const r = radiusAt(l);
  return [r * Math.cos(theta), heightAt(l) * 1.35, r * Math.sin(theta)];
}

const FLOW_COUNT = 70;

export default function Wormhole({ animate }) {
  const wire = useWire();
  const timeOf = useSceneTime(animate);
  const spinRef = useRef();

  const surface = useGeometry(() => {
    const points = [];
    const colors = [];
    const mouth = new THREE.Color(wire.accent);
    const middle = new THREE.Color(wire.line);
    const color = new THREE.Color();
    const push = (l, theta) => {
      points.push(...surfacePoint(l, theta));
      color.copy(middle).lerp(mouth, Math.abs(l) / L_MAX);
      colors.push(color.r, color.g, color.b);
    };
    const rings = 16;
    const meridians = 28;
    const around = 64;
    for (let i = 0; i <= rings; i++) {
      const l = -L_MAX + (2 * L_MAX * i) / rings;
      for (let j = 0; j < around; j++) {
        push(l, (j / around) * Math.PI * 2);
        push(l, ((j + 1) / around) * Math.PI * 2);
      }
    }
    for (let m = 0; m < meridians; m++) {
      const theta = (m / meridians) * Math.PI * 2;
      for (let s = 0; s < 40; s++) {
        push(-L_MAX + (2 * L_MAX * s) / 40, theta);
        push(-L_MAX + (2 * L_MAX * (s + 1)) / 40, theta);
      }
    }
    return buffer(points, colors);
  }, [wire]);

  const seeds = useMemo(
    () => Array.from({ length: FLOW_COUNT }, () => ({ phase: Math.random(), theta: Math.random() * Math.PI * 2 })),
    []
  );
  const flow = useGeometry(() => buffer(new Array(FLOW_COUNT * 3).fill(0)));

  useFrame(({ clock }) => {
    const t = timeOf(clock);
    const array = flow.attributes.position.array;
    seeds.forEach((seed, i) => {
      const l = L_MAX - ((seed.phase + t * 0.14) % 1) * 2 * L_MAX;
      array.set(surfacePoint(l, seed.theta + l * 0.5), i * 3);
    });
    flow.attributes.position.needsUpdate = true;
    if (spinRef.current) spinRef.current.rotation.y = t * 0.18;
  });

  return (
    <group rotation={[0.42, 0, -0.5]}>
      <Glow size={4.6} opacity={0.38} />
      <group ref={spinRef}>
        <lineSegments geometry={surface}>
          <lineBasicMaterial vertexColors transparent opacity={0.5} depthWrite={false} />
        </lineSegments>
        <points geometry={flow} frustumCulled={false}>
          <pointsMaterial color={wire.line} size={2.6} sizeAttenuation={false} transparent depthWrite={false} />
        </points>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[THROAT, 0.018, 8, 96]} />
          <meshBasicMaterial color={wire.line} />
        </mesh>
      </group>
    </group>
  );
}

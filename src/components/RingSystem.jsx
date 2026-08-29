import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Shared geometry constants so the intro's settled ring and the persistent
// corner badge are visibly "the same ring system," just at different scale.
const MAIN_RADIUS = 2.2;
const MAIN_TUBE = 0.16;
const HALF_RADIUS = 2.9;
const HALF_TUBE = 0.1;
const MAIN_TILT = 1.34; // rotateX, radians — makes the full ring read as a foreshortened ellipse
const HALF_TILT = 1.2;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// The solid, lit "settled" ring pair — a real thick TorusGeometry mesh, not
// a thin line. Reused as-is (just scaled) for both the intro's end state
// and the persistent corner badge, so they're genuinely the same asset.
function SolidRings({ spinSpeed = 0.12 }) {
  const groupRef = useRef();
  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * spinSpeed;
  });

  return (
    <group ref={groupRef}>
      <mesh rotation={[MAIN_TILT, 0, 0]}>
        <torusGeometry args={[MAIN_RADIUS, MAIN_TUBE, 16, 64]} />
        <meshBasicMaterial color="#f5f1e8" transparent opacity={0.92} />
      </mesh>
      <mesh rotation={[HALF_TILT, 0, 0.22]} position={[0, 0.55, -0.35]}>
        <torusGeometry args={[HALF_RADIUS, HALF_TUBE, 16, 48, Math.PI]} />
        <meshBasicMaterial color="#9db9f2" transparent opacity={0.85} />
      </mesh>
    </group>
  );
}

// Builds the target positions particles converge onto: points sampled
// across the *surface* of each torus (not just its centerline), so the
// assembled shape reads as thick/tubular rather than a thin wire outline.
function buildTargets(mainCount, halfCount) {
  const total = mainCount + halfCount;
  const targets = new Float32Array(total * 3);

  for (let i = 0; i < mainCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 2;
    const x = (MAIN_RADIUS + MAIN_TUBE * Math.cos(phi)) * Math.cos(theta);
    const y0 = (MAIN_RADIUS + MAIN_TUBE * Math.cos(phi)) * Math.sin(theta);
    const z0 = MAIN_TUBE * Math.sin(phi);
    const y = y0 * Math.cos(MAIN_TILT) - z0 * Math.sin(MAIN_TILT);
    const z = y0 * Math.sin(MAIN_TILT) + z0 * Math.cos(MAIN_TILT);
    targets[i * 3] = x;
    targets[i * 3 + 1] = y;
    targets[i * 3 + 2] = z;
  }

  for (let j = 0; j < halfCount; j++) {
    const i = mainCount + j;
    const theta = Math.random() * Math.PI; // half ring: only 180 degrees
    const phi = Math.random() * Math.PI * 2;
    const x = (HALF_RADIUS + HALF_TUBE * Math.cos(phi)) * Math.cos(theta);
    const y0 = (HALF_RADIUS + HALF_TUBE * Math.cos(phi)) * Math.sin(theta);
    const z0 = HALF_TUBE * Math.sin(phi);
    const y = y0 * Math.cos(HALF_TILT) - z0 * Math.sin(HALF_TILT) + 0.55;
    const z = y0 * Math.sin(HALF_TILT) + z0 * Math.cos(HALF_TILT) - 0.35;
    targets[i * 3] = x;
    targets[i * 3 + 1] = y;
    targets[i * 3 + 2] = z;
  }

  return targets;
}

function randomScatter(count) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const radius = 5 + Math.random() * 4; // starts well outside the ring — "converging inward"
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi) * 0.5;
  }
  return positions;
}

const MAIN_COUNT = 640;
const HALF_COUNT = 260;
const PARTICLE_COUNT = MAIN_COUNT + HALF_COUNT;
const CONVERGE_DURATION = 2.0;
const HOLD_DURATION = 0.7; // rings visibly rotating before the crossfade

function ConvergingRing({ onSettled }) {
  const pointsRef = useRef();
  const solidGroupRef = useRef();
  const elapsedRef = useRef(0);
  const firedSettled = useRef(false);

  const { positions, starts, targets, materialRef } = useMemo(() => {
    const s = randomScatter(PARTICLE_COUNT);
    const t = buildTargets(MAIN_COUNT, HALF_COUNT);
    return { positions: s.slice(), starts: s, targets: t, materialRef: { current: null } };
  }, []);

  useFrame((_, delta) => {
    elapsedRef.current += delta;
    const t = elapsedRef.current;

    if (pointsRef.current) {
      const array = pointsRef.current.geometry.attributes.position.array;
      const convergeT = Math.min(t / CONVERGE_DURATION, 1);
      const eased = easeOutCubic(convergeT);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3;
        array[ix] = starts[ix] + (targets[ix] - starts[ix]) * eased;
        array[ix + 1] = starts[ix + 1] + (targets[ix + 1] - starts[ix + 1]) * eased;
        array[ix + 2] = starts[ix + 2] + (targets[ix + 2] - starts[ix + 2]) * eased;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;

      // Fade particles in quickly (empty space -> particles appear), then
      // fade them out as the solid rings take over once converged+held.
      const fadeIn = Math.min(t / 0.4, 1);
      const holdEnd = CONVERGE_DURATION + HOLD_DURATION;
      const fadeOut = t > CONVERGE_DURATION ? Math.min((t - CONVERGE_DURATION) / HOLD_DURATION, 1) : 0;
      const mat = pointsRef.current.material;
      mat.opacity = Math.max(0, fadeIn - fadeOut) * 0.95;

      pointsRef.current.rotation.z += delta * 0.08;

      if (solidGroupRef.current) {
        solidGroupRef.current.rotation.z += delta * 0.12;
        solidGroupRef.current.visible = t > CONVERGE_DURATION;
        const solidFade = t > CONVERGE_DURATION ? Math.min((t - CONVERGE_DURATION) / HOLD_DURATION, 1) : 0;
        solidGroupRef.current.children.forEach((mesh) => {
          if (mesh.material) mesh.material.opacity = solidFade * (mesh.userData.baseOpacity || 1);
        });
      }

      if (!firedSettled.current && t > holdEnd) {
        firedSettled.current = true;
        onSettled?.();
      }
    }
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PARTICLE_COUNT} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          color="#f5f1e8"
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <group ref={solidGroupRef} visible={false}>
        <mesh rotation={[MAIN_TILT, 0, 0]} userData={{ baseOpacity: 0.92 }}>
          <torusGeometry args={[MAIN_RADIUS, MAIN_TUBE, 16, 64]} />
          <meshBasicMaterial color="#f5f1e8" transparent opacity={0} />
        </mesh>
        <mesh rotation={[HALF_TILT, 0, 0.22]} position={[0, 0.55, -0.35]} userData={{ baseOpacity: 0.85 }}>
          <torusGeometry args={[HALF_RADIUS, HALF_TUBE, 16, 48, Math.PI]} />
          <meshBasicMaterial color="#9db9f2" transparent opacity={0} />
        </mesh>
      </group>
    </>
  );
}

const INTRO_FLAG = "anveshya-intro-seen";

export function shouldPlayIntro() {
  try {
    if (sessionStorage.getItem(INTRO_FLAG)) return false;
    sessionStorage.setItem(INTRO_FLAG, "1");
    return true;
  } catch {
    return false;
  }
}

// Full-screen intro: empty black -> particles converge inward into a thick
// ring + half-ring -> both rotate briefly -> fades to reveal the page
// underneath (already mounted, just hidden behind this opaque overlay).
export function RingIntro({ onComplete }) {
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (!fading) return;
    const timer = setTimeout(onComplete, 500);
    return () => clearTimeout(timer);
  }, [fading, onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "#000",
        opacity: fading ? 0 : 1,
        transition: "opacity 500ms ease",
        pointerEvents: "none",
      }}
    >
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ antialias: true, alpha: false }} dpr={[1, 1.75]}>
        <ConvergingRing onSettled={() => setFading(true)} />
      </Canvas>
    </div>
  );
}

// Small persistent corner copy of the same ring system, shown on every
// page except Explorer once the intro has finished (or immediately on
// pages reached without ever seeing the intro this session).
export function RingBadge() {
  return (
    <div
      style={{
        position: "fixed",
        right: 22,
        bottom: 22,
        zIndex: 15,
        width: 46,
        height: 46,
        pointerEvents: "none",
      }}
    >
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} gl={{ antialias: true, alpha: true }} dpr={[1, 1.5]}>
        <SolidRings spinSpeed={0.1} />
      </Canvas>
    </div>
  );
}

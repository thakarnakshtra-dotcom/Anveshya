import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

// Shared geometry so the intro's settled ring and the persistent corner
// badge are visibly "the same ring system," just at different scale.
const MAIN_RADIUS = 2.2;
const MAIN_TUBE = 0.16;
const MAIN_TILT = 1.34; // rotateX, radians — makes the full ring read as a foreshortened ellipse

// The intro's PerspectiveCamera has a fixed *vertical* FOV, so its visible
// *width* in world units shrinks on narrow/portrait aspect ratios (a tall
// phone screen sees much less horizontally than a wide desktop one at the
// same camera distance) — without this, the ring (a fixed 2*MAIN_RADIUS
// wide, regardless of screen size) reads as oversized and crops/overlaps
// the page during the fade-out on mobile. RING_FIT_WIDTH is the world-unit
// width the ring needs to sit comfortably inside with margin.
const RING_FIT_WIDTH = MAIN_RADIUS * 2 + 2.2;

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

// The solid, lit "settled" ring — a real thick TorusGeometry mesh, not a
// thin line. Reused as-is (just scaled) for both the intro's end state and
// the persistent corner badge, so they're genuinely the same asset.
function SolidRing({ spinSpeed = 0.12 }) {
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
    </group>
  );
}

// Target positions particles converge onto: points sampled across the
// torus's *surface* (not just its centerline), so the assembled shape
// reads as thick/tubular rather than a thin wire outline.
function buildTargets(count) {
  const targets = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
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

const PARTICLE_COUNT = 700;
const CONVERGE_DURATION = 2.0;
const HOLD_DURATION = 0.7; // ring visibly rotating before the crossfade

function ConvergingRing({ onSettled }) {
  const pointsRef = useRef();
  const solidGroupRef = useRef();
  const fitGroupRef = useRef();
  const elapsedRef = useRef(0);
  const firedSettled = useRef(false);
  const { viewport } = useThree();

  const { positions, starts, targets } = useMemo(() => {
    const s = randomScatter(PARTICLE_COUNT);
    const t = buildTargets(PARTICLE_COUNT);
    return { positions: s.slice(), starts: s, targets: t };
  }, []);

  // Shrink (never enlarge) the whole ring so it always fits the current
  // viewport width — this is what actually fixes the mobile "too large,
  // overlaps content" symptom, since it's driven by real aspect ratio,
  // not a fixed breakpoint guess.
  useEffect(() => {
    if (!fitGroupRef.current) return;
    const scale = Math.min(1, viewport.width / RING_FIT_WIDTH);
    fitGroupRef.current.scale.setScalar(scale);
  }, [viewport.width]);

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
      // fade them out as the solid ring takes over once converged+held.
      const fadeIn = Math.min(t / 0.4, 1);
      const holdEnd = CONVERGE_DURATION + HOLD_DURATION;
      const fadeOut = t > CONVERGE_DURATION ? Math.min((t - CONVERGE_DURATION) / HOLD_DURATION, 1) : 0;
      pointsRef.current.material.opacity = Math.max(0, fadeIn - fadeOut) * 0.95;
      pointsRef.current.rotation.z += delta * 0.08;

      if (solidGroupRef.current) {
        solidGroupRef.current.rotation.z += delta * 0.12;
        solidGroupRef.current.visible = t > CONVERGE_DURATION;
        const solidFade = t > CONVERGE_DURATION ? Math.min((t - CONVERGE_DURATION) / HOLD_DURATION, 1) : 0;
        const mesh = solidGroupRef.current.children[0];
        if (mesh?.material) mesh.material.opacity = solidFade * 0.92;
      }

      if (!firedSettled.current && t > holdEnd) {
        firedSettled.current = true;
        onSettled?.();
      }
    }
  });

  return (
    <group ref={fitGroupRef}>
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
        <mesh rotation={[MAIN_TILT, 0, 0]}>
          <torusGeometry args={[MAIN_RADIUS, MAIN_TUBE, 16, 64]} />
          <meshBasicMaterial color="#f5f1e8" transparent opacity={0} />
        </mesh>
      </group>
    </group>
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
// ring -> it rotates briefly -> fades to reveal the page underneath
// (already mounted, just hidden behind this opaque overlay).
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

// Small persistent corner copy of the same ring, shown on every page
// except Explorer once the intro has finished (or immediately on pages
// reached without ever seeing the intro this session).
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
        <SolidRing spinSpeed={0.1} />
      </Canvas>
    </div>
  );
}

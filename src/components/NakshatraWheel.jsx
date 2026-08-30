import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { nakshatras, NAKSHATRA_SEGMENT_DEGREES, NAKSHATRA_SOURCES } from "../data/nakshatras.js";

const OUTER_RADIUS = 5.4;
const INNER_RADIUS = 3.9;
const SEGMENT_GAP_RAD = 0.012;
const COLOR_CYCLE = ["#ffd281", "#7fd9ff", "#9db9f2"];

function degToRad(d) {
  return (d * Math.PI) / 180;
}

// One 13.33°-wide wedge of the wheel. Plain RingGeometry slices rather
// than anything fancier — 27 of these is cheap, well within a 60fps
// budget on a phone.
function Segment({ nakshatra, index, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const thetaStart = degToRad(index * NAKSHATRA_SEGMENT_DEGREES) + SEGMENT_GAP_RAD / 2;
  const thetaLength = degToRad(NAKSHATRA_SEGMENT_DEGREES) - SEGMENT_GAP_RAD;
  const color = COLOR_CYCLE[index % COLOR_CYCLE.length];
  const midAngle = thetaStart + thetaLength / 2;
  const labelRadius = (OUTER_RADIUS + INNER_RADIUS) / 2;

  const geometry = useMemo(
    () => new THREE.RingGeometry(INNER_RADIUS, OUTER_RADIUS, 1, 1, thetaStart, thetaLength),
    [thetaStart, thetaLength]
  );

  const active = selected || hovered;

  return (
    <group>
      <mesh
        geometry={geometry}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(nakshatra.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial
          color={color}
          transparent
          opacity={active ? 0.55 : 0.22}
          side={THREE.DoubleSide}
          emissive={color}
          emissiveIntensity={active ? 0.5 : 0.08}
        />
      </mesh>
      {/* Non-transform Html billboards to the camera and only moves with
          the anchor's 3D *position*, not its rotation — same pattern
          already used for moon labels in Explorer.jsx. A `transform`
          Html here would inherit the wheel's spin as an on-screen
          rotation too, flipping labels upside-down on the bottom half
          as it turns; this keeps every label upright and readable
          regardless of how far the wheel has been spun. */}
      <Html
        as="div"
        center
        occlude={false}
        position={[Math.cos(midAngle) * labelRadius, Math.sin(midAngle) * labelRadius, 0.01]}
        style={{ pointerEvents: "none" }}
      >
        <div className={active ? "nak-label nak-label-active" : "nak-label"}>{nakshatra.name}</div>
      </Html>
    </group>
  );
}

function OmCenter() {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.08;
  });
  return (
    <group ref={ref}>
      <Html center style={{ pointerEvents: "none" }}>
        <div className="nak-om">ॐ</div>
      </Html>
    </group>
  );
}

function InnerRingDust() {
  // Honest stand-in for "constellation imagery" per nakshatra: most of
  // the 27 don't have one dedicated, photographable star (see
  // data/nakshatras.js), so rather than invent 27 NASA image URLs this
  // is a decorative starfield accent instead — real in kind, just not
  // claiming to be a specific verified photograph.
  const points = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 140; i++) {
      const r = INNER_RADIUS * 0.25 + Math.random() * (INNER_RADIUS * 0.68);
      const a = Math.random() * Math.PI * 2;
      arr.push(Math.cos(a) * r, Math.sin(a) * r, (Math.random() - 0.5) * 0.15);
    }
    return new Float32Array(arr);
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={points.length / 3} array={points} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#f5f1e8" size={0.045} sizeAttenuation transparent opacity={0.75} />
    </points>
  );
}

// Same technique as RingSystem.jsx's ConvergingRing ("shrink, never
// enlarge, driven by real viewport size"), extended to both axes: a
// fixed-vertical-FOV camera keeps vertical world-extent constant
// regardless of aspect ratio, so on a narrow/tall phone screen the ring
// doesn't overflow sideways the way a naive width-only fit would miss —
// it was riding right up under the fixed-position topbar UI at the top
// of the canvas instead, caught visually on a real mobile screenshot,
// not by assuming the desktop layout would just scale down cleanly.
const WHEEL_FIT_DIAMETER = OUTER_RADIUS * 2 + 1.6;

function FitScale({ children }) {
  const groupRef = useRef();
  const { viewport } = useThree();
  useFrame(() => {
    if (!groupRef.current) return;
    const scale = Math.min(1, Math.min(viewport.width, viewport.height) / WHEEL_FIT_DIAMETER);
    groupRef.current.scale.setScalar(scale);
  });
  return <group ref={groupRef}>{children}</group>;
}

function WheelGroup({ selectedId, onSelect, rotationRef }) {
  // Single group: the JSX rotation.x below is the fixed forward tilt
  // (applied once, for 3D depth), and useFrame mutates only .z each
  // frame (the drag-controlled spin) — an earlier version nested a
  // second group with an opposite rotation.x meant to counter-rotate
  // just the labels, but applied it to the whole group instead, which
  // silently canceled the tilt back to zero. Caught before shipping by
  // re-reading the composed rotation math, not by visual testing.
  const groupRef = useRef();
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.z = rotationRef.current;
  });

  return (
    <group ref={groupRef} rotation={[-0.32, 0, 0]}>
      {nakshatras.map((n, i) => (
        <Segment key={n.id} nakshatra={n} index={i} selected={n.id === selectedId} onSelect={onSelect} />
      ))}
      <InnerRingDust />
    </group>
  );
}

function DragControls({ rotationRef, onDragStateChange }) {
  const startX = useRef(0);
  const startRotation = useRef(0);
  const dragging = useRef(false);

  const handlePointerDown = (e) => {
    dragging.current = true;
    startX.current = e.clientX;
    startRotation.current = rotationRef.current;
    onDragStateChange?.(true);
    e.target.setPointerCapture?.(e.pointerId);
  };
  const handlePointerMove = (e) => {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    rotationRef.current = startRotation.current + dx * 0.006;
  };
  const handlePointerUp = () => {
    dragging.current = false;
    onDragStateChange?.(false);
  };

  return (
    <mesh
      position={[0, 0, -0.5]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <planeGeometry args={[40, 40]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

function NakshatraDetail({ nakshatra, onClose }) {
  if (!nakshatra) return null;
  return (
    <div className="nak-detail-panel">
      <button type="button" className="nak-detail-close" onClick={onClose} aria-label="Close">
        &times;
      </button>
      <div className="nak-detail-kicker">
        Nakshatra {nakshatra.id.toString().padStart(2, "0")} / 27
      </div>
      <h3 className="nak-detail-name">{nakshatra.name}</h3>
      <p className="nak-detail-theme">{nakshatra.theme}</p>
      <div className="nak-detail-row">
        <span className="nak-detail-label">Ruling planet</span>
        <span className="nak-detail-value">{nakshatra.planet}</span>
      </div>
      <div className="nak-detail-row">
        <span className="nak-detail-label">Ruling deity</span>
        <span className="nak-detail-value">{nakshatra.deity}</span>
      </div>
      <div className="nak-detail-row">
        <span className="nak-detail-label">Symbol</span>
        <span className="nak-detail-value">{nakshatra.symbol}</span>
      </div>
      <div className="nak-detail-row">
        <span className="nak-detail-label">Star</span>
        <span className="nak-detail-value">
          {nakshatra.star || "No single dedicated star — this nakshatra spans a broader region of sky"}
        </span>
      </div>
      <Link to="/learn?tab=ancient&topic=nakshatra" className="nak-detail-more" target="_blank" rel="noopener noreferrer">
        Explore in detail &rarr;
      </Link>
      <p className="nak-detail-more-note">
        Learn page shows: mythology, calculations, Vedic significance, and which correlations are solidly verified
        versus traditional.
      </p>
    </div>
  );
}

export default function NakshatraWheel({ onClose }) {
  // rotationRef intentionally isn't wired into React state — the wheel's
  // own useFrame reads it directly every frame, and nothing else in this
  // component's own render depends on the live rotation value.
  const rotationRef = useRef(0);
  const [selectedId, setSelectedId] = useState(null);
  const [dragging, setDragging] = useState(false);
  const selected = nakshatras.find((n) => n.id === selectedId) || null;

  return (
    <div className="nak-wheel-stage">
      <Canvas camera={{ position: [0, 0, 11], fov: 45 }} dpr={[1, 1.75]}>
        <ambientLight intensity={0.6} />
        <pointLight position={[6, 6, 8]} intensity={60} color="#ffd281" />
        <pointLight position={[-6, -4, 6]} intensity={40} color="#7fd9ff" />
        <Stars radius={60} depth={30} count={2500} factor={2.4} saturation={0} fade speed={0.4} />
        <FitScale>
          <WheelGroup selectedId={selectedId} onSelect={setSelectedId} rotationRef={rotationRef} />
          <OmCenter />
        </FitScale>
        <DragControls rotationRef={rotationRef} onDragStateChange={setDragging} />
      </Canvas>

      <div className="nak-wheel-topbar">
        <div className="nak-wheel-title">
          <span className="nak-wheel-eyebrow">27 Nakshatras</span>
          <span className="nak-wheel-hint">{dragging ? "Rotating…" : "Drag to rotate · tap a segment"}</span>
        </div>
        <button type="button" className="return-button" onClick={onClose}>
          Return
        </button>
      </div>

      <NakshatraDetail nakshatra={selected} onClose={() => setSelectedId(null)} />

      <div className="nak-wheel-source">
        {NAKSHATRA_SOURCES.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
    </div>
  );
}

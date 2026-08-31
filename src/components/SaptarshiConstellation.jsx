import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  SAPTARSHI_STARS,
  SAPTARSHI_CONNECTIONS,
  ARUNDHATI_STAR,
  POLARIS,
  SAPTARSHI_NOTES,
  SAPTARSHI_SOURCES,
} from "../data/saptarshi.js";

// A stylized schematic laid out to trace the Dipper's real, recognized
// outline (bowl closed Dubhe-Merak-Phecda-Megrez, handle bent off
// Megrez through Alioth-Mizar-Alkaid) and each star's real relative
// order — not a scale-accurate 3D reconstruction from real RA/Dec/
// distance data, which this project doesn't have the ephemeris for.
// Andromeda's galaxy scene draws the same honesty line for the same
// reason (see AndromedaGalaxy.jsx).
const POSITIONS = {
  dubhe: [-2.2, 2.6, 0.3],
  merak: [-2.4, 1.0, -0.2],
  phecda: [-1.0, 0.2, 0.1],
  megrez: [-0.6, 1.6, 0.4],
  alioth: [0.8, 1.9, -0.1],
  mizar: [2.1, 1.6, 0.3],
  alkaid: [3.3, 0.7, -0.3],
};

// Alcor sits just off Mizar's shoulder — close enough on screen to read
// as "Mizar's companion," matching how it actually looks in the sky.
const ARUNDHATI_POSITION = [2.28, 1.5, 0.36];

// Real rule of thumb: extend the Merak->Dubhe line about 5x its own
// length to reach Polaris. Placed along that same direction here, just
// compressed to roughly 3.5x so it stays framed in the same shot
// without pushing the camera absurdly far back — a staging choice, not
// a claim about the real distance ratio.
const POLARIS_POSITION = (() => {
  const [mx, my] = POSITIONS.merak;
  const [dx, dy] = POSITIONS.dubhe;
  const vx = dx - mx;
  const vy = dy - my;
  return [dx + vx * 3.5, dy + vy * 3.5, 1.0];
})();

function starRadius(magnitude) {
  return Math.max(0.09, 0.24 - magnitude * 0.035);
}

function StarNode({ id, position, radius, color, selected, onSelect, label }) {
  const [hovered, setHovered] = useState(false);
  const active = selected || hovered;
  return (
    <group position={position}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[radius, 24, 24]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh scale={active ? 2.2 : 1.7}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.35 : 0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {label ? (
        <Html center occlude={false} zIndexRange={[1, 0]} position={[0, -radius - 0.28, 0]} style={{ pointerEvents: "none" }}>
          <div className={`sapt-label${active ? " sapt-label-active" : ""}`}>{label}</div>
        </Html>
      ) : null}
    </group>
  );
}

function ConstellationLines() {
  const positions = useMemo(() => {
    const arr = [];
    SAPTARSHI_CONNECTIONS.forEach(([a, b]) => {
      arr.push(...POSITIONS[a], ...POSITIONS[b]);
    });
    return new Float32Array(arr);
  }, []);
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#7fd9ff" transparent opacity={0.5} />
    </lineSegments>
  );
}

function PointerLine() {
  const positions = useMemo(
    () => new Float32Array([...POSITIONS.merak, ...POSITIONS.dubhe, ...POSITIONS.dubhe, ...POLARIS_POSITION]),
    []
  );
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color="#ffd281" transparent opacity={0.35} />
    </lineSegments>
  );
}

function SlowSpin({ children }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.035;
  });
  return <group ref={ref}>{children}</group>;
}

function Scene({ selectedId, onSelect, targetY }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[6, 6, 8]} intensity={40} color="#eaf2ff" />
      <pointLight position={[-6, -3, 6]} intensity={25} color="#7fd9ff" />
      <Stars radius={80} depth={40} count={3200} factor={2.3} saturation={0} fade speed={0.3} />
      <SlowSpin>
        <ConstellationLines />
        <PointerLine />
        {SAPTARSHI_STARS.map((star) => (
          <StarNode
            key={star.id}
            id={star.id}
            position={POSITIONS[star.id]}
            radius={starRadius(star.magnitude)}
            color={star.color}
            selected={selectedId === star.id}
            onSelect={onSelect}
            label={star.englishName}
          />
        ))}
        <StarNode
          id="arundhati"
          position={ARUNDHATI_POSITION}
          radius={0.045}
          color="#ffe9b3"
          selected={selectedId === "arundhati"}
          onSelect={onSelect}
          label={null}
        />
        <group position={POLARIS_POSITION}>
          <mesh onClick={(e) => { e.stopPropagation(); onSelect("polaris"); }}>
            <sphereGeometry args={[0.16, 24, 24]} />
            <meshBasicMaterial color="#fff6d8" />
          </mesh>
          <mesh scale={2.4}>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshBasicMaterial color="#fff6d8" transparent opacity={0.22} depthWrite={false} blending={THREE.AdditiveBlending} />
          </mesh>
          <Html center occlude={false} zIndexRange={[1, 0]} position={[0, -0.42, 0]} style={{ pointerEvents: "none" }}>
            <div className={`sapt-label sapt-label-polaris${selectedId === "polaris" ? " sapt-label-active" : ""}`}>Polaris</div>
          </Html>
        </group>
      </SlowSpin>
      <OrbitControls enablePan={false} minDistance={5} maxDistance={30} target={[0, targetY, 0]} autoRotate={false} />
    </>
  );
}

function initialCameraDistance() {
  if (typeof window === "undefined") return 15;
  const aspect = window.innerWidth / window.innerHeight;
  if (aspect >= 1) return 15;
  return Math.min(26, 15 / Math.max(aspect, 0.45));
}

// The dipper's own 7 stars center on roughly y=1.37 — a sane default
// look-at target on desktop, where the docked panel sits to the side.
// On mobile the panel docks across the bottom instead (see styles.css),
// so aiming lower than the dipper's true center tilts the view down,
// which pushes the dipper itself higher into the portion of the canvas
// actually visible above the panel — same technique as
// AndromedaGalaxy.jsx's targetYOffset, same reason.
function targetYOffset() {
  if (typeof window === "undefined") return 1.3;
  return window.innerWidth / window.innerHeight < 1 ? -1.2 : 1.3;
}

function findEntry(id) {
  if (id === "arundhati") return { kind: "arundhati", data: ARUNDHATI_STAR };
  if (id === "polaris") return { kind: "polaris", data: POLARIS };
  const star = SAPTARSHI_STARS.find((s) => s.id === id);
  return star ? { kind: "star", data: star } : null;
}

function DetailPanel({ selectedId, onClear }) {
  const entry = findEntry(selectedId);
  if (!entry) return null;
  const { kind, data } = entry;

  if (kind === "star") {
    return (
      <div className="sapt-detail">
        <button type="button" className="sapt-detail-close" onClick={onClear} aria-label="Close">&times;</button>
        <div className="sapt-detail-kicker">{data.bayer}</div>
        <h3 className="sapt-detail-name">{data.englishName}</h3>
        <p className="sapt-detail-theme">{data.sanskritName} &mdash; {data.part}</p>
        <div className="sapt-detail-row"><span>Magnitude</span><span>{data.magnitude}</span></div>
        <div className="sapt-detail-row"><span>Distance</span><span>~{data.distanceLightYears} light-years</span></div>
        <div className="sapt-detail-row"><span>Color</span><span>{data.colorLabel}</span></div>
        <div className="sapt-detail-row"><span>Spectral type</span><span>{data.spectralType}</span></div>
        <p className="sapt-detail-fact">{data.fact}</p>
        <p className="sapt-detail-fact sapt-detail-myth">{data.mythology}</p>
      </div>
    );
  }

  if (kind === "arundhati") {
    return (
      <div className="sapt-detail">
        <button type="button" className="sapt-detail-close" onClick={onClear} aria-label="Close">&times;</button>
        <div className="sapt-detail-kicker">Companion star, not one of the seven</div>
        <h3 className="sapt-detail-name">{data.englishName}</h3>
        <p className="sapt-detail-theme">{data.sanskritName} &mdash; companion of Mizar (Vasishtha)</p>
        <div className="sapt-detail-row"><span>Magnitude</span><span>{data.magnitude}</span></div>
        <p className="sapt-detail-fact">{data.fact}</p>
        <p className="sapt-detail-fact sapt-detail-myth">{data.mythology}</p>
      </div>
    );
  }

  return (
    <div className="sapt-detail">
      <button type="button" className="sapt-detail-close" onClick={onClear} aria-label="Close">&times;</button>
      <div className="sapt-detail-kicker">Navigation reference, not part of Ursa Major</div>
      <h3 className="sapt-detail-name">{data.englishName}</h3>
      <p className="sapt-detail-theme">{data.designation}</p>
      <div className="sapt-detail-row"><span>Distance</span><span>{data.distanceLightYearsLabel}</span></div>
      <p className="sapt-detail-fact">{data.fact}</p>
    </div>
  );
}

export default function SaptarshiConstellation({ onClose }) {
  const [selectedId, setSelectedId] = useState(null);
  const [cameraZ] = useState(initialCameraDistance);
  const [targetY] = useState(targetYOffset);

  return (
    <div className="sapt-stage">
      <Canvas camera={{ position: [0, 0, cameraZ], fov: 48 }} dpr={[1, 1.75]}>
        <Scene selectedId={selectedId} onSelect={setSelectedId} targetY={targetY} />
      </Canvas>

      <div className="sapt-topbar">
        <div className="sapt-title">
          <span className="sapt-eyebrow">Saptarshi &middot; The Big Dipper</span>
          <span className="sapt-hint">Drag to rotate &middot; scroll to zoom &middot; tap a star</span>
        </div>
        <button type="button" className="return-button" onClick={onClose}>Return</button>
      </div>

      <div className="sapt-panel">
        {selectedId ? (
          <DetailPanel selectedId={selectedId} onClear={() => setSelectedId(null)} />
        ) : (
          <>
            <div className="sapt-panel-section">
              <h3>The Seven Sages</h3>
              <p className="sapt-now-note">{SAPTARSHI_NOTES.overview}</p>
            </div>
            <div className="sapt-panel-section">
              <h3>Finding north</h3>
              <p className="sapt-now-note">{SAPTARSHI_NOTES.pointerStars}</p>
              <p className="sapt-now-note">{SAPTARSHI_NOTES.circumpolar}</p>
            </div>
            <div className="sapt-panel-section">
              <h3>A temporary shape</h3>
              <p className="sapt-now-note">{SAPTARSHI_NOTES.shapeIsTemporary}</p>
              <p className="sapt-now-note">{SAPTARSHI_NOTES.precession}</p>
            </div>
          </>
        )}
        <div className="sapt-sources">
          {SAPTARSHI_SOURCES.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

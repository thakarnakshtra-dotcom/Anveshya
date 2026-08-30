import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  ANDROMEDA_DATA,
  ANDROMEDA_LEARN_MORE_URL,
  ANDROMEDA_SOURCES,
  COLLISION_TIMELINE,
  MILKY_WAY_DIAMETER_LIGHT_YEARS,
} from "../data/andromeda.js";

// A real photograph mapped onto a flat, tilted plane rather than a
// sphere/icosahedron — Andromeda is genuinely nearly flat as seen from
// Earth (we view its disc at a steep angle), and photo-texturing a
// solid geometry would just introduce visible UV seams and warping for
// no accuracy gain. The tilt itself approximates the galaxy's real
// ~13° inclination-from-edge-on viewing angle.
function AndromedaDisc({ collisionProgress }) {
  const texture = useTexture(ANDROMEDA_DATA.imageUrl);
  const ref = useRef();
  const milkyWayRef = useRef();

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.z += delta * 0.025;
    if (milkyWayRef.current) milkyWayRef.current.rotation.z -= delta * 0.04;
  });

  // Illustrative only (see data/andromeda.js) — approaches from off-scene
  // and grows as collisionProgress goes 0 -> 1, ending overlapped with
  // Andromeda to suggest a merger rather than simulating one.
  const mwZ = 6 - collisionProgress * 6.6;
  const mwScale = 0.55 + collisionProgress * 0.75;
  const mwOpacity = Math.min(1, collisionProgress * 2.2);

  return (
    <>
      <group ref={ref} rotation={[1.02, 0, 0.35]}>
        {/* meshBasicMaterial, not meshStandardMaterial — this is a real
            photograph being displayed, not a physically-lit surface, and
            standard material's response to the scene's ambient/point
            lights was lifting the image's own near-black background
            pixels into visible gray, showing the plane's rectangular
            edge as a hard parallelogram against the actual black scene
            background. Basic material just shows the texture's own
            values untouched by scene lighting, so genuinely dark pixels
            stay genuinely dark and the edge disappears into the void. */}
        <mesh>
          <planeGeometry args={[6.2, 6.2]} />
          <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0, 0.02]}>
          <circleGeometry args={[3.3, 48]} />
          <meshBasicMaterial color="#cfe4ff" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>

      {collisionProgress > 0 ? (
        <group ref={milkyWayRef} position={[1.6, 0.4, mwZ]} rotation={[1.02, 0, -0.5]} scale={mwScale}>
          <mesh>
            <circleGeometry args={[2.6, 48]} />
            <meshStandardMaterial
              color="#e8dcc8"
              transparent
              opacity={mwOpacity * 0.85}
              emissive="#ffd281"
              emissiveIntensity={0.35}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ) : null}
    </>
  );
}

function Scene({ collisionProgress, cameraZ, targetY }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[8, 6, 10]} intensity={50} color="#ffd281" />
      <pointLight position={[-8, -4, 6]} intensity={35} color="#7fd9ff" />
      <Stars radius={70} depth={35} count={3200} factor={2.6} saturation={0} fade speed={0.35} />
      <Suspense fallback={null}>
        <AndromedaDisc collisionProgress={collisionProgress} />
      </Suspense>
      <OrbitControls
        enablePan={false}
        minDistance={4.5}
        // Must be >= the computed initial camera distance on a narrow
        // screen, or OrbitControls clamps the camera straight back to
        // maxDistance on mount, silently undoing the portrait-mode fix
        // below before the first frame even renders.
        maxDistance={Math.max(16, cameraZ + 2)}
        target={[0, targetY, 0]}
        autoRotate={collisionProgress === 0}
        autoRotateSpeed={0.4}
      />
    </>
  );
}

function SizeComparison() {
  const [show, setShow] = useState(false);
  const maxLY = ANDROMEDA_DATA.diameterLightYears;
  const mwPct = Math.round((MILKY_WAY_DIAMETER_LIGHT_YEARS / maxLY) * 100);

  return (
    <div className="andro-comparison">
      <button type="button" className="andro-toggle" onClick={() => setShow((s) => !s)} aria-expanded={show}>
        {show ? "Hide" : "Show"} size comparison
      </button>
      {show ? (
        <div className="andro-bars">
          <div className="andro-bar-row">
            <span className="andro-bar-label">Milky Way</span>
            <div className="andro-bar-track">
              <div className="andro-bar-fill andro-bar-mw" style={{ width: `${mwPct}%` }} />
            </div>
            <span className="andro-bar-value">~{MILKY_WAY_DIAMETER_LIGHT_YEARS.toLocaleString()} ly</span>
          </div>
          <div className="andro-bar-row">
            <span className="andro-bar-label">Andromeda</span>
            <div className="andro-bar-track">
              <div className="andro-bar-fill andro-bar-andromeda" style={{ width: "100%" }} />
            </div>
            <span className="andro-bar-value">~{maxLY.toLocaleString()} ly</span>
          </div>
          <p className="andro-bar-note">
            Andromeda's disc is roughly {(maxLY / MILKY_WAY_DIAMETER_LIGHT_YEARS).toFixed(1)}&times; the Milky Way's
            traditionally-cited diameter &mdash; though both estimates vary by study, especially once each galaxy's
            fainter outer disc is included.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function CollisionTimeline({ progress, playing, onPlay }) {
  const activeIndex = Math.min(
    COLLISION_TIMELINE.length - 1,
    Math.floor(progress * (COLLISION_TIMELINE.length - 1) + 0.001)
  );
  const active = COLLISION_TIMELINE[activeIndex];

  return (
    <div className="andro-timeline">
      <p className="andro-timeline-desc">
        In {ANDROMEDA_DATA.collisionTime}, Andromeda and the Milky Way will merge. This is a simplified, illustrative
        animation of that timeline &mdash; not a physics simulation.
      </p>
      <button type="button" className="andro-timeline-btn" onClick={onPlay} disabled={playing}>
        {playing ? "Playing…" : "▶ Play collision timeline"}
      </button>
      {playing || progress > 0 ? (
        <div className="andro-timeline-readout">
          <div className="andro-timeline-label">{active.label}</div>
          <p className="andro-timeline-note">{active.note}</p>
        </div>
      ) : null}
    </div>
  );
}

// Computed once from real window dimensions (not R3F's `viewport` helper,
// which is zoom-relative — OrbitControls zoom here changes camera
// distance, which changes `viewport.width` live, so continuously
// rescaling against it the way NakshatraWheel's FitScale does would
// have fought the user's own zoom instead of just fixing initial
// framing). A fixed-vertical-FOV camera doesn't lose vertical extent on
// a narrow/tall screen, only horizontal — so on portrait mobile the
// disc's sides would clip off unless the camera starts further back.
function initialCameraDistance() {
  if (typeof window === "undefined") return 9;
  const aspect = window.innerWidth / window.innerHeight;
  if (aspect >= 1) return 9;
  return Math.min(20, 9 / Math.max(aspect, 0.4));
}

// The .andro-panel docks across the bottom ~48vh on narrow screens (see
// styles.css), covering roughly the lower half of the canvas — framing
// the galaxy (at world origin) dead-center puts a good chunk of it
// behind that panel. Aiming OrbitControls' target at a point *below*
// the origin, while leaving the camera's own position untouched, tilts
// the view down toward that lower aim point — which pushes the actual
// object (above the aim point) higher up in the rendered frame, into
// the portion of the canvas that's actually visible above the panel.
function targetYOffset() {
  if (typeof window === "undefined") return 0;
  return window.innerWidth / window.innerHeight < 1 ? -2.4 : 0;
}

export default function AndromedaGalaxy({ onClose }) {
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rafRef = useRef(null);
  const [cameraZ] = useState(initialCameraDistance);
  const [targetY] = useState(targetYOffset);

  const handlePlay = () => {
    setPlaying(true);
    const durationMs = 7000;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / durationMs);
      setProgress(t);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPlaying(false);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="andro-stage">
      <Canvas camera={{ position: [0, 0, cameraZ], fov: 48 }} dpr={[1, 1.75]}>
        <Scene collisionProgress={progress} cameraZ={cameraZ} targetY={targetY} />
      </Canvas>

      <div className="andro-topbar">
        <div className="andro-title">
          <span className="andro-eyebrow">Andromeda Galaxy &middot; M31</span>
          <span className="andro-hint">Drag to rotate &middot; scroll or pinch to zoom</span>
        </div>
        <button type="button" className="return-button" onClick={onClose}>
          Return
        </button>
      </div>

      <div className="andro-panel">
        <h3 className="andro-panel-name">{ANDROMEDA_DATA.name}</h3>
        <p className="andro-panel-sub">{ANDROMEDA_DATA.designation} &mdash; our nearest large galactic neighbor</p>

        <div className="andro-facts">
          <div className="andro-fact-row">
            <span className="andro-fact-label">Distance</span>
            <span className="andro-fact-value">{ANDROMEDA_DATA.distanceLabel}</span>
          </div>
          <div className="andro-fact-row">
            <span className="andro-fact-label">Diameter</span>
            <span className="andro-fact-value">{ANDROMEDA_DATA.diameterLabel}</span>
          </div>
          <div className="andro-fact-row">
            <span className="andro-fact-label">Stars</span>
            <span className="andro-fact-value">{ANDROMEDA_DATA.stars}</span>
          </div>
          <div className="andro-fact-row">
            <span className="andro-fact-label">Central black hole</span>
            <span className="andro-fact-value">{ANDROMEDA_DATA.blackHoleMassSolar} solar masses</span>
          </div>
          <div className="andro-fact-row">
            <span className="andro-fact-label">Type</span>
            <span className="andro-fact-value">{ANDROMEDA_DATA.type}</span>
          </div>
          <div className="andro-fact-row">
            <span className="andro-fact-label">Motion</span>
            <span className="andro-fact-value">{ANDROMEDA_DATA.closingSpeed}</span>
          </div>
        </div>

        <SizeComparison />
        <CollisionTimeline progress={progress} playing={playing} onPlay={handlePlay} />

        <a href={ANDROMEDA_LEARN_MORE_URL} target="_blank" rel="noopener noreferrer" className="andro-more">
          Explore in detail on NASA Science &rarr;
        </a>

        <div className="andro-sources">
          <span className="andro-image-credit">Image: {ANDROMEDA_DATA.imageCredit}</span>
          {ANDROMEDA_SOURCES.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

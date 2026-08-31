import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import {
  ANDROMEDA_DATA,
  ANDROMEDA_LEARN_MORE_URL,
  ANDROMEDA_SOURCES,
  COLLISION_TIMELINE,
  MILKY_WAY_DIAMETER_LIGHT_YEARS,
} from "../data/andromeda.js";
import PanelCollapseToggle from "./PanelCollapseToggle.jsx";

// ---------- Procedural spiral-galaxy point cloud ----------
// The previous version mapped a real photograph onto a flat plane —
// accurate in outline (Andromeda is genuinely viewed nearly edge-on),
// but it read as a flat image, not something floating in 3D space, and
// didn't reveal any structure as the camera orbited around it. This
// generates an actual point cloud instead: a bulge + N spiral arms +
// a diffuse outer halo, so depth and structure are real geometry, not
// a picture. It's a stylized approximation of spiral-galaxy structure
// in general (log-spiral arms, bluer/younger stars outward, redder/
// older bulge — both real, textbook trends), not a scientifically
// accurate reconstruction of M31's actual spiral pattern specifically
// (M31 is in fact unusual — better known for a star-forming ring than
// grand-design arms). That gap is exactly why a real Hubble photo is
// shown in the info panel rather than only relying on this scene.

function randomSigned(power) {
  const v = Math.pow(Math.random(), power);
  return Math.random() < 0.5 ? -v : v;
}

// A bulge + spiral-arm disc. Reused for both Andromeda and (at smaller
// scale, different palette) the Milky Way during the collision replay.
function buildSpiralArms({ count, arms, maxRadius, bulgeRadius, spin, armWidth, coreColor, armColor }) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const core = new THREE.Color(coreColor);
  const outer = new THREE.Color(armColor);

  for (let i = 0; i < count; i++) {
    const radius = Math.pow(Math.random(), 1.5) * maxRadius;
    const branchAngle = ((i % arms) / arms) * Math.PI * 2;
    const spinAngle = radius * spin;
    const spread = armWidth * (0.25 + radius / maxRadius);
    const angle = branchAngle + spinAngle + randomSigned(2.4) * spread;

    const bulgeFactor = Math.max(0, 1 - radius / bulgeRadius);
    const thickness = (0.05 + bulgeFactor * 0.6) * maxRadius * 0.11;

    const idx = i * 3;
    positions[idx] = Math.cos(angle) * radius;
    positions[idx + 1] = randomSigned(2) * thickness;
    positions[idx + 2] = Math.sin(angle) * radius;

    const t = Math.min(1, radius / maxRadius);
    const mixed = core.clone().lerp(outer, t);
    const variance = 0.85 + Math.random() * 0.3;
    colors[idx] = mixed.r * variance;
    colors[idx + 1] = mixed.g * variance;
    colors[idx + 2] = mixed.b * variance;
  }

  return { positions, colors };
}

// Sparse, roughly-spherical (slightly flattened) scatter standing in
// for a galaxy's diffuse outer stellar halo — a real structural
// feature of spiral galaxies, just not one with any per-point data to
// be accurate about, so kept deliberately sparse and dim rather than
// drawn as if it were measured.
function buildHalo({ count, radius, color }) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const c = new THREE.Color(color);
  for (let i = 0; i < count; i++) {
    const r = Math.cbrt(Math.random()) * radius;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const idx = i * 3;
    positions[idx] = r * Math.sin(phi) * Math.cos(theta);
    positions[idx + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.45;
    positions[idx + 2] = r * Math.cos(phi);
    const variance = 0.6 + Math.random() * 0.4;
    colors[idx] = c.r * variance;
    colors[idx + 1] = c.g * variance;
    colors[idx + 2] = c.b * variance;
  }
  return { positions, colors };
}

// Dust lanes as a sparse, dark, alpha-blended (NOT additive — additive
// blending can't darken anything) point layer following the arms,
// rather than the flat semi-transparent planes floated in the original
// request: a flat plane is exactly the "looks like a flat image"
// problem this rebuild is meant to fix.
function buildDust({ count, maxRadius, spin, armWidth }) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const dustColor = new THREE.Color("#3a2a22");
  for (let i = 0; i < count; i++) {
    const radius = (0.3 + Math.pow(Math.random(), 1.3) * 0.7) * maxRadius;
    const branchAngle = ((i % 2) / 2) * Math.PI * 2;
    const spinAngle = radius * spin;
    const spread = armWidth * 0.6 * (0.3 + radius / maxRadius);
    const angle = branchAngle + spinAngle + randomSigned(2) * spread;
    const idx = i * 3;
    positions[idx] = Math.cos(angle) * radius;
    positions[idx + 1] = randomSigned(2) * maxRadius * 0.02;
    positions[idx + 2] = Math.sin(angle) * radius;
    const variance = 0.7 + Math.random() * 0.5;
    colors[idx] = dustColor.r * variance;
    colors[idx + 1] = dustColor.g * variance;
    colors[idx + 2] = dustColor.b * variance;
  }
  return { positions, colors };
}

function PointCloud({ positions, colors, size, opacity, additive = true, sizeAttenuation = true }) {
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
        <bufferAttribute attach="attributes-color" array={colors} count={colors.length / 3} itemSize={3} />
      </bufferGeometry>
      <PointMaterial
        size={size}
        vertexColors
        sizeAttenuation={sizeAttenuation}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

function GalaxyGroup({ maxRadius, bulgeRadius, coreColor, armColor, haloColor, dust, coreGlowColor, children }) {
  const arms = useMemo(
    () =>
      buildSpiralArms({
        count: 22000,
        arms: 2,
        maxRadius,
        bulgeRadius,
        spin: 1.15,
        armWidth: 0.42,
        coreColor,
        armColor,
      }),
    [maxRadius, bulgeRadius, coreColor, armColor]
  );
  const halo = useMemo(
    () => buildHalo({ count: 3500, radius: maxRadius * 1.55, color: haloColor }),
    [maxRadius, haloColor]
  );
  const dustCloud = useMemo(
    () => (dust ? buildDust({ count: 4200, maxRadius, spin: 1.15, armWidth: 0.42 }) : null),
    [dust, maxRadius]
  );

  return (
    <>
      <PointCloud positions={arms.positions} colors={arms.colors} size={maxRadius * 0.017} opacity={0.92} />
      <PointCloud positions={halo.positions} colors={halo.colors} size={maxRadius * 0.014} opacity={0.3} />
      {dustCloud ? (
        <PointCloud positions={dustCloud.positions} colors={dustCloud.colors} size={maxRadius * 0.024} opacity={0.5} additive={false} />
      ) : null}
      {/* Bright core + a soft additive glow sphere standing in for a
          bloom pass (no postprocessing pipeline wired up in this
          scene) — same trick used for the ring glow in RingSystem.jsx. */}
      <mesh>
        <sphereGeometry args={[bulgeRadius * 0.22, 20, 20]} />
        <meshBasicMaterial color={coreGlowColor} />
      </mesh>
      <mesh>
        <sphereGeometry args={[bulgeRadius * 0.75, 20, 20]} />
        <meshBasicMaterial color={coreGlowColor} transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {children}
    </>
  );
}

// Andromeda's real ~13° inclination-from-edge-on means we see its disc
// almost side-on — this tilt approximates that (still a stylistic
// choice, same as the previous flat-plane version's tilt, just now
// applied to a volume instead of a plane so it actually reads as one
// when the camera orbits).
const ANDROMEDA_TILT = [1.08, 0, 0.32];

function AndromedaScene({ collisionProgress }) {
  const andromedaRef = useRef();
  const milkyWayRef = useRef();

  useFrame((_, delta) => {
    if (andromedaRef.current) andromedaRef.current.rotation.z += delta * 0.02;
    if (milkyWayRef.current) milkyWayRef.current.rotation.z -= delta * 0.035;
  });

  // Illustrative only (see data/andromeda.js) — approaches from off-scene
  // and grows as collisionProgress goes 0 -> 1, ending overlapped with
  // Andromeda to suggest a merger rather than simulating one. The Milky
  // Way cloud's radius is scaled to Andromeda's by the two galaxies'
  // real diameter ratio (100,000 : 220,000 ly), so even this
  // illustrative animation stays proportionate.
  const mwZ = 7 - collisionProgress * 7.9;
  const mwOpacity = Math.min(1, collisionProgress * 2.2);
  const mwScale = 0.7 + collisionProgress * 0.5;

  return (
    <>
      <group ref={andromedaRef} rotation={ANDROMEDA_TILT}>
        <GalaxyGroup
          maxRadius={3.2}
          bulgeRadius={0.9}
          coreColor="#fff3d6"
          armColor="#bcd4ff"
          haloColor="#9db9f2"
          coreGlowColor="#ffe9b3"
          dust
        />
      </group>

      {collisionProgress > 0 ? (
        <group ref={milkyWayRef} position={[1.4, 0.3, mwZ]} rotation={[1.08, 0, -0.5]} scale={mwScale}>
          <group>
            <GalaxyGroup
              maxRadius={3.2 * (MILKY_WAY_DIAMETER_LIGHT_YEARS / ANDROMEDA_DATA.diameterLightYears)}
              bulgeRadius={0.7}
              coreColor="#fff0e0"
              armColor="#ffd281"
              haloColor="#e8c98f"
              coreGlowColor="#ffd281"
              dust={false}
            />
          </group>
          {/* Fades the whole illustrative companion in as it "arrives" —
              a single translucent backing plane is simpler and cheaper
              than animating opacity across three separate point-cloud
              materials, and it's additive so it only ever brightens,
              never occludes, the points in front of it. */}
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[10, 10]} />
            <meshBasicMaterial
              color="#05070d"
              transparent
              opacity={Math.max(0, 1 - mwOpacity)}
              depthWrite={false}
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
      <ambientLight intensity={0.35} />
      <pointLight position={[8, 6, 10]} intensity={30} color="#ffd281" />
      <pointLight position={[-8, -4, 6]} intensity={20} color="#7fd9ff" />
      <Stars radius={80} depth={40} count={3600} factor={2.4} saturation={0} fade speed={0.3} />
      <AndromedaScene collisionProgress={collisionProgress} />
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
// rescaling against it the way PanchangaWheel's FitScale does would
// have fought the user's own zoom instead of just fixing initial
// framing). A fixed-vertical-FOV camera doesn't lose vertical extent on
// a narrow/tall screen, only horizontal — so on portrait mobile the
// galaxy's sides would clip off unless the camera starts further back.
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
  const [panelCollapsed, setPanelCollapsed] = useState(false);

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

      <div className={`andro-panel${panelCollapsed ? " panel-collapsed" : ""}`}>
        <PanelCollapseToggle collapsed={panelCollapsed} onToggle={() => setPanelCollapsed((c) => !c)} />
        <h3 className="andro-panel-name">{ANDROMEDA_DATA.name}</h3>
        <p className="andro-panel-sub">{ANDROMEDA_DATA.designation} &mdash; our nearest large galactic neighbor</p>

        <div className="andro-reference">
          <img
            src={ANDROMEDA_DATA.panelImageUrl}
            alt="Hubble Space Telescope mosaic of the Andromeda Galaxy"
            className="andro-reference-image"
            loading="lazy"
          />
          <p className="andro-reference-caption">
            The real thing &mdash; the 3D view is a stylized procedural approximation, not a reconstruction of this.
          </p>
        </div>

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
            <span className="andro-fact-value">{ANDROMEDA_DATA.stars} (Milky Way: {ANDROMEDA_DATA.milkyWayStars})</span>
          </div>
          <div className="andro-fact-row">
            <span className="andro-fact-label">Total mass</span>
            <span className="andro-fact-value">{ANDROMEDA_DATA.massSolarLabel}</span>
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
          <div className="andro-fact-row">
            <span className="andro-fact-label">First recorded</span>
            <span className="andro-fact-value">{ANDROMEDA_DATA.discoveryLabel}</span>
          </div>
        </div>
        <p className="andro-fact-note">{ANDROMEDA_DATA.massDisputeNote}</p>
        <p className="andro-fact-note">{ANDROMEDA_DATA.discoveryNote}</p>
        <p className="andro-fact-note">{ANDROMEDA_DATA.nakedEyeNote}</p>

        <SizeComparison />
        <CollisionTimeline progress={progress} playing={playing} onPlay={handlePlay} />

        <a href={ANDROMEDA_LEARN_MORE_URL} target="_blank" rel="noopener noreferrer" className="andro-more">
          Explore in detail on NASA Science &rarr;
        </a>

        <div className="andro-sources">
          <span className="andro-image-credit">Image: {ANDROMEDA_DATA.panelImageCredit}</span>
          {ANDROMEDA_SOURCES.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

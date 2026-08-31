import React, { useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Line } from "@react-three/drei";
import * as THREE from "three";
import {
  MASS_OBJECTS,
  PRESETS,
  PHENOMENA,
  EXPLAINABLE_SECTIONS,
  KEY_FACTS,
  SPACETIME_SOURCES,
  KM_PER_SCENE_UNIT,
} from "../data/spacetime.js";
import PanelCollapseToggle from "./PanelCollapseToggle.jsx";

// ---------- The "rubber sheet" grid ----------
// A deliberately stylized analogy (the same one every popular GR
// explainer uses — PBS Space Time, NASA outreach material, etc.), not
// a literal embedding diagram of real spacetime geometry, which is 4D
// and can't be drawn this way without distortion. Said explicitly in
// the UI rather than left implied.
//
// Curvature contribution from each object is genuinely proportional to
// its real mass (data/spacetime.js's massEarth values, not a fudged
// display-only number) divided by squared distance — the same
// mass/distance² shape as a real gravitational potential well — with
// only a depth *clamp* for visual sanity (a real Sun-mass well digs
// far deeper than a screen can usefully show) and one shared scale
// constant so an Earth-alone view still shows a visible dimple.
const GRID_SIZE = 34;
const GRID_SEGMENTS = 90;
const CURVE_SCALE = 3.4e-6;
const MAX_DEPTH = 6.5;
const MAX_OBJECTS = 5;

// Educational mode: stylized mass/distance² well (as before). Real
// Physics mode: Flamm's paraboloid, z(r) = 2*sqrt(r_s*(r - r_s)) for
// r > r_s — the actual, standard textbook embedding diagram for the
// Schwarzschild geometry's equatorial slice, not a relabeled version of
// the stylized formula. r_s (uRadii) comes from each object's real
// Schwarzschild radius (data/spacetime.js), converted to scene units by
// the same disclosed KM_PER_SCENE_UNIT used throughout this component.
// Summing per-object paraboloids for a multi-object scene is a standard
// simplification (there's no closed-form exact multi-body solution in
// GR either way) — not claimed as more than that.
const vertexShader = `
  uniform vec2 uPositions[${MAX_OBJECTS}];
  uniform float uMasses[${MAX_OBJECTS}];
  uniform float uRadii[${MAX_OBJECTS}];
  uniform int uCount;
  uniform bool uRealMode;
  varying float vDepth;

  void main() {
    vec3 pos = position;
    float total = 0.0;
    for (int i = 0; i < ${MAX_OBJECTS}; i++) {
      if (i >= uCount) continue;
      vec2 d = pos.xy - uPositions[i];
      float dist = length(d);
      if (uRealMode) {
        float rs = uRadii[i];
        float r = max(dist, rs * 1.01);
        total += 2.0 * sqrt(rs * (r - rs));
      } else {
        float dist2 = dist * dist + 1.0;
        total += uMasses[i] / dist2;
      }
    }
    float depth = min(total, ${MAX_DEPTH.toFixed(1)});
    pos.z -= depth;
    vDepth = depth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const fragmentShader = `
  varying float vDepth;
  void main() {
    vec3 flat_ = vec3(0.5, 0.85, 1.0);
    vec3 curved = vec3(1.0, 0.82, 0.5);
    float t = clamp(vDepth / ${MAX_DEPTH.toFixed(1)}, 0.0, 1.0);
    vec3 color = mix(flat_, curved, t);
    gl_FragColor = vec4(color, 0.85);
  }
`;

function SpacetimeGrid({ activeObjects, realMode }) {
  const materialRef = useRef();
  const geometry = useMemo(() => new THREE.PlaneGeometry(GRID_SIZE, GRID_SIZE, GRID_SEGMENTS, GRID_SEGMENTS), []);
  const uniforms = useMemo(
    () => ({
      uPositions: { value: Array.from({ length: MAX_OBJECTS }, () => new THREE.Vector2()) },
      uMasses: { value: new Array(MAX_OBJECTS).fill(0) },
      uRadii: { value: new Array(MAX_OBJECTS).fill(0) },
      uCount: { value: 0 },
      uRealMode: { value: false },
    }),
    []
  );

  useFrame(() => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    activeObjects.forEach((obj, i) => {
      if (i >= MAX_OBJECTS) return;
      u.uPositions.value[i].set(obj.x, obj.z);
      u.uMasses.value[i] = obj.massEarth * CURVE_SCALE;
      u.uRadii.value[i] = obj.schwarzschildRadiusKm / KM_PER_SCENE_UNIT;
    });
    u.uCount.value = Math.min(activeObjects.length, MAX_OBJECTS);
    u.uRealMode.value = realMode;
  });

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        wireframe
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// ---------- Mass objects sitting in the grid ----------
function MassObjectMesh({ obj, onSelect, selected }) {
  return (
    <group position={[obj.x, 0.05, obj.z]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect(obj.instanceId);
        }}
      >
        <sphereGeometry args={[obj.size, 28, 28]} />
        <meshStandardMaterial
          color={obj.color}
          emissive={obj.color}
          emissiveIntensity={selected ? 0.9 : 0.55}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      <mesh scale={1.35}>
        <sphereGeometry args={[obj.size, 16, 16]} />
        <meshBasicMaterial color={obj.color} transparent opacity={0.18} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

// ---------- Light ray bending toward nearby mass ----------
// A genuinely mass-responsive bend (unlike a static straight line) —
// each sample point along the ray is nudged toward every active
// object, proportional to mass and inverse distance, the same shape as
// (though not a literal numeric solution of) real light deflection.
// Clearly labeled illustrative in the UI, not a geodesic integration.
function bentRayPoints(startX, z, endX, activeObjects) {
  const steps = 60;
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = startX + (endX - startX) * t;
    let bend = 0;
    activeObjects.forEach((obj) => {
      const dx = x - obj.x;
      const dz = z - obj.z;
      const dist = Math.max(Math.hypot(dx, dz), 0.6);
      const pull = (obj.massEarth * CURVE_SCALE) / (dist * dist);
      const towardSign = dz >= 0 ? -1 : 1;
      bend += pull * towardSign * 0.9;
    });
    points.push(new THREE.Vector3(x, 0.35, z + Math.min(Math.abs(bend), 5) * Math.sign(bend || 1)));
  }
  return points;
}

function LightRays({ activeObjects }) {
  const rayA = useMemo(() => bentRayPoints(-16, -6, 16, activeObjects), [activeObjects]);
  const rayB = useMemo(() => bentRayPoints(-16, 6, 16, activeObjects), [activeObjects]);
  return (
    <>
      <Line points={rayA} color="#fff6c8" lineWidth={1.5} transparent opacity={0.75} />
      <Line points={rayB} color="#fff6c8" lineWidth={1.5} transparent opacity={0.75} />
    </>
  );
}

function Scene({ activeObjects, showLightRays, selectedId, onSelect, realMode }) {
  return (
    <>
      <ambientLight intensity={0.45} />
      <pointLight position={[14, 16, 10]} intensity={40} color="#fff6c8" />
      <pointLight position={[-14, -8, -10]} intensity={22} color="#7fd9ff" />
      <Stars radius={80} depth={40} count={2600} factor={2.2} saturation={0} fade speed={0.25} />
      <SpacetimeGrid activeObjects={activeObjects} realMode={realMode} />
      {activeObjects.map((obj) => (
        <MassObjectMesh key={obj.instanceId} obj={obj} onSelect={onSelect} selected={selectedId === obj.instanceId} />
      ))}
      {showLightRays ? <LightRays activeObjects={activeObjects} /> : null}
      <OrbitControls enablePan={false} minDistance={6} maxDistance={40} target={[0, -1, 0]} />
    </>
  );
}

function initialCameraDistance() {
  if (typeof window === "undefined") return 22;
  const aspect = window.innerWidth / window.innerHeight;
  if (aspect >= 1) return 22;
  return Math.min(34, 22 / Math.max(aspect, 0.45));
}

let instanceCounter = 0;
function buildInstance(id) {
  const base = MASS_OBJECTS.find((o) => o.id === id);
  instanceCounter += 1;
  return { ...base, instanceId: `${id}-${instanceCounter}`, x: 0, z: 0 };
}

function applyPreset(preset) {
  return preset.objects.map((placement) => {
    const inst = buildInstance(placement.id);
    return { ...inst, x: placement.x, z: placement.z };
  });
}

export default function SpacetimeExplorer({ onClose }) {
  const [activeObjects, setActiveObjects] = useState(() => applyPreset(PRESETS[0]));
  const [showLightRays, setShowLightRays] = useState(false);
  const [realMode, setRealMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [openPhenomenon, setOpenPhenomenon] = useState(null);
  const [openLearn, setOpenLearn] = useState(null);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [cameraZ] = useState(initialCameraDistance);

  const loadPreset = (preset) => {
    setActiveObjects(applyPreset(preset));
    setSelectedId(null);
  };

  const addObject = (id) => {
    if (activeObjects.length >= MAX_OBJECTS) return;
    const inst = buildInstance(id);
    const angle = (activeObjects.length / MAX_OBJECTS) * Math.PI * 2;
    setActiveObjects((prev) => [...prev, { ...inst, x: Math.cos(angle) * 6, z: Math.sin(angle) * 6 }]);
  };

  const clearAll = () => {
    setActiveObjects([]);
    setSelectedId(null);
  };

  const selected = activeObjects.find((o) => o.instanceId === selectedId) || null;

  return (
    <div className="stf-stage">
      <Canvas camera={{ position: [0, 12, cameraZ], fov: 50 }} dpr={[1, 1.75]}>
        <Scene
          activeObjects={activeObjects}
          showLightRays={showLightRays}
          selectedId={selectedId}
          onSelect={setSelectedId}
          realMode={realMode}
        />
      </Canvas>

      <div className="stf-topbar">
        <div className="stf-title">
          <span className="stf-eyebrow">Spacetime Fabric &middot; General Relativity</span>
          <span className="stf-hint">Drag to rotate &middot; scroll to zoom &middot; tap an object</span>
        </div>
        <div className="stf-mode-badge-wrap">
          <span className={`stf-mode-badge${realMode ? " stf-mode-real" : ""}`}>
            {realMode ? "Real Physics" : "Educational"}
          </span>
          <button type="button" className="return-button" onClick={onClose}>Return</button>
        </div>
      </div>

      <div className={`stf-panel${panelCollapsed ? " panel-collapsed" : ""}`}>
        <PanelCollapseToggle collapsed={panelCollapsed} onToggle={() => setPanelCollapsed((c) => !c)} />

        {selected ? (
          <div className="stf-detail">
            <button type="button" className="sapt-detail-close" onClick={() => setSelectedId(null)} aria-label="Close">&times;</button>
            <div className="sapt-detail-kicker">Massive object</div>
            <h3 className="sapt-detail-name">{selected.name}</h3>
            <p className="sapt-detail-theme">{selected.massLabel}</p>
            <div className="sapt-detail-row">
              <span>Real Schwarzschild radius</span>
              <span>
                {selected.schwarzschildRadiusKm < 1
                  ? `${(selected.schwarzschildRadiusKm * 1000).toFixed(selected.schwarzschildRadiusKm < 0.001 ? 2 : 1)} m`
                  : `${selected.schwarzschildRadiusKm.toFixed(2)} km`}
              </span>
            </div>
            <p className="sapt-detail-fact">{selected.description}</p>
          </div>
        ) : (
          <>
            <div className="stf-panel-section">
              <h3>Physics mode</h3>
              <label className="panch-toggle">
                <input type="checkbox" checked={realMode} onChange={() => setRealMode((m) => !m)} />
                <span>Real Physics mode (actual Schwarzschild radii)</span>
              </label>
              <p className="sapt-now-note">
                {realMode
                  ? `Using each object's real mass-derived Schwarzschild radius (1 scene unit ≈ ${KM_PER_SCENE_UNIT} km). Earth and Jupiter will look essentially flat — that's the real, honest scale of their curvature next to the Sun or a black hole, not a rendering error.`
                  : "Showing exaggerated curvature so every object is visible — good for the principle, not to real scale. Toggle on for the real numbers."}
              </p>
            </div>

            <div className="stf-panel-section">
              <h3>Presets</h3>
              <div className="stf-preset-row">
                {PRESETS.map((preset) => (
                  <button key={preset.name} type="button" className="stf-chip" onClick={() => loadPreset(preset)}>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="stf-panel-section">
              <h3>Add an object ({activeObjects.length}/{MAX_OBJECTS})</h3>
              <div className="stf-preset-row">
                {MASS_OBJECTS.map((obj) => (
                  <button
                    key={obj.id}
                    type="button"
                    className="stf-chip"
                    style={{ borderColor: obj.color }}
                    onClick={() => addObject(obj.id)}
                    disabled={activeObjects.length >= MAX_OBJECTS}
                    title={obj.massLabel}
                  >
                    {obj.name}
                  </button>
                ))}
              </div>
              <button type="button" className="stf-clear" onClick={clearAll}>Clear all</button>
            </div>

            <div className="stf-panel-section">
              <label className="panch-toggle">
                <input type="checkbox" checked={showLightRays} onChange={() => setShowLightRays((s) => !s)} />
                <span>Show light bending near mass (illustrative)</span>
              </label>
              <p className="sapt-now-note">
                Sizes and grid depth are stylized for visibility, not to real physical scale — a real neutron star or
                black hole is thousands of times smaller than Earth, not bigger. See the object details for real numbers.
              </p>
            </div>

            <div className="stf-panel-section">
              <h3>Phenomena to explore</h3>
              {PHENOMENA.map((phen) => (
                <div key={phen.id} className="stf-phenomenon">
                  <button
                    type="button"
                    className="stf-phenomenon-head"
                    onClick={() => setOpenPhenomenon((p) => (p === phen.id ? null : phen.id))}
                    aria-expanded={openPhenomenon === phen.id}
                  >
                    {phen.title}
                  </button>
                  {openPhenomenon === phen.id ? (
                    <div className="stf-phenomenon-body">
                      <p className="sapt-now-note">{phen.description}</p>
                      <p className="stf-formula">{phen.formula}</p>
                      <p className="sapt-now-note">{phen.example}</p>
                      {phen.realWorld ? <p className="sapt-now-note stf-real-world">{phen.realWorld}</p> : null}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="stf-panel-section">
              <h3>Learn — beginner to expert</h3>
              {EXPLAINABLE_SECTIONS.map((section) => (
                <div key={section.id} className="stf-phenomenon">
                  <button
                    type="button"
                    className="stf-phenomenon-head stf-learn-head"
                    onClick={() => setOpenLearn((s) => (s === section.id ? null : section.id))}
                    aria-expanded={openLearn === section.id}
                  >
                    <span>{section.title}</span>
                    <span className={`stf-level-badge stf-level-${section.level.toLowerCase()}`}>{section.level}</span>
                  </button>
                  {openLearn === section.id ? (
                    <div className="stf-phenomenon-body">
                      {section.paragraphs.map((p, i) => (
                        <p key={i} className="sapt-now-note">{p}</p>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="stf-panel-section">
              <h3>Key facts</h3>
              <ul className="stf-facts">
                {KEY_FACTS.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="sapt-sources">
          {SPACETIME_SOURCES.map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

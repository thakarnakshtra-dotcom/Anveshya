import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Link } from "react-router-dom";
import { nakshatras, NAKSHATRA_SEGMENT_DEGREES, NAKSHATRA_SOURCES } from "../data/nakshatras.js";
import { TITHIS, TITHI_SEGMENT_DEGREES, RASHIS, RASHI_SEGMENT_DEGREES, PANCHANGA_SOURCES } from "../data/panchanga.js";
import { getPanchangaNow } from "../utils/panchangaCalc.js";

// ---------- Radii (world units) — concentric, innermost to outermost ----------
const MOON_ORBIT_RADIUS = 1.55;
const TITHI_INNER = 2.0;
const TITHI_OUTER = 2.75;
const NAK_INNER = 2.95;
const NAK_OUTER = 4.35;
const NAK_ICON_RADIUS = (NAK_INNER + NAK_OUTER) / 2;
const ZODIAC_INNER = 4.55;
const ZODIAC_OUTER = 5.15;
const WHEEL_FIT_DIAMETER = ZODIAC_OUTER * 2 + 1.8;

const NAK_ICON_SHAPES = ["star", "diamond", "triangle", "square", "circle"];
const NAK_COLORS = ["#ffd281", "#7fd9ff", "#9db9f2", "#ff9d7a", "#b8f2c9"];

const MOON_SPEEDS = {
  slow: (Math.PI * 2) / 90,
  normal: (Math.PI * 2) / 45,
  fast: (Math.PI * 2) / 15,
};

function degToRad(d) {
  return (d * Math.PI) / 180;
}

function ringPoints(radius, segments = 96) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(Math.cos(a) * radius, Math.sin(a) * radius, 0);
  }
  return new Float32Array(pts);
}

// ---------- A single ring wedge, reused for tithi / nakshatra / zodiac ----------
function Wedge({ innerR, outerR, thetaStart, thetaLength, color, active, current, onClick, onHover, onHoverEnd }) {
  const geometry = useMemo(
    () => new THREE.RingGeometry(innerR, outerR, 1, 1, thetaStart, thetaLength),
    [innerR, outerR, thetaStart, thetaLength]
  );
  const opacity = current ? 0.85 : active ? 0.55 : 0.2;
  const emissiveIntensity = current ? 0.85 : active ? 0.5 : 0.1;
  return (
    <mesh
      geometry={geometry}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.();
      }}
      onPointerOut={() => onHoverEnd?.()}
    >
      <meshStandardMaterial
        color={color}
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        emissive={color}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

function WedgeLabel({ radius, midAngle, active, current, text, sub }) {
  return (
    <Html
      as="div"
      center
      occlude={false}
      // drei's Html defaults to a huge z-index range (meant for
      // depth-sorting Html against other Html), which otherwise paints
      // every wedge label above the docked side panel (z-index 10)
      // regardless of DOM order. Pinning it low keeps labels under the
      // panel and topbar, where they belong.
      zIndexRange={[1, 0]}
      position={[Math.cos(midAngle) * radius, Math.sin(midAngle) * radius, 0.02]}
      style={{ pointerEvents: "none" }}
    >
      <div className={`panch-label${active ? " panch-label-active" : ""}${current ? " panch-label-current" : ""}`}>
        {text}
        {sub ? <span className="panch-label-sub">{sub}</span> : null}
      </div>
    </Html>
  );
}

// ---------- Ring 1: Tithis (30, innermost) ----------
function TithiRing({ show, showCalc, selected, currentIndex, onSelect, onHover, onHoverEnd, hoveredId }) {
  if (!show) return null;
  return (
    <group>
      {TITHIS.map((t, i) => {
        const thetaStart = degToRad(i * TITHI_SEGMENT_DEGREES);
        const thetaLength = degToRad(TITHI_SEGMENT_DEGREES) - 0.01;
        const midAngle = thetaStart + thetaLength / 2;
        // Bright gold rising through Shukla (waxing), cooling toward
        // Krishna (waning) — a visual metaphor for the real waxing/
        // waning split, not a claimed fact about the tithi itself.
        const posInPaksha = t.tithiNumber - 1;
        const brightness = 0.35 + (posInPaksha / 14) * 0.65;
        const color = t.paksha === "Shukla"
          ? new THREE.Color("#7a5a00").lerp(new THREE.Color("#ffd281"), brightness).getStyle()
          : new THREE.Color("#1c2c3a").lerp(new THREE.Color("#7fd9ff"), brightness).getStyle();
        const active = selected?.type === "tithi" && selected.id === t.id;
        const hovered = hoveredId === `tithi-${t.id}`;
        const current = i === currentIndex;
        return (
          <group key={t.id}>
            <Wedge
              innerR={TITHI_INNER}
              outerR={TITHI_OUTER}
              thetaStart={thetaStart}
              thetaLength={thetaLength}
              color={color}
              active={active || hovered}
              current={current}
              onClick={() => onSelect({ type: "tithi", id: t.id })}
              onHover={() => onHover(`tithi-${t.id}`, t)}
              onHoverEnd={onHoverEnd}
            />
            <WedgeLabel
              radius={(TITHI_INNER + TITHI_OUTER) / 2}
              midAngle={midAngle}
              active={active || hovered}
              current={current}
              text={t.tithiNumber}
              sub={showCalc ? `${t.degreeStart}°` : null}
            />
          </group>
        );
      })}
    </group>
  );
}

// ---------- Ring 2: Nakshatras (27, middle) ----------
// Fixed-size geometry per shape; the enclosing <mesh> below controls
// scale (a geometry element has no `scale` prop of its own — that's a
// property of the mesh that holds it).
function NakshatraIcon({ shape }) {
  switch (shape) {
    case "star":
      return <icosahedronGeometry args={[0.2, 1]} />;
    case "triangle":
      return <tetrahedronGeometry args={[0.2]} />;
    case "square":
      return <boxGeometry args={[0.2, 0.2, 0.08]} />;
    case "circle":
      return <sphereGeometry args={[0.16, 12, 12]} />;
    case "diamond":
    default:
      return <octahedronGeometry args={[0.2]} />;
  }
}

function NakshatraRing({ show, showCalc, selected, currentIndex, onSelect, onHover, onHoverEnd, hoveredId }) {
  if (!show) return null;
  return (
    <group>
      {nakshatras.map((n, i) => {
        const thetaStart = degToRad(i * NAKSHATRA_SEGMENT_DEGREES);
        const thetaLength = degToRad(NAKSHATRA_SEGMENT_DEGREES) - 0.012;
        const midAngle = thetaStart + thetaLength / 2;
        const color = NAK_COLORS[i % NAK_COLORS.length];
        const shape = NAK_ICON_SHAPES[i % NAK_ICON_SHAPES.length];
        const active = selected?.type === "nakshatra" && selected.id === n.id;
        const hovered = hoveredId === `nak-${n.id}`;
        const current = i === currentIndex;
        const iconPos = [Math.cos(midAngle) * NAK_ICON_RADIUS, Math.sin(midAngle) * NAK_ICON_RADIUS, 0.18];
        return (
          <group key={n.id}>
            <Wedge
              innerR={NAK_INNER}
              outerR={NAK_OUTER}
              thetaStart={thetaStart}
              thetaLength={thetaLength}
              color={color}
              active={active || hovered}
              current={current}
              onClick={() => onSelect({ type: "nakshatra", id: n.id })}
              onHover={() => onHover(`nak-${n.id}`, { name: n.name, degreeStart: i * NAKSHATRA_SEGMENT_DEGREES })}
              onHoverEnd={onHoverEnd}
            />
            <mesh position={iconPos} scale={active || hovered || current ? 1.35 : 1}>
              <NakshatraIcon shape={shape} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={active || current ? 0.7 : 0.35}
                metalness={0.5}
                roughness={0.35}
              />
            </mesh>
            <WedgeLabel
              radius={NAK_OUTER + 0.32}
              midAngle={midAngle}
              active={active || hovered}
              current={current}
              text={n.name}
              sub={showCalc ? `${(i * NAKSHATRA_SEGMENT_DEGREES).toFixed(1)}°–${((i + 1) * NAKSHATRA_SEGMENT_DEGREES).toFixed(1)}°` : null}
            />
          </group>
        );
      })}
    </group>
  );
}

// ---------- Ring 3: Zodiac / rashi (12, outer) ----------
function ZodiacRing({ show, showCalc, selected, onSelect, onHover, onHoverEnd, hoveredId }) {
  if (!show) return null;
  return (
    <group>
      {RASHIS.map((name, i) => {
        const thetaStart = degToRad(i * RASHI_SEGMENT_DEGREES);
        const thetaLength = degToRad(RASHI_SEGMENT_DEGREES) - 0.012;
        const midAngle = thetaStart + thetaLength / 2;
        const active = selected?.type === "rashi" && selected.id === i;
        const hovered = hoveredId === `rashi-${i}`;
        return (
          <group key={name}>
            <Wedge
              innerR={ZODIAC_INNER}
              outerR={ZODIAC_OUTER}
              thetaStart={thetaStart}
              thetaLength={thetaLength}
              color="#e7ecf5"
              active={active || hovered}
              current={false}
              onClick={() => onSelect({ type: "rashi", id: i })}
              onHover={() => onHover(`rashi-${i}`, { name, degreeStart: i * RASHI_SEGMENT_DEGREES })}
              onHoverEnd={onHoverEnd}
            />
            <WedgeLabel
              radius={(ZODIAC_INNER + ZODIAC_OUTER) / 2}
              midAngle={midAngle}
              active={active || hovered}
              current={false}
              text={name}
              sub={showCalc ? `${i * RASHI_SEGMENT_DEGREES}°–${(i + 1) * RASHI_SEGMENT_DEGREES}°` : null}
            />
          </group>
        );
      })}
    </group>
  );
}

// ---------- Center: Earth + orbiting Moon (illustrative-speed demo) ----------
function EarthMoon({ speedKey, moonSiderealAngle }) {
  const moonRef = useRef();
  const angleRef = useRef(moonSiderealAngle);
  useFrame((_, delta) => {
    angleRef.current += delta * MOON_SPEEDS[speedKey];
    if (moonRef.current) {
      moonRef.current.position.x = Math.cos(angleRef.current) * MOON_ORBIT_RADIUS;
      moonRef.current.position.y = Math.sin(angleRef.current) * MOON_ORBIT_RADIUS;
    }
  });

  const orbitPositions = useMemo(() => ringPoints(MOON_ORBIT_RADIUS), []);

  return (
    <>
      <mesh>
        <sphereGeometry args={[0.34, 32, 32]} />
        <meshStandardMaterial color="#4a90e2" emissive="#1a5490" emissiveIntensity={0.5} metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh ref={moonRef} position={[MOON_ORBIT_RADIUS, 0, 0]}>
        <sphereGeometry args={[0.16, 24, 24]} />
        <meshStandardMaterial color="#e8dcc8" emissive="#c9a961" emissiveIntensity={0.35} metalness={0.2} roughness={0.8} />
      </mesh>
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={orbitPositions} count={orbitPositions.length / 3} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial color="#7fd9ff" transparent opacity={0.3} />
      </line>
    </>
  );
}

// Same shrink-only viewport-fit technique as the previous nakshatra
// wheel (and RingSystem.jsx before that) — safe here because this scene
// has no OrbitControls zoom-driven rescaling to fight (see
// AndromedaGalaxy.jsx for the contrasting case where it would matter).
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

function WheelScene({ layers, showCalc, selected, onSelect, panchangaNow, speedKey, onHover, onHoverEnd, hoveredId }) {
  const moonAngle = useMemo(() => degToRad(panchangaNow.siderealLonDeg), [panchangaNow.siderealLonDeg]);
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[6, 6, 8]} intensity={55} color="#ffd281" />
      <pointLight position={[-6, -4, 6]} intensity={35} color="#7fd9ff" />
      <Stars radius={60} depth={30} count={2200} factor={2.2} saturation={0} fade speed={0.3} />
      <FitScale>
        <EarthMoon speedKey={speedKey} moonSiderealAngle={moonAngle} />
        <TithiRing
          show={layers.tithis}
          showCalc={showCalc}
          selected={selected}
          currentIndex={panchangaNow.tithi.id - 1}
          onSelect={onSelect}
          onHover={onHover}
          onHoverEnd={onHoverEnd}
          hoveredId={hoveredId}
        />
        <NakshatraRing
          show={layers.nakshatras}
          showCalc={showCalc}
          selected={selected}
          currentIndex={panchangaNow.nakshatraIndex}
          onSelect={onSelect}
          onHover={onHover}
          onHoverEnd={onHoverEnd}
          hoveredId={hoveredId}
        />
        <ZodiacRing
          show={layers.zodiac}
          showCalc={showCalc}
          selected={selected}
          onSelect={onSelect}
          onHover={onHover}
          onHoverEnd={onHoverEnd}
          hoveredId={hoveredId}
        />
      </FitScale>
      <OrbitControls enablePan={false} enableZoom minDistance={5} maxDistance={16} target={[0, 0, 0]} />
    </>
  );
}

// ---------- Moon phase widget (real illumination fraction, CSS only) ----------
function MoonPhaseDisc({ fraction, waxing }) {
  const pct = Math.round(fraction * 100);
  // A lit-fraction disc via conic-gradient — approximate crescent shape,
  // not an accurate terminator curve, but the percentage readout next to
  // it is the real, computed number.
  const litDeg = 360 * fraction;
  const gradient = waxing
    ? `conic-gradient(#f5f1e8 0deg ${litDeg}deg, rgba(245,241,232,0.12) ${litDeg}deg 360deg)`
    : `conic-gradient(rgba(245,241,232,0.12) 0deg ${360 - litDeg}deg, #f5f1e8 ${360 - litDeg}deg 360deg)`;
  return (
    <div className="panch-moon-phase">
      <div className="panch-moon-disc" style={{ background: gradient }} />
      <div className="panch-moon-phase-text">
        <strong>{pct}%</strong> illuminated &middot; {waxing ? "waxing" : "waning"}
      </div>
    </div>
  );
}

function findRashiForDegree(deg) {
  return Math.floor(deg / RASHI_SEGMENT_DEGREES);
}

function DetailPanel({ selected, onClear }) {
  if (!selected) return null;

  if (selected.type === "nakshatra") {
    const n = nakshatras.find((x) => x.id === selected.id);
    const i = n.id - 1;
    const degStart = i * NAKSHATRA_SEGMENT_DEGREES;
    const rashi = RASHIS[findRashiForDegree(degStart)];
    return (
      <div className="panch-detail">
        <button type="button" className="panch-detail-close" onClick={onClear} aria-label="Close">&times;</button>
        <div className="panch-detail-kicker">Nakshatra {n.id.toString().padStart(2, "0")} / 27</div>
        <h3 className="panch-detail-name">{n.name}</h3>
        <p className="panch-detail-theme">{n.theme}</p>
        <div className="panch-detail-row"><span>Degree span</span><span>{degStart.toFixed(2)}&deg;&ndash;{(degStart + NAKSHATRA_SEGMENT_DEGREES).toFixed(2)}&deg; sidereal</span></div>
        <div className="panch-detail-row"><span>Sidereal sign</span><span>{rashi}</span></div>
        <div className="panch-detail-row"><span>Ruling planet</span><span>{n.planet}</span></div>
        <div className="panch-detail-row"><span>Ruling deity</span><span>{n.deity}</span></div>
        <div className="panch-detail-row"><span>Symbol</span><span>{n.symbol}</span></div>
        <div className="panch-detail-row"><span>Star</span><span>{n.star || "No single dedicated star"}</span></div>
        <Link to="/learn?tab=ancient&topic=nakshatra" className="panch-detail-more" target="_blank" rel="noopener noreferrer">
          Explore in detail &rarr;
        </Link>
      </div>
    );
  }

  if (selected.type === "tithi") {
    const t = TITHIS.find((x) => x.id === selected.id);
    return (
      <div className="panch-detail">
        <button type="button" className="panch-detail-close" onClick={onClear} aria-label="Close">&times;</button>
        <div className="panch-detail-kicker">Tithi {t.tithiNumber} / 15 &middot; {t.paksha} Paksha</div>
        <h3 className="panch-detail-name">{t.name}</h3>
        <p className="panch-detail-theme">{t.nature} &mdash; {t.natureMeaning}</p>
        <div className="panch-detail-row"><span>Degree span</span><span>{t.degreeStart}&deg;&ndash;{t.degreeEnd}&deg; Sun&ndash;Moon elongation</span></div>
        <div className="panch-detail-row"><span>Phase</span><span>{t.paksha === "Shukla" ? "Waxing (new → full moon)" : "Waning (full → new moon)"}</span></div>
        <Link to="/learn?tab=ancient&topic=tithi" className="panch-detail-more" target="_blank" rel="noopener noreferrer">
          Explore in detail &rarr;
        </Link>
      </div>
    );
  }

  if (selected.type === "rashi") {
    const name = RASHIS[selected.id];
    const degStart = selected.id * RASHI_SEGMENT_DEGREES;
    const degEnd = degStart + RASHI_SEGMENT_DEGREES;
    const containedNak = nakshatras.filter((n) => {
      const s = (n.id - 1) * NAKSHATRA_SEGMENT_DEGREES;
      return s < degEnd && s + NAKSHATRA_SEGMENT_DEGREES > degStart;
    });
    return (
      <div className="panch-detail">
        <button type="button" className="panch-detail-close" onClick={onClear} aria-label="Close">&times;</button>
        <div className="panch-detail-kicker">Rashi (sidereal sign)</div>
        <h3 className="panch-detail-name">{name}</h3>
        <div className="panch-detail-row"><span>Degree span</span><span>{degStart}&deg;&ndash;{degEnd}&deg; sidereal</span></div>
        <div className="panch-detail-row"><span>Nakshatras spanning it</span><span>{containedNak.map((n) => n.name).join(", ")}</span></div>
        <p className="panch-detail-more-note">
          This is the sidereal (Vedic) zodiac, anchored to the fixed stars &mdash; it differs from the tropical
          (Western pop-astrology) zodiac by the ayanamsa, currently about 24&deg;.
        </p>
      </div>
    );
  }

  return null;
}

export default function PanchangaWheel({ onClose }) {
  const [selected, setSelected] = useState(null);
  const [showCalc, setShowCalc] = useState(false);
  const [layers, setLayers] = useState({ tithis: true, nakshatras: true, zodiac: true });
  const [speedKey, setSpeedKey] = useState("normal");
  const [panchangaNow, setPanchangaNow] = useState(() => getPanchangaNow());
  const [hoveredId, setHoveredId] = useState(null);
  const [hoveredData, setHoveredData] = useState(null);

  useEffect(() => {
    const id = setInterval(() => setPanchangaNow(getPanchangaNow()), 60000);
    return () => clearInterval(id);
  }, []);

  const handleHover = (id, data) => {
    setHoveredId(id);
    setHoveredData(data);
  };
  const handleHoverEnd = () => {
    setHoveredId(null);
    setHoveredData(null);
  };

  const toggleLayer = (key) => setLayers((prev) => ({ ...prev, [key]: !prev[key] }));

  const currentNakName = nakshatras[panchangaNow.nakshatraIndex]?.name;

  return (
    <div className="panch-stage">
      <Canvas camera={{ position: [0, 5.5, 9], fov: 45 }} dpr={[1, 1.75]}>
        <WheelScene
          layers={layers}
          showCalc={showCalc}
          selected={selected}
          onSelect={setSelected}
          panchangaNow={panchangaNow}
          speedKey={speedKey}
          onHover={handleHover}
          onHoverEnd={handleHoverEnd}
          hoveredId={hoveredId}
        />
      </Canvas>

      <div className="panch-topbar">
        <div className="panch-topbar-title">
          <span className="panch-eyebrow">Panchanga Wheel</span>
          <span className="panch-hint">
            {hoveredData
              ? `${hoveredData.name} · ${hoveredData.degreeStart != null ? hoveredData.degreeStart.toFixed(1) + "°" : ""}`
              : "Drag to rotate · scroll to zoom · tap a segment"}
          </span>
        </div>
        <button type="button" className="return-button" onClick={onClose}>Return</button>
      </div>

      <div className="panch-panel">
        {selected ? (
          <DetailPanel selected={selected} onClear={() => setSelected(null)} />
        ) : (
          <>
            <div className="panch-panel-section panch-now">
              <div className="panch-now-kicker">Right now</div>
              <div className="panch-now-row">
                <span className="panch-now-label">Tithi</span>
                <span className="panch-now-value">{panchangaNow.tithi.name} <em>({panchangaNow.tithi.paksha})</em></span>
              </div>
              <div className="panch-now-row">
                <span className="panch-now-label">Nakshatra</span>
                <span className="panch-now-value">{currentNakName}</span>
              </div>
              <MoonPhaseDisc fraction={panchangaNow.illumination} waxing={panchangaNow.waxing} />
              <p className="panch-now-note">
                Computed live from the Moon and Sun's real positions (astronomy-engine), not the calendar date.
                Ayanamsa (Lahiri): {panchangaNow.ayanamsaDeg.toFixed(2)}&deg;.
              </p>
            </div>

            <div className="panch-panel-section">
              <h3>Display</h3>
              <label className="panch-toggle">
                <input type="checkbox" checked={showCalc} onChange={() => setShowCalc((s) => !s)} />
                <span>Show degree calculations</span>
              </label>
              <label className="panch-toggle">
                <input type="checkbox" checked={layers.tithis} onChange={() => toggleLayer("tithis")} />
                <span>Tithis (30 lunar days)</span>
              </label>
              <label className="panch-toggle">
                <input type="checkbox" checked={layers.nakshatras} onChange={() => toggleLayer("nakshatras")} />
                <span>Nakshatras (27)</span>
              </label>
              <label className="panch-toggle">
                <input type="checkbox" checked={layers.zodiac} onChange={() => toggleLayer("zodiac")} />
                <span>Zodiac / rashi (12)</span>
              </label>
            </div>

            <div className="panch-panel-section">
              <h3>Moon demo-orbit speed</h3>
              <select className="panch-speed-select" value={speedKey} onChange={(e) => setSpeedKey(e.target.value)}>
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
              <p className="panch-now-note">
                Illustrative loop for visual effect only &mdash; the real 27.3-day cycle can't be watched in real time.
                The Moon's true current position is shown above and in the wheel's live highlight.
              </p>
            </div>
          </>
        )}

        <div className="panch-sources">
          {[...NAKSHATRA_SOURCES, ...PANCHANGA_SOURCES].map((s) => (
            <span key={s}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

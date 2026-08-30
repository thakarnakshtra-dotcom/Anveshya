import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture, Line, Html } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import * as THREE from "three";
import { planets, scaleModes, tabs } from "../data/planets.js";
import NakshatraWheel from "../components/NakshatraWheel.jsx";
import AndromedaGalaxy from "../components/AndromedaGalaxy.jsx";

const detailSections = ["Physical Data", "Atmosphere", "Exploration", "Discovery", "Moons"];

const dummyObject = new THREE.Object3D();

const tmpPosition = new THREE.Vector3();
const tmpTarget = new THREE.Vector3();
const START_CAMERA = new THREE.Vector3(0, 22, 46);
const START_TARGET = new THREE.Vector3(0, 0, 0);

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function yearLabel(years) {
  const days = years * 365.256;
  if (days < 1000) return `${days.toFixed(0)} Earth days`;
  return `${years.toFixed(years > 20 ? 1 : 2)} Earth years`;
}

function OrbitPath({ radius }) {
  const points = useMemo(() => {
    const curve = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2, false, 0);
    return curve.getPoints(160).map((p) => [p.x, 0, p.y]);
  }, [radius]);

  return <Line points={points} color="#6f7892" transparent opacity={0.35} lineWidth={1} />;
}

function AtmosphereGlow({ radius, color }) {
  return (
    <mesh scale={1.08}>
      <sphereGeometry args={[radius, 48, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.22}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function Moon({ moon, planetRadius, mode, selected, onSelect, registerPosition }) {
  const orbitRef = useRef();
  const meshRef = useRef();
  const rawRadius = planetRadius * moon.radiusFactor;
  const radius = mode === "true" ? Math.max(rawRadius, 0.12) : rawRadius;
  const distance = planetRadius * moon.orbitFactor + radius;
  const moonYears = moon.periodDays / 365.25;
  const baseSpeed = Math.min(0.35 / Math.pow(moonYears, 0.42), 1.1);
  const speed = moon.retrograde ? -baseSpeed : baseSpeed;

  useFrame(({ clock }, delta) => {
    const angle = mode === "static" ? moon.orbitFactor : clock.elapsedTime * speed + moon.orbitFactor;
    orbitRef.current.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
    if (mode !== "static") {
      meshRef.current.rotation.y += delta * 0.4;
    }
    orbitRef.current.getWorldPosition(tmpPosition);
    registerPosition(moon.name, tmpPosition, radius);
  });

  return (
    <group ref={orbitRef}>
      <mesh onClick={(event) => { event.stopPropagation(); onSelect(moon.name); }} visible={false}>
        <sphereGeometry args={[radius * 3, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 20, 14]} />
        <meshStandardMaterial color={moon.color} roughness={0.92} metalness={0} />
      </mesh>
      {selected ? (
        <mesh>
          <sphereGeometry args={[radius * 1.25, 24, 16]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.22} />
        </mesh>
      ) : null}
      {mode === "static" ? (
        <Html center position={[0, radius * 2 + 0.15, 0]} style={{ pointerEvents: "none" }}>
          <div className="object-label object-label-moon">{moon.name}</div>
        </Html>
      ) : null}
    </group>
  );
}

function AsteroidBelt({ innerRadius, outerRadius, baseSize, count = 1500, mode }) {
  const meshRef = useRef();
  const groupRef = useRef();

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const orbitRadius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const height = (Math.random() - 0.5) * (outerRadius - innerRadius) * 0.05;
      dummyObject.position.set(Math.cos(angle) * orbitRadius, height, Math.sin(angle) * orbitRadius);
      const scale = baseSize * (0.5 + Math.random() * 1.4);
      dummyObject.scale.set(scale, scale * (0.7 + Math.random() * 0.6), scale);
      dummyObject.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummyObject.updateMatrix();
      mesh.setMatrixAt(i, dummyObject.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count, innerRadius, outerRadius, baseSize]);

  useFrame((_, delta) => {
    if (groupRef.current && mode !== "static") groupRef.current.rotation.y += delta * 0.012;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#8a7f6e" roughness={1} metalness={0.05} />
      </instancedMesh>
    </group>
  );
}

function Ring({ planet, radius }) {
  const texture = useTexture(planet.ring.texture);
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[radius * planet.ring.inner, radius * planet.ring.outer, 160]} />
      <meshStandardMaterial
        map={texture}
        color={planet.ring.color}
        transparent
        opacity={planet.ring.opacity}
        alphaTest={0.04}
        side={THREE.DoubleSide}
        roughness={0.85}
        metalness={0}
      />
    </mesh>
  );
}

function Planet({ planet, mode, selected, selectedName, onSelect, registerPosition }) {
  const orbitRef = useRef();
  const planetRef = useRef();
  const texture = useTexture(planet.texture);
  const cloudTexture = useTexture(planet.cloudsTexture || planet.atmosphereTexture || planet.texture);
  const radius = scaleModes[mode].planetRadius(planet);
  const distance = scaleModes[mode].orbitDistance(planet);
  const speed = 0.14 / Math.pow(planet.yearEarthYears, 0.55);
  const selfRotation = 0.35 / Math.max(Math.abs(parseFloat(planet.day)) || 1, 0.4);
  texture.colorSpace = THREE.SRGBColorSpace;
  cloudTexture.colorSpace = THREE.SRGBColorSpace;

  useFrame(({ clock }, delta) => {
    const angle = mode === "static" ? planet.au : clock.elapsedTime * speed + planet.au;
    orbitRef.current.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
    if (mode !== "static") {
      planetRef.current.rotation.y += delta * selfRotation * 7;
    }
    orbitRef.current.getWorldPosition(tmpPosition);
    registerPosition(planet.name, tmpPosition, radius);
  });

  return (
    <group>
      <OrbitPath radius={distance} />
      <group ref={orbitRef}>
        <mesh onClick={(event) => { event.stopPropagation(); onSelect(planet.name); }} visible={false}>
          <sphereGeometry args={[radius * 3, 8, 8]} />
          <meshBasicMaterial visible={false} />
        </mesh>
        <group rotation={[THREE.MathUtils.degToRad(planet.axialTilt), 0, 0]}>
          <mesh ref={planetRef}>
            <sphereGeometry args={[radius, 64, 40]} />
            <meshStandardMaterial map={texture} color="#ffffff" roughness={0.8} metalness={0.02} />
          </mesh>
          {planet.cloudsTexture ? (
            <mesh scale={1.015}>
              <sphereGeometry args={[radius, 48, 32]} />
              <meshStandardMaterial
                map={cloudTexture}
                transparent
                opacity={0.42}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          ) : null}
          {planet.atmosphereTexture ? (
            <mesh scale={1.025}>
              <sphereGeometry args={[radius, 48, 32]} />
              <meshStandardMaterial map={cloudTexture} transparent opacity={0.24} depthWrite={false} />
            </mesh>
          ) : null}
          {planet.ring ? <Ring planet={planet} radius={radius} /> : null}
          {planet.glow ? <AtmosphereGlow radius={radius} color={planet.glow} /> : null}
        </group>
        {planet.moons
          ? planet.moons.map((moon) => (
              <Moon
                key={moon.name}
                moon={moon}
                planetRadius={radius}
                mode={mode}
                selected={moon.name === selectedName}
                onSelect={onSelect}
                registerPosition={registerPosition}
              />
            ))
          : null}
        {selected ? (
          <mesh>
            <sphereGeometry args={[radius * 1.17, 40, 24]} />
            <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.18} />
          </mesh>
        ) : null}
        {mode === "static" ? (
          <Html center position={[0, radius * 1.8 + 0.4, 0]} style={{ pointerEvents: "none" }}>
            <div className="object-label">{planet.name}</div>
          </Html>
        ) : null}
      </group>
    </group>
  );
}

function Sun({ radius, mode }) {
  const texture = useTexture("/textures/2k_sun.jpg");
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <group>
      <mesh>
        <sphereGeometry args={[radius, 96, 64]} />
        <meshBasicMaterial map={texture} color="#ffb13b" />
      </mesh>
      <mesh scale={1.1}>
        <sphereGeometry args={[radius, 64, 40]} />
        <meshBasicMaterial
          color="#ff8c22"
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <pointLight color="#ffe8c2" intensity={4200} distance={900} decay={1.8} />
      {mode === "static" ? (
        <Html center position={[0, radius * 1.4 + 0.5, 0]} style={{ pointerEvents: "none" }}>
          <div className="object-label">Sun</div>
        </Html>
      ) : null}
    </group>
  );
}

function CameraRig({ selectedName, mode, positions, interacted, setInteracted, controlsRef }) {
  const { camera } = useThree();
  const transitionRef = useRef(null);
  const previousRef = useRef({ name: null, mode: null });
  const followRef = useRef(null);

  useFrame(({ clock }, delta) => {
    const controls = controlsRef.current;
    const selectionKey = selectedName || "Sun";
    if (previousRef.current.name !== selectionKey || previousRef.current.mode !== mode) {
      const targetRecord = selectedName ? positions.current.get(selectedName) : null;
      const target = targetRecord ? targetRecord.position.clone() : START_TARGET.clone();
      const radius = targetRecord?.radius || scaleModes[mode].sunRadius;
      const direction = target.clone().sub(camera.position).normalize();
      if (direction.lengthSq() < 0.01) direction.set(0.5, 0.25, 1).normalize();
      const cameraDistance = selectedName ? Math.max(radius * 7, 2.4) : 50;
      const cameraTarget = selectedName
        ? target.clone().add(direction.multiplyScalar(-cameraDistance)).add(new THREE.Vector3(0, radius * 2, 0))
        : START_CAMERA.clone();

      transitionRef.current = {
        elapsed: 0,
        duration: 1.5,
        fromPosition: camera.position.clone(),
        toPosition: cameraTarget,
        fromTarget: controls?.target.clone() || START_TARGET.clone(),
        toTarget: target,
      };
      previousRef.current = { name: selectionKey, mode };
      followRef.current = null;
    }

    const transition = transitionRef.current;
    if (transition && controls) {
      transition.elapsed += delta;
      const t = easeInOutCubic(Math.min(transition.elapsed / transition.duration, 1));
      camera.position.lerpVectors(transition.fromPosition, transition.toPosition, t);
      controls.target.lerpVectors(transition.fromTarget, transition.toTarget, t);
      controls.update();
      if (t >= 1) {
        transitionRef.current = null;
        if (selectedName) {
          const record = positions.current.get(selectedName);
          followRef.current = record ? record.position.clone() : null;
        }
      }
      return;
    }

    if (selectedName && followRef.current && controls) {
      const record = positions.current.get(selectedName);
      if (record) {
        tmpTarget.copy(record.position).sub(followRef.current);
        if (tmpTarget.lengthSq() > 0) {
          camera.position.add(tmpTarget);
          controls.target.add(tmpTarget);
          controls.update();
        }
        followRef.current.copy(record.position);
      }
      return;
    }

    if (!selectedName && !interacted && controls) {
      const drift = clock.elapsedTime * 0.055;
      camera.position.x = Math.sin(drift) * 8;
      camera.position.z = 46 + Math.cos(drift) * 3.5;
      camera.position.y = 22 + Math.sin(drift * 0.7) * 1.5;
      controls.target.lerp(START_TARGET, 0.03);
      controls.update();
    }
  });

  return (
    <OrbitControls
  ref={controlsRef}
  enablePan={false}
  zoomToCursor
  minDistance={mode === "true" ? 0.5 : 2}
  maxDistance={mode === "true" ? 650 : 130}
  onStart={() => setInteracted(true)}
    />
  );
}

function SceneContents({ mode, selectedName, setSelectedName, interacted, setInteracted }) {
  const positions = useRef(new Map());
  const controlsRef = useRef();
  const sunRadius = scaleModes[mode].sunRadius;
  const marsPlanet = planets.find((planet) => planet.name === "Mars");
  const jupiterPlanet = planets.find((planet) => planet.name === "Jupiter");
  const marsOrbit = scaleModes[mode].orbitDistance(marsPlanet);
  const jupiterOrbit = scaleModes[mode].orbitDistance(jupiterPlanet);
  const beltInner = marsOrbit + (jupiterOrbit - marsOrbit) * 0.18;
  const beltOuter = jupiterOrbit - (jupiterOrbit - marsOrbit) * 0.22;
  const rawAsteroidSize = scaleModes[mode].planetRadius(marsPlanet) * 0.07;
  const asteroidSize = mode === "true" ? Math.max(rawAsteroidSize, 0.16) : rawAsteroidSize;

  const registerPosition = (name, position, radius) => {
    positions.current.set(name, { position: position.clone(), radius });
  };

  return (
    <>
      <color attach="background" args={["#05070d"]} />
      <ambientLight intensity={mode === "true" ? 0.32 : 0.14} />
      <Stars radius={360} depth={70} count={1600} factor={3.5} saturation={0} fade speed={0.25} />
      <Sun radius={sunRadius} mode={mode} />
      <AsteroidBelt innerRadius={beltInner} outerRadius={beltOuter} baseSize={asteroidSize} count={1500} mode={mode} />
      {planets.map((planet) => (
        <Planet
          key={`${mode}-${planet.name}`}
          planet={planet}
          mode={mode}
          selected={planet.name === selectedName}
          selectedName={selectedName}
          onSelect={setSelectedName}
          registerPosition={registerPosition}
        />
      ))}
      <CameraRig
        selectedName={selectedName}
        mode={mode}
        positions={positions}
        interacted={interacted}
        setInteracted={setInteracted}
        controlsRef={controlsRef}
      />
      <EffectComposer multisampling={0}>
        <Bloom luminanceThreshold={0.38} luminanceSmoothing={0.35} intensity={1.1} radius={0.55} />
      </EffectComposer>
    </>
  );
}

function InfoPanel({ selectedPlanet, activeTab, setActiveTab, onExpand }) {
  const planet = selectedPlanet || {
    name: "Sun",
    overview: "An emissive central star and warm point-light source for the model. Select any planet to fly closer.",
    massEarth: 333000,
    gravityEarth: 27.9,
    day: "25-35 Earth days, latitude dependent",
    yearEarthYears: 0,
    moonCount: "N/A",
    atmosphere: "Photosphere above plasma; mostly hydrogen and helium",
    exploration: "Observed by SOHO, SDO, Parker Solar Probe, Solar Orbiter, and many heliophysics missions.",
  };
  const kicker = !selectedPlanet ? "System Center" : planet.isMoon ? "Selected Moon" : "Selected Planet";
  const isRealPlanet = selectedPlanet && !selectedPlanet.isMoon;
  const diameterKm = planet.radiusEarth != null ? Math.round(planet.radiusEarth * 12742) : null;
  const distanceMillionKm = planet.au != null ? Math.round(planet.au * 149.6) : null;

  return (
    <aside className="info-panel">
      <div className="panel-kicker">{kicker}</div>
      <h1>{planet.name}</h1>
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={tab === activeTab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="tab-body">
        {activeTab === "Overview" ? <p>{planet.overview}</p> : null}
        {activeTab === "Physical Data" ? (
          <dl>
            <div><dt>Mass</dt><dd>{planet.massEarth != null ? `${Number(planet.massEarth).toLocaleString()} x Earth` : "N/A"}</dd></div>
            <div><dt>Gravity</dt><dd>{planet.gravityEarth != null ? `${planet.gravityEarth} x Earth` : "N/A"}</dd></div>
            <div><dt>Day</dt><dd>{planet.day}</dd></div>
            <div><dt>{planet.isMoon ? "Orbit" : "Year"}</dt><dd>{planet.yearEarthYears ? yearLabel(planet.yearEarthYears) : "Reference frame"}</dd></div>
            <div><dt>Moons</dt><dd>{planet.moonCount}</dd></div>
            {diameterKm != null ? <div><dt>Diameter</dt><dd>{diameterKm.toLocaleString()} km</dd></div> : null}
            {distanceMillionKm != null ? (
              <div><dt>Distance</dt><dd>{planet.au} AU (~{distanceMillionKm.toLocaleString()} million km)</dd></div>
            ) : null}
          </dl>
        ) : null}
        {activeTab === "Atmosphere" ? <p>{planet.atmosphere}</p> : null}
        {activeTab === "Exploration" ? <p>{planet.exploration}</p> : null}
      </div>
      {isRealPlanet ? (
        <div className="info-panel-actions">
          <button type="button" className="know-more-btn" onClick={onExpand}>
            More &rarr;
          </button>
        </div>
      ) : null}
    </aside>
  );
}

function ExpandedPlanetView({ planet, onClose }) {
  const [section, setSection] = useState("Physical Data");
  const diameterKm = planet.radiusEarth != null ? Math.round(planet.radiusEarth * 12742) : null;
  const distanceMillionKm = planet.au != null ? Math.round(planet.au * 149.6) : null;
  const nasaUrl = `https://science.nasa.gov/${planet.name.toLowerCase()}/`;

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="expanded-overlay" role="dialog" aria-modal="true" aria-label={`${planet.name} details`}>
      <div className="expanded-overlay-backdrop" onClick={onClose} />
      <div className="expanded-view">
        <button type="button" className="expanded-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <div className="expanded-header">
          <img className="expanded-image" src={planet.texture} alt={`${planet.name} surface texture`} />
          <div className="expanded-header-text">
            <div className="panel-kicker">Full Profile</div>
            <h1>{planet.name}</h1>
            <p className="expanded-overview">{planet.overview}</p>
          </div>
        </div>

        <div className="expanded-quickstats">
          <div><dt>Diameter</dt><dd>{diameterKm != null ? `${diameterKm.toLocaleString()} km` : "N/A"}</dd></div>
          <div><dt>Distance from Sun</dt><dd>{distanceMillionKm != null ? `${distanceMillionKm.toLocaleString()} million km` : "N/A"}</dd></div>
          <div><dt>Year</dt><dd>{planet.yearEarthYears ? yearLabel(planet.yearEarthYears) : "N/A"}</dd></div>
          <div><dt>Moons</dt><dd>{planet.moonCount}</dd></div>
        </div>

        <div className="section-toggle expanded-section-toggle" role="group" aria-label="Detail section">
          {detailSections.map((s) => (
            <button key={s} type="button" className={s === section ? "active" : ""} onClick={() => setSection(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="expanded-body">
          {section === "Physical Data" ? (
            <dl>
              <div><dt>Mass</dt><dd>{Number(planet.massEarth).toLocaleString()} x Earth</dd></div>
              <div><dt>Gravity</dt><dd>{planet.gravityEarth} x Earth</dd></div>
              <div><dt>Day length</dt><dd>{planet.day}</dd></div>
              <div><dt>Axial tilt</dt><dd>{planet.axialTilt}&deg;</dd></div>
              <div><dt>Moons</dt><dd>{planet.moonCount}</dd></div>
            </dl>
          ) : null}
          {section === "Atmosphere" ? <p>{planet.atmosphere}</p> : null}
          {section === "Exploration" ? <p>{planet.exploration}</p> : null}
          {section === "Discovery" ? <p>{planet.discovery || "No discovery record available."}</p> : null}
          {section === "Moons" ? (
            planet.moons?.length ? (
              <div className="expanded-moons">
                {planet.moons.map((moon) => (
                  <div key={moon.name} className="expanded-moon-item">
                    <div className="expanded-moon-name">{moon.name}</div>
                    <p>{moon.overview}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>{planet.name} has no known moons.</p>
            )
          ) : null}
        </div>

        <div className="expanded-footer">
          <a className="know-more-btn" href={nasaUrl} target="_blank" rel="noopener noreferrer">
            Know more on NASA &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

function findMoonInfo(selectedName) {
  for (const planet of planets) {
    const moon = planet.moons?.find((m) => m.name === selectedName);
    if (moon) {
      return {
        name: moon.name,
        overview: `${moon.overview} Orbits ${planet.name}.`,
        atmosphere: moon.atmosphere,
        exploration: moon.exploration,
        day: "Tidally locked (same length as its orbit)",
        yearEarthYears: moon.periodDays / 365.25,
        moonCount: "N/A",
        isMoon: true,
        parentPlanet: planet.name,
      };
    }
  }
  return null;
}

export default function SolarSystemScene() {
  const [searchParams, setSearchParams] = useSearchParams();
  const showNakshatras = searchParams.get("section") === "nakshatras";
  const showAndromeda = searchParams.get("section") === "andromeda";
  const [mode, setMode] = useState("visual");
  const [selectedName, setSelectedName] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [interacted, setInteracted] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const selectedPlanet = planets.find((planet) => planet.name === selectedName) || findMoonInfo(selectedName);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setInteracted(false);
  };

  const selectObject = (name) => {
    setSelectedName(name);
    setActiveTab("Overview");
    setInteracted(false);
    setExpanded(false);
  };

  const returnToSystem = () => {
    setSelectedName(null);
    setInteracted(false);
    setExpanded(false);
  };

  if (showNakshatras) {
    return (
      <main className="solar-system">
        <NakshatraWheel onClose={() => setSearchParams({}, { replace: true })} />
      </main>
    );
  }

  if (showAndromeda) {
    return (
      <main className="solar-system">
        <AndromedaGalaxy onClose={() => setSearchParams({}, { replace: true })} />
      </main>
    );
  }

  return (
    <main className="solar-system">
      <Canvas camera={{ position: START_CAMERA.toArray(), fov: 50, near: 0.02, far: 1200 }} dpr={[1, 1.75]}>
        <Suspense fallback={null}>
          <SceneContents
            mode={mode}
            selectedName={selectedName}
            setSelectedName={selectObject}
            interacted={interacted}
            setInteracted={setInteracted}
          />
        </Suspense>
      </Canvas>
      <div className="topbar">
        <div className="topbar-controls">
          <div className="scale-toggle" role="group" aria-label="Scale mode">
            {Object.entries(scaleModes).map(([key, config]) => (
              <button key={key} className={mode === key ? "active" : ""} type="button" onClick={() => changeMode(key)}>
                {config.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="nak-entry-button"
            onClick={() => setSearchParams({ section: "nakshatras" })}
            title="27 Nakshatras — an interactive Vedic sky wheel"
          >
            Nakshatras
          </button>
          <button
            type="button"
            className="nak-entry-button"
            onClick={() => setSearchParams({ section: "andromeda" })}
            title="Andromeda Galaxy — our nearest large galactic neighbor"
          >
            Andromeda
          </button>
        </div>
        {selectedName ? (
          <button className="return-button" type="button" onClick={returnToSystem}>
            Return
          </button>
        ) : null}
      </div>
      {selectedPlanet ? (
        <div className="info-panel-stage">
          <InfoPanel
            selectedPlanet={selectedPlanet}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onExpand={() => setExpanded(true)}
          />
        </div>
      ) : null}
      {expanded && selectedPlanet && !selectedPlanet.isMoon ? (
        <ExpandedPlanetView planet={selectedPlanet} onClose={() => setExpanded(false)} />
      ) : null}
      <div className="status-line">
        {mode === "true"
          ? "True scale preserves relative planet sizes and orbit distances; most worlds become tiny and far apart."
          : "Visual scale enlarges planets so their surfaces, clouds, and rings are readable."}
      </div>
      <img src="/favicon.svg" alt="" aria-hidden="true" className="explorer-watermark" />
    </main>
  );
}

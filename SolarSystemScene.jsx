import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture, Line } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import React, { Suspense, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { planets, scaleModes, tabs } from "../data/planets.js";

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

function Planet({ planet, mode, selected, onSelect, registerPosition }) {
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
    const angle = clock.elapsedTime * speed + planet.au;
    orbitRef.current.position.set(Math.cos(angle) * distance, 0, Math.sin(angle) * distance);
    planetRef.current.rotation.y += delta * selfRotation * 7;
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
        {selected ? (
          <mesh>
            <sphereGeometry args={[radius * 1.17, 40, 24]} />
            <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.18} />
          </mesh>
        ) : null}
      </group>
    </group>
  );
}

function Sun({ radius }) {
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
    </group>
  );
}

function CameraRig({ selectedName, mode, positions, interacted, setInteracted, controlsRef }) {
  const { camera } = useThree();
  const transitionRef = useRef(null);
  const previousRef = useRef({ name: null, mode: null });

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
    }

    const transition = transitionRef.current;
    if (transition && controls) {
      transition.elapsed += delta;
      const t = easeInOutCubic(Math.min(transition.elapsed / transition.duration, 1));
      camera.position.lerpVectors(transition.fromPosition, transition.toPosition, t);
      controls.target.lerpVectors(transition.fromTarget, transition.toTarget, t);
      controls.update();
      if (t >= 1) transitionRef.current = null;
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
  minDistance={2}
  maxDistance={mode === "true" ? 650 : 130}
  onStart={() => setInteracted(true)}
    />
  );
}

function SceneContents({ mode, selectedName, setSelectedName, interacted, setInteracted }) {
  const positions = useRef(new Map());
  const controlsRef = useRef();
  const sunRadius = scaleModes[mode].sunRadius;

  const registerPosition = (name, position, radius) => {
    positions.current.set(name, { position: position.clone(), radius });
  };

  return (
    <>
      <color attach="background" args={["#05070d"]} />
      <ambientLight intensity={mode === "true" ? 0.32 : 0.14} />
      <Stars radius={360} depth={70} count={1600} factor={3.5} saturation={0} fade speed={0.25} />
      <Sun radius={sunRadius} />
      {planets.map((planet) => (
        <Planet
          key={`${mode}-${planet.name}`}
          planet={planet}
          mode={mode}
          selected={planet.name === selectedName}
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

function InfoPanel({ selectedPlanet, activeTab, setActiveTab }) {
  const planet = selectedPlanet || {
    name: "Sun",
    overview: "An emissive central star and warm point-light source for the model. Select any planet to fly closer.",
    massEarth: 333000,
    gravityEarth: 27.9,
    day: "25-35 Earth days, latitude dependent",
    yearEarthYears: 0,
    moons: "N/A",
    atmosphere: "Photosphere above plasma; mostly hydrogen and helium",
    exploration: "Observed by SOHO, SDO, Parker Solar Probe, Solar Orbiter, and many heliophysics missions.",
  };

  return (
    <aside className="info-panel">
      <div className="panel-kicker">{selectedPlanet ? "Selected Planet" : "System Center"}</div>
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
            <div><dt>Mass</dt><dd>{Number(planet.massEarth).toLocaleString()} x Earth</dd></div>
            <div><dt>Gravity</dt><dd>{planet.gravityEarth} x Earth</dd></div>
            <div><dt>Day</dt><dd>{planet.day}</dd></div>
            <div><dt>Year</dt><dd>{planet.yearEarthYears ? yearLabel(planet.yearEarthYears) : "Reference frame"}</dd></div>
            <div><dt>Moons</dt><dd>{planet.moons}</dd></div>
          </dl>
        ) : null}
        {activeTab === "Atmosphere" ? <p>{planet.atmosphere}</p> : null}
        {activeTab === "Exploration" ? <p>{planet.exploration}</p> : null}
      </div>
    </aside>
  );
}

export default function SolarSystemScene() {
  const [mode, setMode] = useState("visual");
  const [selectedName, setSelectedName] = useState(null);
  const [activeTab, setActiveTab] = useState("Overview");
  const [interacted, setInteracted] = useState(false);
  const selectedPlanet = planets.find((planet) => planet.name === selectedName);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setInteracted(false);
  };

  const returnToSystem = () => {
    setSelectedName(null);
    setInteracted(false);
  };

  return (
    <main className="solar-system">
      <Canvas camera={{ position: START_CAMERA.toArray(), fov: 50, near: 0.02, far: 1200 }} dpr={[1, 1.75]}>
        <Suspense fallback={null}>
          <SceneContents
            mode={mode}
            selectedName={selectedName}
            setSelectedName={(name) => {
              setSelectedName(name);
              setActiveTab("Overview");
              setInteracted(false);
            }}
            interacted={interacted}
            setInteracted={setInteracted}
          />
        </Suspense>
      </Canvas>
      <div className="topbar">
        <div className="scale-toggle" role="group" aria-label="Scale mode">
          {Object.entries(scaleModes).map(([key, config]) => (
            <button key={key} className={mode === key ? "active" : ""} type="button" onClick={() => changeMode(key)}>
              {config.label}
            </button>
          ))}
        </div>
        <button className="return-button" type="button" onClick={returnToSystem}>
          Return
        </button>
      </div>
      {selectedPlanet ? (
        <InfoPanel selectedPlanet={selectedPlanet} activeTab={activeTab} setActiveTab={setActiveTab} />
      ) : null}
      <div className="status-line">
        {mode === "true"
          ? "True scale preserves relative planet sizes and orbit distances; most worlds become tiny and far apart."
          : "Visual scale enlarges planets so their surfaces, clouds, and rings are readable."}
      </div>
    </main>
  );
}

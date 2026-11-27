import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { propagate, twoline2satrec } from "satellite.js";
import { EARTH_RADIUS_KM, satellites } from "../data/satellites.js";

const TLE_CACHE_PREFIX = "anveshya-tle-";
const TLE_CACHE_TTL_MS = 2 * 60 * 60 * 1000;

async function fetchTLE(noradId) {
  const cacheKey = `${TLE_CACHE_PREFIX}${noradId}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.fetchedAt < TLE_CACHE_TTL_MS) return parsed.lines;
    } catch {}
  }
  const url = `https://celestrak.org/NORAD/elements/gp.php?CATNR=${noradId}&FORMAT=TLE`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`CelesTrak request failed: ${response.status}`);
  const text = (await response.text()).trim();
  const rawLines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const lines = rawLines.length >= 3 ? [rawLines[1], rawLines[2]] : [rawLines[0], rawLines[1]];
  sessionStorage.setItem(cacheKey, JSON.stringify({ lines, fetchedAt: Date.now() }));
  return lines;
}

function useSatrec(noradId) {
  const [satrec, setSatrec] = useState(null);
  useEffect(() => {
    let cancelled = false;
    fetchTLE(noradId)
      .then(([line1, line2]) => {
        if (cancelled) return;
        setSatrec(twoline2satrec(line1, line2));
      })
      .catch((err) => {
        console.warn(`[ManMadeObjects] Could not load TLE for NORAD ${noradId}:`, err.message);
      });
    return () => { cancelled = true; };
  }, [noradId]);
  return satrec;
}

function SatelliteMarker({ satellite, mode, earthRadius, positions, selected, onSelect, registerPosition }) {
  const satrec = useSatrec(satellite.noradId);
  const groupRef = useRef();
  const lastUpdateRef = useRef(0);
  const offsetRef = useRef(new THREE.Vector3(1, 0, 0));
  const worldPosRef = useRef(new THREE.Vector3());

  const orbitRadius = earthRadius * (1 + satellite.altitudeKm / EARTH_RADIUS_KM);
  const rawMarkerSize = earthRadius * 0.018;
  const markerSize = mode === "true" ? Math.max(rawMarkerSize, 0.05) : rawMarkerSize;

  useFrame(({ clock }) => {
    if (!groupRef.current || !satrec) return;
    const earthRecord = positions.current.get("Earth");
    if (!earthRecord) return;

    if (clock.elapsedTime - lastUpdateRef.current > 1) {
      lastUpdateRef.current = clock.elapsedTime;
      const result = propagate(satrec, new Date());
      if (result && result.position) {
        const { x, y, z } = result.position;
        offsetRef.current.set(x, z, y).normalize();
      }
    }

    worldPosRef.current
      .copy(offsetRef.current)
      .multiplyScalar(orbitRadius)
      .add(earthRecord.position);
    groupRef.current.position.copy(worldPosRef.current);
    registerPosition(satellite.shortName, worldPosRef.current, markerSize);
  });

  if (!satrec) return null;

  return (
    <group ref={groupRef}>
      <mesh onClick={(event) => { event.stopPropagation(); onSelect(satellite.shortName); }} visible={false}>
        <sphereGeometry args={[markerSize * 3, 8, 8]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <mesh>
        <octahedronGeometry args={[markerSize, 0]} />
        <meshStandardMaterial
          color={satellite.color}
          emissive={satellite.color}
          emissiveIntensity={0.6}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>
      {selected ? (
        <mesh>
          <sphereGeometry args={[markerSize * 1.6, 20, 14]} />
          <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.25} />
        </mesh>
      ) : null}
      <Html center position={[0, markerSize * 2.2 + 0.1, 0]} style={{ pointerEvents: "none" }}>
        <div className="object-label">{satellite.shortName}</div>
      </Html>
    </group>
  );
}

export default function ManMadeObjects({ mode, earthRadius, positions, selectedName, onSelect, registerPosition }) {
  return (
    <>
      {satellites.map((satellite) => (
        <SatelliteMarker
          key={satellite.shortName}
          satellite={satellite}
          mode={mode}
          earthRadius={earthRadius}
          positions={positions}
          selected={satellite.shortName === selectedName}
          onSelect={onSelect}
          registerPosition={registerPosition}
        />
      ))}
    </>
  );
}

export function findSatelliteInfo(selectedName) {
  const satellite = satellites.find((s) => s.shortName === selectedName);
  if (!satellite) return null;
  return { ...satellite, isSatellite: true };
}

export function SatelliteInfoPanel({ satellite }) {
  return (
    <aside className="info-panel">
      <div className="panel-kicker">Man-Made Object &middot; Live Tracked</div>
      <h1>{satellite.name}</h1>
      <p>{satellite.mission}</p>
      <dl>
        <div><dt>Operator</dt><dd>{satellite.operator}</dd></div>
        <div><dt>Orbit type</dt><dd>{satellite.orbitType}</dd></div>
        <div><dt>Altitude</dt><dd>~{satellite.altitudeKm.toLocaleString()} km</dd></div>
        <div><dt>Orbital period</dt><dd>{satellite.orbitalPeriodMin} minutes</dd></div>
        <div><dt>Inclination</dt><dd>{satellite.inclinationDeg}&deg;</dd></div>
        <div><dt>Speed</dt><dd>~{satellite.speedKmS} km/s</dd></div>
        <div><dt>Launched</dt><dd>{satellite.launchDate}</dd></div>
      </dl>
    </aside>
  );
}

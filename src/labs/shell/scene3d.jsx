// Small building blocks for the experiment pictures.
import { Line } from "@react-three/drei";
import React, { useMemo } from "react";
import * as THREE from "three";
import { buffer, useGeometry, useWire } from "./wire.jsx";

const circlePoints = (radius, segments = 128) =>
  Array.from({ length: segments + 1 }, (_, i) => {
    const a = (i / segments) * Math.PI * 2;
    return [radius * Math.cos(a), radius * Math.sin(a), 0];
  });

// A circle in the x-y plane. "flat" lays it in the x-z (floor) plane.
export function Circle({ radius, color, width = 1.5, opacity = 1, flat = false, dashed = false, ...props }) {
  const wire = useWire();
  const points = useMemo(() => circlePoints(radius), [radius]);
  return (
    <group {...props}>
      <group rotation={[flat ? Math.PI / 2 : 0, 0, 0]}>
        <Line
          points={points}
          color={color || wire.line}
          lineWidth={width}
          transparent
          opacity={opacity}
          dashed={dashed}
          dashSize={0.08}
          gapSize={0.06}
        />
      </group>
    </group>
  );
}

// Straight or curved line through the given points.
export function Path({ points, color, width = 1.5, opacity = 1, dashed = false }) {
  const wire = useWire();
  if (!points || points.length < 2) return null;
  return (
    <Line
      points={points}
      color={color || wire.line}
      lineWidth={width}
      transparent
      opacity={opacity}
      dashed={dashed}
      dashSize={0.08}
      gapSize={0.06}
    />
  );
}

export function Dot({ radius = 0.08, color, ...props }) {
  const wire = useWire();
  return (
    <mesh {...props}>
      <sphereGeometry args={[radius, 18, 14]} />
      <meshBasicMaterial color={color || wire.line} />
    </mesh>
  );
}

export function WireSphere({ radius, color, opacity = 0.35, fill, segments = 20 }) {
  const wire = useWire();
  return (
    <group>
      {fill ? (
        <mesh>
          <sphereGeometry args={[radius * 0.99, 32, 24]} />
          <meshBasicMaterial color={fill} />
        </mesh>
      ) : null}
      <mesh>
        <sphereGeometry args={[radius, segments, Math.round(segments * 0.7)]} />
        <meshBasicMaterial color={color || wire.line} wireframe transparent opacity={opacity} depthWrite={false} />
      </mesh>
    </group>
  );
}

// A surface made by spinning the profile [[radius, height], ...] about the
// vertical axis, drawn as rings and meridians. Colors blend from "line" at the
// first profile point to "accent" at the last.
export function Revolution({ profile, rings = 18, meridians = 32, opacity = 0.55, mirrorColors = false }) {
  const wire = useWire();
  const geometry = useGeometry(() => {
    const points = [];
    const colors = [];
    const near = new THREE.Color(wire.line);
    const far = new THREE.Color(wire.accent);
    const color = new THREE.Color();
    const push = (index, theta) => {
      const [r, y] = profile[index];
      points.push(r * Math.cos(theta), y, r * Math.sin(theta));
      let t = index / (profile.length - 1);
      if (mirrorColors) t = Math.abs(t * 2 - 1);
      color.copy(near).lerp(far, t);
      colors.push(color.r, color.g, color.b);
    };
    const around = 72;
    for (let i = 0; i <= rings; i++) {
      const index = Math.round((i / rings) * (profile.length - 1));
      for (let j = 0; j < around; j++) {
        push(index, (j / around) * Math.PI * 2);
        push(index, ((j + 1) / around) * Math.PI * 2);
      }
    }
    for (let m = 0; m < meridians; m++) {
      const theta = (m / meridians) * Math.PI * 2;
      for (let i = 0; i < profile.length - 1; i++) {
        push(i, theta);
        push(i + 1, theta);
      }
    }
    return buffer(points, colors);
  }, [profile, rings, meridians, wire, mirrorColors]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial vertexColors transparent opacity={opacity} depthWrite={false} />
    </lineSegments>
  );
}

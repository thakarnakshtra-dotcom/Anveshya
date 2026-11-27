import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Starfield } from "../labs/shell/wire.jsx";
import { OBJECTS } from "./objects.jsx";

// Object positions for wide and tall screens, with the half width/height
// the camera has to fit.
const LAYOUTS = {
  // The black hole is the largest shape, so it gets the most room.
  wide: {
    positions: {
      "black-hole": [-8.1, 0.3, 0],
      wormhole: [-1.8, -1.2, -0.8],
      planet: [3.2, 1.1, 0.4],
      "solar-system": [8.4, -0.8, 0],
    },
    half: [13, 3.4],
  },
  tall: {
    positions: {
      "black-hole": [0, 3.5, 0],
      wormhole: [-2.35, -0.7, 0],
      planet: [2.35, -0.7, 0],
      "solar-system": [0, -4.6, 0],
    },
    half: [4.8, 6.4],
  },
};

function layoutFor(size, insets) {
  const freeWidth = size.width - insets.left - insets.right;
  const freeHeight = size.height - insets.top - insets.bottom;
  return freeWidth / Math.max(freeHeight, 1) > 1.3 ? "wide" : "tall";
}

function CameraRig({ controls, insets, animate, layout }) {
  const invalidate = useThree((state) => state.invalidate);
  const current = useRef(null);

  // With motion off the scene only redraws when something changes.
  useEffect(() => {
    controls.current.invalidate = invalidate;
    invalidate();
  }, [insets, layout, animate, controls, invalidate]);

  useFrame(({ camera, size, clock }, delta) => {
    const input = controls.current;
    const { half } = LAYOUTS[layout];

    // Distance that fits the shapes inside the area not covered by text.
    const freeWidth = Math.max(size.width - insets.left - insets.right, 160);
    const freeHeight = Math.max(size.height - insets.top - insets.bottom, 160);
    const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const fit = Math.max(
      half[1] / (tan * (freeHeight / size.height)),
      half[0] / (tan * camera.aspect * (freeWidth / size.width))
    );
    const drift = animate ? Math.sin(clock.elapsedTime * 0.11) * 0.12 : 0;
    const goal = {
      distance: fit * input.zoom,
      azimuth: input.azimuth + drift,
      polar: input.polar,
      offsetX: (insets.right - insets.left) / 2,
      offsetY: (insets.bottom - insets.top) / 2,
    };

    if (!current.current) current.current = { ...goal };
    const now = current.current;
    const ease = animate ? 1 - Math.exp(-Math.min(delta, 0.1) * 4.2) : 1;
    Object.keys(goal).forEach((key) => {
      now[key] += (goal[key] - now[key]) * ease;
    });

    camera.position.set(
      now.distance * Math.sin(now.azimuth) * Math.cos(now.polar),
      now.distance * Math.sin(now.polar),
      now.distance * Math.cos(now.azimuth) * Math.cos(now.polar)
    );
    camera.lookAt(0, 0, 0);
    camera.setViewOffset(size.width, size.height, now.offsetX, now.offsetY, size.width, size.height);
  });

  return null;
}

function Universe({ controls, insets, animate, starCount }) {
  const size = useThree((state) => state.size);
  const layout = layoutFor(size, insets);

  return (
    <>
      <CameraRig controls={controls} insets={insets} animate={animate} layout={layout} />
      <Starfield count={starCount} animate={animate} />
      {Object.entries(OBJECTS).map(([slug, Shape]) => (
        <group key={slug} position={LAYOUTS[layout].positions[slug]}>
          <Shape animate={animate} />
        </group>
      ))}
    </>
  );
}

export default function UniverseScene({ active, onFail, ...props }) {
  const [small] = useState(() => window.matchMedia("(max-width: 760px)").matches);

  return (
    <Canvas
      camera={{ fov: 45, near: 0.1, far: 400, position: [0, 0, 24] }}
      dpr={[1, small ? 1.5 : 1.75]}
      frameloop={!active ? "never" : props.animate ? "always" : "demand"}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => gl.domElement.addEventListener("webglcontextlost", onFail, { once: true })}
    >
      <color attach="background" args={["#000000"]} />
      <Universe {...props} starCount={small ? 800 : 1700} />
    </Canvas>
  );
}

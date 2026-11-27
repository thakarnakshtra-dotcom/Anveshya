import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useRef } from "react";
import { MathUtils } from "three";
import { SceneTimeContext, Starfield, WIRE, WireContext } from "./wire.jsx";

// Advances the lab's own clock, so it can pause, change speed and restart.
function Clock({ timeRef, playing, values, resetKey, onAdvance }) {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    timeRef.current = 0;
    invalidate();
  }, [resetKey, timeRef, invalidate]);
  // While paused, redraw whenever a control changes.
  useEffect(() => invalidate(), [values, invalidate]);
  useFrame((_, delta) => {
    if (!playing) return;
    const step = Math.min(delta, 0.1);
    timeRef.current += step * (values.speed ?? 1);
    onAdvance?.(step);
  });
  return null;
}

// Drag to rotate, scroll or pinch to zoom. Reset, resizing and switching
// experiment restore the starting view.
// "across" and "up" are the half-width and half-height that must be visible.
function View({ resetKey, across, up, tilt, turn }) {
  const controls = useRef();
  const camera = useThree((state) => state.camera);
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const tan = Math.tan(MathUtils.degToRad(camera.fov / 2));
    const distance = Math.max(up / tan, across / (tan * (width / height)));
    const orbit = controls.current;
    if (orbit) {
      // Use up any leftover drag motion first, or it would move the view again.
      orbit.enableDamping = false;
      orbit.update();
    }
    camera.position.set(
      distance * Math.cos(tilt) * Math.sin(turn),
      distance * Math.sin(tilt),
      distance * Math.cos(tilt) * Math.cos(turn)
    );
    camera.lookAt(0, 0, 0);
    if (orbit) {
      orbit.target.set(0, 0, 0);
      orbit.update();
      orbit.enableDamping = true;
    }
    invalidate();
  }, [resetKey, across, up, tilt, turn, width, height, camera, invalidate]);

  return <OrbitControls ref={controls} enablePan={false} minDistance={1.5} maxDistance={40} />;
}

export default function LabCanvas({ experiment, values, playing, resetKey, theme, onAdvance, onFail }) {
  const timeRef = useRef(0);
  const wire = WIRE[theme];
  const { Scene } = experiment;
  const camera = typeof experiment.camera === "function" ? experiment.camera(values) : experiment.camera;
  const { radius = 3.1, across = radius, up = radius, tilt = 0.25, turn = 0 } = camera || {};

  return (
    <Canvas
      camera={{ fov: 45, near: 0.05, far: 400, position: [0, 1.5, 6] }}
      dpr={[1, experiment.dpr || 1.75]}
      frameloop={playing ? "always" : "demand"}
      onCreated={({ gl }) => gl.domElement.addEventListener("webglcontextlost", onFail, { once: true })}
    >
      <color attach="background" args={[wire.solid]} />
      <WireContext.Provider value={wire}>
        <SceneTimeContext.Provider value={timeRef}>
          <Clock timeRef={timeRef} playing={playing} values={values} resetKey={resetKey} onAdvance={onAdvance} />
          {experiment.stars ? <Starfield count={500} animate={playing} /> : null}
          <Scene key={experiment.id} animate values={values} resetKey={resetKey} />
        </SceneTimeContext.Provider>
      </WireContext.Provider>
      {experiment.view === "look" ? null : (
        <View key={experiment.id} resetKey={resetKey} across={across} up={up} tilt={tilt} turn={turn} />
      )}
    </Canvas>
  );
}

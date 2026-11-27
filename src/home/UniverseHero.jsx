import React, { Component, Suspense, lazy, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import useReducedMotion from "../utils/useReducedMotion.js";
import { supportsWebGL } from "../utils/webgl.js";
import "./universe.css";

const UniverseScene = lazy(() => import("./UniverseScene.jsx"));

const SOLAR_SYSTEM_PATH = "/explorer?section=solar-system";
const MIN_ZOOM = 0.45;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function Heading() {
  return (
    <>
      <div className="uni-eyebrow">An Independent Space Platform</div>
      <h1 className="uni-title">Explore the Universe</h1>
      <p className="uni-lede">Looking at real space through a window.</p>
    </>
  );
}

// Without WebGL the hero is just the heading and the solar system link.
function StaticHero() {
  return (
    <section className="uni uni-static" aria-label="Anveshya universe">
      <Heading />
      <Link className="uni-solar" to={SOLAR_SYSTEM_PATH}>
        Open the 3D Solar System &rarr;
      </Link>
    </section>
  );
}

export default function UniverseHero() {
  const [usable, setUsable] = useState(supportsWebGL);
  const [insets, setInsets] = useState({ top: 240, right: 0, bottom: 150, left: 0 });
  const [active, setActive] = useState(true);
  const reducedMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const headRef = useRef(null);
  const dockRef = useRef(null);
  const controls = useRef({ azimuth: 0, polar: 0.08, zoom: 1, invalidate: () => {} });
  const drag = useRef({ pointers: new Map(), travelled: 0, pinch: null });
  const onFail = useCallback(() => setUsable(false), []);

  // Tell the camera how much of the screen the text covers.
  useLayoutEffect(() => {
    if (!usable) return undefined;
    const measure = () => {
      const head = headRef.current;
      const dock = dockRef.current;
      if (!head || !dock) return;
      setInsets({ left: 0, right: 0, top: head.offsetTop + head.offsetHeight, bottom: dock.offsetHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    [sectionRef, headRef, dockRef].forEach((ref) => ref.current && observer.observe(ref.current));
    return () => observer.disconnect();
  }, [usable]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!usable || !section) return undefined;

    // Wheel zooms the scene while the page is at the top. Once fully zoomed
    // out, scrolling down moves the page as usual, so nobody gets stuck.
    const onWheel = (event) => {
      if (event.ctrlKey || window.scrollY > 2) return;
      const input = controls.current;
      if (event.deltaY > 0 && input.zoom >= 1) return;
      event.preventDefault();
      const pixels = event.deltaMode === 1 ? event.deltaY * 32 : event.deltaY;
      input.zoom = clamp(input.zoom + pixels * 0.0012, MIN_ZOOM, 1);
      input.invalidate();
    };
    // Stop rendering when the scene is scrolled out of view.
    const visibility = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting));

    section.addEventListener("wheel", onWheel, { passive: false });
    visibility.observe(section);
    return () => {
      section.removeEventListener("wheel", onWheel);
      visibility.disconnect();
    };
  }, [usable]);

  const spread = () => {
    const [a, b] = [...drag.current.pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };

  const onPointerDown = (event) => {
    const state = drag.current;
    state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (state.pointers.size === 1) state.travelled = 0;
    if (state.pointers.size === 2) state.pinch = { distance: spread(), zoom: controls.current.zoom };
  };

  const onPointerMove = (event) => {
    const state = drag.current;
    const last = state.pointers.get(event.pointerId);
    if (!last) return;
    // The button may have been released outside the window.
    if (event.pointerType === "mouse" && event.buttons === 0) {
      state.pointers.delete(event.pointerId);
      return;
    }
    const dx = event.clientX - last.x;
    const dy = event.clientY - last.y;
    state.pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const input = controls.current;

    if (state.pointers.size === 2 && state.pinch) {
      input.zoom = clamp((state.pinch.zoom * state.pinch.distance) / Math.max(spread(), 1), MIN_ZOOM, 1);
    } else {
      state.travelled += Math.abs(dx) + Math.abs(dy);
      if (state.travelled < 6) return;
      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      input.azimuth -= dx * 0.005;
      input.polar = clamp(input.polar + dy * 0.004, -1.1, 1.1);
    }
    input.invalidate();
  };

  const onPointerEnd = (event) => {
    drag.current.pointers.delete(event.pointerId);
    drag.current.pinch = null;
  };

  if (!usable) return <StaticHero />;

  return (
    <section ref={sectionRef} className="uni uni-live" aria-label="Anveshya universe">
      <div
        className="uni-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
      >
        <SceneBoundary onFail={onFail}>
          <Suspense fallback={<p className="uni-loading">Loading the universe&hellip;</p>}>
            <UniverseScene
              controls={controls}
              insets={insets}
              animate={!reducedMotion}
              active={active}
              onFail={onFail}
            />
          </Suspense>
        </SceneBoundary>
      </div>

      <header ref={headRef} className="uni-head">
        <Heading />
      </header>

      <div ref={dockRef} className="uni-dock">
        <p className="uni-hint">Drag to rotate &middot; Scroll or pinch to zoom</p>
        <Link className="uni-solar" to={SOLAR_SYSTEM_PATH}>
          Open the 3D Solar System &rarr;
        </Link>
        <p className="uni-note">The 3D objects are illustrations, not simulations.</p>
      </div>
    </section>
  );
}

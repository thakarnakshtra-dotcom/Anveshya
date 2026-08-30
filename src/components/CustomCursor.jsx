import React, { useEffect, useRef } from "react";

// Space-themed cursor: a small glowing dot with a short comet-tail of
// fading trail dots easing toward it. Desktop/mouse only — gated on
// (hover: hover) and (pointer: fine) so touchscreens keep their normal
// tap behavior untouched (both here in JS, and in CSS for the `cursor:
// none` rule itself, so there's no dependency ordering issue between the
// two). Position updates go straight to element.style.transform inside a
// single requestAnimationFrame loop rather than React state, so this
// never triggers a re-render on mousemove and stays smooth at 60fps.
const TRAIL_LENGTH = 6;
const EASE = 0.35;

function isFinePointerDevice() {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

export default function CustomCursor() {
  const dotRef = useRef(null);
  const trailRefs = useRef([]);
  const target = useRef({ x: -100, y: -100 });
  const trailPos = useRef(Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 })));
  const rafRef = useRef(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    if (!isFinePointerDevice()) return undefined;

    const handleMove = (e) => {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (!visibleRef.current) {
        visibleRef.current = true;
        if (dotRef.current) dotRef.current.style.opacity = "1";
      }
    };
    const handleLeave = () => {
      visibleRef.current = false;
      if (dotRef.current) dotRef.current.style.opacity = "0";
    };

    window.addEventListener("mousemove", handleMove);
    document.documentElement.addEventListener("mouseleave", handleLeave);
    document.documentElement.classList.add("custom-cursor-active");

    const tick = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.current.x}px, ${target.current.y}px, 0)`;
      }
      let leadX = target.current.x;
      let leadY = target.current.y;
      trailPos.current.forEach((p, i) => {
        p.x += (leadX - p.x) * EASE;
        p.y += (leadY - p.y) * EASE;
        const el = trailRefs.current[i];
        if (el) el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
        leadX = p.x;
        leadY = p.y;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
      document.documentElement.classList.remove("custom-cursor-active");
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!isFinePointerDevice()) return null;

  return (
    <div aria-hidden="true" className="custom-cursor-layer">
      {trailPos.current.map((_, i) => (
        <span
          key={i}
          ref={(el) => (trailRefs.current[i] = el)}
          className="cursor-trail-dot"
          style={{ opacity: 1 - i / TRAIL_LENGTH }}
        />
      ))}
      <span ref={dotRef} className="cursor-dot" style={{ opacity: 0 }} />
    </div>
  );
}

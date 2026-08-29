import React, { useEffect, useRef, useState } from "react";

// Sparse, subtle shooting-star texture for the background of the
// marketing pages (mounted once, globally, in AppShell — never on
// Explorer, which has its own 3D aesthetic). Pure CSS keyframe animation;
// each star is a short rotated streak that fades in, translates along its
// own diagonal, and fades out, then is removed from state.
const MIN_DELAY_MS = 2000;
const MAX_DELAY_MS = 3000;
const DURATION_S = 1.8;
let nextId = 0;

function randomStar() {
  nextId += 1;
  return {
    id: nextId,
    // Top half of the viewport only, spread across most of the width so a
    // ~40-60px streak traveling down-right over ~1.5-2s stays believable.
    top: `${Math.random() * 38}vh`,
    left: `${-5 + Math.random() * 75}vw`,
    length: 40 + Math.random() * 20,
    duration: DURATION_S + Math.random() * 0.4,
  };
}

export default function ShootingStars() {
  const [stars, setStars] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    const scheduleNext = () => {
      const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
      timerRef.current = setTimeout(() => {
        const star = randomStar();
        setStars((prev) => [...prev, star]);
        setTimeout(() => {
          setStars((prev) => prev.filter((s) => s.id !== star.id));
        }, star.duration * 1000 + 200);
        scheduleNext();
      }, delay);
    };

    scheduleNext();
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {stars.map((s) => (
        <span
          key={s.id}
          className="shooting-star"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.length}px`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

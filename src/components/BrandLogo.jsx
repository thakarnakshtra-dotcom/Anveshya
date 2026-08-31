import React, { useId } from "react";

// The site's mark: a ringed halo around a diagonal comet-like path with
// two star-burst nodes — reads as "a journey traced across the sky,"
// fitting for a space-exploration brand. Cropped tightly to the design's
// own circular bounding box (the source art sits in a wider 1000x600
// canvas; the circle itself, r=272 centered at 500,300, is exactly a
// 544x544 square) so it renders as a clean, compact icon instead of a
// wide canvas with dead space on both sides.
//
// Gradient/filter ids are made unique per instance via useId() rather
// than the fixed "halo2"/"glow2" ids in the original markup — SVG ids
// are global to the document, so two logo instances on the same page
// (e.g. a future footer mark alongside the navbar one) would otherwise
// silently collide and only one definition would actually apply.
export default function BrandLogo({ size = 30 }) {
  const uid = useId();
  const haloId = `brand-halo-${uid}`;
  const glowId = `brand-glow-${uid}`;

  return (
    <svg
      viewBox="228 28 544 544"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
          <stop offset="66%" stopColor="#fff" stopOpacity="0" />
          <stop offset="82%" stopColor="#fff" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="500" cy="300" r="272" fill={`url(#${haloId})`} />
      <circle cx="500" cy="300" r="200" fill="#000" />
      <circle cx="500" cy="300" r="200" fill="none" stroke="#fff" strokeWidth="2.6" filter={`url(#${glowId})`} />
      <circle cx="500" cy="300" r="213" fill="none" stroke="#fff" strokeWidth="1" opacity="0.28" />
      <g fill="#fff" filter={`url(#${glowId})`}>
        <polygon points="247.6,105.8 496.9,303.6 736.4,482.2 503.1,296.4 246.4,104.2" />
        <line x1="247" y1="105" x2="737" y2="483" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
      </g>
      <g fill="#fff">
        <polygon points="325,199.6 344.4,179.8 359,156.4 339.6,176.2" />
        <polygon points="317.8,167.2 342,175 366.2,188.8 342,181" />
        <polygon points="633,455.6 661.2,424.4 683,388.4 654.8,419.6" />
        <polygon points="623.6,408.4 658,419 692.4,435.6 658,425" />
        <circle cx="342" cy="178" r="3.8" />
        <circle cx="658" cy="422" r="5" />
      </g>
    </svg>
  );
}

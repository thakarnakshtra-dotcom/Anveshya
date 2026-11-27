import React from "react";

// One small line drawing per lab, used wherever the labs are listed.
const PATHS = {
  "black-hole": (
    <>
      <circle cx="24" cy="24" r="8" />
      <ellipse cx="24" cy="24" rx="20" ry="6" transform="rotate(-14 24 24)" />
    </>
  ),
  wormhole: (
    <>
      <ellipse cx="24" cy="8" rx="17" ry="4" />
      <ellipse cx="24" cy="24" rx="6" ry="1.6" />
      <ellipse cx="24" cy="40" rx="17" ry="4" />
      <path d="M7 8c10 8 11 11 11 16S17 32 7 40M41 8c-10 8-11 11-11 16s1 8 11 16" />
    </>
  ),
  relativity: (
    <>
      <path d="M4 14c10 0 13 14 20 14s10-14 20-14" />
      <path d="M4 25c9 0 12 14 20 14s11-14 20-14" />
      <circle cx="24" cy="17" r="6" />
    </>
  ),
  "string-theory": (
    <path d="M24 6c6 0 5 8 10 10s9 2 8 9-8 5-11 9-3 9-9 8-4-7-9-10-9-3-7-9 7-4 10-8 2-9 8-9z" />
  ),
};

export default function LabIcon({ slug, size = 34 }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {PATHS[slug]}
    </svg>
  );
}

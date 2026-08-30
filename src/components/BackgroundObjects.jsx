import React from "react";

// Subtle, slow-drifting decorative glow orbs for the marketing pages'
// background — sits alongside ShootingStars (mounted once, globally, in
// AppShell; excluded on Explorer for the same reason shooting stars and
// the custom cursor are: that page has its own 3D aesthetic already).
// Pure CSS: four fixed-position radial-gradient dots, each on its own
// looping float animation with a staggered delay so they don't move in
// sync. No canvas/WebGL, no state, no re-renders — cheap enough to leave
// mounted on every page without a second thought.
export default function BackgroundObjects() {
  return (
    <div className="background-objects" aria-hidden="true">
      <div className="space-object object-1" />
      <div className="space-object object-2" />
      <div className="space-object object-3" />
      <div className="space-object object-4" />
    </div>
  );
}

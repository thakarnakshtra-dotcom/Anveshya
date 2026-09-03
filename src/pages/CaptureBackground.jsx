import React from "react";
import AmbientBackground from "../components/AmbientBackground.jsx";
import BackgroundObjects from "../components/BackgroundObjects.jsx";
import ShootingStars from "../components/ShootingStars.jsx";

// Isolated, chrome-free render of the site's ambient space backdrop —
// no navbar/footer/cursor/text on top. Exists solely so the background
// layers can be screen-recorded cleanly (e.g. for a social video export)
// without cropping out real UI. Not linked from anywhere in the nav.
export default function CaptureBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#000" }}>
      <AmbientBackground variant="hero" />
      <BackgroundObjects />
      <ShootingStars />
    </div>
  );
}

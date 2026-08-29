import React from "react";

// Shared subtle backdrop (vignette, drifting light streaks, two soft
// "moon" spheres, and a slow starfield) used behind every marketing page's
// content. Pure CSS/inline-gradient — no canvas, no render loop.
//
// variant="hero"  — original Home placement (roomy 2-column hero layout).
// variant="page"  — safer corner-hugging placement for the narrower,
//                    single-column .page-hero/.section-grid pages (Learn,
//                    SolarShield, News), where the "hero" positions were
//                    landing behind body text at common viewport widths.
export default function AmbientBackground({ variant = "hero" }) {
  const isPage = variant === "page";

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          background: "radial-gradient(1500px 900px at 50% 42%, rgba(255,255,255,.05), transparent 68%), #000000",
        }}
      />
      <div
        style={{
          position: "fixed",
          left: isPage ? "-6%" : "6%",
          top: isPage ? "3%" : "16%",
          width: "min(520px,45vw)",
          height: 190,
          pointerEvents: "none",
          zIndex: 0,
          transform: "rotate(-22deg)",
          filter: "blur(16px)",
          opacity: 0.5,
          background: "radial-gradient(closest-side, rgba(226,231,244,.22), rgba(150,164,196,.08) 46%, transparent 74%)",
        }}
      />
      <div
        style={{
          position: "fixed",
          right: isPage ? "-6%" : "9%",
          top: isPage ? "89%" : "62%",
          width: "min(300px,28vw)",
          height: 110,
          pointerEvents: "none",
          zIndex: 0,
          transform: "rotate(14deg)",
          filter: "blur(13px)",
          opacity: 0.35,
          background: "radial-gradient(closest-side, rgba(214,222,238,.18), transparent 72%)",
        }}
      />
      <div
        style={{
          position: "fixed",
          right: isPage ? "-3%" : "6%",
          top: isPage ? "93%" : "70%",
          width: 84,
          height: 84,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.6,
          background: "radial-gradient(circle at 34% 30%, #b9c0cd 0%, #7d8595 30%, #3a4050 62%, #090b10 88%)",
          boxShadow: "inset -14px -10px 26px rgba(0,0,0,.85), 0 0 26px rgba(180,196,230,.1)",
        }}
      />
      <div
        style={{
          position: "fixed",
          left: isPage ? "auto" : "11%",
          right: isPage ? "2%" : "auto",
          top: isPage ? "6%" : "26%",
          width: 34,
          height: 34,
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.45,
          background: "radial-gradient(circle at 38% 34%, #a8b0be 0%, #565d6b 45%, #080a0e 85%)",
        }}
      />
      <div
        style={{
          position: "fixed",
          inset: "-20%",
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.95,
          animation: "an-drift 120s linear infinite alternate",
          backgroundImage:
            "radial-gradient(1.5px 1.5px at 20px 30px, rgba(255,255,255,.95), transparent 60%), radial-gradient(1.1px 1.1px at 130px 90px, rgba(226,236,255,.75), transparent 60%), radial-gradient(1.9px 1.9px at 300px 220px, rgba(255,255,255,.6), transparent 60%), radial-gradient(1px 1px at 420px 60px, rgba(255,255,255,.55), transparent 60%), radial-gradient(1.2px 1.2px at 90px 400px, rgba(255,255,255,.5), transparent 60%), radial-gradient(1px 1px at 520px 330px, rgba(214,228,255,.45), transparent 60%)",
          backgroundSize: "340px 300px, 250px 230px, 520px 460px, 470px 380px, 300px 520px, 610px 480px",
        }}
      />
    </>
  );
}

import React, { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ShootingStars from "./components/ShootingStars.jsx";
import BackgroundObjects from "./components/BackgroundObjects.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import FeedbackForm from "./components/FeedbackForm.jsx";
import { startReminderChecker } from "./utils/reminders.js";
import { shouldPlayIntro } from "./utils/intro.js";
import Home from "./pages/Home.jsx";
import Learn from "./pages/Learn.jsx";
import SoundsOfSpace from "./pages/SoundsOfSpace.jsx";
import PlanetDetail from "./pages/PlanetDetail.jsx";
import SolarShield from "./pages/SolarShield.jsx";
import News from "./pages/News.jsx";
import About from "./pages/About.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsOfService from "./pages/TermsOfService.jsx";
import CaptureBackground from "./pages/CaptureBackground.jsx";

// Everything that needs three.js loads on demand, so the first download
// stays small.
const Explorer = lazy(() => import("./pages/Explorer.jsx"));
const Lab = lazy(() => import("./pages/Lab.jsx"));
const LabLesson = lazy(() => import("./pages/LabLesson.jsx"));
const Wallpapers = lazy(() => import("./pages/Wallpapers.jsx"));
const Credits = lazy(() => import("./pages/Credits.jsx"));
const ringSystem = () => import("./components/RingSystem.jsx");
const RingIntro = lazy(() => ringSystem().then((m) => ({ default: m.RingIntro })));
const RingBadge = lazy(() => ringSystem().then((m) => ({ default: m.RingBadge })));

function AppShell() {
  const location = useLocation();

  // Bare recording rig for the ambient backdrop — no navbar/footer/cursor,
  // just the background layers full-bleed. See CaptureBackground.jsx.
  if (location.pathname === "/capture-bg") {
    return <CaptureBackground />;
  }

  const [introPlaying, setIntroPlaying] = useState(() => location.pathname === "/" && shouldPlayIntro());
  // A lab takes the whole screen: no navbar, footer or decorations.
  const isLab = location.pathname.startsWith("/labs/");
  const showBadge = !introPlaying && !isLab && location.pathname !== "/explorer";
  const showShootingStars = !isLab && location.pathname !== "/explorer";
  // Same Explorer exclusion as shooting stars — that page already has its
  // own 3D starfield/scene, another decorative layer behind it would just
  // be wasted paint the user never sees under the WebGL canvas.
  const showBackgroundObjects = !isLab && location.pathname !== "/explorer";
  // Excluded on Explorer too — that page is driven by OrbitControls
  // drag-to-orbit interaction, where a trailing cursor effect would be a
  // distraction rather than a nice touch, matching the same exclusion
  // already applied to the shooting stars and ring badge on that page.
  const showCustomCursor = !isLab && location.pathname !== "/explorer";
  // Explorer's 3D scene is a fixed, full-viewport canvas with no page
  // scroll — a footer below it would either never be reachable or would
  // force scroll onto a page deliberately built not to have any.
  const showFooter = !isLab && location.pathname !== "/explorer";

  // Polls localStorage-backed reminders and fires real browser
  // Notifications when due. Mounted once here (not per-page) so it keeps
  // working across SPA navigation for as long as this tab stays open —
  // there's no push backend, so it can't do more than that.
  useEffect(() => {
    return startReminderChecker();
  }, []);

  return (
    <>
      {isLab ? null : <Navbar />}
      {showBackgroundObjects ? <BackgroundObjects /> : null}
      {showShootingStars ? <ShootingStars /> : null}
      {showCustomCursor ? <CustomCursor /> : null}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/explorer"
          element={
            <Suspense fallback={<main className="solar-system" />}>
              <Explorer />
            </Suspense>
          }
        />
        <Route
          path="/labs/:slug"
          element={
            <Suspense fallback={<div style={{ position: "fixed", inset: 0, background: "#000" }} />}>
              <Lab />
            </Suspense>
          }
        />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/sounds" element={<SoundsOfSpace />} />
        <Route path="/learn/:planetSlug" element={<PlanetDetail />} />
        <Route
          path="/learn/labs/:slug"
          element={
            <Suspense fallback={<main className="home" />}>
              <LabLesson />
            </Suspense>
          }
        />
        <Route path="/solarshield" element={<SolarShield />} />
        <Route path="/news" element={<News />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/wallpapers"
          element={
            <Suspense fallback={<main className="home" />}>
              <Wallpapers />
            </Suspense>
          }
        />
        <Route
          path="/credits"
          element={
            <Suspense fallback={<main className="home" />}>
              <Credits />
            </Suspense>
          }
        />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>
      {showFooter ? <Footer /> : null}
      {showBadge ? (
        <Suspense fallback={null}>
          <RingBadge />
        </Suspense>
      ) : null}
      {introPlaying ? (
        // Black cover while the intro's code arrives, so the page does not flash first.
        <Suspense fallback={<div style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000" }} />}>
          <RingIntro onComplete={() => setIntroPlaying(false)} />
        </Suspense>
      ) : null}
      {isLab ? null : <FeedbackForm />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

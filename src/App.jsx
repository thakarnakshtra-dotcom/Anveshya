import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ShootingStars from "./components/ShootingStars.jsx";
import BackgroundObjects from "./components/BackgroundObjects.jsx";
import CustomCursor from "./components/CustomCursor.jsx";
import FeedbackForm from "./components/FeedbackForm.jsx";
import { RingIntro, RingBadge, shouldPlayIntro } from "./components/RingSystem.jsx";
import { startReminderChecker } from "./utils/reminders.js";
import Home from "./pages/Home.jsx";
import Explorer from "./pages/Explorer.jsx";
import Learn from "./pages/Learn.jsx";
import SoundsOfSpace from "./pages/SoundsOfSpace.jsx";
import PlanetDetail from "./pages/PlanetDetail.jsx";
import SolarShield from "./pages/SolarShield.jsx";
import News from "./pages/News.jsx";
import About from "./pages/About.jsx";

function AppShell() {
  const location = useLocation();
  const [introPlaying, setIntroPlaying] = useState(() => location.pathname === "/" && shouldPlayIntro());
  const showBadge = !introPlaying && location.pathname !== "/explorer";
  const showShootingStars = location.pathname !== "/explorer";
  // Same Explorer exclusion as shooting stars — that page already has its
  // own 3D starfield/scene, another decorative layer behind it would just
  // be wasted paint the user never sees under the WebGL canvas.
  const showBackgroundObjects = location.pathname !== "/explorer";
  // Excluded on Explorer too — that page is driven by OrbitControls
  // drag-to-orbit interaction, where a trailing cursor effect would be a
  // distraction rather than a nice touch, matching the same exclusion
  // already applied to the shooting stars and ring badge on that page.
  const showCustomCursor = location.pathname !== "/explorer";

  // Polls localStorage-backed reminders and fires real browser
  // Notifications when due. Mounted once here (not per-page) so it keeps
  // working across SPA navigation for as long as this tab stays open —
  // there's no push backend, so it can't do more than that.
  useEffect(() => {
    return startReminderChecker();
  }, []);

  return (
    <>
      <Navbar />
      {showBackgroundObjects ? <BackgroundObjects /> : null}
      {showShootingStars ? <ShootingStars /> : null}
      {showCustomCursor ? <CustomCursor /> : null}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/sounds" element={<SoundsOfSpace />} />
        <Route path="/learn/:planetSlug" element={<PlanetDetail />} />
        <Route path="/solarshield" element={<SolarShield />} />
        <Route path="/news" element={<News />} />
        <Route path="/about" element={<About />} />
      </Routes>
      {showBadge ? <RingBadge /> : null}
      {introPlaying ? <RingIntro onComplete={() => setIntroPlaying(false)} /> : null}
      <FeedbackForm />
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

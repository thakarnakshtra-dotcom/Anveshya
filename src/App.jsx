import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { RingIntro, RingBadge, shouldPlayIntro } from "./components/RingSystem.jsx";
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

  return (
    <>
      <Navbar />
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

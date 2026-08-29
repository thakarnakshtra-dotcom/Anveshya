import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Explorer from "./pages/Explorer.jsx";
import Learn from "./pages/Learn.jsx";
import SoundsOfSpace from "./pages/SoundsOfSpace.jsx";
import PlanetDetail from "./pages/PlanetDetail.jsx";
import SolarShield from "./pages/SolarShield.jsx";
import News from "./pages/News.jsx";
import About from "./pages/About.jsx";

const INTRO_FLAG = "anveshya-intro-seen";

function computeIntroActive(pathname) {
  if (pathname !== "/") return false;
  try {
    if (sessionStorage.getItem(INTRO_FLAG)) return false;
    sessionStorage.setItem(INTRO_FLAG, "1");
    return true;
  } catch {
    return false;
  }
}

function AppShell() {
  const location = useLocation();
  const [introActive] = useState(() => computeIntroActive(location.pathname));

  return (
    <>
      <Navbar introActive={introActive} />
      <Routes>
        <Route path="/" element={<Home introActive={introActive} />} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/sounds" element={<SoundsOfSpace />} />
        <Route path="/learn/:planetSlug" element={<PlanetDetail />} />
        <Route path="/solarshield" element={<SolarShield />} />
        <Route path="/news" element={<News />} />
        <Route path="/about" element={<About />} />
      </Routes>
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

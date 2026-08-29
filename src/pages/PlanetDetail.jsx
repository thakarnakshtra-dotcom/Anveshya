import React from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { planets } from "../data/planets.js";

const wordContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.025 } },
};

const word = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function PlanetDetail() {
  const { planetSlug } = useParams();
  const index = planets.findIndex((p) => p.name.toLowerCase() === (planetSlug || "").toLowerCase());
  const planet = index >= 0 ? planets[index] : null;

  if (!planet) {
    return (
      <main className="home planet-detail">
        <div className="planet-detail-content">
          <div className="planet-detail-kicker">Learn</div>
          <h1 className="planet-detail-headline">Planet Not Found</h1>
          <p className="planet-detail-description">
            We don't have a page for "{planetSlug}" yet. <Link to="/learn">Back to Learn</Link>
          </p>
        </div>
      </main>
    );
  }

  const prevPlanet = planets[(index - 1 + planets.length) % planets.length];
  const nextPlanet = planets[(index + 1) % planets.length];
  const glow = planet.glow || planet.color;

  return (
    <main className="home planet-detail">
      <Link to={`/learn/${prevPlanet.name.toLowerCase()}`} className="planet-nav planet-nav-prev" aria-label={`Previous: ${prevPlanet.name}`}>
        <span className="planet-nav-arrow">&larr;</span>
        <span className="planet-nav-label">{prevPlanet.name}</span>
      </Link>
      <Link to={`/learn/${nextPlanet.name.toLowerCase()}`} className="planet-nav planet-nav-next" aria-label={`Next: ${nextPlanet.name}`}>
        <span className="planet-nav-label">{nextPlanet.name}</span>
        <span className="planet-nav-arrow">&rarr;</span>
      </Link>

      <div className="planet-detail-content">
        <motion.div
          className="planet-detail-kicker"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          Planet
        </motion.div>
        <motion.h1
          className="planet-detail-headline"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.1 }}
        >
          {planet.name}
        </motion.h1>
        <motion.p className="planet-detail-description" variants={wordContainer} initial="hidden" animate="visible">
          {planet.overview.split(" ").map((w, i) => (
            <motion.span key={i} variants={word} className="planet-detail-word">
              {w}
            </motion.span>
          ))}
        </motion.p>

        <motion.div
          className="planet-detail-imagery"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
        >
          <div className="planet-detail-glow" style={{ background: `radial-gradient(circle, ${glow}55, transparent 70%)` }} />
          <img src={planet.texture} alt={`${planet.name} surface imagery`} className="planet-detail-image" />
          <div className="planet-detail-shading" aria-hidden="true" />
        </motion.div>

        <Link to="/learn" className="planet-detail-back">
          &larr; Back to Learn
        </Link>
      </div>
    </main>
  );
}

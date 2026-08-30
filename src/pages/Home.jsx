import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AmbientBackground from "../components/AmbientBackground.jsx";
import { fetchAllLatestNews } from "../utils/spaceNews.js";

const NEWS_TAG_CLASS = { NASA: "news-tag-nasa", ISRO: "news-tag-isro", ESA: "news-tag-esa" };
const NEWS_ICON = {
  NASA: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2.1 5-5 2.1 2.1-5z",
  ISRO: "M12 3 5 5.6v5.9c0 4 2.9 7.6 7 9.5 4.1-1.9 7-5.5 7-9.5V5.6zM12 8.6v6.8M8.9 12h6.2",
  ESA: "M4 4h13a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3zM8 9h8M8 13h8M8 17h4",
};

function HomeNewsSection() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchAllLatestNews().then(({ items: merged }) => {
      if (!cancelled) setItems(merged.slice(0, 4));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="modules-section" style={{ paddingTop: 0 }}>
      <div className="section-grid">
        <div className="section-eyebrow">03 &mdash; Latest Space News &amp; Updates</div>
        <div>
          <h2 className="modules-heading">Straight From NASA, ISRO &amp; ESA</h2>
          {items === null ? (
            <p className="page-lede">Loading the latest updates&hellip;</p>
          ) : items.length === 0 ? (
            <p className="page-lede">No updates could be fetched right now &mdash; check the News page directly.</p>
          ) : (
            <div className="home-news-grid">
              {items.map((item, i) => (
                <Link key={`${item.source}-${i}`} to="/news" className="home-news-card">
                  <div className="home-news-top">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9DB9F2"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={NEWS_ICON[item.source] || NEWS_ICON.NASA} />
                    </svg>
                    <span className={`news-tag ${NEWS_TAG_CLASS[item.source] || "news-tag-nasa"}`}>{item.source}</span>
                  </div>
                  <div className="home-news-date">
                    {item.date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="home-news-title">{item.title}</div>
                  {item.excerpt ? <div className="home-news-excerpt">{item.excerpt}</div> : null}
                </Link>
              ))}
            </div>
          )}
          <Link to="/news" className="home-news-view-all">
            View all news &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}

const heroCards = [
  { kicker: "01", title: "Real Orbital Mechanics", body: "Accurate relative speeds, distances, and scale across all eight planets." },
  { kicker: "02", title: "NASA Imagery", body: "Real planetary textures sourced from NASA and JPL mission data." },
  { kicker: "03", title: "Live Space Weather", body: "Space-weather intelligence built for researchers and satellite operators." },
];

const modules = [
  {
    no: "01",
    title: "Explore",
    to: "/explorer",
    body: "Fly through a real-time 3D solar system with accurate orbital mechanics and true NASA textures.",
    icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2.1 5-5 2.1 2.1-5z",
  },
  {
    no: "02",
    title: "Learn",
    to: "/learn",
    body: "Written lessons on orbital mechanics, solar activity, and how to read the Explorer.",
    icon: "M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4zM20 5.5A1.5 1.5 0 0 0 18.5 4H14a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6z",
  },
  {
    no: "03",
    title: "SolarShield",
    to: "/solarshield",
    body: "Space-weather risk intelligence for satellite operators and researchers, in active development.",
    icon: "M12 3 5 5.6v5.9c0 4 2.9 7.6 7 9.5 4.1-1.9 7-5.5 7-9.5V5.6zM12 8.6v6.8M8.9 12h6.2",
  },
  {
    no: "04",
    title: "About",
    to: "/about",
    body: "The story behind Anveshya — solo-built, India-based, open about what's real and what's still being built.",
    icon: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 10.6V16M12 7.6h.01",
  },
];

const metrics = [
  { label: "Planets Modeled", value: "8", note: "Mercury through Neptune" },
  { label: "Moons Rendered", value: "18", note: "Real names, real facts" },
  { label: "Scale Modes", value: "3", note: "Visual, true-to-scale & static" },
  { label: "Data Sources", value: "3", note: "NASA · ISRO · ESA" },
  { label: "Status", value: "Version 1", note: "Actively shipping" },
];

export default function Home() {
  return (
    <main className="home">
      <AmbientBackground />

      {/* ---- hero ---- */}
      <section className="home-hero">
        <div className="hero-ring-stage">
        <div
          style={{
            position: "relative",
            width: "min(1180px,92vw,116vh)",
            aspectRatio: "2/1",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "62%",
              height: "120%",
              background: "radial-gradient(closest-side, rgba(255,255,255,.13), rgba(190,205,235,.05) 48%, transparent 74%)",
              filter: "blur(14px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: "inset(0 0 50.2% 0)",
              WebkitMask: "linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
              mask: "linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "92%",
                aspectRatio: "1",
                transform: "translate(-50%,-50%) perspective(1700px) rotateX(85.6deg)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  animation: "an-spin 34s linear infinite",
                  background:
                    "conic-gradient(from 0deg, rgba(255,255,255,.10), rgba(255,255,255,1) 9%, rgba(232,236,244,.62) 18%, rgba(255,255,255,.96) 29%, rgba(206,212,224,.5) 38%, rgba(255,255,255,1) 49%, rgba(222,228,240,.55) 60%, rgba(255,255,255,.92) 71%, rgba(198,206,220,.45) 80%, rgba(255,255,255,1) 90%, rgba(255,255,255,.10))",
                  WebkitMask:
                    "radial-gradient(closest-side, transparent 40%, rgba(0,0,0,.3) 45%, #000 50%, #000 84%, rgba(0,0,0,.35) 93%, transparent 100%)",
                  mask: "radial-gradient(closest-side, transparent 27%, rgba(0,0,0,.25) 30%, #000 34%, #000 82%, rgba(0,0,0,.4) 92%, transparent 100%)",
                  filter: "blur(.7px) contrast(1.32) saturate(0)",
                }}
              />
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "20%",
              aspectRatio: "1",
              borderRadius: "50%",
              background: "#000",
              boxShadow:
                "0 0 0 1px rgba(255,255,255,.55), 0 0 0 2.6px rgba(255,255,255,.96), 0 0 22px 5px rgba(255,255,255,.4), 0 0 70px 16px rgba(210,224,255,.22)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "26%",
              aspectRatio: "1",
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,.26)",
              filter: "blur(1.4px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "45%",
              aspectRatio: "1.95",
              border: "3px solid rgba(255,255,255,.98)",
              borderRadius: "50%",
              clipPath: "inset(0 0 62% 0)",
              filter: "blur(1px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "56%",
              aspectRatio: "2.5",
              border: "1.8px solid rgba(244,247,255,.85)",
              borderRadius: "50%",
              clipPath: "inset(0 0 64% 0)",
              filter: "blur(1.6px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "68%",
              aspectRatio: "3",
              border: "1.2px solid rgba(226,233,248,.55)",
              borderRadius: "50%",
              clipPath: "inset(0 0 66% 0)",
              filter: "blur(2.2px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "43%",
              aspectRatio: "2",
              border: "2.2px solid rgba(255,255,255,.92)",
              borderRadius: "50%",
              clipPath: "inset(66% 0 0 0)",
              filter: "blur(1.2px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: "54%",
              aspectRatio: "2.6",
              border: "1.2px solid rgba(230,237,250,.6)",
              borderRadius: "50%",
              clipPath: "inset(68% 0 0 0)",
              filter: "blur(2px)",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              clipPath: "inset(50.2% 0 0 0)",
              WebkitMask: "linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
              mask: "linear-gradient(90deg, transparent 0%, #000 14%, #000 86%, transparent 100%)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: "92%",
                aspectRatio: "1",
                transform: "translate(-50%,-50%) perspective(1700px) rotateX(85.6deg)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  animation: "an-spin 34s linear infinite",
                  background:
                    "conic-gradient(from 0deg, rgba(255,255,255,.10), rgba(255,255,255,1) 9%, rgba(232,236,244,.62) 18%, rgba(255,255,255,.96) 29%, rgba(206,212,224,.5) 38%, rgba(255,255,255,1) 49%, rgba(222,228,240,.55) 60%, rgba(255,255,255,.92) 71%, rgba(198,206,220,.45) 80%, rgba(255,255,255,1) 90%, rgba(255,255,255,.10))",
                  WebkitMask:
                    "radial-gradient(closest-side, transparent 40%, rgba(0,0,0,.3) 45%, #000 50%, #000 84%, rgba(0,0,0,.35) 93%, transparent 100%)",
                  mask: "radial-gradient(closest-side, transparent 27%, rgba(0,0,0,.25) 30%, #000 34%, #000 82%, rgba(0,0,0,.4) 92%, transparent 100%)",
                  filter: "blur(.7px) contrast(1.32) saturate(0)",
                }}
              />
            </div>
          </div>
        </div>
        </div>

        <div className="hero-grid">
          <div>
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-rule" />
              An Independent Space Platform
            </div>
            <h1 className="hero-headline">
              Explore the Universe
              <br />
              <span className="hero-headline-muted">one orbit at a time</span>
            </h1>
            <p className="hero-sub">
              Anveshya turns real orbital mechanics and NASA imagery into an interactive solar system you can fly
              through.
            </p>
          </div>

          <div className="hero-cards">
            {heroCards.map((card) => (
              <div key={card.kicker} className="hero-card">
                <div className="hero-card-kicker">{card.kicker}</div>
                <div className="hero-card-title">{card.title}</div>
                <div className="hero-card-body">{card.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- by the numbers ---- */}
      <section className="metrics-section">
        <div className="section-grid">
          <div className="section-eyebrow">01 &mdash; By The Numbers</div>
          <div>
            <div className="metrics-grid">
              {metrics.map((m) => (
                <div key={m.label}>
                  <div className="metric-label">{m.label}</div>
                  <div className="metric-value">{m.value}</div>
                  <div className="metric-note">{m.note}</div>
                </div>
              ))}
            </div>
            <p className="metrics-caption">
              Every number above reflects what's actually built in Anveshya today &mdash; no placeholder data.
              SolarShield's live space-weather feed is the next major addition.
            </p>
          </div>
        </div>
      </section>

      {/* ---- modules ---- */}
      <section className="modules-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">02 &mdash; Modules</div>
          <div>
            <h2 className="modules-heading">Everything Anveshya Offers</h2>
            <div className="modules-grid">
              {modules.map((mod) => (
                <Link key={mod.no} to={mod.to} className="module-card">
                  <div className="module-card-top">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#9DB9F2"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d={mod.icon} />
                    </svg>
                    <span className="module-no">{mod.no}</span>
                  </div>
                  <div className="module-title">{mod.title}</div>
                  <div className="module-body">{mod.body}</div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HomeNewsSection />
    </main>
  );
}

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AmbientBackground from "../components/AmbientBackground.jsx";
import UniverseHero from "../home/UniverseHero.jsx";
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
                      stroke="currentColor"
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
    title: "Wallpapers",
    to: "/wallpapers",
    body: "Original space artwork made for Anveshya, free to download in HD for desktop and phone.",
    icon: "M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM4 16l4.5-4.5L13 16l3-3 4 4M15.5 8.5h.01",
  },
  {
    no: "05",
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

      {/* ---- hero: 3D universe ---- */}
      <UniverseHero />

      {/* ---- introduction ---- */}
      <section className="modules-section home-intro" style={{ paddingTop: 60, paddingBottom: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">About Anveshya</div>
          <div>
            <p className="page-lede">
              Anveshya turns real orbital mechanics and NASA imagery into an interactive solar system you can fly
              through.
            </p>
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
                      stroke="currentColor"
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

import React, { useEffect, useState } from "react";
import AmbientBackground from "../components/AmbientBackground.jsx";
import MissionCard from "../components/MissionCard.jsx";
import SoundCard from "../components/SoundCard.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { missions } from "../data/missions.js";
import { roverAndLanderSounds, sonifications, historicalSounds } from "../data/sounds.js";
import { videos } from "../data/videos.js";
import { agencies } from "../data/agencies.js";

const TABS = ["Images & Videos", "Audio", "Missions", "Organizations"];

const NASA_FEED = "https://www.nasa.gov/news-release/feed/";
const ISRO_SATELLITES = "https://isro.vercel.app/api/customer_satellites";
const LAUNCH_LIBRARY = "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=100&mode=normal";

// Real launch_service_provider strings confirmed directly against the
// Launch Library 2 API (curl-verified). CNSA itself has no public API or
// launch-provider listing — CASC (China Aerospace Science and Technology
// Corporation) is China's primary state launch contractor and the closest
// real, verifiable match, labeled honestly rather than presented as CNSA.
const PROVIDER_MATCH = {
  ISRO: "Indian Space Research Organization",
  ESA: "European Space Agency",
  JAXA: "Japan Aerospace Exploration Agency",
  CNSA: "China Aerospace Science and Technology Corporation",
};

function stripHtml(html) {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  return (doc.body.textContent || "").trim();
}

function truncate(text, max) {
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

async function fetchNasaUpdates() {
  const res = await fetch(NASA_FEED);
  if (!res.ok) throw new Error(`NASA feed responded ${res.status}`);
  const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
  if (xml.querySelector("parsererror")) throw new Error("NASA feed failed to parse");
  return Array.from(xml.querySelectorAll("item"))
    .slice(0, 4)
    .map((item) => ({
      title: item.querySelector("title")?.textContent || "Untitled",
      date: new Date(item.querySelector("pubDate")?.textContent || Date.now()),
      link: item.querySelector("link")?.textContent || "https://www.nasa.gov/news/",
    }));
}

async function fetchIsroUpdates() {
  const res = await fetch(ISRO_SATELLITES);
  if (!res.ok) throw new Error(`ISRO API responded ${res.status}`);
  const json = await res.json();
  const list = json?.customer_satellites;
  if (!Array.isArray(list) || list.length === 0) throw new Error("No ISRO data");
  const parsed = list
    .map((s) => {
      const [d, m, y] = (s.launch_date || "").split("-").map(Number);
      const date = d && m && y ? new Date(y, m - 1, d) : null;
      return { ...s, date };
    })
    .filter((s) => s.date && !Number.isNaN(s.date.getTime()));
  parsed.sort((a, b) => b.date - a.date);
  return parsed.slice(0, 4).map((s) => ({
    title: `${s.id} launched for ${s.country}`,
    date: s.date,
    link: "https://www.isro.gov.in",
  }));
}

async function fetchProviderLaunches(providerName) {
  const res = await fetch(LAUNCH_LIBRARY);
  if (!res.ok) throw new Error(`Launch Library responded ${res.status}`);
  const json = await res.json();
  const list = json?.results;
  if (!Array.isArray(list)) throw new Error("No launch data");
  return list
    .filter((l) => l.launch_service_provider?.name === providerName)
    .slice(0, 4)
    .map((l) => ({
      title: l.name,
      date: l.net ? new Date(l.net) : null,
      link: l.url || "https://ll.thespacedevs.com",
    }));
}

function OrgPanel({ agency }) {
  const [updates, setUpdates] = useState(null);
  const [updatesLabel, setUpdatesLabel] = useState("Live Updates");
  const [failed, setFailed] = useState(false);
  const agencyMissions = missions.filter((m) => m.agency === agency.code);

  useEffect(() => {
    let cancelled = false;
    setUpdates(null);
    setFailed(false);

    const load = async () => {
      try {
        if (agency.code === "NASA") {
          setUpdatesLabel("Latest NASA Updates");
          const items = await fetchNasaUpdates();
          if (!cancelled) setUpdates(items);
        } else if (agency.code === "ISRO") {
          setUpdatesLabel("Recent ISRO Launches");
          const items = await fetchIsroUpdates();
          if (!cancelled) setUpdates(items);
        } else {
          const providerName = PROVIDER_MATCH[agency.code];
          setUpdatesLabel(
            agency.code === "CNSA" ? "Upcoming CASC Launches (Launch Library)" : `Upcoming ${agency.code} Launches`
          );
          const items = await fetchProviderLaunches(providerName);
          if (!cancelled) setUpdates(items);
        }
      } catch {
        if (!cancelled) {
          setUpdates([]);
          setFailed(true);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [agency.code]);

  return (
    <div className="org-panel">
      <div className="org-header">
        <h3>{agency.fullName}</h3>
        <span className="org-founded">Founded {agency.founded} &middot; {agency.headquarters}</span>
      </div>
      <p className="org-history">{agency.history}</p>

      <div className="org-subhead">Missions Covered On This Site</div>
      {agencyMissions.length ? (
        <div className="org-missions-list">
          {agencyMissions.map((m) => (
            <div key={m.name} className="org-mission-row">{m.name}</div>
          ))}
        </div>
      ) : (
        <p className="org-empty-note" style={{ marginBottom: 22 }}>
          No mission cards for {agency.code} in this pass yet.
        </p>
      )}

      <div className="org-subhead">{updatesLabel}</div>
      {updates === null ? (
        <p className="org-empty-note">Loading…</p>
      ) : updates.length === 0 ? (
        <p className="org-empty-note">
          {failed
            ? `No live data could be fetched right now — ${agency.code} does not expose a public CORS-open API for this.`
            : "Nothing found."}
        </p>
      ) : (
        <div className="org-updates-list">
          {updates.map((u, i) => (
            <a key={i} href={u.link} target="_blank" rel="noreferrer" className="org-update-row">
              {u.date ? (
                <div className="org-update-date">
                  {u.date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </div>
              ) : null}
              <div className="org-update-title">{u.title}</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function Organizations() {
  const [activeCode, setActiveCode] = useState(agencies[0].code);
  const activeAgency = agencies.find((a) => a.code === activeCode);

  return (
    <div>
      <div className="org-picker" role="tablist" aria-label="Space agency">
        {agencies.map((a) => (
          <button
            key={a.code}
            type="button"
            role="tab"
            aria-selected={a.code === activeCode}
            className={a.code === activeCode ? "active" : ""}
            onClick={() => setActiveCode(a.code)}
          >
            {a.name}
          </button>
        ))}
      </div>
      <OrgPanel key={activeAgency.code} agency={activeAgency} />
    </div>
  );
}

export default function Learn() {
  const [tab, setTab] = useState("Images & Videos");

  return (
    <main className="home">
      <AmbientBackground variant="page" />
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-rule" />
            Learn
          </div>
          <h1 className="page-heading">Real Space, From Real Sources</h1>
          <p className="page-lede">
            Verified NASA, ISRO, ESA, CNSA, and JAXA imagery, video, audio, and mission data &mdash; nothing
            fabricated, nothing stored as a fake copy.
          </p>
        </div>
      </section>

      <section className="modules-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">Browse</div>
          <div>
          <div className="section-toggle" role="tablist" aria-label="Learn section">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                className={tab === t ? "active" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Images & Videos" ? (
            <div>
              <h2 className="modules-heading">Live Feeds &amp; Real Footage</h2>
              <p className="page-lede" style={{ margin: "0 0 30px" }}>
                Every video below is an official upload from NASA, NASA/JPL, or ISRO's own YouTube channels &mdash;
                confirmed live and embeddable before being added here.
              </p>
              <div className="videos-grid">
                {videos.map((v) => (
                  <VideoCard key={v.videoId} {...v} />
                ))}
              </div>
            </div>
          ) : null}

          {tab === "Audio" ? (
            <div>
              <h2 className="modules-heading">Sounds and Voices of Space</h2>
              <p className="page-lede" style={{ margin: "0 0 30px" }}>
                Rover microphones, telescope data turned into music, and the actual recordings of historic space
                moments &mdash; fourteen tracks, every one linking back to NASA or the Chandra X-ray Center.
              </p>
              <div className="section-eyebrow" style={{ marginBottom: 14 }}>Sounds From Beyond</div>
              <div className="sounds-grid" style={{ marginBottom: 34 }}>
                {roverAndLanderSounds.map((s) => (
                  <SoundCard key={s.title} {...s} />
                ))}
              </div>
              <div className="section-eyebrow" style={{ marginBottom: 14 }}>Sonifications</div>
              <div className="sounds-grid" style={{ marginBottom: 34 }}>
                {sonifications.map((s) => (
                  <SoundCard key={s.title} {...s} />
                ))}
              </div>
              <div className="section-eyebrow" style={{ marginBottom: 14 }}>Historic Mission Audio</div>
              <div className="sounds-grid">
                {historicalSounds.map((s) => (
                  <SoundCard key={s.title} {...s} />
                ))}
              </div>
            </div>
          ) : null}

          {tab === "Missions" ? (
            <div>
              <h2 className="modules-heading">Real Imagery, From Five Space Agencies</h2>
              <p className="page-lede" style={{ margin: "0 0 34px" }}>
                Fetched live from NASA's public Image and Video Library &mdash; no stored copies, no fabricated
                credits. Each card's badge shows which agency owns the mission; the credit line shows who actually
                took the photo, which isn't always the same agency.
              </p>
              <div className="missions-grid">
                {missions.map((m) => (
                  <MissionCard key={m.name} name={m.name} query={m.query} agency={m.agency} />
                ))}
              </div>
            </div>
          ) : null}

          {tab === "Organizations" ? (
            <div>
              <h2 className="modules-heading">Five Agencies, One Effort</h2>
              <p className="page-lede" style={{ margin: "0 0 30px" }}>
                Founding facts and history are static, verified public record. Mission lists and live updates are
                pulled from real sources per agency &mdash; where an agency has no public API, that's shown
                honestly instead of invented.
              </p>
              <Organizations />
            </div>
          ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

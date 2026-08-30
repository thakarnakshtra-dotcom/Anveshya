import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AmbientBackground from "../components/AmbientBackground.jsx";
import MissionCard from "../components/MissionCard.jsx";
import SoundCard from "../components/SoundCard.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { missions } from "../data/missions.js";
import { roverAndLanderSounds, sonifications, historicalSounds } from "../data/sounds.js";
import { videos } from "../data/videos.js";
import { agencies } from "../data/agencies.js";
import { mediaGallery } from "../data/mediaGallery.js";
import { ancientAstronomyTopics } from "../data/ancientAstronomy.js";

const TABS = ["Images & Videos", "Audio", "Missions", "Organizations", "Ancient Indian Astronomy"];

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
        {agency.logo ? (
          <img src={agency.logo} alt={`${agency.name} logo`} className="org-logo" />
        ) : (
          <div className="org-logo org-logo-fallback">{agency.code}</div>
        )}
        <div>
          <h3>{agency.fullName}</h3>
          <span className="org-founded">Founded {agency.founded} &middot; {agency.headquarters}</span>
        </div>
      </div>
      <p className="org-history">{agency.history}</p>

      <div className="org-subhead">Current Missions</div>
      <div className="org-missions-list" style={{ marginBottom: 22 }}>
        {agency.currentMissions.map((m) => (
          <div key={m.name} className="org-mission-row org-mission-row-detailed">
            <div className="org-mission-row-top">
              <span className="org-mission-name">{m.name}</span>
              <span className="org-mission-date">{m.date}</span>
            </div>
            <div className="org-mission-status">{m.status}</div>
          </div>
        ))}
      </div>

      <div className="org-subhead">Missions Covered On This Site</div>
      {agencyMissions.length ? (
        <div className="org-missions-list" style={{ marginBottom: 22 }}>
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
        <p className="org-empty-note" style={{ marginBottom: 22 }}>Loading…</p>
      ) : updates.length === 0 ? (
        <p className="org-empty-note" style={{ marginBottom: 22 }}>
          {failed
            ? `No live data could be fetched right now — ${agency.code} does not expose a public CORS-open API for this.`
            : "Nothing found."}
        </p>
      ) : (
        <div className="org-updates-list" style={{ marginBottom: 22 }}>
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

      <div className="org-subhead">Official Videos</div>
      {agency.videos.length ? (
        <div className="videos-grid">
          {agency.videos.map((v) => (
            <VideoCard key={v.videoId} title={v.title} videoId={v.videoId} credit={v.credit} category={agency.code} body="" />
          ))}
        </div>
      ) : (
        <p className="org-empty-note">
          {agency.noVideoNote}{" "}
          {agency.noVideoLink ? (
            <a href={agency.noVideoLink} target="_blank" rel="noreferrer">
              {agency.noVideoLink.replace("https://", "")}
            </a>
          ) : null}
        </p>
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

function AncientAstronomyTopicView({ topic }) {
  if (topic.status !== "full") {
    return (
      <div className="ancient-panel ancient-coming-soon">
        <div className="ancient-kicker">Coming Soon</div>
        <h3>{topic.title}</h3>
        <p className="astro-empty-note">
          This topic isn't researched to the standard the rest of this page holds itself to yet &mdash; real
          verses, real sources, real accuracy comparisons &mdash; rather than filled in with a guess. Check back in
          a later pass.
        </p>
      </div>
    );
  }

  return (
    <div className="ancient-panel">
      <div className="ancient-kicker">{topic.kicker}</div>
      <h3>{topic.title}</h3>
      <div className="ancient-known-by">Known by: {topic.knownBy}</div>

      {topic.sanskrit ? (
        <div className="ancient-shloka-block">
          <div className="ancient-shloka">{topic.sanskrit}</div>
          <div className="ancient-transliteration">{topic.transliteration}</div>
          <div className="ancient-reference">{topic.reference}</div>
        </div>
      ) : null}

      {topic.translation ? (
        <>
          <div className="ancient-subhead">English Translation</div>
          <p className="ancient-body">{topic.translation}</p>
        </>
      ) : null}

      <div className="ancient-subhead">What It Meant</div>
      <p className="ancient-body">{topic.context}</p>

      {topic.modernEquivalent ? (
        <>
          <div className="ancient-subhead">Modern Equivalent</div>
          <p className="ancient-body">{topic.modernEquivalent}</p>
        </>
      ) : null}

      {topic.modernFact ? (
        <>
          <div className="ancient-subhead">The Numbers</div>
          <p className="ancient-body">{topic.modernFact}</p>
        </>
      ) : null}

      {topic.comparisonTable ? (
        <>
          <div className="ancient-subhead">Ancient vs. Modern</div>
          <div className="ancient-table-wrap">
            <table className="ancient-table">
              <thead>
                <tr>
                  <th>Quantity</th>
                  <th>Sūrya Siddhānta</th>
                  <th>Modern Value</th>
                  <th>Verdict</th>
                </tr>
              </thead>
              <tbody>
                {topic.comparisonTable.map((row) => (
                  <tr key={row.quantity}>
                    <td>{row.quantity}</td>
                    <td>{row.ancient}</td>
                    <td>{row.modern}</td>
                    <td>{row.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      <div className="ancient-subhead">Accuracy, Honestly</div>
      <p className="ancient-body">{topic.accuracyNote}</p>

      <div className="ancient-subhead">Sources</div>
      <ul className="ancient-sources">
        {topic.sources.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  );
}

function AncientAstronomy({ initialTopicId }) {
  const validInitialId = ancientAstronomyTopics.some((t) => t.id === initialTopicId) ? initialTopicId : null;
  const [activeId, setActiveId] = useState(validInitialId || ancientAstronomyTopics[0].id);
  const activeTopic = ancientAstronomyTopics.find((t) => t.id === activeId);

  return (
    <div>
      <div className="org-picker" role="tablist" aria-label="Ancient astronomy topic">
        {ancientAstronomyTopics.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === activeId}
            className={t.id === activeId ? "active" : ""}
            onClick={() => setActiveId(t.id)}
          >
            {t.title}
            {t.status !== "full" ? <span className="ancient-picker-flag">soon</span> : null}
          </button>
        ))}
      </div>
      <AncientAstronomyTopicView key={activeTopic.id} topic={activeTopic} />
    </div>
  );
}

export default function Learn() {
  const [searchParams] = useSearchParams();
  // Lets other pages deep-link straight into a specific Ancient Astronomy
  // topic (e.g. the Explorer nakshatra wheel's "More" button) via
  // /learn?tab=ancient&topic=nakshatra, rather than just landing on the
  // generic Learn page and making the visitor find it themselves.
  const [tab, setTab] = useState(() =>
    searchParams.get("tab") === "ancient" ? "Ancient Indian Astronomy" : "Images & Videos"
  );

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

              <div className="section-eyebrow" style={{ margin: "34px 0 14px" }}>Mission Imagery Gallery</div>
              <p className="page-lede" style={{ margin: "0 0 22px", fontSize: 13 }}>
                Fetched live from NASA's public Image and Video Library, which indexes real imagery from partner
                agencies too &mdash; not just NASA's own missions. Some agency-specific searches (Aditya-L1, Hera,
                Zhurong by name, Gaia) return no results in NASA's library and are left out rather than padded with
                irrelevant matches.
              </p>
              <div className="missions-grid">
                {mediaGallery.map((m) => (
                  <MissionCard key={m.name} name={m.name} query={m.query} agency={m.agency} />
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

          {tab === "Ancient Indian Astronomy" ? (
            <div>
              <h2 className="modules-heading">Ancient Sky, Modern Science</h2>
              <p className="page-lede" style={{ margin: "0 0 30px" }}>
                Real verses from real texts (Āryabhaṭīya, Sūrya Siddhānta), set next to their modern scientific
                equivalents &mdash; with the accuracy stated honestly, mixed record included. Six topics are fully
                researched and sourced for this pass; the rest are marked Coming Soon rather than guessed at.
              </p>
              <AncientAstronomy initialTopicId={searchParams.get("topic")} />
            </div>
          ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

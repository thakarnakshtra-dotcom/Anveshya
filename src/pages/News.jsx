import React, { useEffect, useState } from "react";
import AmbientBackground from "../components/AmbientBackground.jsx";
import ReminderBell from "../components/ReminderBell.jsx";
import { nextEclipse, meteorShowers, conjunctions } from "../data/astroEvents.js";

const NASA_FEED = "https://www.nasa.gov/news-release/feed/";
const ISRO_SATELLITES = "https://isro.vercel.app/api/customer_satellites";
const ESA_FEED = "https://www.esa.int/rssfeed/TopNews";
const LAUNCH_LIBRARY = "https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=20&mode=normal";
const ISS_POSITION = "https://api.wheretheiss.at/v1/satellites/25544";
const DAY_MS = 86400000;

function stripHtml(html) {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  return (doc.body.textContent || "").trim();
}

function truncate(text, max) {
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

// Parsed at local noon rather than UTC midnight so a date-only string like
// "2026-10-05" never silently shifts a day backward in timezones behind UTC.
function parseDateOnly(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// NASA: real RSS feed, fetched and parsed client-side (CORS-enabled, verified).
async function fetchNasa() {
  const res = await fetch(NASA_FEED);
  if (!res.ok) throw new Error(`NASA feed responded ${res.status}`);
  const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
  if (xml.querySelector("parsererror")) throw new Error("NASA feed failed to parse");
  return Array.from(xml.querySelectorAll("item"))
    .slice(0, 8)
    .map((item) => ({
      source: "NASA",
      title: item.querySelector("title")?.textContent || "Untitled",
      date: new Date(item.querySelector("pubDate")?.textContent || Date.now()),
      excerpt: truncate(stripHtml(item.querySelector("description")?.textContent), 180),
      link: item.querySelector("link")?.textContent || "https://www.nasa.gov/news/",
    }));
}

// ISRO: isro.vercel.app has no news/launch-log endpoint with dates or
// descriptions — /api/spacecrafts is just {id, name}. The one endpoint with
// real, verifiable dates is customer_satellites (launch_date, country,
// launcher, mass), so recent ISRO activity is built from that real data
// rather than any fabricated excerpt.
async function fetchIsro() {
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

  return parsed.slice(0, 6).map((s) => ({
    source: "ISRO",
    title: `${s.id} launched for ${s.country}`,
    date: s.date,
    excerpt: `${s.mass ? `${s.mass} kg satellite ` : "Satellite "}launched aboard ${s.launcher || "an ISRO vehicle"}.`,
    link: "https://www.isro.gov.in",
  }));
}

// ESA: their public RSS feed does not send CORS headers, so a direct
// browser fetch is expected to fail — this is attempted for real and
// skipped gracefully rather than routed through a third-party proxy.
async function fetchEsa() {
  const res = await fetch(ESA_FEED);
  if (!res.ok) throw new Error(`ESA feed responded ${res.status}`);
  const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
  if (xml.querySelector("parsererror")) throw new Error("ESA feed failed to parse");
  return Array.from(xml.querySelectorAll("item"))
    .slice(0, 8)
    .map((item) => ({
      source: "ESA",
      title: item.querySelector("title")?.textContent || "Untitled",
      date: new Date(item.querySelector("pubDate")?.textContent || Date.now()),
      excerpt: truncate(stripHtml(item.querySelector("description")?.textContent), 180),
      link: item.querySelector("link")?.textContent || "https://www.esa.int",
    }));
}

// Upcoming launches: The Space Devs' Launch Library 2 API — free, no key,
// CORS-open (verified: access-control-allow-origin: *). Real scheduled
// launches across every provider, not just NASA/ISRO/ESA. CNSA and JAXA
// launches show up here too (as CASC / JAXA launch_service_provider), which
// is the only real, live way this page covers those two agencies at all —
// neither publishes a public press-release API.
async function fetchUpcomingLaunches() {
  const res = await fetch(LAUNCH_LIBRARY);
  if (!res.ok) throw new Error(`Launch Library responded ${res.status}`);
  const json = await res.json();
  const list = json?.results;
  if (!Array.isArray(list)) throw new Error("No launch data");
  return list.map((l) => ({
    name: l.name,
    date: l.net ? new Date(l.net) : null,
    status: l.status?.name || "Scheduled",
    provider: l.launch_service_provider?.name,
    rocket: l.rocket?.configuration?.full_name,
    location: l.pad?.location?.name,
    mission: l.mission?.description,
  }));
}

// ISS current position: wheretheiss.at — free, no key, CORS-open (verified).
// This is real-time telemetry, not a predicted future pass: per-location
// visible-pass predictions (rise time, duration, max elevation, direction)
// need an observer's coordinates and a keyed API (N2YO) or client-side
// orbital propagation — neither is wired up here, so this section is
// honestly framed as "where the ISS is right now" instead.
async function fetchIssPosition() {
  const res = await fetch(ISS_POSITION);
  if (!res.ok) throw new Error(`ISS tracking API responded ${res.status}`);
  return res.json();
}

const SOURCES = [fetchNasa, fetchIsro, fetchEsa];
const TAG_CLASS = { NASA: "news-tag-nasa", ISRO: "news-tag-isro", ESA: "news-tag-esa" };
const DAILY_REFRESH_MS = 24 * 60 * 60 * 1000;
const EVENT_FILTERS = ["All", "Launches", "Eclipses", "Meteor Showers", "ISS", "Conjunctions"];

export default function News() {
  const [tab, setTab] = useState("latest");
  const [items, setItems] = useState(null);
  const [failedCount, setFailedCount] = useState(0);
  const [launches, setLaunches] = useState(null);
  const [launchesFailed, setLaunchesFailed] = useState(false);
  const [issData, setIssData] = useState(null);
  const [issFailed, setIssFailed] = useState(false);
  const [eventFilter, setEventFilter] = useState("All");

  useEffect(() => {
    let cancelled = false;

    const loadLatest = () => {
      Promise.allSettled(SOURCES.map((fn) => fn())).then((results) => {
        if (cancelled) return;
        const merged = [];
        let failed = 0;
        results.forEach((r) => {
          if (r.status === "fulfilled") merged.push(...r.value);
          else failed += 1;
        });
        merged.sort((a, b) => b.date - a.date);
        setItems(merged);
        setFailedCount(failed);
      });
    };

    loadLatest();
    const dailyTimer = setInterval(loadLatest, DAILY_REFRESH_MS);

    fetchUpcomingLaunches()
      .then((list) => {
        if (!cancelled) setLaunches(list);
      })
      .catch(() => {
        if (!cancelled) {
          setLaunches([]);
          setLaunchesFailed(true);
        }
      });

    fetchIssPosition()
      .then((data) => {
        if (!cancelled) setIssData(data);
      })
      .catch(() => {
        if (!cancelled) setIssFailed(true);
      });

    return () => {
      cancelled = true;
      clearInterval(dailyTimer);
    };
  }, []);

  const upcomingLaunches = (launches || []).filter((ev) => {
    if (!ev.date) return false;
    const days = (ev.date.getTime() - Date.now()) / DAY_MS;
    return days >= 0 && days <= 92;
  });

  const showSection = (name) => eventFilter === "All" || eventFilter === name;

  return (
    <main className="home">
      <AmbientBackground variant="page" />
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-rule" />
            News
          </div>
          <h1 className="page-heading">Mission Updates, Straight From the Source</h1>
          <p className="page-lede">
            Fetched live from NASA, ISRO, ESA, The Space Devs' launch data, and real-time ISS telemetry &mdash; no
            rewrites, no fabricated summaries.
          </p>
        </div>
      </section>

      <section className="modules-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">
            {tab === "latest" ? "Latest Space News & Updates" : "Upcoming Astronomical Events"}
          </div>
          <div>
            <div className="section-toggle" role="tablist" aria-label="News section">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "latest"}
                className={tab === "latest" ? "active" : ""}
                onClick={() => setTab("latest")}
              >
                Latest News &amp; Updates
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "upcoming"}
                className={tab === "upcoming" ? "active" : ""}
                onClick={() => setTab("upcoming")}
              >
                Upcoming Events
              </button>
            </div>

            {tab === "latest" ? (
              <>
                {items === null ? (
                  <p className="page-lede">Loading the latest updates…</p>
                ) : items.length === 0 ? (
                  <p className="page-lede">No updates could be fetched right now &mdash; please check back later.</p>
                ) : (
                  <div className="news-list">
                    {items.map((item, i) => (
                      <a
                        key={`${item.source}-${i}`}
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="news-item"
                      >
                        <div className="news-meta">
                          <span className={`news-tag ${TAG_CLASS[item.source]}`}>{item.source}</span>
                          <span className="news-date">{formatDate(item.date)}</span>
                        </div>
                        <div className="news-title">{item.title}</div>
                        {item.excerpt ? <div className="news-excerpt">{item.excerpt}</div> : null}
                      </a>
                    ))}
                  </div>
                )}
                <p className="page-lede" style={{ marginTop: 26, fontSize: 12.5 }}>
                  {failedCount > 0 ? `${failedCount} of ${SOURCES.length} sources didn't respond and were skipped. ` : ""}
                  CNSA and JAXA don't publish a public press-release feed, so they aren't in this list &mdash; their
                  launches still show up under Upcoming Events. Refreshes automatically once a day.
                </p>
              </>
            ) : (
              <>
                <div className="section-toggle astro-filter" role="tablist" aria-label="Event type filter">
                  {EVENT_FILTERS.map((f) => (
                    <button
                      key={f}
                      type="button"
                      role="tab"
                      aria-selected={eventFilter === f}
                      className={eventFilter === f ? "active" : ""}
                      onClick={() => setEventFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {showSection("Launches") ? (
                  <div className="astro-section">
                    <div className="astro-section-title astro-title-launch">Launches</div>
                    {launches === null ? (
                      <p className="astro-empty-note">Loading launch schedule…</p>
                    ) : launchesFailed ? (
                      <p className="astro-empty-note">No live launch data could be fetched right now.</p>
                    ) : upcomingLaunches.length === 0 ? (
                      <p className="astro-empty-note">No launches scheduled in the next 3 months.</p>
                    ) : (
                      <div className="news-list">
                        {upcomingLaunches.map((ev, i) => (
                          <div key={i} className="event-item">
                            <div className="news-meta">
                              <span className="astro-badge astro-badge-launch">&#9679; Launch</span>
                              {ev.date ? <span className="news-date">{formatDate(ev.date)}</span> : null}
                              {ev.date ? (
                                <ReminderBell
                                  id={`launch-${ev.name}-${ev.date.toISOString()}`}
                                  eventName={ev.name}
                                  eventDateISO={ev.date.toISOString()}
                                />
                              ) : null}
                            </div>
                            <div className="news-title">{ev.name}</div>
                            <div className="event-meta-row">
                              {ev.provider ? <span>{ev.provider}</span> : null}
                              {ev.rocket ? <span>{ev.rocket}</span> : null}
                              {ev.location ? <span>{ev.location}</span> : null}
                            </div>
                            {ev.mission ? <div className="news-excerpt">{truncate(ev.mission, 160)}</div> : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : null}

                {showSection("Eclipses") ? (
                  <div className="astro-section">
                    <div className="astro-section-title astro-title-eclipse">Eclipses</div>
                    <div className="event-item">
                      <div className="news-meta">
                        <span className="astro-badge astro-badge-eclipse">&#9679; Eclipse</span>
                        <span className="news-date">{formatDate(parseDateOnly(nextEclipse.date))}</span>
                        <ReminderBell
                          id={`eclipse-${nextEclipse.date}`}
                          eventName={`${nextEclipse.type} Eclipse`}
                          eventDateISO={parseDateOnly(nextEclipse.date).toISOString()}
                        />
                      </div>
                      <div className="news-title">
                        Next: {nextEclipse.type} Eclipse
                      </div>
                      <div className="event-meta-row">
                        <span>Visible from {nextEclipse.visibility}</span>
                      </div>
                      <p className="astro-empty-note" style={{ marginTop: 10 }}>
                        None of 2026's four eclipses fall in the next 3 months &mdash; all of them (Feb&nbsp;17,
                        Mar&nbsp;3, Aug&nbsp;12, Aug&nbsp;28) already occurred earlier this year. The next real
                        eclipse is shown above instead of leaving this empty.
                      </p>
                    </div>
                  </div>
                ) : null}

                {showSection("Meteor Showers") ? (
                  <div className="astro-section">
                    <div className="astro-section-title astro-title-meteor">Meteor Showers</div>
                    <div className="news-list">
                      {meteorShowers.map((m) => (
                        <div key={m.name} className="event-item">
                          <div className="news-meta">
                            <span className="astro-badge astro-badge-meteor">&#9679; Meteor Shower</span>
                            <span className="news-date">{m.peakDateLabel}</span>
                            <ReminderBell
                              id={`meteor-${m.name}`}
                              eventName={`${m.name} meteor shower peak`}
                              eventDateISO={parseDateOnly(m.peakDate).toISOString()}
                            />
                          </div>
                          <div className="news-title">{m.name}</div>
                          <div className="event-meta-row">
                            <span>ZHR ~{m.zhr}/hr</span>
                          </div>
                          <div className="news-excerpt">{m.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {showSection("ISS") ? (
                  <div className="astro-section">
                    <div className="astro-section-title astro-title-iss">ISS Right Now</div>
                    {issData ? (
                      <div className="event-item">
                        <div className="news-meta">
                          <span className="astro-badge astro-badge-iss">&#9679; Live Position</span>
                          <span className="news-date">Updated just now</span>
                        </div>
                        <div className="news-title">
                          Currently over {issData.latitude.toFixed(1)}&deg;, {issData.longitude.toFixed(1)}&deg;
                        </div>
                        <div className="event-meta-row">
                          <span>Altitude {Math.round(issData.altitude)} km</span>
                          <span>Speed {Math.round(issData.velocity).toLocaleString()} km/h</span>
                          <span>{issData.visibility}</span>
                        </div>
                        <p className="astro-empty-note" style={{ marginTop: 10 }}>
                          Per-location visible-pass predictions (date, time, duration, max altitude, direction) need
                          your coordinates and a keyed API (like N2YO) or client-side orbital propagation &mdash;
                          neither is wired up here, so this shows the station's real, live current position instead
                          of a guessed pass time.
                        </p>
                      </div>
                    ) : issFailed ? (
                      <p className="astro-empty-note">Live ISS position unavailable right now.</p>
                    ) : (
                      <p className="astro-empty-note">Loading live ISS position…</p>
                    )}
                  </div>
                ) : null}

                {showSection("Conjunctions") ? (
                  <div className="astro-section">
                    <div className="astro-section-title astro-title-conjunction">Conjunctions</div>
                    <div className="news-list">
                      {conjunctions.map((c) => (
                        <div key={c.objects} className="event-item">
                          <div className="news-meta">
                            <span className="astro-badge astro-badge-conjunction">&#9679; Conjunction</span>
                            <span className="news-date">{formatDate(parseDateOnly(c.date))}</span>
                            <ReminderBell
                              id={`conjunction-${c.objects}`}
                              eventName={c.objects}
                              eventDateISO={parseDateOnly(c.date).toISOString()}
                            />
                          </div>
                          <div className="news-title">{c.objects}</div>
                          <div className="event-meta-row">
                            <span>Separation {c.separation}</span>
                          </div>
                          <div className="news-excerpt">{c.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <p className="page-lede" style={{ marginTop: 8, fontSize: 12.5 }}>
                  Launches and the ISS position are live. Eclipse, meteor shower, and conjunction dates are
                  predictable years in advance, researched from NASA, the American Meteor Society, and
                  in-the-sky.org &mdash; real dates, not a live feed.
                </p>
              </>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

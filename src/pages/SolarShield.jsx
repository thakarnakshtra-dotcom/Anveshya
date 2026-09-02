import React, { useCallback, useEffect, useRef, useState } from "react";
import AmbientBackground from "../components/AmbientBackground.jsx";
import KpScale, { kpColor as kpScaleColor } from "../components/KpScale.jsx";
import { FLARE_CLASSES } from "../data/spaceWeather.js";

const FUNCTION_URL = "/.netlify/functions/solarshield";
const AUTO_REFRESH_MS = 5 * 60 * 1000;

const ORBIT_INFO = {
  leo: {
    title: "LEO",
    full: "Low Earth Orbit",
    desc: "Storm-driven thermospheric heating increases atmospheric drag, perturbing orbits and raising decay/collision risk — LEO feels geomagnetic storms first and hardest.",
  },
  meo: {
    title: "MEO",
    full: "Medium Earth Orbit",
    desc: "Enhanced radiation-belt electrons during storms can degrade GNSS/GPS satellite electronics and raise single-event-upset risk.",
  },
  geo: {
    title: "GEO",
    full: "Geostationary Orbit",
    desc: "Geomagnetic storms increase surface and deep-dielectric charging risk for geostationary communications and weather satellites.",
  },
};

const COLOR_HEX = {
  green: "#4ade80",
  yellow: "#facc15",
  orange: "#fb923c",
  red: "#f87171",
};

// Numeric Kp -> color now lives in components/KpScale.jsx (kpScaleColor,
// imported above) — it's the same four thresholds this file always used,
// just no longer duplicated now that the Kp explainer below needs the
// identical mapping.

function timeAgo(iso) {
  if (!iso) return "unknown";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins <= 0) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
}

function magAnomalies({ bz, bt }, { speed, density }) {
  const notes = [];
  if (bz != null && bz < -10) notes.push("Bz strongly southward — highly geoeffective");
  if (bt != null && bt > 20) notes.push("Bt elevated — stronger-than-usual total field");
  if (speed != null && speed > 600) notes.push("High-speed solar wind stream");
  if (density != null && density > 20) notes.push("Dense solar wind plasma");
  return notes;
}

function Spinner() {
  return <div className="ss-spinner" aria-label="Loading" />;
}

// Real NOAA G-scale meanings, matched to what riskLevel() in
// netlify/functions/solarshield.js actually returns for data.risk_level
// (QUIET / UNSETTLED / ACTIVE / STORM) — not a separate, differently-
// worded scale invented for this explainer that would disagree with the
// live badge sitting right above it.
const RISK_MEANINGS = [
  {
    level: "QUIET",
    kpRange: "Kp 0–2",
    repKp: 1,
    meaning: "Normal background conditions. No action needed for any use case on this page.",
  },
  {
    level: "UNSETTLED",
    kpRange: "Kp 3",
    repKp: 3,
    meaning: "Slightly disturbed field. Still no real-world impact expected; HF radio may show brief, minor effects at high latitudes.",
  },
  {
    level: "ACTIVE",
    kpRange: "Kp 4",
    repKp: 4,
    meaning: "Elevated activity. Satellite operators may want to note it; aurora can become visible from the northern-tier US on a clear night.",
  },
  {
    level: "STORM",
    kpRange: "Kp 5–9 (NOAA G1–G5)",
    repKp: 7,
    meaning: "An actual geomagnetic storm is underway — severity scales with the Kp value itself (see the Kp explainer below). LEO/MEO/GEO risk cards above reflect this.",
  },
];

const CME_DISTANCE_KM = 150_000_000; // 1 AU, Earth's average distance from the Sun

function CmeCalculator() {
  const [speed, setSpeed] = useState(500);
  const clamped = Math.min(Math.max(Number(speed) || 0, 50), 4000);
  const hours = clamped > 0 ? CME_DISTANCE_KM / clamped / 3600 : 0;

  return (
    <div className="sw-cme-calc">
      <label className="sw-cme-label" htmlFor="cme-speed">
        CME speed (km/s)
      </label>
      <input
        id="cme-speed"
        type="range"
        min={50}
        max={4000}
        step={10}
        value={clamped}
        onChange={(e) => setSpeed(e.target.value)}
        className="sw-cme-slider"
      />
      <div className="sw-cme-readout">
        <span className="sw-cme-speed">{clamped.toLocaleString()} km/s</span>
        <span className="sw-cme-arrow">&rarr;</span>
        <span className="sw-cme-time">
          {hours >= 24 ? `${(hours / 24).toFixed(1)} days` : `${hours.toFixed(1)} hours`}
        </span>
      </div>
      <p className="ancient-body sw-cme-formula">
        time = distance ÷ speed = 150,000,000 km ÷ {clamped.toLocaleString()} km/s &asymp;{" "}
        {Math.round(hours).toLocaleString()} hours
      </p>
      <p className="ancient-body">
        A simplified estimate — real CMEs decelerate somewhat from drag against the ambient solar wind en route, so
        NOAA's actual forecasts (and this calculator) should be read as an estimate, not an exact prediction.
      </p>
    </div>
  );
}

const SW_FAQ = [
  {
    q: "Why should I care about the Kp index?",
    a: "If you operate or rely on satellites, HF radio, precision GPS, or power infrastructure, Kp is the single fastest way to gauge current geomagnetic risk. For most people day-to-day, the main reason to check it is simpler: a high Kp is your best predictor of whether aurora might be visible from your latitude tonight.",
  },
  {
    q: "How often do storms happen?",
    a: "NOAA's published per-solar-cycle averages (roughly 11 years) give a real sense of scale: about 1,700 G1 (minor) storm events per cycle, 600 G2, 200 G3, 100 G4 — and only about 4 G5 (extreme) events per cycle. Frequency isn't constant through the cycle either — activity clusters heavily around solar maximum.",
  },
  {
    q: "Will this affect my phone?",
    a: "Not directly — a geomagnetic storm doesn't damage or disrupt a handset. What it can affect are the systems your phone quietly depends on: GPS positioning accuracy can degrade during strong storms, and satellite-relayed services can see brief interference. Power-grid and HF-radio effects (the real risks at G3+) are infrastructure-level, not device-level.",
  },
  {
    q: "How accurate are the predictions?",
    a: "Kp itself isn't a prediction — it's measured from real magnetometer data. What is genuinely uncertain is CME arrival timing: published forecast-verification studies put typical arrival-time error around plus-or-minus several hours to about ten hours, even for a CME already being tracked by coronagraphs. That's exactly why the calculator above is labeled an estimate rather than an exact answer.",
  },
];

function SpaceWeatherExplainer({ liveKp }) {
  const [activeKp, setActiveKp] = useState(5);
  const [openFaq, setOpenFaq] = useState(null);
  const syncedRef = useRef(false);

  // Sync the interactive scale to the live Kp reading once, the first
  // time real data arrives — not on every 5-minute refresh, which would
  // yank the selection out from under someone mid-click.
  useEffect(() => {
    if (!syncedRef.current && liveKp != null) {
      setActiveKp(Math.min(9, Math.max(0, Math.round(liveKp))));
      syncedRef.current = true;
    }
  }, [liveKp]);

  return (
    <section id="understanding-space-weather" className="modules-section" style={{ paddingTop: 0 }}>
      <div className="section-grid">
        <div className="section-eyebrow">Understanding Space Weather</div>
        <div>
          <h2 className="modules-heading">What You're Looking At, Explained</h2>
          <p className="page-lede" style={{ margin: "0 0 30px" }}>
            Space weather starts at the Sun &mdash; flares and coronal mass ejections (CMEs) throw radiation and
            magnetized plasma outward, some of it toward Earth. When it arrives, it disturbs Earth's magnetic field;
            the Kp index above is how that disturbance is measured, every 3 hours, from real ground magnetometers.
            {liveKp != null ? (
              <>
                {" "}
                Right now that reading is <strong style={{ color: kpScaleColor(liveKp) }}>Kp {liveKp.toFixed(1)}</strong>.
              </>
            ) : null}
          </p>

          <div className="ancient-subhead">The Kp Scale — Click A Level</div>
          <KpScale activeKp={activeKp} onSelect={setActiveKp} />

          <div className="ancient-subhead" style={{ marginTop: 30 }}>
            Solar Flare Scale
          </div>
          <p className="ancient-body" style={{ marginBottom: 14 }}>
            Flares are classified by peak X-ray brightness, measured by NOAA's GOES satellites. Their effects (radio
            blackouts) arrive in about 8 minutes — much faster than a CME's plasma, which typically takes 1&ndash;3
            days.
          </p>
          <div className="ancient-table-wrap">
            <table className="ancient-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Peak X-ray flux</th>
                  <th>Typical effect</th>
                </tr>
              </thead>
              <tbody>
                {FLARE_CLASSES.map((f) => (
                  <tr key={f.cls}>
                    <td>{f.cls}</td>
                    <td>{f.fluxRange}</td>
                    <td>{f.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ancient-subhead" style={{ marginTop: 30 }}>
            CME Arrival-Time Estimator
          </div>
          <p className="ancient-body" style={{ marginBottom: 14 }}>
            Earth sits about 150 million km (1 AU) from the Sun. Given a CME's speed, distance &divide; speed gives a
            rough travel time &mdash; drag the slider:
          </p>
          <CmeCalculator />

          <div className="ancient-subhead" style={{ marginTop: 30 }}>
            What "Risk Level" Means
          </div>
          <div className="sw-scales-grid">
            {RISK_MEANINGS.map((r) => (
              <div key={r.level} className="sw-scale-card">
                <div className="sw-scale-id" style={{ color: kpScaleColor(r.repKp) }}>
                  {r.level}
                </div>
                <div className="sw-scale-name">{r.kpRange}</div>
                <p className="ancient-body">{r.meaning}</p>
              </div>
            ))}
          </div>

          <div className="ancient-subhead" style={{ marginTop: 30 }}>
            FAQ
          </div>
          <div className="sw-faq-list">
            {SW_FAQ.map((item, i) => (
              <div key={item.q} className="sw-faq-item">
                <button
                  type="button"
                  className="sw-faq-question"
                  aria-expanded={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{item.q}</span>
                  <span className="sw-faq-toggle">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i ? <p className="ancient-body sw-faq-answer">{item.a}</p> : null}
              </div>
            ))}
          </div>

          <p className="ancient-sources" style={{ marginTop: 24 }}>
            Sources: NOAA Space Weather Prediction Center (Kp index, G-scale, flare classification, per-cycle storm
            frequency); CME arrival-time forecast uncertainty from published NOAA/CCMC verification studies.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function SolarShield() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [, forceTick] = useState(0);
  const intervalRef = useRef(null);

  const load = useCallback(async (isManual) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch(FUNCTION_URL);
      if (!res.ok) throw new Error(`Function responded ${res.status}`);
      const json = await res.json();
      if (json.error && !json.timestamp) throw new Error(json.error);
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to load live data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(false);
    intervalRef.current = setInterval(() => load(false), AUTO_REFRESH_MS);
    const tickTimer = setInterval(() => forceTick((t) => t + 1), 30000);
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(tickTimer);
    };
  }, [load]);

  const anomalies = data ? magAnomalies(data.magnetometer || {}, data.solar_wind || {}) : [];

  return (
    <main className="home">
      <AmbientBackground variant="page" />
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-rule" />
            SolarShield
            <span className="ss-version-badge">Status: Version 1</span>
          </div>
          <h1 className="page-heading">Space Weather Risk Intelligence</h1>
          <p className="page-lede">
            Live geomagnetic and solar-wind conditions from NOAA's Space Weather Prediction Center, reduced to a
            plain risk signal for satellite operators and researchers.
          </p>
        </div>
      </section>

      <section className="modules-section">
        <div className="section-grid">
          <div className="section-eyebrow">Live Status</div>
          <div>
            <div className="ss-status-bar">
              <span className="ss-timestamp">
                {data ? `Last updated: ${timeAgo(data.timestamp)}` : loading ? "Loading…" : "No data yet"}
                {data?.stale ? <span className="ss-stale-tag">stale &mdash; retrying</span> : null}
              </span>
              <button type="button" className="ss-refresh-btn" onClick={() => load(true)} disabled={refreshing}>
                {refreshing ? "Refreshing…" : "Refresh Now"}
              </button>
            </div>

            {loading ? (
              <div className="ss-loading-block">
                <Spinner />
                <p>Fetching live NOAA data&hellip;</p>
              </div>
            ) : error && !data ? (
              <div className="ss-error-block">
                <p>Live data unavailable right now &mdash; {error}</p>
                <button type="button" className="ss-refresh-btn" onClick={() => load(true)}>
                  Try Again
                </button>
              </div>
            ) : data ? (
              <>
                {error ? (
                  <p className="ss-inline-error">Last refresh failed ({error}) &mdash; showing most recent good data.</p>
                ) : null}

                <div className="ss-header-grid">
                  <div className="ss-stat-block">
                    <div className="ss-stat-label">Planetary Kp Index</div>
                    <div className="ss-kp-value" style={{ color: kpScaleColor(data.kp_index) }}>
                      {data.kp_index.toFixed(1)}
                    </div>
                    <a href="#understanding-space-weather" className="ss-learn-link">
                      What is the Kp index? &rarr;
                    </a>
                  </div>
                  <div className="ss-stat-block">
                    <div className="ss-stat-label">Risk Level</div>
                    <div
                      className="ss-risk-badge"
                      style={{
                        color: kpScaleColor(data.kp_index),
                        borderColor: kpScaleColor(data.kp_index),
                        background: `${kpScaleColor(data.kp_index)}1f`,
                      }}
                    >
                      {data.risk_level}
                    </div>
                    <div className="ss-risk-score">{data.risk_score.toFixed(1)} / 10</div>
                  </div>
                  <div className="ss-stat-block">
                    <div className="ss-stat-label">Storm Likelihood (Heuristic)</div>
                    <div className="ss-prob-value">{Math.round(data.ml_storm_probability * 100)}%</div>
                    <div className="ss-prob-note">
                      Estimated from live Kp, Bz, and solar-wind speed &mdash; not a trained ML forecast.
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {data ? (
        <>
          <section className="modules-section" style={{ paddingTop: 0 }}>
            <div className="section-grid">
              <div className="section-eyebrow">Orbit Risk</div>
              <div>
                <div className="ss-orbit-grid">
                  {["leo", "meo", "geo"].map((key) => {
                    const orbit = data.orbit_risk?.[key];
                    if (!orbit) return null;
                    const hex = COLOR_HEX[orbit.color] || COLOR_HEX.green;
                    return (
                      <div
                        key={key}
                        className="ss-orbit-card"
                        style={{ borderColor: `${hex}55`, background: `${hex}12` }}
                      >
                        <div className="ss-orbit-top">
                          <span className="ss-orbit-title">{ORBIT_INFO[key].title}</span>
                          <span className="ss-orbit-label" style={{ color: hex }}>
                            {orbit.label}
                          </span>
                        </div>
                        <div className="ss-orbit-full">{ORBIT_INFO[key].full}</div>
                        <div className="ss-orbit-bar-track">
                          <div
                            className="ss-orbit-bar-fill"
                            style={{ width: `${(orbit.score / 10) * 100}%`, background: hex }}
                          />
                        </div>
                        <div className="ss-orbit-score">{orbit.score} / 10</div>
                        <p className="ss-orbit-desc">{ORBIT_INFO[key].desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <section className="modules-section" style={{ paddingTop: 0 }}>
            <div className="section-grid">
              <div className="section-eyebrow">Magnetometer &amp; Solar Wind</div>
              <div>
                <div className="ss-metrics-row">
                  <div className="ss-metric-chip">
                    <div className="ss-metric-label">Bz (GSM)</div>
                    <div className="ss-metric-value">
                      {data.magnetometer.bz != null ? `${data.magnetometer.bz.toFixed(1)} nT` : "N/A"}
                    </div>
                  </div>
                  <div className="ss-metric-chip">
                    <div className="ss-metric-label">Bt</div>
                    <div className="ss-metric-value">
                      {data.magnetometer.bt != null ? `${data.magnetometer.bt.toFixed(1)} nT` : "N/A"}
                    </div>
                  </div>
                  <div className="ss-metric-chip">
                    <div className="ss-metric-label">Solar Wind Speed</div>
                    <div className="ss-metric-value">
                      {data.solar_wind.speed != null ? `${Math.round(data.solar_wind.speed)} km/s` : "N/A"}
                    </div>
                  </div>
                  <div className="ss-metric-chip">
                    <div className="ss-metric-label">Proton Density</div>
                    <div className="ss-metric-value">
                      {data.solar_wind.density != null ? `${data.solar_wind.density.toFixed(1)} p/cm³` : "N/A"}
                    </div>
                  </div>
                </div>
                {anomalies.length ? (
                  <ul className="ss-anomaly-list">
                    {anomalies.map((note, i) => (
                      <li key={i}>{note}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="ss-no-anomaly">No anomalies flagged in current readings.</p>
                )}
              </div>
            </div>
          </section>

          <section className="modules-section" style={{ paddingTop: 0 }}>
            <div className="section-grid">
              <div className="section-eyebrow">Active Alerts</div>
              <div>
                {data.active_alerts?.length ? (
                  <ul className="ss-alerts-list">
                    {data.active_alerts.map((alert, i) => (
                      <li key={i} className="ss-alert-item">
                        {alert}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="ss-no-anomaly">No active alerts.</p>
                )}
                <p className="ss-source-note">
                  Source: NOAA Space Weather Prediction Center &mdash; real-time solar wind, magnetometer, planetary
                  K-index, and alerts feeds. Refreshes automatically every 5 minutes.
                </p>
                <a href="#understanding-space-weather" className="ss-learn-link">
                  New to space weather? Solar cycles, flares, and CMEs explained &rarr;
                </a>
              </div>
            </div>
          </section>
        </>
      ) : null}

      {/* Outside the `data` conditional deliberately, same reasoning as
          the Live Dashboard card below it — this is educational content,
          not a NOAA reading, so it has no reason to wait on (or vanish
          because of) that fetch. Still syncs to the live Kp value when
          it's available (via liveKp), just doesn't require it. */}
      <SpaceWeatherExplainer liveKp={data ? data.kp_index : null} />

      {/* Kept outside the `data` conditional deliberately — this is an
          outbound link to a companion site, not NOAA data, so it has no
          reason to wait on (or disappear because of) that fetch. */}
      <section className="modules-section" style={{ paddingTop: 0, paddingBottom: 100 }}>
        <div className="section-grid">
          <div className="section-eyebrow">Live Dashboard</div>
          <div>
            <div className="ss-live-link-card">
              <h3 className="ss-live-link-title">Live SolarShield Dashboard</h3>
              <p className="ss-live-link-body">Experience real-time space weather intelligence:</p>
              <a
                href="https://solarsheildai.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="ss-live-link-button"
              >
                Launch SolarShield Live &rarr;
              </a>
              <p className="ss-live-link-desc">
                View current Kp index, satellite risk levels, and geomagnetic alerts in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import React, { useCallback, useEffect, useRef, useState } from "react";
import AmbientBackground from "../components/AmbientBackground.jsx";

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

function kpColor(kp) {
  if (kp <= 2) return COLOR_HEX.green;
  if (kp <= 4) return COLOR_HEX.yellow;
  if (kp <= 6) return COLOR_HEX.orange;
  return COLOR_HEX.red;
}

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
                    <div className="ss-kp-value" style={{ color: kpColor(data.kp_index) }}>
                      {data.kp_index.toFixed(1)}
                    </div>
                  </div>
                  <div className="ss-stat-block">
                    <div className="ss-stat-label">Risk Level</div>
                    <div
                      className="ss-risk-badge"
                      style={{
                        color: kpColor(data.kp_index),
                        borderColor: kpColor(data.kp_index),
                        background: `${kpColor(data.kp_index)}1f`,
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

          <section className="modules-section" style={{ paddingTop: 0, paddingBottom: 100 }}>
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
              </div>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}

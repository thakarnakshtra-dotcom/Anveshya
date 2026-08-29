// SolarShield live data aggregator.
//
// Pulls four real, verified NOAA Space Weather Prediction Center feeds and
// reduces them to one risk-scored JSON payload for the dashboard. Every
// number here traces back to a live NOAA measurement, EXCEPT
// `ml_storm_probability` — there is no free, public, trained ML storm
// model to call, so that field is a transparent heuristic computed from
// the same real Kp/Bz/solar-wind values below (see the comment on it).
// It is not a machine-learning prediction and the frontend labels it as
// a heuristic, not an ML forecast, to avoid overstating what it is.

const ENDPOINTS = {
  mag: "https://services.swpc.noaa.gov/json/rtsw/rtsw_mag_1m.json",
  wind: "https://services.swpc.noaa.gov/json/rtsw/rtsw_wind_1m.json",
  kIndex: "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",
  alerts: "https://services.swpc.noaa.gov/products/alerts.json",
};

const CACHE_MS = 15 * 60 * 1000;
// Module-scope cache: persists across invocations only while the function
// container stays warm. That's a real, if best-effort, 15-minute cache on
// Netlify's Lambda-based runtime, not a guarantee — cold starts reset it.
let cache = { data: null, fetchedAt: 0 };

async function fetchJson(url) {
  const res = await fetch(url, { headers: { "User-Agent": "Anveshya-SolarShield/1.0" } });
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res.json();
}

function riskLevel(kp) {
  if (kp <= 2) return "QUIET";
  if (kp <= 4) return "UNSETTLED";
  if (kp <= 6) return "ACTIVE";
  return "STORM";
}

// Exact band mapping as specified: green/yellow/orange/red per orbit,
// LEO reacting first (most exposed to atmospheric drag), GEO last.
function orbitRisk(kp) {
  if (kp <= 2) {
    return {
      leo: { score: 2, color: "green", label: "Minimal" },
      meo: { score: 1, color: "green", label: "Minimal" },
      geo: { score: 0, color: "green", label: "Minimal" },
    };
  }
  if (kp <= 4) {
    return {
      leo: { score: 4, color: "yellow", label: "Elevated" },
      meo: { score: 2, color: "green", label: "Minimal" },
      geo: { score: 1, color: "green", label: "Minimal" },
    };
  }
  if (kp <= 6) {
    return {
      leo: { score: 6, color: "orange", label: "High" },
      meo: { score: 4, color: "yellow", label: "Elevated" },
      geo: { score: 2, color: "green", label: "Minimal" },
    };
  }
  return {
    leo: { score: 8, color: "red", label: "Severe" },
    meo: { score: 6, color: "orange", label: "High" },
    geo: { score: 4, color: "yellow", label: "Elevated" },
  };
}

// alerts.json messages are raw NOAA text products. The line right after
// "Issue Time: ..." is consistently the actual advisory summary (e.g.
// "EXTENDED WARNING: Geomagnetic K-index of 4 expected") — pull that
// instead of dumping the whole multi-paragraph product.
function summarizeAlert(message) {
  const lines = (message || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const issueIdx = lines.findIndex((l) => /^issue time/i.test(l));
  return (issueIdx >= 0 && lines[issueIdx + 1]) || lines[0] || "Space weather alert";
}

export async function handler() {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, max-age=60",
  };

  if (cache.data && Date.now() - cache.fetchedAt < CACHE_MS) {
    return { statusCode: 200, headers, body: JSON.stringify(cache.data) };
  }

  try {
    const [magList, windList, kList, alertsList] = await Promise.all([
      fetchJson(ENDPOINTS.mag),
      fetchJson(ENDPOINTS.wind),
      fetchJson(ENDPOINTS.kIndex),
      fetchJson(ENDPOINTS.alerts),
    ]);

    // rtsw_mag_1m / rtsw_wind_1m are newest-first.
    const latestMag = Array.isArray(magList) ? magList[0] : null;
    const latestWind = Array.isArray(windList) ? windList[0] : null;
    // noaa-planetary-k-index.json is oldest-first — the latest reading is last.
    const latestK = Array.isArray(kList) && kList.length ? kList[kList.length - 1] : null;

    const kp = Math.round((Number(latestK?.Kp) || 0) * 10) / 10;
    const bz = typeof latestMag?.bz_gsm === "number" ? latestMag.bz_gsm : null;
    const bt = typeof latestMag?.bt === "number" ? latestMag.bt : null;
    const speed = typeof latestWind?.proton_speed === "number" ? latestWind.proton_speed : null;
    const density = typeof latestWind?.proton_density === "number" ? latestWind.proton_density : null;

    // Heuristic storm-likelihood estimate (NOT a trained ML model): a base
    // rate, scaled up by current Kp, a bonus for southward Bz (the
    // geoeffective orientation that couples solar wind energy into
    // Earth's magnetosphere), and a bonus for elevated solar wind speed.
    let prob = 0.05 + (kp / 9) * 0.5;
    if (bz != null && bz < 0) prob += Math.min(Math.abs(bz) / 20, 0.3);
    if (speed != null && speed > 500) prob += Math.min((speed - 500) / 1000, 0.2);
    prob = Math.max(0, Math.min(1, prob));

    const active_alerts = Array.isArray(alertsList)
      ? alertsList.slice(0, 8).map((a) => summarizeAlert(a.message))
      : [];

    const data = {
      timestamp: new Date().toISOString(),
      kp_index: kp,
      risk_score: Math.round((kp / 9) * 100) / 10,
      risk_level: riskLevel(kp),
      ml_storm_probability: Math.round(prob * 1000) / 1000,
      magnetometer: { bz, bt },
      solar_wind: { speed, density },
      orbit_risk: orbitRisk(kp),
      active_alerts,
    };

    cache = { data, fetchedAt: Date.now() };
    return { statusCode: 200, headers, body: JSON.stringify(data) };
  } catch (err) {
    if (cache.data) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ...cache.data, stale: true, error: String(err.message || err) }),
      };
    }
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Unable to fetch NOAA space weather data", detail: String(err.message || err) }),
    };
  }
};

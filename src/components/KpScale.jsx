import React from "react";
import { KP_LEVELS } from "../data/spaceWeather.js";

// Shared by Learn's Space Weather topic and SolarShield's "Understanding
// Space Weather" section — one component, one source of truth for the
// Kp 0-9 scale, instead of two hand-copies that could quietly drift out
// of sync with each other.
//
// Colors match SolarShield's live risk-level color-coding exactly (same
// four hex values, same ≤2/≤4/≤6/>6 band edges as the kpColor() this
// file's sibling, pages/SolarShield.jsx, already used before this
// component existed) — a Kp badge means the same color whether you're
// reading the explanation or watching the live dashboard.
export function kpColor(kp) {
  if (kp <= 2) return "#4ade80";
  if (kp <= 4) return "#facc15";
  if (kp <= 6) return "#fb923c";
  return "#f87171";
}

export default function KpScale({ activeKp, onSelect }) {
  const active = KP_LEVELS[activeKp];
  return (
    <div className="sw-kp-block">
      <div className="sw-kp-scale" role="tablist" aria-label="Kp index level">
        {KP_LEVELS.map((level) => (
          <button
            key={level.kp}
            type="button"
            role="tab"
            aria-selected={level.kp === activeKp}
            className={`sw-kp-chip${level.kp === activeKp ? " active" : ""}`}
            style={{ "--sw-kp-color": kpColor(level.kp) }}
            onClick={() => onSelect(level.kp)}
          >
            {level.kp}
          </button>
        ))}
      </div>
      <div className="sw-kp-detail" style={{ borderColor: kpColor(active.kp) }}>
        <div className="sw-kp-detail-top">
          <span className="sw-kp-detail-value" style={{ color: kpColor(active.kp) }}>
            Kp {active.kp}
          </span>
          <span className="sw-kp-detail-band">{active.band}</span>
          {active.gScale ? (
            <span className="sw-kp-detail-gscale" style={{ borderColor: kpColor(active.kp), color: kpColor(active.kp) }}>
              {active.gScale}
            </span>
          ) : null}
        </div>
        <p className="ancient-body">{active.note}</p>
      </div>
    </div>
  );
}

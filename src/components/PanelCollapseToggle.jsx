import React from "react";

// Shared by every Explorer sub-view's docked info panel (Panchanga,
// Andromeda, Saptarshi). Desktop-only via CSS this'd never render (the
// panel already has room to breathe there); on mobile, where the panel
// docks across the bottom of the screen, this lets a visitor shrink it
// down to a thin strip to see more of the 3D scene, rather than being
// permanently stuck with ~48% of the screen covered. Defaults to
// expanded everywhere (the already-tested, working behavior) — this
// only adds the option to collapse, it doesn't change what anyone sees
// on first load.
export default function PanelCollapseToggle({ collapsed, onToggle }) {
  return (
    <button
      type="button"
      className="panel-collapse-toggle"
      onClick={onToggle}
      aria-expanded={!collapsed}
    >
      {collapsed ? "Show panel ▲" : "Hide panel ▼"}
    </button>
  );
}

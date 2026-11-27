import React, { Component, useCallback, useEffect, useRef, useState } from "react";
import { themeVars } from "../../theme/themeVars.js";
import useReducedMotion from "../../utils/useReducedMotion.js";
import { supportsWebGL } from "../../utils/webgl.js";
import LabIcon from "../icons.jsx";
import LabCanvas from "./LabCanvas.jsx";
import LearnPanel from "./LearnPanel.jsx";
import { defaultValues } from "./defineLab.js";
import "./lab.css";

const PANELS = [
  { id: "parameters", name: "Parameters" },
  { id: "outputs", name: "Outputs" },
  { id: "learn", name: "Learn" },
];

const ICON_PATHS = {
  back: "M15 5l-7 7 7 7",
  play: "M8 5l11 7-11 7z",
  pause: "M8 5v14M16 5v14",
  reset: "M5 12a7 7 0 1 0 2.2-5.1M7 3.5v3.8h3.8",
  examples: "M12 4v4M12 16v4M4 12h4M16 12h4M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2",
};

function Icon({ name }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

// The first visit to a lab opens its welcome pop-up.
const welcomeKey = (slug) => `anveshya-lab-welcome-${slug}`;
function welcomeSeen(slug) {
  try {
    return Boolean(localStorage.getItem(welcomeKey(slug)));
  } catch {
    return false;
  }
}
function rememberWelcome(slug) {
  try {
    localStorage.setItem(welcomeKey(slug), "1");
  } catch {
    /* private mode: the pop-up simply shows again next time */
  }
}

function Tabs({ label, items, value, onChange, className, idPrefix }) {
  const ref = useRef(null);

  // Keep the chosen tab visible when the row scrolls (phones).
  useEffect(() => {
    const row = ref.current;
    const tab = row?.querySelector('[aria-selected="true"]');
    if (!tab) return;
    const left = tab.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft || left + tab.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollLeft = left - 12;
    }
  }, [value]);

  const onKeyDown = (event) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    const index = items.findIndex((item) => item.id === value);
    const next = items[(index + step + items.length) % items.length];
    onChange(next.id);
    event.currentTarget.querySelector(`#${idPrefix}-${next.id}`)?.focus();
  };

  return (
    <div ref={ref} className={className} role="tablist" aria-label={label} onKeyDown={onKeyDown}>
      {items.map((item) => (
        <button
          key={item.id}
          id={`${idPrefix}-${item.id}`}
          type="button"
          role="tab"
          aria-selected={item.id === value}
          tabIndex={item.id === value ? 0 : -1}
          onClick={() => onChange(item.id)}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

function Welcome({ title, text, examples, onPick, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className="lab-welcome"
      aria-labelledby="lab-welcome-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <h2 id="lab-welcome-title">{title}</h2>
      <p>{text}</p>
      <h3>Start with an example</h3>
      <div className="lab-welcome-examples">
        {examples.map(({ experiment, preset }) => (
          <button key={`${experiment.id}-${preset.id}`} type="button" className="lab-example" onClick={() => onPick(experiment, preset)}>
            <span>
              {experiment.name}: {preset.name}
            </span>
            <small>{preset.description}</small>
          </button>
        ))}
      </div>
      <button type="button" className="lab-button lab-button-primary" onClick={onClose}>
        Start exploring
      </button>
    </dialog>
  );
}

function Control({ param, value, onChange }) {
  if (param.type === "toggle") {
    return (
      <label className="lab-toggle">
        <span>{param.label}</span>
        <input type="checkbox" checked={value} onChange={(event) => onChange(event.target.checked)} />
      </label>
    );
  }
  if (param.type === "choice") {
    return (
      <div className="lab-choice" role="group" aria-label={param.label}>
        <span>{param.label}</span>
        <div>
          {param.options.map((option) => (
            <button key={option.value} type="button" aria-pressed={option.value === value} onClick={() => onChange(option.value)}>
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }
  return (
    <label className="lab-range">
      <span className="lab-range-top">
        <span>{param.label}</span>
        <span>{param.format ? param.format(value) : value}</span>
      </span>
      <input
        type="range"
        min={param.min}
        max={param.max}
        step={param.step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function Parameters({ experiment, values, onChange, onPreset, onReset }) {
  return (
    <>
      <p className="lab-summary">{experiment.summary}</p>
      {experiment.params
        .filter((param) => !param.when || param.when(values))
        .map((param) => (
          <Control key={param.id} param={param} value={values[param.id]} onChange={(value) => onChange(param.id, value)} />
        ))}
      {experiment.presets?.length ? (
        <>
          <h3>Presets</h3>
          <div className="lab-presets">
            {experiment.presets.map((preset) => (
              <button key={preset.id} type="button" className="lab-button" title={preset.description} onClick={() => onPreset(preset)}>
                {preset.name}
              </button>
            ))}
          </div>
        </>
      ) : null}
      <button type="button" className="lab-button" onClick={onReset}>
        Reset
      </button>
      <p className="lab-hint">Keyboard: Space plays or pauses, R resets.</p>
    </>
  );
}

function Outputs({ experiment, values, playing }) {
  const { Chart } = experiment;
  return (
    <>
      <dl className="lab-outputs">
        {experiment.outputs(values, { playing }).map((output) => (
          <div key={output.label}>
            <dt>{output.label}</dt>
            <dd>{output.value}</dd>
          </div>
        ))}
      </dl>
      {Chart ? <Chart values={values} /> : null}
    </>
  );
}

class CanvasBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function LabShell({ lab, info, theme, initialExperiment, onClose }) {
  const { slug, experiments, content } = lab;
  const reducedMotion = useReducedMotion();
  const linked = experiments.find((item) => item.id === initialExperiment);
  const [experimentId, setExperimentId] = useState((linked || experiments[0]).id);
  const [valuesById, setValuesById] = useState(() =>
    Object.fromEntries(experiments.map((item) => [item.id, defaultValues(item)]))
  );
  const [playing, setPlaying] = useState(() => !window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [resetKey, setResetKey] = useState(0);
  const [panel, setPanel] = useState("parameters");
  const [panelOpen, setPanelOpen] = useState(true);
  const [welcome, setWelcome] = useState(() => !linked && !welcomeSeen(slug));
  const [webgl, setWebgl] = useState(supportsWebGL);
  const onCanvasFail = useCallback(() => setWebgl(false), []);

  const experiment = experiments.find((item) => item.id === experimentId) || experiments[0];
  const values = valuesById[experiment.id];

  const reset = useCallback(() => {
    setValuesById((all) => ({ ...all, [experiment.id]: defaultValues(experiment) }));
    setResetKey((key) => key + 1);
    setPlaying(!reducedMotion);
  }, [experiment, reducedMotion]);

  const onAdvance = useCallback(
    (seconds) => {
      if (!experiment.advance) return;
      setValuesById((all) => ({ ...all, [experiment.id]: experiment.advance(all[experiment.id], seconds) }));
    },
    [experiment]
  );

  const applyPreset = (target, preset) => {
    setExperimentId(target.id);
    setValuesById((all) => ({ ...all, [target.id]: { ...defaultValues(target), ...preset.values } }));
    setPlaying(preset.playing ?? !reducedMotion);
  };

  const examples = content.examples.map((entry) => {
    const [experimentKey, presetId] = entry.split(":");
    const target = experiments.find((item) => item.id === experimentKey);
    return { experiment: target, preset: target.presets.find((item) => item.id === presetId) };
  });

  const closeWelcome = () => {
    rememberWelcome(slug);
    setWelcome(false);
  };

  // Space: play or pause. R: reset.
  useEffect(() => {
    const onKey = (event) => {
      if (welcome || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("textarea, select, input[type=text]")) return;
      if (event.code === "Space") {
        // A control reached with the keyboard keeps its normal Space action.
        if (target?.closest("button, a, input[type=checkbox]")) return;
        event.preventDefault();
        setPlaying((value) => !value);
      } else if (event.key.toLowerCase() === "r") {
        event.preventDefault();
        reset();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [welcome, reset]);

  // After a mouse or touch click, let go of focus so Space still means play.
  const releaseFocus = (event) => {
    if (event.detail > 0 && !event.target.closest("dialog")) {
      setTimeout(() => document.activeElement?.blur(), 0);
    }
  };

  const legend = typeof experiment.legend === "function" ? experiment.legend(values) : experiment.legend;

  return (
    <div className={`lab lab-${theme}`} style={themeVars(theme)} onClick={releaseFocus}>
      <header className="lab-bar">
        <button type="button" className="lab-button lab-icon-button" onClick={onClose} aria-label="Close lab">
          <Icon name="back" />
        </button>
        <div className="lab-name">
          <span>{info.category}</span>
          <h1>{info.title}</h1>
        </div>
        <button type="button" className="lab-button lab-icon-button" onClick={() => setPlaying((value) => !value)}>
          <Icon name={playing ? "pause" : "play"} />
          <span className="lab-button-text">{playing ? "Pause" : "Play"}</span>
        </button>
        <button type="button" className="lab-button lab-icon-button" onClick={reset}>
          <Icon name="reset" />
          <span className="lab-button-text">Reset</span>
        </button>
        <button type="button" className="lab-button lab-icon-button" onClick={() => setWelcome(true)}>
          <Icon name="examples" />
          <span className="lab-button-text">Examples</span>
        </button>
      </header>

      <Tabs
        label="Experiments"
        className="lab-experiments"
        idPrefix="lab-experiment"
        items={experiments}
        value={experiment.id}
        onChange={setExperimentId}
      />

      <div className="lab-body">
        <main className={`lab-stage${experiment.view === "look" ? " lab-stage-look" : ""}`}>
          {webgl ? (
            <CanvasBoundary onFail={onCanvasFail}>
              <LabCanvas
                experiment={experiment}
                values={values}
                playing={playing}
                resetKey={resetKey}
                theme={theme}
                onAdvance={onAdvance}
                onFail={onCanvasFail}
              />
            </CanvasBoundary>
          ) : (
            <div className="lab-no-3d">
              <LabIcon slug={slug} size={96} />
              <p>The 3D view is not available on this device. The Outputs and Learn tabs still work.</p>
            </div>
          )}
          {webgl && legend?.length ? (
            <ul className="lab-legend">
              {legend.map((item) => (
                <li key={item.label}>
                  <span className={`lab-swatch lab-swatch-${item.color}`} />
                  {item.label}
                </li>
              ))}
            </ul>
          ) : null}
          {webgl ? (
            <div className="lab-note">
              {experiment.caption ? <p className="lab-caption">{experiment.caption(values)}</p> : null}
              <p>{experiment.note}</p>
            </div>
          ) : null}
        </main>

        <aside className={`lab-panel${panelOpen ? "" : " lab-panel-closed"}`}>
          <div className="lab-panel-head">
            <Tabs
              label="Side panel"
              className="lab-panel-tabs"
              idPrefix="lab-panel"
              items={PANELS}
              value={panel}
              onChange={(id) => {
                setPanel(id);
                setPanelOpen(true);
              }}
            />
            <button
              type="button"
              className="lab-panel-toggle"
              aria-expanded={panelOpen}
              onClick={() => setPanelOpen((open) => !open)}
            >
              {panelOpen ? "Hide" : "Show"}
            </button>
          </div>
          {panelOpen ? (
            <div
              key={`${experiment.id}-${panel}`}
              className="lab-panel-body"
              role="tabpanel"
              aria-labelledby={`lab-panel-${panel}`}
            >
              {panel === "learn" ? (
                <LearnPanel learn={experiment.learn} />
              ) : panel === "outputs" ? (
                <Outputs experiment={experiment} values={values} playing={playing} />
              ) : (
                <Parameters
                  experiment={experiment}
                  values={values}
                  onChange={(id, value) =>
                    setValuesById((all) => ({ ...all, [experiment.id]: { ...all[experiment.id], [id]: value } }))
                  }
                  onPreset={(preset) => applyPreset(experiment, preset)}
                  onReset={reset}
                />
              )}
            </div>
          ) : null}
        </aside>
      </div>

      {welcome ? (
        <Welcome
          title={content.welcomeTitle}
          text={content.welcomeText}
          examples={examples}
          onPick={(target, preset) => {
            applyPreset(target, preset);
            closeWelcome();
          }}
          onClose={closeWelcome}
        />
      ) : null}
    </div>
  );
}

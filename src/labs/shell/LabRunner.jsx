import React, { useEffect, useRef, useState } from "react";
import { themeVars } from "../../theme/themeVars.js";
import { findLab } from "../registry.js";
import LabShell from "./LabShell.jsx";
import "./lab.css";

function Message({ theme, text, onClose }) {
  return (
    <div className={`lab lab-${theme} lab-message`} style={themeVars(theme)}>
      <p role="status">{text}</p>
      <button type="button" className="lab-button" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

// Loads one lab by its slug and shows it full screen. "onReady" is called
// once, when there is something on screen.
export default function LabRunner({ slug, theme = "dark", experiment, onClose, onReady }) {
  const info = findLab(slug);
  const [lab, setLab] = useState(null);
  const [failed, setFailed] = useState(false);
  const announced = useRef(false);

  useEffect(() => {
    let alive = true;
    info
      ?.load()
      .then((module) => alive && setLab(module.default))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, [info]);

  const settled = !info || failed || Boolean(lab);
  useEffect(() => {
    if (!settled || announced.current) return;
    announced.current = true;
    onReady?.();
  }, [settled, onReady]);

  if (!info) return <Message theme={theme} text="There is no lab at this address." onClose={onClose} />;
  if (failed) return <Message theme={theme} text="This lab could not be loaded." onClose={onClose} />;
  if (!lab) return <Message theme={theme} text="Loading the lab&hellip;" onClose={onClose} />;
  return <LabShell lab={lab} info={info} theme={theme} initialExperiment={experiment} onClose={onClose} />;
}

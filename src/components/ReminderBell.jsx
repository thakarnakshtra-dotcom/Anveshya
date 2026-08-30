import React, { useState } from "react";
import {
  OFFSET_OPTIONS,
  cancelReminder,
  getReminder,
  isNotificationSupported,
  requestNotificationPermission,
  setReminder,
} from "../utils/reminders.js";

function BellIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function ReminderModal({ id, eventName, eventDateISO, onClose, onSet }) {
  const [offsetIdx, setOffsetIdx] = useState(1);
  const [email, setEmail] = useState("");
  const [confirmed, setConfirmed] = useState(null);
  const [permissionNote, setPermissionNote] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const permission = await requestNotificationPermission();
    const offset = OFFSET_OPTIONS[offsetIdx];
    const saved = setReminder({
      id,
      eventName,
      eventDateISO,
      offsetMs: offset.ms,
      offsetLabel: offset.label,
      email,
    });

    if (permission === "denied") {
      setPermissionNote(
        "Browser notifications are blocked for this site, so the reminder is saved but won't pop up — allow notifications in your browser settings to change that."
      );
    } else if (permission === "unsupported") {
      setPermissionNote("This browser doesn't support notifications — the reminder is saved for reference only.");
    }

    setConfirmed(saved);
  };

  return (
    <div className="reminder-modal-overlay" onClick={onClose}>
      <div className="reminder-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button type="button" className="reminder-modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        {confirmed ? (
          <div className="reminder-confirm">
            <div className="reminder-confirm-check">&#10003;</div>
            <p className="reminder-confirm-text">
              Reminder set for <strong>{eventName}</strong> &mdash; {confirmed.offsetLabel} (
              {new Date(confirmed.remindAtISO).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
              ).
            </p>
            {permissionNote ? <p className="reminder-note">{permissionNote}</p> : null}
            {confirmed.email ? (
              <p className="reminder-note">
                Email delivery isn't connected yet &mdash; {confirmed.email} is saved for when it is.
              </p>
            ) : null}
            <button type="button" className="reminder-submit" onClick={() => onSet(confirmed)}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="reminder-modal-kicker">Set a Reminder</div>
            <h3 className="reminder-modal-title">{eventName}</h3>

            <label className="reminder-field">
              Notify me
              <select value={offsetIdx} onChange={(e) => setOffsetIdx(Number(e.target.value))}>
                {OFFSET_OPTIONS.map((o, i) => (
                  <option key={o.label} value={i}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="reminder-field">
              Email me at (optional)
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <p className="reminder-disclaimer">
              {isNotificationSupported()
                ? "This will ask permission for a browser notification. It only fires while Anveshya is open in a tab — there's no push backend yet."
                : "Your browser doesn't support notifications, so this will just be saved for your own reference."}
              {" "}Email delivery isn't wired up yet &mdash; the address is only saved for later.
            </p>

            <button type="submit" className="reminder-submit">
              Set Reminder
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ReminderBell({ id, eventName, eventDateISO }) {
  const [reminder, setReminderState] = useState(() => getReminder(id));
  const [open, setOpen] = useState(false);

  const handleBellClick = () => {
    if (reminder) {
      cancelReminder(id);
      setReminderState(null);
    } else {
      setOpen(true);
    }
  };

  return (
    <>
      <button
        type="button"
        className={reminder ? "reminder-bell active" : "reminder-bell"}
        onClick={handleBellClick}
        aria-label={reminder ? `Cancel reminder for ${eventName}` : `Set reminder for ${eventName}`}
        title={reminder ? "Reminder set — click to cancel" : "Set a reminder"}
      >
        <BellIcon filled={!!reminder} />
      </button>
      {open ? (
        <ReminderModal
          id={id}
          eventName={eventName}
          eventDateISO={eventDateISO}
          onClose={() => setOpen(false)}
          onSet={(r) => {
            setReminderState(r);
            setOpen(false);
          }}
        />
      ) : null}
    </>
  );
}

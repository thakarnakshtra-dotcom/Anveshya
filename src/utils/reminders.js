// Client-side event reminders. No backend exists for this yet, so this is
// deliberately scoped to what's real:
//   - Reminders persist in localStorage (per-browser, per-device only).
//   - A real browser Notification fires via the Notification API, checked
//     on an interval while the app is open in a tab (mounted once in
//     AppShell so it survives SPA navigation between pages).
//   - There is no push service or backend, so a closed tab/browser will
//     not receive anything — that limitation is stated in the UI, not
//     hidden.
//   - The optional email field is stored for later (in case a real email
//     backend gets built), but no email is ever sent by this code. The UI
//     says so explicitly rather than implying delivery that doesn't exist.

const STORAGE_KEY = "anveshya-reminders";
const CHECK_INTERVAL_MS = 30 * 1000;

export const OFFSET_OPTIONS = [
  { label: "15 minutes before", ms: 15 * 60 * 1000 },
  { label: "1 hour before", ms: 60 * 60 * 1000 },
  { label: "1 day before", ms: 24 * 60 * 60 * 1000 },
  { label: "1 week before", ms: 7 * 24 * 60 * 60 * 1000 },
];

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(map) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Storage unavailable (private mode, quota, etc.) — fail silently,
    // the UI just won't persist across reloads.
  }
}

export function getReminder(id) {
  return readAll()[id] || null;
}

export function setReminder({ id, eventName, eventDateISO, offsetMs, offsetLabel, email }) {
  const map = readAll();
  map[id] = {
    id,
    eventName,
    eventDateISO,
    remindAtISO: new Date(new Date(eventDateISO).getTime() - offsetMs).toISOString(),
    offsetLabel,
    email: email || "",
    notified: false,
    createdAt: new Date().toISOString(),
  };
  writeAll(map);
  return map[id];
}

export function cancelReminder(id) {
  const map = readAll();
  delete map[id];
  writeAll(map);
}

export function isNotificationSupported() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationPermission() {
  if (!isNotificationSupported()) return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

// Fires real Notification API calls for any reminder whose remindAt time
// has passed and hasn't fired yet. Meant to be polled periodically — see
// startReminderChecker.
function checkDue() {
  const map = readAll();
  const now = Date.now();
  let changed = false;

  for (const id of Object.keys(map)) {
    const r = map[id];
    if (r.notified) continue;
    if (new Date(r.remindAtISO).getTime() > now) continue;

    if (isNotificationSupported() && Notification.permission === "granted") {
      try {
        new Notification(`Upcoming: ${r.eventName}`, {
          body: `${r.offsetLabel} — from Anveshya`,
          icon: "/favicon.svg",
        });
      } catch {
        // Notification construction can throw in some contexts (e.g. no
        // service worker on some mobile browsers) — the reminder still
        // gets marked as handled below so it doesn't retry forever.
      }
    }
    r.notified = true;
    changed = true;

    // Once the event itself has passed, drop the stored reminder entirely.
    if (new Date(r.eventDateISO).getTime() < now) {
      delete map[id];
    }
  }

  if (changed) writeAll(map);
}

let intervalId = null;

export function startReminderChecker() {
  if (intervalId) return () => {};
  checkDue();
  intervalId = setInterval(checkDue, CHECK_INTERVAL_MS);
  return () => {
    clearInterval(intervalId);
    intervalId = null;
  };
}

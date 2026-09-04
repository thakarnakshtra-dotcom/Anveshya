// Shared "latest space news" fetching — used by both the News page and
// Home's news preview section, so there's exactly one real implementation
// of each feed instead of two copies that could quietly drift apart.

const NASA_FEED = "https://www.nasa.gov/news-release/feed/";
// Real ISRO agency id on Launch Library 2, curl-verified: its
// /launch/previous/?lsp__id=31 result count (100) matches ISRO's own
// agency record's total_launch_count (100) exactly.
const ISRO_AGENCY_ID = 31;
const ISRO_LAUNCHES = `https://ll.thespacedevs.com/2.2.0/launch/previous/?limit=8&lsp__id=${ISRO_AGENCY_ID}&mode=normal`;
const ESA_FEED = "https://www.esa.int/rssfeed/TopNews";

export function stripHtml(html) {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  return (doc.body.textContent || "").trim();
}

export function truncate(text, max) {
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
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

// ISRO: previously built from isro.vercel.app's customer_satellites
// endpoint — commercial rideshare payloads ISRO carried for OTHER
// countries, e.g. "342kg satellite launched for Singapore". That data is
// real, but it structurally cannot cover ISRO's own national missions
// (a GSLV launching an ISRO Earth-observation satellite is not a
// "customer satellite"), which is exactly the kind of story most likely
// to actually matter here. Switched to Launch Library 2's real launch
// history for ISRO specifically — same free, no-key, CORS-open API this
// project already uses elsewhere for upcoming launches — which covers
// every ISRO launch, gives its real success/failure outcome (stated
// honestly either way, not spun positive), and a real mission
// description instead of a generic one.
async function fetchIsro() {
  const res = await fetch(ISRO_LAUNCHES);
  if (!res.ok) throw new Error(`Launch Library (ISRO) responded ${res.status}`);
  const json = await res.json();
  const list = json?.results;
  if (!Array.isArray(list) || list.length === 0) throw new Error("No ISRO launch data");

  return list
    .filter((l) => l.net)
    .map((l) => {
      const succeeded = l.status?.id === 3;
      const failed = l.status?.id === 4;
      const outcome = succeeded ? "successfully launched" : failed ? "launch of" : "launched";
      const missionName = l.mission?.name || l.name;
      return {
        source: "ISRO",
        title: failed ? `${l.rocket?.configuration?.name || "ISRO rocket"} — ${missionName} launch failure` : `ISRO ${outcome} ${missionName}`,
        date: new Date(l.net),
        excerpt: truncate(l.mission?.description, 180) || `${l.name} — ${l.status?.name || "status unavailable"}.`,
        link: "https://www.isro.gov.in",
      };
    });
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

export const NEWS_SOURCES = [fetchNasa, fetchIsro, fetchEsa];

// Fetches all sources in parallel, merges, sorts newest-first. Returns
// { items, failedCount } — failedCount lets callers show an honest "N
// sources didn't respond" note instead of silently hiding gaps.
export async function fetchAllLatestNews() {
  const results = await Promise.allSettled(NEWS_SOURCES.map((fn) => fn()));
  const items = [];
  let failedCount = 0;
  results.forEach((r) => {
    if (r.status === "fulfilled") items.push(...r.value);
    else failedCount += 1;
  });
  items.sort((a, b) => b.date - a.date);
  return { items, failedCount };
}

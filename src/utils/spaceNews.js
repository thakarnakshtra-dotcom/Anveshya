// Shared "latest space news" fetching — used by both the News page and
// Home's news preview section, so there's exactly one real implementation
// of each feed instead of two copies that could quietly drift apart.

const NASA_FEED = "https://www.nasa.gov/news-release/feed/";
const ISRO_SATELLITES = "https://isro.vercel.app/api/customer_satellites";
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

// ISRO: isro.vercel.app has no news/launch-log endpoint with dates or
// descriptions — /api/spacecrafts is just {id, name}. The one endpoint with
// real, verifiable dates is customer_satellites (launch_date, country,
// launcher, mass), so recent ISRO activity is built from that real data
// rather than any fabricated excerpt.
async function fetchIsro() {
  const res = await fetch(ISRO_SATELLITES);
  if (!res.ok) throw new Error(`ISRO API responded ${res.status}`);
  const json = await res.json();
  const list = json?.customer_satellites;
  if (!Array.isArray(list) || list.length === 0) throw new Error("No ISRO data");

  const parsed = list
    .map((s) => {
      const [d, m, y] = (s.launch_date || "").split("-").map(Number);
      const date = d && m && y ? new Date(y, m - 1, d) : null;
      return { ...s, date };
    })
    .filter((s) => s.date && !Number.isNaN(s.date.getTime()));

  parsed.sort((a, b) => b.date - a.date);

  return parsed.slice(0, 6).map((s) => ({
    source: "ISRO",
    title: `${s.id} launched for ${s.country}`,
    date: s.date,
    excerpt: `${s.mass ? `${s.mass} kg satellite ` : "Satellite "}launched aboard ${s.launcher || "an ISRO vehicle"}.`,
    link: "https://www.isro.gov.in",
  }));
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

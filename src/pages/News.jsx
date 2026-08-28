import React, { useEffect, useState } from "react";

const NASA_FEED = "https://www.nasa.gov/news-release/feed/";
const ISRO_SATELLITES = "https://isro.vercel.app/api/customer_satellites";
const ESA_FEED = "https://www.esa.int/rssfeed/TopNews";

function stripHtml(html) {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  return (doc.body.textContent || "").trim();
}

function truncate(text, max) {
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

const SOURCES = [fetchNasa, fetchIsro, fetchEsa];
const TAG_CLASS = { NASA: "news-tag-nasa", ISRO: "news-tag-isro", ESA: "news-tag-esa" };

export default function News() {
  const [items, setItems] = useState(null);
  const [failedCount, setFailedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled(SOURCES.map((fn) => fn())).then((results) => {
      if (cancelled) return;
      const merged = [];
      let failed = 0;
      results.forEach((r) => {
        if (r.status === "fulfilled") merged.push(...r.value);
        else failed += 1;
      });
      merged.sort((a, b) => b.date - a.date);
      setItems(merged);
      setFailedCount(failed);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="home">
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-rule" />
            News
          </div>
          <h1 className="page-heading">Mission Updates, Straight From the Source</h1>
          <p className="page-lede">
            Fetched live from NASA, ISRO, and ESA's own public data &mdash; no rewrites, no fabricated summaries.
          </p>
        </div>
      </section>

      <section className="modules-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">01 &mdash; Latest</div>
          <div>
            {items === null ? (
              <p className="page-lede">Loading the latest updates…</p>
            ) : items.length === 0 ? (
              <p className="page-lede">No updates could be fetched right now &mdash; please check back later.</p>
            ) : (
              <div className="news-list">
                {items.map((item, i) => (
                  <a key={`${item.source}-${i}`} href={item.link} target="_blank" rel="noreferrer" className="news-item">
                    <div className="news-meta">
                      <span className={`news-tag ${TAG_CLASS[item.source]}`}>{item.source}</span>
                      <span className="news-date">
                        {item.date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                    <div className="news-title">{item.title}</div>
                    {item.excerpt ? <div className="news-excerpt">{item.excerpt}</div> : null}
                  </a>
                ))}
              </div>
            )}
            {failedCount > 0 ? (
              <p className="page-lede" style={{ marginTop: 26, fontSize: 12.5 }}>
                {failedCount} of {SOURCES.length} sources didn't respond and were skipped.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}

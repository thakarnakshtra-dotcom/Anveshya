import React, { useEffect, useState } from "react";

function formatDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function truncate(text, max) {
  if (!text) return "";
  if (text.length <= max) return text;
  return `${text.slice(0, max).trim()}…`;
}

function pickLargeImage(links) {
  const byRender = (rel) => links?.find((l) => l.rel === rel && l.render === "image");
  return (
    byRender("alternate") && links.find((l) => l.href?.includes("~medium"))?.href
      ? links.find((l) => l.href?.includes("~medium")).href
      : byRender("alternate")?.href || byRender("preview")?.href
  );
}

const AGENCY_CLASS = {
  NASA: "agency-badge-nasa",
  ISRO: "agency-badge-isro",
  ESA: "agency-badge-esa",
  CNSA: "agency-badge-cnsa",
  JAXA: "agency-badge-jaxa",
};

function AgencyBadge({ agency }) {
  if (!agency) return null;
  return <span className={`agency-badge ${AGENCY_CLASS[agency] || ""}`}>{agency}</span>;
}

function MissionDetailModal({ mission, agency, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="mission-modal-backdrop" onClick={onClose}>
      <div className="mission-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="mission-modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
        <img className="mission-modal-image" src={mission.largeImage} alt={mission.title} />
        <div className="mission-modal-body">
          <div className="mission-meta">
            <AgencyBadge agency={agency} />
            {mission.date ? <div className="mission-date">{mission.date}</div> : null}
          </div>
          <h3 className="mission-modal-title">{mission.title}</h3>
          <p className="mission-modal-desc">{mission.description}</p>
          {mission.keywords?.length ? (
            <div className="mission-modal-keywords">
              {mission.keywords.map((k) => (
                <span key={k} className="mission-keyword">
                  {k}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mission-credit">{mission.credit}</div>
          <a
            className="site-launch mission-modal-link"
            href={`https://images.nasa.gov/details/${mission.nasaId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more on NASA.gov
          </a>
        </div>
      </div>
    </div>
  );
}

export default function MissionCard({ name, query, agency }) {
  const [status, setStatus] = useState("loading");
  const [mission, setMission] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const res = await fetch(
          `https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image`
        );
        if (!res.ok) throw new Error(`NASA API responded ${res.status}`);
        const json = await res.json();
        const item = json?.collection?.items?.[0];
        const data = item?.data?.[0];
        const image = item?.links?.find((l) => l.rel === "preview")?.href || item?.links?.[0]?.href;
        if (!data || !image) throw new Error("No usable result");

        if (!cancelled) {
          setMission({
            title: data.title || name,
            description: data.description || "",
            date: formatDate(data.date_created),
            credit: data.secondary_creator
              ? `Credit: ${data.secondary_creator}`
              : data.center
              ? `Credit: NASA/${data.center}`
              : "Credit: NASA",
            image,
            largeImage: pickLargeImage(item.links) || image,
            keywords: Array.isArray(data.keywords) ? data.keywords : [],
            nasaId: data.nasa_id,
          });
          setStatus("ready");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [name, query]);

  if (status === "error") return null;

  if (status === "loading") {
    return (
      <div className="mission-card">
        <div className="mission-image mission-image-skeleton" />
        <div className="mission-body">
          <div className="mission-meta">
            <AgencyBadge agency={agency} />
            <div className="mission-date">&nbsp;</div>
          </div>
          <div className="mission-title">{name}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <button type="button" className="mission-card mission-card-button" onClick={() => setOpen(true)}>
        <img className="mission-image" src={mission.image} alt={mission.title} loading="lazy" />
        <div className="mission-body">
          <div className="mission-meta">
            <AgencyBadge agency={agency} />
            {mission.date ? <div className="mission-date">{mission.date}</div> : null}
          </div>
          <div className="mission-title">{mission.title}</div>
          <div className="mission-desc">{truncate(mission.description, 200)}</div>
          <div className="mission-credit">{mission.credit}</div>
        </div>
      </button>
      {open ? <MissionDetailModal mission={mission} agency={agency} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

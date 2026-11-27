import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import AmbientBackground from "../components/AmbientBackground.jsx";
import { findLab } from "../labs/registry.js";
import LearnPanel from "../labs/shell/LearnPanel.jsx";
import "../labs/shell/lab.css";

// /learn/labs/<slug>: a lab's lessons as a reading page. The words come from
// the same content.js the lab itself shows, so they are edited in one place.
export default function LabLesson() {
  const { slug } = useParams();
  const lab = findLab(slug);
  const [searchParams, setSearchParams] = useSearchParams();
  const [content, setContent] = useState(null);

  useEffect(() => {
    let alive = true;
    setContent(null);
    lab?.loadContent().then((module) => alive && setContent(module.default));
    return () => {
      alive = false;
    };
  }, [lab]);

  const entries = content ? Object.entries(content.experiments) : [];
  const chosen = entries.find(([id]) => id === searchParams.get("experiment")) || entries[0];

  return (
    <main className="home lesson">
      <AmbientBackground variant="page" />
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-rule" />
            Learn &middot; Lab Lessons
          </div>
          <h1 className="page-heading">{lab ? lab.title : "Lesson not found"}</h1>
          <p className="page-lede">{lab ? lab.description : "There is no lab lesson at this address."}</p>
          <div className="lesson-actions">
            <Link to="/learn?section=labs" className="lesson-button">
              &larr; All lab lessons
            </Link>
            {lab ? (
              <Link to={`/labs/${slug}`} className="lesson-button lesson-button-primary">
                Open the lab &rarr;
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      {lab ? (
        <section className="modules-section" style={{ paddingTop: 0 }}>
          <div className="section-grid">
            <div className="section-eyebrow">Experiments</div>
            <div className="lesson-body">
              {chosen ? (
                <>
                  <div className="section-toggle" role="tablist" aria-label="Experiments">
                    {entries.map(([id, experiment]) => (
                      <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={id === chosen[0]}
                        className={id === chosen[0] ? "active" : ""}
                        onClick={() => setSearchParams({ experiment: id }, { replace: true })}
                      >
                        {experiment.name}
                      </button>
                    ))}
                  </div>
                  <h2 className="modules-heading">{chosen[1].name}</h2>
                  <p className="page-lede">{chosen[1].summary}</p>
                  <Link to={`/labs/${slug}?experiment=${chosen[0]}`} className="lesson-button lesson-button-primary">
                    Try this experiment &rarr;
                  </Link>
                  <LearnPanel key={chosen[0]} learn={chosen[1].learn} />
                </>
              ) : (
                <p className="page-lede">Loading the lesson&hellip;</p>
              )}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

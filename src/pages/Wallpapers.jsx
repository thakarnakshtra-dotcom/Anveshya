import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AmbientBackground from "../components/AmbientBackground.jsx";
import { PREMIUM_WALLPAPERS } from "../config/flags.js";
import data from "../data/wallpapers.json";

const ITEMS = data.items.filter((item) => item.tier === "free" || PREMIUM_WALLPAPERS);
const SHAPES = [
  { id: "16:9", label: "Desktop 16:9" },
  { id: "9:19.5", label: "Phone 9:19.5" },
];

const variantFor = (item, aspect) => item.variants.find((variant) => variant.aspect === aspect);
const fileName = (item, variant) => `anveshya-${item.id}-${variant.width}x${variant.height}.jpg`;

function Download({ item, variant }) {
  if (item.tier !== "free" || !variant.download) {
    return (
      <button type="button" className="wall-button" disabled>
        Premium &middot; not open yet
      </button>
    );
  }
  return (
    <a className="wall-button wall-button-primary" href={variant.download} download={fileName(item, variant)}>
      Download HD {variant.width} &times; {variant.height}
    </a>
  );
}

function Rights({ item }) {
  return (
    <p className="wall-rights">
      Credit: {item.credit}
      <br />
      License: {item.license}{" "}
      <a href={item.sourceUrl} {...(item.sourceUrl.startsWith("https://anveshya.space") ? {} : { target: "_blank", rel: "noopener noreferrer" })}>
        Source
      </a>
    </p>
  );
}

function Preview({ item, aspect, onClose }) {
  const ref = useRef(null);
  const variant = variantFor(item, aspect);
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      className={`wall-preview${aspect === "16:9" ? "" : " wall-preview-tall"}`}
      aria-labelledby="wall-preview-title"
      onClose={onClose}
      onClick={(event) => event.target === ref.current && ref.current.close()}
    >
      <div className="wall-preview-body">
        {/* Free pictures show the real file; premium ones only the small preview. */}
        <img src={variant.download || variant.preview} alt={`${item.title} wallpaper`} />
        <div className="wall-preview-info">
          <h2 id="wall-preview-title">{item.title}</h2>
          <p>
            {item.category} &middot; computer-generated artwork, not a photograph
          </p>
          <Rights item={item} />
          <div className="wall-actions">
            <Download item={item} variant={variant} />
            <button type="button" className="wall-button" onClick={() => ref.current.close()}>
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export default function Wallpapers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = data.categories.includes(searchParams.get("category")) ? searchParams.get("category") : "All";
  const [aspect, setAspect] = useState(() => (window.innerWidth < window.innerHeight ? "9:19.5" : "16:9"));
  const [open, setOpen] = useState(null);
  const shown = ITEMS.filter((item) => category === "All" || item.category === category);

  return (
    <main className="home wallpapers">
      <AmbientBackground variant="page" />
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-rule" />
            Wallpapers
          </div>
          <h1 className="page-heading">Space Wallpapers</h1>
          <p className="page-lede">
            Original artwork made for Anveshya, computed from mathematics rather than photographed. Free to download in
            HD for desktop and phone.
          </p>
        </div>
      </section>

      <section className="modules-section" style={{ paddingTop: 40 }}>
        <div className="wall-filters">
          <div className="wall-pills" role="group" aria-label="Category">
            {["All", ...data.categories].map((name) => (
              <button
                key={name}
                type="button"
                aria-pressed={name === category}
                onClick={() => setSearchParams(name === "All" ? {} : { category: name }, { replace: true })}
              >
                {name}
              </button>
            ))}
          </div>
          <div className="wall-pills" role="group" aria-label="Screen shape">
            {SHAPES.map((shape) => (
              <button key={shape.id} type="button" aria-pressed={shape.id === aspect} onClick={() => setAspect(shape.id)}>
                {shape.label}
              </button>
            ))}
          </div>
        </div>

        <ul className={`wall-grid${aspect === "16:9" ? "" : " wall-grid-tall"}`}>
          {shown.map((item) => {
            const variant = variantFor(item, aspect);
            return (
              <li key={item.id} className="wall-card">
                <button type="button" className="wall-image" onClick={() => setOpen(item)} aria-label={`Preview ${item.title}`}>
                  <img
                    src={variant.preview}
                    alt=""
                    loading="lazy"
                    style={{ aspectRatio: `${variant.width} / ${variant.height}` }}
                  />
                  {item.tier === "premium" ? <span className="wall-badge">Premium</span> : null}
                </button>
                <div className="wall-card-body">
                  <h2>{item.title}</h2>
                  <p className="wall-category">{item.category}</p>
                  <Rights item={item} />
                  <div className="wall-actions">
                    <button type="button" className="wall-button" onClick={() => setOpen(item)}>
                      Preview
                    </button>
                    <Download item={item} variant={variant} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <p className="wall-footnote">
          These pictures are artwork, not scientific data. NASA, ESA, ISRO and other agencies did not make or endorse
          them. See <Link to="/credits">Credits</Link>.
        </p>
      </section>

      {open ? <Preview item={open} aspect={aspect} onClose={() => setOpen(null)} /> : null}
    </main>
  );
}

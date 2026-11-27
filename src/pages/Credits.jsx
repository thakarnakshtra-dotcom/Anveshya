import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import AmbientBackground from "../components/AmbientBackground.jsx";
import data from "../data/wallpapers.json";
import { labs } from "../labs/registry.js";

function External({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function Section({ id, eyebrow, title, children }) {
  return (
    <section id={id} className="modules-section credits-section">
      <div className="section-grid">
        <div className="section-eyebrow">{eyebrow}</div>
        <div className="credits-body">
          <h2 className="modules-heading">{title}</h2>
          {children}
        </div>
      </div>
    </section>
  );
}

// Published work the lab formulas and pictures are based on.
const LAB_SOURCES = {
  "black-hole": [
    "K. Schwarzschild (1916): the spacetime outside a mass that does not spin.",
    "L. Flamm (1916): the curved surface used in the Curvature experiment.",
  ],
  wormhole: [
    "H. G. Ellis (1973) and M. Morris and K. Thorne (1988): the wormhole geometry.",
    "O. James, E. von Tunzelmann, P. Franklin and K. Thorne (2015): following light through a wormhole to picture it.",
  ],
  relativity: ["A. Einstein (1905 and 1915): special and general relativity."],
  "string-theory": [
    "A. J. Hanson (1994): the method for drawing Calabi–Yau cross-sections.",
    "T. Kaluza (1921) and O. Klein (1926): a curled-up extra dimension.",
  ],
};

const SOFTWARE = [
  ["React", "https://react.dev", "MIT"],
  ["React Router", "https://reactrouter.com", "MIT"],
  ["three.js", "https://threejs.org", "MIT"],
  ["React Three Fiber and drei", "https://github.com/pmndrs", "MIT"],
  ["postprocessing", "https://github.com/pmndrs/postprocessing", "Zlib"],
  ["Framer Motion", "https://motion.dev", "MIT"],
  ["Lucide icons", "https://lucide.dev", "ISC"],
  ["KaTeX", "https://katex.org", "MIT"],
  ["satellite.js", "https://github.com/shashwatak/satellite-js", "MIT"],
  ["Astronomy Engine", "https://github.com/cosinekitty/astronomy", "MIT"],
  ["Vite", "https://vitejs.dev", "MIT"],
];

export default function Credits() {
  const { hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [hash]);

  return (
    <main className="home credits">
      <AmbientBackground variant="page" />
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-rule" />
            Credits
          </div>
          <h1 className="page-heading">Credits &amp; Licences</h1>
          <p className="page-lede">
            Who made the things Anveshya is built with. NASA, ESA, ISRO, JAXA and other agencies named on this site are
            not affiliated with Anveshya and do not endorse it.
          </p>
        </div>
      </section>

      <Section id="labs" eyebrow="Labs" title="Labs">
        <p>
          The lab pictures, lessons and code were made for Anveshya. The physics comes from published work, including:
        </p>
        {labs.map((lab) => (
          <div key={lab.slug}>
            <h3>
              <Link to={`/labs/${lab.slug}`}>{lab.title}</Link>
            </h3>
            <ul>
              {LAB_SOURCES[lab.slug].map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </div>
        ))}
        <p>
          Constants follow the CODATA 2018 and IAU nominal values; the muon lifetime is from the Particle Data Group.
        </p>
      </Section>

      <Section id="wallpapers" eyebrow="Wallpapers" title="Wallpapers">
        <p>
          All wallpapers are original computer-generated artwork made for Anveshya from mathematics and random noise. No
          photographs or other people&rsquo;s images are used.
        </p>
        <ul className="credits-list">
          {data.items
            .filter((item) => item.tier === "free")
            .map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong> ({item.category}). {item.credit}. {item.license}
              </li>
            ))}
        </ul>
        <p>
          <Link to="/wallpapers">Open the wallpaper gallery &rarr;</Link>
        </p>
      </Section>

      <Section id="textures" eyebrow="Imagery" title="Planet textures and media">
        <p>
          Planet, Sun, Earth cloud and ring textures are from{" "}
          <External href="https://www.solarsystemscope.com/textures/">Solar System Scope</External>, under{" "}
          <External href="https://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0</External>.
          Solar System Scope notes that they are based on NASA elevation and imagery data, with colours and shading
          adjusted and gaps filled.
        </p>
        <p>
          Images, video, audio and news from space agencies belong to their owners and are credited where they are shown.
        </p>
      </Section>

      <Section id="fonts" eyebrow="Type" title="Fonts">
        <ul>
          <li>Anallop &copy; Marvadesign, designed by Febrie Setiawan (titles).</li>
          <li>
            Poppins &copy; 2020 The Poppins Project Authors,{" "}
            <External href="https://openfontlicense.org">SIL Open Font License 1.1</External>.
          </li>
          <li>JetBrains Mono and Noto Sans Devanagari, SIL Open Font License 1.1.</li>
        </ul>
      </Section>

      <Section id="software" eyebrow="Software" title="Open source software">
        <ul className="credits-list">
          {SOFTWARE.map(([name, url, licence]) => (
            <li key={name}>
              <External href={url}>{name}</External> &middot; {licence}
            </li>
          ))}
        </ul>
      </Section>
    </main>
  );
}

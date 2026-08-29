import React from "react";
import { Link } from "react-router-dom";
import AmbientBackground from "../components/AmbientBackground.jsx";
import SoundCard from "../components/SoundCard.jsx";
import { roverAndLanderSounds, sonifications, historicalSounds } from "../data/sounds.js";

export default function SoundsOfSpace() {
  return (
    <main className="home">
      <AmbientBackground variant="page" />
      <section className="page-hero">
        <div className="page-hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-rule" />
            <Link to="/learn" style={{ color: "inherit" }}>
              Learn
            </Link>
          </div>
          <h1 className="page-heading">Sounds and Voices of Space</h1>
          <p className="page-lede">
            Fourteen real recordings &mdash; rover microphones, telescope data turned into music, and the actual
            audio from history's biggest space moments. Every file links directly to NASA or the Chandra X-ray
            Center's own archives.
          </p>
        </div>
      </section>

      <section className="modules-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">01 &mdash; Sounds From Beyond</div>
          <div>
            <h2 className="modules-heading">Recorded on Other Worlds</h2>
            <p className="page-lede" style={{ margin: "0 0 30px" }}>
              Real microphone and instrument recordings from Mars rovers, landers, and deep-space flybys.
            </p>
            <div className="sounds-grid">
              {roverAndLanderSounds.map((s) => (
                <SoundCard key={s.title} {...s} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="modules-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">02 &mdash; Sonifications</div>
          <div>
            <h2 className="modules-heading">Data You Can Hear</h2>
            <p className="page-lede" style={{ margin: "0 0 30px" }}>
              NASA's Chandra X-ray Center converts telescope data &mdash; brightness, wavelength, position &mdash;
              directly into pitch and volume. Nothing here is decorative; every note maps to a real measurement.
            </p>
            <div className="sounds-grid">
              {sonifications.map((s) => (
                <SoundCard key={s.title} {...s} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="modules-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">03 &mdash; Historic Mission Audio</div>
          <div>
            <h2 className="modules-heading">Moments That Made History</h2>
            <p className="page-lede" style={{ margin: "0 0 30px" }}>
              The original recordings, straight from NASA's own historical archive.
            </p>
            <div className="sounds-grid">
              {historicalSounds.map((s) => (
                <SoundCard key={s.title} {...s} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="metrics-section" style={{ paddingTop: 0 }}>
        <div className="section-grid">
          <div className="section-eyebrow">04 &mdash; Coming Later</div>
          <div className="coming-soon-note">
            <div className="module-title">Video</div>
            <p className="page-lede" style={{ margin: "8px 0 0" }}>
              ISS live feeds and space agency video are a future phase &mdash; not fetched or embedded yet. This
              pass is audio only.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

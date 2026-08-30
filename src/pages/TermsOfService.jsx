import React from "react";
import AmbientBackground from "../components/AmbientBackground.jsx";

const CONTACT_EMAIL = "anveshya.space@gmail.com";

export default function TermsOfService() {
  return (
    <main className="home">
      <AmbientBackground variant="page" />
      <div className="policy-page">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last updated: August 30, 2026</p>

        <section>
          <h2>1. Agreement to Terms</h2>
          <p>
            By using Anveshya, you agree to these terms. Anveshya is an independent, solo-built project, currently
            free to use, with no accounts, subscriptions, or payments of any kind.
          </p>
        </section>

        <section>
          <h2>2. Use of the Site</h2>
          <p>
            Anveshya is provided for personal, educational, and non-commercial use. You're welcome to explore, learn
            from, and share links to the site. You may not:
          </p>
          <ul>
            <li>Copy or republish Anveshya's own original content (visuals, written content, code) as your own</li>
            <li>Use automated tools to scrape or bulk-download content (search-engine crawlers excepted)</li>
            <li>Attempt to interfere with, disrupt, or gain unauthorized access to the site or its systems</li>
            <li>Use the site for any unlawful purpose</li>
          </ul>
        </section>

        <section>
          <h2>3. Disclaimer</h2>
          <p>
            Anveshya is provided "as is." While we aim for accuracy, we don't guarantee that space-weather data,
            astronomical information, or any other content on the site is complete, error-free, or perfectly
            current &mdash; especially where it depends on third-party feeds (NASA, ISRO, ESA, JAXA, NOAA) that are
            outside our control. SolarShield's storm-likelihood figure is explicitly a heuristic estimate, not a
            validated forecast, as the page itself states. Don't rely on Anveshya alone for decisions where accuracy
            genuinely matters &mdash; verify independently.
          </p>
        </section>

        <section>
          <h2>4. Limitation of Liability</h2>
          <p>
            To the extent permitted by law, Anveshya and its creator are not liable for any damages arising from
            your use of, or inability to use, the site &mdash; including reliance on any data or content shown here.
          </p>
        </section>

        <section>
          <h2>5. Content Ownership</h2>
          <p>
            <strong>Anveshya's own content:</strong> the 3D visualizations, interactive features, and original
            written content are owned by Anveshya.
          </p>
          <p>
            <strong>Third-party content:</strong> space imagery and data from NASA, ISRO, ESA, JAXA, and NOAA are
            used under their respective public-domain or open-access terms, with credit given where shown on the
            site.
          </p>
          <p>
            <strong>Feedback you submit:</strong> anything you send through the feedback form may be used to improve
            Anveshya. We don't claim ownership of it beyond that.
          </p>
        </section>

        <section>
          <h2>6. Prohibited Conduct</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use Anveshya for any unlawful or harmful purpose</li>
            <li>Harass or harm other visitors</li>
            <li>Interfere with the normal operation of the site</li>
            <li>Attempt unauthorized access to any part of the site or its infrastructure</li>
            <li>Use bots or automated scripts to interact with the site beyond normal browsing (search-engine crawlers excepted)</li>
          </ul>
        </section>

        <section>
          <h2>7. Changes to the Site</h2>
          <p>
            Anveshya is actively developed and may change &mdash; features can be added, changed, or removed at any
            time without notice, as noted throughout the site itself (several features are explicitly marked "in
            active development").
          </p>
        </section>

        <section>
          <h2>8. Governing Law</h2>
          <p>
            These terms are governed by the laws of India, and any disputes fall under the jurisdiction of the
            courts in Surat, Gujarat.
          </p>
        </section>

        <section>
          <h2>9. Changes to These Terms</h2>
          <p>
            If these terms change, we'll update the date at the top of this page. Continued use of Anveshya after a
            change means you accept the updated terms.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            <strong>Email:</strong> {CONTACT_EMAIL}
            <br />
            <strong>Location:</strong> Surat, Gujarat, India
          </p>
        </section>
      </div>
    </main>
  );
}

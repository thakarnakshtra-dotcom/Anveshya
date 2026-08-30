import React from "react";
import AmbientBackground from "../components/AmbientBackground.jsx";

const CONTACT_EMAIL = "anveshya.space@gmail.com";

export default function PrivacyPolicy() {
  return (
    <main className="home">
      <AmbientBackground variant="page" />
      <div className="policy-page">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: August 30, 2026</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Anveshya is an independent, solo-built space exploration and education platform. This policy explains,
            plainly, what data this site actually collects and what it does with it &mdash; nothing more than what's
            described below.
          </p>
        </section>

        <section>
          <h2>2. What We Don't Collect</h2>
          <p>
            Anveshya has no user accounts, no sign-up or login, and no payment or subscription system of any kind
            &mdash; there is nothing to pay for. We also don't run Google Analytics or any other third-party
            analytics or advertising tracker on this site.
          </p>
        </section>

        <section>
          <h2>3. What We Do Collect</h2>
          <p>
            <strong>Feedback form:</strong> If you submit the feedback form, we collect your message, optional
            rating, feedback type, and the page you were on. Name and email are optional fields &mdash; we only have
            them if you choose to provide them. This is sent to a private Google Sheet via a server-side function;
            it never touches a third-party analytics or ad service.
          </p>
          <p>
            <strong>Event reminders:</strong> If you set a reminder on the News page, it's saved only in your own
            browser's local storage. It is never sent to us or to any server &mdash; we have no way to see it, and
            it disappears if you clear your browser's site data.
          </p>
          <p>
            <strong>Browser storage (not cookies):</strong> The site uses your browser's local/session storage for a
            few small, non-identifying things: whether you've already seen the intro animation this session, whether
            the feedback prompt has already shown, and your saved reminders. None of this is a tracking cookie and
            none of it leaves your device.
          </p>
          <p>
            <strong>Standard server logs:</strong> Like effectively every website, our hosting provider (Netlify)
            may log basic technical request information &mdash; such as IP address, browser type, and timestamp
            &mdash; for security and operational purposes. We don't separately access or analyze this for tracking.
          </p>
        </section>

        <section>
          <h2>4. How We Use It</h2>
          <ul>
            <li>To read and act on feedback you submit, and improve Anveshya based on it</li>
            <li>To reply if you've given us an email and asked a question</li>
            <li>To keep the site running securely (via our hosting provider's standard logs)</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Sharing</h2>
          <p>We do not sell your data. The only places feedback data flows to are:</p>
          <ul>
            <li>
              <strong>Google Sheets/Apps Script</strong> &mdash; where submitted feedback is stored, under Google's
              own terms
            </li>
            <li>
              <strong>Netlify</strong> &mdash; our hosting provider, which serves the site and runs the small
              server-side function that forwards feedback
            </li>
            <li>
              <strong>Legal authorities</strong> &mdash; only if we're legally required to disclose something
            </li>
          </ul>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            Feedback submissions are kept in the Google Sheet indefinitely so they remain useful for improving the
            site. Reminder data lives only in your own browser and is never held by us at all. You can ask us to
            delete a feedback submission at any time by emailing {CONTACT_EMAIL} &mdash; include enough detail (e.g.
            the email you used, or roughly when you submitted it) for us to find it.
          </p>
        </section>

        <section>
          <h2>7. Security</h2>
          <p>
            The site is served over HTTPS. No system is ever 100% secure, but there's also very little to secure
            here &mdash; there are no accounts or passwords to protect, since none exist. If you notice something
            that looks like a security issue, email {CONTACT_EMAIL}.
          </p>
        </section>

        <section>
          <h2>8. Your Rights</h2>
          <p>Since there's no account system, this is simple: you can ask us at any time to</p>
          <ul>
            <li>Tell you what feedback (if any) we have tied to your email</li>
            <li>Delete a feedback submission</li>
            <li>Correct something you got wrong in a submission</li>
          </ul>
          <p>
            Email {CONTACT_EMAIL} for any of these.
          </p>
        </section>

        <section>
          <h2>9. Third-Party Content</h2>
          <p>
            Anveshya displays real imagery, mission data, and space-weather data from NASA, ISRO, ESA, JAXA, and
            NOAA, all of which is publicly available. We fetch this data to display it on the site &mdash; we don't
            send your data to these agencies, and visiting Anveshya doesn't create any account or relationship with
            them.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Policy</h2>
          <p>
            If this policy changes, we'll update the date at the top of this page. Significant changes will be
            reflected here as soon as they happen &mdash; there's no separate mailing list to notify, since we don't
            collect emails for that purpose.
          </p>
        </section>

        <section>
          <h2>11. Contact</h2>
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

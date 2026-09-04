import React, { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Different from ReminderBell.jsx on this same page: ReminderBell sets a
// one-off browser Notification for a single event you're looking at right
// now (no account, no email, stored locally). This is the opposite shape —
// an email opt-in for ongoing categorized alerts, independent of any one
// event. Posts to the same /.netlify/functions/newsletter endpoint (and
// the same newsletter_emails Supabase table) as the home page's simple
// signup — this is that same subscriber list, just with an optional name
// and interest picks attached, not a second, separately-tracked list.
const INTERESTS = [
  { id: "discoveries", label: "Space Discoveries" },
  { id: "missions", label: "Mission Updates" },
  { id: "events", label: "Astronomical Events" },
  { id: "features", label: "New Anveshya Features" },
];

export default function EventReminder() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // Single-select now (radio, not checkboxes) — a real behavior change,
  // not just a visual one: this form used to let someone pick multiple
  // interests, now it only allows one. Sent to the backend as a
  // one-element array (or none) so /.netlify/functions/newsletter and its
  // `interests text[]` column need no changes either way.
  const [interest, setInterest] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorDetail, setErrorDetail] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) {
      setStatus("error");
      setErrorDetail("Please enter your name.");
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      setStatus("error");
      setErrorDetail("That doesn't look like a valid email address.");
      return;
    }

    setStatus("submitting");
    setErrorDetail("");
    try {
      const res = await fetch("/.netlify/functions/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          name: trimmedName,
          interests: interest ? [interest] : [],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorDetail(String(err.message || err));
    }
  };

  return (
    <section className="modules-section" style={{ paddingTop: 0 }}>
      <div className="section-grid">
        <div className="section-eyebrow">Stay In The Loop</div>
        <div>
          <h2 className="modules-heading">Get Alerts For What You Actually Care About</h2>
          <p className="page-lede" style={{ margin: "0 0 30px" }}>
            One-off reminders for a specific launch or eclipse are the bell icon next to each event above. This is
            different: an email opt-in for ongoing updates, picked by category &mdash; no spam, unsubscribe any time.
          </p>

          {status === "success" ? (
            <p className="newsletter-success">&#10003; You're subscribed &mdash; thanks!</p>
          ) : (
            <form className="alert-form" onSubmit={handleSubmit} noValidate>
              <div className="alert-form-row">
                <label className="feedback-field" style={{ flex: 1 }}>
                  Name
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={255} required />
                </label>
                <label className="feedback-field" style={{ flex: 1 }}>
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    maxLength={255}
                    required
                  />
                </label>
              </div>

              <div className="feedback-field">
                What would you like alerts about? <span className="feedback-optional">(optional)</span>
                <div className="alert-radio-group">
                  {INTERESTS.map((opt) => (
                    <label key={opt.id} className="alert-radio">
                      <input
                        type="radio"
                        name="interest"
                        checked={interest === opt.id}
                        onChange={() => setInterest(opt.id)}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="newsletter-submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Subscribing…" : "Subscribe to Alerts"}
              </button>
            </form>
          )}
          {status === "error" ? <p className="newsletter-error">{errorDetail || "Couldn't subscribe — please try again."}</p> : null}
        </div>
      </div>
    </section>
  );
}

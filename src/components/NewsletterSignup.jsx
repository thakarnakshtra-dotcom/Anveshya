import React, { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Home-page email capture. Posts to /.netlify/functions/newsletter, which
// saves into Supabase server-side — see that file and NEWSLETTER_SETUP.md
// for the "why" (client never touches Supabase directly, same pattern as
// FeedbackForm.jsx's feedback endpoint).
export default function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorDetail, setErrorDetail] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_RE.test(trimmed)) {
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
        body: JSON.stringify({ email: trimmed }),
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
        <div className="section-eyebrow">04 &mdash; Stay In The Loop</div>
        <div>
          <h2 className="modules-heading">Get Updates On The Premium Launch</h2>
          <p className="page-lede newsletter-lede">
            Drop your email and we'll let you know when Anveshya's premium tier goes live &mdash; no spam, just the
            occasional real update.
          </p>

          {status === "success" ? (
            <p className="newsletter-success">&#10003; You're on the list &mdash; thanks!</p>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubmit} noValidate>
              <input
                type="email"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={255}
                aria-label="Email address"
              />
              <button type="submit" className="newsletter-submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Joining…" : "Get updates"}
              </button>
            </form>
          )}
          {status === "error" ? <p className="newsletter-error">{errorDetail || "Couldn't sign up — please try again."}</p> : null}
        </div>
      </div>
    </section>
  );
}

import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const SHOWN_KEY = "anveshya-feedback-shown";
const DELAY_MS = 5 * 60 * 1000;
const FEEDBACK_TYPES = ["Compliment", "Suggestion", "Bug report", "Other"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function StarIcon({ filled }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "#ffd27f" : "none"} stroke={filled ? "#ffd27f" : "#6f7d94"} strokeWidth="1.4" strokeLinejoin="round">
      <path d="M12 3.5l2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </svg>
  );
}

function StarRating({ value, onChange }) {
  return (
    <div className="feedback-stars" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className="feedback-star"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onClick={() => onChange(value === n ? 0 : n)}
        >
          <StarIcon filled={n <= value} />
        </button>
      ))}
    </div>
  );
}

// Site-wide feedback prompt. Shows once per browser tab session, 5 minutes
// after the tab opens (sessionStorage — not localStorage — is what makes a
// fresh tab/reload restart that timer, per spec). Submits through
// /.netlify/functions/feedback, which forwards to a Google Sheets Apps
// Script webhook server-side; see netlify/functions/feedback.js for why
// this doesn't call Google directly from the browser.
export default function FeedbackForm() {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState(FEEDBACK_TYPES[1]);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [errorDetail, setErrorDetail] = useState("");
  const location = useLocation();
  const pageRef = useRef(location.pathname);
  pageRef.current = location.pathname;

  useEffect(() => {
    let alreadyShown;
    try {
      alreadyShown = sessionStorage.getItem(SHOWN_KEY);
    } catch {
      // Storage unavailable (private mode, etc.) — treat as "not shown yet"
      // for this load; just won't persist across reloads in that case.
      alreadyShown = null;
    }
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setVisible(true);
      try {
        sessionStorage.setItem(SHOWN_KEY, "true");
      } catch {
        // Can't persist the flag — worst case it can show again after a
        // reload in this browsing mode, which isn't worth failing over.
      }
    }, DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  const handleClose = () => setVisible(false);

  const validate = () => {
    const next = {};
    if (message.trim().length < 10) {
      next.message = "Please write at least 10 characters.";
    }
    if (email.trim() && !EMAIL_RE.test(email.trim())) {
      next.email = "That doesn't look like a valid email address.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setStatus("submitting");
    setErrorDetail("");
    try {
      const res = await fetch("/.netlify/functions/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          name: name.trim(),
          email: email.trim(),
          feedbackType,
          message: message.trim(),
          rating: rating || "",
          page: pageRef.current,
          userAgent: navigator.userAgent,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);

      setStatus("success");
      setTimeout(() => setVisible(false), 2000);
    } catch (err) {
      setStatus("error");
      setErrorDetail(String(err.message || err));
    }
  };

  return (
    <div className="feedback-modal-overlay" onClick={handleClose}>
      <div
        className="feedback-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Share feedback"
      >
        <button type="button" className="feedback-modal-close" onClick={handleClose} aria-label="Close">
          &times;
        </button>

        {status === "success" ? (
          <div className="feedback-confirm">
            <div className="feedback-confirm-check">&#10003;</div>
            <p className="feedback-confirm-text">Thank you for your feedback!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="feedback-modal-kicker">Anveshya</div>
            <h3 className="feedback-modal-title">Got a minute for feedback?</h3>
            <p className="feedback-modal-subtitle">
              Compliments, bugs, ideas — anything helps this get better.
            </p>

            <label className="feedback-field">
              Name <span className="feedback-optional">(optional)</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={200} />
            </label>

            <label className="feedback-field">
              Email <span className="feedback-optional">(optional)</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={200}
              />
              {errors.email ? <span className="feedback-error">{errors.email}</span> : null}
            </label>

            <label className="feedback-field">
              Feedback type
              <select value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)}>
                {FEEDBACK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="feedback-field">
              Message
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's on your mind? (min. 10 characters)"
                rows={4}
                maxLength={4000}
              />
              {errors.message ? <span className="feedback-error">{errors.message}</span> : null}
            </label>

            <label className="feedback-field">
              Rating <span className="feedback-optional">(optional)</span>
              <StarRating value={rating} onChange={setRating} />
            </label>

            {status === "error" ? (
              <p className="feedback-submit-error">
                Couldn't send that — {errorDetail || "please try again in a moment."}
              </p>
            ) : null}

            <button type="submit" className="feedback-submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending…" : "Submit Feedback"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

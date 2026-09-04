// Feedback handler — saves to Supabase.
//
// This replaces feedback.js (the Google Sheets/Apps Script forwarder) as
// what FeedbackForm.jsx actually calls, per an explicit request to move
// feedback storage to Supabase. feedback.js itself is left in place, not
// deleted — it's real, working infrastructure the site owner already set
// up their own Google account/Sheet/Apps Script for (see
// FEEDBACK_SETUP.md); if Supabase ever needs to be backed out, that path
// still works, it's just not what the form calls right now.
//
// Same shape as netlify/functions/newsletter.js: talks to Supabase over
// its plain PostgREST HTTP API via `fetch`, not the `@supabase/supabase-js`
// SDK — this project doesn't pull in an SDK for any third-party call
// anywhere else, and one INSERT doesn't need one either. See
// FEEDBACK_SETUP.md's "Supabase" section for the table + env vars this
// needs (SUPABASE_URL / SUPABASE_SERVICE_KEY — the same ones
// netlify/functions/newsletter.js already uses, not a second pair).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LEN = 255;
const MAX_MESSAGE_LEN = 4000;

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export async function handler(event) {
  const headers = corsHeaders();

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: "Feedback isn't connected to a database yet. SUPABASE_URL / SUPABASE_SERVICE_KEY are not configured.",
      }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const name = String(payload.name || "").trim().slice(0, MAX_LEN);
  const email = String(payload.email || "").trim().toLowerCase().slice(0, MAX_LEN);
  const message = String(payload.message || "").trim().slice(0, MAX_MESSAGE_LEN);

  if (!name) return { statusCode: 400, headers, body: JSON.stringify({ error: "Name is required." }) };
  if (!email || !EMAIL_RE.test(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Enter a valid email address." }) };
  }
  if (message.length < 10) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Message must be at least 10 characters." }) };
  }

  const row = {
    name,
    email,
    message,
    feedback_type: String(payload.feedbackType || payload.category || "General").slice(0, 50),
  };
  if (Number.isInteger(payload.rating) && payload.rating >= 1 && payload.rating <= 5) row.rating = payload.rating;
  if (payload.page) row.page = String(payload.page).slice(0, MAX_LEN);
  if (payload.userAgent) row.user_agent = String(payload.userAgent).slice(0, MAX_LEN);

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/feedback_messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Supabase responded ${res.status}: ${detail.slice(0, 300)}`);
    }

    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Could not save that right now.", detail: String(err.message || err) }),
    };
  }
}

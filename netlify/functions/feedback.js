// Feedback form submission handler.
//
// The client never talks to Google directly — it POSTs here, and this
// function forwards to a Google Apps Script "Web app" webhook whose URL
// lives in the FEEDBACK_WEBHOOK_URL environment variable (Netlify site
// settings in production, a local .env file for `npm run dev`). That
// keeps the webhook URL out of the client bundle entirely and sidesteps
// Apps Script's CORS behavior, which otherwise forces the client into a
// no-cors fetch that can't confirm success or report real errors back to
// the visitor.
//
// If FEEDBACK_WEBHOOK_URL isn't set, this returns a clear 503 rather than
// pretending the submission was saved somewhere — see the setup notes in
// the project README / commit message for how to create that webhook.

const MAX_MESSAGE_LEN = 4000;
const MAX_FIELD_LEN = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_TYPES = ["Compliment", "Suggestion", "Bug report", "Other"];

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

  const webhookUrl = process.env.FEEDBACK_WEBHOOK_URL;
  if (!webhookUrl) {
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: "Feedback isn't connected to a destination yet. FEEDBACK_WEBHOOK_URL is not configured.",
      }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const name = String(payload.name || "").slice(0, MAX_FIELD_LEN).trim();
  const email = String(payload.email || "").slice(0, MAX_FIELD_LEN).trim();
  const feedbackType = VALID_TYPES.includes(payload.feedbackType) ? payload.feedbackType : "Other";
  const message = String(payload.message || "").slice(0, MAX_MESSAGE_LEN).trim();
  const rating = Number.isInteger(payload.rating) && payload.rating >= 1 && payload.rating <= 5 ? payload.rating : "";
  const page = String(payload.page || "").slice(0, MAX_FIELD_LEN);
  const userAgent = String(payload.userAgent || "").slice(0, MAX_FIELD_LEN);

  if (message.length < 10) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Message must be at least 10 characters." }),
    };
  }
  if (email && !EMAIL_RE.test(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Email address doesn't look valid." }) };
  }

  const record = {
    timestamp: new Date().toISOString(),
    name,
    email,
    feedbackType,
    message,
    rating,
    page,
    userAgent,
  };

  try {
    // Apps Script web apps commonly 302-redirect the POST to the actual
    // execution URL — `redirect: "follow"` (fetch's default) handles that
    // transparently; no need to special-case it here.
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Webhook responded ${res.status}: ${detail.slice(0, 300)}`);
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Could not reach the feedback destination.", detail: String(err.message || err) }),
    };
  }
}

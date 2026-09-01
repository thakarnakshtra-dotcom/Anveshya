// Newsletter signup handler.
//
// The client never talks to Supabase directly — it POSTs an email here,
// and this function inserts it into Supabase's `newsletter_emails` table
// using the project's service_role key (server-side only, never shipped
// to the browser). That's the same shape as feedback.js: keep the secret
// out of the client bundle, and let the function return a real error
// instead of a fire-and-forget client-side call.
//
// Talks to Supabase over its plain PostgREST HTTP API (a `fetch` call)
// rather than the `@supabase/supabase-js` SDK — this project doesn't pull
// in an SDK for any other third-party call (see solarshield.js, feedback.js),
// and one INSERT doesn't need one.
//
// If SUPABASE_URL / SUPABASE_SERVICE_KEY aren't set, this returns a clear
// 503 rather than pretending the signup was saved — see NEWSLETTER_SETUP.md
// for how to create the Supabase project and get those values.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 255;

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
        error: "Newsletter isn't connected to a database yet. SUPABASE_URL / SUPABASE_SERVICE_KEY are not configured.",
      }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const email = String(payload.email || "").trim().toLowerCase().slice(0, MAX_EMAIL_LEN);
  if (!email || !EMAIL_RE.test(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Enter a valid email address." }) };
  }

  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/newsletter_emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        // Ask Postgres to no-op instead of erroring on the `email UNIQUE`
        // constraint — a repeat signup should read as success, not a 409.
        Prefer: "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Supabase responded ${res.status}: ${detail.slice(0, 300)}`);
    }

    return { statusCode: 201, headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return {
      statusCode: 502,
      headers,
      body: JSON.stringify({ error: "Could not save that right now.", detail: String(err.message || err) }),
    };
  }
}

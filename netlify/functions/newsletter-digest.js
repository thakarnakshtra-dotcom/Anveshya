// Weekly newsletter-signup digest.
//
// Runs on Netlify's cron scheduler (see the `schedule` entry in
// netlify.toml — Mondays at 09:00 UTC) rather than being called from the
// browser, so there's no CORS/client concern here. It reads the last 7
// days of `newsletter_emails` rows from Supabase and emails a short
// summary via SendGrid's REST API (no @sendgrid/mail dependency needed
// for one POST — same reasoning as newsletter.js talking to Supabase
// directly over fetch).
//
// This is genuinely optional: if any of the four env vars below aren't
// set, it logs why and returns cleanly instead of throwing — signups
// still land in Supabase and are visible any time in its table editor,
// this function only adds the "get pinged automatically" convenience.
// See NEWSLETTER_SETUP.md for how to get a SendGrid key.

function fmtDate(iso) {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });
}

export async function handler() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const notifyEmail = process.env.NOTIFY_EMAIL;

  if (!supabaseUrl || !serviceKey) {
    console.log("newsletter-digest: skipped — SUPABASE_URL/SUPABASE_SERVICE_KEY not set.");
    return { statusCode: 200, body: "skipped: supabase not configured" };
  }
  if (!sendgridKey || !fromEmail || !notifyEmail) {
    console.log(
      "newsletter-digest: skipped — SENDGRID_API_KEY/SENDGRID_FROM_EMAIL/NOTIFY_EMAIL not set. " +
        "Signups are still being saved in Supabase; only the email summary is off."
    );
    return { statusCode: 200, body: "skipped: sendgrid not configured" };
  }

  const sinceIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  let recent = [];
  let totalCount = null;
  try {
    const recentRes = await fetch(
      `${supabaseUrl}/rest/v1/newsletter_emails?select=email,created_at&created_at=gte.${encodeURIComponent(sinceIso)}&order=created_at.desc`,
      { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
    );
    if (!recentRes.ok) throw new Error(`Supabase responded ${recentRes.status}`);
    recent = await recentRes.json();

    // Range: 0-0 + Prefer: count=exact gets the total row count from the
    // Content-Range response header without pulling every row's data.
    const countRes = await fetch(`${supabaseUrl}/rest/v1/newsletter_emails?select=id`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "count=exact",
        Range: "0-0",
      },
    });
    const contentRange = countRes.headers.get("content-range"); // "0-0/123"
    totalCount = contentRange ? Number(contentRange.split("/")[1]) : null;
  } catch (err) {
    console.error("newsletter-digest: failed to read Supabase", err);
    return { statusCode: 200, body: "skipped: supabase read failed" };
  }

  const rowsHtml = recent.length
    ? recent.map((r) => `<li>${r.email} &mdash; ${fmtDate(r.created_at)}</li>`).join("")
    : "<li>No new signups this week.</li>";

  const html = `
    <p><strong>${recent.length}</strong> new newsletter signup${recent.length === 1 ? "" : "s"} in the last 7 days${
    totalCount != null ? ` &middot; <strong>${totalCount}</strong> total` : ""
  }.</p>
    <ul>${rowsHtml}</ul>
  `.trim();

  try {
    const mailRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${sendgridKey}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: notifyEmail }] }],
        from: { email: fromEmail, name: "Anveshya" },
        subject: `Anveshya newsletter: ${recent.length} new signup${recent.length === 1 ? "" : "s"} this week`,
        content: [{ type: "text/html", value: html }],
      }),
    });
    if (!mailRes.ok) {
      const detail = await mailRes.text().catch(() => "");
      throw new Error(`SendGrid responded ${mailRes.status}: ${detail.slice(0, 300)}`);
    }
    return { statusCode: 200, body: "digest sent" };
  } catch (err) {
    console.error("newsletter-digest: failed to send email", err);
    return { statusCode: 200, body: "skipped: email send failed" };
  }
}

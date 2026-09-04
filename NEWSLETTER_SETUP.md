# Newsletter signup → Supabase setup

The signup form (home page) and its `/.netlify/functions/newsletter`
proxy are already built and deployed. What's left is the part that needs
your own accounts — I can't create a Supabase project or a SendGrid
account on your behalf.

There are two parts. **Part 1 is what you need for Friday's launch.**
Part 2 (the weekly digest email) is a convenience on top — signups save
fine without it, so it's fine to do later.

## Part 1 — Supabase (required for signups to save)

### 1. Create the project

1. Go to [supabase.com](https://supabase.com) and sign up (GitHub or
   email, free, no card needed).
2. Create a new project:
   - **Name:** anveshya (or anything)
   - **Database password:** generate a strong one and save it somewhere
     — you won't need it for this setup, but Supabase wants it on record.
   - **Region:** pick whatever's closest to you (e.g. Singapore for
     India) — it only affects latency, not correctness.
3. Wait ~2 minutes for it to finish provisioning.

### 2. Create the table

1. In the left sidebar, click **SQL Editor → New query**.
2. Paste this and click **Run**:

   ```sql
   create table newsletter_emails (
     id uuid primary key default gen_random_uuid(),
     email varchar(255) unique not null,
     created_at timestamptz default now()
   );

   -- Row Level Security stays ON with zero policies attached. That's
   -- deliberate, not incomplete: the browser never talks to Supabase
   -- directly (the Netlify function does, using the service_role key,
   -- which bypasses RLS by design) — so there is no legitimate reason
   -- for this table to be reachable with the public anon key at all.
   -- Leaving it policy-less locks that door rather than needing to
   -- remember to.
   alter table newsletter_emails enable row level security;
   ```

   You should see "Success. No rows returned."

### 3. Get your keys

1. Left sidebar → **Settings (gear icon) → API**.
2. Copy two values:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **service_role** key, under "Project API keys" — **not** the `anon`
     `public` one. This key bypasses Row Level Security, which is exactly
     why it must never reach the browser — only the Netlify function
     holds it, server-side.

### 4. Wire it in

**Local dev:**
```bash
cp .env.example .env
```
Then paste into `.env`:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=<the service_role key>
```
Restart `npm run dev` (and `netlify dev` if you're running functions
locally) after saving.

**Production (Netlify):**
1. Netlify dashboard → your site → **Site configuration → Environment
   variables**.
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` with the values above.
3. Redeploy so the function picks them up.

That's it — the signup form on the home page will start saving real
rows into `newsletter_emails`. You can see them any time in Supabase's
**Table Editor**, no digest email required.

## Part 2 — SendGrid (optional: weekly digest email)

`netlify/functions/newsletter-digest.js` runs automatically every Monday
09:00 UTC (see the `schedule` entry in `netlify.toml`) and, if configured,
emails you a summary of the week's new signups. Skip this section
entirely if you're fine checking the Supabase table editor instead —
nothing else depends on it.

1. Go to [sendgrid.com](https://sendgrid.com) and sign up (free tier,
   100 emails/day, no card needed).
2. **Settings → Sender Authentication → Verify a Single Sender.** Fill in
   an email address you control (this becomes `SENDGRID_FROM_EMAIL` below)
   and confirm the verification email it sends you. SendGrid will not let
   you send mail from an unverified sender — this step isn't optional.
3. **Settings → API Keys → Create API Key** (Restricted Access is fine;
   it only needs "Mail Send" permission). Copy it — SendGrid only shows it
   once.
4. Add three more variables, same way as Part 1 (`.env` locally, Netlify
   dashboard for production):
   ```
   SENDGRID_API_KEY=<the API key>
   SENDGRID_FROM_EMAIL=<the address you verified in step 2>
   NOTIFY_EMAIL=<where you want the weekly digest sent — can be the same address>
   ```

Netlify's scheduled functions run in production only, not in local
`netlify dev` — you won't see this fire until it's deployed, and even
then not until the next Monday. To check it's wired correctly sooner,
Netlify's function logs (Site → Functions → newsletter-digest) will show
either "digest sent" or exactly which env var is still missing.

## Part 3 — Alert-preferences columns (required for the News page's subscribe form)

The News page's "Get Alerts For What You Actually Care About" form
(added after Part 1/2 above) sends a `name` and a list of `interests`
along with the email — the same `newsletter_emails` table from Part 1
just needs two more columns to hold them. The home page's simpler
signup keeps working exactly as before either way; it never sends these
fields, and the columns are nullable so that's fine.

1. **SQL Editor → New query** again, paste and run:

   ```sql
   alter table newsletter_emails
     add column if not exists name varchar(255),
     add column if not exists interests text[];
   ```

2. Nothing else to configure — the Netlify function already validates
   `interests` against a fixed list (discoveries/missions/events/
   features) before writing, so a row's `interests` column only ever
   holds those four values, never arbitrary client input.

Until this migration runs, the News page's form will fail with a clear
"Couldn't subscribe" error rather than a silently-dropped submission —
Supabase rejects the insert outright when a column doesn't exist yet,
and the function surfaces that as a real error instead of a fake
success.

## Notes

- Until `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` are set, the signup
  function returns a clear error instead of silently discarding
  emails — the form will show "Couldn't sign up..." rather than a false
  success message.
- A repeat signup (same email twice) is treated as success, not an
  error — it just doesn't create a second row.
- Neither key/URL here is anything you type into the browser or commit
  to git — `.env` is already in `.gitignore`, and production values live
  only in Netlify's environment variable settings.

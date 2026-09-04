# Feedback form → Supabase setup

**Changed:** the feedback form now saves to Supabase
(`netlify/functions/send-feedback.js`), not the Google Sheet below
anymore. If you already set up that Sheet following this doc earlier,
it's not broken — it just won't receive new rows, since the form no
longer calls `netlify/functions/feedback.js` (that function and your
Apps Script webhook are both left in place and still work, in case you
ever want to switch back — see "Reverting to Google Sheets" at the
bottom).

## 1. Add the table (same Supabase project as the newsletter/alerts signups)

If you already went through `NEWSLETTER_SETUP.md`, this is the *same*
Supabase project — no new account, no new `SUPABASE_URL` /
`SUPABASE_SERVICE_KEY`. If you haven't, do `NEWSLETTER_SETUP.md`'s Part 1
first (create the project, get those two values, wire them into `.env`
and Netlify) — the feedback function reads the exact same two
environment variables.

**SQL Editor → New query**, paste and run:

```sql
create table feedback_messages (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  email varchar(255) not null,
  feedback_type varchar(50),
  message text not null,
  rating smallint,
  page varchar(255),
  user_agent varchar(255),
  created_at timestamptz default now()
);

-- Same reasoning as newsletter_emails in NEWSLETTER_SETUP.md: RLS on,
-- zero policies. The browser never talks to Supabase directly — only
-- the Netlify function does, with the service_role key, which bypasses
-- RLS by design — so there's no legitimate reason the anon key should
-- ever be able to read or write this table.
alter table feedback_messages enable row level security;
```

That's it. Submissions show up in **Table Editor → feedback_messages**
— name, email, category, message, star rating (if given), the page it
was submitted from, and the visitor's user agent.

## Notes

- Until the table exists (or the env vars aren't set), the form shows a
  real "Couldn't send that..." error — same honest-failure behavior as
  the newsletter/alerts signups, not a false success message.
- Name, email, and message are all required now (previously name/email
  were optional) — the form won't submit without them.

## Reverting to Google Sheets

The original Apps Script setup still works if you ever want it back —
nothing about it was removed, only unwired from the form. To switch
back: in `src/components/FeedbackForm.jsx`, change the `fetch(...)` URL
in `handleSubmit` from `/.netlify/functions/send-feedback` back to
`/.netlify/functions/feedback`. That function still expects
`FEEDBACK_WEBHOOK_URL` to be set (Netlify dashboard → Environment
variables) — the original setup steps:

<details>
<summary>Original Google Sheets + Apps Script steps</summary>

### 1. Create the sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new
   blank spreadsheet. Name it whatever you like (e.g. "Anveshya Feedback").
2. In row 1, add these column headers exactly, A through H:

   ```
   Timestamp | Name | Email | Feedback Type | Message | Rating | Page | User Agent
   ```

### 2. Add the Apps Script

1. In the sheet, go to **Extensions → Apps Script**.
2. Delete anything in the editor and paste this:

   ```javascript
   function doPost(e) {
     var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
     var data = JSON.parse(e.postData.contents);
     sheet.appendRow([
       data.timestamp || new Date().toISOString(),
       data.name || "",
       data.email || "",
       data.feedbackType || "",
       data.message || "",
       data.rating || "",
       data.page || "",
       data.userAgent || "",
     ]);
     return ContentService
       .createTextOutput(JSON.stringify({ ok: true }))
       .setMimeType(ContentService.MimeType.JSON);
   }
   ```

3. Click **Save** (disk icon), name the project (e.g. "Feedback webhook").

### 3. Deploy it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Set:
   - **Execute as:** Me (your account)
   - **Who has access:** Anyone
4. Click **Deploy**. Google will ask you to authorize the script — approve
   it (it's your own script, only touching your own sheet).
5. Copy the **Web app URL** it gives you — looks like
   `https://script.google.com/macros/s/AKfycb.../exec`.

### 4. Wire the URL in

**Local dev:**
```bash
cp .env.example .env
```
Then paste your URL into `.env`:
```
FEEDBACK_WEBHOOK_URL=https://script.google.com/macros/s/AKfycb.../exec
```
Restart `npm run dev` after saving.

**Production (Netlify):**
1. Netlify dashboard → your site → **Site configuration → Environment
   variables**.
2. Add a variable: key `FEEDBACK_WEBHOOK_URL`, value = your Web app URL.
3. Redeploy the site (or trigger a new deploy) so the function picks it up.

- Every time you edit the Apps Script code itself (not just data), you
  need to make a **new deployment** (Deploy → Manage deployments → edit →
  new version) for the change to take effect — editing the code alone
  doesn't update the live web app URL's behavior.
- The webhook URL is a secret in the sense that anyone with it can submit
  rows to your sheet — it's not sent to the browser at all (the Netlify
  function holds it server-side), so this is already handled correctly.

</details>

# Feedback form → Google Sheets setup

The feedback form and its `/.netlify/functions/feedback` proxy are already
built and deployed. The only remaining step is one **you** have to do,
since it needs your own Google account — I can't create a Google Sheet or
deploy an Apps Script on your behalf.

## 1. Create the sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new
   blank spreadsheet. Name it whatever you like (e.g. "Anveshya Feedback").
2. In row 1, add these column headers exactly, A through H:

   ```
   Timestamp | Name | Email | Feedback Type | Message | Rating | Page | User Agent
   ```

## 2. Add the Apps Script

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

## 3. Deploy it as a web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" → choose **Web app**.
3. Set:
   - **Execute as:** Me (your account)
   - **Who has access:** Anyone
4. Click **Deploy**. Google will ask you to authorize the script — approve
   it (it's your own script, only touching your own sheet).
5. Copy the **Web app URL** it gives you — looks like
   `https://script.google.com/macros/s/AKfycb.../exec`.

## 4. Wire the URL in

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

## Notes

- Until `FEEDBACK_WEBHOOK_URL` is set, the function returns a clear error
  instead of silently discarding submissions — the modal will show
  "Couldn't send that..." rather than a false success message.
- Every time you edit the Apps Script code itself (not just data), you
  need to make a **new deployment** (Deploy → Manage deployments → edit →
  new version) for the change to take effect — editing the code alone
  doesn't update the live web app URL's behavior.
- The webhook URL is a secret in the sense that anyone with it can submit
  rows to your sheet — it's not sent to the browser at all (the Netlify
  function holds it server-side), so this is already handled correctly.

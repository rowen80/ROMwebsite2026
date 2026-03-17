# n8n Setup Instructions — romwebsite2026-request-intake

## What this file is
An importable n8n workflow export for the ROM Website 2026 booking intake pipeline.
Import `romwebsite2026-intake-workflow.json` into your n8n instance and complete the steps below.

---

## Step 1 — Import the workflow

In n8n:
1. Go to **Workflows** → **Import from file**
2. Select `romwebsite2026-intake-workflow.json`
3. The workflow will be created in **inactive** state (safe — it won't trigger yet)

---

## Step 2 — Create Gmail credential

The two email nodes require a Gmail OAuth2 credential authenticated as `ryan.owen@ryanowenphotography.com`.

1. Go to **Settings** → **Credentials** → **Add Credential**
2. Type: **Gmail OAuth2**
3. Authenticate with the `ryan.owen@ryanowenphotography.com` Google account
4. Name it clearly (e.g. `Gmail OAuth2 — ryan.owen`)
5. Note the credential ID (visible in the URL or credential list)

In the workflow, open each email node and update the credential reference:
- **Send Client Confirmation Email** — set credential to your Gmail OAuth2
- **Send Internal Notification Email** — same credential

> Both email nodes have `continueOnFail: true` so a single email failure will not abort the sheet write.

---

## Step 3 — Create Google Sheets credential

1. Go to **Settings** → **Credentials** → **Add Credential**
2. Type: **Google Sheets OAuth2** (or Service Account if you prefer)
3. Authenticate with the Google account that has edit access to `ROM_DATA_2026`
4. Name it clearly (e.g. `Google Sheets — ROM Account`)

In the workflow, open **Append Google Sheets Row** and:
- Set the credential to your Google Sheets credential
- Set the **Spreadsheet URL or ID** to the actual `ROM_DATA_2026` spreadsheet

---

## Step 4 — Set the spreadsheet target

In the **Append Google Sheets Row** node:
- **Document ID / URL**: paste the full Google Sheets URL or just the spreadsheet ID from the URL bar
- **Sheet Name**: `2026 FORM_DATA` (already set — confirm it matches exactly)

> The column names in the node must match the header row in the sheet exactly (case-sensitive).
> See Task 7 doc for the full column list including new right-side columns.

---

## Step 5 — Set the intake secret in n8n

The **Validate Secret** node reads the environment variable `ROM_INTAKE_SECRET`.

Set this in n8n:
1. Go to **Settings** → **Variables** (n8n environment variables)
2. Add: `ROM_INTAKE_SECRET` = same value as `N8N_INTAKE_SECRET` in your Render `.env`

Alternatively, hardcode the secret value directly in the **Validate Secret** IF node's right-hand value — but environment variable is preferred.

---

## Step 6 — Confirm the webhook path

After import, open the **Webhook** node. Confirm:
- **HTTP Method**: POST
- **Path**: `romwebsite2026/request-intake`

The full webhook URL will be something like:
```
https://your-n8n-instance.com/webhook/romwebsite2026/request-intake
```

Copy this URL and set it as `N8N_INTAKE_WEBHOOK_URL` in your Render environment.

---

## Step 7 — Verify column order in Google Sheets

Before activating, open `ROM_DATA_2026` / `2026 FORM_DATA` and confirm the new right-side columns exist in this order (after `BillingEmail`):

```
BuildingName, Bathrooms, Views, FinishedBasement,
DateListingReady, DateToGoLive, DesiredDate, IsVacant, DuringShootAgreement,
AccessType, AccessCode, OwnerContactInfo, PhotographerNotes, TermsAccepted,
SourceSystem, RequestId, ConfirmationEmailStatus, InternalEmailStatus
```

> Do NOT add these columns to the live spreadsheet if it is in active use. Add them to a test copy first.
> Per Task 7: do not add `Message`, invoice columns, `Total`, or delivery columns.

---

## Step 8 — Test with a dry run

Before activating:
1. Keep the workflow **inactive**
2. Use n8n's **Test Workflow** button (manual trigger)
3. Send a test POST to the test webhook URL with a sample payload (see `api.py` `build_n8n_booking_payload()` for payload shape)
4. Confirm emails arrive and sheet row is written correctly
5. Confirm success response JSON matches expected shape:
   ```json
   { "ok": true, "requestId": "...", "clientEmailStatus": "SENT", "internalEmailStatus": "SENT", "sheetWriteStatus": "APPENDED" }
   ```

---

## Step 9 — Activate

Once the dry run is clean:
1. Activate the workflow in n8n
2. Set `N8N_INTAKE_WEBHOOK_URL` in Render to the production webhook URL
3. Make a real test booking through the form

---

## Agency routing reminder

Internal emails are sent to:
- `ryan@ryanowenphotography.com` — always
- `rehoboth@penfedrealty.com` — only when `customer.agency` is exactly `PenFed Gallo Realty` or `LeeAnn Group`

This logic lives in the **Build Variables** node (JavaScript). If agency names change, update that node.

---

## What is NOT done automatically

| Item | Status | Action required |
|---|---|---|
| Gmail OAuth2 credential | Not set | Create in n8n credentials |
| Google Sheets credential | Not set | Create in n8n credentials |
| Spreadsheet URL/ID | Placeholder | Fill in Append Sheets node |
| `ROM_INTAKE_SECRET` env var | Not set | Add to n8n environment variables |
| New right-side columns in sheet | Not added | Add to `2026 FORM_DATA` manually (see Task 7) |
| Webhook URL → Render env | Not configured | Copy URL after import, set `N8N_INTAKE_WEBHOOK_URL` in Render |

---

## Node map

| Node | Purpose |
|---|---|
| Webhook | Receives POST from Render backend |
| Validate Secret | Checks `x-rom-intake-key` header against `ROM_INTAKE_SECRET` |
| Reject Unauthorized | Returns 401 if secret missing or wrong |
| Validate Required Fields | Checks minimum required payload fields |
| Reject Invalid Fields | Returns 422 if required fields missing |
| Build Variables | Normalizes payload, builds computed vars, resolves recipient list |
| Send Client Confirmation Email | Sends confirmation to `customer.email` |
| Send Internal Notification Email | Sends to ryan + conditionally rehoboth@penfedrealty.com |
| Append Google Sheets Row | Writes row to ROM_DATA_2026 / 2026 FORM_DATA |
| Return Success Response | Returns structured 200 JSON to Render |
| Return Sheet Failure Response | Returns 500 JSON if sheet append fails (Render will surface this as 502) |

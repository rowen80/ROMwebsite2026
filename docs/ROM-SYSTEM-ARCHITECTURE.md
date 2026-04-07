# ROM System Architecture — Handoff Document

**Last Updated:** 2026-04-06 (evening)
**Author:** Claude (AI assistant) with Ryan Owen
**Purpose:** Complete reference for any human or AI coming into this system cold. Covers every moving part, why it exists, where it lives, and what to do when something breaks.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Component Directory](#2-component-directory)
3. [End-to-End Data Flow](#3-end-to-end-data-flow)
4. [Component Deep Dives](#4-component-deep-dives)
   - [The Website (GitHub Pages)](#41-the-website-github-pages)
   - [n8n Workflow](#42-n8n-workflow)
   - [ROM-Intake Apps Script](#43-rom-intake-apps-script)
   - [Google Sheet: ROM_CUSTOMER_MASTER](#44-google-sheet-rom_customer_master)
   - [ROM-Delivery-Invoicing Apps Script](#45-rom-delivery-invoicing-apps-script)
   - [Google Drive Assets](#46-google-drive-assets)
5. [Secret Keys & Credentials](#5-secret-keys--credentials)
6. [Deployment & Setup Steps](#6-deployment--setup-steps)
7. [Making Changes](#7-making-changes)
8. [Common Failures & Fixes](#8-common-failures--fixes)
9. [Known Limitations](#9-known-limitations)
10. [Change Log](#10-change-log)

---

## 1. System Overview

Ryan Owen Photography uses a custom-built system to handle client photo requests from form submission through photo delivery and invoicing. There is no third-party booking platform — everything is owned and controlled.

```
CLIENT BROWSER
     │
     │ Submits request form
     ▼
GITHUB PAGES WEBSITE (static)
     │
     │ HTTP POST to n8n webhook
     ▼
n8n AUTOMATION WORKFLOW
     │
     ├─── Sends confirmation email to client + CC ryan + BCC bardo
     │
     ├─── POSTs form data to ROM-Intake Apps Script
     │
     └─── Returns 200 OK → client sees Thank You page
              │
              ▼
     ROM-INTAKE APPS SCRIPT
              │
              │ Writes row to Google Sheet (ARRAYFORMULA-safe)
              ▼
     GOOGLE SHEET: ROM_CUSTOMER_MASTER
              │
              │ (Later, manually triggered from sheet menu)
              ▼
     ROM-DELIVERY-INVOICING APPS SCRIPT
              │
              ├─── Generates PDF invoice (from Google Doc template)
              ├─── Sends delivery email with photo links
              ├─── Sends invoice email with PDF attachment
              └─── Tracks payment status
```

---

## 2. Component Directory

| Component | What It Is | Where It Lives | Account |
|-----------|-----------|----------------|---------|
| Website | Static HTML/CSS/JS | GitHub: rowen80/ROMwebsite2026, served via GitHub Pages | GitHub account |
| n8n | Automation workflow tool | Render.com hosted instance | Render account |
| ROM-Intake.gs | Standalone Apps Script Web App | Google Apps Script (standalone) | ryan.owen@ryanowenphotography.com |
| ROM-Delivery-Invoicing.gs | Container-bound Apps Script | Bound to ROM_CUSTOMER_MASTER sheet | ryan.owen@ryanowenphotography.com |
| ROM_CUSTOMER_MASTER | Google Sheet (live data) | Google Drive | ryan.owen@ryanowenphotography.com |
| ROMwebsite2026_data | Google Sheet (staging/test) | Google Drive | ryan.owen@ryanowenphotography.com |
| ROM_INVOICE_TEMPLATE_2026 | Google Doc (invoice template) | Google Drive | ryan.owen@ryanowenphotography.com |
| ROM_INVOICES | Google Drive folder (PDF storage) | Google Drive | ryan.owen@ryanowenphotography.com |
| ZelleQr.jpg / VenmoQr.jpg | Payment QR images | Google Drive (root or known folder) | ryan.owen@ryanowenphotography.com |

**Sheet IDs (never change):**
- ROM_CUSTOMER_MASTER (live): `1F87dygig_3HFPvtWp7x1KfKdowyoBPKnKCAjLUYyoKs`
- ROMwebsite2026_data (staging): `17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ`

---

## 3. End-to-End Data Flow

### Form Submission (happens automatically)

```
1. Client fills out request-form.html and clicks Submit
2. JavaScript validates the form and calculates the estimate
3. Browser POSTs JSON to n8n webhook URL
4. n8n validates the secret key and required fields
5. n8n sends confirmation email:
      To:  client + ryan.owen@ + ryan@ + (rehoboth@penfed / leeann@ if applicable)
      BCC: bardo.faraday+rom@gmail.com
      NOTE: ryan addresses are in TO (not CC) so Gmail delivers to inbox, not just Sent
6. n8n POSTs form data to ROM-Intake Apps Script Web App URL
      - If Apps Script fails: n8n continues anyway (Continue on Error)
      - Row may be missing from sheet; Ryan has CC'd email as backup
7. Apps Script finds next blank row, writes data using setValues()
      - This does NOT physically insert a row
      - ARRAYFORMULA in Total column auto-calculates from Estimated Line Items
      - ARRAYFORMULA in InvoiceStatus column stays intact
8. n8n sends 200 OK back to browser
9. Browser shows Thank You page with estimate summary
```

### Invoice & Delivery (triggered manually by Ryan from sheet menu)

```
1. Ryan adds PhotoLink (and VideoLink/ReelsLink/TourLink if applicable) to the row
2. Ryan opens the sheet → ROM Ops menu → chooses appropriate workflow:
      - Send Photos Only (no invoice)
      - Send Photos + Invoice (≤3 jobs per company)
      - Send LOCKED Photos + Invoice (client pays before getting full download)
      - Send Invoice Only (photos already sent)
      - Send THANK YOU Download Link (after invoice marked PAID)
      - Send Second/Third Attempt overdue reminder
3. Apps Script prompts for Company name or Client Last Name
4. Script finds matching eligible rows, shows a confirmation summary
5. Ryan confirms → script generates PDF invoice (if applicable), sends email, writes back to sheet
6. Invoice PDF saved to ROM_INVOICES folder in Drive
7. Invoice record written to INVOICES tab in sheet
8. When payment received: Ryan marks row as PAID on INVOICES tab
      - InvoiceStatus ARRAYFORMULA syncs PAID back to FORM_DATA tab
      - Ryan then uses Thank You Download Link workflow to send full access
```

---

## 4. Component Deep Dives

### 4.1 The Website (GitHub Pages)

**Repo:** `github.com/rowen80/ROMwebsite2026`
**Live URL:** Served from `docs/` folder on `main` branch
**Key file:** `docs/request-form.html`

The form collects client info, property details, and selected services. JavaScript on the page:
- Calculates the estimate in real time
- On submit: builds a JSON payload and POSTs to n8n
- On success (200 OK): shows the Thank You view with estimate summary
- On failure: shows an error message

**To update the site:** Edit files locally → commit → push to GitHub → GitHub Pages auto-deploys within ~60 seconds.

**n8n webhook URL** is hardcoded in `request-form.html`. If the n8n instance moves, this must be updated.

---

### 4.2 n8n Workflow

**File (local backup):** `automation/romwebsite2026-intake-WORKING-20260326-165018.json`
**How to update:** Edit the JSON file locally → reimport into n8n UI (never edit in browser UI directly — see memory note)

**Workflow nodes in execution order:**

| # | Node | Type | What It Does |
|---|------|------|-------------|
| 1 | Webhook | Webhook | Receives POST from request form |
| 2 | Validate Secret | IF | Checks `x-rom-secret` header matches configured value |
| 3 | Validate Required Fields | IF | Checks required fields are present |
| 4 | Send Client Email | Email Send | Sends confirmation to client + CC ryan/ryan.owen + BCC bardo |
| 5 | POST to Intake Script | HTTP Request | POSTs form data to ROM-Intake Apps Script Web App |
| 6 | Respond Success | Respond to Webhook | Returns 200 OK → form shows Thank You page |

**Critical settings on node 5 (POST to Intake Script):**
- `onError: "continueRegularOutput"` — if this node fails, workflow continues to Respond Success anyway
- This ensures Thank You page always appears even if sheet write fails
- URL and secret are placeholders — must be filled with real values after Apps Script deployment

**Email recipients:**
- PenFed Gallo Realty: also sends to `rehoboth@penfedrealty.com`
- LeeAnn Group: also sends to `rehoboth@penfedrealty.com` and `leeann@leeanngroup.com`
- Logic is in the `toEmail` expression of the Send Client Email node

---

### 4.3 ROM-Intake Apps Script

**File (local backup):** `apps-script/ROM-Intake.gs`
**Live location:** Google Apps Script standalone project — **"ROM Intake 2026"**
**Script ID:** `1nzLEN9SGCfByiVE8XDypfgXHmIYZDGRP-lvB_gkutJOHmRLhWRBQcFDu`
**How to open:** Go to [script.google.com](https://script.google.com) → you will see a list of your projects → click **ROM Intake 2026**
**Deployed Web App URL:** `https://script.google.com/macros/s/AKfycbwrCalzIIutg7LgX1aLviyYPmX0GT0mgcV2-zQJaReA2oYtj7qG5VVXUmnlv9MMGU1o/exec`
**Active deployment name:** **ROM Intake 2026** (this is the one to edit — pencil icon in Manage Deployments)
**Runs as:** ryan.owen@ryanowenphotography.com
**Access:** Anyone with the URL + correct secret

**DEPLOYMENTS — what to keep and what to delete:**
In Manage Deployments you will see several entries. Keep only **ROM Intake 2026**. All entries named **Untitled** and **motherfucker** are old accidents from the debugging session and can be deleted. To delete: click the trash icon next to each one. Deleting old deployments does NOT affect the live one.

**Why this script exists:**
n8n's Google Sheets node uses `values.append` with `INSERT_ROWS` which physically inserts new rows. Google Sheets ARRAYFORMULA does not automatically cover physically inserted rows — it only covers "naturally blank" rows. This left the `Total` and `InvoiceStatus` columns blank for every row n8n created, breaking invoice calculations and the Thank You email workflow.

This script uses `sheet.getRange(targetRow, ...).setValues()` to write to a naturally blank row (the row after the last row with data). Since ARRAYFORMULA already covers that row, it auto-populates correctly after the write. No row insertion, no formula disruption.

**How it works:**
1. Receives POST request with `?secret=VALUE` in the URL
2. Validates the secret against value stored in Script Properties
3. Parses the JSON body (column name → value pairs)
4. Reads the sheet's header row to determine column order
5. Scans the `SubmittedAt` column to find the last row with real data (safe — no ARRAYFORMULA on this column)
6. Writes to the next blank row using `setValues()` — no row insertion
7. Returns `{ok: true, row: N}` on success or `{ok: false, error: "..."}` on failure

**Utility functions (run from Apps Script editor):**
- `setup()` — generates and stores the shared secret (run once after creating the script)
- `testSheetAccess()` — verifies the script can open the sheet and read headers
- `testEndpoint()` — sends a test POST to the deployed URL (paste URL in function first)
- `clearSecret()` — clears secret so `setup()` can generate a new one (also update n8n)

**Switching environments:**
Change `INTAKE_ACTIVE_SHEET_ID` at the top of the file:
- `INTAKE_PROD_SHEET_ID` for live (ROM_CUSTOMER_MASTER)
- `INTAKE_STAGE_SHEET_ID` for testing (ROMwebsite2026_data)
After changing, redeploy as a new version.

---

### 4.4 Google Sheet: ROM_CUSTOMER_MASTER

**Sheet ID:** `1F87dygig_3HFPvtWp7x1KfKdowyoBPKnKCAjLUYyoKs`

**Tabs:**

| Tab | Purpose |
|-----|---------|
| `2026 FORM_DATA` | One row per job/request. Main working data. |
| `INVOICES` | One row per invoice sent. Invoice lifecycle tracking. |
| `SETTINGS` | Single cell `B1` = NextInvoiceNumber (format: `2026-NNNN`) |
| `CO_BILLING_INFO` | Company billing contacts for company-mode invoicing |
| `INSTRUCTIONS` | In-sheet user guide |

**Key columns in 2026 FORM_DATA:**

| Column | Written By | Notes |
|--------|-----------|-------|
| SubmittedAt → Estimated Total | ROM-Intake (via n8n) | Set at form submission |
| Total | ARRAYFORMULA | Auto-calculated from Estimated Line Items. DO NOT manually break this formula. |
| Delivered | ROM-Delivery-Invoicing script | Set to "Y" when photos sent |
| PhotoLink, VideoLink, ReelsLink, TourLink | Ryan manually | Added after shoot, triggers delivery workflow |
| InvoiceNumber, InvoicedAt, InvoicePDFUrl | ROM-Delivery-Invoicing script | Set when invoice generated |
| InvoiceStatus | ARRAYFORMULA (references INVOICES tab) | Blank → SENT → PAID. DO NOT manually edit in FORM_DATA; update on INVOICES tab. |

**ARRAYFORMULA note:**
Two columns use ARRAYFORMULAs that live in row 2 (a buffer row):
- `Total` — calculates from `Estimated Line Items` column
- `InvoiceStatus` — VLOOKUPs from `INVOICES` tab by InvoiceNumber

These formulas work correctly because ROM-Intake writes to naturally blank rows. If you ever need to test the formula, delete the entire column and re-enter the formula in row 2 — it will re-cover all rows immediately.

**SETTINGS tab:**
`B1` contains the next invoice number (e.g., `2026-1740`). The invoicing script reads and increments this. Never set it lower than the highest existing invoice number — doing so creates duplicate invoice numbers.

---

### 4.5 ROM-Delivery-Invoicing Apps Script

**File (local backup):** `backups/apps-script/ROM-Delivery-Invoicing-2026-04-06.gs`
**Live location:** Container-bound to ROM_CUSTOMER_MASTER sheet
**Access:** Appears as "ROM Ops" menu in the sheet

**This script handles all outbound communications and invoice generation.** It is manually triggered by Ryan from the sheet menu — nothing runs automatically.

**Workflows available from ROM Ops menu:**

*Delivery submenu:*
- **Send Photos Only** — sends photo/video/reels/tour links, marks Delivered=Y, no invoice
- **Send Photos + Invoice (≤3 rows)** — sends links + generates PDF invoice, marks Delivered=Y
- **Send LOCKED Photos + Invoice (≤3 rows)** — sends review-only link + invoice (client pays first, then gets full download via Thank You workflow)
- **Send THANK YOU (Download Link)** — sends full download link after invoice marked PAID (requires InvoiceStatus=PAID and InvoicedAt within 14 days)

*Invoicing submenu:*
- **Send Invoice Only** — for when photos were already sent without invoice
- **Create Invoice (NO EMAIL)** — generates PDF and writes to sheet without sending
- **Send Second Attempt** — overdue reminder (fires when DateDue has passed)
- **Send Third Attempt** — second overdue reminder (fires 14 days after DateDue)

**Each workflow variant has two modes:**
- **By Company** — groups all jobs for a company into one invoice, uses CO_BILLING_INFO for billing contact
- **By ClientLastName** — groups by customer, uses ClientEmail from the row

**Row eligibility logic (prevents sending twice):**
- Photos workflows: requires `Delivered` = blank, `PhotoLink` present, `InvoiceNumber` blank
- Invoice workflows: requires `Delivered` = Y (or `ManualInvoice` = Y), `InvoiceNumber` blank
- Thank You: requires `Delivered` = Y, `PhotoLink` present, `InvoiceStatus` = PAID, `InvoicedAt` within 14 days

**Email format for all delivery emails:**
- To: client (or company billing contact in company mode)
- CC: ryan.owen@ryanowenphotography.com, ryan@ryanowenphotography.com
- BCC: bardo.faraday+rom@gmail.com

**Link format in email body (all workflows):**
Only the first link for each job includes the address prefix. Subsequent links (Video, Reels, Tour) are labeled without the address:
```
123 Main St Photo Link:
https://...

Video Link:
https://...

Reels Link:
https://...
```

**Constants at top of script (review before any production run):**
- `DOC_TEMPLATE_NAME` — must match your Google Doc template name exactly
- `INVOICE_FOLDER_NAME` — must match your Drive folder name exactly
- `ZELLE_QR_FILENAME` / `VENMO_QR_FILENAME` — must match Drive file names exactly
- `EMAIL_FROM_ADDRESS` — must be configured as a Gmail send-as alias

---

### 4.6 Google Drive Assets

The invoicing script searches for these by name — names must match exactly:

| Asset | Name in Drive | Purpose |
|-------|-------------|---------|
| Invoice template | `ROM_INVOICE_TEMPLATE_2026` | Google Doc with `{{PLACEHOLDER}}` markers |
| Invoice folder | `ROM_INVOICES` | Where generated PDFs are saved |
| Preview subfolder | `_PREVIEW` inside ROM_INVOICES | Where preview PDFs are saved |
| Zelle QR | `ZelleQr.jpg` | Embedded in invoice emails |
| Venmo QR | `VenmoQr.jpg` | Embedded in invoice emails |

**Invoice template placeholders** (all must be present in the doc):

| Placeholder | Replaced With |
|-------------|-------------|
| `{{INVOICE_NUMBER}}` | e.g., 2026-1740 |
| `{{INVOICE_DATE}}` | MM/DD/YYYY |
| `{{CLIENT_NAME}}` | Billing contact name |
| `{{COMPANY}}` | Company name |
| `{{CLIENT_EMAIL}}` | Recipient email |
| `{{SUBTOTAL}}` | Sum of Total across all jobs |
| `{{DEPOSIT}}` | Sum of Deposit |
| `{{AMOUNT_DUE}}` | Subtotal minus Deposit |
| `{{DATE_DUE}}` | Invoice date + 14 days |
| `{{LINE_ITEMS_TABLE}}` | Formatted job/service list |

---

## 5. Secret Keys & Credentials

| Secret | Where It's Used | Where It's Stored |
|--------|----------------|------------------|
| n8n webhook secret | Validates incoming form POSTs in n8n | n8n environment variable; also in `request-form.html` as POST header |
| INTAKE_SECRET | Validates n8n's POST to ROM-Intake Apps Script | Apps Script Script Properties (`INTAKE_SECRET` key); also in n8n HTTP Request node URL |
| Google OAuth (Sheets) | n8n writing to sheet (now unused after migration) | n8n credentials store |
| Gmail send-as alias | ROM-Delivery-Invoicing sending as ryan@ | Gmail Settings → Accounts → Send mail as |

**How to view/rotate INTAKE_SECRET:**
1. Open ROM-Intake Apps Script in Google Apps Script editor
2. Project Settings → Script Properties → find `INTAKE_SECRET`
3. To rotate: run `clearSecret()` then `setup()` → copy new value → update n8n HTTP Request node URL → reimport n8n workflow

---

## 6. Deployment & Setup Steps

### Deploying ROM-Intake Apps Script (first-time)

1. Go to [script.google.com](https://script.google.com) → New Project
2. Name it "ROM-Intake"
3. Paste contents of `apps-script/ROM-Intake.gs`
4. In the editor: Run → `testSheetAccess()` — authorize when prompted, verify it finds the sheet
5. Run → `setup()` — check Execution Log, copy the generated secret value
6. Deploy → New Deployment:
   - Type: Web App
   - Execute as: Me (ryan.owen@ryanowenphotography.com)
   - Who has access: Anyone
7. Copy the Web App URL
8. In `automation/romwebsite2026-intake-WORKING-20260326-165018.json`:
   - Replace `PASTE_YOUR_WEB_APP_URL_HERE` with the Web App URL
   - Replace `PASTE_YOUR_INTAKE_SECRET_HERE` with the secret from step 5
9. Reimport the n8n workflow JSON (see below)
10. Run `testEndpoint()` from the Apps Script editor to verify end-to-end

### Redeploying ROM-Intake after code changes

1. Edit `apps-script/ROM-Intake.gs` locally
2. From terminal: `cd apps-script && /opt/homebrew/bin/node /opt/homebrew/bin/clasp push --force`
   (This pushes the local file directly to the Apps Script editor — no copy-paste needed)
3. In the Apps Script editor: refresh the page → verify the change is there
4. Deploy → Manage Deployments → Edit pencil on **ROM Intake 2026** → Version: New Version → Deploy
5. The URL does NOT change — no need to update n8n

### Reimporting n8n workflow

1. Save a dated backup of the current JSON before changing anything
2. Edit the local JSON file (never in the n8n browser UI)
3. In n8n: Workflows → open workflow → ⋮ menu → Import from file
4. Select the updated JSON file
5. Verify all nodes show green (no credential errors)
6. Activate the workflow

### Deploying ROM-Delivery-Invoicing (if ever needed fresh)

1. Open ROM_CUSTOMER_MASTER sheet
2. Extensions → Apps Script
3. Paste contents of `backups/apps-script/ROM-Delivery-Invoicing-2026-04-06.gs`
4. Save — the "ROM Ops" menu will appear in the sheet on next open
5. Run any workflow → authorize when prompted
6. Verify `testSendFromDomain()` function works before sending to real clients

---

## 7. Making Changes

### Adding a new form field

1. Add the field to `docs/request-form.html` (the form input and the JS payload builder)
2. Add the column header to the Google Sheet (can be anywhere — ROM-Intake maps by name)
3. Add the field to n8n's HTTP Request body parameters (in the JSON, under `bodyParameters.parameters`)
4. Reimport n8n workflow
5. If the field should appear on invoices: add it to `ROM-Delivery-Invoicing.gs` too

### Adding a new email recipient for a specific company

Edit the `toEmail` expression in the "Send Client Email" node in the n8n workflow JSON. The current pattern for PenFed/LeeAnn shows how to add conditional recipients.

### Changing invoice numbering

Edit `SETTINGS!B1` in ROM_CUSTOMER_MASTER directly. Format must be `YYYY-NNNN`. Never go lower than the highest existing invoice number.

### Rotating the INTAKE_SECRET

1. In Apps Script editor: run `clearSecret()`, then `setup()`, copy new value from log
2. In n8n JSON: update `PASTE_YOUR_INTAKE_SECRET_HERE` to new value
3. Reimport n8n workflow

---

## 8. Common Failures & Fixes

### "No eligible rows found" when running a delivery workflow

**Most likely cause:** The row was created by n8n and the ARRAYFORMULA columns (Total, InvoiceStatus) are blank.
**Fix:** Check that ROM-Intake is deployed and n8n is using the HTTP Request node (not the old Google Sheets Append node). If reverting to old setup, delete the Total and InvoiceStatus columns entirely and re-enter the ARRAYFORMULA in row 2 to force re-coverage.

### Thank You email finds no eligible rows

**Check:**
1. Is `InvoiceStatus` = PAID on the **INVOICES tab** (not FORM_DATA)?
2. Is the ARRAYFORMULA in FORM_DATA's InvoiceStatus column picking it up?
3. Is `InvoicedAt` within the last 14 days?
4. Is `PhotoLink` filled in on that row?

### Form submission succeeds but no row in sheet

**Check:**
1. n8n execution log — did "POST to Intake Script" node succeed or fail?
2. Apps Script execution log — any errors in doPost?
3. Is `INTAKE_SECRET` set in Apps Script Script Properties?
4. Is the Web App URL in n8n correct and the deployment current?

**Recovery:** Ryan receives a CC'd email for every submission. Manually enter the missing row from that email.

### Invoice email sends but PDF is missing/wrong

**Check:**
1. Does `ROM_INVOICE_TEMPLATE_2026` exist in Drive and contain all `{{PLACEHOLDER}}` markers?
2. Does `ROM_INVOICES` folder exist with a `_PREVIEW` subfolder?
3. Do `ZelleQr.jpg` and `VenmoQr.jpg` exist in Drive with exact filenames?

### Script says "Send-as not configured"

**Fix:** Gmail Settings → Accounts → "Send mail as" → verify `ryan@ryanowenphotography.com` is listed and verified.

### SETTINGS!B1 is blank

The invoicing script will refuse to run. Enter the next invoice number manually in format `YYYY-NNNN` (e.g., `2026-1745`). Check the INVOICES tab to find the highest existing number first.

---

## 9. Known Limitations

### No rollback on partial failure
If an invoice PDF is created and written to the sheet, but the email send fails, the row will show `InvoiceNumber` and `InvoicePDFUrl` but the client never received the email. Fix: manually send the email with the PDF from Drive, or re-run the workflow after clearing the InvoiceNumber cell.

### 14-day window on Thank You emails
The Thank You Download Link workflow only sends to rows invoiced within the last 14 days. If a client pays late (after 14 days), Ryan must send the download link manually. Change `RECENT_DAYS = 14` in the script to adjust the window.

### Cold start on ROM-Intake
After periods of inactivity, the first form submission may take 3–5 seconds longer to write to the sheet. The client email and Thank You page are unaffected — the delay only applies to the sheet write. The script warms up quickly once it sees regular use.

### Apps Script Web App always returns HTTP 200
Even on errors, the HTTP status is 200. n8n's "Continue on Error" applies if n8n itself throws, but a valid JSON `{ok: false}` response from the script will be treated as success by n8n. The execution log in the Apps Script editor is the authoritative source for script-level errors.

---

## 10. Change Log

| Date | Change | Why |
|------|--------|-----|
| 2026-03-22 | Added ReelsLink support to delivery workflows | New service offering |
| 2026-04-05 | Confirmed ARRAYFORMULA problem with Total and InvoiceStatus columns | n8n's values.append INSERT_ROWS breaks formula coverage |
| 2026-04-06 | Created ROM-Intake standalone Apps Script | Replaces n8n Google Sheets Append node to fix ARRAYFORMULA issue |
| 2026-04-06 | n8n workflow: replaced Append to Sheet node with POST to Intake Script | Root fix for ARRAYFORMULA problem |
| 2026-04-06 | n8n workflow: moved ryan/ryan.owen from CC to TO | Gmail suppresses CC delivery when sender = CC recipient; TO delivers to inbox |
| 2026-04-06 | Apps Script: added EMAIL_CC_ADDRESSES to all 6 delivery email sends | Consistent email routing across all workflows |
| 2026-04-06 | request-form.html: updated Thank You page copy and weather policy | Copy refinements |
| 2026-04-06 | request-form.html: added communityPool.jpg and fixed floor_plan.jpg path | Popover images for Community Photos and Floor Plan services |
| 2026-04-06 | ROM-Intake: fixed row detection — switched from Total column (ARRAYFORMULA, all rows truthy) to SubmittedAt column scan | Total ARRAYFORMULA returns truthy for all 50k rows; SubmittedAt is plain text, blank for empty rows |
| 2026-04-06 | ROM-Intake: deployed as "ROM Intake 2026", script ID documented, clasp push workflow established | Eliminates copy-paste for future code updates |

---

*This document should be updated whenever a significant change is made to any component. When in doubt about how something works, the source of truth is: the code files in this repo, the Apps Script editor, and the n8n workflow JSON.*

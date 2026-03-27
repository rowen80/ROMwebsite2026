# ROM Apps Script Review — Invoice Generation System

**Date:** 2026-03-26  
**Reviewer:** Leo (ROM Automation Specialist)  
**Script Location:** `~/lab/projects/rom/website-lab/romwebsite2026/reference/ROM-APPS-SCRIPT-WITH-REELS.gs`  
**Live Sheet:** ROM_CUSTOMER_MASTER (ID: 1F87dygig_3HFPvtWp7x1KfKdowyoBPKnKCAjLUYyoKs)  
**Staging Sheet:** ROMwebsite2026_data (ID: 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ)

---

## 📋 Executive Summary

The ROM Apps Script is a **sophisticated invoicing and delivery automation system** that:
- ✅ Generates PDF invoices from Google Doc templates
- ✅ Sends email with photo/video delivery links
- ✅ Manages invoice lifecycle (SENT → PAID)
- ✅ Handles multiple workflow types (Photos Only, Photos + Invoice, Invoice Only, Locked Photos, Thank You)
- ✅ Tracks payment status and overdue follow-ups
- ✅ Embeds payment QR codes (Zelle/Venmo) in emails

**Risk Level:** 🟠 **MEDIUM-HIGH** — Production-critical, handles money and customer communications.

---

## 🏗️ Architecture Overview

### Core Components

1. **Menu System** (`onOpen()`)
   - Creates "ROM Ops" menu with delivery and invoicing submenus
   - Provides 13 user-facing actions organized by workflow

2. **Data Sources**
   - **Primary:** `2026 FORM_DATA` sheet (main data sheet)
   - **Secondary:** `INVOICES` sheet (invoice records)
   - **Configuration:** `SETTINGS` sheet (stores next invoice number)
   - **Billing Info:** `CO_BILLING_INFO` sheet (company billing contacts)

3. **External Dependencies**
   - Google Docs template: `_ROM_INVOICE_TEMPLATE`
   - Drive folder: `ROM_INVOICES` (with `_PREVIEW` subfolder)
   - Payment QR images: `ZelleQr.jpg`, `VenmoQr.jpg`
   - Gmail send-as alias: `ryan@ryanowenphotography.com`

---

## 🔄 Workflow Types

### 1️⃣ Photos Only (No Invoice)
**Entry Points:** `sendPhotosOnlyByCompany()`, `sendPhotosOnlyByLastName()`

**Eligibility:**
- `Delivered` = blank
- `PhotoLink` exists
- `InvoiceNumber` = blank
- `InvoiceStatus` = blank

**Actions:**
- Sends email with photo/video/reels links
- Sets `Delivered = "Y"`
- **NO invoice created**

**Email Subject:** `Photos for {ListingAddress}`

---

### 2️⃣ Photos + Invoice (≤3 rows per group)
**Entry Points:** `sendPhotosPlusInvoiceByCompany()`, `sendPhotosPlusInvoiceByLastName()`

**Eligibility:**
- `Delivered` = blank
- `PhotoLink` exists
- `InvoiceNumber` = blank
- `InvoiceStatus` = blank
- ≤3 jobs per company (enforced)

**Actions:**
1. Creates invoice PDF from template
2. Sends email with photo links + invoice attachment + payment QR codes
3. Sets `Delivered = "Y"`
4. Writes `InvoiceNumber`, `InvoicedAt`, `InvoicePDFUrl`
5. Creates row in `INVOICES` sheet with status `"SENT"`
6. Increments `SETTINGS!B1` (NextInvoiceNumber)

**Email Subject:** `Photos/ Invoice for {ListingAddress}`

---

### 3️⃣ Invoice Only (Delivered = Y, not invoiced yet)
**Entry Points:** `sendInvoiceOnlyByCompany()`, `sendInvoiceOnlyByLastName()`

**Eligibility:**
- `Delivered = "Y"` (or `ManualInvoice = "Y"`)
- `InvoiceNumber` = blank
- `InvoiceStatus` = blank

**Actions:**
1. Creates invoice PDF
2. Sends email with invoice attachment + payment QR codes
3. **Does NOT modify** `Delivered` (already "Y")
4. Writes `InvoiceNumber`, `InvoicedAt`, `InvoicePDFUrl`
5. Creates row in `INVOICES` sheet with status `"SENT"`
6. Increments `SETTINGS!B1`

**Email Subject:** `Photography Invoice {InvoiceNumber}`

**Special Mode:** `skipEmail: true` → Creates invoice PDF but skips sending email (for manual review)

---

### 4️⃣ Locked Photos + Invoice (≤3 rows, review link workflow)
**Entry Points:** `sendLockedPhotosPlusInvoiceByCompany()`, `sendLockedPhotosPlusInvoiceByLastName()`

**Eligibility:**
- `Delivered` = blank
- `LockedLink` exists (NOT `PhotoLink`)
- `InvoiceNumber` = blank
- `InvoiceStatus` = blank
- ≤3 jobs per company

**Actions:**
1. Creates invoice PDF
2. Sends email with **locked photo link** (review-only) + invoice + payment QR codes
3. Sets `Delivered = "Y"`
4. Writes `InvoiceNumber`, `InvoicedAt`, `InvoicePDFUrl`
5. Creates row in `INVOICES` sheet with status `"SENT"`
6. Increments `SETTINGS!B1`

**Workflow Notes:**
- Customer receives locked/review link first
- After payment (status → PAID), they receive full download link via "Thank You" workflow

**Email Subject:** `Photo Link/Invoice for {ListingAddress}`

---

### 5️⃣ Thank You (Download Link) — PAID only, recent only
**Entry Points:** `sendThankYouDownloadLinkByCompany()`, `sendThankYouDownloadLinkByLastName()`

**Eligibility:**
- `Delivered = "Y"`
- `PhotoLink` exists
- `InvoiceStatus = "PAID"`
- `InvoicedAt` within last 14 days

**Actions:**
- Sends email with full download links
- **No writes to sheet** (read-only operation)

**Email Subject:** `Download Link for {ListingAddress}`

**Notes:**
- Typically sent manually after payment is received and status updated to PAID
- 14-day window prevents sending stale thank-you emails

---

### 6️⃣ Overdue Payment Reminders
**Entry Points:** `sendSecondAttemptOverdueByLastName()`, `sendThirdAttemptOverdueByLastName()`

**Eligibility (Second Attempt):**
- `InvoiceStatus = "SENT"` (on INVOICES sheet)
- `DateDue` has passed (>0 days overdue)
- `SecondAttempt` = blank

**Eligibility (Third Attempt):**
- `InvoiceStatus = "SENT"`
- `DateDue` + 14 days has passed (>14 days overdue)
- `SecondAttempt` exists
- `ThirdAttempt` = blank

**Actions:**
1. Groups overdue invoices by recipient email
2. Sends reminder email with all overdue invoice PDFs attached + payment QR codes
3. Stamps `SecondAttempt` or `ThirdAttempt` date on INVOICES sheet

**Email Subjects:**
- 2nd: `Past Due Invoice Reminder`
- 3rd: `Third Notice: Past Due Invoice Reminder`

---

## 💰 Pricing & Calculation Logic

### Data Flow

```
FORM_DATA columns:
├─ EstLineItems (string): "Basic Photos: $199.00; Drone: $49.00;"
├─ EstTotal (number): 347
├─ Total (number): 347 (actual billed amount)
└─ Deposit (number): 0

Calculations:
├─ subtotal = SUM(Total) across all jobs in group
├─ deposit = SUM(Deposit)
└─ amountDue = ROUND(subtotal - deposit, 2)
```

### Invoice Line Items

**Source:** `EstLineItems` column  
**Format:** Semicolon-delimited string  
**Example:** `"Basic Photos: $199.00; Drone: $49.00; Community Photos: $99.00"`

**Parsing Logic:** (`insertLineItemsBlocks_`)
1. Split by `;`
2. Trim whitespace
3. Remove word "estimated" (case-insensitive)
4. Render each as indented paragraph in PDF

**Bedroom Cleaning Logic:**
- Strips "(Please provide...)" notes
- Converts "Lot (something)" → "Lot"
- Used in PDF line item header: `{ListingAddress} ({Bedrooms}) — Total: {Total}`

---

## 📄 Invoice PDF Generation

### Template Replacement Placeholders

The script opens `_ROM_INVOICE_TEMPLATE` Google Doc and replaces:

| Placeholder | Replaced With |
|------------|---------------|
| `{{INVOICE_NUMBER}}` | 2026-1700, 2026-1701, etc. |
| `{{INVOICE_DATE}}` | MM/DD/YYYY (current date) |
| `{{CLIENT_NAME}}` | BillingContactName (from CO_BILLING_INFO) or ClientFirstName + ClientLastName |
| `{{COMPANY}}` | Company name |
| `{{CLIENT_EMAIL}}` | Recipient email |
| `{{SUBTOTAL}}` | $347.00 |
| `{{DEPOSIT}}` | $0.00 |
| `{{AMOUNT_DUE}}` | $347.00 |
| `{{DATE_DUE}}` | Invoice date + 14 days |
| `{{LINE_ITEMS_TABLE}}` | Replaced with formatted line items blocks |

**PDF Filename Format:** `{InvoiceNumber} - {YYYY-MM-DD} - {NameLabel}.pdf`  
**Example:** `2026-1700 - 2026-03-26 - Anthony Sacco.pdf`

**Storage:** `ROM_INVOICES` folder in Drive

---

## 👥 Grouping & Recipient Logic

### Company Mode (`mode: "COMPANY"`)

**Grouping:** All jobs with same `Company` value → one invoice

**Recipient Selection Priority:**
1. Row's `BillingEmail` (if present)
2. `CO_BILLING_INFO` sheet lookup by Company → `BillingEmail`
3. Row's `ClientEmail` (fallback)
4. **Error if none found**

**Client Name on Invoice:**
- Uses `BillingContactName` from `CO_BILLING_INFO` if present
- Falls back to `ClientFirstName + ClientLastName` from row

**Example:** All Keller Williams jobs → one invoice to mmoorerealtor@gmail.com (Michael Moore)

---

### LastName Mode (`mode: "LASTNAME"`)

**Grouping:** 
- **Prefers** `Customer ID` if present and populated → groups by Customer ID
- **Fallback:** Groups by lowercase `ClientLastName`

**Recipient Selection:**
- Uses row's `ClientEmail` only
- **Never uses CO_BILLING_INFO** in LASTNAME mode

**Client Name on Invoice:**
- Uses `ClientFirstName + ClientLastName` from row
- **Never uses BillingContactName**

**Example:** All jobs with ClientLastName "Smith" → one invoice to johnsmith@example.com

---

## 📧 Email System

### Configuration

- **From Name:** "Ryan Owen Photography"
- **From Address:** `ryan@ryanowenphotography.com` (send-as alias required)
- **BCC:** `ryan@ryanowenphotography.com`
- **Signature:** Hardcoded text + HTML with phone/website + disclaimer

### Payment QR Codes

**Files Required in Drive:**
- `ZelleQr.jpg`
- `VenmoQr.jpg`

**Embedding Method:**
- Loaded once per workflow run as blobs
- Embedded as inline images with CID references: `<img src="cid:zelleqr">`
- Displayed side-by-side in 220x220px table

**Workflows with QR codes:**
- ✅ Photos + Invoice
- ✅ Invoice Only
- ✅ Locked Photos + Invoice
- ✅ Overdue reminders (2nd & 3rd attempt)
- ❌ Photos Only (no invoice, no QR codes)
- ❌ Thank You Download Link (already paid)

### Email Bodies

**Photos + Invoice:**
```
Hi {ClientName},

Photos are available for download at the link below. Invoice is attached. 
The total due came to ${amountDue} and can be paid via the links at the bottom. 
This link will be valid for 30 days. Please download all files to your personal 
device for permanent storage.

Thanks! Ryan

{ListingAddress} Photo Link:
{PhotoLink}

{ListingAddress} Video Link:
{VideoLink}

{ListingAddress} Reels Link:
{ReelsLink}

[Zelle QR] [Venmo QR]

Ryan Owen
240-401-8385
www.ryanowenphotography.com

*** In order to give every project my full attention, I cannot respond to 
emails or texts while I am shooting. Thank you for your patience. ***
```

**Invoice Only:**
```
Hi {ClientName},

Your most recent Photography Invoice ({InvoiceNumber}) is attached. 
The total due came to ${amountDue} and can be paid via the links at the bottom. 
Please let me know if there is anything else I can do for you.

Thanks! Ryan

[Zelle QR] [Venmo QR]

Ryan Owen
240-401-8385
www.ryanowenphotography.com

*** In order to give every project my full attention, I cannot respond to 
emails or texts while I am shooting. Thank you for your patience. ***
```

### Custom Message Field

**Column:** `Message` (optional)

**Behavior:**
- If `Message` is populated, its content is inserted **before** "Thanks! Ryan"
- Multiple jobs in one invoice → each Message is concatenated with `\n\n` separator
- Allows per-job custom notes to be included in invoice emails

---

## 🗂️ Sheet Structure & Column Dependencies

### FORM_DATA Sheet (main data)

**Required Columns:**
- `InvoiceNumber` — Written by script, blank = not invoiced yet
- `SubmittedAt` — Form submission timestamp
- `Customer ID` — Used for grouping in LASTNAME mode (optional but recommended)
- `ClientFirstName`, `ClientLastName`, `ClientEmail` — Client identity
- `Company`, `Company ID`, `Match Status` — Company grouping
- `Service`, `Bedrooms`, `ListPrice`, `SqFt`, `ListingAddress`, `City`, `SalesRentals` — Job details
- `EstLineItems`, `EstTotal`, `Total`, `Deposit` — Pricing
- `Delivered` — Workflow state flag (blank or "Y")
- `PhotoLink`, `VideoLink`, `ReelsLink` — Delivery links
- `LockedLink` — Review-only link for locked workflow
- `ManualInvoice` — Override flag ("Y" = force invoice even if Delivered blank)
- `InvoicedAt`, `InvoiceStatus`, `InvoicePDFUrl` — Written by script
- `InvoicePreviewUrl` — Preview PDF URL (preview workflow only)
- `BillingEmail` — Optional row-level override
- `Message` — Optional custom message for invoice email

**Array Formula References:**
- `FORM_DATA!T2` (column T, row 2) — Referenced in conditional formatting for status synchronization
- The script does **not** modify formulas, only writes to specific cells

---

### INVOICES Sheet (invoice records)

**Headers:**
- `InvoiceNumber` (primary key)
- `InvoicedAt` (timestamp)
- `InvoiceStatus` ("SENT" or "PAID")
- `ClientLastName`, `ClientFirstName` — For invoice record
- `InvoiceToEmail` — Recipient
- `Company` — Company name
- `Total` — Subtotal (before deposit)
- `InvoicePDFUrl` — Drive link
- `AmountDue` — Subtotal - Deposit
- `DateDue` — Invoice date + 14 days
- `SecondAttempt`, `ThirdAttempt` — Overdue reminder timestamps

**Sheet Creation:**
- Auto-created if missing by `getOrCreateInvoicesSheet_()`
- Headers appended if new columns are added to `INVOICE_HEADERS` array
- **Never clears existing data** — safe for production

**Upsert Logic:**
- Checks if `InvoiceNumber` already exists in sheet
- Updates row if exists (shouldn't happen in normal flow)
- Appends new row if doesn't exist

---

### SETTINGS Sheet

**Key Cell:** `B1` — NextInvoiceNumber

**Format:** `YYYY-NNNN` (e.g., `2026-1700`)

**Behavior:**
- Read before invoice generation
- Incremented after each invoice created
- **Error if blank** — script refuses to run

**Increment Logic:** (`incrementInvoiceNumber_`)
```javascript
"2026-1700" → "2026-1701"
"2026-1999" → "2026-2000"
```

---

### CO_BILLING_INFO Sheet

**Purpose:** Company-level billing contact information

**Columns:**
- `Company` (exact match, case-insensitive)
- `BillingEmail` — Company billing email
- `BillingContactName` — Name to use on invoice PDF and in greetings
- `BillingPhone` — (not currently used in script)

**Lookup Behavior:**
- Company name lowercased and used as map key
- Used in "Company" mode only
- **Error if Company present but BillingContactName blank** when generating invoice

**Example:**
| Company | BillingEmail | BillingContactName | BillingPhone |
|---------|-------------|-------------------|--------------|
| Keller Williams | mmoorerealtor@gmail.com | Michael Moore | 410-474-9794 |
| PenFed Gallo Realty | rehoboth@penfedrealty.com | Andrew Ratner | 302-227-6101 |

---

## 🚨 Potential Issues & Edge Cases

### 1. **Invoice Number Collision**

**Risk:** If `SETTINGS!B1` is manually edited to a lower number, duplicate invoice numbers could be created.

**Impact:** 🔴 HIGH — Invoice records would overwrite, customer confusion, accounting errors

**Mitigation:**
- Script increments sequentially (no gaps)
- Manual audit of `SETTINGS!B1` before any script run
- Consider protecting `SETTINGS!B1` cell with warning-only protection

---

### 2. **Missing Billing Contact for Company**

**Scenario:** Company exists in FORM_DATA but not in CO_BILLING_INFO, or BillingContactName is blank

**Behavior:** Script throws error: `Missing BillingContactName for company: {Company}`

**Impact:** 🟠 MEDIUM — Workflow stops, no invoice sent

**Mitigation:**
- Validate CO_BILLING_INFO completeness before running company workflows
- Script could fall back to ClientFirstName + ClientLastName (not currently implemented)

---

### 3. **Drive Template or Folder Missing**

**Scenario:** 
- `_ROM_INVOICE_TEMPLATE` doc not found
- `ROM_INVOICES` folder not found
- QR images (`ZelleQr.jpg`, `VenmoQr.jpg`) not found

**Behavior:** Script throws error immediately

**Impact:** 🔴 HIGH — Complete workflow failure

**Mitigation:**
- Verify Drive dependencies before script execution
- Consider hardcoding file/folder IDs instead of searching by name (more resilient)

---

### 4. **Send-As Alias Not Configured**

**Scenario:** Gmail send-as alias for `ryan@ryanowenphotography.com` not set up

**Behavior:** Script throws error: `Send-as not configured for {EMAIL_FROM_ADDRESS}`

**Impact:** 🔴 HIGH — Emails won't send

**Mitigation:**
- Script validates send-as config before sending (`assertSendAsConfigured_()`)
- Manual verification: Gmail Settings → Accounts → Send mail as

---

### 5. **Line Items Parsing Issues**

**Edge Cases:**
- Extra semicolons: `"Basic Photos: $199.00;;Drone: $49.00"` → Creates blank line items
- Missing semicolons: `"Basic Photos: $199.00 Drone: $49.00"` → Treated as single line item
- Non-standard format: `"Photos $199"` → Renders as-is (may look odd)

**Impact:** 🟡 LOW-MEDIUM — Invoice PDF formatting issues, not calculation errors

**Mitigation:**
- Validate EstLineItems format in form submission or staging workflow
- Consider stricter parsing with error messages

---

### 6. **Overdue Reminder Spam Risk**

**Scenario:** Script run multiple times on same overdue invoice

**Protection:** Second/Third attempt dates are written to INVOICES sheet → prevents re-sending

**Remaining Risk:** If someone manually clears `SecondAttempt`/`ThirdAttempt` columns, reminder could be sent again

**Impact:** 🟡 LOW — Customer annoyance, looks unprofessional

---

### 7. **Currency Precision Issues**

**Calculation:** `amountDue = ROUND(subtotal - deposit, 2)`

**Edge Case:** JavaScript floating-point math  
`(199.99 + 49.99) - 0.01 = 249.97999999999996`

**Protection:** `round2_()` function uses `Math.round((n + Number.EPSILON) * 100) / 100`

**Risk:** 🟢 MINIMAL — Current rounding implementation is correct

---

### 8. **Date Due Calculation**

**Logic:** Invoice date + 14 days

**Issue:** No business day adjustment — due date could be a weekend/holiday

**Impact:** 🟡 LOW — Minor usability issue, not a system error

---

### 9. **Photo Link Validation**

**Current Behavior:** Script checks if `PhotoLink` is non-empty string, but doesn't validate URL format

**Risk:** Invalid links sent to customers (typos, incomplete URLs)

**Impact:** 🟠 MEDIUM — Customer can't access photos, requires manual follow-up

**Mitigation:**
- Add URL format validation (starts with http:// or https://)
- Test links in staging before production send

---

### 10. **Multiple Jobs in Invoice (>3 rows)**

**Protection:** Company mode enforces ≤3 rows for Photos + Invoice and Locked Photos workflows

**Bypass:** Invoice Only workflow has **no row limit** — can create massive invoices

**Risk:** 🟡 LOW-MEDIUM — PDF formatting issues, email size limits, customer confusion

**Recommendation:** Consider adding row limit warning for Invoice Only workflow

---

### 11. **Invoice Status Sync**

**Architecture:** 
- `InvoiceStatus` stored in **both** FORM_DATA and INVOICES sheets
- `FORM_DATA` uses array formula referencing `INVOICES` sheet (noted in conditional formatting)

**Risk:** If array formula breaks, status desync could occur

**Impact:** 🟠 MEDIUM — Overdue reminders sent to paid invoices, Thank You emails not sent

**Mitigation:**
- Verify array formula integrity in staging sheet
- Consider making INVOICES sheet the single source of truth with VLOOKUP

---

### 12. **Customer ID Grouping Fallback**

**Behavior:** LASTNAME mode prefers Customer ID, falls back to ClientLastName

**Edge Case:** 
- Customer submits 3 jobs with Customer ID "C123"
- Customer submits 2 more jobs with blank Customer ID
- Result: Two separate invoices created

**Impact:** 🟡 LOW-MEDIUM — Unexpected invoice splitting, not a billing error

**Recommendation:** Require Customer ID for all LASTNAME workflows

---

## 🔐 Security & Permissions

### Script Permissions

**Required Google Services:**
- SpreadsheetApp (read/write sheets)
- DocumentApp (read/write invoice template)
- DriveApp (create PDFs, read QR images)
- GmailApp (send emails)
- Utilities (date formatting)

**Scope:** Owner-only execution (runs as Ryan Owen's account)

---

### Data Sensitivity

**Exposed in Emails:**
- ✅ Client names, emails, phone numbers
- ✅ Property addresses
- ✅ Invoice amounts
- ✅ Payment QR codes (financial)

**Risk:** Email interception, phishing risks if ryan@ryanowenphotography.com compromised

**Mitigation:** Use encrypted email where possible, monitor for unauthorized sends

---

### Drive File Permissions

**Invoice PDFs:** Created in `ROM_INVOICES` folder
- Default: Inherits folder permissions (likely owner-only)
- PDF URLs shared in emails are view-only links

**Risk:** If folder is publicly shared, all invoice PDFs are exposed

**Recommendation:** Verify `ROM_INVOICES` folder is **private** (owner + specific shares only)

---

## 📊 Performance Considerations

### Execution Time

**Factors:**
- Number of jobs in group (larger groups = more line items)
- PDF generation time (~2-5 seconds per invoice)
- Email sending time (~1-2 seconds per email)
- Drive file operations (~1-2 seconds per file)

**Estimate:** 
- Single company with 5 jobs → ~10 seconds
- Overdue reminder with 10 invoices → ~15-20 seconds

**Apps Script Timeout:** 6 minutes for onOpen triggers, 30 minutes for custom functions

**Risk:** Batch operations on large datasets could timeout

**Mitigation:** Process in smaller batches (by company or date range)

---

### Rate Limits

**Gmail API:**
- Consumer accounts: ~100 emails/day
- Workspace accounts: ~2000 emails/day (current setup likely Workspace)

**Drive API:**
- 20,000 requests/100 seconds

**Risk:** Bulk invoice generation could hit Gmail daily limit

**Mitigation:** Spread large batches across multiple days

---

## 🧪 Dependencies

### External Files Required

1. **Google Doc:** `_ROM_INVOICE_TEMPLATE`
   - Must contain all `{{PLACEHOLDER}}` markers
   - Must be accessible by script execution account

2. **Drive Folder:** `ROM_INVOICES`
   - Must exist at root level or be findable by name
   - Must have subfolder: `_PREVIEW`

3. **Drive Images:** `ZelleQr.jpg`, `VenmoQr.jpg`
   - Must be accessible by script execution account
   - Must be valid image files

4. **Gmail Alias:** `ryan@ryanowenphotography.com`
   - Must be configured in Gmail → Settings → Accounts
   - Must have "Send mail as" enabled

---

### Sheet Dependencies

1. **FORM_DATA** (or active sheet if `SHEET_NAME = ""`)
2. **SETTINGS** (with `B1` = NextInvoiceNumber)
3. **CO_BILLING_INFO** (optional but required for company workflows)
4. **INVOICES** (auto-created if missing)

---

## ✅ Validation Checklist

Before running in production:

- [ ] `SETTINGS!B1` contains valid invoice number (`YYYY-NNNN`)
- [ ] `_ROM_INVOICE_TEMPLATE` doc exists with all placeholders
- [ ] `ROM_INVOICES` folder exists with `_PREVIEW` subfolder
- [ ] `ZelleQr.jpg` and `VenmoQr.jpg` exist in Drive
- [ ] Gmail send-as alias configured for `ryan@ryanowenphotography.com`
- [ ] `CO_BILLING_INFO` sheet populated with all active companies
- [ ] Test email sent successfully (`testSendFromDomain()`)
- [ ] Staging sheet has representative test data
- [ ] All FORM_DATA columns present (see column list above)

---

## 🔄 Workflow State Machine

```
Job Submission
  ↓
[FORM_DATA row created]
  ↓
Decision: Invoice Now or Later?
  ↓
├─ Photos Only ────────→ [Delivered=Y, no invoice]
│                          ↓
│                        (Manual payment marking)
│                          ↓
│                        [InvoiceStatus=PAID]
│
├─ Photos + Invoice ───→ [Delivered=Y, InvoiceNumber assigned, InvoiceStatus=SENT]
│                          ↓
│                        (Customer pays)
│                          ↓
│                        [InvoiceStatus=PAID] (manual update on INVOICES sheet)
│                          ↓
│                        Thank You Download Link
│
├─ Invoice Only ───────→ [Delivered=Y, InvoiceNumber assigned, InvoiceStatus=SENT]
│   (Photos sent earlier)  ↓
│                        (Customer pays)
│                          ↓
│                        [InvoiceStatus=PAID]
│
└─ Locked Photos + Invoice → [Delivered=Y, InvoiceNumber assigned, InvoiceStatus=SENT]
    (Review link sent)       ↓
                           (Customer pays)
                             ↓
                           [InvoiceStatus=PAID]
                             ↓
                           Thank You Download Link (full access)

Overdue Tracking:
  InvoiceStatus=SENT + DateDue passed
    ↓
  Second Attempt (due date + 0 days)
    ↓
  Third Attempt (due date + 14 days)
```

---

## 📝 Code Quality Assessment

### ✅ Strengths

1. **Defensive Validation**
   - `validateColumns_()` checks for required headers before execution
   - `assertSendAsConfigured_()` validates Gmail configuration
   - Error messages are descriptive and actionable

2. **Modular Design**
   - Clear separation between workflows (runPhotosOnly_, runPhotosPlusInvoice_, etc.)
   - Reusable helper functions (getContext_, filterRows_, groupItems_)
   - Email building functions isolated (buildPhotoInvoiceEmailText_, etc.)

3. **Safety Rails**
   - Preview mode (`preview: true`) → no emails, no writes
   - Confirmation dialogs with summaries before execution
   - Row count limits enforced for certain workflows

4. **Flexible Grouping**
   - Supports both Company and LastName modes
   - Customer ID fallback for better grouping accuracy
   - BillingContactName override for company workflows

5. **Money Handling**
   - Consistent rounding with `round2_()`
   - `money_()` function for formatted display
   - `toNumber_()` strips $, commas for parsing

---

### ⚠️ Weaknesses

1. **No Rollback Mechanism**
   - If email send fails after PDF creation and sheet writes, state is inconsistent
   - No transaction-like behavior (all-or-nothing)

2. **Hard-Coded Configuration**
   - Email addresses, file names, folder names scattered throughout code
   - Difficult to change configuration without code edits

3. **Limited Error Recovery**
   - Script stops on first error (e.g., missing billing info)
   - Partial batch processing not supported

4. **No Logging**
   - No audit trail of who ran what when
   - Difficult to debug issues after the fact

5. **Global State Dependency**
   - `getContext_()` assumes active spreadsheet
   - No dependency injection for testing

---

## 🎯 Recommendations for Improvement

### Short-Term (Low Risk)

1. **Add Logging**
   - Create `SCRIPT_LOG` sheet to track executions
   - Log: timestamp, user, workflow, rows processed, errors

2. **Validate URLs**
   - Check PhotoLink/VideoLink/ReelsLink format before sending
   - Alert if invalid URL detected

3. **Improve Error Messages**
   - Include row numbers in error messages
   - Suggest corrective actions (e.g., "Add BillingContactName for company X to CO_BILLING_INFO")

### Medium-Term (Moderate Risk)

1. **Configuration Sheet**
   - Move hard-coded values (email addresses, file names) to `SETTINGS` sheet
   - Easier to update without code changes

2. **Dry-Run Mode**
   - Generate PDFs in preview folder but don't send emails
   - Review before actually sending

3. **Batch Processing Safety**
   - Process one group at a time with confirmation between groups
   - Allow resume from failure point

### Long-Term (Requires Refactoring)

1. **Transaction Safety**
   - Wrap PDF creation + email send + sheet writes in try-catch
   - Rollback writes if email fails

2. **Unit Testing**
   - Extract pure functions for testing (calculations, parsing, grouping)
   - Mock Drive/Gmail dependencies

3. **API Migration**
   - Replace `GmailApp` with Gmail API for better error handling
   - Replace `DriveApp` with Drive API for faster file operations

---

## 📚 References

- **Live Script:** Bound to ROM_CUSTOMER_MASTER sheet (ID: 1F87dygig_3HFPvtWp7x1KfKdowyoBPKnKCAjLUYyoKs)
- **Reference Copy:** `~/lab/projects/rom/website-lab/romwebsite2026/reference/ROM-APPS-SCRIPT-WITH-REELS.gs`
- **Instructions:** Embedded in ROM sheet → INSTRUCTIONS tab
- **Last Updated:** 2026-03-22 (added ReelsLink support)

---

## 🚀 Next Steps

1. Review this document with Ryan to confirm understanding
2. Proceed to `INVOICE-TESTING-PLAN.md` for validation strategy
3. Execute testing plan on staging sheet before production changes

---

**End of Apps Script Review**

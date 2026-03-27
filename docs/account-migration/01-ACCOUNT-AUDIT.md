# ROM Account Audit — Complete Inventory

**Date:** 2026-03-26  
**Analyst:** Leo (ROM Automation Specialist)  
**Scope:** All Google resources, OAuth credentials, and automation systems

---

## 📧 Google Accounts Inventory

### Account 1: ryanowen80@gmail.com

**Type:** Personal Gmail account  
**Status:** ⚠️ Currently primary owner, to be phased out  
**Purpose:** Legacy account that currently owns most production files

**Known Ownership:**
- ✅ ROM_INVOICE_TEMPLATE_test (Google Doc)
- ✅ ROM_INVOICES_test folder (Google Drive)
- ❓ ROM_FINACIALS_MASTER sheet (suspected, needs verification)

**Known Permissions:**
- ✅ Writer on ROMwebsite2026_data staging sheet
- ❓ Unknown permissions on production files

**OAuth/API Access:**
- ❓ Unknown if used for gog CLI
- ❓ Unknown if used for clasp
- ❓ Unknown if this account runs Apps Script

**Email Capabilities:**
- ❓ Unknown if has send-as alias for ryan@ryanowenphotography.com

---

### Account 2: ryan.owen@ryanowenphotography.com

**Type:** Google Workspace account (assumed)  
**Status:** ✅ Target primary operator  
**Purpose:** Intended owner of all production resources

**Known Ownership:**
- ✅ ROMwebsite2026_data staging sheet

**Known Permissions:**
- ✅ Writer on ROM_INVOICE_TEMPLATE_test

**OAuth/API Access:**
- ❌ NOT authenticated with gog CLI
- ❌ NOT authenticated with clasp
- ❓ Unknown if this account exists in Apps Script

**Email Capabilities:**
- ❓ Unknown if has Gmail access
- ❓ Unknown if can send as ryan@ryanowenphotography.com

**Critical Questions:**
1. Is this a full Google Workspace account with Gmail?
2. Can Ryan log in to this account directly?
3. Does this account have 2FA configured?
4. What is the password/recovery method?

---

### Account 3: bardo.faraday@gmail.com

**Type:** Personal Gmail account  
**Status:** ✅ Development/testing account  
**Purpose:** Bardo's automation work, testing, troubleshooting

**Known Ownership:**
- ❌ None (correct — Bardo should not own production files)

**Known Permissions:**
- ✅ Writer on ROMwebsite2026_data staging sheet
- ✅ Writer on ROM_INVOICE_TEMPLATE_test
- ✅ Writer on ROM_INVOICES_test folder

**OAuth/API Access:**
- ✅ Authenticated with gog CLI (current default)
- ✅ Authenticated with clasp (current default)

**Email Capabilities:**
- ❌ No send-as alias for ryan@ryanowenphotography.com

**Target State:**
- Should have **Editor** access to all production files
- Should NOT have Owner access
- Should keep OAuth for development/testing tools

---

### Email Address: ryan@ryanowenphotography.com

**Type:** ❓ Unknown (alias or separate account?)  
**Status:** 🚨 CRITICAL UNKNOWN  
**Used By:** Apps Script email sending

**Possibilities:**
1. **Alias of ryan.owen@ryanowenphotography.com** (most likely)
2. **Alias of ryanowen80@gmail.com** (possible)
3. **Separate Google Workspace account** (unlikely but possible)
4. **Third-party email forwarded to Google** (unlikely)

**Investigation Required:**
```bash
# Check if ryan@ryanowenphotography.com resolves
nslookup -type=mx ryanowenphotography.com

# Log in to Google Workspace Admin Console
# Navigate to Users → Check for ryan@ or ryan.owen@

# Check Gmail settings in ryanowen80@gmail.com
# Settings → Accounts → Send mail as

# Check Gmail settings in ryan.owen@ryanowenphotography.com
# Settings → Accounts → Send mail as
```

---

## 📊 Google Sheets Inventory

### Sheet 1: ROM_FINACIALS_MASTER

**ID:** `1tpIAPqv1Hbg5Kttx-zVVFSp2dckoHe8YxSw3XytmlN0`  
**Owner:** ❓ Unknown (Bardo lacks permission to check)  
**Status:** 🔴 CRITICAL — Production master sheet

**Known Tabs:**
- 2026 FORM_DATA (main booking data)
- INVOICES (invoice tracking)
- SCHEDULES (photographer schedule)
- EXPENSES_MONTHLY WorkUp
- INCOME_MONTHLY WorkUp
- SERVICES Schedule
- CO_BILLING_INFO (company billing contacts)
- CLIENT LIST (historical clients)
- INSTRUCTIONS (user guide)
- SETTINGS (configuration, NextInvoiceNumber)
- 2025 INV_DATA (archived)
- 2024 INV_DATA (archived)
- 2023 INV_DATA (archived)

**Apps Script Binding:**
- ✅ Has bound Apps Script project (ID: `1RWg8pQkBdhJIJNuhA_smh4Q0XD3pA7-vcpr9xTqDJCJAIYZ5EWP-MP6e`)

**Critical Data:**
- ✅ SETTINGS!B1 — NextInvoiceNumber (currently 2026-XXXX)
- ✅ CO_BILLING_INFO — Company billing contacts
- ✅ INVOICES — Invoice status tracking

**Migration Risk:** 🔴 HIGH — Changing ownership could break Apps Script binding

**Action Required:**
1. Verify current owner
2. Check permissions for all three accounts
3. Plan Apps Script migration carefully

---

### Sheet 2: ROMwebsite2026_data

**ID:** `17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ`  
**Owner:** ✅ `ryan.owen@ryanowenphotography.com` (CORRECT)  
**Status:** ✅ Already in target state

**Permissions:**
- ✅ Owner: `ryan.owen@ryanowenphotography.com`
- ✅ Writer: `bardo.faraday@gmail.com`
- ⚠️ Writer: `ryanowen80@gmail.com` (REMOVE in Phase 4)
- ⚠️ Reader: Anyone with link (consider removing)

**Purpose:** Staging/test data for invoice generation testing

**Migration Risk:** 🟢 LOW — Already correct ownership, just needs permission cleanup

**Action Required:**
1. Remove ryanowen80@gmail.com writer access (Phase 4)
2. Consider removing "anyone with link" access
3. Keep as-is for now (working correctly)

---

## 📄 Google Docs Inventory

### Doc 1: ROM_INVOICE_TEMPLATE_test

**ID:** `12BCu044gKreQOVl_Wc_SeWa4I8HDBnwItmAKzqhokuI`  
**Name:** `ROM_INVOICE_TEMPLATE_test`  
**Owner:** ⚠️ `ryanowen80@gmail.com` (NEEDS TRANSFER)  
**Status:** 🔴 CRITICAL — Used for invoice PDF generation

**Permissions:**
- ⚠️ Owner: `ryanowen80@gmail.com`
- ✅ Writer: `ryan@ryanowenphotography.com` (note: not ryan.owen)
- ✅ Writer: `bardo.faraday@gmail.com`

**Placeholders:**
- ✅ `{{INVOICE_NUMBER}}`
- ✅ `{{INVOICE_DATE}}`
- ✅ `{{CLIENT_NAME}}`
- ✅ `{{CLIENT_EMAIL}}`
- ✅ `{{COMPANY}}`
- ✅ `{{SUBTOTAL}}`
- ✅ `{{DEPOSIT}}`
- ✅ `{{AMOUNT_DUE}}`
- ✅ `{{DATE_DUE}}`
- ✅ `{{LINE_ITEMS_TABLE}}`

**Migration Risk:** 🟡 MEDIUM — Apps Script accesses by name, not ID (less risky)

**Action Required:**
1. Transfer ownership to ryan.owen@ryanowenphotography.com
2. Verify ryan@ryanowenphotography.com still has writer access after transfer
3. Downgrade bardo.faraday@gmail.com to Editor (if becomes Owner during transfer)
4. Test Apps Script access post-transfer

---

### Doc 2: _TEST_ROM_INVOICE_TEMPLATE

**ID:** `1CT5ZPOuClxwZUWcGbyrKorP_AePVYP4io_cNpVsvqoQ`  
**Name:** `_TEST_ROM_INVOICE_TEMPLATE`  
**Owner:** ✅ `bardo.faraday@gmail.com` (CORRECT for test copy)  
**Status:** ✅ Test copy, no migration needed

**Purpose:** Staging/testing only, not used in production

**Action Required:** None (keep as-is)

---

## 📁 Google Drive Folders Inventory

### Folder 1: ROM_INVOICES_test

**ID:** `1HqX-2vXNlgWtGzRP6N_RFZbTmk0T3cM3`  
**Owner:** ⚠️ `ryanowen80@gmail.com` (NEEDS TRANSFER)  
**Status:** 🔴 CRITICAL — Stores generated invoice PDFs

**Permissions:**
- ⚠️ Owner: `ryanowen80@gmail.com`
- ✅ Writer: `bardo.faraday@gmail.com`

**Child Files:** Invoice PDFs (dynamically created by Apps Script)

**Migration Risk:** 🟡 MEDIUM — All child files inherit permissions

**Action Required:**
1. Transfer ownership to ryan.owen@ryanowenphotography.com
2. Give bardo.faraday@gmail.com Editor access
3. Verify child files inherit new permissions
4. Update Apps Script to reference folder by ID (hardcoded) instead of name

---

### Folder 2: Bardo (Development Folder)

**ID:** `1wF_IPmzyrk4_vug_sCc_4yPT4AneT3BX`  
**Owner:** ✅ `bardo.faraday@gmail.com` (CORRECT)  
**Status:** ✅ Personal dev folder, no migration needed

**Action Required:** None

---

### Unknown: ROM_INVOICES (Production Folder)

**Status:** ❓ NOT FOUND in current audit  
**Notes:** Apps Script references folder named `ROM_INVOICES` (without `_test` suffix)

**Investigation Required:**
- Is there a separate production folder?
- Or is `ROM_INVOICES_test` actually the production folder (misnamed)?
- Check Apps Script configuration

---

## 📁 Drive Files (QR Codes, Images)

### Payment QR Codes

**Files Required by Apps Script:**
- `ZelleQr.jpg` — Zelle payment QR code
- `VenmoQr.jpg` — Venmo payment QR code

**Current Location:** ❓ Unknown  
**Owner:** ❓ Unknown  
**Status:** 🔴 CRITICAL — Script will fail if not found

**Action Required:**
1. Locate these files in Drive
2. Verify ownership and permissions
3. Consider storing by file ID instead of name (hardcode in script)
4. Transfer ownership to ryan.owen if needed

---

## ⚙️ Apps Script Projects Inventory

### Script 1: ROM Invoice Generation System

**Script ID:** `1RWg8pQkBdhJIJNuhA_smh4Q0XD3pA7-vcpr9xTqDJCJAIYZ5EWP-MP6e`  
**Bound To:** ROM_FINACIALS_MASTER sheet  
**Owner:** ❓ Unknown (inherits from parent sheet)  
**Status:** 🔴 CRITICAL — Production invoice automation

**Functions:**
- `onOpen()` — Creates "ROM Ops" menu
- `sendPhotosOnlyByCompany()` — Send photos without invoice
- `sendPhotosPlusInvoiceByCompany()` — Send photos + invoice
- `sendInvoiceOnlyByCompany()` — Send invoice only
- `sendLockedPhotosPlusInvoiceByCompany()` — Send locked photos + invoice
- `sendThankYouDownloadLinkByCompany()` — Send download link after payment
- `sendSecondAttemptOverdueByLastName()` — Overdue reminder #2
- `sendThirdAttemptOverdueByLastName()` — Overdue reminder #3

**Script Permissions Required:**
- SpreadsheetApp (read/write)
- DocumentApp (read/write invoice template)
- DriveApp (create PDFs, access files)
- GmailApp (send emails) 🚨 **CRITICAL**

**Gmail Configuration:**
- From Address: `ryan@ryanowenphotography.com`
- BCC: `ryan@ryanowenphotography.com`
- **ISSUE:** Send-as alias not configured

**Execution Account:** ❓ Unknown (need to verify)

**Clasp Configuration:**
- Local project: `~/lab/projects/rom/website-lab/romwebsite2026/apps-script/`
- Authenticated as: `bardo.faraday@gmail.com`

**Migration Risk:** 🔴 HIGH — Changing execution account could break all workflows

**Action Required:**
1. Determine current execution account
2. Configure send-as alias in execution account
3. Plan migration to ryan.owen execution
4. Test all workflows post-migration

---

## 🔑 OAuth Credentials & API Access

### gog CLI (Google API Access)

**Config File:** `~/Library/Application Support/gogcli/credentials.json`  
**Authenticated Account:** `bardo.faraday@gmail.com`  
**Token Storage:** System keyring  
**Status:** ✅ Working for Bardo

**Services Enabled:**
- ✅ Drive API
- ✅ Sheets API
- ❓ Gmail API (unknown if enabled)

**Migration Required:**
- Add authentication for `ryan.owen@ryanowenphotography.com`
- Keep bardo.faraday as secondary for dev/testing

**Commands:**
```bash
# Add ryan.owen account
gog auth add ryan.owen@ryanowenphotography.com --services drive,sheets,gmail

# Switch to ryan.owen for production commands
gog --account ryan.owen@ryanowenphotography.com drive ls

# Keep bardo for dev work
gog --account bardo.faraday@gmail.com drive ls
```

---

### clasp (Apps Script CLI)

**Config File:** `~/.clasprc.json`  
**Authenticated Account:** `bardo.faraday@gmail.com`  
**Status:** ✅ Working for Bardo

**Project Bindings:**
- `~/lab/projects/rom/website-lab/romwebsite2026/apps-script/` → Script ID `1RWg...P6e`

**Migration Required:**
- Authenticate as `ryan.owen@ryanowenphotography.com`
- Update project deployment to run as ryan.owen

**Commands:**
```bash
# Log out current account
clasp logout

# Log in as ryan.owen
clasp login --creds <ryan.owen-credentials.json>

# Pull latest script code
cd ~/lab/projects/rom/website-lab/romwebsite2026/apps-script
clasp pull

# Deploy as ryan.owen
clasp deploy
```

---

### n8n (Webhook Automation)

**Webhook URL:** `https://rom-n8n.onrender.com/webhook/romwebsite2026/request-intake`  
**Authentication:** Secret token (`deb0bb17daf1f4243575d732b7fd5d2e`)  
**Status:** ✅ No migration needed (webhook-based)

**How It Works:**
- Frontend form submits to webhook
- n8n receives data, processes it
- n8n writes to Google Sheets (using its own OAuth)

**n8n OAuth:** ❓ Unknown which Google account n8n uses for Sheets access

**Action Required:**
1. Log in to n8n dashboard (https://rom-n8n.onrender.com)
2. Check credentials configuration
3. Verify which Google account n8n uses
4. Update to ryan.owen if needed

---

## 📊 Sheet Structure & Dependencies

### Critical Columns in FORM_DATA

**Identity & Grouping:**
- `Customer ID` — Used for grouping in LASTNAME mode
- `ClientFirstName`, `ClientLastName`, `ClientEmail`
- `Company`, `Company ID`, `Match Status`
- `BillingEmail` — Row-level billing override

**Job Details:**
- `Service`, `Bedrooms`, `ListPrice`, `SqFt`, `ListingAddress`, `City`, `SalesRentals`
- `SubmittedAt` — Form submission timestamp

**Pricing:**
- `EstLineItems` — Semicolon-delimited string
- `EstTotal` — Estimated total
- `Total` — Actual billed amount
- `Deposit` — Deposit paid

**Delivery:**
- `Delivered` — Workflow state ("Y" or blank)
- `PhotoLink`, `VideoLink`, `ReelsLink` — Delivery links
- `LockedLink` — Review-only link

**Invoicing:**
- `InvoiceNumber` — Written by script
- `InvoicedAt` — Timestamp
- `InvoiceStatus` — "SENT" or "PAID"
- `InvoicePDFUrl` — Drive link to PDF
- `InvoicePreviewUrl` — Preview PDF link
- `ManualInvoice` — Override flag ("Y")
- `Message` — Custom message for email

---

### Critical Columns in INVOICES

**Headers:**
- `InvoiceNumber` — Primary key
- `InvoicedAt` — Timestamp
- `InvoiceStatus` — "SENT" or "PAID"
- `ClientLastName`, `ClientFirstName`
- `InvoiceToEmail` — Recipient
- `Company` — Company name
- `Total` — Subtotal
- `InvoicePDFUrl` — Drive link
- `AmountDue` — Subtotal - Deposit
- `DateDue` — Invoice date + 14 days
- `SecondAttempt`, `ThirdAttempt` — Overdue reminder timestamps

**Array Formula:**
- `FORM_DATA` references `INVOICES` sheet for status synchronization
- Breaking this formula could desync invoice statuses

---

### Critical Configuration in SETTINGS

**Cell B1:** NextInvoiceNumber  
**Format:** `YYYY-NNNN`  
**Example:** `2026-1700`  
**Status:** 🔴 CRITICAL — Must never be blank

**Protection:** Consider adding sheet protection with warning

---

### Critical Data in CO_BILLING_INFO

**Columns:**
- `Company` — Exact match (case-insensitive)
- `BillingEmail` — Company billing email
- `BillingContactName` — Name for invoice PDF
- `BillingPhone` — (not currently used)

**Lookup Behavior:** Lowercased company name used as map key

---

## 🔍 Unknown/Missing Items

### 🚨 High Priority Unknowns

1. **ROM_FINACIALS_MASTER Owner**
   - Need to verify who owns the main production sheet
   - Critical for Apps Script migration

2. **Apps Script Execution Account**
   - Which Google account runs the script?
   - Does it have send-as configured?

3. **ryan@ryanowenphotography.com Identity**
   - Is this an alias or separate account?
   - Where does it forward to?

4. **Production Invoice Folder**
   - Is `ROM_INVOICES_test` actually production?
   - Or is there a separate `ROM_INVOICES` folder?

5. **QR Code Files Location**
   - Where are ZelleQr.jpg and VenmoQr.jpg stored?
   - Who owns them?

6. **n8n Google Account**
   - Which account does n8n use for Sheets API?
   - Does it need migration?

---

### 🟡 Medium Priority Unknowns

1. **Google Workspace Admin Access**
   - Does Ryan have Workspace admin console access?
   - Can he create/modify user accounts?

2. **Email Deliverability**
   - SPF/DKIM records for ryanowenphotography.com
   - Gmail send-as verification status

3. **Historical Backups**
   - Are there backups of ROM_FINACIALS_MASTER?
   - Where are they stored?

4. **Legacy Zapier Integration**
   - `.env` mentions legacy Zapier webhook
   - Is it still used? By which account?

---

### 🟢 Low Priority Unknowns

1. **Development Tools Permissions**
   - Does Ryan have clasp/gog installed locally?
   - Or is Bardo the only operator?

2. **Render.com Account**
   - Who owns the rom-n8n.onrender.com deployment?
   - Credentials in `~/.openclaw/secrets/render-credentials.txt`

---

## 📋 Investigation Checklist

Before proceeding to migration, Ryan should verify:

- [ ] Log in to ryan.owen@ryanowenphotography.com (confirm it exists)
- [ ] Check Gmail settings → Accounts → Send mail as
- [ ] Log in to Google Workspace Admin Console (if applicable)
- [ ] Verify ownership of ROM_FINACIALS_MASTER sheet
- [ ] Check Apps Script → Project settings → Execution account
- [ ] Locate ZelleQr.jpg and VenmoQr.jpg files in Drive
- [ ] Log in to n8n dashboard → Check credentials
- [ ] Check SPF/DKIM records for ryanowenphotography.com
- [ ] Verify 2FA status on all three accounts

---

**Status:** Audit complete. See `02-MIGRATION-PLAN.md` for next steps.

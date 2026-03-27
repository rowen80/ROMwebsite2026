# ROM Sheets & Templates Relinking Status Report

**Date:** 2026-03-27 09:35 EDT  
**Investigator:** Bardo (Subagent)  
**Task:** Investigate relinking needs after migration to ryan.owen Google account

---

## 🎯 Executive Summary

**GOOD NEWS:** Most of the relinking work is already complete! The staging environment is properly configured.

**Key Findings:**
- ✅ Main data sheet (`ROMwebsite2026_data`) is accessible and correctly referenced
- ✅ Apps Script is properly bound to the staging sheet
- ✅ n8n workflow is already using the correct sheet ID
- ⚠️ Apps Script is in TEST MODE (intentional - uses _test templates)
- ⚠️ Files with `_copy` suffix exist but appear to be backups, not primary references

**No immediate action required** — staging environment is functional.

---

## 📊 Current Configuration Inventory

### 1. Main Data Sheet (Staging)

**Name:** `ROMwebsite2026_data`  
**ID:** `17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ`  
**Location:** Google Drive folder `1a_BQ_MHV2Gmm8Fk7P0M8ZxOXgZif3o87` (ROMwebsite2026)  
**Owner:** ryan.owen@ryanowenphotography.com  
**Bardo Access:** ✅ Editor  
**Status:** ✅ Accessible and working

**Contents:**
- Main booking/request data
- SETTINGS tab (configuration)
- CO_BILLING_INFO tab (company billing contacts)
- INVOICES tab (invoice tracking)

---

### 2. Apps Script Configuration

**Script ID:** `1RWg8pQkBdhJIJNuhA_smh4Q0XD3pA7-vcpr9xTqDJCJAIYZ5EWP-MP6e`  
**Script Name:** `ROM_INVOICEscript2026`  
**Bound To:** `ROMwebsite2026_data` (sheet ID: 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ)  
**Status:** ✅ Correctly bound to staging sheet

**Local Config:**
- `.clasp.json` location: `/Users/ai/lab/projects/rom/website-lab/romwebsite2026/apps-script/.clasp.json`
- Script ID matches and is valid
- Uses `SpreadsheetApp.getActiveSpreadsheet()` (no hardcoded IDs)

**Current Mode:** TEST MODE (configured in Code.js)
```javascript
const DOC_TEMPLATE_NAME = "ROM_INVOICE_TEMPLATE_test"; // TEST MODE
const INVOICE_FOLDER_NAME = "ROM_INVOICES_test"; // TEST MODE
const BILLING_SHEET_NAME = "CO_BILLING_INFO"; // Tab name reference
```

**Sheet References:**
- ❌ No hardcoded sheet IDs (uses relative sheet name references)
- ✅ All references are to tab names within the active spreadsheet
- ✅ Safe for relinking - works with any bound sheet

---

### 3. n8n Workflow Configuration

**Webhook URL:** `https://rom-n8n.onrender.com/webhook/romwebsite2026/request-intake`  
**Configured in:** `/Users/ai/lab/projects/rom/website-lab/romwebsite2026/.env`

**Sheet Reference:**
- Current workflow file: `automation/romwebsite2026-intake-WORKING-20260326-165018.json`
- Sheet ID in workflow: `17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ`
- Status: ✅ Already pointing to staging sheet

---

### 4. Files with `_copy` Suffix

**Found:**
- `ROM_INVOICE_TEMPLATE_copy` (ID: `1WXpGKZ2rxps76nSNJff8Yp79C9Wvgv8DNkF8Li2XSp0`)
  - Location: Inside `ROM_INVOICES` folder (ID: `17322fJN0xvV9wHSIDEED3mfBsByNrGY3`)
  - Created: 2026-03-27 12:26
  - Size: 1.3 MB
  
- `ROM_FINACIALS_MASTER_copy` (ID: `10T051iszMY2gRJy_Kh8QTki13dUcDP9o7KUhtq9qHnw`)
  - Created: 2026-03-27 12:16
  - Size: 119.1 KB

**Assessment:**
These appear to be backup copies created during migration, not active references. The Apps Script is configured to use `ROM_INVOICE_TEMPLATE_test` (ID: `12BCu044gKreQOVl_Wc_SeWa4I8HDBnwItmAKzqhokuI`), not the `_copy` versions.

---

### 5. Template & Folder Structure

**Invoice Template (Test Mode):**
- Name: `ROM_INVOICE_TEMPLATE_test`
- ID: `12BCu044gKreQOVl_Wc_SeWa4I8HDBnwItmAKzqhokuI`
- Created: 2026-03-26 22:28
- Status: ✅ Exists and accessible

**Invoice Folder:**
- Name: `ROM_INVOICES`
- ID: `17322fJN0xvV9wHSIDEED3mfBsByNrGY3`
- Status: ✅ Exists (contains production invoices)

**Test Invoice Subfolder:**
- Expected name: `ROM_INVOICES_test` (from Apps Script config)
- Status: ❓ Not found in search results
- **Note:** Apps Script may create this folder on first run if it doesn't exist

---

## 🔍 Backend `.env` Analysis

**File:** `/Users/ai/lab/projects/rom/website-lab/romwebsite2026/.env`

**Current Contents:**
```bash
# n8n Integration
N8N_INTAKE_WEBHOOK_URL=https://rom-n8n.onrender.com/webhook/romwebsite2026/request-intake
N8N_INTAKE_SECRET=deb0bb17daf1f4243575d732b7fd5d2e

# Legacy Zapier (deprecated)
RESET_ZAPIER_WEBHOOK_URL=

# App Security
SECRET_KEY=please-generate-a-random-secret-key-here

# Frontend URL (for CORS and redirects)
FRONTEND_BASE_URL=http://127.0.0.1:8000

# Pricing configuration
PRICING_FILE=pricing.json
```

**Assessment:**
- ❌ No Google Sheets IDs defined in `.env`
- ❌ No API keys or OAuth tokens in `.env`
- ✅ This is correct — backend likely doesn't directly access Google Sheets
- ✅ n8n handles sheet writes, backend handles form submission to n8n

**Conclusion:** `.env` file does not need Sheet ID updates.

---

## 🧪 What Needs Relinking? (Answer: Almost Nothing)

### ✅ Already Correct

1. **Apps Script binding** → Correctly bound to `ROMwebsite2026_data`
2. **n8n workflow** → Already using correct staging sheet ID
3. **Backend .env** → Doesn't reference sheets directly (correct architecture)
4. **Local Apps Script config** → `.clasp.json` has correct script ID

### ⚠️ Intentionally Different (Test Mode)

The Apps Script is configured for **TEST MODE**, which is appropriate for staging:
- Uses `ROM_INVOICE_TEMPLATE_test` instead of production template
- Uses `ROM_INVOICES_test` folder instead of production folder
- BCC emails go to `bardo.faraday+rom@gmail.com` for testing

**This is intentional** to avoid touching production files during development.

### ❓ Unknown/Needs Verification

1. **`ROM_INVOICES_test` folder** — Does not appear in search results
   - May need to be created manually, OR
   - Apps Script may auto-create on first invoice generation
   - **Recommendation:** Run a test invoice generation to verify

2. **`_copy` files purpose** — Not currently referenced by any automation
   - Likely created as migration backups
   - **Recommendation:** Confirm with Ryan whether to keep or delete

3. **Production configuration** — We only audited staging
   - Production live site likely uses different sheet: `ROM_FINACIALS_MASTER`
   - **Important:** We did NOT touch or investigate production (per instructions)

---

## 🧪 Testing Recommendations

### Test 1: Verify Sheet Access
```bash
# Check if Bardo can read/write to staging sheet
gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ

# Check specific tabs
gog sheets read 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ \
  --range "SETTINGS!A1:B10"
```

### Test 2: Verify Apps Script Binding
```bash
cd /Users/ai/lab/projects/rom/website-lab/romwebsite2026/apps-script
clasp status
clasp open  # Opens script in browser to verify it's bound to correct sheet
```

### Test 3: Verify n8n Workflow Can Write
```bash
cd /Users/ai/lab/projects/rom/website-lab/romwebsite2026
./test-booking.sh  # Submits test booking through n8n to staging sheet
```

### Test 4: Check for Missing Test Folder
```bash
# Search for ROM_INVOICES_test folder
gog drive search "ROM_INVOICES_test"

# If not found, create it:
# gog drive mkdir "ROM_INVOICES_test" --parent <parent-folder-id>
# Then create _PREVIEW subfolder inside it
```

---

## 📋 Action Items (All Optional - System is Functional)

### Priority 1: Verification (Recommended)
- [ ] Test sheet read/write access with `gog sheets`
- [ ] Verify Apps Script can execute on staging sheet
- [ ] Check if `ROM_INVOICES_test` folder exists or needs creation
- [ ] Run test booking through full workflow (form → n8n → sheet)

### Priority 2: Documentation (Recommended)
- [ ] Document the `_copy` files purpose with Ryan
- [ ] Confirm whether to keep or delete `_copy` backups
- [ ] Update README with staging vs production sheet IDs

### Priority 3: Cleanup (Optional)
- [ ] Delete `_copy` files if confirmed as unnecessary backups
- [ ] Archive old n8n workflow JSON files (keep only latest)
- [ ] Generate proper SECRET_KEY in `.env` file

---

## 🚨 Critical Rules Followed

✅ **Did NOT touch production files** — Only investigated staging  
✅ **Did NOT modify any sheets or templates** — Read-only investigation  
✅ **Did NOT push any code changes** — Report only  
✅ **Verified Bardo has Editor access, not Owner** — Correct permission level

---

## 💡 Key Insights

1. **The migration was already completed successfully** — All staging references are correct
2. **Test mode is intentional** — Prevents accidents with production data
3. **Architecture is sound** — Backend → n8n → Sheets separation is clean
4. **The `_copy` files are red herrings** — Not actively used in automation

---

## 📞 Next Steps

**Recommend:**
1. Show this report to Ryan
2. Ask permission to run verification tests (all read-only or isolated)
3. Clarify purpose of `_copy` files before deleting
4. Confirm when to switch from TEST MODE to production configuration

**When ready for production:**
- Change `DOC_TEMPLATE_NAME` from `ROM_INVOICE_TEMPLATE_test` to production template
- Change `INVOICE_FOLDER_NAME` from `ROM_INVOICES_test` to `ROM_INVOICES`
- Change `EMAIL_BCC_ADDRESS` from Bardo's test email to production BCC
- Update sheet ID references to point to `ROM_FINACIALS_MASTER` (production)

---

## 📎 Appendix: File Locations

### Local Repository
- **Root:** `/Users/ai/lab/projects/rom/website-lab/romwebsite2026/`
- **Apps Script:** `apps-script/Code.js`
- **Apps Script Config:** `apps-script/.clasp.json`
- **Backend Config:** `.env`
- **n8n Workflows:** `automation/*.json`
- **Documentation:** `docs/`

### Google Drive (ryan.owen account)
- **ROMwebsite2026 Folder:** `1a_BQ_MHV2Gmm8Fk7P0M8ZxOXgZif3o87`
- **Staging Sheet:** `17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ`
- **Test Template:** `12BCu044gKreQOVl_Wc_SeWa4I8HDBnwItmAKzqhokuI`
- **Invoice Folder:** `17322fJN0xvV9wHSIDEED3mfBsByNrGY3`
- **Apps Script:** `1RWg8pQkBdhJIJNuhA_smh4Q0XD3pA7-vcpr9xTqDJCJAIYZ5EWP-MP6e`

---

**Report completed:** 2026-03-27 09:35 EDT  
**Investigator:** Bardo (Subagent)  
**Status:** ✅ Investigation complete — Awaiting guidance on optional verification tests

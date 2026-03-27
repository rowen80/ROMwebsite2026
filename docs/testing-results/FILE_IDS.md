# ROM Invoice System - File & Folder IDs

**Generated:** 2026-03-26 18:32 EDT

## Google Drive Structure

### Folders
- **ROM_INVOICES_test (Bardo's Drive):** `1HqX-2vXNlgWtGzRP6N_RFZbTmk0T3cM3`

### Templates
- **Source Template (Ryan's):** `12BCu044gKreQOVl_Wc_SeWa4I8HDBnwItmAKzqhokuI`
  - Name: `ROM_INVOICE_TEMPLATE_test`
  - Location: Ryan's Drive
  - Modified: 2026-03-26 22:28:52 UTC

- **Test Template Copy (Bardo's):** `1CT5ZPOuClxwZUWcGbyrKorP_AePVYP4io_cNpVsvqoQ`
  - Name: `_TEST_ROM_INVOICE_TEMPLATE`
  - Location: ROM_INVOICES_test folder
  - Purpose: Staging testing, Phase 2 hardening

## Google Sheets

### Staging Data Sheet
- **Name:** ROMwebsite2026_data
- **ID:** `17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ`
- **Purpose:** Test data for invoice generation

## Verified Placeholders

Template contains all required placeholders:
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

## Ownership Tracking

**Note from Ryan:** "We may need to make sure ryan.owen has ownership of many of these files before we go live."

### Current Ownership Status
- [ ] ROM_INVOICE_TEMPLATE_test - **Needs verification**
- [x] _TEST_ROM_INVOICE_TEMPLATE - Bardo (test copy)
- [ ] ROM_INVOICES folder (production) - **Needs verification**
- [ ] ROMwebsite2026_data sheet - **Needs verification**

**Action Required:** Before production deployment, audit and transfer ownership to ryan.owen@ryanowenphotography.com where necessary.

## Phase 2 Hardening Notes

**Current Risk:** Apps Script likely uses folder paths or folder searches to locate template.

**Improvement:** Replace folder searches with direct file ID references:
```javascript
// ❌ OLD WAY (fragile)
const folder = DriveApp.getFoldersByName("ROM_INVOICES").next();
const template = folder.getFilesByName("ROM_INVOICE_TEMPLATE").next();

// ✅ NEW WAY (hardened)
const TEMPLATE_FILE_ID = "12BCu044gKreQOVl_Wc_SeWa4I8HDBnwItmAKzqhokuI";
const INVOICE_FOLDER_ID = "1HqX-2vXNlgWtGzRP6N_RFZbTmk0T3cM3";
const template = DriveApp.getFileById(TEMPLATE_FILE_ID);
const folder = DriveApp.getFolderById(INVOICE_FOLDER_ID);
```

**Benefits:**
- No ambiguity if duplicate folder/file names exist
- Faster execution (direct lookup vs search)
- Survives renames
- Production file IDs can be different from test IDs

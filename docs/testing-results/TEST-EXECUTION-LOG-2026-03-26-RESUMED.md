# ROM Invoice Testing - Execution Log
**Date:** 2026-03-26 18:33 EDT  
**Tester:** Leo (ROM Automation Specialist)  
**Status:** 🟢 **ACTIVE - Blocker Resolved**

---

## Test Environment Setup

### ✅ Template Verification (18:33 EDT)
**Source Template:**
- ID: `12BCu044gKreQOVl_Wc_SeWa4I8HDBnwItmAKzqhokuI`
- Name: `ROM_INVOICE_TEMPLATE_test`
- Owner: Ryan's Drive
- Modified: 2026-03-26 22:28:52 UTC

**Test Copy Created:**
- ID: `1CT5ZPOuClxwZUWcGbyrKorP_AePVYP4io_cNpVsvqoQ`
- Name: `_TEST_ROM_INVOICE_TEMPLATE`
- Location: ROM_INVOICES_test folder (`1HqX-2vXNlgWtGzRP6N_RFZbTmk0T3cM3`)

**Placeholders Verified:** ✅ All 10 required placeholders present
- {{INVOICE_NUMBER}}
- {{INVOICE_DATE}}
- {{CLIENT_NAME}}
- {{CLIENT_EMAIL}}
- {{COMPANY}}
- {{SUBTOTAL}}
- {{DEPOSIT}}
- {{AMOUNT_DUE}}
- {{DATE_DUE}}
- {{LINE_ITEMS_TABLE}}

### ✅ Staging Sheet Access (18:33 EDT)
- **Sheet ID:** 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ
- **Sheet Name:** ROMwebsite2026_data
- **SETTINGS!B1:** 2026-1740 (current invoice number)
- **Test Data Available:** 9 rows in '2026 FORM_DATA' sheet

### ✅ Drive Test Folder (18:33 EDT)
- **Folder ID:** 1HqX-2vXNlgWtGzRP6N_RFZbTmk0T3cM3
- **QR Codes Present:**
  - ZelleQR.jpg: `12B5awVuLIdkcSeXYJuuuAcQQrdab_fnT`
  - VenmoQR.jpg: `10Sj8tFViIMI9sYyqQ65u117OhsvsVbtX`
- **_PREVIEW subfolder:** `1cB_efS64bllJoWI5fQwEmeccCS9WSJaV`

---

## Testing Strategy

### Phase 1: Manual Calculation Verification (TC-001 to TC-005)
**Goal:** Verify invoice calculations are accurate before deploying any Apps Script

**Method:** 
1. Manually inspect existing test data rows
2. Calculate expected invoice totals
3. Compare against what script WOULD generate
4. Document any discrepancies

**Rows Selected for Verification:**
- Row 3: PenFed Gallo (David T. King) - Estimated: $347
- Row 4: Other (Anthony Sacco) - Estimated: $288
- Row 5: PenFed Gallo (Elizabeth Evans) - Estimated: $99
- Row 10: Keller Williams (Rafael Semidey) - Estimated: $307, Deposit: $150

### Phase 2: Apps Script Deployment
**Prerequisites:**
1. ✅ Template available
2. ✅ Test folder configured
3. ⏸️ Script modifications for test environment
4. ⏸️ Safety checks implemented

**Script Modifications Needed:**
```javascript
// Change these constants:
const DOC_TEMPLATE_NAME = "_TEST_ROM_INVOICE_TEMPLATE";
const INVOICE_FOLDER_NAME = "ROM_INVOICES_test";
const EMAIL_BCC_ADDRESS = "bardo.faraday+rom@gmail.com";

// Add safety check at top of main functions:
const SHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();
if (SHEET_ID !== "17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ") {
  throw new Error("SAFETY CHECK FAILED: Not running on staging sheet!");
}
```

### Phase 3: Controlled Testing (TC-020 to TC-063)
**Test Sequence:**
1. Preview mode first (no emails, no writes)
2. Single invoice generation (1 row)
3. Multi-row company group (3 rows)
4. Email delivery verification
5. Sheet writes verification
6. Invoice number increment

---

## Test Case Execution

### TC-001: Basic Calculation - Simple Line Items
**Status:** ⏸️ PENDING  
**Prerequisites:** Manual data inspection  
**Expected Result:** Total = sum of all line items  
**Actual Result:** (not yet tested)

### TC-002: Calculation with Deposit
**Status:** ⏸️ PENDING  
**Row:** Row 10 (Rafael Semidey)  
**Expected:** Total $307, Deposit $150, Amount Due $157  
**Actual Result:** (not yet tested)

---

## Issues & Blockers

### ✅ RESOLVED: Template Access
**Issue:** Invoice template was not accessible  
**Resolution:** Ryan shared template at 22:28 UTC  
**Resolution Time:** ~6 hours from initial blocker report

---

## Next Steps

1. **Manual Calculation Verification (30 min)**
   - Review rows 3, 4, 5, 10 from staging sheet
   - Calculate expected totals manually
   - Document in this log

2. **Script Configuration (15 min)**
   - Copy ROM-APPS-SCRIPT-WITH-REELS.gs to test version
   - Modify constants for test environment
   - Add safety checks

3. **Apps Script Deployment (15 min)**
   - Deploy to ROMwebsite2026_data sheet
   - Verify script appears in menu
   - Test preview mode (no writes)

4. **Begin Test Execution (2-3 hours)**
   - TC-001 to TC-005 (calculations)
   - TC-020 to TC-027 (workflow logic)
   - Document results continuously

---

**Log will be updated as testing progresses.**

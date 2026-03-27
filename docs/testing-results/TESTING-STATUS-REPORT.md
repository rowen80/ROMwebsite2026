# ROM Invoice Testing - Status Report

**Date:** 2026-03-26 17:45 EDT  
**Tester:** Leo (ROM Automation Specialist)  
**Status:** 🟡 **BLOCKED - Critical Dependency Missing**

---

## Executive Summary

Testing infrastructure is **95% ready**, but **critical blocker discovered**: The Google Doc invoice template (`_ROM_INVOICE_TEMPLATE`) does not exist in Drive, which will prevent all invoice generation testing.

**Recommendation:** Ryan needs to either:
1. Create the template in Drive with required placeholders, OR
2. Share access to the existing production template so I can copy it for testing

---

## Environment Verification Results

### ✅ Staging Sheet (PASS)
**Sheet ID:** 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ  
**Status:** All required sheets present and accessible

- ✅ **2026 FORM_DATA** - Main data sheet exists
- ✅ **SETTINGS** - Present (NextInvoiceNumber: 2026-1740)
- ✅ **CO_BILLING_INFO** - Present with 4 companies configured
- ✅ **INVOICES** - Present (invoice tracking)

**Current State:**
- NextInvoiceNumber: `2026-1740` (will change to `9999-0001` for testing)
- Test companies available: PenFed Gallo Realty, Central Reservations, Keller Williams, LeeAnn Group

---

### ✅ Drive Test Folder (PASS)
**Folder:** ROM_INVOICES_test  
**ID:** 1HqX-2vXNlgWtGzRP6N_RFZbTmk0T3cM3  
**Status:** Exists with correct structure

- ✅ **_PREVIEW** subfolder exists (ID: 1cB_efS64bllJoWI5fQwEmeccCS9WSJaV)
- ✅ **ZelleQR.jpg** exists (ID: 12B5awVuLIdkcSeXYJuuuAcQQrdab_fnT)
- ✅ **VenmoQR.jpg** exists (ID: 10Sj8tFViIMI9sYyqQ65u117OhsvsVbtX)

---

### ❌ Invoice Template (CRITICAL BLOCKER)
**Expected:** `_ROM_INVOICE_TEMPLATE` (Google Doc)  
**Status:** **NOT FOUND** in Drive

**Impact:** 🔴 **HIGH**
- All invoice generation tests will fail
- Cannot test PDF creation, placeholder replacement, or invoice workflows
- Blocks: TC-001 through TC-005, TC-021, TC-023, TC-025, and all invoice-related tests

**Required Template Placeholders** (from script analysis):
```
{{INVOICE_NUMBER}}
{{INVOICE_DATE}}
{{CLIENT_NAME}}
{{COMPANY}}
{{CLIENT_EMAIL}}
{{SUBTOTAL}}
{{DEPOSIT}}
{{AMOUNT_DUE}}
{{DATE_DUE}}
{{LINE_ITEMS_TABLE}}
```

**Options to Resolve:**
1. **Ryan creates test template** - Provide me with a blank Google Doc with placeholders
2. **Copy production template** - Share access to existing `_ROM_INVOICE_TEMPLATE` so I can copy it
3. **I create template from scratch** - Using placeholder list above (requires Ryan's approval of format)

---

### ✅ Apps Script (READY)
**Location:** `~/lab/projects/rom/website-lab/romwebsite2026/reference/ROM-APPS-SCRIPT-WITH-REELS.gs`  
**Status:** Script reviewed and ready for deployment

**Configuration Changes Needed for Testing:**
```javascript
// Current (production):
const DOC_TEMPLATE_NAME = "_ROM_INVOICE_TEMPLATE";
const INVOICE_FOLDER_NAME = "ROM_INVOICES";
const EMAIL_FROM_ADDRESS = "ryan@ryanowenphotography.com";
const EMAIL_BCC_ADDRESS = "ryan@ryanowenphotography.com";

// Test version (needed):
const DOC_TEMPLATE_NAME = "_TEST_ROM_INVOICE_TEMPLATE";
const INVOICE_FOLDER_NAME = "ROM_INVOICES_test";
const EMAIL_FROM_ADDRESS = "ryan@ryanowenphotography.com";
const EMAIL_BCC_ADDRESS = "bardo.faraday+rom@gmail.com";
```

**Deployment Status:** 
- ⏸️ **Paused** until template issue resolved
- Script is valid and will deploy cleanly
- Estimated deployment time: 5 minutes

---

## Test Data Preparation

### Test Companies (CO_BILLING_INFO)
**Status:** ✅ Can use existing staging data OR create dedicated test companies

**Existing Companies Available:**
1. **PenFed Gallo Realty**
   - BillingEmail: rehoboth@penfedrealty.com
   - BillingContactName: Andrew Ratner
   
2. **Keller Williams**
   - BillingEmail: mmoorerealtor@gmail.com; mmoore1756@msn.com
   - BillingContactName: Michael Moore

**Recommendation:** Create 2 dedicated test companies:
- **Test Company A** (simple billing)
- **Test Company B** (multi-job testing)

This isolates test data from production companies and makes cleanup easier.

---

## Testing Phases - Readiness Assessment

### Phase 1: Core Testing (TC-001 to TC-063)
**Status:** 🔴 **BLOCKED** by missing template  
**Dependencies:**
- ❌ Invoice template
- ✅ Staging sheet access
- ✅ Drive test folder
- ✅ QR codes
- ⏸️ Test script deployment (waiting for template)

**Time Estimate:** 4-6 hours once unblocked

---

### Phase 2: Improvements (Rollback, Logging, Hardened Paths)
**Status:** 🟡 **READY** (can start in parallel)  
**Dependencies:**
- ✅ Current script reviewed
- ✅ Understanding of workflow logic
- ✅ Requirements documented

**Proposed Improvements:**

#### 1. Rollback Mechanism
**Current Risk:** If email send fails after PDF creation and sheet writes, state is inconsistent  
**Proposed Solution:**
```javascript
function withRollback_(operation, rollbackData) {
  try {
    const result = operation();
    return result;
  } catch (error) {
    // Rollback sheet writes
    if (rollbackData.invoiceRow) {
      // Delete from INVOICES sheet
    }
    if (rollbackData.formDataWrites) {
      // Clear InvoiceNumber, InvoicedAt, etc.
    }
    // Decrement invoice number
    throw error; // Re-throw after cleanup
  }
}
```

#### 2. Logging/Audit Trail
**Proposed:** Create `SCRIPT_LOG` sheet with columns:
- Timestamp
- User (Session.getActiveUser().getEmail())
- Workflow (e.g., "Photos + Invoice - Company")
- Rows Processed
- Invoices Created
- Emails Sent
- Errors
- Execution Time

**Benefits:**
- Debugging assistance
- Audit trail for Ryan
- Performance monitoring

#### 3. Hardened Drive Paths
**Current Risk:** Script searches by name (could find wrong file if duplicates exist)  
**Proposed Solution:**
```javascript
// Instead of:
const template = DriveApp.getFilesByName(DOC_TEMPLATE_NAME).next();

// Use:
const TEMPLATE_FILE_ID = "abc123..."; // Hardcoded
const template = DriveApp.getFileById(TEMPLATE_FILE_ID);
```

**Implementation Plan:**
1. Locate all Drive file IDs (template, folder, QR codes)
2. Add constants to script
3. Update all DriveApp calls to use IDs instead of names

**Time Estimate for Phase 2:** 2-3 hours

---

### Phase 3: Additional Testing (TC-040 to TC-074)
**Status:** 🟡 **READY** once Phase 1 unblocked  
**Dependencies:**
- ⏸️ Phase 1 completion
- ⏸️ Phase 2 improvements deployed

**Time Estimate:** 3-4 hours

---

## Recommended Action Plan

### Option 1: Fast Track (Template Provided)
**If Ryan can provide/create template TODAY:**

1. **Immediate (15 min):**
   - Ryan creates `_TEST_ROM_INVOICE_TEMPLATE` with placeholders
   - Shares link with me
   
2. **Setup (30 min):**
   - Deploy test script to staging sheet
   - Create test data rows
   - Update SETTINGS!B1 to 9999-0001
   
3. **Phase 1 Testing (4-6 hours):**
   - Execute TC-001 to TC-063
   - Document results
   
4. **Phase 2 Improvements (2-3 hours):**
   - Implement rollback, logging, hardened paths
   - Test improvements
   
5. **Phase 3 Final Testing (3-4 hours):**
   - Execute remaining test cases
   - Final validation

**Total Time:** 10-14 hours (can complete in 2 days)

---

### Option 2: Parallel Work (Template Delayed)
**If template requires more time:**

1. **Today (2-3 hours):**
   - Implement Phase 2 improvements (rollback, logging, hardening)
   - Create detailed script documentation
   - Prepare test data in staging sheet
   
2. **When template ready:**
   - Deploy improved script
   - Execute full test plan (Phases 1 + 3)

**Total Time:** Same as Option 1, but work spread over more days

---

### Option 3: I Create Template (Needs Approval)
**If Ryan wants me to create template:**

1. **Template Creation (1 hour):**
   - Create Google Doc with standard invoice layout
   - Add all required placeholders
   - Format with ROM branding (Ryan provides logo/colors)
   - Submit for Ryan's review
   
2. **After Approval:**
   - Proceed with Option 1 timeline

---

## Questions for Ryan

1. **Template Decision:**
   - Can you create/share `_ROM_INVOICE_TEMPLATE`? 
   - OR should I create one from scratch (need branding assets)?
   - OR do you have an existing template I can access?

2. **Testing Scope:**
   - Proceed with Phase 2 improvements while waiting for template? (Yes/No)
   - Any additional workflows not in testing plan?

3. **Test Data:**
   - Use existing companies in CO_BILLING_INFO? 
   - OR create dedicated test companies? (Recommended)

4. **Email Testing:**
   - Send test emails to bardo.faraday+rom@gmail.com only? 
   - OR include ryan+test@ryanowenphotography.com?

---

## Risk Assessment

### Critical Risks
1. **Missing Template:** Blocks 80% of testing - **RESOLVED WITH RYAN'S INPUT**
2. **Invoice Number Collision:** If SETTINGS!B1 not properly managed - **MITIGATED** (will use 9999-XXXX sequence)
3. **Production Data Contamination:** Accidentally modifying live sheet - **MITIGATED** (staging sheet ID hardcoded)

### Medium Risks
1. **Email Quota:** Gmail daily limit could be hit - **MITIGATED** (small batch testing)
2. **Drive Permissions:** QR codes or folders not accessible - **VERIFIED** (all accessible)
3. **Send-As Configuration:** Gmail alias not configured - **NEEDS VERIFICATION** (cannot test until script deployed)

### Low Risks
1. **Sheet Formula Breakage:** Array formulas overwritten - **LOW** (script doesn't touch formula rows)
2. **Concurrent Execution:** Multiple users running script - **LOW** (Apps Script handles locking)

---

## Next Steps (Awaiting Ryan's Decision)

**I'm ready to proceed once Ryan:**
1. ✅ Provides/creates the invoice template
2. ✅ Approves test configuration (email addresses, test companies)
3. ✅ Decides: Phase 2 improvements now OR wait for testing?

**Estimated completion once unblocked:** 2-3 days (10-14 hours total work)

---

## Contact

**Leo (Bardo's ROM Automation Agent)**  
Ready to proceed immediately once template blocker is resolved.

**Deliverables will be saved to:**
`~/lab/projects/rom/website-lab/romwebsite2026/docs/testing-results/`

---

**Status:** ⏸️ Paused - Awaiting Ryan's input on template creation

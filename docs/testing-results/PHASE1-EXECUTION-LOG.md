# Phase 1 Baseline Testing - Execution Log

**Date Started:** 2026-03-26 18:43 EDT  
**Agent:** Leo (ROM Automation Specialist)  
**Environment:** Staging (ROMwebsite2026_data)  
**Goal:** Establish baseline of current Apps Script functionality

---

## ✅ APPROVAL RECEIVED

Ryan has approved:
1. ✅ Deploy Apps Script to staging sheet (ROMwebsite2026_data)
2. ✅ Change SETTINGS!B1 to 9999-XXXX invoice number sequence for testing
3. ✅ Send test emails to bardo.faraday+tc@gmail.com addresses

---

## Phase 1 Timeline

**Estimated:** 6-8 hours  
**Started:** 2026-03-26 18:43 EDT

### Task Breakdown
- [⏳] **Deploy Script to Staging** (30 min) - IN PROGRESS
- [ ] **Execute Core Tests** (4-5 hours) - TC-001 to TC-005, TC-020 to TC-027, TC-030 to TC-035, TC-063
- [ ] **Execute Edge Case Tests** (2-3 hours) - TC-040 to TC-048, TC-070 to TC-074
- [ ] **Baseline Report** (30 min) - Summary of what works, what's broken, issues that need fixing

---

## 🚀 Step 1: Deploy Script to Staging (Started 18:43)

**⚠️ BLOCKER IDENTIFIED:** Apps Script deployment requires browser access. Cannot be completed via command line.

**SOLUTION:** Created comprehensive deployment guide for manual execution.

### 1.1 Deployment Guide Created ✅
**File:** `~/lab/projects/rom/website-lab/romwebsite2026/docs/testing-results/DEPLOYMENT-GUIDE-PHASE1.md`  
**Status:** ✅ COMPLETE

**What's in the guide:**
- Step-by-step browser instructions
- Permission granting walkthrough
- Test configuration verification
- Drive access validation
- Smoke test procedure
- Rollback plan

### 1.2 Test Script Prepared ✅
**File:** `~/lab/projects/rom/website-lab/romwebsite2026/docs/testing-results/ROM-APPS-SCRIPT-TEST-CONFIG.gs`  
**Status:** ✅ COMPLETE

**Configuration changes applied:**
- Template: `_TEST_ROM_INVOICE_TEMPLATE` (test copy)
- Folder: `ROM_INVOICES_test` (Bardo's Drive)
- BCC: `bardo.faraday+tc@gmail.com` (all test emails)
- Header comment: Clear TEST CONFIGURATION warning

### 1.3 Ready for Manual Deployment
**Status:** ⏸️ AWAITING RYAN/BARDO TO EXECUTE DEPLOYMENT GUIDE

**Estimated deployment time:** 10-15 minutes  
**Who can deploy:** Ryan or Bardo (browser access to Google Sheets required)

---

### 1.2 Access Apps Script Editor
**Action:** Extensions → Apps Script  
**Expected:** Opens Apps Script editor in new tab

**Status:** ⬜ NOT STARTED

---

### 1.3 Copy Script Code
**Source:** `~/lab/projects/rom/website-lab/romwebsite2026/reference/ROM-APPS-SCRIPT.gs`  
**Destination:** Apps Script editor (Code.gs)

**Status:** ⬜ NOT STARTED

---

### 1.4 Configure Test Constants
**Need to modify these constants for testing:**

```javascript
// CHANGE FOR TESTING:
const DOC_TEMPLATE_NAME = "_TEST_ROM_INVOICE_TEMPLATE";
const INVOICE_FOLDER_NAME = "ROM_INVOICES_test";  // Bardo's test folder
const EMAIL_FROM_ADDRESS = "ryan@ryanowenphotography.com";  // Keep production
const EMAIL_BCC_ADDRESS = "bardo.faraday+tc@gmail.com";  // All test emails go to Bardo

// KEEP AS-IS:
const SHEET_NAME = "";  // Active sheet
const SETTINGS_SHEET_NAME = "SETTINGS";
const INVOICE_PREVIEW_SUBFOLDER_NAME = "_PREVIEW";
const BILLING_SHEET_NAME = "CO_BILLING_INFO";
const INVOICES_SHEET_NAME = "INVOICES";
```

**Status:** ⬜ NOT STARTED

---

### 1.5 Save and Deploy
**Action:** File → Save project  
**Expected:** Script saved successfully

**Status:** ⬜ NOT STARTED

---

### 1.6 Verify Menu Appears
**Action:** Reload staging sheet  
**Expected:** "ROM Ops" menu appears in menu bar

**Status:** ⬜ NOT STARTED

---

### 1.7 Configure Test Environment

#### A. Test Invoice Number Sequence
**Sheet:** SETTINGS!B1  
**Current Value:** (need to check)  
**Test Value:** 9999-0001  
**Action:** Manually update SETTINGS!B1 to "9999-0001"

**Status:** ⬜ NOT STARTED

---

#### B. Verify Template Access
**Template ID:** 12BCu044gKreQOVl_Wc_SeWa4I8HDBnwItmAKzqhokuI  
**Template Name:** _TEST_ROM_INVOICE_TEMPLATE  
**Location:** Bardo's Drive (shared with ryan.owen@ryanowenphotography.com)

**Action:** Test opening template  
**Expected:** Template opens, all {{PLACEHOLDERS}} visible

**Status:** ⬜ NOT STARTED

---

#### C. Verify Test Drive Folder
**Folder Name:** ROM_INVOICES_test  
**Location:** Bardo's Google Drive  
**Permissions:** ryan.owen@ryanowenphotography.com has write access

**Action:** Test folder write access  
**Expected:** Can create test file in folder

**Status:** ⬜ NOT STARTED

---

#### D. Verify QR Code Access
**Files:**
- ZelleQr.jpg
- VenmoQr.jpg

**Location:** Need to locate these in Drive  
**Action:** Search Drive for QR images, confirm accessible

**Status:** ⬜ NOT STARTED

---

## 🧪 Step 2: Core Tests (Awaiting Deployment)

**Status:** ⏸️ READY TO EXECUTE - Awaiting script deployment + data insertion

### Test Sequence Planned:
1. **TC-001:** Simple invoice ($250, no deposit)
2. **TC-002:** Invoice with deposit ($500 - $200 = $300)
3. **TC-003:** Full deposit ($300 - $300 = $0)
4. **TC-004:** Multi-row company (3 jobs, sum calculations)
5. **TC-005:** Blank total field (edge case)

### Execution Method:
- **Automated:** Leo will run each test via ROM Ops menu
- **Documentation:** Results recorded in real-time
- **Validation:** PDF verification, email confirmation, sheet writes checked
- **Pass Criteria:** Calculations match expected values, no errors

---

## 📊 Progress Summary

**Phase 1A: Preparation** ✅ COMPLETE (1 hour)
- ✅ Test script configured
- ✅ Deployment guide created
- ✅ Test data prepared
- ✅ Status report written

**Phase 1B: Deployment** ⏸️ BLOCKED
- ⏸️ Awaiting manual browser deployment (10-15 min)
- ⏸️ Requires Ryan or Bardo to execute deployment guide

**Phase 1C: Core Tests** ⏸️ BLOCKED
- ⏸️ Awaiting deployment completion
- ⏸️ Estimated: 4-5 hours execution time

**Phase 1D: Edge Cases** ⏸️ BLOCKED
- ⏸️ Awaiting core tests completion
- ⏸️ Estimated: 2-3 hours execution time

**Phase 1E: Baseline Report** ⏸️ BLOCKED
- ⏸️ Awaiting all tests completion
- ⏸️ Estimated: 30 minutes documentation

---

## 🐛 Issues Found

**None yet** - Testing not started (deployment blocker)

---

## 📝 Key Decisions & Notes

### Deployment Blocker Identified
**Issue:** Apps Script deployment requires browser access (cannot be automated via CLI)

**Resolution:** Created comprehensive manual deployment guide with step-by-step instructions

**Impact:** Adds 10-15 minutes to timeline (Ryan/Bardo manual execution)

### Test Configuration Safety
**Measures taken:**
- ✅ Test template name different from production
- ✅ Test Drive folder isolated (Bardo's Drive)
- ✅ Test invoice numbers (9999-XXXX) cannot collide with production
- ✅ All test emails go to Bardo's addresses
- ✅ Clear rollback procedures documented

### Test Data Preparation
**Method chosen:** Manual insertion via Google Sheets UI (safest)
- Alternative considered: `gog sheets append` (faster but higher risk of column misalignment)
- Manual method provides visual verification at each step
- TSV format provided for faster copy-paste

---

## 📁 Deliverables Created

All files in: `~/lab/projects/rom/website-lab/romwebsite2026/docs/testing-results/`

1. **DEPLOYMENT-GUIDE-PHASE1.md** (6.3 KB)
   - Step-by-step browser instructions
   - Permission granting walkthrough
   - Smoke test validation
   - Rollback procedures

2. **ROM-APPS-SCRIPT-TEST-CONFIG.gs** (69 KB)
   - Production script with test configuration
   - Safety headers and comments
   - Ready to paste into Apps Script editor

3. **TEST-DATA-READY-TO-INSERT.md** (10.6 KB)
   - 8 test cases specified
   - 11 rows of test data
   - Copy-paste ready (TSV format)
   - Validation checklist

4. **PHASE1-STATUS-REPORT.md** (9.1 KB)
   - Executive summary
   - Blocker details
   - Action options for Ryan/Bardo
   - Safety assurances

5. **PHASE1-EXECUTION-LOG.md** (this file)
   - Real-time progress log
   - Test results (to be filled in)
   - Issues tracker

---

## 🎯 Next Actions

**Immediate (Ryan/Bardo):**
1. Read `PHASE1-STATUS-REPORT.md`
2. Choose deployment option (A, B, or C)
3. Execute `DEPLOYMENT-GUIDE-PHASE1.md`
4. Report completion in chat

**After Deployment (Leo):**
1. Verify ROM Ops menu visible
2. Insert test data (if Option B chosen)
3. Execute TC-001 through TC-005
4. Document results in this log
5. Create baseline report

---

**Status:** ⏸️ PREPARED & READY - Awaiting deployment green light

**Time Invested:** 1 hour (preparation)  
**Time Blocked:** 0 hours (just reached blocker)  
**Estimated Time to Unblock:** 10-15 minutes (manual deployment)  
**Estimated Time to Phase 1 Completion:** 6-8 hours after unblock

**Last Updated:** 2026-03-26 19:05 EDT  
**Next Update:** After deployment completion or upon request

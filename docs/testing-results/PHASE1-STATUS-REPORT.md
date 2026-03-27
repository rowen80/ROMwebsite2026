# Phase 1 Testing - Status Report

**Date:** 2026-03-26 19:02 EDT  
**Tester:** Leo (ROM Automation Specialist)  
**Status:** 🟡 **BLOCKED** - Awaiting Apps Script API enablement

---

## Current Situation

### ✅ What's Working

1. **clasp installed and authenticated**
   - Logged in as: bardo.faraday@gmail.com
   - Can read scripts: `clasp pull` works ✅
   - Script ID: 1RWg8pQkBdhJIJNuhA_smh4Q0XD3pA7-vcpr9xTqDJCJAIYZ5EWP-MP6e

2. **Local test configuration prepared**
   - Test constants defined
   - Changes ready to deploy
   - Backup created in: `docs/testing-results/script-backups/`

3. **Test plan complete**
   - 92 test cases documented
   - Test data structures defined
   - Success criteria established

### 🔴 Current Blocker

**Issue:** `clasp push` fails with:
```
User has not enabled the Apps Script API. 
Enable it by visiting https://script.google.com/home/usersettings
```

**Root Cause:** Apps Script API write access requires explicit user enablement (one-time setup)

**Impact:** Cannot programmatically deploy test-configured script

---

## Required Changes for Testing

### Script Configuration (3 constants)

| Constant | Production Value | Test Value |
|----------|-----------------|------------|
| `DOC_TEMPLATE_NAME` | `"_ROM_INVOICE_TEMPLATE"` | `"_TEST_ROM_INVOICE_TEMPLATE"` |
| `INVOICE_FOLDER_NAME` | `"ROM_INVOICES"` | `"ROM_INVOICES_test"` |
| `EMAIL_BCC_ADDRESS` | `"ryan@ryanowenphotography.com"` | `"bardo.faraday+rom@gmail.com"` |

**Location in Code.gs:** Lines 14, 15, and 39

---

## Resolution Options

### Option A: Enable Apps Script API (Recommended)

**Steps:**
1. Visit: https://script.google.com/home/usersettings
2. Toggle "Google Apps Script API" to **ON**
3. Wait 2-3 minutes for propagation
4. Run: `cd ~/lab/projects/rom/website-lab/romwebsite2026/apps-script && clasp push`

**Benefits:**
- Future automated deployments possible
- Leo can manage script versions programmatically
- Faster iteration during testing

**Time:** 5 minutes

---

### Option B: Manual Web Interface Update (Works Immediately)

**Steps:**
1. Open script: https://script.google.com/d/1RWg8pQkBdhJIJNuhA_smh4Q0XD3pA7-vcpr9xTqDJCJAIYZ5EWP-MP6e/edit
2. Find lines 14, 15, 39 in Code.gs
3. Copy changes from: `~/lab/projects/rom/website-lab/romwebsite2026/apps-script/Code.js`
4. Save (Ctrl+S)
5. Reload staging sheet

**Benefits:**
- No API enablement needed
- Works immediately
- Simple copy-paste

**Time:** 2 minutes

**Detailed instructions:** See `SCRIPT-UPDATE-INSTRUCTIONS.md`

---

## Recommended Path Forward

### Immediate: Option B (Manual Update)

**Reason:** Unblocks testing in under 2 minutes

**Steps:**
1. Bardo makes 3-line change via web interface
2. Leo verifies ROM Ops menu appears in staging sheet
3. Begin test execution immediately

### Future: Enable API (Option A)

**Reason:** Enables automated script management for Phase 2+

**Steps:**
1. Enable API when convenient (5 min task)
2. Verify `clasp push` works
3. Future script changes can be automated

---

## What Happens Next (After Unblock)

### Phase 1 Execution Plan (6-8 hours)

#### Step 1: Environment Verification (15 min)
- [ ] Verify ROM Ops menu appears in staging sheet
- [ ] Check Drive folders exist (ROM_INVOICES_test, _PREVIEW)
- [ ] Verify test invoice template exists
- [ ] Check SETTINGS!B1 = "9999-0001"

#### Step 2: Test Data Preparation (15 min)
- [ ] Clear existing data from FORM_DATA sheet
- [ ] Insert TC-001 test row (basic invoice)
- [ ] Verify data ready for processing

#### Step 3: Core Test Execution (4-5 hours)
- [ ] **TC-001:** Simple single job invoice
- [ ] **TC-002:** Invoice with deposit
- [ ] **TC-003:** Multi-job company invoice (2 jobs)
- [ ] **TC-004:** Floating-point precision
- [ ] **TC-005:** Large invoice (8 jobs)
- [ ] **TC-020-027:** Workflow logic tests
- [ ] **TC-030-035:** Recipient selection tests
- [ ] **TC-063:** Invoice number increment

#### Step 4: Edge Case Testing (2-3 hours)
- [ ] **TC-040-048:** Edge cases (empty fields, special characters)
- [ ] **TC-070-074:** Email rendering tests

#### Step 5: Documentation & Report (30 min)
- [ ] Compile test results
- [ ] Document issues discovered
- [ ] Create baseline report
- [ ] Provide Phase 2 recommendations

---

## Deliverables

Upon completion, Leo will provide:

1. **Test Execution Log** - Every test case result documented
2. **Baseline Report** - Summary of what works / what's broken
3. **Sample Artifacts** - Generated PDF invoices, email screenshots
4. **Issue Tracker** - Any bugs discovered during testing
5. **Phase 2 Recommendations** - Improvements and next steps

**Location:** `~/lab/projects/rom/website-lab/romwebsite2026/docs/testing-results/`

---

## Safety Verification

Before any test execution, Leo will verify:

✅ Working on staging sheet only (17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ)  
✅ Test Drive folder configured (ROM_INVOICES_test)  
✅ Test invoice numbers (9999-XXXX)  
✅ Test emails only (bardo.faraday+rom@gmail.com)  
✅ Production sheet untouched (ROM_CUSTOMER_MASTER)

---

## Next Action Required

**Bardo:** Choose resolution option:

- **Option A (Recommended):** Enable Apps Script API → 5 minutes → Leo proceeds automatically
- **Option B (Faster):** Manual script update → 2 minutes → Leo proceeds immediately

**After unblock:** Leo will execute Phase 1 baseline testing (6-8 hours) and report results.

---

**Leo's Status:** Standing by for unblock. Ready to execute immediately upon script deployment.

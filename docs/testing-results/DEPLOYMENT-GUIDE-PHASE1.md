# Phase 1 Deployment Guide - Manual Steps Required

**Date:** 2026-03-26 18:50 EDT  
**Prepared by:** Leo (ROM Automation Specialist)  
**Target:** Staging sheet (ROMwebsite2026_data)  
**Estimated Time:** 10-15 minutes

---

## ⚠️ IMPORTANT: Manual Browser Steps Required

I (Leo) cannot directly deploy Apps Script via command line. Ryan or Bardo needs to complete these browser-based steps.

---

## 📋 Deployment Checklist

### Step 1: Open Staging Sheet (1 min)
1. Open browser: https://docs.google.com/spreadsheets/d/17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ/edit
2. Verify you're on **ROMwebsite2026_data** (check title bar)
3. ✅ Confirm this is NOT the production ROM_CUSTOMER_MASTER sheet

---

### Step 2: Open Apps Script Editor (1 min)
1. Click: **Extensions → Apps Script**
2. New tab opens with Apps Script editor
3. If existing code present:
   - Take a screenshot (backup)
   - Note the project name
4. Ready to paste new code

---

### Step 3: Deploy Test Script (3 min)

#### Copy Script from Local File
**File location:** `~/lab/projects/rom/website-lab/romwebsite2026/docs/testing-results/ROM-APPS-SCRIPT-TEST-CONFIG.gs`

**Option A: Command Line (Mac/Linux)**
```bash
# Copy script to clipboard
cat ~/lab/projects/rom/website-lab/romwebsite2026/docs/testing-results/ROM-APPS-SCRIPT-TEST-CONFIG.gs | pbcopy
```

**Option B: Manual Copy**
1. Open file in text editor
2. Select All (Cmd+A)
3. Copy (Cmd+C)

#### Paste into Apps Script Editor
1. In Apps Script editor, select all existing code (Cmd+A)
2. Paste new code (Cmd+V)
3. Verify header comment says: **"TEST CONFIGURATION"**
4. Verify these constants are present:
   ```javascript
   const DOC_TEMPLATE_NAME = "_TEST_ROM_INVOICE_TEMPLATE";
   const INVOICE_FOLDER_NAME = "ROM_INVOICES_test";
   const EMAIL_BCC_ADDRESS = "bardo.faraday+tc@gmail.com";
   ```

#### Save Project
1. Click: **File → Save** (or Cmd+S)
2. If prompted for project name, use: **"ROM Ops - Testing"**
3. Wait for "Saved" confirmation

---

### Step 4: Grant Permissions (2-5 min)

Apps Script needs permissions to access Drive, Gmail, Sheets.

1. Click: **Run → Run function → onOpen**
2. Dialog appears: **"Authorization required"**
3. Click: **Review permissions**
4. Select your Google account (ryan.owen@ryanowenphotography.com)
5. Click: **Advanced → Go to ROM Ops - Testing (unsafe)**
   - (This is YOUR script, so it's safe despite the warning)
6. Click: **Allow**
7. Wait for execution to complete

**Expected Result:** Function runs successfully (green checkmark in execution log)

---

### Step 5: Verify Menu Appears (1 min)

1. Return to staging spreadsheet tab
2. Reload the page (Cmd+R or F5)
3. Wait 3-5 seconds for sheet to load
4. Look for: **ROM Ops** menu in menu bar (next to Help)

✅ **SUCCESS:** Menu appears with submenus: Delivery, Invoicing

❌ **FAILURE:** Menu doesn't appear
   - **Fix:** Check Apps Script console for errors
   - **Fix:** Verify onOpen() function ran successfully
   - **Fix:** Try running onOpen() again manually

---

### Step 6: Configure Test Invoice Numbers (2 min)

1. In staging sheet, navigate to **SETTINGS** tab
2. Find cell **B1** (NextInvoiceNumber)
3. **Current value:** 2026-1740
4. **Change to:** 9999-0001
5. Press Enter to save

**Why 9999-XXXX?**
- Easy to identify test invoices
- No collision with production numbers
- Can be easily cleaned up after testing

✅ **Document current value for restore:** 2026-1740

---

### Step 7: Verify Drive Access (2 min)

Test script can access required Drive resources:

#### A. Test Invoice Template Access
1. In Apps Script editor, click: **Run → Run function → testTemplateAccess_**
   - (If this function doesn't exist, we'll add it - see below)
2. Check execution log for errors

**If function doesn't exist, add this test function:**
```javascript
function testTemplateAccess_() {
  try {
    const template = DriveApp.getFilesByName(DOC_TEMPLATE_NAME).next();
    Logger.log("✅ Template found: " + template.getName() + " (ID: " + template.getId() + ")");
  } catch (e) {
    Logger.log("❌ Template error: " + e.message);
  }
}
```

#### B. Test Invoice Folder Access
**Expected folder:** ROM_INVOICES_test (in Bardo's Drive)  
**Folder ID:** 1HqX-2vXNlgWtGzRP6N_RFZbTmk0T3cM3

**Manual verification:**
1. Open Drive: https://drive.google.com/drive/folders/1HqX-2vXNlgWtGzRP6N_RFZbTmk0T3cM3
2. Verify you can see the folder
3. Verify `_PREVIEW` subfolder exists
4. Verify `ZelleQR.jpg` and `VenmoQR.jpg` are present

---

### Step 8: Run First Test (2 min)

**Simple smoke test - NO data writes, NO emails**

1. In staging sheet, go to **2026 FORM_DATA** tab
2. Verify at least one row exists (any row is fine)
3. Click: **ROM Ops → Delivery → Send Photos Only (by Company)**
4. When prompted for company name, enter a company that DOESN'T exist: "TEST_NONEXISTENT"
5. Expected result: "No rows found for company: TEST_NONEXISTENT"

✅ **SUCCESS:** Script runs, shows message, no errors  
❌ **FAILURE:** Script throws errors → Check Apps Script logs

---

## ✅ Deployment Complete!

When all steps above succeed:

1. **Screenshot** the ROM Ops menu (proof of deployment)
2. **Document** SETTINGS!B1 value (should be 9999-0001)
3. **Confirm** no errors in Apps Script execution log
4. **Reply** to this thread: "Phase 1 deployment complete - ready for test execution"

---

## 🔄 Rollback Plan (If Needed)

If deployment fails or causes issues:

1. **Restore original script:**
   - Open Apps Script editor
   - Paste original code (from screenshot or backup)
   - Save

2. **Restore SETTINGS!B1:**
   - Change back to: 2026-1740

3. **Report issue:**
   - Include error messages from execution log
   - Include screenshots of any error dialogs

---

## 📞 Support

**Questions during deployment:** Ask immediately in chat  
**Errors in Apps Script:** Screenshot the error and send to Leo  
**Drive access issues:** Verify file sharing permissions

---

## Next Steps After Deployment

Once deployment is confirmed:

1. **Leo prepares test data** (TC-001 through TC-005)
2. **Leo executes core tests** (calculation accuracy)
3. **Leo documents results** in test execution log
4. **Proceed to edge case tests** (TC-040+)

**Estimated testing time:** 6-8 hours over 1-2 days

---

**Status:** ⏸️ AWAITING MANUAL DEPLOYMENT

**Last Updated:** 2026-03-26 18:50 EDT

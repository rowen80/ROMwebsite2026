# Apps Script Manual Update Instructions

**Date:** 2026-03-26  
**Issue:** `clasp push` requires Apps Script API to be enabled  
**Workaround:** Manual copy-paste via web interface

---

## Steps to Update Script for Testing

### 1. Enable Apps Script API (One-Time Setup)

Visit: https://script.google.com/home/usersettings

Enable "Google Apps Script API"

*(This will allow `clasp push` to work in the future)*

---

### 2. Manual Script Update (Alternative Method)

**Open the script in browser:**

```bash
clasp open-script
```

Or visit directly:
https://script.google.com/d/1RWg8pQkBdhJIJNuhA_smh4Q0XD3pA7-vcpr9xTqDJCJAIYZ5EWP-MP6e/edit

---

### 3. Make These Changes in Code.gs

**Find these lines (around line 14-15):**

```javascript
const DOC_TEMPLATE_NAME = "_ROM_INVOICE_TEMPLATE";
const INVOICE_FOLDER_NAME = "ROM_INVOICES";
```

**Change to:**

```javascript
const DOC_TEMPLATE_NAME = "_TEST_ROM_INVOICE_TEMPLATE"; // TEST MODE
const INVOICE_FOLDER_NAME = "ROM_INVOICES_test"; // TEST MODE
```

---

**Find this line (around line 39):**

```javascript
const EMAIL_BCC_ADDRESS = "ryan@ryanowenphotography.com";
```

**Change to:**

```javascript
const EMAIL_BCC_ADDRESS = "bardo.faraday+rom@gmail.com"; // TEST MODE - BCC to test email
```

---

### 4. Save and Verify

1. Click **Save** (or Ctrl+S / Cmd+S)
2. Verify no syntax errors shown
3. Reload the staging sheet: https://docs.google.com/spreadsheets/d/17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ/edit
4. Check that **ROM Ops** menu appears in the menu bar

---

## Alternative: Use Full Script File

If you prefer to copy the entire file:

**Local file with changes:**
```
~/lab/projects/rom/website-lab/romwebsite2026/apps-script/Code.js
```

**Or backup with timestamp:**
```
~/lab/projects/rom/website-lab/romwebsite2026/docs/testing-results/script-backups/Code-test-config-*.js
```

Copy entire contents and paste into Code.gs in the web editor.

---

## Verification Checklist

After updating:

- [ ] Script saved successfully
- [ ] No red error markers in editor
- [ ] Staging sheet reloaded
- [ ] ROM Ops menu appears
- [ ] Ready to begin test execution

---

## Rollback Plan

If issues occur, revert constants to:

```javascript
const DOC_TEMPLATE_NAME = "_ROM_INVOICE_TEMPLATE";
const INVOICE_FOLDER_NAME = "ROM_INVOICES";
const EMAIL_BCC_ADDRESS = "ryan@ryanowenphotography.com";
```

---

**Next Step After Update:** Execute test case TC-001

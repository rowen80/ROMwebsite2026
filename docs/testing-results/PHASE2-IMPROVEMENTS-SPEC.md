# Phase 2 Improvements - Technical Specification

**Date:** 2026-03-26  
**Author:** Leo (ROM Automation Specialist)  
**Status:** Draft - Ready for Implementation

---

## Overview

This document specifies three critical improvements to the ROM invoice generation system:
1. **Rollback Mechanism** - Automatic cleanup if operations fail
2. **Logging/Audit Trail** - Track all script executions
3. **Hardened Drive Paths** - Use file IDs instead of name searches

---

## 1. Rollback Mechanism

### Current Problem

**Scenario:** Script generates PDF and writes to sheets, but then email send fails  
**Result:** Inconsistent state:
- ✅ Invoice PDF created in Drive
- ✅ `InvoiceNumber` assigned to FORM_DATA row
- ✅ Row added to INVOICES sheet  
- ✅ `SETTINGS!B1` incremented
- ❌ Email **never sent** to customer

**Impact:**
- Customer never receives invoice
- Invoice number "burned" (can't reuse)
- Manual intervention required to recover

### Proposed Solution

Wrap critical operations in transaction-like behavior:

```javascript
/**
 * Executes operation with automatic rollback on failure
 * @param {Function} operation - Main operation to execute
 * @param {Object} rollbackData - Data needed for rollback
 * @returns {*} Result of operation
 */
function withRollback_(operation, rollbackData) {
  const rollbackActions = [];
  
  try {
    // Execute main operation
    const result = operation(rollbackActions);
    return result;
  } catch (error) {
    // Rollback in reverse order
    Logger.log(`ERROR: ${error.message}. Starting rollback...`);
    
    for (let i = rollbackActions.length - 1; i >= 0; i--) {
      try {
        rollbackActions[i]();
        Logger.log(`Rollback step ${i + 1} completed`);
      } catch (rollbackError) {
        Logger.log(`WARNING: Rollback step ${i + 1} failed: ${rollbackError.message}`);
      }
    }
    
    throw error; // Re-throw original error after cleanup
  }
}
```

### Implementation Steps

#### Step 1: Add Rollback Helper Function

Insert after existing helper functions (around line 1000):

```javascript
/**
 * Creates a rollback action for deleting a sheet row
 */
function createRowDeleteRollback_(sheet, rowIndex) {
  return function() {
    sheet.deleteRow(rowIndex);
  };
}

/**
 * Creates a rollback action for clearing sheet cells
 */
function createCellClearRollback_(sheet, row, colMap, fields) {
  return function() {
    const values = fields.map(() => "");
    sheet.getRange(row, colMap[fields[0]], 1, fields.length).setValues([values]);
  };
}

/**
 * Creates a rollback action for decrementing invoice number
 */
function createInvoiceNumberRollback_(settingsSheet, originalNumber) {
  return function() {
    settingsSheet.getRange(1, 2).setValue(originalNumber);
  };
}

/**
 * Creates a rollback action for deleting a Drive file
 */
function createFileDeleteRollback_(fileId) {
  return function() {
    DriveApp.getFileById(fileId).setTrashed(true);
  };
}
```

#### Step 2: Modify Invoice Generation Workflow

Update `processGroupInvoice_()` function (around line 800):

```javascript
function processGroupInvoice_(
  sheetData,
  colMap,
  groupKey,
  groupRows,
  mode,
  options
) {
  const rollbackActions = [];
  const context = getContext_();
  
  try {
    // Track original invoice number for rollback
    const originalInvoiceNumber = context.settings.getRange(1, 2).getValue();
    rollbackActions.push(createInvoiceNumberRollback_(context.settings, originalInvoiceNumber));
    
    const invoiceNumber = getNextInvoiceNumber_(context.settings);
    
    // Generate PDF (returns file ID)
    const pdfFileId = createInvoicePDF_(...); // Modified to return file ID
    rollbackActions.push(createFileDeleteRollback_(pdfFileId));
    
    // Write to INVOICES sheet
    const invoicesSheet = getOrCreateInvoicesSheet_(context.ss);
    const invoiceRowIndex = invoicesSheet.getLastRow() + 1;
    // ... write invoice data ...
    rollbackActions.push(createRowDeleteRollback_(invoicesSheet, invoiceRowIndex));
    
    // Write to FORM_DATA
    const formDataFields = ["InvoiceNumber", "InvoicedAt", "InvoicePDFUrl"];
    for (const r of groupRows) {
      // ... write to cells ...
      rollbackActions.push(createCellClearRollback_(
        sheetData.sheet,
        r.rowIndex,
        colMap,
        formDataFields
      ));
    }
    
    // Increment invoice number
    incrementInvoiceNumber_(context.settings);
    
    // CRITICAL: Send email (point of failure)
    sendInvoiceEmail_(...); // If this throws, rollback triggers
    
    // Success - clear rollback actions (no need to rollback)
    rollbackActions.length = 0;
    
    return { success: true, invoiceNumber };
    
  } catch (error) {
    // Execute rollback
    Logger.log(`Invoice generation failed for ${groupKey}: ${error.message}`);
    
    for (let i = rollbackActions.length - 1; i >= 0; i--) {
      try {
        rollbackActions[i]();
      } catch (rollbackError) {
        Logger.log(`Rollback action ${i} failed: ${rollbackError.message}`);
      }
    }
    
    throw error; // Re-throw for user notification
  }
}
```

### Testing the Rollback

**Test Case: Force Email Failure**

```javascript
function testRollback_() {
  // Temporarily modify sendInvoiceEmail_ to throw error
  // Run invoice generation
  // Verify:
  // 1. No PDF in Drive
  // 2. No row in INVOICES sheet
  // 3. No writes to FORM_DATA
  // 4. SETTINGS!B1 unchanged
}
```

---

## 2. Logging/Audit Trail

### Current Problem

- No record of who ran what when
- Difficult to debug issues after execution
- No performance metrics
- No way to track email delivery success/failure

### Proposed Solution

Create `SCRIPT_LOG` sheet to track all executions:

#### Log Sheet Structure

| Column | Type | Description |
|--------|------|-------------|
| Timestamp | DateTime | When script was executed |
| User | String | Session.getActiveUser().getEmail() |
| Workflow | String | "Photos Only - Company", "Invoice Only - LastName", etc. |
| Mode | String | "COMPANY", "LASTNAME", "PREVIEW" |
| RowsProcessed | Number | Total rows processed |
| GroupsProcessed | Number | Number of companies/customers |
| InvoicesCreated | Number | Number of invoices generated |
| EmailsSent | Number | Number of emails sent successfully |
| Errors | String | Error messages if any |
| ExecutionTime | Number | Milliseconds |

#### Implementation

**Step 1: Create Log Sheet Function**

```javascript
/**
 * Gets or creates SCRIPT_LOG sheet with proper headers
 */
function getOrCreateScriptLog_(ss) {
  const LOG_SHEET_NAME = "SCRIPT_LOG";
  let logSheet = ss.getSheetByName(LOG_SHEET_NAME);
  
  if (!logSheet) {
    logSheet = ss.insertSheet(LOG_SHEET_NAME);
    const headers = [
      "Timestamp",
      "User",
      "Workflow",
      "Mode",
      "RowsProcessed",
      "GroupsProcessed",
      "InvoicesCreated",
      "EmailsSent",
      "Errors",
      "ExecutionTimeMs"
    ];
    logSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    logSheet.setFrozenRows(1);
    
    // Format header
    const headerRange = logSheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#4285f4");
    headerRange.setFontColor("#ffffff");
    headerRange.setFontWeight("bold");
  }
  
  return logSheet;
}

/**
 * Writes a log entry
 */
function writeLogEntry_(logData) {
  try {
    const context = getContext_();
    const logSheet = getOrCreateScriptLog_(context.ss);
    
    const row = [
      new Date(),
      Session.getActiveUser().getEmail(),
      logData.workflow || "",
      logData.mode || "",
      logData.rowsProcessed || 0,
      logData.groupsProcessed || 0,
      logData.invoicesCreated || 0,
      logData.emailsSent || 0,
      logData.errors || "",
      logData.executionTime || 0
    ];
    
    logSheet.appendRow(row);
  } catch (error) {
    // Don't let logging failures break the main workflow
    Logger.log(`Failed to write log entry: ${error.message}`);
  }
}
```

**Step 2: Add Logging to Each Workflow**

Wrap each main workflow function:

```javascript
function sendPhotosOnlyByCompany() {
  const startTime = Date.now();
  const logData = {
    workflow: "Photos Only",
    mode: "COMPANY",
    rowsProcessed: 0,
    groupsProcessed: 0,
    emailsSent: 0,
    errors: ""
  };
  
  try {
    // Existing workflow logic...
    const result = runPhotosOnly_(...);
    
    logData.rowsProcessed = result.rowsProcessed;
    logData.groupsProcessed = result.groupsProcessed;
    logData.emailsSent = result.emailsSent;
    
  } catch (error) {
    logData.errors = error.message;
    throw error;
  } finally {
    logData.executionTime = Date.now() - startTime;
    writeLogEntry_(logData);
  }
}
```

**Step 3: Add Per-Operation Logging**

For debugging, add detailed logs:

```javascript
function createInvoicePDF_(...) {
  Logger.log(`Creating invoice ${invoiceNumber} for ${clientName}`);
  const startTime = Date.now();
  
  // ... PDF generation ...
  
  const duration = Date.now() - startTime;
  Logger.log(`Invoice PDF created in ${duration}ms: ${pdfUrl}`);
  
  return pdfUrl;
}
```

### Log Analysis Queries

**Example: Find recent failures**

```javascript
function findRecentFailures() {
  const logSheet = getOrCreateScriptLog_(SpreadsheetApp.getActiveSpreadsheet());
  const data = logSheet.getDataRange().getValues();
  
  const failures = data.filter(row => row[8] !== ""); // Errors column
  
  failures.forEach(row => {
    Logger.log(`${row[0]}: ${row[2]} failed - ${row[8]}`);
  });
}
```

---

## 3. Hardened Drive Paths

### Current Problem

Script searches Drive by filename:
```javascript
const template = DriveApp.getFilesByName(DOC_TEMPLATE_NAME).next();
```

**Risks:**
- If duplicate files exist, wrong one might be selected
- If file renamed, script breaks
- Search is slower than direct ID lookup

### Proposed Solution

Use file/folder IDs instead of names:

```javascript
// Configuration constants (top of script)
const DRIVE_IDS = {
  invoiceTemplate: "1abc...", // _ROM_INVOICE_TEMPLATE
  invoiceFolder: "1def...",   // ROM_INVOICES
  previewFolder: "1ghi...",   // ROM_INVOICES/_PREVIEW
  zelleQR: "1jkl...",         // ZelleQr.jpg
  venmoQR: "1mno..."          // VenmoQr.jpg
};

// Usage
function getInvoiceTemplate_() {
  return DriveApp.getFileById(DRIVE_IDS.invoiceTemplate);
}

function getInvoiceFolder_() {
  return DriveApp.getFolderById(DRIVE_IDS.invoiceFolder);
}
```

### Implementation Steps

**Step 1: Create ID Lookup Script**

```javascript
/**
 * ONE-TIME UTILITY: Finds and displays Drive file IDs
 * Run this once to get IDs, then paste into DRIVE_IDS constant
 */
function findDriveIds() {
  const results = {};
  
  // Find template
  const templates = DriveApp.getFilesByName("_ROM_INVOICE_TEMPLATE");
  if (templates.hasNext()) {
    results.invoiceTemplate = templates.next().getId();
  }
  
  // Find folders
  const folders = DriveApp.getFoldersByName("ROM_INVOICES");
  if (folders.hasNext()) {
    const mainFolder = folders.next();
    results.invoiceFolder = mainFolder.getId();
    
    const previewFolders = mainFolder.getFoldersByName("_PREVIEW");
    if (previewFolders.hasNext()) {
      results.previewFolder = previewFolders.next().getId();
    }
  }
  
  // Find QR codes
  const zelleQR = DriveApp.getFilesByName("ZelleQr.jpg");
  if (zelleQR.hasNext()) {
    results.zelleQR = zelleQR.next().getId();
  }
  
  const venmoQR = DriveApp.getFilesByName("VenmoQr.jpg");
  if (venmoQR.hasNext()) {
    results.venmoQR = venmoQR.next().getId();
  }
  
  Logger.log(JSON.stringify(results, null, 2));
  
  // Display in dialog
  const ui = SpreadsheetApp.getUi();
  ui.alert(
    "Drive File IDs",
    "Copy these IDs into DRIVE_IDS constant:\n\n" + 
    JSON.stringify(results, null, 2),
    ui.ButtonSet.OK
  );
}
```

**Step 2: Replace All Drive Lookups**

Search script for:
- `DriveApp.getFilesByName()`
- `DriveApp.getFoldersByName()`

Replace with:
- `DriveApp.getFileById(DRIVE_IDS.xxx)`
- `DriveApp.getFolderById(DRIVE_IDS.xxx)`

**Example Refactoring:**

Before:
```javascript
function loadQRImages_() {
  const zelleFile = DriveApp.getFilesByName(ZELLE_QR_FILENAME).next();
  const venmoFile = DriveApp.getFilesByName(VENMO_QR_FILENAME).next();
  
  return {
    zelleBlob: zelleFile.getBlob(),
    venmoBlob: venmoFile.getBlob()
  };
}
```

After:
```javascript
function loadQRImages_() {
  const zelleFile = DriveApp.getFileById(DRIVE_IDS.zelleQR);
  const venmoFile = DriveApp.getFileById(DRIVE_IDS.venmoQR);
  
  return {
    zelleBlob: zelleFile.getBlob(),
    venmoBlob: venmoFile.getBlob()
  };
}
```

**Step 3: Add Validation**

```javascript
/**
 * Validates all Drive dependencies exist and are accessible
 * Run this before any invoice operations
 */
function validateDriveDependencies_() {
  const errors = [];
  
  try {
    DriveApp.getFileById(DRIVE_IDS.invoiceTemplate);
  } catch (e) {
    errors.push(`Invoice template not found (ID: ${DRIVE_IDS.invoiceTemplate})`);
  }
  
  try {
    DriveApp.getFolderById(DRIVE_IDS.invoiceFolder);
  } catch (e) {
    errors.push(`Invoice folder not found (ID: ${DRIVE_IDS.invoiceFolder})`);
  }
  
  // ... check other IDs ...
  
  if (errors.length > 0) {
    throw new Error("Drive dependencies missing:\n" + errors.join("\n"));
  }
}
```

---

## Testing Plan for Phase 2 Improvements

### Test 1: Rollback Mechanism

**Scenario:** Force email failure after PDF creation

**Steps:**
1. Modify email function to throw error: `throw new Error("TEST: Simulated email failure");`
2. Run Photos + Invoice workflow
3. Verify rollback:
   - ❌ No PDF in Drive folder
   - ❌ No row in INVOICES sheet
   - ❌ No invoice fields written to FORM_DATA
   - ❌ SETTINGS!B1 unchanged

**Expected Result:** Clean state, no orphaned data

---

### Test 2: Logging

**Scenario:** Run multiple workflows, check log

**Steps:**
1. Run Photos Only (Company mode) - 2 rows
2. Run Photos + Invoice (LastName mode) - 1 row
3. Run Invoice Only with error (missing billing info)
4. Check SCRIPT_LOG sheet

**Expected Log Entries:**
```
| Timestamp | User | Workflow | Mode | Rows | Groups | Invoices | Emails | Errors | Time |
|-----------|------|----------|------|------|--------|----------|--------|--------|------|
| 17:45:23  | ryan | Photos Only | COMPANY | 2 | 1 | 0 | 1 | | 2543 |
| 17:46:10  | ryan | Photos + Invoice | LASTNAME | 1 | 1 | 1 | 1 | | 8721 |
| 17:47:02  | ryan | Invoice Only | COMPANY | 1 | 1 | 0 | 0 | Missing BillingContactName | 134 |
```

---

### Test 3: Hardened Drive Paths

**Scenario:** Verify ID-based lookups work

**Steps:**
1. Run `findDriveIds()` utility
2. Copy IDs into `DRIVE_IDS` constant
3. Run invoice generation
4. Verify PDFs created successfully

**Additional Test:** Rename invoice template in Drive (keep same ID)
**Expected:** Script still works (finds by ID, not name)

---

## Implementation Priority

### Must Have (Critical)
1. ✅ **Rollback Mechanism** - Prevents data corruption
2. ✅ **Logging** - Essential for debugging production issues

### Should Have (High Priority)
3. ✅ **Hardened Drive Paths** - Prevents future issues, improves reliability

---

## Code Review Checklist

Before deploying Phase 2 improvements:

- [ ] Rollback functions tested in isolation
- [ ] Log sheet creation doesn't break on duplicate runs
- [ ] All Drive lookups converted to ID-based
- [ ] Validation functions added
- [ ] Error messages are clear and actionable
- [ ] Performance impact measured (<5% overhead)
- [ ] Backward compatibility maintained (old invoices still work)
- [ ] Documentation updated

---

## Deployment Plan

1. **Create backup** of current script
2. **Deploy to staging** sheet first
3. **Run Phase 2 test suite** (Tests 1-3 above)
4. **If successful:** Deploy to production
5. **If issues:** Rollback to backup, document problems

---

## Estimated Implementation Time

| Task | Time Estimate |
|------|--------------|
| Rollback mechanism | 1.5 hours |
| Logging system | 1 hour |
| Hardened Drive paths | 0.5 hours |
| Testing | 1 hour |
| Documentation | 0.5 hours |
| **Total** | **4.5 hours** |

---

## Next Steps

**Awaiting approval to begin Phase 2 implementation:**

1. ✅ Review this spec with Ryan
2. ✅ Get approval to proceed
3. ✅ Implement improvements
4. ✅ Test in staging
5. ✅ Integrate with Phase 1 test results

---

**Status:** Ready for implementation  
**Blocker:** Awaiting Ryan's review and approval

**Contact:** Leo (Bardo's ROM Automation Agent)

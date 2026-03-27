# Drive File IDs Reference

**Purpose:** Record of all Drive file/folder IDs needed for Phase 2 hardening  
**Date:** 2026-03-26  
**Status:** Partially Complete

---

## Test Environment IDs ✅

### Folders
```javascript
ROM_INVOICES_test: "1HqX-2vXNlgWtGzRP6N_RFZbTmk0T3cM3"
  └─ _PREVIEW: "1cB_efS64bllJoWI5fQwEmeccCS9WSJaV"
```

### QR Codes
```javascript
ZelleQR.jpg: "12B5awVuLIdkcSeXYJuuuAcQQrdab_fnT"
VenmoQR.jpg: "10Sj8tFViIMI9sYyqQ65u117OhsvsVbtX"
```

---

## Production Environment IDs ⏸️

### Template
```javascript
_ROM_INVOICE_TEMPLATE: "WAITING FOR RYAN TO CREATE/SHARE"
```

### Folders
```javascript
ROM_INVOICES: "TBD - Need to locate"
  └─ _PREVIEW: "TBD"
```

---

## Usage in Script

Once all IDs are collected, add to Apps Script:

```javascript
// At top of ROM-APPS-SCRIPT-WITH-REELS.gs

const DRIVE_IDS = {
  // Test environment
  test: {
    invoiceTemplate: "TBD",
    invoiceFolder: "1HqX-2vXNlgWtGzRP6N_RFZbTmk0T3cM3",
    previewFolder: "1cB_efS64bllJoWI5fQwEmeccCS9WSJaV",
    zelleQR: "12B5awVuLIdkcSeXYJuuuAcQQrdab_fnT",
    venmoQR: "10Sj8tFViIMI9sYyqQ65u117OhsvsVbtX"
  },
  
  // Production environment
  production: {
    invoiceTemplate: "TBD",
    invoiceFolder: "TBD",
    previewFolder: "TBD",
    zelleQR: "12B5awVuLIdkcSeXYJuuuAcQQrdab_fnT",  // Same QR codes
    venmoQR: "10Sj8tFViIMI9sYyqQ65u117OhsvsVbtX"
  }
};

// Toggle for testing vs production
const USE_TEST_ENV = true;
const CURRENT_IDS = USE_TEST_ENV ? DRIVE_IDS.test : DRIVE_IDS.production;
```

---

## How to Find Missing IDs

### Option 1: Using gog CLI
```bash
# Find invoice template
gog drive search "name='_ROM_INVOICE_TEMPLATE' and mimeType='application/vnd.google-apps.document'" --json

# Find production invoice folder
gog drive search "name='ROM_INVOICES' and mimeType='application/vnd.google-apps.folder'" --json

# Find subfolder
gog drive search "name='_PREVIEW' and '<PARENT_FOLDER_ID>' in parents" --json
```

### Option 2: From Drive URL
**If Ryan shares a Drive link like:**
`https://drive.google.com/file/d/1abc123xyz/view`

**The ID is:** `1abc123xyz`

### Option 3: Apps Script Utility
```javascript
/**
 * Run this in Apps Script to find all IDs at once
 */
function findAllDriveIds() {
  const results = {};
  
  // Template
  const templates = DriveApp.getFilesByName("_ROM_INVOICE_TEMPLATE");
  if (templates.hasNext()) {
    results.invoiceTemplate = templates.next().getId();
  }
  
  // Folders
  const folders = DriveApp.getFoldersByName("ROM_INVOICES");
  if (folders.hasNext()) {
    const mainFolder = folders.next();
    results.invoiceFolder = mainFolder.getId();
    
    const previewFolders = mainFolder.getFoldersByName("_PREVIEW");
    if (previewFolders.hasNext()) {
      results.previewFolder = previewFolders.next().getId();
    }
  }
  
  // QR Codes
  const zelleQR = DriveApp.getFilesByName("ZelleQr.jpg");
  if (zelleQR.hasNext()) results.zelleQR = zelleQR.next().getId();
  
  const venmoQR = DriveApp.getFilesByName("VenmoQr.jpg");
  if (venmoQR.hasNext()) results.venmoQR = venmoQR.next().getId();
  
  Logger.log(JSON.stringify(results, null, 2));
}
```

---

## Status Checklist

### Test Environment
- [x] Test folder ID
- [x] Preview subfolder ID
- [x] Zelle QR ID
- [x] Venmo QR ID
- [ ] Test template ID (blocked - needs Ryan to create)

### Production Environment
- [ ] Production template ID
- [ ] Production folder ID
- [ ] Production preview subfolder ID
- [x] QR codes (same as test)

---

**Next Step:** Once Ryan provides template, run `findAllDriveIds()` utility to complete this reference.

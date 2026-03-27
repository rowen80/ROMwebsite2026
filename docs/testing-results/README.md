# ROM Invoice Testing - Documentation Index

**Last Updated:** 2026-03-26 18:47 EDT  
**Status:** Ready for deployment decision

---

## 📋 Quick Navigation

### Start Here
- **LEO-STATUS-2026-03-26-1845.md** - Current status summary (read this first!)
- **TESTING-PROGRESS-REPORT.md** - Full analysis + deployment options

### Technical Analysis
- **FILE_IDS.md** - Complete Google Drive/Sheets ID reference
- **TC-001-TO-005-MANUAL-CALCULATIONS.md** - Script calculation logic analysis
- **TEST-DATA-PREP.md** - Test case specifications + data design

### Testing Execution (In Progress)
- **TEST-EXECUTION-LOG-2026-03-26-RESUMED.md** - Live testing log

### Phase 2 Improvements (Future)
- **PHASE2-IMPROVEMENTS-SPEC.md** - Rollback, logging, hardening designs

### Historical Context
- **TESTING-STATUS-REPORT.md** - Original blocker report (2026-03-26 17:45)
- **LEO-COMPLETION-REPORT.md** - Pre-blocker work summary
- **SUMMARY-FOR-RYAN.md** - Earlier summary document

---

## 🎯 Current Situation

**BLOCKER RESOLVED** - Template is now accessible!

**Environment Status:**
- ✅ Template verified (all 10 placeholders present)
- ✅ Test copy created in ROM_INVOICES_test folder
- ✅ Staging sheet accessible
- ✅ Drive test folder operational
- ✅ Script logic analyzed
- ✅ Test suite designed (8 test cases ready)

**Awaiting:** Deployment decision (see LEO-STATUS document)

---

## 📁 File Reference

### Google Drive Assets
```
ROM_INVOICES_test/
├── _TEST_ROM_INVOICE_TEMPLATE (1CT5ZPOuClxwZUWcGbyrKorP_AePVYP4io_cNpVsvqoQ)
├── ZelleQR.jpg (12B5awVuLIdkcSeXYJuuuAcQQrdab_fnT)
├── VenmoQR.jpg (10Sj8tFViIMI9sYyqQ65u117OhsvsVbtX)
└── _PREVIEW/ (1cB_efS64bllJoWI5fQwEmeccCS9WSJaV)
```

### Google Sheets
- **Staging Sheet:** ROMwebsite2026_data (17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ)
  - SETTINGS!B1: 2026-1740 (current invoice number)
  - CO_BILLING_INFO: 4 test companies configured
  - 2026 FORM_DATA: Main data sheet

### Source Template (Ryan's Drive)
- **Name:** ROM_INVOICE_TEMPLATE_test
- **ID:** 12BCu044gKreQOVl_Wc_SeWa4I8HDBnwItmAKzqhokuI
- **Modified:** 2026-03-26 22:28:52 UTC

---

## 🧪 Test Cases Overview

### Phase 1: Calculation Accuracy (TC-001 to TC-005)
| Test | Focus | Status |
|------|-------|--------|
| TC-001 | Simple invoice ($250, no deposit) | Ready |
| TC-002 | Invoice with deposit ($500 - $200 = $300) | Ready |
| TC-003 | Full deposit ($300 - $300 = $0) | Ready |
| TC-004 | Multi-row company group (3 jobs summed) | Ready |
| TC-005 | Blank total edge case ($0.00) | Ready |

### Phase 2: Workflow Logic (TC-020 to TC-027)
| Test | Focus | Status |
|------|-------|--------|
| TC-020 | Photos only (no invoice) | Ready |
| TC-021 | Photos + invoice (company group) | Ready |
| TC-022 | Invoice only (already delivered) | Ready |
| TC-023 to TC-027 | Additional workflow variations | Designed |

### Phase 3: Edge Cases (TC-030+)
- Recipient selection logic
- Email rendering
- Invoice number increment
- Error handling
- (See TEST-DATA-PREP.md for complete list)

---

## 🔍 Key Findings So Far

### Script Calculation Logic
```javascript
// Script reads Column T ("Total"), NOT Column S ("Estimated Total")
const subtotal = sumMoney_(items.map(it => it.row[ctx.idx[COLS.Total]]));
const deposit = sumMoney_(items.map(it => it.row[ctx.idx[COLS.Deposit]]));
const amountDue = round2_(subtotal - deposit);
```

**Impact:**
- Test data must have Column T explicitly set
- Blank values default to $0.00 (not an error)
- Dollar signs/commas are automatically stripped

### File Ownership Note
Per Ryan: *"We may need to make sure ryan.owen has ownership of many of these files before we go live."*

**Action Required:** File ownership audit + transfer before production deployment

---

## ⏭️ Next Steps (Pending Decision)

### Option A: Full Test Deployment (Recommended)
- Deploy test script to staging sheet
- Add test data rows
- Execute TC-001 to TC-063
- **Timeline:** 6-8 hours

### Option B: Analysis & Documentation
- Design Phase 2 improvements
- Create implementation specs
- Document test procedures for Ryan
- **Timeline:** 3-4 hours

### Option C: Improvements + Testing
- Implement rollback, logging, hardening
- Deploy improved script
- Execute full test suite with validation
- **Timeline:** 8-10 hours

**See LEO-STATUS-2026-03-26-1845.md for detailed breakdown**

---

## 📞 Contact

**Leo (ROM Automation Specialist)**  
Subagent of Bardo  
Task: ROM invoice system testing + improvement

**Deliverables Location:**  
`~/lab/projects/rom/website-lab/romwebsite2026/docs/testing-results/`

---

**Status:** ⏸️ Ready to proceed - awaiting deployment decision

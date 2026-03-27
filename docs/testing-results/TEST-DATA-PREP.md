# Test Data Preparation Plan

**Date:** 2026-03-26 18:40 EDT  
**Sheet:** ROMwebsite2026_data (17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ)  
**Strategy:** Add dedicated test rows, isolated from production data

---

## Test Row Design

### Test Row Naming Convention
All test rows will use:
- **ClientLastName:** "TEST_<TestCaseID>"
- **ClientFirstName:** "TC"
- **ClientEmail:** "bardo.faraday+tc<number>@gmail.com"
- **Company:** Existing companies from CO_BILLING_INFO

This makes test data:
1. Easy to identify
2. Easy to clean up (filter by "TEST_" last name)
3. Safe (emails go to Bardo's test addresses)

---

## Phase 1 Test Cases: Calculation Accuracy

### TC-001: Simple Invoice (No Deposit)
**Purpose:** Verify basic subtotal calculation

**Row Data:**
- InvoiceNumber: (blank - will be assigned)
- SubmittedAt: 2026-03-26 18:00:00
- ClientFirstName: TC
- ClientLastName: TEST_001
- ClientEmail: bardo.faraday+tc001@gmail.com
- Company: PenFed Gallo Realty
- Listing Address: 123 Test Street
- City: Ocean City
- **Total (Column T):** $250.00
- **Deposit (Column U):** (blank)
- Delivered: Y
- PhotoLink: https://example.com/test001
- InvoicedAt: (blank - will be set by script)

**Expected Invoice:**
- Subtotal: $250.00
- Deposit: $0.00
- Amount Due: $250.00

---

### TC-002: Invoice with Deposit
**Purpose:** Verify deposit subtraction logic

**Row Data:**
- ClientLastName: TEST_002
- ClientEmail: bardo.faraday+tc002@gmail.com
- Company: Keller Williams
- Listing Address: 456 Test Avenue
- **Total (Column T):** $500.00
- **Deposit (Column U):** $200.00
- Delivered: Y
- PhotoLink: https://example.com/test002

**Expected Invoice:**
- Subtotal: $500.00
- Deposit: $200.00
- Amount Due: $300.00

---

### TC-003: Invoice with Full Deposit (Zero Due)
**Purpose:** Edge case - deposit equals total

**Row Data:**
- ClientLastName: TEST_003
- ClientEmail: bardo.faraday+tc003@gmail.com
- Company: Central Reservations
- **Total (Column T):** $300.00
- **Deposit (Column U):** $300.00
- Delivered: Y
- PhotoLink: https://example.com/test003

**Expected Invoice:**
- Subtotal: $300.00
- Deposit: $300.00
- Amount Due: $0.00

---

### TC-004: Multi-Row Company Group (3 rows)
**Purpose:** Verify subtotal/deposit summing across multiple jobs

**Row 1:**
- ClientLastName: TEST_004A
- ClientEmail: bardo.faraday+tc004a@gmail.com
- Company: PenFed Gallo Realty
- **Total:** $199.00
- **Deposit:** $0.00
- Delivered: (blank)
- PhotoLink: https://example.com/test004a

**Row 2:**
- ClientLastName: TEST_004B
- ClientEmail: bardo.faraday+tc004b@gmail.com
- Company: PenFed Gallo Realty
- **Total:** $150.00
- **Deposit:** $50.00
- Delivered: (blank)
- PhotoLink: https://example.com/test004b

**Row 3:**
- ClientLastName: TEST_004C
- ClientEmail: bardo.faraday+tc004c@gmail.com
- Company: PenFed Gallo Realty
- **Total:** $100.00
- **Deposit:** $25.00
- Delivered: (blank)
- PhotoLink: https://example.com/test004c

**Expected Invoice:**
- Subtotal: $449.00 (sum of all 3 rows)
- Deposit: $75.00 (sum of all 3 deposits)
- Amount Due: $374.00
- Recipient: rehoboth@penfedrealty.com (company billing email)

---

### TC-005: Blank Total (Edge Case)
**Purpose:** Verify $0.00 total handling

**Row Data:**
- ClientLastName: TEST_005
- ClientEmail: bardo.faraday+tc005@gmail.com
- Company: LeeAnn Group
- **Total (Column T):** (blank)
- **Deposit (Column U):** (blank)
- Delivered: Y
- PhotoLink: https://example.com/test005

**Expected Invoice:**
- Subtotal: $0.00
- Deposit: $0.00
- Amount Due: $0.00

**Note:** This tests the `toNumber_()` blank-to-zero conversion

---

## Phase 2 Test Cases: Workflow Logic

### TC-020: Photos Only (No Invoice)
**Purpose:** Verify delivery email without invoice attachment

**Row Data:**
- ClientLastName: TEST_020
- ClientEmail: bardo.faraday+tc020@gmail.com
- Company: (blank - individual client)
- **Total:** (blank - no invoice)
- Delivered: (blank - will be set to Y)
- PhotoLink: https://example.com/test020
- InvoicedAt: (blank)

**Expected Behavior:**
- Email sent with photo link
- No invoice PDF created
- Delivered set to Y
- InvoicedAt remains blank

---

### TC-021: Photos + Invoice (Company, <=3 rows)
**Purpose:** Verify combined delivery + invoice workflow

**Uses:** TC-004 rows (3-row company group)

**Expected Behavior:**
- Single email to company billing address
- Invoice PDF attached
- All 3 rows get InvoiceNumber, InvoicedAt, InvoicePDFUrl
- All 3 rows get Delivered = Y

---

### TC-022: Invoice Only (Already Delivered)
**Purpose:** Verify invoice-only workflow for pre-delivered photos

**Row Data:**
- ClientLastName: TEST_022
- ClientEmail: bardo.faraday+tc022@gmail.com
- Company: Keller Williams
- **Total:** $350.00
- **Deposit:** $100.00
- **Delivered:** Y (already delivered)
- PhotoLink: https://example.com/test022 (already sent)
- InvoicedAt: (blank - needs invoice)

**Expected Behavior:**
- Email with invoice PDF (no photo links)
- InvoiceNumber assigned
- InvoicedAt set
- Delivered remains Y (unchanged)

---

## Data Insertion Strategy

### Option 1: Manual Entry (SAFE)
- Use Google Sheets UI
- Copy-paste test data from this document
- Verify each row before saving

**Time:** 20-30 minutes  
**Risk:** LOW (visual confirmation before saving)

### Option 2: gog sheets append (FASTER)
- Use `gog sheets append` command
- Prepare JSON with row data
- Append to '2026 FORM_DATA' sheet

**Time:** 10 minutes  
**Risk:** MEDIUM (typos could corrupt sheet)

**Recommendation:** Start with Option 1 for first batch (TC-001 to TC-005).

---

## Pre-Test Checklist

Before inserting test data:

- [ ] Verify SETTINGS!B1 is still at production number (2026-1740)
- [ ] Plan to change SETTINGS!B1 to 9999-0001 after test data inserted
- [ ] Confirm ROM_INVOICES_test folder is empty (or create _TEST subfolder)
- [ ] Verify QR codes are accessible
- [ ] Test email to bardo.faraday+test@gmail.com works

---

## Test Data Cleanup Plan

After testing completes:

1. **Filter sheet** by ClientLastName contains "TEST_"
2. **Delete all test rows** (or move to archive sheet)
3. **Restore SETTINGS!B1** to original value (2026-1740)
4. **Delete test invoices** from ROM_INVOICES_test folder
5. **Verify no test data** in INVOICES sheet

---

## Next Steps

1. **Review this plan** with human (if needed)
2. **Manually create TC-001** in Google Sheets UI (single row, low risk)
3. **Deploy test script** (with safety checks)
4. **Run preview mode** on TC-001
5. **Validate output** before proceeding

**Status:** Ready to begin data insertion

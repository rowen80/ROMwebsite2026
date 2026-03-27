# ROM Invoice Testing - Execution Guide

## Test Environment Setup ✅ COMPLETE

**Status:** Ready for manual test execution
**Date:** 2026-03-26 19:30 EDT
**Tester:** Leo (ROM automation agent)

### Environment Configuration
- ✅ Staging sheet: `17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ`
- ✅ SETTINGS sheet: NextInvoiceNumber = `9999-0001`
- ✅ SETTINGS sheet: InvoiceDriveFolderName = `ROM_INVOICES_test`
- ✅ Code.js constants: DOC_TEMPLATE_NAME = `_TEST_ROM_INVOICE_TEMPLATE`
- ✅ Code.js constants: INVOICE_FOLDER_NAME = `ROM_INVOICES_test`
- ✅ Code.js constants: EMAIL_BCC_ADDRESS = `bardo.faraday+rom@gmail.com`
- ✅ Test Drive folder ID: `1HqX-2vXNlgWtGzRP6N_RFZbTmk0T3cM3`
- ✅ Template doc ID: `1CT5ZPOuClxwZUWcGbyrKorP_AePVYP4io_cNpVsvqoQ`
- ✅ Script deployed: Latest push successful

### Test Data Inserted (Rows 111-117)

| Row | Test ID | Customer | Company | Email | Total | Deposit | PhotoLink | VideoLink |
|-----|---------|----------|---------|-------|-------|---------|-----------|-----------|
| 111 | TC-001 | Bardo Faraday | TC001 Properties LLC | bardo.faraday+tc001@gmail.com | $295 | $0 | ✅ | ❌ |
| 112 | TC-002 | Alice Smith | TC002 Realty | bardo.faraday+tc002@gmail.com | $595 | $200 | ✅ | ✅ |
| 113-115 | TC-003 | Bob Jones (3 properties) | TC003 Investments | bardo.faraday+tc003@gmail.com | $885 | $0 | ✅ | ❌ |
| 116 | TC-004 | Carol Davis | TC004 LLC | bardo.faraday+tc004@gmail.com | $395 | $0 | ✅ | ❌ |
| 117 | TC-005 | David Wilson | TC005 Development | bardo.faraday+tc005@gmail.com | $5,450 | $1,500 | ✅ | ✅ |

---

## Manual Test Execution Steps

**⚠️ IMPORTANT:** The Apps Script functions can only be triggered manually through the Google Sheets UI or via deployed API endpoints. Command-line execution requires deployment setup which hasn't been configured yet.

### Pre-Test Verification Checklist

Before executing each test:
1. ✅ Open staging sheet in browser: https://docs.google.com/spreadsheets/d/17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ/edit
2. ✅ Verify "ROM Ops" menu appears in toolbar (confirms script is loaded)
3. ✅ Check SETTINGS sheet shows 9999-0001
4. ✅ Verify test email (bardo.faraday+rom@gmail.com) is accessible for confirmation

### Test Execution Process

For each test case, follow this workflow:

#### **Workflow: Photos + Invoice (TC-001, TC-002, TC-004, TC-005)**

**Steps:**
1. Navigate to "2026 FORM_DATA" sheet
2. Click "ROM Ops" menu → "Photos + Invoice" → "By Company"
3. When prompted, enter company name (e.g., "TC001 Properties LLC")
4. Script will:
   - Generate invoice PDF in ROM_INVOICES_test folder
   - Send email with photo links + invoice attachment
   - Update sheet: Set Delivered=Y, fill InvoiceNumber, InvoicedAt, InvoiceStatus
   - Increment NextInvoiceNumber in SETTINGS

**What to verify:**
- [ ] Invoice PDF created in Drive (check ROM_INVOICES_test folder)
- [ ] Email received at test address (bardo.faraday+tcXXX@gmail.com)
- [ ] Email contains photo link(s) in body
- [ ] Email has invoice PDF attached
- [ ] Invoice shows correct:
  - Invoice number (9999-000X)
  - Customer name and company
  - Line items (property address, service, price)
  - Total calculation
  - Deposit amount (if applicable)
  - Balance due = Total - Deposit
  - Payment instructions (Zelle/Venmo QR codes)
- [ ] Sheet updated:
  - Column A (InvoiceNumber): filled
  - Column V (Delivered): "Y"
  - Column AB (InvoicedAt): timestamp
  - Column AC (InvoiceStatus): "SENT"
  - Column AD (InvoicePDFUrl): Drive link
- [ ] SETTINGS NextInvoiceNumber incremented

**Document in results:**
- Invoice number generated
- PDF Drive URL
- Email screenshot (if needed)
- Any errors or warnings
- Calculation verification

---

#### **Workflow: Photos + Invoice - Multiple Properties (TC-003)**

**Steps:**
1. Navigate to "2026 FORM_DATA" sheet
2. Click "ROM Ops" menu → "Photos + Invoice" → "By Company"
3. When prompted, enter: "TC003 Investments"
4. Script should detect 3 rows with same company and combine into ONE invoice

**What to verify:**
- [ ] Single invoice PDF created (not 3 separate invoices)
- [ ] Single email sent (not 3 emails)
- [ ] Invoice contains 3 line items:
  - 789 Bay Dr, Ocean City, MD 21842 - Photography - $295
  - 101 Coastal Way, Ocean City, MD 21842 - Photography - $295
  - 202 Harbor Ln, Ocean City, MD 21842 - Photography - $295
- [ ] Total = $885 (3 × $295)
- [ ] Balance due = $885 (no deposit)
- [ ] All 3 rows (113-115) updated with same invoice number
- [ ] All 3 rows marked Delivered=Y

**Special checks:**
- Does the script properly group rows by Company?
- Are all 3 addresses visible in the invoice?
- Is the combined total calculated correctly?

---

## Test Execution Log Template

Copy this for each test run:

```
### TC-XXX Execution - [Date/Time]

**Test:** [Description]
**Company:** [Company name]
**Expected Invoice #:** 9999-XXXX

**Execution:**
- Menu clicked: [ ]
- Company entered: [ ]
- Script ran: [ ] Success / [ ] Error
- Error message (if any): _________________________

**Verification:**
- [ ] PDF generated: [Drive URL]
- [ ] Email sent: [Screenshot/confirmation]
- [ ] Sheet updated: InvoiceNumber = _______, Delivered = Y, Status = SENT
- [ ] Calculations correct: Total = $___, Deposit = $___, Balance = $___
- [ ] NextInvoiceNumber incremented: Now = _______

**Issues Found:**
- 

**Screenshots:**
- 

**Notes:**
- 
```

---

## Expected Test Results

### TC-001: Single Job, Simple Calculation
- **Invoice #:** 9999-0001
- **Total:** $295.00
- **Deposit:** $0.00
- **Balance Due:** $295.00
- **Line Items:** 1
- **Links:** Photo only

### TC-002: Single Job with Deposit
- **Invoice #:** 9999-0002
- **Total:** $595.00
- **Deposit:** $200.00
- **Balance Due:** $395.00
- **Line Items:** 1
- **Links:** Photo + Video

### TC-003: Multiple Jobs (Combined Invoice)
- **Invoice #:** 9999-0003
- **Total:** $885.00
- **Deposit:** $0.00
- **Balance Due:** $885.00
- **Line Items:** 3 (one invoice, not three separate)
- **Links:** Photo only

### TC-004: Zero Deposit
- **Invoice #:** 9999-0004
- **Total:** $395.00
- **Deposit:** $0.00
- **Balance Due:** $395.00
- **Line Items:** 1
- **Links:** Photo only

### TC-005: Large Invoice
- **Invoice #:** 9999-0005
- **Total:** $5,450.00
- **Deposit:** $1,500.00
- **Balance Due:** $3,950.00
- **Line Items:** 1
- **Links:** Photo + Video

---

## Post-Test Cleanup

After all tests complete:

1. **Export Results:**
   ```bash
   gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ '2026 FORM_DATA!A111:AF117' > test-results-raw.txt
   ```

2. **Check INVOICES sheet:**
   ```bash
   gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ 'INVOICES!A:M'
   ```
   Verify all 5 test invoices logged

3. **Check Drive folder:**
   - List files in ROM_INVOICES_test
   - Verify 5 PDFs created (or 5 tests executed)

4. **Check email inbox:**
   - bardo.faraday+rom@gmail.com (BCC copies)
   - Each TC email address for primary delivery

5. **Verify SETTINGS:**
   ```bash
   gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ 'SETTINGS!A1:B5'
   ```
   Should show: NextInvoiceNumber = 9999-0006 (after 5 tests)

---

## Automated Verification Scripts

### Check Test Results
```bash
# Get all test rows
gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ '2026 FORM_DATA!A111:AD117' --plain

# Check for invoice numbers
gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ '2026 FORM_DATA!A111:A117' --plain

# Check Delivered status
gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ '2026 FORM_DATA!V111:V117' --plain

# Check invoice status
gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ '2026 FORM_DATA!AC111:AC117' --plain
```

### List Generated PDFs
```bash
# Search for test invoices in Drive
gog drive search "9999-" --json | jq -r '.files[] | select(.name | contains("9999")) | "\(.name) - \(.id)"'

# Or list files in test folder
gog drive ls --folder 1HqX-2vXNlgWtGzRP6N_RFZbTmk0T3cM3 --json | jq -r '.files[] | "\(.name) - \(.createdTime)"'
```

---

## Next Steps After Manual Testing

Once manual tests are executed and results documented:

1. **Analyze Results** - Document what worked vs. what failed
2. **Create Baseline Report** - Summarize current system behavior
3. **Identify Issues** - List bugs, edge cases, calculation errors
4. **Prioritize Fixes** - Rank issues by severity for Phase 2
5. **Update Test Cases** - Add new test cases for any bugs found

**Deliverable:** `baseline-test-results-2026-03-26.md`

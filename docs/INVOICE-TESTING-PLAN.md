# ROM Invoice Testing Plan

**Date:** 2026-03-26  
**Tester:** Leo (ROM Automation Specialist)  
**Target Environment:** ROMwebsite2026_data staging sheet (ID: 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ)  
**Risk Level:** 🔴 **HIGH** — Invoice generation affects revenue and customer relationships

---

## 🎯 Testing Objectives

1. **Validate Invoice Accuracy** — Ensure calculations, line items, and totals are correct
2. **Verify Workflow Logic** — Confirm each workflow type (Photos Only, Photos + Invoice, etc.) behaves as documented
3. **Test Edge Cases** — Validate handling of unusual inputs (missing data, special characters, large batches)
4. **Validate Email Delivery** — Confirm emails reach recipients with correct content and attachments
5. **Ensure Data Integrity** — Verify sheet writes are accurate and don't corrupt existing data
6. **Test Error Handling** — Confirm script fails gracefully with useful error messages

---

## 🛡️ Safety Guardrails

### Before ANY Testing

✅ **DO:**
- Work **only** on staging sheet (17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ)
- Use test email addresses (e.g., ryan+test@ryanowenphotography.com, bardo.faraday+rom@gmail.com)
- Create `_TEST_ROM_INVOICE_TEMPLATE` (copy of live template)
- Create `_TEST_ROM_INVOICES` folder in Drive
- Set `SETTINGS!B1` to `9999-0001` (test invoice numbers, easy to distinguish)
- Document every test execution in `TESTING_LOG` sheet

❌ **DO NOT:**
- Run scripts on live ROM_CUSTOMER_MASTER sheet
- Send emails to real customer addresses
- Modify live invoice template or folder
- Use production invoice number sequence
- Make any changes to `CO_BILLING_INFO` data (use read-only copy if needed)

---

## 📋 Pre-Test Setup Checklist

### 1. Staging Sheet Preparation

- [ ] Copy staging sheet to `ROMwebsite2026_data_TEST` (working copy)
- [ ] Clear all existing data from `2026 FORM_DATA` sheet
- [ ] Clear all rows from `INVOICES` sheet (keep headers)
- [ ] Set `SETTINGS!B1` = `9999-0001`
- [ ] Create `TESTING_LOG` sheet with columns: Date, Tester, Test_Case, Result, Notes

### 2. Drive Setup

- [ ] Create `_TEST_ROM_INVOICE_TEMPLATE` (copy of `_ROM_INVOICE_TEMPLATE`)
  - Verify all `{{PLACEHOLDERS}}` are present
  - Update script constant: `DOC_TEMPLATE_NAME = "_TEST_ROM_INVOICE_TEMPLATE"`
  
- [ ] Create `_TEST_ROM_INVOICES` folder
  - Create subfolder: `_PREVIEW`
  - Update script constant: `INVOICE_FOLDER_NAME = "_TEST_ROM_INVOICES"`
  
- [ ] Verify `ZelleQr.jpg` and `VenmoQr.jpg` are accessible

### 3. Email Configuration

- [ ] Update script constants for testing:
  ```javascript
  const EMAIL_FROM_ADDRESS = "ryan+test@ryanowenphotography.com";
  const EMAIL_BCC_ADDRESS = "bardo.faraday+rom@gmail.com";
  ```
  
- [ ] Verify Gmail send-as alias for test address (or use default ryan@ryanowenphotography.com)

### 4. Test Data Preparation

- [ ] Create `TEST_COMPANIES` in `CO_BILLING_INFO`:
  ```
  Company: "Test Company A"
  BillingEmail: "testcompanya+billing@example.com"
  BillingContactName: "Alice Testman"
  BillingPhone: "555-0001"
  
  Company: "Test Company B"
  BillingEmail: "testcompanyb+billing@example.com"
  BillingContactName: "Bob Tester"
  BillingPhone: "555-0002"
  ```

---

## 🧪 Test Cases

### Test Suite 1: Core Calculation Accuracy

#### TC-001: Simple Single Job Invoice
**Objective:** Verify basic calculation (subtotal - deposit = amountDue)

**Test Data:**
| Field | Value |
|-------|-------|
| ClientFirstName | John |
| ClientLastName | Smith |
| ClientEmail | johnsmith+test@example.com |
| Company | Test Company A |
| ListingAddress | 123 Test Lane |
| Service | Basic Photos |
| EstLineItems | Basic Photos: $199.00 |
| EstTotal | 199 |
| Total | 199 |
| Deposit | 0 |
| PhotoLink | https://drive.google.com/test1 |

**Steps:**
1. Insert test row into `2026 FORM_DATA`
2. Run: `ROM Ops → Delivery → Send Photos + Invoice (≤3 rows) (by Company)` → Enter "Test Company A"
3. Retrieve generated PDF from `_TEST_ROM_INVOICES`

**Expected Results:**
- ✅ Invoice Number: `9999-0001`
- ✅ Subtotal: `$199.00`
- ✅ Deposit: `$0.00`
- ✅ Amount Due: `$199.00`
- ✅ Date Due: Today + 14 days
- ✅ Line Items: "Basic Photos: $199.00"
- ✅ Sheet writes:
  - `Delivered = "Y"`
  - `InvoiceNumber = "9999-0001"`
  - `InvoicedAt = today's date`
  - `InvoicePDFUrl = Drive URL`
- ✅ INVOICES sheet: New row with status "SENT"
- ✅ `SETTINGS!B1 = "9999-0002"`

**Pass Criteria:** All calculations match, no formula errors, email received with PDF attachment

---

#### TC-002: Invoice with Deposit
**Objective:** Verify deposit subtraction

**Test Data:**
| Field | Value |
|-------|-------|
| ClientFirstName | Jane |
| ClientLastName | Doe |
| ClientEmail | janedoe+test@example.com |
| Company | Test Company A |
| ListingAddress | 456 Elm Street |
| Service | Basic Photos, Drone |
| EstLineItems | Basic Photos: $199.00; Drone: $49.00 |
| EstTotal | 248 |
| Total | 248 |
| Deposit | 50 |
| PhotoLink | https://drive.google.com/test2 |

**Expected Results:**
- ✅ Invoice Number: `9999-0002`
- ✅ Subtotal: `$248.00`
- ✅ Deposit: `$50.00`
- ✅ Amount Due: `$198.00`

**Pass Criteria:** AmountDue = 248 - 50 = 198.00 exactly

---

#### TC-003: Multi-Job Company Invoice (2 jobs)
**Objective:** Verify summation across multiple jobs

**Test Data Row 1:**
| Field | Value |
|-------|-------|
| Company | Test Company B |
| ListingAddress | 789 Oak Avenue |
| Total | 299 |
| Deposit | 0 |
| PhotoLink | https://drive.google.com/test3a |

**Test Data Row 2:**
| Field | Value |
|-------|-------|
| Company | Test Company B |
| ListingAddress | 321 Pine Street |
| Total | 199 |
| Deposit | 25 |
| PhotoLink | https://drive.google.com/test3b |

**Expected Results:**
- ✅ Invoice Number: `9999-0003`
- ✅ Subtotal: `$498.00` (299 + 199)
- ✅ Deposit: `$25.00` (0 + 25)
- ✅ Amount Due: `$473.00`
- ✅ Line Items: Both addresses listed
- ✅ Email Subject: `Photos/ Invoice for 789 Oak Avenue, 321 Pine Street`

**Pass Criteria:** Summation across jobs is correct, both addresses appear in subject and PDF

---

#### TC-004: Floating-Point Precision Test
**Objective:** Verify rounding handles JavaScript floating-point issues

**Test Data:**
| Field | Value |
|-------|-------|
| Total | 199.99 |
| Deposit | 0.01 |

**Expected Results:**
- ✅ Subtotal: `$199.99`
- ✅ Deposit: `$0.01`
- ✅ Amount Due: `$199.98` (NOT $199.97999999999996)

**Pass Criteria:** Amount displayed as exactly `$199.98` in PDF and email

---

#### TC-005: Large Invoice (8 jobs)
**Objective:** Verify calculation accuracy with many line items

**Test Data:** 8 rows, same company, varying totals:
- Total sum: $2,156.00
- Deposit sum: $200.00
- Expected Amount Due: $1,956.00

**Pass Criteria:** All jobs appear in line items, total calculated correctly, email size reasonable

---

### Test Suite 2: Line Items Parsing

#### TC-010: Standard Format
**Input:** `"Basic Photos: $199.00; Drone: $49.00; Twilights: $99.00"`

**Expected Output in PDF:**
```
123 Test Lane (4 Bedrooms) — Total: $347.00
  Basic Photos: $199.00
  Drone: $49.00
  Twilights: $99.00
```

**Pass Criteria:** Each line item on separate line, indented, word "estimated" removed if present

---

#### TC-011: Missing Semicolons
**Input:** `"Basic Photos: $199.00 Drone: $49.00"`

**Expected Behavior:** Treated as single line item (no parsing)

**Expected Output:**
```
  Basic Photos: $199.00 Drone: $49.00
```

**Pass Criteria:** Script doesn't crash, renders as-is

---

#### TC-012: Extra Semicolons
**Input:** `"Basic Photos: $199.00;;Drone: $49.00;"`

**Expected Behavior:** Empty strings filtered out

**Expected Output:**
```
  Basic Photos: $199.00
  Drone: $49.00
```

**Pass Criteria:** No blank lines in PDF

---

#### TC-013: Special Characters in Line Items
**Input:** `"Photos: $199.00; Video (4K HDR): $149.00; 3D Matterport™: $299.00"`

**Expected Behavior:** Special characters preserved

**Pass Criteria:** Line items render correctly in PDF, no encoding issues

---

#### TC-014: Very Long Line Item
**Input:** `"Basic Photos with advanced editing including HDR bracketing, perspective correction, sky replacement, and virtual staging: $499.00"`

**Expected Behavior:** Text wraps naturally in PDF

**Pass Criteria:** No text overflow, PDF remains readable

---

### Test Suite 3: Workflow Logic

#### TC-020: Photos Only (No Invoice)
**Test Data:**
| Field | Value |
|-------|-------|
| Delivered | (blank) |
| PhotoLink | https://drive.google.com/test |
| InvoiceNumber | (blank) |
| Company | Test Company A |

**Steps:**
1. Run: `ROM Ops → Delivery → Send Photos Only (by Company)`
2. Check sheet and email

**Expected Results:**
- ✅ Email sent with photo link, **no invoice attachment**, no QR codes
- ✅ Email Subject: `Photos for {ListingAddress}`
- ✅ `Delivered = "Y"` written
- ✅ `InvoiceNumber` remains blank
- ✅ `InvoicePDFUrl` remains blank
- ✅ NO row created in INVOICES sheet
- ✅ `SETTINGS!B1` unchanged

**Pass Criteria:** No invoice-related data written, email contains only delivery links

---

#### TC-021: Photos + Invoice (1 job)
**Test Data:** (See TC-001 data)

**Expected Results:**
- ✅ Email contains photo links **AND** invoice attachment **AND** QR codes
- ✅ Email Subject: `Photos/ Invoice for {ListingAddress}`
- ✅ `Delivered = "Y"` written
- ✅ Invoice fields populated
- ✅ INVOICES row created with status "SENT"
- ✅ `SETTINGS!B1` incremented

---

#### TC-022: Photos + Invoice — 3-Row Limit (Company Mode)
**Test Data:** Insert 4 rows, same company, all eligible

**Expected Behavior:** Script refuses to run with error message listing the company

**Pass Criteria:** No emails sent, no sheet writes, error message displayed: "Refusing to run Photos + Invoice because these groups exceed 3 rows"

---

#### TC-023: Invoice Only (Delivered = Y)
**Test Data:**
| Field | Value |
|-------|-------|
| Delivered | Y |
| InvoiceNumber | (blank) |
| PhotoLink | https://drive.google.com/test |

**Expected Results:**
- ✅ Email contains invoice attachment **AND** QR codes, **NO photo links**
- ✅ Email Subject: `Photography Invoice {InvoiceNumber}`
- ✅ `Delivered` remains "Y" (not overwritten)
- ✅ Invoice fields populated

**Pass Criteria:** Email does not contain photo links, invoice created correctly

---

#### TC-024: Invoice Only — Manual Override (Delivered = blank, ManualInvoice = Y)
**Test Data:**
| Field | Value |
|-------|-------|
| Delivered | (blank) |
| ManualInvoice | Y |
| InvoiceNumber | (blank) |

**Expected Behavior:** Script processes row despite Delivered being blank

**Pass Criteria:** Invoice created, `ManualInvoice` cleared after processing

---

#### TC-025: Locked Photos + Invoice
**Test Data:**
| Field | Value |
|-------|-------|
| Delivered | (blank) |
| LockedLink | https://drive.google.com/locked-test |
| PhotoLink | (blank) |
| InvoiceNumber | (blank) |

**Expected Results:**
- ✅ Email contains **LockedLink** (not PhotoLink) + invoice + QR codes
- ✅ Email Subject: `Photo Link/Invoice for {ListingAddress}`
- ✅ Email body mentions "review" and "upon payment"
- ✅ `Delivered = "Y"` written
- ✅ Invoice fields populated

**Pass Criteria:** Email contains locked link only, invoice created

---

#### TC-026: Thank You Download Link
**Prerequisites:** 
1. Run TC-021 (creates invoice with status SENT)
2. Manually update INVOICES sheet: Set `InvoiceStatus = "PAID"` for invoice 9999-0001

**Test Data:** Same row from TC-021

**Expected Results:**
- ✅ Email sent with photo links, **NO invoice attachment**, **NO QR codes**
- ✅ Email Subject: `Download Link for {ListingAddress}`
- ✅ Email body: "Thank you for your payment!"
- ✅ NO sheet writes (read-only operation)

**Pass Criteria:** Email sent only after status = PAID, no data modified

---

#### TC-027: Thank You — 14-Day Window
**Test Data:** Invoice with `InvoicedAt = 20 days ago`, status = PAID

**Expected Behavior:** Row excluded from Thank You workflow (too old)

**Pass Criteria:** No email sent for this invoice

---

### Test Suite 4: Grouping & Recipient Logic

#### TC-030: Company Mode — Billing Email Lookup
**Test Data:**
- Company: Test Company A (has BillingEmail in CO_BILLING_INFO)
- ClientEmail: individual@example.com

**Expected Recipient:** testcompanya+billing@example.com (from CO_BILLING_INFO, NOT ClientEmail)

**Pass Criteria:** Email sent to company billing address, not individual client

---

#### TC-031: Company Mode — Row-Level BillingEmail Override
**Test Data:**
- Company: Test Company A
- BillingEmail (in row): override+billing@example.com

**Expected Recipient:** override+billing@example.com (row-level override takes precedence)

**Pass Criteria:** Email sent to row's BillingEmail, ignoring CO_BILLING_INFO

---

#### TC-032: Company Mode — Missing Billing Contact Name
**Test Data:**
- Company: Test Company C (exists in CO_BILLING_INFO but BillingContactName is blank)

**Expected Behavior:** Script throws error: "Missing BillingContactName for company: Test Company C"

**Pass Criteria:** Script stops with clear error message, no partial processing

---

#### TC-033: LastName Mode — Group by Customer ID
**Test Data (3 rows):**
- Row 1: ClientLastName = "Johnson", Customer ID = "C001"
- Row 2: ClientLastName = "Johnson", Customer ID = "C001"
- Row 3: ClientLastName = "Johnson", Customer ID = "C002"

**Expected Grouping:**
- Invoice 1: Rows 1 + 2 (Customer ID C001)
- Invoice 2: Row 3 (Customer ID C002)

**Pass Criteria:** Two separate invoices created, grouped by Customer ID, not just last name

---

#### TC-034: LastName Mode — Fallback to ClientLastName (Customer ID blank)
**Test Data (2 rows):**
- Row 1: ClientLastName = "Williams", Customer ID = (blank)
- Row 2: ClientLastName = "Williams", Customer ID = (blank)

**Expected Grouping:** Single invoice with both rows (grouped by last name)

**Pass Criteria:** One invoice created for both rows

---

#### TC-035: LastName Mode — Email Recipient
**Test Data:**
- ClientEmail: individual@example.com
- Company: Test Company A (has BillingEmail in CO_BILLING_INFO)

**Expected Recipient:** individual@example.com (LastName mode NEVER uses CO_BILLING_INFO)

**Pass Criteria:** Email sent to ClientEmail, ignoring company billing info

---

### Test Suite 5: Edge Cases & Error Handling

#### TC-040: Empty Total Field
**Test Data:**
| Field | Value |
|-------|-------|
| Total | (blank) |
| Deposit | 0 |

**Expected Behavior:** Treated as $0.00

**Pass Criteria:** Invoice shows `$0.00` subtotal (script doesn't crash)

---

#### TC-041: Non-Numeric Total
**Test Data:**
| Field | Value |
|-------|-------|
| Total | "TBD" |

**Expected Behavior:** Parsed as 0 (via `toNumber_()` function)

**Pass Criteria:** Invoice shows `$0.00` (no crash, warning would be nice but not critical)

---

#### TC-042: Missing PhotoLink (Photos Only workflow)
**Test Data:**
| Field | Value |
|-------|-------|
| PhotoLink | (blank) |

**Expected Behavior:** Row excluded from workflow (not eligible)

**Pass Criteria:** Script runs but skips this row, no error

---

#### TC-043: Invalid PhotoLink Format
**Test Data:**
| Field | Value |
|-------|-------|
| PhotoLink | "drive.google.com/broken-link" (missing https://) |

**Expected Behavior:** Script sends email with invalid link (current behavior, no validation)

**Recommendation:** Add URL format validation (future improvement)

---

#### TC-044: Special Characters in Client Name
**Test Data:**
| Field | Value |
|-------|-------|
| ClientFirstName | José |
| ClientLastName | O'Brien-MacDonald |

**Expected Behavior:** Names render correctly in PDF and email (UTF-8 encoding)

**Pass Criteria:** No encoding errors, names displayed accurately

---

#### TC-045: Very Long Listing Address
**Test Data:**
| Field | Value |
|-------|-------|
| ListingAddress | "123 Extraordinarily Long Street Name with Many Words and Numbers Unit 456, Building C, Complex Name" |

**Expected Behavior:** Address wraps naturally in PDF, truncates gracefully in email subject if needed

**Pass Criteria:** PDF readable, email subject doesn't break

---

#### TC-046: Bedroom Field Edge Cases
**Test Data (3 rows):**
- Row 1: Bedrooms = "Lot (Please provide a site plan for accurate pricing)"
- Row 2: Bedrooms = "4 Bedrooms"
- Row 3: Bedrooms = (blank)

**Expected Cleanup:**
- Row 1: Displayed as "Lot" in PDF
- Row 2: Displayed as "4 Bedrooms"
- Row 3: Displayed as address only (no bedroom note)

**Pass Criteria:** Bedroom field cleaned correctly per `insertLineItemsBlocks_()` logic

---

#### TC-047: Message Field with Special Characters
**Test Data:**
| Field | Value |
|-------|-------|
| Message | "Please note: photos include \"virtual staging\" (sample furniture).\n\nCall with questions!" |

**Expected Behavior:** Message inserted before "Thanks! Ryan" with proper escaping

**Pass Criteria:** Message renders correctly in email (HTML-escaped), line breaks preserved

---

#### TC-048: Multiple Jobs with Different Messages
**Test Data (2 rows, same company):**
- Row 1: Message = "Job 1 note"
- Row 2: Message = "Job 2 note"

**Expected Behavior:** Both messages concatenated with `\n\n` separator in single email

**Pass Criteria:** Email contains both messages, separated appropriately

---

### Test Suite 6: Overdue Reminders

#### TC-050: Second Attempt (Due Date Passed)
**Prerequisites:**
1. Create invoice (use TC-021)
2. In INVOICES sheet, set `DateDue = 5 days ago`
3. Verify `InvoiceStatus = "SENT"`, `SecondAttempt = blank`

**Steps:**
1. Run: `ROM Ops → Invoicing → Send Second Attempt (Past Due) — by ClientLastName`
2. Enter client last name

**Expected Results:**
- ✅ Email sent with subject: "Past Due Invoice Reminder"
- ✅ Email body: "Our records show that you have an outstanding invoice for the amount(s) due of $XXX.XX"
- ✅ Invoice PDF attached
- ✅ QR codes embedded
- ✅ `SecondAttempt` date written to INVOICES sheet

**Pass Criteria:** Email sent, date stamped, script refuses to send again if re-run

---

#### TC-051: Second Attempt — Already Sent
**Prerequisites:** Run TC-050 (SecondAttempt date now populated)

**Expected Behavior:** Row excluded (SecondAttempt already exists)

**Pass Criteria:** No email sent, no error (graceful skip)

---

#### TC-052: Third Attempt (14 Days Past Due)
**Prerequisites:**
1. Run TC-050 (SecondAttempt populated)
2. Set `DateDue = 20 days ago` (>14 days)

**Expected Results:**
- ✅ Email sent with subject: "Third Notice: Past Due Invoice Reminder"
- ✅ `ThirdAttempt` date written

**Pass Criteria:** Third email sent only after second attempt already sent

---

#### TC-053: Third Attempt — Missing Second Attempt
**Test Data:**
- DateDue = 20 days ago
- SecondAttempt = blank
- ThirdAttempt = blank

**Expected Behavior:** Row excluded (must have second attempt before third)

**Pass Criteria:** No email sent (enforces sequential reminders)

---

#### TC-054: Overdue Reminder — PAID Invoice
**Test Data:**
- DateDue = 5 days ago
- InvoiceStatus = "PAID"

**Expected Behavior:** Row excluded (only send reminders for SENT status)

**Pass Criteria:** No reminder email sent to paid invoices

---

### Test Suite 7: Sheet Integrity

#### TC-060: Array Formula Protection
**Test Data:** Check FORM_DATA sheet for any array formulas in row 2

**Steps:**
1. Run Photos + Invoice workflow
2. Verify array formulas not overwritten

**Pass Criteria:** Array formulas remain intact after script execution

---

#### TC-061: INVOICES Sheet Auto-Creation
**Prerequisites:** Delete INVOICES sheet entirely

**Steps:**
1. Run any invoice workflow
2. Check for INVOICES sheet

**Expected Results:**
- ✅ INVOICES sheet created automatically
- ✅ Headers written: InvoiceNumber, InvoicedAt, InvoiceStatus, etc.
- ✅ First row frozen

**Pass Criteria:** Sheet created with correct structure, script doesn't crash

---

#### TC-062: INVOICES Sheet Header Expansion
**Prerequisites:** INVOICES sheet exists but missing new column (e.g., delete "ThirdAttempt")

**Steps:**
1. Run any invoice workflow
2. Check headers

**Expected Results:**
- ✅ Missing header appended to right (existing data preserved)
- ✅ No data loss

**Pass Criteria:** Script adds missing headers without clearing data

---

#### TC-063: NextInvoiceNumber Increment
**Test Data:** `SETTINGS!B1 = "9999-0099"`

**Steps:**
1. Run Photos + Invoice workflow (creates invoice 9999-0099)
2. Check SETTINGS!B1

**Expected Value:** `9999-0100` (rolls over to three digits correctly)

**Pass Criteria:** Increments to 0100, not "99910" or error

---

#### TC-064: Concurrent Execution Risk
**Scenario:** Two users run script simultaneously (unlikely but possible)

**Expected Behavior:** Apps Script single-threaded per sheet (lock acquired automatically)

**Test Approach:** Manual testing — two people click menu items at same moment

**Pass Criteria:** Second execution waits or fails gracefully (no duplicate invoice numbers)

---

### Test Suite 8: Email Rendering

#### TC-070: HTML vs Plain Text Rendering
**Test Data:** Standard invoice email

**Steps:**
1. Send test email
2. View in Gmail (HTML rendering)
3. View source (check plain text fallback)

**Pass Criteria:**
- ✅ HTML version displays correctly with QR images
- ✅ Plain text version readable as fallback

---

#### TC-071: QR Code Embedding
**Test Data:** Standard invoice email with QR codes

**Expected Results:**
- ✅ Zelle and Venmo QR codes display side-by-side
- ✅ Each QR code is 220x220 pixels
- ✅ Images display inline (not as attachments)

**Pass Criteria:** QR codes render correctly in Gmail, Apple Mail, Outlook

---

#### TC-072: Email Subject Line Truncation
**Test Data:** Invoice with 4 long addresses (subject >100 characters)

**Expected Behavior:** Subject line truncates gracefully or displays in full

**Pass Criteria:** Email client handles long subject line appropriately (no broken display)

---

#### TC-073: PDF Attachment Size
**Test Data:** Invoice with 8 jobs (large line item list)

**Expected Results:**
- ✅ PDF attachment < 5 MB (well below Gmail limit)
- ✅ PDF opens correctly on mobile and desktop

**Pass Criteria:** PDF generates successfully, no size warnings

---

#### TC-074: BCC Delivery
**Test Data:** Send any invoice email

**Expected Results:**
- ✅ BCC recipient (ryan@ryanowenphotography.com or test equivalent) receives copy
- ✅ BCC not visible to primary recipient

**Pass Criteria:** BCC works as expected, hidden from "To" recipient

---

### Test Suite 9: Drive File Management

#### TC-080: PDF Filename Sanitization
**Test Data:**
| Field | Value |
|-------|-------|
| Company | Test/Company:A? |

**Expected Filename:** `9999-0001 - 2026-03-26 - Test-Company-A-.pdf` (special characters replaced with `-`)

**Pass Criteria:** File creates successfully, no OS filename errors

---

#### TC-081: Duplicate Filename Handling
**Test Data:** Run same invoice workflow twice (simulating retry scenario)

**Expected Behavior:** Drive creates second file with (1) suffix automatically

**Pass Criteria:** Both PDFs exist, no overwrite

---

#### TC-082: Preview PDF Location
**Test Data:** Run `Create Invoice PREVIEW PDF (by Company)`

**Expected Results:**
- ✅ PDF created in `_TEST_ROM_INVOICES/_PREVIEW` folder
- ✅ `InvoicePreviewUrl` written to FORM_DATA
- ✅ NO row created in INVOICES sheet
- ✅ `SETTINGS!B1` unchanged

**Pass Criteria:** Preview PDFs isolated from production invoices

---

#### TC-083: Template Copy Deletion
**Steps:**
1. Run any invoice workflow
2. Check `_TEST_ROM_INVOICES` for Google Doc copies

**Expected Results:**
- ✅ Temporary doc copy trashed (not visible in folder)
- ✅ Only PDF remains

**Pass Criteria:** No doc clutter, only final PDF survives

---

### Test Suite 10: Performance & Limits

#### TC-090: Large Batch (20 invoices)
**Test Data:** 20 companies, 1 job each

**Steps:**
1. Run Invoice Only workflow for all 20
2. Measure execution time

**Expected Results:**
- ✅ All 20 invoices created
- ✅ Execution completes < 6 minutes (Apps Script timeout)
- ✅ All emails sent successfully

**Pass Criteria:** No timeout errors, all invoices generated

---

#### TC-091: Gmail Rate Limit Test
**Test Data:** 50 invoice emails in rapid succession

**Expected Behavior:** If approaching rate limit (100/day for consumer), later emails may fail

**Mitigation:** Recommend spacing batches throughout day

**Pass Criteria:** Monitor for "quota exceeded" errors, document recommendation

---

#### TC-092: PDF Generation Speed
**Test Data:** Invoice with 5 jobs (moderate complexity)

**Steps:**
1. Time PDF generation step only (use Logger.log timestamps)

**Expected Time:** < 10 seconds per PDF

**Pass Criteria:** Performance acceptable for production use

---

## 📊 Test Execution Tracker

| Test Case | Status | Date | Tester | Notes |
|-----------|--------|------|--------|-------|
| TC-001 | ⬜️ Not Run | | | |
| TC-002 | ⬜️ Not Run | | | |
| TC-003 | ⬜️ Not Run | | | |
| ... | ⬜️ Not Run | | | |

**Status Legend:**
- ⬜️ Not Run
- 🟡 In Progress
- ✅ Passed
- ❌ Failed
- ⚠️ Passed with Issues

---

## 🔄 Regression Testing

After any script changes, re-run these critical tests:

1. **TC-001** — Basic calculation accuracy
2. **TC-003** — Multi-job summation
3. **TC-020** — Photos Only workflow
4. **TC-021** — Photos + Invoice workflow
5. **TC-023** — Invoice Only workflow
6. **TC-030** — Company billing email lookup
7. **TC-061** — INVOICES sheet auto-creation
8. **TC-063** — NextInvoiceNumber increment

---

## 🚨 Rollback Plan

### If Critical Issues Found

1. **Stop all production use immediately**
2. **Document the issue:**
   - What test case failed?
   - What was the observed behavior?
   - What was the impact? (wrong calculations, missing emails, data corruption)

3. **Rollback steps:**
   - Restore previous script version from `reference/ROM-APPS-SCRIPT.gs` (older version without Reels)
   - Verify last known good invoice number from INVOICES sheet
   - Update `SETTINGS!B1` to next number after last good invoice
   - Run TC-001 in staging to verify rollback

4. **Communication:**
   - Notify Ryan immediately
   - List any invoices sent during issue window
   - Plan manual verification/correction for affected invoices

---

## ✅ Sign-Off Criteria

Testing is complete when:

- [ ] All test cases TC-001 through TC-092 executed
- [ ] Pass rate ≥ 95% (critical tests 100%)
- [ ] All ❌ failures documented with root cause
- [ ] Regression test suite defined
- [ ] Ryan approves test results
- [ ] Script changes (if any) re-tested
- [ ] Production deployment checklist complete

---

## 📝 Test Report Template

**Date:** YYYY-MM-DD  
**Tester:** [Name]  
**Environment:** Staging / Production  
**Script Version:** [Git commit or date]

### Summary
- Total Tests: X
- Passed: Y
- Failed: Z
- Issues Found: N

### Critical Findings
1. [Issue description]
   - Severity: High / Medium / Low
   - Impact: [Revenue, Data, UX]
   - Recommendation: [Fix, Document, Defer]

### Recommendations
- [ ] Deploy to production
- [ ] Fix issues and re-test
- [ ] Requires code changes

---

## 🎓 Testing Best Practices

1. **Test in Isolation**
   - One workflow at a time
   - Clear data between test runs if needed
   - Document starting state

2. **Document Everything**
   - Screenshot PDFs
   - Save email HTML source
   - Record sheet state before/after

3. **Use Version Control**
   - Tag script versions before major test runs
   - Keep test data sheets as historical record

4. **Communicate Early**
   - Report issues immediately, don't wait for full test completion
   - Ask questions if expected behavior is unclear

5. **Think Like a User**
   - What would break if I did X?
   - What's the worst input I could provide?
   - How would a non-technical user misuse this?

---

## 🚀 Post-Testing: Production Deployment Checklist

Before using script on live ROM_CUSTOMER_MASTER sheet:

- [ ] All critical tests passed in staging
- [ ] Script constants reverted to production values:
  - [ ] `DOC_TEMPLATE_NAME = "_ROM_INVOICE_TEMPLATE"`
  - [ ] `INVOICE_FOLDER_NAME = "ROM_INVOICES"`
  - [ ] `EMAIL_FROM_ADDRESS = "ryan@ryanowenphotography.com"`
  - [ ] `EMAIL_BCC_ADDRESS = "ryan@ryanowenphotography.com"`

- [ ] Production sheet verified:
  - [ ] `SETTINGS!B1` contains correct next invoice number
  - [ ] `CO_BILLING_INFO` up to date
  - [ ] No test data present
  - [ ] Array formulas intact

- [ ] Drive dependencies verified:
  - [ ] `_ROM_INVOICE_TEMPLATE` doc accessible
  - [ ] `ROM_INVOICES` folder permissions correct
  - [ ] QR images present

- [ ] Script deployed:
  - [ ] Apps Script editor opened on ROM_CUSTOMER_MASTER sheet
  - [ ] Code pasted from reference file
  - [ ] Constants verified (production values)
  - [ ] Saved successfully
  - [ ] Test menu appears (reload sheet)

- [ ] Final smoke test:
  - [ ] Run "Photos Only" on single test row (real test customer)
  - [ ] Verify email received
  - [ ] Verify sheet writes correct
  - [ ] Manually delete test invoice row from INVOICES
  - [ ] Clear test row from FORM_DATA

- [ ] Documentation updated:
  - [ ] INSTRUCTIONS sheet reflects current workflow
  - [ ] Testing report filed
  - [ ] This testing plan archived with results

- [ ] Ryan sign-off received ✅

---

**End of Testing Plan**

---

## 📞 Support Contacts

**Testing Questions:** bardo.faraday@gmail.com  
**Production Issues:** ryan@ryanowenphotography.com  
**Script Repository:** `~/lab/projects/rom/website-lab/romwebsite2026/reference/`

**Last Updated:** 2026-03-26

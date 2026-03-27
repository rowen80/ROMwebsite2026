# ROM Workflow Testing Guide - All 6 Issues
**After applying fixes, follow this testing sequence to verify everything works**

---

## Prerequisites

Before testing:
- [ ] n8n node configuration changes applied (Issues #1, #3, #6)
- [ ] Apps Script Gmail API enabled and authorized (Issue #5)
- [ ] You understand Issue #2 (always use web form, not curl)
- [ ] Issue #4 verified as already correct in code

---

## Test 1: Name Splitting (Issue #1)

### Goal
Verify that first name and last name are split correctly into separate columns.

### Steps
1. Go to: http://127.0.0.1:8001/booking_form.html (or production URL)
2. Fill out form:
   - **First Name:** `TestFirst`
   - **Last Name:** `TestLast`
   - **Email:** your-test-email@example.com
   - Select any service (e.g., "Basic Photos")
   - Fill required fields minimally
3. Submit form
4. Open Google Sheet: **ROMwebsite2026_data**
5. Find the new row (should be at bottom)

### ✅ Pass Criteria
- ClientFirstName column = `TestFirst`
- ClientLastName column = `TestLast`
- NO combined "TestFirst TestLast" in either column

### ❌ Fail Criteria
- Names are in wrong columns
- Names are still combined/concatenated
- One or both name fields are blank

### Fix If Failed
- Re-check n8n node mapping per **N8N-NODE-CONFIG-FIXES.md**
- Verify you're using `{{ $json.customer.firstName }}` and `{{ $json.customer.lastName }}`

---

## Test 2: Billing Email NOT Auto-Populated (Issue #3)

### Goal
Verify that BillingEmail column stays blank during form intake.

### Steps
1. Use the same test submission from Test 1 (or submit a new one)
2. Check the Google Sheet row immediately after submission
3. Look at the **BillingEmail** column

### ✅ Pass Criteria
- BillingEmail column is **completely blank** (empty cell)
- ClientEmail column IS populated (with the email you entered)

### ❌ Fail Criteria
- BillingEmail column has any value after form submission
- BillingEmail is being auto-filled from ClientEmail or any other field

### Fix If Failed
- Re-check n8n node mapping per **N8N-NODE-CONFIG-FIXES.md**
- Ensure BillingEmail mapping is **completely deleted** from the Google Sheets node

### Note
BillingEmail will be populated LATER by Apps Script during invoice generation. It should be blank on intake.

---

## Test 3: Basic Photos Bedroom Multiplier (Issue #4)

### Goal
Verify that "Basic Photos" service correctly applies the bedroom multiplier.

### Steps
1. Go to booking form
2. Fill out form with:
   - Any name/email
   - **Service:** Select **"Basic Photos"** ONLY
   - **Bedrooms:** Select **"4 Bedrooms"**
   - **Bathrooms:** Select any (e.g., "2 Bathrooms")
   - **List Price:** Select "$0- 500k" (lowest tier)
   - **Sq Ft:** Select "1000 sqft" (to minimize other multipliers)
   - **Finished Basement:** Select "No, There is not a Basement"
   - Fill other required fields
3. Submit form
4. Check Google Sheet row

### ✅ Pass Criteria
Calculate expected price:
- Base: $100 (Basic Photos base price)
- Bedroom multiplier: 1.99 (from pricing.json for "4 Bedrooms")
- Expected: $100 × 1.99 = **$199.00**

Check sheet:
- **Estimated Total** column = `$199` or `199` (might be formatted as currency)
- **Estimated Line Items** column contains: `Basic Photos: $199.00`

### ❌ Fail Criteria
- Estimated Total shows $100 (multiplier NOT applied)
- Estimated Total shows wrong value

### Fix If Failed
- Verify you submitted via web form (NOT curl/Postman) - this is Issue #2
- Check api.py logs for errors in pricing calculation
- Verify pricing.json has correct values (should already be correct)

### Advanced Check
Look at the `Estimated Line Items` column - it should show the detailed breakdown:
```
Basic Photos: $199.00
```

If it shows `Basic Photos: $100.00`, the multiplier was NOT applied.

---

## Test 4: Estimated Total Column (Issue #6)

### Goal
Verify that the "Estimated Total" column shows the correct total from api.py calculation.

### Steps
1. Submit form with MULTIPLE services:
   - **Services:** Select "Basic Photos" AND "Drone Photos"
   - **Bedrooms:** "4 Bedrooms"
   - Other fields: minimal values
2. Check Google Sheet row

### ✅ Pass Criteria
Calculate expected:
- Basic Photos: $100 × 1.99 = $199.00
- Drone Photos: $59 (no multiplier, apply_multipliers: false)
- **Total: $199 + $59 = $258.00**

Check sheet:
- **Estimated Total** column = `$258` or `258`
- **Estimated Line Items** column = `Basic Photos: $199.00; Drone Photos: $59.00`

### ❌ Fail Criteria
- Estimated Total is blank
- Estimated Total shows wrong calculation
- Estimated Total shows formula error (#REF!, #VALUE!, etc.)

### Fix If Failed
- Re-check n8n node mapping: `{{ $json.estimate.estimatedTotal }}`
- Verify api.py calculated total correctly (check payload in n8n execution logs)
- If using sheet formula instead of api.py value, fix formula per **FIX-REPORT-6-ISSUES.md**

---

## Test 5: Invoice Email Sending (Issue #5)

### Goal
Verify that Apps Script can send invoice emails with PDF attachments.

### Setup Steps
1. Find a test row in Google Sheet with:
   - ClientFirstName, ClientLastName, ClientEmail populated
   - Delivered = "Y"
   - PhotoLink = (some URL, can be fake for testing)
   - InvoiceNumber = blank
   - InvoiceStatus = blank
2. If no suitable row exists, create one:
   - Copy a test booking row
   - Set Delivered = "Y"
   - Add a PhotoLink (e.g., "https://dropbox.com/test")
   - Clear InvoiceNumber and InvoiceStatus

### Test Steps
1. In Google Sheets menu: **ROM Ops > Invoicing > Send Invoice Only (By ClientLastName, Del. = Y)**
2. Enter the ClientLastName from your test row
3. Click OK
4. Wait for processing (10-30 seconds)
5. Check your email inbox (the email from ClientEmail field)

### ✅ Pass Criteria
- **PDF created** in Google Drive folder: `ROM_INVOICES_test`
- **Email received** at ClientEmail address
- **Email subject:** `Photography Invoice [invoice-number]`
- **Email has PDF attachment** (invoice file)
- **Email contains QR codes** (Zelle and Venmo)
- **Email signed:** "Ryan Owen Photography"
- **Sheet updated:**
  - InvoiceNumber = (e.g., "2026-1234")
  - InvoicedAt = (today's date/time)
  - InvoicePDFUrl = (Drive URL)
- **BCC email received** at bardo.faraday+rom@gmail.com

### ❌ Fail Criteria
- No email received
- Email received but no PDF attachment
- Email received but QR codes missing
- Sheet NOT updated with invoice fields
- Error message appears in Apps Script

### Fix If Failed
- Follow **APPS-SCRIPT-EMAIL-FIX.md** completely
- Verify Gmail API service is enabled
- Re-authorize Apps Script
- Check send-as configuration in Gmail
- Run `testSendFromDomain()` function first

---

## Test 6: End-to-End Full Workflow

### Goal
Test the complete workflow from form submission to invoice delivery.

### Steps

#### Part 1: Form Submission (Issues #1, #2, #3, #4, #6)
1. Go to booking form: http://127.0.0.1:8001/booking_form.html
2. Fill out completely:
   - **First Name:** Your first name
   - **Last Name:** Your last name
   - **Email:** Your real email (you'll receive test invoice)
   - **Phone:** Your phone
   - **Agency:** "Test Realty"
   - **Service:** "Basic Photos" + "Drone Photos"
   - **Bedrooms:** "4 Bedrooms"
   - **Bathrooms:** "3 Bathrooms"
   - **List Price:** "$500- 750k"
   - **Sq Ft:** "2000 sqft"
   - **Address:** "123 Test Street"
   - **City:** "Ocean City"
   - Fill all other required fields
3. Submit form
4. Wait for success message

#### Part 2: Verify Intake (Issues #1, #3, #6)
1. Open Google Sheet: **ROMwebsite2026_data**
2. Find your new row (bottom of sheet)
3. Check:
   - ✅ ClientFirstName = your first name
   - ✅ ClientLastName = your last name
   - ✅ BillingEmail = BLANK
   - ✅ Estimated Total = correct (calculate: $199 + $59 = $258 for this example)
   - ✅ Estimated Line Items shows breakdown

#### Part 3: Verify Pricing (Issue #4)
1. Look at Estimated Line Items in detail
2. Verify Basic Photos has bedroom multiplier applied:
   - Should show: `Basic Photos: $199.00` (or similar based on multipliers)
   - Should NOT show: `Basic Photos: $100.00`

#### Part 4: Add Photos and Prepare Invoice
1. In your test row, add:
   - **PhotoLink:** Any URL (e.g., "https://dropbox.com/testlink")
   - **Total:** Same as Estimated Total (or adjust if needed)
   - **Deposit:** 0 (for testing)
2. Save

#### Part 5: Send Invoice (Issue #5)
1. Menu: **ROM Ops > Invoicing > Send Invoice Only (By ClientLastName, Del. = Y)**
2. Enter your last name
3. Confirm
4. Wait for completion message

#### Part 6: Verify Email Delivery
1. Check your email inbox
2. Verify:
   - ✅ Email received with subject: `Photography Invoice [number]`
   - ✅ PDF attached
   - ✅ QR codes visible in email body (Zelle and Venmo)
   - ✅ Professional formatting
3. Check sheet:
   - ✅ InvoiceNumber populated
   - ✅ InvoicedAt = today
   - ✅ InvoicePDFUrl has Drive link
   - ✅ BillingEmail NOW populated (by Apps Script)

### ✅ Complete Success Criteria
- All 6 parts passed without errors
- Form submission creates correctly formatted sheet row
- Names split correctly
- BillingEmail blank on intake, filled on invoice
- Pricing multipliers applied correctly
- Invoice email sends with PDF and QR codes
- Sheet fully updated with invoice data

---

## Test 7: Isolated Tests (If Issues Persist)

### Test 7A: Test api.py Pricing Directly
```bash
cd ~/lab/projects/rom/website-lab/romwebsite2026
source .venv/bin/activate
python3 -c "
from api import build_estimate, JobCreate

job = JobCreate(
    first_name='Test',
    last_name='User',
    email='test@example.com',
    address='123 Main',
    city='Ocean City',
    bedrooms='4 Bedrooms',
    bathrooms='2 Bathrooms',
    listing_size='2000 sqft',
    estimated_price_band='\$0- 500k',
    finished_basement='No, There is not a Basement',
    services=['Basic Photos', 'Drone Photos']
)

estimate = build_estimate(job)
print('Total:', estimate.total)
print('Line items:')
for li in estimate.line_items:
    print(f'  {li.label}: \${li.line_total}')
"
```

Expected output:
```
Total: 258.0
Line items:
  Basic Photos: $199.0
  Drone Photos: $59.0
```

### Test 7B: Test n8n Webhook Directly
```bash
cd ~/lab/projects/rom/website-lab/romwebsite2026/automation
./test-webhook.sh
```

Check n8n execution logs to verify payload received correctly.

### Test 7C: Test Apps Script Email Function
In Apps Script editor, run:
```javascript
testSendFromDomain()
```

Check `ryanowen80@gmail.com` for test email.

---

## Troubleshooting Quick Reference

| Issue | Symptom | Fix Document |
|-------|---------|--------------|
| Names not splitting | Both names in one column | N8N-NODE-CONFIG-FIXES.md |
| BillingEmail auto-fills | BillingEmail populated on intake | N8N-NODE-CONFIG-FIXES.md |
| Wrong pricing | Basic Photos = $100 instead of $199 | FIX-REPORT-6-ISSUES.md (verify form submission) |
| Total missing/wrong | Estimated Total blank or incorrect | N8N-NODE-CONFIG-FIXES.md |
| No invoice email | PDF created but email not sent | APPS-SCRIPT-EMAIL-FIX.md |
| Wrong testing method | Using curl instead of form | FIX-REPORT-6-ISSUES.md (Issue #2) |

---

## Test Results Template

Copy this and fill in your results:

```
ROM Workflow Testing - 6 Issues Fix
Date: _______________
Tester: _______________

Test 1: Name Splitting
[ ] PASS  [ ] FAIL
Notes: _______________________________________

Test 2: Billing Email Not Auto-Populated
[ ] PASS  [ ] FAIL
Notes: _______________________________________

Test 3: Basic Photos Bedroom Multiplier
[ ] PASS  [ ] FAIL
Expected: $_______  Actual: $_______
Notes: _______________________________________

Test 4: Estimated Total Column
[ ] PASS  [ ] FAIL
Expected: $_______  Actual: $_______
Notes: _______________________________________

Test 5: Invoice Email Sending
[ ] PASS  [ ] FAIL
Email received: [ ] YES  [ ] NO
PDF attached: [ ] YES  [ ] NO
QR codes visible: [ ] YES  [ ] NO
Notes: _______________________________________

Test 6: End-to-End Full Workflow
[ ] PASS  [ ] FAIL
All sub-checks passed: [ ] YES  [ ] NO
Notes: _______________________________________

OVERALL RESULT: [ ] ALL PASS  [ ] SOME FAIL

Issues remaining (if any):
1. _______________________________________
2. _______________________________________
```

---

## Success Declaration

✅ **All 6 issues are RESOLVED when:**

1. ✅ Names split correctly into ClientFirstName and ClientLastName
2. ✅ Testing always done via web form (not curl)
3. ✅ BillingEmail blank on intake, filled by Apps Script on invoice
4. ✅ Basic Photos applies bedroom multiplier (e.g., $100 → $199 for 4BR)
5. ✅ Invoice emails send successfully with PDF and QR codes
6. ✅ Estimated Total column shows correct calculated value

**When all tests pass, the ROM workflow is fully operational!** 🎉

# ROM Invoice Baseline Testing - Results Log

**Test Date:** _____________  
**Tester:** _____________  
**Environment:** Staging Sheet (17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ)  
**Test Mode:** Manual execution via Google Sheets UI

---

## TC-001: Single Job, Simple Calculation

**Company:** TC001 Properties LLC  
**Expected Total:** $295.00 | **Expected Deposit:** $0.00 | **Expected Balance:** $295.00

### Execution
- [ ] Menu clicked: ROM Ops → Photos + Invoice → By Company
- [ ] Company entered: TC001 Properties LLC
- [ ] Script executed: ⏱️ Started at: _______ | ✅ Completed at: _______

### Results
- **Invoice Number Generated:** _____________
- **Email Received:** [ ] Yes [ ] No | Email address: bardo.faraday+tc001@gmail.com
- **PDF Created:** [ ] Yes [ ] No | Drive URL: _________________________________
- **Sheet Updated:**
  - InvoiceNumber (Col A): _____________ [ ] Correct
  - Delivered (Col V): _____________ [ ] Should be "Y"
  - InvoicedAt (Col AB): _____________ [ ] Has timestamp
  - InvoiceStatus (Col AC): _____________ [ ] Should be "SENT"
  - InvoicePDFUrl (Col AD): _____________ [ ] Has Drive link

### Verification
- **PDF Contents:**
  - [ ] Customer name: Bardo Faraday
  - [ ] Company: TC001 Properties LLC
  - [ ] Address: 123 Test St, Ocean City, MD 21842
  - [ ] Service: Photography
  - [ ] Total: $295.00
  - [ ] Deposit: $0.00
  - [ ] Balance Due: $295.00
  - [ ] Payment instructions visible (Zelle/Venmo QR)

- **Email Contents:**
  - [ ] Photo link present in body
  - [ ] Invoice PDF attached
  - [ ] Professional formatting
  - [ ] BCC to bardo.faraday+rom@gmail.com

- **SETTINGS Update:**
  - NextInvoiceNumber now: _____________ [ ] Should be 9999-0002

### Issues / Notes
```


```

### Screenshots
- [ ] Invoice PDF
- [ ] Email received
- [ ] (Attach or link if needed)

**Status:** [ ] ✅ PASS [ ] ❌ FAIL [ ] ⚠️ PARTIAL

---

## TC-002: Single Job with Deposit

**Company:** TC002 Realty  
**Expected Total:** $595.00 | **Expected Deposit:** $200.00 | **Expected Balance:** $395.00

### Execution
- [ ] Menu clicked: ROM Ops → Photos + Invoice → By Company
- [ ] Company entered: TC002 Realty
- [ ] Script executed: ⏱️ Started at: _______ | ✅ Completed at: _______

### Results
- **Invoice Number Generated:** _____________
- **Email Received:** [ ] Yes [ ] No | Email address: bardo.faraday+tc002@gmail.com
- **PDF Created:** [ ] Yes [ ] No | Drive URL: _________________________________
- **Sheet Updated:**
  - InvoiceNumber (Col A): _____________ [ ] Correct
  - Delivered (Col V): _____________ [ ] Should be "Y"
  - InvoicedAt (Col AB): _____________ [ ] Has timestamp
  - InvoiceStatus (Col AC): _____________ [ ] Should be "SENT"

### Verification
- **PDF Contents:**
  - [ ] Customer name: Alice Smith
  - [ ] Company: TC002 Realty
  - [ ] Address: 456 Beach Ave, Ocean City, MD 21842
  - [ ] Service: Photography + Video
  - [ ] Total: $595.00
  - [ ] Deposit: $200.00 ⚠️ **Critical check**
  - [ ] Balance Due: $395.00 ⚠️ **Critical check** (595 - 200)
  - [ ] Payment instructions visible

- **Email Contents:**
  - [ ] Photo link present
  - [ ] Video link present
  - [ ] Invoice PDF attached

- **SETTINGS Update:**
  - NextInvoiceNumber now: _____________ [ ] Should be 9999-0003

### Issues / Notes
```


```

**Status:** [ ] ✅ PASS [ ] ❌ FAIL [ ] ⚠️ PARTIAL

---

## TC-003: Multiple Jobs for Same Customer ⚠️ CRITICAL TEST

**Company:** TC003 Investments  
**Expected:** ONE combined invoice with 3 line items  
**Expected Total:** $885.00 (3 × $295) | **Expected Deposit:** $0.00 | **Expected Balance:** $885.00

### Execution
- [ ] Menu clicked: ROM Ops → Photos + Invoice → By Company
- [ ] Company entered: TC003 Investments
- [ ] Script executed: ⏱️ Started at: _______ | ✅ Completed at: _______

### Results
- **Invoice Number Generated:** _____________
- **Number of Invoices Created:** _______ [ ] Should be 1 (NOT 3!)
- **Number of Emails Sent:** _______ [ ] Should be 1 (NOT 3!)
- **Email Received:** [ ] Yes [ ] No | Email address: bardo.faraday+tc003@gmail.com
- **PDF Created:** [ ] Yes [ ] No | Drive URL: _________________________________

### Sheet Update (All 3 Rows: 113, 114, 115)
- **Row 113 InvoiceNumber:** _____________ 
- **Row 114 InvoiceNumber:** _____________ [ ] Should MATCH row 113
- **Row 115 InvoiceNumber:** _____________ [ ] Should MATCH row 113
- [ ] All 3 rows have same invoice number
- [ ] All 3 rows marked Delivered=Y

### Verification
- **PDF Contents:**
  - [ ] Customer name: Bob Jones
  - [ ] Company: TC003 Investments
  - [ ] **Line item 1:** 789 Bay Dr, Ocean City, MD 21842 - Photography - $295
  - [ ] **Line item 2:** 101 Coastal Way, Ocean City, MD 21842 - Photography - $295
  - [ ] **Line item 3:** 202 Harbor Ln, Ocean City, MD 21842 - Photography - $295
  - [ ] **Total:** $885.00 ⚠️ **Critical check** (295 + 295 + 295)
  - [ ] Deposit: $0.00
  - [ ] Balance Due: $885.00

- **Email Contents:**
  - [ ] All 3 photo links present in body
  - [ ] Single invoice PDF attached
  - [ ] Email mentions all 3 properties

- **SETTINGS Update:**
  - NextInvoiceNumber now: _____________ [ ] Should be 9999-0004

### Issues / Notes
⚠️ **If this created 3 separate invoices or 3 separate emails: MAJOR BUG!**

```


```

**Status:** [ ] ✅ PASS [ ] ❌ FAIL [ ] ⚠️ PARTIAL

---

## TC-004: Zero Deposit Scenario

**Company:** TC004 LLC  
**Expected Total:** $395.00 | **Expected Deposit:** $0.00 | **Expected Balance:** $395.00

### Execution
- [ ] Menu clicked: ROM Ops → Photos + Invoice → By Company
- [ ] Company entered: TC004 LLC
- [ ] Script executed: ⏱️ Started at: _______ | ✅ Completed at: _______

### Results
- **Invoice Number Generated:** _____________
- **Email Received:** [ ] Yes [ ] No | Email address: bardo.faraday+tc004@gmail.com
- **PDF Created:** [ ] Yes [ ] No | Drive URL: _________________________________
- **Sheet Updated:**
  - InvoiceNumber (Col A): _____________ [ ] Correct
  - Delivered (Col V): _____________ [ ] Should be "Y"

### Verification
- **PDF Contents:**
  - [ ] Customer name: Carol Davis
  - [ ] Company: TC004 LLC
  - [ ] Address: 303 Sunset Blvd, Ocean City, MD 21842
  - [ ] Service: Photography
  - [ ] Total: $395.00
  - [ ] Deposit: $0.00 or blank
  - [ ] Balance Due: $395.00

- **Email Contents:**
  - [ ] Photo link present
  - [ ] Invoice PDF attached

- **SETTINGS Update:**
  - NextInvoiceNumber now: _____________ [ ] Should be 9999-0005

### Issues / Notes
```


```

**Status:** [ ] ✅ PASS [ ] ❌ FAIL [ ] ⚠️ PARTIAL

---

## TC-005: Large Invoice ($5,000+)

**Company:** TC005 Development  
**Expected Total:** $5,450.00 | **Expected Deposit:** $1,500.00 | **Expected Balance:** $3,950.00

### Execution
- [ ] Menu clicked: ROM Ops → Photos + Invoice → By Company
- [ ] Company entered: TC005 Development
- [ ] Script executed: ⏱️ Started at: _______ | ✅ Completed at: _______

### Results
- **Invoice Number Generated:** _____________
- **Email Received:** [ ] Yes [ ] No | Email address: bardo.faraday+tc005@gmail.com
- **PDF Created:** [ ] Yes [ ] No | Drive URL: _________________________________
- **Sheet Updated:**
  - InvoiceNumber (Col A): _____________ [ ] Correct
  - Delivered (Col V): _____________ [ ] Should be "Y"

### Verification
- **PDF Contents:**
  - [ ] Customer name: David Wilson
  - [ ] Company: TC005 Development
  - [ ] Address: 404 Grand Ave, Ocean City, MD 21842
  - [ ] Service: Commercial Photography + Video + Drone
  - [ ] Total: $5,450.00 ⚠️ **Large amount formatting check**
  - [ ] Deposit: $1,500.00
  - [ ] Balance Due: $3,950.00 ⚠️ **Critical check** (5450 - 1500)
  - [ ] Payment instructions visible

- **Email Contents:**
  - [ ] Photo link present
  - [ ] Video link present
  - [ ] Invoice PDF attached
  - [ ] Large amount looks professional (no formatting issues)

- **SETTINGS Update:**
  - NextInvoiceNumber now: _____________ [ ] Should be 9999-0006

### Issues / Notes
```


```

**Status:** [ ] ✅ PASS [ ] ❌ FAIL [ ] ⚠️ PARTIAL

---

## Post-Test Verification

### Automated Checks (Run These Commands)

```bash
# Check all invoice numbers assigned
gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ '2026 FORM_DATA!A111:A117' --plain
```
**Result:** ___________________________________________

```bash
# Check all marked Delivered
gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ '2026 FORM_DATA!V111:V117' --plain
```
**Result:** ___________________________________________

```bash
# Final SETTINGS invoice number
gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ 'SETTINGS!B1' --plain
```
**Result:** _____________ [ ] Should be 9999-0006

```bash
# List all test PDFs
gog drive search "9999-" --json | jq -r '.files[] | select(.name | contains("9999")) | .name'
```
**Result:**
```


```

### INVOICES Sheet Check
```bash
gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ 'INVOICES!A:M' --plain | grep "9999-"
```
**Result:** (Should show 5 invoice records, or 1 record for TC-003 if multi-row invoices tracked differently)
```


```

---

## Summary

### Overall Results
- **Tests Passed:** _____ / 5
- **Tests Failed:** _____ / 5
- **Tests Partial:** _____ / 5

### Critical Findings
⚠️ **TC-003 Multi-Property Test:**
- [ ] Worked correctly (1 invoice, 3 line items)
- [ ] Failed (created multiple invoices)
- Details: ___________________________________________

### What Works Perfectly
```


```

### What's Broken
```


```

### What Needs Improvement
```


```

### Calculation Issues Found
```


```

### UI/UX Issues
```


```

---

## Next Steps

Based on these results:

1. **Prioritize fixes** for Phase 2:
   - Critical bugs: _________________________
   - Important improvements: _________________________
   - Nice-to-have enhancements: _________________________

2. **Create baseline report** summarizing findings

3. **Plan Phase 2 work** based on what's broken vs. what works

---

**Testing Complete:** [ ] Yes [ ] No  
**Results Reviewed:** [ ] Yes [ ] No  
**Baseline Report Created:** [ ] Yes [ ] No

---

*End of Test Results Log*

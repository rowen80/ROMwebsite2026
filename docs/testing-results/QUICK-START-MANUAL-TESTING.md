# Quick Start: Manual Testing ROM Invoices

**5 Tests • 2 Hours • Document Everything**

---

## Setup ✅ DONE

Leo has configured everything. You just need to click and verify.

---

## Open This

**Staging Sheet:**  
https://docs.google.com/spreadsheets/d/17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ/edit

**Email Inbox to Check:**  
- bardo.faraday+rom@gmail.com (BCC copies)
- bardo.faraday+tc001 through +tc005@gmail.com (primary recipients)

**Drive Folder (for PDFs):**  
https://drive.google.com/drive/folders/1HqX-2vXNlgWtGzRP6N_RFZbTmk0T3cM3

---

## The 5 Tests

| Test | Company Name | What to Enter | What to Check |
|------|--------------|---------------|---------------|
| **TC-001** | TC001 Properties LLC | Exactly that | Simple $295 invoice, no deposit |
| **TC-002** | TC002 Realty | Exactly that | $595 invoice, $200 deposit = $395 due |
| **TC-003** | TC003 Investments | Exactly that | **ONE invoice with 3 properties** = $885 total |
| **TC-004** | TC004 LLC | Exactly that | $395 invoice, no deposit |
| **TC-005** | TC005 Development | Exactly that | Big $5,450 invoice, $1,500 deposit = $3,950 due |

---

## How to Run Each Test

1. **Open staging sheet** (link above)
2. **Click:** ROM Ops menu → Photos + Invoice → By Company
3. **Type company name** from table above (copy/paste to be exact)
4. **Press OK**
5. **Wait** 30-60 seconds for script to run
6. **Check:**
   - ✅ Email arrived (check inbox)
   - ✅ PDF in Drive folder
   - ✅ Sheet updated (row has invoice number now)
   - ✅ Math is correct (see table above)

---

## What You're Looking For

### ✅ Success Looks Like:
- Email lands in inbox with photo links + PDF attached
- PDF has correct invoice number (9999-0001, 9999-0002, etc.)
- PDF shows correct customer name, company, address
- Math is right: Total - Deposit = Balance Due
- Sheet row updated with invoice number and status
- SETTINGS sheet increments (B1 goes from 9999-0001 → 9999-0002 → etc.)

### ❌ Failure Looks Like:
- Error popup in Google Sheets
- No email arrives
- No PDF in Drive folder
- Math is wrong on PDF
- Sheet not updated
- TC-003 creates 3 separate invoices instead of 1 combined invoice ⚠️

---

## Special Case: TC-003

**This is the critical test!**

- Should create **ONE invoice** with **3 line items** (3 properties)
- Should send **ONE email** to Bob Jones
- Total should be **$885** (3 × $295)
- All 3 sheet rows (113, 114, 115) should get the **same invoice number**

**If it creates 3 separate invoices:** ❌ BUG FOUND - document this!

---

## Document As You Go

For each test, write down:

```
TC-XXX:
- Invoice # generated: _______
- Email arrived: Y / N
- PDF looks good: Y / N
- Math correct: Y / N
- Sheet updated: Y / N
- Issues: _______________________
```

Take screenshots if anything looks weird.

---

## After All 5 Tests

### Run These Commands (Automated Check)

```bash
# Did all rows get invoice numbers?
gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ '2026 FORM_DATA!A111:A117' --plain

# Are all marked Delivered?
gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ '2026 FORM_DATA!V111:V117' --plain

# Final invoice number (should be 9999-0006)
gog sheets get 17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ 'SETTINGS!B1' --plain

# List all test PDFs created
gog drive search "9999-" --json | jq -r '.files[] | select(.name | contains("9999")) | .name'
```

### Create Summary

**Write a simple report:**
- What worked perfectly
- What broke or had issues
- What needs fixing in Phase 2

Save as: `baseline-results-2026-03-26.md`

---

## Questions?

- **Setup issues?** Check `test-execution-guide.md` for details
- **Need more context?** Read `PHASE1-LEO-COMPLETION-REPORT.md`
- **Found a bug?** Document it! That's the point of baseline testing

---

**Time estimate:** 2 hours  
**Goal:** Understand current system behavior (bugs and all)  
**Next:** Use findings to plan Phase 2 improvements

---

🎯 **You're all set. Start with TC-001 and work your way down!**

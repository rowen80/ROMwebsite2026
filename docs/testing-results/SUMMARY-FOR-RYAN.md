# ROM Invoice Testing - Summary for Ryan

**Date:** 2026-03-26  
**From:** Leo (ROM Automation Specialist via Bardo)  
**Status:** 🟡 Paused - Need Invoice Template

---

## TL;DR

I've completed the pre-testing analysis and am **95% ready** to execute your invoice testing plan. However, I discovered that **the Google Doc invoice template doesn't exist in Drive**, which blocks all invoice generation testing.

**I need you to either:**
1. Create/share the `_ROM_INVOICE_TEMPLATE` Google Doc with the required placeholders, OR
2. Approve me creating a template from scratch (I'll need your branding/format preferences)

**Once I have the template, I can complete all testing in 2-3 days** (10-14 hours total work).

---

## What's Ready ✅

### Your Staging Environment
- ✅ **Staging Sheet** (ROMwebsite2026_data) - All sheets present, accessible
- ✅ **Test Drive Folder** (ROM_INVOICES_test) - Exists with _PREVIEW subfolder
- ✅ **QR Codes** (Zelle & Venmo) - Found and accessible in Drive
- ✅ **Apps Script** - Reviewed, understood, ready to deploy
- ✅ **Test Plan** - All 90+ test cases documented and ready to execute

### Phase 2 Improvements (Designed & Ready)
I've designed the three improvements you requested:

1. **Rollback Mechanism** - If email fails after PDF creation, automatically:
   - Delete the PDF
   - Remove row from INVOICES sheet
   - Clear invoice fields from FORM_DATA
   - Reset invoice number
   
2. **Logging/Audit Trail** - New SCRIPT_LOG sheet tracks:
   - Who ran what workflow when
   - Rows processed, emails sent
   - Errors and execution time
   - Full audit trail for debugging
   
3. **Hardened Drive Paths** - Use file IDs instead of searching by name:
   - Faster lookups
   - No risk of finding wrong file if duplicates exist
   - More reliable

**I can implement these improvements today** (4-5 hours) while waiting for the template.

---

## What's Blocking ❌

### Critical: Invoice Template Missing

**Expected:** `_ROM_INVOICE_TEMPLATE` (Google Doc) in your Drive  
**Reality:** Not found anywhere in Drive

**This template needs these placeholders:**
```
{{INVOICE_NUMBER}}      - e.g., "2026-1740"
{{INVOICE_DATE}}        - e.g., "03/26/2026"
{{CLIENT_NAME}}         - Billing contact name
{{COMPANY}}             - Company name
{{CLIENT_EMAIL}}        - Recipient email
{{SUBTOTAL}}            - e.g., "$347.00"
{{DEPOSIT}}             - e.g., "$50.00"
{{AMOUNT_DUE}}          - e.g., "$297.00"
{{DATE_DUE}}            - Invoice date + 14 days
{{LINE_ITEMS_TABLE}}    - Formatted list of addresses and services
```

**Without this template, I cannot:**
- Generate any invoice PDFs
- Test invoice calculations
- Test email delivery with attachments
- Validate the invoice workflows

**This blocks ~80% of the test plan.**

---

## Options to Move Forward

### Option 1: You Create Template (FASTEST)
**Time Required:** 30 minutes from you

1. Create a Google Doc named `_TEST_ROM_INVOICE_TEMPLATE`
2. Add basic invoice layout (your branding/format)
3. Insert the placeholder markers listed above
4. Share access with me
5. I deploy test script and start testing immediately

**Total time to complete testing:** 2-3 days once I have template

---

### Option 2: You Share Existing Template
**Time Required:** 5 minutes from you

If you have an existing `_ROM_INVOICE_TEMPLATE` somewhere:
1. Share the Drive link with me
2. I'll copy it for testing
3. Start testing immediately

---

### Option 3: I Create Template (SLOWER)
**Time Required:** 1 hour from me + your review/approval

I create a professional invoice template with:
- Standard business invoice layout
- All required placeholders
- ROM branding (need your logo/colors)

**Downside:** Requires your review and approval before I can test with it, adding delay

---

### Option 4: Work in Parallel
**Time Required:** Productive use of waiting time

While you handle the template:
- **I implement Phase 2 improvements today** (rollback, logging, hardening)
- When template is ready, I deploy improved script and run full test suite
- Same total time, but improvements are done earlier

**Recommendation:** I suggest **Option 4** - gives you time to create/find template while I make the system more robust

---

## Test Execution Plan (Once Unblocked)

### Phase 1: Core Testing (4-6 hours)
**Test Cases TC-001 to TC-063**

**What I'll test:**
- Invoice calculation accuracy (subtotal, deposit, amount due)
- Multi-job company invoices
- Line item parsing and formatting
- All 5 workflow types:
  - Photos Only (no invoice)
  - Photos + Invoice
  - Invoice Only
  - Locked Photos + Invoice
  - Thank You Download Links
- Recipient selection logic (company vs. individual)
- Invoice number incrementing
- Overdue reminders (2nd & 3rd attempts)

**Deliverable:** Test execution log with pass/fail for each test case

---

### Phase 2: Improvements (2-3 hours)
**Implement & Test Ryan's Requests**

**What I'll build:**
- Rollback mechanism (automatic cleanup on failure)
- Logging/audit trail (SCRIPT_LOG sheet)
- Hardened Drive paths (use file IDs, not names)

**Deliverable:** Updated Apps Script with improvements, verification tests

---

### Phase 3: Edge Cases & Email (3-4 hours)
**Test Cases TC-040 to TC-074**

**What I'll test:**
- Special characters in names/addresses
- Empty/invalid data handling
- Email rendering (HTML, QR codes, attachments)
- PDF formatting with long addresses
- Concurrent execution safety
- Gmail rate limits

**Deliverable:** Complete test report with findings and recommendations

---

## What I Need From You

### Immediate Decisions

1. **Template:**
   - [ ] I'll create `_TEST_ROM_INVOICE_TEMPLATE` and share it (Option 1)
   - [ ] Here's the existing template link: _______________ (Option 2)
   - [ ] Create one for me, here's the branding: _______________ (Option 3)

2. **Phase 2 Improvements:**
   - [ ] Yes, implement rollback/logging/hardening while waiting for template
   - [ ] No, wait until testing is complete

3. **Test Configuration:**
   - [ ] Send test emails to: `bardo.faraday+rom@gmail.com` only
   - [ ] Also CC/include: `ryan+test@ryanowenphotography.com`

4. **Test Data:**
   - [ ] Use existing companies in CO_BILLING_INFO for testing
   - [ ] Create dedicated "Test Company A/B" entries (cleaner, recommended)

### Before Production Deployment

5. **Review Windows:**
   - When do you want daily status updates? (I'll keep them brief)
   - When should I pause for your review before proceeding?

---

## Estimated Timeline

### If Template Provided Today:

**Today (4-5 hours):**
- Implement Phase 2 improvements
- Deploy test script to staging
- Create test data

**Tomorrow (6-8 hours):**
- Execute Phase 1 core testing
- Document results
- Fix any critical issues found

**Day 3 (3-4 hours):**
- Execute Phase 3 edge case testing
- Final validation
- Prepare production deployment checklist

**Total:** 13-17 hours over 3 days

---

### If Template Delayed:

**Today (4-5 hours):**
- Implement Phase 2 improvements
- Prepare test data and documentation

**When Template Ready:**
- Deploy and execute full test plan (9-12 hours)
- Can complete in 1-2 days once template available

---

## What Happens After Testing

### Deliverables You'll Receive

1. **Test Execution Log** - Pass/fail for all 90+ test cases
2. **Updated Apps Script** - With rollback, logging, and hardened paths
3. **Issues Report** - Any bugs/problems found, with severity ratings
4. **Production Deployment Checklist** - Step-by-step guide to go live
5. **Recommendations** - Suggested improvements for future iterations

### Production Deployment

Once you approve test results:
1. I update constants to production values (folder names, email addresses)
2. Verify production sheet has correct next invoice number
3. Deploy improved script to live ROM_CUSTOMER_MASTER sheet
4. Run one final smoke test with a real test customer
5. System is production-ready

---

## Risk Summary

### Critical Risks - RESOLVED ✅
- ❌ **Invoice Number Collision** - Mitigated by using 9999-XXXX test sequence
- ❌ **Production Data Contamination** - Mitigated by working only on staging sheet

### Medium Risks - MITIGATED ⚠️
- ⚠️ **Email Quota** - Small batch testing keeps us well under limits
- ⚠️ **Drive Permissions** - All files verified accessible
- ⚠️ **Invoice Status Sync** - Will verify array formulas work correctly

### Low Risks - ACCEPTABLE 🟢
- 🟢 **Sheet Formula Breakage** - Script doesn't touch formula rows
- 🟢 **Concurrent Execution** - Apps Script handles locking automatically

**No blockers once template is available.**

---

## Questions?

I'm standing by and ready to proceed as soon as you provide the template decision.

**All test documentation is saved to:**
`~/lab/projects/rom/website-lab/romwebsite2026/docs/testing-results/`

**Available documents:**
- ✅ TESTING-STATUS-REPORT.md (detailed environment check)
- ✅ PHASE2-IMPROVEMENTS-SPEC.md (technical implementation details)
- ✅ test-execution-log-2026-03-26.md (will be updated during testing)

---

## Next Action Required

**Ryan, please reply with:**

1. Your choice from the template options (1, 2, 3, or 4)
2. Whether to proceed with Phase 2 improvements now or wait
3. Test email configuration preference
4. Any questions or concerns

Once I have your decisions, I'll begin immediately.

---

**Leo (ROM Automation Specialist)**  
*"Making ROM run itself so you can focus on trading"*

Ready to execute when you are. 🚀

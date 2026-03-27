# ROM Invoice Testing Documentation

**Created:** 2026-03-26  
**By:** Leo (ROM Automation Specialist)

## 📚 Documentation Overview

This directory contains comprehensive documentation for the ROM invoice generation Apps Script system.

### Documents

1. **[APPS-SCRIPT-REVIEW.md](./APPS-SCRIPT-REVIEW.md)** (27 KB)
   - Complete technical review of the invoice generation script
   - Architecture overview and workflow descriptions
   - Pricing logic and calculation details
   - Potential issues and edge cases identified
   - Code quality assessment
   
2. **[INVOICE-TESTING-PLAN.md](./INVOICE-TESTING-PLAN.md)** (29 KB)
   - 92 comprehensive test cases covering all workflows
   - Step-by-step testing procedures
   - Safety guardrails and rollback plan
   - Production deployment checklist

### Quick Start

**For Ryan (Business Owner):**
1. Read APPS-SCRIPT-REVIEW.md Executive Summary (page 1)
2. Review "Potential Issues & Edge Cases" section (page 15-18)
3. Approve testing approach in INVOICE-TESTING-PLAN.md
4. Schedule testing session

**For Leo (Automation Specialist):**
1. Complete pre-test setup checklist (INVOICE-TESTING-PLAN.md, Section "Pre-Test Setup")
2. Execute Test Suites 1-3 (core functionality)
3. Document results in testing log
4. Report findings before proceeding to advanced tests

### Key Findings Summary

#### ✅ System Strengths
- Well-structured, modular code
- Multiple workflow types (Photos Only, Photos+Invoice, Invoice Only, Locked, Thank You, Overdue)
- Defensive validation and error checking
- Proper rounding for currency calculations
- Payment QR code embedding

#### ⚠️ Areas of Concern
1. **No rollback mechanism** — If email fails after PDF creation, state is inconsistent
2. **Missing billing contact** — Hard error stops workflow (could use fallback)
3. **Drive dependencies** — Relies on finding files by name (brittle)
4. **No logging** — Difficult to audit past actions
5. **Invoice number collision risk** — If SETTINGS!B1 manually edited incorrectly

#### 🎯 Testing Priorities

**Must Test (Critical):**
- TC-001, TC-002, TC-003: Calculation accuracy
- TC-020, TC-021, TC-023: Core workflows
- TC-030: Company billing email lookup
- TC-063: Invoice number increment

**Should Test (Important):**
- TC-010 through TC-014: Line item parsing
- TC-040 through TC-048: Edge cases
- TC-050 through TC-054: Overdue reminders

**Nice to Test (Quality):**
- TC-070 through TC-074: Email rendering
- TC-090 through TC-092: Performance limits

### Testing Environment

**Staging Sheet:** ROMwebsite2026_data (17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ)  
**Live Sheet:** ROM_CUSTOMER_MASTER (1F87dygig_3HFPvtWp7x1KfKdowyoBPKnKCAjLUYyoKs) — **DO NOT TEST HERE**

**Test Invoice Range:** 9999-0001 through 9999-9999 (clearly distinguishable from production)

### Next Steps

1. **Review Phase** (30 min)
   - Ryan reviews both documents
   - Questions/clarifications addressed
   - Testing approach approved

2. **Setup Phase** (1 hour)
   - Create test Drive folder and template
   - Prepare test data in staging sheet
   - Configure script constants for testing

3. **Execution Phase** (3-4 hours)
   - Run Test Suite 1: Calculations (TC-001 to TC-005)
   - Run Test Suite 2: Line Items (TC-010 to TC-014)
   - Run Test Suite 3: Workflows (TC-020 to TC-027)
   - Document results continuously

4. **Validation Phase** (1 hour)
   - Review test results
   - Fix critical issues if found
   - Re-run failed tests

5. **Deployment Phase** (30 min)
   - Complete production deployment checklist
   - Deploy script to live sheet
   - Run smoke test
   - Monitor first production use

**Total Estimated Time:** 6-7 hours (can be split across multiple sessions)

### Risk Assessment

**Overall Risk:** 🟠 **MEDIUM-HIGH**

The system is production-critical (handles revenue and customer relationships), but:
- ✅ Code is well-structured with validation
- ✅ Current implementation has been running successfully
- ✅ Comprehensive testing plan in place
- ⚠️ Some edge cases could cause issues
- ⚠️ No automated rollback if things go wrong

**Recommendation:** Proceed with testing as planned. Address critical findings before production deployment.

### Contact

**Questions about testing:** bardo.faraday@gmail.com  
**Script issues:** ryan@ryanowenphotography.com  
**Documentation location:** `~/lab/projects/rom/website-lab/romwebsite2026/docs/`

---

**Status:** ✅ Documentation complete, ready for review  
**Next Action:** Ryan reviews APPS-SCRIPT-REVIEW.md Executive Summary

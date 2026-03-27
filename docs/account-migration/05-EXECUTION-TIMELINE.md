# ROM Account Migration — Execution Timeline

**Date:** 2026-03-26  
**Analyst:** Leo (ROM Automation Specialist)  
**Purpose:** Detailed schedule for migration execution

---

## 📅 Timeline Overview

| Day | Phase | Duration | Downtime | Status |
|-----|-------|----------|----------|--------|
| **Day 1 (Today)** | Phase 0 — Investigation | 30 min | None | 📋 Planning |
| **Day 1 (Today)** | Phase 1 — Fix Send-As | 1 hour | None | 📋 Ready to start |
| **Day 2 (Tomorrow)** | Phase 2 — Transfer Ownership | 2 hours | 5-10 min | ⏳ Pending Ryan's review |
| **Day 2 (Tomorrow)** | Phase 3 — OAuth Migration | 3 hours | 30 min | ⏳ Pending Phase 2 success |
| **Day 3-4** | Phase 4 — Cleanup | 1 hour | None | ⏳ Pending Phase 3 success |
| **Day 7** | Follow-Up Review | 30 min | None | ⏳ Scheduled |
| **Day 30** | Final Review | 30 min | None | ⏳ Scheduled |

**Total Time:** ~7.5 hours (spread over 3-4 days)  
**Total Downtime:** ~30 minutes (during Apps Script redeployment)

---

## 🕒 Recommended Execution Windows

### Best Times to Execute

**Phase 1 (No Downtime):**
- ✅ Anytime during business hours
- ✅ Ryan available for email verification

**Phase 2 (Minimal Downtime):**
- ✅ Late afternoon / early evening (4-7 PM EDT)
- ✅ Ryan available but not actively using system
- ❌ Avoid: During active booking hours (9 AM - 2 PM)

**Phase 3 (30-min Downtime):**
- ✅ Late evening (8-11 PM EDT) — Best option
- ✅ Early morning (6-8 AM EDT) — Acceptable
- ❌ Avoid: Midday, weekends (Ryan may need to send invoices)

**Phase 4 (No Downtime):**
- ✅ Anytime — No production impact

---

## 📋 Day-by-Day Execution Plan

---

## Day 1: Investigation & Send-As Fix
### Date: 2026-03-26 (Today)
### Total Time: 1.5 hours | Downtime: None

---

### 🕐 Session 1: Investigation (3:00 PM - 3:30 PM EDT)

**Phase 0.1: Verify Google Accounts**  
**Who:** Ryan  
**Time:** 10 minutes

- [ ] Log in to ryanowen80@gmail.com → Verify Gmail access
- [ ] Log in to ryan.owen@ryanowenphotography.com → Verify Gmail access
- [ ] Confirm 2FA status on both accounts
- [ ] Document findings in INVESTIGATION-RESULTS.md

---

**Phase 0.2: Check Send-As Configuration**  
**Who:** Ryan  
**Time:** 10 minutes

- [ ] Open Gmail as ryanowen80@gmail.com
- [ ] Settings → Accounts → Send mail as
- [ ] Document: Is ryan@ryanowenphotography.com listed?
- [ ] Repeat for ryan.owen@ryanowenphotography.com
- [ ] Document findings

---

**Phase 0.3: Verify ROM_FINACIALS_MASTER Ownership**  
**Who:** Ryan  
**Time:** 5 minutes

- [ ] Open ROM_FINACIALS_MASTER sheet
- [ ] Share → Note owner email
- [ ] Document current owner

---

**Phase 0.4: Check Apps Script Execution Account**  
**Who:** Ryan  
**Time:** 5 minutes

- [ ] Open ROM_FINACIALS_MASTER
- [ ] Extensions → Apps Script
- [ ] Project Settings → Note execution account
- [ ] Document findings

---

### 🕐 Session 2: Send-As Configuration (4:00 PM - 5:00 PM EDT)

**Phase 1.1: Configure Send-As Alias**  
**Who:** Ryan  
**Time:** 30 minutes

**Scenario A: If ryan@ is an alias**
- [ ] Log in to Gmail as Apps Script execution account
- [ ] Settings → Accounts → Send mail as
- [ ] Add another email address: ryan@ryanowenphotography.com
- [ ] ☑ Treat as an alias
- [ ] Send verification email
- [ ] Check inbox for verification link
- [ ] Click verification link
- [ ] Set as default

**Scenario B: If execution account IS ryan.owen@**
- [ ] No send-as needed
- [ ] Proceed directly to testing

---

**Phase 1.2: Test Send-As on Staging Sheet**  
**Who:** Ryan + Bardo  
**Time:** 30 minutes

- [ ] Open ROMwebsite2026_data staging sheet
- [ ] Verify test data in rows 3-5
- [ ] Run: ROM Ops → Invoice Only → By Company
- [ ] Select test company
- [ ] **Preview Mode ON** → Review PDF
- [ ] **Preview Mode OFF** → Send to Bardo
- [ ] Bardo confirms: Email received, PDF attached, QR codes visible
- [ ] Check Apps Script execution log: No errors

**If successful:** ✅ Phase 1 complete! Document success, proceed to Day 2.  
**If failed:** ⚠️ Troubleshoot send-as configuration, DO NOT proceed to Phase 2.

---

### 🕐 End of Day 1 Checklist

- [ ] Phase 0 complete (all unknowns investigated)
- [ ] Phase 1 complete (send-as working)
- [ ] INVESTIGATION-RESULTS.md created
- [ ] MIGRATION-LOG.md started (timestamp each action)
- [ ] TEST-RESULTS.md updated (screenshot of test email)
- [ ] Ryan approves proceeding to Day 2

**If all checked:** Ready for Day 2! 🎉  
**If any unchecked:** Resolve issues before continuing.

---

## Day 2: Ownership Transfer & OAuth Migration
### Date: 2026-03-27 (Tomorrow)
### Total Time: 5 hours | Downtime: 30 minutes

---

### 🕐 Session 1: File Ownership Transfer (4:00 PM - 6:00 PM EDT)

**Phase 2.1: Backup ROM_FINACIALS_MASTER**  
**Who:** Ryan  
**Time:** 10 minutes

- [ ] Open ROM_FINACIALS_MASTER
- [ ] File → Make a copy
- [ ] Name: "ROM_FINACIALS_MASTER_BACKUP_2026-03-27"
- [ ] Document backup file ID
- [ ] Store in safe location (NOT in ROM_INVOICES folder)

**Bardo Backup (Parallel):**
```bash
gog sheets export 1tpIAPqv1Hbg5Kttx-zVVFSp2dckoHe8YxSw3XytmlN0 \
  --format xlsx \
  --output ~/lab/projects/rom/backups/ROM_FINACIALS_MASTER_20260327.xlsx
```

---

**Phase 2.2: Transfer Invoice Template Ownership**  
**Who:** Ryan (logged in as ryanowen80@gmail.com)  
**Time:** 15 minutes

- [ ] Open ROM_INVOICE_TEMPLATE_test (ID: 12BCu...)
- [ ] Share → Add ryan.owen@ as Editor (if not already)
- [ ] Advanced → Change ryan.owen@ to Owner
- [ ] Save changes → Confirm transfer
- [ ] Verify: Refresh page, check ryan.owen@ is Owner
- [ ] Test: Log in as ryan.owen@, open doc, make test edit
- [ ] Document: Success in MIGRATION-LOG.md

**Rollback Ready:** Transfer back to ryanowen80@ if issues arise

---

**Phase 2.3: Transfer Invoice Folder Ownership**  
**Who:** Ryan (logged in as ryanowen80@gmail.com)  
**Time:** 15 minutes

- [ ] Open Google Drive
- [ ] Locate ROM_INVOICES_test folder (ID: 1HqX...)
- [ ] Right-click → Share
- [ ] Add ryan.owen@ as Editor (if not already)
- [ ] Advanced → Change ryan.owen@ to Owner
- [ ] ☑ Notify people
- [ ] Save changes → Confirm transfer
- [ ] Verify child files: Open folder, check invoice PDF ownership
- [ ] Test: Log in as ryan.owen@, create test file in folder
- [ ] Document: Success in MIGRATION-LOG.md

---

**Phase 2.4: Transfer ROM_FINACIALS_MASTER Ownership (CRITICAL)**  
**Who:** Ryan (logged in as current owner)  
**Time:** 30 minutes

**⚠️ CRITICAL STEP — High Risk**

- [ ] Pre-check: Backup created? (Phase 2.1)
- [ ] Pre-check: Apps Script tab open in separate tab?
- [ ] Open ROM_FINACIALS_MASTER
- [ ] Share → Add ryan.owen@ as Editor (if not already)
- [ ] Advanced → Change ryan.owen@ to Owner
- [ ] **PAUSE** — Review one more time before clicking Save
- [ ] Save changes → Confirm transfer
- [ ] **IMMEDIATELY:** Refresh Apps Script tab
- [ ] Verify: Can still see code?
- [ ] Verify: Project Settings → Execution account OK?
- [ ] Test: Run `onOpen()` function → Verify menu appears
- [ ] **Do NOT run invoice functions yet** (wait for Phase 3)

**If Apps Script broken:**
- ⚠️ STOP — Follow rollback procedure in 04-RISK-ASSESSMENT.md (Risk 2)
- Transfer ownership back to original owner
- Restore from backup if needed
- Investigate before retrying

**If successful:**
- ✅ Document: Timestamp, success confirmation
- ✅ Proceed to Phase 2.5

---

**Phase 2.5: Transfer QR Code Files Ownership**  
**Who:** Ryan (logged in as current owner)  
**Time:** 10 minutes

- [ ] Locate ZelleQr.jpg in Drive
- [ ] Right-click → Share → Advanced → Transfer to ryan.owen@
- [ ] Repeat for VenmoQr.jpg
- [ ] Verify: Both files owned by ryan.owen@
- [ ] Test: Run invoice on staging sheet, verify QR codes appear

---

**Phase 2.6: Test Invoice Generation (No Email Send)**  
**Who:** Ryan  
**Time:** 15 minutes

- [ ] Open ROMwebsite2026_data staging sheet
- [ ] Run: ROM Ops → Invoice Only → By Company
- [ ] Select test company
- [ ] **Preview Mode ON** → Generate PDF
- [ ] Verify: PDF created successfully
- [ ] Verify: PDF accessible (not permission errors)
- [ ] **Do NOT send email yet** (wait for Phase 3)

---

### 🕐 Dinner Break (6:00 PM - 8:00 PM EDT)

Ryan, take a break! Phase 3 will have 30 minutes of downtime, best done when you're not actively using the system.

---

### 🕐 Session 2: OAuth Migration (8:00 PM - 11:00 PM EDT)

**⚠️ PRODUCTION DOWNTIME WINDOW STARTS AT 9:00 PM**

**Phase 3.1: Authenticate gog CLI as ryan.owen@**  
**Who:** Bardo  
**Time:** 20 minutes

```bash
# Add ryan.owen authentication
gog auth add ryan.owen@ryanowenphotography.com --services drive,sheets,gmail

# Browser opens → Ryan logs in as ryan.owen@
# Grant permissions: Drive, Sheets, Gmail

# Verify
gog --account ryan.owen@ryanowenphotography.com drive ls

# Test production sheet access
gog --account ryan.owen@ryanowenphotography.com sheets get \
  1tpIAPqv1Hbg5Kttx-zVVFSp2dckoHe8YxSw3XytmlN0 "SETTINGS!B1"
```

- [ ] gog authentication successful
- [ ] Can access Drive files
- [ ] Can read production sheet
- [ ] Document: Success in MIGRATION-LOG.md

---

**Phase 3.2: Back Up clasp Credentials**  
**Who:** Bardo  
**Time:** 5 minutes

```bash
# Backup Bardo's credentials
cp ~/.clasprc.json ~/.clasprc.json.backup.bardo

# Verify backup created
ls -lh ~/.clasprc.json*
```

- [ ] Backup file created
- [ ] Backup file size > 0 bytes

---

**Phase 3.3: Re-Authenticate clasp as ryan.owen@**  
**Who:** Bardo + Ryan  
**Time:** 20 minutes

**⏱️ PRODUCTION DOWNTIME STARTS HERE (9:00 PM EDT)**

```bash
# Log out current account
clasp logout

# Verify logged out
clasp whoami  # Should error or show "not logged in"

# Log in as ryan.owen@
clasp login
```

Browser opens:
- [ ] Ryan logs in as ryan.owen@ryanowenphotography.com
- [ ] Grants permissions: Apps Script, Drive
- [ ] Returns to terminal

```bash
# Verify login
clasp whoami  # Should show: ryan.owen@ryanowenphotography.com

# Test project access
cd ~/lab/projects/rom/website-lab/romwebsite2026/apps-script
clasp open  # Should open script in browser
```

- [ ] clasp authentication successful
- [ ] Can access Apps Script project

**If fails:** Rollback immediately (restore ~/.clasprc.json.backup.bardo)

---

**Phase 3.4: Deploy Apps Script as ryan.owen@**  
**Who:** Bardo  
**Time:** 30 minutes (includes testing)

```bash
cd ~/lab/projects/rom/website-lab/romwebsite2026/apps-script

# Pull latest code (verify no conflicts)
clasp pull

# Review changes (if any)
git diff Code.js

# Push code (redeploy with ryan.owen@ as execution account)
clasp push
```

- [ ] clasp push successful (no errors)
- [ ] Verify: Open ROM_FINACIALS_MASTER → Refresh page
- [ ] Verify: Extensions → Apps Script → Code visible
- [ ] Verify: Project Settings → Execution account shows ryan.owen@

**⏱️ PRODUCTION DOWNTIME ENDS HERE (9:30 PM EDT) — 30 minutes total**

---

**Phase 3.5: Test Invoice Email on Staging Sheet (CRITICAL)**  
**Who:** Ryan + Bardo  
**Time:** 30 minutes

- [ ] Open ROMwebsite2026_data staging sheet (as ryan.owen@)
- [ ] Run: ROM Ops → Invoice Only → By Company
- [ ] Select test company
- [ ] **Preview Mode OFF** → Send email to Bardo
- [ ] Wait for email (1-2 minutes)

**Bardo verifies email:**
- [ ] Email received
- [ ] From: Ryan Owen Photography <ryan@ryanowenphotography.com>
- [ ] PDF attached
- [ ] QR codes visible
- [ ] No errors in email content

**Ryan verifies sheet:**
- [ ] InvoiceNumber assigned
- [ ] InvoicedAt timestamp written
- [ ] InvoiceStatus = "SENT"
- [ ] InvoicePDFUrl populated
- [ ] INVOICES sheet: New row created

**If ALL verified:** ✅ Phase 3 complete! Major milestone achieved! 🎉  
**If ANY failed:** ⚠️ Rollback to Bardo's clasp credentials, investigate.

---

**Phase 3.6: Update n8n Google Account (If Needed)**  
**Who:** Bardo  
**Time:** 30 minutes

- [ ] Log in to https://rom-n8n.onrender.com
- [ ] Navigate to Credentials
- [ ] Find Google OAuth credential
- [ ] If NOT ryan.owen@:
  - [ ] Edit credential
  - [ ] Delete old credential
  - [ ] Create new: Google OAuth2 API
  - [ ] Name: "Google - Ryan Owen"
  - [ ] Authenticate as ryan.owen@
  - [ ] Grant permissions: Drive, Sheets
  - [ ] Save

- [ ] Open "ROM Request Intake" workflow
- [ ] Google Sheets node → Select "Google - Ryan Owen" credential
- [ ] Save workflow

**Test webhook:**
```bash
cd ~/lab/projects/rom/website-lab/romwebsite2026
./test-booking.sh
```

- [ ] Check ROMwebsite2026_data sheet
- [ ] New row added
- [ ] Data correct
- [ ] No errors in n8n execution log

**If successful:** ✅ n8n migration complete!  
**If failed:** Restore previous credential, investigate.

---

### 🕐 End of Day 2 Checklist

- [ ] Phase 2 complete (all ownership transferred)
- [ ] Phase 3 complete (OAuth migrated)
- [ ] Apps Script runs as ryan.owen@
- [ ] Send-as works (test email received)
- [ ] n8n webhook works
- [ ] MIGRATION-LOG.md updated
- [ ] TEST-RESULTS.md updated (screenshots)
- [ ] Downtime was < 30 minutes
- [ ] No production errors

**If all checked:** Phase out ryanowen80@ on Day 3-4! 🚀  
**If any unchecked:** Troubleshoot before proceeding.

---

## Day 3-4: Cleanup & Phase Out ryanowen80
### Date: 2026-03-28 or 2026-03-29
### Total Time: 1 hour | Downtime: None

---

### 🕐 Session 1: Permission Cleanup (Anytime, 1 hour)

**Phase 4.1: Audit ryanowen80@ Permissions**  
**Who:** Bardo  
**Time:** 15 minutes

```bash
# Check files still owned by ryanowen80@
gog --account bardo.faraday@gmail.com drive search "owner:ryanowen80@gmail.com" --json

# Document findings
```

- [ ] List all files still owned by ryanowen80@
- [ ] Verify most are now owned by ryan.owen@
- [ ] Document any unexpected ownership

---

**Phase 4.2: Remove ryanowen80@ from Staging Sheet**  
**Who:** Ryan  
**Time:** 5 minutes

- [ ] Open ROMwebsite2026_data staging sheet
- [ ] Share → Find ryanowen80@gmail.com
- [ ] Click "X" (remove access)
- [ ] Done

**Test:**
- [ ] Try opening sheet as ryanowen80@ (should fail)
- [ ] Run webhook test (should still work)

---

**Phase 4.3: Downgrade ryanowen80@ on Production Files**  
**Who:** Ryan  
**Time:** 15 minutes

For each file:

1. **ROM_INVOICE_TEMPLATE_test:**
   - [ ] Share → ryanowen80@ → Change to "Viewer"

2. **ROM_INVOICES_test folder:**
   - [ ] Share → ryanowen80@ → Change to "Viewer"

3. **ROM_FINACIALS_MASTER:**
   - [ ] Share → ryanowen80@ → Change to "Viewer"

**Test:**
- [ ] Log in as ryanowen80@
- [ ] Try to edit ROM_FINACIALS_MASTER → Should be read-only

**Rationale:** Keep Viewer access for emergency recovery, but remove editing.

---

**Phase 4.4: Document Legacy Access Strategy**  
**Who:** Bardo  
**Time:** 15 minutes

- [ ] Create LEGACY-ACCESS-STRATEGY.md (content in migration plan)
- [ ] Document current ryanowen80@ permissions
- [ ] Document removal timeline (3 months → remove completely)
- [ ] Document emergency recovery procedure

---

### 🕐 End of Phase 4 Checklist

- [ ] ryanowen80@ audited
- [ ] ryanowen80@ removed from staging sheet
- [ ] ryanowen80@ downgraded to Viewer on production files
- [ ] LEGACY-ACCESS-STRATEGY.md created
- [ ] No production workflows rely on ryanowen80@

**Phase 4 complete!** ✅ Migration is now functionally complete.

---

## Day 7: Follow-Up Review
### Date: 2026-04-02
### Total Time: 30 minutes | Downtime: None

---

### 🕐 One-Week Post-Migration Review

**Who:** Ryan + Bardo  
**Time:** 30 minutes

**Questions to Answer:**
1. Have there been any issues with invoice sending?
   - [ ] No send-as errors?
   - [ ] All emails delivered successfully?
   - [ ] Customers received invoices?

2. Has anything broken unexpectedly?
   - [ ] Any workflows not working?
   - [ ] Any permission errors?
   - [ ] Any missing files/folders?

3. Is ryan.owen@ the primary operator as intended?
   - [ ] Ryan uses ryan.owen@ account for all operations?
   - [ ] Apps Script runs as ryan.owen@?
   - [ ] Emails send from ryan@ryanowenphotography.com?

4. Is Bardo's Editor access sufficient?
   - [ ] Bardo can troubleshoot when needed?
   - [ ] No ownership conflicts?

5. Any lingering ryanowen80@ dependencies?
   - [ ] Any workflows still using ryanowen80@?
   - [ ] Any errors since downgrading to Viewer?

**Actions:**
- [ ] Document findings in WEEK1-REVIEW.md
- [ ] Address any issues discovered
- [ ] Update permission matrix if needed
- [ ] Schedule 1-month review

---

## Day 30: Final Review & ryanowen80 Removal
### Date: 2026-04-26
### Total Time: 30 minutes | Downtime: None

---

### 🕐 One-Month Post-Migration Review

**Who:** Ryan + Bardo  
**Time:** 30 minutes

**Questions to Answer:**
1. Has the system been stable for 30 days?
   - [ ] No production issues related to migration?
   - [ ] All workflows functioning correctly?

2. Is ryanowen80@ still needed?
   - [ ] Have we accessed ryanowen80@ in the last month?
   - [ ] Any emergency scenarios requiring ryanowen80@?

3. Can we remove ryanowen80@ access entirely?
   - [ ] Remove Viewer access from ROM_FINACIALS_MASTER?
   - [ ] Remove Viewer access from ROM_INVOICE_TEMPLATE_test?
   - [ ] Remove Viewer access from ROM_INVOICES_test folder?

**Decision:**
- **Option A:** Remove ryanowen80@ entirely (recommended if no issues)
- **Option B:** Keep Viewer access for another 3 months (conservative)

**Actions:**
- [ ] Document decision in MONTH1-REVIEW.md
- [ ] Remove ryanowen80@ access (if Option A)
- [ ] Update POST-MIGRATION-CONFIG.md (final state)
- [ ] Archive all migration documentation
- [ ] **Migration officially complete!** 🎉

---

## 📊 Timeline Summary

```
Day 1 (Mar 26)    Day 2 (Mar 27)    Day 3-4 (Mar 28-29)    Day 7 (Apr 2)    Day 30 (Apr 26)
  |                   |                    |                     |                  |
Phase 0-1         Phase 2-3           Phase 4              Follow-Up         Final Review
(1.5 hrs)         (5 hrs)             (1 hr)               (30 min)          (30 min)
No downtime       30-min downtime     No downtime          No downtime       No downtime
  |                   |                    |                     |                  |
  ├─ Investigate      ├─ Backup files     ├─ Audit ryanowen80  ├─ Check issues   ├─ Remove ryanowen80
  ├─ Fix send-as      ├─ Transfer owner   ├─ Remove from stage ├─ Verify stable  └─ Archive docs
  └─ Test email       ├─ Migrate OAuth    └─ Downgrade Viewer  └─ Document
                      └─ Test end-to-end
```

---

## ✅ Final Success Criteria

Migration is **COMPLETE** when:

- [ ] All files owned by ryan.owen@ryanowenphotography.com
- [ ] Apps Script runs as ryan.owen@ryanowenphotography.com
- [ ] Emails send from ryan@ryanowenphotography.com (no errors)
- [ ] Invoice workflow works end-to-end (tested on staging & production)
- [ ] Bardo has Editor access (not Owner)
- [ ] ryanowen80@ downgraded or removed
- [ ] OAuth credentials migrated (gog, clasp, n8n)
- [ ] No production issues for 30 days
- [ ] All documentation complete

---

## 🎉 Post-Migration Celebration

When all checkboxes are complete and Ryan confirms everything works:

1. **Archive migration docs:**
   ```bash
   mv ~/lab/projects/rom/website-lab/romwebsite2026/docs/account-migration \
      ~/lab/projects/rom/website-lab/romwebsite2026/docs/archive/account-migration-2026-03
   ```

2. **Create final summary:**
   - POST-MIGRATION-CONFIG.md (final permission state)
   - LESSONS-LEARNED.md (what went well, what to improve)

3. **Update README:**
   - Document new account structure
   - Update troubleshooting guides
   - Reference archived migration docs

4. **Commit everything:**
   ```bash
   cd ~/lab/projects/rom/website-lab/romwebsite2026
   git add docs/
   git commit -m "Complete account migration: ryan.owen@ now primary operator"
   git push
   ```

5. **High-five! 🙌 Migration complete!**

---

**Status:** Timeline complete. Await Ryan's approval to begin Day 1 execution.

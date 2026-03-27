# ROM Account Migration — Risk Assessment & Mitigation

**Date:** 2026-03-26  
**Analyst:** Leo (ROM Automation Specialist)  
**Scope:** All phases of account migration

---

## 🎯 Risk Categories

| Risk Level | Description | Response |
|-----------|-------------|----------|
| 🔴 **CRITICAL** | Production outage, data loss, customer impact | Immediate rollback |
| 🟠 **HIGH** | Workflow disruption, requires troubleshooting | Staged rollback, investigate |
| 🟡 **MEDIUM** | Temporary inconvenience, workaround available | Document, continue |
| 🟢 **LOW** | Minimal impact, easily fixed | Note and proceed |

---

## 📊 Risk Matrix

| Risk | Likelihood | Impact | Level | Mitigation |
|------|-----------|--------|-------|-----------|
| Apps Script loses sheet binding | 🟡 Medium | 🔴 Critical | 🟠 HIGH | Backup before transfer, test immediately |
| Send-as email configuration fails | 🟠 High | 🔴 Critical | 🔴 CRITICAL | Test in Phase 1, verify before production |
| OAuth tokens revoked during migration | 🟡 Medium | 🟠 High | 🟠 HIGH | Back up tokens, re-auth quickly |
| File ownership transfer breaks shared links | 🟢 Low | 🟡 Medium | 🟡 MEDIUM | Test on staging files first |
| Production downtime > 30 minutes | 🟢 Low | 🟠 High | 🟡 MEDIUM | Deploy during low-traffic hours |
| Data loss during sheet transfer | 🟢 Rare | 🔴 Critical | 🟠 HIGH | Full backup before any changes |
| ryanowen80@ access removal breaks legacy workflows | 🟡 Medium | 🟡 Medium | 🟡 MEDIUM | Phase out gradually, monitor |
| Customer receives email from wrong address | 🟡 Medium | 🟡 Medium | 🟡 MEDIUM | Test send-as thoroughly |
| Invoice number sequence breaks | 🟢 Rare | 🟠 High | 🟡 MEDIUM | Verify SETTINGS!B1 after transfer |
| n8n webhook stops writing to sheet | 🟡 Medium | 🟠 High | 🟠 HIGH | Test immediately after credential change |

---

## 🔴 CRITICAL RISKS (Immediate Rollback Required)

### Risk 1: Send-As Email Configuration Fails

**Scenario:** Apps Script tries to send invoice emails but fails with "Send-as not configured"

**Impact:**
- ❌ No customer emails sent
- ❌ Invoices generated but not delivered
- ❌ Production workflow halted
- ❌ Customer service disruption

**Likelihood:** 🟠 High (already occurred)

**Mitigation — Prevention:**
1. **Phase 0:** Verify ryan@ address type (alias vs. separate account)
2. **Phase 1:** Configure send-as alias BEFORE ownership transfer
3. **Phase 1:** Test send-as with dummy email to Bardo
4. **Phase 1:** Do NOT proceed to Phase 2 until send-as works

**Mitigation — Detection:**
- Watch Apps Script execution log for "Send-as not configured" errors
- Test email sending after each OAuth change
- Bardo receives all test emails (verify delivery)

**Mitigation — Recovery:**
1. **Immediate:** Stop all invoice generation
2. **Rollback:** Revert to previous execution account (Bardo or ryanowen80)
3. **Fix:** Configure send-as alias correctly
4. **Test:** Send test invoice on staging sheet
5. **Resume:** Re-deploy with correct configuration

**Rollback Time:** 15-30 minutes

---

### Risk 2: Apps Script Loses Sheet Binding During Ownership Transfer

**Scenario:** Transferring ROM_FINACIALS_MASTER ownership breaks the bound Apps Script connection

**Impact:**
- ❌ Script no longer accessible from sheet menu
- ❌ "ROM Ops" menu disappears
- ❌ All invoice workflows broken
- ❌ Manual rebinding required (may lose script edits)

**Likelihood:** 🟡 Medium (Google Docs transfers usually preserve bindings, but not guaranteed)

**Mitigation — Prevention:**
1. **Phase 2:** Create full backup of ROM_FINACIALS_MASTER before transfer
2. **Phase 2:** Note the Apps Script ID before transfer (from URL)
3. **Phase 2:** Transfer ownership, then IMMEDIATELY verify script access
4. **Phase 2:** Keep Apps Script tab open during transfer

**Mitigation — Detection:**
- After ownership transfer, refresh sheet page
- Check: Extensions → Apps Script → Does code appear?
- Check: ROM Ops menu → Does it exist?

**Mitigation — Recovery:**

**Option A: Rebind Script (if script project still exists)**
```bash
cd ~/lab/projects/rom/website-lab/romwebsite2026/apps-script
clasp push --force
```

**Option B: Restore from Backup (if script lost)**
1. Delete broken sheet (or rename to "BROKEN_*")
2. Restore backup: ROM_FINACIALS_MASTER_BACKUP_2026-03-26
3. Rename backup to "ROM_FINACIALS_MASTER"
4. Transfer ownership again (more carefully)

**Option C: Manual Script Re-Attach (nuclear option)**
1. Create new Apps Script project bound to sheet
2. Copy code from `~/lab/projects/rom/website-lab/romwebsite2026/apps-script/Code.js`
3. Paste into new project
4. Redeploy

**Rollback Time:** 30 minutes (Option A), 1-2 hours (Options B/C)

---

### Risk 3: Data Loss During Sheet Ownership Transfer

**Scenario:** Google glitches during ownership transfer, corrupts or loses sheet data

**Impact:**
- ❌ Customer data lost
- ❌ Invoice history lost
- ❌ Financial records gone
- ❌ Business continuity threatened

**Likelihood:** 🟢 Rare (Google is reliable, but Murphy's Law applies)

**Mitigation — Prevention:**
1. **Before Phase 2:** Create full backup of ROM_FINACIALS_MASTER
   - File → Make a copy → Name: "ROM_FINACIALS_MASTER_BACKUP_2026-03-26"
   - Store in safe location (NOT inside ROM_INVOICES folder)
   - Document backup file ID
2. **Before Phase 2:** Export to local disk:
   ```bash
   gog sheets export 1tpIAPqv1Hbg5Kttx-zVVFSp2dckoHe8YxSw3XytmlN0 \
     --format xlsx \
     --output ~/lab/projects/rom/backups/ROM_FINACIALS_MASTER_$(date +%Y%m%d).xlsx
   ```
3. **Before Phase 2:** Verify backup can be opened and contains all tabs

**Mitigation — Detection:**
- After ownership transfer, verify:
  - All tabs present (count: 13)
  - Row counts match (FORM_DATA, INVOICES, etc.)
  - SETTINGS!B1 (NextInvoiceNumber) still populated
  - Array formulas still working

**Mitigation — Recovery:**
1. **Immediate:** Do NOT make any more changes
2. **Restore:** File → Make a copy of backup
3. **Verify:** Check all data intact
4. **Resume:** Transfer ownership again (more carefully)

**Rollback Time:** 15-30 minutes

---

## 🟠 HIGH RISKS (Staged Rollback, Investigation Required)

### Risk 4: OAuth Tokens Revoked During clasp Re-Authentication

**Scenario:** Logging out of clasp (Bardo) causes OAuth token revocation, breaking Apps Script execution

**Impact:**
- ⚠️ Apps Script loses permissions
- ⚠️ OAuth consent dialog appears for users
- ⚠️ Production downtime during re-auth
- ⚠️ Manual intervention required

**Likelihood:** 🟡 Medium (clasp logout/login can be finicky)

**Mitigation — Prevention:**
1. **Phase 3:** Back up `~/.clasprc.json` BEFORE logging out:
   ```bash
   cp ~/.clasprc.json ~/.clasprc.json.backup.bardo
   ```
2. **Phase 3:** Schedule migration during low-traffic hours (late evening)
3. **Phase 3:** Have Ryan available for OAuth re-authorization if needed

**Mitigation — Detection:**
- After clasp login as ryan.owen@, run: `clasp whoami`
- After `clasp push`, open sheet and check Extensions → Apps Script
- Run test function → If OAuth consent appears, re-authorize

**Mitigation — Recovery:**
1. **If Ryan.owen@ auth fails:**
   ```bash
   cp ~/.clasprc.json.backup.bardo ~/.clasprc.json
   clasp push  # Redeploy as Bardo
   ```
2. **If OAuth revoked:**
   - Open sheet → Extensions → Apps Script
   - Run any function → OAuth dialog appears
   - Grant permissions: Drive, Sheets, Gmail, Docs
   - Test invoice send on staging sheet

**Rollback Time:** 10-20 minutes

---

### Risk 5: n8n Webhook Stops Writing to Sheet After Credential Change

**Scenario:** Changing n8n's Google OAuth credential breaks webhook → sheet integration

**Impact:**
- ⚠️ New booking form submissions lost
- ⚠️ No data written to ROMwebsite2026_data
- ⚠️ Customer inquiries not captured
- ⚠️ Manual data entry required temporarily

**Likelihood:** 🟡 Medium (credential changes can break n8n workflows)

**Mitigation — Prevention:**
1. **Phase 3:** Test webhook BEFORE changing credential:
   ```bash
   cd ~/lab/projects/rom/website-lab/romwebsite2026
   ./test-booking.sh  # Record: row count BEFORE test
   # Check sheet: verify new row added
   ```
2. **Phase 3:** Change credential in n8n
3. **Phase 3:** Test webhook AFTER changing credential:
   ```bash
   ./test-booking.sh  # Verify new row added
   ```
4. **Phase 3:** Keep old credential available for quick rollback

**Mitigation — Detection:**
- After credential change, test webhook immediately
- Check n8n execution log for errors
- Verify new row appears in ROMwebsite2026_data sheet

**Mitigation — Recovery:**
1. **In n8n:**
   - Go to Credentials
   - Re-select old credential (Bardo's)
   - Save workflow
2. **Test:**
   ```bash
   ./test-booking.sh
   # Verify row added
   ```
3. **Investigate:** Why did ryan.owen@ credential fail?
4. **Retry:** Fix credential, test again

**Rollback Time:** 5-10 minutes

---

### Risk 6: Production Downtime Exceeds 30 Minutes During clasp Redeployment

**Scenario:** Apps Script redeployment takes longer than expected due to OAuth issues, conflicts, or errors

**Impact:**
- ⚠️ Invoice generation unavailable
- ⚠️ Sheet menu (ROM Ops) non-functional
- ⚠️ Ryan can't process invoices during downtime

**Likelihood:** 🟡 Medium (clasp can have hiccups)

**Mitigation — Prevention:**
1. **Phase 3:** Deploy during off-hours (9 PM - 6 AM)
2. **Phase 3:** Notify Ryan: "Migration in progress, don't use sheet for 30 min"
3. **Phase 3:** Have rollback plan ready (Bardo's credentials backed up)

**Mitigation — Detection:**
- Monitor time: Start timer when running `clasp push`
- If > 15 minutes with no success → Investigate
- If > 30 minutes → Rollback

**Mitigation — Recovery:**
1. **Rollback to Bardo:**
   ```bash
   cp ~/.clasprc.json.backup.bardo ~/.clasprc.json
   clasp push
   ```
2. **Verify:** Sheet menu works, test invoice on staging
3. **Document:** What went wrong?
4. **Reschedule:** Try ryan.owen@ deployment another day

**Rollback Time:** 10-15 minutes

---

## 🟡 MEDIUM RISKS (Document, Continue)

### Risk 7: File Ownership Transfer Breaks Shared Links

**Scenario:** Transferring ownership of files changes link permissions, breaking shared URLs

**Impact:**
- ⚠️ Invoice PDF links in emails may become inaccessible
- ⚠️ Customers can't view invoices
- ⚠️ Manual re-sharing required

**Likelihood:** 🟢 Low (Google preserves link permissions during ownership transfer)

**Mitigation — Prevention:**
1. **Phase 2:** Test on staging files first:
   - Create test doc in Bardo's drive
   - Share link with "Anyone with link can view"
   - Transfer ownership to ryan.owen@
   - Test link in incognito window → Does it still work?
2. **Phase 2:** For production files:
   - Check current link sharing setting before transfer
   - Transfer ownership
   - Re-check link sharing setting after transfer

**Mitigation — Detection:**
- After ownership transfer, click "Get link" on ROM_INVOICES_test folder
- Verify: "Anyone with the link" permission still enabled
- Test link in incognito browser window

**Mitigation — Recovery:**
1. **For broken links:**
   - Right-click file → Share → Change to "Anyone with the link"
   - Get new link
   - If customers already have old link, it should still work (Google forwards)
2. **For future invoices:**
   - Apps Script generates new PDFs with correct permissions automatically

**Rollback Time:** 5 minutes per file

---

### Risk 8: ryanowen80@ Access Removal Breaks Undocumented Legacy Workflows

**Scenario:** There's a hidden workflow or automation that relies on ryanowen80@gmail.com that we don't know about

**Impact:**
- ⚠️ Mystery workflow stops working
- ⚠️ Ryan notices something missing
- ⚠️ Investigation required to find dependency

**Likelihood:** 🟡 Medium (possible unknown automations)

**Mitigation — Prevention:**
1. **Phase 4:** Remove ryanowen80@ access GRADUALLY:
   - Start with staging sheet (Phase 4.2)
   - Wait 1 week
   - Downgrade to Viewer on production (Phase 4.3)
   - Wait 1 month
   - Remove entirely (Phase 5, future)
2. **Phase 4:** Document removal in CHANGELOG
3. **Phase 4:** Monitor for complaints from Ryan

**Mitigation — Detection:**
- Ask Ryan: "Have you noticed anything not working since we removed ryanowen80@ from staging sheet?"
- Check Apps Script execution log for errors mentioning permissions
- Monitor email delivery rates

**Mitigation — Recovery:**
1. **Re-grant access:**
   - Add ryanowen80@gmail.com back with Editor permissions
   - Verify workflow works again
2. **Document:**
   - What workflow broke?
   - Why did it rely on ryanowen80@?
   - How can we migrate it to ryan.owen@?

**Rollback Time:** 5 minutes

---

### Risk 9: Customer Receives Email from Wrong Address During Testing

**Scenario:** During migration testing, a test invoice is accidentally sent to a real customer instead of Bardo

**Impact:**
- ⚠️ Customer confusion (duplicate invoice)
- ⚠️ Unprofessional appearance
- ⚠️ Potential complaint

**Likelihood:** 🟡 Medium (human error during testing)

**Mitigation — Prevention:**
1. **All test phases:** Use **staging sheet only** (ROMwebsite2026_data)
2. **All test phases:** Verify recipient is bardo.faraday@gmail.com
3. **All test phases:** Enable "Preview Mode" first (generates PDF but doesn't send)
4. **Phase 2-3:** Add test rows with obviously fake data:
   - ClientEmail: "test@example.com"
   - ListingAddress: "123 Test Street"
   - Company: "TEST COMPANY (DO NOT SEND)"

**Mitigation — Detection:**
- Before clicking "Send", double-check recipient email in confirmation dialog
- Use fake company names that are obviously not real

**Mitigation — Recovery:**
1. **If customer receives test invoice:**
   - Send immediate follow-up email:
     > "Please disregard the previous invoice email. It was sent in error during a system test. Your correct invoice is attached to this email."
   - Attach correct invoice (if applicable)
   - Apologize for confusion
2. **Document:** How did this happen? Add checklist to prevent future

**Impact Time:** 5-10 minutes (+ customer service time)

---

### Risk 10: Invoice Number Sequence Breaks After Sheet Transfer

**Scenario:** SETTINGS!B1 (NextInvoiceNumber) gets corrupted or reset during ownership transfer

**Impact:**
- ⚠️ Duplicate invoice numbers
- ⚠️ Accounting errors
- ⚠️ Customer confusion (two invoices with same number)

**Likelihood:** 🟢 Low (cell values preserved during transfer)

**Mitigation — Prevention:**
1. **Before Phase 2:** Document current invoice number:
   ```bash
   gog sheets get 1tpIAPqv1Hbg5Kttx-zVVFSp2dckoHe8YxSw3XytmlN0 "SETTINGS!B1"
   # Record: e.g., "2026-1700"
   ```
2. **After Phase 2:** Verify invoice number unchanged:
   ```bash
   gog sheets get 1tpIAPqv1Hbg5Kttx-zVVFSp2dckoHe8YxSw3XytmlN0 "SETTINGS!B1"
   # Should still be: "2026-1700"
   ```
3. **After first invoice:** Verify incremented correctly:
   ```bash
   # Should now be: "2026-1701"
   ```

**Mitigation — Detection:**
- Check SETTINGS!B1 after every major change
- If blank or wrong format → STOP and fix

**Mitigation — Recovery:**
1. **If blank:**
   - Manually set to last invoice number + 1
   - Check INVOICES sheet for highest invoice number
   - Set SETTINGS!B1 to next sequential number

2. **If duplicate generated:**
   - Void the duplicate invoice
   - Manually increment SETTINGS!B1
   - Regenerate with correct number

**Rollback Time:** 5-15 minutes

---

## 🟢 LOW RISKS (Note and Proceed)

### Risk 11: Temporary Development Workflow Disruption for Bardo

**Scenario:** During OAuth migration, Bardo can't use gog/clasp for a few minutes

**Impact:**
- 🟢 Bardo waits during migration
- 🟢 No customer impact
- 🟢 Minimal inconvenience

**Likelihood:** 🟠 High (expected during Phase 3)

**Mitigation:**
- Schedule migration when Bardo is available
- Estimated downtime: 10-30 minutes
- Bardo can switch back to personal credentials if needed

---

### Risk 12: Documentation Becomes Outdated

**Scenario:** After migration, documentation doesn't reflect new account structure

**Impact:**
- 🟢 Future troubleshooting harder
- 🟢 New team members confused
- 🟢 No immediate production impact

**Mitigation:**
1. **During migration:** Update all docs in real-time
2. **After migration:** Create "POST-MIGRATION-CONFIG.md" with final state
3. **After migration:** Update README files, setup docs
4. **Quarterly:** Review docs for accuracy

---

## 🛡️ Mitigation Strategy Summary

### Pre-Migration (Before Phase 1)
- [ ] Full backup of ROM_FINACIALS_MASTER (Google Sheets copy)
- [ ] Local export of ROM_FINACIALS_MASTER (XLSX file)
- [ ] Document current NextInvoiceNumber (SETTINGS!B1)
- [ ] Back up `~/.clasprc.json` (Bardo's credentials)
- [ ] Notify Ryan of migration schedule
- [ ] Verify Ryan has login access to all accounts

### During Migration (Phase 1-4)
- [ ] Test each phase on staging resources first
- [ ] Verify success before moving to next phase
- [ ] Document each action in MIGRATION-LOG.md
- [ ] Keep rollback options ready (backup tokens, credentials)
- [ ] Monitor Apps Script execution log for errors
- [ ] Test email sending after every OAuth change

### Post-Migration (After Phase 4)
- [ ] Verify all ownership transfers complete (see checklist in 03-PERMISSION-MATRIX.md)
- [ ] Test full invoice workflow end-to-end (staging, then production dry-run)
- [ ] Document final configuration (POST-MIGRATION-CONFIG.md)
- [ ] Remove or downgrade ryanowen80@ access
- [ ] Schedule 1-week follow-up (check for issues)
- [ ] Schedule 1-month review (finalize ryanowen80@ removal)

---

## 📞 Emergency Contacts & Escalation

### If Critical Risk Occurs

1. **Stop all production changes immediately**
2. **Assess impact:**
   - Are customers affected?
   - Is data at risk?
   - Can we rollback quickly?
3. **Execute rollback procedure** (see specific risk section above)
4. **Document incident:**
   - What happened?
   - What was the trigger?
   - How was it resolved?
   - How can we prevent it?
5. **Communicate with Ryan:**
   - Incident summary
   - Current status (rolled back / in progress)
   - Next steps

### Escalation Path

1. **Bardo** — Execute rollback procedures
2. **Ryan** — Approve major rollback decisions
3. **Google Workspace Support** — If Google-side issues (rare)

---

## 📊 Risk Acceptance

**Ryan's Decision:** After reviewing this document, Ryan accepts the migration risks and approves proceeding with the plan.

**Acknowledged Risks:**
- Short production downtime (up to 30 minutes) during clasp redeployment
- Possibility of needing to rollback if Apps Script binding breaks
- Temporary disruption to Bardo's development workflow

**Risk Mitigation Commitment:**
- All high/critical risks have tested rollback procedures
- Staging testing before production changes
- Backups created before any ownership transfers
- Emergency recovery procedures documented

**Signature:**  
- [ ] Ryan Owen (Business Owner) — Date: ___________  
- [ ] Bardo Faraday (Technical Lead) — Date: ___________

---

**Status:** Risk assessment complete. Proceed to `05-EXECUTION-TIMELINE.md` for scheduling.

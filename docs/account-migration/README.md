# ROM Account Migration Documentation

**Created:** 2026-03-26  
**Status:** 📋 Planning Complete — Awaiting Ryan's Approval  
**Purpose:** Migrate ownership and authentication from ryanowen80@gmail.com to ryan.owen@ryanowenphotography.com

---

## 🚨 The Problem

Ryan encountered this error during invoice testing:
```
Error: Send-as not configured for ryan@ryanowenphotography.com
```

This triggered a comprehensive review of account ownership and authentication across the ROM business automation system.

---

## 📚 Documentation Structure

Read these documents **in order:**

### 1. [Executive Summary](./00-EXECUTIVE-SUMMARY.md)
**Start here!** High-level overview of the problem, current state, and migration goals.

**Key Sections:**
- Current ownership status
- Ryan's vision for account structure
- Phase overview
- Risk summary

**Time to Read:** 5-10 minutes

---

### 2. [Account Audit](./01-ACCOUNT-AUDIT.md)
Complete inventory of all Google resources, OAuth credentials, and automation systems.

**Key Sections:**
- Google accounts breakdown (ryanowen80, ryan.owen, bardo)
- Sheet ownership audit
- Apps Script projects
- OAuth credentials (gog, clasp, n8n)
- Unknown/missing items
- Investigation checklist

**Time to Read:** 15-20 minutes

---

### 3. [Migration Plan](./02-MIGRATION-PLAN.md)
Step-by-step roadmap for executing the migration.

**Key Sections:**
- Phase 0: Investigation (30 min, no downtime)
- Phase 1: Fix Send-As Email (1 hour, no downtime)
- Phase 2: Transfer Ownership (2 hours, 5-10 min downtime)
- Phase 3: OAuth Migration (3 hours, 30 min downtime)
- Phase 4: Cleanup (1 hour, no downtime)
- Rollback procedures for each phase
- Testing strategy

**Time to Read:** 30-45 minutes

---

### 4. [Permission Matrix](./03-PERMISSION-MATRIX.md)
Target permission structure after migration completion.

**Key Sections:**
- Final ownership matrix (ryan.owen, bardo, ryanowen80)
- OAuth credential mapping
- Gmail send-as configuration
- Emergency access scenarios
- Permission verification checklist

**Time to Read:** 10-15 minutes

---

### 5. [Risk Assessment](./04-RISK-ASSESSMENT.md)
Detailed risk analysis with mitigation strategies.

**Key Sections:**
- Critical risks (🔴 immediate rollback required)
- High risks (🟠 staged rollback, investigation)
- Medium risks (🟡 document, continue)
- Low risks (🟢 note and proceed)
- Mitigation strategies
- Emergency contacts

**Time to Read:** 20-30 minutes

---

### 6. [Execution Timeline](./05-EXECUTION-TIMELINE.md)
Day-by-day schedule with specific execution windows.

**Key Sections:**
- Day 1: Investigation & Send-As Fix (1.5 hours)
- Day 2: Ownership Transfer & OAuth Migration (5 hours)
- Day 3-4: Cleanup (1 hour)
- Day 7: Follow-up review (30 min)
- Day 30: Final review & ryanowen80 removal (30 min)
- Success criteria
- Post-migration celebration checklist

**Time to Read:** 20-30 minutes

---

## 🎯 Quick Reference

### Current State (Before Migration)

| Resource | Owner | Status |
|----------|-------|--------|
| ROM_FINACIALS_MASTER | ❓ Unknown | 🔴 Needs verification |
| ROM_INVOICE_TEMPLATE_test | ryanowen80@gmail.com | 🔴 Needs transfer |
| ROM_INVOICES_test folder | ryanowen80@gmail.com | 🔴 Needs transfer |
| ROMwebsite2026_data (staging) | ryan.owen@ | ✅ Already correct |
| Apps Script execution account | ❓ Unknown | 🔴 Needs verification |
| Gmail send-as | ❌ Not configured | 🔴 Critical issue |

---

### Target State (After Migration)

| Resource | Owner | Bardo Access | ryanowen80 Access |
|----------|-------|-------------|------------------|
| ROM_FINACIALS_MASTER | ryan.owen@ | ✏️ Editor | 👁️ Viewer (temp) |
| ROM_INVOICE_TEMPLATE_test | ryan.owen@ | ✏️ Editor | 👁️ Viewer (temp) |
| ROM_INVOICES_test folder | ryan.owen@ | ✏️ Editor | 👁️ Viewer (temp) |
| ROMwebsite2026_data | ryan.owen@ | ✏️ Editor | ❌ None |
| Apps Script execution | ryan.owen@ | ✏️ Can edit code | 👁️ Can view code |
| Gmail send-as | ✅ Configured | ❌ Not needed | ❌ Not needed |
| gog CLI auth | ryan.owen@ (primary) | bardo@ (secondary) | ❌ None |
| clasp auth | ryan.owen@ (primary) | bardo@ (backup) | ❌ None |

---

## ⏱️ Time Commitment

**Total Time:** ~7.5 hours (spread over 3-4 days)  
**Total Downtime:** ~30 minutes (during Apps Script redeployment on Day 2)

**Breakdown:**
- Day 1: 1.5 hours (investigation + send-as fix)
- Day 2: 5 hours (ownership transfer + OAuth migration)
- Day 3-4: 1 hour (cleanup)
- Day 7: 30 minutes (follow-up review)
- Day 30: 30 minutes (final review)

---

## 🚦 Pre-Migration Checklist

Before starting Phase 0, verify:

- [ ] Ryan has read all 6 documents
- [ ] Ryan understands the risks (see Risk Assessment)
- [ ] Ryan has login credentials for:
  - [ ] ryanowen80@gmail.com
  - [ ] ryan.owen@ryanowenphotography.com
- [ ] Ryan can access Gmail, Drive, Sheets for both accounts
- [ ] Bardo is available for technical support during migration
- [ ] Ryan has scheduled time windows:
  - [ ] Day 1: 1.5 hours (anytime)
  - [ ] Day 2: 5 hours (4 PM - 11 PM EDT, with downtime at 9 PM)
  - [ ] Day 3-4: 1 hour (anytime)
- [ ] Ryan approves proceeding with migration

**Once all boxes checked:** Proceed to `05-EXECUTION-TIMELINE.md` → Day 1 execution.

---

## 🆘 Emergency Contacts

### If Critical Issue Occurs During Migration

1. **Stop all production changes immediately**
2. **Contact Bardo** (available via Telegram, OpenClaw chat)
3. **Follow rollback procedures** (documented in each phase)
4. **Document incident** in MIGRATION-LOG.md

### Rollback Time Estimates

| Scenario | Rollback Time |
|----------|--------------|
| Send-as configuration fails | 15-30 minutes |
| Apps Script binding breaks | 30 minutes - 2 hours |
| OAuth tokens revoked | 10-20 minutes |
| File ownership issues | 5-15 minutes |
| Data corruption | 15-30 minutes (restore from backup) |

---

## 📝 Documents to Create During Migration

As you execute the migration, create these additional documents:

1. **INVESTIGATION-RESULTS.md** (Phase 0)
   - Findings from account verification
   - Current ownership status
   - Send-as configuration details

2. **MIGRATION-LOG.md** (All Phases)
   - Timestamped log of each action
   - Success/failure of each step
   - Issues encountered and resolutions

3. **TEST-RESULTS.md** (Phases 1-3)
   - Results of each test invoice
   - Screenshots of emails received
   - Verification of PDF content

4. **LEGACY-ACCESS-STRATEGY.md** (Phase 4)
   - ryanowen80@ retention plan
   - Emergency recovery procedures

5. **POST-MIGRATION-CONFIG.md** (After Phase 4)
   - Final permission matrix
   - OAuth account mappings
   - File ownership roster

6. **WEEK1-REVIEW.md** (Day 7)
   - Issues discovered in first week
   - Resolutions
   - Recommendations

7. **MONTH1-REVIEW.md** (Day 30)
   - Long-term stability assessment
   - Decision on ryanowen80@ removal
   - Lessons learned

---

## 🎯 Success Criteria

Migration is **COMPLETE** when:

### Technical Criteria
- [ ] All files owned by ryan.owen@ryanowenphotography.com
- [ ] Apps Script runs as ryan.owen@ryanowenphotography.com
- [ ] Emails send from ryan@ryanowenphotography.com (no errors)
- [ ] Invoice workflow works end-to-end (staging & production)
- [ ] OAuth credentials migrated (gog, clasp, n8n)
- [ ] Bardo has Editor access (not Owner)
- [ ] ryanowen80@ downgraded or removed

### Testing Criteria
- [ ] Send-as email tested successfully
- [ ] Invoice generation tested on staging sheet
- [ ] PDF creation verified
- [ ] Email delivery verified (Bardo received test emails)
- [ ] QR codes visible in emails
- [ ] Sheet updates confirmed (InvoiceNumber, InvoiceStatus, etc.)
- [ ] n8n webhook tested and working

### Documentation Criteria
- [ ] All 7 execution documents created
- [ ] MIGRATION-LOG.md complete
- [ ] POST-MIGRATION-CONFIG.md published
- [ ] README files updated
- [ ] Troubleshooting guides updated

### Business Criteria
- [ ] No production outage longer than 30 minutes
- [ ] No customer-facing issues
- [ ] No data loss
- [ ] Ryan can operate independently (no Bardo required)
- [ ] System stable for 30 days

---

## 📞 Questions for Ryan (Answer Before Starting)

1. **Do you have login access to both accounts?**
   - ryanowen80@gmail.com: Yes / No
   - ryan.owen@ryanowenphotography.com: Yes / No

2. **Are you comfortable with a 30-minute production downtime on Day 2?**
   - Preferred time window: _______________ EDT
   - Acceptable backup time: _______________ EDT

3. **Do you want to keep ryanowen80@ Viewer access after migration?**
   - Yes, for 3 months (conservative, recommended)
   - Yes, for 1 month (moderate)
   - No, remove immediately after testing (aggressive)

4. **Do you want Bardo to execute technical steps, or do you want to do them yourself?**
   - Bardo executes (Ryan observes, learns) — Recommended
   - Ryan executes (Bardo guides via Telegram)
   - Mix (Ryan does Google UI, Bardo does CLI)

5. **How risk-averse are you?**
   - Very cautious (test everything twice, long rollback windows)
   - Balanced (test once, proceed if successful)
   - Confident (Ryan's preference: "Get it working first")

6. **Are you available for Day 7 and Day 30 reviews?**
   - Day 7 (Apr 2): Yes / No / Reschedule to: ___________
   - Day 30 (Apr 26): Yes / No / Reschedule to: ___________

---

## 🎉 Post-Migration

### After successful completion:

1. **Archive these docs:**
   ```
   mv docs/account-migration docs/archive/account-migration-2026-03
   ```

2. **Create summary for future reference:**
   - What we did
   - Why we did it
   - Lessons learned

3. **Update main README:**
   - Document new account structure
   - Update troubleshooting guides

4. **Celebrate!** 🎉
   - Ryan now has full ownership and control
   - Bardo has appropriate support access
   - ryanowen80@ phased out gracefully

---

## 📖 Additional Resources

### Related Documentation

- [Apps Script Review](../APPS-SCRIPT-REVIEW.md) — Detailed analysis of invoice system
- [Invoice Testing Plan](../INVOICE-TESTING-PLAN.md) — Testing strategy for invoice workflows
- [File IDs](../testing-results/FILE_IDS.md) — Google Drive file and folder IDs

### External References

- [Google Workspace Admin Help](https://support.google.com/a/answer/7664184?hl=en) — Transfer file ownership
- [Apps Script Documentation](https://developers.google.com/apps-script) — Apps Script API reference
- [Gmail Send-As Guide](https://support.google.com/mail/answer/22370?hl=en) — Configure send-as aliases
- [clasp Documentation](https://github.com/google/clasp) — Apps Script CLI tool

---

## 📋 Status Tracking

| Phase | Status | Start Date | End Date | Notes |
|-------|--------|-----------|----------|-------|
| **Planning** | ✅ Complete | 2026-03-26 | 2026-03-26 | All docs created |
| **Phase 0** | ⏳ Pending | — | — | Awaiting Ryan's approval |
| **Phase 1** | ⏳ Pending | — | — | — |
| **Phase 2** | ⏳ Pending | — | — | — |
| **Phase 3** | ⏳ Pending | — | — | — |
| **Phase 4** | ⏳ Pending | — | — | — |
| **Day 7 Review** | ⏳ Pending | — | — | — |
| **Day 30 Review** | ⏳ Pending | — | — | — |

Update this table as you progress through each phase.

---

**Status:** Documentation complete. Ready for Ryan's review and approval.

**Next Step:** Ryan reads these documents, answers questions above, and approves proceeding to Day 1 execution.

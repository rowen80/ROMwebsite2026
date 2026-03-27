# ROM Account Migration — Step-by-Step Plan

**Date:** 2026-03-26  
**Analyst:** Leo (ROM Automation Specialist)  
**Approach:** Incremental, tested, reversible

---

## 🎯 Migration Philosophy

**Ryan's Preference:**
> "Get it working first, THEN understand why — prefers working systems over educational experiments during troubleshooting."

**Leo's Principles:**
1. **Test everything on staging before production**
2. **One change at a time, verify each step**
3. **Always have a rollback plan**
4. **Production downtime only if absolutely necessary**
5. **Document as we go**

---

## 📊 Phase Overview

| Phase | Goal | Risk | Estimated Time | Downtime |
|-------|------|------|----------------|----------|
| **Phase 0** | Investigation & Verification | 🟢 Low | 30 minutes | None |
| **Phase 1** | Fix Send-As Email (Immediate) | 🟡 Medium | 1 hour | None |
| **Phase 2** | Transfer File Ownership | 🟡 Medium | 2 hours | Minimal |
| **Phase 3** | Migrate OAuth Credentials | 🟠 High | 3 hours | 30 min |
| **Phase 4** | Cleanup & Phase Out ryanowen80 | 🟢 Low | 1 hour | None |

**Total Estimated Time:** 7.5 hours (spread over 2-3 days)  
**Total Downtime:** ~30 minutes (during Apps Script redeployment)

---

## Phase 0: Investigation & Verification
### Estimated Time: 30 minutes | Downtime: None

**Goal:** Answer all critical unknowns before making changes

### Step 0.1: Verify Google Accounts Structure

**Ryan Actions:**
1. Log in to https://accounts.google.com with each account:
   - `ryanowen80@gmail.com`
   - `ryan.owen@ryanowenphotography.com`

2. For each account, check:
   - ✅ Can you access Gmail?
   - ✅ Can you access Drive?
   - ✅ Can you access Sheets?

3. Note which account has 2FA enabled

**Expected Outcome:**
- Confirm ryan.owen@ryanowenphotography.com is a full Workspace account
- Verify Ryan has login credentials for both accounts

---

### Step 0.2: Check Gmail Send-As Configuration

**Ryan Actions:**
1. Log in to Gmail as `ryanowen80@gmail.com`
2. Go to Settings (⚙️) → See all settings → Accounts and Import
3. Check "Send mail as" section:
   - ✅ Is `ryan@ryanowenphotography.com` listed?
   - ✅ If yes, is it verified?

4. Repeat for `ryan.owen@ryanowenphotography.com`:
   - Check if `ryan@ryanowenphotography.com` is an alias or the primary address
   - Check "Send mail as" section

**Expected Outcome:**
- Determine if ryan@ is an alias or separate account
- Identify which account needs send-as configuration

**Rollback:** N/A (read-only investigation)

---

### Step 0.3: Verify ROM_FINACIALS_MASTER Ownership

**Ryan Actions:**
1. Open ROM_FINACIALS_MASTER in browser
2. Right-click → Share → See who has access
3. Note the owner's email address

**Expected Outcome:**
- Confirm current owner (likely ryanowen80@gmail.com)
- Verify all three accounts have access

**Rollback:** N/A (read-only)

---

### Step 0.4: Check Apps Script Execution Account

**Ryan Actions:**
1. Open ROM_FINACIALS_MASTER sheet
2. Go to Extensions → Apps Script
3. Click Project Settings (⚙️ icon, left sidebar)
4. Check "Execution account" section
5. Note which email is listed

**Expected Outcome:**
- Identify which account runs the script
- This is the account that needs send-as configured

**Rollback:** N/A (read-only)

---

### Step 0.5: Locate QR Code Files

**Ryan Actions:**
1. Open Google Drive
2. Search for: `ZelleQr.jpg`
3. Search for: `VenmoQr.jpg`
4. For each file:
   - Right-click → Get link
   - Note the file ID (in the URL)
   - Right-click → Share → Check owner

**Expected Outcome:**
- Confirm both files exist
- Note current owner and location
- Get file IDs for hardcoding in script (Phase 2 improvement)

**Rollback:** N/A (read-only)

---

### Step 0.6: Check n8n Google Account

**Bardo Actions:**
1. Log in to https://rom-n8n.onrender.com
2. Navigate to Credentials
3. Check which Google OAuth credentials are configured
4. Note the email address

**Expected Outcome:**
- Identify which Google account n8n uses
- Determine if it needs migration

**Rollback:** N/A (read-only)

---

### ✅ Phase 0 Completion Checklist

- [ ] Confirmed ryan.owen@ryanowenphotography.com account exists
- [ ] Identified send-as configuration status
- [ ] Verified ROM_FINACIALS_MASTER ownership
- [ ] Identified Apps Script execution account
- [ ] Located QR code files (ZelleQr.jpg, VenmoQr.jpg)
- [ ] Verified n8n Google account
- [ ] Documented findings in `INVESTIGATION-RESULTS.md`

**Proceed to Phase 1 only after all items checked.**

---

## Phase 1: Fix Send-As Email (Immediate)
### Estimated Time: 1 hour | Downtime: None

**Goal:** Enable invoice emails to send from ryan@ryanowenphotography.com

**Prerequisites:**
- Phase 0 complete
- Identified which account runs Apps Script
- Confirmed ryan@ryanowenphotography.com address structure

---

### Scenario A: ryan@ is an alias of ryan.owen@

**If ryan@ryanowenphotography.com is an alias:**

**Step 1.A.1: Configure Send-As in Execution Account**

**Ryan Actions:**
1. Log in to Gmail as the Apps Script execution account (from Phase 0.4)
2. Go to Settings → Accounts and Import → Send mail as
3. Click "Add another email address"
4. Enter:
   - Name: Ryan Owen Photography
   - Email: ryan@ryanowenphotography.com
   - ☑ Treat as an alias
5. Click Next → Send verification
6. Check inbox for verification email
7. Click verification link
8. Set as default: Click "make default" next to ryan@ryanowenphotography.com

**Expected Outcome:**
- Send-as alias configured and verified
- Apps Script can now send from ryan@ryanowenphotography.com

**Test:**
```javascript
// In Apps Script editor, create test function:
function testSendAs() {
  GmailApp.sendEmail(
    "bardo.faraday@gmail.com",  // To
    "Test Send-As",               // Subject
    "If you see this, send-as is working!", // Body
    {
      from: "ryan@ryanowenphotography.com",
      name: "Ryan Owen Photography"
    }
  );
}
```

**Rollback:**
- Remove send-as alias from Settings → Accounts
- No data loss risk

---

### Scenario B: Execution account IS ryan.owen@

**If Apps Script already runs as ryan.owen@ryanowenphotography.com:**

**Step 1.B.1: No Send-As Needed**

The script sends from its own address — no alias required.

**Test:**
```javascript
// In Apps Script editor:
function testSendAs() {
  GmailApp.sendEmail(
    "bardo.faraday@gmail.com",
    "Test Send-As",
    "Sending from ryan.owen@ directly"
  );
}
```

**If this works:** Phase 1 complete!  
**If this fails:** Check Gmail API enablement, OAuth scopes

---

### Step 1.2: Test Invoice Email on Staging Sheet

**Ryan Actions:**
1. Open ROMwebsite2026_data staging sheet
2. Verify test data exists in row 3-5
3. Run: ROM Ops → Invoice Only → By Company
4. Select a test company
5. Enable **Preview Mode** (no actual send)
6. Review generated invoice PDF
7. **Disable Preview Mode**
8. Run again → Send actual email to Bardo

**Expected Outcome:**
- PDF generated successfully
- Email received by Bardo with invoice attached
- No errors about send-as

**Rollback:**
- If fails, revert send-as configuration
- No production data affected (using staging sheet)

---

### ✅ Phase 1 Completion Checklist

- [ ] Send-as alias configured (if needed)
- [ ] Send-as verified
- [ ] Test email sent successfully
- [ ] Invoice generated on staging sheet
- [ ] Bardo received test invoice email
- [ ] No errors in Apps Script execution log

**Proceed to Phase 2 after successful testing.**

---

## Phase 2: Transfer File Ownership
### Estimated Time: 2 hours | Downtime: Minimal (5-10 minutes per file)

**Goal:** Transfer ownership of all production files to ryan.owen@

**Risk:** 🟡 Medium — Apps Script binding could break if not done carefully

---

### Step 2.1: Transfer Invoice Template Ownership

**File:** ROM_INVOICE_TEMPLATE_test (ID: `12BCu044gKreQOVl_Wc_SeWa4I8HDBnwItmAKzqhokuI`)  
**Current Owner:** ryanowen80@gmail.com  
**Target Owner:** ryan.owen@ryanowenphotography.com

**Ryan Actions (logged in as ryanowen80@gmail.com):**
1. Open the doc: https://docs.google.com/document/d/12BCu044gKreQOVl_Wc_SeWa4I8HDBnwItmAKzqhokuI/edit
2. Click Share (top-right)
3. In the share dialog:
   - Add `ryan.owen@ryanowenphotography.com` as Editor (if not already)
   - Click Advanced (bottom-left)
   - Next to ryan.owen@, click dropdown → Change to "Owner"
   - Click "Save changes"
   - Confirm transfer in popup

4. Verify:
   - Refresh the page
   - Check Share dialog → ryan.owen@ should now be Owner
   - ryanowen80@ should now be Editor

5. Downgrade Bardo (if needed):
   - If bardo.faraday@ became Owner during transfer, change to Editor

**Expected Outcome:**
- Owner: ryan.owen@ryanowenphotography.com
- Editor: ryanowen80@gmail.com
- Editor: bardo.faraday@gmail.com
- Writer: ryan@ryanowenphotography.com (if separate account)

**Test:**
1. Log in as ryan.owen@ryanowenphotography.com
2. Open the template doc
3. Make a minor edit (add a space, remove it)
4. Verify you can edit

**Rollback:**
- Transfer ownership back to ryanowen80@gmail.com
- Apps Script should still work (accesses by name, not ownership)

---

### Step 2.2: Transfer Invoice Folder Ownership

**Folder:** ROM_INVOICES_test (ID: `1HqX-2vXNlgWtGzRP6N_RFZbTmk0T3cM3`)  
**Current Owner:** ryanowen80@gmail.com  
**Target Owner:** ryan.owen@ryanowenphotography.com

**Ryan Actions (logged in as ryanowen80@gmail.com):**
1. Open Google Drive
2. Locate ROM_INVOICES_test folder
3. Right-click → Share
4. Add ryan.owen@ryanowenphotography.com as Editor (if not already)
5. Click Advanced → Change ryan.owen@ to Owner
6. **Important:** Check "Notify people" checkbox
7. Click Save changes → Confirm transfer

8. Verify child files:
   - Open the folder
   - Right-click any invoice PDF → Share
   - Verify ryan.owen@ is now owner (inherited)

**Expected Outcome:**
- Folder owner: ryan.owen@ryanowenphotography.com
- All child invoice PDFs also owned by ryan.owen@
- bardo.faraday@ has Editor access

**Test:**
1. Log in as ryan.owen@
2. Open ROM_INVOICES_test folder
3. Create a test file (right-click → Google Docs → Blank)
4. Verify you can create files

**Rollback:**
- Transfer folder ownership back to ryanowen80@
- Child files will inherit original ownership

---

### Step 2.3: Transfer ROM_FINACIALS_MASTER Ownership

**Sheet:** ROM_FINACIALS_MASTER (ID: `1tpIAPqv1Hbg5Kttx-zVVFSp2dckoHe8YxSw3XytmlN0`)  
**Current Owner:** (verified in Phase 0.3)  
**Target Owner:** ryan.owen@ryanowenphotography.com

**⚠️ CRITICAL:** This sheet has a bound Apps Script. Ownership transfer could break the script binding.

**Pre-Transfer Backup:**
1. Make a copy of the sheet (File → Make a copy → name: "ROM_FINACIALS_MASTER_BACKUP_2026-03-26")
2. Store backup in safe location
3. Document the backup file ID

**Ryan Actions (logged in as current owner):**
1. Open ROM_FINACIALS_MASTER
2. Click Share (top-right)
3. Add ryan.owen@ryanowenphotography.com as Editor (if not already)
4. Click Advanced → Change ryan.owen@ to Owner
5. **WAIT** — Don't click Save yet!

6. **Verify Apps Script will survive:**
   - Open new tab → Extensions → Apps Script
   - Note the Script ID (URL: ...script.google.com/.../**scriptId**/...)
   - Keep this tab open

7. Return to Share dialog → Click Save changes → Confirm transfer

8. **Immediately verify Apps Script:**
   - Refresh the Apps Script tab
   - Verify you can still see the code
   - Go to Project Settings → Check execution account (should still work)

**Expected Outcome:**
- Owner: ryan.owen@ryanowenphotography.com
- Apps Script still bound and functional
- All editors retain access

**Test (CRITICAL):**
1. Open ROM_FINACIALS_MASTER as ryan.owen@
2. Go to Extensions → Apps Script
3. Run a simple function: `onOpen()`
4. Verify menu appears
5. **Do NOT run actual invoice functions yet** (wait for Phase 3)

**Rollback (If Apps Script Breaks):**
1. Transfer ownership back to original owner
2. Restore from backup if needed
3. Rebind Apps Script:
   ```bash
   cd ~/lab/projects/rom/website-lab/romwebsite2026/apps-script
   clasp push
   ```

---

### Step 2.4: Transfer QR Code Files Ownership

**Files:** ZelleQr.jpg, VenmoQr.jpg  
**Current Owner:** (discovered in Phase 0.5)  
**Target Owner:** ryan.owen@ryanowenphotography.com

**Ryan Actions (logged in as current owner):**
1. Open Google Drive
2. Locate ZelleQr.jpg
3. Right-click → Share → Advanced → Transfer ownership to ryan.owen@
4. Repeat for VenmoQr.jpg

**Expected Outcome:**
- Both files owned by ryan.owen@ryanowenphotography.com
- Apps Script can still access them

**Test:**
- Run invoice function on staging sheet
- Verify QR codes appear in email

**Rollback:**
- Transfer back to original owner
- No production impact

---

### ✅ Phase 2 Completion Checklist

- [ ] ROM_INVOICE_TEMPLATE_test ownership transferred
- [ ] ROM_INVOICES_test folder ownership transferred
- [ ] ROM_FINACIALS_MASTER ownership transferred
- [ ] Apps Script still functional after transfer
- [ ] QR code files ownership transferred
- [ ] Backup of ROM_FINACIALS_MASTER created
- [ ] All editors still have access
- [ ] Test invoice run on staging sheet successful

**Proceed to Phase 3 only if all tests pass.**

---

## Phase 3: Migrate OAuth Credentials
### Estimated Time: 3 hours | Downtime: 30 minutes

**Goal:** Migrate clasp and gog authentication to ryan.owen@

**Risk:** 🟠 High — Could break development workflows temporarily

---

### Step 3.1: Authenticate gog CLI as ryan.owen@

**Bardo Actions:**
1. Add ryan.owen@ authentication:
   ```bash
   gog auth add ryan.owen@ryanowenphotography.com --services drive,sheets,gmail
   ```

2. Browser opens → Log in as ryan.owen@ryanowenphotography.com

3. Grant permissions:
   - ✅ View and manage Google Drive files
   - ✅ View and manage Google Sheets
   - ✅ Send email on your behalf (Gmail)

4. Verify authentication:
   ```bash
   gog --account ryan.owen@ryanowenphotography.com drive ls
   ```

5. Test access to production sheet:
   ```bash
   gog --account ryan.owen@ryanowenphotography.com sheets get 1tpIAPqv1Hbg5Kttx-zVVFSp2dckoHe8YxSw3XytmlN0 "SETTINGS!B1"
   ```

**Expected Outcome:**
- ryan.owen@ authenticated in gog
- Can access Drive and Sheets
- bardo@ authentication still works (kept for dev)

**Rollback:**
```bash
# Remove ryan.owen auth if issues arise
gog auth remove ryan.owen@ryanowenphotography.com
```

---

### Step 3.2: Authenticate clasp as ryan.owen@

**Bardo Actions:**
1. Back up current clasp credentials:
   ```bash
   cp ~/.clasprc.json ~/.clasprc.json.backup.bardo
   ```

2. Log out current account:
   ```bash
   clasp logout
   ```

3. **PRODUCTION DOWNTIME STARTS HERE** ⏱️

4. Log in as ryan.owen@:
   ```bash
   clasp login
   ```

5. Browser opens → Log in as ryan.owen@ryanowenphotography.com

6. Grant permissions:
   - ✅ View and manage Apps Script projects
   - ✅ View and manage Google Drive files

7. Verify authentication:
   ```bash
   clasp whoami
   # Should show: ryan.owen@ryanowenphotography.com
   ```

8. Test access to script project:
   ```bash
   cd ~/lab/projects/rom/website-lab/romwebsite2026/apps-script
   clasp open
   # Should open the script in browser
   ```

**Expected Outcome:**
- clasp authenticated as ryan.owen@
- Can access Apps Script project
- Ready to deploy

**Rollback:**
```bash
# Restore Bardo's credentials
cp ~/.clasprc.json.backup.bardo ~/.clasprc.json
clasp whoami  # Should show bardo.faraday@gmail.com
```

---

### Step 3.3: Deploy Apps Script as ryan.owen@

**Bardo Actions:**
1. Pull latest code (verify no conflicts):
   ```bash
   cd ~/lab/projects/rom/website-lab/romwebsite2026/apps-script
   clasp pull
   ```

2. Review changes (if any):
   ```bash
   git diff Code.js
   ```

3. Push code (redeploy with ryan.owen@ as execution account):
   ```bash
   clasp push
   ```

4. **PRODUCTION DOWNTIME ENDS HERE** ⏱️ (~10-30 minutes total)

5. Verify deployment:
   - Open ROM_FINACIALS_MASTER sheet
   - Refresh page
   - Check Extensions → Apps Script
   - Go to Project Settings → Execution account
   - Should now show: ryan.owen@ryanowenphotography.com

**Expected Outcome:**
- Apps Script now runs as ryan.owen@
- Send-as should work automatically (if ryan.owen@ owns ryan@ alias)
- All functions accessible from sheet menu

**Test (CRITICAL):**
1. Open ROMwebsite2026_data staging sheet
2. Run: ROM Ops → Invoice Only → By Company
3. Select test company
4. **Preview Mode OFF** → Send real test invoice to Bardo
5. Verify:
   - PDF generated
   - Email sent from ryan@ryanowenphotography.com
   - Email received by Bardo
   - QR codes visible in email

**Rollback:**
```bash
# Restore Bardo's clasp auth
cp ~/.clasprc.json.backup.bardo ~/.clasprc.json

# Redeploy as Bardo
cd ~/lab/projects/rom/website-lab/romwebsite2026/apps-script
clasp push
```

---

### Step 3.4: Update n8n Google Account (If Needed)

**Bardo Actions:**
1. Log in to https://rom-n8n.onrender.com
2. Navigate to Credentials
3. Find Google OAuth credential
4. Click "..." → Edit

5. If credential is not ryan.owen@:
   - Delete existing credential
   - Create new: Credentials → Add Credential → Google OAuth2 API
   - Name: "Google - Ryan Owen"
   - Authenticate as ryan.owen@ryanowenphotography.com
   - Grant permissions: Drive, Sheets

6. Update workflow:
   - Open "ROM Request Intake" workflow
   - Click Google Sheets node
   - Select credential: "Google - Ryan Owen"
   - Save workflow

7. Test webhook:
   ```bash
   cd ~/lab/projects/rom/website-lab/romwebsite2026
   ./test-booking.sh
   ```

**Expected Outcome:**
- n8n uses ryan.owen@ for Sheets access
- Webhook still writes to staging sheet
- No errors in n8n execution log

**Rollback:**
- Restore previous credential in n8n
- Workflow should continue working with old account

---

### ✅ Phase 3 Completion Checklist

- [ ] gog authenticated as ryan.owen@
- [ ] clasp authenticated as ryan.owen@
- [ ] Apps Script redeployed as ryan.owen@
- [ ] Test invoice sent successfully from staging sheet
- [ ] n8n credential updated (if needed)
- [ ] Webhook test successful
- [ ] bardo@ authentication still works (for dev)
- [ ] No errors in production workflows

**Proceed to Phase 4 after all tests pass.**

---

## Phase 4: Cleanup & Phase Out ryanowen80
### Estimated Time: 1 hour | Downtime: None

**Goal:** Remove ryanowen80@ from production workflows

**Risk:** 🟢 Low — ryanowen80@ should no longer be critical after Phase 2-3

---

### Step 4.1: Audit ryanowen80@ Permissions

**Bardo Actions:**
```bash
# Check Drive files owned by ryanowen80@
gog drive search "owner:ryanowen80@gmail.com" --json | jq -r '.files[] | .name'

# Check Sheets with ryanowen80@ access
gog drive search "type:spreadsheet" --json | jq -r '.files[] | select(.permissions[]?.emailAddress == "ryanowen80@gmail.com") | .name'
```

**Expected Outcome:**
- List of files still owned by or shared with ryanowen80@
- Most should now be owned by ryan.owen@ after Phase 2

---

### Step 4.2: Remove ryanowen80@ Writer Access from Staging Sheet

**Ryan Actions:**
1. Open ROMwebsite2026_data staging sheet
2. Click Share
3. Find ryanowen80@gmail.com → Click "X" (remove)
4. Click Done

**Expected Outcome:**
- ryanowen80@ no longer has access to staging sheet
- Only ryan.owen@ (owner) and bardo@ (editor) have access

**Test:**
- Try opening sheet as ryanowen80@ (should fail)
- Webhook should still work (uses n8n's OAuth, not ryanowen80@)

**Rollback:**
- Re-add ryanowen80@ as Editor

---

### Step 4.3: Downgrade ryanowen80@ on Production Files

**Ryan Actions:**
For each file where ryanowen80@ still has Editor access:

1. ROM_INVOICE_TEMPLATE_test:
   - Share → ryanowen80@ → Change to "Viewer"

2. ROM_INVOICES_test folder:
   - Share → ryanowen80@ → Change to "Viewer"

3. ROM_FINACIALS_MASTER:
   - Share → ryanowen80@ → Change to "Viewer"

**Rationale:**
- Keep Viewer access for emergency recovery
- Remove editing capability

**Expected Outcome:**
- ryanowen80@ can view but not edit production files
- ryan.owen@ is Owner
- bardo@ is Editor

**Test:**
- Log in as ryanowen80@
- Try to edit ROM_FINACIALS_MASTER → Should be read-only

**Rollback:**
- Change ryanowen80@ back to Editor if needed

---

### Step 4.4: Document Legacy Access Strategy

**Bardo Actions:**
Create file: `~/lab/projects/rom/website-lab/romwebsite2026/docs/account-migration/LEGACY-ACCESS-STRATEGY.md`

**Contents:**
```markdown
# ryanowen80@gmail.com - Legacy Access Strategy

## Status: Phased Out (2026-03-26)

### Current Permissions
- **ROM_FINACIALS_MASTER:** Viewer
- **ROM_INVOICE_TEMPLATE_test:** Viewer
- **ROM_INVOICES_test folder:** Viewer
- **ROMwebsite2026_data:** No access

### Purpose of Retained Access
- Emergency recovery if ryan.owen@ account locked
- Historical context (original owner)
- Backup access during transition period

### Removal Timeline
- **Phase 4 (Now):** Downgraded to Viewer
- **Phase 5 (3 months):** Remove all access if no issues arise
- **Phase 6 (6 months):** Consider closing account

### Emergency Recovery Procedure
If ryan.owen@ becomes inaccessible:
1. Temporarily re-grant ryanowen80@ Editor access
2. Transfer ownership to new account
3. Remove ryanowen80@ access again
```

---

### ✅ Phase 4 Completion Checklist

- [ ] Audited ryanowen80@ permissions
- [ ] Removed ryanowen80@ from staging sheet
- [ ] Downgraded ryanowen80@ to Viewer on production files
- [ ] Documented legacy access strategy
- [ ] No production workflows rely on ryanowen80@ anymore

---

## 🎯 Final Verification & Go-Live

**Goal:** Confirm entire system works end-to-end with new account structure

### End-to-End Test: Production Invoice Workflow

**Ryan Actions:**
1. Open ROM_FINACIALS_MASTER (as ryan.owen@ryanowenphotography.com)
2. Select a real pending invoice (or use staging data)
3. Run: ROM Ops → Invoice Only → By Company
4. Select company
5. **Preview Mode ON** → Review PDF
6. **Preview Mode OFF** → Send real invoice to Bardo (test)
7. Verify email received with:
   - ✅ From: ryan@ryanowenphotography.com
   - ✅ PDF attached
   - ✅ QR codes visible
   - ✅ Correct line items

8. Check sheet updates:
   - ✅ InvoiceNumber assigned
   - ✅ InvoicedAt timestamp written
   - ✅ InvoiceStatus = "SENT"
   - ✅ InvoicePDFUrl populated

9. Verify INVOICES sheet:
   - ✅ New row created
   - ✅ Status = "SENT"

**Expected Outcome:**
- Entire workflow functions correctly
- All emails send from ryan@ryanowenphotography.com
- All files owned by ryan.owen@ryanowenphotography.com
- Bardo can still edit/troubleshoot

**If ALL tests pass:** Migration complete! 🎉

**If ANY test fails:** See rollback procedures in relevant phase section

---

## 🔄 Rollback Procedures

### Emergency: Restore Everything to Pre-Migration State

**If catastrophic failure occurs:**

1. **Restore clasp authentication (Bardo):**
   ```bash
   cp ~/.clasprc.json.backup.bardo ~/.clasprc.json
   cd ~/lab/projects/rom/website-lab/romwebsite2026/apps-script
   clasp push
   ```

2. **Transfer ownership back to ryanowen80@:**
   - ROM_FINACIALS_MASTER → ryanowen80@ (as Owner)
   - ROM_INVOICE_TEMPLATE_test → ryanowen80@ (as Owner)
   - ROM_INVOICES_test → ryanowen80@ (as Owner)

3. **Restore Bardo's gog as default:**
   ```bash
   gog config set default-account bardo.faraday@gmail.com
   ```

4. **Verify production sheet works:**
   - Open ROM_FINACIALS_MASTER
   - Run test invoice workflow
   - Confirm emails send (even if from wrong address)

5. **Document failure:**
   - Create `ROLLBACK-REPORT-YYYY-MM-DD.md`
   - Note which phase failed
   - Capture error messages
   - Plan revised approach

**Expected Recovery Time:** 15-30 minutes

---

## 📊 Success Criteria

Migration is considered **complete and successful** when:

- [ ] All files owned by ryan.owen@ryanowenphotography.com
- [ ] Apps Script runs as ryan.owen@ryanowenphotography.com
- [ ] Emails send from ryan@ryanowenphotography.com (no errors)
- [ ] Invoice workflow works end-to-end on staging sheet
- [ ] Invoice workflow tested (dry-run) on production sheet
- [ ] Bardo has Editor access to all files (not Owner)
- [ ] ryanowen80@ downgraded to Viewer or removed
- [ ] OAuth credentials migrated (gog, clasp, n8n)
- [ ] No production downtime longer than 30 minutes
- [ ] Rollback tested and documented
- [ ] All changes documented in `MIGRATION-LOG.md`

---

## 📝 Documentation to Create During Migration

1. **INVESTIGATION-RESULTS.md** (Phase 0)
   - Findings from account verification
   - Current ownership matrix
   - Send-as configuration status

2. **MIGRATION-LOG.md** (All Phases)
   - Timestamped log of each action
   - Success/failure of each step
   - Any issues encountered and resolutions

3. **TEST-RESULTS.md** (Phase 1, 2, 3)
   - Results of each test invoice
   - Screenshots of emails received
   - Verification of PDF content

4. **LEGACY-ACCESS-STRATEGY.md** (Phase 4)
   - ryanowen80@ retention plan
   - Emergency recovery procedures

5. **POST-MIGRATION-CONFIG.md** (Final)
   - Final permission matrix
   - OAuth account mappings
   - File ownership roster
   - Apps Script execution account

---

**Status:** Migration plan complete. Ready for Phase 0 execution after Ryan's review.

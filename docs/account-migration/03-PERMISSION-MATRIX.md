# ROM Permission Matrix — Target State

**Date:** 2026-03-26  
**Purpose:** Define final permission structure after migration

---

## 🎯 Philosophy

**ryan.owen@ = Primary Operator**
- Owns all production files
- Runs all automation (Apps Script, OAuth)
- Sends all customer emails

**bardo.faraday@ = Support Engineer**
- Editor access for troubleshooting
- Can modify files but not own them
- Can test workflows on staging resources

**ryanowen80@ = Legacy Access (Viewer Only)**
- Read-only access for emergency recovery
- Will be phased out entirely after 3-6 months

---

## 📊 Target Permission Matrix

### Google Sheets

| Resource | ryan.owen@ | bardo.faraday@ | ryanowen80@ |
|----------|-----------|---------------|------------|
| **ROM_FINACIALS_MASTER** (Production) | 👑 Owner | ✏️ Editor | 👁️ Viewer (temp) |
| **ROMwebsite2026_data** (Staging) | 👑 Owner | ✏️ Editor | ❌ None |
| **Trade Tracker - 2026** | 👁️ Viewer (optional) | 👑 Owner | ❌ None |

**Notes:**
- ROM_FINACIALS_MASTER: Critical production sheet
- ROMwebsite2026_data: Testing/staging only, no customer data
- Trade Tracker: Bardo's personal finance tracking (not ROM-related)

---

### Google Docs (Templates)

| Resource | ryan.owen@ | bardo.faraday@ | ryanowen80@ |
|----------|-----------|---------------|------------|
| **ROM_INVOICE_TEMPLATE_test** | 👑 Owner | ✏️ Editor | 👁️ Viewer (temp) |
| **_TEST_ROM_INVOICE_TEMPLATE** (Bardo's copy) | ✏️ Editor (optional) | 👑 Owner | ❌ None |

**Notes:**
- ROM_INVOICE_TEMPLATE_test: Production template
- _TEST_ROM_INVOICE_TEMPLATE: Bardo's testing sandbox

---

### Google Drive Folders

| Resource | ryan.owen@ | bardo.faraday@ | ryanowen80@ |
|----------|-----------|---------------|------------|
| **ROM_INVOICES_test** (Invoice PDFs) | 👑 Owner | ✏️ Editor | 👁️ Viewer (temp) |
| **ROM_INVOICES** (Production, if separate) | 👑 Owner | ✏️ Editor | 👁️ Viewer (temp) |
| **Bardo** (Dev folder) | ✏️ Editor (optional) | 👑 Owner | ❌ None |

**Child File Inheritance:**
- All invoice PDFs in ROM_INVOICES folders inherit folder permissions
- New PDFs created by Apps Script will be owned by ryan.owen@

---

### Drive Files (QR Codes, Images)

| Resource | ryan.owen@ | bardo.faraday@ | ryanowen80@ |
|----------|-----------|---------------|------------|
| **ZelleQr.jpg** | 👑 Owner | ✏️ Editor | ❌ None |
| **VenmoQr.jpg** | 👑 Owner | ✏️ Editor | ❌ None |

**Notes:**
- Apps Script embeds these in invoice emails
- Should be owned by execution account (ryan.owen@)

---

### Apps Script Projects

| Resource | Execution Account | Deployment Access | Viewer Access |
|----------|------------------|-------------------|--------------|
| **ROM Invoice System** (bound to ROM_FINACIALS_MASTER) | ryan.owen@ | ryan.owen@, bardo@ | ryanowen80@ (temp) |

**Permissions:**
- **Execution Account:** ryan.owen@ryanowenphotography.com
  - Script runs with this account's permissions
  - Accesses Drive, Sheets, Gmail as ryan.owen@
  
- **Deployment Access:** Who can edit and deploy the script
  - ryan.owen@ (owner of parent sheet)
  - bardo@ (editor of parent sheet → can view/edit script)
  
- **Viewer Access:** Who can view code but not edit
  - ryanowen80@ (viewer of parent sheet → can view script)

**Apps Script OAuth Scopes:**
- `https://www.googleapis.com/auth/spreadsheets` (read/write sheets)
- `https://www.googleapis.com/auth/documents` (read/write docs)
- `https://www.googleapis.com/auth/drive` (create files, access folders)
- `https://www.googleapis.com/auth/gmail.send` (send email)

---

## 🔑 OAuth Credentials & CLI Tools

### gog CLI (Google API Access)

| Account | Purpose | Status |
|---------|---------|--------|
| ryan.owen@ryanowenphotography.com | 👑 Primary (production operations) | ✅ Target |
| bardo.faraday@gmail.com | ✏️ Secondary (dev/testing) | ✅ Retained |

**Usage:**
```bash
# Production operations (default)
gog --account ryan.owen@ryanowenphotography.com drive ls

# Development/testing
gog --account bardo.faraday@gmail.com drive ls
```

**Token Storage:**
- macOS: Keychain
- Linux: Secret Service API
- File: `~/.config/gog/tokens` (encrypted)

---

### clasp (Apps Script CLI)

| Account | Purpose | Status |
|---------|---------|--------|
| ryan.owen@ryanowenphotography.com | 👑 Primary (deploy production scripts) | ✅ Target |
| bardo.faraday@gmail.com | ✏️ Backup (dev/testing) | ⚠️ Available but not default |

**Usage:**
```bash
# Primary deployment (ryan.owen@)
clasp push

# Switch to Bardo for testing (if needed)
clasp logout
clasp login  # Log in as bardo@
clasp push   # Deploy as Bardo (test only)
```

**Token Storage:**
- File: `~/.clasprc.json`
- Contains: OAuth refresh token, client ID/secret

**Backup Strategy:**
- Keep Bardo's tokens backed up: `~/.clasprc.json.backup.bardo`
- Can switch accounts quickly if ryan.owen@ unavailable

---

### n8n (Render Webhook Service)

| Account | Purpose | Status |
|---------|---------|--------|
| ryan.owen@ryanowenphotography.com | 👑 Primary (Google Sheets OAuth) | ✅ Target |
| bardo.faraday@gmail.com | ✏️ Backup (if ryan.owen@ fails) | ⚠️ Available |

**Credential Configuration:**
- Platform: n8n (https://rom-n8n.onrender.com)
- Credential Name: "Google - Ryan Owen"
- Scopes: Drive, Sheets
- Used By: "ROM Request Intake" workflow

**Fallback:**
- If ryan.owen@ credential fails, temporarily switch to Bardo's credential
- No production data loss (webhook just writes to sheets)

---

## 📧 Gmail & Email Configuration

### Send-As Aliases

| Gmail Account | Can Send As | Verification | Status |
|--------------|-------------|--------------|--------|
| ryan.owen@ryanowenphotography.com | ryan@ryanowenphotography.com | ✅ Primary address or alias | ✅ Target |
| ryanowen80@gmail.com | ryan@ryanowenphotography.com | ⚠️ If configured | ⚠️ To be removed |
| bardo.faraday@gmail.com | — | ❌ Not needed | ❌ None |

**Apps Script Email Configuration:**
```javascript
const EMAIL_FROM_NAME = "Ryan Owen Photography";
const EMAIL_FROM_ADDRESS = "ryan@ryanowenphotography.com";  // Send-as alias
const EMAIL_BCC = "ryan@ryanowenphotography.com";           // Ryan receives copies
```

**Verification Status:**
- ryan@ should be either:
  1. **Primary address** of ryan.owen@ account (no send-as needed), OR
  2. **Verified alias** in ryan.owen@'s Gmail settings

---

## 🔒 Access Control Summary

### Who Can Do What?

| Action | ryan.owen@ | bardo.faraday@ | ryanowen80@ |
|--------|-----------|---------------|------------|
| **Edit production sheets** | ✅ Yes | ✅ Yes | ❌ No (view only) |
| **Generate invoices** | ✅ Yes (via menu) | ✅ Yes (via menu) | ❌ No |
| **Send customer emails** | ✅ Yes | ⚠️ Technically yes, but shouldn't | ❌ No |
| **Deploy Apps Script** | ✅ Yes | ✅ Yes (testing only) | ❌ No |
| **Transfer file ownership** | ✅ Yes (owner) | ❌ No (not owner) | ❌ No |
| **Access staging sheet** | ✅ Yes | ✅ Yes | ❌ No |
| **View invoice PDFs** | ✅ Yes | ✅ Yes | ✅ Yes (temp) |

---

## 🚨 Emergency Access Scenarios

### Scenario 1: ryan.owen@ Account Locked

**Problem:** Ryan can't log in to ryan.owen@ryanowenphotography.com

**Solution:**
1. Temporarily grant ryanowen80@ Editor access to critical files
2. Run workflows from ryanowen80@ account temporarily
3. Once ryan.owen@ restored, transfer ownership back
4. Remove ryanowen80@ Editor access again

**Estimated Recovery Time:** 1-2 hours

---

### Scenario 2: Bardo Unavailable for Support

**Problem:** Bardo can't help troubleshoot an issue

**Solution:**
1. Ryan has Owner access to all files (full control)
2. Ryan can edit Apps Script directly from sheet (Extensions → Apps Script)
3. Ryan can run `gog` commands locally (if installed)
4. Documentation in `~/lab/projects/rom/website-lab/romwebsite2026/docs/` for self-service

**Estimated Recovery Time:** 0 hours (Ryan self-sufficient)

---

### Scenario 3: Apps Script OAuth Revoked

**Problem:** Apps Script loses Gmail send permission

**Solution:**
1. Open ROM_FINACIALS_MASTER sheet
2. Go to Extensions → Apps Script
3. Run any function → OAuth consent dialog appears
4. Re-authorize: ✅ Gmail, ✅ Drive, ✅ Sheets, ✅ Docs
5. Test invoice send on staging sheet

**Estimated Recovery Time:** 5-10 minutes

---

## 📋 Permission Verification Checklist

Use this checklist after migration to verify target state:

### Google Sheets
- [ ] ROM_FINACIALS_MASTER: ryan.owen@ is Owner
- [ ] ROM_FINACIALS_MASTER: bardo@ is Editor
- [ ] ROM_FINACIALS_MASTER: ryanowen80@ is Viewer or removed
- [ ] ROMwebsite2026_data: ryan.owen@ is Owner
- [ ] ROMwebsite2026_data: bardo@ is Editor
- [ ] ROMwebsite2026_data: ryanowen80@ removed

### Google Docs
- [ ] ROM_INVOICE_TEMPLATE_test: ryan.owen@ is Owner
- [ ] ROM_INVOICE_TEMPLATE_test: bardo@ is Editor
- [ ] ROM_INVOICE_TEMPLATE_test: ryanowen80@ is Viewer or removed

### Google Drive Folders
- [ ] ROM_INVOICES_test: ryan.owen@ is Owner
- [ ] ROM_INVOICES_test: bardo@ is Editor
- [ ] ROM_INVOICES_test: ryanowen80@ is Viewer or removed
- [ ] All child invoice PDFs: ryan.owen@ is Owner (inherited)

### Drive Files (QR Codes)
- [ ] ZelleQr.jpg: ryan.owen@ is Owner
- [ ] VenmoQr.jpg: ryan.owen@ is Owner
- [ ] Both files: bardo@ is Editor

### Apps Script
- [ ] ROM Invoice System: Execution account is ryan.owen@
- [ ] Apps Script project: bardo@ can view and edit code
- [ ] Apps Script project: ryanowen80@ can view code (optional)

### OAuth Credentials
- [ ] gog CLI: ryan.owen@ authenticated
- [ ] gog CLI: bardo@ authenticated (secondary)
- [ ] clasp: ryan.owen@ authenticated
- [ ] clasp: bardo@ tokens backed up
- [ ] n8n: ryan.owen@ credential configured

### Email Configuration
- [ ] Apps Script sends from ryan@ryanowenphotography.com
- [ ] No send-as errors in execution log
- [ ] Test invoice email received successfully
- [ ] Email shows "From: Ryan Owen Photography <ryan@ryanowenphotography.com>"

---

## 🔄 Future Permission Reviews

**Schedule:** Every 3 months

**Review Questions:**
1. Does ryanowen80@ still need Viewer access?
   - If no issues in 3 months → Remove entirely
2. Are there any new files/folders outside this matrix?
   - Audit new resources, apply same permission structure
3. Has Bardo's role changed?
   - Adjust Editor access accordingly
4. Are there new team members?
   - Add to this matrix, grant appropriate permissions

**Next Review Date:** 2026-06-26 (3 months post-migration)

---

**Status:** Permission matrix complete. Use this as reference during and after migration.

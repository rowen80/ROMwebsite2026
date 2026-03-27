# ROM Account Migration — Executive Summary

**Date:** 2026-03-26  
**Analyst:** Leo (ROM Automation Specialist)  
**Status:** ⚠️ CRITICAL — Production halted due to send-as configuration error

---

## 🚨 The Problem

Ryan hit this error during invoice testing:
```
Error: Send-as not configured for ryan@ryanowenphotography.com
```

**Root Cause:** The Apps Script tries to send emails from `ryan@ryanowenphotography.com`, but the authenticated Google account (likely `bardo.faraday@gmail.com` or `ryanowen80@gmail.com`) doesn't have Gmail send-as permissions configured for that address.

---

## 🎯 Ryan's Vision

**Primary Operator:**  
- `ryan.owen@ryanowenphotography.com` — Owns everything, runs all workflows

**Secondary Access:**  
- `bardo.faraday@gmail.com` — Editor/viewer for troubleshooting, support, testing

**Phase Out:**  
- `ryanowen80@gmail.com` — Remove from production workflows eventually (keep for legacy access if needed)

**Philosophy:**  
> "Everything should run from ryan.owen with Bardo having editing control when needed."

---

## 📊 Current State Summary

### Google Accounts Identified

| Account | Role | Status |
|---------|------|--------|
| `ryanowen80@gmail.com` | Current owner of most files | ⚠️ To be phased out |
| `ryan.owen@ryanowenphotography.com` | Intended primary operator | ✅ Exists, underutilized |
| `bardo.faraday@gmail.com` | Development/testing account | ✅ Current working account |

**Note:** `ryan@ryanowenphotography.com` appears in email workflows, but unclear if this is an alias or a separate account. Investigation required.

---

## 🔍 Current Ownership Audit

### Google Sheets

| Sheet | Current Owner | Status |
|-------|--------------|--------|
| **ROM_FINACIALS_MASTER** | ❓ Unknown (Bardo lacks permissions to check) | 🔴 Needs verification |
| **ROMwebsite2026_data** (staging) | `ryan.owen@ryanowenphotography.com` | ✅ Correct |

**Permissions on ROMwebsite2026_data:**
- ✅ Owner: `ryan.owen@ryanowenphotography.com`
- ✅ Writer: `bardo.faraday@gmail.com`
- ⚠️ Writer: `ryanowen80@gmail.com` (should be removed)

---

### Google Docs Templates

| Template | Current Owner | Status |
|----------|--------------|--------|
| **ROM_INVOICE_TEMPLATE_test** (ID: `12BCu...okuI`) | `ryanowen80@gmail.com` | 🔴 Needs transfer |

**Permissions:**
- ⚠️ Owner: `ryanowen80@gmail.com`
- ✅ Writer: `ryan@ryanowenphotography.com`
- ✅ Writer: `bardo.faraday@gmail.com`

---

### Google Drive Folders

| Folder | Current Owner | Status |
|--------|--------------|--------|
| **ROM_INVOICES_test** (ID: `1HqX...cM3`) | `ryanowen80@gmail.com` | 🔴 Needs transfer |

**Permissions:**
- ⚠️ Owner: `ryanowen80@gmail.com`
- ✅ Writer: `bardo.faraday@gmail.com`

---

### Apps Script Projects

| Script | Bound To | Authenticated As | Status |
|--------|----------|-----------------|--------|
| Invoice Generation Script (ID: `1RWg...P6e`) | ROM_FINACIALS_MASTER | ❓ Unknown | 🔴 Needs audit |

**Clasp Authentication:**
- Currently: `bardo.faraday@gmail.com`
- Needs: `ryan.owen@ryanowenphotography.com`

---

### OAuth Credentials & API Access

| System | Authenticated As | Status |
|--------|-----------------|--------|
| **gog CLI** (Google API) | `bardo.faraday@gmail.com` | 🔴 Needs ryan.owen auth |
| **clasp** (Apps Script) | `bardo.faraday@gmail.com` | 🔴 Needs ryan.owen auth |
| **n8n** (Render webhook) | N/A (webhook-based) | ✅ No auth needed |

---

### Gmail Send-As Configuration

**The Critical Issue:**

Apps Script sends emails from: `ryan@ryanowenphotography.com`

**Problem:** This address must be configured as a "send-as" alias in the Gmail account that runs the script.

**Current State:**
- ❓ Unknown which Gmail account runs the Apps Script (likely Bardo or ryanowen80)
- ❓ Send-as alias not configured in that account
- ❓ Unclear if `ryan@ryanowenphotography.com` is an alias or a separate Workspace account

**Required Investigation:**
1. Verify if `ryan@ryanowenphotography.com` is a Google Workspace account or an alias
2. Determine which Gmail account executes the Apps Script
3. Configure send-as permission in the correct account

---

## 🎯 Migration Goals

### Phase 1: Immediate (Fix Send-As Error)
- ✅ Document current state (this report)
- 🔄 Investigate Gmail account structure
- 🔄 Configure send-as alias properly
- 🔄 Test invoice email sending

### Phase 2: Short-Term (Ownership Transfer)
- 🔄 Transfer ownership of ROM_INVOICE_TEMPLATE to ryan.owen
- 🔄 Transfer ownership of ROM_INVOICES folder to ryan.owen
- 🔄 Verify/transfer ownership of ROM_FINACIALS_MASTER to ryan.owen
- 🔄 Update Bardo permissions to Editor (not Owner)

### Phase 3: Long-Term (Authentication Migration)
- 🔄 Authenticate gog CLI with ryan.owen account
- 🔄 Authenticate clasp with ryan.owen account
- 🔄 Update Apps Script execution account to ryan.owen
- 🔄 Remove/downgrade ryanowen80 permissions

### Phase 4: Cleanup (Phase Out ryanowen80)
- 🔄 Audit all resources for ryanowen80 permissions
- 🔄 Remove ryanowen80 from production workflows
- 🔄 Document legacy access strategy

---

## ⚠️ Risk Assessment

### High Risk Items
1. **Apps Script Authentication** — Changing execution account could break production workflows
2. **OAuth Token Migration** — Tokens in `~/.clasprc.json` and `gog` keyring need careful handling
3. **Email Send-As** — Misconfiguration will block all customer communications
4. **Production Downtime** — Some steps require script redeployment

### Medium Risk Items
1. **File Ownership Transfer** — Could break shared links if not done correctly
2. **Permission Inheritance** — Folders pass permissions to child files (must audit recursively)
3. **Apps Script Bindings** — Script bound to sheet could lose permissions during transfer

### Low Risk Items
1. **n8n Webhook** — No authentication migration needed (webhook-based)
2. **Staging Sheet** — Already owned by ryan.owen, can be used for testing
3. **Drive File IDs** — Won't change during ownership transfer (safe to hardcode)

---

## 📋 Next Steps

1. **Read the detailed reports:**
   - `01-ACCOUNT-AUDIT.md` — Full inventory of resources and permissions
   - `02-MIGRATION-PLAN.md` — Step-by-step migration instructions
   - `03-PERMISSION-MATRIX.md` — Target permission state
   - `04-RISK-ASSESSMENT.md` — Detailed risk analysis and mitigation
   - `05-EXECUTION-TIMELINE.md` — Timeline and testing strategy

2. **Immediate Actions (Today):**
   - Investigate Gmail account structure
   - Verify send-as alias configuration
   - Test send-as on staging sheet

3. **Tomorrow (If Send-As Fixed):**
   - Begin ownership transfer of key files
   - Update OAuth credentials
   - Test invoice generation end-to-end

4. **Next Week:**
   - Complete authentication migration
   - Phase out ryanowen80 permissions
   - Document final configuration

---

## 🤝 Collaboration Notes

**Ryan's Preferences:**
> "Get it working first, THEN understand why — prefers working systems over educational experiments during troubleshooting."

**Leo's Approach:**
- This is a **planning task**, not execution
- All steps documented for Ryan's review before any changes
- Incremental testing strategy with rollback procedures
- Production workflows protected at all costs

---

**Status:** Report complete. Ready for Ryan's review before proceeding to execution phase.

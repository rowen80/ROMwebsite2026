# n8n Render Deployment — Post Mortem
**Date:** 2026-03-25
**Status:** UNRESOLVED — OAuth redirect URL stuck on localhost

---

## Goal
Deploy n8n to Render to replace Zapier for automated booking intake:
- Receive webhook from booking form
- Send confirmation email via Gmail (ryan.owen@ryanowenphotography.com)
- Log booking to Google Sheets
- Notify Ryan

---

## What Was Accomplished ✅
1. n8n deployed to Render at **https://rom-n8n.onrender.com**
2. SQLite + 1GB persistent disk configured at `/home/node/.n8n` — data survives redeploys
3. Owner account created (rowen80@hotmail.com)
4. Workflow imported from `automation/romwebsite2026-intake-FIXED.json`
5. Confirmed n8n encryption key on disk: `KeExl8MNGf6wxKsDH0lTl6ZLSP1GVkGk`
6. n8n version: **2.13.3**

---

## The Core Problem ❌
When creating any Google OAuth credential (Gmail, Sheets), n8n shows:
```
http://127.0.0.1:5678/rest/oauth2-credential/callback
```
Instead of:
```
https://rom-n8n.onrender.com/rest/oauth2-credential/callback
```
Google rejects this with `redirect_uri_mismatch`. OAuth cannot complete.

---

## Root Cause (Traced to Source Code)
File: `/usr/local/lib/node_modules/n8n/dist/services/url.service.js`

```javascript
getInstanceBaseUrl() {
    const n8nBaseUrl = this.trimQuotes(this.globalConfig.editorBaseUrl)
                       || this.getWebhookBaseUrl();
    return n8nBaseUrl.endsWith('/')
        ? n8nBaseUrl.slice(0, n8nBaseUrl.length - 1)
        : n8nBaseUrl;
}

getWebhookBaseUrl() {
    let urlBaseWebhook = this.trimQuotes(process.env.WEBHOOK_URL) || this.baseUrl;
    ...
    return urlBaseWebhook;
}

generateBaseUrl() {
    const { path, port, host, protocol } = this.globalConfig;
    // defaults to http://127.0.0.1:5678 when env vars missing
}
```

**Priority order n8n uses:**
1. `this.globalConfig.editorBaseUrl` — **no env var found that maps to this in v2.13.3**
2. `process.env.WEBHOOK_URL` — tried, did not work (reason unknown)
3. Computed from `globalConfig.host/protocol/port` — defaults to `http://127.0.0.1:5678`

---

## Everything We Tried (and why it failed)

| Env Var Tried | Result |
|---|---|
| `N8N_EDITOR_BASE_URL=https://rom-n8n.onrender.com` | No effect — doesn't map to `globalConfig.editorBaseUrl` in v2.13.3 |
| `N8N_HOST=0.0.0.0` | No effect on URL |
| `N8N_HOST=rom-n8n.onrender.com` | Caused failed deploy (n8n tried to bind to hostname) |
| `N8N_PROTOCOL=https` | No effect alone |
| `N8N_PORT=5678` | No effect alone |
| `N8N_PROXY_HOPS=1` | No effect |
| `N8N_ENCRYPTION_KEY` (wrong key) | Caused failed deploy (conflict with disk config) |
| `WEBHOOK_URL=https://rom-n8n.onrender.com` | Did not work — reason unclear |
| Wrote `editorBaseUrl` to `/home/node/.n8n/config` | Not a valid config key in v2.13.3 |
| PostgreSQL as backend | Failed — connection refused, DB in wrong region or SSL issue |

---

## Render Environment — Current Working State
These vars are confirmed in the container (`env` output):
```
N8N_WEBHOOK_URL=https://rom-n8n.onrender.com/
N8N_PROXY_HOPS=1
N8N_EDITOR_BASE_URL=https://rom-n8n.onrender.com
WEBHOOK_URL=https://rom-n8n.onrender.com
RENDER_EXTERNAL_HOSTNAME=rom-n8n.onrender.com
PORT=10000
```

Disk: `/home/node/.n8n` — 1GB, persistent
Config file: `{"encryptionKey":"KeExl8MNGf6wxKsDH0lTl6ZLSP1GVkGk"}`

---

## Next Steps to Try

### Option A — Patch the source file directly (one-time fix)
Use Render Shell to hardcode the URL in `url.service.js`, complete OAuth once,
credentials save permanently to disk. Patch is lost on redeploy but credentials persist.

```bash
# In Render Shell:
sed -i 's|this.trimQuotes(this.globalConfig.editorBaseUrl) || this.getWebhookBaseUrl()|"https://rom-n8n.onrender.com"|g' \
  /usr/local/lib/node_modules/n8n/dist/services/url.service.js
```
Then restart n8n (via Render manual deploy), complete OAuth for Gmail + Sheets,
credentials save to SQLite on disk. Done permanently — patch not needed after auth.

### Option B — Check if WEBHOOK_URL is actually loading
In Render Shell after next deploy:
```bash
node -e "console.log(process.env.WEBHOOK_URL)"
```
If empty, the env var isn't reaching the process. Investigate Render env var scoping.

### Option C — n8n Cloud ($20/month)
Handles all proxy/URL issues automatically. Import same workflow JSON.
Re-authenticate Gmail and Sheets once. Done.

### Option D — Stay on Zapier
Keep Zapier for this workflow. It works. Cost comparison:
- Zapier Starter: ~$30/month, no setup headaches
- n8n self-hosted: $7/month Render + hours of debugging

---

## Remaining Website TODO (separate from n8n)
1. Remove login popover from booking form (`booking_form.html`)
2. Fix twilight popover image in booking form
3. Submit curl test request to verify end-to-end
4. Final review of all site pages
5. Go-live

---

## Important Credentials/Values
- n8n URL: https://rom-n8n.onrender.com
- n8n login: rowen80@hotmail.com
- n8n disk encryption key: `KeExl8MNGf6wxKsDH0lTl6ZLSP1GVkGk`
- Google OAuth Client: in console.cloud.google.com (ryan.owen@ryanowenphotography.com account)
- Authorized redirect URI already added: `https://rom-n8n.onrender.com/rest/oauth2-credential/callback`
- Booking form: https://githubrequestform-work.onrender.com
- Main website repo: rowen80/ROMwebsite2026

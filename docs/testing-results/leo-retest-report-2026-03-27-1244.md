# Leo Retest Report: n8n Header Fix Verification
**Timestamp:** 2026-03-27 12:44 EDT  
**Task:** Verify n8n webhook header fix after user update

---

## ❌ FINDING: n8n Credential NOT Updated

### Test Results

| Header Sent | HTTP Status | Response | Auth Pass? |
|------------|-------------|----------|------------|
| `X-N8N-Secret: deb0bb17...` | 401 | `{"ok":false,"error":"Unauthorized"}` | ❌ NO |
| `x-rom-intake-key: deb0bb17...` | 422 | `{"ok":false,"error":"Missing required fields"}` | ✅ YES |
| (no header) | 401 | `{"ok":false,"error":"Unauthorized"}` | ❌ NO |

### Analysis

**The n8n webhook is STILL configured for the old header name `x-rom-intake-key`.**

- When we send `x-rom-intake-key`: Auth passes (422 = "missing fields" = past auth, into validation)
- When we send `X-N8N-Secret`: Auth fails (401 = unauthorized)
- api.py was correctly updated to send `X-N8N-Secret` (commit d6b85ea)
- But n8n side was NOT updated

### Evidence from api.py Logs

```
[DEBUG] N8N_INTAKE_SECRET is set: deb0bb17...
[DEBUG] Headers being sent: {'Content-Type': 'application/json', 'X-N8N-Secret': 'deb0bb17daf1f4243575d732b7fd5d2e'}
[DEBUG] Sending payload with customer.email: bardo.faraday@gmail.com
n8n intake webhook returned 401: {"ok":false,"error":"Unauthorized","code":401}
```

The backend is correctly sending `X-N8N-Secret`, but n8n rejects it.

---

## 🔧 Required Fix

**User must update the n8n Header Auth credential:**

1. Open n8n: https://rom-n8n.onrender.com/
2. Go to Credentials → Find the Header Auth credential used by the "romwebsite2026-request-intake" webhook
3. Change the header name from `x-rom-intake-key` to `X-N8N-Secret`
4. Save the credential
5. Re-activate the workflow (may need to toggle Active status)

**Note:** The secret value `deb0bb17daf1f4243575d732b7fd5d2e` is correct and doesn't need to change. Only the header name needs updating.

---

## ✅ Verification Checklist (Once Fixed)

Once the n8n credential is updated, retest with:

```bash
cd ~/lab/projects/rom/website-lab/romwebsite2026
./test-booking.sh
```

Or submit a test booking through the form at:
http://127.0.0.1:8001/site/booking_form.html

**Expected results after fix:**
- ✅ No 401 errors in response
- ✅ n8n webhook accepts submission (200 OK)
- ✅ Client confirmation email sent to test email
- ✅ Internal notification email sent
- ✅ New row appended to ROMwebsite2026_data sheet

---

## Current Status

**Backend (api.py):** ✅ READY  
- Correctly sends `X-N8N-Secret` header
- Secret value loaded from .env
- Debug logging confirms header is sent

**n8n (credential):** ❌ NOT UPDATED  
- Still expects old header name `x-rom-intake-key`
- Rejects `X-N8N-Secret` with 401 Unauthorized

**Action Required:** User must update n8n credential configuration.

---

## Test Data Used

Fresh test submission with new data:
- Name: Marcus Rivera
- Email: bardo.faraday@gmail.com
- Phone: 410-867-5309
- Address: 742 Evergreen Terrace, Baltimore MD
- Property: Harbor Tower East, 4BR/3BA, 2800 sq ft
- Services: Basic Photos, Drone Photos, Video
- Shoot Date: 2026-05-15

This data is completely different from previous test submissions and ready for retest once n8n is fixed.

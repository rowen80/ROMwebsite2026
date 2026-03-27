# How to Import the Fixed Workflow

## Quick Steps

1. **Log into n8n**
   - URL: https://rom-n8n.onrender.com
   - Email: rowen80@hotmail.com
   - Password: [use your saved password]

2. **Import the Fixed Workflow**
   - Click "Workflows" in the left sidebar
   - Click "+ Add Workflow" (top right)
   - Click the "..." menu → "Import from File"
   - Select: `romwebsite2026-intake-FIXED-20260325-200236.json`
   - Click "Import"

3. **Verify Credentials**
   - Open the imported workflow
   - Check "Send Client Email" node - should show Gmail account connected
   - Check "Append to Sheet" node - should show Google Sheets account connected
   - If credentials missing, you'll need to re-authenticate

4. **Activate the Workflow**
   - Toggle the "Active" switch in the top right corner
   - The workflow should now be live and ready to receive webhooks

5. **Test It**
   - Open terminal
   - Navigate to: `~/lab/projects/rom/website-lab/romwebsite2026/automation/`
   - Run: `./test-webhook.sh YOUR_SECRET_KEY`
   - Check for:
     - ✅ HTTP 200 response
     - ✅ Email sent to jane.test@example.com
     - ✅ Row added to "ROMwebsite2026_data" sheet

## What Changed

The fix was simple but crucial:

**Before (broken):**
```javascript
// Sheets node tried to read from Gmail node output
$json.body.customer.firstName  // ❌ Gmail response has no .body
```

**After (fixed):**
```javascript
// Sheets node reads directly from Webhook node
$('Webhook').item.json.body.customer.firstName  // ✅ Always available
```

## Troubleshooting

### "Credentials not found"
- Re-authenticate Gmail and Google Sheets in n8n settings
- Make sure you're using ryan.owen@ryanowenphotography.com for Gmail
- Use Bardo's Google account for Sheets access

### "Workflow not receiving webhooks"
- Check the webhook URL: `/webhook/romwebsite2026/request-intake`
- Verify the workflow is **Active** (toggle in top right)
- Check the `ROM_INTAKE_SECRET` environment variable is set

### "Sheet write still fails"
- Verify the sheet ID is correct: `17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ`
- Check the tab name: "2026 FORM_DATA"
- Make sure Bardo's account has Editor access to the sheet

### "Email not sending"
- Check Gmail OAuth is still valid (tokens can expire)
- Verify ryan@ryanowenphotography.com is the sending account
- Check spam folders for test emails

## Safety Checklist

- ✅ Original workflow preserved with timestamp
- ✅ Only working in staging environment (rom-n8n.onrender.com)
- ✅ Only writing to staging sheet (ROMwebsite2026_data)
- ✅ Live ROM sheet untouched
- ✅ Live Zapier workflow untouched

## After Successful Testing

Once you confirm the workflow works:

1. Document the webhook URL for the website form
2. Update the website to POST to the new n8n endpoint
3. Monitor the first few real submissions
4. Consider decommissioning the old Zapier flow (after validation period)

---

**Need help?** Ask Bardo or Leo for assistance.

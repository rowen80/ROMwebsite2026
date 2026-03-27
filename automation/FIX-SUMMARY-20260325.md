# n8n Workflow Fix - Google Sheets Data Flow Issue

**Date:** 2026-03-25  
**Fixed by:** Leo (ROM automation specialist)  
**Status:** FIXED - Ready for testing

## Problem Diagnosed

The "Append to Sheet" node was receiving empty data with error:  
`"this is an item but it is empty"`

**Root Cause:**  
The Gmail node ("Send Client Email") doesn't pass through the original webhook payload by default. When the Sheets node tried to reference `$json.body.*`, it was actually getting the Gmail API response (which doesn't contain the form data), not the webhook payload.

## Solution Implemented

Updated all data references in the "Append to Sheet" node from:
```javascript
$json.body.customer.firstName
```

To:
```javascript
$('Webhook').item.json.body.customer.firstName
```

This directly references the original Webhook node's output, bypassing the Gmail node entirely.

### Nodes Updated

1. **Append to Sheet** - All 16 column mappings now reference `$('Webhook').item.json.body.*`
2. **Respond Success** - Updated `requestId` reference to use Webhook data

## Files Created

- **Fixed workflow:** `romwebsite2026-intake-FIXED-20260325-200236.json`
- **Original (preserved):** `romwebsite2026-intake-WORKING-20260325-200410.json`

## Testing Plan

1. Import the FIXED workflow into n8n at https://rom-n8n.onrender.com
2. Activate the workflow
3. Send a test webhook POST with sample data:
   ```bash
   curl -X POST https://rom-n8n.onrender.com/webhook/romwebsite2026/request-intake \
     -H "Content-Type: application/json" \
     -H "x-rom-intake-key: [SECRET]" \
     -d @test-payload.json
   ```
4. Verify the row appears in the "ROMwebsite2026_data" sheet, "2026 FORM_DATA" tab
5. Check that the email was sent successfully
6. Confirm the webhook response shows `"sheetWriteStatus": "APPENDED"`

## Next Steps

1. **Manual import required** - I cannot access the n8n web UI to import the workflow
2. **You need to:**
   - Log into https://rom-n8n.onrender.com (rowen80@hotmail.com)
   - Import the FIXED workflow JSON
   - Test with a sample webhook
   - Verify sheet write succeeds

## Alternative Solutions (Not Used)

**Option A:** Enable "passthrough" on Gmail node  
- Pros: Simpler conceptually
- Cons: Requires finding the setting in n8n UI, may not exist in all versions

**Option B:** Add a "Set" node between Gmail and Sheets  
- Pros: More explicit data flow
- Cons: Adds unnecessary complexity when direct reference works

**Selected: Option C** - Direct Webhook reference  
- Pros: Clean, explicit, no dependencies on Gmail output
- Cons: None - this is the recommended n8n pattern

## Technical Notes

- The Gmail node successfully sends emails - that part was working
- The issue was purely about data flow downstream
- n8n allows referencing any prior node using `$('NodeName').item.json`
- This is actually more robust than relying on `$json` passthrough

## Safety

✅ No changes to live ROM master sheet  
✅ No changes to live Zapier workflow  
✅ Only modified staging n8n workflow  
✅ Original workflow preserved with timestamp

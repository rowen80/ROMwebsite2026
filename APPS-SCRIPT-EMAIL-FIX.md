# Apps Script Email Fix - Issue #5
**Problem:** Invoice PDF created, sheet updated, but no email sent  
**Root Cause:** Gmail API permissions not configured  
**Solution:** Enable Gmail service and re-authorize script

---

## Quick Fix Steps

### Step 1: Open Apps Script
1. Open Google Sheets: **ROMwebsite2026_data**
2. Go to **Extensions > Apps Script**
3. You should see `Code.gs` with the ROM delivery/invoicing functions

### Step 2: Enable Gmail Service
1. In the Apps Script editor, look at the left sidebar
2. Click the **"+"** icon next to **Services**
3. Scroll down and find **Gmail API**
4. Click **Add**
5. Version: Select **v1** (latest)
6. Identifier: Leave as default (**Gmail**)
7. Click **Add** button

### Step 3: Verify Script Permissions
1. In the Apps Script editor, look for the gear icon (⚙️) labeled **Project Settings**
2. Click **Project Settings**
3. Scroll down to **OAuth Scopes**
4. You should see these scopes (or you'll add them in Step 4):
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/spreadsheets`
   - `https://www.googleapis.com/auth/drive`

### Step 4: Check appsscript.json (If Visible)
1. In the left sidebar, you might see **appsscript.json** (if "Show appsscript.json" is enabled in settings)
2. If visible, verify it contains:
   ```json
   {
     "timeZone": "America/New_York",
     "dependencies": {
       "enabledAdvancedServices": [
         {
           "userSymbol": "Gmail",
           "version": "v1",
           "serviceId": "gmail"
         }
       ]
     },
     "oauthScopes": [
       "https://www.googleapis.com/auth/gmail.send",
       "https://www.googleapis.com/auth/spreadsheets",
       "https://www.googleapis.com/auth/drive"
     ],
     "exceptionLogging": "STACKDRIVER"
   }
   ```

### Step 5: Re-Authorize the Script
Now you need to trigger the authorization flow so Google grants the new Gmail permissions:

1. In the Apps Script editor, at the top, find the function dropdown (it might say `onOpen`)
2. Click the dropdown and select: **`testSendFromDomain`**
3. Click the **Run** button (▶️ icon)
4. You'll see a pop-up: **"Authorization required"**
5. Click **Review Permissions**
6. Select your Google account (ryan@ryanowenphotography.com)
7. You'll see a warning: "Google hasn't verified this app"
8. Click **Advanced** → **Go to ROM Ops (unsafe)**
9. Review the permissions list (should include Gmail)
10. Click **Allow**

### Step 6: Test Email Sending
The `testSendFromDomain` function you just ran should send a test email to `ryanowen80@gmail.com`.

Check if you received the email with subject: **"ROM TEST"**

- ✅ **Email received?** → Gmail API is working! Proceed to Step 7
- ❌ **No email?** → Check troubleshooting section below

### Step 7: Verify Send-As Configuration
Gmail might block emails sent "from" ryan@ryanowenphotography.com unless you've configured it as a verified send-as address.

1. Go to Gmail: https://mail.google.com
2. Click the gear icon (⚙️) → **See all settings**
3. Go to **Accounts and Import** tab
4. Find section: **Send mail as**
5. Verify `ryan@ryanowenphotography.com` is listed
6. If not, click **Add another email address** and follow the verification steps

### Step 8: Test Full Workflow
Now test the actual invoice email workflow:

1. In your Google Sheet (**ROMwebsite2026_data**), find a test row with:
   - Delivered = "Y"
   - PhotoLink = (some URL)
   - InvoiceNumber = (blank)
   - InvoiceStatus = (blank)

2. In Google Sheets, go to menu: **ROM Ops > Invoicing > Send Invoice Only (By ClientLastName, Del. = Y)**

3. Enter the ClientLastName from your test row

4. Click OK to confirm

5. Check:
   - ✅ PDF created in Drive folder: **ROM_INVOICES_test**
   - ✅ Email sent to ClientEmail address
   - ✅ Sheet updated with InvoiceNumber, InvoicedAt, InvoicePDFUrl

---

## Verification Checklist

After completing the fix:

- [ ] Gmail API service added to Apps Script (see Services in left sidebar)
- [ ] Script has been re-authorized (ran testSendFromDomain successfully)
- [ ] Test email received at ryanowen80@gmail.com
- [ ] ryan@ryanowenphotography.com is configured as send-as address in Gmail
- [ ] Invoice email workflow sends emails successfully
- [ ] Emails include PDF attachment
- [ ] Emails include QR code images (Zelle and Venmo)
- [ ] BCC to bardo.faraday+rom@gmail.com works

---

## Troubleshooting

### Issue: "Exception: Service invoked too many times in a short time: gmail"
**Cause:** Gmail API quota limit (100 emails/day for personal accounts)  
**Fix:** Wait 24 hours or upgrade to Google Workspace account  
**Check quota:** https://console.cloud.google.com/apis/api/gmail.googleapis.com/quotas

### Issue: "Exception: Bad value (line 1234)"
**Cause:** Missing or invalid email address in ClientEmail column  
**Fix:** Verify the row has a valid email in ClientEmail column

### Issue: Email sends but from wrong address
**Cause:** Send-as not configured or Gmail override  
**Fix:**
1. Verify send-as configuration in Gmail settings
2. In Code.gs, verify:
   ```javascript
   const EMAIL_FROM_ADDRESS = "ryan@ryanowenphotography.com";
   ```
3. Verify `assertSendAsConfigured_()` function passes

### Issue: "Authorization required" prompt appears every time
**Cause:** Script authorization was revoked or expired  
**Fix:**
1. Go to https://myaccount.google.com/permissions
2. Find "ROM Ops" app
3. Remove access
4. Re-run authorization flow (Step 5 above)

### Issue: Email sends but QR codes missing
**Cause:** QR image files not found in Drive  
**Fix:**
1. Search Google Drive for: `ZelleQr.jpg` and `VenmoQr.jpg`
2. If missing, upload them to Drive (root folder or specify path)
3. Verify file names match exactly (case-sensitive):
   ```javascript
   const ZELLE_QR_FILENAME = "ZelleQr.jpg";
   const VENMO_QR_FILENAME = "VenmoQr.jpg";
   ```

### Issue: Email sends but no PDF attachment
**Cause:** PDF creation failed or file not found  
**Fix:**
1. Check Drive folder: **ROM_INVOICES_test**
2. Verify invoice template exists: **ROM_INVOICE_TEMPLATE_2026**
3. Check Apps Script logs: View > Logs (Ctrl+Enter)
4. Look for errors in `createInvoicePdf_()` function

### Issue: "Reference Error: assertSendAsConfigured_ is not defined"
**Cause:** Function name typo or missing function  
**Fix:** Verify Code.gs has this function:
```javascript
function assertSendAsConfigured_() {
  const aliases = GmailApp.getAliases().map(a => a.toLowerCase());
  if (!aliases.includes(EMAIL_FROM_ADDRESS.toLowerCase())) {
    throw new Error(`Send-as not configured for ${EMAIL_FROM_ADDRESS}`);
  }
}
```

---

## Advanced: Manual Quota Check

If emails aren't sending and you suspect quota issues:

1. Go to: https://console.cloud.google.com/
2. Select your project (or "My Project" if auto-created)
3. Go to **APIs & Services > Enabled APIs**
4. Click **Gmail API**
5. Click **Quotas** tab
6. Check: **Send message** quota (100/day for free, 1000/day for Workspace)

---

## Testing Script Functions

You can test individual functions in Apps Script:

### Test 1: Check Send-As Aliases
```javascript
function testGetAliases() {
  const aliases = GmailApp.getAliases();
  console.log("Send-as aliases:", aliases);
}
```

### Test 2: Test Email Send
```javascript
function testSimpleEmail() {
  GmailApp.sendEmail(
    "ryanowen80@gmail.com",
    "Test from Apps Script",
    "This is a plain text test email."
  );
  console.log("Email sent!");
}
```

### Test 3: Test Email with Attachment
```javascript
function testEmailWithPdf() {
  const testPdfUrl = "https://drive.google.com/file/d/YOUR_FILE_ID/view";
  const fileId = testPdfUrl.match(/\/d\/([^\/]+)/)[1];
  const file = DriveApp.getFileById(fileId);
  
  GmailApp.sendEmail(
    "ryanowen80@gmail.com",
    "Test with PDF",
    "This email has a PDF attached.",
    {
      attachments: [file.getBlob()]
    }
  );
  console.log("Email with PDF sent!");
}
```

### Test 4: Test QR Code Loading
```javascript
function testLoadQrCodes() {
  const zelleFiles = DriveApp.getFilesByName("ZelleQr.jpg");
  const venmoFiles = DriveApp.getFilesByName("VenmoQr.jpg");
  
  if (!zelleFiles.hasNext()) {
    console.log("❌ ZelleQr.jpg NOT FOUND in Drive");
  } else {
    console.log("✅ ZelleQr.jpg found:", zelleFiles.next().getId());
  }
  
  if (!venmoFiles.hasNext()) {
    console.log("❌ VenmoQr.jpg NOT FOUND in Drive");
  } else {
    console.log("✅ VenmoQr.jpg found:", venmoFiles.next().getId());
  }
}
```

---

## Email Configuration Constants

These are set in Code.gs and should match your business:

```javascript
const EMAIL_FROM_NAME = "Ryan Owen Photography";
const EMAIL_FROM_ADDRESS = "ryan@ryanowenphotography.com";
const EMAIL_BCC_ADDRESS = "bardo.faraday+rom@gmail.com"; // TEST MODE
```

**Production vs Test Mode:**
- The current setup BCCs all emails to `bardo.faraday+rom@gmail.com` for monitoring
- This is marked as TEST MODE in the code comments
- For production, you may want to remove or change the BCC address

---

## Expected Email Output

### Photos Only Email
**Subject:** `Photos for 123 Main St`  
**Body:**
```
Hi John,

Photos are available at the link below. Please let me know if there is anything else I can do for you. This link will be valid for 30 days. Please download the files to your personal device for permanent storage.

Thanks! Ryan

123 Main St Photo Link:
https://www.dropbox.com/...

Ryan Owen
240-401-8385
www.ryanowenphotography.com

*** In order to give every project my full attention, I cannot respond to emails or texts while I am shooting. Thank you for your patience. ***
```

### Photos + Invoice Email
**Subject:** `Photos/ Invoice for 123 Main St`  
**Attachments:** Invoice PDF  
**Body:**
```
Hi John,

Photos are available for download at the link below. Invoice is attached. The total due came to $299.00 and can be paid via the links at the bottom. This link will be valid for 30 days. Please download all files to your personal device for permanent storage.

Thanks! Ryan

123 Main St Photo Link:
https://www.dropbox.com/...

[Zelle QR Code]  [Venmo QR Code]

Ryan Owen
240-401-8385
www.ryanowenphotography.com

*** In order to give every project my full attention, I cannot respond to emails or texts while I am shooting. Thank you for your patience. ***
```

---

## Success Criteria

✅ **Issue #5 is FIXED when:**
1. Apps Script has Gmail API service enabled
2. Script is authorized with Gmail send permissions
3. Test email from `testSendFromDomain()` arrives successfully
4. Invoice workflow sends emails with PDF attachments
5. QR codes are embedded correctly in email body
6. BCC to monitoring email works
7. No "Service invoked too many times" errors (quota not exceeded)

---

## Next Steps After Fix

1. ✅ Test with one real booking (non-test row)
2. ✅ Verify client receives email with correct formatting
3. ✅ Verify PDF is professional and contains all info
4. ✅ Verify QR codes are scannable
5. ✅ Update TEST MODE settings for production:
   - Change `INVOICE_FOLDER_NAME` from "ROM_INVOICES_test" to "ROM_INVOICES"
   - Change `DOC_TEMPLATE_NAME` from "ROM_INVOICE_TEMPLATE_2026" to production template
   - Update or remove `EMAIL_BCC_ADDRESS` as needed

All Apps Script email functionality should now work correctly!

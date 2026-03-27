# n8n Node Configuration Fixes
**Workflow:** romwebsite2026-intake  
**Issues Fixed:** #1 (Name mapping), #3 (Billing email), #6 (Total formula)

---

## Quick Reference: What to Change

Open your n8n workflow and locate the **"Add to Google Sheets"** node (or whatever you named the node that writes to the ROMwebsite2026_data sheet).

### Changes to Make:

| Column Header | OLD Mapping (WRONG) | NEW Mapping (CORRECT) | Notes |
|---------------|---------------------|----------------------|--------|
| **ClientFirstName** | `{{ split full name }}` or wrong field | `{{ $json.customer.firstName }}` | ✅ Issue #1 fix |
| **ClientLastName** | `{{ split full name }}` or wrong field | `{{ $json.customer.lastName }}` | ✅ Issue #1 fix |
| **BillingEmail** | Any mapping expression | **[DELETE - LEAVE BLANK]** | ✅ Issue #3 fix |
| **Estimated Total** | `{{ formula }}` or wrong calculation | `{{ $json.estimate.estimatedTotal }}` | ✅ Issue #6 fix |

---

## Step-by-Step Instructions

### Step 1: Open the Workflow
1. Go to n8n: https://rom-n8n.onrender.com
2. Open workflow: **romwebsite2026-intake**
3. Find the **"Google Sheets"** node that adds new rows

### Step 2: Fix ClientFirstName (Issue #1)
1. Click the Google Sheets node
2. Scroll to the **Columns** section
3. Find **ClientFirstName** row
4. Change the **Value** field to:
   ```
   {{ $json.customer.firstName }}
   ```
5. ✅ Save

### Step 3: Fix ClientLastName (Issue #1)
1. In the same node, find **ClientLastName** row
2. Change the **Value** field to:
   ```
   {{ $json.customer.lastName }}
   ```
3. ✅ Save

### Step 4: Remove BillingEmail Mapping (Issue #3)
1. In the same node, find **BillingEmail** row
2. **DELETE the entire row** OR clear the Value field completely
3. The BillingEmail column should remain **empty** when rows are added
4. Apps Script will fill this column later during invoice generation
5. ✅ Save

### Step 5: Fix Estimated Total (Issue #6)
1. In the same node, find **Estimated Total** row
2. Change the **Value** field to:
   ```
   {{ $json.estimate.estimatedTotal }}
   ```
3. This uses the total already calculated by api.py (most reliable)
4. ✅ Save

### Step 6: Save and Activate
1. Click **Save** button (top right)
2. Ensure workflow is **Active** (toggle should be green)
3. ✅ Done

---

## Complete Column Mapping Reference

Here's the full correct mapping for all columns (for reference):

```javascript
// Meta fields
SubmittedAt: {{ $now }}
Customer ID: {{ $json.meta.customerId }}
Company ID: (leave blank - filled by sync script)
Match Status: (leave blank - filled by sync script)

// Customer info
ClientFirstName: {{ $json.customer.firstName }}          // ✅ FIXED
ClientLastName: {{ $json.customer.lastName }}            // ✅ FIXED
ClientEmail: {{ $json.customer.email }}
ClientPhone: {{ $json.customer.phone }}

// Listing info
Service: {{ $json.services.selected.join(', ') }}
Company: {{ $json.customer.agency }}
Bedrooms: {{ $json.listing.bedrooms }}
List Price: {{ $json.listing.estimatedPriceBand }}
Sq Ft: {{ $json.listing.listingSize }}
Listing Address: {{ $json.listing.address }}
City: {{ $json.listing.city }}
Sales/Rentals: {{ $json.listing.usage }}

// Pricing
Estimated Line Items: {{ $json.estimate.lineItemsText }}
Estimated Total: {{ $json.estimate.estimatedTotal }}     // ✅ FIXED
Total: (leave blank - filled manually before invoicing)
Deposit: (leave blank - filled manually before invoicing)

// Delivery fields (all blank on intake)
Delivered: (blank)
PhotoLink: (blank)
VideoLink: (blank)
ReelsLink: (blank)
LockedLink: (blank)

// Invoice fields (all blank on intake)
ManualInvoice: (blank)
InvoicedAt: (blank)
InvoiceStatus: (blank)
InvoicePDFUrl: (blank)
InvoicePreviewUrl: (blank)
BillingEmail: (blank)                                     // ✅ FIXED - DO NOT MAP
Message: (blank)
```

---

## Payload Structure Reference

The api.py sends this JSON structure to the n8n webhook:

```json
{
  "meta": {
    "source": "romwebsite2026",
    "requestId": "uuid...",
    "submittedAt": "2026-03-27T...",
    "jobId": 123,
    "customerId": 456
  },
  "customer": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "2404018385",
    "agency": "Ocean City Realty",
    "isFirstTime": true
  },
  "listing": {
    "address": "123 Main St",
    "city": "Ocean City",
    "buildingName": "Seascape Condos",
    "bedrooms": "4 bedrooms",
    "bathrooms": "3 bathrooms",
    "listingSize": "2000 sqft",
    "estimatedPriceBand": "$500- 750k",
    "usage": "Sales"
  },
  "timing": {
    "dateListingReady": "2026-04-01",
    "dateToGoLive": "2026-04-05",
    "desiredDate": "2026-04-03",
    "isVacant": "Yes",
    "duringShootAgreement": true
  },
  "access": {
    "accessType": "Lockbox",
    "accessCode": "1234",
    "ownerContactInfo": "Owner: 555-1234"
  },
  "services": {
    "selected": ["Basic Photos", "Drone Photos"],
    "views": ["Ocean View"],
    "finishedBasement": "No, There is not a Basement",
    "notesForPhotographer": "Please focus on ocean views"
  },
  "estimate": {
    "currency": "USD",
    "subtotal": 159.00,
    "estimatedTotal": 299.00,
    "lineItems": [
      {
        "code": "svc:Basic Photos",
        "label": "Basic Photos",
        "qty": 1.0,
        "unit_price": 199.00,
        "line_total": 199.00
      },
      {
        "code": "svc:Drone Photos",
        "label": "Drone Photos",
        "qty": 1.0,
        "unit_price": 59.00,
        "line_total": 59.00
      }
    ],
    "lineItemsText": "Basic Photos: $199.00; Drone Photos: $59.00",
    "meta": {
      "sqft": 2000,
      "sqft_multiplier": 1.0,
      "price_band_multiplier": 1.0,
      "bedroom_multiplier": 1.99,
      "bathroom_multiplier": 1.0,
      "finished_basement_multiplier": 1.0,
      "combined_multiplier": 1.99
    }
  },
  "flags": {
    "termsAccepted": true
  }
}
```

---

## Testing the n8n Workflow

### Test 1: Manual Test Webhook
1. In n8n workflow, click **"Execute Workflow"** button
2. Click **"Test step"** on the Webhook Trigger node
3. Copy the test URL
4. Use this curl command (replace URL):
   ```bash
   curl -X POST "https://rom-n8n.onrender.com/webhook-test/..." \
     -H "Content-Type: application/json" \
     -H "X-N8N-Secret: deb0bb17daf1f4243575d732b7fd5d2e" \
     -d @test-payload.json
   ```

### Test 2: Live Form Submission (RECOMMENDED)
1. Go to http://127.0.0.1:8001/booking_form.html (or production URL)
2. Fill out the form with test data:
   - First Name: "Leo"
   - Last Name: "Test"
   - Email: your test email
   - Select "4 Bedrooms"
   - Select "Basic Photos"
3. Submit form
4. Check Google Sheets:
   - ✅ ClientFirstName = "Leo"
   - ✅ ClientLastName = "Test"
   - ✅ BillingEmail = (blank)
   - ✅ Estimated Total = 199 (or appropriate value)

### Test 3: Check n8n Execution Logs
1. In n8n, go to **Executions** tab
2. Find your most recent execution
3. Click to view details
4. Check each node's output:
   - Webhook node should show the full JSON payload
   - Google Sheets node should show successful row creation
   - Any errors will be highlighted in red

---

## Common Issues & Troubleshooting

### Issue: "Expression error: customer is not defined"
**Cause:** The payload structure doesn't match expectations  
**Fix:** Verify you're submitting via the actual form (not direct webhook POST)

### Issue: Names still not splitting correctly
**Cause:** Old mapping expression still in place  
**Fix:** Double-check you used `$json.customer.firstName` (with the `$json.` prefix)

### Issue: BillingEmail still getting populated
**Cause:** Mapping not fully removed  
**Fix:** Delete the entire BillingEmail row from the column mappings (don't just clear it)

### Issue: Estimated Total shows 0 or wrong value
**Cause:** api.py pricing calculation not running  
**Fix:** Must test via actual form submission (not curl to webhook)

### Issue: Webhook returns 502 Bad Gateway
**Cause:** n8n webhook secret mismatch  
**Fix:** Verify `.env` has correct `N8N_INTAKE_SECRET` matching n8n workflow auth settings

---

## Verification Checklist

After making n8n changes, verify:

- [ ] ClientFirstName column maps to `{{ $json.customer.firstName }}`
- [ ] ClientLastName column maps to `{{ $json.customer.lastName }}`
- [ ] BillingEmail column mapping is **deleted/blank**
- [ ] Estimated Total column maps to `{{ $json.estimate.estimatedTotal }}`
- [ ] Workflow is **saved**
- [ ] Workflow is **active** (green toggle)
- [ ] Test submission via actual form succeeds
- [ ] Google Sheet row has correct data in all columns

---

## Need Help?

If issues persist:
1. Export the n8n workflow as JSON
2. Share the execution log from n8n (with sensitive data redacted)
3. Check api.py logs for any errors
4. Verify the webhook URL in `.env` matches n8n workflow webhook URL

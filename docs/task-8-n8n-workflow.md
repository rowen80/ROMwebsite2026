# ROM Website 2026 — Task 8: n8n Workflow Design

## Purpose
Define the exact n8n workflow shape for the rebuilt ROM request-form pipeline.

## Workflow name
Recommended n8n workflow name:
`romwebsite2026-request-intake`

## Trigger
### Node 1: Webhook Trigger
Method:
- `POST`

Path suggestion:
- `/romwebsite2026/request-intake`

Expected source:
- Render-hosted backend only

## Security recommendation
Require one of:
- secret header (preferred for V1)
- signed token
- basic auth if needed

### Suggested header
- `x-rom-intake-key: <secret>`

n8n should reject requests missing or failing this check.

---

## Expected payload from Render
n8n should expect the normalized payload defined in Task 6, including:
- `meta`
- `customer`
- `listing`
- `timing`
- `access`
- `services`
- `estimate`
- `flags`

n8n should not be responsible for pricing logic.
That belongs in Render/backend via `pricing.json`.

---

## Recommended node sequence

### Node 1 — Webhook
Receives JSON payload.

### Node 2 — Validate Secret / Reject Unauthorized
Purpose:
- confirm request came from your Render backend

If invalid:
- stop workflow
- return error status

### Node 3 — Validate Required Fields
Required minimum fields:
- customer.firstName
- customer.lastName
- customer.email
- customer.phone
- listing.address
- listing.city
- listing.usage
- services.selected (at least one)
- estimate.lineItemsText
- estimate.estimatedTotal

If invalid:
- return structured error
- do not send emails
- do not write sheet row

### Node 4 — Normalize / Prepare Variables
Build reusable variables for:
- email subject
- client full name
- agency name
- formatted service string
- formatted estimate block
- workbook row values
- agency-based recipient logic

Recommended computed values:
- `subject = "Photo Request: " + listing.address`
- `clientFullName`
- `servicesText = services.selected.join(", ")`
- `viewsText = (services.views || []).join(", ")`
- `submittedAt`
- `sourceSystem = "romwebsite2026"`

### Node 5 — Determine Internal Recipients
Always include:
- `ryan@ryanowenphotography.com`

If agency is either:
- `PenFed Gallo Realty`
- `LeeAnn Group`

Also include:
- `rehoboth@penfedrealty.com`

This should be done in workflow logic, not hardcoded in the frontend.

### Node 6 — Send Client Confirmation Email
From:
- `ryan.owen@ryanowenphotography.com`

To:
- customer.email

Subject:
- `Photo Request: <Listing Address>`

Body requirements:
- mirror current workflow style closely
- greeting
- thank-you text
- queue/review note
- reply-all note
- estimate block
- property details block
- agent details block
- readiness/live dates
- notes
- access details
- signature/disclaimer

### Node 7 — Send Internal Notification Email
From:
- `ryan.owen@ryanowenphotography.com`

To:
- `ryan@ryanowenphotography.com`
- conditionally `rehoboth@penfedrealty.com`

Subject suggestion:
- `New Photo Request: <Listing Address> - <Client Name>`

Body should include:
- request id
- submitted timestamp
- all main request details
- estimate summary
- scheduling/access details

### Node 8 — Append Row to Google Sheets
Workbook:
- `ROM_DATA_2026`

Tab:
- `2026 FORM_DATA`

Append one row with:

#### Existing columns
- `SubmittedAt`
- `ClientFirstName`
- `ClientLastName`
- `ClientEmail`
- `ClientPhone`
- `Company`
- `Bedrooms`
- `List Price`
- `Sq Ft`
- `Listing Address`
- `City`
- `Sales/Rentals`
- `Service`
- `Estimated Line Items`
- `Estimated Total`
- `BillingEmail`

#### New right-side columns
- `BuildingName`
- `Bathrooms`
- `Views`
- `FinishedBasement`
- `DateListingReady`
- `DateToGoLive`
- `DesiredDate`
- `IsVacant`
- `DuringShootAgreement`
- `AccessType`
- `AccessCode`
- `OwnerContactInfo`
- `PhotographerNotes`
- `TermsAccepted`
- `SourceSystem`
- `RequestId`
- `ConfirmationEmailStatus`
- `InternalEmailStatus`

#### Important constraints
Do not write:
- `Message`
- invoice columns
- delivery columns
- `Total`

`Total` remains computed by Google Sheets.

### Node 9 — Return Success Response
Return structured success to Render/backend:
```json
{
  "ok": true,
  "requestId": "...",
  "clientEmailStatus": "SENT",
  "internalEmailStatus": "SENT",
  "sheetWriteStatus": "APPENDED"
}
```

---

## Error handling design

### Case 1 — Client email fails
Recommended behavior:
- do not mark full success
- still attempt internal email and sheet write if appropriate
- flag `ConfirmationEmailStatus = FAILED`
- alert internally

### Case 2 — Internal email fails
Recommended behavior:
- client email and sheet write may still proceed
- flag `InternalEmailStatus = FAILED`
- return partial warning if needed

### Case 3 — Sheet append fails
Recommended behavior:
- high-priority failure
- do not pretend intake succeeded silently
- internal alert required
- backend should know this was not a clean success

### Case 4 — Multiple failures
Recommended behavior:
- fail loudly
- preserve request id
- log payload summary for manual recovery

---

## Suggested email templates

### Client confirmation template structure
```text
Hello {{customer.firstName}} {{customer.lastName}} ,

Thank you for your photo request. Your submission has been recorded below. We will review the information and get back to you with potential dates and times at our next opportunity. Your place in line has been saved. Please make sure to "reply all" (if applicable), so that everybody will have access to any notes and discussions regarding this photo shoot. Thank you again!

Estimate (Final Amount Subject to Change):
{{estimate.lineItemsText}}
Total: ${{estimate.estimatedTotal}}

---------

Address:
{{listing.buildingName}}
{{listing.address}}
{{listing.city}}
{{listing.bedrooms}}
{{listing.bathrooms}}
{{listing.listingSize}}
{{services.finishedBasement}}
{{listing.estimatedPriceBand}}

---------

Agent:
{{customer.firstName}} {{customer.lastName}}
{{customer.email}}
{{customer.phone}}
{{listing.usage}}
{{customer.agency}}

----------

Date Listing will be Ready: {{timing.dateListingReady}}
{{timing.isVacant}}
Date To go Live: {{timing.dateToGoLive}}

-----------

Notes:
{{services.notesForPhotographer}}

------------

Access To the Property:
{{access.accessType}}
Code: {{access.accessCode}}
Owner Info: {{access.ownerContactInfo}}
Terms of Service: {{flags.termsAccepted}}

Thank you!

Ryan Owen
240-401-8385
www.ryanowenphotography.com

*** In order to give every project my full attention, I cannot respond to emails or texts while I am shooting. Thank you for your patience. ***
```

### Internal notification template structure
Include everything above plus:
- `Request ID`
- `Submitted At`
- `SourceSystem`

---

## Recommended status values written to sheet
Use these exact values:
- `ConfirmationEmailStatus`: `SENT` | `FAILED` | `SKIPPED`
- `InternalEmailStatus`: `SENT` | `FAILED` | `SKIPPED`

---

## Recommended sheet write order
Append the row only after email steps complete enough to know statuses.
That way the row records actual outcome instead of placeholder guesses.

If you later want more robustness, you can write first and update statuses second — but for V1, keeping it simple is fine.

---

## Gmail / sender note
Because emails must come from `ryan.owen@ryanowenphotography.com`, n8n will need an authenticated Gmail/Google Workspace send method that supports that sender identity.

That should be verified before construction begins.

---

## Minimal viable V1 node list
1. Webhook
2. Secret validation
3. Required field validation
4. Build variables
5. Build recipient list
6. Send client email
7. Send internal email
8. Append Google Sheets row
9. Return success/failure

---

## Recommendation
Start with one clear n8n workflow that handles the entire intake path.
Do not split this into multiple workflows unless there is a clear operational reason.

That keeps the first build easier to reason about and easier to debug.

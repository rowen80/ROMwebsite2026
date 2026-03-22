# ROM Website 2026 — Task 6: Render to n8n Workflow Blueprint

## Purpose
Define the first implementation-ready workflow for the rebuilt request form.

## V1 architecture
Client browser
-> Render-hosted form/backend
-> n8n webhook workflow
->
  - confirmation email(s)
  - append row to `ROM_DATA_2026` -> `2026 FORM_DATA`

## Hard requirements
- No writes to the live spreadsheet.
- No Zapier.
- Hosted on Render.
- Confirmation emails must be sent from `ryan.owen@ryanowenphotography.com`.
- Customer-facing UI should remain the same or very similar.
- `Total` remains sheet-computed.
- `Message` is reserved for invoice delivery messaging and should not be used for intake details.

## Recommended system responsibilities

### Render backend responsibilities
The Render backend should:
- serve the rebuilt form/application
- validate incoming form payloads
- calculate estimate data using `pricing.json`
- normalize data into a clean internal payload
- send one structured request object to n8n
- return success/failure to the frontend

### n8n responsibilities
n8n should:
- receive the structured payload from Render
- send the client confirmation email
- send internal notification email if desired
- append a new row to `ROM_DATA_2026` -> `2026 FORM_DATA`
- log/branch on success vs failure

### Google Sheets responsibilities
The sheet should:
- receive the request row
- preserve familiar structure
- compute `Total` inside Sheets
- hold logistics/scheduling details in new right-side columns

## Recommended Render -> n8n contract
Render should send one JSON payload with these top-level sections:

```json
{
  "meta": {
    "source": "romwebsite2026",
    "submittedAt": "2026-03-16T19:30:00-04:00",
    "environment": "work|staging|prod",
    "requestId": "uuid-or-generated-id"
  },
  "customer": {
    "firstName": "Sharon",
    "lastName": "Adams",
    "email": "sharonadams@leeanngroup.com",
    "phone": "3026456664",
    "agency": "LeeAnn Group",
    "isFirstTime": true
  },
  "listing": {
    "address": "24049 Bunting Cir",
    "city": "Harbeson",
    "buildingName": "Walden",
    "bedrooms": "3 Bedrooms",
    "bathrooms": "4 Bathrooms",
    "listingSize": "3000 sqft",
    "estimatedPriceBand": "$750k- 1M",
    "usage": "Sales"
  },
  "timing": {
    "dateListingReady": "2026-03-19",
    "dateToGoLive": "2026-03-30",
    "desiredDate": null,
    "isVacant": "It is Occupied",
    "duringShootAgreement": true
  },
  "access": {
    "accessType": "Keys",
    "accessCode": "NA",
    "ownerContactInfo": "Mindy Fisher: 410-925-2056"
  },
  "services": {
    "selected": ["Drone Photos", "Twilight Photos", "Video", "Community Photos"],
    "views": [],
    "finishedBasement": "No, There is not a Basement",
    "notesForPhotographer": "..."
  },
  "estimate": {
    "currency": "USD",
    "lineItemsText": "Drone Photos: $59.00; Twilight Photos: $199.00; Video: $299.00; Community Photos: $49.00;",
    "estimatedTotal": 606
  },
  "flags": {
    "termsAccepted": true
  }
}
```

## Why this contract is good
- n8n gets a single clean object
- emails and sheet mapping both use the same normalized payload
- future scheduling logic has the data it needs
- no need for n8n to reverse-engineer raw browser fields

## Recommended n8n workflow steps

### Step 1: Webhook trigger
- Receive JSON payload from Render backend
- Require secret/auth header if possible

### Step 2: Validate required fields
Minimum required:
- customer first/last name
- customer email
- phone
- address
- city
- usage
- at least one service

If invalid:
- stop workflow
- return error to backend

### Step 3: Prepare email variables
Generate:
- subject line
- formatted estimate block
- property block
- agent block
- timing block
- notes block
- access block

### Step 4: Send client confirmation email
From:
- `ryan.owen@ryanowenphotography.com`

Subject:
- `Photo Request: <Listing Address>`

Body:
- preserve current confirmation style and sections

### Step 5: Send internal notification email (recommended)
To:
- Ryan / ROM internal inbox

This should include the same or slightly richer submission details.

### Step 6: Append row to `ROM_DATA_2026`
Tab:
- `2026 FORM_DATA`

### Step 7: Return success/failure payload
- success for frontend thank-you state
- failure details for backend logging / retry / manual review

## Recommended `2026 FORM_DATA` append mapping

### Existing columns to populate
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

### Existing columns to leave alone
- `InvoiceNumber`
- `Customer ID`
- `Company ID`
- `Match Status`
- `Total` (sheet-calculated)
- all invoice/delivery columns
- `Message`

### New right-side columns to populate
Recommended additions to `2026 FORM_DATA`:
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

### Suggested values for the last two
- `SourceSystem` = `romwebsite2026`
- `RequestId` = generated unique id for tracing/debugging

## Recommended email content contract

### Client confirmation email must include
- greeting with first/last name
- thank-you text
- queue/review expectation
- reply-all instruction
- estimate block
- property block
- agent block
- readiness/live timing block
- notes block
- access block
- Ryan Owen signature/disclaimer

### Internal notification email should include
- all client-submitted details
- request id
- source system
- submitted timestamp
- estimate summary
- direct link or note about workbook target if useful later

## Failure handling recommendations

### If email fails but sheet write succeeds
- mark as partial failure in n8n logs
- send internal alert for manual follow-up

### If sheet write fails but email succeeds
- log high-priority failure
- alert internally
- do not silently swallow the issue

### If both fail
- backend should receive failure and avoid fake success

## Retry strategy
For V1, keep retries simple:
- n8n logs failures
- internal alert on failure
- manual recovery acceptable initially

Do not over-engineer auto-retry before the first working path exists.

## Recommended construction order
1. Add new right-side logistics columns to `2026 FORM_DATA`
2. Finalize field mapping
3. Create n8n webhook workflow
4. Create email templates in n8n
5. Create Google Sheets append node
6. Point Render backend to n8n webhook instead of Zapier
7. Test with non-live submissions

## Open decisions
- exact n8n email transport method for sending as `ryan.owen@ryanowenphotography.com`
- whether internal notification goes to one or multiple recipients
- whether `ROM_CUSTOMERS_2026` stays fully read-only in V1 (recommended: yes)
- whether `BillingEmail` should always equal `ClientEmail` initially (recommended: yes)

## Recommendation
Build the first working path as:
Render validates and prices -> n8n emails and appends -> Sheets computes total.

That preserves the current business feel while cleanly removing Zapier and protecting the live spreadsheet.

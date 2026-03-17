# ROM Website 2026 — V1 Field Mapping and Flow

## Purpose
Define the first rebuild target for the new request form so implementation can proceed without ambiguity.

## V1 hard requirements
- Customer-facing form should look and feel the same or very similar to the current form.
- New form must not point to the live spreadsheet.
- New form must not connect to Zapier.
- Rebuilt system will be hosted on Render.
- Preferred automation path is Render -> n8n -> ROM-owned sheets, pending final pricing/ops confirmation.
- Confirmation emails must be sent from `ryan.owen@ryanowenphotography.com`.
- New intake target is `ROM_DATA_2026`, not the live ROM master workbook.

## Primary workbook target
Workbook: `ROM_DATA_2026`
Spreadsheet ID: `17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ`
Primary tab for request intake: `2026 FORM_DATA`

## Current `2026 FORM_DATA` columns (A:AF currently observed)
1. InvoiceNumber
2. SubmittedAt
3. Customer ID
4. ClientFirstName
5. ClientLastName
6. ClientEmail
7. ClientPhone
8. Company
9. Company ID
10. Match Status
11. Bedrooms
12. List Price
13. Sq Ft
14. Listing Address
15. City
16. Sales/Rentals
17. Service
18. Estimated Line Items
19. Estimated Total
20. Total
21. Deposit
22. Delivered
23. PhotoLink
24. VideoLink
25. LockedLink
26. ManualInvoice
27. InvoicedAt
28. InvoiceStatus
29. InvoicePDFUrl
30. InvoicePreviewUrl
31. BillingEmail
32. Message

## Recommended V1 write strategy
For V1, the rebuilt form should append only the subset of columns needed for clean intake. It should not attempt to populate invoice/delivery columns.

### Recommended V1 populated columns
- `SubmittedAt`
- `ClientFirstName`
- `ClientLastName`
- `ClientEmail`
- `ClientPhone`
- `Company`
- `Bedrooms`
- `List Price` (mapped from estimated price band for continuity unless a new header is added)
- `Sq Ft`
- `Listing Address`
- `City`
- `Sales/Rentals`
- `Service`
- `Estimated Line Items`
- `Estimated Total`
- `BillingEmail` (same as client email unless a separate billing email field is later added)
- `Message` (notes / structured summary)

### Recommended V1 leave-blank columns
- `InvoiceNumber`
- `Customer ID`
- `Company ID`
- `Match Status`
- `Total`
- `Deposit`
- `Delivered`
- `PhotoLink`
- `VideoLink`
- `LockedLink`
- `ManualInvoice`
- `InvoicedAt`
- `InvoiceStatus`
- `InvoicePDFUrl`
- `InvoicePreviewUrl`

These remain part of the workbook for consistency but should not be driven by the rebuilt intake flow yet.

## Current form payload fields observed in the `ROMwebsite2026` repo
- `first_name`
- `last_name`
- `email`
- `phone`
- `agency`
- `usage`
- `address`
- `city`
- `building_name`
- `bedrooms`
- `bathrooms`
- `listing_size`
- `views`
- `finished_basement`
- `estimated_price_band`
- `date_listing_ready`
- `date_to_go_live`
- `desired_date`
- `is_vacant`
- `during_shoot_agreement`
- `access_type`
- `access_code`
- `owner_contact_info`
- `services`
- `notes_for_photographer`
- estimate payload from pricing logic

## V1 field mapping recommendation
| Form field | Suggested `ROM_DATA_2026` target | Notes |
|---|---|---|
| first_name | ClientFirstName | direct |
| last_name | ClientLastName | direct |
| email | ClientEmail | direct |
| phone | ClientPhone | direct |
| agency | Company | direct |
| usage | Sales/Rentals | direct |
| address | Listing Address | direct |
| city | City | direct |
| bedrooms | Bedrooms | direct |
| listing_size | Sq Ft | direct / preserve familiar labels |
| estimated_price_band | List Price | continuity mapping; consider later renaming/additional column |
| services | Service | comma-separated for workbook continuity |
| estimate.line_items | Estimated Line Items | semicolon-separated summary |
| estimate.total | Estimated Total | numeric/string as current sheet expects |
| email (or later billing email field) | BillingEmail | direct for v1 |
| notes_for_photographer | Message | include raw notes plus structured extras if needed |

## Fields that do not map cleanly to current visible columns
These should still be preserved, but V1 should not force them into invoice-delivery fields or awkward top-level columns if avoidable:
- building_name
- bathrooms
- views
- finished_basement
- date_listing_ready
- date_to_go_live
- desired_date
- is_vacant
- during_shoot_agreement
- access_type
- access_code
- owner_contact_info
- notes_for_photographer

### Recommended V1 handling
Do **not** use the `Message` column for these, because that column is used for invoice delivery messaging in the current workbook workflow.

Preferred V1 options:
1. add a dedicated non-invoice notes/details column to `2026 FORM_DATA`, or
2. append one or more new explicit columns for access/scheduling/detail fields, or
3. store these details in the app/backend layer temporarily until the sheet schema is extended intentionally.

Default recommendation: add dedicated new columns rather than overload `Message`.

## Recommended new right-side logistics/scheduling columns for `2026 FORM_DATA`
Add these to the right side of the existing sheet so core business columns remain familiar:
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

### Why place them on the right
- preserves the familiar core intake layout
- reduces disruption to current copy/paste habits
- keeps scheduling/logistics data available for future website scheduling work
- avoids polluting invoice-related columns

This keeps the workbook useful even before all columns are normalized.

## Confirmation email requirements
The rebuilt confirmation email should preserve the current operational feel:
- Subject pattern: `Photo Request: <Listing Address>`
- Thank-you and queue-position language
- Reply-all instruction
- Estimate summary
- Property details block
- Agent details block
- Timing/readiness block
- Notes block
- Access block
- Ryan Owen signature + disclaimer

## Recommended V1 submission flow
1. Client submits rebuilt form UI.
2. Form posts to Render-hosted backend.
3. Backend validates and calculates estimate.
4. Backend hands payload to n8n (preferred) or equivalent workflow layer.
5. n8n:
   - sends client confirmation email from `ryan.owen@ryanowenphotography.com`
   - sends internal notification copy as needed
   - appends a row to `ROM_DATA_2026` -> `2026 FORM_DATA`
6. Frontend shows success / thank-you state.

## Explicit V1 non-goals
- No writes to live ROM spreadsheet.
- No Zapier use.
- No invoice generation.
- No delivery-link handling.
- No deep customer/login rewrite.
- No writes to `ROM_CUSTOMERS_2026` unless explicitly added later.

## Recommendation for next construction step
Before implementation, confirm whether V1 should:
1. append directly into existing `2026 FORM_DATA` columns only, or
2. add a few new explicit columns for fields currently likely to be packed into `Message`.

Default recommendation: start with option 1 for compatibility, then add columns only when clearly useful.

# Phase 1 Test Data - Ready to Insert

**Date:** 2026-03-26 18:55 EDT  
**Prepared by:** Leo  
**Target Sheet:** ROMwebsite2026_data → "2026 FORM_DATA" tab  
**Method:** Manual insertion via Google Sheets UI (safest)

---

## 📊 Test Data Overview

**Total test cases prepared:** 8  
**Total rows to insert:** 11 (some tests use multiple rows)  
**Email recipients:** All emails go to bardo.faraday+tc@gmail.com addresses  
**Invoice numbers:** 9999-0001 through 9999-0005 (expected)

---

## ✅ TC-001: Simple Invoice (No Deposit)

**Purpose:** Verify basic calculation (subtotal only, no deposit)  
**Expected Invoice:** $250.00 subtotal, $0.00 deposit, $250.00 due

### Row Data to Insert

| Field | Value |
|-------|-------|
| InvoiceNumber | (leave blank - will be assigned by script) |
| SubmittedAt | 2026-03-26 12:00:00 |
| ClientFirstName | TC |
| ClientLastName | TEST_001 |
| ClientEmail | bardo.faraday+tc001@gmail.com |
| ClientPhone | 555-0001 |
| Service | Basic Photos |
| Company | PenFed Gallo Realty |
| Bedrooms | 4 Bedrooms |
| ListPrice | 750000 |
| SqFt | 2400 |
| ListingAddress | 123 Test Lane Unit A |
| City | Ocean City |
| SalesRentals | Sales |
| EstLineItems | Basic Photos: $199.00; Drone: $49.00 |
| EstTotal | 248 |
| **Total** | **250** |
| **Deposit** | (blank) |
| Delivered | (blank - will be set by script) |
| PhotoLink | https://drive.google.com/test/tc001 |
| VideoLink | (blank) |
| LockedLink | (blank) |
| ManualInvoice | (blank) |
| InvoicedAt | (blank - will be set by script) |
| InvoiceStatus | (blank) |
| InvoicePDFUrl | (blank - will be set by script) |
| InvoicePreviewUrl | (blank) |
| BillingEmail | (blank - will use CO_BILLING_INFO) |
| Message | This is a test invoice for TC-001. |

**Copy-paste ready (TSV format for Google Sheets):**
```
	2026-03-26 12:00:00		TC	TEST_001	bardo.faraday+tc001@gmail.com	555-0001	Basic Photos	PenFed Gallo Realty	4 Bedrooms	750000	2400	123 Test Lane Unit A	Ocean City	Sales	Basic Photos: $199.00; Drone: $49.00	248	250				https://drive.google.com/test/tc001							This is a test invoice for TC-001.
```

---

## ✅ TC-002: Invoice with Deposit

**Purpose:** Verify deposit subtraction ($500 - $200 = $300)  
**Expected Invoice:** $500.00 subtotal, $200.00 deposit, $300.00 due

### Row Data to Insert

| Field | Value |
|-------|-------|
| SubmittedAt | 2026-03-26 12:05:00 |
| ClientFirstName | TC |
| ClientLastName | TEST_002 |
| ClientEmail | bardo.faraday+tc002@gmail.com |
| ClientPhone | 555-0002 |
| Service | Basic Photos, Drone, Twilights |
| Company | Keller Williams |
| Bedrooms | 5 Bedrooms |
| ListPrice | 895000 |
| SqFt | 3100 |
| ListingAddress | 456 Oak Avenue |
| City | Ocean City |
| SalesRentals | Sales |
| EstLineItems | Basic Photos: $199.00; Drone: $49.00; Twilights: $99.00; 3D Matterport: $149.00 |
| EstTotal | 496 |
| **Total** | **500** |
| **Deposit** | **200** |
| PhotoLink | https://drive.google.com/test/tc002 |
| Message | Test invoice with deposit - TC-002. |

**Copy-paste ready (TSV):**
```
	2026-03-26 12:05:00		TC	TEST_002	bardo.faraday+tc002@gmail.com	555-0002	Basic Photos, Drone, Twilights	Keller Williams	5 Bedrooms	895000	3100	456 Oak Avenue	Ocean City	Sales	Basic Photos: $199.00; Drone: $49.00; Twilights: $99.00; 3D Matterport: $149.00	496	500	200			https://drive.google.com/test/tc002							Test invoice with deposit - TC-002.
```

---

## ✅ TC-003: Full Deposit (Zero Due)

**Purpose:** Edge case - deposit equals total ($300 - $300 = $0)  
**Expected Invoice:** $300.00 subtotal, $300.00 deposit, $0.00 due

### Row Data to Insert

| Field | Value |
|-------|-------|
| SubmittedAt | 2026-03-26 12:10:00 |
| ClientFirstName | TC |
| ClientLastName | TEST_003 |
| ClientEmail | bardo.faraday+tc003@gmail.com |
| ClientPhone | 555-0003 |
| Service | Basic Photos, Drone |
| Company | Central Reservations |
| Bedrooms | 3 Bedrooms |
| ListPrice | 550000 |
| SqFt | 1800 |
| ListingAddress | 789 Beach Road |
| City | Ocean City |
| SalesRentals | Rentals |
| EstLineItems | Basic Photos: $199.00; Drone: $99.00 |
| EstTotal | 298 |
| **Total** | **300** |
| **Deposit** | **300** |
| PhotoLink | https://drive.google.com/test/tc003 |
| Message | Full deposit paid - testing zero balance invoice. |

**Copy-paste ready (TSV):**
```
	2026-03-26 12:10:00		TC	TEST_003	bardo.faraday+tc003@gmail.com	555-0003	Basic Photos, Drone	Central Reservations	3 Bedrooms	550000	1800	789 Beach Road	Ocean City	Rentals	Basic Photos: $199.00; Drone: $99.00	298	300	300			https://drive.google.com/test/tc003							Full deposit paid - testing zero balance invoice.
```

---

## ✅ TC-004: Multi-Row Company Invoice (3 rows)

**Purpose:** Verify summation across multiple jobs for same company  
**Expected Invoice:** $449.00 subtotal (199+150+100), $75.00 deposits (0+50+25), $374.00 due  
**Important:** All 3 rows get same invoice number and email goes to company billing address

### Row 1 Data

| Field | Value |
|-------|-------|
| SubmittedAt | 2026-03-26 12:15:00 |
| ClientFirstName | TC |
| ClientLastName | TEST_004A |
| ClientEmail | bardo.faraday+tc004a@gmail.com |
| Company | PenFed Gallo Realty |
| Bedrooms | 3 Bedrooms |
| ListingAddress | 111 Coastal Way |
| City | Ocean City |
| EstLineItems | Basic Photos: $199.00 |
| EstTotal | 199 |
| **Total** | **199** |
| **Deposit** | (blank) |
| PhotoLink | https://drive.google.com/test/tc004a |

**TSV:**
```
	2026-03-26 12:15:00		TC	TEST_004A	bardo.faraday+tc004a@gmail.com		Basic Photos	PenFed Gallo Realty	3 Bedrooms		  	111 Coastal Way	Ocean City	 	Basic Photos: $199.00	199	199				https://drive.google.com/test/tc004a							
```

### Row 2 Data

| Field | Value |
|-------|-------|
| SubmittedAt | 2026-03-26 12:20:00 |
| ClientFirstName | TC |
| ClientLastName | TEST_004B |
| ClientEmail | bardo.faraday+tc004b@gmail.com |
| Company | PenFed Gallo Realty |
| Bedrooms | 2 Bedrooms |
| ListingAddress | 222 Shore Drive |
| City | Ocean City |
| EstLineItems | Basic Photos: $149.00 |
| EstTotal | 149 |
| **Total** | **150** |
| **Deposit** | **50** |
| PhotoLink | https://drive.google.com/test/tc004b |

**TSV:**
```
	2026-03-26 12:20:00		TC	TEST_004B	bardo.faraday+tc004b@gmail.com		Basic Photos	PenFed Gallo Realty	2 Bedrooms			222 Shore Drive	Ocean City		Basic Photos: $149.00	149	150	50			https://drive.google.com/test/tc004b							
```

### Row 3 Data

| Field | Value |
|-------|-------|
| SubmittedAt | 2026-03-26 12:25:00 |
| ClientFirstName | TC |
| ClientLastName | TEST_004C |
| ClientEmail | bardo.faraday+tc004c@gmail.com |
| Company | PenFed Gallo Realty |
| Bedrooms | 1 Bedroom |
| ListingAddress | 333 Marina Court |
| City | Ocean City |
| EstLineItems | Basic Photos: $99.00 |
| EstTotal | 99 |
| **Total** | **100** |
| **Deposit** | **25** |
| PhotoLink | https://drive.google.com/test/tc004c |

**TSV:**
```
	2026-03-26 12:25:00		TC	TEST_004C	bardo.faraday+tc004c@gmail.com		Basic Photos	PenFed Gallo Realty	1 Bedroom			333 Marina Court	Ocean City		Basic Photos: $99.00	99	100	25			https://drive.google.com/test/tc004c							
```

---

## ✅ TC-005: Blank Total (Edge Case)

**Purpose:** Verify script handles blank Total field (should treat as $0.00)  
**Expected Invoice:** $0.00 subtotal, $0.00 deposit, $0.00 due

### Row Data to Insert

| Field | Value |
|-------|-------|
| SubmittedAt | 2026-03-26 12:30:00 |
| ClientFirstName | TC |
| ClientLastName | TEST_005 |
| ClientEmail | bardo.faraday+tc005@gmail.com |
| Company | LeeAnn Group |
| ListingAddress | 999 Empty Lane |
| City | Ocean City |
| EstLineItems | TBD |
| EstTotal | (blank) |
| **Total** | **(blank - leave empty)** |
| **Deposit** | (blank) |
| PhotoLink | https://drive.google.com/test/tc005 |
| Message | Testing blank total field handling. |

**TSV:**
```
	2026-03-26 12:30:00		TC	TEST_005	bardo.faraday+tc005@gmail.com			LeeAnn Group			  		999 Empty Lane	Ocean City		TBD						https://drive.google.com/test/tc005							Testing blank total field handling.
```

---

## 📝 Insertion Instructions

### Option 1: Manual Row-by-Row (SAFEST - RECOMMENDED)

1. Open staging sheet: https://docs.google.com/spreadsheets/d/17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ/edit
2. Go to **2026 FORM_DATA** tab
3. Scroll to first empty row (below existing data)
4. For each test case above:
   - Copy the table row data
   - Paste values manually into correct columns
   - Verify Total and Deposit columns especially
5. Double-check all 11 rows inserted correctly

**Time:** ~20 minutes  
**Risk:** LOW (visual verification at each step)

---

### Option 2: Copy TSV Blocks (FASTER)

1. Open staging sheet
2. Go to **2026 FORM_DATA** tab
3. Click first empty cell in Column A (InvoiceNumber column)
4. Copy the TSV block for each test case
5. Paste into sheet (Cmd+V)
6. Verify columns align correctly
7. Repeat for all test cases

**Time:** ~10 minutes  
**Risk:** MEDIUM (column alignment errors possible)

---

## ✅ Pre-Insertion Checklist

Before inserting any test data:

- [ ] Apps Script deployed successfully
- [ ] ROM Ops menu visible in sheet
- [ ] SETTINGS!B1 = 9999-0001 (test invoice sequence)
- [ ] Smoke test passed (script runs without errors)
- [ ] Backup of current sheet state taken (optional but recommended)

---

## 🧪 Post-Insertion Validation

After inserting all test data:

1. **Count rows:** Should have 11 new rows with LastName starting with "TEST_"
2. **Verify companies:**
   - PenFed Gallo Realty: 3 rows (TC-004A, 004B, 004C)
   - Keller Williams: 1 row (TC-002)
   - Central Reservations: 1 row (TC-003)
   - LeeAnn Group: 1 row (TC-005)
3. **Check Total column:** Should have values: 250, 500, 300, 199, 150, 100, (blank)
4. **Check Deposit column:** Should have values: (blank), 200, 300, (blank), 50, 25, (blank)
5. **Check PhotoLink column:** All rows should have test URLs

---

## 🎯 Ready for Test Execution

Once data is inserted and validated:

1. **TC-001 Test Run:**
   - Click: ROM Ops → Delivery → Send Photos + Invoice (≤3 rows) (by ClientLastName)
   - Enter: TEST_001
   - Verify email received at bardo.faraday+tc001@gmail.com
   - Check invoice PDF for correct calculations

2. **Continue through TC-002 to TC-005**

---

## 🔄 Data Cleanup After Testing

To remove test data:

1. Go to 2026 FORM_DATA tab
2. Filter ClientLastName column by "TEST_"
3. Select all filtered rows
4. Right-click → Delete rows
5. Clear filter
6. Restore SETTINGS!B1 to production value (2026-1740)
7. Delete test invoices from ROM_INVOICES_test folder

---

**Status:** ⏸️ READY - Awaiting script deployment completion

**Last Updated:** 2026-03-26 18:55 EDT

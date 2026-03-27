# TC-001 to TC-005: Manual Calculation Verification

**Date:** 2026-03-26 18:35 EDT  
**Tester:** Leo  
**Method:** Manual inspection of staging sheet data

---

## Test Data Analysis

### Row 3: David T. King (PenFed Gallo Realty)
**Invoice:** 2026-1702  
**Estimated Line Items:** "Basic Photos: $199.00; Drone: $49.00;"  
**Estimated Total Column (S):** 347  
**Actual Total Column (T):** (blank)  
**Deposit Column (U):** (blank)

**Manual Calculation:**
- Basic Photos: $199.00
- Drone Photos: $49.00
- **Expected Subtotal:** $248.00
- **Deposit:** $0.00
- **Expected Amount Due:** $248.00

**⚠️ DISCREPANCY FOUND:**
- Estimated Total shows $347, but line items only total $248
- Missing item: "Community Photos" mentioned in Service column (column Q)
- Service column says: "Basic Photos, Drone Photos, Community Photos"
- Line items missing Community Photos pricing

**Analysis:**
The "Estimated Total" (column S) appears to be a **user-entered estimate**, not a formula.
The "Estimated Line Items" (column R) is **incomplete** - missing Community Photos.
This suggests the workflow expects Ryan to manually fill column T (Total) after editing prices.

---

### Row 4: Anthony Sacco (Other)
**Invoice:** 2026-1700  
**Estimated Line Items:** "Basic Photos: $189.00; Zillow 360 Tour: $99.00;"  
**Estimated Total:** 288  
**Service:** "Basic Photos, Zillow 360 Tour, Zillow Floor Plan"

**Manual Calculation:**
- Basic Photos: $189.00
- Zillow 360 Tour: $99.00
- **Subtotal from line items:** $288.00
- **Expected:** $288.00 ✅

**Missing:** Zillow Floor Plan pricing not in line items, but estimated total matches two items.

---

### Row 5: Elizabeth Evans (PenFed Gallo Realty)
**Invoice:** 2026-1702  
**Estimated Line Items:** "Drone Photos: $99.00"  
**Estimated Total:** 99  
**Service:** "Drone Photos"

**Manual Calculation:**
- Drone Photos: $99.00
- **Expected:** $99.00 ✅

---

### Row 6: Sandra Ware (PenFed Gallo Realty)
**Invoice:** 2026-1702  
**Estimated Line Items:** "Basic Photos: $209.00, Drone: $49.00"  
**Estimated Total:** 209  
**Service:** "Basic Photos"

**Manual Calculation:**
- Basic Photos: $209.00
- Drone: $49.00 (mentioned in line items)
- **Subtotal from line items:** $258.00
- **Estimated Total:** $209.00

**⚠️ DISCREPANCY:**
- Line items mention Drone ($49), but Estimated Total is only $209
- Suggests Drone was removed or Estimated Total not updated

---

### Row 10: Rafael Semidey (Keller Williams)
**Invoice:** 2026-1703  
**Estimated Line Items:** "Basic Photos: $199.00; Drone Photos: $59.00"  
**Estimated Total:** 307  
**Deposit:** 150  
**Service:** "Basic Photos,Drone Photos,Community Photos"

**Manual Calculation:**
- Basic Photos: $199.00
- Drone Photos: $59.00
- **Subtotal from line items:** $258.00
- **Estimated Total:** $307.00

**⚠️ DISCREPANCY:**
- Line items total $258, but Estimated Total is $307
- Difference: $49 (likely Community Photos, not priced in line items)
- **With Community at $49: $258 + $49 = $307** ✅

**Deposit Calculation:**
- Deposit: $150.00
- **Amount Due:** $307.00 - $150.00 = **$157.00** ✅

---

## Key Findings

### 1. Column S ("Estimated Total") vs Line Items
**Pattern Discovered:**
- Column S (Estimated Total) is **user-entered** and may include items not in column R
- Column R (Estimated Line Items) is often **incomplete**
- **Actual pricing source:** Column T (Total) appears to be where Ryan manually enters final price

### 2. Workflow Understanding
The script likely works as follows:

```
User fills form → Estimated prices generated → Ryan reviews/edits
→ Ryan fills Column T (Total) manually → Script reads Column T for invoice
```

**This means:**
- TC-001 to TC-005 need to test **Column T values**, not Column R or S
- If Column T is blank, script behavior is unknown (error? use estimate? skip?)

### 3. Current Test Data State
Looking at the data:
- Column T (Total) is **BLANK** for all test rows shown
- This is likely because these rows are "delivered" but not yet invoiced
- **Need to check:** Does script use Column T or Column S?

---

## ✅ Apps Script Logic Confirmed

**Script Source Code Review (line 506, 1811-1822):**

```javascript
// Line 506: Subtotal calculation
const subtotal = sumMoney_(items.map(it => it.row[ctx.idx[COLS.Total]]));
const deposit = sumMoney_(items.map(it => it.row[ctx.idx[COLS.Deposit]]));
const amountDue = round2_(subtotal - deposit);

// Line 1811: sumMoney_ helper
function sumMoney_(arr) {
  return round2_(arr.reduce((acc, v) => acc + toNumber_(v), 0));
}

// Line 1815: toNumber_ helper
function toNumber_(v) {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number") return v;
  const s = String(v).replace(/[$,]/g, "").trim();
  const n = Number(s);
  return isNaN(n) ? 0 : n;
}
```

**Confirmed Behavior:**

1. **Column T ("Total")** is the authoritative source for invoice amounts
2. **Blank/empty values default to $0.00**
3. **Dollar signs and commas are stripped** before parsing
4. **Column S ("Estimated Total") is NOT used** by the script
5. **Column R ("Estimated Line Items") is NOT parsed** for calculations

**Impact on Testing:**
- Must set Column T values explicitly for all test rows
- Cannot rely on Column S (Estimated Total) for calculations
- Blank Column T will result in $0.00 invoices (valid edge case)

---

## TC-001: Basic Calculation Test
**Status:** ⏸️ PAUSED  
**Reason:** Need to verify which column script reads for totals

**Once confirmed, test plan:**
1. Set Column T to a known value (e.g., $250.00)
2. Run script in preview mode
3. Verify invoice shows $250.00 as subtotal
4. Verify Amount Due = $250.00 (if deposit blank)

---

## TC-002: Calculation with Deposit
**Status:** ⏸️ PAUSED  
**Test Row:** Row 10 (Rafael Semidey)

**Test Data:**
- Column T (Total): $307.00
- Column U (Deposit): $150.00
- Expected Amount Due: $157.00

**Test Plan:**
1. Ensure Row 10 has Total = $307, Deposit = $150
2. Run script preview
3. Verify invoice shows:
   - Subtotal: $307.00
   - Deposit: $150.00
   - Amount Due: $157.00

---

## Next Steps

1. **Read Apps Script** - Find calculation logic (5 min)
2. **Update test plan** based on findings (5 min)
3. **Prepare test data** - Set Column T values for test rows (10 min)
4. **Resume TC-001 to TC-005** with correct understanding

---

**Log Status:** Analysis complete, awaiting script review

# Known Issues

---

## n8n: Total Column Overwritten in Google Sheet

**Status:** Unresolved — deferred
**Date noted:** 2026-04-05

### What happens
When n8n appends a new row to the `2026 FORM_DATA` sheet, the **Total** column cell for that new row is left blank. The Total column contains an ARRAYFORMULA that parses dollar amounts from the Estimated Line Items column. Manually deleting the blank cell restores the formula immediately — confirming the data and formula are correct, but something about the row insertion leaves the cell in a blank/static state.

### Root cause (confirmed)
n8n uses the Google Sheets API `values.append` which **physically inserts a new row**. When a row is physically inserted via API, the ARRAYFORMULA does not automatically cover the new cell the same way it does for naturally empty rows. The cell starts blank, and because it has explicit blank content (not a formula-spill), the ARRAYFORMULA doesn't override it.

This is distinct from n8n writing `""` to the Total column — n8n does **not** have Total in its `defineBelow` mapping and confirmed does not write to it directly.

### What does NOT fix it
- Removing BillingEmail from the n8n column mapping (tried)
- Adding a Code node to pre-build the row object with autoMapInputData (tried — same insert behavior)
- Deleting the "Total" header from row 1 (Ryan rejected — other scripts depend on it)
- Inserting a blank buffer column between Estimated Total and Total (Ryan rejected)

### The Total formula (for reference)
Located in the Total column, first data row:
```
=ARRAYFORMULA(
  IF(R2:R="","",
    ROUND(
      BYROW(R2:R,
        LAMBDA(x,
          SUMPRODUCT(
            IFERROR(
              VALUE(
                FILTER(
                  SPLIT(REGEXREPLACE(x,"[^0-9.\$]",""),"$"),
                  SPLIT(REGEXREPLACE(x,"[^0-9.\$]",""),"$")<>""
                )
              ),
            0)
          )
        )
      ),
    2)
  )
)
```
References column R (Estimated Line Items). Open-ended range so it should cover all rows — but physically inserted rows are the exception.

### Possible solutions to evaluate
1. **Add a Google Sheets "clear cell" step in n8n** after the append — get the row number from the append response, clear just the Total cell in that row, letting ARRAYFORMULA take over. Requires knowing the inserted row number.
2. **Replace ARRAYFORMULA with a trigger-based Apps Script** — on sheet edit/change, write the formula result into Total for new rows. More robust against API insertions.
3. **Accept manual fix** — after each new submission, delete the blank Total cell (one click). Low volume business so may be acceptable.

---

## n8n: InvoiceStatus Column Has Same ARRAYFORMULA Problem

**Status:** Unresolved — deferred (confirmed 2026-04-05)
**Related issue:** Same root cause as "Total Column Overwritten" above

### What happens
The `InvoiceStatus` column in `2026 FORM_DATA` uses an ARRAYFORMULA to pull invoice status from the `INVOICES` tab (e.g., SENT, PAID). When n8n appends a new row via the Google Sheets API `values.append`, the cell is left in a blank/static state — the ARRAYFORMULA does not cover it. As a result, the Apps Script workflows that read `InvoiceStatus` from FORM_DATA (e.g., Thank You Download Link) see a blank status and filter the row out as ineligible.

**Confirmed test:** Deleting the entire InvoiceStatus column (removing the static blank cells) caused the ARRAYFORMULA to re-cover the range and the Thank You workflow immediately found the eligible row and worked correctly.

### Impact
- **Thank You Download Link** workflow: rows are silently skipped because `InvoiceStatus` reads as blank instead of "PAID"
- Any other workflow that reads `InvoiceStatus` from FORM_DATA is affected by the same issue

### Root cause
Same as the Total column issue: `values.append` physically inserts a row, leaving an explicit blank in the ARRAYFORMULA-covered column. The ARRAYFORMULA does not override explicit blanks in physically inserted rows.

### Possible solutions to evaluate
Same options as the Total column — the most robust fix would be a single solution that addresses both columns at once (e.g., an n8n step that clears the affected cells after append, or replacing both ARRAYFORMULAs with a trigger-based Apps Script).

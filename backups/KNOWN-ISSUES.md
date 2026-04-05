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

# Fix Sheet "=" Problem

## The Issue
Every cell in the Google Sheet starts with "=" because n8n is treating the expressions as formulas.

## The Fix

**In n8n, in the "Append to Sheet" node:**

For EVERY field mapping, the expressions need to NOT start with `=`

**Currently they look like:**
```
={{ $('Validate Required Fields').item.json.body.customer.firstName }}
```

**Change to (remove the leading `=`):**
```
{{ $('Validate Required Fields').item.json.body.customer.firstName }}
```

## Quick Method:

1. Click on **"Append to Sheet"** node
2. For EACH field (ClientFirstName, ClientLastName, etc.):
   - Click in the field
   - Remove the `=` at the beginning
   - Should start with `{{` not `={{`
3. Do this for ALL 16+ fields
4. Click **Publish**

---

OR I can create a completely fixed workflow JSON with all corrections. Let me know if you want that instead!

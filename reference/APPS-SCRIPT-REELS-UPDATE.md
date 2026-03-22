# Apps Script Update: Add ReelsLink Support

## What Changed
Added ReelsLink column support to delivery emails (Photos Only, Photos + Invoice, Thank You).
Does NOT add to Locked Photos workflow (as requested).

---

## Step 1: Update COLS constant

Find this section (around line 162):
```javascript
 PhotoLink: "PhotoLink",
 VideoLink: "VideoLink",
 LockedLink: "LockedLink",
```

Change to:
```javascript
 PhotoLink: "PhotoLink",
 VideoLink: "VideoLink",
 ReelsLink: "ReelsLink",
 LockedLink: "LockedLink",
```

---

## Step 2: Update validateColumns_ calls

### In runPhotosOnly_() - around line 305:
Find:
```javascript
 COLS.InvoiceNumber, COLS.InvoiceStatus, COLS.Delivered, COLS.PhotoLink, COLS.VideoLink, COLS.ListingAddress
```

Change to:
```javascript
 COLS.InvoiceNumber, COLS.InvoiceStatus, COLS.Delivered, COLS.PhotoLink, COLS.VideoLink, COLS.ReelsLink, COLS.ListingAddress
```

### In runPhotosPlusInvoice_() - around line 385:
Find:
```javascript
 COLS.InvoiceNumber, COLS.InvoiceStatus, COLS.Delivered, COLS.PhotoLink, COLS.VideoLink,
```

Change to:
```javascript
 COLS.InvoiceNumber, COLS.InvoiceStatus, COLS.Delivered, COLS.PhotoLink, COLS.VideoLink, COLS.ReelsLink,
```

### In runThankYouDownloadLink_() - around line 660:
Find:
```javascript
 COLS.Delivered, COLS.PhotoLink, COLS.VideoLink, COLS.ListingAddress,
```

Change to:
```javascript
 COLS.Delivered, COLS.PhotoLink, COLS.VideoLink, COLS.ReelsLink, COLS.ListingAddress,
```

---

## Step 3: Update buildMediaLinksText_() function

Find this function (around line 1320):

**REPLACE the entire function with:**

```javascript
function buildMediaLinksText_(items, idx) {
 const blocks = items.map(it => {
 const addr = String(it.row[idx[COLS.ListingAddress]] || "").trim() || "(No address)";
 const photo = String(it.row[idx[COLS.PhotoLink]] || "").trim();
 const video = String(it.row[idx[COLS.VideoLink]] || "").trim();
 const reels = String(it.row[idx[COLS.ReelsLink]] || "").trim();

 let s = "";
 s += `${addr} Photo Link:\n${photo || "(No photo link)"}\n\n`;

 if (video) {
 s += `${addr} Video Link:\n${video}\n\n`;
 }

 if (reels) {
 s += `${addr} Reels Link:\n${reels}\n\n`;
 }

 return s;
 });
 return blocks.join("\n");
}
```

---

## Step 4: Update buildMediaLinksHtml_() function

Find this function (around line 1340):

**REPLACE the entire function with:**

```javascript
function buildMediaLinksHtml_(items, idx) {
 const blocks = items.map(it => {
 const addr = String(it.row[idx[COLS.ListingAddress]] || "").trim() || "(No address)";
 const photo = String(it.row[idx[COLS.PhotoLink]] || "").trim();
 const video = String(it.row[idx[COLS.VideoLink]] || "").trim();
 const reels = String(it.row[idx[COLS.ReelsLink]] || "").trim();

 let s = "";
 s += `<b>${escapeHtml_(addr)} Photo Link:</b><br>${linkOrTextHtml_(photo)}<br><br>`;

 if (video) {
 s += `<b>${escapeHtml_(addr)} Video Link:</b><br>${linkOrTextHtml_(video)}<br><br>`;
 }

 if (reels) {
 s += `<b>${escapeHtml_(addr)} Reels Link:</b><br>${linkOrTextHtml_(reels)}<br><br>`;
 }

 return s;
 });
 return blocks.join("");
}
```

---

## Done!

Save the Apps Script and test by:
1. Adding a ReelsLink URL to a test row in the sheet
2. Running "Send Photos Only" or "Send Photos + Invoice" for that row
3. Check the email - it should include the Reels Link

---

## Notes

- ReelsLink only appears in emails if the column has a value (it's optional)
- Locked Photos workflow was NOT modified (as requested)
- The email will show: Photo Link → Video Link → Reels Link (in that order)

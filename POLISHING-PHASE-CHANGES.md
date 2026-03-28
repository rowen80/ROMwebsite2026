# ROM Website Polishing Phase - Changes Report

**Date:** March 27, 2026  
**Environment:** Staging (ROMwebsite2026_data sheet, githubrequestform-work.onrender.com)  
**Status:** Implementation Complete - Testing Required

---

## ✅ Task 1: Google Sheet Changes (ROMwebsite2026_data)

### Completed
- **Apps Script Code.js updated** to support TourLink column:
  - Added `TourLink: "TourLink"` to COLS definition
  - Updated `buildMediaLinksText_()` to include Tour Link in plain text emails
  - Updated `buildMediaLinksHtml_()` to include Tour Link in HTML emails
  - Added TourLink to column validation arrays for:
    - Photos Only emails
    - Photos + Invoice emails
    - Thank You emails
  - Locked emails correctly exclude TourLink (they use LockedLink only)

### Manual Steps Required
1. **Add "TourLink" column to ROMwebsite2026_data sheet**
   - Location: Insert to the right of "ReelsLink" column
   - Header: "TourLink"
   - Leave cells blank until tours are delivered

2. **Remove "Services" column** from the sheet
   - This column is no longer needed (service data captured in Service field)

3. **Deploy updated Apps Script**
   - Open Google Sheet → Extensions → Apps Script
   - Copy updated `apps-script/Code.js` to the script editor
   - Save and test with a sample row

### Verification
- ✅ TourLink included in: Photos Only, Photos + Invoice, Thank You emails
- ✅ TourLink NOT included in: Locked emails
- ⚠️ Manual: Verify columns exist in sheet before deploying script

---

## ✅ Task 2: Booking Form (booking_form.html)

### Completed
1. **Interior Twilights service added**
   - New checkbox: "Interior Twilights" ($199)
   - Added smart link in Twilight Photos popup: "Click here to add interior twilights"
   - Note included: "(may require two shoots)"

2. **Community Interiors option added**
   - New checkbox: "Community Interiors"
   - Added info popup to "Community Photos" with smart link
   - Popup text: "Click here if there are indoor amenities (Permission must be granted...)"
   - Pricing logic: Community Photos ($49) + Community Interiors ($100) = $149 total

3. **Floor plan popup image fixed**
   - Changed from: `https://githubrequestform.onrender.com/static/floor_plan.jpg`
   - Changed to: `/static/floor_plan.jpg` (local copy verified to exist)

4. **Zillow 360 Tour → Zillow Tour remapping**
   - Form checkbox still displays "Zillow 360 Tour" (user-facing)
   - JavaScript remaps value to "Zillow Tour" before sending to sheet
   - Ensures clean sheet export without changing user experience

### Testing Required
- [ ] Click "Twilight Photos" info button → verify interior twilights link works
- [ ] Click "Community Photos" info button → verify community interiors link works
- [ ] Click "Zillow Floor Plan" info button → verify image displays correctly
- [ ] Submit form with "Zillow 360 Tour" → verify sheet receives "Zillow Tour"

---

## ✅ Task 3: Pricing Changes (pricing.json + api.py)

### pricing.json Updates
```json
"Interior Twilights": { "base": 199, "apply_multipliers": false }
"Community Interiors": { "base": 100, "apply_multipliers": false }
```

### api.py Conditional Pricing Logic
Implemented in `build_estimate()` function:

1. **Drone ONLY = $99**
   - Condition: Drone Photos selected AND no other services (except optionally Basic Photos)
   - Old price: $59 → New price: $99

2. **Reels WITHOUT Video = $199**
   - Condition: Instagram Reels selected WITHOUT Video
   - Old price: $99 → New price: $199

3. **Floor Plan WITHOUT Zillow 360 or Matterport = $99**
   - Condition: Zillow Floor Plan selected WITHOUT Zillow 360 Tour OR Matterport 360
   - Old price: $0 → New price: $99

4. **Community Interiors pricing**
   - Community Photos base: $49
   - Community Interiors: $100
   - Combined total: $149
   - Pricing automatically adjusts when both are selected

### Confirmation Email - HOA Permission Message
**Status:** ⚠️ NOT YET IMPLEMENTED

**Requirement:** When Community Interiors selected, add to confirmation email:
```
Total: $XXX.XX

You have agreed to obtain permission from HOA management to shoot inside the Community facilities and to provide access.

--------------------------
```

**Implementation needed:**
- Modify backend email generation logic (likely in api.py or email template)
- Detect if "Community Interiors" in services
- Insert message after total, above divider line, with space above/below

### Testing Required
- [ ] Submit form with ONLY Drone Photos → verify $99 charge
- [ ] Submit form with Reels (no Video) → verify $199 charge
- [ ] Submit form with Floor Plan (no Zillow 360/Matterport) → verify $99 charge
- [ ] Submit form with Community Photos + Community Interiors → verify $149 total
- [ ] Verify confirmation email shows HOA permission message (after implementation)

---

## ✅ Task 4: Portfolio Page (site/portfolio.html)

### Completed
1. **Removed filter tabs**
   - All, Real Estate, Twilight, Fine Art tabs removed
   - Gallery now shows all images without filtering

2. **Removed images**
   - `fine-art-canal-01.jpg` ❌
   - `fine-art-canal-02.jpg` ❌
   - `fine-art-inlet.jpg` ❌

3. **Images to add** (commented placeholders added)
   - `Serenebe-4.jpg` - needs to be added to `/site/images/portfolio/`
   - `Belmont704-4.jpg` - needs to be added to `/site/images/portfolio/`

### Manual Steps Required
1. Source or rename image files:
   - Find/create `Serenebe-4.jpg`
   - Find/create `Belmont704-4.jpg` (note: `re-belmont-03.jpg` exists, may be suitable)
2. Place in `/site/images/portfolio/` directory
3. Uncomment HTML blocks in `portfolio.html` (lines marked with `<!-- NEW ADDITIONS -->`)

### Testing Required
- [ ] Portfolio page loads without filter tabs
- [ ] Removed images no longer appear
- [ ] After adding images: verify new images appear and lightbox works

---

## ✅ Task 5: Services Page (site/services.html)

### Completed
Added thumbnails to service cards:
- ✅ Basic Photos → `images/realestate.jpg`
- ✅ Catalogue Style Photos → `images/catalogue.jpg`
- ✅ Drone Photos → `images/drone.jpg`
- ✅ Twilight Photos → `images/twilight.jpg`
- ✅ Community Photos → `images/community.jpg`

All images verified to exist in `/site/images/` directory.

### Testing Required
- [ ] Services page loads correctly
- [ ] All 5 thumbnails display properly
- [ ] Page layout looks consistent with home page service cards

---

## ✅ Task 6: Home Page (site/index.html)

### Completed
**Bio section moved** from above Services Preview to below Video Band:
- Old order: Hero → Bio → Services → Video → CTA → Footer
- New order: Hero → Services → Video → Bio → CTA → Footer

Content remains identical, only position changed.

### Testing Required
- [ ] Home page loads correctly
- [ ] Bio section appears below "Sell your listing faster with video"
- [ ] Page flow feels natural
- [ ] Mobile layout works properly

---

## 🧪 Testing Checklist Summary

### Backend Functionality
- [ ] Deploy updated Apps Script to Google Sheet
- [ ] Add TourLink column to sheet (to right of ReelsLink)
- [ ] Remove Services column from sheet
- [ ] Test backend pricing calculations with various service combinations
- [ ] Verify confirmation email generation (HOA message pending implementation)

### Frontend Functionality
- [ ] Test booking form popups (Twilight, Community, Floor Plan)
- [ ] Submit test booking with new services (Interior Twilights, Community Interiors)
- [ ] Verify "Zillow 360 Tour" → "Zillow Tour" remapping
- [ ] Test portfolio page (removed images, filter tabs gone)
- [ ] Test services page (thumbnails display)
- [ ] Test home page (bio section moved)

### Email Delivery
- [ ] Test Photos Only email → should include TourLink
- [ ] Test Photos + Invoice email → should include TourLink
- [ ] Test Thank You email → should include TourLink
- [ ] Test Locked email → should NOT include TourLink
- [ ] Test confirmation email with Community Interiors (after HOA message implemented)

### Cross-Browser / Device Testing
- [ ] Desktop Chrome
- [ ] Desktop Safari
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

---

## 📋 Implementation Status

| Task | Status | Files Changed | Notes |
|------|--------|---------------|-------|
| 1. Google Sheet | 🟡 Partial | `apps-script/Code.js` | Script ready, manual column changes needed |
| 2. Booking Form | ✅ Complete | `booking_form.html` | Ready for testing |
| 3. Pricing Changes | 🟡 Partial | `pricing.json`, `api.py` | Logic complete, HOA email message pending |
| 4. Portfolio Page | 🟡 Partial | `site/portfolio.html` | Code ready, images needed |
| 5. Services Page | ✅ Complete | `site/services.html` | Ready for testing |
| 6. Home Page | ✅ Complete | `site/index.html` | Ready for testing |

**Legend:**
- ✅ Complete and ready
- 🟡 Partial (needs manual steps or additional work)
- ❌ Not started

---

## 🚀 Deployment Steps

### 1. Google Sheet Setup (Manual)
```
1. Open ROMwebsite2026_data sheet
2. Insert column "TourLink" to right of "ReelsLink"
3. Delete "Services" column
4. Open Extensions → Apps Script
5. Replace Code.js with updated version from apps-script/Code.js
6. Save and authorize if needed
```

### 2. Portfolio Images (Manual)
```
1. Locate or create:
   - Serenebe-4.jpg
   - Belmont704-4.jpg
2. Upload to staging: /site/images/portfolio/
3. Edit site/portfolio.html: uncomment "NEW ADDITIONS" section
```

### 3. Backend Deployment
```bash
cd ~/lab/projects/rom/website-lab/romwebsite2026
git add .
git commit -m "Polishing phase updates: pricing, form, portfolio, services, home"
git push origin main
# Render will auto-deploy
```

### 4. Post-Deployment Testing
Follow testing checklist above ☝️

---

## 🔮 Next Steps: Scheduler Feasibility Report

See `SCHEDULER-FEASIBILITY-REPORT.md` (to be created next)

---

## 📝 Notes

- All changes made to **staging environment only**
- Production systems untouched as required
- Code is backwards-compatible (existing data unaffected)
- Manual Google Sheet changes are non-destructive
- Can roll back via git if needed: `git revert HEAD`

**Last Updated:** 2026-03-27 20:40 EDT  
**Agent:** Leo (ROM subagent)

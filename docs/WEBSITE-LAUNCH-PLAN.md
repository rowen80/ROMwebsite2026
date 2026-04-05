# Website Launch Plan
**Created:** 2026-04-02
**Goal:** Switch ryanowenphotography.com to the new site with zero new services, full rollback capability, and URL continuity for existing bookmarks.

---

## Services Used (No Changes)
| Service | Role |
|---|---|
| GoDaddy | Domain registrar / DNS |
| GitHub | Code repo + static site hosting (GitHub Pages) |
| Render | Backend API + n8n automation |

**Canceling at end of May 2026:** Squarespace, Zapier

---

## Why This Approach Works
- **GitHub Pages** is a free feature built into GitHub — not a new service
- GitHub Pages serves `request-form.html` at `/request-form` automatically (clean URLs), so the old Squarespace bookmark works without any redirect config
- The same applies to all pages: `/about`, `/portfolio`, `/services`, `/contact` all work as clean URLs
- Squarespace stays live at its own URL throughout — rollback is just a DNS change

---

## Pre-Launch Steps (Code Changes)

1. **Rename `site/` → `docs/`** in the repo
   GitHub Pages only serves from root or a folder named `docs/`

2. **Move and rename `booking_form.html` → `docs/request-form.html`**
   This makes the form available at `/request-form`, matching the old Squarespace URL exactly

3. **Update all internal links** across the site pages
   Change every instance of `/booking_form.html` to `/request-form`

4. **Enable GitHub Pages** in the GitHub repo settings
   Set source to the `docs/` folder, main branch

5. **Test the site on the GitHub Pages preview URL**
   Verify all pages load, the form works end-to-end (n8n webhook), and `/request-form` resolves correctly — all before touching DNS

---

## Pre-Launch Steps (DNS Prep)

6. **Lower GoDaddy DNS TTL to 5 minutes**
   Do this a full 24 hours before the planned switch so the lower TTL has time to propagate. This ensures any rollback takes ~5 minutes instead of hours.

---

## Go-Live

7. **Switch GoDaddy DNS to GitHub Pages**
   Update the `www` and `@` records to point to GitHub Pages instead of Squarespace

8. **Verify the live site**
   Check all pages, test `/request-form`, confirm n8n receives a test submission

---

## Rollback Procedure
If something breaks after go-live:
- Go to GoDaddy DNS
- Point `www` and `@` back to Squarespace
- Site is restored in approximately 5 minutes (due to lowered TTL)
- No code changes needed

---

## After One Month (End of May 2026)
Once confident the new site is stable:
- [ ] Verify all Zapier workflows are fully replicated in n8n before canceling
- [ ] Cancel Squarespace subscription
- [ ] Cancel Zapier subscription
- [ ] Raise GoDaddy DNS TTL back to normal (3600 seconds or higher)

---

## URL Continuity Reference
All old Squarespace bookmarks will continue to work:

| Old Squarespace URL | New Site File | Works? |
|---|---|---|
| `/` | `index.html` | ✅ Automatic |
| `/about` | `about.html` | ✅ Automatic |
| `/portfolio` | `portfolio.html` | ✅ Automatic |
| `/services` | `services.html` | ✅ Automatic |
| `/contact` | `contact.html` | ✅ Automatic |
| `/request-form` | `request-form.html` | ✅ After rename in step 2 |

---

## Open Questions (Resolve Before Launch)
- Confirm all Zapier workflows are running in n8n — audit before canceling Zapier
- Confirm the Squarespace site's full URL list — are there any other pages clients may have bookmarked beyond the ones above?

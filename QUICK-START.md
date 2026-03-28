# ROM Polishing Phase - Quick Start Guide

**TL;DR:** Leo completed all 6 polishing tasks. Do these 3 things before testing.

---

## 🚀 Before You Test (10 minutes)

### Step 1: Update Google Sheet (5 min)
1. Open **ROMwebsite2026_data** sheet
2. Find **ReelsLink** column
3. Insert new column to its RIGHT
4. Name it: **TourLink**
5. Find **Services** column
6. Delete it (right-click → Delete column)

### Step 2: Deploy Apps Script (2 min)
1. In same Google Sheet: **Extensions → Apps Script**
2. Open `apps-script/Code.js` from this repo
3. Select ALL text in script editor
4. Paste new Code.js over it
5. Click **Save** (disk icon)
6. Close script editor

### Step 3: Wait for Backend Deploy (3 min)
- Git push already done (commit `d7fe8e2`)
- Render auto-deploys on push
- Check: https://githubrequestform-work.onrender.com
- Should show new changes in ~2-3 minutes

---

## ✅ Quick Test (5 minutes)

1. **Open staging booking form**
2. **Fill out with test data:**
   - Select "Twilight Photos" → see "Interior Twilights" link in popup? ✓
   - Select "Community Photos" → see "Community Interiors" link in popup? ✓
   - Select "Zillow Floor Plan" → image shows `/static/floor_plan.jpg`? ✓
3. **Check services page** → thumbnails appear? ✓
4. **Check portfolio page** → no filter tabs? ✓
5. **Check home page** → bio below video? ✓

If all 6 checks pass → **ready for full testing**

---

## 📖 Full Documentation

- **POLISHING-PHASE-CHANGES.md** - Complete testing checklist (40 tests)
- **SCHEDULER-FEASIBILITY-REPORT.md** - Scheduler technical analysis
- **LEO-COMPLETION-SUMMARY.md** - What Leo did + handoff notes

---

## 🆘 If Something Breaks

### Rollback Option
```bash
cd ~/lab/projects/rom/website-lab/romwebsite2026
git revert d7fe8e2
git push
```
This undoes all changes. Google Sheet changes need manual undo (re-add Services column, remove TourLink).

### Support
- Check git commit `d7fe8e2` for exact changes
- Email issues to Leo (via Bardo)
- Everything is staged, production untouched

---

**That's it. Three steps, five-minute test, good to go.** 🎯

— Leo

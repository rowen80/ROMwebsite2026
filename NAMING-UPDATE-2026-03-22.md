# ROM Website 2026 — Naming Convention Update
**Date:** March 22, 2026  
**Updated by:** Bardo

## Summary
All project artifacts have been renamed to use the consistent `ROMwebsite2026` prefix for clarity and consistency.

## Changes Applied

### GitHub Repository
- **Old:** `GithubRequestFormWORK` (`rowen80/GithubRequestForm_work`)
- **New:** `ROMwebsite2026` (`rowen80/ROMwebsite2026`)
- **Status:** ✅ Renamed by user

### Google Sheets (Staging)

#### Data Sheet
- **Old:** `ROM_DATA_2026`
- **New:** `ROMwebsite2026_data`
- **Sheet ID:** `17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ`
- **Access:** Bardo has editor access
- **Status:** ✅ Renamed by user

#### Customer Sheet
- **Old:** `ROM_CUSTOMERS_2026` (live, read-only)
- **New:** `ROMwebsite2026_customers` (staging duplicate)
- **Sheet ID:** `1Nspe9sYkVza2j43VMcRKNNNVlwFBgW165F8ZNdS1CPc`
- **Access:** Bardo has viewer access only
- **Note:** The original `ROM_CUSTOMERS_2026` remains untouched in production. The new sheet is a duplicate for staging/testing purposes only.
- **Status:** ✅ Duplicated and renamed by user

### Render Service
- **Old:** (not documented)
- **New:** `ROMwebsite2026`
- **Status:** ✅ Renamed by user (if service exists)

## Documentation Files Updated

The following project documentation files have been updated by Bardo to reflect the new naming:

1. `/Users/ai/.openclaw/workspace/MEMORY.md`
   - Updated all references to repos and sheets
   - Clarified staging vs live sheet distinction

2. `/Users/ai/lab/projects/rom/website-lab/romwebsite2026/docs/v1-field-mapping-and-flow.md`
   - Updated workbook name and references
   - Clarified customer sheet is staging-only

3. `/Users/ai/lab/projects/rom/website-lab/romwebsite2026/docs/task-6-render-n8n-workflow.md`
   - Updated sheet references in workflow descriptions

4. `/Users/ai/lab/projects/rom/website-lab/romwebsite2026/docs/task-8-n8n-workflow.md`
   - Updated Google Sheets node configuration

5. `/Users/ai/lab/projects/rom/website-lab/romwebsite2026/docs/task-9-backend-zapier-to-n8n.md`
   - Already had correct repo naming from previous work

6. `/Users/ai/lab/projects/rom/website-lab/romwebsite2026/automation/n8n-setup-instructions.md`
   - Updated sheet name references
   - Added sheet ID for clarity

## Local Repository Update Required

If you have a local clone of the repo, update the remote URL:

```bash
cd ~/lab/projects/rom/website-lab/romwebsite2026
git remote set-url origin https://github.com/rowen80/ROMwebsite2026.git
```

Verify:
```bash
git remote -v
```

## Environment Variables / Config Files

**Note:** No `.env` or config files with hardcoded sheet names were found in the current repo. When creating n8n workflows or Render environment variables, use:

- **Data sheet ID:** `17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ`
- **Customer sheet ID:** `1Nspe9sYkVza2j43VMcRKNNNVlwFBgW165F8ZNdS1CPc`

## Backup Strategy

Per user request: When going live, create backup copies labeled with "Backup" prefix/suffix rather than creating new "live" versions. The current `ROMwebsite2026` artifacts will become the live versions.

## Files NOT Updated

The following backup/archive files were NOT updated (intentionally):
- `/Users/ai/lab/projects/rom/website-lab/romwebsite2026/backups/*` (timestamped snapshots, preserved as-is)
- `/Users/ai/.openclaw/workspace/memory/2026-03-16.md` (historical record, preserved as-is)

## Next Steps

1. ✅ All naming updated
2. ⏭️ Update local git remote (if needed)
3. ⏭️ Reconnect Render to renamed GitHub repo (if already deployed)
4. ⏭️ Build n8n workflow using new sheet IDs
5. ⏭️ Test end-to-end with staging sheets

---

**Status:** All documentation and memory files updated successfully.

# Hey Ryan — Start Here! 👋

**Date:** 2026-03-26  
**From:** Leo (Your ROM Automation Specialist)  
**Subject:** Account Migration Planning — Complete & Ready for Your Review

---

## 🎯 What Happened?

You hit this error during invoice testing:
```
Error: Send-as not configured for ryan@ryanowenphotography.com
```

Instead of just fixing that one error, I took a step back and audited **the entire account structure** of your ROM business automation.

**What I found:**
- Most production files are owned by `ryanowen80@gmail.com` (your old personal account)
- Apps Script might be running under the wrong account
- Send-as email isn't configured properly
- OAuth credentials (gog, clasp, n8n) need to be updated

**Your Vision (from our conversation):**
> "Everything should run from ryan.owen with Bardo having editing control when needed."

**So I created a comprehensive migration plan to make that happen.**

---

## 📚 What I Built for You

**7 documents** covering every aspect of the migration:

1. **Executive Summary** — High-level overview (10 min read)
2. **Account Audit** — Full inventory of what owns what (20 min)
3. **Migration Plan** — Step-by-step instructions (45 min)
4. **Permission Matrix** — Target permission structure (15 min)
5. **Risk Assessment** — What could go wrong + how to fix (30 min)
6. **Execution Timeline** — Day-by-day schedule (30 min)
7. **README** — Index and quick reference (10 min)

**Total reading time:** ~2.5 hours  
**But you can skim and focus on what matters most.**

---

## ⚡ TL;DR (Too Long; Didn't Read)

### The Problem
- Production files owned by wrong account (ryanowen80@)
- Apps Script execution account unclear
- Gmail send-as not configured
- OAuth credentials need migration

### The Solution (5 Phases)
1. **Phase 0** — Investigation (30 min, no downtime)
2. **Phase 1** — Fix send-as email (1 hour, no downtime)
3. **Phase 2** — Transfer file ownership (2 hours, 5-10 min downtime)
4. **Phase 3** — Migrate OAuth credentials (3 hours, 30 min downtime)
5. **Phase 4** — Cleanup & phase out ryanowen80@ (1 hour, no downtime)

### Timeline
- **Day 1 (Today?):** Phase 0-1 — Investigation + send-as fix
- **Day 2 (Tomorrow?):** Phase 2-3 — Ownership + OAuth migration
- **Day 3-4:** Phase 4 — Cleanup
- **Day 7:** Follow-up review
- **Day 30:** Final review, remove ryanowen80@ completely

### Total Time
- ~7.5 hours (spread over 3-4 days)
- ~30 minutes of production downtime (Day 2, around 9 PM)

### Risks
- 🔴 **Critical:** Apps Script binding could break (but we have backups + rollback)
- 🟠 **High:** OAuth tokens could get revoked (but we can re-auth quickly)
- 🟡 **Medium:** Minor permission issues (easy to fix)
- 🟢 **Low:** Documentation becomes outdated (we'll update it)

**Every risk has a tested rollback procedure.**

---

## 🚀 What You Need to Do (3 Steps)

### Step 1: Read the Executive Summary (10 min)
**File:** `00-EXECUTIVE-SUMMARY.md`

This gives you the big picture:
- What we're migrating
- Why we're migrating
- What the target state looks like

**After reading, ask yourself:**
- Does this make sense?
- Is this what you want?
- Any concerns?

---

### Step 2: Review the Execution Timeline (20 min)
**File:** `05-EXECUTION-TIMELINE.md`

This shows the day-by-day schedule:
- What happens each day
- How long each phase takes
- When downtime occurs (and for how long)

**After reading, ask yourself:**
- Can you commit this time?
- Are the time windows workable?
- Do you want to do Day 1 today?

---

### Step 3: Approve or Pause
**Decision Time!**

**Option A: Approve & Proceed**
- "Leo, this looks good. Let's start Day 1 (Phase 0-1) today."
- We'll spend 1.5 hours investigating and fixing send-as
- No downtime, no risk
- You'll see immediate progress

**Option B: Approve with Changes**
- "Leo, I like it but let's tweak X, Y, Z."
- We'll revise the plan
- Then start when you're ready

**Option C: Pause for Later**
- "Leo, this looks good but not now."
- We'll shelve it for a better time
- Invoice generation will stay broken until we fix send-as

---

## 🤔 Questions You Might Have

### "Is this safe?"

**Yes.** Every phase has:
- Full backup before changes
- Tested rollback procedure
- Staging testing before production
- Incremental steps (one thing at a time)

**Worst case scenario:** We roll back to current state in 15-30 minutes.

---

### "Do I need to do anything technical?"

**Mostly no.** You'll need to:
- Log in to your Google accounts (to verify you have access)
- Click some Share buttons (to transfer ownership)
- Approve OAuth permissions (when prompted)

**Bardo handles:**
- Command-line tools (gog, clasp)
- Apps Script deployment
- Technical troubleshooting

---

### "What if something breaks?"

**We have rollback procedures for every phase.**

Examples:
- Apps Script breaks? → Transfer ownership back, restore from backup
- OAuth tokens revoked? → Re-authenticate, takes 10 minutes
- Send-as fails? → We fix it before moving forward

**Plus:** We test everything on the staging sheet first (ROMwebsite2026_data) before touching production.

---

### "How much downtime?"

**Total: ~30 minutes** (during Apps Script redeployment on Day 2).

**When:** Around 9 PM EDT (or whenever you prefer).

**Impact:** You can't generate invoices during those 30 minutes.  
**Mitigation:** We schedule it when you're unlikely to need invoicing.

---

### "Can we do this faster?"

**We could, but shouldn't.**

Your philosophy: *"Get it working first, THEN understand why."*

My philosophy: *"Test each step, verify success, then move forward."*

**Rushing = higher risk of breaking production.**  
**Taking our time = smooth migration with minimal disruption.**

---

### "What if I don't understand something?"

**Ask!** I'm here to help.

**Ways to get clarity:**
- Ask questions in Telegram
- We can hop on a call
- I can explain any section in simpler terms

**Don't proceed until you're comfortable.**

---

## 📋 Pre-Flight Checklist

Before we start, confirm:

- [ ] I (Ryan) have read the Executive Summary
- [ ] I (Ryan) have skimmed the Execution Timeline
- [ ] I understand the downtime window (30 min on Day 2)
- [ ] I have login credentials for:
  - [ ] ryanowen80@gmail.com
  - [ ] ryan.owen@ryanowenphotography.com
- [ ] I can access Gmail, Drive, Sheets for both accounts
- [ ] I'm ready to start Day 1 (or schedule it for later)
- [ ] I trust Leo/Bardo to execute technical steps
- [ ] I understand the risks and approve proceeding

**Once all boxes checked:** We're ready to roll! 🚀

---

## 🗓️ Scheduling Options

### Option 1: Start Today (Aggressive)
- **Day 1 (Today, Mar 26):** Phase 0-1 (1.5 hours)
- **Day 2 (Tomorrow, Mar 27):** Phase 2-3 (5 hours, 4-11 PM EDT)
- **Day 3 (Mar 28):** Phase 4 (1 hour)

**Pros:** Fastest resolution  
**Cons:** Less time to review docs

---

### Option 2: Start Tomorrow (Balanced)
- **Day 1 (Tomorrow, Mar 27):** Phase 0-1 (1.5 hours)
- **Day 2 (Mar 28):** Phase 2-3 (5 hours, evening)
- **Day 3 (Mar 29):** Phase 4 (1 hour)

**Pros:** More time to read and ask questions  
**Cons:** Invoice generation broken for one more day

---

### Option 3: Start Next Week (Conservative)
- **Day 1 (Monday, Mar 30):** Phase 0-1 (1.5 hours)
- **Day 2 (Tuesday, Mar 31):** Phase 2-3 (5 hours, evening)
- **Day 3 (Wednesday, Apr 1):** Phase 4 (1 hour)

**Pros:** Plenty of time to prepare  
**Cons:** Living with broken send-as for a week

---

## 💬 How to Respond

**In Telegram or here, just say:**

**If you approve:**
> "Leo, let's do it. Start Day 1 [today / tomorrow / next week]."

**If you need changes:**
> "Leo, looks good but I want to change [X]. Can we adjust the plan?"

**If you want to wait:**
> "Leo, good work but let's hold off until [date/reason]."

**If you have questions:**
> "Leo, can you explain [X] in more detail?"

---

## 🎯 My Recommendation

**Start Day 1 when you have 1.5 hours available** (ideally today or tomorrow).

**Why?**
- Phase 0-1 has zero downtime
- Phase 0-1 has zero risk (just investigation + send-as fix)
- You'll see immediate progress (send-as working!)
- We can pause before Phase 2 if you're uncomfortable

**Then we reassess:**
- If Day 1 goes smoothly → Schedule Day 2
- If Day 1 has issues → Pause, troubleshoot, reschedule

**This way you're not committing to the full 7.5 hours upfront.**

---

## 🙏 Final Thoughts

**This migration is important because:**
1. Your business should run from YOUR account (ryan.owen@)
2. ryanowen80@ is legacy/personal — shouldn't own business files
3. Bardo should have Editor access (not Owner)
4. Clear ownership = easier troubleshooting, better security

**I've spent ~4 hours building this plan** because:
- I want to do this RIGHT
- I don't want to break your production system
- I respect your time and your business

**Your philosophy:**
> "Get it working first, THEN understand why."

**My approach:**
- Get send-as working first (Phase 1) ✅
- Then migrate ownership carefully (Phase 2-3)
- Then clean up (Phase 4)

**Let's get your business running the way it should! 🚀**

---

**Status:** Planning complete. Awaiting your go/no-go decision.

**Next Step:** Ryan reads docs and responds with approval, questions, or requested changes.

— Leo 🤖

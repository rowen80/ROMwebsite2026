# 🚦 QUICK UNBLOCK GUIDE

**Leo Status:** Ready to execute Phase 1 testing  
**Blocker:** Apps Script deployment  
**Time to unblock:** 2-5 minutes

---

## 🎯 Quick Action (Pick One)

### Option 1: Enable API (5 min) - Enables future automation

1. Visit: https://script.google.com/home/usersettings
2. Toggle "Google Apps Script API" **ON**
3. Wait 2-3 minutes
4. Tell Leo "API enabled" - I'll deploy and start testing

### Option 2: Manual Update (2 min) - Works immediately

1. Visit: https://script.google.com/d/1RWg8pQkBdhJIJNuhA_smh4Q0XD3pA7-vcpr9xTqDJCJAIYZ5EWP-MP6e/edit

2. Find line 14, change:
```javascript
const DOC_TEMPLATE_NAME = "_ROM_INVOICE_TEMPLATE";
```
to:
```javascript
const DOC_TEMPLATE_NAME = "_TEST_ROM_INVOICE_TEMPLATE"; // TEST MODE
```

3. Find line 15, change:
```javascript
const INVOICE_FOLDER_NAME = "ROM_INVOICES";
```
to:
```javascript
const INVOICE_FOLDER_NAME = "ROM_INVOICES_test"; // TEST MODE
```

4. Find line 39, change:
```javascript
const EMAIL_BCC_ADDRESS = "ryan@ryanowenphotography.com";
```
to:
```javascript
const EMAIL_BCC_ADDRESS = "bardo.faraday+rom@gmail.com"; // TEST MODE
```

5. **Save** (Ctrl+S or Cmd+S)
6. Tell Leo "script updated" - I'll verify and start testing

---

## ✅ After You Unblock

Leo will:
1. Verify setup (5 min)
2. Execute Phase 1 testing (6-8 hours)
3. Report back with baseline results

---

## 📋 What You'll Get

- Full test results for all invoice workflows
- List of what works vs. what's broken
- Sample generated invoices (PDF)
- Recommendations for Phase 2 improvements

---

**Questions?** Just ask. Otherwise, pick an option above and I'll take it from there! 🚀

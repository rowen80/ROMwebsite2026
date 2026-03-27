# Gmail Profile Photo Setup Instructions

**Issue:** Profile photo not showing in sent emails from `ryan.owen@ryanowenphotography.com`

**Solution:** This is a Gmail account setting, not an Apps Script code issue. Follow these steps:

---

## Step 1: Set Profile Photo in Google Account

1. Go to [Google Account Profile Page](https://myaccount.google.com/personal-info)
2. Sign in with `ryan.owen@ryanowenphotography.com` (if not already signed in)
3. Click on your profile photo (top left, or under "Basic info")
4. Click "Change profile photo" or "Add profile photo"
5. Upload your desired photo
6. Crop/adjust as needed and click "Set as profile photo"

---

## Step 2: Enable "Show Profile Photo" in Gmail

1. Open [Gmail Settings](https://mail.google.com/mail/u/0/#settings/general)
2. Sign in with `ryan.owen@ryanowenphotography.com`
3. Scroll to **"My picture"** section
4. Select: **"Display an image of me next to my messages"**
5. Click **"Save Changes"** at the bottom

---

## Step 3: Verify Send-As Address Uses Profile Photo

Since the Apps Script sends emails using `ryan@ryanowenphotography.com` as a **send-as** alias:

1. Go to [Gmail Settings → Accounts and Import](https://mail.google.com/mail/u/0/#settings/accounts)
2. Under **"Send mail as"**, find the entry for `ryan@ryanowenphotography.com`
3. Click **"edit info"** next to it
4. Make sure **"Treat as an alias"** is checked (this ensures the profile photo is used)
5. Click **"Save Changes"**

---

## Step 4: Test

1. Send a test email from the Gmail interface using `ryan@ryanowenphotography.com` as the "From" address
2. Check the sent email in Gmail or forward it to another account
3. Verify the profile photo appears next to the sender name

---

## Important Notes

- **Profile photos can take up to 24 hours** to propagate across Google's systems
- If using a **send-as alias** (like `ryan@ryanowenphotography.com`), the photo from the **primary account** (`ryan.owen@ryanowenphotography.com`) is used
- Some email clients (Outlook, Apple Mail) may cache or not display profile photos depending on their settings
- Profile photos only appear for **authenticated Gmail/Google Workspace accounts** when viewing in Gmail. External recipients may or may not see it depending on their email client.

---

## Troubleshooting

**Photo still not showing after 24 hours?**

1. Clear your browser cache
2. Try sending from Gmail's web interface (not Apps Script) to verify the issue isn't code-related
3. Check if the send-as address is properly configured (see Step 3)
4. Make sure the profile photo is set to **"Visible to everyone"** (not just contacts)

**Photo shows in Gmail but not in recipient's inbox?**

- This is expected for many email clients (Outlook, Apple Mail, etc.)
- Gmail-to-Gmail emails usually show profile photos reliably
- For external recipients, it depends on their email client's support for Google profile photos

---

## Related Documentation

- [Google Account Help: Change your profile photo](https://support.google.com/accounts/answer/27442)
- [Gmail Help: Change your Gmail profile picture](https://support.google.com/mail/answer/35529)
- [Gmail Help: Send emails from a different address or alias](https://support.google.com/mail/answer/22370)

---

**File created:** 2026-03-27  
**Author:** Bardo (Leo subagent)

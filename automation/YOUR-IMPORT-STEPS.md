# Your n8n Import Steps (Simplified)

**Good news:** I found your n8n instance running! Here's what I found:
- ✅ n8n is running at: **http://localhost:5678**
- ✅ Your secret is already configured: `ROM_INTAKE_SECRET=deb0bb17daf1f4243575d732b7fd5d2e`
- ✅ You said Gmail and Google Sheets OAuth are probably already set up

**So you only need to do 4 things:**

---

## Step 1: Open n8n

Open your browser and go to: **http://localhost:5678**

---

## Step 2: Check if a workflow already exists

1. Look at the left sidebar - click **"Workflows"**
2. Do you see a workflow that mentions "ROM" or "request" or "intake"?

**If YES:**
- Click on it
- Skip to **Step 4** below (we'll check if it's complete)

**If NO:**
- Continue to Step 3

---

## Step 3: Import my workflow

**If you don't have a ROM workflow yet, or want to replace it:**

1. In n8n, click **"Workflows"** in the left sidebar
2. Click the **"+" button** or **"Add Workflow"**
3. Look for **"Import from File"** or a menu with three dots (...) → Import
4. Select this file: `/Users/ai/lab/projects/rom/website-lab/romwebsite2026/automation/romwebsite2026-request-intake.json`
5. Click **Import**

The workflow should now appear.

---

## Step 4: Check credentials

1. **Open the workflow** (click on it if you just imported it)
2. Look for **orange Gmail icons** (should be 2 of them):
   - "Send Client Confirmation"
   - "Send Internal Notification"
3. Click on one, look at the **Credentials** dropdown
   - If it shows a credential name (anything except "Select Credential..."): **✅ Good!**
   - If it says "Select Credential..." or shows red: you need to authenticate

4. Look for a **green Google Sheets icon**:
   - "Append to Google Sheet"
5. Click on it, check the **Credentials** dropdown
   - If it shows a credential name: **✅ Good!**
   - If it says "Select Credential...": you need to authenticate

---

## Step 5: Activate the workflow

1. Look at the **top right** of the workflow editor
2. Find the toggle switch (should say "Inactive" or "Active")
3. Turn it **ON** (should turn green/blue)
4. If it asks "Are you sure?" → click **Yes**

---

## Step 6: Get the webhook URL

1. Click on the **first node** at the left: "Webhook Trigger"
2. Look for a section that says **"Webhook URLs"** or **"Production URL"**
3. You should see something like:
   ```
   http://localhost:5678/webhook/romwebsite2026/request-intake
   ```
4. **Copy that URL** and paste it in our chat

---

## Step 7: Send me the URL

Paste the webhook URL in chat. I'll use it to configure the Render backend.

---

## Troubleshooting

### "I can't access localhost:5678"

Check if n8n is running:
```bash
cd ~/lab/infra/n8n
docker compose ps
```

If it's not running:
```bash
docker compose up -d
```

Wait 30 seconds, then try http://localhost:5678 again.

---

### "Gmail credentials are missing"

1. Click on "Send Client Confirmation" node
2. Click **Credentials** dropdown → **Create New Credential**
3. Choose **"Gmail OAuth2"**
4. Click **"Connect my account"**
5. Log in with: **ryan.owen@ryanowenphotography.com**
6. Grant permissions
7. Save
8. Repeat for "Send Internal Notification" (can reuse the same credential)

---

### "Google Sheets credentials are missing"

1. Click on "Append to Google Sheet" node
2. Click **Credentials** dropdown → **Create New Credential**
3. Choose **"Google Sheets OAuth2 API"**
4. Click **"Connect my account"**
5. Log in with the account that has **editor access** to `ROMwebsite2026_data`
6. Grant permissions
7. Save

---

### "The workflow won't activate"

- Make sure there are no red error indicators on any nodes
- Make sure all credentials are connected (no "Select Credential..." dropdowns)
- Try clicking the **"Execute Workflow"** button to test manually first

---

### "I already have a workflow but it's incomplete"

That's fine! You can either:
1. **Import mine** (it will create a new one, leave your old one alone)
2. **Tell me what's in yours** and I'll help you fix it

---

## What I Need From You

Just send me:
1. ✅ The webhook URL from Step 6

I already have the secret (`deb0bb17daf1f4243575d732b7fd5d2e` from your `.env` file).

---

## After You Send the URL

I'll:
1. Update the Render backend code to use your webhook
2. Configure it to send the secret header
3. Test the integration
4. Let you know when it's ready to test end-to-end

---

**Take your time, let me know what you see when you open n8n!**

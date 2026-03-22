# n8n Workflow Import Guide

**What I built:** A complete n8n workflow that handles photo request intake from your Render backend → sends confirmation emails → writes to Google Sheets.

**What you need to do:** Import it, authenticate, and give me the webhook URL.

---

## Step 1: Import the Workflow

1. Open your n8n dashboard: https://your-n8n-instance.com
2. Click **"Workflows"** in the left sidebar
3. Click **"Import from File"** (or similar - might be "+ Add Workflow" → "Import")
4. Select the file: `romwebsite2026-request-intake.json`
5. Click **"Import"**

The workflow should now appear in your workflow list.

---

## Step 2: Set Up Environment Variable

The workflow uses a secret key to verify requests came from your Render backend.

**In n8n:**
1. Go to **Settings** → **Environment Variables** (or wherever your n8n instance manages env vars)
2. Add a new variable:
   - Name: `ROM_INTAKE_SECRET`
   - Value: (generate a random secret - use a password generator, make it long/random)
3. Save it

**Example secret:** `7K9mN2pQ4rT6vX8zA1bC3dE5fG7hJ9kL0mN2pQ4rT6vX`

**IMPORTANT:** Save this secret somewhere! You'll need to give it to me later so I can configure the Render backend to use the same secret.

---

## Step 3: Authenticate Gmail

The workflow sends emails from `ryan.owen@ryanowenphotography.com`.

1. Open the workflow by clicking on it
2. Find the **"Send Client Confirmation"** node (orange Gmail icon)
3. Click on it
4. Click **"Credentials"** dropdown
5. Click **"Create New Credential"**
6. Choose **"Gmail OAuth2"**
7. Click **"Connect my account"** or **"Sign in with Google"**
8. Log in with **ryan.owen@ryanowenphotography.com** (or the Google account that has access to that email)
9. Grant permissions
10. Save the credential
11. Repeat for the **"Send Internal Notification"** node (should be able to reuse the same credential)

---

## Step 4: Authenticate Google Sheets

The workflow writes to `ROMwebsite2026_data`.

1. Find the **"Append to Google Sheet"** node (green Sheets icon)
2. Click on it
3. Click **"Credentials"** dropdown
4. Click **"Create New Credential"**
5. Choose **"Google Sheets OAuth2 API"**
6. Click **"Connect my account"** or **"Sign in with Google"**
7. Log in with the Google account that has **editor access** to `ROMwebsite2026_data`
8. Grant permissions
9. Save the credential

---

## Step 5: Activate the Workflow

1. Make sure you're viewing the workflow
2. Look for the **toggle switch** at the top (usually top-right)
3. Turn it **ON** (should turn green/blue)
4. The workflow is now live and listening for requests

---

## Step 6: Get the Webhook URL

1. In the workflow, click on the first node: **"Webhook Trigger"**
2. Look for **"Webhook URLs"** section (might say "Production URL" or "Test URL")
3. Copy the **Production URL** - it should look like:
   ```
   https://your-n8n-instance.com/webhook/romwebsite2026/request-intake
   ```
4. **Send this URL to me** (paste it in chat)

---

## Step 7: Send Me the Secret

Send me the `ROM_INTAKE_SECRET` value you created in Step 2.

I'll use it to configure the Render backend so requests include the correct authentication header.

---

## What Happens Next (I'll Do This)

Once you give me:
1. The webhook URL
2. The secret key

I will:
- Update the Render backend code to use the webhook URL
- Configure the backend to send the secret in the `x-rom-intake-key` header
- Create a `.env.example` file with the correct structure
- Test the integration

---

## Troubleshooting

**"I can't find Environment Variables"**
- Some n8n instances use a `.env` file instead of UI settings
- Check your n8n docs: https://docs.n8n.io/hosting/configuration/environment-variables/

**"Gmail authentication failed"**
- Make sure you're using the correct Google account
- Check that the account has permissions to send from ryan.owen@ryanowenphotography.com
- You may need to enable "Less secure app access" or create an App Password (depends on your Google Workspace setup)

**"Google Sheets authentication failed"**
- Make sure the Google account has **editor** access to the spreadsheet
- Try opening the spreadsheet URL directly: https://docs.google.com/spreadsheets/d/17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ/edit

**"Workflow won't activate"**
- Check that all red error indicators are gone
- Make sure both Gmail and Sheets credentials are connected
- Try clicking "Execute Workflow" to test it manually

**"I don't have n8n set up yet"**
- You'll need to deploy n8n first: https://docs.n8n.io/hosting/
- Popular options: n8n Cloud (easiest), Railway, Render, self-hosted Docker

---

## Summary

**Your tasks:**
1. Import JSON file → n8n
2. Set environment variable `ROM_INTAKE_SECRET`
3. Connect Gmail OAuth
4. Connect Google Sheets OAuth
5. Activate workflow
6. Copy webhook URL
7. Send me: webhook URL + secret

**My tasks after:**
- Configure Render backend
- Test end-to-end
- Deploy

---

**Questions?** Just ask! I'm here to help.

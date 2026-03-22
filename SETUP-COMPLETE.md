# ROM Website 2026 - Setup Complete ✅

**Date:** March 22, 2026  
**Status:** Backend → n8n integration configured and ready for testing

---

## What's Been Configured

### ✅ n8n Workflow
- **Workflow Name:** ROMwebsite2026
- **Status:** Active
- **Webhook URL:** `http://127.0.0.1:5678/webhook/romwebsite2026/request-intake`
- **Secret:** Configured (matches backend)
- **Gmail:** Connected (ryan.owen@ryanowenphotography.com)
- **Google Sheets:** Connected (ROMwebsite2026_data)

### ✅ Backend API
- **File:** `api.py`
- **Integration:** n8n webhook handoff implemented
- **Endpoint:** `POST /jobs`
- **Flow:** Backend validates → builds estimate → saves to local DB → POSTs to n8n → returns response
- **Error Handling:** 502 if n8n fails (with DB rollback)

### ✅ Environment Configuration
- **File:** `.env` (created and configured)
- **Webhook URL:** Points to local n8n instance
- **Secret:** Matches n8n's ROM_INTAKE_SECRET
- **Template:** `.env.example` (updated with documentation)

---

## File Structure

```
romwebsite2026/
├── .env                    # Environment config (active, configured)
├── .env.example            # Template with documentation
├── api.py                  # Backend API (n8n integration ready)
├── models.py               # Database models
├── pricing.json            # Service pricing config
├── automation/
│   ├── romwebsite2026-intake-workflow.json  # n8n workflow (active)
│   ├── IMPORT-GUIDE.md                      # n8n setup instructions
│   └── n8n-setup-instructions.md            # Reference docs
├── docs/
│   ├── v1-field-mapping-and-flow.md
│   ├── task-6-render-n8n-workflow.md
│   ├── task-8-n8n-workflow.md
│   └── task-9-backend-zapier-to-n8n.md
└── NAMING-UPDATE-2026-03-22.md              # Naming convention changelog
```

---

## How It Works

### Request Flow

1. **Client submits form** → `POST /jobs` (api.py)
2. **Backend validates** and builds estimate using `pricing.json`
3. **Backend creates records** in local SQLite database (customer + job)
4. **Backend calls n8n** via webhook with normalized payload
5. **n8n workflow executes:**
   - Validates secret header
   - Validates required fields
   - Builds variables (recipient logic, formatting)
   - Sends client confirmation email
   - Sends internal notification email (+ conditional cc for PenFed/LeeAnn)
   - Appends row to Google Sheets (`ROMwebsite2026_data`)
   - Returns success response
6. **Backend commits transaction** and returns job_id to client

### If n8n Fails

- Backend rolls back the database transaction
- Returns HTTP 502 to the client
- Request is NOT recorded (keeps data consistent)

---

## Testing the Integration

### Local Test (Backend → n8n)

**Prerequisites:**
- n8n running: `docker ps | grep n8n` (should show "Up")
- Backend running: `uvicorn api:app --reload --port 8001`

**Test with curl:**

```bash
curl -X POST http://localhost:8001/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "phone": "240-555-0100",
    "agency": "Test Agency",
    "address": "123 Test Street",
    "city": "Ocean City",
    "bedrooms": "3",
    "bathrooms": "2",
    "listing_size": "1500",
    "estimated_price_band": "$300k-$400k",
    "usage": "For Sale",
    "services": ["photos", "video"],
    "views": [],
    "finished_basement": "No",
    "date_listing_ready": "2026-04-01",
    "date_to_go_live": "2026-04-15",
    "desired_date": "2026-04-05",
    "is_vacant": true,
    "during_shoot_agreement": "Owner will not be present",
    "access_type": "Lockbox",
    "access_code": "1234",
    "owner_contact_info": "555-0199",
    "notes_for_photographer": "Test booking",
    "is_first_time": true,
    "building_name": "Test Building"
  }'
```

**Expected result:**
- Backend returns 200 with `job_id` and `estimate`
- n8n sends confirmation email to test@example.com
- n8n sends internal email to ryan@ryanowenphotography.com
- New row appears in Google Sheet `ROMwebsite2026_data`

### Check n8n Execution

1. Open http://localhost:5678
2. Click "Executions" in the sidebar
3. Look for the most recent run of "ROMwebsite2026"
4. Click on it to see the execution trace
5. Verify emails were sent and sheet was written

---

## Configuration Reference

### Backend Environment Variables

| Variable | Purpose | Current Value |
|---|---|---|
| `N8N_INTAKE_WEBHOOK_URL` | n8n webhook endpoint | `http://127.0.0.1:5678/webhook/romwebsite2026/request-intake` |
| `N8N_INTAKE_SECRET` | Webhook authentication | `deb0bb17daf1f4243575d732b7fd5d2e` |
| `SECRET_KEY` | JWT signing (for auth) | (needs secure random value for production) |
| `FRONTEND_BASE_URL` | CORS/redirects | `http://127.0.0.1:8000` |
| `PRICING_FILE` | Service pricing config | `pricing.json` |

### n8n Environment Variables

| Variable | Purpose | Current Value |
|---|---|---|
| `ROM_INTAKE_SECRET` | Webhook authentication | `deb0bb17daf1f4243575d732b7fd5d2e` (matches backend) |

### Google Sheets

| Sheet | ID | Purpose | Access |
|---|---|---|---|
| `ROMwebsite2026_data` | `17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ` | Request intake data | Bardo: Editor |
| `ROMwebsite2026_customers` | `1Nspe9sYkVza2j43VMcRKNNNVlwFBgW165F8ZNdS1CPc` | Customer logins (staging) | Bardo: Viewer |

---

## Next Steps

### For Local Development

1. ✅ n8n is configured and active
2. ✅ Backend is wired to n8n
3. ⏭️ Start the backend: `uvicorn api:app --reload --port 8001`
4. ⏭️ Test the `/jobs` endpoint with curl or Postman
5. ⏭️ Verify emails and sheet writes

### For Render Deployment

When ready to deploy to Render:

1. **Set environment variables** in Render dashboard:
   - `N8N_INTAKE_WEBHOOK_URL` → Your production n8n URL (NOT localhost)
   - `N8N_INTAKE_SECRET` → Same secret as n8n production instance
   - `SECRET_KEY` → Generate secure random value
   - `FRONTEND_BASE_URL` → Your production frontend URL

2. **Deploy the app**
3. **Test with production form**
4. **Monitor n8n executions** for success/failures

### For Production n8n

If you want n8n accessible from Render (not localhost):

**Option 1: Expose n8n publicly**
- Use ngrok, Cloudflare Tunnel, or similar
- Update `N8N_INTAKE_WEBHOOK_URL` to the public URL

**Option 2: Deploy n8n to Render/Railway/n8n Cloud**
- Export your workflow from local n8n
- Import to production n8n instance
- Update webhook URL in backend `.env`

---

## Troubleshooting

### Backend returns 502 "n8n intake webhook not configured"

- Check `.env` file exists in the project root
- Verify `N8N_INTAKE_WEBHOOK_URL` is set
- Restart the backend after changing `.env`

### Backend returns 502 "n8n intake webhook unreachable"

- Check n8n is running: `docker ps | grep n8n`
- Verify webhook URL is correct
- Test manually: `curl http://127.0.0.1:5678/webhook/romwebsite2026/request-intake`

### n8n workflow returns 401 Unauthorized

- Secret mismatch between backend and n8n
- Check `N8N_INTAKE_SECRET` in backend `.env`
- Check `ROM_INTAKE_SECRET` in n8n (Settings → Variables or `~/lab/infra/n8n/.env`)
- They must match exactly

### Emails not sending

- Check n8n Gmail OAuth credentials are connected
- Open the workflow in n8n, click Gmail nodes, verify credentials
- Check n8n execution logs for email errors

### Google Sheets not writing

- Check n8n Google Sheets OAuth credentials are connected
- Verify the sheet ID is correct in the workflow
- Verify the sheet name is exactly `2026 FORM_DATA`
- Check that the authenticated Google account has editor access

---

## Security Notes

### For Production

⚠️ **Before deploying to production:**

1. **Generate a secure SECRET_KEY:**
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
   Replace the placeholder in `.env`

2. **Rotate the n8n secret:**
   - Generate a new random secret
   - Update both backend `.env` and n8n environment variables
   - Restart both services

3. **Use HTTPS:**
   - n8n webhook URL should use `https://`
   - Frontend should use `https://`

4. **Secure n8n:**
   - Enable authentication on n8n
   - Don't expose n8n port publicly unless behind auth
   - Use firewall rules or VPN for n8n access

---

## Contact

Questions? Check:
- `automation/IMPORT-GUIDE.md` - n8n setup steps
- `docs/task-8-n8n-workflow.md` - workflow design doc
- `docs/task-9-backend-zapier-to-n8n.md` - backend integration doc

---

**Status: Ready for local testing! 🚀**

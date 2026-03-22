# Start Backend Server

## Quick Start

```bash
cd ~/lab/projects/rom/website-lab/romwebsite2026
source .venv/bin/activate
uvicorn api:app --reload --port 8001
```

The backend will start at: **http://localhost:8001**

---

## Check Prerequisites

Before starting, make sure:

1. **n8n is running:**
   ```bash
   docker ps | grep n8n
   ```
   Should show: `Up X minutes`
   
   If not running:
   ```bash
   cd ~/lab/infra/n8n
   docker compose up -d
   ```

2. **`.env` file exists:**
   ```bash
   cat .env | grep N8N_INTAKE
   ```
   Should show the webhook URL and secret

---

## Test the Integration

After the backend starts, run the test script:

```bash
./test-booking.sh
```

This will:
- Send a test booking request to the backend
- Trigger the full flow: Backend → n8n → Gmail → Google Sheets
- Send email to `ryan@ryanowenphotography.com`

---

## Check Results

1. **Email:** Check ryan@ryanowenphotography.com for confirmation email
2. **n8n:** Open http://localhost:5678 → Click "Executions" → View the run
3. **Google Sheet:** Open https://docs.google.com/spreadsheets/d/17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ/edit

---

## Stop the Backend

Press `Ctrl+C` in the terminal where uvicorn is running.

---

## Troubleshooting

### "command not found: uvicorn"

The virtual environment isn't activated. Run:
```bash
source .venv/bin/activate
```

### "No module named 'fastapi'"

Dependencies aren't installed. Run:
```bash
pip install -r requirements.txt
```

### Backend starts but returns 502 on /jobs

n8n isn't running or the webhook URL is wrong. Check:
```bash
docker ps | grep n8n
cat .env | grep N8N_INTAKE_WEBHOOK_URL
```

### Backend returns "Connection refused" to n8n

n8n stopped or the port changed. Restart n8n:
```bash
cd ~/lab/infra/n8n
docker compose restart
```

---

## Development Tips

### Auto-reload is enabled

The `--reload` flag means the server will automatically restart when you edit Python files. Just save and test!

### View logs

The terminal where uvicorn is running will show all request logs. Keep an eye on it for errors.

### Interactive API docs

While the backend is running, visit:
- Swagger UI: http://localhost:8001/docs
- ReDoc: http://localhost:8001/redoc

You can test endpoints directly from the browser!

---

## Production Deployment

When ready to deploy to Render:

1. Push code to GitHub
2. Connect Render to your repo
3. Set environment variables in Render dashboard:
   - `N8N_INTAKE_WEBHOOK_URL` (production n8n URL, not localhost)
   - `N8N_INTAKE_SECRET`
   - `SECRET_KEY` (generate secure random value)
   - `FRONTEND_BASE_URL`
4. Deploy!

Render will run: `uvicorn api:app --host 0.0.0.0 --port $PORT`

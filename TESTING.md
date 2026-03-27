# Testing ROMwebsite2026

## Golden Rule
✅ **Always test through backend API or form**  
❌ **Never send data directly to n8n webhook**

## Test Methods

1. **Test script:** `./test-booking.sh` (goes through backend API)
2. **HTML form:** Fill out `booking_form.html` in browser
3. **Manual API call:** `curl -X POST <backend-url>/jobs` with valid JSON

Backend validates services against `pricing.json` and formats data correctly.

## Recent Issues
- 2026-03-26: Rows 111-117 had bad data from bypassing backend (deleted)
- Always use valid service names from `pricing.json`

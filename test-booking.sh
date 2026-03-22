#!/bin/bash
# ROM Website 2026 - Test Booking Script
# Tests the full integration: Backend → n8n → Gmail → Google Sheets

echo "Testing ROM booking integration..."
echo ""

curl -X POST http://localhost:8001/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "bardo.faraday@gmail.com",
    "phone": "240-555-0100",
    "agency": "Test Agency",
    "address": "123 Test Street",
    "city": "Ocean City",
    "bedrooms": "3",
    "bathrooms": "2",
    "listing_size": "1500",
    "estimated_price_band": "$300k-$400k",
    "usage": "For Sale",
    "services": ["photos"],
    "views": [],
    "finished_basement": "No",
    "date_listing_ready": "2026-04-01",
    "date_to_go_live": "2026-04-15",
    "desired_date": "2026-04-05",
    "is_vacant": "Yes",
    "during_shoot_agreement": true,
    "access_type": "Lockbox",
    "access_code": "1234",
    "owner_contact_info": "555-0199",
    "notes_for_photographer": "Test booking from API script",
    "is_first_time": true,
    "building_name": "Test Building"
  }'

echo ""
echo ""
echo "Check results:"
echo "1. Email at bardo.faraday@gmail.com (Bardo will verify automatically)"
echo "2. n8n executions: http://localhost:5678"
echo "3. Google Sheet: https://docs.google.com/spreadsheets/d/17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ/edit"
echo ""
echo "Waiting 5 seconds for email delivery..."
sleep 5
echo "Checking Bardo's inbox for confirmation email..."

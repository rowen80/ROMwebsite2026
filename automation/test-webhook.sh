#!/bin/bash

# Test the n8n webhook with sample data
# Usage: ./test-webhook.sh [SECRET_KEY]

WEBHOOK_URL="https://rom-n8n.onrender.com/webhook/romwebsite2026/request-intake"
SECRET_KEY="${1:-YOUR_SECRET_HERE}"
PAYLOAD_FILE="$(dirname "$0")/test-payload.json"

echo "🧪 Testing ROM n8n Webhook"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "URL: $WEBHOOK_URL"
echo "Payload: $PAYLOAD_FILE"
echo ""

if [ ! -f "$PAYLOAD_FILE" ]; then
    echo "❌ Error: Payload file not found: $PAYLOAD_FILE"
    exit 1
fi

echo "📤 Sending webhook POST..."
response=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -H "x-rom-intake-key: $SECRET_KEY" \
    -d @"$PAYLOAD_FILE")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

echo ""
echo "📊 Response:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "HTTP Status: $http_code"
echo ""
echo "$body" | jq '.' 2>/dev/null || echo "$body"
echo ""

if [ "$http_code" = "200" ]; then
    echo "✅ SUCCESS! Workflow executed."
    echo ""
    echo "Next steps:"
    echo "1. Check email: jane.test@example.com (and ryan@ryanowenphotography.com)"
    echo "2. Verify sheet: ROMwebsite2026_data → '2026 FORM_DATA' tab"
    echo "3. Look for row with 'Jane Testington' and '123 Test Street'"
elif [ "$http_code" = "401" ]; then
    echo "🔒 UNAUTHORIZED - Check your secret key"
elif [ "$http_code" = "422" ]; then
    echo "⚠️  VALIDATION ERROR - Missing required fields"
else
    echo "❌ ERROR - Workflow failed"
fi

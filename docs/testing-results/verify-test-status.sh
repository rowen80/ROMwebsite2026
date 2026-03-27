#!/bin/bash

# ROM Invoice Testing - Status Verification Script
# Run this to check current state of testing environment

echo "=================================================="
echo "ROM Invoice Testing - Status Verification"
echo "=================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SHEET_ID="17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ"

echo "📋 Test Environment Configuration"
echo "--------------------------------------------------"

# Check SETTINGS
echo -n "NextInvoiceNumber: "
NEXT_INV=$(gog sheets get $SHEET_ID 'SETTINGS!B1' --plain)
if [ "$NEXT_INV" == "9999-0001" ]; then
    echo -e "${GREEN}✓${NC} $NEXT_INV (Test mode)"
elif [[ "$NEXT_INV" == 9999-* ]]; then
    echo -e "${YELLOW}⚠${NC} $NEXT_INV (Test in progress)"
else
    echo -e "${RED}✗${NC} $NEXT_INV (Not configured for testing!)"
fi

echo -n "InvoiceDriveFolderName: "
FOLDER_NAME=$(gog sheets get $SHEET_ID 'SETTINGS!B2' --plain)
if [ "$FOLDER_NAME" == "ROM_INVOICES_test" ]; then
    echo -e "${GREEN}✓${NC} $FOLDER_NAME"
else
    echo -e "${RED}✗${NC} $FOLDER_NAME (Not configured for testing!)"
fi

echo ""
echo "📊 Test Data Status"
echo "--------------------------------------------------"

# Check test rows
echo "Test rows (111-117):"
TEST_DATA=$(gog sheets get $SHEET_ID '2026 FORM_DATA!D111:H117' --plain)
if [ -n "$TEST_DATA" ]; then
    echo -e "${GREEN}✓${NC} Test data present"
    echo "$TEST_DATA" | head -7
else
    echo -e "${RED}✗${NC} Test data missing!"
fi

echo ""
echo "🧪 Test Execution Status"
echo "--------------------------------------------------"

# Check if invoice numbers assigned
echo "Invoice numbers assigned:"
INV_NUMS=$(gog sheets get $SHEET_ID '2026 FORM_DATA!A111:A117' --plain)
if echo "$INV_NUMS" | grep -q "9999-"; then
    echo -e "${YELLOW}⚠${NC} Some tests executed:"
    echo "$INV_NUMS" | grep -v "^$"
    TESTS_RUN=$(echo "$INV_NUMS" | grep -c "9999-")
    echo ""
    echo "Tests completed: $TESTS_RUN / 5"
else
    echo -e "${GREEN}✓${NC} No tests run yet (ready to start)"
fi

echo ""
echo "📧 Email Configuration"
echo "--------------------------------------------------"
echo "Test email addresses:"
echo "  • bardo.faraday+tc001@gmail.com (TC-001)"
echo "  • bardo.faraday+tc002@gmail.com (TC-002)"
echo "  • bardo.faraday+tc003@gmail.com (TC-003)"
echo "  • bardo.faraday+tc004@gmail.com (TC-004)"
echo "  • bardo.faraday+tc005@gmail.com (TC-005)"
echo "  • bardo.faraday+rom@gmail.com (BCC monitor)"

echo ""
echo "📁 Drive Resources"
echo "--------------------------------------------------"
echo -n "Test folder (ROM_INVOICES_test): "
if gog drive search "ROM_INVOICES_test" --json | jq -e '.files[] | select(.name == "ROM_INVOICES_test")' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Found"
    FOLDER_ID=$(gog drive search "ROM_INVOICES_test" --json | jq -r '.files[] | select(.name == "ROM_INVOICES_test") | .id' | head -1)
    echo "  ID: $FOLDER_ID"
else
    echo -e "${RED}✗${NC} Not found!"
fi

echo -n "Test template (_TEST_ROM_INVOICE_TEMPLATE): "
if gog drive search "_TEST_ROM_INVOICE_TEMPLATE" --json | jq -e '.files[] | select(.name == "_TEST_ROM_INVOICE_TEMPLATE")' > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Found"
    TEMPLATE_ID=$(gog drive search "_TEST_ROM_INVOICE_TEMPLATE" --json | jq -r '.files[] | select(.name == "_TEST_ROM_INVOICE_TEMPLATE") | .id' | head -1)
    echo "  ID: $TEMPLATE_ID"
else
    echo -e "${RED}✗${NC} Not found!"
fi

echo ""
echo "📄 Generated Test Invoices"
echo "--------------------------------------------------"
TEST_PDFS=$(gog drive search "9999-" --json 2>/dev/null | jq -r '.files[] | select(.name | contains("9999")) | .name' 2>/dev/null)
if [ -n "$TEST_PDFS" ]; then
    echo -e "${YELLOW}⚠${NC} Test invoices found (tests have been run):"
    echo "$TEST_PDFS"
else
    echo -e "${GREEN}✓${NC} No test invoices yet (clean state)"
fi

echo ""
echo "📋 Documentation Files"
echo "--------------------------------------------------"
DOC_DIR="$(dirname "$0")"
REQUIRED_DOCS=(
    "QUICK-START-MANUAL-TESTING.md"
    "test-execution-guide.md"
    "TEST-RESULTS-LOG.md"
    "PHASE1-LEO-COMPLETION-REPORT.md"
    "INDEX.md"
    "EXECUTIVE-SUMMARY.md"
)

for doc in "${REQUIRED_DOCS[@]}"; do
    if [ -f "$DOC_DIR/$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc"
    else
        echo -e "${RED}✗${NC} $doc (missing!)"
    fi
done

echo ""
echo "🔒 Safety Check"
echo "--------------------------------------------------"
echo -n "Working on staging sheet: "
if [ "$SHEET_ID" == "17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ" ]; then
    echo -e "${GREEN}✓${NC} Yes (safe)"
else
    echo -e "${RED}✗${NC} No (DANGER!)"
fi

echo -n "Test invoice sequence (9999-XXXX): "
if [ "$NEXT_INV" != "${NEXT_INV#9999-}" ]; then
    echo -e "${GREEN}✓${NC} Yes (safe)"
else
    echo -e "${RED}✗${NC} No (using production numbers!)"
fi

echo ""
echo "=================================================="
echo "Summary"
echo "=================================================="

# Overall status
if [ "$NEXT_INV" == "9999-0001" ] && [ "$FOLDER_NAME" == "ROM_INVOICES_test" ] && [ -n "$TEST_DATA" ]; then
    echo -e "${GREEN}✓ READY FOR MANUAL TESTING${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Open QUICK-START-MANUAL-TESTING.md"
    echo "  2. Open staging sheet in browser"
    echo "  3. Execute tests via ROM Ops menu"
    echo "  4. Document results in TEST-RESULTS-LOG.md"
elif [[ "$NEXT_INV" == 9999-* ]] && [ "$NEXT_INV" != "9999-0001" ]; then
    echo -e "${YELLOW}⚠ TESTING IN PROGRESS${NC}"
    echo ""
    EXPECTED_NEXT=$(printf "9999-%04d" $((10#${NEXT_INV#9999-} - 1)))
    echo "Last invoice: $EXPECTED_NEXT"
    echo "Next invoice: $NEXT_INV"
    echo ""
    echo "Continue testing or review results so far."
else
    echo -e "${RED}✗ CONFIGURATION ERROR${NC}"
    echo ""
    echo "Environment not properly configured for testing."
    echo "Check PHASE1-LEO-COMPLETION-REPORT.md for setup instructions."
fi

echo ""
echo "Staging sheet: https://docs.google.com/spreadsheets/d/$SHEET_ID/edit"
echo "Run this script anytime to check status."
echo "=================================================="

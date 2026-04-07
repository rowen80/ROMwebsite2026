/***********************
 * ROM Intake Script
 * Version: 2026-04-06
 * Type: STANDALONE Apps Script (not container-bound)
 *
 * PURPOSE:
 * Receives form submission data from n8n via HTTP POST and writes a new
 * row to the 2026 FORM_DATA sheet using setValues() on a naturally blank
 * row. This avoids the Google Sheets API values.append INSERT_ROWS behavior
 * which physically inserts rows and breaks ARRAYFORMULA coverage on the
 * Total and InvoiceStatus columns.
 *
 * HOW IT FITS:
 *   Browser Form → n8n Webhook → n8n sends email → n8n calls THIS script
 *   → THIS script writes row to sheet → ARRAYFORMULA auto-calculates Total
 *
 * DEPLOYMENT (one-time setup):
 *   1. In Apps Script editor: Run setup() once to generate the shared secret
 *   2. Copy the secret from the Execution Log
 *   3. Deploy as Web App:
 *        Execute as: Me (ryan.owen@ryanowenphotography.com)
 *        Who has access: Anyone
 *   4. Copy the Web App URL
 *   5. In n8n: paste URL and secret into the "POST to Intake Script" node
 *
 * REDEPLOYMENT (after any code change):
 *   Deploy > Manage Deployments > Edit (pencil) > Version: New Version > Deploy
 *   The URL stays the same — no need to update n8n.
 *
 * SECURITY:
 *   All requests must include ?secret=YOUR_SECRET in the URL.
 *   The secret is stored in Apps Script Script Properties (not in code).
 *   Anyone with the URL + secret can POST rows — keep both private.
 ***********************/

// ============================================================
// CONFIGURATION — update ACTIVE_SHEET_ID when switching environments
// ============================================================

const INTAKE_PROD_SHEET_ID  = "1F87dygig_3HFPvtWp7x1KfKdowyoBPKnKCAjLUYyoKs"; // ROM_CUSTOMER_MASTER (live)
const INTAKE_STAGE_SHEET_ID = "17L80EjoMc8RQYZwob5I2XtXTY9J0yo73a6P5Fr0noUQ"; // ROMwebsite2026_data (staging)
const INTAKE_ACTIVE_SHEET_ID = INTAKE_STAGE_SHEET_ID; // ← switch to PROD when ready
const INTAKE_SHEET_TAB = "2026 FORM_DATA";

// ============================================================
// MAIN ENTRY POINT — called by n8n HTTP Request node
// ============================================================

function doPost(e) {
  try {

    // --- 1. Validate shared secret ---
    const secret = PropertiesService.getScriptProperties().getProperty("INTAKE_SECRET");
    if (!secret) {
      return jsonOut({ ok: false, error: "INTAKE_SECRET not set. Run setup() in the Apps Script editor." });
    }
    const provided = (e.parameter && e.parameter.secret) ? e.parameter.secret : "";
    if (provided !== secret) {
      return jsonOut({ ok: false, error: "Unauthorized" });
    }

    // --- 2. Parse POST body ---
    if (!e.postData || !e.postData.contents) {
      return jsonOut({ ok: false, error: "Missing POST body" });
    }
    const data = JSON.parse(e.postData.contents);

    // --- 3. Open the spreadsheet and tab ---
    const ss = SpreadsheetApp.openById(INTAKE_ACTIVE_SHEET_ID);
    const sheet = ss.getSheetByName(INTAKE_SHEET_TAB);
    if (!sheet) throw new Error("Sheet tab not found: " + INTAKE_SHEET_TAB);

    // --- 4. Read header row to get column order ---
    // The script maps data by column name, not position.
    // This means column order and new columns don't break anything.
    const lastCol = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // --- 5. Find next empty row ---
    // getLastRow() counts ARRAYFORMULA spill results as content and returns a
    // row number in the tens of thousands. Instead, find the last non-empty
    // cell in the SubmittedAt column — always populated by real submissions,
    // never touched by ARRAYFORMULAs.
    const submittedAtCol = headers.indexOf("SubmittedAt") + 1; // 1-based
    if (submittedAtCol < 1) throw new Error("SubmittedAt column not found in headers");
    const submittedAtValues = sheet.getRange(1, submittedAtCol, Math.min(sheet.getMaxRows(), 2000), 1).getValues();
    let lastDataRow = 1;
    for (let i = 1; i < submittedAtValues.length; i++) {
      if (submittedAtValues[i][0] !== "") lastDataRow = i + 1;
    }
    const targetRow = lastDataRow + 1;

    // --- 6. Build row array in sheet column order ---
    // Headers with no matching key in data get an empty string.
    const rowData = headers.map(function(header) {
      const key = String(header).trim();
      const val = data[key];
      return (val !== undefined && val !== null) ? val : "";
    });

    // --- 7. Write to sheet ---
    // setValues() writes to an existing range without inserting rows.
    sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);

    return jsonOut({ ok: true, row: targetRow, cols: rowData.length });

  } catch (err) {
    return jsonOut({ ok: false, error: err.message });
  }
}

// ============================================================
// SETUP & UTILITIES — run manually from the Apps Script editor
// ============================================================

/**
 * Run once after creating the script to generate and store the shared secret.
 * Check the Execution Log for the value to copy into n8n.
 */
function setup() {
  const existing = PropertiesService.getScriptProperties().getProperty("INTAKE_SECRET");
  if (existing) {
    Logger.log("INTAKE_SECRET already set: " + existing);
    Logger.log("Run clearSecret() first if you want to regenerate.");
    return;
  }
  const secret = "ROM-" + Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperty("INTAKE_SECRET", secret);
  Logger.log("==============================================");
  Logger.log("INTAKE_SECRET generated and stored.");
  Logger.log("Copy this value into n8n (?secret=VALUE):");
  Logger.log(secret);
  Logger.log("==============================================");
}

/**
 * Clears the stored secret so setup() can generate a new one.
 * Only use if you need to rotate the secret (also update n8n).
 */
function clearSecret() {
  PropertiesService.getScriptProperties().deleteProperty("INTAKE_SECRET");
  Logger.log("INTAKE_SECRET cleared.");
}

/**
 * Quick test — verifies the script can open the sheet and read headers.
 * Run from the Apps Script editor before deploying as Web App.
 */
function testSheetAccess() {
  const ss = SpreadsheetApp.openById(INTAKE_ACTIVE_SHEET_ID);
  const sheet = ss.getSheetByName(INTAKE_SHEET_TAB);
  if (!sheet) {
    Logger.log("ERROR: Sheet tab not found: " + INTAKE_SHEET_TAB);
    return;
  }
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  Logger.log("SUCCESS: Sheet found.");
  Logger.log("Last row with content: " + lastRow);
  Logger.log("Next row will be written to: " + (lastRow + 1));
  Logger.log("Columns (" + lastCol + "): " + headers.join(", "));
}

/**
 * Sends a test POST to the deployed Web App to verify the full round-trip.
 * Replace WEB_APP_URL with your deployed URL before running.
 */
function testEndpoint() {
  const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwlRJ0QAPlFKAuNZol1RHmzJ8ipQWG7V9pkZKWhBu_ASXggicmFrTNVawXX9fNLcUCN/exec";
  const secret = PropertiesService.getScriptProperties().getProperty("INTAKE_SECRET");
  if (!secret) { Logger.log("Run setup() first."); return; }

  const testData = {
    "SubmittedAt": new Date().toISOString(),
    "ClientFirstName": "TEST",
    "ClientLastName": "SUBMISSION",
    "ClientEmail": "test@example.com",
    "ClientPhone": "555-000-0000",
    "Company": "Test Company",
    "Bedrooms": "3",
    "List Price": "$300k-$400k",
    "Sq Ft": "1500",
    "Listing Address": "123 Test St",
    "City": "Rehoboth Beach",
    "Sales/Rentals": "Sales",
    "Service": "Basic Photos",
    "Estimated Line Items": "Basic Photos: $199.00;",
    "Estimated Total": "199"
  };

  const response = UrlFetchApp.fetch(WEB_APP_URL + "?secret=" + secret, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(testData),
    muteHttpExceptions: true
  });
  Logger.log("Status: " + response.getResponseCode());
  Logger.log("Response: " + response.getContentText());
}

// ============================================================
// HELPER
// ============================================================

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

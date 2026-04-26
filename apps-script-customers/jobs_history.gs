function initJobsHistorySheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("JOBS_HISTORY") || ss.insertSheet("JOBS_HISTORY");

  const headers = [
   "JobID",
   "CustomerID",
   "FirstName",
   "LastName",
   "Company",
   "JobDate",
   "Address",
   "City",
   "EstimatedLineItems",
   "Total",
   "Status",
   "CancelledAt",
   "Notes"
  ];


  sheet.clear();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);

  // Status dropdown
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["SCHEDULED", "COMPLETED", "CANCELLED"], true)
    .setAllowInvalid(false)
    .build();

  sheet.getRange(2, headers.indexOf("Status") + 1, 1000, 1).setDataValidation(rule);
}

function refreshJobsFromDb() {
  const props = PropertiesService.getScriptProperties();
  const baseUrl = props.getProperty("BASE_URL");
  const key = props.getProperty("CUSTOMER_SYNC_KEY");
  if (!baseUrl || !key) throw new Error("Missing Script Properties: BASE_URL and/or CUSTOMER_SYNC_KEY");

  const url = baseUrl.replace(/\/+$/, "") + "/admin/jobs_sync/export?include_cancelled=1";
  const resp = UrlFetchApp.fetch(url, {
    method: "get",
    headers: { "X-API-Key": key },
    muteHttpExceptions: true,
  });

  const code = resp.getResponseCode();
  const body = resp.getContentText();

  // If backend isn't ready yet, fail loudly but clearly
  if (code !== 200) {
    throw new Error("Jobs export failed: HTTP " + code + " — " + body);
  }

  const data = JSON.parse(body);
  const jobs = data.jobs || [];

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("JOBS_HISTORY");
  if (!sheet) throw new Error("Missing sheet: JOBS_HISTORY. Run initJobsHistorySheet first.");

  const headers = [
    "JobID",
    "CustomerID",
    "FirstName",
    "LastName",
    "Company",
    "JobDate",
    "Address",
    "City",
    "EstimatedLineItems",
    "Total",
    "Status",
    "CancelledAt",
    "Notes"
  ];

  // Write headers (always)
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);

const finalLastCol = headers.length;


  // Preserve extras keyed by JobID
  const existing = {};
  const existingRows = sheet.getLastRow();
  if (existingRows >= 2) {
    const existingData = sheet.getRange(2, 1, existingRows - 1, finalLastCol).getValues();
    for (const row of existingData) {
      const jid = String(row[0] || "").trim(); // JobID is col A
      if (!jid) continue;
      existing[jid] = {
        EstimatedLineItems: row[headers.indexOf("EstimatedLineItems")],
        Total: row[headers.indexOf("Total")],
        Notes: row[headers.indexOf("Notes")],
      };
    }
  }

  const rows = jobs.map(j => {
    const jid = String(j.job_id || "").trim();
    const extras = existing[jid] || { EstimatedLineItems: "", Total: "", Notes: "" };

    return [
      j.job_id || "",
      j.customer_id || "",
      j.first_name || "",
      j.last_name || "",
      j.company || "",
      j.job_date || "",
      j.address || "",
      j.city || "",
      extras.EstimatedLineItems || "",
      extras.Total || "",
      (j.status === "CANCELLED" ? "CANCELLED" : ""),   // show only cancelled
      j.cancelled_at || "",
      extras.Notes || ""
    ];


  });

  // Clear old data rows only
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, finalLastCol).clearContent();
  }

  // Write fresh rows
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, finalLastCol).setValues(rows);
  }
}

function manualUpdateJobs() {
  const props = PropertiesService.getScriptProperties();
  const baseUrl = props.getProperty("BASE_URL");
  const key = props.getProperty("CUSTOMER_SYNC_KEY");

  if (!baseUrl || !key) throw new Error("Missing Script Properties.");

  const sheet = SpreadsheetApp.getActive().getSheetByName("JOBS_HISTORY");
  if (!sheet) throw new Error("Missing JOBS_HISTORY sheet.");

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h || "").trim());

  const idx = {};
  headers.forEach((h, i) => idx[h] = i);

  if (idx["JobID"] == null || idx["Status"] == null) {
    throw new Error("Missing JobID or Status column.");
  }

  const selection = sheet.getActiveRange();
  if (!selection) throw new Error("Select rows first.");

  const startRow = selection.getRow();
  const numRows = selection.getNumRows();

  if (startRow < 2) throw new Error("Selection must start below header.");

  const ui = SpreadsheetApp.getUi();
  if (ui.alert(
    "Cancel selected jobs?",
    `This will update ${numRows} job(s) in the database.\n\nContinue?`,
    ui.ButtonSet.YES_NO
  ) !== ui.Button.YES) return;

  const url = baseUrl.replace(/\/+$/, "") + "/admin/jobs_sync/update";

  let updated = 0;

  for (let r = startRow - 1; r < startRow - 1 + numRows; r++) {
    const row = data[r];
    const jobId = row[idx["JobID"]];
    const status = String(row[idx["Status"]] || "").trim();

    if (!jobId) continue;

    UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      headers: { "X-API-Key": key },
      payload: JSON.stringify({
        job_id: Number(jobId),
        status: status   // send whatever is in the cell (CANCELLED or blank)
      }),
      muteHttpExceptions: false
    });

    updated++;

  }

  ui.alert(`Updated ${updated} job(s).`);
  refreshJobsFromDb();
}


function onOpen() {
  const ui = SpreadsheetApp.getUi();

  ui.createMenu("Customers")
    .addItem("Refresh from DB", "refreshCustomersFromDb")
    .addItem("Preview merges", "previewCustomerMerges")
    .addItem("Apply merges", "applyCustomerMerges")
    .addItem("Manual Update", "manualUpdateCustomers")
    .addSeparator()
    .addItem("Delete Selected", "deleteSelectedCustomers")
    .addToUi();

  ui.createMenu("Jobs")
  .addItem("Refresh from DB", "refreshJobsFromDb")
  .addItem("Manual Update", "manualUpdateJobs")
  .addToUi();
}

function refreshCustomersFromDb() {
  const props = PropertiesService.getScriptProperties();
  const baseUrl = props.getProperty("BASE_URL");
  const key = props.getProperty("CUSTOMER_SYNC_KEY");
  if (!baseUrl || !key) throw new Error("Missing Script Properties: BASE_URL and/or CUSTOMER_SYNC_KEY");

  const url = baseUrl.replace(/\/+$/, "") + "/admin/customers/export";
  const resp = UrlFetchApp.fetch(url, {
    method: "get",
    headers: { "X-API-Key": key },
    muteHttpExceptions: true,
  });

  const code = resp.getResponseCode();
  const body = resp.getContentText();
  if (code !== 200) throw new Error("Export failed: HTTP " + code + " — " + body);

  const data = JSON.parse(body);
  const customers = data.customers || [];


  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("CUSTOMERS") || ss.insertSheet("CUSTOMERS");

  const dbHeaders = [
    "CustomerID","FirstName","LastName","Email","Phone","Company","CompanyId","HasAccount","CreatedAt","UpdatedAt"
  ];

  const extraHeaders = [
    "MatchStatus","MergeIntoCustomerID","Notes","AltEmail","AltPhone","UpdateStatus"
  ];

  // Ensure header row exists
  if (sheet.getLastRow() === 0) sheet.getRange(1, 1).setValue("CustomerID");

  // Read current headers
  const currentLastCol = Math.max(sheet.getLastColumn(), dbHeaders.length);
  const currentHeaders = sheet.getRange(1, 1, 1, currentLastCol).getValues()[0].map(h => String(h || "").trim());

  // Write DB headers into A:J (always)
  sheet.getRange(1, 1, 1, dbHeaders.length).setValues([dbHeaders]);

  // Ensure extra headers exist (append if missing)
  const headersAfterDb = sheet.getRange(1, dbHeaders.length + 1, 1, Math.max(sheet.getLastColumn() - dbHeaders.length, 0))
    .getValues()[0]
    .map(h => String(h || "").trim());

  const existingSet = new Set(headersAfterDb.filter(Boolean));
  const toAdd = extraHeaders.filter(h => !existingSet.has(h));

  if (toAdd.length) {
    const startCol = Math.max(sheet.getLastColumn() + 1, dbHeaders.length + 1);
    sheet.getRange(1, startCol, 1, toAdd.length).setValues([toAdd]);
  }

  // Recompute final column count after possibly adding headers
  const finalLastCol = sheet.getLastColumn();
  const finalHeaders = sheet.getRange(1, 1, 1, finalLastCol).getValues()[0].map(h => String(h || "").trim());

  // Map header -> index
  const idx = {};
  finalHeaders.forEach((h, i) => { if (h) idx[h] = i; });

  // Load existing extras by CustomerID so they survive refresh
  const existing = {};
  const existingRows = sheet.getLastRow();
  if (existingRows >= 2) {
    const existingData = sheet.getRange(2, 1, existingRows - 1, finalLastCol).getValues();
    for (const row of existingData) {
      const cid = String(row[idx["CustomerID"]] || "").trim();
      if (!cid) continue;
      const extras = row.slice(dbHeaders.length); // everything after J
      existing[cid] = extras;
    }
  }

  // Build new rows: DB columns + preserved extras
  const rows = customers.map(c => {
    const cid = String(c.customer_id || "").trim();
    const base = [
      c.customer_id || "",
      c.first_name || "",
      c.last_name || "",
      c.email || "",
      c.phone || "",
      c.company || "",
      c.company_id || "",
      c.has_account || "",
      c.created_at || "",
      c.updated_at || ""
    ];
    const extrasWidth = finalLastCol - dbHeaders.length;
    const extras = existing[cid] || new Array(Math.max(extrasWidth, 0)).fill("");

    // Fill AltEmail / AltPhone columns from DB export if headers exist
    const altEmailPos = (function() {
      const h = sheet.getRange(1, 1, 1, finalLastCol).getValues()[0].map(x => String(x || "").trim());
      return h.indexOf("AltEmail");
    })();
    const altPhonePos = (function() {
      const h = sheet.getRange(1, 1, 1, finalLastCol).getValues()[0].map(x => String(x || "").trim());
      return h.indexOf("AltPhone");
    })();

    // altEmailPos/altPhonePos are absolute column indexes (0-based)
    // extras are relative to dbHeaders.length
    if (altEmailPos >= dbHeaders.length && (c.alt_emails || "")) {
      extras[altEmailPos - dbHeaders.length] = c.alt_emails;
    }
    if (altPhonePos >= dbHeaders.length && (c.alt_phones || "")) {
      extras[altPhonePos - dbHeaders.length] = c.alt_phones;
    }

    return base.concat(extras);

  });

  // Clear only the data rows (keeps column widths and headers)
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, finalLastCol).clearContent();
  }

  if (rows.length) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }

  sheet.setFrozenRows(1);
}



function previewCustomerMerges() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("CUSTOMERS");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const idx = {};
  headers.forEach((h, i) => idx[h] = i);

  const previews = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = row[idx["MatchStatus"]];
    const target = row[idx["MergeIntoCustomerID"]];
    const sourceId = row[idx["CustomerID"]];

    if (status === "DUPLICATE" && target) {
      previews.push(
        `Merge Customer ${sourceId} → ${target}`
      );
    }
  }

  if (!previews.length) {
    SpreadsheetApp.getUi().alert("No merges found.");
    return;
  }

  SpreadsheetApp.getUi().alert(
    "Preview merges:\n\n" + previews.join("\n")
  );
}

function applyCustomerMerges() {
  const props = PropertiesService.getScriptProperties();
  const baseUrl = props.getProperty("BASE_URL");
  const key = props.getProperty("CUSTOMER_SYNC_KEY");

  if (!baseUrl || !key) throw new Error("Missing Script Properties: BASE_URL and/or CUSTOMER_SYNC_KEY");

  const sheet = SpreadsheetApp.getActive().getSheetByName("CUSTOMERS");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const idx = {};
  headers.forEach((h, i) => idx[h] = i);

  const statusCol = idx["MatchStatus"];
  const mergeCol = idx["MergeIntoCustomerID"];
  const idCol = idx["CustomerID"];

  if (statusCol == null || mergeCol == null || idCol == null) {
    throw new Error("Missing required headers: CustomerID, MatchStatus, MergeIntoCustomerID");
  }

  const merges = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status = String(row[statusCol] || "").trim();
    const target = String(row[mergeCol] || "").trim();
    const sourceId = String(row[idCol] || "").trim();

    if (status === "DUPLICATE" && target && sourceId) {
      merges.push({ source_customer_id: Number(sourceId), target_customer_id: Number(target) });
    }
  }

  if (!merges.length) {
    SpreadsheetApp.getUi().alert("No merges found.");
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const preview = merges.map(m => `${m.source_customer_id} → ${m.target_customer_id}`).join("\n");
  const resp = ui.alert("Apply merges?", `This will merge:\n\n${preview}\n\nContinue?`, ui.ButtonSet.YES_NO);
  if (resp !== ui.Button.YES) return;

  const url = baseUrl.replace(/\/+$/, "") + "/admin/customers/merge";

  for (const m of merges) {
    const r = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      headers: { "X-API-Key": key },
      payload: JSON.stringify(m),
      muteHttpExceptions: true,
    });

    const code = r.getResponseCode();
    if (code !== 200) {
      throw new Error(`Merge failed (${m.source_customer_id}→${m.target_customer_id}): HTTP ${code} — ${r.getContentText()}`);
    }
  }

  // Refresh sheet from DB after merges
  refreshCustomersFromDb();
  ui.alert("Merges applied and sheet refreshed.");
}

function manualUpdateCustomers() {
  const props = PropertiesService.getScriptProperties();
  const baseUrl = props.getProperty("BASE_URL");
  const key = props.getProperty("CUSTOMER_SYNC_KEY");
  if (!baseUrl || !key) throw new Error("Missing Script Properties.");

  const sheet = SpreadsheetApp.getActive().getSheetByName("CUSTOMERS");
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h || "").trim());

  const idx = {};
  headers.forEach((h, i) => idx[h] = i);

  if (idx["CustomerID"] == null) throw new Error("Missing CustomerID column.");

  const url = baseUrl.replace(/\/+$/, "") + "/admin/customers_sync/update";

  let count = 0;

  const ui = SpreadsheetApp.getUi();

  const selection = sheet.getActiveRange();
  if (!selection) throw new Error("Select the rows you want to update first.");

  const startRow = selection.getRow();
  const numRows = selection.getNumRows();

  // Must include at least one data row (row >= 2)
  if (startRow < 2) throw new Error("Selection must start on row 2 or below (not the header).");

  const totalRows = numRows;

  if (ui.alert(
    "Manual Update",
    `This will update ${totalRows} customer rows.\n\nContinue?`,
    ui.ButtonSet.YES_NO
  ) !== ui.Button.YES) {
    return;
  }

for (let r = startRow - 1; r < (startRow - 1 + numRows); r++) {
    const row = data[r];
    const customerId = String(row[idx["CustomerID"]] || "").trim();
    if (!customerId) continue;

    const payload = {
      customer_id: Number(customerId),
      first_name: idx["FirstName"] != null ? row[idx["FirstName"]] : null,
      last_name:  idx["LastName"]  != null ? row[idx["LastName"]]  : null,
      email: idx["Email"] != null ? String(row[idx["Email"]] ?? "") : null,
      phone: idx["Phone"] != null ? String(row[idx["Phone"]] ?? "") : null,
      company:    idx["Company"]   != null ? row[idx["Company"]]   : null,
      alt_emails: idx["AltEmail"]  != null ? String(row[idx["AltEmail"]])  : null,
      alt_phones: idx["AltPhone"]  != null ? String(row[idx["AltPhone"]])  : null
    };

    if (idx["CompanyId"] != null) {
      const v = String(row[idx["CompanyId"]] || "").trim();
      payload.company_id = v ? Number(v) : null;
    }

    UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      headers: { "X-API-Key": key },
      payload: JSON.stringify(payload),
      muteHttpExceptions: false,
    });

    count++;
  }

  SpreadsheetApp.getUi().alert(`Updated ${count} customers.`);
  refreshCustomersFromDb();
}


function deleteSelectedCustomers() {
  const props = PropertiesService.getScriptProperties();
  const baseUrl = props.getProperty("BASE_URL");
  const key = props.getProperty("CUSTOMER_SYNC_KEY");
  if (!baseUrl || !key) throw new Error("Missing Script Properties.");

  const sheet = SpreadsheetApp.getActive().getSheetByName("CUSTOMERS");
  if (!sheet) throw new Error("Missing CUSTOMERS sheet.");

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h || "").trim());
  const idx = {};
  headers.forEach((h, i) => idx[h] = i);

  if (idx["CustomerID"] == null) throw new Error("Missing CustomerID column.");

  const selection = sheet.getActiveRange();
  if (!selection) throw new Error("Select the rows you want to delete first.");

  const startRow = selection.getRow();
  const numRows = selection.getNumRows();

  if (startRow < 2) throw new Error("Selection must start on row 2 or below (not the header).");

  const customerIds = [];
  const names = [];
  for (let r = startRow - 1; r < startRow - 1 + numRows; r++) {
    const row = data[r];
    const cid = String(row[idx["CustomerID"]] || "").trim();
    if (!cid) continue;
    customerIds.push(Number(cid));
    const name = [row[idx["FirstName"]] || "", row[idx["LastName"]] || ""].join(" ").trim() || "(no name)";
    names.push(`ID ${cid}: ${name}`);
  }

  if (!customerIds.length) {
    SpreadsheetApp.getUi().alert("No valid customers found in selection.");
    return;
  }

  const ui = SpreadsheetApp.getUi();
  const resp = ui.alert(
    "⚠️ Delete Customers?",
    `This will permanently delete ${customerIds.length} customer(s) and all their associated jobs from the database:\n\n${names.join("\n")}\n\nThis cannot be undone. Continue?`,
    ui.ButtonSet.YES_NO
  );
  if (resp !== ui.Button.YES) return;

  const url = baseUrl.replace(/\/+$/, "") + "/admin/customers/delete";
  const r = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { "X-API-Key": key },
    payload: JSON.stringify({ customer_ids: customerIds }),
    muteHttpExceptions: true,
  });

  const code = r.getResponseCode();
  if (code !== 200) {
    throw new Error("Delete failed: HTTP " + code + " — " + r.getContentText());
  }

  const result = JSON.parse(r.getContentText());
  refreshCustomersFromDb();
  ui.alert(`Deleted ${result.deleted_count} customer(s) and their associated jobs.`);
}



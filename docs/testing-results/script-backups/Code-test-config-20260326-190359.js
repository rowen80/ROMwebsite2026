/***********************
 * ROM: Delivery + Invoicing
 * UPDATED 2026-03-22: Added ReelsLink support
 * 3 Workflows:
 * 1) Photos Only: Delivered blank + PhotoLink present + not invoiced -> send links, set Delivered=Y
 * 2) Photos + Invoice (<=3 rows per Company group): Delivered blank + PhotoLink present + not invoiced -> send links + invoice attached, set Delivered=Y + invoice fields
 * 3) Invoice Only: Delivered=Y + not invoiced -> send invoice attached, set invoice fields
 *
 * Preview modes: NO email, NO writes, NO files.
 ***********************/

const SHEET_NAME = ""; // "" = active sheet
const SETTINGS_SHEET_NAME = "SETTINGS";
const DOC_TEMPLATE_NAME = "_TEST_ROM_INVOICE_TEMPLATE"; // TEST MODE
const INVOICE_FOLDER_NAME = "ROM_INVOICES_test"; // TEST MODE
const INVOICE_PREVIEW_SUBFOLDER_NAME = "_PREVIEW";
const BILLING_SHEET_NAME = "CO_BILLING_INFO";

const INVOICES_SHEET_NAME = "INVOICES";

const INVOICE_HEADERS = [
 "InvoiceNumber",
 "InvoicedAt",
 "InvoiceStatus",
 "ClientLastName",
 "ClientFirstName",
 "InvoiceToEmail",
 "Company",
 "Total",
 "InvoicePDFUrl",
 "AmountDue",
 "DateDue",
 "SecondAttempt",
 "ThirdAttempt"
];

const EMAIL_FROM_NAME = "Ryan Owen Photography";
const EMAIL_FROM_ADDRESS = "ryan@ryanowenphotography.com"; // Production email (Gmail send-as)
const EMAIL_BCC_ADDRESS = "bardo.faraday+rom@gmail.com"; // TEST MODE - BCC to test email

// Payment QR image filenames in Drive (by exact name)
const ZELLE_QR_FILENAME = "ZelleQr.jpg";
const VENMO_QR_FILENAME = "VenmoQr.jpg";

// =============================================================================================
// Email Wording
// =============================================================================================

function buildSignatureText_() {
 return (
 "\n\nRyan Owen \n\n" +
 "240-401-8385\n" +
 "www.ryanowenphotography.com\n\n\n" +
 "*** In order to give every project my full attention, I cannot respond to emails or texts while I am shooting. Thank you for your patience. ***"
 );
}

function buildSignatureHtml_() {
 return (
 "<br><br>Ryan Owen<br><br>" +
 "240-401-8385<br>" +
 "www.ryanowenphotography.com<br><br><br>" +
 "<b>*** In order to give every project my full attention, I cannot respond to emails or texts while I am shooting. Thank you for your patience. ***</b>"
 );
}

function buildPhotoInvoiceEmailText_(clientName, amountDue, linksBlock) {
 return (
 `Hi ${clientName},\n\n` +
 "Photos are available for download at the link below. Invoice is attached. " +
 `The total due came to ${money_(amountDue)} and can be paid via the links at the bottom. ` +
 `This link will be valid for 30 days. Please download all files to your personal device for permanent storage. \n\n ` +
 "Thanks! Ryan\n\n" +
 linksBlock +
 buildSignatureText_()
 );
}

function buildPhotoInvoiceEmailHtml_(clientName, amountDue, linksBlockHtml) {
 return (
 `Hi ${escapeHtml_(clientName)},<br><br>` +
 "Photos are available for download at the link below. Invoice is attached. " +
 `The total due came to <b>${money_(amountDue)}</b> and can be paid via the links at the bottom. ` +
 `This link will be valid for 30 days. Please download all files to your personal device for permanent storage. <br><br> ` +
 "Thanks! Ryan<br><br>" +
 linksBlockHtml +
 "<br>" +
 `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
 `<td style="padding-right:24px;"><img src="cid:zelleqr" style="width:220px;height:220px;" alt="Zelle QR"></td>` +
 `<td><img src="cid:venmoqr" style="width:220px;height:220px;" alt="Venmo QR"></td>` +
 `</tr></table>` +
 buildSignatureHtml_()
 );
}

function buildInvoiceOnlyEmailText_(clientName, invoiceNumber, amountDue) {
 return (
 `Hi ${clientName},\n\n` +
 `Your most recent Photography Invoice (${invoiceNumber}) is attached. ` +
 `The total due came to ${money_(amountDue)} and can be paid via the links at the bottom. ` +
 "Please let me know if there is anything else I can do for you.\n\n" +
 "Thanks! Ryan\n" +
 buildSignatureText_()
 );
}

function buildInvoiceOnlyEmailHtml_(clientName, invoiceNumber, amountDue) {
 return (
 `Hi ${escapeHtml_(clientName)},<br><br>` +
 `Your most recent Photography Invoice (<b>${escapeHtml_(invoiceNumber)}</b>) is attached. ` +
 `The total due came to <b>${money_(amountDue)}</b> and can be paid via the links at the bottom. ` +
 "Please let me know if there is anything else I can do for you.<br><br>" +
 "Thanks! Ryan<br>" +
 "<br>" +
 `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
 `<td style="padding-right:24px;"><img src="cid:zelleqr" style="width:220px;height:220px;" alt="Zelle QR"></td>` +
 `<td><img src="cid:venmoqr" style="width:220px;height:220px;" alt="Venmo QR"></td>` +
 `</tr></table>` +
 buildSignatureHtml_()
 );
}

function buildOverdueAttemptEmailText_(firstName, lastName, amountDue) {
 const fn = String(firstName || "").trim();
 const ln = String(lastName || "").trim();
 const full = `${fn} ${ln}`.trim() || "there";

 return (
 `Dear ${full},\n\n` +
 `Our records show that you have an outstanding invoice for the amount(s) due of ${money_(amountDue)}. ` +
 "Please use the links below to remit payment as soon as possible.\n\n" +
 "This is an automatically generated message. If you feel there has been an error, please let us know, so that we can correct our records.\n\n" +
 "Thanks!\n\n" +
 "Ryan Owen Photography"
 );
}

function buildOverdueAttemptEmailHtml_(firstName, lastName, amountDue) {
 const fn = String(firstName || "").trim();
 const ln = String(lastName || "").trim();
 const full = escapeHtml_(`${fn} ${ln}`.trim() || "there");

 return (
 `Dear ${full},<br><br>` +
 `Our records show that you have an outstanding invoice for the amount(s) due of <b>${money_(amountDue)}</b>. ` +
 "Please use the links below to remit payment as soon as possible.<br><br>" +
 "This is an automatically generated message. If you feel there has been an error, please let us know, so that we can correct our records.<br><br>" +
 "Thanks!<br><br>" +
 "Ryan Owen Photography<br><br>" +
 `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
 `<td style="padding-right:24px;"><img src="cid:zelleqr" style="width:220px;height:220px;" alt="Zelle QR"></td>` +
 `<td><img src="cid:venmoqr" style="width:220px;height:220px;" alt="Venmo QR"></td>` +
 `</tr></table>`
 );
}

// Column headers (must match your sheet headers EXACTLY)
const COLS = {
 InvoiceNumber: "InvoiceNumber",
 SubmittedAt: "SubmittedAt",

 CustomerId: "Customer ID",
 CompanyId: "Company ID",
 MatchStatus: "Match Status",

 ClientFirstName: "ClientFirstName",
 ClientLastName: "ClientLastName",
 ClientEmail: "ClientEmail",
 ClientPhone: "ClientPhone",

 Service: "Service",
 Company: "Company",
 Bedrooms: "Bedrooms",
 ListPrice: "List Price",
 SqFt: "Sq Ft",
 ListingAddress: "Listing Address",
 City: "City",
 SalesRentals: "Sales/Rentals",

 EstLineItems: "Estimated Line Items",
 EstTotal: "Estimated Total",
 Total: "Total",
 Deposit: "Deposit",

 Delivered: "Delivered", // blank or "Y"
 PhotoLink: "PhotoLink",
 VideoLink: "VideoLink",
 ReelsLink: "ReelsLink",
 LockedLink: "LockedLink",

 ManualInvoice: "ManualInvoice",
 InvoicedAt: "InvoicedAt",
 InvoiceStatus: "InvoiceStatus", // blank / SENT / PAID
 InvoicePDFUrl: "InvoicePDFUrl",
 InvoicePreviewUrl: "InvoicePreviewUrl",
 BillingEmail: "BillingEmail",
 Message: "Message",
};

// ===== Menu =====

function onOpen() {
 SpreadsheetApp.getUi()
 .createMenu("ROM Ops")
 .addSubMenu(
 SpreadsheetApp.getUi()
 .createMenu("Delivery")
 .addItem("Send Photos Only (by Company)", "sendPhotosOnlyByCompany")
 .addItem("Send Photos Only (by ClientLastName)", "sendPhotosOnlyByLastName")
 .addSeparator()
 .addItem("Send Photos + Invoice (≤3 rows) (by Company)", "sendPhotosPlusInvoiceByCompany")
 .addItem("Send Photos + Invoice (≤3 rows) (by ClientLastName)", "sendPhotosPlusInvoiceByLastName")
 .addSeparator()
 .addItem("Send LOCKED Photos + Invoice (≤3 rows) (by Company)", "sendLockedPhotosPlusInvoiceByCompany")
 .addItem("Send LOCKED Photos + Invoice (≤3 rows) (by ClientLastName)", "sendLockedPhotosPlusInvoiceByLastName")
 .addSeparator()
 .addItem("Send THANK YOU (Download Link) (by Company)", "sendThankYouDownloadLinkByCompany")
 .addItem("Send THANK YOU (Download Link) (by ClientLastName)", "sendThankYouDownloadLinkByLastName")
 )
 .addSubMenu(
 SpreadsheetApp.getUi()
 .createMenu("Invoicing")
 .addItem("Send Invoice Only (by Company)", "sendInvoiceOnlyByCompany")
 .addItem("Send Invoice Only (By ClientLastName, Del. = Y)", "sendInvoiceOnlyByLastName")
 .addSeparator()
 .addItem("Create Invoice (NO EMAIL) (by Company)", "createInvoiceNoEmailByCompany")
 .addItem("Create Invoice (NO EMAIL) (by ClientLastName)", "createInvoiceNoEmailByLastName")
 .addSeparator()
 .addItem("Send Second Attempt (Past Due) — by ClientLastName", "sendSecondAttemptOverdueByLastName")
 .addItem("Send Third Attempt (14 Days Past Due) — by ClientLastName", "sendThirdAttemptOverdueByLastName")
 )
 .addToUi();
}

// ===== Public entry points =====

// --- Script 1: Photos Only ---

// =============================================================================================
// SECTION 1: PHOTOS ONLY (NO INVOICE ATTACHED)
// =============================================================================================

function sendPhotosOnlyByCompany() {
 const company = prompt_("Photos Only (by Company)", "Enter Company (case-insensitive exact match):");
 if (!company) return;
 runPhotosOnly_({ mode: "COMPANY", companyQuery: company, preview: false });
}

function sendPhotosOnlyByLastName() {
 const lastName = prompt_("Photos Only (by ClientLastName)", "Enter ClientLastName (case-insensitive exact match):");
 if (!lastName) return;
 runPhotosOnly_({ mode: "LASTNAME", lastNameQuery: lastName, preview: false });
}

function previewPhotosOnlyByCompany() {
 const company = prompt_("PREVIEW Photos Only (by Company)", "Enter Company (case-insensitive exact match):");
 if (!company) return;
 runPhotosOnly_({ mode: "COMPANY", companyQuery: company, preview: true });
}

function previewPhotosOnlyByLastName() {
 const lastName = prompt_("PREVIEW Photos Only (by ClientLastName)", "Enter ClientLastName (case-insensitive exact match):");
 if (!lastName) return;
 runPhotosOnly_({ mode: "LASTNAME", lastNameQuery: lastName, preview: true });
}

// --- Script 2: Photos + Invoice (<=3 rows) ---
function sendPhotosPlusInvoiceByCompany() {
 const company = prompt_("Photos + Invoice (≤3) (by Company)", "Enter Company (case-insensitive exact match):");
 if (!company) return;
 runPhotosPlusInvoice_({ mode: "COMPANY", companyQuery: company, preview: false });
}

function sendPhotosPlusInvoiceByLastName() {
 const lastName = prompt_("Photos + Invoice (≤3) (by ClientLastName)", "Enter ClientLastName (case-insensitive exact match):");
 if (!lastName) return;
 runPhotosPlusInvoice_({ mode: "LASTNAME", lastNameQuery: lastName, preview: false });
}

function previewPhotosPlusInvoiceByCompany() {
 const company = prompt_("PREVIEW Photos + Invoice (≤3) (by Company)", "Enter Company (case-insensitive exact match):");
 if (!company) return;
 runPhotosPlusInvoice_({ mode: "COMPANY", companyQuery: company, preview: true });
}

function previewPhotosPlusInvoiceByLastName() {
 const lastName = prompt_("PREVIEW Photos + Invoice (≤3) (by ClientLastName)", "Enter ClientLastName (case-insensitive exact match):");
 if (!lastName) return;
 runPhotosPlusInvoice_({ mode: "LASTNAME", lastNameQuery: lastName, preview: true });
}

// --- Script 3: Invoice Only ---
function sendInvoiceOnlyAll() {
 runInvoiceOnly_({ mode: "ALL", preview: false });
}

function sendInvoiceOnlyByCompany() {
 const company = prompt_("Invoice Only (by Company)", "Enter Company (case-insensitive exact match):");
 if (!company) return;
 runInvoiceOnly_({ mode: "COMPANY", companyQuery: company, preview: false });
}

function sendInvoiceOnlyByLastName() {
 const lastName = prompt_("Send Invoice Only (by ClientLastName, Delivered=Y)", "Enter ClientLastName (case-insensitive exact match):");
 if (!lastName) return;
 runInvoiceOnly_({ mode: "LASTNAME", lastNameQuery: lastName, preview: false });
}


function previewInvoiceOnlyAll() {
 runInvoiceOnly_({ mode: "ALL", preview: true });
}

function previewInvoiceOnlyByCompany() {
 const company = prompt_("PREVIEW Invoice Only (by Company)", "Enter Company (case-insensitive exact match):");
 if (!company) return;
 runInvoiceOnly_({ mode: "COMPANY", companyQuery: company, preview: true });
}

// ===== Core runners =====

function createInvoiceNoEmailByCompany() {
 const company = pickCompanyFromPrompt_("Create Invoice (NO EMAIL) (by Company)");
 if (!company) return;
 runInvoiceOnly_({ mode: "COMPANY", companyQuery: company, preview: false, skipEmail: true });
}

function createInvoiceNoEmailByLastName() {
 const lastName = prompt_("Create Invoice (NO EMAIL) (by ClientLastName)", "Enter ClientLastName (case-insensitive exact match):");
 if (!lastName) return;
 runInvoiceOnly_({ mode: "LASTNAME", lastNameQuery: lastName, preview: false, skipEmail: true });
}

function createInvoicePreviewPdfByCompany() {
 const company = pickCompanyFromPrompt_("Create Invoice PREVIEW PDF (by Company)");
 if (!company) return;
 runInvoicePreviewPdf_({ mode: "COMPANY", companyQuery: company });
}

function createInvoicePreviewPdfByLastName() {
 const lastName = prompt_("Create Invoice PREVIEW PDF (by ClientLastName)", "Enter ClientLastName (case-insensitive exact match):");
 if (!lastName) return;
 runInvoicePreviewPdf_({ mode: "LASTNAME", lastNameQuery: lastName });
}

function pickCompanyFromPrompt_(title) {
 // Keep it simple: plain text prompt (you chose copy/paste)
 return prompt_(title, "Enter Company (case-insensitive exact match):");
}

function runPhotosOnly_(opts) {
 const ctx = getContext_();
 const idx = ctx.idx;
 validateColumns_(ctx.idx, [
 COLS.Company, COLS.ClientLastName, COLS.ClientFirstName, COLS.ClientEmail, COLS.BillingEmail,
 COLS.InvoiceNumber, COLS.InvoiceStatus, COLS.Delivered, COLS.PhotoLink, COLS.VideoLink, COLS.ReelsLink, COLS.ListingAddress
 ]);

 const eligible = filterRows_(ctx, {
 requireDeliveredBlank: true,
 requireDeliveredY: false,
 requireNotInvoiced: true,
 requirePhotoLink: true,
 mode: opts.mode,
 companyQuery: opts.companyQuery,
 lastNameQuery: opts.lastNameQuery,
 });

 if (eligible.length === 0) return alert_("No eligible rows found (Photos Only).");

 const groups = groupItems_(eligible, ctx.idx, opts.mode);

 const summary = summarizeGroupsByAddresses_(groups, ctx.idx);
 if (!confirmAction_(opts.preview ? "PREVIEW Photos Only" : "SEND Photos Only", summary)) return;

 if (opts.preview) return alert_("PREVIEW ONLY (no emails, no changes):\n\n" + summary);

 assertSendAsConfigured_();

 // NOTE: Photos Only has NO invoice attached. Subject requested was "Photos/ Invoice for ...".
 // We'll use "Photos for ..." here to avoid claiming an invoice is attached.
 for (const [groupKey, items] of groups.entries()) {
 const company = String(items[0].row[ctx.idx[COLS.Company]] || "").trim();
 const lastName = String(items[0].row[ctx.idx[COLS.ClientLastName]] || "").trim();
 const toEmail = (opts.mode === "LASTNAME")
 ? pickRecipientByClientEmail_(items, ctx.idx)
 : pickRecipientWithBillingInfo_(items, ctx.idx);
 const subject = `Photos for ${getListingAddresses_(items, ctx.idx)}`;

 const clientName = getClientName_(items, ctx.idx, company, opts.mode);
 const linksText = buildMediaLinksText_(items, ctx.idx);
 const linksHtml = buildMediaLinksHtml_(items, ctx.idx);

 // No payment QRs here unless you want them on Photos Only too.
 const body =
 `Hi ${clientName},\n\n` +
 "Photos are available at the link below. Please let me know if there is anything else I can do for you. " +
 "This link will be valid for 30 days. Please download the files to your personal device for permanent storage.\n\n" +
 (buildMessageBlocksText_(items, ctx.idx) ? (buildMessageBlocksText_(items, ctx.idx) + "\n\n") : "") +
 "Thanks! Ryan\n\n\n" +

 linksText +
 "\n\nThank you!\n\n" +
 "Ryan Owen\n" +
 "240-401-8385\n" +
 "www.ryanowenphotography.com\n\n\n" +
 "*** In order to give every project my full attention, I cannot respond to emails or texts while I am shooting. Thank you for your patience. ***";

 const htmlBody =
 `Hi ${escapeHtml_(clientName)},<br><br>` +
 "Photos are available at the link below. Please let me know if there is anything else I can do for you. " +
 "This link will be valid for 30 days. Please download the files to your personal device fore permanent storage.<br><br>" +
 linksHtml +
 (buildMessageBlocksHtml_(items, ctx.idx) ? (buildMessageBlocksHtml_(items, ctx.idx) + "<br><br>") : "") +
 "Thanks! Ryan<br><br><br>" +

 "Ryan Owen<br>" +
 "240-401-8385<br>" +
 "www.ryanowenphotography.com<br><br><br>" +
 "<b>*** In order to give every project my full attention, I cannot respond to emails or texts while I am shooting. Thank you for your patience. ***</b>";

 GmailApp.sendEmail(toEmail, subject, body, { name: EMAIL_FROM_NAME, htmlBody, bcc: EMAIL_BCC_ADDRESS });


 items.forEach(it => {
 ctx.sheet.getRange(it.sheetRow, ctx.idx[COLS.Delivered] + 1).setValue("Y");
 });
 }

 alert_("Done: Photos sent and Delivered set to Y.");
}

// =============================================================================================
// SECTION 2: PHOTOS + INVOICE (≤ 3 ROWS PER GROUP)
// =============================================================================================


function runPhotosPlusInvoice_(opts) {
 const ctx = getContext_();
 const idx = ctx.idx;
 validateColumns_(ctx.idx, [
 COLS.Company, COLS.ClientLastName, COLS.ClientFirstName, COLS.ClientEmail, COLS.BillingEmail,
 COLS.InvoiceNumber, COLS.InvoiceStatus, COLS.Delivered, COLS.PhotoLink, COLS.VideoLink, COLS.ReelsLink,
 COLS.EstTotal, COLS.Total, COLS.Deposit, COLS.InvoicedAt, COLS.InvoicePDFUrl,
 COLS.ListingAddress, COLS.Bedrooms, COLS.Service, COLS.City, COLS.EstLineItems
 ]);

 const eligible = filterRows_(ctx, {
 requireDeliveredBlank: true,
 requireDeliveredY: false,
 requireNotInvoiced: true,
 requirePhotoLink: true,
 mode: opts.mode,
 companyQuery: opts.companyQuery,
 lastNameQuery: opts.lastNameQuery,
 });

 if (eligible.length === 0) return alert_("No eligible rows found (Photos + Invoice).");

 const groups = groupItems_(eligible, ctx.idx, opts.mode);

 if (opts.mode === "COMPANY") {
 const tooBig = [];
 for (const [groupKey, items] of groups.entries()) {
 const company = String(items[0].row[ctx.idx[COLS.Company]] || "").trim();
 const lastName = String(items[0].row[ctx.idx[COLS.ClientLastName]] || "").trim();
 if (items.length > 3) tooBig.push(`${company} (${items.length} rows)`);
 }
 if (tooBig.length) {
 return alert_(
 "Refusing to run Photos + Invoice because these groups exceed 3 rows:\n\n" +
 tooBig.join("\n") +
 "\n\nUse 'Invoice Only' for those."
 );
 }
 }

 const summary = summarizeGroupsByAddresses_(groups, ctx.idx);
 if (!confirmAction_(opts.preview ? "PREVIEW Photos + Invoice (≤3)" : "SEND Photos + Invoice (≤3)", summary)) return;

 if (opts.preview) return alert_("PREVIEW ONLY (no emails, no changes):\n\n" + summary);

 assertSendAsConfigured_();

 const templateId = findDocByName_(DOC_TEMPLATE_NAME);
 const folderId = findFolderByName_(INVOICE_FOLDER_NAME);
 const invSheet = getOrCreateInvoicesSheet_();
 const invIndex = buildInvoicesIndexByNumber_(invSheet);

 const nextInvoiceCell = ctx.settings.getRange("B1");
 let nextInv = String(nextInvoiceCell.getValue()).trim();
 if (!nextInv) throw new Error("SETTINGS!B1 NextInvoiceNumber is blank.");

 const now = new Date();

 // Load QR blobs once per run
 const zelleBlob = getDriveImageBlobByName_(ZELLE_QR_FILENAME).setName("zelleqr.jpg");
 const venmoBlob = getDriveImageBlobByName_(VENMO_QR_FILENAME).setName("venmoqr.jpg");

 for (const [groupKey, items] of groups.entries()) {
 const company = String(items[0].row[ctx.idx[COLS.Company]] || "").trim();
 const lastName = String(items[0].row[ctx.idx[COLS.ClientLastName]] || "").trim();
 const invoiceNumber = nextInv;
 nextInv = incrementInvoiceNumber_(nextInv);

 const subtotal = sumMoney_(items.map(it => it.row[ctx.idx[COLS.Total]]));
 const deposit = sumMoney_(items.map(it => it.row[ctx.idx[COLS.Deposit]]));
 const amountDue = round2_(subtotal - deposit);
 const dateDue = addDays_(now, 14);


 const toEmail = (opts.mode === "LASTNAME")
 ? pickRecipientByClientEmail_(items, ctx.idx)
 : pickRecipientWithBillingInfo_(items, ctx.idx);

 const nameLabel = (opts.mode === "LASTNAME")
 ? String(items[0].row[ctx.idx[COLS.ClientLastName]] || "").trim() || company
 : company;

 const pdfFile = createInvoicePdf_(templateId, folderId, invoiceNumber, company, items, ctx.idx, now, {
 nameLabel: nameLabel,
 recipientEmail: toEmail,
 });

 let invFirstName = "";
 let invLastName = "";

 if (opts.mode === "COMPANY") {
 const billingName = getBillingContactNameForCompany_(company);
 const parts = billingName.split(" ");
 invFirstName = parts.slice(0, -1).join(" ") || billingName;
 invLastName = parts.slice(-1).join("");
 } else {
 invFirstName = String(items[0].row[ctx.idx[COLS.ClientFirstName]] || "").trim();
 invLastName = String(items[0].row[ctx.idx[COLS.ClientLastName]] || "").trim();
 }

 upsertInvoiceRow_(invSheet, invIndex, {
 invoiceNumber: invoiceNumber,
 invoicedAt: now,
 status: "SENT",
 lastName: invLastName,
 firstName: invFirstName,
 toEmail: toEmail,
 company: company,
 total: subtotal,
 pdfUrl: pdfFile.getUrl(),
 amountDue: amountDue,
 dateDue: dateDue
 });

 const subject = `Photos/ Invoice for ${getListingAddresses_(items, ctx.idx)}`;

 const clientName = getClientName_(items, ctx.idx, company, opts.mode);
 const linksText = buildMediaLinksText_(items, ctx.idx);
 const linksHtml = buildMediaLinksHtml_(items, ctx.idx);

 const msgText = buildMessageBlocksText_(items, ctx.idx);
 const msgHtml = buildMessageBlocksHtml_(items, ctx.idx);

 const body = buildPhotoInvoiceEmailText_(clientName, amountDue, linksText).replace(
 "Thanks! Ryan\n\n",
 (msgText ? (msgText + "\n\n") : "") + "Thanks! Ryan\n\n"
 );

 const htmlBody = buildPhotoInvoiceEmailHtml_(clientName, amountDue, linksHtml).replace(
 "Thanks! Ryan<br><br>",
 (msgHtml ? (msgHtml + "<br><br>") : "") + "Thanks! Ryan<br><br>"
 );

 GmailApp.sendEmail(toEmail, subject, body, {
 name: EMAIL_FROM_NAME,
 attachments: [pdfFile.getBlob()],
 htmlBody: htmlBody,
 inlineImages: { zelleqr: zelleBlob, venmoqr: venmoBlob },
 bcc: EMAIL_BCC_ADDRESS,
 });


 items.forEach(it => {
 const r = it.sheetRow;
 ctx.sheet.getRange(r, ctx.idx[COLS.Delivered] + 1).setValue("Y");
 ctx.sheet.getRange(r, ctx.idx[COLS.InvoiceNumber] + 1).setValue(invoiceNumber);
 ctx.sheet.getRange(r, ctx.idx[COLS.InvoicedAt] + 1).setValue(now);
 ctx.sheet.getRange(r, ctx.idx[COLS.InvoicePDFUrl] + 1).setValue(pdfFile.getUrl());
 });
 }

 nextInvoiceCell.setValue(nextInv);
 alert_("Done: Photos + Invoice sent (≤3 rows per group). NextInvoiceNumber updated.");
}


// --- Script 4: LOCKED Photos + Invoice (<=3 rows) ---
function sendLockedPhotosPlusInvoiceByCompany() {
 const company = prompt_("LOCKED Photos + Invoice (≤3) (by Company)", "Enter Company (case-insensitive exact match):");
 if (!company) return;
 runLockedPhotosPlusInvoice_({ mode: "COMPANY", companyQuery: company, preview: false });
}

function sendLockedPhotosPlusInvoiceByLastName() {
 const lastName = prompt_("LOCKED Photos + Invoice (≤3) (by ClientLastName)", "Enter ClientLastName (case-insensitive exact match):");
 if (!lastName) return;
 runLockedPhotosPlusInvoice_({ mode: "LASTNAME", lastNameQuery: lastName, preview: false });
}

// --- Script 5: THANK YOU (Download Link) ---
function sendThankYouDownloadLinkByCompany() {
 const company = prompt_("THANK YOU (Download Link) (by Company)", "Enter Company (case-insensitive exact match):");
 if (!company) return;
 runThankYouDownloadLink_({ mode: "COMPANY", companyQuery: company, preview: false });
}

function sendThankYouDownloadLinkByLastName() {
 const lastName = prompt_("THANK YOU (Download Link) (by ClientLastName)", "Enter ClientLastName (case-insensitive exact match):");
 if (!lastName) return;
 runThankYouDownloadLink_({ mode: "LASTNAME", lastNameQuery: lastName, preview: false });
}


// =============================================================================================
// SECTION 3: LOCKED PHOTOS + INVOICE (≤ 3 ROWS PER GROUP) — REVIEW LINK WORKFLOW
// =============================================================================================


function runLockedPhotosPlusInvoice_(opts) {
 const ctx = getContext_();
 const idx = ctx.idx;
 validateColumns_(ctx.idx, [
 COLS.Company, COLS.ClientLastName, COLS.ClientFirstName, COLS.ClientEmail, COLS.BillingEmail,
 COLS.InvoiceNumber, COLS.InvoiceStatus, COLS.Delivered,
 COLS.LockedLink, COLS.ListingAddress,
 COLS.EstTotal, COLS.Total, COLS.Deposit, COLS.InvoicedAt, COLS.InvoicePDFUrl,
 COLS.Bedrooms, COLS.Service, COLS.City, COLS.EstLineItems
 ]);

 const companyNeedle = (opts.companyQuery || "").trim().toLowerCase();
 const lastNameNeedle = (opts.lastNameQuery || "").trim().toLowerCase();

 const eligible = ctx.rows.filter(it => {
 const row = it.row;

 const company = String(row[ctx.idx[COLS.Company]] || "").trim();
 if (!company) return false;

 const invoiceNum = String(row[ctx.idx[COLS.InvoiceNumber]] || "").trim();
 const invStatus = String(row[ctx.idx[COLS.InvoiceStatus]] || "").trim();
 const delivered = String(row[ctx.idx[COLS.Delivered]] || "").trim().toUpperCase();
 const locked = String(row[ctx.idx[COLS.LockedLink]] || "").trim();
 const lastName = String(row[ctx.idx[COLS.ClientLastName]] || "").trim();

 // Locked workflow: must NOT be invoiced, must be NOT delivered yet, must have LockedLink
 if (invoiceNum) return false;
 if (invStatus) return false;
 if (delivered) return false;
 if (!locked) return false;

 if (opts.mode === "COMPANY") {
 if (company.toLowerCase() !== companyNeedle) return false;
 } else if (opts.mode === "LASTNAME") {
 if (lastName.toLowerCase() !== lastNameNeedle) return false;
 }

 return true;
 }).map(it => ({
 ...it,
 company: String(it.row[ctx.idx[COLS.Company]] || "").trim(),
 }));

 if (eligible.length === 0) return alert_("No eligible rows found (LOCKED Photos + Invoice).");

 const groups = groupItems_(eligible, ctx.idx, opts.mode);

 // Enforce <=3 rows per company group
 if (opts.mode === "COMPANY") {
 const tooBig = [];
 for (const [groupKey, items] of groups.entries()) {
 const company = String(items[0].row[ctx.idx[COLS.Company]] || "").trim();
 if (items.length > 3) tooBig.push(`${company} (${items.length} rows)`);
 }
 if (tooBig.length) {
 return alert_(
 "Refusing to run LOCKED Photos + Invoice because these groups exceed 3 rows:\n\n" +
 tooBig.join("\n") +
 "\n\nUse 'Invoice Only' for those."
 );
 }
 }
 const summary = summarizeGroupsByAddresses_(groups, ctx.idx);
 if (!confirmAction_("SEND LOCKED Photos + Invoice (≤3)", summary)) return;

 assertSendAsConfigured_();

 const templateId = findDocByName_(DOC_TEMPLATE_NAME);
 const folderId = findFolderByName_(INVOICE_FOLDER_NAME);
 const invSheet = getOrCreateInvoicesSheet_();
 const invIndex = buildInvoicesIndexByNumber_(invSheet);


 const nextInvoiceCell = ctx.settings.getRange("B1");
 let nextInv = String(nextInvoiceCell.getValue()).trim();
 if (!nextInv) throw new Error("SETTINGS!B1 NextInvoiceNumber is blank.");

 const now = new Date();

 const zelleBlob = getDriveImageBlobByName_(ZELLE_QR_FILENAME).setName("zelleqr.jpg");
 const venmoBlob = getDriveImageBlobByName_(VENMO_QR_FILENAME).setName("venmoqr.jpg");

 for (const [groupKey, items] of groups.entries()) {
 const company = String(items[0].row[ctx.idx[COLS.Company]] || "").trim();
 const lastName = String(items[0].row[ctx.idx[COLS.ClientLastName]] || "").trim();
 const invoiceNumber = nextInv;
 nextInv = incrementInvoiceNumber_(nextInv);

 const subtotal = sumMoney_(items.map(it => it.row[ctx.idx[COLS.Total]]));
 const deposit = sumMoney_(items.map(it => it.row[ctx.idx[COLS.Deposit]]));
 const amountDue = round2_(subtotal - deposit);
 const dateDue = addDays_(now, 14);

 const nameLabel = (opts.mode === "LASTNAME")
 ? (lastName || company)
 : company;

 const toEmail = (opts.mode === "LASTNAME")
 ? pickRecipientByClientEmail_(items, ctx.idx)
 : pickRecipientWithBillingInfo_(items, ctx.idx);

 const pdfFile = createInvoicePdf_(templateId, folderId, invoiceNumber, company, items, ctx.idx, now, {
 nameLabel: nameLabel,
 recipientEmail: toEmail,
 });

 let invFirstName = "";
 let invLastName = "";

 if (opts.mode === "COMPANY") {
 const billingName = getBillingContactNameForCompany_(company);
 const parts = billingName.split(" ");
 invFirstName = parts.slice(0, -1).join(" ") || billingName;
 invLastName = parts.slice(-1).join("");
 } else {
 invFirstName = String(items[0].row[ctx.idx[COLS.ClientFirstName]] || "").trim();
 invLastName = String(items[0].row[ctx.idx[COLS.ClientLastName]] || "").trim();
 }

 upsertInvoiceRow_(invSheet, invIndex, {
 invoiceNumber: invoiceNumber,
 invoicedAt: now,
 status: "SENT",
 lastName: invLastName,
 firstName: invFirstName,
 toEmail: toEmail,
 company: company,
 total: subtotal,
 pdfUrl: pdfFile.getUrl(),
 amountDue: amountDue,
 dateDue: dateDue
 });

 const subject = `Photo Link/Invoice for ${getListingAddresses_(items, ctx.idx)}`;

 const clientName = getClientName_(items, ctx.idx, company, opts.mode);
 const lockedLinksText = items.map(it => {
 const addr = String(it.row[ctx.idx[COLS.ListingAddress]] || "").trim() || "(No address)";
 const link = String(it.row[ctx.idx[COLS.LockedLink]] || "").trim();
 return `${addr} Photo Link (Review):\n${link || "(No locked link)"}\n`;
 }).join("\n");

 const lockedLinksHtml = items.map(it => {
 const addr = String(it.row[ctx.idx[COLS.ListingAddress]] || "").trim() || "(No address)";
 const link = String(it.row[ctx.idx[COLS.LockedLink]] || "").trim();
 return `<b>${escapeHtml_(addr)} Photo Link (Review):</b><br>${linkOrTextHtml_(link)}<br><br>`;
 }).join("");

 const body =
 `Hi ${clientName},\n\n\n` +
 "Your photos are available for review at the link below. An invoice in the " +
 `amount of ${money_(amountDue)} is attached to this email. Payment can be made ` +
 "via Zelle or Venmo through the links found below. Upon payment, you will receive a new link to download your photos." +
 "Please let us know if we can be of any further assistance!\n\n\n" +
 (buildMessageBlocksText_(items, ctx.idx) ? (buildMessageBlocksText_(items, ctx.idx) + "\n\n") : "") +
 "Thanks! Ryan\n\n\n" +

 lockedLinksText +
 buildSignatureText_();

 const htmlBody =
 `Hi ${escapeHtml_(clientName)},<br><br><br>` +
 "Photos are available for review at the link below. Invoice is attached. " +
 `The total due came to <b>${money_(amountDue)}</b> and can be paid via the links at the bottom. ` +
 "A new link for downloads will be sent out upon payment. Please let me know if there is anything else I can do for you.<br><br><br>" +
 (buildMessageBlocksHtml_(items, ctx.idx) ? (buildMessageBlocksHtml_(items, ctx.idx) + "<br><br>") : "") +
 "Thanks! Ryan<br><br><br>" +

 lockedLinksHtml +
 "<br><br>" +
 `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>` +
 `<td style="padding-right:24px;"><img src="cid:zelleqr" style="width:220px;height:220px;" alt="Zelle QR"></td>` +
 `<td><img src="cid:venmoqr" style="width:220px;height:220px;" alt="Venmo QR"></td>` +
 `</tr></table>` +
 buildSignatureHtml_();

 GmailApp.sendEmail(toEmail, subject, body, {
 name: EMAIL_FROM_NAME,
 attachments: [pdfFile.getBlob()],
 htmlBody: htmlBody,
 inlineImages: { zelleqr: zelleBlob, venmoqr: venmoBlob },
 bcc: EMAIL_BCC_ADDRESS,
 });

 // Mark Delivered=Y + invoice fields
 items.forEach(it => {
 const r = it.sheetRow;
 ctx.sheet.getRange(r, ctx.idx[COLS.Delivered] + 1).setValue("Y");
 ctx.sheet.getRange(r, ctx.idx[COLS.InvoiceNumber] + 1).setValue(invoiceNumber);
 ctx.sheet.getRange(r, ctx.idx[COLS.InvoicedAt] + 1).setValue(now);
 ctx.sheet.getRange(r, ctx.idx[COLS.InvoicePDFUrl] + 1).setValue(pdfFile.getUrl());
 });
 }

 nextInvoiceCell.setValue(nextInv);
 alert_("Done: LOCKED Photos + Invoice sent (≤3 rows per group). NextInvoiceNumber updated.");
}


// =============================================================================================
// SECTION 4: THANK YOU (DOWNLOAD LINK) — PAID ONLY, RECENT ONLY
// =============================================================================================

function runThankYouDownloadLink_(opts) {
 const ctx = getContext_();
 const idx = ctx.idx;
 validateColumns_(ctx.idx, [
 COLS.Company, COLS.ClientLastName, COLS.ClientFirstName, COLS.ClientEmail, COLS.BillingEmail,
 COLS.Delivered, COLS.PhotoLink, COLS.VideoLink, COLS.ReelsLink, COLS.ListingAddress,
 COLS.InvoiceStatus, COLS.InvoicedAt
 ]);

 const companyNeedle = (opts.companyQuery || "").trim().toLowerCase();
 const lastNameNeedle = (opts.lastNameQuery || "").trim().toLowerCase();
 const now = new Date();
 const RECENT_DAYS = 14; // <-- change this to whatever you want
 const recentMs = RECENT_DAYS * 24 * 60 * 60 * 1000;


 const eligible = ctx.rows.filter(it => {
 const row = it.row;

 const company = String(row[ctx.idx[COLS.Company]] || "").trim();
 if (!company) return false;

 const delivered = String(row[ctx.idx[COLS.Delivered]] || "").trim().toUpperCase();
 const photoLink = String(row[ctx.idx[COLS.PhotoLink]] || "").trim();
 const lastName = String(row[ctx.idx[COLS.ClientLastName]] || "").trim();
 const invStatus = String(row[ctx.idx[COLS.InvoiceStatus]] || "").trim().toUpperCase();
 const invoicedAt = row[ctx.idx[COLS.InvoicedAt]];


 // Thank you email: only send for Delivered=Y and PhotoLink present
 if (delivered !== "Y") return false;
 if (!photoLink) return false;

 // Only send Thank You for PAID invoices
 if (invStatus !== "PAID") return false;
 if (!(invoicedAt instanceof Date)) return false;
 if (now.getTime() - invoicedAt.getTime() > recentMs) return false;


 if (opts.mode === "COMPANY") {
 if (company.toLowerCase() !== companyNeedle) return false;
 } else if (opts.mode === "LASTNAME") {
 if (lastName.toLowerCase() !== lastNameNeedle) return false;
 }


 return true;
 }).map(it => ({
 ...it,
 company: String(it.row[ctx.idx[COLS.Company]] || "").trim(),
 }));

 if (eligible.length === 0) return alert_("No eligible rows found (THANK YOU Download Link).");

 const groups = groupItems_(eligible, ctx.idx, opts.mode);
 const summary = summarizeGroupsByAddresses_(groups, ctx.idx);
 if (!confirmAction_("SEND THANK YOU (Download Link)", summary)) return;

 assertSendAsConfigured_();

 for (const [groupKey, items] of groups.entries()) {
 const company = String(items[0].row[ctx.idx[COLS.Company]] || "").trim();
 const lastName = String(items[0].row[ctx.idx[COLS.ClientLastName]] || "").trim();
 const toEmail = (opts.mode === "LASTNAME")
 ? pickRecipientByClientEmail_(items, ctx.idx)
 : pickRecipientWithBillingInfo_(items, ctx.idx);

 const subject = `Download Link for ${getListingAddresses_(items, ctx.idx)}`;

 const clientName = getClientName_(items, ctx.idx, company, opts.mode);

 const linksText = buildMediaLinksText_(items, ctx.idx);
 const linksHtml = buildMediaLinksHtml_(items, ctx.idx);

 const body =
 `Hi ${clientName}\n\n` +
 "Thank you for your payment! A link for downloads is below. This link will be valid for 30 days. " +
 "Please download all files to your personal device for permanent storage. Best of luck with your listing!\n\n" +
 "Thanks again! Ryan\n\n" +
 linksText;

 const htmlBody =
 `Hi ${escapeHtml_(clientName)}<br><br>` +
 "Thank you for your payment! A link for downloads is below. This link will be valid for 30 days. " +
 "Please download all files to your personal device for permanent storage. Best of luck with your listing!<br><br>" +
 "Thanks again! Ryan<br><br>" +
 linksHtml;

 GmailApp.sendEmail(toEmail, subject, body, {
 name: EMAIL_FROM_NAME,
 htmlBody: htmlBody,
 bcc: EMAIL_BCC_ADDRESS,
 });
 }

 alert_("Done: THANK YOU (Download Link) email(s) sent.");
}


// =============================================================================================
// SECTION 5: INVOICE ONLY (DELIVERED = Y, NOT INVOICED YET)
// =============================================================================================

function runInvoiceOnly_(opts) {
 const ctx = getContext_();
 const idx = ctx.idx;
 validateColumns_(ctx.idx, [
 COLS.Company, COLS.ClientFirstName, COLS.ClientLastName, COLS.ClientEmail, COLS.BillingEmail,
 COLS.InvoiceNumber, COLS.InvoiceStatus, COLS.Delivered,
 COLS.ManualInvoice,
 COLS.EstTotal, COLS.Total, COLS.Deposit, COLS.InvoicedAt, COLS.InvoicePDFUrl,
 COLS.ListingAddress, COLS.Bedrooms, COLS.Service, COLS.City, COLS.EstLineItems
 ]);

 const eligible = filterRows_(ctx, {
 requireDeliveredBlank: false,
 requireDeliveredY: true,
 requireNotInvoiced: true,
 requirePhotoLink: false,
 allowManualOverride: true,
 mode: opts.mode,
 companyQuery: opts.companyQuery,
 lastNameQuery: opts.lastNameQuery,
 });

 if (eligible.length === 0) return alert_("No eligible rows found (Invoice Only).");

 const groups = groupItems_(eligible, ctx.idx, opts.mode);
 const summary = (opts.mode === "LASTNAME")
 ? summarizeGroupsByAddresses_(groups, ctx.idx)
 : summarizeGroups_(groups, ctx.idx);

 if (!confirmAction_(opts.preview ? "PREVIEW Invoice Only" : "SEND Invoice Only", summary)) return;

 if (opts.preview) return alert_("PREVIEW ONLY (no emails, no changes):\n\n" + summary);
 const skipEmail = opts && opts.skipEmail === true;

 assertSendAsConfigured_();

 const templateId = findDocByName_(DOC_TEMPLATE_NAME);
 const folderId = findFolderByName_(INVOICE_FOLDER_NAME);
 const invSheet = getOrCreateInvoicesSheet_();
 const invIndex = buildInvoicesIndexByNumber_(invSheet);

 const nextInvoiceCell = ctx.settings.getRange("B1");
 let nextInv = String(nextInvoiceCell.getValue()).trim();
 if (!nextInv) throw new Error("SETTINGS!B1 NextInvoiceNumber is blank.");

 const now = new Date();

 // Load QR blobs once per run
 const zelleBlob = getDriveImageBlobByName_(ZELLE_QR_FILENAME).setName("zelleqr.jpg");
 const venmoBlob = getDriveImageBlobByName_(VENMO_QR_FILENAME).setName("venmoqr.jpg");

 for (const [groupKey, items] of groups.entries()) {
 const company = String(items[0].row[ctx.idx[COLS.Company]] || "").trim();
 const lastName = String(items[0].row[ctx.idx[COLS.ClientLastName]] || "").trim();
 const invoiceNumber = nextInv;
 nextInv = incrementInvoiceNumber_(nextInv);

 const subtotal = sumMoney_(items.map(it => it.row[idx[COLS.Total]]));
 const deposit = sumMoney_(items.map(it => it.row[ctx.idx[COLS.Deposit]]));
 const amountDue = round2_(subtotal - deposit);
 const dateDue = addDays_(now, 14);

 const toEmail = (opts.mode === "LASTNAME")
 ? pickRecipientByClientEmail_(items, ctx.idx)
 : pickRecipientWithBillingInfo_(items, ctx.idx);

 const nameLabel = (opts.mode === "LASTNAME")
 ? (String(items[0].row[ctx.idx[COLS.ClientLastName]] || "").trim() || company)
 : company;

 const pdfFile = createInvoicePdf_(templateId, folderId, invoiceNumber, company, items, ctx.idx, now, {
 nameLabel: nameLabel,
 recipientEmail: toEmail,
 });

 let invFirstName = "";
 let invLastName = "";

 if (opts.mode === "COMPANY") {
 const billingName = getBillingContactNameForCompany_(company);
 const parts = billingName.split(" ");
 invFirstName = parts.slice(0, -1).join(" ") || billingName;
 invLastName = parts.slice(-1).join("");
 } else {
 invFirstName = String(items[0].row[ctx.idx[COLS.ClientFirstName]] || "").trim();
 invLastName = String(items[0].row[ctx.idx[COLS.ClientLastName]] || "").trim();
 }

 upsertInvoiceRow_(invSheet, invIndex, {
 invoiceNumber: invoiceNumber,
 invoicedAt: now,
 status: "SENT",
 lastName: invLastName,
 firstName: invFirstName,
 toEmail: toEmail,
 company: company,
 total: subtotal,
 pdfUrl: pdfFile.getUrl(),
 amountDue: amountDue,
 dateDue: dateDue
 });


 const subject = `Photography Invoice ${invoiceNumber}`;

 const clientName = getClientName_(items, ctx.idx, company, opts.mode);

 const msgText = buildMessageBlocksText_(items, ctx.idx);
 const msgHtml = buildMessageBlocksHtml_(items, ctx.idx);

 const body = buildInvoiceOnlyEmailText_(clientName, invoiceNumber, amountDue).replace(
 "Thanks! Ryan\n",
 (msgText ? (msgText + "\n\n") : "") + "Thanks! Ryan\n"
 );

 const htmlBody = buildInvoiceOnlyEmailHtml_(clientName, invoiceNumber, amountDue).replace(
 "Thanks! Ryan<br>",
 (msgHtml ? (msgHtml + "<br><br>") : "") + "Thanks! Ryan<br>"
 );


 if (!skipEmail) {
 GmailApp.sendEmail(toEmail, subject, body, {
 name: EMAIL_FROM_NAME,
 attachments: [pdfFile.getBlob()],
 htmlBody: htmlBody,
 inlineImages: { zelleqr: zelleBlob, venmoqr: venmoBlob },
 bcc: EMAIL_BCC_ADDRESS,
 });
 }

 items.forEach(it => {
 const r = it.sheetRow;
 ctx.sheet.getRange(r, ctx.idx[COLS.InvoiceNumber] + 1).setValue(invoiceNumber);
 ctx.sheet.getRange(r, ctx.idx[COLS.InvoicedAt] + 1).setValue(now);
 ctx.sheet.getRange(r, ctx.idx[COLS.InvoicePDFUrl] + 1).setValue(pdfFile.getUrl());
 ctx.sheet.getRange(r, ctx.idx[COLS.ManualInvoice] + 1).setValue("");
 });
 }

 nextInvoiceCell.setValue(nextInv);
 alert_("Done: Invoice(s) sent. NextInvoiceNumber updated.");
}

// ===== Helpers =====

function getOrCreateInvoicesSheet_() {
 const ss = SpreadsheetApp.getActiveSpreadsheet();
 let sh = ss.getSheetByName(INVOICES_SHEET_NAME);
 if (!sh) sh = ss.insertSheet(INVOICES_SHEET_NAME);

 // If sheet is empty, just write headers
 if (sh.getLastRow() < 1) {
 sh.getRange(1, 1, 1, INVOICE_HEADERS.length).setValues([INVOICE_HEADERS]);
 sh.setFrozenRows(1);
 return sh;
 }

 // Read existing headers (row 1)
 const lastCol = Math.max(sh.getLastColumn(), 1);
 const existing = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h || "").trim());

 // Ensure each required header exists; append missing ones to the right (NO CLEAR)
 let writeNeeded = false;
 const headerSet = new Set(existing.filter(Boolean));

 INVOICE_HEADERS.forEach(h => {
 if (!headerSet.has(h)) {
 existing.push(h);
 headerSet.add(h);
 writeNeeded = true;
 }
 });

 if (writeNeeded) {
 sh.getRange(1, 1, 1, existing.length).setValues([existing]);
 }

 sh.setFrozenRows(1);
 return sh;
}


function buildInvoicesIndexByNumber_(invSheet) {
 const values = invSheet.getDataRange().getValues();
 if (values.length < 2) return new Map();
 const headers = values[0].map(h => String(h).trim());
 const colInvoice = headers.indexOf("InvoiceNumber");
 if (colInvoice === -1) throw new Error("INVOICES missing InvoiceNumber header.");

 const map = new Map(); // invoiceNumber -> sheetRow
 for (let r = 1; r < values.length; r++) {
 const inv = String(values[r][colInvoice] || "").trim();
 if (inv) map.set(inv, r + 1); // sheet row number
 }
 return map;
}

function upsertInvoiceRow_(invSheet, invIndex, data) {
 // data: {invoiceNumber, invoicedAt, status, lastName, firstName, company, total, pdfUrl, amountDue, dateDue}
 const row = [
 data.invoiceNumber,
 data.invoicedAt,
 data.status,
 data.lastName,
 data.firstName,
 data.toEmail, // InvoiceToEmail
 data.company,
 data.total,
 data.pdfUrl,
 data.amountDue, // AmountDue
 data.dateDue, // DateDue
 "", // SecondAttempt
 "" // ThirdAttempt
 ];

 const existingRow = invIndex.get(data.invoiceNumber);
 if (existingRow) {
 invSheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
 } else {
 invSheet.appendRow(row);
 invIndex.set(data.invoiceNumber, invSheet.getLastRow());
 }
}

function setFormRowsInvoiceStatus_(invoiceNumber, newStatus) {
 const ctx = getContext_();
 const idx = ctx.idx;

 const invNeedle = String(invoiceNumber || "").trim();
 if (!invNeedle) return;

 const status = String(newStatus || "").trim().toUpperCase();
 if (!status) return;

 const matches = ctx.rows.filter(it => {
 const inv = String(it.row[idx[COLS.InvoiceNumber]] || "").trim();
 return inv === invNeedle;
 });

 if (!matches.length) return;

 matches.forEach(it => {
 ctx.sheet.getRange(it.sheetRow, idx[COLS.InvoiceStatus] + 1).setValue(status);
 });
}

function getContext_() {
 const ss = SpreadsheetApp.getActiveSpreadsheet();
 const sheet = SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getActiveSheet();
 if (!sheet) throw new Error("Orders sheet not found.");

 const settings = ss.getSheetByName(SETTINGS_SHEET_NAME);
 if (!settings) throw new Error(`Missing sheet: ${SETTINGS_SHEET_NAME}`);

 const values = sheet.getDataRange().getValues();
 if (values.length < 2) throw new Error("Sheet has no data rows.");

 const headers = values[0].map(h => String(h).trim());
 const idx = buildHeaderIndex_(headers);

 const rows = [];
 for (let r = 1; r < values.length; r++) {
 rows.push({
 sheetRow: r + 1,
 row: values[r],
 });
 }

 return { ss, sheet, settings, idx, rows };
}

function filterRows_(ctx, rules) {
 const companyNeedle = (rules.companyQuery || "").trim().toLowerCase();
 const lastNameNeedle = (rules.lastNameQuery || "").trim().toLowerCase();

 return ctx.rows.filter(it => {
 const row = it.row;

 const company = String(row[ctx.idx[COLS.Company]] || "").trim();
 if (!company) return false;

 const invoiceNum = String(row[ctx.idx[COLS.InvoiceNumber]] || "").trim();
 const invStatus = String(row[ctx.idx[COLS.InvoiceStatus]] || "").trim();
 const delivered = String(row[ctx.idx[COLS.Delivered]] || "").trim().toUpperCase();
 const photoLink = String(row[ctx.idx[COLS.PhotoLink]] || "").trim();
 const lastName = String(row[ctx.idx[COLS.ClientLastName]] || "").trim();
 const manual = String(row[ctx.idx[COLS.ManualInvoice]] || "").trim().toUpperCase() === "Y";

 if (rules.requireNotInvoiced) {
 if (invoiceNum) return false;
 if (invStatus) return false;
 }

 if (rules.requireDeliveredBlank && delivered && !(rules.allowManualOverride && manual)) return false;
 if (rules.requireDeliveredY && delivered !== "Y" && !(rules.allowManualOverride && manual)) return false;

 if (rules.requirePhotoLink && !photoLink) return false;

 if (rules.mode === "COMPANY") {
 if (company.toLowerCase() !== companyNeedle) return false;
 } else if (rules.mode === "LASTNAME") {
 if (lastName.toLowerCase() !== lastNameNeedle) return false;
 }

 return true;
 }).map(it => ({
 ...it,
 company: String(it.row[ctx.idx[COLS.Company]] || "").trim(),
 }));
}

function groupByCompany_(items) {
 const m = new Map();
 items.forEach(it => {
 const key = it.company;
 if (!m.has(key)) m.set(key, []);
 m.get(key).push(it);
 });
 return m;
}

function groupItems_(items, idx, mode) {
 if (mode === "LASTNAME") {
 // Prefer Customer ID grouping when present + populated.
 const hasCustomerIdCol = idx[COLS.CustomerId] !== undefined;

 const m = new Map();
 items.forEach(it => {
 let key = "";

 if (hasCustomerIdCol) {
 const cid = String(it.row[idx[COLS.CustomerId]] || "").trim();
 if (cid) key = `cid:${cid}`;
 }

 // Fallback to last name (current behavior) if Customer ID missing/blank
 if (!key) {
 const ln = String(it.row[idx[COLS.ClientLastName]] || "").trim();
 key = ln ? `ln:${ln.toLowerCase()}` : "(no last name)";
 }

 if (!m.has(key)) m.set(key, []);
 m.get(key).push(it);
 });

 return m;
 }

 // default: group by Company
 return groupByCompany_(items);
}



function summarizeGroups_(groups, idx) {
 const lines = [];
 for (const [, items] of groups.entries()) {
 const company = String(items[0].row[idx[COLS.Company]] || "").trim() || "(No company)";
 lines.push(`${company}: ${items.length} row(s)`);
 }
 return lines.join("\n");
}


function summarizeGroupsByAddresses_(groups, idx) {
 const lines = [];
 for (const [, items] of groups.entries()) {
 const addrs = getListingAddresses_(items, idx);
 lines.push(`${addrs}: ${items.length} row(s)`);
 }
 return lines.join("\n");
}

function getClientName_(items, idx, companyFallback, mode) {
 // For LASTNAME workflows, NEVER use CO_BILLING_INFO
 if (mode === "LASTNAME") {
 const first = String(items[0].row[idx[COLS.ClientFirstName]] || "").trim();
 const last = String(items[0].row[idx[COLS.ClientLastName]] || "").trim();
 const name = `${first} ${last}`.trim();
 return name || last || companyFallback || "there";
 }

 // Company workflows: prefer BillingContactName from CO_BILLING_INFO
 const company = String(items[0].row[idx[COLS.Company]] || "").trim().toLowerCase();
 const billingMap = getBillingMap_();
 const hit = billingMap.get(company);
 const billingContact = hit ? String(hit.billingContact || "").trim() : "";
 if (billingContact) return billingContact;

 // Fallback to client first/last from the row
 const first = String(items[0].row[idx[COLS.ClientFirstName]] || "").trim();
 const last = String(items[0].row[idx[COLS.ClientLastName]] || "").trim();
 const name = `${first} ${last}`.trim();
 return name || companyFallback || "there";
}


function getListingAddresses_(items, idx) {
 const addrs = [];
 const seen = new Set();
 items.forEach(it => {
 const a = String(it.row[idx[COLS.ListingAddress]] || "").trim();
 if (a && !seen.has(a.toLowerCase())) {
 seen.add(a.toLowerCase());
 addrs.push(a);
 }
 });
 return addrs.length ? addrs.join(", ") : "Listing";
}

function buildMessageBlocksText_(items, idx) {
 const col = idx[COLS.Message];
 if (col === undefined) return "";

 const parts = [];
 items.forEach(it => {
 const msg = String(it.row[col] || "").trim();
 if (!msg) return;
 parts.push(msg);
 });

 if (!parts.length) return "";
 return parts.join("\n\n");
}


function buildMessageBlocksHtml_(items, idx) {
 const col = idx[COLS.Message];
 if (col === undefined) return "";

 const parts = [];
 items.forEach(it => {
 const msg = String(it.row[col] || "").trim();
 if (!msg) return;
 parts.push(escapeHtml_(msg).replace(/\n/g, "<br>"));
 });

 if (!parts.length) return "";
 return parts.join("<br><br>");
}


function buildMediaLinksText_(items, idx) {
 const blocks = items.map(it => {
 const addr = String(it.row[idx[COLS.ListingAddress]] || "").trim() || "(No address)";
 const photo = String(it.row[idx[COLS.PhotoLink]] || "").trim();
 const video = String(it.row[idx[COLS.VideoLink]] || "").trim();
 const reels = String(it.row[idx[COLS.ReelsLink]] || "").trim();

 let s = "";
 s += `${addr} Photo Link:\n${photo || "(No photo link)"}\n\n`;

 if (video) {
 s += `${addr} Video Link:\n${video}\n\n`;
 }

 if (reels) {
 s += `${addr} Reels Link:\n${reels}\n\n`;
 }

 return s;
 });
 return blocks.join("\n");
}

function buildMediaLinksHtml_(items, idx) {
 const blocks = items.map(it => {
 const addr = String(it.row[idx[COLS.ListingAddress]] || "").trim() || "(No address)";
 const photo = String(it.row[idx[COLS.PhotoLink]] || "").trim();
 const video = String(it.row[idx[COLS.VideoLink]] || "").trim();
 const reels = String(it.row[idx[COLS.ReelsLink]] || "").trim();

 let s = "";
 s += `<b>${escapeHtml_(addr)} Photo Link:</b><br>${linkOrTextHtml_(photo)}<br><br>`;

 if (video) {
 s += `<b>${escapeHtml_(addr)} Video Link:</b><br>${linkOrTextHtml_(video)}<br><br>`;
 }

 if (reels) {
 s += `<b>${escapeHtml_(addr)} Reels Link:</b><br>${linkOrTextHtml_(reels)}<br><br>`;
 }

 return s;
 });
 return blocks.join("");
}

function linkOrTextHtml_(url) {
 const u = String(url || "").trim();
 if (!u) return "(No link)";
 const safe = escapeHtml_(u);
 if (u.startsWith("http://") || u.startsWith("https://")) {
 return `<a href="${safe}">${safe}</a>`;
 }
 return safe;
}

function getBillingContactNameForCompany_(company) {
 const billingMap = getBillingMap_();
 const key = String(company || "").trim().toLowerCase();
 const hit = billingMap.get(key);
 const name = hit ? String(hit.billingContact || "").trim() : "";
 if (!name) {
 throw new Error(`Missing BillingContactName for company: ${company}`);
 }
 return name;
}

function getBillingMap_() {
 const ss = SpreadsheetApp.getActiveSpreadsheet();
 const sh = ss.getSheetByName(BILLING_SHEET_NAME);
 if (!sh) return new Map();

 const values = sh.getDataRange().getValues();
 if (values.length < 2) return new Map();

 const headers = values[0].map(h => String(h).trim());
 const idx = {};
 headers.forEach((h, i) => { if (h) idx[h] = i; });

 if (idx["Company"] === undefined || idx["BillingEmail"] === undefined) {
 throw new Error(`CO_BILLING_INFO must include headers: Company, BillingEmail`);
 }

 const map = new Map();
 for (let r = 1; r < values.length; r++) {
 const row = values[r];
 const company = String(row[idx["Company"]] || "").trim();
 const billingEmail = String(row[idx["BillingEmail"]] || "").trim();
 const billingContact =
 idx["BillingContactName"] !== undefined
 ? String(row[idx["BillingContactName"]] || "").trim()
 : "";
 const billingPhone =
 idx["BillingPhone"] !== undefined
 ? String(row[idx["BillingPhone"]] || "").trim()
 : "";

 if (company) {
 map.set(company.toLowerCase(), { billingEmail, billingContact, billingPhone });
 }
 }

 return map;
}

function pickRecipientByClientEmail_(items, idx) {
 const email = firstNonEmpty_(items.map(it => it.row[idx[COLS.ClientEmail]]));
 const toEmail = String(email || "").trim();
 if (!toEmail) throw new Error("No recipient found (ClientEmail is blank).");
 return toEmail;
}

function pickRecipientWithBillingInfo_(items, idx) {
 const directBilling = firstNonEmpty_(items.map(it => it.row[idx[COLS.BillingEmail]]));
 if (String(directBilling || "").trim()) return String(directBilling).trim();

 const company = String(items[0].row[idx[COLS.Company]] || "").trim().toLowerCase();
 const billingMap = getBillingMap_();
 const hit = billingMap.get(company);
 if (hit && String(hit.billingEmail || "").trim()) return String(hit.billingEmail).trim();

 const client = firstNonEmpty_(items.map(it => it.row[idx[COLS.ClientEmail]]));
 const toEmail = String(client || "").trim();
 if (!toEmail) throw new Error("No recipient found (BillingEmail, CO_BILLING_INFO, and ClientEmail are blank).");
 return toEmail;
}

function assertSendAsConfigured_() {
 const aliases = GmailApp.getAliases().map(a => a.toLowerCase());
 if (!aliases.includes(EMAIL_FROM_ADDRESS.toLowerCase())) {
 throw new Error(`Send-as not configured for ${EMAIL_FROM_ADDRESS}`);
 }
}

function getDriveImageBlobByName_(filename) {
 const files = DriveApp.getFilesByName(filename);
 if (!files.hasNext()) throw new Error(`QR image not found in Drive: ${filename}`);
 return files.next().getBlob();
}

function escapeHtml_(s) {
 return String(s || "")
 .replace(/&/g, "&amp;")
 .replace(/</g, "&lt;")
 .replace(/>/g, "&gt;")
 .replace(/"/g, "&quot;")
 .replace(/'/g, "&#39;");
}

// ===== Invoice generation =====

function runInvoicePreviewPdf_(opts) {
 const ctx = getContext_();
 const idx = ctx.idx;
 validateColumns_(ctx.idx, [
 COLS.Company, COLS.ClientFirstName, COLS.ClientLastName,
 COLS.InvoiceNumber, COLS.InvoiceStatus,
 COLS.EstTotal, COLS.Total, COLS.Deposit, COLS.InvoicedAt, COLS.InvoicePDFUrl,
 COLS.ListingAddress, COLS.Bedrooms, COLS.Service, COLS.City, COLS.EstLineItems,
 COLS.InvoicePreviewUrl
 ]);

 const companyNeedle = (opts.companyQuery || "").trim().toLowerCase();
 const lastNameNeedle = (opts.lastNameQuery || "").trim().toLowerCase();

 const eligible = ctx.rows.filter(it => {
 const row = it.row;

 const company = String(row[ctx.idx[COLS.Company]] || "").trim();
 if (!company) return false;

 // Preview only for NOT-invoiced rows (so previews don't overwrite sent invoices)
 const invoiceNum = String(row[ctx.idx[COLS.InvoiceNumber]] || "").trim();
 const invStatus = String(row[ctx.idx[COLS.InvoiceStatus]] || "").trim();
 if (invoiceNum) return false;
 if (invStatus) return false;

 // For LASTNAME previews, only include Delivered=Y
 const delivered = String(row[ctx.idx[COLS.Delivered]] || "").trim().toUpperCase();
 if (opts.mode === "LASTNAME" && delivered !== "Y") return false;


 if (opts.mode === "COMPANY") {
 if (company.toLowerCase() !== companyNeedle) return false;
 } else if (opts.mode === "LASTNAME") {
 const lastName = String(row[ctx.idx[COLS.ClientLastName]] || "").trim();
 if (lastName.toLowerCase() !== lastNameNeedle) return false;
 }

 return true;
 }).map(it => ({
 ...it,
 company: String(it.row[ctx.idx[COLS.Company]] || "").trim(),
 }));

 if (eligible.length === 0) return alert_("No eligible rows found (Invoice PREVIEW PDF).");

 const groups = groupItems_(eligible, ctx.idx, opts.mode);
 const summary = summarizeGroupsByAddresses_(groups, ctx.idx);

 if (!confirmAction_("CREATE Invoice PREVIEW PDF(s)", summary)) return;

 const templateId = findDocByName_(DOC_TEMPLATE_NAME);
 const invoiceFolderId = findFolderByName_(INVOICE_FOLDER_NAME);
 const previewFolderId = findSubfolderByName_(invoiceFolderId, INVOICE_PREVIEW_SUBFOLDER_NAME);

 const now = new Date();
 const previewStamp = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyyMMdd-HHmmss");

 for (const [groupKey, items] of groups.entries()) {
 const company = String(items[0].row[ctx.idx[COLS.Company]] || "").trim();
 const lastName = String(items[0].row[ctx.idx[COLS.ClientLastName]] || "").trim();

 const pseudoInvoiceNumber = String(items[0].row[ctx.idx[COLS.InvoiceNumber]] || "").trim() || `PREVIEW-${previewStamp}`;
 const nameLabel = (opts.mode === "LASTNAME")
 ? String(items[0].row[ctx.idx[COLS.ClientLastName]] || "").trim() || company
 : company;

 const recipientEmail = (opts.mode === "LASTNAME")
 ? pickRecipientByClientEmail_(items, ctx.idx)
 : pickRecipientWithBillingInfo_(items, ctx.idx);

 const pdfFile = createInvoicePdf_(templateId, previewFolderId, pseudoInvoiceNumber, company, items, ctx.idx, now, {
 nameLabel: nameLabel,
 recipientEmail: recipientEmail,
 });


 // Write InvoicePreviewUrl back to every row in the group
 items.forEach(it => {
 const r = it.sheetRow;
 ctx.sheet.getRange(r, ctx.idx[COLS.InvoicePreviewUrl] + 1).setValue(pdfFile.getUrl());
 });
 }

 alert_("Done: Invoice PREVIEW PDF(s) created in ROM_INVOICES/_PREVIEW and URLs written to InvoicePreviewUrl.");
}

function findSubfolderByName_(parentFolderId, name) {
 const parent = DriveApp.getFolderById(parentFolderId);
 const it = parent.getFoldersByName(name);
 if (!it.hasNext()) {
 throw new Error(`Subfolder not found: ${name} (inside ${INVOICE_FOLDER_NAME})`);
 }
 return it.next().getId();
}

function createInvoicePdf_(templateId, folderId, invoiceNumber, company, items, idx, now, meta) {
 meta = meta || {};
 const nameLabel = String(meta.nameLabel || company).trim() || company;

 const subtotal = sumMoney_(items.map(it => it.row[idx[COLS.Total]]));
 const deposit = sumMoney_(items.map(it => it.row[idx[COLS.Deposit]]));
 const amountDue = round2_(subtotal - deposit);
 const dateDue = addDays_(now, 14);

 const folder = DriveApp.getFolderById(folderId);
 const docCopy = DriveApp.getFileById(templateId).makeCopy(`INVOICE ${invoiceNumber} - ${company}`, folder);

 const doc = DocumentApp.openById(docCopy.getId());
 const body = doc.getBody();

 const firstName = String(items[0].row[idx[COLS.ClientFirstName]] || "").trim();
 const lastName = String(items[0].row[idx[COLS.ClientLastName]] || "").trim();
 let clientName = `${firstName} ${lastName}`.trim() || company;

 // If this Company has a BillingContactName in CO_BILLING_INFO, use it on the PDF
 const billingMap = getBillingMap_();
 const hit = billingMap.get(String(company || "").trim().toLowerCase());
 const billingContactName = hit ? String(hit.billingContact || "").trim() : "";
 if (billingContactName) clientName = billingContactName;

 const recipientEmail = String(meta.recipientEmail || "").trim() || pickRecipientWithBillingInfo_(items, idx);

 body.replaceText("\\{\\{INVOICE_NUMBER\\}\\}", invoiceNumber);
 body.replaceText("\\{\\{INVOICE_DATE\\}\\}", formatDate_(now));
 body.replaceText("\\{\\{CLIENT_NAME\\}\\}", clientName);
 body.replaceText("\\{\\{COMPANY\\}\\}", company);
 body.replaceText("\\{\\{CLIENT_EMAIL\\}\\}", recipientEmail);

 body.replaceText("\\{\\{SUBTOTAL\\}\\}", money_(subtotal));
 body.replaceText("\\{\\{DEPOSIT\\}\\}", money_(deposit));
 body.replaceText("\\{\\{AMOUNT_DUE\\}\\}", money_(amountDue));
 body.replaceText("\\{\\{DATE_DUE\\}\\}", formatDate_(dateDue));


 insertLineItemsBlocks_(body, idx, items);

 doc.saveAndClose();

 const pdfBlob = docCopy.getBlob().getAs(MimeType.PDF);
 const safeCompany = String(company || "").replace(/[\\\/:*?"<>|]/g, "-").trim();
 const safeLabel = String(nameLabel || "").replace(/[\\\/:*?"<>|]/g, "-").trim();
 const pdfName = `${invoiceNumber} - ${formatDateForFilename_(now)} - ${safeLabel}.pdf`;
 const pdfFile = folder.createFile(pdfBlob).setName(pdfName);

 docCopy.setTrashed(true);

 return pdfFile;
}

function insertLineItemsBlocks_(body, idx, items) {
 const found = body.findText("\\{\\{LINE_ITEMS_TABLE\\}\\}");
 if (!found) throw new Error("Template missing {{LINE_ITEMS_TABLE}} placeholder.");

 const el = found.getElement();
 const start = found.getStartOffset();
 const end = found.getEndOffsetInclusive();

 el.asText().deleteText(start, end);

 const parent = el.getParent();
 const parentIndex = body.getChildIndex(parent);
 let insertAt = parentIndex + 1;

 items.forEach((it) => {
 const r = it.row;

 const address = String(r[idx[COLS.ListingAddress]] || "").trim();
 const bedrooms = String(r[idx[COLS.Bedrooms]] || "").trim();
 const total = money_(toNumber_(r[idx[COLS.Total]]));

 // Clean up odd Bedroom values (e.g., "Lot (Please provide a site plan...)")
 let bedroomsClean = bedrooms;

 // If it contains "Lot", force it to just "Lot"
 if (/^lot\b/i.test(bedroomsClean)) bedroomsClean = "Lot";

 // Remove any "(Please provide ...)" style note
 bedroomsClean = bedroomsClean.replace(/\(please provide[^)]*\)/ig, "").trim();

 // If anything like "Lot (something)" still remains, keep only what's before the first "("
 bedroomsClean = bedroomsClean.split("(")[0].trim();

 // Use cleaned value going forward
 const bedroomsFinal = bedroomsClean;


 const topLine = `${address}${bedroomsFinal ? ` (${bedroomsFinal})` : ""} — Total: ${total}`;
 const pTop = body.insertParagraph(insertAt++, topLine);
 pTop.setSpacingAfter(4);

 const txt = pTop.editAsText();
 const idxTotal = topLine.lastIndexOf(total);
 if (idxTotal !== -1) {
 txt.setBold(idxTotal, idxTotal + total.length - 1, true);
 }

 const raw = String(r[idx[COLS.EstLineItems]] || "").trim();
 const parts = raw ? raw.split(";").map(s => s.trim()).filter(Boolean) : [];

 parts.forEach(part => {
 const cleaned = part.replace(/estimated/ig, "").replace(/\s+/g, " ").trim();
 const p = body.insertParagraph(insertAt++, cleaned);
 p.setIndentStart(18);
 p.setIndentFirstLine(18);
 p.setSpacingAfter(2);
 });

 body.insertParagraph(insertAt++, "");
 });
}

// ===== Utilities =====

function buildHeaderIndex_(headers) {
 const m = {};
 headers.forEach((h, i) => {
 if (h) m[h] = i;
 });
 return m;
}

function validateColumns_(idx, requiredCols) {
 requiredCols.forEach(col => {
 if (idx[col] === undefined) throw new Error(`Missing column header: ${col}`);
 });
}

function findDocByName_(name) {
 const files = DriveApp.getFilesByName(name);
 if (!files.hasNext()) throw new Error(`Google Doc template not found: ${name}`);
 return files.next().getId();
}

function findFolderByName_(name) {
 const folders = DriveApp.getFoldersByName(name);
 if (!folders.hasNext()) throw new Error(`Drive folder not found: ${name}`);
 return folders.next().getId();
}

function prompt_(title, promptText) {
 const ui = SpreadsheetApp.getUi();
 const resp = ui.prompt(title, promptText, ui.ButtonSet.OK_CANCEL);
 if (resp.getSelectedButton() !== ui.Button.OK) return "";
 return String(resp.getResponseText() || "").trim();
}

function confirmAction_(title, summary) {
 const ui = SpreadsheetApp.getUi();
 const resp = ui.alert(
 `${title} — Confirm`,
 `This will process:\n\n${summary}\n\nContinue?`,
 ui.ButtonSet.OK_CANCEL
 );
 return resp === ui.Button.OK;
}

function alert_(msg) {
 SpreadsheetApp.getUi().alert(msg);
}

function formatDateForFilename_(d) {
 // YYYY-MM-DD (filename safe)
 return Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

function formatDate_(d) {
 return Utilities.formatDate(d, Session.getScriptTimeZone(), "MM/dd/yyyy");
}

function addDays_(d, days) {
 const dt = (d instanceof Date) ? d : new Date(d);
 return new Date(dt.getTime() + (Number(days) * 24 * 60 * 60 * 1000));
}

function money_(n) {
 const x = Number(n || 0);
 return `$${round2_(x).toFixed(2)}`;
}

function round2_(n) {
 return Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100;
}

function sumMoney_(arr) {
 return round2_(arr.reduce((acc, v) => acc + toNumber_(v), 0));
}

function toNumber_(v) {
 if (v === null || v === undefined || v === "") return 0;
 if (typeof v === "number") return v;
 const s = String(v).replace(/[$,]/g, "").trim();
 const n = Number(s);
 return isNaN(n) ? 0 : n;
}

function parseDate_(v) {
 if (!v) return null;
 if (v instanceof Date && !isNaN(v.getTime())) return v;
 const d = new Date(v);
 return isNaN(d.getTime()) ? null : d;
}

function daysBetween_(a, b) {
 return (a.getTime() - b.getTime()) / (24 * 60 * 60 * 1000);
}

function getFileIdFromDriveUrl_(url) {
 const u = String(url || "").trim();
 if (!u) return "";
 const m1 = u.match(/\/d\/([a-zA-Z0-9_-]+)/);
 if (m1 && m1[1]) return m1[1];
 const m2 = u.match(/[?&]id=([a-zA-Z0-9_-]+)/);
 if (m2 && m2[1]) return m2[1];
 return "";
}

function firstNonEmpty_(arr) {
 for (const v of arr) {
 const s = String(v || "").trim();
 if (s) return s;
 }
 return "";
}

function incrementInvoiceNumber_(inv) {
 const s = String(inv).trim();
 const m = s.match(/^(\d{4})-(\d+)$/);
 if (!m) throw new Error(`NextInvoiceNumber must look like YYYY-NNNN (got: ${s})`);
 const year = m[1];
 const num = parseInt(m[2], 10);
 if (!Number.isFinite(num)) throw new Error(`Bad invoice number numeric part: ${s}`);
 return `${year}-${String(num + 1)}`;
}

function sendSecondAttemptOverdueByLastName() {
 const lastName = prompt_("Second Attempt (by ClientLastName)", "Enter ClientLastName (case-insensitive exact match):");
 if (!lastName) return;
 runOverdueAttempt_({ attempt: "SECOND", mode: "LASTNAME", lastNameQuery: lastName });
}

function sendThirdAttemptOverdueByLastName() {
 const lastName = prompt_("Third Attempt (by ClientLastName)", "Enter ClientLastName (case-insensitive exact match):");
 if (!lastName) return;
 runOverdueAttempt_({ attempt: "THIRD", mode: "LASTNAME", lastNameQuery: lastName });
}

function runOverdueAttempt_(opts) {
 opts = opts || {};
 const attempt = String(opts.attempt || "").toUpperCase();
 if (attempt !== "SECOND" && attempt !== "THIRD") throw new Error("Bad attempt type.");

 assertSendAsConfigured_();

 const invSheet = getOrCreateInvoicesSheet_();
 const values = invSheet.getDataRange().getValues();
 if (values.length < 2) return alert_("INVOICES has no data rows.");

 const headers = values[0].map(h => String(h || "").trim());
 const col = {};
 headers.forEach((h, i) => { if (h) col[h] = i; });

 const required = [
 "InvoiceNumber","InvoiceStatus","ClientFirstName","ClientLastName","InvoiceToEmail",
 "InvoicePDFUrl","AmountDue","DateDue","SecondAttempt","ThirdAttempt"
 ];
 required.forEach(h => {
 if (col[h] === undefined) throw new Error(`INVOICES missing required header: ${h}`);
 });

 const now = new Date();

 // eligibility rules
 const overdueDays = (attempt === "SECOND") ? 0 :14;

 // collect eligible invoices
 const eligible = [];
 for (let r = 1; r < values.length; r++) {
 const row = values[r];
 const mode = String(opts.mode || "").toUpperCase();
 if (mode === "LASTNAME") {
 const lastNameNeedle = String(opts.lastNameQuery || "").trim().toLowerCase();
 const ln = String(row[col["ClientLastName"]] || "").trim().toLowerCase();
 if (!ln || ln !== lastNameNeedle) continue;
 }

 const status = String(row[col["InvoiceStatus"]] || "").trim().toUpperCase();
 if (status !== "SENT") continue;

 const toEmail = String(row[col["InvoiceToEmail"]] || "").trim();
 if (!toEmail) continue;

 const dateDue = parseDate_(row[col["DateDue"]]);
 if (!dateDue) continue;

 const daysLate = daysBetween_(now, dateDue);
 if (daysLate <= overdueDays) continue;

 const secondAttempt = String(row[col["SecondAttempt"]] || "").trim();
 const thirdAttempt = String(row[col["ThirdAttempt"]] || "").trim();

 if (attempt === "SECOND") {
 if (secondAttempt) continue; // only once
 } else {
 if (!secondAttempt) continue; // must have 2nd attempt
 if (thirdAttempt) continue; // only once
 }

 eligible.push({ sheetRow: r + 1, row });
 }

 if (!eligible.length) {
 return alert_(attempt === "SECOND"
 ? "No eligible invoices found for Second Attempt."
 : "No eligible invoices found for Third Attempt.");
 }

 // group by recipient
 const groups = new Map(); // email -> items
 eligible.forEach(it => {
 const email = String(it.row[col["InvoiceToEmail"]] || "").trim().toLowerCase();
 if (!groups.has(email)) groups.set(email, []);
 groups.get(email).push(it);
 });

 // confirm summary
 const lines = [];
 for (const [email, items] of groups.entries()) {
 lines.push(`${email}: ${items.length} invoice(s)`);
 }
 const summary = lines.join("\n");

 if (!confirmAction_(attempt === "SECOND" ? "SEND Second Attempt" : "SEND Third Attempt", summary)) return;

 // load QR blobs once
 const zelleBlob = getDriveImageBlobByName_(ZELLE_QR_FILENAME).setName("zelleqr.jpg");
 const venmoBlob = getDriveImageBlobByName_(VENMO_QR_FILENAME).setName("venmoqr.jpg");

 for (const [email, items] of groups.entries()) {
 // sum due + gather attachments
 let totalDue = 0;
 const attachments = [];

 items.forEach(it => {
 totalDue += toNumber_(it.row[col["AmountDue"]]);

 const pdfUrl = String(it.row[col["InvoicePDFUrl"]] || "").trim();
 const fileId = getFileIdFromDriveUrl_(pdfUrl);
 if (!fileId) {
 const invNum = String(it.row[col["InvoiceNumber"]] || "").trim();
 throw new Error(`Could not extract Drive file id from InvoicePDFUrl for invoice ${invNum}`);
 }
 attachments.push(DriveApp.getFileById(fileId).getBlob());
 });

 const firstName = String(items[0].row[col["ClientFirstName"]] || "").trim();
 const lastName = String(items[0].row[col["ClientLastName"]] || "").trim();

 const subject = (attempt === "SECOND")
 ? "Past Due Invoice Reminder"
 : "Third Notice: Past Due Invoice Reminder";

 const body = buildOverdueAttemptEmailText_(firstName, lastName, totalDue);
 const htmlBody = buildOverdueAttemptEmailHtml_(firstName, lastName, totalDue);

 GmailApp.sendEmail(email, subject, body, {
 name: EMAIL_FROM_NAME,
 attachments: attachments,
 htmlBody: htmlBody,
 inlineImages: { zelleqr: zelleBlob, venmoqr: venmoBlob },
 bcc: EMAIL_BCC_ADDRESS,
 });

 // stamp attempt date on each invoice row
 items.forEach(it => {
 const attemptCol = (attempt === "SECOND") ? col["SecondAttempt"] : col["ThirdAttempt"];
 invSheet.getRange(it.sheetRow, attemptCol + 1).setValue(now);
 });
 }

 alert_(attempt === "SECOND"
 ? "Done: Second Attempt email(s) sent and SecondAttempt dates written."
 : "Done: Third Attempt email(s) sent and ThirdAttempt dates written.");
}

function testSendFromDomain() {
 assertSendAsConfigured_();
 GmailApp.sendEmail("ryanowen80@gmail.com", "ROM TEST", "If you got this, it's fixed.", {
 from: EMAIL_FROM_ADDRESS,
 name: EMAIL_FROM_NAME,
 replyTo: EMAIL_FROM_ADDRESS,
 });
}

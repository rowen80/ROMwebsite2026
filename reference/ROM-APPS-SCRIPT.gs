/***********************
 * ROM: Delivery + Invoicing Apps Script
 * Saved 2026-03-22
 * 
 * This is the current Google Apps Script that runs from the ROM master spreadsheet.
 * It handles:
 * - Photo/video delivery emails
 * - Invoice PDF generation from Google Docs template
 * - Payment reminders (overdue invoices)
 * - Integration with CO_BILLING_INFO sheet
 * - Zelle/Venmo QR code attachments
 * 
 * Key insights for n8n integration:
 * - The "Total" column is COMPUTED IN SHEETS (not by this script)
 * - Invoice PDFs are generated from _ROM_INVOICE_TEMPLATE Google Doc
 * - Invoices are stored in ROM_INVOICES Drive folder
 * - The script updates InvoiceNumber, InvoicedAt, InvoicePDFUrl back to the sheet
 * - Billing email routing: BillingEmail column > CO_BILLING_INFO > ClientEmail
 ***********************/

const SHEET_NAME = ""; // "" = active sheet
const SETTINGS_SHEET_NAME = "SETTINGS";
const DOC_TEMPLATE_NAME = "_ROM_INVOICE_TEMPLATE";
const INVOICE_FOLDER_NAME = "ROM_INVOICES";
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
const EMAIL_FROM_ADDRESS = "ryan@ryanowenphotography.com";
const EMAIL_BCC_ADDRESS = "ryan@ryanowenphotography.com";

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

// [REST OF THE SCRIPT CONTINUES - Full 2000+ lines provided by user]
// See full code above - this is just the header/reference section

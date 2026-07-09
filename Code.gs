/**
 * ============================================================================
 *  DiwanE Al Maaref — Backend Google Apps Script
 *  Handles: public pre-registration submissions (doPost) + admin dashboard
 *  data retrieval (doGet), writing to a Google Sheet and uploading files to
 *  a dedicated Google Drive folder.
 *
 *  SEE SETUP_INSTRUCTIONS.md FOR FULL DEPLOYMENT STEPS.
 * ============================================================================
 */

// ====================== CONFIGURATION — EDIT THESE ======================

// Name of the sheet/tab that will store the registrations
const SHEET_NAME = 'Inscriptions';

// Name of the Google Drive folder where uploaded documents will be stored
const DRIVE_FOLDER_NAME = 'DiwanE_Al_Maaref_Dossiers';

// Secret token required to read data from the admin dashboard.
// CHANGE THIS to a long random string before deploying, and only share
// it with trusted school administration staff.
const ADMIN_TOKEN = 'CHANGE_THIS_TO_A_LONG_RANDOM_SECRET';

// ==========================================================================

const SHEET_HEADERS = [
  'ID', 'Horodatage',
  'Prenom', 'Nom', 'DateNaissance', 'LieuNaissance',
  'NomPere', 'NomMere', 'CINPere', 'CINMere',
  'TelMere', 'TelPere', 'TelUrgence',
  'PhotoURL', 'ActeNaissanceURL', 'CINParentsURL'
];

/**
 * Handles the public registration form submission (POST request).
 * Expects a JSON body with student/parent fields plus base64-encoded files.
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonOutput_({ status: 'error', message: 'Requête invalide.' });
    }

    const data = JSON.parse(e.postData.contents);
    const sheet = getSheet_();
    const folder = getFolder_();

    // Sequential ID: header occupies row 1, so getLastRow() BEFORE inserting
    // gives us the correct next ID (1, 2, 3, ...).
    const id = sheet.getLastRow();

    const studentFolder = folder.createFolder(
      id + '_' + sanitize_(data.lastName) + '_' + sanitize_(data.firstName)
    );

    const files = data.files || {};
    const photoUrl = saveBase64File_(studentFolder, files.photo, 'photo_' + id, files.photoType);
    const birthCertUrl = saveBase64File_(studentFolder, files.birthCert, 'acte_naissance_' + id, files.birthCertType);
    const idCardsUrl = saveBase64File_(studentFolder, files.idCards, 'cin_parents_' + id, files.idCardsType);

    sheet.appendRow([
      id,
      new Date(),
      data.firstName || '',
      data.lastName || '',
      data.dob || '',
      data.pob || '',
      data.fatherName || '',
      data.motherName || '',
      data.fatherCIN || '',
      data.motherCIN || '',
      data.motherPhone || '',
      data.fatherPhone || '',
      data.emergencyPhone || '',
      photoUrl,
      birthCertUrl,
      idCardsUrl
    ]);

    return jsonOutput_({ status: 'success', id: id });

  } catch (err) {
    return jsonOutput_({ status: 'error', message: err.message });
  }
}

/**
 * Handles data retrieval for the admin dashboard (GET request).
 * Requires ?token=ADMIN_TOKEN to match the configured secret.
 */
function doGet(e) {
  const token = e && e.parameter ? e.parameter.token : null;

  if (token !== ADMIN_TOKEN) {
    return jsonOutput_({ status: 'error', message: 'Accès refusé : jeton invalide.' });
  }

  const sheet = getSheet_();
  const range = sheet.getDataRange().getValues();
  const headers = range.shift();

  const records = range.map(function (row) {
    const obj = {};
    headers.forEach(function (h, i) { obj[h] = row[i]; });
    return obj;
  }).reverse(); // newest submissions first

  return jsonOutput_({ status: 'success', records: records });
}

// ============================ HELPERS ============================

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(SHEET_HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

function getFolder_() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

/**
 * Decodes a base64 data-URL, saves it as a file in the given folder,
 * makes it viewable via link, and returns a shareable "view" URL.
 */
function saveBase64File_(folder, base64Data, filenameBase, mimeType) {
  if (!base64Data) return '';

  const commaIndex = base64Data.indexOf(',');
  const cleanBase64 = commaIndex > -1 ? base64Data.substring(commaIndex + 1) : base64Data;
  const type = mimeType || 'application/octet-stream';
  const extension = extensionForMime_(type);

  const bytes = Utilities.base64Decode(cleanBase64);
  const blob = Utilities.newBlob(bytes, type, filenameBase + extension);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return 'https://drive.google.com/file/d/' + file.getId() + '/view';
}

function extensionForMime_(mimeType) {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'application/pdf': '.pdf'
  };
  return map[mimeType] || '';
}

function sanitize_(str) {
  return (str || 'NA').toString().replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_').substring(0, 40);
}

function jsonOutput_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

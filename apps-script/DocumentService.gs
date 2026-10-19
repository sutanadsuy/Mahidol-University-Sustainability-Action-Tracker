function getOrCreateSheet_(sheetName, headers) {
  const ss = getAppSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.getSheets().find(s => s.getName().trim() === sheetName.trim());
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (headers && headers.length) {
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function getOrCreateFolder_(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
}

function saveActivityFile_(fileObj, folderName) {
  try {
    const folder = getOrCreateFolder_(folderName || 'MU_Sustainability_Activity_Files');
    const decoded = Utilities.base64Decode(fileObj.base64.split(',')[1]);
    const blob = Utilities.newBlob(decoded, fileObj.mimeType, fileObj.name);
    return folder.createFile(blob).getUrl();
  } catch (err) {
    throw new Error('บันทึกไฟล์ไม่สำเร็จ: ' + err.message);
  }
}

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
  const managedFolders = {
    'MU_Sustainability_Attachments': '1BWBtxHy_r5TZmEA544ck_Upp4xUuCpw4',
    'MU_Sustainability_Activity_Files': '1BWBtxHy_r5TZmEA544ck_Upp4xUuCpw4',
    'MU_Sustainability_Master_Docs': '1oNmi5z7hIybwl4NjURZrrXJpnSYR7AWA'
  };
  if (managedFolders[folderName]) {
    try { return DriveApp.getFolderById(managedFolders[folderName]); } catch (err) {}
  }
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

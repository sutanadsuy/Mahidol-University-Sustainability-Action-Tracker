// ค้นหาชีทเอกสารงบประมาณโครงการใหญ่แบบยืดหยุ่น (ป้องกันปัญหาชื่อชีทมี space ต่อท้าย)
function getMasterBudgetDocSheet_() {
  const ss = getAppSpreadsheet();
  let sheet = ss.getSheetByName('Master_Budget_Documents');
  if (!sheet) {
    const sheets = ss.getSheets();
    for (let s of sheets) {
      if (s.getName().trim() === 'Master_Budget_Documents') {
        return s;
      }
    }
  }
  return sheet;
}

function uploadMasterBudgetDoc(payload, fileObj) {
  requireAdminAccess_();
  let sheet = getMasterBudgetDocSheet_();
  if (!sheet) {
    sheet = getOrCreateSheet_('Master_Budget_Documents', [
      'Doc_ID', 'Fiscal_Year', 'Doc_Category', 'Doc_Name', 'File_Name', 
      'Doc_URL', 'Is_Latest', 'Uploaded_At', 'Uploaded_By', 'Priority'
    ]);
  }
  const folder = getOrCreateFolder_('MU_Sustainability_Master_Docs');
  const now = new Date();
  const user = Session.getActiveUser().getEmail() || 'Anonymous';

  const decoded = Utilities.base64Decode(fileObj.base64.split(',')[1]);
  const blob = Utilities.newBlob(decoded, fileObj.mimeType, fileObj.name);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const docId = 'MDOC-' + Utilities.getUuid().substring(0, 8);
  const targetFY = String(payload.fiscalYear).trim();
  const priorityVal = Number(payload.priority) || 1;

  sheet.appendRow([
    docId,
    targetFY,
    payload.category,
    payload.docName,
    fileObj.name,
    file.getUrl(),
    payload.isLatest !== false ? 'Yes' : 'No',
    Utilities.formatDate(now, Session.getScriptTimeZone(), 'dd/MM/yyyy, HH:mm:ss'),
    user,
    priorityVal
  ]);

  appendAdminChange_('document', docId, 'CREATE', null,
    adminRowSnapshot_(sheet.getRange(sheet.getLastRow(), 1, 1, sheet.getLastColumn()).getValues()[0]));

  return { success: true, message: 'อัปโหลดและบันทึกเอกสารโครงการใหญ่สำเร็จ' };
}

function getMasterBudgetDocs(fiscalYear) {
  const sheet = getMasterBudgetDocSheet_();
  if (!sheet) return [];

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];

  const targetFY = String(fiscalYear || '2569').trim();
  const docs = [];

  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[0]) continue;
    const rowFY = String(r[1] || '').trim();
    
    // ตรวจสอบสถานะบังคับใช้ รองรับทั้ง Yes, TRUE, Active
    const rawStatus = String(r[6] || '').trim().toLowerCase();
    const isLatest = (rawStatus === 'yes' || rawStatus === 'true' || rawStatus === 'active');

    if (rowFY === targetFY && isLatest) {
      docs.push({
        id: String(r[0]).trim(),
        fiscalYear: rowFY,
        category: String(r[2] || '').trim(),
        docName: String(r[3] || '').trim(),
        fileName: String(r[4] || '').trim(),
        url: String(r[5] || '').trim(),
        isLatest: true,
        uploadedAt: r[7] instanceof Date ? Utilities.formatDate(r[7], Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm') : String(r[7] || '-'),
        uploadedBy: String(r[8] || '').trim(),
        priority: Number(r[9]) || 99
      });
    }
  }

  docs.sort((a, b) => a.priority - b.priority);
  return docs;
}

// ดึงเอกสารทั้งหมดสำหรับตาราง Admin
function getAllMasterBudgetDocsForAdmin(fiscalYear) {
  requireAdminAccess_();
  try {
    const sheet = getMasterBudgetDocSheet_();
    if (!sheet) return [];

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const targetFY = String(fiscalYear || '2569').trim();
    const docs = [];

    for (let i = 1; i < data.length; i++) {
      const r = data[i];
      if (!r[0]) continue;
      const rowFY = String(r[1] || '').trim();

      if (rowFY === targetFY || targetFY === 'ALL') {
        const rawStatus = String(r[6] || '').trim().toLowerCase();
        const isLatest = (rawStatus === 'yes' || rawStatus === 'true' || rawStatus === 'active');

        docs.push({
          id: String(r[0]).trim(),
          fiscalYear: rowFY,
          category: String(r[2] || '').trim(),
          docName: String(r[3] || '').trim(),
          fileName: String(r[4] || '').trim(),
          url: String(r[5] || '').trim(),
          isLatest: isLatest,
          uploadedAt: r[7] instanceof Date ? Utilities.formatDate(r[7], Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm') : String(r[7] || '-'),
          uploadedBy: String(r[8] || '').trim(),
          priority: Number(r[9]) || (i),
          replacesDocId: String(r[10] || '').trim()
        });
      }
    }

    docs.sort((a, b) => a.priority - b.priority);
    return docs;
  } catch (err) {
    throw new Error('เกิดข้อผิดพลาดในการอ่านข้อมูลเอกสาร: ' + err.message);
  }
}

// อัปเดตสถานะและ Priority
function updateMasterBudgetDocStatus(docId, isActive, priorityVal) {
  requireAdminAccess_();
  const sheet = getMasterBudgetDocSheet_();
  if (!sheet) return { success: false, message: 'ไม่พบชีท Master_Budget_Documents' };

  const data = sheet.getDataRange().getValues();
  let foundRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === String(docId).trim()) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > 0) {
    const before = adminRowSnapshot_(data[foundRow - 1]);
    sheet.getRange(foundRow, 7).setValue(isActive ? 'Yes' : 'No'); // บันทึกเป็น Yes / No ตามโครงสร้างเดิมของชีท
    if (priorityVal !== undefined && priorityVal !== null) {
      sheet.getRange(foundRow, 10).setValue(Number(priorityVal) || 1);
    }
    const wasActive = ['yes', 'true', 'active'].includes(String(data[foundRow - 1][6] || '').trim().toLowerCase());
    const action = wasActive === isActive ? 'UPDATE' : isActive ? 'RESTORE' : 'ARCHIVE';
    appendAdminChange_('document', String(docId), action, before,
      adminRowSnapshot_(sheet.getRange(foundRow, 1, 1, sheet.getLastColumn()).getValues()[0]));
    return { success: true, message: 'อัปเดตสถานะและลำดับเอกสารเรียบร้อยแล้ว' };
  }

  return { success: false, message: 'ไม่พบรหัสเอกสารที่ระบุ' };
}

function updateMasterBudgetDocMetadata(docId, payload) {
  requireAdminAccess_();
  const sheet = getMasterBudgetDocSheet_();
  if (!sheet) throw new Error('ไม่พบตารางเอกสาร');
  const data = sheet.getDataRange().getValues();
  const category = String(payload.category || '').trim();
  const name = String(payload.docName || '').trim();
  const priority = Number(payload.priority);
  if (!category || !name || !Number.isFinite(priority) || priority < 1) throw new Error('ข้อมูลเอกสารไม่ครบ');
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() !== String(docId).trim()) continue;
    const before = adminRowSnapshot_(data[i]);
    sheet.getRange(i + 1, 3, 1, 2).setValues([[category, name]]);
    sheet.getRange(i + 1, 10).setValue(priority);
    appendAdminChange_('document', String(docId), 'UPDATE', before,
      adminRowSnapshot_(sheet.getRange(i + 1, 1, 1, sheet.getLastColumn()).getValues()[0]));
    return { success: true, message: 'แก้ไขรายละเอียดเอกสารแล้ว' };
  }
  throw new Error('ไม่พบเอกสารที่เลือก');
}

function replaceMasterBudgetDoc(docId, fileObj) {
  requireAdminAccess_();
  if (!fileObj || !fileObj.base64 || !fileObj.name) throw new Error('กรุณาเลือกไฟล์ทดแทน');
  const sheet = getMasterBudgetDocSheet_();
  if (!sheet) throw new Error('ไม่พบตารางเอกสาร');
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() !== String(docId).trim()) continue;
    const before = adminRowSnapshot_(data[i]);
    const decoded = Utilities.base64Decode(String(fileObj.base64).split(',')[1]);
    const blob = Utilities.newBlob(decoded, fileObj.mimeType, fileObj.name);
    const file = getOrCreateFolder_('MU_Sustainability_Master_Docs').createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const newId = 'MDOC-' + Utilities.getUuid().substring(0, 8);
    const wasActive = ['yes', 'true', 'active'].includes(String(data[i][6] || '').trim().toLowerCase());
    sheet.getRange(i + 1, 7).setValue('No');
    if (sheet.getRange(1, 11).getValue() === '') sheet.getRange(1, 11).setValue('Replaces_Doc_ID');
    sheet.appendRow([
      newId, data[i][1], data[i][2], data[i][3], fileObj.name, file.getUrl(), wasActive ? 'Yes' : 'No',
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy, HH:mm:ss'),
      Session.getActiveUser().getEmail() || '', Number(data[i][9]) || 1, String(docId)
    ]);
    appendAdminChange_('document', String(docId), 'REPLACE', before,
      adminRowSnapshot_(sheet.getRange(sheet.getLastRow(), 1, 1, 11).getValues()[0]));
    return { success: true, message: 'แทนที่ไฟล์แล้ว ไฟล์เดิมยังอยู่ในประวัติ', newDocId: newId };
  }
  throw new Error('ไม่พบเอกสารที่เลือก');
}

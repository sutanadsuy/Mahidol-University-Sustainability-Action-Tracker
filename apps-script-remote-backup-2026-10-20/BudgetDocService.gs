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
        uploadedAt: String(r[7] || '-'),
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
          uploadedAt: String(r[7] || '-'),
          uploadedBy: String(r[8] || '').trim(),
          priority: Number(r[9]) || (i)
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
    sheet.getRange(foundRow, 7).setValue(isActive ? 'Yes' : 'No'); // บันทึกเป็น Yes / No ตามโครงสร้างเดิมของชีท
    if (priorityVal !== undefined && priorityVal !== null) {
      sheet.getRange(foundRow, 10).setValue(Number(priorityVal) || 1);
    }
    return { success: true, message: 'อัปเดตสถานะและลำดับเอกสารเรียบร้อยแล้ว' };
  }

  return { success: false, message: 'ไม่พบรหัสเอกสารที่ระบุ' };
}

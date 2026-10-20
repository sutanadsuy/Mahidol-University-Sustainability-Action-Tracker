function getProjectMonthlyContext(fiscalYear, actualYear, refId, currentMonth) {
  const ss = getAppSpreadsheet();
  const sheet = ss.getSheetByName('Monthly_Progress');
  const expSheet = ss.getSheetByName('Expense_Items');
  const mProcSheet = ss.getSheetByName('Master_Procure_Plan');
  const fileSheet = ss.getSheetByName('File_Attachments');
  const data = sheet ? sheet.getDataRange().getValues().slice(1) : [];
  const expData = expSheet ? expSheet.getDataRange().getValues().slice(1) : [];
  const mProcData = mProcSheet ? mProcSheet.getDataRange().getValues().slice(1) : [];
  const fileData = fileSheet ? fileSheet.getDataRange().getValues().slice(1) : [];
  
  const stepWeights = getStepWeights();
  const targetFY = String(fiscalYear).trim();

  let steps = {
    draft: { prevPlan: 0, prevAct: 0, curPlan: 0, curAct: 0, isCompleted: false },
    approval: { prevPlan: 0, prevAct: 0, curPlan: 0, curAct: 0, isCompleted: false },
    procure: { prevPlan: 0, prevAct: 0, curPlan: 0, curAct: 0, isCompleted: false },
    execute: { prevPlan: 0, prevAct: 0, curPlan: 0, curAct: 0, isCompleted: false },
    disburse: { prevPlan: 0, prevAct: 0, curPlan: 0, curAct: 0, isCompleted: false },
    report: { prevPlan: 0, prevAct: 0, curPlan: 0, curAct: 0, isCompleted: false }
  };
  
  let pastActualProgressAcc = 0;
  let pastActualExpenseAcc = 0;
  let isPlanFound = false;
  let currentSummary = '';
  let currentDelayReason = '';
  let lastAuditInfo = null;

  const currentMonthIdx = CALENDAR_MONTHS.indexOf(String(currentMonth).trim()) + 1;
  const targetTimelineVal = (Number(actualYear) * 12) + currentMonthIdx;
  const relevantRows = data.filter(r => String(r[2]).trim() === String(refId).trim() && String(r[3]).trim() === targetFY);

  const sortedRows = relevantRows.map(r => ({
    r: r,
    val: (Number(r[4]) * 12) + (CALENDAR_MONTHS.indexOf(String(r[5]).trim()) + 1)
  })).sort((a, b) => a.val - b.val);

  let accTrack = { draft: 0, approval: 0, execute: 0, disburse: 0, report: 0 };
  let yearlyCompletedSteps = {};

  sortedRows.forEach(item => {
    const r = item.r;
    const rowTimelineVal = item.val;
    const mStr = `${String(r[5]).trim()} ${String(r[4]).trim()}`;

    accTrack.draft += (Number(r[7]) || 0);
    accTrack.approval += (Number(r[9]) || 0);
    accTrack.execute += (Number(r[13]) || 0);
    accTrack.disburse += (Number(r[15]) || 0);
    accTrack.report += (Number(r[17]) || 0);

    if (accTrack.draft >= 100 && !yearlyCompletedSteps.draft) yearlyCompletedSteps.draft = mStr;
    if (accTrack.approval >= 100 && !yearlyCompletedSteps.approval) yearlyCompletedSteps.approval = mStr;
    if (accTrack.execute >= 100 && !yearlyCompletedSteps.execute) yearlyCompletedSteps.execute = mStr;
    if (accTrack.disburse >= 100 && !yearlyCompletedSteps.disburse) yearlyCompletedSteps.disburse = mStr;
    if (accTrack.report >= 100 && !yearlyCompletedSteps.report) yearlyCompletedSteps.report = mStr;

    if (rowTimelineVal === targetTimelineVal) {
      steps.draft.curPlan = Number(r[6]) || 0;
      steps.draft.curAct = Number(r[7]) || 0;
      steps.approval.curPlan = Number(r[8]) || 0;
      steps.approval.curAct = Number(r[9]) || 0;
      steps.procure.curPlan = Number(r[10]) || 0;
      steps.procure.curAct = Number(r[11]) || 0;
      steps.execute.curPlan = Number(r[12]) || 0;
      steps.execute.curAct = Number(r[13]) || 0;
      steps.disburse.curPlan = Number(r[14]) || 0;
      steps.disburse.curAct = Number(r[15]) || 0;
      steps.report.curPlan = Number(r[16]) || 0;
      steps.report.curAct = Number(r[17]) || 0;
      
      const rawSummary = r[18] ? String(r[18]).trim() : '';
      currentSummary = (rawSummary === 'ตั้งค่าแผนงานโครงการ') ? '' : rawSummary;
      
      currentDelayReason = r[19] || '';
      isPlanFound = true;

      if (r[20]) {
        let updateDt = new Date(r[20]);
        let formattedDt = Utilities.formatDate(updateDt, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm') + ' น.';
        lastAuditInfo = { updatedAt: formattedDt, updatedBy: r[21] || 'Unknown' };
      }
    }
    
    if (rowTimelineVal < targetTimelineVal) {
      steps.draft.prevPlan += Number(r[6]) || 0;
      steps.draft.prevAct += Number(r[7]) || 0;
      steps.approval.prevPlan += Number(r[8]) || 0;
      steps.approval.prevAct += Number(r[9]) || 0;
      steps.procure.prevPlan += Number(r[10]) || 0;
      steps.procure.prevAct += Number(r[11]) || 0;
      steps.execute.prevPlan += Number(r[12]) || 0;
      steps.execute.prevAct += Number(r[13]) || 0;
      steps.disburse.prevPlan += Number(r[14]) || 0;
      steps.disburse.prevAct += Number(r[15]) || 0;
      steps.report.prevPlan += Number(r[16]) || 0;
      steps.report.prevAct += Number(r[17]) || 0;

      const stepProgWeighted = 
        ((Number(r[7])||0) * stepWeights.draft) +
        ((Number(r[9])||0) * stepWeights.approval) +
        ((Number(r[13])||0) * stepWeights.execute) +
        ((Number(r[15])||0) * stepWeights.disburse) +
        ((Number(r[17])||0) * stepWeights.report);

      pastActualProgressAcc += stepProgWeighted;
      pastActualExpenseAcc += Number(r[11]) || 0;
    }
  });

  steps.draft.isCompleted = steps.draft.prevAct >= 100;
  steps.approval.isCompleted = steps.approval.prevAct >= 100;
  steps.execute.isCompleted = steps.execute.prevAct >= 100;
  steps.disburse.isCompleted = steps.disburse.prevAct >= 100;
  steps.report.isCompleted = steps.report.prevAct >= 100;

  const thisMonthExpenses = expData.filter(e => String(e[3]).trim() === targetFY && String(e[4]).trim() === String(actualYear).trim() && String(e[2]).trim() === String(refId).trim() && String(e[5]).trim() === String(currentMonth).trim());

  // เตรียมรายการจัดซื้อพัสดุ พร้อมประวัติการเบิกจ่ายรอบล่าสุด
  const masterProcureItems = mProcData.filter(m => String(m[3]).trim() === targetFY && String(m[2]).trim() === String(refId).trim())
    .map(m => {
      const itemName = m[4];
      const approvedBgt = Number(m[5]) || 0;
      
      let pastPaidAcc = 0;
      const historyPayments = [];

      expData.filter(e => String(e[3]).trim() === targetFY && String(e[2]).trim() === String(refId).trim() && e[6] === itemName).forEach(e => {
        const eTimeline = (Number(e[4]) * 12) + (CALENDAR_MONTHS.indexOf(String(e[5]).trim()) + 1);
        const amountPaid = Number(e[8]) || 0;
        
        if (eTimeline < targetTimelineVal) {
          pastPaidAcc += amountPaid;
          if (amountPaid > 0) {
            let updateStr = '';
            if (e[13]) {
              try {
                updateStr = Utilities.formatDate(new Date(e[13]), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
              } catch (err) {}
            }
            historyPayments.push({
              val: eTimeline,
              monthYear: `${String(e[5]).trim()} ${String(e[4]).trim()}`,
              amount: amountPaid,
              updatedAt: updateStr,
              isInspected: (e[10] === 'ตรวจรับแล้ว'),
              isDisbursed: (e[11] === 'วางฎีกาแล้ว'),
              docUrl: e[12] || ''
            });
          }
        }
      });

      historyPayments.sort((a, b) => b.val - a.val);
      const latestPayment = historyPayments.length > 0 ? historyPayments[0] : null;

      const matchedThisMonth = thisMonthExpenses.find(e => e[6] === itemName);

      return {
        name: itemName,
        approvedBudget: approvedBgt,
        pastPaidAcc: pastPaidAcc,
        lastPaidMonth: latestPayment ? latestPayment.monthYear : '',
        lastPaidAmount: latestPayment ? latestPayment.amount : 0,
        lastUpdatedAt: latestPayment ? latestPayment.updatedAt : '',
        thisMonthAmount: matchedThisMonth ? Number(matchedThisMonth[8]) : '',
        isInspected: matchedThisMonth ? (matchedThisMonth[10] === 'ตรวจรับแล้ว') : (latestPayment ? latestPayment.isInspected : false),
        isDisbursed: matchedThisMonth ? (matchedThisMonth[11] === 'วางฎีกาแล้ว') : (latestPayment ? latestPayment.isDisbursed : false),
        docUrl: matchedThisMonth ? (matchedThisMonth[12] || '') : (latestPayment ? latestPayment.docUrl : '')
      };
    });

  // ดึงไฟล์ที่เคยบันทึกไว้ในรอบเดือนนี้ เพื่อส่งไปแสดงและให้สิทธิ์ลบ
  const existingMonthFiles = fileData.filter(f => {
    const matchFY = String(f[3]).trim() === targetFY;
    const matchRef = String(f[2]).trim() === String(refId).trim();
    const monthStr = String(f[4] || '').trim();
    const monthName = String(currentMonth).trim();
    const matchM = monthStr === `${monthName} ${String(actualYear).trim()}` || monthStr === monthName;
    return matchFY && matchRef && matchM;
  }).map(f => {
    let uploadDateStr = '';
    if (f[8]) {
      try {
        uploadDateStr = Utilities.formatDate(new Date(f[8]), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
      } catch (e) {}
    }
    return {
      id: String(f[0]),
      name: String(f[6]),
      type: String(f[5]),
      url: String(f[7]),
      uploadedAt: uploadDateStr,
      uploadedBy: String(f[9] || '')
    };
  });

  const attachmentHistory = getAttachmentHistory_(ss, fileData, targetFY, refId);

  return { 
    steps, 
    pastActualProgressAcc, 
    pastActualExpenseAcc, 
    isPlanFound, 
    currentSummary, 
    currentDelayReason, 
    masterProcureItems,
    existingMonthFiles, // ส่งรายการไฟล์เดิมในเดือนนี้
    attachmentHistory,
    stepWeights,
    lastAuditInfo,
    yearlyCompletedSteps,
    isApprovalDone: (steps.approval.prevAct + steps.approval.curAct) >= 100
  };
}

function submitMonthlyActual(payload, expenseItems, generalFiles) {
  const ss = getAppSpreadsheet();
  const sheet = ss.getSheetByName('Monthly_Progress');
  const expSheet = getOrCreateSheet_('Expense_Items', ['Expense_ID', 'Category', 'Reference_ID', 'Fiscal_Year', 'Actual_Year', 'Month', 'Item_Name', 'Approved_Budget_THB', 'Amount_THB', 'Savings_THB', 'Is_Inspected', 'Is_Disbursed', 'Inspection_Doc_URL', 'Created_At']);
  const fileSheet = ss.getSheetByName('File_Attachments');
  const prjSheet = ss.getSheetByName('Master_Projects');
  const folder = getOrCreateFolder_('MU_Sustainability_Attachments');
  const now = new Date();
  const user = Session.getActiveUser().getEmail() || payload.submitterEmail || 'Anonymous';
  
  if (payload.projectStatus && prjSheet) {
    const mData = prjSheet.getDataRange().getValues();
    for (let i = 1; i < mData.length; i++) {
      if (mData[i][0] === payload.refId && String(mData[i][1]).trim() === String(payload.fiscalYear).trim()) {
        prjSheet.getRange(i + 1, 11).setValue(payload.projectStatus);
        break;
      }
    }
  }

  const targetFY = String(payload.fiscalYear).trim();
  const expRows = expSheet.getDataRange().getValues();

  for (let i = expRows.length - 1; i >= 1; i--) {
    if (String(expRows[i][3]).trim() === targetFY && String(expRows[i][4]).trim() === String(payload.actualYear).trim() && expRows[i][2] === payload.refId && expRows[i][5] === payload.month) {
      expSheet.deleteRow(i + 1);
    }
  }

  let totalCalculatedExpense = 0;
  if (expenseItems && expenseItems.length > 0) {
    const refreshedExpRows = expSheet.getDataRange().getValues();

    expenseItems.forEach(item => {
      const approved = Number(item.approvedBudget) || 0;
      const actual = Number(item.amount) || 0;
      const savings = approved - actual;
      
      let docUrl = item.existingDocUrl || '';
      if (item.fileData) {
        const decoded = Utilities.base64Decode(item.fileData.base64.split(',')[1]);
        const blob = Utilities.newBlob(decoded, item.fileData.mimeType, 'ตรวจรับ_' + item.name + '_' + item.fileData.name);
        const uploaded = folder.createFile(blob);
        uploaded.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        docUrl = uploaded.getUrl();
      }

      if (actual > 0) {
        totalCalculatedExpense += actual;
        expSheet.appendRow([
          'EXP-' + Utilities.getUuid().substring(0, 8),
          'Project', payload.refId, targetFY, String(payload.actualYear).trim(), payload.month,
          item.name, approved, actual, savings,
          item.isInspected ? 'ตรวจรับแล้ว' : 'ยังไม่ตรวจรับ',
          item.isDisbursed ? 'วางฎีกาแล้ว' : 'ยังไม่วางฎีกา',
          docUrl, now
        ]);
      } else {
        let updatedExisting = false;
        for (let r = refreshedExpRows.length - 1; r >= 1; r--) {
          if (String(refreshedExpRows[r][3]).trim() === targetFY && refreshedExpRows[r][2] === payload.refId && refreshedExpRows[r][6] === item.name) {
            if (item.isInspected) expSheet.getRange(r + 1, 11).setValue('ตรวจรับแล้ว');
            if (item.isDisbursed) expSheet.getRange(r + 1, 12).setValue('วางฎีกาแล้ว');
            if (docUrl) expSheet.getRange(r + 1, 13).setValue(docUrl);
            updatedExisting = true;
            break;
          }
        }

        if (!updatedExisting && (item.isInspected || item.isDisbursed || docUrl)) {
          expSheet.appendRow([
            'EXP-' + Utilities.getUuid().substring(0, 8),
            'Project', payload.refId, targetFY, String(payload.actualYear).trim(), payload.month,
            item.name, approved, 0, approved,
            item.isInspected ? 'ตรวจรับแล้ว' : 'ยังไม่ตรวจรับ',
            item.isDisbursed ? 'วางฎีกาแล้ว' : 'ยังไม่วางฎีกา',
            docUrl, now
          ]);
        }
      }
    });
  }

  const data = sheet.getDataRange().getValues();
  let targetRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][3]).trim() === targetFY && String(data[i][4]).trim() === String(payload.actualYear).trim() && data[i][2] === payload.refId && data[i][5] === payload.month) {
      targetRow = i + 1;
      break;
    }
  }

  if (targetRow > 0) {
    sheet.getRange(targetRow, 8).setValue(Number(payload.draftActual) || 0);
    sheet.getRange(targetRow, 10).setValue(Number(payload.approvalActual) || 0);
    sheet.getRange(targetRow, 12).setValue(totalCalculatedExpense);
    sheet.getRange(targetRow, 14).setValue(Number(payload.executeActual) || 0);
    sheet.getRange(targetRow, 16).setValue(Number(payload.disburseActual) || 0);
    sheet.getRange(targetRow, 18).setValue(Number(payload.reportActual) || 0);
    sheet.getRange(targetRow, 19).setValue(payload.summary || '');
    sheet.getRange(targetRow, 20).setValue(payload.delayReason || '');
    sheet.getRange(targetRow, 21).setValue(now);
    sheet.getRange(targetRow, 22).setValue(user);
  } else {
    sheet.appendRow([
      'LOG-' + Utilities.getUuid().substring(0, 8),
      'Project', payload.refId, targetFY, String(payload.actualYear).trim(), payload.month,
      0, Number(payload.draftActual)||0,
      0, Number(payload.approvalActual)||0,
      0, totalCalculatedExpense,
      0, Number(payload.executeActual)||0,
      0, Number(payload.disburseActual)||0,
      0, Number(payload.reportActual)||0,
      payload.summary || '', payload.delayReason || '', now, user
    ]);
  }

  if (generalFiles && generalFiles.length > 0) {
    if (!fileSheet) throw new Error('ไม่พบชีท File_Attachments');
    if (!fileSheet.getRange(1, 10).getValue()) fileSheet.getRange(1, 10).setValue('Uploaded_By');
    generalFiles.forEach(f => {
      const decoded = Utilities.base64Decode(f.base64.split(',')[1]);
      const blob = Utilities.newBlob(decoded, f.mimeType, f.name);
      const uploaded = folder.createFile(blob);
      uploaded.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      
      fileSheet.appendRow([
        'FILE-' + Utilities.getUuid().substring(0, 8),
        'Project', payload.refId, targetFY, `${payload.month} ${payload.actualYear}`,
        f.docType, f.name, uploaded.getUrl(), now, user
      ]);
    });
  }
  return { success: true, message: 'บันทึกผลงานเรียบร้อยแล้ว' };
}

function formatAttachmentDate_(value) {
  if (!value) return '';
  try {
    return Utilities.formatDate(new Date(value), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  } catch (e) {
    return String(value);
  }
}

function normalizeAttachmentMonth_(monthValue, fiscalYear) {
  const month = String(monthValue || '').trim();
  if (/\d{4}/.test(month)) return month;
  const index = CALENDAR_MONTHS.indexOf(month);
  if (index < 0) return month;
  const year = Number(fiscalYear) - (index >= 9 ? 1 : 0);
  return `${month} ${year}`;
}

function getAttachmentHistory_(ss, activeRows, fiscalYear, refId) {
  const year = String(fiscalYear).trim();
  const project = String(refId).trim();
  const active = activeRows.filter(r => String(r[3]).trim() === year && String(r[2]).trim() === project)
    .map(r => ({
      id: String(r[0]), month: normalizeAttachmentMonth_(r[4], r[3]), type: String(r[5]), name: String(r[6]),
      url: String(r[7] || ''), uploadedAt: formatAttachmentDate_(r[8]),
      uploadedBy: String(r[9] || ''), status: 'active', actedAt: '', actedBy: '', replacementId: '',
      sortAt: r[8] ? new Date(r[8]).getTime() : 0
    }));
  const auditSheet = ss.getSheetByName('File_Attachment_Audit');
  const archived = auditSheet ? auditSheet.getDataRange().getValues().slice(1)
    .filter(r => String(r[2]).trim() === year && String(r[1]).trim() === project)
    .map(r => ({
      id: String(r[0]), month: normalizeAttachmentMonth_(r[3], r[2]), type: String(r[4]), name: String(r[5]),
      url: '', uploadedAt: formatAttachmentDate_(r[7]), uploadedBy: String(r[8] || ''),
      status: String(r[9] || 'removed'), actedAt: formatAttachmentDate_(r[10]),
      actedBy: String(r[11] || ''), replacementId: String(r[12] || ''),
      sortAt: r[10] ? new Date(r[10]).getTime() : 0
    })) : [];
  return active.concat(archived).sort((a, b) => (b.sortAt || 0) - (a.sortAt || 0));
}

function findAttachmentRow_(sheet, fileRowId, fiscalYear, refId, monthYear) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() !== String(fileRowId).trim()) continue;
    const storedMonth = String(data[i][4]).trim();
    const requestedMonth = String(monthYear).trim();
    const sameMonth = storedMonth === requestedMonth || storedMonth === requestedMonth.replace(/\s+\d{4}$/, '');
    if (String(data[i][3]).trim() !== String(fiscalYear).trim() ||
        String(data[i][2]).trim() !== String(refId).trim() || !sameMonth) {
      throw new Error('รายการไฟล์ไม่ตรงกับโครงการหรือเดือนที่เลือก');
    }
    return { rowNumber: i + 1, values: data[i] };
  }
  throw new Error('ไม่พบรายการไฟล์ที่ต้องการ');
}

function requireAttachmentEditor_(ss, row, fiscalYear, refId) {
  const email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
  if (!email) throw new Error('ไม่สามารถยืนยันอีเมลผู้ใช้งานได้');
  if (checkAdminAccess().isAdmin || String(row.values[9] || '').trim().toLowerCase() === email) return;
  const projectSheet = ss.getSheetByName('Master_Projects');
  const project = projectSheet && projectSheet.getDataRange().getValues().slice(1)
    .find(r => String(r[0]).trim() === String(refId).trim() &&
      String(r[1]).trim() === String(fiscalYear).trim());
  const editors = project ? [project[11], project[13], project[15]]
    .map(value => String(value || '').trim().toLowerCase()) : [];
  if (!editors.includes(email)) throw new Error('เฉพาะผู้รับผิดชอบโครงการหรือแอดมินเท่านั้นที่แก้ไขไฟล์นี้ได้');
}

function archiveAttachment_(ss, row, status, replacementId) {
  const audit = getOrCreateSheet_('File_Attachment_Audit', [
    'File_ID', 'Reference_ID', 'Fiscal_Year', 'Month_Year', 'File_Type', 'File_Name',
    'Original_URL', 'Uploaded_At', 'Uploaded_By', 'Status', 'Action_At', 'Action_By', 'Replacement_ID'
  ]);
  const actor = (Session.getActiveUser().getEmail() || '').trim();
  const r = row.values;
  audit.appendRow([
    String(r[0]), String(r[2]), String(r[3]), String(r[4]), String(r[5]), String(r[6]),
    String(r[7] || ''), r[8] || '', String(r[9] || ''), status, new Date(), actor, replacementId || ''
  ]);
  return { sheet: audit, rowNumber: audit.getLastRow() };
}

function trashAttachmentDriveFile_(url) {
  const match = String(url || '').match(/\/d\/([a-zA-Z0-9_-]+)/) || String(url || '').match(/id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) DriveApp.getFileById(match[1]).setTrashed(true);
}

// นำไฟล์ออกจากรายการปัจจุบัน แต่เก็บประวัติการอัปโหลดไว้ตรวจสอบย้อนหลัง
function deleteAttachmentFile(fileRowId, fiscalYear, refId, monthYear) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
  const ss = getAppSpreadsheet();
  const fileSheet = ss.getSheetByName('File_Attachments');
  if (!fileSheet) return { success: false, message: 'ไม่พบชีท File_Attachments' };
  const row = findAttachmentRow_(fileSheet, fileRowId, fiscalYear, refId, monthYear);
  requireAttachmentEditor_(ss, row, fiscalYear, refId);
  const archived = archiveAttachment_(ss, row, 'removed', '');
  try { fileSheet.deleteRow(row.rowNumber); }
  catch (err) { archived.sheet.deleteRow(archived.rowNumber); throw err; }
  let driveWarning = false;
  try { trashAttachmentDriveFile_(row.values[7]); }
  catch (err) { console.warn('Cannot trash Drive file:', err); driveWarning = true; }
  return { success: true, message: driveWarning
    ? 'นำออกจากรายการแล้ว แต่ย้ายไฟล์ใน Drive ไปถังขยะไม่สำเร็จ กรุณาตรวจไฟล์เดิมใน Drive'
    : 'นำไฟล์ออกแล้ว และเก็บประวัติไว้' };
  } finally {
    lock.releaseLock();
  }
}

function replaceAttachmentFile(fileRowId, fiscalYear, refId, monthYear, fileObj) {
  if (!fileObj || !fileObj.base64 || !fileObj.name ||
      !(/^(application\/pdf|image\/(jpeg|png|webp|gif))$/i).test(String(fileObj.mimeType || ''))) {
    throw new Error('กรุณาเลือกไฟล์ PDF หรือรูปภาพที่ถูกต้อง');
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const ss = getAppSpreadsheet();
    const sheet = ss.getSheetByName('File_Attachments');
    if (!sheet) throw new Error('ไม่พบชีท File_Attachments');
    const old = findAttachmentRow_(sheet, fileRowId, fiscalYear, refId, monthYear);
    requireAttachmentEditor_(ss, old, fiscalYear, refId);
    const decoded = Utilities.base64Decode(String(fileObj.base64).split(',')[1]);
    const blob = Utilities.newBlob(decoded, fileObj.mimeType, fileObj.name);
    const uploaded = getOrCreateFolder_('MU_Sustainability_Attachments').createFile(blob);
    const newId = 'FILE-' + Utilities.getUuid().substring(0, 8);
    const actor = (Session.getActiveUser().getEmail() || '').trim();
    let archived = null;
    try {
      uploaded.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      if (!sheet.getRange(1, 10).getValue()) sheet.getRange(1, 10).setValue('Uploaded_By');
      sheet.appendRow([newId, 'Project', String(refId), String(fiscalYear), String(monthYear),
        String(fileObj.mimeType).startsWith('image/') ? 'รูปภาพ' : 'รายงาน',
        String(fileObj.name), uploaded.getUrl(), new Date(), actor]);
      archived = archiveAttachment_(ss, old, 'replaced', newId);
      sheet.deleteRow(old.rowNumber);
    } catch (err) {
      if (archived) archived.sheet.deleteRow(archived.rowNumber);
      const rows = sheet.getDataRange().getValues();
      for (let i = rows.length - 1; i >= 1; i--) {
        if (String(rows[i][0]) === newId) sheet.deleteRow(i + 1);
      }
      uploaded.setTrashed(true);
      throw err;
    }
    let driveWarning = false;
    try { trashAttachmentDriveFile_(old.values[7]); }
    catch (err) { console.warn('Cannot trash replaced Drive file:', err); driveWarning = true; }
    return { success: true, message: driveWarning
      ? 'แทนที่แล้ว แต่ย้ายไฟล์เดิมใน Drive ไปถังขยะไม่สำเร็จ กรุณาตรวจไฟล์เดิมใน Drive'
      : 'แทนที่ไฟล์แล้ว และเก็บประวัติไฟล์เดิมไว้' };
  } finally {
    lock.releaseLock();
  }
}


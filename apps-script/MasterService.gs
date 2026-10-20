// Admin records are archived rather than removed, so past reports remain traceable.
function adminRowSnapshot_(row) {
  return row.map(value => value instanceof Date
    ? Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')
    : value);
}

function ensureAdminColumn_(sheet, column, header) {
  const maxColumns = sheet.getMaxColumns();
  if (maxColumns < column) sheet.insertColumnsAfter(maxColumns, column - maxColumns);
  if (!String(sheet.getRange(1, column).getValue() || '').trim()) sheet.getRange(1, column).setValue(header);
}

function appendAdminChange_(area, recordKey, action, before, after) {
  const sheet = getOrCreateSheet_('Admin_Change_Log', [
    'Change_ID', 'Changed_At', 'Changed_By', 'Area', 'Record_Key', 'Action', 'Before_JSON', 'After_JSON'
  ]);
  sheet.appendRow([
    'ADM-' + Utilities.getUuid().substring(0, 12), new Date(),
    Session.getActiveUser().getEmail() || '', area, String(recordKey), action,
    JSON.stringify(before == null ? null : before), JSON.stringify(after == null ? null : after)
  ]);
}

function getAdminCenterData(fiscalYear) {
  requireAdminAccess_();
  const ss = getAppSpreadsheet();
  const read = name => {
    const sheet = ss.getSheetByName(name);
    return sheet ? sheet.getDataRange().getValues().slice(1) : [];
  };
  const budgets = read('Master_Budgets').filter(r => r[0]).map(r => ({
    year: String(r[0]).trim(), amount: Number(r[1]) || 0,
    updatedAt: r[2] instanceof Date ? Utilities.formatDate(r[2], Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm') : String(r[2] || ''),
    archived: String(r[3] || '').trim().toLowerCase() === 'archived'
  })).sort((a, b) => Number(b.year) - Number(a.year));
  const departments = read('Master_Departments').filter(r => r[0] || r[1]).map(r => ({
    id: String(r[0] || '').trim(), name: String(r[1] || '').trim(),
    headName: String(r[2] || '').trim(), headEmail: String(r[3] || '').trim(),
    createdAt: r[4] instanceof Date ? Utilities.formatDate(r[4], Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm') : String(r[4] || ''),
    archived: String(r[5] || '').trim().toLowerCase() === 'archived'
  }));
  const targetYear = String(fiscalYear || '').trim();
  const projects = read('Master_Projects').filter(r => r[0] && (!targetYear || String(r[1]).trim() === targetYear)).map(r => ({
    id: String(r[0]).trim(), fiscalYear: String(r[1] || '').trim(), name: String(r[2] || '').trim(),
    strategy: String(r[3] || '').trim(), primaryResp: String(r[4] || '').trim(), dept: String(r[5] || '').trim(),
    budget: Number(r[6]) || 0, weight: Number(r[7]) || 0, status: String(r[10] || 'Active').trim(),
    primaryEmail: String(r[11] || '').trim(), coName1: String(r[12] || '').trim(), coEmail1: String(r[13] || '').trim(),
    coName2: String(r[14] || '').trim(), coEmail2: String(r[15] || '').trim()
  }));
  const weights = getStepWeights();
  Object.keys(weights).forEach(key => { weights[key] = Math.round(weights[key] * 10000) / 100; });
  const lastWeightUpdate = read('System_Settings').find(r => r[2])?.[2];
  const weightUpdatedAt = lastWeightUpdate instanceof Date
    ? Utilities.formatDate(lastWeightUpdate, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm') : String(lastWeightUpdate || '');
  const allHistory = read('Admin_Change_Log').filter(r => r[0]);
  const history = allHistory.slice(-150).reverse().map(r => ({
    id: String(r[0]), at: r[1] instanceof Date ? Utilities.formatDate(r[1], Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss') : String(r[1] || ''),
    actor: String(r[2] || ''), area: String(r[3] || ''), key: String(r[4] || ''), action: String(r[5] || ''),
    before: String(r[6] || 'null'), after: String(r[7] || 'null')
  }));
  return JSON.stringify({ budgets, departments, projects, weights, weightUpdatedAt, history, historyHasMore: allHistory.length > history.length });
}

function getAdminHistoryPage(offset, pageSize) {
  requireAdminAccess_();
  const sheet = getAppSpreadsheet().getSheetByName('Admin_Change_Log');
  const rows = sheet ? sheet.getDataRange().getValues().slice(1).filter(r => r[0]) : [];
  const skip = Math.max(0, Number(offset) || 0);
  const take = Math.min(150, Math.max(1, Number(pageSize) || 150));
  const end = Math.max(0, rows.length - skip);
  const start = Math.max(0, end - take);
  return JSON.stringify({
    rows: rows.slice(start, end).reverse().map(r => ({
      id: String(r[0]), at: r[1] instanceof Date ? Utilities.formatDate(r[1], Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss') : String(r[1] || ''),
      actor: String(r[2] || ''), area: String(r[3] || ''), key: String(r[4] || ''), action: String(r[5] || ''),
      before: String(r[6] || 'null'), after: String(r[7] || 'null')
    })),
    hasMore: start > 0
  });
}

function setAdminBudgetArchived(fiscalYear, archived) {
  requireAdminAccess_();
  const year = String(fiscalYear || '').trim();
  const ss = getAppSpreadsheet();
  const sheet = ss.getSheetByName('Master_Budgets');
  if (!sheet) throw new Error('ไม่พบข้อมูลงบประมาณ');
  if (archived) {
    const projects = ss.getSheetByName('Master_Projects');
    const rows = projects ? projects.getDataRange().getValues().slice(1) : [];
    if (rows.some(r => String(r[1]).trim() === year && r[0] && String(r[10] || '').trim() !== 'Cancelled')) {
      throw new Error('ปีงบนี้ยังมีโครงการที่ใช้งานอยู่ กรุณาจัดการโครงการก่อนนำงบออก');
    }
  }
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() !== year) continue;
    const before = adminRowSnapshot_(rows[i]);
    ensureAdminColumn_(sheet, 4, 'Status');
    sheet.getRange(i + 1, 4).setValue(archived ? 'Archived' : 'Active');
    const after = adminRowSnapshot_(sheet.getRange(i + 1, 1, 1, Math.max(4, sheet.getLastColumn())).getValues()[0]);
    appendAdminChange_('budget', year, archived ? 'ARCHIVE' : 'RESTORE', before, after);
    return { success: true, message: archived ? 'นำงบประมาณออกจากการใช้งานแล้ว' : 'คืนงบประมาณแล้ว' };
  }
  throw new Error('ไม่พบปีงบประมาณที่เลือก');
}

function setAdminDepartmentArchived(departmentId, archived) {
  requireAdminAccess_();
  const id = String(departmentId || '').trim();
  const ss = getAppSpreadsheet();
  const sheet = ss.getSheetByName('Master_Departments');
  if (!sheet) throw new Error('ไม่พบข้อมูลหน่วยงาน');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() !== id) continue;
    const name = String(rows[i][1] || '').trim();
    if (archived) {
      const projects = ss.getSheetByName('Master_Projects');
      const projectRows = projects ? projects.getDataRange().getValues().slice(1) : [];
      if (projectRows.some(r => String(r[5] || '').trim() === name && r[0] && String(r[10] || '').trim() !== 'Cancelled')) {
        throw new Error('หน่วยงานนี้ยังรับผิดชอบโครงการที่ใช้งานอยู่ กรุณาย้ายหรือจัดการโครงการก่อน');
      }
    }
    const before = adminRowSnapshot_(rows[i]);
    ensureAdminColumn_(sheet, 6, 'Status');
    sheet.getRange(i + 1, 6).setValue(archived ? 'Archived' : 'Active');
    const after = adminRowSnapshot_(sheet.getRange(i + 1, 1, 1, Math.max(6, sheet.getLastColumn())).getValues()[0]);
    appendAdminChange_('department', id, archived ? 'ARCHIVE' : 'RESTORE', before, after);
    return { success: true, message: archived ? 'นำหน่วยงานออกจากการใช้งานแล้ว' : 'คืนหน่วยงานแล้ว' };
  }
  throw new Error('ไม่พบหน่วยงานที่เลือก');
}

function setAdminProjectArchived(fiscalYear, projectId, archived) {
  requireAdminAccess_();
  const year = String(fiscalYear || '').trim();
  const id = String(projectId || '').trim();
  const sheet = getAppSpreadsheet().getSheetByName('Master_Projects');
  if (!sheet) throw new Error('ไม่พบข้อมูลโครงการ');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() !== id || String(rows[i][1]).trim() !== year) continue;
    const before = adminRowSnapshot_(rows[i]);
    if (archived) {
      if (sheet.getRange(1, 17).getValue() === '') sheet.getRange(1, 17).setValue('Status_Before_Archive');
      sheet.getRange(i + 1, 17).setValue(String(rows[i][10] || 'Active'));
      sheet.getRange(i + 1, 11).setValue('Cancelled');
    } else {
      sheet.getRange(i + 1, 11).setValue(String(rows[i][16] || 'Active'));
      if (sheet.getLastColumn() >= 17) sheet.getRange(i + 1, 17).clearContent();
    }
    const after = adminRowSnapshot_(sheet.getRange(i + 1, 1, 1, sheet.getLastColumn()).getValues()[0]);
    appendAdminChange_('project', year + '/' + id, archived ? 'ARCHIVE' : 'RESTORE', before, after);
    return { success: true, message: archived ? 'นำโครงการออกจากการติดตามแล้ว ข้อมูลเดิมยังอยู่' : 'คืนโครงการเข้าระบบแล้ว' };
  }
  throw new Error('ไม่พบโครงการที่เลือก');
}

const DEFAULT_STEP_WEIGHTS = { draft: 0.05, approval: 0.05, execute: 0.75, disburse: 0.05, report: 0.10 };

// Supports both earlier System_Settings layouts: draft=5 and weight_draft=0.05.
function getStepWeights() {
  const weights = Object.assign({}, DEFAULT_STEP_WEIGHTS);
  const sheet = getAppSpreadsheet().getSheetByName('System_Settings');
  if (!sheet) return weights;

  const rows = sheet.getDataRange().getValues().slice(1);
  const legacy = {};
  const current = {};
  rows.forEach(row => {
    const key = String(row[0] || '').trim();
    if (row[1] === '' || row[1] === null || row[1] === undefined) return;
    const value = Number(row[1]);
    if (!Number.isFinite(value)) return;
    if (Object.prototype.hasOwnProperty.call(weights, key) && value >= 0 && value <= 100) current[key] = value / 100;
    if (key.startsWith('weight_')) {
      const step = key.slice(7);
      if (Object.prototype.hasOwnProperty.call(weights, step) && value >= 0 && value <= 1) legacy[step] = value;
    }
  });
  Object.assign(weights, legacy, current);
  return weights;
}

function updateStepWeights(payload) {
  requireAdminAccess_();
  const steps = Object.keys(DEFAULT_STEP_WEIGHTS);
  const values = {};
  steps.forEach(step => {
    const value = Number(payload[step]);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new Error('ค่าน้ำหนักแต่ละขั้นตอนต้องอยู่ระหว่าง 0 ถึง 100');
    }
    values[step] = value;
  });
  const total = steps.reduce((sum, step) => sum + values[step], 0);
  if (Math.abs(total - 100) > 0.001) throw new Error('ผลรวมค่าน้ำหนักต้องเท่ากับ 100%');

  const sheet = getOrCreateSheet_('System_Settings', ['Key', 'Weight_Percent', 'Updated_At']);
  const rows = sheet.getDataRange().getValues();
  const now = new Date();
  steps.forEach(step => {
    let rowNumber = -1;
    let key = step;
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).trim() === step) { rowNumber = i + 1; break; }
    }
    if (rowNumber < 0) {
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).trim() === 'weight_' + step) {
          rowNumber = i + 1;
          key = 'weight_' + step;
          break;
        }
      }
    }
    const storedValue = key === step ? values[step] : values[step] / 100;
    if (rowNumber > 0) {
      sheet.getRange(rowNumber, 2).setValue(storedValue);
      if (sheet.getLastColumn() >= 3) sheet.getRange(rowNumber, 3).setValue(now);
    } else {
      sheet.appendRow([step, values[step], now]);
    }
  });
  return { success: true, message: 'บันทึกค่าน้ำหนักขั้นตอนใหม่สำเร็จ' };
}

function setMasterBudget(fiscalYear, totalBudget) {
  requireAdminAccess_();
  const year = String(fiscalYear || '').trim();
  const budget = Number(totalBudget);
  if (!year || !Number.isFinite(budget) || budget < 0) throw new Error('ปีงบประมาณหรือวงเงินไม่ถูกต้อง');
  const sheet = getOrCreateSheet_('Master_Budgets', ['Fiscal_Year', 'Total_Budget_THB', 'Updated_At']);
  const rows = sheet.getDataRange().getValues();
  let rowNumber = -1;
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]).trim() === year) { rowNumber = i + 1; break; }
  }
  if (rowNumber > 0) {
    sheet.getRange(rowNumber, 2).setValue(budget);
    if (sheet.getLastColumn() >= 3) sheet.getRange(rowNumber, 3).setValue(new Date());
  } else {
    sheet.appendRow([year, budget, new Date()]);
  }
  return { success: true, message: 'บันทึกงบประมาณรวมปี ' + year + ' เรียบร้อยแล้ว' };
}

function addDepartment(payload) {
  requireAdminAccess_();
  const name = String(payload.deptName || '').trim();
  if (!name) throw new Error('กรุณาระบุชื่อหน่วยงาน');
  const requestedId = String(payload.deptId || '').trim();
  const sheet = getOrCreateSheet_('Master_Departments', ['Department_ID', 'Department_Name', 'Head_Name', 'Head_Email']);
  const rows = sheet.getDataRange().getValues();
  let rowNumber = -1;
  for (let i = 1; i < rows.length; i++) {
    const rowId = String(rows[i][0] || '').trim();
    const rowName = String(rows[i][1] || '').trim();
    if ((requestedId && rowId === requestedId) || rowName.toLowerCase() === name.toLowerCase()) {
      rowNumber = i + 1;
      break;
    }
  }
  if (rowNumber > 0) {
    sheet.getRange(rowNumber, 2, 1, 3).setValues([[name, payload.headName || '', payload.headEmail || '']]);
    return { success: true, message: 'อัปเดตข้อมูลหน่วยงานเรียบร้อยแล้ว' };
  }
  sheet.appendRow([requestedId || 'DEP-' + Utilities.getUuid().substring(0, 6), name, payload.headName || '', payload.headEmail || '']);
  return { success: true, message: 'เพิ่มหน่วยงานเรียบร้อยแล้ว' };
}

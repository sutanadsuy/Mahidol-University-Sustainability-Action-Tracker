
/* ConfigService.gs */
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


/* ProjectService.gs */
function getInitialBootstrapData(fiscalYear) {
  const targetYear = String(fiscalYear || '2569').trim();
  const ss = getAppSpreadsheet();
  const prjSheet = ss.getSheetByName('Master_Projects');
  const bgtSheet = ss.getSheetByName('Master_Budgets');
  const deptSheet = ss.getSheetByName('Master_Departments');

  const userAccess = checkAdminAccess();

  let projects = [];
  if (prjSheet) {
    const prjRows = prjSheet.getDataRange().getValues();
    for (let i = 1; i < prjRows.length; i++) {
      const r = prjRows[i];
      if (!r[0]) continue;

      const rowYear = String(r[1] || '').trim();
      const status = String(r[10] || '').trim();

      if ((rowYear === targetYear || rowYear === '') && status !== 'Cancelled') {
        projects.push({
          id: String(r[0]).trim(),
          fiscalYear: rowYear || targetYear,
          name: String(r[2] || '').trim(),
          strategy: String(r[3] || '').trim(),
          primaryResp: String(r[4] || '').trim(),
          dept: String(r[5] || '').trim(),
          budget: Number(r[6]) || 0,
          weight: Number(r[7]) || 0,
          status: status || 'Active',
          primaryEmail: String(r[11] || '').trim(),
          coName1: String(r[12] || '').trim(),
          coEmail1: String(r[13] || '').trim(),
          coName2: String(r[14] || '').trim(),
          coEmail2: String(r[15] || '').trim()
        });
      }
    }
  }

  let departments = [];
  if (deptSheet) {
    const deptRows = deptSheet.getDataRange().getValues();
    for (let i = 1; i < deptRows.length; i++) {
      if (deptRows[i][1]) {
        departments.push({
          id: String(deptRows[i][0] || '').trim(),
          name: String(deptRows[i][1]).trim(),
          headName: String(deptRows[i][2] || '').trim(),
          headEmail: String(deptRows[i][3] || '').trim()
        });
      }
    }
  }

  let totalMasterBudget = 0;
  if (bgtSheet) {
    const bgtData = bgtSheet.getDataRange().getValues().slice(1);
    const found = bgtData.find(r => String(r[0]).trim() === targetYear);
    if (found) totalMasterBudget = Number(found[1]) || 0;
  }

  const currentWeights = getStepWeights();

  return {
    userAccess: userAccess,
    master: { projects, departments, totalMasterBudget },
    weights: {
      draft: currentWeights.draft * 100,
      approval: currentWeights.approval * 100,
      execute: currentWeights.execute * 100,
      disburse: currentWeights.disburse * 100,
      report: currentWeights.report * 100
    }
  };
}

function getMasterLists(fiscalYear) {
  return getInitialBootstrapData(fiscalYear).master;
}

// บันทึกโครงการใหม่ หรืออัปเดตข้อมูลทับแถวเดิมหากมีอยู่แล้ว
function addNewMasterItem(payload) {
  requireAdminAccess_();
  const ss = getAppSpreadsheet();
  const sheet = getOrCreateSheet_('Master_Projects', [
    'Project_ID', 'Fiscal_Year', 'Project_Name', 'Strategy', 'Responsible_Person',
    'Department', 'Budget_Allocated', 'Weight_Percent', 'Start_Date', 'End_Date',
    'Status', 'Primary_Email', 'Co_Name_1', 'Co_Email_1', 'Co_Name_2', 'Co_Email_2'
  ]);

  const targetId = String(payload.id).trim();
  const targetYear = String(payload.fiscalYear).trim();
  const data = sheet.getDataRange().getValues();
  let foundRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === targetId && String(data[i][1]).trim() === targetYear) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > 0) {
    // โหมดแก้ไข: อัปเดตข้อมูลทับแถวเดิม โดยคงค่า Strategy, Start_Date, End_Date, Status เดิมไว้
    sheet.getRange(foundRow, 3).setValue(payload.name);
    sheet.getRange(foundRow, 5).setValue(payload.responsible);
    sheet.getRange(foundRow, 6).setValue(payload.department);
    sheet.getRange(foundRow, 7).setValue(Number(payload.budget) || 0);
    sheet.getRange(foundRow, 8).setValue(Number(payload.weight) || 0);
    sheet.getRange(foundRow, 12).setValue(payload.primaryEmail);
    sheet.getRange(foundRow, 13).setValue(payload.coName1 || '');
    sheet.getRange(foundRow, 14).setValue(payload.coEmail1 || '');
    sheet.getRange(foundRow, 15).setValue(payload.coName2 || '');
    sheet.getRange(foundRow, 16).setValue(payload.coEmail2 || '');
    return { success: true, message: `อัปเดตข้อมูลโครงการ ${targetId} สำเร็จเรียบร้อยแล้ว` };
  } else {
    // โหมดเพิ่มใหม่
    sheet.appendRow([
      targetId, targetYear, payload.name, '', payload.responsible,
      payload.department, Number(payload.budget) || 0, Number(payload.weight) || 0,
      '', '', 'Active',
      payload.primaryEmail, payload.coName1 || '', payload.coEmail1 || '', payload.coName2 || '', payload.coEmail2 || ''
    ]);
    return { success: true, message: `เพิ่มโครงการ ${targetId} เข้าสู่ฐานข้อมูลสำเร็จ` };
  }
}

function saveAnnualPlan(payloadList, projectTimeline, masterProcureItems, savingsReason, sdgAlignments) {
  const ss = getAppSpreadsheet();
  const sheet = ss.getSheetByName('Monthly_Progress');
  const prjSheet = ss.getSheetByName('Master_Projects');
  const mProcSheet = getOrCreateSheet_('Master_Procure_Plan', ['Plan_Item_ID', 'Category', 'Reference_ID', 'Fiscal_Year', 'Item_Name', 'Approved_Budget_THB', 'Savings_Reason', 'Created_At']);
  const now = new Date();
  const user = projectTimeline.submitterEmail || Session.getActiveUser().getEmail() || 'Anonymous';

  if (prjSheet) {
    const prjData = prjSheet.getDataRange().getValues();
    let strategyStr = '';
    if (sdgAlignments && sdgAlignments.length > 0) {
      strategyStr = sdgAlignments.map(s => s.desc ? `${s.sdgId} (${s.desc})` : s.sdgId).join(' | ');
    }

    for (let i = 1; i < prjData.length; i++) {
      if (prjData[i][0] === projectTimeline.refId && String(prjData[i][1]).trim() === String(projectTimeline.fiscalYear).trim()) {
        if (strategyStr) {
          prjSheet.getRange(i + 1, 4).setValue(strategyStr);
        }
        prjSheet.getRange(i + 1, 9).setValue(projectTimeline.startText);
        prjSheet.getRange(i + 1, 10).setValue(projectTimeline.endText);
        break;
      }
    }
  }

  const mProcData = mProcSheet.getDataRange().getValues();
  const headers = mProcData[0] || ['Plan_Item_ID', 'Category', 'Reference_ID', 'Fiscal_Year', 'Item_Name', 'Approved_Budget_THB', 'Savings_Reason', 'Created_At'];
  const remainingMProc = mProcData.slice(1).filter(r => !(String(r[3]).trim() === String(projectTimeline.fiscalYear).trim() && r[2] === projectTimeline.refId));

  const newMProcRows = [];
  if (masterProcureItems && masterProcureItems.length > 0) {
    masterProcureItems.forEach(item => {
      newMProcRows.push([
        'MPROC-' + Utilities.getUuid().substring(0, 8),
        'Project',
        projectTimeline.refId,
        String(projectTimeline.fiscalYear).trim(),
        item.name,
        Number(item.budget) || 0,
        savingsReason || '',
        now
      ]);
    });
  }

  const combinedMProc = [headers, ...remainingMProc, ...newMProcRows];
  mProcSheet.clearContents();
  mProcSheet.getRange(1, 1, combinedMProc.length, combinedMProc[0].length).setValues(combinedMProc);

  const data = sheet.getDataRange().getValues();
  payloadList.forEach(p => {
    let foundRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][3]).trim() === String(p.fiscalYear).trim() && data[i][2] === p.refId && String(data[i][4]).trim() === String(p.actualYear).trim() && data[i][5] === p.month) {
        foundRow = i + 1;
        break;
      }
    }

    if (foundRow > 0) {
      sheet.getRange(foundRow, 7).setValue(Number(p.draftPlan) || 0);
      sheet.getRange(foundRow, 9).setValue(Number(p.approvalPlan) || 0);
      sheet.getRange(foundRow, 11).setValue(Number(p.procurePlan) || 0);
      sheet.getRange(foundRow, 13).setValue(Number(p.executePlan) || 0);
      sheet.getRange(foundRow, 15).setValue(Number(p.disbursePlan) || 0);
      sheet.getRange(foundRow, 17).setValue(Number(p.reportPlan) || 0);
      sheet.getRange(foundRow, 21).setValue(now);
      sheet.getRange(foundRow, 22).setValue(user);
    } else {
      sheet.appendRow([
        'LOG-' + Utilities.getUuid().substring(0, 8),
        'Project', p.refId, String(p.fiscalYear).trim(), String(p.actualYear).trim(), p.month,
        Number(p.draftPlan) || 0, 0,
        Number(p.approvalPlan) || 0, 0,
        Number(p.procurePlan) || 0, 0,
        Number(p.executePlan) || 0, 0,
        Number(p.disbursePlan) || 0, 0,
        Number(p.reportPlan) || 0, 0,
        '', '', now, user
      ]);
    }
  });
  return { success: true, message: 'บันทึกแผนงาน, รายการพัสดุ และเป้าหมาย SDGs เรียบร้อยแล้ว' };
}

function getExistingProjectPlan(fiscalYear, refId) {
  const ss = getAppSpreadsheet();
  const sheet = ss.getSheetByName('Monthly_Progress');
  const prjSheet = ss.getSheetByName('Master_Projects');
  const mProcSheet = ss.getSheetByName('Master_Procure_Plan');
  const data = sheet ? sheet.getDataRange().getValues().slice(1) : [];
  const mProcData = mProcSheet ? mProcSheet.getDataRange().getValues().slice(1) : [];

  const targetFY = String(fiscalYear).trim();
  const filtered = data.filter(r => String(r[3]).trim() === targetFY && r[2] === refId);
  const mProcFiltered = mProcData.filter(r => String(r[3]).trim() === targetFY && r[2] === refId);

  const masterProcureList = mProcFiltered.map(r => ({ name: r[4], budget: Number(r[5]) || 0 }));
  const savingsReason = mProcFiltered.length > 0 ? (mProcFiltered[0][6] || '') : '';

  let sdgList = [];
  if (prjSheet) {
    const prjData = prjSheet.getDataRange().getValues();
    const foundPrj = prjData.find(r => r[0] === refId && String(r[1]).trim() === targetFY);
    if (foundPrj && foundPrj[3]) {
      const parts = String(foundPrj[3]).split('|');
      parts.forEach(p => {
        const match = p.trim().match(/(SDG\s*\d+)(?:\s*\((.*?)\))?/i);
        if (match) {
          sdgList.push({
            sdgId: match[1].toUpperCase(),
            desc: match[2] || ''
          });
        }
      });
    }
  }

  if (filtered.length === 0) {
    return { hasData: false, planList: [], masterProcureList, savingsReason, sdgList };
  }

  const planList = filtered.map(r => ({
    actualYear: Number(r[4]),
    month: r[5],
    monthVal: CALENDAR_MONTHS.indexOf(r[5]) + 1,
    draftPlan: Number(r[6]) || 0,
    approvalPlan: Number(r[8]) || 0,
    procurePlan: Number(r[10]) || 0,
    executePlan: Number(r[12]) || 0,
    disbursePlan: Number(r[14]) || 0,
    reportPlan: Number(r[16]) || 0
  })).sort((a, b) => (a.actualYear * 12 + a.monthVal) - (b.actualYear * 12 + b.monthVal));

  return {
    hasData: true,
    startMonthVal: planList[0].monthVal,
    startYear: planList[0].actualYear,
    endMonthVal: planList[planList.length - 1].monthVal,
    endYear: planList[planList.length - 1].actualYear,
    planList,
    masterProcureList,
    savingsReason,
    sdgList
  };
}


/* ActualService.gs */
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



/* DashboardService.gs */
function getDashboardReport(fiscalYear, dept, refId, asOfMonthKey) {
  const targetFY = String(fiscalYear || '2569').trim();
  const ss = getAppSpreadsheet();
  const progressSheet = ss.getSheetByName('Monthly_Progress');
  const fileSheet = ss.getSheetByName('File_Attachments');
  const prjSheet = ss.getSheetByName('Master_Projects');
  const expSheet = ss.getSheetByName('Expense_Items');
  const bgtSheet = ss.getSheetByName('Master_Budgets');

  const progressData = progressSheet ? progressSheet.getDataRange().getValues().slice(1) : [];
  const fileData = fileSheet ? fileSheet.getDataRange().getValues().slice(1) : [];
  const expenseData = expSheet ? expSheet.getDataRange().getValues().slice(1) : [];

  const stepWeights = getStepWeights();

  let masterTotalBudget = 0;
  if (bgtSheet) {
    const bRow = bgtSheet.getDataRange().getValues().slice(1).find(r => String(r[0]).trim() === targetFY);
    if (bRow) masterTotalBudget = Number(bRow[1]) || 0;
  }

  const rawMaster = prjSheet ? prjSheet.getDataRange().getValues().slice(1) : [];
  let masterList = rawMaster.filter(r => {
    const rowId = String(r[0] || '').trim();
    const rowYear = String(r[1] || '').trim();
    const status = String(r[10] || '').trim();
    return rowId && (rowYear === targetFY || rowYear === '') && status !== 'Cancelled';
  });

  if (dept && dept !== 'ALL') {
    masterList = masterList.filter(r => String(r[5] || '').trim() === dept);
  }

  const cleanRef = String(refId || 'ALL').trim();
  const isAll = (cleanRef === 'ALL' || cleanRef === '' || cleanRef.startsWith('--'));

  let chartTimeline = [];
  const masterIds = masterList.map(m => String(m[0]).trim());

  const relevantProgressRows = progressData.filter(r => {
    const matchYear = String(r[3]).trim() === targetFY;
    const pId = String(r[2]).trim();
    const matchRef = isAll ? masterIds.includes(pId) : pId === cleanRef;
    return matchYear && matchRef;
  });

  const fyNum = Number(targetFY) || 2569;
  const startYearCal = fyNum - 1;
  let minVal = startYearCal * 12 + 10;
  let maxVal = startYearCal * 12 + 21;

  let maxDataVal = -1;

  relevantProgressRows.forEach(r => {
    const rY = Number(r[4]);
    const rM = String(r[5]).trim();
    const mIdx = CALENDAR_MONTHS.indexOf(rM) + 1;
    if (rY && mIdx > 0) {
      const val = rY * 12 + mIdx;
      if (val < minVal) minVal = val;
      if (val > maxVal) maxVal = val;

      const hasActual = (Number(r[7]) > 0 || Number(r[9]) > 0 || Number(r[13]) > 0 || Number(r[15]) > 0 || Number(r[17]) > 0 || String(r[18]).trim() !== '');
      if (hasActual && val > maxDataVal) {
        maxDataVal = val;
      }
    }
  });

  let curVal = minVal;
  while (curVal <= maxVal) {
    const mIndexZero = (curVal - 1) % 12;
    const mName = CALENDAR_MONTHS[mIndexZero];
    const curY = Math.floor((curVal - 1) / 12);

    chartTimeline.push({
      mName: mName,
      yNum: curY,
      key: `${mName} ${curY}`,
      label: `${mName} ${String(curY).slice(-2)}`,
      val: curVal
    });
    curVal++;
  }

  let cutOffVal = 999999;
  let selectedMonthObj = null;
  if (asOfMonthKey && asOfMonthKey !== 'ALL') {
    const foundCut = chartTimeline.find(t => t.key === asOfMonthKey || t.label === asOfMonthKey);
    if (foundCut) {
      cutOffVal = foundCut.val;
      selectedMonthObj = foundCut;
    }
  } else {
    if (maxDataVal !== -1) {
      cutOffVal = maxDataVal;
      selectedMonthObj = chartTimeline.find(t => t.val === cutOffVal);
    }
  }

  const timelineLabels = chartTimeline.map(t => t.label);
  const planMonthly = new Array(chartTimeline.length).fill(0);
  const actualMonthly = new Array(chartTimeline.length).fill(0);
  const procurePlanMonthly = new Array(chartTimeline.length).fill(0);
  const procureActualMonthly = new Array(chartTimeline.length).fill(0);

  const totalProjectsCount = masterList.length || 1;
  let totalMasterWeight = 0;
  const projectWeightMap = {};

  masterList.forEach(m => {
    const w = Number(m[7]) || 0;
    projectWeightMap[String(m[0]).trim()] = w;
    totalMasterWeight += w;
  });

  relevantProgressRows.forEach(r => {
    const rowY = Number(r[4]);
    const rowM = String(r[5]).trim();
    const tIdx = chartTimeline.findIndex(t => t.yNum === rowY && t.mName === rowM);

    if (tIdx !== -1) {
      const pId = String(r[2]).trim();
      let pWeightFactor = 1.0;
      if (isAll) {
        if (totalMasterWeight > 0 && (projectWeightMap[pId] || 0) > 0) {
          pWeightFactor = projectWeightMap[pId] / totalMasterWeight;
        } else {
          pWeightFactor = 1.0 / totalProjectsCount;
        }
      }

      const mPlan = (
        ((Number(r[6])||0) * stepWeights.draft) +
        ((Number(r[8])||0) * stepWeights.approval) +
        ((Number(r[12])||0) * stepWeights.execute) +
        ((Number(r[14])||0) * stepWeights.disburse) +
        ((Number(r[16])||0) * stepWeights.report)
      ) * pWeightFactor;

      const mActual = (
        ((Number(r[7])||0) * stepWeights.draft) +
        ((Number(r[9])||0) * stepWeights.approval) +
        ((Number(r[13])||0) * stepWeights.execute) +
        ((Number(r[15])||0) * stepWeights.disburse) +
        ((Number(r[17])||0) * stepWeights.report)
      ) * pWeightFactor;

      planMonthly[tIdx] += (Number(mPlan) || 0);
      actualMonthly[tIdx] += (Number(mActual) || 0);
      procurePlanMonthly[tIdx] += (Number(r[10]) || 0);
      procureActualMonthly[tIdx] += (Number(r[11]) || 0);
    }
  });

  let overallPlanAcc = [];
  let overallActualAcc = [];
  let procurePlanAcc = [];
  let procureActualAcc = [];
  let sumP = 0, sumA = 0, sumExpP = 0, sumExpA = 0;

  for (let i = 0; i < chartTimeline.length; i++) {
    sumP += (planMonthly[i] || 0);
    sumA += (actualMonthly[i] || 0);
    sumExpP += (procurePlanMonthly[i] || 0);
    sumExpA += (procureActualMonthly[i] || 0);

    overallPlanAcc.push(Number(Math.min(sumP, 100).toFixed(2)) || 0);
    overallActualAcc.push(Number(Math.min(sumA, 100).toFixed(2)) || 0);
    procurePlanAcc.push(sumExpP || 0);
    procureActualAcc.push(sumExpA || 0);
  }

  let completedCount = 0;
  let onTrackCount = 0;
  let delayedCount = 0;
  let revisingCount = 0;
  let totalSpentBudget = 0;
  let projectStatusList = [];
  let completedProjectsList = [];
  let onTrackProjectsList = [];
  let pendingSubmissionsList = [];

  const sdgCountMap = {};
  const SDG_COLOR_PALETTE = {
    'SDG 1': '#E5243B', 'SDG 2': '#DDA63A', 'SDG 3': '#4C9F38', 'SDG 4': '#C5192D',
    'SDG 5': '#FF3A21', 'SDG 6': '#26BDE2', 'SDG 7': '#FCC30B', 'SDG 8': '#A21942',
    'SDG 9': '#FD6925', 'SDG 10': '#DD1367', 'SDG 11': '#FD9D24', 'SDG 12': '#BF8B2E',
    'SDG 13': '#3F7E44', 'SDG 14': '#0A97D9', 'SDG 15': '#56C02B', 'SDG 16': '#00689D',
    'SDG 17': '#19486A', 'ไม่ระบุ SDG': '#94A3B8'
  };

  masterList.forEach(item => {
    const pId = String(item[0]).trim();
    const pName = String(item[2] || '').trim();
    const pStrat = String(item[3] || '').trim();
    const pBudget = Number(item[6]) || 0;
    const currentStatus = String(item[10] || 'Active').trim();

    if (pStrat && pStrat !== '-') {
      const matchedSdgs = pStrat.match(/SDG\s*\d+/gi);
      if (matchedSdgs && matchedSdgs.length > 0) {
        const uniqueSdgsInProject = [...new Set(matchedSdgs.map(s => s.toUpperCase().replace(/\s+/g, ' ')))];
        uniqueSdgsInProject.forEach(sdgKey => {
          sdgCountMap[sdgKey] = (sdgCountMap[sdgKey] || 0) + 1;
        });
      } else {
        sdgCountMap['ไม่ระบุ SDG'] = (sdgCountMap['ไม่ระบุ SDG'] || 0) + 1;
      }
    } else {
      sdgCountMap['ไม่ระบุ SDG'] = (sdgCountMap['ไม่ระบุ SDG'] || 0) + 1;
    }

    let pPlan = 0, pAct = 0, pSpent = 0, lastDelay = '';
    let hasReportedInCutOff = false;

    progressData.filter(r => String(r[3]).trim() === targetFY && String(r[2]).trim() === pId).forEach(r => {
      const rowVal = (Number(r[4]) * 12) + (CALENDAR_MONTHS.indexOf(String(r[5]).trim()) + 1);

      if (rowVal <= cutOffVal) {
        pPlan += ((Number(r[6])||0)*stepWeights.draft) + ((Number(r[8])||0)*stepWeights.approval) + ((Number(r[12])||0)*stepWeights.execute) + ((Number(r[14])||0)*stepWeights.disburse) + ((Number(r[16])||0)*stepWeights.report);
        pAct += ((Number(r[7])||0)*stepWeights.draft) + ((Number(r[9])||0)*stepWeights.approval) + ((Number(r[13])||0)*stepWeights.execute) + ((Number(r[15])||0)*stepWeights.disburse) + ((Number(r[17])||0)*stepWeights.report);
        pSpent += Number(r[11]) || 0;
        if (r[19]) lastDelay = String(r[19]);
      }

      if (rowVal === cutOffVal && (Number(r[7]) > 0 || Number(r[9]) > 0 || Number(r[13]) > 0 || Number(r[15]) > 0 || Number(r[17]) > 0 || String(r[18]).trim() !== '')) {
        hasReportedInCutOff = true;
      }
    });

    totalSpentBudget += pSpent;
    const diff = Number((pAct - pPlan).toFixed(2));
    let status = 'On Track';

    if (currentStatus === 'Paused' || currentStatus === 'Revising') {
      status = 'Revising';
      revisingCount++;
    } else if (pAct >= 100) {
      status = 'Completed';
      completedCount++;
      completedProjectsList.push({ id: pId, name: pName, budget: pBudget, spent: pSpent, act: Number(Math.min(pAct, 100).toFixed(2)) });
    } else if (diff < 0) {
      status = 'Delayed';
      delayedCount++;
    } else {
      onTrackCount++;
      onTrackProjectsList.push({ id: pId, name: pName, budget: pBudget, spent: pSpent, act: Number(Math.min(pAct, 100).toFixed(2)), plan: Number(Math.min(pPlan, 100).toFixed(2)) });
    }

    if (!hasReportedInCutOff && currentStatus === 'Active' && pAct < 100) {
      pendingSubmissionsList.push({ id: pId, name: pName, resp: String(item[4] || '-'), email: String(item[11] || '-') });
    }

    projectStatusList.push({
      id: pId,
      name: pName,
      budget: pBudget,
      spent: pSpent,
      balance: pBudget - pSpent,
      plan: Number(Math.min(pPlan, 100).toFixed(2)),
      act: Number(Math.min(pAct, 100).toFixed(2)),
      diff: diff,
      status: status,
      delayReason: lastDelay
    });
  });

  const sortedSdgEntries = Object.entries(sdgCountMap).sort((a, b) => {
    if (a[0] === 'ไม่ระบุ SDG') return 1;
    if (b[0] === 'ไม่ระบุ SDG') return -1;
    return b[1] - a[1];
  });

  const sortedLabels = sortedSdgEntries.map(e => e[0]);
  const sortedValues = sortedSdgEntries.map(e => e[1]);
  const sortedColors = sortedLabels.map(label => SDG_COLOR_PALETTE[label] || '#0D6EFD');

  let asOfPlanOverall = 0;
  let asOfActOverall = 0;
  const cutIdx = chartTimeline.findIndex(t => t.val === cutOffVal);
  if (cutIdx !== -1) {
    asOfPlanOverall = overallPlanAcc[cutIdx] || 0;
    asOfActOverall = overallActualAcc[cutIdx] || 0;
  } else {
    asOfPlanOverall = overallPlanAcc[overallPlanAcc.length - 1] || 0;
    asOfActOverall = overallActualAcc[overallActualAcc.length - 1] || 0;
  }

  let selectedTeam = null;
  let singleProjectMetrics = null;
  let singleProjectSummary = '';
  let singleProjectName = ''; // ส่งชื่อโครงการเด่นชัด
  let singleProjectId = '';   // รหัสโครงการ
  let latestActivityImageUrl = '';
  let latestActivityImageMonth = '';
  let singleProjectSdgs = [];

  if (!isAll) {
    const foundItem = masterList.find(r => String(r[0]).trim() === cleanRef);
    const foundStatus = projectStatusList.find(p => String(p.id).trim() === cleanRef);
    if (foundItem) {
      singleProjectId = String(foundItem[0]).trim();
      singleProjectName = String(foundItem[2] || '').trim();

      selectedTeam = {
        primaryResp: foundItem[4], primaryEmail: foundItem[11],
        coName1: foundItem[12], coEmail1: foundItem[13],
        coName2: foundItem[14], coEmail2: foundItem[15]
      };

      const rawStrat = String(foundItem[3] || '').trim();
      if (rawStrat && rawStrat !== '-') {
        const parts = rawStrat.split('|');
        parts.forEach(p => {
          const match = p.trim().match(/(SDG\s*\d+)(?:\s*\((.*?)\))?/i);
          if (match) {
            const sdgId = match[1].toUpperCase().replace(/\s+/g, ' ');
            singleProjectSdgs.push({
              sdgId: sdgId,
              desc: match[2] || 'ไม่มีคำอธิบายเพิ่มเติม',
              color: SDG_COLOR_PALETTE[sdgId] || '#0D6EFD'
            });
          }
        });
      }
    }

    if (foundStatus) {
      let finalStatusText = 'อยู่ระหว่างดำเนินโครงการ';
      if (foundStatus.act >= 100) finalStatusText = 'ดำเนินการแล้วเสร็จ';
      else if (foundStatus.status === 'Revising') finalStatusText = 'อยู่ระหว่างปรับรูปแบบ';

      singleProjectMetrics = {
        currentAct: foundStatus.act,
        delayDiff: foundStatus.diff < 0 ? Math.abs(foundStatus.diff) : 0,
        aheadDiff: foundStatus.diff > 0 ? foundStatus.diff : 0,
        statusText: finalStatusText,
        budget: foundStatus.budget,
        spent: foundStatus.spent,
        surplus: foundStatus.balance
      };
    }

    // 1. ดึงข้อความสรุปผลงานประจำเดือนตามเดือน As-of (หรือย้อนหลังล่าสุด)
    const matchedLogRows = progressData.filter(r => String(r[3]).trim() === targetFY && String(r[2]).trim() === cleanRef);
    if (matchedLogRows.length > 0) {
      const validRowsForAsOf = matchedLogRows.map(r => {
        const rY = Number(r[4]);
        const rM = String(r[5]).trim();
        const mIdx = CALENDAR_MONTHS.indexOf(rM) + 1;
        const val = rY * 12 + mIdx;
        return { row: r, val: val, summary: String(r[18] || '').trim() };
      }).filter(item => item.val <= cutOffVal);

      const exactMonthRow = validRowsForAsOf.find(item => item.val === cutOffVal && item.summary !== '');
      if (exactMonthRow) {
        singleProjectSummary = exactMonthRow.summary;
      } else {
        const rowsWithSummary = validRowsForAsOf.filter(item => item.summary !== '').sort((a, b) => b.val - a.val);
        if (rowsWithSummary.length > 0) {
          singleProjectSummary = rowsWithSummary[0].summary;
        } else {
          singleProjectSummary = 'ไม่มีข้อความสรุปผลงานในรอบนี้';
        }
      }
    }

    // 2. ดึงรูปภาพกิจกรรมแบบ Carry-Forward
    const matchedFiles = fileData.filter(f => String(f[3]).trim() === targetFY && String(f[2]).trim() === cleanRef);
    if (matchedFiles.length > 0) {
      const validImgFiles = [];
      matchedFiles.forEach(f => {
        const isImage = (f[5] === 'รูปภาพ' || String(f[6]).match(/\.(jpg|jpeg|png|webp)$/i));
        if (!isImage) return;

        const fMonthStr = String(f[4] || '').trim();
        let fVal = 0;
        let monthName = '';
        let yearNum = Number(targetFY) || 2569;

        for (let m = 0; m < CALENDAR_MONTHS.length; m++) {
          if (fMonthStr.includes(CALENDAR_MONTHS[m])) {
            monthName = CALENDAR_MONTHS[m];
            break;
          }
        }

        const matchYear = fMonthStr.match(/\d{4}/);
        if (matchYear) yearNum = Number(matchYear[0]);

        if (monthName) {
          const mIdx = CALENDAR_MONTHS.indexOf(monthName) + 1;
          fVal = yearNum * 12 + mIdx;
        }

        if (fVal > 0 && fVal <= cutOffVal) {
          validImgFiles.push({
            url: f[7],
            val: fVal,
            monthText: `${monthName} ${yearNum}`,
            uploadedAt: f[8] ? new Date(f[8]).getTime() : 0
          });
        }
      });

      if (validImgFiles.length > 0) {
        validImgFiles.sort((a, b) => {
          if (b.val !== a.val) return b.val - a.val;
          return b.uploadedAt - a.uploadedAt;
        });
        latestActivityImageUrl = validImgFiles[0].url;
        latestActivityImageMonth = validImgFiles[0].monthText;
      }
    }
  }

  // ปรับการดึง expenseData: เฉพาะรายการที่เกิดขึ้นภายในเดือน As-of (หรือก่อนหน้า)
  const projectExpenses = expenseData.filter(e => {
    const matchYear = String(e[3]).trim() === targetFY;
    const matchRef = isAll ? true : String(e[2]).trim() === cleanRef;
    const eVal = (Number(e[4]) * 12) + (CALENDAR_MONTHS.indexOf(String(e[5]).trim()) + 1);
    return matchYear && matchRef && (eVal <= cutOffVal);
  }).map(e => ({
    id: e[0], month: `${e[5]} ${e[4]}`, itemName: e[6],
    approvedBudget: Number(e[7]) || 0, amount: Number(e[8]) || 0,
    savings: Number(e[9]) || 0,
    status: e[10],
    disburseStatus: e[11] || 'ยังไม่วางฎีกา',
    docUrl: e[12]
  }));

  const files = fileData.filter(f => {
    const matchYear = String(f[3]).trim() === targetFY;
    const matchRef = isAll ? true : String(f[2]).trim() === cleanRef;
    return matchYear && matchRef;
  }).map(f => ({ id: f[0], month: f[4], type: f[5], name: f[6], url: f[7] }));

  const masterDocs = getMasterBudgetDocs(targetFY);

  return {
    months: timelineLabels,
    timelineKeys: chartTimeline.map(t => t.key),
    overallPlanAcc,
    overallActualAcc,
    procurePlanAcc,
    procureActualAcc,
    asOfPlanOverall,
    asOfActOverall,
    asOfSelectedMonth: selectedMonthObj ? selectedMonthObj.key : '',
    files,
    masterDocs,
    projectExpenses,
    selectedTeam,
    singleProjectMetrics,
    singleProjectSummary,
    singleProjectName, // ส่งชื่อโครงการออกไป
    singleProjectId,   // ส่งรหัสโครงการออกไป
    latestActivityImageUrl,
    latestActivityImageMonth,
    singleProjectSdgs,
    completedProjectsList,
    onTrackProjectsList,
    pendingSubmissionsList,
    sdgDistribution: {
      labels: sortedLabels,
      values: sortedValues,
      colors: sortedColors
    },
    isAll: isAll,
    kpi: {
      totalProjects: masterList.length,
      completedCount,
      onTrackCount,
      delayedCount,
      revisingCount,
      totalMasterBudget: masterTotalBudget,
      totalSpentBudget: totalSpentBudget,
      operationalSurplus: masterTotalBudget > 0 ? (masterTotalBudget - totalSpentBudget) : 0
    },
    projectStatusList
  };
}

// ส่งรายงานผ่าน JSON เพื่อให้ google.script.run ส่งโครงสร้างข้อมูลซ้อนกันได้ครบ
function getDashboardReportJson(fiscalYear, dept, refId, asOfMonthKey) {
  return JSON.stringify(getDashboardReport(fiscalYear, dept, refId, asOfMonthKey));
}

// ฟังก์ชันดึงข้อมูลตารางเมทริกซ์ สรุปแผน vs ผล
function getProjectYearlyMatrix(fiscalYear, refId) {
  const ss = getAppSpreadsheet();
  const sheet = ss.getSheetByName('Monthly_Progress');
  const data = sheet ? sheet.getDataRange().getValues().slice(1) : [];

  const targetFY = String(fiscalYear || '2569').trim();
  const targetRef = String(refId || '').trim();

  if (!targetRef) return [];

  const relevant = data.filter(r => {
    const rowRef = String(r[2] || '').trim();
    const rowFY = String(r[3] || '').trim();
    return rowRef === targetRef && (rowFY === targetFY || targetFY === 'ALL');
  });

  if (relevant.length === 0) return [];

  return relevant.map(r => {
    const actY = Number(r[4]) || Number(targetFY) || 2569;
    const mName = String(r[5] || '').trim();
    const mVal = CALENDAR_MONTHS.indexOf(mName) + 1;

    return {
      actualYear: actY,
      month: mName,
      monthVal: mVal > 0 ? mVal : 1,
      monthYear: `${mName} ${actY}`,
      draftP: Number(r[6]) || 0, draftA: Number(r[7]) || 0,
      apprP: Number(r[8]) || 0, apprA: Number(r[9]) || 0,
      procP: Number(r[10]) || 0, procA: Number(r[11]) || 0,
      execP: Number(r[12]) || 0, execA: Number(r[13]) || 0,
      disbP: Number(r[14]) || 0, disbA: Number(r[15]) || 0,
      repoP: Number(r[16]) || 0, repoA: Number(r[17]) || 0,
      summary: r[18] ? String(r[18]).trim() : '-',
      delayReason: r[19] ? String(r[19]).trim() : '-'
    };
  }).sort((a, b) => (a.actualYear * 12 + a.monthVal) - (b.actualYear * 12 + b.monthVal));
}


/* BudgetDocService.gs */
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

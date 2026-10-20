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
      if (deptRows[i][1] && String(deptRows[i][5] || '').trim().toLowerCase() !== 'archived') {
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
    const found = bgtData.find(r => String(r[0]).trim() === targetYear && String(r[3] || '').trim().toLowerCase() !== 'archived');
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
  if (!targetId || !targetYear) throw new Error('กรุณาระบุรหัสโครงการและปีงบประมาณ');
  const data = sheet.getDataRange().getValues();
  let foundRow = -1;

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim() === targetId && String(data[i][1]).trim() === targetYear) {
      foundRow = i + 1;
      break;
    }
  }

  if (foundRow > 0) {
    const before = adminRowSnapshot_(data[foundRow - 1]);
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
    appendAdminChange_('project', targetYear + '/' + targetId, 'UPDATE', before,
      adminRowSnapshot_(sheet.getRange(foundRow, 1, 1, sheet.getLastColumn()).getValues()[0]));
    return { success: true, message: `อัปเดตข้อมูลโครงการ ${targetId} สำเร็จเรียบร้อยแล้ว` };
  } else {
    // โหมดเพิ่มใหม่
    sheet.appendRow([
      targetId, targetYear, payload.name, '', payload.responsible,
      payload.department, Number(payload.budget) || 0, Number(payload.weight) || 0,
      '', '', 'Active',
      payload.primaryEmail, payload.coName1 || '', payload.coEmail1 || '', payload.coName2 || '', payload.coEmail2 || ''
    ]);
    appendAdminChange_('project', targetYear + '/' + targetId, 'CREATE', null,
      adminRowSnapshot_(sheet.getRange(sheet.getLastRow(), 1, 1, sheet.getLastColumn()).getValues()[0]));
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

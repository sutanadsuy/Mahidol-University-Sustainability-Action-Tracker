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

(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const fmt = value => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(Number(value) || 0);
  const state = { view: 'home', step: 1, planDirty: false, reportDirty: false, queue: [], replacementTarget: null, removed: new Set(), previousPeriod: 'กันยายน 2569', savedAt: null };
  let toastTimer;

  function toast(message) {
    const box = $('#toast');
    box.textContent = message;
    box.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('show'), 4000);
  }

  function setStatus(kind, text, className) {
    const node = $(`#${kind}-status`);
    node.textContent = text;
    node.className = `status-pill ${className || ''}`;
  }

  function markDirty(kind) {
    state[`${kind}Dirty`] = true;
    setStatus(kind, 'มีข้อมูลที่ยังไม่บันทึก', 'dirty');
  }

  function navigate(view, requestedStep) {
    if (view !== state.view && ((state.view === 'report' && state.reportDirty) || (state.view === 'plan' && state.planDirty))) {
      if (!window.confirm('มีข้อมูลที่ยังไม่บันทึกในหน้านี้ ต้องการออกจากหน้านี้หรือไม่?')) return;
    }
    state.view = view;
    $$('.view').forEach(node => node.classList.toggle('active', node.id === `view-${view}`));
    $$('.nav-item').forEach(node => node.classList.toggle('active', node.dataset.view === view));
    if (view === 'report' && requestedStep) setStep(Number(requestedStep));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function setStep(step) {
    state.step = Math.max(1, Math.min(4, Number(step)));
    $$('.report-step').forEach(node => node.classList.toggle('active', node.id === `report-step-${state.step}`));
    $$('.step-btn').forEach(node => node.classList.toggle('active', Number(node.dataset.step) === state.step));
    if (state.step === 4) updateValidation();
    $('.step-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function updatePlan() {
    const totals = Array(6).fill(0);
    $$('#plan-body tr').forEach(row => {
      $$('td input', row).forEach((input, index) => { totals[index] += Number(input.value) || 0; });
    });
    $$('.plan-total').forEach((node, index) => {
      node.textContent = index === 2 ? `${fmt(totals[index])} บาท` : `${fmt(totals[index])}%`;
      node.style.color = index !== 2 && totals[index] !== 100 ? '#b9464d' : '';
    });
    const plannedBudget = $$('.budget-input').reduce((sum, input) => sum + (Number(input.value) || 0), 0);
    $('#budget-total').textContent = `${fmt(plannedBudget)} บาท`;
    const issues = [];
    totals.forEach((value, index) => { if (index !== 2 && value !== 100) issues.push('แผนร้อยละยังไม่ครบ 100%'); });
    if (plannedBudget > 3000000) issues.push('วงเงินรายการค่าใช้จ่ายเกินกรอบโครงการ');
    $('#plan-check').textContent = issues.length ? [...new Set(issues)].join(' · ') : 'ตรวจแล้ว: ผลรวมร้อยละครบทุกขั้นตอน และวงเงินไม่เกินกรอบ';
    $('#plan-check').style.color = issues.length ? '#b9464d' : '#14805d';
    $('#save-plan').disabled = issues.length > 0;
  }

  function computeProgress() {
    const values = $$('.actual-percent').map(input => Number(input.value) || 0);
    const draft = 100;
    const approval = 100;
    const execute = Math.min(100, 50 + values[2]);
    const disburse = Math.min(100, values[3]);
    const report = Math.min(100, values[4]);
    return Math.round((draft * .05 + approval * .05 + execute * .75 + disburse * .05 + report * .1) * 10) / 10;
  }

  function updateReport() {
    const paid = $$('.paid-input').reduce((sum, input) => sum + Math.max(0, Number(input.value) || 0), 0);
    const progress = computeProgress();
    const behind = progress < 75;
    $('#paid-total').textContent = `${fmt(paid)} บาท`;
    $('#paid-remaining').textContent = `${fmt(Math.max(0, 3000000 - 770000 - paid))} บาท`;
    $('#review-paid').textContent = `${fmt(paid)} บาท`;
    $('#review-total-paid').textContent = `${fmt(770000 + paid)} บาท`;
    $('#matrix-paid').textContent = `${fmt(paid)} บาท`;
    $('#matrix-execute').textContent = `${progress}%`;
    $('#review-progress').textContent = `${progress}%`;
    $('#home-progress').textContent = `${progress}%`;
    $('#review-period').textContent = $('#report-period').value;
    $('#review-files').textContent = `${state.queue.length} ไฟล์`;
    $('#progress-status').textContent = `ผลสะสมตัวอย่าง ${progress}% · แผนสะสม 75% · ${behind ? 'ล่าช้ากว่าแผน' : 'ตามแผนหรือเร็วกว่าแผน'}`;
    $('#progress-status').classList.toggle('ontrack', !behind);
    const forecastMonths = $('#forecast-end').selectedIndex;
    $('#forecast-message').textContent = forecastMonths === 0 ? 'คาดเสร็จตามแผนตั้งต้น · ยังไม่มีการขยายเวลา' : `ช้ากว่าแผนตั้งต้น ${forecastMonths} เดือน · เป็นข้อมูลคาดการณ์ ยังไม่ใช่แผนที่อนุมัติ`;
    $('#delay-wrap').style.display = behind || forecastMonths > 0 ? '' : 'none';
    updateValidation();
  }

  function updateValidation() {
    const issues = [];
    if (!$('#summary').value.trim()) issues.push('กรุณากรอกสรุปผลประจำเดือน');
    if ((computeProgress() < 75 || $('#forecast-end').selectedIndex > 0) && !$('#delay').value.trim()) issues.push('ผลล่าช้าหรือคาดว่าจะขยายเวลา: กรุณาระบุสาเหตุและแนวทางแก้ไข');
    if ($$('.actual-percent').some(input => Number(input.value) < 0 || Number(input.value) > 100)) issues.push('ร้อยละของแต่ละช่องต้องอยู่ระหว่าง 0–100');
    if ($$('.paid-input').some(input => Number(input.value) < 0)) issues.push('ยอดจ่ายต้องไม่ติดลบ');
    const validation = $('#validation-box');
    validation.textContent = issues.length ? issues.join(' · ') : 'ข้อมูลจำเป็นครบแล้ว สามารถบันทึกตัวอย่างได้';
    validation.classList.toggle('error', issues.length > 0);
    $('#save-report').disabled = issues.length > 0;
    return issues;
  }

  function renderQueue() {
    const list = $('#queued-files');
    list.replaceChildren();
    if (state.queue.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'ยังไม่มีไฟล์ที่เลือก';
      list.append(li);
    } else {
      state.queue.forEach((file, index) => {
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = file.name;
        const button = document.createElement('button');
        button.className = 'text-btn danger';
        button.textContent = 'เอาออก';
        button.addEventListener('click', () => { state.queue.splice(index, 1); renderQueue(); updateReport(); markDirty('report'); });
        li.append(span, button);
        list.append(li);
      });
    }
    $('#queued-count').textContent = String(state.queue.length);
    $('#review-files').textContent = `${state.queue.length} ไฟล์`;
  }

  function applyStagedFiles() {
    const active = $('#active-files');
    for (const li of [...active.children]) {
      if (li.dataset.remove === 'true') li.remove();
      else if (li.dataset.replacement) {
        li.dataset.name = li.dataset.replacement;
        li.querySelector('span').firstChild.textContent = li.dataset.replacement;
        li.querySelector('small').textContent = 'ไฟล์ใหม่ · บันทึกเมื่อสักครู่';
        li.dataset.replacement = '';
        li.style.opacity = '';
      }
    }
    state.queue.forEach(file => {
      const li = document.createElement('li');
      li.dataset.name = file.name;
      const span = document.createElement('span');
      span.textContent = file.name;
      const small = document.createElement('small');
      small.textContent = 'ไฟล์ใหม่ · บันทึกเมื่อสักครู่';
      span.append(small);
      const controls = document.createElement('div');
      const replace = document.createElement('button');
      replace.className = 'text-btn replace-file'; replace.textContent = 'แทนที่';
      const remove = document.createElement('button');
      remove.className = 'text-btn danger remove-file'; remove.textContent = 'นำออก';
      controls.append(replace, remove); li.append(span, controls); active.append(li);
    });
    state.queue = [];
    renderQueue();
    $('#active-count').textContent = String(active.children.length);
    state.removed.clear();
  }

  const executiveProjects = [
    { id: 'P1', name: 'โครงการจัดการขยะครบวงจร', weight: 45, budget: 3000000, previousBudget: 5000000, baselineStart: 'ก.ค. 2569', actualStart: 'มิ.ย. 2569', baselineEnd: 'ต.ค. 2569', forecastEnd: 'ธ.ค. 2569', finishIndex: 6, reason: 'เริ่มงานก่อนแผน แต่ขั้นตอนส่งมอบและตรวจรับล่าช้า จึงคาดว่าจะต้องขยายเวลา 2 เดือน (ยังไม่อนุมัติแผนปรับ)', decision: 'เร่งกำหนดวันส่งมอบ และพิจารณาคำขอขยายเวลาโดยเก็บแผนตั้งต้นไว้เปรียบเทียบ', owner: 'หัวหน้าโครงการ', due: '26 ต.ค. 2569', snapshots: { sep: { plan: 75, actual: 68, paid: 1650000, reported: true }, aug: { plan: 60, actual: 58, paid: 770000, reported: true } }, baseline: [0, 10, 60, 75, 100, 100, 100], actualSeries: [8, 20, 58, 68] },
    { id: 'P2', name: 'โครงการพลังงานสะอาด', weight: 30, budget: 2000000, previousBudget: 1800000, baselineStart: 'ก.ค. 2569', actualStart: 'มิ.ย. 2569', baselineEnd: 'ธ.ค. 2569', forecastEnd: 'พ.ย. 2569', finishIndex: 5, reason: 'เริ่มงานก่อนแผนและติดตั้งอุปกรณ์ได้เร็วกว่ากำหนด', decision: 'ตรวจสอบความพร้อมของการทดสอบระบบ เพื่อรักษากำหนดเสร็จที่เร็วกว่าแผน', owner: 'หัวหน้าโครงการ', due: 'ต้น พ.ย. 2569', snapshots: { sep: { plan: 55, actual: 65, paid: 1400000, reported: true }, aug: { plan: 45, actual: 52, paid: 1100000, reported: true } }, baseline: [0, 5, 45, 55, 70, 90, 100], actualSeries: [5, 24, 52, 65] },
    { id: 'P3', name: 'โครงการพื้นที่สีเขียว', weight: 15, budget: 1000000, previousBudget: 1200000, baselineStart: 'มิ.ย. 2569', actualStart: 'มิ.ย. 2569', baselineEnd: 'ต.ค. 2569', forecastEnd: 'ต.ค. 2569', finishIndex: 4, reason: 'ผลดำเนินงานเป็นไปตามแผนที่อนุมัติ', decision: 'ติดตามงานปิดโครงการและหลักฐานประกอบให้ครบ', owner: 'ทีมโครงการ', due: 'ต.ค. 2569', snapshots: { sep: { plan: 80, actual: 80, paid: 750000, reported: true }, aug: { plan: 70, actual: 72, paid: 650000, reported: true } }, baseline: [10, 30, 70, 80, 100, 100, 100], actualSeries: [10, 42, 72, 80] },
    { id: 'P4', name: 'โครงการสื่อสารความยั่งยืน', weight: 10, budget: 800000, previousBudget: 1000000, baselineStart: 'ก.ค. 2569', actualStart: 'ก.ค. 2569', baselineEnd: 'พ.ย. 2569', forecastEnd: 'พ.ย. 2569', finishIndex: 5, reason: 'ยังไม่ส่งรายงานรอบกันยายน จึงยังสรุปสถานะเดือนนี้ไม่ได้', decision: 'ติดตามผู้รับผิดชอบให้ส่งผลและวันที่คาดว่าจะเสร็จก่อนประเมินความล่าช้า', owner: 'ผู้ประสานงานโครงการ', due: '26 ต.ค. 2569', snapshots: { sep: { plan: 40, actual: null, paid: 280000, reported: false }, aug: { plan: 30, actual: 28, paid: 280000, reported: true } }, baseline: [0, 15, 30, 40, 65, 100, 100], actualSeries: [0, 10, 28] }
  ];

  function million(value) { return `${(value / 1000000).toFixed(2)} ล้านบาท`; }

  function projectStatus(project, asOf) {
    const snapshot = project.snapshots[asOf];
    if (!snapshot.reported) return { label: 'รอรายงาน', kind: 'pending', diff: null };
    const diff = snapshot.actual - snapshot.plan;
    if (diff < -5) return { label: 'ล่าช้า', kind: 'delayed', diff };
    if (diff > 5) return { label: 'เร็วกว่าแผน', kind: 'ahead', diff };
    return { label: 'ตามแผน', kind: 'ontrack', diff };
  }

  function renderSCurve(project, asOf) {
    const monthLabels = ['มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค. 70'];
    const lastActualIndex = project.snapshots[asOf].reported ? (asOf === 'sep' ? 3 : 2) : 2;
    const baseline = [...project.baseline, 100];
    const actual = project.actualSeries.slice(0, lastActualIndex + 1);
    const start = actual[actual.length - 1];
    const endIndex = Math.max(lastActualIndex + 1, project.finishIndex);
    const forecast = Array(8).fill(null);
    for (let i = lastActualIndex; i < 8; i++) {
      forecast[i] = i >= endIndex ? 100 : start + (100 - start) * (i - lastActualIndex) / (endIndex - lastActualIndex);
    }
    const x = i => 42 + i * 65;
    const y = value => 186 - value * 1.55;
    const points = (values, from = 0) => values.map((value, i) => value === null || value === undefined ? null : `${x(i + from)},${y(value).toFixed(1)}`).filter(Boolean).join(' ');
    const grid = [0, 25, 50, 75, 100].map(value => `<line x1="42" y1="${y(value)}" x2="497" y2="${y(value)}" stroke="#e6edf5"/><text x="29" y="${y(value) + 4}" text-anchor="end" fill="#8594a7" font-size="10">${value}</text>`).join('');
    const labels = monthLabels.map((label, i) => `<text x="${x(i)}" y="210" text-anchor="middle" fill="#778aa1" font-size="10">${label}</text>`).join('');
    $('#exec-chart').innerHTML = `<svg viewBox="0 0 530 222" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${grid}${labels}<polyline points="${points(baseline)}" fill="none" stroke="#2c74da" stroke-width="3" stroke-dasharray="7 5" stroke-linejoin="round"/><polyline points="${points(actual)}" fill="none" stroke="#15956e" stroke-width="4" stroke-linejoin="round"/><polyline points="${points(forecast)}" fill="none" stroke="#e3a539" stroke-width="3" stroke-dasharray="5 5" stroke-linejoin="round"/><line x1="${x(lastActualIndex)}" y1="22" x2="${x(lastActualIndex)}" y2="186" stroke="#9eb0c4" stroke-dasharray="3 4"/><circle cx="${x(lastActualIndex)}" cy="${y(start)}" r="5" fill="#15956e" stroke="#fff" stroke-width="2"/></svg>`;
  }

  function renderExecutive() {
    const asOf = $('#exec-asof').value;
    const selected = executiveProjects.find(project => project.id === $('#exec-focus').value) || executiveProjects[0];
    const reported = executiveProjects.filter(project => project.snapshots[asOf].reported);
    const totalWeight = reported.reduce((sum, project) => sum + project.weight, 0);
    const overallPlan = reported.reduce((sum, project) => sum + project.snapshots[asOf].plan * project.weight, 0) / totalWeight;
    const overallActual = reported.reduce((sum, project) => sum + project.snapshots[asOf].actual * project.weight, 0) / totalWeight;
    const totalBudget = executiveProjects.reduce((sum, project) => sum + project.budget, 0);
    const previousBudget = executiveProjects.reduce((sum, project) => sum + project.previousBudget, 0);
    const paid = executiveProjects.reduce((sum, project) => sum + project.snapshots[asOf].paid, 0);
    const counts = { delayed: 0, ahead: 0, ontrack: 0, pending: 0 };
    executiveProjects.forEach(project => {
      const status = projectStatus(project, asOf);
      if (!project.snapshots[asOf].reported) counts.pending++;
      else counts[status.kind]++;
    });
    $('#exec-freshness').textContent = `${reported.length} จาก ${executiveProjects.length} โครงการส่งรายงานรอบ${asOf === 'sep' ? 'กันยายน' : 'สิงหาคม'}แล้ว${reported.length < executiveProjects.length ? ' · ยอดจ่ายของโครงการที่ค้างรายงานเป็นยอดล่าสุดที่มี' : ''}`;
    $('#exec-project-count').textContent = String(executiveProjects.length);
    $('#exec-status-count').textContent = `${counts.delayed} ล่าช้า · ${counts.ahead} เร็วกว่าแผน · ${counts.ontrack} ตามแผน${counts.pending ? ` · ${counts.pending} รอรายงาน` : ''}`;
    $('#exec-progress').textContent = `${overallActual.toFixed(1)}%`;
    $('#exec-plan-progress').textContent = `แผน ${overallPlan.toFixed(1)}% · ถ่วงตามน้ำหนัก ${reported.length}/${executiveProjects.length} โครงการที่ส่งรายงาน`;
    $('#exec-budget').textContent = million(totalBudget);
    $('#exec-yoy').textContent = `ปีก่อน ${million(previousBudget)} · ลด ${((previousBudget - totalBudget) / previousBudget * 100).toFixed(1)}%`;
    $('#exec-paid').textContent = million(paid);
    $('#exec-paid-rate').textContent = `${(paid / totalBudget * 100).toFixed(1)}% ของงบปีนี้ · คงเหลือ ${million(totalBudget - paid)}`;
    $('#exec-headline').textContent = asOf === 'sep' ? 'ภาพรวมใกล้แผน แต่โครงการใหญ่เสี่ยงขยายเวลา' : 'ภาพรวมเดือนสิงหาคมยังตามแผน ต้องติดตามงานส่งมอบเดือนถัดไป';
    $('#exec-subline').textContent = asOf === 'sep' ? 'มี 1 โครงการล่าช้าและ 1 โครงการยังไม่ส่งรายงาน ค่าเฉลี่ยรวมจึงต้องอ่านควบคู่กับความเสี่ยงรายโครงการ' : 'ใช้ข้อมูลรอบเดียวกันเพื่อเทียบระหว่างโครงการ และดูวันที่คาดว่าจะเสร็จควบคู่กับร้อยละความก้าวหน้า';
    $('#exec-decision-count').textContent = asOf === 'sep' ? '2 เรื่องเร่งติดตาม' : '1 เรื่องติดตามล่วงหน้า';
    const actionData = asOf === 'sep' ? [
      { project: executiveProjects[0], title: 'โครงการใหญ่ช้ากว่าแผน 7 จุด', description: 'คาดเสร็จ ธ.ค. จากแผนเดิม ต.ค. ต้องกำหนดวันส่งมอบและพิจารณาขยายเวลา', due: 'ติดตาม 26 ต.ค. 2569', kind: '' },
      { project: executiveProjects[3], title: 'ยังไม่ได้รายงานผลเดือนกันยายน', description: 'ติดต่อผู้รับผิดชอบก่อนสรุปว่าโครงการล่าช้าหรือไม่', due: 'กำหนดส่ง 26 ต.ค. 2569', kind: 'amber' },
      { project: executiveProjects[0], title: 'งบโครงการหลักลดจาก 5 เป็น 3 ล้าน', description: 'ตรวจว่าขอบเขตงานปีนี้ต่างจากปีก่อนอย่างไร ก่อนเปรียบเทียบประสิทธิภาพ', due: 'ประกอบการทบทวนงบ', kind: 'amber' }
    ] : [
      { project: executiveProjects[0], title: 'ติดตามงานส่งมอบของโครงการใหญ่', description: 'ผลเดือนสิงหาคมใกล้แผน แต่กำหนดส่งมอบขั้นถัดไปมีความเสี่ยง', due: 'ติดตามรอบกันยายน', kind: 'amber' }
    ];
    $('#exec-actions').replaceChildren();
    actionData.forEach(item => {
      const row = document.createElement('div'); row.className = 'action-row';
      const dot = document.createElement('span'); dot.className = `action-severity ${item.kind}`;
      const body = document.createElement('div');
      const strong = document.createElement('strong'); strong.textContent = item.title;
      const desc = document.createElement('p'); desc.textContent = item.description;
      const due = document.createElement('small'); due.textContent = item.due;
      body.append(strong, desc, due);
      const button = document.createElement('button'); button.textContent = 'ดูโครงการ';
      button.addEventListener('click', () => { $('#exec-focus').value = item.project.id; renderExecutive(); $('.exec-grid.middle').scrollIntoView({ behavior: 'smooth' }); });
      row.append(dot, body, button); $('#exec-actions').append(row);
    });
    $('#exec-project-budget-yoy').textContent = `${million(selected.previousBudget)} → ${million(selected.budget)}`;
    const change = (selected.budget - selected.previousBudget) / selected.previousBudget * 100;
    $('#exec-project-budget-change').textContent = `${change < 0 ? 'ลดลง' : 'เพิ่มขึ้น'} ${Math.abs(change).toFixed(1)}% จากปีก่อน · ต้องดูขอบเขตงานประกอบ`;
    $('#exec-budget-bars').replaceChildren();
    executiveProjects.forEach(project => {
      const line = document.createElement('div'); line.className = 'budget-bar-line';
      const name = document.createElement('span'); name.textContent = project.name;
      const rate = project.snapshots[asOf].paid / project.budget * 100;
      const value = document.createElement('b'); value.textContent = `จ่าย ${rate.toFixed(0)}%`;
      const bar = document.createElement('div'); const fill = document.createElement('i'); fill.style.width = `${Math.min(100, rate)}%`; bar.append(fill);
      line.append(name, value, bar); $('#exec-budget-bars').append(line);
    });
    const selectedStatus = projectStatus(selected, asOf);
    $('#exec-detail-name').textContent = selected.name;
    $('#exec-detail-status').textContent = selectedStatus.label;
    $('#exec-detail-status').className = `status-flag ${selectedStatus.kind === 'delayed' ? 'alert' : selectedStatus.kind === 'ahead' || selectedStatus.kind === 'ontrack' ? 'good' : ''}`;
    $('#exec-baseline-start').textContent = selected.baselineStart;
    $('#exec-actual-start').textContent = selected.actualStart;
    $('#exec-baseline-end').textContent = selected.baselineEnd;
    $('#exec-forecast-end').textContent = selected.forecastEnd;
    $('#exec-extension-state').textContent = selected.id === 'P1' ? 'สถานะขยายเวลา: คาดการณ์ ธ.ค. 2569 · ยังรออนุมัติแผนปรับ' : 'สถานะขยายเวลา: ยังไม่มีแผนปรับที่อนุมัติ';
    $('#exec-project-note').textContent = selected.reason;
    $('#exec-project-decision').textContent = selected.decision;
    $('#exec-project-owner').textContent = `ผู้รับผิดชอบ: ${selected.owner} · ติดตามภายใน ${selected.due}`;
    $('#exec-chart-asof').textContent = `ถึง ${asOf === 'sep' ? 'ก.ย.' : 'ส.ค.'} 2569`;
    renderSCurve(selected, asOf);
    $('#exec-peer-body').replaceChildren();
    executiveProjects.forEach(project => {
      const snapshot = project.snapshots[asOf];
      const status = projectStatus(project, asOf);
      const row = document.createElement('tr');
      row.classList.toggle('selected', project.id === selected.id);
      const paidLabel = `${million(snapshot.paid)}${!snapshot.reported ? ' (ยอด ส.ค.)' : ''}`;
      const cells = [project.name, million(project.budget), `${snapshot.plan}%`, snapshot.reported ? `${snapshot.actual}%` : 'รอรายงาน', snapshot.reported ? `${status.diff > 0 ? '+' : ''}${status.diff} จุด` : '—', paidLabel, project.forecastEnd, status.label];
      cells.forEach((value, index) => {
        const cell = document.createElement(index === 0 ? 'th' : 'td');
        if (index === 4 && snapshot.reported) cell.className = status.diff < 0 ? 'negative' : status.diff > 0 ? 'positive' : '';
        if (index === 7) { const badge = document.createElement('span'); badge.className = `peer-status ${status.kind}`; badge.textContent = value; cell.append(badge); }
        else cell.textContent = value;
        row.append(cell);
      });
      row.addEventListener('click', () => { $('#exec-focus').value = project.id; renderExecutive(); });
      $('#exec-peer-body').append(row);
    });
    window.renderSdgMock?.();
  }

  $('#exec-asof').addEventListener('change', renderExecutive);
  $('#exec-focus').addEventListener('change', renderExecutive);

  $$('[data-view]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.view, button.dataset.reportStep)));
  $$('.step-btn').forEach(button => button.addEventListener('click', () => setStep(button.dataset.step)));
  $$('.next-step').forEach(button => button.addEventListener('click', () => setStep(button.dataset.next)));
  $$('.prev-step').forEach(button => button.addEventListener('click', () => setStep(button.dataset.prev)));

  $$('#view-plan input, #view-plan select').forEach(input => input.addEventListener('input', () => { markDirty('plan'); updatePlan(); }));
  $('#save-plan').addEventListener('click', () => { state.planDirty = false; setStatus('plan', 'บันทึกตัวอย่างแล้ว', 'saved'); toast('บันทึกแผนในหน้าต้นแบบแล้ว · ไม่มีข้อมูลส่งไปยังระบบจริง'); });

  $$('#view-report input, #view-report select, #view-report textarea').forEach(input => {
    if (input.type === 'file' || input.id === 'report-period') return;
    input.addEventListener('input', () => { markDirty('report'); updateReport(); });
  });
  $('#report-period').addEventListener('change', event => {
    if (state.reportDirty && !window.confirm('มีข้อมูลที่ยังไม่บันทึก ต้องการเปลี่ยนรอบรายงานหรือไม่?')) {
      event.target.value = state.previousPeriod;
    } else {
      state.previousPeriod = event.target.value;
      state.reportDirty = false;
      setStatus('report', 'เลือกรอบรายงานแล้ว', '');
      toast(`กำลังแสดงข้อมูลตัวอย่างของ${event.target.value}`);
    }
    updateReport();
  });
  $('#general-files').addEventListener('change', event => {
    state.queue.push(...[...event.target.files].map(file => ({ name: file.name, file })));
    event.target.value = '';
    renderQueue(); updateReport(); markDirty('report');
  });
  $$('.evidence-file').forEach(input => input.addEventListener('change', event => {
    const filename = event.target.files[0]?.name;
    if (filename) { $('.evidence-name', event.target.closest('.expense-entry')).textContent = `ไฟล์ที่รอบันทึก: ${filename}`; markDirty('report'); }
  }));
  $('#active-files').addEventListener('click', event => {
    const row = event.target.closest('li');
    if (!row) return;
    if (event.target.closest('.replace-file')) {
      state.replacementTarget = row;
      $('#replacement-picker').click();
    }
    if (event.target.closest('.remove-file')) {
      row.dataset.remove = row.dataset.remove === 'true' ? 'false' : 'true';
      row.style.opacity = row.dataset.remove === 'true' ? '.45' : '';
      event.target.textContent = row.dataset.remove === 'true' ? 'ยกเลิก' : 'นำออก';
      markDirty('report');
      toast(row.dataset.remove === 'true' ? 'ทำเครื่องหมายรอนำออก · ยังไม่เปลี่ยนข้อมูลจริง' : 'ยกเลิกการนำออก');
    }
  });
  $('#replacement-picker').addEventListener('change', event => {
    const file = event.target.files[0];
    if (file && state.replacementTarget) {
      state.replacementTarget.dataset.replacement = file.name;
      $('.text-btn.replace-file', state.replacementTarget).textContent = 'รอแทนที่';
      markDirty('report');
      toast(`เลือก ${file.name} เพื่อแทนที่ไฟล์เดิม · จะมีผลเมื่อบันทึกตัวอย่าง`);
    }
    event.target.value = '';
    state.replacementTarget = null;
  });

  $('#save-report').addEventListener('click', () => {
    if (updateValidation().length) { setStep(4); return; }
    window.dispatchEvent(new CustomEvent('mockup:report-before-save', { detail: { files: state.queue.map(item => item.file).filter(Boolean) } }));
    applyStagedFiles();
    const forecastValue = $('#forecast-end').value;
    executiveProjects[0].forecastEnd = forecastValue.replace('ตุลาคม', 'ต.ค.').replace('พฤศจิกายน', 'พ.ย.').replace('ธันวาคม', 'ธ.ค.').replace('มกราคม', 'ม.ค.');
    executiveProjects[0].finishIndex = 4 + $('#forecast-end').selectedIndex;
    if ($('#report-period').value === 'กันยายน 2569') {
      const paidThisMonth = $$('.paid-input').reduce((sum, input) => sum + Math.max(0, Number(input.value) || 0), 0);
      executiveProjects[0].snapshots.sep.actual = computeProgress();
      executiveProjects[0].snapshots.sep.paid = 770000 + paidThisMonth;
      executiveProjects[0].actualSeries[3] = computeProgress();
    }
    if ($('#delay').value.trim()) executiveProjects[0].reason = $('#delay').value.trim();
    window.saveSdgMock?.();
    renderExecutive();
    state.reportDirty = false;
    const now = new Date();
    state.savedAt = now.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
    setStatus('report', `บันทึกตัวอย่างแล้ว ${state.savedAt}`, 'saved');
    const validation = $('#validation-box');
    validation.replaceChildren();
    const message = document.createElement('span');
    message.textContent = `บันทึกสำเร็จในต้นแบบ · ${$('#report-period').value} · ${state.savedAt} · ไม่มีข้อมูลส่งไปยังระบบจริง`;
    const button = document.createElement('button');
    button.className = 'text-btn'; button.textContent = 'ดูแผนเทียบผล →';
    button.addEventListener('click', () => navigate('review'));
    validation.append(message, button);
    validation.classList.remove('error');
    toast('บันทึกข้อมูลตัวอย่างสำเร็จ · ไม่มีข้อมูลส่งไปยังระบบจริง');
    window.dispatchEvent(new CustomEvent('mockup:report-saved', { detail: { savedAt: state.savedAt } }));
  });

  window.addEventListener('beforeunload', event => {
    if (!state.planDirty && !state.reportDirty) return;
    event.preventDefault();
    event.returnValue = '';
  });

  window.mockup = {
    navigate,
    setStep,
    updateReport,
    computeProgress,
    getExecutiveData: () => ({ projects: executiveProjects.map(project => ({ ...project, snapshots: { ...project.snapshots } })), asOf: $('#exec-asof').value }),
    getState: () => state,
    markDraftSaved: () => { state.reportDirty = false; setStatus('report', 'บันทึกร่างบนเครื่องนี้แล้ว', 'saved'); },
    markDirty,
    toast
  };

  updatePlan();
  renderQueue();
  updateReport();
  renderExecutive();
})();

(() => {
  'use strict';

  const KEY = 'mu-scurve-empty-workspace-v1';
  const FILE_DB = 'mu-scurve-empty-files-v1';
  const monthsTh = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const stages = [
    ['draft', 'ร่าง (%)'], ['approval', 'ขออนุมัติ (%)'], ['procure', 'จัดซื้อ (บาท)'],
    ['execute', 'ดำเนินการ (%)'], ['disburse', 'วางฎีกา (%)'], ['summary', 'สรุปผล (%)']
  ];
  const defaultWeights = { draft: 5, approval: 5, execute: 75, disburse: 5, summary: 10 };
  const empty = () => ({ budgets: {}, departments: [], projects: [], plans: {}, reports: [], documents: [], weights: {}, history: [] });
  const $ = selector => document.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const screen = $('#screen');
  const money = value => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(Number(value) || 0);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = () => new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
  const parseAmount = value => Number(String(value ?? '').replace(/,/g, ''));
  const safeNum = value => Number.isFinite(parseAmount(value)) ? parseAmount(value) : 0;
  const formatMoneyInput = value => value === '' || value == null ? '' : new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(safeNum(value));
  function formatMoneyTyping(value) {
    const clean = String(value).replace(/[^\d.]/g, '');
    if (!clean) return '';
    const point = clean.indexOf('.');
    const valid = point < 0 ? clean : clean.slice(0, point + 1) + clean.slice(point + 1).replace(/\./g, '').slice(0, 2);
    const [whole, cents] = valid.split('.');
    const grouped = (whole || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return cents === undefined ? grouped : `${grouped}.${cents}`;
  }
  const stepKeys = ['draft', 'approval', 'execute', 'disburse', 'summary'];
  const load = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
      return stored && typeof stored === 'object' ? { ...empty(), ...stored } : empty();
    } catch { return empty(); }
  };
  let db = load();
  let ui = { page: 'home', year: Number(db.lastYear) || 2569, projectId: '', month: db.lastMonth || '', reportId: '', editDept: '', editProject: '', editDoc: '', replaceFileId: '' };
  let toastTimer;
  let fileDbPromise;

  // The former screen stored only a draft and a role; remove both when starting this blank workflow.
  localStorage.removeItem('mu-sustainability-mockup-report-draft-v1');
  localStorage.removeItem('mu-sustainability-mockup-role-v1');

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
    catch { notice('เครื่องนี้เก็บข้อมูลเพิ่มไม่ได้ กรุณาตรวจพื้นที่ว่างของเบราว์เซอร์'); return false; }
  }
  function notice(message) {
    const box = $('#toast');
    box.textContent = message;
    box.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('show'), 4800);
  }
  function log(section, action, detail) {
    db.history.unshift({ id: uid(), section, action, detail, at: now() });
    db.history = db.history.slice(0, 100);
  }
  function fileDb() {
    if (!fileDbPromise) fileDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(FILE_DB, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('blobs');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return fileDbPromise;
  }
  async function fileAction(mode, id, blob) {
    const database = await fileDb();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('blobs', mode === 'get' ? 'readonly' : 'readwrite');
      const store = transaction.objectStore('blobs');
      const request = mode === 'put' ? store.put(blob, id) : mode === 'delete' ? store.delete(id) : mode === 'clear' ? store.clear() : store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function putFile(file) { const id = uid(); await fileAction('put', id, file); return id; }
  async function openFile(id) {
    try {
      const blob = await fileAction('get', id);
      if (!blob) return notice('ไม่พบเนื้อไฟล์ในเบราว์เซอร์นี้');
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch { notice('เปิดไฟล์ในเครื่องนี้ไม่ได้'); }
  }
  async function hydrateImages() {
    for (const image of $$('#screen img[data-blob-id]')) {
      try {
        const blob = await fileAction('get', image.dataset.blobId);
        if (blob && image.isConnected) image.src = URL.createObjectURL(blob);
      } catch { /* File metadata remains visible if browser storage is unavailable. */ }
    }
  }
  function yearMonths(year) {
    const start = Number(year) - 544;
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(start, 9 + index, 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });
  }
  function shiftMonth(key, count) {
    const [year, month] = key.split('-').map(Number);
    const date = new Date(year, month - 1 + count, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  function monthLabel(key) {
    if (!key) return '—';
    const [year, month] = key.split('-').map(Number);
    return `${monthsTh[month - 1]} ${year + 543}`;
  }
  function yearProjects() { return db.projects.filter(project => project.year === ui.year && project.active !== false); }
  function selectedProject() { return yearProjects().find(project => project.id === ui.projectId) || null; }
  function getPlan(projectId) { return db.plans[projectId] || null; }
  function getReport(projectId, month) { return db.reports.find(report => report.projectId === projectId && report.month === month) || null; }
  function projectReports(projectId) { return db.reports.filter(report => report.projectId === projectId).sort((a, b) => a.month.localeCompare(b.month)); }
  function weights() { return db.weights[ui.year] || defaultWeights; }
  function progress(phases = {}) { return stepKeys.reduce((sum, key) => sum + Math.min(100, Math.max(0, safeNum(phases[key]))) * weights()[key] / 100, 0); }
  function plannedAt(projectId, month) {
    const plan = getPlan(projectId);
    if (!plan) return 0;
    const phases = {};
    stepKeys.forEach(key => phases[key] = Math.min(100, plan.months.filter(row => row.key <= month).reduce((sum, row) => sum + safeNum(row[key]), 0)));
    return progress(phases);
  }
  function paid(report) { return safeNum(report.procurementPaid) + safeNum(report.loanPaid) + safeNum(report.otherPaid); }
  function paidThrough(projectId, month) { return db.reports.filter(report => report.projectId === projectId && report.month <= month).reduce((sum, report) => sum + paid(report), 0); }
  function latestMonth() { return db.reports.filter(report => yearProjects().some(project => project.id === report.projectId)).map(report => report.month).sort().at(-1) || yearMonths(ui.year)[0]; }
  function projectOptions(selected = ui.projectId) { return yearProjects().map(project => `<option value="${esc(project.id)}" ${selected === project.id ? 'selected' : ''}>${esc(project.name)}</option>`).join(''); }
  function chooseProject() { if (!yearProjects().some(project => project.id === ui.projectId)) ui.projectId = yearProjects()[0]?.id || ''; }
  function chooseMonth() {
    const plan = getPlan(ui.projectId);
    const choices = plan?.months?.map(row => row.key) || yearMonths(ui.year);
    if (!choices.includes(ui.month)) ui.month = (db.reports.map(report=>report.month).sort().at(-1) && choices.includes(latestMonth()) ? latestMonth() : choices[0]) || yearMonths(ui.year)[0];
  }
  function heading(kicker, title, description, aside = '') { return `<div class="page-head"><div><p class="eyebrow">${esc(kicker)}</p><h1>${esc(title)}</h1><p class="muted">${esc(description)}</p></div>${aside}</div>`; }
  function emptyBox(title, detail, page, button) { return `<div class="empty-box"><strong>${esc(title)}</strong>${esc(detail)}${page ? `<div class="starter-actions" style="justify-content:center"><button class="btn primary-btn" data-go="${page}">${esc(button)}</button></div>` : ''}</div>`; }
  function controls(project = true, month = false) {
    return `<div class="card starter-toolbar"><label>ปีงบประมาณ<input id="context-year" type="number" min="2560" max="2600" value="${ui.year}"></label><button type="button" class="mini-btn" id="apply-year">ดูข้อมูลปีที่เลือก</button>${project ? `<label>โครงการ<select id="context-project">${projectOptions()}</select></label>` : ''}${month ? `<label>เดือน<select id="context-month">${(getPlan(ui.projectId)?.months?.map(row => row.key) || yearMonths(ui.year)).map(key => `<option value="${key}" ${ui.month === key ? 'selected' : ''}>${monthLabel(key)}</option>`).join('')}</select></label>` : ''}<span class="muted" style="font-size:12px">ข้อมูลทั้งหมดในต้นแบบนี้เก็บเฉพาะเบราว์เซอร์เครื่องนี้</span></div>`;
  }
  function render() {
    chooseProject(); chooseMonth();
    $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.page === ui.page));
    const views = { home: renderHome, admin: renderAdmin, plan: renderPlan, report: renderReport, review: renderReview, dashboard: renderDashboard, archive: renderArchive, 'project-output': renderProjectOutput, 'portfolio-output': renderPortfolioOutput };
    screen.innerHTML = (views[ui.page] || renderHome)();
    hydrateImages();
  }
  function navigate(page) { ui.page = page; ui.editDept = ''; ui.editProject = ''; ui.editDoc = ''; render(); window.scrollTo(0, 0); }

  function renderHome() {
    const projectCount = yearProjects().length;
    const planCount = yearProjects().filter(project => getPlan(project.id)).length;
    const reportCount = db.reports.filter(report => yearProjects().some(project => project.id === report.projectId)).length;
    const checklist = [
      { ready: Boolean(db.budgets[ui.year]), label: 'ตั้งงบปี', detail: 'เริ่มที่หน้าแอดมิน', page: 'admin' },
      { ready: db.departments.length > 0 && projectCount > 0, label: 'เพิ่มหน่วยงานและโครงการ', detail: 'ระบุผู้รับผิดชอบ', page: 'admin' },
      { ready: planCount > 0, label: 'วางแผนรายเดือน', detail: 'กำหนดงาน เงิน และ SDG', page: 'plan' },
      { ready: reportCount > 0, label: 'รายงานผลรายเดือน', detail: 'กรอกผลและแนบภาพ', page: 'report' }
    ];
    return `${heading('เริ่มจากข้อมูลว่าง', 'ทดลองทำเองทุกขั้นตอน', 'ข้อมูลตัวอย่างเดิมถูกถอดออกจากเว็บจำลองแล้ว คุณเริ่มกรอกได้ตามลำดับด้านล่าง', `<span class="readonly-pill">ปีงบ ${ui.year} · ข้อมูลส่วนตัวในเครื่อง</span>`)}
      <div class="starter-banner"><div><span class="kicker">พื้นที่ทดลองของคุณ</span><h2>${projectCount ? `มี ${projectCount} โครงการที่คุณเพิ่มเอง` : 'ยังไม่มีโครงการหรือตัวเลขตั้งต้น'}</h2><p>เริ่มจากตั้งงบปีและหน่วยงาน แล้วเพิ่มโครงการก่อนวางแผนและรายงานผล</p></div><button class="btn" data-go="admin">ไปตั้งค่าหน้าแอดมิน →</button></div>
      ${controls(false)}<div class="flow-list">${checklist.map((item, index) => `<button class="flow-step ${item.ready ? 'ready' : ''}" data-go="${item.page}"><b>${String(index + 1).padStart(2, '0')} · ${item.ready ? 'ทำแล้ว' : 'รอทำ'}</b><strong>${item.label}</strong><small>${item.detail}</small></button>`).join('')}</div>
      <h2 class="section-title">ข้อมูลที่กรอกในปีนี้</h2><div class="starter-grid"><div class="starter-card"><span>งบประมาณปี</span><strong>${db.budgets[ui.year] ? `${money(db.budgets[ui.year].amount)} บาท` : 'ยังไม่ได้ตั้ง'}</strong></div><div class="starter-card"><span>โครงการ</span><strong>${projectCount}</strong><p>มีแผน ${planCount} โครงการ</p></div><div class="starter-card"><span>รายงานที่บันทึก</span><strong>${reportCount}</strong><p>แสดงบนแดชบอร์ดและหน้าเอกสารย้อนหลัง</p></div></div>
      <div class="soft-note">ข้อมูลที่คุณกรอกจะอยู่ในเบราว์เซอร์เครื่องนี้เมื่อรีเฟรชหน้า แต่ไม่ได้ส่งไป Google Sheets, Apps Script หรือ Drive จริง ไฟล์แนบจะอยู่ในพื้นที่เก็บข้อมูลของเบราว์เซอร์นี้เท่านั้น</div>`;
  }

  function renderAdmin() {
    const budget = db.budgets[ui.year];
    const projects = yearProjects();
    const allocation = projects.reduce((sum, project) => sum + safeNum(project.budget), 0);
    const deptEdit = db.departments.find(item => item.id === ui.editDept);
    const projectEdit = db.projects.find(item => item.id === ui.editProject);
    const docEdit = db.documents.find(item => item.id === ui.editDoc);
    const docs = db.documents.filter(item => item.year === ui.year);
    const currentWeights = weights();
    return `${heading('ดูแลข้อมูลตั้งต้น', 'แอดมิน · ตั้งค่าระบบ', 'จัดงบ หน่วยงาน โครงการ ค่าน้ำหนัก และเอกสาร แล้วตรวจรายการย้อนหลังได้')}${controls(false)}
      <div class="starter-kpis"><div><span>งบที่อนุมัติ</span><strong>${budget ? money(budget.amount) : '—'}</strong><small>บาท · ปี ${ui.year}</small></div><div><span>รวมงบโครงการ</span><strong>${money(allocation)}</strong><small>${projects.length} โครงการ</small></div><div><span>ยังไม่ได้จัดสรร</span><strong class="${budget && allocation > budget.amount ? 'alert' : ''}">${budget ? money(budget.amount - allocation) : '—'}</strong><small>บาท · ติดลบเมื่อจัดสรรเกิน</small></div><div><span>เอกสารปีนี้</span><strong>${docs.length}</strong><small>รายการที่คุณเพิ่ม</small></div></div>
      <section class="card" id="admin-budget"><div class="starter-section-title"><div><h2>1 · งบประมาณประจำปี</h2><p>บันทึกได้หลายปี แล้วเลือกปีด้านบนเพื่อดูย้อนหลัง</p></div></div>
        <form id="budget-form"><div class="starter-form-grid two"><label>ปีงบประมาณ<input value="${ui.year}" readonly></label><label>ยอดงบอนุมัติ (บาท)<input name="amount" type="text" inputmode="decimal" data-money required value="${budget ? esc(formatMoneyInput(budget.amount)) : ''}" placeholder="เช่น 5,000,000"></label></div><div class="starter-actions"><button class="btn primary-btn">${budget ? 'บันทึกยอดงบที่แก้ไข' : 'บันทึกงบปีนี้'}</button></div></form>
        <div class="table-scroll"><table class="starter-table"><thead><tr><th>ปีงบ</th><th>งบที่ตั้ง</th><th>แก้ล่าสุด</th><th>จัดการ</th></tr></thead><tbody>${Object.entries(db.budgets).sort((a,b)=>Number(b[0])-Number(a[0])).map(([year, item]) => `<tr><td>${year}</td><td>${money(item.amount)} บาท</td><td>${esc(item.updatedAt)}</td><td class="actions">${Number(year) === ui.year ? '<span class="current-year-tag">กำลังดูปีนี้</span>' : `<button class="mini-btn" data-year-open="${year}">ดูข้อมูลปี ${year}</button>`}<button class="mini-btn danger" data-delete-budget="${year}">ลบ</button></td></tr>`).join('') || '<tr><td colspan="4">ยังไม่มีงบปีใดที่บันทึก</td></tr>'}</tbody></table></div></section>
      <section class="card" id="admin-departments"><div class="starter-section-title"><div><h2>2 · หน่วยงานและหัวหน้า</h2><p>แก้ข้อมูลได้เมื่อหัวหน้าหรือผู้ประสานงานเปลี่ยน</p></div></div>
        <form id="department-form"><div class="starter-form-grid four"><label>ชื่อหน่วยงาน<input name="name" required value="${esc(deptEdit?.name)}" placeholder="ชื่อหน่วยงาน"></label><label>ชื่อหัวหน้า<input name="head" required value="${esc(deptEdit?.head)}"></label><label>อีเมลหัวหน้า<input name="email" type="email" required value="${esc(deptEdit?.email)}"></label><label>มีผลตั้งแต่<input name="since" type="date" value="${esc(deptEdit?.since)}"></label></div><div class="starter-actions"><button class="btn primary-btn">${deptEdit ? 'บันทึกการแก้ไข' : 'เพิ่มหน่วยงาน'}</button>${deptEdit ? '<button type="button" class="btn quiet-btn" data-cancel-edit>ยกเลิกแก้ไข</button>' : ''}</div></form>
        <div class="table-scroll"><table class="starter-table"><thead><tr><th>หน่วยงาน</th><th>หัวหน้า</th><th>อีเมล</th><th>มีผลตั้งแต่</th><th>จัดการ</th></tr></thead><tbody>${db.departments.map(item => `<tr><td>${esc(item.name)}</td><td>${esc(item.head)}</td><td>${esc(item.email)}</td><td>${item.since || '—'}</td><td class="actions"><button class="mini-btn" data-edit-dept="${item.id}">แก้ไข</button><button class="mini-btn danger" data-delete-dept="${item.id}">ลบ</button></td></tr>`).join('') || '<tr><td colspan="5">ยังไม่มีหน่วยงาน</td></tr>'}</tbody></table></div></section>
      <section class="card" id="admin-projects"><div class="starter-section-title"><div><h2>3 · โครงการและผู้รับผิดชอบ</h2><p>เจ้าของหลัก 1 คน และผู้ร่วมรับผิดชอบได้อีก 2 คน</p></div></div>
        ${!budget ? '<div class="soft-note warn">กรุณาตั้งงบปีนี้ก่อนเพิ่มโครงการ เพื่อดูยอดจัดสรรเทียบงบ</div>' : ''}
        <form id="project-form"><div class="starter-form-grid three"><label class="wide">ชื่อโครงการ<input name="name" required value="${esc(projectEdit?.name)}" placeholder="กรอกชื่อโครงการ"></label><label>หน่วยงาน<select name="deptId" required><option value="">เลือกหน่วยงาน</option>${db.departments.map(dept => `<option value="${dept.id}" ${projectEdit?.deptId === dept.id ? 'selected' : ''}>${esc(dept.name)}</option>`).join('')}</select></label><label>งบโครงการ (บาท)<input name="budget" type="text" inputmode="decimal" data-money required value="${projectEdit ? esc(formatMoneyInput(projectEdit.budget)) : ''}" placeholder="เช่น 200,000"></label><label>สถานะ<select name="active"><option value="true" ${projectEdit?.active !== false ? 'selected' : ''}>ใช้งาน</option><option value="false" ${projectEdit?.active === false ? 'selected' : ''}>พัก/ยกเลิก</option></select></label>
          <div class="owner-list"><div class="owner-list-heading">ผู้รับผิดชอบโครงการ</div>${[0,1,2].map(index => `<div class="owner-row"><div class="owner-role">${index === 0 ? 'หลัก <span>จำเป็น</span>' : `รอง ${index}`}</div><label>ชื่อผู้รับผิดชอบ<input name="ownerName${index}" ${index === 0 ? 'required' : ''} value="${esc(projectEdit?.owners?.[index]?.name)}" placeholder="ชื่อ–นามสกุล"></label><label>อีเมล<input name="ownerEmail${index}" type="email" ${index === 0 ? 'required' : ''} value="${esc(projectEdit?.owners?.[index]?.email)}" placeholder="name@mahidol.ac.th"></label></div>`).join('')}</div></div>
          <div class="starter-actions"><button class="btn primary-btn">${projectEdit ? 'บันทึกการแก้ไขโครงการ' : 'เพิ่มโครงการ'}</button>${projectEdit ? '<button type="button" class="btn quiet-btn" data-cancel-edit>ยกเลิกแก้ไข</button>' : ''}<span class="muted">งบโครงการรวม ${money(allocation)} ${budget ? `/ ${money(budget.amount)} บาท` : 'บาท · ยังไม่ตั้งงบปี'}</span></div></form>
        <div class="table-scroll"><table class="starter-table"><thead><tr><th>โครงการ</th><th>หน่วยงาน</th><th>งบ</th><th>ผู้รับผิดชอบหลัก</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>${db.projects.filter(project=>project.year===ui.year).map(item => `<tr><td>${esc(item.name)}</td><td>${esc(db.departments.find(dept=>dept.id===item.deptId)?.name || '—')}</td><td>${money(item.budget)} บาท</td><td>${esc(item.owners?.[0]?.name || '—')}</td><td>${item.active === false ? 'พัก/ยกเลิก' : 'ใช้งาน'}</td><td class="actions"><button class="mini-btn" data-edit-project="${item.id}">แก้ไข</button><button class="mini-btn danger" data-delete-project="${item.id}">ลบ</button></td></tr>`).join('') || '<tr><td colspan="6">ยังไม่มีโครงการในปีนี้</td></tr>'}</tbody></table></div></section>
      <section class="card"><div class="starter-section-title"><div><h2>4 · ค่าน้ำหนักขั้นตอน</h2><p>ค่าเริ่มต้นเป็นกฎคำนวณ ไม่ใช่ผลโครงการตัวอย่าง</p></div></div><form id="weights-form"><div class="starter-form-grid four">${stepKeys.map(key => `<label>${esc(stages.find(item=>item[0]===key)?.[1] || key)}<input name="${key}" type="number" min="0" max="100" required value="${esc(currentWeights[key])}"></label>`).join('')}</div><div class="starter-actions"><button class="btn primary-btn">บันทึกน้ำหนักปี ${ui.year}</button><span class="muted">ผลรวมต้องเท่ากับ 100%</span></div></form></section>
      <section class="card" id="admin-documents"><div class="starter-section-title"><div><h2>5 · ศูนย์เอกสารอ้างอิง</h2><p>อัปโหลดไฟล์จากเครื่องและกำหนดว่าจะให้เห็นบนแดชบอร์ดหรือไม่</p></div></div>
        <form id="document-form"><div class="starter-form-grid three"><label class="wide">ชื่อเอกสาร<input name="title" required value="${esc(docEdit?.title)}" placeholder="เช่น หนังสืออนุมัติหลักการโครงการ"></label><label>ขอบเขต<select name="scope"><option value="central" ${docEdit?.scope !== 'project' ? 'selected' : ''}>ส่วนกลางทั้งปี</option><option value="project" ${docEdit?.scope === 'project' ? 'selected' : ''}>เฉพาะโครงการ</option></select></label><label>โครงการ<select name="projectId"><option value="">ไม่ระบุ / ส่วนกลาง</option>${projectOptions(docEdit?.projectId || '')}</select></label><label>ประเภท<select name="category">${['อนุมัติแผนใหญ่','จัดสรรงบ','อนุมัติโครงการ','จัดซื้อจัดจ้าง','ตรวจรับ','เงินยืม/วางฎีกา','ขยายเวลา','อื่น ๆ'].map(category => `<option ${docEdit?.category===category ? 'selected' : ''}>${category}</option>`).join('')}</select></label><label>เลขที่หนังสือ<input name="number" value="${esc(docEdit?.number)}"></label><label>ไฟล์ PDF / Word<input name="file" type="file" accept=".pdf,.doc,.docx"></label><label style="align-self:end"><input name="visible" type="checkbox" ${docEdit?.visible ? 'checked' : ''} style="width:auto;min-height:auto"> แสดงบนแดชบอร์ด</label></div><div class="starter-actions"><button class="btn primary-btn">${docEdit ? 'บันทึกการแก้ไขเอกสาร' : 'เพิ่มเอกสาร'}</button>${docEdit ? '<button type="button" class="btn quiet-btn" data-cancel-edit>ยกเลิกแก้ไข</button>' : ''}<span class="muted">ไฟล์อยู่ในเบราว์เซอร์เครื่องนี้ ไม่ขึ้น Drive</span></div></form>
        <div class="table-scroll"><table class="starter-table"><thead><tr><th>ชื่อเอกสาร</th><th>ขอบเขต</th><th>ประเภท</th><th>ไฟล์</th><th>หน้าแดชบอร์ด</th><th>จัดการ</th></tr></thead><tbody>${docs.map(item => `<tr><td>${esc(item.title)}<small style="display:block;color:#718198">${esc(item.number)}</small></td><td>${item.scope === 'central' ? 'ส่วนกลาง' : esc(db.projects.find(project=>project.id===item.projectId)?.name || 'โครงการที่ถูกลบ')}</td><td>${esc(item.category)}</td><td>${esc(item.fileName || 'ยังไม่แนบไฟล์')}</td><td>${item.visible ? 'แสดง' : 'ซ่อน'}</td><td class="actions">${item.blobId ? `<button class="mini-btn" data-open-file="${item.blobId}">เปิดไฟล์</button>` : ''}<button class="mini-btn" data-edit-doc="${item.id}">แก้ไข</button><button class="mini-btn danger" data-delete-doc="${item.id}">ลบ</button></td></tr>`).join('') || '<tr><td colspan="6">ยังไม่มีเอกสาร</td></tr>'}</tbody></table></div></section>
      <section class="card"><div class="starter-section-title"><div><h2>ประวัติการจัดการ</h2><p>แสดงรายการที่คุณบันทึกหรือแก้ไขในเว็บจำลอง</p></div></div><div class="file-list">${db.history.filter(item=>item.year===ui.year || !item.year).slice(0,12).map(item => `<div class="file-item"><div><strong>${esc(item.section)} · ${esc(item.action)}</strong><small>${esc(item.detail)}</small></div><small>${esc(item.at)}</small></div>`).join('') || emptyBox('ยังไม่มีประวัติ', 'เมื่อเริ่มบันทึกจะแสดงที่นี่')}</div></section>
      <section class="card"><h2>เริ่มใหม่อีกครั้ง</h2><p class="muted">ลบข้อมูลทดลองทั้งหมดในเบราว์เซอร์นี้ รวมถึงไฟล์ที่อัปโหลดไว้ในพื้นที่ทดลอง</p><div class="starter-actions"><button class="btn quiet-btn" id="reset-sandbox">ล้างข้อมูลทดลองทั้งหมด</button></div></section>`;
  }

  function renderPlan() {
    const project = selectedProject();
    if (!project) return `${heading('ขั้นตอนต่อไป', 'วางแผนโครงการ', 'เมื่อแอดมินเพิ่มโครงการแล้ว คุณจะกำหนดแผนรายเดือนได้')}${controls(true)}${emptyBox('ยังไม่มีโครงการในปีนี้', 'กรุณาตั้งงบ หน่วยงาน และเพิ่มโครงการก่อน', 'admin', 'ไปหน้าแอดมิน')}`;
    const saved = getPlan(project.id);
    const plan = ui.planDraft?.projectId === project.id ? ui.planDraft : saved || { months: yearMonths(ui.year).map(key => ({ key })), sdgs: [], indicator: '', target: '' };
    const totals = Object.fromEntries(stages.map(([key]) => [key, plan.months.reduce((sum, row) => sum + safeNum(row[key]), 0)]));
    return `${heading('ขั้นตอนที่ 1 ของโครงการ', 'วางแผน/ปรับช่วงเวลาโครงการ', 'ตัวเลขร้อยละอยู่กลางช่อง เงินจัดซื้อแยกพื้นสีฟ้า และเพิ่มเดือนก่อน/หลังปีงบได้', `<span class="status-pill ${saved ? 'saved' : ''}">${saved ? `บันทึกแล้ว ${esc(saved.savedAt)}` : 'ยังไม่บันทึกแผน'}</span>`)}${controls(true)}
      <div class="soft-note">โครงการ: <b>${esc(project.name)}</b> · วงเงิน ${money(project.budget)} บาท · ค่าน้ำหนักความคืบหน้าใช้ชุดปี ${ui.year} ผู้กรอกสามารถบันทึกแผนบางส่วนแล้วกลับมาแก้ได้</div>
      <form id="plan-form"><section class="card"><div class="starter-section-title"><div><h2>ข้อมูลแผนและ SDG</h2><p>กำหนดเป้าหมายที่ใช้ดูผลจริงในรายงานรายเดือน</p></div></div><div class="starter-form-grid three"><label>เดือนเริ่มแผน<input name="baselineStart" type="month" value="${esc(plan.baselineStart || plan.months[0]?.key)}"></label><label>เดือนเสร็จตามแผนตั้งต้น<input name="baselineEnd" type="month" value="${esc(plan.baselineEnd || plan.months.at(-1)?.key)}"></label><label>SDG ที่เกี่ยวข้อง<input name="sdgs" value="${esc((plan.sdgs || []).join(', '))}" placeholder="เช่น SDG 12, SDG 13"></label><label class="wide">ตัวชี้วัดผลลัพธ์<input name="indicator" value="${esc(plan.indicator)}" placeholder="เช่น ปริมาณขยะที่คัดแยกได้"></label><label>เป้าหมายตัวชี้วัด<input name="target" value="${esc(plan.target)}" placeholder="เช่น 120 ตัน"></label></div></section>
      <section class="card table-card"><div class="starter-section-title" style="padding:18px 20px 0"><div><h2>แผนรายเดือน</h2><p>กรอกร้อยละที่จะทำในเดือนนั้น · เงินจัดซื้อเป็นจำนวนบาท</p></div><span class="legend-money">สีฟ้า = จำนวนเงิน (บาท)</span></div><div class="starter-actions" style="padding:0 20px 10px"><button type="button" class="mini-btn" data-plan-add="before">+ เดือนก่อนหน้า</button><button type="button" class="mini-btn" data-plan-add="after">+ เดือนถัดไป</button></div><div class="table-scroll"><table class="period-table"><thead><tr><th>เดือน/ปี</th>${stages.map(([key,label])=>`<th class="${key==='procure'?'money-cell':''}">${label}</th>`).join('')}</tr></thead><tbody>${plan.months.map(row => `<tr data-month="${row.key}"><th>${monthLabel(row.key)}</th>${stages.map(([key]) => `<td class="${key==='procure'?'money-cell':'percent-cell'}"><input data-stage="${key}" ${key==='procure'?'type="text" inputmode="decimal" data-money':'type="number" min="0" max="100" step="0.1"'} value="${key==='procure'?esc(formatMoneyInput(row[key])):row[key] ?? ''}" aria-label="${esc(stages.find(item=>item[0]===key)?.[1])} ${monthLabel(row.key)}"></td>`).join('')}</tr>`).join('')}</tbody><tfoot><tr><th>รวมตามแผน</th>${stages.map(([key])=>`<td id="plan-total-${key}" class="${key==='procure'?'money-cell':''}">${money(totals[key])}${key==='procure'?' บาท':'%'}</td>`).join('')}</tr></tfoot></table></div></section><div class="card"><div id="plan-validation" class="soft-note">รวมงบจัดซื้อ ${money(totals.procure)} / ${money(project.budget)} บาท · ร้อยละแต่ละขั้นตอนควรรวมเป็น 100% เมื่อแผนครบ</div><div class="starter-actions"><button class="btn primary-btn">บันทึกแผนโครงการ</button><span class="muted">แผนตั้งต้นที่บันทึกจะไปแสดงในตารางและกราฟ</span></div></div></form>`;
  }

  function renderReport() {
    const project = selectedProject();
    if (!project) return `${heading('ขั้นตอนที่ 2', 'รายงานผลรายเดือน', 'เริ่มได้หลังเพิ่มโครงการ')}${controls(true,true)}${emptyBox('ยังไม่มีโครงการ', 'แอดมินต้องเพิ่มโครงการก่อน', 'admin', 'ไปหน้าแอดมิน')}`;
    const plan = getPlan(project.id);
    if (!plan) return `${heading('ขั้นตอนที่ 2', 'รายงานผลรายเดือน', 'กำหนดแผนโครงการก่อนเพื่อให้เปรียบเทียบผลจริงได้')}${controls(true,true)}${emptyBox('โครงการนี้ยังไม่มีแผน', 'กรุณาบันทึกแผนรายเดือนก่อน', 'plan', 'ไปวางแผน')}`;
    const report = getReport(project.id, ui.month);
    const prior = projectReports(project.id).filter(item => item.month < ui.month).at(-1);
    const phase = report?.phases || prior?.phases || {};
    const planValue = plannedAt(project.id, ui.month);
    const history = projectReports(project.id).map(item => `<div class="file-item"><div><strong>${monthLabel(item.month)} · ฉบับ ${item.version}</strong><small>บันทึกล่าสุด ${esc(item.updatedAt)} · ${money(paid(item))} บาท</small></div><button class="mini-btn" data-open-report="${item.id}">เปิดรายงาน</button></div>`).join('');
    return `${heading('ขั้นตอนที่ 2 ของโครงการ', 'บันทึกผลการดำเนินงานรายเดือน', 'กรอกผลสะสมในแต่ละขั้นตอน เงินที่จ่ายจริง และสรุปกิจกรรมของเดือนนี้', `<span class="status-pill ${report ? 'saved' : ''}">${report ? `บันทึกแล้ว · ฉบับ ${report.version}` : 'ยังไม่มีรายงานเดือนนี้'}</span>`)}${controls(true,true)}
      <div class="soft-note">แผนสะสมถึง ${monthLabel(ui.month)}: <b>${planValue.toFixed(1)}%</b> · ผลล่าสุดก่อนเดือนนี้: <b>${prior ? `${progress(prior.phases).toFixed(1)}%` : 'ยังไม่มี'}</b> · บันทึกเดือนเดิมจะออกเป็นฉบับแก้ไข</div>
      <form id="report-form"><section class="card"><h2>1 · ความก้าวหน้าสะสม</h2><p class="muted">ใส่ผลสะสมของแต่ละขั้นตอนตั้งแต่เริ่มโครงการถึงสิ้นเดือนที่เลือก (0–100%)</p><div class="starter-form-grid four">${stepKeys.map(key => `<label>${esc(stages.find(item=>item[0]===key)?.[1] || key)}<input name="${key}" type="number" min="0" max="100" step="0.1" value="${phase[key] ?? ''}"></label>`).join('')}</div><div class="soft-note" id="report-live-progress">ผลสะสม ${progress(phase).toFixed(1)}% · แผนสะสม ${planValue.toFixed(1)}%</div></section>
      <section class="card"><h2>2 · เงินที่จ่ายออกจริงในเดือนนี้</h2><p class="muted">แยกยอดตามช่องทางเพื่อให้ตรวจหลักฐานได้ โดยระบบรวมเป็นยอดจ่ายเดือนนี้หนึ่งครั้ง</p><div class="starter-form-grid three"><label>พัสดุ / ตรวจรับแล้วจ่าย (บาท)<input name="procurementPaid" type="text" inputmode="decimal" data-money value="${esc(formatMoneyInput(report?.procurementPaid))}" placeholder="0"></label><label>เงินยืม / วางฎีกา (บาท)<input name="loanPaid" type="text" inputmode="decimal" data-money value="${esc(formatMoneyInput(report?.loanPaid))}" placeholder="0"></label><label>จ่ายอื่น ๆ (บาท)<input name="otherPaid" type="text" inputmode="decimal" data-money value="${esc(formatMoneyInput(report?.otherPaid))}" placeholder="0"></label></div><div class="soft-note">ยอดจ่ายสะสมก่อนเดือนนี้ ${money(db.reports.filter(item=>item.projectId===project.id&&item.month<ui.month).reduce((sum,item)=>sum+paid(item),0))} บาท · งบโครงการ ${money(project.budget)} บาท</div></section>
      <section class="card"><h2>3 · สรุปผลและหลักฐาน</h2><div class="starter-form-grid two"><label class="wide">สรุปผลการดำเนินงานประจำเดือน *<textarea name="summaryText" required placeholder="เดือนนี้ทำอะไร ได้ผลอย่างไร มีเรื่องใดต้องติดตาม">${esc(report?.summaryText)}</textarea></label><label class="wide">สาเหตุล่าช้าและแนวทางแก้ไข<textarea name="delay" placeholder="กรอกเมื่อผลต่ำกว่าแผน หรือคาดว่าจะขยายเวลา">${esc(report?.delay)}</textarea></label><label>คาดว่าจะเสร็จเดือนใด<input name="forecastMonth" type="month" value="${esc(report?.forecastMonth || plan.baselineEnd)}"></label><label>ผลลัพธ์ตามตัวชี้วัด SDG<input name="sdgOutcome" value="${esc(report?.sdgOutcome)}" placeholder="เช่น คัดแยกขยะได้ 72 ตัน"></label><label class="wide">เพิ่มรูปภาพหรือ PDF<input name="attachments" type="file" accept="image/*,.pdf" multiple></label></div><div class="soft-note">${report?.attachments?.length ? `ไฟล์ที่บันทึกในเดือนนี้ ${report.attachments.length} รายการ · ลบหรือแทนที่ได้ด้านล่าง` : 'ยังไม่มีไฟล์ของเดือนนี้ · ภาพที่แนบจะให้เลือกภาพเด่นหลังบันทึก'} ภาพต่อเดือนสูงสุด 10 ภาพ</div>
        <div class="file-list">${(report?.attachments || []).map(file => `<div class="file-item"><div><strong>${esc(file.name)}</strong><small>เพิ่ม ${esc(file.uploadedAt)}${file.isImage ? ' · รูปภาพ' : ' · เอกสาร'}</small></div><div class="btn-group"><button type="button" class="mini-btn" data-open-file="${file.blobId}">เปิด</button><button type="button" class="mini-btn" data-replace-attachment="${file.id}">แทนที่</button><button type="button" class="mini-btn danger" data-remove-attachment="${file.id}">ลบ</button></div></div>`).join('')}</div><input id="attachment-replacement" type="file" accept="image/*,.pdf" hidden></section>
      <section class="card"><div class="starter-actions"><button class="btn primary-btn">${report ? 'บันทึกฉบับแก้ไขและดูสรุป' : 'บันทึกรายงานและดูสรุป'}</button><span class="muted">ข้อมูลจะอยู่ในเบราว์เซอร์นี้ ไม่ส่งไประบบจริง</span></div></section></form>
      <section class="card"><h2>ประวัติรายงานของโครงการนี้</h2><div class="file-list">${history || emptyBox('ยังไม่มีรายงาน', 'เมื่อบันทึกเดือนแรก รายการจะปรากฏที่นี่')}</div></section>`;
  }

  function status(project, month) {
    const report = getReport(project.id, month);
    if (!report) return { label: 'รอรายงาน', className: 'status-pending', difference: null };
    const difference = progress(report.phases) - plannedAt(project.id, month);
    return difference < -5 ? { label: 'ช้ากว่าแผน', className: 'status-bad', difference } : difference > 5 ? { label: 'เร็วกว่าแผน', className: 'status-good', difference } : { label: 'ตามแผน', className: 'status-good', difference };
  }
  function chartSvg(keys, plan, actual, forecast = []) {
    if (!keys.length) return '<div class="empty-box">ยังไม่มีข้อมูลสำหรับกราฟ</div>';
    const width = 860, height = 240, left = 44, right = 12, top = 15, bottom = 38;
    const x = index => left + index * (width - left - right) / Math.max(1, keys.length - 1);
    const y = value => top + (100 - value) * (height - top - bottom) / 100;
    const line = values => values.map((value, index) => value === null || value === undefined ? null : `${x(index).toFixed(1)},${y(Math.max(0,Math.min(100,value))).toFixed(1)}`).filter(Boolean).join(' ');
    const actualSegments = [];
    let run = [];
    actual.forEach((value,index) => { if (value === null || value === undefined) { if (run.length) actualSegments.push(run.join(' ')); run=[]; } else run.push(`${x(index).toFixed(1)},${y(value).toFixed(1)}`); });
    if (run.length) actualSegments.push(run.join(' '));
    const ticks = [0,25,50,75,100].map(value => `<line x1="${left}" x2="${width-right}" y1="${y(value)}" y2="${y(value)}" stroke="#e3ebf4"/><text x="${left-8}" y="${y(value)+4}" text-anchor="end" font-size="11" fill="#7c8da2">${value}</text>`).join('');
    const labels = keys.map((key,index) => index%2===0 || index===keys.length-1 ? `<text x="${x(index)}" y="${height-12}" text-anchor="middle" font-size="10" fill="#718299">${monthLabel(key)}</text>` : '').join('');
    return `<svg class="starter-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="กราฟแผนตั้งต้น ผลจริง และคาดการณ์" xmlns="http://www.w3.org/2000/svg">${ticks}${labels}<polyline fill="none" stroke="#3078d7" stroke-width="3" stroke-dasharray="8 6" points="${line(plan)}"/>${actualSegments.map(points=>`<polyline fill="none" stroke="#15956e" stroke-width="4" points="${points}"/>`).join('')}${forecast.some(value=>value!==null&&value!==undefined) ? `<polyline fill="none" stroke="#e2a535" stroke-width="3" stroke-dasharray="6 5" points="${line(forecast)}"/>` : ''}</svg>`;
  }
  function projectCurve(project) {
    const plan = getPlan(project.id);
    const keys = plan?.months?.map(row=>row.key) || yearMonths(ui.year);
    const baseline = keys.map(key => plannedAt(project.id,key));
    const actual = keys.map(key => getReport(project.id,key) ? progress(getReport(project.id,key).phases) : null);
    const forecast = Array(keys.length).fill(null);
    const last = actual.findLastIndex(value=>value!==null);
    if (last>=0 && last<keys.length-1) {
      const finalIndex = Math.max(last+1, keys.indexOf(projectReports(project.id).at(-1)?.forecastMonth || plan?.baselineEnd));
      for (let index=last; index<keys.length; index++) forecast[index] = index>=finalIndex ? 100 : actual[last]+(100-actual[last])*(index-last)/(finalIndex-last);
    }
    return chartSvg(keys,baseline,actual,forecast);
  }
  function overallCurve(projects) {
    const keys = [...new Set(projects.flatMap(project=>getPlan(project.id)?.months?.map(row=>row.key)||[]))].sort();
    const baseline = keys.map(key => { const planned=projects.filter(project=>getPlan(project.id)); const total=planned.reduce((sum,project)=>sum+safeNum(project.budget),0); return total ? planned.reduce((sum,project)=>sum+plannedAt(project.id,key)*safeNum(project.budget),0)/total : 0; });
    const actual = keys.map(key => { const available=projects.map(project=>({project,report:getReport(project.id,key)})).filter(item=>item.report); const total=available.reduce((sum,item)=>sum+safeNum(item.project.budget),0); return total ? available.reduce((sum,item)=>sum+progress(item.report.phases)*safeNum(item.project.budget),0)/total : null; });
    return chartSvg(keys,baseline,actual);
  }
  function renderReview() {
    const project = selectedProject();
    if (!project) return `${heading('ตรวจข้อมูล', 'ตรวจแผนเทียบผล', 'ตารางจะปรากฏเมื่อเพิ่มโครงการและบันทึกแผน')}${controls(true)}${emptyBox('ยังไม่มีโครงการ', 'เริ่มที่หน้าแอดมินก่อน', 'admin', 'ไปหน้าแอดมิน')}`;
    const plan = getPlan(project.id);
    if (!plan) return `${heading('ตรวจข้อมูล', 'ตรวจแผนเทียบผล', 'โครงการนี้ยังไม่มีแผนรายเดือน')}${controls(true)}${emptyBox('ยังไม่มีแผน', 'กรอกแผนก่อนแล้วกลับมาตรวจ', 'plan', 'ไปวางแผน')}`;
    const report = getReport(project.id,ui.month);
    const state = status(project,ui.month);
    return `${heading('ตรวจข้อมูล', 'ตรวจแผนเทียบผล', 'ตรวจตัวเลขที่คุณกรอกเองตามเดือนและปีงบเดียวกัน')}${controls(true,true)}
      <div class="starter-kpis"><div><span>แผนสะสม</span><strong>${plannedAt(project.id,ui.month).toFixed(1)}%</strong></div><div><span>ผลสะสม</span><strong>${report ? `${progress(report.phases).toFixed(1)}%` : '—'}</strong><small>${state.label}</small></div><div><span>จ่ายสะสม</span><strong>${money(paidThrough(project.id,ui.month))}</strong><small>บาท</small></div><div><span>งบโครงการ</span><strong>${money(project.budget)}</strong><small>บาท</small></div></div>
      <section class="card table-card"><div class="table-scroll"><table class="period-table"><thead><tr><th>เดือน</th><th>แผนสะสม</th><th>ผลสะสม</th><th>แผนจัดซื้อ</th><th>จ่ายจริงเดือนนั้น</th><th>สถานะ</th></tr></thead><tbody>${plan.months.map(row=>{const result=getReport(project.id,row.key);const monthState=status(project,row.key);return `<tr><th>${monthLabel(row.key)}</th><td>${plannedAt(project.id,row.key).toFixed(1)}%</td><td>${result ? `${progress(result.phases).toFixed(1)}%` : '—'}</td><td class="money-cell">${money(row.procure)} บาท</td><td class="money-cell">${result ? money(paid(result))+' บาท' : '—'}</td><td class="${monthState.className}">${monthState.label}</td></tr>`}).join('')}</tbody></table></div></section><div class="starter-actions"><button class="btn quiet-btn" data-go="report">กลับไปแก้รายงาน</button><button class="btn quiet-btn" data-go="dashboard">ดูแดชบอร์ด</button></div>`;
  }
  function dashboardData() {
    const projects = yearProjects();
    const month = ui.month || latestMonth();
    const reported = projects.map(project=>({project,report:getReport(project.id,month)})).filter(item=>item.report);
    const reportedBudget = reported.reduce((sum,item)=>sum+safeNum(item.project.budget),0);
    const plan = reportedBudget ? reported.reduce((sum,item)=>sum+plannedAt(item.project.id,month)*safeNum(item.project.budget),0)/reportedBudget : null;
    const actual = reportedBudget ? reported.reduce((sum,item)=>sum+progress(item.report.phases)*safeNum(item.project.budget),0)/reportedBudget : null;
    const paidAmount = projects.reduce((sum,project)=>sum+paidThrough(project.id,month),0);
    return {projects,month,reported,plan,actual,paidAmount,allocation:projects.reduce((sum,project)=>sum+safeNum(project.budget),0)};
  }
  function renderDashboard() {
    const data = dashboardData();
    const centralDocs = db.documents.filter(item=>item.year===ui.year&&item.scope==='central'&&item.visible);
    const budget = db.budgets[ui.year]?.amount;
    return `${heading('มุมผู้บริหาร', 'ภาพรวมโครงการ', 'ข้อมูลทั้งหมดด้านล่างคำนวณจากสิ่งที่คุณกรอกในเว็บจำลอง', `<button class="btn quiet-btn" data-go="portfolio-output">ดูหน้าสรุปสำหรับประชุม →</button>`)}${controls(false,true)}
      ${!data.projects.length ? emptyBox('ยังไม่มีโครงการให้ติดตาม', 'เมื่อแอดมินเพิ่มโครงการ จะเห็นภาพรวมที่นี่', 'admin', 'ไปหน้าแอดมิน') : `<div class="starter-kpis"><div><span>งบปีนี้</span><strong>${budget===undefined?'—':money(budget)}</strong><small>บาท · จัดสรร ${money(data.allocation)}</small></div><div><span>ผลสะสม / แผน</span><strong>${data.actual===null?'—':data.actual.toFixed(1)+'%'}</strong><small>แผน ${data.plan===null?'—':data.plan.toFixed(1)+'%'} · เฉพาะโครงการที่รายงาน</small></div><div><span>จ่ายสะสม</span><strong>${money(data.paidAmount)}</strong><small>บาท · จากรายงานที่บันทึก</small></div><div><span>ส่งรายงานรอบนี้</span><strong>${data.reported.length} / ${data.projects.length}</strong><small>${monthLabel(data.month)}</small></div></div>
      <div class="two-panel"><section class="card"><h2>แผนตั้งต้นเทียบผลจริง</h2>${overallCurve(data.projects)}<div class="chart-key"><span><i class="base"></i>แผน</span><span><i class="actual"></i>ผลจริง</span></div></section><section class="card"><h2>เรื่องที่ต้องติดตาม</h2><div class="file-list">${data.projects.filter(project=>status(project,data.month).label!=='ตามแผน').map(project=>`<div class="file-item"><div><strong>${esc(project.name)}</strong><small class="${status(project,data.month).className}">${status(project,data.month).label}${status(project,data.month).difference!==null ? ` · ${status(project,data.month).difference.toFixed(1)} จุดจากแผน` : ''}</small></div></div>`).join('') || '<div class="soft-note">ยังไม่มีโครงการที่ต้องติดตามจากข้อมูลเดือนนี้</div>'}</div></section></div>
      <section class="card"><h2>เทียบทุกโครงการในปี ${ui.year}</h2><div class="table-scroll"><table class="starter-table"><thead><tr><th>โครงการ</th><th>งบ</th><th>แผนสะสม</th><th>ผลสะสม</th><th>จ่ายแล้ว</th><th>สถานะ</th><th></th></tr></thead><tbody>${data.projects.map(project=>{const report=getReport(project.id,data.month);const projectStatus=status(project,data.month);return `<tr><td>${esc(project.name)}</td><td>${money(project.budget)} บาท</td><td>${getPlan(project.id)?plannedAt(project.id,data.month).toFixed(1)+'%':'ยังไม่มีแผน'}</td><td>${report?progress(report.phases).toFixed(1)+'%':'—'}</td><td>${money(paidThrough(project.id,data.month))} บาท</td><td class="${projectStatus.className}">${projectStatus.label}</td><td><button class="mini-btn" data-dashboard-project="${project.id}">ดูโครงการ</button></td></tr>`}).join('')}</tbody></table></div></section>`}
      <section class="card"><h2>เอกสารส่วนกลางที่แอดมินเผยแพร่</h2><div class="file-list">${centralDocs.map(item=>`<div class="file-item"><div><strong>${esc(item.title)}</strong><small>${esc(item.category)} · ${esc(item.number)} · ${esc(item.fileName || 'ไม่มีไฟล์')}</small></div>${item.blobId?`<button class="mini-btn" data-open-file="${item.blobId}">เปิดไฟล์</button>`:''}</div>`).join('') || emptyBox('ยังไม่มีเอกสารส่วนกลางที่เผยแพร่','เพิ่มได้ในหน้าแอดมิน')}</div></section>`;
  }
  function renderArchive() {
    const reports = db.reports.filter(report => db.projects.some(project=>project.id===report.projectId&&project.year===ui.year)).sort((a,b)=>b.month.localeCompare(a.month));
    return `${heading('ดูย้อนหลัง', 'รายงานที่บันทึกไว้', 'เลือกรายงานของแต่ละเดือนเพื่อดูสรุป พิมพ์ หรือบันทึกเป็น PDF ด้วยเบราว์เซอร์')}${controls(false)}
      <div class="soft-note warn">ต้นแบบเก็บข้อมูลและไฟล์แนบในเบราว์เซอร์นี้ แต่ยังไม่สร้างไฟล์ PDF อัตโนมัติและยังไม่เก็บ PDF บน Google Drive</div>
      <section class="card"><div class="starter-section-title"><div><h2>ภาพรวมทั้งงบประมาณ</h2><p>คำนวณใหม่จากข้อมูลปีและเดือนที่เลือก</p></div></div><button class="btn primary-btn" data-go="portfolio-output">เปิดสรุปภาพรวม</button></section>
      <section class="card"><h2>รายโครงการ</h2><div class="file-list">${reports.map(report=>{const project=db.projects.find(item=>item.id===report.projectId);return `<div class="file-item"><div><strong>${esc(project?.name || 'โครงการที่ถูกลบ')} · ${monthLabel(report.month)}</strong><small>ฉบับ ${report.version} · แก้ไขล่าสุด ${esc(report.updatedAt)} · ผลสะสม ${progress(report.phases).toFixed(1)}%</small></div><div class="btn-group"><button class="mini-btn" data-open-report="${report.id}">ดูรายงาน</button><button class="mini-btn danger" data-delete-report="${report.id}">ลบ</button></div></div>`}).join('') || emptyBox('ยังไม่มีรายงานรายเดือน', 'เมื่อบันทึกรายงานแล้วจะเปิดย้อนหลังได้ที่นี่')}</div></section>`;
  }
  function selectedOutputReport() { return db.reports.find(report=>report.id===ui.reportId) || getReport(ui.projectId,ui.month); }
  function renderProjectOutput() {
    const report = selectedOutputReport();
    const project = db.projects.find(item=>item.id===report?.projectId);
    if (!report || !project) return `${heading('สรุปรายโครงการ', 'ยังไม่มีรายงาน', 'บันทึกรายงานก่อนแล้วจึงเปิดสรุป')}${emptyBox('ยังไม่มีรายงานที่เลือก', 'กลับไปกรอกผลรายเดือน', 'report', 'ไปกรอกรายงาน')}`;
    const selectedPhotos = (report.attachments || []).filter(file=>file.isImage&&file.featured).slice(0,3);
    const images = (report.attachments || []).filter(file=>file.isImage);
    const plan = getPlan(project.id);
    const monthStatus = status(project,report.month);
    return `${heading('ผลลัพธ์หลังบันทึก', 'รายงานโครงการพร้อมใช้', 'เลือกภาพเด่นและแก้คำบรรยายก่อนพิมพ์', `<span class="status-pill saved">${monthLabel(report.month)} · ฉบับ ${report.version}</span>`)}
      <div class="screen-controls starter-actions" style="margin:0 0 18px"><button class="btn quiet-btn" data-go="report">← กลับไปแก้รายงาน</button><button class="btn quiet-btn" data-go="archive">รายงานย้อนหลัง</button><button class="btn primary-btn" data-print>พิมพ์ / บันทึก PDF</button></div>
      <section class="card screen-controls"><div class="starter-section-title"><div><h2>เลือกภาพที่จะโชว์ในรายงาน</h2><p>เก็บภาพทุกภาพไว้ในรายงานเดือนนี้ แต่เลือกภาพเด่นได้สูงสุด 3 ภาพ</p></div><span class="readonly-pill">${selectedPhotos.length} / 3 ภาพ</span></div>
      ${images.length ? `<div class="photo-grid">${images.map(file=>`<div class="photo-choice ${file.featured?'selected':''}"><img data-blob-id="${file.blobId}" alt="${esc(file.caption||file.name)}"><button data-toggle-photo="${file.id}">${file.featured?'✓ แสดงในรายงาน':'เลือกแสดง'}</button><input data-photo-caption="${file.id}" aria-label="คำบรรยาย ${esc(file.name)}" value="${esc(file.caption||file.name)}"></div>`).join('')}</div>` : emptyBox('ยังไม่มีรูปภาพของเดือนนี้', 'กลับไปแนบภาพในหน้ารายงานรายเดือน')}
      </section>
      <article class="report-sheet print-target"><header><small>MAHIDOL UNIVERSITY · SUSTAINABILITY</small><h2>สรุปผลการดำเนินงานประจำเดือน</h2><p>${esc(project.name)} · ปีงบประมาณ ${project.year} · ${monthLabel(report.month)}</p></header>
        <div class="starter-kpis"><div><span>แผนสะสม</span><strong>${plannedAt(project.id,report.month).toFixed(1)}%</strong></div><div><span>ผลสะสม</span><strong>${progress(report.phases).toFixed(1)}%</strong><small class="${monthStatus.className}">${monthStatus.label}</small></div><div><span>จ่ายเดือนนี้</span><strong>${money(paid(report))}</strong><small>บาท</small></div><div><span>จ่ายสะสม</span><strong>${money(paidThrough(project.id,report.month))}</strong><small>บาท</small></div></div>
        <section><h3 style="margin-top:19px">แผนตั้งต้น ผลจริง และแนวโน้ม</h3>${projectCurve(project)}<div class="chart-key"><span><i class="base"></i>แผนตั้งต้น</span><span><i class="actual"></i>ผลจริง</span><span><i class="forecast"></i>คาดการณ์</span></div></section>
        <div class="report-columns"><section><h3>งานที่ทำในเดือนนี้</h3><p>${esc(report.summaryText)}</p><h3>ผลลัพธ์ตาม SDG</h3><p>${esc(report.sdgOutcome || 'ยังไม่ได้ระบุผลลัพธ์')}${plan?.indicator ? ` · ตัวชี้วัด ${esc(plan.indicator)}` : ''}</p></section><section><h3>เรื่องที่ต้องติดตาม</h3><p>${esc(report.delay || 'ไม่มีประเด็นที่ระบุ')}</p><h3>เดือนที่คาดว่าจะเสร็จ</h3><p>${monthLabel(report.forecastMonth || plan?.baselineEnd)}</p></section></div>
        ${selectedPhotos.length ? `<section><h3>ภาพกิจกรรมที่เลือกแสดง</h3><div class="report-photo-grid">${selectedPhotos.map(file=>`<figure><img data-blob-id="${file.blobId}" alt="${esc(file.caption||file.name)}"><figcaption>${esc(file.caption||file.name)}</figcaption></figure>`).join('')}</div></section>` : ''}
        <footer>ต้นแบบ · ข้อมูลที่ผู้ทดลองกรอกในเบราว์เซอร์เครื่องนี้ · แก้ไขล่าสุด ${esc(report.updatedAt)} · ฉบับ ${report.version}</footer></article>`;
  }
  function renderPortfolioOutput() {
    const data = dashboardData();
    const budget = db.budgets[ui.year]?.amount;
    const pending = data.projects.filter(project=>!getReport(project.id,data.month));
    const delayed = data.projects.filter(project=>status(project,data.month).className==='status-bad');
    return `${heading('ภาพรวมเพื่อประชุม', 'สรุปทุกโครงการในรอบเดียว', 'อ่านยอดรวมพร้อมสถานะข้อมูลที่ขาด และเปิดรายละเอียดรายโครงการเมื่อจำเป็น')}
      <div class="screen-controls starter-actions" style="margin:0 0 18px"><button class="btn quiet-btn" data-go="dashboard">← กลับแดชบอร์ด</button><button class="btn quiet-btn" data-go="archive">รายงานย้อนหลัง</button><button class="btn primary-btn" data-print>พิมพ์ / บันทึก PDF</button></div>
      <article class="report-sheet print-target"><header><small>MAHIDOL UNIVERSITY · SUSTAINABILITY</small><h2>ภาพรวมผลการดำเนินงานประจำเดือน</h2><p>ปีงบประมาณ ${ui.year} · ${monthLabel(data.month)} · ข้อมูลผู้ทดลองกรอก</p></header>
        <div class="soft-note">${data.projects.length ? `รับรายงาน ${data.reported.length} / ${data.projects.length} โครงการ${pending.length ? ` · ยังขาด ${pending.length} โครงการ จึงต้องอ่านผลรวมเฉพาะโครงการที่ส่งรายงาน` : ''}` : 'ยังไม่มีโครงการในปีนี้'}</div>
        <div class="starter-kpis"><div><span>งบอนุมัติปีนี้</span><strong>${budget===undefined?'—':money(budget)}</strong><small>บาท</small></div><div><span>ผลสะสม</span><strong>${data.actual===null?'—':data.actual.toFixed(1)+'%'}</strong><small>เฉพาะผู้รายงานแล้ว</small></div><div><span>แผนสะสม</span><strong>${data.plan===null?'—':data.plan.toFixed(1)+'%'}</strong></div><div><span>จ่ายสะสม</span><strong>${money(data.paidAmount)}</strong><small>บาท</small></div></div>
        <section><h3 style="margin-top:19px">แนวโน้มทั้งงบประมาณ</h3>${overallCurve(data.projects)}<div class="chart-key"><span><i class="base"></i>แผน</span><span><i class="actual"></i>ผลจริง</span></div></section>
        <div class="report-columns"><section><h3>สถานะทุกโครงการ</h3><div class="file-list">${data.projects.map(project=>`<div class="file-item"><strong>${esc(project.name)}</strong><small class="${status(project,data.month).className}">${status(project,data.month).label}</small></div>`).join('') || 'ยังไม่มีโครงการ'}</div></section><section><h3>เรื่องที่ต้องติดตาม</h3><p>${delayed.length ? `ล่าช้ากว่าแผน ${delayed.length} โครงการ: ${delayed.map(project=>esc(project.name)).join(', ')}` : 'ยังไม่มีโครงการที่ล่าช้าตามรายงานเดือนนี้'}</p><p>${pending.length ? `รอรายงาน ${pending.length} โครงการ: ${pending.map(project=>esc(project.name)).join(', ')}` : 'ทุกโครงการส่งรายงานแล้ว'}</p><p>งบจัดสรร ${money(data.allocation)} ${budget===undefined?'บาท · ยังไม่ตั้งงบปี':`จาก ${money(budget)} บาท`}</p></section></div>
        <footer>ต้นแบบ · รายงานนี้คำนวณจากข้อมูลล่าสุดในเบราว์เซอร์ ยังไม่ถูกสร้างเป็น PDF หรือเก็บบน Drive อัตโนมัติ</footer></article>`;
  }

  function collectPlan() {
    const form = $('#plan-form');
    const fields = new FormData(form);
    const rows = $$('#plan-form tbody tr').map(row => {
      const result = { key: row.dataset.month };
      $$('input[data-stage]',row).forEach(input => result[input.dataset.stage] = input.value === '' ? 0 : safeNum(input.value));
      return result;
    });
    return { projectId: ui.projectId, baselineStart: fields.get('baselineStart'), baselineEnd: fields.get('baselineEnd'), sdgs: String(fields.get('sdgs')||'').split(',').map(item=>item.trim()).filter(Boolean), indicator: String(fields.get('indicator')||'').trim(), target: String(fields.get('target')||'').trim(), months: rows };
  }
  function validatePlan(plan) {
    if (!plan.baselineStart || !plan.baselineEnd || plan.baselineEnd < plan.baselineStart) return 'กรุณาตรวจเดือนเริ่มและเดือนสิ้นสุดแผน';
    if (plan.months.some(row=>stages.some(([key])=>row[key]<0 || (key!=='procure'&&row[key]>100)))) return 'ค่าแผนรายเดือนต้องไม่ติดลบ และร้อยละต้องไม่เกิน 100';
    if (stepKeys.some(key=>plan.months.reduce((sum,row)=>sum+safeNum(row[key]),0)>100)) return 'ผลรวมร้อยละของแต่ละขั้นตอนต้องไม่เกิน 100%';
    if (plan.months.reduce((sum,row)=>sum+safeNum(row.procure),0)>safeNum(selectedProject()?.budget)) return 'แผนจัดซื้อรวมเกินงบโครงการ';
    return '';
  }
  function updatePlanPreview() {
    if (!$('#plan-form')) return;
    const draft = collectPlan();
    stages.forEach(([key])=>{const node=$(`#plan-total-${key}`);if(node)node.textContent=`${money(draft.months.reduce((sum,row)=>sum+safeNum(row[key]),0))}${key==='procure'?' บาท':'%'}`;});
    const error=validatePlan(draft);
    $('#plan-validation').textContent=error || `รวมงบจัดซื้อ ${money(draft.months.reduce((sum,row)=>sum+safeNum(row.procure),0))} / ${money(selectedProject()?.budget)} บาท · บันทึกแผนบางส่วนได้`;
    $('#plan-validation').classList.toggle('warn',Boolean(error));
  }

  document.addEventListener('click', async event => {
    const nav = event.target.closest('[data-page]');
    if (nav) return navigate(nav.dataset.page);
    const go = event.target.closest('[data-go]');
    if (go) return navigate(go.dataset.go);
    const node = event.target.closest('button');
    if (!node || !screen.contains(node)) return;
    if (node.id === 'apply-year') {
      const year = Number($('#context-year')?.value);
      if (!Number.isInteger(year) || year < 2560 || year > 2600) return notice('กรุณาเลือกปีงบประมาณ 2560–2600');
      ui.year = year; ui.projectId = ''; ui.month = ''; db.lastYear = year; db.lastMonth = '';
      persist(); render(); return notice(`กำลังดูข้อมูลปีงบ ${year}`);
    }
    if (node.hasAttribute('data-cancel-edit')) { ui.editDept='';ui.editProject='';ui.editDoc='';return render(); }
    if (node.dataset.yearOpen) { ui.year=Number(node.dataset.yearOpen);ui.projectId='';ui.month='';db.lastYear=ui.year;db.lastMonth='';persist();render();window.scrollTo({top:0,behavior:'smooth'});return notice(`กำลังดูข้อมูลปีงบ ${ui.year}`); }
    if (node.dataset.editDept) { ui.editDept=node.dataset.editDept;render();return $('#admin-departments')?.scrollIntoView(); }
    if (node.dataset.editProject) { ui.editProject=node.dataset.editProject;render();return $('#admin-projects')?.scrollIntoView(); }
    if (node.dataset.editDoc) { ui.editDoc=node.dataset.editDoc;render();return $('#admin-documents')?.scrollIntoView(); }
    if (node.dataset.openFile) return openFile(node.dataset.openFile);
    if (node.dataset.planAdd) {
      const draft=collectPlan();
      const added=shiftMonth(node.dataset.planAdd==='before'?draft.months[0].key:draft.months.at(-1).key,node.dataset.planAdd==='before'?-1:1);
      if (!draft.months.some(row=>row.key===added)) draft.months[node.dataset.planAdd==='before'?'unshift':'push']({key:added});
      ui.planDraft=draft;return render();
    }
    if (node.dataset.openReport) {
      const report=db.reports.find(item=>item.id===node.dataset.openReport);
      if (!report) return;
      const project=db.projects.find(item=>item.id===report.projectId);
      ui.year=project?.year||ui.year;ui.projectId=report.projectId;ui.month=report.month;ui.reportId=report.id;return navigate('project-output');
    }
    if (node.dataset.dashboardProject) {ui.projectId=node.dataset.dashboardProject;ui.page='review';return render();}
    if (node.dataset.togglePhoto) {
      const report=selectedOutputReport();const file=report?.attachments?.find(item=>item.id===node.dataset.togglePhoto);
      if (!file) return;
      if (!file.featured && report.attachments.filter(item=>item.isImage&&item.featured).length>=3) return notice('เลือกภาพเด่นได้สูงสุด 3 ภาพ กรุณานำภาพเดิมออกก่อน');
      file.featured=!file.featured;persist();return render();
    }
    if (node.dataset.replaceAttachment) {ui.replaceFileId=node.dataset.replaceAttachment;return $('#attachment-replacement')?.click();}
    if (node.dataset.removeAttachment) {
      const report=getReport(ui.projectId,ui.month);const index=report?.attachments?.findIndex(file=>file.id===node.dataset.removeAttachment);
      if (index<0 || !window.confirm('ลบไฟล์นี้จากรายงานในเว็บจำลองหรือไม่?')) return;
      const [file]=report.attachments.splice(index,1);await fileAction('delete',file.blobId).catch(()=>{});report.version++;report.updatedAt=now();log('ไฟล์รายงาน','ลบ',file.name);persist();return render();
    }
    if (node.dataset.deleteBudget) {
      if (!window.confirm(`ลบงบประมาณปี ${node.dataset.deleteBudget} ในเว็บจำลองหรือไม่?`)) return;
      delete db.budgets[node.dataset.deleteBudget];log('งบประมาณ','ลบ',`ปี ${node.dataset.deleteBudget}`);persist();return render();
    }
    if (node.dataset.deleteDept) {
      const item=db.departments.find(dept=>dept.id===node.dataset.deleteDept);
      if (db.projects.some(project=>project.deptId===item?.id)) return notice('ยังมีโครงการผูกกับหน่วยงานนี้ กรุณาย้ายโครงการก่อน');
      if (!window.confirm(`ลบหน่วยงาน ${item?.name||''} ในเว็บจำลองหรือไม่?`)) return;
      db.departments=db.departments.filter(dept=>dept.id!==item.id);log('หน่วยงาน','ลบ',item.name);persist();return render();
    }
    if (node.dataset.deleteProject) {
      const item=db.projects.find(project=>project.id===node.dataset.deleteProject);
      if (!item || !window.confirm(`ลบโครงการ ${item.name} พร้อมแผนและรายงานในเว็บจำลองหรือไม่?`)) return;
      db.projects=db.projects.filter(project=>project.id!==item.id);delete db.plans[item.id];db.reports=db.reports.filter(report=>report.projectId!==item.id);db.documents=db.documents.filter(doc=>doc.projectId!==item.id);log('โครงการ','ลบ',item.name);ui.projectId='';persist();return render();
    }
    if (node.dataset.deleteDoc) {
      const item=db.documents.find(doc=>doc.id===node.dataset.deleteDoc);
      if (!item || !window.confirm(`ลบเอกสาร ${item.title} ในเว็บจำลองหรือไม่?`)) return;
      db.documents=db.documents.filter(doc=>doc.id!==item.id);if(item.blobId)await fileAction('delete',item.blobId).catch(()=>{});log('เอกสาร','ลบ',item.title);persist();return render();
    }
    if (node.dataset.deleteReport) {
      const item=db.reports.find(report=>report.id===node.dataset.deleteReport);
      if (!item || !window.confirm(`ลบรายงาน ${monthLabel(item.month)} ในเว็บจำลองหรือไม่?`)) return;
      db.reports=db.reports.filter(report=>report.id!==item.id);for(const file of item.attachments||[])await fileAction('delete',file.blobId).catch(()=>{});log('รายงาน','ลบ',monthLabel(item.month));persist();return render();
    }
    if (node.id==='reset-sandbox') {
      if (!window.confirm('ล้างข้อมูลทดลองทั้งหมด รวมไฟล์ที่อัปโหลดในเบราว์เซอร์นี้หรือไม่?')) return;
      db=empty();localStorage.removeItem(KEY);await fileAction('clear').catch(()=>{});ui={page:'home',year:2569,projectId:'',month:'',reportId:'',editDept:'',editProject:'',editDoc:'',replaceFileId:''};render();return notice('ล้างข้อมูลทดลองทั้งหมดแล้ว');
    }
    if (node.hasAttribute('data-print')) {document.body.classList.add('print-report');window.print();}
  });
  window.addEventListener('afterprint',()=>document.body.classList.remove('print-report'));

  document.addEventListener('change', async event => {
    const input=event.target;
    if (input.id==='context-year') {const year=Number(input.value);if(year<2560||year>2600)return notice('กรุณาเลือกปีงบประมาณ 2560–2600');ui.year=year;ui.projectId='';ui.month='';db.lastYear=year;db.lastMonth='';persist();return render();}
    if (input.id==='context-project') {ui.projectId=input.value;ui.month='';ui.planDraft=null;return render();}
    if (input.id==='context-month') {ui.month=input.value;db.lastMonth=ui.month;persist();return render();}
    if (input.dataset.photoCaption) {const report=selectedOutputReport();const file=report?.attachments?.find(item=>item.id===input.dataset.photoCaption);if(file){file.caption=input.value.trim().slice(0,100);persist();render();}return;}
    if (input.id==='attachment-replacement'&&input.files[0]) {
      const report=getReport(ui.projectId,ui.month);const file=report?.attachments?.find(item=>item.id===ui.replaceFileId);if(!file)return;
      try{const replacement=input.files[0];const newId=await putFile(replacement);await fileAction('delete',file.blobId).catch(()=>{});Object.assign(file,{name:replacement.name,blobId:newId,isImage:replacement.type.startsWith('image/'),caption:replacement.name,uploadedAt:now()});report.version++;report.updatedAt=now();log('ไฟล์รายงาน','แทนที่',replacement.name);persist();render();notice('แทนที่ไฟล์ในเว็บจำลองแล้ว');}catch{notice('เก็บไฟล์ในเบราว์เซอร์นี้ไม่ได้');}finally{ui.replaceFileId='';}
    }
  });
  document.addEventListener('input',event=>{
    if (event.target.matches('[data-money]')) {
      const input = event.target;
      const significant = input.value.slice(0, input.selectionStart ?? input.value.length).replace(/[^\d.]/g, '').length;
      const formatted = formatMoneyTyping(input.value);
      input.value = formatted;
      let caret = 0, seen = 0;
      while (caret < formatted.length && seen < significant) {
        if (/[\d.]/.test(formatted[caret])) seen++;
        caret++;
      }
      input.setSelectionRange(caret, caret);
    }
    if (event.target.closest('#plan-form')) updatePlanPreview();
    if (event.target.closest('#report-form') && $('#report-live-progress')) {
      const form=$('#report-form');const phases=Object.fromEntries(stepKeys.map(key=>[key,safeNum(form.elements.namedItem(key)?.value)]));
      $('#report-live-progress').textContent=`ผลสะสม ${progress(phases).toFixed(1)}% · แผนสะสม ${plannedAt(ui.projectId,ui.month).toFixed(1)}%`;
    }
  });

  document.addEventListener('submit', async event => {
    const form=event.target;
    if (!screen.contains(form)) return;
    event.preventDefault();
    const fields=new FormData(form);
    if (form.id==='budget-form') {
      const amount=parseAmount(fields.get('amount'));
      if (!Number.isFinite(amount)||amount<0) return notice('กรุณากรอกงบประมาณตั้งแต่ศูนย์ขึ้นไป');
      db.budgets[ui.year]={amount,updatedAt:now()};log('งบประมาณ','บันทึก',`ปี ${ui.year} · ${money(amount)} บาท`);persist();render();return notice('บันทึกงบประมาณปีนี้แล้ว');
    }
    if (form.id==='department-form') {
      const name=String(fields.get('name')||'').trim(),head=String(fields.get('head')||'').trim(),email=String(fields.get('email')||'').trim();
      if (!name||!head||!email)return notice('กรอกชื่อหน่วยงาน หัวหน้า และอีเมลให้ครบ');
      const duplicate=db.departments.find(item=>item.name.toLocaleLowerCase()===name.toLocaleLowerCase()&&item.id!==ui.editDept);
      if(duplicate)return notice('มีชื่อหน่วยงานนี้แล้ว');
      const item=db.departments.find(item=>item.id===ui.editDept);
      if(item)Object.assign(item,{name,head,email,since:String(fields.get('since')||'')});
      else db.departments.push({id:uid(),name,head,email,since:String(fields.get('since')||'')});
      log('หน่วยงาน',item?'แก้ไข':'เพิ่ม',`${name} · ${head}`);ui.editDept='';persist();render();return notice('บันทึกหน่วยงานแล้ว');
    }
    if (form.id==='project-form') {
      const name=String(fields.get('name')||'').trim(),deptId=String(fields.get('deptId')||''),budget=parseAmount(fields.get('budget'));
      const owners=[0,1,2].map(index=>({name:String(fields.get(`ownerName${index}`)||'').trim(),email:String(fields.get(`ownerEmail${index}`)||'').trim()}));
      if(!db.budgets[ui.year])return notice('กรุณาตั้งงบปีนี้ก่อน');
      if(!name||!deptId||!owners[0].name||!owners[0].email||!Number.isFinite(budget)||budget<0)return notice('กรอกชื่อ หน่วยงาน งบ และผู้รับผิดชอบหลักให้ครบ');
      if(owners.slice(1).some(owner=>Boolean(owner.name)!==Boolean(owner.email)))return notice('ผู้รับผิดชอบรองต้องกรอกทั้งชื่อและอีเมล');
      const item=db.projects.find(project=>project.id===ui.editProject);
      const nextTotal=yearProjects().reduce((sum,project)=>sum+(project.id===item?.id?0:safeNum(project.budget)),0)+(fields.get('active')==='true'?budget:0);
      if(nextTotal>db.budgets[ui.year].amount)return notice(`วงเงินรวมเกินงบปี ${money(nextTotal-db.budgets[ui.year].amount)} บาท กรุณาตรวจงบก่อน`);
      const record={year:ui.year,name,deptId,budget,owners,active:fields.get('active')==='true'};
      if(item)Object.assign(item,record);else db.projects.push({id:uid(),...record});
      log('โครงการ',item?'แก้ไข':'เพิ่ม',`${name} · ${money(budget)} บาท`);ui.editProject='';persist();render();return notice('บันทึกโครงการแล้ว');
    }
    if(form.id==='weights-form') {
      const values=Object.fromEntries(stepKeys.map(key=>[key,Number(fields.get(key))]));
      if(Object.values(values).some(value=>!Number.isFinite(value)||value<0)||Object.values(values).reduce((sum,value)=>sum+value,0)!==100)return notice('ผลรวมค่าน้ำหนักต้องเท่ากับ 100%');
      db.weights[ui.year]=values;log('ค่าน้ำหนัก','บันทึก',`ปี ${ui.year} · ${Object.values(values).join('/')}`);persist();render();return notice('บันทึกค่าน้ำหนักแล้ว');
    }
    if(form.id==='document-form') {
      const title=String(fields.get('title')||'').trim(),scope=String(fields.get('scope')||'central'),projectId=scope==='project'?String(fields.get('projectId')||''):'';
      const file=form.elements.namedItem('file')?.files?.[0],item=db.documents.find(doc=>doc.id===ui.editDoc);
      if(!title)return notice('กรุณาใส่ชื่อเอกสาร');
      if(scope==='project'&&!projectId)return notice('เอกสารเฉพาะโครงการต้องเลือกโครงการ');
      if(!item&&!file)return notice('กรุณาเลือกไฟล์ PDF หรือ Word');
      let blobId=item?.blobId||'',fileName=item?.fileName||'';
      if(file){try{blobId=await putFile(file);fileName=file.name;if(item?.blobId)await fileAction('delete',item.blobId).catch(()=>{});}catch{return notice('เก็บไฟล์เอกสารในเบราว์เซอร์นี้ไม่ได้');}}
      const record={year:ui.year,title,scope,projectId,category:String(fields.get('category')||''),number:String(fields.get('number')||'').trim(),visible:fields.get('visible')==='on',blobId,fileName,updatedAt:now()};
      if(item)Object.assign(item,record);else db.documents.push({id:uid(),...record});
      log('เอกสาร',item?'แก้ไข':'เพิ่ม',title);ui.editDoc='';persist();render();return notice('บันทึกเอกสารในเว็บจำลองแล้ว');
    }
    if(form.id==='plan-form') {
      const plan=collectPlan(),error=validatePlan(plan);
      if(error)return notice(error);
      plan.savedAt=now();db.plans[ui.projectId]=plan;ui.planDraft=null;log('แผนโครงการ','บันทึก',selectedProject().name);persist();render();return notice('บันทึกแผนแล้ว ไปกรอกรายงานผลได้');
    }
    if(form.id==='report-form') {
      const project=selectedProject(),plan=getPlan(project?.id);
      if(!project||!plan)return notice('กรุณาเลือกโครงการที่มีแผน');
      const phases=Object.fromEntries(stepKeys.map(key=>[key,fields.get(key)===''?0:Number(fields.get(key))]));
      if(Object.values(phases).some(value=>!Number.isFinite(value)||value<0||value>100))return notice('ร้อยละของแต่ละขั้นตอนต้องอยู่ระหว่าง 0–100');
      const summaryText=String(fields.get('summaryText')||'').trim(),delay=String(fields.get('delay')||'').trim();
      const forecastMonth=String(fields.get('forecastMonth')||'');
      if(!summaryText)return notice('กรุณากรอกสรุปผลเดือนนี้');
      if((progress(phases)<plannedAt(project.id,ui.month)-0.01||forecastMonth>plan.baselineEnd)&&!delay)return notice('ผลต่ำกว่าแผนหรือคาดว่าจะขยายเวลา กรุณาระบุสาเหตุและแนวทางแก้ไข');
      const payments=['procurementPaid','loanPaid','otherPaid'].map(key=>fields.get(key)===''?0:parseAmount(fields.get(key)));
      if(payments.some(value=>!Number.isFinite(value)||value<0))return notice('ยอดจ่ายต้องไม่ติดลบ');
      const existing=getReport(project.id,ui.month),oldPaid=existing?paid(existing):0;
      if(paidThrough(project.id,'9999-12')-oldPaid+payments.reduce((sum,value)=>sum+value,0)>project.budget)return notice('ยอดจ่ายสะสมจะเกินงบโครงการ กรุณาตรวจตัวเลข');
      const uploaded=[...(form.elements.namedItem('attachments')?.files||[])];
      const images=(existing?.attachments||[]).filter(item=>item.isImage).length+uploaded.filter(file=>file.type.startsWith('image/')).length;
      if(images>10)return notice('แนบภาพสำหรับเดือนนี้ได้สูงสุด 10 ภาพ');
      const attachments=[...(existing?.attachments||[])];
      try {
        for(const file of uploaded){const blobId=await putFile(file);attachments.push({id:uid(),blobId,name:file.name,isImage:file.type.startsWith('image/'),caption:file.name.replace(/\.[^.]+$/,''),featured:file.type.startsWith('image/')&&attachments.filter(item=>item.isImage&&item.featured).length<3,uploadedAt:now()});}
      }catch{return notice('เก็บไฟล์แนบในเบราว์เซอร์นี้ไม่ได้');}
      const record={projectId:project.id,month:ui.month,phases,procurementPaid:payments[0],loanPaid:payments[1],otherPaid:payments[2],summaryText,delay,forecastMonth,sdgOutcome:String(fields.get('sdgOutcome')||'').trim(),attachments,updatedAt:now(),version:(existing?.version||0)+1};
      if(existing)Object.assign(existing,record);else db.reports.push({id:uid(),...record});
      ui.reportId=existing?.id||db.reports.at(-1).id;db.lastMonth=ui.month;log('รายงาน','บันทึก',`${project.name} · ${monthLabel(ui.month)} · ฉบับ ${record.version}`);persist();navigate('project-output');return notice('บันทึกรายงานแล้ว เลือกภาพเด่นก่อนพิมพ์ได้');
    }
  });

  render();
})();

(() => {
  'use strict';

  const KEY = 'mu-scurve-empty-workspace-v1';
  const FILE_DB = 'mu-scurve-empty-files-v1';
  const ADMIN_PANELS_KEY = 'mu-scurve-admin-panels-v1';
  const INITIAL_ADMIN_EMAIL = 'sutanad.suy@mahidol.ac.th';
  const monthsTh = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  const stages = [
    ['draft', 'ร่าง (%)'], ['approval', 'ขออนุมัติ (%)'], ['procure', 'จัดซื้อ (บาท)'],
    ['execute', 'ดำเนินการ (%)'], ['disburse', 'วางฎีกา (%)'], ['summary', 'สรุปผล (%)']
  ];
  const sdgOptions = [
    ['SDG 1','ขจัดความยากจน'],['SDG 2','ยุติความหิวโหย'],['SDG 3','สุขภาพและความเป็นอยู่ที่ดี'],['SDG 4','การศึกษาที่มีคุณภาพ'],
    ['SDG 5','ความเท่าเทียมทางเพศ'],['SDG 6','น้ำสะอาดและสุขอนามัย'],['SDG 7','พลังงานสะอาดที่ทุกคนเข้าถึงได้'],['SDG 8','งานที่มีคุณค่าและเศรษฐกิจเติบโต'],
    ['SDG 9','อุตสาหกรรม นวัตกรรม และโครงสร้างพื้นฐาน'],['SDG 10','ลดความเหลื่อมล้ำ'],['SDG 11','เมืองและชุมชนที่ยั่งยืน'],['SDG 12','การบริโภคและการผลิตที่ยั่งยืน'],
    ['SDG 13','การรับมือการเปลี่ยนแปลงสภาพภูมิอากาศ'],['SDG 14','ทรัพยากรทางทะเลและชายฝั่ง'],['SDG 15','ระบบนิเวศบนบก'],['SDG 16','สังคมสงบสุข ยุติธรรม และสถาบันเข้มแข็ง'],['SDG 17','หุ้นส่วนความร่วมมือเพื่อการพัฒนาที่ยั่งยืน']
  ];
  const sdgColors = {
    'SDG 1':'#E5243B','SDG 2':'#DDA63A','SDG 3':'#4C9F38','SDG 4':'#C5192D','SDG 5':'#FF3A21',
    'SDG 6':'#26BDE2','SDG 7':'#FCC30B','SDG 8':'#A21942','SDG 9':'#FD6925','SDG 10':'#DD1367',
    'SDG 11':'#FD9D24','SDG 12':'#BF8B2E','SDG 13':'#3F7E44','SDG 14':'#0A97D9','SDG 15':'#56C02B',
    'SDG 16':'#00689D','SDG 17':'#19486A'
  };
  const sdgSuggestionRules = [
    {id:'SDG 1',terms:['ความยากจน','รายได้น้อย','ผู้มีรายได้น้อย','อาชีพ'],reason:'เกี่ยวข้องกับการลดความยากจนและเพิ่มโอกาสทางเศรษฐกิจ'},
    {id:'SDG 2',terms:['อาหาร','โภชนาการ','เกษตร','อาหารเหลือ'],reason:'เกี่ยวข้องกับอาหารที่เพียงพอ โภชนาการ หรือระบบเกษตร'},
    {id:'SDG 3',terms:['สุขภาพ','สุขภาวะ','อาหารปลอดภัย','ความปลอดภัย','ออกกำลังกาย'],reason:'เกี่ยวข้องกับสุขภาพ ความปลอดภัย หรือคุณภาพชีวิต'},
    {id:'SDG 4',terms:['อบรม','เรียนรู้','การศึกษา','ความรู้','หลักสูตร','นักศึกษา'],reason:'เกี่ยวข้องกับการเรียนรู้และการพัฒนาทักษะ'},
    {id:'SDG 5',terms:['เพศ','สตรี','ผู้หญิง','ความเท่าเทียมทางเพศ'],reason:'เกี่ยวข้องกับความเท่าเทียมทางเพศและโอกาสของผู้หญิง'},
    {id:'SDG 6',terms:['น้ำสะอาด','น้ำเสีย','บำบัดน้ำ','ประหยัดน้ำ','คุณภาพน้ำ'],reason:'เกี่ยวข้องกับการเข้าถึงน้ำสะอาดและการจัดการน้ำ'},
    {id:'SDG 7',terms:['พลังงาน','ไฟฟ้า','โซลาร์','แสงอาทิตย์','พลังงานสะอาด'],reason:'เกี่ยวข้องกับการใช้พลังงานที่สะอาดและมีประสิทธิภาพ'},
    {id:'SDG 8',terms:['การจ้างงาน','แรงงาน','ผู้ประกอบการ','รายได้','อาชีพ'],reason:'เกี่ยวข้องกับงานที่มีคุณค่าและการเติบโตทางเศรษฐกิจ'},
    {id:'SDG 9',terms:['นวัตกรรม','เทคโนโลยี','โครงสร้างพื้นฐาน','วิจัย'],reason:'เกี่ยวข้องกับนวัตกรรม งานวิจัย หรือโครงสร้างพื้นฐาน'},
    {id:'SDG 10',terms:['ความเหลื่อมล้ำ','คนพิการ','เข้าถึงบริการ','กลุ่มเปราะบาง'],reason:'เกี่ยวข้องกับการลดความเหลื่อมล้ำและเพิ่มการเข้าถึง'},
    {id:'SDG 11',terms:['ชุมชน','เมือง','ขนส่ง','พื้นที่สีเขียว','อาคาร'],reason:'เกี่ยวข้องกับชุมชน เมือง และพื้นที่ที่น่าอยู่'},
    {id:'SDG 12',terms:['ขยะ','คัดแยก','รีไซเคิล','พลาสติก','อาหารเหลือ','ของเสีย','ใช้ซ้ำ','ลดใช้','waste'],reason:'เกี่ยวข้องกับการลดของเสียและการใช้ทรัพยากรอย่างรับผิดชอบ'},
    {id:'SDG 13',terms:['คาร์บอน','ก๊าซเรือนกระจก','ภูมิอากาศ','โลกร้อน','ลดการปล่อย'],reason:'เกี่ยวข้องกับการลดก๊าซเรือนกระจกหรือรับมือการเปลี่ยนแปลงสภาพภูมิอากาศ'},
    {id:'SDG 14',terms:['ทะเล','ชายฝั่ง','ทะเล','สัตว์น้ำ','มหาสมุทร'],reason:'เกี่ยวข้องกับการอนุรักษ์ทะเลและทรัพยากรทางน้ำ'},
    {id:'SDG 15',terms:['ป่า','ต้นไม้','ความหลากหลายทางชีวภาพ','ระบบนิเวศ','ปลูกต้นไม้'],reason:'เกี่ยวข้องกับป่าไม้ ระบบนิเวศ และความหลากหลายทางชีวภาพ'},
    {id:'SDG 16',terms:['ธรรมาภิบาล','ความโปร่งใส','การมีส่วนร่วม','นโยบาย','ความยุติธรรม'],reason:'เกี่ยวข้องกับธรรมาภิบาล สถาบันที่เข้มแข็ง หรือการมีส่วนร่วม'},
    {id:'SDG 17',terms:['เครือข่าย','ความร่วมมือ','ภาคี','พันธมิตร','ร่วมมือ'],reason:'เกี่ยวข้องกับความร่วมมือระหว่างหน่วยงานหรือภาคี'}
  ];
  function suggestSdgsFromText(text) {
    const normalized=String(text||'').toLocaleLowerCase();
    return sdgSuggestionRules.map(rule=>({ ...rule, matches:rule.terms.filter(term=>normalized.includes(term.toLocaleLowerCase())) }))
      .filter(item=>item.matches.length).sort((a,b)=>b.matches.length-a.matches.length).slice(0,3);
  }
  const defaultWeights = { draft: 5, approval: 5, execute: 75, disburse: 5, summary: 10 };
  const empty = () => ({ budgets: {}, departments: [], projects: [], plans: {}, planDrafts: {}, reports: [], reportDrafts: [], documents: [], weights: {}, history: [], trash: [], admins: [{ email: INITIAL_ADMIN_EMAIL, role: 'ผู้ดูแลหลัก', addedAt: 'ผู้ดูแลหลักเริ่มต้น', addedBy: 'ระบบ', isPrimary: true }], yearStatus: {} });
  const $ = selector => document.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const screen = $('#screen');
  const money = value => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(Number(value) || 0);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = () => new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
  function currentFiscalContext(date = new Date()) {
    const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit'}).formatToParts(date).map(part=>[part.type,part.value]));
    const calendarYear=Number(parts.year),month=Number(parts.month);
    return { year:calendarYear+543+(month>=10?1:0), month:`${calendarYear}-${String(month).padStart(2,'0')}` };
  }
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
  const reportProcess = [
    { key: 'draft', name: 'ร่างโครงการ', measure: 'เปอร์เซ็นต์สะสม' },
    { key: 'approval', name: 'ขออนุมัติโครงการ', measure: 'เปอร์เซ็นต์สะสม' },
    { key: 'procure', name: 'จัดซื้อ / จัดจ้าง', measure: 'จำนวนเงินสะสม' },
    { key: 'execute', name: 'ดำเนินโครงการ', measure: 'เปอร์เซ็นต์สะสม' },
    { key: 'disburse', name: 'ขออนุมัติเบิกจ่าย / วางฎีกา', measure: 'เปอร์เซ็นต์สะสม' },
    { key: 'summary', name: 'รายงานผลสำเร็จโครงการ', measure: 'เปอร์เซ็นต์สะสม' }
  ];
  const monthlyReportExamples = {
    ontrack: {
      title: 'ตามแผน', description: 'ผลสะสมใกล้เคียงแผน · ไม่ต้องระบุเหตุล่าช้า',
      planned: 80, phases: { draft: 100, approval: 100, execute: 84, disburse: 50, summary: 50 },
      plannedPhases: { draft: 100, approval: 100, execute: 82.7, disburse: 50, summary: 50 },
      priorPhases: { draft: 100, approval: 100, execute: 76, disburse: 35, summary: 35 },
      procurementPlan: 70000, priorPaid: 42000, procurementPaid: 20000, loanPaid: 5000, otherPaid: 0,
      forecast: 'ธ.ค. 2569', forecastKey: '2026-12', baselineEnd: 'ธ.ค. 2569', baselineEndKey: '2026-12', reason: '',
      summary: 'ดำเนินกิจกรรมรณรงค์ลดอาหารเหลือในโรงอาหาร 4 แห่ง เก็บข้อมูลปริมาณขยะ และติดตามร้านค้าที่เข้าร่วมตามแผน'
    },
    early: {
      title: 'เร็วกว่าแผน', description: 'ทำกิจกรรมล่วงหน้า · คาดว่าจะเสร็จก่อนแผนตั้งต้น',
      planned: 68, phases: { draft: 100, approval: 100, execute: 90, disburse: 70, summary: 50 },
      plannedPhases: { draft: 100, approval: 100, execute: 68.7, disburse: 50, summary: 40 },
      priorPhases: { draft: 100, approval: 100, execute: 78, disburse: 45, summary: 35 },
      procurementPlan: 90000, priorPaid: 42000, procurementPaid: 28000, loanPaid: 8000, otherPaid: 0,
      forecast: 'พ.ย. 2569', forecastKey: '2026-11', baselineEnd: 'ธ.ค. 2569', baselineEndKey: '2026-12', reason: '',
      summary: 'จัดกิจกรรมได้เร็วกว่ากำหนดและมีร้านค้าเข้าร่วมครบตามเป้าหมาย จึงเริ่มรวบรวมผลประเมินเพื่อปิดงานได้ก่อนแผนตั้งต้น'
    },
    delayed: {
      title: 'ล่าช้า / ปรับเวลา', description: 'แจ้งสาเหตุและแนวทางแก้ พร้อมระบุเดือนคาดว่าจะเสร็จใหม่',
      planned: 82, phases: { draft: 100, approval: 100, execute: 50, disburse: 20, summary: 0 },
      plannedPhases: { draft: 100, approval: 100, execute: 86, disburse: 50, summary: 50 },
      priorPhases: { draft: 100, approval: 100, execute: 44, disburse: 10, summary: 0 },
      procurementPlan: 95000, priorPaid: 42000, procurementPaid: 10000, loanPaid: 2500, otherPaid: 0,
      forecast: 'ก.พ. 2570', forecastKey: '2027-02', baselineEnd: 'ธ.ค. 2569', baselineEndKey: '2026-12', reason: 'ผู้รับจ้างส่งมอบสื่อประชาสัมพันธ์ช้ากว่ากำหนด ปรับลำดับกิจกรรมไปทำส่วนที่พร้อมก่อน และติดตามกำหนดส่งใหม่ทุกสัปดาห์',
      summary: 'จัดกิจกรรมได้บางส่วนและอยู่ระหว่างรอสื่อจากผู้รับจ้าง ทีมงานปรับลำดับงานเพื่อให้กิจกรรมที่พร้อมดำเนินต่อได้'
    }
  };
  function currentMonthlyExample() {
    const base=monthlyReportExamples[ui.exampleScenario] || monthlyReportExamples.ontrack;
    const sample=ui.exampleDraft?{...base,...ui.exampleDraft,phases:{...base.phases,...ui.exampleDraft.phases}}:base;
    return { ...sample, planned: exampleProgress(base.plannedPhases), forecast:sample.forecastKey?monthLabel(sample.forecastKey):sample.forecast };
  }
  function exampleProgress(phases) {
    return stepKeys.reduce((sum, key) => sum + Math.max(0,Math.min(100,safeNum(phases[key]))) * safeNum(defaultWeights[key]) / 100, 0);
  }
  const load = () => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
      return stored && typeof stored === 'object' ? { ...empty(), ...stored } : empty();
    } catch { return empty(); }
  };
  let db = load();
  if (!Array.isArray(db.admins) || !db.admins.length) db.admins = empty().admins;
  if (!db.planDrafts || typeof db.planDrafts !== 'object') db.planDrafts = {};
  if (!Array.isArray(db.reportDrafts)) db.reportDrafts = [];
  if (!db.yearStatus || typeof db.yearStatus !== 'object') db.yearStatus = {};
  const reportHashSteps = { '#report-progress': 1, '#report-expenses': 2, '#report-summary': 3, '#report-evidence': 3, '#report-review': 4 };
  const pageHashRoutes = { '#dashboard': 'dashboard' };
  const currentContext=currentFiscalContext();
  let ui = { page: reportHashSteps[location.hash] ? 'report' : pageHashRoutes[location.hash] || 'home', reportStep: reportHashSteps[location.hash] || 1, year: currentContext.year, projectId: '', dashboardProject: '', dashboardSdg: '', month: currentContext.month, reportId: '', editDept: '', editProject: '', editDoc: '', replaceFileId: '', exampleScenario: 'ontrack', exampleDraft: null, exampleOutput: false, exampleStep: 1 };
  let adminPanels = (() => { try { return JSON.parse(localStorage.getItem(ADMIN_PANELS_KEY) || '{}') || {}; } catch { return {}; } })();
  let toastTimer;
  let fileDbPromise;

  // The former screen stored only a draft and a role; remove both when starting this blank workflow.
  localStorage.removeItem('mu-sustainability-mockup-report-draft-v1');
  localStorage.removeItem('mu-sustainability-mockup-role-v1');

  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
    catch { notice('เครื่องนี้เก็บข้อมูลเพิ่มไม่ได้ กรุณาตรวจพื้นที่ว่างของเบราว์เซอร์'); return false; }
  }
  function notice(message, kind = 'info') {
    const box = $('#toast');
    box.textContent = message;
    box.classList.toggle('confirmation', kind === 'confirmation');
    box.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => box.classList.remove('show'), 4800);
  }
  function log(section, action, detail, before, after) {
    const entry = { id: uid(), section, action, detail, at: now(), actor: 'ผู้ใช้ทดลอง' };
    if (before !== undefined) entry.before = before == null ? null : JSON.parse(JSON.stringify(before));
    if (after !== undefined) entry.after = after == null ? null : JSON.parse(JSON.stringify(after));
    db.history.unshift(entry);
    db.history = db.history.slice(0, 100);
  }
  function isYearClosed(year = ui.year) { return Boolean(db.yearStatus?.[year]?.closed); }
  function blockIfYearClosed(year = ui.year) { return isYearClosed(year) ? (notice(`ปีงบ ${year} ปิดแล้ว กรุณาเปิดปีงบก่อนแก้ไขข้อมูล`), true) : false; }
  function documentStatus(item) {
    const date = new Date(), today = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    if (item.effectiveDate && item.effectiveDate > today) return 'รอมีผล';
    if (item.expiryDate && item.expiryDate < today) return 'หมดอายุ';
    return 'ใช้งาน';
  }
  function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function moveToTrash(type, label, payload) {
    const entry = { id: uid(), type, label, deletedAt: now(), deletedBy: 'ผู้ใช้ทดลอง', payload: clone(payload) };
    db.trash.unshift(entry);
    log(type, 'ย้ายไปถังพัก', label, payload, null);
    return entry;
  }
  function dueDateForMonth(month) {
    const [year, index] = month.split('-').map(Number);
    return new Date(year, index, 26, 23, 59, 59);
  }
  function reportDueState(month, today = new Date()) {
    const due = dueDateForMonth(month);
    const days = Math.ceil((new Date(due.getFullYear(), due.getMonth(), due.getDate()) - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000);
    return { due, days, label: days < 0 ? `เกินกำหนด ${Math.abs(days)} วัน` : days === 0 ? 'ครบกำหนดวันนี้' : `ครบกำหนดใน ${days} วัน` };
  }
  function yearCloseChecks(year = ui.year) {
    const projects = db.projects.filter(project => Number(project.year) === Number(year) && project.active !== false);
    const budget = db.budgets[year];
    const allocation = projects.reduce((sum, project) => sum + safeNum(project.budget), 0);
    const ownerMissing = projects.filter(project => !project.owners?.[0]?.email).length;
    const planMissing = projects.filter(project => !db.plans[project.id]).length;
    const today = new Date();
    const dueMissing = projects.reduce((sum, project) => {
      const plan = db.plans[project.id];
      return sum + (plan?.months || []).filter(row => dueDateForMonth(row.key) <= today && !db.reports.some(report => report.projectId === project.id && report.month === row.key)).length;
    }, 0);
    const expiredDocs = db.documents.filter(item => Number(item.year) === Number(year) && documentStatus(item) === 'หมดอายุ').length;
    const checks = [
      { label: 'ตั้งงบประมาณปีนี้', ready: Boolean(budget), detail: budget ? `${money(budget.amount)} บาท` : 'ยังไม่ได้ตั้งงบ', blocker: true },
      { label: 'งบที่จัดสรรไม่เกินวงเงิน', ready: Boolean(budget) && allocation <= safeNum(budget?.amount), detail: !budget ? 'ตรวจหลังตั้งงบ' : allocation > budget.amount ? `เกิน ${money(allocation - budget.amount)} บาท` : `จัดสรร ${money(allocation)} บาท`, blocker: Boolean(budget) && allocation > safeNum(budget.amount) },
      { label: 'ผู้รับผิดชอบหลักครบ', ready: ownerMissing === 0, detail: ownerMissing ? `ขาด ${ownerMissing} โครงการ` : `${projects.length} โครงการครบ`, blocker: false },
      { label: 'ทุกโครงการมีแผน', ready: planMissing === 0, detail: planMissing ? `ยังไม่มีแผน ${planMissing} โครงการ` : `${projects.length} โครงการมีแผน`, blocker: false },
      { label: 'รายงานเดือนที่ถึงกำหนดครบ', ready: dueMissing === 0, detail: dueMissing ? `ยังขาด ${dueMissing} รายงาน` : 'ไม่มีรายงานค้างตามกำหนด', blocker: false },
      { label: 'ทบทวนเอกสารหมดอายุ', ready: expiredDocs === 0, detail: expiredDocs ? `หมดอายุ ${expiredDocs} รายการ` : 'ไม่มีเอกสารหมดอายุ', blocker: false }
    ];
    return { checks, blockers: checks.filter(check => check.blocker && !check.ready), warnings: checks.filter(check => !check.blocker && !check.ready) };
  }
  function adminFollowUps(year = ui.year) {
    const projects = db.projects.filter(project => Number(project.year) === Number(year) && project.active !== false);
    const tasks = [];
    const today = new Date();
    projects.forEach(project => {
      if (!project.owners?.[0]?.email) tasks.push({ kind: 'owner', label: 'เพิ่มผู้รับผิดชอบหลัก', detail: project.name, project, page: 'admin', action: 'แก้ไขโครงการ' });
      if (!db.plans[project.id]) tasks.push({ kind: 'plan', label: 'ยังไม่มีแผนโครงการ', detail: project.name, project, page: 'plan', action: 'เปิดแผน' });
      (db.plans[project.id]?.months || []).forEach(row => {
        const due = dueDateForMonth(row.key), days = reportDueState(row.key, today);
        const reportExists = db.reports.some(report => report.projectId === project.id && report.month === row.key);
        if (!reportExists && due <= new Date(today.getTime() + 30 * 86400000)) tasks.push({ kind: 'report', label: `รายงาน ${monthLabel(row.key)} ยังไม่บันทึก`, detail: `${project.name} · ${days.label}`, project, month: row.key, page: 'report', action: 'เปิดรายงาน', due: days });
      });
    });
    db.documents.filter(item => Number(item.year) === Number(year)).forEach(item => {
      const status = documentStatus(item);
      const expiry = item.expiryDate ? new Date(`${item.expiryDate}T00:00:00`) : null;
      const days = expiry ? Math.ceil((expiry - new Date(today.getFullYear(), today.getMonth(), today.getDate())) / 86400000) : Infinity;
      if (status === 'หมดอายุ' || (days >= 0 && days <= 30)) tasks.push({ kind: 'document', label: status === 'หมดอายุ' ? 'เอกสารหมดอายุ' : 'เอกสารใกล้ถึงวันทบทวน', detail: `${item.title}${item.expiryDate ? ` · ${item.expiryDate}` : ''}`, document: item, action: 'ดูเอกสาร' });
    });
    const budget = db.budgets[year], total = projects.reduce((sum, project) => sum + safeNum(project.budget), 0);
    if (budget && total > budget.amount) tasks.unshift({ kind: 'budget', label: 'ยอดจัดสรรเกินงบปี', detail: `เกิน ${money(total - budget.amount)} บาท`, action: 'ตรวจงบโครงการ' });
    return tasks;
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
  function normalizeWorkspace(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('รูปแบบข้อมูลไม่ถูกต้อง');
    const restored = { ...empty(), ...data };
    ['departments','projects','reports','reportDrafts','documents','history','trash'].forEach(key => { if (restored[key] === undefined && key==='reportDrafts') restored[key]=[]; if (!Array.isArray(restored[key])) throw new Error(`ข้อมูล ${key} ไม่ถูกต้อง`); });
    ['budgets','plans','planDrafts','weights','yearStatus'].forEach(key => { if (!restored[key] || typeof restored[key] !== 'object' || Array.isArray(restored[key])) restored[key] = {}; });
    if (!Array.isArray(restored.admins) || !restored.admins.length) restored.admins = empty().admins;
    return restored;
  }
  function allBlobIds(data = db) {
    const ids = new Set();
    const visit = value => {
      if (!value || typeof value !== 'object') return;
      if (typeof value.blobId === 'string' && value.blobId) ids.add(value.blobId);
      Object.values(value).forEach(visit);
    };
    visit(data.documents || []); visit(data.reports || []); visit(data.trash || []);
    return [...ids];
  }
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(',')[1] || ''); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
  }
  async function exportWorkspaceBackup() {
    const blobs = [];
    for (const id of allBlobIds()) {
      const blob = await fileAction('get', id).catch(() => null);
      if (blob) blobs.push({ id, type: blob.type || 'application/octet-stream', data: await blobToBase64(blob) });
    }
    const backup = { format: 'mu-scurve-backup', version: 1, exportedAt: new Date().toISOString(), workspace: db, blobs };
    const file = new Blob([JSON.stringify(backup)], { type: 'application/json' });
    const url = URL.createObjectURL(file), link = document.createElement('a');
    link.href = url; link.download = `mahidol-sustainability-${ui.year}-backup.json`; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
    notice(`ดาวน์โหลดข้อมูลสำรองแล้ว · ${blobs.length} ไฟล์แนบ`);
  }
  async function restoreWorkspaceBackup(file) {
    try {
      const backup = JSON.parse(await file.text());
      if (backup?.format !== 'mu-scurve-backup' || backup.version !== 1) throw new Error('ไฟล์นี้ไม่ใช่ข้อมูลสำรองของเว็บจำลอง');
      const restored = normalizeWorkspace(backup.workspace);
      if (!Array.isArray(backup.blobs)) throw new Error('ไม่พบข้อมูลไฟล์แนบในชุดสำรอง');
      if (!window.confirm('กู้คืนข้อมูลชุดนี้ทับข้อมูลทดลองที่มีอยู่ในเบราว์เซอร์หรือไม่?')) return;
      await fileAction('clear');
      for (const item of backup.blobs) {
        const bytes = Uint8Array.from(atob(item.data), char => char.charCodeAt(0));
        await fileAction('put', item.id, new Blob([bytes], { type: item.type || 'application/octet-stream' }));
      }
      db = restored; adminPanels = {}; localStorage.removeItem(ADMIN_PANELS_KEY); persist();
      ui = { page: 'admin', year: Number(db.lastYear) || Number(Object.keys(db.budgets).sort().at(-1)) || 2569, projectId: '', month: '', reportId: '', editDept: '', editProject: '', editDoc: '', replaceFileId: '' };
      render(); notice(`กู้คืนข้อมูลสำเร็จ · ${backup.blobs.length} ไฟล์แนบ`);
    } catch (error) { notice(`กู้คืนไม่สำเร็จ: ${error.message || 'ไฟล์ข้อมูลไม่สมบูรณ์'}`); }
  }
  function restoreFromTrash(id) {
    const entry = db.trash.find(item => item.id === id);
    if (!entry) return notice('ไม่พบรายการในถังพัก');
    const { type, payload } = entry;
    const restoreYear = type === 'งบประมาณ' ? payload.year : type === 'โครงการ' ? payload.project?.year : type === 'เอกสาร' ? payload.year : type === 'รายงาน' ? db.projects.find(project => project.id === payload.projectId)?.year : null;
    if (restoreYear && blockIfYearClosed(Number(restoreYear))) return;
    if (type === 'งบประมาณ') {
      if (db.budgets[payload.year]) return notice(`ปี ${payload.year} มีงบอยู่แล้ว กรุณาตรวจสอบก่อนกู้คืน`);
      db.budgets[payload.year] = clone(payload.record);
    } else if (type === 'หน่วยงาน') {
      if (db.departments.some(item => item.id === payload.id || item.name.toLocaleLowerCase() === payload.name.toLocaleLowerCase())) return notice('มีหน่วยงานชื่อนี้หรือรหัสนี้อยู่แล้ว กรุณาตรวจสอบก่อนกู้คืน');
      db.departments.push(clone(payload));
    } else if (type === 'โครงการ') {
      const { project, plan, reports, documents } = payload;
      if (!db.departments.some(item => item.id === project.deptId)) return notice('กู้คืนหน่วยงานที่โครงการสังกัดก่อน แล้วจึงกู้คืนโครงการ');
      if (db.projects.some(item => item.id === project.id || (Number(item.year) === Number(project.year) && item.name.toLocaleLowerCase() === project.name.toLocaleLowerCase()))) return notice('มีโครงการชื่อนี้หรือรหัสนี้อยู่แล้ว กรุณาตรวจสอบก่อนกู้คืน');
      db.projects.push(clone(project));
      if (plan) db.plans[project.id] = clone(plan);
      (reports || []).forEach(report => { if (!db.reports.some(item => item.id === report.id)) db.reports.push(clone(report)); });
      (documents || []).forEach(doc => { if (!db.documents.some(item => item.id === doc.id)) db.documents.push(clone(doc)); });
    } else if (type === 'เอกสาร') {
      if (db.documents.some(item => item.id === payload.id)) return notice('เอกสารนี้ถูกกู้คืนแล้ว');
      db.documents.push(clone(payload));
    } else if (type === 'รายงาน') {
      if (!db.projects.some(item => item.id === payload.projectId)) return notice('กู้คืนโครงการก่อน แล้วจึงกู้คืนรายงาน');
      if (db.reports.some(item => item.id === payload.id || (item.projectId === payload.projectId && item.month === payload.month))) return notice('มีรายงานของโครงการและเดือนนี้อยู่แล้ว กรุณาตรวจสอบก่อนกู้คืน');
      db.reports.push(clone(payload));
    } else return notice('รายการชนิดนี้ยังไม่รองรับการกู้คืน');
    db.trash = db.trash.filter(item => item.id !== id);
    log(type, 'กู้คืนจากถังพัก', entry.label, null, payload);
    persist(); render(); notice(`กู้คืน “${entry.label}” แล้ว`);
  }
  async function openFile(id) {
    const openedWindow = window.open('about:blank', '_blank');
    try {
      const blob = await fileAction('get', id);
      if (!blob) { openedWindow?.close(); return notice('ไม่พบเนื้อไฟล์ในเบราว์เซอร์นี้'); }
      const url = URL.createObjectURL(blob);
      if (openedWindow) openedWindow.location.href = url;
      else { const link = document.createElement('a'); link.href = url; link.target = '_blank'; link.rel = 'noopener'; link.click(); }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch { openedWindow?.close(); notice('เปิดไฟล์ในเครื่องนี้ไม่ได้'); }
  }
  async function hydrateImages() {
    for (const image of $$('#screen img[data-blob-id]')) {
      try {
        const blob = await fileAction('get', image.dataset.blobId);
        if (blob && image.isConnected) image.src = URL.createObjectURL(blob);
      } catch { /* File metadata remains visible if browser storage is unavailable. */ }
    }
  }
  async function ensureReportImagesReady(root) {
    const images = [...root.querySelectorAll('img[data-blob-id]')];
    await Promise.all(images.map(async image => {
      if (!image.currentSrc && !image.src) {
        const blob = await fileAction('get', image.dataset.blobId);
        if (!blob) throw new Error('ไม่พบไฟล์ภาพที่แนบไว้ในรายงาน');
        image.src = URL.createObjectURL(blob);
      }
      if (image.decode) await image.decode();
      if (!image.naturalWidth) throw new Error('โหลดรูปภาพในรายงานไม่สำเร็จ');
    }));
  }
  function yearMonths(year) {
    const start = Number(year) - 544;
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(start, 9 + index, 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    });
  }
  function monthChoicesForYear(year = ui.year, projectId = ui.projectId) {
    const project=getPlan(projectId);
    const reports=projectReports(projectId).map(report=>report.month);
    const drafts=db.reportDrafts.filter(draft=>draft.projectId===projectId).map(draft=>draft.month);
    return [...new Set([...yearMonths(year),...(project?.months?.map(row=>row.key)||[]),...reports,...drafts])].sort();
  }
  function defaultMonthForYear(year) {
    const current=currentFiscalContext();
    if(Number(year)===current.year)return current.month;
    const keys=yearMonths(year),projectIds=new Set(db.projects.filter(project=>project.year===Number(year)).map(project=>project.id));
    const latest=db.reports.filter(report=>projectIds.has(report.projectId)&&keys.includes(report.month)).map(report=>report.month).sort().at(-1);
    return latest||keys[0];
  }
  function shiftMonth(key, count) {
    const [year, month] = key.split('-').map(Number);
    const date = new Date(year, month - 1 + count, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
  function monthsBetween(start, end) {
    if (!start || !end || end < start) return [];
    const result=[];
    for(let key=start;key<=end&&result.length<60;key=shiftMonth(key,1))result.push(key);
    return result;
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
  function getReportDraft(projectId, month) { return db.reportDrafts.find(draft => draft.projectId === projectId && draft.month === month) || null; }
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
  const expenseTypeNames = { procurement: 'จัดซื้อ/จ้างผ่านพัสดุ', advance: 'เงินยืมกองคลัง', other: 'ค่าใช้จ่ายอื่น / จ่ายตรง' };
  function planExpenseItems(plan) { return (plan?.procurementItems || []).filter(item => item.name || safeNum(item.amount) > 0).map(item => ({ ...item, type: ['procurement','advance','other'].includes(item.type) ? item.type : 'procurement' })); }
  function paid(report) { return Array.isArray(report?.expenseItemPayments) ? report.expenseItemPayments.reduce((sum, value) => sum + safeNum(value), 0) + safeNum(report.unplannedPaid) : safeNum(report?.procurementPaid) + safeNum(report?.loanPaid) + safeNum(report?.otherPaid); }
  function readExpenseDetails(fields, plan, existing = null) {
    const items=planExpenseItems(plan), legacyByType={procurement:safeNum(existing?.procurementPaid),advance:safeNum(existing?.loanPaid),other:safeNum(existing?.otherPaid)};
    const oldPayments=existing?.expenseItemPayments || existing?.procurementItemPayments || [];
    const usedLegacy={procurement:false,advance:false,other:false};
    const amounts=items.map((item,index)=>{
      const field=fields.get(`expenseItemPaid${index}`);
      if(field!==null&&field!==undefined)return parseAmount(field);
      if(Array.isArray(existing?.expenseItemPayments))return safeNum(existing.expenseItemPayments[index]);
      if(Array.isArray(existing?.procurementItemPayments) && !Array.isArray(existing?.expenseItemPayments) && item.type==='procurement' && oldPayments[index]!==undefined)return safeNum(oldPayments[index]);
      if(!usedLegacy[item.type]){usedLegacy[item.type]=true;return legacyByType[item.type]||0;}
      return 0;
    });
    const fieldChecked=(name,fallback)=>{const value=typeof fields.checked==='function'?fields.checked(name):undefined;return value===undefined?(fields.has(name)?fields.get(name)==='on':Boolean(fallback)):value;};
    const received=items.map((_,index)=>fieldChecked(`expenseItemReceived${index}`,existing?.expenseItemReceived?.[index]));
    const treasuryCleared=items.map((_,index)=>fieldChecked(`expenseItemTreasury${index}`,existing?.expenseItemTreasuryCleared?.[index]));
    const totals={procurement:0,advance:0,other:0};items.forEach((item,index)=>totals[item.type]+=safeNum(amounts[index]));
    const unplannedPaid=Array.isArray(existing?.expenseItemPayments)?safeNum(existing.unplannedPaid):Object.keys(legacyByType).reduce((sum,type)=>sum+(items.some(item=>item.type===type)?0:legacyByType[type]),safeNum(existing?.unplannedPaid));
    return { items, amounts, received, treasuryCleared, totals, unplannedPaid, total: amounts.reduce((sum,value)=>sum+safeNum(value),0)+unplannedPaid };
  }
  function reportFormFields(form) { const data=new FormData(form); return {get:name=>data.get(name),has:name=>data.has(name),checked:name=>{const input=form.elements.namedItem(name);return input&&'checked' in input?input.checked:undefined;}}; }
  function paidThrough(projectId, month) { return db.reports.filter(report => report.projectId === projectId && report.month <= month).reduce((sum, report) => sum + paid(report), 0); }
  function latestMonth() { return db.reports.filter(report => yearProjects().some(project => project.id === report.projectId)).map(report => report.month).sort().at(-1) || yearMonths(ui.year)[0]; }
  function projectOptions(selected = ui.projectId) { return yearProjects().map(project => `<option value="${esc(project.id)}" ${selected === project.id ? 'selected' : ''}>${esc(project.name)}</option>`).join(''); }
  function chooseProject() { if (!yearProjects().some(project => project.id === ui.projectId)) ui.projectId = yearProjects()[0]?.id || ''; }
  function chooseMonth() {
    const choices=monthChoicesForYear(ui.year,ui.projectId);
    if(!choices.includes(ui.month))ui.month=defaultMonthForYear(ui.year)||yearMonths(ui.year)[0];
  }
  function heading(kicker, title, description, aside = '') { const titleClass = title === 'สรุปผลการดำเนินงานประจำเดือน' ? 'report-review-page-title' : ''; return `<div class="page-head"><div><p class="eyebrow">${esc(kicker)}</p><h1 class="${titleClass}">${esc(title)}</h1><p class="muted">${esc(description)}</p></div>${aside}</div>`; }
  function emptyBox(title, detail, page, button) { return `<div class="empty-box"><strong>${esc(title)}</strong>${esc(detail)}${page ? `<div class="starter-actions" style="justify-content:center"><button class="btn primary-btn" data-go="${page}">${esc(button)}</button></div>` : ''}</div>`; }
  function ensureExampleReportSdgCard() {
    const sheet = document.querySelector('.project-monthly-report-sheet');
    // The sample report now renders its SDG section in the template itself.
    // Only add the legacy fallback when no SDG section exists at all; otherwise
    // it would append a second, duplicate card every time the example is opened.
    if (!sheet || sheet.querySelector('.report-related-sdgs')) return;
    const columns = sheet.querySelector('.project-report-two-col');
    if (!columns) return;
    const card = document.createElement('section');
    card.className = 'report-reading-card report-related-sdgs sample-report-sdg-card';
    card.innerHTML = '<h3>SDG ที่เกี่ยวข้อง</h3><div class="report-sdg-list"><div class="report-sdg-item" style="--sdg-color:#d6a328"><span>SDG 12</span><div><strong>การบริโภคและการผลิตที่ยั่งยืน</strong><small>ลดปริมาณขยะอาหารและส่งเสริมการคัดแยก</small></div></div><div class="report-sdg-item" style="--sdg-color:#3f8b4d"><span>SDG 13</span><div><strong>การรับมือการเปลี่ยนแปลงสภาพภูมิอากาศ</strong><small>ลดผลกระทบจากขยะอาหารในโรงอาหาร</small></div></div></div>';
    columns.appendChild(card);
  }
  function normalizeDashboardReportKpis() {
    const kpis = document.querySelector('.dashboard-project-report-print-target .project-report-kpis, .project-monthly-report-sheet .project-report-kpis');
    if (!kpis) return;
    if (ui.page === 'report-example') {
      const sample = currentMonthlyExample();
      const actual = exampleProgress(sample.phases || {});
      const planValue = safeNum(sample.planned);
      const gap = actual - planValue;
      const totalPaid = safeNum(sample.procurementPaid) + safeNum(sample.loanPaid) + safeNum(sample.otherPaid);
      const cumulative = safeNum(sample.priorPaid) + totalPaid;
      const budget = safeNum(sample.budget) || 200000;
      const remaining = Math.max(0, budget - cumulative);
      const varianceClass = gap < -0.05 ? 'variance-negative' : gap > 0.05 ? 'variance-positive' : 'variance-neutral';
      const varianceText = `${gap > 0 ? '+' : ''}${gap.toFixed(1)} จุด`;
      kpis.innerHTML = `<div class="${varianceClass}"><span>ผลเทียบแผน</span><strong>${varianceText}</strong><small>ผลจริง ${actual.toFixed(1)}% · แผน ${planValue.toFixed(1)}%</small></div><div><span>งบโครงการ</span><strong>${money(budget)} บาท</strong><small>จัดสรรตามแผนโครงการ</small></div><div><span>จ่ายเดือนนี้</span><strong>${money(totalPaid)} บาท</strong><small>ยอดถึง ${monthLabel(sample.month || ui.month)}</small></div><div><span>จ่ายสะสม · คงเหลือ</span><strong>จ่ายสะสม ${money(cumulative)} บาท</strong><small>คงเหลือ ${money(remaining)} บาท</small></div>`;
      return;
    }
    const project = selectedProject() || yearProjects()[0];
    if (!project) return;
    const report = getReport(project.id, ui.month) || projectReports(project.id).at(-1);
    if (!report) return;
    const planValue = plannedAt(project.id, report.month) ?? 0;
    const actual = progress(report.phases || {}) ?? 0;
    const gap = actual - planValue;
    const monthPaid = paid(report);
    const cumulative = paidThrough(project.id, report.month);
    const remaining = Math.max(0, safeNum(project.budget) - cumulative);
    const varianceClass = gap < -0.05 ? 'variance-negative' : gap > 0.05 ? 'variance-positive' : 'variance-neutral';
    const varianceText = `${gap > 0 ? '+' : ''}${gap.toFixed(1)} จุด`;
    kpis.innerHTML = `<div class="${varianceClass}"><span>ผลเทียบแผน</span><strong>${varianceText}</strong><small>ผลจริง ${actual.toFixed(1)}% · แผน ${planValue.toFixed(1)}%</small></div><div><span>งบโครงการ</span><strong>${money(safeNum(project.budget))} บาท</strong><small>จัดสรรตามแผนโครงการ</small></div><div><span>จ่ายเดือนนี้</span><strong>${money(monthPaid)} บาท</strong><small>ยอดถึง ${monthLabel(report.month)}</small></div><div><span>จ่ายสะสม · คงเหลือ</span><strong>จ่ายสะสม ${money(cumulative)} บาท</strong><small>คงเหลือ ${money(remaining)} บาท</small></div>`;
  }
  function controls(project = true, month = false) {
    return `<div class="card starter-toolbar"><label>ปีงบประมาณ<input id="context-year" type="number" min="2560" max="2600" value="${ui.year}"></label><button type="button" class="mini-btn" id="apply-year">ดูข้อมูลปีที่เลือก</button>${project ? `<label>โครงการ<select id="context-project">${projectOptions()}</select></label>` : ''}${month ? `<label>ข้อมูลถึงเดือน<select id="context-month">${monthChoicesForYear(ui.year,ui.projectId).map(key => `<option value="${key}" ${ui.month === key ? 'selected' : ''}>${monthLabel(key)}</option>`).join('')}</select></label>` : ''}<span class="muted" style="font-size:12px">ข้อมูลทั้งหมดในต้นแบบนี้เก็บเฉพาะเบราว์เซอร์เครื่องนี้</span></div>`;
  }
  function render() {
    chooseProject(); chooseMonth();
    $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.page === ui.page));
    const views = { home: renderHome, admin: renderAdmin, plan: renderPlan, report: renderReport, 'report-example': renderMonthlyReportExample, review: renderReview, dashboard: renderDashboard, archive: renderArchive, 'project-output': renderProjectOutput, 'portfolio-output': renderPortfolioOutput };
    let pageMarkup;
    const storedDb = db;
    if (ui.previewReport && ui.page === 'project-output') db = dashboardPreviewDatabase(ui.year);
    try {
      pageMarkup = (views[ui.page] || renderHome)();
    } catch (error) {
      console.error(`Failed to render page: ${ui.page}`, error);
      pageMarkup = `${heading('เกิดข้อผิดพลาด', 'เปิดหน้านี้ไม่สำเร็จ', 'ลองเปิดอีกครั้ง หรือกลับไปหน้าแรก')}${emptyBox('ไม่สามารถแสดงเนื้อหาหน้านี้ได้', 'ระบบบันทึกข้อผิดพลาดไว้ในคอนโซลสำหรับตรวจสอบ', 'home', 'กลับหน้าแรก')}`;
    } finally { db = storedDb; }
    screen.innerHTML = pageMarkup;
    if (['dashboard','project-output','report-example','review'].includes(ui.page)) normalizeDashboardReportKpis();
    // The sample report must always include the SDG section once its report sheet exists.
    // The helper is safe on the input/wizard view because it exits when no sheet is present.
    if (ui.page === 'report-example') ensureExampleReportSdgCard();
    if (ui.page === 'report') setReportStep(ui.reportStep, false);
    if (isYearClosed() && ui.page !== 'admin') screen.insertAdjacentHTML('afterbegin', `<div class="year-lock-banner"><strong>ปีงบ ${ui.year} ปิดแล้ว</strong><span>เปิดดูข้อมูลได้ แต่การบันทึกหรือแก้ไขจะถูกระงับ</span><button type="button" data-go="admin">ไปเปิดปีงบ</button></div>`);
    if (isYearClosed()) screen.querySelectorAll('#budget-form,#project-form,#weights-form,#document-form,#plan-form,#report-form,#copy-year-form').forEach(form=>form.querySelectorAll('input,select,textarea,button').forEach(control=>{control.disabled=true;}));
    if (ui.page === 'admin') enhanceAdminPanels();
    hydrateImages();
  }
  function navigate(page) { if(page!=='project-output')ui.previewReport=false;ui.page = page; ui.editDept = ''; ui.editProject = ''; ui.editDoc = ''; render(); window.scrollTo(0, 0); }

  function setReportStep(step, updateHash = true) {
    ui.reportStep = Math.max(1, Math.min(4, Number(step) || 1));
    const form = $('#report-form');
    if (!form) return;
    form.querySelectorAll('[data-report-panel]').forEach(panel => { panel.hidden = Number(panel.dataset.reportPanel) !== ui.reportStep; });
    form.querySelectorAll('[data-report-step]').forEach(button => {
      const active = Number(button.dataset.reportStep) === ui.reportStep;
      button.classList.toggle('active', active);
      button.setAttribute('aria-current', active ? 'step' : 'false');
    });
    form.querySelectorAll('[data-report-prev]').forEach(button => { button.hidden = ui.reportStep === 1; });
    form.querySelectorAll('[data-report-next]').forEach(button => { button.hidden = ui.reportStep === 4; });
    form.querySelectorAll('[data-report-submit]').forEach(button => { button.hidden = ui.reportStep !== 4; });
    const position = { 1: '#report-progress', 2: '#report-expenses', 3: '#report-summary', 4: '#report-review' }[ui.reportStep];
    if (updateHash && location.hash !== position) history.replaceState(null, '', position);
    updateReportReview(form);
  }

  function updateReportReview(form) {
    if (!form) return;
    const phases = Object.fromEntries(stepKeys.map(key => [key, safeNum(form.elements.namedItem(key)?.value)]));
    const plan = getPlan(ui.projectId);
    const details = readExpenseDetails(reportFormFields(form), plan, getReportDraft(ui.projectId,ui.month) || getReport(ui.projectId,ui.month));
    const total = details.total;
    const actual = progress(phases), planned = plannedAt(ui.projectId, ui.month);
    const diff = actual - planned;
    const status = diff < -5 ? `ช้ากว่าแผน ${Math.abs(diff).toFixed(1)} จุด` : diff > 5 ? `เร็วกว่าแผน ${diff.toFixed(1)} จุด` : 'ใกล้เคียงแผน';
    const set = (selector, value) => form.querySelectorAll(selector).forEach(node => { node.textContent = value; });
    set('[data-report-review-actual]', `${actual.toFixed(1)}%`); set('[data-report-review-planned]', `${planned.toFixed(1)}%`);
    set('[data-report-review-paid]', `${money(total)} บาท`);
    const files = (getReport(ui.projectId, ui.month)?.attachments?.length || 0) + (form.elements.namedItem('attachments')?.files?.length || 0) + [...form.querySelectorAll('input[type="file"][name^="expenseItemEvidence"]')].reduce((sum,input)=>sum+(input.files?.length||0),0);
    set('[data-report-review-files]', `${files} ไฟล์`);
    set('[data-report-review-status]', status);
    set('[data-report-review-summary]', String(form.elements.namedItem('summaryText')?.value || '').trim() || 'ยังไม่ได้กรอกสรุปผล');
    set('[data-report-review-delay]', String(form.elements.namedItem('delay')?.value || '').trim() || 'ไม่ต้องระบุ');
  }

  function adminPanelOpen(id) {
    const saved = adminPanels[`${ui.year}:${id}`];
    if (typeof saved === 'boolean') return saved;
    if (id === 'admin-budget') return !db.budgets[ui.year];
    if (id === 'admin-departments') return Boolean(db.budgets[ui.year]) && !db.departments.length;
    if (id === 'admin-projects') return Boolean(db.budgets[ui.year]) && db.departments.length > 0;
    return false;
  }
  function setAdminPanelOpen(id, open, persistChoice = true) {
    if (persistChoice) {
      adminPanels[`${ui.year}:${id}`] = open;
      localStorage.setItem(ADMIN_PANELS_KEY, JSON.stringify(adminPanels));
    }
    const section = document.getElementById(id);
    if (!section) return;
    section.classList.toggle('is-collapsed', !open);
    const body = section.querySelector('.admin-panel-body');
    const button = section.querySelector('[data-admin-toggle]');
    if (body) body.hidden = !open;
    if (button) { button.setAttribute('aria-expanded', String(open)); button.textContent = open ? '⌃ ย่อเนื้อหา' : '⌄ ขยายเนื้อหา'; }
  }
  function enhanceAdminPanels() {
    ['admin-budget', 'admin-copy', 'admin-departments', 'admin-projects', 'admin-weights', 'admin-access', 'admin-documents', 'admin-history', 'admin-trash', 'admin-year', 'admin-backup', 'admin-reset', 'admin-followups'].forEach(id => {
      const section = document.getElementById(id);
      const heading = section?.querySelector('.starter-section-title');
      if (!section || !heading) return;
      const body = document.createElement('div');
      body.className = 'admin-panel-body';
      body.id = `${id}-content`;
      [...section.childNodes].filter(node => node !== heading).forEach(node => body.appendChild(node));
      section.appendChild(body);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'admin-panel-toggle';
      button.dataset.adminToggle = id;
      button.setAttribute('aria-controls', body.id);
      heading.appendChild(button);
      setAdminPanelOpen(id, adminPanelOpen(id), false);
    });
  }

  function renderHome() {
    const projects = yearProjects();
    const projectCount = projects.length;
    const planCount = projects.filter(project => getPlan(project.id)).length;
    const period = ui.month || latestMonth();
    const monthReports = projects.map(project => ({ project, plan: getPlan(project.id), report: getReport(project.id, period) }));
    const reportCount = db.reports.filter(report => projects.some(project => project.id === report.projectId)).length;
    const checklist = [
      { ready: Boolean(db.budgets[ui.year]), label: 'ตั้งงบปี', detail: 'เริ่มที่หน้าแอดมิน', page: 'admin' },
      { ready: db.departments.length > 0 && projectCount > 0, label: 'เพิ่มหน่วยงานและโครงการ', detail: 'ระบุผู้รับผิดชอบ', page: 'admin' },
      { ready: planCount > 0, label: 'วางแผนรายเดือน', detail: 'กำหนดงาน เงิน และ SDG', page: 'plan' },
      { ready: reportCount > 0, label: 'รายงานผลรายเดือน', detail: 'กรอกผลและแนบภาพ', page: 'report' }
    ];
    if (!projectCount) return `${heading('เริ่มต้น', 'หน้าแรก', 'ทำตามลำดับ ตั้งงบ เพิ่มโครงการ วางแผน แล้วรายงานผลรายเดือน', `<span class="readonly-pill">ปีงบ ${ui.year} · เว็บจำลอง</span>`)}
      <div class="starter-banner"><div><span class="kicker">เริ่มจากข้อมูลของปีนี้</span><h2>ยังไม่มีโครงการให้กรอก</h2><p>ขอให้แอดมินเพิ่มโครงการและผู้รับผิดชอบก่อน จากนั้นรายการงานของคุณจะแสดงที่หน้านี้</p></div><button class="btn" data-go="admin">ไปหน้าแอดมิน</button></div>
      ${controls(false)}<div class="flow-list">${checklist.map((item, index) => `<button class="flow-step ${item.ready ? 'ready' : ''}" data-go="${item.page}"><b>${String(index + 1).padStart(2, '0')} · ${item.ready ? 'ทำแล้ว' : 'รอทำ'}</b><strong>${item.label}</strong><small>${item.detail}</small></button>`).join('')}</div>
      <h2 class="section-title">ข้อมูลที่กรอกในปีนี้</h2><div class="starter-grid"><div class="starter-card"><span>งบประมาณปี</span><strong>${db.budgets[ui.year] ? `${money(db.budgets[ui.year].amount)} บาท` : 'ยังไม่ได้ตั้ง'}</strong></div><div class="starter-card"><span>โครงการ</span><strong>0</strong><p>รอแอดมินเพิ่มโครงการ</p></div><div class="starter-card"><span>รายงานที่บันทึก</span><strong>0</strong><p>รายการจะปรากฏเมื่อเริ่มกรอก</p></div></div>
      <div class="soft-note">ข้อมูลเว็บจำลองเก็บในเบราว์เซอร์เครื่องนี้ ไม่ได้ส่งไป Google Sheets, Apps Script หรือ Drive จริง</div>`;
    const doneCount = monthReports.filter(item => item.report).length;
    const missingPlanCount = monthReports.filter(item => !item.plan).length;
    const behindCount = monthReports.filter(item => item.report && status(item.project, period).className === 'status-bad').length;
    const activeProject = selectedProject();
    const activePlan = getPlan(activeProject.id);
    const activePlanDraft = db.planDrafts[activeProject.id];
    const activeReport = getReport(activeProject.id, period);
    const activeReportDraft = getReportDraft(activeProject.id, period);
    const activeState = status(activeProject, period);
    const activeHistory = projectReports(activeProject.id);
    const activeProgress = activeReport ? progress(activeReport.phases) : activeHistory.at(-1) ? progress(activeHistory.at(-1).phases) : null;
    const pendingReportDrafts = db.reportDrafts.filter(draft => projects.some(project=>project.id===draft.projectId)).sort((a,b)=>String(b.savedAt||'').localeCompare(String(a.savedAt||''))).slice(0,5);
    return `${heading('พื้นที่ผู้ดำเนินโครงการ', 'หน้าแรก', 'เลือกปี โครงการ และเดือน แล้วไปทำรายการต่อได้ทันที', `<span class="readonly-pill">ปีงบ ${ui.year}</span>`)}
      ${controls(true,true)}
      ${pendingReportDrafts.length?`<section class="pending-drafts"><div class="starter-section-title"><div><h2>รายงานร่างที่ยังไม่ได้ส่ง</h2><p>ร่างจะไม่ถูกรวมในภาพรวมจนกว่าจะส่ง · กลับมาทำต่อได้จากรายการนี้</p></div><span class="status-pill status-pending">${pendingReportDrafts.length} ร่าง</span></div>${pendingReportDrafts.map(draft=>{const project=db.projects.find(item=>item.id===draft.projectId);return `<div class="pending-draft-row"><div><strong>${esc(project?.name||'โครงการ')}</strong><span>${monthLabel(draft.month)} · บันทึกล่าสุด ${esc(draft.savedAt)} · ยังไม่ส่ง</span></div><button class="mini-btn" data-follow-page="report" data-project-id="${draft.projectId}" data-follow-month="${draft.month}">ทำต่อและส่ง →</button></div>`}).join('')}</section>`:''}
      <section class="work-project-hero"><div><span class="work-project-label">โครงการที่เลือก · ${monthLabel(period)}</span><h2>${esc(activeProject.name)}</h2><p>${esc(db.departments.find(dept=>dept.id===activeProject.deptId)?.name||'ไม่ระบุหน่วยงาน')} · งบโครงการ ${money(activeProject.budget)} บาท</p></div><div class="work-project-progress"><strong>${activeProgress===null?'—':`${activeProgress.toFixed(1)}%`}</strong><span>${activeReport?`ผลสะสม · ${activeState.label}`:activeProgress===null?'ยังไม่มีรายงาน':'ผลสะสมจากรายงานล่าสุด'}</span></div></section>
      <section class="work-today"><div class="starter-section-title"><div><h2>วันนี้ต้องการทำอะไร</h2><p>เลือกงานที่ต้องการ ระบบจะเปิดโครงการและรอบเดือนนี้ให้ทันที</p></div><span class="user-project-state ${activeReport?activeState.className:'user-state-pending'}">${activeReport?`รายงาน ${monthLabel(period)} แล้ว`:`รอรายงาน ${monthLabel(period)}`}</span></div><div class="work-action-grid">
        <button class="work-action-card" data-follow-page="plan" data-project-id="${activeProject.id}"><span class="work-action-number">01</span><strong>${activePlanDraft?'ทำร่างแผนต่อ':activePlan?'แก้ไขแผนโครงการ':'วางแผนโครงการ'}</strong><small>${activePlanDraft?`มีร่างบันทึกไว้ ${esc(activePlanDraft.savedAt)}`:'กำหนดวัตถุประสงค์ SDG ช่วงเวลา แผนรายเดือน และงบ'}</small><b>${activePlanDraft?'กลับไปทำต่อ':'ไปหน้าแผน'} →</b></button>
        <button class="work-action-card" data-follow-page="review" data-project-id="${activeProject.id}" data-follow-month="${period}"><span class="work-action-number">02</span><strong>ติดตามแผนและผล</strong><small>ดูภาพรวมรายเดือนว่าแผนกับผลจริงเป็นอย่างไร และเดือนไหนยังรอรายงาน</small><b>เปิดตารางติดตาม →</b></button>
        <button class="work-action-card featured" data-follow-page="report" data-project-id="${activeProject.id}" data-follow-month="${period}"><span class="work-action-number">03</span><strong>${activeReportDraft?'ทำร่างรายงานต่อ':activeReport?'แก้รายงานเดือนนี้':`รายงานผล ${monthLabel(period)}`}</strong><small>กรอกความก้าวหน้า เงินจ่ายจริง สรุปผล และแนบหลักฐาน</small><b>${activeReportDraft?'กลับไปทำต่อ':activeReport?'เปิดฉบับที่บันทึกไว้':'เริ่มรายงาน'} →</b></button>
        <button class="work-action-card" data-follow-page="archive" data-project-id="${activeProject.id}"><span class="work-action-number">04</span><strong>แก้ข้อมูลย้อนหลัง</strong><small>${activeHistory.length?`มีรายงานเดิม ${activeHistory.length} เดือน · เปิดกลับมาแก้ได้`:'รายงานที่บันทึกจะแสดงให้เปิดดูและแก้ไขที่นี่'}</small><b>เลือกรอบรายงาน →</b></button></div></section>
      <section class="report-cycle-banner ${activeReport?'is-submitted':activeReportDraft?'is-draft':''}"><div><strong>รายงานประจำเดือน ${monthLabel(period)} · กำหนดส่งวันที่ 26</strong><span>${activeReportDraft?`มีร่างที่บันทึกไว้ ${esc(activeReportDraft.savedAt)} · ${activeReport?'ฉบับแก้ไขยังไม่ส่ง':'ร่างยังไม่นับว่าส่งรายงาน'}`:activeReport?`ส่งรายงานแล้ว · ฉบับ ${activeReport.version} · ${esc(activeReport.updatedAt)}`:'ยังไม่ได้บันทึกหรือส่งรายงานเดือนนี้'}</span></div><button class="mini-btn" data-follow-page="report" data-project-id="${activeProject.id}" data-follow-month="${period}">${activeReportDraft?'กลับไปทำร่างต่อ':activeReport?'เปิดรายงาน':'เริ่มรายงาน'}</button></section>
      <section class="user-work-summary card"><div><small>ภาพรวมรอบเดือน ${monthLabel(period)}</small><h2>${doneCount}/${projectCount} โครงการรายงานแล้ว</h2><p>${missingPlanCount} โครงการยังไม่มีแผน · ${behindCount} โครงการต่ำกว่าแผน</p></div><button class="mini-btn" data-go="archive">ดูรายงานย้อนหลังทั้งหมด</button></section>
      <div class="soft-note">ข้อมูลและไฟล์แนบในเว็บจำลองเก็บในเบราว์เซอร์เครื่องนี้เท่านั้น</div>`;
  }

  function renderAdmin() {
    const budget = db.budgets[ui.year];
    const projects = yearProjects();
    const allocation = projects.reduce((sum, project) => sum + safeNum(project.budget), 0);
    const inactiveProjects = db.projects.filter(project => project.year === ui.year && project.active === false);
    const inactiveBudget = inactiveProjects.reduce((sum, project) => sum + safeNum(project.budget), 0);
    const remaining = budget ? safeNum(budget.amount) - allocation : null;
    const allocationPercent = budget?.amount > 0 ? Math.min(100, Math.max(0, allocation / budget.amount * 100)) : 0;
    const closed = isYearClosed();
    const missingPlan = projects.filter(project => !getPlan(project.id));
    const missingOwner = projects.filter(project => !project.owners?.[0]?.email);
    const centralDocs = db.documents.filter(item => item.year === ui.year && item.scope === 'central');
    const nextAction = closed ? `ปีงบ ${ui.year} ปิดแล้ว · เปิดปีเพื่อแก้ข้อมูล` : !budget ? 'เริ่มจากตั้งงบประมาณปีนี้' : !db.departments.length ? 'เพิ่มหน่วยงานและหัวหน้าที่รับผิดชอบ' : !projects.length ? 'เพิ่มโครงการและผู้รับผิดชอบ' : remaining < 0 ? `งบโครงการเกินวงเงิน ${money(-remaining)} บาท กรุณาตรวจสอบ` : missingOwner.length ? `ตรวจผู้รับผิดชอบหลักของ ${missingOwner.length} โครงการ` : missingPlan.length ? `ยังมี ${missingPlan.length} โครงการที่ไม่มีแผน` : remaining > 0 ? `ยังมี ${money(remaining)} บาทที่รอจัดสรรหรือยืนยันว่าเป็นเงินคงเหลือ` : 'ข้อมูลหลักพร้อมแล้ว ตรวจเอกสารส่วนกลางและปิดปีเมื่อสิ้นงวด';
    const readiness = [
      { ok: Boolean(budget), label: 'ตั้งงบประมาณปีนี้', detail: budget ? `${money(budget.amount)} บาท` : 'ยังไม่มีวงเงินที่บันทึก', target: 'admin-budget' },
      { ok: db.departments.length > 0, label: 'มีข้อมูลหน่วยงาน', detail: `${db.departments.length} หน่วยงาน`, target: 'admin-departments' },
      { ok: Boolean(projects.length) && remaining >= 0, label: 'จัดสรรงบไม่เกินวงเงิน', detail: remaining == null ? 'ตั้งงบก่อนตรวจสอบ' : remaining < 0 ? `เกินงบ ${money(-remaining)} บาท` : `${money(Math.max(0, remaining))} บาทยังไม่จัดสรร`, target: 'admin-projects' },
      { ok: projects.length > 0 && missingOwner.length === 0, label: 'ผู้รับผิดชอบหลักครบ', detail: `${projects.length - missingOwner.length}/${projects.length} โครงการ`, target: 'admin-projects' },
      { ok: projects.length > 0 && missingPlan.length === 0, label: 'โครงการมีแผนแล้ว', detail: `${projects.length - missingPlan.length}/${projects.length} โครงการ`, target: 'admin-projects' },
      { ok: centralDocs.length > 0, label: 'มีเอกสารอ้างอิงส่วนกลาง', detail: `${centralDocs.length} รายการ`, target: 'admin-documents' }
    ];
    const followUps = adminFollowUps(ui.year);
    const closeReadiness = yearCloseChecks(ui.year);
    const docSearch = String(ui.adminDocSearch || '').trim().toLocaleLowerCase();
    const docCategory = ui.adminDocCategory || 'all';
    const docVisibility = ui.adminDocVisibility || 'all';
    const docStatusFilter = ui.adminDocStatus || 'all';
    const deptEdit = db.departments.find(item => item.id === ui.editDept);
    const projectEdit = db.projects.find(item => item.id === ui.editProject);
    const docEdit = db.documents.find(item => item.id === ui.editDoc);
    const docs = db.documents.filter(item => item.year === ui.year && (!docSearch || `${item.title} ${item.number} ${item.fileName}`.toLocaleLowerCase().includes(docSearch)) && (docCategory === 'all' || item.category === docCategory) && (docVisibility === 'all' || (docVisibility === 'visible' ? item.visible : !item.visible)) && (docStatusFilter === 'all' || (docStatusFilter === 'expired' ? documentStatus(item) === 'หมดอายุ' : docStatusFilter === 'upcoming' ? documentStatus(item) === 'รอมีผล' : documentStatus(item) === 'ใช้งาน')));
    const currentWeights = weights();
    const weightHistory = db.history.filter(item=>item.section==='ค่าน้ำหนัก'&&String(item.detail||'').startsWith(`ปี ${ui.year} ·`)).slice(0,30);
    const renderWeightSnapshot = values => values ? `<div class="weight-snapshot">${stepKeys.map(key=>`<span>${esc(stages.find(item=>item[0]===key)?.[1]||key)} <b>${safeNum(values[key])}%</b></span>`).join('')}</div>` : '<span class="muted">ยังไม่มีค่าก่อนบันทึก</span>';
    return `${heading('สำหรับผู้ดูแลระบบ', 'จัดการระบบ (แอดมิน)', 'ตรวจงบ ผู้รับผิดชอบ ค่าน้ำหนัก และเอกสารที่ทุกคนต้องหยิบใช้')}${controls(false)}
      <div class="admin-brief"><div><small>ภาพรวมปีงบประมาณ ${ui.year} · ${closed ? 'ปิดงวด' : 'กำลังดำเนินงาน'}</small><h2>เรื่องที่แอดมินต้องเห็นก่อนเริ่มงาน</h2><p>${esc(nextAction)}</p></div><span class="admin-brief-count">${projects.length} โครงการใช้งาน · ${docs.length} เอกสาร</span></div>
      <nav class="admin-shortcuts" aria-label="ไปยังหัวข้อจัดการระบบ">${[['admin-budget','งบปี'],['admin-departments','หน่วยงาน'],['admin-projects','โครงการ'],['admin-weights','ค่าน้ำหนัก'],['admin-documents','เอกสาร'],['admin-copy','เตรียมปีใหม่'],['admin-access','สิทธิ์ผู้ดูแล'],['admin-history','ประวัติ'],['admin-year','ปิดปีงบ'],['admin-trash','ถังพัก'],['admin-backup','สำรองข้อมูล']].map(([id,label])=>`<button type="button" data-admin-jump="${id}">${label}</button>`).join('')}</nav>
      <section class="card admin-readiness" aria-labelledby="admin-readiness-title"><div class="starter-section-title"><div><small>ตรวจความพร้อมก่อนเปิดปี/รอบงาน</small><h2 id="admin-readiness-title">รายการที่ควรเช็ก</h2></div><span class="current-year-tag">${readiness.filter(item=>item.ok).length}/${readiness.length} พร้อม</span></div><div class="admin-checklist">${readiness.map(item=>`<button type="button" class="admin-check ${item.ok?'is-ready':'is-pending'}" data-admin-jump="${item.target}"><span class="admin-check-icon">${item.ok?'✓':'!'}</span><span><strong>${esc(item.label)}</strong><small>${esc(item.detail)}</small></span><span class="admin-check-go">ไปดู →</span></button>`).join('')}</div></section>
      <section class="card admin-followups" id="admin-followups" aria-labelledby="admin-followups-title"><div class="starter-section-title"><div><small>รายการติดตามปีงบ ${ui.year}</small><h2 id="admin-followups-title">งานที่ควรตาม</h2><p>รวมข้อมูลที่ยังขาด กำหนดรายงาน และเอกสารที่ควรทบทวน</p></div><span class="${followUps.length?'year-closed-tag':'current-year-tag'}">${followUps.length ? `${followUps.length} รายการ` : 'ไม่มีงานค้าง'}</span></div>${followUps.length ? `<div class="admin-followup-list">${followUps.slice(0,12).map(task=>{const emails=(task.project?.owners||[]).map(owner=>owner.email).filter(Boolean).join(',');const subject=encodeURIComponent(`ติดตามข้อมูลโครงการ ${task.project?.name||''}`);const body=encodeURIComponent(`เรียนผู้รับผิดชอบ\n\nขอติดตาม${task.month?`รายงานผลประจำเดือน ${monthLabel(task.month)} ของ`:''}โครงการ ${task.project?.name||''}${task.detail?`\n${task.detail}`:''}\n\nกรุณาอัปเดตข้อมูลในระบบเมื่อสะดวก\n\nขอบคุณค่ะ`);return `<div class="admin-followup-item"><span class="followup-dot ${task.kind==='budget'||task.due?.days<0||task.kind==='document'?'urgent':''}"></span><div class="admin-followup-copy"><strong>${esc(task.label)}</strong><small>${esc(task.detail)}</small></div><div class="admin-followup-actions">${task.kind==='owner'?`<button class="mini-btn" data-edit-project="${task.project.id}">${task.action}</button>`:task.kind==='plan'||task.kind==='report'?`<button class="mini-btn" data-follow-page="${task.page}" data-project-id="${task.project.id}" data-follow-month="${task.month||''}">${task.action}</button>${task.kind==='report'&&emails?`<a class="mini-btn" href="mailto:${esc(emails)}?subject=${subject}&body=${body}">เตรียมอีเมลแจ้ง</a>`:''}`:`<button class="mini-btn" data-admin-jump="${task.kind==='document'?'admin-documents':'admin-projects'}">${task.action}</button>`}</div></div>`;}).join('')}</div>${followUps.length>12?`<p class="muted">แสดง 12 รายการแรกจากทั้งหมด ${followUps.length} รายการ</p>`:''}<p class="admin-followup-note">ระบบจำลองไม่ส่งอีเมลเอง ปุ่มเตรียมอีเมลจะเปิดฉบับร่างให้ตรวจทานก่อนส่ง</p>`:emptyBox('ยังไม่มีงานที่ต้องตาม', 'เมื่อมีข้อมูลขาด รายงานใกล้กำหนด หรือเอกสารใกล้ทบทวน รายการจะปรากฏที่นี่')}</section>
      <div class="admin-overview card"><div class="starter-section-title"><div><small>ภาพรวมงบประมาณและความพร้อม</small><h2>เงินอนุมัติไปอยู่ตรงไหนแล้ว</h2><p>โครงการที่พักหรือยกเลิกแสดงแยกจากยอดจัดสรรที่ใช้งาน</p></div><span class="current-year-tag">ปี ${ui.year}</span></div>
        <div class="admin-overview-grid"><div><span>งบอนุมัติทั้งปี</span><strong>${budget ? `${money(budget.amount)} บาท` : 'ยังไม่ได้ตั้ง'}</strong><small>กรอบวงเงินที่บันทึกไว้</small></div><div><span>จัดสรรให้โครงการที่ใช้งาน</span><strong>${money(allocation)} บาท</strong><small>${projects.length} โครงการที่ใช้งาน</small></div><div class="${remaining != null && remaining < 0 ? 'over-budget' : 'remaining'}"><span>${remaining != null && remaining < 0 ? 'จัดสรรเกินงบ' : 'ยังไม่ได้จัดสรร'}</span><strong>${remaining == null ? '—' : `${money(Math.abs(remaining))} บาท`}</strong><small>${remaining != null && remaining < 0 ? 'ตรวจสอบวงเงินโครงการ' : 'รอจัดสรรหรือยืนยันเงินคงเหลือ'}</small></div><div><span>โครงการพักหรือยกเลิก</span><strong>${money(inactiveBudget)} บาท</strong><small>${inactiveProjects.length} โครงการ · ไม่นับในยอดใช้งาน</small></div></div>
        <div class="admin-budget-meter ${remaining != null && remaining < 0?'has-overrun':''}" role="progressbar" aria-label="สัดส่วนงบที่จัดสรร" aria-valuenow="${Math.round(allocationPercent)}" aria-valuemin="0" aria-valuemax="100"><span style="width:${allocationPercent}%"></span></div><p class="admin-meter-note">${budget ? `จัดสรรแล้ว ${money(allocation)} จาก ${money(budget.amount)} บาท · ${remaining < 0 ? `เกินงบ ${money(-remaining)} บาท` : `ยังไม่จัดสรร ${money(remaining)} บาท`}` : 'ตั้งงบประมาณเพื่อเริ่มดูสัดส่วนการจัดสรร'}</p></div>
      <div class="admin-section-group"><span>ตั้งค่าหลัก</span><p>กำหนดข้อมูลที่ระบบใช้วางแผนและติดตามโครงการ</p></div>
      <section class="card" id="admin-budget"><div class="starter-section-title"><div><h2>1 · งบประมาณประจำปี</h2><p>บันทึกได้หลายปี แล้วเลือกปีด้านบนเพื่อดูย้อนหลัง</p></div></div>
        <form id="budget-form"><div class="starter-form-grid two"><label>ปีงบประมาณ<input value="${ui.year}" readonly></label><label>ยอดงบอนุมัติ (บาท)<input name="amount" type="text" inputmode="decimal" data-money required value="${budget ? esc(formatMoneyInput(budget.amount)) : ''}" placeholder="เช่น 5,000,000"></label></div><div class="starter-actions"><button class="btn primary-btn">${budget ? 'บันทึกยอดงบที่แก้ไข' : 'บันทึกงบปีนี้'}</button></div></form>
        <div class="table-scroll"><table class="starter-table"><thead><tr><th>ปีงบ</th><th>งบที่ตั้ง</th><th>แก้ล่าสุด</th><th>จัดการ</th></tr></thead><tbody>${Object.entries(db.budgets).sort((a,b)=>Number(b[0])-Number(a[0])).map(([year, item]) => `<tr><td>${year}</td><td>${money(item.amount)} บาท</td><td>${esc(item.updatedAt)}</td><td class="actions">${Number(year) === ui.year ? '<span class="current-year-tag">กำลังดูปีนี้</span>' : `<button class="mini-btn" data-year-open="${year}">ดูข้อมูลปี ${year}</button>`}<button class="mini-btn danger" data-delete-budget="${year}">พัก</button></td></tr>`).join('') || '<tr><td colspan="4">ยังไม่มีงบปีใดที่บันทึก</td></tr>'}</tbody></table></div></section>
      <section class="card" id="admin-departments"><div class="starter-section-title"><div><h2>2 · หน่วยงานและหัวหน้า</h2><p>แก้ข้อมูลได้เมื่อหัวหน้าหรือผู้ประสานงานเปลี่ยน</p></div></div>
        <form id="department-form"><div class="starter-form-grid four"><label>ชื่อหน่วยงาน<input name="name" required value="${esc(deptEdit?.name)}" placeholder="ชื่อหน่วยงาน"></label><label>ชื่อหัวหน้า<input name="head" required value="${esc(deptEdit?.head)}"></label><label>อีเมลหัวหน้า<input name="email" type="email" required value="${esc(deptEdit?.email)}"></label><label>มีผลตั้งแต่<input name="since" type="date" value="${esc(deptEdit?.since)}"></label></div><div class="starter-actions"><button class="btn primary-btn">${deptEdit ? 'บันทึกการแก้ไข' : 'เพิ่มหน่วยงาน'}</button>${deptEdit ? '<button type="button" class="btn quiet-btn" data-cancel-edit>ยกเลิกแก้ไข</button>' : ''}</div></form>
        <div class="table-scroll"><table class="starter-table"><thead><tr><th>หน่วยงาน</th><th>หัวหน้า</th><th>อีเมล</th><th>มีผลตั้งแต่</th><th>จัดการ</th></tr></thead><tbody>${db.departments.map(item => `<tr><td>${esc(item.name)}</td><td>${esc(item.head)}</td><td>${esc(item.email)}</td><td>${item.since || '—'}</td><td class="actions"><button class="mini-btn" data-edit-dept="${item.id}">แก้ไข</button><button class="mini-btn danger" data-delete-dept="${item.id}">พัก</button></td></tr>`).join('') || '<tr><td colspan="5">ยังไม่มีหน่วยงาน</td></tr>'}</tbody></table></div></section>
      <section class="card" id="admin-projects"><div class="starter-section-title"><div><h2>3 · โครงการและผู้รับผิดชอบ</h2><p>เจ้าของหลัก 1 คน และผู้ร่วมรับผิดชอบได้อีก 2 คน</p></div></div>
        ${!budget ? '<div class="soft-note warn">กรุณาตั้งงบปีนี้ก่อนเพิ่มโครงการ เพื่อดูยอดจัดสรรเทียบงบ</div>' : ''}
        <form id="project-form"><div class="starter-form-grid three"><label class="wide">ชื่อโครงการ<input name="name" required value="${esc(projectEdit?.name)}" placeholder="กรอกชื่อโครงการ"></label><label>หน่วยงาน<select name="deptId" required><option value="">เลือกหน่วยงาน</option>${db.departments.map(dept => `<option value="${dept.id}" ${projectEdit?.deptId === dept.id ? 'selected' : ''}>${esc(dept.name)}</option>`).join('')}</select></label><label>งบโครงการ (บาท)<input name="budget" type="text" inputmode="decimal" data-money required value="${projectEdit ? esc(formatMoneyInput(projectEdit.budget)) : ''}" placeholder="เช่น 200,000"></label><label>สถานะ<select name="active"><option value="true" ${projectEdit?.active !== false ? 'selected' : ''}>ใช้งาน</option><option value="false" ${projectEdit?.active === false ? 'selected' : ''}>พัก/ยกเลิก</option></select></label>
          <div class="owner-list"><div class="owner-list-heading">ผู้รับผิดชอบโครงการ</div>${[0,1,2].map(index => `<div class="owner-row"><div class="owner-role">${index === 0 ? 'หลัก <span>จำเป็น</span>' : `รอง ${index}`}</div><label>ชื่อผู้รับผิดชอบ<input name="ownerName${index}" ${index === 0 ? 'required' : ''} value="${esc(projectEdit?.owners?.[index]?.name)}" placeholder="ชื่อ–นามสกุล"></label><label>อีเมล<input name="ownerEmail${index}" type="email" ${index === 0 ? 'required' : ''} value="${esc(projectEdit?.owners?.[index]?.email)}" placeholder="name@mahidol.ac.th"></label></div>`).join('')}</div></div>
          <div class="starter-actions"><button class="btn primary-btn">${projectEdit ? 'บันทึกการแก้ไขโครงการ' : 'เพิ่มโครงการ'}</button>${projectEdit ? '<button type="button" class="btn quiet-btn" data-cancel-edit>ยกเลิกแก้ไข</button>' : ''}<span class="muted">งบโครงการรวม ${money(allocation)} ${budget ? `/ ${money(budget.amount)} บาท` : 'บาท · ยังไม่ตั้งงบปี'}</span></div></form>
        <div class="table-scroll"><table class="starter-table"><thead><tr><th>โครงการ</th><th>หน่วยงาน</th><th>งบ</th><th>ผู้รับผิดชอบหลัก</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>${db.projects.filter(project=>project.year===ui.year).map(item => `<tr><td>${esc(item.name)}</td><td>${esc(db.departments.find(dept=>dept.id===item.deptId)?.name || '—')}</td><td>${money(item.budget)} บาท</td><td>${esc(item.owners?.[0]?.name || '—')}</td><td>${item.active === false ? 'พัก/ยกเลิก' : 'ใช้งาน'}</td><td class="actions"><button class="mini-btn" data-edit-project="${item.id}">แก้ไข</button><button class="mini-btn danger" data-delete-project="${item.id}">พัก</button></td></tr>`).join('') || '<tr><td colspan="6">ยังไม่มีโครงการในปีนี้</td></tr>'}</tbody></table></div></section>
      <section class="card" id="admin-weights"><div class="starter-section-title"><div><h2>4 · ค่าน้ำหนักขั้นตอน</h2><p>ค่าเริ่มต้นเป็นกฎคำนวณ ไม่ใช่ผลโครงการตัวอย่าง</p></div></div><form id="weights-form"><div class="starter-form-grid four">${stepKeys.map(key => `<label>${esc(stages.find(item=>item[0]===key)?.[1] || key)}<input name="${key}" type="number" min="0" max="100" required value="${esc(currentWeights[key])}"></label>`).join('')}</div><div class="starter-actions"><button class="btn primary-btn">บันทึกน้ำหนักปี ${ui.year}</button><span class="muted">ผลรวมต้องเท่ากับ 100%</span></div></form><div class="weight-history"><div class="weight-history-heading"><h3>ประวัติการเปลี่ยนค่าน้ำหนัก</h3><span>${weightHistory.length} รายการ · ปี ${ui.year}</span></div><div class="table-scroll"><table class="starter-table weight-history-table"><thead><tr><th>วันที่และเวลา</th><th>ผู้บันทึก</th><th>การเปลี่ยนแปลง</th><th>ค่าก่อนและหลัง</th></tr></thead><tbody>${weightHistory.map(item=>`<tr><td>${esc(item.at||'—')}</td><td>${esc(item.actor||'—')}</td><td>${esc(item.action)}<small>${esc(item.detail||'')}</small></td><td><details class="weight-history-details"><summary>ดูค่าก่อนและหลัง</summary><div class="weight-history-pair"><section><b>ก่อน</b>${renderWeightSnapshot(item.before)}</section><section><b>หลัง</b>${renderWeightSnapshot(item.after)}</section></div></details></td></tr>`).join('')||'<tr><td colspan="4" class="muted">ยังไม่มีประวัติการเปลี่ยนค่าน้ำหนักในปีนี้</td></tr>'}</tbody></table></div></div></section>
      <section class="card" id="admin-documents"><div class="starter-section-title"><div><h2>5 · ศูนย์เอกสารอ้างอิง</h2><p>อัปโหลดไฟล์จากเครื่องและกำหนดว่าจะให้เห็นบนแดชบอร์ดหรือไม่</p></div></div>
        <form id="document-form"><div class="starter-form-grid three"><label class="wide">ชื่อเอกสาร<input name="title" required value="${esc(docEdit?.title)}" placeholder="เช่น หนังสืออนุมัติหลักการโครงการ"></label><label>ขอบเขต<select name="scope"><option value="central" ${docEdit?.scope !== 'project' ? 'selected' : ''}>ส่วนกลางทั้งปี</option><option value="project" ${docEdit?.scope === 'project' ? 'selected' : ''}>เฉพาะโครงการ</option></select></label><label>โครงการ<select name="projectId"><option value="">ไม่ระบุ / ส่วนกลาง</option>${projectOptions(docEdit?.projectId || '')}</select></label><label>ประเภท<select name="category">${['อนุมัติแผนใหญ่','จัดสรรงบ','อนุมัติโครงการ','จัดซื้อจัดจ้าง','ตรวจรับ','เงินยืม/วางฎีกา','ขยายเวลา','อื่น ๆ'].map(category => `<option ${docEdit?.category===category ? 'selected' : ''}>${category}</option>`).join('')}</select></label><label>เลขที่หนังสือ<input name="number" value="${esc(docEdit?.number)}"></label><label>มีผลตั้งแต่<input name="effectiveDate" type="date" value="${esc(docEdit?.effectiveDate)}"></label><label>หมดอายุ / ทบทวนวันที่<input name="expiryDate" type="date" value="${esc(docEdit?.expiryDate)}"></label><label>ไฟล์ PDF / Word<input name="file" type="file" accept=".pdf,.doc,.docx"></label><label style="align-self:end"><input name="visible" type="checkbox" ${docEdit?.visible ? 'checked' : ''} style="width:auto;min-height:auto"> แสดงบนแดชบอร์ด</label></div><div class="starter-actions"><button class="btn primary-btn">${docEdit ? 'บันทึกการแก้ไขเอกสาร' : 'เพิ่มเอกสาร'}</button>${docEdit ? '<button type="button" class="btn quiet-btn" data-cancel-edit>ยกเลิกแก้ไข</button>' : ''}<span class="muted">ระบบเก็บข้อมูลฉบับก่อนเมื่อแก้ไข · ไฟล์อยู่ในเบราว์เซอร์เครื่องนี้</span></div></form>
        <form id="admin-document-filter" class="admin-document-filter"><label>ค้นหาชื่อ / เลขที่ / ไฟล์<input name="search" value="${esc(ui.adminDocSearch)}" placeholder="พิมพ์คำที่ต้องการค้น"></label><label>ประเภท<select name="category"><option value="all">ทุกประเภท</option>${['อนุมัติแผนใหญ่','จัดสรรงบ','อนุมัติโครงการ','จัดซื้อจัดจ้าง','ตรวจรับ','เงินยืม/วางฎีกา','ขยายเวลา','อื่น ๆ'].map(category=>`<option ${docCategory===category?'selected':''}>${category}</option>`).join('')}</select></label><label>กำหนดเวลา<select name="status"><option value="all" ${docStatusFilter==='all'?'selected':''}>ทุกสถานะ</option><option value="current" ${docStatusFilter==='current'?'selected':''}>ใช้งาน</option><option value="upcoming" ${docStatusFilter==='upcoming'?'selected':''}>รอมีผล</option><option value="expired" ${docStatusFilter==='expired'?'selected':''}>หมดอายุ</option></select></label><label>การแสดงผล<select name="visibility"><option value="all" ${docVisibility==='all'?'selected':''}>ทั้งหมด</option><option value="visible" ${docVisibility==='visible'?'selected':''}>แสดงบนแดชบอร์ด</option><option value="hidden" ${docVisibility==='hidden'?'selected':''}>ซ่อน</option></select></label><button class="mini-btn">ค้นหาเอกสารในปี ${ui.year}</button></form>
        <div class="table-scroll"><table class="starter-table"><thead><tr><th>เอกสาร / รุ่น</th><th>ขอบเขต</th><th>ประเภท</th><th>กำหนดเวลา</th><th>แดชบอร์ด</th><th>จัดการ</th></tr></thead><tbody>${docs.map(item => `<tr><td><strong>${esc(item.title)}</strong><small style="display:block;color:#718198">${esc(item.number)} · รุ่น ${item.version||1} · แก้ไข ${esc(item.updatedAt||'—')}</small>${item.versions?.length?`<details class="doc-version-history"><summary>ประวัติ ${item.versions.length} รุ่นก่อนหน้า</summary>${item.versions.map(version=>`<div class="doc-version-row"><span>รุ่น ${version.version||1} · ${esc(version.updatedAt||'—')} · ${esc(version.fileName||'ไม่มีไฟล์')}</span>${version.blobId?`<button class="mini-btn" type="button" data-open-file="${esc(version.blobId)}">เปิดรุ่นเก่า</button>`:''}</div>`).join('')}</details>`:''}</td><td>${item.scope === 'central' ? 'ส่วนกลาง' : esc(db.projects.find(project=>project.id===item.projectId)?.name || 'โครงการที่ถูกลบ')}</td><td>${esc(item.category)}</td><td><span class="doc-status ${documentStatus(item)==='หมดอายุ'?'expired':documentStatus(item)==='รอมีผล'?'upcoming':'current'}">${documentStatus(item)}</span><small style="display:block;color:#718198">${item.effectiveDate?`เริ่ม ${esc(item.effectiveDate)}`:'ไม่กำหนดวันเริ่ม'}${item.expiryDate?` · ทบทวน ${esc(item.expiryDate)}`:''}</small></td><td>${item.visible ? 'แสดง' : 'ซ่อน'}</td><td class="actions">${item.blobId ? `<button class="mini-btn" data-open-file="${esc(item.blobId)}">เปิดไฟล์</button>` : ''}<button class="mini-btn" data-edit-doc="${item.id}" ${closed?'disabled':''}>แก้ไข</button><button class="mini-btn danger" data-delete-doc="${item.id}" ${closed?'disabled':''}>ลบ</button></td></tr>`).join('') || '<tr><td colspan="6">ไม่พบเอกสารที่ตรงกับตัวกรอง</td></tr>'}</tbody></table></div></section>
      <div class="admin-section-group utility-group"><span>เครื่องมือดูแลระบบ</span><p>จัดการปีงบ สิทธิ์ ประวัติ และไฟล์สำรองเมื่อจำเป็น</p></div>
      <section class="card" id="admin-copy"><div class="starter-section-title"><div><h2>เตรียมปีงบใหม่จากปีก่อน</h2><p>คัดลอกเฉพาะรายการตั้งต้น แล้วตรวจทานก่อนใช้งาน</p></div></div><form id="copy-year-form"><div class="starter-form-grid three"><label>คัดลอกจากปี<select name="sourceYear">${Object.keys(db.budgets).filter(year=>Number(year)!==ui.year).sort((a,b)=>Number(b)-Number(a)).map(year=>`<option value="${year}">${year}</option>`).join('') || '<option value="">ยังไม่มีปีต้นทาง</option>'}</select></label><label>เตรียมสำหรับปี<input value="${ui.year}" readonly></label><div class="admin-copy-checks"><label><input type="checkbox" name="copyWeights" checked> ค่าน้ำหนักขั้นตอน</label><label><input type="checkbox" name="copyProjects" checked> โครงโครงการและผู้รับผิดชอบ</label></div></div><p class="admin-copy-note">โครงการจะเริ่มเป็น “พัก/ร่าง” ด้วยงบ 0 บาท เพื่อให้ตรวจชื่อ ผู้รับผิดชอบ และวงเงินปีใหม่ก่อนเปิดใช้งาน ระบบไม่คัดลอกงบ แผน รายงาน หรือเอกสารแนบจากปีก่อน</p><div class="starter-actions"><button class="btn primary-btn" ${closed?'disabled':''}>เตรียมข้อมูลปี ${ui.year}</button></div></form></section>
      <section class="card" id="admin-access"><div class="starter-section-title"><div><h2>ผู้ดูแลและสิทธิ์เข้าใช้</h2><p>บัญชีผู้ดูแลทดลอง · เฉพาะที่อยู่อีเมล @mahidol.ac.th</p></div><span class="readonly-pill">จำลองการจัดการสิทธิ์</span></div><div class="soft-note warn">รายการนี้เป็นเพียงหน้าจอจำลอง การจำกัดผู้ใช้จริงต้องตั้งค่าโดเมนใน Apps Script และตรวจสิทธิ์ทุกฟังก์ชันฝั่ง .gs</div><form id="admin-user-form"><div class="starter-form-grid two"><label>อีเมลผู้ดูแลใหม่<input name="email" type="email" required placeholder="name@mahidol.ac.th"></label><label>บทบาท<select name="role"><option>ผู้ดูแลระบบ</option><option>ผู้ดูแลเอกสาร</option></select></label></div><div class="starter-actions"><button class="btn primary-btn">เพิ่มผู้ดูแล</button></div></form><div class="table-scroll"><table class="starter-table"><thead><tr><th>อีเมล</th><th>บทบาท</th><th>เพิ่มเมื่อ</th><th>เพิ่มโดย</th><th>จัดการ</th></tr></thead><tbody>${db.admins.map(item=>`<tr><td>${esc(item.email)} ${item.isPrimary?'<span class="current-year-tag">ผู้ดูแลหลัก</span>':''}</td><td>${esc(item.role||'ผู้ดูแลระบบ')}</td><td>${esc(item.addedAt||'—')}</td><td>${esc(item.addedBy||'—')}</td><td>${item.isPrimary?'<span class="muted">บัญชีหลัก ลบไม่ได้</span>':`<button class="mini-btn danger" data-remove-admin="${esc(item.email)}">ปิดสิทธิ์</button>`}</td></tr>`).join('')}</tbody></table></div></section>
      <section class="card" id="admin-history"><div class="starter-section-title"><div><h2>ประวัติการจัดการ</h2><p>รายการใหม่อยู่ด้านบน · ดูย้อนหลังได้โดยเลื่อนภายในกรอบ</p></div></div><p class="admin-history-note">${db.history.length} รายการล่าสุด · เว็บจำลองเก็บสูงสุด 100 รายการ · รายการที่มีค่าเปลี่ยนแปลงกดดูรายละเอียดได้</p><div class="file-list admin-history-list" role="region" aria-label="รายการประวัติการจัดการ" tabindex="0">${db.history.map(item => `<div class="file-item"><div><strong>${esc(item.section)} · ${esc(item.action)}</strong><small>${esc(item.detail)}</small>${item.before!==undefined||item.after!==undefined?`<details class="audit-change"><summary>ดูค่าก่อนและหลัง</summary><div class="audit-change-grid"><div><strong>ก่อน</strong><pre>${esc(item.before==null?'ไม่มีข้อมูล':JSON.stringify(item.before,null,2))}</pre></div><div><strong>หลัง</strong><pre>${esc(item.after==null?'ไม่มีข้อมูล':JSON.stringify(item.after,null,2))}</pre></div></div></details>`:''}</div><small>${esc(item.at)}</small></div>`).join('') || emptyBox('ยังไม่มีประวัติ', 'เมื่อเริ่มบันทึกจะแสดงที่นี่')}</div></section>
      <section class="card" id="admin-year"><div class="starter-section-title"><div><h2>ปิดงวดและเปิดปีงบ</h2><p>เมื่อปิดปี ระบบทดลองจะป้องกันการบันทึกแก้ไขของปีนั้นจนกว่าจะเปิดกลับ</p></div><span class="${closed?'year-closed-tag':'current-year-tag'}">${closed?'ปิดปีแล้ว':'ปีเปิดให้แก้ไข'}</span></div>${closed?`<p class="admin-lock-reason">ปิดเมื่อ ${esc(db.yearStatus[ui.year].updatedAt||'—')} · เหตุผล: ${esc(db.yearStatus[ui.year].reason||'—')}</p>`:''}<div class="year-close-checks"><h3>ตรวจข้อมูลก่อนปิดปี</h3>${closeReadiness.checks.map(check=>`<div class="year-close-check ${check.ready?'is-ready':check.blocker?'is-blocked':'is-warning'}"><span>${check.ready?'✓':check.blocker?'!':'•'}</span><strong>${esc(check.label)}</strong><small>${esc(check.detail)}</small></div>`).join('')}</div>${closeReadiness.blockers.length?`<p class="soft-note warn">ยังปิดปีไม่ได้ · แก้รายการที่เป็นข้อขัดข้องก่อน</p>`:closeReadiness.warnings.length?`<p class="soft-note warn">ยังมี ${closeReadiness.warnings.length} รายการที่ควรตรวจสอบ ระบบจะให้ยืนยันอีกครั้งก่อนปิดปี</p>`:''}<form id="year-status-form"><label>เหตุผลในการ${closed?'เปิด':'ปิด'}ปี<input name="reason" required placeholder="เช่น สรุปผลและตรวจสอบเอกสารครบแล้ว"></label>${!closed&&closeReadiness.warnings.length?`<label class="year-close-ack"><input type="checkbox" name="acknowledgeWarnings" required> ฉันตรวจรายการเตือนแล้ว และต้องการปิดปีต่อ</label>`:''}<div class="starter-actions"><button class="btn ${closed?'primary-btn':'danger-btn'}" ${!closed&&closeReadiness.blockers.length?'disabled':''}>${closed?'เปิดปีงบเพื่อแก้ไข':'ปิดปีงบและล็อกการแก้ไข'}</button></div></form></section>
      <section class="card" id="admin-trash"><div class="starter-section-title"><div><h2>ถังพัก · กู้คืนรายการที่ลบ</h2><p>รายการที่ลบจะพักไว้ก่อน พร้อมไฟล์แนบ เพื่อให้กู้คืนได้หากลบผิด</p></div><span class="current-year-tag">${db.trash.length} รายการ</span></div><div class="file-list admin-trash-list" role="region" aria-label="รายการในถังพัก" tabindex="0">${db.trash.map(item=>`<div class="file-item"><div><strong>${esc(item.type)} · ${esc(item.label)}</strong><small>ย้ายเข้าถังพัก ${esc(item.deletedAt)} · โดย ${esc(item.deletedBy||'ผู้ใช้ทดลอง')}</small></div><button type="button" class="mini-btn" data-restore-trash="${item.id}">กู้คืน</button></div>`).join('')||emptyBox('ถังพักว่าง', 'รายการที่ย้ายมาพักไว้จะปรากฏที่นี่')}</div></section>
      <section class="card" id="admin-backup"><div class="starter-section-title"><div><h2>สำรองและกู้คืนข้อมูล</h2><p>ส่งออกข้อมูลทดลองพร้อมไฟล์แนบ หรือกู้คืนจากไฟล์สำรอง</p></div></div><p class="admin-copy-note">ไฟล์สำรองมีข้อมูลโครงการ เอกสาร ประวัติ และไฟล์แนบ โปรดเก็บในที่ปลอดภัย · ข้อมูลยังอยู่ในเบราว์เซอร์เครื่องนี้</p><div class="starter-actions"><button class="btn primary-btn" type="button" data-backup-export>ดาวน์โหลดข้อมูลสำรอง</button><button class="btn quiet-btn" type="button" data-backup-choose>เลือกไฟล์เพื่อกู้คืน</button><input id="admin-restore-file" type="file" accept=".json,application/json" hidden></div></section>
      <section class="card" id="admin-reset"><div class="starter-section-title"><div><h2>เริ่มใหม่อีกครั้ง</h2><p>ลบข้อมูลทดลองทั้งหมดในเบราว์เซอร์นี้ รวมถึงไฟล์ที่อัปโหลดไว้ในพื้นที่ทดลอง</p></div></div><p class="admin-reset-note">ระบบจะถามยืนยัน และให้พิมพ์คำว่า “ล้างข้อมูล” ก่อนลบจริง</p><div class="starter-actions"><button class="btn quiet-btn" id="reset-sandbox">ล้างข้อมูลทดลองทั้งหมด</button></div></section>`;
  }

  function renderPlan() {
    const project = selectedProject();
    if (!project) return `${heading('ขั้นตอนต่อไป', 'วางแผนโครงการ', 'เมื่อแอดมินเพิ่มโครงการแล้ว คุณจะกำหนดแผนรายเดือนได้')}${controls(true)}${emptyBox('ยังไม่มีโครงการในปีนี้', 'กรุณาตั้งงบ หน่วยงาน และเพิ่มโครงการก่อนจึงจะบันทึกแผนได้', 'admin', 'ไปหน้าแอดมิน')}<section class="card sdg-demo-preview"><h2>ทดลองตัวช่วยแนะนำ SDG</h2><p class="muted">ทดลองด้วยข้อความตัวอย่างได้ · ระบบจะไม่บันทึก แต่เมื่อกดปุ่มหลังยินยอม จะส่งเฉพาะ 4 ช่องไป Google Gemini</p><div id="sdg-demo-fields" class="starter-form-grid two"><label>วัตถุประสงค์<textarea name="demoObjective">ลดปริมาณขยะอาหารจากโรงอาหาร</textarea></label><label>ผลที่คาดว่าจะได้รับ<textarea name="demoOutcome">ร้านค้าและผู้ใช้บริการลดอาหารเหลือทิ้ง</textarea></label><label>ตัวชี้วัด<input name="demoIndicator" value="ปริมาณขยะอาหารที่เกิดขึ้นต่อวัน"></label><label>เป้าหมาย<input name="demoTarget" value="ลดลงเหลือไม่เกิน 20 กิโลกรัมต่อวัน ภายใน ก.ย. 2569"></label></div><label class="sdg-ai-consent"><input id="sdg-demo-consent" type="checkbox"> อนุญาตส่งเฉพาะวัตถุประสงค์ ผลที่คาด ตัวชี้วัด และเป้าหมายตัวอย่างไปยัง Google Gemini</label><small class="sdg-ai-disclaimer">ไม่ส่งงบ อีเมล หรือไฟล์แนบ · Google จัดการข้อมูลตามแผน API ที่ใช้ (โควตาฟรีอาจใช้ข้อมูลปรับปรุงบริการ) · <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener">นโยบายข้อมูล</a> · กรุณาตรวจผลก่อนใช้</small><button type="button" class="mini-btn" data-sdg-suggest-demo>ลองแนะนำ SDG จากตัวอย่างนี้</button><div id="sdg-demo-results" hidden></div></section>`;
    const saved = getPlan(project.id);
    const draftSaved = db.planDrafts[project.id] || null;
    const base = { months: yearMonths(ui.year).map(key => ({ key })), sdgs: [], sdgRationales: {}, procurementItems: [], noProcurement: false, objective: '', expectedOutcome: '', indicator: '', indicatorBaseline: '', target: '', indicatorUnit: '', evidenceSource: '', unusedBudgetReason: '' };
    const plan = ui.planDraft?.projectId === project.id ? ui.planDraft : draftSaved || saved || base;
    const selectedSdgs = Array.isArray(plan.sdgs) ? plan.sdgs : String(plan.sdgs||'').split(',').map(item=>item.trim()).filter(Boolean);
    const procurementItems = plan.procurementItems || [];
    const totals = Object.fromEntries(stages.map(([key]) => [key, plan.months.reduce((sum, row) => sum + safeNum(row[key]), 0)]));
    const allProcure = procurementItems.reduce((sum,item)=>sum+safeNum(item.amount),0);
    const plannedProcurement = procurementItems.filter(item => !item.type || item.type === 'procurement').reduce((sum,item)=>sum+safeNum(item.amount),0);
    const progressComplete = Boolean(String(plan.objective||'').trim() && selectedSdgs.length && String(plan.indicator||'').trim() && String(plan.target||'').trim());
    const scheduleComplete = Boolean(plan.baselineStart && plan.baselineEnd && plan.baselineEnd >= plan.baselineStart && plan.months.length);
    const budgetComplete = (plan.noProcurement || totals.procure>0 || allProcure>0) && totals.procure <= safeNum(project.budget) && allProcure <= safeNum(project.budget);
    const badge = draftSaved ? `<span class="status-pill status-pending">มีร่าง · ${esc(draftSaved.savedAt)}</span>` : saved ? `<span class="status-pill saved">บันทึกแผนแล้ว · ${esc(saved.savedAt)}</span>` : `<span class="status-pill">ยังไม่เริ่มวางแผน</span>`;
    return `${heading('ขั้นตอนที่ 1 ของโครงการ', 'วางแผนโครงการ', 'กรอกเป้าหมายก่อน จากนั้นวางช่วงเวลาและงบรายเดือน · บันทึกร่างแล้วกลับมาทำต่อได้', badge)}${controls(true)}
      <div class="plan-project-summary"><div><span>งบโครงการจากผู้ดูแลระบบ</span><strong>${money(project.budget)} บาท</strong><small>${esc(project.name)}</small></div><div class="plan-completion"><span>ส่วนที่กรอกแล้ว</span><strong>${[progressComplete,scheduleComplete,budgetComplete].filter(Boolean).length} / 3 ส่วน</strong><small>บันทึกร่างได้ทุกเวลา</small></div></div>
      <div class="plan-step-nav"><a href="#plan-goal">01 เป้าหมายและ SDG</a><a href="#plan-schedule">02 ช่วงเวลาและแผนรายเดือน</a><a href="#plan-budget">03 งบและค่าใช้จ่าย</a></div>
      ${draftSaved?`<div class="report-cycle-banner is-draft"><div><strong>มีร่างแผนที่บันทึกไว้</strong><span>บันทึกล่าสุด ${esc(draftSaved.savedAt)} · กรอกต่อได้จากช่องด้านล่าง</span></div><span class="readonly-pill">ยังไม่ใช่แผนที่ยืนยันแล้ว</span></div>`:''}
      <form id="plan-form"><section class="card plan-section" id="plan-goal"><div class="starter-section-title"><div><span class="plan-step-tag">ส่วนที่ 1 · เริ่มจากเหตุผลของโครงการ</span><h2>วัตถุประสงค์ ผลลัพธ์ และ SDG</h2><p>ระบุเป้าหมายหลัก 1 ข้อก่อน · เลือก SDG ที่เกี่ยวข้องได้หลายข้อ</p></div><span class="plan-section-state ${progressComplete?'complete':''}">${progressComplete?'ครบแล้ว':'ยังไม่ครบ'}</span></div><div class="plan-goal-flow"><label>01 · วัตถุประสงค์โครงการ *<textarea name="objective" required placeholder="โครงการนี้ทำขึ้นเพื่ออะไร">${esc(plan.objective)}</textarea><small>ตัวอย่าง: ลดปริมาณขยะอาหารจากโรงอาหาร</small></label><label>02 · ผลที่คาดว่าจะได้รับ <span class="muted">(ไม่บังคับ)</span><textarea name="expectedOutcome" placeholder="เมื่อทำโครงการแล้ว อยากเห็นการเปลี่ยนแปลงอะไร">${esc(plan.expectedOutcome)}</textarea><small>ตัวอย่าง: ร้านค้าและผู้ใช้บริการมีพฤติกรรมลดอาหารเหลือทิ้ง</small></label><label>03 · ตัวชี้วัดหลัก *<input name="indicator" required value="${esc(plan.indicator)}" placeholder="จะวัดผลสำเร็จจากอะไร"><small>ตัวอย่าง: ปริมาณขยะอาหารที่เกิดขึ้นต่อวัน</small></label><div class="goal-target-row"><label>04 · เป้าหมาย *<input name="target" required value="${esc(plan.target)}" placeholder="ระบุค่า หน่วย และช่วงเวลาที่ต้องการ"><small>ตัวอย่าง: ลดลงเหลือไม่เกิน 20 กิโลกรัมต่อวัน ภายใน ก.ย. 2569</small></label></div><details class="plan-optional-details"><summary>รายละเอียดตัวชี้วัดเพิ่มเติม <span>(ไม่บังคับ)</span></summary><div class="starter-form-grid two"><label>ค่าเริ่มต้น <span class="muted">(ไม่ทราบเว้นว่างได้)</span><input name="indicatorBaseline" value="${esc(plan.indicatorBaseline)}" placeholder="เช่น 100 กิโลกรัมต่อวัน"></label><label>แหล่งข้อมูลที่ใช้วัด<input name="evidenceSource" value="${esc(plan.evidenceSource)}" placeholder="เช่น แบบชั่งน้ำหนักขยะรายวัน"></label></div></details></div><section class="sdg-ai-assistant"><div class="sdg-ai-copy"><strong>ยังไม่แน่ใจว่าโครงการเกี่ยวข้องกับ SDG ข้อใด?</strong><small>ให้ตัวช่วยอ่านเป้าหมายและตัวชี้วัด แล้วเสนอข้อที่น่าพิจารณา</small></div><button type="button" class="mini-btn" data-sdg-suggest>ช่วยแนะนำ SDG</button><label class="sdg-ai-consent"><input id="sdg-ai-consent" type="checkbox"> อนุญาตส่งเฉพาะวัตถุประสงค์ ผลที่คาด ตัวชี้วัด และเป้าหมายไปยัง Google Gemini เพื่อวิเคราะห์ SDG</label><small class="sdg-ai-disclaimer">เว็บจำลองไม่เก็บคำขอ · ไม่ส่งงบ อีเมล หรือไฟล์แนบ · Google จัดการข้อมูลตามแผน API ที่ใช้ (โควตาฟรีอาจใช้ข้อมูลปรับปรุงบริการ) · <a href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener">นโยบายข้อมูล</a> · ตรวจผลก่อนเลือก</small><div id="sdg-ai-results" hidden></div></section><div class="sdg-picker-heading"><strong>เลือก SDG ที่เกี่ยวข้อง *</strong><small>เลือกเฉพาะเป้าหมายที่เชื่อมกับโครงการโดยตรง · เมื่อเลือกแล้วจะมีช่องให้อธิบายสั้น ๆ</small></div><div class="sdg-picker-grid">${sdgOptions.map(([id,name])=>{const checked=selectedSdgs.includes(id);return `<label class="sdg-option ${checked?'selected':''}"><input type="checkbox" name="sdgs" value="${id}" data-sdg-select ${checked?'checked':''}><span><b>${id}</b><small>${name}</small></span></label>`}).join('')}</div><div class="sdg-rationale-list">${sdgOptions.map(([id,name])=>`<label class="sdg-rationale-row" data-sdg-rationale-row="${id}" ${selectedSdgs.includes(id)?'':'hidden'}><span>${id} · ${name}</span><input name="sdgRationale_${id.replace(' ','_')}" data-sdg-rationale="${id}" value="${esc(plan.sdgRationales?.[id]||'')}" placeholder="โครงการสนับสนุนเป้าหมายนี้อย่างไร"></label>`).join('')}</div></section>
      <section class="card table-card plan-section" id="plan-schedule"><div class="starter-section-title" style="padding:18px 20px 0"><div><span class="plan-step-tag">ส่วนที่ 2 · วางแผนตามช่วงเวลาจริง</span><h2>ช่วงเวลาและแผนความก้าวหน้ารายเดือน</h2><p>เปอร์เซ็นต์รวมไม่เกิน 100% · ถ้าโครงการข้ามปี วางต่อเนื่องได้โดยไม่ต้องครบในปีเดียว</p></div><span class="plan-section-state ${scheduleComplete?'complete':''}">${scheduleComplete?'มีช่วงเวลา':'ตั้งช่วงเวลา'}</span></div><div class="starter-form-grid two plan-dates"><label>เดือนเริ่มโครงการ<input name="baselineStart" type="month" value="${esc(plan.baselineStart || plan.months[0]?.key)}"></label><label>เดือนคาดว่าจะเสร็จ<input name="baselineEnd" type="month" value="${esc(plan.baselineEnd || plan.months.at(-1)?.key)}"></label></div><div class="starter-actions" style="padding:0 20px 10px"><button type="button" class="mini-btn" data-align-months>ปรับตารางตามช่วงเวลานี้</button><button type="button" class="mini-btn" data-plan-add="before">+ เดือนก่อนหน้า</button><button type="button" class="mini-btn" data-plan-add="after">+ เดือนถัดไป</button><span class="legend-money">สีฟ้า = จำนวนเงิน (บาท)</span></div><div class="table-scroll"><table class="period-table"><thead><tr><th>เดือน/ปี</th>${stages.map(([key,label])=>`<th class="${key==='procure'?'money-cell':''}">${label}</th>`).join('')}</tr></thead><tbody>${plan.months.map(row => `<tr data-month="${row.key}"><th>${monthLabel(row.key)}</th>${stages.map(([key]) => `<td class="${key==='procure'?'money-cell':'percent-cell'}"><input data-stage="${key}" ${key==='procure'?'type="text" inputmode="decimal" data-money':'type="number" min="0" max="100" step="0.1"'} value="${key==='procure'?esc(formatMoneyInput(row[key])):row[key] ?? ''}" aria-label="${esc(stages.find(item=>item[0]===key)?.[1])} ${monthLabel(row.key)}"></td>`).join('')}</tr>`).join('')}</tbody><tfoot><tr><th>รวมตามแผน</th>${stages.map(([key])=>`<td id="plan-total-${key}" class="${key==='procure'?'money-cell':''}">${money(totals[key])}${key==='procure'?' บาท':'%'}</td>`).join('')}</tr></tfoot></table></div></section>
      <section class="card plan-section" id="plan-budget"><div class="starter-section-title"><div><span class="plan-step-tag">ส่วนที่ 3 · เช็กงบก่อนยืนยันแผน</span><h2>งบประมาณและรายการค่าใช้จ่าย</h2><p>เพิ่มรายการตามแผนทั้งงานพัสดุ เงินยืมกองคลัง และค่าใช้จ่ายอื่น · ระบบรวมวงเงินให้</p></div><span class="plan-section-state ${budgetComplete?'complete':''}">${budgetComplete?'ไม่เกินวงเงิน':'ตรวจวงเงิน'}</span></div><div class="report-budget-overview"><div><span>งบโครงการ</span><strong>${money(project.budget)} บาท</strong></div><div><span>แผนจัดซื้อรายเดือน</span><strong id="plan-procure-total">${money(totals.procure)} บาท</strong></div><div><span>รายการค่าใช้จ่ายที่ระบุ</span><strong id="plan-items-total">${money(allProcure)} บาท</strong></div><div><span>งบเหลือจากรายการที่ระบุ</span><strong id="plan-procure-remaining">${money(safeNum(project.budget)-allProcure)} บาท</strong></div></div><p class="muted">กำหนดประเภทให้แต่ละรายการ เพื่อให้หน้ารายงานแสดงช่องตรวจรับหรือวางฎีกาเฉพาะกรณีที่เกี่ยวข้อง</p><label class="procurement-none"><input type="checkbox" name="noProcurement" ${plan.noProcurement?'checked':''}> โครงการนี้ไม่มีรายการจัดซื้อ/จ้างผ่านพัสดุ</label><div class="procurement-list" id="plan-procurement-list">${procurementItems.map((item,index)=>`<div class="procurement-row expense-plan-row" data-procurement-row><span class="procurement-index">${index+1}</span><label>รายการค่าใช้จ่าย<input data-proc-name value="${esc(item.name)}" placeholder="เช่น ค่าพิมพ์รายงาน หรือค่าวิทยากร"></label><label>ประเภท<select data-proc-type><option value="procurement" ${!item.type||item.type==='procurement'?'selected':''}>จัดซื้อ/จ้างผ่านพัสดุ</option><option value="advance" ${item.type==='advance'?'selected':''}>เงินยืมกองคลัง</option><option value="other" ${item.type==='other'?'selected':''}>ค่าใช้จ่ายอื่น / จ่ายตรง</option></select></label><label>วงเงินตามแผน (บาท)<input data-proc-amount type="text" inputmode="decimal" data-money value="${esc(formatMoneyInput(item.amount))}" placeholder="0"></label><button type="button" class="mini-btn danger" data-procurement-remove="${index}" aria-label="ลบรายการ ${index+1}">ลบ</button></div>`).join('')||'<div class="muted procurement-empty">ยังไม่มีรายการ · เพิ่มค่าใช้จ่ายที่วางแผนไว้สำหรับโครงการ</div>'}</div><button type="button" class="mini-btn" data-procurement-add>+ เพิ่มรายการค่าใช้จ่าย</button><label class="budget-reason-field">เหตุผลกรณียังไม่วางแผนใช้วงเงินส่วนที่เหลือ <span class="muted">(ไม่บังคับ)</span><textarea name="unusedBudgetReason" placeholder="เช่น รอใบเสนอราคา หรือกันวงเงินไว้สำหรับกิจกรรมปลายปี">${esc(plan.unusedBudgetReason)}</textarea></label></section>
      <section class="card plan-save-card"><div id="plan-validation" class="soft-note">${totals.procure>safeNum(project.budget)?'แผนจัดซื้อรายเดือนเกินงบโครงการ':`จัดซื้อรายเดือน ${money(totals.procure)} บาท · วงเงินโครงการ ${money(project.budget)} บาท · กรอกแผนบางส่วนแล้วบันทึกร่างได้`}</div><div class="starter-actions"><button type="button" class="btn quiet-btn" data-save-plan-draft>บันทึกร่างและกลับมาทำต่อ</button><button class="btn primary-btn">ยืนยันและบันทึกแผน</button></div><small class="muted">บันทึกร่างยังไม่ถือเป็นแผนยืนยัน และจะไม่ถูกใช้คำนวณรายงานจนกว่าจะกดยืนยัน</small></div></section></form>`;
  }

  function renderReport() {
    const project = selectedProject();
    if (!project) return `${heading('ขั้นตอนที่ 2', 'บันทึกผลรายเดือน', 'เริ่มได้หลังเพิ่มโครงการ')}${controls(true,true)}${emptyBox('ยังไม่มีโครงการ', 'แอดมินต้องเพิ่มโครงการก่อน', 'admin', 'ไปหน้าแอดมิน')}<section class="card report-example-entry"><div><strong>อยากดูหน้ากรอกและรายงานตัวอย่างก่อนหรือไม่?</strong><p class="muted">เปิดดูตัวอย่างได้โดยไม่เพิ่มข้อมูลลงในเว็บจำลอง</p></div><button type="button" class="btn primary-btn" data-open-report-example>ดูตัวอย่างรายงานรายเดือน</button></section>`;
    const plan = getPlan(project.id);
    if (!plan) return `${heading('ขั้นตอนที่ 2', 'บันทึกผลรายเดือน', 'กำหนดแผนโครงการก่อนเพื่อให้เปรียบเทียบผลจริงได้')}${controls(true,true)}${emptyBox('โครงการนี้ยังไม่มีแผน', 'กรุณาบันทึกแผนรายเดือนก่อน', 'plan', 'ไปวางแผน')}`;
    const report = getReport(project.id, ui.month);
    const reportDraft = getReportDraft(project.id,ui.month);
    const formData = reportDraft || report;
    const prior = projectReports(project.id).filter(item => item.month < ui.month).at(-1);
    const phase = formData?.phases || prior?.phases || {};
    const planValue = plannedAt(project.id, ui.month);
    const priorPaid = db.reports.filter(item=>item.projectId===project.id&&item.month<ui.month).reduce((sum,item)=>sum+paid(item),0);
    const monthPaid = formData ? paid(formData) : 0;
    const remainingAfterReport = safeNum(project.budget) - priorPaid - monthPaid;
    const plannedProcurementItems=planExpenseItems(plan);
    const expenseValues=readExpenseDetails({get:()=>null,has:()=>false},plan,formData);
    const previousExpenseTotals=plannedProcurementItems.map((_,index)=>projectReports(project.id).filter(item=>item.month<ui.month).reduce((sum,item)=>sum+safeNum(readExpenseDetails({get:()=>null,has:()=>false},plan,item).amounts[index]),0));
    const expenseRows=plannedProcurementItems.map((item,index)=>{
      const amount=expenseValues.amounts[index]||0,received=expenseValues.received[index],cleared=expenseValues.treasuryCleared[index];
      const evidence=(report?.attachments||[]).filter(file=>file.expenseIndex===index);
      const process=item.type==='procurement'?`<label class="report-expense-check"><input type="checkbox" name="expenseItemReceived${index}" ${received?'checked':''}> ตรวจรับแล้ว</label><small class="report-expense-help">ทำเครื่องหมายเมื่อพัสดุดำเนินการเสร็จ บริษัทส่งมอบของครบถ้วนถูกต้อง และได้รับใบตรวจรับแล้ว</small><label class="expense-evidence-upload">แนบใบตรวจรับ (ไม่บังคับ)<input name="expenseItemEvidence${index}" type="file" accept="image/*,.pdf" multiple></label>`
        :item.type==='advance'?`<label class="report-expense-check"><input type="checkbox" name="expenseItemTreasury${index}" ${cleared?'checked':''}> วางฎีกาใช้หนี้เงินยืมแล้ว</label><small class="report-expense-help">ทำเครื่องหมายเมื่อส่งใบสำคัญรับเงินและเอกสารยืนยันการจ่ายให้กองคลังเพื่อใช้หนี้เงินยืมแล้ว</small><label class="expense-evidence-upload">แนบหลักฐานการวางฎีกา (ไม่บังคับ)<input name="expenseItemEvidence${index}" type="file" accept="image/*,.pdf" multiple></label>`
        :`<small class="report-expense-help">รายการนี้ไม่ต้องตรวจรับพัสดุหรือวางฎีกาเงินยืม · แนบหลักฐานการจ่ายได้ตามต้องการ</small><label class="expense-evidence-upload">แนบหลักฐานการจ่าย (ไม่บังคับ)<input name="expenseItemEvidence${index}" type="file" accept="image/*,.pdf" multiple></label>`;
      return `<article class="report-expense-card"><div class="report-expense-heading"><div><small>${expenseTypeNames[item.type]}</small><h3>${esc(item.name||`รายการค่าใช้จ่าย ${index+1}`)}</h3></div><div class="report-expense-budget"><strong>วงเงินตามแผน ${money(item.amount)} บาท</strong><small>จ่ายสะสมก่อนหน้า ${money(previousExpenseTotals[index])} บาท</small></div></div><div class="report-expense-fields"><label>เงินที่จ่ายออกในเดือนนี้ (บาท)<input name="expenseItemPaid${index}" type="text" inputmode="decimal" data-money value="${esc(formatMoneyInput(amount))}" aria-label="ยอดจ่ายเดือนนี้: ${esc(item.name)}" placeholder="0"></label><div class="report-expense-process">${process}${evidence.length?`<small class="saved-expense-evidence">มีหลักฐานบันทึกแล้ว ${evidence.length} ไฟล์</small>`:''}</div></div></article>`;
    }).join('');
    const planProcurementThroughMonth = (plan.months || []).filter(row => row.key <= ui.month).reduce((sum, row) => sum + safeNum(row.procure), 0);
    const processRows = reportProcess.map((stage, index) => {
      if (stage.key === 'procure') return `<article class="report-phase-card report-phase-money"><div><span class="report-phase-number">${index + 1}</span><div><h3>${stage.name}</h3><p>ติดตามยอดเงินในช่วงงบประมาณ</p></div></div><dl><div><dt>แผนสะสม</dt><dd>${money(planProcurementThroughMonth)} บาท</dd></div><div><dt>จ่ายสะสมก่อนเดือนนี้</dt><dd>${money(priorPaid)} บาท</dd></div><div><dt>จ่ายสะสมถึงเดือนนี้</dt><dd data-report-stage-current-paid>${money(priorPaid + monthPaid)} บาท</dd></div></dl></article>`;
      const planned = Math.min(100, (plan.months || []).filter(row => row.key <= ui.month).reduce((sum, row) => sum + safeNum(row[stage.key]), 0));
      const previous = safeNum(prior?.phases?.[stage.key]);
      const label = stages.find(item => item[0] === stage.key)?.[1] || stage.name;
      return `<article class="report-phase-card"><div><span class="report-phase-number">${index + 1}</span><div><h3>${stage.name}</h3><p>แผนสะสม ${planned.toFixed(1)}% · ผลก่อนเดือนนี้ ${previous.toFixed(1)}%</p></div></div><label class="report-phase-entry">ผลสะสมถึงเดือนนี้<input name="${stage.key}" type="number" min="0" max="100" step="0.1" value="${phase[stage.key] ?? ''}" aria-label="${esc(label)} · ผลสะสมถึงเดือนนี้"><span>%</span></label></article>`;
    }).join('');
    const history = projectReports(project.id).map(item => `<div class="file-item"><div><strong>${monthLabel(item.month)} · ฉบับ ${item.version}</strong><small>บันทึกล่าสุด ${esc(item.updatedAt)} · ${money(paid(item))} บาท</small></div><button class="mini-btn" data-open-report="${item.id}">เปิดรายงาน</button></div>`).join('');
    return `${heading('ขั้นตอนที่ 2 ของโครงการ', 'บันทึกผลรายเดือน', 'กรอกผลสะสม เงินจ่ายจริง สรุปกิจกรรม และหลักฐาน · บันทึกร่างได้ก่อนส่ง', `<span class="status-pill ${reportDraft?'status-pending':report?'saved':''}">${reportDraft?`มีร่าง · ยังไม่ส่ง${report?' (รายงานเดิมยังใช้อยู่)':''}`:report?`ส่งแล้ว · ฉบับ ${report.version}`:'ยังไม่มีรายงานเดือนนี้'}</span>`)}${controls(true,true)}
      <div class="report-deadline-note"><strong>กำหนดส่งวันที่ 26 ของเดือน</strong><span>${reportDraft?`ร่างบันทึกเมื่อ ${esc(reportDraft.savedAt)} แต่ยังไม่นับว่าส่งรายงาน`:report?`ส่งรายงานแล้วเมื่อ ${esc(report.updatedAt)}`:'ยังไม่ได้ส่งรายงานรอบนี้'}</span></div>
      <div class="soft-note">แผนสะสมถึง ${monthLabel(ui.month)}: <b>${planValue.toFixed(1)}%</b> · ผลล่าสุดก่อนเดือนนี้: <b>${prior ? `${progress(prior.phases).toFixed(1)}%` : 'ยังไม่มี'}</b> · ${report?'การแก้รายงานเดิมจะสร้างร่างก่อน จนกว่าจะกดส่งฉบับแก้ไข':'ข้อมูลที่บันทึกร่างจะไม่ถูกนับเป็นรายงานที่ส่งแล้ว'}</div>
      <form id="report-form" novalidate data-prior-paid="${priorPaid}" data-project-budget="${safeNum(project.budget)}"><div class="report-wizard"><nav class="report-step-nav report-step-nav-four report-step-sidebar" aria-label="ขั้นตอนรายงานรายเดือน"><button type="button" data-report-step="1"><b>1</b><span>ความก้าวหน้า<small>ผลสะสมตามขั้นตอน</small></span></button><button type="button" data-report-step="2"><b>2</b><span>เงินและหลักฐาน<small>รายการตามแผนและยอดจ่าย</small></span></button><button type="button" data-report-step="3"><b>3</b><span>สรุปผลและไฟล์<small>กิจกรรมและเอกสารแนบ</small></span></button><button type="button" data-report-step="4"><b>4</b><span>ตรวจทาน<small>ยืนยันข้อมูลก่อนส่ง</small></span></button></nav><div class="report-wizard-main"><section class="card report-entry-step" id="report-progress" data-report-panel="1"><div class="report-step-title"><small>ขั้นที่ 1 จาก 4</small><h2>ความก้าวหน้าของงาน</h2><p class="muted">กรอกผลสะสมถึงสิ้นเดือนนี้ ระบบแสดงผลสะสมก่อนหน้าให้เทียบ</p></div><div class="report-phase-grid">${processRows}</div><div class="report-weight-note">เปอร์เซ็นต์ความก้าวหน้าคำนวณตามค่าน้ำหนักของโครงการ · การจัดซื้อ/จ้างแสดงยอดเงินจริงในขั้นถัดไป</div><div class="soft-note" id="report-live-progress">ผลสะสม ${progress(phase).toFixed(1)}% · แผนสะสม ${planValue.toFixed(1)}%</div></section>
      <section class="card report-entry-step" id="report-expenses" data-report-panel="2"><div class="report-step-title"><small>ขั้นที่ 2 จาก 4</small><h2>เงินที่จ่ายออกจากโครงการ</h2><p class="muted">รายการจัดซื้อ/จ้างดึงจากแผนที่ยืนยันแล้ว · ระบุสถานะและยอดจ่ายจริงของเดือนนี้</p></div><div class="report-budget-overview"><div><span>งบโครงการ</span><strong>${money(project.budget)} บาท</strong></div><div><span>จ่ายสะสมก่อนเดือนนี้</span><strong>${money(priorPaid)} บาท</strong></div><div><span>จ่ายสะสมถึงเดือนนี้</span><strong id="report-paid-total">${money(priorPaid+monthPaid)} บาท</strong></div><div><span>งบคงเหลือโดยประมาณ</span><strong id="report-budget-remaining">${money(remainingAfterReport)} บาท</strong></div></div><div class="report-expense-list">${expenseRows || '<div class="soft-note">ยังไม่มีรายการค่าใช้จ่ายในแผน · เพิ่มรายการพัสดุ เงินยืมกองคลัง หรือค่าใช้จ่ายอื่นที่หน้าวางแผนโครงการ</div>'}</div><p class="report-definition-note">ยอดจ่ายจะรวมตามรายการค่าใช้จ่ายที่วางแผนไว้ · ตรวจรับใช้เฉพาะรายการผ่านพัสดุ · วางฎีกาใช้หนี้ใช้เฉพาะรายการเงินยืมกองคลัง</p></section>
      <section class="card report-entry-step" id="report-summary" data-report-panel="3"><div class="report-step-title"><small>ขั้นที่ 3 จาก 4</small><h2>สรุปผลและไฟล์ประกอบ</h2><p class="muted">สรุปสิ่งที่ทำ ผลที่ได้ และเรื่องที่ต้องติดตาม · เพิ่มภาพหรือ PDF ได้</p></div><div class="starter-form-grid two"><label class="wide">สรุปผลการดำเนินงานประจำเดือน *<textarea name="summaryText" placeholder="เดือนนี้ทำอะไร ได้ผลอย่างไร มีเรื่องใดต้องติดตาม">${esc(formData?.summaryText)}</textarea></label><label class="wide">สาเหตุล่าช้าและแนวทางแก้ไข<textarea name="delay" placeholder="กรอกเมื่อผลต่ำกว่าแผน หรือคาดว่าจะขยายเวลา">${esc(formData?.delay)}</textarea></label><label>คาดว่าจะเสร็จเดือนใด<input name="forecastMonth" type="month" value="${esc(formData?.forecastMonth || plan.baselineEnd)}"></label><label>ผลลัพธ์ตาม SDG<input name="sdgOutcome" value="${esc(formData?.sdgOutcome)}" placeholder="อธิบายผลที่เกิดขึ้นจริง"></label>${plan.indicator?`<label>ผลตัวชี้วัดหลัก: ${esc(plan.indicator)}<input name="indicatorActual" value="${esc(formData?.indicatorActual)}" placeholder="เช่น 24 กิโลกรัมต่อวัน"></label>`:''}</div><section class="report-evidence-panel" id="report-evidence"><h3>ภาพกิจกรรมและเอกสารหลักฐาน</h3><p class="muted">แนบรูปภาพหรือ PDF ของเดือนนี้ · เพิ่มภาพได้สูงสุด 10 ภาพต่อเดือน</p><div class="soft-note">บันทึกร่างจะเก็บข้อความและตัวเลขไว้ก่อน · ไฟล์แนบจะบันทึกเมื่อกดส่งรายงาน</div><label class="evidence-upload">เพิ่มรูปภาพหรือ PDF<input name="attachments" type="file" accept="image/*,.pdf" multiple></label><div class="soft-note">${report?.attachments?.length ? `ไฟล์ที่บันทึกในเดือนนี้ ${report.attachments.length} รายการ · เปิดดู แทนที่ หรือลบได้` : 'ยังไม่มีไฟล์ของเดือนนี้ · ภาพที่แนบจะให้เลือกภาพเด่นในหน้าสรุปหลังบันทึก'}</div>
        <div class="file-list">${(report?.attachments || []).map(file => `<div class="file-item"><div><strong>${esc(file.name)}</strong><small>เพิ่ม ${esc(file.uploadedAt)}${file.isImage ? ' · รูปภาพ' : ' · เอกสาร'}</small></div><div class="btn-group"><button type="button" class="mini-btn" data-open-file="${file.blobId}">เปิด</button><button type="button" class="mini-btn" data-replace-attachment="${file.id}">แทนที่</button><button type="button" class="mini-btn danger" data-remove-attachment="${file.id}">ลบ</button></div></div>`).join('')}</div><input id="attachment-replacement" type="file" accept="image/*,.pdf" hidden></section></section>
      <section class="card report-entry-step" id="report-review" data-report-panel="4"><div class="report-step-title"><small>ขั้นที่ 4 จาก 4</small><h2>ตรวจทานก่อนบันทึก</h2><p class="muted">ตรวจรอบรายงาน ตัวเลข และสรุปอีกครั้งก่อนส่ง</p></div><div class="starter-kpis"><div><span>ผลสะสม</span><strong data-report-review-actual>${progress(phase).toFixed(1)}%</strong></div><div><span>แผนสะสม</span><strong data-report-review-planned>${planValue.toFixed(1)}%</strong></div><div><span>เงินจ่ายเดือนนี้</span><strong data-report-review-paid>${money(monthPaid)} บาท</strong></div><div><span>ไฟล์ที่เลือก</span><strong data-report-review-files>0 ไฟล์</strong></div></div><div class="soft-note" data-report-review-status>ใกล้เคียงแผน</div><div class="report-review-grid"><div><small>โครงการ</small><strong>${esc(project.name)}</strong></div><div><small>รอบรายงาน</small><strong>${monthLabel(ui.month)}</strong></div><div class="wide"><small>สรุปเดือนนี้</small><p data-report-review-summary>${esc(formData?.summaryText||'ยังไม่ได้กรอกสรุปผล')}</p></div><div class="wide"><small>สาเหตุ/แนวทางแก้ไข</small><p data-report-review-delay>${esc(formData?.delay||'ไม่ต้องระบุ')}</p></div></div></section><section class="report-submit-card report-wizard-footer"><div><strong>${reportDraft?'มีร่างที่ยังไม่ส่ง':report?'รายงานเดิมยังคงใช้งานจนกว่าจะส่งฉบับแก้ไข':'บันทึกร่างได้ก่อน หากยังกรอกไม่ครบ'}</strong><small>ร่างจะไม่ถูกนับในแดชบอร์ด · ไฟล์แนบจะบันทึกเมื่อส่งรายงาน</small></div><div class="starter-actions"><button type="button" class="btn quiet-btn" data-save-report-draft>บันทึกร่างและกลับมาทำต่อ</button><button type="button" class="btn quiet-btn" data-report-prev hidden>← ย้อนกลับ</button><button type="button" class="btn primary-btn" data-report-next>ต่อไป</button><button type="submit" class="btn primary-btn" data-report-submit hidden>${report?'ส่งฉบับแก้ไข':'ส่งรายงานประจำเดือน'}</button></div></section></div></div></form>
      <section class="card"><h2>ประวัติรายงานของโครงการนี้</h2><div class="file-list">${history || emptyBox('ยังไม่มีรายงาน', 'เมื่อบันทึกเดือนแรก รายการจะปรากฏที่นี่')}</div></section>`;
  }

  function renderMonthlyReportExample() {
    const sample=currentMonthlyExample(),actual=exampleProgress(sample.phases),diff=actual-sample.planned;
    const totalPaid=sample.procurementPaid+sample.loanPaid+sample.otherPaid,cumulativePaid=sample.priorPaid+totalPaid;
    const statusClass=diff < -5?'status-bad':'status-good';
    const statusText=diff < -5?`ช้ากว่าแผน ${Math.abs(diff).toFixed(1)} จุด`:diff > 5?`เร็วกว่าแผน ${diff.toFixed(1)} จุด`:'ใกล้เคียงแผน';
    const stepNames=['ความก้าวหน้า','เงินและหลักฐาน','สรุปผลและไฟล์','ตรวจทาน'];
    const scenarioButtons=`<div class="scenario-picker" role="group" aria-label="เลือกสถานการณ์ตัวอย่าง">${Object.entries(monthlyReportExamples).map(([key,item])=>`<button type="button" class="scenario-choice ${ui.exampleScenario===key?'selected':''}" data-example-scenario="${key}" aria-pressed="${ui.exampleScenario===key}"><strong>${esc(item.title)}</strong><small>${esc(item.description)}</small></button>`).join('')}</div>`;
    const nav=`<nav class="report-step-nav report-step-nav-four" aria-label="ขั้นตอนรายงานตัวอย่าง">${stepNames.map((name,index)=>`<button type="button" class="${ui.exampleStep===index+1?'active':''}" data-example-step="${index+1}" aria-current="${ui.exampleStep===index+1?'step':'false'}"><b>${index+1}</b><span>${name}</span></button>`).join('')}</nav>`;
    const processRows=reportProcess.map((stage,index)=>{
      if(stage.key==='procure')return `<tr class="report-process-money"><th>${index+1}. ${stage.name}</th><td>จำนวนเงินสะสม</td><td class="money-cell">${money(sample.procurementPlan)} บาท</td><td class="money-cell">${money(sample.priorPaid)} บาท</td><td class="money-cell"><span data-example-process-spent>${money(cumulativePaid)} บาท</span></td></tr>`;
      return `<tr><th>${index+1}. ${stage.name}</th><td>เปอร์เซ็นต์สะสม</td><td class="percent-cell">${safeNum(sample.plannedPhases[stage.key]).toFixed(1)}%</td><td class="percent-cell">${safeNum(sample.priorPhases[stage.key]).toFixed(1)}%</td><td class="percent-cell"><label class="report-process-input"><input class="report-example-number" type="number" name="phase_${stage.key}" min="0" max="100" step="0.1" aria-label="${esc(stage.name)} ผลสะสมถึงเดือนนี้" value="${safeNum(sample.phases[stage.key]).toFixed(1)}"><span>%</span></label></td></tr>`;
    }).join('');
    const progressSection=`<section class="card report-entry-step" id="example-progress"><div class="starter-section-title"><div><h2>ความก้าวหน้าของงาน</h2><p class="muted">กรอกผลสะสมถึงเดือนนี้ · ตัวเลขแผนและผลก่อนหน้าช่วยให้เทียบได้</p></div><span class="status-pill ${statusClass}" data-example-status>${statusText}</span></div><div class="table-scroll report-process-scroll"><table class="period-table report-phase-table"><thead><tr><th>ขั้นตอน</th><th>รูปแบบ</th><th>แผนสะสม</th><th>ผลสะสมก่อนเดือนนี้</th><th>ผลสะสมถึงเดือนนี้</th></tr></thead><tbody>${processRows}</tbody></table></div><div class="report-weight-note">5 ขั้นคำนวณเป็นเปอร์เซ็นต์ตามค่าน้ำหนัก · จัดซื้อ/จัดจ้างแสดงเป็นจำนวนเงิน</div><div class="soft-note" data-example-summary-progress>ผลสะสม <b data-example-actual>${actual.toFixed(1)}%</b> · แผนสะสม <b>${sample.planned.toFixed(1)}%</b> · <span class="${statusClass}" data-example-status-copy>${statusText}</span></div></section>`;
    const expenseSection=`<section class="card report-entry-step" id="example-expenses"><h2>เงินที่จ่ายออกจากโครงการ</h2><p class="muted">กรอกยอดจ่ายจริงของเดือนนี้ · ไม่ต้องใส่วงเงินหรือยอดจ่ายเดิมซ้ำ</p><div class="soft-note">จ่ายเดือนนี้ · แยกตามประเภทรายการ</div><div class="report-budget-overview"><div><span>งบโครงการ</span><strong>200,000 บาท</strong></div><div><span>จ่ายสะสมก่อนเดือนนี้</span><strong>${money(sample.priorPaid)} บาท</strong></div><div><span>จ่ายสะสมถึงเดือนนี้</span><strong data-example-cumulative-paid>${money(cumulativePaid)} บาท</strong></div><div><span>งบคงเหลือโดยประมาณ</span><strong data-example-remaining>${money(200000-cumulativePaid)} บาท</strong></div></div><div class="table-scroll"><table class="period-table report-payment-table"><thead><tr><th>รายการจ่าย</th><th>วงเงินตัวอย่าง</th><th>จ่ายสะสมก่อนเดือนนี้</th><th>จ่ายเดือนนี้</th><th>หลักฐาน / สถานะ</th></tr></thead><tbody><tr><th>จัดซื้อ/จัดจ้าง · วัสดุและสื่อกิจกรรม</th><td class="money-cell">120,000 บาท</td><td class="money-cell">35,000 บาท</td><td class="money-cell"><input class="report-example-money" type="number" min="0" step="1" name="procurementPaid" aria-label="ยอดจ่ายซื้อหรือจ้างเดือนนี้" value="${sample.procurementPaid}"></td><td><label><input type="checkbox" checked> ตรวจรับแล้ว</label><small>มีใบตรวจรับจากพัสดุ</small></td></tr><tr><th>เงินยืมกองคลัง · ค่าวิทยากร</th><td class="money-cell">40,000 บาท</td><td class="money-cell">${money(sample.priorPaid-35000)} บาท</td><td class="money-cell"><input class="report-example-money" type="number" min="0" step="1" name="loanPaid" aria-label="ยอดจ่ายจากเงินยืมเดือนนี้" value="${sample.loanPaid}"></td><td><label><input type="checkbox" ${sample.loanPaid?'checked':''}> วางฎีกาใช้หนี้แล้ว</label><small>แนบหลักฐานการใช้เงินยืม</small></td></tr><tr><th>ค่าใช้จ่ายอื่น</th><td class="money-cell">40,000 บาท</td><td class="money-cell">0 บาท</td><td class="money-cell"><input class="report-example-money" type="number" min="0" step="1" name="otherPaid" aria-label="ยอดจ่ายอื่นเดือนนี้" value="${sample.otherPaid}"></td><td>แนบหลักฐานตามรายการ</td></tr></tbody></table></div><p class="report-definition-note"><b>ตรวจรับ</b> ทำหลังพัสดุส่งของและส่งใบตรวจรับ · <b>วางฎีกา</b> ใช้เมื่อส่งหลักฐานเพื่อคืนเงินยืมกองคลัง</p></section>`;
    const summarySection=`<section class="card report-entry-step" id="example-summary"><h2>สรุปผลและไฟล์ประกอบ</h2><p class="muted">สรุปสิ่งที่ทำ ผลที่ได้ และสิ่งที่ต้องติดตามต่อ</p><div class="starter-form-grid two"><label class="wide">สรุปผลการดำเนินงานประจำเดือน *<textarea name="summary" rows="4">${esc(sample.summary)}</textarea></label><label class="wide">สาเหตุความล่าช้าและแนวทางแก้ไข${diff < -5?' *':''}<textarea name="reason" rows="3" placeholder="กรอกเมื่อผลต่ำกว่าแผนหรือคาดว่าจะขยายเวลา">${esc(sample.reason)}</textarea></label></div><section class="forecast-box"><h3>คาดว่าโครงการจะเสร็จเมื่อใด</h3><p>แผนตั้งต้นสิ้นสุด ${esc(sample.baselineEnd)} · หากคาดว่าจะเลื่อน ให้ระบุเดือนใหม่</p><label>เดือนที่คาดว่าจะเสร็จ<input type="month" name="forecastKey" value="${esc(sample.forecastKey)}"></label></section><section class="sdg-result-box"><h3>ผลลัพธ์ตาม SDG ที่เลือกไว้ในแผน</h3><p>SDG 12 · ปริมาณขยะที่คัดแยกได้ · เป้าหมาย 120 ตัน</p><div class="starter-form-grid two"><label>ผลจริงสะสมถึงเดือนนี้<input type="number" value="72" min="0"></label><label>หลักฐานที่ยืนยันผล<input type="file" accept="image/*,.pdf"></label></div></section><section class="evidence-upload"><h3>ภาพกิจกรรมหรือรายงานทั่วไป</h3><p>แนบรูปภาพหรือ PDF แล้วเลือกภาพเด่นสำหรับรายงานได้ไม่เกิน 3 ภาพ</p><input type="file" accept="image/*,.pdf" multiple></section></section>`;
    const reviewSection=`<section class="card report-entry-step" id="example-review"><h2>ตรวจทานก่อนบันทึก</h2><p class="muted">ตรวจโครงการ รอบรายงาน ตัวเลข และไฟล์อีกครั้งก่อนดูรายงานสรุป</p><div class="starter-kpis"><div><span>ผลสะสม</span><strong data-example-actual>${actual.toFixed(1)}%</strong></div><div><span>แผนสะสม</span><strong>${sample.planned.toFixed(1)}%</strong></div><div><span>เงินจ่ายเดือนนี้</span><strong>${money(totalPaid)} บาท</strong></div><div><span>ไฟล์ที่เลือก</span><strong>0 ไฟล์</strong></div></div><p class="soft-note ${statusClass}">${statusText}${diff < -5&&!sample.reason?' · กรุณาระบุสาเหตุและแนวทางแก้ไข':''}</p><div class="report-columns"><section><h3>สรุปเดือนนี้</h3><p>${esc(sample.summary)}</p></section><section><h3>กำหนดเสร็จล่าสุด</h3><p>ตามแผน ${esc(sample.baselineEnd)} · คาดการณ์ ${esc(sample.forecast)}</p><h3>สาเหตุ/แนวทางแก้ไข</h3><p>${esc(sample.reason||'ไม่ต้องระบุ')}</p></section></div></section>`;
    const stepContent=[progressSection,expenseSection,summarySection,reviewSection][ui.exampleStep-1]||progressSection;
    const scenarioSwitch=`<div class="scenario-switch screen-controls"><strong>สถานการณ์ตัวอย่าง</strong>${scenarioButtons}</div>`;
    const stepActions=`<div class="starter-actions example-step-actions">${ui.exampleStep>1?'<button type="button" class="btn quiet-btn" data-example-step="'+(ui.exampleStep-1)+'">← ย้อนกลับ</button>':''}${ui.exampleStep<4?'<button type="button" class="btn primary-btn" data-example-step="'+(ui.exampleStep+1)+'">ต่อไป: '+esc(stepNames[ui.exampleStep])+' →</button>':'<button type="button" class="btn primary-btn" data-example-output>ดูรายงานสรุปผล</button>'}</div>`;
    if(!ui.exampleOutput)return `${heading('ตัวอย่าง · ขั้นตอนที่ 2','บันทึกผลการดำเนินงานรายเดือน','กรอกทีละส่วน · ข้อมูลตัวอย่างไม่ถูกบันทึกในระบบ')}<div class="soft-note">โครงการลดขยะอาหาร · กันยายน 2569 · เลือกสถานการณ์เพื่อทดลองเปรียบเทียบ</div>${scenarioSwitch}${nav}<form id="example-report-form"><div class="card report-context-card"><div><span>โครงการ</span><strong>โครงการลดขยะอาหารและส่งเสริมการคัดแยก</strong></div><div><span>รอบรายงาน</span><strong>กันยายน 2569</strong></div><div><span>สถานะ</span><strong>${esc(statusText)}</strong></div></div><div class="example-step-heading"><small>ขั้นที่ ${ui.exampleStep} จาก 4</small><h2>${esc(stepNames[ui.exampleStep-1])}</h2></div>${stepContent}${stepActions}<div class="starter-actions"><button type="button" class="btn quiet-btn" data-example-reset>เริ่มตัวอย่างนี้ใหม่</button></div></form>`;
    const chartKeys=['2026-06','2026-07','2026-08','2026-09','2026-10','2026-11','2026-12','2027-01','2027-02'];
    const chartLabels=['มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.','ม.ค. 70','ก.พ.'];
    const planValues=[30,45,62,sample.planned,90,100,100,100,100];
    const priorValue=exampleProgress(sample.priorPhases),actualValues=[Math.max(0,priorValue*.25),Math.max(0,priorValue*.55),Math.max(0,priorValue*.8),actual,null,null,null,null,null];
    const forecastIndex=Math.max(3,chartKeys.indexOf(sample.forecastKey));
    for(let i=4;i<=forecastIndex;i++)actualValues[i]=actual+(100-actual)*(i-3)/(forecastIndex-3||1);
    const x=i=>50+i*75,y=value=>215-safeNum(value)*1.8;
    const points=(values,startAt=0)=>values.map((value,index)=>value==null?null:`${x(index+startAt)},${y(value)}`).filter(Boolean).join(' ');
    const chart=`<div class="trend-chart-wrap"><svg class="trend-chart" viewBox="0 0 700 270" role="img" aria-label="แผน ผลจริง และแนวโน้มคาดการณ์รายเดือน"><g class="chart-grid">${[0,25,50,75,100].map(value=>`<line x1="45" y1="${y(value)}" x2="665" y2="${y(value)}"/><text x="10" y="${y(value)+4}">${value}</text>`).join('')}</g><polyline class="chart-plan" points="${points(planValues)}"/><polyline class="chart-actual" points="${points(actualValues.slice(0,4))}"/><polyline class="chart-forecast" points="${points(actualValues.slice(3,forecastIndex+1),3)}"/>${chartLabels.map((label,index)=>`<text class="chart-label" x="${x(index)}" y="246">${label}</text>`).join('')}<circle class="chart-current" cx="${x(3)}" cy="${y(actual)}" r="5"/></svg><div class="chart-legend"><span><i class="legend-plan"></i>แผนตั้งต้น</span><span><i class="legend-actual"></i>ผลจริง</span><span><i class="legend-forecast"></i>คาดการณ์</span></div></div>`;
    return `${heading('รายงานสรุปผล · กันยายน 2569','สรุปผลการดำเนินงานประจำเดือน','รายงานตัวอย่างจากข้อมูลที่กรอก · เปลี่ยนสถานการณ์หรือกลับไปแก้ไขได้')}<div class="screen-controls starter-actions"><button type="button" class="btn quiet-btn" data-example-form>← กลับไปแก้ไข</button><button type="button" class="btn quiet-btn" data-example-image>ดาวน์โหลด PNG</button><button type="button" class="btn primary-btn" data-print>พิมพ์ / บันทึก PDF</button></div><article class="report-sheet print-target project-monthly-report-sheet"><header><small>MAHIDOL UNIVERSITY · SUSTAINABILITY ACTION TRACKER</small><h2>สรุปผลการดำเนินงานประจำเดือน</h2><p>โครงการลดขยะอาหารและส่งเสริมการคัดแยก · ปีงบประมาณ 2569 · กันยายน 2569</p></header><div class="project-report-kpis"><div><span>แผนสะสม</span><strong>${sample.planned.toFixed(1)}%</strong></div><div><span>ผลสะสม</span><strong>${actual.toFixed(1)}%</strong><small class="${statusClass}">${statusText}</small></div><div><span>จ่ายเดือนนี้</span><strong>${money(totalPaid)} บาท</strong></div><div><span>จ่ายสะสม</span><strong>${money(cumulativePaid)} บาท</strong></div></div><div class="project-report-main-grid"><section class="project-report-chart report-reading-card"><h3>แผนตั้งต้น ผลจริง และแนวโน้ม</h3><p>ผลสะสมถึงกันยายน ${actual.toFixed(1)}% · แผนสะสม ${sample.planned.toFixed(1)}% · คาดว่าจะเสร็จ ${esc(sample.forecast)}</p>${chart}</section><div class="project-report-main-details"><section class="report-reading-card project-report-summary-card"><h3>งานที่ทำในเดือนนี้</h3><p>${esc(sample.summary)}</p></section><div class="project-report-two-col report-columns"><section class="report-reading-card"><h3>วัตถุประสงค์</h3><p>ลดปริมาณขยะอาหารและส่งเสริมการคัดแยกในโรงอาหาร</p><h3>ผลที่คาดว่าจะได้รับ</h3><p>ร้านค้าและผู้ใช้บริการคัดแยกขยะได้ถูกต้องมากขึ้น</p></section><section class="report-reading-card"><h3>เรื่องที่ต้องติดตาม</h3><p>${esc(sample.reason||'รวบรวมข้อมูลจากร้านค้าที่เข้าร่วมและติดตามผลรอบถัดไป')}</p><h3>กำหนดเสร็จ</h3><p>แผนตั้งต้น ${esc(sample.baselineEnd)} · คาดการณ์ล่าสุด ${esc(sample.forecast)}</p></section><div class="project-report-result-sdg-grid"><section class="report-reading-card project-report-result-card"><h3>ผลลัพธ์และตัวชี้วัด</h3><p>ปริมาณขยะอาหารที่คัดแยกได้</p><div class="report-result-metric"><span>ผลเดือนนี้ · กันยายน 2569</span><strong>72 ตัน</strong><small>เป้าหมาย 120 ตัน</small><small>ผลสะสมจากรายงานตัวอย่าง</small></div></section><section class="report-reading-card report-related-sdgs"><h3>SDG ที่เกี่ยวข้อง</h3><div class="report-sdg-list"><div class="report-sdg-item" style="--sdg-color:#d99a19"><span>SDG 12</span><div><strong>การบริโภคและการผลิตที่ยั่งยืน</strong><small>ลดขยะอาหารและส่งเสริมการคัดแยก</small></div></div><div class="report-sdg-item" style="--sdg-color:#3b8a4a"><span>SDG 13</span><div><strong>การรับมือการเปลี่ยนแปลงสภาพภูมิอากาศ</strong><small>ลดผลกระทบจากขยะอินทรีย์</small></div></div></div></section></div></div></div><div class="project-report-bottom-grid"><section class="output-procurement"><h3>สรุปค่าใช้จ่ายเดือนนี้</h3><div class="output-procurement-list"><div class="output-procurement-row"><span class="expense-order">1</span><b>วัสดุและสื่อกิจกรรม<small>จัดซื้อ/จัดจ้าง · ตรวจรับแล้ว</small></b><span class="expense-proof-status">ตรวจรับแล้ว</span><strong>${money(sample.procurementPaid)} บาท</strong></div><div class="output-procurement-row"><span class="expense-order">2</span><b>ค่าวิทยากร<small>เงินยืมกองคลัง</small></b><span class="expense-proof-status">วางฎีกาใช้หนี้แล้ว</span><strong>${money(sample.loanPaid)} บาท</strong></div><div class="output-procurement-row"><span class="expense-order">3</span><b>รวมจ่ายเดือนนี้</b><span></span><strong>${money(totalPaid)} บาท</strong></div></div></section><section class="project-report-photos report-reading-card"><h3>ภาพกิจกรรมตัวอย่าง · 3 ภาพ</h3><div class="example-report-photos"><figure><div class="example-photo photo-a">🥗</div><figcaption>รณรงค์ลดอาหารเหลือ</figcaption></figure><figure><div class="example-photo photo-b">♻️</div><figcaption>จุดคัดแยกขยะ</figcaption></figure><figure><div class="example-photo photo-c">👥</div><figcaption>ทีมงานลงพื้นที่</figcaption></figure></div></section></div><footer>รายงานตัวอย่าง · สร้างจากข้อมูลจำลอง · ไฟล์จริงจะถูกบันทึกเมื่อส่งรายงานในระบบ</footer></article>`;
  }

  async function downloadMonthlyExampleImage() {
    const source=document.querySelector('.project-monthly-report-sheet');
    if(!source)return notice('ไม่พบหน้ารายงานตัวอย่าง กรุณาเปิดรายงานก่อนดาวน์โหลด');
    return downloadProjectReportImage({source,filename:'ตัวอย่างรายงานประจำเดือน.png',successMessage:'ดาวน์โหลดรายงาน PNG จากตัวอย่างแล้ว'});
  }

  function status(project, month) {
    const report = getReport(project.id, month);
    if (!report) return { label: 'รอรายงาน', className: 'status-pending', difference: null };
    const difference = progress(report.phases) - plannedAt(project.id, month);
    return difference < -5 ? { label: 'ช้ากว่าแผน', className: 'status-bad', difference } : difference > 5 ? { label: 'เร็วกว่าแผน', className: 'status-good', difference } : { label: 'ตามแผน', className: 'status-good', difference };
  }
  function chartSvg(keys, plan, actual, forecast = [], markerKey = '', chartHeight = 240) {
    if (!keys.length) return '<div class="empty-box">ยังไม่มีข้อมูลสำหรับกราฟ</div>';
    const width = 860, height = chartHeight, left = 44, right = 12, top = 15, bottom = 38;
    const x = index => left + index * (width - left - right) / Math.max(1, keys.length - 1);
    const y = value => top + (100 - value) * (height - top - bottom) / 100;
    const line = values => values.map((value, index) => value === null || value === undefined ? null : `${x(index).toFixed(1)},${y(Math.max(0,Math.min(100,value))).toFixed(1)}`).filter(Boolean).join(' ');
    const actualSegments = [];
    let run = [];
    actual.forEach((value,index) => { if (value === null || value === undefined) { if (run.length) actualSegments.push(run.join(' ')); run=[]; } else run.push(`${x(index).toFixed(1)},${y(value).toFixed(1)}`); });
    if (run.length) actualSegments.push(run.join(' '));
    const ticks = [0,25,50,75,100].map(value => `<line x1="${left}" x2="${width-right}" y1="${y(value)}" y2="${y(value)}" stroke="#e3ebf4"/><text x="${left-8}" y="${y(value)+4}" text-anchor="end" font-size="11" fill="#7c8da2">${value}</text>`).join('');
    const monthAxis = keys.map((key,index) => {
      const [year,month]=key.split('-').map(Number),previousYear=index?Number(keys[index-1].slice(0,4)):null;
      const label=index===0||year!==previousYear?`${monthsTh[month-1]} ${year+543}`:monthsTh[month-1];
      return `<line x1="${x(index)}" x2="${x(index)}" y1="${height-bottom}" y2="${height-bottom+4}" stroke="#a8b7c8"/><text x="${index===0?left:index===keys.length-1?width-right:x(index)}" y="${height-12}" text-anchor="${index===0?'start':index===keys.length-1?'end':'middle'}" font-size="9" fill="#718299">${label}</text>`;
    }).join('');
    const markerIndex = markerKey ? keys.indexOf(markerKey) : -1;
    const markerValue = markerIndex >= 0 ? actual[markerIndex] : null;
    const marker = markerIndex >= 0 ? `<line x1="${x(markerIndex)}" x2="${x(markerIndex)}" y1="${top}" y2="${height-bottom}" stroke="#15956e" stroke-width="1.5" stroke-dasharray="4 4"/><circle cx="${x(markerIndex)}" cy="${y(markerValue ?? plan[markerIndex] ?? 0)}" r="6" fill="#15956e" stroke="#fff" stroke-width="2"/><rect x="${Math.max(left,Math.min(width-right-112,x(markerIndex)-54))}" y="2" width="108" height="22" rx="11" fill="#e5f6ed"/><text x="${Math.max(left+54,Math.min(width-right-58,x(markerIndex)))}" y="17" text-anchor="middle" font-size="10" font-weight="700" fill="#14764d">รายงาน ${monthLabel(markerKey)}</text>` : '';
    return `<svg class="starter-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="กราฟแผนตั้งต้น ผลจริง และคาดการณ์${markerIndex >= 0 ? ` พร้อมจุดรายงาน ${monthLabel(markerKey)}` : ''}" xmlns="http://www.w3.org/2000/svg">${ticks}<line x1="${left}" x2="${width-right}" y1="${height-bottom}" y2="${height-bottom}" stroke="#ccd7e3"/>${monthAxis}${marker}<polyline fill="none" stroke="#3078d7" stroke-width="3" stroke-dasharray="8 6" points="${line(plan)}"/>${actualSegments.map(points=>`<polyline fill="none" stroke="#15956e" stroke-width="4" points="${points}"/>`).join('')}${forecast.some(value=>value!==null&&value!==undefined) ? `<polyline fill="none" stroke="#e2a535" stroke-width="3" stroke-dasharray="6 5" points="${line(forecast)}"/>` : ''}${markerIndex >= 0 ? `<circle cx="${x(markerIndex)}" cy="${y(markerValue ?? plan[markerIndex] ?? 0)}" r="6" fill="#15956e" stroke="#fff" stroke-width="2"/>` : ''}</svg>`;
  }
  function projectCurve(project, markerKey = '', chartHeight = 240) {
    const plan = getPlan(project.id);
    const planKeys = plan?.months?.map(row=>row.key) || yearMonths(ui.year);
    const relevantReports=projectReports(project.id).filter(report=>!markerKey||report.month<=markerKey);
    const forecastEnd=relevantReports.at(-1)?.forecastMonth;
    const sortedKeys=[...new Set([...planKeys,...(forecastEnd&&forecastEnd>planKeys.at(-1)?[forecastEnd]:[])])].sort();
    const keys=sortedKeys.length?monthsBetween(sortedKeys[0],sortedKeys.at(-1)):[];
    const baseline = keys.map(key => plannedAt(project.id,key));
    const actual = keys.map(key => (!markerKey||key<=markerKey)&&getReport(project.id,key) ? progress(getReport(project.id,key).phases) : null);
    const forecast = Array(keys.length).fill(null);
    const latest=relevantReports.at(-1),cutoffIndex=markerKey?keys.indexOf(markerKey):keys.indexOf(latest?.month);
    if(latest&&cutoffIndex>=0&&cutoffIndex<keys.length-1) fillForecast(forecast,keys,baseline,project,latest,cutoffIndex);
    return chartSvg(keys,baseline,actual,forecast,markerKey,chartHeight);
  }
  function fillForecast(forecast,keys,baseline,project,latest,startIndex) {
    const reportIndex=keys.indexOf(latest.month);
    if(reportIndex<0)return;
    const startValue=Math.max(0,Math.min(100,progress(latest.phases)+Math.max(0,baseline[startIndex]-baseline[reportIndex])));
    const plan=getPlan(project.id);
    const plannedFinishIndex=Math.max(startIndex,keys.indexOf(plan?.baselineEnd||keys.at(-1)));
    const reportedFinish=latest.forecastMonth&&latest.forecastMonth>keys[startIndex]?latest.forecastMonth:'';
    const finishIndex=Math.max(plannedFinishIndex,reportedFinish?keys.indexOf(reportedFinish):-1);
    const boundedFinish=Math.max(startIndex+1,finishIndex);
    const baseAtStart=baseline[startIndex];
    const baseAtFinish=baseline[plannedFinishIndex]??100;
    for(let index=startIndex;index<keys.length;index++){
      if(index>boundedFinish){forecast[index]=100;continue;}
      const stretchedIndex=boundedFinish>plannedFinishIndex&&boundedFinish>startIndex
        ? startIndex+(index-startIndex)*(plannedFinishIndex-startIndex)/(boundedFinish-startIndex)
        : index;
      const lower=Math.floor(stretchedIndex),upper=Math.min(keys.length-1,Math.ceil(stretchedIndex)),fraction=stretchedIndex-lower;
      const plannedValue=(baseline[lower]??100)*(1-fraction)+(baseline[upper]??100)*fraction;
      const denominator=baseAtFinish-baseAtStart;
      const share=denominator>0?Math.max(0,Math.min(1,(plannedValue-baseAtStart)/denominator)):(index-startIndex)/(boundedFinish-startIndex);
      forecast[index]=Math.max(0,Math.min(100,startValue+(100-startValue)*share));
    }
  }
  function overallCurve(projects, markerKey = '', chartHeight = 240) {
    const eligibleReports=projects.flatMap(project=>projectReports(project.id).filter(report=>!markerKey||report.month<=markerKey));
    const lastPlanMonth=projects.flatMap(project=>getPlan(project.id)?.months?.map(row=>row.key)||[]).sort().at(-1);
    const sortedKeys = [...new Set([...projects.flatMap(project=>getPlan(project.id)?.months?.map(row=>row.key)||[]),...eligibleReports.map(report=>report.forecastMonth).filter(key=>key&&key>lastPlanMonth)])].sort();
    const keys = sortedKeys.length?monthsBetween(sortedKeys[0],sortedKeys.at(-1)):[];
    const baseline = keys.map(key => { const planned=projects.filter(project=>getPlan(project.id)); const total=planned.reduce((sum,project)=>sum+safeNum(project.budget),0); return total ? planned.reduce((sum,project)=>sum+plannedAt(project.id,key)*safeNum(project.budget),0)/total : 0; });
    const actual = keys.map(key => { const available=projects.map(project=>({project,report:(!markerKey||key<=markerKey)?getReport(project.id,key):null})).filter(item=>item.report); const total=available.reduce((sum,item)=>sum+safeNum(item.project.budget),0); return total ? available.reduce((sum,item)=>sum+progress(item.report.phases)*safeNum(item.project.budget),0)/total : null; });
    const cutoffIndex=markerKey?keys.indexOf(markerKey):-1;
    const perProjectForecast=projects.map(project=>{
      const report=projectReports(project.id).filter(item=>!markerKey||item.month<=markerKey).at(-1);
      if(!report||cutoffIndex<0)return null;
      const plan=getPlan(project.id);
      const projectBaseline=keys.map(key=>plannedAt(project.id,key)),values=Array(keys.length).fill(null);
      const startIndex=Math.max(cutoffIndex,keys.indexOf(report.month));
      fillForecast(values,keys,projectBaseline,project,report,startIndex);
      return values;
    });
    const forecast=keys.map((key,index)=>{
      if(cutoffIndex<0||index<cutoffIndex)return null;
      const available=projects.map((project,projectIndex)=>({project,value:perProjectForecast[projectIndex]?.[index]})).filter(item=>item.value!==null&&item.value!==undefined);
      const total=available.reduce((sum,item)=>sum+safeNum(item.project.budget),0);
      return total?available.reduce((sum,item)=>sum+item.value*safeNum(item.project.budget),0)/total:null;
    });
    return chartSvg(keys,baseline,actual,forecast,markerKey,chartHeight);
  }
  function renderReview() {
    const project = selectedProject();
    if (!project) return `${heading('ตรวจข้อมูล', 'ติดตามแผนและผล', 'ตารางจะปรากฏเมื่อเพิ่มโครงการและบันทึกแผน')}${controls(true)}${emptyBox('ยังไม่มีโครงการ', 'เริ่มที่หน้าแอดมินก่อน', 'admin', 'ไปหน้าแอดมิน')}`;
    const plan = getPlan(project.id);
    if (!plan) return `${heading('ตรวจข้อมูล', 'ติดตามแผนและผล', 'โครงการนี้ยังไม่มีแผนรายเดือน')}${controls(true)}${emptyBox('ยังไม่มีแผน', 'กรอกแผนก่อนแล้วกลับมาตรวจ', 'plan', 'ไปวางแผน')}`;
    const report = getReport(project.id,ui.month);
    const state = status(project,ui.month);
    return `${heading('ตรวจข้อมูล', 'ติดตามแผนและผล', 'ตรวจตัวเลขที่คุณกรอกเองตามเดือนและปีงบเดียวกัน')}${controls(true,true)}
      <div class="starter-kpis"><div><span>แผนสะสม</span><strong>${plannedAt(project.id,ui.month).toFixed(1)}%</strong></div><div><span>ผลสะสม</span><strong>${report ? `${progress(report.phases).toFixed(1)}%` : '—'}</strong><small>${state.label}</small></div><div><span>จ่ายสะสม</span><strong>${money(paidThrough(project.id,ui.month))}</strong><small>บาท</small></div><div><span>งบโครงการ</span><strong>${money(project.budget)}</strong><small>บาท</small></div></div>
      <section class="card table-card"><div class="table-scroll"><table class="period-table"><thead><tr><th>เดือน</th><th>แผนสะสม</th><th>ผลสะสม</th><th>แผนจัดซื้อ</th><th>จ่ายจริงเดือนนั้น</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody>${plan.months.map(row=>{const result=getReport(project.id,row.key);const monthState=status(project,row.key);return `<tr><th>${monthLabel(row.key)}</th><td>${plannedAt(project.id,row.key).toFixed(1)}%</td><td>${result ? `${progress(result.phases).toFixed(1)}%` : '—'}</td><td class="money-cell">${money(row.procure)} บาท</td><td class="money-cell">${result ? money(paid(result))+' บาท' : '—'}</td><td class="${monthState.className}">${monthState.label}</td><td><button class="mini-btn" data-follow-page="report" data-project-id="${project.id}" data-follow-month="${row.key}">${result?'แก้รายงาน':'กรอกรายงาน'}</button></td></tr>`}).join('')}</tbody></table></div></section><div class="starter-actions"><button class="btn quiet-btn" data-go="report">กลับไปแก้รายงาน</button><button class="btn quiet-btn" data-go="dashboard">ดูแดชบอร์ด</button></div>`;
  }
  function dashboardData(scopeProjectId = '') {
    const projects = yearProjects().filter(project=>!scopeProjectId||project.id===scopeProjectId);
    const month = ui.month || latestMonth();
    const monthKeys=[...new Set([...projects.flatMap(project=>getPlan(project.id)?.months?.map(row=>row.key)||[]),...projects.flatMap(project=>projectReports(project.id).map(report=>report.month))])].sort();
    const previousMonth=monthKeys.filter(key=>key<month).at(-1)||'';
    const reported = projects.map(project=>({project,report:getReport(project.id,month)})).filter(item=>item.report);
    const reportingBudget = reported.reduce((sum,item)=>sum+safeNum(item.project.budget),0);
    const plan = reportingBudget ? reported.reduce((sum,item)=>sum+plannedAt(item.project.id,month)*safeNum(item.project.budget),0)/reportingBudget : null;
    const actual = reportingBudget ? reported.reduce((sum,item)=>sum+progress(item.report.phases)*safeNum(item.project.budget),0)/reportingBudget : null;
    const paidAmount = projects.reduce((sum,project)=>sum+paidThrough(project.id,month),0);
    const allocation=projects.reduce((sum,project)=>sum+safeNum(project.budget),0);
    const rows=projects.map(project=>{
      const report=getReport(project.id,month), projectStatus=status(project,month), projectPlan=getPlan(project.id);
      const planned=projectPlan?plannedAt(project.id,month):null, actualValue=report?progress(report.phases):null;
      const latest=projectReports(project.id).filter(item=>item.month<=month).at(-1);
      const monthPaid=report?paid(report):0;
      const financeFollowUps=Array.isArray(report?.expenseItemPayments)?planExpenseItems(projectPlan).flatMap((item,index)=>{
        const amount=safeNum(report.expenseItemPayments[index]);
        if(amount<=0)return [];
        if(item.type==='procurement'&&!report.expenseItemReceived?.[index])return [{label:`${item.name} · รอใบตรวจรับ`,amount,type:'receipt'}];
        if(item.type==='advance'&&!report.expenseItemTreasuryCleared?.[index])return [{label:`${item.name} · รอวางฎีกาใช้หนี้`,amount,type:'treasury'}];
        return [];
      }):[];
      const reports=projectReports(project.id).filter(item=>item.month<=month);
      return {project,report,projectStatus,planned,actual:actualValue,paid:paidThrough(project.id,month),monthPaid,remaining:safeNum(project.budget)-paidThrough(project.id,month),latest,plan:projectPlan,difference:actualValue===null||planned===null?null:actualValue-planned,financeFollowUps,reports,owner:project.owners?.[0]?.name||'ยังไม่ระบุผู้รับผิดชอบ'};
    });
    const attention=rows.filter(row=>row.report&&(row.projectStatus.label==='ช้ากว่าแผน'||(row.latest?.forecastMonth&&row.plan?.baselineEnd&&row.latest.forecastMonth>row.plan.baselineEnd)));
    const sdgSummary=sdgOptions.map(([id,name])=>({id,name,projects:projects.filter(project=>getPlan(project.id)?.sdgs?.includes(id))})).filter(item=>item.projects.length);
    const sdgResults=projects.flatMap(project=>{
      const plan=getPlan(project.id), report=projectReports(project.id).filter(item=>item.month<=month).at(-1)||null;
      return (plan?.sdgs||[]).map(id=>({project,id,plan,report}));
    });
    const lastYearBudget=db.budgets[ui.year-1]?.amount;
    const previousReported=projects.map(project=>({project,report:getReport(project.id,previousMonth)})).filter(item=>item.report);
    const comparable=projects.filter(project=>getReport(project.id,month)&&previousMonth&&getReport(project.id,previousMonth));
    const comparableBudget=comparable.reduce((sum,project)=>sum+safeNum(project.budget),0);
    const comparableChange=comparableBudget?comparable.reduce((sum,project)=>sum+(progress(getReport(project.id,month).phases)-progress(getReport(project.id,previousMonth).phases))*safeNum(project.budget),0)/comparableBudget:null;
    const monthPaid=reported.reduce((sum,item)=>sum+paid(item.report),0);
    const financeFollowUps=rows.flatMap(row=>row.financeFollowUps.map(item=>({...item,project:row.project,owner:row.owner})));
    const annualBudget=db.budgets[ui.year]?.amount;
    const budgetRisk=annualBudget!==undefined&&allocation>annualBudget?allocation-annualBudget:0;
    const scheduleFocus=rows.filter(row=>row.plan).sort((a,b)=>{
      const aForecast=a.latest?.forecastMonth||a.plan.baselineEnd,bForecast=b.latest?.forecastMonth||b.plan.baselineEnd;
      const aLate=aForecast>a.plan.baselineEnd?1:0,bLate=bForecast>b.plan.baselineEnd?1:0;
      return bLate-aLate||String(bForecast).localeCompare(String(aForecast));
    })[0]||null;
    return {projects,month,previousMonth,reported,previousReported,comparableChange,comparableCount:comparable.length,monthPaid,plan,actual,paidAmount,allocation,remaining:allocation-paidAmount,annualBudget,reportingBudget,rows,attention,financeFollowUps,budgetRisk,scheduleFocus,sdgSummary,sdgResults,lastYearBudget};
  }
  function dashboardPreviewDatabase(year) {
    const keys=yearMonths(year),cutoff=Math.max(0,keys.indexOf(ui.month));
    const projectRows=[
      {id:'preview-circular',name:'โครงการจัดการขยะครบวงจร',budget:3000000,sdgs:['SDG 12','SDG 13'],indicator:'ปริมาณขยะที่คัดแยกได้',target:'120 ตัน',unit:'ตัน',paid:450000,scenario:'late',owner:'นางสาวอรทัย ใจดี',department:'กองกายภาพและสิ่งแวดล้อม'},
      {id:'preview-energy',name:'โครงการพลังงานสะอาด',budget:2000000,sdgs:['SDG 7','SDG 13'],indicator:'พลังงานไฟฟ้าที่ลดการใช้ได้',target:'50,000 กิโลวัตต์ชั่วโมง',unit:'กิโลวัตต์ชั่วโมง',paid:500000,scenario:'ontrack',owner:'นายธนกร พลังงาน',department:'กองกายภาพและสิ่งแวดล้อม'},
      {id:'preview-green',name:'โครงการพื้นที่สีเขียว',budget:1000000,sdgs:['SDG 11','SDG 15'],indicator:'จำนวนต้นไม้ที่ปลูกและรอด',target:'200 ต้น',unit:'ต้น',paid:120000,scenario:'early',owner:'นางสาวพิมพ์ใจ ร่มเย็น',department:'คณะสิ่งแวดล้อม'},
      {id:'preview-communication',name:'โครงการสื่อสารความยั่งยืน',budget:800000,sdgs:['SDG 4','SDG 17'],indicator:'สื่อความรู้ที่เผยแพร่',target:'12 ชุด',unit:'ชุด',paid:0,scenario:'missing',owner:'นายกิตติพงษ์ สื่อสาร',department:'กองบริหารงานทั่วไป'}
    ];
    const sample=empty();
    sample.budgets[year]={amount:9000000,updatedAt:'ข้อมูลตัวอย่าง'};
    sample.departments=projectRows.map((project,index)=>({id:`preview-dept-${index}`,name:project.department}));
    sample.projects=projectRows.map((project,index)=>({id:project.id,year,name:project.name,deptId:`preview-dept-${index}`,budget:project.budget,owners:[{name:project.owner}],active:true,status:'active'}));
    for(const project of projectRows){
      const months=keys.map((key,index)=>({key,draft:index===0?100:0,approval:index===0?100:0,execute:index>=1&&index<=10?10:0,disburse:index>=4&&index<=8?20:0,summary:index===11?100:0,procure:project.budget/12}));
      const forecast=project.scenario==='late'?shiftMonth(keys[11],2):project.scenario==='early'?shiftMonth(keys[11],-2):keys[11];
      sample.plans[project.id]={projectId:project.id,baselineStart:keys[0],baselineEnd:keys[11],objective:`ดำเนินงานด้าน${project.name.replace('โครงการ','')}`,expectedOutcome:'เกิดผลลัพธ์ที่วัดและรายงานได้',sdgs:project.sdgs,indicator:project.indicator,target:project.target,indicatorUnit:project.unit,evidenceSource:'รายงานผลโครงการ',months,procurementItems:[{name:project.scenario==='late'?'จัดซื้อวัสดุและอุปกรณ์':project.scenario==='ontrack'?'ค่าวิทยากรและกิจกรรม':'วัสดุดำเนินโครงการ',amount:project.budget*.4,type:project.scenario==='ontrack'?'advance':project.scenario==='early'?'other':'procurement'}]};
      const reportCount=project.scenario==='missing'?Math.max(0,cutoff):cutoff+1;
      for(let index=0;index<reportCount;index++){
        const actualExecute=project.scenario==='late'?Math.max(0,index*6):project.scenario==='early'?Math.min(100,index*12+15):Math.min(100,index*10);
        const phases=project.scenario==='late'&&index===0?{draft:50,approval:0,execute:0,disburse:0,summary:0}:{draft:100,approval:100,execute:actualExecute,disburse:index>=4?Math.min(100,(index-3)*20):0,summary:index===11?100:0};
        const expense=project.scenario==='missing'?0:index===0?project.paid:Math.round(project.budget*.015);
        const item=sample.plans[project.id].procurementItems[0];
        sample.reports.push({id:`preview-report-${project.id}-${keys[index]}`,projectId:project.id,month:keys[index],version:1,phases,expenseItemPayments:[expense],expenseItemReceived:[project.scenario!=='late'],expenseItemTreasuryCleared:[project.scenario!=='ontrack'||index>0],procurementPaid:item.type==='procurement'?expense:0,loanPaid:item.type==='advance'?expense:0,otherPaid:item.type==='other'?expense:0,unplannedPaid:0,sdgOutcome:`รายงานผล${project.indicator}`,indicatorActual:project.scenario==='late'?'8':project.scenario==='ontrack'?'2,500':'20',summaryText:'ดำเนินงานตามแผนและรวบรวมผลลัพธ์ประจำเดือน',delay:project.scenario==='late'?'การเตรียมจัดซื้อใช้เวลานานกว่ากำหนด':'' ,forecastMonth:forecast,status:'submitted',updatedAt:'ข้อมูลตัวอย่าง'});
      }
    }
    sample.documents=[{id:'preview-doc-budget',year,title:'แนวทางบริหารงบประมาณโครงการ',scope:'central',category:'แนวทางปฏิบัติ',number:'ตัวอย่าง 01/2570',fileName:'แนวทางบริหารงบประมาณ.pdf',visible:true},{id:'preview-doc-report',year,title:'แบบฟอร์มรายงานผลโครงการ',scope:'central',category:'แบบฟอร์ม',number:'ฉบับตัวอย่าง',fileName:'แบบรายงานผล.pdf',visible:true}];
    return sample;
  }
  function renderDashboard() {
    if(yearProjects().length)return renderDashboardContent(false);
    const storedDb=db;
    db=dashboardPreviewDatabase(ui.year);
    try{return renderDashboardContent(true);}finally{db=storedDb;}
  }
  function dashboardProjectLink(project, extraClass = '') {
    return `<button type="button" class="dashboard-project-link ${extraClass}" data-dashboard-select-project="${esc(project.id)}" aria-label="ดูภาพรวมโครงการ ${esc(project.name)}">${esc(project.name)}</button>`;
  }
  function dashboardReportMarkup(data, selectedProject, isPreview) {
    const reportedLabel=`${data.reported.length} / ${data.projects.length} โครงการ`;
    const chart=selectedProject?projectCurve(selectedProject,data.month,260):overallCurve(data.projects,data.month,260);
    const rows=data.rows.map(row=>`<tr><td><button type="button" class="dashboard-project-link" data-dashboard-select-project="${esc(row.project.id)}">${esc(row.project.name)}</button></td><td>${money(row.project.budget)} บาท</td><td>${row.planned===null?'—':`${row.planned.toFixed(1)}%`}</td><td>${row.actual===null?'ยังไม่รายงาน':`${row.actual.toFixed(1)}%`}</td><td>${money(row.paid)} บาท</td><td>${row.difference===null?'—':`${row.difference>0?'+':''}${row.difference.toFixed(1)} จุด`}</td><td>${row.report?row.projectStatus.label:`รอรายงาน ${monthLabel(data.month)}`}</td></tr>`).join('');
    return `<section class="card dashboard-monthly-report dashboard-report-print-target"><div class="starter-section-title"><div><p class="eyebrow">ส่งออกหรือใช้ประกอบการประชุม</p><h2>รายงานภาพรวมประจำเดือน</h2><p>${selectedProject?`โครงการ ${esc(selectedProject.name)} · `:'ทุกโครงการ · '}ปีงบประมาณ ${ui.year} · ข้อมูลถึง ${monthLabel(data.month)} · รายงานแล้ว ${reportedLabel}</p></div><div class="dashboard-report-actions screen-controls"><button type="button" class="btn quiet-btn" data-dashboard-report-image>ดาวน์โหลด PNG</button><button type="button" class="btn primary-btn" data-dashboard-report-pdf>ดาวน์โหลด PDF · A4</button></div></div><article class="report-sheet dashboard-report-sheet"><header><small>MAHIDOL UNIVERSITY · SUSTAINABILITY ACTION TRACKER</small><h2>สรุปผลการดำเนินงานประจำเดือน</h2><p>${selectedProject?esc(selectedProject.name):'ภาพรวมทุกโครงการ'} · ปีงบประมาณ ${ui.year} · ${monthLabel(data.month)}</p></header><div class="dashboard-report-kpis"><div><span>งบอนุมัติทั้งปี</span><strong>${data.annualBudget===undefined?'—':`${money(data.annualBudget)} บาท`}</strong></div><div><span>จัดสรรให้โครงการ</span><strong>${money(data.allocation)} บาท</strong></div><div><span>จ่ายสะสมถึงเดือนนี้</span><strong>${money(data.paidAmount)} บาท</strong></div><div><span>ผลเทียบแผน</span><strong>${data.actual===null||data.plan===null?'—':`${data.actual.toFixed(1)}% / ${data.plan.toFixed(1)}%`}</strong><small>ผลจริง / แผน</small></div></div><section class="dashboard-report-chart"><h3>แผนตั้งต้น ผลจริง และแนวโน้ม</h3>${chart}<div class="chart-key"><span><i class="base"></i>แผนตั้งต้น</span><span><i class="actual"></i>ผลจริง</span><span><i class="forecast"></i>คาดการณ์</span><span><i class="current-month-key"></i>เดือนรายงาน ${monthLabel(data.month)}</span></div></section><section class="dashboard-report-table"><h3>ผลการดำเนินงานและงบประมาณรายโครงการ</h3><div class="table-scroll"><table class="starter-table"><thead><tr><th>โครงการ</th><th>งบจัดสรร</th><th>แผนสะสม</th><th>ผลสะสม</th><th>จ่ายสะสม</th><th>ผลต่าง</th><th>สถานะ</th></tr></thead><tbody>${rows||'<tr><td colspan="7">ยังไม่มีโครงการในปีงบประมาณนี้</td></tr>'}</tbody></table></div></section><footer>ข้อมูลตัดยอด ณ ${monthLabel(data.month)} · ${isPreview?'ข้อมูลตัวอย่างสำหรับดูรูปแบบเท่านั้น':'สร้างจากข้อมูลที่บันทึกในเว็บจำลอง'} · ${now()}</footer></article></section>`;
  }
  function dashboardProjectDetailMarkup(project, row, data, isPreview) {
    const plan=row?.plan||getPlan(project.id), report=getReport(project.id,data.month);
    const reports=projectReports(project.id).filter(item=>item.month<=data.month).sort((a,b)=>a.month.localeCompare(b.month));
    const latest=reports.at(-1)||null, planValue=plan?plannedAt(project.id,data.month):null;
    const actual=report?progress(report.phases):null, gap=actual===null||planValue===null?null:actual-planValue;
    const cumulativePaid=reports.reduce((sum,item)=>sum+paid(item),0), monthPaid=report?paid(report):null;
    const expenses=planExpenseItems(plan).map((item,index)=>{
      const monthAmount=report?readExpenseDetails({get:()=>null,has:()=>false},plan,report).amounts[index]||0:0;
      const cumulative=reports.reduce((sum,item)=>sum+(readExpenseDetails({get:()=>null,has:()=>false},plan,item).amounts[index]||0),0);
      const evidence=(report?.attachments||[]).filter(file=>file.expenseIndex===index);
      const received=report?.expenseItemReceived?.[index],treasury=report?.expenseItemTreasuryCleared?.[index];
      const proof=evidence.map(file=>`<button type="button" class="mini-btn" data-open-file="${esc(file.blobId)}">${esc(file.name||'ดูหลักฐาน')}</button>`).join(' ');
      const state=item.type==='procurement'?(received?'ตรวจรับแล้ว':'รอตรวจรับ'):item.type==='advance'?(treasury?'วางฎีกาใช้หนี้แล้ว':'รอวางฎีกาใช้หนี้'):'ไม่ต้องตรวจรับ/วางฎีกา';
      return `<article class="project-detail-expense"><div><strong>${esc(item.name||`รายการ ${index+1}`)}</strong><small>${esc(expenseTypeNames[item.type]||'รายการค่าใช้จ่าย')} · วงเงินตามแผน ${money(item.amount)} บาท</small></div><div class="project-detail-expense-numbers"><span>เดือนนี้ <b>${report?`${money(monthAmount)} บาท`:'—'}</b></span><span>จ่ายสะสม <b>${money(cumulative)} บาท</b></span></div><div class="project-detail-expense-state"><span class="${state.includes('รอ')?'status-pending':'status-good'}">${state}</span>${proof||'<small>ไม่มีหลักฐานแนบในรอบนี้</small>'}</div></article>`;
    }).join('');
    const sdgs=(plan?.sdgs||[]).map(id=>`<span class="project-detail-sdg" style="--sdg-color:${sdgColors[id]||'#15956e'}">${esc(id)}</span>`).join('')||'<span class="muted">ยังไม่ได้เลือก SDG</span>';
    const indicatorActual=report?.indicatorActual||latest?.indicatorActual||'';
    const indicatorMonth=report?data.month:latest?.month;
    const attachments=report?.attachments||[];
    const photos=attachments.filter(file=>file.isImage&&file.featured).slice(0,3);
    const activityPhotos=attachments.filter(file=>file.isImage);
    const supportingFiles=attachments.filter(file=>!file.isImage);
    const projectSdgs=(plan?.sdgs||[]).map(id=>({id,name:sdgOptions.find(([sdgId])=>sdgId===id)?.[1]||id,rationale:plan?.sdgRationales?.[id]||''}));
    const selectedProjectSdg=projectSdgs.find(item=>item.id===ui.dashboardSdg)||projectSdgs[0]||null;
    const selectedSdgReport=selectedProjectSdg?data.sdgResults.find(item=>item.project.id===project.id&&item.id===selectedProjectSdg.id)?.report||latest:null;
    const sdgProjectCards=projectSdgs.map(item=>`<button type="button" class="dashboard-sdg-card ${selectedProjectSdg?.id===item.id?'selected':''}" style="--sdg-color:${sdgColors[item.id]||'#15956e'}" data-dashboard-project-sdg="${esc(item.id)}"><span>${esc(item.id)}</span><strong>${esc(item.name)}</strong></button>`).join('');
    const evidenceMonthLabel=report?monthLabel(report.month):monthLabel(data.month);
    const evidenceMarkup=report?`<section class="card project-detail-evidence"><div class="starter-section-title"><div><h2>ภาพกิจกรรมและเอกสารหลักฐาน</h2><p>ไฟล์ทั้งหมดที่แนบมากับรายงานเดือน ${evidenceMonthLabel} · ${attachments.length} ไฟล์</p></div><span class="readonly-pill">${activityPhotos.length} ภาพ · ${supportingFiles.length} เอกสาร</span></div>${activityPhotos.length?`<div class="project-evidence-gallery">${activityPhotos.map(file=>`<figure><button type="button" class="project-evidence-image" data-open-file="${esc(file.blobId)}" aria-label="เปิดภาพ ${esc(file.caption||file.name)}"><img data-blob-id="${esc(file.blobId)}" alt="${esc(file.caption||file.name||'ภาพกิจกรรม')}"></button><figcaption>${esc(file.caption||file.name||'ภาพกิจกรรม')}<small>${esc(file.name||'')}</small></figcaption></figure>`).join('')}</div>`:'<div class="soft-note">รายงานเดือนนี้ไม่มีภาพกิจกรรมแนบ</div>'}${supportingFiles.length?`<div class="project-evidence-files">${supportingFiles.map(file=>`<div class="project-evidence-file"><span class="document-icon">▤</span><div><strong>${esc(file.name||'เอกสารแนบ')}</strong><small>${esc(file.evidenceType==='expense'?'หลักฐานค่าใช้จ่าย':'เอกสารประกอบ')} · เพิ่ม ${esc(file.uploadedAt||report.updatedAt||'')}</small></div><button type="button" class="mini-btn" data-open-file="${esc(file.blobId)}">เปิดเอกสาร</button></div>`).join('')}</div>`:''}</section>`:`<section class="card project-detail-evidence"><div class="starter-section-title"><div><h2>ภาพกิจกรรมและเอกสารหลักฐาน</h2><p>ไม่มีไฟล์แนบสำหรับรอบ ${monthLabel(data.month)}</p></div></div><div class="soft-note">จะแสดงเฉพาะไฟล์ที่แนบมากับรายงานของเดือนที่เลือก · ไม่ดึงภาพจากเดือนก่อนมาแสดงแทน${latest?` · รายงานล่าสุดที่มีคือ ${monthLabel(latest.month)}`:''}</div></section>`;
    const reportPreview=report?`<section class="card dashboard-project-report-print-target"><div class="starter-section-title screen-controls"><div><p class="eyebrow">ตัวอย่างรายงานที่ส่งออก</p><h2>สรุปผลการดำเนินงานประจำเดือน</h2><p>${esc(project.name)} · ปีงบประมาณ ${ui.year} · ${monthLabel(report.month)} · ฉบับ ${report.version||1}</p></div><div class="dashboard-report-actions"><button type="button" class="btn quiet-btn" data-project-monthly-png data-project-id="${esc(project.id)}" data-report-month="${esc(report.month)}">ดาวน์โหลด PNG</button><button type="button" class="btn primary-btn" data-project-monthly-pdf>ดาวน์โหลด PDF · A4</button></div></div><article class="report-sheet project-monthly-report-sheet"><header><small>MAHIDOL UNIVERSITY · SUSTAINABILITY ACTION TRACKER</small><h2>สรุปผลการดำเนินงานประจำเดือน</h2><p>${esc(project.name)} · ปีงบประมาณ ${ui.year} · ${monthLabel(report.month)} · ฉบับ ${report.version||1}</p></header><div class="project-report-kpis"><div><span>แผนสะสม</span><strong>${planValue===null?'—':`${planValue.toFixed(1)}%`}</strong></div><div><span>ผลสะสม</span><strong>${actual===null?'—':`${actual.toFixed(1)}%`}</strong></div><div><span>จ่ายเดือนนี้</span><strong>${money(monthPaid||0)} บาท</strong></div><div><span>จ่ายสะสม</span><strong>${money(cumulativePaid)} บาท</strong></div></div><section class="project-report-chart report-reading-card"><h3>ความก้าวหน้าเทียบแผน</h3>${projectCurve(project,report.month,220)}<div class="chart-key"><span><i class="base"></i>แผนตั้งต้น</span><span><i class="actual"></i>ผลจริง</span><span><i class="forecast"></i>คาดการณ์</span><span><i class="current-month-key"></i>เดือนรายงาน ${monthLabel(report.month)}</span></div></section><div class="project-report-two-col"><section class="report-reading-card"><h3>สรุปผลเดือนนี้</h3><p>${esc(report.summaryText||'ไม่ได้ระบุสรุปผล')}</p></section><section class="report-reading-card"><h3>วัตถุประสงค์และผลที่คาด</h3><p>${esc(plan?.objective||'ไม่ได้ระบุวัตถุประสงค์')}</p><h3>ผลที่คาดว่าจะได้รับ</h3><p>${esc(plan?.expectedOutcome||'ไม่ได้ระบุผลที่คาดว่าจะได้รับ')}</p></section><section class="report-reading-card"><h3>ประเด็นติดตามและแนวทางแก้ไข</h3><p>${esc(report.delay||'ไม่มีประเด็นล่าช้าที่ระบุในเดือนนี้')}</p><h3>เดือนที่คาดว่าจะแล้วเสร็จ</h3><p>${monthLabel(report.forecastMonth||plan?.baselineEnd)}</p></section><section class="report-reading-card project-report-result-card"><h3>ผลลัพธ์และตัวชี้วัด</h3><div class="report-result-metric"><span>ผลเดือนนี้ · ${monthLabel(report.month)}</span><strong>${report.indicatorActual!==''&&report.indicatorActual!=null?`${esc(report.indicatorActual)}${plan?.indicatorUnit?` ${esc(plan.indicatorUnit)}`:''}`:'ยังไม่ได้ระบุผลตัวชี้วัดเดือนนี้'}</strong><small>${esc(plan?.indicator||'ไม่ได้กำหนดตัวชี้วัด')} · เป้าหมาย ${esc(plan?.target||'ยังไม่ได้กำหนด')}</small></div>${report.sdgOutcome?`<p>${esc(report.sdgOutcome)}</p>`:''}</section></div><section class="report-reading-card report-related-sdgs"><h3>SDG ที่เกี่ยวข้อง</h3>${projectSdgs.length?`<div class="report-sdg-list">${projectSdgs.map(item=>`<div class="report-sdg-item" style="--sdg-color:${sdgColors[item.id]||'#2868a8'}"><span>${esc(item.id)}</span><div><strong>${esc(item.name)}</strong>${item.rationale?`<small>${esc(item.rationale)}</small>`:''}</div></div>`).join('')}</div>`:'<p>โครงการนี้ยังไม่ได้เลือก SDG ที่เกี่ยวข้อง</p>'}</section><section class="report-reading-card"><h3>การใช้จ่ายและสถานะหลักฐาน</h3><div class="project-report-expenses">${expenses||'<p>ไม่มีรายการค่าใช้จ่ายในแผน</p>'}</div></section>${photos.length?`<section class="project-report-photos report-reading-card"><h3>ภาพกิจกรรมที่เลือกแสดง</h3><div>${photos.map(file=>`<figure><img data-blob-id="${esc(file.blobId)}" alt="${esc(file.caption||file.name||'ภาพกิจกรรม')}"><figcaption>${esc(file.caption||file.name||'ภาพกิจกรรม')}</figcaption></figure>`).join('')}</div></section>`:''}<footer>ผู้รับผิดชอบ ${esc(row?.owner||project.owners?.[0]?.name||'ไม่ระบุ')} · บันทึกล่าสุด ${esc(report.updatedAt||'—')} · ข้อมูลเว็บจำลอง</footer></article></section>`:`<section class="card dashboard-project-report-print-target"><div class="starter-section-title"><div><p class="eyebrow">ตัวอย่างรายงานประจำเดือน</p><h2>ยังไม่มีรายงานส่งแล้วสำหรับ ${monthLabel(data.month)}</h2><p>ส่วนนี้จะแสดงรายงานฉบับจริงเมื่อเลือกเดือนที่โครงการบันทึกและส่งรายงานแล้ว</p></div></div><div class="soft-note">รายงานล่าสุด${latest?` คือ ${monthLabel(latest.month)} · ฉบับ ${latest.version||1}`:'ยังไม่มีรายงานก่อนหน้า'} · เปลี่ยนตัวกรองเดือนด้านบนเพื่อดูรายงานรอบอื่น</div></section>`;
    return `<section class="dashboard-project-detail">
      <div class="dashboard-project-detail-intro"><div><p class="eyebrow">เจาะดูรายละเอียดโครงการ</p><h2>${esc(project.name)}</h2><p>${esc(db.departments.find(dept=>dept.id===project.deptId)?.name||'ไม่ระบุหน่วยงาน')} · ผู้รับผิดชอบ ${esc(row?.owner||'ยังไม่ระบุ')} · ข้อมูลถึง ${monthLabel(data.month)}</p></div><button class="btn quiet-btn" type="button" data-dashboard-all-projects>กลับไปภาพรวมทุกโครงการ</button></div>
      <div class="project-detail-kpis"><article><span>ผลเทียบแผน</span><strong>${gap===null?'—':`${gap>0?'+':''}${gap.toFixed(1)} จุด`}</strong><small>${actual===null?`ยังไม่รายงาน ${monthLabel(data.month)}`:`ผล ${actual.toFixed(1)}% · แผน ${planValue?.toFixed(1)}%`}</small></article><article><span>งบโครงการ</span><strong>${money(project.budget)} บาท</strong><small>จัดสรรตามแผนโครงการ</small></article><article><span>จ่ายเดือนนี้</span><strong>${report?`${money(monthPaid||0)} บาท`:'—'}</strong><small>${report?`ยอดถึง ${monthLabel(data.month)}`:`ยังไม่รายงาน ${monthLabel(data.month)}`}</small></article><article><span>จ่ายสะสม · คงเหลือ</span><strong>${money(cumulativePaid)} บาท</strong><small>คงเหลือ ${money(safeNum(project.budget)-cumulativePaid)} บาท</small></article></div>
      <div class="dashboard-project-detail-grid"><section class="card project-detail-progress"><div class="starter-section-title"><div><h2>แผน ผลจริง และแนวโน้ม</h2><p>เทียบผลงานกับแผน ณ ${monthLabel(data.month)}</p></div><span class="status-pill ${report?'saved':'pending'}">${report?row?.projectStatus?.label||'รายงานแล้ว':`ยังไม่รายงาน ${monthLabel(data.month)}`}</span></div>${projectCurve(project,report?data.month:'',240)}<div class="chart-key"><span><i class="base"></i>แผนตั้งต้น</span><span><i class="actual"></i>ผลจริง</span><span><i class="forecast"></i>คาดการณ์</span><span><i class="current-month-key"></i>เดือนรายงาน</span></div><p class="muted">${report?`ผลต่างจากแผน ${gap===null?'—':`${gap>0?'+':''}${gap.toFixed(1)} จุด`} · คาดว่าจะเสร็จ ${monthLabel(report.forecastMonth||plan?.baselineEnd)}`:`ไม่มีผลจริงของเดือน ${monthLabel(data.month)} · กราฟแสดงแผนตั้งต้นและรายงานล่าสุด${latest?` (${monthLabel(latest.month)})`:''}`}</p></section><section class="card project-detail-schedule"><div class="starter-section-title"><div><h2>กรอบเวลาและสถานะ</h2><p>กำหนดการตามแผนเทียบกับข้อมูลที่รายงาน</p></div></div><div class="dashboard-schedule-grid"><div><span>เริ่มตามแผน</span><strong>${plan?monthLabel(plan.baselineStart):'—'}</strong></div><div><span>เสร็จตามแผน</span><strong>${plan?monthLabel(plan.baselineEnd):'—'}</strong></div><div><span>คาดว่าจะเสร็จล่าสุด</span><strong>${latest?.forecastMonth?monthLabel(latest.forecastMonth):'ยังไม่มีข้อมูล'}</strong></div><div><span>รายงานล่าสุด</span><strong>${latest?monthLabel(latest.month):'ยังไม่มีรายงาน'}</strong></div></div>${latest?.forecastMonth&&plan?.baselineEnd&&latest.forecastMonth>plan.baselineEnd?`<div class="schedule-alert">มีแนวโน้มล่าช้า · คาดว่าจะเสร็จ ${monthLabel(latest.forecastMonth)} ช้ากว่าแผน ${Math.max(0,monthsBetween(plan.baselineEnd,latest.forecastMonth).length-1)} เดือน</div>`:''}<p class="dashboard-schedule-note">${latest?.delay?esc(latest.delay):'ไม่มีประเด็นติดตามที่บันทึกไว้ในรายงานล่าสุด'}</p></section></div>
      <section class="card project-detail-budget"><div class="starter-section-title"><div><h2>งบประมาณและรายการค่าใช้จ่าย</h2><p>แสดงวงเงินตามแผนและผลจ่ายจริงที่บันทึกไว้ถึง ${monthLabel(data.month)}</p></div></div><div class="project-detail-expense-list">${expenses||'<div class="soft-note">ยังไม่มีรายการค่าใช้จ่ายในแผนโครงการ</div>'}</div><div class="project-detail-budget-total"><span>จ่ายสะสมถึง ${monthLabel(data.month)}</span><strong>${money(cumulativePaid)} บาท</strong><span>คงเหลือจากงบโครงการ</span><strong>${money(safeNum(project.budget)-cumulativePaid)} บาท</strong></div></section>
      <section class="card project-detail-objectives"><div class="starter-section-title"><div><h2>วัตถุประสงค์และผลที่คาดว่าจะได้รับ</h2><p>ข้อมูลตั้งต้นจากแผนโครงการ</p></div></div><div class="project-objective-columns"><article><h3>วัตถุประสงค์</h3><p>${esc(plan?.objective||'ยังไม่ได้ระบุ')}</p></article><article><h3>ผลที่คาดว่าจะได้รับ</h3><p>${esc(plan?.expectedOutcome||'ยังไม่ได้ระบุ')}</p></article></div></section>
      <section class="card dashboard-sdg project-detail-sdg"><div class="starter-section-title"><div><h2>SDG ที่เกี่ยวข้อง</h2><p>เลือกเป้าหมายเพื่อดูผลที่รายงานถึง ${monthLabel(data.month)}</p></div><span class="status-pill saved">${projectSdgs.length} เป้าหมาย</span></div><div class="project-detail-sdg-layout"><div class="project-detail-sdg-selector"><div class="dashboard-sdg-list">${sdgProjectCards||'<div class="soft-note">ยังไม่ได้เลือก SDG ในแผนโครงการ</div>'}</div></div><div class="dashboard-sdg-results project-detail-sdg-result" style="--sdg-color:${selectedProjectSdg?sdgColors[selectedProjectSdg.id]||'#15956e':'#15956e'}"><h3>${selectedProjectSdg?`${esc(selectedProjectSdg.id)} · ${esc(selectedProjectSdg.name)}`:'รายละเอียดผลลัพธ์'}</h3><div class="project-detail-sdg-metric"><span>ตัวชี้วัด</span><strong>${esc(plan?.indicator||'ยังไม่ได้กำหนดตัวชี้วัด')}</strong><small>เป้าหมาย ${esc(plan?.target||'ยังไม่ได้ระบุ')}${plan?.indicatorUnit?` (${esc(plan.indicatorUnit)})`:''}</small></div><div class="project-detail-sdg-value"><span>ผลที่รายงาน</span><strong class="project-detail-sdg-actual">${selectedSdgReport?.indicatorActual?`${esc(selectedSdgReport.indicatorActual)}${plan?.indicatorUnit?` ${esc(plan.indicatorUnit)}`:''}`:selectedSdgReport?.sdgOutcome?esc(selectedSdgReport.sdgOutcome):`ยังไม่มีผลรายงานถึง ${monthLabel(data.month)}`}</strong><small>${selectedSdgReport?`รายงานล่าสุด ${monthLabel(selectedSdgReport.month)}`:'รอรายงานผล'}</small></div>${plan?.sdgRationales?.[selectedProjectSdg?.id]?`<p class="project-detail-rationale">${esc(plan.sdgRationales[selectedProjectSdg.id])}</p>`:''}${selectedSdgReport?.sdgOutcome?`<div class="project-detail-sdg-outcome"><span>สรุปผล SDG · ${monthLabel(selectedSdgReport.month)}</span><p>${esc(selectedSdgReport.sdgOutcome)}</p></div>`:''}<p class="project-detail-sdg-source">หลักฐาน: ${esc(plan?.evidenceSource||'ไม่ได้ระบุ')}</p></div></div></section>
      ${evidenceMarkup}
      <section class="card project-detail-history"><div class="starter-section-title"><div><h2>ประวัติรายงานรายเดือน</h2><p>เปิดดูรายงานของเดือนนั้นได้ พร้อมภาพและเอกสารแนบ</p></div><span class="readonly-pill">${reports.length} เดือน</span></div><div class="file-list">${reports.slice().reverse().map(item=>`<div class="file-item"><div><strong>${monthLabel(item.month)} · ฉบับ ${item.version||1}</strong><small>ผลสะสม ${progress(item.phases).toFixed(1)}% · จ่าย ${money(paid(item))} บาท · ${esc(item.updatedAt||'')}</small></div><button type="button" class="mini-btn" data-open-report="${esc(item.id)}">ดูรายงาน</button></div>`).join('')||'<div class="soft-note">ยังไม่มีประวัติรายงานที่ส่งแล้ว</div>'}</div></section>
      ${reportPreview}
    </section>`;
  }
  async function downloadDashboardProjectReportImage(projectId, month) {
    const storedDb=db, saved={...ui};
    if(!yearProjects().length)db=dashboardPreviewDatabase(ui.year);
    const report=db.reports.find(item=>item.projectId===projectId&&item.month===month);
    if(!report){db=storedDb;return notice(`ยังไม่มีรายงานที่ส่งแล้วสำหรับ ${monthLabel(month)}`);}
    ui.reportId=report.id;ui.projectId=projectId;ui.month=month;
    try { await downloadProjectReportImage(); }
    finally { db=storedDb;ui.reportId=saved.reportId;ui.projectId=saved.projectId;ui.month=saved.month; }
  }
  async function downloadDashboardReportImage() {
    const storedDb=db;
    if(!yearProjects().length)db=dashboardPreviewDatabase(ui.year);
    try {
    const data=dashboardData(ui.dashboardProject||''), project=yearProjects().find(item=>item.id===ui.dashboardProject)||null;
    const width=1800, chartTop=410, chartHeight=707, tableTop=chartTop+chartHeight+75, rowHeight=72, height=tableTop+100+Math.max(1,data.rows.length)*rowHeight+100;
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');
    ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.fillStyle='#245f9d';ctx.font='700 22px Tahoma, sans-serif';ctx.fillText('MAHIDOL UNIVERSITY · SUSTAINABILITY ACTION TRACKER',90,74);
    ctx.fillStyle='#173f79';ctx.font='700 40px Tahoma, sans-serif';ctx.fillText('สรุปผลการดำเนินงานประจำเดือน',90,140);
    ctx.fillStyle='#526b83';ctx.font='24px Tahoma, sans-serif';ctx.fillText(`${project?project.name:'ภาพรวมทุกโครงการ'} · ปีงบประมาณ ${ui.year} · ข้อมูลถึง ${monthLabel(data.month)}`,90,190);
    const metrics=[['งบอนุมัติทั้งปี',data.annualBudget===undefined?'—':`${money(data.annualBudget)} บาท`],['จัดสรรให้โครงการ',`${money(data.allocation)} บาท`],['จ่ายสะสมถึงเดือนนี้',`${money(data.paidAmount)} บาท`],['ผลจริง / แผน',data.actual===null||data.plan===null?'—':`${data.actual.toFixed(1)}% / ${data.plan.toFixed(1)}%`]];
    metrics.forEach((item,index)=>{const x=90+index*410;ctx.fillStyle='#f1f6fc';ctx.fillRect(x,225,380,112);ctx.strokeStyle='#d7e4f2';ctx.strokeRect(x,225,380,112);ctx.fillStyle='#61758b';ctx.font='18px Tahoma, sans-serif';ctx.fillText(item[0],x+18,261);ctx.fillStyle='#175a9f';ctx.font='700 26px Tahoma, sans-serif';ctx.fillText(item[1],x+18,307);});
    ctx.fillStyle='#173f79';ctx.font='700 26px Tahoma, sans-serif';ctx.fillText('แผนตั้งต้น ผลจริง และแนวโน้ม',90,chartTop-28);
    const chartMarkup=project?projectCurve(project,data.month,380):overallCurve(data.projects,data.month,380);const chartInner=chartMarkup.match(/<svg[^>]*>([\s\S]*?)<\/svg>/)?.[1]||'';
    if(chartInner){const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="707" viewBox="0 0 860 380">${chartInner}</svg>`;const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));try{const image=new Image();image.src=url;await image.decode();ctx.drawImage(image,90,chartTop,1600,chartHeight);}finally{URL.revokeObjectURL(url);}}
    ctx.fillStyle='#173f79';ctx.font='700 26px Tahoma, sans-serif';ctx.fillText('ผลการดำเนินงานและงบประมาณรายโครงการ',90,tableTop);
    const columns=[90,570,790,1000,1200,1415,1580],headers=['โครงการ','งบจัดสรร','แผนสะสม','ผลสะสม','จ่ายสะสม','ผลต่าง','สถานะ'];ctx.fillStyle='#eaf1f9';ctx.fillRect(90,tableTop+20,1620,58);ctx.font='700 17px Tahoma, sans-serif';ctx.fillStyle='#244b73';headers.forEach((label,index)=>ctx.fillText(label,columns[index]+8,tableTop+56));
    data.rows.forEach((row,index)=>{const y=tableTop+78+index*rowHeight;ctx.fillStyle=index%2?'#fff':'#f8fbff';ctx.fillRect(90,y,1620,rowHeight);ctx.strokeStyle='#e0e8f1';ctx.beginPath();ctx.moveTo(90,y+rowHeight);ctx.lineTo(1710,y+rowHeight);ctx.stroke();const values=[row.project.name,`${money(row.project.budget)} บาท`,row.planned===null?'—':`${row.planned.toFixed(1)}%`,row.actual===null?'ยังไม่รายงาน':`${row.actual.toFixed(1)}%`,`${money(row.paid)} บาท`,row.difference===null?'—':`${row.difference>0?'+':''}${row.difference.toFixed(1)} จุด`,row.report?row.projectStatus.label:`รอรายงาน ${monthLabel(data.month)}`];ctx.font='16px Tahoma, sans-serif';ctx.fillStyle='#263f5b';values.forEach((value,col)=>ctx.fillText(String(value),columns[col]+8,y+31,Math.max(70,(columns[col+1]||1710)-columns[col]-18)));});
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('ไม่สามารถสร้างภาพได้');const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`รายงานภาพรวม-${ui.year}-${data.month}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);notice('ดาวน์โหลดรายงานภาพรวม PNG แล้ว');
    } finally {db=storedDb;}
  }
  function renderDashboardContent(isPreview = false) {
    const allProjects=yearProjects();
    const selectedProject=allProjects.find(project=>project.id===ui.dashboardProject)||null;
    if(!selectedProject)ui.dashboardProject='';
    const data = dashboardData(selectedProject?.id||'');
    const centralDocs = db.documents.filter(item=>item.year===ui.year&&item.scope==='central'&&item.visible);
    const selectedRow=data.rows.find(row=>row.project.id===selectedProject?.id)||null;
    const attentionRows=[...data.attention].sort((a,b)=>{
      const score=row=>row.projectStatus.label==='ช้ากว่าแผน'?3:(row.latest?.forecastMonth&&row.plan?.baselineEnd&&row.latest.forecastMonth>row.plan.baselineEnd)?2:0;
      return score(b)-score(a);
    }).slice(0,5);
    const unreportedRows=data.rows.filter(row=>!row.report);
    const monthChoices=monthChoicesForYear(ui.year,'');
    const selectedSdg=data.sdgSummary.find(item=>item.id===ui.dashboardSdg)||data.sdgSummary[0]||null;
    ui.dashboardSdg=selectedSdg?.id||'';
    const sdgProjectCount=data.projects.filter(project=>getPlan(project.id)?.sdgs?.length).length;
    const sdgReportedCount=new Set(data.sdgResults.filter(item=>item.report&&(item.report.indicatorActual||item.report.sdgOutcome)).map(item=>item.project.id)).size;
    const maxSdgProjects=Math.max(1,...data.sdgSummary.map(item=>item.projects.length));
    const sdgRows=data.sdgSummary.map(item=>`<button type="button" class="dashboard-sdg-card ${selectedSdg?.id===item.id?'selected':''}" style="--sdg-color:${sdgColors[item.id]||'#15956e'}" data-dashboard-sdg="${esc(item.id)}"><span>${esc(item.id)}</span><strong>${esc(item.name)}</strong><b>${item.projects.length} โครงการ</b><i><em style="width:${Math.max(8,item.projects.length/maxSdgProjects*100)}%"></em></i></button>`).join('');
    const sdgDetails=selectedSdg?data.sdgResults.filter(item=>item.id===selectedSdg.id).map(item=>`<div class="dashboard-sdg-detail"><strong>${dashboardProjectLink(item.project)}</strong><span>${esc(item.plan.indicator||'ยังไม่ได้กำหนดตัวชี้วัด')}${item.plan.target?` · เป้าหมาย ${esc(item.plan.target)}`:''}</span><b>${item.report?`ผลล่าสุด ${esc(item.report.indicatorActual||item.report.sdgOutcome||'รายงานแล้ว')} · ${monthLabel(item.report.month)}`:`ยังไม่มีรายงานผลถึง ${monthLabel(data.month)}`}</b></div>`).join(''):'<div class="soft-note">ยังไม่มีโครงการเลือก SDG ในปีนี้</div>';
    const projectOverBudget=data.rows.filter(row=>row.remaining<0);
    const schedule=(selectedRow?.plan?selectedRow:null)||data.scheduleFocus;
    const scheduleForecast=schedule?.latest?.forecastMonth||schedule?.plan?.baselineEnd;
    const scheduleExtended=Boolean(schedule&&scheduleForecast&&schedule.plan.baselineEnd&&scheduleForecast>schedule.plan.baselineEnd);
    const scheduleLate=Boolean(schedule&&(scheduleExtended||schedule.projectStatus.label==='ช้ากว่าแผน'));
    const scheduleMonthsLate=scheduleExtended?Math.max(0,monthsBetween(schedule.plan.baselineEnd,scheduleForecast).length-1):0;
    const notReported=data.rows.filter(row=>!row.report).length;
    const extendedCount=data.rows.filter(row=>row.latest?.forecastMonth&&row.plan?.baselineEnd&&row.latest.forecastMonth>row.plan.baselineEnd).length;
    const attentionCount=new Set(data.attention.map(row=>row.project.id)).size;
    const reportedDifferences=data.rows.map(row=>row.difference).filter(value=>value!==null);
    const behindDifferences=reportedDifferences.filter(value=>value < -5);
    const aheadDifferences=reportedDifferences.filter(value=>value > 5);
    const nearPlanCount=reportedDifferences.length-behindDifferences.length-aheadDifferences.length;
    const lateCount=behindDifferences.length;
    const completedCount=data.rows.filter(row=>row.actual!==null&&row.actual>=100).length;
    const aheadOrOnTrackCount=aheadDifferences.length+nearPlanCount;
    const performanceGap=data.actual===null||data.plan===null?null:data.actual-data.plan;
    const meanPointGap=values=>values.length?(values.reduce((sum,value)=>sum+Math.abs(value),0)/values.length).toFixed(1):'—';
    const paceSummary=reportedDifferences.length?`ช้ากว่าแผนเฉลี่ย ${meanPointGap(behindDifferences)} จุด (${behindDifferences.length} โครงการ) · เร็วกว่าแผนเฉลี่ย ${meanPointGap(aheadDifferences)} จุด (${aheadDifferences.length} โครงการ) · ใกล้แผน ${nearPlanCount} โครงการ`:'ยังไม่มีรายงานสำหรับเปรียบเทียบผลกับแผน';
    const decisionMessage=lateCount||extendedCount?`ภาพรวมใกล้แผน แต่ ${attentionCount} โครงการควรติดตามเรื่องเวลา`:notReported?`มี ${notReported} โครงการยังไม่ส่งรายงาน ${monthLabel(data.month)}`:'ภาพรวมโครงการและงบประมาณเป็นไปตามแผน';
    const executiveStatusLabel=attentionCount?`${attentionCount} โครงการที่ต้องผลักดัน`:notReported?`${notReported} โครงการรอรายงาน`:'สถานะปกติ';
    const docsMarkup=`<section class="card dashboard-documents"><div class="starter-section-title"><div><h2>เอกสารส่วนกลางที่แอดมินเผยแพร่</h2><p>เอกสารอ้างอิงที่ทุกโครงการใช้ร่วมกัน · ปีงบประมาณ ${ui.year}</p></div><span class="status-pill ${centralDocs.length?'saved':'pending'}">${centralDocs.length?`${centralDocs.length} เอกสาร`:'รอเพิ่มเอกสาร'}</span></div><div class="dashboard-document-grid">${centralDocs.map(item=>`<div class="dashboard-document"><span class="document-icon">▤</span><div><strong>${esc(item.title)}</strong><small>${esc(item.category)} · ${esc(item.number)} · ${esc(item.fileName||'เอกสารอ้างอิง')}</small></div>${item.blobId?`<button class="mini-btn" data-open-file="${item.blobId}">ดูข้อมูล</button>`:''}</div>`).join('')||emptyBox('ยังไม่มีเอกสารส่วนกลางที่เผยแพร่','เพิ่มเอกสารกลางได้ในหน้าจัดการระบบ')}</div></section>`;
    const attentionMarkup=`<section class="card dashboard-attention ${attentionCount?'needs-attention':''}"><div class="starter-section-title"><div><p class="eyebrow">ประเด็นจากรายงานและกำหนดการ</p><h2>เรื่องที่ต้องผลักดัน</h2><p>${attentionCount?`มี ${attentionCount} โครงการที่ควรติดตามถึง ${monthLabel(data.month)}`:'ไม่พบประเด็นเร่งติดตามในรอบนี้'}</p></div><span class="status-pill ${attentionCount?'pending':'saved'}">${attentionCount?'ต้องติดตาม':'ปกติ'}</span></div><div class="dashboard-attention-list">${attentionRows.map(row=>{const delayed=row.projectStatus.label==='ช้ากว่าแผน';const forecast=row.latest?.forecastMonth;const extension=forecast&&row.plan?.baselineEnd&&forecast>row.plan.baselineEnd;const message=delayed?`ตามหลังแผน ${Math.abs(row.difference).toFixed(1)} จุด${row.latest?.delay?` · ${esc(row.latest.delay)}`:''}`:extension?`คาดว่าจะเสร็จ ${monthLabel(forecast)} · เดิม ${monthLabel(row.plan.baselineEnd)}`:'ตรวจสอบความคืบหน้าและกำหนดการ';return `<div class="dashboard-attention-item"><span class="attention-dot"></span><div><strong>${dashboardProjectLink(row.project)}</strong><small>${message}</small><small class="dashboard-owner">ผู้รับผิดชอบ ${esc(row.owner)} · ติดตามภายในวันที่ 26</small></div>${isPreview?'<span class="readonly-pill">ตัวอย่าง</span>':`<button class="mini-btn" data-dashboard-project="${row.project.id}">ดูรายงาน</button>`}</div>`}).join('')||'<div class="soft-note">ยังไม่มีโครงการที่ต้องผลักดันจากข้อมูลรายงาน</div>'}</div></section>`;
    const unreportedMarkup=`<section class="card dashboard-unreported"><div class="starter-section-title"><div><p class="eyebrow">สถานะการส่งข้อมูล</p><h2>โครงการที่ยังไม่ได้รายงาน</h2><p>${unreportedRows.length?`${unreportedRows.length} โครงการยังไม่มีรายงานรอบ ${monthLabel(data.month)} · อาจดำเนินงานแล้วแต่ยังไม่ได้บันทึก`:`ส่งรายงานรอบ ${monthLabel(data.month)} ครบแล้ว`}</p></div><span class="status-pill ${unreportedRows.length?'pending':'saved'}">${unreportedRows.length?'รอตรวจสอบ':'ส่งครบแล้ว'}</span></div><div class="dashboard-unreported-list">${unreportedRows.map(row=>`<div class="dashboard-unreported-item"><span class="unreported-dot"></span><div><strong>${dashboardProjectLink(row.project)}</strong><small>ยังไม่มีรายงานรอบ ${monthLabel(data.month)}${row.latest?` · รายงานล่าสุด ${monthLabel(row.latest.month)}`:' · ยังไม่มีรายงานก่อนหน้า'}</small><small class="dashboard-owner">ผู้รับผิดชอบ ${esc(row.owner)}</small></div>${isPreview?'<span class="readonly-pill">ตัวอย่าง</span>':`<button class="mini-btn" data-dashboard-project="${row.project.id}">เปิดรายงาน</button>`}</div>`).join('')||'<div class="soft-note">ไม่มีโครงการค้างรายงานในรอบนี้</div>'}</div></section>`;
    const receiptWait=data.financeFollowUps.filter(item=>item.type==='receipt').reduce((sum,item)=>sum+safeNum(item.amount),0);
    const treasuryWait=data.financeFollowUps.filter(item=>item.type==='treasury').reduce((sum,item)=>sum+safeNum(item.amount),0);
    const financeRows=data.rows.map(row=>{const ratio=row.project.budget?row.paid/row.project.budget*100:null,barWidth=Math.min(100,Math.max(0,ratio||0)),balance=row.remaining<0?`เกินงบ ${money(Math.abs(row.remaining))} บาท`:`เหลือ ${money(row.remaining)} บาท`,work=row.actual===null?`ยังไม่รายงาน · แผน ${row.planned===null?'—':`${row.planned.toFixed(1)}%`}`:`ผลงาน ${row.actual.toFixed(1)}% · แผน ${row.planned===null?'—':`${row.planned.toFixed(1)}%`}`;return `<div class="dashboard-budget-project"><div class="dashboard-budget-project-head"><strong>${dashboardProjectLink(row.project)}</strong><b class="${ratio!==null&&ratio>100?'status-bad':''}">${ratio===null?'ยังไม่ตั้งงบ':`${ratio.toFixed(0)}%`}</b></div><div class="dashboard-budget-track ${ratio!==null&&ratio>100?'over-budget':''}"><i style="width:${barWidth}%"></i></div><div class="dashboard-budget-amount"><span>จ่าย ${money(row.paid)} / งบจัดสรร ${money(row.project.budget)} บาท</span><span class="${row.remaining<0?'status-bad':''}">${balance}</span></div><small>${work}</small></div>`;}).join('');
    const budgetBasis=selectedProject?`${esc(selectedProject.name)} · ข้อมูลถึง ${monthLabel(data.month)}`:`ทุกโครงการ · ข้อมูลถึง ${monthLabel(data.month)}`;
    const budgetStatusMarkup=`<section class="card dashboard-finance-status"><div class="starter-section-title"><div><h2>ความคืบหน้าการใช้งบ</h2><p>${budgetBasis} · จ่ายสะสมเทียบงบจัดสรร</p></div></div><div class="dashboard-finance-stats"><div><span>งบอนุมัติทั้งปี</span><strong>${data.annualBudget===undefined?'ยังไม่ตั้ง':`${money(data.annualBudget)} บาท`}</strong></div><div><span>จัดสรรให้โครงการ</span><strong>${money(data.allocation)} บาท</strong></div><div><span>จ่ายสะสม</span><strong>${money(data.paidAmount)} บาท</strong></div><div><span>เหลือจากงบจัดสรร</span><strong>${money(data.remaining)} บาท</strong></div></div><div class="dashboard-budget-heading"><strong>รายการโครงการ</strong><span>${data.rows.length} โครงการ · เลื่อนเพื่อดูรายการ</span></div><div class="dashboard-budget-list">${financeRows||'<div class="soft-note">ยังไม่มีโครงการในปีงบประมาณนี้</div>'}</div><div class="dashboard-finance-followup"><h3>จ่ายแล้วแต่รอหลักฐานในรอบนี้</h3><div><span>รอใบตรวจรับ</span><strong>${money(receiptWait)} บาท</strong></div><div><span>รอวางฎีกาใช้หนี้</span><strong>${money(treasuryWait)} บาท</strong></div><small>ยอดเหล่านี้รวมอยู่ในยอดจ่ายสะสมแล้ว</small></div></section>`;
    const scheduleProject=schedule?.project||selectedProject;
    const detailMarkup=schedule?.plan?`<section class="card dashboard-schedule ${scheduleLate?"schedule-late":""}"><div class="starter-section-title"><div><p class="eyebrow dashboard-schedule-eyebrow">${scheduleLate?'กำหนดเสร็จเทียบกับแผนตั้งต้น':'ข้อมูลกำหนดการโครงการ'}</p><h2>${selectedProject?'กำหนดการโครงการที่เลือก':'โครงการที่มีแนวโน้มล่าช้า'}</h2><p>${scheduleProject?dashboardProjectLink(scheduleProject):'เลือกโครงการจากตัวกรองด้านบน'}</p></div><span class="status-pill ${schedule.projectStatus.className}">${schedule.projectStatus.label}</span></div><div class="dashboard-schedule-grid"><div><span>เริ่มตามแผน</span><strong>${monthLabel(schedule.plan.baselineStart)}</strong></div><div><span>รายงานครั้งแรก</span><strong>${schedule.reports[0]?monthLabel(schedule.reports[0].month):'ยังไม่มีรายงาน'}</strong></div><div><span>เสร็จตามแผนตั้งต้น</span><strong>${monthLabel(schedule.plan.baselineEnd)}</strong></div><div><span>คาดว่าจะเสร็จ</span><strong>${monthLabel(schedule.latest?.forecastMonth||schedule.plan.baselineEnd)}</strong></div></div>${scheduleExtended?`<div class="schedule-alert">แนวโน้มล่าช้า · คาดว่าจะเสร็จ ${monthLabel(scheduleForecast)} · ช้ากว่าแผนตั้งต้น ${scheduleMonthsLate} เดือน</div>`:''}<p class="dashboard-schedule-note">ผู้รับผิดชอบ ${esc(schedule.owner)} · ${schedule.latest?.delay?esc(schedule.latest.delay):'ยังไม่มีประเด็นติดตามที่บันทึกไว้'}</p></section>`:`<section class="card dashboard-schedule"><h2>กำหนดการโครงการ</h2><p class="muted">เลือกโครงการเพื่อดูช่วงเวลาและเดือนคาดว่าจะเสร็จ</p></section>`;
    if(selectedProject) return `${heading('สรุปสำหรับผู้บริหาร', 'ภาพรวมงบและโครงการ', 'เจาะดูข้อมูลแผน ผลการดำเนินงาน และงบประมาณรายโครงการ', `<div class="dashboard-head-meta"><span class="readonly-pill">ถึง ${monthLabel(data.month)}</span>${isPreview?'<span class="status-pill pending">ข้อมูลตัวอย่าง · ไม่บันทึก</span>':''}</div>`)}
      <section class="card dashboard-toolbar dashboard-filterbar"><label>ปีงบประมาณ<select id="dashboard-year">${[ui.year-1,ui.year,ui.year+1].map(year=>`<option value="${year}" ${year===ui.year?'selected':''}>${year}</option>`).join('')}</select></label><label>ข้อมูลถึงรอบเดือน<select id="context-month">${monthChoices.map(key=>`<option value="${key}" ${data.month===key?'selected':''}>${monthLabel(key)}</option>`).join('')}</select></label><label>มุมมองโครงการ<select id="dashboard-project"><option value="">ทุกโครงการ · ภาพรวม</option>${allProjects.map(project=>`<option value="${project.id}" ${project.id===selectedProject.id?'selected':''}>${esc(project.name)}</option>`).join('')}</select></label><p class="dashboard-asof">สถานะข้อมูล: <strong>${data.reported.length} จาก 1 โครงการส่งรายงาน ${monthLabel(data.month)} แล้ว</strong> · ตัวเลขตัดยอดถึงเดือนนี้</p></section>
      ${isPreview?'<div class="dashboard-preview-note">ข้อมูลตัวอย่างสำหรับดูรูปแบบหน้าจอเท่านั้น ไม่ได้เพิ่มหรือเปลี่ยนข้อมูลจริงในเบราว์เซอร์</div>':''}
      ${dashboardProjectDetailMarkup(selectedProject,selectedRow,data,isPreview)}`;
    return `${heading('สรุปสำหรับผู้บริหาร', 'ภาพรวมงบและโครงการ', 'ภาพรวมทุกโครงการหรือเจาะดูโครงการเดียว ณ เดือนตัดยอดที่เลือก', `<div class="dashboard-head-meta"><span class="readonly-pill">ถึง ${monthLabel(data.month)}</span>${isPreview?'<span class="status-pill pending">ข้อมูลตัวอย่าง · ไม่บันทึก</span>':'<button class="btn quiet-btn" data-go="portfolio-output">ดูสรุปสำหรับประชุม →</button>'}</div>`)}
      <section class="card dashboard-toolbar dashboard-filterbar"><label>ปีงบประมาณ<select id="dashboard-year">${[ui.year-1,ui.year,ui.year+1].map(year=>`<option value="${year}" ${year===ui.year?'selected':''}>${year}</option>`).join('')}</select></label><label>ข้อมูลถึงรอบเดือน<select id="context-month">${monthChoices.map(key=>`<option value="${key}" ${data.month===key?'selected':''}>${monthLabel(key)}</option>`).join('')}</select></label><label>มุมมองโครงการ<select id="dashboard-project"><option value="" ${selectedProject?'':'selected'}>ทุกโครงการ · ภาพรวม</option>${allProjects.map(project=>`<option value="${project.id}" ${project.id===selectedProject?.id?'selected':''}>${esc(project.name)}</option>`).join('')}</select></label><p class="dashboard-asof">สถานะข้อมูล: <strong>${data.reported.length} จาก ${data.projects.length} โครงการส่งรายงาน ${monthLabel(data.month)} แล้ว</strong> · ตัวเลขตัดยอดถึงเดือนนี้</p></section>
      ${isPreview?'<div class="dashboard-preview-note">ข้อมูลตัวอย่างสำหรับดูรูปแบบหน้าจอเท่านั้น ไม่ได้เพิ่มหรือเปลี่ยนข้อมูลจริงในเบราว์เซอร์</div>':''}
      ${!data.projects.length?`${emptyBox('ยังไม่มีโครงการให้ติดตาม','เมื่อแอดมินเพิ่มโครงการ จะเห็นภาพรวมที่นี่','admin','ไปหน้าแอดมิน')}${docsMarkup}`:`<section class="card dashboard-executive-summary"><div><p class="eyebrow">สรุปสำหรับผู้บริหาร · ข้อมูลถึง ${monthLabel(data.month)}</p><h2>${decisionMessage}</h2><p>มี ${lateCount} โครงการล่าช้า · ${extendedCount} โครงการคาดว่าจะขยายเวลา · ${notReported} โครงการยังไม่ส่งรายงาน</p><p class="dashboard-pace-summary">${paceSummary} · คำนวณจาก ${reportedDifferences.length} โครงการที่มีรายงาน</p></div><span class="status-pill ${attentionCount?'pending':notReported?'pending':'saved'}">${executiveStatusLabel}</span></section>
      <section class="dashboard-status-section"><div class="dashboard-status-heading"><h2>สถานะการดำเนินงาน</h2><span>ข้อมูลถึง ${monthLabel(data.month)} · ปีงบประมาณ ${ui.year}</span></div><div class="dashboard-status-grid"><article class="dashboard-status-tile total"><span>โครงการทั้งหมด</span><strong>${data.projects.length} โครงการ</strong><small>โครงการในปีงบประมาณที่เลือก</small></article><article class="dashboard-status-tile delayed"><span>ช้ากว่าแผน</span><strong>${behindDifferences.length} โครงการ</strong><small>ผลต่ำกว่าแผนเกิน 5 จุด</small></article><article class="dashboard-status-tile not-reported"><span>ยังไม่รายงาน</span><strong>${notReported} โครงการ</strong><small>ยังไม่มีรายงานถึง ${monthLabel(data.month)}</small></article><article class="dashboard-status-tile on-track"><span>ตามแผนหรือเร็วกว่า</span><strong>${aheadOrOnTrackCount} โครงการ</strong><small>เร็วกว่า ${aheadDifferences.length} · ใกล้แผน ${nearPlanCount}</small></article><article class="dashboard-status-tile performance"><span>ผลเทียบแผนเฉลี่ย</span><strong>${performanceGap===null?'—':performanceGap<0?`ต่ำกว่าแผน ${Math.abs(performanceGap).toFixed(1)} จุด`:performanceGap>0?`สูงกว่าแผน ${performanceGap.toFixed(1)} จุด`:'เท่ากับแผน'}</strong><small>ผล ${data.actual===null?'—':`${data.actual.toFixed(1)}%`} · แผน ${data.plan===null?'—':`${data.plan.toFixed(1)}%`} · มีรายงาน ${data.reported.length} โครงการ</small></article><article class="dashboard-status-tile completed"><span>เสร็จครบ 100%</span><strong>${completedCount} โครงการ</strong><small>นับจากผลสะสมที่รายงานแล้ว</small></article></div></section>
      <section class="dashboard-financial-kpis"><div class="dashboard-status-heading"><h2>ภาพรวมงบประมาณ</h2><span>ข้อมูลถึง ${monthLabel(data.month)} · ปีงบประมาณ ${ui.year}</span></div><div class="starter-kpis dashboard-kpis executive-kpis dashboard-finance-kpis"><div class="metric-budget"><span>งบอนุมัติทั้งปี ${ui.year}</span><strong>${data.annualBudget===undefined?'—':`${(data.annualBudget/1000000).toFixed(2)} ล้านบาท`}</strong><small>จัดสรรแล้ว ${money(data.allocation)} · เหลือยังไม่จัดสรร ${money(data.annualBudget===undefined?0:data.annualBudget-data.allocation)} บาท</small></div><div class="metric-spent"><span>จ่ายสะสมถึง ${monthLabel(data.month)}</span><strong>${(data.paidAmount/1000000).toFixed(2)} ล้านบาท</strong><small>${data.annualBudget?`${(data.paidAmount/data.annualBudget*100).toFixed(1)}% ของงบอนุมัติ`:''} · คงเหลือจากงบจัดสรร ${money(data.remaining)} บาท</small></div></div></section>
      <div class="dashboard-decision-grid dashboard-visual-grid"><section class="card dashboard-chart-card"><div class="starter-section-title"><div><h2>แผนตั้งต้น ผลจริง และแนวโน้ม</h2><p>เส้นตั้งแสดงรอบรายงาน ${monthLabel(data.month)}</p><small class="dashboard-data-timestamp">ข้อมูล ณ ${now()}</small></div><span class="readonly-pill">ถึง ${monthLabel(data.month)}</span></div>${selectedProject?projectCurve(selectedProject,data.month,300):overallCurve(data.projects,data.month,300)}<div class="chart-key"><span><i class="base"></i>แผนตั้งต้น</span><span><i class="actual"></i>ผลจริง</span><span><i class="forecast"></i>คาดการณ์</span><span><i class="current-month-key"></i>เดือนรายงาน</span></div><p class="dashboard-chart-note">คาดการณ์อิงรูปแบบแผนรายเดือนและปรับจุดเริ่มจากผลจริงล่าสุด · หากคาดว่าจะเสร็จช้ากว่าแผน จะขยายแนวโน้มไปถึงเดือนที่แจ้งไว้ · เป็นค่าประมาณ ไม่ใช่ผลรายงาน</p></section>${budgetStatusMarkup}</div>
      <section class="card dashboard-comparison"><div class="starter-section-title"><div><h2>${selectedProject?`รายละเอียดโครงการที่เลือก · ปีงบประมาณ ${ui.year}`:`เปรียบเทียบทุกโครงการ · ปีงบประมาณ ${ui.year}`}</h2><p>ตัวเลขทุกแถวตัดยอด ณ ${monthLabel(data.month)} · แสดงผลงานและงบแยกกัน</p></div><span class="readonly-pill">${data.projects.length} โครงการ</span></div><div class="table-scroll"><table class="starter-table dashboard-table"><thead><tr><th>โครงการ</th><th>งบปีนี้</th><th>แผนสะสม</th><th>ผลสะสม</th><th>ต่างจากแผน</th><th>จ่ายแล้ว</th><th>คาดเสร็จ</th><th>สถานะ</th><th></th></tr></thead><tbody>${data.rows.map(row=>`<tr class="${row.project.id===selectedProject?.id?'selected-project-row':''}"><td><strong>${dashboardProjectLink(row.project)}</strong><small class="dashboard-table-owner">${esc(row.owner)}</small></td><td>${(row.project.budget/1000000).toFixed(2)} ล้านบาท</td><td>${row.planned===null?'—':`${row.planned.toFixed(1)}%`}</td><td>${row.actual===null?'<span class="status-pending">ยังไม่รายงาน</span>':`${row.actual.toFixed(1)}%`}</td><td class="${row.difference===null?'status-pending':row.difference < -5?'status-bad':row.difference>5?'status-good':''}">${row.difference===null?'—':`${row.difference>0?'+':''}${row.difference.toFixed(1)} จุด`}</td><td>${(row.paid/1000000).toFixed(2)} ล้านบาท</td><td>${row.latest?.forecastMonth?monthLabel(row.latest.forecastMonth):row.plan?monthLabel(row.plan.baselineEnd):'—'}</td><td class="${row.projectStatus.className}">${row.report?row.projectStatus.label:`ยังไม่รายงาน ${monthLabel(data.month)}`}</td><td>${isPreview?'<span class="readonly-pill">ตัวอย่าง</span>':`<button class="mini-btn" data-dashboard-project="${row.project.id}">ดูรายงาน</button>`}</td></tr>`).join('')}</tbody></table></div></section>
      <div class="dashboard-decision-grid dashboard-followup-grid">${attentionMarkup}${detailMarkup}${unreportedMarkup}</div>
      <div class="dashboard-lower-grid"><section class="card dashboard-sdg"><div class="starter-section-title"><div><h2>SDG จากแผนสู่ผลลัพธ์</h2><p>${selectedProject?`ผลของ ${esc(selectedProject.name)}`:'ภาพรวม SDG ของทุกโครงการ'} · ข้อมูลตามปีงบและเดือนที่เลือก</p></div></div><div class="dashboard-sdg-metrics"><div><strong>${sdgProjectCount}</strong><small>โครงการเลือก SDG</small></div><div><strong>${data.sdgSummary.length}</strong><small>เป้าหมาย SDG ที่เกี่ยวข้อง</small></div><div><strong>${sdgReportedCount}</strong><small>โครงการมีผลรายงาน</small></div></div><div class="dashboard-sdg-layout"><div><h3>เลือก SDG เพื่อดูโครงการและผลลัพธ์</h3><div class="dashboard-sdg-list">${sdgRows||'<div class="soft-note">ยังไม่มีโครงการเลือก SDG</div>'}</div></div><div class="dashboard-sdg-results" style="--sdg-color:${selectedSdg?sdgColors[selectedSdg.id]||'#15956e':'#15956e'}"><h3>${selectedSdg?`${esc(selectedSdg.id)} · ${esc(selectedSdg.name)}`:'รายละเอียดผลลัพธ์'}</h3>${sdgDetails}</div></div><p class="muted">แสดงผลรายโครงการแยกตามตัวชี้วัด ไม่รวมตัวเลขข้ามหน่วยเข้าด้วยกัน</p></section>${docsMarkup}</div>${dashboardReportMarkup(data,selectedProject,isPreview)}`}`;
  }
  function renderArchive() {
    const archiveProject = ui.archiveProject || '';
    const yearProjectsForArchive = db.projects.filter(project=>project.year===ui.year);
    const reports = db.reports.filter(report => db.projects.some(project=>project.id===report.projectId&&project.year===ui.year&&(!archiveProject||project.id===archiveProject))).sort((a,b)=>b.month.localeCompare(a.month));
    const drafts = db.reportDrafts.filter(draft => db.projects.some(project=>project.id===draft.projectId&&project.year===ui.year&&(!archiveProject||project.id===archiveProject))).sort((a,b)=>b.month.localeCompare(a.month));
    return `${heading('ดูย้อนหลัง', 'รายงานย้อนหลัง', 'เลือกรายงานของแต่ละเดือนเพื่อดูสรุป พิมพ์ หรือบันทึกเป็น PDF ด้วยเบราว์เซอร์')}${controls(false)}
      <div class="soft-note warn">ต้นแบบเก็บข้อมูลและไฟล์แนบในเบราว์เซอร์นี้ แต่ยังไม่สร้างไฟล์ PDF อัตโนมัติและยังไม่เก็บ PDF บน Google Drive</div>
      <section class="card"><div class="starter-section-title"><div><h2>ภาพรวมทั้งงบประมาณ</h2><p>คำนวณใหม่จากข้อมูลปีและเดือนที่เลือก</p></div></div><button class="btn primary-btn" data-go="portfolio-output">เปิดสรุปภาพรวม</button></section>
      ${drafts.length?`<section class="card draft-inbox"><div class="starter-section-title"><div><h2>ร่างที่ยังไม่ได้ส่ง</h2><p>${drafts.length} รายการ · ยังไม่นับเป็นรายงานผลที่ส่งแล้ว</p></div><span class="status-pill status-pending">ต้องทำต่อ</span></div><div class="file-list">${drafts.map(draft=>{const project=db.projects.find(item=>item.id===draft.projectId);return `<div class="file-item"><div><strong>${esc(project?.name||'โครงการ')} · ${monthLabel(draft.month)}</strong><small>บันทึกร่าง ${esc(draft.savedAt)} · กลับไปทำต่อก่อนวันที่ 26</small></div><button class="btn primary-btn" data-follow-page="report" data-project-id="${draft.projectId}" data-follow-month="${draft.month}">ทำร่างต่อ</button></div>`}).join('')}</div></section>`:''}
      <section class="card"><div class="starter-section-title"><div><h2>รายงานรายโครงการ</h2><p>${reports.length} รายการ · เลือกโครงการเพื่อค้นหารายงานได้เร็วขึ้น</p></div><label class="archive-project-filter">โครงการ<select id="archive-project"><option value="">ทุกโครงการ</option>${yearProjectsForArchive.map(project=>`<option value="${project.id}" ${archiveProject===project.id?'selected':''}>${esc(project.name)}</option>`).join('')}</select></label></div><div class="file-list">${reports.map(report=>{const project=db.projects.find(item=>item.id===report.projectId);return `<div class="file-item"><div><strong>${esc(project?.name || 'โครงการที่ถูกลบ')} · ${monthLabel(report.month)}</strong><small>ฉบับ ${report.version} · แก้ไขล่าสุด ${esc(report.updatedAt)} · ผลสะสม ${progress(report.phases).toFixed(1)}%</small></div><div class="btn-group"><button class="mini-btn" data-open-report="${report.id}">ดูรายงาน</button><button class="mini-btn" data-follow-page="report" data-project-id="${report.projectId}" data-follow-month="${report.month}">แก้รายงาน</button><button class="mini-btn danger" data-delete-report="${report.id}">ย้ายไปถังพัก</button></div></div>`}).join('') || emptyBox('ยังไม่มีรายงานในตัวกรองนี้', 'เลือกโครงการอื่น หรือบันทึกรายงานรายเดือนก่อน')}</div></section>`;
  }
  function selectedOutputReport() { return db.reports.find(report=>report.id===ui.reportId) || getReport(ui.projectId,ui.month); }
  function renderProjectOutput() {
    const report = selectedOutputReport();
    const project = db.projects.find(item=>item.id===report?.projectId);
    if (!report || !project) return `${heading('สรุปรายโครงการ', 'ยังไม่มีรายงาน', 'บันทึกรายงานก่อนแล้วจึงเปิดสรุป')}${emptyBox('ยังไม่มีรายงานที่เลือก', 'กลับไปกรอกผลรายเดือน', 'report', 'ไปกรอกรายงาน')}`;
    const monthPaid = paid(report);
    const selectedPhotos = (report.attachments || []).filter(file=>file.isImage&&file.featured).slice(0,3);
    const images = (report.attachments || []).filter(file=>file.isImage);
    const plan = getPlan(project.id);
    const relatedSdgs = (plan?.sdgs || []).map(id => {
      const option = sdgOptions.find(([optionId]) => optionId === id);
      return { id, name: option?.[1] || '', rationale: plan?.sdgRationales?.[id] || '' };
    });
    const monthStatus = status(project,report.month);
    const outputExpenses=readExpenseDetails({get:()=>null,has:()=>false},plan,report);
    const procurementSummary=outputExpenses.items.map((item,index)=>{const amount=outputExpenses.amounts[index]||0,proofs=(report.attachments||[]).filter(file=>file.expenseIndex===index),status=item.type==='procurement'?(outputExpenses.received[index]?'ตรวจรับแล้ว':'รอตรวจรับ'):item.type==='advance'?(outputExpenses.treasuryCleared[index]?'วางฎีกาใช้หนี้แล้ว':'ยังไม่วางฎีกา'):'ไม่ต้องตรวจรับ/วางฎีกา';return `<div class="output-procurement-row"><span class="expense-order">${index+1}</span><b>${esc(item.name||`รายการ ${index+1}`)}<small>${expenseTypeNames[item.type]}</small></b><span class="expense-proof-status">${status}${proofs.length?` · หลักฐาน ${proofs.length} ไฟล์`:''}</span><strong>${money(amount)} บาท</strong></div>`;}).join('');
    return `${heading('ผลลัพธ์หลังบันทึก', 'รายงานโครงการพร้อมใช้', 'เลือกภาพเด่นและแก้คำบรรยายก่อนพิมพ์', `<span class="status-pill saved">${monthLabel(report.month)} · ฉบับ ${report.version}</span>`)}
      <div class="screen-controls starter-actions" style="margin:0 0 18px">${ui.previewReport?'<button class="btn quiet-btn" data-preview-report-back>← กลับไปดูโครงการ</button>':'<button class="btn quiet-btn" data-go="report">← กลับไปแก้รายงาน</button>'}<button class="btn quiet-btn" data-go="archive">รายงานย้อนหลัง</button><button class="btn quiet-btn" data-save-image>ดาวน์โหลดเป็นรูป PNG</button><button class="btn primary-btn" data-print>พิมพ์ / บันทึก PDF</button></div>
      <section class="card screen-controls"><div class="starter-section-title"><div><h2>เลือกภาพที่จะโชว์ในรายงาน</h2><p>เก็บภาพทุกภาพไว้ในรายงานเดือนนี้ แต่เลือกภาพเด่นได้สูงสุด 3 ภาพ</p></div><span class="readonly-pill">${selectedPhotos.length} / 3 ภาพ</span></div>
      ${images.length ? `<div class="photo-grid">${images.map(file=>`<div class="photo-choice ${file.featured?'selected':''}"><img data-blob-id="${file.blobId}" alt="${esc(file.caption||file.name)}"><button data-toggle-photo="${file.id}">${file.featured?'✓ แสดงในรายงาน':'เลือกแสดง'}</button><input data-photo-caption="${file.id}" aria-label="คำบรรยาย ${esc(file.name)}" value="${esc(file.caption||file.name)}"></div>`).join('')}</div>` : emptyBox('ยังไม่มีรูปภาพของเดือนนี้', 'กลับไปแนบภาพในหน้ารายงานรายเดือน')}
      </section>
      <article class="report-sheet print-target project-monthly-report-sheet"><header><small>MAHIDOL UNIVERSITY · SUSTAINABILITY</small><h2 class="project-report-title">สรุปผลการดำเนินงานประจำเดือน</h2><p class="project-report-project-meta">${esc(project.name)} · ปีงบประมาณ ${project.year} · ${monthLabel(report.month)}</p></header>
        <div class="project-report-kpis"><div><span>ผลเทียบแผน</span><strong>${(progress(report.phases)-plannedAt(project.id,report.month)).toFixed(1)} จุด</strong><small>ผล ${progress(report.phases).toFixed(1)}% · แผน ${plannedAt(project.id,report.month).toFixed(1)}%</small></div><div><span>งบโครงการ</span><strong>${money(project.budget||0)} บาท</strong><small>จัดสรรตามแผนโครงการ</small></div><div><span>จ่ายเดือนนี้</span><strong>${money(monthPaid||paid(report))} บาท</strong><small>ยอดถึง ${monthLabel(report.month)}</small></div><div><span>จ่ายสะสม · คงเหลือ</span><strong>${money(paidThrough(project.id,report.month))} บาท</strong><small>คงเหลือ ${money(Math.max(0,(project.budget||0)-paidThrough(project.id,report.month)))} บาท</small></div></div>
        <div class="project-report-main-grid"><section class="project-report-chart report-reading-card"><h3>แผนตั้งต้น ผลจริง และแนวโน้ม</h3>${projectCurve(project,report.month,280)}<div class="chart-key"><span><i class="base"></i>แผนตั้งต้น</span><span><i class="actual"></i>ผลจริง</span><span><i class="forecast"></i>คาดการณ์</span><span><i class="current-month-key"></i>เดือนของรายงานนี้</span></div></section>
        <div class="project-report-main-details"><section class="report-reading-card project-report-summary-card"><h3>สรุปผลเดือนนี้</h3><p>${esc(report.summaryText || 'ไม่ได้ระบุ')}</p></section>
        <div class="project-report-two-col report-columns"><section class="report-reading-card"><h3>วัตถุประสงค์</h3><p>${esc(plan?.objective || 'ยังไม่ได้ระบุ')}</p><h3>ผลที่คาดว่าจะได้รับ</h3><p>${esc(plan?.expectedOutcome || 'ยังไม่ได้ระบุ')}</p></section><section class="report-reading-card"><h3>ประเด็นติดตามและแนวทางแก้ไข</h3><p>${esc(report.delay || 'ไม่มีประเด็นที่ระบุ')}</p><h3>เดือนที่คาดว่าจะแล้วเสร็จ</h3><p>${monthLabel(report.forecastMonth || plan?.baselineEnd)}</p></section><div class="project-report-result-sdg-grid"><section class="report-reading-card project-report-result-card"><h3>ผลลัพธ์และตัวชี้วัด</h3><p>${esc(report.sdgOutcome || 'ยังไม่ได้ระบุผลลัพธ์ประจำเดือน')}</p>${plan?.indicator?`<div class="report-result-metric"><span>ผลเดือนนี้ · ${monthLabel(report.month)}</span><strong>${esc(report.indicatorActual||'ยังไม่ได้รายงานผลตัวชี้วัด')}${report.indicatorActual&&plan.indicatorUnit?` ${esc(plan.indicatorUnit)}`:''}</strong><small>${esc(plan.indicator)} · เป้าหมาย ${esc(plan.target||'ยังไม่ได้กำหนด')}</small></div>`:''}</section><section class="report-reading-card report-related-sdgs"><h3>SDG ที่เกี่ยวข้อง</h3>${relatedSdgs.length?`<div class="report-sdg-list">${relatedSdgs.map(item=>`<div class="report-sdg-item" style="--sdg-color:${sdgColors[item.id]||'#2868a8'}"><span>${esc(item.id)}</span><div><strong>${esc(item.name)}</strong>${item.rationale?`<small>${esc(item.rationale)}</small>`:''}</div></div>`).join('')}</div>`:'<p>โครงการนี้ยังไม่ได้เลือก SDG ที่เกี่ยวข้อง</p>'}</section></div></div></div>
        <div class="project-report-bottom-grid">${procurementSummary?`<section class="output-procurement"><h3>สรุปค่าใช้จ่ายเดือนนี้</h3><div class="output-procurement-list">${procurementSummary}</div><div class="output-procurement-total"><span>รวมจ่ายเดือนนี้</span><strong>${money(monthPaid||0)} บาท</strong></div></section>`:''}
        ${selectedPhotos.length ? `<section class="project-report-photos report-reading-card"><h3>ภาพกิจกรรมที่เลือกแสดง</h3><div class="report-photo-grid">${selectedPhotos.map(file=>`<figure><img data-blob-id="${file.blobId}" alt="${esc(file.caption||file.name)}"><figcaption>${esc(file.caption||file.name)}</figcaption></figure>`).join('')}</div></section>` : ''}</div>
        <footer>ต้นแบบ · ข้อมูลที่ผู้ทดลองกรอกในเบราว์เซอร์เครื่องนี้ · แก้ไขล่าสุด ${esc(report.updatedAt)} · ฉบับ ${report.version}</footer></article>`;
  }
  async function downloadProjectReportImage(options = {}) {
    const source=options.source||document.querySelector('.project-monthly-report-sheet')||document.querySelector('.report-sheet.print-target');
    if(!source)return notice('ไม่พบหน้ารายงานตัวอย่าง กรุณาเปิดรายงานก่อนดาวน์โหลด');
    const original={width:source.style.width,maxWidth:source.style.maxWidth,margin:source.style.margin};
    source.classList.add('export-layout');
    source.style.width='281mm';source.style.maxWidth='none';source.style.margin='0 auto';
    try {
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      if(document.fonts?.ready)await document.fonts.ready;
      return await buildProjectReportImage({...options,source});
    } finally {
      source.style.width=original.width;source.style.maxWidth=original.maxWidth;source.style.margin=original.margin;
      source.classList.remove('export-layout');
    }
  }

  async function buildProjectReportImage(options = {}) {
    const report = selectedOutputReport();
    const project = db.projects.find(item => item.id === report?.projectId);
    if (!options.source && (!report || !project)) return notice('ไม่พบรายงานสำหรับสร้างไฟล์รูปภาพ');
    const source = options.source || document.querySelector('.project-monthly-report-sheet') || document.querySelector('.report-sheet.print-target');
    if (!source) return notice('ไม่พบหน้ารายงานตัวอย่าง กรุณาเปิดรายงานก่อนดาวน์โหลด');
    await ensureReportImagesReady(source);

    // Convert the rendered report to vector shapes/text. SVG foreignObject taints
    // a canvas in Chromium, so avoid embedding HTML and keep the SVG export-safe.
    const rootRect = source.getBoundingClientRect();
    const captureWidth = Math.max(1, Math.ceil(rootRect.width));
    const captureHeight = Math.max(1, Math.ceil(source.scrollHeight));
    const escXml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    const relativeRect = element => {
      const rect = element.getBoundingClientRect();
      return { x: rect.left - rootRect.left, y: rect.top - rootRect.top, width: rect.width, height: rect.height };
    };
    const imageData = new Map();
    await Promise.all([...source.querySelectorAll('img')].map(async image => {
      try {
        const src = image.currentSrc || image.src;
        if (!src) return;
        if (src.startsWith('data:')) { imageData.set(image, src); return; }
        const blob = await fetch(src).then(response => response.blob());
        const data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        imageData.set(image, data);
      } catch { /* An unavailable optional image is omitted from the PNG. */ }
    }));
    const transparent = color => !color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)';
    const renderTextNode = (node, parent) => {
      const text = node.nodeValue || '';
      if (!text.trim()) return '';
      const style = getComputedStyle(parent);
      const fontSize = parseFloat(style.fontSize) || 12;
      const lineMap = new Map();
      const segmenter = new Intl.Segmenter('th', { granularity: 'grapheme' });
      for (const part of segmenter.segment(text)) {
        const range = document.createRange();
        range.setStart(node, part.index);
        range.setEnd(node, part.index + part.segment.length);
        const rect = range.getBoundingClientRect();
        const key = Math.round(rect.top * 2) / 2;
        let line = lineMap.get(key);
        if (!line) { line = { text: '', left: rect.left, right: rect.right, top: rect.top }; lineMap.set(key, line); }
        line.text += part.segment;
        if (rect.width) { line.left = Math.min(line.left, rect.left); line.right = Math.max(line.right, rect.right); }
      }
      const anchor = style.textAlign === 'center' ? 'middle' : (style.textAlign === 'right' || style.textAlign === 'end') ? 'end' : 'start';
      return [...lineMap.values()].map(line => {
        const x = anchor === 'middle' ? (line.left + line.right) / 2 : anchor === 'end' ? line.right : line.left;
        const baseline = line.top - rootRect.top + fontSize * 0.86;
        const value = style.textTransform === 'uppercase' ? line.text.toLocaleUpperCase() : line.text;
        return `<text x="${(x - rootRect.left).toFixed(2)}" y="${baseline.toFixed(2)}" text-anchor="${anchor}" fill="${escXml(style.color)}" font-family="${escXml(style.fontFamily)}" font-size="${fontSize}" font-weight="${escXml(style.fontWeight)}" font-style="${escXml(style.fontStyle)}" letter-spacing="${escXml(style.letterSpacing)}">${escXml(value)}</text>`;
      }).join('');
    };
    const renderNode = (node, parent = null) => {
      if (node.nodeType === Node.TEXT_NODE) return parent ? renderTextNode(node, parent) : '';
      if (!(node instanceof Element)) return '';
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) === 0) return '';
      const box = relativeRect(node);
      if (node instanceof SVGElement) {
        // The chart relies on stylesheet classes (for example fill:none and
        // stroke colors). Those styles are not available in the standalone SVG
        // image used by the PNG renderer, so inline the rendered SVG styles.
        const clone = node.cloneNode(true);
        const svgPaintProperties = [
          'color', 'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width',
          'stroke-opacity', 'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap',
          'stroke-linejoin', 'stroke-miterlimit', 'opacity', 'font-family',
          'font-size', 'font-weight', 'font-style', 'text-anchor', 'dominant-baseline',
          'letter-spacing', 'paint-order', 'vector-effect', 'clip-path', 'mask',
          'marker-start', 'marker-mid', 'marker-end', 'visibility'
        ];
        const originalElements = [node, ...node.querySelectorAll('*')];
        const clonedElements = [clone, ...clone.querySelectorAll('*')];
        originalElements.forEach((element, index) => {
          const computed = getComputedStyle(element);
          const target = clonedElements[index];
          for (const property of svgPaintProperties) {
            const value = computed.getPropertyValue(property);
            if (value) target.style.setProperty(property, value);
          }
        });
        const viewBox = node.getAttribute('viewBox') || `0 0 ${box.width} ${box.height}`;
        clone.setAttribute('x', box.x);
        clone.setAttribute('y', box.y);
        clone.setAttribute('width', box.width);
        clone.setAttribute('height', box.height);
        clone.setAttribute('viewBox', viewBox);
        clone.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        return new XMLSerializer().serializeToString(clone);
      }
      if (node.tagName === 'IMG') {
        const href = imageData.get(node);
        if (!href) return '';
        const radius = parseFloat(style.borderTopLeftRadius) || 0;
        const imageMarkup = `<image x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" href="${href}" preserveAspectRatio="${style.objectFit === 'contain' ? 'xMidYMid meet' : 'xMidYMid slice'}"/>`;
        return radius ? `<clipPath id="clip-${Math.round(box.x)}-${Math.round(box.y)}"><rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="${radius}"/></clipPath><g clip-path="url(#clip-${Math.round(box.x)}-${Math.round(box.y)})">${imageMarkup}</g>` : imageMarkup;
      }
      let output = '';
      const background = style.backgroundColor;
      const borderWidths = ['Top','Right','Bottom','Left'].map(side => parseFloat(style[`border${side}Width`]) || 0);
      const borderColors = ['Top','Right','Bottom','Left'].map(side => style[`border${side}Color`] || 'transparent');
      const radius = parseFloat(style.borderTopLeftRadius) || 0;
      if (!transparent(background)) {
        output += `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" rx="${radius}" fill="${escXml(background)}"/>`;
      }
      if (style.borderTopStyle !== 'none') {
        const [top,right,bottom,left]=borderWidths, [topColor,rightColor,bottomColor,leftColor]=borderColors;
        if(top) output += `<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${top}" fill="${escXml(topColor)}"/>`;
        if(right) output += `<rect x="${box.x+box.width-right}" y="${box.y}" width="${right}" height="${box.height}" fill="${escXml(rightColor)}"/>`;
        if(bottom) output += `<rect x="${box.x}" y="${box.y+box.height-bottom}" width="${box.width}" height="${bottom}" fill="${escXml(bottomColor)}"/>`;
        if(left) output += `<rect x="${box.x}" y="${box.y}" width="${left}" height="${box.height}" fill="${escXml(leftColor)}"/>`;
      }
      for (const child of node.childNodes) output += renderNode(child, node);
      return output;
    };
    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${captureWidth}" height="${captureHeight}" viewBox="0 0 ${captureWidth} ${captureHeight}"><rect width="100%" height="100%" fill="#fff"/>${renderNode(source)}</svg>`;
    const svgUrl = URL.createObjectURL(new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' }));
    try {
      const image = new Image();
      image.src = svgUrl;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 2263;
      canvas.height = 1600;
      const context = canvas.getContext('2d');
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      const padding = 61;
      const scale = Math.min((canvas.width - padding * 2) / captureWidth, (canvas.height - padding * 2) / captureHeight);
      const drawWidth = captureWidth * scale;
      const drawHeight = captureHeight * scale;
      context.drawImage(image, (canvas.width - drawWidth) / 2, (canvas.height - drawHeight) / 2, drawWidth, drawHeight);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('ไม่สามารถสร้างภาพได้');
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = options.filename || `${project.name.replace(/[\\/:*?"<>|]/g, '-').slice(0, 60)}-${report.month}-รายงาน.png`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 30000);
      notice(options.successMessage || 'ดาวน์โหลดรายงาน PNG จากหน้าตัวอย่างแล้ว');
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
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
    const sdgs=$$('input[name="sdgs"]:checked',form).map(input=>input.value);
    const sdgRationales=Object.fromEntries(sdgs.map(id=>[id,String(form.elements.namedItem(`sdgRationale_${id.replace(' ','_')}`)?.value||'').trim()]));
    const procurementItems=$$('[data-procurement-row]',form).map(row=>({name:String(row.querySelector('[data-proc-name]')?.value||'').trim(),type:row.querySelector('[data-proc-type]')?.value||'procurement',amount:safeNum(row.querySelector('[data-proc-amount]')?.value)})).filter(item=>item.name||item.amount>0);
    return { projectId: ui.projectId, baselineStart: fields.get('baselineStart'), baselineEnd: fields.get('baselineEnd'), objective:String(fields.get('objective')||'').trim(), expectedOutcome:String(fields.get('expectedOutcome')||'').trim(), sdgs, sdgRationales, indicator:String(fields.get('indicator')||'').trim(), indicatorBaseline:String(fields.get('indicatorBaseline')||'').trim(), target:String(fields.get('target')||'').trim(), indicatorUnit:String(fields.get('indicatorUnit')||'').trim(), evidenceSource:String(fields.get('evidenceSource')||'').trim(), unusedBudgetReason:String(fields.get('unusedBudgetReason')||'').trim(), noProcurement:form.elements.namedItem('noProcurement')?.checked||false, procurementItems, months: rows };
  }
  function validatePlan(plan, final = false) {
    if ((final && (!plan.baselineStart || !plan.baselineEnd)) || (plan.baselineStart && plan.baselineEnd && plan.baselineEnd < plan.baselineStart)) return 'กรุณาตรวจเดือนเริ่มและเดือนสิ้นสุดแผน';
    if (final && (plan.months[0]?.key !== plan.baselineStart || plan.months.at(-1)?.key !== plan.baselineEnd)) return 'กด “ปรับตารางตามช่วงเวลานี้” ก่อนยืนยันแผน';
    if (plan.months.some(row=>stages.some(([key])=>row[key]<0 || (key!=='procure'&&row[key]>100)))) return 'ค่าแผนรายเดือนต้องไม่ติดลบ และร้อยละต้องไม่เกิน 100';
    if (stepKeys.some(key=>plan.months.reduce((sum,row)=>sum+safeNum(row[key]),0)>100)) return 'ผลรวมร้อยละของแต่ละขั้นตอนต้องไม่เกิน 100%';
    if (plan.months.reduce((sum,row)=>sum+safeNum(row.procure),0)>safeNum(selectedProject()?.budget)) return 'แผนจัดซื้อรวมเกินงบโครงการ';
    if (plan.procurementItems.reduce((sum,item)=>sum+safeNum(item.amount),0)>safeNum(selectedProject()?.budget)) return 'ยอดรายการค่าใช้จ่ายรวมเกินงบโครงการ';
    if (plan.noProcurement && (plan.procurementItems.some(item=>item.type==='procurement') || plan.months.some(row=>safeNum(row.procure)>0))) return 'เลือก “ไม่มีรายการจัดซื้อ/จ้างผ่านพัสดุ” แต่ยังมีรายการพัสดุในแผน กรุณาปรับให้สอดคล้องกัน';
    if (final && !plan.objective) return 'กรุณาระบุวัตถุประสงค์โครงการ';
    if (final && !plan.sdgs.length) return 'กรุณาเลือก SDG ที่เกี่ยวข้องอย่างน้อย 1 เป้าหมาย';
    if (final && (!plan.indicator || !plan.target)) return 'กรุณาระบุตัวชี้วัดหลักและค่าเป้าหมาย';
    return '';
  }
  function updatePlanPreview() {
    if (!$('#plan-form')) return;
    const draft = collectPlan();
    stages.forEach(([key])=>{const node=$(`#plan-total-${key}`);if(node)node.textContent=`${money(draft.months.reduce((sum,row)=>sum+safeNum(row[key]),0))}${key==='procure'?' บาท':'%'}`;});
    const monthlyProcure=draft.months.reduce((sum,row)=>sum+safeNum(row.procure),0);
    const itemTotal=draft.procurementItems.reduce((sum,item)=>sum+safeNum(item.amount),0);
    if($('#plan-procure-total'))$('#plan-procure-total').textContent=`${money(monthlyProcure)} บาท`;
    if($('#plan-items-total'))$('#plan-items-total').textContent=`${money(itemTotal)} บาท`;
    if($('#plan-procure-remaining'))$('#plan-procure-remaining').textContent=`${money(safeNum(selectedProject()?.budget)-itemTotal)} บาท`;
    const error=validatePlan(draft,false);
    $('#plan-validation').textContent=error || `จัดซื้อรายเดือน ${money(monthlyProcure)} บาท · รายการจัดซื้อ ${money(itemTotal)} บาท · งบโครงการ ${money(selectedProject()?.budget)} บาท · ร่างบางส่วนบันทึกไว้ก่อนได้`;
    $('#plan-validation').classList.toggle('warn',Boolean(error));
    const selected=$$('input[name="sdgs"]:checked',$('#plan-form')).length;
    const goal=Boolean(draft.objective&&selected&&draft.indicator&&draft.target);
    const timing=Boolean(draft.baselineStart&&draft.baselineEnd&&draft.baselineEnd>=draft.baselineStart&&draft.months[0]?.key===draft.baselineStart&&draft.months.at(-1)?.key===draft.baselineEnd);
    const budgetOkay=!error&&(draft.noProcurement||monthlyProcure>0||itemTotal>0);
    const completion=$('.plan-completion strong');if(completion)completion.textContent=`${[goal,timing,budgetOkay].filter(Boolean).length} / 3 ส่วน`;
    const states=$$('.plan-section-state');[goal,timing,budgetOkay].forEach((ready,index)=>{if(states[index]){states[index].classList.toggle('complete',ready);states[index].textContent=ready?['ครบแล้ว','ช่วงเวลาตรงกับตาราง','ไม่เกินวงเงิน'][index]:['ยังไม่ครบ','ปรับตารางตามช่วงเวลา','ตรวจวงเงิน'][index];}});
  }

  document.addEventListener('click', async event => {
    const nav = event.target.closest('[data-page]');
    if (nav) return navigate(nav.dataset.page);
    const go = event.target.closest('[data-go]');
    if (go) return navigate(go.dataset.go);
    const node = event.target.closest('button');
    if (!node || !screen.contains(node)) return;
    if (node.hasAttribute('data-report-step')) { setReportStep(node.dataset.reportStep); return; }
    if (node.hasAttribute('data-report-prev')) { setReportStep(ui.reportStep - 1); return; }
    if (node.hasAttribute('data-report-next')) { setReportStep(ui.reportStep + 1); return; }
    if (node.dataset.exampleScenario && monthlyReportExamples[node.dataset.exampleScenario]) { ui.exampleScenario=node.dataset.exampleScenario;ui.exampleDraft=null;ui.exampleOutput=false;ui.exampleStep=1;return render(); }
    if (node.dataset.exampleStep) { ui.exampleStep=Math.max(1,Math.min(4,Number(node.dataset.exampleStep)||1));render();window.scrollTo({top:0,behavior:'smooth'});return; }
    if (node.hasAttribute('data-example-reset')) { ui.exampleDraft=null;return render(); }
    if (node.hasAttribute('data-open-report-example')) { ui.page='report-example';ui.exampleOutput=false;ui.exampleStep=1;render();window.scrollTo({top:0,behavior:'smooth'});return; }
    if (node.hasAttribute('data-example-output')) { ui.exampleOutput=true;render();window.scrollTo({top:0,behavior:'smooth'});return; }
    if (node.hasAttribute('data-example-form')) { ui.exampleOutput=false;render();window.scrollTo({top:0,behavior:'smooth'});return; }
    if (node.hasAttribute('data-example-image')) return downloadMonthlyExampleImage();
    if (node.dataset.adminToggle) return setAdminPanelOpen(node.dataset.adminToggle, !adminPanelOpen(node.dataset.adminToggle));
    if (node.dataset.adminJump) {
      const id = node.dataset.adminJump;
      setAdminPanelOpen(id, true);
      return document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (node.hasAttribute('data-sdg-suggest-demo')) {
      const form=$('#sdg-demo-fields'),panel=$('#sdg-demo-results');
      if(!$('#sdg-demo-consent')?.checked)return notice('โปรดยืนยันก่อนส่งข้อความตัวอย่าง 4 ช่องไปยัง Google Gemini');
      const fields={objective:'demoObjective',expectedOutcome:'demoOutcome',indicator:'demoIndicator',target:'demoTarget'};
      const values=Object.fromEntries(Object.entries(fields).map(([key,name])=>[key,String(form?.querySelector(`[name="${name}"]`)?.value||'').trim()]));
      panel.innerHTML='<div class="sdg-ai-empty">กำลังวิเคราะห์ตัวอย่างด้วย Gemini…</div>';panel.hidden=false;node.disabled=true;
      try {
        const response=await fetch('/api/suggest-sdg',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(values)});
        const payload=await response.json();
        if(!response.ok)throw new Error(payload.error||'เรียก Gemini ไม่สำเร็จ');
        const recommendations=payload.recommendations||[];
        panel.innerHTML=recommendations.length?`<div class="sdg-ai-results-heading"><strong>ข้อเสนอจาก Gemini ${recommendations.length} ข้อ</strong><small>เป็นคำแนะนำ · ตรวจเหตุผลก่อนนำไปเลือก</small></div><div class="sdg-ai-cards">${recommendations.map(item=>{const option=sdgOptions.find(([id])=>id===item.id);return `<article class="sdg-ai-card"><div><span class="sdg-ai-id">${esc(item.id)}</span><strong>${esc(option?.[1]||'')}</strong><p>${esc(item.reason)}</p><small>เชื่อมโยงจาก: ${esc(item.evidence)} · ความเชื่อมั่นโดยประมาณ ${Number(item.confidence)}%</small></div></article>`}).join('')}</div>`:'<div class="sdg-ai-empty">ยังไม่พบ SDG ที่เชื่อมโยงชัดเจน · ลองปรับข้อความหรือเลือก SDG เอง</div>';
      } catch(error) { panel.innerHTML=`<div class="sdg-ai-empty">${esc(error.message||'เกิดข้อผิดพลาด')} · ข้อมูลตัวอย่างไม่ถูกบันทึก</div>`; }
      finally { node.disabled=false; }
      return;
    }
    if (node.hasAttribute('data-sdg-suggest')) {
      const form=$('#plan-form');
      const panel=$('#sdg-ai-results');
      const consent=$('#sdg-ai-consent');
      if(!consent?.checked)return notice('โปรดยืนยันก่อนว่าอนุญาตส่งข้อมูล 4 ช่องนี้ไปยัง Google Gemini เพื่อวิเคราะห์ SDG');
      const fields=Object.fromEntries(['objective','expectedOutcome','indicator','target'].map(name=>[name,String(form?.elements.namedItem(name)?.value||'').trim()]));
      if(!Object.values(fields).some(Boolean))return notice('กรอกวัตถุประสงค์ ผลที่คาด ตัวชี้วัด หรือเป้าหมายก่อน แล้วค่อยให้ตัวช่วยแนะนำ');
      panel.innerHTML='<div class="sdg-ai-empty">กำลังส่งเฉพาะข้อมูล 4 ช่องไปวิเคราะห์…</div>';panel.hidden=false;node.disabled=true;
      try {
        const response=await fetch('/api/suggest-sdg',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(fields)});
        const payload=await response.json();
        if(!response.ok)throw new Error(payload.error||'เรียก Gemini ไม่สำเร็จ');
        const recommendations=payload.recommendations||[];
        if(!recommendations.length){panel.innerHTML='<div class="sdg-ai-empty">ยังไม่พบ SDG ที่เชื่อมโยงอย่างชัดเจนจากข้อมูลที่ให้มา · ลองเพิ่มรายละเอียดหรือเลือก SDG ด้วยตนเอง</div>';return;}
        panel.innerHTML=`<div class="sdg-ai-results-heading"><strong>ข้อเสนอจาก Gemini ${recommendations.length} ข้อ</strong><small>ผลเป็นคำแนะนำ · ตรวจเหตุผลและเลือกด้วยตนเอง</small></div><div class="sdg-ai-cards">${recommendations.map(item=>{const option=sdgOptions.find(([id])=>id===item.id),checked=$$('#plan-form input[name="sdgs"]:checked').some(input=>input.value===item.id);return `<article class="sdg-ai-card"><div><span class="sdg-ai-id">${esc(item.id)}</span><strong>${esc(option?.[1]||'')}</strong><p>${esc(item.reason)}</p><small>เชื่อมโยงจากข้อมูล: ${esc(item.evidence)} · ความเชื่อมั่นโดยประมาณ ${Number(item.confidence)}%</small></div><button type="button" class="mini-btn" data-sdg-select-recommendation="${esc(item.id)}" ${checked?'disabled':''}>${checked?'เลือกแล้ว':'เลือก SDG นี้'}</button></article>`}).join('')}</div>`;
      } catch(error) {
        panel.innerHTML=`<div class="sdg-ai-empty">${esc(error.message||'เกิดข้อผิดพลาด')} · ข้อมูลไม่ได้ถูกบันทึกในเว็บจำลอง</div>`;
      } finally { node.disabled=false; }
      return;
    }
    if (node.dataset.sdgSelectRecommendation) {
      const input=$$('#plan-form input[name="sdgs"]').find(item=>item.value===node.dataset.sdgSelectRecommendation);
      if(input&&!input.checked){input.checked=true;input.dispatchEvent(new Event('change',{bubbles:true}));}
      node.textContent='เลือกแล้ว';node.disabled=true;return;
    }
    if (node.dataset.followPage) {
      ui.projectId = node.dataset.projectId || ui.projectId;
      ui.month = node.dataset.followMonth || '';
      if (node.dataset.followPage === 'archive') ui.archiveProject = node.dataset.projectId || '';
      ui.reportId = '';
      return navigate(node.dataset.followPage);
    }
    if (node.dataset.restoreTrash) return restoreFromTrash(node.dataset.restoreTrash);
    if (node.hasAttribute('data-backup-export')) return exportWorkspaceBackup().catch(error=>notice(`สำรองข้อมูลไม่สำเร็จ: ${error.message}`));
    if (node.hasAttribute('data-backup-choose')) return $('#admin-restore-file')?.click();
    if (node.dataset.removeAdmin) {
      const item=db.admins.find(admin=>admin.email===node.dataset.removeAdmin);
      if(!item||item.isPrimary)return notice('บัญชีผู้ดูแลหลักไม่สามารถปิดสิทธิ์ได้');
      if(!window.confirm(`ปิดสิทธิ์ผู้ดูแล ${item.email} ในเว็บจำลองหรือไม่?`))return;
      const before={...item};db.admins=db.admins.filter(admin=>admin.email!==item.email);log('สิทธิ์ผู้ดูแล','ปิดสิทธิ์',item.email,before,null);persist();return render();
    }
    if (node.id === 'apply-year') {
      const year = Number($('#context-year')?.value);
      if (!Number.isInteger(year) || year < 2560 || year > 2600) return notice('กรุณาเลือกปีงบประมาณ 2560–2600');
      ui.year = year; ui.projectId = ''; ui.dashboardProject=''; ui.month = defaultMonthForYear(year); db.lastYear = year; db.lastMonth = ui.month;
      persist(); render(); return notice(`กำลังดูข้อมูลปีงบ ${year}`);
    }
    if (node.hasAttribute('data-cancel-edit')) { ui.editDept='';ui.editProject='';ui.editDoc='';return render(); }
    if (node.dataset.yearOpen) { ui.year=Number(node.dataset.yearOpen);ui.projectId='';ui.dashboardProject='';ui.month=defaultMonthForYear(ui.year);db.lastYear=ui.year;db.lastMonth=ui.month;persist();render();window.scrollTo({top:0,behavior:'smooth'});return notice(`กำลังดูข้อมูลปีงบ ${ui.year}`); }
    if (node.dataset.editDept) { ui.editDept=node.dataset.editDept;setAdminPanelOpen('admin-departments',true);render();return $('#admin-departments')?.scrollIntoView(); }
    if (node.dataset.editProject) { ui.editProject=node.dataset.editProject;setAdminPanelOpen('admin-projects',true);render();return $('#admin-projects')?.scrollIntoView(); }
    if (node.dataset.editDoc) { ui.editDoc=node.dataset.editDoc;setAdminPanelOpen('admin-documents',true);render();return $('#admin-documents')?.scrollIntoView(); }
    if (node.dataset.openFile) return openFile(node.dataset.openFile);
    if (node.hasAttribute('data-save-plan-draft')) {
      if(blockIfYearClosed())return;
      const draft=collectPlan(),error=validatePlan(draft,false);
      if(error)return notice(error);
      draft.savedAt=now();draft.status='draft';db.planDrafts[ui.projectId]=draft;persist();render();return notice('บันทึกร่างแผนเรียบร้อยแล้ว · กลับมาทำต่อได้ทุกเมื่อ', 'confirmation');
    }
    if (node.hasAttribute('data-save-report-draft')) {
      if(blockIfYearClosed())return;
      const form=$('#report-form');if(!form)return;
      const fields=reportFormFields(form),phases=Object.fromEntries(stepKeys.map(key=>[key,fields.get(key)===''?0:Number(fields.get(key))]));
       if(Object.values(phases).some(value=>!Number.isFinite(value)||value<0||value>100)){setReportStep(1);return notice('ร้อยละของแต่ละขั้นตอนต้องอยู่ระหว่าง 0–100');}
      const plan=getPlan(ui.projectId),existing=getReportDraft(ui.projectId,ui.month)||getReport(ui.projectId,ui.month),expenses=readExpenseDetails({...reportFormFields(form),get:name=>fields.get(name),has:name=>fields.has(name)},plan,existing);
      const draft={projectId:ui.projectId,month:ui.month,phases,expenseItemPayments:expenses.amounts,expenseItemReceived:expenses.received,expenseItemTreasuryCleared:expenses.treasuryCleared,procurementItemPayments:expenses.amounts,procurementPaid:expenses.totals.procurement,loanPaid:expenses.totals.advance,otherPaid:expenses.totals.other,unplannedPaid:expenses.unplannedPaid,summaryText:String(fields.get('summaryText')||'').trim(),delay:String(fields.get('delay')||'').trim(),forecastMonth:String(fields.get('forecastMonth')||''),sdgOutcome:String(fields.get('sdgOutcome')||'').trim(),indicatorActual:String(fields.get('indicatorActual')||'').trim(),savedAt:now()};
      const index=db.reportDrafts.findIndex(item=>item.projectId===ui.projectId&&item.month===ui.month);if(index>=0)db.reportDrafts[index]=draft;else db.reportDrafts.push(draft);
       log('รายงาน','บันทึกร่าง',`${selectedProject()?.name} · ${monthLabel(ui.month)}`);persist();const badge=$('.page-head .status-pill');if(badge){badge.className='status-pill status-pending';badge.textContent='มีร่าง · ยังไม่ส่ง';}return notice('บันทึกร่างแล้ว · ยังไม่นับว่าส่งรายงาน');
    }
    if (node.dataset.planAdd) {
      if(blockIfYearClosed())return;
      const draft=collectPlan();
      const added=shiftMonth(node.dataset.planAdd==='before'?draft.months[0].key:draft.months.at(-1).key,node.dataset.planAdd==='before'?-1:1);
      if (!draft.months.some(row=>row.key===added)) draft.months[node.dataset.planAdd==='before'?'unshift':'push']({key:added});
      ui.planDraft=draft;return render();
    }
    if (node.hasAttribute('data-align-months')) {
      const draft=collectPlan(),keys=monthsBetween(draft.baselineStart,draft.baselineEnd);
      if(!keys.length)return notice('กรุณาตรวจเดือนเริ่มและเดือนสิ้นสุดก่อนปรับตาราง');
      const previous=new Map(draft.months.map(row=>[row.key,row]));draft.months=keys.map(key=>previous.get(key)||{key});ui.planDraft=draft;return render();
    }
    if (node.hasAttribute('data-procurement-add')) {
      const draft=collectPlan();draft.procurementItems.push({name:'',type:'procurement',amount:0});ui.planDraft=draft;render();screen.querySelector('[data-proc-name]:last-of-type')?.focus();return;
    }
    if (node.dataset.procurementRemove!==undefined) {
      const draft=collectPlan();draft.procurementItems.splice(Number(node.dataset.procurementRemove),1);ui.planDraft=draft;return render();
    }
    if (node.dataset.openReport) {
      let report=db.reports.find(item=>item.id===node.dataset.openReport);
      if (!report && node.dataset.openReport.startsWith('preview-report-')) {
        const storedDb=db;db=dashboardPreviewDatabase(ui.year);report=db.reports.find(item=>item.id===node.dataset.openReport);db=storedDb;
        if(!report)return notice('ไม่พบรายงานตัวอย่างของเดือนนี้ กรุณาเลือกเดือนที่มีรายงาน');
        ui.previewReport=true;
      }
      if (!report) return notice('ไม่พบรายงานที่เลือก');
      const project=db.projects.find(item=>item.id===report.projectId);
      if(ui.previewReport){const sample=dashboardPreviewDatabase(ui.year);const sampleProject=sample.projects.find(item=>item.id===report.projectId);ui.year=sampleProject?.year||ui.year;}
      ui.year=project?.year||ui.year;ui.projectId=report.projectId;ui.month=report.month;ui.reportId=report.id;return navigate('project-output');
    }
    if (node.hasAttribute('data-preview-report-back')) {ui.dashboardProject=ui.projectId;return navigate('dashboard');}
    if (node.dataset.dashboardSelectProject) {ui.dashboardProject=node.dataset.dashboardSelectProject;return render();}
    if (node.hasAttribute('data-dashboard-all-projects')) {ui.dashboardProject='';return render();}
    if (node.dataset.dashboardProjectSdg) {ui.dashboardSdg=node.dataset.dashboardProjectSdg;return render();}
    if (node.hasAttribute('data-project-monthly-png')) return downloadDashboardProjectReportImage(node.dataset.projectId,node.dataset.reportMonth).catch(error=>notice(`สร้างรายงาน PNG ไม่สำเร็จ: ${error.message||'กรุณาลองใหม่'}`));
    if (node.hasAttribute('data-project-monthly-pdf')) {const sheet=document.querySelector('.project-monthly-report-sheet');if(sheet)await ensureReportImagesReady(sheet);document.body.classList.add('print-project-monthly-report');window.print();return;}
    if (node.hasAttribute('data-dashboard-report-image')) return downloadDashboardReportImage().catch(error=>notice(`สร้างรายงาน PNG ไม่สำเร็จ: ${error.message||'กรุณาลองใหม่'}`));
    if (node.hasAttribute('data-dashboard-report-pdf')) {document.body.classList.add('print-dashboard-report');window.print();return;}
    if (node.dataset.dashboardProject) {ui.projectId=node.dataset.dashboardProject;ui.page='review';return render();}
    if (node.dataset.dashboardSdg) {ui.dashboardSdg=node.dataset.dashboardSdg;return render();}
    if (node.dataset.togglePhoto) {
      if(blockIfYearClosed(db.projects.find(project=>project.id===ui.projectId)?.year||ui.year))return;
      const report=selectedOutputReport();const file=report?.attachments?.find(item=>item.id===node.dataset.togglePhoto);
      if (!file) return;
      if (!file.featured && report.attachments.filter(item=>item.isImage&&item.featured).length>=3) return notice('เลือกภาพเด่นได้สูงสุด 3 ภาพ กรุณานำภาพเดิมออกก่อน');
      file.featured=!file.featured;persist();return render();
    }
    if (node.dataset.replaceAttachment) {if(blockIfYearClosed(db.projects.find(project=>project.id===ui.projectId)?.year||ui.year))return;ui.replaceFileId=node.dataset.replaceAttachment;return $('#attachment-replacement')?.click();}
    if (node.dataset.removeAttachment) {
      if(blockIfYearClosed(db.projects.find(project=>project.id===ui.projectId)?.year||ui.year))return;
      const report=getReport(ui.projectId,ui.month);const index=report?.attachments?.findIndex(file=>file.id===node.dataset.removeAttachment);
      if (index<0 || !window.confirm('ลบไฟล์นี้จากรายงานในเว็บจำลองหรือไม่?')) return;
      const [file]=report.attachments.splice(index,1);await fileAction('delete',file.blobId).catch(()=>{});report.version++;report.updatedAt=now();log('ไฟล์รายงาน','ลบ',file.name);persist();return render();
    }
    if (node.dataset.deleteBudget) {
      if(blockIfYearClosed(Number(node.dataset.deleteBudget)))return;
      if (!window.confirm(`ย้ายงบประมาณปี ${node.dataset.deleteBudget} ไปถังพักหรือไม่? กู้คืนได้จากหัวข้อถังพัก`)) return;
      const before={year:String(node.dataset.deleteBudget),record:clone(db.budgets[node.dataset.deleteBudget])};moveToTrash('งบประมาณ',`ปี ${node.dataset.deleteBudget}`,before);delete db.budgets[node.dataset.deleteBudget];persist();return render();
    }
    if (node.dataset.deleteDept) {
      const item=db.departments.find(dept=>dept.id===node.dataset.deleteDept);
      if (db.projects.some(project=>project.deptId===item?.id)) return notice('ยังมีโครงการผูกกับหน่วยงานนี้ กรุณาย้ายโครงการก่อน');
      if (!item || !window.confirm(`ย้ายหน่วยงาน ${item.name} ไปถังพักหรือไม่? กู้คืนได้จากหัวข้อถังพัก`)) return;
      moveToTrash('หน่วยงาน',item.name,item);db.departments=db.departments.filter(dept=>dept.id!==item.id);persist();return render();
    }
    if (node.dataset.deleteProject) {
      const item=db.projects.find(project=>project.id===node.dataset.deleteProject);
      if(item&&blockIfYearClosed(item.year))return;
      if (!item || !window.confirm(`ย้ายโครงการ ${item.name} พร้อมแผน รายงาน และเอกสารที่ผูกไว้ไปถังพักหรือไม่?`)) return;
      const payload={project:clone(item),plan:clone(db.plans[item.id]||null),reports:clone(db.reports.filter(report=>report.projectId===item.id)),documents:clone(db.documents.filter(doc=>doc.projectId===item.id))};moveToTrash('โครงการ',item.name,payload);db.projects=db.projects.filter(project=>project.id!==item.id);delete db.plans[item.id];db.reports=db.reports.filter(report=>report.projectId!==item.id);db.documents=db.documents.filter(doc=>doc.projectId!==item.id);ui.projectId='';persist();return render();
    }
    if (node.dataset.deleteDoc) {
      const item=db.documents.find(doc=>doc.id===node.dataset.deleteDoc);
      if(item&&blockIfYearClosed(item.year))return;
      if (!item || !window.confirm(`ย้ายเอกสาร ${item.title} ไปถังพักหรือไม่? ไฟล์และรุ่นก่อนหน้ายังกู้คืนได้`)) return;
      moveToTrash('เอกสาร',item.title,item);db.documents=db.documents.filter(doc=>doc.id!==item.id);persist();return render();
    }
    if (node.dataset.deleteReport) {
      const item=db.reports.find(report=>report.id===node.dataset.deleteReport);
      if(item&&blockIfYearClosed(db.projects.find(project=>project.id===item.projectId)?.year||ui.year))return;
      if (!item || !window.confirm(`ย้ายรายงาน ${monthLabel(item.month)} ไปถังพักหรือไม่? ไฟล์แนบจะถูกเก็บไว้เพื่อกู้คืน`)) return;
      moveToTrash('รายงาน',`${monthLabel(item.month)} · ${db.projects.find(project=>project.id===item.projectId)?.name||''}`,item);db.reports=db.reports.filter(report=>report.id!==item.id);persist();return render();
    }
    if (node.id==='reset-sandbox') {
      if (!window.confirm('ล้างข้อมูลทดลองทั้งหมด รวมไฟล์ที่อัปโหลดในเบราว์เซอร์นี้หรือไม่?')) return;
      if (window.prompt('เพื่อยืนยันการลบถาวร กรุณาพิมพ์คำว่า ล้างข้อมูล')?.trim() !== 'ล้างข้อมูล') return notice('ยกเลิกการล้างข้อมูลแล้ว');
      db=empty();adminPanels={};localStorage.removeItem(KEY);localStorage.removeItem(ADMIN_PANELS_KEY);await fileAction('clear').catch(()=>{});ui={page:'home',year:2569,projectId:'',month:'',reportId:'',editDept:'',editProject:'',editDoc:'',replaceFileId:''};render();return notice('ล้างข้อมูลทดลองทั้งหมดแล้ว');
    }
    if (node.hasAttribute('data-save-image')) {const storedDb=db;if(ui.previewReport)db=dashboardPreviewDatabase(ui.year);try{return await downloadProjectReportImage().catch(error=>notice(`สร้างไฟล์รูปไม่สำเร็จ: ${error.message || 'กรุณาลองใหม่'}`));}finally{db=storedDb;}}
    if (node.hasAttribute('data-print')) {
      const sheet=document.querySelector('.project-monthly-report-sheet')||document.querySelector('.report-sheet.print-target');
      if(sheet)await ensureReportImagesReady(sheet);
      document.body.classList.add('print-report');
      if(sheet){
        const original={width:sheet.style.width,maxWidth:sheet.style.maxWidth,margin:sheet.style.margin,zoom:sheet.style.zoom};
        sheet.dataset.printOriginal=JSON.stringify(original);
        sheet.style.width='281mm';sheet.style.maxWidth='none';sheet.style.margin='0 auto';sheet.style.zoom='1';
        sheet.classList.add('export-layout');
        await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
        const printableWidth=281/25.4*96,printableHeight=194/25.4*96;
        const bounds=sheet.getBoundingClientRect();
        const scale=Math.min(1,printableWidth/Math.max(1,bounds.width),printableHeight/Math.max(1,sheet.scrollHeight));
        sheet.style.zoom=String(scale);
      }
      window.print();
    }
  });
  window.addEventListener('afterprint',()=>{document.body.classList.remove('print-report','print-dashboard-report','print-project-monthly-report');const sheet=document.querySelector('.project-monthly-report-sheet')||document.querySelector('.report-sheet.print-target');if(sheet){sheet.classList.remove('export-layout');try{const original=JSON.parse(sheet.dataset.printOriginal||'{}');for(const key of ['width','maxWidth','margin','zoom'])sheet.style[key]=original[key]||'';}catch{sheet.style.removeProperty('zoom');}delete sheet.dataset.printOriginal;}});

  document.addEventListener('change', async event => {
    const input=event.target;
    if(input.name?.startsWith('expenseItemReceived')||input.name?.startsWith('expenseItemTreasury')){updateReportReview($('#report-form'));return;}
    if (input.id==='admin-restore-file'&&input.files[0]) { const file=input.files[0];await restoreWorkspaceBackup(file);input.value='';return; }
    if (input.matches('[data-sdg-select]')) {const row=screen.querySelector(`[data-sdg-rationale-row="${input.value}"]`);if(row)row.hidden=!input.checked;input.closest('.sdg-option')?.classList.toggle('selected',input.checked);updatePlanPreview();return;}
    if (input.name==='noProcurement') {updatePlanPreview();return;}
    if (input.id==='dashboard-year') {const year=Number(input.value);if(year<2560||year>2600)return notice('กรุณาเลือกปีงบประมาณ 2560–2600');ui.year=year;ui.projectId='';ui.dashboardProject='';ui.month=defaultMonthForYear(year);db.lastYear=year;db.lastMonth=ui.month;persist();return render();}
    if (input.id==='context-year') {const year=Number(input.value);if(year<2560||year>2600)return notice('กรุณาเลือกปีงบประมาณ 2560–2600');ui.year=year;ui.projectId='';ui.dashboardProject='';ui.month=defaultMonthForYear(year);db.lastYear=year;db.lastMonth=ui.month;persist();return render();}
    if (input.id==='context-project') {ui.projectId=input.value;ui.planDraft=null;return render();}
    if (input.id==='context-month') {ui.month=input.value;db.lastMonth=ui.month;persist();return render();}
    if (input.id==='dashboard-project') {ui.dashboardProject=input.value;return render();}
    if (input.id==='archive-project') {ui.archiveProject=input.value;return render();}
    if (input.dataset.photoCaption) {if(blockIfYearClosed(db.projects.find(project=>project.id===ui.projectId)?.year||ui.year))return;const report=selectedOutputReport();const file=report?.attachments?.find(item=>item.id===input.dataset.photoCaption);if(file){file.caption=input.value.trim().slice(0,100);persist();render();}return;}
    if (input.id==='attachment-replacement'&&input.files[0]) {
      if(blockIfYearClosed(db.projects.find(project=>project.id===ui.projectId)?.year||ui.year)){input.value='';return;}
      const report=getReport(ui.projectId,ui.month);const file=report?.attachments?.find(item=>item.id===ui.replaceFileId);if(!file)return;
      try{const replacement=input.files[0];const newId=await putFile(replacement);await fileAction('delete',file.blobId).catch(()=>{});Object.assign(file,{name:replacement.name,blobId:newId,isImage:replacement.type.startsWith('image/'),caption:replacement.name,uploadedAt:now()});report.version++;report.updatedAt=now();log('ไฟล์รายงาน','แทนที่',replacement.name);persist();render();notice('แทนที่ไฟล์ในเว็บจำลองแล้ว');}catch{notice('เก็บไฟล์ในเบราว์เซอร์นี้ไม่ได้');}finally{ui.replaceFileId='';}
    }
  });
  document.addEventListener('input',event=>{
    if (event.target.closest('#example-report-form')) {
      const form=$('#example-report-form');
      const base=monthlyReportExamples[ui.exampleScenario]||monthlyReportExamples.ontrack;
      const draft=ui.exampleDraft?{...ui.exampleDraft,phases:{...base.phases,...ui.exampleDraft.phases}}:{...base,phases:{...base.phases}};
      const field=event.target;
      if(field.name.startsWith('phase_')) draft.phases[field.name.slice(6)]=safeNum(field.value);
      else if(['procurementPaid','loanPaid','otherPaid'].includes(field.name)) draft[field.name]=safeNum(field.value);
      else if(['summary','reason','forecastKey'].includes(field.name)) draft[field.name]=field.value;
      ui.exampleDraft=draft;
      const actual=exampleProgress(draft.phases),diff=actual-exampleProgress(base.plannedPhases);
      const status=diff < -5 ? `ช้ากว่าแผน ${Math.abs(diff).toFixed(1)} จุด` : diff > 5 ? `เร็วกว่าแผน ${diff.toFixed(1)} จุด` : 'ใกล้เคียงแผน';
      const statusClass=diff < -5?'status-bad':'status-good';
      const totalPaid=safeNum(draft.procurementPaid)+safeNum(draft.loanPaid)+safeNum(draft.otherPaid);
      const cumulative=safeNum(draft.priorPaid)+totalPaid;
      const actualNode=$('[data-example-actual]');if(actualNode)actualNode.textContent=`${actual.toFixed(1)}%`;
      const statusNode=$('[data-example-status]');if(statusNode){statusNode.textContent=status;statusNode.classList.remove('status-bad','status-good');statusNode.classList.add(statusClass);}
      const statusCopy=$('[data-example-status-copy]');if(statusCopy){statusCopy.textContent=status;statusCopy.classList.remove('status-bad','status-good');statusCopy.classList.add(statusClass);}
      const spent=$('[data-example-process-spent]');if(spent)spent.textContent=`${money(cumulative)} บาท`;
      const cumulativeNode=$('[data-example-cumulative-paid]');if(cumulativeNode)cumulativeNode.textContent=`${money(cumulative)} บาท`;
      const remaining=$('[data-example-remaining]');if(remaining)remaining.textContent=`${money(200000-cumulative)} บาท`;
    }
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
      const plan=getPlan(ui.projectId),expenses=readExpenseDetails(reportFormFields(form),plan,getReportDraft(ui.projectId,ui.month)||getReport(ui.projectId,ui.month));
      const cumulative=safeNum(form.dataset.priorPaid)+expenses.total;
      if ($('#report-paid-total')) $('#report-paid-total').textContent=`${money(cumulative)} บาท`;
      if ($('#report-budget-remaining')) $('#report-budget-remaining').textContent=`${money(safeNum(form.dataset.projectBudget)-cumulative)} บาท`;
      const processPaid=$('[data-report-stage-current-paid]');if(processPaid)processPaid.textContent=`${money(cumulative)} บาท`;
      updateReportReview(form);
    }
  });

  document.addEventListener('change', event => {
    if (event.target.matches('#report-form input[name="attachments"]') || event.target.matches('#report-form input[name^="expenseItemEvidence"]')) updateReportReview($('#report-form'));
  });

  document.addEventListener('submit', async event => {
    const form=event.target;
    if (!screen.contains(form)) return;
    event.preventDefault();
    const fields=new FormData(form);
    if (['budget-form','project-form','weights-form','document-form','plan-form','report-form','copy-year-form'].includes(form.id) && blockIfYearClosed()) return;
    if (form.id==='admin-document-filter') {
      ui.adminDocSearch=String(fields.get('search')||'');ui.adminDocCategory=String(fields.get('category')||'all');ui.adminDocStatus=String(fields.get('status')||'all');ui.adminDocVisibility=String(fields.get('visibility')||'all');return render();
    }
    if (form.id==='admin-user-form') {
      const email=String(fields.get('email')||'').trim().toLowerCase();
      if(!/^[^\s@]+@mahidol\.ac\.th$/i.test(email))return notice('เพิ่มได้เฉพาะอีเมล @mahidol.ac.th');
      if(db.admins.some(item=>item.email.toLowerCase()===email))return notice('อีเมลนี้มีสิทธิ์ผู้ดูแลอยู่แล้ว');
      const record={email,role:String(fields.get('role')||'ผู้ดูแลระบบ'),addedAt:now(),addedBy:INITIAL_ADMIN_EMAIL,isPrimary:false};db.admins.push(record);log('สิทธิ์ผู้ดูแล','เพิ่ม',email,null,record);persist();return render();
    }
    if (form.id==='year-status-form') {
      const reason=String(fields.get('reason')||'').trim();
      if(!reason)return notice('กรุณาระบุเหตุผลก่อนเปลี่ยนสถานะปีงบ');
      const wasClosed=isYearClosed(),action=wasClosed?'เปิดปีงบ':'ปิดปีงบ';
      const review=yearCloseChecks(ui.year);
      if(!wasClosed&&review.blockers.length)return notice(`ยังปิดปีไม่ได้: ${review.blockers.map(item=>item.label).join(' · ')}`);
      if(!wasClosed&&review.warnings.length&&!fields.get('acknowledgeWarnings'))return notice('กรุณายืนยันว่าได้ตรวจรายการเตือนก่อนปิดปี');
      const warningText=!wasClosed&&review.warnings.length?` ยังมีรายการเตือน ${review.warnings.length} ข้อที่ตรวจแล้ว`:'';
      if(!window.confirm(`${action} ${ui.year} ใช่หรือไม่?${warningText} ${wasClosed?'หลังเปิดแล้วสามารถแก้ไขข้อมูลปีนี้ได้':'หลังปิดจะต้องเปิดปีอีกครั้งจึงจะแก้ข้อมูลได้'}`))return;
      const before=db.yearStatus[ui.year]?{...db.yearStatus[ui.year]}:null;
      db.yearStatus[ui.year]={closed:!wasClosed,reason,updatedAt:now(),updatedBy:INITIAL_ADMIN_EMAIL};
      log('ปีงบประมาณ',action,`ปี ${ui.year} · ${reason}`,before,db.yearStatus[ui.year]);persist();return render();
    }
    if (form.id==='copy-year-form') {
      const sourceYear=String(fields.get('sourceYear')||'');
      if(!sourceYear||Number(sourceYear)===ui.year)return notice('เลือกปีต้นทางที่ต่างจากปีเป้าหมาย');
      const copied={weights:false,projects:0,skipped:0},before={weights:db.weights[ui.year]||null,projects:db.projects.filter(item=>item.year===ui.year).length};
      if(fields.get('copyWeights')&&db.weights[sourceYear]){db.weights[ui.year]={...db.weights[sourceYear]};copied.weights=true;}
      if(fields.get('copyProjects')){
        const source=db.projects.filter(item=>Number(item.year)===Number(sourceYear));
        source.forEach(item=>{
          if(db.projects.some(existing=>existing.year===ui.year&&existing.name.trim().toLocaleLowerCase()===item.name.trim().toLocaleLowerCase())){copied.skipped++;return;}
          db.projects.push({id:uid(),year:ui.year,name:item.name,deptId:item.deptId,budget:0,owners:JSON.parse(JSON.stringify(item.owners||[])),active:false});copied.projects++;
        });
      }
      if(!copied.weights&&!copied.projects)return notice('ไม่พบข้อมูลที่เลือกให้คัดลอก หรือรายการมีอยู่แล้ว');
      const after={weights:db.weights[ui.year]||null,projects:db.projects.filter(item=>item.year===ui.year).length};
      log('เตรียมปีงบใหม่','คัดลอกข้อมูลตั้งต้น',`จากปี ${sourceYear} ไปปี ${ui.year} · ${copied.projects} โครงการร่าง · ${copied.weights?'ค่าน้ำหนัก':''} · ข้ามชื่อซ้ำ ${copied.skipped}`,before,after);persist();setAdminPanelOpen('admin-projects',true);return render();
    }
    if (form.id==='budget-form') {
      const amount=parseAmount(fields.get('amount'));
      if (!Number.isFinite(amount)||amount<0) return notice('กรุณากรอกงบประมาณตั้งแต่ศูนย์ขึ้นไป');
      const before=db.budgets[ui.year]?{...db.budgets[ui.year]}:null;db.budgets[ui.year]={amount,updatedAt:now()};log('งบประมาณ',before?'แก้ไข':'บันทึก',`ปี ${ui.year} · ${money(amount)} บาท`,before,db.budgets[ui.year]);persist();setAdminPanelOpen('admin-budget',true);render();return notice('บันทึกงบประมาณปีนี้แล้ว');
    }
    if (form.id==='department-form') {
      const name=String(fields.get('name')||'').trim(),head=String(fields.get('head')||'').trim(),email=String(fields.get('email')||'').trim();
      if (!name||!head||!email)return notice('กรอกชื่อหน่วยงาน หัวหน้า และอีเมลให้ครบ');
      const duplicate=db.departments.find(item=>item.name.toLocaleLowerCase()===name.toLocaleLowerCase()&&item.id!==ui.editDept);
      if(duplicate)return notice('มีชื่อหน่วยงานนี้แล้ว');
      const item=db.departments.find(item=>item.id===ui.editDept),before=item?{...item}:null;
      if(item)Object.assign(item,{name,head,email,since:String(fields.get('since')||'')});
      else db.departments.push({id:uid(),name,head,email,since:String(fields.get('since')||'')});
      const after=item?{...item}:db.departments.at(-1);log('หน่วยงาน',item?'แก้ไข':'เพิ่ม',`${name} · ${head}`,before,after);ui.editDept='';persist();setAdminPanelOpen('admin-departments',true);render();return notice('บันทึกหน่วยงานแล้ว');
    }
    if (form.id==='project-form') {
      const name=String(fields.get('name')||'').trim(),deptId=String(fields.get('deptId')||''),budget=parseAmount(fields.get('budget'));
      const owners=[0,1,2].map(index=>({name:String(fields.get(`ownerName${index}`)||'').trim(),email:String(fields.get(`ownerEmail${index}`)||'').trim()}));
      if(!db.budgets[ui.year])return notice('กรุณาตั้งงบปีนี้ก่อน');
      if(!name||!deptId||!owners[0].name||!owners[0].email||!Number.isFinite(budget)||budget<0)return notice('กรอกชื่อ หน่วยงาน งบ และผู้รับผิดชอบหลักให้ครบ');
      if(owners.slice(1).some(owner=>Boolean(owner.name)!==Boolean(owner.email)))return notice('ผู้รับผิดชอบรองต้องกรอกทั้งชื่อและอีเมล');
      const item=db.projects.find(project=>project.id===ui.editProject),before=item?{...item,owners:JSON.parse(JSON.stringify(item.owners||[]))}:null;
      const nextTotal=yearProjects().reduce((sum,project)=>sum+(project.id===item?.id?0:safeNum(project.budget)),0)+(fields.get('active')==='true'?budget:0);
      if(nextTotal>db.budgets[ui.year].amount)return notice(`วงเงินรวมเกินงบปี ${money(nextTotal-db.budgets[ui.year].amount)} บาท กรุณาตรวจงบก่อน`);
      const record={year:ui.year,name,deptId,budget,owners,active:fields.get('active')==='true'};
      if(item)Object.assign(item,record);else db.projects.push({id:uid(),...record});
      log('โครงการ',item?'แก้ไข':'เพิ่ม',`${name} · ${money(budget)} บาท`,before,record);ui.editProject='';persist();setAdminPanelOpen('admin-projects',true);render();return notice(item?'บันทึกการแก้ไขโครงการเรียบร้อยแล้ว':'เพิ่มโครงการเรียบร้อยแล้ว', 'confirmation');
    }
    if(form.id==='weights-form') {
      const values=Object.fromEntries(stepKeys.map(key=>[key,Number(fields.get(key))]));
      if(Object.values(values).some(value=>!Number.isFinite(value)||value<0)||Object.values(values).reduce((sum,value)=>sum+value,0)!==100)return notice('ผลรวมค่าน้ำหนักต้องเท่ากับ 100%');
      const before=db.weights[ui.year]?{...db.weights[ui.year]}:null;db.weights[ui.year]=values;log('ค่าน้ำหนัก',before?'แก้ไข':'บันทึก',`ปี ${ui.year} · ${Object.values(values).join('/')}`,before,values);persist();setAdminPanelOpen('admin-weights',true);render();return notice('บันทึกค่าน้ำหนักแล้ว');
    }
    if(form.id==='document-form') {
      const title=String(fields.get('title')||'').trim(),scope=String(fields.get('scope')||'central'),projectId=scope==='project'?String(fields.get('projectId')||''):'';
      const file=form.elements.namedItem('file')?.files?.[0],item=db.documents.find(doc=>doc.id===ui.editDoc);
      if(!title)return notice('กรุณาใส่ชื่อเอกสาร');
      if(scope==='project'&&!projectId)return notice('เอกสารเฉพาะโครงการต้องเลือกโครงการ');
      if(!item&&!file)return notice('กรุณาเลือกไฟล์ PDF หรือ Word');
      let blobId=item?.blobId||'',fileName=item?.fileName||'';
      if(file){try{blobId=await putFile(file);fileName=file.name;}catch{return notice('เก็บไฟล์เอกสารในเบราว์เซอร์นี้ไม่ได้');}}
      const before=item?JSON.parse(JSON.stringify(item)):null;
      const versions=[...(item?.versions||[])];
      if(item){const previous={...item};delete previous.versions;versions.unshift(previous);}
      const record={year:ui.year,title,scope,projectId,category:String(fields.get('category')||''),number:String(fields.get('number')||'').trim(),effectiveDate:String(fields.get('effectiveDate')||''),expiryDate:String(fields.get('expiryDate')||''),visible:fields.get('visible')==='on',blobId,fileName,version:(item?.version||0)+1,versions,updatedAt:now()};
      if(item)Object.assign(item,record);else db.documents.push({id:uid(),...record});
      const after=item?JSON.parse(JSON.stringify(item)):db.documents.at(-1);log('เอกสาร',item?'แก้ไข/ออกฉบับใหม่':'เพิ่ม',title,before,after);ui.editDoc='';persist();setAdminPanelOpen('admin-documents',true);render();return notice('บันทึกเอกสารและเก็บรุ่นก่อนหน้าแล้ว');
    }
    if(form.id==='plan-form') {
      const plan=collectPlan(),error=validatePlan(plan,true);
      if(error)return notice(error);
      plan.savedAt=now();plan.status='confirmed';db.plans[ui.projectId]=plan;delete db.planDrafts[ui.projectId];ui.planDraft=null;log('แผนโครงการ','ยืนยันแผน',selectedProject().name);persist();render();return notice('ยืนยันแผนแล้ว ไปกรอกรายงานผลได้');
    }
    if(form.id==='report-form') {
      const project=selectedProject(),plan=getPlan(project?.id);
      if(!project||!plan)return notice('กรุณาเลือกโครงการที่มีแผน');
      const phases=Object.fromEntries(stepKeys.map(key=>[key,fields.get(key)===''?0:Number(fields.get(key))]));
      if(Object.values(phases).some(value=>!Number.isFinite(value)||value<0||value>100)){setReportStep(1);return notice('ร้อยละของแต่ละขั้นตอนต้องอยู่ระหว่าง 0–100');}
      const summaryText=String(fields.get('summaryText')||'').trim(),delay=String(fields.get('delay')||'').trim();
      const forecastMonth=String(fields.get('forecastMonth')||'');
      if(!summaryText){setReportStep(3);return notice('กรุณากรอกสรุปผลเดือนนี้');}
      if((progress(phases)<plannedAt(project.id,ui.month)-0.01||forecastMonth>plan.baselineEnd)&&!delay){setReportStep(3);return notice('ผลต่ำกว่าแผนหรือคาดว่าจะขยายเวลา กรุณาระบุสาเหตุและแนวทางแก้ไข');}
      const existing=getReport(project.id,ui.month),expenseDraft=getReportDraft(project.id,ui.month),expenses=readExpenseDetails({...reportFormFields(form),get:name=>fields.get(name),has:name=>fields.has(name)},plan,expenseDraft||existing);
      if(expenses.amounts.some(value=>!Number.isFinite(value)||value<0)){setReportStep(2);return notice('ยอดจ่ายต้องไม่ติดลบ');}
      const oldPaid=existing?paid(existing):0;
      if(paidThrough(project.id,'9999-12')-oldPaid+expenses.total>project.budget){setReportStep(2);return notice('ยอดจ่ายสะสมจะเกินงบโครงการ กรุณาตรวจตัวเลข');}
      const uploaded=[...(form.elements.namedItem('attachments')?.files||[])].map(file=>({file,expenseIndex:null,evidenceType:'general'}));
      expenses.items.forEach((item,index)=>{const input=form.elements.namedItem(`expenseItemEvidence${index}`);[...(input?.files||[])].forEach(file=>uploaded.push({file,expenseIndex:index,evidenceType:item.type==='procurement'?'receipt':item.type==='advance'?'treasury':'payment'}));});
      const images=(existing?.attachments||[]).filter(item=>item.isImage).length+uploaded.filter(item=>item.file.type.startsWith('image/')).length;
      if(images>10){setReportStep(3);return notice('แนบภาพสำหรับเดือนนี้ได้สูงสุด 10 ภาพ');}
      const attachments=[...(existing?.attachments||[])];
      try {
        for(const entry of uploaded){const file=entry.file,blobId=await putFile(file);attachments.push({id:uid(),blobId,name:file.name,isImage:file.type.startsWith('image/'),caption:file.name.replace(/\.[^.]+$/,''),featured:entry.evidenceType==='general'&&file.type.startsWith('image/')&&attachments.filter(item=>item.isImage&&item.featured).length<3,expenseIndex:entry.expenseIndex,evidenceType:entry.evidenceType,uploadedAt:now()});}
      }catch{return notice('เก็บไฟล์แนบในเบราว์เซอร์นี้ไม่ได้');}
      const record={projectId:project.id,month:ui.month,phases,expenseItemPayments:expenses.amounts,expenseItemReceived:expenses.received,expenseItemTreasuryCleared:expenses.treasuryCleared,procurementItemPayments:expenses.amounts,procurementPaid:expenses.totals.procurement,loanPaid:expenses.totals.advance,otherPaid:expenses.totals.other,unplannedPaid:expenses.unplannedPaid,summaryText,delay,forecastMonth,sdgOutcome:String(fields.get('sdgOutcome')||'').trim(),indicatorActual:String(fields.get('indicatorActual')||'').trim(),attachments,updatedAt:now(),submittedAt:now(),status:'submitted',version:(existing?.version||0)+1};
      if(existing)Object.assign(existing,record);else db.reports.push({id:uid(),...record});
      db.reportDrafts=db.reportDrafts.filter(item=>!(item.projectId===project.id&&item.month===ui.month));ui.reportId=existing?.id||db.reports.at(-1).id;db.lastMonth=ui.month;log('รายงาน','ส่งรายงาน',`${project.name} · ${monthLabel(ui.month)} · ฉบับ ${record.version}`);persist();navigate('project-output');return notice('ส่งรายงานแล้ว เลือกภาพเด่นก่อนพิมพ์ได้');
    }
  });

  render();
})();





(() => {
  'use strict';

  const root = document.getElementById('admin-control-root');
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const money = value => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(Number(value) || 0);
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const fiscalStart = year => `${year - 544}-10-01`;

  const yearRecords = { 2569: {
    annualBudget: 5000000,
    departments: [
      { id: 'D01', name: 'งานพัฒนาเพื่อความยั่งยืน', head: 'หัวหน้าตัวอย่าง ก', email: 'head.a@example.invalid', since: '2025-10-01', active: true },
      { id: 'D02', name: 'งานภูมิทัศน์และสิ่งแวดล้อม', head: 'หัวหน้าตัวอย่าง ข', email: 'head.b@example.invalid', since: '2025-10-01', active: true },
      { id: 'D03', name: 'งานบริหารและพัฒนาระบบ', head: 'หัวหน้าตัวอย่าง ค', email: 'head.c@example.invalid', since: '2025-10-01', active: true }
    ],
    projects: [
      { id: 'DEMO-01', name: 'โครงการจัดการขยะครบวงจร', dept: 'D01', budget: 3000000, status: 'active', reported: true, owners: [{ name: 'ผู้รับผิดชอบ ก', email: 'owner.a@example.invalid' }, { name: 'ผู้ช่วย ก', email: 'co.a@example.invalid' }, { name: '', email: '' }] },
      { id: 'DEMO-02', name: 'โครงการพลังงานสะอาด', dept: 'D03', budget: 1000000, status: 'active', reported: true, owners: [{ name: 'ผู้รับผิดชอบ ข', email: 'owner.b@example.invalid' }, { name: '', email: '' }, { name: '', email: '' }] },
      { id: 'DEMO-03', name: 'โครงการพื้นที่สีเขียว', dept: 'D02', budget: 500000, status: 'active', reported: true, owners: [{ name: 'ผู้รับผิดชอบ ค', email: 'owner.c@example.invalid' }, { name: 'ผู้ช่วย ค', email: 'co.c@example.invalid' }, { name: '', email: '' }] },
      { id: 'DEMO-04', name: 'โครงการสื่อสารความยั่งยืน', dept: 'D01', budget: 400000, status: 'active', reported: false, owners: [{ name: 'ผู้รับผิดชอบ ง', email: 'owner.d@example.invalid' }, { name: 'ผู้ช่วย ง', email: 'co.d@example.invalid' }, { name: '', email: '' }] },
      { id: 'DEMO-05', name: 'โครงการนำร่องที่ยุติแล้ว', dept: 'D01', budget: 100000, status: 'cancelled', reported: false, owners: [{ name: 'ผู้รับผิดชอบ จ', email: 'owner.e@example.invalid' }, { name: '', email: '' }, { name: '', email: '' }] }
    ],
    weights: [5, 5, 75, 5, 10],
    audit: [
      { time: 'ตัวอย่าง · 08 ก.ย. 2569', type: 'เอกสาร', item: 'หนังสืออนุมัติแผนใหญ่', action: 'แทนที่ไฟล์', detail: 'ฉบับ v1 → v2; เก็บฉบับเก่าไว้' },
      { time: 'ตัวอย่าง · 04 ก.ย. 2569', type: 'โครงการ', item: 'DEMO-05', action: 'นำออกจากการใช้งาน', detail: 'วงเงิน 100,000 บาทรอจัดการต่อ' }
    ]
  } };
  let activeYear = 2569;
  let data = yearRecords[activeYear];

  root.innerHTML = `
    <section class="ac-year-selector card" aria-label="เลือกปีงบประมาณ"><div><span class="ac-kicker">ใช้งานต่อเนื่องทุกปี</span><h2>เลือกปีงบประมาณก่อนจัดการข้อมูล</h2><p>แต่ละปีมีงบ โครงการ เอกสาร และประวัติของตัวเอง · ปีใหม่เริ่มจากข้อมูลว่าง</p></div><div class="ac-year-picker"><label>ปีงบประมาณ<select id="ac-year-select"><option value="2568">2568 · กรอกย้อนหลัง</option><option value="2569" selected>2569 · ข้อมูลตัวอย่าง</option><option value="2570">2570 · เตรียมปีใหม่</option></select></label><button type="button" class="btn quiet-btn" id="ac-add-year">+ เพิ่มปีงบอื่น</button></div></section>
    <form class="ac-year-other card" id="ac-other-year-form" hidden><label>ระบุปีงบประมาณ พ.ศ.<input id="ac-other-year-input" type="number" min="2500" max="2699" step="1" required placeholder="เช่น 2571"></label><button type="submit" class="btn primary-btn">เปิดปีงบนี้</button><button type="button" class="btn quiet-btn" id="ac-other-year-cancel">ยกเลิก</button></form>
    <section class="ac-year-create card" id="ac-year-create" hidden><span class="ac-kicker" id="ac-create-kicker"></span><h2 id="ac-create-title"></h2><p id="ac-create-description"></p><form id="ac-year-form" class="ac-year-form"><label>งบที่อนุมัติในปีนี้ (บาท)<input id="ac-year-budget" type="number" min="0" step="1000" required placeholder="กรอกตามหนังสืออนุมัติ"></label><label>เลขที่หนังสือ / เหตุผลตั้งปีงบ<input id="ac-year-reference" required placeholder="เช่น หนังสืออนุมัติงบประจำปี"></label><label class="ac-year-copy"><input id="ac-year-copy" type="checkbox"> คัดลอกหน่วยงานและค่าน้ำหนักจากปี 2569 เพื่อตรวจทานต่อ</label><button type="submit" class="btn primary-btn" id="ac-year-create-button">สร้างปีงบในตัวอย่าง</button></form><p class="ac-explain">ไม่คัดลอกโครงการ รายงานผล หรือเอกสารข้ามปี · ต้องใส่ข้อมูลและหลักฐานของปีนั้นใหม่</p></section>
    <div id="ac-year-workspace">
    <div class="ac-intro card"><div><span class="ac-kicker" id="ac-intro-year">ภาพรวมปีงบประมาณ 2569</span><h2>เรื่องที่แอดมินต้องเห็นก่อนเริ่มงาน</h2><p id="ac-intro-description">สถานการณ์จำลอง 5 โครงการ เพื่อทดลองวิธีจัดการงบ คน และรายงาน · ไม่เชื่อมกับชีทจริง</p></div><span class="ac-demo">ข้อมูลตัวอย่าง</span></div>
    <nav class="ac-jump" aria-label="ส่วนงานแอดมิน"><button type="button" data-jump="ac-budget-section">งบปี</button><button type="button" data-jump="ac-dept-section">หน่วยงาน</button><button type="button" data-jump="ac-weight-section">ค่าน้ำหนัก</button><button type="button" data-jump="ac-project-section">โครงการ</button><button type="button" data-jump="admin-documents">เอกสาร</button><button type="button" data-jump="ac-audit-section">ประวัติ</button></nav>
    <section class="ac-budget-card card" id="ac-budget-section"><div class="ac-section-title"><div><span class="ac-kicker">01 · งบปีและความพร้อม</span><h2>เงินอนุมัติไปอยู่ตรงไหนแล้ว</h2><p>โครงการที่ยกเลิกแสดงแยกจากโครงการที่ใช้งาน เพื่อไม่ให้ดูเหมือนจัดสรรครบ</p></div><span class="ac-year" id="ac-budget-year">ปี 2569</span></div><div class="ac-metrics"><div><span>งบอนุมัติทั้งปี</span><strong id="ac-master-value"></strong><small>กรอบงบที่แอดมินกำหนด</small></div><div><span>จัดสรรให้โครงการที่ใช้งาน</span><strong id="ac-active-value"></strong><small id="ac-active-count"></small></div><div class="ac-metric-warn"><span>ยังต้องจัดการ</span><strong id="ac-gap-value"></strong><small id="ac-gap-note"></small></div><div><span>โครงการยกเลิก</span><strong id="ac-cancel-value"></strong><small id="ac-cancel-count"></small></div></div><div class="ac-budget-track" role="img" aria-label="สัดส่วนงบที่จัดสรรให้โครงการใช้งาน"><span id="ac-budget-fill"></span></div><div class="ac-budget-caption"><span id="ac-budget-message"></span><button type="button" class="ac-link" data-jump="ac-project-section">ดูรายการโครงการ →</button></div><form id="ac-budget-form" class="ac-inline-form"><label>ปรับงบรวมประจำปี (บาท)<input id="ac-budget-input" type="number" min="0" step="1000" required></label><label>เหตุผล / เอกสารอนุมัติ<input id="ac-budget-reason" placeholder="เช่น หนังสือจัดสรรฉบับแก้ไข" required></label><button type="submit" class="btn quiet-btn">บันทึกตัวอย่าง</button></form><div class="ac-form-message" id="ac-budget-feedback" role="status"></div></section>
    <section class="ac-todo card" id="ac-todo-section"><div class="ac-section-title"><div><span class="ac-kicker">งานที่ต้องทำวันนี้</span><h2>แก้เรื่องสำคัญจากจุดเดียว</h2></div><span class="ac-small-chip" id="ac-todo-count"></span></div><div id="ac-todo-list" class="ac-todo-list"></div><div class="ac-reminder-result" id="ac-reminder-result" hidden></div></section>
    <section class="ac-panel card" id="ac-dept-section"><div class="ac-section-title"><div><span class="ac-kicker">02 · หน่วยงาน</span><h2>หัวหน้างานปัจจุบันและประวัติการเปลี่ยน</h2><p>เปลี่ยนคนได้โดยเก็บช่วงเวลาของคนเดิมไว้ให้ตรวจย้อนหลัง</p></div><button type="button" class="btn quiet-btn" id="ac-new-dept">+ เพิ่มหน่วยงาน</button></div><div class="table-scroll"><table class="ac-table"><thead><tr><th>หน่วยงาน</th><th>หัวหน้าปัจจุบัน</th><th>อีเมล</th><th>เริ่มเมื่อ</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody id="ac-dept-rows"></tbody></table></div><div id="ac-dept-history" class="ac-history-detail" hidden></div><form id="ac-dept-form" class="ac-edit-form" hidden><h3 id="ac-dept-form-title">แก้ข้อมูลหน่วยงาน</h3><div class="ac-form-grid"><label>ชื่อหน่วยงาน<input id="ac-dept-name" required></label><label>ชื่อหัวหน้างาน<input id="ac-dept-head" required></label><label>อีเมลหัวหน้างาน<input id="ac-dept-email" type="email" required></label><label>วันที่เริ่มมีผล<input id="ac-dept-since" type="date" required></label><label class="wide">เหตุผลที่เปลี่ยน / คำสั่งแต่งตั้ง<input id="ac-dept-reason" required placeholder="เช่น เปลี่ยนหัวหน้าตามวาระ"></label></div><div class="ac-form-actions"><button class="btn primary-btn" type="submit">บันทึกข้อมูลตัวอย่าง</button><button class="btn quiet-btn" type="button" id="ac-cancel-dept">ยกเลิก</button></div></form></section>
    <section class="ac-panel card" id="ac-weight-section"><div class="ac-section-title"><div><span class="ac-kicker">03 · วิธีคำนวณ</span><h2>ค่าน้ำหนักความก้าวหน้า</h2><p>น้ำหนักงานแต่ละขั้นตอน แยกจากสัดส่วนงบของโครงการ</p></div><span class="ac-year" id="ac-weight-year">ชุดค่าปี 2569 · รุ่น 1</span></div><div class="ac-weight-grid" id="ac-weight-fields"></div><div class="ac-weight-preview"><div><span>ผลรวมค่าน้ำหนัก</span><strong id="ac-weight-total"></strong></div><div><span>ความก้าวหน้าตัวอย่างด้วยค่าปัจจุบัน</span><strong id="ac-weight-current"></strong></div><div><span>หากใช้ค่าที่กำลังกรอก</span><strong id="ac-weight-proposed"></strong></div></div><p class="ac-explain">ตัวอย่างนี้ใช้ผลสะสมรายขั้น 100 / 100 / 60 / 40 / 20% · การเปลี่ยนค่าน้ำหนักจริงควรเก็บรุ่นและวันที่มีผล เพื่อไม่ให้รายงานย้อนหลังเปลี่ยนเงียบ ๆ</p><form id="ac-weight-form" class="ac-inline-form"><label>เหตุผลที่ปรับ<input id="ac-weight-reason" required placeholder="เช่น ปรับตามลักษณะงานปีที่เลือก"></label><button class="btn primary-btn" id="ac-save-weights" type="submit">บันทึกชุดค่าใหม่</button><button class="btn quiet-btn" id="ac-reset-weights" type="button">คืนค่าเริ่มต้น</button></form><div class="ac-form-message" id="ac-weight-feedback" role="status"></div></section>
    <section class="ac-panel card" id="ac-project-section"><div class="ac-section-title"><div><span class="ac-kicker">04 · โครงการ</span><h2>วงเงินและคนรับผิดชอบทุกโครงการ</h2><p>แก้ชื่อ งบ หน่วยงาน และผู้รับผิดชอบได้สูงสุด 3 คน โดยเก็บข้อมูลก่อน–หลัง</p></div><button type="button" class="btn quiet-btn" id="ac-new-project">+ เพิ่มโครงการ</button></div><div class="ac-table-tools"><label>ค้นหาโครงการ<input id="ac-project-search" placeholder="ชื่อหรือรหัสโครงการ"></label><label>สถานะ<select id="ac-project-filter"><option value="all">ทั้งหมด</option><option value="active">ใช้งาน</option><option value="cancelled">ยกเลิก</option></select></label><span id="ac-project-count"></span></div><div class="table-scroll"><table class="ac-table ac-project-table"><thead><tr><th>โครงการ</th><th>หน่วยงาน</th><th>วงเงิน (บาท)</th><th>ผู้รับผิดชอบหลัก</th><th>รายงานเดือนนี้</th><th>สถานะ</th><th>จัดการ</th></tr></thead><tbody id="ac-project-rows"></tbody></table></div><div id="ac-project-history" class="ac-history-detail" hidden></div><form id="ac-project-form" class="ac-edit-form" hidden><h3 id="ac-project-form-title">แก้ข้อมูลโครงการ</h3><div class="ac-form-grid"><label class="wide">ชื่อโครงการ<input id="ac-project-name" required></label><label>หน่วยงาน<select id="ac-project-dept" required></select></label><label>วงเงินจัดสรร (บาท)<input id="ac-project-budget" type="number" min="0" step="1000" required></label><label>สถานะ<select id="ac-project-status"><option value="active">ใช้งาน</option><option value="cancelled">ยกเลิก / นำออก</option></select></label><div class="ac-owner-heading">ผู้รับผิดชอบหลักและผู้รับผิดชอบรอง · อีเมลตัวอย่างใช้สำหรับจำลองการแจ้งเตือน</div><label>ผู้รับผิดชอบหลัก<input id="ac-owner-name-0" required></label><label>อีเมลหลัก<input id="ac-owner-email-0" type="email" required></label><label>ผู้รับผิดชอบรอง 1<input id="ac-owner-name-1"></label><label>อีเมลรอง 1<input id="ac-owner-email-1" type="email"></label><label>ผู้รับผิดชอบรอง 2<input id="ac-owner-name-2"></label><label>อีเมลรอง 2<input id="ac-owner-email-2" type="email"></label><label class="wide">เหตุผลที่เปลี่ยน / หนังสืออ้างอิง<input id="ac-project-reason" required placeholder="เช่น เปลี่ยนผู้รับผิดชอบตามคำสั่ง หรือปรับวงเงิน"></label></div><div class="ac-form-actions"><button type="submit" class="btn primary-btn">บันทึกข้อมูลตัวอย่าง</button><button type="button" class="btn quiet-btn" id="ac-cancel-project">ยกเลิก</button></div><p class="ac-explain">รูปวงกลมในตารางใช้อักษรย่อก่อน รูปถ่ายจริงเป็นทางเลือกเสริมเมื่อผู้ใช้ยินยอมและมีผู้ดูแลไฟล์</p></form></section>
    <section class="ac-panel card" id="ac-audit-section"><div class="ac-section-title"><div><span class="ac-kicker">05 · ตรวจย้อนหลัง</span><h2>ประวัติที่แอดมินควรเปิดดูได้</h2><p>ข้อมูลก่อน–หลัง เหตุผล และเวลาในต้นแบบนี้แสดงเฉพาะการทดลอง ไม่ใช่ประวัติจากระบบจริง</p></div></div><div class="table-scroll"><table class="ac-table"><thead><tr><th>เมื่อ</th><th>หัวข้อ</th><th>รายการ</th><th>ทำอะไร</th><th>รายละเอียด</th></tr></thead><tbody id="ac-audit-rows"></tbody></table></div></section>
    </div>
  `;

  const activeProjects = () => data.projects.filter(project => project.status === 'active');
  const activeTotal = () => activeProjects().reduce((sum, project) => sum + project.budget, 0);
  const cancelledTotal = () => data.projects.filter(project => project.status === 'cancelled').reduce((sum, project) => sum + project.budget, 0);
  const departmentName = id => data.departments.find(dept => dept.id === id)?.name || 'ไม่พบหน่วยงาน';
  const stamp = () => new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
  const thaiDate = value => value ? new Date(`${value}T00:00:00`).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
  const initials = name => String(name || '?').trim().replace(/^(ผู้รับผิดชอบ|ผู้ช่วย|หัวหน้า)(ตัวอย่าง)?\s*/, '').slice(0, 2) || '?';

  function toast(message) {
    const box = document.getElementById('toast');
    box.textContent = message;
    box.classList.add('show');
    setTimeout(() => box.classList.remove('show'), 4200);
  }

  function log(type, item, action, detail, year = activeYear) {
    yearRecords[year]?.audit.unshift({ time: stamp(), type, item, action, detail });
    if (year === activeYear) renderAudit();
  }

  function announceYear() {
    window.dispatchEvent(new CustomEvent('mockup:admin-year-change', {
      detail: { year: activeYear, projects: data?.projects || [], created: Boolean(data) }
    }));
  }

  function renderYear() {
    activeYear = Number($('#ac-year-select').value);
    data = yearRecords[activeYear] || null;
    const missing = !data;
    $('#ac-year-create').hidden = !missing;
    $('#ac-year-workspace').hidden = missing;
    document.getElementById('view-admin').classList.toggle('ac-year-uncreated', missing);
    if (missing) {
      const backfill = activeYear < 2569;
      $('#ac-create-kicker').textContent = backfill ? 'กรอกข้อมูลย้อนหลัง' : 'เตรียมข้อมูลปีใหม่';
      $('#ac-create-title').textContent = `ยังไม่ได้ตั้งปีงบประมาณ ${activeYear}`;
      $('#ac-create-description').textContent = backfill
        ? 'เริ่มจากงบที่อนุมัติจริง แล้วเพิ่มหน่วยงาน โครงการ และเอกสารจากหลักฐานของปีนั้น'
        : 'ตั้งงบปีใหม่ก่อน จากนั้นตรวจรายชื่อหน่วยงาน เพิ่มโครงการและเอกสารฉบับของปีใหม่';
      $('#ac-year-copy').checked = !backfill;
      $('#ac-year-budget').value = '';
      $('#ac-year-reference').value = '';
      announceYear();
      return;
    }
    $('#ac-intro-year').textContent = `ภาพรวมปีงบประมาณ ${activeYear}`;
    $('#ac-intro-description').textContent = activeYear === 2569
      ? 'สถานการณ์จำลอง 5 โครงการ เพื่อทดลองวิธีจัดการงบ คน และรายงาน · ไม่เชื่อมกับชีทจริง'
      : `ข้อมูลตัวอย่างปี ${activeYear} · ${data.projects.length} โครงการ · แยกจากปีงบอื่น`;
    $('#ac-budget-year').textContent = `ปี ${activeYear}`;
    $('#ac-weight-year').textContent = `ชุดค่าปี ${activeYear} · รุ่นตัวอย่าง`;
    $('#ac-dept-form').hidden = true;
    $('#ac-project-form').hidden = true;
    $('#ac-dept-history').hidden = true;
    $('#ac-project-history').hidden = true;
    $('#ac-reminder-result').hidden = true;
    $('#ac-budget-feedback').textContent = '';
    $('#ac-weight-feedback').textContent = '';
    $('#ac-project-search').value = '';
    $('#ac-project-filter').value = 'all';
    root.querySelectorAll('.ac-weight-input').forEach((input, index) => { input.value = data.weights[index]; });
    renderDepartments(); renderProjects(); renderBudget(); renderWeights(); renderAudit();
    announceYear();
  }

  function renderBudget() {
    const active = activeTotal();
    const gap = data.annualBudget - active;
    const cancelled = cancelledTotal();
    $('#ac-master-value').textContent = `${money(data.annualBudget)} บาท`;
    $('#ac-active-value').textContent = `${money(active)} บาท`;
    $('#ac-active-count').textContent = `${activeProjects().length} โครงการที่ใช้งาน`;
    $('#ac-gap-value').textContent = `${money(Math.abs(gap))} บาท`;
    $('#ac-gap-note').textContent = gap > 0 ? 'รอจัดสรรหรือคืนงบ' : gap < 0 ? 'จัดสรรเกินกรอบงบ' : 'จัดสรรครบแล้ว';
    $('#ac-cancel-value').textContent = `${money(cancelled)} บาท`;
    $('#ac-cancel-count').textContent = cancelled && gap <= 0 ? 'วงเงินเดิม · จัดสรรทดแทนแล้ว' : `${data.projects.filter(project => project.status === 'cancelled').length} โครงการ · ไม่นับในยอดใช้งาน`;
    $('#ac-budget-fill').style.width = `${Math.max(0, Math.min(100, data.annualBudget ? active / data.annualBudget * 100 : 0))}%`;
    $('#ac-budget-message').textContent = gap > 0 ? `ยังมี ${money(gap)} บาทให้ระบุว่าจะจัดสรรใหม่หรือคืนงบ` : gap < 0 ? `โครงการที่ใช้งานเกินกรอบ ${money(-gap)} บาท · ตรวจวงเงินทันที` : 'วงเงินของโครงการที่ใช้งานเท่ากับงบอนุมัติแล้ว';
    $('#ac-budget-input').value = String(data.annualBudget);
    renderTasks();
  }

  function renderTasks() {
    const gap = data.annualBudget - activeTotal();
    const missingReports = activeProjects().filter(project => !project.reported);
    const tasks = [];
    if (!data.departments.some(dept => dept.active)) tasks.push({ kind: 'document', title: 'เพิ่มหน่วยงานและหัวหน้าที่รับผิดชอบในปีนี้', detail: 'ข้อมูลย้อนหลังให้ตรวจชื่อและช่วงเวลาจากคำสั่งของปีนั้น', label: 'เปิดหน่วยงาน', action: 'departments' });
    if (gap !== 0) tasks.push({ kind: 'money', title: gap > 0 ? `งบ ${money(gap)} บาทยังไม่มีโครงการใช้งานรองรับ` : `จัดสรรเกินงบ ${money(-gap)} บาท`, detail: 'ตรวจโครงการที่ยกเลิกและบันทึกการจัดสรรทดแทนหรือคืนงบ', label: 'เปิดโครงการ', action: 'projects' });
    if (!data.projects.length) tasks.push({ kind: 'document', title: `เพิ่มรายการโครงการของปี ${activeYear}`, detail: 'โครงการชื่อเดิมในปีใหม่ต้องมีวงเงินและผู้รับผิดชอบของปีใหม่', label: 'เพิ่มโครงการ', action: 'projects' });
    if (missingReports.length) tasks.push({ kind: 'report', title: `${missingReports.length} โครงการยังไม่ส่งรายงานเดือนนี้`, detail: `ตัวอย่าง: ${missingReports.map(project => project.name).join(', ')}`, label: 'ดูผู้รับแจ้งเตือน', action: 'remind' });
    if (data.projects.length) tasks.push({ kind: 'document', title: 'ตรวจชุดเอกสารก่อนให้ผู้ใช้เริ่มงาน', detail: activeYear === 2569 ? 'มีโครงการตัวอย่างที่ยังขาดหนังสืออนุมัติโครงการ' : `ตรวจเอกสารฉบับปี ${activeYear} ของแต่ละโครงการ`, label: 'เปิดศูนย์เอกสาร', action: 'documents' });
    else if (activeYear !== 2569) tasks.push({ kind: 'document', title: `เตรียมหนังสือส่วนกลางปี ${activeYear}`, detail: 'หนังสืออนุมัติแผนใหญ่และหนังสือจัดสรรต้องเป็นฉบับของปีนี้', label: 'เปิดศูนย์เอกสาร', action: 'documents' });
    $('#ac-todo-count').textContent = `${tasks.length} เรื่องติดตาม`;
    $('#ac-todo-list').innerHTML = tasks.map(task => `<div class="ac-todo-item"><span class="ac-todo-icon ${task.kind}">${task.kind === 'money' ? '฿' : task.kind === 'report' ? '✎' : '▤'}</span><div><strong>${safe(task.title)}</strong><small>${safe(task.detail)}</small></div><button type="button" class="ac-link" data-task="${task.action}">${task.label} →</button></div>`).join('');
  }

  function renderDepartments() {
    $('#ac-dept-rows').innerHTML = data.departments.length ? data.departments.map(dept => `<tr><td><strong>${safe(dept.name)}</strong><small>${safe(dept.id)}</small></td><td><span class="ac-person"><span class="ac-avatar">${safe(initials(dept.head))}</span>${safe(dept.head)}</span></td><td>${safe(dept.email)}</td><td>${safe(thaiDate(dept.since))}</td><td><span class="ac-badge ${dept.active ? 'active' : 'inactive'}">${dept.active ? 'ใช้งาน' : 'หยุดใช้'}</span></td><td><div class="ac-row-actions"><button type="button" data-edit-dept="${safe(dept.id)}">แก้ไข</button><button type="button" data-history-dept="${safe(dept.id)}">ประวัติ</button><button type="button" data-toggle-dept="${safe(dept.id)}">${dept.active ? 'ปิดใช้' : 'คืน'}</button></div></td></tr>`).join('') : '<tr><td colspan="6">ยังไม่มีหน่วยงานในปีนี้ · กด “เพิ่มหน่วยงาน” เพื่อเริ่มกรอกข้อมูล</td></tr>';
    $('#ac-project-dept').innerHTML = data.departments.filter(dept => dept.active).map(dept => `<option value="${safe(dept.id)}">${safe(dept.name)}</option>`).join('');
  }

  function renderProjects() {
    const query = $('#ac-project-search').value.trim().toLowerCase();
    const filter = $('#ac-project-filter').value;
    const rows = data.projects.filter(project => (filter === 'all' || project.status === filter) && (!query || `${project.id} ${project.name}`.toLowerCase().includes(query)));
    $('#ac-project-count').textContent = `แสดง ${rows.length} จาก ${data.projects.length} โครงการ`;
    $('#ac-project-rows').innerHTML = rows.length ? rows.map(project => `<tr><td><strong>${safe(project.name)}</strong><small>${safe(project.id)}</small></td><td>${safe(departmentName(project.dept))}</td><td class="ac-money">${money(project.budget)}</td><td><span class="ac-person"><span class="ac-avatar">${safe(initials(project.owners[0].name))}</span><span>${safe(project.owners[0].name)}<small>${safe(project.owners[0].email)}</small></span></span><small>รอง ${project.owners.slice(1).filter(owner => owner.name).length} คน</small></td><td><span class="ac-badge ${project.status === 'cancelled' ? 'inactive' : project.reported ? 'active' : 'attention'}">${project.status === 'cancelled' ? '—' : project.reported ? 'ส่งแล้ว' : 'ยังไม่ส่ง'}</span></td><td><span class="ac-badge ${project.status === 'active' ? 'active' : 'inactive'}">${project.status === 'active' ? 'ใช้งาน' : 'ยกเลิก'}</span></td><td><div class="ac-row-actions"><button type="button" data-edit-project="${safe(project.id)}">แก้ไข</button><button type="button" data-history-project="${safe(project.id)}">ประวัติ</button><button type="button" data-toggle-project="${safe(project.id)}">${project.status === 'active' ? 'นำออก' : 'คืน'}</button></div></td></tr>`).join('') : '<tr><td colspan="7">ยังไม่มีโครงการในปีนี้ · กด “เพิ่มโครงการ” หลังตรวจข้อมูลหน่วยงาน</td></tr>';
  }

  function renderWeights() {
    const fields = [...root.querySelectorAll('.ac-weight-input')];
    const proposed = fields.map(input => Number(input.value) || 0);
    const sum = proposed.reduce((total, value) => total + value, 0);
    const progress = weights => weights.reduce((total, weight, index) => total + weight * [100, 100, 60, 40, 20][index] / 100, 0);
    $('#ac-weight-total').textContent = `${sum}% ${sum === 100 ? '✓' : '· ต้องเท่ากับ 100%'}`;
    $('#ac-weight-total').classList.toggle('ac-invalid', sum !== 100);
    $('#ac-weight-current').textContent = `${progress(data.weights).toFixed(1)}%`;
    $('#ac-weight-proposed').textContent = `${progress(proposed).toFixed(1)}%`;
    $('#ac-save-weights').disabled = sum !== 100 || proposed.some(value => value < 0);
  }

  function renderAudit() {
    $('#ac-audit-rows').innerHTML = data.audit.length ? data.audit.map(entry => `<tr><td>${safe(entry.time)}</td><td>${safe(entry.type)}</td><td>${safe(entry.item)}</td><td><strong>${safe(entry.action)}</strong></td><td>${safe(entry.detail)}</td></tr>`).join('') : '<tr><td colspan="5">ยังไม่มีประวัติการแก้ไขของปีนี้</td></tr>';
  }

  function openDepartment(id = '') {
    const form = $('#ac-dept-form');
    const dept = data.departments.find(item => item.id === id);
    form.hidden = false;
    form.dataset.editId = dept?.id || '';
    $('#ac-dept-form-title').textContent = dept ? `แก้ข้อมูล ${dept.name}` : 'เพิ่มหน่วยงาน';
    $('#ac-dept-name').value = dept?.name || '';
    $('#ac-dept-head').value = dept?.head || '';
    $('#ac-dept-email').value = dept?.email || '';
    $('#ac-dept-since').value = dept?.since || fiscalStart(activeYear);
    $('#ac-dept-reason').value = '';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function openProject(id = '') {
    if (!data.departments.some(dept => dept.active)) { toast('เพิ่มหน่วยงานที่ใช้งานก่อน แล้วจึงเพิ่มโครงการ'); return; }
    const form = $('#ac-project-form');
    const project = data.projects.find(item => item.id === id);
    form.hidden = false;
    form.dataset.editId = project?.id || '';
    $('#ac-project-form-title').textContent = project ? `แก้ข้อมูล ${project.id}` : 'เพิ่มโครงการ';
    $('#ac-project-name').value = project?.name || '';
    $('#ac-project-dept').value = project?.dept || data.departments.find(dept => dept.active)?.id || '';
    $('#ac-project-budget').value = project?.budget ?? '';
    $('#ac-project-status').value = project?.status || 'active';
    for (let index = 0; index < 3; index++) {
      $(`#ac-owner-name-${index}`).value = project?.owners[index]?.name || '';
      $(`#ac-owner-email-${index}`).value = project?.owners[index]?.email || '';
    }
    $('#ac-project-reason').value = '';
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const weightLabels = ['ร่างโครงการ', 'ขออนุมัติ', 'ดำเนินการ', 'เบิกจ่าย', 'สรุปผล'];
  $('#ac-weight-fields').innerHTML = weightLabels.map((label, index) => `<label>${label}<span><input class="ac-weight-input" type="number" min="0" max="100" step="1" value="${data.weights[index]}" aria-label="ค่าน้ำหนัก ${label}">%</span></label>`).join('');
  $('#ac-add-year').addEventListener('click', () => { $('#ac-other-year-form').hidden = false; $('#ac-other-year-input').focus(); });
  $('#ac-other-year-cancel').addEventListener('click', () => { $('#ac-other-year-form').hidden = true; });
  $('#ac-other-year-form').addEventListener('submit', event => {
    event.preventDefault();
    const year = Number($('#ac-other-year-input').value);
    if (!Number.isInteger(year) || year < 2500 || year > 2699) return;
    const select = $('#ac-year-select');
    if (![...select.options].some(option => Number(option.value) === year)) {
      const next = [...select.options].find(option => Number(option.value) > year);
      select.add(new Option(`${year} · ปีงบที่เพิ่ม`, String(year)), next || null);
    }
    select.value = String(year);
    $('#ac-other-year-form').hidden = true;
    renderYear();
  });
  $('#ac-year-select').addEventListener('change', renderYear);
  $('#ac-year-form').addEventListener('submit', event => {
    event.preventDefault();
    if (yearRecords[activeYear]) return;
    const budget = Number($('#ac-year-budget').value);
    const reference = $('#ac-year-reference').value.trim();
    if (!Number.isFinite(budget) || budget < 0 || !reference) return;
    const copy = $('#ac-year-copy').checked;
    const prior = yearRecords[2569];
    yearRecords[activeYear] = {
      annualBudget: budget,
      departments: copy ? prior.departments.map(dept => ({ ...dept })) : [],
      projects: [],
      weights: copy ? [...prior.weights] : [5, 5, 75, 5, 10],
      audit: [{ time: stamp(), type: 'ปีงบประมาณ', item: `ปี ${activeYear}`, action: 'ตั้งปีงบ', detail: `${money(budget)} บาท · ${reference}${copy ? ' · คัดลอกหน่วยงาน/ค่าน้ำหนักจากปี 2569 เพื่อตรวจทาน' : ''}` }]
    };
    renderYear();
    toast(`สร้างปีงบ ${activeYear} ในต้นแบบแล้ว · เพิ่มโครงการและเอกสารของปีนี้ต่อได้`);
  });
  renderYear();

  root.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.jump) { document.getElementById(button.dataset.jump)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    if (button.dataset.task === 'departments') { $('#ac-dept-section').scrollIntoView({ behavior: 'smooth' }); return; }
    if (button.dataset.task === 'projects') { $('#ac-project-section').scrollIntoView({ behavior: 'smooth' }); return; }
    if (button.dataset.task === 'documents') { document.getElementById('admin-documents').scrollIntoView({ behavior: 'smooth' }); return; }
    if (button.dataset.task === 'remind') {
      const project = activeProjects().find(item => !item.reported);
      const result = $('#ac-reminder-result');
      result.hidden = false;
      result.innerHTML = `<strong>ตัวอย่างผู้ที่จะได้รับแจ้งเตือน</strong><p>${safe(project?.name || '')} · ${safe(project?.owners.filter(owner => owner.email).map(owner => `${owner.name} (${owner.email})`).join(' · ') || '')}</p><button type="button" class="btn quiet-btn" id="ac-preview-reminder">ทดลองแจ้งเตือน · ไม่ส่งอีเมล</button>`;
      result.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (button.id === 'ac-preview-reminder') { button.textContent = 'จำลองแล้ว · ไม่ได้ส่งอีเมล'; button.disabled = true; log('การแจ้งเตือน', activeProjects().find(item => !item.reported)?.id || 'โครงการ', 'ทดลองแจ้งเตือน', 'แสดงผู้รับตัวอย่างเท่านั้น ไม่ได้ส่งอีเมล'); toast('จำลองการแจ้งเตือนแล้ว · ไม่มีอีเมลถูกส่ง'); return; }
    if (button.id === 'ac-new-dept') { openDepartment(); return; }
    if (button.id === 'ac-cancel-dept') { $('#ac-dept-form').hidden = true; return; }
    if (button.dataset.editDept) { openDepartment(button.dataset.editDept); return; }
    if (button.dataset.historyDept) {
      const id = button.dataset.historyDept;
      const dept = data.departments.find(item => item.id === id);
      const entries = data.audit.filter(item => item.type === 'หน่วยงาน' && item.item === id);
      const box = $('#ac-dept-history'); box.hidden = false;
      box.innerHTML = `<strong>ประวัติ ${safe(dept?.name || id)}</strong>${entries.length ? entries.map(item => `<p>${safe(item.time)} · ${safe(item.detail)}</p>`).join('') : '<p>ยังไม่มีการเปลี่ยนหัวหน้าในต้นแบบนี้</p>'}`;
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return;
    }
    if (button.dataset.toggleDept) {
      const dept = data.departments.find(item => item.id === button.dataset.toggleDept);
      if (dept.active && activeProjects().some(project => project.dept === dept.id)) { toast('หน่วยงานนี้ยังมีโครงการใช้งานอยู่ · ย้ายโครงการก่อนปิดใช้'); return; }
      dept.active = !dept.active;
      log('หน่วยงาน', dept.id, dept.active ? 'คืนสถานะ' : 'ปิดใช้', `${dept.name} · ข้อมูลเดิมยังตรวจย้อนหลังได้`);
      renderDepartments(); renderTasks(); toast('เปลี่ยนสถานะหน่วยงานในต้นแบบแล้ว'); return;
    }
    if (button.id === 'ac-new-project') { openProject(); return; }
    if (button.id === 'ac-cancel-project') { $('#ac-project-form').hidden = true; return; }
    if (button.dataset.editProject) { openProject(button.dataset.editProject); return; }
    if (button.dataset.historyProject) {
      const id = button.dataset.historyProject;
      const entries = data.audit.filter(item => item.type === 'โครงการ' && item.item === id);
      const box = $('#ac-project-history'); box.hidden = false;
      box.innerHTML = `<strong>ประวัติ ${safe(id)}</strong>${entries.length ? entries.map(item => `<p>${safe(item.time)} · ${safe(item.detail)}</p>`).join('') : '<p>ยังไม่มีการเปลี่ยนแปลงในต้นแบบนี้</p>'}`;
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); return;
    }
    if (button.dataset.toggleProject) {
      openProject(button.dataset.toggleProject);
      $('#ac-project-status').value = $('#ac-project-status').value === 'active' ? 'cancelled' : 'active';
      $('#ac-project-reason').focus();
      toast('ระบุเหตุผล แล้วกดบันทึกเพื่อเปลี่ยนสถานะ'); return;
    }
    if (button.id === 'ac-reset-weights') {
      root.querySelectorAll('.ac-weight-input').forEach((input, index) => { input.value = [5, 5, 75, 5, 10][index]; });
      renderWeights(); $('#ac-weight-feedback').textContent = 'คืนค่าในช่องกรอกแล้ว · กดบันทึกพร้อมเหตุผลจึงจะเปลี่ยนชุดค่าปัจจุบัน'; return;
    }
  });

  $('#ac-budget-form').addEventListener('submit', event => {
    event.preventDefault();
    const value = Number($('#ac-budget-input').value);
    if (!Number.isFinite(value) || value < activeTotal()) { $('#ac-budget-feedback').textContent = `งบรวมต้องไม่น้อยกว่าวงเงินโครงการที่ใช้งาน ${money(activeTotal())} บาท`; return; }
    const before = data.annualBudget;
    data.annualBudget = value;
    log('งบรวม', `ปี ${activeYear}`, 'ปรับวงเงิน', `${money(before)} → ${money(value)} บาท · ${$('#ac-budget-reason').value.trim()}`);
    renderBudget(); $('#ac-budget-feedback').textContent = 'บันทึกงบตัวอย่างแล้ว · ไม่มีผลกับ Google Sheets';
    $('#ac-budget-reason').value = ''; toast('บันทึกงบตัวอย่างแล้ว');
  });

  $('#ac-dept-form').addEventListener('submit', event => {
    event.preventDefault();
    const id = event.currentTarget.dataset.editId;
    const before = data.departments.find(item => item.id === id);
    const name = $('#ac-dept-name').value.trim();
    const head = $('#ac-dept-head').value.trim();
    const email = $('#ac-dept-email').value.trim();
    const since = $('#ac-dept-since').value;
    const reason = $('#ac-dept-reason').value.trim();
    if (!name || !head || !email || !since || !reason) return;
    if (before) {
      const detail = `${before.head} → ${head}; ${before.email} → ${email}; มีผล ${since} · ${reason}`;
      Object.assign(before, { name, head, email, since });
      log('หน่วยงาน', before.id, 'แก้ไขหัวหน้า/ข้อมูล', detail);
    } else {
      const newId = `D${String(data.departments.length + 1).padStart(2, '0')}`;
      data.departments.push({ id: newId, name, head, email, since, active: true });
      log('หน่วยงาน', newId, 'เพิ่มหน่วยงาน', `${name} · หัวหน้า ${head} · ${reason}`);
    }
    renderDepartments(); renderProjects(); renderTasks(); event.currentTarget.hidden = true; announceYear(); toast('บันทึกข้อมูลหน่วยงานในต้นแบบแล้ว');
  });

  $('#ac-project-form').addEventListener('submit', event => {
    event.preventDefault();
    const id = event.currentTarget.dataset.editId;
    const previous = data.projects.find(item => item.id === id);
    const name = $('#ac-project-name').value.trim();
    const dept = $('#ac-project-dept').value;
    const budget = Number($('#ac-project-budget').value);
    const status = $('#ac-project-status').value;
    const reason = $('#ac-project-reason').value.trim();
    const owners = [0, 1, 2].map(index => ({ name: $(`#ac-owner-name-${index}`).value.trim(), email: $(`#ac-owner-email-${index}`).value.trim() }));
    if (!name || !dept || !reason || !owners[0].name || !owners[0].email || !Number.isFinite(budget) || budget < 0) return;
    if (owners.slice(1).some(owner => Boolean(owner.name) !== Boolean(owner.email))) { toast('ผู้รับผิดชอบรองต้องมีทั้งชื่อและอีเมล หรือเว้นทั้งคู่'); return; }
    const nextActive = activeTotal() - (previous?.status === 'active' ? previous.budget : 0) + (status === 'active' ? budget : 0);
    if (nextActive > data.annualBudget) { toast(`วงเงินโครงการใช้งานจะเกินงบปี ${money(nextActive - data.annualBudget)} บาท`); return; }
    if (previous) {
      const changes = [];
      if (previous.name !== name) changes.push(`ชื่อ: ${previous.name} → ${name}`);
      if (previous.budget !== budget) changes.push(`งบ: ${money(previous.budget)} → ${money(budget)} บาท`);
      if (previous.status !== status) changes.push(`สถานะ: ${previous.status === 'active' ? 'ใช้งาน' : 'ยกเลิก'} → ${status === 'active' ? 'ใช้งาน' : 'ยกเลิก'}`);
      if (previous.dept !== dept) changes.push(`หน่วยงาน: ${departmentName(previous.dept)} → ${departmentName(dept)}`);
      if (previous.owners[0].name !== owners[0].name || previous.owners[0].email !== owners[0].email) changes.push(`หลัก: ${previous.owners[0].name} → ${owners[0].name}`);
      if (JSON.stringify(previous.owners.slice(1)) !== JSON.stringify(owners.slice(1))) changes.push('ปรับผู้รับผิดชอบรอง');
      Object.assign(previous, { name, dept, budget, status, owners });
      log('โครงการ', previous.id, 'แก้ไขข้อมูล', `${changes.join('; ') || 'ยืนยันข้อมูลเดิม'} · เหตุผล: ${reason}`);
    } else {
      const prefix = activeYear === 2569 ? 'DEMO-' : `DEMO-${activeYear}-`;
      const nextNumber = Math.max(0, ...data.projects.filter(project => project.id.startsWith(prefix)).map(project => Number(project.id.slice(prefix.length)) || 0)) + 1;
      const newId = `${prefix}${String(nextNumber).padStart(2, '0')}`;
      data.projects.push({ id: newId, name, dept, budget, status, owners, reported: false });
      log('โครงการ', newId, 'เพิ่มโครงการ', `${name} · ${money(budget)} บาท · เหตุผล: ${reason}`);
    }
    renderProjects(); renderBudget(); event.currentTarget.hidden = true; announceYear(); toast('บันทึกโครงการในต้นแบบแล้ว · งบคงเหลือปรับตาม');
  });

  $('#ac-weight-form').addEventListener('submit', event => {
    event.preventDefault();
    const proposed = [...root.querySelectorAll('.ac-weight-input')].map(input => Number(input.value));
    if (proposed.some(value => !Number.isFinite(value) || value < 0) || proposed.reduce((sum, value) => sum + value, 0) !== 100) { $('#ac-weight-feedback').textContent = 'ผลรวมค่าน้ำหนักต้องเท่ากับ 100%'; return; }
    const before = data.weights.join('/');
    data.weights = proposed;
    log('ค่าน้ำหนัก', `ปี ${activeYear}`, 'ปรับชุดค่า', `${before} → ${proposed.join('/')} · ${$('#ac-weight-reason').value.trim()}`);
    renderWeights(); $('#ac-weight-reason').value = ''; $('#ac-weight-feedback').textContent = 'บันทึกชุดค่าตัวอย่างแล้ว · ผลรายงานจริงยังไม่ถูกคำนวณใหม่';
    toast('บันทึกค่าน้ำหนักตัวอย่างแล้ว');
  });
  root.querySelectorAll('.ac-weight-input').forEach(input => input.addEventListener('input', renderWeights));
  $('#ac-project-search').addEventListener('input', renderProjects);
  $('#ac-project-filter').addEventListener('change', renderProjects);
  window.addEventListener('mockup:admin-doc-change', event => {
    const detail = event.detail || {};
    log('เอกสาร', detail.item || 'เอกสารตัวอย่าง', detail.action || 'แก้ไข', detail.detail || '', Number(detail.year || activeYear));
  });
})();

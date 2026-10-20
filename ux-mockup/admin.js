(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const projects = {
    P1: { code: 'DEMO-01', name: 'โครงการจัดการขยะครบวงจร', expenseDocs: 'procurement' },
    P2: { code: 'DEMO-02', name: 'โครงการพลังงานสะอาด', expenseDocs: 'procurement' },
    P3: { code: 'DEMO-03', name: 'โครงการพื้นที่สีเขียว', expenseDocs: 'procurement' },
    P4: { code: 'DEMO-04', name: 'โครงการสื่อสารความยั่งยืน', expenseDocs: 'loan' }
  };
  const categories = {
    'annual-approval': 'อนุมัติแผนใหญ่', allocation: 'จัดสรร/เจียดจ่ายงบ',
    'project-approval': 'อนุมัติโครงการ', procurement: 'จัดซื้อจัดจ้าง',
    acceptance: 'ตรวจรับ', loan: 'เงินยืม/วางฎีกา', extension: 'ขยายเวลา/กันเงิน', other: 'อื่น ๆ'
  };
  const docs = [
    { id: 'D001', scope: 'central', project: '', category: 'annual-approval', title: 'หนังสืออนุมัติในหลักการแผนงานขับเคลื่อนฯ', number: 'ตัวอย่าง 001/2569', file: 'approval-plan-2569-v2.pdf', version: 2, status: 'current', date: '08 ก.ย. 2569', access: 'ผู้เกี่ยวข้องในมหาวิทยาลัย', replaces: 'D001A' },
    { id: 'D001A', scope: 'central', project: '', category: 'annual-approval', title: 'หนังสืออนุมัติในหลักการแผนงานขับเคลื่อนฯ', number: 'ตัวอย่าง 001/2569', file: 'approval-plan-2569-v1.pdf', version: 1, status: 'archived', date: '01 ก.ย. 2569', access: 'ผู้เกี่ยวข้องในมหาวิทยาลัย', replaces: '' },
    { id: 'D002', scope: 'central', project: '', category: 'allocation', title: 'หนังสืออนุมัติเจียดจ่ายงบประมาณประจำปี', number: 'ตัวอย่าง 014/2569', file: 'allocation-2569.pdf', version: 1, status: 'current', date: '08 ก.ย. 2569', access: 'ผู้เกี่ยวข้องในมหาวิทยาลัย', replaces: '' },
    { id: 'D003', scope: 'project', project: 'P1', category: 'project-approval', title: 'หนังสืออนุมัติโครงการจัดการขยะครบวงจร', number: 'ตัวอย่าง 025/2569', file: 'approval-waste.pdf', version: 1, status: 'current', date: '10 ก.ย. 2569', access: 'เฉพาะทีมโครงการ', replaces: '' },
    { id: 'D004', scope: 'project', project: 'P2', category: 'project-approval', title: 'หนังสืออนุมัติโครงการพลังงานสะอาด', number: 'ตัวอย่าง 026/2569', file: 'approval-energy.pdf', version: 1, status: 'current', date: '12 ก.ย. 2569', access: 'เฉพาะทีมโครงการ', replaces: '' },
    { id: 'D005', scope: 'project', project: 'P3', category: 'project-approval', title: 'หนังสืออนุมัติโครงการพื้นที่สีเขียว', number: 'ตัวอย่าง 027/2569', file: 'approval-green.pdf', version: 1, status: 'current', date: '12 ก.ย. 2569', access: 'เฉพาะทีมโครงการ', replaces: '' },
    { id: 'D006', scope: 'project', project: 'P3', category: 'procurement', title: 'เอกสารจัดซื้อจัดจ้างโครงการพื้นที่สีเขียว', number: 'ตัวอย่าง 030/2569', file: 'procurement-green.pdf', version: 1, status: 'current', date: '14 ก.ย. 2569', access: 'เฉพาะทีมโครงการ', replaces: '' }
  ];
  let selectedDocId = 'D001';
  const sdgReported = { sep: { actual: 72, evidence: 'ใบชั่งและรายงานประจำเดือน · ตัวอย่าง' }, aug: { actual: 58, evidence: 'ใบชั่งและรายงานประจำเดือน · ตัวอย่าง' } };
  const activeDocs = () => docs.filter(d => d.status === 'current');
  const scopeName = d => d.scope === 'central' ? 'ส่วนกลาง · 2569' : `${projects[d.project].code} · ${projects[d.project].name}`;
  const findCurrent = (scope, project, category) => activeDocs().find(d => d.scope === scope && d.project === project && d.category === category);
  const addText = (parent, tag, value, className) => { const el = document.createElement(tag); el.textContent = value; if (className) el.className = className; parent.append(el); return el; };

  function showToast(message) {
    const box = $('#toast');
    box.textContent = message;
    box.classList.add('show');
    setTimeout(() => box.classList.remove('show'), 4000);
  }

  function renderDocs() {
    const query = $('#admin-search').value.trim().toLowerCase();
    const scope = $('#admin-scope-filter').value;
    const status = $('#admin-status-filter').value;
    const filtered = docs.filter(d =>
      (scope === 'all' || d.scope === scope) &&
      (status === 'all' || d.status === status) &&
      (!query || `${d.title} ${d.number} ${d.file} ${scopeName(d)} ${categories[d.category]} 2569`.toLowerCase().includes(query))
    );
    $('#admin-result-count').textContent = `${filtered.length} เอกสาร`;
    const body = $('#admin-doc-body');
    body.replaceChildren();
    if (!filtered.length) {
      const tr = document.createElement('tr');
      const td = document.createElement('td'); td.colSpan = 6; td.textContent = 'ไม่พบเอกสารตามเงื่อนไขนี้'; tr.append(td); body.append(tr); return;
    }
    filtered.forEach(d => {
      const tr = document.createElement('tr');
      tr.classList.toggle('selected', d.id === selectedDocId);
      const titleCell = document.createElement('td');
      addText(titleCell, 'span', d.title, 'admin-doc-name');
      addText(titleCell, 'span', `${d.number} · ${d.file}`, 'admin-doc-meta');
      tr.append(titleCell);
      addText(tr, 'td', scopeName(d));
      addText(tr, 'td', categories[d.category]);
      addText(tr, 'td', `v${d.version}`);
      const statusCell = document.createElement('td');
      addText(statusCell, 'span', d.status === 'current' ? 'ใช้งาน' : 'ฉบับเก่า', `admin-status ${d.status === 'current' ? '' : 'old'}`);
      tr.append(statusCell);
      const actionCell = document.createElement('td');
      const button = addText(actionCell, 'button', 'รายละเอียด', 'admin-link-button');
      button.type = 'button';
      tr.append(actionCell);
      tr.addEventListener('click', () => { selectedDocId = d.id; renderDocs(); renderDetail(); });
      body.append(tr);
    });
  }

  function renderDetail() {
    const box = $('#admin-doc-detail');
    box.replaceChildren();
    const d = docs.find(item => item.id === selectedDocId);
    if (!d) { box.textContent = 'เลือกเอกสารจากตารางเพื่อดูรายละเอียด'; return; }
    addText(box, 'h3', d.title, 'admin-detail-title');
    const grid = addText(box, 'div', '', 'admin-detail-grid');
    [['ใช้กับ', scopeName(d)], ['ประเภท', categories[d.category]], ['เลขที่หนังสือ', d.number || 'ไม่ระบุ'], ['ฉบับและสถานะ', `v${d.version} · ${d.status === 'current' ? 'ใช้งาน' : 'ฉบับเก่า'}`], ['วันที่บันทึก', d.date], ['สิทธิ์อ่าน', d.access]].forEach(([label, value]) => {
      const cell = document.createElement('div');
      addText(cell, 'span', label); addText(cell, 'strong', value); grid.append(cell);
    });
    const history = addText(box, 'div', '', 'admin-history');
    addText(history, 'strong', 'ประวัติและการแทนที่');
    addText(history, 'p', d.replaces ? `ฉบับนี้ใช้แทน ${docs.find(x => x.id === d.replaces)?.file || 'ฉบับก่อน'}` : 'เป็นฉบับแรกของรายการนี้');
    if (d.status === 'current') {
      const button = addText(box, 'button', 'เตรียมไฟล์แทนที่ฉบับนี้', 'btn quiet-btn');
      button.type = 'button';
      button.addEventListener('click', () => {
        $('#admin-upload-scope').value = d.scope;
        $('#admin-upload-project').value = d.project || 'P1';
        $('#admin-upload-category').value = d.category;
        $('#admin-upload-title').value = d.title;
        $('#admin-upload-number').value = d.number;
        updateUploadFields();
        $('#admin-upload-replaces').value = d.id;
        $('#admin-upload-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  function kitFor(projectId) {
    const expenseDocs = projects[projectId].expenseDocs;
    return [
      { label: 'หนังสืออนุมัติแผนใหญ่ประจำปี', doc: findCurrent('central', '', 'annual-approval'), stage: 'before' },
      { label: 'หนังสือจัดสรร / เจียดจ่ายงบ', doc: findCurrent('central', '', 'allocation'), stage: 'before' },
      { label: 'หนังสืออนุมัติโครงการ', doc: findCurrent('project', projectId, 'project-approval'), stage: 'before' },
      { label: expenseDocs === 'loan' ? 'เอกสารเงินยืม / วางฎีกา' : 'เอกสารจัดซื้อจัดจ้าง', doc: findCurrent('project', projectId, expenseDocs), stage: 'later' }
    ];
  }

  function renderKit() {
    const id = $('#admin-project-select').value;
    const items = kitFor(id);
    const ready = items.filter(item => item.stage === 'before').every(item => item.doc);
    const beforeCount = items.filter(item => item.stage === 'before' && item.doc).length;
    const laterMissing = items.filter(item => item.stage === 'later' && !item.doc).length;
    const box = $('#admin-kit-status');
    box.classList.toggle('ready', ready);
    box.textContent = ready ? `พร้อมเริ่มงาน · เอกสารตั้งต้นครบ 3/3${laterMissing ? ` · ติดตามเอกสารขั้นดำเนินงาน ${laterMissing} รายการ` : ''}` : `ยังไม่พร้อมเริ่มงาน · เอกสารตั้งต้น ${beforeCount}/3`;
    $('#admin-ready-count').textContent = `${Object.keys(projects).filter(project => kitFor(project).filter(item => item.stage === 'before').every(item => item.doc)).length}/4 พร้อม`;
    const list = $('#admin-kit-list'); list.replaceChildren();
    items.forEach(item => {
      const row = addText(list, 'div', '', `admin-kit-item ${item.doc ? '' : item.stage === 'later' ? 'pending' : 'missing'}`);
      addText(row, 'span', item.doc ? '✓' : item.stage === 'later' ? '◷' : '!', 'symbol');
      const content = document.createElement('div');
      addText(content, 'strong', item.label);
      addText(content, 'small', item.doc ? `${item.doc.title} · v${item.doc.version}` : item.stage === 'later' ? 'ยังไม่ถึงขั้นตอนนี้ · แอดมินติดตามเมื่อเอกสารออก' : 'ยังไม่มีเอกสารตั้งต้นที่ใช้งานอยู่');
      row.append(content);
    });
    const preview = $('#admin-user-preview');
    if (!preview.hidden) renderUserPreview();
  }

  function renderUserPreview() {
    const id = $('#admin-project-select').value;
    const preview = $('#admin-user-preview'); preview.replaceChildren();
    addText(preview, 'strong', `ผู้ใช้โครงการ ${projects[id].name} จะเห็น:`);
    const list = document.createElement('ul');
    kitFor(id).forEach(item => addText(list, 'li', item.doc ? item.doc.title : `${item.label} — ยังไม่พร้อม`));
    preview.append(list);
  }

  function renderHomeDocs() {
    const query = $('#home-doc-search').value.trim().toLowerCase();
    const list = $('#home-doc-list'); list.replaceChildren();
    const items = kitFor('P1').filter(item => !query || `${item.label} ${item.doc?.title || ''} ${item.doc?.number || ''}`.toLowerCase().includes(query));
    if (!items.length) { addText(list, 'p', 'ไม่พบเอกสารตามคำค้นนี้', 'home-doc-empty'); return; }
    items.forEach(item => {
      const row = addText(list, 'div', '', 'home-doc-row');
      addText(row, 'span', item.doc ? '▤' : '!');
      const info = document.createElement('div');
      addText(info, 'strong', item.doc ? item.doc.title : `${item.label} · ${item.stage === 'later' ? 'รอเอกสารตามขั้นตอน' : 'แอดมินยังไม่ได้เตรียม'}`);
      addText(info, 'small', item.doc ? `${categories[item.doc.category]} · ${item.doc.number} · ฉบับ v${item.doc.version}` : item.stage === 'later' ? 'จะปรากฏเมื่อถึงขั้นตอนและมีเอกสารฉบับใช้งาน' : 'รายการตั้งต้นนี้ยังไม่พร้อมให้เปิดไฟล์');
      row.append(info);
      if (item.doc) {
        const button = addText(row, 'button', 'ดูข้อมูล', 'admin-link-button'); button.type = 'button';
        button.addEventListener('click', () => {
          const old = row.querySelector('.home-doc-more');
          if (old) { old.remove(); return; }
          addText(row, 'div', `ไฟล์ ${item.doc.file} · สิทธิ์อ่าน: ${item.doc.access} · ในระบบจริงจุดนี้จะเปิดไฟล์ฉบับที่ใช้งานอยู่`, 'home-doc-more');
        });
      }
    });
  }

  function updateUploadFields() {
    const scope = $('#admin-upload-scope').value;
    const project = $('#admin-upload-project').value;
    const category = $('#admin-upload-category').value;
    $('#admin-upload-project').disabled = scope === 'central';
    const select = $('#admin-upload-replaces');
    select.replaceChildren();
    const first = document.createElement('option'); first.value = ''; first.textContent = 'เอกสารใหม่ ไม่แทนฉบับเดิม'; select.append(first);
    activeDocs().filter(d => d.scope === scope && d.project === (scope === 'central' ? '' : project) && d.category === category).forEach(d => {
      const option = document.createElement('option'); option.value = d.id; option.textContent = `แทน v${d.version} · ${d.title}`; select.append(option);
    });
  }

  function renderSdg() {
    const focus = $('#exec-focus').value;
    const asOf = $('#exec-asof').value;
    const sdg = {
      P1: { tags: ['SDG 12', 'SDG 13'], indicator: 'SDG 12 · ปริมาณขยะที่คัดแยกได้', result: sdgReported[asOf].actual === null ? 'ยังไม่ระบุผลจริง' : `${sdgReported[asOf].actual} / 120 ตัน`, evidence: sdgReported[asOf].evidence, secondary: 'SDG 13 ยังต้องมีตัวชี้วัดการลดก๊าซเรือนกระจกและหลักฐานแยก' },
      P2: { tags: ['SDG 7', 'SDG 13'], indicator: 'SDG 7 · พลังงานสะอาดที่ผลิตได้', result: asOf === 'sep' ? '65,000 / 100,000 kWh' : '52,000 / 100,000 kWh', evidence: 'มิเตอร์และรายงานการผลิต · ตัวอย่าง', secondary: 'SDG 13 ต้องคำนวณผลลดการปล่อยก๊าซเรือนกระจกเพิ่มเติม' },
      P3: { tags: ['SDG 11', 'SDG 15'], indicator: 'SDG 11 · พื้นที่สีเขียวที่ปรับปรุงแล้ว', result: asOf === 'sep' ? '8,000 / 10,000 ตร.ม.' : '7,200 / 10,000 ตร.ม.', evidence: 'แผนผังและภาพถ่ายตรวจรับ · ตัวอย่าง', secondary: 'SDG 15 ควรมีข้อมูลคุณภาพระบบนิเวศเพิ่มเติม' },
      P4: { tags: ['SDG 17'], indicator: 'SDG 17 · จำนวนผู้เข้าร่วมกิจกรรม', result: asOf === 'sep' ? 'รอรายงานรอบกันยายน' : '280 / 800 คน', evidence: asOf === 'sep' ? 'ยังไม่มีหลักฐานเดือนกันยายน' : 'ทะเบียนผู้เข้าร่วม · ตัวอย่าง', secondary: 'ควรติดตามผลความร่วมมือที่เกิดขึ้นจริง ไม่ใช้จำนวนผู้เข้าร่วมเพียงอย่างเดียว' }
    }[focus];
    $('#sdg-project-name').textContent = projects[focus].name;
    $('#sdg-tags').replaceChildren();
    sdg.tags.forEach(tag => addText($('#sdg-tags'), 'span', tag));
    $('#sdg-indicator').textContent = `ตัวชี้วัด: ${sdg.indicator}`;
    $('#sdg-result').textContent = sdg.result;
    $('#sdg-evidence').textContent = `หลักฐาน: ${sdg.evidence}`;
    $('#sdg-secondary').textContent = sdg.secondary;
  }

  ['#admin-search', '#admin-scope-filter', '#admin-status-filter'].forEach(selector => $(selector).addEventListener('input', renderDocs));
  $('#home-doc-search').addEventListener('input', renderHomeDocs);
  $('#admin-project-select').addEventListener('change', renderKit);
  $('#admin-preview-button').addEventListener('click', () => {
    const box = $('#admin-user-preview'); box.hidden = !box.hidden;
    if (!box.hidden) renderUserPreview();
    $('#admin-preview-button').textContent = box.hidden ? 'ดูสิ่งที่ผู้ใช้จะเห็น' : 'ซ่อนตัวอย่างมุมผู้ใช้';
  });
  ['#admin-upload-scope', '#admin-upload-project', '#admin-upload-category'].forEach(selector => $(selector).addEventListener('change', updateUploadFields));
  $('#admin-upload-form').addEventListener('submit', event => {
    event.preventDefault();
    const file = $('#admin-upload-file').files[0];
    if (!file) { showToast('กรุณาเลือกไฟล์ก่อนจำลองเพิ่มเอกสาร'); return; }
    const scope = $('#admin-upload-scope').value;
    const project = scope === 'central' ? '' : $('#admin-upload-project').value;
    const replaces = $('#admin-upload-replaces').value;
    const old = docs.find(d => d.id === replaces);
    if (old) old.status = 'archived';
    const id = `DEMO-${Date.now()}`;
    docs.unshift({ id, scope, project, category: $('#admin-upload-category').value, title: $('#admin-upload-title').value.trim(), number: $('#admin-upload-number').value.trim() || 'ยังไม่ระบุ', file: file.name, version: old ? old.version + 1 : 1, status: 'current', date: new Date().toLocaleDateString('th-TH'), access: $('#admin-upload-access').value, replaces });
    selectedDocId = id;
    $('#admin-upload-form').reset();
    updateUploadFields(); renderDocs(); renderDetail(); renderKit(); renderHomeDocs();
    showToast('เพิ่มรายการจำลองแล้ว · ไฟล์ไม่ได้อัปโหลดไปยังระบบจริง');
  });
  $('#exec-focus').addEventListener('change', renderSdg);
  $('#exec-asof').addEventListener('change', renderSdg);
  window.renderSdgMock = renderSdg;
  window.saveSdgMock = () => {
    const period = $('#report-period').value;
    const key = period.includes('สิงหาคม') ? 'aug' : period.includes('กันยายน') ? 'sep' : null;
    if (!key) return;
    const value = $('#sdg-actual').value.trim();
    sdgReported[key].actual = value === '' ? null : Number(value);
    sdgReported[key].evidence = $('#sdg-evidence-file').files[0]?.name || sdgReported[key].evidence;
    renderSdg();
  };
  $('#report-period').addEventListener('change', () => {
    const period = $('#report-period').value;
    const key = period.includes('สิงหาคม') ? 'aug' : period.includes('กันยายน') ? 'sep' : null;
    $('#sdg-actual').value = key && sdgReported[key].actual !== null ? sdgReported[key].actual : '';
  });
  updateUploadFields(); renderDocs(); renderDetail(); renderKit(); renderHomeDocs(); renderSdg();
})();

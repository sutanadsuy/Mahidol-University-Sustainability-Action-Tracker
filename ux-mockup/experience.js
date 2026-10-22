(() => {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const fmt = value => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 }).format(Number(value) || 0);
  const DRAFT_KEY = 'mu-sustainability-mockup-report-draft-v1';
  const ROLE_KEY = 'mu-sustainability-mockup-role-v1';
  const app = window.mockup;
  let zeroSnapshot = null;
  let submittedThisSession = false;

  function getDraft() {
    try { return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null'); }
    catch { return null; }
  }

  function updateDraftBadge() {
    const draft = getDraft();
    const note = $('#draft-note');
    const resume = $('#resume-draft');
    if (draft?.fields?.length) {
      note.textContent = `มีร่าง${draft.period} · บันทึก ${draft.savedAt} · กรุณาเลือกไฟล์อีกครั้งเมื่อทำต่อ`;
      resume.hidden = false;
    } else {
      note.textContent = 'ยังไม่มีร่างที่บันทึกบนเครื่องนี้ · ไฟล์ที่เลือกจะไม่ถูกเก็บในร่าง';
      resume.hidden = true;
    }
    renderRole(localStorage.getItem(ROLE_KEY) || 'reporter');
  }

  function reportFields() {
    return $$('#view-report input, #view-report select, #view-report textarea')
      .filter(input => input.type !== 'file' && !input.disabled && !input.readOnly);
  }

  function saveDraft() {
    const draft = {
      period: $('#report-period').value,
      savedAt: new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }),
      step: app.getState().step,
      noProgress: $('#no-progress').checked,
      fields: reportFields().map(input => ({ value: input.value, checked: input.checked }))
    };
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      app.markDraftSaved();
      updateDraftBadge();
      app.toast('บันทึกร่างบนเครื่องนี้แล้ว · ไฟล์แนบต้องเลือกใหม่เมื่อกลับมาทำต่อ');
    } catch {
      app.toast('เบราว์เซอร์ไม่อนุญาตให้เก็บร่างบนเครื่องนี้');
    }
  }

  function resumeDraft() {
    const draft = getDraft();
    if (!draft?.fields?.length) return;
    reportFields().forEach((input, index) => {
      const saved = draft.fields[index];
      if (!saved) return;
      if (input.type === 'checkbox') input.checked = Boolean(saved.checked);
      else input.value = saved.value;
    });
    app.getState().previousPeriod = $('#report-period').value;
    $('#no-progress').checked = Boolean(draft.noProgress);
    app.updateReport();
    app.markDraftSaved();
    app.navigate('report', draft.step || 1);
    app.toast('เปิดร่างเดิมแล้ว · ตรวจข้อมูลและเลือกไฟล์แนบอีกครั้ง');
  }

  function renderRole(role) {
    const content = $('#role-content');
    if (!content) return;
    const draft = getDraft();
    if (role === 'executive') {
      content.innerHTML = `<div class="role-layout"><div class="role-main"><span class="role-label">ข้อมูลที่ควรเห็นก่อนประชุม</span><h3>ภาพรวมปีงบประมาณ 2569</h3><p>เห็นความคืบหน้า งบที่จ่ายจริง โครงการที่ล่าช้า และเรื่องที่ต้องตัดสินใจในหน้าเดียว</p><div class="role-metrics"><div><span>โครงการทั้งหมด</span><strong>4 โครงการ</strong></div><div><span>รายงานล่าสุด</span><strong>3 จาก 4</strong></div><div><span>เรื่องต้องติดตาม</span><strong>2 เรื่อง</strong></div></div><button class="btn primary-btn" data-go="executive">เปิดแดชบอร์ดผู้บริหาร →</button></div><div class="role-aside"><strong>ก่อนดูตัวเลข</strong><p>เลือกรอบข้อมูลถึงเดือนที่ต้องการ แล้วดูโครงการที่ช้ากว่าแผนพร้อมเหตุผลและการแก้ไข</p><span class="role-highlight">ข้อมูลตัวอย่าง ณ กันยายน 2569</span></div></div>`;
    } else if (role === 'admin') {
      content.innerHTML = `<div class="role-layout"><div class="role-main"><span class="role-label">สิ่งที่ต้องเตรียมให้คนทำงาน</span><h3>ข้อมูลพร้อมใช้หรือยัง</h3><p>ตรวจงบปี โครงการ ผู้รับผิดชอบ และเอกสารกลางจากจุดเดียว</p><div class="task-stack"><div><span class="task-dot done"></span><div><strong>ตั้งงบและโครงการ</strong><small>สถานการณ์ตัวอย่าง 5 โครงการในปี 2569</small></div><span class="task-state">พร้อม</span></div><div><span class="task-dot done"></span><div><strong>เอกสารส่วนกลาง</strong><small>ไฟล์อนุมัติแผนและจัดสรรงบ</small></div><span class="task-state">ดูสถานะ</span></div><div><span class="task-dot attention"></span><div><strong>ติดตามรายงานรายเดือน</strong><small>ยังขาดรายงาน 1 โครงการ</small></div><span class="task-state attention">ติดตาม</span></div></div><button class="btn primary-btn" data-go="admin">เปิดศูนย์แอดมิน →</button></div><div class="role-aside"><strong>ลดคำถาม “ไฟล์อยู่ไหน”</strong><p>จัดเอกสารส่วนกลางและเอกสารรายโครงการ พร้อมสถานะเผยแพร่และประวัติไฟล์</p><span class="role-highlight">ข้อมูลตัวอย่าง ไม่เชื่อม Drive</span></div></div>`;
    } else {
      content.innerHTML = `<div class="role-layout"><div class="role-main"><span class="role-label">งานของผู้รายงาน</span><h3>รายงานโครงการจัดการขยะครบวงจร</h3><p>รอบกันยายน 2569 · ส่งภายในวันที่ 26 · ระบบจะแสดงข้อมูลก่อนหน้าให้เทียบ</p><div class="task-stack"><div><span class="task-dot done"></span><div><strong>แผนโครงการ</strong><small>มีแผนรายเดือนและวงเงินแล้ว</small></div><span class="task-state">พร้อม</span></div><div><span class="task-dot ${draft || submittedThisSession ? 'done' : 'attention'}"></span><div><strong>กรอกผลเดือนนี้</strong><small>${submittedThisSession ? 'บันทึกตัวอย่างแล้วในรอบนี้' : draft ? `มีร่างบันทึก ${draft.savedAt}` : 'ความก้าวหน้า เงินที่จ่าย และสรุปผล'}</small></div><span class="task-state ${draft || submittedThisSession ? '' : 'attention'}">${submittedThisSession ? 'ส่งแล้ว' : draft ? 'มีร่าง' : 'ต้องทำ'}</span></div><div><span class="task-dot ${submittedThisSession ? 'done' : ''}"></span><div><strong>ตรวจทานและรับสรุป</strong><small>ได้รายงานหนึ่งหน้าทันทีหลังส่ง</small></div><span class="task-state">${submittedThisSession ? 'พร้อมดู' : 'รอส่ง'}</span></div></div><div class="role-cta"><button class="btn primary-btn" data-go="${submittedThisSession ? 'report-result' : 'report'}">${submittedThisSession ? 'ดูรายงานหนึ่งหน้า →' : draft ? 'ไปหน้ารายงาน / เปิดร่าง →' : 'เริ่มรายงานเดือนนี้ →'}</button><button class="btn quiet-btn" data-go="review">ดูแผนเทียบผล</button></div></div><div class="role-aside"><strong>เมื่อรายงานเสร็จ จะได้อะไร</strong><p>สรุปความก้าวหน้า เงินที่จ่าย สิ่งที่ทำ และประเด็นให้ผู้บริหารติดตามในหน้าเดียว</p><span class="role-highlight">${submittedThisSession ? 'รายงานตัวอย่างพร้อมเปิดดู' : 'ทดลองส่งรายงานเพื่อดูหน้าสรุป'}</span></div></div>`;
    }
    $$('.role-button').forEach(button => {
      const active = button.dataset.role === role;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function fillResult(savedAt) {
    const progress = app.computeProgress();
    const paid = $$('.paid-input').reduce((sum, input) => sum + Math.max(0, Number(input.value) || 0), 0);
    const behind = progress < 75;
    $('#result-period').textContent = $('#report-period').value;
    $('#result-saved').textContent = savedAt;
    const extension = $('#forecast-end').selectedIndex;
    $('#result-status').textContent = extension > 0
      ? `${behind ? 'ผลสะสมช้ากว่าแผน' : 'ผลสะสมตามแผน'} · คาดเสร็จช้า ${extension} เดือน`
      : (behind ? 'ล่าช้ากว่าแผน' : 'ตามแผนหรือเร็วกว่าแผน');
    $('#result-progress').textContent = `${progress}%`;
    $('#result-paid').textContent = `${fmt(paid)} บาท`;
    $('#result-total-paid').textContent = `${fmt(770000 + paid)} บาท`;
    $('#result-summary').textContent = $('#summary').value.trim() || '—';
    const sdg = $('#sdg-actual')?.value.trim();
    $('#result-sdg').textContent = sdg ? `SDG 12 · ปริมาณขยะที่คัดแยกได้ ${sdg} ตัน จากเป้าหมาย 120 ตัน` : 'ยังไม่ได้กรอกผลตัวชี้วัด SDG ในรอบนี้';
    const issue = $('#delay').value.trim();
    $('#result-issue').textContent = issue || (behind ? 'ผลล่าช้ากว่าแผน กรุณาตรวจรายละเอียดกับผู้รับผิดชอบ' : 'ไม่พบประเด็นที่ต้องเร่งแก้ไขในรอบนี้');
    const count = $$('#active-files li').filter(row => row.dataset.remove !== 'true').length;
    $('#result-files').textContent = count ? `มีไฟล์ประกอบ ${count} รายการในข้อมูลตัวอย่าง` : 'ไม่มีไฟล์ประกอบในข้อมูลตัวอย่าง';
  }

  $$('.role-button').forEach(button => button.addEventListener('click', () => {
    const role = button.dataset.role;
    localStorage.setItem(ROLE_KEY, role);
    renderRole(role);
  }));
  $('#role-content').addEventListener('click', event => {
    const target = event.target.closest('[data-go]');
    if (!target) return;
    if (target.dataset.go === 'report' && getDraft()) resumeDraft();
    else app.navigate(target.dataset.go);
  });
  $('#save-draft').addEventListener('click', saveDraft);
  $('#resume-draft').addEventListener('click', resumeDraft);
  $('#no-progress').addEventListener('change', event => {
    const checked = event.target.checked;
    const fields = [...$$('.actual-percent:not(:disabled)'), ...$$('.paid-input')];
    if (checked) {
      zeroSnapshot = fields.map(input => input.value);
      fields.forEach(input => { input.value = '0'; });
      app.setStep(3);
      app.toast('ใส่ผลและยอดจ่ายเป็นศูนย์แล้ว · กรุณาเขียนสรุปและสาเหตุ');
    } else if (zeroSnapshot) {
      fields.forEach((input, index) => { input.value = zeroSnapshot[index]; });
      zeroSnapshot = null;
    }
    app.markDirty('report');
    app.updateReport();
  });
  $('#print-result').addEventListener('click', () => window.print());
  window.addEventListener('mockup:report-saved', event => {
    submittedThisSession = true;
    localStorage.removeItem(DRAFT_KEY);
    updateDraftBadge();
    fillResult(event.detail.savedAt);
    app.navigate('report-result');
  });

  renderRole(localStorage.getItem(ROLE_KEY) || 'reporter');
  updateDraftBadge();
})();

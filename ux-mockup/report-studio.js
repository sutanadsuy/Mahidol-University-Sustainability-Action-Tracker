(() => {
  'use strict';

  const $ = selector => document.querySelector(selector);
  const app = window.mockup;
  const maxAvailable = 10;
  const maxFeatured = 3;
  const format = value => new Intl.NumberFormat('th-TH', { maximumFractionDigits: 1 }).format(value);
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const sampleArt = (kind, colors) => {
    const [sky, ground, accent] = colors;
    const motifs = {
      workshop: '<rect x="36" y="52" width="348" height="128" rx="10" fill="#fff" opacity=".84"/><rect x="92" y="69" width="236" height="68" rx="5" fill="#dceaf0"/><path d="M123 121 L168 91 L206 109 L261 78 L298 106" fill="none" stroke="#4b9a76" stroke-width="8" stroke-linecap="round"/><circle cx="115" cy="199" r="20" fill="#304f65"/><circle cx="194" cy="204" r="20" fill="#304f65"/><circle cx="271" cy="199" r="20" fill="#304f65"/><path d="M78 252q30-62 74 0m3 0q38-62 78 0m4 0q37-62 75 0" fill="#335c75"/>',
      bins: '<rect x="62" y="113" width="83" height="114" rx="9" fill="#2f9b72"/><rect x="167" y="103" width="83" height="124" rx="9" fill="#e8b44c"/><rect x="270" y="118" width="83" height="109" rx="9" fill="#4582c3"/><path d="M54 108h99m6-12h99m4 17h99" stroke="#26475b" stroke-width="12" stroke-linecap="round"/><circle cx="104" cy="163" r="17" fill="#e7f7e7"/><path d="M92 163h24m-12-12v24" stroke="#2f9b72" stroke-width="5"/>',
      campus: '<path d="M0 202q85-64 164-16t256-28v102H0" fill="#77b99a"/><path d="M0 225q132-59 236-13t184-8v56H0" fill="#448a6f"/><rect x="154" y="78" width="147" height="123" fill="#f7f5e9"/><rect x="141" y="69" width="174" height="17" fill="#466683"/><rect x="185" y="111" width="30" height="35" fill="#a5d6e2"/><rect x="240" y="111" width="30" height="35" fill="#a5d6e2"/><rect x="213" y="159" width="35" height="42" fill="#83ad95"/><path d="M57 186v-70m0 17q-46 12-29-26 14-22 29 4 16-29 34-5 12 25-34 27m309 52v-79m0 17q-42 10-24-26 15-22 24 5 17-31 33-4 12 25-33 25" stroke="#31795d" stroke-width="9" fill="#5baa71" stroke-linecap="round"/>',
      results: '<rect x="58" y="45" width="304" height="184" rx="11" fill="#fff" opacity=".9"/><path d="M86 196h247" stroke="#b7c8d6" stroke-width="3"/><rect x="103" y="153" width="40" height="43" rx="5" fill="#80c5a2"/><rect x="163" y="126" width="40" height="70" rx="5" fill="#4aa581"/><rect x="223" y="99" width="40" height="97" rx="5" fill="#2b846e"/><rect x="283" y="74" width="40" height="122" rx="5" fill="#e7b34e"/><path d="M101 99l54-14 54 6 54-28 55-11" fill="none" stroke="#2b648e" stroke-width="5" stroke-dasharray="9 6"/>'
    };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 260"><rect width="420" height="260" fill="${sky}"/><circle cx="350" cy="53" r="34" fill="${accent}" opacity=".46"/><path d="M0 215q90-31 196 5t224-20v60H0" fill="${ground}" opacity=".75"/>${motifs[kind]}</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  };

  const photos = [
    { id: 'demo-workshop', title: 'กิจกรรมอบรมทีมงาน', caption: 'อบรมแนวทางคัดแยกขยะ', src: sampleArt('workshop', ['#d9eff0', '#abd8c5', '#f3d77e']), sample: true },
    { id: 'demo-bins', title: 'จุดคัดแยกขยะ', caption: 'ติดตั้งจุดคัดแยกในพื้นที่นำร่อง', src: sampleArt('bins', ['#e5f2ef', '#c6dfc5', '#f8d995']), sample: true },
    { id: 'demo-campus', title: 'สำรวจพื้นที่', caption: 'ลงพื้นที่ติดตามการใช้งาน', src: sampleArt('campus', ['#d9eaf3', '#abd3a5', '#f7e6a9']), sample: true },
    { id: 'demo-results', title: 'สรุปตัวชี้วัด', caption: 'ทบทวนผลการดำเนินงานกับทีม', src: sampleArt('results', ['#ebeff9', '#c6e2d7', '#ffdc9a']), sample: true }
  ];
  let featured = photos.slice(0, maxFeatured).map(photo => photo.id);
  let submittedAt = '';
  let submittedExpenseEntries = [];

  function planExpenseRows() {
    return [...document.querySelectorAll('#view-plan .expense-plan-row')].map((row, index) => ({
      name: row.querySelector('input')?.value.trim() || `รายการที่ ${index + 1}`,
      type: row.querySelector('select')?.value || 'ค่าใช้จ่ายอื่น',
      budget: Math.max(0, Number(row.querySelector('.budget-input')?.value) || 0)
    })).filter(item => item.name);
  }

  function renderPlannedExpenses() {
    const host = $('#planned-expense-report-list');
    if (!host) return;
    const previous = new Map([...host.querySelectorAll('.expense-entry')].map(card => [card.dataset.key, {
      paid: card.querySelector('.paid-input')?.value || '0',
      status: card.querySelector('.procurement-status')?.value || '',
      checked: Boolean(card.querySelector('.inspect-check, .voucher-check')?.checked),
      evidence: card.querySelector('.evidence-file')?.files?.[0]?.name || card.querySelector('.evidence-name')?.dataset.filename || ''
    }]));
    const rows = planExpenseRows();
    if (!rows.length) {
      host.innerHTML = '<div class="report-no-photo">ยังไม่มีรายการงบในแผน · เพิ่มรายการในหน้าวางแผนโครงการก่อน</div>';
      return;
    }
    host.innerHTML = rows.map((item, index) => {
      const type = item.type.includes('จัดซื้อ') || item.type.includes('จ้าง') ? 'procurement' : item.type.includes('เงินยืม') ? 'loan' : 'other';
      const key = `${type}|${item.name}`;
      const prior = previous.get(key) || {};
      const defaultPaid = type === 'procurement' && index === 0 ? 850000 : type === 'loan' && index === 1 ? 30000 : 0;
      const status = prior.status || (type === 'procurement' ? 'อยู่ระหว่างจัดซื้อ/จ้าง' : type === 'loan' ? 'อยู่ระหว่างดำเนินการ' : 'ดำเนินการแล้ว');
      const statusControl = type === 'procurement'
        ? `<label>สถานะการจัดซื้อ/จ้าง<select class="procurement-status"><option ${status === 'ยังไม่ดำเนินการ' ? 'selected' : ''}>ยังไม่ดำเนินการ</option><option ${status === 'อยู่ระหว่างจัดซื้อ/จ้าง' ? 'selected' : ''}>อยู่ระหว่างจัดซื้อ/จ้าง</option><option ${status === 'จัดซื้อ/จ้างแล้ว' ? 'selected' : ''}>จัดซื้อ/จ้างแล้ว</option></select></label><label class="check-line"><input type="checkbox" class="inspect-check" ${prior.checked ? 'checked' : ''}> ตรวจรับแล้ว <small>ได้รับใบตรวจรับจากพัสดุ</small></label>`
        : type === 'loan'
          ? `<label>สถานะเงินยืม<select class="procurement-status"><option ${status === 'ยังไม่ดำเนินการ' ? 'selected' : ''}>ยังไม่ดำเนินการ</option><option ${status === 'อยู่ระหว่างดำเนินการ' ? 'selected' : ''}>อยู่ระหว่างดำเนินการ</option><option ${status === 'ดำเนินการแล้ว' ? 'selected' : ''}>ดำเนินการแล้ว</option></select></label><label class="check-line"><input type="checkbox" class="voucher-check" ${prior.checked ? 'checked' : ''}> วางฎีกาใช้หนี้แล้ว <small>ส่งหลักฐานให้กองคลังแล้ว</small></label>`
          : `<label>สถานะรายการ<select class="procurement-status"><option ${status === 'ยังไม่ดำเนินการ' ? 'selected' : ''}>ยังไม่ดำเนินการ</option><option ${status === 'อยู่ระหว่างดำเนินการ' ? 'selected' : ''}>อยู่ระหว่างดำเนินการ</option><option ${status === 'ดำเนินการแล้ว' ? 'selected' : ''}>ดำเนินการแล้ว</option></select></label><span class="check-text">รายการจากแผนโครงการ</span>`;
      const evidenceLabel = type === 'procurement' ? 'แนบใบตรวจรับหรือหลักฐาน' : type === 'loan' ? 'แนบหลักฐานการวางฎีกา' : 'แนบหลักฐานการจ่าย';
      return `<div class="expense-entry" data-type="${type}" data-key="${escapeHtml(key)}" data-name="${escapeHtml(item.name)}" data-budget="${item.budget}"><div class="entry-title"><div><span class="entry-code">รายการ ${String(index + 1).padStart(2, '0')} · ${escapeHtml(item.type)}</span><h3>${escapeHtml(item.name)}</h3></div><span>วงเงินตามแผน ${format(item.budget)} บาท</span></div><div class="entry-controls"><label>จ่ายเดือนนี้ (บาท)<input type="number" min="0" value="${prior.paid ?? defaultPaid}" class="paid-input"></label>${statusControl}<label class="file-button">${evidenceLabel}<input type="file" accept=".pdf,image/*" class="evidence-file"></label></div><div class="evidence-name" ${prior.evidence ? `data-filename="${escapeHtml(prior.evidence)}"` : ''}>${prior.evidence ? `ไฟล์ที่เลือก: ${escapeHtml(prior.evidence)}` : 'ยังไม่ได้เลือกหลักฐาน'}</div></div>`;
    }).join('');
  }

  function renderReportExpenses() {
    const section = $('#paper-expenses');
    if (!section) return;
    section.innerHTML = `<div class="paper-section-title"><div><h3>รายการจัดซื้อจัดจ้างและค่าใช้จ่าย</h3><p>รายการตามแผน พร้อมสถานะที่รายงานในเดือนนี้</p></div></div>${submittedExpenseEntries.length ? `<div class="paper-expense-list">${submittedExpenseEntries.map(item => `<div><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.type)} · ${escapeHtml(item.status)}${item.complete ? ' · เอกสารยืนยันแล้ว' : ''}${item.evidence ? ` · ${escapeHtml(item.evidence)}` : ''}</span><b>จ่าย ${format(item.paid)} / ${format(item.budget)} บาท</b></div>`).join('')}</div>` : '<p>ยังไม่มีรายการ</p>'}`;
  }

  const resultActions = $('#view-report-result .result-actions');
  const portfolioButton = document.createElement('button');
  portfolioButton.className = 'btn quiet-btn';
  portfolioButton.type = 'button';
  portfolioButton.textContent = 'ดูรายงานภาพรวมผู้บริหาร';
  const archiveButton = document.createElement('button');
  archiveButton.className = 'btn quiet-btn';
  archiveButton.type = 'button';
  archiveButton.textContent = 'ประวัติรายงาน PDF';
  resultActions.insertBefore(portfolioButton, $('#print-result'));
  resultActions.insertBefore(archiveButton, $('#print-result'));
  $('#print-result').textContent = 'พิมพ์รายโครงการ / บันทึก PDF';

  const editor = document.createElement('section');
  editor.className = 'card report-photo-editor';
  editor.innerHTML = `<div class="studio-head"><div><span class="studio-eyebrow">จัดรายงานก่อนพิมพ์</span><h2>เลือกภาพเด่นของเดือนนี้</h2><p>ภาพที่อัปโหลดไว้เลือกได้สูงสุด ${maxFeatured} ภาพสำหรับรายงานหน้าเดียว · เลือกตามลำดับที่อยากให้แสดง</p></div><span class="studio-counter" id="featured-count"></span></div><div class="studio-demo-note">ภาพสีด้านล่างเป็นภาพประกอบต้นแบบ หากลองเพิ่มภาพจากเครื่อง ระบบจะใช้ภาพของคุณแทนภาพตัวอย่างทันทีโดยไม่ส่งไฟล์ออกไป</div><div id="report-photo-options" class="report-photo-options"></div><div class="studio-upload-row"><label class="btn quiet-btn" for="report-photo-upload">เพิ่มภาพเพื่อทดลองเลือก</label><input id="report-photo-upload" type="file" accept="image/*" multiple hidden><span>แสดงรายการภาพได้สูงสุด ${maxAvailable} ภาพ · ระบบจริงจะเก็บภาพที่ไม่ได้เลือกไว้ในประวัติไฟล์</span></div>`;
  resultActions.after(editor);

  const chart = document.createElement('figure');
  chart.className = 'paper-trend';
  chart.innerHTML = '<div class="paper-section-title"><div><h3>แผนตั้งต้น ผลจริง และแนวโน้ม</h3><p>แผนเดิมยังคงแสดง แม้คาดว่าจะต้องขยายเวลา</p></div><span>ถึง ก.ย. 2569</span></div><div id="project-report-chart"></div><figcaption><i class="legend-plan"></i> แผนตั้งต้น <i class="legend-actual"></i> ผลจริง <i class="legend-forecast"></i> คาดการณ์</figcaption>';
  $('#report-paper .paper-kpis').after(chart);

  const expenseReport = document.createElement('section');
  expenseReport.id = 'paper-expenses';
  expenseReport.className = 'paper-expenses';
  $('#report-paper .paper-columns').after(expenseReport);

  const gallery = document.createElement('section');
  gallery.className = 'paper-gallery';
  gallery.innerHTML = '<div class="paper-section-title"><div><h3>ภาพกิจกรรมที่เลือกแสดง</h3><p>ภาพเด่นพร้อมคำบรรยายสั้น ๆ</p></div><span id="paper-photo-count"></span></div><div id="report-selected-photos" class="report-selected-photos"></div>';
  $('#report-paper .paper-columns').after(gallery);

  const main = document.querySelector('main');
  const portfolioView = document.createElement('section');
  portfolioView.className = 'view';
  portfolioView.id = 'view-portfolio-report';
  portfolioView.innerHTML = `<div class="page-head"><div><p class="eyebrow">ภาพรวมเพื่อประชุม · ข้อมูลตัวอย่าง</p><h1>สรุปทั้งงบประมาณในรอบเดียว</h1><p class="muted">เริ่มจากสิ่งที่ผู้บริหารต้องตัดสินใจ แล้วจึงเปิดรายละเอียดรายโครงการเมื่อมีคำถาม</p></div><span class="readonly-pill">ต้นแบบสำหรับออกแบบ</span></div><div class="result-actions"><button type="button" class="btn quiet-btn" id="portfolio-back">← กลับแดชบอร์ด</button><button type="button" class="btn quiet-btn" id="portfolio-archive">ประวัติรายงาน PDF</button><button type="button" class="btn primary-btn" id="portfolio-print">พิมพ์ภาพรวม / บันทึก PDF</button></div><article class="report-paper portfolio-paper" id="portfolio-paper"><div class="paper-top"><div><span class="paper-overline">MAHIDOL UNIVERSITY · SUSTAINABILITY</span><h2>ภาพรวมผลการดำเนินงานประจำเดือน</h2><p id="portfolio-period">ปีงบประมาณ 2569 · กันยายน 2569</p></div><span class="paper-stamp">ตัวอย่าง<br>ไม่ใช่รายงานจริง</span></div><div class="portfolio-lede"><div><span>สิ่งที่ต้องเห็นก่อน</span><h3 id="portfolio-headline">ภาพรวมใกล้แผน แต่โครงการใหญ่ต้องเร่งติดตาม</h3><p id="portfolio-summary">ใช้ข้อมูลที่ส่งรายงานแล้ว และแยกโครงการที่ยังไม่ส่งออกจากการคำนวณความก้าวหน้า</p></div><div class="portfolio-coverage"><strong id="portfolio-coverage">3 / 4</strong><small>โครงการส่งรายงาน</small></div></div><div class="paper-kpis portfolio-kpis"><div><span>งบปีนี้</span><strong id="portfolio-budget">—</strong></div><div><span>ผลสะสม</span><strong id="portfolio-actual">—</strong></div><div><span>แผนสะสม</span><strong id="portfolio-plan">—</strong></div><div><span>จ่ายสะสม</span><strong id="portfolio-paid">—</strong></div></div><figure class="paper-trend"><div class="paper-section-title"><div><h3>แนวโน้มทั้งงบประมาณ</h3><p>แผนและผลคิดจากโครงการที่ส่งรายงานในรอบเดียวกัน</p></div><span id="portfolio-chart-month">ถึง ก.ย. 2569</span></div><div id="portfolio-trend-chart"></div><figcaption><i class="legend-plan"></i> แผนตั้งต้น <i class="legend-actual"></i> ผลจริง <i class="legend-forecast"></i> คาดการณ์ · <b>โครงการที่ยังไม่ส่งรายงานแสดงแยก</b></figcaption></figure><div class="portfolio-bottom"><section><h3>ทุกโครงการในรอบนี้</h3><div id="portfolio-project-list" class="portfolio-project-list"></div></section><section class="portfolio-decisions"><h3>เรื่องที่ต้องตัดสินใจ</h3><ol><li>ติดตามกำหนดส่งมอบของโครงการใหญ่และคำขอขยายเวลา</li><li>ติดตามโครงการที่ยังไม่ส่งรายงานก่อนสรุปผลทั้งงบ</li><li>ตรวจขอบเขตงานเมื่องบปีนี้ลดจากปีก่อน</li></ol></section></div><div class="paper-foot">ข้อมูลตัวอย่างเพื่อทดลองรูปแบบ · เมื่อใช้งานจริง รายงานภาพรวมจะบันทึกเป็นฉบับตามรอบเดือน พร้อมสถานะการส่งของทุกโครงการ</div></article>`;
  main.append(portfolioView);

  const archiveView = document.createElement('section');
  archiveView.className = 'view';
  archiveView.id = 'view-report-archive';
  archiveView.innerHTML = `<div class="page-head"><div><p class="eyebrow">คลังรายงาน · รูปแบบตัวอย่าง</p><h1>รายงานย้อนหลังตามปีงบและรอบเดือน</h1><p class="muted">แนวทางเก็บรายงานที่พิมพ์ได้ทั้งระดับภาพรวมและรายโครงการ</p></div><span class="readonly-pill">ยังไม่สร้างไฟล์ PDF จริง</span></div><div class="result-actions"><button type="button" class="btn quiet-btn" id="archive-back">← กลับแดชบอร์ด</button></div><div class="card archive-explain"><strong>เมื่อเชื่อม Apps Script</strong><p>ระบบจะสร้าง PDF หลังยืนยันรายงานรายโครงการ และสร้างรายงานภาพรวมเมื่อปิดรอบหรือแอดมินสั่งสร้าง โดยเก็บฉบับก่อนหน้าเมื่อมีการแก้ไข</p></div><div id="archive-demo-list" class="archive-demo-list"></div>`;
  main.append(archiveView);

  const dashboardButton = document.createElement('button');
  dashboardButton.className = 'btn primary-btn studio-dashboard-action';
  dashboardButton.type = 'button';
  dashboardButton.textContent = 'ดูหน้าสรุปสำหรับประชุม →';
  $('#view-executive .page-head').append(dashboardButton);

  function chartSvg(baseline, actual, forecast, title, markerIndex = actual.reduce((last, value, index) => value === null || value === undefined ? last : index, 0), markerLabel = 'รอบล่าสุด') {
    const months = ['มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค. 70'];
    const x = index => 41 + index * 67;
    const y = value => 174 - Number(value) * 1.43;
    const line = (values, stroke, dash, width) => `<polyline points="${values.map((value, index) => value === null || value === undefined ? '' : `${x(index)},${y(value).toFixed(1)}`).filter(Boolean).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${width}" ${dash ? `stroke-dasharray="${dash}"` : ''} stroke-linecap="round" stroke-linejoin="round"/>`;
    const grid = [0, 25, 50, 75, 100].map(value => `<line x1="41" y1="${y(value)}" x2="511" y2="${y(value)}" stroke="#e6edf5"/><text x="30" y="${y(value) + 4}" text-anchor="end" font-size="10" fill="#71839b">${value}</text>`).join('');
    const labels = months.map((name, index) => `<text x="${x(index)}" y="202" text-anchor="middle" font-size="10" fill="#71839b">${name}</text>`).join('');
    const point = Math.max(0, Math.min(actual.length - 1, markerIndex));
    const labelWidth = Math.max(48, markerLabel.length * 7 + 16);
    const labelX = Math.max(42, Math.min(511 - labelWidth, x(point) - labelWidth / 2));
    return `<svg viewBox="0 0 530 215" role="img" aria-label="${escapeHtml(title)} · จุดสีเขียวคือเดือนรายงาน ${escapeHtml(markerLabel)}" xmlns="http://www.w3.org/2000/svg">${grid}${labels}${line(baseline, '#2c74da', '8 6', 3)}${line(actual, '#15956e', '', 4)}${line(forecast, '#e3a539', '7 5', 3)}<line x1="${x(point)}" y1="20" x2="${x(point)}" y2="174" stroke="#15956e" stroke-width="1.5" stroke-dasharray="3 4"/><circle cx="${x(point)}" cy="${y(actual[point])}" r="7" fill="#15956e" stroke="#fff" stroke-width="3"/><rect x="${labelX}" y="5" width="${labelWidth}" height="22" rx="8" fill="#e7f6ef" stroke="#a9dfc6"/><text x="${labelX + labelWidth / 2}" y="20" text-anchor="middle" font-size="10" font-weight="700" fill="#14704f">เดือนรายงาน ${escapeHtml(markerLabel)}</text></svg>`;
  }

  function forecastFrom(actual, endIndex) {
    const result = Array(8).fill(null);
    const lastIndex = actual.reduce((last, value, index) => value === null || value === undefined ? last : index, 0);
    const start = actual[lastIndex];
    const finish = Math.max(lastIndex + 1, endIndex);
    for (let index = lastIndex; index < 8; index++) result[index] = index >= finish ? 100 : start + (100 - start) * (index - lastIndex) / (finish - lastIndex);
    return result;
  }

  function renderProjectChart() {
    const project = app.getExecutiveData().projects[0];
    const period = $('#report-period').value || $('#result-period').textContent;
    const monthIndex = period.includes('กรกฎาคม') ? 1 : period.includes('สิงหาคม') ? 2 : period.includes('ตุลาคม') ? 4 : 3;
    const actual = Array(8).fill(null);
    project.actualSeries.forEach((value, index) => { if (index <= monthIndex) actual[index] = value; });
    if (monthIndex >= 1 && monthIndex <= 4) actual[monthIndex] = app.computeProgress();
    const endIndex = 4 + $('#forecast-end').selectedIndex;
    const label = ['มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.'][monthIndex];
    $('#project-report-chart').innerHTML = chartSvg([...project.baseline, 100], actual, forecastFrom(actual, endIndex), 'กราฟความก้าวหน้ารายโครงการ แผนตั้งต้น ผลจริง และคาดการณ์', monthIndex, `${label} 2569`);
    $('.paper-trend .paper-section-title span').textContent = `จุดสีเขียว = รายงานเดือน ${label} 2569`;
  }

  function renderPhotoChoices() {
    $('#featured-count').textContent = `เลือกแล้ว ${featured.length}/${maxFeatured} ภาพ`;
    $('#report-photo-options').innerHTML = photos.map(photo => {
      const order = featured.indexOf(photo.id);
      return `<div class="report-photo-choice ${order >= 0 ? 'chosen' : ''}"><button type="button" class="report-photo-toggle" data-photo-id="${escapeHtml(photo.id)}" aria-pressed="${order >= 0}" aria-label="${order >= 0 ? 'นำออกจากรายงาน' : 'เพิ่มในรายงาน'}: ${escapeHtml(photo.title)}"><img src="${escapeHtml(photo.src)}" alt=""><span class="report-photo-order">${order >= 0 ? `ภาพที่ ${order + 1}` : 'เลือกภาพ'}</span></button><label>คำบรรยายภาพ<input data-caption-id="${escapeHtml(photo.id)}" value="${escapeHtml(photo.caption)}" maxlength="100"></label><small>${escapeHtml(photo.title)}${photo.sample ? ' · ภาพประกอบต้นแบบ' : ' · ภาพที่เลือกจากเครื่อง'}</small></div>`;
    }).join('');
    renderSelectedPhotos();
  }

  function renderSelectedPhotos() {
    const selected = featured.map(id => photos.find(photo => photo.id === id)).filter(Boolean);
    $('#paper-photo-count').textContent = `${selected.length} ภาพ`;
    $('#report-selected-photos').innerHTML = selected.length ? selected.map((photo, index) => `<figure class="report-selected-photo ${index === 0 ? 'lead' : ''}"><img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.caption)}"><figcaption><b>${String(index + 1).padStart(2, '0')}</b> ${escapeHtml(photo.caption)}</figcaption></figure>`).join('') : '<div class="report-no-photo">ยังไม่ได้เลือกภาพ · รายงานยังพิมพ์ได้โดยไม่มีภาพ</div>';
  }

  function addFiles(files) {
    const images = [...files].filter(file => file.type.startsWith('image/'));
    if (!images.length) return;
    const usingSamples = photos.every(photo => photo.sample);
    if (images.length + (usingSamples ? 0 : photos.length) > maxAvailable) {
      app.toast(`เลือกภาพได้รวมไม่เกิน ${maxAvailable} ภาพในต้นแบบนี้`);
      return;
    }
    if (usingSamples) { photos.splice(0); featured = []; }
    images.forEach((file, index) => {
      const id = `local-${Date.now()}-${index}`;
      photos.push({ id, title: file.name, caption: file.name.replace(/\.[^.]+$/, ''), src: URL.createObjectURL(file), sample: false });
      if (featured.length < maxFeatured) featured.push(id);
    });
    if (images.length) renderPhotoChoices();
  }

  function renderPortfolio() {
    const { projects, asOf } = app.getExecutiveData();
    const included = projects.filter(project => project.snapshots[asOf].reported);
    const weight = included.reduce((sum, project) => sum + project.weight, 0);
    const weighted = key => included.reduce((sum, project) => sum + project.snapshots[asOf][key] * project.weight, 0) / weight;
    const budget = projects.reduce((sum, project) => sum + project.budget, 0);
    const paid = projects.reduce((sum, project) => sum + project.snapshots[asOf].paid, 0);
    const actual = included[0].actualSeries.map((_, index) => included.reduce((sum, project) => sum + (project.actualSeries[index] ?? project.actualSeries.at(-1)) * project.weight, 0) / weight);
    if (asOf === 'aug') actual.pop();
    const baseline = included[0].baseline.map((_, index) => included.reduce((sum, project) => sum + project.baseline[index] * project.weight, 0) / weight);
    baseline.push(100);
    $('#portfolio-period').textContent = `ปีงบประมาณ 2569 · ${asOf === 'aug' ? 'สิงหาคม' : 'กันยายน'} 2569`;
    $('#portfolio-headline').textContent = asOf === 'aug' ? 'ภาพรวมยังตามแผน แต่ต้องติดตามงานส่งมอบ' : 'ภาพรวมใกล้แผน แต่โครงการใหญ่ต้องเร่งติดตาม';
    $('#portfolio-summary').textContent = `ผลรวมคิดจาก ${included.length} โครงการที่ส่งรายงานจากทั้งหมด ${projects.length} โครงการ · โครงการที่ค้างรายงานแสดงแยก และยอดจ่ายเป็นยอดล่าสุดที่มี`;
    $('#portfolio-coverage').textContent = `${included.length} / ${projects.length}`;
    $('#portfolio-budget').textContent = `${format(budget / 1e6)} ลบ.`;
    $('#portfolio-actual').textContent = `${weighted('actual').toFixed(1)}%`;
    $('#portfolio-plan').textContent = `${weighted('plan').toFixed(1)}%`;
    $('#portfolio-paid').textContent = `${format(paid / 1e6)} ลบ.`;
    $('#portfolio-chart-month').textContent = `ถึง ${asOf === 'aug' ? 'ส.ค.' : 'ก.ย.'} 2569`;
    $('#portfolio-trend-chart').innerHTML = chartSvg(baseline, actual, forecastFrom(actual, 6), 'กราฟภาพรวมงบประมาณ แผนตั้งต้น ผลจริง และคาดการณ์');
    $('#portfolio-project-list').innerHTML = projects.map(project => {
      const snapshot = project.snapshots[asOf];
      const difference = snapshot.reported ? snapshot.actual - snapshot.plan : null;
      const state = !snapshot.reported ? 'รอรายงาน' : difference < -5 ? 'ล่าช้า' : difference > 5 ? 'เร็วกว่าแผน' : 'ตามแผน';
      const tone = !snapshot.reported ? 'pending' : difference < -5 ? 'late' : 'okay';
      return `<div><span class="portfolio-dot ${tone}"></span><b>${escapeHtml(project.name)}</b><strong>${snapshot.reported ? `${snapshot.actual}%` : '—'}</strong><small>${state}</small></div>`;
    }).join('');
  }

  function renderArchive() {
    const examples = [
      { title: 'ภาพรวมปีงบ 2569', round: 'ก.ย. 2569', version: 'เมื่อปิดรอบ', note: 'มี 1 โครงการรอรายงาน · ต้องระบุในฉบับภาพรวม', view: 'portfolio-report' },
      { title: 'โครงการจัดการขยะครบวงจร', round: $('#result-period').textContent, version: submittedAt ? `ฉบับตัวอย่าง · ${submittedAt}` : 'เมื่อผู้รายงานยืนยัน', note: 'เก็บภาพที่เลือกและกราฟ ณ วันที่สร้างฉบับ', view: 'report-result' },
      { title: 'โครงการเดียวกัน · ฉบับแก้ไข', round: 'ก.ย. 2569', version: 'v2 เมื่อแก้ไขภายหลัง', note: 'เก็บ v1 ไว้ตรวจย้อนหลัง และระบุว่า v2 เป็นฉบับปัจจุบัน', view: 'report-result' }
    ];
    $('#archive-demo-list').innerHTML = examples.map(item => `<div class="card archive-demo-row"><div><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.round)} · ${escapeHtml(item.version)}</span><small>${escapeHtml(item.note)}</small></div><button type="button" class="btn quiet-btn" data-preview-view="${item.view}">ดูหน้าตัวอย่าง</button></div>`).join('');
  }

  function openPortfolio() { renderPortfolio(); app.navigate('portfolio-report'); }
  function openArchive() { renderArchive(); app.navigate('report-archive'); }
  portfolioButton.addEventListener('click', openPortfolio);
  archiveButton.addEventListener('click', openArchive);
  dashboardButton.addEventListener('click', openPortfolio);
  $('#portfolio-back').addEventListener('click', () => app.navigate('executive'));
  $('#portfolio-archive').addEventListener('click', openArchive);
  $('#archive-back').addEventListener('click', () => app.navigate('executive'));
  $('#archive-demo-list').addEventListener('click', event => {
    const button = event.target.closest('[data-preview-view]');
    if (!button) return;
    if (button.dataset.previewView === 'portfolio-report') openPortfolio();
    else app.navigate('report-result');
  });

  $('#report-photo-options').addEventListener('click', event => {
    const button = event.target.closest('[data-photo-id]');
    if (!button) return;
    const id = button.dataset.photoId;
    if (featured.includes(id)) featured = featured.filter(value => value !== id);
    else if (featured.length < maxFeatured) featured.push(id);
    else { app.toast(`หน้าเดียวแนะนำไม่เกิน ${maxFeatured} ภาพ · นำภาพหนึ่งออกก่อนเลือกภาพใหม่`); return; }
    renderPhotoChoices();
  });
  $('#report-photo-options').addEventListener('input', event => {
    const id = event.target.dataset.captionId;
    if (!id) return;
    const photo = photos.find(item => item.id === id);
    if (photo) { photo.caption = event.target.value; renderSelectedPhotos(); }
  });
  $('#report-photo-upload').addEventListener('change', event => {
    addFiles(event.target.files);
    event.target.value = '';
  });
  window.addEventListener('mockup:plan-saved', renderPlannedExpenses);
  window.addEventListener('mockup:report-before-save', event => {
    addFiles(event.detail.files || []);
    submittedExpenseEntries = [...document.querySelectorAll('#planned-expense-report-list .expense-entry')].map(card => ({
      name: card.dataset.name,
      type: card.querySelector('.entry-code')?.textContent.replace(/^รายการ\s*\d+\s*·\s*/, '') || '',
      budget: Number(card.dataset.budget) || 0,
      paid: Math.max(0, Number(card.querySelector('.paid-input')?.value) || 0),
      status: card.querySelector('.procurement-status')?.value || (card.querySelector('.inspect-check')?.checked ? 'ตรวจรับแล้ว' : card.querySelector('.voucher-check')?.checked ? 'วางฎีกาแล้ว' : 'ยังไม่ระบุสถานะ'),
      complete: Boolean(card.querySelector('.inspect-check, .voucher-check')?.checked),
      evidence: card.querySelector('.evidence-file')?.files?.[0]?.name || card.querySelector('.evidence-name')?.dataset.filename || ''
    }));
    renderReportExpenses();
    $('#result-period').textContent = $('#report-period').value;
    $('#result-summary').textContent = $('#summary').value.trim() || '—';
    $('#result-issue').textContent = $('#delay').value.trim() || 'ไม่มีประเด็นล่าช้าที่ระบุ';
    $('#result-progress').textContent = `${app.computeProgress()}%`;
    $('#result-paid').textContent = $('#paid-total').textContent;
    $('#result-total-paid').textContent = $('#review-total-paid').textContent;
    $('#result-saved').textContent = new Date().toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
    $('#result-status').textContent = $('#progress-status').textContent;
    const selectedFiles = [...new Set([
      ...[...document.querySelectorAll('#active-files li span')].map(node => node.childNodes[0]?.textContent?.trim()).filter(Boolean),
      ...(event.detail.files || []).map(file => file.name)
    ])];
    $('#result-files').textContent = selectedFiles.length ? selectedFiles.join(' · ') : 'ไม่มีไฟล์แนบ';
    renderProjectChart();
  });
  window.addEventListener('mockup:report-saved', event => {
    submittedAt = event.detail.savedAt;
    renderProjectChart();
    renderArchive();
  });
  $('#planned-expense-report-list').addEventListener('input', event => {
    if (!event.target.matches('.paid-input')) return;
    app.markDirty('report'); app.updateReport();
  });
  $('#planned-expense-report-list').addEventListener('change', event => {
    const card = event.target.closest('.expense-entry');
    if (!card) return;
    if (event.target.matches('.evidence-file')) {
      const filename = event.target.files[0]?.name;
      if (filename) {
        const label = card.querySelector('.evidence-name');
        label.textContent = `ไฟล์ที่รอบันทึก: ${filename}`;
        label.dataset.filename = filename;
      }
    }
    app.markDirty('report');
    app.updateReport();
  });
  $('#report-period').addEventListener('change', renderProjectChart);
  $('#forecast-end').addEventListener('change', renderProjectChart);
  renderPlannedExpenses();
  app.updateReport();
  renderProjectChart();
  renderReportExpenses();
  async function downloadReportPng() {
    const width = 1600;
    const pad = 88;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const textLines = (text, maxWidth, font) => {
      context.font = font;
      const lines = [];
      for (const paragraph of String(text || '—').split('\n')) {
        let line = '';
        for (const character of Array.from(paragraph)) {
          if (line && context.measureText(line + character).width > maxWidth) { lines.push(line); line = character; }
          else line += character;
        }
        lines.push(line || ' ');
      }
      return lines;
    };
    const loadImage = src => new Promise(resolve => {
      const image = new Image(); image.onload = () => resolve(image); image.onerror = () => resolve(null); image.src = src;
    });
    const svg = $('#project-report-chart svg');
    const chartImage = svg ? await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.outerHTML)}`) : null;
    const selected = featured.map(id => photos.find(photo => photo.id === id)).filter(Boolean);
    const photoImages = await Promise.all(selected.map(photo => loadImage(photo.src)));
    canvas.width = width;
    canvas.height = 1650 + selected.length * 300 + submittedExpenseEntries.length * 80;
    context.fillStyle = '#f2f6fb'; context.fillRect(0, 0, width, canvas.height);
    context.fillStyle = '#fff'; context.beginPath(); context.roundRect(32, 32, width - 64, canvas.height - 64, 24); context.fill();
    let y = 115;
    const drawText = (text, font, color, maxWidth = width - pad * 2, lineHeight = 34) => {
      context.font = font; context.fillStyle = color;
      const lines = textLines(text, maxWidth, font);
      for (const line of lines) { context.fillText(line, pad, y); y += lineHeight; }
      return lines.length;
    };
    drawText('MAHIDOL UNIVERSITY · SUSTAINABILITY ACTION TRACKER', '700 22px Leelawadee UI, Tahoma, sans-serif', '#2469ae', width - pad * 2, 42); y += 5;
    drawText('สรุปผลการดำเนินงานประจำเดือน', '700 44px Leelawadee UI, Tahoma, sans-serif', '#163d70', width - pad * 2, 58);
    drawText(`โครงการจัดการขยะครบวงจร · ปีงบประมาณ 2569 · ${$('#result-period').textContent}`, '24px Leelawadee UI, Tahoma, sans-serif', '#536983', width - pad * 2, 38); y += 18;
    context.strokeStyle = '#2d75cc'; context.lineWidth = 4; context.beginPath(); context.moveTo(pad, y); context.lineTo(width - pad, y); context.stroke(); y += 32;
    const kpis = [
      ['แผนสะสม', document.querySelector('#report-paper .paper-kpis div:nth-child(1) strong')?.textContent || '75%'],
      ['ผลสะสม', $('#result-progress').textContent], ['จ่ายเดือนนี้', $('#result-paid').textContent], ['จ่ายสะสม', $('#result-total-paid').textContent]
    ];
    const gap = 18; const cardWidth = (width - pad * 2 - gap * 3) / 4;
    kpis.forEach(([label, value], index) => {
      const x = pad + index * (cardWidth + gap);
      context.fillStyle = '#f0f6fc'; context.beginPath(); context.roundRect(x, y, cardWidth, 112, 14); context.fill();
      context.fillStyle = '#71839a'; context.font = '20px Leelawadee UI, Tahoma, sans-serif'; context.fillText(label, x + 18, y + 38);
      context.fillStyle = '#1d5c9c'; context.font = '700 27px Leelawadee UI, Tahoma, sans-serif'; context.fillText(value || '—', x + 18, y + 82);
    }); y += 145;
    drawText('ความก้าวหน้าเทียบแผน', '700 28px Leelawadee UI, Tahoma, sans-serif', '#163d70', width - pad * 2, 38);
    if (chartImage) { context.drawImage(chartImage, pad, y, width - pad * 2, 480); y += 500; }
    drawText('สรุปผลเดือนนี้', '700 24px Leelawadee UI, Tahoma, sans-serif', '#2d75cc', width - pad * 2, 38);
    drawText($('#result-summary').textContent, '21px Leelawadee UI, Tahoma, sans-serif', '#334b66', width - pad * 2, 32); y += 10;
    drawText('ผลลัพธ์ SDG', '700 24px Leelawadee UI, Tahoma, sans-serif', '#2d75cc', width - pad * 2, 38);
    drawText($('#result-sdg').textContent, '21px Leelawadee UI, Tahoma, sans-serif', '#334b66', width - pad * 2, 32); y += 10;
    drawText('เรื่องที่ต้องติดตาม', '700 24px Leelawadee UI, Tahoma, sans-serif', '#2d75cc', width - pad * 2, 38);
    drawText($('#result-issue').textContent, '21px Leelawadee UI, Tahoma, sans-serif', '#334b66', width - pad * 2, 32); y += 12;
    if (submittedExpenseEntries.length) {
      drawText('รายการจัดซื้อจัดจ้างและค่าใช้จ่าย', '700 24px Leelawadee UI, Tahoma, sans-serif', '#2d75cc', width - pad * 2, 40);
      submittedExpenseEntries.forEach(item => {
        context.fillStyle = '#f6f9fc'; context.fillRect(pad, y - 22, width - pad * 2, 66);
        drawText(`${item.name} · ${item.type} · ${item.status} · จ่าย ${format(item.paid)} / ${format(item.budget)} บาท`, '19px Leelawadee UI, Tahoma, sans-serif', '#334b66', width - pad * 2 - 28, 28); y += 10;
      });
    }
    if (selected.length) {
      drawText('ภาพกิจกรรมที่เลือกแสดง', '700 24px Leelawadee UI, Tahoma, sans-serif', '#2d75cc', width - pad * 2, 38);
      const photoGap = 18; const photoWidth = (width - pad * 2 - photoGap * (selected.length - 1)) / selected.length;
      selected.forEach((photo, index) => {
        const x = pad + index * (photoWidth + photoGap);
        if (photoImages[index]) context.drawImage(photoImages[index], x, y, photoWidth, 210);
        const lines = textLines(photo.caption, photoWidth - 10, '18px Leelawadee UI, Tahoma, sans-serif').slice(0, 2);
        context.fillStyle = '#334b66'; context.font = '18px Leelawadee UI, Tahoma, sans-serif';
        lines.forEach((line, lineIndex) => context.fillText(line, x + 5, y + 238 + lineIndex * 25));
      }); y += 290;
    }
    context.fillStyle = '#8292a5'; context.font = '16px Leelawadee UI, Tahoma, sans-serif';
    context.fillText('ข้อมูลตัวอย่างเพื่อทดลองรูปแบบ · ไม่มีข้อมูลส่งไปยังระบบจริง', pad, Math.min(canvas.height - 45, y + 24));
    const link = document.createElement('a');
    link.download = `รายงานผล-${$('#result-period').textContent.replaceAll(' ', '-')}.png`;
    link.href = canvas.toDataURL('image/png'); link.click();
    app.toast('บันทึกภาพรายงาน PNG พร้อมกราฟแล้ว');
  }
  $('#download-report-png').addEventListener('click', () => downloadReportPng().catch(() => app.toast('สร้างภาพไม่สำเร็จ กรุณาลองอีกครั้ง')));
  $('#print-result').addEventListener('click', () => document.body.classList.remove('print-portfolio'), { capture: true });
  $('#portfolio-print').addEventListener('click', () => {
    document.body.classList.add('print-portfolio');
    const page = document.createElement('style');
    page.id = 'portfolio-page-style';
    page.textContent = '@page { size: A4 landscape; margin: 12mm; }';
    document.head.append(page);
    window.print();
  });
  window.addEventListener('afterprint', () => {
    document.body.classList.remove('print-portfolio');
    $('#portfolio-page-style')?.remove();
  });
  window.addEventListener('beforeunload', () => photos.filter(photo => !photo.sample).forEach(photo => URL.revokeObjectURL(photo.src)));

  renderPhotoChoices();
  renderProjectChart();
  renderPortfolio();
  renderArchive();
})();

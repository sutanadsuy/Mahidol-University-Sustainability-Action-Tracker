const fs = require('fs');
const path = require('path');
const root = __dirname;
const source = path.join(root, 'apps-script');
const output = path.join(root, 'docs');
const appScriptUrl = 'https://script.google.com/a/macros/mahidol.ac.th/s/AKfycbwktgmYgRjStHCH6QBz4m-SU6q9sTuk4Up6lZEJBPX1Lc-lCXrhzUvs_jnjAFdtNESfkA/exec';
fs.mkdirSync(output, { recursive: true });

let html = fs.readFileSync(path.join(source, 'Index.html'), 'utf8');
const omittedIncludes = new Set([
  'TabActual', 'TabPlan', 'TabAdmin',
  'ScriptsActual', 'ScriptsPlan', 'ScriptsAdmin'
]);
html = html.replace(/<\?!=\s*include\('([^']+)'\);\s*\?>/g, (_, name) => {
  if (!/^[A-Za-z0-9_]+$/.test(name)) throw new Error('Invalid include');
  if (omittedIncludes.has(name)) return '';
  return fs.readFileSync(path.join(source, `${name}.html`), 'utf8');
});
html = html.replace(/<li class="nav-item"><a class="nav-link" data-bs-toggle="pill" href="#actualTab"[\s\S]*?<\/li>/, '');
html = html.replace(/<li class="nav-item"><a class="nav-link" data-bs-toggle="pill" href="#planTab"[\s\S]*?<\/li>/, '');
html = html.replace(/<li class="nav-item" id="adminTabNav">[\s\S]*?<\/li>/, '');
html = html.replace('</ul>', `<li class="nav-item ms-md-2"><a class="nav-link border border-primary text-primary" href="${appScriptUrl}" target="_blank" rel="noopener noreferrer" title="เข้าสู่ระบบ Google เพื่อบันทึกหรือแก้ไขข้อมูล"><i class="bi bi-pencil-square me-1"></i>บันทึก/แก้ไขข้อมูล</a></li>\n      </ul>`);
html = html.replace('<body class="p-3 p-md-4">', '<body class="p-3 p-md-4">\n  <div class="alert alert-info d-flex flex-wrap align-items-center justify-content-center gap-2 text-center fw-bold" role="status"><span>GitHub Pages · รายงานสดจาก Google Sheets · บันทึกข้อมูลผ่าน Google Apps Script</span><button type="button" class="btn btn-sm btn-outline-primary" onclick="pagesRefreshData()"><i class="bi bi-arrow-clockwise me-1"></i>รีเฟรชข้อมูล</button></div>');
html = html.replace('<!-- ส่วนเรียกโมดูลสคริปต์ย่อย -->', '<script src="./pages-runtime.js"></script>\n  <script src="./backend-readonly.js"></script>\n  <!-- ส่วนเรียกโมดูลสคริปต์ย่อย -->');
fs.writeFileSync(path.join(output, 'index.html'), html.replace(/[ \t]+$/gm, ''));

const backendFiles = [
  'ConfigService.gs', 'ProjectService.gs', 'ActualService.gs',
  'DashboardService.gs', 'BudgetDocService.gs'
];
const backend = backendFiles.map(name => `\n/* ${name} */\n${fs.readFileSync(path.join(source, name), 'utf8')}`).join('\n');
fs.writeFileSync(path.join(output, 'backend-readonly.js'), backend.replace(/[ \t]+$/gm, ''));
fs.copyFileSync(path.join(root, 'pages-runtime.js'), path.join(output, 'pages-runtime.js'));
fs.writeFileSync(path.join(output, '.nojekyll'), '');
console.log(`Built GitHub Pages site in ${output}`);

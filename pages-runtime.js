/* Read-only bridge between the public Google Sheet and the existing dashboard. */
const PAGES_SHEET_ID = '1qB4mxGo4OOR2UuTOw5AJ0mbbHLEGaOgZX8Nal9g0LJk';
const CALENDAR_MONTHS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const PAGES_SHEETS = [
  'Master_Projects', 'Master_Budget_Documents', 'Monthly_Progress',
  'Master_Procure_Plan', 'Expense_Items', 'File_Attachments',
  'Master_Departments', 'Master_Budgets', 'System_Settings'
];
const PAGES_READ_METHODS = new Set([
  'getInitialBootstrapData', 'getMasterLists', 'getExistingProjectPlan',
  'getProjectMonthlyContext', 'getDashboardReport', 'getProjectYearlyMatrix',
  'getMasterBudgetDocs', 'getStepWeights'
]);
let pagesCachedSheets;
let pagesExpiresAt = 0;
let pagesLoading;

function pagesRefreshData() {
  pagesCachedSheets = null;
  pagesExpiresAt = 0;
  if (typeof loadMasterAndDashboard === 'function') loadMasterAndDashboard();
}

function pagesFormatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(date);
  const get = type => parts.find(part => part.type === type).value;
  return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')}`;
}

const Session = {
  getActiveUser: () => ({ getEmail: () => '' }),
  getScriptTimeZone: () => 'Asia/Bangkok'
};
const Utilities = { formatDate: pagesFormatDate };
function checkAdminAccess() { return { isAdmin: false, userEmail: 'ผู้ชม (อ่านอย่างเดียว)' }; }

function pagesJsonp(sheetName) {
  return new Promise((resolve, reject) => {
    const callbackName = `pagesSheet_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const timer = setTimeout(() => finish(new Error(`โหลด ${sheetName} ไม่สำเร็จ`)), 20000);
    function finish(error, result) {
      clearTimeout(timer);
      delete window[callbackName];
      script.remove();
      if (error) reject(error); else resolve(result);
    }
    window[callbackName] = response => {
      if (response.status !== 'ok') return finish(new Error(`Google Sheets ปฏิเสธ ${sheetName}`));
      const table = response.table;
      const header = table.cols.map(col => col.label || '');
      const rows = table.rows.map(row => table.cols.map((col, index) => {
        const raw = row.c[index] ? row.c[index].v : '';
        if (raw == null) return '';
        if ((col.type === 'date' || col.type === 'datetime') && typeof raw === 'string') {
          const parts = /^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/.exec(raw);
          if (parts) return new Date(+parts[1], +parts[2], +parts[3], +(parts[4] || 0), +(parts[5] || 0), +(parts[6] || 0));
        }
        if (typeof raw === 'string') return raw.replace(/[&<>"']/g, char => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[char]);
        return raw;
      }));
      finish(null, [header, ...rows]);
    };
    script.onerror = () => finish(new Error(`เชื่อม Google Sheets ไม่สำเร็จ: ${sheetName}`));
    const url = new URL(`https://docs.google.com/spreadsheets/d/${PAGES_SHEET_ID}/gviz/tq`);
    url.searchParams.set('sheet', sheetName);
    url.searchParams.set('headers', '1');
    url.searchParams.set('tqx', `out:json;responseHandler:${callbackName}`);
    script.src = url.toString();
    document.head.appendChild(script);
  });
}

function pagesLoadSheets() {
  if (pagesCachedSheets && Date.now() < pagesExpiresAt) return Promise.resolve(pagesCachedSheets);
  if (!pagesLoading) {
    pagesLoading = Promise.all(PAGES_SHEETS.map(async name => [name, await pagesJsonp(name)]))
      .then(entries => {
        pagesCachedSheets = Object.fromEntries(entries);
        pagesExpiresAt = Date.now() + 30000;
        return pagesCachedSheets;
      })
      .finally(() => { pagesLoading = null; });
  }
  return pagesLoading;
}

function pagesSpreadsheet(sheets) {
  const objects = Object.fromEntries(Object.entries(sheets).map(([name, values]) => [name, {
    getName: () => name,
    getDataRange: () => ({ getValues: () => values.map(row => row.slice()) })
  }]));
  return {
    getSheetByName: name => objects[name] || null,
    getSheets: () => Object.values(objects)
  };
}

let pagesCurrentSpreadsheet;
function getAppSpreadsheet() { return pagesCurrentSpreadsheet; }

function pagesRunner(success, failure) {
  return new Proxy({}, {
    get(_target, method) {
      if (method === 'withSuccessHandler') return callback => pagesRunner(callback, failure);
      if (method === 'withFailureHandler') return callback => pagesRunner(success, callback);
      return (...args) => {
        if (!PAGES_READ_METHODS.has(method)) {
          if (failure) failure(new Error('GitHub Pages แสดงข้อมูลได้อย่างเดียว'));
          return;
        }
        pagesLoadSheets()
          .then(sheets => {
            pagesCurrentSpreadsheet = pagesSpreadsheet(sheets);
            return globalThis[method](...args);
          })
          .then(result => { if (success) success(result); })
          .catch(error => { if (failure) failure(error); else console.error(error); });
      };
    }
  });
}
window.google = { script: { run: pagesRunner() } };

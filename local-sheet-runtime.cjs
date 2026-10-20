const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SPREADSHEET_ID = '1qB4mxGo4OOR2UuTOw5AJ0mbbHLEGaOgZX8Nal9g0LJk';
const SHEETS = [
  'Master_Projects', 'Master_Budget_Documents', 'Monthly_Progress',
  'Master_Procure_Plan', 'Expense_Items', 'File_Attachments',
  'Master_Departments', 'Master_Budgets', 'System_Settings'
];
const READ_METHODS = new Set([
  'getInitialBootstrapData', 'getMasterLists', 'getExistingProjectPlan',
  'getProjectMonthlyContext', 'getDashboardReport', 'getDashboardReportJson', 'getProjectYearlyMatrix',
  'getMasterBudgetDocs', 'getAllMasterBudgetDocsForAdmin', 'getStepWeights'
]);
const SOURCE_FILES = [
  'Main.gs', 'ConfigService.gs', 'DocumentService.gs', 'ProjectService.gs',
  'ActualService.gs', 'DashboardService.gs', 'BudgetDocService.gs'
];
let cachedSheets = null;
let expiresAt = 0;
let inFlight = null;

function parseGviz(text, name) {
  const begin = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (begin < 0 || end < begin) throw new Error(`Invalid response from ${name}`);
  const response = JSON.parse(text.slice(begin, end + 1));
  if (response.status !== 'ok') throw new Error(`Google Sheets rejected ${name}: ${JSON.stringify(response.errors || [])}`);
  const table = response.table;
  const header = table.cols.map(column => column.label || '');
  const rows = table.rows.map(row => table.cols.map((column, index) => {
    const raw = row.c[index] ? row.c[index].v : '';
    if (raw === null || raw === undefined) return '';
    if ((column.type === 'date' || column.type === 'datetime') && typeof raw === 'string') {
      const parts = /^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/.exec(raw);
      if (parts) return new Date(+parts[1], +parts[2], +parts[3], +(parts[4] || 0), +(parts[5] || 0), +(parts[6] || 0));
    }
    return raw;
  }));
  return [header, ...rows];
}

async function readSheet(name) {
  const url = new URL(`https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq`);
  url.searchParams.set('tqx', 'out:json');
  url.searchParams.set('sheet', name);
  url.searchParams.set('headers', '1');
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Google Sheets ${name}: HTTP ${response.status}`);
  return parseGviz(await response.text(), name);
}

async function loadSheets() {
  if (cachedSheets && Date.now() < expiresAt) return cachedSheets;
  if (!inFlight) {
    inFlight = Promise.all(SHEETS.map(async name => [name, await readSheet(name)]))
      .then(entries => {
        cachedSheets = Object.fromEntries(entries);
        expiresAt = Date.now() + 30000;
        return cachedSheets;
      })
      .finally(() => { inFlight = null; });
  }
  return inFlight;
}

function createSpreadsheet(sheets) {
  const objects = Object.fromEntries(Object.entries(sheets).map(([name, values]) => [name, {
    getName: () => name,
    getDataRange: () => ({ getValues: () => values.map(row => row.slice()) })
  }]));
  return {
    getSheetByName: name => objects[name] || null,
    getSheets: () => Object.values(objects)
  };
}

function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(date);
  const get = type => parts.find(part => part.type === type).value;
  return `${get('day')}/${get('month')}/${get('year')} ${get('hour')}:${get('minute')}`;
}

async function runReadMethod(name, args = []) {
  if (!READ_METHODS.has(name)) throw new Error('โหมด localhost อ่านข้อมูลได้อย่างเดียว ไม่สามารถบันทึกหรือแก้ไขชีต');
  if (!Array.isArray(args) || args.length > 5) throw new Error('Invalid arguments');
  const spreadsheet = createSpreadsheet(await loadSheets());
  const context = vm.createContext({
    SpreadsheetApp: { openById: id => {
      if (id !== SPREADSHEET_ID) throw new Error('Unexpected spreadsheet ID');
      return spreadsheet;
    } },
    Session: { getActiveUser: () => ({ getEmail: () => '' }), getScriptTimeZone: () => 'Asia/Bangkok' },
    Utilities: { formatDate }
  });
  for (const file of SOURCE_FILES) {
    const code = fs.readFileSync(path.join(__dirname, 'apps-script', file), 'utf8');
    new vm.Script(code, { filename: file }).runInContext(context, { timeout: 5000 });
  }
  const result = context[name](...args);
  return JSON.parse(JSON.stringify(result));
}

module.exports = { runReadMethod, SPREADSHEET_ID };

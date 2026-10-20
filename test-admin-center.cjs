const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function makeSheet(initialRows, initialColumnCount) {
  const rows = initialRows.map(row => [...row]);
  let maxColumns = initialColumnCount || Math.max(1, ...rows.map(row => row.length));
  return {
    rows,
    getDataRange: () => ({ getValues: () => rows.map(row => [...row]) }),
    getLastColumn: () => Math.max(1, ...rows.map(row => row.length)),
    getMaxColumns: () => maxColumns,
    insertColumnsAfter: (_after, count) => { maxColumns += count; },
    getLastRow: () => rows.length,
    appendRow: row => { rows.push([...row]); },
    getRange(row, column, height = 1, width = 1) {
      if (column + width - 1 > maxColumns) throw new Error('Range exceeds sheet dimensions');
      return {
        getValue: () => rows[row - 1]?.[column - 1] || '',
        getValues: () => Array.from({ length: height }, (_, y) =>
          Array.from({ length: width }, (_, x) => rows[row - 1 + y]?.[column - 1 + x] || '')),
        setValue(value) { rows[row - 1] ||= []; rows[row - 1][column - 1] = value; },
        setValues(values) {
          values.forEach((valueRow, y) => valueRow.forEach((value, x) => {
            rows[row - 1 + y] ||= [];
            rows[row - 1 + y][column - 1 + x] = value;
          }));
        },
        clearContent() { rows[row - 1][column - 1] = ''; }
      };
    }
  };
}

const sheets = {
  Master_Budgets: makeSheet([
    ['Fiscal_Year', 'Total_Budget_THB', 'Updated_At'],
    ['2569', 5000000, new Date('2026-01-01')], ['2570', 3000000, new Date('2027-01-01')]
  ], 3),
  Master_Departments: makeSheet([
    ['Dept_ID', 'Department_Name', 'Head_Name', 'Head_Email', 'Created_At'],
    ['DEP-1', 'งานทดสอบ', 'หัวหน้างาน', 'head@example.org', new Date('2026-01-02')]
  ], 5),
  Master_Projects: makeSheet([
    ['Project_ID', 'Fiscal_Year', 'Project_Name', 'Strategy', 'Responsible_Person', 'Department', 'Budget_Allocated', 'Weight_Percent', 'Start_Date', 'End_Date', 'Status'],
    ['P1', '2569', 'โครงการหนึ่ง', '', 'ผู้รับผิดชอบ', 'งานทดสอบ', 100000, 2, '', '', 'Active'],
    ['P2', '2569', 'โครงการเก่า', '', 'ผู้รับผิดชอบ', 'งานทดสอบ', 20000, 0.4, '', '', 'Cancelled']
  ], 24),
  Master_Budget_Documents: makeSheet([
    ['Doc_ID', 'Fiscal_Year', 'Doc_Category', 'Doc_Name', 'File_Name', 'Doc_URL', 'Is_Latest', 'Uploaded_At', 'Uploaded_By', 'Priority'],
    ['MDOC-1', '2569', 'อนุมัติ', 'หนังสือเดิม', 'old.pdf', 'https://drive.google.com/old', 'Yes', '01/01/2569', 'admin@example.org', 1]
  ], 26)
};
const spreadsheet = { getSheetByName: name => sheets[name] || null };
const context = vm.createContext({
  getAppSpreadsheet: () => spreadsheet,
  getOrCreateSheet_: (name, headers) => sheets[name] ||= makeSheet([headers]),
  getOrCreateFolder_: () => ({ createFile: () => ({ getUrl: () => 'https://drive.google.com/new', setSharing: () => {} }) }),
  requireAdminAccess_: () => {},
  checkAdminAccess: () => ({ isAdmin: true, userEmail: 'admin@example.org' }),
  Session: { getActiveUser: () => ({ getEmail: () => 'admin@example.org' }), getScriptTimeZone: () => 'Asia/Bangkok' },
  Utilities: { getUuid: () => '123456789abcdef', formatDate: date => date.toISOString(),
    base64Decode: value => Buffer.from(value, 'base64'), newBlob: (_bytes, _type, name) => ({ name }) },
  DriveApp: { Access: { ANYONE_WITH_LINK: 'link' }, Permission: { VIEW: 'view' } },
  CALENDAR_MONTHS: ['ม.ค.']
});
for (const file of ['MasterService.gs', 'ConfigService.gs', 'ProjectService.gs', 'BudgetDocService.gs']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, 'apps-script', file), 'utf8'), context, { filename: file });
}

const first = JSON.parse(context.getAdminCenterData('2569'));
assert.equal(first.budgets.length, 2);
assert.equal(first.projects.length, 2, 'Admin must see cancelled projects');
assert.equal(first.departments.length, 1);
assert.equal(first.history.length, 0);
assert.equal(context.getInitialBootstrapData('2569').master.projects.length, 1);

assert.throws(() => context.setAdminBudgetArchived('2569', true), /ยังมีโครงการ/);
assert.throws(() => context.setAdminDepartmentArchived('DEP-1', true), /ยังรับผิดชอบโครงการ/);
context.setAdminProjectArchived('2569', 'P1', true);
assert.equal(context.getInitialBootstrapData('2569').master.projects.length, 0);
context.setAdminBudgetArchived('2569', true);
assert.equal(context.getInitialBootstrapData('2569').master.totalMasterBudget, 0);
context.setAdminDepartmentArchived('DEP-1', true);
assert.equal(context.getInitialBootstrapData('2569').master.departments.length, 0);
assert.equal(sheets.Master_Departments.rows[1][4].toISOString(), new Date('2026-01-02').toISOString(), 'Creation date must survive archive');

context.setAdminBudgetArchived('2569', false);
context.setAdminDepartmentArchived('DEP-1', false);
context.setAdminProjectArchived('2569', 'P1', false);
assert.equal(context.getInitialBootstrapData('2569').master.totalMasterBudget, 5000000);
assert.equal(context.getInitialBootstrapData('2569').master.projects.length, 1);
assert.equal(context.getInitialBootstrapData('2569').master.departments.length, 1);
assert.equal(JSON.parse(context.getAdminCenterData('2569')).history.length, 6);
assert.equal(JSON.parse(context.getAdminHistoryPage(3, 2)).rows.length, 2);
context.updateMasterBudgetDocMetadata('MDOC-1', { category: 'แก้ไข', docName: 'หนังสือใหม่', priority: 2 });
context.replaceMasterBudgetDoc('MDOC-1', { name: 'new.pdf', mimeType: 'application/pdf', base64: 'data:application/pdf;base64,YQ==' });
assert.equal(sheets.Master_Budget_Documents.rows[1][6], 'No', 'Replaced version must remain hidden but readable');
assert.equal(sheets.Master_Budget_Documents.rows[2][10], 'MDOC-1', 'Replacement must link to its prior version');
assert.equal(context.getAllMasterBudgetDocsForAdmin('2569').length, 2, 'Admin must see both document versions');
console.log('Admin tables, reversible removal, dependent-record guards, and audit history passed');

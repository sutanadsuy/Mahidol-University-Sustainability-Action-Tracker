const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class Sheet {
  constructor(rows) { this.rows = rows.map(row => [...row]); }
  getDataRange() { return { getValues: () => this.rows.map(row => [...row]) }; }
  getRange(row, col) { return {
    getValue: () => this.rows[row - 1]?.[col - 1] ?? '',
    setValue: value => { while (this.rows.length < row) this.rows.push([]); this.rows[row - 1][col - 1] = value; }
  }; }
  appendRow(row) { this.rows.push([...row]); }
  deleteRow(row) { this.rows.splice(row - 1, 1); }
  getLastRow() { return this.rows.length; }
}

const oldDate = new Date('2026-09-01T08:00:00+07:00');
const attachments = new Sheet([
  ['File_ID', 'Category', 'Reference_ID', 'Fiscal_Year', 'Month_Year', 'File_Type', 'File_Name', 'URL', 'Uploaded_At'],
  ['FILE-OLD1', 'Project', 'PRJ-69-01', '2569', 'ก.ย.', 'รายงาน', 'wrong.pdf', 'https://drive.google.com/file/d/old1/view', oldDate],
  ['FILE-OLD2', 'Project', 'PRJ-69-01', '2569', 'ก.ย.', 'รายงาน', 'draft.pdf', 'https://drive.google.com/file/d/old2/view', oldDate]
]);
const project = new Array(16).fill('');
project[0] = 'PRJ-69-01'; project[1] = '2569'; project[11] = 'editor@mahidol.ac.th';
const sheets = new Map([
  ['File_Attachments', attachments],
  ['Master_Projects', new Sheet([new Array(16).fill(''), project])]
]);
const trashed = [];
const newFiles = [];
const folder = { createFile(blob) {
  const id = `new${newFiles.length + 1}`;
  const file = {
    id, blob,
    setSharing() {},
    getUrl: () => `https://drive.google.com/file/d/${id}/view`,
    setTrashed: value => { if (value) trashed.push(id); }
  };
  newFiles.push(file);
  return file;
} };
const ss = { getSheetByName: name => sheets.get(name) || null };
let activeEmail = 'editor@mahidol.ac.th';
const context = vm.createContext({
  getAppSpreadsheet: () => ss,
  getOrCreateSheet_: (name, headers) => {
    if (!sheets.has(name)) sheets.set(name, new Sheet([headers]));
    return sheets.get(name);
  },
  getOrCreateFolder_: () => folder,
  CALENDAR_MONTHS: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  Session: { getActiveUser: () => ({ getEmail: () => activeEmail }), getScriptTimeZone: () => 'Asia/Bangkok' },
  checkAdminAccess: () => ({ isAdmin: false }),
  Utilities: {
    formatDate: date => new Date(date).toISOString(),
    base64Decode: value => Buffer.from(value, 'base64'),
    newBlob: (bytes, type, name) => ({ bytes, type, name }),
    getUuid: () => 'abcdef12-0000-0000-0000-000000000000'
  },
  DriveApp: {
    Access: { ANYONE_WITH_LINK: 'link' }, Permission: { VIEW: 'view' },
    getFileById: id => ({ setTrashed: value => { if (value) trashed.push(id); } })
  },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  console
});
vm.runInContext(fs.readFileSync('apps-script/ActualService.gs', 'utf8'), context);

assert.throws(() => context.deleteAttachmentFile('FILE-OLD1', '2569', 'OTHER', 'ก.ย. 2569'), /ไม่ตรง/);
assert.equal(attachments.rows.length, 3);
activeEmail = 'other@mahidol.ac.th';
assert.throws(() => context.deleteAttachmentFile('FILE-OLD1', '2569', 'PRJ-69-01', 'ก.ย. 2569'), /เฉพาะผู้รับผิดชอบ/);
assert.equal(attachments.rows.length, 3);
activeEmail = 'editor@mahidol.ac.th';

const removed = context.deleteAttachmentFile('FILE-OLD1', '2569', 'PRJ-69-01', 'ก.ย. 2569');
assert.equal(removed.success, true);
assert.equal(attachments.rows.length, 2);
assert.equal(sheets.get('File_Attachment_Audit').rows[1][9], 'removed');
assert.ok(trashed.includes('old1'));

const replaced = context.replaceAttachmentFile('FILE-OLD2', '2569', 'PRJ-69-01', 'ก.ย. 2569', {
  name: 'correct.pdf', mimeType: 'application/pdf', base64: 'data:application/pdf;base64,QUJD'
});
assert.equal(replaced.success, true);
assert.equal(attachments.rows.length, 2);
assert.equal(attachments.rows[1][6], 'correct.pdf');
assert.equal(attachments.rows[1][9], 'editor@mahidol.ac.th');
assert.equal(sheets.get('File_Attachment_Audit').rows[2][9], 'replaced');
assert.equal(sheets.get('File_Attachment_Audit').rows[2][12], attachments.rows[1][0]);
assert.ok(trashed.includes('old2'));

const history = context.getAttachmentHistory_(ss, attachments.rows.slice(1), '2569', 'PRJ-69-01');
assert.equal(history.length, 3);
assert.deepEqual(new Set(history.map(item => item.status)), new Set(['active', 'removed', 'replaced']));
assert.ok(history.every(item => item.month === 'ก.ย. 2569'));
assert.throws(() => context.replaceAttachmentFile('FILE-OLD2', '2569', 'PRJ-69-01', 'ก.ย. 2569', {
  name: 'bad.txt', mimeType: 'text/plain', base64: 'data:text/plain;base64,QUJD'
}), /PDF/);

console.log('Attachment removal, replacement, history, and scope checks passed');

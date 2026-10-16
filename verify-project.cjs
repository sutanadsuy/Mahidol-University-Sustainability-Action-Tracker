const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, 'apps-script');
const index = fs.readFileSync(path.join(root, 'Index.html'), 'utf8');
const includes = [...index.matchAll(/<\?!=\s*include\('([^']+)'\);\s*\?>/g)].map(m => m[1]);
if ((index.match(/<\/html>/gi) || []).length !== 1) throw new Error('Index.html has repeated document endings');
if (new Set(includes).size !== includes.length) throw new Error('Index.html includes a file more than once');

const context = vm.createContext({ window: {} });
for (const name of includes) {
  const file = path.join(root, `${name}.html`);
  if (!fs.existsSync(file)) throw new Error(`Missing include: ${name}`);
  if (!name.startsWith('Scripts')) continue;
  const html = fs.readFileSync(file, 'utf8');
  const match = html.match(/^\s*<script>\s*([\s\S]*?)\s*<\/script>\s*$/i);
  if (!match) throw new Error(`${name} is not one script block`);
  new vm.Script(match[1], { filename: file }).runInContext(context);
}
console.log(`Verified ${includes.length} unique includes and ${includes.filter(n => n.startsWith('Scripts')).length} scripts`);

const gsFiles = fs.readdirSync(root).filter(name => name.endsWith('.gs'));
const serverFunctions = new Map();
for (const name of gsFiles) {
  const code = fs.readFileSync(path.join(root, name), 'utf8');
  new vm.Script(code, { filename: name });
  for (const match of code.matchAll(/^function\s+([A-Za-z_$][\w$]*)\s*\(/gm)) {
    if (serverFunctions.has(match[1])) throw new Error(`Duplicate server function ${match[1]} in ${name} and ${serverFunctions.get(match[1])}`);
    serverFunctions.set(match[1], name);
  }
}
console.log(`Verified ${gsFiles.length} server files and ${serverFunctions.size} unique functions`);

const config = fs.readFileSync(path.join(root, 'ConfigService.gs'), 'utf8');
for (const [key, value, expected] of [
  ['draft', 5, 0.05],
  ['weight_draft', 0.05, 0.05]
]) {
  const sheet = { getDataRange: () => ({ getValues: () => [['Key', 'Value'], [key, value]] }) };
  const ctx = vm.createContext({ SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: () => sheet }) } });
  new vm.Script(config).runInContext(ctx);
  if (ctx.getStepWeights().draft !== expected) throw new Error(`Weight conversion failed for ${key}`);
}
console.log('Verified both System_Settings weight formats');

const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync(process.argv[2], 'utf8');
const match = source.match(/goog\.script\.init\(("(?:\\.|[^"\\])*")/);
if (!match) throw new Error('Apps Script HTML payload not found');
const encoded = vm.runInNewContext(match[1]);
const payload = JSON.parse(encoded);
const html = payload.userHtml;
fs.writeFileSync('Index.recovered.html', html, 'utf8');
console.log(`Recovered ${html.length} characters`);
console.log(`Script tags: ${(html.match(/<script\b/gi) || []).length}`);
console.log(`Initial calls: ${(html.match(/getInitialBootstrapData/g) || []).length}`);
let scriptNumber = 0;
for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
  scriptNumber++;
  try {
    new Function(match[1]);
    console.log(`Inline script ${scriptNumber}: syntax OK (${match[1].length} characters)`);
  } catch (error) {
    console.log(`Inline script ${scriptNumber}: ${error.message}`);
  }
  if (scriptNumber === 13) fs.writeFileSync('apps-script/ScriptsDashboardCharts.html', match[0], 'utf8');
}
const matrixStart = html.indexOf('<div class="tab-pane fade" id="matrixTab">');
const actualStart = html.indexOf('<div class="tab-pane fade" id="actualTab">', matrixStart);
if (matrixStart < 0 || actualStart < 0) throw new Error('Matrix tab boundaries not found');
fs.writeFileSync('apps-script/TabMatrix.html', html.slice(matrixStart, actualStart).trim() + '\n', 'utf8');

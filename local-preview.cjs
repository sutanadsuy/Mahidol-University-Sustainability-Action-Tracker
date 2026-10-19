const http = require('http');
const fs = require('fs');
const path = require('path');
const { runReadMethod, SPREADSHEET_ID } = require('./local-sheet-runtime.cjs');

const root = path.join(__dirname, 'apps-script');
const port = Number(process.env.PORT || 4173);

function render() {
  let html = fs.readFileSync(path.join(root, 'Index.html'), 'utf8');
  html = html.replace(/<\?!=\s*include\('([^']+)'\);\s*\?>/g, (_, name) => {
    if (!/^[A-Za-z0-9_]+$/.test(name)) throw new Error('Invalid include');
    return fs.readFileSync(path.join(root, `${name}.html`), 'utf8');
  });
  html = html.replace('<body class="p-3 p-md-4">', `<body class="p-3 p-md-4">
  <div class="alert alert-info text-center fw-bold" role="status">LOCAL READ-ONLY — แสดงข้อมูลจริงจาก Google Sheets · การบันทึกข้อมูลและอัปโหลดไฟล์ใช้ได้เฉพาะเว็บ Google Apps Script</div>`);
  html = html.replace('<!-- ส่วนเรียกโมดูลสคริปต์ย่อย -->', '<script src="/local-preview.js"></script>\n  <!-- ส่วนเรียกโมดูลสคริปต์ย่อย -->');
  return html;
}

http.createServer(async (request, response) => {
  try {
    if (request.url === '/favicon.ico') { response.writeHead(204); return response.end(); }
    if (request.url === '/api/health') {
      response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      return response.end(JSON.stringify({ connectedSheet: SPREADSHEET_ID, mode: 'read-only' }));
    }
    if (request.url === '/api/run' && request.method === 'POST') {
      let body = '';
      for await (const chunk of request) {
        body += chunk;
        if (body.length > 100000) throw new Error('Request too large');
      }
      const { method, args } = JSON.parse(body);
      try {
        const result = await runReadMethod(method, args);
        response.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        return response.end(JSON.stringify({ result }));
      } catch (error) {
        response.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        return response.end(JSON.stringify({ error: error.message }));
      }
    }
    if (request.url === '/local-preview.js') {
      response.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' });
      return response.end(fs.readFileSync(path.join(__dirname, 'local-preview.js')));
    }
    if (request.url !== '/' && request.url !== '/index.html') {
      response.writeHead(404); return response.end('Not found');
    }
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(render());
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(error.stack);
  }
}).listen(port, '127.0.0.1', () => console.log(`Local preview: http://127.0.0.1:${port}/`));

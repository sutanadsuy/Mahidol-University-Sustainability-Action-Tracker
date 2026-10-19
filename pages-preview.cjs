const http = require('http');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, 'docs');
const types = { '.html': 'text/html', '.js': 'text/javascript' };
http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const file = path.join(root, pathname === '/' ? 'index.html' : pathname.slice(1));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404); return response.end('Not found');
  }
  response.writeHead(200, { 'Content-Type': `${types[path.extname(file)] || 'text/plain'}; charset=utf-8`, 'Cache-Control': 'no-store' });
  fs.createReadStream(file).pipe(response);
}).listen(4174, '127.0.0.1', () => console.log('GitHub Pages preview: http://127.0.0.1:4174/'));

const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const port = 4180;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };

http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://127.0.0.1').pathname;
  const file = path.resolve(root, pathname === '/' || pathname === '/index.html' ? 'starter.html' : `.${pathname}`);
  if (!file.startsWith(`${root}${path.sep}`) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  response.writeHead(200, {
    'Content-Type': `${types[path.extname(file)] || 'text/plain'}; charset=utf-8`,
    'Cache-Control': 'no-store'
  });
  fs.createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => console.log(`UX mockup: http://127.0.0.1:${port}/`));

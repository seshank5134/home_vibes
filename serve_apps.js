const http = require('http');
const fs = require('fs');
const path = require('path');

function createStaticServer(rootFolder, port, name) {
  const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.svg': 'image/svg+xml'
  };

  const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    let reqPath = decodeURI(req.url.split('?')[0]);
    if (reqPath === '/') reqPath = '/index.html';

    let filePath;
    if (reqPath.startsWith('/customer-web/')) {
      filePath = path.join(__dirname, reqPath);
    } else {
      filePath = path.join(rootFolder, reqPath);
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(`<h1>404 Not Found: ${reqPath}</h1>`);
        } else {
          res.writeHead(500);
          res.end(`Server Error: ${err.code}`);
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content, 'utf-8');
      }
    });
  });

  server.listen(port, () => {
    console.log(`🚀 ${name} running at http://localhost:${port}/`);
  });

  return server;
}

const customerRoot = path.join(__dirname, 'customer-web');
const adminRoot = path.join(__dirname, 'admin-web');

createStaticServer(customerRoot, 3000, 'HomeVibes Customer Web');
createStaticServer(adminRoot, 3001, 'HomeVibes Admin Web');

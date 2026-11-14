/**
 * Gesundheit-App & TÜV Theorie-Trainer Server
 * Zero-dependency local network server for iPad Pro 10.5, iPhone 12 Pro & Desktop PC
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

const PORT = 8080;
const BASE_DIR = __dirname;
const SYNC_FILE = path.join(BASE_DIR, 'data_sync.json');

// MIME Types
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8'
};

// Detect local LAN IPv4 address (Wi-Fi or Ethernet)
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

// -------------------------------------------------------------
// STANDALONE QR CODE GENERATOR (Nayuki Public Domain subset)
// -------------------------------------------------------------
const QrCode = (() => {
  function QrCode(version, ecl, dataCodewords, msk) {
    this.version = version;
    this.ecl = ecl;
    this.size = version * 4 + 17;
    this.modules = Array.from({ length: this.size }, () => new Array(this.size).fill(false));
    this.isFunction = Array.from({ length: this.size }, () => new Array(this.size).fill(false));

    drawFunctionPatterns(this);
    const allCodewords = addEccAndInterleave(dataCodewords, version, ecl);
    drawCodewords(this, allCodewords);

    if (msk < 0) {
      let minPenalty = 1e9, bestMask = 0;
      for (let i = 0; i < 8; i++) {
        applyMask(this, i);
        drawFormatBits(this, i);
        const penalty = getPenaltyScore(this);
        if (penalty < minPenalty) { minPenalty = penalty; bestMask = i; }
        applyMask(this, i);
      }
      msk = bestMask;
    }
    this.mask = msk;
    applyMask(this, msk);
    drawFormatBits(this, msk);
  }

  QrCode.encodeText = function(text, ecl = 1) {
    const bytes = [];
    for (let i = 0; i < text.length; i++) {
      let c = text.charCodeAt(i);
      if (c < 128) bytes.push(c);
      else if (c < 2048) { bytes.push(192 | (c >> 6)); bytes.push(128 | (c & 63)); }
      else { bytes.push(224 | (c >> 12)); bytes.push(128 | ((c >> 6) & 63)); bytes.push(128 | (c & 63)); }
    }
    for (let version = 1; version <= 40; version++) {
      const dataCap = getNumDataCodewords(version, ecl) * 8;
      const charBits = version < 10 ? 8 : 16;
      if (4 + charBits + bytes.length * 8 <= dataCap) {
        const bb = [];
        appendBits(4, 4, bb);
        appendBits(bytes.length, charBits, bb);
        for (let b of bytes) appendBits(b, 8, bb);
        const pad = Math.min(4, dataCap - bb.length);
        appendBits(0, pad, bb);
        while (bb.length % 8 !== 0) bb.push(0);
        const padBytes = [0xEC, 0x11];
        let padIdx = 0;
        while (bb.length < dataCap) { appendBits(padBytes[padIdx % 2], 8, bb); padIdx++; }
        const dataCodewords = [];
        for (let i = 0; i < bb.length; i += 8) {
          let byte = 0;
          for (let j = 0; j < 8; j++) byte = (byte << 1) | bb[i + j];
          dataCodewords.push(byte);
        }
        return new QrCode(version, ecl, dataCodewords, -1);
      }
    }
    throw new Error("Text too long");
  };

  function appendBits(val, len, bb) {
    for (let i = len - 1; i >= 0; i--) bb.push((val >>> i) & 1);
  }

  const ECC_WORDS = [null,
    [10, 7, 17, 13], [16, 10, 28, 22], [26, 15, 44, 36], [36, 20, 64, 52],
    [48, 26, 88, 72], [64, 36, 112, 96], [72, 40, 130, 108], [88, 48, 156, 132],
    [110, 60, 192, 160], [130, 72, 224, 192], [150, 80, 264, 224], [176, 96, 308, 260],
    [198, 104, 352, 288], [216, 120, 384, 320], [240, 132, 432, 360], [280, 144, 480, 400]
  ];
  const ECC_BLOCKS = [null,
    [1, 1, 1, 1], [1, 1, 1, 1], [1, 1, 2, 2], [1, 2, 2, 4],
    [1, 2, 4, 4], [2, 4, 4, 4], [2, 4, 6, 5], [2, 4, 6, 6],
    [2, 5, 8, 8], [4, 5, 8, 8], [4, 5, 8, 11], [4, 8, 10, 11],
    [4, 9, 12, 16], [4, 9, 16, 16], [6, 10, 12, 18], [6, 10, 17, 16]
  ];

  function getNumDataCodewords(ver, ecl) {
    return Math.floor(getNumRawDataModules(ver) / 8) - ECC_WORDS[ver][ecl];
  }
  function getNumRawDataModules(ver) {
    let result = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      const numAlign = Math.floor(ver / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (ver >= 7) result -= 36;
    }
    return result;
  }

  function drawFunctionPatterns(qr) {
    const size = qr.size;
    drawFinder(qr, 3, 3);
    drawFinder(qr, size - 4, 3);
    drawFinder(qr, 3, size - 4);
    for (let i = 0; i < size; i++) {
      setFunction(qr, 6, i, i % 2 === 0);
      setFunction(qr, i, 6, i % 2 === 0);
    }
    const align = getAlignment(qr.version);
    for (let r of align) {
      for (let c of align) {
        if (!((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6))) {
          drawAlignment(qr, c, r);
        }
      }
    }
    drawFormatBits(qr, 0);
  }

  function drawFinder(qr, cx, cy) {
    for (let dy = -4; dy <= 4; dy++) {
      for (let dx = -4; dx <= 4; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        const x = cx + dx, y = cy + dy;
        if (x >= 0 && x < qr.size && y >= 0 && y < qr.size) setFunction(qr, x, y, d !== 2 && d !== 4);
      }
    }
  }

  function drawAlignment(qr, cx, cy) {
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        setFunction(qr, cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  function setFunction(qr, x, y, isDark) {
    qr.modules[y][x] = isDark;
    qr.isFunction[y][x] = true;
  }

  function getAlignment(ver) {
    if (ver === 1) return [];
    const num = Math.floor(ver / 7) + 2;
    const step = Math.ceil((ver * 4 + 4) / (num * 2 - 2)) * 2;
    const res = [6];
    for (let p = ver * 4 + 10; res.length < num; p -= step) res.splice(1, 0, p);
    return res;
  }

  function drawFormatBits(qr, mask) {
    const data = ((qr.ecl ^ 1) << 3) | mask;
    let rem = data;
    for (let i = 0; i < 10; i++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const bits = ((data << 10) | rem) ^ 0x5412;
    for (let i = 0; i <= 5; i++) qr.modules[8][i] = ((bits >>> i) & 1) !== 0;
    qr.modules[8][7] = ((bits >>> 6) & 1) !== 0;
    qr.modules[8][8] = ((bits >>> 7) & 1) !== 0;
    qr.modules[7][8] = ((bits >>> 8) & 1) !== 0;
    for (let i = 9; i < 15; i++) qr.modules[14 - i][8] = ((bits >>> i) & 1) !== 0;
    const s = qr.size;
    for (let i = 0; i < 8; i++) qr.modules[s - 1 - i][8] = ((bits >>> i) & 1) !== 0;
    for (let i = 8; i < 15; i++) qr.modules[8][s - 15 + i] = ((bits >>> i) & 1) !== 0;
    qr.modules[s - 8][8] = true;
  }

  function addEccAndInterleave(data, ver, ecl) {
    const numBlocks = ECC_BLOCKS[ver][ecl];
    const blockEccLen = Math.floor(ECC_WORDS[ver][ecl] / numBlocks);
    const rawCodewords = Math.floor(getNumRawDataModules(ver) / 8);
    const numShortBlocks = numBlocks - (rawCodewords % numBlocks);
    const shortBlockLen = Math.floor(rawCodewords / numBlocks);
    const blocks = [];
    const rsDiv = rsDivisor(blockEccLen);
    for (let i = 0, k = 0; i < numBlocks; i++) {
      const len = shortBlockLen - blockEccLen + (i >= numShortBlocks ? 1 : 0);
      const dat = data.slice(k, k + len);
      k += len;
      blocks.push({ data: dat, ecc: rsRemainder(dat, rsDiv) });
    }
    const res = [];
    for (let i = 0; i < shortBlockLen - blockEccLen + 1; i++) {
      for (let j = 0; j < numBlocks; j++) if (i < blocks[j].data.length) res.push(blocks[j].data[i]);
    }
    for (let i = 0; i < blockEccLen; i++) {
      for (let j = 0; j < numBlocks; j++) res.push(blocks[j].ecc[i]);
    }
    return res;
  }

  function rsDivisor(degree) {
    const res = new Array(degree).fill(0);
    res[degree - 1] = 1;
    let root = 1;
    for (let i = 0; i < degree; i++) {
      for (let j = 0; j < res.length; j++) {
        res[j] = rsMul(res[j], root);
        if (j + 1 < res.length) res[j] ^= res[j + 1];
      }
      root = rsMul(root, 0x02);
    }
    return res;
  }

  function rsRemainder(data, div) {
    const res = new Array(div.length).fill(0);
    for (let b of data) {
      const factor = b ^ res.shift();
      res.push(0);
      for (let i = 0; i < div.length; i++) res[i] ^= rsMul(div[i], factor);
    }
    return res;
  }

  function rsMul(x, y) {
    let z = 0;
    for (let i = 7; i >= 0; i--) {
      z = (z << 1) ^ ((z >>> 7) * 0x11D);
      z ^= ((y >>> i) & 1) * x;
    }
    return z;
  }

  function drawCodewords(qr, data) {
    let i = 0;
    const s = qr.size;
    for (let right = s - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (let vert = 0; vert < s; vert++) {
        for (let j = 0; j < 2; j++) {
          const x = right - j, upward = ((right + 1) & 2) === 0;
          const y = upward ? s - 1 - vert : vert;
          if (!qr.isFunction[y][x] && i < data.length * 8) {
            qr.modules[y][x] = ((data[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
            i++;
          }
        }
      }
    }
  }

  function applyMask(qr, mask) {
    const s = qr.size;
    for (let y = 0; y < s; y++) {
      for (let x = 0; x < s; x++) {
        if (!qr.isFunction[y][x]) {
          let inv = false;
          switch (mask) {
            case 0: inv = (x + y) % 2 === 0; break;
            case 1: inv = y % 2 === 0; break;
            case 2: inv = x % 3 === 0; break;
            case 3: inv = (x + y) % 3 === 0; break;
            case 4: inv = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0; break;
            case 5: inv = ((x * y) % 2) + ((x * y) % 3) === 0; break;
            case 6: inv = (((x * y) % 2) + ((x * y) % 3)) % 2 === 0; break;
            case 7: inv = (((x + y) % 2) + ((x * y) % 3)) % 2 === 0; break;
          }
          if (inv) qr.modules[y][x] = !qr.modules[y][x];
        }
      }
    }
  }

  function getPenaltyScore(qr) {
    let res = 0;
    const s = qr.size;
    for (let y = 0; y < s; y++) {
      let runC = false, runV = 0;
      for (let x = 0; x < s; x++) {
        if (qr.modules[y][x] === runC) { runV++; if (runV === 5) res += 3; else if (runV > 5) res++; }
        else { runC = qr.modules[y][x]; runV = 1; }
      }
    }
    return res;
  }

  QrCode.prototype.toSvgString = function(border = 3) {
    const size = this.size + border * 2;
    let parts = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">`];
    parts.push(`<rect width="${size}" height="${size}" fill="#ffffff"/>`);
    parts.push(`<path fill="#0f172a" d="`);
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.modules[y][x]) parts.push(`M${x + border},${y + border}h1v1h-1z `);
      }
    }
    parts.push(`"/>`);
    parts.push(`</svg>`);
    return parts.join("");
  };

  QrCode.prototype.toAscii = function() {
    let str = "";
    const b = 1;
    for (let y = -b; y < this.size + b; y += 2) {
      for (let x = -b; x < this.size + b; x++) {
        const top = (y >= 0 && y < this.size && x >= 0 && x < this.size) ? this.modules[y][x] : false;
        const bottom = (y + 1 >= 0 && y + 1 < this.size && x >= 0 && x < this.size) ? this.modules[y + 1][x] : false;
        if (top && bottom) str += "█";
        else if (top && !bottom) str += "▀";
        else if (!top && bottom) str += "▄";
        else str += " ";
      }
      str += "\n";
    }
    return str;
  };

  return QrCode;
})();

// Create HTTP Server
const server = http.createServer((req, res) => {
  // CORS & PWA headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // API: Server info & IP
  if (pathname === '/api/info') {
    const ip = getLocalIP();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ip,
      port: PORT,
      localUrl: `http://localhost:${PORT}`,
      networkUrl: `http://${ip}:${PORT}`,
      devices: ['iPad Pro 10.5', 'iPhone 12 Pro', 'Desktop PC']
    }));
    return;
  }

  // API: QR-Code SVG
  if (pathname === '/api/qr') {
    const ip = getLocalIP();
    const url = `http://${ip}:${PORT}`;
    const qr = QrCode.encodeText(url, 1);
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    res.end(qr.toSvgString(3));
    return;
  }

  // API: Data Sync (GET / POST)
  if (pathname === '/api/sync') {
    if (req.method === 'GET') {
      if (fs.existsSync(SYNC_FILE)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        fs.createReadStream(SYNC_FILE).pipe(res);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'No backup file exists yet on server.' }));
      }
      return;
    } else if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          parsed.serverSavedAt = new Date().toISOString();
          fs.writeFileSync(SYNC_FILE, JSON.stringify(parsed, null, 2), 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, timestamp: parsed.serverSavedAt }));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
        }
      });
      return;
    }
  }

  // Static File Serving
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }

  const filePath = path.join(BASE_DIR, pathname);

  // Security: prevent path traversal
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(403);
    res.end('Access Denied');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Prevent caching on HTML and SW so updates show immediately
    if (ext === '.html' || pathname === '/sw.js') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  const ip = getLocalIP();
  const networkUrl = `http://${ip}:${PORT}`;
  const localUrl = `http://localhost:${PORT}`;
  const qr = QrCode.encodeText(networkUrl, 1);

  console.log('\n' + '='.repeat(64));
  console.log('  🏥 GESUNDHEIT-APP & 🚗 TÜV THEORIE-TRAINER SERVER LÄUFT!');
  console.log('='.repeat(64));
  console.log(`\n  💻 Desktop PC:           ${localUrl}`);
  console.log(`  📱 iPhone 12 Pro & iPad: ${networkUrl}`);
  console.log('\n  👉 Scannen Sie diesen QR-Code mit der Kamera des iPad/iPhone:');
  console.log(qr.toAscii());
  console.log('  💡 Tipp für iPhone & iPad:');
  console.log('     1. Link in Safari öffnen');
  console.log('     2. Unten auf Teilen ⬆️ tippen -> "Zum Home-Bildschirm"');
  console.log('     3. Fertig! Die App funktioniert danach auch 100% offline.');
  console.log('='.repeat(64) + '\n');

  // Auto-open on Desktop PC
  exec(`start ${localUrl}`);
});


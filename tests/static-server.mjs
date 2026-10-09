import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
createServer(async (req, res) => {
    try {
        const path = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
        const relative = path === '/' ? 'index.html' : path.slice(1);
        if (!/^(?:assets\/|data\/|(?:index|3A|3B|4A|4B|admin|404)\.html$)/.test(relative) || relative.split(/[\\/]/).includes('..')) {
            res.writeHead(404).end();
            return;
        }
        const file = resolve(root, relative);
        if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
        const content = await readFile(file);
        res.writeHead(200, { 'Content-Type': `${mime[extname(file)] || 'application/octet-stream'}; charset=utf-8`, 'Cache-Control': 'no-store' });
        res.end(content);
    } catch {
        res.writeHead(404).end();
    }
}).listen(4173, '127.0.0.1');

import { mkdtempSync, readFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { renderPages } from './build-pages.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const temp = mkdtempSync(join(tmpdir(), 'daily-notes-css-'));
const output = join(temp, 'tailwind.css');
const normalize = text => text.replace(/\r\n/g, '\n');
try {
    execFileSync(process.execPath, [join(root, 'node_modules/tailwindcss/lib/cli.js'),
        '-i', 'assets/tailwind.source.css', '-o', output, '--minify'], { cwd: root, stdio: 'pipe' });
    const stale = [];
    if (normalize(readFileSync(output, 'utf8')) !== normalize(readFileSync(join(root, 'assets/tailwind.min.css'), 'utf8'))) {
        stale.push('assets/tailwind.min.css');
    }
    for (const page of renderPages(root)) {
        if (normalize(readFileSync(join(root, page.file), 'utf8')) !== normalize(page.html)) stale.push(page.file);
    }
    if (stale.length) throw new Error(`生成文件未同步: ${stale.join(', ')}。请运行 npm run build 并提交生成文件。`);
    console.log('CSS、入口模板和资源哈希一致，检查未改动仓库文件。');
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    // 只清理本次创建的单个文件和空目录，不进行递归删除。
    try { unlinkSync(output); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    rmdirSync(temp);
}

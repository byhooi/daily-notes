// 从 templates/page.template.html 生成四个年级入口页,
// 避免手工同步多份几乎相同的 HTML。
// 用法: npm run build:pages  (生成结果需提交到仓库)
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://daily.byhooi.tk';

const pages = [
    { file: 'index.html', title: '每日积累 - 五年级上', dataFile: 'data/51data.js', url: `${SITE_URL}/` },
    { file: '31.html', title: '每日积累 - 三年级上', dataFile: 'data/31data.js', url: `${SITE_URL}/31.html` },
    { file: '32.html', title: '每日积累 - 三年级下', dataFile: 'data/32data.js', url: `${SITE_URL}/32.html` },
    { file: '41.html', title: '每日积累 - 四年级上', dataFile: 'data/41data.js', url: `${SITE_URL}/41.html` },
    { file: '42.html', title: '每日积累 - 四年级下', dataFile: 'data/42data.js', url: `${SITE_URL}/42.html` },
];

const template = readFileSync(join(root, 'templates', 'page.template.html'), 'utf8');

for (const page of pages) {
    const html = template
        .replaceAll('{{TITLE}}', page.title)
        .replaceAll('{{DATA_FILE}}', page.dataFile)
        .replaceAll('{{PAGE_URL}}', page.url);

    writeFileSync(join(root, page.file), html, 'utf8');
    console.log(`生成 ${page.file} (${page.title})`);
}

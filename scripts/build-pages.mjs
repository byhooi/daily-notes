// 从 templates/page.template.html 生成各年级入口页,
// 避免手工同步多份几乎相同的 HTML。
// 用法: npm run build:pages  (生成结果需提交到仓库)
//
// 本地资源使用固定路径，仅修改资源内容时无需重新生成入口。
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://daily.yangbing.eu.org';
// Git 在 Windows 检出时可能转换换行符，统一文本以保持跨平台构建一致。
const readText = path => readFileSync(path, 'utf8').replace(/\r\n/g, '\n');

const pages = [
    { file: 'index.html', title: '每日积累 - 五年级上', dataFile: 'data/5Adata.js', url: `${SITE_URL}/` },
    { file: '3A.html', title: '每日积累 - 三年级上', dataFile: 'data/3Adata.js', url: `${SITE_URL}/3A.html` },
    { file: '3B.html', title: '每日积累 - 三年级下', dataFile: 'data/3Bdata.js', url: `${SITE_URL}/3B.html` },
    { file: '4A.html', title: '每日积累 - 四年级上', dataFile: 'data/4Adata.js', url: `${SITE_URL}/4A.html` },
    { file: '4B.html', title: '每日积累 - 四年级下', dataFile: 'data/4Bdata.js', url: `${SITE_URL}/4B.html` },
];

export function renderPages(root = projectRoot) {
    function requireResource(relPath) {
        if (!existsSync(join(root, relPath))) throw new Error(`缺少资源: ${relPath}，请检查文件或运行 npm run build:css`);
        return relPath;
    }

    const template = readText(join(root, 'templates', 'page.template.html'));
    for (const match of template.matchAll(/(?:href|src)="(assets\/[^"?]+\.(?:css|js))"/g)) {
        requireResource(match[1]);
    }

    return pages.map(page => {
        const html = template
            .replaceAll('{{TITLE}}', page.title)
            .replaceAll('{{DATA_FILE}}', requireResource(page.dataFile))
            .replaceAll('{{PAGE_URL}}', page.url);

        if (/\{\{[A-Z_]+\}\}/.test(html)) throw new Error(`模板中存在未替换的占位符: ${page.file}`);
        return { ...page, html };
    });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    // 全部资源通过验证后再写入，避免缺文件时只更新部分入口。
    for (const page of renderPages()) {
        writeFileSync(join(projectRoot, page.file), page.html, 'utf8');
        console.log(`生成 ${page.file} (${page.title})`);
    }
}

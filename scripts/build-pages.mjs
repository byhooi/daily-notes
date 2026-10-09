// 从 templates/page.template.html 生成各年级入口页,
// 避免手工同步多份几乎相同的 HTML。
// 用法: npm run build:pages  (生成结果需提交到仓库)
//
// 本地静态资源(assets/*.css|js 与数据文件)会追加 ?v=<内容哈希前 8 位>,
// 内容一变版本号就变,避免部署后被浏览器或 CDN 的旧缓存挡住。
// 因此发布到 GitHub Pages 前必须运行 npm run build,让线上 HTML 带上最新哈希。
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_URL = 'https://daily.yangbing.eu.org';

const pages = [
    { file: 'index.html', title: '每日积累 - 五年级上', dataFile: 'data/5Adata.js', url: `${SITE_URL}/` },
    { file: '3A.html', title: '每日积累 - 三年级上', dataFile: 'data/3Adata.js', url: `${SITE_URL}/3A.html` },
    { file: '3B.html', title: '每日积累 - 三年级下', dataFile: 'data/3Bdata.js', url: `${SITE_URL}/3B.html` },
    { file: '4A.html', title: '每日积累 - 四年级上', dataFile: 'data/4Adata.js', url: `${SITE_URL}/4A.html` },
    { file: '4B.html', title: '每日积累 - 四年级下', dataFile: 'data/4Bdata.js', url: `${SITE_URL}/4B.html` },
];

export function renderPages(root = projectRoot) {
    const versionCache = new Map();

    function versionOf(relPath) {
        if (versionCache.has(relPath)) return versionCache.get(relPath);

        const abs = join(root, relPath);
        if (!existsSync(abs)) throw new Error(`缺少资源: ${relPath}，请先运行 npm run build:css`);
        const version = createHash('sha256').update(readFileSync(abs)).digest('hex').slice(0, 8);

        versionCache.set(relPath, version);
        return version;
    }

    function stamp(relPath) {
        return `${relPath}?v=${versionOf(relPath)}`;
    }

    const template = readFileSync(join(root, 'templates', 'page.template.html'), 'utf8');

    return pages.map(page => {
        const html = template
            .replaceAll('{{TITLE}}', page.title)
            .replaceAll('{{DATA_FILE}}', stamp(page.dataFile))
            .replaceAll('{{PAGE_URL}}', page.url)
            .replace(/(href|src)="(assets\/[^"?]+\.(?:css|js))"/g, (_match, attr, path) => `${attr}="${stamp(path)}"`);

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

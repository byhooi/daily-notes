import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { renderPages } from '../../scripts/build-pages.mjs';

test('五个入口均来自模板，主题脚本在 head，资源含哈希', () => {
    const pages = renderPages();
    assert.equal(pages.length, 5);
    for (const page of pages) {
        assert.match(page.html, /assets\/theme\.js\?v=[a-f0-9]{8}/);
        assert.ok(page.html.indexOf('assets/theme.js') < page.html.indexOf('</head>'));
        assert.equal(page.html.match(/assets\/theme\.js/g).length, 1);
        assert.ok(!page.html.includes('{{'));
        assert.match(page.html, /daily\.yangbing\.eu\.org/);
    }
});

test('缺少数据或样式资源时生成器报错，不写入入口', () => {
    const root = mkdtempSync(join(tmpdir(), 'daily-notes-build-test-'));
    const templates = join(root, 'templates');
    const file = join(templates, 'page.template.html');
    mkdirSync(templates);
    writeFileSync(file, '<script src="{{DATA_FILE}}"></script>');
    try {
        assert.throws(() => renderPages(root), /缺少资源/);
    } finally {
        unlinkSync(file);
        rmdirSync(templates);
        rmdirSync(root);
    }
});

test('LF 与 CRLF 生成结果一致，实际资源内容变更仍更新哈希', () => {
    const root = mkdtempSync(join(tmpdir(), 'daily-notes-build-eol-test-'));
    const directories = ['templates', 'assets', 'data'];
    const files = new Map([
        ['templates/page.template.html', [
            '<title>{{TITLE}}</title>',
            '<link rel="canonical" href="{{PAGE_URL}}">',
            '<link rel="stylesheet" href="assets/common.css">',
            '<script src="assets/common.js"></script>',
            '<script src="{{DATA_FILE}}"></script>',
            '',
        ].join('\n')],
        ['assets/common.css', 'body {\n    color: black;\n}\n'],
        ['assets/common.js', 'window.ready = true;\n'],
        ...['5A', '3A', '3B', '4A', '4B'].map(grade => [
            `data/${grade}data.js`, `window.data${grade} = [\n];\n`,
        ]),
    ]);
    try {
        for (const directory of directories) mkdirSync(join(root, directory));
        for (const [file, text] of files) writeFileSync(join(root, file), text);
        const lfPages = renderPages(root);
        for (const [file, text] of files) writeFileSync(join(root, file), text.replace(/\n/g, '\r\n'));
        assert.deepEqual(renderPages(root), lfPages);

        for (const file of ['assets/common.css', 'assets/common.js', 'data/5Adata.js']) {
            writeFileSync(join(root, file), files.get(file) + '/* changed */\n');
            const changedPages = renderPages(root);
            assert.notEqual(changedPages[0].html, lfPages[0].html, `${file} 内容变更应更新哈希`);
            if (file.startsWith('data/')) assert.deepEqual(changedPages.slice(1), lfPages.slice(1));
            writeFileSync(join(root, file), files.get(file));
        }
    } finally {
        for (const file of files.keys()) {
            try { unlinkSync(join(root, file)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
        }
        for (const directory of directories) rmdirSync(join(root, directory));
        rmdirSync(root);
    }
});

test('Tailwind 直接扫描模板，完整构建保持校验优先', () => {
    const require = createRequire(import.meta.url);
    const config = require('../../tailwind.config.js');
    assert.ok(config.content.includes('./templates/**/*.html'));
    const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
    assert.equal(pkg.scripts.build, 'npm run check && npm run build:css && npm run build:pages');
});

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

test('Tailwind 直接扫描模板，完整构建保持校验优先', () => {
    const require = createRequire(import.meta.url);
    const config = require('../../tailwind.config.js');
    assert.ok(config.content.includes('./templates/**/*.html'));
    const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
    assert.equal(pkg.scripts.build, 'npm run check && npm run build:css && npm run build:pages');
});

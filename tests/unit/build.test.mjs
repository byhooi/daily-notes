import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { renderPages } from '../../scripts/build-pages.mjs';

test('五个入口均来自模板，主题脚本在 head，资源使用固定路径', () => {
    const pages = renderPages();
    assert.equal(pages.length, 5);
    for (const page of pages) {
        assert.ok(page.html.includes('src="assets/theme.js"'));
        assert.ok(page.html.includes(`src="${page.dataFile}"`));
        assert.ok(page.html.includes('src="assets/common.js"'));
        assert.ok(page.html.includes('href="assets/common.css"'));
        assert.ok(page.html.includes('href="assets/tailwind.min.css"'));
        assert.doesNotMatch(page.html, /(?:href|src)="(?:assets|data)\/[^"\s]*\?/);
        assert.ok(page.html.indexOf('assets/theme.js') < page.html.indexOf('</head>'));
        assert.equal(page.html.match(/assets\/theme\.js/g).length, 1);
        assert.ok(!page.html.includes('{{'));
        assert.match(page.html, /daily\.yangbing\.eu\.org/);
    }
});

test('缺少数据时生成器报错，不写入入口', () => {
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

test('换行符与资源内容变更不影响入口，模板变更仍更新入口且缺少资源仍报错', () => {
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

        for (const file of [...files.keys()].filter(file => !file.startsWith('templates/'))) {
            writeFileSync(join(root, file), files.get(file) + '/* changed */\n');
            assert.deepEqual(renderPages(root), lfPages, `${file} 内容变更不应改变入口`);
            unlinkSync(join(root, file));
            assert.throws(() => renderPages(root), error => error.message.includes(`缺少资源: ${file}`));
            writeFileSync(join(root, file), files.get(file));
        }

        const template = 'templates/page.template.html';
        writeFileSync(join(root, template), files.get(template) + '<main></main>\n');
        const changedPages = renderPages(root);
        for (let index = 0; index < lfPages.length; index++) {
            assert.equal(changedPages[index].html, lfPages[index].html + '<main></main>\n');
        }
    } finally {
        for (const file of files.keys()) {
            try { unlinkSync(join(root, file)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
        }
        for (const directory of directories) rmdirSync(join(root, directory));
        rmdirSync(root);
    }
});

test('Tailwind 直接扫描模板，构建与 CI 不再运行数据格式校验', () => {
    const require = createRequire(import.meta.url);
    const config = require('../../tailwind.config.js');
    assert.ok(config.content.includes('./templates/**/*.html'));
    const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
    assert.equal(pkg.scripts.build, 'npm run build:css && npm run build:pages');
    assert.equal(Object.hasOwn(pkg.scripts, 'check'), false);
    const workflow = readFileSync(new URL('../../.github/workflows/check.yml', import.meta.url), 'utf8');
    assert.doesNotMatch(workflow, /npm run check(?=\s|$)/);
    assert.ok(workflow.includes('npm run check:generated'));
    assert.ok(workflow.includes('npm run test:e2e'));
});

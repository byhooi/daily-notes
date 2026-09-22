// 校验 data/*.js 数据文件,在 npm run build 前运行(也可单独 npm run check)。
// 检查项:能否执行、window.dataXX 是否为数组、日期格式与有效性、同文件内重复日期、
//        content 非空、title 若存在非空、未知字段、常用 HTML 标签是否成对。
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'data');
const ALLOWED_KEYS = ['date', 'title', 'content'];
const PAIRED_TAGS = ['ol', 'ul', 'li', 'span', 'p', 'b', 'strong', 'em', 'i', 'u'];

let errorCount = 0;

function fail(file, index, message) {
    const where = index === null ? file : `${file} 第 ${index + 1} 条`;
    console.error(`✗ ${where}: ${message}`);
    errorCount++;
}

function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [y, m, d] = value.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

function unbalancedTags(html) {
    const problems = [];
    for (const tag of PAIRED_TAGS) {
        const open = (html.match(new RegExp(`<${tag}(\\s[^>]*)?>`, 'gi')) || []).length;
        const close = (html.match(new RegExp(`</${tag}\\s*>`, 'gi')) || []).length;
        if (open !== close) problems.push(`<${tag}> 开 ${open} 个、闭 ${close} 个`);
    }
    return problems;
}

const files = readdirSync(dataDir).filter(name => /^\d[AB]data\.js$/.test(name)).sort();
if (files.length === 0) {
    fail('data/', null, '没有找到任何数据文件');
}

for (const file of files) {
    const varName = `data${file.replace('data.js', '')}`;
    const sandbox = { window: {} };

    try {
        vm.runInNewContext(readFileSync(join(dataDir, file), 'utf8'), sandbox, { filename: file });
    } catch (error) {
        fail(file, null, `无法执行: ${error.message}`);
        continue;
    }

    const data = sandbox.window[varName];
    if (!Array.isArray(data)) {
        fail(file, null, `window.${varName} 不存在或不是数组`);
        continue;
    }

    const seenDates = new Map();
    data.forEach((entry, index) => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            fail(file, index, '不是对象');
            return;
        }

        for (const key of Object.keys(entry)) {
            if (!ALLOWED_KEYS.includes(key)) fail(file, index, `未知字段 "${key}"`);
        }

        if (typeof entry.date !== 'string' || !isValidDate(entry.date)) {
            fail(file, index, `日期无效: ${JSON.stringify(entry.date)},应为 YYYY-MM-DD`);
        } else if (seenDates.has(entry.date)) {
            fail(file, index, `日期 ${entry.date} 与第 ${seenDates.get(entry.date) + 1} 条重复`);
        } else {
            seenDates.set(entry.date, index);
        }

        if (typeof entry.content !== 'string' || !entry.content.trim()) {
            fail(file, index, 'content 为空或不是字符串');
        } else {
            for (const problem of unbalancedTags(entry.content)) {
                fail(file, index, `标签不成对: ${problem}`);
            }
        }

        if ('title' in entry && (typeof entry.title !== 'string' || !entry.title.trim())) {
            fail(file, index, 'title 存在但为空或不是字符串');
        }
    });

    console.log(`${file}: ${data.length} 条`);
}

if (errorCount > 0) {
    console.error(`\n数据校验失败,共 ${errorCount} 处问题`);
    process.exit(1);
}

console.log('\n数据校验通过');

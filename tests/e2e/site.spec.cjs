const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
    // 功能回归不依赖外部字体服务，也不产生第三方请求。
    await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({ contentType: 'text/css', body: '' }));
});

for (const [file, grade] of [['index.html', '5A'], ['3A.html', '3A'], ['3B.html', '3B'], ['4A.html', '4A'], ['4B.html', '4B']]) {
    test(`${grade} 入口、日期排序和布局`, async ({ page }) => {
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`/${file}`);
        const count = await page.evaluate(grade => window[`data${grade}`].length, grade);
        await expect(page.locator('.card')).toHaveCount(count);
        const dates = await page.locator('.card').evaluateAll(cards => cards.map(card => card.dataset.date));
        expect(dates).toEqual([...dates].sort().reverse());
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        expect(errors).toEqual([]);
        if (grade === '5A') {
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.screenshot({ path: test.info().outputPath('home.png') });
        }
    });
}

test('主题存储被禁止时正文和交互仍正常', async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.addInitScript(() => {
        Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('禁止存储', 'SecurityError'); } });
    });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/index.html');
    await expect(page.locator('.card').first()).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.locator('.theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.locator('#searchInput').fill('不存在的测试词');
    await expect(page.locator('#noResultsMessage')).toBeVisible();
    expect(errors).toEqual([]);
});

test('主题持久化，正文数据下载前已应用偏好', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('theme', 'dark'));
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    await page.route('**/data/5Adata.js*', async route => { await gate; await route.continue(); });
    const navigation = page.goto('/index.html');
    try {
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    } finally {
        release();
    }
    await navigation;
    await page.locator('.theme-toggle').click();
    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe('light');
});

test('快速输入后清空不会被旧定时器重新过滤', async ({ page }) => {
    await page.goto('/index.html');
    const count = await page.locator('.card').count();
    await page.clock.install();
    await page.clock.pauseAt(new Date());
    await page.locator('#searchInput').fill('灯塔');
    await page.locator('#clearSearchBtn').click();
    await page.clock.runFor(500);
    await expect(page.locator('#searchInput')).toHaveValue('');
    await expect(page.locator('.card:visible')).toHaveCount(count);
    await expect(page.locator('.search-highlight')).toHaveCount(0);
});

test('拼音组合输入取消旧任务，结束后才筛选和高亮', async ({ page }) => {
    await page.goto('/index.html');
    const count = await page.locator('.card').count();
    await page.clock.install();
    await page.clock.pauseAt(new Date());
    const input = page.locator('#searchInput');
    await input.fill('不存在的旧词');
    await input.dispatchEvent('compositionstart');
    await input.fill('dengta');
    await page.clock.runFor(500);
    await expect(page.locator('.card:visible')).toHaveCount(count);
    await input.fill('灯塔');
    await input.dispatchEvent('compositionend');
    await page.clock.runFor(350);
    await expect(page.locator('.card:visible')).toHaveCount(1);
    await expect(page.locator('.card:visible .search-highlight').first()).toHaveText('灯塔');
    await input.fill('绝不匹配的词语');
    await page.clock.runFor(350);
    await expect(page.locator('#noResultsMessage')).toBeVisible();
});

test('打印按旧到新排序，结束后保留搜索和高亮', async ({ page }) => {
    await page.goto('/index.html');
    await page.locator('#searchInput').fill('我');
    await expect(page.locator('.search-highlight').first()).toBeVisible();
    const before = await page.locator('.card:visible').evaluateAll(cards => cards.map(card => card.dataset.date));
    expect(before.length).toBeGreaterThan(1);
    await page.evaluate(() => dispatchEvent(new Event('beforeprint')));
    await page.emulateMedia({ media: 'print' });
    const printing = await page.locator('.card:visible').evaluateAll(cards => cards.map(card => card.dataset.date));
    expect(printing).toEqual([...before].reverse());
    await expect(page.locator('.search-container')).toBeHidden();
    await expect(page.locator('.copy-btn').first()).toBeHidden();
    await page.screenshot({ path: test.info().outputPath('print.png') });
    await page.emulateMedia({ media: 'screen' });
    await page.evaluate(() => dispatchEvent(new Event('afterprint')));
    await expect(page.locator('#searchInput')).toHaveValue('我');
    expect(await page.locator('.card:visible').evaluateAll(cards => cards.map(card => card.dataset.date))).toEqual(before);
    await expect(page.locator('.search-highlight').first()).toBeVisible();
});

test('复制不带序号，搜索重绘后仍可复制', async ({ page }) => {
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', { value: { async writeText(text) { window.copiedText = text; } } });
    });
    await page.goto('/3A.html');
    await page.locator('#searchInput').fill('我');
    const card = page.locator('.card').filter({ has: page.locator('.search-highlight') }).first();
    await expect(card).toBeVisible();
    await card.hover();
    await card.locator('.copy-btn').click();
    await expect(card.locator('.copy-btn')).toHaveClass(/copied/);
    const text = await page.evaluate(() => window.copiedText);
    // 序号只用于屏幕上定位，剪贴板从日期开始，且不能把序号与年份粘成 "162026年"
    expect(text).toMatch(/^\d{4}年\d{1,2}月\d{1,2}日/);
    expect(text).not.toContain('已复制');
});

test('字数口径：汉字逐个计，英文/数字按词计，标点与诗歌分隔符不计', async ({ page }) => {
    await page.goto('/index.html');
    const cases = [
        ['“你好。”', 2],
        ['调皮的小风/把小花朵的梦//吹开', 13],
        ['LGP 智能', 3],
        ['500 公斤', 3],
        ["Chengdu’s 大熊猫", 4],
        ['3.14 是圆周率', 5],
        ['！？……——', 0],
        ['', 0],
    ];
    const results = await page.evaluate(list => list.map(([text]) => countChars(text)), cases);
    expect(results).toEqual(cases.map(([, expected]) => expected));
});

test('卡片字数统计与正文一致，打印时隐藏', async ({ page }) => {
    await page.goto('/4B.html');
    const mismatched = await page.locator('.card').evaluateAll(cards => cards.map(card => {
        const prose = card.querySelector('.prose');
        const meta = card.querySelector('.card-meta');
        const expected = countChars(prose.textContent);
        return expected > 0 && meta && meta.textContent === `${expected} 字`
            ? null
            : { 日期: card.dataset.date, 显示: meta ? meta.textContent : '缺失', 期望: expected };
    }).filter(Boolean));
    expect(mismatched).toEqual([]);
    // 诗歌卡片里的 "/" 分隔符不算字
    const poemCount = await page.locator('.card', { hasText: '调皮的小风' }).locator('.card-meta').textContent();
    expect(poemCount).toBe('75 字');

    await page.emulateMedia({ media: 'print' });
    await expect(page.locator('.card-meta').first()).toBeHidden();
    await page.emulateMedia({ media: 'screen' });
    await expect(page.locator('.card-meta').first()).toBeVisible();
});

test('每张卡都带序号，任何宽度都不隐藏，日期行不换行', async ({ page }) => {
    await page.goto('/index.html');
    await page.waitForSelector('.card');
    const info = await page.evaluate(() => {
        const cards = [...document.querySelectorAll('.card')];
        const label = cards[0].querySelector('.date-label');
        const no = cards[0].querySelector('.date-no');
        const labelStyle = getComputedStyle(label);
        return {
            卡片数: cards.length,
            首卡序号: no.textContent,
            序号可见: getComputedStyle(no).display !== 'none',
            序号字号: parseFloat(getComputedStyle(no).fontSize),
            日期字号: parseFloat(labelStyle.fontSize),
            日期行数: Math.round(label.getBoundingClientRect().height / parseFloat(labelStyle.lineHeight)),
            有竖线: Boolean(cards[0].querySelector('.date-divider')),
            页头总篇数: document.querySelector('.entry-total') ? document.querySelector('.entry-total').textContent : null,
        };
    });
    // 最新一条的编号等于总篇数，编号随卡片数自动对齐
    expect(info.首卡序号).toBe(String(info.卡片数));
    expect(info.序号可见).toBe(true);
    // 序号是辅助信息，字号要小于日期，不能与日期抢同一个层级
    expect(info.序号字号).toBeLessThan(info.日期字号);
    expect(info.有竖线).toBe(true);
    expect(info.日期行数).toBe(1);
    // 总篇数入口已移除，规模信息只由卡片序号承担
    expect(info.页头总篇数).toBeNull();
});

test('搜索文本只含日期，不含序号', async ({ page }) => {
    await page.goto('/index.html');
    const texts = await page.locator('.card').evaluateAll(cards => cards.map(card => card.dataset.originalText));
    // 序号与年份直接相邻会被读成 "162026年"，既污染搜索也让复制的日期失效
    expect(texts.filter(text => !/^\d{4}年\d{1,2}月\d{1,2}日/.test(text))).toEqual([]);
});

test('内容工具使用本地日期，存储异常也能生成内容', async ({ page }) => {
    await page.clock.setFixedTime(new Date('2026-10-09T00:30:00+08:00'));
    await page.addInitScript(() => {
        Storage.prototype.getItem = () => { throw new Error('存储不可用'); };
    });
    await page.goto('/admin.html');
    await expect(page.locator('#dateInput')).toHaveValue('2026-10-09');
    await page.locator('#contentInput').fill('这是##重点##内容。');
    await page.getByRole('button', { name: '生成内容' }).click();
    await expect(page.locator('#previewArea')).toContainText('2026-10-09');
    await expect(page.locator('#previewArea')).toContainText("<span class='highlight-red'>重点</span>");
});

// 其余用例跑在 Asia/Shanghai（正时区），负时区下的日期偏移只能在负时区里复现。
test.describe('负时区下卡片日期不偏移', () => {
    test.use({ timezoneId: 'America/New_York' });

    test('日期标签与数据日期一致', async ({ page }) => {
        await page.goto('/index.html');
        const mismatched = await page.locator('.card').evaluateAll(cards => cards
            .map(card => {
                // 去掉屏幕序号再看日期文本，否则 "16" 会和年份粘成 "162026年"
                const label = card.querySelector('.date-label').cloneNode(true);
                label.querySelectorAll('.date-no, .date-divider').forEach(node => node.remove());
                const shown = label.textContent.trim().match(/(\d+)年(\d+)月(\d+)日/);
                const [year, month, day] = card.dataset.date.split('-').map(Number);
                return shown && Number(shown[1]) === year && Number(shown[2]) === month && Number(shown[3]) === day
                    ? null
                    : { 数据日期: card.dataset.date, 显示文本: label.textContent.trim() };
            })
            .filter(Boolean));
        expect(mismatched).toEqual([]);
    });
});

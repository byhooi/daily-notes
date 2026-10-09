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

test('复制保留列表序号，搜索重绘后仍可复制', async ({ page }) => {
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', { value: { async writeText(text) { window.copiedText = text; } } });
    });
    await page.goto('/3A.html');
    await page.locator('#searchInput').fill('每日积累');
    await expect(page.locator('.search-highlight').first()).toBeVisible();
    const card = page.locator('.card').filter({ has: page.locator('ol') }).first();
    await card.hover();
    await card.locator('.copy-btn').click();
    await expect(card.locator('.copy-btn')).toHaveClass(/copied/);
    const text = await page.evaluate(() => window.copiedText);
    expect(text).toMatch(/^每日积累/);
    expect(text).toMatch(/1\. /);
    expect(text).not.toContain('已复制');
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

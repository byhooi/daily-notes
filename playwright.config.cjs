const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: 2,
    reporter: 'list',
    use: {
        baseURL: 'http://127.0.0.1:4173',
        browserName: 'chromium',
        channel: 'chromium',
        headless: true,
        timezoneId: 'Asia/Shanghai',
        trace: 'retain-on-failure'
    },
    projects: [
        { name: '桌面', use: { viewport: { width: 1280, height: 900 } } },
        { name: '手机', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
    ],
    webServer: {
        command: 'node tests/static-server.mjs',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: false
    }
});

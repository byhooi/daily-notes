# Repository Guidelines

## 项目结构与模块组织

本仓库是原生 HTML/CSS/JavaScript 静态站点。根目录的 `index.html` 是主入口，`31.html`、`32.html`、`41.html` 是各年级独立入口，`admin.html` 是内容生成工具。核心脚本位于 `assets/common.js` 和 `assets/theme.js`，共享样式位于 `assets/common.css`。Tailwind 源文件是 `assets/tailwind.source.css`，生成文件 `assets/tailwind.min.css` 不纳入版本控制。学习数据位于 `data/31data.js`、`data/32data.js`、`data/41data.js`、`data/42data.js`。

## 构建、测试与本地开发

常用命令：

```bash
npm install
npm run build:css
npm run watch:css
python -m http.server 8000
```

`npm run build:css` 生成生产用 Tailwind CSS；`npm run watch:css` 用于开发时监听样式；本地服务器用于访问 `http://localhost:8000/index.html` 和 `admin.html`。Windows PowerShell 如遇执行策略限制，可使用 `npm.cmd run build:css`。

## 代码风格与命名约定

HTML、CSS、JavaScript 保持现有缩进和命名风格。数据文件必须写入 `window.dataXX`，例如 `window.data42 = [...]`。日期使用 `YYYY-MM-DD`。内容高亮使用 `##文本##`，由 `admin.html` 生成 `<span class='highlight-red'>文本</span>`。动态 Tailwind 类需要加入 `tailwind.config.js` 的 `safelist`，避免构建时被清除。

## 测试指南

当前没有自动化测试。提交前需手动验证：主题切换、年级导航、搜索高亮、打印排序、移动端布局、数据文件加载。修改 Tailwind 配置或 HTML 类名后，必须运行 `npm run build:css` 并检查页面样式。

## 提交与 Pull Request

提交信息遵循现有风格：新增内容使用 `add 324` 或 `feat: 添加新的每日积累数据`，修复使用 `fix` 或 `fix: 简短说明`。PR 应说明变更范围、涉及页面或数据文件、手动验证结果；涉及界面变化时附截图。

## 部署与配置

项目已从 GitHub Pages 迁移到 Cloudflare Pages，当前生产部署以 Cloudflare Pages 为准。构建命令为 `npm run build:css`，输出目录为 `/` 或 `.`，生产分支为 `main`。自定义域名在 Cloudflare Pages 的 `Custom domains` 中维护；GitHub 仓库 `Settings -> Pages` 应保持关闭。`CNAME` 仅作为旧 GitHub Pages 兼容文件保留，Cloudflare Pages 不依赖它。

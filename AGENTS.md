# Repository Guidelines

## 项目结构与模块组织

本仓库是原生 HTML/CSS/JavaScript 静态站点。根目录的 `index.html` 是主入口（五年级上），`3A.html`、`3B.html`、`4A.html`、`4B.html` 是各年级独立入口，均由 `templates/page.template.html` 经 `npm run build:pages` 生成，**不要直接编辑**；`admin.html` 是内容生成工具。核心脚本位于 `assets/common.js` 和 `assets/theme.js`，共享样式位于 `assets/common.css`。Tailwind 源文件是 `assets/tailwind.source.css`，生成文件 `assets/tailwind.min.css` 不纳入版本控制。学习数据位于 `data/3Adata.js`、`data/3Bdata.js`、`data/4Adata.js`、`data/4Bdata.js`、`data/5Adata.js`。

## 构建、测试与本地开发

常用命令：

```bash
npm install
npm run build        # = check + build:css + build:pages
npm run check        # 数据校验
npm run watch:css
python -m http.server 8000
```

`npm run check` 校验 `data/*.js`（日期格式与重复、字段、标签成对），是 `npm run build` 的第一步，失败则终止；`npm run build:css` 生成生产用 Tailwind CSS；`npm run build:pages` 从模板生成入口 HTML 并给本地资源追加 `?v=内容哈希`（生成结果需提交）；`npm run watch:css` 用于开发时监听样式；本地服务器用于访问 `http://localhost:8000/index.html` 和 `admin.html`。Windows PowerShell 如遇执行策略限制，可使用 `npm.cmd run build:css`。

## 代码风格与命名约定

HTML、CSS、JavaScript 保持现有缩进和命名风格。数据文件必须写入 `window.dataXX`，例如 `window.data4B = [...]`。日期使用 `YYYY-MM-DD`。内容高亮使用 `##文本##`，由 `admin.html` 生成 `<span class='highlight-red'>文本</span>`。动态 Tailwind 类需要加入 `tailwind.config.js` 的 `safelist`，避免构建时被清除。

## 测试指南

自动化检查只有 `npm run check`（数据校验）。新增数据后先跑它。其余需手动验证：主题切换、搜索高亮（含中文输入法打拼音过程不闪烁）、打印排序与打印后搜索状态保留、移动端布局。修改 Tailwind 配置或 HTML 类名后，必须运行 `npm run build:css` 并检查页面样式。

## 提交与 Pull Request

提交信息遵循现有风格：新增内容使用 `add 324` 或 `feat: 添加新的每日积累数据`，修复使用 `fix` 或 `fix: 简短说明`。PR 应说明变更范围、涉及页面或数据文件、手动验证结果；涉及界面变化时附截图。

## 部署与配置

项目已从 GitHub Pages 迁移到 Cloudflare Pages，当前生产部署以 Cloudflare Pages 为准，域名为 `jl.468024.xyz`。构建命令必须为 `npm run build`（生成的 HTML 会带上最新资源哈希，仅用 `build:css` 会让线上页面引用旧版本号），输出目录为 `/` 或 `.`，生产分支为 `main`。自定义域名在 Cloudflare Pages 的 `Custom domains` 中维护；GitHub 仓库 `Settings -> Pages` 应保持关闭。`CNAME` 仅作为旧 GitHub Pages 兼容文件保留，Cloudflare Pages 不依赖它。

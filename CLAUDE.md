# CLAUDE.md

本文档为 Claude Code（claude.ai/code）在本仓库中工作时提供项目约定和操作指引。

## 项目概述

"每日积累"是一个面向小学生的中文语言学习静态网站，使用原生 HTML/CSS/JavaScript + TailwindCSS 构建，托管在 Cloudflare Pages（域名：`daily.byhooi.tk`）。

## 开发命令

```bash
# 首次设置
npm install
npm run build:css

# 开发（需要两个终端）
npm run watch:css          # 终端1：Tailwind 监听模式
python -m http.server 8000 # 终端2：本地服务器（或 npx serve .）

# 生产构建
npm run build       # = build:css + build:pages
npm run build:css   # 输出 assets/tailwind.min.css（构建生成，未纳入版本控制）
npm run build:pages # 从 templates/page.template.html 生成四个入口 HTML（生成结果需提交）
```

**重要**：`index.html` / `3A.html` / `3B.html` / `4A.html` / `4B.html` 由模板生成，**不要直接编辑**。修改页面结构时编辑 `templates/page.template.html`，然后运行 `npm run build:pages` 并提交生成的 HTML。

无自动化测试，需手动验证：主题切换、搜索高亮、打印排序、移动端响应。

## 架构

### 文件职责

| 文件 | 职责 |
|------|------|
| `templates/page.template.html` | 四个入口页的唯一模板（占位符：`{{TITLE}}`、`{{DATA_FILE}}`、`{{PAGE_URL}}`） |
| `scripts/build-pages.mjs` | 从模板生成 `index.html` 及各年级页（`npm run build:pages`） |
| `index.html` | 主入口（默认五年级上，预加载 `data/5Adata.js`）——**模板生成，勿直接编辑** |
| `3A.html` / `3B.html` / `4A.html` / `4B.html` | 各年级独立入口，预加载对应数据——**模板生成，勿直接编辑** |
| `assets/theme.js` | 主题切换逻辑（toggleTheme、initTheme、updateThemeIcon） |
| `assets/common.js` | 核心逻辑：数据加载、卡片渲染、搜索、打印处理 |
| `assets/common.css` | 样式、主题变量、打印样式 |
| `admin.html` | 内容生成工具（输入数据 → 生成符合规范的代码片段） |
| `404.html` | Cloudflare Pages 自动使用的 404 页面（无 JS，静态，保留各年级入口链接） |
| `sitemap.xml` / `robots.txt` | SEO：站点地图及爬虫规则（`admin.html` 已 Disallow） |
| `de_di_de_learning.html` | 独立的"的地得"用法学习页，自包含样式，未链接到主导航 |

### 数据流

1. 数据文件（`data/3Adata.js` 等）将数组赋值给 `window.dataXX`（**必须**用 `window` 全局变量）
2. 入口 HTML 同步预加载对应年级数据；`common.js` 在 `initPage()` 中遍历 `gradeConfig` 自动识别已预加载的年级作为 `currentGrade`
3. `gradeConfig` 映射年级代码（3A/3B/4A/4B/5A）到数据文件和变量名
4. `loadGradeData()` 三级查找：`loadedData` 缓存 → `loadingPromises`（防重复并发请求）→ `window` 全局变量 → 动态创建 `<script>` 标签加载，10s 超时（超时/失败会清理定时器并移除 script 标签）
5. 数据在加载入缓存时用 `sortEntriesByDateDesc()` 按日期降序排好一次，渲染时不再排序；打印视图直接反转副本（最旧优先）
6. `createCards()` 用 `DocumentFragment` 批量渲染；渲染结果写入 `renderedGradeCache`，打印/屏幕视图切换时直接复用 DOM 字符串

**注意**：页面无年级导航栏，各年级页是互不相通的独立入口（仅 `404.html` 保留年级链接）。

### 关键状态变量

- `currentGrade` - 当前年级（默认 `'5A'`，`initPage()` 会按 `gradeConfig` 顺序自动识别已预加载的年级覆盖此默认值）
- `currentEntries` - 当前显示的数据数组
- `currentSearch` - 搜索查询（小写）
- `loadedData` - Map 缓存已加载的数据数组
- `loadingPromises` - Map 进行中的加载请求，防并发重复
- `renderedGradeCache` - Map 已渲染的 DOM 字符串（key 为 `${grade}:screen|print`）
- `printEventListenersAdded` - 防止重复注册 `beforeprint`/`afterprint` 监听器

### 核心函数

| 函数 | 作用 |
|------|------|
| `loadGradeData(grade)` | 智能数据加载，三级查找 + 并发去重 + 10s 超时保护（超时/失败清理 script 标签） |
| `sortEntriesByDateDesc(data)` | 数据加载时按日期降序排一次，渲染时直接复用 |
| `createCards(withAnimation)` | 统一卡片渲染，命中 `renderedGradeCache` 时直接还原 DOM |
| `restoreRenderedGradeCache(grade, isPrinting, withAnimation)` | 从缓存恢复已渲染的卡片 HTML |
| `applyCardDisplayState(cardView, withAnimation)` | 用 `requestAnimationFrame` 应用淡入或直接显示 |
| `highlightCardContent()` | TreeWalker API 实现文本高亮 |
| `updateCardVisibility()` | 搜索过滤和卡片显隐控制 |
| `updateNoResultsMessage(hasVisibleCards)` | 搜索无匹配时在 `#cardView` 内显示提示 |
| `escapeHtml(text)` | HTML 转义，防止 XSS（位于 `admin.html`） |

### 主题系统

通过 `data-theme` 属性 + CSS 自定义属性（`common.css` 中 `:root` 和 `[data-theme="dark"]`）实现。同时同步 Tailwind 的 `dark` 类。偏好存储在 `localStorage`，回退到系统偏好。

- `toggleTheme()` - 切换深色/浅色模式
- `initTheme()` - 初始化主题（检测 localStorage 和系统偏好）
- `updateThemeIcon()` - 更新主题图标（太阳/月亮）

### 搜索高亮

使用 `TreeWalker` API 遍历文本节点实现精确高亮，避免字符串替换破坏已有 HTML 标签（如 `highlight-red`）。卡片创建时缓存 `dataset.originalHtml` 和 `dataset.originalText`，搜索时从缓存恢复再高亮。300ms 防抖。输入框带 `#clearSearchBtn` 一键清除按钮，输入非空时显示。

## 数据格式

```javascript
window.data4B = [
  {
    date: "2025-09-01",       // YYYY-MM-DD，必填
    title: "可选标题",         // 可选
    content: "HTML 内容"      // 支持 <ol>/<li>、<span class='highlight-red'>
  }
];
```

### 生成格式规范（admin.html 输出）

```javascript
{
    date: "YYYY-MM-DD",
    title: "标题",
    content: "内容"
  }
```

`{` 无缩进，字段 4 空格缩进，`}` 2 空格缩进。

### 文本高亮标记

在 `admin.html` 中用 `##文本##` 标记，生成时转换为 `<span class='highlight-red'>文本</span>`。admin 工具同时自动将半角标点转全角（保留数字和字母半角）。

## Git 工作流

```bash
git add data/4Bdata.js
git commit -m "add 324"  # 提交格式：add + 日期简写（如324=3月24日）
git push origin main     # 自动触发 Cloudflare Pages 构建和部署
```

提交信息模式：`add [日期简写]`（添加内容）、`fix`（修复）。

## Cloudflare Pages 部署

项目已从 GitHub Pages 迁移到 Cloudflare Pages，当前生产环境以 Cloudflare Pages 为准。Cloudflare Pages 连接 GitHub 仓库后使用以下构建设置：

| 配置项 | 值 |
|------|------|
| Framework preset | `None` |
| Build command | `npm run build`（含页面生成；若仍为 `npm run build:css` 也可用，因生成的 HTML 已提交仓库） |
| Build output directory | `/` 或 `.` |
| Root directory | 留空 |
| Production branch | `main` |

自定义域名在 Cloudflare Pages 的 `Custom domains` 中绑定 `daily.byhooi.tk`。GitHub Pages 不再作为生产部署入口，GitHub 仓库 `Settings -> Pages` 应保持关闭，避免同一域名由两个平台同时维护。

根目录 `CNAME` 是迁移前 GitHub Pages 使用的遗留兼容文件，Cloudflare Pages 不依赖它；实际域名解析、证书和生产状态以 Cloudflare Pages 的自定义域名配置为准。

部署后检查：Cloudflare Pages 最近一次构建成功，预览地址可访问，自定义域名 `https://daily.byhooi.tk` 可访问，页面资源无 404 或 CSP 报错。

## Tailwind CSS 配置要点

- 源文件：`assets/tailwind.source.css`，输出：`assets/tailwind.min.css`（构建生成，未纳入版本控制）
- `tailwind.config.js` 中 `safelist` 包含动态类名（`highlight-red`、`search-highlight`、`fade-in`、`show` 等），这些类在 JS 中动态使用，PurgeCSS 无法静态检测
- `darkMode: 'class'` 模式

## 安全措施

- CSP 通过 `<meta>` 标签配置（入口页 `script-src 'self'`，不允许内联脚本；`admin.html` 有独立策略）
- 入口页无内联事件处理器：主题切换、返回顶部等事件统一在 `common.js` 的 `DOMContentLoaded` 中绑定；字体样式表由 `common.js` 末尾把 `preload` 切换为 `stylesheet`（替代内联 `onload`）
- 用户可见内容用 `textContent`，仅可信数据源的 HTML 内容用 `innerHTML`
- `admin.html` 中 `escapeHtml()` 转义生成内容
- 访问统计使用 Cloudflare Pages 指标，不加载第三方分析脚本

## 性能优化要点

- `DocumentFragment` 批量插入 DOM，减少重排
- `requestAnimationFrame()` 实现平滑动画
- 三层缓存：`loadedData`（数据数组）+ `loadingPromises`（并发去重）+ `renderedGradeCache`（DOM 字符串）
- TreeWalker API 高亮搜索结果，不破坏现有标签
- 打印时使用 `beforeprint`/`afterprint` 事件自动调整排序

## 移动端特性

- 返回顶部按钮在 ≤1024px 时隐藏（移动端原生支持双击状态栏返回顶部）
- 字体：霞鹜文楷（LXGW WenKai），通过 CDN 非阻塞加载

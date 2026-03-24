# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

"每日积累"是一个面向小学3-4年级学生的中文语言学习静态网站，使用原生 HTML/CSS/JavaScript + TailwindCSS 构建，托管在 GitHub Pages（域名：`daily.byhooi.tk`）。

## 开发命令

```bash
# 首次设置
npm install
npm run build:css

# 开发（需要两个终端）
npm run watch:css          # 终端1：Tailwind 监听模式
python -m http.server 8000 # 终端2：本地服务器（或 npx serve .）

# 生产构建
npm run build:css  # 输出 assets/tailwind.min.css（~240KB）
```

无自动化测试，需手动验证：主题切换、年级导航、搜索高亮、打印排序、移动端响应。

## 架构

### 数据流

1. 数据文件（`data/31data.js` 等）将数组赋值给 `window.dataXX`（**必须**用 `window` 全局变量）
2. `index.html` 同步预加载 `data/42data.js`（默认年级），其他年级按需异步加载
3. `common.js` 中 `gradeConfig` 映射年级代码（31/32/41/42）到数据文件和变量名
4. `loadGradeData()` 检查缓存（Map）→ 检查 `window` 全局变量 → 动态创建 `<script>` 标签加载
5. `createCards()` 用 `DocumentFragment` 批量渲染，打印时自动反转排序（最旧优先）

### 关键状态变量

- `currentGrade` - 当前年级（默认 `'42'`）
- `currentEntries` - 当前显示的数据数组
- `currentSearch` - 搜索查询（小写）
- `loadedData` - Map 缓存，避免重复加载
- `isPrintingState` - 打印状态锁，防止打印时切换年级

### 主题系统

通过 `data-theme` 属性 + CSS 自定义属性（`common.css` 中 `:root` 和 `[data-theme="dark"]`）实现。同时同步 Tailwind 的 `dark` 类。偏好存储在 `localStorage`，回退到系统偏好。

### 搜索高亮

使用 `TreeWalker` API 遍历文本节点实现精确高亮，避免字符串替换破坏已有 HTML 标签（如 `highlight-red`）。卡片创建时缓存 `dataset.originalHtml` 和 `dataset.originalText`，搜索时从缓存恢复再高亮。300ms 防抖。

## 数据格式

```javascript
window.data42 = [
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
git add data/42data.js
git commit -m "add 324"  # 提交格式：add + 日期简写（如324=3月24日）
git push origin main     # 自动触发 GitHub Pages 部署
```

提交信息模式：`add [日期简写]`（添加内容）、`fix`（修复）。

## Tailwind CSS 配置要点

- 源文件：`assets/tailwind.source.css`，输出：`assets/tailwind.min.css`
- `tailwind.config.js` 中 `safelist` 包含动态类名（`highlight-red`、`search-highlight`、`fade-in`、`show` 等），这些类在 JS 中动态使用，PurgeCSS 无法静态检测
- `darkMode: 'class'` 模式

## 安全措施

- CSP 通过 `<meta>` 标签配置（`index.html` 和 `admin.html` 各有不同策略）
- 用户可见内容用 `textContent`，仅可信数据源的 HTML 内容用 `innerHTML`
- `admin.html` 中 `escapeHtml()` 转义生成内容
- Google Analytics ID：`G-34CHGZKTMN`（`common.js` 顶部）

## 移动端特性

- 返回顶部按钮在 ≤1024px 时隐藏（移动端原生支持双击状态栏返回顶部）
- 字体：霞鹭文楷（LXGW WenKai），通过 CDN 非阻塞加载

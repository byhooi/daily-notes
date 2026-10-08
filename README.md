# 每日积累

![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Deploy-222222?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

一个面向小学生的中文语言学习网站，提供每日语言学习内容展示。

🔗 **在线访问**: [daily.yangbing.eu.org](https://daily.yangbing.eu.org)

## 项目简介

这是一个轻量级的静态教育网站,使用原生 HTML、CSS、JavaScript 构建,专注于为小学生提供每日中文学习材料,包括文学摘录、写作示例和语言练习。

### 主要特性

- 📚 **多年级支持** - 覆盖三年级至五年级各学期，每个年级提供独立入口页面
- 🔍 **实时搜索** - 带内容高亮的快速搜索功能，输入框配一键清除按钮
- 🌓 **主题切换** - 深色/浅色模式自动保存
- 📱 **响应式设计** - 完美适配各种设备屏幕
- 🖨️ **打印优化** - 专门优化的打印布局
- ⚡ **智能加载** - 入口页同步预加载本年级数据，立即渲染
- ✨ **文本高亮** - 支持重点内容标记
- 🔗 **社交分享优化** - 完整的 Open Graph 和 Twitter Card 元数据配置

## 技术架构

### 技术栈

| 分类 | 技术 | 说明 |
|------|------|------|
| 结构 | HTML5 | 语义化标签，SEO 优化 |
| 样式 | Tailwind CSS 3.4 | 实用优先的 CSS 框架 |
| 交互 | 原生 JavaScript | ES6+，无框架依赖 |
| 字体 | LXGW WenKai (霞鹜文楷) | 非阻塞异步加载 |
| 部署 | GitHub Pages | 自定义域名 daily.yangbing.eu.org |

### 开发环境要求

- **Node.js**: ≥18.0（用于 TailwindCSS 构建）
- **npm**: ≥9.0（包管理器）
- **浏览器**: 支持 ES6、CSS Grid、CSS 自定义属性

### TailwindCSS 构建

```bash
# 初次设置
npm install
npm run build

# 开发模式（监听文件变化，需两个终端）
npm run watch:css          # 终端1：Tailwind 监听模式
python -m http.server 8000 # 终端2：本地服务器（或 npx serve .）

# 生产构建（优化压缩）
npm run build       # = check + build:css + build:pages
npm run check       # 校验 data/*.js
npm run build:pages # 从模板重新生成五个入口 HTML（修改页面结构后运行并提交）
```

> ⚠️ **修改内容或样式后，先运行 `npm install`（首次开发时）和 `npm run build`，再提交源文件、生成的 CSS 与入口 HTML。**
>
> ⚠️ **入口页由模板生成**：`index.html` / `3A.html` / `3B.html` / `4A.html` / `4B.html` 不要直接编辑，修改 `templates/page.template.html` 后运行 `npm run build:pages`。

### 项目结构

```
daily-notes/
├── templates/
│   └── page.template.html # 四个入口页的唯一模板
├── scripts/
│   └── build-pages.mjs    # 入口页生成脚本（npm run build:pages）
├── index.html              # 主入口（默认五年级上）——模板生成，勿直接编辑
├── 3A.html / 3B.html / 4A.html / 4B.html # 各年级独立入口——模板生成，勿直接编辑
├── admin.html             # 内容管理工具
├── 404.html               # GitHub Pages 自定义 404 页面
├── sitemap.xml / robots.txt # SEO 站点地图与爬虫规则
├── assets/
│   ├── common.js          # 核心 JavaScript
│   ├── common.css         # 样式和主题定义
│   ├── tailwind.source.css # TailwindCSS 源文件
│   ├── tailwind.min.css   # TailwindCSS 构建生成文件（纳入版本控制，构建后需提交）
│   ├── theme.js           # 主题切换逻辑
│   └── logo/              # 网站图标
├── data/
│   ├── 3Adata.js          # 三年级上学期数据
│   ├── 3Bdata.js          # 三年级下学期数据
│   ├── 4Adata.js          # 四年级上学期数据
│   ├── 4Bdata.js          # 四年级下学期数据
│   └── 5Adata.js          # 五年级上学期数据
├── CNAME                  # GitHub Pages 自定义域名：daily.yangbing.eu.org
└── README.md              # 项目说明文档
```

### 核心架构

**加载策略**
```
入口加载   → 同步预加载本页年级数据 → 立即渲染
打印视图   → beforeprint/afterprint 切换排序并保留当前搜索过滤与高亮
```

**性能优化**
- CSS 动画完成卡片交错入场，尊重 prefers-reduced-motion
- CSS 自定义属性实现高效主题切换
- TreeWalker API 实现精确文本高亮
- DocumentFragment 优化 DOM 操作
- 搜索防抖：300ms 延迟，中文输入法打拼音期间不触发
- 静态资源 URL 带内容哈希，部署后不会被旧缓存挡住

## 快速开始

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/byhooi/daily-notes.git
cd daily-notes

# 2. 安装依赖
npm install

# 3. 构建（数据校验 + Tailwind CSS + 入口页）
npm run build

# 4. 启动开发服务器
python -m http.server 8000
# 或
npx serve .
```

访问地址：
- 主页面: http://localhost:8000/index.html
- 管理工具: http://localhost:8000/admin.html

### 添加新内容

1. **打开管理工具** - 访问 `admin.html`
2. **填写内容**
   - 选择日期（YYYY-MM-DD 格式）
   - 输入标题（可选）
   - 输入内容（每行一项）
   - 使用 `##文本##` 标记需要高亮的内容
3. **生成代码** - 点击"生成内容"按钮
4. **复制并添加** - 将生成的代码添加到对应的数据文件
5. **构建并提交更新**
   ```bash
   npm run build
   git add data/4Adata.js assets/tailwind.min.css index.html 3A.html 3B.html 4A.html 4B.html
   git commit -m "add 1015"
   git push origin main
   ```

### 数据格式

```javascript
window.data4A = [
  {
    date: "2025-10-15",
    title: "诗词鉴赏",  // 可选字段
    content: "<ol class='list-decimal list-inside space-y-2'>" +
      "<li>春眠不觉晓，处处闻啼鸟。</li>" +
      "<li>夜来风雨声，花落知多少。</li>" +
    "</ol>"
  }
];
```

> ⚠️ 必须使用 `window.dataXX` 格式确保全局可访问性

## 功能说明

### 搜索功能
- **实时搜索**：即时搜索所有内容
- **智能高亮**：自动高亮匹配文本
- **一键清除**：输入框右侧清除按钮，输入非空时显示
- **防抖优化**：300ms 延迟减少 CPU 占用
- **精确匹配**：使用 TreeWalker API 不破坏 HTML 结构

### 主题切换
- **双主题支持**：浅色/深色模式
- **持久化存储**：自动保存到 localStorage
- **系统偏好**：自动检测跟随系统主题

### 打印优化
- **智能排序**：打印时日期按最旧优先
- **优化布局**：移除交互元素，优化排版
- **预览支持**：支持浏览器打印预览

### 年级入口

各年级页面为互不相通的独立入口（无站内导航，`404.html` 保留各年级链接）：

| 代码 | 年级 | 入口页面 |
|------|------|----------|
| 3A | 三年级上 | `3A.html` |
| 3B | 三年级下 | `3B.html` |
| 4A | 四年级上 | `4A.html` |
| 4B | 四年级下 | `4B.html` |
| 5A | 五年级上 | `index.html`（默认） |

## 部署说明

项目现已改回 **GitHub Pages** 部署，站点域名为 **`daily.yangbing.eu.org`**，不再维护 Cloudflare Pages 和双域名部署约定。

发布前必须运行 `npm run build`，完成数据校验、Tailwind CSS 构建和入口页生成，确保 HTML 引用最新资源哈希；仅执行 `build:css` 不足以完成发布构建。`assets/tailwind.min.css` 纳入版本控制，必须与生成的入口 HTML 一起提交并推送，供 GitHub Pages 直接从分支发布；不要重新加入 `.gitignore`。

当前仓库没有部署工作流，实际发布来源以 GitHub 仓库 `Settings -> Pages` 的配置为准，不要假定 `git push origin main` 会自动执行 npm 构建。

自定义域名在 `Settings -> Pages` 中设置为 `daily.yangbing.eu.org`。根目录 `CNAME` 保持该域名；分支发布时应将它放在发布来源根目录，自定义 GitHub Actions 工作流发布时 GitHub 不使用此文件，域名以仓库设置为准。参见 [GitHub 自定义域名文档](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)。

页面规范链接（canonical）、分享元数据和站点地图统一使用 `daily.yangbing.eu.org`。`_redirects` 是旧 Cloudflare Pages 的年级路径跳转记录，不应作为 GitHub Pages 的有效重定向配置，不能据此认为旧路径仍会自动跳转。

部署后检查：

- GitHub Pages 最近一次部署成功
- `https://daily.yangbing.eu.org` 可正常访问，HTTPS 证书有效
- 各年级入口及 `assets/tailwind.min.css` 均可正常加载
- 浏览器访问页面资源时无 404 或 CSP 报错

访问：[daily.yangbing.eu.org](https://daily.yangbing.eu.org)

## 安全措施

### 内容安全策略 (CSP)
```
# 入口页（index.html / 3A.html / 3B.html / 4A.html / 4B.html）
script-src:  'self'（无内联脚本，事件统一在 JS 中绑定）
style-src:   'self' 'unsafe-inline' cdn.jsdelivr.net
font-src:    'self' cdn.jsdelivr.net
img-src:     'self' data: https:
```

### XSS 防护
- 用户可见内容使用 `textContent`
- `admin.html` 中 `escapeHtml()` 转义生成内容
- 只有可信数据源的 HTML 使用 `innerHTML`

## 测试检查清单

### 基础功能测试
- [ ] 主题切换：浅色/深色模式切换，状态持久化
- [ ] 年级入口：各年级页面（3A/3B/4A/4B/5A）直接访问加载正常
- [ ] 搜索功能：实时搜索和内容高亮工作正常
- [ ] 打印优化：打印预览日期排序正确
- [ ] 响应式设计：移动端布局正常

### 高级功能测试
- [ ] 数据缓存：重复渲染（如打印前后）避免重复加载
- [ ] 错误处理：网络错误显示友好提示
- [ ] 文本高亮：`##文本##` 正确转换为红色
- [ ] HTML 渲染：有序列表渲染正确

### 用户体验测试
- [ ] 加载状态：年级切换时显示加载提示
- [ ] 平滑动画：卡片显示动画流畅
- [ ] 键盘导航：支持 Tab 和回车键
- [ ] 无障碍访问：ARIA 标签正确

## 浏览器支持

| 浏览器 | 最低版本 | 状态 |
|--------|----------|------|
| Chrome/Edge | 90+ | ✅ 完整支持 |
| Firefox | 88+ | ✅ 完整支持 |
| Safari | 14+ | ✅ 完整支持 |
| 移动端 | iOS/Android | ✅ 完整支持 |
| IE 11 | - | ❌ 不支持 |

## 未来改进方向

- [ ] 升级 Tailwind CSS v4（基于 Rust 的 JIT，产物更小）
- [ ] 拆分 common.js 为模块化结构
- [ ] 考虑 TypeScript 迁移
- [ ] 集成 E2E 测试（Playwright）

## 许可证

[MIT License](LICENSE)

## 贡献

欢迎提交 Issue 和 Pull Request！

---

**Made with ❤️ for young Chinese language learners**

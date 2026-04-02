# 每日积累

![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square)
![GitHub Pages](https://img.shields.io/badge/GitHub_Pages-Deploy-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

一个面向小学生（3-4年级）的中文语言学习网站，提供每日语言学习内容展示。

🔗 **在线访问**: [daily.byhooi.tk](https://daily.byhooi.tk)

## 项目简介

这是一个轻量级的静态教育网站,使用原生 HTML、CSS、JavaScript 构建,专注于为小学生提供每日中文学习材料,包括文学摘录、写作示例和语言练习。

### 主要特性

- 📚 **多年级支持** - 覆盖三年级上下学期和四年级上下学期
- 🔍 **实时搜索** - 带内容高亮的快速搜索功能
- 🌓 **主题切换** - 深色/浅色模式自动保存
- 📱 **响应式设计** - 完美适配各种设备屏幕
- 🖨️ **打印优化** - 专门优化的打印布局
- ⚡ **智能加载** - 混合预加载和按需加载策略
- ✨ **文本高亮** - 支持重点内容标记
- 🔗 **社交分享优化** - 完整的 Open Graph 和 Twitter Card 元数据配置
- 📊 **访问统计** - 集成 Google Analytics 追踪

## 技术架构

### 技术栈

| 分类 | 技术 | 说明 |
|------|------|------|
| 结构 | HTML5 | 语义化标签，SEO 优化 |
| 样式 | Tailwind CSS 3.4 | 实用优先的 CSS 框架 |
| 交互 | 原生 JavaScript | ES6+，无框架依赖 |
| 字体 | LXGW WenKai (霞鹜文楷) | 非阻塞异步加载 |
| 分析 | Google Analytics | 访问追踪 |
| 部署 | GitHub Pages | 自定义域名 daily.byhooi.tk |

### 开发环境要求

- **Node.js**: ≥18.0（用于 TailwindCSS 构建）
- **npm**: ≥9.0（包管理器）
- **浏览器**: 支持 ES6、CSS Grid、CSS 自定义属性

### TailwindCSS 构建

```bash
# 初次设置
npm install
npm run build:css

# 开发模式（监听文件变化，需两个终端）
npm run watch:css          # 终端1：Tailwind 监听模式
python -m http.server 8000 # 终端2：本地服务器（或 npx serve .）

# 生产构建（优化压缩）
npm run build:css
```

> ⚠️ **首次克隆项目后，必须先运行 `npm install` 和 `npm run build:css`**

### 项目结构

```
daily-notes/
├── index.html              # 主界面
├── admin.html             # 内容管理工具
├── assets/
│   ├── common.js          # 核心 JavaScript（~500行）
│   ├── common.css         # 样式和主题定义
│   ├── tailwind.source.css # TailwindCSS 源文件
│   ├── tailwind.min.css   # TailwindCSS 编译产物
│   ├── theme.js           # 主题切换逻辑
│   └── logo/              # 网站图标
├── data/
│   ├── 31data.js          # 三年级上学期数据
│   ├── 32data.js          # 三年级下学期数据
│   ├── 41data.js          # 四年级上学期数据
│   └── 42data.js          # 四年级下学期数据
├── CNAME                  # 自定义域名配置
└── README.md              # 项目说明文档
```

### 核心架构

**混合加载策略**
```
页面加载 → 预加载42数据 → 立即显示
    ↓
切换年级 → 检查缓存 → 动态加载 → 更新界面
    ↓
后续切换 → 直接从缓存读取 → 快速响应
```

**性能优化**
- `requestAnimationFrame()` 实现平滑动画
- CSS 自定义属性实现高效主题切换
- TreeWalker API 实现精确文本高亮
- DocumentFragment 优化 DOM 操作
- 搜索防抖：300ms 延迟
- 数据缓存：Map 类型，避免重复请求
- 加载超时：10 秒保护机制

## 快速开始

### 本地开发

```bash
# 1. 克隆项目
git clone https://github.com/byhooi/daily-notes.git
cd daily-notes

# 2. 安装依赖
npm install

# 3. 构建 Tailwind CSS
npm run build:css

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
5. **提交更新**
   ```bash
   git add data/41data.js
   git commit -m "add 1015"
   git push origin main
   ```

### 数据格式

```javascript
window.data41 = [
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

### 年级导航
| 代码 | 年级 | 加载方式 |
|------|------|----------|
| 31 | 三年级上 | 异步加载 |
| 32 | 三年级下 | 异步加载 |
| 41 | 四年级上 | 异步加载 |
| 42 | 四年级下 | 预加载（首屏） |

## 部署说明

项目通过 GitHub Pages 自动部署：

```bash
git push origin main
# 自动触发 GitHub Pages 部署
```

访问：https://daily.byhooi.tk

## 安全措施

### 内容安全策略 (CSP)
```
# index.html
script-src:  'self' 'unsafe-inline' googletagmanager.com google-analytics.com
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
- [ ] 年级导航：31、32、41、42 年级数据加载正常
- [ ] 搜索功能：实时搜索和内容高亮工作正常
- [ ] 打印优化：打印预览日期排序正确
- [ ] 响应式设计：移动端布局正常

### 高级功能测试
- [ ] 数据缓存：切换年级避免重复加载
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

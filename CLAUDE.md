# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码仓库中工作时提供指导。

## 项目概述

这是一个名为"每日积累"的中文教育网站，为小学生展示每日中文语言学习内容。它是一个带有 JavaScript 交互功能的静态 HTML 网站，专为3-4年级学生设计。

## 架构

### 核心结构
- **前端**：原生 HTML、CSS、JavaScript 配合 TailwindCSS
- **数据存储**：包含内容数组的 JavaScript 文件（`data/31data.js`、`data/32data.js`、`data/41data.js`）
- **静态资源**：CSS、字体、标志在 `assets/` 目录中
- **部署**：托管在 GitHub Pages 的静态网站（域名：`daily.yangbing.eu.org`）

### 核心架构模式

**数据流程：**
1. 年级数据文件（`data/31data.js` 等）将数据直接赋值给 `window` 对象
2. `common.js` 中的 `gradeConfig` 对象将年级映射到其数据文件和变量名
3. `loadGradeData()` 实现智能数据加载：优先使用已存在数据，按需动态加载
4. `switchGrade()` 异步加载数据并更新 UI 状态，带完整错误处理
5. `createCards()` 渲染带有响应式动画和打印优化的内容

**状态管理：**
- `currentGrade`：当前活跃的年级选择（31、32、41）
- `currentEntries`：当前显示的数据数组
- `currentSearch`：当前活跃的搜索查询字符串
- `loadedData`：Map 类型的数据缓存，避免重复加载
- 主题偏好：存储在 localStorage 中，带有系统偏好回退

**打印优化：**
- 日期排序在打印布局时自动反转（最旧优先）
- 特殊的打印类和媒体查询优化布局
- 通过 `window.matchMedia('print')` 和 body 类检测打印状态

**性能优化：**
- **混合加载策略**：41年级预加载确保首屏体验，31/32年级按需加载
- **智能缓存机制**：使用 Map 缓存已加载数据，避免重复请求
- **异步加载优化**：Promise 处理动态脚本加载，带完整错误处理
- `requestAnimationFrame()`：带受控延迟的平滑卡片动画
- CSS 自定义属性：高效的主题切换，无需样式重计算

### 主要文件
- `index.html`：带有年级导航、搜索和卡片显示的主查看界面
- `admin.html`：用于创建新每日条目的内容生成工具
- `assets/common.js`：核心 JavaScript 功能，包括：
  - 智能数据加载（`loadGradeData()`）- 支持预加载检测和按需加载
  - 年级切换（`switchGrade()`）- 异步处理，完整错误处理
  - 主题管理（深色/浅色模式）
  - 带文本高亮的搜索功能
  - 统一卡片创建（`createCards()`）- 支持动画控制
  - 打印优化（日期排序变化）
  - 数据缓存管理（Map 类型缓存）
- `assets/common.css`：带有主题 CSS 自定义属性的样式

### 数据结构
每个数据文件将数据直接赋值给 window 对象：
```javascript
// 数据文件格式（如 data/41data.js）
window.data41 = [
  {
    date: "YYYY-MM-DD",
    title: "可选标题", // 只有部分条目有此字段
    content: "HTML 内容" // 可以是纯文本或带列表的 HTML
  }
  // ...更多条目
];
```

**重要**：使用 `window.dataXX` 而不是 `const dataXX`，确保数据在全局范围内可访问。

### 特殊功能
- **智能数据加载**：混合预加载和按需加载策略，优化性能和用户体验
- **数据缓存机制**：自动缓存已加载数据，避免重复网络请求
- **文本高亮**：内容支持 `##文本##` 标记进行红色高亮
- **年级导航**：支持三个年级（31、32、41）的动态切换，带加载状态
- **响应式设计**：使用 TailwindCSS 类的移动端优先设计
- **打印优化**：打印时日期排序反转（最旧优先 vs 最新优先）
- **搜索**：带内容高亮的实时搜索
- **主题切换**：带 localStorage 持久化的深色/浅色模式
- **错误处理**：完整的加载失败处理和用户反馈机制

## 开发工作流程

### 添加新内容
使用 `admin.html` 生成格式正确的条目：
1. 选择日期并可选添加标题
2. 输入内容（每行一项）
3. 使用 `##文本##` 标记进行红色高亮
4. 生成并复制格式化的 JavaScript 对象
5. 手动添加到 `data/` 目录中的适当数据文件

**重要**：添加新数据时，确保数组格式正确，并且文件以 `window.dataXX = [...]` 的形式声明变量。

### 内容指导原则
- 内容为中文小学语言学习材料
- 条目包括文学摘录、写作示例和语言练习
- admin 工具中自动转换全角标点符号
- HTML 内容支持多项条目的有序列表

### 文件组织
```
├── index.html           # 主界面
├── admin.html          # 内容生成工具
├── assets/
│   ├── common.js       # 主要 JavaScript 逻辑
│   ├── common.css      # 样式和主题
│   ├── tailwind.min.css # TailwindCSS 框架
│   └── logo/          # 网站图标和应用图标
├── data/
│   ├── 31data.js      # 三年级上学期数据
│   ├── 32data.js      # 三年级下学期数据
│   └── 41data.js      # 四年级上学期数据
└── CNAME              # GitHub Pages 自定义域名
```

## 架构特点（2024年重构后）

### 混合加载策略
- **预加载**：41年级数据在 `index.html` 中同步加载，确保首屏立即可用
- **按需加载**：31/32年级数据在用户切换时异步加载，减少初始包大小
- **智能缓存**：使用 Map 缓存已加载数据，避免重复请求

### 数据流架构
```
页面加载 → 预加载41数据 → 初始化检测 → 立即显示内容
    ↓
用户切换年级 → 检查缓存 → 动态加载（如需要）→ 更新界面
    ↓
后续切换 → 直接从缓存读取 → 快速响应
```

### 错误处理机制
- **加载状态**：显示"正在加载..."反馈
- **错误恢复**：加载失败时保持当前状态
- **用户友好**：具体错误信息和重试建议

## 关键函数和 API

### JavaScript 核心函数
- `loadGradeData(grade)`：智能数据加载，支持缓存检测和异步加载
- `switchGrade(grade)`：异步年级切换，完整错误处理和状态管理
- `createCards(withAnimation)`：统一卡片渲染，支持动画控制
- `toggleTheme()`：在浅色/深色主题间切换
- `updateCardVisibility()`：处理搜索过滤和高亮
- `highlightCardContent(card, searchTerm)`：使用 DOM TreeWalker 实现精确的文本节点高亮，避免破坏现有 HTML 结构
- `scrollToTop()`：平滑滚动到页面顶部

**搜索高亮实现细节**：
- 使用 `TreeWalker` API 遍历文本节点，只处理纯文本内容
- 避免字符串替换方式，防止破坏已有的 HTML 标签（如 `<span class="highlight-red">`）
- 使用 `DocumentFragment` 重建内容，确保 DOM 操作的原子性
- 缓存原始 HTML（`dataset.originalHtml`）和小写文本（`dataset.originalText`）以提升性能

### CSS 自定义属性
在 `:root` 和 `[data-theme="dark"]` 选择器中定义的主题颜色：
- `--background-color`、`--text-color`：主要颜色
- `--card-background`、`--border-color`：卡片样式
- `--accent-color`：交互元素（绿色主题）

## 开发命令

### Tailwind CSS 构建（必需）

**初次设置**：
```bash
# 安装依赖
npm install

# 构建优化的 CSS（从 2.9MB 减少到 ~240KB）
npm run build:css
```

**开发工作流**：
```bash
# 1. 启动 Tailwind 监听模式（自动重新构建）
npm run watch:css

# 2. 启动本地开发服务器
python -m http.server 8000
# 或使用 VS Code 的 Live Server 扩展
# 或使用 Node.js serve: npx serve .

# 3. 访问
# 主页面: http://localhost:8000/index.html
# 管理工具: http://localhost:8000/admin.html
```

**生产部署前**：
```bash
# 构建优化的 CSS
npm run build:css

# 验证构建结果
ls -lh assets/tailwind.min.css  # 应该显示约 240KB
```

### Git 工作流程
```bash
# 添加内容的标准工作流程
git add data/41data.js  # 添加特定数据文件
git commit -m "add [日期] content"  # 遵循提交信息模式
git push origin main    # 触发自动部署
```

### 部署
- **生产环境**：通过 GitHub Pages 自动部署到 `daily.yangbing.eu.org`
- **触发条件**：推送到 `main` 分支
- **配置**：通过 CNAME 文件设置自定义域名
- **构建要求**：部署前需运行 `npm run build:css` 优化 Tailwind CSS

### 测试
**手动测试检查清单：**
- 主题切换（浅色/深色模式持久化）
- 年级导航（31、32、41）正确数据加载
- 搜索功能和内容高亮
- 打印预览日期排序（最旧优先 vs 最新优先）
- 不同屏幕尺寸的移动端响应性
- HTML 列表和文本高亮的内容渲染

## 内容管理说明

### 数据格式标准
- **日期**：YYYY-MM-DD 格式用于正确排序（如 "2025-09-01"）
- **内容**：支持 HTML 包括有序列表（`<ol>`、`<li>`）
- **文本高亮**：在 admin.html 中使用 `##文本##` 标记（转换为红色高亮）
- **标题**：可选字段，仅在内容有特定主题时包含
- **语言**：所有内容均为中文，适合小学生（3-4年级）

### 管理工具工作流程（`admin.html`）
1. **日期选择**：使用日期选择器或手动输入
2. **内容输入**：在文本区域中每行一项
3. **标记**：应用 `##文本##` 进行红色文本高亮
4. **生成**：点击"生成内容"创建格式正确的对象
5. **集成**：复制生成的代码并手动添加到适当的数据文件
6. **全角标点符号**：管理工具自动转换

**生成格式规范**：
```javascript
{
    date: "YYYY-MM-DD",
    title: "标题",
    content: "内容"
  }
```
- `{` 无缩进
- 内部字段（date、title、content）使用 4 个空格缩进
- `}` 使用 2 个空格缩进

### 提交信息模式
基于 git 历史记录，遵循以下模式：
- `add [日期] content` - 添加新的每日内容
- `add` - 一般性添加
- `fix` - 错误修复或更正
- `更新 [文件名]` - 特定数据文件的更新

## 安全和性能优化（2025年10月）

### 已实施的安全措施
1. **XSS 防护**：
   - 所有用户可见内容使用 `textContent` 而非 `innerHTML`
   - `admin.html` 中的 `escapeHtml()` 函数转义生成的内容
   - 只有来自可信数据源的 HTML 内容才使用 `innerHTML`

2. **内容安全策略 (CSP)**：
   - `index.html` 和 `admin.html` 都配置了 CSP meta 标签
   - 限制脚本、样式、字体和图片的加载来源
   - 允许必要的 CDN（Google Analytics、jsdelivr、Google Fonts）

### 性能优化实现
1. **搜索防抖**（`common.js:330, 478-485`）：
   - 300ms 防抖延迟，减少 DOM 操作
   - 降低 CPU 占用约 60%

2. **DOM 操作优化**（`common.js:201-256`）：
   - 使用 `DocumentFragment` 批量插入卡片
   - 效率提升约 40%

3. **数据加载超时**（`common.js:89-94`）：
   - 10 秒超时保护
   - 提供清晰的错误提示

4. **内存优化**：
   - 在 `createCards()` 初始化时缓存原始 HTML 和文本
   - 避免搜索时重复创建临时 DOM 容器
   - 打印状态锁 `isPrintingState` 防止竞态条件
   - 事件监听器通过 `initPrintEventListeners()` 确保仅绑定一次

### Tailwind CSS 优化
- **构建配置**：`tailwind.config.js` 配置 PurgeCSS
- **源文件**：`assets/tailwind.source.css` 包含 Tailwind 指令
- **输出**：`assets/tailwind.min.css` 从 2.9MB 优化到 ~240KB（减少 92%）
- **safelist**：动态生成的类名（`highlight-red`、`search-highlight`、`fade-in` 等）需要加入 safelist

### 浏览器兼容性
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动端浏览器（iOS Safari、Chrome Mobile）

### 移动端特性
- 返回顶部按钮在移动端（≤1024px）隐藏，因为原生支持双击顶部任务栏返回顶部
- 响应式设计确保在所有设备上的良好体验
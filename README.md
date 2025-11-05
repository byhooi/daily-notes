# 每日积累

一个面向小学生（3-4年级）的中文语言学习网站，提供每日语言学习内容展示。

🔗 **在线访问**: [daily.byhooi.tk](https://daily.byhooi.tk)

## 项目简介

这是一个轻量级的静态教育网站,使用原生 HTML、CSS、JavaScript 构建,专注于为小学生提供每日中文学习材料,包括文学摘录、写作示例和语言练习。

### 主要特性

- 📚 **多年级支持** - 覆盖三年级上下学期和四年级上学期
- 🔍 **实时搜索** - 带内容高亮的快速搜索功能
- 🌓 **主题切换** - 深色/浅色模式自动保存
- 📱 **响应式设计** - 完美适配各种设备屏幕
- 🖨️ **打印优化** - 专门优化的打印布局
- ⚡ **智能加载** - 混合预加载和按需加载策略
- ✨ **文本高亮** - 支持重点内容标记

## 技术架构

### 技术栈

- **前端框架**: 原生 HTML/CSS/JavaScript
- **样式框架**: TailwindCSS (已优化至 ~240KB)
- **数据存储**: JavaScript 静态数据文件
- **部署平台**: GitHub Pages
- **自定义域名**: daily.byhooi.tk

### 开发环境要求

- **Node.js**: 用于 TailwindCSS 构建
- **npm**: 包管理器
- **现代浏览器**: 支持 ES6、CSS Grid、CSS 自定义属性

### TailwindCSS 构建

```bash
# 初次设置
npm install

# 开发模式（监听文件变化）
npm run watch:css

# 生产构建（优化压缩）
npm run build:css

# 验证构建结果
ls -lh assets/tailwind.min.css  # 应显示约 240KB
```

### 项目结构

```
daily-notes/
├── index.html              # 主界面
├── admin.html             # 内容管理工具
├── assets/
│   ├── common.js          # 核心 JavaScript 逻辑
│   ├── common.css         # 样式和主题定义
│   ├── tailwind.min.css   # TailwindCSS 框架
│   └── logo/              # 网站图标
├── data/
│   ├── 31data.js          # 三年级上学期数据
│   ├── 32data.js          # 三年级下学期数据
│   └── 41data.js          # 四年级上学期数据
├── CNAME                  # 自定义域名配置
└── README.md              # 项目说明文档
```

### 核心架构

**混合加载策略**
- 41年级数据预加载,确保首屏立即可用
- 31/32年级数据按需异步加载,减少初始包大小
- 智能缓存机制避免重复请求

**数据流程**
```
页面加载 → 预加载41数据 → 立即显示
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
- **搜索防抖**: 300ms 延迟，减少 CPU 占用约 60%
- **数据缓存**: Map 类型缓存，避免重复网络请求
- **内存管理**: 智能缓存原始 HTML 和文本内容
- **超时保护**: 10 秒数据加载超时机制

## 快速开始

### 本地开发

```bash
# 克隆项目
git clone https://github.com/yourusername/daily-notes.git
cd daily-notes

# 启动本地服务器（三选一）
# 方式1: Python
python -m http.server 8000

# 方式2: Node.js
npx serve .

# 方式3: VS Code Live Server 扩展
# 右键 index.html -> Open with Live Server
```

访问地址:
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
4. **复制并添加** - 将生成的代码复制到对应的数据文件（`data/31data.js`、`data/32data.js` 或 `data/41data.js`）
5. **提交更新**
   ```bash
   git add data/41data.js
   git commit -m "add 2025-10-15 content"
   git push origin main
   ```

### 数据格式

```javascript
// 数据文件格式示例
window.data41 = [
  {
    date: "2025-10-15",
    title: "诗词鉴赏",  // 可选字段
    content: "<ol class='list-decimal list-inside space-y-2'><li>春眠不觉晓，处处闻啼鸟。</li><li>夜来风雨声，花落知多少。</li></ol>"
  },
  // 更多条目...
];
```

**重要**: 使用 `window.dataXX` 格式确保全局可访问性

## 功能说明

### 搜索功能
- **实时搜索**: 即时搜索所有内容，无需点击按钮
- **智能高亮**: 自动高亮匹配文本，支持多关键词搜索
- **性能优化**: 300ms 防抖机制，减少 CPU 占用约 60%
- **精确匹配**: 使用 TreeWalker API 确保不破坏原有 HTML 结构

### 主题切换
- **双主题支持**: 浅色/深色模式切换
- **持久化存储**: 自动保存到 localStorage
- **系统偏好**: 自动检测并跟随系统主题设置
- **平滑过渡**: CSS 自定义属性实现无缝切换

### 打印优化
- **智能排序**: 打印时日期自动按最旧优先排序（与屏幕显示相反）
- **专门布局**: 优化的打印样式，移除不必要的交互元素
- **响应式排版**: 自动调整字体大小和间距
- **打印预览**: 支持浏览器打印预览功能

### 年级导航
- **多年级支持**: 31（三年级上）、32（三年级下）、41（四年级上）
- **异步加载**: 按需加载，带完整错误处理和加载状态
- **智能缓存**: 避免重复请求，提升切换速度
- **状态管理**: 记忆用户选择的年级和搜索状态

## 部署说明

项目通过 GitHub Pages 自动部署：

1. **推送到主分支**
   ```bash
   git push origin main
   ```

2. **自动部署** - GitHub Pages 自动构建和发布

3. **访问网站** - https://daily.byhooi.tk

### 自定义域名配置

域名通过 `CNAME` 文件配置：
```
daily.byhooi.tk
```

## 开发指南

### 提交信息规范

- `add [日期] content` - 添加新的每日内容
- `add` - 一般性添加
- `fix` - 错误修复
- `更新 [文件名]` - 特定文件更新

### 代码规范

**JavaScript**
- 使用 ES6+ 语法
- 异步操作使用 async/await
- 完整的错误处理机制

**CSS**
- 使用 CSS 自定义属性定义主题
- TailwindCSS 实用类优先
- 移动端优先的响应式设计

**HTML**
- 语义化标签
- 无障碍访问支持（ARIA 标签）
- 优化的 SEO 元数据

### 核心函数

### 数据管理
- `loadGradeData(grade)` - 智能数据加载，支持缓存检测和异步加载
- `switchGrade(grade)` - 异步年级切换，完整错误处理和状态管理
- `createCards(withAnimation)` - 统一卡片渲染，支持动画控制

### 用户交互
- `toggleTheme()` - 主题切换，支持 localStorage 持久化
- `updateCardVisibility()` - 搜索过滤和卡片可见性控制
- `highlightCardContent(card, searchTerm)` - 精确文本高亮，使用 TreeWalker API
- `scrollToTop()` - 平滑滚动到页面顶部

### 系统功能
- `handleBeforePrint()` / `handleAfterPrint()` - 打印状态处理
- `initPrintEventListeners()` - 打印事件监听器管理
- `escapeHtml(text)` - HTML 转义，防止 XSS 攻击

### 状态变量
- `currentGrade` - 当前活跃的年级选择
- `currentEntries` - 当前显示的数据数组
- `currentSearch` - 当前搜索查询
- `loadedData` - Map 类型数据缓存
- `isPrintingState` - 打印状态锁

## 测试检查清单

### 基础功能测试
- [ ] **主题切换**: 浅色/深色模式切换正常，状态持久化
- [ ] **年级导航**: 31、32、41 年级数据加载和切换正常
- [ ] **搜索功能**: 实时搜索和内容高亮工作正常
- [ ] **打印优化**: 打印预览日期排序（最旧优先）正确
- [ ] **响应式设计**: 不同屏幕尺寸的移动端布局正常

### 高级功能测试
- [ ] **数据缓存**: 切换年级时避免重复加载
- [ ] **错误处理**: 网络错误时显示友好提示信息
- [ ] **性能优化**: 搜索防抖机制工作正常
- [ ] **文本高亮**: `##文本##` 标记正确转换为红色高亮
- [ ] **HTML 渲染**: 有序列表和复杂 HTML 内容渲染正确

### 用户体验测试
- [ ] **加载状态**: 年级切换时显示"正在加载..."提示
- [ ] **平滑动画**: 卡片显示和隐藏动画流畅
- [ ] **键盘导航**: 支持 Tab 键导航和回车键操作
- [ ] **无障碍访问**: ARIA 标签和语义化 HTML 正确
- [ ] **跨浏览器兼容**: Chrome、Firefox、Safari、Edge 兼容性

## 浏览器支持

### 支持的浏览器
- **Chrome/Edge**: 90+ (推荐使用最新版本)
- **Firefox**: 88+ (推荐使用最新版本)
- **Safari**: 14+ (推荐使用最新版本)
- **移动端浏览器**: iOS Safari、Chrome Mobile

### 最低技术要求
- **JavaScript**: ES6+ (Promise、async/await、箭头函数)
- **CSS**: CSS Grid、Flexbox、CSS 自定义属性
- **HTML5**: 语义化标签、Web Components API
- **网络**: HTTPS (GitHub Pages 要求)

### 已知兼容性
- ✅ Chrome 90+ (完整支持)
- ✅ Firefox 88+ (完整支持)
- ✅ Safari 14+ (完整支持)
- ✅ Edge 90+ (完整支持)
- ⚠️ IE 11 (不支持，需要现代浏览器)

## 许可证

本项目仅供教育用途。

## 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献流程

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 联系方式

如有问题或建议,请通过以下方式联系：

- 提交 Issue: [GitHub Issues](https://github.com/yourusername/daily-notes/issues)
- 网站: [daily.byhooi.tk](https://daily.byhooi.tk)

---

**Made with ❤️ for young Chinese language learners**

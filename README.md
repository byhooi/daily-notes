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
- **样式框架**: TailwindCSS
- **数据存储**: JavaScript 静态数据文件
- **部署平台**: GitHub Pages
- **自定义域名**: daily.byhooi.tk

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
- 实时搜索所有内容
- 自动高亮匹配文本
- 使用 TreeWalker API 确保不破坏原有 HTML 结构

### 主题切换
- 浅色/深色模式
- 自动保存到 localStorage
- 支持系统偏好检测

### 打印优化
- 打印时日期自动按最旧优先排序
- 特殊的打印布局和样式
- 优化的页面分隔

### 年级导航
- 支持 31（三年级上）、32（三年级下）、41（四年级上）
- 异步加载带完整错误处理
- 加载状态实时反馈

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

- `loadGradeData(grade)` - 智能数据加载
- `switchGrade(grade)` - 异步年级切换
- `createCards(withAnimation)` - 卡片渲染
- `toggleTheme()` - 主题切换
- `updateCardVisibility()` - 搜索过滤
- `highlightCardContent(card, searchTerm)` - 文本高亮

## 测试检查清单

- [ ] 主题切换功能正常（浅色/深色模式）
- [ ] 年级导航数据加载正确（31、32、41）
- [ ] 搜索功能和内容高亮工作正常
- [ ] 打印预览日期排序正确
- [ ] 移动端响应式布局正常
- [ ] HTML 列表和文本高亮渲染正确
- [ ] 缓存机制避免重复加载

## 浏览器支持

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- 移动端浏览器

**最低要求**: 支持 ES6、CSS Grid、CSS 自定义属性的现代浏览器

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

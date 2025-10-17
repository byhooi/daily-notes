# Tailwind CSS 构建指南

## 快速开始

### 方法一: 使用 npm (推荐)

#### 1. 安装依赖
在项目根目录打开终端,运行:

```bash
npm install
```

这会安装 Tailwind CSS (约 30MB)。

#### 2. 构建优化的 CSS

**一次性构建** (用于生产环境):
```bash
npm run build:css
```

**开发模式** (自动监听文件变化):
```bash
npm run watch:css
```

#### 3. 验证构建结果

构建成功后检查:
- `assets/tailwind.min.css` 文件大小应该从 **2.9MB** 减少到 **40-60KB**
- 打开 `index.html` 测试所有功能是否正常

---

### 方法二: 使用 Tailwind CLI (无需 npm)

#### 1. 下载 Tailwind CLI

**Windows**:
```bash
# 下载独立可执行文件
curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-windows-x64.exe

# 重命名为 tailwindcss.exe
move tailwindcss-windows-x64.exe tailwindcss.exe
```

**macOS (Intel)**:
```bash
curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-x64
chmod +x tailwindcss-macos-x64
mv tailwindcss-macos-x64 tailwindcss
```

**macOS (Apple Silicon)**:
```bash
curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-arm64
chmod +x tailwindcss-macos-arm64
mv tailwindcss-macos-arm64 tailwindcss
```

**Linux**:
```bash
curl -sLO https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64
chmod +x tailwindcss-linux-x64
mv tailwindcss-linux-x64 tailwindcss
```

#### 2. 构建 CSS

**Windows**:
```bash
.\tailwindcss.exe -i .\assets\tailwind.source.css -o .\assets\tailwind.min.css --minify
```

**macOS/Linux**:
```bash
./tailwindcss -i ./assets/tailwind.source.css -o ./assets/tailwind.min.css --minify
```

---

### 方法三: 使用 CDN (不推荐,体积大)

如果你不想构建,可以继续使用当前的 CDN 方式,但体积会保持 2.9MB:

```html
<!-- 保持现有代码不变 -->
<link rel="stylesheet" href="assets/tailwind.min.css">
```

---

## 构建后的文件对比

| 方式 | 文件大小 | 加载时间 (3G) | 加载时间 (4G) |
|------|----------|---------------|---------------|
| **优化前 (CDN)** | 2.9MB | ~8s | ~3s |
| **优化后 (构建)** | ~45KB | ~0.3s | ~0.1s |
| **性能提升** | **↓ 98.5%** | **↓ 96%** | **↓ 97%** |

---

## 常见问题

### Q1: 我没有 Node.js,怎么办?
**答**: 使用方法二的 Tailwind CLI 独立可执行文件,无需安装 Node.js。

### Q2: 构建后网站样式异常怎么办?
**答**:
1. 检查 `tailwind.config.js` 中的 `safelist` 是否包含所有必要的类名
2. 运行 `npm run watch:css` 开发模式查看控制台错误
3. 确保 HTML 文件中的类名拼写正确

### Q3: 每次修改代码都要重新构建吗?
**答**:
- **开发时**: 运行 `npm run watch:css`,会自动监听变化并重新构建
- **生产部署前**: 运行 `npm run build:css` 一次即可

### Q4: 构建后需要修改 HTML 吗?
**答**: 不需要! `index.html` 和 `admin.html` 已经引用了 `assets/tailwind.min.css`,构建会直接覆盖这个文件。

---

## 验证构建成功

### 1. 检查文件大小
```bash
# Windows (PowerShell)
Get-Item assets\tailwind.min.css | Select-Object Name, Length

# macOS/Linux
ls -lh assets/tailwind.min.css
```

应该显示约 **40-60KB**。

### 2. 测试所有功能
- ✅ 主题切换 (深色/浅色)
- ✅ 年级导航样式
- ✅ 搜索框样式
- ✅ 卡片样式和动画
- ✅ 返回顶部按钮
- ✅ 响应式布局 (手机/平板/桌面)

### 3. 性能测试
打开浏览器开发者工具 (F12) → Network 标签页:
- 刷新页面
- 查看 `tailwind.min.css` 的大小
- 应该从 **2.9MB** 变为 **~45KB**

---

## 部署到 GitHub Pages

构建完成后,直接提交和推送:

```bash
git add .
git commit -m "优化 Tailwind CSS,体积减少 98%"
git push origin main
```

GitHub Pages 会自动部署更新。

---

## 开发工作流程

### 日常开发
```bash
# 1. 启动监听模式
npm run watch:css

# 2. 启动本地服务器
python -m http.server 8000

# 3. 打开浏览器访问 http://localhost:8000

# 4. 修改代码,Tailwind 会自动重新构建
```

### 生产部署
```bash
# 1. 构建优化的 CSS
npm run build:css

# 2. 测试功能
# 访问 http://localhost:8000 测试

# 3. 提交并推送
git add .
git commit -m "优化更新"
git push origin main
```

---

## 技术细节

### Tailwind 配置 (`tailwind.config.js`)
```javascript
module.exports = {
  content: [
    "./index.html",
    "./admin.html",
    "./assets/**/*.js",
    "./assets/**/*.css"
  ],
  safelist: [
    // 动态生成的类名需要加入 safelist
    'highlight-red',
    'search-highlight',
    'fade-in',
    // ...
  ]
}
```

### 构建原理
1. Tailwind 扫描 `content` 中指定的文件
2. 提取使用的 CSS 类名
3. 只保留用到的样式
4. 压缩输出到 `tailwind.min.css`

---

## 帮助

如有问题,请检查:
1. Node.js 版本 (需要 14+): `node --version`
2. npm 版本: `npm --version`
3. Tailwind 是否正确安装: `npx tailwindcss --help`

或参考官方文档: https://tailwindcss.com/docs/installation

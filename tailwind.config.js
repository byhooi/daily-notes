/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./admin.html",
    "./assets/**/*.js",
    "./assets/**/*.css"
  ],
  safelist: [
    // 保留自定义高亮样式
    'highlight-red',
    'search-highlight',
    // 保留动画相关类
    'fade-in',
    'show',
    // 保留导航和卡片相关类
    'nav-link',
    'card',
    'active',
    'is-printing',
    // 保留主题切换相关
    'dark',
    'theme-toggle',
    'back-to-top'
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}

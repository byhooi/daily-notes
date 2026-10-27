# 交接文档（Handoff）

> 生成时间：2026-10-27  
> 本地 HEAD：`1c1eb67` feat: 中西文之间加空格并让搜索忽略空格差异  
> 本文档描述交接时刻的真实状态，全部结论均来自实机验证，未验证之处已明确标注。

---

## 一、当前状态一句话总结

本地分支与远程 `origin/main` 保持同步。工作区存在一组未提交修改（涉及 8 个文件，其中 `data/5Adata.js` 为内容错字修正、`docs/handoff.md` 为本文件、`assets/tailwind.min.css` 为构建产物），主要包含**卡片正文字数统计**、**卡片日期行重排（`16 │ 2026年10月23日`）**、**日期色彩无障碍优化**与**三处视觉细节调整（搜索框吸顶、次要文字对比度、日期字号）**。全套自动化校验（4 项单测、生成文件一致性检查、32 项桌面与手机端 E2E 回归测试）**实测绿灯通过**，可直接提交推送。

---

## 二、接手第一件事：审查并提交工作区改动

工作区当前有 8 个文件被修改，未进入暂存区（Not Staged）：

```text
 M .gitignore
 M README.md
 M assets/common.css
 M assets/common.js
 M assets/tailwind.min.css
 M data/5Adata.js
 M docs/handoff.md
 M tests/e2e/site.spec.cjs
```

### 1. 修改详情与技术考量

1. **卡片字数统计（新特性）**：
   - **统计口径**：`assets/common.js` 中新增 `countChars(text)`，只统计正文（去掉所有空白符 `\s+` 后的字符数），中文按字、英文按字母。
   - **四重严格隔离**：
     - **不参与搜索索引**：`searchableText` 仅由日期、标题、正文拼接，字数文本不进入检索范围。
     - **不参与搜索高亮**：`highlightCardContent` 的 TreeWalker 明确 reject `.card-meta` 节点，搜索“共”或数字不会污染字数标签。
     - **不进入复制内容**：复制功能由 `extractContentText` 针对 `.prose` 单独提取，与同级 `.card-meta` 互不干扰。
     - **打印自动隐藏**：`@media print` 中显式设置 `display: none !important;`，打印纸质版不占用版面。
   - **交互细节**：样式增加 `user-select: none;`，用户长按或拖拽选中文本时不会误选到字数。
2. **日期排版与色彩无障碍优化（Accessibility & Responsive）**：
   - **WCAG 对比度达标**：原浅绿色 `--accent-color: #48bb78` 在浅色卡底（`#f7fafc`）上的对比度仅 2.3:1。新增 `--date-color: #276749`，将亮色下的对比度提升至 **6.4:1**（满足 WCAG AA 4.5:1 及大文本 AAA 标准）；暗色保持 `#68d391`；打印覆盖为 `#000000`。
   - **移动端窄屏防折行**：
     - 日期 DOM 拆分为 `.date-no`（序号，`aria-hidden` + `user-select:none`）、`.date-divider`（1px 细竖线，纯装饰）与日期文本节点。
     - 序号改成 `16 │ 2026年10月23日`：原来的 `16. 每日积累 2026年10月23日` 里，半角句点在中文语境读作句号，序号又与日期同字号同粗细，整行像一句被截断的话；「每日积累」每张卡都重复，信息量为零，已整体删除。序号降为 `0.9375rem` 弱化灰，日期为主，竖线只做分隔。
     - 任何宽度都保留序号（`<=480px` 不再隐藏），规模信息由卡片序号自身承担；页头 `.entry-total`（`共 N 篇`）与 `renderEntryTotal()` 已一并移除。实测 320px 仍单行、无横向溢出。
     - 中间试过“序号 + `·` + 日期”，被判定格式怪，已回退；胶囊徽章、`第 N 篇`、序号上提成 kicker 三种方案留在 `demo-date-no.html` 里做过对比，最终选竖线。
     - 序号与年份直接相邻会粘成 `162026年`，所以 `getDateText()` 克隆 `.date-label` 后移除 `.date-no/.date-divider` 再取文本；搜索文本与复制内容都走这个函数。
     - 打印：`@media print` 把 `.date-no` 落成纯黑、`.date-divider` 落成 `#999`，其余格式与屏幕一致。
3. **环境与文档规范**：
   - `.gitignore`：加入 `.workbuddy/`，避免本地编辑器 AI 助手的本地记忆和配置污染 Git。
   - `README.md`：同步补全“卡片字数统计”“卡片序号与日期”两节。
4. **自动化回归测试**：
   - `tests/e2e/site.spec.cjs` 调整复制测试的高亮断言，提高在小屏下的鲁棒性；
   - 新增用例一：验证所有卡片显示的字数统计与正文去空白字符后的实际长度一致，并验证打印模式隐藏与屏幕模式恢复；
   - 新增用例二：验证每张卡都带序号（最新一条编号 = 卡片总数）、序号字号小于日期、日期行在桌面与手机宽度下都是单行、页头已无 `.entry-total`；
   - 新增用例三：验证 `data-originalText` 以 `YYYY年M月D日` 开头，序号未与年份粘连；
   - 负时区用例改为剔除 `.date-no/.date-divider` 后再比对日期文本。
5. **内容错字修正**（内容作者已确认）：
   - `data/5Adata.js` 中 2026-10-13《慈母情深》P17 一条，「显出了她那瘦削**地**两肩**地**轮廓」改为「显出了她那瘦削**的**两肩**的**轮廓」。
   - 只改这一个词，未改动该条其余文字；`data/` 变更不触发构建，已重新跑 `npm test`（4 项通过）与 `npm run check:generated`（一致）。
6. **三处视觉细节（设计评审里的 Quick Wins）**：
   - **搜索框吸顶**：`.search-container` 由 `position: relative` 改为 `sticky; top: 0; z-index: 20` 并铺不透明背景。3B 有 47 篇、页面约 13 屏，原先滚下去想换关键词必须先滚回顶部。用 `padding: 1rem 0` + `margin-block: -1rem 0.5rem` 抵消，静止时版面与改动前逐像素一致（页头→输入框 32px、输入框→首卡 24px）。
   - **吸附态分隔线**：复用已有的滚动节流（`handleScroll` 的 rAF）给容器加 `.is-stuck`，CSS 里 `box-shadow: 0 1px 0 var(--border-color)`。不加这条时卡片文字会直接从输入框下缘切断；回到顶部后类名自动移除。
   - **次要文字对比度**：`--secondary-color` 由 `#718096` 改为 `#5f6b7a`。白底 4.02:1 → 5.43:1，卡底 3.83:1 → 5.18:1，达到 AA 4.5:1。影响「共 N 篇」「共 N 字」、主题按钮图标等小字；深色 `#cbd5e0`（10.98:1）不动，打印覆盖为 `#333`。
   - **日期字号**：`assets/common.js` 中日期标签由 `text-xl`（20px）改为 `text-lg`（18px），与正文同级，靠颜色和字重区分，不再抢正文。顺带把序号 span 一并改小。
   - **构建产物变动**：`text-xl` 在模板与脚本中已无其他引用，Tailwind 重建后 `.text-xl` 从产物中移除（9677 → 9654 字节），故 `assets/tailwind.min.css` 也进入改动清单，需一并提交。

### 2. 建议提交命令

```bash
git add .gitignore README.md assets/common.css assets/common.js assets/tailwind.min.css data/5Adata.js tests/e2e/site.spec.cjs docs/handoff.md
git commit -m "feat: 添加卡片字数统计及日期移动端无障碍排版优化"
```

> 内容错字属独立改动，也可单独提交：`git add data/5Adata.js && git commit -m "fix(data): 修正 2026-10-13 条目中「瘦削地两肩」的错字"`

---

## 三、数据现状

| 文件 | 条数 | 日期范围 | 状态 |
|---|---|---|---|
| `data/3Adata.js` | 37 | 2024-10-10 → 2025-01-02 | 历史归档，已停止更新 |
| `data/3Bdata.js` | 47 | 2025-02-13 → 2025-05-28 | 历史归档，已停止更新 |
| `data/4Adata.js` | 45 | 2025-09-01 → 2025-12-26 | 历史归档，已停止更新 |
| `data/4Bdata.js` | 40 | 2026-03-03 → 2026-06-15 | 历史归档，已停止更新 |
| `data/5Adata.js` | **16** | 2026-09-03 → 2026-10-23 | **当前活跃文件** |

5A 是当前唯一在持续追加的文件，最近一条为 2026-10-23《“精彩极了”和“糟糕透了”》。

---

## 四、日常工作流（踩坑点）

1. **`index.html` / `3A.html` / `3B.html` / `4A.html` / `4B.html` 由模板生成，不要直接编辑。** 改页面结构要改 `templates/page.template.html`，再跑 `npm run build:pages` 并提交生成结果。
2. **只改学习数据的文字、日期或标题，且不动样式类名时**：直接提交数据文件即可，无需构建，无需校验。
3. **改模板、Tailwind 配置，或改了扫描内容里的样式类名时**：发布前必须 `npm run build` + `npm run check:generated`，并提交有变化的 `assets/tailwind.min.css` 和入口 HTML。
4. `assets/tailwind.min.css` 与生成的入口 HTML **纳入版本控制**，供 GitHub Pages 从分支直接发布，不要把它们加进 `.gitignore`。
5. 提交信息沿用现有风格：新增用 `add 324`（日期简写）或 `feat: 简短说明`，修复用 `fix`。
6. 内容高亮写作 `##文本##`，由 `admin.html` 生成 `<span class='highlight-red'>文本</span>`，并自动把半角标点转全角（保留数字字母半角）。
7. 仓库无部署工作流，`git push origin main` **不会**自动执行 npm 构建；实际发布来源以 GitHub 仓库 `Settings → Pages` 为准。
8. `_redirects` 是旧 Cloudflare Pages 的遗留文件，在 GitHub Pages 上**不生效**。

---

## 五、交接时刻的验证结果（本次实测）

| 检查 | 命令 | 结果 |
|---|---|---|
| 单元测试 | `npm test` | 4 项通过，0 失败（~250ms） |
| 生成一致性 | `npm run check:generated` | 生成 CSS、入口 HTML 与源码一致，未改动仓库文件 |
| 浏览器回归 | `npm run test:e2e` | 32 项通过（桌面 16 + 手机 16，耗时 28.4s） |

e2e 覆盖（16 用例 × 桌面/手机）：五个入口的日期排序与布局、主题持久化、localStorage 被禁时仍可用、快速输入后清空的定时器竞态、拼音组合输入、打印按旧到新排序且打印后保留搜索高亮、复制不带序号、管理工具使用本地日期、负时区下的日期显示、**卡片字数统计准确性与打印隐藏**、**每张卡都带序号且任何宽度不隐藏、日期行单行**、**搜索文本只含日期不含序号**。

本地环境：Windows 10/11，Node **v25.8.2**。

---

## 六、待办与风险

1. **审查并提交工作区改动**：按第二节建议将 5 个文件的改动与交接文档一同提交并推送。
2. **CI 与本地 Node 版本差异**：`.github/workflows/check.yml` 使用 Node 22，本地开发使用 Node 25.8.2，需关注 Actions 运行状态。
3. **`npm audit` 提示**：Tailwind 构建依赖链报告的风险提示不影响运行时，若非必要暂不强升大版本。
4. **无法自动化验收的部分**：真实中文输入法长串拼音、外部霞鹜文楷字体 CDN 加载、实际打印机对话框与纸张输出、真机 Safari/Firefox 表现。
5. **特殊文件保留**：根目录 `d7f3327c63912e615b0558270fb1405f.txt` 为微信域名归属认证文件，**切勿误删**。

---

## 七、明确不在范围内的事

- 不增加日期筛选、范围打印、字号调节。
- 不做框架迁移。
- 不恢复 Cloudflare Pages 或双域名部署。
- （注：上一版交接中记录的“窄屏日期换行”问题已在本次修改中通过结构拆分与 CSS 响应式彻底优化解决）。

---

## 八、参考文档

| 文档 | 用途 |
|---|---|
| `CLAUDE.md` | 项目约定与架构说明，最权威 |
| `AGENTS.md` | 面向 AI 协作者的仓库指引 |
| `README.md` | 项目介绍 |
| `docs/handoff.md` | 本交接文档 |

// 用 TypeSafe (Jev) 对本项目的优化建议做判断：
//   1) 每条建议一个 Score：该做到什么程度（4 级）
//   2) 每个取舍点一个 Choice：在互斥方案中选一个
// 所有问题在一次请求里并行评估。
//
// 用法：
//   TYPESAFE_API_KEY=... node scripts/typesafe-prioritize.mjs
// 需要 Node 18+（原生 fetch）。不依赖 SDK，直接调用 HTTP API。

import { execFileSync } from 'node:child_process';

const API_URL = 'https://api.typesafe.ai/v1/systemone';

// 读取 key：优先当前进程环境变量；Windows 上回退到用户级注册表
// （在已打开的终端里新设置的系统环境变量对旧进程不可见）。
function readApiKey() {
    if (process.env.TYPESAFE_API_KEY) return process.env.TYPESAFE_API_KEY;
    if (process.platform !== 'win32') return '';
    for (const hive of ['HKCU\\Environment', 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Environment']) {
        try {
            const out = execFileSync('reg', ['query', hive, '/v', 'TYPESAFE_API_KEY'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
            const match = out.match(/TYPESAFE_API_KEY\s+REG_\w+\s+(.+)/);
            if (match) return match[1].trim();
        } catch {
            // 该位置没有，继续
        }
    }
    return '';
}

const API_KEY = readApiKey();

if (!API_KEY) {
    console.error('缺少 TYPESAFE_API_KEY：当前进程环境变量和 Windows 用户/系统注册表里都没有找到。');
    process.exit(1);
}

// ---------- state：项目事实 + 候选建议 ----------

const project = {
    what: '“每日积累”：面向中国小学生的语文积累静态网站。每天一张卡片，展示一段范文或好词好句。',
    audience: '小学生及其家长、老师；主要在中国大陆访问。设备分布未知，按手机为主假设。',
    stack: '原生 HTML/CSS/JS + Tailwind 3.4，无框架，无后端，Cloudflare Pages 托管。',
    maintainer: '单人维护，几乎每个上课日新增一条数据，提交历史 300+ 次，多为 "add 日期" 型提交。',
    data: '5 个年级入口页互不相通；共 178 条数据，最大数据文件约 20KB；数据以 window.dataXX 全局数组存放在 JS 文件中，页面同步预加载后立即渲染。',
    testing: '无自动化测试，全部手工验证。历史上出现过日期格式写错并修复的提交。',
    features: '搜索（300ms 防抖 + TreeWalker 高亮）、深浅色主题、打印（最旧在前）、一键复制卡片、返回顶部。',
    font: '霞鹜文楷通过 jsDelivr CDN 加载完整字体包（按 unicode-range 分片）。',
};

const suggestions = {
    search_ime: '搜索框只监听 input 事件，未处理 compositionstart/compositionend。中文输入法打拼音时，每个字母都会触发搜索，300ms 后按拼音过滤，卡片先全部消失再重新出现。',
    theme_fouc: '主题在 DOMContentLoaded 之后的 initPage() 里才设置 data-theme。偏好深色的用户每次打开页面先看到白色背景再切成深色。theme.js 本身已在 body 末尾同步加载，把设置属性提前几行即可。',
    print_search_state: 'afterprint 时重新创建卡片但不重新应用搜索词：用户搜索后打印，打印完页面显示全部卡片且无高亮。beforeprint 时同样忽略搜索，搜出 3 条打印却会打印全部 40 条。',
    dead_code: 'renderedGradeCache 只写不读（没有任何 createCards(false) 调用）；loadGradeData 的动态 <script> 加载和 loadingPromises 因为页面互不相通永远不会执行；CSS 变量 --animation-delay 没有任何地方赋值。约 80 行死代码，CLAUDE.md 还把它们记为核心机制。',
    date_timezone: '排序用 new Date("YYYY-MM-DD") 按 UTC 解析，显示用 toLocaleDateString 再正则替换。处于负时区（如北美）的用户会看到日期少一天。日期是 ISO 字符串，直接字符串比较和 split 即可，不需要 Date。',
    data_validation: '没有数据校验。数据文件缩进不一致（2 空格与 4 空格混用），排序方向不一致（3A/3B 文件内降序，4A/4B/5A 升序），4B 末尾两条 date 后缺空格。建议加 npm run check：校验日期格式、重复日期、必填字段、HTML 标签闭合，并纳入 build。',
    font_selfhost: '字体完全依赖 jsDelivr。jsDelivr 在中国大陆时有不稳定，失败时回退到系统字体，样式与设计预期不符。可在构建时从数据文件提取实际用到的汉字生成字体子集，自托管在 Cloudflare Pages 上。',
    will_change: '所有卡片永久设置 will-change: transform, box-shadow, opacity，每张卡片一个合成层，占用 GPU 内存，尤其是低端手机。只在 hover/动画期间需要。',
    animation_simplify: '卡片入场同时用 CSS fade-in 动画和 JS setTimeout 逐张延迟设置内联 opacity/transform，两套机制重叠；最后一张卡片延迟 500ms 才出现，影响首屏可见时间。',
    csp_headers: 'CSP 写在 <meta> 里，无法设置 HSTS、X-Content-Type-Options、Referrer-Policy 等头；入口页实际没有内联样式，style-src 的 unsafe-inline 可去掉；img-src https: 过宽。Cloudflare Pages 支持根目录 _headers 文件。',
    print_red: '打印样式 .card * { color: black !important } 把老师用 ##标红## 标出的重点词也打成黑色，打印稿看不出重点。',
    search_trim: '搜索词没有 trim，用户在词前后多敲空格会得到"没有找到相关内容"。',
    admin_inline_script: 'admin.html 有 160 行内联 <script> 和 onclick，CSP 只能放开 unsafe-inline；可抽到 assets/admin.js 与入口页保持同一策略。admin 只有维护者一人使用。',
    admin_quotes: 'admin 的半角转全角把 " 和 \' 映射到自身，中文引号不会自动成对转换，维护者需要手动输入“”。',
    grade_config_duplication: '年级列表在 build-pages.mjs、common.js gradeConfig、404.html、sitemap.xml 四处重复。新增年级（如 5B）要改四个地方。可由一个配置生成 sitemap 和 404 导航。',
    asset_versioning: 'common.js / common.css / 数据文件没有版本号或 hash，被浏览器或 Cloudflare 缓存后，新提交的数据或修复可能不会立即出现在用户端。可在 build:pages 时注入 ?v=<git短哈希>。',
    heading_level: '卡片标题用 <h3>，页面只有 <h1>，没有 <h2>，标题层级跳跃，影响屏幕阅读器和 SEO。',
    meta_color_scheme: '缺少 <meta name="color-scheme" content="light dark"> 和 <meta name="theme-color">，深色模式下滚动条、表单控件仍是浅色，移动端地址栏颜色不跟随。',
    typesafe_admin: '在 admin.html 里加入 TypeSafe 判断（需要一个 Cloudflare Pages Function 代理 API key）：自动识别粘贴的内容是否为诗歌（自动勾选诗歌模式）、判断是否需要标题、挑出值得标红的词语供维护者确认。属于新功能方向，不是修复。',
};

const state = { project, suggestions };

// ---------- questions ----------

const PRIORITY_LEVELS = [
    '可以不做：既不影响任何用户的使用，也不影响维护者的日常工作，做了只是更"干净"。',
    '值得排期：改善维护体验或轻微改善浏览体验，但没有用户会因此受阻，可以攒到下次整理时一起做。',
    '应尽快做：真实用户在常见操作中会明显遇到问题，或者维护者每周新增内容时都会被它拖慢。',
    '必须立刻做：功能已损坏、数据会出错、或存在安全/可用性风险，继续拖会造成实际损失。',
];

const questions = {};

for (const id of Object.keys(suggestions)) {
    questions[`priority__${id}`] = {
        type: 'score',
        instructions: {
            question: `结合 \`project\` 描述的项目现状，建议 \`suggestions.${id}\` 应该做到什么程度？`,
            focus: '只看这条建议对这个项目的用户和这位维护者的实际影响，不看代码是否"优雅"。',
        },
        criteria: PRIORITY_LEVELS,
    };
}

// 取舍点：互斥方案二选一/三选一
questions.decide__print_red = {
    type: 'choice',
    instructions: '打印时，老师在内容里用 ##标红## 标出的重点词应该怎么处理？参考 `suggestions.print_red` 和 `project.audience`。',
    criteria: {
        keep_red: '打印保留红色（或至少加粗/下划线），让学生在纸面上也能看到重点。',
        all_black: '保持全黑，省墨且不依赖彩色打印机；重点词在纸上不区分。',
        bold_black: '打印时红色改为黑色加粗，兼顾黑白打印机和重点可见。',
    },
};

questions.decide__animation = {
    type: 'choice',
    instructions: '卡片入场动画应该怎么处理？参考 `suggestions.animation_simplify` 和 `suggestions.will_change`。',
    criteria: {
        keep_js_stagger: '保留现在的 JS 逐张延迟入场，只删掉重复的 CSS 动画。',
        css_only: '改为纯 CSS：用 nth-child 或 animation-delay 变量做交错，JS 不再逐张 setTimeout。',
        remove: '去掉入场动画，卡片直接显示，首屏最快。',
    },
};

questions.decide__font = {
    type: 'choice',
    instructions: '霞鹜文楷字体的加载方式应该怎么选？参考 `suggestions.font_selfhost`、`project.audience` 和 `project.maintainer`。',
    criteria: {
        keep_cdn: '继续用 jsDelivr 完整字体包，不改。',
        selfhost_subset: '构建时按数据中实际出现的汉字生成子集，自托管在 Cloudflare Pages；每次新增内容后重新生成子集。',
        system_font_first: '把系统楷体（KaiTi/STKaiti）放在字体栈前面，Web 字体只作为补充。',
    },
};

questions.decide__dead_code = {
    type: 'choice',
    instructions: '`suggestions.dead_code` 提到的渲染缓存和动态加载逻辑应该怎么处理？注意 `project.data` 里说页面互不相通。',
    criteria: {
        delete_now: '现在就删掉，并同步更新 CLAUDE.md 里对这些机制的描述。',
        keep_for_future_nav: '保留，因为将来可能恢复年级导航栏，届时会用到。',
    },
};

questions.decide__data_format = {
    type: 'choice',
    instructions: '数据存储格式应该怎么走？参考 `project.data`、`project.maintainer` 和 `suggestions.data_validation`。',
    criteria: {
        keep_js_add_check: '保留 window.dataXX 的 JS 文件（同步预加载即时渲染），只增加校验脚本和统一格式。',
        migrate_json: '迁移为 JSON 文件用 fetch 加载，格式更严格，但首屏要多一次请求。',
    },
};

questions.decide__testing = {
    type: 'choice',
    instructions: '这个项目应该引入哪种程度的自动化检查？参考 `project.testing` 和 `project.maintainer`。',
    criteria: {
        none: '维持手工验证，不加任何脚本。',
        data_check_only: '只加数据校验脚本（日期、重复、字段、标签），几秒跑完，纳入 build。',
        check_plus_browser_smoke: '数据校验之外，再加 Playwright 冒烟测试覆盖主题切换、搜索高亮、打印排序。',
    },
};

// ---------- 调用 ----------

const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state, model: 'jev-latest', questions }),
});

if (!response.ok) {
    console.error(`TypeSafe API 返回 ${response.status}`);
    console.error(await response.text());
    process.exit(1);
}

const result = await response.json();
const answers = result.answers;

// ---------- 输出 ----------

const topLevel = PRIORITY_LEVELS.length - 1;
const ranked = Object.keys(suggestions)
    .map(id => {
        const a = answers[`priority__${id}`];
        return { id, score: a.score, confidence: a.confidence, level: Math.round(a.score) };
    })
    .sort((x, y) => y.score - x.score);

console.log(`模型: ${result.model}\n`);
console.log('== 建议优先级（Score 0-3，越高越紧迫）==');
for (const r of ranked) {
    const bar = '#'.repeat(Math.round((r.score / topLevel) * 20)).padEnd(20, '.');
    console.log(`${r.score.toFixed(2)} ${bar} conf ${r.confidence.toFixed(2)}  ${r.id}  → L${r.level}: ${PRIORITY_LEVELS[r.level].split('：')[0]}`);
}

console.log('\n== 取舍判断（Choice）==');
for (const key of Object.keys(questions).filter(k => k.startsWith('decide__'))) {
    const a = answers[key];
    const probs = Object.entries(a.probabilities)
        .sort((x, y) => y[1] - x[1])
        .map(([k, v]) => `${k} ${(v * 100).toFixed(0)}%`)
        .join(', ');
    const flag = a.confidence < 0.4 ? '  (低置信度，建议人工拍板)' : '';
    console.log(`${key.replace('decide__', '')}: ${a.choice}  [${probs}]  conf ${a.confidence.toFixed(2)}${flag}`);
}

console.log(`\ntokens: in ${result.usage.input_tokens}, out ${result.usage.output_tokens}`);

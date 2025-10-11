
// Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-34CHGZKTMN');

// 当前数据和配置
let currentEntries = [];
let currentGrade = '41';
const loadedData = new Map(); // 缓存已加载的数据

// 年级配置
const gradeConfig = {
    '31': { dataFile: 'data/31data.js', dataVar: 'data31', title: '三年级上' },
    '32': { dataFile: 'data/32data.js', dataVar: 'data32', title: '三年级下' },
    '41': { dataFile: 'data/41data.js', dataVar: 'data41', title: '四年级上' }
};

// 动态加载数据文件
async function loadGradeData(grade) {
    // 如果数据已缓存，直接返回
    if (loadedData.has(grade)) {
        return loadedData.get(grade);
    }

    const config = gradeConfig[grade];
    if (!config) {
        throw new Error(`未知年级: ${grade}`);
    }

    // 首先检查数据是否已经在全局变量中存在（包括预加载的数据）
    if (window[config.dataVar] && Array.isArray(window[config.dataVar])) {
        const data = window[config.dataVar];
        loadedData.set(grade, data);
        console.log(`✓ 使用已存在的 ${grade} 数据，共 ${data.length} 条`);
        return data;
    }

    // 如果数据不存在，则动态加载
    return new Promise((resolve, reject) => {
        // 检查是否已经有相同的脚本正在加载
        const existingScript = document.querySelector(`script[src="${config.dataFile}"]`);
        if (existingScript) {
            // 等待已存在的脚本完成加载
            const waitForData = () => {
                if (window[config.dataVar] && Array.isArray(window[config.dataVar])) {
                    const data = window[config.dataVar];
                    loadedData.set(grade, data);
                    resolve(data);
                } else {
                    setTimeout(waitForData, 100);
                }
            };
            waitForData();
            return;
        }

        // 创建新的script标签
        const script = document.createElement('script');
        script.src = config.dataFile;

        script.onload = () => {
            // 等待一个短暂的时间确保脚本执行完成
            setTimeout(() => {
                const data = window[config.dataVar];
                if (data && Array.isArray(data)) {
                    loadedData.set(grade, data);
                    console.log(`✓ 成功加载 ${grade} 数据，共 ${data.length} 条`);
                    resolve(data);
                } else {
                    const error = new Error(`数据加载失败: ${config.dataVar} 不存在或不是数组`);
                    console.error(error.message);
                    reject(error);
                }
            }, 50);
        };

        script.onerror = (event) => {
            const error = new Error(`文件加载失败: ${config.dataFile}`);
            console.error(error.message, event);
            reject(error);
        };

        console.log(`正在加载 ${grade} 数据文件: ${config.dataFile}`);
        document.head.appendChild(script);
    });
}

// 切换年级功能
async function switchGrade(grade) {
    // 防止重复点击
    if (currentGrade === grade) return;

    console.log(`开始切换到年级: ${grade}`);

    try {
        // 显示加载状态
        showLoadingState();

        // 加载数据
        console.log(`正在加载 ${grade} 年级数据...`);
        currentEntries = await loadGradeData(grade);
        console.log(`成功加载 ${grade} 年级数据，共 ${currentEntries.length} 条`);

        currentGrade = grade;

        // 更新页面标题
        document.title = `每日积累 - ${gradeConfig[grade].title}`;

        // 更新导航按钮状态
        updateNavButtons(grade);

        // 清空搜索
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            currentSearch = '';
        }

        // 重新创建卡片
        createCards(false); // 快速模式，无动画
        console.log(`年级切换完成: ${grade}`);

    } catch (error) {
        console.error('切换年级失败:', error);
        showErrorState(`切换年级失败: ${error.message}`);

        // 如果切换失败，保持原来的年级状态
        if (currentEntries && currentEntries.length > 0) {
            createCards(false);
        }
    } finally {
        hideLoadingState();
    }
}

// 优化的导航按钮更新
function updateNavButtons(activeGrade) {
    document.querySelectorAll('.nav-link').forEach(btn => {
        const isActive = btn.dataset.grade === activeGrade;
        btn.className = `nav-link px-3 py-1.5 text-sm rounded-lg transition-colors ${
            isActive 
                ? 'bg-green-500 text-white hover:bg-green-600 active'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-green-100 dark:hover:bg-green-900 hover:text-green-700 dark:hover:text-green-300'
        }`;
    });
}

// 显示加载状态
function showLoadingState() {
    const cardView = document.getElementById('cardView');
    cardView.innerHTML = '<div class="flex justify-center items-center py-12"><div class="text-lg text-gray-500 dark:text-gray-400">正在加载...</div></div>';
}

// 隐藏加载状态
function hideLoadingState() {
    // 由createCards函数接管显示
}

// 显示错误状态
function showErrorState(message) {
    const cardView = document.getElementById('cardView');
    cardView.innerHTML = `<div class="flex justify-center items-center py-12"><div class="text-lg text-red-500">加载失败: ${message}</div></div>`;
}

// 统一的创建卡片函数
function createCards(withAnimation = true) {
    const cardView = document.getElementById('cardView');
    cardView.innerHTML = '';

    if (!currentEntries || currentEntries.length === 0) {
        cardView.innerHTML = '<div class="flex justify-center items-center py-12"><div class="text-lg text-gray-500 dark:text-gray-400">暂无数据</div></div>';
        return;
    }

    // 检查是否是打印预览
    const isPrinting = window.matchMedia('print').matches || document.body.classList.contains('is-printing');

    // 根据打印状态决定排序方式，不修改原数组
    const sortedEntries = [...currentEntries].sort((a, b) => {
        return isPrinting
            ? new Date(a.date) - new Date(b.date)  // 打印时按日期升序
            : new Date(b.date) - new Date(a.date); // 正常显示时按日期降序
    });

    sortedEntries.forEach((entry, index) => {
        const card = document.createElement('div');
        card.className = withAnimation ? 'card rounded-lg p-6 fade-in' : 'card rounded-lg p-6';
        card.setAttribute('data-date', entry.date);

        const dateObj = new Date(entry.date);
        const formattedDate = dateObj.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        }).replace(/(\d+)[\/\-](\d+)[\/\-](\d+)/, '$1年$2月$3日');

        // 添加编号
        const entryNumber = sortedEntries.length - (isPrinting ? sortedEntries.length - index - 1 : index);
        card.innerHTML = `
            <div class="relative h-full flex flex-col">
                <div class="mb-3">
                    <span class="date-label text-xl"><span class="font-bold text-xl">${entryNumber}. </span> 每日积累 ${formattedDate}</span>
                </div>
${entry.title ? `<h3 class="text-lg font-bold mb-2 dark-title">${entry.title}</h3>` : ''}                <div class="prose text-lg flex-grow">
                    ${entry.content}
                </div>
                </div>
            `;

        cardView.appendChild(card);
    });

    // 如果需要动画效果
    if (withAnimation) {
        requestAnimationFrame(() => {
            const cards = cardView.querySelectorAll('.card');
            cards.forEach((card, index) => {
                const delay = Math.min(index * 50, 500); // 限制最大延迟
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, delay);
            });
        });
    } else {
        // 快速显示，无动画
        requestAnimationFrame(() => {
            const cards = cardView.querySelectorAll('.card');
            cards.forEach(card => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            });
        });
    }
}

// 深色模式切换
function toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme');
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);

    // 同步 Tailwind 的 dark: 变体
    if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    localStorage.setItem('theme', newTheme); // 保存用户偏好
    updateThemeIcon(newTheme);
}

// 更新主题图标
function updateThemeIcon(theme) {
    const themeToggle = document.querySelector('.theme-toggle');
    themeToggle.innerHTML = ''; // 清空现有图标
    const icon = document.createElement('i');
    icon.classList.add('fas');
    if (theme === 'dark') {
        icon.classList.add('fa-moon', 'text-blue-300');
    } else {
        icon.classList.add('fa-sun', 'text-yellow-500');
    }
    themeToggle.appendChild(icon);
}

// 检查系统/本地存储颜色模式并设置初始主题和图标
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);

    // 同步 Tailwind 的 dark: 变体
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }

    updateThemeIcon(theme);
}

// 监听打印事件
window.addEventListener('beforeprint', function() {
    document.body.classList.add('is-printing');
    createCards(); // 重新创建卡片以应用打印排序
});

window.addEventListener('afterprint', function() {
    document.body.classList.remove('is-printing');
    createCards(); // 恢复正常排序
});

// 搜索功能
let currentSearch = '';

function highlightCardContent(card, searchTerm) {
    if (!searchTerm) return;

    const lowerSearch = searchTerm.toLowerCase();
    if (!lowerSearch) return;

    const searchLength = lowerSearch.length;
    const showText = window.NodeFilter ? NodeFilter.SHOW_TEXT : 4;
    const walker = document.createTreeWalker(card, showText, null);
    const textNodes = [];

    while (walker.nextNode()) {
        textNodes.push(walker.currentNode);
    }

    textNodes.forEach(node => {
        const text = node.textContent;
        const lowerText = text.toLowerCase();

        if (!lowerText.includes(lowerSearch)) {
            return;
        }

        const fragment = document.createDocumentFragment();
        let remainingText = text;
        let remainingLower = lowerText;

        while (true) {
            const index = remainingLower.indexOf(lowerSearch);
            if (index === -1) break;

            if (index > 0) {
                fragment.appendChild(document.createTextNode(remainingText.slice(0, index)));
            }

            const matchedText = remainingText.slice(index, index + searchLength);
            const highlightSpan = document.createElement('span');
            highlightSpan.className = 'search-highlight';
            highlightSpan.textContent = matchedText;
            fragment.appendChild(highlightSpan);

            remainingText = remainingText.slice(index + searchLength);
            remainingLower = remainingLower.slice(index + searchLength);
        }

        if (remainingText) {
            fragment.appendChild(document.createTextNode(remainingText));
        }

        node.parentNode.replaceChild(fragment, node);
    });
}

function updateCardVisibility() {
    document.querySelectorAll('.card').forEach(card => {
        if (!card.dataset.originalHtml) {
            card.dataset.originalHtml = card.innerHTML;
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = card.dataset.originalHtml;
            card.dataset.originalText = (tempContainer.textContent || '').toLowerCase();
        }

        const searchTerm = currentSearch;
        const originalHtml = card.dataset.originalHtml;

        if (!searchTerm) {
            card.innerHTML = originalHtml;
            card.style.display = '';
            return;
        }

        const matches = card.dataset.originalText.includes(searchTerm);

        if (!matches) {
            card.style.display = 'none';
            return;
        }

        card.style.display = '';
        card.innerHTML = originalHtml;
        highlightCardContent(card, searchTerm);
    });
}

// 初始化页面
async function initPage() {
    initTheme();

    try {
        console.log('开始初始化，默认年级:', currentGrade);

        // 检查默认年级数据是否已预加载
        if (window.data41 && Array.isArray(window.data41)) {
            console.log('发现预加载的41年级数据，共', window.data41.length, '条');
            currentEntries = window.data41;
            loadedData.set('41', window.data41);

            // 直接显示数据，无需异步加载
            createCards(true); // 带动画
            console.log('初始化完成');
        } else {
            // 如果没有预加载数据，则异步加载
            await switchGrade(currentGrade);
            console.log('初始化完成');
        }
    } catch (error) {
        console.error('初始化失败:', error);
        showErrorState(`初始化失败: ${error.message}`);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initPage();

    // 搜索功能
    document.getElementById('searchInput').addEventListener('input', e => {
        currentSearch = e.target.value.toLowerCase();
        updateCardVisibility();
    });

    // 返回顶部按钮功能
    initBackToTop();
});

// 返回顶部按钮初始化和控制
function initBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    let isScrolling = false;
    
    // 滚动检测和按钮显示逻辑
    function handleScroll() {
        if (isScrolling) return;
        
        requestAnimationFrame(() => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const shouldShow = scrollTop > 300; // 滚动超过300px时显示
            
            if (shouldShow) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
            
            isScrolling = false;
        });
        
        isScrolling = true;
    }
    
    // 监听滚动事件，使用节流优化性能
    window.addEventListener('scroll', handleScroll, { passive: true });
}

// 平滑滚动到顶部
function scrollToTop() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop === 0) return;
    
    // 使用现代浏览器的平滑滚动API
    if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    } else {
        // 兼容旧浏览器的动画滚动
        const scrollStep = Math.PI / (500 / 15);
        const cosParameter = scrollTop / 2;
        let scrollCount = 0;
        let scrollMargin = 0;
        
        function scrollAnimation() {
            if (window.pageYOffset !== 0) {
                scrollCount = scrollCount + 1;
                scrollMargin = cosParameter - cosParameter * Math.cos(scrollCount * scrollStep);
                window.scrollTo(0, (scrollTop - scrollMargin));
                requestAnimationFrame(scrollAnimation);
            }
        }
        
        scrollAnimation();
    }
}

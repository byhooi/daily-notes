
// Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag('js', new Date());
gtag('config', 'G-34CHGZKTMN');

// 当前数据和配置
let currentEntries = [];
let currentGrade = '42';
const loadingPromises = new Map(); // ???????????????
const renderedGradeCache = new Map(); // ????????????
const loadedData = new Map(); // 缓存已加载的数据
let isPrintingState = false; // 打印状态锁,防止打印时切换年级
let printEventListenersAdded = false; // 标记打印事件监听器是否已添加

// 年级配置
const gradeConfig = {
    '31': { dataFile: 'data/31data.js', dataVar: 'data31', title: '三年级上' },
    '32': { dataFile: 'data/32data.js', dataVar: 'data32', title: '三年级下' },
    '41': { dataFile: 'data/41data.js', dataVar: 'data41', title: '四年级上' },
    '42': { dataFile: 'data/42data.js', dataVar: 'data42', title: '四年级下' }
};

// 动态加载数据文件
async function loadGradeData(grade) {
    if (loadedData.has(grade)) {
        return loadedData.get(grade);
    }

    if (loadingPromises.has(grade)) {
        return loadingPromises.get(grade);
    }

    const config = gradeConfig[grade];
    if (!config) {
        throw new Error(`未知年级: ${grade}`);
    }

    if (window[config.dataVar] && Array.isArray(window[config.dataVar])) {
        const data = window[config.dataVar];
        loadedData.set(grade, data);
        return data;
    }

    const loadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = config.dataFile;
        script.async = true;

        script.onload = () => {
            const data = window[config.dataVar];
            if (data && Array.isArray(data)) {
                loadedData.set(grade, data);
                resolve(data);
                return;
            }

            reject(new Error(`数据加载失败: ${config.dataVar} 不存在或不是数组`));
        };

        script.onerror = () => {
            reject(new Error(`文件加载失败: ${config.dataFile}`));
        };

        document.head.appendChild(script);
    });

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('加载超时，请检查网络连接或刷新页面重试')), 10000)
    );

    const request = Promise.race([loadPromise, timeoutPromise]).finally(() => {
        loadingPromises.delete(grade);
    });

    loadingPromises.set(grade, request);
    return request;
}

function preloadGradeDataInBackground() {
    const gradesToPreload = Object.keys(gradeConfig).filter(grade => grade !== currentGrade);
    if (gradesToPreload.length === 0) return;

    const schedule = window.requestIdleCallback
        ? (task) => window.requestIdleCallback(task, { timeout: 1500 })
        : (task) => setTimeout(task, 300);

    schedule(() => {
        gradesToPreload.forEach((grade, index) => {
            setTimeout(() => {
                loadGradeData(grade).catch(error => {
                    console.warn(`预加载 ${grade} 年级数据失败:`, error);
                });
            }, index * 150);
        });
    });
}

function initGradePrefetch() {
    document.querySelectorAll('.nav-link').forEach(btn => {
        const grade = btn.dataset.grade;
        if (!grade) return;

        const prefetch = () => {
            if (grade !== currentGrade) {
                loadGradeData(grade).catch(() => { });
            }
        };

        btn.addEventListener('mouseenter', prefetch, { passive: true, once: true });
        btn.addEventListener('focus', prefetch, { passive: true, once: true });
        btn.addEventListener('touchstart', prefetch, { passive: true, once: true });
    });
}

function getRenderedCacheKey(grade, isPrinting) {
    return `${grade}:${isPrinting ? 'print' : 'screen'}`;
}

function applyCardDisplayState(cardView, withAnimation) {
    if (withAnimation) {
        requestAnimationFrame(() => {
            const cards = cardView.querySelectorAll('.card');
            cards.forEach((card, index) => {
                const delay = Math.min(index * 50, 500);
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, delay);
            });
        });
        return;
    }

    requestAnimationFrame(() => {
        const cards = cardView.querySelectorAll('.card');
        cards.forEach(card => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    });
}

function restoreRenderedGradeCache(grade, isPrinting, withAnimation) {
    const cacheKey = getRenderedCacheKey(grade, isPrinting);
    const cachedHtml = renderedGradeCache.get(cacheKey);
    if (!cachedHtml) {
        return false;
    }

    const cardView = document.getElementById('cardView');
    cardView.innerHTML = cachedHtml;
    applyCardDisplayState(cardView, withAnimation);
    return true;
}

// 切换年级功能
async function switchGrade(grade) {
    if (currentGrade === grade || isPrintingState) return;

    const config = gradeConfig[grade];
    const hasReadyData = loadedData.has(grade) || (config && window[config.dataVar] && Array.isArray(window[config.dataVar]));

    try {
        if (!hasReadyData) {
            showLoadingState();
        }

        currentEntries = await loadGradeData(grade);
        currentGrade = grade;
        document.title = `每日积累 - ${gradeConfig[grade].title}`;
        updateNavButtons(grade);

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
            currentSearch = '';
        }

        createCards(false);
    } catch (error) {
        console.error('切换年级失败:', error);
        showErrorState(`切换年级失败: ${error.message}`);

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
        btn.className = `nav-link px-3 py-1.5 text-sm rounded-lg transition-colors ${isActive
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
    const errorDiv = document.createElement('div');
    errorDiv.className = 'flex justify-center items-center py-12';
    const messageDiv = document.createElement('div');
    messageDiv.className = 'text-lg text-red-500';
    messageDiv.textContent = `加载失败: ${message}`; // 使用 textContent 防止 XSS
    errorDiv.appendChild(messageDiv);
    cardView.innerHTML = '';
    cardView.appendChild(errorDiv);
}

// 统一的创建卡片函数
function createCards(withAnimation = true) {
    const cardView = document.getElementById('cardView');

    if (!currentEntries || currentEntries.length === 0) {
        cardView.innerHTML = '<div class="flex justify-center items-center py-12"><div class="text-lg text-gray-500 dark:text-gray-400">暂无数据</div></div>';
        return;
    }

    const isPrinting = window.matchMedia('print').matches || document.body.classList.contains('is-printing');

    if (!withAnimation && restoreRenderedGradeCache(currentGrade, isPrinting, false)) {
        return;
    }

    cardView.innerHTML = '';

    const sortedEntries = [...currentEntries].sort((a, b) => {
        return isPrinting
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
    });

    const fragment = document.createDocumentFragment();

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

        const entryNumber = sortedEntries.length - (isPrinting ? sortedEntries.length - index - 1 : index);

        const cardInner = document.createElement('div');
        cardInner.className = 'relative h-full flex flex-col';

        const dateContainer = document.createElement('div');
        dateContainer.className = 'mb-3';
        const dateLabel = document.createElement('span');
        dateLabel.className = 'date-label text-xl';
        const numberSpan = document.createElement('span');
        numberSpan.className = 'font-bold text-xl';
        numberSpan.textContent = `${entryNumber}. `;
        dateLabel.appendChild(numberSpan);
        dateLabel.appendChild(document.createTextNode(` 每日积累 ${formattedDate}`));
        dateContainer.appendChild(dateLabel);
        cardInner.appendChild(dateContainer);

        if (entry.title) {
            const titleElem = document.createElement('h3');
            titleElem.className = 'text-lg font-bold mb-2 dark-title';
            titleElem.textContent = entry.title;
            cardInner.appendChild(titleElem);
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'prose text-lg flex-grow';
        contentDiv.innerHTML = entry.content;
        cardInner.appendChild(contentDiv);

        card.appendChild(cardInner);
        fragment.appendChild(card);
    });

    cardView.appendChild(fragment);

    cardView.querySelectorAll('.card').forEach(card => {
        if (!card.dataset.originalHtml) {
            card.dataset.originalHtml = card.innerHTML;
            card.dataset.originalText = (card.textContent || '').toLowerCase();
        }
    });

    renderedGradeCache.set(getRenderedCacheKey(currentGrade, isPrinting), cardView.innerHTML);
    applyCardDisplayState(cardView, withAnimation);
}

// 打印事件处理函数 - 使用命名函数以便管理
function handleBeforePrint() {
    isPrintingState = true;
    document.body.classList.add('is-printing');
    createCards(); // 重新创建卡片以应用打印排序
}

function handleAfterPrint() {
    isPrintingState = false;
    document.body.classList.remove('is-printing');
    createCards(); // 恢复正常排序
}

// 初始化打印事件监听器(仅一次)
function initPrintEventListeners() {
    if (printEventListenersAdded) return;

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    printEventListenersAdded = true;
}

// 搜索功能
let currentSearch = '';
let searchTimeout = null;

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
        // 原始数据已在 createCards() 中缓存,无需重复创建临时容器
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
        let detectedGrade = '42';
        for (const grade in gradeConfig) {
            if (window[gradeConfig[grade].dataVar] && Array.isArray(window[gradeConfig[grade].dataVar])) {
                detectedGrade = grade;
                break;
            }
        }
        currentGrade = detectedGrade;

        console.log('开始初始化，当前年级:', currentGrade);

        const dataVar = gradeConfig[currentGrade].dataVar;
        // 检查默认年级数据是否已预加载
        if (window[dataVar] && Array.isArray(window[dataVar])) {
            console.log(`发现预加载的${currentGrade}年级数据，共`, window[dataVar].length, '条');
            currentEntries = window[dataVar];
            loadedData.set(currentGrade, window[dataVar]);

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
document.addEventListener('DOMContentLoaded', function () {
    initPage();

    // 初始化打印事件监听器
    initPrintEventListeners();
    initGradePrefetch();
    preloadGradeDataInBackground();

    // 搜索功能 - 添加防抖优化
    document.getElementById('searchInput').addEventListener('input', e => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentSearch = e.target.value.toLowerCase();
            updateCardVisibility();
        }, 300); // 300ms 防抖延迟
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

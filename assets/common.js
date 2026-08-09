// 当前数据和配置
let currentEntries = [];
let currentGrade = '5A';
const loadingPromises = new Map(); // 进行中的加载请求,防止并发重复加载
const renderedGradeCache = new Map(); // 已渲染的卡片 HTML 缓存(key 为 `${grade}:screen|print`)
const loadedData = new Map(); // 缓存已加载的数据
let printEventListenersAdded = false; // 标记打印事件监听器是否已添加

// 年级配置
const gradeConfig = {
    '3A': { dataFile: 'data/3Adata.js', dataVar: 'data3A' },
    '3B': { dataFile: 'data/3Bdata.js', dataVar: 'data3B' },
    '4A': { dataFile: 'data/4Adata.js', dataVar: 'data4A' },
    '4B': { dataFile: 'data/4Bdata.js', dataVar: 'data4B' },
    '5A': { dataFile: 'data/5Adata.js', dataVar: 'data5A' }
};

// 按日期降序排序(最新在前),数据加载时只排一次,渲染时直接复用
function sortEntriesByDateDesc(data) {
    return data.sort((a, b) => new Date(b.date) - new Date(a.date));
}

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
        const data = sortEntriesByDateDesc(window[config.dataVar]);
        loadedData.set(grade, data);
        return data;
    }

    const request = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = config.dataFile;
        script.async = true;

        const timeoutId = setTimeout(() => {
            script.remove();
            reject(new Error('加载超时，请检查网络连接或刷新页面重试'));
        }, 10000);

        script.onload = () => {
            clearTimeout(timeoutId);
            const data = window[config.dataVar];
            if (data && Array.isArray(data)) {
                sortEntriesByDateDesc(data);
                loadedData.set(grade, data);
                resolve(data);
                return;
            }

            reject(new Error(`数据加载失败: ${config.dataVar} 不存在或不是数组`));
        };

        script.onerror = () => {
            clearTimeout(timeoutId);
            script.remove();
            reject(new Error(`文件加载失败: ${config.dataFile}`));
        };

        document.head.appendChild(script);
    }).finally(() => {
        loadingPromises.delete(grade);
    });

    loadingPromises.set(grade, request);
    return request;
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

// 显示加载状态
function showLoadingState() {
    const cardView = document.getElementById('cardView');
    cardView.innerHTML = '<div class="flex justify-center items-center py-12"><div class="text-lg text-gray-500 dark:text-gray-400">正在加载...</div></div>';
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

    // currentEntries 已在数据加载时按日期降序排好,打印时反转为最旧优先
    const sortedEntries = isPrinting ? [...currentEntries].reverse() : currentEntries;

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

        const entryNumber = isPrinting ? index + 1 : sortedEntries.length - index;

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
    document.body.classList.add('is-printing');
    createCards(); // 重新创建卡片以应用打印排序
}

function handleAfterPrint() {
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
    let visibleCount = 0;

    document.querySelectorAll('.card').forEach(card => {
        // 原始数据已在 createCards() 中缓存,无需重复创建临时容器
        const searchTerm = currentSearch;
        const originalHtml = card.dataset.originalHtml;

        if (!searchTerm) {
            card.innerHTML = originalHtml;
            card.style.display = '';
            visibleCount++;
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
        visibleCount++;
    });

    updateNoResultsMessage(visibleCount > 0);
}

// 搜索无匹配时显示提示,避免页面一片空白
function updateNoResultsMessage(hasVisibleCards) {
    const existing = document.getElementById('noResultsMessage');

    if (hasVisibleCards || !currentSearch) {
        if (existing) existing.remove();
        return;
    }

    if (existing) return;

    const message = document.createElement('div');
    message.id = 'noResultsMessage';
    message.className = 'flex justify-center items-center py-12';
    const text = document.createElement('div');
    text.className = 'text-lg text-gray-500 dark:text-gray-400';
    text.textContent = '没有找到相关内容，换个关键词试试吧';
    message.appendChild(text);
    document.getElementById('cardView').appendChild(message);
}

// 初始化页面
async function initPage() {
    initTheme();

    try {
        let detectedGrade = '5A';
        for (const grade in gradeConfig) {
            if (window[gradeConfig[grade].dataVar] && Array.isArray(window[gradeConfig[grade].dataVar])) {
                detectedGrade = grade;
                break;
            }
        }
        currentGrade = detectedGrade;

        // loadGradeData 会优先复用入口页同步预加载的 window 数据
        const config = gradeConfig[currentGrade];
        if (!(window[config.dataVar] && Array.isArray(window[config.dataVar]))) {
            showLoadingState();
        }
        currentEntries = await loadGradeData(currentGrade);
        createCards(true);
    } catch (error) {
        console.error('初始化失败:', error);
        showErrorState(`初始化失败: ${error.message}`);
    }
}

// 将预加载的字体样式表切换为生效状态(替代内联 onload 处理器,配合收紧后的 CSP)
document.querySelectorAll('link[rel="preload"][as="style"]').forEach(link => {
    link.rel = 'stylesheet';
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    initPage();

    // CSP 已移除 'unsafe-inline',所有事件统一在此绑定
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    const backToTopButton = document.getElementById('backToTop');
    if (backToTopButton) {
        backToTopButton.addEventListener('click', scrollToTop);
    }

    // 初始化打印事件监听器
    initPrintEventListeners();

    // 搜索功能 - 添加防抖优化及一键清除
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('input', e => {
            if (clearSearchBtn) {
                if (e.target.value.length > 0) {
                    clearSearchBtn.classList.remove('hidden');
                } else {
                    clearSearchBtn.classList.add('hidden');
                }
            }
            
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearch = e.target.value.toLowerCase();
                updateCardVisibility();
            }, 300); // 300ms 防抖延迟
        });
        
        if (clearSearchBtn) {
            clearSearchBtn.addEventListener('click', () => {
                searchInput.value = '';
                clearSearchBtn.classList.add('hidden');
                currentSearch = '';
                updateCardVisibility();
                searchInput.focus();
            });
        }
    }

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


// Google Analytics
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-34CHGZKTMN');

// 当前数据和配置
let currentEntries = data41;
let currentGrade = '41';

// 年级配置
const gradeConfig = {
    '31': { data: () => data31, title: '三年级上' },
    '32': { data: () => data32, title: '三年级下' },
    '41': { data: () => data41, title: '四年级上' }
};

// 切换年级功能
function switchGrade(grade) {
    // 防止重复点击
    if (currentGrade === grade) return;
    
    currentGrade = grade;
    currentEntries = gradeConfig[grade].data();
    
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
    
    // 快速重新创建卡片，不重复设置动画
    createCardsQuick();
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

// 快速创建卡片（不重复设置动画）
function createCardsQuick() {
    const cardView = document.getElementById('cardView');
    cardView.innerHTML = '';
    
    // 检查是否是打印预览
    const isPrinting = window.matchMedia('print').matches || document.body.classList.contains('is-printing');
    
    // 根据打印状态决定排序方式
    const sortedEntries = [...currentEntries].sort((a, b) => {
        return isPrinting 
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
    });
    
    sortedEntries.forEach((entry, index) => {
        const card = document.createElement('div');
        card.className = 'card rounded-lg p-6';
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
                <div class="mb-4">
                    <span class="date-label text-xl"><span class="font-bold text-xl">${entryNumber}. </span> 每日积累 ${formattedDate}</span>
                </div>
${entry.title ? `<h3 class="text-lg font-bold mb-3 dark-title">${entry.title}</h3>` : ''}                <div class="prose text-lg flex-grow">
                    ${entry.content}
                </div>
                </div>
            `;
        
        cardView.appendChild(card);
    });
    
    // 使用requestAnimationFrame优化动画性能
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
}

// 创建卡片的函数
function createCards() {
    const cardView = document.getElementById('cardView');
    cardView.innerHTML = '';
    
    // 检查是否是打印预览
    const isPrinting = window.matchMedia('print').matches || document.body.classList.contains('is-printing');
    
    // 根据打印状态决定排序方式
    if (isPrinting) {
        currentEntries.sort((a, b) => new Date(a.date) - new Date(b.date)); // 打印时按日期升序
    } else {
        currentEntries.sort((a, b) => new Date(b.date) - new Date(a.date)); // 正常显示时按日期降序
    }
    
    currentEntries.forEach((entry, index) => {
        const card = document.createElement('div');
        card.className = 'card rounded-lg p-6 fade-in';
        card.setAttribute('data-date', entry.date);
        
        const dateObj = new Date(entry.date);
        const formattedDate = dateObj.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        }).replace(/(\d+)[\/\-](\d+)[\/\-](\d+)/, '$1年$2月$3日');
        
        // 添加编号
        const entryNumber = currentEntries.length - (isPrinting ? currentEntries.length - index - 1 : index);
        card.innerHTML = `
            <div class="relative h-full flex flex-col">
                <div class="mb-4">
                    <span class="date-label text-xl"><span class="font-bold text-xl">${entryNumber}. </span> 每日积累 ${formattedDate}</span>
                </div>
${entry.title ? `<h3 class="text-lg font-bold mb-3 dark-title">${entry.title}</h3>` : ''}                <div class="prose text-lg flex-grow">
                    ${entry.content}
                </div>
                </div>
            `;
        
        cardView.appendChild(card);
    });
}

// 深色模式切换
function toggleTheme() {
    const theme = document.documentElement.getAttribute('data-theme');
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
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

function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

function updateCardVisibility() {
    document.querySelectorAll('.card').forEach(card => {
        // 保存原始内容（如果还没保存）
        if (!card.hasAttribute('data-original')) {
            card.setAttribute('data-original', card.innerHTML);
        }
        
        const originalContent = card.getAttribute('data-original');
        const searchTerm = currentSearch;
        
        if (!searchTerm) {
            // 如果没有搜索词，恢复原始内容
            card.innerHTML = originalContent;
            card.style.display = '';
            return;
        }

        // 检查是否匹配搜索词
        const textContent = card.textContent.toLowerCase();
        const matches = textContent.includes(searchTerm);
        
        if (!matches) {
            card.style.display = 'none';
            return;
        }

        // 显示卡片并高亮匹配文本
        card.style.display = '';
        let content = originalContent;
        card.innerHTML = highlightText(content, searchTerm);
    });
}

// 初始化页面
function initPage() {
    initTheme();
    createCards();

    const observer = new IntersectionObserver(
        entries => entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const delay = Math.min(Array.from(card.parentNode.children).indexOf(card) * 0.1, 1);
                card.style.setProperty('--animation-delay', `${delay}s`);
                card.classList.add('fade-in');
                observer.unobserve(card);
            }
        }), 
        { threshold: 0.15, rootMargin: '50px' }
    );

    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        observer.observe(card);
    });
}

// 优化滚动动画
document.addEventListener('DOMContentLoaded', function() {
    initPage();
    
    // 搜索功能
    document.getElementById('searchInput').addEventListener('input', e => {
        currentSearch = e.target.value.toLowerCase();
        updateCardVisibility();
    });
});
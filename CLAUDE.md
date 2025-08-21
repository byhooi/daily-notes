# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for managing and displaying Chinese language learning content ("每日积累" - Daily Accumulation). The project is designed as a GitHub Pages site for educational content, specifically for elementary school students to practice Chinese writing and reading.

## Architecture

### Core Structure
- **Multi-grade organization**: Content is organized by grade levels (三年级上/下, 四年级上/下)
- **Page-based architecture**: Each grade level has its own HTML page (index.html, 31.html, 32.html)
- **Shared components**: Common functionality is centralized in assets/common.js and assets/common.css
- **Data-driven**: Each page loads data from corresponding JS files in the data/ directory

### File Organization
```
├── data/           # Grade-specific content data files
│   ├── 31data.js   # 三年级上 (Grade 3, Semester 1)
│   ├── 32data.js   # 三年级下 (Grade 3, Semester 2)
│   ├── 41data.js   # 四年级上 (Grade 4, Semester 1)
│   └── 42data.js   # 四年级下 (Grade 4, Semester 2)
├── assets/         # Shared resources
│   ├── common.js   # Core functionality for all pages
│   ├── common.css  # Shared styling with dark mode support
│   └── webfonts/   # Font Awesome font files
├── index.html      # 四年级上 main page
├── 31.html         # 三年级上 page
├── 32.html         # 三年级下 page
└── admin.html      # Content generation interface
```

### Data Structure
Each data file exports an `entries` array with objects containing:
- `date`: Date string in YYYY-MM-DD format
- `title`: Optional title for the entry
- `content`: HTML content that can include lists, formatted text, and highlighted sections

### Key Features
- **Dark/Light theme toggle**: Persistent theme preference with localStorage
- **Search functionality**: Real-time content filtering across all entries
- **Print optimization**: Special layout for printing with proper pagination
- **Responsive design**: Mobile-friendly interface using Tailwind CSS
- **Content highlighting**: Support for red text highlighting using `<span class="highlight-red">`
- **Admin interface**: Tool for generating new content entries in proper format

### Technology Stack
- **Frontend**: Pure HTML/CSS/JavaScript (no build process)
- **Styling**: Tailwind CSS + custom CSS variables for theming
- **Icons**: Font Awesome (locally hosted)
- **Charts**: Mermaid.js for potential diagram support
- **Fonts**: LXGW WenKai (霞鹜文楷) + Noto fonts for Chinese text

## Development Workflow

### Adding New Content
1. Use admin.html to generate properly formatted content entries
2. Copy generated JavaScript object to appropriate data file
3. Follow the existing data structure format

### Modifying Styling
- Edit assets/common.css for global styles
- Theme colors use CSS custom properties
- Dark mode is handled via `data-theme` attribute on html element

### Adding New Grade Levels
1. Create new HTML file following existing pattern
2. Create corresponding data file in data/ directory
3. Update pageConfig in the HTML file

### Testing
- Test locally by opening HTML files directly in browser
- Verify dark/light theme switching
- Test search functionality with Chinese characters
- Check print layout (Ctrl+P) for proper formatting

## Deployment
- Deployed to GitHub Pages (daily.byhooi.tk)
- All resources are locally hosted (no external CDN dependencies)
- CNAME configured for custom domain
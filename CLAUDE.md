# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chinese educational website called "每日积累" (Daily Accumulation) that displays daily Chinese language learning content for elementary students. It's a static HTML site with JavaScript-driven interactivity, designed for grades 3 and 4.

## Architecture

### Core Structure
- **Frontend**: Vanilla HTML, CSS, JavaScript with TailwindCSS
- **Data Storage**: JavaScript files containing content arrays (`data/31data.js`, `data/32data.js`, `data/41data.js`)
- **Static Assets**: CSS, fonts, logos in `assets/` directory
- **Deployment**: Static site hosted on GitHub Pages (domain: `daily.yangbing.eu.org`)

### Key Components

#### Main Files
- `index.html`: Main viewing interface with grade navigation, search, and card display
- `admin.html`: Content generation tool for creating new daily entries
- `assets/common.js`: Core JavaScript functionality including:
  - Grade switching (`switchGrade()`)
  - Theme management (dark/light mode)
  - Search functionality with text highlighting
  - Card creation and animation
  - Print optimization (date sorting changes)
- `assets/common.css`: Styling with CSS custom properties for theming

#### Data Structure
Each data file exports an array of objects with:
```javascript
{
  date: "YYYY-MM-DD",
  title: "Optional title", // only some entries have this
  content: "HTML content" // can be plain text or HTML with lists
}
```

#### Special Features
- **Text Highlighting**: Content supports `##text##` markup for red highlighting
- **Grade Navigation**: Three grades supported (31, 32, 41) with dynamic switching
- **Responsive Design**: Mobile-first with TailwindCSS classes
- **Print Optimization**: Date sorting reverses for printing (oldest first vs newest first)
- **Search**: Real-time search with content highlighting
- **Theme Switching**: Dark/light mode with localStorage persistence

## Development Workflow

### Adding New Content
Use `admin.html` to generate properly formatted entries:
1. Select date and optionally add title
2. Enter content (one item per line)
3. Use `##text##` markup for red highlighting
4. Generate and copy formatted JavaScript object
5. Manually add to appropriate data file in `data/` directory

### Content Guidelines
- Content is Chinese elementary school language learning material
- Entries include literature excerpts, writing examples, and language exercises
- Full-width punctuation is automatically converted in admin tool
- HTML content supports ordered lists for multi-item entries

### File Organization
```
├── index.html           # Main interface
├── admin.html          # Content generation tool
├── assets/
│   ├── common.js       # Main JavaScript logic
│   ├── common.css      # Styling and themes
│   ├── tailwind.min.css # TailwindCSS framework
│   └── logo/          # Favicon and app icons
├── data/
│   ├── 31data.js      # Grade 3 semester 1 data
│   ├── 32data.js      # Grade 3 semester 2 data
│   └── 41data.js      # Grade 4 semester 1 data
└── CNAME              # GitHub Pages custom domain
```

## Key Functions and APIs

### JavaScript Functions
- `switchGrade(grade)`: Changes active grade and reloads content
- `createCards()`: Renders content cards with animation
- `toggleTheme()`: Switches between light/dark themes
- `updateCardVisibility()`: Handles search filtering and highlighting
- `scrollToTop()`: Smooth scroll to page top

### CSS Custom Properties
Theme colors defined in `:root` and `[data-theme="dark"]` selectors:
- `--background-color`, `--text-color`: Main colors
- `--card-background`, `--border-color`: Card styling
- `--accent-color`: Interactive elements (green theme)

## Development Commands

This is a static site with no build process. For development:

### Local Development
- Serve files with any static server (e.g., `python -m http.server` or Live Server extension)
- No compilation or build step required

### Deployment
- Automatically deployed via GitHub Pages
- Push to `main` branch triggers deployment
- Custom domain configured via CNAME file

### Testing
- Test manually in browser
- Verify theme switching works
- Test search functionality
- Check print preview for proper date ordering
- Verify mobile responsiveness

## Content Management Notes

- All content is in Chinese and educationally focused
- Dates should be in YYYY-MM-DD format for proper sorting
- When adding content with multiple items, use HTML ordered lists format
- The `##text##` markup for highlighting only works in admin.html generation
- Content should be appropriate for elementary school students
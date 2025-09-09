# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static educational website called "每日积累" (Daily Accumulation) for Chinese students. It displays daily learning content (essays, poems, vocabulary) in a card-based layout. The site is hosted on GitHub Pages and features:

- **Single Page Application (SPA)** with grade navigation
- Multi-grade content support (三年级上/下, 四年级上)
- Dark/light theme toggle with system preference detection
- Real-time search and filtering functionality
- Print-optimized layout with chronological ordering
- Responsive design using Tailwind CSS
- Performance-optimized navigation and card rendering

## Development Commands

Since this is a static site, there are no build commands. The project is deployed via GitHub Pages automatically on push to main branch.

### Local Development
- Open `index.html` directly in browser for testing
- Use Live Server extension in VS Code for hot reload during development

### Deployment
- Push to main branch - GitHub Pages auto-deploys
- Site is accessible at https://daily.yangbing.eu.org

## Architecture & File Structure

### Core Files Structure
```
/
├── index.html         # Single page application with grade navigation
├── admin.html         # Content generation tools
├── assets/
│   ├── common.js      # SPA logic, navigation, search, theme management
│   ├── common.css     # Shared styling, CSS variables & font definitions
│   ├── tailwind.min.css  # CSS framework
│   └── logo/          # Logo assets (logo.jpg)
└── data/
    ├── 41data.js      # 四年级上 content data
    ├── 31data.js      # 三年级上 content data
    └── 32data.js      # 三年级下 content data
```

### Data Architecture

Content is stored in JavaScript files as arrays of objects:
```javascript
const entries = [
  {
    date: "2025-01-02",
    title: "Optional title",
    content: "HTML content with formatting"
  }
];
```

### Theme System

Uses CSS custom properties with automatic light/dark detection:
- Theme stored in localStorage with fallback to system preference
- All colors defined as CSS variables in `:root` and `[data-theme="dark"]`
- Theme switching handled by `toggleTheme()` in common.js

### Single Page Application Logic

The app now operates as a unified SPA with the following key features:

#### Grade Navigation System
- **Grade switching**: `switchGrade()` function dynamically switches between data sets
- **Current data**: Managed via `currentEntries` and `currentGrade` variables
- **Grade configuration**: `gradeConfig` object defines data sources and titles
- **Performance optimization**: Uses `createCardsQuick()` for fast switching without re-animations

#### Content Display Logic
Cards are dynamically generated with dual rendering modes:
- **Normal view**: Newest entries first (date descending) with fade-in animations
- **Print view**: Chronological order (date ascending) optimized for printing
- **Search**: Real-time filtering with text highlighting and visibility toggling
- **Numbered entries**: Dynamic numbering that adjusts based on view mode

## Key Components

### Common JavaScript (`assets/common.js`)
Core SPA functionality:
- **Grade Management**: `switchGrade()`, `updateNavButtons()`, grade configuration
- **Card Rendering**: `createCards()` and `createCardsQuick()` with performance optimizations
- **Theme System**: `toggleTheme()`, `initTheme()`, `updateThemeIcon()` with localStorage persistence
- **Search Engine**: Real-time search with `highlightText()` and `updateCardVisibility()`
- **Print Handling**: Automatic reordering for print view with event listeners
- **Animation System**: Intersection Observer for progressive card loading

### Styling System
- **Primary**: Tailwind CSS for layout and utilities
- **Custom CSS**: Theme variables, card styling, and Chinese fonts in `common.css`
- **Typography**: Chinese-optimized font stack with LXGW WenKai and Noto fonts
- **Icons**: Font Awesome for UI elements

### Admin Tools (`admin.html`)
Content generation interface with:
- AI-powered content generation
- Date selection and formatting
- Copy-to-clipboard functionality for easy data file updates

## Content Management

### Adding New Entries
1. Edit appropriate data file (`data/31data.js`, `data/32data.js`, or `data/41data.js`)
2. Add new object to respective `data31`, `data32`, or `data41` array
3. Each entry requires `date` (YYYY-MM-DD format) and `content` fields
4. Optional `title` field for entry headers
5. Content supports HTML formatting including ordered/unordered lists
6. The SPA will automatically include new entries without page structure changes

### Extending Grade Support
1. Create new data file (e.g., `data/42data.js`) following existing patterns
2. Define new data array (e.g., `const data42 = [...]`)
3. Add new grade to `gradeConfig` object in `common.js`:
   ```javascript
   '42': { data: () => data42, title: '四年级下' }
   ```
4. Add navigation button to `index.html` with proper `data-grade` attribute
5. Include new data file in script tags section

### Data Structure Guidelines
Each entry object follows this structure:
```javascript
{
  date: "2025-01-02",        // Required: YYYY-MM-DD format for sorting
  title: "Optional title",   // Optional: Displays as card header
  content: "HTML content"    // Required: Main content with HTML support
}
```

## Design Guidelines

### Color Scheme
- **Light theme**: Soft grays with green accent (#48bb78)
- **Dark theme**: Blue-grays with lighter green accent (#68d391)
- All colors use CSS custom properties for theme consistency

### Typography
Chinese-first font stack prioritizing readability:
- Primary: 'LXGW WenKai' (recommended for Chinese educational content)
- Fallbacks: System Chinese fonts (STKaiti, Microsoft YaHei, etc.)

### Layout Principles
- **Single Page Design**: All content accessible through navigation without page reloads
- **Card-based Layout**: Rounded corners and subtle shadows for content organization
- **Performance Focus**: Optimized rendering with `requestAnimationFrame` and minimal DOM manipulation
- **Responsive Grid**: Auto-adjusting layout that stacks on mobile devices
- **Print Optimization**: Automatic reordering and styling adjustments for print media
- **Progressive Loading**: Intersection Observer for smooth scroll animations
- **Search Integration**: Real-time filtering with preserved scroll position

## Performance Considerations

### Navigation Optimization
- **Fast Switching**: `createCardsQuick()` bypasses animation setup for grade changes
- **Memory Management**: Reuses DOM elements where possible
- **Animation Limits**: Maximum delay caps prevent excessive animation queuing
- **Debounced Search**: Real-time search with efficient text highlighting

### Loading Strategy
- **All Data Preloaded**: All grade data loaded upfront for instant switching
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Lazy Animations**: Cards animate only when entering viewport
- **Minimal Reflows**: Batch DOM operations for better performance
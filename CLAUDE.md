# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Chinese language educational content management system for elementary school students' daily learning materials. The project displays daily literary compositions and writing exercises in a card-based interface with search functionality and theme switching.

## Architecture

### File Structure
- **Main Pages**: `index.html` (4th grade), `31.html` (3rd grade semester 1), `32.html` (3rd grade semester 2)
- **Data Files**: `{number}data.js` - Contains daily entries with date, title, and content
- **Shared Components**: `common.js`, `common.css` - Core functionality and styling
- **Admin Interface**: `admin.html` - Content generation tool for creating new entries

### Data Structure
Each data file contains an `entries` array with objects:
```javascript
{
  date: "YYYY-MM-DD",
  title: "Optional title",
  content: "HTML content or plain text"
}
```

### Core Components
- **Card Display System**: Renders entries as responsive cards with fade-in animations
- **Search Functionality**: Real-time search with text highlighting
- **Theme System**: Dark/light mode with localStorage persistence
- **Print Optimization**: Special CSS for printing with date-based sorting
- **Content Generator**: Admin tool for creating properly formatted entries

## Development Workflow

### Adding New Content
1. Use `admin.html` to generate new entries with proper formatting
2. Copy generated code to appropriate data file
3. Ensure entries follow the established structure

### Styling Conventions
- Uses CSS custom properties for theming
- Chinese typography focus with LXGW WenKai font
- Responsive design with Tailwind CSS
- Print-optimized styles override normal display

### JavaScript Patterns
- Modular functions in `common.js`
- Event delegation for dynamic content
- Intersection Observer for scroll animations
- LocalStorage for theme persistence

## Key Features
- Real-time search with highlighting
- Responsive design for mobile/desktop
- Print-friendly layout with proper sorting
- Dark/light theme support
- Chinese typography optimization
- Content generation tools

## Browser Support
- Modern browsers with CSS custom property support
- Requires JavaScript for full functionality
- Mobile-responsive design

## External Dependencies
- Tailwind CSS (CDN)
- Font Awesome icons (CDN)
- Google Fonts (LXGW WenKai, Noto Sans SC)
- Mermaid diagrams (CDN)
- Google Analytics (gtag.js)
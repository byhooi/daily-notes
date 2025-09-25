# Repository Guidelines

## Project Structure & Module Organization
The site is a static single-page app served from `index.html`, which loads grade data arrays from `data/*.js` through `assets/common.js`.
`admin.html` is a helper interface for composing entries before pasting them back into the relevant `dataXY.js` file.
Static styling and client logic live under `assets/`: `tailwind.min.css` and `common.css` handle layout, while `common.js` covers grade switching, search, and theming. Icons and manifest files reside in `assets/logo/`.

## Build, Test, and Development Commands
No build pipeline is required; commit-ready assets are already minified.
For local preview, run `python -m http.server 8000` from the repo root and open `http://localhost:8000/index.html`.
Serve `admin.html` through the same command when generating content so relative asset paths resolve cleanly.

## Coding Style & Naming Conventions
Follow the existing four-space indentation in HTML and JavaScript, and keep array literals formatted one object per block for readability.
Data modules are named `<grade>data.js` (for example `41data.js`) and expose a `const data<grade>` array; keep the pattern when adding grades.
Use double quotes for strings, ISO `YYYY-MM-DD` dates, and embed emphasis with `##word##` markup when red text is required (see the `admin.html` tooltip).

## Testing Guidelines
Manually refresh `index.html` after edits to confirm new entries render, search functions, and theme toggling still work.
Sanity-check the `admin.html` generator whenever the form or formatting changes, copying the preview back into the target data file.
When adding large batches, spot-verify chronological ordering in both normal view and browser print preview.

## Commit & Pull Request Guidelines
Existing history favors brief imperative messages (`add`, `更新 41data.js`); mirror that style and mention the affected grade when updating data.
Provide pull request descriptions that summarise scope, list touched files, and include screenshots or GIFs if the UI changes.
Link tracking issues when available and call out any manual verification steps so reviewers can reproduce them quickly.

## Content Maintenance Tips
Insert new objects at the top of the relevant `data` array to keep reverse chronological order, matching how `common.js` sorts.
Ensure Unicode punctuation survives minification and avoid trailing commas that would break legacy browsers.
Before publishing, adjust `CNAME` or asset references only if the deployment domain changes; otherwise leave existing settings untouched.

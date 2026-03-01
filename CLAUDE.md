# CLAUDE.md

## Project Overview

GitHub Link Preview is a Chrome extension (Manifest V3) that shows elegant preview popups when hovering over GitHub repository links on any webpage. It fetches repo metadata from the GitHub REST API and displays stars, forks, language, description, author avatar, and last commit date.

- **Published on Chrome Web Store** as `github-link-preview`
- **Zero runtime dependencies** — only dev dependencies
- **Version:** 0.0.4 (package.json) / 0.1.0 (manifest)

## Quick Reference

```bash
npm run dev          # Start Vite dev server for extension development
npm run build        # Production build → dist/
npm run test         # Run tests once (vitest run)
npm run test:watch   # Run tests in watch mode
npm run lint         # ESLint on src/
npm run format       # Prettier on src/**/*.{ts,css,html}
npm run type-check   # TypeScript strict check (tsc --noEmit)
```

## Project Structure

```
src/
├── manifest.json              # Chrome extension manifest (v3)
├── background/index.ts        # Service worker (install event logging)
├── content/                   # Content script — injected into web pages
│   ├── index.ts               # Entry point, initializes PopupManager
│   ├── content.css            # Popup styling
│   ├── github-link-detector.ts  # URL parsing, repo link validation
│   ├── popup-manager.ts       # Hover detection, popup lifecycle
│   ├── popup-renderer.ts      # Popup DOM generation
│   └── popup-positioner.ts    # Viewport-aware positioning
├── popup/                     # Extension toolbar popup UI
│   ├── index.html / index.ts / popup.css
├── options/                   # Extension options page
│   ├── index.html / index.ts / options.css
├── services/
│   └── github-api.ts          # GitHub REST API client
├── types/
│   └── index.ts               # Shared TypeScript interfaces
└── utils/
    ├── storage.ts             # Chrome Storage API wrapper
    ├── format.ts              # Number/date formatting helpers
    └── language-colors.ts     # Language → hex color map

tests/                         # Unit tests (Vitest + jsdom)
├── format.test.ts
├── github-api.test.ts
├── github-link-detector.test.ts
└── popup-positioner.test.ts

public/images/                 # Extension icons (16/32/48/128px)
scripts/                       # Python utility scripts for asset resizing
```

## Architecture

The extension follows Chrome Manifest V3 conventions with four entry points:

1. **Content Script** (`src/content/`) — Runs on all pages. Detects GitHub links, manages hover-triggered popups via `PopupManager`, renders popup UI, and positions it relative to the link.
2. **Background Service Worker** (`src/background/`) — Minimal; logs extension install events.
3. **Popup UI** (`src/popup/`) — Toolbar popup with enable/disable toggle and link to options.
4. **Options Page** (`src/options/`) — Configures GitHub token and popup delay.

Data flows: content script detects hover → calls `github-api.ts` to fetch repo data → `popup-renderer.ts` builds DOM → `popup-positioner.ts` places it on screen.

### Key Types

- `GitHubRepoInfo` — Repository metadata from the API
- `ExtensionSettings` — User configuration (`enabled`, `githubToken`, `popupDelay`)

### Settings Defaults

| Setting      | Default | Description                                |
| ------------ | ------- | ------------------------------------------ |
| `enabled`    | `true`  | Master on/off toggle                       |
| `githubToken`| `""`    | Optional GitHub PAT for higher rate limits |
| `popupDelay` | `500`   | Milliseconds before popup appears on hover |

## Tech Stack

- **TypeScript 5.9** — Strict mode, ES2020 target, bundler module resolution
- **Vite 7** + **@crxjs/vite-plugin** — Build and hot reload for Chrome extensions
- **Vitest 4** — Testing with jsdom environment, globals enabled
- **ESLint 10** — Flat config, typescript-eslint recommended rules
- **Prettier 3** — Code formatting

## Code Style and Conventions

### Formatting (Prettier)

- Semicolons: **yes**
- Quotes: **double quotes** (not single)
- Trailing commas: **all**
- Print width: **80**
- Tab width: **2 spaces**

### Linting (ESLint)

- Flat config format (`eslint.config.js`)
- `@typescript-eslint/no-unused-vars` errors, but ignores `_`-prefixed args
- Browser and WebExtensions globals enabled
- `dist/`, `node_modules/`, `scripts/` directories are ignored

### TypeScript

- Strict mode enabled
- Path alias: `@/` maps to `src/`
- Use `@/` imports in source files (e.g., `import { getSettings } from "@/utils/storage"`)

### Testing

- Tests live in `tests/` at the project root (not alongside source files)
- Test files follow the pattern `<module-name>.test.ts`
- Vitest globals are enabled — no need to import `describe`, `it`, `expect`
- jsdom environment for DOM testing
- Chrome API is mocked in tests (see `github-api.test.ts` for patterns)

## Development Workflow

1. `npm install` to install dependencies
2. `npm run dev` to start the Vite dev server
3. Load `dist/` as an unpacked extension in `chrome://extensions/`
4. Make changes — Vite provides hot reload for the extension

### Before Committing

Run all checks:

```bash
npm run type-check && npm run lint && npm run test
```

### Building for Production

```bash
npm run build    # Output in dist/
```

The `dist/` directory is uploaded to the Chrome Web Store for publishing.

## GitHub API Integration

- Endpoint: `https://api.github.com/repos/{owner}/{repo}`
- API version header: `2022-11-28`
- Authentication: Optional Bearer token from extension settings
- No auth needed for public repos (but rate-limited to 60 req/hour)
- With token: 5,000 req/hour

## Chrome Permissions

- `storage` — Persist user settings via `chrome.storage.sync`
- `host_permissions` — `https://api.github.com/` for API calls
- Content scripts match `<all_urls>` to detect GitHub links on any page

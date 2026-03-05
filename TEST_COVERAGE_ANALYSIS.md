# Test Coverage Analysis

## Current State

**Framework:** Vitest 4.0.18 with jsdom environment
**Total test files:** 4
**Total test cases:** 35

### Coverage Report (v8)

| File | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines |
|------|---------|----------|---------|---------|-----------------|
| **All files** | **86.88** | **94.44** | **90** | **86.44** | |
| content/github-link-detector.ts | 100 | 100 | 100 | 100 | |
| content/popup-positioner.ts | 53.84 | 100 | 50 | 53.84 | 31-42 |
| services/github-api.ts | 88.88 | 90 | 100 | 88.88 | 26, 35 |
| utils/format.ts | 100 | 100 | 100 | 100 | |

> **Important:** The above only reflects files that are _imported by tests_. The following source files have **0% coverage** and do not appear in the report at all:

| Untested File | Lines of Code | Reason Missing |
|---------------|---------------|----------------|
| `src/content/popup-renderer.ts` | 48 | No test file |
| `src/content/popup-manager.ts` | 115 | No test file |
| `src/utils/language-colors.ts` | 26 | No test file |
| `src/utils/storage.ts` | 41 | No test file |
| `src/popup/index.ts` | UI script | No test file |
| `src/options/index.ts` | UI script | No test file |
| `src/background/index.ts` | Trivial | No test file |

---

## Proposed Improvements

### 1. `popup-renderer.ts` — High Priority

**Why:** This is the core rendering function that generates the popup HTML users see. Bugs here (missing fields, broken HTML, XSS from unsanitized data) are directly user-facing.

**Suggested tests:**
- Renders a popup `<div>` with `id="preview-popup"`
- Displays the repo full name and visibility badge
- Displays the description
- Shows stars and forks with formatted numbers (e.g., `1,000` not `1000`)
- Shows last commit in relative date format
- Shows the language with correct color when `language` is provided
- Omits the language span entirely when `language` is `null`
- Handles edge cases: empty description, very long names

### 2. `language-colors.ts` — Medium Priority

**Why:** Simple pure function, easy to test, and catches regressions if the color map is modified.

**Suggested tests:**
- Returns correct hex color for each known language (JavaScript, TypeScript, Python, etc.)
- Returns the fallback color `#bbbbbb` for unknown/unsupported languages
- Returns the fallback color for empty string input

### 3. `popup-positioner.ts` (`applyPosition`) — Medium Priority

**Why:** `calculatePosition` is well-tested (4 tests), but `applyPosition` (lines 31-42) has 0% coverage. This function wires the calculation to the DOM.

**Suggested tests:**
- Sets `popup.style.top` and `popup.style.left` based on calculated position
- Reads `getBoundingClientRect()` from both anchor and popup elements
- Reads viewport dimensions from `window`

### 4. `github-api.ts` (uncovered branches) — Medium Priority

**Why:** Lines 26 and 35 represent two untested error paths: a non-404/non-403 HTTP error, and the case where the API returns invalid (non-object) data.

**Suggested tests:**
- Returns null when the API responds with a 500 status
- Returns null when the API returns `null` or a non-object body

### 5. `storage.ts` — Medium Priority

**Why:** Wraps Chrome storage APIs. Requires mocking `chrome.storage.sync` and `chrome.storage.onChanged`, but validates the settings layer that popup-manager depends on.

**Suggested tests:**
- `getSettings()` returns defaults when storage is empty
- `getSettings()` returns stored values
- `saveSettings()` calls `chrome.storage.sync.set` with the provided settings
- `onSettingsChange()` invokes callback only for `sync` namespace changes
- `onSettingsChange()` filters to only known setting keys
- `onSettingsChange()` does not invoke callback when no recognized keys changed

### 6. `popup-manager.ts` — High Priority (but complex)

**Why:** This is the most complex module in the codebase. It manages state (enabled/disabled, hover tracking, timeouts), orchestrates all other modules (detector, renderer, positioner, API, storage), and handles mouse events. Bugs here cause the popup to appear when it shouldn't, not appear when it should, or linger after the user moves away.

**Suggested tests:**
- `init()` loads settings and registers mouseover/mouseout listeners
- `init()` subscribes to settings changes and updates internal state
- Mouseover on a non-GitHub link does not trigger a popup
- Mouseover on a GitHub repo link creates a popup after `popupDelay` ms
- Mouseout before `popupDelay` cancels the pending popup
- Mouseout after popup is shown schedules removal after 300ms
- Popup stays visible when mouse moves from link to popup
- Popup is removed when mouse leaves both link and popup
- When `isEnabled` is false, mouseover is a no-op
- Hovering a new link removes the previous popup

> **Note:** Testing popup-manager requires mocking several dependencies (`fetchRepoInfo`, `renderPopup`, `applyPosition`, `getSettings`, `onSettingsChange`) and using Vitest fake timers for the delay/timeout logic.

---

## Summary

| Priority | File | Effort | Impact |
|----------|------|--------|--------|
| High | `popup-renderer.ts` | Low | High — user-facing output |
| High | `popup-manager.ts` | High | High — core orchestration logic |
| Medium | `language-colors.ts` | Very Low | Low — simple but easy win |
| Medium | `popup-positioner.ts` (`applyPosition`) | Low | Medium — completes existing suite |
| Medium | `github-api.ts` (remaining branches) | Low | Medium — error path robustness |
| Medium | `storage.ts` | Medium | Medium — settings reliability |

Implementing proposals 1-4 would bring actual coverage from ~55% of all source code to roughly 85%+, with the biggest effort-to-impact ratio coming from `popup-renderer.ts` and `language-colors.ts`.

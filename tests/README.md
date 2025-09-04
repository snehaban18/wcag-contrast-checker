# WCAG Contrast Checker Extension Tests

This folder contains automated tests for the WCAG Contrast Checker Chrome extension using Playwright.

## Test Structure

- `fixtures/extension.js`: Helper functions to load the Chrome extension in Playwright
- `popup.spec.js`: Tests for the extension popup functionality
- `content.spec.js`: Tests for the content script functionality
- `context-menu.spec.js`: Tests for the context menu functionality

## Running Tests

Before running tests, make sure you have built the extension:

```bash
npm run build
```

Then run the tests:

```bash
npx playwright test
```

To run a specific test file:

```bash
npx playwright test tests/popup.spec.js
```

To run tests in debug mode:

```bash
npx playwright test --debug
```

## Test Reports

After running tests, you can view the HTML report:

```bash
npx playwright show-report
```

## Notes on Testing Chrome Extensions

Testing Chrome extensions has some limitations:
- Context menu testing is limited as Playwright doesn't fully support right-click context menus
- Chrome extension APIs are not fully available in the test environment
- Some tests may need to be run manually to verify full functionality

These tests focus on the core functionality that can be automated.

# WCAG Contrast Checker Chrome Extension

A Chrome extension that checks text color contrast according to WCAG 2.1 AA and AAA standards. This tool helps web developers and designers ensure their content meets accessibility requirements for color contrast.

## Features

- Check contrast between text color and background color
- Evaluate compliance with WCAG 2.1 AA and AAA standards
- Two ways to check contrast:
  - Through the extension popup with color pickers
  - Via context menu by right-clicking on selected text
- Real-time contrast ratio calculation
- Visual pass/fail indicators for different compliance levels

## Installation

### Development Mode

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the extension:
   ```
   npm run build
   ```
4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top-right corner
   - Click "Load unpacked" and select the `dist` folder from this project

## How to Use

### Method 1: Using the Popup

1. Click on the extension icon in your browser toolbar
2. If you have text selected on the current page, the extension will automatically detect the text and background colors
3. If no text is selected, the popup will show default colors (black text on white background)
4. You can manually adjust colors using the color pickers or by entering hex values
5. View the contrast ratio and WCAG compliance results in real-time

### Method 2: Using the Context Menu

1. Select text on any webpage
2. Right-click and select "Check Color Contrast" from the context menu
3. View the results in an overlay on the webpage
4. The results will also be available in the popup if you click the extension icon

## WCAG 2.1 Contrast Requirements

- **AA Level**:
  - Normal text (less than 18pt): 4.5:1 minimum contrast ratio
  - Large text (18pt or 14pt bold and larger): 3:1 minimum contrast ratio

- **AAA Level**:
  - Normal text (less than 18pt): 7:1 minimum contrast ratio
  - Large text (18pt or 14pt bold and larger): 4.5:1 minimum contrast ratio

## Development

### Project Structure

This project is built with:
- Vite for building the extension
- Vanilla JavaScript for the extension logic
- Chrome Extension APIs for browser integration

### Key Files

- `manifest.json` - Extension configuration and permissions
- `src/index.html` - Popup interface HTML
- `src/popup.js` - Popup functionality and UI logic
- `src/utils.js` - Utility functions for color calculations and WCAG compliance
- `src/content.js` - Content script for extracting colors from selected text
- `src/background.js` - Background script for context menu functionality

### Testing

The extension includes automated tests using Playwright. To run the tests, execute the following command:
```
npm run test
``` 


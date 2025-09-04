// WCAG Contrast Checker - Combined content.js with utils.js

// Utils.js functions
// Utility functions for WCAG Contrast Checker extension

// WCAG 2.1 contrast ratio thresholds
const WCAG_AA_NORMAL_TEXT = 4.5;
const WCAG_AA_LARGE_TEXT = 3.0;
const WCAG_AAA_NORMAL_TEXT = 7.0;
const WCAG_AAA_LARGE_TEXT = 4.5;

// Default colors and text
const DEFAULT_TEXT_COLOR = '#000000';  // Black
const DEFAULT_BG_COLOR = '#FFFFFF';    // White
const DEFAULT_SAMPLE_TEXT = 'Sample Text';

// Function to validate hex color
function isValidHex(hex) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

// Function to convert RGB to hex
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Function to convert hex to RGB
function hexToRgb(hex) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Function to calculate relative luminance
function calculateLuminance(rgb) {
  // Convert RGB values to sRGB
  const sRGB = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  
  // Calculate luminance using the formula from WCAG 2.1
  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

// Function to calculate contrast ratio
function calculateContrastRatio(luminance1, luminance2) {
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Function to evaluate WCAG compliance
function evaluateWcagCompliance(contrastRatio) {
  return {
    AA: {
      largeText: contrastRatio >= WCAG_AA_LARGE_TEXT,
      normalText: contrastRatio >= WCAG_AA_NORMAL_TEXT
    },
    AAA: {
      largeText: contrastRatio >= WCAG_AAA_LARGE_TEXT,
      normalText: contrastRatio >= WCAG_AAA_NORMAL_TEXT
    }
  };
}

// Function to extract colors from selected text
function extractColorsFromSelection(selection) {
  // Get the selection range
  const range = selection.getRangeAt(0);
  
  // Always use the first text node's parent when multiple elements are selected
  let node = range.startContainer;
  
  // If it's not a text node, find the first text node within the selection
  if (node.nodeType !== Node.TEXT_NODE) {
    const walker = document.createTreeWalker(
      range.commonAncestorContainer,
      NodeFilter.SHOW_TEXT,
      { acceptNode: (node) => NodeFilter.FILTER_ACCEPT },
      false
    );
    
    let textNode = walker.nextNode();
    if (textNode) {
      node = textNode;
    }
  }
  
  // Get the parent if it's a text node
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode;
  }
  
  // Get computed styles directly from the selected element
  const computedStyle = window.getComputedStyle(node);
  const textColor = computedStyle.color;
  const bgColor = computedStyle.backgroundColor;
  
  // If background is transparent (rgba(0, 0, 0, 0)), traverse up the DOM to find a non-transparent background
  let currentNode = node;
  let currentBgColor = bgColor;
  
  while (currentBgColor === 'rgba(0, 0, 0, 0)' || currentBgColor === 'transparent') {
    currentNode = currentNode.parentNode;
    
    // Stop at body if we've gone that far
    if (!currentNode || currentNode === document.body) {
      // Use white as default if we reach the body with no background
      currentBgColor = window.getComputedStyle(document.body).backgroundColor;
      if (currentBgColor === 'rgba(0, 0, 0, 0)' || currentBgColor === 'transparent') {
        currentBgColor = 'rgb(255, 255, 255)';
      }
      break;
    }
    
    currentBgColor = window.getComputedStyle(currentNode).backgroundColor;
  }
  
  // Parse RGB values
  const textRgb = parseRgbString(textColor);
  const bgRgb = parseRgbString(currentBgColor);
  
  return { textColor: textRgb, backgroundColor: bgRgb };
}

// Helper function to get color value in the appropriate format
function getColorValue(color) {
  if (typeof color === 'object' && color !== null) {
    return rgbToHex(color.r, color.g, color.b);
  }
  return color;
}

// Function to parse RGB string like "rgb(255, 255, 255)" or "rgba(255, 255, 255, 0.5)"
function parseRgbString(rgbStr) {
  // Handle rgb format
  let matches = rgbStr.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (matches) {
    return {
      r: parseInt(matches[1], 10),
      g: parseInt(matches[2], 10),
      b: parseInt(matches[3], 10)
    };
  }
  
  // Handle rgba format
  matches = rgbStr.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (matches) {
    // For rgba, we ignore the alpha channel for contrast calculations
    return {
      r: parseInt(matches[1], 10),
      g: parseInt(matches[2], 10),
      b: parseInt(matches[3], 10)
    };
  }
  
  // Handle named colors
  if (rgbStr === 'transparent') {
    return { r: 255, g: 255, b: 255 }; // Treat transparent as white
  }
  
  // For any other format or if parsing fails, default to black
  return { r: 0, g: 0, b: 0 };
}

// Function to analyze contrast and return results
function analyzeContrast(textColor, bgColor) {
  const textLuminance = calculateLuminance(textColor);
  const bgLuminance = calculateLuminance(bgColor);
  
  const contrastRatio = calculateContrastRatio(textLuminance, bgLuminance);
  const compliance = evaluateWcagCompliance(contrastRatio);
  
  return {
    textColor: textColor,
    backgroundColor: bgColor,
    contrastRatio: contrastRatio.toFixed(2),
    compliance: compliance
  };
}

// Helper function to generate compliance results HTML
function generateComplianceHTML(level, compliance) {
  // Get the appropriate threshold values based on level
  const normalTextThreshold = level === 'AA' ? WCAG_AA_NORMAL_TEXT : WCAG_AAA_NORMAL_TEXT;
  const largeTextThreshold = level === 'AA' ? WCAG_AA_LARGE_TEXT : WCAG_AAA_LARGE_TEXT;
  
  return `
    <strong>WCAG 2.1 ${level}:</strong><br>
    Large text (${largeTextThreshold}:1): <span class="${compliance.largeText ? 'text-green-600' : 'text-red-600'}">${compliance.largeText ? '✓ Pass' : '✗ Fail'}</span><br>
    Normal text (${normalTextThreshold}:1): <span class="${compliance.normalText ? 'text-green-600' : 'text-red-600'}">${compliance.normalText ? '✓ Pass' : '✗ Fail'}</span>
  `;
}

// Function to process text selection and return formatted results
function processTextSelection(selection) {
  if (!selection || selection.isCollapsed) {
    return null;
  }
  
  const selectedText = selection.toString();
  const colors = extractColorsFromSelection(selection);
  const results = analyzeContrast(colors.textColor, colors.backgroundColor);
  
  // Add selected text to results
  results.selectedText = selectedText;
  
  // Format colors for display
  return formatResultsForDisplay(results);
}

// Function to format results with proper color formats for display
function formatResultsForDisplay(results) {
  // Convert RGB objects to hex format
  const textColorHex = getColorValue(results.textColor);
  const bgColorHex = getColorValue(results.backgroundColor);
  
  // Create a copy of results with hex color values
  return {
    ...results,
    textColor: textColorHex,
    backgroundColor: bgColorHex
  };
}





// Content.js code
// This script only works on the open page, processing selected text and sending response to popup.

// Import the necessary functions from utils.js

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "checkContrast") {
    const selection = window.getSelection();
    const results = processTextSelection(selection);
    
    // Simply send back the results, let the caller decide what to do with them
    sendResponse(results || { status: "no_selection" });
    return false; // We've already called sendResponse
  }
  return false; // Not handling this message
});

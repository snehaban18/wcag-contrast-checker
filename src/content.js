// This script only works on the open page, processing selected text and sending response to popup.

// Import the necessary functions from utils.js
import { processTextSelection } from './utils.js';

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

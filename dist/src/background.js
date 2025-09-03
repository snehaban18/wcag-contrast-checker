// Create context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "checkContrast",
    title: "Check Color Contrast",
    contexts: ["selection"]
  });
});

// Handle context menu click
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "checkContrast" && info.selectionText) {
    // Send message to content script to analyze the selected text
    chrome.tabs.sendMessage(tab.id, {
      action: "checkContrastFromSelection",
      selection: info.selectionText
    });
    
    // Open the popup after sending the message to content script
    chrome.action.openPopup();
  }
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getContrastResult") {
    // Store results in chrome storage for persistence between popup reopens
    chrome.storage.local.set({ contrastResults: message.results }, () => {
      // Send response after storage operation completes
      sendResponse({ status: "success" });
    });
    return true; // Indicate we will respond asynchronously
  }
  return false; // Not handling this message asynchronously
});

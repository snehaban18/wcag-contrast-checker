// Create context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "checkContrastMenuItem",
    title: "Check Color Contrast",
    contexts: ["selection"]
  });
});

// Handle context menu click - simply open the popup
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "checkContrastMenuItem" && info.selectionText) {
    // Open the popup - it will check for selected text on its own
    chrome.action.openPopup();
  }
});

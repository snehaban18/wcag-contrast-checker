// Content script for WCAG Contrast Checker extension

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle request to get selected text from popup
  if (message.action === "getSelectedText") {
    const selection = window.getSelection();
    const resultsForPopup = processTextSelection(selection);
    
    // Send response back to popup
    sendResponse(resultsForPopup || { selectedText: null });
    return false; // Synchronous response
  }
  
  // Handle request to check contrast from context menu
  else if (message.action === "checkContrastFromSelection") {
    const selection = window.getSelection();
    const resultsForPopup = processTextSelection(selection);
    
    if (resultsForPopup) {
      // Send results to background script
      chrome.runtime.sendMessage({
        action: "getContrastResult",
        results: resultsForPopup
      }, (response) => {
        // Handle response if needed
        if (response && response.status === "success") {
          // Inject results overlay after successful storage
          // Note: We need to use the original results object with RGB values for the overlay
          const originalResults = {
            textColor: resultsForPopup.textColor,
            backgroundColor: resultsForPopup.backgroundColor,
            contrastRatio: resultsForPopup.contrastRatio,
            compliance: resultsForPopup.compliance,
            selectedText: resultsForPopup.selectedText
          };
          injectResults(originalResults);
        }
      });
      
      // Indicate we're handling the message synchronously
      sendResponse({ status: "processing" });
    } else {
      // No valid selection
      sendResponse({ status: "no_selection" });
    }
    return false; // We've already called sendResponse
  }
  return false; // Not handling this message
});

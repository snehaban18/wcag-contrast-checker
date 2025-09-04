// Popup script for WCAG Contrast Checker extension
import { 
  isValidHex, 
  hexToRgb, 
  calculateLuminance, 
  calculateContrastRatio, 
  evaluateWcagCompliance, 
  generateComplianceHTML,
  DEFAULT_TEXT_COLOR,
  DEFAULT_BG_COLOR,
  DEFAULT_SAMPLE_TEXT
} from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  const textColorInput = document.getElementById('text-color');
  const bgColorInput = document.getElementById('bg-color');
  const textHexInput = document.getElementById('text-hex');
  const bgHexInput = document.getElementById('bg-hex');
  const displayText = document.getElementById('display-text');
  const contrastRatio = document.getElementById('contrast-ratio');
  const aaNormal = document.getElementById('aa-normal');
  const aaaNormal = document.getElementById('aaa-normal');

  // On init, always check for any current selection
  checkForSelectedText();

  // Add event listeners for color inputs
  textColorInput.addEventListener('input', () => {
    textHexInput.value = textColorInput.value;
    displayText.style.color = textColorInput.value;
    calculateContrast();
  });

  bgColorInput.addEventListener('input', () => {
    bgHexInput.value = bgColorInput.value;
    displayText.style.backgroundColor = bgColorInput.value;
    calculateContrast();
  });

  // Add event listeners for hex inputs
  textHexInput.addEventListener('input', () => {
    if (isValidHex(textHexInput.value)) {
      textColorInput.value = textHexInput.value;
      displayText.style.color = textHexInput.value;
      calculateContrast();
    }
  });

  bgHexInput.addEventListener('input', () => {
    if (isValidHex(bgHexInput.value)) {
      bgColorInput.value = bgHexInput.value;
      displayText.style.backgroundColor = bgHexInput.value;
      calculateContrast();
    }
  });

  
  // HELPER FUNCTIONS

  // Function to set default colors and text
  function setDefaults() {
    updateUIWithColors(textColorInput, bgColorInput, DEFAULT_TEXT_COLOR, DEFAULT_BG_COLOR);
    updateUIWithColors(textHexInput, bgHexInput, DEFAULT_TEXT_COLOR, DEFAULT_BG_COLOR);
    displayText.textContent = DEFAULT_SAMPLE_TEXT;
    calculateContrast();
  }
  
  // Function to update UI elements with color values
  function updateUIWithColors(textElement, bgElement, textColor, bgColor) {
    if (textElement) textElement.value = textColor;
    if (bgElement) bgElement.value = bgColor;
  }

  // Function to update UI with colors and text from results
  function updateUIWithResults(results) {
    updateUIWithColors(textColorInput, bgColorInput, results.textColor, results.backgroundColor);
    updateUIWithColors(textHexInput, bgHexInput, results.textColor, results.backgroundColor);
    
    if (results.selectedText) {
      displayText.textContent = results.selectedText;
      displayText.style.color = results.textColor;
      displayText.style.backgroundColor = results.backgroundColor;
    }    
    updateResults(parseFloat(results.contrastRatio), results.compliance);
  }
  
  function checkForSelectedText() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        // Send a message to the content script to get any selected text and check contrast
        chrome.tabs.sendMessage(tabs[0].id, { 
          action: "checkContrast"
        }, (response) => {
          // If there was an error (like content script not loaded), just continue
          if (chrome.runtime.lastError) {
            setDefaults();
            return;
          }
          
          if (response && response.selectedText) {
            updateUIWithResults(response);
          } 
          else {
            setDefaults();
          }
        });
      }
    });
  }

  // Function to calculate contrast ratio
  function calculateContrast() {
    const textColor = hexToRgb(textColorInput.value);
    const bgColor = hexToRgb(bgColorInput.value);
    
    const textLuminance = calculateLuminance(textColor);
    const bgLuminance = calculateLuminance(bgColor);
    
    const ratio = calculateContrastRatio(textLuminance, bgLuminance);
    const compliance = evaluateWcagCompliance(ratio);
    
    updateResults(ratio, compliance);
  }

  // Function to update results in the UI
  function updateResults(ratio, compliance) {
    contrastRatio.textContent = `Contrast: ${ratio.toFixed(2)}:1`;
    aaNormal.innerHTML = generateComplianceHTML('AA', compliance.AA); 
    aaaNormal.innerHTML = generateComplianceHTML('AAA', compliance.AAA); 
  }
});

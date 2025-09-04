import { test as base, chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extension test fixture that loads the Chrome extension
 */
export const test = base.extend({
  context: async ({}, use) => {
    // Get the path to the extension
    const extensionPath = path.join(__dirname, '../../dist');
    
    // Launch browser with the extension
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    });
    
    // Wait for the extension to initialize
    await context.waitForEvent('serviceworker');
    
    // Get the extension ID using service workers
    const serviceWorkers = context.serviceWorkers();
    let extensionId = null;
    
    if (serviceWorkers.length > 0) {
      const serviceWorkerUrl = serviceWorkers[0].url();
      extensionId = serviceWorkerUrl.split('/')[2];
    } 
    else {
      // Fallback: Try to get the extension ID from the manifest
      const page = await context.newPage();
      await page.goto('chrome://extensions/');
      
      // Get the extension ID from the extensions page
      extensionId = await page.evaluate(() => {
        const extensions = document.querySelectorAll('extensions-item');
        for (const extension of extensions) {
          if (extension.querySelector('.name').textContent.includes('WCAG Contrast Checker')) {
            return extension.id;
          }
        }
        return null;
      });
      
      await page.close();
    }
    
    if (!extensionId) {
      throw new Error('Could not determine extension ID');
    }
    
    // Store the extension ID for later use
    context.extensionId = extensionId;
    console.log('Extension ID:', extensionId);
    
    await use(context);
    await context.close();
  },
  
  // Expose the extension ID to the test
  extensionId: async ({ context }, use) => {
    await use(context.extensionId);
  },
  
  // Create a page that loads the extension popup
  popupPage: async ({ context, extensionId }, use) => {
    const page = await context.newPage();
    await page.goto(`chrome-extension://${extensionId}/src/index.html`);
    await use(page);
  },
});

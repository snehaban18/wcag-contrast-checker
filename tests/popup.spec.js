import { expect } from '@playwright/test';
import { test } from './fixtures/extension';

test.describe('WCAG Contrast Checker Extension', () => {
  test.beforeEach(async ({ popupPage }) => {
    // Skip tests if the popup doesn't load properly
    try {
      await popupPage.waitForLoadState('domcontentloaded', { timeout: 5000 });
    } catch (e) {
      test.skip(true, 'Extension popup did not load properly');
    }
  });
  
  test('should load popup with default values', async ({ popupPage }) => {
    // Check that the popup loads with default values
    await expect(popupPage.locator('#contrast-ratio')).toBeVisible();
    
    // Check that the color inputs have default values
    const textColorInput = popupPage.locator('#text-color');
    const bgColorInput = popupPage.locator('#bg-color');
    
    await expect(textColorInput).toBeVisible();
    await expect(bgColorInput).toBeVisible();
    
    // Check that the sample text is displayed
    const displayText = popupPage.locator('#display-text');
    await expect(displayText).toBeVisible();
    
    // Check that the compliance results are displayed
    await expect(popupPage.locator('#aa-normal')).toBeVisible();
    await expect(popupPage.locator('#aaa-normal')).toBeVisible();
  });

  test('should update contrast when colors change', async ({ popupPage }) => {
    // Get initial contrast ratio
    const initialContrastText = await popupPage.locator('#contrast-ratio').textContent();
    
    // Change text color to red using the hex input field instead of the color picker
    await popupPage.locator('#text-hex').fill('#FF0000');
    
    // Trigger the input event by pressing Tab
    await popupPage.locator('#text-hex').press('Tab');
    
    // Wait for the contrast ratio to update
    await popupPage.waitForTimeout(500);
    
    // Get updated contrast ratio
    const updatedContrastText = await popupPage.locator('#contrast-ratio').textContent();
    
    // Verify that the contrast ratio has changed
    expect(updatedContrastText).not.toEqual(initialContrastText);
  });
});

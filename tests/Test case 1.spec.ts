import { test, expect } from '@playwright/test';

const BASE_URL = 'http://jupiter.cloud.planittesting.com/#/contact';

test('Contact form validation - mandatory fields', async ({ page }) => {
  // Step 1 & 2: Navigate to contact page
  await  page.goto(BASE_URL);
  
  // Step 3: Click submit button without filling fields
  await page.locator('a:has-text("Submit")').click();
  
  // Step 4: Verify error messages appear
  await expect(page.locator('text=Forename is required')).toBeVisible();
  await expect(page.locator('text=Email is required')).toBeVisible();
  await expect(page.locator('text=Message is required')).toBeVisible();
  
  // Step 5: Populate mandatory fields
  await page.fill('input[placeholder="John"]', 'John Doe');
  await page.fill('input[placeholder="john.example@planit.net.au"]', 'john@example.com');
  await page.fill('textarea[placeholder="Tell us about it.."]', 'This is a test message');
  
  // Step 6: Click submit button after filling mandatory fields
  await page.locator('a:has-text("Submit")').click();
  
  // Verify error messages are gone
  await expect(page.locator('text=Forename is required')).not.toBeVisible();
  await expect(page.locator('text=Email is required')).not.toBeVisible();
  await expect(page.locator('text=Message is required')).not.toBeVisible();
  
  // Verify success message appears
  await page.waitForSelector('text=we appreciate your feedback', { timeout: 10000 });
  await expect(page.locator('text=we appreciate your feedback')).toBeVisible();
});



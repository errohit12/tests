import { test, expect } from '@playwright/test';

const BASE_URL = 'http://jupiter.cloud.planittesting.com/#/contact';

/**
 * Test Case 2: Contact Form - Successful Submission
 * 
 * Steps:
 * 1. From the home page go to contact page
 * 2. Populate mandatory fields
 * 3. Click submit button
 * 4. Validate successful submission message
 * 5. Run this test 5 times to ensure 100% pass rate
 * 
 * Run command: 
 * npx playwright test "Test case 2.spec.ts"--repeat-each=5 --workers=1
 */

test.skip(({ browserName }) => browserName !== 'chromium', 'Run only on chromium');

test('Test case 2 - Contact form successful submission', async ({ page }) => {
  // Step 1: From the home page go to contact page
  await page.goto(BASE_URL);
  
  // Step 2: Populate mandatory fields
  await page.fill('input[placeholder="John"]', 'Sarah Johnson');
  await page.fill('input[placeholder="john.example@planit.net.au"]', 'sarah.johnson@example.com');
  await page.fill('textarea[placeholder="Tell us about it.."]', 'Excellent customer service and quality products. Highly recommend!');
  
  // Step 3: Click submit button
  await page.locator('a:has-text("Submit")').click();
  
  // Step 4: Validate successful submission message
  await page.waitForSelector('text=we appreciate your feedback', { timeout: 20000 });
  await expect(page.locator('text=we appreciate your feedback')).toBeVisible();
  
  // Verify back link is available
  await expect(page.locator('text=« Back')).toBeVisible();
});

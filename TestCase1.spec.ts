import { test, expect } from '@playwright/test';
import { ContactPage } from './tests/pages/contactPage';

const APP_URL = 'http://jupiter.cloud.planittesting.com';

// Application URL: http://jupiter.cloud.planittesting.com

test('Contact form validation - mandatory fields (OOP)', async ({ page }) => {
  const contact = new ContactPage(page);
  await contact.goto();

  // Submit without filling fields
  await contact.submitEmpty();

  // Verify validation messages
  await expect(contact.forenameError).toBeVisible();
  await expect(contact.emailError).toBeVisible();
  await expect(contact.messageError).toBeVisible();

  // Fill mandatory fields and resubmit
  await contact.fillMandatoryFields('John Doe', 'john@example.com', 'This is a test message');
  await contact.submit();

  // Verify errors are gone and success message appears
  await expect(contact.forenameError).not.toBeVisible();
  await expect(contact.emailError).not.toBeVisible();
  await expect(contact.messageError).not.toBeVisible();
  await expect(contact.successMessage).toBeVisible({ timeout: 20000 });
  await expect(contact.successMessage).toContainText(/we appreciate your feedback/i);
});

// test
import { test, expect } from '@playwright/test';

const BASE_SHOP = 'http://jupiter.cloud.planittesting.com/#/shop';
const BASE_CART = 'http://jupiter.cloud.planittesting.com/#/cart';

// Product definitions and expected unit prices
const PRODUCTS = [
  { name: 'Stuffed Frog', qty: 2, price: 10.99 },
  { name: 'Fluffy Bunny', qty: 5, price: 9.99 },
  { name: 'Valentine Bear', qty: 3, price: 14.99 },
];

// Helper to format price like "$10.99"
function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

// Run only on chromium to avoid SSL/webkit flakiness in this environment
test.skip(({ browserName }) => browserName !== 'chromium', 'Run only on chromium');

test('Cart subtotals and total are correct', async ({ page }) => {
  // Step 1: Go to shop page
  await page.goto(BASE_SHOP);
  await page.waitForLoadState('networkidle');

  // Add products to cart by clicking "Buy" the required number of times
  for (const p of PRODUCTS) {
    const card = page.locator('h4', { hasText: p.name }).locator('..');
    const buy = card.locator('a:has-text("Buy")');
    for (let i = 0; i < p.qty; i++) {
      await buy.click();
      // small pause to allow Angular handlers to process and update cart
      await page.waitForTimeout(200);
    }
  }

  // Step 2: Navigate to cart via the Cart link so the SPA processes updates
  const cartLink = page.locator('a', { hasText: 'Cart' });
  await cartLink.first().click();
  await page.waitForLoadState('networkidle');

  // Step 3 & 4: Verify each product row - unit price and subtotal
  let expectedTotal = 0;
  for (const p of PRODUCTS) {
    const row = page.locator('table tbody tr').filter({ has: page.locator('td', { hasText: p.name }) });
    await expect(row).toHaveCount(1);

    // Assuming columns: Product | Price | Quantity | Subtotal
    const priceText = await row.locator('td').nth(1).innerText();
    const qtyText = await row.locator('td').nth(2).locator('input').inputValue().catch(async ()=> (await row.locator('td').nth(2).innerText()).trim());
    const subtotalText = await row.locator('td').nth(3).innerText();

    expect(priceText.trim()).toBe(fmt(p.price));
    expect(Number(qtyText)).toBe(p.qty);

    const expectedSub = +(p.price * p.qty).toFixed(2);
    expect(subtotalText.trim()).toBe(fmt(expectedSub));

    expectedTotal += expectedSub;
  }

  // Step 5: Verify total equals sum(sub totals)
  // Attempt to read total from table footer or page summary
  const totalLocator = page.locator('table tfoot tr td strong');
  if (await totalLocator.count() > 0) {
    const totalText = (await totalLocator.innerText()).trim();
    const m = totalText.match(/(\d+\.\d{1,2})/);
    if (!m) throw new Error(`Unable to parse total from text: ${totalText}`);
    const totalVal = Number(parseFloat(m[1]).toFixed(2));
    expect(totalVal).toBe(Number(expectedTotal.toFixed(2)));
  } else {
    // fallback: search page for text like "Total: 116.90" or "Total: 116.9"
    const pageText = await page.locator('body').innerText();
    const match = pageText.match(/Total\s*[:\-]?\s*\$?(\d+\.\d{1,2})/i);
    if (match) {
      const totalVal = Number(parseFloat(match[1]).toFixed(2));
      expect(totalVal).toBe(Number(expectedTotal.toFixed(2)));
    } else {
      throw new Error('Unable to locate total on cart page');
    }
  }
});

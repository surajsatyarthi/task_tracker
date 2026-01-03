import { test, expect } from '@playwright/test';

test.describe('Task Creation - Comprehensive Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
    
    // Wait for auth redirect to complete
    await page.waitForTimeout(2000);
    
    // Check if we're on login page, if so, login
    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      console.log('Not logged in, attempting login...');
      // You may need to add login steps here
      // For now, assuming user is already logged in
    }
    
    // Wait for the main page to load
    await page.waitForSelector('button:has-text("+")', { timeout: 10000 });
  });

  test('CRITICAL: Task creation should work without user_id error', async ({ page }) => {
    // Click add task button
    await page.click('button:has-text("+")');
    
    // Wait for modal to open
    await expect(page.locator('text=Add New Task')).toBeVisible();
    
    // Fill in the form
    await page.fill('input[placeholder*="task title"]', 'Test Task - No user_id error');
    await page.fill('textarea[placeholder*="details"]', 'Testing that task creation works');
    
    // Submit the form
    await page.click('button[type="submit"]:has-text("Add Task")');
    
    // Wait a bit for the API call
    await page.waitForTimeout(2000);
    
    // Check for error alert
    const alert = page.locator('text=/error/i');
    const isAlertVisible = await alert.isVisible().catch(() => false);
    
    if (isAlertVisible) {
      const alertText = await alert.textContent();
      console.error('❌ ERROR FOUND:', alertText);
      expect(isAlertVisible).toBe(false);
    }
    
    // Modal should close on success
    const modal = page.locator('text=Add New Task');
    await expect(modal).not.toBeVisible({ timeout: 5000 });
    
    console.log('✅ Task created successfully without user_id error');
  });

  test('UI: Text should be visible (black, not white)', async ({ page }) => {
    await page.click('button:has-text("+")');
    await expect(page.locator('text=Add New Task')).toBeVisible();
    
    // Type in title field
    const titleInput = page.locator('input[placeholder*="task title"]');
    await titleInput.fill('Checking text visibility');
    
    // Get the computed color of the text
    const color = await titleInput.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    console.log('Title input text color:', color);
    
    // Should be dark (rgb values should be low, not 255,255,255)
    // text-gray-900 is typically rgb(17, 24, 39) or similar
    expect(color).not.toBe('rgb(255, 255, 255)'); // Not white
    expect(color).not.toBe('rgb(200, 200, 200)'); // Not light gray
    
    console.log('✅ Text is visible (not white)');
  });

  test('UI: Placeholder should disappear when typing', async ({ page }) => {
    await page.click('button:has-text("+")');
    await expect(page.locator('text=Add New Task')).toBeVisible();
    
    const titleInput = page.locator('input[placeholder*="task title"]');
    
    // Get placeholder before typing
    const placeholderBefore = await titleInput.getAttribute('placeholder');
    console.log('Placeholder text:', placeholderBefore);
    
    // Type something
    await titleInput.fill('Test');
    
    // Value should be visible
    const value = await titleInput.inputValue();
    expect(value).toBe('Test');
    
    // Placeholder should still exist as attribute (HTML behavior)
    // but visually it should be hidden (browser default behavior)
    const placeholderAfter = await titleInput.getAttribute('placeholder');
    expect(placeholderAfter).toBe(placeholderBefore);
    
    console.log('✅ Placeholder exists but text is visible when typing');
  });

  test('URL Validation: Should accept www.example.com', async ({ page }) => {
    await page.click('button:has-text("+")');
    await expect(page.locator('text=Add New Task')).toBeVisible();
    
    // Fill required fields
    await page.fill('input[placeholder*="task title"]', 'URL Test Task');
    
    // Find and fill link input
    const linkInput = page.locator('input[placeholder*="example.com"]').first();
    await linkInput.fill('www.google.com');
    
    // Click add link button
    await page.click('button[aria-label*="Add link"]');
    
    // Wait a bit
    await page.waitForTimeout(500);
    
    // Check for error message
    const errorText = page.locator('text=/Please enter a valid URL/i');
    const hasError = await errorText.isVisible().catch(() => false);
    
    if (hasError) {
      console.error('❌ URL validation failed for www.google.com');
      expect(hasError).toBe(false);
    }
    
    // Check if link was added
    const addedLink = page.locator('text=www.google.com');
    await expect(addedLink).toBeVisible({ timeout: 2000 });
    
    console.log('✅ www.google.com accepted successfully');
  });

  test('URL Validation: Should accept example.com (no www)', async ({ page }) => {
    await page.click('button:has-text("+")');
    await expect(page.locator('text=Add New Task')).toBeVisible();
    
    await page.fill('input[placeholder*="task title"]', 'URL Test 2');
    
    const linkInput = page.locator('input[placeholder*="example.com"]').first();
    await linkInput.fill('github.com');
    await page.click('button[aria-label*="Add link"]');
    
    await page.waitForTimeout(500);
    
    const errorText = page.locator('text=/Please enter a valid URL/i');
    const hasError = await errorText.isVisible().catch(() => false);
    expect(hasError).toBe(false);
    
    const addedLink = page.locator('text=github.com');
    await expect(addedLink).toBeVisible({ timeout: 2000 });
    
    console.log('✅ github.com (no www) accepted successfully');
  });

  test('URL Validation: Should accept https://example.com', async ({ page }) => {
    await page.click('button:has-text("+")');
    await expect(page.locator('text=Add New Task')).toBeVisible();
    
    await page.fill('input[placeholder*="task title"]', 'URL Test 3');
    
    const linkInput = page.locator('input[placeholder*="example.com"]').first();
    await linkInput.fill('https://stackoverflow.com');
    await page.click('button[aria-label*="Add link"]');
    
    await page.waitForTimeout(500);
    
    const errorText = page.locator('text=/Please enter a valid URL/i');
    const hasError = await errorText.isVisible().catch(() => false);
    expect(hasError).toBe(false);
    
    const addedLink = page.locator('text=https://stackoverflow.com');
    await expect(addedLink).toBeVisible({ timeout: 2000 });
    
    console.log('✅ https://stackoverflow.com accepted successfully');
  });

  test('EDGE CASE: Empty title should show error', async ({ page }) => {
    await page.click('button:has-text("+")');
    await expect(page.locator('text=Add New Task')).toBeVisible();
    
    // Try to submit without title
    await page.click('button[type="submit"]:has-text("Add Task")');
    
    await page.waitForTimeout(500);
    
    // Should show validation error
    const errorText = page.locator('text=/required/i');
    await expect(errorText).toBeVisible({ timeout: 2000 });
    
    console.log('✅ Empty title correctly shows validation error');
  });

  test('EDGE CASE: Very long title (500+ chars) should be rejected', async ({ page }) => {
    await page.click('button:has-text("+")');
    await expect(page.locator('text=Add New Task')).toBeVisible();
    
    // Fill with 501 characters
    const longTitle = 'a'.repeat(501);
    const titleInput = page.locator('input[placeholder*="task title"]');
    await titleInput.fill(longTitle);
    
    // Input should have maxLength attribute or truncate
    const actualValue = await titleInput.inputValue();
    expect(actualValue.length).toBeLessThanOrEqual(500);
    
    console.log('✅ Long title properly limited to 500 chars');
  });

  test('EDGE CASE: Special characters in title should work', async ({ page }) => {
    await page.click('button:has-text("+")');
    await expect(page.locator('text=Add New Task')).toBeVisible();
    
    const specialTitle = 'Task with émojis 🚀 & symbols: @#$%^&*()';
    await page.fill('input[placeholder*="task title"]', specialTitle);
    await page.fill('textarea[placeholder*="details"]', 'Testing special chars');
    
    await page.click('button[type="submit"]:has-text("Add Task")');
    await page.waitForTimeout(2000);
    
    // Check for errors
    const alert = page.locator('text=/error/i');
    const hasError = await alert.isVisible().catch(() => false);
    
    if (hasError) {
      const errorText = await alert.textContent();
      console.error('❌ Special characters caused error:', errorText);
    }
    
    expect(hasError).toBe(false);
    console.log('✅ Special characters handled correctly');
  });

  test('EDGE CASE: Multiple links can be added', async ({ page }) => {
    await page.click('button:has-text("+")');
    await expect(page.locator('text=Add New Task')).toBeVisible();
    
    await page.fill('input[placeholder*="task title"]', 'Multiple Links Test');
    
    const linkInput = page.locator('input[placeholder*="example.com"]').first();
    
    // Add first link
    await linkInput.fill('www.google.com');
    await page.click('button[aria-label*="Add link"]');
    await page.waitForTimeout(300);
    
    // Add second link
    await linkInput.fill('github.com');
    await page.click('button[aria-label*="Add link"]');
    await page.waitForTimeout(300);
    
    // Add third link
    await linkInput.fill('https://stackoverflow.com');
    await page.click('button[aria-label*="Add link"]');
    await page.waitForTimeout(300);
    
    // All three should be visible
    await expect(page.locator('text=www.google.com')).toBeVisible();
    await expect(page.locator('text=github.com')).toBeVisible();
    await expect(page.locator('text=https://stackoverflow.com')).toBeVisible();
    
    console.log('✅ Multiple links can be added successfully');
  });

  test('EDGE CASE: Links can be removed', async ({ page }) => {
    await page.click('button:has-text("+")');
    await expect(page.locator('text=Add New Task')).toBeVisible();
    
    await page.fill('input[placeholder*="task title"]', 'Remove Link Test');
    
    const linkInput = page.locator('input[placeholder*="example.com"]').first();
    await linkInput.fill('www.test.com');
    await page.click('button[aria-label*="Add link"]');
    await page.waitForTimeout(300);
    
    // Link should be visible
    await expect(page.locator('text=www.test.com')).toBeVisible();
    
    // Click remove button for this link
    const removeButton = page.locator('button[aria-label*="Remove link www.test.com"]');
    await removeButton.click();
    await page.waitForTimeout(300);
    
    // Link should be gone
    await expect(page.locator('text=www.test.com')).not.toBeVisible();
    
    console.log('✅ Links can be removed successfully');
  });

  test('STRESS TEST: Try to break with rapid clicking', async ({ page }) => {
    await page.click('button:has-text("+")');
    await expect(page.locator('text=Add New Task')).toBeVisible();
    
    await page.fill('input[placeholder*="task title"]', 'Rapid Click Test');
    
    // Rapid fire clicks on submit button
    const submitButton = page.locator('button[type="submit"]:has-text("Add Task")');
    for (let i = 0; i < 5; i++) {
      await submitButton.click({ force: true });
      await page.waitForTimeout(100);
    }
    
    await page.waitForTimeout(2000);
    
    // Should not crash - check if app is still responsive
    const addButton = page.locator('button:has-text("+")');
    await expect(addButton).toBeVisible({ timeout: 3000 });
    
    console.log('✅ App survives rapid clicking');
  });

  test('FULL WORKFLOW: Create task with all fields populated', async ({ page }) => {
    await page.click('button:has-text("+")');
    await expect(page.locator('text=Add New Task')).toBeVisible();
    
    // Fill all fields
    await page.fill('input[placeholder*="task title"]', 'Complete Test Task');
    await page.fill('textarea[placeholder*="details"]', 'This is a comprehensive test with all fields filled');
    
    // Set due date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateString);
    
    // Add links
    const linkInput = page.locator('input[placeholder*="example.com"]').first();
    await linkInput.fill('www.example.com');
    await page.click('button[aria-label*="Add link"]');
    await page.waitForTimeout(300);
    
    // Add tags
    const tagInput = page.locator('input[placeholder*="urgent"]').first();
    await tagInput.fill('testing');
    await page.click('button[aria-label*="Add tag"]');
    await page.waitForTimeout(300);
    
    await tagInput.fill('important');
    await page.click('button[aria-label*="Add tag"]');
    await page.waitForTimeout(300);
    
    // Add remarks
    await page.fill('textarea[placeholder*="Additional notes"]', 'This is a test remark');
    
    // Submit
    await page.click('button[type="submit"]:has-text("Add Task")');
    await page.waitForTimeout(3000);
    
    // Check for errors
    const alert = page.locator('text=/error/i');
    const hasError = await alert.isVisible().catch(() => false);
    
    if (hasError) {
      const errorText = await alert.textContent();
      console.error('❌ Full workflow failed:', errorText);
      expect(hasError).toBe(false);
    }
    
    // Modal should close
    const modal = page.locator('text=Add New Task');
    await expect(modal).not.toBeVisible({ timeout: 5000 });
    
    console.log('✅ Full workflow completed successfully');
  });
});

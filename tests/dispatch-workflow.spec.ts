import { test, expect } from '@playwright/test';

test.describe('Warehouse Dispatch Workflow Validation Suite (T1 - T12)', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to guarantee fresh synthetic seed state
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  // T1: Submit the same dispatch request twice. Assert the UI blocks the duplicate and the system enforces the rule.
  test('T1: Submit the same dispatch request twice - blocks duplicate and enforces rule', async ({ page }) => {
    const duplicateId = 'DSP-TEST-DUPLICATE-01';

    // First submission
    await page.fill('[data-testid="dispatch-id-input"]', duplicateId);
    await page.selectOption('[data-testid="resource-select"]', 'S101');
    await page.fill('[data-testid="contact-name-input"]', 'Marcus Vance');
    await page.fill('[data-testid="contact-phone-input"]', '9876543210');
    await page.fill('[data-testid="base-value-input"]', '1000');
    await page.click('[data-testid="submit-btn"]');

    // Assert first submission succeeded
    await expect(page.locator(`[data-testid="queue-card-${duplicateId}"]`)).toBeVisible();

    // Second submission with the exact same ID
    await page.fill('[data-testid="dispatch-id-input"]', duplicateId);
    await page.click('[data-testid="submit-btn"]');

    // Assert UI blocks the duplicate and displays error
    const errorAlert = page.locator('[data-testid="error-message"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Duplicate dispatch request blocked');

    // Assert system enforces the rule and only one instance exists in queue
    const cards = page.locator(`[data-testid="queue-card-${duplicateId}"]`);
    await expect(cards).toHaveCount(1);
  });

  // T2: Attempt to create active-request counts 4, 5, and 6. Assert requests 4 and 5 succeed, and the 6th is rejected.
  test('T2: Active request count capacity - 4 and 5 succeed, 6th is rejected', async ({ page }) => {
    // Verify initial state has 3 active requests
    const activeBadge = page.locator('[data-testid="active-count-badge"]');
    await expect(activeBadge).toContainText('3 Active');

    // Attempt Request 4
    await page.fill('[data-testid="dispatch-id-input"]', 'DSP-ACTIVE-REQ-4');
    await page.selectOption('[data-testid="resource-select"]', 'S101');
    await page.fill('[data-testid="contact-name-input"]', 'Driver Four');
    await page.fill('[data-testid="contact-phone-input"]', '9876543210');
    await page.click('[data-testid="submit-btn"]');

    // Assert Request 4 succeeded (Total active: 4)
    await expect(page.locator('[data-testid="queue-card-DSP-ACTIVE-REQ-4"]')).toBeVisible();
    await expect(activeBadge).toContainText('4 Active');

    // Attempt Request 5
    await page.fill('[data-testid="dispatch-id-input"]', 'DSP-ACTIVE-REQ-5');
    await page.selectOption('[data-testid="resource-select"]', 'S102');
    await page.fill('[data-testid="contact-name-input"]', 'Driver Five');
    await page.fill('[data-testid="contact-phone-input"]', '9876543210');
    await page.click('[data-testid="submit-btn"]');

    // Assert Request 5 succeeded (Total active: 5)
    await expect(page.locator('[data-testid="queue-card-DSP-ACTIVE-REQ-5"]')).toBeVisible();
    await expect(activeBadge).toContainText('5 Active');

    // Attempt Request 6 (should be rejected)
    await page.fill('[data-testid="dispatch-id-input"]', 'DSP-ACTIVE-REQ-6');
    await page.selectOption('[data-testid="resource-select"]', 'S101');
    await page.fill('[data-testid="contact-name-input"]', 'Driver Six');
    await page.fill('[data-testid="contact-phone-input"]', '9876543210');
    await page.click('[data-testid="submit-btn"]');

    // Assert Request 6 is rejected with error
    const errorAlert = page.locator('[data-testid="error-message"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Active request limit reached');

    // Assert Request 6 was NOT created and active count remains 5
    await expect(page.locator('[data-testid="queue-card-DSP-ACTIVE-REQ-6"]')).not.toBeVisible();
    await expect(activeBadge).toContainText('5 Active');
  });

  // T3: Select the inactive resource S103. Assert the submission is rejected and system state is unchanged.
  test('T3: Select inactive resource S103 - submission rejected and system state unchanged', async ({ page }) => {
    const initialCardCount = await page.locator('[data-testid^="queue-card-"]').count();

    await page.fill('[data-testid="dispatch-id-input"]', 'DSP-INACTIVE-RES-TEST');
    await page.selectOption('[data-testid="resource-select"]', 'S103');
    await page.fill('[data-testid="contact-name-input"]', 'Maintenance Tech');
    await page.fill('[data-testid="contact-phone-input"]', '9876543210');
    await page.click('[data-testid="submit-btn"]');

    // Assert rejection message
    const errorAlert = page.locator('[data-testid="error-message"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Resource S103 is inactive and ineligible');

    // Assert system state is unchanged
    const finalCardCount = await page.locator('[data-testid^="queue-card-"]').count();
    expect(finalCardCount).toBe(initialCardCount);
    await expect(page.locator('[data-testid="queue-card-DSP-INACTIVE-RES-TEST"]')).not.toBeVisible();
  });

  // T4: Test base values of 999, 1000, and 1001. Assert the applicable charge calculates strictly as Rs.50 for 999, and Rs.0 for 1000 and 1001.
  test('T4: Dynamic charge calculation for base values 999, 1000, 1001', async ({ page }) => {
    const baseInput = page.locator('[data-testid="base-value-input"]');
    const chargeDisplay = page.locator('[data-testid="applicable-charge"]');

    // Case 1: 999 -> Rs.50
    await baseInput.fill('999');
    await expect(chargeDisplay).toHaveText('Rs.50');

    // Case 2: 1000 -> Rs.0
    await baseInput.fill('1000');
    await expect(chargeDisplay).toHaveText('Rs.0');

    // Case 3: 1001 -> Rs.0
    await baseInput.fill('1001');
    await expect(chargeDisplay).toHaveText('Rs.0');
  });

  // T5: Complete one valid submission using S101. Assert a successful record is created and the state updates.
  test('T5: Valid submission using S101 creates successful record and updates state', async ({ page }) => {
    const targetId = 'DSP-VALID-S101-FLOW';

    await page.fill('[data-testid="dispatch-id-input"]', targetId);
    await page.selectOption('[data-testid="resource-select"]', 'S101');
    await page.fill('[data-testid="contact-name-input"]', 'Elena Rostova');
    await page.fill('[data-testid="contact-phone-input"]', '9876543210');
    await page.fill('[data-testid="base-value-input"]', '1250');
    await page.click('[data-testid="submit-btn"]');

    // Assert record created
    const createdCard = page.locator(`[data-testid="queue-card-${targetId}"]`);
    await expect(createdCard).toBeVisible();

    // Assert resource S101 assigned
    const resourcePill = page.locator(`[data-testid="card-resource-${targetId}"]`);
    await expect(resourcePill).toHaveText('S101');

    // Assert success banner and state update
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  // T6: Submit with missing mandatory details (blank name or invalid 9-digit phone). Assert form is rejected without partial updates.
  test('T6: Mandatory validation for blank name and invalid 9-digit phone', async ({ page }) => {
    const initialCardCount = await page.locator('[data-testid^="queue-card-"]').count();

    // Case 1: Blank contact name
    await page.fill('[data-testid="contact-name-input"]', '');
    await page.fill('[data-testid="contact-phone-input"]', '9876543210');
    await page.click('[data-testid="submit-btn"]');

    let errorAlert = page.locator('[data-testid="error-message"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('Contact name is mandatory');

    // Assert state unchanged
    expect(await page.locator('[data-testid^="queue-card-"]').count()).toBe(initialCardCount);

    // Case 2: Invalid 9-digit phone number
    await page.fill('[data-testid="contact-name-input"]', 'John Driver');
    await page.fill('[data-testid="contact-phone-input"]', '987654321'); // only 9 digits
    await page.click('[data-testid="submit-btn"]');

    errorAlert = page.locator('[data-testid="error-message"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('valid 10-digit number');

    // Assert state still unchanged
    expect(await page.locator('[data-testid^="queue-card-"]').count()).toBe(initialCardCount);
  });

  // T7: Mock a backend response changing resource eligibility right before clicking submit. Assert transaction is wholly rejected.
  test('T7: Mock backend response changing resource eligibility - wholly rejected', async ({ page }) => {
    // Intercept backend verification endpoint to mock server revoking resource eligibility
    await page.route('**/api/resources/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          resourceId: 'S101',
          eligible: false,
          message: 'Server Notice: Resource S101 eligibility revoked right before dispatch.',
        }),
      });
    });

    await page.fill('[data-testid="dispatch-id-input"]', 'DSP-REVOKED-ELIGIBILITY');
    await page.selectOption('[data-testid="resource-select"]', 'S101');
    await page.fill('[data-testid="contact-name-input"]', 'Security Escort');
    await page.fill('[data-testid="contact-phone-input"]', '9876543210');
    await page.click('[data-testid="submit-btn"]');

    // Assert rejection banner
    const errorAlert = page.locator('[data-testid="error-message"]');
    await expect(errorAlert).toBeVisible();
    await expect(errorAlert).toContainText('eligibility revoked right before dispatch');

    // Assert transaction rejected and card not created
    await expect(page.locator('[data-testid="queue-card-DSP-REVOKED-ELIGIBILITY"]')).not.toBeVisible();
  });

  // T8: Log in as User 1 and attempt to trigger an admin-only status change. Assert access is denied.
  test('T8: Operator User 1 triggering admin-only status change - access denied', async ({ page }) => {
    // Confirm active persona is Operator User (User 1)
    await expect(page.locator('text=Operator User')).toBeVisible();

    // Find card DSP-2025-7712 and attempt admin override
    const adminBtn = page.locator('[data-testid="admin-override-btn-DSP-2025-7712"]');
    await expect(adminBtn).toBeVisible();
    await adminBtn.click();

    // Assert access denied banner
    const accessDenied = page.locator('[data-testid="access-denied-message"]');
    await expect(accessDenied).toBeVisible();
    await expect(accessDenied).toContainText('Access denied: Administrator privileges required');
  });

  // T9: Log in as Admin. Attempt to skip from SUBMITTED directly to COMPLETED. Assert failure. Then advance stages validly and assert success.
  test('T9: Admin lifecycle stage progression - direct skip fails, valid sequence succeeds', async ({ page }) => {
    // Switch to Admin persona
    const adminPersonaBtn = page.locator('button:has-text("Admin / Supervisor")').first();
    await adminPersonaBtn.click();

    const targetCardId = 'DSP-2025-7713'; // Starts in SUBMITTED
    const stageSelect = page.locator(`[data-testid="stage-select-${targetCardId}"]`);
    await expect(stageSelect).toBeVisible();

    // Attempt invalid skip from SUBMITTED directly to COMPLETED
    await stageSelect.selectOption('COMPLETED');

    // Assert failure message
    const stageError = page.locator('[data-testid="stage-error-message"]');
    await expect(stageError).toBeVisible();
    await expect(stageError).toContainText('Must advance from SUBMITTED to IN_TRANSIT before COMPLETED');

    // Assert card is still in SUBMITTED
    await expect(page.locator(`[data-testid="card-stage-${targetCardId}"]`)).toHaveText('SUBMITTED');

    // Advance validly: Step 1 -> IN_TRANSIT
    await stageSelect.selectOption('IN_TRANSIT');
    await expect(page.locator(`[data-testid="card-stage-${targetCardId}"]`)).toHaveText('IN_TRANSIT');

    // Advance validly: Step 2 -> COMPLETED
    await stageSelect.selectOption('COMPLETED');
    await expect(page.locator(`[data-testid="card-stage-${targetCardId}"]`)).toHaveText('COMPLETED');
  });

  // T10: Cancel an eligible request, then attempt to cancel it again. Assert first updates state once, repeat is rejected.
  test('T10: Cancel eligible request and repeat cancellation - repeat is rejected', async ({ page }) => {
    const targetCardId = 'DSP-2025-7714';
    const cancelBtn = page.locator(`[data-testid="cancel-btn-${targetCardId}"]`);
    await expect(cancelBtn).toBeVisible();

    // First cancellation
    await cancelBtn.click();

    // Assert card state updated to CANCELLED
    const stageBadge = page.locator(`[data-testid="card-stage-${targetCardId}"]`);
    await expect(stageBadge).toHaveText('CANCELLED');

    // Attempt second cancellation on the same card
    await cancelBtn.click();

    // Assert repeat cancellation notification indicates rejection
    await expect(page.locator('text=already cancelled. Repeated cancellation rejected.')).toBeVisible();
  });

  // T11: Submit a request, trigger page reload (simulating restart), assert created record still exists in DOM.
  test('T11: Request persistence across page reload simulation', async ({ page }) => {
    const persistId = 'DSP-PERSIST-TEST-11';

    await page.fill('[data-testid="dispatch-id-input"]', persistId);
    await page.selectOption('[data-testid="resource-select"]', 'S101');
    await page.fill('[data-testid="contact-name-input"]', 'Persistence Check');
    await page.fill('[data-testid="contact-phone-input"]', '9876543210');
    await page.click('[data-testid="submit-btn"]');

    // Assert record visible before reload
    await expect(page.locator(`[data-testid="queue-card-${persistId}"]`)).toBeVisible();

    // Trigger page reload (simulating system restart)
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Assert created record still exists in DOM after reload
    await expect(page.locator(`[data-testid="queue-card-${persistId}"]`)).toBeVisible();
    await expect(page.locator(`[data-testid="card-id-${persistId}"]`)).toHaveText(persistId);
  });

  // T12: Submit a request for S101, intercept network to mock master data price change, assert historical request retains original snapshot value.
  test('T12: Historical request retains original price snapshot despite master data change', async ({ page }) => {
    const snapshotId = 'DSP-SNAPSHOT-12';

    // Submit with base value 999 which computes applicable charge Rs.50
    await page.fill('[data-testid="dispatch-id-input"]', snapshotId);
    await page.selectOption('[data-testid="resource-select"]', 'S101');
    await page.fill('[data-testid="contact-name-input"]', 'Historical Snapshot Test');
    await page.fill('[data-testid="contact-phone-input"]', '9876543210');
    await page.fill('[data-testid="base-value-input"]', '999');
    await page.click('[data-testid="submit-btn"]');

    // Assert initial snapshot charge is Rs.50
    const snapshotDisplay = page.locator(`[data-testid="card-snapshot-charge-${snapshotId}"]`);
    await expect(snapshotDisplay).toContainText('Charge: Rs.50');

    // Intercept master data price change endpoint to mock a dramatic rate change
    await page.route('**/api/master-data**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          resourceId: 'S101',
          applicableCharge: 250, // Updated future price
          tariffBase: 500,
        }),
      });
    });

    // Simulate background sync / master data poll
    await page.locator('[data-testid="simulate-sync-btn"]').click();
    await page.waitForTimeout(1000);

    // Assert the historical card STILL retains the original snapshot value Rs.50
    await expect(snapshotDisplay).toContainText('Charge: Rs.50');
  });
});

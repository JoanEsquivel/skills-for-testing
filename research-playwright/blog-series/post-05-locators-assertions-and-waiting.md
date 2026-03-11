# Locators, Assertions, and Auto-Waiting

## The Hook

The number one cause of flaky tests is not browser bugs, not network latency, not CI infrastructure --- it's bad selectors. A test that uses `div.container > div:nth-child(3) > button.btn-primary` will break the moment a designer adds a wrapper div or reorders the layout. A test that uses `page.getByRole('button', { name: 'Submit order' })` will work as long as the button exists with that label --- which is exactly what your user sees.

Playwright's locator system isn't just a convenience API. It's a philosophy: **test the way users interact, not the way developers structure HTML.**

## Context: The Selector Problem

Every test framework needs a way to find elements. The approaches, ranked from most brittle to most resilient:

1. **XPath** --- `//div[@class='form']/button[2]` --- Tied to DOM structure. Any layout change breaks it.
2. **CSS selectors** --- `.form-container .btn-primary` --- Tied to CSS classes. Any styling refactor breaks it.
3. **Test IDs** --- `[data-testid='submit-button']` --- Resilient to structure/style changes but invisible to users.
4. **Text content** --- `button:has-text("Submit")` --- User-visible but fragile with partial matches.
5. **Semantic/role-based** --- `getByRole('button', { name: 'Submit' })` --- Matches how assistive technology sees the page. Resilient, accessible, and readable.

Playwright recommends starting from the bottom of this list and working up only when necessary.

## Core Idea: The Locator Hierarchy

Playwright provides a prioritized set of locator methods. Use them in this order:

```typescript
// 1. Role-based (BEST) --- matches accessible role + name
page.getByRole('button', { name: 'Submit' })
page.getByRole('heading', { name: 'Welcome' })
page.getByRole('link', { name: 'Sign in' })
page.getByRole('textbox', { name: 'Email' })

// 2. Label-based --- finds input by associated label
page.getByLabel('Email address')
page.getByLabel('Password')

// 3. Placeholder-based --- finds input by placeholder text
page.getByPlaceholder('Search products...')

// 4. Text-based --- finds element by text content
page.getByText('Welcome back')
page.getByText('No results found')

// 5. Alt text --- finds images by alt attribute
page.getByAltText('Company logo')

// 6. Title attribute --- finds elements by title
page.getByTitle('Close dialog')

// 7. Test ID (last resort) --- explicitly added for testing
page.getByTestId('submit-button')
```

### Why Role-Based Locators Are Best

`getByRole` uses the ARIA role tree --- the same model that screen readers use to navigate the page. This means:

- **Accessibility verification.** If `getByRole('button', { name: 'Submit' })` can't find your element, a screen reader can't find it either. Your test is now also an accessibility check.
- **Framework independence.** ARIA roles are computed from HTML semantics, not from CSS classes or component structure. A `<button>`, a `<div role="button">`, and a `<custom-button>` element all have the role `button`.
- **Refactor resilience.** Redesigning the page layout, changing CSS classes, or switching UI frameworks doesn't change the role tree (if done correctly).

```typescript
// This works regardless of HTML structure
// <button>Submit</button>
// <div role="button" aria-label="Submit">→</div>
// <CustomButton label="Submit" />
await page.getByRole('button', { name: 'Submit' }).click();
```

## Deep Dive: Locator Chaining and Filtering

Real-world pages have multiple elements with the same role or text. Playwright handles this with chaining and filtering:

### Chaining

Narrow scope by chaining locators:

```typescript
// Find the "Delete" button inside the first product card
const productCard = page.locator('.product-card').first();
await productCard.getByRole('button', { name: 'Delete' }).click();

// Find the email input within the login form
const loginForm = page.getByRole('form', { name: 'Login' });
await loginForm.getByLabel('Email').fill('user@example.com');
```

### Filtering

Filter locators by conditions:

```typescript
// Find the row that contains "John" and click its edit button
await page
  .getByRole('row')
  .filter({ hasText: 'John' })
  .getByRole('button', { name: 'Edit' })
  .click();

// Find the card that has a specific heading
await page
  .locator('.card')
  .filter({ has: page.getByRole('heading', { name: 'Premium Plan' }) })
  .getByRole('button', { name: 'Select' })
  .click();
```

### Nth Selection

When you need a specific instance:

```typescript
// First, second, last
await page.getByRole('listitem').first().click();
await page.getByRole('listitem').nth(2).click();
await page.getByRole('listitem').last().click();
```

## Deep Dive: Web-First Assertions

Playwright's assertions are fundamentally different from traditional test assertions. They are **web-first**: they automatically retry until the condition is met or the timeout expires.

### Traditional vs Web-First

```typescript
// Traditional assertion (Jest/Mocha style) --- WRONG in Playwright
const text = await page.locator('#status').textContent();
expect(text).toBe('Loaded'); // Checks once. If the element hasn't updated yet, fails.

// Web-first assertion --- CORRECT
await expect(page.locator('#status')).toHaveText('Loaded');
// Retries until text matches or timeout (default 5s)
```

### Available Assertions

```typescript
// Element state
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
await expect(locator).toBeEditable();
await expect(locator).toBeChecked();
await expect(locator).toBeFocused();
await expect(locator).toBeAttached();

// Element content
await expect(locator).toHaveText('exact text');
await expect(locator).toHaveText(/regex pattern/);
await expect(locator).toContainText('partial');
await expect(locator).toHaveValue('input value');
await expect(locator).toHaveAttribute('href', '/dashboard');
await expect(locator).toHaveClass(/active/);
await expect(locator).toHaveCSS('color', 'rgb(255, 0, 0)');
await expect(locator).toHaveCount(5);

// Page-level
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveURL(/\/dashboard/);
await expect(page).toHaveTitle('My App - Dashboard');

// Visual comparison
await expect(locator).toHaveScreenshot('component.png');
await expect(page).toHaveScreenshot('full-page.png');

// Negation
await expect(locator).not.toBeVisible();
await expect(locator).not.toHaveText('Error');
```

### Assertion Timeout

Web-first assertions retry for 5 seconds by default. Configure this globally or per-assertion:

```typescript
// Global (playwright.config.ts)
export default defineConfig({
  expect: {
    timeout: 10_000, // 10 seconds for all assertions
  },
});

// Per-assertion
await expect(locator).toHaveText('Loaded', { timeout: 15_000 });
```

## Deep Dive: Auto-Waiting

Every Playwright action automatically waits for the element to be actionable. The six checks are:

| Check | Applies To | What It Verifies |
|-------|-----------|-----------------|
| Attached | All actions | Element is in the DOM |
| Visible | Most actions | Element has non-zero size, not hidden by CSS |
| Stable | Click, hover | Bounding box unchanged across 2 animation frames |
| Enabled | Click, fill, select | Not `disabled` or `aria-disabled` |
| Receives Events | Click | No overlay intercepting at click coordinates |
| Editable | fill, type, clear | Element accepts text input |

### How Stability Works

The stability check is Playwright's answer to animation-related flakiness:

```typescript
// Element is sliding in from the left via CSS animation
// Frame 1: element at x=100
// Frame 2: element at x=150 (still moving)
// Frame 3: element at x=200 (still moving)
// Frame 4: element at x=200 (same as frame 3 --- STABLE)
// Playwright clicks at frame 4
await page.getByRole('button', { name: 'Animated' }).click();
```

### How "Receives Events" Works

```typescript
// A loading overlay covers the page
// <div class="loading-overlay" style="position: fixed; inset: 0; z-index: 999;" />
// <button>Submit</button>

// Playwright checks: at the button's center coordinates,
// which element would receive a click event?
// Answer: the overlay div, not the button.
// Playwright waits until the overlay disappears.
await page.getByRole('button', { name: 'Submit' }).click();
// Clicks only after the overlay is gone
```

## Common Mistakes (and How to Avoid Them)

### Mistake 1: Using waitForTimeout

```typescript
// BAD: Arbitrary wait
await page.waitForTimeout(3000);
await page.click('#submit');

// GOOD: Auto-waiting handles it
await page.getByRole('button', { name: 'Submit' }).click();
```

### Mistake 2: Manual Visibility Checks Before Actions

```typescript
// BAD: Redundant check --- click already waits for visibility
await expect(page.getByRole('button')).toBeVisible();
await page.getByRole('button').click();

// GOOD: Just click. Playwright waits automatically.
await page.getByRole('button', { name: 'Submit' }).click();
```

### Mistake 3: Using CSS Selectors When Semantic Locators Exist

```typescript
// BAD: Tied to CSS structure
await page.locator('button.btn-primary.submit-form').click();

// GOOD: Tied to user-visible semantics
await page.getByRole('button', { name: 'Submit' }).click();
```

### Mistake 4: Extracting Text Then Asserting

```typescript
// BAD: One-time check, no retry
const text = await page.locator('.status').textContent();
expect(text).toContain('Success');

// GOOD: Web-first assertion with auto-retry
await expect(page.locator('.status')).toContainText('Success');
```

### Mistake 5: Using page.$ or page.evaluate for Element Queries

```typescript
// BAD: Returns ElementHandle, can go stale
const element = await page.$('#submit');
await element?.click();

// GOOD: Locator always re-queries
await page.locator('#submit').click();
```

### Mistake 6: Not Using Filter for Disambiguation

```typescript
// BAD: Fragile nth index
await page.getByRole('button', { name: 'Delete' }).nth(2).click();

// GOOD: Filter by context
await page.getByRole('row')
  .filter({ hasText: 'Expired subscription' })
  .getByRole('button', { name: 'Delete' })
  .click();
```

### Mistake 7: Using Force Click

```typescript
// BAD: Bypasses all actionability checks
await page.click('#submit', { force: true });

// This usually means the element has a real problem
// (overlay, disabled state, not visible). Fix the app or the test.
```

### Mistake 8: Hard-Coded Text in Multiple Languages

```typescript
// BAD: Breaks in non-English locales
await page.getByText('Submit').click();

// GOOD: Use test IDs for locale-independent tests
await page.getByTestId('submit-button').click();

// ALSO GOOD: Use role with accessible name (if name is locale-independent)
await page.getByRole('button', { name: /submit/i }).click();
```

### Mistake 9: Forgetting That Assertions Need await

```typescript
// BAD: Assertion never executes (no await = floating promise)
expect(page.locator('.status')).toHaveText('Done');

// GOOD: Always await assertions
await expect(page.locator('.status')).toHaveText('Done');
```

### Mistake 10: Using toHaveText When toContainText Is Needed

```typescript
// Element text: "Total: $49.99 (including tax)"

// BAD: Fails because text doesn't match exactly
await expect(locator).toHaveText('$49.99');

// GOOD: Partial match
await expect(locator).toContainText('$49.99');

// ALSO GOOD: Regex
await expect(locator).toHaveText(/\$49\.99/);
```

### Mistake 11: Asserting Count Without Waiting for Load

```typescript
// BAD: Might check before items load
const count = await page.locator('.item').count();
expect(count).toBe(10);

// GOOD: Web-first assertion retries
await expect(page.locator('.item')).toHaveCount(10);
```

### Mistake 12: Using page.url() Instead of toHaveURL

```typescript
// BAD: Single check, navigation might still be in progress
expect(page.url()).toBe('http://localhost:3000/dashboard');

// GOOD: Retries until URL matches
await expect(page).toHaveURL('/dashboard');
```

### Mistake 13: Overly Specific Locators

```typescript
// BAD: Breaks if any parent changes
page.locator('div.content > div.main > section:first-child > form > button');

// GOOD: Directly target the element
page.getByRole('button', { name: 'Submit' });
```

### Mistake 14: Not Using frameLocator for Iframes

```typescript
// BAD: Can't find elements inside iframes
await page.getByRole('button', { name: 'Pay' }).click();

// GOOD: Use frameLocator to enter the iframe
await page
  .frameLocator('iframe[name="payment"]')
  .getByRole('button', { name: 'Pay' })
  .click();
```

### Mistake 15: Ignoring Strict Mode Violations

```typescript
// Playwright throws if a locator matches multiple elements (strict mode)
// Error: locator.click: Error: strict mode violation:
//   getByRole('button') resolved to 5 elements

// GOOD: Be more specific
await page.getByRole('button', { name: 'Submit' }).click();
```

### Mistake 16: Using page.waitForSelector for Assertions

```typescript
// BAD: waitForSelector + manual check
await page.waitForSelector('.success-message');
const text = await page.locator('.success-message').textContent();
expect(text).toBe('Order placed');

// GOOD: Single web-first assertion
await expect(page.getByText('Order placed')).toBeVisible();
```

### Mistake 17: Not Setting Reasonable Timeouts

```typescript
// BAD: Default 30s timeout for everything
// A payment processing step might need more time

// GOOD: Set specific timeouts where needed
await expect(page.getByText('Payment confirmed')).toBeVisible({
  timeout: 60_000, // Payment processing can be slow
});
```

## Tradeoffs and Limitations

- **Role-based locators require accessible HTML.** If your application has poor semantic HTML (everything is a `div` with click handlers), `getByRole` won't help. This is a feature, not a bug --- it incentivizes accessible markup.
- **Text-based locators are locale-dependent.** `getByText('Submit')` breaks in French. Use `getByTestId` for locale-independent tests or parameterize text.
- **Auto-waiting adds time.** The stability check (two animation frames) adds ~32ms per action. For 1,000 actions, that's 32 seconds. For most suites, this is negligible.
- **Strict mode can be noisy.** Locators that match multiple elements throw errors by default. This catches real problems but requires more specific locators.

## Conclusion

Playwright's locator system and auto-waiting work together to eliminate the two most common sources of test flakiness: brittle selectors and timing issues. The locator hierarchy (role → label → placeholder → text → test ID) guides you toward selectors that are resilient, accessible, and readable. Web-first assertions eliminate the "check too early" problem entirely.

The 17 mistakes listed above represent real patterns we've seen in production codebases. Avoiding them from the start will save you significant debugging time.

---

*Next in the series: [Page Object Model and Custom Fixtures](post-06-page-object-model-and-fixtures.md) --- Organizing test code with POM classes, composable fixtures, and authentication patterns.*

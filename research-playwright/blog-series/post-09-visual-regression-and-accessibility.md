# Visual Regression and Accessibility

## The Hook

A CSS change broke the checkout button. Not functionally --- the button still worked. It still had the right text, the right role, the right click handler. But a margin change pushed it below the fold on mobile viewports, and 23% of mobile users couldn't see it without scrolling. Functional tests passed. Visual regression tests would have caught it in the PR.

Meanwhile, 15% of the world's population lives with some form of disability. Your application might pass every functional test and still be unusable for millions of people. Accessibility testing shouldn't be an afterthought bolted on before launch --- it should run on every commit, alongside your functional tests.

Playwright handles both: visual regression with `toHaveScreenshot()` and accessibility audits with `@axe-core/playwright`.

## Context: Two Types of Invisible Bugs

**Visual regressions** are changes to appearance that functional tests don't catch. A button moved 50 pixels. A font changed. A color lost contrast. A layout broke at 768px viewport width. These are bugs that matter to users but are invisible to assertions like `toBeVisible()` and `toHaveText()`.

**Accessibility violations** are structural issues that prevent assistive technology from working. Missing alt text. Insufficient color contrast. Missing form labels. Keyboard traps. These are bugs that affect real users but are invisible to tests that only simulate mouse clicks.

Both require specialized testing. Playwright provides built-in support for visual regression and integrates with axe-core for accessibility.

## Core Idea: Screenshot Comparison as Assertion

Playwright's `toHaveScreenshot()` captures a screenshot and compares it pixel-by-pixel against a stored baseline. If the difference exceeds a configurable threshold, the test fails.

```typescript
test('checkout page matches baseline', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page).toHaveScreenshot('checkout.png');
});
```

On the first run, this creates a baseline image in a `__screenshots__` directory. On subsequent runs, it compares the current screenshot against the baseline and fails if they differ.

## Deep Dive: toHaveScreenshot()

### Basic Usage

```typescript
// Full page screenshot
await expect(page).toHaveScreenshot('full-page.png');

// Element screenshot
await expect(page.locator('.product-card')).toHaveScreenshot('product-card.png');

// Full page with scrolling
await expect(page).toHaveScreenshot('full-page-scrolled.png', {
  fullPage: true,
});
```

### Configuration Options

```typescript
await expect(page).toHaveScreenshot('dashboard.png', {
  // Maximum number of different pixels (absolute)
  maxDiffPixels: 100,

  // Maximum percentage of different pixels
  maxDiffPixelRatio: 0.01, // 1%

  // Color comparison threshold (0-1, where 0 is exact match)
  threshold: 0.2,

  // Mask dynamic content
  mask: [
    page.locator('.timestamp'),
    page.locator('.user-avatar'),
    page.locator('.ad-banner'),
  ],

  // Mask color (default: pink)
  maskColor: '#FF00FF',

  // Animation handling
  animations: 'disabled', // Freeze all CSS animations

  // Caret handling
  caret: 'hide', // Hide blinking cursor
});
```

### The Update Workflow

```bash
# First run: creates baseline screenshots
npx playwright test

# After intentional UI changes: update baselines
npx playwright test --update-snapshots

# Review changes in git diff
git diff --stat  # Shows changed .png files
```

### Screenshot Naming and Organization

```
tests/
├── checkout.spec.ts
├── checkout.spec.ts-snapshots/
│   ├── checkout-chromium-linux.png
│   ├── checkout-firefox-linux.png
│   └── checkout-webkit-linux.png
```

Screenshots are stored per-browser and per-platform because rendering differs across engines and operating systems. This is by design --- a pixel-perfect Chromium screenshot won't match Firefox's rendering.

### Cross-Platform Strategy

Since screenshots differ across platforms, choose one strategy:

```typescript
// Option 1: Run visual tests on a single platform (recommended)
// playwright.config.ts
export default defineConfig({
  projects: [
    {
      name: 'visual-chromium',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*visual.*\.spec\.ts/,
    },
  ],
});

// Option 2: Use Docker for consistent rendering
// docker run --rm -v $(pwd):/work -w /work mcr.microsoft.com/playwright:latest npx playwright test
```

Docker is the recommended approach for CI: it ensures identical rendering across all environments.

### Handling Dynamic Content

Dynamic content (timestamps, animations, ads, user data) causes false positives:

```typescript
test('dashboard visual test', async ({ page }) => {
  // Mock dynamic data for deterministic screenshots
  await page.route('**/api/dashboard', (route) => {
    route.fulfill({
      body: JSON.stringify({
        lastLogin: '2024-01-15T10:00:00Z',
        notifications: 3,
        userName: 'Test User',
      }),
    });
  });

  await page.goto('/dashboard');

  // Freeze animations and mask remaining dynamic elements
  await expect(page).toHaveScreenshot('dashboard.png', {
    animations: 'disabled',
    mask: [page.locator('[data-testid="live-clock"]')],
  });
});
```

## Deep Dive: Component-Level Visual Testing

Screenshot entire pages for layout regression. Screenshot individual components for component-level visual testing:

```typescript
test.describe('Button variants', () => {
  test('primary button', async ({ page }) => {
    await page.goto('/storybook/button--primary');
    await expect(page.locator('.button')).toHaveScreenshot('button-primary.png');
  });

  test('disabled button', async ({ page }) => {
    await page.goto('/storybook/button--disabled');
    await expect(page.locator('.button')).toHaveScreenshot('button-disabled.png');
  });

  test('loading button', async ({ page }) => {
    await page.goto('/storybook/button--loading');
    await expect(page.locator('.button')).toHaveScreenshot('button-loading.png', {
      animations: 'disabled',
    });
  });
});
```

### Integration with Storybook

Playwright pairs well with Storybook for component visual testing:

```typescript
// tests/visual/components.spec.ts
import { test, expect } from '@playwright/test';

const components = [
  'button--primary',
  'button--secondary',
  'card--default',
  'card--with-image',
  'modal--open',
  'form--validation-error',
];

for (const component of components) {
  test(`visual: ${component}`, async ({ page }) => {
    await page.goto(`/storybook/iframe.html?id=${component}`);
    await expect(page.locator('#storybook-root')).toHaveScreenshot(
      `${component}.png`
    );
  });
}
```

## Deep Dive: Accessibility Testing with axe-core

### Setup

```bash
npm install -D @axe-core/playwright
```

### Basic Accessibility Scan

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home page has no accessibility violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
```

### Targeted Scans

```typescript
test('navigation is accessible', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .include('nav')          // Only scan the nav element
    .analyze();

  expect(results.violations).toEqual([]);
});

test('form is accessible', async ({ page }) => {
  await page.goto('/contact');

  const results = await new AxeBuilder({ page })
    .include('form')
    .exclude('.third-party-widget')  // Exclude elements you don't control
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### WCAG Compliance Levels

```typescript
test('meets WCAG 2.1 AA', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])  // WCAG 2.1 AA
    .analyze();

  expect(results.violations).toEqual([]);
});

test('meets WCAG 2.1 AAA', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag2aaa', 'wcag21aa', 'wcag21aaa'])
    .analyze();

  expect(results.violations).toEqual([]);
});
```

### Common Accessibility Rules

| Rule | Description | Impact |
|------|-------------|--------|
| `color-contrast` | Text has sufficient contrast against background | Serious |
| `image-alt` | Images have alt text | Critical |
| `label` | Form inputs have associated labels | Critical |
| `link-name` | Links have discernible text | Serious |
| `button-name` | Buttons have discernible text | Critical |
| `heading-order` | Headings are in logical order | Moderate |
| `aria-roles` | ARIA roles are valid | Critical |
| `keyboard-access` | Interactive elements are keyboard accessible | Critical |
| `page-has-heading-one` | Page has an h1 element | Moderate |
| `region` | Content is within landmark regions | Moderate |

### Detailed Violation Reporting

```typescript
test('accessibility audit with detailed report', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page }).analyze();

  if (results.violations.length > 0) {
    const report = results.violations.map((v) => ({
      rule: v.id,
      impact: v.impact,
      description: v.description,
      helpUrl: v.helpUrl,
      elements: v.nodes.map((n) => n.html).slice(0, 3),
    }));

    console.log('Accessibility violations:', JSON.stringify(report, null, 2));
  }

  expect(results.violations).toEqual([]);
});
```

### Creating an Accessibility Fixture

```typescript
// fixtures/accessibility.fixture.ts
import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type AccessibilityFixtures = {
  makeAxeBuilder: () => AxeBuilder;
};

export const test = base.extend<AccessibilityFixtures>({
  makeAxeBuilder: async ({ page }, use) => {
    await use(() => new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .exclude('.third-party-content')
    );
  },
});

export { expect };
```

```typescript
// tests/accessibility.spec.ts
import { test, expect } from '../fixtures/accessibility.fixture';

const pages = ['/', '/products', '/about', '/contact', '/login'];

for (const path of pages) {
  test(`${path} meets WCAG 2.1 AA`, async ({ page, makeAxeBuilder }) => {
    await page.goto(path);
    const results = await makeAxeBuilder().analyze();
    expect(results.violations).toEqual([]);
  });
}
```

## Practical Patterns

### Pattern 1: Visual + Accessibility in One Test

```typescript
test('product page is visually correct and accessible', async ({ page }) => {
  await page.goto('/products/laptop');

  // Visual regression
  await expect(page).toHaveScreenshot('product-laptop.png', {
    mask: [page.locator('.price'), page.locator('.stock-count')],
  });

  // Accessibility
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### Pattern 2: Responsive Visual Testing

```typescript
const viewports = [
  { width: 375, height: 812, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1440, height: 900, name: 'desktop' },
];

for (const viewport of viewports) {
  test(`home page at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto('/');
    await expect(page).toHaveScreenshot(`home-${viewport.name}.png`);
  });
}
```

### Pattern 3: Dark Mode Visual Testing

```typescript
test('supports dark mode', async ({ page }) => {
  // Light mode
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page).toHaveScreenshot('home-light.png');

  // Dark mode
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page).toHaveScreenshot('home-dark.png');
});
```

### Pattern 4: Keyboard Navigation Testing

```typescript
test('form is navigable by keyboard', async ({ page }) => {
  await page.goto('/contact');

  // Tab through form fields
  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Name')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Email')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Message')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Send' })).toBeFocused();

  // Submit with Enter
  await page.keyboard.press('Enter');
  await expect(page.getByText('Message sent')).toBeVisible();
});
```

## Tradeoffs and Limitations

### Visual Testing

- **Platform dependency.** Font rendering, anti-aliasing, and sub-pixel positioning differ across OS and GPU. Use Docker or a single CI platform for consistency.
- **Maintenance burden.** Every intentional UI change requires updating baselines. Large design changes can mean updating hundreds of screenshots.
- **False positives.** Dynamic content, animations, and sub-pixel rendering can cause false failures. Use masking, animation freezing, and appropriate thresholds.
- **Storage cost.** Screenshot files add to repository size. For large suites, consider storing baselines in a separate repository or using Git LFS.

### Accessibility Testing

- **Not a complete audit.** axe-core catches ~57% of WCAG issues automatically. Manual testing (screen reader, keyboard navigation) is still required.
- **Runtime limitations.** axe-core analyzes the rendered DOM. It cannot test: time-based media, focus management across page loads, or cognitive accessibility.
- **False negatives.** Some violations require human judgment (e.g., "is this alt text meaningful?"). axe-core checks for presence, not quality.
- **Third-party content.** Embedded widgets, iframes, and third-party scripts may have violations you cannot fix. Use `exclude()` to focus on your own code.

## Conclusion

Visual regression and accessibility testing address the gaps that functional tests leave open. `toHaveScreenshot()` catches the layout breaks, styling regressions, and responsive issues that `toBeVisible()` and `toHaveText()` cannot. `@axe-core/playwright` catches the structural accessibility issues that no amount of click-and-assert testing will find.

Together, they transform your test suite from "does the feature work?" to "does the feature work correctly for everyone?"

---

*Next in the series: [Parallel Execution, Sharding, and CI/CD](post-10-parallel-execution-and-ci-cd.md) --- Workers, fullyParallel, sharding, retries, GitHub Actions, Docker, and reporters.*

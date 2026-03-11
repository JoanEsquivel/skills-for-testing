# From Zero to Running Tests

## The Hook

Most testing frameworks require a tutorial, a blog post, a Stack Overflow deep dive, and a weekend of configuration before you run your first test. Playwright ships a single command that scaffolds a complete project --- config file, example tests, CI workflow, and all three browser engines --- in under 60 seconds.

This isn't accidental. The Playwright team learned from Cypress's insight that developer experience determines adoption. If the first five minutes are painful, engineers find reasons not to write tests. If the first five minutes feel effortless, testing becomes a habit.

## Context: What You Need Before Starting

- **Node.js** 18 or later (LTS recommended)
- **A terminal** (VS Code's integrated terminal works great)
- **Optionally:** VS Code with the Playwright extension for the best development experience

That's it. No JDK. No WebDriver binaries. No browser driver management.

## Core Idea: One Command to Start

```bash
npm init playwright@latest
```

This interactive command asks four questions and then scaffolds everything:

```
Getting started with writing end-to-end tests with Playwright:
Initializing project in '.'
✔ Do you want to use TypeScript or JavaScript? · TypeScript
✔ Where to put your end-to-end tests? · tests
✔ Add a GitHub Actions workflow? · true
✔ Install Playwright browsers? · true
```

After completion, your project has:

```
├── playwright.config.ts          # Configuration
├── package.json                  # Dependencies
├── tests/
│   └── example.spec.ts           # Example test
├── tests-examples/
│   └── demo-todo-app.spec.ts     # Full-featured example
└── .github/
    └── workflows/
        └── playwright.yml        # CI workflow
```

## Deep Dive: The Configuration File

The `playwright.config.ts` file is the control center for your test suite. Here's a practical configuration with every commonly-used option explained:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Directory containing test files
  testDir: './tests',

  // Run tests within each file in parallel
  fullyParallel: true,

  // Fail the build on CI if test.only is left in code
  forbidOnly: !!process.env.CI,

  // Retry failed tests (more retries in CI where flakiness is harder to debug)
  retries: process.env.CI ? 2 : 0,

  // Number of parallel worker processes
  workers: process.env.CI ? 4 : undefined,

  // Reporter configuration
  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],

  // Shared settings for all projects
  use: {
    // Base URL for page.goto('/path') shorthand
    baseURL: 'http://localhost:3000',

    // Collect traces on first retry for debugging
    trace: 'on-first-retry',

    // Take screenshots on failure
    screenshot: 'only-on-failure',
  },

  // Browser configurations
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // Start your dev server before running tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### Key Configuration Concepts

**Projects** define browser/device combinations. Each project runs your entire test suite (or a subset) in a specific configuration. This replaces the need for separate scripts or CI jobs per browser.

**webServer** automatically starts your development server before tests run and shuts it down afterward. No more "forgot to start the server" failures.

**use** contains shared settings inherited by all projects. Projects can override these settings individually.

## Deep Dive: Writing Your First Test

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can log in with valid credentials', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/login');

  // Fill in the form
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');

  // Submit
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Assert we're on the dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
```

Let's break down what's happening:

1. **`test('description', async ({ page }) => { ... })`** --- The test function receives `page` as a fixture. Playwright creates a fresh browser context and page for every test automatically.

2. **`page.goto('/login')`** --- Navigates to the URL. The `/login` path is resolved against the `baseURL` in config. Playwright waits for the page to reach the `load` state by default.

3. **`page.getByLabel('Email')`** --- A semantic locator that finds the input associated with a label containing "Email". This is accessible, resilient, and reads like a user would describe the action.

4. **`.fill('user@example.com')`** --- Clears the input and types the value. Auto-waits for the element to be visible, enabled, and editable.

5. **`expect(page).toHaveURL('/dashboard')`** --- A web-first assertion that retries until the URL matches or the timeout expires. No manual wait needed.

## Deep Dive: Running Tests

### Command Line

```bash
# Run all tests across all configured browsers
npx playwright test

# Run a specific test file
npx playwright test tests/login.spec.ts

# Run tests matching a pattern
npx playwright test -g "login"

# Run only in Chromium
npx playwright test --project=chromium

# Run in headed mode (see the browser)
npx playwright test --headed

# Run with UI mode (interactive debugger)
npx playwright test --ui
```

### Understanding the Output

```
Running 15 tests using 4 workers

  ✓  [chromium] › tests/login.spec.ts:5:1 › user can log in (1.2s)
  ✓  [firefox]  › tests/login.spec.ts:5:1 › user can log in (1.8s)
  ✓  [webkit]   › tests/login.spec.ts:5:1 › user can log in (1.5s)
  ✓  [chromium] › tests/search.spec.ts:5:1 › search returns results (0.8s)
  ...

  15 passed (8.2s)
```

Each line shows: `[browser] › file:line › test name (duration)`

Tests run in parallel across workers by default. The worker count auto-scales to your CPU cores (half the cores, by default).

### Viewing the HTML Report

```bash
npx playwright show-report
```

This opens an interactive HTML report with:

- Pass/fail status per browser
- Test duration and timeline
- Screenshots on failure
- Trace files (if configured)
- Retry history

## Deep Dive: Codegen --- Record Your Tests

Playwright's codegen tool records your browser interactions and generates test code:

```bash
npx playwright codegen http://localhost:3000
```

This opens two windows:

1. **A browser window** where you interact with your application normally
2. **An inspector window** that shows the generated test code in real time

As you click, type, and navigate, codegen produces code like:

```typescript
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Products' }).click();
  await page.getByPlaceholder('Search products...').fill('laptop');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText('MacBook Pro')).toBeVisible();
});
```

### Codegen Tips

- **Use it for locator discovery.** Even if you don't use the generated test verbatim, codegen shows you the best locators for each element.
- **Record assertions.** Click the assertion button (checkmark icon) in the inspector, then click an element to generate an `expect` statement.
- **Emulate devices.** `npx playwright codegen --device="iPhone 13" http://localhost:3000` records with mobile viewport and user agent.
- **Set viewport size.** `npx playwright codegen --viewport-size=1280,720 http://localhost:3000`

## Deep Dive: VS Code Integration

The Playwright VS Code extension transforms the development experience:

### Running Tests

- **Green play button** next to each test to run it individually
- **Test Explorer** panel shows all tests organized by file
- **Right-click** to run in a specific browser or in debug mode

### Debugging

- Set breakpoints in test code
- Step through actions one at a time
- Inspect the browser at each step
- View locator matches highlighted in the browser

### Recording

- **Record new** generates a new test from browser interactions
- **Record at cursor** inserts recorded actions at the current cursor position in an existing test

### Pick Locator

The "Pick locator" feature lets you click any element in the browser and see the recommended locator for it. This is the fastest way to find robust locators.

## Practical Patterns: Project Structure

For a real project, organize tests by feature:

```
tests/
├── auth/
│   ├── login.spec.ts
│   ├── logout.spec.ts
│   └── registration.spec.ts
├── products/
│   ├── search.spec.ts
│   ├── detail.spec.ts
│   └── cart.spec.ts
├── checkout/
│   ├── payment.spec.ts
│   └── confirmation.spec.ts
└── fixtures/
    └── auth.fixture.ts
```

Each `.spec.ts` file can contain multiple tests grouped by `test.describe`:

```typescript
// tests/auth/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('succeeds with valid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('shows error with invalid password', async ({ page }) => {
    await page.getByLabel('Email').fill('user@example.com');
    await page.getByLabel('Password').fill('wrong');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Invalid credentials')).toBeVisible();
  });

  test('requires email field', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Email is required')).toBeVisible();
  });
});
```

## Tradeoffs and Limitations

- **Browser download.** The initial `playwright install` downloads ~500 MB of browsers. On slow connections, this is frustrating. Use `PLAYWRIGHT_BROWSERS_PATH` to cache them across projects.
- **Node.js only (for the test runner).** While Playwright has Python, Java, and .NET bindings, the `@playwright/test` runner is Node.js only. Other languages use their own test runners (pytest, JUnit, NUnit).
- **Configuration complexity.** The config file is powerful but can become complex for advanced setups with multiple projects, dependencies, and custom fixtures.
- **No built-in API mocking library.** `page.route()` intercepts network requests, but there's no built-in equivalent to MSW's handler composition. You build your own mocking layer.

## Conclusion

Getting started with Playwright is genuinely fast: one command to scaffold, one file to configure, and semantic locators that read like plain English. The codegen tool and VS Code extension eliminate the "how do I select this element" problem that slows down every other framework.

But installation speed isn't the real value. The real value is that everything you set up in these first five minutes --- the config, the locators, the test structure --- scales without modification to hundreds of tests across three browsers. You don't outgrow the initial setup; you grow into it.

---

*Next in the series: [Locators, Assertions, and Auto-Waiting](post-05-locators-assertions-and-waiting.md) --- The locator hierarchy, web-first assertions, and the 17 most common mistakes.*

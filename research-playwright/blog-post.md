# The Complete Playwright Guide: From Browser Protocols to CI Pipelines

A comprehensive guide to Playwright for test automation --- covering architecture, browser protocols, comparisons with Selenium and Cypress, practical usage, debugging, network mocking, visual regression, accessibility testing, and CI/CD scaling.

---

## Part 1: Browser Automation Has Evolved

Every test engineer has a Selenium horror story. The test that passed locally but failed in CI. The `Thread.sleep(5000)` that wasn't sleeping long enough. The `StaleElementReferenceException` that appeared from nowhere after a framework re-render.

Browser automation has been a "solved" problem since 2004, when Selenium first shipped. Except it hasn't been solved at all. For two decades, the gap between "browser automation is possible" and "browser automation is reliable" has cost teams thousands of hours in flaky test investigations.

In January 2020, a team at Microsoft --- several of whom had built Puppeteer at Google --- released Playwright. It wasn't another wrapper around WebDriver. It was a rethinking of how test code should communicate with browsers.

### What Playwright Actually Is

Playwright is an open-source framework for end-to-end testing and browser automation. It controls Chromium, Firefox, and WebKit through native browser protocols --- not through an external driver binary, not through injected JavaScript, but through the same debugging interfaces that browser DevTools use.

- **No WebDriver.** Direct communication over WebSockets using Chrome DevTools Protocol (Chromium), Juggler (Firefox), or the WebKit Inspector Protocol.
- **No injected scripts.** Tests run outside the browser process --- test code and application code never share a JavaScript context.
- **No driver version mismatches.** Playwright ships its own patched browser binaries guaranteed to work with the installed version.

### The History

**Selenium (2004)** defined browser automation with WebDriver --- an HTTP-based protocol requiring separate driver binaries for each browser. Every command is an HTTP request/response cycle, adding latency.

**Puppeteer (2017)** proved that native protocol communication (Chrome DevTools Protocol over WebSockets) was dramatically faster. But it only supported Chromium.

**Cypress (2017)** ran inside the browser for deep visibility but hit fundamental limits: no multi-tab support, no cross-origin navigation, single-browser architecture, 160+ dependencies in ~500 MB.

**Playwright (2020)** synthesized these lessons: native protocols for three browser engines, out-of-process architecture, auto-waiting, and browser contexts for isolation.

### The Numbers

| Metric | Value | Source |
|--------|-------|--------|
| GitHub stars | ~83,500 | GitHub |
| npm weekly downloads | 20M+ | npm |
| Speed vs Selenium | 264% faster | BrowserStack |
| Speed vs Cypress (parallel) | 35--45% faster | Checkly |
| Flaky test reduction | 40--60% fewer | Community reports |
| Package size | ~10 MB vs Cypress ~500 MB | BugBug |
| Dependencies | 1 vs Cypress 160+ | QA Wolf |
| Browser engines | 3 (Chromium, Firefox, WebKit) | Official |
| Language bindings | 4 (JS/TS, Python, Java, .NET) | Official |

### What Playwright Looks Like

To make this concrete, here is a Playwright test alongside the Selenium equivalent:

```typescript
// Playwright --- 7 lines, no manual waits
import { test, expect } from '@playwright/test';

test('user logs in and sees dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
```

```java
// Selenium --- 20+ lines, explicit waits
@Test
public void userLogsInAndSeesDashboard() {
    driver.get(baseUrl + "/login");
    WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));

    WebElement email = wait.until(
        ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[name='email']"))
    );
    email.sendKeys("user@example.com");

    WebElement password = driver.findElement(By.cssSelector("input[name='password']"));
    password.sendKeys("secret");

    WebElement button = driver.findElement(By.cssSelector("button[type='submit']"));
    button.click();

    wait.until(ExpectedConditions.urlContains("/dashboard"));
    WebElement heading = wait.until(
        ExpectedConditions.visibilityOfElementLocated(By.tagName("h1"))
    );
    assertEquals("Welcome", heading.getText());
}
```

The Playwright version has zero timing assumptions. Every action auto-waits. Every assertion auto-retries.

### Tradeoffs

Playwright is not perfect:

- **Ecosystem maturity.** Selenium has 20 years of plugins and community knowledge.
- **Mobile testing.** Playwright supports emulation but not real device control. Appium is still needed for native mobile.
- **Browser patching.** You test against patched binaries, not the exact binary users run.
- **Component testing.** Experimental in Playwright; mature in Cypress.

---

## Part 2: Architecture and Protocols

When you write `await page.click('button')`, seven things happen before the button is clicked. Understanding these steps is the difference between writing tests that work and understanding *why* they work.

### Three Layers

```
┌─────────────────────────────┐
│     Layer 1: Client API     │  ← Your test code
│     (playwright-core)       │
├─────────────────────────────┤
│     Layer 2: Server         │  ← Protocol translation + actionability
│     (playwright-server)     │
├─────────────────────────────┤
│     Layer 3: Browser        │  ← Patched browser binary
│     (native protocols)      │
└─────────────────────────────┘
```

**Layer 1 (Client API)** serializes commands and sends them to the server. This is what you write tests against.

**Layer 2 (Server)** translates commands into browser-specific protocol messages, manages lifecycle, implements auto-waiting, and runs the actionability engine.

**Layer 3 (Browser)** receives automation commands through native protocols: CDP for Chromium, Juggler for Firefox, WebKit Inspector Protocol for WebKit.

### The Three Protocols

**Chrome DevTools Protocol (CDP)** is the most mature browser automation protocol. It exposes domains like `DOM`, `Network`, `Runtime`, `Page`, and `Input`, each providing fine-grained control over browser internals.

| CDP Domain | Purpose | Example |
|------------|---------|---------|
| `Page` | Navigation, lifecycle events | `Page.navigate`, `Page.loadEventFired` |
| `DOM` | Element queries, mutations | `DOM.querySelector` |
| `Network` | Request interception | `Fetch.fulfillRequest` |
| `Runtime` | JavaScript evaluation | `Runtime.evaluate` |
| `Input` | Mouse, keyboard, touch | `Input.dispatchMouseEvent` |

**Juggler** is a custom automation protocol maintained as patches to Firefox's source code. It mirrors CDP's capabilities using Firefox-native APIs.

**WebKit Inspector Protocol** extends Safari's Web Inspector with automation-specific capabilities. Playwright patches WebKit to add headless mode, input dispatching, and network interception.

### Patched Browsers

Playwright ships patched browser binaries. The patches add automation APIs without modifying rendering engines (Blink, Gecko, WebKit) or JavaScript engines (V8, SpiderMonkey, JavaScriptCore). Web standards compliance is identical to unpatched browsers.

### Browser Contexts

A browser context is a lightweight, isolated session sharing a browser process but with independent cookies, storage, permissions, and proxy settings:

```typescript
const browser = await chromium.launch();
const userContext = await browser.newContext();
const adminContext = await browser.newContext();
// Each context is completely isolated
```

Creating a context takes **2--5 milliseconds** vs **1--3 seconds** for a new browser instance. This is why Playwright tests parallelize efficiently: each test gets a fresh context, not a fresh browser.

### The Actionability Engine

When you write `await page.click('#submit')`, the server performs six checks:

1. **Attached** --- Element is in the DOM
2. **Visible** --- Non-zero size, not hidden by CSS
3. **Stable** --- Bounding box unchanged across 2 animation frames
4. **Enabled** --- Not `disabled` or `aria-disabled`
5. **Receives Events** --- No overlay intercepting at click coordinates
6. **Editable** --- For input actions, accepts text input

If any check fails, Playwright retries using DOM mutation observers --- not polling.

### Communication Flow for a Click

```
Test Code                    Playwright Server               Browser (CDP)
────────                    ─────────────────               ──────────────
click('#submit')     →     resolve selector
                           ←──────────────────────────→     DOM.querySelector
                           check visibility
                           ←──────────────────────────→     Runtime.evaluate
                           check stability (2 frames)
                           ←──────────────────────────→     Runtime.evaluate ×2
                           check receives events
                           ←──────────────────────────→     Runtime.evaluate
                           dispatch click
                           ←──────────────────────────→     Input.dispatchMouseEvent ×3
                    ←      return success
```

This completes in under 20 milliseconds for a ready element.

---

## Part 3: Playwright vs Everyone

### vs Selenium: 264% Faster

The speed difference comes from protocol architecture. Selenium makes HTTP round trips for every command. Playwright uses a persistent WebSocket connection:

```
Selenium: Test → HTTP POST → Driver → Browser → HTTP Response (per command)
Playwright: Test ↔ WebSocket ↔ Browser (persistent, bidirectional)
```

Playwright's locators eliminate `StaleElementReferenceException` entirely --- locators re-query the DOM on every action. There is no stored element reference to go stale.

Playwright's locators solve another major Selenium pain point --- `StaleElementReferenceException`:

```java
// Selenium: Element reference can go stale
WebElement button = driver.findElement(By.id("submit"));
// React re-renders here...
button.click(); // StaleElementReferenceException!
```

```typescript
// Playwright: Locators always re-query the DOM
await page.locator('#submit').click(); // Always finds the current element
```

**Selenium wins on:** real device testing (Appium), legacy browser support (IE11), ecosystem maturity (20 years), and W3C WebDriver standards compliance.

### vs Cypress: Architecture Determines Capability

Cypress runs inside the browser. Playwright runs outside it.

```
Cypress:
┌──────────────────────────────────────┐
│ Browser                              │
│ ┌──────────────┐ ┌────────────────┐  │
│ │ Test Code    │ │ Application    │  │
│ │ (Cypress)    │ │ (Your App)     │  │
│ └──────────────┘ └────────────────┘  │
└──────────────────────────────────────┘

Playwright:
┌────────────────┐    ┌────────────────┐
│ Test Process   │◄──►│ Browser        │
│ (Node.js)      │ WS │ (Application)  │
└────────────────┘    └────────────────┘
```

This architectural difference creates hard limits:

| Capability | Cypress | Playwright |
|------------|---------|------------|
| Multi-tab testing | Not possible | Full support |
| Multi-origin navigation | Limited | Full support |
| Network interception | Application-level | Protocol-level |
| Parallel execution | Requires Cypress Cloud | Built-in workers |
| Package size | ~500 MB | ~10 MB |
| Dependencies | 160+ | 1 |

Checkly benchmarks show Playwright 35--45% faster in parallel scenarios.

**Cypress wins on:** component testing maturity, learning curve (jQuery-like API), and existing ecosystem investment.

### vs Puppeteer

Playwright's team built Puppeteer. Playwright adds: three browsers (vs Chromium-only), a built-in test runner, auto-waiting, locators, web-first assertions, fixtures, reporters, and parallelism.

Puppeteer has lower protocol overhead (11 KB vs 326 KB initial payload) --- relevant for high-frequency scraping, negligible for test suites.

### vs WebDriverIO

WebDriverIO bridges WebDriver and CDP protocols. It wins on: mobile testing (Appium integration), Cucumber/BDD workflows, and real device farms. Playwright wins on: speed, cross-browser coverage, and out-of-the-box experience.

### Migration Decision Framework

**Migrate to Playwright if:**

- Flaky tests are consuming significant engineering time
- You need multi-browser testing (especially WebKit/Safari)
- CI pipeline time is a bottleneck
- You need multi-tab or multi-origin test scenarios
- Package size and dependency count matter to your security team

**Stay where you are if:**

- Your current suite is stable and fast enough
- You need real mobile device testing (stay with Selenium/WebDriverIO)
- Component testing is your primary use case (stay with Cypress)
- Your team's expertise is deeply invested in the current tool
- Migration cost outweighs the performance gains for your suite size

### Puppeteer vs Playwright Performance Detail

Lightpanda's benchmarks reveal nuanced performance differences:

| Metric | Puppeteer | Playwright | Winner |
|--------|-----------|------------|--------|
| Initial WebSocket payload | 11 KB | 326 KB | Puppeteer (30x less) |
| Per-command overhead | ~0.5ms | ~0.8ms | Puppeteer |
| Test with 50 actions (amortized) | ~25ms overhead | ~40ms + 326KB init | Puppeteer |
| Full suite (100 tests) | N/A | Negligible difference | Tie |

For high-frequency automation (scraping, monitoring with thousands of protocol calls), Puppeteer's lower overhead matters. For test suites where each test makes 10--50 actions, page load and rendering time dwarf protocol overhead.

---

## Part 4: From Zero to Running Tests

### One Command to Start

```bash
npm init playwright@latest
```

This scaffolds a complete project: config file, example tests, CI workflow, and installs all three browser engines.

### Configuration

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,

  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github']]
    : [['html', { open: 'on-failure' }]],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Your First Test

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can log in with valid credentials', async ({ page }) => {
  // Navigate to the login page
  await page.goto('/login');

  // Fill in the form using semantic locators
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password123');

  // Submit the form
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Assert we're on the dashboard
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
```

Breaking down what happens:

1. **`test('description', async ({ page }) => { ... })`** --- The test function receives `page` as a fixture. Playwright creates a fresh browser context and page for every test.
2. **`page.goto('/login')`** --- Navigates to the URL, resolved against `baseURL` in config. Waits for the `load` event.
3. **`page.getByLabel('Email')`** --- Finds the input associated with a label containing "Email". Semantic, resilient, accessible.
4. **`.fill('user@example.com')`** --- Clears input and types. Auto-waits for visible, enabled, and editable.
5. **`expect(page).toHaveURL('/dashboard')`** --- Web-first assertion that retries until match or timeout.

### Project Structure

Organize tests by feature for real projects:

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

  test('shows error for invalid password', async ({ page }) => {
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

### Running Tests

```bash
npx playwright test                          # All tests, all browsers
npx playwright test tests/login.spec.ts      # Specific file
npx playwright test -g "login"               # Match by name
npx playwright test --project=chromium       # Single browser
npx playwright test --headed                 # See the browser
npx playwright test --ui                     # Interactive UI mode
```

### Codegen

```bash
npx playwright codegen http://localhost:3000
```

Records browser interactions and generates test code in real time. Also useful for discovering locators.

### VS Code Integration

The Playwright VS Code extension provides: play buttons next to tests, debugging with breakpoints, test recording, and a locator picker.

---

## Part 5: Locators, Assertions, and Auto-Waiting

### The Locator Hierarchy

Use locators in this priority order:

```typescript
// 1. Role-based (BEST)
page.getByRole('button', { name: 'Submit' })

// 2. Label-based
page.getByLabel('Email address')

// 3. Placeholder-based
page.getByPlaceholder('Search...')

// 4. Text-based
page.getByText('Welcome back')

// 5. Alt text
page.getByAltText('Company logo')

// 6. Title attribute
page.getByTitle('Close dialog')

// 7. Test ID (last resort)
page.getByTestId('submit-button')
```

**Why role-based is best:** `getByRole` uses the ARIA role tree --- the same model screen readers use. If `getByRole` can't find your element, a screen reader can't either. Your test doubles as an accessibility check.

### Chaining and Filtering

```typescript
// Chain to narrow scope
const loginForm = page.getByRole('form', { name: 'Login' });
await loginForm.getByLabel('Email').fill('user@example.com');

// Filter by content
await page.getByRole('row')
  .filter({ hasText: 'John' })
  .getByRole('button', { name: 'Edit' })
  .click();

// Filter by child element
await page.locator('.card')
  .filter({ has: page.getByRole('heading', { name: 'Premium' }) })
  .getByRole('button', { name: 'Select' })
  .click();
```

### Web-First Assertions

Web-first assertions automatically retry until the condition is met:

```typescript
// WRONG: Checks once, no retry
const text = await page.locator('#status').textContent();
expect(text).toBe('Loaded');

// RIGHT: Retries until match or timeout
await expect(page.locator('#status')).toHaveText('Loaded');
```

Key assertions:

```typescript
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toBeEnabled();
await expect(locator).toBeChecked();
await expect(locator).toHaveText('exact text');
await expect(locator).toContainText('partial');
await expect(locator).toHaveValue('input value');
await expect(locator).toHaveAttribute('href', '/dashboard');
await expect(locator).toHaveCount(5);
await expect(page).toHaveURL('/dashboard');
await expect(page).toHaveTitle('My App');
await expect(locator).toHaveScreenshot('component.png');
```

### Auto-Waiting

Every action waits for the element to be actionable (attached, visible, stable, enabled, receives events). The stability check verifies the bounding box is unchanged across two animation frames. The "receives events" check uses `elementFromPoint()` to detect overlays.

### Common Mistakes

These represent real patterns found in production codebases:

**1. Using waitForTimeout (arbitrary waits)**
```typescript
// BAD
await page.waitForTimeout(3000);
await page.click('#submit');

// GOOD
await page.getByRole('button', { name: 'Submit' }).click();
```

**2. Manual visibility checks before actions**
```typescript
// BAD: Redundant --- click already waits for visibility
await expect(page.getByRole('button')).toBeVisible();
await page.getByRole('button').click();

// GOOD
await page.getByRole('button', { name: 'Submit' }).click();
```

**3. CSS selectors when semantic locators exist**
```typescript
// BAD
await page.locator('button.btn-primary.submit-form').click();

// GOOD
await page.getByRole('button', { name: 'Submit' }).click();
```

**4. Extracting text then asserting**
```typescript
// BAD: Single check, no retry
const text = await page.locator('.status').textContent();
expect(text).toContain('Success');

// GOOD: Web-first with auto-retry
await expect(page.locator('.status')).toContainText('Success');
```

**5. Using page.$ (stale ElementHandle)**
```typescript
// BAD
const element = await page.$('#submit');
await element?.click();

// GOOD
await page.locator('#submit').click();
```

**6. Using force: true**
```typescript
// BAD: Bypasses all safety checks
await page.click('#submit', { force: true });

// FIX: Understand why the element isn't actionable
```

**7. Forgetting await on assertions**
```typescript
// BAD: Floating promise, never executes
expect(page.locator('.status')).toHaveText('Done');

// GOOD
await expect(page.locator('.status')).toHaveText('Done');
```

**8. toHaveText vs toContainText**
```typescript
// Element text: "Total: $49.99 (including tax)"

// BAD: Exact match fails
await expect(locator).toHaveText('$49.99');

// GOOD: Partial match or regex
await expect(locator).toContainText('$49.99');
await expect(locator).toHaveText(/\$49\.99/);
```

**9. Count without web-first assertion**
```typescript
// BAD: Might check before items load
const count = await page.locator('.item').count();
expect(count).toBe(10);

// GOOD
await expect(page.locator('.item')).toHaveCount(10);
```

**10. page.url() instead of toHaveURL**
```typescript
// BAD: No retry
expect(page.url()).toBe('http://localhost:3000/dashboard');

// GOOD: Retries until URL matches
await expect(page).toHaveURL('/dashboard');
```

**11. Overly specific locators**
```typescript
// BAD: Breaks if any parent changes
page.locator('div.content > div.main > section:first-child > form > button');

// GOOD
page.getByRole('button', { name: 'Submit' });
```

**12. Not using frameLocator for iframes**
```typescript
// BAD: Can't find elements inside iframes
await page.getByRole('button', { name: 'Pay' }).click();

// GOOD
await page.frameLocator('iframe[name="payment"]')
  .getByRole('button', { name: 'Pay' })
  .click();
```

**13. Ignoring strict mode violations**
```typescript
// Error: strict mode violation: getByRole('button') resolved to 5 elements
// FIX: Be more specific
await page.getByRole('button', { name: 'Submit' }).click();
```

---

## Part 6: Page Object Model and Custom Fixtures

### Page Object Model

POM encapsulates page interactions behind a clean interface:

```typescript
// pages/login.page.ts
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

```typescript
// tests/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';

test('succeeds with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```

### POM Design Principles

| Principle | Do | Don't |
|-----------|----|----|
| Encapsulate locators | Define in constructor | Expose raw selectors |
| Name by intent | `login()`, `createProject()` | `fillFormAndClickButton()` |
| Keep assertions in tests | Let tests decide what to assert | Put all assertions in POM |
| One class per page | `LoginPage`, `NavBar` | `AllPages` |

### Custom Fixtures

Fixtures provide resources that tests declare as dependencies:

```typescript
// fixtures/pages.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});

export { expect } from '@playwright/test';
```

```typescript
// Test declares what it needs --- no manual construction
test('user sees dashboard', async ({ loginPage, dashboardPage }) => {
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  await dashboardPage.expectLoaded();
});
```

### Fixture Scoping

**Test-scoped** (default) --- fresh for every test. Use for page objects and test data.

**Worker-scoped** --- created once per worker process. Use for expensive resources:

```typescript
export const test = base.extend<TestFixtures, WorkerFixtures>({
  dbConnection: [async ({}, use) => {
    const db = await DatabaseConnection.create();
    await use(db);
    await db.close();
  }, { scope: 'worker' }],
});
```

### Authentication via storageState

Save browser state (cookies, localStorage) and reuse it:

```typescript
// tests/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('admin-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.context().storageState({ path: '.auth/admin.json' });
});
```

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { storageState: '.auth/admin.json' },
      dependencies: ['setup'],
    },
  ],
});
```

Every test starts already logged in. No UI login per test --- saves ~2 seconds per test.

### Multiple Roles

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'admin-tests',
      use: { storageState: '.auth/admin.json' },
      dependencies: ['setup'],
    },
    {
      name: 'user-tests',
      use: { storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'logged-out-tests',
      use: {},
      testMatch: /.*\.anon\.spec\.ts/,
    },
  ],
});
```

### Full Fixture Architecture

```
tests/
├── fixtures/
│   ├── base.fixture.ts          # Core fixtures (pages, auth)
│   ├── api.fixture.ts           # API client fixtures
│   └── data.fixture.ts          # Test data fixtures
├── pages/
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   └── components/
│       ├── navbar.component.ts
│       └── modal.component.ts
├── auth/
│   └── auth.setup.ts
├── features/
│   ├── login.spec.ts
│   └── dashboard.spec.ts
└── .auth/                       # Generated auth state (gitignored)
    ├── admin.json
    └── user.json
```

### Fixture Composition

Fixtures can depend on other fixtures:

```typescript
type Fixtures = {
  loginPage: LoginPage;
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // This fixture depends on loginPage
  authenticatedPage: async ({ loginPage, page }, use) => {
    await loginPage.goto();
    await loginPage.login('user@example.com', 'password123');
    await use(page);
  },
});
```

### Automatic Fixtures

Run for every test without being requested:

```typescript
export const test = base.extend<{}>({
  logTestName: [async ({}, use, testInfo) => {
    console.log(`Starting: ${testInfo.title}`);
    await use();
    console.log(`Finished: ${testInfo.title} - ${testInfo.status}`);
  }, { auto: true }],
});
```

---

## Part 7: Debugging

### The Debugging Spectrum

| Where It Fails | Best Tool |
|----------------|-----------|
| While writing | **Inspector** (`--debug` or `page.pause()`) |
| Locally, intermittent | **UI Mode** (`--ui`) |
| In CI, reproducible | **Trace Viewer** |
| In CI, flaky | **Trace on retry** + **video** |
| In VS Code | **VS Code Extension** with breakpoints |

### The Inspector

```bash
PWDEBUG=1 npx playwright test tests/login.spec.ts
# Or:
npx playwright test --debug
```

Insert `page.pause()` to pause at a specific point:

```typescript
test('debug example', async ({ page }) => {
  await page.goto('/products');
  await page.pause(); // Inspector opens here
  await page.getByRole('button', { name: 'Buy' }).click();
});
```

### Trace Viewer

Playwright's most powerful debugging tool. Records everything: actions, DOM snapshots (before/after), network requests, console messages, and source code.

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    trace: 'on-first-retry', // Record traces when retrying failed tests
  },
});
```

**Five layers** in a trace:

1. **Actions Timeline** --- click, fill, goto with timing
2. **DOM Snapshots** --- before and after each action
3. **Console Log** --- log, error, warn
4. **Network Requests** --- URL, status, timing, body
5. **Source Code** --- test source with highlighted line

```bash
npx playwright show-trace trace.zip
```

### UI Mode

```bash
npx playwright test --ui
```

Interactive test runner with time-travel debugging, watch mode, and live DOM exploration.

### CI Debugging Workflow

```typescript
export default defineConfig({
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  retries: process.env.CI ? 2 : 0,
});
```

```yaml
# Upload artifacts in GitHub Actions
- name: Upload test report
  uses: actions/upload-artifact@v4
  if: ${{ !cancelled() }}
  with:
    name: playwright-report
    path: playwright-report/
```

### Debugging Patterns

```bash
# Verbose protocol logging
DEBUG=pw:api npx playwright test tests/login.spec.ts

# Slow motion
# In config: use: { launchOptions: { slowMo: 500 } }
```

### Pattern: Debug Only the Failing Test

```bash
npx playwright test -g "exact test name" --debug
```

### Pattern: Custom Console Logging

```typescript
test('debug network', async ({ page }) => {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE ERROR: ${msg.text()}`);
    }
  });

  page.on('requestfailed', request => {
    console.log(`FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });

  await page.goto('/dashboard');
});
```

### Pattern: Screenshot at Key Points

```typescript
test('multi-step flow', async ({ page }) => {
  await page.goto('/checkout');
  await page.screenshot({ path: 'debug/step-1-checkout.png' });

  await page.getByRole('button', { name: 'Continue' }).click();
  await page.screenshot({ path: 'debug/step-2-shipping.png' });

  await page.getByRole('button', { name: 'Place order' }).click();
  await page.screenshot({ path: 'debug/step-3-confirmation.png' });
});
```

### Trace File Sizes

| Trace Strategy | When Recorded | Typical Size | Best For |
|----------------|---------------|--------------|----------|
| `off` | Never | 0 | Speed-critical runs |
| `on` | Every test | 5--50 MB/test | Debugging phase |
| `on-first-retry` | On retry | 5--50 MB (only failures) | CI (recommended) |
| `retain-on-failure` | Every test, keep failures | Varies | Comprehensive but heavy |

---

## Part 8: Network Control

### Protocol-Level Interception

Playwright intercepts at the browser protocol level --- below JavaScript, below service workers. It catches everything: XHR, fetch, images, fonts, CSS, WebSockets.

### page.route()

```typescript
// Mock an API response
await page.route('**/api/products', async (route) => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify([
      { id: 1, name: 'Laptop', price: 999 },
    ]),
  });
});
```

```typescript
// Abort requests (block analytics, ads)
await page.route('**/{google-analytics,segment}**', (route) => route.abort());
```

```typescript
// Modify requests (add headers)
await page.route('**/api/**', async (route) => {
  await route.continue({
    headers: { ...route.request().headers(), 'Authorization': 'Bearer token' },
  });
});
```

```typescript
// Modify responses (inject feature flags)
await page.route('**/api/flags', async (route) => {
  const response = await route.fetch();
  const json = await response.json();
  json.newFeature = true;
  await route.fulfill({ response, body: JSON.stringify(json) });
});
```

### HAR Record and Replay

```typescript
// Record mode
await page.routeFromHAR('tests/fixtures/api.har', {
  url: '**/api/**',
  update: true, // Save to file
});

// Replay mode
await page.routeFromHAR('tests/fixtures/api.har', {
  url: '**/api/**',
  update: false, // Serve from file
});
```

**HAR workflow:** Record against real server → commit `.har` file → replay for deterministic tests → re-record when API changes.

### WebSocket Mocking

```typescript
await page.routeWebSocket('wss://chat.example.com/**', (ws) => {
  ws.onMessage((message) => {
    const data = JSON.parse(message.toString());
    if (data.type === 'join') {
      ws.send(JSON.stringify({ type: 'joined', users: ['Alice'] }));
    }
  });
});
```

### API Testing with APIRequestContext

```typescript
test('creates a product via API', async ({ request }) => {
  const response = await request.post('/api/products', {
    data: { name: 'Widget', price: 29.99 },
  });
  expect(response.status()).toBe(201);
  const product = await response.json();
  expect(product.name).toBe('Widget');
});
```

```typescript
// Combine API setup with UI verification
test('product appears in UI', async ({ page, request }) => {
  await request.post('/api/products', {
    data: { name: 'Test Product', price: 99 },
  });

  await page.goto('/products');
  await expect(page.getByText('Test Product')).toBeVisible();
});
```

### Practical Patterns

**Simulate API errors:**
```typescript
test('shows error state on API failure', async ({ page }) => {
  await page.route('**/api/products', (route) => {
    route.fulfill({ status: 500, body: 'Internal Server Error' });
  });

  await page.goto('/products');
  await expect(page.getByText('Failed to load products')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
});
```

**Simulate slow responses (test loading states):**
```typescript
test('shows loading state', async ({ page }) => {
  await page.route('**/api/products', async (route) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.goto('/products');
  await expect(page.getByText('Loading...')).toBeVisible();
  await expect(page.getByText('Loading...')).not.toBeVisible({ timeout: 5000 });
});
```

**Capture and validate request body:**
```typescript
test('sends correct data on form submit', async ({ page }) => {
  let capturedRequest: any;

  await page.route('**/api/orders', async (route) => {
    capturedRequest = route.request().postDataJSON();
    await route.fulfill({ status: 201, body: '{"id": 1}' });
  });

  await page.goto('/checkout');
  await page.getByLabel('Name').fill('John Doe');
  await page.getByLabel('Address').fill('123 Main St');
  await page.getByRole('button', { name: 'Place order' }).click();

  expect(capturedRequest).toEqual({
    name: 'John Doe',
    address: '123 Main St',
  });
});
```

**Wait for API response before asserting:**
```typescript
test('navigates after save', async ({ page }) => {
  await page.goto('/editor');
  await page.getByLabel('Title').fill('My Article');

  // Start waiting BEFORE triggering the action
  const responsePromise = page.waitForResponse('**/api/articles');
  await page.getByRole('button', { name: 'Save' }).click();

  const response = await responsePromise;
  expect(response.status()).toBe(200);
  await expect(page).toHaveURL(/\/articles\/\d+/);
});
```

**Mock with conditional logic:**
```typescript
test('handles pagination', async ({ page }) => {
  await page.route('**/api/products*', async (route) => {
    const url = new URL(route.request().url());
    const pageNum = parseInt(url.searchParams.get('page') || '1');

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: Array.from({ length: 10 }, (_, i) => ({
          id: (pageNum - 1) * 10 + i + 1,
          name: `Product ${(pageNum - 1) * 10 + i + 1}`,
        })),
        totalPages: 5,
      }),
    });
  });

  await page.goto('/products');
  await expect(page.getByText('Product 1')).toBeVisible();
  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.getByText('Product 11')).toBeVisible();
});
```

### When to Mock vs When Not To

| Scenario | Use Mocking | Use Real API |
|----------|-------------|--------------|
| External dependencies (payment, auth) | Yes | No |
| Error and edge case scenarios | Yes | No |
| Loading state testing | Yes | No |
| Core business logic validation | No | Yes |
| Integration/contract testing | No | Yes |
| Performance testing | No | Yes |

---

## Part 9: Visual Regression and Accessibility

### Visual Regression with toHaveScreenshot()

```typescript
// Full page
await expect(page).toHaveScreenshot('checkout.png');

// Element
await expect(page.locator('.card')).toHaveScreenshot('card.png');

// With options
await expect(page).toHaveScreenshot('dashboard.png', {
  maxDiffPixels: 100,
  threshold: 0.2,
  animations: 'disabled',
  mask: [page.locator('.timestamp'), page.locator('.avatar')],
});
```

**First run** creates baseline images. **Subsequent runs** compare against baselines. Update with `--update-snapshots`.

Screenshots are stored per-browser and per-platform (rendering differs). Use Docker for consistent CI screenshots.

### Handling Dynamic Content

```typescript
test('dashboard visual test', async ({ page }) => {
  // Mock dynamic data
  await page.route('**/api/dashboard', (route) => {
    route.fulfill({ body: JSON.stringify({ lastLogin: '2024-01-15', user: 'Test' }) });
  });

  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png', {
    animations: 'disabled',
    mask: [page.locator('[data-testid="live-clock"]')],
  });
});
```

### Responsive Testing

```typescript
const viewports = [
  { width: 375, height: 812, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1440, height: 900, name: 'desktop' },
];

for (const vp of viewports) {
  test(`home at ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');
    await expect(page).toHaveScreenshot(`home-${vp.name}.png`);
  });
}
```

### Accessibility Testing with axe-core

```bash
npm install -D @axe-core/playwright
```

```typescript
import AxeBuilder from '@axe-core/playwright';

test('home page is accessible', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

### WCAG Compliance Levels

```typescript
test('meets WCAG 2.1 AA', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### Targeted Scans

```typescript
const results = await new AxeBuilder({ page })
  .include('main')                  // Only scan main content
  .exclude('.third-party-widget')   // Skip what you can't control
  .analyze();
```

### Common Accessibility Rules

| Rule | Description | Impact |
|------|-------------|--------|
| `color-contrast` | Sufficient text contrast | Serious |
| `image-alt` | Images have alt text | Critical |
| `label` | Form inputs have labels | Critical |
| `link-name` | Links have discernible text | Serious |
| `button-name` | Buttons have discernible text | Critical |
| `heading-order` | Logical heading hierarchy | Moderate |
| `keyboard-access` | Interactive elements keyboard accessible | Critical |

### Accessibility Fixture

```typescript
import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export const test = base.extend<{ makeAxeBuilder: () => AxeBuilder }>({
  makeAxeBuilder: async ({ page }, use) => {
    await use(() => new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    );
  },
});
```

```typescript
const pages = ['/', '/products', '/about', '/contact'];

for (const path of pages) {
  test(`${path} meets WCAG 2.1 AA`, async ({ page, makeAxeBuilder }) => {
    await page.goto(path);
    const results = await makeAxeBuilder().analyze();
    expect(results.violations).toEqual([]);
  });
}
```

### Keyboard Navigation Testing

```typescript
test('form navigable by keyboard', async ({ page }) => {
  await page.goto('/contact');

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

### Dark Mode Visual Testing

```typescript
test('supports dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await expect(page).toHaveScreenshot('home-light.png');

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page).toHaveScreenshot('home-dark.png');
});
```

### Component-Level Visual Testing with Storybook

```typescript
const components = [
  'button--primary',
  'button--secondary',
  'card--default',
  'card--with-image',
  'modal--open',
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

### Visual + Accessibility Combined

```typescript
test('product page is correct and accessible', async ({ page }) => {
  await page.goto('/products/laptop');

  // Visual regression
  await expect(page).toHaveScreenshot('product-laptop.png', {
    mask: [page.locator('.price'), page.locator('.stock-count')],
  });

  // Accessibility audit
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});
```

### Detailed Violation Reporting

```typescript
test('accessible with report', async ({ page }) => {
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
    console.log('Violations:', JSON.stringify(report, null, 2));
  }

  expect(results.violations).toEqual([]);
});
```

### Visual Testing Tradeoffs

- **Platform dependency.** Font rendering differs across OS and GPU. Use Docker for consistent CI.
- **Maintenance burden.** Every UI change requires updating baselines.
- **False positives.** Dynamic content and animations cause false failures. Use masking and `animations: 'disabled'`.
- **Storage cost.** Screenshot files grow repository size. Consider Git LFS for large suites.

### Accessibility Testing Limitations

- **Not a complete audit.** axe-core catches ~57% of WCAG issues automatically.
- **Manual testing still needed.** Screen reader testing, cognitive accessibility, and time-based media.
- **False negatives.** Some violations require human judgment (e.g., meaningful alt text).

---

## Part 10: Parallel Execution, Sharding, and CI/CD

### Three Levels of Parallelism

```
Level 1: Shards          → Across CI machines
Level 2: Workers          → Across CPU cores within a machine
Level 3: fullyParallel    → Individual tests within a file
```

### Worker Configuration

```typescript
export default defineConfig({
  workers: process.env.CI ? 4 : undefined,  // undefined = half of CPUs
  fullyParallel: true,
  maxFailures: process.env.CI ? 20 : undefined,
});
```

**Worker recommendations:**

| Runner | vCPUs | Workers |
|--------|-------|---------|
| GitHub Actions (standard) | 2 | 2 |
| GitHub Actions (large) | 4--8 | 3--6 |
| Self-hosted (8+ cores) | 4--6 | 4--6 |

Each worker launches a browser instance (~100--200 MB per context). Memory formula: `(Available RAM - 2 GB) / 300 MB ≈ max workers`.

### Sequential Tests

```typescript
test.describe.serial('checkout flow', () => {
  test('add to cart', async ({ page }) => { /* ... */ });
  test('enter shipping', async ({ page }) => { /* ... */ });
  test('complete payment', async ({ page }) => { /* ... */ });
});
```

Avoid `test.describe.serial` when possible --- prefer independent tests with fixtures.

### Sharding

```bash
npx playwright test --shard=1/4  # Machine 1
npx playwright test --shard=2/4  # Machine 2
npx playwright test --shard=3/4  # Machine 3
npx playwright test --shard=4/4  # Machine 4
```

### GitHub Actions with Sharding

```yaml
name: Playwright Tests
on: [push, pull_request]

jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=${{ matrix.shard }}

      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: blob-report-${{ strategy.job-index }}
          path: blob-report/
          retention-days: 1

  merge-reports:
    needs: test
    if: ${{ !cancelled() }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true

      - run: npx playwright merge-reports --reporter html ./all-blob-reports

      - uses: actions/upload-artifact@v4
        with:
          name: html-report
          path: playwright-report/
          retention-days: 14
```

### Retries

```typescript
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: 'on-first-retry', // Capture trace on retry (not first attempt)
  },
});
```

Retry behavior: fail → retry 1 (with trace) → if passes, marked "flaky" → if fails, retry 2 → if fails, marked "failed".

### Docker

```dockerfile
FROM mcr.microsoft.com/playwright:v1.48.0-jammy
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npx", "playwright", "test"]
```

### Browser Caching in CI

```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ hashFiles('**/package-lock.json') }}

- run: npx playwright install --with-deps
```

### Reporters

| Reporter | Use Case |
|----------|----------|
| `list` | Local development |
| `dot` | Quick CI overview |
| `html` | Detailed investigation |
| `json` | Custom processing |
| `junit` | Jenkins, GitLab |
| `github` | PR annotations |
| `blob` | Sharded runs (mergeable) |

```typescript
export default defineConfig({
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'results.xml' }],
    ['github'],
  ],
});
```

### Custom Reporter

```typescript
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';

class SlackReporter implements Reporter {
  private failures: string[] = [];

  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') {
      this.failures.push(`${test.title} (${test.location.file}:${test.location.line})`);
    }
  }

  async onEnd() {
    if (this.failures.length > 0) {
      await fetch(process.env.SLACK_WEBHOOK!, {
        method: 'POST',
        body: JSON.stringify({
          text: `${this.failures.length} tests failed:\n${this.failures.join('\n')}`,
        }),
      });
    }
  }
}

export default SlackReporter;
```

### Tag-Based Selection

```typescript
test('checkout @smoke @critical', async ({ page }) => { /* ... */ });
test('guest checkout @regression', async ({ page }) => { /* ... */ });
```

```bash
npx playwright test --grep @smoke
npx playwright test --grep-invert @regression
```

### CI-Optimized Config (Complete)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  maxFailures: process.env.CI ? 20 : undefined,

  reporter: process.env.CI
    ? [['blob'], ['github']]
    : [['html', { open: 'on-failure' }]],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: '.auth/user.json' },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

### Global Setup and Teardown

```typescript
// playwright.config.ts
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
});
```

```typescript
// global-setup.ts
async function globalSetup() {
  // Seed test database, start services, etc.
}
export default globalSetup;
```

```typescript
// global-teardown.ts
async function globalTeardown() {
  // Clean up test data, stop services
}
export default globalTeardown;
```

### Docker for Consistent Environments

```dockerfile
FROM mcr.microsoft.com/playwright:v1.48.0-jammy
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npx", "playwright", "test"]
```

```bash
docker build -t playwright-tests .
docker run --rm playwright-tests
```

### Browser Caching in CI

```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ hashFiles('**/package-lock.json') }}

- name: Install Playwright browsers
  run: npx playwright install --with-deps
```

### Essential CLI Reference

```bash
# Running tests
npx playwright test                        # Run all
npx playwright test tests/login.spec.ts    # Specific file
npx playwright test -g "pattern"           # Filter by name
npx playwright test --project=chromium     # Single browser
npx playwright test --workers=4            # Set workers
npx playwright test --retries=2            # Set retries
npx playwright test --shard=1/4            # Run shard
npx playwright test --headed               # See the browser
npx playwright test --grep @smoke          # Tag-based selection
npx playwright test --grep-invert @slow    # Exclude tags

# Updating and listing
npx playwright test --update-snapshots     # Update visual baselines
npx playwright test --list                 # List tests without running

# Interactive tools
npx playwright test --ui                   # Interactive UI mode
npx playwright test --debug                # Debug mode with Inspector
npx playwright codegen http://localhost:3000  # Record tests

# Reporting
npx playwright show-report                 # Open HTML report
npx playwright show-trace trace.zip        # Open trace file
npx playwright merge-reports ./blobs       # Merge sharded reports

# Browser management
npx playwright install                     # Install all browsers
npx playwright install chromium            # Install specific browser
npx playwright install-deps               # Install system dependencies
```

### Scaling Tradeoffs

- **Sharding granularity.** Shards distribute files, not tests. Split large test files for even distribution.
- **Worker startup cost.** Each worker launches a browser (~1--2s). For fast tests, fewer workers with more tests can be faster.
- **Retry masking.** Tests that pass on retry are still flaky. Track flaky rates and fix root causes.
- **Cache staleness.** CI caches can become stale on version changes. Key on `package-lock.json`.
- **Resource contention.** Too many workers on small runners causes CPU thrashing.

---

---

## Part 11: Practical Recipes and Advanced Patterns

### Multi-Tab Testing

```typescript
test('opens link in new tab', async ({ context, page }) => {
  await page.goto('/');

  // Listen for new page (tab) events
  const [newPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: 'External docs' }).click(),
  ]);

  // Work with both tabs
  await expect(newPage).toHaveURL(/docs\.example\.com/);
  await expect(newPage.getByRole('heading')).toContainText('Documentation');

  // Switch back to original tab
  await page.bringToFront();
  await expect(page).toHaveURL('/');
});
```

### File Upload and Download

```typescript
test('uploads a file', async ({ page }) => {
  await page.goto('/upload');

  // Upload a file
  await page.getByLabel('Choose file').setInputFiles('tests/fixtures/report.pdf');
  await page.getByRole('button', { name: 'Upload' }).click();
  await expect(page.getByText('Upload successful')).toBeVisible();
});

test('downloads a file', async ({ page }) => {
  await page.goto('/reports');

  // Start waiting for download before clicking
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: 'Download report' }).click(),
  ]);

  // Verify download
  expect(download.suggestedFilename()).toBe('report.pdf');

  // Save to disk
  await download.saveAs('tests/downloads/report.pdf');
});
```

### Dialog Handling

```typescript
test('handles confirmation dialog', async ({ page }) => {
  await page.goto('/settings');

  // Set up dialog handler BEFORE the action that triggers it
  page.on('dialog', async (dialog) => {
    expect(dialog.type()).toBe('confirm');
    expect(dialog.message()).toContain('Are you sure');
    await dialog.accept();
  });

  await page.getByRole('button', { name: 'Delete account' }).click();
  await expect(page.getByText('Account deleted')).toBeVisible();
});
```

### Geolocation and Permissions

```typescript
test('shows nearby stores', async ({ context, page }) => {
  // Grant geolocation permission and set location
  await context.grantPermissions(['geolocation']);
  await context.setGeolocation({ latitude: 40.7128, longitude: -74.0060 });

  await page.goto('/stores');
  await page.getByRole('button', { name: 'Find nearby' }).click();
  await expect(page.getByText('New York')).toBeVisible();
});
```

### Clock and Time Control

```typescript
test('shows countdown timer', async ({ page }) => {
  // Install fake clock
  await page.clock.install({ time: new Date('2024-01-01T00:00:00') });

  await page.goto('/sale');
  await expect(page.getByText('Sale starts in')).toBeVisible();

  // Fast-forward time
  await page.clock.fastForward('24:00:00');
  await expect(page.getByText('Sale is live!')).toBeVisible();
});
```

### Testing with Emulation

```typescript
test('mobile viewport', async ({ page }) => {
  // Already configured via project device, but can override:
  await page.setViewportSize({ width: 375, height: 812 });

  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Menu' })).toBeVisible();
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.getByRole('navigation')).toBeVisible();
});
```

### Drag and Drop

```typescript
test('reorders items via drag and drop', async ({ page }) => {
  await page.goto('/kanban');

  const source = page.getByText('Task A');
  const target = page.getByText('Done column');

  await source.dragTo(target);
  await expect(page.locator('.done-column')).toContainText('Task A');
});
```

### Testing Shadow DOM

```typescript
test('interacts with shadow DOM elements', async ({ page }) => {
  await page.goto('/web-components');

  // Playwright pierces shadow DOM by default for text and role locators
  await page.getByRole('button', { name: 'Shadow button' }).click();
  await expect(page.getByText('Shadow content loaded')).toBeVisible();
});
```

### Retry Logic for Flaky External Services

```typescript
test('handles intermittent API', async ({ page }) => {
  let callCount = 0;

  await page.route('**/api/external-service', async (route) => {
    callCount++;
    if (callCount <= 2) {
      // Simulate first two calls failing
      await route.fulfill({ status: 503, body: 'Service Unavailable' });
    } else {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: 'success' }),
      });
    }
  });

  await page.goto('/dashboard');
  // App should have retry logic that eventually succeeds
  await expect(page.getByText('success')).toBeVisible({ timeout: 15000 });
});
```

### Testing Local Storage and Cookies

```typescript
test('persists user preferences', async ({ page, context }) => {
  await page.goto('/settings');
  await page.getByRole('switch', { name: 'Dark mode' }).click();

  // Verify localStorage
  const theme = await page.evaluate(() => localStorage.getItem('theme'));
  expect(theme).toBe('dark');

  // Verify cookies
  const cookies = await context.cookies();
  const themeCookie = cookies.find(c => c.name === 'theme-preference');
  expect(themeCookie?.value).toBe('dark');
});
```

### Testing Clipboard

```typescript
test('copies text to clipboard', async ({ page, context }) => {
  // Grant clipboard permissions
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);

  await page.goto('/share');
  await page.getByRole('button', { name: 'Copy link' }).click();

  // Read clipboard
  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toContain('https://example.com/share/');
});
```

---

## Conclusion

Playwright represents a generational shift in browser automation. Native protocol communication replaces HTTP-based driver protocols. Auto-waiting with six actionability checks replaces manual sleeps and waits. Browser contexts provide millisecond-fast test isolation. Cross-browser support covers 95%+ of real-world browser usage.

The framework is not perfect. Mobile device testing requires Appium. Component testing is experimental. Patched browsers lag behind releases by 1--2 weeks. The ecosystem is younger than Selenium's.

But for end-to-end testing of web applications --- from a developer's first test to a CI pipeline running 5,000 tests across four shards --- Playwright is the most capable tool available today. The architecture ensures that the features you need at scale (parallelism, debugging, network control, visual regression, accessibility) are not plugins or add-ons but native capabilities of the framework itself.

The ten topics covered in this guide form a complete toolkit:

| Part | What You Learned |
|------|-----------------|
| 1. Evolution | Why browser automation needed a paradigm shift |
| 2. Architecture | Three layers, three protocols, six actionability checks |
| 3. Comparisons | Honest benchmarks against Selenium, Cypress, Puppeteer, WebDriverIO |
| 4. Getting Started | One-command setup, config, first test, codegen |
| 5. Locators & Assertions | Role-based locators, web-first assertions, 13 common mistakes |
| 6. POM & Fixtures | Page objects, composable fixtures, storageState auth |
| 7. Debugging | Inspector, Trace Viewer (5 layers), UI Mode, CI workflow |
| 8. Network | page.route(), HAR, WebSocket mocking, APIRequestContext |
| 9. Visual & A11y | toHaveScreenshot(), axe-core, WCAG 2.1 AA |
| 10. CI/CD | Workers, sharding, retries, reporters, Docker |
| 11. Recipes | Multi-tab, files, dialogs, geolocation, clock, Shadow DOM |

Start with `npm init playwright@latest`. The rest follows from there.

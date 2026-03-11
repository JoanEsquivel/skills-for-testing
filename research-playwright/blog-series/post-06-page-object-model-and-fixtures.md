# Page Object Model and Custom Fixtures

## The Hook

Your test suite has 200 tests. Forty of them start with the same five lines: navigate to login, fill email, fill password, click submit, wait for dashboard. Then the login form gets a CAPTCHA field. You now have 40 files to update.

This is the problem that the Page Object Model (POM) and Playwright fixtures solve. POM encapsulates page interactions behind a clean interface. Fixtures manage the lifecycle of shared resources --- browser contexts, authenticated sessions, test data --- so your tests stay focused on what they're testing, not on setup and teardown.

## Context: Why Test Organization Matters

Small test suites don't need architecture. When you have 10 tests in one file, copy-paste is faster than abstraction. But test suites grow. Teams grow. Applications grow. At 100 tests, duplicated setup code becomes a maintenance burden. At 500 tests, it becomes a reliability risk --- because duplicated code means duplicated bugs.

Playwright provides two complementary patterns for organizing test code:

1. **Page Object Model** --- Classes that encapsulate page-specific interactions and locators
2. **Custom Fixtures** --- Extensions to the test runner that manage shared resources

## Core Idea: Page Objects Encapsulate, Fixtures Compose

A **page object** answers: "How do I interact with this page?" It contains locators and methods for a single page or component.

A **fixture** answers: "What does this test need before it starts?" It provides pre-configured resources (logged-in user, seeded database, custom page object) and cleans them up when the test ends.

## Deep Dive: Page Object Model

### Basic POM Pattern

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

  async expectError(message: string) {
    await expect(this.errorMessage).toHaveText(message);
  }
}
```

### Using POM in Tests

```typescript
// tests/auth/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('succeeds with valid credentials', async ({ page }) => {
    await loginPage.login('user@example.com', 'password123');
    await expect(page).toHaveURL('/dashboard');
  });

  test('shows error for invalid password', async () => {
    await loginPage.login('user@example.com', 'wrong');
    await loginPage.expectError('Invalid credentials');
  });
});
```

### Multi-Page Flows

```typescript
// pages/dashboard.page.ts
import { type Page, type Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeHeading: Locator;
  readonly projectList: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeHeading = page.getByRole('heading', { name: /welcome/i });
    this.projectList = page.getByRole('list', { name: 'Projects' });
    this.createButton = page.getByRole('button', { name: 'New project' });
  }

  async expectLoaded() {
    await expect(this.welcomeHeading).toBeVisible();
  }

  async createProject(name: string) {
    await this.createButton.click();
    await this.page.getByLabel('Project name').fill(name);
    await this.page.getByRole('button', { name: 'Create' }).click();
  }

  async getProjectCount() {
    return this.projectList.getByRole('listitem').count();
  }
}
```

### POM Design Principles

| Principle | Do | Don't |
|-----------|----|----|
| **Encapsulate locators** | Define locators in the constructor | Expose raw selectors to tests |
| **Return meaningful types** | Return data (strings, counts) or void | Return locators or element handles |
| **Name methods by intent** | `login()`, `createProject()` | `fillFormAndClickButton()` |
| **Keep assertions in tests** | Let tests decide what to assert | Put all assertions in POM methods |
| **One class per page/component** | `LoginPage`, `NavBar`, `ProductCard` | `AllPages`, `Helpers` |

### Exception: Assertion Helpers

The "keep assertions in tests" rule has one practical exception --- common state verification:

```typescript
// This is acceptable because it verifies a single, well-defined state
async expectLoaded() {
  await expect(this.welcomeHeading).toBeVisible();
}

async expectError(message: string) {
  await expect(this.errorMessage).toHaveText(message);
}
```

These methods verify that the page is in an expected state. They don't verify test-specific outcomes.

## Deep Dive: Custom Fixtures

Fixtures are Playwright's answer to `beforeEach`/`afterEach` boilerplate. They provide resources that tests declare as dependencies:

### Basic Custom Fixture

```typescript
// fixtures/pages.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';

// Extend the base test with custom fixtures
type PageFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

export const test = base.extend<PageFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
    // Cleanup runs after the test (if needed)
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});

export { expect } from '@playwright/test';
```

### Using Fixtures in Tests

```typescript
// tests/auth/login.spec.ts
import { test, expect } from '../../fixtures/pages.fixture';

test('user can log in and see dashboard', async ({ loginPage, dashboardPage, page }) => {
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password123');
  await dashboardPage.expectLoaded();
});
```

Notice: no `beforeEach`, no manual construction. The test declares what it needs (`loginPage`, `dashboardPage`), and Playwright provides them.

### Fixture Scoping: Test vs Worker

Fixtures have two scopes:

**Test-scoped** (default) --- Created fresh for every test. Used for page objects, test data, and anything that should be isolated between tests.

**Worker-scoped** --- Created once per worker process and shared across all tests that worker runs. Used for expensive resources like database connections, authenticated sessions, or server instances.

```typescript
type WorkerFixtures = {
  dbConnection: DatabaseConnection;
};

type TestFixtures = {
  loginPage: LoginPage;
};

export const test = base.extend<TestFixtures, WorkerFixtures>({
  // Worker-scoped: created once per worker
  dbConnection: [async ({}, use) => {
    const db = await DatabaseConnection.create();
    await use(db);
    await db.close();
  }, { scope: 'worker' }],

  // Test-scoped: created for every test
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});
```

### Fixture Composition

Fixtures can depend on other fixtures, creating a dependency graph:

```typescript
type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
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

Fixtures that run for every test without being explicitly requested:

```typescript
export const test = base.extend<{}>({
  // Auto-fixture: runs for every test
  logTestName: [async ({}, use, testInfo) => {
    console.log(`Starting: ${testInfo.title}`);
    await use();
    console.log(`Finished: ${testInfo.title} - ${testInfo.status}`);
  }, { auto: true }],
});
```

## Deep Dive: Authentication via storageState

The most common fixture pattern is authenticated sessions. Instead of logging in through the UI for every test, Playwright saves the browser state (cookies, localStorage) and reuses it:

### Step 1: Global Setup for Authentication

```typescript
// global-setup.ts
import { chromium, type FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Log in through the UI once
  await page.goto('http://localhost:3000/login');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('admin-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/dashboard');

  // Save the authenticated state
  await page.context().storageState({ path: '.auth/admin.json' });

  await browser.close();
}

export default globalSetup;
```

### Step 2: Configure Projects with Dependencies

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  projects: [
    // Setup project: runs first, creates auth state
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Authenticated tests: depend on setup
    {
      name: 'chromium',
      use: {
        storageState: '.auth/admin.json',
      },
      dependencies: ['setup'],
    },

    // Unauthenticated tests: no storageState
    {
      name: 'chromium-logged-out',
      use: {},
      testMatch: /.*\.anon\.spec\.ts/,
    },
  ],
});
```

### Step 3: Setup File

```typescript
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('admin-password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/dashboard');

  // Save signed-in state
  await page.context().storageState({ path: '.auth/admin.json' });
});
```

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
  ],
});
```

## Practical Pattern: Full Fixture Architecture

Here's how a mature Playwright project organizes fixtures:

```
tests/
├── fixtures/
│   ├── base.fixture.ts          # Core fixtures (pages, auth)
│   ├── api.fixture.ts           # API client fixtures
│   └── data.fixture.ts          # Test data fixtures
├── pages/
│   ├── login.page.ts
│   ├── dashboard.page.ts
│   ├── settings.page.ts
│   └── components/
│       ├── navbar.component.ts
│       └── modal.component.ts
├── auth/
│   └── auth.setup.ts
├── features/
│   ├── login.spec.ts
│   ├── dashboard.spec.ts
│   └── settings.spec.ts
└── .auth/                       # Generated auth state (gitignored)
    ├── admin.json
    └── user.json
```

```typescript
// fixtures/base.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { DashboardPage } from '../pages/dashboard.page';
import { NavBar } from '../pages/components/navbar.component';

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  navBar: NavBar;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  navBar: async ({ page }, use) => {
    await use(new NavBar(page));
  },
});

export { expect } from '@playwright/test';
```

## Tradeoffs and Limitations

- **Over-abstraction.** The biggest risk with POM is creating abstractions too early. If only one test uses a page object, the abstraction adds indirection without saving code. Wait until you have 3+ tests using the same page.
- **Fixture dependency graphs.** Complex fixture chains can be hard to debug. If fixture A depends on B which depends on C, understanding the setup sequence requires reading all three.
- **storageState limitations.** The saved state includes cookies and localStorage but not session storage or in-memory state. If your app relies on session storage for authentication, storageState alone won't work.
- **Type verbosity.** TypeScript fixture types require declaring every fixture in a type literal, which can become verbose for large fixture sets.

## Conclusion

Page Object Model and fixtures solve the two fundamental problems of test code organization: duplicated interaction logic and duplicated setup logic. POM encapsulates locators and actions behind intent-revealing methods. Fixtures provide composable, lifecycle-managed resources that tests declare as dependencies.

The `storageState` pattern for authentication is particularly powerful --- it eliminates the most common source of duplicated setup (logging in) with a single configuration change, and it makes each test ~2 seconds faster by skipping the login UI.

---

*Next in the series: [When Tests Fail --- Debugging](post-07-debugging-and-trace-viewer.md) --- Inspector, Trace Viewer, VS Code debugging, and the CI debugging workflow.*

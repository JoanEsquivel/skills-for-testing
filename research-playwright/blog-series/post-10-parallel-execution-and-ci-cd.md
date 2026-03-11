# Parallel Execution, Sharding, and CI/CD

## The Hook

A 500-test Playwright suite runs in 3 minutes locally on a developer's M2 MacBook. In CI, on a single GitHub Actions runner, it takes 22 minutes. The tests haven't changed. The application hasn't changed. The difference is infrastructure: one machine with 10 cores vs one machine with 2 cores, no GPU, and shared I/O.

Scaling Playwright in CI is not about writing better tests --- it's about understanding parallelism, sharding, retries, caching, and reporter configuration. Get these right, and the same 500 tests run in 4 minutes across 4 CI machines.

## Context: The CI Performance Problem

Local development machines are fast. CI runners are not. A standard GitHub Actions runner has:

- 2 vCPUs (7 vCPUs for larger runners)
- 7 GB RAM
- No GPU
- Shared disk I/O

This means:

- Browser rendering is slower (no GPU compositing)
- Parallel workers compete for CPU
- Browser launches are slower (disk I/O for binary loading)
- Memory pressure starts earlier

Playwright's configuration must account for these constraints. The defaults that work on a developer machine will underperform or OOM on a CI runner.

## Core Idea: Workers, Files, and Tests

Playwright parallelism has three levels:

```
Level 1: Shards         (across CI machines)
Level 2: Workers         (across CPU cores within a machine)
Level 3: Tests           (within a file, if fullyParallel is enabled)
```

**Shards** split the test suite across multiple CI machines. Each shard runs a subset of test files.

**Workers** are parallel processes within a single machine. Each worker runs test files independently. By default, Playwright uses half the CPU cores.

**fullyParallel** runs individual tests within the same file in parallel. Without it, tests in the same file run sequentially in the order they appear.

## Deep Dive: Worker Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  // Number of worker processes
  workers: process.env.CI ? 4 : undefined, // undefined = half of CPUs

  // Run tests within files in parallel
  fullyParallel: true,

  // Maximum failures before stopping
  maxFailures: process.env.CI ? 10 : undefined,
});
```

### How Workers Distribute Tests

```
Worker 1: login.spec.ts → dashboard.spec.ts → settings.spec.ts
Worker 2: products.spec.ts → search.spec.ts → cart.spec.ts
Worker 3: checkout.spec.ts → payment.spec.ts
Worker 4: admin.spec.ts → reports.spec.ts
```

Each worker:
1. Launches its own browser instance
2. Runs test files sequentially (unless `fullyParallel`)
3. Creates a fresh browser context for each test
4. Reports results back to the main process

### Worker Recommendations by CI Runner Size

| Runner | vCPUs | Recommended Workers | Notes |
|--------|-------|-------------------|-------|
| GitHub Actions (standard) | 2 | 2 | More workers will thrash CPU |
| GitHub Actions (large) | 4--8 | 3--6 | Leave 1 core for OS + browser |
| GitLab CI (small) | 1 | 1 | Single-threaded execution |
| Self-hosted (8+ cores) | 4--6 | 4--6 | Depends on available RAM |

### Memory Considerations

Each worker runs a browser instance. Chromium uses ~100--200 MB per context. Rule of thumb:

```
Available RAM - 2 GB (OS + Node) = RAM for workers
RAM for workers / 300 MB per worker = max workers
```

For a 7 GB GitHub Actions runner: `(7 - 2) / 0.3 ≈ 16 workers maximum`. In practice, CPU is the bottleneck before memory for standard runners.

## Deep Dive: fullyParallel

```typescript
// All tests in all files run in parallel
export default defineConfig({
  fullyParallel: true,
});

// Or per-project
export default defineConfig({
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      fullyParallel: true,
    },
  ],
});
```

### When NOT to Use fullyParallel

Some tests must run in order:

```typescript
test.describe.serial('checkout flow', () => {
  test('add item to cart', async ({ page }) => {
    // Must run first
  });

  test('enter shipping details', async ({ page }) => {
    // Must run second
  });

  test('complete payment', async ({ page }) => {
    // Must run third
  });
});
```

`test.describe.serial` forces sequential execution within the describe block, even with `fullyParallel: true` globally.

> **Best practice:** Avoid `test.describe.serial` when possible. Each test should be independent. If tests share state, use fixtures or API setup instead of test ordering.

## Deep Dive: Sharding

Sharding distributes test files across multiple CI machines:

```bash
# Machine 1
npx playwright test --shard=1/4

# Machine 2
npx playwright test --shard=2/4

# Machine 3
npx playwright test --shard=3/4

# Machine 4
npx playwright test --shard=4/4
```

Each shard receives a roughly equal number of test files. Playwright uses file-level distribution (not test-level), so files with many tests may cause uneven distribution.

### Sharding in GitHub Actions

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

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run tests
        run: npx playwright test --shard=${{ matrix.shard }}

      - name: Upload blob report
        uses: actions/upload-artifact@v4
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

      - name: Install dependencies
        run: npm ci

      - name: Download blob reports
        uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true

      - name: Merge reports
        run: npx playwright merge-reports --reporter html ./all-blob-reports

      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        with:
          name: html-report
          path: playwright-report/
          retention-days: 14
```

### Blob Reports for Sharding

When tests are sharded, each shard produces a partial report. Playwright's blob reporter creates mergeable report fragments:

```typescript
// playwright.config.ts
export default defineConfig({
  reporter: process.env.CI
    ? [['blob']]  // Produces blob-report/ directory
    : [['html', { open: 'on-failure' }]],
});
```

After all shards complete, merge the blob reports into a single HTML report with `npx playwright merge-reports`.

## Deep Dive: Retries

Retries re-run failed tests automatically. This doesn't fix flaky tests, but it prevents them from blocking the pipeline:

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
});
```

### Retry Behavior

1. Test fails on first attempt → retry 1
2. If retry 1 passes → test is marked as "flaky" (passed on retry)
3. If retry 1 fails → retry 2
4. If retry 2 passes → "flaky"
5. If retry 2 fails → test is marked as "failed"

### Trace on First Retry

The most useful retry pattern: record a trace only when a test is retried:

```typescript
export default defineConfig({
  retries: 2,
  use: {
    trace: 'on-first-retry',
  },
});
```

This means:
- First attempt: no trace (fast)
- First retry: trace recorded (captures the failure context)
- Second retry: no trace (fast)

The trace from the first retry captures exactly the conditions that caused the failure, without the performance overhead of recording every test.

## Deep Dive: CI Configuration

### GitHub Actions (Complete)

```yaml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 30
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test
        env:
          CI: true

      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Docker

```dockerfile
FROM mcr.microsoft.com/playwright:v1.48.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]
```

```bash
# Run tests in Docker
docker build -t playwright-tests .
docker run --rm playwright-tests
```

### Browser Caching in CI

Browser downloads are ~500 MB. Cache them:

```yaml
- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ hashFiles('**/package-lock.json') }}

- name: Install Playwright browsers
  run: npx playwright install --with-deps
```

## Deep Dive: Reporters

Reporters format test results for different contexts:

### Built-in Reporters

| Reporter | Use Case | Output |
|----------|----------|--------|
| `list` | Local development | Terminal output with test names |
| `dot` | Quick CI overview | One dot per test (. for pass, F for fail) |
| `html` | Detailed investigation | Interactive HTML report |
| `json` | Custom processing | JSON file for tooling |
| `junit` | CI integration | JUnit XML for Jenkins, GitLab, etc. |
| `github` | GitHub Actions | Annotations on PRs |
| `blob` | Sharded runs | Mergeable binary report |

### Multiple Reporters

```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['list'],                              // Terminal output
    ['html', { open: 'never' }],           // HTML report
    ['junit', { outputFile: 'results.xml' }], // JUnit for CI
    ['github'],                            // GitHub PR annotations
  ],
});
```

### Custom Reporter

```typescript
// reporters/slack-reporter.ts
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
      // Send to Slack webhook
      await fetch(process.env.SLACK_WEBHOOK!, {
        method: 'POST',
        body: JSON.stringify({
          text: `${this.failures.length} Playwright tests failed:\n${this.failures.join('\n')}`,
        }),
      });
    }
  }
}

export default SlackReporter;
```

```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['list'],
    ['./reporters/slack-reporter.ts'],
  ],
});
```

## Deep Dive: CLI Commands

Essential Playwright CLI commands for CI and development:

```bash
# Run all tests
npx playwright test

# Run specific file
npx playwright test tests/login.spec.ts

# Run tests by title match
npx playwright test -g "login"

# Run specific project
npx playwright test --project=chromium

# Run with specific number of workers
npx playwright test --workers=4

# Run with retries
npx playwright test --retries=2

# Run a single shard
npx playwright test --shard=1/4

# Update snapshots
npx playwright test --update-snapshots

# List all tests without running
npx playwright test --list

# Run in UI mode
npx playwright test --ui

# Run in debug mode
npx playwright test --debug

# Show last HTML report
npx playwright show-report

# Show a trace file
npx playwright show-trace test-results/trace.zip

# Generate test code
npx playwright codegen http://localhost:3000

# Install browsers
npx playwright install

# Install specific browser
npx playwright install chromium

# Install system dependencies
npx playwright install-deps
```

## Practical Patterns

### Pattern 1: CI-Optimized Config

```typescript
// playwright.config.ts
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

### Pattern 2: Tag-Based Test Selection

```typescript
// tests/checkout.spec.ts
test('checkout flow @smoke @critical', async ({ page }) => {
  // This test runs in smoke and critical suites
});

test('guest checkout @regression', async ({ page }) => {
  // This test runs only in regression suite
});
```

```bash
# Run only smoke tests
npx playwright test --grep @smoke

# Run everything except regression
npx playwright test --grep-invert @regression
```

### Pattern 3: Global Teardown

```typescript
// playwright.config.ts
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
});
```

```typescript
// global-teardown.ts
async function globalTeardown() {
  // Clean up test data, stop services, etc.
  console.log('Cleaning up test environment...');
}

export default globalTeardown;
```

## Tradeoffs and Limitations

- **Sharding granularity.** Sharding distributes files, not tests. A file with 100 tests and another with 5 tests creates uneven shards. Split large files for better distribution.
- **Worker startup cost.** Each worker launches a browser instance (~1--2 seconds). For very fast tests, worker startup can dominate total time. Fewer workers with more tests each may be faster.
- **Retry masking.** Retries can mask real bugs. A test that passes on retry is still flaky --- track flaky test rates and fix root causes.
- **Browser caching.** CI caches can become stale when Playwright versions change. Key your cache on `package-lock.json` to invalidate on version bumps.
- **Resource contention.** Too many workers on a small runner causes CPU thrashing, making tests slower, not faster. Always benchmark your worker count.

## Conclusion

Playwright's parallelism and CI integration turn a local testing tool into a production testing infrastructure. Workers handle machine-level parallelism. Sharding handles fleet-level parallelism. Retries handle non-determinism. Reporters handle visibility.

The key insight: CI configuration is not an afterthought. The same test suite can run in 3 minutes or 30 minutes depending on worker count, shard distribution, and resource allocation. Invest time in CI configuration proportional to the time your team spends waiting for test results.

This concludes the series. From browser protocols to CI pipelines, Playwright provides a complete framework for reliable, fast, and maintainable end-to-end testing.

---

*This is the final post in the series. Start from the beginning: [Browser Automation Has Evolved](post-01-browser-automation-evolved.md).*

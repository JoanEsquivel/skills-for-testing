# When Tests Fail --- Debugging

## The Hook

The test passed 50 times locally. It passed 200 times in CI. On the 201st run, it failed with "Timeout waiting for element to be visible." The error message tells you what went wrong but not why. The screenshot shows a loading spinner that should have disappeared. The console shows no errors. You stare at the code, the logs, the CI output. Nothing.

This is the moment that separates "debugging" from "guessing." Playwright provides four debugging tools, and the right one depends on where the failure happened.

## Context: The Debugging Spectrum

| Where It Fails | Best Tool | Why |
|----------------|-----------|-----|
| While writing the test | **Inspector** | Step through actions interactively |
| Locally, intermittently | **UI Mode** | Watch mode with time-travel debugging |
| In CI, reproducible | **Trace Viewer** | Full recording of the failed run |
| In CI, flaky | **Trace on retry** + **video** | Capture state on the second attempt |
| In VS Code | **VS Code Extension** | Breakpoints and step-through |

## Core Idea: Traces Are Time Machines

Playwright's Trace Viewer records everything that happened during a test: every action, every DOM snapshot (before and after), every network request, every console message, every source code line. When a test fails in CI, you download the trace file and replay the entire test locally, seeing exactly what the browser saw.

This changes the debugging workflow from "try to reproduce" to "watch the recording."

## Deep Dive: The Inspector

The Inspector is Playwright's interactive debugger. Launch it with:

```bash
# Run tests with the inspector
PWDEBUG=1 npx playwright test tests/login.spec.ts

# Or from the command line
npx playwright test --debug
```

The Inspector opens two windows:

1. **Browser** --- Your application, with action targets highlighted
2. **Inspector panel** --- Test code with step controls

### Inspector Capabilities

- **Step over** --- Execute the next action and pause
- **Resume** --- Run until the next breakpoint or `page.pause()`
- **Locator picker** --- Click any element to see its recommended locator
- **Console** --- Execute JavaScript in the page context

### Using page.pause()

Insert `page.pause()` in your test code to pause at a specific point:

```typescript
test('debugging example', async ({ page }) => {
  await page.goto('/products');
  await page.getByRole('link', { name: 'Laptop' }).click();

  // Pause here --- inspector opens and you can explore the page
  await page.pause();

  await page.getByRole('button', { name: 'Add to cart' }).click();
});
```

This is particularly useful when you need to understand the DOM state at a specific point in the test flow.

## Deep Dive: Trace Viewer

The Trace Viewer is Playwright's most powerful debugging tool. It records a complete trace of the test execution that can be replayed offline.

### Configuring Traces

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // Record traces on first retry (best for CI)
    trace: 'on-first-retry',

    // Other options:
    // trace: 'on',             // Always record (expensive)
    // trace: 'off',            // Never record
    // trace: 'retain-on-failure', // Record all, keep only failures
  },
});
```

The `on-first-retry` strategy is the recommended default: it only records traces when a test fails and is retried, minimizing overhead while capturing failures.

### The Five Layers

When you open a trace file, you see five layers of information:

```
┌──────────────────────────────────────────────────────┐
│ 1. Actions Timeline                                   │
│    click('Submit') → fill('Email') → goto('/dash')    │
├──────────────────────────────────────────────────────┤
│ 2. DOM Snapshots (Before / After)                     │
│    Full DOM state before and after each action         │
├──────────────────────────────────────────────────────┤
│ 3. Console Log                                        │
│    console.log, console.error, console.warn           │
├──────────────────────────────────────────────────────┤
│ 4. Network Requests                                   │
│    URL, method, status, timing, request/response body │
├──────────────────────────────────────────────────────┤
│ 5. Source Code                                        │
│    Test source with the current line highlighted      │
└──────────────────────────────────────────────────────┘
```

### Viewing Traces

```bash
# View a local trace file
npx playwright show-trace trace.zip

# View the trace from the HTML report
npx playwright show-report
# Then click on a failed test → click "Traces" tab
```

### Trace Viewer Walkthrough

1. **Click an action** in the timeline to see the DOM snapshot at that point
2. **Toggle "Before" / "After"** to see how the action changed the DOM
3. **Click "Network"** to see what requests were in-flight
4. **Click "Console"** to see any logs or errors
5. **Click "Source"** to see which line of test code triggered the action

### What Traces Reveal

Traces answer questions that logs and screenshots cannot:

- **"Why didn't the click work?"** --- Check the "Before" snapshot. Was there an overlay? Was the element outside the viewport?
- **"Why did the assertion time out?"** --- Check the DOM snapshot at the assertion point. What was the actual text/state?
- **"Was the API response correct?"** --- Check the Network tab. See the exact response body.
- **"Did a console error cause the issue?"** --- Check the Console tab. Unhandled promise rejections and framework errors appear here.

## Deep Dive: UI Mode

UI Mode is an interactive test runner with built-in time-travel debugging:

```bash
npx playwright test --ui
```

### Features

- **Test explorer** --- See all tests, filter by status, search by name
- **Watch mode** --- Re-runs tests when source files change
- **Time-travel** --- Click any action to see the DOM at that point
- **DOM snapshot** --- Hover over the timeline to scrub through DOM states
- **Network panel** --- See requests alongside actions
- **Pick locator** --- Click elements in the DOM snapshot to get locators

UI Mode is ideal for test development: write a test, watch it run, see the DOM, adjust locators, re-run --- all without leaving the UI.

## Deep Dive: VS Code Debugging

The Playwright VS Code extension provides standard IDE debugging:

### Setup

1. Install the "Playwright Test for VS Code" extension
2. Tests appear in the Testing sidebar

### Debugging Workflow

1. **Set a breakpoint** in your test code
2. **Right-click** the test → "Debug Test"
3. **Step through** actions using the debug toolbar
4. **Inspect variables** in the debug sidebar
5. **View the browser** at each step

### Live Locator Highlighting

When debugging, the VS Code extension highlights the target element in the browser for each action. This immediately shows whether your locator is matching the right element.

## Deep Dive: CI Debugging Workflow

When a test fails in CI, use this workflow:

### Step 1: Configure Artifacts

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  retries: process.env.CI ? 2 : 0,
});
```

### Step 2: Upload Artifacts in CI

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on: [push, pull_request]

jobs:
  test:
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
        run: npx playwright test

      - name: Upload test report
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Upload trace files
        uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: test-results
          path: test-results/
          retention-days: 30
```

### Step 3: Download and Analyze

1. Go to the GitHub Actions run
2. Download the `playwright-report` artifact
3. Unzip and open `index.html`
4. Click the failed test
5. Open the trace file

### Alternative: View Traces Online

```bash
# Upload trace to trace.playwright.dev (temporary, public)
# Drag and drop the trace.zip file to the website
```

The online viewer at `trace.playwright.dev` renders traces in the browser without needing to install anything. Note that traces are sent to Playwright's servers --- don't use this for sensitive applications.

## Practical Debugging Patterns

### Pattern 1: Debug Only Failing Test

```bash
# Run only the failing test in debug mode
npx playwright test -g "exact test name" --debug
```

### Pattern 2: Slow Motion for Visual Debugging

```typescript
// playwright.config.ts (development only)
export default defineConfig({
  use: {
    launchOptions: {
      slowMo: 500, // 500ms pause between actions
    },
  },
});
```

### Pattern 3: Verbose API Logging

```bash
# See every protocol message between Playwright and the browser
DEBUG=pw:api npx playwright test tests/login.spec.ts
```

### Pattern 4: Capture Video on Failure

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    video: 'retain-on-failure', // Record all, keep only failures
  },
});
```

### Pattern 5: Custom Console Logging in Tests

```typescript
test('debug network timing', async ({ page }) => {
  // Listen to console messages from the page
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE ERROR: ${msg.text()}`);
    }
  });

  // Listen to request failures
  page.on('requestfailed', request => {
    console.log(`FAILED: ${request.url()} - ${request.failure()?.errorText}`);
  });

  await page.goto('/dashboard');
});
```

### Pattern 6: Screenshot at Key Points

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

## Tradeoffs and Limitations

- **Trace file size.** Traces with DOM snapshots can be 5--50 MB per test. For large suites, use `on-first-retry` to limit recording.
- **Performance overhead.** Recording traces adds ~10--20% to test execution time. Not significant for CI, but noticeable for local development.
- **Trace Viewer requires network.** The online viewer at `trace.playwright.dev` requires internet access. The local viewer (`npx playwright show-trace`) works offline.
- **Video encoding.** Video recording is more expensive than traces. Use `retain-on-failure` to record everything but only keep failure videos.
- **Inspector limitations.** The Inspector cannot step backward --- only forward. For time-travel, use UI Mode or Trace Viewer.

## Conclusion

Playwright's debugging tools form a spectrum from interactive (Inspector, UI Mode) to forensic (Trace Viewer, videos). The key insight is matching the tool to the situation:

- **Writing tests:** Inspector or UI Mode for immediate feedback
- **Local flakiness:** UI Mode with watch mode to catch intermittent failures
- **CI failures:** Trace Viewer with `on-first-retry` for detailed post-mortems
- **VS Code users:** Extension for integrated breakpoint debugging

The Trace Viewer is the standout tool. Being able to replay a failed CI test locally, with full DOM snapshots, network requests, and console messages, changes debugging from "reproduce and guess" to "observe and understand."

---

*Next in the series: [Controlling the Network](post-08-network-mocking-and-api-testing.md) --- page.route(), HAR record/replay, WebSocket mocking, and API testing.*

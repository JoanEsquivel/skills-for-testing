# Playwright vs Everyone --- An Honest Technical Comparison

## The Hook

In 2023, a QA team at a mid-sized SaaS company migrated 1,200 Cypress tests to Playwright. Their CI pipeline went from 45 minutes to 18 minutes. Their flaky test rate dropped from 12% to under 3%. Their `node_modules` shrank from 1.2 GB to 380 MB. And they did it with two engineers in six weeks.

These numbers sound like marketing. They're not. They're the predictable outcome of architectural differences that we can measure, benchmark, and explain. Let's look at each comparison honestly --- including where Playwright doesn't win.

## Context: Why Comparisons Matter

Choosing a test framework is a multi-year commitment. Migration costs are real: rewriting tests, retraining teams, rebuilding CI pipelines, updating documentation. A bad choice means living with limitations for years or paying the migration tax again.

The five frameworks worth comparing are Selenium, Cypress, Puppeteer, WebDriverIO, and Playwright. Each made different architectural bets, and those bets have measurable consequences.

## Core Idea: Architecture Determines Capability

Every meaningful difference between these frameworks traces back to a single architectural choice: how the tool communicates with the browser.

| Framework | Communication Method | Consequence |
|-----------|---------------------|-------------|
| Selenium | HTTP → WebDriver → Browser | High latency, driver version management |
| Cypress | In-browser JavaScript injection | Single-tab, same-origin constraints |
| Puppeteer | CDP WebSocket → Chromium | Fast, but Chromium-only |
| WebDriverIO | HTTP → WebDriver (or CDP) | Flexible protocols, WebDriver overhead |
| Playwright | WebSocket → Native protocols × 3 | Fast, cross-browser, full control |

## Deep Dive: Playwright vs Selenium

### Speed: 264% Faster

BrowserStack's benchmarks measured execution speed across identical test scenarios. Playwright completed the same operations 264% faster than Selenium. This isn't because Playwright's code is more optimized --- it's because the communication protocol is fundamentally different.

Selenium's WebDriver protocol is HTTP-based. Every command is a request/response cycle:

```
Test → HTTP POST /session/{id}/element → Driver → Browser
Test ← HTTP Response ← Driver ← Browser
Test → HTTP POST /session/{id}/element/{id}/click → Driver → Browser
Test ← HTTP Response ← Driver ← Browser
```

Playwright's WebSocket connection is persistent and bidirectional:

```
Test ↔ WebSocket ↔ Browser (persistent connection, no per-command overhead)
```

For a test with 100 interactions, Selenium makes 200+ HTTP round trips. Playwright sends 100+ messages over a single WebSocket connection. The difference compounds with test suite size.

### Reliability: The Flaky Test Problem

Selenium's most painful limitation is element reference management. When you find an element and then interact with it, the element may have been re-rendered by the framework:

```java
// Selenium: This can throw StaleElementReferenceException
WebElement button = driver.findElement(By.id("submit"));
// React re-renders between these two lines
button.click(); // StaleElementReferenceException
```

```typescript
// Playwright: Locators always re-query
await page.locator('#submit').click(); // Always finds the current element
```

Playwright locators are lazy --- they re-query the DOM on every action. There is no concept of a stale element reference because there is no stored element reference.

### Language Support

Both frameworks support multiple languages. Selenium supports Java, Python, C#, JavaScript, Ruby, and Kotlin. Playwright supports JavaScript/TypeScript, Python, Java, and .NET.

Selenium wins on language breadth. Playwright wins on language depth --- every binding has full feature parity because the bindings are auto-generated from the same specification.

### When Selenium Still Wins

- **Real device testing.** Selenium Grid supports real browsers on real devices via Appium integration.
- **Legacy browser support.** Need to test IE11? Selenium is the only option.
- **Ecosystem maturity.** 20 years of plugins, integrations, and tribal knowledge.
- **Standards compliance.** WebDriver is a W3C standard. Playwright uses proprietary protocols.

## Deep Dive: Playwright vs Cypress

### Architecture: Out-of-Process vs In-Process

This is the fundamental difference. Cypress runs inside the browser. Playwright runs outside it.

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

Cypress's in-process approach enables time-travel debugging and automatic command queuing. But it creates hard limitations:

| Capability | Cypress | Playwright |
|------------|---------|------------|
| Multi-tab testing | Not possible | Full support |
| Multi-origin navigation | Limited (cy.origin()) | Full support |
| Browser control | Within browser sandbox | Full OS-level |
| Network interception | Application-level | Protocol-level |
| File download/upload | Workarounds required | Native support |
| iframe interaction | cy.iframe() plugin | Built-in frameLocator() |
| Multiple browsers simultaneous | Not possible | Full support |

### Speed: Parallel Execution

Cypress runs tests serially within a single browser instance by default. Parallel execution requires Cypress Cloud (paid) or third-party orchestration.

Playwright parallelizes by default. Each worker process runs tests in isolated browser contexts:

```typescript
// playwright.config.ts
export default defineConfig({
  workers: process.env.CI ? 4 : undefined,  // 4 workers in CI
  fullyParallel: true,                       // Parallelize within files
});
```

Checkly's benchmarks show Playwright running 35--45% faster than Cypress in parallel scenarios. On suites with 500+ tests, this translates to minutes saved per run.

### Package Size and Dependencies

| Metric | Cypress | Playwright |
|--------|---------|------------|
| Package size | ~500 MB | ~10 MB + browsers |
| npm dependencies | 160+ | 1 (playwright-core) |
| Install time (clean) | 60--90 seconds | 20--30 seconds + browser download |

Playwright's single dependency means fewer supply chain risks and simpler dependency auditing. When `left-pad` breaks npm, Cypress users feel it. Playwright users don't.

### Developer Experience

Cypress's developer experience has historically been its strongest selling point:

- **Cypress Studio** records interactions (deprecated, being rebuilt)
- **Time-travel debugging** shows DOM snapshots at each command
- **Automatic waiting** was innovative when Cypress introduced it
- **Dashboard** provides analytics and parallelization

Playwright has caught up or surpassed these:

- **Codegen** records interactions and generates test code
- **Trace Viewer** provides 5-layer debugging (actions, DOM, console, network, source)
- **Auto-waiting** with 6 actionability checks (more comprehensive)
- **UI Mode** provides time-travel debugging with watch mode
- **VS Code extension** integrates test running, debugging, and recording

### When Cypress Still Wins

- **Component testing maturity.** Cypress component testing is production-ready. Playwright's is experimental.
- **Learning curve.** Cypress's chainable API is immediately intuitive for developers familiar with jQuery.
- **Existing investment.** If you have 5,000 Cypress tests and they work, migration may not be worth the cost.

## Deep Dive: Playwright vs Puppeteer

This comparison is closest to an apples-to-apples comparison. Playwright's team built Puppeteer. Playwright started as "Puppeteer for all browsers."

### What Playwright Adds Over Puppeteer

| Feature | Puppeteer | Playwright |
|---------|-----------|------------|
| Browsers | Chromium (+ experimental Firefox) | Chromium, Firefox, WebKit |
| Test runner | None (library only) | Built-in (@playwright/test) |
| Auto-waiting | None | 6 actionability checks |
| Locator system | ElementHandle (stale-prone) | Locator (always-fresh) |
| Assertions | None built-in | Web-first assertions with auto-retry |
| Fixtures | None | Composable test fixtures |
| Reporters | None | HTML, JSON, JUnit, blob, custom |
| Parallelism | Manual | Built-in workers and sharding |
| Trace viewer | None | 5-layer trace viewer |

### Performance: The Protocol Overhead Tradeoff

Puppeteer communicates more efficiently with Chromium. Lightpanda's benchmarks show:

- **Initial payload:** Puppeteer 11 KB vs Playwright 326 KB (30x difference)
- **Per-command overhead:** Puppeteer is marginally faster for individual CDP commands

This matters for high-frequency automation tasks (scraping, monitoring) where you're making thousands of protocol calls. For test suites where each test makes 10--50 actions, the overhead is negligible compared to page load and rendering time.

### When to Choose Puppeteer

- **Chromium-only automation** (scraping, PDF generation, screenshots)
- **Library usage without a test runner** (Playwright also supports this via `playwright-core`)
- **Minimal overhead** for high-frequency protocol operations
- **Google ecosystem** integration (Lighthouse, Chrome DevTools)

## Deep Dive: Playwright vs WebDriverIO

WebDriverIO bridges the old and new worlds. It supports both the WebDriver protocol (like Selenium) and CDP (like Playwright/Puppeteer), letting teams choose their communication method.

| Aspect | WebDriverIO | Playwright |
|--------|-------------|------------|
| Protocol | WebDriver and/or CDP | CDP, Juggler, Inspector |
| Mobile | Appium integration (native + web) | Emulation only |
| Browser support | All (via WebDriver) | Chromium, Firefox, WebKit |
| Community | Mature, strong in mobile QA | Rapidly growing |
| Configuration | Highly configurable | Convention over configuration |
| Test runner | Built-in (Mocha/Jasmine/Cucumber) | Built-in (@playwright/test) |

### When to Choose WebDriverIO

- **Mobile testing** is a first-class requirement (Appium integration)
- **WebDriver compliance** is mandated (regulatory, organizational)
- **Cucumber/BDD** workflows are established
- **Real device farms** are part of the infrastructure

## The Migration Question

For teams currently using Selenium or Cypress, here's a decision framework:

### Migrate to Playwright If:

- Flaky tests are consuming significant engineering time
- You need multi-browser testing (especially WebKit/Safari)
- CI pipeline time is a bottleneck
- You need multi-tab or multi-origin test scenarios
- Package size and dependency count matter to your security team

### Stay Where You Are If:

- Your current suite is stable and fast enough
- You need real mobile device testing (stay with Selenium/WebDriverIO)
- Component testing is your primary use case (stay with Cypress)
- Your team's expertise is deeply invested in the current tool
- Migration cost outweighs the performance gains for your suite size

## Conclusion

Playwright wins most technical comparisons because its architecture avoids the fundamental constraints that limit other tools. Native protocol communication is faster than HTTP. Out-of-process execution enables capabilities that in-browser tools cannot provide. Cross-browser support with patched binaries eliminates the driver management problem.

But "technically better" doesn't always mean "right choice." Selenium's ecosystem depth, Cypress's component testing maturity, Puppeteer's minimal overhead, and WebDriverIO's mobile support are genuine advantages in the right context.

The honest answer: for new projects starting end-to-end testing in 2024 and beyond, Playwright is the default recommendation. For existing projects, the migration calculation depends on your pain points.

---

*Next in the series: [From Zero to Running Tests](post-04-getting-started.md) --- Installation, configuration, your first test, and the codegen workflow.*

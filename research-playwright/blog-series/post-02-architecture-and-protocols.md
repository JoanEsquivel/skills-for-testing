# Under the Hood --- How Playwright Controls Three Browser Engines

## The Hook

When you write `await page.click('button')`, seven things happen before the button is clicked. Your test code sends a message over a WebSocket to the Playwright server, which translates it into a browser-specific protocol command, which is dispatched to a patched browser binary that Microsoft compiles from source, which performs six actionability checks on the target element, which waits for the element to be stable across two animation frames, and only then dispatches the click event at the element's center coordinates.

All of this takes about 10 milliseconds. Understanding these seven steps is the difference between writing tests that work and understanding *why* they work.

## Context: Why Architecture Matters

Most test engineers never need to think about how their tools communicate with browsers. But when a test is flaky, when an action times out unexpectedly, when you need to debug a failure in CI that you cannot reproduce locally --- that is when architecture knowledge becomes essential.

Playwright's architecture is also what makes it uniquely capable. Features like browser contexts, network interception, and multi-browser support are not add-ons. They are direct consequences of how Playwright is built.

## Core Idea: Three Layers

Playwright's architecture has three distinct layers:

```
┌─────────────────────────────┐
│     Layer 1: Client API     │  ← Your test code (TypeScript/Python/Java/.NET)
│     (playwright-core)       │
├─────────────────────────────┤
│     Layer 2: Server         │  ← Protocol translation + actionability engine
│     (playwright-server)     │
├─────────────────────────────┤
│     Layer 3: Browser        │  ← Patched Chromium, Firefox, or WebKit binary
│     (native protocols)      │
└─────────────────────────────┘
```

**Layer 1 (Client API)** is what you write tests against. `page.click()`, `page.fill()`, `expect(locator).toBeVisible()`. This layer is a thin wrapper that serializes commands and sends them to the server.

**Layer 2 (Server)** is the brain. It receives commands from the client, translates them into browser-specific protocol messages, manages browser lifecycle, implements auto-waiting, and handles the actionability engine. The server runs in its own Node.js process and communicates with the client over a WebSocket or in-process pipe.

**Layer 3 (Browser)** is a real browser binary that receives automation commands through native debugging protocols. For Chromium, that's the Chrome DevTools Protocol. For Firefox, it's Juggler. For WebKit, it's the WebKit Inspector Protocol.

## Deep Dive: The Three Protocols

### Chrome DevTools Protocol (CDP) --- Chromium

CDP is the most mature and well-documented browser automation protocol. It's the same protocol that Chrome DevTools uses when you open the inspector panel. CDP exposes domains like `DOM`, `Network`, `Runtime`, `Page`, and `Input`, each providing fine-grained control over browser internals.

```
Client → WebSocket → CDP Domain.method(params) → Chromium
                                                    ↓
Client ← WebSocket ← CDP Domain.event(data)    ← Chromium
```

Key CDP capabilities Playwright uses:

| CDP Domain | Purpose | Example |
|------------|---------|---------|
| `Page` | Navigation, lifecycle events | `Page.navigate`, `Page.loadEventFired` |
| `DOM` | Element queries, mutations | `DOM.querySelector`, `DOM.getDocument` |
| `Network` | Request interception, mocking | `Network.requestWillBeSent`, `Fetch.fulfillRequest` |
| `Runtime` | JavaScript evaluation | `Runtime.evaluate`, `Runtime.callFunctionOn` |
| `Input` | Mouse, keyboard, touch | `Input.dispatchMouseEvent`, `Input.dispatchKeyEvent` |
| `Emulation` | Device, geolocation, timezone | `Emulation.setDeviceMetricsOverride` |

CDP is powerful but complex. A simple click operation requires coordinating across `DOM` (find element), `Runtime` (compute coordinates), and `Input` (dispatch event) domains. This coordination is what the Playwright server layer handles.

### Juggler --- Firefox

Firefox doesn't natively support CDP. Instead, the Playwright team maintains a set of patches to the Firefox source code that add a custom automation protocol called Juggler. These patches are contributed upstream where possible, but Juggler remains primarily a Playwright-maintained protocol.

Juggler mirrors CDP's capabilities but uses Firefox-native APIs internally. When Playwright sends a Juggler command to scroll to an element, Firefox uses its own layout engine (Gecko) to compute the scroll position, rather than simulating it through JavaScript.

The Juggler protocol is defined in Playwright's source code and evolves alongside Firefox releases. When a new Firefox version ships, the Playwright team updates the patches and tests against the new engine.

### WebKit Inspector Protocol --- WebKit

WebKit (the engine behind Safari) has its own inspector protocol, originally designed for Safari's Web Inspector. Playwright patches WebKit to extend this protocol with automation-specific capabilities --- headless mode, input dispatching, and network interception features that the stock inspector protocol doesn't expose.

This is particularly valuable because Safari is notoriously difficult to automate. Selenium requires Safari's built-in WebDriver, which has limited capabilities and requires macOS. Playwright's patched WebKit runs on Linux, macOS, and Windows, giving teams cross-platform WebKit testing without needing macOS infrastructure.

## Deep Dive: Patched Browsers

One of Playwright's most controversial architectural decisions is shipping patched browser binaries. When you run `npx playwright install`, you download Chromium, Firefox, and WebKit builds that Microsoft has compiled from source with additional patches.

### What the Patches Do

The patches are minimal and focused on automation capabilities:

- **Headless mode improvements.** The stock headless modes of some browsers lack features needed for testing (compositing, font rendering, etc.).
- **Input dispatching.** Patches expose APIs for trusted input events that exactly match real user interaction.
- **Network interception.** Patches enable protocol-level request interception that JavaScript-based approaches cannot achieve.
- **Browser context isolation.** Patches improve the isolation guarantees of browser contexts.

### What the Patches Don't Do

The patches do not change:

- **Rendering engines.** Blink (Chromium), Gecko (Firefox), and WebKit render pages identically to their unpatched counterparts.
- **JavaScript engines.** V8, SpiderMonkey, and JavaScriptCore are unmodified.
- **Web API behavior.** Standards compliance is identical.

This means that while you're technically not testing against the exact binary your users run, you are testing against the same rendering and JavaScript engines. The automation patches are in the plumbing, not in the engine room.

### The Tradeoff

The alternative is what Selenium does: rely on each browser vendor to ship their own automation driver. This means waiting for vendors to fix bugs, dealing with version mismatches, and accepting the limitations of whatever API the vendor chooses to expose.

Playwright's approach gives it control over the entire stack, at the cost of maintaining patches across three browser engines for every release. Given Microsoft's resources and the team's expertise, this has proven sustainable.

## Deep Dive: Browser Contexts

Browser contexts are arguably Playwright's most important architectural concept. A context is a lightweight, isolated browser session:

```typescript
const browser = await chromium.launch();

// Each context is completely isolated
const userContext = await browser.newContext();
const adminContext = await browser.newContext();

// Separate cookies, storage, permissions
const userPage = await userContext.newPage();
const adminPage = await adminContext.newPage();
```

Contexts share the browser process but have independent:

- Cookies and local storage
- Session storage
- Cache
- Service worker registrations
- Permissions (geolocation, notifications, etc.)
- Proxy settings
- Viewport and device emulation

Creating a new context takes **2--5 milliseconds**, compared to **1--3 seconds** for launching a new browser instance. This is why Playwright tests can run in parallel efficiently: each test gets a fresh context, not a fresh browser.

### How Contexts Enable Test Isolation

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    // Every test gets a fresh context automatically
    contextOptions: {
      ignoreHTTPSErrors: true,
    },
  },
});
```

The `@playwright/test` runner creates a new browser context for every test by default. This means:

- No shared state between tests
- No need to clear cookies or storage between tests
- Tests can run in any order
- Parallel execution is safe by default

## Deep Dive: The Actionability Engine

When you write `await page.click('#submit')`, the Playwright server performs these checks before clicking:

1. **Attached.** The element is present in the DOM.
2. **Visible.** The element has non-zero size and is not hidden by CSS (`display: none`, `visibility: hidden`, `opacity: 0`).
3. **Stable.** The element's bounding box is the same across two consecutive animation frames. This catches elements that are mid-animation or being repositioned by layout shifts.
4. **Enabled.** The element is not disabled (`disabled` attribute, `aria-disabled`).
5. **Receives events.** No other element would intercept the click at the target coordinates (checked via `elementFromPoint()`). This catches overlay modals, loading spinners, and z-index issues.
6. **Editable.** For input actions (`fill`, `type`), the element accepts input.

If any check fails, Playwright retries automatically until the configured timeout (default 30 seconds). This is not polling --- Playwright subscribes to DOM mutation observers and re-checks immediately when the DOM changes.

```typescript
// This single line handles all six checks automatically
await page.getByRole('button', { name: 'Submit' }).click();

// Equivalent Selenium code would require:
// 1. Find element
// 2. Wait for visibility
// 3. Wait for clickability
// 4. Scroll into view
// 5. Handle potential StaleElementReferenceException
// 6. Retry on ElementClickInterceptedException
```

## The Communication Flow

Here is what happens for a complete click operation:

```
Test Code                    Playwright Server               Browser (CDP)
────────                    ─────────────────               ──────────────
click('#submit')     →     resolve selector
                           ←──────────────────────────→     DOM.querySelector
                           receive element handle
                           ←──────────────────────────→     DOM.getBoxModel
                           check visibility
                           ←──────────────────────────→     Runtime.evaluate(getComputedStyle)
                           check stability (frame 1)
                           ←──────────────────────────→     Runtime.evaluate(getBoundingRect)
                           check stability (frame 2)
                           ←──────────────────────────→     Runtime.evaluate(getBoundingRect)
                           check receives events
                           ←──────────────────────────→     Runtime.evaluate(elementFromPoint)
                           dispatch click
                           ←──────────────────────────→     Input.dispatchMouseEvent(moved)
                           ←──────────────────────────→     Input.dispatchMouseEvent(pressed)
                           ←──────────────────────────→     Input.dispatchMouseEvent(released)
                    ←      return success
```

This entire sequence completes in under 20 milliseconds for a ready element. If the element isn't ready, Playwright waits for DOM mutations and retries the check sequence --- no polling, no sleep, no guesswork.

## Tradeoffs and Limitations

- **Protocol overhead.** Playwright's initial WebSocket handshake is ~326 KB compared to Puppeteer's ~11 KB. For long-running test suites, this one-time cost is negligible. For serverless or short-lived automation tasks, it matters.
- **Patched browsers lag behind releases.** When Chrome ships a new version, there's typically a 1--2 week delay before Playwright's patched Chromium catches up.
- **Browser download size.** The three patched browsers total ~500 MB to download. Playwright caches them, but the initial install can be slow on limited bandwidth.
- **Debugging protocol issues.** When something goes wrong at the protocol level, debugging requires understanding CDP/Juggler/Inspector internals --- a steep learning curve.

## Conclusion

Playwright's architecture is not an implementation detail --- it's the reason the tool works as well as it does. The three-layer design (client API, server with actionability engine, native browser protocols) eliminates entire categories of flaky test problems: stale element references, timing-based waits, and driver version mismatches.

The patched browser approach gives Playwright control over the full stack, enabling features like browser contexts, protocol-level network interception, and true cross-browser support. The actionability engine turns every user action into a reliable operation by checking six conditions before proceeding.

Understanding this architecture will inform everything we cover in the rest of the series --- from why locators work the way they do, to how network mocking intercepts requests before they leave the browser, to why parallel execution is safe by default.

---

*Next in the series: [Playwright vs Everyone --- An Honest Technical Comparison](post-03-why-playwright-wins.md) --- Head-to-head benchmarks against Selenium, Cypress, Puppeteer, and WebDriverIO.*

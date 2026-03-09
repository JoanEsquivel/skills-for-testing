# Part 2: Architecture & How It Works

*Series: Understanding Vibium | Post 2 of 3*

## Under the Hood

Vibium isn't a wrapper around Selenium or a fork of Playwright. It's a ground-up build with a clear architectural philosophy: **layers that serve different audiences, unified by a modern protocol**.

## The 4-Layer Stack

### Layer 1: Clicker (The Engine)

The foundation is a Go binary called **Clicker** — roughly 10MB, zero runtime dependencies. No JVM. No Node.js. Just a single binary that:

- Acts as a **WebDriver BiDi proxy** between your code and the browser
- Manages the browser lifecycle (launch, connect, close)
- Speaks the BiDi protocol over WebSockets
- Exposes both CLI commands and an MCP server interface
- Downloads and caches Chrome automatically on first use

The choice of Go is deliberate: fast compilation, single binary distribution, excellent concurrency support, and cross-platform builds without complex toolchains.

**Platform cache locations:**
- Linux: `~/.cache/vibium/`
- macOS: `~/Library/Caches/vibium/`
- Windows: `%LOCALAPPDATA%\vibium\`

### Layer 2: MCP Server (The AI Interface)

This is what makes Vibium "AI-native." The MCP (Model Context Protocol) server is built directly into the Clicker binary — not bolted on as an afterthought.

Any MCP-compatible client can control the browser:
- Claude Code
- Cursor
- Custom AI agents
- Any tool that speaks MCP

The server exposes **81 browser automation tools** that AI agents can discover and invoke. The agent doesn't need to know CSS selectors or understand the DOM — it works at the intent level.

### Layer 3: Client SDKs (The Developer Interface)

For human developers who want programmatic control:

**JavaScript/TypeScript:**
```javascript
import { Vibe } from 'vibium';

const vibe = new Vibe();
await vibe.go('https://example.com');

// Find by intent, not by selector
const loginBtn = await vibe.find('Login button');
await loginBtn.click();

// Self-healing: if "Login" becomes "Sign In", it still works
```

**Python:**
```python
from vibium import Vibe

vibe = Vibe()
vibe.go('https://example.com')

login_btn = vibe.find('Login button')
login_btn.click()
```

Both SDKs offer sync and async APIs, connecting via WebSocket to the BiDi interface.

### Layer 4: Retina + Cortex (The Intelligence — Coming in V2)

This is where the vision gets ambitious:

- **Retina** is a recording extension that watches browser interactions and converts them into "durable signals" — structured representations of what happened that survive UI changes. Think of it as mapping an application's behavior, not just its DOM.

- **Cortex** is a planning and memory layer. It builds navigable workflow models from Retina's signals, giving the system the ability to reason about application state, remember paths through an app, and generate intelligent test plans.

Together, Retina and Cortex transform Vibium from a "click this button" tool into a system that understands applications.

## Why WebDriver BiDi Matters

The protocol choice is arguably Vibium's most important technical decision.

**Classic WebDriver (Selenium):** HTTP request/response. Your test sends an HTTP request ("click this element"), waits for the response, then sends the next request. Every action is a round trip. It's slow and can't handle asynchronous browser events well.

**Chrome DevTools Protocol (Playwright):** Fast and powerful, but it's Chrome's internal debugging protocol. It works across Chromium-based browsers and has a Firefox implementation, but it's not a standard — it's whatever Chrome's team decides to ship.

**WebDriver BiDi (Vibium):** A W3C standard that combines the best of both:
- **Bidirectional**: The browser can push events to your code (no polling)
- **WebSocket-based**: Persistent connection, low latency
- **Standardized**: Cross-browser support is part of the spec
- **Real-time**: Events arrive as they happen, not on the next poll cycle

This is a bet on the future. BiDi is newer and less battle-tested than CDP, but it has the backing of the W3C and browser vendors.

## Self-Healing Locators

Traditional test automation breaks when selectors change:

```
# Selenium: breaks if the ID changes
driver.find_element(By.ID, "login-btn")

# Playwright: breaks if the test ID changes
page.getByTestId('login-btn')
```

Vibium's approach is different. When you write `vibe.find('Login button')`, the system uses AI to locate the element by **intent**, not by a specific attribute. If the button text changes from "Login" to "Sign In," or if the CSS class changes, or if the element moves in the DOM — the test still passes because the intent hasn't changed.

This is what "self-healing" means in practice: the automation adapts to UI changes without human intervention.

## The Technology Stack

The codebase composition reveals the architecture:

| Language | Percentage | Purpose |
|----------|-----------|---------|
| Go | 43.6% | Clicker binary, BiDi proxy, MCP server |
| JavaScript | 22.2% | JS SDK, examples, tooling |
| Python | 19.9% | Python SDK |
| TypeScript | 13.2% | Type definitions, TS SDK components |

## What's Next

In Part 3, we'll look at Vibium's current status, what the community thinks, what the roadmap looks like, and whether it's ready for real-world use.

---

*Previous: [Part 1: The Origin Story](./post-01.md) | Next: [Part 3: Current Status, Roadmap & Community Verdict](./post-03.md)*

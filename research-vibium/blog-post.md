# Vibium: The AI-Native Browser Automation Framework Built by Selenium's Creator

What if the person who built Selenium — the tool that powers billions of automated tests worldwide — decided to start over from scratch, with AI agents in mind? That's exactly what happened. And the result is called **Vibium**.

## Why Vibium Exists

In 2004, Jason Huggins created Selenium while working at ThoughtWorks. It became the foundation of web test automation for two decades. In 2012, he co-created Appium for mobile testing and co-founded Sauce Labs. Then came a moment that changed his perspective entirely.

In 2013, Huggins joined the emergency tech team tasked with repairing healthcare.gov. The existing testing tools — his own included — proved woefully inadequate for the crisis. He realized that if he could start over with modern technology, the result would look nothing like Selenium.

Fast forward to 2025. AI agents are writing code, browsing the web, and automating workflows. But they're doing it with tools designed for a pre-AI world. Selenium uses HTTP request/response cycles that are slow and fragile. Playwright is fast but locked to Chrome DevTools Protocol and Microsoft's ecosystem. Neither was built for a world where an LLM needs to drive a browser.

Vibium is Huggins' answer: **an open-source, AI-native browser automation framework built on the W3C WebDriver BiDi standard**. Its tagline captures the philosophy: *"Browser automation without the drama."*

## How Vibium Works

### The 4-Layer Architecture

Vibium is built as a layered stack, each layer serving a distinct purpose:

**1. Clicker (Shipped — v1)**
A single Go binary (~10MB) that acts as a WebDriver BiDi proxy. It manages the browser lifecycle, speaks the BiDi protocol over WebSockets (not HTTP like classic WebDriver), and exposes both CLI and MCP server interfaces. Zero runtime dependencies. Chrome downloads automatically on first use.

**2. MCP Server (Shipped)**
The AI agent interface layer. Any MCP-compatible client — Claude Code, Cursor, or custom agents — can control the browser through the Model Context Protocol. This is what makes Vibium "AI-native": browser control is a first-class capability for LLMs, not an afterthought.

**3. Client SDKs (Shipped)**
JavaScript/TypeScript and Python libraries with synchronous and asynchronous APIs:

```javascript
// JavaScript
import { Vibe } from 'vibium';
const vibe = new Vibe();
await vibe.go('https://example.com');
const el = await vibe.find('Login button');
await el.click();
```

```python
# Python
from vibium import Vibe
vibe = Vibe()
vibe.go('https://example.com')
el = vibe.find('Login button')
el.click()
```

**4. Retina + Cortex (Planned — v2)**
- **Retina**: A recording extension that converts browser interactions into durable signals — mapping applications for intelligent test generation.
- **Cortex**: A planning and memory layer that builds navigable workflow models, enabling the system to reason about application state.

### Key Technical Choices

- **WebDriver BiDi over WebSocket**: Real-time, bidirectional communication instead of the request/response model that made Selenium slow.
- **W3C standard**: Unlike Playwright's Chrome DevTools Protocol dependency, BiDi is an open standard supported across browsers.
- **Single binary**: The Go-based Clicker binary has no runtime dependencies — no JVM, no Node.js required for the core engine.

## What Vibium Can Do Right Now

As of v26.3.9 (March 2026), Vibium ships with:

- **81 browser automation tools** accessible through multiple interfaces
- **CLI commands**: `vibium go <url>`, `vibium click`, `vibium type`, `vibium screenshot`, `vibium text`, `vibium eval`
- **MCP Server**: Add browser control to any AI agent with one command
- **JavaScript/TypeScript SDK**: Sync and async APIs
- **Python SDK**: Sync and async APIs
- **Self-healing locators**: Tests adapt when UI changes instead of breaking (e.g., "Login" renamed to "Sign In")
- **Plain English test authoring**: Describe *what* to test, not *how*
- **Screenshots and recording**: Built-in capture; Record Player at player.vibium.dev
- **Zero configuration**: `npm install -g vibium` and you're running

### Installation

```bash
# Global CLI
npm install -g vibium

# As a skill for AI agents
npx skills add https://github.com/VibiumDev/vibium --skill vibe-check

# JavaScript/TypeScript project
npm install vibium

# Python project
pip install vibium
```

### Platform Support

- Linux x64
- macOS (Intel + Apple Silicon)
- Windows x64

Chrome is downloaded and cached automatically on first use.

## What's Missing (Honest Assessment)

Based on community feedback and Hacker News discussions, v1 has notable gaps:

- **No network request interception**: Can't monitor or mock API calls yet
- **No JavaScript injection**: Can't execute arbitrary JS in the page context for advanced scenarios
- **No DOM manipulation**: Limited to the provided tool set
- **No accessibility tree access**: AI agents rely on screenshots rather than structured page data
- **Performance overhead**: LLM processing adds latency compared to Playwright's direct browser connection
- **Limited enterprise ecosystem**: No established plugin marketplace, limited CI/CD integrations compared to Selenium/Playwright
- **Early-stage stability**: 352 commits, 6 contributors — not battle-tested at scale yet

Huggins has acknowledged that Vibium's advantages over Playwright become clearer in v2, when Retina and Cortex ship.

## The Roadmap

| Phase | Component | Purpose | Status |
|-------|-----------|---------|--------|
| V1 | Clicker | Action layer — clicking, typing, navigation, screenshots | Shipped |
| V2 | Retina | Sensing — recording extension, durable interaction signals | Planned |
| V2 | Cortex | Planning — memory layer, navigable workflow models | Planned |
| Future | Vibium Network | Decentralized global device pool with micropayments | Vision |
| Future | Java SDK | Java client library | Planned |
| Future | AI-powered locators | Intelligent element selection beyond self-healing | Planned |
| Future | Video recording | Full session recording capability | Planned |

The **Vibium Network** is the most ambitious piece: a decentralized, global pool of real devices for distributed testing, with micropayment-based access. Think "Airbnb for test devices."

## How Vibium Compares

| Feature | Selenium | Playwright | Vibium |
|---------|----------|------------|--------|
| Protocol | WebDriver (HTTP) | Chrome DevTools Protocol | WebDriver BiDi (WebSocket) |
| AI-native | No | No | Yes (MCP server built-in) |
| Self-healing | No | No | Yes |
| Natural language tests | No | No | Yes |
| Browser support | All major | Chromium, Firefox, WebKit | Chrome (more planned) |
| Maturity | 20+ years | 5+ years | < 1 year |
| Language support | Java, Python, C#, JS, Ruby | JS, Python, Java, .NET | JS/TS, Python |
| Open standard | W3C WebDriver | Proprietary (CDP) | W3C WebDriver BiDi |
| Speed | Slow | Fast | Moderate (LLM overhead) |

As Huggins puts it: *"Playwright wins the first derivative, Selenium wins the area under the curve."* Vibium is betting that AI-native capabilities will define the next curve.

## Community Sentiment

**The bulls say:**
- Huggins' track record (Selenium, Appium, Sauce Labs) gives Vibium instant credibility
- The AI-native approach fills a genuine gap in the testing ecosystem
- W3C BiDi standard avoids proprietary lock-in
- 2,700+ GitHub stars signal meaningful developer interest
- Open source commitment (Apache 2.0) with explicit promise of on-prem reference implementations

**The bears say:**
- Heavy marketing before shipping code (mid-2025 criticism, now largely addressed)
- v1 is missing features that power users expect
- Performance can't match Playwright for pure speed
- "Self-healing" claims need more real-world validation
- The testing space is crowded with well-funded alternatives

**The pragmatic take:**
Vibium is worth watching and experimenting with, but not yet ready to replace your production test suite. If you're building AI agents that need browser access, the MCP integration alone makes it worth trying. If you have a massive Selenium test suite with no upgrade path, Vibium may become that path — but not today.

## Getting Started

The fastest way to try Vibium:

```bash
# Install globally
npm install -g vibium

# Navigate to a URL
vibium go https://example.com

# Take a screenshot
vibium screenshot

# Click something
vibium click "Sign In"

# Type text
vibium type "hello@example.com"
```

For AI agent integration:

```bash
# Add to Claude Code or any MCP client
npx skills add https://github.com/VibiumDev/vibium --skill vibe-check
```

## The Bottom Line

Vibium represents a genuine bet on the future of browser automation. It's not just another Selenium wrapper or Playwright competitor — it's a rethinking of what browser automation looks like when AI agents are first-class citizens.

The creator has the credibility. The architecture makes sound technical choices. The open-source commitment is explicit. But it's early. Very early. The vision is compelling; the execution needs time to catch up.

If you care about where browser automation is headed, Vibium is the project to watch. If you need something production-ready today, Playwright is still your best bet. The interesting question is how long that remains true.

---

*Project: [github.com/VibiumDev/vibium](https://github.com/VibiumDev/vibium) | Website: [vibium.com](https://vibium.com/) | License: Apache 2.0*

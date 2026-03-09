# Part 1: The Origin Story — From Selenium to Vibium

*Series: Understanding Vibium | Post 1 of 3*

## The Man Who Built Selenium Wants to Replace It

In 2004, Jason Huggins was working at ThoughtWorks when he created a JavaScript-based tool to automate browser testing. He called it Selenium. Over the next two decades, it became the most widely used browser automation framework in the world — powering millions of test suites across every major enterprise.

In 2012, he co-created Appium to bring the same approach to mobile testing. He co-founded Sauce Labs, which grew into a major testing infrastructure company. By any measure, Huggins had already shaped the testing industry more than most people ever will.

So why start over?

## The Healthcare.gov Moment

In 2013, the launch of healthcare.gov was a disaster. The site crashed under load, forms broke, and millions of Americans couldn't access health insurance. Huggins joined the emergency tech team tasked with fixing it.

The experience was formative. The testing tools available — including his own — proved inadequate for the complexity and urgency of the crisis. He began thinking about what a browser automation tool would look like if he could build it from scratch, with no legacy constraints.

But the technology wasn't ready yet. The browser APIs were too limited. The AI capabilities didn't exist. So he waited.

## The AI Inflection Point

By 2025, the landscape had changed dramatically:

- **LLMs could understand and generate code**, making natural language test authoring feasible
- **The Model Context Protocol (MCP)** provided a standard way for AI agents to use tools
- **WebDriver BiDi** — a new W3C standard — offered real-time, bidirectional browser communication over WebSockets
- **"Vibe coding"** was emerging as a real workflow, with developers using AI tools to build applications through conversation

Huggins saw the convergence. The millions of legacy Selenium tests worldwide had no clear upgrade path. Playwright was modern but built for human developers, not AI agents. Nobody had built browser automation for the AI era.

## What Vibium Means

The name "Vibium" plays on "vibe coding" — the practice of describing what you want in natural language and letting AI figure out the implementation. In Vibium's world, you don't write CSS selectors or XPath expressions. You describe what you want to happen:

```bash
vibium go https://myapp.com
vibium click "Sign In"
vibium type "user@example.com"
vibium click "Submit"
```

Or you let an AI agent do it entirely, through the built-in MCP server.

Huggins' pitch is direct: *"Whatever we did with Selenium for the web, whatever we did with Appium for mobile, we are doing with AI."*

## The Open Source Commitment

One of the most important decisions Huggins made early was the licensing model. Vibium is Apache 2.0 — fully open source. He's been explicit about why:

> "Just like with Selenium, where for every Sauce Labs there's a Selenium Grid, there will be an on-prem reference implementation. All of the magic will not be gated behind a 'sign here' yearly contract."

This matters because the testing tool space has increasingly moved toward proprietary, SaaS-only models. Vibium is betting that the Selenium playbook — open core with commercial services on top — still works.

## What's Next

In Part 2, we'll dig into how Vibium actually works: the 4-layer architecture, the WebDriver BiDi protocol, and what makes it technically different from Selenium and Playwright.

---

*Next: [Part 2: Architecture & How It Works](./post-02.md)*

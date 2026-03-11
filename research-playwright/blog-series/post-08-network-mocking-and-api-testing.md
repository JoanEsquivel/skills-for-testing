# Controlling the Network

## The Hook

Your e-commerce checkout test fails every third run. The payment API returns a 500 error because the staging server is overloaded. Your test is correct. Your application code is correct. The network is not.

This is why network control matters. In end-to-end testing, the network is the single largest source of non-determinism. API servers go down. Response times vary. Third-party services rate-limit. Staging environments drift from production. Every flaky test that works locally but fails in CI should make you ask: "Is the network the variable?"

Playwright gives you protocol-level control over every network request the browser makes. Not JavaScript-level interception (like `fetch` monkey-patching) --- protocol-level, meaning you can intercept requests before they leave the browser process.

## Context: Why Protocol-Level Matters

There are three levels at which you can intercept network requests:

| Level | How | Limitations |
|-------|-----|-------------|
| **Application** | MSW, fetch mocking | Only intercepts JavaScript-initiated requests. Misses images, fonts, CSS, iframes. |
| **Browser** | Service Workers | Only within service worker scope. Registration has timing issues. |
| **Protocol** | Playwright `page.route()` | Intercepts everything: XHR, fetch, images, fonts, WebSockets. No timing issues. |

Playwright operates at the protocol level, which means it sees and controls every request --- including those initiated by CSS (`@import`, `url()`), HTML (`<img>`, `<script>`, `<link>`), and browser internals (favicon, service worker registration).

## Core Idea: page.route() Is Your Network Control Layer

`page.route()` registers a handler for requests matching a URL pattern. The handler can:

- **Fulfill** the request with a custom response
- **Abort** the request entirely
- **Continue** the request with modifications (headers, body, URL)
- **Fall through** to the next handler or the network

## Deep Dive: Request Mocking

### Mock an API Response

```typescript
test('displays products from API', async ({ page }) => {
  // Mock the products API
  await page.route('**/api/products', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Laptop', price: 999 },
        { id: 2, name: 'Mouse', price: 29 },
      ]),
    });
  });

  await page.goto('/products');
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByText('Laptop')).toBeVisible();
});
```

### Mock with Conditional Logic

```typescript
test('handles pagination', async ({ page }) => {
  let callCount = 0;

  await page.route('**/api/products*', async (route) => {
    callCount++;
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
        currentPage: pageNum,
      }),
    });
  });

  await page.goto('/products');
  await expect(page.getByText('Product 1')).toBeVisible();

  await page.getByRole('button', { name: 'Next page' }).click();
  await expect(page.getByText('Product 11')).toBeVisible();
});
```

### Abort Requests

```typescript
test('page works without analytics', async ({ page }) => {
  // Block analytics and tracking scripts
  await page.route('**/{google-analytics,segment,mixpanel}**', (route) => {
    route.abort();
  });

  await page.goto('/');
  await expect(page.getByRole('heading')).toBeVisible();
});
```

### Modify Requests

```typescript
test('adds auth header to API requests', async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    await route.continue({
      headers: {
        ...route.request().headers(),
        'Authorization': 'Bearer test-token-123',
      },
    });
  });

  await page.goto('/dashboard');
});
```

### Modify Responses

```typescript
test('injects feature flag', async ({ page }) => {
  await page.route('**/api/feature-flags', async (route) => {
    // Get the real response
    const response = await route.fetch();
    const json = await response.json();

    // Modify it
    json.newCheckoutFlow = true;

    // Return modified response
    await route.fulfill({
      response,
      body: JSON.stringify(json),
    });
  });

  await page.goto('/checkout');
});
```

## Deep Dive: HAR Record and Replay

HAR (HTTP Archive) files capture complete network traffic. Playwright can record HAR files during test execution and replay them later for deterministic tests.

### Recording HAR

```typescript
test('record HAR for product page', async ({ page }) => {
  // Start recording
  await page.routeFromHAR('tests/fixtures/products.har', {
    url: '**/api/**',
    update: true, // Record mode: save to file
  });

  await page.goto('/products');
  await page.getByRole('link', { name: 'Laptop' }).click();
  await expect(page.getByRole('heading', { name: 'Laptop' })).toBeVisible();

  // HAR file is saved when the page closes
});
```

### Replaying HAR

```typescript
test('product page with recorded responses', async ({ page }) => {
  // Replay mode: serve from HAR file
  await page.routeFromHAR('tests/fixtures/products.har', {
    url: '**/api/**',
    update: false, // Replay mode
  });

  await page.goto('/products');
  await expect(page.getByText('Laptop')).toBeVisible();
});
```

### HAR Workflow

1. **Record** --- Run tests with `update: true` against a real server
2. **Commit** --- Add the `.har` file to version control
3. **Replay** --- Run tests with `update: false` for deterministic execution
4. **Re-record** --- When the API changes, run with `update: true` again

### When to Use HAR vs Manual Mocking

| Scenario | Use HAR | Use page.route() |
|----------|---------|-------------------|
| Many API endpoints | Yes --- captures everything | No --- too many routes |
| Stable API contract | Yes --- record once, replay | No --- overkill |
| Testing error scenarios | No --- can't record errors easily | Yes --- precise control |
| Testing edge cases | No --- can't manufacture data | Yes --- custom responses |
| API still in development | No --- responses will change | Yes --- mock the contract |

## Deep Dive: WebSocket Mocking

Playwright can intercept WebSocket connections for real-time features:

```typescript
test('chat receives messages', async ({ page }) => {
  // Intercept WebSocket connections
  await page.routeWebSocket('wss://chat.example.com/**', (ws) => {
    // Handle messages from the page
    ws.onMessage((message) => {
      const data = JSON.parse(message.toString());

      if (data.type === 'join') {
        // Simulate server response
        ws.send(JSON.stringify({
          type: 'joined',
          room: data.room,
          users: ['Alice', 'Bob'],
        }));
      }
    });

    // Simulate incoming message after 1 second
    setTimeout(() => {
      ws.send(JSON.stringify({
        type: 'message',
        from: 'Alice',
        text: 'Hello!',
      }));
    }, 1000);
  });

  await page.goto('/chat');
  await page.getByRole('button', { name: 'Join Room' }).click();
  await expect(page.getByText('Hello!')).toBeVisible();
});
```

### WebSocket Proxy Pattern

```typescript
test('modify WebSocket messages', async ({ page }) => {
  await page.routeWebSocket('wss://api.example.com/ws', (ws) => {
    const server = ws.connectToServer();

    // Forward messages but modify them
    ws.onMessage((message) => {
      // Forward client messages to server
      server.send(message);
    });

    server.onMessage((message) => {
      const data = JSON.parse(message.toString());
      // Add timestamp to all server messages
      data.receivedAt = Date.now();
      ws.send(JSON.stringify(data));
    });
  });

  await page.goto('/realtime-dashboard');
});
```

## Deep Dive: API Testing with APIRequestContext

Playwright can make HTTP requests without a browser, using `APIRequestContext`:

### Standalone API Tests

```typescript
import { test, expect } from '@playwright/test';

test.describe('Products API', () => {
  test('returns product list', async ({ request }) => {
    const response = await request.get('/api/products');

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const products = await response.json();
    expect(products).toHaveLength(10);
    expect(products[0]).toHaveProperty('name');
    expect(products[0]).toHaveProperty('price');
  });

  test('creates a new product', async ({ request }) => {
    const response = await request.post('/api/products', {
      data: {
        name: 'New Product',
        price: 49.99,
        category: 'electronics',
      },
    });

    expect(response.status()).toBe(201);
    const product = await response.json();
    expect(product.name).toBe('New Product');
    expect(product.id).toBeDefined();
  });

  test('requires authentication', async ({ request }) => {
    const response = await request.delete('/api/products/1', {
      headers: {}, // No auth header
    });

    expect(response.status()).toBe(401);
  });
});
```

### Combining API and UI Tests

```typescript
test('create product via API, verify in UI', async ({ page, request }) => {
  // Create test data via API (fast, no UI overhead)
  const response = await request.post('/api/products', {
    data: { name: 'Test Product', price: 99.99 },
  });
  const product = await response.json();

  // Verify it appears in the UI
  await page.goto('/products');
  await expect(page.getByText('Test Product')).toBeVisible();
  await expect(page.getByText('$99.99')).toBeVisible();

  // Cleanup via API
  await request.delete(`/api/products/${product.id}`);
});
```

### Shared Authentication

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: 'http://localhost:3000',
    extraHTTPHeaders: {
      'Authorization': `Bearer ${process.env.API_TOKEN}`,
    },
  },
});
```

The `request` fixture shares cookies and headers with the browser context, so API calls made through `request` use the same authentication as the browser.

## Practical Patterns

### Pattern 1: Mock API Errors

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

### Pattern 2: Simulate Slow Responses

```typescript
test('shows loading state', async ({ page }) => {
  await page.route('**/api/products', async (route) => {
    // Delay the response by 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });

  await page.goto('/products');
  // Loading state should be visible during the delay
  await expect(page.getByText('Loading...')).toBeVisible();
  // After delay, loading disappears
  await expect(page.getByText('Loading...')).not.toBeVisible({ timeout: 5000 });
});
```

### Pattern 3: Intercept and Validate Requests

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

  // Verify the request body
  expect(capturedRequest).toEqual({
    name: 'John Doe',
    address: '123 Main St',
  });
});
```

### Pattern 4: Wait for API Response

```typescript
test('navigates after save', async ({ page }) => {
  await page.goto('/editor');
  await page.getByLabel('Title').fill('My Article');

  // Start waiting for the API call BEFORE triggering it
  const responsePromise = page.waitForResponse('**/api/articles');

  await page.getByRole('button', { name: 'Save' }).click();

  const response = await responsePromise;
  expect(response.status()).toBe(200);
  await expect(page).toHaveURL(/\/articles\/\d+/);
});
```

## Tradeoffs and Limitations

- **Mock drift.** Mocked responses can drift from the real API over time. Periodically re-record HAR files or validate mocks against API schemas.
- **Over-mocking.** Mocking every API call creates tests that verify your mocks, not your application. Use mocking strategically for external dependencies and flaky endpoints.
- **HAR file size.** HAR files with response bodies can be large. Use URL filters to record only relevant endpoints.
- **WebSocket mocking complexity.** Real-time protocols with complex state machines are hard to mock faithfully. Consider using a test server for complex WebSocket scenarios.
- **No built-in mock server.** Playwright provides interception primitives but no mock server framework. For complex mocking needs, combine `page.route()` with a library like `msw`.

## Conclusion

Playwright's network control operates at the protocol level --- below the browser's JavaScript engine, below service workers, below the fetch API. This means you can intercept, modify, and mock any request the browser makes, including those initiated by CSS, HTML, and browser internals.

The key patterns are: `page.route()` for targeted mocking, HAR for broad recording/replay, `routeWebSocket()` for real-time protocols, and `APIRequestContext` for direct API testing without browser overhead.

The discipline is in knowing when to mock and when not to. Mock external dependencies and error scenarios. Don't mock the APIs your application actually needs to work with.

---

*Next in the series: [Visual Regression and Accessibility](post-09-visual-regression-and-accessibility.md) --- toHaveScreenshot(), axe-core integration, and WCAG 2.1 AA compliance testing.*

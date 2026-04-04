---
name: ai-blog-publisher
description: Process raw AI blog articles — read the content, determine the best category and tags, generate the required YAML frontmatter, create the companion sources file, and save both files with the correct naming convention. Use this skill when you receive a raw article (markdown without frontmatter) and need to publish it to the AI Blog. Triggers on ai-blog, publish article, add frontmatter, categorize post, ai blog post.
metadata:
  version: "1.0.0"
  category: content
  tags: ai-blog, content, frontmatter, publishing
---

# AI Blog Publisher

You process raw markdown articles and prepare them for the AI Blog content collection. Your job is to read the article, categorize it, generate frontmatter, create the companion sources file, and write both files to the correct locations.

## When to Use This Skill

- The user provides a raw markdown article (no YAML frontmatter) to publish on the AI Blog
- The user asks to "add frontmatter" or "publish" an article to the AI Blog
- The user drops a `.md` file in `src/content/ai-blog/` that is missing frontmatter
- The user asks to categorize and structure an article for the AI Blog

## File Locations

| File type | Directory |
|-----------|-----------|
| Blog post | `src/content/ai-blog/<slug>.md` |
| Sources companion | `src/content/ai-blog-sources/<slug>.md` |

Both files MUST share the same filename (the slug). The slug is derived from the article title: lowercase, spaces replaced with hyphens, special characters removed, leading/trailing hyphens stripped.

## Step-by-Step Process

### 1. Read the raw article

Read the full article content. Identify:
- The main topic and subject matter
- Any inline references, links, or citations
- Whether it belongs to an existing series

### 2. Determine the category

Choose exactly ONE category from this list:

| Key | Label | Use when the article is about... |
|-----|-------|----------------------------------|
| `qa` | QA | Testing, test automation, quality assurance, CI/CD testing strategies |
| `ai` | AI | Artificial intelligence, machine learning, LLMs, prompt engineering, AI tools |
| `frontend` | FrontEnd | UI frameworks, CSS, JavaScript, browser APIs, web components, accessibility |
| `backend` | Backend | Server-side languages, APIs, databases, microservices, system design |
| `software-engineering` | Software Engineering | Design patterns, SOLID principles, architectural patterns, software architecture |
| `data` | Data | Data engineering, data science, analytics, ETL, data pipelines |
| `cloud` | Cloud | Cloud providers, Kubernetes, Docker, infrastructure, DevOps, deployment |
| `life-work-balance` | Life-Work Balance | Wellness, productivity, burnout prevention, remote work, work-life harmony |
| `softskills` | Soft Skills | Communication, leadership, teamwork, mentoring, career growth |

If the article spans multiple categories, pick the ONE that best represents the primary focus.

### 3. Generate tags

- Extract 2-5 specific topic tags from the article content
- Tags should be Title Case (e.g., "Test Automation", not "test automation")
- Tags must be unique (no duplicates)
- Tags are subcategories — more specific than the category itself
- Examples: "Playwright", "Kubernetes", "Prompt Engineering", "LLM", "React", "Communication"

### 4. Generate the slug

From the title:
1. Trim whitespace
2. Convert to lowercase
3. Replace spaces with hyphens
4. Remove special characters (keep only `[a-z0-9-]`)
5. Remove leading/trailing hyphens
6. Keep it concise — if the title is very long, use a shortened version

### 5. Write the blog post file

Create `src/content/ai-blog/<slug>.md` with this exact frontmatter structure:

```yaml
---
title: "The Article Title"
description: "A 1-2 sentence summary of what the reader will learn. Max ~160 characters for SEO."
pubDate: YYYY-MM-DD
heroImage: "https://images.unsplash.com/photo-XXXXX?w=750&h=422&fit=crop"
category: "chosen-category"
tags:
  - Tag One
  - Tag Two
  - Tag Three
badge: "New"
series: "Series Name"
seriesOrder: 1
---
```

**Field rules:**

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | Wrap in quotes. Clean, descriptive title. |
| `description` | Yes | Wrap in quotes. 1-2 sentences, ~120-160 chars. Summarizes what the reader learns. |
| `pubDate` | Yes | Format: `YYYY-MM-DD`. Use today's date unless the user specifies otherwise. |
| `heroImage` | No | Unsplash URL with `?w=750&h=422&fit=crop` parameters. The domain `images.unsplash.com` is already whitelisted. To find a relevant image, use WebSearch with `site:unsplash.com {topic} photo`, extract an `images.unsplash.com/photo-*` URL, and append the crop parameters. If no suitable image is found, omit the field. |
| `category` | Yes | One of: `qa`, `ai`, `frontend`, `backend`, `software-engineering`, `data`, `cloud`, `life-work-balance`, `softskills` |
| `tags` | Yes | Array of 2-5 unique Title Case strings |
| `badge` | No | Use `"New"` for fresh posts. Remove after a few weeks. |
| `series` | No | Only if the post belongs to a multi-part series. Human-readable name (e.g., "AI Fundamentals"). |
| `seriesOrder` | No | Only if `series` is set. Integer starting at 1. |

After the frontmatter `---` closing, the article body MUST begin with a **Table of Contents** section, followed by the rest of the content. Remove any inline source citations from the body — those go in the companion sources file instead.

### 5b. Generate the Table of Contents

Every AI blog post MUST include a Table of Contents as the first section after the frontmatter. Astro auto-generates `id` attributes on all headings from markdown, so anchor links work automatically.

**ID generation rules** (how Astro creates the `id` from the heading text):
1. Convert to lowercase
2. Replace spaces with hyphens
3. Remove special characters except hyphens
4. `&` becomes `--` (e.g., "Installation & Setup" → `installation--setup`)
5. `:` and other punctuation are removed

**Format:**

```markdown
## Table of Contents

1. [First Section Title](#first-section-id)
2. [Second Section Title](#second-section-id)
3. [Third Section Title](#third-section-id)

---
```

**Rules:**
- List only `## ` (h2) headings — do NOT include `### ` (h3) subheadings
- Use a numbered list (`1.`, `2.`, etc.)
- Each item is a markdown link: `[Visible Text](#heading-id)`
- End the TOC with a horizontal rule (`---`) to visually separate it from the content
- The TOC heading itself (`## Table of Contents`) is NOT listed in the TOC

### 6. Write the companion sources file

Create `src/content/ai-blog-sources/<slug>.md` (same slug as the post):

```yaml
---
postSlug: "the-slug"
sources:
  - title: "Source Title"
    url: "https://example.com/page"
    accessDate: "YYYY-MM-DD"
  - title: "Another Source"
    url: "https://example.com/other"
    accessDate: "YYYY-MM-DD"
---

Brief description of the research methodology or how sources were compiled.
```

**Field rules:**

| Field | Required | Notes |
|-------|----------|-------|
| `postSlug` | Yes | Must exactly match the blog post filename (without `.md`). |
| `sources` | Yes | Array with at least 1 entry. Each entry has `title` (string), `url` (valid URL), and optional `accessDate` (string, `YYYY-MM-DD`). |
| Body content | No | Optional markdown below the frontmatter. Describes research methodology or notes about the sources. |

**Where to find sources:**
- Extract URLs and references cited in the original article
- If the article mentions tools, frameworks, or papers, link to their official pages
- If the user provided a separate resources/references document, use those
- `accessDate` should be today's date unless the user specifies otherwise

### 7. Verify

After writing both files, confirm:
- [ ] The slug matches between the post file and the sources file (`postSlug` field)
- [ ] The `category` value is one of the 9 valid enum values
- [ ] Tags are unique and Title Case
- [ ] `pubDate` and `accessDate` use `YYYY-MM-DD` format
- [ ] `heroImage` URL uses `images.unsplash.com` (already whitelisted) with `?w=750&h=422&fit=crop`
- [ ] Sources have at least 1 entry with valid URLs
- [ ] The article body does NOT have a top-level `# Heading` (the `title` field handles the `<h1>`)
- [ ] The article body starts with `## Table of Contents` containing anchor links to all h2 sections
- [ ] TOC anchor IDs match the auto-generated heading IDs (lowercase, hyphens, `&` → `--`)

## Example Output

### Post: `src/content/ai-blog/playwright-visual-testing.md`

```markdown
---
title: "Visual Testing with Playwright"
description: "Learn how to implement pixel-perfect visual regression testing using Playwright's built-in screenshot comparison and best practices for CI integration."
pubDate: 2026-03-07
heroImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=750&h=422&fit=crop"
category: "qa"
tags:
  - Playwright
  - Visual Testing
  - Test Automation
badge: "New"
---

## Table of Contents

1. [Why Visual Testing Matters](#why-visual-testing-matters)
2. [Setting Up Screenshot Comparisons](#setting-up-screenshot-comparisons)
3. [CI Integration & Best Practices](#ci-integration--best-practices)

---

## Why Visual Testing Matters

Content starts here with h2 headings...

## Setting Up Screenshot Comparisons

More content...

## CI Integration & Best Practices

More content...
```

### Sources: `src/content/ai-blog-sources/playwright-visual-testing.md`

```markdown
---
postSlug: "playwright-visual-testing"
sources:
  - title: "Playwright Visual Comparisons Documentation"
    url: "https://playwright.dev/docs/test-snapshots"
    accessDate: "2026-03-07"
  - title: "Visual Regression Testing Best Practices"
    url: "https://playwright.dev/docs/best-practices"
    accessDate: "2026-03-07"
---

Sources gathered from official Playwright documentation and community best practices for visual regression testing.
```

## Important Constraints

- The article body should start with `## ` (h2) headings, never `# ` (h1) — the title frontmatter field is rendered as h1 by the layout
- Do NOT invent or fabricate source URLs — only use URLs that appear in the article, are provided by the user, or link to well-known official documentation pages
- If no sources are available, ask the user to provide them — the sources array requires at least 1 entry
- Unsplash is the only whitelisted remote image domain (along with `logowik.com` and `www.w3.org`). Do not use images from other domains
- Keep the description under 160 characters for optimal SEO meta tag rendering

## Integration with blog-researcher Agent

When processing articles produced by the `blog-researcher` agent (from the `research-for-posts` skill), check for a `resources.md` file in the same research folder (`./research-{topic}/resources.md`). Use the URLs listed there to populate the companion sources file, saving manual source extraction.

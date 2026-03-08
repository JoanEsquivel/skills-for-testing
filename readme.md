# Research Machine

An AI-powered research workflow that transforms topics into structured blog content. This project uses Claude agent skills to automate the research-to-publication pipeline.

## How It Works

1. **Request a topic** — Ask the agent to research any subject
2. **Automated research** — The agent gathers information from documentation, repositories, and community sources
3. **Structured output** — Research is synthesized into blog posts following a consistent storytelling framework
4. **Publish** — Format and publish the content with proper frontmatter and SEO metadata

## `.claude/` Directory Structure

The `.claude/` folder contains the configuration that powers this research machine:

```
.claude/
├── agents/
│   ├── blog-researcher.md          # Agent for research tasks
│   ├── ai-blog-publisher.md        # Agent for publishing to AI Blog
│   └── futbol-news-researcher.md   # Agent for football TikTok content
├── agent-memory/
│   ├── blog-researcher/
│   │   └── MEMORY.md               # Persistent learnings for research
│   ├── ai-blog-publisher/
│   │   └── MEMORY.md               # Persistent learnings for publishing
│   └── futbol-news-researcher/
│       └── MEMORY.md               # Persistent learnings for football content
├── skills/
│   ├── research-for-posts/
│   │   └── SKILL.md                # Core research workflow
│   ├── ai-blog-publisher/
│   │   └── SKILL.md                # Blog formatting and publishing
│   └── futbol-news-researcher/
│       └── SKILL.md                # Football news & TikTok scripts
└── settings.local.json             # Local Claude configuration
```

### Agents

**`blog-researcher`** — Specialized agent for research tasks:
- Uses the `research-for-posts` skill
- Follows a structured research → structure → output workflow
- Gathers from official docs, repositories, community content, and user-provided files
- Maintains persistent memory of patterns and optimizations

**`ai-blog-publisher`** — Specialized agent for publishing:
- Uses the `ai-blog-publisher` skill
- Takes raw markdown and prepares it for the AI Blog
- Generates frontmatter, categories, tags, and table of contents
- Creates companion sources files with citations
- Can process output from the blog-researcher agent

**`futbol-news-researcher`** — Specialized agent for football TikTok content:
- Uses the `futbol-news-researcher` skill
- Researches weekly football news across 5 source categories (sports outlets, official sources, transfer data, social media trends, community perspectives)
- Produces 8-12 TikTok-ready content packages per week
- Covers Barcelona, Real Madrid, Champions League, World Cups, and viral player stories
- Outputs a single `futbol-news-{week}.md` file with full spoken-word scripts
- Maintains persistent memory of source reliability and viral patterns

### Agent Memory

Each agent has persistent memory that stores learnings across sessions:

- **Research patterns** — Parallel search strategies, handling failed fetches, source quality signals
- **Writing conventions** — No emojis, em dashes, attribution requirements
- **Publishing rules** — Category enum values, tag conventions, SEO constraints
- **Viral patterns** — Hook styles, content types, and audience insights for TikTok
- **Workflow optimizations** — Discovered improvements over time

### Skills

**`research-for-posts`** — The core research workflow:

| Phase | Description |
|-------|-------------|
| **Research** | Gather from 4 source types: official docs, repositories, community content, user materials |
| **Structure** | Organize into narrative: Hook → Context → Core Idea → Deep Dive → Practical Applications → Tradeoffs → Conclusion |
| **Output** | Generate the research folder with all artifacts |

**`ai-blog-publisher`** — Blog publishing workflow:

| Step | Description |
|------|-------------|
| **Categorize** | Assign one of 8 categories: qa, ai, frontend, backend, data, cloud, life-work-balance, softskills |
| **Tag** | Extract 2-5 Title Case topic tags |
| **Format** | Generate YAML frontmatter with SEO-optimized description (<160 chars) |
| **TOC** | Build table of contents with correct anchor IDs |
| **Sources** | Create companion file with all citations |

**`futbol-news-researcher`** — Football TikTok content workflow:

| Phase | Description |
|-------|-------------|
| **Research** | Gather news from 5 source categories: sports outlets, official sources, transfer/data, social media trends, community perspectives |
| **Structure** | Select 8-12 items balanced across focus areas (~60% evergreen, ~40% breaking), build TikTok packages using 5-part storytelling: Hook, Setup, Tension, Payoff, CTA |
| **Output** | Generate `futbol-news-{week}.md` with YAML frontmatter, full spoken-word scripts, pacing markers, and source URLs |

## Output Structure

Each research topic generates a folder:

```
research-{topic}/
├── README.md           # Overview of the topic
├── resources.md        # All research links organized by source
├── blog-series/        # Multi-part series
│   ├── post-01.md
│   ├── post-02.md
│   └── ...
└── assets/             # Supporting images and diagrams
```

## Existing Research

| Folder | Status |
|--------|--------|
| `research-context-engineering-complete/` | Complete — Context engineering fundamentals |
| `research-claude-code-basics/` | In progress |

## Usage

**Research a topic:**

```
Research [topic] and create a blog post
```

**Publish to AI Blog:**

```
Publish this article to the AI Blog
```

**Research football news for TikTok:**

```
Research this week's football news for TikTok
```

The agents execute the full workflow and produce structured output.

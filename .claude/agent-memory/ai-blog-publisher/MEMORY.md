# AI Blog Publisher Memory

## Skill Workflow
- ai-blog-publisher skill: Read article -> Categorize -> Tags -> Slug -> Frontmatter + TOC -> Sources file -> Verify
- Blog post goes to `src/content/ai-blog/<slug>.md`
- Sources companion goes to `src/content/ai-blog-sources/<slug>.md`
- Both files MUST share the same slug

## Category Enum (8 valid values)
- qa, ai, frontend, backend, data, cloud, life-work-balance, softskills

## Key Rules
- Tags: 2-5, Title Case, unique
- Description: under 160 chars for SEO
- Article body starts with h2 (no h1) --- title frontmatter is the h1
- TOC lists only h2 headings, not h3
- Anchor ID rules: lowercase, spaces to hyphens, `&` becomes `--`, colons removed
- heroImage: only `images.unsplash.com` domain, append `?w=750&h=422&fit=crop`
- Do NOT fabricate source URLs
- pubDate and accessDate use YYYY-MM-DD format

## Unsplash Image Search
- Use WebSearch: `site:unsplash.com {topic} photo`
- Extract `images.unsplash.com/photo-*` URL from results
- If no good match, omit heroImage and inform user

## Integration with blog-researcher
- Check for `resources.md` in the research folder for source URLs
- Research output lives in `./research-{topic}/`

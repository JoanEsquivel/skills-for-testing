# Blog Researcher Memory

## Skill Workflow
- research-for-posts skill: Phase 1 (Research) -> Phase 2 (Structure) -> Phase 3 (Output)
- Output goes to `./research-{topic}/` in the working directory
- Blog series is preferred when topic has 3+ distinct subtopics
- Storytelling framework: Hook > Context > Core Idea > Deep Dive > Practical Applications > Tradeoffs > Conclusion

## Research Patterns
- Run multiple WebSearch calls in parallel for different subtopics (4-5 per batch is optimal)
- Follow up with WebFetch on the most valuable URLs for detailed extraction (3-4 per batch)
- Some sites (e.g., thenewstack.io, getmaxim.ai, gartner.com, help.openai.com, platform.openai.com) return 403 on WebFetch; rely on search snippets instead
- developers.openai.com and cookbook.openai.com DO work for WebFetch; use those instead of platform.openai.com
- When one parallel WebFetch fails with 403, all sibling parallel calls get cancelled; separate 403-risk URLs into their own call
- WebFetch sometimes fails to extract article body (returns only HTML metadata); use WebSearch summaries as fallback
- When creating new files, use `touch` first then `Read` before `Write` -- the Write tool requires a prior read
- External linters/formatters may modify files between writes. Re-read before writing if a write fails with "modified since read"
- OpenReview papers can be fetched for abstracts/findings
- Anthropic's official docs and engineering blog are high-quality primary sources
- docs.anthropic.com now redirects (301) to platform.claude.com; always use platform.claude.com URLs directly
- Anthropic consolidated individual prompt engineering pages into a single "Prompting best practices" page; individual topic pages may 404
- Correct Anthropic doc URLs: multishot-prompting, use-xml-tags, system-prompts (not use-examples, use-xml, give-claude-a-role)
- cookbook.openai.com redirects (308) to developers.openai.com/cookbook; use the latter URL directly
- Files in blog-series/ may be pre-created by other processes; always check with ls and Read before Write
- When overwriting files from a previous research session, re-read each file before writing (linters/processes may have modified them)

## Writing Patterns
- Avoid emojis in all output files
- Use em dashes (---) not en dashes
- Include specific numbers and data points from research; readers value concrete metrics
- Always attribute research findings to their source
- The consolidated blog-post.md should be self-contained (readable without the series)
- Comparison tables work well for techniques with multiple dimensions (e.g., caching providers, optimization techniques)
- A tiered decision framework (no-infra / moderate / architectural) structures practical advice well
- resources.md benefits from a "Key Data Points Summary" table at the end for quick reference

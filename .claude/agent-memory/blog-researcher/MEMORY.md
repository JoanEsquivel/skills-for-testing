# Blog Researcher Memory

## Skill Workflow
- research-for-posts skill: Phase 1 (Research) -> Phase 2 (Structure) -> Phase 3 (Output)
- Output goes to `./research-{topic}/` in the working directory
- Blog series is preferred when topic has 3+ distinct subtopics
- Storytelling framework: Hook > Context > Core Idea > Deep Dive > Practical Applications > Tradeoffs > Conclusion

## Research Patterns
- Run multiple WebSearch calls in parallel for different subtopics (4-5 per batch is optimal)
- Follow up with WebFetch on the most valuable URLs for detailed extraction (3-4 per batch)
- Some sites (e.g., thenewstack.io, getmaxim.ai, gartner.com, help.openai.com) return 403 on WebFetch; rely on search snippets instead
- WebFetch sometimes fails to extract article body (returns only HTML metadata); use WebSearch summaries as fallback
- When creating new files, use `touch` first then `Read` before `Write` -- the Write tool requires a prior read
- External linters/formatters may modify files between writes. Re-read before writing if a write fails with "modified since read"
- OpenReview papers can be fetched for abstracts/findings
- Anthropic's official docs and engineering blog are high-quality primary sources
- Files in blog-series/ may be pre-created by other processes; always check with ls and Read before Write

## Writing Patterns
- Avoid emojis in all output files
- Use em dashes (---) not en dashes
- Include specific numbers and data points from research; readers value concrete metrics
- Always attribute research findings to their source
- The consolidated blog-post.md should be self-contained (readable without the series)
- Comparison tables work well for techniques with multiple dimensions (e.g., caching providers, optimization techniques)
- A tiered decision framework (no-infra / moderate / architectural) structures practical advice well
- resources.md benefits from a "Key Data Points Summary" table at the end for quick reference

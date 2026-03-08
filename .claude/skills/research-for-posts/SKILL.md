---
name: research-for-posts
description: Create blog posts or a blog post series from structured research. Use when the user asks to learn, understand, or explain any topic through written content.
---

# research-for-posts

Create comprehensive blog posts or blog post series from structured research.

## Workflow

### Phase 1: Research

Gather information from **four sources**. Research each source independently, then aggregate findings.

#### From Official Documentation / Primary Sources

- Official website or documentation URL
- Current version (if applicable)
- The motivation behind the topic or tool
- What problem it solves
- Key capabilities or ideas
- Typical use cases
- Important terminology used by the creators
- Official examples
- Recommended best practices
- Known limitations or caveats

#### From the Repository (if applicable)

- Repository URL and metadata (stars, license, last commit)
- Project purpose and summary
- Core system architecture or workflow
- README quick start section
- Examples folder contents (what each example demonstrates)
- Technologies used
- Project structure overview

#### From Community Content

- Top tutorials (title, author, URL, why it is valuable)
- Blog posts explaining the topic
- Video resources (title, channel, duration)
- Comparison articles (vs alternatives, key tradeoffs)
- Common mistakes or misunderstandings
- Community channels (Discord, Reddit, forums)
- Real-world use cases and testimonials

#### From User-Provided Material (PDF or Files)

If the user provides a PDF or document, extract:

- Main thesis or topic
- Key concepts or frameworks
- Important definitions
- Diagrams or models explained
- Supporting evidence
- Examples used by the author
- Important quotes
- Unique insights not present in other sources

---

### Phase 2: Structure

Organize the findings into a **clear narrative structure suitable for blog posts**.

The content must follow this storytelling flow:

1. **Hook**
   - Introduce a relatable problem, question, or surprising idea.
   - Capture the reader's attention.

2. **Context**
   - Explain why the topic matters.
   - Describe where it fits within its ecosystem or domain.

3. **Core Idea**
   - Present the main concept or thesis.
   - Explain the central idea in clear and simple terms.

4. **Deep Dive**
   - Break the topic into logical sections.
   - Explain key concepts, components, or workflows.
   - Use examples where possible.

5. **Practical Applications**
   - Show how the concept is used in practice.
   - Provide workflows, examples, or patterns.

6. **Tradeoffs and Limitations**
   - Explain drawbacks, constraints, or alternatives.
   - Mention common mistakes or misconceptions.

7. **Conclusion**
   - Summarize the key insights.
   - Reinforce why the topic matters.
   - Optionally suggest next steps or related topics.

---

### Phase 3: Output

Generate the blog content and create the research folder.

## Output Format

Create the folder in the current working directory (`./research-{topic}/`) containing:

```
research-{topic}/
├── README.md            # Overview of the topic and how to read the series
├── resources.md         # All research links organized by source
├── blog-post.md         # Final blog post or main article
├── blog-series/         # Optional: multiple posts if the topic requires a series
│   ├── post-01.md
│   ├── post-02.md
│   └── post-03.md
└── assets/              # Images, diagrams, references
    ├── diagrams/
    └── images/
```

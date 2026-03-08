# Context Engineering: Complete Research Resources

100+ sources organized by category. Gathered March 2026.

---

## Foundational References

### The Definitive Guide
- [Effective Context Engineering for AI Agents — Anthropic Engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) — The industry-defining reference (~500K views). Key quote: "Find the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome."

### Origin of the Term
- [Tobi Lutke on X (June 18, 2025)](https://x.com/tobi/status/1935533422589399127) — "I really like the term 'context engineering' over prompt engineering."
- [Andrej Karpathy on X (June 25, 2025)](https://x.com/karpathy/status/1937902205765607626) — "+1 for 'context engineering'... the delicate art and science of filling the context window with just the right information for the next step."
- [Simon Willison: Context Engineering (June 27, 2025)](https://simonwillison.net/2025/jun/27/context-engineering/) — Why "context engineering" will stick as a term.
- [The Decoder: Shopify CEO and Ex-OpenAI Researcher Agree](https://the-decoder.com/shopify-ceo-and-ex-openai-researcher-agree-that-context-engineering-beats-prompt-engineering/) — Coverage of Lutke and Karpathy alignment.

---

## Official Documentation

### Anthropic
- [Context Windows — Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/context-windows) — Context window behavior, extended thinking, 1M beta
- [Models Overview — Claude API Docs](https://platform.claude.com/docs/en/about-claude/models/overview) — Current model specs and pricing
- [Prompt Caching — Claude API Docs](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) — Up to 90% cost reduction, 85% latency reduction
- [Prompt Caching Announcement](https://www.anthropic.com/news/prompt-caching) — 100K-token book: 11.5s → 2.4s
- [Prompt Caching Cookbook](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/prompt_caching.ipynb) — Code examples
- [Tool Use with Claude](https://docs.anthropic.com/en/docs/build-with-claude/tool-use) — Tool definitions and token accounting
- [Building with Extended Thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking) — Thinking token billing and management
- [Adaptive Thinking](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking) — Dynamic thinking budget allocation

### OpenAI
- [Prompt Caching in the API](https://openai.com/index/api-prompt-caching/) — Automatic 50% discount
- [Prompt Caching — API Docs](https://developers.openai.com/api/docs/guides/prompt-caching/) — Technical guide, 1,024-token minimum
- [Prompt Caching 201](https://developers.openai.com/cookbook/examples/prompt_caching_201/) — Advanced patterns
- [Function Calling](https://platform.openai.com/docs/guides/function-calling) — Tool definitions count against context limits
- [Best Practices for Prompt Engineering](https://help.openai.com/en/articles/6654000-best-practices-for-prompt-engineering-with-the-openai-api) — Official guidance

### Google
- [Long Context — Gemini API](https://ai.google.dev/gemini-api/docs/long-context) — 1M+ token context documentation
- [Prompt Caching on Vertex AI](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/partner-models/claude/prompt-caching) — ~96% discount

---

## Academic Research

### Context Degradation
- [Lost in the Middle: How Language Models Use Long Contexts (arXiv)](https://arxiv.org/abs/2307.03172) — Liu et al.; 30%+ accuracy drop for middle-position information
- [Lost in the Middle (ACL Anthology)](https://aclanthology.org/2024.tacl-1.9/) — Published in Transactions of the ACL, 2024
- [Lost in the Middle (Stanford PDF)](https://cs.stanford.edu/~nfliu/papers/lost-in-the-middle.arxiv2023.pdf)
- [Context Rot — Chroma Research](https://research.trychroma.com/context-rot) — 18 models tested; degradation at every length increment
- [Context Rot GitHub](https://github.com/chroma-core/context-rot) — Replication toolkit

### Context Compression
- [DAST: Context-Aware Compression in LLMs (ACL 2025)](https://aclanthology.org/2025.findings-acl.1055.pdf) — Dynamic token allocation
- [Pretraining Context Compressor for LLMs (ACL 2025)](https://aclanthology.org/2025.acl-long.1394.pdf)
- [CCF: Context Compression Framework](https://arxiv.org/html/2509.09199v1) — Long-sequence compression

### KV Cache Optimization
- [Survey on LLM Acceleration via KV Cache Management](https://arxiv.org/html/2412.19442v3) — Five categories: selection, budget allocation, merging, quantization, low-rank
- [KV Cache Compression for Inference Efficiency: A Review](https://arxiv.org/html/2508.06297v1)
- [RocketKV: Two-Stage KV Cache Compression](https://arxiv.org/html/2502.14051v3) — Permanent eviction + dynamic selection
- [KVTC: Transform Coding for KV Caches](https://arxiv.org/abs/2511.01815) — Up to 20x compression
- [Entropy-Guided KV Caching](https://www.mdpi.com/2227-7390/13/15/2366)

### Agent Token Consumption
- [How Do Coding Agents Spend Your Money? — OpenReview](https://openreview.net/forum?id=1bUeVB3fov) — Input tokens dominate; up to 10x variance on identical tasks
- [Mem0: Scalable Long-Term Memory for AI Agents (arXiv)](https://arxiv.org/abs/2504.19413) — 91% lower p95 latency, 90%+ token savings
- [Agentic Memory: Unified Long-Term and Short-Term (arXiv)](https://arxiv.org/pdf/2601.01885)
- [Memory in the Age of AI Agents (arXiv)](https://arxiv.org/abs/2512.13564)
- [Stop Wasting Your Tokens (arXiv)](https://arxiv.org/html/2510.26585v1) — Token efficiency in multi-agent systems

### RAG vs. Long Context
- [Long Context vs. RAG: An Evaluation (arXiv)](https://arxiv.org/html/2501.01880v1) — No silver bullet; choice depends on task

---

## Engineering Blogs

### Context Management
- [JetBrains Research: Cutting Through the Noise (NeurIPS 2025)](https://blog.jetbrains.com/research/2025/12/efficient-context-management/) — Observation masking: 2.6% better solve rates at 52% lower cost
- [Redis: LLM Token Optimization 2026](https://redis.io/blog/llm-token-optimization-speed-up-apps/) — Semantic caching: 73% cost reduction
- [16x Engineer: LLM Context Management Guide](https://eval.16x.engineer/blog/llm-context-management-guide) — NoLiMa: 11/12 models below 50% at 32K tokens
- [Context Engineering for Agents — LangChain](https://blog.langchain.com/context-engineering-for-agents/)
- [The New Skill in AI — Philipp Schmid](https://www.philschmid.de/context-engineering) — Seven-component framework

### Agentic Context
- [The Context Window Problem — Factory.ai](https://factory.ai/news/context-window-problem) — Enterprise codebases span millions of tokens
- [Two Context Bloat Problems — Agenteer](https://agenteer.com/blog/the-two-context-bloat-problems-every-ai-agent-builder-must-understand/) — 55K tokens for 58 tools; accuracy: 49% → 74% with tool search
- [How Long Contexts Fail — Drew Breunig](https://www.dbreunig.com/2025/06/22/how-contexts-fail-and-how-to-fix-them.html) — Four failure modes + 39% drop from context clash
- [Claude Code Context Window Guide — Morph](https://www.morphllm.com/claude-code-context-window) — 30-40K tokens consumed before user input
- [AI Skeptic's Guide to Context Windows — Goose (Block)](https://block.github.io/goose/blog/2025/08/18/understanding-context-windows/) — 80% threshold auto-compaction
- [Mastering the Context Window — ttoss](https://ttoss.dev/blog/2025/12/06/mastering-the-context-window-in-agentic-development) — "Context is currency"

### RAG and Retrieval
- [RAG vs Large Context Window — Redis](https://redis.io/blog/rag-vs-large-context-window-ai-apps/) — RAG ~1s vs long-context 30-60s
- [Is RAG Obsolete? — Dataiku](https://www.dataiku.com/stories/blog/is-rag-obsolete) — No
- [RAG vs Long-Context LLMs — Meilisearch](https://www.meilisearch.com/blog/rag-vs-long-context-llms)

### Token Optimization
- [Token Optimization — IBM Developer](https://developer.ibm.com/articles/awb-token-optimization-backbone-of-effective-prompt-engineering/)
- [Optimize Token Efficiency — Portkey](https://portkey.ai/blog/optimize-token-efficiency-in-prompts/)
- [TOON and Rust — DEV Community](https://dev.to/copyleftdev/optimizing-llm-context-windows-reducing-token-usage-by-40-with-toon-and-rust-1j10) — 18-40% reduction

### Chunking
- [Chunking Strategies for RAG — Weaviate](https://weaviate.io/blog/chunking-strategies-for-rag)
- [Chunking Best Practices — Unstructured](https://unstructured.io/blog/chunking-for-rag-best-practices)
- [Breaking Up Is Hard to Do — Stack Overflow](https://stackoverflow.blog/2024/12/27/breaking-up-is-hard-to-do-chunking-in-rag-applications/)

### Memory Systems
- [3 Types of Long-Term Memory — MachineLearningMastery](https://machinelearningmastery.com/beyond-short-term-memory-the-3-types-of-long-term-memory-ai-agents-need/)
- [Memory for AI Agents — The New Stack](https://thenewstack.io/memory-for-ai-agents-a-new-paradigm-of-context-engineering/)
- [Memory in LlamaIndex](https://developers.llamaindex.ai/python/framework/module_guides/deploying/agents/memory/)
- [Context Management in LangChain — APXML](https://apxml.com/courses/langchain-production-llm/chapter-3-advanced-memory-management/context-window-management)

---

## Comparison: Context Engineering vs. Prompt Engineering

- [Elastic Search Labs](https://www.elastic.co/search-labs/blog/context-engineering-vs-prompt-engineering)
- [Glean](https://www.glean.com/perspectives/context-engineering-vs-prompt-engineering-key-differences-explained)
- [Abstracta](https://abstracta.us/blog/ai/context-engineering-vs-prompt-engineering/)
- [Neo4j](https://neo4j.com/blog/agentic-ai/context-engineering-vs-prompt-engineering/)
- [The New Stack](https://thenewstack.io/context-engineering-going-beyond-prompt-engineering-and-rag/)

---

## Case Studies

- [MarkTechPost: Real-World Applications](https://www.marktechpost.com/2025/08/12/case-studies-real-world-applications-of-context-engineering/) — Five Sigma (80% error reduction), Block/Square (MCP), Microsoft (26% productivity gain)
- [ResearchGate: Systematic Context Engineering](https://www.researchgate.net/publication/397959366) — 220K+ LoC by 2 developers in 15 weeks
- [Kubiya: Reliable AI Agents](https://www.kubiya.ai/blog/context-engineering-ai-agents)
- [Weaviate: LLM Memory and Retrieval](https://weaviate.io/blog/context-engineering)
- [First Round Review: Shopify's AI Adoption](https://www.firstround.com/ai/shopify)

---

## Community and Thought Leader Content

### Thought Leaders
- [Karpathy: Context at the Core of AI Coding — Pure AI](https://pureai.com/articles/2025/09/23/karpathy-puts-context-at-the-core-of-ai-coding.aspx)
- [Simon Willison: Agentic Engineering Patterns](https://simonw.substack.com/p/agentic-engineering-patterns)
- [Addy Osmani: Context Engineering](https://addyosmani.com/blog/context-engineering/)

### Community Discussions
- [HN: The New Skill in AI is Context Engineering](https://news.ycombinator.com/item?id=44427757) — Skepticism, effective limits (~10K), multi-agent recommendations
- [OpenAI Community: Beyond Context Engineering](https://community.openai.com/t/prompt-engineering-is-dead-and-context-engineering-is-already-obsolete-why-the-future-is-automated-workflow-architecture-with-llms/1314011)

### Subagent and Context Management
- [Context Management with Subagents — RichSnapp](https://www.richsnapp.com/article/2025/10-05-context-management-with-subagents-in-claude-code)
- [How Claude Code Got Better — HyperDev](https://hyperdev.matsuoka.com/p/how-claude-code-got-better-by-protecting)
- [4 Strategies to Stop AI Agent Degradation — Lorenz HW](https://lorenzhw.substack.com/p/4-strategies-to-stop-your-ai-agent)

### Misconceptions
- [Why 90% of Developers Misunderstand Context Windows — Medium](https://medium.com/@sohail_saifi/your-llm-prompt-engineering-is-wrong-why-90-of-developers-misunderstand-ai-context-windows-8af090c78083)
- [Lost in the Middle Explained — DEV Community](https://dev.to/razu381/lost-in-the-middle-why-bigger-context-windows-dont-always-improve-llm-performance-35j8)
- [5 Ways to Solve the Context Paradox — Data Science Dojo](https://datasciencedojo.com/blog/the-llm-context-window-paradox/)

---

## Guides and Frameworks

- [FlowHunt: Context Engineering Definitive 2025 Guide](https://www.flowhunt.io/blog/context-engineering/)
- [Prompting Guide: Context Engineering](https://www.promptingguide.ai/guides/context-engineering-guide)
- [CodeConductor: Complete Guide 2026](https://codeconductor.ai/blog/context-engineering)
- [Turing College: Guide 2025](https://www.turingcollege.com/blog/context-engineering-guide)
- [MCP Specification](https://modelcontextprotocol.io/specification/2025-11-25)
- [MCP GitHub](https://github.com/modelcontextprotocol)
- [IBM: What is MCP?](https://www.ibm.com/think/topics/model-context-protocol)
- [Meta Intelligence: Enterprise Context Engineering](https://www.meta-intelligence.tech/en/insight-context-engineering)
- [Google Developers: Multi-Agent Framework](https://developers.googleblog.com/architecting-efficient-context-aware-multi-agent-framework-for-production/)

---

## Monitoring and Observability

- [Datadog LLM Observability](https://www.datadoghq.com/product/llm-observability/)
- [Langfuse (Open Source)](https://langfuse.com/docs/observability/overview)
- [Traceloop](https://www.traceloop.com/blog/granular-llm-monitoring-for-tracking-token-usage-and-latency-per-user-and-feature)
- [Braintrust: Best LLM Monitoring Tools 2026](https://www.braintrust.dev/articles/best-llm-monitoring-tools-2026)
- [Solving Lost-in-the-Middle — Maxim](https://www.getmaxim.ai/articles/solving-the-lost-in-the-middle-problem-advanced-rag-techniques-for-long-context-llms/)
- [Context Window Strategies — Maxim](https://www.getmaxim.ai/articles/context-window-management-strategies-for-long-context-ai-agents-and-chatbots/)

---

## Educational Resources

### Courses
- [Pluralsight: Introduction to Context Engineering](https://www.pluralsight.com/courses/context-engineering-introduction)
- [Udemy: Mastering Context Design](https://www.udemy.com/course/mastering-context-design-for-intelligent-ai-agents/)
- [Towards AI Academy: LLM Dev](https://academy.towardsai.net/courses/beginner-to-advanced-llm-dev)
- [Codecademy: Context Engineering in AI](https://www.codecademy.com/article/context-engineering-in-ai)
- [Coursera: What Is Context Engineering?](https://www.coursera.org/articles/context-engineering)
- [DataCamp: Context Engineering Guide](https://www.datacamp.com/blog/context-engineering)
- [Class Central: 30+ Courses](https://www.classcentral.com/subject/context-engineering)
- [LinkedIn Learning: Context Engineering for Developers](https://www.linkedin.com/learning/context-engineering-for-developers/)
- [Context Engineer Hub](https://contextengineer.org/)

### Videos
- **Context Engineering Clearly Explained** — Tina Huang (YouTube)
- **Context Engineering for Engineers** — Y Combinator (YouTube, 11 min)
- **Advanced Context Engineering for Agents** — Y Combinator (YouTube)
- **Context Engineering Explained: 5 Practical Tips** — Shaw Talebi (YouTube)

### Open Source Repositories
- [Awesome Context Engineering (yzfly)](https://github.com/yzfly/awesome-context-engineering) — Curated resources, papers, tools
- [Awesome Context Engineering (Meirtz)](https://github.com/Meirtz/Awesome-Context-Engineering) — Hundreds of papers and frameworks
- [Context Engineering Handbook (davidkimai)](https://github.com/davidkimai/Context-Engineering) — First-principles handbook
- [Context-llemur (ctx)](https://github.com/jerpint/context-llemur) — Context management with git-tracked folders

---

## Industry Predictions

- [Gartner: Strategic Predictions 2026](https://www.gartner.com/en/articles/strategic-predictions-for-2026) — 1,445% surge in multi-agent AI inquiries
- [SiliconAngle: 2026 AI Predictions](https://siliconangle.com/2026/01/18/2026-data-predictions-scaling-ai-agents-via-contextual-intelligence/)
- [MIT Technology Review: From Vibe Coding to Context Engineering](https://www.technologyreview.com/2025/11/05/1127477/from-vibe-coding-to-context-engineering-2025-in-software-development/)
- [NxCode: The One-Person Unicorn](https://www.nxcode.io/resources/news/one-person-unicorn-context-engineering-solo-founder-guide-2026)
- [Redis: 2026 Predictions](https://redis.io/2026-predictions/)
- [Salesforce: Future of AI Agents 2026](https://www.salesforce.com/uk/news/stories/the-future-of-ai-agents-top-predictions-trends-to-watch-in-2026/)
- [Understanding AI: 17 Predictions for 2026](https://www.understandingai.org/p/17-predictions-for-ai-in-2026)

---

## Key Data Points Summary

| Metric | Value | Source |
|--------|-------|--------|
| Prompt caching cost reduction (Anthropic) | Up to 90% | Anthropic docs |
| Prompt caching latency reduction (Anthropic) | Up to 85% | Anthropic docs |
| Prompt caching discount (OpenAI) | 50% on cached tokens | OpenAI docs |
| Prompt caching discount (Google) | ~96% | Google docs |
| Lost-in-the-middle accuracy drop | 10-30%+ | Liu et al., 2024 |
| Effective context capacity vs advertised | 60-70% | Multiple sources |
| Claude Code usable context | ~57% of 200K | Morph analysis |
| Tool selection: all loaded vs search | 49% vs 74% | Agenteer |
| Context clash performance drop | 39% average | Microsoft/Salesforce |
| O3 sharded performance drop | 98.1 → 64.1 | Microsoft/Salesforce |
| Semantic caching cost reduction | Up to 73% | Redis |
| Output vs input token cost | 4-6x more expensive | Multiple providers |
| Compression via summarization + pruning | 50-80% token reduction | Multiple sources |
| Observation masking vs summarization | 2.6% better, 52% cheaper | JetBrains/NeurIPS 2025 |
| Models below 50% at 32K tokens | 11 of 12 tested | NoLiMa benchmark |
| Context rot onset | Well before advertised limit | Chroma Research |
| KVTC KV-cache compression | Up to 20x | KVTC paper |
| TOON format token reduction | 18-40% | DEV Community |
| Mem0 latency improvement | 91% lower p95 | Mem0 paper |
| Enterprise MCP tool bloat (worst case) | 134K tokens (67% of 200K) | Agenteer |
| Token price reduction 2025 → 2026 | ~80% | Multiple providers |

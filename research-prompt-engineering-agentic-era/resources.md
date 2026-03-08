# Research Sources and References

## Official Documentation

### Anthropic (Claude)

- [Prompting Best Practices for Claude 4.x](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-engineering/claude-prompting-best-practices) --- Comprehensive guide: XML tags, adaptive thinking, prefill deprecation, overtriggering in Claude 4.6, agentic systems, subagent orchestration
- [Effective Context Engineering for AI Agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) --- Defines context engineering; covers compaction, structured note-taking, sub-agent architectures, just-in-time retrieval
- [Adaptive Thinking](https://platform.claude.com/docs/en/build-with-claude/adaptive-thinking) --- Replaces budget_tokens with effort parameter (low/medium/high/max)
- [Extended Thinking](https://platform.claude.com/docs/en/build-with-claude/extended-thinking) --- Interleaved thinking for agentic workflows
- [Prompt Caching](https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching) --- Cache hits at 10% of base input price, 20-block lookback window
- [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) --- 5 workflow patterns: Prompt Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator-Optimizer
- [Prompt Injection Defenses](https://www.anthropic.com/research/prompt-injection-defenses) --- 1% attack success rate with RL-based training and content scanning
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices) --- Production agentic coding patterns

### OpenAI (GPT)

- [Prompt Engineering Guide](https://platform.openai.com/docs/guides/prompt-engineering) --- Six core strategies with tactics
- [Prompt Engineering (Developers)](https://developers.openai.com/api/docs/guides/prompt-engineering/) --- Message roles, instruction hierarchy, model selection
- [Reasoning Best Practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices/) --- o3/o4-mini: simple prompts, no CoT needed
- [Function Calling Guide](https://developers.openai.com/api/docs/guides/function-calling/) --- Tool definitions, strict mode, parallel calls
- [Structured Outputs Guide](https://platform.openai.com/docs/guides/structured-outputs) --- JSON schema enforcement, Pydantic/Zod
- [GPT-4.1 Prompting Guide](https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide/) --- Three critical agentic instructions, SWE-bench system prompt
- [GPT-5 Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide/) --- Eagerness control, Responses API, reasoning_effort parameter
- [GPT-5.1 Prompting Guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5-1_prompting_guide/) --- Solution persistence, apply_patch tool, none reasoning mode
- [GPT-5.2 Prompting Guide](https://cookbook.openai.com/examples/gpt-5/gpt-5-2_prompting_guide) --- Production agents, reliability patterns
- [o3/o4-mini Function Calling Guide](https://cookbook.openai.com/examples/o-series/o3o4-mini_prompting_guide) --- Reasoning model tool use
- [Building Agents Track](https://developers.openai.com/tracks/building-agents/) --- End-to-end agent construction

### Google (Gemini)

- [Gemini API Prompting Strategies](https://ai.google.dev/gemini-api/docs/prompting-strategies) --- Zero-shot/few-shot, prompt decomposition, Gemini 3 tactics
- [Gemini API System Instructions](https://ai.google.dev/gemini-api/docs/system-instructions) --- System instruction implementation

### Amazon Web Services

- [Prompt Engineering Concepts (Bedrock)](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-engineering-guidelines.html) --- Bedrock-specific guidelines, Claude formatting

---

## Academic Research

- [The Prompt Report (arXiv)](https://arxiv.org/abs/2406.06608) --- 80+ page survey of 1,500+ papers by 32 researchers from OpenAI, Google, Stanford. Role prompting was most frequently mentioned (105 mentions)
- [Structured Chain-of-Thought Prompting for Code Generation (TOSEM 2025)](https://ligechina.github.io/My%20Papers/2025%20-%20TOSEM%20-%20Structured%20Chain-of-Thought%20Prompting%20for%20Code%20Generation.pdf) --- SCoT outperforms standard CoT by up to 13.79% on HumanEval
- [ReAct: Synergizing Reasoning and Acting (Yao et al. 2022)](https://www.promptingguide.ai/techniques/react) --- Foundational Thought-Action-Observation loop

---

## Community Content and Expert Analysis

### Comprehensive Guides

- [The Ultimate Guide to Prompt Engineering in 2026 (Lakera)](https://www.lakera.ai/blog/prompt-engineering-guide) --- Output anchoring, prompt compression, adversarial defense
- [The 2026 Guide to Prompt Engineering (IBM)](https://www.ibm.com/think/prompt-engineering) --- Shift from prompt to orchestration engineering
- [Prompt Engineering Guide (promptingguide.ai)](https://www.promptingguide.ai/) --- Community-maintained reference with academic citations
- [10 Best Practices for Any Model (PromptHub)](https://www.prompthub.us/blog/10-best-practices-for-prompt-engineering-with-any-model) --- Universal practices

### Agentic AI

- [Prompt Engineering for AI Agents (PromptHub)](https://www.prompthub.us/blog/prompt-engineering-for-ai-agents) --- Agent-specific patterns, plan/act modes, Cline and Bolt.new analysis
- [11 Prompting Techniques for Better AI Agents (Augment Code)](https://www.augmentcode.com/blog/how-to-build-your-agent-11-prompting-techniques-for-better-ai-agents) --- Context-first, complete world picture, consistency, prompting plateaus
- [Agentic Prompt Engineering (Clarifai)](https://www.clarifai.com/blog/agentic-prompt-engineering) --- Advanced roles (tool_use, tool_result, planning), Google ADK
- [Agentic Design Patterns 2026 (SitePoint)](https://www.sitepoint.com/the-definitive-guide-to-agentic-design-patterns-in-2026/) --- 6 patterns: Reflection, Tool Use, Planning, Multi-Agent, Orchestrator-Worker, Evaluator-Optimizer
- [Anti-patterns in Agentic Engineering (Simon Willison)](https://simonwillison.net/guides/agentic-engineering-patterns/anti-patterns/) --- Unreviewed agent code, functional verification
- [Awesome AI System Prompts (GitHub)](https://github.com/dontriskit/awesome-ai-system-prompts) --- Curated system prompts from ChatGPT, Claude, Grok, v0, etc.

### Technique Analysis

- [AI Prompt Engineering in 2025: What Works (Schulhoff / Lenny's Newsletter)](https://www.lennysnewsletter.com/p/ai-prompt-engineering-in-2025-sander-schulhoff) --- Few-shot 0%->90%, role prompting ineffective, context underrated
- [Chain of Thought Prompting Overview (SuperAnnotate)](https://www.superannotate.com/blog/chain-of-thought-cot-prompting) --- CoT effectiveness with 100B+ models, cost tradeoffs
- [ReAct vs Plan-and-Execute Comparison (DEV Community)](https://dev.to/jamesli/react-vs-plan-and-execute-a-practical-comparison-of-llm-agent-patterns-4gh9) --- ReAct 85% accuracy vs Plan-and-Execute 92%
- [Comprehensive Guide to ReAct Prompting (Mercity)](https://www.mercity.ai/blog-post/react-prompting-and-react-based-agentic-systems/) --- Zero-shot vs few-shot ReAct, production considerations

### Security

- [OWASP LLM01:2025 Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) --- #1 risk in OWASP Top 10 for LLMs 2025
- [OWASP AI Agent Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html) --- Tool privilege management, multi-agent trust boundaries, monitoring
- [Hardening Atlas Against Prompt Injection (OpenAI)](https://openai.com/index/hardening-atlas-against-prompt-injection/) --- Automated adversarial testing

### Market Data

- [Prompt Engineering Statistics 2026 (SQ Magazine)](https://sqmagazine.co.uk/prompt-engineering-statistics/) --- Market: $0.85B (2024) to $1.52B (2026); +135.8% demand growth

---

## Key Data Points

| Finding | Value | Source |
|---------|-------|--------|
| Few-shot accuracy improvement (medical coding) | 0% to 90% | Schulhoff / Learn Prompting |
| Role prompting effect on correctness | Little to none | Schulhoff / Learn Prompting |
| Three agentic system prompt sentences (SWE-bench) | ~20% improvement | OpenAI GPT-4.1 Guide |
| Explicit planning instruction (SWE-bench) | +4% pass rate | OpenAI GPT-4.1 Guide |
| API-parsed vs manual tool schemas | +2% improvement | OpenAI GPT-4.1 Guide |
| Responses API reasoning persistence (Tau-Bench) | 73.9% to 78.2% | OpenAI GPT-5 Guide |
| Named apply_patch tool (GPT-5.1) | 35% fewer failures | OpenAI GPT-5.1 Guide |
| SCoT vs standard CoT (HumanEval) | +13.79% | TOSEM 2025 |
| CoT cost increase | 3-5x tokens | SuperAnnotate |
| Prompt compression without quality loss | 50-65% reduction | Lakera |
| Queries at end of long context | +30% quality | Anthropic docs |
| Structured PE frameworks productivity | +67% | ProfileTree |
| ReAct pattern accuracy | 85% | DEV Community |
| Plan-and-Execute accuracy | 92% | DEV Community |
| Cost reduction with Plan-and-Execute | Up to 90% | SitePoint |
| Claude Opus 4.5 prompt injection defense | 1% attack success | Anthropic |
| Organizations deploying multi-stage agents | 57% | Anthropic blog |
| Prompt engineering market (2026) | $1.52 billion | SQ Magazine |
| Prompt engineer demand growth (2025) | +135.8% | SQ Magazine |

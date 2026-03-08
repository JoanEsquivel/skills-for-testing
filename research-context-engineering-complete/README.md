# Context Engineering: The Complete Guide

## Overview

This is a comprehensive research package on **Context Engineering** — the emerging discipline of curating and managing the information that goes into an AI model's context window to maximize output quality while minimizing cost, latency, and degradation.

Context engineering has rapidly become one of the most important skills in AI development. Popularized by Tobi Lutke (Shopify CEO) and Andrej Karpathy in mid-2025, and codified by Anthropic's engineering team in late 2025, it represents the evolution from writing good prompts to architecting complete information systems around LLMs.

## How to Read This Series

### Blog Series (5 Parts — Recommended)

| Post | Title | What You'll Learn |
|------|-------|-------------------|
| [Post 1](blog-series/post-01-what-is-context-engineering.md) | **What Is Context Engineering?** | Origins, definitions, why it matters, how it differs from prompt engineering |
| [Post 2](blog-series/post-02-tokens-and-context-windows.md) | **Tokens and Context Windows Explained** | What tokens are, how tokenization works, context window sizes, pricing across providers |
| [Post 3](blog-series/post-03-where-do-tokens-go.md) | **Where Do All the Tokens Go?** | The 6 sources of token consumption, the 5 failure modes, why bigger windows don't solve the problem |
| [Post 4](blog-series/post-04-techniques-for-efficiency.md) | **Techniques for Efficient Context Usage** | Prompt caching, compression, RAG, chunking, pruning, KV-cache optimization, sub-agents |
| [Post 5](blog-series/post-05-practitioners-playbook.md) | **The Practitioner's Playbook** | Decision frameworks, monitoring, common mistakes, practical tips, and a quick-start checklist |

### Research Resources

- [resources.md](resources.md) — 100+ research links organized by category with URLs, key quotes, and data points

## Key Numbers Everyone Should Know

| Metric | Value | Source |
|--------|-------|--------|
| Prompt caching cost reduction (Anthropic) | Up to 90% | Anthropic docs |
| Prompt caching cost reduction (OpenAI) | 50% on cached tokens | OpenAI docs |
| Lost-in-the-middle accuracy drop | 10-30%+ | Liu et al., 2024 |
| Effective context capacity vs advertised | 60-70% | Multiple sources |
| Output vs input token cost multiplier | 4-6x | Multiple providers |
| Tool selection accuracy (all tools loaded vs search) | 49% vs 74% | Agenteer |
| Context clash performance drop | 39% average | Microsoft/Salesforce |
| Observation masking vs summarization | 2.6% better, 52% cheaper | JetBrains/NeurIPS 2025 |
| Semantic caching cost reduction | Up to 73% | Redis |
| Models below 50% at 32K tokens | 11 of 12 | NoLiMa benchmark |

## The One Sentence Summary

> "Find the smallest possible set of high-signal tokens that maximize the likelihood of some desired outcome." — Anthropic Engineering

## Research Methodology

Research gathered from 100+ sources across four categories:
1. **Official documentation** — Anthropic, OpenAI, Google DeepMind
2. **Academic research** — Stanford, NeurIPS, ACL, ICML, Chroma Research
3. **Engineering blogs** — Anthropic Engineering, JetBrains Research, Redis, LangChain
4. **Community and thought leaders** — Andrej Karpathy, Simon Willison, Tobi Lutke, Philipp Schmid

Research conducted March 2026.

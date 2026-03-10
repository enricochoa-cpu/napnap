# Agent Integration Reference

A practical guide to AI agent architectures: what they are, when each one makes sense, and cross-industry use cases.

---

## Table of Contents

1. [The Key Distinction: Workflow vs Agent](#1-the-key-distinction)
2. [Architecture Patterns](#2-architecture-patterns)
   - [A. Workflow / Pipeline (Deterministic)](#a-workflow--pipeline-deterministic)
   - [B. Tool-Augmented Agent (ReAct Loop)](#b-tool-augmented-agent-react-loop)
   - [C. RAG Agent (Knowledge-Grounded)](#c-rag-agent-knowledge-grounded)
   - [D. Agentic RAG (Autonomous Retrieval)](#d-agentic-rag-autonomous-retrieval)
   - [E. Reflection / Generator-Critic](#e-reflection--generator-critic)
   - [F. Multi-Agent Supervisor (Hierarchical)](#f-multi-agent-supervisor-hierarchical)
   - [G. Multi-Agent Swarm (Peer Network)](#g-multi-agent-swarm-peer-network)
   - [H. Event-Driven / Proactive Agent](#h-event-driven--proactive-agent)
   - [I. Human-in-the-Loop Agent](#i-human-in-the-loop-agent)
3. [Integration Layers](#3-integration-layers)
   - [MCP (Model Context Protocol)](#mcp-model-context-protocol)
   - [Client-Side vs Server-Side](#client-side-vs-server-side)
   - [Batch vs Real-Time](#batch-vs-real-time)
4. [Cross-Industry Use Cases](#4-cross-industry-use-cases)
5. [Cost Reference](#5-cost-reference)
6. [Framework Landscape (2026)](#6-framework-landscape-2026)
7. [Decision Framework](#7-decision-framework)
8. [Sources](#8-sources)

---

## 1. The Key Distinction

Before anything else, understand this axis:

| | Workflow | Agent |
|---|---------|-------|
| **Who controls flow?** | Developer (hardcoded paths) | LLM (dynamic decisions) |
| **Predictability** | High — every path is explicit | Low — emergent behaviour |
| **Cost** | Low — minimal LLM calls | Higher — iterative LLM calls |
| **Debugging** | Easy — trace the code | Hard — trace the reasoning |
| **When to use** | Steps are known in advance | Steps depend on observations |

**Rule of thumb**: Start with a workflow. Graduate to an agent only when the task genuinely requires dynamic decision-making. Most production "AI features" are workflows, not agents.

---

## 2. Architecture Patterns

### A. Workflow / Pipeline (Deterministic)

**What it is**: A developer-defined sequence of LLM calls and tool invocations. The control flow is hardcoded — the LLM generates content at each step but does not decide the next step.

```
User query → Classify intent (LLM) → Route to handler → Extract entities (LLM) → Call API → Format response (LLM)
```

**Pros**:
- Highly predictable and testable
- Lowest cost (1-5 LLM calls per request)
- Easy to add guardrails at each step
- Simplest to debug

**Cons**:
- Can only handle scenarios you anticipated and coded for
- Poor with novel or ambiguous requests
- Requires upfront engineering to map all paths
- Does not adapt at runtime

**Best for**: Structured tasks — form filling, document processing, content generation, onboarding flows. Any scenario where the steps are known in advance.

**The honest truth**: If your "agent" follows a predictable path every time, it's a workflow. That's fine. Workflows are cheaper, faster, and more reliable. Don't call it an agent if it doesn't need to be one.

---

### B. Tool-Augmented Agent (ReAct Loop)

**What it is**: A single LLM in an iterative **Thought → Action → Observation** loop. It reasons about what to do, calls a tool, observes the result, and repeats until it has an answer.

```
User: "What's the weather in Barcelona and should I bring an umbrella?"
  → Thought: I need the weather forecast for Barcelona
  → Action: call weather_api("Barcelona")
  → Observation: { temp: 18, rain_probability: 0.7 }
  → Thought: 70% rain chance — I should recommend an umbrella
  → Response: "18C with 70% chance of rain. Bring an umbrella."
```

**Pros**:
- Simplest true-agent architecture
- Reasoning traces are human-readable
- Reduces hallucination (grounded by tool results)
- Natively supported by all major LLM providers

**Cons**:
- Slow for multi-step tasks (serial loop)
- Cost scales with loop iterations (3-15 LLM calls per query)
- No built-in planning — decides one step at a time
- Context window fills up over many iterations

**Best for**: Customer support bots, developer tools, Q&A systems. The default starting point for any agent.

---

### C. RAG Agent (Knowledge-Grounded)

**What it is**: The LLM generates responses augmented by retrieved context from an external knowledge base (vector DB, search index, document store). Not truly an "agent" — more a generation pattern — but foundational.

```
User query → Embed query → Search vector store → Inject top-k results into prompt → LLM generates grounded response
```

**Pros**:
- Dramatically reduces hallucination for domain-specific knowledge
- Knowledge updated without retraining
- Low cost (one LLM call + vector search)
- Auditable — trace which sources informed each answer

**Cons**:
- Retrieval quality is the bottleneck
- Requires upfront investment in chunking + embedding pipeline
- Cannot reason across documents that weren't retrieved
- Query is formulated once, not iteratively refined

**Best for**: Knowledge bases, documentation search, customer support, legal Q&A. The most widely deployed "AI" pattern in SaaS products today.

---

### D. Agentic RAG (Autonomous Retrieval)

**What it is**: Extends basic RAG by embedding an autonomous agent into the retrieval pipeline. The agent decides *when and how* to retrieve, can reformulate queries, access multiple sources, and iteratively refine its search.

```
Complex query → Agent decomposes into sub-queries → Parallel retrieval across sources → Evaluate results → Reformulate if insufficient → Synthesise final answer
```

**Pros**:
- Handles complex, multi-part questions basic RAG cannot
- Can reason across multiple knowledge sources
- Self-correcting — adapts if initial retrieval fails

**Cons**:
- Significantly more complex to build
- Higher cost (3-10 LLM calls per query)
- Harder to debug (retrieval strategy is emergent)
- Higher latency (multiple retrieval rounds)

**Best for**: Enterprise knowledge management, research assistants, compliance analysis. When questions span multiple data sources.

---

### E. Reflection / Generator-Critic

**What it is**: One LLM generates output, another (or the same with a different prompt) critiques and refines it. Loop repeats until quality criteria are met.

```
Generator → Draft output
Critic → "The second paragraph contradicts the data. The tone is too clinical."
Generator → Revised output incorporating feedback
Critic → "Approved."
```

**Pros**:
- Significantly higher quality than single-pass generation
- Catches errors the generator would miss
- Flexible — works for code, writing, analysis

**Cons**:
- 2-6x more expensive (every iteration doubles LLM calls)
- Higher latency (sequential cycles)
- Diminishing returns after 2-3 iterations
- Same-model critic can develop "yes-man" bias

**Best for**: Code generation and review, content creation pipelines, report writing. High-value outputs that justify the extra cost.

---

### F. Multi-Agent Supervisor (Hierarchical)

**What it is**: A central "supervisor" agent receives requests, decomposes them into subtasks, delegates to specialised worker agents, and synthesises results.

```
User request → Supervisor (plans + delegates)
  → Worker A: Database specialist (queries data)
  → Worker B: Analysis specialist (interprets patterns)
  → Worker C: Writer specialist (generates narrative)
Supervisor ← Aggregates results → Final response
```

**Pros**:
- Clean separation of concerns
- Scalable — add workers without changing supervisor
- Can mix model tiers (cheap for routing, expensive for reasoning)

**Cons**:
- Coordination overhead (supervisor adds latency + cost)
- If supervisor misroutes, downstream agents waste work
- Complex to test end-to-end
- State management between agents is non-trivial

**Best for**: Enterprise workflows, customer service with specialised departments. When different tasks need genuinely different tools and expertise.

---

### G. Multi-Agent Swarm (Peer Network)

**What it is**: Multiple agents collaborate as equals without a central coordinator. Agents self-organise via shared message bus or peer-to-peer messaging.

**Pros**:
- No single point of failure
- Emergent problem-solving
- Naturally parallelisable

**Cons**:
- Hardest to debug and predict
- Risk of infinite loops
- Most expensive pattern
- Output quality is inconsistent

**Best for**: Research/exploration, red-teaming, creative brainstorming. Rare in production apps; mostly used in R&D.

---

### H. Event-Driven / Proactive Agent

**What it is**: Agents that respond to events (data changes, schedules, triggers) rather than waiting for user prompts. They act autonomously based on conditions.

```
Event: New sleep entry logged
  → Detection layer (algorithm): "Bedtime drifted +30min this week"
  → Reasoning layer (LLM): "Generate contextual insight in brand voice"
  → Action layer: Store insight card, optionally send notification
```

Four layers:
1. **Autonomy**: Scheduling, event triggers, cron jobs
2. **Reasoning**: LLM-powered decision logic
3. **Action**: Tool execution (APIs, notifications)
4. **Memory**: State and context across invocations

**Pros**:
- "Always-on" intelligence without user initiation
- Natural fit for monitoring and alerting
- Asynchronous and decoupled

**Cons**:
- Requires event infrastructure (queues, webhooks, schedulers)
- Risk of runaway costs if events trigger expensive loops
- Needs careful guardrails to avoid unwanted actions

**Best for**: Monitoring, alerting, automated reports, email triage. Any product where the agent should act without being asked.

**Important nuance**: As discussed earlier, the detection layer is often pure algorithm (no LLM needed). The LLM's value is in the *interpretation* layer — turning "bedtime_drift: +30min" into a contextual, personal message. If you have <20 patterns, hand-written templates work fine and cost $0.

---

### I. Human-in-the-Loop Agent

**What it is**: Any agent pattern above, but with designated approval checkpoints where critical actions pause for human review.

```
Agent plans action → Checkpoint: "I want to send this email. Approve?" → Human approves/rejects → Continue or abort
```

**Pros**:
- Essential for high-stakes domains
- Builds user trust incrementally
- Compliance-friendly

**Cons**:
- Adds latency (waiting for human)
- Too many checkpoints defeat the purpose of automation
- Humans become rubber-stampers over time

**Best for**: Finance, healthcare, content publishing. Most production agent deployments use this as a safety layer on top of another pattern.

---

## 3. Integration Layers

These cross-cut all patterns above — they're decisions about *how* you deploy, not *what* architecture you choose.

### MCP (Model Context Protocol)

An open standard (Anthropic, 2024; now adopted by OpenAI, Google, Microsoft) that provides a universal interface for connecting agents to tools.

```
Agent → MCP Client → MCP Server (GitHub) → GitHub API
                   → MCP Server (Database) → PostgreSQL
                   → MCP Server (Calendar) → Google Calendar
```

**What it solves**: Instead of building custom integrations for each tool, you build one MCP server per tool. Any MCP-compatible agent can use it.

**Think of it as**: USB for AI tools. Standardised plug-and-play.

**When to use**: Any product connecting an agent to 3+ external services. Future-proofs your tool layer.

---

### Client-Side vs Server-Side

| | Server-Side | Client-Side | Hybrid/Edge |
|---|-----------|------------|-------------|
| **Where** | Your servers / cloud | User's device | Edge + cloud fallback |
| **Latency** | Higher (network) | Lower (local) | Medium |
| **Privacy** | Data leaves device | Data stays local | Sensitive local, complex cloud |
| **Cost** | Server infrastructure | None (user's hardware) | Split |
| **Capability** | Full (any model) | Limited (on-device models) | Mixed |
| **Updates** | Easy (deploy server) | Hard (app update) | Medium |

**For most SaaS products**: Server-side via Edge Functions or serverless is the pragmatic choice.

---

### Batch vs Real-Time

| | Real-Time | Batch | Hybrid |
|---|----------|-------|--------|
| **Latency** | Sub-second to seconds | Minutes to hours | Depends on task |
| **Use case** | Chat, search, interactive | Reports, analysis, enrichment | Both |
| **Cost** | Higher per query | 50-80% cheaper per unit | Optimised |
| **UX** | Streaming responses | Background processing | Best of both |

**Cost insight**: Anthropic's Batch API gives 50% discount. Combined with prompt caching (90% savings on cached reads), you can achieve ~95% cost reduction for batch workloads.

---

## 4. Cross-Industry Use Cases

For each architecture pattern, here's how it applies across different industries. This shows the same pattern solving fundamentally different problems.

### A. Workflow / Pipeline

| Industry | Use Case | How It Works |
|----------|----------|-------------|
| **Baby Sleep Tracker** | Sleep report generation | Collect sleep data → Compute stats → LLM formats narrative → Cache result |
| **Food Delivery** | Order confirmation + ETA | Parse order → Calculate route (API) → LLM generates personalised ETA message |
| **TravelTech** | Booking confirmation email | Extract itinerary → Check weather API → LLM writes contextual packing tips |
| **FinTech** | Monthly spend summary | Categorise transactions (LLM) → Aggregate by category → LLM writes narrative |
| **EdTech** | Assignment grading pipeline | Parse submission → Check rubric → LLM scores + writes feedback |
| **HealthTech** | Symptom triage | Collect symptoms (form) → Risk score (algorithm) → LLM writes safe guidance |

### B. Tool-Augmented Agent (ReAct)

| Industry | Use Case | How It Works |
|----------|----------|-------------|
| **Baby Sleep Tracker** | "Why is my baby waking at 3AM?" chat | Agent queries sleep DB → Checks age-based patterns → Searches knowledge base → Generates personalised answer |
| **Food Delivery** | "Where's my order?" support agent | Agent checks order status API → Tracks driver location → Queries refund policy → Responds with resolution |
| **TravelTech** | "Find me a flight under $500 to warm beaches" | Agent searches flights API → Checks weather APIs for destinations → Compares options → Recommends best match |
| **FinTech** | "Why did my credit score drop?" | Agent pulls credit report API → Checks recent transactions → Identifies factors → Explains in plain language |
| **EdTech** | "Help me understand photosynthesis" tutor | Agent assesses student level → Retrieves lesson content → Adapts explanation → Generates practice questions |
| **E-Commerce** | "Find a gift for my mum who likes gardening" | Agent searches product catalogue → Filters by category/budget → Checks reviews → Curates gift list |

### C. RAG (Knowledge-Grounded)

| Industry | Use Case | How It Works |
|----------|----------|-------------|
| **Baby Sleep Tracker** | Sleep science FAQ with cited sources | Embed sleep research → Retrieve relevant chunks for parent's question → Generate sourced answer |
| **Food Delivery** | Restaurant menu Q&A (allergens, ingredients) | Embed all menu data → "Does the pad thai have peanuts?" → Retrieve + answer with source |
| **TravelTech** | Destination guide from travel blogs | Embed curated travel content → "What to do in Lisbon for 3 days?" → Grounded itinerary |
| **FinTech** | Regulation compliance Q&A | Embed financial regulations → "Can I deduct home office expenses?" → Cited answer |
| **Legal** | Contract clause search | Embed contract library → "Find non-compete clauses across all vendor contracts" → Retrieved results |
| **HR** | Employee handbook Q&A | Embed company policies → "What's the parental leave policy?" → Accurate, sourced answer |

### D. Agentic RAG (Autonomous Retrieval)

| Industry | Use Case | How It Works |
|----------|----------|-------------|
| **Baby Sleep Tracker** | Complex sleep analysis across multiple data sources | Agent queries sleep DB + growth logs + age milestones → Cross-references patterns → Comprehensive assessment |
| **TravelTech** | Multi-source trip planning | Agent searches flights + hotels + activities + visa requirements + weather → Iteratively refines → Complete plan |
| **FinTech** | Investment research assistant | Agent pulls market data + earnings reports + analyst notes + news → Synthesises multi-source analysis |
| **Legal** | Due diligence research | Agent searches contracts + court filings + public records + news → Iterative refinement → Risk report |
| **Healthcare** | Medical literature review | Agent searches PubMed + clinical trials + drug databases → Cross-references → Evidence summary |

### E. Reflection / Generator-Critic

| Industry | Use Case | How It Works |
|----------|----------|-------------|
| **Baby Sleep Tracker** | Sleep report quality assurance | Generator writes weekly summary → Critic checks medical accuracy + tone (non-judgmental) → Refined report |
| **Food Delivery** | Menu description writing | Generator writes dish descriptions → Critic checks accuracy vs ingredients + appetising tone → Final copy |
| **Marketing** | Ad copy generation | Generator creates variants → Critic evaluates against brand guidelines + A/B test data → Refined ads |
| **FinTech** | Financial advice review | Generator drafts advice → Critic checks regulatory compliance + suitability → Approved output |
| **EdTech** | Exam question generation | Generator creates questions → Critic checks difficulty level + curriculum alignment → Validated questions |

### F. Multi-Agent Supervisor

| Industry | Use Case | How It Works |
|----------|----------|-------------|
| **Baby Sleep Tracker** | Full daily briefing | Supervisor delegates: Sleep Analyst (patterns) + Schedule Planner (predictions) + Wellness Coach (parent tips) → Unified morning card |
| **Food Delivery** | Order orchestration | Supervisor delegates: Menu Agent (availability) + Pricing Agent (surge/promos) + Logistics Agent (routing) → Optimised order |
| **TravelTech** | End-to-end trip booking | Supervisor delegates: Flight Agent + Hotel Agent + Activity Agent + Budget Agent → Coordinated itinerary |
| **FinTech** | Portfolio rebalancing | Supervisor delegates: Market Analyst + Risk Assessor + Tax Optimiser + Execution Agent → Rebalanced portfolio |
| **Customer Service** | Complex complaint resolution | Supervisor delegates: Order Lookup Agent + Policy Agent + Compensation Agent + Communication Agent → Resolution |

### G. Event-Driven / Proactive

| Industry | Use Case | How It Works |
|----------|----------|-------------|
| **Baby Sleep Tracker** | Pattern drift alerts | Event: sleep entry logged → Algorithm detects bedtime drift → LLM generates contextual insight → Push notification |
| **Food Delivery** | Reorder suggestions | Event: 7 days since last order of "usual" → Detect habit pattern → LLM personalises message → Notification |
| **TravelTech** | Price drop alerts | Event: flight price changes → Compare to user's saved search → LLM generates urgency-appropriate message |
| **FinTech** | Unusual spending alerts | Event: transaction logged → Anomaly detection (algorithm) → LLM contextualises ("You spent 3x your usual on dining") |
| **E-Commerce** | Back-in-stock notifications | Event: inventory updated → Match to user wishlists → LLM personalises with alternatives if low stock |
| **HealthTech** | Medication reminder + check-in | Event: scheduled time → Check adherence history → LLM adapts tone (encouraging vs concerned) |

### H. Human-in-the-Loop

| Industry | Use Case | How It Works |
|----------|----------|-------------|
| **Baby Sleep Tracker** | Sleep schedule adjustment confirmation | Agent proposes schedule change → Parent reviews and approves → Schedule updated |
| **FinTech** | Trade execution approval | Agent identifies rebalancing opportunity → Shows proposed trades → User approves → Executed |
| **Healthcare** | Treatment recommendation review | Agent suggests care plan → Doctor reviews → Approved with modifications → Applied |
| **Legal** | Contract clause modification | Agent drafts amendment → Lawyer reviews → Approved → Sent to counterparty |
| **HR** | Candidate screening | Agent ranks applicants → Recruiter reviews shortlist → Approved → Interviews scheduled |

---

## 5. Cost Reference

Based on 2026 pricing (Claude Haiku 4.5 as baseline):

| Pattern | LLM Calls/Query | Est. Cost/Query | Monthly (1K queries/day) |
|---------|-----------------|-----------------|--------------------------|
| Workflow/Pipeline | 1-5 | $0.01-$0.05 | $300-$1,500 |
| Basic RAG | 1-2 | $0.01-$0.10 | $300-$3,000 |
| ReAct (Tool-Use) | 3-15 | $0.01-$0.50 | $300-$15,000 |
| Agentic RAG | 3-10 | $0.05-$1.00 | $1,500-$30,000 |
| Reflection/Critic | 2-6 | $0.05-$0.50 | $1,500-$15,000 |
| Multi-Agent Supervisor | 5-20+ | $0.10-$5.00 | $3,000-$150,000 |
| Event-Driven | Varies | Per-event | $10-$10,000+ |
| Multi-Agent Swarm | 10-50+ | $0.50-$10.00+ | $15,000-$300,000 |

### Key Cost-Saving Strategies

1. **Model routing**: Cheap model (Haiku) for classification/routing, expensive model (Sonnet) only for complex reasoning
2. **Prompt caching**: Cached reads cost 10% of standard input — cache system prompts and common context
3. **Batch API**: 50% discount for non-real-time workloads
4. **Stacked discounts**: Batch + caching = ~95% cost reduction vs baseline
5. **Loop limits**: Hard cap iterations at 10-15 to prevent runaway costs
6. **Per-user budgets**: Cap LLM spend per user with anomaly alerts

### The $0 Path

For products with tight budgets:
- **Detection/scoring**: Pure algorithm (no LLM) — $0
- **Interpretation/messaging**: LLM via Batch API + prompt caching — ~$0.001/call
- **Reports (weekly)**: Batch generation cached in DB — ~$0.01/user/month
- **Chat (rate-limited)**: 5-10 messages/day free tier — ~$0.05/user/month

---

## 6. Framework Landscape (2026)

| Framework | Best For | Control Level | Learning Curve | Production Ready |
|-----------|----------|--------------|----------------|-----------------|
| **Claude Agent SDK** | Full-stack agents (code, files, tools) | High | Medium | High |
| **LangGraph** | Complex stateful workflows | Very High | High | Very High |
| **CrewAI** | Multi-agent team prototyping | Medium | Low | Medium |
| **OpenAI Agents SDK** | Function calling + Codex ecosystem | High | Medium | High |
| **Google ADK** | Gemini ecosystem integration | High | Medium | High |
| **AutoGen** | Conversational multi-agent (research) | Medium | Medium | Medium-High |

### Claude Agent SDK Highlights
- Same infrastructure powering Claude Code
- Python and TypeScript SDKs
- Built-in tools (file read, command exec, code edit)
- Native MCP integration for external tools
- Custom tools defined as in-process MCP servers (no subprocess overhead)
- Extended thinking built in

### MCP Ecosystem
- Hundreds of pre-built servers (GitHub, Slack, databases, APIs)
- Adopted by OpenAI, Google, Microsoft, Anthropic
- Transport: local stdio (desktop) or remote HTTP with streaming (cloud)
- The "USB for AI tools" — write once, connect anywhere

---

## 7. Decision Framework

### When choosing a pattern:

```
Is the task predictable (known steps)?
  YES → Workflow/Pipeline (Pattern A)
  NO  → Does it need external knowledge?
          YES → Is one source enough?
                  YES → Basic RAG (Pattern C)
                  NO  → Agentic RAG (Pattern D)
          NO  → Does it need tools/APIs?
                  YES → ReAct Agent (Pattern B)
                  NO  → Is output quality critical?
                          YES → Reflection (Pattern E)
                          NO  → Simple LLM call (no agent needed)

Additional layers:
  Multiple specialised tasks? → Add Supervisor (Pattern F)
  Needs to act without user prompt? → Add Event-Driven (Pattern H)
  High-stakes actions? → Add Human-in-the-Loop (Pattern I)
  Multiple external tools? → Use MCP integration layer
```

### Golden Rules

1. **Start with the simplest pattern that works.** You can always add complexity later; you can rarely remove it.
2. **Algorithm first, LLM second.** If a rule or formula can solve it, don't waste tokens. The LLM's job is interpretation and language, not computation.
3. **Batch over real-time when possible.** 50-95% cost savings. Most "insights" don't need to be generated in real-time.
4. **Cache aggressively.** System prompts, common contexts, generated reports — cache everything that doesn't change per-request.
5. **Set hard limits.** Loop caps, token budgets, per-user spending limits. Unoptimised agents can cost $10-$100+ per session.
6. **Human-in-the-loop for high stakes.** Until you trust the agent's judgement, require approval for irreversible actions.

---

## 8. Sources

- [Anthropic — Building Effective Agents](https://www.anthropic.com/research/building-effective-agents)
- [Anthropic — Building Agents with the Claude Agent SDK](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Claude Agent SDK Overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- [Claude Prompt Caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching)
- [Claude API Pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Microsoft Azure — AI Agent Design Patterns](https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns)
- [Google Cloud — Choose a Design Pattern for Agentic AI](https://docs.cloud.google.com/architecture/choose-design-pattern-agentic-ai-system)
- [Google — Multi-Agent Design Patterns](https://www.infoq.com/news/2026/01/multi-agent-design-patterns/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [IBM — What is a ReAct Agent?](https://www.ibm.com/think/topics/react-agent)
- [Databricks — Multi-Agent Supervisor Architecture](https://www.databricks.com/blog/multi-agent-supervisor-architecture-orchestrating-enterprise-ai-scale)
- [StackAI — 2026 Guide to Agentic Workflow Architectures](https://www.stackai.com/blog/the-2026-guide-to-agentic-workflow-architectures)
- [Confluent — Event-Driven Multi-Agent Systems](https://www.confluent.io/blog/event-driven-multi-agent-systems/)
- [InfoWorld — FinOps for Agents](https://www.infoworld.com/article/4138748/finops-for-agents-loop-limits-tool-call-caps-and-the-new-unit-economics-of-agentic-saas.html)
- [LangChain — Reflection Agents](https://blog.langchain.com/reflection-agents/)
- [Arxiv — Agentic RAG Survey](https://arxiv.org/abs/2501.09136)

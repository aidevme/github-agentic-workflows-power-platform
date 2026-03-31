# Cost Optimization - Token Usage Strategies

## Overview

Running AI agents in GitHub Agentic Workflows incurs costs based on token usage. This guide provides strategies to minimize costs while maintaining effectiveness, covering model selection, prompt optimization, caching, and architectural patterns.

## Table of Contents

- [Understanding Costs](#understanding-costs)
- [Cost Models](#cost-models)
- [Optimization Strategies](#optimization-strategies)
- [Model Selection](#model-selection)
- [Prompt Engineering](#prompt-engineering)
- [Caching Strategies](#caching-strategies)
- [Workflow Architecture](#workflow-architecture)
- [Monitoring & Analytics](#monitoring--analytics)
- [Power Platform Specific Tips](#power-platform-specific-tips)
- [Cost Calculators](#cost-calculators)

## Understanding Costs

### Token Pricing (as of 2026)

| Model | Input ($/1M tokens) | Output ($/1M tokens) | Context Window |
|-------|---------------------|----------------------|----------------|
| GPT-3.5-turbo | $0.50 | $1.50 | 16K |
| GPT-4-turbo | $10.00 | $30.00 | 128K |
| GPT-4 | $30.00 | $60.00 | 8K |
| Claude 3 Haiku | $0.25 | $1.25 | 200K |
| Claude 3 Sonnet | $3.00 | $15.00 | 200K |
| Claude 3 Opus | $15.00 | $75.00 | 200K |
| Claude Sonnet 3.5 | $3.00 | $15.00 | 200K |

### Token Consumption

**Example workflow costs**:
- Simple issue triage: 1,000-3,000 tokens (~$0.003-0.09)
- Code review: 5,000-20,000 tokens (~$0.015-0.60)
- Documentation generation: 10,000-30,000 tokens (~$0.03-0.90)
- Complex multi-agent: 50,000+ tokens (~$0.15-1.50+)

### Monthly Cost Projections

| Activity Level | Workflows/Month | Est. Cost (GPT-3.5) | Est. Cost (GPT-4) |
|---------------|-----------------|---------------------|-------------------|
| Low (10 PRs) | 10-30 | $1-3 | $10-30 |
| Medium (50 PRs) | 50-150 | $5-15 | $50-150 |
| High (200 PRs) | 200-600 | $20-60 | $200-600 |
| Enterprise (1000+ PRs) | 1000+ | $100-300 | $1000-3000 |

## Cost Models

### Pay-As-You-Go

**Pricing**: Per-token billing

**Best for**:
- Variable workloads
- Testing/experimentation
- Low-volume projects

**Cost control**:
```yaml
tools:
  max-tokens-per-request: 4000
  max-total-tokens-per-month: 1000000
  alert-threshold: 80%
```

### Reserved Capacity

**Pricing**: Fixed monthly fee + reduced per-token cost

**Best for**:
- Predictable workloads
- High-volume production use
- Enterprise deployments

**Typical savings**: 20-40% vs pay-as-you-go

## Optimization Strategies

### Strategy 1: Tiered Model Selection

Use cheaper models first, escalate only when needed.

```markdown
---
name: Tiered Analysis
---

# Stage 1: Quick Triage (Cheap Model)
{{#agent id="triage" engine="gpt-3.5-turbo"}}
Is this PR complex? (yes/no)
{{/agent}}

# Stage 2: Deep Analysis (Only if Needed)
{{#if triage.output == "yes"}}
{{#agent id="detailed" engine="claude-sonnet-3.5"}}
Comprehensive code review...
{{/agent}}
{{/if}}
```

**Savings**: 60-80% for simple cases

### Strategy 2: Context Pruning

Only include relevant context, not entire files.

```markdown
# ❌ Expensive: Include entire file (10,000 tokens)
{{#agent}}
Full file content: {{file.content}}
{{/agent}}

# ✅ Cheap: Include only changes (500 tokens)
{{#agent}}
Changed lines: {{file.diff}}
{{/agent}}
```

**Savings**: 90%+ token reduction

### Strategy 3: Caching

Reuse results for unchanged inputs.

```yaml
tools:
  cache:
    enabled: true
    strategy: semantic  # Cache by semantic similarity
    ttl: 7d
```

```markdown
{{#agent id="analyzer" cache-key="file-{{file.sha}}"}}
Analyze this file...
{{/agent}}
```

**Savings**: 100% on cache hits

### Strategy 4: Batching

Process multiple items in one request.

```markdown
# ❌ Expensive: One request per file (5 files = 5 requests)
{{#each files}}
{{#agent}}Analyze {{this}}{{/agent}}
{{/each}}

# ✅ Cheap: Batch all files (1 request)
{{#agent}}
Analyze these files:
{{#each files}}
- {{this.name}}: {{this.diff}}
{{/each}}
{{/agent}}
```

**Savings**: 70-80% (reduced overhead)

### Strategy 5: Conditional Execution

Skip analysis when not needed.

```markdown
{{#if pull_request.changed_files_count < 5}}
  {{#agent engine="gpt-3.5-turbo"}}Quick review{{/agent}}
{{else if pull_request.changed_files_count < 20}}
  {{#agent engine="claude-sonnet-3.5"}}Standard review{{/agent}}
{{else}}
  {{#agent engine="gpt-4-turbo"}}Comprehensive review{{/agent}}
{{/if}}
```

**Savings**: Variable, based on workload distribution

## Model Selection

### Decision Matrix

| Use Case | Recommended Model | Reason |
|----------|------------------|--------|
| Simple classification | GPT-3.5-turbo | Fast & cheap |
| Code review | Claude Sonnet 3.5 | Good balance |
| Complex refactoring | GPT-4-turbo | Best quality |
| Documentation | Claude Haiku | Large context, cheap |
| Security analysis | GPT-4-turbo | Highest accuracy |
| Quick triage | GPT-3.5-turbo | Speed matters |

### Multi-Model Strategy

```yaml
---
name: Optimized Workflow
agents:
  - id: classifier
    engine: gpt-3.5-turbo        # $0.002 per run
    
  - id: analyzer
    engine: claude-sonnet-3.5    # $0.05 per run (only if needed)
    condition: classifier.output.complexity > "low"
    
  - id: expert
    engine: gpt-4-turbo          # $0.30 per run (only for critical)
    condition: classifier.output.complexity == "critical"
---
```

**Average cost per run**: ~$0.015 (vs $0.30 if always using GPT-4)

## Prompt Engineering

### Technique 1: Be Concise

```markdown
# ❌ Verbose prompt (500 tokens)
Hello! Please analyze this code carefully. I need you to look at each line
and understand what it does. Then, think about potential issues...
[continues for many paragraphs]

# ✅ Concise prompt (50 tokens)
Analyze this code for:
1. Security issues
2. Performance problems
3. Best practice violations
```

**Savings**: 90% token reduction

### Technique 2: Use Templates

```markdown
# ✅ Reusable template
{{#define review-template}}
File: {{file}}
Changes: {{diff}}
Check: security, performance, style
Format: - [issue] at line [N]
{{/define}}

{{#agent}}
{{> review-template file="app.js" diff="..."}}
{{/agent}}
```

**Savings**: 50-70% by avoiding repetition

### Technique 3: Structured Output

```markdown
# ✅ Force concise output
{{#agent}}
Output ONLY JSON (no explanation):
```json
{
  "severity": "high|medium|low",
  "issues": ["issue1", "issue2"]
}
```
{{/agent}}
```

**Savings**: 80-90% output token reduction

### Technique 4: Stop Sequences

```markdown
{{#agent}}
Answer in one sentence, then stop.
Stop at: [END]
{{/agent}}
```

### Technique 5: Few-Shot Examples

```markdown
# ❌ Expensive: Detailed instructions (1000 tokens)
[Long explanation of what you want]

# ✅ Cheap: One example (200 tokens)
Example:
Input: "Fix login bug"
Output: {"type": "bugfix", "area": "auth"}

Now classify: "{{issue.title}}"
```

**Savings**: 80% token reduction

## Caching Strategies

### File-Level Caching

```markdown
{{#agent cache-key="analysis-{{file.sha}}"}}
Analyze {{file.name}}
{{/agent}}
```

Cache hit rate: ~60% (unchanged files)

### Semantic Caching

```markdown
{{#agent cache-strategy="semantic" cache-threshold="0.9"}}
Review this PR
{{/agent}}
```

Cache hit on similar (not identical) requests.

### Time-Based Invalidation

```yaml
tools:
  cache:
    default-ttl: 604800  # 7 days
    strategies:
      - pattern: "issue-triage-*"
        ttl: 3600  # 1 hour (dynamic data)
      - pattern: "code-analysis-*"
        ttl: 2592000  # 30 days (stable code)
```

### Conditional Caching

```markdown
{{#if file.changed_recently}}
  {{#agent cache="false"}}Fresh analysis{{/agent}}
{{else}}
  {{#agent cache="true"}}Cached analysis{{/agent}}
{{/if}}
```

## Workflow Architecture

### Pattern 1: Early Exit

```markdown
# Check if analysis is needed FIRST (cheap)
{{#agent engine="gpt-3.5-turbo"}}
Is this PR a documentation-only change? (yes/no)
{{/agent}}

{{#if not documentation_only}}
  # Only run expensive analysis if needed
  {{#agent engine="gpt-4-turbo"}}
  Comprehensive review...
  {{/agent}}
{{/if}}
```

**Savings**: 100% on documentation changes

### Pattern 2: Progressive Enhancement

```markdown
# Always run: Basic check (cheap)
{{#agent engine="gpt-3.5-turbo"}}
Basic code style check
{{/agent}}

# Conditional: Security scan (moderate)
{{#if touches_security_code}}
{{#agent engine="claude-sonnet-3.5"}}
Security analysis
{{/agent}}
{{/if}}

# Rare: Expert review (expensive)
{{#if high_risk and large_change}}
{{#agent engine="gpt-4-turbo"}}
Expert architectural review
{{/agent}}
{{/if}}
```

### Pattern 3: Parallel with Timeouts

```markdown
{{#agent id="quick" engine="gpt-3.5-turbo" timeout="30s"}}
Quick analysis
{{/agent}}

{{#agent id="deep" engine="gpt-4-turbo" timeout="2m" parallel="true"}}
Deep analysis
{{/agent}}

# Use whichever finishes first
{{#if quick.completed}}
  Use {{quick.output}}
{{else}}
  Wait for {{deep.output}}
{{/if}}
```

### Pattern 4: Aggregation

```markdown
# Multiple cheap agents instead of one expensive
{{#agent id="security" engine="gpt-3.5-turbo"}}Security check{{/agent}}
{{#agent id="quality" engine="gpt-3.5-turbo"}}Quality check{{/agent}}
{{#agent id="performance" engine="gpt-3.5-turbo"}}Perf check{{/agent}}

# Simple aggregation (no expensive model needed)
Combined report:
- Security: {{security.output}}
- Quality: {{quality.output}}
- Performance: {{performance.output}}
```

**Cost**: 3 × GPT-3.5 = $0.006 vs 1 × GPT-4 = $0.30

## Monitoring & Analytics

### Track Token Usage

```yaml
tools:
  analytics:
    enabled: true
    track:
      - token-usage
      - cost
      - cache-hit-rate
      - model-distribution
    report-frequency: weekly
```

### Cost Alerts

```yaml
tools:
  alerts:
    - type: cost-threshold
      threshold: 100.00  # $100/month
      action: notify-team
      
    - type: cost-anomaly
      baseline: 7d-average
      tolerance: 200%  # Alert if 2x normal
      action: pause-workflows
```

### Usage Dashboard

```markdown
# Weekly Report Template
## Cost Summary
- Total: ${{total_cost}}
- By model:
  - GPT-3.5: ${{gpt35_cost}} ({{gpt35_percent}}%)
  - GPT-4: ${{gpt4_cost}} ({{gpt4_percent}}%)
  - Claude: ${{claude_cost}} ({{claude_percent}}%)

## Optimization Opportunities
- Cache hit rate: {{cache_hit_rate}}%
- Avg tokens per run: {{avg_tokens}}
- Most expensive workflow: {{expensive_workflow}}

## Recommendations
{{#each recommendations}}
- {{this}}
{{/each}}
```

## Power Platform Specific Tips

### PCF Component Reviews

```markdown
# Optimize: Only analyze changed components
{{#each changed_files}}
  {{#if this.path startsWith "pcf-components/"}}
    {{#agent engine="gpt-3.5-turbo"}}
    Quick PCF check for {{this.name}}
    {{/agent}}
  {{/if}}
{{/each}}
```

**Savings**: Process only 1-2 files instead of entire repo

### Web Resource Analysis

```markdown
# Use cheap model for web resources (straightforward JavaScript)
{{#agent engine="claude-haiku"}}
Check web resource: {{webresource.name}}
- Xrm API usage
- Null checks
- Error handling
{{/agent}}
```

**Cost**: $0.001 vs $0.05 (Claude Sonnet)

### Plugin Reviews

```markdown
# Batch plugin files together
{{#agent engine="gpt-3.5-turbo"}}
Review these plugins together:
{{#each plugin_files}}
{{this.name}}: {{this.summary}}
{{/each}}
{{/agent}}
```

**Savings**: 1 request vs N requests

### Solution Validation

```markdown
# Use lightweight validation
{{#agent engine="gpt-3.5-turbo"}}
Validate solution structure:
- Required files present?
- XML syntax valid?
- References consistent?
{{/agent}}
```

No need for expensive models for structural validation.

## Cost Calculators

### Per-Workflow Calculator

```python
def calculate_cost(tokens_input, tokens_output, model):
    pricing = {
        "gpt-3.5-turbo": (0.50, 1.50),
        "gpt-4-turbo": (10.00, 30.00),
        "claude-sonnet-3.5": (3.00, 15.00)
    }
    
    input_price, output_price = pricing[model]
    input_cost = (tokens_input / 1_000_000) * input_price
    output_cost = (tokens_output / 1_000_000) * output_price
    
    return input_cost + output_cost

# Example: Code review
input_tokens = 8000  # PR context
output_tokens = 2000  # Review comments

cost_gpt35 = calculate_cost(8000, 2000, "gpt-3.5-turbo")
# $0.007

cost_gpt4 = calculate_cost(8000, 2000, "gpt-4-turbo")
# $0.14

print(f"Savings: ${cost_gpt4 - cost_gpt35:.3f} (95%)")
```

### Monthly Projection

```python
def monthly_projection(workflows_per_day, avg_cost_per_workflow):
    daily = workflows_per_day * avg_cost_per_workflow
    monthly = daily * 30
    yearly = monthly * 12
    
    return {
        "daily": daily,
        "monthly": monthly,
        "yearly": yearly
    }

# 50 PRs/day @ $0.02 each (optimized)
projection = monthly_projection(50, 0.02)
# Monthly: $30

# vs 50 PRs/day @ $0.30 each (unoptimized GPT-4)
projection_unoptimized = monthly_projection(50, 0.30)
# Monthly: $450

print(f"Monthly savings: ${projection_unoptimized['monthly'] - projection['monthly']}")
# $420/month saved
```

## Quick Wins Checklist

- [ ] Use GPT-3.5 for simple classification
- [ ] Enable caching for repeated analyses
- [ ] Include only diffs, not full files
- [ ] Batch similar operations
- [ ] Add early exit conditions
- [ ] Use structured output formats
- [ ] Set max token limits
- [ ] Monitor token usage weekly
- [ ] Implement tiered model strategy
- [ ] Cache static analysis results

## Advanced Optimizations

### Token Budgets

```yaml
tools:
  budget:
    per-workflow: 10000
    per-agent: 5000
    per-request: 2000
    action-on-exceed: truncate  # or fail
```

### Dynamic Model Selection

```markdown
{{#set model = pull_request.changed_files_count < 5 
               ? "gpt-3.5-turbo" 
               : "claude-sonnet-3.5"}}

{{#agent engine="{{model}}"}}
Review PR
{{/agent}}
```

### Lazy Evaluation

```markdown
# Don't process unless explicitly requested
{{#if comment.body contains "/review"}}
  {{#agent engine="gpt-4-turbo"}}
  Comprehensive review
  {{/agent}}
{{/if}}
```

### Incremental Analysis

```markdown
# Only analyze new commits since last run
{{#each commits since=last_run}}
  {{#agent}}Analyze {{this.sha}}{{/agent}}
{{/each}}
```

## Cost vs Quality Trade-offs

| Scenario | Cheap Option | Quality Option | Recommendation |
|----------|--------------|----------------|----------------|
| Issue triage | GPT-3.5 → $0.003 | GPT-4 → $0.10 | Cheap (95% accuracy is fine) |
| Security review | GPT-4 → $0.30 | GPT-4 + manual → $1.00 | Quality (security critical) |
| Documentation | Haiku → $0.005 | Sonnet → $0.05 | Cheap (style matters less) |
| Code review | Sonnet → $0.05 | GPT-4 → $0.30 | Balanced (good accuracy, reasonable cost) |
| Refactoring suggestions | GPT-4 → $0.50 | GPT-4 + testing → $2.00 | Quality (changes are expensive) |

## References

- [OpenAI Pricing](https://openai.com/pricing)
- [Anthropic Pricing](https://www.anthropic.com/pricing)
- [Token Counting Tools](https://platform.openai.com/tokenizer)
- [GitHub Agentic Workflows Cost Management](https://github.github.com/gh-aw/guides/cost-optimization/)

## See Also

- [Multi-Agent Orchestration](multi-agent-orchestration.md) - Using tiered agents
- [Custom Safe Outputs](custom-safe-outputs.md) - Efficient action patterns
- [Best Practices Guide](../docs/best-practices.md) - General optimization

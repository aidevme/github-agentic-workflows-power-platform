# Cost Management Guide: GitHub Agentic Workflows

**Last Updated:** March 30, 2026  
**For:** Engineering managers, developers, finance teams

## Introduction

GitHub Agentic Workflows use AI models that charge based on **token consumption**—the amount of text processed. While the productivity gains are substantial, understanding and managing these costs is crucial for sustainable adoption.

### Why Cost Management Matters

- **Predictable budgets:** AI API costs can vary based on usage patterns
- **ROI justification:** Finance teams need data to approve ongoing spend
- **Resource optimization:** Identify inefficient workflows consuming excessive tokens
- **Scale planning:** Estimate costs as you add repositories and workflows

**Good news:** For most Power Platform projects, agentic workflow costs are 1-3% of developer salaries, while saving 10-20% of developer time.

### The Token Pricing Model

AI models charge based on **tokens**—roughly equivalent to words or code symbols:

- **1 token ≈ 4 characters** (English text)
- **1 token ≈ 0.75 words** on average
- **100 tokens ≈ 75 words** or **~15 lines of code**

**Two types of tokens:**

1. **Input tokens** (prompt): What you send to the AI (issue text, code files, instructions)
2. **Output tokens** (completion): What the AI generates (labels, comments, code)

**Cost asymmetry:** Output tokens typically cost **3-5x more** than input tokens, so concise outputs save money.

### Expected Monthly Costs for Typical Power Platform Repository

**Quick estimates (medium-sized repo, active development):**

| AI Engine | Monthly Cost | What's Included |
|-----------|--------------|-----------------|
| **GitHub Copilot CLI** | **$0** | Unlimited usage (included in $10-19/month subscription) |
| **Anthropic Claude Sonnet 3.5** | **$5-15** | 75 issues, 25 doc syncs, 10 refactorings, 20 test runs |
| **OpenAI GPT-4 Turbo** | **$20-60** | Same workload as above |

**Recommendation:** If you already have GitHub Copilot subscriptions, use Copilot CLI for $0 additional cost.

---

## Token Pricing (As of March 2026)

| Provider | Model | Input (per 1M tokens) | Output (per 1M tokens) | Context Window | Best For |
|----------|-------|----------------------|------------------------|----------------|----------|
| **GitHub Copilot** | Copilot CLI | **Included in subscription** | **Included** | 128K (~100K lines) | Teams with Copilot |
| **Anthropic** | Claude Sonnet 3.5 | $3.00 | $15.00 | 200K (~150K lines) | Large codebases |
| **Anthropic** | Claude Opus 3 | $15.00 | $75.00 | 200K | Complex reasoning (rarely needed) |
| **OpenAI** | GPT-4 Turbo | $10.00 | $30.00 | 128K | General purpose |
| **OpenAI** | GPT-4 (standard) | $30.00 | $60.00 | 8K | Legacy (not recommended) |

**Notes:**

- **GitHub Copilot subscription costs:**
  - Individual: $10/month
  - Business: $19/user/month
  - Enterprise: Custom pricing
  - Includes unlimited agentic workflow token usage
  
- **Free tiers:**
  - Anthropic: $5 free credits (trial)
  - OpenAI: $5 free credits (expires after 3 months)
  - GitHub Copilot: No free tier (subscription required)

**Pricing sources:**

- [Anthropic Pricing](https://www.anthropic.com/pricing)
- [OpenAI Pricing](https://openai.com/pricing)
- [GitHub Copilot Pricing](https://github.com/features/copilot)

---

## Token Usage by Workflow Type

Understanding typical token consumption helps estimate costs and identify optimization opportunities.

### 1. Issue Triage (Continuous Triage)

**What it does:** Automatically classifies issues, applies labels, adds diagnostic comments.

**Token breakdown:**

- **Input tokens (2,000-5,000):**
  - Issue title and body: 500-1,000 tokens
  - Codebase context (searched files): 1,000-3,000 tokens
  - Workflow instructions: 500-1,000 tokens
  
- **Output tokens (700-1,500):**
  - Classification reasoning: 500-1,000 tokens
  - Diagnostic comment: 200-500 tokens
  - Label metadata: 100 tokens

**Total:** 2,700-6,500 tokens per issue

**Cost per run:**

- **Claude Sonnet 3.5:** (2,500/1M × $3) + (1,000/1M × $15) = $0.0075 + $0.015 = **$0.023**
- **GPT-4 Turbo:** (2,500/1M × $10) + (1,000/1M × $30) = $0.025 + $0.030 = **$0.055**
- **GitHub Copilot CLI:** **$0.00** (included)

**Frequency:** Triggered on every new issue

- Small repo: 20-50 issues/month
- Medium repo: 50-100 issues/month
- Large repo: 100-200 issues/month

**Monthly cost estimate:**

| Repository Size | Issues/Month | Claude Cost | GPT-4 Cost | Copilot Cost |
|-----------------|--------------|-------------|------------|--------------|
| Small | 30 | $0.69 | $1.65 | $0.00 |
| Medium | 75 | $1.73 | $4.13 | $0.00 |
| Large | 150 | $3.45 | $8.25 | $0.00 |

---

### 2. Documentation Sync (Continuous Documentation)

**What it does:** Updates README, API docs when code changes.

**Token breakdown:**

- **Input tokens (5,000-15,000):**
  - Code changes (PR diff): 2,000-5,000 tokens
  - Existing documentation: 2,000-5,000 tokens
  - Workflow instructions: 1,000-2,000 tokens
  - Context (related files): 1,000-3,000 tokens
  
- **Output tokens (3,000-8,000):**
  - Updated documentation sections: 2,500-7,000 tokens
  - Change summary: 500-1,000 tokens

**Total:** 8,000-23,000 tokens per run

**Cost per run:**

- **Claude Sonnet 3.5:** (10,000/1M × $3) + (5,000/1M × $15) = $0.03 + $0.075 = **$0.105**
- **GPT-4 Turbo:** (10,000/1M × $10) + (5,000/1M × $30) = $0.10 + $0.15 = **$0.25**
- **GitHub Copilot CLI:** **$0.00**

**Frequency:** Triggered on code changes affecting documented features

- Small repo: 5-10 updates/month
- Medium repo: 20-30 updates/month
- Large repo: 40-60 updates/month

**Monthly cost estimate:**

| Repository Size | Updates/Month | Claude Cost | GPT-4 Cost | Copilot Cost |
|-----------------|---------------|-------------|------------|--------------|
| Small | 8 | $0.84 | $2.00 | $0.00 |
| Medium | 25 | $2.63 | $6.25 | $0.00 |
| Large | 50 | $5.25 | $12.50 | $0.00 |

---

### 3. Code Simplification (Continuous Simplification)

**What it does:** Detects duplicate code, proposes refactorings, creates cleanup PRs.

**Token breakdown:**

- **Input tokens (10,000-30,000):**
  - Code files to analyze: 5,000-15,000 tokens
  - Pattern analysis (duplicate detection): 3,000-10,000 tokens
  - Workflow instructions: 2,000-5,000 tokens
  
- **Output tokens (5,000-15,000):**
  - Refactored code: 4,000-12,000 tokens
  - Explanation and PR description: 1,000-3,000 tokens

**Total:** 15,000-45,000 tokens per run

**Cost per run:**

- **Claude Sonnet 3.5:** (20,000/1M × $3) + (10,000/1M × $15) = $0.06 + $0.15 = **$0.21**
- **GPT-4 Turbo:** (20,000/1M × $10) + (10,000/1M × $30) = $0.20 + $0.30 = **$0.50**
- **GitHub Copilot CLI:** **$0.00**

**Frequency:** Weekly or bi-weekly scans

- Small repo: 2-4 runs/month
- Medium repo: 8-12 runs/month
- Large repo: 15-20 runs/month

**Monthly cost estimate:**

| Repository Size | Runs/Month | Claude Cost | GPT-4 Cost | Copilot Cost |
|-----------------|------------|-------------|------------|--------------|
| Small | 3 | $0.63 | $1.50 | $0.00 |
| Medium | 10 | $2.10 | $5.00 | $0.00 |
| Large | 18 | $3.78 | $9.00 | $0.00 |

---

### 4. Test Improvement (Continuous Test Improvement)

**What it does:** Generates unit tests, improves test coverage, suggests edge cases.

**Token breakdown:**

- **Input tokens (8,000-20,000):**
  - Code to test: 3,000-8,000 tokens
  - Existing tests (for context): 2,000-5,000 tokens
  - Test framework patterns: 1,000-2,000 tokens
  - Workflow instructions: 2,000-5,000 tokens
  
- **Output tokens (5,000-12,000):**
  - New test cases: 4,000-10,000 tokens
  - Test documentation: 1,000-2,000 tokens

**Total:** 13,000-32,000 tokens per run

**Cost per run:**

- **Claude Sonnet 3.5:** (14,000/1M × $3) + (8,000/1M × $15) = $0.042 + $0.12 = **$0.162**
- **GPT-4 Turbo:** (14,000/1M × $10) + (8,000/1M × $30) = $0.14 + $0.24 = **$0.38**
- **GitHub Copilot CLI:** **$0.00**

**Frequency:** Per new feature or significant code change

- Small repo: 5-10 runs/month
- Medium repo: 15-25 runs/month
- Large repo: 30-40 runs/month

**Monthly cost estimate:**

| Repository Size | Runs/Month | Claude Cost | GPT-4 Cost | Copilot Cost |
|-----------------|------------|-------------|------------|--------------|
| Small | 8 | $1.30 | $3.04 | $0.00 |
| Medium | 20 | $3.24 | $7.60 | $0.00 |
| Large | 35 | $5.67 | $13.30 | $0.00 |

---

### 5. CI Investigation (Continuous Quality Hygiene)

**What it does:** Analyzes CI/CD failures, identifies root causes, suggests fixes.

**Token breakdown:**

- **Input tokens (15,000-40,000):**
  - CI logs and error messages: 5,000-15,000 tokens
  - Codebase analysis (changed files): 8,000-20,000 tokens
  - Workflow instructions: 2,000-5,000 tokens
  
- **Output tokens (5,000-13,000):**
  - Root cause analysis: 3,000-8,000 tokens
  - Fix suggestions: 2,000-5,000 tokens

**Total:** 20,000-53,000 tokens per run

**Cost per run:**

- **Claude Sonnet 3.5:** (27,000/1M × $3) + (9,000/1M × $15) = $0.081 + $0.135 = **$0.216**
- **GPT-4 Turbo:** (27,000/1M × $10) + (9,000/1M × $30) = $0.27 + $0.27 = **$0.54**
- **GitHub Copilot CLI:** **$0.00**

**Frequency:** Per CI failure (varies widely by code quality)

- Small repo: 5-10 failures/month
- Medium repo: 10-20 failures/month
- Large repo: 20-30 failures/month

**Monthly cost estimate:**

| Repository Size | Failures/Month | Claude Cost | GPT-4 Cost | Copilot Cost |
|-----------------|----------------|-------------|------------|--------------|
| Small | 7 | $1.51 | $3.78 | $0.00 |
| Medium | 15 | $3.24 | $8.10 | $0.00 |
| Large | 25 | $5.40 | $13.50 | $0.00 |

---

### 6. Health Reporting (Continuous Reporting)

**What it does:** Weekly reports on code quality, test coverage, issue trends, technical debt.

**Token breakdown:**

- **Input tokens (20,000-50,000):**
  - Repository analysis (issues, PRs, commits): 15,000-40,000 tokens
  - Metrics calculation: 3,000-8,000 tokens
  - Workflow instructions and templates: 2,000-2,000 tokens
  
- **Output tokens (3,000-8,000):**
  - Health report (markdown): 2,500-7,000 tokens
  - Executive summary: 500-1,000 tokens

**Total:** 23,000-58,000 tokens per run

**Cost per run:**

- **Claude Sonnet 3.5:** (35,000/1M × $3) + (5,000/1M × $15) = $0.105 + $0.075 = **$0.18**
- **GPT-4 Turbo:** (35,000/1M × $10) + (5,000/1M × $30) = $0.35 + $0.15 = **$0.50**
- **GitHub Copilot CLI:** **$0.00**

**Frequency:** Weekly (4-5 runs/month per repository)

**Monthly cost estimate:**

| Repository Size | Reports/Month | Claude Cost | GPT-4 Cost | Copilot Cost |
|-----------------|---------------|-------------|------------|--------------|
| Any size | 4 | $0.72 | $2.00 | $0.00 |

---

## Total Monthly Cost Estimates

### Small Repository (Low Activity)

**Characteristics:**
- 1-3 active developers
- 20-30 issues/month
- 5-10 PRs/month
- Stable codebase, minimal refactoring

**Workflow usage:**
- Issue triage: 25 runs
- Documentation sync: 8 runs
- Code simplification: 3 runs
- Test improvement: 8 runs
- CI investigation: 7 runs
- Health reporting: 4 runs

**Total monthly costs:**

| Workflow Type | Claude | GPT-4 | Copilot |
|---------------|--------|-------|---------|
| Issue triage | $0.58 | $1.38 | $0.00 |
| Documentation | $0.84 | $2.00 | $0.00 |
| Simplification | $0.63 | $1.50 | $0.00 |
| Test improvement | $1.30 | $3.04 | $0.00 |
| CI investigation | $1.51 | $3.78 | $0.00 |
| Health reporting | $0.72 | $2.00 | $0.00 |
| **TOTAL** | **$5.58** | **$13.70** | **$0.00** |

**Rounded estimates:** $5-8/month (Claude) | $12-18/month (GPT-4) | $0/month (Copilot)

---

### Medium Repository (Active Development)

**Characteristics:**
- 5-10 active developers
- 60-100 issues/month
- 20-40 PRs/month
- Active feature development

**Workflow usage:**
- Issue triage: 75 runs
- Documentation sync: 25 runs
- Code simplification: 10 runs
- Test improvement: 20 runs
- CI investigation: 15 runs
- Health reporting: 4 runs

**Total monthly costs:**

| Workflow Type | Claude | GPT-4 | Copilot |
|---------------|--------|-------|---------|
| Issue triage | $1.73 | $4.13 | $0.00 |
| Documentation | $2.63 | $6.25 | $0.00 |
| Simplification | $2.10 | $5.00 | $0.00 |
| Test improvement | $3.24 | $7.60 | $0.00 |
| CI investigation | $3.24 | $8.10 | $0.00 |
| Health reporting | $0.72 | $2.00 | $0.00 |
| **TOTAL** | **$13.66** | **$33.08** | **$0.00** |

**Rounded estimates:** $12-18/month (Claude) | $30-45/month (GPT-4) | $0/month (Copilot)

---

### Large Repository (High Activity)

**Characteristics:**
- 15-30 active developers
- 150-250 issues/month
- 50-80 PRs/month
- Rapid iteration, complex features

**Workflow usage:**
- Issue triage: 150 runs
- Documentation sync: 50 runs
- Code simplification: 18 runs
- Test improvement: 35 runs
- CI investigation: 25 runs
- Health reporting: 4 runs

**Total monthly costs:**

| Workflow Type | Claude | GPT-4 | Copilot |
|---------------|--------|-------|---------|
| Issue triage | $3.45 | $8.25 | $0.00 |
| Documentation | $5.25 | $12.50 | $0.00 |
| Simplification | $3.78 | $9.00 | $0.00 |
| Test improvement | $5.67 | $13.30 | $0.00 |
| CI investigation | $5.40 | $13.50 | $0.00 |
| Health reporting | $0.72 | $2.00 | $0.00 |
| **TOTAL** | **$24.27** | **$58.55** | **$0.00** |

**Rounded estimates:** $20-35/month (Claude) | $55-80/month (GPT-4) | $0/month (Copilot)

---

### Enterprise (Multiple Repositories)

**Characteristics:**
- 5-10 active repositories
- 50-100 developers across teams
- Centralized agentic workflow management

**Assumptions:**
- 2 large repos, 3 medium repos, 5 small repos
- Shared organization-level API keys

**Total monthly costs:**

| Scenario | Claude | GPT-4 | Copilot |
|----------|--------|-------|---------|
| **Conservative** (low activity across repos) | $50-80 | $120-200 | $0.00 |
| **Typical** (medium activity) | $80-150 | $200-400 | $0.00 |
| **Aggressive** (high activity, all workflows enabled) | $150-250 | $400-700 | $0.00 |

**Copilot consideration:** For enterprises, GitHub Copilot Business at $19/seat/month for 100 developers = $1,900/month, but includes unlimited agentic workflow usage.

**Cost comparison:**

- **Claude strategy:** Pay $80-150/month for workflows, developers use free or lower-tier coding tools
- **Copilot strategy:** Pay $1,900/month for Copilot seats, get workflows + IDE assistance included
- **Hybrid strategy:** Copilot for developers ($1,900/month) + Claude for large-context workflows ($30-50/month for specialized cases)

---

## Cost Optimization Strategies

### 1. Choose the Right Engine for Each Workflow

**Decision matrix:**

| Workflow Type | Recommended Engine | Reason |
|---------------|-------------------|--------|
| Issue triage | **Copilot CLI** or Claude Sonnet | Simple task, low token usage |
| Documentation sync | **Copilot CLI** or Claude Sonnet | Medium complexity |
| Code simplification | **Claude Sonnet 3.5** | Large context window beneficial |
| Test improvement | **Copilot CLI** or Claude Sonnet | Code generation strength |
| CI investigation | **Claude Sonnet 3.5** | Large logs, pattern recognition |
| Health reporting | **Claude Sonnet 3.5** | Repository-wide analysis |

**Cost savings:** Using Copilot CLI for simple tasks and Claude for complex ones can reduce costs by **40-60%** vs. using GPT-4 for everything.

**Configuration example:**

```yaml
# agentic-workflows/pcf-issue-triage.md (simple task)
---
name: PCF Issue Triage
engine: copilot-cli  # Free with subscription
timeout-minutes: 3
---
```

```yaml
# agentic-workflows/pcf-code-simplifier.md (complex task)
---
name: PCF Code Simplifier
engine: claude-sonnet-3.5  # Large context needed
timeout-minutes: 10
---
```

---

### 2. Set Aggressive Timeouts

**Purpose:** Prevent runaway workflows that consume tokens in loops or inefficient processing.

**Recommended timeouts by workflow type:**

| Workflow Type | Timeout | Rationale |
|---------------|---------|-----------|
| Issue triage | **3-5 minutes** | Simple classification, shouldn't take long |
| Documentation sync | **5-7 minutes** | Moderate complexity |
| Code simplification | **8-10 minutes** | Complex analysis, but shouldn't loop |
| Test improvement | **7-10 minutes** | Code generation takes time |
| CI investigation | **10-15 minutes** | Large logs, but finite |
| Health reporting | **15-20 minutes** | Repository-wide scan |

**Configuration:**

```yaml
---
name: PCF Issue Triage
engine: claude-sonnet-3.5
timeout-minutes: 5  # Hard stop after 5 minutes
---
```

**Cost impact:** A runaway workflow without timeout can consume hundreds of thousands of tokens (costing $10-50). Timeouts prevent this.

---

### 3. Use Semantic Caching (Serena Integration)

**What is Serena?**

Serena is Microsoft's semantic analysis toolkit for codebase understanding. It pre-processes code structure, reducing tokens needed for each workflow run.

**How it saves costs:**

1. **One-time analysis:** Serena analyzes your codebase (high token usage upfront)
2. **Cached context:** Workflows reference pre-computed semantic embeddings instead of re-reading files
3. **Token reduction:** 30-50% fewer input tokens per run

**Example:**

Without Serena:
- Issue triage reads 5 files (2,000 tokens) to understand "DatePicker"
- Cost: 2,000 input tokens per issue

With Serena:
- Serena cache includes pre-analyzed "DatePicker" semantics
- Workflow loads cached context (500 tokens)
- Cost: 500 input tokens per issue (75% reduction)

**Setup:**

See [workflows/advanced/serena-integration.md](workflows/advanced/serena-integration.md) for detailed setup.

**ROI:** One-time cost of $5-10 to analyze codebase, then $2-5/month savings on every workflow.

---

### 4. Limit Workflow Scope

**Problem:** Workflows triggered too frequently waste tokens on redundant processing.

**Solution:** Use precise trigger conditions.

**Example: Too broad**

```yaml
on:
  issues:
    types: [opened, edited, reopened, labeled, unlabeled, assigned]
```

**Every label change retriggers the workflow** → 3-5x more runs than needed.

**Example: Optimized**

```yaml
on:
  issues:
    types: [opened]  # Only new issues
```

**Cost savings:** Reducing trigger frequency from 5x per issue to 1x = **80% cost reduction** for issue workflows.

---

### 5. Use Conditional Execution

**Purpose:** Skip workflow runs when they're not needed.

**Example: Only triage unlabeled issues**

```yaml
---
name: PCF Issue Triage
on:
  issues:
    types: [opened, edited]
---

# Workflow body
jobs:
  triage:
    if: ${{ !contains(join(github.event.issue.labels.*.name, ','), 'triaged') }}
    runs-on: ubuntu-latest
    steps:
      # ... agent execution
```

**How it works:**

- Issue created without "triaged" label → Workflow runs
- Issue edited but already has "triaged" label → Workflow skipped
- Issue manually labeled "triaged" → Workflow skipped

**Cost savings:** Skipping re-triage of already-labeled issues = **40-60% reduction** in issue triage costs.

---

### 6. Batch Processing

**Problem:** Running workflows individually for small tasks is inefficient.

**Solution:** Batch similar tasks together.

**Example: Daily health reports instead of real-time**

❌ **Inefficient:** Run health check on every commit (100 runs/month, $18/month)

✅ **Efficient:** Run health check once daily (30 runs/month, $5.40/month) or weekly (4 runs/month, $0.72/month)

**Configuration:**

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Monday at 9 AM UTC (weekly)
```

**Cost savings:** Weekly vs. per-commit = **97% reduction** in reporting costs.

---

### 7. Optimize Prompts

**Token-heavy prompts waste money.** Concise, directive prompts reduce both input and output tokens.

**Example: Verbose prompt (expensive)**

```markdown
# Role
You are an expert Power Platform developer with deep knowledge of the 
PowerApps Component Framework (PCF), Dataverse plugin architecture, 
and Microsoft's recommended best practices. You have years of experience 
triaging issues in open-source repositories.

# Task
Please carefully analyze the issue provided below. Read through the 
title and body thoroughly. Consider the context of the codebase. 
Search for relevant files if component names are mentioned. Apply 
appropriate labels based on your expert judgment.

# Process
1. First, read the issue title and body
2. Extract any component names or keywords
3. Search the repository for related files
4. Analyze the issue type (bug, feature request, question)
5. Consider severity and priority
6. Select 1-3 labels from the list
7. Write a helpful comment explaining your classification
```

**Tokens:** ~150 input tokens (instructions alone)

**Example: Concise prompt (optimized)**

```markdown
# Task
Classify issue and apply 1-3 labels: bug, enhancement, needs-info, pcf-framework, pcf-custom.

# Process
1. Read issue title/body
2. Search for mentioned components
3. Apply labels
4. Comment with diagnostic questions if "needs-info"
```

**Tokens:** ~40 input tokens (73% reduction)

**Cost savings:** Reducing instruction tokens from 150 to 40 across 100 runs = 11,000 tokens saved = **$0.33/month** (small but adds up)

---

### 8. Monitor and Alert

**Set up proactive cost monitoring** to catch expensive workflows before they drain budgets.

**Recommended alerts:**

| Metric | Threshold | Action |
|--------|-----------|--------|
| Daily spend | $5 | Email notification |
| Weekly spend | $20 | Review workflow efficiency |
| Monthly spend | $80 | Pause non-critical workflows |
| Single workflow run | $2 | Investigate why (possible runaway) |

**Tools:**

1. **Anthropic Console:** https://console.anthropic.com/settings/billing/alerts
2. **OpenAI Dashboard:** https://platform.openai.com/account/billing/limits
3. **Custom script:** `scripts/token-cost-calculator.ps1` (run weekly)

**Example alert setup (Anthropic):**

1. Settings → Billing → Alerts
2. Create alert: "Weekly spend exceeds $20"
3. Email: engineering-manager@company.com
4. Action: Review usage breakdown, identify expensive workflows

---

## Token Cost Calculator Tool

We provide a PowerShell script to analyze token usage from GitHub Actions logs.

### Usage

```powershell
# Analyze last 30 days of workflow runs
./scripts/token-cost-calculator.ps1 -Owner "aidevme" -Repo "github-agentic-workflows-power-platform" -Days 30
```

### Sample Output

```
GitHub Agentic Workflows - Cost Analysis Report
Repository: aidevme/github-agentic-workflows-power-platform
Period: March 1-30, 2026 (30 days)

─────────────────────────────────────────────────────────────────────────────
Workflow Type          | Runs | Avg Tokens | Total Tokens | Claude Cost | GPT-4 Cost
─────────────────────────────────────────────────────────────────────────────
Issue Triage           |  47  |   3,200    |   150,400    |   $0.94     |   $4.70
Documentation Sync     |  12  |   8,500    |   102,000    |   $0.72     |   $3.60
Code Simplification    |   5  |  18,000    |    90,000    |   $0.90     |   $4.50
Test Improvement       |  18  |  11,000    |   198,000    |   $1.48     |   $7.20
CI Investigation       |   8  |  25,000    |   200,000    |   $1.80     |   $9.00
Health Reporting       |   4  |  35,000    |   140,000    |   $1.12     |   $5.60
─────────────────────────────────────────────────────────────────────────────
TOTAL                  |  94  |     -      |   880,400    |   $6.96     |  $34.60
─────────────────────────────────────────────────────────────────────────────

Projected Monthly Cost (based on 30-day trend):
  - Anthropic Claude Sonnet 3.5:  $6.96/month
  - OpenAI GPT-4 Turbo:           $34.60/month
  - GitHub Copilot CLI:           $0.00/month (included in subscription)

Top 3 Most Expensive Workflows:
  1. CI Investigation: $1.80/month (Claude) | $9.00/month (GPT-4)
  2. Test Improvement: $1.48/month (Claude) | $7.20/month (GPT-4)
  3. Health Reporting: $1.12/month (Claude) | $5.60/month (GPT-4)

Optimization Recommendations:
  ⚠ CI Investigation runs are expensive (25K tokens avg). Consider:
     - Reducing log verbosity before sending to agent
     - Using semantic caching for repeated error patterns
  ✓ Issue Triage is well-optimized (3.2K tokens avg)
  ✓ Overall costs are within expected range for medium repository
```

### Script Installation

The script is included in this repository:

```bash
# Clone if you haven't already
git clone https://github.com/aidevme/github-agentic-workflows-power-platform.git
cd github-agentic-workflows-power-platform

# Run the script
pwsh scripts/token-cost-calculator.ps1 -Owner "your-org" -Repo "your-repo" -Days 30
```

### Parameters

```powershell
-Owner       # GitHub organization or user (required)
-Repo        # Repository name (required)
-Days        # Number of days to analyze (default: 30)
-OutputCsv   # Export results to CSV file (optional)
-Workflow    # Filter by specific workflow name (optional)
```

### Advanced Usage

**Export to CSV for finance reporting:**

```powershell
./scripts/token-cost-calculator.ps1 -Owner "aidevme" -Repo "pcf-library" -Days 90 -OutputCsv "costs-q1-2026.csv"
```

**Analyze specific workflow:**

```powershell
./scripts/token-cost-calculator.ps1 -Owner "aidevme" -Repo "pcf-library" -Workflow "Issue Triage" -Days 7
```

---

## ROI Calculation

Understanding return on investment justifies AI workflow spending to finance teams.

### Cost Avoidance Analysis

**Principle:** Compare AI agent costs to the cost of manual developer time for the same tasks.

**Developer cost assumptions:**

- Average fully-loaded developer cost: **$75/hour** (salary + benefits + overhead)
- For financial services/healthcare: **$100-150/hour**
- For startups: **$50-75/hour**

We'll use **$75/hour** for calculations below.

---

### Workflow 1: Issue Triage

**Manual process:**

- Developer reads issue: 2 minutes
- Searches codebase for context: 3 minutes
- Applies labels: 1 minute
- Writes diagnostic comment: 4 minutes
- **Total: 10 minutes per issue**

**Manual cost (100 issues/month):**

- 100 issues × 10 minutes = 1,000 minutes = **16.67 hours**
- 16.67 hours × $75/hour = **$1,250/month**

**Agent cost (100 issues/month):**

- 100 issues × $0.023 (Claude) = **$2.30/month**
- 100 issues × $0.00 (Copilot) = **$0.00/month**

**Savings:**

- Claude: $1,250 - $2.30 = **$1,247.70/month** (99.8% reduction)
- Copilot: $1,250 - $0 = **$1,250/month** (100% reduction)

**Annual savings:** ~$15,000/year per repository

---

### Workflow 2: Documentation Updates

**Manual process:**

- Developer reads code changes: 5 minutes
- Updates README/docs: 20 minutes
- Reviews for accuracy: 5 minutes
- **Total: 30 minutes per update**

**Manual cost (20 updates/month):**

- 20 updates × 30 minutes = 600 minutes = **10 hours**
- 10 hours × $75/hour = **$750/month**

**Agent cost (20 updates/month):**

- 20 updates × $0.105 (Claude) = **$2.10/month**
- 20 updates × $0.00 (Copilot) = **$0.00/month**

**Savings:**

- Claude: $750 - $2.10 = **$747.90/month** (99.7% reduction)
- Copilot: $750 - $0 = **$750/month** (100% reduction)

**Annual savings:** ~$9,000/year per repository

---

### Workflow 3: Code Duplication Detection

**Manual process:**

- Developer reviews codebase for duplicates: 2 hours/week
- Proposes refactoring: 1 hour/week
- **Total: 3 hours/week = 12 hours/month**

**Manual cost:**

- 12 hours × $75/hour = **$900/month**

**Agent cost (10 refactoring runs/month):**

- 10 runs × $0.21 (Claude) = **$2.10/month**
- 10 runs × $0.00 (Copilot) = **$0.00/month**

**Savings:**

- Claude: $900 - $2.10 = **$897.90/month** (99.8% reduction)
- Copilot: $900 - $0 = **$900/month** (100% reduction)

**Annual savings:** ~$10,800/year per repository

---

### Workflow 4: Test Generation

**Manual process:**

- Developer writes unit tests: 15 minutes per test
- 20 new features/month × 3 tests each = 60 tests
- **Total: 900 minutes = 15 hours/month**

**Manual cost:**

- 15 hours × $75/hour = **$1,125/month**

**Agent cost (20 test generation runs/month):**

- 20 runs × $0.162 (Claude) = **$3.24/month**
- 20 runs × $0.00 (Copilot) = **$0.00/month**

**Savings:**

- Claude: $1,125 - $3.24 = **$1,121.76/month** (99.7% reduction)
- Copilot: $1,125 - $0 = **$1,125/month** (100% reduction)

**Annual savings:** ~$13,500/year per repository

**Note:** Agents don't replace manual testing entirely—they generate baseline tests that developers review and enhance.

---

### Workflow 5: CI Failure Investigation

**Manual process:**

- Developer reviews CI logs: 15 minutes
- Searches codebase for root cause: 20 minutes
- Writes diagnostic summary: 5 minutes
- **Total: 40 minutes per failure**

**Manual cost (15 failures/month):**

- 15 failures × 40 minutes = 600 minutes = **10 hours**
- 10 hours × $75/hour = **$750/month**

**Agent cost (15 investigation runs/month):**

- 15 runs × $0.216 (Claude) = **$3.24/month**
- 15 runs × $0.00 (Copilot) = **$0.00/month**

**Savings:**

- Claude: $750 - $3.24 = **$746.76/month** (99.6% reduction)
- Copilot: $750 - $0 = **$750/month** (100% reduction)

**Annual savings:** ~$9,000/year per repository

---

### Total ROI Summary (Medium Repository)

**All workflows combined:**

| Category | Manual Cost | Agent Cost (Claude) | Agent Cost (Copilot) | Savings (Claude) | Savings (Copilot) |
|----------|-------------|---------------------|----------------------|------------------|-------------------|
| Issue triage (100/mo) | $1,250 | $2.30 | $0.00 | $1,247.70 | $1,250.00 |
| Documentation (20/mo) | $750 | $2.10 | $0.00 | $747.90 | $750.00 |
| Refactoring (10/mo) | $900 | $2.10 | $0.00 | $897.90 | $900.00 |
| Test generation (20/mo) | $1,125 | $3.24 | $0.00 | $1,121.76 | $1,125.00 |
| CI investigation (15/mo) | $750 | $3.24 | $0.00 | $746.76 | $750.00 |
| **TOTAL** | **$4,775** | **$12.98** | **$0.00** | **$4,762.02** | **$4,775.00** |

**Monthly ROI:**

- Claude Sonnet 3.5: **367x return** ($4,762 saved / $12.98 spent)
- GitHub Copilot CLI: **Infinite return** ($4,775 saved / $0 spent)

**Annual ROI:**

- Claude: **$57,000 saved** at a cost of $156/year = **365x return**
- Copilot: **$57,300 saved** at a cost of $0/year (assuming existing Copilot subscription)

**Net present value (5-year horizon):**

- Manual effort: $286,500 (5 years × $4,775/month × 12 months)
- Agent cost (Claude): $780 (5 years × $156/year) = **$285,720 saved**
- Agent cost (Copilot): $0 = **$286,500 saved**

---

### Conservative ROI Calculation

**Assumptions:**

- Agents are only **50% as effective** as manual work (require human review/correction)
- Only **60% of manual time** is actually saved (agents handle routine, humans do complex cases)

**Adjusted savings:**

- Manual effort: $4,775/month
- Effective savings: $4,775 × 0.50 × 0.60 = **$1,433/month**
- Agent cost (Claude): $12.98/month
- Net savings: $1,433 - $12.98 = **$1,420/month**

**Conservative ROI:** **109x return** ($1,420 saved / $12.98 spent)

Even with conservative assumptions, the ROI is overwhelmingly positive.

---

## Budget Planning Template

### Quarterly Budget Request Example

Use this template for finance/management approval:

---

**GitHub Agentic Workflows - Q2 2026 Budget Request**

**Department:** Engineering  
**Submitted by:** [Your Name], Engineering Manager  
**Date:** March 30, 2026

#### Executive Summary

Requesting **$500 quarterly budget** for AI-powered agentic workflows across 3 Power Platform repositories. Expected ROI: **300x** (saves $150,000 annual developer time for $500/quarter investment).

#### Repositories

1. **pcf-control-library** (large, high activity)
2. **dataverse-plugin-library** (medium activity)
3. **canvas-app-repository** (small, low activity)

#### AI Provider

**Anthropic Claude Sonnet 3.5** (chosen for cost-effectiveness and large context window)

#### Expected Usage (Per Month)

| Workflow Type | Runs/Month | Cost/Run | Monthly Cost |
|---------------|------------|----------|--------------|
| Issue triage | 200 | $0.023 | $4.60 |
| Documentation sync | 50 | $0.105 | $5.25 |
| Code simplification | 20 | $0.210 | $4.20 |
| Test improvement | 30 | $0.162 | $4.86 |
| CI investigation | 15 | $0.216 | $3.24 |
| Health reporting | 12 | $0.180 | $2.16 |
| **TOTAL** | **327** | - | **$24.31** |

#### Cost Calculation

- **Monthly baseline:** $24.31
- **20% buffer for spikes:** $4.86
- **Monthly budget:** $29.17
- **Quarterly budget (3 months):** **$87.51**
- **Requested (rounded up for safety):** **$150/quarter**

#### ROI Analysis

**Manual effort avoided:**

- Issue triage: 200 issues × 10 min = 33.3 hours/month
- Documentation: 50 updates × 30 min = 25 hours/month
- Refactoring: 20 reviews × 90 min = 30 hours/month
- Test generation: 30 features × 45 min = 22.5 hours/month
- CI investigation: 15 failures × 40 min = 10 hours/month

**Total:** 120.8 hours/month × $75/hour = **$9,060/month** manual cost

**Agent cost:** $29.17/month

**Net savings:** $9,060 - $29.17 = **$9,030.83/month**

**Quarterly savings:** $27,092.49

**ROI:** **310x return** ($27,092 saved / $87.51 spent)

#### Risk Mitigation

1. **Hard spending limit:** $150/quarter configured on Anthropic account (cannot exceed)
2. **Weekly monitoring:** Engineering manager reviews usage dashboard
3. **Alerts:** Email notification at $50, $100, $140 spend
4. **Fallback:** If AI costs spike unexpectedly, workflows can be paused immediately

#### Success Metrics

- **Token usage:** Stay within 800K tokens/month
- **Developer time saved:** 100+ hours/month (measured via survey)
- **Issue triage speed:** 50% reduction in time-to-label
- **Documentation freshness:** 90% of docs updated within 1 week of code change

#### Approval

Approved by:  
[ ] Engineering Manager  
[ ] Finance Controller  
[ ] CTO

---

### Annual Budget Planning

For annual budgets, multiply quarterly estimates by 4 and add 10% growth buffer:

- Quarterly: $150
- Annual (4 quarters): $600
- Growth buffer (10%): $60
- **Total annual budget:** $660

---

## Cost Monitoring Dashboard

### Recommended Metrics to Track

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Total monthly spend** | < $30/repo | Anthropic/OpenAI dashboard |
| **Cost per issue triaged** | < $0.05 | Token calculator script |
| **Cost per PR documented** | < $0.15 | Token calculator script |
| **Cost per refactoring** | < $0.25 | Token calculator script |
| **Token usage trend** | Flat or declining | Weekly review |
| **ROI (hours saved vs. cost)** | > 100x | Monthly survey + cost data |

### Monitoring Tools

#### 1. Anthropic Console

**URL:** https://console.anthropic.com/settings/usage

**What to monitor:**

- Daily/weekly/monthly spend
- Token usage trends
- API key usage by key (if using multiple)

**Set up alerts:**

1. Settings → Billing → Alerts
2. Create thresholds: $25, $50, $100
3. Email: engineering-team@company.com

#### 2. OpenAI Usage Dashboard

**URL:** https://platform.openai.com/usage

**What to monitor:**

- Daily spend breakdown
- Requests by model
- Rate limit utilization

**Set up limits:**

1. Settings → Billing → Usage limits
2. Soft limit: $50/month (email alert)
3. Hard limit: $100/month (block requests)

#### 3. Token Cost Calculator Script

**Schedule:** Run weekly

```powershell
# Add to cron or Windows Task Scheduler
pwsh scripts/token-cost-calculator.ps1 -Owner "aidevme" -Repo "pcf-library" -Days 7 -OutputCsv "weekly-report.csv"
```

**Review:**

- Compare week-over-week trends
- Identify anomalies (sudden spikes)
- Investigate expensive workflows

#### 4. GitHub Actions Usage API

**Track workflow execution time (free tier limits):**

```bash
gh api /repos/aidevme/pcf-library/actions/workflows -q '.workflows[] | {name, path, state}'
```

For private repos, monitor Actions minutes usage (2,000 free/month, then $0.008/minute).

---

## FAQ

### Q: Why is GitHub Copilot "free" for agentic workflows?

**A:** It's included in your Copilot subscription ($10-19/user/month). You're already paying for Copilot seats—agentic workflow usage doesn't incur additional token charges. This makes Copilot CLI the most cost-effective option if you have subscriptions.

### Q: Can I set a hard spending limit to avoid surprises?

**A:** Yes.

- **Anthropic:** Settings → Billing → Budget Cap → Set monthly limit (e.g., $100)
- **OpenAI:** Settings → Billing → Usage limits → Set hard limit (e.g., $100)

When the limit is reached, API requests are blocked and workflows fail gracefully with "insufficient quota" errors.

### Q: What happens if I hit my spending limit mid-month?

**A:** Workflows fail with an error like:

```
Error: Insufficient quota. Monthly budget limit reached.
Status: 402 Payment Required
```

**Impact:** Agentic workflows stop working until you:

1. Increase the budget limit, OR
2. Wait until the next billing cycle (limit resets monthly)

**Best practices:**

- Set limit 20% above expected usage to avoid accidental interruptions
- Configure alerts at 50%, 75%, 90% of limit to take action before hitting cap

### Q: How can I see per-workflow cost attribution?

**A:** Use the token cost calculator script with workflow filters:

```powershell
# Analyze specific workflow
./scripts/token-cost-calculator.ps1 -Owner "aidevme" -Repo "pcf-library" -Workflow "Issue Triage" -Days 30
```

**Output:**

```
Workflow: Issue Triage
Runs: 47
Total tokens: 150,400
Cost (Claude): $0.94
Cost (GPT-4): $4.70
```

This helps identify which workflows consume the most budget.

### Q: Are there any hidden costs beyond AI API charges?

**A:** Minimal.

- **GitHub Actions compute time:**
  - Public repos: Free
  - Private repos: 2,000 minutes/month free, then $0.008/minute
  - Typical workflow: 1-3 minutes = $0.008-0.024 per run (negligible)

- **Storage for logs/artifacts:**
  - 500 MB free, then $0.25/GB/month
  - Logs are small (< 10 MB/month typically)

**Total hidden costs:** < $1/month for most repositories.

### Q: Can I use different engines for different workflows?

**A:** Yes! This is a cost optimization strategy.

**Example:**

- Issue triage → Copilot CLI (free)
- Documentation sync → Claude Sonnet (good balance)
- Large refactoring → Claude Sonnet (200K context)

Just specify `engine:` in each workflow definition.

### Q: What's the trade-off between Claude and GPT-4?

**Cost:**

- Claude: $3 input / $15 output per 1M tokens (cheaper)
- GPT-4 Turbo: $10 input / $30 output per 1M tokens (2-3x more expensive)

**Performance:**

- Claude Sonnet 3.5: Excellent code understanding, larger context (200K)
- GPT-4 Turbo: Very good, slightly faster response times

**Recommendation:** Claude Sonnet 3.5 offers better value for most workflows. Use GPT-4 only if you have specific requirements (e.g., existing OpenAI infrastructure).

### Q: How do I optimize costs if I have multiple repositories?

**Strategies:**

1. **Use organization-level API keys** to track aggregate costs
2. **Prioritize high-value repos** (enable all workflows on critical projects, minimal workflows on low-activity repos)
3. **Share Serena cache** across repos (one-time analysis, multi-repo benefit)
4. **Standardize on one AI provider** to consolidate billing and get volume discounts

### Q: Can I negotiate volume discounts with AI providers?

**A:** Possibly, for large enterprises.

- **Anthropic:** Contact enterprise sales for custom pricing if spending > $1,000/month
- **OpenAI:** Enterprise pricing available for > $5,000/month spend
- **GitHub Copilot:** Volume discounts for > 500 seats (contact sales)

Most Power Platform teams won't reach these thresholds—typical spend is $20-100/month.

---

## Next Steps

Now that you understand costs and ROI:

1. ✅ **Choose your AI engine** - [API Keys Setup Guide](api-keys-setup.md)
2. ✅ **Set spending limits** on provider account
3. ✅ **Configure alerts** at 50%, 75%, 90% of budget
4. ✅ **Run cost calculator** weekly to monitor trends
5. ✅ **Track ROI metrics** - Hours saved, issues triaged, docs updated
6. ✅ **Share results** with finance/management to justify ongoing investment

**Questions?** See [FAQ](faq.md) or ask in [GitHub Discussions](https://github.com/aidevme/github-agentic-workflows-power-platform/discussions).

---

**Related Documentation:**

- [Getting Started Guide](getting-started.md)
- [API Keys Setup](api-keys-setup.md)
- [Security Architecture](architecture.md)
- [Troubleshooting](troubleshooting.md)

**External Links:**

- [Anthropic Pricing](https://www.anthropic.com/pricing)
- [OpenAI Pricing](https://openai.com/pricing)
- [GitHub Copilot Pricing](https://github.com/features/copilot)

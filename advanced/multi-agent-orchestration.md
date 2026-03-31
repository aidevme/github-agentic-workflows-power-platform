# Multi-Agent Orchestration

## Overview

Multi-agent orchestration allows you to run multiple AI agents in sequence or parallel within GitHub Agentic Workflows. This enables complex automation scenarios where different agents specialize in different tasks, creating sophisticated workflows that can handle multi-step processes intelligently.

## Table of Contents

- [Why Use Multiple Agents?](#why-use-multiple-agents)
- [Orchestration Patterns](#orchestration-patterns)
- [Implementation Examples](#implementation-examples)
- [Agent Communication](#agent-communication)
- [Error Handling & Retry Logic](#error-handling--retry-logic)
- [Performance Considerations](#performance-considerations)
- [Best Practices](#best-practices)

## Why Use Multiple Agents?

### Specialization
Different AI models and configurations excel at different tasks:
- **Triage agent**: Fast, cheap model (GPT-3.5) for initial classification
- **Analysis agent**: More powerful model (GPT-4, Claude) for deep analysis
- **Code review agent**: Specialized model with code-focused instructions
- **Documentation agent**: Model optimized for technical writing

### Resource Optimization
- Use cheaper models for simple tasks
- Reserve expensive models for complex analysis
- Parallel execution reduces total wait time

### Modular Design
- Each agent has focused, testable responsibility
- Easier to maintain and update individual agents
- Reusable agents across multiple workflows

### Failure Isolation
- One agent failing doesn't cascade to others
- Retry logic can be applied per-agent
- Graceful degradation when agents fail

## Orchestration Patterns

### 1. Sequential Pipeline

Agents run one after another, with each using the previous agent's output.

```yaml
---
name: Sequential Code Review Pipeline
on:
  pull_request:
    types: [opened, synchronize]

agents:
  - id: triage
    engine: gpt-3.5-turbo
    description: Quick classification of PR type
    
  - id: analysis
    engine: claude-sonnet-3.5
    depends-on: triage
    description: Deep analysis based on triage results
    
  - id: documentation
    engine: gpt-4-turbo
    depends-on: analysis
    description: Generate documentation updates
---

# Sequential Pipeline Instructions

## Agent 1: Triage (gpt-3.5-turbo)

Analyze the PR and classify it:
- Type: feature, bugfix, refactor, docs
- Complexity: low, medium, high
- Risk: low, medium, high

Output format:
```json
{
  "type": "feature",
  "complexity": "medium",
  "risk": "low"
}
```

---

## Agent 2: Analysis (claude-sonnet-3.5)

**Input from triage agent**: {{agents.triage.output}}

Based on the triage classification, perform detailed analysis:

- If complexity is "high" or risk is "high":
  - Review all changed files in detail
  - Check for security vulnerabilities
  - Validate test coverage
  
- If complexity is "low" and risk is "low":
  - Quick validation of code style
  - Check for obvious issues

Output safe-output: `add-comment` with analysis results

---

## Agent 3: Documentation (gpt-4-turbo)

**Input from analysis agent**: {{agents.analysis.output}}

Generate or update documentation based on:
- Code changes analyzed
- Issues found by analysis agent
- Type from triage agent

Update README.md sections if needed.
```

### 2. Parallel Fan-Out

Multiple agents run simultaneously on the same input.

```yaml
---
name: Parallel Security & Quality Checks
on:
  pull_request:
    types: [opened, synchronize]

agents:
  - id: security-scan
    engine: claude-sonnet-3.5
    parallel: true
    
  - id: code-quality
    engine: gpt-4-turbo
    parallel: true
    
  - id: performance-check
    engine: gpt-4-turbo
    parallel: true
    
  - id: aggregator
    engine: gpt-4-turbo
    depends-on: [security-scan, code-quality, performance-check]
---

# Parallel Analysis Workflow

## Agents 1-3: Run in Parallel

### Agent 1: Security Scan
Look for security vulnerabilities:
- SQL injection risks
- XSS vulnerabilities
- Authentication issues
- Secrets in code

### Agent 2: Code Quality
Evaluate code quality:
- Code smells
- Test coverage
- Code duplication
- Maintainability issues

### Agent 3: Performance Check
Identify performance issues:
- N+1 queries
- Inefficient algorithms
- Memory leaks
- Large bundle sizes

---

## Agent 4: Aggregator

**Input from all agents**:
- Security: {{agents.security-scan.output}}
- Quality: {{agents.code-quality.output}}
- Performance: {{agents.performance-check.output}}

Combine all findings into a single comprehensive report.
Post as PR comment with prioritized action items.
```

### 3. Conditional Branching

Different agents execute based on conditions.

```yaml
---
name: Conditional Workflow Routing
on:
  issues:
    types: [opened]

agents:
  - id: classifier
    engine: gpt-3.5-turbo
    
  - id: bug-handler
    engine: claude-sonnet-3.5
    depends-on: classifier
    condition: classifier.output.type == 'bug'
    
  - id: feature-handler
    engine: gpt-4-turbo
    depends-on: classifier
    condition: classifier.output.type == 'feature'
    
  - id: question-handler
    engine: gpt-3.5-turbo
    depends-on: classifier
    condition: classifier.output.type == 'question'
---

# Conditional Issue Handling

## Agent 1: Classifier

Classify the issue type. Output JSON:
```json
{
  "type": "bug|feature|question|documentation"
}
```

## Agent 2: Bug Handler (Conditional)
**Runs only if**: type == 'bug'

Apply bug label, request repro steps, assign to on-call engineer.

## Agent 3: Feature Handler (Conditional)
**Runs only if**: type == 'feature'

Apply feature label, add to backlog, request product owner review.

## Agent 4: Question Handler (Conditional)
**Runs only if**: type == 'question'

Convert to discussion, suggest documentation links.
```

### 4. Fan-In Aggregation

Multiple inputs merge into a single agent.

```yaml
---
name: Multi-Source Analysis
on:
  pull_request:
    types: [opened]

agents:
  - id: code-analyzer
    engine: claude-sonnet-3.5
    
  - id: test-analyzer
    engine: gpt-4-turbo
    
  - id: dependency-analyzer
    engine: gpt-3.5-turbo
    
  - id: aggregator
    engine: gpt-4-turbo
    depends-on: [code-analyzer, test-analyzer, dependency-analyzer]
    
  - id: decision-maker
    engine: gpt-4-turbo
    depends-on: aggregator
---

# Fan-In Aggregation Pattern

## Agents 1-3: Specialized Analyzers

Each agent analyzes a specific aspect:
- Code structure and quality
- Test coverage and quality
- Dependency security and updates

## Agent 4: Aggregator

Combine all analyses into structured data.

## Agent 5: Decision Maker

Based on aggregated data, decide:
- Auto-approve if all checks pass
- Request changes if critical issues found
- Auto-merge if low-risk and approved
```

## Implementation Examples

### Example 1: Two-Stage Code Review

```markdown
---
name: Two-Stage Code Review
on:
  pull_request:
    types: [opened, synchronize]

engine: gpt-4-turbo
timeout-minutes: 10

safe-outputs:
  add-comment: {}
  add-labels:
    allowed:
      - "needs-review"
      - "auto-approved"
      - "security-risk"
      - "breaking-change"
---

# Stage 1: Quick Triage (Fast Model)

Use GPT-3.5-turbo for quick classification:

{{#agent id="triage" engine="gpt-3.5-turbo" timeout="2m"}}

Classify this PR:

**Changed files**: {{pull_request.changed_files}}
**Lines changed**: +{{pull_request.additions}} -{{pull_request.deletions}}

Determine:
1. Risk level (low/medium/high)
2. Needs human review? (yes/no)
3. Category (feature/bugfix/refactor/docs)

Output JSON only:
```json
{
  "risk": "low|medium|high",
  "needs_review": true|false,
  "category": "feature|bugfix|refactor|docs"
}
```

{{/agent}}

---

# Stage 2: Detailed Review (Powerful Model)

{{#if triage.output.needs_review}}

**Triage Results**: {{triage.output}}

{{#agent id="detailed-review" engine="claude-sonnet-3.5" timeout="8m"}}

Perform comprehensive code review:

**PR Diff**:
```diff
{{pull_request.diff}}
```

**Triage Classification**: {{triage.output}}

Review focus areas based on risk level:
- High risk: Security, data integrity, breaking changes
- Medium risk: Code quality, test coverage, documentation
- Low risk: Style, minor improvements

Provide:
1. Security concerns (if any)
2. Code quality issues
3. Suggested improvements
4. Approval recommendation

Use `add-comment` to post detailed review.
{{/agent}}

{{else}}

PR looks good based on quick triage. Applying auto-approved label.

{{#safe-output add-labels}}
labels: ["auto-approved"]
{{/safe-output}}

{{/if}}
```

### Example 2: Multi-Language Support Detection

```markdown
---
name: Multi-Language Documentation
on:
  pull_request:
    paths:
      - 'src/**'

agents:
  - javascript-expert
  - python-expert
  - csharp-expert
---

# Language Detection & Routing

## Detect Changed Languages

{{#agent id="detector" engine="gpt-3.5-turbo"}}

Analyze changed files and detect programming languages:

{{#each pull_request.changed_files}}
- {{this.filename}}
{{/each}}

Output JSON array of detected languages:
```json
{
  "languages": ["javascript", "python", "csharp"]
}
```
{{/agent}}

---

## Language-Specific Analysis

{{#each detector.output.languages}}

{{#if this == "javascript"}}
{{#agent id="js-review" engine="claude-sonnet-3.5"}}
Review JavaScript files for:
- ESLint compliance
- React patterns
- Bundle size impact
{{/agent}}
{{/if}}

{{#if this == "python"}}
{{#agent id="py-review" engine="gpt-4-turbo"}}
Review Python files for:
- PEP 8 compliance
- Type hints
- Performance patterns
{{/agent}}
{{/if}}

{{#if this == "csharp"}}
{{#agent id="cs-review" engine="claude-sonnet-3.5"}}
Review C# files for:
- .NET best practices
- Async/await patterns
- LINQ usage
{{/agent}}
{{/if}}

{{/each}}
```

## Agent Communication

### Passing Data Between Agents

Agents can communicate through:

1. **Agent Output Variables**
   ```
   {{agents.triage.output}}
   {{agents.analyzer.output.findings}}
   ```

2. **Safe Outputs** (stored in GitHub)
   ```
   {{safe-outputs.add-comment.body}}
   ```

3. **GitHub Context**
   ```
   {{pull_request.title}}
   {{issue.body}}
   ```

### Structured Output Format

Use JSON for structured communication:

```markdown
{{#agent id="analyzer"}}
Output your findings as JSON:
```json
{
  "severity": "high|medium|low",
  "findings": [
    {"file": "app.js", "issue": "description", "line": 42}
  ],
  "summary": "Overall assessment"
}
```
{{/agent}}
```

Next agent can parse this:
```markdown
{{#agent id="reporter"}}
Based on analysis: {{analyzer.output}}

{{#if analyzer.output.severity == "high"}}
URGENT: Critical issues found!
{{/if}}
{{/agent}}
```

## Error Handling & Retry Logic

### Graceful Degradation

```yaml
---
name: Fault-Tolerant Pipeline
agents:
  - id: primary-agent
    engine: claude-sonnet-3.5
    retry: 3
    timeout: 5m
    
  - id: fallback-agent
    engine: gpt-4-turbo
    condition: primary-agent.failed
---

# Primary Analysis

{{#agent id="primary-agent"}}
Perform detailed analysis...
{{/agent}}

{{#if primary-agent.failed}}
# Fallback Analysis

{{#agent id="fallback-agent"}}
Primary agent failed. Performing simplified analysis...
{{/agent}}
{{/if}}
```

### Timeout Strategies

```yaml
agents:
  - id: quick-check
    timeout: 2m
    engine: gpt-3.5-turbo
    
  - id: deep-analysis
    timeout: 10m
    engine: claude-sonnet-3.5
    depends-on: quick-check
```

## Performance Considerations

### Parallel Execution

Run independent agents in parallel:

```yaml
agents:
  - id: security
    parallel: true
    
  - id: quality
    parallel: true
    
  - id: performance
    parallel: true
```

**Benefits**:
- 3x faster (3 agents in 5min vs 15min sequential)
- Better resource utilization
- Reduced total workflow time

### Cost vs Speed Trade-offs

| Pattern | Cost | Speed | Use Case |
|---------|------|-------|----------|
| Sequential GPT-3.5 | Low | Fast | Simple triage |
| Parallel GPT-4 | High | Very Fast | Critical PRs |
| Sequential mixed | Medium | Medium | Balanced approach |
| Conditional routing | Variable | Fast | Adaptive workflows |

## Best Practices

### 1. Start Cheap, Scale Up
```markdown
# Use cheap model first
{{#agent id="triage" engine="gpt-3.5-turbo"}}
Quick classification
{{/agent}}

# Only use expensive model if needed
{{#if triage.complexity == "high"}}
{{#agent id="deep-dive" engine="gpt-4-turbo"}}
Detailed analysis
{{/agent}}
{{/if}}
```

### 2. Clear Agent Responsibilities
Each agent should have ONE clear job:
- ✅ Triage agent: Classify only
- ✅ Security agent: Security only
- ❌ God agent: Everything (avoid!)

### 3. Structured Communication
Use JSON for agent-to-agent communication:
```json
{
  "status": "success",
  "data": {...},
  "next_action": "continue|stop|escalate"
}
```

### 4. Timeout Management
Set appropriate timeouts:
- Quick triage: 1-2 minutes
- Code analysis: 5-10 minutes
- Documentation: 3-5 minutes

### 5. Error Recovery
Always have a fallback:
```markdown
{{#agent id="primary"}}...{{/agent}}

{{#if primary.failed}}
{{#agent id="fallback"}}...{{/agent}}
{{/if}}
```

### 6. Monitor & Optimize
Track metrics:
- Agent execution time
- Token usage per agent
- Success/failure rates
- Total workflow duration

## Power Platform Use Cases

### Issue Triage Pipeline
1. **Quick classifier** (GPT-3.5): JavaScript/PCF/Plugin
2. **Specialist agent** (GPT-4): Deep analysis per type
3. **Documentation agent** (GPT-3.5): Update docs if needed

### PR Review Pipeline
1. **File analyzer** (GPT-3.5): Detect changed components
2. **Security scanner** (Claude): Check manifests, web resources
3. **Quality checker** (GPT-4): Code patterns, best practices
4. **Aggregator** (GPT-3.5): Combine findings

### Documentation Generator
1. **Change detector** (GPT-3.5): What changed?
2. **API documenter** (GPT-4): Generate JSDoc
3. **Example generator** (GPT-3.5): Create usage examples
4. **README updater** (GPT-3.5): Update main docs

## Troubleshooting

### Agents Not Running in Parallel
```yaml
# ❌ Wrong - sequential by default
agents:
  - id: agent1
  - id: agent2

# ✅ Correct - explicit parallel
agents:
  - id: agent1
    parallel: true
  - id: agent2
    parallel: true
```

### Agent Output Not Available
```markdown
# ❌ Wrong - typo in agent ID
{{agents.analizer.output}}

# ✅ Correct - exact ID match
{{agents.analyzer.output}}
```

### Timeout Issues
```yaml
# ❌ Wrong - default timeout too short
agents:
  - id: deep-analysis

# ✅ Correct - specify longer timeout
agents:
  - id: deep-analysis
    timeout: 10m
```

## Advanced Examples

See also:
- [Cost Optimization](cost-optimization.md) - Minimizing token usage
- [Custom Safe Outputs](custom-safe-outputs.md) - Creating reusable actions

## References

- [GitHub Agentic Workflows Documentation](https://github.github.com/gh-aw/)
- [Agent Configuration Reference](https://github.github.com/gh-aw/reference/agents/)
- [Parallel Execution Guide](https://github.github.com/gh-aw/guides/parallel-execution/)

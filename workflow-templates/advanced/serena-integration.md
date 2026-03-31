
# Serena Integration - Semantic Code Analysis

## Overview

Serena is GitHub's semantic code search and analysis engine integrated into Agentic Workflows. It provides AI-powered code understanding capabilities that go beyond simple text search, enabling agents to comprehend code semantics, relationships, and patterns across your entire codebase.

## Table of Contents

- [What is Serena?](#what-is-serena)
- [Capabilities](#capabilities)
- [Configuration](#configuration)
- [Query Syntax](#query-syntax)
- [Use Cases](#use-cases)
- [Power Platform Examples](#power-platform-examples)
- [Best Practices](#best-practices)
- [Performance Optimization](#performance-optimization)
- [Troubleshooting](#troubleshooting)

## What is Serena?

Serena is a semantic code search engine that:

- **Understands code semantics**: Not just keyword matching
- **Traces dependencies**: Follows function calls and imports
- **Analyzes patterns**: Identifies code smells and anti-patterns
- **Cross-references**: Links related code across files
- **Context-aware**: Understands programming language constructs

### Serena vs Traditional Search

| Feature | Traditional Search | Serena |
|---------|-------------------|---------|
| Keyword matching | ✅ | ✅ |
| Regex support | ✅ | ✅ |
| Semantic understanding | ❌ | ✅ |
| Dependency tracing | ❌ | ✅ |
| Pattern recognition | ❌ | ✅ |
| Context awareness | ❌ | ✅ |
| Cross-language analysis | ❌ | ✅ |

## Capabilities

### 1. Semantic Code Search

Find code by **what it does**, not just what it says:

```yaml
# Traditional search: Find "authentication"
grep: "authentication"

# Serena: Find authentication logic
serena: "code that handles user login and session management"
```

### 2. Dependency Analysis

Trace function calls and imports:

```yaml
serena:
  query: "Find all functions that call validateUser()"
  type: dependency-trace
```

### 3. Code Pattern Detection

Identify patterns without explicit rules:

```yaml
serena:
  query: "Find error handling patterns in async functions"
  type: pattern-analysis
```

### 4. Impact Analysis

Understand the impact of changes:

```yaml
serena:
  query: "What would break if I modify this API endpoint?"
  type: impact-analysis
  files: ["api/endpoints/user.js"]
```

## Configuration

### Basic Setup

```yaml
---
name: Workflow with Serena
on:
  pull_request:
    types: [opened]

tools:
  serena:
    enabled: true
    max-results: 50
    scope: repository
---

# Workflow Instructions

Use Serena to analyze code changes.
```

### Advanced Configuration

```yaml
tools:
  serena:
    enabled: true
    max-results: 100
    scope: repository
    languages: ["javascript", "typescript", "csharp"]
    exclude:
      - "node_modules/**"
      - "dist/**"
      - "*.min.js"
    index-priority: ["src/**", "lib/**"]
    cache-duration: 7d
```

## Query Syntax

### Natural Language Queries

```markdown
{{#serena "Find functions that handle file uploads"}}
Process results...
{{/serena}}
```

### Structured Queries

```yaml
serena:
  query: "error handling in async functions"
  language: typescript
  path: "src/**/*.ts"
  max-results: 20
```

### Multi-Criteria Search

```yaml
serena:
  find:
    - type: function
      name-pattern: "*Handler"
      has-parameter: "context"
    - type: class
      implements: "IFormHandler"
```

## Use Cases

### Use Case 1: Impact Analysis for PRs

```markdown
---
name: Impact Analysis
on:
  pull_request:
    types: [opened, synchronize]
---

# Analyze PR Impact

{{#agent id="impact-analyzer"}}

**Changed Files**: {{pull_request.changed_files}}

For each changed file, use Serena to find:

{{#serena}}
query: "Find all code that depends on {{file.name}}"
type: dependency-trace
max-results: 50
{{/serena}}

Analyze:
1. What functions/classes are affected?
2. Are there any breaking changes?
3. Which tests need to be updated?

Report findings:
- Direct dependencies: X files
- Indirect dependencies: Y files
- Potential breaking changes: Z locations

{{/agent}}
```

### Use Case 2: Security Vulnerability Detection

```markdown
---
name: Security Scan
on:
  pull_request:
    types: [opened]
---

# Security Analysis with Serena

{{#agent id="security-scanner"}}

Use Serena to find security issues:

## SQL Injection Risks
{{#serena "code that constructs SQL queries from user input"}}
Found {{results.length}} potential SQL injection risks:
{{#each results}}
- {{this.file}}:{{this.line}} - {{this.snippet}}
{{/each}}
{{/serena}}

## XSS Vulnerabilities
{{#serena "code that renders user-provided HTML without sanitization"}}
Found {{results.length}} potential XSS vulnerabilities:
{{#each results}}
- {{this.file}}:{{this.line}}
{{/each}}
{{/serena}}

## Hardcoded Secrets
{{#serena "hardcoded API keys, passwords, or tokens"}}
Found {{results.length}} potential hardcoded secrets:
{{#each results}}
- ⚠️ {{this.file}}:{{this.line}}
{{/each}}
{{/serena}}

Create security report using `add-comment` safe output.

{{/agent}}
```

### Use Case 3: Code Quality Review

```markdown
---
name: Code Quality Check
on:
  pull_request:
    types: [opened]
---

# Code Quality Analysis

{{#agent id="quality-checker"}}

## Anti-Patterns

{{#serena "Find callback hell patterns (deeply nested callbacks)"}}
Nested callbacks found: {{results.length}}
{{/serena}}

{{#serena "Find duplicate code blocks"}}
Duplicate code: {{results.length}} instances
{{/serena}}

{{#serena "Find functions with excessive parameters (>5)"}}
Complex functions: {{results.length}}
{{/serena}}

## Best Practices

{{#serena "Find async functions without error handling"}}
Missing error handling: {{results.length}}
{{/serena}}

{{#serena "Find console.log or debugger statements"}}
Debug statements remaining: {{results.length}}
{{/serena}}

Report findings with severity ratings.

{{/agent}}
```

### Use Case 4: Documentation Gap Analysis

```markdown
---
name: Documentation Check
on:
  pull_request:
    types: [opened]
---

# Documentation Analysis

{{#agent id="doc-checker"}}

{{#serena "Find public functions without JSDoc comments"}}
Undocumented functions: {{results.length}}

{{#each results}}
### {{this.function_name}} ({{this.file}}:{{this.line}})
Missing documentation.

Suggested JSDoc:
```javascript
/**
 * [Infer purpose from function name and parameters]
 * @param {{this.parameters}}
 * @returns {{this.return_type}}
 */
```
{{/each}}

{{/serena}}

Use `add-comment` to suggest documentation improvements.

{{/agent}}
```

## Power Platform Examples

### Example 1: PCF Component Dependency Analysis

```markdown
---
name: PCF Dependency Checker
on:
  pull_request:
    paths:
      - 'pcf-components/**'
---

# PCF Component Analysis

{{#agent id="pcf-analyzer"}}

## Analyze PCF Component Changes

Changed files: {{pull_request.changed_files}}

### Find Component Dependencies

{{#serena}}
query: "Find all PCF controls that import or use {{changed_component_name}}"
language: typescript
path: "pcf-components/**/*.tsx"
type: dependency-trace
{{/serena}}

Results:
- Total dependent components: {{results.length}}
- Breaking change risk: {{risk_level}}

### Check Fluent UI Usage

{{#serena "Find all uses of deprecated Fluent UI v8 components"}}
Deprecated components found: {{results.length}}

Suggested migrations:
{{#each results}}
- {{this.file}}: Replace {{this.old_component}} with {{this.new_component}}
{{/each}}
{{/serena}}

### Verify Control Manifest

{{#serena "Find ControlManifest.Input.xml files and check for required properties"}}
Manifest validation:
{{#each results}}
- {{this.file}}: {{this.validation_status}}
{{/each}}
{{/serena}}

{{/agent}}
```

### Example 2: Dataverse Web Resource Analysis

```markdown
---
name: Web Resource Review
on:
  pull_request:
    paths:
      - 'webresources/**/*.js'
---

# Web Resource Quality Check

{{#agent id="webresource-checker"}}

## Form Script Analysis

{{#serena "Find form scripts that don't check for null executionContext"}}
Missing null checks: {{results.length}}

{{#each results}}
⚠️ {{this.file}}:{{this.line}}
```javascript
{{this.code_snippet}}
```
Recommendation: Add null check before calling getFormContext()
{{/each}}
{{/serena}}

## API Version Usage

{{#serena "Find Xrm API calls and their versions"}}
API usage analysis:
{{#each results}}
- {{this.api_method}}: Used in {{this.count}} locations
  - Deprecated: {{this.is_deprecated}}
  - Recommended version: {{this.recommended_version}}
{{/each}}
{{/serena}}

## Performance Issues

{{#serena "Find synchronous XMLHttpRequest calls"}}
Synchronous XHR (deprecated): {{results.length}}
{{#each results}}
- {{this.file}}:{{this.line}} - Should use Xrm.WebApi or fetch()
{{/each}}
{{/serena}}

{{/agent}}
```

### Example 3: Plugin Code Analysis

```markdown
---
name: Plugin Code Review
on:
  pull_request:
    paths:
      - 'plugins/**/*.cs'
---

# Dynamics 365 Plugin Analysis

{{#agent id="plugin-analyzer"}}

## Transaction Handling

{{#serena "Find plugin code that doesn't use transactions"}}
Missing transaction handling: {{results.length}}
{{/serena}}

## Error Handling

{{#serena "Find plugin Execute methods without try-catch"}}
Missing error handling: {{results.length}}

{{#each results}}
⚠️ {{this.file}}:{{this.line}}
Add proper exception handling:
```csharp
try {
    // Plugin logic
} catch (InvalidPluginExecutionException) {
    throw;
} catch (Exception ex) {
    throw new InvalidPluginExecutionException($"Error: {ex.Message}", ex);
}
```
{{/each}}
{{/serena}}

## IOrganizationService Usage

{{#serena "Find plugin code that calls IOrganizationService.Create/Update in a loop"}}
N+1 query patterns: {{results.length}}

Optimization recommendations:
{{#each results}}
- {{this.file}}:{{this.line}}: Use ExecuteMultipleRequest for batch operations
{{/each}}
{{/serena}}

## Security Checks

{{#serena "Find plugins that don't validate caller privileges"}}
Missing security checks: {{results.length}}
{{/serena}}

{{/agent}}
```

### Example 4: Model-Driven App Configuration

```markdown
---
name: App Configuration Review
on:
  pull_request:
    paths:
      - 'solutions/**/*.xml'
---

# Model-Driven App Configuration Analysis

{{#agent id="config-analyzer"}}

## Form Customizations

{{#serena "Find form XML with custom JavaScript libraries"}}
Forms with JavaScript:
{{#each results}}
- {{this.entity}}.{{this.form_name}}
  - Libraries: {{this.libraries}}
  - Events: {{this.events}}
{{/each}}
{{/serena}}

## Ribbon Customizations

{{#serena "Find ribbon customizations with command definitions"}}
Ribbon buttons: {{results.length}}

Validate:
{{#each results}}
- {{this.button_id}}
  - JavaScriptFunction: {{this.function}} (exists: {{this.function_exists}})
  - EnableRule: {{this.enable_rule}}
{{/each}}
{{/serena}}

## Web Resources Referenced

{{#serena "Find all web resource references in solution XML"}}
Web resources: {{results.length}}

Check if all exist:
{{#each results}}
- {{this.name}}: {{this.exists ? "✅" : "❌ Missing"}}
{{/each}}
{{/serena}}

{{/agent}}
```

## Best Practices

### 1. Scope Your Queries

```markdown
# ❌ Too broad
{{#serena "Find functions"}}

# ✅ Specific and scoped
{{#serena}}
query: "Find async functions with error handling"
path: "src/api/**/*.ts"
max-results: 20
{{/serena}}
```

### 2. Use Type Hints

```markdown
{{#serena}}
query: "authentication logic"
type: semantic-search
languages: ["typescript", "javascript"]
include-comments: true
{{/serena}}
```

### 3. Combine with Agent Analysis

```markdown
{{#agent id="analyzer"}}

{{#serena "security vulnerabilities"}}
{{#each results}}
Analyze: {{this.file}}:{{this.line}}
Context: {{this.code_snippet}}
{{/each}}
{{/serena}}

Provide security assessment for each finding.

{{/agent}}
```

### 4. Cache Results

```markdown
{{#serena cache-key="dependency-graph"}}
query: "Build dependency graph"
cache-duration: 24h
{{/serena}}
```

### 5. Limit Result Sets

```markdown
{{#serena}}
query: "all functions"
max-results: 50
pagination: true
{{/serena}}
```

## Performance Optimization

### Indexing Strategies

```yaml
tools:
  serena:
    index-strategy: incremental
    index-schedule: "0 2 * * *"  # Daily at 2 AM
    index-on-push: true
    priority-paths:
      - "src/**"
      - "lib/**"
    exclude-paths:
      - "node_modules/**"
      - "dist/**"
      - "coverage/**"
```

### Query Optimization

```markdown
# Slow: Full repo scan
{{#serena "find all functions"}}

# Fast: Targeted search
{{#serena}}
query: "authentication functions"
path: "src/auth/**"
file-pattern: "*.ts"
{{/serena}}
```

### Caching

```markdown
{{#serena}}
query: "dependency graph"
cache: true
cache-key: "deps-{{git.commit}}"
cache-ttl: 3600
{{/serena}}
```

## Troubleshooting

### Serena Not Available

**Symptom**: `serena: command not found`

**Solution**:
```yaml
tools:
  serena:
    enabled: true  # Must be explicitly enabled
```

### No Results Found

**Symptom**: Serena returns empty results

**Causes**:
1. Repository not indexed yet
2. Query too specific
3. Files excluded by configuration

**Solutions**:
- Wait for initial indexing (can take 5-10 minutes)
- Broaden your query
- Check `exclude-paths` configuration

### Slow Performance

**Symptom**: Serena queries take >30 seconds

**Solutions**:
1. Add file path filters
2. Use language filters
3. Reduce `max-results`
4. Enable caching

```markdown
{{#serena}}
query: "your query"
path: "specific/directory/**"  # Add this
language: "typescript"          # And this
max-results: 25                 # Reduce this
cache: true                     # Enable this
{{/serena}}
```

### Inaccurate Results

**Symptom**: Serena returns irrelevant code

**Solutions**:
1. Use more specific natural language
2. Add context keywords
3. Use type hints
4. Filter by language

```markdown
# ❌ Vague
{{#serena "functions"}}

# ✅ Specific
{{#serena "async functions that make HTTP requests to external APIs"}}
```

## Advanced Features

### Cross-Repository Search

```yaml
tools:
  serena:
    scope: organization
    repositories:
      - "org/repo1"
      - "org/repo2"
    search-private: true
```

### Historical Analysis

```markdown
{{#serena}}
query: "authentication code"
ref: "v1.0.0"  # Search in specific commit/tag
{{/serena}}
```

### Pattern-Based Refactoring

```markdown
{{#serena}}
query: "Find instances of deprecated pattern X"
suggest-refactoring: true
{{/serena}}
```

## API Reference

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string | Natural language or technical query |
| `type` | string | `semantic-search`, `dependency-trace`, `pattern-analysis`, `impact-analysis` |
| `path` | string | File path filter (glob pattern) |
| `language` | string | Programming language filter |
| `max-results` | number | Maximum results to return |
| `include-comments` | boolean | Include code comments in search |
| `include-tests` | boolean | Include test files |
| `cache` | boolean | Enable result caching |
| `cache-key` | string | Custom cache key |
| `cache-ttl` | number | Cache time-to-live (seconds) |

## References

- [GitHub Code Search Documentation](https://docs.github.com/code-search)
- [Agentic Workflows Serena Integration](https://github.github.com/gh-aw/tools/serena/)
- [Semantic Code Analysis Best Practices](https://github.github.com/gh-aw/guides/semantic-analysis/)

## See Also

- [Multi-Agent Orchestration](multi-agent-orchestration.md)
- [Cost Optimization](cost-optimization.md)
- [Custom Safe Outputs](custom-safe-outputs.md)

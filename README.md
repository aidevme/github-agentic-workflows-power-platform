# GitHub Agentic Workflows for Power Platform

> **Tutorial repository demonstrating AI-powered continuous development workflows for Power Platform projects**

[![GitHub Agentic Workflows](https://img.shields.io/badge/GitHub-Agentic%20Workflows-blue?logo=github)](https://github.blog/news-insights/product-news/github-agentic-workflows/)
[![Power Platform](https://img.shields.io/badge/Power%20Platform-PCF%20%7C%20Dataverse%20%7C%20Canvas-purple)](https://powerplatform.microsoft.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## 🚀 What Are GitHub Agentic Workflows?

**GitHub Agentic Workflows** (technical preview, February 2026) are AI agents that run directly in GitHub Actions to automate repository maintenance tasks. Unlike traditional CI/CD, these agents use **Claude Code**, **GitHub Copilot CLI**, or **OpenAI Codex** to understand your codebase semantically and make intelligent decisions.

**Key capabilities:**
- 🏷️ **Continuous Triage** — Auto-label and respond to issues
- 📚 **Continuous Documentation** — Keep docs in sync with code
- ♻️ **Continuous Simplification** — Detect and refactor duplicate code
- 🧪 **Continuous Test Improvement** — Generate and enhance tests
- 🔧 **Continuous Quality Hygiene** — Investigate CI failures
- 📊 **Continuous Reporting** — Weekly repository health reports

## ✨ Why This Repository?

This tutorial repository provides **production-ready workflow examples** and **7 sample Power Platform repositories** to help you:

✅ **Learn by doing** — Clone sample repos and see agents in action  
✅ **Adapt to your needs** — Modify workflows for your team's conventions  
✅ **Understand security** — See guardrails, permissions, and safe outputs  
✅ **Measure ROI** — Use proven workflows with 79-96% merge rates  

## 📁 Repository Structure

```
github-agentic-workflows-power-platform/
│
├── docs/                           # Comprehensive guides
│   ├── getting-started.md          # Quick start setup
│   ├── architecture.md             # Security architecture deep dive
│   ├── api-keys-setup.md           # Copilot/Claude/Codex configuration
│   ├── cost-management.md          # Token usage and monitoring
│   └── troubleshooting.md          # Common issues
│
├── workflows/                      # 6 workflow categories
│   ├── 01-continuous-triage/
│   ├── 02-continuous-documentation/
│   ├── 03-continuous-simplification/
│   ├── 04-continuous-test-improvement/
│   ├── 05-continuous-quality-hygiene/
│   └── 06-continuous-reporting/
│
├── sample-repos/                   # 7 Power Platform sample repos
│   ├── pcf-control-library/
│   ├── dataverse-plugin-library/
│   ├── canvas-app-repository/
│   ├── power-automate-connectors/
│   ├── dataverse-webresource-library/
│   ├── power-apps-code-apps/
│   └── azure-function-library/
│
├── scripts/                        # Setup and validation tools
│   ├── setup-gh-aw.ps1
│   ├── validate-workflow.ps1
│   └── token-cost-calculator.ps1
│
└── templates/                      # Reusable templates
    ├── workflow-template.md
    └── issue-template-triage.md
```

## 🎯 Sample Repositories

Each sample repository demonstrates multiple agentic workflows in context:

### 1. 🎨 [PCF Control Library](./sample-repos/pcf-control-library/)
- **Tech Stack:** TypeScript, React, Fluent UI v9, pcf-scripts
- **Workflows:** Issue triage, doc sync, test generation, build failure analysis
- **Use Case:** Component framework controls for Canvas/Model-Driven Apps

### 2. 🔌 [Dataverse Plugin Library](./sample-repos/dataverse-plugin-library/)
- **Tech Stack:** C#, Dataverse SDK, XUnit
- **Workflows:** Code simplification, duplicate detection, semantic analysis
- **Use Case:** Server-side business logic for Dataverse entities

### 3. 📱 [Canvas App Repository](./sample-repos/canvas-app-repository/)
- **Tech Stack:** Power Fx, Canvas Apps, Custom Connectors
- **Workflows:** Issue triage, component documentation, dependency monitoring
- **Use Case:** Low-code apps with version control

### 4. 🔗 [Power Automate Custom Connectors](./sample-repos/power-automate-connectors/)
- **Tech Stack:** OpenAPI, JSON, Power Automate
- **Workflows:** API doc sync, health reporting, test improvement
- **Use Case:** Custom connectors for third-party integrations

### 5. 🌐 [Dataverse Web Resource Library](./sample-repos/dataverse-webresource-library/)
- **Tech Stack:** JavaScript, Xrm API, JSDoc, Jest
- **Workflows:** Code quality, JSDoc sync, deprecated API detection, duplicate patterns
- **Use Case:** Client-side form scripts, ribbon actions, shared libraries

### 6. ⚡ [Power Apps Code-First Apps](./sample-repos/power-apps-code-apps/)
- **Tech Stack:** Power Apps CLI, YAML, Power Fx formulas
- **Workflows:** Formula analyzer, delegation warnings, performance optimization
- **Use Case:** Code-first Canvas Apps with component libraries

### 7. ☁️ [Azure Function Library](./sample-repos/azure-function-library/)
- **Tech Stack:** C#/Node.js/TypeScript, Azure Functions, Dataverse integration
- **Workflows:** Performance monitoring, security audits, cost optimization, API doc generation
- **Use Case:** Backend logic for Power Platform (webhooks, custom APIs, Canvas backends)

## 🏁 Quick Start

### Prerequisites

- **GitHub CLI** (v2.40.0+) — Install from [cli.github.com](https://cli.github.com)
- **Power Platform CLI** (optional, for deploying sample PCF/plugins) — [Microsoft.PowerApps.CLI](https://learn.microsoft.com/power-platform/developer/cli/introduction)
- **API Keys** — At least one of:
  - `COPILOT_GITHUB_TOKEN` — [GitHub Copilot](https://github.com/features/copilot)
  - `ANTHROPIC_API_KEY` — [Anthropic Claude](https://console.anthropic.com)
  - `OPENAI_API_KEY` — [OpenAI Platform](https://platform.openai.com)

### 1. Install GitHub CLI Agentic Workflows Extension

```bash
gh extension install github/gh-aw
gh aw version
```

### 2. Clone a Sample Repository

```bash
# Clone the PCF Control Library sample
cd sample-repos/pcf-control-library

# Review the workflow definitions
ls agentic-workflows/
```

### 3. Compile Workflow to GitHub Actions YAML

```bash
# Compile the issue triage workflow
gh aw compile agentic-workflows/pcf-issue-triage.md

# Output: .github/workflows/issue-triage.yml
```

### 4. Configure API Keys

Create repository secrets in your GitHub repository:

```bash
# Using GitHub Copilot CLI (recommended)
gh secret set COPILOT_GITHUB_TOKEN

# OR using Anthropic Claude
gh secret set ANTHROPIC_API_KEY

# OR using OpenAI Codex
gh secret set OPENAI_API_KEY
```

### 5. Test the Workflow

Open a test issue in your repository:

```bash
gh issue create --title "Test: Button not rendering" --body "The submit button doesn't appear on the form."
```

The agentic workflow will:
1. Read the issue content
2. Search your codebase for relevant files
3. Apply appropriate labels (`bug`, `needs-info`, etc.)
4. Leave a helpful comment with context and suggestions

## 📖 Workflow Categories

### 1. Continuous Triage
Auto-classify and respond to new issues with context-aware labels and diagnostic guidance.

**Example workflows:**
- [PCF Issue Triage](./workflows/01-continuous-triage/pcf-issue-triage.md)
- [Dataverse Plugin Triage](./workflows/01-continuous-triage/dataverse-issue-triage.md)
- [Canvas App Triage](./workflows/01-continuous-triage/canvas-app-triage.md)

**Merge rates:** 96% (doc triage), 79% (duplicate detector)

### 2. Continuous Documentation
Automatically update documentation when code changes, keeping API docs, READMEs, and glossaries in sync.

**Example workflows:**
- [PCF Doc Updater](./workflows/02-continuous-documentation/pcf-doc-updater.md) — Syncs TypeScript interfaces to Markdown API docs
- [Dataverse Schema Docs](./workflows/02-continuous-documentation/dataverse-schema-docs.md) — Updates entity schema documentation
- [Glossary Maintainer](./workflows/02-continuous-documentation/glossary-maintainer.md) — Keeps technical glossary current

**Merge rates:** 100% (glossary), 96% (doc updater)

### 3. Continuous Simplification
Detect duplicate code patterns, consolidate repeated logic, and suggest refactoring opportunities.

**Example workflows:**
- [PCF Code Simplifier](./workflows/03-continuous-simplification/pcf-code-simplifier.md)
- [Plugin Duplicate Detector](./workflows/03-continuous-simplification/plugin-duplicate-detector.md)
- [Fluent UI Pattern Consolidator](./workflows/03-continuous-simplification/fluent-ui-pattern-consolidator.md)

**Merge rates:** 85% (unbloat), 83% (code simplifier)

### 4. Continuous Test Improvement
Generate unit tests for new code, improve test coverage, and suggest integration test scenarios.

**Example workflows:**
- [PCF Test Generator](./workflows/04-continuous-test-improvement/pcf-test-generator.md)
- [Plugin Test Enhancer](./workflows/04-continuous-test-improvement/plugin-test-enhancer.md)

### 5. Continuous Quality Hygiene
Investigate CI/CD failures, audit dependencies, and maintain build health.

**Example workflows:**
- [ALM Pipeline Doctor](./workflows/05-continuous-quality-hygiene/alm-pipeline-doctor.md)
- [Build Failure Analyzer](./workflows/05-continuous-quality-hygiene/build-failure-analyzer.md)
- [Dependency Auditor](./workflows/05-continuous-quality-hygiene/dependency-auditor.md)

### 6. Continuous Reporting
Generate weekly repository health reports, ALM metrics dashboards, and PR review latency tracking.

**Example workflows:**
- [Weekly Health Reporter](./workflows/06-continuous-reporting/weekly-health-reporter.md)
- [ALM Metrics Dashboard](./workflows/06-continuous-reporting/alm-metrics-dashboard.md)

## 🔒 Security Architecture

All workflows follow **security-first principles**:

### 1. Principle of Least Privilege
Agents request only the permissions they need:
```yaml
permissions:
  issues: write      # Can label/comment on issues
  contents: read     # Read-only code access
  pull-requests: write  # Can create PRs (not merge)
```

### 2. Read-Only by Default
Agents cannot:
- ❌ Merge pull requests
- ❌ Delete branches
- ❌ Modify GitHub Actions workflows
- ❌ Access repository secrets
- ❌ Push directly to protected branches

### 3. Safe Outputs
Only pre-approved actions allowed:
```yaml
safe-outputs:
  add-labels:
    allowed-labels: [bug, feature-request, needs-info]
  add-comment: {}
  create-pull-request:
    target-branch: main
```

### 4. Human Review Gates
All agent changes require:
- ✅ Pull request review before merge
- ✅ CI/CD validation (tests, builds)
- ✅ CODEOWNERS approval for sensitive paths

### 5. Network Isolation
Agents run in sandboxed GitHub Actions environments with:
- No access to production environments
- No direct database connections
- No outbound network calls (except approved APIs)

**Learn more:** [docs/architecture.md](./docs/architecture.md)

## 💰 Cost Management

### Token Usage Estimates

| Workflow Category | Avg Tokens/Run | Est. Cost (Claude Sonnet 3.5) | Est. Cost (GPT-4) |
|-------------------|----------------|-------------------------------|-------------------|
| Issue Triage      | 2,000-5,000    | $0.01-$0.03                   | $0.06-$0.15       |
| Documentation Sync| 5,000-15,000   | $0.03-$0.09                   | $0.15-$0.45       |
| Code Simplification| 10,000-30,000 | $0.06-$0.18                   | $0.30-$0.90       |
| Test Generation   | 8,000-20,000   | $0.05-$0.12                   | $0.24-$0.60       |
| CI Investigation  | 15,000-40,000  | $0.09-$0.24                   | $0.45-$1.20       |

**Monthly estimate for active repository:**
- ~100 issues/month × $0.02 = $2.00
- ~50 doc syncs/month × $0.06 = $3.00
- ~20 code simplification runs/month × $0.12 = $2.40
- ~10 CI investigations/month × $0.18 = $1.80
- **Total: ~$9-15/month** for comprehensive automation

**Cost optimization tips:**
- Use `timeout-minutes: 5` to prevent runaway costs
- Cache codebase understanding with Serena semantic analysis
- Schedule reporting workflows weekly, not daily
- Monitor token usage with [scripts/token-cost-calculator.ps1](./scripts/token-cost-calculator.ps1)

**Learn more:** [docs/cost-management.md](./docs/cost-management.md)

## 📊 Production Metrics

Real-world merge rates from GitHub's internal usage (February 2026):

| Workflow | Merge Rate | PRs Created | Description |
|----------|------------|-------------|-------------|
| Documentation Updater | 96% | 142 | Syncs code changes to docs |
| Glossary Maintainer | 100% | 38 | Updates technical glossary |
| Unbloat | 85% | 67 | Removes obsolete code |
| Duplicate Detector | 79% | 94 | Finds repeated patterns |
| Code Simplifier | 83% | 52 | Refactors complex logic |

**Key takeaway:** Agentic workflows achieve 79-100% merge rates with minimal human intervention.

## 🛠️ Advanced Topics

### Multi-Agent Orchestration
Run multiple agents in sequence or parallel:
- [workflows/advanced/multi-agent-orchestration.md](./workflows/advanced/multi-agent-orchestration.md)

### Custom Safe Outputs
Define new agent actions beyond standard GitHub operations:
- [workflows/advanced/custom-safe-outputs.md](./workflows/advanced/custom-safe-outputs.md)

### Serena Integration
Use Serena semantic analysis toolkit for deeper codebase understanding:
- [workflows/advanced/serena-integration.md](./workflows/advanced/serena-integration.md)
- [Serena Toolkit Documentation](https://oraios.github.io/serena/)

### Cost Optimization Strategies
Reduce token usage while maintaining quality:
- [workflows/advanced/cost-optimization.md](./workflows/advanced/cost-optimization.md)

## 🤝 Contributing

Contributions are welcome! Please:

1. **Test workflows thoroughly** before submitting PRs
2. **Follow security best practices** (least privilege, safe outputs)
3. **Document token usage** for new workflows
4. **Include example outputs** in workflow documentation
5. **Update relevant sample repositories** if adding new features

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📚 Additional Resources

### Official Documentation
- [GitHub Agentic Workflows Announcement](https://github.blog/news-insights/product-news/github-agentic-workflows/)
- [github/gh-aw Repository](https://github.com/github/gh-aw)
- [Power Platform Developer Docs](https://learn.microsoft.com/power-platform/developer/)

### Related Tools
- [Serena Semantic Analysis Toolkit](https://oraios.github.io/serena/)
- [Power Platform CLI](https://learn.microsoft.com/power-platform/developer/cli/introduction)
- [PCF Tools (pcf-scripts)](https://learn.microsoft.com/power-apps/developer/component-framework/implementing-controls-using-typescript)

### Community
- [Power Platform Community](https://powerusers.microsoft.com/)
- [GitHub Discussions](https://github.com/aidevme/github-agentic-workflows-power-platform/discussions)

## 📄 License

This repository is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

## 🌟 Star This Repository

If GitHub Agentic Workflows help your Power Platform development, please **⭐ star this repository** to help others discover it!

---

**Built with ❤️ by the Power Platform community**

**Maintained by:** [AI Dev Me](https://aidevme.com)  
**Blog Article:** [GitHub Agentic Workflows: The Next Evolution of Repository Automation](https://aidevme.com/github-agentic-workflows-power-platform)  
**Questions?** Open a [Discussion](https://github.com/aidevme/github-agentic-workflows-power-platform/discussions) or [Issue](https://github.com/aidevme/github-agentic-workflows-power-platform/issues)

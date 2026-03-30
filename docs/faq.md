# Frequently Asked Questions (FAQ)

**Last Updated:** March 30, 2026  
**For:** Developers, team leads, security officers, managers

## Table of Contents

- [General Questions](#general-questions)
- [Setup & Requirements](#setup--requirements)
- [Cost Questions](#cost-questions)
- [Security & Compliance](#security--compliance)
- [Power Platform-Specific Questions](#power-platform-specific-questions)
- [Workflow Behavior](#workflow-behavior)
- [Customization & Advanced Usage](#customization--advanced-usage)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)
- [Comparison to Other Tools](#comparison-to-other-tools)
- [Future / Roadmap](#future--roadmap)
- [Getting Started](#getting-started)

---

## General Questions

### Q: What are GitHub Agentic Workflows?

**A:** AI-powered agents that run in GitHub Actions to automate repository maintenance tasks. They use large language models (GitHub Copilot, Claude, GPT-4) to understand code semantically and make intelligent decisions like triaging issues, updating documentation, and suggesting refactorings.

**Key capabilities:**
- Automatically label and triage issues
- Keep documentation in sync with code changes
- Identify simplification opportunities in complex code
- Investigate CI/CD failures and suggest fixes
- Generate regression tests from bug reports

**Example:** When a user opens an issue titled "DatePicker crashes on February 29th", the agent reads the issue, searches for the DatePicker component, analyzes the code, applies labels (`bug`, `pcf-datepicker`), and adds a comment with initial triage findings.

---

### Q: How are agentic workflows different from traditional CI/CD?

**A:** Traditional CI/CD executes predefined scripts. Agentic workflows use AI to make decisions based on context.

| Traditional CI/CD | Agentic Workflows |
|-------------------|-------------------|
| Runs unit tests | Analyzes test failures, identifies root causes, suggests fixes |
| Checks code style | Refactors code for readability and maintainability |
| Deploys on merge | (Still requires human approval for deploys) |
| Fixed rules | Adapts to context and nuance |

**Example:** A traditional CI/CD script might fail and report "12 tests failed". An agentic workflow investigates *why*, discovers a breaking API change, identifies affected components, and creates a PR with migration code.

---

### Q: Are these official Microsoft tools?

**A:** No, but related. GitHub Agentic Workflows are a **GitHub** (Microsoft-owned) product in technical preview (as of February 2026). They integrate well with Power Platform development but are not part of the Power Platform product suite itself.

**Relationship:**
- **GitHub** → Owned by Microsoft, provides Agentic Workflows
- **Power Platform** → Microsoft product, benefits from workflows
- **Integration** → Unofficial but highly compatible

---

### Q: Do I need to know AI/ML to use agentic workflows?

**A:** No. You write instructions in plain English (Markdown files), and the AI handles the implementation. Basic GitHub Actions knowledge is helpful but not required.

**What you write:**
```markdown
# Task
When an issue is opened, classify it as bug, enhancement, or needs-info.
Apply the appropriate label.
```

**What the AI does:**
- Reads the issue semantically
- Searches related code files
- Analyzes context
- Applies labels based on understanding

**No Python, JavaScript, or AI expertise needed.**

---

### Q: How mature is this technology?

**A:** Technical preview (as of March 2026). GitHub has been using it internally with high success rates (79-96% merge rates), but it's still evolving.

**Maturity indicators:**
- ✅ Used in production by GitHub engineering teams
- ✅ High success rates on real repositories
- ✅ Robust security model
- ⚠️ API may change before GA
- ⚠️ Some edge cases still being addressed
- ⚠️ Limited to GitHub ecosystem (not multi-platform)

**Recommendation:** Safe for non-critical workflows (issue triage, docs). Use with caution for production code changes. Expect breaking changes before general availability.

---

### Q: What can't agentic workflows do?

**A:** By design (for security):
- ❌ Cannot merge pull requests (requires human approval)
- ❌ Cannot delete branches or repositories
- ❌ Cannot access GitHub Secrets
- ❌ Cannot deploy to production systems
- ❌ Cannot modify workflow configurations (prevents self-modification)
- ❌ Cannot learn from past runs (stateless execution)

**Technical limitations:**
- ❌ Cannot execute compiled code or run tests (reads code statically)
- ❌ Context window limits (~500KB-800KB code per workflow run)
- ❌ May hallucinate or make mistakes (human review required)

See [Troubleshooting Guide - Known Limitations](troubleshooting.md#known-issues--limitations) for complete list.

---

## Setup & Requirements

### Q: What do I need to get started?

**A:** Four things:

**1. GitHub CLI** (v2.40.0+)
```bash
# Windows
winget install GitHub.cli

# macOS
brew install gh

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
```

**2. One AI engine:**
- **GitHub Copilot subscription** ($10-19/month), OR
- **Anthropic API key** (Claude, pay-as-you-go), OR
- **OpenAI API key** (GPT-4, pay-as-you-go)

**3. A GitHub repository** (public or private)

**4. Time:** 30-45 minutes for first-time setup

**Complete setup guide:** [Getting Started Guide](getting-started.md)

---

### Q: Can I use this with private repositories?

**A:** Yes. Agentic workflows work with both public and private repositories.

**Considerations:**
- **GitHub Actions minutes:** Free for public repos; limited for private (2,000-3,000/month on free tier)
- **API costs:** Same whether repo is public or private
- **Security:** Private repos add another layer of protection for sensitive code

**Cost for private repo:**
- GitHub Actions: ~$0-4/month (depends on workflow run frequency)
- AI provider: $2-120/month (depends on activity)

---

### Q: Do I need a paid GitHub account?

**A:** Not necessarily.

**For public repositories:**
- GitHub Free account works fine
- Unlimited GitHub Actions minutes
- No additional GitHub costs

**For private repositories:**
- GitHub Free/Pro/Team/Enterprise all work
- Beware GitHub Actions minutes limits:
  - Free: 2,000 minutes/month
  - Pro: 3,000 minutes/month
  - Team: 3,000 minutes/month
  - Enterprise: 50,000 minutes/month

**Typical usage:** 50-200 Actions minutes/month for active repository with 3-5 workflows.

See [Cost Management Guide](cost-management.md) for detailed estimates.

---

### Q: Which AI engine should I use?

**A:** Depends on your needs:

| Engine | Best For | Cost | Context Window |
|--------|----------|------|----------------|
| **GitHub Copilot CLI** | Copilot subscribers | $0 additional | 128K tokens |
| **Claude Sonnet 3.5** | Large codebases, budget-conscious | $2-30/month | 200K tokens |
| **GPT-4 Turbo** | General purpose | $5-60/month | 128K tokens |
| **GPT-4** (standard) | High accuracy needs | $20-120/month | 128K tokens |

**Recommendation:**
1. **If you have Copilot:** Use `copilot-cli` (included, no extra cost)
2. **If not:** Start with `claude-sonnet-3.5` (best value)
3. **For large repos (>100K lines):** Use `claude-sonnet-3.5` (largest context)

**Detailed comparison:** [API Keys Setup Guide - Choosing an AI Engine](api-keys-setup.md#choosing-an-ai-engine)

---

### Q: Can I use multiple AI engines in the same repository?

**A:** Yes. Configure all API keys as secrets, then specify the engine per workflow in the YAML frontmatter.

**Setup:**
```bash
# Set all three
gh secret set COPILOT_GITHUB_TOKEN --body "$(gh auth token)"
gh secret set ANTHROPIC_API_KEY
gh secret set OPENAI_API_KEY
```

**Workflow 1 (uses Copilot):**
```yaml
---
name: Issue Triage
engine: copilot-cli
---
```

**Workflow 2 (uses Claude):**
```yaml
---
name: Documentation Sync
engine: claude-sonnet-3.5
---
```

**Why mix engines?**
- Use **Copilot** for simple workflows (included cost)
- Use **Claude** for complex analysis (large context)
- Use **GPT-4** for specific tasks where it excels

---

### Q: Do I need admin access to the repository?

**A:** **For setup:** Yes (or "Maintain" permission) to:
- Create GitHub Secrets (API keys)
- Enable GitHub Actions

**For day-to-day use:** No. Once configured, any contributor can trigger workflows by opening issues, creating PRs, etc.

**For organization repositories:** Organization admin may need to approve GitHub Actions usage.

---

## Cost Questions

### Q: How much does this cost?

**A:** Depends on AI engine and repository activity.

**Monthly cost estimates (active repository, ~50 workflow runs/month):**

| AI Engine | Typical Cost | Range |
|-----------|--------------|-------|
| **GitHub Copilot CLI** | **$0 additional** | Included in $10-19/month Copilot subscription |
| **Claude Sonnet 3.5** | **$5-15** | $2-30 depending on complexity |
| **GPT-4 Turbo** | **$20-40** | $5-60 depending on complexity |
| **GPT-4** (standard) | **$40-80** | $20-120 depending on complexity |

**GitHub Actions minutes:**
- Public repos: $0 (unlimited)
- Private repos: $0-4/month (within free tier for most users)

**Detailed breakdown:** [Cost Management Guide](cost-management.md)

---

### Q: Can I set a spending limit?

**A:** Yes, with Anthropic and OpenAI (not GitHub Copilot, which has fixed pricing).

**Anthropic (Claude):**
1. Go to https://console.anthropic.com/settings/billing
2. Click "Set usage limits"
3. Set monthly budget (e.g., $25/month)
4. Workflows will fail when limit is reached

**OpenAI (GPT-4):**
1. Go to https://platform.openai.com/account/billing/limits
2. Set "Soft limit" (email notification, e.g., $50)
3. Set "Hard limit" (stops usage, e.g., $100)
4. Workflows fail at hard limit

**Recommendation:** Start with $25-50 limit for first month, adjust based on usage.

---

### Q: What's the ROI?

**A:** Typical ROI: **85-250x** for active repositories.

**Example calculation (mid-size team):**

**Costs (monthly):**
- AI engine: $15 (Claude Sonnet 3.5)
- GitHub Actions: $0 (within free tier)
- **Total: $15/month**

**Value created (monthly):**
- Issue triage: 40 issues × 5 min saved = 200 min = 3.3 hours
- Documentation sync: 20 updates × 15 min saved = 300 min = 5 hours
- Code simplification: 4 PRs × 60 min saved = 240 min = 4 hours
- CI investigation: 8 failures × 20 min saved = 160 min = 2.7 hours
- **Total: 15 hours × $100/hour (loaded developer cost) = $1,500/month**

**ROI: $1,500 ÷ $15 = 100x**

**Detailed ROI analysis:** [Cost Management Guide - ROI Calculation](cost-management.md#roi-calculation-and-justification)

---

### Q: Does GitHub charge for agentic workflow execution?

**A:** No. GitHub does not charge specifically for agentic workflows.

**What you pay:**
- **Standard GitHub Actions usage** (free for public repos, minutes-based for private)
- **AI provider API calls** (Anthropic, OpenAI, or included in Copilot subscription)

**GitHub Actions pricing:**
- Public repos: Free unlimited minutes
- Private repos: 2,000-50,000 free minutes/month depending on plan
- Overages: $0.008/minute (rarely exceeded with agentic workflows)

**Agentic workflow runs typically use 2-8 Actions minutes each.**

---

### Q: Hidden costs I should know about?

**A:** A few to watch:

**1. Context window overage** (Claude/OpenAI)
- Workflows sending large context may use more tokens
- Monitor usage in provider dashboards

**2. Failed workflow retries**
- Auto-retries on transient failures consume additional tokens
- Limit retries in workflow config

**3. Workflow triggers on edits**
- Triggering on `[opened, edited, reopened]` instead of just `[opened]` triples runs
- Be selective with triggers

**4. Large repository + complex workflows**
- Analyzing 200K lines of code for every issue can get expensive
- Use targeted file searches instead

**Mitigation:** See [Cost Management Guide - Cost Optimization Strategies](cost-management.md#cost-optimization-strategies)

---

## Security & Compliance

### Q: Is it safe to give AI agents access to my code?

**A:** Yes, when properly configured. Agents operate under strict security constraints:

**Security guarantees:**
1. ✅ **Read-only code access by default** - Agents can't push commits without PR approval
2. ✅ **Cannot merge PRs** - Human review always required
3. ✅ **Pre-approved action allowlist** - Only specified actions allowed (safe outputs)
4. ✅ **No production system access** - Network isolation prevents agent from calling production APIs
5. ✅ **GitHub Secrets masked** - API keys and secrets never visible to agents
6. ✅ **Audit trail** - All agent actions logged in workflow runs

**What happens if agent is compromised?**
- Worst case: Creates a PR with malicious code
- Human review catches it (all PRs require approval)
- CI/CD tests run automatically (catch runtime issues)
- PR can be closed/rejected

**Deep dive:** [Security Architecture Guide](architecture.md)

---

### Q: Can agents access repository secrets?

**A:** No. GitHub Actions automatically masks secrets in logs, and agents don't have permission to read the raw secret values.

**What agents can access:**
- Code files in the repository
- Issue/PR content
- Commit history
- Public workflow run logs

**What agents CANNOT access:**
- GitHub Secrets (ANTHROPIC_API_KEY, etc.)
- Organization secrets
- Environment secrets
- Personal access tokens

**Exception:** Secrets can be *used* (e.g., making API calls with secret API key), but agents can't read or log the secret value itself.

---

### Q: What data is sent to AI providers?

**A:** Code snippets, issue content, PR diffs, and workflow instructions. No secrets or credentials (unless incorrectly stored in code).

**Typically sent:**
- Issue title and body
- Relevant code files (based on search)
- PR diffs and comments
- Workflow instructions (from Markdown file)
- Repository structure (file/folder names)

**Never sent:**
- GitHub Secrets
- Environment variables marked as secrets
- Production database credentials
- API keys (unless hardcoded in code - bad practice!)

**Data handling by provider:**
- **GitHub Copilot:** Data not used for model training (as of Microsoft policy)
- **Anthropic Claude:** Data not used for training unless customer opts in
- **OpenAI GPT-4:** Data not used for training via API (per ToS)

**Review provider data policies:**
- GitHub Copilot: https://docs.github.com/en/copilot/overview-of-github-copilot/about-github-copilot-business#data-privacy
- Anthropic: https://www.anthropic.com/privacy
- OpenAI: https://platform.openai.com/docs/models/data-usage-policies

---

### Q: Is this compliant with GDPR / SOC 2 / ISO 27001?

**A:** GitHub Actions itself is compliant. AI provider compliance varies.

**GitHub Actions:**
- ✅ SOC 2 Type II
- ✅ GDPR compliant
- ✅ ISO 27001
- ✅ HIPAA eligible (Enterprise)

**AI Providers:**

| Provider | SOC 2 | GDPR | HIPAA | ISO 27001 |
|----------|-------|------|-------|-----------|
| **GitHub Copilot** | ✅ | ✅ | ✅ (Enterprise) | ✅ |
| **Anthropic Claude** | ✅ Type II | ✅ | ✅ Eligible | ⚠️ (In progress) |
| **OpenAI GPT-4** | ✅ Type II | ✅ | ❌ Not eligible | ❌ |

**For regulated industries:**
- **Healthcare (HIPAA):** Use GitHub Copilot or Anthropic Claude
- **Financial (SOC 2):** All providers compliant
- **EU (GDPR):** All providers compliant

**Consult your security team** for organization-specific compliance requirements.

---

### Q: Can agents deploy to production?

**A:** No. Agents can create PRs suggesting changes, but human approval and manual deployment are required.

**What agents CAN do:**
- Analyze code and suggest improvements
- Create PRs with proposed changes
- Update documentation
- Generate tests

**What agents CANNOT do:**
- Merge PRs (human approval required via branch protection)
- Push directly to main branch
- Trigger deployment pipelines
- Access production environments

**Deployment flow:**
1. Agent creates PR
2. Human reviews PR
3. CI/CD tests run automatically
4. Human merges PR (if approved)
5. Deployment pipeline triggers (if configured)

---

### Q: What if an agent suggests malicious code?

**A:** Human code review catches it. All agent-generated PRs require approval before merging.

**Defense layers:**
1. **Allowlist restrictions** - Agent can only perform pre-approved actions
2. **PR workflow** - All changes go through PRs (can't push directly)
3. **Human review** - Team member reviews code before merge
4. **CI/CD tests** - Automated tests catch runtime issues
5. **Branch protection** - Requires approvals, passing checks

**Real-world scenario:**
- Agent creates PR with vulnerable code (e.g., SQL injection)
- Reviewer sees suspicious code pattern
- Reviewer rejects PR with comment
- PR is closed, malicious code never merged

**Best practice:** Require at least 1 approval for all PRs, including agent-generated ones.

---

### Q: Can I restrict which files agents can access?

**A:** Yes, using `safe-outputs` configuration and workflow instructions.

**Limit file access in workflow instructions:**
```markdown
# File Access Rules
- ONLY read files in `src/` directory
- DO NOT access files in `secrets/`, `config/`, or `.env`
- DO NOT search for credentials or API keys
```

**Restrict actions via safe outputs:**
```yaml
---
safe-outputs:
  - apply-label:
      allowed-labels: ["bug", "enhancement"]
  - add-comment: {}
  # No file-writing actions = read-only
---
```

**Note:** Agents have read access to the entire repository by default (since code is already on GitHub). Focus on restricting *write* actions via safe outputs.

---

## Power Platform-Specific Questions

### Q: Can agentic workflows deploy PCF controls to Dataverse?

**A:** No. They can analyze code, create PRs with fixes, and update documentation, but deployment requires manual execution or ALM pipeline.

**What workflows CAN do:**
- Analyze PCF control code (TypeScript/React)
- Detect issues in `ControlManifest.Input.xml`
- Suggest code improvements
- Generate unit tests
- Update component documentation
- Validate Fluent UI v9 patterns

**What workflows CANNOT do:**
- Run `pac pcf push` (no Dataverse environment access)
- Package PCF controls (no build environment)
- Import solutions (no production environment access)

**Recommended approach:**
1. Agent creates PR with PCF fixes
2. Human reviews and approves
3. CI/CD pipeline builds and packages control
4. Manual deployment to Dataverse environment

---

### Q: Can they analyze Dataverse plugins?

**A:** Yes, using semantic analysis (Serena) or static code analysis. No runtime environment access needed.

**What workflows can analyze:**
- C# plugin code structure
- IPlugin implementation patterns
- Common anti-patterns (missing null checks, sync HTTP calls)
- Plugin registration metadata (XML)
- Code quality and maintainability

**Example workflow:**
```markdown
# Task
Review plugin code for common issues:
- Missing null checks before accessing Target entity
- Synchronous HTTP calls (performance issue)
- Hardcoded connection strings
- Missing error handling
```

**Limitations:**
- ❌ Can't execute plugins (no runtime environment)
- ❌ Can't deploy to Dataverse
- ❌ Can't test with real data

**Best for:** Static code analysis, documentation, and code quality checks.

---

### Q: What about Canvas Apps (.msapp files)?

**A:** Binary `.msapp` files are difficult to analyze. Use unpacked format (`pac canvas unpack`) for better results.

**Problem:**
- Canvas Apps stored as `.msapp` (proprietary binary format)
- AI agents can't parse binary files meaningfully

**Solution:**
```powershell
# Install Power Platform CLI
dotnet tool install --global Microsoft.PowerApps.CLI.Tool

# Unpack Canvas App to human-readable YAML
pac canvas unpack --msapp MyApp.msapp --sources src/CanvasApps/MyApp
```

**Result:**
```
src/CanvasApps/MyApp/
  Src/
    Screen1.fx.yaml     # Screen definitions (human-readable)
    App.fx.yaml         # App formulas
  DataSources/
    Accounts.json       # Data source metadata
```

**Now agents can:**
- Analyze screen formulas
- Detect formula errors
- Check data source references
- Update documentation

**Then repack for deployment:**
```powershell
pac canvas pack --sources src/CanvasApps/MyApp --msapp MyApp.msapp
```

---

### Q: Can they update Power Automate flows?

**A:** Limited. They can analyze custom connector OpenAPI specs and suggest improvements, but cannot modify flows directly.

**What workflows can analyze:**
- Custom connector OpenAPI definitions (JSON/YAML)
- Connector policies (XML)
- API endpoint documentation

**What workflows CANNOT do:**
- Modify flow definitions (proprietary format)
- Trigger flows
- Access flow run history

**Workaround for flows:**
1. Export solution containing flows
2. Unpack solution (`pac solution unpack`)
3. Agent analyzes solution XML files
4. Limited insights possible (flow JSON is complex)

**Better approach:** Focus workflows on custom connectors and API definitions, not flows themselves.

---

### Q: Do they integrate with Power Platform ALM?

**A:** Indirectly. They can analyze solution files, detect issues, and create PRs. ALM deployment still requires Azure DevOps/GitHub Actions pipelines.

**Integration points:**

**1. Solution analysis:**
- Workflows analyze unpacked solution files
- Detect missing dependencies
- Validate component configurations

**2. PR creation:**
- Workflows create PRs with solution updates
- Human reviews via ALM process
- Merge triggers deployment pipeline

**3. Documentation:**
- Workflows keep solution docs in sync
- Generate deployment notes

**What's still manual:**
- Solution export/import
- Environment deployments
- Connection reference configuration

**Recommended architecture:**
```
[Agent workflow creates PR]
   ↓
[Human reviews/approves]
   ↓
[Merge to main]
   ↓
[ALM pipeline triggers]
   ↓
[Deploy to Dev → Test → Prod]
```

---

### Q: Can workflows help with Power Platform governance?

**A:** Yes. Enforce standards via automated PR comments and issue labeling.

**Example governance workflows:**

**1. Solution checker validation:**
```markdown
# Task
When PR contains solution files, check for:
- Missing publisher prefixes
- Hardcoded environment URLs
- Custom connectors without descriptions
- Missing dependency declarations
Add PR comment with findings.
```

**2. PCF control standards:**
```markdown
# Task
Review PCF control PRs for:
- Fluent UI v9 usage (not v8)
- Proper error handling
- TypeScript strict mode enabled
- Unit test coverage >70%
```

**3. Naming convention enforcement:**
```markdown
# Task
Check solution files for naming standards:
- Entities use org prefix (contoso_*)
- Plugins follow pattern: {Entity}{Event}Plugin
- PCF controls use PascalCase
```

---

## Workflow Behavior

### Q: How accurate are the agents?

**A:** GitHub reports **79-96% merge rates** internally (meaning 79-96% of agent-generated PRs are merged without significant changes).

**Accuracy by workflow type:**

| Workflow Type | Merge Rate | Notes |
|---------------|------------|-------|
| Documentation sync | 96% | High accuracy, low risk |
| Issue triage | 85-90% | Occasional misclassification |
| Code simplification | 79-85% | May need manual refinement |
| CI investigation | 70-80% | Complex root cause analysis |

**Factors affecting accuracy:**
- Quality of workflow instructions (specific > vague)
- Codebase complexity
- AI engine choice
- Amount of context provided

**Improving accuracy:**
- Write detailed, specific instructions
- Provide examples in workflow definitions
- Iterate based on agent performance
- Use appropriate AI engine for task

---

### Q: What if an agent makes a mistake?

**A:** Reject the PR, provide feedback, and optionally update workflow instructions.

**Process:**
1. Agent creates PR with mistake
2. Reviewer notices issue
3. Reviewer adds comment explaining the problem
4. Reviewer closes/rejects PR
5. (Optional) Update workflow instructions to prevent similar mistakes

**Example:**

**Agent mistake:** Applies "bug" label to feature request

**Fix workflow instructions:**
```markdown
# Classification Rules
IF issue contains "would be nice", "feature request", "add" → enhancement (NOT bug)
IF issue contains "error", "crash", "doesn't work" → bug
```

**Note:** Agents don't learn from past runs (stateless), so update instructions manually.

---

### Q: Can agents learn from feedback?

**A:** Not directly (no persistent memory between runs). But you can update workflow instructions based on observed mistakes to improve future runs.

**How to "teach" agents:**

**1. Document patterns in instructions:**
```markdown
# Examples
(Include 3-5 example issues with correct classifications)

# Past Mistakes to Avoid
- "Add dark mode" is enhancement, NOT bug
- Issues missing error logs need "needs-info" label first
```

**2. Refine safe outputs based on behavior:**
```yaml
safe-outputs:
  - apply-label:
      allowed-labels: ["bug", "enhancement", "needs-info"]
      # Removed "question" because agent overused it
```

**3. Adjust AI engine if needed:**
```yaml
engine: claude-sonnet-3.5  # Switch from GPT-4 if better performance
```

**Future:** GitHub may add persistent memory features, but not available as of March 2026.

---

### Q: How long do workflows take to run?

**A:** Depends on workflow type and complexity.

**Typical execution times:**

| Workflow Type | Duration | Tokens Used | Cost (Claude) |
|---------------|----------|-------------|---------------|
| Issue triage | 30s - 2 min | 1,500 - 5,000 | $0.01 - $0.04 |
| Documentation sync | 1 - 3 min | 3,000 - 10,000 | $0.02 - $0.08 |
| Code simplification | 3 - 8 min | 8,000 - 30,000 | $0.06 - $0.24 |
| CI investigation | 5 - 10 min | 15,000 - 50,000 | $0.12 - $0.40 |

**What affects duration:**
- Codebase size (larger = slower)
- Number of files searched
- AI engine response time
- Network latency

**How to optimize:** See [Troubleshooting Guide - Performance Issues](troubleshooting.md#performance--cost-issues)

---

### Q: Can workflows run in parallel?

**A:** Yes. Multiple workflows can run simultaneously (subject to GitHub Actions concurrency limits).

**GitHub Actions concurrency limits:**
- Free/Pro: 20 concurrent workflows
- Team: 60 concurrent workflows  
- Enterprise: 180 concurrent workflows

**Configure parallelism:**

**Allow parallel runs (default):**
```yaml
# No concurrency config = parallel runs allowed
```

**Prevent parallel runs (queue instead):**
```yaml
concurrency:
  group: agentic-workflows
  cancel-in-progress: false  # Queue instead of cancel
```

**Cancel in-progress runs (latest takes priority):**
```yaml
concurrency:
  group: agentic-workflows-${{ github.workflow }}
  cancel-in-progress: true  # Cancel older runs
```

---

### Q: What triggers workflows?

**A:** Configurable GitHub events: issue opened, PR created, push to branch, scheduled (cron), manual trigger, etc.

**Common triggers:**

**1. Issue events:**
```yaml
on:
  issues:
    types: [opened, edited, labeled]
```

**2. Pull request events:**
```yaml
on:
  pull_request:
    types: [opened, synchronize, review_requested]
```

**3. Push events:**
```yaml
on:
  push:
    branches: [main]
    paths: ['docs/**']  # Only when docs change
```

**4. Scheduled (cron):**
```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM UTC
```

**5. Manual trigger:**
```yaml
on:
  workflow_dispatch:  # Can trigger via GitHub UI or gh CLI
```

**Full list:** https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows

---

### Q: Can I test a workflow before deploying it?

**A:** Sort of. You can validate YAML compilation, but full testing requires a live repository.

**Pre-deployment validation:**

**1. Compile workflow:**
```bash
gh aw compile agentic-workflows/issue-triage.md
```

**Expected:** `issue-triage.yml` created without errors

**2. Validate YAML syntax:**
```bash
# Online validator
cat .github/workflows/issue-triage.yml | pbcopy
# Paste into https://www.yamllint.com
```

**3. Test locally with act (limited):**
```bash
# Install act (local GitHub Actions runner)
# macOS
brew install act

# Run workflow locally
act issues --eventpath test-event.json
```

**Limitations of local testing:**
- Agent behavior may differ without real GitHub context
- API calls still consume tokens
- Some GitHub Actions features not supported in act

**Best approach:** Test in a non-production repository first.

---

## Customization & Advanced Usage

### Q: Can I create custom workflows?

**A:** Yes. Write Markdown files with YAML frontmatter defining permissions and safe outputs, then provide instructions in plain English.

**Steps:**

**1. Create workflow definition file:**
```bash
mkdir -p agentic-workflows
nano agentic-workflows/custom-workflow.md
```

**2. Add YAML frontmatter:**
```yaml
---
name: Custom Workflow
engine: claude-sonnet-3.5
permissions:
  issues: write
  contents: read
safe-outputs:
  - apply-label:
      allowed-labels: ["custom-label"]
  - add-comment: {}
timeout-minutes: 5
---
```

**3. Write instructions in Markdown:**
```markdown
# Task
When an issue mentions "custom feature", apply the "custom-label" and add a welcoming comment.

# Process
1. Read issue title and body
2. Check if "custom feature" is mentioned
3. If yes, apply "custom-label"
4. Add comment thanking the user
```

**4. Compile and deploy:**
```bash
gh aw compile agentic-workflows/custom-workflow.md
git add .github/workflows/
git commit -m "Add custom workflow"
git push
```

**Full guide:** [Getting Started Guide - Creating Your First Workflow](getting-started.md#step-4-create-your-first-workflow)

---

### Q: Can workflows call other workflows?

**A:** Yes (multi-agent orchestration). One workflow can trigger another using `workflow_dispatch`.

**Example:**

**Workflow 1 (orchestrator):**
```yaml
---
name: Orchestrator
---

# Task
When complex issue is opened, trigger specialist workflows:
1. Call PCF analysis workflow
2. Call documentation workflow
3. Aggregate results
```

**Workflow 2 (specialist):**
```yaml
on:
  workflow_dispatch:
    inputs:
      issue_number:
        required: true
---

# Task
Analyze PCF-related issue #${{ inputs.issue_number }}
```

**Trigger from orchestrator:**
```bash
gh workflow run pcf-analysis.yml -f issue_number=42
```

**Advanced guide:** See `workflows/advanced/multi-agent-orchestration.md` (if available in your clone)

---

### Q: Can I use custom tools or APIs?

**A:** Limited. Agents can use built-in GitHub tools. Custom safe outputs allow some extensions, but network isolation restricts external API calls.

**What agents can access:**
- ✅ GitHub API (issues, PRs, commits, files)
- ✅ Repository files
- ✅ Built-in Unix tools (grep, sed, awk if allowed)

**What agents CANNOT access:**
- ❌ External APIs (Dataverse, SharePoint, custom services)
- ❌ Production databases
- ❌ Internal company systems

**Why the restriction?**
- Security: Prevents agents from exfiltrating data
- Isolation: Ensures predictable behavior

**Workaround:**
- Store external data snapshots in repository
- Use webhooks to pull data into GitHub (then agent can read it)
- Create custom GitHub Actions that wrap external APIs (agent triggers action)

---

### Q: What's the maximum codebase size?

**A:** Depends on AI engine context window:

| AI Engine | Context Window | Approximate Code Size |
|-----------|----------------|------------------------|
| GitHub Copilot | 128K tokens | ~500KB (~50-100K lines) |
| GPT-4 / GPT-4 Turbo | 128K tokens | ~500KB (~50-100K lines) |
| Claude Sonnet 3.5 | 200K tokens | ~800KB (~80-160K lines) |

**Token approximation:**
- 1 token ≈ 4 characters
- 1 line of code ≈ 40-80 characters ≈ 10-20 tokens
- 10K lines ≈ 100K-200K tokens

**For larger codebases:**
1. **Use Claude Sonnet 3.5** (largest context)
2. **Limit file searches** in workflow instructions
3. **Use Serena** for semantic caching (pre-processes codebase)
4. **Split into multiple workflows** (each analyzes subset)

**Serena integration:** See `workflows/advanced/serena-integration.md` (if available)

---

### Q: Can I run workflows locally before pushing?

**A:** Sort of. You can test workflow compilation and YAML syntax, but full agent behavior requires live GitHub context.

**Local validation:**

**1. Compile workflow locally:**
```bash
gh aw compile agentic-workflows/my-workflow.md
```

**2. Validate YAML:**
```bash
yamllint .github/workflows/my-workflow.yml
```

**3. Test with act (local Actions runner):**
```bash
# Install act
brew install act  # macOS
# OR: https://github.com/nektos/act

# Run workflow locally
act issues --eventpath test-issue-event.json
```

**Limitations:**
- Agent behavior may differ (no real repository context)
- API calls consume real tokens
- Some GitHub Actions features not supported

**Best practice:** Test in separate "sandbox" repository first, then deploy to production.

---

### Q: Can workflows access multiple repositories?

**A:** Limited. Workflows run in the context of one repository but can read public data from other repos via GitHub API.

**Single-repository scope (default):**
```markdown
# Task
Analyze this repository's code and update docs.
```

**Multi-repository read (possible):**
```markdown
# Task
Check if similar issue exists in upstream repository owner/upstream-repo.
Use GitHub API to search issues.
```

**Multi-repository write (NOT possible):**
- ❌ Can't create PRs in other repositories
- ❌ Can't trigger workflows in other repositories
- ❌ Limited by token permissions

**Workaround (advanced):**
- Create organization-level workflows
- Use GitHub Apps with multi-repo access
- Requires custom setup beyond standard agentic workflows

---

## Troubleshooting

### Q: My workflow isn't triggering. Why?

**A:** Four common causes:

**1. Workflow not pushed to default branch:**
```bash
git status  # Check if committed
git push origin main  # Push to default branch
```

**2. Trigger conditions don't match:**
```yaml
on:
  issues:
    types: [opened]  # Only triggers on NEW issues (not edited)
```

Test: Create a NEW issue (not edit existing)

**3. Workflow disabled:**
- Go to repository → Actions tab
- Check if workflow is listed and enabled
- Click "Enable workflow" if disabled

**4. YAML syntax error:**
- Check Actions tab for error messages
- Validate YAML: https://www.yamllint.com

**Full troubleshooting:** [Troubleshooting Guide - Workflow Execution Issues](troubleshooting.md#workflow-execution-issues)

---

### Q: Workflow fails with "Invalid API key". What do I do?

**A:** Three-step fix:

**1. Verify secret exists:**
```bash
gh secret list
```

**Expected:** `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, or `COPILOT_GITHUB_TOKEN` listed

**2. If missing, set the secret:**

**Anthropic:**
```bash
gh secret set ANTHROPIC_API_KEY
# Paste key when prompted (starts with sk-ant-)
```

**OpenAI:**
```bash
gh secret set OPENAI_API_KEY
# Paste key when prompted (starts with sk-)
```

**GitHub Copilot:**
```bash
gh auth login --scopes "copilot,repo,workflow"
gh secret set COPILOT_GITHUB_TOKEN --body "$(gh auth token)"
```

**3. Re-run workflow:**
```bash
gh run rerun <run-id>
```

**Detailed guide:** [API Keys Setup Guide](api-keys-setup.md)

---

### Q: Agent is giving wrong answers. How do I fix it?

**A:** Refine workflow instructions to be more specific.

**Vague instructions (leads to mistakes):**
```markdown
# Task
Analyze issues and apply labels.
```

**Specific instructions (better results):**
```markdown
# Task
Apply EXACTLY ONE label per issue using these rules:

## Classification Rules
1. "bug" - Issue describes error, crash, or unexpected behavior
   - Must include error message OR steps to reproduce
   - Examples: "Button throws exception", "App crashes on save"

2. "enhancement" - Issue requests new feature or improvement
   - Contains "would be nice", "feature request", "add support"
   - Examples: "Add dark mode", "Support for offline mode"

3. "needs-info" - Issue is incomplete
   - Missing error logs, repro steps, or version info
   - Examples: "It doesn't work" (no details)

## Examples
Issue: "DatePicker crashes on Feb 29" → bug
Issue: "Add calendar view" → enhancement
Issue: "The save button" (incomplete sentence) → needs-info

## Process
1. Read issue title + body
2. Match to ONE rule above
3. Apply corresponding label
4. DO NOT apply multiple labels
5. DO NOT invent new labels
```

**More tips:** [Troubleshooting Guide - Agent makes incorrect decisions](troubleshooting.md#problem-agent-adds-wrong-labels-or-makes-incorrect-decisions)

---

### Q: Where can I get help?

**A:** Four resources:

**1. Documentation (this repository):**
- [Troubleshooting Guide](troubleshooting.md) - Specific error solutions
- [Getting Started Guide](getting-started.md) - Setup walkthrough
- [FAQ](faq.md) (this document) - Common questions

**2. GitHub Discussions (community Q&A):**

https://github.com/aidevme/github-agentic-workflows-power-platform/discussions

**3. GitHub Issues (bug reports):**

https://github.com/aidevme/github-agentic-workflows-power-platform/issues

**4. Official GitHub Agentic Workflows support:**

https://github.com/github/gh-aw/issues

---

### Q: How do I report a bug?

**A:** Provide five key pieces of information:

**1. Workflow definition (Markdown file):**
```bash
cat agentic-workflows/issue-triage.md
```

**2. Compiled YAML:**
```bash
cat .github/workflows/issue-triage.yml
```

**3. Workflow run logs:**
```bash
gh run view <run-id> --log > logs.txt
```

**4. Exact error message** (copy-paste, not paraphrase)

**5. What you've tried** (troubleshooting steps already attempted)

**Post in:** [GitHub Issues](https://github.com/aidevme/github-agentic-workflows-power-platform/issues/new)

**Sanitize secrets** before sharing logs!

---

## Best Practices

### Q: Which workflows should I start with?

**A:** Start low-risk, high-value. Recommended order:

**1. Issue Triage (Week 1)**
- **Risk:** Low (only adds labels/comments)
- **Value:** Immediate time savings
- **Success rate:** 85-90%
- **Setup time:** 30 minutes

**2. Documentation Sync (Week 2)**
- **Risk:** Very low (docs rarely break things)
- **Value:** High (docs always out of date)
- **Success rate:** 96%
- **Setup time:** 45 minutes

**3. Weekly Health Reports (Week 3)**
- **Risk:** None (read-only analysis)
- **Value:** Management visibility
- **Success rate:** N/A (always succeeds)
- **Setup time:** 30 minutes

**4. Code Simplification (Month 2)**
- **Risk:** Moderate (requires code review)
- **Value:** Reduces technical debt
- **Success rate:** 79-85%
- **Setup time:** 1-2 hours

**Avoid initially:**
- Complex refactorings
- Database migration code
- Security-critical components

---

### Q: How do I write good workflow instructions?

**A:** Five principles:

**1. Be specific, not vague**
- ❌ "Analyze the issue"
- ✅ "Read issue title and body. Check for error messages. Search for component name in src/ directory."

**2. Provide examples**
```markdown
# Examples
Issue: "Button crashes" → Apply "bug" label
Issue: "Add export feature" → Apply "enhancement" label
```

**3. Include context about your codebase**
```markdown
# Context
This is a PCF control repository using:
- TypeScript + React
- Fluent UI v9 (NOT v8)
- Jest for testing
```

**4. Use structured output**
```markdown
# Output Format
Label: <label-name>
Confidence: <high/medium/low>
Reasoning: <one sentence>
```

**5. Iterate based on results**
- Run workflow 5-10 times
- Observe agent behavior
- Refine instructions where agent struggles

**Guide:** [Getting Started - Step 4](getting-started.md#step-4-create-your-first-workflow)

---

### Q: Should I use workflows for production code changes?

**A:** Use cautiously. Workflows excel at documentation, triage, and test generation. For production code, require thorough human review and robust CI/CD testing.

**Good use cases (production code):**
- ✅ Generate unit tests from bug reports
- ✅ Add TypeScript type annotations
- ✅ Update deprecated API calls (simple replacements)
- ✅ Refactor for readability (extract methods)

**Risky use cases (needs extra review):**
- ⚠️ Business logic changes
- ⚠️ Database queries
- ⚠️ Authentication/authorization code
- ⚠️ Data transformations

**Never automate:**
- ❌ Security-critical code
- ❌ Payment processing
- ❌ HIPAA/PCI-regulated components

**Safeguards:**
- Require 2+ approvals for production code PRs
- Enforce comprehensive test coverage
- Use feature flags for gradual rollout

---

### Q: How often should workflows run?

**A:** Depends on workflow type. Balance value vs. cost.

**Recommended frequencies:**

| Workflow Type | Frequency | Why |
|---------------|-----------|-----|
| **Issue triage** | Every new issue | Immediate user feedback |
| **PR review assistant** | Every PR opened | Fresh context |
| **Documentation sync** | Every commit to main | Docs stay current |
| **Code health report** | Weekly | Enough time to accumulate changes |
| **Dependency audit** | Bi-weekly | Dependencies don't change daily |
| **License compliance** | Monthly | Low change frequency |

**Cost optimization:**

**High-frequency (per-event):**
```yaml
on:
  issues:
    types: [opened]  # Only new (not edited/reopened)
```

**Batch processing (scheduled):**
```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Weekly Monday 9 AM
```

**Conditional execution:**
```yaml
jobs:
  triage:
    if: ${{ !contains(github.event.issue.labels.*.name, 'triaged') }}
```

---

### Q: How do I measure workflow success?

**A:** Track four metrics:

**1. Merge rate** (agent PRs merged without changes)
- Target: >80%
- Measure: PRs merged ÷ PRs created
- Tool: GitHub Insights

**2. Time saved** (developer hours recovered)
- Baseline: Measure manual time before workflows
- After: Track time on automated tasks
- ROI: (Time saved × hourly rate) ÷ AI costs

**3. Issue response time** (time to first triage)
- Before: Hours to days
- After: Seconds to minutes
- Tool: GitHub issue timestamps

**4. Documentation freshness** (docs updated within 24hr of code change)
- Before: Weeks out of date
- After: Always current
- Tool: Git commit timestamps

**Dashboard (simple):**
```bash
# Merge rate
gh pr list --state merged --label "ai-generated" --json number | jq 'length'

# Time saved (manual tracking in spreadsheet)

# Response time
gh issue list --label "triaged" --json createdAt,labels
```

---

### Q: Should all team members have access to workflows?

**A:** Read access for all, write access for select team members.

**Recommended permissions:**

**All developers:**
- ✅ Trigger workflows (create issues, PRs)
- ✅ View workflow runs and logs
- ✅ Comment on agent-generated PRs

**Team leads / DevOps:**
- ✅ Create/modify workflow definitions
- ✅ Manage API keys (GitHub Secrets)
- ✅ Monitor costs

**Organization admins:**
- ✅ Enable GitHub Actions for repositories
- ✅ Set organization-level secrets
- ✅ Configure billing alerts

**Why restrict workflow editing?**
- Prevent accidental cost spikes (bad workflow runs continuously)
- Maintain instruction quality
- Ensure security review of new workflows

---

## Comparison to Other Tools

### Q: How is this different from GitHub Copilot (IDE)?

**A:** GitHub Copilot assists developers in the IDE. Agentic workflows autonomously perform repository maintenance.

| Feature | GitHub Copilot (IDE) | Agentic Workflows |
|---------|----------------------|-------------------|
| **Where it runs** | Your IDE (VS Code, etc.) | GitHub Actions (cloud) |
| **What it does** | Suggests code completions | Automates repository tasks |
| **Trigger** | You type code | GitHub events (issue, PR, push) |
| **Output** | Code suggestions | PRs, labels, comments |
| **Human involvement** | Accept/reject each suggestion | Review PR once |
| **Use case** | Writing code faster | Automating maintenance |

**Example:**
- **Copilot IDE:** Suggests next line while you write a function
- **Agentic Workflow:** Analyzes issue, searches codebase, creates PR with fix

**Can use both:** Copilot for active development, workflows for automation.

---

### Q: Is this the same as GitHub Copilot Workspace?

**A:** No. Copilot Workspace helps you plan and implement features. Agentic workflows automate ongoing maintenance.

| Feature | Copilot Workspace | Agentic Workflows |
|---------|-------------------|-------------------|
| **Purpose** | Feature planning/implementation | Automated maintenance |
| **Interface** | Web-based workspace | GitHub Actions YAML |
| **User interaction** | Conversational task planning | Write once, runs automatically |
| **Best for** | New features, large changes | Repetitive tasks, triage |

**Example:**
- **Copilot Workspace:** "Help me add user authentication to this app" → Workspace guides you through implementation
- **Agentic Workflow:** Automatically triages issues, updates docs, generates tests (no human guidance needed)

---

### Q: How does this compare to Dependabot?

**A:** Dependabot updates dependencies. Agentic workflows can analyze dependency PRs, investigate breaking changes, and suggest migration strategies.

| Feature | Dependabot | Agentic Workflows |
|---------|------------|-------------------|
| **Purpose** | Update dependencies | General automation |
| **Automation** | Fully automated (PRs created) | Configurable (you define tasks) |
| **Intelligence** | Rule-based (update X to Y) | AI-powered (understand context) |
| **Scope** | Dependencies only | Any repository task |

**Complementary use:**

**Dependabot creates PR:** "Update @fluentui/react from 8.x to 9.x"

**Agentic workflow analyzes:**
- Searches codebase for Fluent UI v8 patterns
- Identifies breaking changes (mergeStyles → makeStyles)
- Creates migration guide PR
- Comments on Dependabot PR with analysis

**Use both:** Dependabot for automated updates, workflows for analyzing impact.

---

### Q: Can I use this instead of manual code review?

**A:** No. Agents assist with code understanding and suggestions, but human review is essential (and enforced by PR workflow).

**What agents are good at:**
- Identifying patterns (code smells, anti-patterns)
- Generating boilerplate (tests, docs)
- Suggesting improvements (naming, structure)

**What agents CANNOT replace:**
- Business logic verification
- Security audits
- Architectural decisions
- User experience considerations

**Workflow:** Agent creates PR → Human reviews → Human approves/rejects → Merge

**Best practice:** Require at least 1 human approval for all PRs, including agent-generated.

---

### Q: How does this compare to custom GitHub Actions?

**A:** Agentic workflows are higher-level and use AI. Custom Actions are lower-level scripts.

| Feature | Custom Actions | Agentic Workflows |
|---------|----------------|-------------------|
| **Language** | JavaScript, Docker, etc. | Markdown + AI |
| **Logic** | You code every step | AI interprets instructions |
| **Flexibility** | Unlimited | Constrained by safe outputs |
| **Setup complexity** | High (coding required) | Low (write instructions) |
| **Use case** | Custom build/deploy steps | Semantic code analysis |

**Example task:** Triage issue

**Custom Action (JavaScript):**
```javascript
const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
  const issue = github.context.payload.issue;
  if (issue.body.includes('error')) {
    // Label as bug
    await octokit.issues.addLabels({
      owner, repo, issue_number: issue.number,
      labels: ['bug']
    });
  }
}
```

**Agentic Workflow:**
```markdown
# Task
Read issue. If it describes an error, apply "bug" label.
```

**Can combine:** Use custom Actions for deployment, agentic workflows for analysis.

---

## Future / Roadmap

### Q: When will this be generally available?

**A:** GitHub hasn't announced a GA date (as of March 2026). Currently in technical preview.

**Current status:**
- ✅ Technical preview (February 2026)
- ✅ Used by GitHub engineering internally
- ✅ Public access via GitHub CLI extension

**What "technical preview" means:**
- API may change (breaking changes possible)
- Features may be added/removed
- Pricing model may change before GA
- Not recommended for mission-critical workflows (yet)

**To stay updated:**
- GitHub Blog: https://github.blog
- Agentic Workflows repo: https://github.com/github/gh-aw
- GitHub Changelog: https://github.blog/changelog/

---

### Q: Will pricing change?

**A:** Possibly. GitHub Copilot pricing is stable, but Anthropic/OpenAI pricing fluctuates.

**Current pricing (March 2026):**

**GitHub Copilot:**
- Individual: $10/month (stable since 2023)
- Business: $19/user/month (stable)
- Enterprise: Custom pricing

**Anthropic Claude:**
- Sonnet 3.5: $3/million input tokens, $15/million output
- Subject to change quarterly
- Track: https://www.anthropic.com/pricing

**OpenAI GPT-4:**
- GPT-4: $30/million input, $60/million output
- GPT-4 Turbo: $10/million input, $30/million output
- Changes announced on OpenAI blog

**Risk mitigation:**
- Use GitHub Copilot (fixed monthly price)
- Set spending limits on Anthropic/OpenAI
- Monitor usage dashboards monthly

---

### Q: What features are coming?

**A:** GitHub hasn't published official roadmap, but likely features based on preview feedback:

**Probable additions:**
- Multi-repository workflows (analyze multiple repos)
- Custom safe outputs API (define your own allowed actions)
- Enhanced semantic analysis (better codebase understanding)
- Cost attribution (track costs per workflow/repository)
- Persistent memory (agents learn from past runs)
- Visual workflow builder (no Markdown needed)

**Community requests (no guarantees):**
- VS Code extension for workflow authoring
- Workflow marketplace (share workflows)
- Integration with Azure DevOps, GitLab
- Support for non-code repositories (docs-only, data)

**Track updates:**
- GitHub Agentic Workflows discussions: https://github.com/github/gh-aw/discussions
- GitHub roadmap: https://github.com/orgs/github/projects/4247/views/1

---

### Q: Can I contribute to this tutorial repository?

**A:** Yes! Contributions welcome.

**How to contribute:**

**1. Documentation improvements:**
- Fix typos
- Add missing explanations
- Update outdated information

**2. Workflow examples:**
- Share your working workflows
- Add Power Platform-specific examples
- Document edge cases

**3. Best practices:**
- Share lessons learned
- Optimization strategies
- Team adoption case studies

**Process:**
1. Fork repository
2. Create feature branch
3. Make changes
4. Submit pull request
5. Maintainer reviews and merges

**Contribution guide:** See `CONTRIBUTING.md` (if added to repository)

**Repository:** https://github.com/aidevme/github-agentic-workflows-power-platform

---

### Q: Will this replace developers?

**A:** No. Agentic workflows automate repetitive tasks, freeing developers for creative problem-solving.

**What workflows automate:**
- Issue triage and labeling
- Documentation updates
- Boilerplate code generation
- Routine refactorings
- Test case generation

**What developers still do:**
- System design and architecture
- Business requirement analysis
- Complex problem solving
- Code review and quality assurance
- User experience design
- Stakeholder communication

**Historical parallel:** IDEs automated syntax checking and code formatting, but didn't replace developers. Agentic workflows are similar—they handle tedious work so developers focus on high-value tasks.

**Net effect:** Developers become more productive and spend time on interesting problems instead of maintenance drudgery.

---

## Getting Started

### Q: I'm convinced. Where do I start?

**A:** Five-step quickstart (30-45 minutes):

**1. Read Getting Started Guide** (10 min)

[Getting Started Guide](getting-started.md)

**2. Install GitHub CLI and extension** (5 min)

```bash
# Install GitHub CLI
winget install GitHub.cli  # Windows
brew install gh             # macOS

# Install Agentic Workflows extension
gh extension install github/gh-aw
```

**3. Set up API key** (10 min)

Choose one:

**GitHub Copilot (recommended if you have subscription):**
```bash
gh auth login --scopes "copilot,repo,workflow"
gh secret set COPILOT_GITHUB_TOKEN --body "$(gh auth token)"
```

**Anthropic Claude (recommended otherwise):**
```bash
# Get API key from https://console.anthropic.com
gh secret set ANTHROPIC_API_KEY
```

**4. Create first workflow** (10 min)

Clone example:
```bash
gh repo clone aidevme/github-agentic-workflows-power-platform
cd github-agentic-workflows-power-platform
cp examples/issue-triage.md agentic-workflows/
```

Compile and deploy:
```bash
gh aw compile agentic-workflows/issue-triage.md
git add .github/workflows/
git commit -m "Add issue triage workflow"
git push
```

**5. Test with sample issue** (5 min)

Create test issue in your repository:
```
Title: DatePicker throws error on save
Body: When I click save in the DatePicker control, I get a null reference exception.
```

Watch workflow run in Actions tab!

---

### Q: Can I try this without committing to my production repo?

**A:** Yes. Create a test repository, clone a sample from this tutorial, and experiment there first.

**Safe testing approach:**

**1. Create test repository:**
```bash
gh repo create my-workflow-testing --public
cd my-workflow-testing
```

**2. Clone sample workflow:**
```bash
git clone https://github.com/aidevme/github-agentic-workflows-power-platform
cp -r github-agentic-workflows-power-platform/examples .
cp -r github-agentic-workflows-power-platform/agentic-workflows .
```

**3. Set up API key (test repo):**
```bash
gh secret set ANTHROPIC_API_KEY
```

**4. Compile and deploy:**
```bash
gh aw compile agentic-workflows/issue-triage.md
git add .
git commit -m "Initial workflow"
git push
```

**5. Experiment safely:**
- Create test issues
- Modify workflow instructions
- Observe agent behavior
- Iterate without risk

**6. When confident, deploy to production repo**

---

### Q: How long until I see value?

**A:** First workflow (issue triage): 30 minutes setup + **immediate value**. Full workflow suite: 2-4 hours setup + ongoing compound benefits.

**Value timeline:**

**Day 1 (30 min setup):**
- ✅ Issue triage workflow deployed
- ✅ First issue auto-labeled
- **Value:** Immediate time savings (5 min per issue)

**Week 1 (1-2 hours additional setup):**
- ✅ Documentation sync workflow
- ✅ Weekly health report
- **Value:** Docs stay current, management visibility

**Month 1 (2-4 hours additional setup):**
- ✅ Code simplification workflow
- ✅ CI investigation workflow
- ✅ Team fully onboarded
- **Value:** Reduced technical debt, faster debugging

**Month 3 (ongoing):**
- ✅ Workflows refined based on usage
- ✅ Custom workflows for your team's needs
- **Value:** Compound time savings, cultural shift toward automation

**ROI realized:**
- **Week 1:** Break-even (setup time recovered)
- **Month 1:** 5-10x ROI
- **Month 3+:** 50-100x+ ROI

---

### Q: What if I get stuck?

**A:** Four layers of support:

**1. Documentation (self-service):**
- [Troubleshooting Guide](troubleshooting.md) - Specific errors + solutions
- [Getting Started Guide](getting-started.md) - Step-by-step setup
- This FAQ - Common questions

**2. Community (async support):**
- GitHub Discussions: https://github.com/aidevme/github-agentic-workflows-power-platform/discussions
- Ask questions, share workflows, get help from other users

**3. Issues (bug reports):**
- Tutorial repo issues: https://github.com/aidevme/github-agentic-workflows-power-platform/issues
- Core product issues: https://github.com/github/gh-aw/issues

**4. Power Platform Community:**
- PCF questions: https://powerusers.microsoft.com/t5/Power-Apps-Component-Framework/bd-p/pa_component_framework
- Integration with Dataverse, Canvas Apps, etc.

**90% of issues resolved in Troubleshooting Guide or Discussions.**

---

### Q: Can I hire someone to set this up for me?

**A:** While setup is designed to be self-service (30-45 min), you can get help from:

**1. GitHub Professional Services:**
- Contact: https://github.com/services
- Offers consulting for GitHub Advanced Security, Actions, etc.
- May include agentic workflows in consulting packages

**2. Microsoft Partners:**
- Power Platform partners often help with DevOps/ALM
- Search: https://appsource.microsoft.com/marketplace/partner-dir

**3. Freelance consultants:**
- Look for DevOps engineers with GitHub Actions + Power Platform experience
- Platforms: Upwork, Toptal, LinkedIn

**Cost estimate:** $500-2,000 for full setup + training (1-2 days consultant time)

**DIY vs hire:**
- **DIY:** Great for learning, customization, cost savings
- **Hire:** Faster time-to-value, best practices, less trial-and-error

---

## Still Have Questions?

**Can't find your answer?**

1. ✅ Search this FAQ (`Ctrl+F` or `Cmd+F`)
2. ✅ Check [Troubleshooting Guide](troubleshooting.md)
3. ✅ Browse [GitHub Discussions](https://github.com/aidevme/github-agentic-workflows-power-platform/discussions)
4. ✅ Ask a new question in Discussions

**Found incorrect information?**

- Open an issue: https://github.com/aidevme/github-agentic-workflows-power-platform/issues
- Or submit a PR with corrections

**Want to suggest a new FAQ entry?**

- Comment in Discussions with your question
- We'll add popular questions to this FAQ

---

**Related Documentation:**

- [Getting Started Guide](getting-started.md) - Setup walkthrough
- [Troubleshooting Guide](troubleshooting.md) - Error solutions
- [Security Architecture](architecture.md) - Security deep dive
- [API Keys Setup](api-keys-setup.md) - Authentication configuration
- [Cost Management](cost-management.md) - Budget planning and optimization

**Happy automating! 🚀**

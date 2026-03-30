# Troubleshooting Guide: GitHub Agentic Workflows for Power Platform

**Last Updated:** March 30, 2026  
**For:** Developers, team leads, support engineers

## Introduction

This guide helps you diagnose and resolve common issues when setting up and running GitHub Agentic Workflows in Power Platform projects.

### How to Use This Guide

**If you know the error message:** Press `Ctrl+F` (or `Cmd+F` on Mac) and search for the exact error text.

**If you know the symptom:** Browse the relevant section:
- Installation problems → [Installation Issues](#installation-issues)
- Authentication errors → [API Key / Authentication Issues](#api-key--authentication-issues)
- Workflow won't compile → [Workflow Compilation Issues](#workflow-compilation-issues)
- Workflow won't run → [Workflow Execution Issues](#workflow-execution-issues)
- Power Platform-specific → [Power Platform-Specific Issues](#power-platform-specific-issues)
- Performance/cost concerns → [Performance / Cost Issues](#performance--cost-issues)

### General Debugging Approach

1. **Check the Quick Diagnostics Checklist** (below) - most issues stem from missing prerequisites
2. **Review workflow run logs** - see [Debugging Workflow Runs](#debugging-workflow-runs)
3. **Search for error message** in this document
4. **Try the suggested solution**
5. **If still stuck**, see [Getting Help](#getting-help)

### Where to Get Help

- **This guide** - Common issues and solutions
- **[FAQ](faq.md)** - Frequently asked questions
- **[Getting Started Guide](getting-started.md)** - Setup instructions
- **[GitHub Discussions](https://github.com/aidevme/github-agentic-workflows-power-platform/discussions)** - Community support
- **[GitHub Issues](https://github.com/aidevme/github-agentic-workflows-power-platform/issues)** - Report bugs

---

## Quick Diagnostics Checklist

Before diving into specific issues, run through this checklist. Most problems are due to missing prerequisites.

### ✅ Verify GitHub CLI Installation

```bash
gh --version
```

**Expected output:**
```
gh version 2.40.0 (2024-01-15)
```

**If missing:** Install from https://cli.github.com

---

### ✅ Verify Agentic Workflows Extension

```bash
gh aw version
```

**Expected output:**
```
GitHub Agentic Workflows CLI v1.2.0
```

**If command not found:**
```bash
gh extension install github/gh-aw
```

---

### ✅ Verify API Key Configured

```bash
gh secret list
```

**Expected output (at least one of these):**
```
COPILOT_GITHUB_TOKEN     Updated 2026-03-30
ANTHROPIC_API_KEY        Updated 2026-03-30
OPENAI_API_KEY           Updated 2026-03-30
```

**If missing:** See [API Keys Setup Guide](api-keys-setup.md)

---

### ✅ Verify Workflow Compiled

```bash
ls .github/workflows/
```

**Expected output:** One or more `.yml` files

**If missing:**
```bash
gh aw compile agentic-workflows/pcf-issue-triage.md
```

---

### ✅ Verify Workflow Pushed to GitHub

```bash
git status
```

**Expected:** No uncommitted `.yml` files in `.github/workflows/`

**If unpushed:**
```bash
git add .github/workflows/
git commit -m "Add agentic workflows"
git push
```

---

### ✅ Verify Workflow Registered on GitHub

Navigate to your repository on GitHub → **Actions** tab

**Expected:** Your workflows listed on the left sidebar

**If not visible:** Wait 30 seconds and refresh (GitHub needs time to register new workflows)

---

### ✅ Verify Workflow Trigger Conditions

Check when your workflow should run:

```yaml
# In .github/workflows/issue-triage.yml
on:
  issues:
    types: [opened]  # Only triggers when NEW issues are created
```

**Test:** Create an issue and check if workflow runs

---

### ✅ Verify Repository Permissions

```yaml
# In workflow YAML
permissions:
  issues: write      # Required for labeling
  contents: read     # Required for code reading
```

**Also check:** Repository Settings → Actions → General → Workflow permissions  
Should be: **"Read and write permissions"**

---

## Installation Issues

### Problem: `gh: command not found`

**Error message:**
```
bash: gh: command not found
```
or
```
'gh' is not recognized as an internal or external command
```

**Cause:** GitHub CLI is not installed.

**Solution:**

**Windows:**
```powershell
winget install GitHub.cli
```

Or download installer from https://cli.github.com

**macOS:**
```bash
brew install gh
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

**Verify installation:**
```bash
gh --version
```

Expected: `gh version 2.40.0` or later

---

### Problem: `gh: 'aw' is not a gh command`

**Error message:**
```
gh: 'aw' is not a gh command. See 'gh --help'
```

**Cause:** GitHub Agentic Workflows extension is not installed.

**Solution:**

```bash
gh extension install github/gh-aw
```

**Expected output:**
```
✓ Installed extension github/gh-aw
```

**Verify installation:**
```bash
gh aw version
```

**Expected output:**
```
GitHub Agentic Workflows CLI v1.2.0
```

**If installation fails**, see next section.

---

### Problem: Extension install fails with "API rate limit exceeded"

**Error message:**
```
Error: API rate limit exceeded for IP address XXX.XXX.XXX.XXX
Rate limit: 60 requests per hour
```

**Cause:** Unauthenticated GitHub API requests have low rate limits (60/hour). Installing extensions counts against this limit.

**Solution:**

**1. Authenticate GitHub CLI (increases rate limit to 5,000/hour):**
```bash
gh auth login
```

Follow prompts to authenticate with your GitHub account.

**2. Wait for rate limit reset:**

Rate limits reset every hour. Check current status:
```bash
gh api rate_limit
```

**3. Retry installation:**
```bash
gh extension install github/gh-aw
```

---

### Problem: `gh aw` commands fail with "extension not found"

**Error message:**
```
Error: extension 'aw' not found
```

**Cause:** Extension was not successfully installed or has been removed.

**Solution:**

**1. List installed extensions:**
```bash
gh extension list
```

**2. If `github/gh-aw` is not listed, reinstall:**
```bash
gh extension install github/gh-aw
```

**3. If still failing, try upgrading GitHub CLI:**
```bash
# Windows
winget upgrade GitHub.cli

# macOS
brew upgrade gh

# Linux
sudo apt update && sudo apt upgrade gh
```

---

## API Key / Authentication Issues

### Problem: Workflow fails with "Invalid API key"

**Error message (in workflow logs):**
```
Error: Invalid API key provided
Status: 401 Unauthorized
```

**Cause:** API key not set, incorrect format, or expired.

**Solution:**

**Step 1: Check if secret exists**
```bash
gh secret list
```

**Expected:** One of these should be listed:
- `COPILOT_GITHUB_TOKEN`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`

**Step 2: If missing, set the secret**

**For GitHub Copilot:**
```bash
gh auth login
gh secret set COPILOT_GITHUB_TOKEN --body "$(gh auth token)"
```

**For Anthropic Claude:**
```bash
gh secret set ANTHROPIC_API_KEY
# Paste your key when prompted (starts with sk-ant-)
```

**For OpenAI:**
```bash
gh secret set OPENAI_API_KEY
# Paste your key when prompted (starts with sk-proj- or sk-)
```

**Step 3: Verify key format**

- **Anthropic:** `sk-ant-api03-...` (starts with `sk-ant-`)
- **OpenAI:** `sk-proj-...` or `sk-...` (starts with `sk-`)
- **GitHub Copilot:** Personal access token format `gho_...` or `ghp_...`

**Step 4: Test key manually**

**Anthropic:**
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: YOUR_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-3-5-20241022","max_tokens":10,"messages":[{"role":"user","content":"Hello"}]}'
```

**Expected:** JSON response with "OK" message

**OpenAI:**
```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer YOUR_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-4","messages":[{"role":"user","content":"Hello"}],"max_tokens":10}'
```

**Expected:** JSON response with completion

**Related error messages:**
- "Authentication failed"
- "API key not valid"
- "Unauthorized access"

---

### Problem: "Copilot subscription not found"

**Error message:**
```
Error: GitHub Copilot subscription not active for this account
Status: 403 Forbidden
```

**Cause:** The GitHub account authenticated in GitHub CLI does not have an active Copilot subscription.

**Solution:**

**Step 1: Verify Copilot subscription**

Visit: https://github.com/settings/copilot

**Expected:** "GitHub Copilot is active" with subscription type (Individual, Business, or Enterprise)

**Step 2: If not subscribed, get Copilot access**

**For individuals:**
- Click "Get Copilot" button
- Choose Individual plan ($10/month)
- Complete payment setup

**For business users:**
- Contact your organization admin
- Request Copilot Business seat assignment
- Admin must add you at: https://github.com/organizations/YOUR_ORG/settings/copilot

**Step 3: Re-authenticate GitHub CLI**

After subscription is active:
```bash
gh auth login --scopes "copilot,repo,workflow"
```

**Step 4: Update repository secret**
```bash
gh secret set COPILOT_GITHUB_TOKEN --body "$(gh auth token)"
```

**Step 5: Test**

Create a test issue and check if workflow runs successfully.

---

### Problem: "Insufficient quota" or "Rate limit exceeded"

**Error message:**
```
Error: Insufficient credits. Please add billing information.
Status: 402 Payment Required
```

or

```
Error: Rate limit reached for requests
Status: 429 Too Many Requests
Retry after: 60 seconds
```

**Cause:** 

- **402 Payment Required:** Free tier credits exhausted, or monthly budget cap reached
- **429 Too Many Requests:** Too many API calls in short time period

**Solution for 402 (Insufficient quota):**

**Step 1: Check current usage**

**Anthropic:** https://console.anthropic.com/settings/usage  
**OpenAI:** https://platform.openai.com/usage

**Step 2: Add billing information**

**Anthropic:**
1. Go to https://console.anthropic.com/settings/billing
2. Add payment method
3. Set monthly budget limit (e.g., $100)

**OpenAI:**
1. Go to https://platform.openai.com/account/billing
2. Add payment method
3. Set usage limits (soft: $50, hard: $100)

**Step 3: Wait for quota refresh**

Quotas reset monthly. If you hit a hard limit, wait until the next billing cycle or increase the limit.

**Solution for 429 (Rate limit):**

**Step 1: Increase timeout between runs**

Add `concurrency` to workflow to prevent parallel runs:

```yaml
# In .github/workflows/issue-triage.yml
concurrency:
  group: agentic-workflows-${{ github.workflow }}
  cancel-in-progress: false  # Prevents parallel runs
```

**Step 2: Increase timeout**

```yaml
timeout-minutes: 10  # Give workflow more time (default: 5)
```

**Step 3: Check AI provider status**

- Anthropic Status: https://status.anthropic.com
- OpenAI Status: https://status.openai.com

API might be experiencing slowdowns or outages.

**Step 4: Use separate API keys for different repos**

If sharing one API key across multiple repositories, rate limits are shared. Use separate keys to isolate limits.

---

### Problem: "Secret 'ANTHROPIC_API_KEY' not found"

**Error message:**
```
Error: Secret 'ANTHROPIC_API_KEY' not found in repository secrets
```

**Cause:** Secret was not created or has wrong name.

**Solution:**

**Step 1: Check exact secret name**

```bash
gh secret list
```

**Step 2: Check for typos**

Secret names are **case-sensitive**. Common mistakes:

- ❌ `anthropic_api_key` (lowercase)
- ❌ `ANTHROPIC_KEY` (missing `_API`)
- ✅ `ANTHROPIC_API_KEY` (correct)

**Step 3: Check workflow expects correct name**

In `.github/workflows/*.yml`, verify:

```yaml
env:
  AI_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

Secret name in workflow YAML must match exactly.

**Step 4: Set the secret**

```bash
gh secret set ANTHROPIC_API_KEY
# Paste your key when prompted
```

**Step 5: For organization secrets**

If using organization-level secret, verify repository has access:

1. Go to https://github.com/organizations/YOUR_ORG/settings/secrets/actions
2. Click on `ANTHROPIC_API_KEY`
3. Under "Repository access", ensure your repository is selected

---

## Workflow Compilation Issues

### Problem: `gh aw compile` fails with "Invalid YAML frontmatter"

**Error message:**
```
Error: Invalid YAML frontmatter in agentic-workflows/pcf-issue-triage.md
Line 3: mapping values are not allowed in this context
```

**Cause:** Syntax error in the YAML frontmatter at the top of your workflow definition.

**Solution:**

**Step 1: Check YAML structure**

The frontmatter must be:
- Enclosed in `---` markers (opening and closing)
- Use spaces for indentation (NOT tabs)
- Follow YAML syntax rules

**Example of WRONG syntax:**

```yaml
---
name: PCF Issue Triage
permissions:
	issues: write  # TAB character (wrong!)
safe-outputs:
  - add-labels:
    allowed-labels: [bug, feature]  # Wrong indentation
  - add-comment  # Missing colon
---
```

**Example of CORRECT syntax:**

```yaml
---
name: PCF Issue Triage
permissions:
  issues: write  # 2 spaces
  contents: read
safe-outputs:
  - add-labels:
      allowed-labels: ["bug", "feature"]  # Consistent indentation
  - add-comment: {}  # Proper syntax
timeout-minutes: 5
---
```

**Step 2: Validate YAML online**

1. Copy your frontmatter (everything between `---` markers)
2. Paste into https://www.yamllint.com
3. Fix reported errors

**Common YAML errors:**

| Error | Cause | Fix |
|-------|-------|-----|
| "mapping values are not allowed" | Missing colon or incorrect indentation | Check colon placement, use 2 spaces |
| "did not find expected key" | Missing closing `---` | Add `---` at end of frontmatter |
| "could not find expected ':'" | Missing colon after key | Add `:` after key name |

**Step 3: Check for tabs**

Replace all tabs with spaces:

**In VS Code:** Settings → "Insert Spaces" (enabled)  
**In command line:**
```bash
# Convert tabs to spaces
sed 's/\t/  /g' agentic-workflows/pcf-issue-triage.md > temp.md
mv temp.md agentic-workflows/pcf-issue-triage.md
```

---

### Problem: "Unknown permission: read-write"

**Error message:**
```
Error: Unknown permission value 'read-write' for 'issues'
Valid values: read, write, none
```

**Cause:** Incorrect permission value syntax.

**Solution:**

**GitHub Actions permissions use `read`, `write`, or `none` (not `read-write`).**

**Wrong:**
```yaml
permissions:
  issues: read-write
  contents: read-only
```

**Correct:**
```yaml
permissions:
  issues: write    # Use "write" for read and write access
  contents: read   # Use "read" for read-only
  pull-requests: none  # Use "none" to deny access
```

**Available permissions:**

| Resource | Permission | What it allows |
|----------|------------|----------------|
| `issues` | `read` | Read issues |
| `issues` | `write` | Read, create, edit, label, comment on issues |
| `contents` | `read` | Read repository files |
| `contents` | `write` | Read and write repository files (push commits) |
| `pull-requests` | `read` | Read PRs |
| `pull-requests` | `write` | Read, create, comment on PRs |

---

### Problem: Workflow compiles but doesn't appear in Actions tab

**Symptom:** `gh aw compile` succeeds, but workflow not visible in GitHub Actions tab.

**Cause:** Compiled YAML file not pushed to GitHub, or GitHub hasn't registered it yet.

**Solution:**

**Step 1: Verify file exists**

```bash
ls .github/workflows/
```

**Expected:** Your workflow file (e.g., `issue-triage.yml`)

**Step 2: Check file content**

```bash
cat .github/workflows/issue-triage.yml
```

Should contain valid GitHub Actions YAML (starts with `name:`, has `on:`, `jobs:`, etc.)

**Step 3: Commit and push**

```bash
git status  # Check if file is tracked
git add .github/workflows/
git commit -m "Add agentic workflows"
git push origin main
```

**Step 4: Wait for GitHub to register**

GitHub needs 10-30 seconds to process new workflow files. 

**Step 5: Refresh Actions tab**

Navigate to repository on GitHub → Actions tab → Refresh page

**If still not visible**, check:

1. **Branch:** Workflows only run on default branch unless configured otherwise
   - Ensure you pushed to `main` (or your default branch)
   - Check: Repository Settings → Branches → Default branch

2. **Syntax check:** GitHub skips workflows with YAML syntax errors
   - View Actions tab for any error messages
   - Validate YAML: https://www.yamllint.com

---

### Problem: "Unknown engine: copilot-cli"

**Error message:**
```
Error: Unknown engine 'copilot-cli'
Valid engines: copilot, claude-sonnet-3.5, claude-opus-3, gpt-4, gpt-4-turbo
```

**Cause:** Typo in `engine` field or outdated engine name.

**Solution:**

**Valid engine names (case-sensitive):**

- `copilot-cli` (GitHub Copilot CLI - recommended)
- `claude-sonnet-3.5` (Anthropic Claude Sonnet 3.5)
- `claude-opus-3` (Anthropic Claude Opus 3 - expensive)
- `gpt-4` (OpenAI GPT-4)
- `gpt-4-turbo` (OpenAI GPT-4 Turbo)

**Check your workflow definition:**

```yaml
---
name: PCF Issue Triage
engine: copilot-cli  # Must match exactly (case-sensitive, with hyphens)
---
```

**Common typos:**

| Wrong | Right |
|-------|-------|
| `copilot` | `copilot-cli` |
| `claude-sonnet-35` | `claude-sonnet-3.5` |
| `gpt4` | `gpt-4` |
| `gpt-4-turbo-preview` | `gpt-4-turbo` |

---

### Problem: "Safe output type 'add-labels' not recognized"

**Error message:**
```
Error: Unknown safe output type 'add-labels'
Valid types: apply-label, add-comment, create-pull-request, assign-user
```

**Cause:** Incorrect safe output action name.

**Solution:**

**Valid safe output types:**

- `apply-label` (NOT `add-labels`)
- `add-comment`
- `create-pull-request`
- `assign-user`
- `add-reviewer`
- `update-issue-status`

**Wrong:**
```yaml
safe-outputs:
  - add-labels:  # Wrong name
      allowed-labels: ["bug"]
```

**Correct:**
```yaml
safe-outputs:
  - apply-label:  # Correct name
      allowed-labels: ["bug", "feature"]
```

---

## Workflow Execution Issues

### Problem: Workflow doesn't trigger when issue is created

**Symptom:** Created an issue, but workflow didn't run.

**Cause:** Trigger conditions don't match, workflow not enabled, or workflow file has errors.

**Solution:**

**Step 1: Check trigger configuration**

Open `.github/workflows/issue-triage.yml` and verify:

```yaml
on:
  issues:
    types: [opened]  # Triggers ONLY when new issues are created
```

**If you want to trigger on edits too:**
```yaml
on:
  issues:
    types: [opened, edited]
```

**Step 2: Verify workflow is enabled**

1. Navigate to repository → Actions tab
2. Click on your workflow name (left sidebar)
3. Ensure it's not disabled (look for "Enable workflow" button - if present, click it)

**Step 3: Check Event Activity tab**

On Actions tab, check "Event Activity" section - this shows all events (issue created, PR opened, etc.)

**If your issue event is missing:** GitHub may not have registered the event (rare, try creating another issue)

**Step 4: Check branch**

Workflows on the default branch (`main` or `master`) are triggered. 

```bash
# Check default branch
gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'
```

Ensure your workflow is pushed to this branch.

**Step 5: Check for YAML syntax errors**

GitHub skips workflows with syntax errors. Check Actions tab for error messages.

---

### Problem: Workflow runs but times out

**Error message (in workflow logs):**
```
Error: The operation was canceled.
Workflow timed out after 5 minutes.
```

**Cause:** Agent is taking too long due to large codebase, complex analysis, or API latency.

**Solution:**

**Step 1: Increase timeout**

In your workflow definition (Markdown file), increase `timeout-minutes`:

```yaml
---
name: PCF Issue Triage
timeout-minutes: 10  # Increase from default 5 to 10
---
```

**Recompile and push:**
```bash
gh aw compile agentic-workflows/pcf-issue-triage.md
git add .github/workflows/
git commit -m "Increase workflow timeout"
git push
```

**Recommended timeouts by workflow type:**

| Workflow Type | Recommended Timeout |
|---------------|---------------------|
| Issue triage | 5-7 minutes |
| Documentation sync | 7-10 minutes |
| Code simplification | 10-15 minutes |
| CI investigation | 15-20 minutes |

**Step 2: Optimize workflow scope**

Reduce the amount of context the agent processes:

```markdown
# In workflow instructions
## Process
1. Read issue title and body (DO NOT search entire codebase)
2. If component name mentioned, search ONLY for that component
3. Apply labels based on keywords in issue
```

**Step 3: Use semantic caching (Serena)**

Serena pre-processes codebase semantics, reducing processing time by 30-50%.

See: [workflows/advanced/serena-integration.md](workflows/advanced/serena-integration.md)

**Step 4: Check AI provider status**

Slow API responses can cause timeouts:

- Anthropic: https://status.anthropic.com
- OpenAI: https://status.openai.com

**Step 5: Use faster AI engine**

- **Fastest:** `copilot-cli`
- **Fast:** `gpt-4-turbo`, `claude-sonnet-3.5`
- **Slower:** `gpt-4`, `claude-opus-3`

Update `engine:` in workflow definition.

---

### Problem: "Permission denied: issues"

**Error message:**
```
Error: Resource not accessible by integration
Permission denied: issues
Status: 403 Forbidden
```

**Cause:** Workflow doesn't have `issues: write` permission.

**Solution:**

**Step 1: Add permission to workflow**

In your workflow definition (Markdown file):

```yaml
---
name: PCF Issue Triage
permissions:
  issues: write    # Required for labeling and commenting
  contents: read   # Required for reading code files
---
```

**Recompile and push:**
```bash
gh aw compile agentic-workflows/pcf-issue-triage.md
git add .github/workflows/
git commit -m "Add issues write permission"
git push
```

**Step 2: Check repository Actions settings**

Repository Settings → Actions → General → Workflow permissions

**Should be set to:** "Read and write permissions"

**If set to "Read repository contents and packages permissions":**
1. Change to "Read and write permissions"
2. Click "Save"
3. Re-run failed workflow

---

### Problem: Agent adds wrong labels or makes incorrect decisions

**Symptom:** Agent applies labels that don't match the issue content, or makes poor classification decisions.

**Cause:** Instructions unclear, training data bias, or AI hallucination.

**Solution:**

**Step 1: Review workflow instructions**

Make instructions more specific and directive:

**Vague (leads to poor decisions):**
```markdown
# Task
Analyze the issue and apply appropriate labels.
```

**Specific (better decisions):**
```markdown
# Task
Apply exactly 1-3 labels based on these rules:
- "bug" - Error messages, crashes, unexpected behavior
- "enhancement" - Feature requests, improvements
- "needs-info" - Missing details (PCF version, error logs, repro steps)

# Classification Rules
IF issue contains "error", "crash", "doesn't work" → Apply "bug"
IF issue contains "would be nice", "feature request", "add support" → Apply "enhancement"
IF issue missing error logs or repro steps → Apply "needs-info"
```

**Step 2: Add examples**

Include example issues and expected labels in instructions:

```markdown
# Examples
**Example 1:**
Issue: "DatePicker throws null reference exception on save"
Labels: bug, pcf-datepicker
Explanation: Clear error message, specific component

**Example 2:**
Issue: "Add dark mode support"
Labels: enhancement
Explanation: Feature request, not a bug
```

**Step 3: Check allowed labels**

In safe outputs, verify labels match your repository's labels:

```yaml
safe-outputs:
  - apply-label:
      allowed-labels: ["bug", "enhancement", "needs-info", "pcf-framework"]
```

**Step 4: Review agent reasoning**

Check workflow run logs to see agent's thought process:

```bash
gh run view <run-id> --log | grep -A10 "Agent reasoning"
```

If agent reasoning is flawed, refine instructions to guide it better.

**Step 5: Accept AI limitations**

AI agents are probabilistic, not deterministic. They will occasionally make mistakes. Consider:

- Having "triaged" vs "needs-human-review" labels
- Human spot-checks on agent decisions
- Feedback loop: When agent is wrong, adjust instructions

---

### Problem: Workflow fails with "Safe output validation failed"

**Error message:**
```
Error: Safe output validation failed
Agent attempted to apply label 'critical' which is not in allowed-labels list
Allowed labels: ["bug", "enhancement", "needs-info"]
```

**Cause:** Agent tried to perform an action not in the `safe-outputs` allowlist.

**Solution:**

**Option 1: Add the action to safe-outputs (if intended)**

If you want the agent to be able to apply the "critical" label:

```yaml
---
safe-outputs:
  - apply-label:
      allowed-labels: ["bug", "enhancement", "needs-info", "critical"]  # Add "critical"
---
```

**Recompile and push:**
```bash
gh aw compile agentic-workflows/pcf-issue-triage.md
git add .github/workflows/ && git commit -m "Allow critical label" && git push
```

**Option 2: Update instructions to prevent the action**

If you DON'T want agent applying that label, clarify instructions:

```markdown
# Classification Rules
Apply ONLY these labels:
- "bug" - Errors and crashes
- "enhancement" - Feature requests
- "needs-info" - Missing details

DO NOT apply severity labels like "critical", "high-priority", etc.
Humans will triage severity separately.
```

**Option 3: Review workflow logs**

Check what action was blocked:

```bash
gh run view <run-id> --log | grep "Safe output validation"
```

This shows exactly what the agent tried to do and why it was blocked.

---

### Problem: "Workflow failed: No agent response"

**Error message:**
```
Error: Agent did not produce any output
Timeout or API error
```

**Cause:** AI API is unavailable, workflow timeout too short, or agent is stuck.

**Solution:**

**Step 1: Check AI provider status**

- Anthropic: https://status.anthropic.com
- OpenAI: https://status.openai.com
- GitHub (for Copilot): https://www.githubstatus.com

**If API is down:** Wait for service to recover, then re-run workflow.

**Step 2: Increase timeout**

```yaml
timeout-minutes: 10  # Increase if agent needs more time
```

**Step 3: Simplify workflow instructions**

Complex instructions can cause agents to loop. Simplify:

```markdown
# Task
Read issue. Apply 1 label: bug, enhancement, or needs-info. Add brief comment.

# Process (3 steps only)
1. Read issue
2. Apply label
3. Write comment
```

**Step 4: Check for infinite loops**

If agent is searching for files recursively or processing too much context, it might timeout.

**Add constraints:**
```markdown
# Process
1. Read issue (DO NOT search files unless component name is mentioned)
2. If component mentioned, search for ONE file matching that name
3. Apply label and stop
```

**Step 5: Re-run workflow**

Transient errors can occur. Try re-running:

```bash
gh run rerun <run-id>
```

---

## Power Platform-Specific Issues

### Problem: Agent doesn't understand PCF control structure

**Symptom:** Agent applies wrong labels or doesn't find relevant files in PCF projects.

**Cause:** Instructions don't provide Power Platform context.

**Solution:**

**Add PCF-specific context to workflow instructions:**

```markdown
# Context
This repository contains Power Apps Component Framework (PCF) controls:
- Built with TypeScript/React
- Uses Fluent UI v9 for styling
- Control manifests in `ControlName/ControlManifest.Input.xml`
- Source code in `ControlName/index.ts`
- Tests in `ControlName/__tests__/`

# File Structure
PCF controls follow this structure:
```
src/
  DatePicker/
    ControlManifest.Input.xml  # Control metadata
    index.ts                    # Main logic
    DatePicker.tsx              # React component
    package.json                # npm dependencies
```

# Classification Rules
- "pcf-framework" - Issues with PCF SDK, build tooling, or Power Platform APIs
- "pcf-custom" - Issues with custom control logic (TypeScript/React)
- "pcf-styling" - Visual/styling issues with Fluent UI
```

**Step 2: Reference specific file patterns**

```markdown
# Process
1. Read issue
2. If component name mentioned (e.g., "DatePicker"), search for:
   - `src/DatePicker/index.ts`
   - `src/DatePicker/ControlManifest.Input.xml`
3. Analyze code to understand issue
```

---

### Problem: "Unable to analyze Dataverse plugin" (C# project)

**Symptom:** Agent fails to understand plugin architecture or provide meaningful analysis.

**Cause:** Agent doesn't have .NET build context or plugin framework knowledge.

**Solution:**

**Step 1: Provide plugin architecture context**

```markdown
# Context
This repository contains Dataverse plugins:
- C# class libraries targeting .NET Framework 4.6.2
- Implement `IPlugin` interface
- Register on specific entity events (Pre/Post Operation)
- Execute in sandbox isolation

# Plugin Structure
```
src/
  Plugins/
    AccountPlugin.cs         # Plugin class
    PluginHelper.cs          # Shared utilities
    PluginRegistration.xml   # Registration metadata
```

# Key Concepts
- Execution context: `IPluginExecutionContext`
- Service provider: `IServiceProvider`
- Organization service: `IOrganizationService`
- Target entity: `context.InputParameters["Target"]`
```

**Step 2: Use Serena for semantic analysis**

Serena provides semantic code analysis without requiring compilation:

See: [workflows/advanced/serena-integration.md](workflows/advanced/serena-integration.md)

**Step 3: Focus on static code patterns**

Instead of runtime analysis, focus on code patterns:

```markdown
# Task
Check for common plugin anti-patterns:
- Missing null checks before accessing Target entity
- Using synchronous HTTP calls (causes performance issues)
- Hardcoded connection strings
- Missing error handling (try-catch blocks)
```

---

### Problem: Canvas App `.msapp` file analysis fails

**Error message:**
```
Error: Unable to parse .msapp file
Binary format not supported
```

**Cause:** Canvas Apps `.msapp` files are proprietary binary format, not directly parseable by AI agents.

**Solution:**

**Option 1: Use unpacked Canvas App format**

**Unpack `.msapp` to YAML/formula files:**

```powershell
# Install Power Platform CLI
dotnet tool install --global Microsoft.PowerApps.CLI.Tool

# Unpack Canvas App
pac canvas unpack --msapp MyApp.msapp --sources src/CanvasApps/MyApp
```

**This creates human-readable files:**
```
src/CanvasApps/MyApp/
  Src/
    Screen1.fx.yaml         # Screen definitions
    App.fx.yaml             # App-level formulas
  DataSources/
    Accounts.json           # Data source metadata
  Connections/
    Connections.json        # Connector references
```

**Update workflow instructions:**

```markdown
# Canvas App Analysis
This repository contains unpacked Canvas Apps in `src/CanvasApps/`.

To analyze formulas:
1. Check `Src/*.fx.yaml` files for formula syntax
2. Look for data source references in `DataSources/`
```

**Option 2: Export as solution files**

Export Canvas App as part of a solution (.zip), then unpack:

```powershell
# Unpack solution
pac solution unpack --zipfile MySolution.zip --folder src/MySolution
```

**Option 3: Focus on exported solution metadata**

If you can't unpack apps, focus on solution-level analysis:

- Solution XML files
- Component metadata
- Connection references

---

### Problem: Agent suggests incorrect Fluent UI v9 syntax

**Symptom:** Agent recommends Fluent UI v8 patterns (like `mergeStyles`) instead of v9 (like `makeStyles`).

**Cause:** Agent's training data includes older Fluent UI versions.

**Solution:**

**Add Fluent UI v9 context to instructions:**

```markdown
# Fluent UI v9 Context
⚠️ IMPORTANT: We use Fluent UI v9 (NOT v8). Key differences:

## Styling
- ✅ Use `makeStyles` from `@fluentui/react-components`
- ❌ NOT `mergeStyles` from `@fluentui/react`

Example:
```typescript
import { makeStyles, tokens } from '@fluentui/react-components';

const useStyles = makeStyles({
  root: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForeground1,
  },
});
```

## Theming
- ✅ Use theme tokens: `tokens.colorBrandBackground`
- ❌ NOT `theme.palette.themePrimary`

## Imports
- ✅ `import { Button } from '@fluentui/react-components';`
- ❌ NOT `import { PrimaryButton } from '@fluentui/react';`

## When reviewing code
If you see v8 patterns (`mergeStyles`, `ITheme`, `@fluentui/react`), flag as upgrade needed.
```

---

### Problem: Agent can't find Dataverse entity definitions

**Symptom:** Agent doesn't understand entity schema or relationships.

**Cause:** Entity definitions not in repository, or in binary solution format.

**Solution:**

**Option 1: Export entity schema to repository**

```powershell
# Export solution
pac solution export --name MySolution --path MySolution.zip

# Unpack solution
pac solution unpack --zipfile MySolution.zip --folder src/Solutions/MySolution
```

**This creates XML files:**
```
src/Solutions/MySolution/
  Entities/
    account/
      Entity.xml              # Entity definition
      Fields/
        accountname.xml       # Field definitions
      Relationships/
        account_contact.xml   # Relationships
```

**Update workflow instructions:**

```markdown
# Dataverse Schema
Entity definitions are in `src/Solutions/[SolutionName]/Entities/`.

To understand entity structure:
1. Read `Entity.xml` for entity metadata
2. Check `Fields/` folder for field definitions
3. Review `Relationships/` for entity relationships
```

**Option 2: Include schema documentation**

Add `docs/dataverse-schema.md` with entity descriptions:

```markdown
# Dataverse Schema

## Account Entity
- **Logical Name:** account
- **Primary Field:** accountname
- **Key Fields:** accountnumber, emailaddress1
- **Relationships:**
  - account_contact (one-to-many)
  - account_opportunity (one-to-many)
```

Reference this in workflow instructions:

```markdown
# Schema Reference
See docs/dataverse-schema.md for entity definitions.
```

---

## Performance / Cost Issues

### Problem: Workflows consuming too many tokens (high costs)

**Symptom:** Monthly AI API costs higher than expected.

**Cause:** Large context windows, inefficient prompts, or unnecessary workflow runs.

**Solution:**

See comprehensive optimization strategies in [Cost Management Guide](cost-management.md).

**Quick fixes:**

**1. Use GitHub Copilot CLI (if available):**
```yaml
engine: copilot-cli  # $0 additional cost
```

**2. Set aggressive timeouts:**
```yaml
timeout-minutes: 5  # Prevent runaway costs
```

**3. Limit workflow triggers:**
```yaml
on:
  issues:
    types: [opened]  # NOT [opened, edited, reopened, etc.]
```

**4. Use conditional execution:**
```yaml
jobs:
  triage:
    if: ${{ !contains(join(github.event.issue.labels.*.name, ','), 'triaged') }}
```

**5. Reduce context in instructions:**
```markdown
# Process
1. Read issue (DO NOT search entire codebase)
2. Apply label based on keywords ONLY
3. DO NOT write lengthy explanations
```

---

### Problem: Workflows are slow (>5 minutes)

**Symptom:** Workflows take longer than expected to complete.

**Cause:** Large codebase, complex analysis, or API latency.

**Solution:**

**1. Use faster AI engine:**

- **Fastest:** `copilot-cli`
- **Fast:** `gpt-4-turbo`
- **Moderate:** `claude-sonnet-3.5`
- **Slowest:** `claude-opus-3`, `gpt-4` (standard)

**2. Limit file search scope:**

```markdown
# Process
1. Read issue
2. If component name mentioned, search for ONE file: `src/{ComponentName}/index.ts`
3. DO NOT search entire repository
```

**3. Use Serena for pre-processed analysis:**

Serena caches semantic understanding, reducing processing time by 30-50%.

**4. Batch processing:**

Instead of running on every event, batch:

```yaml
on:
  schedule:
    - cron: '0 9 * * 1'  # Weekly instead of per-issue
```

---

## GitHub Actions / CI Issues

### Problem: "Workflow run was cancelled"

**Error message:**
```
Workflow run was cancelled
```

**Cause:** Timeout reached, concurrent run limit, or manual cancellation.

**Solution:**

**Step 1: Check cancellation reason**

View workflow run in Actions tab → Check "Annotations" section

Common reasons:

**1. Timeout exceeded:**
```yaml
timeout-minutes: 10  # Increase this if needed
```

**2. Concurrent run limit:**

GitHub has limits on concurrent workflow runs (varies by plan). If too many workflows run simultaneously, later ones are cancelled.

**Solution:** Use `concurrency` to queue workflows:

```yaml
concurrency:
  group: agentic-workflows
  cancel-in-progress: false  # Queue instead of cancel
```

**3. Manual cancellation:**

Check if a user clicked "Cancel workflow" in Actions tab. If so, re-run:

```bash
gh run rerun <run-id>
```

**Step 2: Check for dependency conflicts**

If workflow depends on another workflow (via `needs`), ensure dependencies are succeeding.

---

### Problem: Workflow fails on private repository but works on public

**Error message (potentially):**
```
Workflow run failed
GitHub Actions minutes limit reached
```

**Cause:** GitHub Actions minutes exhausted for private repositories.

**Solution:**

**Step 1: Check Actions usage**

Repository Settings → Billing → Actions and Packages

**Free tier limits:**
- Public repos: Unlimited
- Private repos: 2,000 minutes/month (Free), 3,000 minutes/month (Pro)

**Step 2: Optimize workflow run frequency**

If running out of minutes:

**Reduce triggers:**
```yaml
on:
  issues:
    types: [opened]  # Only new issues (not edited, reopened)
```

**Batch processing:**
```yaml
on:
  schedule:
    - cron: '0 9 * * *'  # Once daily instead of per-event
```

**Step 3: Upgrade plan**

For heavy usage, upgrade to GitHub Pro ($4/month for 3,000 minutes) or Team ($4/user/month for 3,000 minutes).

**Step 4: Use self-hosted runners (advanced)**

For enterprises, self-hosted runners provide unlimited minutes but require infrastructure management.

---

### Problem: "Resource not accessible by integration"

**Error message:**
```
Error: Resource not accessible by integration
Status: 403 Forbidden
```

**Cause:** GitHub App permissions insufficient for organization-owned repositories.

**Solution:**

**Step 1: Check organization Actions permissions**

Organization Settings → Actions → General → Workflow permissions

**Should be:** "Read and write permissions"

**Step 2: Check repository access**

If repository is in an organization:

Organization Settings → Actions → General → Fork pull request workflows

Ensure "Run workflows from fork pull requests" is configured appropriately.

**Step 3: Check GITHUB_TOKEN permissions**

In workflow YAML:

```yaml
permissions:
  issues: write
  contents: read
```

Ensure these match what the workflow needs.

**Step 4: For organization admins**

If you're not the organization admin, contact them to adjust Actions permissions.

---

## Debugging Workflow Runs

### How to View Workflow Logs

**List recent runs:**
```bash
gh run list --workflow "issue-triage"
```

**Output:**
```
STATUS  NAME            WORKFLOW         BRANCH  EVENT   ID          ELAPSED
✓       Issue #45       Issue Triage     main    issues  1234567890  23s
✗       Issue #44       Issue Triage     main    issues  1234567889  5m12s
```

**View specific run details:**
```bash
gh run view 1234567890
```

**View full logs:**
```bash
gh run view 1234567890 --log
```

**Download logs for offline analysis:**
```bash
gh run download 1234567890
```

**Or view in browser:**

Navigate to repository → Actions tab → Click on workflow run

---

### What to Look For in Logs

**1. Token usage:**

Search for:
```bash
gh run view <run-id> --log | grep -i "token"
```

Look for lines like:
```
Agent consumed 3,247 tokens (prompt) + 895 tokens (completion) = 4,142 total
```

**2. API errors:**

Search for:
```bash
gh run view <run-id> --log | grep -i "error\|failed\|exception"
```

Common errors:
- "Invalid API key"
- "Rate limit exceeded"
- "Timeout"

**3. Safe output validation:**

Search for:
```bash
gh run view <run-id> --log | grep -i "safe output"
```

Shows what actions agent attempted and whether they were allowed.

**4. Agent reasoning:**

Look for sections showing agent's thought process:

```
[Agent] Analyzing issue content...
[Agent] Detected error description: "button doesn't appear"
[Agent] Classification: bug (confidence: 92%)
[Agent] Applying labels: bug, pcf-datepicker
```

**5. Timing:**

Check which steps took longest:

```bash
gh run view <run-id> --log | grep "Duration"
```

---

### Enable Debug Logging

For more detailed logs, enable debug mode:

**Set repository secrets:**
```bash
gh secret set ACTIONS_STEP_DEBUG --body "true"
gh secret set ACTIONS_RUNNER_DEBUG --body "true"
```

**Re-run workflow:**

```bash
gh run rerun <run-id>
```

**Debug mode provides:**
- Step-by-step execution details
- Environment variable values (secrets are masked)
- File system operations
- Network requests

**Warning:** Debug logs are VERY verbose. Use only when troubleshooting specific issues.

---

## Getting Help

### Self-Service Resources

**1. Documentation:**
- [FAQ](faq.md) - Frequently asked questions
- [Getting Started Guide](getting-started.md) - Setup instructions
- [API Keys Setup](api-keys-setup.md) - Authentication configuration
- [Cost Management](cost-management.md) - Token optimization
- [Security Architecture](architecture.md) - Security deep dive

**2. GitHub Resources:**
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub Agentic Workflows (official)](https://github.blog/news-insights/product-news/github-agentic-workflows/)

---

### Community Support

**GitHub Discussions:**

https://github.com/aidevme/github-agentic-workflows-power-platform/discussions

**What to post:**
- Setup questions
- "How do I...?" questions
- Share your workflows
- Request feature ideas

**Power Platform Community:**

https://powerusers.microsoft.com/t5/Power-Apps-Component-Framework/bd-p/pa_component_framework

**What to post:**
- PCF-specific issues
- Power Platform integration questions
- Best practices

---

### Reporting Bugs

**For this tutorial repository:**

https://github.com/aidevme/github-agentic-workflows-power-platform/issues

**For GitHub Agentic Workflows (core product):**

https://github.com/github/gh-aw/issues

---

### When Requesting Help, Provide:

**1. Workflow definition (Markdown file)**

```bash
cat agentic-workflows/pcf-issue-triage.md
```

**Sanitize any sensitive data** (API keys, internal URLs, proprietary code)

**2. Compiled YAML**

```bash
cat .github/workflows/issue-triage.yml
```

**3. Workflow run logs**

```bash
gh run view <run-id> --log > workflow-logs.txt
```

**Sanitize secrets** before sharing (GitHub masks most, but double-check)

**4. Error message (exact text)**

Copy-paste the exact error message, not a paraphrase.

**5. What you've tried**

List troubleshooting steps you've already attempted.

**6. Repository context**

- Public or private repo?
- Organization or personal account?
- PCF, Dataverse plugins, Canvas Apps, or mixed?
- Approximate repository size (lines of code)

---

## Known Issues / Limitations

### Current Limitations (as of March 2026)

**By design (security):**
- ⚠️ **Agents cannot merge pull requests** - Requires human approval via branch protection
- ⚠️ **Agents cannot access GitHub Secrets** - Only workflow-level API keys
- ⚠️ **Agents cannot modify workflow files** - Prevents self-modification
- ⚠️ **Agents cannot delete branches or repositories** - No admin permissions

**Technical limitations:**
- ⚠️ **Maximum context window:** 200K tokens (Claude) / 128K tokens (Copilot, GPT-4)  
  *Large codebases (>50K lines) may exceed context limits for some workflows.*
- ⚠️ **Workflows run only on default branch** (unless explicitly configured for other branches)
- ⚠️ **Some complex refactorings require multiple iterations** - Agent may not get it perfect first try
- ⚠️ **AI models may hallucinate** - Always require human review for code changes

---

### Power Platform-Specific Limitations

**Canvas Apps:**
- ⚠️ **`.msapp` binary format not directly parseable** - Use unpacked YAML format instead
- ⚠️ **No runtime testing** - Agents analyze static code only, can't execute formulas
- ⚠️ **Connector execution not possible** - Agents can't test connectors or make API calls

**Dataverse:**
- ⚠️ **No live environment access** - Agents work with exported solution files only
- ⚠️ **Plugin registration requires manual deployment** - Agents can generate code but can't register plugins
- ⚠️ **Schema analysis limited without exported solutions** - Export solution XML for best results

**PCF Controls:**
- ⚠️ **No browser testing** - Agents can't render PCF controls or test in Power Apps
- ⚠️ **Build errors not caught until CI** - Agents analyze source, but may miss TypeScript compilation errors

---

### Workarounds

**For large codebases exceeding context limits:**
- Use Serena for semantic caching
- Limit file search scope in workflow instructions
- Split monorepos into smaller, focused repositories

**For Canvas Apps:**
- Export to unpacked format: `pac canvas unpack --msapp MyApp.msapp --sources src/`
- Store unpacked YAML in repository
- Use Power Platform CLI in CI/CD for packaging

**For Dataverse schema:**
- Export solutions: `pac solution export --name MySolution`
- Unpack to XML: `pac solution unpack --zipfile MySolution.zip`
- Commit solution XML files to repository

---

## Still Stuck?

If you've gone through this guide and still can't resolve your issue:

1. ✅ **Check workflow run logs** for detailed error messages
2. ✅ **Search GitHub Discussions** - your issue may have been solved before
3. ✅ **Ask in Discussions** with full context (workflow definition, logs, error messages)
4. ✅ **Open an issue** if you believe it's a bug in the tutorial or tooling

**Most issues are resolved by:**
- Fixing YAML syntax errors
- Setting API keys correctly
- Adjusting workflow permissions
- Clarifying workflow instructions

Good luck, and happy automating! 🚀

---

**Related Documentation:**

- [Getting Started Guide](getting-started.md)
- [API Keys Setup](api-keys-setup.md)
- [Security Architecture](architecture.md)
- [Cost Management](cost-management.md)
- [FAQ](faq.md)

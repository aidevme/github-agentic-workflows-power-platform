# Getting Started with GitHub Agentic Workflows for Power Platform

Welcome! This guide will walk you through setting up and testing your first GitHub Agentic Workflow in a Power Platform development environment. By the end, you'll have a working AI-powered workflow that automatically triages issues in your PCF component library.

**Time Investment:** 30-45 minutes for complete setup and first test

## What Are GitHub Agentic Workflows?

GitHub Agentic Workflows combine GitHub Actions with AI capabilities to automate complex development tasks that traditionally required human judgment. Instead of simple rule-based automation, these workflows use AI agents that can:

- Read and understand code context
- Make nuanced decisions based on natural language patterns
- Search through repositories intelligently
- Apply appropriate labels, comments, and actions

**Why They're Valuable for Power Platform Development:**

- **Intelligent Issue Triage:** Automatically categorize PCF, Dataverse, and Canvas App issues
- **Documentation Sync:** Keep README files aligned with code changes
- **Code Quality:** Generate tests, simplify complex functions, identify anti-patterns
- **Team Efficiency:** Reduce repetitive decision-making, allowing developers to focus on building features

## Prerequisites

Before starting, ensure you have:

- ✅ **GitHub CLI** (v2.40.0 or later) - [Install here](https://cli.github.com)
- ✅ **Git** (v2.30+)
- ✅ **Node.js** (v18+ for PCF samples)
- ✅ **.NET SDK** (6.0+ for Dataverse plugin samples)
- ✅ **Power Platform CLI** (optional, for deployment) - [Install guide](https://learn.microsoft.com/power-platform/developer/cli/introduction)
- ✅ **At least one AI API key:**
  - GitHub Copilot (recommended for GitHub integration), OR
  - Anthropic Claude API key, OR
  - OpenAI API key

## Step 1: Install GitHub CLI Agentic Workflows Extension

The GitHub Agentic Workflows extension adds AI-powered workflow compilation to GitHub CLI.

**Installation:**

```bash
gh extension install github/gh-aw
```

**Verification:**

```bash
gh aw version
```

**Expected Output:**

```
GitHub Agentic Workflows CLI v1.2.0
```

**Troubleshooting:**

- **Error: `gh: 'aw' is not a gh command`**  
  Solution: Ensure GitHub CLI is installed and up to date: `gh --version`. If it's installed, try: `gh extension list` to verify the extension is present.

- **Error: `command not found: gh`**  
  Solution: Install GitHub CLI from [https://cli.github.com](https://cli.github.com)

## Step 2: Configure API Keys

GitHub Agentic Workflows need an AI backend to power the agent's decision-making.

**Recommended: GitHub Copilot (Best GitHub Integration)**

If you have GitHub Copilot access:

```bash
gh auth login --scopes "copilot"
gh secret set COPILOT_GITHUB_TOKEN
```

When prompted, paste your GitHub personal access token with `copilot` scope.

**Alternative: Anthropic Claude**

```bash
gh secret set ANTHROPIC_API_KEY
```

Paste your Claude API key when prompted.

**Alternative: OpenAI**

```bash
gh secret set OPENAI_API_KEY
```

Paste your OpenAI API key when prompted.

**Need more details?** See [api-keys-setup.md](api-keys-setup.md) for comprehensive API key configuration.

## Step 3: Clone a Sample Repository

We recommend starting with the `pcf-control-library` sample—it's the most universally applicable for Power Platform developers.

**Clone the sample:**

```bash
git clone https://github.com/microsoft/powercat-code-components.git
cd powercat-code-components
```

**Explore the structure:**

```bash
ls -la
```

You'll see:

- `ControlName/` - PCF component source code
- `.github/workflows/` - GitHub Actions (we'll generate these)
- `agentic-workflows/` - Workflow definitions (markdown files)

## Step 4: Review Workflow Definitions

Workflow definitions live in the `agentic-workflows/` folder as Markdown files.

**Open the sample triage workflow:**

```bash
code agentic-workflows/pcf-issue-triage.md
```

### Understanding the Structure

**YAML Frontmatter (Configuration):**

```yaml
---
name: PCF Issue Triage Agent
on:
  issues:
    types: [opened, edited]
permissions:
  issues: write
  contents: read
safe-outputs:
  - apply-label: ["bug", "enhancement", "needs-info", "pcf-framework", "pcf-custom"]
  - add-comment
timeout-minutes: 5
---
```

- **`name`**: Workflow display name
- **`on`**: GitHub event triggers (runs when issues are opened/edited)
- **`permissions`**: Minimal access grants for security
- **`safe-outputs`**: Constrained actions the agent can perform (security boundary)
- **`timeout-minutes`**: Maximum execution time

**Markdown Body (Agent Instructions):**

```markdown
# Role
You are an expert PCF (PowerApps Component Framework) triage agent.

# Task
Analyze the issue and apply appropriate labels based on classification rules.

# Classification Rules
- **bug**: Error messages, crashes, unexpected behavior
- **enhancement**: Feature requests, improvements
- **needs-info**: Missing details like PCF version, repro steps, error logs
- **pcf-framework**: Issues with Power Platform infrastructure
- **pcf-custom**: Issues with custom control logic

# Process
1. Read the issue title and body
2. Search for relevant code files if specific components are mentioned
3. Apply 1-3 labels based on content
4. Leave a helpful comment requesting additional information if needed
```

This natural language definition tells the AI agent exactly what to do and how to behave.

## Step 5: Compile Workflow to GitHub Actions

The `gh aw compile` command transforms the readable Markdown definition into executable GitHub Actions YAML.

**Compile the workflow:**

```bash
gh aw compile agentic-workflows/pcf-issue-triage.md
```

**Expected Output:**

```
✓ Compiled agentic-workflows/pcf-issue-triage.md
  → .github/workflows/issue-triage.yml
```

**Open the compiled workflow:**

```bash
code .github/workflows/issue-triage.yml
```

### Compare Markdown vs Compiled YAML

**Markdown (human-friendly):**
```markdown
Apply labels based on classification rules.
```

**Compiled YAML (machine-executable):**
```yaml
- name: Run Agentic Workflow
  uses: github/agentic-workflow-action@v1
  with:
    agent-instructions: |
      You are an expert PCF triage agent...
    safe-outputs: |
      apply-label: ["bug", "enhancement", "needs-info"]
    github-token: ${{ secrets.COPILOT_GITHUB_TOKEN }}
```

The compiler handles all the GitHub Actions boilerplate, letting you focus on agent behavior.

## Step 6: Push Workflow to GitHub

Now let's get this workflow running on GitHub.

**Create a new GitHub repository:**

```bash
gh repo create my-pcf-library --public --source=. --remote=origin
```

**Initialize and push:**

```bash
git add .
git commit -m "Initial commit: Add PCF library with agentic workflows"
git push -u origin main
```

**Verify on GitHub:**

1. Navigate to your repository: `https://github.com/YOUR_USERNAME/my-pcf-library`
2. Click the **Actions** tab
3. You should see "PCF Issue Triage Agent" listed as a workflow

**What Success Looks Like:**

- ✅ Actions tab shows your workflow
- ✅ Workflow status is "Waiting for events" (not errored)
- ✅ No authentication or permission errors

## Step 7: Test the Workflow

Let's create a test issue to trigger the workflow.

**Create a test issue:**

```bash
gh issue create \
  --title "Test: DatePicker submit button not rendering" \
  --body "When I use the DatePicker control in my Canvas App, the submit button doesn't appear after selecting a date. Using PCF v1.3.2 on Power Apps environment version 9.2.23092.00162."
```

**Monitor workflow execution:**

```bash
gh run list --workflow=issue-triage.yml
```

**Or watch in real-time on GitHub:**

1. Go to **Actions** tab
2. Click the latest "PCF Issue Triage Agent" run
3. Watch the job progress

### Expected Behavior

Within 30-60 seconds, the agent will:

1. ✅ **Read the issue content** - Extract title and body
2. ✅ **Search the codebase** - Look for `DatePicker` component files
3. ✅ **Apply labels** - Add `bug`, `pcf-custom` labels
4. ✅ **Leave a comment** - Provide context and diagnostic guidance

**Example Agent Comment:**

> Thanks for reporting this issue with the DatePicker control. I've labeled this as a `bug` in the `pcf-custom` control.
> 
> **Context:** I found the DatePicker component in `DatePicker/index.ts`. The submit button rendering is controlled in the `updateView()` method around line 142.
> 
> **To help diagnose:**
> - Can you check the browser console for any JavaScript errors?
> - Does the button appear in the DOM but is invisible (inspect with DevTools)?
> - Does this happen in all Canvas Apps or just specific ones?
> 
> **Files to review:**
> - `DatePicker/index.ts` (line 142-165)
> - `DatePicker/ControlManifest.Input.xml` (button configuration)

**Check the results:**

```bash
gh issue view 1
```

You should see labels applied and the agent's comment.

## Step 8: Review Agent Output

Understanding what the agent did helps you optimize workflows.

**View detailed run logs:**

```bash
gh run view --log
```

**Key things to examine:**

1. **Token Usage:**
   ```
   Agent consumed 1,247 tokens (prompt) + 384 tokens (completion) = 1,631 total
   Estimated cost: $0.012 USD
   ```

2. **Agent's Reasoning Process:**
   ```
   [Agent] Analyzing issue content...
   [Agent] Detected error description: "button doesn't appear"
   [Agent] Searching for DatePicker component...
   [Agent] Found: DatePicker/index.ts (85% relevance)
   [Agent] Classification: bug (confidence: 92%)
   [Agent] Applying labels: bug, pcf-custom
   [Agent] Generating diagnostic comment...
   ```

3. **Safe Output Constraints:**
   ```
   [Security] Validating outputs against safe-outputs policy...
   [Security] ✓ Label "bug" is allowed
   [Security] ✓ Label "pcf-custom" is allowed
   [Security] ✓ Comment action is allowed
   [Security] ✗ Blocked: Agent attempted to close issue (not in safe-outputs)
   ```

This shows the security boundaries working correctly—the agent can only perform pre-approved actions.

## Step 9: Iterate and Customize

Now that you've seen it work, let's customize the workflow.

**Modify the workflow definition:**

```bash
code agentic-workflows/pcf-issue-triage.md
```

**Add custom labels** for your team:

```yaml
safe-outputs:
  - apply-label: ["bug", "enhancement", "needs-info", "pcf-framework", "pcf-custom", "high-priority", "customer-facing"]
  - add-comment
```

**Update classification rules:**

```markdown
# Classification Rules
- **bug**: Error messages, crashes, unexpected behavior
- **enhancement**: Feature requests, improvements
- **needs-info**: Missing details like PCF version, repro steps, error logs
- **pcf-framework**: Issues with Power Platform infrastructure
- **pcf-custom**: Issues with custom control logic
- **high-priority**: Security issues, data loss, widespread impact
- **customer-facing**: Issues affecting published apps in production
```

**Recompile:**

```bash
gh aw compile agentic-workflows/pcf-issue-triage.md
```

**Push changes:**

```bash
git add .
git commit -m "Customize issue triage with team-specific labels"
git push
```

**Test with another issue:**

```bash
gh issue create \
  --title "Security: XSS vulnerability in TextInput control" \
  --body "The TextInput control doesn't sanitize user input, allowing script injection in production Canvas Apps."
```

The agent should now apply `bug`, `high-priority`, and `customer-facing` labels automatically.

## Next Steps

Congratulations! You've successfully set up and tested your first GitHub Agentic Workflow. Here's where to go next:

### Explore Other Workflow Categories

1. **Documentation Sync**
   - Workflow: `pcf-doc-updater.md`
   - Automatically updates README when code changes
   - [Learn more](workflows/doc-sync.md)

2. **Code Simplification**
   - Workflow: `pcf-code-simplifier.md`
   - Identifies and refactors complex functions
   - [Learn more](workflows/code-quality.md)

3. **Test Generation**
   - Workflow: `pcf-test-generator.md`
   - Generates Jest tests for PCF controls
   - [Learn more](workflows/testing.md)

4. **Health Reporting**
   - Workflow: `pcf-health-reporter.md`
   - Weekly reports on code quality, test coverage, issue trends
   - [Learn more](workflows/health-reporting.md)

### Optimize Costs and Performance

Review [cost-management.md](cost-management.md) to learn:
- Token usage optimization strategies
- Caching prompt contexts
- Workflow execution batching
- Estimated costs per workflow type

### Understand Security

Deep dive into [architecture.md](architecture.md) for:
- How `safe-outputs` enforce security boundaries
- Permission models and least-privilege design
- Audit logging and compliance
- Secrets management best practices

### Get Help and Share Ideas

- 💬 [GitHub Discussions](https://github.com/aidevme/github-agentic-workflows-power-platform/discussions) - Ask questions, share workflows
- 🐛 [Report Issues](https://github.com/aidevme/github-agentic-workflows-power-platform/issues)
- 📚 [Official GitHub Blog Announcement](https://github.blog/news-insights/product-news/github-agentic-workflows/)

## Quick Reference Commands

| Task | Command |
|------|---------|
| Compile workflow | `gh aw compile <workflow.md>` |
| Validate workflow syntax | `gh aw validate <workflow.md>` |
| List all workflows | `gh aw list` |
| Create test issue | `gh issue create --title "..." --body "..."` |
| View workflow runs | `gh run list --workflow=<workflow-name.yml>` |
| View run details | `gh run view <run-id> --log` |
| Watch runs in real-time | `gh run watch` |
| Re-run failed workflow | `gh run rerun <run-id>` |

## Troubleshooting

### "gh: 'aw' is not a gh command"

**Cause:** GitHub Agentic Workflows extension not installed.

**Solution:**
```bash
gh extension install github/gh-aw
gh aw version
```

### "Workflow failed: Invalid API key"

**Cause:** API key not set or incorrect.

**Solution:**
```bash
# For GitHub Copilot
gh secret set COPILOT_GITHUB_TOKEN

# For Claude
gh secret set ANTHROPIC_API_KEY

# For OpenAI
gh secret set OPENAI_API_KEY
```

Verify the key is valid by checking your provider's dashboard.

### "Agent didn't respond" or "Timeout exceeded"

**Cause:** `timeout-minutes` setting too low or agent is stuck in reasoning loop.

**Solution:**

1. Increase timeout in workflow definition:
   ```yaml
   timeout-minutes: 10  # Increase from 5 to 10
   ```

2. Simplify agent instructions to be more directive:
   ```markdown
   # Task
   Apply labels. Do not search files unless component name is mentioned.
   ```

3. Check run logs for stuck operations:
   ```bash
   gh run view <run-id> --log | grep -A5 "Agent"
   ```

### "Labels not applied"

**Cause:** Label not listed in `safe-outputs` configuration.

**Solution:**

1. Check workflow definition:
   ```yaml
   safe-outputs:
     - apply-label: ["bug", "enhancement"]  # Add missing labels here
   ```

2. Ensure labels exist in repository:
   ```bash
   gh label list
   gh label create "my-custom-label" --color "0366d6"
   ```

3. Recompile and push:
   ```bash
   gh aw compile agentic-workflows/pcf-issue-triage.md
   git add . && git commit -m "Add missing labels" && git push
   ```

### "Agent applied wrong labels"

**Cause:** Classification rules are ambiguous or insufficient.

**Solution:**

1. Add more specific examples to classification rules:
   ```markdown
   # Classification Rules
   - **bug**: Error messages ("cannot read property"), crashes, unexpected behavior
     Examples: "button not rendering", "crash on save", "null reference exception"
   - **enhancement**: Feature requests ("it would be nice"), improvements
     Examples: "add dark mode", "support for multi-language", "performance optimization"
   ```

2. Test with diverse issues to refine rules
3. Review agent reasoning in logs to understand misclassifications

### "High token costs"

**Cause:** Agent searching too many files or processing large contexts.

**Solution:**

See [cost-management.md](cost-management.md) for detailed optimization strategies:
- Limit file searches with explicit paths
- Use `max-files` parameter in search instructions
- Cache common contexts
- Adjust `temperature` for less verbose responses

### Need More Help?

For detailed troubleshooting, see **[troubleshooting.md](troubleshooting.md)** or ask in [GitHub Discussions](https://github.com/aidevme/github-agentic-workflows-power-platform/discussions).

---

## What You've Accomplished

✅ Installed GitHub Agentic Workflows CLI  
✅ Configured AI backend (Copilot/Claude/OpenAI)  
✅ Explored workflow definition structure  
✅ Compiled Markdown workflow to GitHub Actions  
✅ Deployed workflow to GitHub repository  
✅ Tested automated issue triage with AI agent  
✅ Reviewed agent reasoning and security constraints  
✅ Customized workflow for team-specific needs  

You're now ready to build intelligent automation for your Power Platform projects. Start small, measure impact, and gradually expand to more complex workflows.

**Happy automating! 🚀**

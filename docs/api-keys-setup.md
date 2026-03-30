# API Keys Setup Guide: Configuring AI Engines for GitHub Agentic Workflows

**Last Updated:** March 30, 2026  
**Estimated Setup Time:** 15-30 minutes

## Introduction

GitHub Agentic Workflows require access to an AI engine to power intelligent decision-making. This guide walks you through configuring API keys for three supported AI engines:

- **GitHub Copilot CLI** (recommended)
- **Anthropic Claude Sonnet 3.5**
- **OpenAI GPT-4**

### Why API Keys Are Needed

Agentic workflows use large language models (LLMs) to:

- Understand code context and issue descriptions
- Make intelligent classification decisions
- Generate helpful comments and suggestions
- Search repositories for relevant files

These AI capabilities are provided by external services that require authentication via API keys.

### Which Engine Should I Choose?

The right choice depends on your needs:

- **Have GitHub Copilot subscription?** → Use GitHub Copilot CLI (easiest setup, no extra cost)
- **Large codebase (>50K lines)?** → Use Claude Sonnet 3.5 (200K context window)
- **General use, no Copilot?** → Use OpenAI GPT-4 (reliable, widely adopted)

See the comparison table below for detailed differences.

## Comparison Table: Choosing Your AI Engine

| Feature | GitHub Copilot CLI | Anthropic Claude Sonnet 3.5 | OpenAI GPT-4 |
|---------|-------------------|----------------------------|--------------|
| **Cost (per 1M input tokens)** | Included with Copilot subscription | $3.00 | $5.00 |
| **Cost (per 1M output tokens)** | Included | $15.00 | $15.00 |
| **Context window** | 128K tokens (~100K lines) | 200K tokens (~150K lines) | 128K tokens (~100K lines) |
| **Code understanding** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Very Good |
| **GitHub integration** | ⭐⭐⭐⭐⭐ Native | ⭐⭐⭐ Good | ⭐⭐⭐ Good |
| **Setup complexity** | ⭐⭐⭐⭐⭐ Very Easy | ⭐⭐⭐⭐ Easy | ⭐⭐⭐⭐ Easy |
| **Speed** | ⭐⭐⭐⭐⭐ Fast | ⭐⭐⭐⭐ Fast | ⭐⭐⭐ Moderate |
| **Best for** | Teams with Copilot | High-context tasks, large repos | General purpose |
| **Free tier** | No (subscription required) | Limited credits ($5) | Limited credits ($5) |
| **Subscription cost** | $10/month (Individual), $19/seat/month (Business) | Pay-as-you-go | Pay-as-you-go |

### Cost Considerations Overview

**Typical usage for a medium-sized Power Platform project:**

- **Issue triage (100 issues/month)**: ~300K tokens
  - Copilot: $0 (included)
  - Claude: $0.90/month
  - OpenAI: $1.50/month

- **Code simplification (10 PRs/month)**: ~500K tokens
  - Copilot: $0 (included)
  - Claude: $2.25/month
  - OpenAI: $3.75/month

- **Documentation sync (weekly)**: ~200K tokens
  - Copilot: $0 (included)
  - Claude: $0.90/month
  - OpenAI: $1.50/month

**Total estimated cost:**

| Engine | Monthly Cost |
|--------|--------------|
| **GitHub Copilot CLI** | $0 (if you have Copilot subscription) |
| **Anthropic Claude** | ~$4-6/month |
| **OpenAI GPT-4** | ~$7-10/month |

**Recommendation:** Start with **GitHub Copilot CLI** if you have a Copilot subscription (simplest setup, native GitHub integration, no additional cost). Use **Claude Sonnet 3.5** for large codebases requiring extensive context. Use **GPT-4** for general-purpose tasks or if you prefer OpenAI's ecosystem.

---

## Option 1: GitHub Copilot CLI (Recommended)

### Prerequisites

- ✅ **Active GitHub Copilot subscription** (Individual, Business, or Enterprise)
- ✅ **GitHub CLI installed** ([Download here](https://cli.github.com))

Not sure if you have Copilot? Check: https://github.com/settings/copilot

### Step 1: Verify Copilot Access

First, confirm your Copilot subscription is active:

```bash
gh copilot --version
```

**Expected output:**

```
gh version 2.40.0 (2024-01-15)
GitHub Copilot CLI extension installed (v1.2.0)
```

If you see an error, install the Copilot CLI extension:

```bash
gh extension install github/gh-copilot
```

### Step 2: Authenticate GitHub CLI

Ensure GitHub CLI is authenticated with your account:

```bash
gh auth login
```

**Follow the prompts:**

1. **What account?** → GitHub.com
2. **Protocol?** → HTTPS (recommended) or SSH
3. **Authenticate?** → Login with a web browser
4. **Browser opens** → Authorize GitHub CLI

**Verification:**

```bash
gh auth status
```

Expected output:

```
✓ Logged in to github.com as YOUR_USERNAME (oauth_token)
✓ Git operations for github.com configured to use https protocol.
✓ Token: gho_************************************
✓ Token scopes: copilot, repo, workflow
```

### Step 3: Generate Copilot Token

The `COPILOT_GITHUB_TOKEN` uses your authenticated Copilot access. Generate it with:

```bash
gh auth token
```

This outputs your GitHub personal access token (PAT) which includes Copilot scope.

### Step 4: Set Repository Secret

Navigate to your repository and set the secret:

```bash
# Navigate to your repository
cd /path/to/your-repo

# Set the secret (uses your authenticated Copilot access)
gh secret set COPILOT_GITHUB_TOKEN --body "$(gh auth token)"
```

**Expected output:**

```
✓ Set Actions secret COPILOT_GITHUB_TOKEN for aidevme/github-agentic-workflows-power-platform
```

### Step 5: Verify Secret

Confirm the secret was created:

```bash
gh secret list
```

**Expected output:**

```
COPILOT_GITHUB_TOKEN  Updated 2026-03-30
```

### Step 6: Update Workflow Definition

In your agentic workflow Markdown file (e.g., `agentic-workflows/pcf-issue-triage.md`), ensure the engine is set:

```yaml
---
name: PCF Issue Triage Agent
engine: copilot-cli
timeout-minutes: 5
---
```

**That's it!** Your workflows will now use GitHub Copilot CLI.

### Troubleshooting

**Problem: "Copilot subscription not found"**

```
Error: GitHub Copilot subscription not active for this account
```

**Solution:**
- Verify your Copilot subscription at https://github.com/settings/copilot
- Ensure you're logged in with the correct account: `gh auth status`
- If using GitHub Business/Enterprise, contact your organization admin

**Problem: "Token expired"**

```
Error: Bad credentials (401)
```

**Solution:**
Re-authenticate with GitHub CLI:

```bash
gh auth login --scopes "copilot,repo,workflow"
gh secret set COPILOT_GITHUB_TOKEN --body "$(gh auth token)"
```

**Problem: "Rate limit exceeded"**

```
Error: API rate limit exceeded for user
```

**Solution:**
- Copilot has higher rate limits than basic GitHub API
- Check current limits: `gh api rate_limit`
- Wait for rate limit reset (typically 1 hour)
- Consider adding `timeout-minutes` in workflow to avoid runaway executions

---

## Option 2: Anthropic Claude Sonnet 3.5

### Prerequisites

- ✅ **Anthropic account** ([Sign up here](https://console.anthropic.com))
- ✅ **Credit card for billing** (unless using free credits)

### Step 1: Create Anthropic Account

1. Visit https://console.anthropic.com
2. Click **Sign Up** (top right)
3. **Sign up with:**
   - Email address, OR
   - GitHub account (recommended for easier integration)
4. **Complete email verification** (check inbox/spam)
5. **Accept Terms of Service**

### Step 2: Add Billing (Optional but Recommended)

New accounts receive **$5 in free credits**. For production use, add billing:

1. Navigate to **Settings → Billing**
2. Click **Add Payment Method**
3. Enter credit card information
4. **Set budget limit** (recommended: $50-100/month)

**Budget alert setup:**

1. Settings → Billing → Alerts
2. Click **Create Alert**
3. Set threshold: $25, $50, $100 (multiple alerts recommended)
4. Enter notification email

### Step 3: Generate API Key

1. Navigate to **Settings → API Keys**
2. Click **Create API Key**
3. **Name it descriptively:**
   ```
   github-agentic-workflows-powerplatform-prod
   ```
4. **Copy the key** (starts with `sk-ant-`)

   ⚠️ **IMPORTANT:** Store this securely—you won't see it again!

   **Example key format:**
   ```
   sk-ant-api03-abc123def456ghi789...
   ```

5. Click **Done**

### Step 4: Set Repository Secret

Open your terminal and navigate to your repository:

```bash
# Navigate to your repository
cd /path/to/your-repo

# Set the secret
gh secret set ANTHROPIC_API_KEY
```

When prompted, **paste your API key** (the one starting with `sk-ant-`) and press Enter.

**Expected output:**

```
✓ Set Actions secret ANTHROPIC_API_KEY for aidevme/github-agentic-workflows-power-platform
```

### Step 5: Verify Secret

```bash
gh secret list
```

**Expected output:**

```
ANTHROPIC_API_KEY  Updated 2026-03-30
```

### Step 6: Update Workflow Definition

In your workflow Markdown file:

```yaml
---
name: PCF Issue Triage Agent
engine: claude-sonnet-3.5
timeout-minutes: 5
---
```

### Step 7: Monitor Usage

Keep track of your API usage to avoid surprises:

1. **Check current usage:**
   - Visit https://console.anthropic.com/settings/usage
   - View daily/monthly token consumption

2. **Review billing:**
   - Settings → Billing → Usage History
   - Download invoices for accounting

3. **Set up alerts** (if not done in Step 2):
   - Recommended thresholds: $25, $50, $100

### Cost Estimation

**Anthropic Claude Sonnet 3.5 Pricing:**

- **Input tokens:** $3.00 per 1M tokens
- **Output tokens:** $15.00 per 1M tokens

**Example: PCF Issue Triage**

- Average issue triage: ~3,000 input tokens + 1,000 output tokens
- Cost: (3,000/1,000,000 × $3) + (1,000/1,000,000 × $15) = $0.009 + $0.015 = **$0.024 per issue**
- **100 issues/month:** ~$2.40/month

See [cost-management.md](cost-management.md) for detailed calculations and optimization strategies.

---

## Option 3: OpenAI GPT-4

### Prerequisites

- ✅ **OpenAI account** ([Sign up here](https://platform.openai.com/signup))
- ✅ **Credit card for billing** (unless using free credits)

### Step 1: Create OpenAI Account

1. Visit https://platform.openai.com/signup
2. **Sign up with:**
   - Email address
   - Google account
   - Microsoft account
3. **Complete verification** (email or phone)
4. **Accept Terms of Service**

### Step 2: Add Billing

New accounts receive **$5 in free credits** (expires after 3 months). For continued use:

1. Navigate to **Settings → Billing**
2. Click **Add payment method**
3. Enter credit card information
4. **Set usage limits** (recommended: $50/month)

**Usage limit setup:**

1. Settings → Billing → Usage limits
2. **Soft limit:** $50/month (email notification)
3. **Hard limit:** $100/month (API requests blocked)
4. Click **Save**

### Step 3: Generate API Key

1. Navigate to **API Keys** (left sidebar)
2. Click **+ Create new secret key**
3. **Name it:**
   ```
   github-agentic-workflows-prod
   ```
4. **Permissions:** All (or select specific endpoints if needed)
5. Click **Create secret key**
6. **Copy the key** (starts with `sk-proj-` or `sk-`)

   ⚠️ **IMPORTANT:** Store securely—you can't retrieve it later!

   **Example key format:**
   ```
   sk-proj-abc123def456ghi789jkl012...
   ```

7. Click **Done**

### Step 4: Set Repository Secret

```bash
# Navigate to your repository
cd /path/to/your-repo

# Set the secret
gh secret set OPENAI_API_KEY
```

Paste your API key when prompted.

**Expected output:**

```
✓ Set Actions secret OPENAI_API_KEY for aidevme/github-agentic-workflows-power-platform
```

### Step 5: Verify Secret

```bash
gh secret list
```

**Expected output:**

```
OPENAI_API_KEY  Updated 2026-03-30
```

### Step 6: Update Workflow Definition

```yaml
---
name: PCF Issue Triage Agent
engine: gpt-4
timeout-minutes: 5
---
```

### Step 7: Monitor Usage

1. **Check usage dashboard:**
   - Visit https://platform.openai.com/usage
   - View daily/monthly token consumption
   - Track costs by API endpoint

2. **Review billing:**
   - Settings → Billing → Usage
   - Download invoices

3. **Set up email alerts:**
   - Settings → Billing → Email preferences
   - Enable "Usage threshold alerts"

### Cost Estimation

**OpenAI GPT-4 Pricing:**

- **Input tokens:** $5.00 per 1M tokens
- **Output tokens:** $15.00 per 1M tokens

**Example: PCF Issue Triage**

- Average issue triage: ~3,000 input tokens + 1,000 output tokens
- Cost: (3,000/1,000,000 × $5) + (1,000/1,000,000 × $15) = $0.015 + $0.015 = **$0.03 per issue**
- **100 issues/month:** ~$3.00/month

---

## Organization-Wide Setup (GitHub Enterprise)

For teams using **GitHub Enterprise**, you can configure **organization-level secrets** that all repositories can use.

### Benefits of Organization Secrets

- ✅ **Centralized key management** - One key for all repos
- ✅ **Easier rotation** - Update once, applies everywhere
- ✅ **Usage tracking** - Monitor costs across organization
- ✅ **Access control** - RBAC for who can modify secrets
- ✅ **Compliance** - Audit trails for secret access

### Step 1: Navigate to Organization Settings

1. Go to `https://github.com/organizations/YOUR_ORG/settings/secrets/actions`
2. Or: Your Org → Settings → Secrets and variables → Actions

**Note:** You need **Owner** or **Admin** permissions to manage organization secrets.

### Step 2: Add Organization Secret

1. Click **New organization secret**
2. **Name:** (choose one based on your AI engine)
   - `COPILOT_GITHUB_TOKEN`
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
3. **Value:** Paste your API key
4. **Repository access:** Select access level
   - **All repositories** (easiest, less secure)
   - **Private repositories** (recommended for most orgs)
   - **Selected repositories** (most secure, requires manual selection)

   **Recommendation:** Choose **Selected repositories** and explicitly add only repos using agentic workflows.

5. Click **Add secret**

### Step 3: Grant Repository Access (If Using "Selected repositories")

1. After creating the secret, click **Update** next to it
2. Under **Repository access**, click **Select repositories**
3. Search for and select:
   ```
   ✓ powercat-code-components
   ✓ dataverse-plugins
   ✓ canvas-apps-library
   ```
4. Click **Update selection**

### Step 4: Update Workflow Definitions

No changes needed! Workflows automatically check for:

1. Repository secrets (highest priority)
2. Organization secrets (if not found in repo)
3. Environment secrets (if configured)

### Step 5: Verify Access

In any repository with access, run:

```bash
gh secret list
```

You should see the organization secret listed:

```
ANTHROPIC_API_KEY  Updated 2026-03-30 (from organization)
```

### Team Access Management

Control who can modify organization secrets:

1. Organization Settings → Member privileges → Base permissions
2. For secret management, grant:
   - **Owners:** Full access to all secrets
   - **Admins:** Can view and update secrets
   - **Members:** No access to secrets (default)

**Best Practice:** Create a dedicated **"Agentic Workflows Admins"** team with secret management permissions.

---

## Security Best Practices

### DO ✅

**1. Use GitHub Secrets (NOT environment variables in code)**

```yaml
# ✅ CORRECT
env:
  AI_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

```yaml
# ❌ WRONG - Never do this!
env:
  AI_API_KEY: "sk-ant-api03-abc123..."
```

**2. Rotate keys quarterly**

Set a calendar reminder:
- **January:** Rotate Q1 keys
- **April:** Rotate Q2 keys
- **July:** Rotate Q3 keys
- **October:** Rotate Q4 keys

**3. Set spending limits on AI provider accounts**

- Anthropic: $50-100/month
- OpenAI: $50/month soft limit, $100/month hard limit

**4. Monitor usage regularly**

Weekly review:
```bash
# Check workflow runs
gh run list --limit 50

# Review token usage in logs
gh run view <run-id> --log | grep -i "token"
```

**5. Use separate API keys for dev/prod repositories**

```
dev-repo → ANTHROPIC_API_KEY_DEV (lower spending limit)
prod-repo → ANTHROPIC_API_KEY_PROD (higher limit, monitored closely)
```

**6. Restrict secret access to necessary repositories only**

When using organization secrets, select specific repositories rather than "All repositories."

### DON'T ❌

**1. Commit API keys to code (even in `.env` files)**

Even in `.gitignore` files—one accidental commit and your key is in Git history forever.

**2. Share API keys between multiple teams/projects**

Makes it impossible to attribute costs and audit usage.

**3. Use personal API keys for organization repositories**

If the person leaves, the key breaks. Use organization-managed keys.

**4. Skip setting spending limits**

Without limits, a runaway workflow could cost hundreds of dollars overnight.

**5. Ignore unusual usage spikes**

Monitor usage dashboard weekly. Spikes may indicate:
- Workflows stuck in loops
- Misconfigured `timeout-minutes`
- Security incidents (compromised keys)

---

## Key Rotation Guide

### When to Rotate

Rotate API keys when:

- ✅ **Quarterly** (every 3 months, as a best practice)
- ✅ **When a team member with access leaves** the organization
- ✅ **After a suspected security incident** (leaked key, unauthorized access)
- ✅ **When upgrading AI provider tiers** (new billing structure)
- ✅ **Annually for compliance** (SOC 2, ISO 27001 requirements)

### How to Rotate (Step-by-Step)

**Step 1: Generate new API key**

Visit your AI provider console:

- **GitHub Copilot:** `gh auth token` (regenerate)
- **Anthropic:** https://console.anthropic.com/settings/api-keys → Create API Key
- **OpenAI:** https://platform.openai.com/api-keys → Create new secret key

**Step 2: Update GitHub Secret**

```bash
# Update the secret with new key
gh secret set ANTHROPIC_API_KEY
# Paste new key when prompted
```

Or via GitHub UI:
1. Repository Settings → Secrets and variables → Actions
2. Click on secret name
3. Click **Update secret**
4. Paste new value
5. Click **Update secret**

**Step 3: Test with a sample workflow run**

Trigger a test workflow to ensure new key works:

```bash
# Trigger a workflow manually
gh workflow run pcf-issue-triage.yml

# Monitor the run
gh run watch
```

Expected: Workflow completes successfully with new API key.

**Step 4: Delete old API key from provider console**

Now that the new key is confirmed working:

- **Anthropic:** Settings → API Keys → Click trash icon next to old key
- **OpenAI:** API Keys → Click trash icon next to old key
- **GitHub Copilot:** Old token automatically invalidated when you generate new one

**Step 5: Document rotation date**

Keep a rotation log:

```markdown
# API Key Rotation Log

| Date | Key Type | Rotated By | Reason |
|------|----------|------------|--------|
| 2026-03-30 | ANTHROPIC_API_KEY | @jane-dev | Quarterly rotation |
| 2026-01-15 | OPENAI_API_KEY | @john-admin | Team member departure |
```

Store this in a secure wiki or password manager (NOT in the repository).

### Automation: Scheduled Key Rotation Reminders

Set up a GitHub Issue to remind you:

```yaml
# .github/workflows/key-rotation-reminder.yml
name: API Key Rotation Reminder
on:
  schedule:
    - cron: '0 9 1 */3 *'  # Every 3 months on the 1st at 9 AM UTC

jobs:
  reminder:
    runs-on: ubuntu-latest
    steps:
      - name: Create reminder issue
        run: |
          gh issue create \
            --title "🔐 Quarterly API Key Rotation Due" \
            --body "It's time to rotate API keys for agentic workflows. See [Key Rotation Guide](docs/api-keys-setup.md#key-rotation-guide)." \
            --label "security,maintenance"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Cost Monitoring Setup

### Anthropic Claude: Budget Alerts

**Step 1: Navigate to Billing Alerts**

https://console.anthropic.com/settings/billing/alerts

**Step 2: Create Alert**

- **Alert threshold:** $25
- **Email:** your-email@company.com
- **Action when reached:** Email notification

**Step 3: Create Additional Alerts**

Recommended thresholds:

| Threshold | Action |
|-----------|--------|
| $25 | Email notification (early warning) |
| $50 | Email notification + Slack alert |
| $75 | Email notification + Review usage |
| $100 | Email notification + Pause non-critical workflows |

**Step 4: Enable Monthly Budget Cap (Optional)**

Settings → Billing → Budget Cap

- **Monthly cap:** $100
- **Behavior when reached:** Block new API requests
- **Reset:** Automatically on 1st of each month

### OpenAI GPT-4: Usage Limits

**Step 1: Navigate to Usage Limits**

https://platform.openai.com/account/billing/limits

**Step 2: Set Soft Limit**

- **Soft limit:** $50/month
- **Action:** Email notification (API continues working)

**Step 3: Set Hard Limit**

- **Hard limit:** $100/month
- **Action:** Block API requests (prevents overspending)

**Step 4: Enable Email Alerts**

Settings → Billing → Email preferences

- ✅ Usage threshold alerts
- ✅ Payment failures
- ✅ Invoice reminders

### GitHub Copilot: Seat Utilization Monitoring

GitHub Copilot costs are per-seat, not per-token:

**Monitor seat utilization:**

https://github.com/settings/copilot (for Individual)  
or  
https://github.com/organizations/YOUR_ORG/settings/copilot (for Business/Enterprise)

**Cost optimization:**

- **Review inactive seats:** Remove users who haven't used Copilot in 30 days
- **Track usage by team:** Identify high-value users vs. low-value users
- **Adjust seat allocation:** Reallocate seats to active users

### Cost Tracking Dashboard (Custom Script)

Create a PowerShell script to aggregate costs:

```powershell
# scripts/cost-dashboard.ps1

# Fetch workflow runs with token usage
$runs = gh run list --json databaseId,conclusion,startedAt --limit 100 | ConvertFrom-Json

$totalTokens = 0
foreach ($run in $runs) {
    $log = gh run view $run.databaseId --log
    if ($log -match "Token usage: (\d+)") {
        $totalTokens += [int]$matches[1]
    }
}

# Estimate cost (assuming Claude at $3/M input, $15/M output)
$estimatedCost = ($totalTokens / 1000000) * 9  # Average of input/output

Write-Output "Total tokens (last 100 runs): $totalTokens"
Write-Output "Estimated cost: `$$([math]::Round($estimatedCost, 2))"
```

Run weekly:

```bash
pwsh scripts/cost-dashboard.ps1
```

---

## Troubleshooting API Key Issues

### Common Issues

#### Problem: "Invalid API key"

**Error message:**

```
Error: Invalid API key provided
Status: 401 Unauthorized
```

**Possible causes:**

1. ❌ Typo when copying/pasting key
2. ❌ API key expired or revoked
3. ❌ Wrong key for the provider (e.g., OpenAI key used with Anthropic engine)

**Solution:**

1. Regenerate API key from provider console
2. Update GitHub Secret:
   ```bash
   gh secret set ANTHROPIC_API_KEY
   # Paste new key carefully
   ```
3. Verify engine matches provider in workflow definition:
   ```yaml
   engine: claude-sonnet-3.5  # Must match the API key provider
   ```

---

#### Problem: "Rate limit exceeded"

**Error message:**

```
Error: Rate limit reached for requests
Status: 429 Too Many Requests
Retry after: 60 seconds
```

**Possible causes:**

1. ❌ Too many workflow runs in short time
2. ❌ Workflows stuck in retry loops
3. ❌ Shared API key across multiple repositories

**Solution:**

**Immediate:**
- Wait for rate limit reset (check `Retry-After` header)
- Check workflow timeout: Ensure `timeout-minutes: 5` is set

**Long-term:**
- **Increase timeout spacing:** Add `concurrency` limits in workflows
  ```yaml
  concurrency:
    group: agentic-workflows
    cancel-in-progress: false  # Prevents parallel runs
  ```
- **Separate API keys:** Use different keys for different repos
- **Upgrade tier:** Some providers offer higher rate limits on paid plans

---

#### Problem: "Insufficient quota / Credits exhausted"

**Error message:**

```
Error: Insufficient credits. Please add billing information.
Status: 402 Payment Required
```

**Possible causes:**

1. ❌ Free tier credits exhausted ($5 trial)
2. ❌ Monthly budget cap reached
3. ❌ Payment method declined

**Solution:**

1. **Add billing information:**
   - Anthropic: https://console.anthropic.com/settings/billing
   - OpenAI: https://platform.openai.com/account/billing

2. **Increase budget cap** (if set too low)

3. **Check payment method:**
   - Verify credit card is valid
   - Check for failed payment notifications

---

#### Problem: "Secret not found"

**Error message:**

```
Error: Secret 'ANTHROPIC_API_KEY' not found in repository
Status: Workflow failed
```

**Possible causes:**

1. ❌ Secret name mismatch (typo in workflow vs. secret name)
2. ❌ Secret set in wrong repository
3. ❌ Organization secret not accessible to this repo

**Solution:**

1. **Check secret exists:**
   ```bash
   gh secret list
   ```

2. **Check secret name matches workflow:**
   ```yaml
   # Workflow definition
   env:
     AI_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}  # Must match exact secret name
   ```

3. **If using organization secret**, verify repository has access:
   - Organization Settings → Secrets → Select secret → Check repository list

---

#### Problem: "Permission denied"

**Error message:**

```
Error: Organization secret 'ANTHROPIC_API_KEY' is not accessible to this repository
Status: 403 Forbidden
```

**Possible cause:**

❌ Repository not granted access to organization secret

**Solution:**

1. **Update repository access:**
   - Go to: https://github.com/organizations/YOUR_ORG/settings/secrets/actions
   - Click on `ANTHROPIC_API_KEY`
   - Under **Repository access**, click **Add repository**
   - Select your repository
   - Click **Update selection**

2. **Or use repository-level secret** instead of organization secret:
   ```bash
   gh secret set ANTHROPIC_API_KEY --repo aidevme/your-repo
   ```

---

### Debugging Commands

**Check if secret exists:**

```bash
gh secret list
```

Expected output:

```
ANTHROPIC_API_KEY  Updated 2026-03-30
COPILOT_GITHUB_TOKEN  Updated 2026-03-15
```

---

**View workflow run logs:**

```bash
# List recent runs
gh run list --limit 10

# View specific run
gh run view 1234567890 --log

# Search logs for API errors
gh run view 1234567890 --log | grep -i "error\|401\|429"
```

---

**Test API key manually (Claude example):**

```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-3-5-20241022",
    "max_tokens": 100,
    "messages": [
      {"role": "user", "content": "Hello, respond with OK if this works."}
    ]
  }'
```

Expected response:

```json
{
  "id": "msg_abc123",
  "type": "message",
  "role": "assistant",
  "content": [{"type": "text", "text": "OK"}],
  "model": "claude-sonnet-3-5-20241022",
  "stop_reason": "end_turn",
  "usage": {"input_tokens": 15, "output_tokens": 3}
}
```

---

**Test API key manually (OpenAI example):**

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4",
    "messages": [
      {"role": "user", "content": "Hello, respond with OK if this works."}
    ],
    "max_tokens": 10
  }'
```

Expected response:

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "model": "gpt-4",
  "choices": [
    {
      "message": {"role": "assistant", "content": "OK"},
      "finish_reason": "stop"
    }
  ],
  "usage": {"prompt_tokens": 18, "completion_tokens": 2, "total_tokens": 20}
}
```

---

## FAQ

### Q: Can I use multiple AI engines in the same repository?

**A:** Yes! Configure all three secrets, then specify the engine per workflow:

```yaml
# agentic-workflows/pcf-issue-triage.md
# Uses Copilot (fast, cheap, good for simple triage)
---
name: PCF Issue Triage
engine: copilot-cli
---
```

```yaml
# agentic-workflows/pcf-code-simplifier.md
# Uses Claude (large context window for reading entire files)
---
name: PCF Code Simplifier
engine: claude-sonnet-3.5
---
```

This gives you flexibility to optimize costs and performance per workflow.

---

### Q: What happens if my API key runs out of credits?

**A:** The workflow will fail with a `402 Payment Required` or similar error. 

**Prevention:**

1. Set up **billing alerts** at 50%, 75%, 90% of budget
2. Add **payment method** to avoid interruptions
3. Set **hard limits** to prevent unexpected charges

**When it happens:**

1. Workflow logs will show the API error
2. GitHub Actions marks the run as **failed**
3. You'll receive email notification (if configured)

**Recovery:**

1. Add credits or billing info to AI provider account
2. Re-run failed workflow: `gh run rerun <run-id>`

---

### Q: Can I use a shared API key across multiple repos?

**A:** Yes, via **organization secrets** (see [Organization-Wide Setup](#organization-wide-setup-github-enterprise)).

**Pros:**

- ✅ Easier to manage (one key for all repos)
- ✅ Centralized cost tracking
- ✅ Simpler rotation (update once)

**Cons:**

- ⚠️ Shared rate limits (one repo can exhaust quota for all)
- ⚠️ Harder to attribute costs per repo
- ⚠️ Higher risk if key is compromised (affects all repos)

**Recommendation:** Use organization secrets for **GitHub Copilot** (already per-seat billing). Use **separate keys** for Anthropic/OpenAI to isolate rate limits and costs.

---

### Q: How do I see token usage per workflow?

**A:** Check workflow run logs in GitHub Actions:

```bash
# View run log
gh run view 1234567890 --log
```

Look for lines like:

```
[AI Provider] Token usage: 3,247 input + 895 output = 4,142 total
[Cost Estimate] ~$0.027 USD (Claude Sonnet 3.5)
```

**For detailed analysis**, use the cost tracking script:

```bash
pwsh scripts/token-cost-calculator.ps1
```

This aggregates token usage across all workflow runs and estimates monthly costs.

---

### Q: Are API keys ever logged or exposed?

**A:** **No.** GitHub Actions automatically **masks secrets** in logs.

**Example:**

If a workflow accidentally tries to log the API key:

```yaml
- run: echo "API Key: ${{ secrets.ANTHROPIC_API_KEY }}"
```

**Log output:**

```
API Key: ***
```

The actual key value is redacted.

**Additional protections:**

- Secrets are encrypted at rest in GitHub's database
- Secrets are only decrypted during workflow execution in secure runners
- Secrets are never sent to Git history or exposed via API

**Best practice:** Never manually log secrets, but GitHub masks them automatically if you do.

---

### Q: Can I use Azure OpenAI instead of OpenAI?

**A:** Yes, if you have Azure OpenAI Service provisioned.

**Setup differences:**

1. **Endpoint:** Use your Azure endpoint (e.g., `https://YOUR_RESOURCE.openai.azure.com/`)
2. **API Key:** Use Azure-specific API key from Azure Portal
3. **Deployment name:** Specify your model deployment name
4. **Secret name:** Use `AZURE_OPENAI_API_KEY`

**Workflow configuration:**

```yaml
---
name: PCF Issue Triage
engine: azure-openai
azure-openai-endpoint: https://contoso-openai.openai.azure.com/
azure-openai-deployment: gpt-4-deployment
---
```

**Set secret:**

```bash
gh secret set AZURE_OPENAI_API_KEY
gh secret set AZURE_OPENAI_ENDPOINT --body "https://YOUR_RESOURCE.openai.azure.com/"
```

---

### Q: What if I want to switch from one engine to another?

**A:** It's easy:

1. **Set up new API key** (follow steps for new provider)
2. **Update workflow definition:**
   ```yaml
   # Before
   engine: copilot-cli
   
   # After
   engine: claude-sonnet-3.5
   ```
3. **Recompile workflow:**
   ```bash
   gh aw compile agentic-workflows/pcf-issue-triage.md
   ```
4. **Push changes:**
   ```bash
   git add .
   git commit -m "Switch to Claude Sonnet 3.5"
   git push
   ```

No other changes needed! The workflow will use the new engine on the next run.

---

### Q: How do I restrict which team members can access API keys?

**A:** Use **GitHub's repository/organization access controls**:

**Repository-level:**

1. Settings → Actions → General → Fork pull request workflows
2. Disable "Send secrets to workflows from forked repositories"

**Organization-level:**

1. Organization Settings → Actions → General → Fork pull request workflows
2. Require approval for workflows from forks

**Team-based access:**

1. Create a team: "Agentic Workflows Admins"
2. Grant this team "Admin" access to repositories with agentic workflows
3. Only admins can modify repository secrets

**Best practice:** Use **branch protection** to require approval from specific teams before merging workflow definition changes.

---

## Next Steps

Now that you've configured your API keys:

1. ✅ **Test your setup** - [Getting Started Guide](getting-started.md)
2. ✅ **Optimize costs** - [Cost Management Guide](cost-management.md)
3. ✅ **Explore workflows** - [Workflow Examples](workflows/)
4. ✅ **Monitor usage** - Set up weekly cost review
5. ✅ **Share with team** - Document your chosen engine in team wiki

**Questions?** Ask in [GitHub Discussions](https://github.com/aidevme/github-agentic-workflows-power-platform/discussions) or review the [FAQ](faq.md).

---

**Related Documentation:**

- [Getting Started Guide](getting-started.md)
- [Security Architecture](architecture.md)
- [Cost Management](cost-management.md)
- [Troubleshooting](troubleshooting.md)

**External Links:**

- [GitHub Copilot](https://github.com/features/copilot)
- [Anthropic Console](https://console.anthropic.com)
- [OpenAI Platform](https://platform.openai.com)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

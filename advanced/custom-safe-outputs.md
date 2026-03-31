# Custom Safe Outputs

## Overview

Safe outputs are the mechanism by which AI agents take actions on GitHub repositories. While GitHub Agentic Workflows provides built-in safe outputs (like `add-comment`, `add-labels`, `assign-to-user`), you can create custom safe outputs to extend functionality and encapsulate complex action sequences.

## Table of Contents

- [Understanding Safe Outputs](#understanding-safe-outputs)
- [Built-in Safe Outputs](#built-in-safe-outputs)
- [Creating Custom Safe Outputs](#creating-custom-safe-outputs)
- [Safe Output Configuration](#safe-output-configuration)
- [Examples](#examples)
- [Power Platform Use Cases](#power-platform-use-cases)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Understanding Safe Outputs

### What Are Safe Outputs?

Safe outputs are predefined, secure actions that AI agents can perform. They provide:

1. **Safety**: Agents can only perform approved actions
2. **Traceability**: All actions are logged and auditable
3. **Consistency**: Actions follow defined patterns
4. **Validation**: Inputs are validated before execution

### How They Work

```
AI Agent Decision
    ↓
Safe Output Declaration
    ↓
Validation & Authorization
    ↓
GitHub API Call
    ↓
Action Executed
```

## Built-in Safe Outputs

### Issue & PR Comments

```yaml
safe-outputs:
  add-comment:
    issues: true
    pull-requests: true
    body: |
      {comment_text}
```

### Labels

```yaml
safe-outputs:
  add-labels:
    allowed:
      - "bug"
      - "enhancement"
      - "documentation"
```

### Assignees

```yaml
safe-outputs:
  assign-to-user:
    users:
      - "@me"
      - "username"
```

### Reviewers

```yaml
safe-outputs:
  add-reviewer:
    teams:
      - "team-name"
    users:
      - "reviewer-username"
```

### Milestones

```yaml
safe-outputs:
  assign-milestone:
    allowed:
      - "v1.0"
      - "v2.0"
```

## Creating Custom Safe Outputs

### Basic Structure

```yaml
---
name: Workflow Name
safe-outputs:
  custom-output-name:
    actions:
      - name: action-1
        uses: organization/action@version
        with:
          parameter1: {value1}
          parameter2: {value2}
---
```

### Example: Auto-Deploy on Approval

```yaml
---
name: PR Auto-Deploy
on:
  pull_request_review:
    types: [submitted]

safe-outputs:
  auto-deploy:
    actions:
      - name: Deploy to Staging
        uses: actions/github-script@v7
        with:
          script: |
            // Trigger deployment workflow
            await github.rest.actions.createWorkflowDispatch({
              owner: context.repo.owner,
              repo: context.repo.repo,
              workflow_id: 'deploy-staging.yml',
              ref: context.payload.pull_request.head.ref
            });
      - name: Add Deployment Comment
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.payload.pull_request.number,
              body: '🚀 Deploying to staging environment...'
            });
---

# Auto-Deploy Workflow

{{#if review.state == "approved"}}

{{#safe-output auto-deploy}}
trigger: true
{{/safe-output}}

{{/if}}
```

### Example: Create Sub-Issue

```yaml
---
name: Bug Triage with Sub-Tasks
on:
  issues:
    types: [labeled]

safe-outputs:
  create-subtask:
    actions:
      - name: Create Subtask Issue
        uses: actions/github-script@v7
        with:
          script: |
            const result = await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: '{subtask_title}',
              body: '{subtask_body}',
              labels: ['{subtask_labels}']
            });
            
            // Link to parent issue
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: `Created subtask: #${result.data.number}`
            });
---

# Bug Subtask Creation

{{#if issue.labels contains "needs-investigation"}}

{{#safe-output create-subtask}}
subtask_title: "Investigation: {issue.title}"
subtask_body: |
  Investigation task for #{issue.number}
  
  Steps:
  1. Reproduce the bug
  2. Identify root cause
  3. Propose solution
  
  Parent issue: #{issue.number}
subtask_labels: "investigation,bug"
{{/safe-output}}

{{/if}}
```

### Example: Update Project Board

```yaml
---
name: Project Board Automation
on:
  issues:
    types: [opened, closed]

safe-outputs:
  update-project:
    actions:
      - name: Add to Project
        uses: actions/add-to-project@v0.5.0
        with:
          project-url: https://github.com/orgs/ORG/projects/1
          github-token: ${{ secrets.PROJECT_TOKEN }}
          labeled: {required_label}
          
      - name: Update Status
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.PROJECT_TOKEN }}
          script: |
            // Update project item status field
            // Implementation depends on GitHub Projects API
---

# Project Board Integration

{{#if issue.state == "open"}}
{{#safe-output update-project}}
required_label: "in-progress"
{{/safe-output}}
{{/if}}

{{#if issue.state == "closed"}}
{{#safe-output update-project}}
required_label: "done"
{{/safe-output}}
{{/if}}
```

## Safe Output Configuration

### Action Composition

Combine multiple actions in one safe output:

```yaml
safe-outputs:
  comprehensive-triage:
    actions:
      # Step 1: Add labels
      - name: Label Issue
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.addLabels({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: {issue_number},
              labels: ['{labels}']
            });
            
      # Step 2: Add comment
      - name: Add Triage Comment
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: {issue_number},
              body: '{comment_body}'
            });
            
      # Step 3: Assign to team
      - name: Assign Issue
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.addAssignees({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: {issue_number},
              assignees: ['{assignee}']
            });
```

### Conditional Actions

```yaml
safe-outputs:
  conditional-notify:
    actions:
      - name: Notify if Critical
        if: "{severity} == 'critical'"
        uses: actions/github-script@v7
        with:
          script: |
            // Send notification
            
      - name: Regular Comment
        if: "{severity} != 'critical'"
        uses: actions/github-script@v7
        with:
          script: |
            // Post regular comment
```

### Error Handling

```yaml
safe-outputs:
  resilient-action:
    actions:
      - name: Primary Action
        continue-on-error: true
        uses: some/action@v1
        
      - name: Fallback Action
        if: steps.primary-action.outcome == 'failure'
        uses: fallback/action@v1
```

## Examples

### Example 1: PCF Component Release

```yaml
---
name: PCF Release Automation
on:
  pull_request:
    types: [closed]
  
safe-outputs:
  publish-pcf:
    actions:
      - name: Build PCF Solution
        if: "{should_release} == 'true'"
        uses: actions/github-script@v7
        with:
          script: |
            // Trigger PCF build workflow
            
      - name: Create GitHub Release
        if: "{should_release} == 'true'"
        uses: actions/create-release@v1
        with:
          tag_name: "{version}"
          release_name: "Release {version}"
          body: "{release_notes}"
          
      - name: Upload Solution Package
        if: "{should_release} == 'true'"
        uses: actions/upload-release-asset@v1
        with:
          upload_url: ${{ steps.create-release.outputs.upload_url }}
          asset_path: ./out/solution.zip
          asset_name: pcf-component-{version}.zip
---

# PCF Release Decision

{{#if pull_request.merged and pull_request.base.ref == 'main'}}

{{#agent id="release-check"}}
Analyze the PR to determine if a release is needed:
- Breaking changes?
- New features?
- Bug fixes?

Suggest semantic version bump (major/minor/patch).

Output JSON:
```json
{
  "should_release": true,
  "version": "1.2.0",
  "release_notes": "..."
}
```
{{/agent}}

{{#if release-check.output.should_release}}
{{#safe-output publish-pcf}}
should_release: "true"
version: "{release-check.output.version}"
release_notes: "{release-check.output.release_notes}"
{{/safe-output}}
{{/if}}

{{/if}}
```

### Example 2: Power Platform Environment Deployment

```yaml
---
name: Environment Deploy Request
on:
  issue_comment:
    types: [created]

safe-outputs:
  trigger-deployment:
    actions:
      - name: Validate Request
        uses: actions/github-script@v7
        with:
          script: |
            // Check if user has deploy permission
            const permission = await github.rest.repos.getCollaboratorPermissionLevel({
              owner: context.repo.owner,
              repo: context.repo.repo,
              username: context.actor
            });
            
            if (!['admin', 'write'].includes(permission.data.permission)) {
              throw new Error('Insufficient permissions');
            }
            
      - name: Trigger Power Platform Deploy
        uses: microsoft/powerplatform-actions/deploy-solution@v1
        with:
          environment-url: "{environment_url}"
          app-id: ${{ secrets.POWER_PLATFORM_APP_ID }}
          client-secret: ${{ secrets.POWER_PLATFORM_SECRET }}
          tenant-id: ${{ secrets.POWER_PLATFORM_TENANT }}
          solution-file: "{solution_file}"
          
      - name: Report Success
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body: '✅ Successfully deployed to {environment_url}'
            });
---

# Deploy Command Handler

{{#if comment.body contains "/deploy"}}

{{#agent id="deploy-parser"}}
Parse the deploy command:
`{comment.body}`

Extract:
- Environment (dev/test/prod)
- Solution name
- Any flags

Output JSON:
```json
{
  "environment": "dev|test|prod",
  "solution_file": "path/to/solution.zip",
  "environment_url": "https://..."
}
```
{{/agent}}

{{#safe-output trigger-deployment}}
environment_url: "{deploy-parser.output.environment_url}"
solution_file: "{deploy-parser.output.solution_file}"
{{/safe-output}}

{{/if}}
```

### Example 3: Automated Testing Trigger

```yaml
---
name: Smart Test Execution
on:
  pull_request:
    types: [opened, synchronize]

safe-outputs:
  run-tests:
    actions:
      - name: Determine Test Suite
        uses: actions/github-script@v7
        with:
          script: |
            // Analyze changed files to select test suites
            
      - name: Execute Unit Tests
        if: "{test_suites} contains 'unit'"
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.actions.createWorkflowDispatch({
              owner: context.repo.owner,
              repo: context.repo.repo,
              workflow_id: 'unit-tests.yml',
              ref: context.payload.pull_request.head.ref
            });
            
      - name: Execute Integration Tests
        if: "{test_suites} contains 'integration'"
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.actions.createWorkflowDispatch({
              owner: context.repo.owner,
              repo: context.repo.repo,
              workflow_id: 'integration-tests.yml',
              ref: context.payload.pull_request.head.ref
            });
            
      - name: Execute E2E Tests
        if: "{test_suites} contains 'e2e'"
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.actions.createWorkflowDispatch({
              owner: context.repo.owner,
              repo: context.repo.repo,
              workflow_id: 'e2e-tests.yml',
              ref: context.payload.pull_request.head.ref
            });
---

# Intelligent Test Selection

{{#agent id="test-selector"}}
Analyze changed files: {{pull_request.changed_files}}

Determine which test suites should run:
- Unit tests: Always run
- Integration tests: Run if API or database files changed
- E2E tests: Run if UI components changed

Output JSON with test_suites array:
```json
{
  "test_suites": ["unit", "integration", "e2e"]
}
```
{{/agent}}

{{#safe-output run-tests}}
test_suites: "{test-selector.output.test_suites}"
{{/safe-output}}
```

## Power Platform Use Cases

### 1. Solution Export & Backup

```yaml
safe-outputs:
  backup-solution:
    actions:
      - uses: microsoft/powerplatform-actions/export-solution@v1
      - uses: actions/upload-artifact@v3
```

### 2. PCF Control Publishing

```yaml
safe-outputs:
  publish-pcf-control:
    actions:
      - uses: microsoft/powerplatform-actions/pack-solution@v1
      - uses: microsoft/powerplatform-actions/import-solution@v1
```

### 3. Web Resource Deployment

```yaml
safe-outputs:
  deploy-webresources:
    actions:
      - name: Build & Minify JS
      - name: Upload to Dataverse
      - name: Publish Customizations
```

### 4. Connection Reference Update

```yaml
safe-outputs:
  update-connections:
    actions:
      - name: Parse Connection References
      - name: Update Solution XML
      - name: Commit Changes
```

### 5. Environment Variable Configuration

```yaml
safe-outputs:
  configure-env-vars:
    actions:
      - name: Extract Variables
      - name: Update Environment Values
      - name: Validate Configuration
```

## Best Practices

### 1. Input Validation

Always validate inputs before execution:

```yaml
actions:
  - name: Validate Input
    uses: actions/github-script@v7
    with:
      script: |
        const allowedValues = ['dev', 'test', 'prod'];
        if (!allowedValues.includes('{environment}')) {
          throw new Error('Invalid environment');
        }
```

### 2. Use Secrets Securely

Never expose secrets in logs:

```yaml
actions:
  - name: Deploy
    env:
      SECRET: ${{ secrets.MY_SECRET }}
    uses: actions/github-script@v7
    with:
      script: |
        // Use process.env.SECRET
        // Never log or output the secret
```

### 3. Idempotent Actions

Make actions safe to retry:

```yaml
actions:
  - name: Add Label
    uses: actions/github-script@v7
    with:
      script: |
        // Check if label exists first
        const labels = await github.rest.issues.listLabelsOnIssue({...});
        if (!labels.data.find(l => l.name === 'my-label')) {
          await github.rest.issues.addLabels({...});
        }
```

### 4. Error Messages

Provide clear error messages:

```yaml
actions:
  - name: Deploy
    uses: actions/github-script@v7
    with:
      script: |
        try {
          // Attempt deployment
        } catch (error) {
          await github.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
            body: `❌ Deployment failed: ${error.message}\n\nPlease check logs for details.`
          });
          throw error;
        }
```

### 5. Audit Logging

Log all important actions:

```yaml
actions:
  - name: Log Action
    uses: actions/github-script@v7
    with:
      script: |
        console.log('Action: {action_name}');
        console.log('Actor: ' + context.actor);
        console.log('Timestamp: ' + new Date().toISOString());
        console.log('Parameters: ' + JSON.stringify({params}));
```

## Troubleshooting

### Action Not Executing

**Symptom**: Safe output declared but action doesn't run

**Solutions**:
1. Check safe output is properly declared in frontmatter
2. Verify action name matches exactly
3. Check conditional logic (`if` statements)
4. Review GitHub Actions logs for errors

### Permission Issues

**Symptom**: "Resource not accessible" errors

**Solutions**:
1. Add required permissions in workflow frontmatter:
   ```yaml
   permissions:
     issues: write
     pull-requests: write
     contents: write
   ```
2. Use `${{ secrets.GITHUB_TOKEN }}` or PAT with sufficient scope
3. Check repository/organization settings

### Interpolation Not Working

**Symptom**: Placeholder variables not replaced

**Solutions**:
```yaml
# ❌ Wrong syntax
with:
  value: {{variable}}

# ✅ Correct syntax
with:
  value: "{variable}"
```

### Rate Limiting

**Symptom**: Actions fail with rate limit errors

**Solutions**:
1. Add delays between API calls
2. Batch operations when possible
3. Cache results to reduce API calls
4. Use authenticated requests (higher limits)

## Advanced Patterns

### Composite Safe Outputs

Create reusable action sequences:

```yaml
safe-outputs:
  full-triage:
    actions:
      - uses: ./.github/workflows/actions/classify
      - uses: ./.github/workflows/actions/assign
      - uses: ./.github/workflows/actions/notify
```

### Dynamic Action Selection

```yaml
safe-outputs:
  dynamic-deploy:
    actions:
      - name: Select Deployment Method
        uses: actions/github-script@v7
        with:
          script: |
            const method = '{deployment_method}';
            const action = method === 'fast' 
              ? 'deploy-fast' 
              : 'deploy-safe';
            core.setOutput('action', action);
            
      - name: Execute Deployment
        uses: ${{ steps.select.outputs.action }}@v1
```

## References

- [GitHub Actions Documentation](https://docs.github.com/actions)
- [GitHub Script Action](https://github.com/actions/github-script)
- [Power Platform Actions](https://github.com/microsoft/powerplatform-actions)
- [Agentic Workflows Safe Outputs Reference](https://github.github.com/gh-aw/reference/safe-outputs/)

## See Also

- [Multi-Agent Orchestration](multi-agent-orchestration.md)
- [Cost Optimization](cost-optimization.md)
- [Best Practices Guide](../docs/best-practices.md)

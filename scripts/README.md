# Workflow Compilation Scripts

This directory contains scripts to automate the compilation of GitHub Agentic Workflow templates.

## compile-workflows.ps1

PowerShell script that compiles all GitHub Agentic Workflow markdown files from `workflow-templates/` and deploys them to `.github/workflows/`.

### Usage

```powershell
# Basic usage - compile all workflows
.\scripts\compile-workflows.ps1

# Verbose mode - show file sizes and additional details
.\scripts\compile-workflows.ps1 -Verbose
```

### What it does

1. **Scans** `workflow-templates/` directory recursively for all `.md` files
2. **Compiles** each workflow using `gh aw compile` 
3. **Copies** the generated `.lock.yml` files to `.github/workflows/` with `.yml` extension
4. **Reports** summary of successful and failed compilations

### Output

```
Compiling GitHub Agentic Workflows...

Found 23 workflow template(s)

Compiling: workflow-templates\01-continuous-triage\javascript-issue-triage.md
  Deployed to .github/workflows/javascript-issue-triage.yml

Compiling: workflow-templates\02-continuous-documentation\javascript-continuous-documentation.md
  Deployed to .github/workflows/javascript-continuous-documentation.yml

Compiling: workflow-templates\03-continuous-simplification\javascript-continuous-simplification.md
  Deployed to .github/workflows/javascript-continuous-simplification.yml

==================================================
Compilation Summary
==================================================
Total templates: 23
Successfully compiled: 3
Failed: 20

Workflows are ready in .github/workflows/
```

### Exit Codes

- **0** - All workflows compiled successfully
- **1** - One or more workflows failed to compile

### Requirements

- **PowerShell** 5.1 or higher
- **GitHub CLI** (`gh`) installed and authenticated
- **gh-aw extension** installed (`gh extension install github/gh-aw`)

### Notes

- README.md files and example files will fail compilation (expected behavior)
- Only valid GitHub Agentic Workflow files with proper frontmatter will compile
- The script continues processing even if individual files fail
- Source `.md` files remain in `workflow-templates/` for documentation
- Generated `.yml` files are placed in `.github/workflows/` for GitHub Actions

### Troubleshooting

**"Command 'gh' not found"**
- Install GitHub CLI: https://cli.github.com/

**"Unknown command: aw"**
- Install gh-aw extension: `gh extension install github/gh-aw`

**"Compilation failed" for valid workflow**
- Check frontmatter syntax (YAML must be valid)
- Ensure required fields are present (name, engine, on, etc.)
- Review error output with `-Verbose` flag

### Integration with Development Workflow

**After editing workflow templates:**
```powershell
# 1. Compile all workflows
.\scripts\compile-workflows.ps1

# 2. Review changes
git diff .github/workflows/

# 3. Commit compiled workflows
git add .github/workflows/
git commit -m "feat: update workflow configurations"

# 4. Push to GitHub
git push
```

**Add to pre-commit hook (optional):**
```bash
#!/bin/bash
# .git/hooks/pre-commit
pwsh -File scripts/compile-workflows.ps1
if [ $? -ne 0 ]; then
    echo "Workflow compilation failed. Fix errors before committing."
    exit 1
fi
git add .github/workflows/
```

### See Also

- [GitHub Agentic Workflows Documentation](https://github.github.com/gh-aw/)
- [Workflow Templates](../workflow-templates/)
- [Active Workflows](../.github/workflows/)

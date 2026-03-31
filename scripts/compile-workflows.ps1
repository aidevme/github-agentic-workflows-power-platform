# compile-workflows.ps1
# Compiles all GitHub Agentic Workflow markdown files from workflow-templates
# and deploys them to .github/workflows/

param(
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"

Write-Host "Compiling GitHub Agentic Workflows..." -ForegroundColor Cyan
Write-Host ""

# Find all markdown workflow files in workflow-templates directory
$workflowTemplates = Get-ChildItem -Path "workflow-templates" -Filter "*.md" -Recurse -File

if ($workflowTemplates.Count -eq 0) {
    Write-Host "No workflow templates found in workflow-templates/" -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($workflowTemplates.Count) workflow template(s)" -ForegroundColor Green
Write-Host ""

$compiled = 0
$failed = 0

foreach ($template in $workflowTemplates) {
    $relativePath = $template.FullName.Substring($PWD.Path.Length + 1)
    Write-Host "Compiling: $relativePath" -ForegroundColor White
    
    # Compile the workflow
    $null = & gh aw compile $template.FullName 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Compilation failed" -ForegroundColor Red
        $failed++
        Write-Host ""
        continue
    }
    
    # Check if .lock.yml was generated
    $lockFile = $template.FullName -replace '\.md$', '.lock.yml'
    
    if (-not (Test-Path $lockFile)) {
        Write-Host "  No .lock.yml file generated" -ForegroundColor Yellow
        $failed++
        Write-Host ""
        continue
    }
    
    # Copy .yml and .md to .github/workflows/
    $workflowName = $template.BaseName + ".yml"
    $workflowMdName = $template.BaseName + ".md"
    $destinationYmlPath = Join-Path -Path (Join-Path -Path ".github" -ChildPath "workflows") -ChildPath $workflowName
    $destinationMdPath = Join-Path -Path (Join-Path -Path ".github" -ChildPath "workflows") -ChildPath $workflowMdName
    
    # Copy compiled .yml file
    Copy-Item -Path $lockFile -Destination $destinationYmlPath -Force
    
    # Copy source .md file (required for runtime imports)
    Copy-Item -Path $template.FullName -Destination $destinationMdPath -Force
    
    # Delete the .lock.yml file from workflow-templates after copying
    Remove-Item -Path $lockFile -Force -ErrorAction SilentlyContinue
    
    Write-Host "  Deployed to .github/workflows/$workflowName (+ .md)" -ForegroundColor Green
    $compiled++
    
    if ($Verbose) {
        $fileSize = (Get-Item $destinationYmlPath).Length / 1KB
        Write-Host "  Size: $([math]::Round($fileSize, 2)) KB" -ForegroundColor Gray
    }
    
    Write-Host ""
}

# Clean up any remaining .lock.yml files in workflow-templates
Write-Host "Cleaning up .lock.yml files..." -ForegroundColor Cyan
$lockFiles = Get-ChildItem -Path "workflow-templates" -Filter "*.lock.yml" -Recurse -File
if ($lockFiles.Count -gt 0) {
    $lockFiles | Remove-Item -Force -ErrorAction SilentlyContinue
    Write-Host "  Removed $($lockFiles.Count) .lock.yml file(s)" -ForegroundColor Green
} else {
    Write-Host "  No .lock.yml files found" -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Compilation Summary" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Total templates: $($workflowTemplates.Count)" -ForegroundColor White
Write-Host "Successfully compiled: $compiled" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "Failed: $failed" -ForegroundColor Red
}
Write-Host ""

if ($compiled -gt 0) {
    Write-Host "Workflows are ready in .github/workflows/" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Review the generated YAML files" -ForegroundColor Gray
    Write-Host "  2. Commit the changes: git add .github/workflows/" -ForegroundColor Gray
    Write-Host "  3. Push to GitHub: git push" -ForegroundColor Gray
}

if ($failed -gt 0) {
    exit 1
} else {
    exit 0
}

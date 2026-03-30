---
name: JavaScript Issue Triage
description: Automatically triages JavaScript/TypeScript issues in Power Platform projects
engine: claude-sonnet-3.5
on:
  issues:
    types: [opened, reopened]
permissions:
  issues: write
  contents: read
safe-outputs:
  - apply-label:
      allowed-labels:
        - "javascript"
        - "typescript"
        - "webresource"
        - "pcf"
        - "bug"
        - "enhancement"
        - "needs-info"
        - "npm-dependency"
        - "build-error"
        - "runtime-error"
        - "type-error"
        - "fluent-ui"
        - "react"
        - "webpack"
        - "documentation"
  - add-comment: {}
timeout-minutes: 5
---

# JavaScript/TypeScript Issue Triage Workflow

## Objective

Automatically analyze and triage issues related to JavaScript and TypeScript code in Power Platform projects, including:
- PCF (PowerApps Component Framework) controls
- Dataverse web resources
- Custom JavaScript form scripts
- TypeScript compilation issues
- NPM dependency problems
- React component issues
- Build and bundling errors

## Context

This repository contains Power Platform development projects with:
- **PCF Controls**: Built with TypeScript/React, using Fluent UI v9
- **Web Resources**: JavaScript files for Dataverse forms and entities
- **Build Tools**: Webpack, TypeScript compiler, npm/yarn
- **Testing**: Jest for unit tests, React Testing Library

### Directory Structure
```
sample-codes/
  dataverse-webresource-library/
    scripts/
      forms/               # Form event handlers
      ribbon/              # Ribbon customizations
      utils/               # Utility functions
  pcf-controls/
    src/
      [ControlName]/
        index.ts           # Main PCF entry point
        [ControlName].tsx  # React component
        ControlManifest.Input.xml
    package.json
    tsconfig.json
    webpack.config.js
```

### Technology Stack
- **Language**: TypeScript 5.x, JavaScript ES6+
- **Framework**: React 18.x (for PCF controls)
- **UI Library**: Fluent UI v9 (`@fluentui/react-components`)
- **Build**: Webpack 5.x, TypeScript compiler
- **Testing**: Jest 29.x, React Testing Library
- **PCF SDK**: `pcf-scripts`, `pcf-start`

## Task

When a JavaScript/TypeScript-related issue is opened:

1. **Read and analyze** the issue title and description
2. **Identify the issue category** (web resource, PCF, build error, runtime error, etc.)
3. **Search relevant files** if specific component or file is mentioned
4. **Apply appropriate labels** based on analysis
5. **Add a helpful comment** with triage findings and next steps

## Classification Rules

### Primary Category Labels

Apply **ONE** of these based on the issue context:

#### "webresource" 
- Issue mentions form scripts, ribbon customizations, or web resources
- File paths contain `dataverse-webresource-library/scripts/`
- Mentions `formContext`, `executionContext`, `Xrm.Page`, `Xrm.WebApi`
- Examples:
  - "Form onLoad handler not firing"
  - "Cannot access formContext in account.form.js"
  - "Web resource script error on save"

#### "pcf"
- Issue mentions PCF controls or components
- File paths contain `pcf-controls/` or mention `ControlManifest.Input.xml`
- Mentions `ComponentFramework`, `IInputs`, `IOutputs`, `updateView`, `init`
- Examples:
  - "PCF DatePicker control not rendering"
  - "Error in updateView method"
  - "Control manifest validation failed"

### Issue Type Labels

Apply **ONE** of these:

#### "bug"
- Describes unexpected behavior, errors, crashes, or incorrect output
- Contains error messages, stack traces, or exception details
- Keywords: "error", "crash", "fails", "doesn't work", "broken", "exception", "null reference"
- Examples:
  - "TypeError: Cannot read property 'getValue' of null"
  - "Build fails with webpack error"
  - "Control crashes when clicking save button"

#### "enhancement"
- Requests new features, improvements, or optimizations
- Keywords: "add", "support", "feature request", "would be nice", "enhance", "improve"
- Examples:
  - "Add support for dark mode in PCF controls"
  - "Improve error handling in form scripts"
  - "Add TypeScript type definitions"

#### "needs-info"
- Issue lacks critical information for diagnosis
- Missing: error messages, code snippets, steps to reproduce, environment details, file names
- Vague descriptions without specific details
- Examples:
  - "The control doesn't work" (no details)
  - "Error on save" (no error message)
  - "TypeScript issue" (no specifics)

### Technical Subcategory Labels

Apply **ONE OR MORE** of these if applicable:

#### "build-error"
- TypeScript compilation errors
- Webpack bundling failures
- npm/yarn install issues
- MSBuild errors for PCF controls
- Keywords: "compilation", "webpack", "tsc", "build failed", "cannot compile"

#### "runtime-error"
- JavaScript runtime exceptions
- Errors thrown during execution
- Console errors in browser
- Keywords: "TypeError", "ReferenceError", "runtime", "execution", "console error"

#### "type-error"
- TypeScript type-related issues
- Type mismatch errors
- Missing type definitions
- Keywords: "TS2304", "TS2339", "type", "TypeScript error", "Property does not exist"

#### "npm-dependency"
- Package installation failures
- Version conflicts
- Dependency resolution issues
- Keywords: "npm", "yarn", "package.json", "dependencies", "peer dependency"

#### "fluent-ui"
- Issues related to Fluent UI components
- Styling problems with Fluent UI v9
- Component API usage
- Migration from v8 to v9
- Keywords: "Fluent UI", "makeStyles", "tokens", "@fluentui/react-components"

#### "react"
- React-specific issues
- Component lifecycle problems
- useState, useEffect issues
- React hooks errors
- Keywords: "React", "useState", "useEffect", "component", "props", "state"

#### "webpack"
- Webpack configuration issues
- Module resolution problems
- Bundling errors
- Keywords: "webpack", "webpack.config.js", "module not found", "loader"

#### "documentation"
- Issues with missing or unclear documentation
- JSDoc comments needed
- README updates
- Keywords: "documentation", "docs", "readme", "how to", "unclear"

## Analysis Process

### Step 1: Read Issue Content
```
Issue Title: [title]
Issue Body: [description]
Issue Author: [username]
Labels Already Applied: [existing labels if any]
```

### Step 2: Identify Code References

Search for mentioned files if issue includes:
- Specific file names (e.g., "account.form.js", "DatePicker.tsx")
- Component names (e.g., "DatePicker", "FileUpload")
- Directory paths (e.g., "sample-codes/pcf-controls/src/DatePicker")

**File Search Pattern:**
```
IF issue mentions file name or component:
  - Search in sample-codes/dataverse-webresource-library/scripts/ for web resources
  - Search in sample-codes/pcf-controls/src/ for PCF controls
  - Read the file (first 50-100 lines if large)
  - Look for relevant code patterns related to the issue
```

### Step 3: Analyze Error Messages

If issue contains error messages:
- **TypeScript Compiler Errors**: Pattern `TS\d+:` (e.g., TS2304, TS2339)
- **Runtime Errors**: Pattern `TypeError:`, `ReferenceError:`, `Error:`
- **Build Errors**: Pattern `ERROR in`, `webpack`, `Module not found`
- **PCF Errors**: Pattern `PCF\d+`, `ControlManifest`, `MSBuild`

### Step 4: Check for Common Patterns

#### Pattern: Fluent UI v8 Usage (should be v9)
```javascript
// WRONG (v8)
import { mergeStyles } from '@fluentui/react';
import { ITheme } from '@fluentui/react';

// CORRECT (v9)
import { makeStyles, tokens } from '@fluentui/react-components';
```

If found: Add comment suggesting migration to Fluent UI v9

#### Pattern: Missing Null Checks
```javascript
// RISKY
var field = formContext.getAttribute("name");
field.setValue("New Value"); // Might throw if field is null
```

If found: Add comment about defensive programming

#### Pattern: Incorrect PCF Lifecycle Methods
```javascript
// Common mistake: Using async in init without proper handling
public init(context: ComponentFramework.Context<IInputs>) {
  await this.loadData(); // Wrong: init is not async
}
```

If found: Add comment about PCF lifecycle constraints

### Step 5: Determine Labels

Based on analysis, select labels:

**Priority order:**
1. Primary category: `webresource` OR `pcf` (choose one)
2. Issue type: `bug` OR `enhancement` OR `needs-info` (choose one)
3. Technical subcategories: 0-3 labels (e.g., `type-error`, `fluent-ui`, `react`)

**Example combinations:**
- Bug in PCF control: `pcf`, `bug`, `runtime-error`, `react`
- TypeScript build issue: `pcf`, `bug`, `build-error`, `type-error`
- Feature request: `pcf`, `enhancement`, `fluent-ui`
- Vague issue: `needs-info`

## Comment Template

After applying labels, add a comment using this template:

### For COMPLETE Issues (bug or enhancement)

```markdown
## 🤖 Automated Triage

Thank you for reporting this issue! I've analyzed the details and applied the following labels:

**Category**: [webresource/pcf]  
**Type**: [bug/enhancement]  
**Technical Areas**: [comma-separated subcategory labels]

### Analysis Summary

[Provide 2-3 sentences summarizing what the issue is about]

### Relevant Code References

[IF you found specific files or code, mention them here]
- Found in: `path/to/file.js` (lines X-Y)
- Related code: [brief description]

[IF no specific files found]
- Based on the description, this appears to affect [component/area]

### Recommendations

[Provide specific next steps or suggestions, such as:]

**For bugs:**
- ✅ Error message indicates: [interpretation]
- ✅ Likely cause: [hypothesis]
- ✅ Suggested fix: [approach]
- ✅ Check these files: [file paths]

**For enhancements:**
- ✅ This feature would require changes to: [files/components]
- ✅ Consider: [architectural implications]
- ✅ Related documentation: [links if applicable]

### Next Steps

[Choose appropriate next steps:]

**If needs-info applied:**
Please provide:
- [ ] Complete error message or stack trace
- [ ] Steps to reproduce the issue
- [ ] Expected vs actual behavior
- [ ] Environment details (browser, Dataverse version, Node version)
- [ ] Relevant code snippet or file name

**If labels applied successfully:**
A team member will review this issue and provide further guidance.

---
*This triage was performed automatically. If the labels are incorrect, please update them or mention @team-lead.*
```

### For INCOMPLETE Issues (needs-info)

```markdown
## 🤖 Automated Triage

Thank you for opening this issue! To help us investigate, we need a bit more information.

### Missing Information

Based on my analysis, the following details would be helpful:

- [ ] **Error message**: Please paste the complete error message or stack trace
- [ ] **File name**: Which JavaScript/TypeScript file is affected?
- [ ] **Steps to reproduce**: How can we reproduce this issue?
- [ ] **Expected behavior**: What should happen?
- [ ] **Actual behavior**: What actually happens?
- [ ] **Environment**:
  - Browser (Chrome, Edge, etc.) and version
  - Node.js version (run `node --version`)
  - PCF Tools version (run `pac pcf version`)
  - TypeScript version (check package.json)

### Example Template

To make investigation easier, you could provide:

```
**Error Message:**
[Paste complete error here]

**File/Component:**
[e.g., DatePicker.tsx, account.form.js]

**Steps to Reproduce:**
1. Open the form
2. Click the save button
3. Error appears

**Expected:** [What should happen]
**Actual:** [What actually happens]

**Environment:**
- Browser: Chrome 122
- Node: v18.17.0
- TypeScript: 5.0.4
```

---
*This triage was performed automatically. Once you provide the information, I'll re-analyze and apply appropriate labels.*
```

## Special Cases

### Case 1: Fluent UI v8 to v9 Migration

If issue mentions Fluent UI v8 patterns:

```markdown
### ⚠️ Fluent UI Version Notice

I noticed this issue may involve Fluent UI v8 patterns. This repository uses **Fluent UI v9**.

**Common migrations:**

| v8 (Old) | v9 (New) |
|----------|----------|
| `import { mergeStyles } from '@fluentui/react'` | `import { makeStyles } from '@fluentui/react-components'` |
| `theme.palette.themePrimary` | `tokens.colorBrandBackground` |
| `<PrimaryButton>` | `<Button appearance="primary">` |
| `ITheme` | `Theme` (from Fluent UI v9) |

See Fluent UI v9 migration guide: https://react.fluentui.dev/?path=/docs/concepts-migration--page
```

### Case 2: TypeScript Configuration Issues

If issue mentions TypeScript errors:

```markdown
### 🔧 TypeScript Configuration

Common TypeScript issues in this project:

1. **Ensure tsconfig.json is present** in your PCF control directory
2. **Check paths configuration** for module resolution
3. **Verify dependencies** in package.json match TypeScript version

**Useful commands:**
```bash
# Check TypeScript version
npx tsc --version

# Compile with verbose output
npx tsc --noEmit --listFiles

# Rebuild PCF control
npm run build
```
```

### Case 3: PCF Build Errors

If issue is about PCF build failures:

```markdown
### 🛠️ PCF Build Troubleshooting

**Step 1: Clean and rebuild**
```bash
npm run clean
npm install
npm run build
```

**Step 2: Verify PCF tools**
```bash
pac pcf version
```

**Step 3: Check for common issues**
- Ensure `ControlManifest.Input.xml` is valid
- Verify all imports are resolved
- Check webpack.config.js for errors

**Step 4: Review build output**
Look for specific error codes (PCF1001, PCF1014, etc.) and search documentation.
```

## Important Guidelines

### DO:
✅ Read the entire issue description carefully  
✅ Search for mentioned files before concluding  
✅ Apply multiple technical subcategory labels if relevant  
✅ Provide specific, actionable recommendations  
✅ Link to relevant documentation when applicable  
✅ Be empathetic and helpful in tone  
✅ Acknowledge the issue reporter  

### DON'T:
❌ Apply more than ONE primary category label (webresource OR pcf)  
❌ Apply more than ONE issue type label (bug OR enhancement OR needs-info)  
❌ Make assumptions about code without searching  
❌ Apply labels not in the allowed list  
❌ Write generic unhelpful comments  
❌ Blame the reporter for incomplete information  
❌ Provide solutions that require unsafe actions (deleting node_modules without backup)  

## Examples

### Example 1: PCF Runtime Error

**Issue Title:** "DatePicker control throws TypeError on save"

**Issue Body:**
```
When I click the save button, the DatePicker PCF control crashes with:

TypeError: Cannot read property 'getValue' of undefined
  at DatePicker.tsx:45

Using latest version of the control.
```

**Expected Labels:** `pcf`, `bug`, `runtime-error`, `react`

**Expected Comment Excerpt:**
```markdown
## 🤖 Automated Triage

**Category**: PCF Control  
**Type**: Bug (Runtime Error)  
**Technical Areas**: React

### Analysis Summary

The error indicates a null reference exception in the DatePicker React component. 
This typically occurs when accessing a variable or prop that is undefined.

### Recommendations

✅ Check DatePicker.tsx line 45 for defensive null checks
✅ Verify the component receives all required props
✅ Ensure PCF context is properly initialized before accessing properties

### Suggested Fix
```typescript
// Add null check before getValue()
const value = this.props.dateField?.getValue();
if (value !== undefined) {
  // Process value
}
```
```

### Example 2: TypeScript Build Error

**Issue Title:** "TS2304: Cannot find name 'ComponentFramework'"

**Issue Body:**
```
Getting TypeScript error when building PCF control:

error TS2304: Cannot find name 'ComponentFramework'.
src/FileUpload/index.ts(12,45): error TS2304: Cannot find name 'ComponentFramework'

My tsconfig.json looks correct to me.
```

**Expected Labels:** `pcf`, `bug`, `build-error`, `type-error`

**Expected Comment Excerpt:**
```markdown
## 🤖 Automated Triage

**Category**: PCF Control  
**Type**: Bug (Build Error)  
**Technical Areas**: TypeScript, Build Configuration

### Analysis Summary

TypeScript cannot find the `ComponentFramework` namespace, which is provided by the PCF SDK type definitions.

### Likely Cause

Missing or incorrect PCF type definitions in your project.

### Recommendations

**Step 1: Verify PCF types installation**
```bash
npm list @types/powerapps-component-framework
```

**Step 2: Ensure types are in tsconfig.json**
```json
{
  "compilerOptions": {
    "types": ["powerapps-component-framework"]
  }
}
```

**Step 3: Reinstall if necessary**
```bash
npm install --save-dev @types/powerapps-component-framework
```
```

### Example 3: Incomplete Issue

**Issue Title:** "Error in form script"

**Issue Body:**
```
The account form is showing an error. How do I fix this?
```

**Expected Labels:** `needs-info`

**Expected Comment Excerpt:**
```markdown
## 🤖 Automated Triage

Thank you for opening this issue! To help us investigate, we need more details.

### Missing Information

- [ ] **Error message**: What is the exact error message?
- [ ] **File name**: Which form script file (e.g., account.form.js)?
- [ ] **When does it occur**: On load, on save, on field change?
- [ ] **Steps to reproduce**: What actions trigger the error?

### Example Template

```
**Error Message:**
TypeError: Cannot read property 'setValue' of null

**File:**
sample-codes/dataverse-webresource-library/scripts/forms/account.form.js

**When:**
Occurs when the form loads

**Steps:**
1. Open an existing account record
2. Error appears in browser console
```

Once you provide these details, I can better analyze and triage the issue!
```

## Execution Checklist

Before submitting triage:

- [ ] Issue content fully read and understood
- [ ] File search performed if specific files/components mentioned
- [ ] Primary category label selected (webresource OR pcf)
- [ ] Issue type label selected (bug OR enhancement OR needs-info)
- [ ] Relevant technical subcategory labels applied (0-3)
- [ ] Comment follows appropriate template
- [ ] Comment includes specific recommendations
- [ ] Tone is helpful and professional
- [ ] No unsafe actions recommended

## Success Metrics

A successful triage means:
- ✅ Labels accurately reflect the issue
- ✅ Comment provides actionable next steps
- ✅ Issue reporter feels heard and supported
- ✅ Team members can quickly understand the issue type
- ✅ Triage reduces back-and-forth clarification needed

---

**Now begin the triage process!**

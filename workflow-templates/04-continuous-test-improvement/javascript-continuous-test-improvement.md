---
name: JavaScript Continuous Test Improvement
description: Automatically identifies test coverage gaps and implements missing tests for JavaScript code in Dataverse web resources
engine: claude-sonnet-3.5
on:
  schedule:
    - cron: "0 4 * * 1,4"  # Monday and Thursday at 4 AM UTC
  workflow_dispatch: {}
permissions:
  contents: read
  pull-requests: read
tools:
  github:
    toolsets: [pull_requests, search]
safe-outputs:
  create-pull-request: {}
timeout-minutes: 20
---

# JavaScript Continuous Test Improvement

## Objective

Automatically analyze test coverage for JavaScript code in Dataverse web resources, identify critical gaps, and implement missing tests incrementally — without waiting for developers to find time in their sprint.

**Scope**: This workflow focuses exclusively on JavaScript web resources (form scripts, ribbon scripts, utility functions). PCF controls use TypeScript and have separate testing workflows.

## The Testing Problem

The typical pattern on development teams:

1. A developer implements a feature under deadline pressure
2. They write "just enough" tests to pass code review
3. Edge cases, error conditions, and integration paths are left untested
4. Test coverage metrics slowly decline sprint over sprint
5. When a bug escapes to production, the post-mortem includes "add more tests" as an action item
6. The cycle repeats

Traditional approaches to test quality — mandatory coverage thresholds, blocking PRs below 80% coverage, quarterly testing sprints — all suffer from the same weakness: they assume developers have time to write tests. In practice, feature delivery always outcompetes test writing for developer attention.

## How This Workflow Works

Instead of mandating that developers write all tests, this workflow uses AI to continuously analyze code, identify gaps, and implement tests automatically — with human review of the results.

The workflow:

1. **Analyzes recent code changes** — Looks at commits from the last 7 days to understand what code was added or modified
2. **Reviews current test coverage** — Identifies which functions, branches, or paths lack adequate test coverage
3. **Prioritizes high-value tests** — Focuses on business logic, public APIs, and error conditions rather than trivial getters/setters
4. **Generates test implementations** — Writes actual test code (not just suggestions) following the project's testing patterns
5. **Creates pull requests** — Proposes tests as reviewable PRs with clear explanations of what's being tested and why

**Key insight:** The agent understands the difference between testing critical business logic versus trivial utility functions. It doesn't blindly chase 100% coverage — it targets the tests that actually matter.

## Scope and Context

### Repository Structure

This workflow analyzes JavaScript code in:

```
sample-codes/
  dataverse-webresource-library/
    scripts/
      forms/                  # Form event handlers
      ribbons/                # Ribbon customizations
      utils/                  # Utility functions
      shared/                 # Shared utilities
      __tests__/              # Jest tests
```

### Technology Stack

- **Testing Framework**: Jest 29.x
- **Language**: JavaScript ES6+
- **Coverage Tool**: Jest coverage (built-in)
- **Mocking**: Jest mocks
- **Dataverse APIs**: Xrm.WebApi, Xrm.Navigation, formContext

### Files in Scope

**Include:**
- Dataverse web resources: form scripts (`*.form.js`), ribbon scripts (`*.ribbon.js`)
- Utility modules: shared functions, helpers, validators (`*.js`)
- Business logic modules in `scripts/` directory
- Files modified in the last **7 days** (focus on recent changes)

**Exclude:**
- TypeScript files: `*.ts`, `*.tsx`, `*.d.ts` (use separate PCF workflow)
- Build configuration: `webpack.config.js`, `package.json`
- Documentation: `README.md`, `*.md` files
- Already well-tested files: coverage > 85%
- Test files themselves: `*.test.js`, `*.spec.js`

## Test Coverage Analysis

### Step 1: Identify Recent Code Changes

Search for JavaScript files modified in the last 7 days:

```
Use GitHub search to find files:
- Language: JavaScript
- Modified: last 7 days
- Path: sample-codes/dataverse-webresource-library/scripts/**/*.js
- Exclude: __tests__/, *.test.js, *.spec.js
```

### Step 2: Analyze Test Coverage for Each File

For each file found, determine:

1. **Does a corresponding test file exist?**
   - `src/MyComponent.tsx` → should have `src/__tests__/MyComponent.test.tsx`
   - `scripts/forms/account.form.js` → should have `scripts/__tests__/account.form.test.js`

2. **What functions/methods lack test coverage?**
   - Public API methods
   - Event handlers
   - Business logic functions
   - Error handling paths

3. **What edge cases are untested?**
   - Null/undefined parameter handling
   - Empty arrays or objects
   - Invalid data types
   - Boundary conditions (0, -1, empty string, etc.)

4. **What error conditions are untested?**
   - Try-catch blocks without tests verifying the catch path
   - Validation logic without tests for invalid inputs
   - API calls without tests for failure responses

### Step 3: Prioritize Test Gaps

Rank test gaps by impact:

**Priority 1 - Critical Business Logic (MUST TEST):**
- Data transformation functions
- Calculation or validation logic
- State management operations
- Financial calculations, date manipulations
- Security-critical code (authentication, authorization)

**Priority 2 - Event Handlers (SHOULD TEST):**
- Form event handlers: `onLoad()`, `onSave()`, field `onChange()` handlers
- Ribbon command actions and enable rules
- Event registration and cleanup

**Priority 3 - Error Conditions (HIGH VALUE):**
- Invalid prop types or values
- Missing required parameters
- Null/undefined handling
- API error responses (4xx, 5xx)
- Timeout scenarios

**Priority 4 - Integration Points (IMPORTANT):**
- Dataverse context API interactions
- Xrm.WebApi calls
- Xrm.Navigation methods
- Form context operations
- Entity attribute manipulation

**Priority 5 - Edge Cases (NICE TO HAVE):**
- Boundary values (min/max ranges)
- Empty collections
- Concurrent operations
- Race conditions

### Step 4: Select Tests to Implement

**Choose 3-5 test scenarios per file** that provide the highest value:
- Prefer Priority 1 and 2 gaps
- Include at least one error condition test (Priority 3)
- Balance coverage breadth (multiple functions) vs depth (multiple scenarios per function)

**Do NOT implement tests for:**
- Trivial getters/setters: `getName() { return this.name; }`
- Simple prop forwarding: `<Button onClick={onClick} />`
- Auto-generated code or type definitions
- Code that requires live Dataverse environment (flag for manual creation instead)

## Test Implementation Guidelines

### General Test Structure

Follow the **Arrange-Act-Assert** pattern:

```javascript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should [expected behavior] when [condition]', () => {
      // Arrange - Set up test data and mocks
      const mockData = { id: '123', name: 'Test' };
      const mockContext = createMockFormContext();
      
      // Act - Execute the method under test
      const result = myFunction(mockData, mockContext);
      
      // Assert - Verify the outcome
      expect(result).toBe(expected);
      expect(mockContext.getAttribute).toHaveBeenCalledWith('name');
    });
  });
});
```

### Test Naming Conventions

Use descriptive test names that explain:
- **WHAT** is being tested
- **WHEN** (the condition or scenario)
- **EXPECTED** outcome

**Good examples:**
- `should calculate total price when all items have valid prices`
- `should throw error when required field is missing`
- `should disable save button when form validation fails`

**Bad examples:**
- `test1`, `testFunction`, `should work`
- `testCalculateTotal` (doesn't explain the scenario)

### Mocking External Dependencies

**Dataverse Form Context:**
```javascript
const createMockFormContext = () => ({
  getAttribute: jest.fn((name) => ({
    getValue: jest.fn(() => 'mock value'),
    setValue: jest.fn(),
    addOnChange: jest.fn(),
  })),
  ui: {
    setFormNotification: jest.fn(),
    clearFormNotification: jest.fn(),
  },
  data: {
    entity: {
      getEntityName: jest.fn(() => 'account'),
    },
  },
});
```

**Xrm.WebApi:**
```javascript
// Mock Xrm global object
global.Xrm = {
  WebApi: {
    retrieveRecord: jest.fn().mockResolvedValue({
      accountid: '123',
      name: 'Test Account'
    }),
    updateRecord: jest.fn().mockResolvedValue({ id: '123' }),
  },
  Navigation: {
    openForm: jest.fn().mockResolvedValue(),
    openAlertDialog: jest.fn().mockResolvedValue(),
  }
};
```

### Testing Patterns by Component Type

#### Form Script Tests

**Test onLoad handler:**
```javascript
describe('AccountForm.OnLoad', () => {
  it('should set default values on form create', () => {
    const formContext = createMockFormContext();
    formContext.ui.getFormType = jest.fn(() => 1); // Create
    
    AccountForm.OnLoad({ getFormContext: () => formContext });
    
    expect(formContext.getAttribute('statuscode').setValue)
      .toHaveBeenCalledWith(1);
  });
});
```

**Test field onChange handler:**
```javascript
it('should validate email format when email field changes', () => {
  const formContext = createMockFormContext();
  const emailAttr = formContext.getAttribute('emailaddress1');
  emailAttr.getValue.mockReturnValue('invalid-email');
  
  AccountForm.OnEmailChange({ getFormContext: () => formContext });
  
  expect(formContext.ui.setFormNotification)
    .toHaveBeenCalledWith(
      'Invalid email format',
      'ERROR',
      'email_validation'
    );
});
```

**Test business logic:**
```javascript
it('should calculate discount when order total exceeds threshold', () => {
  const total = 10000;
  const discount = AccountForm.calculateDiscount(total);
  
  expect(discount).toBe(1000); // 10% discount
});
```

#### Ribbon Script Tests

**Test command enable rule:**
```javascript
describe('enableRuleCanApprove', () => {
  it('should return true when user has approve privilege', () => {
    const mockContext = {
      userSettings: { roles: [{ name: 'Approver' }] }
    };
    
    const result = RibbonCommands.enableRuleCanApprove(mockContext);
    
    expect(result).toBe(true);
  });
  
  it('should return false when user lacks approve privilege', () => {
    const mockContext = {
      userSettings: { roles: [{ name: 'Viewer' }] }
    };
    
    const result = RibbonCommands.enableRuleCanApprove(mockContext);
    
    expect(result).toBe(false);
  });
});
```

#### Utility Function Tests

**Test with various inputs:**
```javascript
describe('formatPhoneNumber', () => {
  it('should format 10-digit US phone number', () => {
    expect(formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
  });
  
  it('should return empty string for null input', () => {
    expect(formatPhoneNumber(null)).toBe('');
  });
  
  it('should return original for invalid format', () => {
    expect(formatPhoneNumber('abc')).toBe('abc');
  });
});
```

### Async/Promise Testing

**Test async functions:**
```javascript
it('should fetch account data from Dataverse', async () => {
  const mockAccount = { accountid: '123', name: 'Test' };
  Xrm.WebApi.retrieveRecord.mockResolvedValue(mockAccount);
  
  const result = await fetchAccountById('123');
  
  expect(result).toEqual(mockAccount);
  expect(Xrm.WebApi.retrieveRecord).toHaveBeenCalledWith(
    'account',
    '123',
    '?$select=accountid,name'
  );
});
```

**Test error handling:**
```javascript
it('should handle API errors gracefully', async () => {
  const error = new Error('Network error');
  Xrm.WebApi.retrieveRecord.mockRejectedValue(error);
  
  await expect(fetchAccountById('123')).rejects.toThrow('Network error');
});
```

## Pull Request Creation

### When to Create a PR

Create a pull request when:
- ✅ You've identified 3-5 meaningful test gaps in a file
- ✅ Tests implement Priority 1, 2, or 3 scenarios
- ✅ Tests follow existing project patterns (Jest, RTL)
- ✅ All tests pass locally
- ✅ Tests add meaningful coverage (not just trivial cases)

**Do NOT create a PR when:**
- ❌ Only trivial tests would be added (getters/setters)
- ❌ File requires live Dataverse environment for testing
- ❌ File is already well-tested (>85% coverage)
- ❌ No clear test scenarios exist (flag for human review instead)

### PR Structure

**One PR per file** to keep reviews focused and manageable.

**Title format:**
```
test: improve coverage for [FileName]
```

**Examples:**
- `test: improve coverage for account.form.js`
- `test: improve coverage for contact.ribbon.js`
- `test: improve coverage for formatPhoneNumber utility`

### PR Description Template

```markdown
## Test Coverage Improvements for [ComponentName]

### Coverage Gaps Identified

- [ ] `functionName()` - had no tests
- [ ] Error handling in `anotherFunction()` - catch block untested  
- [ ] Edge case: null parameter in `validateInput()` - not covered

### Tests Added

**1. Test: [Test Name]**
- **Scenario**: [Describe the condition being tested]
- **Coverage**: [What code path this validates]
- **Value**: [Why this test matters]

**2. Test: [Test Name]**
- **Scenario**: [Describe the condition being tested]
- **Coverage**: [What code path this validates]
- **Value**: [Why this test matters]

[Continue for each test...]

### Coverage Impact

- **Before**: [X%] coverage (if measurable via jest --coverage)
- **After**: [Y%] coverage
- **Lines added**: [N] lines of test code

### Edge Cases or Bugs Discovered

[If any issues were found while writing tests, describe them here]

### Notes for Reviewer

- Tests follow existing Jest/RTL patterns in the repository
- All external dependencies are mocked appropriately
- Tests are independent and can run in any order

### Manual Testing Required

[If any scenarios require manual validation in a live environment, list them here]
```

### PR Labels

Apply appropriate labels:
- `test`: Indicates test-related changes
- `javascript`: Language-specific
- `webresource` or `utility`: Component type
- `forms`, `ribbons`, or `shared`: Subdirectory type
- `automated`: Created by workflow

## Workflow Execution Process

### Step 1: Discover Recent Changes

1. Search for JavaScript files (*.js) in `sample-codes/dataverse-webresource-library/scripts/` modified in last 7 days
2. Filter out test files (*.test.js, *.spec.js), documentation, and configuration
3. Filter out TypeScript files (*.ts, *.tsx) - these are tested separately
4. Identify files with <85% test coverage (if coverage data available)

### Step 2: Analyze Each File

For each file:
1. Read the source code
2. Identify all public functions, methods, and exported symbols
3. Search for corresponding test file
4. Compare test coverage to source code
5. List untested functions and edge cases

### Step 3: Prioritize Tests

1. Rank test gaps using Priority 1-5 system
2. Select 3-5 high-value test scenarios per file
3. Skip files with only low-priority gaps

### Step 4: Implement Tests

1. Create or update test file in `__tests__/` directory
2. Write tests following patterns in existing test files
3. Use appropriate mocks for external dependencies
4. Ensure tests are isolated and repeatable

### Step 5: Validate Tests

1. Run tests locally: `npm test [testFile]`
2. Verify all tests pass
3. Check that tests actually cover the intended code paths
4. Ensure no flaky tests (run multiple times)

### Step 6: Create Pull Request

1. Use create-pull-request safe output
2. Create one PR per file
3. Use proper title and description template
4. Apply appropriate labels

## Important Constraints

### Do NOT Test

- **Trivial code**: Simple getters, setters, basic property access
- **TypeScript files**: Use separate PCF control testing workflow
- **Third-party libraries**: Trust that external libraries are tested
- **Configuration**: webpack.config.js, package.json
- **Documentation**: README files, markdown

### Do NOT Mock

- **Pure functions**: Functions without side effects don't need mocking
- **Simple logic**: If/else, basic calculations
- **Math operations**: Standard JavaScript Math functions

### Testing Environment Limitations

Some scenarios **cannot be tested** in Jest and require manual validation:

- **Dataverse environment interactions**: Actual CRM record operations
- **Authentication flows**: OAuth, ADAL token acquisition
- **Browser-specific APIs**: Some DOM APIs not available in Jest/jsdom
- **Deployment configurations**: Solution packaging, web resource registration

For these scenarios, **create an issue** instead of a test, documenting:
- What needs manual testing
- Steps to reproduce
- Expected outcome
- Why automated testing isn't feasible

## Success Metrics

A successful test improvement PR achieves:

- ✅ Increases test coverage for critical business logic
- ✅ Adds tests for error conditions and edge cases
- ✅ Follows project's existing test patterns and conventions
- ✅ Tests are clear, maintainable, and well-documented
- ✅ All tests pass consistently (no flaky tests)
- ✅ Code reviewers understand what's being tested and why

## Long-Term Impact

### The Compounding Effect

Like continuous simplification, the value of continuous test improvement compounds over time:

- **Sprint 1**: Agent adds tests for 5 uncovered methods
- **Sprint 2**: Developers catch a regression because those new tests exist
- **Sprint 3**: Agent adds error condition tests, catching an edge case bug before production
- **Sprint 6**: Test coverage is materially higher than teams without continuous testing
- **Sprint 12**: Production bugs decrease because critical paths are thoroughly tested

### Why This Matters

For enterprise teams managing complex Power Platform solutions, continuous test improvement can mean the difference between confident deployments and production incidents that could have been prevented.

**Trust but verify**: Just because it worked yesterday doesn't mean it works today. Code changes, dependencies update, environment configurations drift, and assumptions become invalid. Continuous testing catches these failures before they reach production.

---

## Begin Workflow Execution

1. Search for JavaScript files (*.js) in `sample-codes/dataverse-webresource-library/scripts/` modified in the last 7 days
2. Exclude TypeScript files, test files, and documentation
3. Analyze test coverage gaps for each JavaScript file
4. Prioritize test scenarios (Priority 1-3)
5. Implement 3-5 high-value tests per file
6. Create focused pull requests with clear descriptions
7. Target one file per PR to keep reviews manageable

**Focus**: Dataverse web resource JavaScript only. PCF controls (TypeScript) have separate testing workflows.

Focus on quality over quantity. Better to have 5 excellent tests that catch real bugs than 50 trivial tests that add no value.

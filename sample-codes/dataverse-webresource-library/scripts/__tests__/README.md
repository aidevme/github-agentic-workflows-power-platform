# Dataverse Web Resource Tests

This directory contains Jest unit tests for Dataverse web resource JavaScript files.

## Test Structure

```
__tests__/
  ├── forms/
  │   ├── account.form.test.js    # Tests for account form scripts
  │   └── contact.form.test.js    # Tests for contact form scripts
  └── ribbons/
      ├── account.ribbon.test.js  # Tests for account ribbon commands
      └── contact.ribbon.test.js  # Tests for contact ribbon commands
```

## Running Tests

```bash
# Install dependencies first
npm install

# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- account.form.test.js

# Run tests matching a pattern
npm test -- --testNamePattern="onLoad"
```

## Test Coverage

Coverage reports are generated in the `coverage/` directory when running `npm run test:coverage`.

To view the HTML coverage report:
```bash
npm run test:coverage
# Then open: coverage/lcov-report/index.html
```

## Writing Tests

### Test Structure (Arrange-Act-Assert)

```javascript
describe('FunctionName', () => {
  it('should [expected behavior] when [condition]', () => {
    // Arrange - Set up test data and mocks
    const mockData = { id: '123' };
    
    // Act - Execute the function
    const result = myFunction(mockData);
    
    // Assert - Verify the outcome
    expect(result).toBe(expected);
  });
});
```

### Mock Helpers

Each test file includes mock helpers for:
- **formContext** - Simulates Dynamics formContext API
- **Xrm global** - Simulates Xrm.WebApi, Xrm.Navigation, etc.
- **executionContext** - Simulates event execution context

### Common Mocks

```javascript
// Mock formContext
const mockFormContext = createMockFormContext();

// Mock Xrm.WebApi.retrieveRecord
Xrm.WebApi.retrieveRecord.mockResolvedValue({ 
  accountid: '123',
  name: 'Test Account' 
});

// Mock Xrm.Navigation.openForm
Xrm.Navigation.openForm.mockResolvedValue({ saved: true });

// Mock attribute value
mockFormContext.getAttribute('name').getValue.mockReturnValue('Test');
```

## CI/CD Integration

Tests run automatically in GitHub Actions workflows. The test improvement workflow:
1. Analyzes code coverage gaps
2. Generates new tests using AI
3. Creates pull requests with test implementations

## Best Practices

- ✅ Test public API methods and event handlers
- ✅ Test edge cases and error conditions
- ✅ Use descriptive test names that explain WHAT, WHEN, and EXPECTED
- ✅ Mock external dependencies (Xrm.WebApi, form controls)
- ✅ Keep tests focused and independent
- ❌ Don't test implementation details
- ❌ Don't test trivial getters/setters
- ❌ Don't create tests that depend on other tests

## Debugging Tests

```bash
# Run tests with verbose output
npm run test:verbose

# Run single test file with debugging
node --inspect-brk node_modules/.bin/jest __tests__/forms/account.form.test.js
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Dataverse Client API Reference](https://docs.microsoft.com/en-us/power-apps/developer/model-driven-apps/clientapi/reference)
- [Testing Best Practices](https://jestjs.io/docs/setup-teardown)

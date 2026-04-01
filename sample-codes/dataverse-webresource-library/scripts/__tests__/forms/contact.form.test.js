/**
 * Unit tests for Contact Form JavaScript
 * Tests: contact.form.js
 *
 * Coverage improvements over initial version:
 * - Fixed broken test method names (public API uses OnNameChange, OnBirthdateChange)
 * - Added tests for ValidatePhoneNumber pure function (6 scenarios)
 * - Added tests for FormatPhoneNumber pure function (5 scenarios)
 * - Added tests for OnDoNotEmailChange email opt-out business logic (4 scenarios)
 * - Added tests for OnJobTitleChange auto-categorization logic (5 scenarios)
 * - Added meaningful OnSave validation tests with real assertions (5 scenarios)
 * - Fixed getAttribute mock to return per-attribute objects, enabling
 *   reliable mockReturnValue configuration for behavior-based assertions
 * - Fixed script loading: browser scripts use var globals; window.eval() is
 *   required in Jest/jsdom so the IIFE sets AIDEVME on the window object.
 */

const fs = require('fs');
const path = require('path');

// Read script content once; re-eval in beforeEach to reset private module state.
const CONTACT_FORM_SCRIPT = fs.readFileSync(
    path.resolve(__dirname, '../../forms/contact.form.js'),
    'utf8'
);

/**
 * Create a form context mock where each attribute name maps to its own
 * persistent mock object. This allows tests to configure return values on
 * specific attributes and assert against them after handler execution.
 */
function createMockFormContext() {
    const attributeMocks = {};
    const controlMocks = {};

    return {
        getAttribute: jest.fn((name) => {
            if (!attributeMocks[name]) {
                attributeMocks[name] = {
                    getValue: jest.fn(() => null),
                    setValue: jest.fn(),
                    addOnChange: jest.fn(),
                    removeOnChange: jest.fn(),
                    setRequiredLevel: jest.fn(),
                    getRequiredLevel: jest.fn(() => 'none'),
                };
            }
            return attributeMocks[name];
        }),
        getControl: jest.fn((name) => {
            if (!controlMocks[name]) {
                controlMocks[name] = {
                    setVisible: jest.fn(),
                    setDisabled: jest.fn(),
                    getDisabled: jest.fn(() => false),
                    setNotification: jest.fn(),
                    clearNotification: jest.fn(),
                };
            }
            return controlMocks[name];
        }),
        ui: {
            getFormType: jest.fn(() => 2), // Default to Update
            setFormNotification: jest.fn(),
            clearFormNotification: jest.fn(),
            tabs: {
                get: jest.fn(() => ({
                    setVisible: jest.fn(),
                    sections: { forEach: jest.fn() },
                })),
                forEach: jest.fn(),
            },
            quickForms: {
                get: jest.fn(() => null),
                forEach: jest.fn(),
            },
            controls: {
                get: jest.fn(() => []),
            },
        },
        data: {
            entity: {
                getEntityName: jest.fn(() => 'contact'),
                getId: jest.fn(() => '{contact-id}'),
                save: jest.fn(),
                attributes: { forEach: jest.fn() },
            },
            addOnLoad: jest.fn(),
            refresh: jest.fn(),
        },
    };
}

// Mock Xrm global object
global.Xrm = {
    WebApi: {
        retrieveRecord: jest.fn(),
        retrieveMultipleRecords: jest.fn(),
        updateRecord: jest.fn(),
        createRecord: jest.fn(),
        deleteRecord: jest.fn(),
    },
    Navigation: {
        openForm: jest.fn(),
        openAlertDialog: jest.fn(),
        openConfirmDialog: jest.fn(),
    },
    Utility: {
        getGlobalContext: jest.fn(() => ({
            userSettings: {
                userId: '{user-id}',
                userName: 'Test User',
            },
        })),
    },
};

// Suppress console output in tests
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
};

describe('AIDEVME.Contact.Form', () => {
    let mockExecutionContext;
    let mockFormContext;

    beforeEach(() => {
        mockFormContext = createMockFormContext();
        mockExecutionContext = {
            getFormContext: jest.fn(() => mockFormContext),
            getEventArgs: jest.fn(() => ({ preventDefault: jest.fn() })),
        };

        // Re-evaluate the script via window.eval so that the top-level
        // `var AIDEVME` declaration becomes a property of window (= global).
        // This also overwrites AIDEVME.Contact.Form with a fresh IIFE
        // execution, resetting private state (formContext → null) between tests.
        window.eval(CONTACT_FORM_SCRIPT);

        // Initialize the module's private formContext via OnLoad in Update mode.
        // Update mode avoids create-specific side effects (e.g. hiding tabs).
        mockFormContext.ui.getFormType.mockReturnValue(2);
        AIDEVME.Contact.Form.OnLoad(mockExecutionContext);
    });

    // ============================================================
    // ValidatePhoneNumber — pure function, no side effects
    // ============================================================
    describe('ValidatePhoneNumber', () => {
        it('should return true for null input (empty phone is valid, not required)', () => {
            expect(AIDEVME.Contact.Form.ValidatePhoneNumber(null)).toBe(true);
        });

        it('should return true for undefined input', () => {
            expect(AIDEVME.Contact.Form.ValidatePhoneNumber(undefined)).toBe(true);
        });

        it('should return true for a valid US phone number with dashes', () => {
            expect(AIDEVME.Contact.Form.ValidatePhoneNumber('555-123-4567')).toBe(true);
        });

        it('should return true for a phone with parentheses, spaces, and plus sign', () => {
            expect(AIDEVME.Contact.Form.ValidatePhoneNumber('+1 (555) 123-4567')).toBe(true);
        });

        it('should return false for a phone containing letters', () => {
            expect(AIDEVME.Contact.Form.ValidatePhoneNumber('555-CALL-NOW')).toBe(false);
        });

        it('should return false for a phone containing a hash symbol', () => {
            expect(AIDEVME.Contact.Form.ValidatePhoneNumber('555#1234')).toBe(false);
        });
    });

    // ============================================================
    // FormatPhoneNumber — pure function, no side effects
    // ============================================================
    describe('FormatPhoneNumber', () => {
        it('should return empty string for null input', () => {
            expect(AIDEVME.Contact.Form.FormatPhoneNumber(null)).toBe('');
        });

        it('should format a raw 10-digit string to (XXX) XXX-XXXX', () => {
            expect(AIDEVME.Contact.Form.FormatPhoneNumber('1234567890')).toBe('(123) 456-7890');
        });

        it('should strip non-digit characters and format if result is 10 digits', () => {
            expect(AIDEVME.Contact.Form.FormatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
        });

        it('should return the original string when digit count is fewer than 10', () => {
            expect(AIDEVME.Contact.Form.FormatPhoneNumber('12345')).toBe('12345');
        });

        it('should return the original string when digit count exceeds 10 (e.g. with country code)', () => {
            expect(AIDEVME.Contact.Form.FormatPhoneNumber('12345678901')).toBe('12345678901');
        });
    });

    // ============================================================
    // OnDoNotEmailChange — email opt-out business logic
    // ============================================================
    describe('OnDoNotEmailChange', () => {
        it('should change preferred contact method from Email (2) to Phone (3) when user opts out of email', () => {
            mockFormContext.getAttribute('donotemail').getValue.mockReturnValue(true);
            mockFormContext.getAttribute('preferredcontactmethodcode').getValue.mockReturnValue(2); // Email

            AIDEVME.Contact.Form.OnDoNotEmailChange();

            expect(mockFormContext.getAttribute('preferredcontactmethodcode').setValue)
                .toHaveBeenCalledWith(3); // Phone
        });

        it('should show an informational notification when the preferred method is automatically changed', () => {
            mockFormContext.getAttribute('donotemail').getValue.mockReturnValue(true);
            mockFormContext.getAttribute('preferredcontactmethodcode').getValue.mockReturnValue(2); // Email

            AIDEVME.Contact.Form.OnDoNotEmailChange();

            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Preferred contact method changed from Email to Phone',
                'INFO',
                'contact_method_change'
            );
        });

        it('should not change preferred method when it is already set to something other than Email', () => {
            mockFormContext.getAttribute('donotemail').getValue.mockReturnValue(true);
            mockFormContext.getAttribute('preferredcontactmethodcode').getValue.mockReturnValue(3); // Phone

            AIDEVME.Contact.Form.OnDoNotEmailChange();

            expect(mockFormContext.getAttribute('preferredcontactmethodcode').setValue)
                .not.toHaveBeenCalled();
        });

        it('should do nothing when doNotEmail flag is false', () => {
            mockFormContext.getAttribute('donotemail').getValue.mockReturnValue(false);

            AIDEVME.Contact.Form.OnDoNotEmailChange();

            expect(mockFormContext.getAttribute('preferredcontactmethodcode').setValue)
                .not.toHaveBeenCalled();
        });
    });

    // ============================================================
    // OnJobTitleChange — auto-categorization by title keywords
    // ============================================================
    describe('OnJobTitleChange', () => {
        it('should set account role to Decision Maker (1) when title contains "CEO"', () => {
            mockFormContext.getAttribute('jobtitle').getValue.mockReturnValue('CEO');
            mockFormContext.getAttribute('accountrolecode').getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.OnJobTitleChange();

            expect(mockFormContext.getAttribute('accountrolecode').setValue).toHaveBeenCalledWith(1);
        });

        it('should set account role to Decision Maker (1) when title contains "Vice President"', () => {
            mockFormContext.getAttribute('jobtitle').getValue.mockReturnValue('Vice President of Sales');
            mockFormContext.getAttribute('accountrolecode').getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.OnJobTitleChange();

            expect(mockFormContext.getAttribute('accountrolecode').setValue).toHaveBeenCalledWith(1);
        });

        it('should set account role to Employee (2) when title contains "Manager"', () => {
            mockFormContext.getAttribute('jobtitle').getValue.mockReturnValue('Sales Manager');
            mockFormContext.getAttribute('accountrolecode').getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.OnJobTitleChange();

            expect(mockFormContext.getAttribute('accountrolecode').setValue).toHaveBeenCalledWith(2);
        });

        it('should not overwrite an already-set role even when the title matches a keyword', () => {
            mockFormContext.getAttribute('jobtitle').getValue.mockReturnValue('CEO');
            mockFormContext.getAttribute('accountrolecode').getValue.mockReturnValue(2); // Already set

            AIDEVME.Contact.Form.OnJobTitleChange();

            expect(mockFormContext.getAttribute('accountrolecode').setValue).not.toHaveBeenCalled();
        });

        it('should not set any role when job title is null', () => {
            mockFormContext.getAttribute('jobtitle').getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.OnJobTitleChange();

            expect(mockFormContext.getAttribute('accountrolecode').setValue).not.toHaveBeenCalled();
        });
    });

    // ============================================================
    // OnSave — save-time validation rules
    // ============================================================
    describe('OnSave', () => {
        let mockEventArgs;

        beforeEach(() => {
            mockEventArgs = { preventDefault: jest.fn() };
            mockExecutionContext.getEventArgs.mockReturnValue(mockEventArgs);
        });

        it('should prevent save and show error notification when last name is missing', () => {
            mockFormContext.getAttribute('lastname').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('emailaddress1').getValue.mockReturnValue('test@example.com');
            mockFormContext.getAttribute('telephone1').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('mobilephone').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('birthdate').getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.OnSave(mockExecutionContext);

            expect(mockEventArgs.preventDefault).toHaveBeenCalled();
            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Last name is required',
                'ERROR',
                'save_lastname_validation'
            );
        });

        it('should prevent save and show error when no contact method (email or phone) is provided', () => {
            mockFormContext.getAttribute('lastname').getValue.mockReturnValue('Doe');
            mockFormContext.getAttribute('emailaddress1').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('telephone1').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('mobilephone').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('birthdate').getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.OnSave(mockExecutionContext);

            expect(mockEventArgs.preventDefault).toHaveBeenCalled();
            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Please provide at least one contact method (email or phone)',
                'ERROR',
                'save_contact_validation'
            );
        });

        it('should prevent save and show error when email address format is invalid', () => {
            mockFormContext.getAttribute('lastname').getValue.mockReturnValue('Doe');
            mockFormContext.getAttribute('emailaddress1').getValue.mockReturnValue('not-an-email');
            mockFormContext.getAttribute('telephone1').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('mobilephone').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('birthdate').getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.OnSave(mockExecutionContext);

            expect(mockEventArgs.preventDefault).toHaveBeenCalled();
            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Invalid email address format',
                'ERROR',
                'save_email_validation'
            );
        });

        it('should prevent save when birthdate is set to a future date', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);

            mockFormContext.getAttribute('lastname').getValue.mockReturnValue('Doe');
            mockFormContext.getAttribute('emailaddress1').getValue.mockReturnValue('doe@example.com');
            mockFormContext.getAttribute('telephone1').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('mobilephone').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('birthdate').getValue.mockReturnValue(futureDate);

            AIDEVME.Contact.Form.OnSave(mockExecutionContext);

            expect(mockEventArgs.preventDefault).toHaveBeenCalled();
            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Birthdate cannot be in the future',
                'ERROR',
                'save_birthdate_validation'
            );
        });

        it('should allow save to proceed when all required fields are valid', () => {
            mockFormContext.getAttribute('lastname').getValue.mockReturnValue('Doe');
            mockFormContext.getAttribute('emailaddress1').getValue.mockReturnValue('doe@example.com');
            mockFormContext.getAttribute('telephone1').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('mobilephone').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('birthdate').getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.OnSave(mockExecutionContext);

            expect(mockEventArgs.preventDefault).not.toHaveBeenCalled();
        });
    });

    // ============================================================
    // OnNameChange — corrected from broken onFirstNameChange / onLastNameChange
    // The public API exposes OnNameChange (not per-field methods).
    // ============================================================
    describe('OnNameChange', () => {
        it('should show notification when first name contains numbers', () => {
            mockFormContext.getAttribute('firstname').getValue.mockReturnValue('John123');
            mockFormContext.getAttribute('lastname').getValue.mockReturnValue('Doe');

            AIDEVME.Contact.Form.OnNameChange();

            expect(mockFormContext.getControl('firstname').setNotification).toHaveBeenCalledWith(
                'First name contains invalid characters',
                'firstname_validation'
            );
        });

        it('should clear notification when first name is valid (letters, hyphens, apostrophes allowed)', () => {
            mockFormContext.getAttribute('firstname').getValue.mockReturnValue("O'Brien-Smith");
            mockFormContext.getAttribute('lastname').getValue.mockReturnValue('Doe');

            AIDEVME.Contact.Form.OnNameChange();

            expect(mockFormContext.getControl('firstname').clearNotification)
                .toHaveBeenCalledWith('firstname_validation');
        });

        it('should show notification when last name contains special characters like @', () => {
            mockFormContext.getAttribute('firstname').getValue.mockReturnValue('John');
            mockFormContext.getAttribute('lastname').getValue.mockReturnValue('Doe@Corp');

            AIDEVME.Contact.Form.OnNameChange();

            expect(mockFormContext.getControl('lastname').setNotification).toHaveBeenCalledWith(
                'Last name contains invalid characters',
                'lastname_validation'
            );
        });
    });

    // ============================================================
    // OnBirthdateChange — corrected from broken onBirthDateChange
    // ============================================================
    describe('OnBirthdateChange', () => {
        it('should show error notification when birthdate is set to a future date', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            mockFormContext.getAttribute('birthdate').getValue.mockReturnValue(futureDate);

            AIDEVME.Contact.Form.OnBirthdateChange();

            expect(mockFormContext.getControl('birthdate').setNotification).toHaveBeenCalledWith(
                'Birthdate cannot be in the future',
                'birthdate_validation'
            );
        });

        it('should clear notification for a valid past birthdate within normal age range', () => {
            const pastDate = new Date('1990-05-15');
            mockFormContext.getAttribute('birthdate').getValue.mockReturnValue(pastDate);

            AIDEVME.Contact.Form.OnBirthdateChange();

            expect(mockFormContext.getControl('birthdate').clearNotification)
                .toHaveBeenCalledWith('birthdate_validation');
        });

        it('should show a verification warning when calculated age exceeds 120 years', () => {
            const veryOldDate = new Date('1880-01-01');
            mockFormContext.getAttribute('birthdate').getValue.mockReturnValue(veryOldDate);

            AIDEVME.Contact.Form.OnBirthdateChange();

            expect(mockFormContext.getControl('birthdate').setNotification).toHaveBeenCalledWith(
                'Please verify the birthdate',
                'birthdate_validation'
            );
        });
    });

    // ============================================================
    // OnLoad — null guard (contact.form.js has an explicit null check)
    // ============================================================
    describe('OnLoad', () => {
        it('should log an error and return early when executionContext is null', () => {
            AIDEVME.Contact.Form.OnLoad(null);

            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('executionContext not passed')
            );
        });
    });
});

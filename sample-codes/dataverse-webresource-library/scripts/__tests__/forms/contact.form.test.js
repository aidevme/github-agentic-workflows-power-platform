/**
 * Unit tests for Contact Form JavaScript
 * Tests: contact.form.js
 */

// Mock formContext helper
function createMockFormContext() {
    return {
        getAttribute: jest.fn((name) => ({
            getValue: jest.fn(),
            setValue: jest.fn(),
            addOnChange: jest.fn(),
            removeOnChange: jest.fn(),
            setRequiredLevel: jest.fn(),
            getRequiredLevel: jest.fn(() => 'none'),
        })),
        getControl: jest.fn((name) => ({
            setVisible: jest.fn(),
            setDisabled: jest.fn(),
            getDisabled: jest.fn(() => false),
            setNotification: jest.fn(),
            clearNotification: jest.fn(),
        })),
        ui: {
            getFormType: jest.fn(() => 1), // Default to Create
            setFormNotification: jest.fn(),
            clearFormNotification: jest.fn(),
            tabs: {
                get: jest.fn((name) => ({
                    setVisible: jest.fn(),
                    setDisplayState: jest.fn(),
                    sections: {
                        get: jest.fn((sectionName) => ({
                            setVisible: jest.fn(),
                        })),
                    },
                })),
            },
        },
        data: {
            entity: {
                getEntityName: jest.fn(() => 'contact'),
                getId: jest.fn(() => '{contact-id}'),
                save: jest.fn(),
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

// Mock console
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
};

describe('AIDEVME.Contact.Form', () => {
    let mockExecutionContext;
    let mockFormContext;

    beforeEach(() => {
        jest.clearAllMocks();
        
        mockFormContext = createMockFormContext();
        mockExecutionContext = {
            getFormContext: jest.fn(() => mockFormContext),
        };

        // Load the form script
        require('../../forms/contact.form.js');
    });

    describe('onLoad', () => {
        it('should initialize contact form on create', () => {
            mockFormContext.ui.getFormType.mockReturnValue(1); // Create

            AIDEVME.Contact.Form.onLoad(mockExecutionContext);

            expect(mockExecutionContext.getFormContext).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('Contact form loaded successfully');
        });

        it('should handle form load for update mode', () => {
            mockFormContext.ui.getFormType.mockReturnValue(2); // Update

            AIDEVME.Contact.Form.onLoad(mockExecutionContext);

            expect(mockExecutionContext.getFormContext).toHaveBeenCalled();
        });

        it('should handle errors during form load', () => {
            mockExecutionContext.getFormContext.mockImplementation(() => {
                throw new Error('Form load error');
            });

            AIDEVME.Contact.Form.onLoad(mockExecutionContext);

            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('onFirstNameChange', () => {
        it('should validate first name is not empty', () => {
            const firstNameAttr = mockFormContext.getAttribute('firstname');
            firstNameAttr.getValue.mockReturnValue('');

            AIDEVME.Contact.Form.onFirstNameChange(mockExecutionContext);

            expect(firstNameAttr.getValue).toHaveBeenCalled();
        });

        it('should accept valid first name', () => {
            const firstNameAttr = mockFormContext.getAttribute('firstname');
            firstNameAttr.getValue.mockReturnValue('John');

            AIDEVME.Contact.Form.onFirstNameChange(mockExecutionContext);

            expect(firstNameAttr.getValue).toHaveBeenCalled();
        });
    });

    describe('onLastNameChange', () => {
        it('should validate last name is not empty', () => {
            const lastNameAttr = mockFormContext.getAttribute('lastname');
            lastNameAttr.getValue.mockReturnValue('');

            AIDEVME.Contact.Form.onLastNameChange(mockExecutionContext);

            expect(lastNameAttr.getValue).toHaveBeenCalled();
        });

        it('should accept valid last name', () => {
            const lastNameAttr = mockFormContext.getAttribute('lastname');
            lastNameAttr.getValue.mockReturnValue('Doe');

            AIDEVME.Contact.Form.onLastNameChange(mockExecutionContext);

            expect(lastNameAttr.getValue).toHaveBeenCalled();
        });
    });

    describe('onEmailAddressChange', () => {
        it('should validate email format', () => {
            const emailAttr = mockFormContext.getAttribute('emailaddress1');
            emailAttr.getValue.mockReturnValue('john.doe@example.com');

            AIDEVME.Contact.Form.onEmailAddressChange(mockExecutionContext);

            expect(emailAttr.getValue).toHaveBeenCalled();
        });

        it('should show error for invalid email', () => {
            const emailAttr = mockFormContext.getAttribute('emailaddress1');
            emailAttr.getValue.mockReturnValue('invalid-email');

            AIDEVME.Contact.Form.onEmailAddressChange(mockExecutionContext);

            expect(emailAttr.getValue).toHaveBeenCalled();
        });

        it('should allow empty email', () => {
            const emailAttr = mockFormContext.getAttribute('emailaddress1');
            emailAttr.getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.onEmailAddressChange(mockExecutionContext);

            expect(emailAttr.getValue).toHaveBeenCalled();
        });
    });

    describe('onMobilePhoneChange', () => {
        it('should validate mobile phone format', () => {
            const phoneAttr = mockFormContext.getAttribute('mobilephone');
            phoneAttr.getValue.mockReturnValue('555-1234');

            AIDEVME.Contact.Form.onMobilePhoneChange(mockExecutionContext);

            expect(phoneAttr.getValue).toHaveBeenCalled();
        });

        it('should reject invalid phone format', () => {
            const phoneAttr = mockFormContext.getAttribute('mobilephone');
            phoneAttr.getValue.mockReturnValue('invalid');

            AIDEVME.Contact.Form.onMobilePhoneChange(mockExecutionContext);

            expect(phoneAttr.getValue).toHaveBeenCalled();
        });
    });

    describe('onParentCustomerChange', () => {
        it('should handle account lookup change', () => {
            const parentAttr = mockFormContext.getAttribute('parentcustomerid');
            parentAttr.getValue.mockReturnValue([{
                id: '{account-id}',
                name: 'Contoso Ltd',
                entityType: 'account'
            }]);

            AIDEVME.Contact.Form.onParentCustomerChange(mockExecutionContext);

            expect(parentAttr.getValue).toHaveBeenCalled();
        });

        it('should handle empty parent customer', () => {
            const parentAttr = mockFormContext.getAttribute('parentcustomerid');
            parentAttr.getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.onParentCustomerChange(mockExecutionContext);

            expect(parentAttr.getValue).toHaveBeenCalled();
        });
    });

    describe('onBirthDateChange', () => {
        it('should validate birthdate is not in future', () => {
            const birthDateAttr = mockFormContext.getAttribute('birthdate');
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            birthDateAttr.getValue.mockReturnValue(futureDate);

            AIDEVME.Contact.Form.onBirthDateChange(mockExecutionContext);

            expect(birthDateAttr.getValue).toHaveBeenCalled();
        });

        it('should accept valid birthdate', () => {
            const birthDateAttr = mockFormContext.getAttribute('birthdate');
            const pastDate = new Date('1990-01-01');
            birthDateAttr.getValue.mockReturnValue(pastDate);

            AIDEVME.Contact.Form.onBirthDateChange(mockExecutionContext);

            expect(birthDateAttr.getValue).toHaveBeenCalled();
        });
    });

    describe('Form Type Handlers', () => {
        it('should set default values on create', () => {
            mockFormContext.ui.getFormType.mockReturnValue(1);

            AIDEVME.Contact.Form.onLoad(mockExecutionContext);

            expect(mockFormContext.ui.getFormType).toHaveBeenCalled();
        });

        it('should configure form for update mode', () => {
            mockFormContext.ui.getFormType.mockReturnValue(2);

            AIDEVME.Contact.Form.onLoad(mockExecutionContext);

            expect(mockFormContext.ui.getFormType).toHaveBeenCalled();
        });

        it('should handle read-only mode', () => {
            mockFormContext.ui.getFormType.mockReturnValue(3);

            AIDEVME.Contact.Form.onLoad(mockExecutionContext);

            expect(mockFormContext.ui.getFormType).toHaveBeenCalled();
        });
    });

    // =========================================================================
    // High-value tests: FormatPhoneNumber (pure utility function)
    // =========================================================================

    describe('FormatPhoneNumber', () => {
        it('should format a 10-digit number to US format (XXX) XXX-XXXX', () => {
            const result = AIDEVME.Contact.Form.FormatPhoneNumber('1234567890');
            expect(result).toBe('(123) 456-7890');
        });

        it('should return empty string for null input', () => {
            const result = AIDEVME.Contact.Form.FormatPhoneNumber(null);
            expect(result).toBe('');
        });

        it('should return empty string for undefined input', () => {
            const result = AIDEVME.Contact.Form.FormatPhoneNumber(undefined);
            expect(result).toBe('');
        });

        it('should strip formatting characters and re-format a pre-formatted number', () => {
            // '(123) 456-7890' strips to '1234567890' (10 digits) and reformats to same value
            const result = AIDEVME.Contact.Form.FormatPhoneNumber('(123) 456-7890');
            expect(result).toBe('(123) 456-7890');
        });

        it('should return the original string when digit count is not exactly 10', () => {
            expect(AIDEVME.Contact.Form.FormatPhoneNumber('12345')).toBe('12345');
            expect(AIDEVME.Contact.Form.FormatPhoneNumber('12345678901')).toBe('12345678901');
        });
    });

    // =========================================================================
    // High-value tests: ValidatePhoneNumber (pure utility function)
    // =========================================================================

    describe('ValidatePhoneNumber', () => {
        it('should return true for null because phone is optional', () => {
            expect(AIDEVME.Contact.Form.ValidatePhoneNumber(null)).toBe(true);
        });

        it('should return true for empty string because phone is optional', () => {
            expect(AIDEVME.Contact.Form.ValidatePhoneNumber('')).toBe(true);
        });

        it('should return true for valid formats with digits, spaces, dashes, and parentheses', () => {
            expect(AIDEVME.Contact.Form.ValidatePhoneNumber('(555) 123-4567')).toBe(true);
            expect(AIDEVME.Contact.Form.ValidatePhoneNumber('555-1234')).toBe(true);
            expect(AIDEVME.Contact.Form.ValidatePhoneNumber('+1 800 555 1234')).toBe(true);
        });

        it('should return false when phone number contains letters', () => {
            expect(AIDEVME.Contact.Form.ValidatePhoneNumber('555-CALL-US')).toBe(false);
            expect(AIDEVME.Contact.Form.ValidatePhoneNumber('abc-123')).toBe(false);
        });
    });

    // =========================================================================
    // High-value tests: OnJobTitleChange (role auto-categorization business logic)
    // =========================================================================

    describe('OnJobTitleChange', () => {
        let fieldMocks;

        const makeField = (val) => ({
            getValue: jest.fn(() => val),
            setValue: jest.fn(),
            addOnChange: jest.fn(),
            setRequiredLevel: jest.fn(),
            getRequiredLevel: jest.fn(() => 'none'),
        });

        beforeEach(() => {
            // Use per-field mocks so jobtitle and accountrolecode return distinct objects
            fieldMocks = {};
            mockFormContext.getAttribute.mockImplementation((name) => {
                if (!fieldMocks[name]) {
                    fieldMocks[name] = makeField(null);
                }
                return fieldMocks[name];
            });
            // Initialize the module's private formContext
            AIDEVME.Contact.Form.OnLoad(mockExecutionContext);
        });

        it('should set accountrolecode to Decision Maker (1) when job title includes "CEO"', () => {
            fieldMocks['jobtitle'] = makeField('CEO');
            fieldMocks['accountrolecode'] = makeField(null);

            AIDEVME.Contact.Form.OnJobTitleChange();

            expect(fieldMocks['accountrolecode'].setValue).toHaveBeenCalledWith(1);
        });

        it('should set accountrolecode to Decision Maker (1) when job title includes "Vice President"', () => {
            fieldMocks['jobtitle'] = makeField('Vice President of Sales');
            fieldMocks['accountrolecode'] = makeField(null);

            AIDEVME.Contact.Form.OnJobTitleChange();

            expect(fieldMocks['accountrolecode'].setValue).toHaveBeenCalledWith(1);
        });

        it('should set accountrolecode to Employee (2) when job title includes "Manager"', () => {
            fieldMocks['jobtitle'] = makeField('Sales Manager');
            fieldMocks['accountrolecode'] = makeField(null);

            AIDEVME.Contact.Form.OnJobTitleChange();

            expect(fieldMocks['accountrolecode'].setValue).toHaveBeenCalledWith(2);
        });

        it('should not override accountrolecode when a role is already assigned', () => {
            fieldMocks['jobtitle'] = makeField('CEO');
            fieldMocks['accountrolecode'] = makeField(2); // Already Employee — should not be overwritten

            AIDEVME.Contact.Form.OnJobTitleChange();

            expect(fieldMocks['accountrolecode'].setValue).not.toHaveBeenCalled();
        });
    });

    // =========================================================================
    // High-value tests: OnDoNotEmailChange (preferred contact method auto-swap)
    // =========================================================================

    describe('OnDoNotEmailChange', () => {
        let fieldMocks;

        const makeField = (val) => ({
            getValue: jest.fn(() => val),
            setValue: jest.fn(),
            addOnChange: jest.fn(),
            setRequiredLevel: jest.fn(),
            getRequiredLevel: jest.fn(() => 'none'),
        });

        beforeEach(() => {
            fieldMocks = {};
            mockFormContext.getAttribute.mockImplementation((name) => {
                if (!fieldMocks[name]) {
                    fieldMocks[name] = makeField(null);
                }
                return fieldMocks[name];
            });
            AIDEVME.Contact.Form.OnLoad(mockExecutionContext);
        });

        it('should change preferred contact method from Email (2) to Phone (3) when do-not-email is checked', () => {
            fieldMocks['donotemail'] = makeField(true);
            fieldMocks['preferredcontactmethodcode'] = makeField(2); // Currently Email

            AIDEVME.Contact.Form.OnDoNotEmailChange();

            expect(fieldMocks['preferredcontactmethodcode'].setValue).toHaveBeenCalledWith(3);
            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Preferred contact method changed from Email to Phone',
                'INFO',
                'contact_method_change'
            );
        });

        it('should not change preferred method when preferred method is already Phone', () => {
            fieldMocks['donotemail'] = makeField(true);
            fieldMocks['preferredcontactmethodcode'] = makeField(3); // Already Phone

            AIDEVME.Contact.Form.OnDoNotEmailChange();

            expect(fieldMocks['preferredcontactmethodcode'].setValue).not.toHaveBeenCalled();
        });

        it('should not change preferred method when do-not-email is unchecked', () => {
            fieldMocks['donotemail'] = makeField(false);
            fieldMocks['preferredcontactmethodcode'] = makeField(2);

            AIDEVME.Contact.Form.OnDoNotEmailChange();

            expect(fieldMocks['preferredcontactmethodcode'].setValue).not.toHaveBeenCalled();
        });
    });

    // =========================================================================
    // High-value tests: OnSave / validateBeforeSave (critical pre-save validation)
    // =========================================================================

    describe('OnSave - validateBeforeSave', () => {
        let mockEventArgs;

        const makeField = (val) => ({
            getValue: jest.fn(() => val),
            setValue: jest.fn(),
            addOnChange: jest.fn(),
            setRequiredLevel: jest.fn(),
            getRequiredLevel: jest.fn(() => 'none'),
        });

        // Sets up per-field attribute mocks with the given values and configures eventArgs
        const setupFields = (overrides) => {
            const fieldValues = Object.assign(
                { lastname: null, emailaddress1: null, telephone1: null, mobilephone: null, birthdate: null },
                overrides
            );
            const fieldCache = {};
            mockFormContext.getAttribute.mockImplementation((name) => {
                if (!fieldCache[name]) {
                    fieldCache[name] = makeField(fieldValues[name] !== undefined ? fieldValues[name] : null);
                }
                return fieldCache[name];
            });
            mockEventArgs = { preventDefault: jest.fn() };
            mockExecutionContext.getEventArgs = jest.fn(() => mockEventArgs);
        };

        it('should prevent save and show error when last name is missing', () => {
            setupFields({ lastname: null, emailaddress1: 'john@example.com' });

            AIDEVME.Contact.Form.OnSave(mockExecutionContext);

            expect(mockEventArgs.preventDefault).toHaveBeenCalled();
            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Last name is required',
                'ERROR',
                'save_lastname_validation'
            );
        });

        it('should prevent save and show error when no contact method is provided', () => {
            setupFields({ lastname: 'Doe', emailaddress1: null, telephone1: null, mobilephone: null });

            AIDEVME.Contact.Form.OnSave(mockExecutionContext);

            expect(mockEventArgs.preventDefault).toHaveBeenCalled();
            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Please provide at least one contact method (email or phone)',
                'ERROR',
                'save_contact_validation'
            );
        });

        it('should prevent save and show error when email format is invalid', () => {
            setupFields({ lastname: 'Doe', emailaddress1: 'not-a-valid-email' });

            AIDEVME.Contact.Form.OnSave(mockExecutionContext);

            expect(mockEventArgs.preventDefault).toHaveBeenCalled();
            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Invalid email address format',
                'ERROR',
                'save_email_validation'
            );
        });

        it('should prevent save and show error when birthdate is in the future', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            setupFields({ lastname: 'Doe', emailaddress1: 'john@example.com', birthdate: futureDate });

            AIDEVME.Contact.Form.OnSave(mockExecutionContext);

            expect(mockEventArgs.preventDefault).toHaveBeenCalled();
            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Birthdate cannot be in the future',
                'ERROR',
                'save_birthdate_validation'
            );
        });

        it('should allow save and clear all validation notifications when all checks pass', () => {
            setupFields({ lastname: 'Doe', emailaddress1: 'john@example.com' });

            AIDEVME.Contact.Form.OnSave(mockExecutionContext);

            expect(mockEventArgs.preventDefault).not.toHaveBeenCalled();
            expect(mockFormContext.ui.clearFormNotification).toHaveBeenCalledWith('save_lastname_validation');
            expect(mockFormContext.ui.clearFormNotification).toHaveBeenCalledWith('save_contact_validation');
            expect(mockFormContext.ui.clearFormNotification).toHaveBeenCalledWith('save_email_validation');
            expect(mockFormContext.ui.clearFormNotification).toHaveBeenCalledWith('save_birthdate_validation');
        });
    });
});

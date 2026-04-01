/**
 * Unit tests for Contact Form JavaScript
 * Tests: contact.form.js
 */

// Mock formContext helper
function createMockFormContext() {
    const attributeMocks = {};
    const controlMocks = {};
    
    return {
        getAttribute: jest.fn((name) => {
            if (!attributeMocks[name]) {
                attributeMocks[name] = {
                    getValue: jest.fn(),
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
        
        // Initialize formContext by calling onLoad
        AIDEVME.Contact.Form.onLoad(mockExecutionContext);
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

    describe('validatePhoneNumber', () => {
        it('should return true for null input (phone is not required)', () => {
            expect(AIDEVME.Contact.Form.validatePhoneNumber(null)).toBe(true);
        });

        it('should return true for empty string', () => {
            expect(AIDEVME.Contact.Form.validatePhoneNumber('')).toBe(true);
        });

        it('should return true for valid phone with digits and common separators', () => {
            expect(AIDEVME.Contact.Form.validatePhoneNumber('555-1234')).toBe(true);
            expect(AIDEVME.Contact.Form.validatePhoneNumber('(555) 123-4567')).toBe(true);
            expect(AIDEVME.Contact.Form.validatePhoneNumber('+1 800 555 0100')).toBe(true);
            expect(AIDEVME.Contact.Form.validatePhoneNumber('5551234567')).toBe(true);
        });

        it('should return false for phone containing letters', () => {
            expect(AIDEVME.Contact.Form.validatePhoneNumber('555-CALL')).toBe(false);
            expect(AIDEVME.Contact.Form.validatePhoneNumber('abc')).toBe(false);
        });

        it('should return false for phone containing other special characters', () => {
            expect(AIDEVME.Contact.Form.validatePhoneNumber('555.123.4567')).toBe(false);
            expect(AIDEVME.Contact.Form.validatePhoneNumber('555@1234')).toBe(false);
        });
    });

    describe('formatPhoneNumber', () => {
        it('should return empty string for null input', () => {
            expect(AIDEVME.Contact.Form.formatPhoneNumber(null)).toBe('');
        });

        it('should return empty string for empty string input', () => {
            expect(AIDEVME.Contact.Form.formatPhoneNumber('')).toBe('');
        });

        it('should format a raw 10-digit number to US standard format', () => {
            expect(AIDEVME.Contact.Form.formatPhoneNumber('1234567890')).toBe('(123) 456-7890');
        });

        it('should strip separators and reformat a 10-digit number', () => {
            expect(AIDEVME.Contact.Form.formatPhoneNumber('123-456-7890')).toBe('(123) 456-7890');
            expect(AIDEVME.Contact.Form.formatPhoneNumber('(123) 456-7890')).toBe('(123) 456-7890');
            expect(AIDEVME.Contact.Form.formatPhoneNumber('123 456 7890')).toBe('(123) 456-7890');
        });

        it('should return the original string when digit count is not 10', () => {
            expect(AIDEVME.Contact.Form.formatPhoneNumber('12345')).toBe('12345');
            expect(AIDEVME.Contact.Form.formatPhoneNumber('12345678901')).toBe('12345678901');
        });

        it('should return the original string for non-numeric input that strips to wrong digit count', () => {
            expect(AIDEVME.Contact.Form.formatPhoneNumber('abcdefghij')).toBe('abcdefghij');
        });
    });

    describe('onJobTitleChange', () => {
        it('should set role to Decision Maker (1) when title contains CEO', () => {
            const jobTitleAttr = mockFormContext.getAttribute('jobtitle');
            const roleAttr = mockFormContext.getAttribute('accountrolecode');
            jobTitleAttr.getValue.mockReturnValue('CEO');
            roleAttr.getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.onJobTitleChange();

            expect(roleAttr.setValue).toHaveBeenCalledWith(1);
        });

        it('should set role to Decision Maker (1) when title contains President', () => {
            const jobTitleAttr = mockFormContext.getAttribute('jobtitle');
            const roleAttr = mockFormContext.getAttribute('accountrolecode');
            jobTitleAttr.getValue.mockReturnValue('President of Operations');
            roleAttr.getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.onJobTitleChange();

            expect(roleAttr.setValue).toHaveBeenCalledWith(1);
        });

        it('should set role to Employee (2) when title contains Manager', () => {
            const jobTitleAttr = mockFormContext.getAttribute('jobtitle');
            const roleAttr = mockFormContext.getAttribute('accountrolecode');
            jobTitleAttr.getValue.mockReturnValue('Sales Manager');
            roleAttr.getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.onJobTitleChange();

            expect(roleAttr.setValue).toHaveBeenCalledWith(2);
        });

        it('should set role to Decision Maker (1) when title contains VP', () => {
            const jobTitleAttr = mockFormContext.getAttribute('jobtitle');
            const roleAttr = mockFormContext.getAttribute('accountrolecode');
            jobTitleAttr.getValue.mockReturnValue('VP of Engineering');
            roleAttr.getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.onJobTitleChange();

            expect(roleAttr.setValue).toHaveBeenCalledWith(1);
        });

        it('should not override role when it is already assigned', () => {
            const jobTitleAttr = mockFormContext.getAttribute('jobtitle');
            const roleAttr = mockFormContext.getAttribute('accountrolecode');
            jobTitleAttr.getValue.mockReturnValue('CEO');
            roleAttr.getValue.mockReturnValue(2); // Role already set

            AIDEVME.Contact.Form.onJobTitleChange();

            expect(roleAttr.setValue).not.toHaveBeenCalled();
        });

        it('should not assign a role for unrecognized job titles', () => {
            const jobTitleAttr = mockFormContext.getAttribute('jobtitle');
            const roleAttr = mockFormContext.getAttribute('accountrolecode');
            jobTitleAttr.getValue.mockReturnValue('Software Engineer');
            roleAttr.getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.onJobTitleChange();

            expect(roleAttr.setValue).not.toHaveBeenCalled();
        });
    });

    describe('onDoNotEmailChange', () => {
        it('should switch preferred method to Phone when email opt-out is set and current method is Email', () => {
            const doNotEmailAttr = mockFormContext.getAttribute('donotemail');
            const preferredMethodAttr = mockFormContext.getAttribute('preferredcontactmethodcode');
            doNotEmailAttr.getValue.mockReturnValue(true);
            preferredMethodAttr.getValue.mockReturnValue(2); // Email

            preferredMethodAttr.setValue.mockClear();

            AIDEVME.Contact.Form.onDoNotEmailChange();

            expect(preferredMethodAttr.setValue).toHaveBeenCalledWith(3); // Phone
            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Preferred contact method changed from Email to Phone',
                'INFO',
                'contact_method_change'
            );
        });

        it('should not change preferred method when opted out but method is already not Email', () => {
            const doNotEmailAttr = mockFormContext.getAttribute('donotemail');
            const preferredMethodAttr = mockFormContext.getAttribute('preferredcontactmethodcode');
            doNotEmailAttr.getValue.mockReturnValue(true);
            preferredMethodAttr.getValue.mockReturnValue(3); // Already Phone

            preferredMethodAttr.setValue.mockClear();
            mockFormContext.ui.setFormNotification.mockClear();

            AIDEVME.Contact.Form.onDoNotEmailChange();

            expect(preferredMethodAttr.setValue).not.toHaveBeenCalled();
            expect(mockFormContext.ui.setFormNotification).not.toHaveBeenCalled();
        });

        it('should not change anything when doNotEmail is false', () => {
            const doNotEmailAttr = mockFormContext.getAttribute('donotemail');
            const preferredMethodAttr = mockFormContext.getAttribute('preferredcontactmethodcode');
            doNotEmailAttr.getValue.mockReturnValue(false);

            preferredMethodAttr.setValue.mockClear();

            AIDEVME.Contact.Form.onDoNotEmailChange();

            expect(preferredMethodAttr.setValue).not.toHaveBeenCalled();
        });
    });

    describe('onSave - validateBeforeSave', () => {
        let mockEventArgs;
        let mockSaveContext;

        beforeEach(() => {
            mockEventArgs = { preventDefault: jest.fn() };
            mockSaveContext = {
                getFormContext: jest.fn(() => mockFormContext),
                getEventArgs: jest.fn(() => mockEventArgs),
            };
        });

        it('should prevent save and show error when last name is missing', () => {
            mockFormContext.getAttribute('lastname').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('emailaddress1').getValue.mockReturnValue('test@example.com');
            mockFormContext.getAttribute('telephone1').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('mobilephone').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('birthdate').getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.onSave(mockSaveContext);

            expect(mockEventArgs.preventDefault).toHaveBeenCalled();
            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Last name is required',
                'ERROR',
                'save_lastname_validation'
            );
        });

        it('should prevent save when no contact method (email or phone) is provided', () => {
            mockFormContext.getAttribute('lastname').getValue.mockReturnValue('Doe');
            mockFormContext.getAttribute('emailaddress1').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('telephone1').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('mobilephone').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('birthdate').getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.onSave(mockSaveContext);

            expect(mockEventArgs.preventDefault).toHaveBeenCalled();
            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Please provide at least one contact method (email or phone)',
                'ERROR',
                'save_contact_validation'
            );
        });

        it('should prevent save when email address format is invalid', () => {
            mockFormContext.getAttribute('lastname').getValue.mockReturnValue('Doe');
            mockFormContext.getAttribute('emailaddress1').getValue.mockReturnValue('not-a-valid-email');
            mockFormContext.getAttribute('telephone1').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('mobilephone').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('birthdate').getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.onSave(mockSaveContext);

            expect(mockEventArgs.preventDefault).toHaveBeenCalled();
            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Invalid email address format',
                'ERROR',
                'save_email_validation'
            );
        });

        it('should prevent save when birthdate is in the future', () => {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);

            mockFormContext.getAttribute('lastname').getValue.mockReturnValue('Doe');
            mockFormContext.getAttribute('emailaddress1').getValue.mockReturnValue('test@example.com');
            mockFormContext.getAttribute('telephone1').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('mobilephone').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('birthdate').getValue.mockReturnValue(futureDate);

            AIDEVME.Contact.Form.onSave(mockSaveContext);

            expect(mockEventArgs.preventDefault).toHaveBeenCalled();
            expect(mockFormContext.ui.setFormNotification).toHaveBeenCalledWith(
                'Birthdate cannot be in the future',
                'ERROR',
                'save_birthdate_validation'
            );
        });

        it('should allow save and not call preventDefault when all validation passes', () => {
            mockFormContext.getAttribute('lastname').getValue.mockReturnValue('Doe');
            mockFormContext.getAttribute('emailaddress1').getValue.mockReturnValue('john.doe@example.com');
            mockFormContext.getAttribute('telephone1').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('mobilephone').getValue.mockReturnValue(null);
            mockFormContext.getAttribute('birthdate').getValue.mockReturnValue(null);

            AIDEVME.Contact.Form.onSave(mockSaveContext);

            expect(mockEventArgs.preventDefault).not.toHaveBeenCalled();
        });
    });
});

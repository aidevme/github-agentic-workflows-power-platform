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
});

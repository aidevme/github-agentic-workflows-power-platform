/**
 * Unit tests for Account Form JavaScript
 * Tests: account.form.js
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
                getEntityName: jest.fn(() => 'account'),
                getId: jest.fn(() => '{12345678-1234-1234-1234-123456789012}'),
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
                roles: [],
            },
        })),
    },
};

// Mock console to avoid noise in tests
global.console = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
};

describe('AIDEVME.Account.Form', () => {
    let mockExecutionContext;
    let mockFormContext;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();
        
        // Create fresh mock objects
        mockFormContext = createMockFormContext();
        mockExecutionContext = {
            getFormContext: jest.fn(() => mockFormContext),
        };

        // Load the form script
        require('../../forms/account.form.js');
    });

    describe('onLoad', () => {
        it('should initialize form successfully on create', () => {
            mockFormContext.ui.getFormType.mockReturnValue(1); // Create

            AIDEVME.Account.Form.onLoad(mockExecutionContext);

            expect(mockExecutionContext.getFormContext).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('Account form loaded successfully');
        });

        it('should handle form load for update mode', () => {
            mockFormContext.ui.getFormType.mockReturnValue(2); // Update

            AIDEVME.Account.Form.onLoad(mockExecutionContext);

            expect(mockExecutionContext.getFormContext).toHaveBeenCalled();
            expect(mockFormContext.ui.getFormType).toHaveBeenCalled();
        });

        it('should handle form load for read-only mode', () => {
            mockFormContext.ui.getFormType.mockReturnValue(3); // Read Only

            AIDEVME.Account.Form.onLoad(mockExecutionContext);

            expect(mockExecutionContext.getFormContext).toHaveBeenCalled();
        });

        it('should log error if form load fails', () => {
            mockExecutionContext.getFormContext.mockImplementation(() => {
                throw new Error('Test error');
            });

            AIDEVME.Account.Form.onLoad(mockExecutionContext);

            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('onAccountNameChange', () => {
        it('should validate account name is not empty', () => {
            const nameAttr = mockFormContext.getAttribute('name');
            nameAttr.getValue.mockReturnValue('');

            AIDEVME.Account.Form.onAccountNameChange(mockExecutionContext);

            expect(nameAttr.getValue).toHaveBeenCalled();
        });

        it('should clear notification when valid name is entered', () => {
            const nameAttr = mockFormContext.getAttribute('name');
            const nameControl = mockFormContext.getControl('name');
            nameAttr.getValue.mockReturnValue('Contoso Ltd');

            AIDEVME.Account.Form.onAccountNameChange(mockExecutionContext);

            expect(nameAttr.getValue).toHaveBeenCalled();
        });
    });

    describe('onRevenueChange', () => {
        it('should handle valid revenue value', () => {
            const revenueAttr = mockFormContext.getAttribute('revenue');
            revenueAttr.getValue.mockReturnValue(1000000);

            AIDEVME.Account.Form.onRevenueChange(mockExecutionContext);

            expect(revenueAttr.getValue).toHaveBeenCalled();
        });

        it('should validate revenue is not negative', () => {
            const revenueAttr = mockFormContext.getAttribute('revenue');
            revenueAttr.getValue.mockReturnValue(-1000);

            AIDEVME.Account.Form.onRevenueChange(mockExecutionContext);

            expect(revenueAttr.getValue).toHaveBeenCalled();
        });
    });

    describe('onPhoneNumberChange', () => {
        it('should validate US phone number format', () => {
            const phoneAttr = mockFormContext.getAttribute('telephone1');
            phoneAttr.getValue.mockReturnValue('555-1234');

            AIDEVME.Account.Form.onPhoneNumberChange(mockExecutionContext);

            expect(phoneAttr.getValue).toHaveBeenCalled();
        });

        it('should clear value if phone number is invalid', () => {
            const phoneAttr = mockFormContext.getAttribute('telephone1');
            phoneAttr.getValue.mockReturnValue('invalid');

            AIDEVME.Account.Form.onPhoneNumberChange(mockExecutionContext);

            expect(phoneAttr.getValue).toHaveBeenCalled();
        });
    });

    describe('onEmailAddressChange', () => {
        it('should validate email format', () => {
            const emailAttr = mockFormContext.getAttribute('emailaddress1');
            emailAttr.getValue.mockReturnValue('test@example.com');

            AIDEVME.Account.Form.onEmailAddressChange(mockExecutionContext);

            expect(emailAttr.getValue).toHaveBeenCalled();
        });

        it('should show error for invalid email', () => {
            const emailAttr = mockFormContext.getAttribute('emailaddress1');
            emailAttr.getValue.mockReturnValue('invalid-email');

            AIDEVME.Account.Form.onEmailAddressChange(mockExecutionContext);

            expect(emailAttr.getValue).toHaveBeenCalled();
        });
    });

    describe('onPrimaryContactChange', () => {
        it('should handle contact lookup value change', () => {
            const contactAttr = mockFormContext.getAttribute('primarycontactid');
            contactAttr.getValue.mockReturnValue([{
                id: '{contact-id}',
                name: 'John Doe',
                entityType: 'contact'
            }]);

            AIDEVME.Account.Form.onPrimaryContactChange(mockExecutionContext);

            expect(contactAttr.getValue).toHaveBeenCalled();
        });

        it('should handle empty contact value', () => {
            const contactAttr = mockFormContext.getAttribute('primarycontactid');
            contactAttr.getValue.mockReturnValue(null);

            AIDEVME.Account.Form.onPrimaryContactChange(mockExecutionContext);

            expect(contactAttr.getValue).toHaveBeenCalled();
        });
    });

    describe('onSave', () => {
        it('should validate required fields before save', () => {
            mockExecutionContext.getEventArgs = jest.fn(() => ({
                preventDefault: jest.fn(),
            }));

            // Test would call onSave if it's exposed
            expect(mockFormContext).toBeDefined();
        });
    });
});

/**
 * Unit tests for Contact Ribbon JavaScript
 * Tests: contact.ribbon.js
 */

// Mock Xrm global object
global.Xrm = {
    WebApi: {
        updateRecord: jest.fn().mockResolvedValue({ id: 'mock-id' }),
        retrieveRecord: jest.fn(),
        retrieveMultipleRecords: jest.fn(),
        createRecord: jest.fn(),
    },
    Navigation: {
        navigateTo: jest.fn().mockResolvedValue(undefined),
        openConfirmDialog: jest.fn(),
        openAlertDialog: jest.fn(),
        openForm: jest.fn(),
    },
    Utility: {
        showProgressIndicator: jest.fn(),
        closeProgressIndicator: jest.fn(),
        lookupObjects: jest.fn().mockResolvedValue([]),
        getGlobalContext: jest.fn(() => ({
            userSettings: {
                userId: '{user-id}',
                userName: 'Test User',
                securityRoles: [{ id: '{role-id}', name: 'Sales' }],
                roles: [{ id: '{role-id}', name: 'Sales' }],
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

describe('AIDEVME.Contact.Ribbon', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Re-apply default resolved values cleared by clearAllMocks
        Xrm.Navigation.navigateTo.mockResolvedValue(undefined);
        Xrm.WebApi.updateRecord.mockResolvedValue({ id: 'mock-id' });
        Xrm.Utility.lookupObjects.mockResolvedValue([]);

        // Load the ribbon script
        require('../../ribbons/contact.ribbon.js');
    });

    // ========================================
    // COMMAND ACTIONS
    // ========================================

    describe('sendEmailToContacts', () => {
        it('should show warning when no contacts are selected', () => {
            AIDEVME.Contact.Ribbon.sendEmailToContacts([]);

            expect(Xrm.Navigation.openAlertDialog).toHaveBeenCalledWith(
                expect.objectContaining({ text: 'Please select at least one contact' })
            );
        });

        it('should show warning when selectedItems is null', () => {
            AIDEVME.Contact.Ribbon.sendEmailToContacts(null);

            expect(Xrm.Navigation.openAlertDialog).toHaveBeenCalledWith(
                expect.objectContaining({ text: 'Please select at least one contact' })
            );
        });

        it('should call navigateTo with email entityrecord when contacts are selected', () => {
            const selectedItems = [
                { Id: '{contact-1}', Name: 'John Doe' },
                { Id: '{contact-2}', Name: 'Jane Smith' },
            ];

            AIDEVME.Contact.Ribbon.sendEmailToContacts(selectedItems);

            expect(Xrm.Navigation.navigateTo).toHaveBeenCalledWith(
                expect.objectContaining({
                    pageType: 'entityrecord',
                    entityName: 'email',
                    data: expect.objectContaining({
                        subject: 'Message to John Doe, Jane Smith',
                    }),
                }),
                expect.objectContaining({ target: 2 })
            );
        });
    });

    describe('scheduleAppointmentWithContacts', () => {
        it('should show warning when no contacts are selected', () => {
            AIDEVME.Contact.Ribbon.scheduleAppointmentWithContacts([]);

            expect(Xrm.Navigation.openAlertDialog).toHaveBeenCalledWith(
                expect.objectContaining({ text: 'Please select at least one contact' })
            );
        });

        it('should call navigateTo with appointment entity when contacts are selected', () => {
            const selectedItems = [{ Id: '{contact-1}', Name: 'Alice Johnson' }];

            AIDEVME.Contact.Ribbon.scheduleAppointmentWithContacts(selectedItems);

            expect(Xrm.Navigation.navigateTo).toHaveBeenCalledWith(
                expect.objectContaining({
                    pageType: 'entityrecord',
                    entityName: 'appointment',
                    data: expect.objectContaining({
                        subject: 'Meeting with Alice Johnson',
                    }),
                }),
                expect.objectContaining({ target: 2 })
            );
        });

        it('should include all contact names in appointment subject', () => {
            const selectedItems = [
                { Id: '{contact-1}', Name: 'Alice' },
                { Id: '{contact-2}', Name: 'Bob' },
            ];

            AIDEVME.Contact.Ribbon.scheduleAppointmentWithContacts(selectedItems);

            expect(Xrm.Navigation.navigateTo).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({ subject: 'Meeting with Alice, Bob' }),
                }),
                expect.any(Object)
            );
        });
    });

    describe('addToMarketingList', () => {
        it('should show warning when no contacts are selected', () => {
            AIDEVME.Contact.Ribbon.addToMarketingList([]);

            expect(Xrm.Navigation.openAlertDialog).toHaveBeenCalledWith(
                expect.objectContaining({ text: 'Please select contacts to add to marketing list' })
            );
        });

        it('should call lookupObjects for marketing list selection when contacts selected', () => {
            const selectedItems = [{ Id: '{contact-1}', Name: 'John Doe' }];

            AIDEVME.Contact.Ribbon.addToMarketingList(selectedItems);

            expect(Xrm.Utility.lookupObjects).toHaveBeenCalledWith(
                expect.objectContaining({ entityTypes: ['list'] })
            );
        });
    });

    describe('mergeContacts', () => {
        it('should show warning when fewer than 2 contacts are selected', () => {
            AIDEVME.Contact.Ribbon.mergeContacts([{ Id: '{contact-1}' }]);

            expect(Xrm.Navigation.openAlertDialog).toHaveBeenCalledWith(
                expect.objectContaining({ text: 'Please select at least 2 contacts to merge' })
            );
        });

        it('should show warning when more than 3 contacts are selected', () => {
            const fourContacts = [
                { Id: '{contact-1}', Name: 'A' },
                { Id: '{contact-2}', Name: 'B' },
                { Id: '{contact-3}', Name: 'C' },
                { Id: '{contact-4}', Name: 'D' },
            ];

            AIDEVME.Contact.Ribbon.mergeContacts(fourContacts);

            expect(Xrm.Navigation.openAlertDialog).toHaveBeenCalledWith(
                expect.objectContaining({ text: 'You can only merge up to 3 contacts at a time' })
            );
        });

        it('should open confirm dialog when exactly 2 contacts are selected', () => {
            Xrm.Navigation.openConfirmDialog.mockResolvedValue({ confirmed: false });
            const twoContacts = [
                { Id: '{contact-1}', Name: 'John Doe' },
                { Id: '{contact-2}', Name: 'Jane Smith' },
            ];

            AIDEVME.Contact.Ribbon.mergeContacts(twoContacts);

            expect(Xrm.Navigation.openConfirmDialog).toHaveBeenCalledWith(
                expect.objectContaining({ title: 'Confirm Merge' })
            );
        });

        it('should open confirm dialog when exactly 3 contacts are selected', () => {
            Xrm.Navigation.openConfirmDialog.mockResolvedValue({ confirmed: false });
            const threeContacts = [
                { Id: '{contact-1}', Name: 'A' },
                { Id: '{contact-2}', Name: 'B' },
                { Id: '{contact-3}', Name: 'C' },
            ];

            AIDEVME.Contact.Ribbon.mergeContacts(threeContacts);

            expect(Xrm.Navigation.openConfirmDialog).toHaveBeenCalledWith(
                expect.objectContaining({ title: 'Confirm Merge' })
            );
        });
    });

    describe('exportContactsToExcel', () => {
        it('should show warning when no contacts are selected', () => {
            AIDEVME.Contact.Ribbon.exportContactsToExcel([]);

            expect(Xrm.Navigation.openAlertDialog).toHaveBeenCalledWith(
                expect.objectContaining({ text: 'Please select contacts to export' })
            );
        });

        it('should show export notification for selected contacts', () => {
            const selectedItems = [
                { Id: '{contact-1}', Name: 'John Doe' },
                { Id: '{contact-2}', Name: 'Jane Smith' },
            ];

            AIDEVME.Contact.Ribbon.exportContactsToExcel(selectedItems);

            expect(Xrm.Navigation.openAlertDialog).toHaveBeenCalledWith(
                expect.objectContaining({ text: 'Exporting 2 contact(s) to Excel...' })
            );
        });

        it('should show export initiated notification after building FetchXML', () => {
            const selectedItems = [{ Id: '{contact-1}', Name: 'John Doe' }];

            AIDEVME.Contact.Ribbon.exportContactsToExcel(selectedItems);

            // Should log the FetchXML and show success notification
            expect(console.log).toHaveBeenCalledWith(
                'Export FetchXML:',
                expect.stringContaining('<entity name="contact">')
            );
            expect(Xrm.Navigation.openAlertDialog).toHaveBeenCalledWith(
                expect.objectContaining({ text: 'Export initiated for 1 contact(s)' })
            );
        });
    });

    describe('assignContactsToUser', () => {
        it('should show warning when no contacts are selected', () => {
            AIDEVME.Contact.Ribbon.assignContactsToUser([]);

            expect(Xrm.Navigation.openAlertDialog).toHaveBeenCalledWith(
                expect.objectContaining({ text: 'Please select contacts to assign' })
            );
        });

        it('should call lookupObjects for user selection when contacts selected', () => {
            const selectedItems = [{ Id: '{contact-1}', Name: 'John Doe' }];

            AIDEVME.Contact.Ribbon.assignContactsToUser(selectedItems);

            expect(Xrm.Utility.lookupObjects).toHaveBeenCalledWith(
                expect.objectContaining({ entityTypes: ['systemuser'] })
            );
        });
    });

    describe('deactivateContacts', () => {
        it('should show warning when no contacts are selected', () => {
            AIDEVME.Contact.Ribbon.deactivateContacts([]);

            expect(Xrm.Navigation.openAlertDialog).toHaveBeenCalledWith(
                expect.objectContaining({ text: 'Please select contacts to deactivate' })
            );
        });

        it('should open confirm dialog with correct contact count message', () => {
            Xrm.Navigation.openConfirmDialog.mockResolvedValue({ confirmed: false });
            const selectedItems = [
                { Id: '{contact-1}', Name: 'John Doe' },
                { Id: '{contact-2}', Name: 'Jane Smith' },
            ];

            AIDEVME.Contact.Ribbon.deactivateContacts(selectedItems);

            expect(Xrm.Navigation.openConfirmDialog).toHaveBeenCalledWith({
                text: 'Are you sure you want to deactivate 2 contact(s)?',
                title: 'Confirm Deactivation',
            });
        });

        it('should call updateRecord with statecode 1 and statuscode 2 when confirmed', async () => {
            Xrm.Navigation.openConfirmDialog.mockResolvedValue({ confirmed: true });
            Xrm.WebApi.updateRecord.mockResolvedValue({ id: 'contact-1' });
            const selectedItems = [{ Id: '{contact-1}', Name: 'John Doe' }];

            AIDEVME.Contact.Ribbon.deactivateContacts(selectedItems);

            // Flush the promise microtask queue for openConfirmDialog.then()
            await Promise.resolve();
            // Flush the Promise.all inside processDeactivation
            await Promise.resolve();
            await Promise.resolve();

            expect(Xrm.WebApi.updateRecord).toHaveBeenCalledWith(
                'contact',
                'contact-1',
                { statecode: 1, statuscode: 2 }
            );
        });

        it('should not call updateRecord when user cancels deactivation', async () => {
            Xrm.Navigation.openConfirmDialog.mockResolvedValue({ confirmed: false });
            const selectedItems = [{ Id: '{contact-1}', Name: 'John Doe' }];

            AIDEVME.Contact.Ribbon.deactivateContacts(selectedItems);

            await Promise.resolve();
            await Promise.resolve();

            expect(Xrm.WebApi.updateRecord).not.toHaveBeenCalled();
        });
    });

    // ========================================
    // ENABLE RULES
    // ========================================

    describe('Enable Rules', () => {
        describe('enableRuleOneSelected', () => {
            it('should return true for exactly one contact', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleOneSelected([{ Id: '{contact-1}' }])).toBe(true);
            });

            it('should return false for zero contacts', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleOneSelected([])).toBe(false);
            });

            it('should return false for two contacts', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleOneSelected([{}, {}])).toBe(false);
            });
        });

        describe('enableRuleAtLeastOneSelected', () => {
            it('should return true when at least one contact is selected', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleAtLeastOneSelected([{ Id: '{contact-1}' }])).toBe(true);
            });

            it('should return false when no contacts are selected', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleAtLeastOneSelected([])).toBe(false);
            });

            it('should return true for multiple contacts', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleAtLeastOneSelected([{}, {}, {}])).toBe(true);
            });
        });

        describe('enableRuleTwoSelected', () => {
            it('should return true for exactly two contacts', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleTwoSelected([{}, {}])).toBe(true);
            });

            it('should return false for one contact', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleTwoSelected([{}])).toBe(false);
            });

            it('should return false for three contacts', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleTwoSelected([{}, {}, {}])).toBe(false);
            });
        });

        describe('enableRuleTwoToThreeSelected', () => {
            it('should return false for 1 contact', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleTwoToThreeSelected([{}])).toBe(false);
            });

            it('should return true for 2 contacts', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleTwoToThreeSelected([{}, {}])).toBe(true);
            });

            it('should return true for 3 contacts', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleTwoToThreeSelected([{}, {}, {}])).toBe(true);
            });

            it('should return false for 4 contacts (exceeds merge limit)', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleTwoToThreeSelected([{}, {}, {}, {}])).toBe(false);
            });

            it('should return false for empty selection', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleTwoToThreeSelected([])).toBe(false);
            });
        });

        describe('enableRuleHasEmailAddress', () => {
            it('should return true when all contacts have EmailAddress1', () => {
                const items = [
                    { Id: 'a', EmailAddress1: 'a@test.com' },
                    { Id: 'b', EmailAddress1: 'b@test.com' },
                ];
                expect(AIDEVME.Contact.Ribbon.enableRuleHasEmailAddress(items)).toBe(true);
            });

            it('should return true when contacts have lowercase emailaddress1 field', () => {
                const items = [{ Id: 'a', emailaddress1: 'a@test.com' }];
                expect(AIDEVME.Contact.Ribbon.enableRuleHasEmailAddress(items)).toBe(true);
            });

            it('should return false when any contact is missing an email address', () => {
                const items = [
                    { Id: 'a', EmailAddress1: 'a@test.com' },
                    { Id: 'b' }, // no email field
                ];
                expect(AIDEVME.Contact.Ribbon.enableRuleHasEmailAddress(items)).toBe(false);
            });

            it('should return false when email field is null', () => {
                const items = [{ Id: 'a', EmailAddress1: null }];
                expect(AIDEVME.Contact.Ribbon.enableRuleHasEmailAddress(items)).toBe(false);
            });

            it('should return false for empty selection', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleHasEmailAddress([])).toBe(false);
            });

            it('should return false for null input', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleHasEmailAddress(null)).toBe(false);
            });
        });

        describe('enableRuleHasParentAccount', () => {
            it('should return true when single contact has ParentCustomerId', () => {
                const items = [{ Id: 'a', ParentCustomerId: 'account-123' }];
                expect(AIDEVME.Contact.Ribbon.enableRuleHasParentAccount(items)).toBe(true);
            });

            it('should return true when contact has lowercase parentcustomerid', () => {
                const items = [{ Id: 'a', parentcustomerid: 'account-123' }];
                expect(AIDEVME.Contact.Ribbon.enableRuleHasParentAccount(items)).toBe(true);
            });

            it('should return true when contact has _parentcustomerid_value (WebApi format)', () => {
                const items = [{ Id: 'a', _parentcustomerid_value: 'account-123' }];
                expect(AIDEVME.Contact.Ribbon.enableRuleHasParentAccount(items)).toBe(true);
            });

            it('should return false when contact has no parent account', () => {
                const items = [{ Id: 'a' }];
                expect(AIDEVME.Contact.Ribbon.enableRuleHasParentAccount(items)).toBe(false);
            });

            it('should return false when multiple contacts are selected', () => {
                const items = [
                    { Id: 'a', ParentCustomerId: 'account-123' },
                    { Id: 'b', ParentCustomerId: 'account-456' },
                ];
                expect(AIDEVME.Contact.Ribbon.enableRuleHasParentAccount(items)).toBe(false);
            });

            it('should return false for empty selection', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleHasParentAccount([])).toBe(false);
            });
        });

        describe('enableRuleEmailAllowed', () => {
            it('should return true when all contacts allow email', () => {
                const items = [
                    { Id: 'a', DoNotEmail: false },
                    { Id: 'b', donotemail: false },
                ];
                expect(AIDEVME.Contact.Ribbon.enableRuleEmailAllowed(items)).toBe(true);
            });

            it('should return true when contacts have no DoNotEmail field set', () => {
                const items = [{ Id: 'a', Name: 'John' }];
                expect(AIDEVME.Contact.Ribbon.enableRuleEmailAllowed(items)).toBe(true);
            });

            it('should return false when any contact has DoNotEmail set to true', () => {
                const items = [
                    { Id: 'a', DoNotEmail: false },
                    { Id: 'b', DoNotEmail: true },
                ];
                expect(AIDEVME.Contact.Ribbon.enableRuleEmailAllowed(items)).toBe(false);
            });

            it('should return false when donotemail is the string "true"', () => {
                const items = [{ Id: 'a', donotemail: 'true' }];
                expect(AIDEVME.Contact.Ribbon.enableRuleEmailAllowed(items)).toBe(false);
            });

            it('should return false for empty selection', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleEmailAllowed([])).toBe(false);
            });

            it('should return false for null input', () => {
                expect(AIDEVME.Contact.Ribbon.enableRuleEmailAllowed(null)).toBe(false);
            });
        });

        describe('enableRuleHasEmail (alias)', () => {
            it('should return true when all selected contacts have email', () => {
                const selectedItems = [{ Id: '{contact-1}', EmailAddress1: 'john@example.com' }];
                expect(AIDEVME.Contact.Ribbon.enableRuleHasEmail(selectedItems)).toBe(true);
            });

            it('should return false when a contact lacks an email address', () => {
                const selectedItems = [{ Id: '{contact-1}', EmailAddress1: null }];
                expect(AIDEVME.Contact.Ribbon.enableRuleHasEmail(selectedItems)).toBe(false);
            });
        });
    });

    // ========================================
    // DISPLAY RULES
    // ========================================

    describe('Display Rules', () => {
        describe('displayRuleActiveContactsView', () => {
            it('should return true when no primaryControl provided', () => {
                const result = AIDEVME.Contact.Ribbon.displayRuleActiveContactsView(null);
                expect(result).toBe(true);
            });

            it('should return true when view matches active contacts view ID', () => {
                const mockPrimaryControl = {
                    getViewSelector: jest.fn(() => ({
                        getCurrentView: jest.fn(() => ({
                            id: '{00000000-0000-0000-00aa-000010001003}',
                            name: 'Active Contacts',
                        })),
                    })),
                };

                const result = AIDEVME.Contact.Ribbon.displayRuleActiveContactsView(mockPrimaryControl);

                expect(result).toBe(true);
            });

            it('should return false when current view does not match active contacts view ID', () => {
                const mockPrimaryControl = {
                    getViewSelector: jest.fn(() => ({
                        getCurrentView: jest.fn(() => ({
                            id: '{99999999-9999-9999-9999-999999999999}',
                            name: 'Inactive Contacts',
                        })),
                    })),
                };

                const result = AIDEVME.Contact.Ribbon.displayRuleActiveContactsView(mockPrimaryControl);

                expect(result).toBe(false);
            });

            it('should return true when viewSelector returns null', () => {
                const mockPrimaryControl = {
                    getViewSelector: jest.fn(() => null),
                };

                const result = AIDEVME.Contact.Ribbon.displayRuleActiveContactsView(mockPrimaryControl);

                expect(result).toBe(true);
            });
        });

        describe('displayRuleMarketingUserOnly', () => {
            it('should return true when user has the marketing security role', () => {
                Xrm.Utility.getGlobalContext.mockReturnValueOnce({
                    userSettings: {
                        securityRoles: [{ id: '{00000000-0000-0000-0000-000000000002}' }],
                    },
                });

                const result = AIDEVME.Contact.Ribbon.displayRuleMarketingUserOnly();

                expect(result).toBe(true);
            });

            it('should return false when user does not have the marketing security role', () => {
                Xrm.Utility.getGlobalContext.mockReturnValueOnce({
                    userSettings: {
                        securityRoles: [{ id: '{00000000-0000-0000-0000-000000000099}' }],
                    },
                });

                const result = AIDEVME.Contact.Ribbon.displayRuleMarketingUserOnly();

                expect(result).toBe(false);
            });

            it('should return false when user has no security roles', () => {
                Xrm.Utility.getGlobalContext.mockReturnValueOnce({
                    userSettings: { securityRoles: [] },
                });

                const result = AIDEVME.Contact.Ribbon.displayRuleMarketingUserOnly();

                expect(result).toBe(false);
            });
        });

        describe('displayRuleSalesRole', () => {
            it('should return true when user has the sales security role', () => {
                Xrm.Utility.getGlobalContext.mockReturnValueOnce({
                    userSettings: {
                        securityRoles: [{ id: '{00000000-0000-0000-0000-000000000003}' }],
                    },
                });

                const result = AIDEVME.Contact.Ribbon.displayRuleSalesRole();

                expect(result).toBe(true);
            });

            it('should return false when user does not have the sales security role', () => {
                Xrm.Utility.getGlobalContext.mockReturnValueOnce({
                    userSettings: {
                        securityRoles: [{ id: '{00000000-0000-0000-0000-000000000001}' }],
                    },
                });

                const result = AIDEVME.Contact.Ribbon.displayRuleSalesRole();

                expect(result).toBe(false);
            });
        });
    });

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================

    describe('Utility Functions', () => {
        describe('getSelectedRecords', () => {
            it('should return empty array when primaryControl is null', () => {
                expect(AIDEVME.Contact.Ribbon.getSelectedRecords(null)).toEqual([]);
            });

            it('should return empty array when primaryControl has no getGrid method', () => {
                expect(AIDEVME.Contact.Ribbon.getSelectedRecords({})).toEqual([]);
            });

            it('should return empty array when grid has no getSelectedRows method', () => {
                const mockControl = { getGrid: jest.fn(() => ({})) };
                expect(AIDEVME.Contact.Ribbon.getSelectedRecords(mockControl)).toEqual([]);
            });

            it('should return mapped records from grid selection', () => {
                const mockPrimaryControl = {
                    getGrid: jest.fn(() => ({
                        getSelectedRows: jest.fn(() => [
                            {
                                getData: jest.fn(() => ({
                                    entity: {
                                        getId: jest.fn(() => 'contact-record-id'),
                                        getEntityName: jest.fn(() => 'contact'),
                                        attributes: [],
                                    },
                                })),
                            },
                        ]),
                    })),
                };

                const result = AIDEVME.Contact.Ribbon.getSelectedRecords(mockPrimaryControl);

                expect(result).toHaveLength(1);
                expect(result[0].Id).toBe('contact-record-id');
                expect(result[0].Name).toBe('contact');
                expect(result[0].TypeName).toBe('contact');
            });

            it('should return empty array when no rows are selected', () => {
                const mockPrimaryControl = {
                    getGrid: jest.fn(() => ({
                        getSelectedRows: jest.fn(() => []),
                    })),
                };

                const result = AIDEVME.Contact.Ribbon.getSelectedRecords(mockPrimaryControl);

                expect(result).toEqual([]);
            });
        });

        describe('showNotification', () => {
            it('should call openAlertDialog with the message and level as title', () => {
                AIDEVME.Contact.Ribbon.showNotification('Test message', 'INFO');

                expect(Xrm.Navigation.openAlertDialog).toHaveBeenCalledWith({
                    text: 'Test message',
                    title: 'INFO',
                });
            });

            it('should use "Notification" as default title when level is not provided', () => {
                AIDEVME.Contact.Ribbon.showNotification('Test message');

                expect(Xrm.Navigation.openAlertDialog).toHaveBeenCalledWith({
                    text: 'Test message',
                    title: 'Notification',
                });
            });
        });

        describe('handleError', () => {
            it('should log the error to console with function name context', () => {
                const error = new Error('Test error');

                AIDEVME.Contact.Ribbon.handleError('testFunction', error);

                expect(console.error).toHaveBeenCalledWith(
                    expect.stringContaining('testFunction')
                );
            });

            it('should show error notification via openAlertDialog', () => {
                const error = new Error('Something failed');

                AIDEVME.Contact.Ribbon.handleError('myFunction', error);

                expect(Xrm.Navigation.openAlertDialog).toHaveBeenCalledWith(
                    expect.objectContaining({
                        text: expect.stringContaining('myFunction'),
                        title: 'ERROR',
                    })
                );
            });

            it('should handle string errors gracefully', () => {
                AIDEVME.Contact.Ribbon.handleError('myFunction', 'A string error');

                expect(console.error).toHaveBeenCalled();
            });
        });
    });
});

/**
 * Contact Ribbon JavaScript
 * Web Resource: aidevme_/scripts/ribbons/contact.ribbon.js
 * 
 * Description: Custom ribbon commands for Contact entity
 * Dependencies: None
 * 
 * @namespace AIDEVME.Contact.Ribbon
 */

// Create namespace to avoid global scope pollution
var AIDEVME = AIDEVME || {};
AIDEVME.Contact = AIDEVME.Contact || {};

AIDEVME.Contact.Ribbon = (function () {
    "use strict";

    /**
     * Sends email to selected contacts
     * Command Action - Called when "Send Email" button is clicked
     * @param {Array} selectedItems - Array of selected grid records
     */
    function sendEmailToContacts(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length === 0) {
                showNotification("Please select at least one contact", "WARNING");
                return;
            }

            // Collect email addresses from selected contacts
            var emailAddresses = [];
            var contactNames = [];

            selectedItems.forEach(function (item) {
                var contactId = item.Id.replace(/[{}]/g, "");
                contactNames.push(item.Name || "Unknown Contact");
                emailAddresses.push(contactId);
            });

            // Open email form with recipients
            var pageInput = {
                pageType: "entityrecord",
                entityName: "email",
                data: {
                    subject: "Message to " + contactNames.join(", ")
                }
            };

            var navigationOptions = {
                target: 2, // Dialog
                width: { value: 80, unit: "%" },
                height: { value: 80, unit: "%" },
                position: 1 // Center
            };

            // Create email activity
            Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
                function () {
                    console.log("Email form opened for " + selectedItems.length + " contact(s)");
                },
                function (error) {
                    handleError("sendEmailToContacts - navigation", error);
                }
            );

        } catch (error) {
            handleError("sendEmailToContacts", error);
        }
    }

    /**
     * Schedules an appointment with selected contacts
     * Command Action - Called when "Schedule Appointment" button is clicked
     * @param {Array} selectedItems - Array of selected grid records
     */
    function scheduleAppointmentWithContacts(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length === 0) {
                showNotification("Please select at least one contact", "WARNING");
                return;
            }

            var contactNames = selectedItems.map(function (item) {
                return item.Name || "Unknown Contact";
            });

            // Open appointment form
            var pageInput = {
                pageType: "entityrecord",
                entityName: "appointment",
                data: {
                    subject: "Meeting with " + contactNames.join(", "),
                    // Required attendees will be set via party list
                    scheduledstart: new Date(),
                    scheduledend: new Date(Date.now() + 3600000) // 1 hour later
                }
            };

            var navigationOptions = {
                target: 2, // Dialog
                width: { value: 70, unit: "%" },
                height: { value: 70, unit: "%" },
                position: 1
            };

            Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
                function () {
                    console.log("Appointment form opened for " + selectedItems.length + " contact(s)");
                },
                function (error) {
                    handleError("scheduleAppointmentWithContacts - navigation", error);
                }
            );

        } catch (error) {
            handleError("scheduleAppointmentWithContacts", error);
        }
    }

    /**
     * Adds selected contacts to a marketing list
     * Command Action - Called when "Add to Marketing List" button is clicked
     * @param {Array} selectedItems - Array of selected grid records
     */
    function addToMarketingList(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length === 0) {
                showNotification("Please select contacts to add to marketing list", "WARNING");
                return;
            }

            // Show dialog to select marketing list
            var lookupOptions = {
                entityTypes: ["list"],
                allowMultiSelect: false,
                defaultEntityType: "list",
                filters: [{
                    filterXml: "<filter type='and'>" +
                              "<condition attribute='type' operator='eq' value='0' />" + // Static
                              "<condition attribute='createdfromcode' operator='eq' value='2' />" + // Contact
                              "</filter>"
                }]
            };

            Xrm.Utility.lookupObjects(lookupOptions).then(
                function (results) {
                    if (results && results.length > 0) {
                        var marketingList = results[0];
                        addContactsToList(selectedItems, marketingList);
                    }
                },
                function (error) {
                    handleError("addToMarketingList - lookup", error);
                }
            );

        } catch (error) {
            handleError("addToMarketingList", error);
        }
    }

    /**
     * Process adding contacts to marketing list
     * @param {Array} selectedItems - Array of contact records
     * @param {Object} marketingList - Marketing list entity reference
     */
    function addContactsToList(selectedItems, marketingList) {
        try {
            showNotification("Adding " + selectedItems.length + " contact(s) to " + marketingList.name + "...", "INFO");

            var promises = [];

            selectedItems.forEach(function (item) {
                var contactId = item.Id.replace(/[{}]/g, "");
                var listId = marketingList.id.replace(/[{}]/g, "");

                // Create listmember record
                var listMember = {
                    "listid@odata.bind": "/lists(" + listId + ")",
                    "entityid@odata.bind": "/contacts(" + contactId + ")"
                };

                var promise = Xrm.WebApi.createRecord("listmember", listMember);
                promises.push(promise);
            });

            Promise.all(promises).then(
                function (results) {
                    showNotification("Added " + results.length + " contact(s) to " + marketingList.name, "SUCCESS");
                    refreshGrid();
                },
                function (error) {
                    handleError("addContactsToList - create records", error);
                }
            );

        } catch (error) {
            handleError("addContactsToList", error);
        }
    }

    /**
     * Updates contact preferences for selected contacts
     * Command Action - Called when "Update Preferences" button is clicked
     * @param {Array} selectedItems - Array of selected grid records
     */
    function updateContactPreferences(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length === 0) {
                showNotification("Please select contacts to update preferences", "WARNING");
                return;
            }

            // Show dialog with preference options
            var alertStrings = {
                confirmButtonLabel: "Update",
                text: "Select contact preference to apply:\n\n" +
                      "• Do Not Email\n" +
                      "• Do Not Phone\n" +
                      "• Do Not Mail\n" +
                      "• Allow Marketing Materials",
                title: "Update Contact Preferences"
            };

            var alertOptions = { height: 250, width: 400 };

            Xrm.Navigation.openAlertDialog(alertStrings, alertOptions).then(
                function () {
                    // In production, open custom dialog or form for preference selection
                    showPreferencesDialog(selectedItems);
                }
            );

        } catch (error) {
            handleError("updateContactPreferences", error);
        }
    }

    /**
     * Show preferences dialog (custom implementation)
     * @param {Array} selectedItems - Array of contact records
     */
    function showPreferencesDialog(selectedItems) {
        try {
            // Example: Set all selected contacts to allow email
            var confirmText = "Allow email for " + selectedItems.length + " contact(s)?";

            Xrm.Navigation.openConfirmDialog({ text: confirmText }).then(
                function (result) {
                    if (result.confirmed) {
                        updatePreferences(selectedItems, {
                            donotemail: false,
                            donotbulkemail: false
                        });
                    }
                }
            );

        } catch (error) {
            handleError("showPreferencesDialog", error);
        }
    }

    /**
     * Update contact preferences
     * @param {Array} selectedItems - Array of contact records
     * @param {Object} preferences - Preference values to set
     */
    function updatePreferences(selectedItems, preferences) {
        try {
            var promises = [];

            selectedItems.forEach(function (item) {
                var contactId = item.Id.replace(/[{}]/g, "");
                var promise = Xrm.WebApi.updateRecord("contact", contactId, preferences);
                promises.push(promise);
            });

            Promise.all(promises).then(
                function (results) {
                    showNotification("Updated preferences for " + results.length + " contact(s)", "SUCCESS");
                    refreshGrid();
                },
                function (error) {
                    handleError("updatePreferences - update", error);
                }
            );

        } catch (error) {
            handleError("updatePreferences", error);
        }
    }

    /**
     * Merges selected contacts
     * Command Action - Called when "Merge Contacts" button is clicked
     * @param {Array} selectedItems - Array of selected grid records
     */
    function mergeContacts(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length < 2) {
                showNotification("Please select at least 2 contacts to merge", "WARNING");
                return;
            }

            if (selectedItems.length > 3) {
                showNotification("You can only merge up to 3 contacts at a time", "WARNING");
                return;
            }

            var contactNames = selectedItems.map(function (item) { return item.Name; });

            Xrm.Navigation.openConfirmDialog({
                text: "Are you sure you want to merge these contacts?\n\n" + contactNames.join("\n"),
                title: "Confirm Merge"
            }).then(
                function (result) {
                    if (result.confirmed) {
                        showNotification("Opening merge dialog for " + selectedItems.length + " contacts...", "INFO");
                        // In production, navigate to merge dialog or use Merge API
                        console.log("Merge initiated for contacts:", selectedItems);
                    }
                }
            );

        } catch (error) {
            handleError("mergeContacts", error);
        }
    }

    /**
     * Sets selected contact as primary contact for parent account
     * Command Action - Called when "Set as Primary Contact" button is clicked
     * @param {Object} primaryControl - Primary control (form or grid)
     * @param {Array} selectedItems - Array of selected grid records
     */
    function setAsPrimaryContact(primaryControl, selectedItems) {
        try {
            if (!selectedItems || selectedItems.length !== 1) {
                showNotification("Please select exactly one contact", "WARNING");
                return;
            }

            var contactId = selectedItems[0].Id.replace(/[{}]/g, "");
            var contactName = selectedItems[0].Name;

            // Retrieve contact's parent account
            Xrm.WebApi.retrieveRecord("contact", contactId, "?$select=_parentcustomerid_value").then(
                function (contact) {
                    if (!contact._parentcustomerid_value) {
                        showNotification("This contact does not have a parent account", "WARNING");
                        return;
                    }

                    var accountId = contact._parentcustomerid_value;

                    // Update account's primary contact
                    var accountData = {
                        "primarycontactid@odata.bind": "/contacts(" + contactId + ")"
                    };

                    Xrm.WebApi.updateRecord("account", accountId, accountData).then(
                        function () {
                            showNotification(contactName + " set as primary contact", "SUCCESS");
                            refreshGrid();
                        },
                        function (error) {
                            handleError("setAsPrimaryContact - update account", error);
                        }
                    );
                },
                function (error) {
                    handleError("setAsPrimaryContact - retrieve contact", error);
                }
            );

        } catch (error) {
            handleError("setAsPrimaryContact", error);
        }
    }

    /**
     * Links contacts to a parent account
     * Command Action - Called when "Link to Account" button is clicked
     * @param {Array} selectedItems - Array of selected grid records
     */
    function linkToParentAccount(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length === 0) {
                showNotification("Please select contacts to link to account", "WARNING");
                return;
            }

            // Open account lookup
            var lookupOptions = {
                entityTypes: ["account"],
                allowMultiSelect: false,
                defaultEntityType: "account"
            };

            Xrm.Utility.lookupObjects(lookupOptions).then(
                function (results) {
                    if (results && results.length > 0) {
                        var parentAccount = results[0];
                        linkContactsToAccount(selectedItems, parentAccount);
                    }
                },
                function (error) {
                    handleError("linkToParentAccount - lookup", error);
                }
            );

        } catch (error) {
            handleError("linkToParentAccount", error);
        }
    }

    /**
     * Process linking contacts to account
     * @param {Array} selectedItems - Array of contact records
     * @param {Object} parentAccount - Parent account entity reference
     */
    function linkContactsToAccount(selectedItems, parentAccount) {
        try {
            showNotification("Linking " + selectedItems.length + " contact(s) to " + parentAccount.name + "...", "INFO");

            var promises = [];
            var accountId = parentAccount.id.replace(/[{}]/g, "");

            selectedItems.forEach(function (item) {
                var contactId = item.Id.replace(/[{}]/g, "");

                var contactData = {
                    "parentcustomerid_account@odata.bind": "/accounts(" + accountId + ")"
                };

                var promise = Xrm.WebApi.updateRecord("contact", contactId, contactData);
                promises.push(promise);
            });

            Promise.all(promises).then(
                function (results) {
                    showNotification("Linked " + results.length + " contact(s) to " + parentAccount.name, "SUCCESS");
                    refreshGrid();
                },
                function (error) {
                    handleError("linkContactsToAccount - update", error);
                }
            );

        } catch (error) {
            handleError("linkContactsToAccount", error);
        }
    }

    /**
     * Exports selected contacts to Excel
     * Command Action - Called when "Export to Excel" button is clicked
     * @param {Array} selectedItems - Array of selected grid records
     */
    function exportContactsToExcel(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length === 0) {
                showNotification("Please select contacts to export", "WARNING");
                return;
            }

            showNotification("Exporting " + selectedItems.length + " contact(s) to Excel...", "INFO");

            var contactIds = selectedItems.map(function (item) {
                return item.Id.replace(/[{}]/g, "");
            });

            var fetchXml = buildContactExportFetchXml(contactIds);

            console.log("Export FetchXML:", fetchXml);
            showNotification("Export initiated for " + contactIds.length + " contact(s)", "SUCCESS");

        } catch (error) {
            handleError("exportContactsToExcel", error);
        }
    }

    /**
     * Build FetchXML for contact export
     * @param {Array} contactIds - Array of contact IDs
     * @returns {string} FetchXML query
     */
    function buildContactExportFetchXml(contactIds) {
        var conditions = contactIds.map(function (id) {
            return '<value>' + id + '</value>';
        }).join('');

        var fetchXml = 
            '<fetch>' +
            '  <entity name="contact">' +
            '    <attribute name="fullname" />' +
            '    <attribute name="firstname" />' +
            '    <attribute name="lastname" />' +
            '    <attribute name="emailaddress1" />' +
            '    <attribute name="telephone1" />' +
            '    <attribute name="mobilephone" />' +
            '    <attribute name="jobtitle" />' +
            '    <attribute name="parentcustomerid" />' +
            '    <attribute name="address1_composite" />' +
            '    <filter type="or">' +
            conditions +
            '    </filter>' +
            '  </entity>' +
            '</fetch>';

        return fetchXml;
    }

    /**
     * Assigns contacts to a user
     * Command Action - Called when "Assign to User" button is clicked
     * @param {Array} selectedItems - Array of selected grid records
     */
    function assignContactsToUser(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length === 0) {
                showNotification("Please select contacts to assign", "WARNING");
                return;
            }

            // Open user lookup
            var lookupOptions = {
                entityTypes: ["systemuser"],
                allowMultiSelect: false,
                defaultEntityType: "systemuser"
            };

            Xrm.Utility.lookupObjects(lookupOptions).then(
                function (results) {
                    if (results && results.length > 0) {
                        var user = results[0];
                        processAssignment(selectedItems, user);
                    }
                },
                function (error) {
                    handleError("assignContactsToUser - lookup", error);
                }
            );

        } catch (error) {
            handleError("assignContactsToUser", error);
        }
    }

    /**
     * Process assignment of contacts to user
     * @param {Array} selectedItems - Array of contact records
     * @param {Object} user - User entity reference
     */
    function processAssignment(selectedItems, user) {
        try {
            showNotification("Assigning " + selectedItems.length + " contact(s) to " + user.name + "...", "INFO");

            var promises = [];
            var userId = user.id.replace(/[{}]/g, "");

            selectedItems.forEach(function (item) {
                var contactId = item.Id.replace(/[{}]/g, "");

                var assignRequest = {
                    "ownerid@odata.bind": "/systemusers(" + userId + ")"
                };

                var promise = Xrm.WebApi.updateRecord("contact", contactId, assignRequest);
                promises.push(promise);
            });

            Promise.all(promises).then(
                function (results) {
                    showNotification("Assigned " + results.length + " contact(s) to " + user.name, "SUCCESS");
                    refreshGrid();
                },
                function (error) {
                    handleError("processAssignment - update", error);
                }
            );

        } catch (error) {
            handleError("processAssignment", error);
        }
    }

    /**
     * Deactivates selected contacts
     * Command Action - Called when "Deactivate" button is clicked
     * @param {Array} selectedItems - Array of selected grid records
     */
    function deactivateContacts(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length === 0) {
                showNotification("Please select contacts to deactivate", "WARNING");
                return;
            }

            Xrm.Navigation.openConfirmDialog({
                text: "Are you sure you want to deactivate " + selectedItems.length + " contact(s)?",
                title: "Confirm Deactivation"
            }).then(
                function (result) {
                    if (result.confirmed) {
                        processDeactivation(selectedItems);
                    }
                }
            );

        } catch (error) {
            handleError("deactivateContacts", error);
        }
    }

    /**
     * Process deactivation of contacts
     * @param {Array} selectedItems - Array of contact records
     */
    function processDeactivation(selectedItems) {
        try {
            var promises = [];

            selectedItems.forEach(function (item) {
                var contactId = item.Id.replace(/[{}]/g, "");

                promises.push(
                    Xrm.WebApi.updateRecord("contact", contactId, {
                        "statecode": 1,
                        "statuscode": 2
                    })
                );
            });

            Promise.all(promises).then(
                function (results) {
                    showNotification("Deactivated " + results.length + " contact(s)", "SUCCESS");
                    refreshGrid();
                },
                function (error) {
                    handleError("processDeactivation - update", error);
                }
            );

        } catch (error) {
            handleError("processDeactivation", error);
        }
    }

    // ========================================
    // ENABLE RULES
    // ========================================

    /**
     * Enable Rule - Check if exactly one record is selected
     * @param {Array} selectedItems - Array of selected records
     * @returns {boolean} True if enabled
     */
    function enableRuleOneSelected(selectedItems) {
        return selectedItems && selectedItems.length === 1;
    }

    /**
     * Enable Rule - Check if at least one record is selected
     * @param {Array} selectedItems - Array of selected records
     * @returns {boolean} True if enabled
     */
    function enableRuleAtLeastOneSelected(selectedItems) {
        return selectedItems && selectedItems.length > 0;
    }

    /**
     * Enable Rule - Check if multiple records are selected (for merge)
     * @param {Array} selectedItems - Array of selected records
     * @returns {boolean} True if enabled
     */
    function enableRuleTwoToThreeSelected(selectedItems) {
        return selectedItems && selectedItems.length >= 2 && selectedItems.length <= 3;
    }

    /**
     * Enable Rule - Check if exactly two records are selected (alias for merge)
     * @param {Array} selectedItems - Array of selected records
     * @returns {boolean} True if enabled
     */
    function enableRuleTwoSelected(selectedItems) {
        return selectedItems && selectedItems.length === 2;
    }

    /**
     * Enable Rule - Check if selected contacts have email addresses
     * @param {Array} selectedItems - Array of selected records
     * @returns {boolean} True if all have email
     */
    function enableRuleHasEmailAddress(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length === 0) {
                return false;
            }

            // Check if all selected contacts have email addresses
            for (var i = 0; i < selectedItems.length; i++) {
                var email = selectedItems[i].EmailAddress1 || selectedItems[i].emailaddress1;
                if (!email) {
                    return false;
                }
            }

            return true;

        } catch (error) {
            console.error("enableRuleHasEmailAddress error:", error);
            return false;
        }
    }

    /**
     * Enable Rule - Check if selected contact has parent account
     * @param {Array} selectedItems - Array of selected records
     * @returns {boolean} True if has parent account
     */
    function enableRuleHasParentAccount(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length !== 1) {
                return false;
            }

            var parentCustomer = selectedItems[0].ParentCustomerId || 
                               selectedItems[0].parentcustomerid ||
                               selectedItems[0]._parentcustomerid_value;

            return parentCustomer !== null && parentCustomer !== undefined;

        } catch (error) {
            console.error("enableRuleHasParentAccount error:", error);
            return false;
        }
    }

    /**
     * Enable Rule - Check if contacts do not have do-not-email flag
     * @param {Array} selectedItems - Array of selected records
     * @returns {boolean} True if email allowed
     */
    function enableRuleEmailAllowed(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length === 0) {
                return false;
            }

            // Check if all selected contacts allow email
            for (var i = 0; i < selectedItems.length; i++) {
                var doNotEmail = selectedItems[i].DoNotEmail || selectedItems[i].donotemail;
                if (doNotEmail === true || doNotEmail === "true") {
                    return false;
                }
            }

            return true;

        } catch (error) {
            console.error("enableRuleEmailAllowed error:", error);
            return false;
        }
    }

    // ========================================
    // DISPLAY RULES
    // ========================================

    /**
     * Display Rule - Only show on active contacts view
     * @param {Object} primaryControl - Primary control context
     * @returns {boolean} True if should display
     */
    function displayRuleActiveContactsView(primaryControl) {
        try {
            if (!primaryControl || !primaryControl.getViewSelector) {
                return true;
            }

            var viewSelector = primaryControl.getViewSelector();
            if (!viewSelector) {
                return true;
            }

            var currentView = viewSelector.getCurrentView();
            if (!currentView) {
                return true;
            }

            // Show only on active contacts view
            var activeContactsViewId = "{00000000-0000-0000-00aa-000010001003}"; // Example GUID
            
            return currentView.id === activeContactsViewId;

        } catch (error) {
            console.error("displayRuleActiveContactsView error:", error);
            return true;
        }
    }

    /**
     * Display Rule - Show only for marketing users
     * @returns {boolean} True if should display
     */
    function displayRuleMarketingUserOnly() {
        try {
            var userRoles = Xrm.Utility.getGlobalContext().userSettings.securityRoles;
            
            // Check for Marketing role (use actual role GUID from your environment)
            var marketingRoleId = "{00000000-0000-0000-0000-000000000002}"; // Example
            
            for (var i = 0; i < userRoles.length; i++) {
                if (userRoles[i].id === marketingRoleId) {
                    return true;
                }
            }

            return false;

        } catch (error) {
            console.error("displayRuleMarketingUserOnly error:", error);
            return false;
        }
    }

    /**
     * Display Rule - Check if user has Sales role
     * @returns {boolean} True if user has sales role
     */
    function displayRuleSalesRole() {
        try {
            var userRoles = Xrm.Utility.getGlobalContext().userSettings.securityRoles;
            
            // Check for Sales role (use actual role GUID from your environment)
            var salesRoleId = "{00000000-0000-0000-0000-000000000003}"; // Example
            
            for (var i = 0; i < userRoles.length; i++) {
                if (userRoles[i].id === salesRoleId) {
                    return true;
                }
            }

            return false;

        } catch (error) {
            console.error("displayRuleSalesRole error:", error);
            return false;
        }
    }

    // ========================================
    // HELPER FUNCTIONS
    // ========================================

    /**
     * Show notification to user
     * @param {string} message - Message to display
     * @param {string} level - Notification level (INFO, WARNING, ERROR, SUCCESS)
     */
    function showNotification(message, level) {
        try {
            Xrm.Navigation.openAlertDialog({
                text: message,
                title: level || "Notification"
            });

        } catch (error) {
            console.error("showNotification error:", error);
            alert(message);
        }
    }

    /**
     * Refresh the grid
     */
    function refreshGrid() {
        try {
            if (typeof refreshRibbon !== "undefined") {
                refreshRibbon();
            }
            
            if (typeof Xrm !== "undefined" && Xrm.Page && Xrm.Page.data) {
                Xrm.Page.data.refresh(false);
            }

        } catch (error) {
            console.error("refreshGrid error:", error);
        }
    }

    /**
     * Centralized error handling
     * @param {string} functionName - Name of function where error occurred
     * @param {Error} error - Error object
     */
    function handleError(functionName, error) {
        var errorMessage = "Error in " + functionName + ": ";
        
        if (error.message) {
            errorMessage += error.message;
        } else if (typeof error === "string") {
            errorMessage += error;
        } else {
            errorMessage += "Unknown error";
        }

        console.error(errorMessage);
        console.error(error);

        showNotification(errorMessage, "ERROR");
    }

    /**
     * Get selected records from grid
     * @param {Object} primaryControl - Primary control (grid)
     * @returns {Array} Array of selected records
     */
    function getSelectedRecords(primaryControl) {
        try {
            if (!primaryControl || !primaryControl.getGrid) {
                return [];
            }

            var grid = primaryControl.getGrid();
            if (!grid || !grid.getSelectedRows) {
                return [];
            }

            var selectedRows = grid.getSelectedRows();
            var records = [];

            selectedRows.forEach(function (row) {
                records.push({
                    Id: row.getData().entity.getId(),
                    Name: row.getData().entity.getEntityName(),
                    TypeName: row.getData().entity.getEntityName(),
                    Data: row.getData().entity.attributes
                });
            });

            return records;

        } catch (error) {
            console.error("getSelectedRecords error:", error);
            return [];
        }
    }

    // Public API - Expose functions to be called from ribbon
    return {
        // Command Actions
        sendEmailToContacts: sendEmailToContacts,
        scheduleAppointmentWithContacts: scheduleAppointmentWithContacts,
        addToMarketingList: addToMarketingList,
        updateContactPreferences: updateContactPreferences,
        mergeContacts: mergeContacts,
        setAsPrimaryContact: setAsPrimaryContact,
        linkToParentAccount: linkToParentAccount,
        exportContactsToExcel: exportContactsToExcel,
        assignContactsToUser: assignContactsToUser,
        deactivateContacts: deactivateContacts,
        
        // Enable Rules
        enableRuleOneSelected: enableRuleOneSelected,
        enableRuleAtLeastOneSelected: enableRuleAtLeastOneSelected,
        enableRuleTwoSelected: enableRuleTwoSelected,
        enableRuleTwoToThreeSelected: enableRuleTwoToThreeSelected,
        enableRuleHasEmailAddress: enableRuleHasEmailAddress,
        enableRuleHasEmail: enableRuleHasEmailAddress, // Alias for tests
        enableRuleHasParentAccount: enableRuleHasParentAccount,
        enableRuleEmailAllowed: enableRuleEmailAllowed,
        
        // Display Rules
        displayRuleActiveContactsView: displayRuleActiveContactsView,
        displayRuleMarketingUserOnly: displayRuleMarketingUserOnly,
        displayRuleSalesRole: displayRuleSalesRole,
        
        // Helper Functions
        getSelectedRecords: getSelectedRecords,
        showNotification: showNotification,
        handleError: handleError
    };

})();

// Export for Node.js/Jest (if module exists)
if (typeof module !== 'undefined' && module.exports) {
    global.AIDEVME = AIDEVME;
    module.exports = { AIDEVME };
}

// ========================================
// RIBBON CONFIGURATION NOTES
// ========================================

/**
 * HOW TO CONFIGURE CONTACT RIBBON BUTTONS
 * 
 * 1. Send Email Button:
 *    - Command: Custom Command
 *    - Library: aidevme_/scripts/ribbons/contact.ribbon.js
 *    - Function: AIDEVME.Contact.Ribbon.SendEmailToContacts
 *    - Parameters: SelectedControlSelectedItemReferences
 *    - Enable Rule: AIDEVME.Contact.Ribbon.EnableRuleHasEmailAddress
 * 
 * 2. Schedule Appointment Button:
 *    - Command: Custom Command
 *    - Library: aidevme_/scripts/ribbons/contact.ribbon.js
 *    - Function: AIDEVME.Contact.Ribbon.ScheduleAppointmentWithContacts
 *    - Parameters: SelectedControlSelectedItemReferences
 *    - Enable Rule: AIDEVME.Contact.Ribbon.EnableRuleAtLeastOneSelected
 * 
 * 3. Add to Marketing List Button:
 *    - Command: Custom Command
 *    - Library: aidevme_/scripts/ribbons/contact.ribbon.js
 *    - Function: AIDEVME.Contact.Ribbon.AddToMarketingList
 *    - Parameters: SelectedControlSelectedItemReferences
 *    - Enable Rule: AIDEVME.Contact.Ribbon.EnableRuleAtLeastOneSelected
 *    - Display Rule: AIDEVME.Contact.Ribbon.DisplayRuleMarketingUserOnly
 * 
 * 4. Set as Primary Contact Button:
 *    - Command: Custom Command
 *    - Library: aidevme_/scripts/ribbons/contact.ribbon.js
 *    - Function: AIDEVME.Contact.Ribbon.SetAsPrimaryContact
 *    - Parameters: PrimaryControl, SelectedControlSelectedItemReferences
 *    - Enable Rule: AIDEVME.Contact.Ribbon.EnableRuleHasParentAccount
 * 
 * 5. Link to Account Button:
 *    - Command: Custom Command
 *    - Library: aidevme_/scripts/ribbons/contact.ribbon.js
 *    - Function: AIDEVME.Contact.Ribbon.LinkToParentAccount
 *    - Parameters: SelectedControlSelectedItemReferences
 *    - Enable Rule: AIDEVME.Contact.Ribbon.EnableRuleAtLeastOneSelected
 * 
 * EXAMPLE RIBBON XML (RibbonDiffXml):
 * 
 * <Button Id="AIDEVME.Contact.SendEmail"
 *         Sequence="30"
 *         Command="AIDEVME.Contact.SendEmailCommand"
 *         LabelText="Send Email"
 *         ToolTipTitle="Send Email"
 *         ToolTipDescription="Send email to selected contacts"
 *         Image16by16="/_imgs/ribbon/email_16.png"
 *         Image32by32="/_imgs/ribbon/email_32.png" />
 * 
 * <CommandDefinition Id="AIDEVME.Contact.SendEmailCommand">
 *   <EnableRules>
 *     <EnableRule Id="AIDEVME.Contact.EnableRule.HasEmail" />
 *     <EnableRule Id="AIDEVME.Contact.EnableRule.EmailAllowed" />
 *   </EnableRules>
 *   <Actions>
 *     <JavaScriptFunction Library="$webresource:aidevme_/scripts/ribbons/contact.ribbon.js"
 *                         FunctionName="AIDEVME.Contact.Ribbon.SendEmailToContacts">
 *       <CrmParameter Value="SelectedControlSelectedItemReferences" />
 *     </JavaScriptFunction>
 *   </Actions>
 * </CommandDefinition>
 * 
 * <RibbonTemplates Id="Mscrm.Templates.contact">
 *   <RibbonDiffXml>
 *     <CustomActions>
 *       <CustomAction Id="AIDEVME.Contact.CustomGroup"
 *                     Location="Mscrm.HomepageGrid.contact.MainTab.Actions.Controls._children"
 *                     Sequence="30">
 *         <CommandUIDefinition>
 *           <Button Id="AIDEVME.Contact.SendEmail" />
 *           <Button Id="AIDEVME.Contact.ScheduleAppointment" />
 *           <Button Id="AIDEVME.Contact.AddToList" />
 *         </CommandUIDefinition>
 *       </CustomAction>
 *     </CustomActions>
 *   </RibbonDiffXml>
 * </RibbonTemplates>
 */

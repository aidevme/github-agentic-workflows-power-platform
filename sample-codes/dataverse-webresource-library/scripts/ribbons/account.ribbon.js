/**
 * Account Ribbon JavaScript
 * Web Resource: aidevme_/scripts/ribbons/account.ribbon.js
 * 
 * Description: Custom ribbon commands for Account entity
 * Dependencies: None
 * 
 * @namespace AIDEVME.Account.Ribbon
 */

// Create namespace to avoid global scope pollution
var AIDEVME = AIDEVME || {};
AIDEVME.Account = AIDEVME.Account || {};

AIDEVME.Account.Ribbon = (function () {
    "use strict";

    /**
     * Validates that selected accounts meet credit requirements
     * Command Action - Called when "Approve Credit" button is clicked
     * @param {Array} selectedItems - Array of selected grid records
     */
    function approveCreditForAccounts(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length === 0) {
                showNotification("Please select at least one account", "WARNING");
                return;
            }

            var accountIds = [];
            var accountNames = [];

            // Extract IDs and names from selected items
            for (var i = 0; i < selectedItems.length; i++) {
                var record = selectedItems[i];
                accountIds.push(record.Id);
                accountNames.push(record.Name);
            }

            // Confirm action with user
            var confirmMessage = "Are you sure you want to approve credit for " + 
                                accountIds.length + " account(s)?\n\n" +
                                accountNames.join("\n");

            Xrm.Navigation.openConfirmDialog({ text: confirmMessage }).then(
                function (result) {
                    if (result.confirmed) {
                        // Process approval
                        processCreditApproval(accountIds);
                    }
                }
            );

        } catch (error) {
            handleError("approveCreditForAccounts", error);
        }
    }

    /**
     * Process credit approval for accounts
     * @param {Array} accountIds - Array of account GUIDs
     */
    function processCreditApproval(accountIds) {
        try {
            showNotification("Processing credit approval for " + accountIds.length + " account(s)...", "INFO");

            // Example: Call custom action or update records
            var promises = [];

            accountIds.forEach(function (accountId) {
                // Update account credit approval status
                var data = {
                    "creditonhold": false,
                    "statuscode": 1 // Active
                };

                var cleanId = accountId.replace(/[{}]/g, "");
                var updatePromise = Xrm.WebApi.updateRecord("account", cleanId, data);
                promises.push(updatePromise);
            });

            // Wait for all updates to complete
            Promise.all(promises).then(
                function (results) {
                    showNotification("Credit approved for " + results.length + " account(s)", "SUCCESS");
                    refreshGrid();
                },
                function (error) {
                    handleError("processCreditApproval - update records", error);
                }
            );

        } catch (error) {
            handleError("processCreditApproval", error);
        }
    }

    /**
     * Opens a custom dialog for account verification
     * Command Action - Called when "Verify Account" button is clicked
     * @param {Object} primaryControl - Primary control (form or grid)
     */
    function verifyAccount(primaryControl) {
        try {
            var entityReference = null;

            // Determine if called from form or grid
            if (primaryControl && primaryControl.getEntityName) {
                // Called from form
                entityReference = {
                    id: primaryControl.data.entity.getId().replace(/[{}]/g, ""),
                    name: primaryControl.getAttribute("name").getValue(),
                    entityType: "account"
                };
            }

            if (!entityReference) {
                showNotification("Unable to determine account context", "ERROR");
                return;
            }

            // Open custom page or dialog
            var pageInput = {
                pageType: "custom",
                name: "contoso_accountverification_page",
                entityName: "account",
                recordId: entityReference.id
            };

            var navigationOptions = {
                target: 2, // Dialog
                width: { value: 60, unit: "%" },
                height: { value: 60, unit: "%" },
                position: 1 // Center
            };

            Xrm.Navigation.navigateTo(pageInput, navigationOptions).then(
                function (result) {
                    console.log("Verification dialog closed");
                    // Refresh form if needed
                    if (primaryControl && primaryControl.data && primaryControl.data.refresh) {
                        primaryControl.data.refresh(false);
                    }
                },
                function (error) {
                    handleError("verifyAccount - navigate", error);
                }
            );

        } catch (error) {
            handleError("verifyAccount", error);
        }
    }

    /**
     * Exports selected accounts to Excel
     * Command Action - Called when "Export to Excel" button is clicked
     * @param {Array} selectedItems - Array of selected grid records
     */
    function exportAccountsToExcel(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length === 0) {
                showNotification("Please select accounts to export", "WARNING");
                return;
            }

            showNotification("Exporting " + selectedItems.length + " account(s) to Excel...", "INFO");

            // Build FetchXML query for selected accounts
            var accountIds = selectedItems.map(function (item) {
                return item.Id.replace(/[{}]/g, "");
            });

            var fetchXml = buildExportFetchXml(accountIds);

            // Use out-of-box export functionality
            // Note: This is a simplified example. Real implementation might use custom export logic
            console.log("Export FetchXML:", fetchXml);
            
            showNotification("Export initiated for " + accountIds.length + " account(s)", "SUCCESS");

        } catch (error) {
            handleError("exportAccountsToExcel", error);
        }
    }

    /**
     * Build FetchXML for export
     * @param {Array} accountIds - Array of account IDs
     * @returns {string} FetchXML query
     */
    function buildExportFetchXml(accountIds) {
        var conditions = accountIds.map(function (id) {
            return '<value>' + id + '</value>';
        }).join('');

        var fetchXml = 
            '<fetch>' +
            '  <entity name="account">' +
            '    <attribute name="name" />' +
            '    <attribute name="accountnumber" />' +
            '    <attribute name="emailaddress1" />' +
            '    <attribute name="telephone1" />' +
            '    <attribute name="revenue" />' +
            '    <attribute name="primarycontactid" />' +
            '    <filter type="or">' +
            conditions +
            '    </filter>' +
            '  </entity>' +
            '</fetch>';

        return fetchXml;
    }

    /**
     * Merges selected accounts
     * Command Action - Called when "Merge Accounts" button is clicked
     * @param {Array} selectedItems - Array of selected grid records
     */
    function mergeAccounts(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length < 2) {
                showNotification("Please select at least 2 accounts to merge", "WARNING");
                return;
            }

            if (selectedItems.length > 3) {
                showNotification("You can only merge up to 3 accounts at a time", "WARNING");
                return;
            }

            // Navigate to merge dialog
            var masterRecord = selectedItems[0];
            var subordinateRecords = selectedItems.slice(1);

            var pageInput = {
                pageType: "entityrecord",
                entityName: "account",
                entityId: masterRecord.Id.replace(/[{}]/g, ""),
                formId: null, // Use default form
                data: {
                    mergeRecords: subordinateRecords.map(function (item) {
                        return item.Id.replace(/[{}]/g, "");
                    })
                }
            };

            showNotification("Opening merge dialog for " + selectedItems.length + " accounts...", "INFO");
            
            // Note: Actual merge functionality requires custom implementation or built-in merge API
            console.log("Merge operation initiated for:", selectedItems);

        } catch (error) {
            handleError("mergeAccounts", error);
        }
    }

    /**
     * Sets accounts as inactive
     * Command Action - Called when "Deactivate" button is clicked
     * @param {Array} selectedItems - Array of selected grid records
     */
    function deactivateAccounts(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length === 0) {
                showNotification("Please select accounts to deactivate", "WARNING");
                return;
            }

            var accountNames = selectedItems.map(function (item) { return item.Name; });

            Xrm.Navigation.openConfirmDialog({
                text: "Are you sure you want to deactivate " + selectedItems.length + " account(s)?",
                title: "Confirm Deactivation"
            }).then(
                function (result) {
                    if (result.confirmed) {
                        processDeactivation(selectedItems);
                    }
                }
            );

        } catch (error) {
            handleError("deactivateAccounts", error);
        }
    }

    /**
     * Process deactivation of accounts
     * @param {Array} selectedItems - Array of selected records
     */
    function processDeactivation(selectedItems) {
        try {
            var promises = [];

            selectedItems.forEach(function (item) {
                var accountId = item.Id.replace(/[{}]/g, "");
                
                // Use SetState request to deactivate
                var setStateRequest = {
                    entity: {
                        entityType: "account",
                        id: accountId
                    },
                    state: 1, // Inactive
                    status: 2 // Inactive status code
                };

                // Execute request (simplified - actual implementation uses Xrm.WebApi.online.execute)
                promises.push(
                    Xrm.WebApi.updateRecord("account", accountId, {
                        "statecode": 1,
                        "statuscode": 2
                    })
                );
            });

            Promise.all(promises).then(
                function (results) {
                    showNotification("Deactivated " + results.length + " account(s)", "SUCCESS");
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
     * Enable Rule - Check if user has approve privilege
     * @returns {boolean} True if user can approve
     */
    function enableRuleCanApprove() {
        try {
            // Check user privileges (simplified example)
            var userRoles = Xrm.Utility.getGlobalContext().userSettings.securityRoles;
            
            // Example: Check if user has specific role
            // In production, use privilege checks or custom logic
            return userRoles && userRoles.length > 0;

        } catch (error) {
            console.error("enableRuleCanApprove error:", error);
            return false;
        }
    }

    /**
     * Enable Rule - Check if selected accounts have credit on hold
     * @param {Array} selectedItems - Array of selected records
     * @returns {boolean} True if any account has credit on hold
     */
    function enableRuleHasCreditOnHold(selectedItems) {
        try {
            if (!selectedItems || selectedItems.length === 0) {
                return false;
            }

            // Check if any selected account has creditonhold = true
            // Note: This requires the field to be in the grid
            return selectedItems.some(function (item) {
                return item.CreditOnHold === true || item.CreditOnHold === "true";
            });

        } catch (error) {
            console.error("enableRuleHasCreditOnHold error:", error);
            return false;
        }
    }

    // ========================================
    // DISPLAY RULES
    // ========================================

    /**
     * Display Rule - Only show on active accounts view
     * @param {Object} primaryControl - Primary control context
     * @returns {boolean} True if should display
     */
    function displayRuleActiveAccountsView(primaryControl) {
        try {
            if (!primaryControl || !primaryControl.getViewSelector) {
                return true; // Default to visible if cannot determine
            }

            var viewSelector = primaryControl.getViewSelector();
            if (!viewSelector) {
                return true;
            }

            var currentView = viewSelector.getCurrentView();
            if (!currentView) {
                return true;
            }

            // Show only on active accounts view
            // Replace with actual view GUID from your environment
            var activeAccountsViewId = "{00000000-0000-0000-00aa-000010001004}"; // Example GUID
            
            return currentView.id === activeAccountsViewId;

        } catch (error) {
            console.error("displayRuleActiveAccountsView error:", error);
            return true;
        }
    }

    /**
     * Display Rule - Show button only if user is in specific role
     * @returns {boolean} True if should display
     */
    function displayRuleManagerOnly() {
        try {
            var userRoles = Xrm.Utility.getGlobalContext().userSettings.securityRoles;
            
            // Example: Check for System Administrator or custom role
            // In production, check specific role GUIDs
            var systemAdminRoleId = "{00000000-0000-0000-0000-000000000001}"; // Example

            return userRoles.some(function (role) {
                return role.id === systemAdminRoleId;
            });

        } catch (error) {
            console.error("displayRuleManagerOnly error:", error);
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
            alert(message); // Fallback
        }
    }

    /**
     * Refresh the grid
     */
    function refreshGrid() {
        try {
            // Refresh the grid/form
            if (typeof refreshRibbon !== "undefined") {
                refreshRibbon();
            }
            
            // Alternatively, refresh using Xrm.Page (legacy) or formContext
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
        ApproveCreditForAccounts: approveCreditForAccounts,
        VerifyAccount: verifyAccount,
        ExportAccountsToExcel: exportAccountsToExcel,
        MergeAccounts: mergeAccounts,
        DeactivateAccounts: deactivateAccounts,
        
        // Enable Rules
        EnableRuleOneSelected: enableRuleOneSelected,
        EnableRuleAtLeastOneSelected: enableRuleAtLeastOneSelected,
        EnableRuleTwoToThreeSelected: enableRuleTwoToThreeSelected,
        EnableRuleCanApprove: enableRuleCanApprove,
        EnableRuleHasCreditOnHold: enableRuleHasCreditOnHold,
        
        // Display Rules
        DisplayRuleActiveAccountsView: displayRuleActiveAccountsView,
        DisplayRuleManagerOnly: displayRuleManagerOnly,
        
        // Helper Functions
        GetSelectedRecords: getSelectedRecords
    };

})();

// ========================================
// RIBBON CONFIGURATION NOTES
// ========================================

/**
 * HOW TO CONFIGURE RIBBON BUTTONS
 * 
 * 1. Create Custom Button in Ribbon Workbench or Solution:
 *    - Button Label: "Approve Credit"
 *    - Command: Custom Command
 *    - Library: aidevme_/scripts/ribbons/account.ribbon.js
 *    - Function: AIDEVME.Account.Ribbon.ApproveCreditForAccounts
 *    - Parameters: SelectedControlSelectedItemReferences
 * 
 * 2. Add Enable Rule:
 *    - Library: aidevme_/scripts/ribbons/account.ribbon.js
 *    - Function: AIDEVME.Account.Ribbon.EnableRuleAtLeastOneSelected
 *    - Parameters: SelectedControlSelectedItemReferences
 *    - Rule Type: Custom Rule
 *    - Default: false
 * 
 * 3. Add Display Rule (Optional):
 *    - Library: aidevme_/scripts/ribbons/account.ribbon.js
 *    - Function: AIDEVME.Account.Ribbon.DisplayRuleManagerOnly
 *    - Parameters: PrimaryControl (if needed)
 *    - Rule Type: Custom Rule
 *    - Default: false
 * 
 * COMMON PARAMETERS TO PASS:
 * - SelectedControlSelectedItemReferences: Array of selected records
 * - PrimaryControl: Form/Grid control object
 * - FirstSelectedItemId: ID of first selected record
 * - SelectedEntityTypeName: Entity type name
 * 
 * EXAMPLE RIBBON XML (RibbonDiffXml):
 * 
 * <Button Id="AIDEVME.Account.ApproveCreditButton"
 *         Sequence="30"
 *         Command="AIDEVME.Account.ApproveCredit"
 *         LabelText="Approve Credit"
 *         ToolTipTitle="Approve Credit"
 *         ToolTipDescription="Approve credit for selected accounts"
 *         Image16by16="/_imgs/ribbon/approve_16.png"
 *         Image32by32="/_imgs/ribbon/approve_32.png" />
 * 
 * <CommandDefinition Id="AIDEVME.Account.ApproveCredit">
 *   <EnableRules>
 *     <EnableRule Id="AIDEVME.Account.EnableRule.AtLeastOne" />
 *   </EnableRules>
 *   <DisplayRules>
 *     <EnableRule Id="AIDEVME.Account.DisplayRule.Manager" />
 *   </DisplayRules>
 *   <Actions>
 *     <JavaScriptFunction Library="$webresource:aidevme_/scripts/ribbons/account.ribbon.js"
 *                         FunctionName="AIDEVME.Account.Ribbon.ApproveCreditForAccounts">
 *       <CrmParameter Value="SelectedControlSelectedItemReferences" />
 *     </JavaScriptFunction>
 *   </Actions>
 * </CommandDefinition>
 */

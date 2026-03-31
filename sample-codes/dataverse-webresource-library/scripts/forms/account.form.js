/**
 * Account Form JavaScript
 * Web Resource: aidevme_/scripts/forms/account.form.js
 * 
 * Description: Form scripting for Account entity
 * Dependencies: None
 * 
 * @namespace AIDEVME.Account.Form
 */

// Create namespace to avoid global scope pollution
var AIDEVME = AIDEVME || {};
AIDEVME.Account = AIDEVME.Account || {};

AIDEVME.Account.Form = (function () {
    "use strict";

    // Private variables
    var formContext = null;

    /**
     * OnLoad Event Handler
     * Called when the form loads
     * @param {Object} executionContext - The execution context
     */
    function onLoad(executionContext) {
        try {
            // Get form context from execution context
            formContext = executionContext.getFormContext();

            // Log form load for debugging
            console.log("Account form loaded successfully");

            // Initialize form based on form type
            var formType = formContext.ui.getFormType();
            
            switch (formType) {
                case 1: // Create
                    handleFormCreate();
                    break;
                case 2: // Update
                    handleFormUpdate();
                    break;
                case 3: // Read Only
                    handleFormReadOnly();
                    break;
                case 4: // Disabled
                    handleFormDisabled();
                    break;
                default:
                    console.warn("Unknown form type: " + formType);
            }

            // Set up field event handlers
            registerFieldEventHandlers();

            // Set up business rules
            applyBusinessRules();

            // Configure form UI
            configureFormUI();

        } catch (error) {
            handleError("onLoad", error);
        }
    }

    /**
     * Handle form in Create mode
     */
    function handleFormCreate() {
        console.log("Form mode: Create");

        // Set default values for new records
        setDefaultValues();

        // Set required fields for create
        setRequiredFields(true);
    }

    /**
     * Handle form in Update mode
     */
    function handleFormUpdate() {
        console.log("Form mode: Update");

        // Validate existing data
        validateExistingData();

        // Apply conditional logic based on existing values
        applyConditionalLogic();
    }

    /**
     * Handle form in Read Only mode
     */
    function handleFormReadOnly() {
        console.log("Form mode: Read Only");
        // Additional read-only specific logic can go here
    }

    /**
     * Handle form in Disabled mode
     */
    function handleFormDisabled() {
        console.log("Form mode: Disabled");
        // Additional disabled-specific logic can go here
    }

    /**
     * Set default values for new account records
     */
    function setDefaultValues() {
        try {
            // Example: Set default account category
            var categoryField = formContext.getAttribute("accountcategorycode");
            if (categoryField && !categoryField.getValue()) {
                categoryField.setValue(1); // Preferred Customer
            }

            // Example: Set default rating
            var ratingField = formContext.getAttribute("accountratingcode");
            if (ratingField && !ratingField.getValue()) {
                ratingField.setValue(2); // Default
            }

            // Example: Set default preferred contact method
            var contactMethodField = formContext.getAttribute("preferredcontactmethodcode");
            if (contactMethodField && !contactMethodField.getValue()) {
                contactMethodField.setValue(2); // Email
            }

        } catch (error) {
            handleError("setDefaultValues", error);
        }
    }

    /**
     * Register event handlers for form fields
     */
    function registerFieldEventHandlers() {
        try {
            // Account Name - onChange
            var nameField = formContext.getAttribute("name");
            if (nameField) {
                nameField.addOnChange(onAccountNameChange);
            }

            // Primary Contact - onChange
            var primaryContactField = formContext.getAttribute("primarycontactid");
            if (primaryContactField) {
                primaryContactField.addOnChange(onPrimaryContactChange);
            }

            // Revenue - onChange
            var revenueField = formContext.getAttribute("revenue");
            if (revenueField) {
                revenueField.addOnChange(onRevenueChange);
            }

            // Phone Number - onChange
            var phoneField = formContext.getAttribute("telephone1");
            if (phoneField) {
                phoneField.addOnChange(onPhoneNumberChange);
            }

            // Email - onChange
            var emailField = formContext.getAttribute("emailaddress1");
            if (emailField) {
                emailField.addOnChange(onEmailAddressChange);
            }

        } catch (error) {
            handleError("registerFieldEventHandlers", error);
        }
    }

    /**
     * Account Name onChange event handler
     */
    function onAccountNameChange() {
        try {
            var nameField = formContext.getAttribute("name");
            var nameValue = nameField.getValue();

            if (nameValue) {
                // Example: Validate name doesn't contain special characters
                var specialChars = /[<>\"']/;
                if (specialChars.test(nameValue)) {
                    formContext.ui.setFormNotification(
                        "Account name contains invalid characters",
                        "WARNING",
                        "accountname_warning"
                    );
                } else {
                    formContext.ui.clearFormNotification("accountname_warning");
                }
            }

        } catch (error) {
            handleError("onAccountNameChange", error);
        }
    }

    /**
     * Primary Contact onChange event handler
     */
    function onPrimaryContactChange() {
        try {
            var primaryContactField = formContext.getAttribute("primarycontactid");
            var contactValue = primaryContactField.getValue();

            if (contactValue && contactValue.length > 0) {
                var contactId = contactValue[0].id;
                var contactName = contactValue[0].name;

                console.log("Primary contact selected: " + contactName);

                // Example: Auto-populate contact details (would typically use Web API)
                // This is a placeholder for demonstration
                formContext.ui.setFormNotification(
                    "Primary contact set to: " + contactName,
                    "INFO",
                    "primarycontact_info"
                );

                // Auto-clear notification after 5 seconds
                setTimeout(function () {
                    formContext.ui.clearFormNotification("primarycontact_info");
                }, 5000);
            }

        } catch (error) {
            handleError("onPrimaryContactChange", error);
        }
    }

    /**
     * Revenue onChange event handler
     */
    function onRevenueChange() {
        try {
            var revenueField = formContext.getAttribute("revenue");
            var revenueValue = revenueField.getValue();

            if (revenueValue) {
                // Example: Set account rating based on revenue
                var ratingField = formContext.getAttribute("accountratingcode");
                
                if (ratingField) {
                    if (revenueValue >= 1000000) {
                        ratingField.setValue(1); // Hot
                    } else if (revenueValue >= 500000) {
                        ratingField.setValue(2); // Warm
                    } else {
                        ratingField.setValue(3); // Cold
                    }
                }

                // Show notification for high-value accounts
                if (revenueValue >= 1000000) {
                    formContext.ui.setFormNotification(
                        "This is a high-value account (revenue >= $1M)",
                        "INFO",
                        "highvalue_notification"
                    );
                } else {
                    formContext.ui.clearFormNotification("highvalue_notification");
                }
            }

        } catch (error) {
            handleError("onRevenueChange", error);
        }
    }

    /**
     * Phone Number onChange event handler
     */
    function onPhoneNumberChange() {
        try {
            var phoneField = formContext.getAttribute("telephone1");
            var phoneValue = phoneField.getValue();

            if (phoneValue) {
                // Basic phone number validation (US format)
                var phonePattern = /^[\d\s\-\(\)\+]+$/;
                
                if (!phonePattern.test(phoneValue)) {
                    formContext.getControl("telephone1").setNotification(
                        "Please enter a valid phone number",
                        "phone_validation"
                    );
                } else {
                    formContext.getControl("telephone1").clearNotification("phone_validation");
                }
            }

        } catch (error) {
            handleError("onPhoneNumberChange", error);
        }
    }

    /**
     * Email Address onChange event handler
     */
    function onEmailAddressChange() {
        try {
            var emailField = formContext.getAttribute("emailaddress1");
            var emailValue = emailField.getValue();

            if (emailValue) {
                // Email validation
                var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                
                if (!emailPattern.test(emailValue)) {
                    formContext.getControl("emailaddress1").setNotification(
                        "Please enter a valid email address",
                        "email_validation"
                    );
                } else {
                    formContext.getControl("emailaddress1").clearNotification("email_validation");
                }
            }

        } catch (error) {
            handleError("onEmailAddressChange", error);
        }
    }

    /**
     * Apply business rules and conditional logic
     */
    function applyBusinessRules() {
        try {
            // Example: Make fields required based on account type
            var accountTypeField = formContext.getAttribute("customertypecode");
            
            if (accountTypeField) {
                var accountType = accountTypeField.getValue();
                
                // If customer is a competitor, require specific fields
                if (accountType === 1) { // Competitor
                    setFieldRequirement("websiteurl", true);
                    setFieldRequirement("numberofemployees", true);
                }
            }

            // Example: Industry-specific validation
            var industryField = formContext.getAttribute("industrycode");
            if (industryField) {
                var industry = industryField.getValue();
                
                // Financial services requires additional compliance
                if (industry === 3) { // Financial Services
                    showTab("compliance_tab", true);
                    setFieldRequirement("sic", true);
                }
            }

        } catch (error) {
            handleError("applyBusinessRules", error);
        }
    }

    /**
     * Apply conditional logic based on form data
     */
    function applyConditionalLogic() {
        try {
            // Example: Show/hide sections based on data
            var revenueField = formContext.getAttribute("revenue");
            
            if (revenueField && revenueField.getValue() > 1000000) {
                // Show enterprise customer section
                showSection("enterprise_section", true);
            }

            // Example: Disable fields if account is inactive
            var statusField = formContext.getAttribute("statecode");
            if (statusField && statusField.getValue() === 1) { // Inactive
                disableAllFields();
            }

        } catch (error) {
            handleError("applyConditionalLogic", error);
        }
    }

    /**
     * Configure form UI elements
     */
    function configureFormUI() {
        try {
            // Example: Hide empty tabs
            hideEmptyTabs();

            // Example: Set custom form title
            var nameField = formContext.getAttribute("name");
            if (nameField && nameField.getValue()) {
                // Custom logic can go here
            }

            // Example: Configure quick view controls
            refreshQuickViewControls();

        } catch (error) {
            handleError("configureFormUI", error);
        }
    }

    /**
     * Validate existing data on form load
     */
    function validateExistingData() {
        try {
            var hasErrors = false;

            // Example: Validate required business data
            var nameField = formContext.getAttribute("name");
            var phoneField = formContext.getAttribute("telephone1");
            var emailField = formContext.getAttribute("emailaddress1");

            if (!nameField.getValue()) {
                hasErrors = true;
            }

            if (!phoneField.getValue() && !emailField.getValue()) {
                formContext.ui.setFormNotification(
                    "Please provide either a phone number or email address",
                    "WARNING",
                    "contact_warning"
                );
            }

        } catch (error) {
            handleError("validateExistingData", error);
        }
    }

    /**
     * Set field requirement level
     * @param {string} fieldName - The logical name of the field
     * @param {boolean} isRequired - Whether the field should be required
     */
    function setFieldRequirement(fieldName, isRequired) {
        try {
            var field = formContext.getAttribute(fieldName);
            if (field) {
                field.setRequiredLevel(isRequired ? "required" : "none");
            }
        } catch (error) {
            handleError("setFieldRequirement", error);
        }
    }

    /**
     * Set required fields for the form
     * @param {boolean} isCreate - Whether this is a create form
     */
    function setRequiredFields(isCreate) {
        try {
            // Always required
            setFieldRequirement("name", true);

            // Required on create
            if (isCreate) {
                setFieldRequirement("telephone1", true);
            }

        } catch (error) {
            handleError("setRequiredFields", error);
        }
    }

    /**
     * Show or hide a tab
     * @param {string} tabName - The name of the tab
     * @param {boolean} visible - Whether to show the tab
     */
    function showTab(tabName, visible) {
        try {
            var tab = formContext.ui.tabs.get(tabName);
            if (tab) {
                tab.setVisible(visible);
            }
        } catch (error) {
            handleError("showTab", error);
        }
    }

    /**
     * Show or hide a section
     * @param {string} sectionName - The name of the section
     * @param {boolean} visible - Whether to show the section
     */
    function showSection(sectionName, visible) {
        try {
            var control = formContext.ui.controls.get(sectionName);
            if (control) {
                control.setVisible(visible);
            }
        } catch (error) {
            handleError("showSection", error);
        }
    }

    /**
     * Disable all form fields
     */
    function disableAllFields() {
        try {
            formContext.data.entity.attributes.forEach(function (attribute) {
                var control = formContext.getControl(attribute.getName());
                if (control) {
                    control.setDisabled(true);
                }
            });
        } catch (error) {
            handleError("disableAllFields", error);
        }
    }

    /**
     * Hide empty tabs on the form
     */
    function hideEmptyTabs() {
        try {
            formContext.ui.tabs.forEach(function (tab) {
                var hasVisibleSections = false;
                
                tab.sections.forEach(function (section) {
                    if (section.getVisible()) {
                        hasVisibleSections = true;
                    }
                });

                if (!hasVisibleSections) {
                    tab.setVisible(false);
                }
            });
        } catch (error) {
            handleError("hideEmptyTabs", error);
        }
    }

    /**
     * Refresh all quick view controls
     */
    function refreshQuickViewControls() {
        try {
            formContext.ui.quickForms.forEach(function (quickForm) {
                quickForm.refresh();
            });
        } catch (error) {
            handleError("refreshQuickViewControls", error);
        }
    }

    /**
     * OnSave Event Handler
     * Called before the form is saved
     * @param {Object} executionContext - The execution context
     */
    function onSave(executionContext) {
        try {
            formContext = executionContext.getFormContext();
            var eventArgs = executionContext.getEventArgs();

            // Validate required business logic before save
            if (!validateBeforeSave()) {
                eventArgs.preventDefault(); // Cancel the save
                return;
            }

            // Show save notification
            console.log("Account form saving...");

        } catch (error) {
            handleError("onSave", error);
            executionContext.getEventArgs().preventDefault();
        }
    }

    /**
     * Validate form data before save
     * @returns {boolean} True if validation passes
     */
    function validateBeforeSave() {
        try {
            var isValid = true;

            // Example: Ensure at least one contact method exists
            var phone = formContext.getAttribute("telephone1").getValue();
            var email = formContext.getAttribute("emailaddress1").getValue();
            var website = formContext.getAttribute("websiteurl").getValue();

            if (!phone && !email && !website) {
                formContext.ui.setFormNotification(
                    "Please provide at least one contact method (phone, email, or website)",
                    "ERROR",
                    "save_validation"
                );
                isValid = false;
            }

            // Example: Validate revenue is not negative
            var revenue = formContext.getAttribute("revenue").getValue();
            if (revenue && revenue < 0) {
                formContext.ui.setFormNotification(
                    "Revenue cannot be negative",
                    "ERROR",
                    "revenue_validation"
                );
                isValid = false;
            }

            return isValid;

        } catch (error) {
            handleError("validateBeforeSave", error);
            return false;
        }
    }

    /**
     * Centralized error handling
     * @param {string} functionName - The name of the function where error occurred
     * @param {Error} error - The error object
     */
    function handleError(functionName, error) {
        var errorMessage = "Error in " + functionName + ": " + error.message;
        console.error(errorMessage);
        console.error(error.stack);

        // Show user-friendly error notification
        if (formContext && formContext.ui) {
            formContext.ui.setFormNotification(
                "An error occurred. Please contact your system administrator.",
                "ERROR",
                "global_error"
            );
        }
    }

    // Public API - expose only necessary functions
    return {
        OnLoad: onLoad,
        OnSave: onSave,
        // Expose for testing/debugging if needed
        OnAccountNameChange: onAccountNameChange,
        OnPrimaryContactChange: onPrimaryContactChange,
        OnRevenueChange: onRevenueChange
    };

})();

// Event handler registration for form events
// These should be registered in the form properties in Dynamics 365

/**
 * Form OnLoad Handler
 * Register this function in form properties: AIDEVME.Account.Form.OnLoad
 */

/**
 * Form OnSave Handler  
 * Register this function in form properties: AIDEVME.Account.Form.OnSave
 */

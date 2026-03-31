/**
 * Contact Form JavaScript
 * Web Resource: aidevme_/scripts/forms/contact.form.js
 * 
 * Description: Form scripting for Contact entity
 * Dependencies: None
 * 
 * @namespace AIDEVME.Contact.Form
 */

// Create namespace to avoid global scope pollution
var AIDEVME = AIDEVME || {};
AIDEVME.Contact = AIDEVME.Contact || {};

AIDEVME.Contact.Form = (function () {
    "use strict";

    // Private variables
    var formContext = null;

    // Shared validation patterns
    var EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var PHONE_PATTERN = /^[\d\s\-\(\)\+]+$/;

    /**
     * OnLoad Event Handler
     * Called when the form loads
     * @param {Object} executionContext - The execution context
     */
    function onLoad(executionContext) {
        try {
            // Defensive null check
            if (!executionContext) {
                console.error("executionContext not passed - ensure 'Pass execution context' is enabled in form event registration.");
                return;
            }

            // Get form context from execution context
            formContext = executionContext.getFormContext();

            // Log form load for debugging
            console.log("Contact form loaded successfully");

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

        // Hide advanced details until record is created
        showTab("details_tab", false);
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

        // Show all tabs on update
        showTab("details_tab", true);
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
     * Set default values for new contact records
     */
    function setDefaultValues() {
        try {
            // Set default preferred contact method to email
            var preferredMethodField = formContext.getAttribute("preferredcontactmethodcode");
            if (preferredMethodField && !preferredMethodField.getValue()) {
                preferredMethodField.setValue(2); // Email
            }

            // Set default email allow to true
            var doNotEmailField = formContext.getAttribute("donotemail");
            if (doNotEmailField && doNotEmailField.getValue() === null) {
                doNotEmailField.setValue(false);
            }

            // Set default phone allow to true
            var doNotPhoneField = formContext.getAttribute("donotphone");
            if (doNotPhoneField && doNotPhoneField.getValue() === null) {
                doNotPhoneField.setValue(false);
            }

            // Set default contact category
            var categoryField = formContext.getAttribute("customertypecode");
            if (categoryField && !categoryField.getValue()) {
                categoryField.setValue(1); // Default
            }

            // Set default address type to primary
            var address1TypeField = formContext.getAttribute("address1_addresstypecode");
            if (address1TypeField && !address1TypeField.getValue()) {
                address1TypeField.setValue(1); // Primary
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
            function addHandler(fieldName, handler) {
                var field = formContext.getAttribute(fieldName);
                if (field) { field.addOnChange(handler); }
            }

            addHandler("emailaddress1", onEmailAddressChange);
            addHandler("mobilephone", onMobilePhoneChange);
            addHandler("telephone1", onBusinessPhoneChange);
            addHandler("parentcustomerid", onParentCustomerChange);
            addHandler("jobtitle", onJobTitleChange);
            addHandler("birthdate", onBirthdateChange);
            addHandler("donotemail", onDoNotEmailChange);
            addHandler("firstname", onNameChange);
            addHandler("lastname", onNameChange);

        } catch (error) {
            handleError("registerFieldEventHandlers", error);
        }
    }

    /**
     * Validates a phone field and sets/clears its control notification
     * @param {string} fieldName - Logical name of the phone field
     * @param {string} notificationId - Unique ID for the notification
     */
    function validatePhoneField(fieldName, notificationId) {
        var value = formContext.getAttribute(fieldName).getValue();
        var control = formContext.getControl(fieldName);
        if (value && !PHONE_PATTERN.test(value)) {
            control.setNotification("Please enter a valid phone number", notificationId);
        } else {
            control.clearNotification(notificationId);
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
                // Validate email format
                if (!EMAIL_PATTERN.test(emailValue)) {
                    formContext.getControl("emailaddress1").setNotification(
                        "Please enter a valid email address",
                        "email_validation"
                    );
                } else {
                    formContext.getControl("emailaddress1").clearNotification("email_validation");
                }

                // Auto-set preferred contact method to email if not set
                var preferredMethodField = formContext.getAttribute("preferredcontactmethodcode");
                if (preferredMethodField && !preferredMethodField.getValue()) {
                    preferredMethodField.setValue(2); // Email
                }
            }

        } catch (error) {
            handleError("onEmailAddressChange", error);
        }
    }

    /**
     * Mobile Phone onChange event handler
     */
    function onMobilePhoneChange() {
        try {
            validatePhoneField("mobilephone", "mobile_validation");

            // Auto-set preferred contact method to phone if not set and no email
            var phoneValue = formContext.getAttribute("mobilephone").getValue();
            if (phoneValue) {
                var preferredMethodField = formContext.getAttribute("preferredcontactmethodcode");
                var emailField = formContext.getAttribute("emailaddress1");

                if (preferredMethodField && !preferredMethodField.getValue() && !emailField.getValue()) {
                    preferredMethodField.setValue(3); // Phone
                }
            }

        } catch (error) {
            handleError("onMobilePhoneChange", error);
        }
    }

    /**
     * Business Phone onChange event handler
     */
    function onBusinessPhoneChange() {
        try {
            validatePhoneField("telephone1", "phone_validation");
        } catch (error) {
            handleError("onBusinessPhoneChange", error);
        }
    }

    /**
     * Parent Customer onChange event handler
     */
    function onParentCustomerChange() {
        try {
            var parentCustomerField = formContext.getAttribute("parentcustomerid");
            var customerValue = parentCustomerField.getValue();

            if (customerValue && customerValue.length > 0) {
                var customerId = customerValue[0].id;
                var customerName = customerValue[0].name;
                var entityType = customerValue[0].entityType;

                console.log("Parent customer selected: " + customerName + " (" + entityType + ")");

                // Show notification
                formContext.ui.setFormNotification(
                    "Parent customer set to: " + customerName,
                    "INFO",
                    "parentcustomer_info"
                );

                // Auto-clear notification after 5 seconds
                setTimeout(function () {
                    formContext.ui.clearFormNotification("parentcustomer_info");
                }, 5000);

                // If parent is an account, could auto-populate related data
                if (entityType === "account") {
                    // Example: Could fetch account details via Web API
                    console.log("Parent is an account - could sync address/phone details");
                }
            } else {
                formContext.ui.clearFormNotification("parentcustomer_info");
            }

        } catch (error) {
            handleError("onParentCustomerChange", error);
        }
    }

    /**
     * Job Title onChange event handler
     */
    function onJobTitleChange() {
        try {
            var jobTitleField = formContext.getAttribute("jobtitle");
            var jobTitle = jobTitleField.getValue();

            if (jobTitle) {
                // Auto-categorize based on job title keywords
                var title = jobTitle.toLowerCase();
                var roleField = formContext.getAttribute("accountrolecode");

                if (roleField && !roleField.getValue()) {
                    if (title.includes("ceo") || title.includes("president") || title.includes("owner")) {
                        roleField.setValue(1); // Decision Maker
                    } else if (title.includes("manager") || title.includes("director")) {
                        roleField.setValue(2); // Employee
                    } else if (title.includes("vp") || title.includes("vice president")) {
                        roleField.setValue(1); // Decision Maker
                    }
                }

                console.log("Job title updated: " + jobTitle);
            }

        } catch (error) {
            handleError("onJobTitleChange", error);
        }
    }

    /**
     * Birthdate onChange event handler
     */
    function onBirthdateChange() {
        try {
            var birthdateField = formContext.getAttribute("birthdate");
            var birthdate = birthdateField.getValue();

            if (birthdate) {
                // Calculate age
                var today = new Date();
                var age = today.getFullYear() - birthdate.getFullYear();
                var monthDiff = today.getMonth() - birthdate.getMonth();
                
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdate.getDate())) {
                    age--;
                }

                // Validate reasonable age
                if (age < 0) {
                    formContext.getControl("birthdate").setNotification(
                        "Birthdate cannot be in the future",
                        "birthdate_validation"
                    );
                } else if (age > 120) {
                    formContext.getControl("birthdate").setNotification(
                        "Please verify the birthdate",
                        "birthdate_validation"
                    );
                } else {
                    formContext.getControl("birthdate").clearNotification("birthdate_validation");
                    console.log("Contact age: " + age);
                }

                // Check if birthday is coming up (within 30 days)
                var nextBirthday = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate());
                if (nextBirthday < today) {
                    nextBirthday.setFullYear(today.getFullYear() + 1);
                }
                
                var daysUntilBirthday = Math.ceil((nextBirthday - today) / (1000 * 60 * 60 * 24));
                
                if (daysUntilBirthday <= 30) {
                    formContext.ui.setFormNotification(
                        "Birthday coming up in " + daysUntilBirthday + " days!",
                        "INFO",
                        "birthday_reminder"
                    );
                } else {
                    formContext.ui.clearFormNotification("birthday_reminder");
                }
            }

        } catch (error) {
            handleError("onBirthdateChange", error);
        }
    }

    /**
     * Do Not Email onChange event handler
     */
    function onDoNotEmailChange() {
        try {
            var doNotEmailField = formContext.getAttribute("donotemail");
            var doNotEmail = doNotEmailField.getValue();

            if (doNotEmail) {
                // If user opts out of email, change preferred method
                var preferredMethodField = formContext.getAttribute("preferredcontactmethodcode");
                if (preferredMethodField && preferredMethodField.getValue() === 2) {
                    // Change from email to phone
                    preferredMethodField.setValue(3);
                    
                    formContext.ui.setFormNotification(
                        "Preferred contact method changed from Email to Phone",
                        "INFO",
                        "contact_method_change"
                    );

                    setTimeout(function () {
                        formContext.ui.clearFormNotification("contact_method_change");
                    }, 5000);
                }
            }

        } catch (error) {
            handleError("onDoNotEmailChange", error);
        }
    }

    /**
     * Name onChange event handler (for first/last name)
     */
    function onNameChange() {
        try {
            var firstNameField = formContext.getAttribute("firstname");
            var lastNameField = formContext.getAttribute("lastname");

            var firstName = firstNameField ? firstNameField.getValue() : "";
            var lastName = lastNameField ? lastNameField.getValue() : "";

            // Validate that name doesn't contain numbers or special characters
            var namePattern = /^[a-zA-Z\s\-'\.]+$/;

            if (firstName && !namePattern.test(firstName)) {
                formContext.getControl("firstname").setNotification(
                    "First name contains invalid characters",
                    "firstname_validation"
                );
            } else {
                formContext.getControl("firstname").clearNotification("firstname_validation");
            }

            if (lastName && !namePattern.test(lastName)) {
                formContext.getControl("lastname").setNotification(
                    "Last name contains invalid characters",
                    "lastname_validation"
                );
            } else {
                formContext.getControl("lastname").clearNotification("lastname_validation");
            }

        } catch (error) {
            handleError("onNameChange", error);
        }
    }

    /**
     * Apply business rules
     */
    function applyBusinessRules() {
        try {
            // Example: Make email required if "Do Not Phone" is checked
            var doNotPhoneField = formContext.getAttribute("donotphone");
            var emailField = formContext.getAttribute("emailaddress1");

            if (doNotPhoneField && doNotPhoneField.getValue() === true) {
                if (emailField) {
                    emailField.setRequiredLevel("required");
                }
            }

            // Example: Validate at least one contact method is available
            validateContactMethods();

        } catch (error) {
            handleError("applyBusinessRules", error);
        }
    }

    /**
     * Ensure at least one contact method is provided and allowed
     */
    function validateContactMethods() {
        try {
            var doNotEmail = formContext.getAttribute("donotemail").getValue();
            var doNotPhone = formContext.getAttribute("donotphone").getValue();
            var doNotMail = formContext.getAttribute("donotbulkemail").getValue();

            var hasEmail = formContext.getAttribute("emailaddress1").getValue();
            var hasPhone = formContext.getAttribute("telephone1").getValue() || 
                          formContext.getAttribute("mobilephone").getValue();

            if (doNotEmail && doNotPhone && doNotMail) {
                formContext.ui.setFormNotification(
                    "Warning: All contact methods are opted out. This contact cannot be reached.",
                    "WARNING",
                    "no_contact_methods"
                );
            } else {
                formContext.ui.clearFormNotification("no_contact_methods");
            }

            if (!hasEmail && !hasPhone) {
                formContext.ui.setFormNotification(
                    "Please provide at least one contact method (email or phone)",
                    "WARNING",
                    "missing_contact_info"
                );
            } else {
                formContext.ui.clearFormNotification("missing_contact_info");
            }

        } catch (error) {
            handleError("validateContactMethods", error);
        }
    }

    /**
     * Configure form UI elements
     */
    function configureFormUI() {
        try {
            // Example: Show/hide sections based on data
            var parentCustomerField = formContext.getAttribute("parentcustomerid");
            if (parentCustomerField && parentCustomerField.getValue()) {
                // Show related account information section if parent is set
                var relatedInfoSection = formContext.ui.tabs.get("summary_tab");
                if (relatedInfoSection) {
                    relatedInfoSection.setVisible(true);
                }
            }

            // Configure quick view controls
            refreshQuickViewControls();

        } catch (error) {
            handleError("configureFormUI", error);
        }
    }

    /**
     * Refresh quick view controls
     */
    function refreshQuickViewControls() {
        try {
            // Refresh parent account quick view if present
            var parentQuickView = formContext.ui.quickForms.get("parentaccount_quickview");
            if (parentQuickView) {
                parentQuickView.refresh();
            }

        } catch (error) {
            handleError("refreshQuickViewControls", error);
        }
    }

    /**
     * Validate existing data on form load
     */
    function validateExistingData() {
        try {
            // Ensure contact has required information
            var lastNameField = formContext.getAttribute("lastname");
            
            if (!lastNameField.getValue()) {
                formContext.ui.setFormNotification(
                    "Last name is required",
                    "ERROR",
                    "lastname_required"
                );
            }

            // Validate contact methods
            validateContactMethods();

        } catch (error) {
            handleError("validateExistingData", error);
        }
    }

    /**
     * Apply conditional logic based on form values
     */
    function applyConditionalLogic() {
        try {
            // Example: If contact has a parent account, show account-related fields
            var parentCustomerField = formContext.getAttribute("parentcustomerid");
            if (parentCustomerField && parentCustomerField.getValue()) {
                var customerValue = parentCustomerField.getValue()[0];
                if (customerValue && customerValue.entityType === "account") {
                    // Could show account-specific fields/tabs
                    console.log("Contact has parent account");
                }
            }

            // Example: Adjust UI based on contact role
            var roleField = formContext.getAttribute("accountrolecode");
            if (roleField && roleField.getValue() === 1) {
                // Decision maker - could show additional fields
                console.log("Contact is a decision maker");
            }

        } catch (error) {
            handleError("applyConditionalLogic", error);
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
            setFieldRequirement("lastname", true);

            // Required on create
            if (isCreate) {
                // Require at least email or phone on create
                var emailField = formContext.getAttribute("emailaddress1");
                var phoneField = formContext.getAttribute("telephone1");
                
                if (!emailField.getValue() && !phoneField.getValue()) {
                    setFieldRequirement("emailaddress1", true);
                }
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
            var sections = formContext.ui.controls.get();
            sections.forEach(function (control) {
                if (control.getName() === sectionName) {
                    control.setVisible(visible);
                }
            });
        } catch (error) {
            handleError("showSection", error);
        }
    }

    /**
     * OnSave Event Handler
     * Called when the form is saved
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
            console.log("Contact form saving...");

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

            // Ensure last name is provided
            var lastName = formContext.getAttribute("lastname").getValue();
            if (!lastName) {
                formContext.ui.setFormNotification(
                    "Last name is required",
                    "ERROR",
                    "save_lastname_validation"
                );
                isValid = false;
            }

            // Ensure at least one contact method exists
            var email = formContext.getAttribute("emailaddress1").getValue();
            var businessPhone = formContext.getAttribute("telephone1").getValue();
            var mobilePhone = formContext.getAttribute("mobilephone").getValue();

            if (!email && !businessPhone && !mobilePhone) {
                formContext.ui.setFormNotification(
                    "Please provide at least one contact method (email or phone)",
                    "ERROR",
                    "save_contact_validation"
                );
                isValid = false;
            }

            // Validate email format if provided
            if (email) {
                if (!EMAIL_PATTERN.test(email)) {
                    formContext.ui.setFormNotification(
                        "Invalid email address format",
                        "ERROR",
                        "save_email_validation"
                    );
                    isValid = false;
                }
            }

            // Validate birthdate is not in the future
            var birthdate = formContext.getAttribute("birthdate").getValue();
            if (birthdate && birthdate > new Date()) {
                formContext.ui.setFormNotification(
                    "Birthdate cannot be in the future",
                    "ERROR",
                    "save_birthdate_validation"
                );
                isValid = false;
            }

            // Clear notifications if valid
            if (isValid) {
                formContext.ui.clearFormNotification("save_lastname_validation");
                formContext.ui.clearFormNotification("save_contact_validation");
                formContext.ui.clearFormNotification("save_email_validation");
                formContext.ui.clearFormNotification("save_birthdate_validation");
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

    /**
     * Validates phone number format
     * @param {string} phoneNumber - The phone number to validate
     * @returns {boolean} True if valid, false otherwise
     */
    function validatePhoneNumber(phoneNumber) {
        if (!phoneNumber) {
            return true; // Empty is valid (not required)
        }

        // Standard US phone format: (XXX) XXX-XXXX or simple digits with separators
        var phoneRegex = /^[\d\s\-\(\)\+]+$/;
        return phoneRegex.test(phoneNumber);
    }

    /**
     * Formats a raw phone number string to standard format
     * @param {string} rawPhone - Raw phone number
     * @returns {string} Formatted phone number or original if invalid
     */
    function formatPhoneNumber(rawPhone) {
        if (!rawPhone) {
            return "";
        }

        // Remove all non-digit characters
        var digits = rawPhone.replace(/\D/g, "");

        // Check if we have exactly 10 digits (US format)
        if (digits.length === 10) {
            return "(" + digits.substring(0, 3) + ") " + 
                   digits.substring(3, 6) + "-" + 
                   digits.substring(6, 10);
        }

        // If format is invalid, return original
        return rawPhone;
    }

    // Public API - expose only necessary functions
    return {
        OnLoad: onLoad,
        OnSave: onSave,
        // Expose for testing/debugging if needed
        OnEmailAddressChange: onEmailAddressChange,
        OnMobilePhoneChange: onMobilePhoneChange,
        OnBusinessPhoneChange: onBusinessPhoneChange,
        OnParentCustomerChange: onParentCustomerChange,
        OnJobTitleChange: onJobTitleChange,
        OnBirthdateChange: onBirthdateChange,
        OnDoNotEmailChange: onDoNotEmailChange,
        OnNameChange: onNameChange,
        // Validation helpers
        ValidatePhoneNumber: validatePhoneNumber,
        FormatPhoneNumber: formatPhoneNumber
    };

})();

// Event handler registration for form events
// These should be registered in the form properties in Dynamics 365

/**
 * Form OnLoad Handler
 * Register this function in form properties: AIDEVME.Contact.Form.OnLoad
 * ✅ Pass execution context as first parameter
 */

/**
 * Form OnSave Handler  
 * Register this function in form properties: AIDEVME.Contact.Form.OnSave
 * ✅ Pass execution context as first parameter
 */

/**
 * Field OnChange Handlers
 * Register these in field properties:
 * - Email: AIDEVME.Contact.Form.OnEmailAddressChange
 * - Mobile Phone: AIDEVME.Contact.Form.OnMobilePhoneChange
 * - Business Phone: AIDEVME.Contact.Form.OnBusinessPhoneChange
 * - Parent Customer: AIDEVME.Contact.Form.OnParentCustomerChange
 * - Job Title: AIDEVME.Contact.Form.OnJobTitleChange
 * - Birthdate: AIDEVME.Contact.Form.OnBirthdateChange
 * - Do Not Email: AIDEVME.Contact.Form.OnDoNotEmailChange
 * - First Name: AIDEVME.Contact.Form.OnNameChange
 * - Last Name: AIDEVME.Contact.Form.OnNameChange
 */

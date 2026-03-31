/**
 * Tests for account.form.js
 *
 * Covers:
 *  - validateBeforeSave: contact-method guard and negative-revenue guard (Priority 1)
 *  - onRevenueChange: revenue-to-rating tiers and high-value notification (Priority 1)
 *  - onAccountNameChange: special-character validation (Priority 2)
 *  - onLoad / setDefaultValues: default field values on Create (Priority 2)
 *
 * Loading strategy: the source file uses a browser-global IIFE pattern
 * (var AIDEVME = ...).  In Node/Jest the module wrapper scopes those vars
 * locally, so we use vm.runInThisContext to execute the script in the V8
 * global context — the same way a browser would load it as a <script> tag.
 */

"use strict";

const fs   = require("fs");
const path = require("path");
const vm   = require("vm");

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Creates a mock Xrm attribute with an optional initial value. */
function createMockAttribute(value) {
    return {
        getValue:          jest.fn(() => value),
        setValue:          jest.fn(),
        addOnChange:       jest.fn(),
        setRequiredLevel:  jest.fn(),
    };
}

/** Creates a mock Xrm control. */
function createMockControl() {
    return {
        setNotification:   jest.fn(),
        clearNotification: jest.fn(),
        setDisabled:       jest.fn(),
        setVisible:        jest.fn(),
    };
}

/**
 * Builds a minimal mock formContext.
 * Individual tests override getAttribute / getControl as needed.
 */
function createMockFormContext() {
    return {
        ui: {
            getFormType:          jest.fn(() => 2), // Update by default
            setFormNotification:  jest.fn(),
            clearFormNotification: jest.fn(),
            tabs: {
                get:     jest.fn(() => ({ setVisible: jest.fn() })),
                forEach: jest.fn(),
            },
            controls: {
                get: jest.fn(() => createMockControl()),
            },
            quickForms: {
                forEach: jest.fn(),
            },
        },
        data: {
            entity: {
                getId:          jest.fn(() => "{12345678-1234-1234-1234-123456789012}"),
                getEntityName:  jest.fn(() => "account"),
                attributes:     { forEach: jest.fn() },
                refresh:        jest.fn(),
            },
        },
        getAttribute: jest.fn(() => createMockAttribute(null)),
        getControl:   jest.fn(() => createMockControl()),
    };
}

// ---------------------------------------------------------------------------
// Load source into a controlled sandbox
//
// vm.createContext creates an isolated V8 context; var declarations in the
// executed script become properties of the sandbox object.  This is more
// reliable than vm.runInThisContext when Jest overrides the native global.
// ---------------------------------------------------------------------------

let sandbox;

beforeAll(() => {
    const srcPath = path.resolve(__dirname, "../forms/account.form.js");
    const code    = fs.readFileSync(srcPath, "utf8");

    sandbox = vm.createContext({
        // Minimal browser-like globals the source file may reference at
        // module evaluation time (most Xrm calls happen later, inside fns).
        console,
        setTimeout,
    });

    vm.runInContext(code, sandbox);
});

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe("AIDEVME.Account.Form", () => {

    let AccountForm;

    beforeAll(() => {
        AccountForm = sandbox.AIDEVME.Account.Form;
    });

    // -----------------------------------------------------------------------
    // Helper: call OnLoad to prime the module's private formContext
    // -----------------------------------------------------------------------
    function primeFormContext(formContext) {
        AccountForm.OnLoad({ getFormContext: jest.fn(() => formContext) });
    }

    // -----------------------------------------------------------------------
    // OnLoad — setDefaultValues (Priority 2)
    // -----------------------------------------------------------------------
    describe("OnLoad – setDefaultValues on Create", () => {

        it("should set default values for category, rating, and contact method when fields are empty", () => {
            const categoryMock      = createMockAttribute(null);
            const ratingMock        = createMockAttribute(null);
            const contactMethodMock = createMockAttribute(null);

            const formContext = createMockFormContext();
            formContext.ui.getFormType.mockReturnValue(1); // Create
            formContext.getAttribute.mockImplementation((name) => {
                if (name === "accountcategorycode")      return categoryMock;
                if (name === "accountratingcode")        return ratingMock;
                if (name === "preferredcontactmethodcode") return contactMethodMock;
                return createMockAttribute(null);
            });

            primeFormContext(formContext);

            expect(categoryMock.setValue).toHaveBeenCalledWith(1);      // Preferred Customer
            expect(ratingMock.setValue).toHaveBeenCalledWith(2);        // Default
            expect(contactMethodMock.setValue).toHaveBeenCalledWith(2); // Email
        });

        it("should NOT overwrite existing field values on Create", () => {
            const categoryMock = createMockAttribute(3); // already set

            const formContext = createMockFormContext();
            formContext.ui.getFormType.mockReturnValue(1);
            formContext.getAttribute.mockImplementation((name) => {
                if (name === "accountcategorycode") return categoryMock;
                return createMockAttribute(null);
            });

            primeFormContext(formContext);

            // setValue should not be called because getValue returns a truthy value
            expect(categoryMock.setValue).not.toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // OnSave — validateBeforeSave (Priority 1 – Critical Business Logic)
    // -----------------------------------------------------------------------
    describe("OnSave – validateBeforeSave", () => {

        let formContext;
        let mockEventArgs;

        beforeEach(() => {
            formContext    = createMockFormContext();
            mockEventArgs  = { preventDefault: jest.fn() };
        });

        function save() {
            AccountForm.OnSave({
                getFormContext: jest.fn(() => formContext),
                getEventArgs:  jest.fn(() => mockEventArgs),
            });
        }

        it("should cancel save and show ERROR notification when no contact method is provided", () => {
            formContext.getAttribute.mockImplementation((name) => {
                if (name === "telephone1")    return { getValue: jest.fn(() => null) };
                if (name === "emailaddress1") return { getValue: jest.fn(() => null) };
                if (name === "websiteurl")    return { getValue: jest.fn(() => null) };
                if (name === "revenue")       return { getValue: jest.fn(() => null) };
                return createMockAttribute(null);
            });

            save();

            expect(mockEventArgs.preventDefault).toHaveBeenCalled();
            expect(formContext.ui.setFormNotification).toHaveBeenCalledWith(
                expect.stringContaining("at least one contact method"),
                "ERROR",
                "save_validation"
            );
        });

        it("should cancel save and show ERROR notification when revenue is negative", () => {
            formContext.getAttribute.mockImplementation((name) => {
                if (name === "telephone1")    return { getValue: jest.fn(() => "555-0100") };
                if (name === "emailaddress1") return { getValue: jest.fn(() => null) };
                if (name === "websiteurl")    return { getValue: jest.fn(() => null) };
                if (name === "revenue")       return { getValue: jest.fn(() => -500) };
                return createMockAttribute(null);
            });

            save();

            expect(mockEventArgs.preventDefault).toHaveBeenCalled();
            expect(formContext.ui.setFormNotification).toHaveBeenCalledWith(
                "Revenue cannot be negative",
                "ERROR",
                "revenue_validation"
            );
        });

        it("should allow save when a phone number is provided and revenue is positive", () => {
            formContext.getAttribute.mockImplementation((name) => {
                if (name === "telephone1")    return { getValue: jest.fn(() => "555-0199") };
                if (name === "emailaddress1") return { getValue: jest.fn(() => null) };
                if (name === "websiteurl")    return { getValue: jest.fn(() => null) };
                if (name === "revenue")       return { getValue: jest.fn(() => 25000) };
                return createMockAttribute(null);
            });

            save();

            expect(mockEventArgs.preventDefault).not.toHaveBeenCalled();
        });

        it("should allow save when only email is provided (no phone or website)", () => {
            formContext.getAttribute.mockImplementation((name) => {
                if (name === "telephone1")    return { getValue: jest.fn(() => null) };
                if (name === "emailaddress1") return { getValue: jest.fn(() => "admin@contoso.com") };
                if (name === "websiteurl")    return { getValue: jest.fn(() => null) };
                if (name === "revenue")       return { getValue: jest.fn(() => null) };
                return createMockAttribute(null);
            });

            save();

            expect(mockEventArgs.preventDefault).not.toHaveBeenCalled();
        });
    });

    // -----------------------------------------------------------------------
    // OnRevenueChange — revenue-to-rating tiers (Priority 1 – Business Logic)
    // -----------------------------------------------------------------------
    describe("OnRevenueChange – revenue-to-rating mapping", () => {

        function setupRevenue(revenueValue) {
            const formContext  = createMockFormContext();
            const revenueMock  = { getValue: jest.fn(() => revenueValue) };
            const ratingMock   = createMockAttribute(null);

            formContext.getAttribute.mockImplementation((name) => {
                if (name === "revenue")          return revenueMock;
                if (name === "accountratingcode") return ratingMock;
                return createMockAttribute(null);
            });

            primeFormContext(formContext);
            return { formContext, ratingMock };
        }

        it("should set rating to Hot (1) when revenue is exactly $1,000,000", () => {
            const { ratingMock } = setupRevenue(1000000);
            AccountForm.OnRevenueChange();
            expect(ratingMock.setValue).toHaveBeenCalledWith(1);
        });

        it("should set rating to Hot (1) when revenue exceeds $1,000,000", () => {
            const { ratingMock } = setupRevenue(5000000);
            AccountForm.OnRevenueChange();
            expect(ratingMock.setValue).toHaveBeenCalledWith(1);
        });

        it("should set rating to Warm (2) when revenue is $500,000", () => {
            const { ratingMock } = setupRevenue(500000);
            AccountForm.OnRevenueChange();
            expect(ratingMock.setValue).toHaveBeenCalledWith(2);
        });

        it("should set rating to Warm (2) when revenue is between $500,000 and $999,999", () => {
            const { ratingMock } = setupRevenue(750000);
            AccountForm.OnRevenueChange();
            expect(ratingMock.setValue).toHaveBeenCalledWith(2);
        });

        it("should set rating to Cold (3) when revenue is below $500,000", () => {
            const { ratingMock } = setupRevenue(100000);
            AccountForm.OnRevenueChange();
            expect(ratingMock.setValue).toHaveBeenCalledWith(3);
        });

        it("should show high-value INFO notification when revenue >= $1,000,000", () => {
            const { formContext } = setupRevenue(2000000);
            AccountForm.OnRevenueChange();
            expect(formContext.ui.setFormNotification).toHaveBeenCalledWith(
                expect.stringContaining("high-value account"),
                "INFO",
                "highvalue_notification"
            );
        });

        it("should clear high-value notification when revenue drops below $1,000,000", () => {
            const { formContext } = setupRevenue(499999);
            AccountForm.OnRevenueChange();
            expect(formContext.ui.clearFormNotification).toHaveBeenCalledWith(
                "highvalue_notification"
            );
        });
    });

    // -----------------------------------------------------------------------
    // OnAccountNameChange — special-character validation (Priority 2)
    // -----------------------------------------------------------------------
    describe("OnAccountNameChange – name validation", () => {

        function setupName(nameValue) {
            const formContext = createMockFormContext();
            formContext.getAttribute.mockImplementation((name) => {
                if (name === "name") return { getValue: jest.fn(() => nameValue) };
                return createMockAttribute(null);
            });
            primeFormContext(formContext);
            // Clear notifications accumulated during OnLoad (validateExistingData etc.)
            // so assertions only reflect what the handler under test triggers.
            formContext.ui.setFormNotification.mockClear();
            formContext.ui.clearFormNotification.mockClear();
            return formContext;
        }

        it("should show WARNING notification when name contains a less-than sign", () => {
            const formContext = setupName("Acme<Corp");
            AccountForm.OnAccountNameChange();
            expect(formContext.ui.setFormNotification).toHaveBeenCalledWith(
                "Account name contains invalid characters",
                "WARNING",
                "accountname_warning"
            );
        });

        it("should show WARNING notification when name contains double quotes", () => {
            const formContext = setupName('Company "Name"');
            AccountForm.OnAccountNameChange();
            expect(formContext.ui.setFormNotification).toHaveBeenCalledWith(
                "Account name contains invalid characters",
                "WARNING",
                "accountname_warning"
            );
        });

        it("should show WARNING notification when name contains a single quote", () => {
            const formContext = setupName("O'Brien Ltd");
            AccountForm.OnAccountNameChange();
            expect(formContext.ui.setFormNotification).toHaveBeenCalledWith(
                "Account name contains invalid characters",
                "WARNING",
                "accountname_warning"
            );
        });

        it("should clear WARNING notification when name contains no special characters", () => {
            const formContext = setupName("Contoso Ltd");
            AccountForm.OnAccountNameChange();
            expect(formContext.ui.clearFormNotification).toHaveBeenCalledWith(
                "accountname_warning"
            );
        });

        it("should not set any notification when name is empty/null", () => {
            const formContext = setupName(null);
            AccountForm.OnAccountNameChange();
            expect(formContext.ui.setFormNotification).not.toHaveBeenCalled();
            expect(formContext.ui.clearFormNotification).not.toHaveBeenCalled();
        });
    });
});

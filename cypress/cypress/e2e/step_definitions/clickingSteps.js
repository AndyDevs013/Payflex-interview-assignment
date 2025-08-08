import { When } from '@badeball/cypress-cucumber-preprocessor';
import CustomerDashboard from '../../support/pageObjects/CustomerDashboard.js';

When("I click on the element {string}", (element) => {
    cy.getElementById(element).click();
});

When("I click on the {string} edit button", (buttonType) => {
    // Using page object to handle edit button logic
    const dashboard = new CustomerDashboard();
    dashboard.clickEditButton(buttonType);
});

When("I click on the button that reads {string}", (buttonText) => {
    const dashboard = new CustomerDashboard();
    if (buttonText !== 'Update Account') {
        throw new Error(`Unsupported button text '${buttonText}'. Add explicit handler or data-testid.`);
    }
    dashboard.clickUpdateButton();
});
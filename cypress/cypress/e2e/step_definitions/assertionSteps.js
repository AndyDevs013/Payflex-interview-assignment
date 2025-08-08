import { Then } from '@badeball/cypress-cucumber-preprocessor';

// Assertion steps (strict)

Then("The text {string} should {string}", (text, assertion) => {
    cy.contains(text).should(assertion);
});

// Assert element contains the email from env for a specific user key
Then('the element {string} should contain the email for {string}', (selector, userKey) => {
    const users = Cypress.env('users');
    if (!users) {
        throw new Error(`Missing email for userKey '${userKey}' in Cypress env 'users'.`);
    }
    const email = users[userKey].email;
    cy.get(selector).should('contain', email);
});

Then("The url should contain {string}", (url) => {
    cy.url().should('include', url);
});
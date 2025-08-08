import { Then } from '@badeball/cypress-cucumber-preprocessor';

// Assertion steps (strict)

Then("The text {string} should {string}", (text, assertion) => {
    cy.contains(text).should(assertion);
});
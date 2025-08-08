import { Given } from '@badeball/cypress-cucumber-preprocessor';

// Login steps (no session caching to avoid auth state issues)

Given('I have logged into the customer portal as a {string} user', (userType) => {
  cy.apiLogin(userType);
});

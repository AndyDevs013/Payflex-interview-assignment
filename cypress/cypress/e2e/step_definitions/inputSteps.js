import { When } from '@badeball/cypress-cucumber-preprocessor';
import CustomerDashboard from '../../support/pageObjects/CustomerDashboard.js';

// Input steps (strict - no fallbacks here)

When("I type {string} into the element {string}", (text, element) => {
    const dashboard = new CustomerDashboard();

    switch (element) {
        case 'customerNickname':
            dashboard.fillCustomerNickname(text);
            break;
        case 'customerEmail':
            dashboard.fillCustomerEmail(text);
            break;
        case 'customerPhone':
            dashboard.fillCustomerPhone(text);
            break;
        default:
            throw new Error(`Unsupported input element '${element}'. Add a handler in the page object or use a data-testid.`);
    }
});
# Payflex Cypress Tests

E2E tests with Cucumber for the Payflex customer portal.

## Quick start

```bash
npm install
# UAT environment
npx cypress open --env environment=uat
```

## Environment setup

- Copy `environments/example.cypress.env.json` to `cypress.env.json` and fill in creds.
- `cypress.env.json` is git‑ignored. Don’t commit real credentials.

Minimal example:
```json
{
  "customerPortalUrl": "",
  "identityApiUrl": "",
  "users": {
    "testUser": { "email": "you@example.com", "password": "secret" }
  }
}
```

## Available steps

### Login
```gherkin
Given I have logged into the customer portal as a "testUser" user
```

### Navigation & Clicking
```gherkin
Given I visit the "customerPortalUrl" url
When I click on the "customerName" edit button
When I click on the button that reads "Update Account"
```

### Input & Assertions
```gherkin
When I enter "John Doe" into field "firstName"
Then I should see "Success" on the page
```

## Running tests

```bash
# Interactive (UAT)
npx cypress open --env environment=uat

# Headless (UAT)
npx cypress run --env environment=uat
```

## Notes for reviewers

- **Page Objects**: We used a page object (`cypress/support/pageObjects/CustomerDashboard.js`) due to the lack of stable `data-testid` hooks. This centralises selectors so they can be swapped later.
- **Programmatic login**: Implemented via API based on a curl captured from DevTools. See `cypress/support/commands.js` → `cy.apiLogin(userType)`.
- **Reporting**: Cucumber JSON is emitted to `cypress/reports/*.cucumber`. You can add Mochawesome later if needed.

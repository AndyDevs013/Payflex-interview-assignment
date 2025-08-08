# Payflex Cypress Tests

E2E tests with Cucumber for the Payflex customer portal.

## Quick start

```bash
npx cypress install   # first time only
npm run cypress:open
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
npm run cypress:open     # Interactive mode
npm run cypress:run      # Headless mode
npm run test:chrome      # Chrome browser
npm run run:strict       # Strict selectors (default)
npm run run:loose        # Enable PO fallback selectors
```

Run only page‑object scenario(s):
```bash
npx cypress run --env tags='@page-object'
```

// Programmatic login via API
Cypress.Commands.add('apiLogin', (userType) => {
  const users = Cypress.env('users');
  if (!users) {
    throw new Error('No users configuration found in environment. Make sure cypress.env.json contains a "users" object.');
  }
  
  const user = users[userType];
  if (!user) {
    const availableUsers = Object.keys(users).join(', ');
    throw new Error(`User type '${userType}' not found in environment config. Available users: ${availableUsers}`);
  }
  
  if (!user.email || !user.password) {
    throw new Error(`User '${userType}' is missing email or password in environment config`);
  }

  const identityApiUrlRaw = Cypress.env('identityApiUrl');
  if (!identityApiUrlRaw) {
    throw new Error('Missing required env: identityApiUrl');
  }
  const identityApiUrl = String(identityApiUrlRaw).replace(/\/+$/, '');

  cy.request({
    method: 'POST',
    url: `${identityApiUrl}/v1/customer/login`,
    failOnStatusCode: false,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      username: user.email,
      password: user.password
    }
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error(`Login failed: ${response.status} ${JSON.stringify(response.body)}`);
    }
    
    // Store the entire response for later use
    cy.wrap(response.body).as('loginResponse');
    const customerPortalUrl = Cypress.env('customerPortalUrl');
    
    // Visit the portal domain first so cookie ops apply to the correct host
    // Use relative paths so baseUrl is the single source of truth
    cy.visit('/');

    // Set authentication cookies if they exist in the response (for current domain)
    if (response.headers['set-cookie']) {
      response.headers['set-cookie'].forEach(cookie => {
        const semi = cookie.indexOf(';');
        const cookieStr = semi >= 0 ? cookie.slice(0, semi) : cookie;
        const eq = cookieStr.indexOf('=');
        if (eq > 0) {
          const name = cookieStr.slice(0, eq);
          const value = cookieStr.slice(eq + 1);
          cy.setCookie(name, value);
        }
      });
    }
    
    // Set tokens in localStorage and sessionStorage (no verbose logging to avoid leaking secrets)
    cy.window().then((win) => {
      // Try different possible token field names
      const tokenFields = ['token', 'accessToken', 'access_token', 'authToken', 'jwt', 'bearerToken'];
      const refreshFields = ['refreshToken', 'refresh_token'];
      
      tokenFields.forEach(field => {
        if (response.body[field]) {
          win.localStorage.setItem(field, response.body[field]);
          win.sessionStorage.setItem(field, response.body[field]);
        }
      });
      
      refreshFields.forEach(field => {
        if (response.body[field]) {
          win.localStorage.setItem(field, response.body[field]);
          win.sessionStorage.setItem(field, response.body[field]);
        }
      });
      
      // Store user data if present
      if (response.body.user) {
        win.localStorage.setItem('user', JSON.stringify(response.body.user));
        win.sessionStorage.setItem('user', JSON.stringify(response.body.user));
      }
    });
    
    // Now navigate to the dashboard (relative to baseUrl)
    cy.visit('/customer/dashboard');
    
    return cy.wrap(response.body);
  });
});


Cypress.Commands.add('getElementById', (id) => {
  return cy.get(`#${id}`);
});
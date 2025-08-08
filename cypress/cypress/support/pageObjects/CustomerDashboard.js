class CustomerDashboard {
    elements = {
        editButtons: 'button.btn-plain.btn-edit',
        customerNicknameField: '#customerNickname',
        // Only keep selectors used by current feature flow
        // Read-only display fields
        displayedEmail: 'p.email-icon',
    }

    // Edit button mappings - encapsulated in the page object
    editButtonMap = {
        customerName: 0,
        // other buttons intentionally omitted for this assignment
    }

    clickCustomerNameEdit() {
        this.clickEditButton('customerName');
        return this;
    }

    clickEditButton(buttonType) {
        const index = this.editButtonMap[buttonType];
        if (index === undefined) {
            throw new Error(`Unknown edit button type: ${buttonType}. Available: ${Object.keys(this.editButtonMap).join(', ')}`);
        }
        cy.get(this.elements.editButtons)
            .eq(index)
            .should('be.visible')
            .and('not.be.disabled')
            .click();
        return this;
    }

    // Input field methods
    fillCustomerNickname(text) {
        cy.get(this.elements.customerNicknameField).clear().type(text);
        return this;
    }

    // Action methods
    clickUpdateButton() {
        // Prefer text until app adds data-testid for this action
        cy.contains('button', 'Update Account').click();
        return this;
    }

    verifySuccessMessage(text) {
        cy.contains(text).should('be.visible');
        return this;
    }

    // --- Display validations ---
    getDisplayedEmail() {
        return cy.get(this.elements.displayedEmail).invoke('text').then(t => t.trim());
    }

    verifyDisplayedEmailIsValid() {
        const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        cy.get(this.elements.displayedEmail)
            .invoke('text')
            .then(text => expect(text.trim()).to.match(EMAIL_RE));
        return this;
    }

    verifyDisplayedEmailMatchesUser(userKey) {
        const users = Cypress.env('users') || {};
        const email = users[userKey]?.email;
        if (!email) {
            throw new Error(`Missing email for userKey '${userKey}' in Cypress env 'users'.`);
        }
        cy.get(this.elements.displayedEmail).should('contain', email);
        return this;
    }


    // Convenience workflows
    updateCustomerNickname(newName) {
        this.clickCustomerNameEdit()
            .fillCustomerNickname(newName)
            .clickUpdateButton();
        return this;
    }

}

export default CustomerDashboard;

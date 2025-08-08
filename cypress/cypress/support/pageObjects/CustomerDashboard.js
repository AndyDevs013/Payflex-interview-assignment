class CustomerDashboard {
    elements = {
        editButtons: 'button.btn-plain.btn-edit',
        customerNicknameField: '#customerNickname',
        customerEmailField: '#customerEmail',
        customerPhoneField: '#customerPhone',
        // Read-only display fields
        displayedEmail: 'p.email-icon',
        displayedPhone: 'p.phone-icon',
        displayedAddress: 'p.location-icon',
    }

    // Edit button mappings - encapsulated in the page object
    editButtonMap = {
        customerName: 0,
        deleteAccount: 1,
        customerEmail: 2,
        customerPhone: 3
    }

    clickCustomerNameEdit() {
        this.clickEditButton('customerName');
        return this;
    }

    clickCustomerEmailEdit() {
        this.clickEditButton('customerEmail');
        return this;
    }

    clickCustomerPhoneEdit() {
        this.clickEditButton('customerPhone');
        return this;
    }

    clickDeleteAccountEdit() {
        this.clickEditButton('deleteAccount');
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

    fillCustomerEmail(text) {
        cy.get(this.elements.customerEmailField).clear().type(text);
        return this;
    }

    fillCustomerPhone(text) {
        cy.get(this.elements.customerPhoneField).clear().type(text);
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

    getDisplayedPhone() {
        return cy.get(this.elements.displayedPhone).invoke('text').then(t => t.trim());
    }

    verifyDisplayedPhoneMaskedEndsWith(last4) {
        cy.get(this.elements.displayedPhone)
            .invoke('text')
            .then(text => {
                const compact = text.replace(/\s/g, '');
                // Example: ********6789
                expect(compact).to.match(/^\*+\d{4}$/);
                if (last4) {
                    expect(compact.endsWith(String(last4))).to.eq(true);
                }
            });
        return this;
    }

    getDisplayedAddress() {
        return cy.get(this.elements.displayedAddress).invoke('text').then(t => t.trim());
    }

    verifyDisplayedAddressContains(partialAddress) {
        cy.get(this.elements.displayedAddress).should('contain', partialAddress);
        return this;
    }

    // Convenience workflows
    updateCustomerNickname(newName) {
        this.clickCustomerNameEdit()
            .fillCustomerNickname(newName)
            .clickUpdateButton();
        return this;
    }

    updateCustomerEmail(newEmail) {
        this.clickCustomerEmailEdit()
            .fillCustomerEmail(newEmail)
            .clickUpdateButton();
        return this;
    }

    updateCustomerPhone(newPhone) {
        this.clickCustomerPhoneEdit()
            .fillCustomerPhone(newPhone)
            .clickUpdateButton();
        return this;
    }
}

export default CustomerDashboard;

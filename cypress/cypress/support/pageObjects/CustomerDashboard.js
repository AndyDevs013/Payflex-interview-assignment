class CustomerDashboard {
    elements = {
        editButtons: 'button.btn-plain.btn-edit',
        customerNicknameField: '#customerNickname',
        customerEmailField: '#customerEmail',
        customerPhoneField: '#customerPhone',
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

Feature: Payflex Example Feature 
 Scenario: Verify email, phone and address on dashboard
 
  Given I have logged into the customer portal as a "testUser" user
  Then  The url should contain "customer/dashboard"

  Then the element "p.email-icon" should contain the email for "testUser"
  And  The text "Verify Email" should "be.visible"

Scenario: Update Customer Nickname

 Given I have logged into the customer portal as a "testUser" user
 Then  The url should contain "customer/dashboard"

 When  I click on the "customerName" edit button
 And   I type "Auto Test User" into the element "customerNickname"
 And   I click on the button that reads "Update Account"
 Then  The text "Successfully updated nickname" should "be.visible"



Feature: Payflex Example Feature 

Scenario: Update Customer Nickname

 Given I have logged into the customer portal as a "testUser" user
 When  I click on the "customerName" edit button
 And   I type "Auto Test User" into the element "customerNickname"
 And   I click on the button that reads "Update Account"
 Then  The text "Successfully updated nickname" should "be.visible"


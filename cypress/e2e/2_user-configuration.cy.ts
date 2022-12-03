describe("user-configuration", () => {
  it("open editor", () => {
    cy.visit("/");

    cy.testid("user-configuration/opener").click().should("have.class", "--opened");

    // initial is disabled
    cy.testid("user-configuration/dialog/submit").should("have.attr", "disabled");
    cy.testid("user-configuration/dialog/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/dialog/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/dialog/jira-token").type("token").should("have.value", "token");
    // should not be disabled when all fields are filled
    cy.testid("user-configuration/dialog/submit").should("not.have.attr", "disabled");
    cy.testid("user-configuration/dialog/submit").click();

    // closed dialog automatically and marker is hidden
    cy.testid("user-configuration/opener").should("not.have.class", "--opened");
    cy.testid("user-configuration/marker").should("not.have.class", "--showed");

    // still sync jira button is disabled
    cy.testid("sync-jira/button").should("have.attr", "disabled");
  });
});

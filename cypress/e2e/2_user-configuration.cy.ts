describe("user-configuration", () => {
  it.only("open editor and apply state", () => {
    cy.visit("/");

    cy.testid("user-configuration/opener").click();

    // initial is disabled
    cy.testid("user-configuration/dialog/submit/button").should("have.attr", "disabled");
    cy.testid("user-configuration/dialog/user-domain/input").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/dialog/email/input").type("email").should("have.value", "email");
    cy.testid("user-configuration/dialog/jira-token/input").type("token").should("have.value", "token");

    // should not be disabled when all fields are filled
    cy.testid("user-configuration/dialog/submit/button").should("not.have.attr", "disabled");
    cy.testid("user-configuration/dialog/submit/button").click();

    // closed dialog automatically and marker is hidden
    cy.testid("user-configuration/opener").should("not.have.class", "--opened");
    cy.testid("user-configuration/marker").should("not.have.class", "--showed");

    // still sync jira button is disabled
    cy.testid("sync-jira/button").should("have.attr", "disabled");
  });

  it("restore state when reopened", () => {
    cy.visit("/");

    cy.testid("user-configuration/opener").click();

    cy.testid("user-configuration/dialog/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/dialog/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/dialog/jira-token").type("token").should("have.value", "token");
    cy.testid("user-configuration/dialog/submit").click();

    cy.testid("user-configuration/opener").click();

    // all state is same on last state
    cy.testid("user-configuration/dialog/user-domain").should("have.value", "domain");
    cy.testid("user-configuration/dialog/email").should("have.value", "email");
    cy.testid("user-configuration/dialog/jira-token").should("have.value", "token");
  });
});

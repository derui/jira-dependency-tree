describe("user-configuration", () => {
  it("open editor and apply state", () => {
    cy.visit("/");

    cy.testid("user-configuration/opener").click();

    // initial is disabled
    cy.testid("user-configuration/form/submit/button").should("have.attr", "aria-disabled");
    cy.testid("user-configuration/form/user-domain/input").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email/input").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token/input").type("token").should("have.value", "token");

    // should not be disabled when all fields are filled
    cy.testid("user-configuration/form/submit/button").should("not.have.attr", "disabled");
    cy.testid("user-configuration/form/submit/button").click();

    // closed dialog automatically and marker is hidden
    cy.testid("user-configuration/opener").should("not.have.class", "--opened");
    cy.testid("user-configuration/marker").should("not.have.class", "--showed");

    // still sync jira button is disabled
    cy.testid("sync-issue-button/button").should("have.attr", "disabled");
  });

  it("restore state when reopened", () => {
    cy.visit("/");

    cy.testid("user-configuration/opener").click();

    cy.testid("user-configuration/form/user-domain/input").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email/input").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token/input").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit/button").click();

    cy.testid("user-configuration/opener").click();

    // all state is same on last state
    cy.testid("user-configuration/form/user-domain/input").should("have.value", "domain");
    cy.testid("user-configuration/form/email/input").should("have.value", "email");
    cy.testid("user-configuration/form/token/input").should("have.value", "token");
  });
});

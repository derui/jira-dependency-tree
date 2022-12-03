import { post } from "support/mocks";

describe("load issues", () => {
  beforeEach(() => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post("basic/issues"),
      "http://localhost:3000/load-project": post("basic/project"),
      "http://localhost:3000/get-suggestions": post("basic/suggestions"),
    });
  });

  it("open editor and input project key", () => {
    // open editor
    cy.testid("project-information/name").click();
    cy.testid("project-information/name-input").type("KEY");
    cy.testid("project-information/submit").click();
    cy.testid("user-configuration/opener").click();

    cy.testid("user-configuration/dialog/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/dialog/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/dialog/jira-token").type("token").should("have.value", "token");
    cy.testid("user-configuration/dialog/submit").click();

    // load project.
    cy.testid("project-information/name").should("contain", "Testing Project");
    cy.testid("project-information/marker").should("not.have.class", "--show");
    cy.testid("sync-jira/button").should("not.have.attr", "disabled");
  });
});

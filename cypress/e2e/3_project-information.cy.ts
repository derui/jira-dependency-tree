import { post } from "support/mocks";

describe("project-information", () => {
  it("do not affect name if cancel clicked", () => {
    cy.visit("/");

    // open editor
    cy.testid("project-information/name").click();
    cy.testid("project-information/nameEditor").should("have.attr", "aria-hidden", "false");

    // assert input
    cy.testid("project-information/key/input").should("have.attr", "placeholder").and("include", "Project Key");
    cy.testid("project-information/key/input").type("KEY").should("have.value", "KEY");
    cy.testid("project-information/cancel/icon").click();

    // Apply and check after.
    cy.testid("project-information/nameEditor").should("have.attr", "aria-hidden", "true");
    cy.testid("project-information/name").should("contain.text", "Click here");
    cy.testid("project-information/marker").should("be.visible");

    // sync option is disabling continue.
    cy.testid("project-sync-option-editor/opener").should("have.attr", "disabled");
  });

  it("open editor and input project key", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["basic/issues"]),
      "http://localhost:3000/load-project": post(["basic/project"]),
      "http://localhost:3000/get-suggestions": post(["basic/suggestions"]),
    });

    // Input credentials
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/form/user-domain/input").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email/input").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token/input").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit/button").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/key/input").type("KEY");
    cy.testid("project-information/submit/icon").click();

    // load project and issues
    cy.testid("project-information/name").should("contain", "Testing Project");
    cy.testid("project-information/marker").should("have.attr", "aria-hidden", "true");
    cy.testid("sync-issue-button/root").should("not.have.attr", "disabled");
    cy.testid("project-sync-option-editor/opener").should("not.have.attr", "disabled");
  });

  it("show skeleton after key inputting finished", () => {
    cy.visit("/");

    // Input credentials
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/form/user-domain/input").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email/input").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token/input").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit/button").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/key/input").type("KEY");
    cy.testid("project-information/submit/icon").click();

    // load project and issues
    cy.testid("project-information/skeleton").should("be.visible");
    cy.testid("project-information/marker").should("not.be.visible");
  });
});

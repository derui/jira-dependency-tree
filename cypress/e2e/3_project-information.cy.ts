import { post } from "support/mocks";

describe("project-information", () => {
  it("open editor and input project key", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/get-issues": post(["basic/issues"]),
      "http://localhost:3000/get-project": post(["basic/project"]),
      "http://localhost:3000/get-projects": post(["basic/projects"]),
      "http://localhost:3000/get-suggestions": post(["basic/suggestions"]),
    });

    // Input credentials
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/form/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit").click();

    // input project name
    cy.testid("project-information/top/editButton").click({ force: true });
    cy.testid("project-information/editor/suggestor/open").click();
    cy.testid("project-information/editor/suggestor/main/term").type("TES");
    cy.testid("project-information/editor/suggestor/main/suggestion").first().click();
    cy.testid("project-information/editor/submit").click();

    // load project and issues
    cy.testid("project-information/top/name").should("contain", "Testing Project");
    cy.testid("project-information/top/marker").should("have.attr", "aria-hidden", "true");
    cy.testid("sync-issue-button/root").should("not.have.attr", "disabled");
    cy.testid("project-sync-option-editor/opener").should("not.have.attr", "disabled");
  });

  it("show skeleton after key inputting finished", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/get-projects": post(["basic/projects"]),
    });

    // Input credentials
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/form/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit").click();

    // input project name
    cy.testid("project-information/top/editButton").click({ force: true });
    cy.testid("project-information/editor/suggestor/open").click();
    cy.testid("project-information/editor/suggestor/main/term").type("TES");
    cy.testid("project-information/editor/suggestor/main/suggestion").first().click();
    cy.testid("project-information/editor/submit").click();

    // load project and issues
    cy.testid("project-information/skeleton").should("be.visible");
  });
});

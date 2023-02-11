import { post } from "support/mocks";

describe("load issues", () => {
  it("do not show subtask first", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["subtask/issues"]),
      "http://localhost:3000/load-project": post(["basic/project"]),
    });

    // Input credentials
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/form/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/key").type("KEY");
    cy.testid("project-information/submit").click();

    cy.testid("sync-issue-button/root").click();

    // change suggestions with debounce
    cy.get(".graph-issue").should("exist").should("have.length", 3);
    cy.get(".graph-issue__sub-issue-notification")
      .should("be.visible")
      .should("contain.text", "have 1 sub issues")
      .should("contain.text", "have 2 sub issues");
  });

  it("expand issues in clicked", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["subtask/issues"]),
      "http://localhost:3000/load-project": post(["basic/project"]),
    });

    // Input credentials
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/form/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/key").type("KEY");
    cy.testid("project-information/submit").click();

    cy.testid("sync-issue-button/root").click();

    // display only subtasks in the issue that is clicked notification
    cy.contains("have 1 sub issues").click();

    cy.get(".graph-issue").should("be.visible").should("have.length", 1);
    cy.get('[data-issue-key="TES-6"]').should("be.visible").should("contain.text", "subtask3");
  });
});

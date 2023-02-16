import { post } from "support/mocks";

describe("issue update", () => {
  it("update issue statuses", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["update-issue/issues"]),
      "http://localhost:3000/load-project": post(["basic/project"]),
    });

    // Input credentials
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/form/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit").click();

    // input project name and sync issue
    cy.testid("project-information/name").click();
    cy.testid("project-information/form/key").type("KEY");
    cy.testid("project-information/form/submit").click();

    cy.testid("sync-issue-button/root").click();

    // assert initial tas
    cy.get(".graph-issue").should("exist").should("have.length", 2);
    cy.get(".graph-issue")
      .should("contain.text", "main task1")
      .and("contain.text", "To Do")
      .should("contain.text", "main task2")
      .and("contain.text", "To Do");

    // change issue and re-sync
    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["update-issue/changed"]),
    });
    cy.testid("sync-issue-button/root").click();

    // assert updated task
    cy.get(".graph-issue").should("exist").should("have.length", 2);
    cy.get(".graph-issue")
      .should("contain.text", "changed summary")
      .and("contain.text", "In Progress")
      .should("contain.text", "main task3")
      .and("contain.text", "To Do");
  });
});

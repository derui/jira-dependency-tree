import { post } from "support/mocks";

describe("load issues", () => {
  it("allow search issue with term", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post("basic/issues"),
      "http://localhost:3000/load-project": post("basic/project"),
      "http://localhost:3000/get-suggestions": post("basic/suggestions"),
    });

    // Input credentials
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/user-domain/input").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/email/input").type("email").should("have.value", "email");
    cy.testid("user-configuration/jira-token/input").type("token").should("have.value", "token");
    cy.testid("user-configuration/submit/button").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/input").type("KEY");
    cy.testid("project-information/submit/icon").click();

    // open and input issue searching term
    cy.testid("issue-searcher/cancel").should("not.be.visible");
    cy.testid("issue-searcher/opener").should("be.visible").click();
    cy.testid("issue-searcher/input").should("be.visible").type("task{enter}");

    // verify issues
    cy.testid("issue-searcher/issue").should("be.visible").should("have.length", 5);
  });

  it("Do cancel to close searcher", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post("basic/issues"),
      "http://localhost:3000/load-project": post("basic/project"),
      "http://localhost:3000/get-suggestions": post("basic/suggestions"),
    });

    // Input credentials
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/user-domain/input").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/email/input").type("email").should("have.value", "email");
    cy.testid("user-configuration/jira-token/input").type("token").should("have.value", "token");
    cy.testid("user-configuration/submit/button").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/input").type("KEY");
    cy.testid("project-information/submit/icon").click();

    // open and input issue searching term
    cy.testid("issue-searcher/cancel").should("not.be.visible");
    cy.testid("issue-searcher/opener").should("be.visible").click();
    cy.testid("issue-searcher/input").should("be.visible").type("task{enter}");

    // verify issues
    cy.testid("issue-searcher/cancel").click();
    cy.testid("issue-searcher/input").should("not.be.visible").should("have.value", "");
  });

  it("move point to task if result clicked", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post("basic/issues"),
      "http://localhost:3000/load-project": post("basic/project"),
      "http://localhost:3000/get-suggestions": post("basic/suggestions"),
    });

    // Input credentials
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/user-domain/input").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/email/input").type("email").should("have.value", "email");
    cy.testid("user-configuration/jira-token/input").type("token").should("have.value", "token");
    cy.testid("user-configuration/submit/button").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/input").type("KEY");
    cy.testid("project-information/submit/icon").click();

    // open and input issue searching term
    cy.testid("issue-searcher/cancel").should("not.be.visible");
    cy.testid("issue-searcher/opener").should("be.visible").click();
    cy.testid("issue-searcher/input").should("be.visible").type("task{enter}");

    // move to issue
    cy.testid("issue-searcher/issue").get('[data-key="TES-51"]').click();

    // verify
    cy.get('[data-issue-key="TES-51"]').should("be.visible");
  });
});

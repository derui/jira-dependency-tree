import { post } from "support/mocks";

describe("load issues", () => {
  it("show cycle", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["cycle/issues"]),
      "http://localhost:3000/load-project": post(["basic/project"]),
      "http://localhost:3000/get-suggestions": post(["basic/suggestions"]),
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

    // change suggestions with debounce
    cy.get(".graph-issue").should("exist").should("have.length", 3);
  });
});

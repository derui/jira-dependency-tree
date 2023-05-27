import { post } from "support/mocks";

describe("load issues", () => {
  it("show cycle", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/get-issues": post(["cycle/issues"]),
      "http://localhost:3000/get-project": post(["basic/project"]),
      "http://localhost:3000/get-suggestions": post(["basic/suggestions"]),
    });

    // Input credentials
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/form/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/form/key").type("KEY");
    cy.testid("project-information/form/submit").click();

    cy.testid("sync-issue-button/root").click();

    // change suggestions with debounce
    cy.get(".graph-issue").should("exist").should("have.length", 3);
  });

  it("show complex graph", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/get-issues": post(["cycle/complex-graph"]),
      "http://localhost:3000/get-project": post(["basic/project"]),
      "http://localhost:3000/get-suggestions": post(["basic/suggestions"]),
    });

    // Input credentials
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/form/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/form/key").type("KEY");
    cy.testid("project-information/form/submit").click();

    cy.testid("sync-issue-button/root").click();

    // change suggestions with debounce
    cy.get(".graph-issue").should("exist").should("have.length", 8);
  });

  it("remove unnecessary issues", () => {
    cy.visit("/");

    let count = 0;

    cy.mockAPI({
      "http://localhost:3000/get-issues": post(["cycle/issues", "cycle/complex-graph"], {
        "cycle/issues": async () => {
          if (count === 0) {
            count += 1;
            return true;
          }
          return false;
        },
        "cycle/complex-graph": async () => {
          return count > 0;
        },
      }),
      "http://localhost:3000/get-project": post(["basic/project"]),
      "http://localhost:3000/get-suggestions": post(["basic/suggestions"]),
    });

    // Input credentials
    cy.testid("user-configuration/opener").click();
    cy.testid("user-configuration/form/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/form/key").type("KEY");
    cy.testid("project-information/form/submit").click();

    cy.testid("sync-issue-button/root").click();

    // change suggestions with debounce
    cy.get(".graph-issue").should("exist").should("have.length", 3);

    // Check issues removed
    cy.testid("sync-issue-button/root").click();
    cy.get(".graph-issue").should("exist").should("have.length", 8);
  });
});

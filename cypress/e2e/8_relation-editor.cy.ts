import { post } from "support/mocks";

describe("edit relation of issue", () => {
  it("open panel", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["relation-editor/issues"]),
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
    cy.testid("sync-issue-button/root").click();

    // select issue
    cy.get('[data-issue-key="TES-1"]').click();

    // verify panel
    cy.testid("relation-editor/root").should("have.attr", "aria-hidden", "false").and("be.visible");
    cy.testid("relation-editor/inward-editor/issue").should("have.length", 0);
    cy.testid("relation-editor/outward-editor/issue/root").should("have.length", 1).and("contain.text", "TES-2");
  });

  it("close panel", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["relation-editor/issues"]),
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
    cy.testid("sync-issue-button/root").click();

    // select issue
    cy.get('[data-issue-key="TES-1"]').click();

    // close panel
    cy.testid("relation-editor/close/button").click();
    cy.testid("relation-editor/root").should("not.be.visible").and("have.attr", "aria-hidden", "true");
  });

  it("remove issue and check loading", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["relation-editor/issues"]),
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
    cy.testid("sync-issue-button/root").click();

    // select issue
    cy.get('[data-issue-key="TES-1"]').click();

    cy.intercept("POST", "http://localhost:3000/delete-link", { statusCode: 404 }).as("err");

    // remove issue
    cy.testid("relation-editor/outward-editor/issue/delete").click();

    // verify issue
    cy.testid("relation-editor/outward-editor/issue/root-skeleton").should("be.visible");

    cy.wait("@err").then(() => {
      // verify issue is not loading
      cy.testid("relation-editor/outward-editor/issue/root").should("have.length", 1);
    });
  });

  it("display inward and outward issues", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["relation-editor/issues"]),
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
    cy.testid("sync-issue-button/root").click();

    // select issue
    cy.get('[data-issue-key="TES-2"]').click();

    // verify
    cy.testid("relation-editor/outward-editor/issue/root").should("have.length", 1);
    cy.testid("relation-editor/inward-editor/issue/root").should("have.length", 1);
  });

  it("remove relation", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["relation-editor/issues"]),
      "http://localhost:3000/load-project": post(["basic/project"]),
      "http://localhost:3000/get-suggestions": post(["basic/suggestions"]),
      "http://localhost:3000/delete-link": post(["relation-editor/delete-link"]),
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
    cy.testid("sync-issue-button/root").click();

    // select issue
    cy.get('[data-issue-key="TES-1"]').click();

    // remove issue
    cy.testid("relation-editor/outward-editor/issue/delete").click();

    // verify issue
    cy.testid("relation-editor/outward-editor/issue/root").should("have.length", 0);
    cy.testid("relation-editor/outward-editor/issue/root-skeleton").should("have.length", 0);
  });
});

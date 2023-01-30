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
    cy.testid("user-configuration/form/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/key").type("KEY");
    cy.testid("project-information/submit").click();
    cy.testid("sync-issue-button/root").click();

    // select issue
    cy.get('[data-issue-key="TES-1"]').click();

    // verify panel
    cy.testid("relation-editor/root").should("have.attr", "aria-hidden", "false").and("be.visible");
    cy.testid("relation-editor/inward-editor/issue").should("have.length", 0);
    cy.testid("relation-editor/outward-editor/issue/root").should("have.length", 1).and("contain.text", "TES-2");

    // verify issue link focusing
    cy.get(".issue-link.z-10").should("have.length", 1);
    cy.get(".issue-link").should("have.length", 2);
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
    cy.testid("user-configuration/form/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/key").type("KEY");
    cy.testid("project-information/submit").click();
    cy.testid("sync-issue-button/root").click();

    // select issue
    cy.get('[data-issue-key="TES-1"]').click();

    // close panel
    cy.testid("relation-editor/close").click();
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
    cy.testid("user-configuration/form/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/key").type("KEY");
    cy.testid("project-information/submit").click();
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
    cy.testid("user-configuration/form/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/key").type("KEY");
    cy.testid("project-information/submit").click();
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
    cy.testid("user-configuration/form/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/key").type("KEY");
    cy.testid("project-information/submit").click();
    cy.testid("sync-issue-button/root").click();

    // select issue
    cy.get('[data-issue-key="TES-1"]').click();

    // remove issue
    cy.testid("relation-editor/outward-editor/issue/delete").click();

    // verify issue
    cy.testid("relation-editor/outward-editor/issue/root").should("have.length", 0);
    cy.testid("relation-editor/outward-editor/issue/root-skeleton").should("have.length", 0);
  });

  it("add relation from suggestion, and failed to add relation", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["relation-editor/issues"]),
      "http://localhost:3000/load-project": post(["basic/project"]),
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
    cy.testid("project-information/key").type("KEY");
    cy.testid("project-information/submit").click();
    cy.testid("sync-issue-button/root").click();

    // select issue
    cy.get('[data-issue-key="TES-1"]').click();

    // click append button and suggestion
    cy.testid("relation-editor/inward-editor/appender/add-button").should("have.text", "Add").click();
    cy.testid("relation-editor/inward-editor/appender/suggestion-list/term").should("have.value", "").type("TES");

    cy.intercept("POST", "http://localhost:3000/create-link", { statusCode: 400, delay: 500 }).as("err");

    // verify issue suggestion and create link
    cy.testid("relation-editor/inward-editor/appender/suggestion-list/suggestion")
      .should("have.length", 2)
      .and("contain.text", "TES-2")
      .and("contain.text", "TES-3")
      .first()
      .click();

    cy.testid("relation-editor/inward-editor/issue/root-skeleton").should("be.visible");

    cy.wait("@err").then(() => {
      // verify issue is not loading
      cy.testid("relation-editor/inward-editor/issue/root").should("have.length", 0);
    });
  });

  it("add relation from suggestion, and success it", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["relation-editor/no-links"]),
      "http://localhost:3000/load-project": post(["basic/project"]),
      "http://localhost:3000/get-suggestions": post(["basic/suggestions"]),
      "http://localhost:3000/create-link": post(["relation-editor/create-link"]),
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

    // select issue
    cy.get('[data-issue-key="TES-1"]').click();

    // click append button and suggestion
    cy.testid("relation-editor/inward-editor/appender/add-button").should("have.text", "Add").click();
    cy.testid("relation-editor/inward-editor/appender/suggestion-list/term").should("have.value", "").type("TES");

    // verify issue suggestion and create link
    cy.testid("relation-editor/inward-editor/appender/suggestion-list/suggestion")
      .should("have.length", 2)
      .and("contain.text", "TES-2")
      .and("contain.text", "TES-3")
      .first()
      .click();

    // success and add relation
    cy.testid("relation-editor/inward-editor/issue/root").should("have.length", 1).and("contain.text", "TES-2");
    cy.get(".issue-link").should("have.length", 1);
  });
});

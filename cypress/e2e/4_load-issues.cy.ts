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

  it("open condition editor and suggestion", () => {
    // open editor
    cy.testid("project-information/name").click();
    cy.testid("project-information/name-input").type("KEY");
    cy.testid("project-information/submit").click();
    cy.testid("user-configuration/opener").click();

    cy.testid("user-configuration/dialog/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/dialog/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/dialog/jira-token").type("token").should("have.value", "token");
    cy.testid("user-configuration/dialog/submit").click();

    // open suggestor
    cy.testid("condition-editor").click();
    cy.testid("search-condition-sprint").click();
    cy.testid("sprint-suggestor/suggestor-opener").click();
    cy.testid("sprint-suggestor/term").type("te");

    // verify suggestions
    cy.testid("suggestion")
      .should("have.length", 2)
      .should("contain.text", "TES スプリント 5")
      .should("contain.text", "TES スプリント 6");

    // change suggestions with debounce
    cy.testid("sprint-suggestor/term").clear().type("5").wait(500);
    cy.testid("suggestion").should("have.length", 1).should("contain.text", "TES スプリント 5");
  });

  it("change condition if suggestion item is selected", () => {
    // open editor
    cy.testid("project-information/name").click();
    cy.testid("project-information/name-input").type("KEY");
    cy.testid("project-information/submit").click();
    cy.testid("user-configuration/opener").click();

    cy.testid("user-configuration/dialog/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/dialog/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/dialog/jira-token").type("token").should("have.value", "token");
    cy.testid("user-configuration/dialog/submit").click();

    // open suggestor
    cy.testid("condition-editor").click();
    cy.testid("search-condition-sprint").click();
    cy.testid("sprint-suggestor/suggestor-opener").click();
    cy.testid("sprint-suggestor/term").type("te");

    // click suggenstion
    cy.testid("suggestion").contains("TES スプリント 5").click();

    // verify clicked suggestion
    cy.testid("sprint-suggestor/suggestor-opener").should("contain.text", "TES スプリント 5");

    // Click apply
    cy.testid("submit").click();

    // verify condition name
    cy.testid("condition-editor").should("contain.text", "TES スプリント 5");
  });

  it("change condition if epic edited", () => {
    // open editor
    cy.testid("project-information/name").click();
    cy.testid("project-information/name-input").type("KEY");
    cy.testid("project-information/submit").click();
    cy.testid("user-configuration/opener").click();

    cy.testid("user-configuration/dialog/user-domain").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/dialog/email").type("email").should("have.value", "email");
    cy.testid("user-configuration/dialog/jira-token").type("token").should("have.value", "token");
    cy.testid("user-configuration/dialog/submit").click();

    // enter epic
    cy.testid("condition-editor").click();
    cy.testid("search-condition-epic").click();
    cy.testid("epic-input").type("ABC-352");

    // Click apply
    cy.testid("submit").click();

    // verify condition name
    cy.testid("condition-editor").should("contain.text", "ABC-352");
  });
});

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

  it("open condition editor and suggestion", () => {
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

    // open suggestor
    cy.testid("sync-option-editor/opener").click();
    cy.testid("sync-option-editor/condition-type").select("sprint");
    cy.testid("sprint-suggestor/suggestor-opener").click();
    cy.testid("sprint-suggestor/term").type("te");

    // verify suggestions
    cy.testid("sprint-suggestor/suggestion")
      .should("have.length", 2)
      .should("contain.text", "TES スプリント 5")
      .should("contain.text", "TES スプリント 6");

    // change suggestions with debounce
    cy.testid("sprint-suggestor/term").clear().type("5").wait(500);
    cy.testid("sprint-suggestor/suggestion").should("have.length", 1).should("contain.text", "TES スプリント 5");
  });

  it("change condition if suggestion item is selected", () => {
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

    // open suggestor
    cy.testid("sync-option-editor/opener").click();
    cy.testid("sync-option-editor/condition-type").select("sprint");
    cy.testid("sprint-suggestor/suggestor-opener").click();
    cy.testid("sprint-suggestor/term").type("te");

    // click suggenstion
    cy.testid("sprint-suggestor/suggestion").contains("TES スプリント 5").click();

    // verify clicked suggestion
    cy.testid("sprint-suggestor/suggestor-opener").should("contain.text", "TES スプリント 5");

    // Click apply
    cy.testid("sync-option-editor/submit").click();

    // verify condition name
    cy.testid("sync-option-editor/opener").should("contain.text", "TES スプリント 5");
  });

  it.only("change condition if epic edited", () => {
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

    // enter epic
    cy.testid("sync-option-editor/opener").click();
    cy.testid("sync-option-editor/condition-type").select("epic");
    cy.testid("sync-option-editor/epic-input/input").type("ABC-352");

    // Click apply
    cy.testid("sync-option-editor/submit").click();

    // verify condition name
    cy.testid("sync-option-editor/opener").should("contain.text", "ABC-352");
  });
});

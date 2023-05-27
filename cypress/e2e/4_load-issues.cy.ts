import { post } from "support/mocks";

describe("load issues", () => {
  it("open condition editor and suggestion", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/get-issues": post(["basic/issues"]),
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

    // open suggestor
    cy.testid("project-sync-option-editor/opener").click();
    cy.testid("project-sync-option-editor/form/condition-type").select("sprint");
    cy.testid("project-sync-option-editor/form/open-suggestion").click();
    cy.testid("project-sync-option-editor/form/suggested-sprint/term").type("te");

    // verify suggestions
    cy.testid("project-sync-option-editor/form/suggested-sprint/suggestion")
      .should("have.length", 2)
      .should("contain.text", "TES スプリント 5")
      .should("contain.text", "TES スプリント 6");

    // change suggestions with debounce
    cy.testid("project-sync-option-editor/form/suggested-sprint/term").clear().type("5").wait(500);
    cy.testid("project-sync-option-editor/form/suggested-sprint/suggestion")
      .should("have.length", 1)
      .should("contain.text", "TES スプリント 5");
  });

  it("change condition if suggestion item is selected", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/get-issues": post(["basic/issues"]),
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

    // open suggestor
    cy.testid("project-sync-option-editor/opener").click();
    cy.testid("project-sync-option-editor/form/condition-type").select("sprint");
    cy.testid("project-sync-option-editor/form/open-suggestion").click();
    cy.testid("project-sync-option-editor/form/suggested-sprint/term").type("te");

    // click suggenstion
    cy.testid("project-sync-option-editor/form/suggested-sprint/suggestion").contains("TES スプリント 5").click();

    // verify clicked suggestion
    cy.testid("project-sync-option-editor/form/open-suggestion").should("contain.text", "TES スプリント 5");

    // Click apply
    cy.testid("project-sync-option-editor/form/submit").click();

    // verify condition name
    cy.testid("project-sync-option-editor/opener").should("contain.text", "TES スプリント 5");
  });

  it("change condition if epic edited", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/get-issues": post(["basic/issues"]),
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

    // enter epic
    cy.testid("project-sync-option-editor/opener").click();
    cy.testid("project-sync-option-editor/form/condition-type").select("epic");
    cy.testid("project-sync-option-editor/form/epic-input").type("ABC-352");

    // Click apply
    cy.testid("project-sync-option-editor/form/submit").click();

    // verify condition name
    cy.testid("project-sync-option-editor/opener").should("contain.text", "ABC-352");
  });

  it("show new suggestions if it do not find any suggestion", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/get-issues": post(["basic/issues"]),
      "http://localhost:3000/get-project": post(["basic/project"]),
      "http://localhost:3000/get-suggestions": post(["basic/suggestions", "basic/other-suggestions"], {
        "basic/suggestions": async (req) => {
          const json = await req.clone().json();
          return json.input_value === "te";
        },
        "basic/other-suggestions": async (req) => {
          const json = await req.clone().json();

          return json.input_value === "FAR";
        },
      }),
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

    // open suggestor
    cy.testid("project-sync-option-editor/opener").click();
    cy.testid("project-sync-option-editor/form/condition-type").select("sprint");
    cy.testid("project-sync-option-editor/form/open-suggestion").click();
    cy.testid("project-sync-option-editor/form/suggested-sprint/term").type("te");

    // verify suggestions
    cy.testid("project-sync-option-editor/form/suggested-sprint/suggestion")
      .should("have.length", 2)
      .and("contain.text", "TES スプリント 5")
      .and("contain.text", "TES スプリント 6");

    // change suggestions with debounce
    cy.testid("project-sync-option-editor/form/suggested-sprint/term").clear().type("FAR").wait(500);
    cy.testid("project-sync-option-editor/form/suggested-sprint/suggestion")
      .should("have.length", 2)
      .and("contain.text", "FAR 7")
      .and("contain.text", "FAR 8");

    // having old suggestion
    cy.testid("project-sync-option-editor/form/suggested-sprint/term").clear().type("5").wait(500);
    cy.testid("project-sync-option-editor/form/suggested-sprint/suggestion")
      .should("have.length", 1)
      .and("contain.text", "TES スプリント 5");
  });

  it("display the tooltip with focusing an issue", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/get-issues": post(["basic/tooltip"]),
      "http://localhost:3000/get-project": post(["basic/project"]),
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

    // display a tooltip
    cy.get('[data-issue-key="TES-1"]').should("be.visible").trigger("mouseenter");
    cy.get(".issue-summary-tooltip")
      .should("be.visible")
      .and("contain.text", "Long summary can not display in issue node");
    cy.get('[data-issue-key="TES-1"]').trigger("mouseleave");
    cy.get(".issue-summary-tooltip").should("not.be.visible");
  });

  it("do not display tooltip when an issue does not have summary", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/get-issues": post(["basic/tooltip"]),
      "http://localhost:3000/get-project": post(["basic/project"]),
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

    // display a tooltip
    cy.get('[data-issue-key="TES-2"]').should("be.visible").trigger("mouseenter");
    cy.get(".issue-summary-tooltip").should("not.be.visible");
    cy.get('[data-issue-key="TES-1"]').trigger("mouseleave");
    cy.get(".issue-summary-tooltip").should("not.be.visible");
  });
});

import { post } from "support/mocks";

describe("load issues", () => {
  it.only("open condition editor and suggestion", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["basic/issues"]),
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

    // open suggestor
    cy.testid("project-sync-option-editor/opener").click();
    cy.testid("project-sync-option-editor/form/condition-type").select("sprint");
    cy.testid("project-sync-option-editor/form/sprint/input").type("te");

    // verify suggestions
    cy.testid("project-sync-option-editor/form/suggested-sprint/suggestion")
      .should("have.length", 2)
      .should("contain.text", "TES スプリント 5")
      .should("contain.text", "TES スプリント 6");

    // change suggestions with debounce
    cy.testid("project-sync-option-editor/form/sprint/input").clear().type("5").wait(500);
    cy.testid("project-sync-option-editor/form/suggested-sprint/suggestion")
      .should("have.length", 1)
      .should("contain.text", "TES スプリント 5");
  });

  it("change condition if suggestion item is selected", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["basic/issues"]),
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

    // open suggestor
    cy.testid("project-sync-option-editor/opener").click();
    cy.testid("project-sync-option-editor/form/condition-type").select("sprint");
    cy.testid("sprint-suggestor/suggestor-opener").click();
    cy.testid("sprint-suggestor/term").type("te");

    // click suggenstion
    cy.testid("sprint-suggestor/suggestion").contains("TES スプリント 5").click();

    // verify clicked suggestion
    cy.testid("sprint-suggestor/suggestor-opener").should("contain.text", "TES スプリント 5");

    // Click apply
    cy.testid("project-sync-option-editor/submit").click();

    // verify condition name
    cy.testid("project-sync-option-editor/opener").should("contain.text", "TES スプリント 5");
  });

  it("change condition if epic edited", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["basic/issues"]),
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

    // enter epic
    cy.testid("project-sync-option-editor/opener").click();
    cy.testid("project-sync-option-editor/form/condition-type").select("epic");
    cy.testid("project-sync-option-editor/epic-input/input").type("ABC-352");

    // Click apply
    cy.testid("project-sync-option-editor/submit").click();

    // verify condition name
    cy.testid("project-sync-option-editor/opener").should("contain.text", "ABC-352");
  });

  it("show new suggestions if it do not find any suggestion", () => {
    cy.visit("/");

    cy.mockAPI({
      "http://localhost:3000/load-issues": post(["basic/issues"]),
      "http://localhost:3000/load-project": post(["basic/project"]),
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
    cy.testid("user-configuration/form/user-domain/input").type("domain").should("have.value", "domain");
    cy.testid("user-configuration/form/email/input").type("email").should("have.value", "email");
    cy.testid("user-configuration/form/token/input").type("token").should("have.value", "token");
    cy.testid("user-configuration/form/submit/button").click();

    // input project name
    cy.testid("project-information/name").click();
    cy.testid("project-information/key/input").type("KEY");
    cy.testid("project-information/submit/icon").click();

    // open suggestor
    cy.testid("project-sync-option-editor/opener").click();
    cy.testid("project-sync-option-editor/form/condition-type").select("sprint");
    cy.testid("sprint-suggestor/suggestor-opener").click();
    cy.testid("sprint-suggestor/term").type("te");

    // verify suggestions
    cy.testid("sprint-suggestor/suggestion")
      .should("have.length", 2)
      .and("contain.text", "TES スプリント 5")
      .and("contain.text", "TES スプリント 6");

    // change suggestions with debounce
    cy.testid("sprint-suggestor/term").clear().type("FAR").wait(500);
    cy.testid("sprint-suggestor/suggestion")
      .should("have.length", 2)
      .and("contain.text", "FAR 7")
      .and("contain.text", "FAR 8");

    // having old suggestion
    cy.testid("sprint-suggestor/term").clear().type("5").wait(500);
    cy.testid("sprint-suggestor/suggestion").should("have.length", 1).and("contain.text", "TES スプリント 5");
  });
});

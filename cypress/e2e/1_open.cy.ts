describe("open", () => {
  it("open and initial display", () => {
    cy.visit("/");

    cy.testid("sync-jira/button").should("have.attr", "disabled");
    cy.testid("user-configuration/opener").should("not.have.class", "opened");
    cy.testid("user-configuration/marker").should("have.attr", "data-show", "true");
    cy.testid("project-information/marker").should("have.attr", "data-show", "true");
    cy.testid("project-information/main").and("contain.text", "Click here");
    cy.testid("project-information/nameEditor").should("have.attr", "data-opened", "false");
    cy.testid("zoom-slider/current-zoom").should("contain.text", "100%");
    cy.testid("sync-option-editor/opener").should("contain.text", "Current Sprint");

    // side toolbar
    cy.testid("side-toolbar/graph-layout").should("not.have.class", "--opened");
    cy.testid("side-toolbar/horizontal").should("have.attr", "data-selected", "true");
    cy.testid("side-toolbar/vertical").should("have.attr", "data-selected", "false");
  });
});

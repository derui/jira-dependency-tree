describe("open", () => {
  it("open and initial display", () => {
    cy.visit("/");

    cy.testid("sync-issue-button/button").should("have.attr", "disabled");
    cy.testid("user-configuration/opener").should("not.have.class", "opened");
    cy.testid("user-configuration/marker").should("have.class", "--show");
    cy.testid("project-information/marker").should("have.class", "--show");
    cy.testid("project-information/main").and("contain.text", "Click here");
    cy.testid("project-information/nameEditor").should("not.have.class", "--opened");
    cy.testid("zoom-slider/current-zoom").should("contain.text", "100%");
    cy.testid("sync-option-editor/opener").should("contain.text", "Current Sprint").should("have.attr", "disabled");

    // side toolbar
    cy.testid("side-toolbar/graph-layout").should("not.have.class", "--opened");
    cy.testid("side-toolbar/horizontal").should("have.class", "--selected");
    cy.testid("side-toolbar/vertical").should("not.have.class", "--selected");
  });
});

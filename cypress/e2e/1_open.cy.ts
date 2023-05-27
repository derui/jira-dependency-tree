describe("open", () => {
  it("open and initial display", () => {
    cy.visit("/");

    cy.testid("sync-issue-button/button").should("have.attr", "disabled");
    cy.testid("user-configuration/opener").should("not.have.class", "opened");
    cy.testid("user-configuration/marker").should("have.attr", "aria-hidden", "false");
    cy.testid("project-information/top/marker").should("have.attr", "aria-hidden", "false");
    cy.testid("project-information/top/root").and("contain.text", "Select project");
    cy.testid("project-information/top/loader").should("not.exist");
    cy.testid("project-information/top/editButton").should("exist").and("not.be.visible");
    cy.testid("zoom-slider/current-zoom").should("contain.text", "100%");
    cy.testid("project-sync-option-editor/opener")
      .should("contain.text", "Current Sprint")
      .should("have.attr", "disabled");

    // side toolbar
    cy.testid("side-toolbar/graph-layouter/graph-layout").should("not.have.class", "--opened");
    cy.testid("side-toolbar/graph-layouter/horizontal-layouter").should("have.data", "active", true);
    cy.testid("side-toolbar/graph-layouter/vertical-layouter").should("have.data", "active", false);
    cy.testid("side-toolbar/graph-unroller/unroller").should("have.attr", "aria-disabled", "true");

    // searcher
    cy.testid("issue-searcher/opener").should("be.visible");
    cy.testid("issue-searcher/cancel").should("not.be.visible");
    cy.testid("issue-searcher/input").should("not.be.visible");
  });
});

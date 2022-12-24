describe("project-information", () => {
  it("do not affect name if cancel clicked", () => {
    cy.visit("/");

    // open editor
    cy.testid("project-information/name").click();
    cy.testid("project-information/nameEditor").should("have.class", "--opened");

    // assert input
    cy.testid("project-information/input").should("have.attr", "placeholder").and("include", "Project Key");
    cy.testid("project-information/input").type("KEY").should("have.value", "KEY");
    cy.testid("project-information/cancel/icon").click();

    // Apply and check after.
    cy.testid("project-information/nameEditor").should("not.have.class", "--opened");
    cy.testid("project-information/name").should("contain.text", "Click here");
    cy.testid("project-information/marker").should("have.class", "--show");
  });
});

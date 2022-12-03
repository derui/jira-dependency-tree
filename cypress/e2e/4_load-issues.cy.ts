describe("load issues", () => {
  beforeEach(() => {
    cy.mockAPI({
      "http://localhost:3000/load-issues": "basic/issues",
      "http://localhost:3000/load-project": "basic/project",
      "http://localhost:3000/load-suggestions": "basic/suggestions",
    });
  });

  it("open editor and input project key", () => {
    cy.visit("/");

    // open editor
    cy.testid("project-information/name").click();
    cy.testid("project-information/editor").should("have.class", "--show");

    // assert input
    cy.testid("project-information/name-input").should("have.attr", "placeholder").and("include", "required");
    cy.testid("project-information/name-input").type("KEY").should("have.value", "KEY");
    cy.testid("project-information/submit").click();

    // Apply and check after.
    cy.testid("project-information/editor").should("not.have.class", "--show");
    cy.testid("project-information/name").should("contain.text", "Click here");
    cy.testid("project-information/marker").should("have.class", "--show");
  });
});
